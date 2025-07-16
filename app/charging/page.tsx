"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Battery,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

// Station data with comprehensive metrics
const stationData = {
  BSS_001: {
    name: "Downtown Hub",
    location: "Financial District",
    status: "optimal",
    totalBatteries: 48,
    availableBatteries: 42,
    dailySwaps: 89,
    avgWaitTime: "2.3 min",
    efficiency: 94,
    revenue: 1245,
    peakHours: "8-10 AM, 5-7 PM",
    weeklyTrend: 12.5,
    lastMaintenance: "2 days ago",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    utilizationRate: 87,
    customerSatisfaction: 4.6,
  },
  BSS_002: {
    name: "University Campus",
    location: "Education Zone",
    status: "good",
    totalBatteries: 36,
    availableBatteries: 28,
    dailySwaps: 67,
    avgWaitTime: "3.1 min",
    efficiency: 89,
    revenue: 892,
    peakHours: "7-9 AM, 4-6 PM",
    weeklyTrend: 8.2,
    lastMaintenance: "5 days ago",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    utilizationRate: 78,
    customerSatisfaction: 4.4,
  },
  BSS_003: {
    name: "Shopping Mall",
    location: "Commercial Center",
    status: "optimal",
    totalBatteries: 42,
    availableBatteries: 35,
    dailySwaps: 78,
    avgWaitTime: "1.8 min",
    efficiency: 96,
    revenue: 1089,
    peakHours: "12-2 PM, 6-8 PM",
    weeklyTrend: 15.7,
    lastMaintenance: "1 day ago",
    coordinates: { lat: 40.7614, lng: -73.9776 },
    utilizationRate: 83,
    customerSatisfaction: 4.7,
  },
  BSS_004: {
    name: "Residential Complex",
    location: "Housing District",
    status: "maintenance",
    totalBatteries: 30,
    availableBatteries: 18,
    dailySwaps: 45,
    avgWaitTime: "4.2 min",
    efficiency: 76,
    revenue: 634,
    peakHours: "6-8 AM, 7-9 PM",
    weeklyTrend: -3.1,
    lastMaintenance: "In progress",
    coordinates: { lat: 40.7282, lng: -73.9942 },
    utilizationRate: 60,
    customerSatisfaction: 3.8,
  },
  BSS_005: {
    name: "Transit Station",
    location: "Transportation Hub",
    status: "good",
    totalBatteries: 54,
    availableBatteries: 48,
    dailySwaps: 112,
    avgWaitTime: "2.7 min",
    efficiency: 91,
    revenue: 1567,
    peakHours: "7-9 AM, 5-7 PM",
    weeklyTrend: 9.8,
    lastMaintenance: "3 days ago",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    utilizationRate: 89,
    customerSatisfaction: 4.5,
  },
};

const BatteryStationsOverview = () => {
  const [selectedMetric, setSelectedMetric] = useState("dailySwaps");

  // Calculate network-wide statistics
  const networkStats = useMemo(() => {
    const stations = Object.values(stationData);

    const totalStations = stations.length;
    const operationalStations = stations.filter(
      (s) => s.status !== "maintenance"
    ).length;
    const totalBatteries = stations.reduce(
      (sum, s) => sum + s.totalBatteries,
      0
    );
    const availableBatteries = stations.reduce(
      (sum, s) => sum + s.availableBatteries,
      0
    );
    const totalDailySwaps = stations.reduce((sum, s) => sum + s.dailySwaps, 0);
    const totalRevenue = stations.reduce((sum, s) => sum + s.revenue, 0);
    const avgEfficiency =
      stations.reduce((sum, s) => sum + s.efficiency, 0) / stations.length;
    const avgSatisfaction =
      stations.reduce((sum, s) => sum + s.customerSatisfaction, 0) /
      stations.length;

    return {
      totalStations,
      operationalStations,
      totalBatteries,
      availableBatteries,
      totalDailySwaps,
      totalRevenue,
      avgEfficiency,
      avgSatisfaction,
      batteryUtilization:
        ((totalBatteries - availableBatteries) / totalBatteries) * 100,
    };
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    return Object.entries(stationData).map(([id, station]) => ({
      id,
      name: station.name.replace(" ", "\n"),
      dailySwaps: station.dailySwaps,
      efficiency: station.efficiency,
      revenue: station.revenue,
      utilization: station.utilizationRate,
      satisfaction: station.customerSatisfaction,
      available: station.availableBatteries,
      total: station.totalBatteries,
    }));
  }, []);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCount = {};
    Object.values(stationData).forEach((station) => {
      statusCount[station.status] = (statusCount[station.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: Math.round((count / Object.keys(stationData).length) * 100),
    }));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal":
        return "text-green-400";
      case "good":
        return "text-yellow-400";
      case "maintenance":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "optimal":
        return <CheckCircle className="w-4 h-4" />;
      case "good":
        return <Clock className="w-4 h-4" />;
      case "maintenance":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Battery className="w-4 h-4" />;
    }
  };

  const COLORS = ["#22C55E", "#EAB308", "#EF4444", "#6B7280"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-200 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === "efficiency" && "%"}
              {entry.dataKey === "revenue" && " $"}
              {entry.dataKey === "satisfaction" && "/5"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Battery Swap Network Overview
          </h1>
          <p className="text-slate-400">
            Real-time monitoring and analytics across all stations
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Battery className="w-5 h-5" />
          <span className="font-medium">
            {networkStats.operationalStations}/{networkStats.totalStations}{" "}
            Operational
          </span>
        </div>
      </div>

      {/* Network Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Total Stations</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {networkStats.totalStations}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Total Swaps</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {networkStats.totalDailySwaps}
          </div>
          <div className="text-xs text-slate-500">today</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Revenue</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            ${networkStats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">today</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Efficiency</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {networkStats.avgEfficiency.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">network avg</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400">Battery Use</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {networkStats.batteryUtilization.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">utilization</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-slate-400">Satisfaction</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {networkStats.avgSatisfaction.toFixed(1)}/5
          </div>
          <div className="text-xs text-slate-500">avg rating</div>
        </div>
      </div>

      {/* Station Status and Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Status Distribution */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
          <div className="p-6 pb-2">
            <h3 className="text-slate-100 font-semibold">Station Status</h3>
            <p className="text-slate-400 text-sm">
              Current operational status distribution
            </p>
          </div>
          <div className="p-6 pt-2">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} stations`, name]}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {statusData.map((status, index) => (
                <div
                  key={status.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-slate-300 text-sm">
                      {status.name}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {status.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
          <div className="p-6 pb-2">
            <h3 className="text-slate-100 font-semibold">
              Station Performance
            </h3>
            <p className="text-slate-400 text-sm">
              Daily swaps and efficiency comparison
            </p>
          </div>
          <div className="p-6 pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                  <Bar dataKey="dailySwaps" fill="#3B82F6" name="Daily Swaps" />
                  <Bar
                    dataKey="efficiency"
                    fill="#22C55E"
                    name="Efficiency %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Station List */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
        <div className="p-6 pb-2">
          <h3 className="text-slate-100 font-semibold">Station Details</h3>
          <p className="text-slate-400 text-sm">
            Comprehensive view of all battery swap stations
          </p>
        </div>
        <div className="p-6 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-300 font-medium p-3">
                    Station
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Status
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Batteries
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Daily Swaps
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Efficiency
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Revenue
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Trend
                  </th>
                  <th className="text-left text-slate-300 font-medium p-3">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stationData).map(([id, station]) => (
                  <tr
                    key={id}
                    className="border-b border-slate-800 hover:bg-slate-800/30"
                  >
                    <td className="p-3">
                      <div>
                        <div className="text-slate-100 font-medium">
                          {station.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {station.location}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div
                        className={`flex items-center gap-2 ${getStatusColor(
                          station.status
                        )}`}
                      >
                        {getStatusIcon(station.status)}
                        <span className="capitalize text-sm">
                          {station.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-100">
                        {station.availableBatteries}/{station.totalBatteries}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {Math.round(
                          (station.availableBatteries /
                            station.totalBatteries) *
                            100
                        )}
                        % available
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-100 font-medium">
                        {station.dailySwaps}
                      </div>
                      <div className="text-slate-400 text-sm">swaps today</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="text-slate-100">
                          {station.efficiency}%
                        </div>
                        <div className="w-12 bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-cyan-400"
                            style={{ width: `${station.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-100 font-medium">
                        ${station.revenue}
                      </div>
                      <div className="text-slate-400 text-sm">today</div>
                    </td>
                    <td className="p-3">
                      <div
                        className={`flex items-center gap-1 ${
                          station.weeklyTrend >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {station.weeklyTrend >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {Math.abs(station.weeklyTrend)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-100">
                        {station.customerSatisfaction}/5
                      </div>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor(station.customerSatisfaction)
                                ? "bg-yellow-400"
                                : "bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryStationsOverview;
