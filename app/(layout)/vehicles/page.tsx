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
// TYPE DEFINITIONS
// ============================================================================
export interface Vehicle {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  TBOX_ID?: string;
  TBOX_IMEI_NO?: string;
  BATTERY_TYPE_ID: string;
  BATTERY_TYPE_NAME?: string;
  CUSTOMER_ID?: string;
  CUSTOMER_NAME?: string;
  DEALER_ID?: string;
  DEALER_NAME?: string;
  MODEL?: string;
  STATUS: string;
  REGION?: string;
  CREATED_DATE?: Date;
  LAST_UPDATED?: Date;
}

// Extended Vehicle type for VehicleCards component compatibility
interface ExtendedVehicle extends Vehicle {
  VIN: string; // Alias for CHASSIS_NUMBER
  BATTERY_TYPE: string; // Now will contain the name instead of ID
}

export interface FleetKPIs {
  TOTAL_VEHICLES: number;
  TOTAL_DEALERS: number;
  TOTAL_SOLD_VEHICLES: number;
  TOTAL_INSTOCK_VEHICLES: number;
}

export interface FilterCombination {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  BATTERY_TYPE_ID: string;
  BATTERY_TYPE_NAME?: string;
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  DEALER_NAME?: string;
  STATUS: string;
  MODEL?: string;
}

export interface SearchFilters {
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
          <span className="text-slate-300">Loading vehicle data...</span>
        </div>
      </div>
    </div>
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
// STATUS LOGIC
// ============================================================================

// Derive actual vehicle status based on customer and dealer assignment
const deriveVehicleStatus = (
  customerId?: string,
  dealerId?: string
): string => {
  const hasCustomer = customerId && customerId.trim() !== "";
  const hasDealer = dealerId && dealerId.trim() !== "";

  if (hasCustomer && hasDealer) {
    return "SOLD";
  } else if (!hasCustomer && !hasDealer) {
    return "FACTORY_INSTOCK";
  } else if (hasCustomer && !hasDealer) {
    return "CUSTOMER_RESERVED";
  } else if (!hasCustomer && hasDealer) {
    return "DEALER_INSTOCK";
  }

  return "UNKNOWN";
};

// ============================================================================
// SQL QUERY BUILDER - SINGLE QUERY FOR ALL DATA
// ============================================================================

const buildAllVehicleDataQuery = () => {
  return `
    WITH ranked_vehicles AS (
      SELECT 
        dv.VEHICLE_ID,
        dv.CHASSIS_NUMBER,
        dv.TBOX_ID,
        dv.TBOX_ID as TBOX_IMEI_NO,
        dv.BATTERY_TYPE_ID,
        bt.NAME AS BATTERY_TYPE_NAME,
        lv.CUSTOMER_ID,
        c.SURNAME AS CUSTOMER_NAME,
        lv.DEALER_ID,
        d.DEALER_NAME,
        CONCAT(
          COALESCE(CAST(vm.BRAND AS VARCHAR), ''), ' ', 
          COALESCE(CAST(vm.MODEL_NAME AS VARCHAR), ''), ' ', 
          COALESCE(CAST(vm.COLOR_NAME AS VARCHAR), '')
        ) AS MODEL,                                                 
        -- Derive status based on assignments
        CASE 
          WHEN lv.CUSTOMER_ID IS NOT NULL AND lv.CUSTOMER_ID != '' AND lv.DEALER_ID IS NOT NULL AND lv.DEALER_ID != '' THEN 'SOLD'
          WHEN (lv.CUSTOMER_ID IS NULL OR lv.CUSTOMER_ID = '') AND (lv.DEALER_ID IS NULL OR lv.DEALER_ID = '') THEN 'FACTORY_INSTOCK'
          WHEN lv.CUSTOMER_ID IS NOT NULL AND lv.CUSTOMER_ID != '' AND (lv.DEALER_ID IS NULL OR lv.DEALER_ID = '') THEN 'CUSTOMER_RESERVED'
          WHEN (lv.CUSTOMER_ID IS NULL OR lv.CUSTOMER_ID = '') AND lv.DEALER_ID IS NOT NULL AND lv.DEALER_ID != '' THEN 'DEALER_INSTOCK'
          ELSE 'UNKNOWN'
        END AS STATUS,
        dv.CREATED_AT,
        dv.UPDATED_AT,
        ROW_NUMBER() OVER (PARTITION BY dv.VEHICLE_ID, dv.CHASSIS_NUMBER ORDER BY dv.VEHICLE_ID) AS rn
      FROM ADHOC.MASTER_DATA.DIM_VEHICLE dv
      LEFT JOIN ADHOC.MASTER_DATA.LOOKUP_VIEW lv ON dv.VEHICLE_ID = lv.VEHICLE_ID
      LEFT JOIN ADHOC.MASTER_DATA.DIM_BATTERY_TYPE bt ON dv.BATTERY_TYPE_ID = bt.BATTERY_TYPE_ID
      LEFT JOIN ADHOC.MASTER_DATA.DIM_CUSTOMERS c ON lv.CUSTOMER_ID = c.CUSTOMER_ID
      LEFT JOIN ADHOC.MASTER_DATA.DIM_DEALER d ON lv.DEALER_ID = d.DEALER_ID
      LEFT JOIN ADHOC.MASTER_DATA.DIM_VEHICLE_MODEL vm ON dv.VEHICLE_MODEL_COLOR_ID = vm.COLOR_ID
      WHERE dv.VEHICLE_ID IS NOT NULL
        AND dv.ACTIVE = 1
        AND dv.DELETED = 0
    )
    SELECT *
    FROM ranked_vehicles
    WHERE rn = 1
    ORDER BY VEHICLE_ID;
  `;
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const VehicleOverviewPage: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // All vehicle data (fetched once)
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Filter state
  const [vehicleFilters, setVehicleFilters] =
    useState<SimpleOverviewFilterType>({
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedBatteryTypeNames: [],
      selectedStatuses: [],
      customerTypes: [],
      dealerIds: [],
      dealerNames: [],
      vehicleIdSearch: "",
      chassisNumberSearch: "",
      tboxIdSearch: "",
      dealerIdSearch: "",
    });

  // Additional search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    customerIdSearch: "",
    statusFilter: "all",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Use ref to prevent multiple fetches
  const dataFetchedRef = useRef(false);

  // ============================================================================
  // DATA FETCHING - SINGLE FETCH
  // ============================================================================

  const fetchAllVehicleData = useCallback(async () => {
    if (dataFetchedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching all vehicle data...");

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: buildAllVehicleDataQuery(),
          params: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Vehicle data loaded:", data.length, "records");

      // Transform vehicle data
      const transformedVehicles: Vehicle[] = data.map((item: any) => ({
        VEHICLE_ID: item.VEHICLE_ID,
        CHASSIS_NUMBER: item.CHASSIS_NUMBER,
        TBOX_ID: item.TBOX_ID,
        TBOX_IMEI_NO: item.TBOX_IMEI_NO,
        BATTERY_TYPE_ID: item.BATTERY_TYPE_ID,
        BATTERY_TYPE_NAME: item.BATTERY_TYPE_NAME,
        CUSTOMER_ID: item.CUSTOMER_ID,
        CUSTOMER_NAME: item.CUSTOMER_NAME,
        DEALER_ID: item.DEALER_ID,
        DEALER_NAME: item.DEALER_NAME,
        MODEL: item.MODEL,
        STATUS: item.STATUS,
        REGION: item.REGION,
        CREATED_DATE: item.CREATED_AT ? new Date(item.CREATED_AT) : undefined,
        LAST_UPDATED: item.UPDATED_AT ? new Date(item.UPDATED_AT) : undefined,
      }));

      setAllVehicles(transformedVehicles);
      setDataLoaded(true);
      dataFetchedRef.current = true;

      console.log("Data transformation complete:", transformedVehicles.length);
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
  }, []);

  // ============================================================================
  // LOCAL DATA PROCESSING - FILTERING AND KPIS
  // ============================================================================

  // Generate filter combinations from all data
  const filterCombinations = useMemo((): FilterCombination[] => {
    return allVehicles.map((vehicle) => ({
      VEHICLE_ID: vehicle.VEHICLE_ID,
      CHASSIS_NUMBER: vehicle.CHASSIS_NUMBER,
      BATTERY_TYPE_ID: vehicle.BATTERY_TYPE_ID,
      BATTERY_TYPE_NAME: vehicle.BATTERY_TYPE_NAME,
      CUSTOMER_ID: vehicle.CUSTOMER_ID,
      DEALER_ID: vehicle.DEALER_ID,
      DEALER_NAME: vehicle.DEALER_NAME,
      STATUS: vehicle.STATUS,
      MODEL: vehicle.MODEL,
    }));
  }, [allVehicles]);

  // Apply main filters to get base filtered dataset
  const mainFilteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      // Model filter
      const matchesModel =
        vehicleFilters.selectedModels.length === 0 ||
        (vehicle.MODEL &&
          vehicleFilters.selectedModels.includes(vehicle.MODEL));

      // Battery type filter
      const matchesBatteryType =
        vehicleFilters.selectedBatteryTypes.length === 0 ||
        vehicleFilters.selectedBatteryTypes.includes(vehicle.BATTERY_TYPE_ID);

      // Status filter
      const matchesStatus =
        vehicleFilters.selectedStatuses.length === 0 ||
        vehicleFilters.selectedStatuses.includes(vehicle.STATUS);

      // Customer type filter
      const matchesCustomerType =
        vehicleFilters.customerTypes.length === 0 ||
        (vehicle.CUSTOMER_ID &&
          vehicleFilters.customerTypes.includes(vehicle.CUSTOMER_ID));

      // Dealer filter
      const matchesDealer =
        vehicleFilters.dealerIds.length === 0 ||
        (vehicle.DEALER_ID &&
          vehicleFilters.dealerIds.includes(vehicle.DEALER_ID));

      return (
        matchesModel &&
        matchesBatteryType &&
        matchesStatus &&
        matchesCustomerType &&
        matchesDealer
      );
    });
  }, [allVehicles, vehicleFilters]);

  // Transform vehicles for VehicleCards component compatibility
  const extendedVehicles = useMemo((): ExtendedVehicle[] => {
    return mainFilteredVehicles.map((vehicle) => ({
      ...vehicle,
      VIN: vehicle.CHASSIS_NUMBER, // Map CHASSIS_NUMBER to VIN
      BATTERY_TYPE: vehicle.BATTERY_TYPE_NAME || vehicle.BATTERY_TYPE_ID, // Use name if available, fallback to ID
    }));
  }, [mainFilteredVehicles]);

  // Apply display/search filters
  const displayFilteredVehicles = useMemo(() => {
    return extendedVehicles.filter((vehicle) => {
      // General search across multiple fields
      const matchesGeneralSearch =
        !searchFilters.searchTerm ||
        [
          vehicle.VEHICLE_ID,
          vehicle.VIN,
          vehicle.MODEL,
          vehicle.CUSTOMER_ID || "",
          vehicle.CUSTOMER_NAME || "",
          vehicle.DEALER_NAME || "",
          vehicle.TBOX_ID || "",
        ].some((field) =>
          field.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())
        );

      // Specific field searches from filter component
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

      const matchesTboxId =
        !vehicleFilters.tboxIdSearch ||
        (vehicle.TBOX_ID &&
          vehicle.TBOX_ID.toLowerCase().includes(
            vehicleFilters.tboxIdSearch.toLowerCase()
          ));

      const matchesDealerId =
        !vehicleFilters.dealerIdSearch ||
        (vehicle.DEALER_ID &&
          vehicle.DEALER_ID.toLowerCase().includes(
            vehicleFilters.dealerIdSearch.toLowerCase()
          ));

      // Additional search filters
      const matchesCustomerId =
        !searchFilters.customerIdSearch ||
        (vehicle.CUSTOMER_ID &&
          vehicle.CUSTOMER_ID.toLowerCase().includes(
            searchFilters.customerIdSearch.toLowerCase()
          ));

      const matchesStatusFilter =
        searchFilters.statusFilter === "all" ||
        vehicle.STATUS === searchFilters.statusFilter;

      return (
        matchesGeneralSearch &&
        matchesVehicleId &&
        matchesChassisNumber &&
        matchesTboxId &&
        matchesDealerId &&
        matchesCustomerId &&
        matchesStatusFilter
      );
    });
  }, [extendedVehicles, searchFilters, vehicleFilters]);

  // Calculate KPIs from filtered data
  const fleetKPIs = useMemo((): FleetKPIs => {
    const vehicles = mainFilteredVehicles;

    const uniqueDealers = new Set(
      vehicles.map((v) => v.DEALER_ID).filter((id) => id && id.trim() !== "")
    ).size;

    const soldVehicles = vehicles.filter((v) => v.STATUS === "SOLD").length;

    const instockVehicles = vehicles.filter(
      (v) => v.STATUS === "FACTORY_INSTOCK" || v.STATUS === "DEALER_INSTOCK"
    ).length;

    return {
      TOTAL_VEHICLES: vehicles.length,
      TOTAL_DEALERS: uniqueDealers,
      TOTAL_SOLD_VEHICLES: soldVehicles,
      TOTAL_INSTOCK_VEHICLES: instockVehicles,
    };
  }, [mainFilteredVehicles]);

  // Pagination
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayFilteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [displayFilteredVehicles, currentPage]);

  const totalPages = Math.ceil(displayFilteredVehicles.length / itemsPerPage);

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
  // EFFECTS
  // ============================================================================

  // Load all data on mount
  useEffect(() => {
    if (!dataFetchedRef.current) {
      fetchAllVehicleData();
    }
  }, [fetchAllVehicleData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    vehicleFilters.selectedModels,
    vehicleFilters.selectedBatteryTypes,
    vehicleFilters.selectedStatuses,
    vehicleFilters.customerTypes,
    vehicleFilters.dealerIds,
    vehicleFilters.vehicleIdSearch,
    vehicleFilters.chassisNumberSearch,
    vehicleFilters.tboxIdSearch,
    vehicleFilters.dealerIdSearch,
    searchFilters.searchTerm,
    searchFilters.customerIdSearch,
    searchFilters.statusFilter,
  ]);

  // ============================================================================
  // RENDER CONDITIONS
  // ============================================================================

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchAllVehicleData} />;
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const MetricsFilterSection = () => (
    <div className="space-y-6">
      <SimpleOverviewFilter
        onFiltersChange={handleVehicleFiltersChange}
        loading={false} // Data is already loaded
        initialFilters={vehicleFilters}
        filterCombinations={filterCombinations}
      />

      <KPICardsGrid fleetKPIs={fleetKPIs} loading={false} />
    </div>
  );

  const VehicleDisplaySection = () => (
    <div className="space-y-6">
      <div className="relative">
        <VehicleGrid
          vehicles={paginatedVehicles}
          allVehicles={displayFilteredVehicles}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalVehicles={displayFilteredVehicles.length}
          onPageChange={setCurrentPage}
          loading={false} // Data processing is local, no loading needed
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
            Get a comprehensive view of your electric vehicle fleet. All data
            loaded locally for instant filtering.
          </p>
        </div>

        {/* Data Summary */}
        {dataLoaded && (
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-400 text-sm">
                {allVehicles.length.toLocaleString()} vehicles loaded • Instant
                filtering enabled
              </span>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        <MetricsFilterSection />

        {/* Vehicle Display Section */}
        <VehicleDisplaySection />
      </div>
    </div>
  );
};

export default VehicleOverviewPage;
