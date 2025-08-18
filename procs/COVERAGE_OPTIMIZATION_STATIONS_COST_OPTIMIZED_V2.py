CREATE OR REPLACE PROCEDURE REPORT_DB.GPS_DASHBOARD.COVERAGE_OPTIMIZATION_STATIONS_COST_OPTIMIZED_V2("SERVICE_RADIUS" FLOAT, "MIN_SEPARATION" FLOAT, "COVERAGE_TARGET" FLOAT, "MAX_STATIONS" NUMBER(38,0), "ZOOM_LEVEL" NUMBER(38,0), "STAGE_NAME" VARCHAR, "START_TIME" TIMESTAMP_NTZ(9), "END_TIME" TIMESTAMP_NTZ(9), "AREA" VARCHAR, "PROVINCE" VARCHAR, "DISTRICT" VARCHAR, "USE_TRAFFIC_WEIGHTING" BOOLEAN DEFAULT TRUE, "H3_RESOLUTION" NUMBER(38,0) DEFAULT 7, "MAX_DATA_POINTS" NUMBER(38,0) DEFAULT 50000, "EARLY_TERMINATION_THRESHOLD" FLOAT DEFAULT 0.001)
RETURNS VARCHAR
LANGUAGE PYTHON
RUNTIME_VERSION = '3.10'
PACKAGES = ('pandas','numpy','scikit-learn','snowflake-snowpark-python','scipy')
HANDLER = 'main'
EXECUTE AS OWNER
AS '
import pandas as pd
import numpy as np
import json
import datetime
import time
from io import BytesIO
from scipy.spatial import cKDTree
import heapq
from collections import defaultdict

def haversine_distance_vectorized(lat1, lon1, lat2, lon2):
    """Vectorized haversine distance calculation for better performance"""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    return R * c

def adaptive_sampling(df, max_points, density_aware=True):
    """
    Adaptive sampling strategy that preserves high-density areas
    while reducing computational load
    """
    if len(df) <= max_points:
        return df
    
    print(f"[INFO] Applying adaptive sampling: {len(df)} -> {max_points}")
    
    if density_aware:
        # Use stratified sampling based on spatial density
        # Create a coarse grid for density estimation
        lat_bins = np.linspace(df[''CELL_LAT''].min(), df[''CELL_LAT''].max(), 20)
        lon_bins = np.linspace(df[''CELL_LON''].min(), df[''CELL_LON''].max(), 20)
        
        df[''lat_bin''] = np.digitize(df[''CELL_LAT''], lat_bins)
        df[''lon_bin''] = np.digitize(df[''CELL_LON''], lon_bins)
        df[''grid_cell''] = df[''lat_bin''] * 100 + df[''lon_bin'']
        
        # Sample proportionally from each grid cell based on density
        sampled_dfs = []
        total_weight = df[''POINT_COUNT''].sum()
        
        for cell in df[''grid_cell''].unique():
            cell_df = df[df[''grid_cell''] == cell]
            cell_weight = cell_df[''POINT_COUNT''].sum()
            cell_proportion = cell_weight / total_weight
            cell_sample_size = max(1, int(max_points * cell_proportion))
            
            if len(cell_df) <= cell_sample_size:
                sampled_dfs.append(cell_df)
            else:
                # Weight-based sampling within cell
                weights = cell_df[''POINT_COUNT''] / cell_df[''POINT_COUNT''].sum()
                sampled_indices = np.random.choice(
                    cell_df.index, 
                    size=cell_sample_size, 
                    replace=False, 
                    p=weights
                )
                sampled_dfs.append(cell_df.loc[sampled_indices])
        
        result_df = pd.concat(sampled_dfs, ignore_index=True)
        return result_df.drop([''lat_bin'', ''lon_bin'', ''grid_cell''], axis=1)
    else:
        # Simple weighted random sampling
        weights = df[''POINT_COUNT''] / df[''POINT_COUNT''].sum()
        sampled_indices = np.random.choice(
            df.index, 
            size=max_points, 
            replace=False, 
            p=weights
        )
        return df.loc[sampled_indices].reset_index(drop=True)

def efficient_coverage_precomputation(candidates_rad, tree, service_radius_rad, batch_size=1000):
    """
    Batch-process coverage computation to manage memory efficiently
    """
    print(f"[INFO] Computing coverage for {len(candidates_rad)} candidates in batches of {batch_size}")
    coverage_sets = []
    
    for i in range(0, len(candidates_rad), batch_size):
        batch_end = min(i + batch_size, len(candidates_rad))
        batch_candidates = candidates_rad[i:batch_end]
        
        batch_coverage = []
        for candidate in batch_candidates:
            indices = tree.query_ball_point(candidate, service_radius_rad)
            batch_coverage.append(set(indices))
        
        coverage_sets.extend(batch_coverage)
        
        if i % (batch_size * 10) == 0:
            print(f"[INFO] Processed {i}/{len(candidates_rad)} candidates")
    
    return coverage_sets

def optimized_greedy_selection(candidates, weights, candidate_coverage, 
                             service_radius, min_separation, max_stations, 
                             coverage_target, early_termination_threshold):
    """
    Optimized greedy algorithm with early termination and smart pruning
    """
    selected_stations = []
    covered_points = set()
    uncovered_weight = weights.sum()
    total_weight = weights.sum()
    
    # Priority queue with candidate gains
    heap = []
    for idx, coverage_set in enumerate(candidate_coverage):
        gain = sum(weights[i] for i in coverage_set)
        heapq.heappush(heap, (-gain, idx))
    
    print(f"[INFO] Starting greedy selection with {len(heap)} candidates")
    
    last_improvement = float(''inf'')
    iterations_without_improvement = 0
    
    while (len(selected_stations) < max_stations and 
           uncovered_weight > 0 and 
           heap):
        
        # Early termination if improvement is minimal
        current_coverage = 1 - (uncovered_weight / total_weight)
        if (len(selected_stations) > 10 and 
            last_improvement < early_termination_threshold and
            current_coverage > coverage_target * 0.9):
            print(f"[INFO] Early termination: minimal improvement ({last_improvement:.6f})")
            break
        
        # Get best candidate
        neg_gain, candidate_idx = heapq.heappop(heap)
        gain = -neg_gain
        
        # Calculate actual gain
        newly_covered = candidate_coverage[candidate_idx].difference(covered_points)
        actual_gain = sum(weights[i] for i in newly_covered)
        
        # Re-queue if gain has changed significantly
        if actual_gain < gain * 0.9 and actual_gain > 0:
            heapq.heappush(heap, (-actual_gain, candidate_idx))
            continue
        
        if actual_gain == 0:
            continue
        
        # Check separation constraint efficiently
        lat1, lon1 = candidates[candidate_idx]
        if selected_stations:
            selected_coords = candidates[selected_stations]
            distances = haversine_distance_vectorized(
                lat1, lon1, 
                selected_coords[:, 0], selected_coords[:, 1]
            )
            if np.any(distances < min_separation):
                continue
        
        # Select station
        selected_stations.append(candidate_idx)
        covered_points.update(newly_covered)
        previous_weight = uncovered_weight
        uncovered_weight -= actual_gain
        
        last_improvement = (previous_weight - uncovered_weight) / total_weight
        current_coverage = 1 - (uncovered_weight / total_weight)
        
        if len(selected_stations) % 10 == 0 or len(selected_stations) <= 10:
            print(f"[INFO] Station #{len(selected_stations)}: coverage {current_coverage*100:.2f}%, "
                  f"improvement: {last_improvement:.4f}")
        
        if current_coverage >= coverage_target:
            print(f"[INFO] Coverage target {coverage_target*100:.2f}% reached!")
            break
    
    return selected_stations, covered_points, uncovered_weight

def main(session, SERVICE_RADIUS, MIN_SEPARATION, COVERAGE_TARGET, MAX_STATIONS,
         ZOOM_LEVEL, STAGE_NAME, START_TIME, END_TIME, AREA, PROVINCE, DISTRICT,
         USE_TRAFFIC_WEIGHTING=True, H3_RESOLUTION=7, MAX_DATA_POINTS=50000,
         EARLY_TERMINATION_THRESHOLD=0.001):
    
    start_time = time.time()
    print(f"[INFO] Starting optimized coverage optimization (max points: {MAX_DATA_POINTS})")
    
    # Step 1: Efficient data filtering and aggregation
    try:
        # Build optimized query with proper filtering
        where_clauses = []
        
        if START_TIME and END_TIME:
            where_clauses.append(f"MEAN_TIMESTAMP BETWEEN ''{START_TIME}'' AND ''{END_TIME}''")
        
        # Location filters
        if AREA and AREA != "NULL" and AREA != "CAST(NULL AS VARCHAR)":
            area_clean = AREA.strip("''").replace("'', ''", "'',''")
            where_clauses.append(f"AREA IN (''{area_clean}'')")
        
        if PROVINCE and PROVINCE != "NULL" and PROVINCE != "CAST(NULL AS VARCHAR)":
            province_clean = PROVINCE.strip("''").replace("'', ''", "'',''") 
            where_clauses.append(f"PROVINCE IN (''{province_clean}'')")
        
        if DISTRICT and DISTRICT != "NULL" and DISTRICT != "CAST(NULL AS VARCHAR)":
            district_clean = DISTRICT.strip("''").replace("'', ''", "'',''")
            where_clauses.append(f"DISTRICT IN (''{district_clean}'')")
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Optimized H3 aggregation query
        h3_query = f"""
        WITH filtered_data AS (
            SELECT MEAN_LAT, MEAN_LONG
            FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED
            WHERE {where_clause}
        ),
        h3_aggregated AS (
            SELECT 
                H3_LATLNG_TO_CELL(MEAN_LAT, MEAN_LONG, {H3_RESOLUTION}) as H3_CELL,
                AVG(MEAN_LAT) as CELL_LAT,
                AVG(MEAN_LONG) as CELL_LON,
                COUNT(*) as POINT_COUNT
            FROM filtered_data
            GROUP BY H3_CELL
        )
        SELECT CELL_LAT, CELL_LON, POINT_COUNT
        FROM h3_aggregated
        ORDER BY POINT_COUNT DESC
        LIMIT {min(MAX_DATA_POINTS * 2, 100000)}
        """
        
        print("[INFO] Executing optimized H3 aggregation query")
        agg_df = session.sql(h3_query)
        agg_pdf = agg_df.to_pandas()
        
    except Exception as e:
        print(f"[ERROR] H3 query failed: {str(e)}, using fallback")
        # Fallback to simple sampling
        simple_query = f"""
        SELECT MEAN_LAT as CELL_LAT, MEAN_LONG as CELL_LON, 1 as POINT_COUNT
        FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED
        WHERE {where_clause}
        ORDER BY RANDOM()
        LIMIT {MAX_DATA_POINTS}
        """
        agg_df = session.sql(simple_query)
        agg_pdf = agg_df.to_pandas()
    
    if agg_pdf.empty:
        return json.dumps({
            "message": "No GPS data found after filtering",
            "stations": [],
            "coverage_percentage": 0,
            "map_meta": {"center_lat": 7.8731, "center_lon": 80.7718, "zoom": ZOOM_LEVEL}
        })
    
    print(f"[INFO] Retrieved {len(agg_pdf)} aggregated data points")
    
    # Step 2: Adaptive sampling for scalability
    if len(agg_pdf) > MAX_DATA_POINTS:
        agg_pdf = adaptive_sampling(agg_pdf, MAX_DATA_POINTS)
    
    gps_points = agg_pdf[["CELL_LAT", "CELL_LON"]].values
    weights = agg_pdf["POINT_COUNT"].values.astype(float)
    
    # Step 3: Traffic weighting
    if USE_TRAFFIC_WEIGHTING:
        weights = 1 + 9 * (weights / weights.max())
    else:
        weights = np.ones_like(weights)
    
    print(f"[INFO] Processing {len(gps_points)} points with total weight {weights.sum():.0f}")
    
    # Step 4: Efficient spatial indexing
    tree = cKDTree(np.radians(gps_points))
    service_radius_rad = SERVICE_RADIUS / 6371.0
    candidates = gps_points.copy()
    candidates_rad = np.radians(candidates)
    
    # Step 5: Batch coverage computation
    candidate_coverage = efficient_coverage_precomputation(
        candidates_rad, tree, service_radius_rad, batch_size=min(1000, len(candidates) // 10)
    )
    
    print(f"[INFO] Coverage computation completed in {time.time() - start_time:.2f}s")
    
    # Step 6: Optimized greedy selection
    selection_start = time.time()
    selected_stations, covered_points, uncovered_weight = optimized_greedy_selection(
        candidates, weights, candidate_coverage, 
        SERVICE_RADIUS, MIN_SEPARATION, MAX_STATIONS, 
        COVERAGE_TARGET, EARLY_TERMINATION_THRESHOLD
    )
    
    print(f"[INFO] Station selection completed in {time.time() - selection_start:.2f}s")
    
    # Step 7: Build optimized result
    stations_info = [
        {
            "station_id": i + 1,
            "lat": float(candidates[idx][0]),
            "lon": float(candidates[idx][1])
        }
        for i, idx in enumerate(selected_stations)
    ]
    
    coverage_pct = 1 - (uncovered_weight / weights.sum()) if weights.sum() > 0 else 0
    
    # Calculate center efficiently
    if selected_stations:
        station_coords = candidates[selected_stations]
        center_lat = float(np.mean(station_coords[:, 0]))
        center_lon = float(np.mean(station_coords[:, 1]))
    else:
        center_lat = float(np.mean(candidates[:, 0]))
        center_lon = float(np.mean(candidates[:, 1]))
    
    total_time = time.time() - start_time
    
    result = {
        "message": f"Optimally selected {len(selected_stations)} stations covering {coverage_pct*100:.2f}% of traffic in {total_time:.1f}s",
        "stations": stations_info,
        "coverage_percentage": coverage_pct,
        "map_meta": {
            "center_lat": center_lat,
            "center_lon": center_lon,
            "zoom": ZOOM_LEVEL
        },
        "optimization_stats": {
            "total_processing_time_seconds": round(total_time, 2),
            "data_points_processed": len(gps_points),
            "h3_resolution": H3_RESOLUTION,
            "stations_selected": len(selected_stations),
            "coverage_achieved": round(coverage_pct * 100, 2)
        },
        "parameters": {
            "service_radius_km": SERVICE_RADIUS,
            "min_separation_km": MIN_SEPARATION,
            "coverage_target": COVERAGE_TARGET,
            "max_stations": MAX_STATIONS,
            "use_traffic_weighting": USE_TRAFFIC_WEIGHTING,
            "early_termination_threshold": EARLY_TERMINATION_THRESHOLD
        }
    }
    
    # Step 8: Efficient result storage
    try:
        json_str = json.dumps(result, separators=('','', '':''))  # Compact JSON
        json_file = BytesIO(json_str.encode("utf-8"))
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"stations_opt_{len(selected_stations)}_{timestamp}.json"
        session.file.put_stream(json_file, f"{STAGE_NAME}/{filename}", overwrite=True)
        print(f"[INFO] Results saved to {STAGE_NAME}/{filename}")
    except Exception as e:
        print(f"[WARN] Could not save to stage: {str(e)}")
    
    print(f"[INFO] Total optimization time: {total_time:.2f}s, "
          f"Stations: {len(selected_stations)}, Coverage: {coverage_pct*100:.2f}%")
    
    return json.dumps(result)
';