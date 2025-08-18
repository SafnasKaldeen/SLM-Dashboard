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
  Battery,
  TrendingUp,
  BarChart3,
  Route,
  DollarSign,
  Activity,
  Zap,
  AlertTriangle,
  Search,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";

import VehicleTable from "@/components/vehicles/VehicleTable";
import KPICardsGrid from "@/components/vehicles/KPICardsGrid";
import ChargingChart from "@/components/vehicles/ChargingChart";
import HomeChargingChart from "@/components/vehicles/HomeChargingChart";
import BatteryDistributionChart from "@/components/vehicles/BatteryDistributionChart";
import {
  VehicleFilters,
  type VehicleFilters as VehicleFiltersType,
} from "@/components/vehicles/vehicle-filters";

// Types
interface Vehicle {
  VEHICLE_ID: string;
  VIN: string;
  MODEL: string;
  BATTERY_TYPE: string;
  STATUS: string;
  REGION: string;
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
  searchTerm: string;
  vehicleModel: string;
  batteryType: string;
  region: string;
  statusFilter: string;
}

// Component: Loading State
const LoadingState = () => (
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

// Component: Error State
const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
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

// Component: Filters
const Filters = ({
  filters,
  setFilters,
  onRefresh,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onRefresh: () => void;
}) => (
  <Card className="bg-slate-900/50 border-slate-700/50">
    <CardContent className="p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search vehicles..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="w-64 bg-slate-800 border-slate-600"
          />
        </div>

        <Select
          value={filters.vehicleModel}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, vehicleModel: value }))
          }
        >
          <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
            <SelectValue placeholder="Vehicle Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="Tesla Model 3">Tesla Model 3</SelectItem>
            <SelectItem value="Tesla Model Y">Tesla Model Y</SelectItem>
            <SelectItem value="BMW iX">BMW iX</SelectItem>
            <SelectItem value="Audi e-tron">Audi e-tron</SelectItem>
            <SelectItem value="Mercedes EQS">Mercedes EQS</SelectItem>
            <SelectItem value="Nissan Leaf">Nissan Leaf</SelectItem>
            <SelectItem value="Hyundai Ioniq">Hyundai Ioniq</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.batteryType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, batteryType: value }))
          }
        >
          <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
            <SelectValue placeholder="Battery Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Battery Types</SelectItem>
            <SelectItem value="Lithium-Ion">Lithium-Ion</SelectItem>
            <SelectItem value="LiFePO4">LiFePO4</SelectItem>
            <SelectItem value="Solid State">Solid State</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.region}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, region: value }))
          }
        >
          <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="North">North</SelectItem>
            <SelectItem value="South">South</SelectItem>
            <SelectItem value="East">East</SelectItem>
            <SelectItem value="West">West</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.statusFilter}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, statusFilter: value }))
          }
        >
          <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </CardContent>
  </Card>
);

const VehicleOverviewPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetKPIs, setFleetKPIs] = useState<FleetKPIs | null>(null);
  const [chargingPattern, setChargingPattern] = useState<any[]>([]);
  const [chargingOverTime, setChargingOverTime] = useState<any[]>([]);
  const [batteryDistribution, setBatteryDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main filters from VehicleFilters component
  const [vehicleFilters, setVehicleFilters] = useState<VehicleFiltersType>({
    selectedModels: [],
    selectedBatteryTypes: [],
    selectedStatuses: [],
    customerTypes: [],
    aggregation: "monthly",
  });

  // Filters state for search and status (keeping existing structure)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    vehicleModel: "all",
    batteryType: "all",
    region: "all",
    statusFilter: "all",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Convert VehicleFilters to the existing API format
      params.append("dateRange", "30"); // Default to 30 days, can be updated based on vehicleFilters.dateRange

      // Map selectedModels to vehicleModel parameter
      if (vehicleFilters.selectedModels.length === 1) {
        params.append("vehicleModel", vehicleFilters.selectedModels[0]);
      } else {
        params.append("vehicleModel", filters.vehicleModel);
      }

      // Map selectedBatteryTypes to batteryType parameter
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

  // Handle vehicle filters change
  const handleVehicleFiltersChange = (newFilters: VehicleFiltersType) => {
    setVehicleFilters(newFilters);
  };

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

  // Filter and search vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.VEHICLE_ID.toLowerCase().includes(
          filters.searchTerm.toLowerCase()
        ) ||
        vehicle.VIN.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        vehicle.MODEL.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus =
        filters.statusFilter === "all" ||
        vehicle.STATUS === filters.statusFilter;

      // Vehicle filters - model filter
      const matchesModel =
        vehicleFilters.selectedModels.length === 0 ||
        vehicleFilters.selectedModels.includes(vehicle.MODEL);

      // Vehicle filters - battery type filter
      const matchesBatteryType =
        vehicleFilters.selectedBatteryTypes.length === 0 ||
        vehicleFilters.selectedBatteryTypes.includes(vehicle.BATTERY_TYPE);

      // Vehicle filters - status filter (from main filters)
      const matchesMainStatus =
        vehicleFilters.selectedStatuses.length === 0 ||
        vehicleFilters.selectedStatuses.includes(vehicle.STATUS);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesModel &&
        matchesBatteryType &&
        matchesMainStatus
      );
    });
  }, [vehicles, filters.searchTerm, filters.statusFilter, vehicleFilters]);

  // Paginated vehicles
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [vehicleFilters, filters]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <Car className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              EV Fleet Analytics
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Vehicle Overview Dashboard
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Comprehensive analytics and insights for your electric vehicle fleet
          </p>
        </div>

        {/* Main Vehicle Filters Component */}
        <VehicleFilters
          onFiltersChange={handleVehicleFiltersChange}
          loading={loading}
        />

        {fleetKPIs && <KPICardsGrid fleetKPIs={fleetKPIs} />}

        <ChargingChart data={chargingOverTime} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HomeChargingChart data={chargingPattern} />
          <BatteryDistributionChart data={batteryDistribution} />
        </div>
      </div>
    </div>
  );
};

export default VehicleOverviewPage;
