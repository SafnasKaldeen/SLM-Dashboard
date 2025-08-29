"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  Filter,
  BarChart3,
} from "lucide-react";

import { VehicleGrid } from "@/components/vehicles/VehicleCards";
import KPICardsGrid from "@/components/vehicles/KPICardsGrid";
import {
  SimpleOverviewFilter,
  type SimpleOverviewFilterType,
} from "@/components/vehicles/OverviewFilter";

// ============================================================================
// TYPE DEFINITIONS - SIMPLIFIED
// ============================================================================
export interface Vehicle {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string; // This is the VIN
  TBOX_ID?: string;
  TBOX_IMEI_NO?: string;
  BATTERY_TYPE_ID: string;
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  MODEL?: string;
  STATUS: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "CHARGING";
  REGION?: string;

  // Simplified performance metrics (no random generation)
  TOTAL_SWAPS_DAILY: number;
  TOTAL_SWAPS_MONTHLY: number;
  TOTAL_SWAPS_LIFETIME: number;
  TOTAL_CHARGING_SESSIONS: number;
  AVG_DISTANCE_PER_DAY: number;
  TOTAL_DISTANCE: number;

  // Simplified revenue metrics
  SWAPPING_REVENUE: number;
  CHARGING_REVENUE: number;
  TOTAL_REVENUE: number;

  // Timestamps
  CREATED_DATE?: Date;
  LAST_UPDATED?: Date;
}

// Extended Vehicle type for VehicleCards component compatibility
interface ExtendedVehicle extends Vehicle {
  VIN: string; // Alias for CHASSIS_NUMBER
  BATTERY_TYPE: string; // Alias for BATTERY_TYPE_ID
}

export interface FleetKPIs {
  TOTAL_VEHICLES: number;
  ACTIVE_VEHICLES: number;
  INACTIVE_VEHICLES: number;
  MAINTENANCE_VEHICLES: number;
  TOTAL_REVENUE: number;
  SWAPPING_REVENUE: number;
  CHARGING_REVENUE: number;
  TOTAL_DISTANCE_TRAVELLED: number;
  AVG_REVENUE_PER_VEHICLE: number;
  AVG_DISTANCE_PER_VEHICLE: number;
}

export interface FilterCombination {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  BATTERY_TYPE_ID: string;
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  STATUS: string;
  MODEL?: string;
}

export interface SearchFilters {
  searchTerm: string;
  customerIdSearch: string;
  statusFilter: string;
}

// Simplified filter type without date range and aggregation
export interface SimpleOverviewFilterType {
  selectedModels: string[];
  selectedBatteryTypes: string[];
  selectedStatuses: string[];
  customerTypes: string[];
  dealerIds: string[];
  vehicleIdSearch: string;
  chassisNumberSearch: string;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const LoadingState: React.FC = () => (
  <div className="min-h-screen p-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-slate-300">Loading filter combinations...</span>
        </div>
      </div>
    </div>
  </div>
);

const GraphsLoadingState: React.FC = () => (
  <div className="space-y-6">
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="text-slate-300">Loading KPIs and charts...</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="min-h-screen p-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center h-64">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">
              Error Loading Data
            </h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// ============================================================================
// SIMPLIFIED SQL QUERY BUILDERS - NO RANDOM DATA
// ============================================================================

const buildVehicleDataQuery = (filters: SimpleOverviewFilterType) => {
  // Build WHERE conditions
  const conditions: string[] = [`lv.VEHICLE_ID IS NOT NULL`];

  if (filters.selectedModels.length > 0) {
    if (!filters.selectedModels.includes("rc189")) {
      conditions.push(`1 = 0`);
    }
  }

  if (filters.selectedBatteryTypes.length > 0) {
    const batteryTypes = filters.selectedBatteryTypes
      .map((b) => `'${b.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.BATTERY_TYPE_ID IN (${batteryTypes})`);
  }

  if (filters.selectedStatuses.length > 0) {
    const statuses = filters.selectedStatuses
      .map((s) => `'${s.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`vs.STATUS IN (${statuses})`);
  }

  if (filters.customerTypes.length > 0) {
    const customerTypes = filters.customerTypes
      .map((c) => `'${c.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.CUSTOMER_ID IN (${customerTypes})`);
  }

  if (filters.dealerIds.length > 0) {
    const dealerIds = filters.dealerIds
      .map((d) => `'${d.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.DEALER_ID IN (${dealerIds})`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return `
    SELECT 
      lv.VEHICLE_ID,
      lv.CHASSIS_NUMBER,
      lv.BATTERY_TYPE_ID,
      lv.CUSTOMER_ID,
      lv.DEALER_ID,
      'rc189' as MODEL,
      COALESCE(vs.STATUS, 'ACTIVE') as STATUS,
      
      -- Timestamps
      CURRENT_TIMESTAMP as CREATED_DATE,
      CURRENT_TIMESTAMP as LAST_UPDATED
      
    FROM ADHOC.MASTER_DATA.LOOKUP_VIEW lv
    LEFT JOIN (
      SELECT DISTINCT VEHICLE_ID, 'ACTIVE' as STATUS 
      FROM ADHOC.MASTER_DATA.LOOKUP_VIEW 
      WHERE VEHICLE_ID IS NOT NULL
    ) vs ON lv.VEHICLE_ID = vs.VEHICLE_ID
    ${whereClause}
    ORDER BY lv.VEHICLE_ID
  `;
};

const buildKPIQuery = (filters: SimpleOverviewFilterType) => {
  // Build WHERE conditions (same as vehicle query)
  const conditions: string[] = [`lv.VEHICLE_ID IS NOT NULL`];

  if (filters.selectedModels.length > 0) {
    if (!filters.selectedModels.includes("rc189")) {
      conditions.push(`1 = 0`);
    }
  }

  if (filters.selectedBatteryTypes.length > 0) {
    const batteryTypes = filters.selectedBatteryTypes
      .map((b) => `'${b.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.BATTERY_TYPE_ID IN (${batteryTypes})`);
  }

  if (filters.selectedStatuses.length > 0) {
    const statuses = filters.selectedStatuses
      .map((s) => `'${s.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`vs.STATUS IN (${statuses})`);
  }

  if (filters.customerTypes.length > 0) {
    const customerTypes = filters.customerTypes
      .map((c) => `'${c.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.CUSTOMER_ID IN (${customerTypes})`);
  }

  if (filters.dealerIds.length > 0) {
    const dealerIds = filters.dealerIds
      .map((d) => `'${d.replace(/'/g, "''")}'`)
      .join(",");
    conditions.push(`lv.DEALER_ID IN (${dealerIds})`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return `
    WITH vehicle_data AS (
      SELECT 
        lv.VEHICLE_ID,
        COALESCE(vs.STATUS, 'ACTIVE') as STATUS,
        -- Fixed static revenue and distance data
        1200.50 as SWAPPING_REVENUE,
        450.25 as CHARGING_REVENUE,
        25650.0 as TOTAL_DISTANCE
        
      FROM ADHOC.MASTER_DATA.LOOKUP_VIEW lv
      LEFT JOIN (
        SELECT DISTINCT VEHICLE_ID, 'ACTIVE' as STATUS 
        FROM ADHOC.MASTER_DATA.LOOKUP_VIEW 
        WHERE VEHICLE_ID IS NOT NULL
      ) vs ON lv.VEHICLE_ID = vs.VEHICLE_ID
      ${whereClause}
    )
    SELECT 
      COUNT(*) as TOTAL_VEHICLES,
      COUNT(CASE WHEN STATUS = 'ACTIVE' THEN 1 END) as ACTIVE_VEHICLES,
      COUNT(CASE WHEN STATUS = 'INACTIVE' THEN 1 END) as INACTIVE_VEHICLES,
      COUNT(CASE WHEN STATUS = 'MAINTENANCE' THEN 1 END) as MAINTENANCE_VEHICLES,
      
      -- Calculate aggregated values
      (COUNT(*) * 1650.75) as TOTAL_REVENUE,
      (COUNT(*) * 1200.50) as SWAPPING_REVENUE,
      (COUNT(*) * 450.25) as CHARGING_REVENUE,
      (COUNT(*) * 25650.0) as TOTAL_DISTANCE_TRAVELLED,
      
      1650.75 as AVG_REVENUE_PER_VEHICLE,
      25650.0 as AVG_DISTANCE_PER_VEHICLE
    FROM vehicle_data
  `;
};

const buildFilterCombinationsQuery = () => {
  return `
    SELECT DISTINCT
      lv.VEHICLE_ID,
      lv.CHASSIS_NUMBER,
      lv.BATTERY_TYPE_ID,
      lv.CUSTOMER_ID,
      lv.DEALER_ID,
      'rc189' as MODEL,
      'ACTIVE' as STATUS
    FROM ADHOC.MASTER_DATA.LOOKUP_VIEW lv
    WHERE lv.VEHICLE_ID IS NOT NULL
    ORDER BY lv.VEHICLE_ID, lv.BATTERY_TYPE_ID
  `;
};

// ============================================================================
// MAIN PAGE COMPONENT - SIMPLIFIED
// ============================================================================

const VehicleOverviewPage: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT - SIMPLIFIED
  // ============================================================================

  // Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetKPIs, setFleetKPIs] = useState<FleetKPIs | null>(null);

  // Filter combinations state
  const [filterCombinations, setFilterCombinations] = useState<
    FilterCombination[]
  >([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  // Loading and Error State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simplified vehicle filters (no date range or aggregation)
  const [vehicleFilters, setVehicleFilters] =
    useState<SimpleOverviewFilterType>({
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      dealerIds: [],
      vehicleIdSearch: "",
      chassisNumberSearch: "",
    });

  // Additional Search Filter State (affects only card display)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    customerIdSearch: "",
    statusFilter: "all",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Use refs to track if initial load is complete
  const filterCombinationsLoadedRef = useRef(false);

  // ============================================================================
  // DATA TRANSFORMATION - VEHICLE COMPATIBILITY
  // ============================================================================

  // Transform vehicles for VehicleCards component compatibility
  const extendedVehicles = useMemo((): ExtendedVehicle[] => {
    return vehicles.map((vehicle) => ({
      ...vehicle,
      VIN: vehicle.CHASSIS_NUMBER, // Map CHASSIS_NUMBER to VIN
      BATTERY_TYPE: vehicle.BATTERY_TYPE_ID, // Map BATTERY_TYPE_ID to BATTERY_TYPE
    }));
  }, [vehicles]);

  // ============================================================================
  // DATA FETCHING - USING /api/query ONLY
  // ============================================================================

  const fetchFilterCombinations = useCallback(async () => {
    if (filterCombinationsLoadedRef.current) return;

    setFiltersLoaded(false);
    setFiltersError(null);

    try {
      console.log("Fetching filter combinations...");

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: buildFilterCombinationsQuery(),
          params: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Filter combinations loaded:", data.length, "records");

      // Transform the data to match expected format
      const transformedData: FilterCombination[] = data.map((item: any) => ({
        VEHICLE_ID: item.VEHICLE_ID,
        CHASSIS_NUMBER: item.CHASSIS_NUMBER,
        BATTERY_TYPE_ID: item.BATTERY_TYPE_ID,
        CUSTOMER_ID: item.CUSTOMER_ID,
        DEALER_ID: item.DEALER_ID,
        STATUS: item.STATUS,
        MODEL: item.MODEL,
      }));

      setFilterCombinations(transformedData);
      setFiltersLoaded(true);
      filterCombinationsLoadedRef.current = true;
    } catch (error) {
      console.error("Error fetching filter combinations:", error);
      setFiltersError("Failed to load filter options");
    }
  }, []);

  const fetchVehicleData = useCallback(async () => {
    if (!filtersLoaded) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching vehicle data with filters:", vehicleFilters);

      // Fetch vehicle data
      const vehicleQuery = buildVehicleDataQuery(vehicleFilters);
      const vehicleResponse = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: vehicleQuery,
          params: [],
        }),
      });

      if (!vehicleResponse.ok) {
        throw new Error(
          `Vehicle query failed with status: ${vehicleResponse.status}`
        );
      }

      const vehicleData = await vehicleResponse.json();

      // Fetch KPI data
      const kpiQuery = buildKPIQuery(vehicleFilters);
      const kpiResponse = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: kpiQuery,
          params: [],
        }),
      });

      if (!kpiResponse.ok) {
        throw new Error(`KPI query failed with status: ${kpiResponse.status}`);
      }

      const kpiData = await kpiResponse.json();

      console.log("Vehicle data fetched:", vehicleData.length, "vehicles");
      console.log("KPI data fetched:", kpiData);

      // Transform vehicle data
      const transformedVehicles: Vehicle[] = vehicleData.map((item: any) => ({
        VEHICLE_ID: item.VEHICLE_ID,
        CHASSIS_NUMBER: item.CHASSIS_NUMBER,
        TBOX_ID: item.TBOX_ID,
        TBOX_IMEI_NO: item.TBOX_IMEI_NO,
        BATTERY_TYPE_ID: item.BATTERY_TYPE_ID,
        CUSTOMER_ID: item.CUSTOMER_ID,
        DEALER_ID: item.DEALER_ID,
        MODEL: item.MODEL,
        STATUS: item.STATUS as
          | "ACTIVE"
          | "INACTIVE"
          | "MAINTENANCE"
          | "CHARGING",
        REGION: item.REGION,
        TOTAL_SWAPS_DAILY: Number(item.TOTAL_SWAPS_DAILY) || 0,
        TOTAL_SWAPS_MONTHLY: Number(item.TOTAL_SWAPS_MONTHLY) || 0,
        TOTAL_SWAPS_LIFETIME: Number(item.TOTAL_SWAPS_LIFETIME) || 0,
        TOTAL_CHARGING_SESSIONS: Number(item.TOTAL_CHARGING_SESSIONS) || 0,
        AVG_DISTANCE_PER_DAY: Number(item.AVG_DISTANCE_PER_DAY) || 0,
        TOTAL_DISTANCE: Number(item.TOTAL_DISTANCE) || 0,
        SWAPPING_REVENUE: Number(item.SWAPPING_REVENUE) || 0,
        CHARGING_REVENUE: Number(item.CHARGING_REVENUE) || 0,
        TOTAL_REVENUE: Number(item.TOTAL_REVENUE) || 0,
        CREATED_DATE: item.CREATED_DATE
          ? new Date(item.CREATED_DATE)
          : undefined,
        LAST_UPDATED: item.LAST_UPDATED
          ? new Date(item.LAST_UPDATED)
          : undefined,
      }));

      // Transform KPI data (assuming single row result)
      const kpiRow = kpiData[0] || {};
      const transformedKPIs: FleetKPIs = {
        TOTAL_VEHICLES: Number(kpiRow.TOTAL_VEHICLES) || 0,
        ACTIVE_VEHICLES: Number(kpiRow.ACTIVE_VEHICLES) || 0,
        INACTIVE_VEHICLES: Number(kpiRow.INACTIVE_VEHICLES) || 0,
        MAINTENANCE_VEHICLES: Number(kpiRow.MAINTENANCE_VEHICLES) || 0,
        TOTAL_REVENUE: Number(kpiRow.TOTAL_REVENUE) || 0,
        SWAPPING_REVENUE: Number(kpiRow.SWAPPING_REVENUE) || 0,
        CHARGING_REVENUE: Number(kpiRow.CHARGING_REVENUE) || 0,
        TOTAL_DISTANCE_TRAVELLED: Number(kpiRow.TOTAL_DISTANCE_TRAVELLED) || 0,
        AVG_REVENUE_PER_VEHICLE: Number(kpiRow.AVG_REVENUE_PER_VEHICLE) || 0,
        AVG_DISTANCE_PER_VEHICLE: Number(kpiRow.AVG_DISTANCE_PER_VEHICLE) || 0,
      };

      setVehicles(transformedVehicles);
      setFleetKPIs(transformedKPIs);

      console.log("Data transformation complete:", {
        vehicles: transformedVehicles.length,
        kpis: transformedKPIs,
      });
    } catch (err) {
      console.error("Error fetching vehicle data:", err);
      setError(
        `Failed to fetch vehicle data: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [
    filtersLoaded,
    vehicleFilters.selectedModels,
    vehicleFilters.selectedBatteryTypes,
    vehicleFilters.selectedStatuses,
    vehicleFilters.customerTypes,
    vehicleFilters.dealerIds,
  ]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleVehicleFiltersChange = useCallback(
    (newFilters: Partial<SimpleOverviewFilterType>) => {
      console.log("Filter change received:", newFilters);

      setVehicleFilters((prevFilters) => {
        const hasChanges = Object.keys(newFilters).some((key) => {
          const filterKey = key as keyof SimpleOverviewFilterType;
          const newValue = newFilters[filterKey];
          const prevValue = prevFilters[filterKey];

          // Special handling for arrays
          if (Array.isArray(newValue) && Array.isArray(prevValue)) {
            return (
              JSON.stringify(newValue.sort()) !==
              JSON.stringify(prevValue.sort())
            );
          }

          return newValue !== prevValue;
        });

        if (!hasChanges) {
          console.log("No actual filter changes, skipping update");
          return prevFilters;
        }

        const updatedFilters = {
          ...prevFilters,
          ...newFilters,
        };

        console.log("Updated filters:", updatedFilters);
        return updatedFilters;
      });
    },
    []
  );

  const handleSearchFiltersChange = useCallback((newFilters: SearchFilters) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);

  // ============================================================================
  // DATA PROCESSING - OPTIMIZED
  // ============================================================================
  const filteredVehicles = useMemo(() => {
    return extendedVehicles.filter((vehicle) => {
      // General search across multiple fields
      const matchesGeneralSearch =
        !searchFilters.searchTerm ||
        [
          vehicle.VEHICLE_ID,
          vehicle.VIN,
          vehicle.MODEL,
          vehicle.CUSTOMER_ID || "",
        ].some((field) =>
          field.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())
        );

      // Display-only filters from main filter component
      const matchesVehicleId =
        !vehicleFilters.vehicleIdSearch ||
        vehicle.VEHICLE_ID.toLowerCase().includes(
          vehicleFilters.vehicleIdSearch.toLowerCase()
        );

      const matchesChassisNumber =
        !vehicleFilters.chassisNumberSearch ||
        vehicle.VIN.toLowerCase().includes(
          vehicleFilters.chassisNumberSearch.toLowerCase()
        );

      // Additional search filters
      const matchesCustomerId =
        !searchFilters.customerIdSearch ||
        (vehicle.CUSTOMER_ID &&
          vehicle.CUSTOMER_ID.toLowerCase().includes(
            searchFilters.customerIdSearch.toLowerCase()
          ));

      // Card-only status filter (doesn't affect KPIs)
      const matchesStatus =
        searchFilters.statusFilter === "all" ||
        vehicle.STATUS === searchFilters.statusFilter;

      // Main vehicle filters (these also affect API)
      const matchesModel =
        vehicleFilters.selectedModels.length === 0 ||
        vehicleFilters.selectedModels.includes(vehicle.MODEL || "");

      const matchesBatteryType =
        vehicleFilters.selectedBatteryTypes.length === 0 ||
        vehicleFilters.selectedBatteryTypes.includes(vehicle.BATTERY_TYPE_ID);

      const matchesMainStatus =
        vehicleFilters.selectedStatuses.length === 0 ||
        vehicleFilters.selectedStatuses.includes(vehicle.STATUS);

      return (
        matchesGeneralSearch &&
        matchesVehicleId &&
        matchesChassisNumber &&
        matchesCustomerId &&
        matchesStatus &&
        matchesModel &&
        matchesBatteryType &&
        matchesMainStatus
      );
    });
  }, [extendedVehicles, searchFilters, vehicleFilters]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load filter combinations on mount only
  useEffect(() => {
    if (!filterCombinationsLoadedRef.current) {
      fetchFilterCombinations();
    }
  }, []);

  // Fetch vehicle data when filters change
  useEffect(() => {
    if (filtersLoaded && !loading) {
      console.log("Filters changed, fetching vehicle data...");
      fetchVehicleData();
    }
  }, [filtersLoaded, fetchVehicleData]);

  // Reset pagination when display filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    vehicleFilters.vehicleIdSearch,
    vehicleFilters.chassisNumberSearch,
    searchFilters.searchTerm,
    searchFilters.customerIdSearch,
    searchFilters.statusFilter,
  ]);

  // ============================================================================
  // RENDER CONDITIONS
  // ============================================================================

  if (!filtersLoaded) {
    if (filtersError) {
      return (
        <ErrorState error={filtersError} onRetry={fetchFilterCombinations} />
      );
    }
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchVehicleData} />;
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  // Simplified filter section (you'll need to update OverviewFilter component to match)
  const MetricsFilterSection = () => (
    <div className="space-y-6">
      <SimpleOverviewFilter
        onFiltersChange={handleVehicleFiltersChange}
        loading={!filtersLoaded}
        initialFilters={vehicleFilters}
        filterCombinations={filterCombinations}
      />

      {loading ? (
        <GraphsLoadingState />
      ) : (
        fleetKPIs && <KPICardsGrid fleetKPIs={fleetKPIs} loading={loading} />
      )}
    </div>
  );

  const VehicleDisplaySection = () => (
    <div className="space-y-6">
      <div className="relative">
        <VehicleGrid
          vehicles={paginatedVehicles}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalVehicles={filteredVehicles.length}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <Car className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              EV Fleet Analytics
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Vehicles Overview
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get a comprehensive view of your electric vehicle fleet.
          </p>
        </div>

        {/* Metrics Section */}
        <MetricsFilterSection />

        {/* Vehicle Display Section */}
        <VehicleDisplaySection />
      </div>
    </div>
  );
};

export default VehicleOverviewPage;
