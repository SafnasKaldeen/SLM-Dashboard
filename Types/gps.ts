// types/gps.ts
export interface GPSFilters {
  quickTime: string;
  dateRange?: { from: Date; to: Date; extraDate?: Date };
  aggregation: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  selectedTboxes: string[];
  selectedScooters: string[];
  selectedBmses: string[];
  selectedBatteryTypes: string[];
}

export interface AggregatedData {
  period_start: string;
  total_distance: number;
  total_points: number;
  vehicle_count: number;
  battery_names?: string[];
}