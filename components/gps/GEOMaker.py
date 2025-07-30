import geopandas as gpd
from shapely import make_valid

INPUT = "D:/report-app/components/gps/geojson/lka_admbnda_adm3_slsd_20220816.json"   # area-level
OUTPUT = "D:/report-app/components/gps/geojson/provinces.geojson"                    # province-level

# Load GeoJSON
gdf = gpd.read_file(INPUT)

# Fix invalid geometries
gdf["geometry"] = gdf["geometry"].apply(make_valid)

# Ensure CRS is WGS84
if gdf.crs is None:
    gdf.set_crs(epsg=4326, inplace=True)
else:
    gdf = gdf.to_crs(epsg=4326)

# Dissolve polygons by Province name
gdf_province = gdf.dissolve(by="ADM1_EN", as_index=False)

# Save to GeoJSON
gdf_province.to_file(OUTPUT, driver="GeoJSON")

print(f"✅ Provinces saved to {OUTPUT}")
