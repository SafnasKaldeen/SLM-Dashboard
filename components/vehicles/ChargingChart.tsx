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
import { Activity } from "lucide-react";

interface ChargingData {
  CHARGING_DATE: string;
  SESSION_COUNT: number;
  AVG_DURATION: number;
  TOTAL_ENERGY: number;
}

interface ChargingChartProps {
  data: ChargingData[];
}

export default function ChargingChart({ data }: ChargingChartProps) {
  // No data message
  if (!data || data.length === 0) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Charging Sessions Overview
            </h2>
          </div>
          <p className="font-medium">
            Track charging patterns and energy consumption over time
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 text-slate-500 mx-auto mb-3" />
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

  // Transform the data to format dates nicely for display
  const chartData = data.map((item) => ({
    date: new Date(item.CHARGING_DATE).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    sessions: item.SESSION_COUNT,
    avgDuration: item.AVG_DURATION,
    totalEnergy: item.TOTAL_ENERGY,
  }));

  return (
    <div className="border border-slate-700/50 rounded-xl p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Charging Sessions Overview
          </h2>
        </div>
        <p className="text-slate-400 font-medium">
          Track charging patterns and energy consumption over time
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
            tickFormatter={(value) => `${value} kWh`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-2xl">
                    <div className="grid gap-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Date
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
                                `${entry.value} min`}
                              {entry.name === "Total Energy" &&
                                `${entry.value?.toLocaleString()} kWh`}
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
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            strokeWidth={3}
            stroke="#06d6a0"
            dot={{ fill: "#06d6a0", strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              fill: "#06d6a0",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name="Sessions"
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgDuration"
            strokeWidth={3}
            stroke="#118ab2"
            dot={{ fill: "#118ab2", strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              fill: "#118ab2",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name="Avg Duration"
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalEnergy"
            strokeWidth={3}
            stroke="#ffd166"
            dot={{ fill: "#ffd166", strokeWidth: 2, r: 5 }}
            activeDot={{
              r: 7,
              fill: "#ffd166",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            name="Total Energy"
            style={{
              filter: "drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
