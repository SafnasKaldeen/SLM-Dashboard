"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BatteryCharging,
  BatteryWarning,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

export default function BatteryOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [batteryData, setBatteryData] = useState(null);

  // Mock data - replace with actual API calls
  const mockData = {
    summary: {
      totalBatteries: 1247,
      healthyBatteries: 1156,
      warningBatteries: 67,
      criticalBatteries: 24,
      averageHealth: 92.3,
      averageCharge: 76.8,
      averageTemperature: 28.5,
      totalCapacity: 93525, // kWh
      availableCapacity: 71843, // kWh
      chargingBatteries: 234,
      dischargingBatteries: 189,
      idleBatteries: 824,
    },
    trends: {
      healthTrend: Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, "0")}:00`,
        health: 92 + Math.sin(i * 0.3) * 2 + Math.random() * 1,
        charge: 75 + Math.cos(i * 0.4) * 8 + Math.random() * 3,
        temperature: 28 + Math.sin(i * 0.2) * 3 + Math.random() * 2,
        voltage: 3.7 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1,
      })),
      distributionData: [
        { name: "Excellent (90-100%)", value: 856, color: "#10b981" },
        { name: "Good (80-89%)", value: 300, color: "#06b6d4" },
        { name: "Fair (70-79%)", value: 67, color: "#f59e0b" },
        { name: "Poor (<70%)", value: 24, color: "#ef4444" },
      ],
      temperatureDistribution: Array.from({ length: 12 }, (_, i) => ({
        range: `${20 + i * 2}-${22 + i * 2}°C`,
        count: Math.floor(Math.random() * 150) + 50,
        optimal: i >= 4 && i <= 7,
      })),
      voltageData: Array.from({ length: 20 }, (_, i) => ({
        battery: `B${i + 1}`,
        voltage: 3.6 + Math.random() * 0.4,
        current: -5 + Math.random() * 10,
        power: (3.6 + Math.random() * 0.4) * (-5 + Math.random() * 10),
      })),
    },
    alerts: [
      {
        id: 1,
        type: "critical",
        message: "Battery B-1247 temperature exceeding 45°C",
        time: "2 min ago",
      },
      {
        id: 2,
        type: "warning",
        message: "67 batteries showing degraded performance",
        time: "15 min ago",
      },
      {
        id: 3,
        type: "info",
        message: "Charging cycle completed for Station A-12",
        time: "1 hour ago",
      },
      {
        id: 4,
        type: "warning",
        message: "Battery B-0892 voltage drop detected",
        time: "2 hours ago",
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setBatteryData(mockData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBatteryData(mockData);
    setRefreshing(false);
  };

  const getStatusColor = (type) => {
    switch (type) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "warning":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "info":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-300 font-medium">Loading battery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Battery Management System
            </h1>
            <p className="text-slate-400">
              Comprehensive monitoring and analysis of battery fleet performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Fleet Health
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {batteryData.summary.averageHealth}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {batteryData.summary.healthyBatteries}/
                    {batteryData.summary.totalBatteries} healthy
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={batteryData.summary.averageHealth}
                  className="h-2 bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Average Charge
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {batteryData.summary.averageCharge}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {batteryData.summary.chargingBatteries} charging
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <BatteryCharging className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={batteryData.summary.averageCharge}
                  className="h-2 bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    Temperature
                  </p>
                  <p className="text-2xl font-bold text-orange-400">
                    {batteryData.summary.averageTemperature}°C
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Fleet average</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Thermometer className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={(batteryData.summary.averageTemperature / 50) * 100}
                  className="h-2 bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Capacity</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {(batteryData.summary.availableCapacity / 1000).toFixed(1)}
                    MWh
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(
                      (batteryData.summary.availableCapacity /
                        batteryData.summary.totalCapacity) *
                      100
                    ).toFixed(1)}
                    % available
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={
                    (batteryData.summary.availableCapacity /
                      batteryData.summary.totalCapacity) *
                    100
                  }
                  className="h-2 bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-slate-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-slate-700"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="data-[state=active]:bg-slate-700"
            >
              Health Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-slate-700"
            >
              Alerts & Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Battery Health Trends */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Battery Health Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={batteryData.trends.healthTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#475569",
                            color: "#e2e8f0",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="health"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Health %"
                        />
                        <Line
                          type="monotone"
                          dataKey="charge"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          name="Charge %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Health Distribution */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Health Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={batteryData.trends.distributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {batteryData.trends.distributionData.map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#475569",
                            color: "#e2e8f0",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Temperature Distribution */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  Temperature Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={batteryData.trends.temperatureDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderColor: "#475569",
                          color: "#e2e8f0",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={(entry) =>
                          entry?.optimal ? "#10b981" : "#06b6d4"
                        }
                        name="Battery Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voltage vs Current Analysis */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Voltage vs Current Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={batteryData.trends.voltageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="voltage"
                          stroke="#94a3b8"
                          name="Voltage (V)"
                        />
                        <YAxis
                          dataKey="current"
                          stroke="#94a3b8"
                          name="Current (A)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#475569",
                            color: "#e2e8f0",
                          }}
                          formatter={(value, name) => [
                            `${value.toFixed(2)}${
                              name === "voltage" ? "V" : "A"
                            }`,
                            name === "voltage" ? "Voltage" : "Current",
                          ]}
                        />
                        <Scatter dataKey="current" fill="#06b6d4" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Temperature Trends */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Temperature Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={batteryData.trends.healthTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#475569",
                            color: "#e2e8f0",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.3}
                          name="Temperature °C"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Health Status Cards */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-400">
                      Healthy
                    </h3>
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 mb-2">
                    {batteryData.summary.healthyBatteries}
                  </p>
                  <p className="text-sm text-slate-400">
                    {(
                      (batteryData.summary.healthyBatteries /
                        batteryData.summary.totalBatteries) *
                      100
                    ).toFixed(1)}
                    % of fleet
                  </p>
                  <div className="mt-4">
                    <Progress
                      value={
                        (batteryData.summary.healthyBatteries /
                          batteryData.summary.totalBatteries) *
                        100
                      }
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-amber-400">
                      Warning
                    </h3>
                    <BatteryWarning className="h-6 w-6 text-amber-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 mb-2">
                    {batteryData.summary.warningBatteries}
                  </p>
                  <p className="text-sm text-slate-400">
                    {(
                      (batteryData.summary.warningBatteries /
                        batteryData.summary.totalBatteries) *
                      100
                    ).toFixed(1)}
                    % of fleet
                  </p>
                  <div className="mt-4">
                    <Progress
                      value={
                        (batteryData.summary.warningBatteries /
                          batteryData.summary.totalBatteries) *
                        100
                      }
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-400">
                      Critical
                    </h3>
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 mb-2">
                    {batteryData.summary.criticalBatteries}
                  </p>
                  <p className="text-sm text-slate-400">
                    {(
                      (batteryData.summary.criticalBatteries /
                        batteryData.summary.totalBatteries) *
                      100
                    ).toFixed(1)}
                    % of fleet
                  </p>
                  <div className="mt-4">
                    <Progress
                      value={
                        (batteryData.summary.criticalBatteries /
                          batteryData.summary.totalBatteries) *
                        100
                      }
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batteryData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex-shrink-0">
                        {alert.type === "critical" && (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        )}
                        {alert.type === "warning" && (
                          <BatteryWarning className="h-5 w-5 text-amber-400" />
                        )}
                        {alert.type === "info" && (
                          <Activity className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 font-medium">
                          {alert.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge className={getStatusColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
