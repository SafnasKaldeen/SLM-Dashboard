import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Navigation,
  MapPin,
  Route,
  Activity,
  Calendar,
  Clock,
  Battery,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
  Target,
  Gauge,
  Bike,
  Globe,
  Percent,
  BarChart3,
  Map,
  Zap,
  Timer,
  Navigation2,
  MapPinIcon,
  Fuel,
  Settings,
  User,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

// -------------------- Interfaces --------------------
interface GPSPoint {
  region: string;
  meanLat: number;
  meanLng: number;
  tboxId: number;
  meanTimestamp: number;
}

interface TripSession {
  batteryName: string;
  vehicleCount: number; // This will be 1 for individual scooter
  totalDistance: number;
}

interface ScooterProfile {
  tboxId: number;
  currentRegion: string;
  batteryType: string;
  lastKnownPosition: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  totalTrips: number;
  totalDistance: number;
  averageTripDistance: number;
  averageSpeed: number;
  batteryHealth: number;
  lastMaintenanceDate: string;
  registrationDate: string;
}

interface TripAnalytics {
  dailyTrips: DailyTripData[];
  speedDistribution: SpeedRange[];
  distanceDistribution: DistanceRange[];
  timePatterns: HourlyPattern[];
  routeFrequency: RouteData[];
  performanceMetrics: PerformanceMetrics;
}

interface DailyTripData {
  date: string;
  tripCount: number;
  totalDistance: number;
  avgSpeed: number;
  totalDuration: number;
  batteryUsage: number;
}

interface SpeedRange {
  range: string;
  count: number;
  percentage: number;
  avgDistance: number;
  color: string;
}

interface DistanceRange {
  range: string;
  count: number;
  percentage: number;
  avgDuration: number;
  color: string;
}

interface HourlyPattern {
  hour: number;
  tripCount: number;
  avgDistance: number;
  avgSpeed: number;
  dayType: "weekday" | "weekend";
}

interface RouteData {
  routeId: string;
  startRegion: string;
  endRegion: string;
  frequency: number;
  avgDistance: number;
  avgDuration: number;
  avgSpeed: number;
}

interface PerformanceMetrics {
  efficiency: number; // km per battery %
  reliability: number; // % of successful trips
  utilizationRate: number; // hours active per day
  maintenanceScore: number; // health indicator
}

// -------------------- Data Generation Functions --------------------
const generateScooterProfile = (tboxId: number): ScooterProfile => {
  const batteryTypes = [
    "Samsung SDI 48V 13.5Ah",
    "CATL 52V 15.2Ah",
    "BYD Blade 50V 12.8Ah",
  ];

  const regions = ["Colombo", "Gampaha", "Negombo", "Kalutara"];
  const selectedRegion = regions[Math.floor(Math.random() * regions.length)];

  const baseCoordinates = {
    Colombo: { lat: 6.9271, lng: 79.8612 },
    Gampaha: { lat: 7.0873, lng: 80.0142 },
    Negombo: { lat: 7.2083, lng: 79.8358 },
    Kalutara: { lat: 6.5854, lng: 79.9607 },
  };

  const coord = baseCoordinates[selectedRegion] || baseCoordinates["Negombo"];

  return {
    tboxId,
    currentRegion: selectedRegion,
    batteryType: batteryTypes[Math.floor(Math.random() * batteryTypes.length)],
    lastKnownPosition: {
      lat: coord.lat + (Math.random() - 0.5) * 0.01,
      lng: coord.lng + (Math.random() - 0.5) * 0.01,
      timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Last 24 hours
    },
    totalTrips: Math.floor(Math.random() * 200) + 100,
    totalDistance: Math.floor(Math.random() * 3000) + 1500,
    averageTripDistance: 8 + Math.random() * 12,
    averageSpeed: 18 + Math.random() * 12,
    batteryHealth: 75 + Math.random() * 20,
    lastMaintenanceDate: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
    registrationDate: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
  };
};

const generateTripAnalytics = (profile: ScooterProfile): TripAnalytics => {
  // Generate daily trip data for last 30 days
  const dailyTrips: DailyTripData[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const tripCount = Math.floor(Math.random() * 8) + 1; // 1-8 trips per day
    const totalDistance =
      tripCount * (profile.averageTripDistance * (0.7 + Math.random() * 0.6));
    const avgSpeed = profile.averageSpeed * (0.8 + Math.random() * 0.4);

    dailyTrips.push({
      date: date.toISOString().split("T")[0],
      tripCount,
      totalDistance,
      avgSpeed,
      totalDuration: (totalDistance / avgSpeed) * 60, // minutes
      batteryUsage: (totalDistance / profile.averageTripDistance) * 15, // % battery per km
    });
  }

  // Speed distribution
  const speedDistribution: SpeedRange[] = [
    {
      range: "0-10 km/h",
      count: 0,
      percentage: 0,
      avgDistance: 0,
      color: "#64748b",
    },
    {
      range: "10-20 km/h",
      count: 0,
      percentage: 0,
      avgDistance: 0,
      color: "#10b981",
    },
    {
      range: "20-30 km/h",
      count: 0,
      percentage: 0,
      avgDistance: 0,
      color: "#3b82f6",
    },
    {
      range: "30-40 km/h",
      count: 0,
      percentage: 0,
      avgDistance: 0,
      color: "#f59e0b",
    },
    {
      range: "40+ km/h",
      count: 0,
      percentage: 0,
      avgDistance: 0,
      color: "#ef4444",
    },
  ];

  // Simulate speed distribution
  const totalSegments = 1000;
  for (let i = 0; i < totalSegments; i++) {
    const speed = Math.abs(Math.random() * 45); // 0-45 km/h
    let rangeIndex = 0;
    if (speed >= 40) rangeIndex = 4;
    else if (speed >= 30) rangeIndex = 3;
    else if (speed >= 20) rangeIndex = 2;
    else if (speed >= 10) rangeIndex = 1;
    else rangeIndex = 0;

    speedDistribution[rangeIndex].count++;
    speedDistribution[rangeIndex].avgDistance += Math.random() * 2 + 0.5; // 0.5-2.5 km segments
  }

  speedDistribution.forEach((range) => {
    range.percentage = (range.count / totalSegments) * 100;
    range.avgDistance = range.count > 0 ? range.avgDistance / range.count : 0;
  });

  // Distance distribution
  const distanceDistribution: DistanceRange[] = [
    {
      range: "0-2 km",
      count: 0,
      percentage: 0,
      avgDuration: 0,
      color: "#64748b",
    },
    {
      range: "2-5 km",
      count: 0,
      percentage: 0,
      avgDuration: 0,
      color: "#10b981",
    },
    {
      range: "5-10 km",
      count: 0,
      percentage: 0,
      avgDuration: 0,
      color: "#3b82f6",
    },
    {
      range: "10-20 km",
      count: 0,
      percentage: 0,
      avgDuration: 0,
      color: "#f59e0b",
    },
    {
      range: "20+ km",
      count: 0,
      percentage: 0,
      avgDuration: 0,
      color: "#ef4444",
    },
  ];

  // Simulate trip distances
  for (let i = 0; i < profile.totalTrips; i++) {
    const distance = Math.abs(
      profile.averageTripDistance * (0.3 + Math.random() * 1.4)
    );
    let rangeIndex = 0;
    if (distance >= 20) rangeIndex = 4;
    else if (distance >= 10) rangeIndex = 3;
    else if (distance >= 5) rangeIndex = 2;
    else if (distance >= 2) rangeIndex = 1;
    else rangeIndex = 0;

    distanceDistribution[rangeIndex].count++;
    distanceDistribution[rangeIndex].avgDuration +=
      (distance / profile.averageSpeed) * 60;
  }

  distanceDistribution.forEach((range) => {
    range.percentage = (range.count / profile.totalTrips) * 100;
    range.avgDuration = range.count > 0 ? range.avgDuration / range.count : 0;
  });

  // Hourly patterns
  const timePatterns: HourlyPattern[] = [];
  for (let hour = 0; hour < 24; hour++) {
    // Simulate realistic usage patterns
    let tripCount = 0;
    if (hour >= 7 && hour <= 9)
      tripCount = Math.floor(Math.random() * 5) + 2; // Morning peak
    else if (hour >= 12 && hour <= 14)
      tripCount = Math.floor(Math.random() * 4) + 1; // Lunch
    else if (hour >= 17 && hour <= 19)
      tripCount = Math.floor(Math.random() * 6) + 3; // Evening peak
    else if (hour >= 20 && hour <= 22)
      tripCount = Math.floor(Math.random() * 3) + 1; // Evening
    else tripCount = Math.floor(Math.random() * 2); // Other hours

    timePatterns.push({
      hour,
      tripCount,
      avgDistance: profile.averageTripDistance * (0.7 + Math.random() * 0.6),
      avgSpeed: profile.averageSpeed * (0.8 + Math.random() * 0.4),
      dayType: "weekday",
    });

    // Weekend pattern (slightly different)
    timePatterns.push({
      hour,
      tripCount: Math.floor(tripCount * 0.7), // Less usage on weekends
      avgDistance: profile.averageTripDistance * (0.9 + Math.random() * 0.4),
      avgSpeed: profile.averageSpeed * (0.7 + Math.random() * 0.5),
      dayType: "weekend",
    });
  }

  // Route frequency
  const routes = [
    "Home to Work",
    "Work to Home",
    "Home to Shopping",
    "Shopping to Home",
    "Central Area Loop",
    "Coastal Route",
    "University Route",
    "Hospital Route",
  ];

  const routeFrequency: RouteData[] = routes
    .map((route, index) => ({
      routeId: `route_${index + 1}`,
      startRegion: profile.currentRegion,
      endRegion: Math.random() > 0.5 ? profile.currentRegion : "Adjacent Area",
      frequency: Math.floor(Math.random() * 30) + 5,
      avgDistance: 3 + Math.random() * 15,
      avgDuration: 15 + Math.random() * 25,
      avgSpeed: 15 + Math.random() * 15,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Performance metrics
  const performanceMetrics: PerformanceMetrics = {
    efficiency: 2.5 + Math.random() * 1.5, // km per battery %
    reliability: 85 + Math.random() * 12, // % successful trips
    utilizationRate: 3 + Math.random() * 4, // hours active per day
    maintenanceScore: profile.batteryHealth * 0.8 + Math.random() * 15,
  };

  return {
    dailyTrips,
    speedDistribution,
    distanceDistribution,
    timePatterns,
    routeFrequency,
    performanceMetrics,
  };
};

// -------------------- Utility Functions --------------------
const formatDistance = (km: number): string => {
  if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
  return `${km.toFixed(1)} km`;
};

const formatSpeed = (kmh: number): string => {
  return `${kmh.toFixed(1)} km/h`;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6);
};

const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// -------------------- Components --------------------
const LoadingSkeleton = () => (
  <div className="h-[300px] w-full bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-slate-400">Loading scooter analytics...</div>
  </div>
);

const MetricCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "text-blue-400",
  trend,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  subtitle: string;
  color?: string;
  trend?: { direction: "up" | "down" | "stable"; value: string };
}) => (
  <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-slate-400">{title}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.direction === "up"
                ? "text-green-400"
                : trend.direction === "down"
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
            {trend.direction === "down" && (
              <TrendingUp className="w-3 h-3 rotate-180" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
    </CardContent>
  </Card>
);

// -------------------- Main Component --------------------
export default function ScooterAnalyticsDashboard() {
  const [scooterData, setScooterData] = useState<{
    profile: ScooterProfile;
    analytics: TripAnalytics;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTboxId] = useState(862487061409385); // Parametrized scooter ID

  const fetchScooterData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, these would be API calls:
      // const gpsData = await fetchGPSData(selectedTboxId);
      // const tripData = await fetchTripData(selectedTboxId);

      const profile = generateScooterProfile(selectedTboxId);
      const analytics = generateTripAnalytics(profile);

      setScooterData({ profile, analytics });
    } catch (err) {
      setError("Failed to load scooter data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTboxId]);

  useEffect(() => {
    fetchScooterData();
  }, [fetchScooterData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-80 bg-slate-800/50 animate-pulse rounded" />
            <div className="h-4 w-96 bg-slate-800/50 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-800/50 animate-pulse rounded-lg"
              />
            ))}
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !scooterData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchScooterData}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, analytics } = scooterData;
  const lastWeekTrips = analytics.dailyTrips
    .slice(-7)
    .reduce((sum, day) => sum + day.tripCount, 0);
  const thisWeekDistance = analytics.dailyTrips
    .slice(-7)
    .reduce((sum, day) => sum + day.totalDistance, 0);

  return (
    <div className="min-h-screen text-slate-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold">Scooter Analytics</h1>
                <p className="text-slate-400">
                  TBOX ID: {profile.tboxId} • {profile.currentRegion} •{" "}
                  {profile.batteryType}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="text-slate-300">Last seen</div>
              <div className="text-slate-400">
                {formatDateTime(profile.lastKnownPosition.timestamp)}
              </div>
            </div>
            <button
              onClick={fetchScooterData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Route}
            title="Total Distance"
            value={formatDistance(profile.totalDistance)}
            subtitle={`${profile.totalTrips} total trips`}
            color="text-green-400"
            trend={{ direction: "up", value: "+12.5%" }}
          />

          <MetricCard
            icon={Gauge}
            title="Average Speed"
            value={formatSpeed(profile.averageSpeed)}
            subtitle={`Max efficiency zone`}
            color="text-blue-400"
            trend={{ direction: "stable", value: "±0.2%" }}
          />

          <MetricCard
            icon={Battery}
            title="Battery Health"
            value={`${profile.batteryHealth.toFixed(0)}%`}
            subtitle={`Last service: ${new Date(
              profile.lastMaintenanceDate
            ).toLocaleDateString()}`}
            color="text-purple-400"
            trend={{ direction: "down", value: "-2.1%" }}
          />

          <MetricCard
            icon={Activity}
            title="Weekly Activity"
            value={`${lastWeekTrips} trips`}
            subtitle={`${formatDistance(thisWeekDistance)} this week`}
            color="text-orange-400"
            trend={{ direction: "up", value: "+8.3%" }}
          />
        </div>

        {/* Trip Activity Timeline */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Calendar className="w-5 h-5 text-blue-400" />
              Daily Trip Activity (Last 30 Days)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Trip count, distance, and average speed trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={analytics.dailyTrips}>
                <defs>
                  <linearGradient
                    id="distanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) =>
                    new Date(value).getDate().toString()
                  }
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl border-slate-700">
                          <div className="text-sm font-medium text-slate-200 mb-2">
                            {new Date(label).toLocaleDateString()}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Trips:</span>
                              <span className="text-blue-400">
                                {
                                  payload.find((p) => p.dataKey === "tripCount")
                                    ?.value
                                }
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Distance:</span>
                              <span className="text-green-400">
                                {formatDistance(
                                  (payload.find(
                                    (p) => p.dataKey === "totalDistance"
                                  )?.value as number) || 0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Avg Speed:</span>
                              <span className="text-orange-400">
                                {formatSpeed(
                                  (payload.find((p) => p.dataKey === "avgSpeed")
                                    ?.value as number) || 0
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">
                                Battery Used:
                              </span>
                              <span className="text-purple-400">
                                {(
                                  (payload.find(
                                    (p) => p.dataKey === "batteryUsage"
                                  )?.value as number) || 0
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalDistance"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#distanceGradient)"
                  name="Distance (km)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="tripCount"
                  fill="#3b82f6"
                  name="Trip Count"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgSpeed"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Avg Speed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Speed and Distance Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Gauge className="w-5 h-5 text-blue-400" />
                Speed Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Time spent in different speed ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.speedDistribution.filter(
                      (s) => s.count > 0
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={30}
                    dataKey="count"
                    nameKey="range"
                  >
                    {analytics.speedDistribution
                      .filter((s) => s.count > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl border-slate-700">
                            <div className="text-sm font-medium text-slate-200 mb-2">
                              {data.range}
                            </div>
                            <div className="space-y-1 text-xs text-slate-400">
                              <div>
                                Time:{" "}
                                <span className="text-slate-300">
                                  {data.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                Segments:{" "}
                                <span className="text-slate-300">
                                  {data.count}
                                </span>
                              </div>
                              <div>
                                Avg Distance:{" "}
                                <span className="text-slate-300">
                                  {formatDistance(data.avgDistance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Route className="w-5 h-5 text-green-400" />
                Trip Distance Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Frequency of different trip lengths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.distanceDistribution.filter(
                    (d) => d.count > 0
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl border-slate-700">
                            <div className="text-sm font-medium text-slate-200 mb-2">
                              {label}
                            </div>
                            <div className="space-y-1 text-xs text-slate-400">
                              <div>
                                Trips:{" "}
                                <span className="text-slate-300">
                                  {data.count}
                                </span>
                              </div>
                              <div>
                                Percentage:{" "}
                                <span className="text-slate-300">
                                  {data.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                Avg Duration:{" "}
                                <span className="text-slate-300">
                                  {formatDuration(data.avgDuration)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" name="Trip Count">
                    {analytics.distanceDistribution
                      .filter((d) => d.count > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Usage Patterns */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Clock className="w-5 h-5 text-purple-400" />
              Hourly Usage Patterns
            </CardTitle>
            <CardDescription className="text-slate-400">
              Trip frequency throughout the day - weekdays vs weekends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={analytics.timePatterns
                  .reduce((acc, pattern) => {
                    const existing = acc.find((p) => p.hour === pattern.hour);
                    if (existing) {
                      existing[pattern.dayType] = pattern.tripCount;
                      existing[`${pattern.dayType}_distance`] =
                        pattern.avgDistance;
                    } else {
                      acc.push({
                        hour: pattern.hour,
                        [pattern.dayType]: pattern.tripCount,
                        [`${pattern.dayType}_distance`]: pattern.avgDistance,
                      });
                    }
                    return acc;
                  }, [] as any[])
                  .sort((a, b) => a.hour - b.hour)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl border-slate-700">
                          <div className="text-sm font-medium text-slate-200 mb-2">
                            {label}:00 - {(parseInt(label) + 1) % 24}:00
                          </div>
                          <div className="space-y-1 text-xs">
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                className="flex justify-between gap-4"
                              >
                                <span style={{ color: entry.color }}>
                                  {entry.dataKey?.includes("distance")
                                    ? "Avg Distance"
                                    : entry.name}
                                  :
                                </span>
                                <span className="text-slate-300">
                                  {entry.dataKey?.includes("distance")
                                    ? formatDistance(entry.value as number)
                                    : `${entry.value} trips`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="weekday"
                  fill="#3b82f6"
                  name="Weekday Trips"
                />
                <Bar
                  yAxisId="left"
                  dataKey="weekend"
                  fill="#10b981"
                  name="Weekend Trips"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="weekday_distance"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Weekday Avg Distance"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Route Analysis and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Top Routes
              </CardTitle>
              <CardDescription className="text-slate-400">
                Most frequently traveled routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.routeFrequency.map((route, index) => (
                  <div
                    key={route.routeId}
                    className="p-4 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              "#3b82f6",
                              "#10b981",
                              "#f59e0b",
                              "#ef4444",
                              "#8b5cf6",
                            ][index % 5],
                          }}
                        />
                        <span className="font-medium text-slate-200">
                          {route.routeId.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-slate-400">
                        {route.frequency} trips
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-slate-500 mt-2">
                      <div>
                        <span>Distance: </span>
                        <span className="text-slate-300">
                          {formatDistance(route.avgDistance)}
                        </span>
                      </div>
                      <div>
                        <span>Duration: </span>
                        <span className="text-slate-300">
                          {formatDuration(route.avgDuration)}
                        </span>
                      </div>
                      <div>
                        <span>Speed: </span>
                        <span className="text-slate-300">
                          {formatSpeed(route.avgSpeed)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Target className="w-5 h-5 text-orange-400" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Efficiency and reliability indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Efficiency Gauge */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      Energy Efficiency
                    </span>
                    <span className="text-sm text-slate-200">
                      {analytics.performanceMetrics.efficiency.toFixed(1)} km/%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (analytics.performanceMetrics.efficiency / 5) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Reliability */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      Trip Reliability
                    </span>
                    <span className="text-sm text-slate-200">
                      {analytics.performanceMetrics.reliability.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics.performanceMetrics.reliability}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Utilization Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      Daily Utilization
                    </span>
                    <span className="text-sm text-slate-200">
                      {analytics.performanceMetrics.utilizationRate.toFixed(1)}{" "}
                      hrs/day
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (analytics.performanceMetrics.utilizationRate / 8) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Maintenance Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      Maintenance Score
                    </span>
                    <span className="text-sm text-slate-200">
                      {analytics.performanceMetrics.maintenanceScore.toFixed(0)}
                      /100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        analytics.performanceMetrics.maintenanceScore > 80
                          ? "bg-green-400"
                          : analytics.performanceMetrics.maintenanceScore > 60
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{
                        width: `${analytics.performanceMetrics.maintenanceScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
