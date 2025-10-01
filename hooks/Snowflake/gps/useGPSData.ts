// hooks/useGPSData.ts
import { sq } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

export interface GPSStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area?: string;
  district?: string;
  province?: string;
  mean_timestamp?: string;
  tboxid?: string;
  [key: string]: any;
}

export interface GPSAggregatedData {
  region_name: string;
  region_type: 'area' | 'district' | 'province';
  point_count: number;
  avg_latitude: number;
  avg_longitude: number;
  unique_stations?: number;
  latest_timestamp?: string;
  earliest_timestamp?: string;
  [key: string]: any;
}

export interface GPSData {
  aggregatedData?: GPSAggregatedData[];
  totalRegions: number;
  totalPoints: number;
  activeStations: number;
  stations?: GPSStation[];
}

export interface GPSFilters {
  quickTime: string;
  dateRange?: { from: Date; to: Date };
  aggregation: string;
  selectedAreas: string[];
  selectedDistricts: string[];
  selectedProvinces: string[];
  selectedTboxes: number[];
  adminLevel: 'area' | 'district' | 'province';
  includePoints?: boolean;
}

interface UseGPSDataReturn {
  data: GPSData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchPoints: () => Promise<GPSStation[]>;
  pointsLoading: boolean;
  pointsError: string | null;
  availableAreas: string[];
  availableDistricts: string[];
  availableProvinces: string[];
  filtersLoading: boolean;
}

export const useGPSData = (filters: GPSFilters): UseGPSDataReturn => {
  const [data, setData] = useState<GPSData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsLoading, setPointsLoading] = useState<boolean>(false);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState<boolean>(false);

  // Helper function to build WHERE conditions
  const buildWhereConditions = useCallback((filters: GPSFilters): string[] => {
    const conditions: string[] = [];

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];
      conditions.push(`DATE(MEAN_TIMESTAMP) BETWEEN '${fromDate}' AND '${toDate}'`);
    }

    // Geographic filters
    if (filters.selectedProvinces.length > 0) {
      const provinces = filters.selectedProvinces.map(province => `'${province}'`).join(', ');
      conditions.push(`PROVINCE IN (${provinces})`);
    }

    if (filters.selectedDistricts.length > 0) {
      const districts = filters.selectedDistricts.map(district => `'${district}'`).join(', ');
      conditions.push(`DISTRICT IN (${districts})`);
    }

    if (filters.selectedAreas.length > 0) {
      const areas = filters.selectedAreas.map(area => `'${area}'`).join(', ');
      conditions.push(`AREA IN (${areas})`);
    }

    // TBOX filters
    if (filters.selectedTboxes.length > 0) {
      const tboxes = filters.selectedTboxes.join(', ');
      conditions.push(`TBOXID IN (${tboxes})`);
    }

    // Data quality filters
    conditions.push(`MEAN_LAT IS NOT NULL AND MEAN_LONG IS NOT NULL`);
    conditions.push(`MEAN_LAT BETWEEN -90 AND 90`);
    conditions.push(`MEAN_LONG BETWEEN -180 AND 180`);
    conditions.push(`(MEAN_LAT != 0 OR MEAN_LONG != 0)`);

    return conditions;
  }, []);

  const generateAggregatedQuery = useCallback((filters: GPSFilters): string => {
    const adminLevelMap = {
      'area': 'AREA',
      'district': 'DISTRICT', 
      'province': 'PROVINCE'
    };
    
    const regionField = adminLevelMap[filters.adminLevel];
    const conditions = buildWhereConditions(filters);

    // Build the filtered subquery first
    let subquery = `
      SELECT 
        ${regionField},
        MEAN_LAT,
        MEAN_LONG,
        TBOXID,
        MEAN_TIMESTAMP
      FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED
    `;

    if (conditions.length > 0) {
      subquery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Now aggregate from the filtered subquery
    const aggregatedQuery = `
      SELECT 
        ${regionField} as region_name,
        '${filters.adminLevel}' as region_type,
        COUNT(*) as point_count,
        AVG(MEAN_LAT) as avg_latitude,
        AVG(MEAN_LONG) as avg_longitude,
        COUNT(DISTINCT TBOXID) as unique_stations,
        MAX(MEAN_TIMESTAMP) as latest_timestamp,
        MIN(MEAN_TIMESTAMP) as earliest_timestamp
      FROM (${subquery}) filtered_data
      WHERE ${regionField} IS NOT NULL
      GROUP BY ${regionField}
      HAVING point_count > 0
      ORDER BY point_count DESC
    `;

    return aggregatedQuery;
  }, [buildWhereConditions]);

  const generatePointsQuery = useCallback((filters: GPSFilters): string => {
    const conditions = buildWhereConditions(filters);

    let baseQuery = `
      SELECT 
        TBOXID as tboxid,
        MEAN_LAT as latitude,
        MEAN_LONG as longitude,
        MEAN_TIMESTAMP as mean_timestamp,
        PROVINCE as province,
        DISTRICT as district,
        AREA as area
      FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED
    `;

    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    baseQuery += ` ORDER BY MEAN_TIMESTAMP DESC`;

    return baseQuery;
  }, [buildWhereConditions]);

  const fetchFilterOptions = useCallback(async () => {
    setFiltersLoading(true);
    try {
      // Use subquery for filter options as well to ensure consistency
      const sql = `
        SELECT DISTINCT 
          PROVINCE as province,
          DISTRICT as district,
          AREA as area
        FROM (
          SELECT PROVINCE, DISTRICT, AREA
          FROM REPORT_DB.GPS_DASHBOARD.TBOX_GPS_ENRICHED
          WHERE PROVINCE IS NOT NULL 
            AND DISTRICT IS NOT NULL 
            AND AREA IS NOT NULL
            AND MEAN_LAT IS NOT NULL 
            AND MEAN_LONG IS NOT NULL
            AND MEAN_LAT BETWEEN -90 AND 90
            AND MEAN_LONG BETWEEN -180 AND 180
            AND (MEAN_LAT != 0 OR MEAN_LONG != 0)
        ) valid_data
        ORDER BY PROVINCE, DISTRICT, AREA
      `;

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data || result;
      
      const provinces = [...new Set(data.map((row: any) => row.PROVINCE).filter(Boolean))].sort();
      const districts = [...new Set(data.map((row: any) => row.DISTRICT).filter(Boolean))].sort();
      const areas = [...new Set(data.map((row: any) => row.AREA).filter(Boolean))].sort();

      setAvailableProvinces(provinces);
      setAvailableDistricts(districts);
      setAvailableAreas(areas);

    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Fallback data
      setAvailableProvinces(['Western Province', 'Central Province', 'Southern Province']);
      setAvailableDistricts(['Colombo', 'Gampaha', 'Kandy', 'Galle']);
      setAvailableAreas(['Colombo', 'Negombo', 'Kandy', 'Galle', 'Matara']);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  const transformAggregatedResponse = useCallback((apiResponse: any[]): GPSData => {
    const aggregatedData: GPSAggregatedData[] = apiResponse.map((row) => ({
      region_name: row.REGION_NAME || 'Unknown',
      region_type: row.REGION_TYPE as 'area' | 'district' | 'province',
      point_count: parseInt(row.POINT_COUNT) || 0,
      avg_latitude: parseFloat(row.AVG_LATITUDE) || 0,
      avg_longitude: parseFloat(row.AVG_LONGITUDE) || 0,
      unique_stations: parseInt(row.UNIQUE_STATIONS) || 0,
      latest_timestamp: row.LATEST_TIMESTAMP,
      earliest_timestamp: row.EARLIEST_TIMESTAMP,
    }));

    const totalPoints = aggregatedData.reduce((sum, region) => sum + region.point_count, 0);
    const totalRegions = aggregatedData.length;
    const activeStations = aggregatedData.reduce((sum, region) => sum + (region.unique_stations || 0), 0);

    return {
      aggregatedData,
      totalRegions,
      totalPoints,
      activeStations,
    };
  }, []);

  // NEW: Transform for individual points to aggregated format for consistency
  const transformIndividualToAggregated = useCallback((stations: GPSStation[], adminLevel: 'area' | 'district' | 'province'): GPSData => {
    const regionMap = new Map<string, GPSAggregatedData>();

    stations.forEach((station) => {
      // Get the region name based on admin level
      let regionName: string;
      switch (adminLevel) {
        case 'area':
          regionName = station.area || 'Unknown Area';
          break;
        case 'district':
          regionName = station.district || 'Unknown District';
          break;
        case 'province':
          regionName = station.province || 'Unknown Province';
          break;
        default:
          regionName = 'Unknown';
      }

      if (!regionMap.has(regionName)) {
        regionMap.set(regionName, {
          region_name: regionName,
          region_type: adminLevel,
          point_count: 0,
          avg_latitude: 0,
          avg_longitude: 0,
          unique_stations: 0,
          latest_timestamp: station.mean_timestamp,
          earliest_timestamp: station.mean_timestamp,
        });
      }

      const region = regionMap.get(regionName)!;
      region.point_count += 1;
      region.unique_stations += 1;
      
      // Update averages (simple incremental average)
      const totalPoints = region.point_count;
      region.avg_latitude = ((region.avg_latitude * (totalPoints - 1)) + station.latitude) / totalPoints;
      region.avg_longitude = ((region.avg_longitude * (totalPoints - 1)) + station.longitude) / totalPoints;
      
      // Update timestamps
      if (station.mean_timestamp) {
        if (!region.latest_timestamp || station.mean_timestamp > region.latest_timestamp) {
          region.latest_timestamp = station.mean_timestamp;
        }
        if (!region.earliest_timestamp || station.mean_timestamp < region.earliest_timestamp) {
          region.earliest_timestamp = station.mean_timestamp;
        }
      }
    });

    const aggregatedData = Array.from(regionMap.values());
    const totalPoints = aggregatedData.reduce((sum, region) => sum + region.point_count, 0);
    const totalRegions = aggregatedData.length;
    const activeStations = aggregatedData.reduce((sum, region) => sum + (region.unique_stations || 0), 0);

    return {
      aggregatedData,
      totalRegions,
      totalPoints,
      activeStations,
      stations, // Keep original stations for point display
    };
  }, []);

  const transformPointsResponse = useCallback((apiResponse: any[]): GPSStation[] => {
    return apiResponse.map((row, index) => ({
      id: row.TBOXID || `GPS${String(index + 1).padStart(3, '0')}`,
      name: `Station ${row.AREA || 'Unknown'} ${index + 1}`,
      latitude: parseFloat(row.LATITUDE) || 0,
      longitude: parseFloat(row.LONGITUDE) || 0,
      area: row.AREA,
      district: row.DISTRICT,
      province: row.PROVINCE,
      mean_timestamp: row.MEAN_TIMESTAMP,
      tboxid: row.TBOXID,
    })).filter(station => 
      station.latitude !== 0 && 
      station.longitude !== 0 &&
      station.latitude >= -90 && 
      station.latitude <= 90 &&
      station.longitude >= -180 && 
      station.longitude <= 180
    );
  }, []);

  const fetchAggregatedData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we have geographic filters applied
      const hasGeographicFilters = 
        filters.selectedProvinces.length > 0 ||
        filters.selectedDistricts.length > 0 ||
        filters.selectedAreas.length > 0;

      let transformedData: GPSData;

      if (hasGeographicFilters) {
        // When geographic filters are applied, fetch individual points and aggregate them
        console.log('Geographic filters applied, fetching individual points for aggregation');
        
        const sql = generatePointsQuery(filters);
        console.log('Generated points query for aggregation:', sql);

        const response = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }

        const stations = transformPointsResponse(result.data || result);
        console.log(`Fetched ${stations.length} individual stations for aggregation`);
        
        // Transform individual points to aggregated format
        transformedData = transformIndividualToAggregated(stations, filters.adminLevel);
        console.log('Aggregated data:', transformedData);
        
      } else {
        // No geographic filters, use server-side aggregation
        console.log('No geographic filters, using server-side aggregation');
        
        const sql = generateAggregatedQuery(filters);
        console.log('Generated aggregated query:', sql);
        
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }

        transformedData = transformAggregatedResponse(result.data || result);
      }
      
      console.log('Final transformed data:', transformedData);
      setData(transformedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GPS data';
      setError(errorMessage);
      console.error('GPS Data fetch error:', err);
      
      // Fallback data
      setData({
        aggregatedData: [
          {
            region_name: "Western Province",
            region_type: "province",
            point_count: 150,
            avg_latitude: 6.9271,
            avg_longitude: 79.8612,
            unique_stations: 45,
          },
          {
            region_name: "Central Province", 
            region_type: "province",
            point_count: 89,
            avg_latitude: 7.2906,
            avg_longitude: 80.6337,
            unique_stations: 28,
          },
        ],
        totalRegions: 2,
        totalPoints: 239,
        activeStations: 73,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, generateAggregatedQuery, generatePointsQuery, transformAggregatedResponse, transformPointsResponse, transformIndividualToAggregated]);

  const fetchPoints = useCallback(async (): Promise<GPSStation[]> => {
    setPointsLoading(true);
    setPointsError(null);

    try {
      const sql = generatePointsQuery(filters);

      console.log('Generated points query:', sql);

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const stations = transformPointsResponse(result.data || result);
      
      setData(prevData => prevData ? {
        ...prevData,
        stations
      } : null);

      return stations;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GPS points';
      setPointsError(errorMessage);
      console.error('GPS Points fetch error:', err);
      
      const fallbackStations: GPSStation[] = [
        {
          id: "LK001",
          name: "Station Colombo Fort",
          latitude: 6.9271,
          longitude: 79.8612,
          area: "Colombo",
          district: "Colombo",
          province: "Western Province",
        },
        {
          id: "LK002", 
          name: "Station Kandy",
          latitude: 7.2906,
          longitude: 80.6337,
          area: "Kandy",
          district: "Kandy", 
          province: "Central Province",
        },
      ];

      setData(prevData => prevData ? {
        ...prevData,
        stations: fallbackStations
      } : null);

      return fallbackStations;
    } finally {
      setPointsLoading(false);
    }
  }, [filters, generatePointsQuery, transformPointsResponse]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    if (filters.dateRange?.from && filters.dateRange?.to) {
      fetchAggregatedData();
    }
  }, [
    fetchAggregatedData, 
    filters.dateRange, 
    filters.adminLevel, 
    filters.selectedAreas,
    filters.selectedDistricts,
    filters.selectedProvinces,
    filters.selectedTboxes,
  ]);

  useEffect(() => {
    // Clear stations when filters change to avoid showing stale data
    setData(prevData => {
      if (prevData && prevData.stations) {
        const { stations, ...rest } = prevData;
        return rest;
      }
      return prevData;
    });
  }, [
    filters.dateRange, 
    filters.adminLevel, 
    filters.selectedAreas,
    filters.selectedDistricts,
    filters.selectedProvinces,
    filters.selectedTboxes,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchAggregatedData,
    fetchPoints,
    pointsLoading,
    pointsError,
    availableAreas,
    availableDistricts,
    availableProvinces,
    filtersLoading,
  };
};