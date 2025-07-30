"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Database,
  Activity,
  Clock,
  BarChart3,
  FileText,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  LineChart,
  BarChart,
  Maximize2,
  ArrowLeft,
  Zap,
  Bike,
  Box,
  Network,
  Navigation,
  Route,
  Gauge,
  Timer,
  Target,
  RotateCcw,
  Calendar,
  Hash,
  Wrench,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";

export default function EnhancedGPSAnalyticsDashboard() {
  const [filters, setFilters] = useState({
    vehicleId: "all",
    tboxId: "all",
    chassisNumber: "all",
    timeRange: "last_7_days",
    customTimeFrom: "",
    customTimeTo: "",
    startDate: "",
    endDate: "",
  });

  const [isQuerying, setIsQuerying] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [drillDownData, setDrillDownData] = useState(null);

  // Vehicle data with chassis numbers and TBox mapping
  const vehicleData = [
    {
      vehicleId: "VH001",
      chassisNumber: "CH001ABC123",
      tboxId: "TB001",
      status: "active",
    },
    {
      vehicleId: "VH002",
      chassisNumber: "CH002DEF456",
      tboxId: "TB002",
      status: "active",
    },
    {
      vehicleId: "VH003",
      chassisNumber: "CH003GHI789",
      tboxId: "TB003",
      status: "maintenance",
    },
    {
      vehicleId: "VH004",
      chassisNumber: "CH004JKL012",
      tboxId: "TB004",
      status: "active",
    },
    {
      vehicleId: "VH005",
      chassisNumber: "CH005MNO345",
      tboxId: "TB005",
      status: "active",
    },
    {
      vehicleId: "VH006",
      chassisNumber: "CH006PQR678",
      tboxId: "TB006",
      status: "active",
    },
    {
      vehicleId: "VH007",
      chassisNumber: "CH007STU901",
      tboxId: "TB007",
      status: "inactive",
    },
    {
      vehicleId: "VH008",
      chassisNumber: "CH008VWX234",
      tboxId: "TB008",
      status: "active",
    },
    {
      vehicleId: "VH009",
      chassisNumber: "CH009YZA567",
      tboxId: "TB009",
      status: "active",
    },
    {
      vehicleId: "VH010",
      chassisNumber: "CH010BCD890",
      tboxId: "TB010",
      status: "active",
    },
  ];

  const timeRangeOptions = [
    { value: "last_hour", label: "Last Hour" },
    { value: "last_4_hours", label: "Last 4 Hours" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  // Generate dynamic analytics data
  const generateAnalyticsData = () => {
    const filteredVehicles = vehicleData.filter((vehicle) => {
      const vehicleMatch =
        filters.vehicleId === "all" || vehicle.vehicleId === filters.vehicleId;
      const tboxMatch =
        filters.tboxId === "all" || vehicle.tboxId === filters.tboxId;
      const chassisMatch =
        filters.chassisNumber === "all" ||
        vehicle.chassisNumber === filters.chassisNumber;
      return (
        vehicleMatch && tboxMatch && chassisMatch && vehicle.status === "active"
      );
    });

    const multiplier = filteredVehicles.length / vehicleData.length;

    // Swap data generation
    const swapData = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-07-${21 + i}`,
      totalSwaps: Math.round((12 + Math.random() * 8) * multiplier),
      batterySwaps: Math.round((8 + Math.random() * 5) * multiplier),
      maintenanceSwaps: Math.round((2 + Math.random() * 2) * multiplier),
      emergencySwaps: Math.round((1 + Math.random() * 2) * multiplier),
      avgSwapTime: Math.round(8 + Math.random() * 4), // minutes
    }));

    // Top performing vehicles by distance
    const topVehiclesByDistance = filteredVehicles
      .slice(0, 8)
      .map((vehicle) => ({
        vehicleId: vehicle.vehicleId,
        chassisNumber: vehicle.chassisNumber,
        tboxId: vehicle.tboxId,
        totalDistance: Math.round(450 + Math.random() * 350),
        tripCount: Math.round(35 + Math.random() * 25),
        avgTripDistance: Math.round(12 + Math.random() * 8),
        swapCount: Math.round(3 + Math.random() * 5),
        lastSwapTime: Math.round(2 + Math.random() * 10), // hours ago
        utilizationRate: Math.round(65 + Math.random() * 30),
      }))
      .sort((a, b) => b.totalDistance - a.totalDistance);

    // GPS tracking patterns
    const gpsPatterns = Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString().padStart(2, "0") + ":00",
      gpsPoints: Math.round(
        (50 + Math.sin((hour * Math.PI) / 12) * 30) * multiplier
      ),
      accuracy: 95 + Math.random() * 4,
      signalStrength: Math.round(75 + Math.random() * 20),
      dataLoss: Math.round(Math.random() * 5),
    }));

    return {
      summary: {
        totalDistance: Math.round(3847.5 * multiplier),
        totalGpsPoints: Math.round(24586 * multiplier),
        activeVehicles: filteredVehicles.length,
        activeTboxDevices: filteredVehicles.length,
        avgSpeed: 38.7,
        avgTripDistance: 14.2,
        totalTripCount: Math.round(271 * multiplier),
        avgTripDuration: "32m",
        utilizationRate: 78.4,
        totalSwaps: swapData.reduce((sum, day) => sum + day.totalSwaps, 0),
        avgSwapTime: "9.5m",
        lastUpdateTime: "2025-07-28 15:45:00",
      },
      filteredVehicles,
      swapAnalytics: swapData,
      topVehiclesByDistance,
      gpsTrackingPatterns: gpsPatterns,
      distanceTrends: Array.from({ length: 7 }, (_, i) => ({
        date: `2025-07-${21 + i}`,
        totalDistance: Math.round((487.3 + Math.random() * 120) * multiplier),
        avgTripDistance: Math.round(13.8 + Math.random() * 3),
        tripCount: Math.round((38 + Math.random() * 12) * multiplier),
        avgSpeed: Math.round(36.5 + Math.random() * 6),
        utilizationRate: Math.round(74 + Math.random() * 12),
        gpsPoints: Math.round((3200 + Math.random() * 800) * multiplier),
      })),
      swapTypeDistribution: [
        {
          type: "Battery Swaps",
          count: Math.round(45 * multiplier),
          percentage: 65,
          color: "#10B981",
        },
        {
          type: "Maintenance",
          count: Math.round(18 * multiplier),
          percentage: 26,
          color: "#F59E0B",
        },
        {
          type: "Emergency",
          count: Math.round(6 * multiplier),
          percentage: 9,
          color: "#EF4444",
        },
      ],
      hourlyUtilization: Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString().padStart(2, "0") + ":00",
        utilization: Math.round(30 + Math.sin((hour * Math.PI) / 12) * 25),
        distance: Math.round(
          (45 + Math.sin((hour * Math.PI) / 12) * 35) * multiplier
        ),
        trips: Math.round(
          (8 + Math.sin((hour * Math.PI) / 12) * 6) * multiplier
        ),
        swaps: Math.round((1 + Math.random()) * multiplier),
      })),
    };
  };

  const [analyticsData, setAnalyticsData] = useState(() =>
    generateAnalyticsData()
  );

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  // Initialize data on mount
  useEffect(() => {
    handleExecuteQuery();
  }, []);

  // Update data when filters change
  useEffect(() => {
    if (hasData) {
      setAnalyticsData(generateAnalyticsData());
    }
  }, [filters]);

  const handleExecuteQuery = async () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      setHasData(true);
      setAnalyticsData(generateAnalyticsData());
    }, 1500);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Auto-populate related fields
      if (key === "vehicleId" && value !== "all") {
        const vehicle = vehicleData.find((v) => v.vehicleId === value);
        if (vehicle) {
          newFilters.tboxId = vehicle.tboxId;
          newFilters.chassisNumber = vehicle.chassisNumber;
        }
      } else if (key === "chassisNumber" && value !== "all") {
        const vehicle = vehicleData.find((v) => v.chassisNumber === value);
        if (vehicle) {
          newFilters.vehicleId = vehicle.vehicleId;
          newFilters.tboxId = vehicle.tboxId;
        }
      } else if (key === "tboxId" && value !== "all") {
        const vehicle = vehicleData.find((v) => v.tboxId === value);
        if (vehicle) {
          newFilters.vehicleId = vehicle.vehicleId;
          newFilters.chassisNumber = vehicle.chassisNumber;
        }
      }

      return newFilters;
    });
  };

  const exportReport = () => {
    const reportData = {
      filters,
      analyticsData,
      generatedAt: new Date().toISOString(),
    };
    const data = JSON.stringify(reportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gps-analytics-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDrillDown = (dataType, item) => {
    setDrillDownData({ type: dataType, data: item, filters });
    setActiveView("drilldown");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              GPS Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Vehicle tracking, distance analytics, and swap management
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-slate-600 text-slate-300 bg-transparent rounded-md text-sm hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
              onClick={exportReport}
              disabled={!hasData}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md text-sm hover:bg-slate-600 flex items-center gap-2"
              onClick={() => setActiveView("overview")}
            >
              <MapPin className="h-4 w-4" />
              Overview
            </button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Vehicle ID Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Bike className="inline h-3 w-3 mr-1" />
                Vehicle ID
              </label>
              <select
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                value={filters.vehicleId}
                onChange={(e) =>
                  handleFilterChange("vehicleId", e.target.value)
                }
              >
                <option value="all">All Vehicles</option>
                {vehicleData
                  .filter((v) => v.status === "active")
                  .map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.vehicleId}
                    </option>
                  ))}
              </select>
            </div>

            {/* TBox ID Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Box className="inline h-3 w-3 mr-1" />
                TBox ID
              </label>
              <select
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                value={filters.tboxId}
                onChange={(e) => handleFilterChange("tboxId", e.target.value)}
              >
                <option value="all">All TBoxes</option>
                {vehicleData
                  .filter((v) => v.status === "active")
                  .map((vehicle) => (
                    <option key={vehicle.tboxId} value={vehicle.tboxId}>
                      {vehicle.tboxId}
                    </option>
                  ))}
              </select>
            </div>

            {/* Chassis Number Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Hash className="inline h-3 w-3 mr-1" />
                Chassis Number
              </label>
              <select
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                value={filters.chassisNumber}
                onChange={(e) =>
                  handleFilterChange("chassisNumber", e.target.value)
                }
              >
                <option value="all">All Chassis</option>
                {vehicleData
                  .filter((v) => v.status === "active")
                  .map((vehicle) => (
                    <option
                      key={vehicle.chassisNumber}
                      value={vehicle.chassisNumber}
                    >
                      {vehicle.chassisNumber}
                    </option>
                  ))}
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Calendar className="inline h-3 w-3 mr-1" />
                Time Range
              </label>
              <select
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                value={filters.timeRange}
                onChange={(e) =>
                  handleFilterChange("timeRange", e.target.value)
                }
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.timeRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                  value={filters.customTimeFrom}
                  onChange={(e) =>
                    handleFilterChange("customTimeFrom", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-sm"
                  value={filters.customTimeTo}
                  onChange={(e) =>
                    handleFilterChange("customTimeTo", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Apply Filter Button */}
          <div className="flex justify-end">
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
              onClick={handleExecuteQuery}
              disabled={isQuerying}
            >
              {isQuerying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {hasData && (
          <div className="bg-slate-900/30 border border-slate-700/30 rounded-lg p-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-slate-400">Active filters:</span>
              {filters.vehicleId !== "all" && (
                <span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded">
                  Vehicle: {filters.vehicleId}
                </span>
              )}
              {filters.tboxId !== "all" && (
                <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded">
                  TBox: {filters.tboxId}
                </span>
              )}
              {filters.chassisNumber !== "all" && (
                <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded">
                  Chassis: {filters.chassisNumber.slice(-6)}
                </span>
              )}
              <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded">
                Time:{" "}
                {
                  timeRangeOptions.find((t) => t.value === filters.timeRange)
                    ?.label
                }
              </span>
            </div>
          </div>
        )}

        {hasData && activeView === "overview" && (
          <>
            {/* Enhanced KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Distance Travelled
                    </p>
                    <p className="text-xl font-bold text-cyan-400">
                      {(analyticsData.summary.totalDistance / 1000).toFixed(1)}K
                      km
                    </p>
                  </div>
                  <Route className="h-6 w-6 text-cyan-500" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">GPS Points</p>
                    <p className="text-xl font-bold text-green-400">
                      {(analyticsData.summary.totalGpsPoints / 1000).toFixed(1)}
                      K
                    </p>
                  </div>
                  <MapPin className="h-6 w-6 text-green-500" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Active Vehicles
                    </p>
                    <p className="text-xl font-bold text-orange-400">
                      {analyticsData.summary.activeVehicles}
                    </p>
                  </div>
                  <Bike className="h-6 w-6 text-orange-500" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Utilization Rate
                    </p>
                    <p className="text-xl font-bold text-purple-400">
                      {analyticsData.summary.utilizationRate}%
                    </p>
                  </div>
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Swaps</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {analyticsData.summary.totalSwaps}
                    </p>
                  </div>
                  <RotateCcw className="h-6 w-6 text-yellow-500" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Avg Swap Time</p>
                    <p className="text-xl font-bold text-pink-400">
                      {analyticsData.summary.avgSwapTime}
                    </p>
                  </div>
                  <Timer className="h-6 w-6 text-pink-500" />
                </div>
              </div>
            </div>

            {/* Top Vehicles by Distance */}
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-cyan-500" />
                    <h2 className="text-lg font-semibold text-slate-100">
                      Top Vehicles by Distance Travelled
                    </h2>
                  </div>
                  <button
                    className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
                    onClick={() =>
                      handleDrillDown(
                        "top_vehicles",
                        analyticsData.topVehiclesByDistance
                      )
                    }
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 py-3 px-2">
                          Rank
                        </th>
                        <th className="text-left text-slate-400 py-3 px-2">
                          Vehicle ID
                        </th>
                        <th className="text-left text-slate-400 py-3 px-2">
                          Chassis Number
                        </th>
                        <th className="text-right text-slate-400 py-3 px-2">
                          Distance (km)
                        </th>
                        <th className="text-right text-slate-400 py-3 px-2">
                          Trips
                        </th>
                        <th className="text-right text-slate-400 py-3 px-2">
                          Swaps
                        </th>
                        <th className="text-right text-slate-400 py-3 px-2">
                          Utilization
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topVehiclesByDistance
                        .slice(0, 5)
                        .map((vehicle, index) => (
                          <tr
                            key={vehicle.vehicleId}
                            className="border-b border-slate-800 hover:bg-slate-800/30 cursor-pointer"
                            onClick={() =>
                              handleDrillDown("vehicle_detail", vehicle)
                            }
                          >
                            <td className="py-3 px-2">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  index === 0
                                    ? "bg-yellow-900/50 text-yellow-300"
                                    : index === 1
                                    ? "bg-slate-600/50 text-slate-300"
                                    : index === 2
                                    ? "bg-orange-900/50 text-orange-300"
                                    : "bg-slate-700/50 text-slate-400"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-cyan-400 font-mono">
                              {vehicle.vehicleId}
                            </td>
                            <td className="py-3 px-2 text-slate-300 font-mono text-xs">
                              {vehicle.chassisNumber}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300 font-bold">
                              {vehicle.totalDistance}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300">
                              {vehicle.tripCount}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300">
                              {vehicle.swapCount}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  vehicle.utilizationRate > 80
                                    ? "bg-green-900/50 text-green-300"
                                    : vehicle.utilizationRate > 60
                                    ? "bg-yellow-900/50 text-yellow-300"
                                    : "bg-red-900/50 text-red-300"
                                }`}
                              >
                                {vehicle.utilizationRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Distance & Movement Trends */}
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LineChart className="mr-2 h-5 w-5 text-cyan-500" />
                    <h2 className="text-lg font-semibold text-slate-100">
                      Distance & Movement Trends
                    </h2>
                  </div>
                  <button className="p-2 hover:bg-slate-700 rounded-md">
                    <Maximize2 className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analyticsData.distanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#9CA3AF"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="totalDistance"
                      fill="#3B82F6"
                      name="Total Distance (km)"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="gpsPoints"
                      fill="#06B6D4"
                      name="GPS Points"
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="utilizationRate"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Utilization Rate (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Enhanced Drill Down View */}
        {hasData && activeView === "drilldown" && drillDownData && (
          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    className="mr-4 p-2 hover:bg-slate-700 rounded-md"
                    onClick={() => setActiveView("overview")}
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-400" />
                  </button>
                  <h2 className="text-lg font-semibold text-slate-100">
                    Detailed{" "}
                    {drillDownData.type.replace("_", " ").toUpperCase()}{" "}
                    Analysis
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
                    onClick={exportReport}
                  >
                    Export Detail
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Filter Context */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-slate-200 mb-2">
                  Filter Context:
                </h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {Object.entries(drillDownData.filters).map(
                    ([key, value]) =>
                      value !== "all" &&
                      value !== "" && (
                        <span
                          key={key}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                        >
                          {key}: {value}
                        </span>
                      )
                  )}
                </div>
              </div>

              {/* Vehicle Detail Drill Down */}
              {drillDownData.type === "vehicle_detail" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                      <Bike className="mr-2 h-5 w-5 text-cyan-500" />
                      Vehicle Performance
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/30 rounded p-3">
                          <span className="text-slate-400 text-sm">
                            Vehicle ID
                          </span>
                          <p className="text-cyan-400 font-mono text-lg">
                            {drillDownData.data.vehicleId}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 rounded p-3">
                          <span className="text-slate-400 text-sm">
                            TBox ID
                          </span>
                          <p className="text-purple-400 font-mono text-lg">
                            {drillDownData.data.tboxId}
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded p-3">
                        <span className="text-slate-400 text-sm">
                          Chassis Number
                        </span>
                        <p className="text-green-400 font-mono text-lg">
                          {drillDownData.data.chassisNumber}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 text-sm">
                            Total Distance
                          </span>
                          <p className="text-slate-300 text-xl font-bold">
                            {drillDownData.data.totalDistance} km
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">
                            Trip Count
                          </span>
                          <p className="text-slate-300 text-xl font-bold">
                            {drillDownData.data.tripCount}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 text-sm">
                            Avg Trip Distance
                          </span>
                          <p className="text-slate-300 text-xl font-bold">
                            {drillDownData.data.avgTripDistance} km
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">
                            Utilization Rate
                          </span>
                          <p
                            className={`text-xl font-bold ${
                              drillDownData.data.utilizationRate > 80
                                ? "text-green-400"
                                : drillDownData.data.utilizationRate > 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {drillDownData.data.utilizationRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                      <RotateCcw className="mr-2 h-5 w-5 text-yellow-500" />
                      Swap History & Status
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/30 rounded p-3">
                          <span className="text-slate-400 text-sm">
                            Total Swaps
                          </span>
                          <p className="text-yellow-400 text-xl font-bold">
                            {drillDownData.data.swapCount}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 rounded p-3">
                          <span className="text-slate-400 text-sm">
                            Last Swap
                          </span>
                          <p className="text-slate-300 text-lg">
                            {drillDownData.data.lastSwapTime}h ago
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-700/50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-green-300">Status: Active</span>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-green-200 text-sm mt-1">
                          All systems operational
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-slate-300 font-medium">
                          Recent Swap Activity
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Battery Swap</span>
                            <span className="text-slate-300">
                              {drillDownData.data.lastSwapTime}h ago
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">
                              Maintenance Check
                            </span>
                            <span className="text-slate-300">
                              {Math.round(
                                drillDownData.data.lastSwapTime * 2.5
                              )}
                              h ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other drill down types */}
              {drillDownData.type !== "vehicle_detail" && (
                <div className="space-y-6">
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-200 mb-2">
                      Analysis Summary
                    </h4>
                    <p className="text-slate-400">
                      Detailed analysis for{" "}
                      {drillDownData.type.replace("_", " ")} with current filter
                      settings. Data shows{" "}
                      {Array.isArray(drillDownData.data)
                        ? drillDownData.data.length
                        : 1}{" "}
                      items.
                    </p>
                  </div>

                  {/* Data Table for list-type drill downs */}
                  {Array.isArray(drillDownData.data) &&
                    drillDownData.type === "top_vehicles" && (
                      <div className="bg-slate-800/30 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                          <h4 className="text-lg font-semibold text-slate-200">
                            Complete Vehicle Rankings
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-700/30">
                              <tr>
                                <th className="text-left text-slate-400 py-3 px-4">
                                  Rank
                                </th>
                                <th className="text-left text-slate-400 py-3 px-4">
                                  Vehicle ID
                                </th>
                                <th className="text-left text-slate-400 py-3 px-4">
                                  Chassis Number
                                </th>
                                <th className="text-right text-slate-400 py-3 px-4">
                                  Distance (km)
                                </th>
                                <th className="text-right text-slate-400 py-3 px-4">
                                  Trips
                                </th>
                                <th className="text-right text-slate-400 py-3 px-4">
                                  Avg Trip
                                </th>
                                <th className="text-right text-slate-400 py-3 px-4">
                                  Swaps
                                </th>
                                <th className="text-right text-slate-400 py-3 px-4">
                                  Utilization
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {drillDownData.data.map((vehicle, index) => (
                                <tr
                                  key={vehicle.vehicleId}
                                  className="border-b border-slate-700/50 hover:bg-slate-700/20"
                                >
                                  <td className="py-3 px-4">
                                    <span
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                        index < 3
                                          ? "bg-yellow-900/50 text-yellow-300"
                                          : "bg-slate-700/50 text-slate-400"
                                      }`}
                                    >
                                      {index + 1}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-cyan-400 font-mono">
                                    {vehicle.vehicleId}
                                  </td>
                                  <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                                    {vehicle.chassisNumber}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-300 font-bold">
                                    {vehicle.totalDistance}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-300">
                                    {vehicle.tripCount}
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-300">
                                    {vehicle.avgTripDistance} km
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-300">
                                    {vehicle.swapCount}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        vehicle.utilizationRate > 80
                                          ? "bg-green-900/50 text-green-300"
                                          : vehicle.utilizationRate > 60
                                          ? "bg-yellow-900/50 text-yellow-300"
                                          : "bg-red-900/50 text-red-300"
                                      }`}
                                    >
                                      {vehicle.utilizationRate}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Raw data view for other types */}
                  {!Array.isArray(drillDownData.data) ||
                    (drillDownData.type !== "top_vehicles" && (
                      <div className="bg-slate-800/30 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-xs text-slate-300">
                          {JSON.stringify(drillDownData.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isQuerying && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 animate-spin text-cyan-500" />
              <span className="text-slate-300">
                Loading GPS analytics and vehicle data...
              </span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!hasData && !isQuerying && (
          <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-12 text-center">
            <Database className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No GPS Data Available
            </h3>
            <p className="text-slate-400 mb-6">
              Configure your filters and click "Apply Filters" to load GPS
              analytics, distance tracking, and swap data for your vehicle
              fleet.
            </p>
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 mx-auto"
              onClick={handleExecuteQuery}
            >
              <Search className="h-4 w-4" />
              Load GPS Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
