import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format, subYears } from "date-fns";

interface VehicleMetadata {
  tboxes: string[];
  bmses: string[];
  batteryTypes: string[];
}

interface Filters {
  quickTime: string;
  dateRange?: { from: Date; to: Date; extraDate?: Date };
  aggregation: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  selectedTboxes: string[];
  selectedBmses: string[];
  selectedBatteryTypes: string[];
}

interface VehicleData {
  TBOXID: number | null;
  BMSID: string | null;
  GPS_DATE: string | null;
  BATTERY_TYPE_ID: string | null;
  CAPACITY: string | null;
  BATTERY_NAME: string | null;
  TOTAL_GPS_POINTS: number | null;
  DISTANCE_KM: number | null;
  [key: string]: any;
}

interface AggregatedData {
  period_start: string;
  total_distance: number;
  total_points: number;
  vehicle_count: number;
  tbox_ids?: string[];
  bms_ids?: string[];
  battery_names?: string[];
}

const useVehicleMetadata = (filters: Filters) => {
  const [allData, setAllData] = useState<VehicleData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<string[]>([]);

  useEffect(() => {
    setTableColumns([
      "TBOXID",
      "BMSID",
      "GPS_DATE",
      "BATTERY_TYPE_ID",
      "CAPACITY",
      "BATTERY_NAME",
      "TOTAL_GPS_POINTS",
      "DISTANCE_KM",
    ]);
  }, []);

  const buildDateCondition = (dateField: string, from: Date, to?: Date) => {
    if (to) {
      return `${dateField} BETWEEN '${format(from, "yyyy-MM-dd")}' AND '${format(to, "yyyy-MM-dd")}'`;
    }
    return `${dateField} >= '${format(from, "yyyy-MM-dd")}'`;
  };

  const buildAggregationQuery = (currentFilters: Filters) => {
    const { dateRange, aggregation, selectedTboxes, selectedBmses, selectedBatteryTypes } = currentFilters;

    // Map aggregation to proper DATE_TRUNC values
    const dateTrunc = aggregation === "weekly"
      ? "WEEK"
      : aggregation === "monthly"
      ? "MONTH"
      : aggregation === "quarterly"
      ? "QUARTER"
      : aggregation === "annually"
      ? "YEAR"
      : "DAY";

    // Use provided date range or default to last year
    const dateCondition = dateRange?.from
      ? buildDateCondition("GPS_DATE", dateRange.from, dateRange.to)
      : buildDateCondition("GPS_DATE", subYears(new Date(), 1));

    // Build filter conditions
    const tboxCondition = selectedTboxes.length > 0 
      ? `AND TBOXID IN (${selectedTboxes.map((id) => `'${id}'`).join(",")})` 
      : "";

    const bmsCondition = selectedBmses.length > 0 
      ? `AND BMSID IN (${selectedBmses.map((id) => `'${id}'`).join(",")})` 
      : "";

    const batteryCondition = selectedBatteryTypes.length > 0
      ? `AND BATTERY_NAME IN (${selectedBatteryTypes.map((name) => `'${name}'`).join(",")})` 
      : "";

    return `
      SELECT
        DATE_TRUNC('${dateTrunc}', GPS_DATE) AS period_start,
        SUM(DISTANCE_KM) AS total_distance,
        SUM(TOTAL_GPS_POINTS) AS total_points,
        COUNT(DISTINCT TBOXID) AS vehicle_count,
        ARRAY_AGG(DISTINCT TBOXID::TEXT) AS tbox_ids,
        ARRAY_AGG(DISTINCT BMSID) AS bms_ids,
        ARRAY_AGG(DISTINCT BATTERY_NAME) AS battery_names
      FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
      WHERE ${dateCondition}
        ${tboxCondition}
        ${bmsCondition}
        ${batteryCondition}
        AND TBOXID IS NOT NULL
        AND DISTANCE_KM > 0
        AND GPS_DATE IS NOT NULL
      GROUP BY DATE_TRUNC('${dateTrunc}', GPS_DATE)
      ORDER BY period_start DESC
    `;
  };

  const fetchAggregatedData = async (currentFilters: Filters) => {
    try {
      setLoading(true);
      const query = buildAggregationQuery(currentFilters);
      // console.log("Generated Aggregation Query:", query);
      
      const response = await axios.post("/api/snowflake/query", { query });
      const data = response.data || [];
      // console.log("Fetched Aggregated Data:", data);
      // Process the data to ensure proper formatting
      const processedData = data.map((row: any) => ({
        ...row,
        period_start: row.period_start || row.PERIOD_START,
        total_distance: parseFloat(row.total_distance || row.TOTAL_DISTANCE || 0),
        total_points: parseInt(row.total_points || row.TOTAL_POINTS || 0),
        vehicle_count: parseInt(row.vehicle_count || row.VEHICLE_COUNT || 0),
        tbox_ids: row.tbox_ids || row.TBOX_IDS || [],
        bms_ids: row.bms_ids || row.BMS_IDS || [],
        battery_names: row.battery_names || row.BATTERY_NAMES || []
      }));
      
      return processedData;
    } catch (err) {
      console.error("Failed to load aggregated data", err);
      setError(`Could not load aggregated data: ${err instanceof Error ? err.message : "Unknown error"}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get a broader sample for metadata extraction
      const query = `
        SELECT 
          TBOXID,
          BMSID,
          GPS_DATE,
          BATTERY_TYPE_ID,
          CAPACITY,
          BATTERY_NAME,
          TOTAL_GPS_POINTS,
          DISTANCE_KM
        FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
        WHERE TBOXID IS NOT NULL
          AND DISTANCE_KM > 0
          AND GPS_DATE IS NOT NULL
          AND GPS_DATE >= '${format(subYears(new Date(), 2), "yyyy-MM-dd")}'
        ORDER BY GPS_DATE DESC
        LIMIT 100000;
      `;

      // console.log("Generated Raw Data Query:", query);
      const response = await axios.post("/api/snowflake/query", { query });
      setAllData(response.data || []);
    } catch (err) {
      console.error("Failed to load vehicle data", err);
      setError(`Could not load vehicle data: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (tableColumns.length === 0) return;

    const loadData = async () => {
      // Load raw data first for metadata
      await fetchAllData();
      
      // Initial aggregation should always be monthly for the last year
      const initialFilters = {
        ...filters,
        aggregation: "monthly" as const,
        dateRange: undefined // Use default 1-year range
      };
      
      const aggregated = await fetchAggregatedData(initialFilters);
      setAggregatedData(aggregated);
    };

    loadData();
  }, [tableColumns]);

  // Reload aggregated data when filters change (but not on initial load)
  useEffect(() => {
    if (tableColumns.length > 0 && allData.length > 0) {
      // Only reload if this isn't the initial load
      // We can detect initial load by checking if we have existing aggregated data
      fetchAggregatedData(filters).then((data) => {
        // console.log("Filter change - new aggregated data:", data);
        setAggregatedData(data);
      });
    }
  }, [filters.dateRange, filters.aggregation, filters.selectedTboxes, filters.selectedBmses, filters.selectedBatteryTypes]);

  const getColumnValue = (row: VehicleData, column: keyof VehicleData): string | null => {
    const value = row[column];
    return value !== undefined && value !== null ? String(value) : null;
  };

  // Generate cascading metadata from raw data, not aggregated data
  const { cascadingMetadata } = useMemo(() => {
    if (allData.length === 0) {
      return {
        cascadingMetadata: { tboxes: [], bmses: [], batteryTypes: [] },
      };
    }

    const availableTboxes = new Set<string>();
    const availableBmses = new Set<string>();
    const availableBatteryNames = new Set<string>();

    // Use raw data for complete metadata
    allData.forEach((row) => {
      if (row.TBOXID) availableTboxes.add(row.TBOXID.toString());
      if (row.BMSID) availableBmses.add(row.BMSID);
      if (row.BATTERY_NAME) availableBatteryNames.add(row.BATTERY_NAME);
    });

    return {
      cascadingMetadata: {
        tboxes: Array.from(availableTboxes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        bmses: Array.from(availableBmses).sort(),
        batteryTypes: Array.from(availableBatteryNames).sort(),
      },
    };
  }, [allData]);

  const getDefaultDateRange = () => {
    const today = new Date();
    const from = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from, to };
  };

  return {
    tboxes: cascadingMetadata.tboxes,
    bmses: cascadingMetadata.bmses,
    batteryTypes: cascadingMetadata.batteryTypes,
    // allData,
    aggregatedData,
    loading,
    error,
    tableColumns,
    getDefaultDateRange,
    getColumnValue,
  };
};

export default useVehicleMetadata;