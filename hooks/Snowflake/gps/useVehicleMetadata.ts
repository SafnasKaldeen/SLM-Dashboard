import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

interface CachedMetadata {
  data: VehicleData[];
  timestamp: number;
  ttl: number;
}

interface CascadingCache {
  [key: string]: {
    data: VehicleMetadata;
    timestamp: number;
    ttl: number;
  };
}

const useVehicleMetadata = (filters: Filters) => {
  // Cached data - fetched once and reused
  const [cachedRawData, setCachedRawData] = useState<VehicleData[]>([]);
  const [metadataCache, setMetadataCache] = useState<CachedMetadata | null>(null);
  const cascadingCacheRef = useRef<CascadingCache>({});

  // Fresh data - queried on filter changes
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableColumns] = useState<string[]>([
    "TBOXID", "BMSID", "GPS_DATE", "BATTERY_TYPE_ID", 
    "CAPACITY", "BATTERY_NAME", "TOTAL_GPS_POINTS", "DISTANCE_KM"
  ]);

  // Cache configuration
  const METADATA_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours
  const CASCADING_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  const MAX_CASCADING_CACHE_SIZE = 50;

  // Utility functions
  const buildDateCondition = (dateField: string, from: Date, to?: Date) => {
    if (to) {
      return `${dateField} BETWEEN '${format(from, "yyyy-MM-dd")}' AND '${format(to, "yyyy-MM-dd")}'`;
    }
    return `${dateField} >= '${format(from, "yyyy-MM-dd")}'`;
  };

  const getCascadingCacheKey = (selectedTboxes: string[], selectedBmses: string[], selectedBatteryTypes: string[]) => {
    return `${selectedTboxes.sort().join(',')}-${selectedBmses.sort().join(',')}-${selectedBatteryTypes.sort().join(',')}`;
  };

  const isCacheValid = (timestamp: number, ttl: number): boolean => {
    return Date.now() - timestamp < ttl;
  };

  // Clean up cascading cache if it gets too large
  const cleanupCascadingCache = useCallback(() => {
    const cache = cascadingCacheRef.current;
    const keys = Object.keys(cache);
    
    if (keys.length > MAX_CASCADING_CACHE_SIZE) {
      // Remove oldest entries
      const sortedEntries = keys
        .map(key => ({ key, timestamp: cache[key].timestamp }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const keysToRemove = sortedEntries.slice(0, keys.length - MAX_CASCADING_CACHE_SIZE);
      keysToRemove.forEach(({ key }) => delete cache[key]);
    }
  }, []);

  // Fetch base metadata once and cache it
  const fetchAndCacheMetadata = async (): Promise<VehicleData[]> => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have valid cached data
      if (metadataCache && isCacheValid(metadataCache.timestamp, metadataCache.ttl)) {
        console.log("Using cached metadata");
        return metadataCache.data;
      }

      console.log("Fetching fresh metadata from Snowflake");

      // Optimized query: Get only unique combinations for metadata
      const sql = `
        WITH recent_data AS (
          SELECT DISTINCT
            TBOXID,
            BMSID,
            BATTERY_NAME,
            GPS_DATE
          FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
          WHERE TBOXID IS NOT NULL
            AND DISTANCE_KM > 0
            AND GPS_DATE IS NOT NULL
            AND GPS_DATE >= '${format(subYears(new Date(), 2), "yyyy-MM-dd")}'
        )
        SELECT DISTINCT
          TBOXID,
          BMSID,
          BATTERY_NAME,
          NULL as GPS_DATE,
          NULL as BATTERY_TYPE_ID,
          NULL as CAPACITY,
          NULL as TOTAL_GPS_POINTS,
          NULL as DISTANCE_KM
        FROM recent_data
        ORDER BY TBOXID, BMSID, BATTERY_NAME;
      `;
      
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched metadata:", data?.length || 0, "unique combinations");

      // Cache the metadata
      const cacheEntry: CachedMetadata = {
        data: data || [],
        timestamp: Date.now(),
        ttl: METADATA_CACHE_TTL
      };

      setMetadataCache(cacheEntry);
      setCachedRawData(data || []);
      
      return data || [];
    } catch (err) {
      console.error("Failed to load metadata", err);
      setError(`Could not load metadata: ${err instanceof Error ? err.message : "Unknown error"}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate cascading metadata from cached data (client-side processing)
  const generateCascadingMetadata = useCallback((
    rawData: VehicleData[], 
    selectedTboxes: string[], 
    selectedBmses: string[], 
    selectedBatteryTypes: string[]
  ): VehicleMetadata => {
    
    const cacheKey = getCascadingCacheKey(selectedTboxes, selectedBmses, selectedBatteryTypes);
    
    // Check cascading cache first
    const cachedResult = cascadingCacheRef.current[cacheKey];
    if (cachedResult && isCacheValid(cachedResult.timestamp, cachedResult.ttl)) {
      console.log("Using cached cascading metadata for:", cacheKey);
      return cachedResult.data;
    }

    console.log("Generating fresh cascading metadata for:", cacheKey);

    // Apply cascading filter logic
    const availableTboxes = new Set<string>();
    const availableBmses = new Set<string>();
    const availableBatteryNames = new Set<string>();

    if (selectedTboxes.length === 0 && selectedBmses.length === 0 && selectedBatteryTypes.length === 0) {
      // No filters, show all options
      rawData.forEach((row) => {
        if (row.TBOXID) availableTboxes.add(row.TBOXID.toString());
        if (row.BMSID) availableBmses.add(row.BMSID);
        if (row.BATTERY_NAME) availableBatteryNames.add(row.BATTERY_NAME);
      });
    } else {
      // Cascading logic
      
      // For TBOX options
      let tboxFilteredData = rawData;
      if (selectedBmses.length > 0) {
        tboxFilteredData = tboxFilteredData.filter(row => 
          row.BMSID && selectedBmses.includes(row.BMSID)
        );
      }
      if (selectedBatteryTypes.length > 0) {
        tboxFilteredData = tboxFilteredData.filter(row => 
          row.BATTERY_NAME && selectedBatteryTypes.includes(row.BATTERY_NAME)
        );
      }
      tboxFilteredData.forEach(row => {
        if (row.TBOXID) availableTboxes.add(row.TBOXID.toString());
      });

      // For BMS options
      let bmsFilteredData = rawData;
      if (selectedTboxes.length > 0) {
        bmsFilteredData = bmsFilteredData.filter(row => 
          row.TBOXID && selectedTboxes.includes(row.TBOXID.toString())
        );
      }
      if (selectedBatteryTypes.length > 0) {
        bmsFilteredData = bmsFilteredData.filter(row => 
          row.BATTERY_NAME && selectedBatteryTypes.includes(row.BATTERY_NAME)
        );
      }
      bmsFilteredData.forEach(row => {
        if (row.BMSID) availableBmses.add(row.BMSID);
      });

      // For Battery Type options
      let batteryFilteredData = rawData;
      if (selectedTboxes.length > 0) {
        batteryFilteredData = batteryFilteredData.filter(row => 
          row.TBOXID && selectedTboxes.includes(row.TBOXID.toString())
        );
      }
      if (selectedBmses.length > 0) {
        batteryFilteredData = batteryFilteredData.filter(row => 
          row.BMSID && selectedBmses.includes(row.BMSID)
        );
      }
      batteryFilteredData.forEach(row => {
        if (row.BATTERY_NAME) availableBatteryNames.add(row.BATTERY_NAME);
      });
    }

    const result: VehicleMetadata = {
      tboxes: Array.from(availableTboxes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      bmses: Array.from(availableBmses).sort(),
      batteryTypes: Array.from(availableBatteryNames).sort(),
    };

    // Cache the result
    cascadingCacheRef.current[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      ttl: CASCADING_CACHE_TTL
    };

    // Cleanup cache if needed
    cleanupCascadingCache();

    return result;
  }, [cleanupCascadingCache]);

  // Fetch fresh aggregated data (always from Snowflake)
  const fetchAggregatedData = async (currentFilters: Filters): Promise<AggregatedData[]> => {
    try {
      const { dateRange, aggregation, selectedTboxes, selectedBmses, selectedBatteryTypes } = currentFilters;

      const dateTrunc = aggregation === "weekly" ? "WEEK"
        : aggregation === "monthly" ? "MONTH"
        : aggregation === "quarterly" ? "QUARTER"
        : aggregation === "annually" ? "YEAR"
        : "DAY";

      const dateCondition = dateRange?.from
        ? buildDateCondition("GPS_DATE", dateRange.from, dateRange.to)
        : buildDateCondition("GPS_DATE", subYears(new Date(), 1));

      const tboxCondition = selectedTboxes.length > 0 
        ? `AND TBOXID IN (${selectedTboxes.map((id) => `'${id}'`).join(",")})` 
        : "";

      const bmsCondition = selectedBmses.length > 0 
        ? `AND BMSID IN (${selectedBmses.map((id) => `'${id}'`).join(",")})` 
        : "";

      const batteryCondition = selectedBatteryTypes.length > 0
        ? `AND BATTERY_NAME IN (${selectedBatteryTypes.map((name) => `'${name}'`).join(",")})` 
        : "";

      const sql = `
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
      
      console.log("Fetching fresh aggregated data from Snowflake");
      
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
    }
  };

  // Initial load: Fetch and cache metadata once
  useEffect(() => {
    fetchAndCacheMetadata();
  }, []); // Only runs once

  // When filters change: Update aggregated data (always fresh) and cascading metadata (from cache)
  useEffect(() => {
    if (cachedRawData.length === 0) return;

    const updateData = async () => {
      setLoading(true);
      
      try {
        // Fetch fresh aggregated data from Snowflake
        const aggregated = await fetchAggregatedData(filters);
        setAggregatedData(aggregated);
      } finally {
        setLoading(false);
      }
    };

    updateData();
  }, [
    cachedRawData.length,
    filters.dateRange, 
    filters.aggregation, 
    filters.selectedTboxes, 
    filters.selectedBmses, 
    filters.selectedBatteryTypes
  ]);

  // Generate cascading metadata from cached data (client-side)
  const cascadingMetadata = useMemo(() => {
    if (cachedRawData.length === 0) {
      return { tboxes: [], bmses: [], batteryTypes: [] };
    }

    return generateCascadingMetadata(
      cachedRawData,
      filters.selectedTboxes,
      filters.selectedBmses,
      filters.selectedBatteryTypes
    );
  }, [
    cachedRawData,
    filters.selectedTboxes,
    filters.selectedBmses,
    filters.selectedBatteryTypes,
    generateCascadingMetadata
  ]);

  const getColumnValue = (row: VehicleData, column: keyof VehicleData): string | null => {
    const value = row[column];
    return value !== undefined && value !== null ? String(value) : null;
  };

  const getDefaultDateRange = () => {
    const today = new Date();
    const from = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from, to };
  };

  // Force refresh function (clears all caches)
  const forceRefresh = useCallback(async () => {
    console.log("Force refreshing all data");
    setMetadataCache(null);
    cascadingCacheRef.current = {};
    await fetchAndCacheMetadata();
  }, []);

  return {
    // Filter options (from cache)
    tboxes: cascadingMetadata.tboxes,
    bmses: cascadingMetadata.bmses,
    batteryTypes: cascadingMetadata.batteryTypes,
    
    // Fresh data
    aggregatedData,
    
    // State
    loading,
    error,
    tableColumns,
    
    // Utilities
    getDefaultDateRange,
    getColumnValue,
    forceRefresh,
    
    // Cache info (for debugging)
    cacheInfo: {
      metadataCached: !!metadataCache && isCacheValid(metadataCache.timestamp, metadataCache.ttl),
      cascadingCacheSize: Object.keys(cascadingCacheRef.current).length,
      lastMetadataFetch: metadataCache?.timestamp
    }
  };
};

export default useVehicleMetadata;