import pandas as pd

# Load CSV
df = pd.read_csv("D:/report-app/components/vehicles/vehicles_2025-08-29.csv")

# Find duplicate values
dup_vehicle_ids = df["Vehicle ID"][df["Vehicle ID"].duplicated()].unique().tolist()
dup_chassis_numbers = df["Chassis Number"][df["Chassis Number"].duplicated()].unique().tolist()

# Filter out rows containing those duplicates
filtered_df = df[
    ~df["Vehicle ID"].isin(dup_vehicle_ids) &
    ~df["Chassis Number"].isin(dup_chassis_numbers)
]

# Save cleaned dataset
filtered_df.to_csv("vehicles_no_duplicates.csv", index=False)

# Print summary
print("Duplicate Vehicle IDs removed:", len(dup_vehicle_ids))
print("Duplicate Chassis Numbers removed:", len(dup_chassis_numbers))
print("Final dataset rows:", len(filtered_df))
