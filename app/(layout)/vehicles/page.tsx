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

import VehicleCards from "@/components/vehicles/VehicleCards";
import KPICardsGrid from "@/components/vehicles/KPICardsGrid";
import {
  OverviewFilter,
  type OverviewFilterType,
} from "@/components/vehicles/OverviewFilter";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Vehicle {
  VEHICLE_ID: string;
  VIN: string;
  MODEL: string;
  BATTERY_TYPE: string;
  STATUS: string;
  REGION: string;
  CUSTOMER_ID?: string;
  TOTAL_SWAPS_DAILY: number;
  TOTAL_SWAPS_MONTHLY: number;
  TOTAL_SWAPS_LIFETIME: number;
  TOTAL_CHARGING_SESSIONS: number;
  AVG_DISTANCE_PER_DAY: number;
  TOTAL_DISTANCE: number;
  SWAPPING_REVENUE: number;
  CHARGING_REVENUE: number;
  TOTAL_REVENUE: number;
}

interface FleetKPIs {
  TOTAL_VEHICLES: number;
  ACTIVE_VEHICLES: number;
  TOTAL_REVENUE: number;
  SWAPPING_REVENUE: number;
  CHARGING_REVENUE: number;
  TOTAL_DISTANCE_TRAVELLED: number;
}

interface SearchFilters {
  searchTerm: string;
  customerIdSearch: string;
  statusFilter: string;
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
// MAIN PAGE COMPONENT - FIXED
// ============================================================================

const VehicleOverviewPage: React.FC = () => {
  // Create stable default date range
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return {
      from: new Date(today.getFullYear() - 1, today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0),
    };
  }, []);

  // ============================================================================
  // STATE MANAGEMENT - SIMPLIFIED AND STABILIZED
  // ============================================================================

  // Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetKPIs, setFleetKPIs] = useState<FleetKPIs | null>(null);
  const [chargingPattern, setChargingPattern] = useState<any[]>([]);
  const [chargingOverTime, setChargingOverTime] = useState<any[]>([]);
  const [batteryDistribution, setBatteryDistribution] = useState<any[]>([]);

  // Filter combinations state
  const [filterCombinations, setFilterCombinations] = useState<any[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  // Loading and Error State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vehicle filters with stable initial state
  const [vehicleFilters, setVehicleFilters] = useState<OverviewFilterType>(
    () => ({
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      aggregation: "monthly",
      dateRange: defaultDateRange,
      vehicleIdSearch: "",
      chassisNumberSearch: "",
    })
  );

  // Additional Search Filter State (affects only card display)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    customerIdSearch: "",
    statusFilter: "all",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Use refs to track if initial load is complete
  const initialLoadRef = useRef(false);
  const filterCombinationsLoadedRef = useRef(false);

  // ============================================================================
  // STABLE FILTER COMPARISON
  // ============================================================================

  // Create a stable string representation of API-affecting filters
  const apiFiltersKey = useMemo(() => {
    const apiFilters = {
      dateRange: vehicleFilters.dateRange
        ? `${vehicleFilters.dateRange.from?.getTime()}-${vehicleFilters.dateRange.to?.getTime()}`
        : "no-date",
      selectedModels: vehicleFilters.selectedModels.sort().join(","),
      selectedBatteryTypes: vehicleFilters.selectedBatteryTypes
        .sort()
        .join(","),
      selectedStatuses: vehicleFilters.selectedStatuses.sort().join(","),
      customerTypes: vehicleFilters.customerTypes.sort().join(","),
      aggregation: vehicleFilters.aggregation,
    };
    return JSON.stringify(apiFilters);
  }, [
    vehicleFilters.dateRange?.from?.getTime(),
    vehicleFilters.dateRange?.to?.getTime(),
    vehicleFilters.selectedModels,
    vehicleFilters.selectedBatteryTypes,
    vehicleFilters.selectedStatuses,
    vehicleFilters.customerTypes,
    vehicleFilters.aggregation,
  ]);

  // ============================================================================
  // DATA FETCHING - FIXED
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
          sql: `
            SELECT DISTINCT
              vm.NAME as vehicle_model_id,
              v.battery_type_id,
              CASE WHEN v.ACTIVE = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END as status,
              v.VEHICLE_ID,
              v.chassis_number
            FROM SOURCE_DATA.MASTER_DATA.VEHICLE v
            JOIN SOURCE_DATA.MASTER_DATA.VEHICLE_MODEL vm 
                 ON v.VEHICLE_MODEL_ID = vm.MODEL_ID
            WHERE v.DELETED = 0
              AND vm.DELETED = 0
            ORDER BY vm.NAME, v.battery_type_id, status, v.VEHICLE_ID
          `,
          params: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Filter combinations loaded:", data, "records");
      setFilterCombinations(data);
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
      const params = new URLSearchParams();

      // Handle date range properly
      if (vehicleFilters.dateRange?.from && vehicleFilters.dateRange?.to) {
        const daysDiff = Math.ceil(
          (vehicleFilters.dateRange.to.getTime() -
            vehicleFilters.dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        params.append("dateRange", daysDiff.toString());
        params.append(
          "startDate",
          vehicleFilters.dateRange.from.toISOString().split("T")[0]
        );
        params.append(
          "endDate",
          vehicleFilters.dateRange.to.toISOString().split("T")[0]
        );
      } else {
        params.append("dateRange", "365");
      }

      // Handle multiple selections properly (ONLY API-affecting filters)
      if (vehicleFilters.selectedModels.length > 0) {
        params.append("vehicleModels", vehicleFilters.selectedModels.join(","));
      }

      if (vehicleFilters.selectedBatteryTypes.length > 0) {
        params.append(
          "batteryTypes",
          vehicleFilters.selectedBatteryTypes.join(",")
        );
      }

      if (vehicleFilters.selectedStatuses.length > 0) {
        params.append("statuses", vehicleFilters.selectedStatuses.join(","));
      }

      if (vehicleFilters.customerTypes.length > 0) {
        params.append("customerTypes", vehicleFilters.customerTypes.join(","));
      }

      params.append("aggregation", vehicleFilters.aggregation);

      // console.log("Fetching vehicles with params:", params.toString());

      const response = await fetch(`/api/vehicles?${params}`);
      const result = await response.json();
      // console.log("Vehicle data fetched:", result);
      if (result.success) {
        setVehicles(result.data.vehicles);
        setFleetKPIs(result.data.kpis);
        setChargingPattern(result.data.homeChargingIncrease);
        setChargingOverTime(result.data.chargingOverTime);
        setBatteryDistribution(result.data.batteryDistribution);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch vehicle data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filtersLoaded, apiFiltersKey]); // Use stable key instead of individual values

  // ============================================================================
  // EVENT HANDLERS - STABILIZED
  // ============================================================================

  const handleVehicleFiltersChange = useCallback(
    (newFilters: Partial<OverviewFilterType>) => {
      // console.log("Filter change received:", newFilters);

      setVehicleFilters((prevFilters) => {
        const updatedFilters = {
          ...prevFilters,
          ...newFilters,
        };

        // Ensure dateRange is properly handled
        if (newFilters.dateRange !== undefined) {
          updatedFilters.dateRange = newFilters.dateRange;
        }

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
    return vehicles.filter((vehicle) => {
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

      // Main vehicle filters from OverviewFilter component (these also affect API)
      const matchesModel =
        vehicleFilters.selectedModels.length === 0 ||
        vehicleFilters.selectedModels.includes(vehicle.MODEL);

      const matchesBatteryType =
        vehicleFilters.selectedBatteryTypes.length === 0 ||
        vehicleFilters.selectedBatteryTypes.includes(vehicle.BATTERY_TYPE);

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
  }, [vehicles, searchFilters, vehicleFilters]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // ============================================================================
  // EFFECTS - FIXED TO PREVENT INFINITE LOOPS
  // ============================================================================

  // STEP 1: Load filter combinations on mount only
  useEffect(() => {
    if (!filterCombinationsLoadedRef.current) {
      fetchFilterCombinations();
    }
  }, []); // Empty dependency array - run only once

  // STEP 2: Fetch vehicle data when filters change (using stable key)
  useEffect(() => {
    if (filtersLoaded && !loading) {
      console.log("API filters changed, fetching vehicle data...");
      fetchVehicleData();
    }
  }, [filtersLoaded, apiFiltersKey]); // Use stable key instead of individual filter values

  // STEP 3: Reset pagination when display filters change
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

  const MetricsFilterSection = () => (
    <div className="space-y-6">
      <OverviewFilter
        onFiltersChange={handleVehicleFiltersChange}
        loading={!filtersLoaded}
        initialFilters={vehicleFilters}
        filterCombinations={filterCombinations}
      />

      {loading ? (
        <GraphsLoadingState />
      ) : (
        fleetKPIs && <KPICardsGrid fleetKPIs={fleetKPIs} />
      )}
    </div>
  );

  const VehicleDisplaySection = () => (
    <div className="space-y-6">
      <div className="relative">
        <VehicleCards
          vehicles={paginatedVehicles}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalVehicles={filteredVehicles.length}
          onPageChange={setCurrentPage}
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
