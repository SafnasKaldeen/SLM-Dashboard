import React, { useState } from "react";
import { Activity, Thermometer, Zap, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample motor data by scooter based on your CSV structure
const motorDataByScooter = {
  "Scooter 1": [
    { date: "Feb 02", MotorRPM: 2500, MotorTemp: 45, ThrottlePercent: 65 },
    { date: "Feb 03", MotorRPM: 3200, MotorTemp: 52, ThrottlePercent: 80 },
    { date: "Feb 04", MotorRPM: 2800, MotorTemp: 48, ThrottlePercent: 70 },
    { date: "Feb 05", MotorRPM: 3500, MotorTemp: 58, ThrottlePercent: 90 },
  ],
  "Scooter 2": [
    { date: "Feb 02", MotorRPM: 2800, MotorTemp: 50, ThrottlePercent: 75 },
    { date: "Feb 03", MotorRPM: 3100, MotorTemp: 55, ThrottlePercent: 85 },
    { date: "Feb 04", MotorRPM: 2600, MotorTemp: 46, ThrottlePercent: 60 },
    { date: "Feb 05", MotorRPM: 3400, MotorTemp: 60, ThrottlePercent: 95 },
  ],
};

const MotorAnalyticsChart = () => {
  const scooters = Object.keys(motorDataByScooter);
  const [selectedScooter, setSelectedScooter] = useState(scooters[0]);
  const data = motorDataByScooter[selectedScooter];

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${
                entry.name.includes("RPM")
                  ? " RPM"
                  : entry.name.includes("Temperature")
                  ? "°C"
                  : "%"
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                Motor Performance Analytics
              </h1>
              <p className="text-slate-400">
                Real-time monitoring and analysis for {selectedScooter}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-slate-300 font-medium">
                Select Scooter:
              </label>
              <select
                value={selectedScooter}
                onChange={(e) => setSelectedScooter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                {scooters.map((scooter) => (
                  <option
                    key={scooter}
                    value={scooter}
                    className="bg-slate-800"
                  >
                    {scooter}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg RPM</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {Math.round(
                    data.reduce((sum, item) => sum + item.MotorRPM, 0) /
                      data.length
                  )}
                </p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Avg Temperature
                </p>
                <p className="text-2xl font-bold text-orange-400">
                  {Math.round(
                    data.reduce((sum, item) => sum + item.MotorTemp, 0) /
                      data.length
                  )}
                  °C
                </p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Thermometer className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Avg Throttle
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {Math.round(
                    data.reduce((sum, item) => sum + item.ThrottlePercent, 0) /
                      data.length
                  )}
                  %
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Motor RPM Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-cyan-500" />
              Motor RPM Over Time
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRPM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#06b6d4"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={customTooltip} />
                  <Area
                    type="monotone"
                    dataKey="MotorRPM"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#colorRPM)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Motor Temperature Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
              <Thermometer className="mr-2 h-5 w-5 text-orange-500" />
              Motor Temperature Over Time
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#f97316"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={customTooltip} />
                  <Area
                    type="monotone"
                    dataKey="MotorTemp"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorTemp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throttle Percentage Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-emerald-500" />
              Throttle Usage Percentage
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorThrottle"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip content={customTooltip} />
                  <Area
                    type="monotone"
                    dataKey="ThrottlePercent"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorThrottle)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Combined Motor Metrics */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-violet-500" />
              Combined Motor Metrics
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip content={customTooltip} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="MotorRPM"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Motor RPM"
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="MotorTemp"
                    stroke="#f97316"
                    strokeWidth={2}
                    name="Motor Temperature"
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ThrottlePercent"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Throttle Usage"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorAnalyticsChart;
