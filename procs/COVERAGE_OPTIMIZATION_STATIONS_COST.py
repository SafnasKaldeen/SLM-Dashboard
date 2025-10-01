CREATE OR REPLACE PROCEDURE REPORT_DB.GPS_DASHBOARD.COVERAGE_OPTIMIZATION_STATIONS_COST("SERVICE_RADIUS" FLOAT, "MIN_SEPARATION" FLOAT, "COVERAGE_TARGET" FLOAT, "MAX_STATIONS" NUMBER(38,0), "ZOOM_LEVEL" NUMBER(38,0), "STAGE_NAME" VARCHAR, "START_TIME" TIMESTAMP_NTZ(9), "END_TIME" TIMESTAMP_NTZ(9), "AREA" VARCHAR, "PROVINCE" VARCHAR, "DISTRICT" VARCHAR, "GRID_SIZE" FLOAT DEFAULT 0.02, "USE_TRAFFIC_WEIGHTING" BOOLEAN DEFAULT TRUE, "SAMPLE_SIZE" NUMBER(38,0) DEFAULT 500000, "PARTITION_COUNT" NUMBER(38,0) DEFAULT 10)
RETURNS VARCHAR
LANGUAGE PYTHON
RUNTIME_VERSION = '3.10'
PACKAGES = ('pandas','numpy','scikit-learn','snowflake-snowpark-python','numba')
HANDLER = 'main'
EXECUTE AS CALLER
AS '
import pandas as pd
import numpy as np
import json
import datetime
from sklearn.neighbors import BallTree
from numba import njit
import os

# =============================================
# 1. OPTIMIZED DISTANCE CALCULATION
# =============================================
@njit(fastmath=True, cache=True)
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = (np.sin(dlat/2)**2 +
         np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) *
         np.sin(dlon/2)**2)
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))

# =============================================
# 2. CANDIDATE GENERATION
# =============================================
def generate_candidates(gps_points: np.ndarray, grid_size: float) -> np.ndarray:
    lat_q1, lat_q3 = np.percentile(gps_points[:,0], [25, 75])
    lon_q1, lon_q3 = np.percentile(gps_points[:,1], [25, 75])
    lat_range = lat_q3 - lat_q1
    lon_range = lon_q3 - lon_q1
    lat_min = lat_q1 - 0.2*lat_range
    lat_max = lat_q3 + 0.2*lat_range
    lon_min = lon_q1 - 0.2*lon_range
    lon_max = lon_q3 + 0.2*lon_range

    lat_grid = np.arange(lat_min, lat_max, grid_size)
    lon_grid = np.arange(lon_min, lon_max, grid_size)
    grid_lats, grid_lons = np.meshgrid(lat_grid, lon_grid)
    candidates = np.column_stack((grid_lats.ravel(), grid_lons.ravel()))

    tree = BallTree(np.deg2rad(gps_points), metric="haversine")
    dists, _ = tree.query(np.deg2rad(candidates), k=1)
    valid_mask = (dists.ravel() <= (grid_size * np.pi/180 * 6371))
    return candidates[valid_mask]

# =============================================
# 3. HELPER FUNCTIONS
# =============================================
def find_best_station(points, candidates, radius, weights=None):
    if len(candidates) == 0 or len(points) == 0:
        return None, []
    tree = BallTree(np.deg2rad(points), metric="haversine")
    cover_counts = []
    for c in candidates:
        idx = tree.query_radius(np.deg2rad([c]), r=radius/6371)[0]
        if weights is not None:
            score = weights[idx].sum()
        else:
            score = len(idx)
        cover_counts.append((score, idx))
    if not cover_counts:
        return None, []
    best_idx = np.argmax([c[0] for c in cover_counts])
    return candidates[best_idx], cover_counts[best_idx][1]

def enforce_separation(candidates, selected, min_sep):
    if len(selected) == 0:
        return candidates
    sel_array = np.array(selected)
    tree = BallTree(np.deg2rad(sel_array), metric="haversine")
    mask = np.ones(len(candidates), dtype=bool)
    for i, c in enumerate(candidates):
        dist, _ = tree.query(np.deg2rad([c]), k=1)
        if dist[0][0] * 6371 < min_sep:
            mask[i] = False
    return candidates[mask]

def calculate_coverage(points, stations, radius):
    if len(stations) == 0:
        return 0
    tree = BallTree(np.deg2rad(stations), metric="haversine")
    covered = 0
    for p in points:
        dist, _ = tree.query(np.deg2rad([p]), k=1)
        if dist[0][0] * 6371 <= radius:
            covered += 1
    return covered / len(points)

# =============================================
# 4. GREEDY OPTIMIZATION
# =============================================
def optimized_greedy_cover(gps_points, service_radius, min_separation, max_stations, weights=None, batch_size=100000):
    if len(gps_points) > batch_size:
        sample_idx = np.random.choice(len(gps_points), size=batch_size, replace=False)
        points_sample = gps_points[sample_idx]
        w_sample = weights[sample_idx] if weights is not None else None
    else:
        points_sample = gps_points
        w_sample = weights

    candidates = generate_candidates(points_sample, service_radius/2)
    selected = []
    remaining_points = gps_points.copy()
    remaining_weights = weights.copy() if weights is not None else None

    while len(selected) < max_stations:
        best_station, covered_idx = find_best_station(remaining_points, candidates, service_radius, remaining_weights)
        if best_station is None:
            break
        selected.append(best_station)
        remaining_points = np.delete(remaining_points, covered_idx, axis=0)
        if remaining_weights is not None:
            remaining_weights = np.delete(remaining_weights, covered_idx)
        candidates = enforce_separation(candidates, selected, min_separation)
        if len(remaining_points) < batch_size/10:
            break
    return selected

# =============================================
# 5. MAIN PROCEDURE
# =============================================
def main(session, service_radius, min_separation, coverage_target, max_stations,
         zoom_level, stage_name, start_time, end_time, area, province, district,
         grid_size=0.02, use_traffic_weighting=True, sample_size=500000, partition_count=10):

    df = session.table("REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED")
    if start_time and end_time:
        df = df.filter((df["MEAN_TIMESTAMP"] >= start_time) & (df["MEAN_TIMESTAMP"] <= end_time))
    if area and area != "NULL":
        df = df.filter(df["AREA"].isin([a.strip("''''") for a in area.split("'''', ''''")]))
    if province and province != "NULL":
        df = df.filter(df["PROVINCE"].isin([p.strip("''''") for p in province.split("'''', ''''")]))
    if district and district != "NULL":
        df = df.filter(df["DISTRICT"].isin([d.strip("''''") for d in district.split("'''', ''''")]))

    if sample_size and df.count() > sample_size:
        df = df.sample(sample_size)

    gps_points = df.select("MEAN_LAT", "MEAN_LONG").to_pandas().to_numpy()
    if len(gps_points) == 0:
        return json.dumps({"message": "No data after filtering", "stations": []})

    weights = None
    if use_traffic_weighting:
        freq_df = df.group_by("MEAN_LAT", "MEAN_LONG").count().to_pandas()
        max_count = freq_df["COUNT"].max()
        weights = np.array([1 + 9*(c/max_count) for c in freq_df["COUNT"]])

    stations = optimized_greedy_cover(gps_points, service_radius, min_separation, max_stations, weights)
    coverage = calculate_coverage(gps_points, stations, service_radius)

    result = {
        "stations": [{"lat": float(s[0]), "lon": float(s[1])} for s in stations],
        "coverage": coverage,
        "compute_metrics": {
            "points_processed": len(gps_points),
            "execution_time": datetime.datetime.now().strftime("%H:%M:%S"),
            "warehouse": session.get_current_warehouse()
        }
    }

    tmp_path = f"/tmp/results_{datetime.datetime.now().strftime(''%Y%m%d'')}.json"
    with open(tmp_path, "w") as f:
        json.dump(result, f)

    session.file.put(tmp_path, f"@{stage_name}/results_{datetime.datetime.now().strftime(''%Y%m%d'')}.json", overwrite=True)
    return json.dumps(result)
';