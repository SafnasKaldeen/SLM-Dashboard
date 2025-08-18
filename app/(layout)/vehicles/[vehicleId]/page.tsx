"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  Battery,
  MapPin,
  User,
  ArrowLeft,
  Zap,
  Activity,
  Settings,
  Route,
  ChevronRight,
  Gauge,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

interface VehicleDetail {
  VEHICLE_ID: string;
  VIN: string;
  MODEL: string;
  BATTERY_TYPE: string;
  STATUS: string;
  REGION: string;
  CREATED_DATE: string;
  CUSTOMER_ID?: string;
  CUSTOMER_NAME?: string;
  EMAIL?: string;
  PHONE?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  ADDRESS?: string;
  LAST_LOCATION_UPDATE?: string;
}

interface ChargingPattern {
  HOUR_OF_DAY: number;
  SESSION_COUNT: number;
  AVG_DURATION: number;
  AVG_ENERGY: number;
  AVG_COST: number;
}

interface SwappingHistory {
  SWAP_DATE: string;
  SWAP_TIME: string;
  STATION_NAME: string;
  LOCATION: string;
  OLD_BATTERY_ID: string;
  OLD_BATTERY_HEALTH: number;
  NEW_BATTERY_ID: string;
  NEW_BATTERY_HEALTH: number;
  SWAP_DURATION_SECONDS: number;
  SWAP_COST: number;
}

interface GPSAnalytics {
  TRAVEL_DATE: string;
  FIRST_LOCATION_TIME: string;
  LAST_LOCATION_TIME: string;
  LOCATION_POINTS: number;
  TOTAL_DISTANCE: number;
  AVG_SPEED: number;
  MAX_SPEED: number;
  IDLE_POINTS: number;
  ROUTE_EFFICIENCY: number;
}

interface BatteryHealth {
  BATTERY_ID: string;
  BATTERY_TYPE: string;
  CAPACITY_KWH: number;
  HEALTH_PERCENTAGE: number;
  CYCLE_COUNT: number;
  LAST_MAINTENANCE_DATE: string;
  REPLACEMENT_DATE?: string;
  TOTAL_SWAPS: number;
  LAST_SWAP_DATE: string;
}

const VehicleDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [chargingPatterns, setChargingPatterns] = useState<ChargingPattern[]>(
    []
  );
  const [swappingHistory, setSwappingHistory] = useState<SwappingHistory[]>([]);
  const [gpsAnalytics, setGpsAnalytics] = useState<GPSAnalytics[]>([]);
  const [batteryHealth, setBatteryHealth] = useState<BatteryHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      const result = await response.json();

      if (result.success) {
        setVehicle(result.data.vehicle);
        setChargingPatterns(result.data.chargingPatterns);
        setSwappingHistory(result.data.swappingHistory);
        setGpsAnalytics(result.data.gpsAnalytics);
        setBatteryHealth(result.data.batteryHealth);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch vehicle data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "INACTIVE":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "MAINTENANCE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-slate-300">Loading vehicle details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-red-400 font-medium mb-2">
                  Vehicle Not Found
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {error ||
                    `Vehicle with ID "${vehicleId}" could not be found.`}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={fetchVehicleData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fleet
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Car className="w-6 h-6 text-cyan-400" />
                <h1 className="text-3xl font-bold text-slate-100">
                  {vehicle.VEHICLE_ID}
                </h1>
                <Badge className={getStatusColor(vehicle.STATUS)}>
                  {vehicle.STATUS}
                </Badge>
              </div>
              {/* <div className="flex items-center gap-2 text-slate-400">
                <span>{vehicle.MODEL}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{vehicle.BATTERY_TYPE}</span>
                <ChevronRight className="w-4 h-4" />
                <span>VIN: {vehicle.VIN}</span>
              </div> */}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Region</div>
            <div className="text-slate-100 font-medium">{vehicle.REGION}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Battery Health</span>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-2">
                {batteryHealth.length > 0
                  ? `${batteryHealth[0].HEALTH_PERCENTAGE}%`
                  : "N/A"}
              </div>
              <Progress
                value={
                  batteryHealth.length > 0
                    ? batteryHealth[0].HEALTH_PERCENTAGE
                    : 0
                }
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Total Swaps</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {swappingHistory.length}
              </div>
              <div className="text-xs text-slate-400">Last 90 days</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">
                  Charging Sessions
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {chargingPatterns.reduce(
                  (sum, pattern) => sum + pattern.SESSION_COUNT,
                  0
                )}
              </div>
              <div className="text-xs text-slate-400">Last 30 days</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Total Distance</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {gpsAnalytics
                  .reduce((sum, day) => sum + day.TOTAL_DISTANCE, 0)
                  .toFixed(0)}{" "}
                km
              </div>
              <div className="text-xs text-slate-400">Last 30 days</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-slate-900/50 border-slate-700/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charging">Charging</TabsTrigger>
            <TabsTrigger value="swapping">Swapping</TabsTrigger>
            <TabsTrigger value="gps">GPS Analytics</TabsTrigger>
            <TabsTrigger value="battery">Battery Health</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm">Vehicle ID</div>
                      <div className="text-slate-100 font-medium">
                        {vehicle.VEHICLE_ID}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">VIN</div>
                      <div className="text-slate-100 font-medium font-mono text-sm">
                        {vehicle.VIN}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Model</div>
                      <div className="text-slate-100 font-medium">
                        {vehicle.MODEL}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Battery Type</div>
                      <div className="text-slate-100 font-medium">
                        {vehicle.BATTERY_TYPE}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Region</div>
                      <div className="text-slate-100 font-medium">
                        {vehicle.REGION}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Created Date</div>
                      <div className="text-slate-100 font-medium">
                        {new Date(vehicle.CREATED_DATE).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Current Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicle.CUSTOMER_ID ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-slate-400 text-sm">
                          Customer Name
                        </div>
                        <div className="text-slate-100 font-medium">
                          {vehicle.CUSTOMER_NAME}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Email</div>
                        <div className="text-slate-100 font-medium">
                          {vehicle.EMAIL}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Phone</div>
                        <div className="text-slate-100 font-medium">
                          {vehicle.PHONE}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Customer ID
                        </div>
                        <div className="text-slate-100 font-medium font-mono text-sm">
                          {vehicle.CUSTOMER_ID}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">No customer assigned</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                      >
                        Assign Customer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Last Recorded Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicle.LATITUDE && vehicle.LONGITUDE ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-slate-400 text-sm">Address</div>
                        <div className="text-slate-100 font-medium">
                          {vehicle.ADDRESS || "Address not available"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm">Latitude</div>
                          <div className="text-slate-100 font-medium font-mono text-sm">
                            {vehicle.LATITUDE.toFixed(6)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">
                            Longitude
                          </div>
                          <div className="text-slate-100 font-medium font-mono text-sm">
                            {vehicle.LONGITUDE.toFixed(6)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Last Update
                        </div>
                        <div className="text-slate-100 font-medium">
                          {vehicle.LAST_LOCATION_UPDATE
                            ? new Date(
                                vehicle.LAST_LOCATION_UPDATE
                              ).toLocaleString()
                            : "No recent updates"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        Location data not available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Performance Summary */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm">
                        Avg Daily Distance
                      </div>
                      <div className="text-slate-100 font-medium text-xl">
                        {gpsAnalytics.length > 0
                          ? (
                              gpsAnalytics.reduce(
                                (sum, day) => sum + day.TOTAL_DISTANCE,
                                0
                              ) / gpsAnalytics.length
                            ).toFixed(1)
                          : "0"}{" "}
                        km
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Avg Speed</div>
                      <div className="text-slate-100 font-medium text-xl">
                        {gpsAnalytics.length > 0
                          ? (
                              gpsAnalytics.reduce(
                                (sum, day) => sum + day.AVG_SPEED,
                                0
                              ) / gpsAnalytics.length
                            ).toFixed(1)
                          : "0"}{" "}
                        km/h
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">
                        Utilization Rate
                      </span>
                      <span className="text-slate-100 font-medium">
                        {gpsAnalytics.length > 0 ? "85%" : "N/A"}
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charging Tab */}
          <TabsContent value="charging" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Charging Patterns Chart */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-green-400" />
                    Charging Patterns by Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chargingPatterns.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={chargingPatterns}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="HOUR_OF_DAY" stroke="#9ca3af" />
                        <YAxis yAxisId="left" stroke="#9ca3af" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#9ca3af"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="SESSION_COUNT"
                          fill="#3b82f6"
                          name="Sessions"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="AVG_DURATION"
                          stroke="#10b981"
                          strokeWidth={3}
                          name="Avg Duration (min)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <Battery className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No charging data available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charging Statistics */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 w-5 text-blue-400" />
                    Charging Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chargingPatterns.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-400 text-sm">
                          Total Sessions
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {chargingPatterns.reduce(
                            (sum, pattern) => sum + pattern.SESSION_COUNT,
                            0
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Avg Session Duration
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {(
                            chargingPatterns.reduce(
                              (sum, pattern) => sum + pattern.AVG_DURATION,
                              0
                            ) / chargingPatterns.length
                          ).toFixed(1)}{" "}
                          min
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Avg Energy per Session
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {(
                            chargingPatterns.reduce(
                              (sum, pattern) => sum + pattern.AVG_ENERGY,
                              0
                            ) / chargingPatterns.length
                          ).toFixed(1)}{" "}
                          kWh
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Avg Cost per Session
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {formatCurrency(
                            chargingPatterns.reduce(
                              (sum, pattern) => sum + pattern.AVG_COST,
                              0
                            ) / chargingPatterns.length
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No charging statistics available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Peak Charging Hours */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Peak Charging Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chargingPatterns.length > 0 ? (
                    <div className="space-y-3">
                      {chargingPatterns
                        .sort((a, b) => b.SESSION_COUNT - a.SESSION_COUNT)
                        .slice(0, 5)
                        .map((pattern, index) => (
                          <div
                            key={pattern.HOUR_OF_DAY}
                            className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                                <span className="text-orange-400 font-medium text-sm">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <div className="text-slate-100 font-medium">
                                  {pattern.HOUR_OF_DAY}:00 -{" "}
                                  {pattern.HOUR_OF_DAY + 1}:00
                                </div>
                                <div className="text-slate-400 text-sm">
                                  {pattern.AVG_DURATION.toFixed(1)} min avg
                                  duration
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-100 font-medium">
                                {pattern.SESSION_COUNT}
                              </div>
                              <div className="text-slate-400 text-sm">
                                sessions
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No peak hour data available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Swapping Tab */}
          <TabsContent value="swapping" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Swapping History Chart */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Battery Swap History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {swappingHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={swappingHistory.slice(0, 30).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="SWAP_DATE"
                          stroke="#9ca3af"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                          labelFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="OLD_BATTERY_HEALTH"
                          stroke="#ef4444"
                          name="Old Battery Health %"
                        />
                        <Line
                          type="monotone"
                          dataKey="NEW_BATTERY_HEALTH"
                          stroke="#10b981"
                          name="New Battery Health %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No swapping history available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Swaps */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Battery Swaps</CardTitle>
                </CardHeader>
                <CardContent>
                  {swappingHistory.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {swappingHistory.slice(0, 10).map((swap, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-purple-400" />
                              <span className="text-slate-100 font-medium">
                                {swap.STATION_NAME}
                              </span>
                            </div>
                            <div className="text-slate-400 text-sm">
                              {new Date(swap.SWAP_DATE).toLocaleDateString()} at{" "}
                              {swap.SWAP_TIME}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-slate-400 text-sm">
                                Location
                              </div>
                              <div className="text-slate-100 text-sm">
                                {swap.LOCATION}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Duration
                              </div>
                              <div className="text-slate-100 text-sm">
                                {swap.SWAP_DURATION_SECONDS}s
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Cost</div>
                              <div className="text-slate-100 text-sm">
                                {formatCurrency(swap.SWAP_COST)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <div className="text-red-400 text-sm font-medium">
                                Old Battery
                              </div>
                              <div className="text-slate-100 font-mono text-sm">
                                {swap.OLD_BATTERY_ID}
                              </div>
                              <div className="text-red-400 text-sm">
                                {swap.OLD_BATTERY_HEALTH}% health
                              </div>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-green-400 text-sm font-medium">
                                New Battery
                              </div>
                              <div className="text-slate-100 font-mono text-sm">
                                {swap.NEW_BATTERY_ID}
                              </div>
                              <div className="text-green-400 text-sm">
                                {swap.NEW_BATTERY_HEALTH}% health
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No battery swap records
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* GPS Analytics Tab */}
          <TabsContent value="gps" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Distance Chart */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-orange-400" />
                    Daily Travel Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gpsAnalytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={gpsAnalytics.slice(0, 30).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="TRAVEL_DATE"
                          stroke="#9ca3af"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <YAxis yAxisId="left" stroke="#9ca3af" />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#9ca3af"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                          labelFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="TOTAL_DISTANCE"
                          fill="#f59e0b"
                          name="Distance (km)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="AVG_SPEED"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          name="Avg Speed (km/h)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <Route className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No GPS analytics available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* GPS Summary Stats */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Travel Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gpsAnalytics.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-400 text-sm">
                          Total Distance
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {gpsAnalytics
                            .reduce((sum, day) => sum + day.TOTAL_DISTANCE, 0)
                            .toFixed(0)}{" "}
                          km
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Average Speed
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {(
                            gpsAnalytics.reduce(
                              (sum, day) => sum + day.AVG_SPEED,
                              0
                            ) / gpsAnalytics.length
                          ).toFixed(1)}{" "}
                          km/h
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Max Speed Recorded
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {Math.max(
                            ...gpsAnalytics.map((day) => day.MAX_SPEED)
                          ).toFixed(1)}{" "}
                          km/h
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Active Days
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {
                            gpsAnalytics.filter((day) => day.TOTAL_DISTANCE > 0)
                              .length
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No travel data available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Route Efficiency */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple-400" />
                    Route Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gpsAnalytics.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-400 text-sm">
                          Average Efficiency
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {(
                            gpsAnalytics.reduce(
                              (sum, day) => sum + (day.ROUTE_EFFICIENCY || 0),
                              0
                            ) / gpsAnalytics.length
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Idle Time Ratio
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {gpsAnalytics.length > 0
                            ? (
                                (gpsAnalytics.reduce(
                                  (sum, day) => sum + day.IDLE_POINTS,
                                  0
                                ) /
                                  gpsAnalytics.reduce(
                                    (sum, day) => sum + day.LOCATION_POINTS,
                                    0
                                  )) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">
                          Location Points
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                          {formatNumber(
                            gpsAnalytics.reduce(
                              (sum, day) => sum + day.LOCATION_POINTS,
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No efficiency data available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Battery Health Tab */}
          <TabsContent value="battery" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Battery Health Overview */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-green-400" />
                    Battery Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {batteryHealth.length > 0 ? (
                    <div className="space-y-4">
                      {batteryHealth.map((battery, index) => (
                        <div
                          key={battery.BATTERY_ID}
                          className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Battery className="w-4 h-4 text-green-400" />
                              <span className="text-slate-100 font-medium font-mono">
                                {battery.BATTERY_ID}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {battery.BATTERY_TYPE}
                              </Badge>
                            </div>
                            <div className="text-slate-100 font-medium">
                              {battery.HEALTH_PERCENTAGE}% Health
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-slate-400 text-sm">
                                Capacity
                              </div>
                              <div className="text-slate-100 text-sm">
                                {battery.CAPACITY_KWH} kWh
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Cycle Count
                              </div>
                              <div className="text-slate-100 text-sm">
                                {formatNumber(battery.CYCLE_COUNT)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Total Swaps
                              </div>
                              <div className="text-slate-100 text-sm">
                                {formatNumber(battery.TOTAL_SWAPS)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Last Swap
                              </div>
                              <div className="text-slate-100 text-sm">
                                {new Date(
                                  battery.LAST_SWAP_DATE
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">
                                Health Status
                              </span>
                              <span
                                className={`font-medium ${
                                  battery.HEALTH_PERCENTAGE >= 90
                                    ? "text-green-400"
                                    : battery.HEALTH_PERCENTAGE >= 70
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {battery.HEALTH_PERCENTAGE >= 90
                                  ? "Excellent"
                                  : battery.HEALTH_PERCENTAGE >= 70
                                  ? "Good"
                                  : "Needs Attention"}
                              </span>
                            </div>
                            <Progress
                              value={battery.HEALTH_PERCENTAGE}
                              className="h-2"
                            />
                          </div>

                          {battery.LAST_MAINTENANCE_DATE && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <div className="text-slate-400 text-sm">
                                Last Maintenance
                              </div>
                              <div className="text-slate-100 text-sm">
                                {new Date(
                                  battery.LAST_MAINTENANCE_DATE
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Battery className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400">
                        No battery health data available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance KPIs */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Performance KPIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">
                          Utilization Rate
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mb-2">
                        85.2%
                      </div>
                      <Progress value={85.2} className="h-2" />
                      <div className="text-xs text-slate-400 mt-1">
                        Target: 80%
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">
                          Revenue Efficiency
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mb-2">
                        92.7%
                      </div>
                      <Progress value={92.7} className="h-2" />
                      <div className="text-xs text-slate-400 mt-1">
                        Target: 85%
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">
                          Maintenance Score
                        </span>
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mb-2">
                        78.3%
                      </div>
                      <Progress value={78.3} className="h-2" />
                      <div className="text-xs text-slate-400 mt-1">
                        Target: 90%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trends */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={gpsAnalytics.slice(0, 14).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="TRAVEL_DATE"
                        stroke="#9ca3af"
                        tickFormatter={(date) =>
                          new Date(date).getDate().toString()
                        }
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="ROUTE_EFFICIENCY"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.3}
                        name="Route Efficiency %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-slate-900/50 border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                      <h4 className="text-green-400 font-medium mb-1">
                        Excellent Performance
                      </h4>
                      <p className="text-slate-300 text-sm">
                        Vehicle is performing above target in utilization and
                        revenue efficiency.
                      </p>
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
                      <h4 className="text-orange-400 font-medium mb-1">
                        Maintenance Needed
                      </h4>
                      <p className="text-slate-300 text-sm">
                        Schedule preventive maintenance to improve overall
                        performance score.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
                      <h4 className="text-blue-400 font-medium mb-1">
                        Optimization Opportunity
                      </h4>
                      <p className="text-slate-300 text-sm">
                        Route optimization could improve efficiency by an
                        estimated 8-12%.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
