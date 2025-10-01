"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Battery,
  Thermometer,
  Zap,
  AlertTriangle,
  Wifi,
} from "lucide-react";

export function CabinetAnalytics({
  currentData,
  historicalData,
  timestamps,
  currentTimestamp,
  anomalyDetector,
  filterType,
}) {
  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (!historicalData.length || !timestamps.length) return [];

    const dataByTimestamp = {};

    historicalData.forEach((row) => {
      if (!dataByTimestamp[row.timestamp]) {
        dataByTimestamp[row.timestamp] = {
          timestamp: row.timestamp,
          time: new Date(row.timestamp * 1000).toLocaleTimeString(),
          avgBattery: 0,
          avgTemp: 0,
          avgVoltage: 0,
          avgCurrent: 0,
          totalEnergy: 0,
          onlineCount: 0,
          chargingCount: 0,
          anomalyCount: 0,
          cabinetCount: 0,
        };
      }

      const entry = dataByTimestamp[row.timestamp];
      entry.avgBattery += row.kwh || 0;
      entry.avgTemp += row.cell_temp || 0;
      entry.avgVoltage += row.v || 0;
      entry.avgCurrent += row.i || 0;
      entry.totalEnergy += row.kwh || 0;
      entry.onlineCount += row.communication === 1 ? 1 : 0;
      entry.chargingCount += row.charger_online === 1 ? 1 : 0;
      entry.cabinetCount += 1;
    });

    return Object.values(dataByTimestamp)
      .map((entry) => ({
        ...entry,
        avgBattery:
          entry.cabinetCount > 0
            ? Math.round(entry.avgBattery / entry.cabinetCount)
            : 0,
        avgTemp:
          entry.cabinetCount > 0
            ? Math.round(entry.avgTemp / entry.cabinetCount)
            : 0,
        avgVoltage:
          entry.cabinetCount > 0
            ? Math.round(entry.avgVoltage / entry.cabinetCount)
            : 0,
        avgCurrent:
          entry.cabinetCount > 0
            ? Math.round((entry.avgCurrent / entry.cabinetCount) * 10) / 10
            : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-20); // Show last 20 data points
  }, [historicalData, timestamps]);

  // Current snapshot metrics
  const currentMetrics = useMemo(() => {
    const activeData = currentData.filter((c) => c.timestamp);

    if (activeData.length === 0) {
      return {
        totalCabinets: currentData.length,
        activeCabinets: 0,
        avgBattery: 0,
        avgTemp: 0,
        chargingCount: 0,
        onlineCount: 0,
        anomalyCount: 0,
        healthScore: 0,
      };
    }

    const totalBattery = activeData.reduce(
      (sum, c) => sum + (c.battery || 0),
      0
    );
    const totalTemp = activeData.reduce(
      (sum, c) => sum + (c.cell_temp || 0),
      0
    );
    const chargingCount = activeData.filter(
      (c) => c.charger_online === 1
    ).length;
    const onlineCount = activeData.filter((c) => c.communication === 1).length;

    let anomalyCount = 0;
    activeData.forEach((cabinet) => {
      const anomalies = anomalyDetector.detectAnomalies(cabinet, null);
      anomalyCount += anomalies.length;
    });

    const healthScore = Math.round((onlineCount / activeData.length) * 100);

    return {
      totalCabinets: currentData.length,
      activeCabinets: activeData.length,
      avgBattery: Math.round(totalBattery / activeData.length),
      avgTemp: Math.round(totalTemp / activeData.length),
      chargingCount,
      onlineCount,
      anomalyCount,
      healthScore,
    };
  }, [currentData, anomalyDetector]);

  // Cabinet distribution data
  const cabinetDistribution = useMemo(() => {
    const distribution = currentData.map((cabinet) => ({
      cabinet: `C${cabinet.no}`,
      battery: cabinet.battery || 0,
      temperature: cabinet.cell_temp || 0,
      voltage: cabinet.v || 0,
      current: cabinet.i || 0,
      online: cabinet.communication === 1 ? 1 : 0,
      charging: cabinet.charger_online === 1 ? 1 : 0,
    }));

    return distribution.sort((a, b) => a.cabinet.localeCompare(b.cabinet));
  }, [currentData]);

  // Battery vs Temperature correlation
  const correlationData = useMemo(() => {
    return currentData
      .filter((c) => c.timestamp && c.battery > 0 && c.cell_temp > 0)
      .map((c) => ({
        battery: c.battery,
        temperature: c.cell_temp,
        cabinet: c.no,
        charging: c.charger_online === 1,
      }));
  }, [currentData]);

  // Status summary for pie chart equivalent
  const statusSummary = useMemo(() => {
    const summary = [
      { name: "Online", value: currentMetrics.onlineCount, color: "#10b981" },
      {
        name: "Offline",
        value: currentMetrics.activeCabinets - currentMetrics.onlineCount,
        color: "#ef4444",
      },
      {
        name: "Charging",
        value: currentMetrics.chargingCount,
        color: "#f59e0b",
      },
      {
        name: "Inactive",
        value: currentMetrics.totalCabinets - currentMetrics.activeCabinets,
        color: "#6b7280",
      },
    ];
    return summary.filter((item) => item.value > 0);
  }, [currentMetrics]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-200 font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey.includes("avg")
                  ? entry.dataKey.includes("Battery")
                    ? "%"
                    : entry.dataKey.includes("Temp")
                    ? "°C"
                    : entry.dataKey.includes("Voltage")
                    ? "V"
                    : entry.dataKey.includes("Current")
                    ? "A"
                    : ""
                  : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">
          Analytics Dashboard
        </h2>
        <div className="text-sm text-slate-400">
          Filter:{" "}
          <span className="text-slate-200 capitalize">
            {filterType.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Health Score</span>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {currentMetrics.healthScore}%
            </div>
            <div className="text-xs text-slate-500">
              {currentMetrics.onlineCount}/{currentMetrics.activeCabinets}{" "}
              online
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Avg Charge</span>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {currentMetrics.avgBattery}%
            </div>
            <div className="text-xs text-slate-500">Across active cabinets</div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Charging</span>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {currentMetrics.chargingCount}
            </div>
            <div className="text-xs text-slate-500">
              Active charging sessions
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-slate-400">Anomalies</span>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {currentMetrics.anomalyCount}
            </div>
            <div className="text-xs text-slate-500">Issues detected</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery Level Trends */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Battery Level Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgBattery"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temperature Monitoring */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-400" />
              Temperature Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avgTemp"
                  stroke="#ef4444"
                  fill="#ef444420"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cabinet Performance Distribution */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Cabinet Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cabinetDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="cabinet" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="battery" fill="#10b981" name="Battery %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Battery vs Temperature Correlation */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-400" />
              Battery vs Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="battery"
                  stroke="#9ca3af"
                  fontSize={12}
                  name="Battery %"
                />
                <XAxis
                  dataKey="battery"
                  stroke="#9ca3af"
                  fontSize={12}
                  name="Battery %"
                />
                <YAxis
                  dataKey="temperature"
                  stroke="#9ca3af"
                  fontSize={12}
                  name="Temperature °C"
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Voltage and Current Trends */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Voltage & Current
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgVoltage"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgCurrent"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: "#06b6d4", r: 3 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Status Overview */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">
            Summary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-200">
                {currentMetrics.totalCabinets}
              </div>
              <div className="text-sm text-slate-400">Total Cabinets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {currentMetrics.activeCabinets}
              </div>
              <div className="text-sm text-slate-400">Active Cabinets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {currentMetrics.avgTemp}°C
              </div>
              <div className="text-sm text-slate-400">Avg Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {timeSeriesData.length}
              </div>
              <div className="text-sm text-slate-400">Data Points</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
