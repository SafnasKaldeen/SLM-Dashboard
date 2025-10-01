"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  AlertCircle,
  Battery,
  TrendingUp,
  Zap,
  RefreshCw,
  Activity,
} from "lucide-react";

interface BatteryData {
  BATTERY_TYPE: string;
  VEHICLE_COUNT: number;
  ACTIVE_COUNT: number;
  AVG_BATTERY_HEALTH: number;
}

interface BatteryDistributionChartProps {
  data: BatteryData[];
  loading?: boolean;
  error?: Error | null;
}

const COLORS = ["#06d6a0", "#118ab2", "#ffd166"];

export default function BatteryDistributionChart({
  data,
  loading = false,
  error = null,
}: BatteryDistributionChartProps) {
  // Transform the data to the format expected by the pie chart
  const chartData =
    data?.map((item, index) => ({
      name: item.BATTERY_TYPE,
      value: item.VEHICLE_COUNT,
      activeCount: item.ACTIVE_COUNT,
      avgHealth: item.AVG_BATTERY_HEALTH,
      color: COLORS[index % COLORS.length],
      originalData: item,
    })) || [];

  // Calculate metrics
  const totalVehicles =
    data?.reduce((sum, item) => sum + (item.VEHICLE_COUNT || 0), 0) || 0;

  const totalActiveVehicles =
    data?.reduce((sum, item) => sum + (item.ACTIVE_COUNT || 0), 0) || 0;

  const averageBatteryHealth =
    data?.length > 0
      ? data.reduce((sum, item) => sum + (item.AVG_BATTERY_HEALTH || 0), 0) /
        data.length
      : 0;

  const activeRate =
    totalVehicles > 0 ? (totalActiveVehicles / totalVehicles) * 100 : 0;

  const bestPerformingBattery = data?.reduce((prev, current) =>
    prev.AVG_BATTERY_HEALTH > current.AVG_BATTERY_HEALTH ? prev : current
  );

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-slate-300 font-medium">
              Loading battery data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-red-400 font-medium mb-2">
              Error Loading Data
            </h3>
            <p className="text-slate-400 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Battery className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-300 mb-1">
              No battery data available
            </p>
            <p className="text-sm text-slate-400">
              Check back later for updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.95)",
            border: "1px solid rgba(100, 116, 139, 0.3)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.3)",
            backdropFilter: "blur(12px)",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#f1f5f9",
          }}
        >
          <p className="font-semibold mb-2">{data.name}</p>
          <p className="text-sm text-slate-300">Total Vehicles: {data.value}</p>
          <p className="text-sm text-slate-300">Active: {data.activeCount}</p>
          <p className="text-sm text-slate-300">
            Avg Health: {data.avgHealth.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full border border-slate-700/50 rounded-xl p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Battery Distribution Analytics
          </h2>
        </div>
        <p className="text-slate-400 font-medium">
          Fleet distribution by battery type and performance metrics
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 shadow-inner mb-6">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={40}
              paddingAngle={5}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
              }
              labelLine={false}
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fill: "#f1f5f9",
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#f1f5f9",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Section - Clean Lines */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Best Type
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {bestPerformingBattery?.BATTERY_TYPE || "N/A"}
            </p>
            <p className="text-xs text-slate-400">
              {bestPerformingBattery?.AVG_BATTERY_HEALTH.toFixed(1)}% health
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Most Common
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {chartData.reduce((prev, current) =>
                prev.value > current.value ? prev : current
              )?.name || "N/A"}
            </p>
            <p className="text-xs text-slate-400">
              {chartData.reduce((prev, current) =>
                prev.value > current.value ? prev : current
              )?.value || 0}{" "}
              vehicles
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Active Vehicles
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {totalActiveVehicles}
            </p>
            <p className="text-xs text-slate-400">Currently active</p>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Average Health
            </span>
          </div>
          <p className="text-lg font-bold text-slate-100">
            {averageBatteryHealth.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400">Average battery health</p>
        </div>
      </div>
    </div>
  );
}
