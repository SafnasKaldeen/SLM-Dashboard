import { useState, useEffect, useCallback, useRef } from 'react';

// Updated VehicleDetail interface based on your requirements
interface VehicleDetail {
  VEHICLE_ID: string;
  VIN: string; // CHASSIS NUMBER
  MODEL: string;
  BATTERY_TYPE: string;
  STATUS: string;
  CREATED_DATE: string;
  CUSTOMER_ID?: string;
  CUSTOMER_NAME?: string;
  EMAIL?: string;
  PHONE?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  ADDRESS?: string;
  LAST_LOCATION_UPDATE?: string;
  DEALER_NAME?: string;
  TOTAL_DISTANCE: number;
  SELLING_PRICE: string;
  TOTAL_SWAPS: string;
  TOTAL_CHARGING: string;
  TOTAL_REVENUE: string;
}

interface ChargingPattern {
  HOUR_OF_DAY: number;
  SESSION_COUNT: number;
  AVG_DURATION: number;
  AVG_ENERGY: number;
  AVG_COST: number;
}

interface SwappingHistory {
  SWAP_DATE: string;
  SWAP_TIME: string;
  STATION_NAME: string;
  LOCATION: string;
  OLD_BATTERY_ID: string;
  OLD_BATTERY_HEALTH: number;
  NEW_BATTERY_ID: string;
  NEW_BATTERY_HEALTH: number;
  SWAP_DURATION_SECONDS: number;
  SWAP_COST: number;
}

interface GPSAnalytics {
  TRAVEL_DATE: string;
  FIRST_LOCATION_TIME: string;
  LAST_LOCATION_TIME: string;
  LOCATION_POINTS: number;
  TOTAL_DISTANCE: number;
  AVG_SPEED: number;
  MAX_SPEED: number;
  IDLE_POINTS: number;
  ROUTE_EFFICIENCY: number;
}

interface BatteryHealth {
  BATTERY_ID: string;
  BATTERY_TYPE: string;
  CAPACITY_KWH: number;
  HEALTH_PERCENTAGE: number;
  CYCLE_COUNT: number;
  LAST_MAINTENANCE_DATE: string;
  REPLACEMENT_DATE?: string;
  TOTAL_SWAPS: number;
  LAST_SWAP_DATE: string;
}

interface MaintenanceRecord {
  MAINTENANCE_ID: string;
  MAINTENANCE_DATE: string;
  MAINTENANCE_TYPE: string;
  DESCRIPTION: string;
  COST: number;
  TECHNICIAN_NAME: string;
  STATUS: string;
}

// Cache state for each data type
interface DataCache {
  data: any;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

type TabDataType = 'charging' | 'swapping' | 'battery' | 'gps' | 'maintenance';

interface UseVehicleDataReturn {
  vehicle: VehicleDetail | null;
  chargingPatterns: ChargingPattern[];
  swappingHistory: SwappingHistory[];
  gpsAnalytics: GPSAnalytics[];
  batteryHealth: BatteryHealth[];
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  error: string | null;
  
  // Tab-specific loading states
  loadingStates: Record<TabDataType, boolean>;
  
  // Function to load specific tab data
  loadTabData: (tabType: TabDataType) => Promise<void>;
  
  // Refetch functions
  refetch: () => Promise<void>;
  refetchTab: (tabType: TabDataType) => Promise<void>;
}

// API endpoints for each data type
const API_ENDPOINTS = {
  vehicle: (vehicleId: string) => `/api/vehicles/${vehicleId}`,
  charging: (vehicleId: string) => `/api/vehicles/${vehicleId}/charging-patterns`,
  swapping: (vehicleId: string) => `/api/vehicles/${vehicleId}/swapping-history`,
  battery: (vehicleId: string) => `/api/vehicles/${vehicleId}/battery-health`,
  gps: (vehicleId: string) => `/api/vehicles/${vehicleId}/gps-analytics`,
  maintenance: (vehicleId: string) => `/api/vehicles/${vehicleId}/maintenance`,
};

// Mock data generators
const generateMockVehicle = (vehicleId: string): VehicleDetail => {
  console.log(`Generating mock vehicle data for: ${vehicleId}`);
  return {
    VEHICLE_ID: vehicleId,
    VIN: `CH${vehicleId.slice(-8).toUpperCase()}ABC123`, // Chassis number
    MODEL: "Model S Pro",
    BATTERY_TYPE: "LiPo 75kWh",
    STATUS: "SOLD",
    CREATED_DATE: "2024-01-15T10:30:00Z",
    CUSTOMER_ID: "CUST_001",
    CUSTOMER_NAME: "John Doe",
    EMAIL: "john.doe@email.com",
    PHONE: "+1-555-0123",
    LATITUDE: 37.7749,
    LONGITUDE: -122.4194,
    ADDRESS: "123 Main Street, San Francisco, CA 94105",
    LAST_LOCATION_UPDATE: "2024-12-15T14:30:00Z",
    DEALER_NAME: "Premium Auto Dealers",
    TOTAL_DISTANCE: 15750.5,
    SELLING_PRICE: "45000.00",
    TOTAL_SWAPS: "12",
    TOTAL_CHARGING: "89",
    TOTAL_REVENUE: "3250.75",
  };
};

const generateMockChargingPatterns = (): ChargingPattern[] => {
  console.log("Generating mock charging patterns");
  return [
    { HOUR_OF_DAY: 6, SESSION_COUNT: 5, AVG_DURATION: 45, AVG_ENERGY: 25, AVG_COST: 12.50 },
    { HOUR_OF_DAY: 7, SESSION_COUNT: 8, AVG_DURATION: 52, AVG_ENERGY: 28, AVG_COST: 14.20 },
    { HOUR_OF_DAY: 8, SESSION_COUNT: 12, AVG_DURATION: 48, AVG_ENERGY: 26, AVG_COST: 13.10 },
    { HOUR_OF_DAY: 12, SESSION_COUNT: 6, AVG_DURATION: 35, AVG_ENERGY: 20, AVG_COST: 10.00 },
    { HOUR_OF_DAY: 18, SESSION_COUNT: 15, AVG_DURATION: 65, AVG_ENERGY: 35, AVG_COST: 17.50 },
    { HOUR_OF_DAY: 19, SESSION_COUNT: 18, AVG_DURATION: 70, AVG_ENERGY: 38, AVG_COST: 19.00 },
    { HOUR_OF_DAY: 20, SESSION_COUNT: 22, AVG_DURATION: 68, AVG_ENERGY: 36, AVG_COST: 18.20 },
    { HOUR_OF_DAY: 21, SESSION_COUNT: 20, AVG_DURATION: 62, AVG_ENERGY: 33, AVG_COST: 16.50 },
    { HOUR_OF_DAY: 22, SESSION_COUNT: 10, AVG_DURATION: 55, AVG_ENERGY: 30, AVG_COST: 15.00 },
  ];
};

const generateMockSwappingHistory = (): SwappingHistory[] => {
  console.log("Generating mock swapping history");
  return [
    {
      SWAP_DATE: "2024-12-10",
      SWAP_TIME: "14:30:00",
      STATION_NAME: "Downtown Swap Hub",
      LOCATION: "Market Street, San Francisco",
      OLD_BATTERY_ID: "BAT_001",
      OLD_BATTERY_HEALTH: 65,
      NEW_BATTERY_ID: "BAT_042",
      NEW_BATTERY_HEALTH: 98,
      SWAP_DURATION_SECONDS: 180,
      SWAP_COST: 25.00,
    },
    {
      SWAP_DATE: "2024-12-05",
      SWAP_TIME: "09:15:00",
      STATION_NAME: "Mission Bay Station",
      LOCATION: "3rd Street, San Francisco",
      OLD_BATTERY_ID: "BAT_038",
      OLD_BATTERY_HEALTH: 72,
      NEW_BATTERY_ID: "BAT_001",
      NEW_BATTERY_HEALTH: 95,
      SWAP_DURATION_SECONDS: 165,
      SWAP_COST: 25.00,
    },
  ];
};

const generateMockGPSAnalytics = (): GPSAnalytics[] => {
  console.log("Generating mock GPS analytics");
  return [
    {
      TRAVEL_DATE: "2024-12-15",
      FIRST_LOCATION_TIME: "07:30:00",
      LAST_LOCATION_TIME: "22:45:00",
      LOCATION_POINTS: 890,
      TOTAL_DISTANCE: 142.5,
      AVG_SPEED: 35.2,
      MAX_SPEED: 85.0,
      IDLE_POINTS: 120,
      ROUTE_EFFICIENCY: 88.5,
    },
    {
      TRAVEL_DATE: "2024-12-14",
      FIRST_LOCATION_TIME: "08:00:00",
      LAST_LOCATION_TIME: "21:30:00",
      LOCATION_POINTS: 756,
      TOTAL_DISTANCE: 98.3,
      AVG_SPEED: 32.1,
      MAX_SPEED: 75.0,
      IDLE_POINTS: 95,
      ROUTE_EFFICIENCY: 91.2,
    },
  ];
};

const generateMockBatteryHealth = (): BatteryHealth[] => {
  console.log("Generating mock battery health");
  return [
    {
      BATTERY_ID: "BAT_042",
      BATTERY_TYPE: "LiPo 75kWh",
      CAPACITY_KWH: 75,
      HEALTH_PERCENTAGE: 98,
      CYCLE_COUNT: 450,
      LAST_MAINTENANCE_DATE: "2024-11-20T10:00:00Z",
      TOTAL_SWAPS: 12,
      LAST_SWAP_DATE: "2024-12-10T14:30:00Z",
    },
  ];
};

const generateMockMaintenanceRecords = (): MaintenanceRecord[] => {
  console.log("Generating mock maintenance records");
  return [
    {
      MAINTENANCE_ID: "MAINT_001",
      MAINTENANCE_DATE: "2024-12-01T09:00:00Z",
      MAINTENANCE_TYPE: "Preventive",
      DESCRIPTION: "Routine battery health check and calibration",
      COST: 150.00,
      TECHNICIAN_NAME: "Mike Johnson",
      STATUS: "Completed",
    },
    {
      MAINTENANCE_ID: "MAINT_002",
      MAINTENANCE_DATE: "2024-11-15T14:30:00Z",
      MAINTENANCE_TYPE: "Repair",
      DESCRIPTION: "GPS tracking module replacement",
      COST: 275.50,
      TECHNICIAN_NAME: "Sarah Wilson",
      STATUS: "Completed",
    },
  ];
};

// Generic API call function with mock fallback
async function fetchData<T>(endpoint: string, mockData: T, simulateDelay: boolean = true): Promise<T> {
  console.log(`Fetching data from: ${endpoint}`);
  
  // Simulate network delay for better UX
  if (simulateDelay) {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API success for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.warn(`API call failed for ${endpoint}, using mock data:`, error);
    console.log(`Mock data:`, mockData);
    // Always return mock data when API fails
    return mockData;
  }
}

// Main hook with lazy loading
export function useVehicleData(vehicleId: string): UseVehicleDataReturn {
  console.log(`useVehicleData called with vehicleId: "${vehicleId}"`);
  
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache for each tab data type
  const cacheRef = useRef<Record<TabDataType, DataCache>>({
    charging: { data: [], loaded: false, loading: false, error: null },
    swapping: { data: [], loaded: false, loading: false, error: null },
    battery: { data: [], loaded: false, loading: false, error: null },
    gps: { data: [], loaded: false, loading: false, error: null },
    maintenance: { data: [], loaded: false, loading: false, error: null },
  });

  // State for individual data arrays
  const [chargingPatterns, setChargingPatterns] = useState<ChargingPattern[]>([]);
  const [swappingHistory, setSwappingHistory] = useState<SwappingHistory[]>([]);
  const [gpsAnalytics, setGpsAnalytics] = useState<GPSAnalytics[]>([]);
  const [batteryHealth, setBatteryHealth] = useState<BatteryHealth[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  // Loading states for each tab
  const [loadingStates, setLoadingStates] = useState<Record<TabDataType, boolean>>({
    charging: false,
    swapping: false,
    battery: false,
    gps: false,
    maintenance: false,
  });

  // Fetch main vehicle data (always loaded on mount)
  const fetchVehicleData = useCallback(async () => {
    console.log(`fetchVehicleData called with vehicleId: "${vehicleId}"`);
    
    if (!vehicleId || vehicleId.trim() === '') {
      console.error("Vehicle ID is empty or invalid");
      setError("Vehicle ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching vehicle data for: ${vehicleId}`);
      
      const vehicleData = await fetchData<VehicleDetail>(
        API_ENDPOINTS.vehicle(vehicleId),
        generateMockVehicle(vehicleId)
      );

      console.log('Vehicle data received:', vehicleData);
      setVehicle(vehicleData);
      console.log('Vehicle data loaded successfully:', vehicleData);
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle data';
      setError(errorMessage);
      // Still provide mock data on error
      const mockData = generateMockVehicle(vehicleId);
      console.log('Setting mock vehicle data due to error:', mockData);
      setVehicle(mockData);
    } finally {
      setLoading(false);
      console.log('Vehicle data fetch completed');
    }
  }, [vehicleId]);

  // Load specific tab data
  const loadTabData = useCallback(async (tabType: TabDataType) => {
    console.log(`loadTabData called for type: ${tabType} with vehicleId: "${vehicleId}"`);
    
    if (!vehicleId || vehicleId.trim() === '') {
      console.warn("Cannot load tab data: Vehicle ID is empty");
      return;
    }

    const cache = cacheRef.current[tabType];
    
    // Return early if already loaded or currently loading
    if (cache.loaded || cache.loading) {
      console.log(`${tabType} data already loaded or loading, skipping...`);
      return;
    }

    // Set loading state
    cache.loading = true;
    setLoadingStates(prev => ({ ...prev, [tabType]: true }));

    try {
      console.log(`Loading ${tabType} data for vehicle: ${vehicleId}`);

      let data: any;
      let mockData: any;
      let setStateFunction: (data: any) => void;

      // Determine endpoint, mock data, and state setter based on tab type
      switch (tabType) {
        case 'charging':
          mockData = generateMockChargingPatterns();
          setStateFunction = setChargingPatterns;
          break;
        case 'swapping':
          mockData = generateMockSwappingHistory();
          setStateFunction = setSwappingHistory;
          break;
        case 'battery':
          mockData = generateMockBatteryHealth();
          setStateFunction = setBatteryHealth;
          break;
        case 'gps':
          mockData = generateMockGPSAnalytics();
          setStateFunction = setGpsAnalytics;
          break;
        case 'maintenance':
          mockData = generateMockMaintenanceRecords();
          setStateFunction = setMaintenanceRecords;
          break;
        default:
          throw new Error(`Unknown tab type: ${tabType}`);
      }

      // Fetch data (will always return mock data since APIs don't exist)
      data = await fetchData(
        API_ENDPOINTS[tabType](vehicleId),
        mockData
      );

      // Update cache and state
      cache.data = data;
      cache.loaded = true;
      cache.error = null;
      setStateFunction(data);

      console.log(`${tabType} data loaded successfully:`, data.length, 'records');

    } catch (err) {
      console.error(`Error loading ${tabType} data:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${tabType} data`;
      cache.error = errorMessage;
      
      // Even on error, try to provide mock data
      let mockData: any;
      let setStateFunction: (data: any) => void;

      switch (tabType) {
        case 'charging':
          mockData = generateMockChargingPatterns();
          setStateFunction = setChargingPatterns;
          break;
        case 'swapping':
          mockData = generateMockSwappingHistory();
          setStateFunction = setSwappingHistory;
          break;
        case 'battery':
          mockData = generateMockBatteryHealth();
          setStateFunction = setBatteryHealth;
          break;
        case 'gps':
          mockData = generateMockGPSAnalytics();
          setStateFunction = setGpsAnalytics;
          break;
        case 'maintenance':
          mockData = generateMockMaintenanceRecords();
          setStateFunction = setMaintenanceRecords;
          break;
      }

      // Set mock data and mark as loaded
      cache.data = mockData;
      cache.loaded = true;
      setStateFunction(mockData);
      
      console.log(`Using mock data for ${tabType} due to error:`, mockData.length, 'records');
    } finally {
      cache.loading = false;
      setLoadingStates(prev => ({ ...prev, [tabType]: false }));
    }
  }, [vehicleId]);

  // Refetch specific tab data (clears cache)
  const refetchTab = useCallback(async (tabType: TabDataType) => {
    console.log(`Refetching ${tabType} data...`);
    const cache = cacheRef.current[tabType];
    cache.loaded = false;
    cache.data = [];
    cache.error = null;
    cache.loading = false;
    
    await loadTabData(tabType);
  }, [loadTabData]);

  // Refetch all data
  const refetch = useCallback(async () => {
    console.log('Refetching all vehicle data...');
    
    // Clear all caches
    Object.keys(cacheRef.current).forEach(key => {
      const cache = cacheRef.current[key as TabDataType];
      cache.loaded = false;
      cache.data = [];
      cache.error = null;
      cache.loading = false;
    });

    // Clear state
    setChargingPatterns([]);
    setSwappingHistory([]);
    setGpsAnalytics([]);
    setBatteryHealth([]);
    setMaintenanceRecords([]);

    // Reset loading states
    setLoadingStates({
      charging: false,
      swapping: false,
      battery: false,
      gps: false,
      maintenance: false,
    });

    // Refetch vehicle data
    await fetchVehicleData();
  }, [fetchVehicleData]);

  // Load vehicle data on mount
  useEffect(() => {
    console.log(`useEffect triggered with vehicleId: "${vehicleId}"`);
    
    if (vehicleId && vehicleId.trim() !== '') {
      console.log("Vehicle ID is valid, fetching data...");
      fetchVehicleData();
    } else {
      console.error("No vehicle ID provided or empty vehicle ID");
      setError("No vehicle ID provided");
      setLoading(false);
    }
  }, [fetchVehicleData, vehicleId]);

  // Debug log the current state
  useEffect(() => {
    console.log("Hook state updated:", {
      vehicleId,
      vehicle: vehicle?.VEHICLE_ID,
      loading,
      error,
      chargingPatternsCount: chargingPatterns.length,
      swappingHistoryCount: swappingHistory.length,
      gpsAnalyticsCount: gpsAnalytics.length,
      batteryHealthCount: batteryHealth.length,
      maintenanceRecordsCount: maintenanceRecords.length,
      loadingStates
    });
  }, [vehicleId, vehicle, loading, error, chargingPatterns, swappingHistory, gpsAnalytics, batteryHealth, maintenanceRecords, loadingStates]);

  return {
    vehicle,
    chargingPatterns,
    swappingHistory,
    gpsAnalytics,
    batteryHealth,
    maintenanceRecords,
    loading,
    error,
    loadingStates,
    loadTabData,
    refetch,
    refetchTab,
  };
}