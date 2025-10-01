import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  Bar,
  ReferenceLine,
  ReferenceArea,
  BarChart,
} from "recharts";
import {
  AlertTriangle,
  Thermometer,
  Zap,
  Battery,
  Gauge,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  Activity,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

// Interfaces for data structures
interface VehicleDataPoint {
  CTIME: number;
  TBOXID: number;
  BATVOLT: number;
  BATCURRENT: number;
  BATTEMP: number;
  MOTORTEMP: number;
  INVERTERTEMP: number;
  MOTORRPM: number;
  BATPERCENT: number;
  THROTTLEPERCENT: number;
  BRAKESTATUS: number;
  GEARINFORMATION: number;
  STATE: string;
  INVERTER_ERROR: string;
  BATTERY_ERROR: string;
  BATSOH: number;
  BATCYCLECOUNT: number;
  TOTAL_DISTANCE_KM: number;
}

interface ThresholdBreach {
  id: string;
  timestamp: number;
  type:
    | "voltage_spike"
    | "voltage_drop"
    | "thermal_high"
    | "thermal_critical"
    | "current_high"
    | "rpm_spike";
  value: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  duration: number;
  description: string;
}

interface AnalyticsMetrics {
  totalBreaches: number;
  voltageSpikes: number;
  thermalBreaches: number;
  currentAnomalies: number;
  avgBatteryHealth: number;
  maxTemperature: number;
  maxVoltage: number;
  totalDistance: number;
  operatingTime: number;
}

// Thresholds for various parameters
const THRESHOLDS = {
  VOLTAGE: {
    SPIKE_HIGH: 84, // V - High voltage spike
    SPIKE_CRITICAL: 87, // V - Critical voltage spike
    DROP_LOW: 36, // V - Low voltage drop
    DROP_CRITICAL: 30, // V - Critical voltage drop
  },
  TEMPERATURE: {
    MOTOR_HIGH: 75, // °C - High motor temperature
    MOTOR_CRITICAL: 85, // °C - Critical motor temperature
    BATTERY_HIGH: 45, // °C - High battery temperature
    BATTERY_CRITICAL: 55, // °C - Critical battery temperature
    INVERTER_HIGH: 70, // °C - High inverter temperature
    INVERTER_CRITICAL: 80, // °C - Critical inverter temperature
  },
  CURRENT: {
    HIGH: 150, // A - High current
    CRITICAL: 200, // A - Critical current
  },
  RPM: {
    SPIKE: 4000, // RPM - RPM spike threshold
  },
};

// Mock data generator
const generateMockData = (): VehicleDataPoint[] => {
  const data: VehicleDataPoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  // Generate data points every 5 minutes for 30 days
  const totalPoints = (30 * 24 * 60) / 5; // ~8640 points

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = thirtyDaysAgo + i * 5 * 60;

    // Base values with realistic variations
    const baseVoltage =
      48 + Math.sin(i * 0.001) * 5 + (Math.random() - 0.5) * 2;
    const baseCurrent =
      50 + Math.sin(i * 0.002) * 30 + (Math.random() - 0.5) * 10;
    const baseMotorTemp =
      35 + Math.sin(i * 0.0015) * 15 + (Math.random() - 0.5) * 5;
    const baseBatTemp =
      25 + Math.sin(i * 0.0008) * 8 + (Math.random() - 0.5) * 3;
    const baseInverterTemp =
      40 + Math.sin(i * 0.0012) * 10 + (Math.random() - 0.5) * 4;
    const baseRPM = Math.random() > 0.3 ? Math.random() * 3500 + 500 : 0;

    // Introduce anomalies
    let voltage = baseVoltage;
    let current = baseCurrent;
    let motorTemp = baseMotorTemp;
    let batTemp = baseBatTemp;
    let inverterTemp = baseInverterTemp;
    let rpm = baseRPM;

    // Voltage spikes (2% chance)
    if (Math.random() < 0.02) {
      voltage =
        Math.random() > 0.5
          ? THRESHOLDS.VOLTAGE.SPIKE_HIGH + Math.random() * 10
          : THRESHOLDS.VOLTAGE.DROP_LOW - Math.random() * 8;
    }

    // Temperature spikes (1.5% chance)
    if (Math.random() < 0.015) {
      motorTemp = THRESHOLDS.TEMPERATURE.MOTOR_HIGH + Math.random() * 20;
    }
    if (Math.random() < 0.01) {
      batTemp = THRESHOLDS.TEMPERATURE.BATTERY_HIGH + Math.random() * 15;
    }
    if (Math.random() < 0.012) {
      inverterTemp = THRESHOLDS.TEMPERATURE.INVERTER_HIGH + Math.random() * 18;
    }

    // Current spikes (1% chance)
    if (Math.random() < 0.01) {
      current = THRESHOLDS.CURRENT.HIGH + Math.random() * 80;
    }

    // RPM spikes (0.5% chance)
    if (Math.random() < 0.005) {
      rpm = THRESHOLDS.RPM.SPIKE + Math.random() * 1000;
    }

    const states = ["Running", "Idle", "Charging", "Parked", "Maintenance"];
    const state = states[Math.floor(Math.random() * states.length)];

    data.push({
      CTIME: timestamp,
      TBOXID: 862487061363723,
      BATVOLT: Math.max(0, voltage),
      BATCURRENT: Math.abs(current),
      BATTEMP: Math.max(0, batTemp),
      MOTORTEMP: Math.max(0, motorTemp),
      INVERTERTEMP: Math.max(0, inverterTemp),
      MOTORRPM: Math.max(0, rpm),
      BATPERCENT: Math.max(
        0,
        Math.min(
          100,
          80 + Math.sin(i * 0.001) * 15 + (Math.random() - 0.5) * 10
        )
      ),
      THROTTLEPERCENT: Math.max(
        0,
        Math.min(100, (Math.random() - 0.5) * 80 + 40)
      ),
      BRAKESTATUS: Math.random() > 0.9 ? 1 : 0,
      GEARINFORMATION: Math.floor(Math.random() * 5) + 1,
      STATE: state,
      INVERTER_ERROR:
        Math.random() > 0.95
          ? ["Thermal Warning", "Voltage Spike", "Communication Error"][
              Math.floor(Math.random() * 3)
            ]
          : "No Error",
      BATTERY_ERROR:
        Math.random() > 0.97
          ? ["Cell Imbalance", "Temperature High", "Voltage Low"][
              Math.floor(Math.random() * 3)
            ]
          : "No Error",
      BATSOH: Math.max(60, Math.min(100, 85 + (Math.random() - 0.5) * 10)),
      BATCYCLECOUNT: Math.floor(500 + i * 0.1),
      TOTAL_DISTANCE_KM: i * 0.05 + Math.random() * 0.02,
    });
  }

  return data.sort((a, b) => a.CTIME - b.CTIME);
};

// Breach detection function
const detectBreaches = (data: VehicleDataPoint[]): ThresholdBreach[] => {
  const breaches: ThresholdBreach[] = [];
  let breachId = 1;

  data.forEach((point, index) => {
    // Voltage breaches
    if (point.BATVOLT > THRESHOLDS.VOLTAGE.SPIKE_HIGH) {
      breaches.push({
        id: `voltage-${breachId++}`,
        timestamp: point.CTIME,
        type: "voltage_spike",
        value: point.BATVOLT,
        threshold: THRESHOLDS.VOLTAGE.SPIKE_HIGH,
        severity:
          point.BATVOLT > THRESHOLDS.VOLTAGE.SPIKE_CRITICAL
            ? "critical"
            : "high",
        duration: 1, // Assume 1 reading duration
        description: `Voltage spike: ${point.BATVOLT.toFixed(1)}V (Threshold: ${
          THRESHOLDS.VOLTAGE.SPIKE_HIGH
        }V)`,
      });
    }

    if (point.BATVOLT < THRESHOLDS.VOLTAGE.DROP_LOW) {
      breaches.push({
        id: `voltage-drop-${breachId++}`,
        timestamp: point.CTIME,
        type: "voltage_drop",
        value: point.BATVOLT,
        threshold: THRESHOLDS.VOLTAGE.DROP_LOW,
        severity:
          point.BATVOLT < THRESHOLDS.VOLTAGE.DROP_CRITICAL
            ? "critical"
            : "high",
        duration: 1,
        description: `Voltage drop: ${point.BATVOLT.toFixed(1)}V (Threshold: ${
          THRESHOLDS.VOLTAGE.DROP_LOW
        }V)`,
      });
    }

    // Temperature breaches
    if (point.MOTORTEMP > THRESHOLDS.TEMPERATURE.MOTOR_HIGH) {
      breaches.push({
        id: `motor-temp-${breachId++}`,
        timestamp: point.CTIME,
        type: "thermal_high",
        value: point.MOTORTEMP,
        threshold: THRESHOLDS.TEMPERATURE.MOTOR_HIGH,
        severity:
          point.MOTORTEMP > THRESHOLDS.TEMPERATURE.MOTOR_CRITICAL
            ? "critical"
            : "high",
        duration: 1,
        description: `Motor temperature: ${point.MOTORTEMP.toFixed(
          1
        )}°C (Threshold: ${THRESHOLDS.TEMPERATURE.MOTOR_HIGH}°C)`,
      });
    }

    if (point.BATTEMP > THRESHOLDS.TEMPERATURE.BATTERY_HIGH) {
      breaches.push({
        id: `bat-temp-${breachId++}`,
        timestamp: point.CTIME,
        type: "thermal_high",
        value: point.BATTEMP,
        threshold: THRESHOLDS.TEMPERATURE.BATTERY_HIGH,
        severity:
          point.BATTEMP > THRESHOLDS.TEMPERATURE.BATTERY_CRITICAL
            ? "critical"
            : "high",
        duration: 1,
        description: `Battery temperature: ${point.BATTEMP.toFixed(
          1
        )}°C (Threshold: ${THRESHOLDS.TEMPERATURE.BATTERY_HIGH}°C)`,
      });
    }

    if (point.INVERTERTEMP > THRESHOLDS.TEMPERATURE.INVERTER_HIGH) {
      breaches.push({
        id: `inverter-temp-${breachId++}`,
        timestamp: point.CTIME,
        type: "thermal_high",
        value: point.INVERTERTEMP,
        threshold: THRESHOLDS.TEMPERATURE.INVERTER_HIGH,
        severity:
          point.INVERTERTEMP > THRESHOLDS.TEMPERATURE.INVERTER_CRITICAL
            ? "critical"
            : "high",
        duration: 1,
        description: `Inverter temperature: ${point.INVERTERTEMP.toFixed(
          1
        )}°C (Threshold: ${THRESHOLDS.TEMPERATURE.INVERTER_HIGH}°C)`,
      });
    }

    // Current breaches
    if (point.BATCURRENT > THRESHOLDS.CURRENT.HIGH) {
      breaches.push({
        id: `current-${breachId++}`,
        timestamp: point.CTIME,
        type: "current_high",
        value: point.BATCURRENT,
        threshold: THRESHOLDS.CURRENT.HIGH,
        severity:
          point.BATCURRENT > THRESHOLDS.CURRENT.CRITICAL ? "critical" : "high",
        duration: 1,
        description: `High current: ${point.BATCURRENT.toFixed(
          1
        )}A (Threshold: ${THRESHOLDS.CURRENT.HIGH}A)`,
      });
    }

    // RPM spikes
    if (point.MOTORRPM > THRESHOLDS.RPM.SPIKE) {
      breaches.push({
        id: `rpm-${breachId++}`,
        timestamp: point.CTIME,
        type: "rpm_spike",
        value: point.MOTORRPM,
        threshold: THRESHOLDS.RPM.SPIKE,
        severity: "medium",
        duration: 1,
        description: `RPM spike: ${point.MOTORRPM.toFixed(0)} RPM (Threshold: ${
          THRESHOLDS.RPM.SPIKE
        } RPM)`,
      });
    }
  });

  return breaches.sort((a, b) => b.timestamp - a.timestamp);
};

// Calculate analytics metrics
const calculateMetrics = (
  data: VehicleDataPoint[],
  breaches: ThresholdBreach[]
): AnalyticsMetrics => {
  if (data.length === 0) {
    return {
      totalBreaches: 0,
      voltageSpikes: 0,
      thermalBreaches: 0,
      currentAnomalies: 0,
      avgBatteryHealth: 0,
      maxTemperature: 0,
      maxVoltage: 0,
      totalDistance: 0,
      operatingTime: 0,
    };
  }

  const voltageSpikes = breaches.filter(
    (b) => b.type === "voltage_spike" || b.type === "voltage_drop"
  ).length;
  const thermalBreaches = breaches.filter(
    (b) => b.type === "thermal_high" || b.type === "thermal_critical"
  ).length;
  const currentAnomalies = breaches.filter(
    (b) => b.type === "current_high"
  ).length;

  const avgBatteryHealth =
    data.reduce((sum, d) => sum + d.BATSOH, 0) / data.length;
  const maxTemperature = Math.max(
    ...data.map((d) => Math.max(d.MOTORTEMP, d.BATTEMP, d.INVERTERTEMP))
  );
  const maxVoltage = Math.max(...data.map((d) => d.BATVOLT));
  const totalDistance = Math.max(...data.map((d) => d.TOTAL_DISTANCE_KM));
  const operatingTime = (data[data.length - 1].CTIME - data[0].CTIME) / 3600; // hours

  return {
    totalBreaches: breaches.length,
    voltageSpikes,
    thermalBreaches,
    currentAnomalies,
    avgBatteryHealth,
    maxTemperature,
    maxVoltage,
    totalDistance,
    operatingTime,
  };
};

const MotorHistoryDashboard = () => {
  const [data, setData] = useState<VehicleDataPoint[]>([]);
  const [breaches, setBreaches] = useState<ThresholdBreach[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(
    {} as AnalyticsMetrics
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState(7); // days
  const [selectedBreachType, setSelectedBreachType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const mockData = generateMockData();
      const detectedBreaches = detectBreaches(mockData);
      const calculatedMetrics = calculateMetrics(mockData, detectedBreaches);

      setData(mockData);
      setBreaches(detectedBreaches);
      setMetrics(calculatedMetrics);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const cutoffTime = now - selectedTimeRange * 24 * 60 * 60;
    return data.filter((d) => d.CTIME >= cutoffTime);
  }, [data, selectedTimeRange]);

  const filteredBreaches = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const cutoffTime = now - selectedTimeRange * 24 * 60 * 60;
    return breaches.filter((b) => {
      const timeMatch = b.timestamp >= cutoffTime;
      const typeMatch =
        selectedBreachType === "all" || b.type === selectedBreachType;
      return timeMatch && typeMatch;
    });
  }, [breaches, selectedTimeRange, selectedBreachType]);

  // Chart data preparation
  const voltageChartData = filteredData.map((d) => ({
    timestamp: d.CTIME * 1000,
    time: new Date(d.CTIME * 1000).toLocaleString(),
    voltage: d.BATVOLT,
    current: d.BATCURRENT,
  }));

  const temperatureChartData = filteredData.map((d) => ({
    timestamp: d.CTIME * 1000,
    time: new Date(d.CTIME * 1000).toLocaleString(),
    motorTemp: d.MOTORTEMP,
    batteryTemp: d.BATTEMP,
    inverterTemp: d.INVERTERTEMP,
  }));

  const breachTrendData = useMemo(() => {
    const dailyBreaches: Record<string, number> = {};
    filteredBreaches.forEach((breach) => {
      const day = new Date(breach.timestamp * 1000).toDateString();
      dailyBreaches[day] = (dailyBreaches[day] || 0) + 1;
    });

    return Object.entries(dailyBreaches)
      .map(([day, count]) => ({
        day,
        count,
        timestamp: new Date(day).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredBreaches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">
            Loading motor history analytics...
          </p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-900/20 border-red-800";
      case "high":
        return "text-orange-400 bg-orange-900/20 border-orange-800";
      case "medium":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-800";
      case "low":
        return "text-green-400 bg-green-900/20 border-green-800";
      default:
        return "text-slate-400 bg-slate-900/20 border-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Motor History Analytics
              </h1>
              <p className="text-slate-300">
                Comprehensive diagnostic analysis for Scooter #862487061363723
              </p>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
                className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-600"
              >
                <option value={1}>Last 24 Hours</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
              <select
                value={selectedBreachType}
                onChange={(e) => setSelectedBreachType(e.target.value)}
                className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-600"
              >
                <option value="all">All Breaches</option>
                <option value="voltage_spike">Voltage Spikes</option>
                <option value="voltage_drop">Voltage Drops</option>
                <option value="thermal_high">Thermal Issues</option>
                <option value="current_high">Current Anomalies</option>
                <option value="rpm_spike">RPM Spikes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {filteredBreaches.length}
                  </div>
                  <div className="text-sm text-slate-400">Total Breaches</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.voltageSpikes}
                  </div>
                  <div className="text-sm text-slate-400">Voltage Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Thermometer className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.thermalBreaches}
                  </div>
                  <div className="text-sm text-slate-400">Thermal Breaches</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Battery className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.avgBatteryHealth.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">
                    Avg Battery Health
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voltage Analysis Chart */}
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Voltage & Current Analysis - Last {selectedTimeRange} Days
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time voltage monitoring with threshold breach detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={voltageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  stroke="#9ca3af"
                />
                <YAxis yAxisId="voltage" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="current" orientation="right" stroke="#10b981" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />

                {/* Voltage threshold lines */}
                <ReferenceLine
                  yAxisId="voltage"
                  y={THRESHOLDS.VOLTAGE.SPIKE_HIGH}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="High Voltage Threshold"
                />
                <ReferenceLine
                  yAxisId="voltage"
                  y={THRESHOLDS.VOLTAGE.DROP_LOW}
                  stroke="#f97316"
                  strokeDasharray="5 5"
                  label="Low Voltage Threshold"
                />

                <Area
                  yAxisId="voltage"
                  type="monotone"
                  dataKey="voltage"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Battery Voltage (V)"
                />
                <Line
                  yAxisId="current"
                  type="monotone"
                  dataKey="current"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Battery Current (A)"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breach Timeline and Trend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breach Trend Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Breach Frequency Trend
              </CardTitle>
              <CardDescription className="text-slate-400">
                Daily breach occurrences over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={breachTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="day"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breach Distribution */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Breach Type Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Breakdown of breach types in selected timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  filteredBreaches.reduce((acc, breach) => {
                    acc[breach.type] = (acc[breach.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => {
                  const percentage = (count / filteredBreaches.length) * 100;
                  const typeLabels = {
                    voltage_spike: "Voltage Spikes",
                    voltage_drop: "Voltage Drops",
                    thermal_high: "Thermal Issues",
                    current_high: "Current Anomalies",
                    rpm_spike: "RPM Spikes",
                  };

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">
                          {typeLabels[type as keyof typeof typeLabels]}
                        </span>
                        <span className="text-white font-semibold">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-slate-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Battery Performance */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Battery className="w-5 h-5" />
                Battery Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">State of Health</span>
                  <span className="text-white font-semibold">
                    {metrics.avgBatteryHealth.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.avgBatteryHealth > 80
                        ? "bg-green-500"
                        : metrics.avgBatteryHealth > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${metrics.avgBatteryHealth}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {metrics.maxVoltage.toFixed(1)}V
                  </div>
                  <div className="text-xs text-slate-400">Peak Voltage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {metrics.totalDistance.toFixed(1)}km
                  </div>
                  <div className="text-xs text-slate-400">Total Distance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thermal Analytics */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Thermal Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Peak Temperature</span>
                  <span className="text-white font-semibold">
                    {metrics.maxTemperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.maxTemperature < 60
                        ? "bg-green-500"
                        : metrics.maxTemperature < 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (metrics.maxTemperature / 100) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">
                    Thermal Breaches
                  </span>
                  <span className="text-red-400 font-semibold">
                    {metrics.thermalBreaches}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">
                    Operating Hours
                  </span>
                  <span className="text-blue-400 font-semibold">
                    {metrics.operatingTime.toFixed(1)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health Score */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const healthScore = Math.max(
                  0,
                  100 -
                    filteredBreaches.length * 2 -
                    metrics.thermalBreaches * 3 -
                    metrics.voltageSpikes * 4
                );
                const healthLevel =
                  healthScore > 90
                    ? "Excellent"
                    : healthScore > 75
                    ? "Good"
                    : healthScore > 60
                    ? "Fair"
                    : healthScore > 40
                    ? "Poor"
                    : "Critical";
                const healthColor =
                  healthScore > 90
                    ? "text-green-400"
                    : healthScore > 75
                    ? "text-blue-400"
                    : healthScore > 60
                    ? "text-yellow-400"
                    : healthScore > 40
                    ? "text-orange-400"
                    : "text-red-400";

                return (
                  <>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${healthColor}`}>
                        {healthScore.toFixed(0)}
                      </div>
                      <div className={`text-lg font-semibold ${healthColor}`}>
                        {healthLevel}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            healthScore > 75
                              ? "bg-gradient-to-r from-green-500 to-blue-500"
                              : healthScore > 50
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                          style={{ width: `${healthScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Level:</span>
                        <span
                          className={`font-semibold ${
                            healthScore > 75
                              ? "text-green-400"
                              : healthScore > 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {healthScore > 75
                            ? "Low"
                            : healthScore > 50
                            ? "Medium"
                            : "High"}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Recent Breach Details */}
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Threshold Breaches ({filteredBreaches.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Detailed breakdown of all threshold violations in the selected
              timeframe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBreaches.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p>No threshold breaches detected in the selected timeframe.</p>
                <p className="text-sm mt-2">
                  System operating within normal parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBreaches.slice(0, 50).map((breach) => (
                  <div
                    key={breach.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(
                      breach.severity
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {breach.type === "voltage_spike" ||
                        breach.type === "voltage_drop" ? (
                          <Zap className="w-5 h-5" />
                        ) : breach.type === "thermal_high" ||
                          breach.type === "thermal_critical" ? (
                          <Thermometer className="w-5 h-5" />
                        ) : breach.type === "current_high" ? (
                          <Activity className="w-5 h-5" />
                        ) : (
                          <Gauge className="w-5 h-5" />
                        )}
                        <div>
                          <div className="font-semibold text-white capitalize">
                            {breach.type.replace("_", " ")}
                          </div>
                          <div className="text-sm text-slate-300">
                            {new Date(breach.timestamp * 1000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                            breach.severity
                          )}`}
                        >
                          {breach.severity.toUpperCase()}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {breach.value.toFixed(1)} / {breach.threshold}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {breach.description}
                    </p>
                  </div>
                ))}
                {filteredBreaches.length > 50 && (
                  <div className="text-center text-slate-400 text-sm py-4">
                    Showing 50 of {filteredBreaches.length} breaches. Use
                    filters to narrow down results.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motor Performance Scatter Plot */}
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Motor Performance Correlation
            </CardTitle>
            <CardDescription className="text-slate-400">
              RPM vs Temperature relationship analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={filteredData.slice(0, 1000)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="MOTORRPM"
                  type="number"
                  name="Motor RPM"
                  stroke="#9ca3af"
                />
                <YAxis
                  dataKey="MOTORTEMP"
                  type="number"
                  name="Motor Temperature (°C)"
                  stroke="#9ca3af"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => [
                    `${value}${name.includes("RPM") ? " RPM" : "°C"}`,
                    name.includes("RPM") ? "Motor RPM" : "Motor Temperature",
                  ]}
                />
                <Scatter dataKey="MOTORTEMP" fill="#ef4444" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MotorHistoryDashboard;
