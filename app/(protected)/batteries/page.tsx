"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Battery,
  RefreshCw,
  Activity,
  Gauge,
  ThermometerSun,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Minus,
  Download,
  Filter,
  X,
  Info,
  Loader2,
  Navigation,
  Home,
  Package,
  HelpCircle,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface BatteryTelemetry {
  bmsId: string;
  tboxId: string;
  vehicleId?: string;
  // Current readings
  batPercent: number;
  batVolt: number;
  batCurrent: number;
  batTemp: number;
  batSOH: number;
  batCycleCount: number;
  batteryError: string;
  // Additional telemetry
  sideStandInfo: number;
  tboxMemsErrorFlag: number;
  brakeStatus: number;
  inverterError: string;
  throttlePercent: number;
  gearInformation: number;
  sysVersion: number;
  motorRPM: number;
  motorTemp: number;
  inverterTemp: number;
  tboxInternalBatVolt: number;
  // Calculated metrics
  totalDistanceTraveled: number;
  avgDistancePerCycle: number;
  // Location state
  lastKnownLocation:
    | "swapping_station"
    | "home_charging"
    | "in_scooter"
    | "unknown";
  // Metadata
  lastUpdate: Date;
  dataAge: number;
  status: "online" | "offline" | "error" | "stale";
  isStale: boolean;
}

interface BatteryKPIs {
  TOTAL_BATTERIES: number;
  ONLINE_BATTERIES: number;
  HEALTHY_BATTERIES: number;
  NEEDS_ATTENTION: number;
  AVG_SOH: number;
  AVG_CHARGE: number;
  TOTAL_DISTANCE: number;
  AVG_CYCLES: number;
}

interface FilterState {
  searchTerm: string;
  selectedSOHRanges: string[];
  selectedChargeRanges: string[];
  selectedStatuses: string[];
  selectedLocations: string[];
  sohRange: string;
  chargeRange: string;
  status: string;
  sortBy: string;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateBatteryData = (): BatteryTelemetry[] => {
  const tboxIds = Array.from(
    { length: 30 },
    (_, i) => `86520906951${9300 + i}`
  );
  const locations: (
    | "swapping_station"
    | "home_charging"
    | "in_scooter"
    | "unknown"
  )[] = ["swapping_station", "home_charging", "in_scooter", "unknown"];

  return tboxIds.map((tboxId, i) => {
    const hoursOld = Math.random() * 48;
    const lastUpdate = new Date(Date.now() - hoursOld * 3600000);
    const dataAge = Math.floor((Date.now() - lastUpdate.getTime()) / 60000);
    const isStale = dataAge > 1440;
    const hasError = Math.random() > 0.9;
    const isOnline = dataAge < 30 && !isStale;

    const batCycleCount = Math.floor(100 + Math.random() * 400);
    const totalDistance = batCycleCount * (30 + Math.random() * 20);
    const avgDistancePerCycle = totalDistance / batCycleCount;

    return {
      bmsId: `BMS-${String(i + 1).padStart(4, "0")}`,
      tboxId,
      vehicleId: `VEH-${String(i + 1).padStart(4, "0")}`,
      batPercent: Math.floor(Math.random() * 100),
      batVolt: 48 + Math.random() * 10,
      batCurrent: (Math.random() - 0.5) * 20,
      batTemp: 20 + Math.random() * 25,
      batSOH: Math.floor(70 + Math.random() * 30),
      batCycleCount,
      batteryError: hasError ? "Error detected" : "",
      sideStandInfo: Math.floor(Math.random() * 2),
      tboxMemsErrorFlag: Math.floor(Math.random() * 2),
      brakeStatus: Math.floor(Math.random() * 2),
      inverterError: hasError && Math.random() > 0.5 ? "Inverter fault" : "",
      throttlePercent: Math.floor(Math.random() * 100),
      gearInformation: Math.floor(Math.random() * 4),
      sysVersion: 1,
      motorRPM: Math.floor(Math.random() * 5000),
      motorTemp: 25 + Math.random() * 30,
      inverterTemp: 25 + Math.random() * 35,
      tboxInternalBatVolt: 3.6 + Math.random() * 0.6,
      totalDistanceTraveled: Math.floor(totalDistance),
      avgDistancePerCycle: Math.floor(avgDistancePerCycle),
      lastKnownLocation:
        locations[Math.floor(Math.random() * locations.length)],
      lastUpdate,
      dataAge,
      isStale,
      status: hasError
        ? "error"
        : isStale
        ? "stale"
        : isOnline
        ? "online"
        : "offline",
    };
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "text-green-400 bg-green-500/10 border-green-500/20";
    case "offline":
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    case "stale":
      return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "error":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
};

const getLocationDisplayInfo = (location: string) => {
  switch (location) {
    case "swapping_station":
      return {
        label: "Swapping Station",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Icon: Package,
      };
    case "home_charging":
      return {
        label: "Home Charging",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
        Icon: Home,
      };
    case "in_scooter":
      return {
        label: "In Scooter",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        Icon: Navigation,
      };
    default:
      return {
        label: "Unknown",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        Icon: HelpCircle,
      };
  }
};

const getSOHColor = (soh: number) => {
  if (soh >= 90) return "text-green-400";
  if (soh >= 75) return "text-yellow-400";
  if (soh >= 60) return "text-orange-400";
  return "text-red-400";
};

const getSOHBgColor = (soh: number) => {
  if (soh >= 90) return "bg-green-500";
  if (soh >= 75) return "bg-yellow-500";
  if (soh >= 60) return "bg-orange-500";
  return "bg-red-500";
};

const formatDataAge = (minutes: number) => {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
};

const displayValue = (
  value: string | number | null | undefined,
  fallback: string = "N/A"
) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return fallback;
  }
  return String(value);
};

const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US").format(Math.floor(num));

const getStatusIcon = (status: string) => {
  switch (status) {
    case "online":
      return CheckCircle;
    case "error":
      return XCircle;
    case "stale":
      return AlertTriangle;
    default:
      return Clock;
  }
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

const KPICard = ({
  icon: Icon,
  label,
  value,
  description,
  color,
  loading = false,
}: any) => (
  <Card className="bg-slate-900/50 border-slate-700/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-300">
        {label}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-20 bg-slate-800 rounded animate-pulse"></div>
      ) : (
        <div className="text-2xl font-bold text-slate-100">{value}</div>
      )}
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </CardContent>
  </Card>
);

// ============================================================================
// BATTERY CARD COMPONENT
// ============================================================================

const BatteryCard = ({ battery }: { battery: BatteryTelemetry }) => {
  const StatusIcon = getStatusIcon(battery.status);
  const locationInfo = getLocationDisplayInfo(battery.lastKnownLocation);
  const LocationIcon = locationInfo.Icon;
  const isCharging = battery.batCurrent > 0;
  const isDischarging = battery.batCurrent < 0;

  return (
    <Card className="border-slate-800 hover:border-slate-700 transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0">
              <Battery className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-slate-200 font-semibold text-lg break-all">
                {battery.bmsId}
              </h3>
              <p className="text-slate-400 text-sm font-mono break-all">
                {battery.tboxId}
              </p>
              {battery.vehicleId && (
                <p className="text-slate-500 text-xs">{battery.vehicleId}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
            <Badge
              className={`${getStatusColor(
                battery.status
              )} flex items-center gap-1.5 px-2.5 py-1`}
            >
              <StatusIcon className="h-3 w-3" />
              {battery.status}
            </Badge>
            {battery.isStale && (
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                Stale Data
              </Badge>
            )}
          </div>
        </div>

        {/* Location & Data Age */}
        <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge
              className={`${locationInfo.color} flex items-center gap-1.5`}
            >
              <LocationIcon className="h-3 w-3" />
              {locationInfo.label}
            </Badge>
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDataAge(battery.dataAge)}
            </span>
          </div>
          {battery.isStale && (
            <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Data may be outdated (batch ingestion)
            </div>
          )}
        </div>

        {/* SOH - Main Health Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              State of Health (SOH)
            </span>
            <span
              className={`font-bold text-sm ${getSOHColor(battery.batSOH)}`}
            >
              {battery.batSOH}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getSOHBgColor(battery.batSOH)}`}
              style={{ width: `${battery.batSOH}%` }}
            />
          </div>
        </div>

        {/* Distance Metrics */}
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/30">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            Distance Metrics
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 text-xs">Total Distance</p>
              <p className="text-slate-200 text-sm font-medium">
                {formatNumber(battery.totalDistanceTraveled)} km
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Avg per Cycle</p>
              <p className="text-slate-200 text-sm font-medium">
                {battery.avgDistancePerCycle.toFixed(1)} km
              </p>
            </div>
          </div>
        </div>

        {/* Current Readings */}
        <div className="space-y-3 mb-4">
          {/* Charge Level */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300 text-sm">Charge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                  style={{ width: `${battery.batPercent}%` }}
                />
              </div>
              <span className="text-cyan-400 font-medium text-sm w-10 text-right">
                {battery.batPercent}%
              </span>
            </div>
          </div>

          {/* Voltage */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300 text-sm">Voltage</span>
            </div>
            <span className="text-slate-200 font-medium text-sm">
              {battery.batVolt.toFixed(1)}V
            </span>
          </div>

          {/* Current */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-slate-300 text-sm">Current</span>
            </div>
            <span
              className={`font-medium text-sm ${
                isCharging
                  ? "text-green-400"
                  : isDischarging
                  ? "text-orange-400"
                  : "text-slate-200"
              }`}
            >
              {battery.batCurrent.toFixed(1)}A
              {isCharging && <span className="text-xs ml-1">⚡</span>}
              {isDischarging && <span className="text-xs ml-1">↓</span>}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-4 w-4 text-orange-400" />
              <span className="text-slate-300 text-sm">Temperature</span>
            </div>
            <span
              className={`font-medium text-sm ${
                battery.batTemp > 40
                  ? "text-red-400"
                  : battery.batTemp > 35
                  ? "text-orange-400"
                  : "text-slate-200"
              }`}
            >
              {battery.batTemp.toFixed(1)}°C
            </span>
          </div>

          {/* Cycles */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Cycles</span>
            </div>
            <span className="text-slate-200 font-medium text-sm">
              {battery.batCycleCount}
            </span>
          </div>

          {/* Motor RPM */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-400" />
              <span className="text-slate-300 text-sm">Motor RPM</span>
            </div>
            <span className="text-slate-200 font-medium text-sm">
              {formatNumber(battery.motorRPM)}
            </span>
          </div>

          {/* Motor Temperature */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-4 w-4 text-red-400" />
              <span className="text-slate-300 text-sm">Motor Temp</span>
            </div>
            <span className="text-slate-200 font-medium text-sm">
              {battery.motorTemp.toFixed(1)}°C
            </span>
          </div>
        </div>

        {/* Alerts */}
        {(battery.batSOH < 75 ||
          battery.batTemp > 40 ||
          battery.status === "offline" ||
          battery.isStale ||
          battery.batteryError) && (
          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-400">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {battery.batSOH < 75 && <div>• Low SOH: {battery.batSOH}%</div>}
                {battery.batTemp > 40 && (
                  <div>• High temperature: {battery.batTemp.toFixed(1)}°C</div>
                )}
                {battery.status === "offline" && (
                  <div>• Offline for {formatDataAge(battery.dataAge)}</div>
                )}
                {battery.isStale && (
                  <div>• Stale data (batch ingestion delay)</div>
                )}
                {battery.batteryError && <div>• {battery.batteryError}</div>}
                {battery.inverterError && <div>• {battery.inverterError}</div>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// FILTER COMPONENT
// ============================================================================

const BatteryFilter = ({
  onFiltersChange,
  loading,
  filters,
  batteries,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableOptions = useMemo(() => {
    const sohRanges = [
      "Excellent (90-100%)",
      "Good (75-89%)",
      "Fair (60-74%)",
      "Poor (<60%)",
    ];
    const chargeRanges = ["High (70-100%)", "Medium (30-69%)", "Low (<30%)"];
    const statuses = ["online", "offline", "stale", "error"];
    const locations = [
      "swapping_station",
      "home_charging",
      "in_scooter",
      "unknown",
    ];

    return { sohRanges, chargeRanges, statuses, locations };
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      onFiltersChange({ ...filters, ...newFilters });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      searchTerm: "",
      selectedSOHRanges: [],
      selectedChargeRanges: [],
      selectedStatuses: [],
      selectedLocations: [],
      sohRange: "all",
      chargeRange: "all",
      status: "all",
      sortBy: "soh-asc",
    });
  }, [onFiltersChange]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedSOHRanges.length > 0) count++;
    if (filters.selectedChargeRanges.length > 0) count++;
    if (filters.selectedStatuses.length > 0) count++;
    if (filters.selectedLocations.length > 0) count++;
    return count;
  };

  const handleArrayFilterChange = (
    filterKey: string,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item: string) => item !== value);
    updateFilters({ [filterKey]: newArray });
  };

  const getLocationLabel = (loc: string) => {
    const info = getLocationDisplayInfo(loc);
    return info.label;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-200">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-300"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-300"
            >
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-slate-300">Search</Label>
          <Input
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            placeholder="Search by BMS ID, T-Box ID, Vehicle ID..."
            className="bg-slate-800 border-slate-600 text-slate-200"
          />
        </div>

        {/* Main Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label className="text-slate-300">Status</Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("selectedStatuses", value, true)
              }
              disabled={loading}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue
                  placeholder={
                    filters.selectedStatuses.length > 0
                      ? `${filters.selectedStatuses.length} selected`
                      : "Select status"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.statuses
                  .filter((s) => !filters.selectedStatuses.includes(s))
                  .map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.selectedStatuses.map((status: string) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleArrayFilterChange("selectedStatuses", status, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-slate-300">Location</Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("selectedLocations", value, true)
              }
              disabled={loading}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue
                  placeholder={
                    filters.selectedLocations.length > 0
                      ? `${filters.selectedLocations.length} selected`
                      : "Select location"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.locations
                  .filter((l) => !filters.selectedLocations.includes(l))
                  .map((location) => (
                    <SelectItem key={location} value={location}>
                      {getLocationLabel(location)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.selectedLocations.map((location: string) => (
                <Badge key={location} variant="secondary" className="text-xs">
                  {getLocationLabel(location)}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleArrayFilterChange(
                        "selectedLocations",
                        location,
                        false
                      )
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* SOH Range */}
          <div className="space-y-2">
            <Label className="text-slate-300">SOH Range</Label>
            <Select
              value={filters.sohRange}
              onValueChange={(value) => updateFilters({ sohRange: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SOH</SelectItem>
                <SelectItem value="excellent">Excellent (90-100%)</SelectItem>
                <SelectItem value="good">Good (75-89%)</SelectItem>
                <SelectItem value="fair">Fair (60-74%)</SelectItem>
                <SelectItem value="poor">Poor (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Charge Range */}
          <div className="space-y-2">
            <Label className="text-slate-300">Charge Level</Label>
            <Select
              value={filters.chargeRange}
              onValueChange={(value) => updateFilters({ chargeRange: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Charge Levels</SelectItem>
                <SelectItem value="high">High (70-100%)</SelectItem>
                <SelectItem value="medium">Medium (30-69%)</SelectItem>
                <SelectItem value="low">Low (&lt;30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort */}
        {isExpanded && (
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <Label className="text-slate-300">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soh-asc">SOH (Low to High)</SelectItem>
                <SelectItem value="soh-desc">SOH (High to Low)</SelectItem>
                <SelectItem value="charge-asc">Charge (Low to High)</SelectItem>
                <SelectItem value="charge-desc">
                  Charge (High to Low)
                </SelectItem>
                <SelectItem value="temp-desc">
                  Temperature (High to Low)
                </SelectItem>
                <SelectItem value="cycles-desc">
                  Cycles (High to Low)
                </SelectItem>
                <SelectItem value="distance-desc">
                  Distance (High to Low)
                </SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BatteryTelemetryDashboard = () => {
  const [batteries, setBatteries] = useState<BatteryTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedSOHRanges: [],
    selectedChargeRanges: [],
    selectedStatuses: [],
    selectedLocations: [],
    sohRange: "all",
    chargeRange: "all",
    status: "all",
    sortBy: "soh-asc",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setBatteries(generateBatteryData());
      setLastRefresh(new Date());
      setLoading(false);
    }, 500);
  };

  // Calculate KPIs
  const kpis: BatteryKPIs = useMemo(() => {
    return {
      TOTAL_BATTERIES: batteries.length,
      ONLINE_BATTERIES: batteries.filter((b) => b.status === "online").length,
      HEALTHY_BATTERIES: batteries.filter(
        (b) => b.batSOH >= 80 && !b.batteryError && !b.isStale
      ).length,
      NEEDS_ATTENTION: batteries.filter(
        (b) =>
          b.batSOH < 75 ||
          b.batteryError ||
          b.status === "offline" ||
          b.batTemp > 40 ||
          b.isStale
      ).length,
      AVG_SOH:
        batteries.length > 0
          ? Number(
              (
                batteries.reduce((sum, b) => sum + b.batSOH, 0) /
                batteries.length
              ).toFixed(1)
            )
          : 0,
      AVG_CHARGE:
        batteries.length > 0
          ? Number(
              (
                batteries.reduce((sum, b) => sum + b.batPercent, 0) /
                batteries.length
              ).toFixed(1)
            )
          : 0,
      TOTAL_DISTANCE: batteries.reduce(
        (sum, b) => sum + b.totalDistanceTraveled,
        0
      ),
      AVG_CYCLES:
        batteries.length > 0
          ? Math.floor(
              batteries.reduce((sum, b) => sum + b.batCycleCount, 0) /
                batteries.length
            )
          : 0,
    };
  }, [batteries]);

  // Filter and sort batteries
  const filteredBatteries = useMemo(() => {
    let filtered = batteries.filter((battery) => {
      const matchesSearch =
        battery.bmsId
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        battery.tboxId
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        (battery.vehicleId &&
          battery.vehicleId
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()));

      const matchesStatus =
        filters.selectedStatuses.length === 0 ||
        filters.selectedStatuses.includes(battery.status);

      const matchesLocation =
        filters.selectedLocations.length === 0 ||
        filters.selectedLocations.includes(battery.lastKnownLocation);

      const matchesSOH = (() => {
        if (filters.sohRange === "all") return true;
        const soh = battery.batSOH;
        switch (filters.sohRange) {
          case "excellent":
            return soh >= 90;
          case "good":
            return soh >= 75 && soh < 90;
          case "fair":
            return soh >= 60 && soh < 75;
          case "poor":
            return soh < 60;
          default:
            return true;
        }
      })();

      const matchesCharge = (() => {
        if (filters.chargeRange === "all") return true;
        const charge = battery.batPercent;
        switch (filters.chargeRange) {
          case "high":
            return charge >= 70;
          case "medium":
            return charge >= 30 && charge < 70;
          case "low":
            return charge < 30;
          default:
            return true;
        }
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation &&
        matchesSOH &&
        matchesCharge
      );
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "soh-asc":
          return a.batSOH - b.batSOH;
        case "soh-desc":
          return b.batSOH - a.batSOH;
        case "charge-asc":
          return a.batPercent - b.batPercent;
        case "charge-desc":
          return b.batPercent - a.batPercent;
        case "temp-desc":
          return b.batTemp - a.batTemp;
        case "cycles-desc":
          return b.batCycleCount - a.batCycleCount;
        case "distance-desc":
          return b.totalDistanceTraveled - a.totalDistanceTraveled;
        case "recent":
          return b.lastUpdate.getTime() - a.lastUpdate.getTime();
        default:
          return a.bmsId.localeCompare(b.bmsId);
      }
    });

    return filtered;
  }, [batteries, filters]);

  // Export function
  const handleExport = () => {
    const headers = [
      "BMS ID",
      "T-Box ID",
      "Vehicle ID",
      "Status",
      "Location",
      "SOH %",
      "Charge %",
      "Voltage",
      "Current",
      "Temperature",
      "Cycles",
      "Total Distance",
      "Avg Distance/Cycle",
      "Motor RPM",
      "Motor Temp",
      "Last Update",
      "Data Age",
    ];

    const rows = filteredBatteries.map((b) => [
      b.bmsId,
      b.tboxId,
      b.vehicleId || "",
      b.status,
      b.lastKnownLocation,
      b.batSOH,
      b.batPercent,
      b.batVolt.toFixed(1),
      b.batCurrent.toFixed(1),
      b.batTemp.toFixed(1),
      b.batCycleCount,
      b.totalDistanceTraveled,
      b.avgDistancePerCycle.toFixed(1),
      b.motorRPM,
      b.motorTemp.toFixed(1),
      b.lastUpdate.toISOString(),
      formatDataAge(b.dataAge),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `battery_telemetry_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading battery telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <Battery className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              Real-Time Battery Monitoring
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Battery Telemetry Dashboard
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Monitor live battery health, performance metrics, and location from
            vehicle telemetry
          </p>
          <p className="text-sm text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()} • Data refreshed
            daily via batch ingestion
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            icon={Battery}
            label="Total Batteries"
            value={formatNumber(kpis.TOTAL_BATTERIES)}
            description="All batteries in fleet"
            color="text-blue-400"
            loading={loading}
          />
          <KPICard
            icon={CheckCircle}
            label="Online Batteries"
            value={formatNumber(kpis.ONLINE_BATTERIES)}
            description="Currently online"
            color="text-green-400"
            loading={loading}
          />
          <KPICard
            icon={Activity}
            label="Healthy Batteries"
            value={formatNumber(kpis.HEALTHY_BATTERIES)}
            description="SOH ≥80%, no errors"
            color="text-emerald-400"
            loading={loading}
          />
          <KPICard
            icon={AlertTriangle}
            label="Needs Attention"
            value={formatNumber(kpis.NEEDS_ATTENTION)}
            description="Requires monitoring"
            color="text-orange-400"
            loading={loading}
          />
          <KPICard
            icon={Gauge}
            label="Avg SOH"
            value={`${kpis.AVG_SOH}%`}
            description="Fleet average health"
            color="text-cyan-400"
            loading={loading}
          />
          <KPICard
            icon={Zap}
            label="Avg Charge"
            value={`${kpis.AVG_CHARGE}%`}
            description="Fleet average charge"
            color="text-purple-400"
            loading={loading}
          />
          <KPICard
            icon={Navigation}
            label="Total Distance"
            value={`${formatNumber(kpis.TOTAL_DISTANCE)} km`}
            description="Cumulative fleet distance"
            color="text-indigo-400"
            loading={loading}
          />
          <KPICard
            icon={RefreshCw}
            label="Avg Cycles"
            value={formatNumber(kpis.AVG_CYCLES)}
            description="Fleet average cycles"
            color="text-pink-400"
            loading={loading}
          />
        </div>

        {/* Filters */}
        <BatteryFilter
          onFiltersChange={setFilters}
          loading={loading}
          filters={filters}
          batteries={batteries}
        />

        {/* Results and Actions */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400">
            Showing{" "}
            <span className="text-cyan-400 font-medium">
              {filteredBatteries.length}
            </span>{" "}
            of{" "}
            <span className="text-cyan-400 font-medium">
              {batteries.length}
            </span>{" "}
            batteries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
              onClick={handleExport}
              disabled={filteredBatteries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
              onClick={loadData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Battery Cards Grid */}
        {filteredBatteries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredBatteries.map((battery) => (
              <BatteryCard key={battery.bmsId} battery={battery} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Battery className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-slate-300 text-lg font-medium mb-2">
                No batteries found
              </h3>
              <p className="text-slate-400 text-sm">
                Try adjusting your filters to see more results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BatteryTelemetryDashboard;
