"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  type OverviewFilter as OverviewFilterType,
  type DisplayFilters,
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

interface FilterState {
  vehicleModel: string;
  batteryType: string;
  region: string;
}

interface SearchFilters {
  searchTerm: string;
  customerIdSearch: string;
  statusFilter: string;
}

interface AdvancedSearchBarProps {
  searchFilters: SearchFilters;
  onSearchFiltersChange: (filters: SearchFilters) => void;
  vehicleCount: number;
  filteredCount: number;
}

interface LoadingStateProps {}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

interface VehicleDisplaySectionProps {
  searchFilters: SearchFilters;
  onSearchFiltersChange: (filters: SearchFilters) => void;
  vehicleCount: number;
  filteredCount: number;
  paginatedVehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalVehicles: number;
  onPageChange: (page: number) => void;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Loading State Component
 * Displays a loading spinner with message while data is being fetched
 */
const LoadingState: React.FC<LoadingStateProps> = () => (
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

/**
 * Error State Component
 * Displays error message with retry functionality
 */
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
// METRICS SECTION COMPONENTS (AFFECTS API CALLS & KPIs)
// ============================================================================

/**
 * Metrics Filter Section Component
 * Contains filters that affect API calls and KPI calculations
 */
const MetricsFilterSection: React.FC<{
  onFiltersChange: (filters: OverviewFilterType) => void;
  onDisplayFiltersChange: (filters: DisplayFilters) => void;
  loading: boolean;
  fleetKPIs: FleetKPIs | null;
}> = ({ onFiltersChange, onDisplayFiltersChange, loading, fleetKPIs }) => (
  <div className="space-y-6">
    {/* Main Vehicle Filters Component (affects API and KPIs) */}
    <OverviewFilter
      onFiltersChange={onFiltersChange}
      onDisplayFiltersChange={onDisplayFiltersChange}
      loading={loading}
    />

    {/* KPI Cards Grid */}
    {fleetKPIs && <KPICardsGrid fleetKPIs={fleetKPIs} />}
  </div>
);

// ============================================================================
// VEHICLE DISPLAY SECTION COMPONENTS (DISPLAY ONLY - NO API IMPACT)
// ============================================================================

/**
 * Advanced Search Bar Component
 * Provides comprehensive search functionality for vehicle filtering
 * Note: This component ONLY affects card display, NOT metrics or API calls
 */
const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  searchFilters,
  onSearchFiltersChange,
  vehicleCount,
  filteredCount,
}) => {
  // Handle input changes for search fields
  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    onSearchFiltersChange({
      ...searchFilters,
      [field]: value,
    });
  };

  // Clear individual search field
  const clearSearch = (field: keyof SearchFilters) => {
    onSearchFiltersChange({
      ...searchFilters,
      [field]: field === "statusFilter" ? "all" : "",
    });
  };

  // Clear all search fields
  const clearAllSearches = () => {
    onSearchFiltersChange({
      searchTerm: "",
      customerIdSearch: "",
      statusFilter: "all",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchFilters.searchTerm ||
    searchFilters.customerIdSearch ||
    searchFilters.statusFilter !== "all";

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-400" />
              Additional Search & Filters
            </CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearAllSearches}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-slate-100 border-amber-500/30 hover:border-amber-400"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        {filteredCount !== vehicleCount && (
          <div className="flex items-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-amber-400"></div>
            <p className="text-sm text-amber-400 font-medium">
              Showing {filteredCount} of {vehicleCount} vehicles in cards below
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* General Search Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            General Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search across all fields..."
              value={searchFilters.searchTerm}
              onChange={(e) => handleInputChange("searchTerm", e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-amber-400/50"
            />
            {searchFilters.searchTerm && (
              <Button
                onClick={() => clearSearch("searchTerm")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600/50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Specific Search Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer ID Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Customer ID
            </label>
            <div className="relative">
              <Input
                placeholder="Search by Customer ID..."
                value={searchFilters.customerIdSearch}
                onChange={(e) =>
                  handleInputChange("customerIdSearch", e.target.value)
                }
                className="bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-amber-400/50"
              />
              {searchFilters.customerIdSearch && (
                <Button
                  onClick={() => clearSearch("customerIdSearch")}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Status Filter
            </label>
            <Select
              value={searchFilters.statusFilter}
              onValueChange={(value) =>
                handleInputChange("statusFilter", value)
              }
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-100">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="CHARGING">Charging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Vehicle Display Section Component
 * Groups additional search and vehicle cards together to show clear relationship
 * This entire section is for display purposes only and does NOT affect metrics
 */
const VehicleDisplaySection: React.FC<VehicleDisplaySectionProps> = ({
  searchFilters,
  onSearchFiltersChange,
  vehicleCount,
  filteredCount,
  paginatedVehicles,
  currentPage,
  totalPages,
  itemsPerPage,
  totalVehicles,
  onPageChange,
}) => (
  <div className="space-y-6">
    {/* Section Header */}
    {/* <div className="text-center space-y-2">
      <p className="text-sm text-slate-400">
        Additional search filters for vehicle cards below -{" "}
        <span className="text-amber-400 font-medium">
          does NOT affect metrics above
        </span>
      </p>
    </div> */}

    {/* Advanced Search Bar */}
    {/* <AdvancedSearchBar
      searchFilters={searchFilters}
      onSearchFiltersChange={onSearchFiltersChange}
      vehicleCount={vehicleCount}
      filteredCount={filteredCount}
    /> */}

    {/* Vehicle Cards with visual connection indicator */}
    <div className="relative">
      {/* Vehicle Cards */}
      <VehicleCards
        vehicles={paginatedVehicles}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalVehicles={totalVehicles}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Vehicle Overview Page Component
 * Main dashboard component that orchestrates all vehicle-related data and UI
 */
const VehicleOverviewPage: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetKPIs, setFleetKPIs] = useState<FleetKPIs | null>(null);
  const [chargingPattern, setChargingPattern] = useState<any[]>([]);
  const [chargingOverTime, setChargingOverTime] = useState<any[]>([]);
  const [batteryDistribution, setBatteryDistribution] = useState<any[]>([]);

  // Loading and Error State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State - Main filters from OverviewFilter component (affects API calls)
  const [vehicleFilters, setVehicleFilters] = useState<OverviewFilterType>({
    selectedModels: [],
    selectedBatteryTypes: [],
    selectedStatuses: [],
    customerTypes: [],
    aggregation: "monthly",
  });

  // Display filters from OverviewFilter component (affects only card display)
  const [displayFilters, setDisplayFilters] = useState<DisplayFilters>({
    vehicleIdSearch: "",
    vinSearch: "",
  });

  // Additional Search Filter State (affects only card display)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    customerIdSearch: "",
    statusFilter: "all",
  });

  // Legacy API Filter State (for backward compatibility)
  const [filters, setFilters] = useState<FilterState>({
    vehicleModel: "all",
    batteryType: "all",
    region: "all",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch vehicle data from API
   * Combines OverviewFilter with legacy filter system
   * Only dateRange, selectedModels, and selectedBatteryTypes affect data fetching
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Default date range
      params.append("dateRange", "30");

      // Map selectedModels to vehicleModel parameter (affects API)
      if (vehicleFilters.selectedModels.length === 1) {
        params.append("vehicleModel", vehicleFilters.selectedModels[0]);
      } else {
        params.append("vehicleModel", filters.vehicleModel);
      }

      // Map selectedBatteryTypes to batteryType parameter (affects API)
      if (vehicleFilters.selectedBatteryTypes.length === 1) {
        params.append("batteryType", vehicleFilters.selectedBatteryTypes[0]);
      } else {
        params.append("batteryType", filters.batteryType);
      }

      // Use existing region filter
      params.append("region", filters.region);

      const response = await fetch(`/api/vehicles?${params}`);
      const result = await response.json();

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
      setError("Failed to fetch data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    vehicleFilters.selectedModels,
    vehicleFilters.selectedBatteryTypes,
    vehicleFilters.aggregation,
    filters.vehicleModel,
    filters.batteryType,
    filters.region,
  ]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle changes to main vehicle filters (affects API calls)
   * Only dateRange, selectedModels, and selectedBatteryTypes trigger API calls
   */
  const handleVehicleFiltersChange = (newFilters: OverviewFilterType) => {
    setVehicleFilters(newFilters);
  };

  /**
   * Handle changes to display filters from OverviewFilter (affects only card display)
   * vehicleIdSearch and vinSearch are display-only filters
   */
  const handleDisplayFiltersChange = (newFilters: DisplayFilters) => {
    setDisplayFilters(newFilters);
  };

  /**
   * Handle changes to additional search filters (affects only card display)
   */
  const handleSearchFiltersChange = (newFilters: SearchFilters) => {
    setSearchFilters(newFilters);
  };

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  /**
   * Filter vehicles based on all search criteria
   * This filtering only affects the display of vehicle cards, not KPIs or API calls
   */
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // General search across multiple fields
      const matchesGeneralSearch =
        !searchFilters.searchTerm ||
        vehicle.VEHICLE_ID.toLowerCase().includes(
          searchFilters.searchTerm.toLowerCase()
        ) ||
        vehicle.VIN.toLowerCase().includes(
          searchFilters.searchTerm.toLowerCase()
        ) ||
        vehicle.MODEL.toLowerCase().includes(
          searchFilters.searchTerm.toLowerCase()
        ) ||
        (vehicle.CUSTOMER_ID &&
          vehicle.CUSTOMER_ID.toLowerCase().includes(
            searchFilters.searchTerm.toLowerCase()
          ));

      // Display filters from OverviewFilter component
      const matchesVehicleId =
        !displayFilters.vehicleIdSearch ||
        vehicle.VEHICLE_ID.toLowerCase().includes(
          displayFilters.vehicleIdSearch.toLowerCase()
        );

      const matchesVin =
        !displayFilters.vinSearch ||
        vehicle.VIN.toLowerCase().includes(
          displayFilters.vinSearch.toLowerCase()
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

      // Main vehicle filters from OverviewFilter component
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
        matchesVin &&
        matchesCustomerId &&
        matchesStatus &&
        matchesModel &&
        matchesBatteryType &&
        matchesMainStatus
      );
    });
  }, [vehicles, searchFilters, displayFilters, vehicleFilters]);

  /**
   * Get paginated vehicles for current page
   */
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch data when API-affecting filters change
   * Only selectedModels and selectedBatteryTypes from vehicleFilters affect the API
   */
  useEffect(() => {
    fetchData();
  }, [
    JSON.stringify(vehicleFilters.selectedModels),
    JSON.stringify(vehicleFilters.selectedBatteryTypes),
    vehicleFilters.aggregation,
    filters.vehicleModel,
    filters.batteryType,
    filters.region,
  ]);

  /**
   * Reset pagination when any filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [vehicleFilters, displayFilters, searchFilters]);

  // ============================================================================
  // RENDER CONDITIONS
  // ============================================================================

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

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

        {/* ===== METRICS SECTION ===== */}
        <MetricsFilterSection
          onFiltersChange={handleVehicleFiltersChange}
          onDisplayFiltersChange={handleDisplayFiltersChange}
          loading={loading}
          fleetKPIs={fleetKPIs}
        />

        {/* ===== VEHICLE DISPLAY SECTION ===== */}
        <VehicleDisplaySection
          searchFilters={searchFilters}
          onSearchFiltersChange={handleSearchFiltersChange}
          vehicleCount={vehicles.length}
          filteredCount={filteredVehicles.length}
          paginatedVehicles={paginatedVehicles}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalVehicles={filteredVehicles.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default VehicleOverviewPage;
