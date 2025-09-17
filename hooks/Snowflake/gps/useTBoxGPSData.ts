import { useState, useEffect, useCallback } from 'react';

interface TBoxGPS {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  tboxId: number;
  // Optional geographical fields that might come from your data
  province?: string;
  district?: string;
  area?: string;
}

interface TBoxGPSData {
  tboxes: TBoxGPS[];
  totalTBoxes: number;
  activeTBoxes: number;
  averageLatitude: number;
  averageLongitude: number;
}

interface TBoxGPSFilters {
  quickTime: string;
  dateRange?: { from: Date; to: Date };
  selectedTboxes: number[];
  selectedProvinces: string[];
  selectedDistricts: string[];
  selectedAreas: string[];
}

interface GeographicalData {
  provinces: string[];
  districts: { [province: string]: string[] };
  areas: { [district: string]: string[] };
}

interface UseTBoxGPSDataReturn {
  data: TBoxGPSData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  availableTboxes: number[];
  loadingTboxes: boolean;
  geographicalData: GeographicalData;
  loadingGeographical: boolean;
}

// Helper function to get the default date range
const getDefaultDateRange = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  
  // Last year same month first day
  const fromDate = new Date(currentYear - 1, currentMonth, 1);
  
  // Current year previous month last day
  const toDate = new Date(currentYear, currentMonth, 0); // day 0 gives last day of previous month
  
  return { from: fromDate, to: toDate };
};

export const useTBoxGPSData = (filters: TBoxGPSFilters & { shouldFetchData?: boolean }): UseTBoxGPSDataReturn => {
  const [data, setData] = useState<TBoxGPSData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTboxes, setAvailableTboxes] = useState<number[]>([]);
  const [loadingTboxes, setLoadingTboxes] = useState(false);
  const [geographicalData, setGeographicalData] = useState<GeographicalData>({
    provinces: [],
    districts: {},
    areas: {}
  });
  const [loadingGeographical, setLoadingGeographical] = useState(false);

  const buildDateRangeCondition = useCallback((filters: TBoxGPSFilters): string => {
    let dateCondition = '';

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];
      dateCondition = ` AND DATE(MEAN_TIMESTAMP) BETWEEN '${fromDate}' AND '${toDate}'`;
    } else if (filters.quickTime !== 'custom') {
      switch (filters.quickTime) {
        case 'today':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) = CURRENT_DATE()`;
          break;
        case 'yesterday':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) = DATEADD(day, -1, CURRENT_DATE())`;
          break;
        case 'last_7_days':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) >= DATEADD(day, -7, CURRENT_DATE())`;
          break;
        case 'last_30_days':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) >= DATEADD(day, -30, CURRENT_DATE())`;
          break;
        case 'last_90_days':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) >= DATEADD(day, -90, CURRENT_DATE())`;
          break;
        case 'last_year':
          dateCondition = ` AND DATE(MEAN_TIMESTAMP) >= DATEADD(year, -1, CURRENT_DATE())`;
          break;
      }
    }

    return dateCondition;
  }, []);

  const buildGeographicalCondition = useCallback((filters: TBoxGPSFilters): string => {
    let geoCondition = '';

    // Province filter
    if (filters.selectedProvinces.length > 0) {
      const provinces = filters.selectedProvinces.map(p => `'${p}'`).join(',');
      geoCondition += ` AND PROVINCE IN (${provinces})`;
    }

    // District filter
    if (filters.selectedDistricts.length > 0) {
      const districts = filters.selectedDistricts.map(d => `'${d}'`).join(',');
      geoCondition += ` AND DISTRICT IN (${districts})`;
    }

    // Area filter
    if (filters.selectedAreas.length > 0) {
      const areas = filters.selectedAreas.map(a => `'${a}'`).join(',');
      geoCondition += ` AND AREA IN (${areas})`;
    }

    return geoCondition;
  }, []);

  const buildGPSDataQuery = useCallback((filters: TBoxGPSFilters): string => {
    let sql = `
      SELECT 
        TBOXID as tbox_id,
        CONCAT('TBox-', TBOXID) as name,
        MEAN_LAT as latitude,
        MEAN_LONG as longitude,
        MEAN_TIMESTAMP as timestamp,
        PROVINCE as province,
        DISTRICT as district,
        AREA as area
      FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED 
      WHERE 1=1
    `;

    // Add date range condition
    sql += buildDateRangeCondition(filters);

    // Add geographical conditions
    sql += buildGeographicalCondition(filters);

    // Add TBox filter ONLY if specific TBoxes are selected
    if (filters.selectedTboxes.length > 0) {
      const tboxes = filters.selectedTboxes.join(',');
      sql += ` AND TBOXID IN (${tboxes})`;
    }

    sql += ` ORDER BY TBOXID, MEAN_TIMESTAMP`;

    // Apply limit of 1000 GPS points when no specific TBoxes are selected
    // This is the key change - always apply the limit when no specific TBoxes are selected
    // if (filters.selectedTboxes.length === 0) {
      sql += ` LIMIT 1000`;
    // }

    return sql;
  }, [buildDateRangeCondition, buildGeographicalCondition]);

  const fetchGeographicalData = useCallback(async () => {
    setLoadingGeographical(true);
    
    try {
      // Fetch all combinations in a single query
      const sql = `
        SELECT DISTINCT 
          PROVINCE, 
          DISTRICT, 
          AREA 
        FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED 
        WHERE PROVINCE IS NOT NULL AND PROVINCE != ''
          AND DISTRICT IS NOT NULL AND DISTRICT != ''
          AND AREA IS NOT NULL AND AREA != ''
        ORDER BY PROVINCE, DISTRICT, AREA
      `;

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} body: ${await response.text()}`); // Log response body for debugging
      }

      const result = await response.json();
      console.log('Fetched geographical data:', result);
      if (result.error) {
        throw new Error(result.error);
      }

      // Process the combinations to build hierarchical structure
      const provinces = new Set<string>();
      const districts: { [province: string]: string[] } = {};
      const areas: { [district: string]: string[] } = {};

      result.forEach((row: any) => {
        const province = row.PROVINCE;
        const district = row.DISTRICT;
        const area = row.AREA;

        // Add province
        provinces.add(province);

        // Add district to province
        if (!districts[province]) {
          districts[province] = [];
        }
        if (!districts[province].includes(district)) {
          districts[province].push(district);
        }

        // Add area to district
        if (!areas[district]) {
          areas[district] = [];
        }
        if (!areas[district].includes(area)) {
          areas[district].push(area);
        }
      });

      // Sort arrays
      Object.keys(districts).forEach(province => {
        districts[province].sort();
      });
      
      Object.keys(areas).forEach(district => {
        areas[district].sort();
      });

      setGeographicalData({
        provinces: Array.from(provinces).sort(),
        districts,
        areas
      });

    } catch (err) {
      console.error('Error fetching geographical data:', err);
      setGeographicalData({
        provinces: [],
        districts: {},
        areas: {}
      });
    } finally {
      setLoadingGeographical(false);
    }
  }, []);

  const fetchAvailableTboxes = useCallback(async (filters: TBoxGPSFilters) => {
    setLoadingTboxes(true);
    
    try {
      let sql = `
        SELECT DISTINCT TBOXID 
        FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED 
        WHERE 1=1
      `;

      // Add date range condition to get TBoxes available for selected period
      sql += buildDateRangeCondition(filters);

      // Add geographical conditions
      sql += buildGeographicalCondition(filters);

      sql += ` ORDER BY TBOXID LIMIT 1000`;

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (response.ok) {
        const result = await response.json();

        if (!result.error && result) {
          const tboxIds = result.map((row: any) => row.TBOXID);
          setAvailableTboxes(tboxIds);
        } else {
          console.error('Error in TBox query result:', result.error);
          setAvailableTboxes([]);
        }
      } else {
        console.error('Failed to fetch available TBoxes:', response.status);
        setAvailableTboxes([]);
      }
    } catch (err) {
      console.error('Error fetching available TBoxes:', err);
      setAvailableTboxes([]);
    } finally {
      setLoadingTboxes(false);
    }
  }, [buildDateRangeCondition, buildGeographicalCondition]);

  const fetchGPSData = useCallback(async (filters: TBoxGPSFilters) => {
    setLoading(true);
    setError(null);

    try {
      const sql = buildGPSDataQuery(filters);
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      console.log('Fetching GPS data with query:', sql);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const rawData = result || [];

      const tboxes: TBoxGPS[] = rawData.map((row: any) => ({
        id: String(row.TBOX_ID),
        name: row.NAME,
        latitude: parseFloat(row.LATITUDE),
        longitude: parseFloat(row.LONGITUDE),
        timestamp: row.TIMESTAMP,
        tboxId: row.TBOX_ID,
        province: row.PROVINCE,
        district: row.DISTRICT,
        area: row.AREA,
      }));

      // Filter out invalid coordinates
      const validTboxes = tboxes.filter(t => 
        !isNaN(t.latitude) && !isNaN(t.longitude) && 
        t.latitude !== 0 && t.longitude !== 0
      );

      const totalTBoxes = validTboxes.length;
      const activeTBoxes = new Set(validTboxes.map(t => t.tboxId)).size;

      const latitudes = validTboxes.map(t => t.latitude);
      const longitudes = validTboxes.map(t => t.longitude);

      const averageLatitude =
        latitudes.length > 0
          ? latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length
          : 0;
      const averageLongitude =
        longitudes.length > 0
          ? longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length
          : 0;

      const tboxGPSData: TBoxGPSData = {
        tboxes: validTboxes,
        totalTBoxes,
        activeTBoxes,
        averageLatitude: Math.round(averageLatitude * 1e6) / 1e6,
        averageLongitude: Math.round(averageLongitude * 1e6) / 1e6,
      };

      setData(tboxGPSData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching TBox GPS data:', err);
    } finally {
      setLoading(false);
    }
  }, [buildGPSDataQuery]);

  const refetch = useCallback(() => {
    // Now allows fetching without requiring selectedTboxes
    fetchGPSData(filters);
  }, [fetchGPSData, filters]);

  // Fetch geographical data on mount
  useEffect(() => {
    fetchGeographicalData();
  }, [fetchGeographicalData]);

  // Fetch available TBoxes when filters change
  useEffect(() => {
    const hasValidDateRange = filters.dateRange?.from && filters.dateRange?.to;
    const hasQuickTime = filters.quickTime && filters.quickTime !== 'custom';

    if (hasValidDateRange || hasQuickTime) {
      fetchAvailableTboxes(filters);
    } else {
      setAvailableTboxes([]);
    }
  }, [
    filters.quickTime, 
    filters.dateRange, 
    filters.selectedProvinces,
    filters.selectedDistricts,
    filters.selectedAreas,
    fetchAvailableTboxes
  ]);

  // Fetch GPS data when shouldFetchData is true (no longer requires TBox selection)
  useEffect(() => {
    if (filters.shouldFetchData) {
      fetchGPSData(filters);
    }
  }, [filters, fetchGPSData]);

  return {
    data,
    loading,
    error,
    refetch,
    availableTboxes,
    loadingTboxes,
    geographicalData,
    loadingGeographical,
  };
};