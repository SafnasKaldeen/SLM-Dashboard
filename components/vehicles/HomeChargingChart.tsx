"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  AlertCircle,
  Zap,
  TrendingUp,
  Car,
  Battery,
  RefreshCw,
} from "lucide-react";

interface HomeChargingData {
  percentageRange: string;
  vehicleCount: number;
  percentage: number;
  chargingSessions?: number;
}

interface HomeChargingChartProps {
  data: HomeChargingData[] | any[];
  loading?: boolean;
  error?: Error | null;
}

export default function HomeChargingChart({
  data = [
    {
      percentageRange: "0-20",
      vehicleCount: 45,
      percentage: 10,
      chargingSessions: 120,
    },
    {
      percentageRange: "20-40",
      vehicleCount: 78,
      percentage: 30,
      chargingSessions: 234,
    },
    {
      percentageRange: "40-60",
      vehicleCount: 156,
      percentage: 50,
      chargingSessions: 467,
    },
    {
      percentageRange: "60-80",
      vehicleCount: 203,
      percentage: 70,
      chargingSessions: 608,
    },
    {
      percentageRange: "80-100",
      vehicleCount: 89,
      percentage: 90,
      chargingSessions: 267,
    },
  ],
  loading = false,
  error = null,
}: HomeChargingChartProps) {
  // Define colors by percentage range meaning
  const getChargingEfficiencyColor = (percentageRange: string) => {
    const startPercentage = parseInt(percentageRange.split("-")[0]);

    if (startPercentage >= 80) {
      return "#06d6a0"; // Green for high efficiency
    } else if (startPercentage >= 60) {
      return "#118ab2"; // Blue for good
    } else if (startPercentage >= 40) {
      return "#ffd166"; // Yellow for average
    } else if (startPercentage >= 20) {
      return "#f77f00"; // Orange for low
    } else {
      return "#ef476f"; // Red for very low
    }
  };

  // Add colors to processed data
  const dataWithColors = data.map((item) => ({
    ...item,
    color: getChargingEfficiencyColor(item.percentageRange),
  }));

  // Calculate metrics
  const totalVehicles = data.reduce(
    (sum, item) => sum + (item.vehicleCount || 0),
    0
  );

  const totalChargingSessions = data.reduce(
    (sum, item) => sum + (item.chargingSessions || item.vehicleCount || 0),
    0
  );

  const averagePercentIncrease =
    data.length > 0
      ? data.reduce((sum, item) => sum + (item.percentage || 0), 0) /
        data.length
      : 0;

  const highEfficiencyVehicles = data
    .filter((item) => {
      const startPercentage = parseInt(item.percentageRange.split("-")[0]);
      return startPercentage >= 60;
    })
    .reduce((sum, item) => sum + (item.vehicleCount || 0), 0);

  const efficiencyRate =
    totalVehicles > 0 ? (highEfficiencyVehicles / totalVehicles) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-slate-300 font-medium">
              Loading charging data...
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
              No charging data available
            </p>
            <p className="text-sm text-slate-400">
              Check back later for updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-slate-700/50 rounded-xl p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Home Charging Analytics
          </h2>
        </div>
        <p className="text-slate-400 font-medium">
          Distribution of charging efficiency improvements across your fleet
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 shadow-inner mb-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={dataWithColors}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#475569"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="percentageRange"
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: "#64748b", strokeWidth: 1 }}
              tickLine={{ stroke: "#64748b" }}
            />
            <YAxis
              label={{
                value: "Number of Vehicles",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 500,
                },
              }}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: "#64748b", strokeWidth: 1 }}
              tickLine={{ stroke: "#64748b" }}
            />
            <Tooltip
              formatter={(value, name) => [`${value} vehicles`, "Vehicles"]}
              labelFormatter={(label) => `${label}% increase`}
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                border: "1px solid rgba(100, 116, 139, 0.3)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.3)",
                backdropFilter: "blur(12px)",
                fontSize: "14px",
                fontWeight: "500",
                color: "#ffffff",
              }}
              cursor={{ fill: "rgba(100, 116, 139, 0.1)" }}
            />
            <Bar
              dataKey="vehicleCount"
              radius={[6, 6, 0, 0]}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={1}
            >
              {dataWithColors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Section - Clean Lines */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                High Efficiency
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {highEfficiencyVehicles} vehicles
            </p>
            <p className="text-xs text-slate-400">60%+ improvement</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Avg Increase
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {averagePercentIncrease.toFixed(1)} %
            </p>
            <p className="text-xs text-slate-400">Most common</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Total Sessions
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {totalChargingSessions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">Count of the sessions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                Total Vehicles
              </span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {totalVehicles.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">Count of the Vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
