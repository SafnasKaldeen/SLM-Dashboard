CREATE OR REPLACE PROCEDURE REPORT_DB.GPS_DASHBOARD.COVERAGE_OPTIMIZATION_STATIONS_COST_OPTIMIZED("SERVICE_RADIUS" FLOAT, "MIN_SEPARATION" FLOAT, "COVERAGE_TARGET" FLOAT, "MAX_STATIONS" NUMBER(38,0), "ZOOM_LEVEL" NUMBER(38,0), "STAGE_NAME" VARCHAR, "START_TIME" TIMESTAMP_NTZ(9), "END_TIME" TIMESTAMP_NTZ(9), "AREA" VARCHAR, "PROVINCE" VARCHAR, "DISTRICT" VARCHAR, "USE_TRAFFIC_WEIGHTING" BOOLEAN DEFAULT TRUE, "H3_RESOLUTION" NUMBER(38,0) DEFAULT 7)
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
from io import BytesIO
from scipy.spatial import cKDTree
import heapq
from snowflake.snowpark.functions import col, avg, count

def haversine_distance(lat1, lon1, lat2, lon2):
    # Haversine distance in km between two points
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1))*np.cos(np.radians(lat2))*np.sin(dlon/2)**2
    c = 2*np.arctan2(np.sqrt(a), np.sqrt(1-a))
    return R * c

def main(session, SERVICE_RADIUS, MIN_SEPARATION, COVERAGE_TARGET, MAX_STATIONS,
         ZOOM_LEVEL, STAGE_NAME, START_TIME, END_TIME, AREA, PROVINCE, DISTRICT,
         USE_TRAFFIC_WEIGHTING=True, H3_RESOLUTION=7):

    print("[INFO] Starting coverage optimization...")

    # Step 1: Filter and aggregate GPS points inside Snowflake, grouped by H3 cell
    base_df = session.table("REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED")

    if START_TIME and END_TIME:
        base_df = base_df.filter(
            (base_df["MEAN_TIMESTAMP"] >= START_TIME) &
            (base_df["MEAN_TIMESTAMP"] <= END_TIME)
        )

    # Apply location filters if provided
    if AREA and AREA != "NULL" and AREA != "CAST(NULL AS VARCHAR)":
        # Clean up the area parameter - remove quotes and split
        area_clean = AREA.strip("''")
        if "'', ''" in area_clean:
            areas = [a.strip() for a in area_clean.split("'', ''")]
        else:
            areas = [area_clean]
        base_df = base_df.filter(base_df["AREA"].isin(areas))
    
    if PROVINCE and PROVINCE != "NULL" and PROVINCE != "CAST(NULL AS VARCHAR)":
        province_clean = PROVINCE.strip("''")
        if "'', ''" in province_clean:
            provinces = [p.strip() for p in province_clean.split("'', ''")]
        else:
            provinces = [province_clean]
        base_df = base_df.filter(base_df["PROVINCE"].isin(provinces))
    
    if DISTRICT and DISTRICT != "NULL" and DISTRICT != "CAST(NULL AS VARCHAR)":
        district_clean = DISTRICT.strip("''")
        if "'', ''" in district_clean:
            districts = [d.strip() for d in district_clean.split("'', ''")]
        else:
            districts = [district_clean]
        base_df = base_df.filter(base_df["DISTRICT"].isin(districts))

    # Use H3 functions directly in SQL - create a view with H3 cells
    h3_query = f"""
    SELECT 
        MEAN_LAT,
        MEAN_LONG,
        H3_LATLNG_TO_CELL(MEAN_LAT, MEAN_LONG, {H3_RESOLUTION}) as H3_CELL
    FROM ({base_df.queries[''queries''][0]})
    """
    
    # Execute the H3 query and get results
    try:
        h3_df = session.sql(h3_query)
        
        # Aggregate points by H3 cell
        agg_df = h3_df.group_by("H3_CELL").agg(
            avg("MEAN_LAT").alias("CELL_LAT"),
            avg("MEAN_LONG").alias("CELL_LON"),
            count("*").alias("POINT_COUNT")
        )

        # Convert aggregated result to pandas dataframe (much smaller now)
        agg_pdf = agg_df.to_pandas()
        
    except Exception as e:
        print(f"[ERROR] H3 aggregation failed, falling back to simple sampling: {str(e)}")
        # Fallback: simple sampling without H3
        sample_df = base_df.sample(n=min(10000, base_df.count()))  # Limit to 10k points
        agg_pdf = sample_df.select("MEAN_LAT", "MEAN_LONG").to_pandas()
        agg_pdf.columns = ["CELL_LAT", "CELL_LON"]
        agg_pdf["POINT_COUNT"] = 1
    
    if agg_pdf.empty:
        return json.dumps({
            "message": "No GPS data found after filtering",
            "stations": [],
            "coverage_percentage": 0,
            "map_meta": {
                "center_lat": 7.8731,
                "center_lon": 80.7718,
                "zoom": ZOOM_LEVEL
            }
        })

    print(f"[INFO] Working with {len(agg_pdf)} data points")

    gps_points = agg_pdf[["CELL_LAT", "CELL_LON"]].values
    weights = agg_pdf["POINT_COUNT"].values.astype(float)

    # Step 2: If traffic weighting enabled, normalize weights 1-10
    if USE_TRAFFIC_WEIGHTING:
        weights = 1 + 9 * (weights / weights.max())
    else:
        weights = np.ones_like(weights)

    # Step 3: Build cKDTree for spatial queries (fast radius searches)
    tree = cKDTree(np.radians(gps_points))  # use radians for spherical approx

    # Convert distances to radians for queries
    service_radius_rad = SERVICE_RADIUS / 6371.0  # Earth radius in km
    min_separation_rad = MIN_SEPARATION / 6371.0

    # Step 4: Candidate points are all aggregated H3 cells
    candidates = gps_points.copy()
    candidate_weights = weights.copy()

    # Precompute coverage for all candidates (indices of gps_points within service radius)
    print("[INFO] Precomputing coverage sets for all candidates...")
    candidate_coverage = []
    for idx, candidate in enumerate(np.radians(candidates)):
        indices = tree.query_ball_point(candidate, service_radius_rad)
        candidate_coverage.append(set(indices))

    # Step 5: Greedy algorithm with priority queue for maximum uncovered weighted coverage
    selected_stations = []
    covered_points = set()
    uncovered_weight = weights.sum()

    # Priority queue stores tuples: (-gain, candidate_index)
    heap = []
    for idx, coverage_set in enumerate(candidate_coverage):
        gain = sum(weights[i] for i in coverage_set)
        heapq.heappush(heap, (-gain, idx))

    print("[INFO] Running greedy selection...")

    while len(selected_stations) < MAX_STATIONS and uncovered_weight > 0:
        if not heap:
            print("[WARN] No more candidates in heap")
            break

        neg_gain, candidate_idx = heapq.heappop(heap)
        gain = -neg_gain

        # Calculate actual gain based on uncovered points
        newly_covered = candidate_coverage[candidate_idx].difference(covered_points)
        actual_gain = sum(weights[i] for i in newly_covered)

        if actual_gain < gain * 0.95:
            # Gain decreased, reinsert with updated gain
            if actual_gain > 0:
                heapq.heappush(heap, (-actual_gain, candidate_idx))
            continue

        if actual_gain == 0:
            # No coverage improvement, skip
            continue

        # Check min separation constraint against already selected stations
        lat1, lon1 = candidates[candidate_idx]
        too_close = False
        for st in selected_stations:
            lat2, lon2 = candidates[st]
            dist = haversine_distance(lat1, lon1, lat2, lon2)
            if dist < MIN_SEPARATION:
                too_close = True
                break
        if too_close:
            continue

        # Select station
        selected_stations.append(candidate_idx)
        covered_points.update(newly_covered)
        uncovered_weight -= actual_gain

        current_coverage = 1 - (uncovered_weight / weights.sum()) if weights.sum() > 0 else 0
        print(f"[INFO] Selected station #{len(selected_stations)} at ({lat1:.5f}, {lon1:.5f}), "
              f"coverage: {current_coverage*100:.2f}%")

        if current_coverage >= COVERAGE_TARGET:
            print(f"[INFO] Coverage target {COVERAGE_TARGET*100:.2f}% reached.")
            break

    # Step 6: Build result JSON
    stations_info = [
        {
            "station_id": i+1,
            "lat": float(candidates[idx][0]),
            "lon": float(candidates[idx][1])
        }
        for i, idx in enumerate(selected_stations)
    ]

    coverage_pct = 1 - (uncovered_weight / weights.sum()) if weights.sum() > 0 else 0

    center_lat = np.mean(candidates[selected_stations, 0]) if selected_stations else np.mean(candidates[:, 0])
    center_lon = np.mean(candidates[selected_stations, 1]) if selected_stations else np.mean(candidates[:, 1])

    map_meta = {
        "center_lat": float(center_lat),
        "center_lon": float(center_lon),
        "zoom": ZOOM_LEVEL
    }

    result = {
        "message": f"Selected {len(selected_stations)} stations covering {coverage_pct*100:.2f}% of points",
        "stations": stations_info,
        "coverage_percentage": coverage_pct,
        "map_meta": map_meta,
        "parameters": {
            "service_radius_km": SERVICE_RADIUS,
            "min_separation_km": MIN_SEPARATION,
            "coverage_target": COVERAGE_TARGET,
            "max_stations": MAX_STATIONS,
            "h3_resolution": H3_RESOLUTION,
            "use_traffic_weighting": USE_TRAFFIC_WEIGHTING
        }
    }

    # Step 7: Save full result JSON to stage file
    try:
        json_str = json.dumps(result, indent=2)
        json_file = BytesIO(json_str.encode("utf-8"))

        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"coverage_opt_stations_{timestamp}.json"

        session.file.put_stream(json_file, f"{STAGE_NAME}/{filename}", overwrite=True)
        print(f"[INFO] Result saved to stage://{STAGE_NAME}/{filename}")
    except Exception as e:
        print(f"[WARN] Could not save to stage: {str(e)}")

    print(f"[INFO] Optimization complete. Selected {len(selected_stations)} stations with {coverage_pct*100:.2f}% coverage")

    return json.dumps(result)
';