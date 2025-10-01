"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Activity, Home, Zap } from "lucide-react";

interface HomeChargingData {
  CHARGING_DATE: string;
  SESSION_COUNT: number;
  AVG_DURATION?: number;
  TOTAL_ENERGY?: number;
  TOTAL_AMOUNT?: number;
}

interface HomeChargingChartProps {
  data: HomeChargingData[];
  loading?: boolean;
  title?: string;
  showAmount?: boolean;
}

export default function HomeChargingChart({
  data,
  loading = false,
  title = "Home Charging Sessions Overview",
  showAmount = false,
}: HomeChargingChartProps) {
  // Loading state
  if (loading) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="font-medium text-slate-400">
            Track home charging patterns and usage trends
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 animate-pulse text-green-400" />
            <span className="text-slate-300">Loading charging data...</span>
          </div>
        </div>
      </div>
    );
  }

  // No data message
  if (!data || data.length === 0) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="font-medium text-slate-400">
            Track home charging patterns and usage trends
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Home className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-300 mb-1">
              No home charging data available
            </p>
            <p className="text-sm text-slate-400">
              Check back later for updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Transform the data to format dates nicely for display
  const chartData = data.map((item) => {
    // Handle different date formats (daily, weekly, monthly)
    let displayDate: string;

    if (item.CHARGING_DATE.includes("W")) {
      // Weekly format: 2024-W12
      const [year, week] = item.CHARGING_DATE.split("-W");
      displayDate = `${year} Week ${week}`;
    } else if (item.CHARGING_DATE.length === 7) {
      // Monthly format: 2024-03
      const [year, month] = item.CHARGING_DATE.split("-");
      displayDate = new Date(
        parseInt(year),
        parseInt(month) - 1
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } else {
      // Daily format: 2024-03-15
      displayDate = new Date(item.CHARGING_DATE).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return {
      date: displayDate,
      sessions: item.SESSION_COUNT,
      avgDuration: item.AVG_DURATION || 0,
      totalEnergy: item.TOTAL_ENERGY || 0,
      totalAmount: item.TOTAL_AMOUNT || 0,
    };
  });

  return (
    <div className="border border-slate-700/50 rounded-xl p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <p className="text-slate-400 font-medium">
          Track home charging patterns and usage trends
        </p>
      </div>

      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#475569"
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "#64748b", strokeWidth: 1 }}
            tickLine={{ stroke: "#64748b" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "#64748b", strokeWidth: 1 }}
            tickLine={{ stroke: "#64748b" }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "#64748b", strokeWidth: 1 }}
            tickLine={{ stroke: "#64748b" }}
            tickFormatter={(value) =>
              showAmount ? `$${value}` : `${value} kWh`
            }
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-2xl">
                    <div className="grid gap-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Period
                      </div>
                      <div className="text-sm font-semibold text-slate-100 mb-2">
                        {label}
                      </div>
                      <div className="space-y-2">
                        {payload.map((entry, index) => (
                          <div key={index} className="grid grid-cols-2 gap-2">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                              {entry.name}
                            </div>
                            <div
                              className="text-sm font-bold text-right"
                              style={{ color: entry.color }}
                            >
                              {entry.name === "Sessions" &&
                                `${entry.value} sessions`}
                              {entry.name === "Avg Duration" &&
                                `${Math.round(Number(entry.value))}%`}
                              {entry.name === "Total Energy" &&
                                `${Math.round(Number(entry.value))} kWh`}
                              {entry.name === "Total Amount" &&
                                `$${Number(entry.value).toFixed(2)}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={(value) => (
              <span className="text-slate-300 text-sm font-medium">
                {value}
              </span>
            )}
          />

          {/* Sessions Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            strokeWidth={3}
            stroke="#10b981"
            dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              fill: "#10b981",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name="Sessions"
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />

          {/* Average Duration Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgDuration"
            strokeWidth={3}
            stroke="#06b6d4"
            dot={{ fill: "#06b6d4", strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              fill: "#06b6d4",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name="Avg Duration"
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />

          {/* Conditional third line - either Energy or Amount */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={showAmount ? "totalAmount" : "totalEnergy"}
            strokeWidth={3}
            stroke={showAmount ? "#f59e0b" : "#8b5cf6"}
            dot={{
              fill: showAmount ? "#f59e0b" : "#8b5cf6",
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              r: 7,
              fill: showAmount ? "#f59e0b" : "#8b5cf6",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name={showAmount ? "Total Amount" : "Total Energy"}
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
