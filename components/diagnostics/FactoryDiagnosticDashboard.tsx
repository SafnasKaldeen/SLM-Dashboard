import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RefreshCw,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Battery,
  Thermometer,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  MapPin,
  Clock,
  BarChart3,
  LineChart,
  Calendar,
  AlertCircle,
  Wrench,
  Target,
  Users,
  Shield,
  Wifi,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";

// Enhanced Types
interface SignificantEvent {
  id: string;
  date: string;
  type: "maintenance" | "anomaly" | "alert" | "milestone";
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  value?: number;
  unit?: string;
  component: string;
}

interface DailyMetrics {
  date: string;
  batteryHealth: number;
  batteryTemp: number;
  batteryVoltage: number;
  motorTemp: number;
  motorRPM: number;
  distance: number;
  operatingHours: number;
  errorCount: number;
  chargingCycles: number;
  efficiency: number;
  vibration: number;
  inverterTemp: number;
  throttleUsage: number;
  brakeEvents: number;
  speedMax: number;
}

interface ComponentHealth {
  component: string;
  health: number;
  status: "excellent" | "good" | "fair" | "poor";
  lastService: string;
  nextService: string;
  criticalIssues: number;
  trend: "improving" | "stable" | "declining";
}

interface DiagnosticReport {
  scooterId: number;
  timestamp: string;
  overallHealth: number;
  significantEvents: SignificantEvent[];
  dailyMetrics: DailyMetrics[];
  componentHealth: ComponentHealth[];
  predictiveInsights: {
    batteryLifeRemaining: number;
    motorServiceDue: number;
    criticalMaintenanceAlerts: string[];
    recommendedActions: string[];
  };
  performanceMetrics: {
    reliability: number;
    efficiency: number;
    utilization: number;
    safetyScore: number;
  };
  comparisonData: {
    fleetAverage: number;
    topPerformer: number;
    ranking: number;
    totalFleetSize: number;
  };
}

// Enhanced Mock Hook
const use30DayDiagnosticData = (scooterId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosticReport, setDiagnosticReport] =
    useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMock30DayData = (): DiagnosticReport => {
    const today = new Date();

    // Generate 30 days of daily metrics
    const dailyMetrics: DailyMetrics[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));

      // Add realistic patterns and anomalies
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Simulate degradation over time
      const degradationFactor = 1 - i * 0.002;

      return {
        date: date.toISOString().split("T")[0],
        batteryHealth: Math.max(75, 95 - i * 0.3 + (Math.random() * 4 - 2)),
        batteryTemp: 25 + Math.random() * 20 + (isWeekend ? -5 : 0),
        batteryVoltage: 48.2 * degradationFactor + (Math.random() * 2 - 1),
        motorTemp: 45 + Math.random() * 25 + (isWeekend ? -8 : 0),
        motorRPM: isWeekend
          ? 1200 + Math.random() * 800
          : 2500 + Math.random() * 1500,
        distance: isWeekend ? 15 + Math.random() * 20 : 35 + Math.random() * 25,
        operatingHours: isWeekend
          ? 3 + Math.random() * 4
          : 7 + Math.random() * 3,
        errorCount: Math.floor(Math.random() * 5) + (i > 20 ? 2 : 0),
        chargingCycles: Math.floor(Math.random() * 3) + 1,
        efficiency: 85 + Math.random() * 10 - i * 0.1,
        vibration: 0.5 + Math.random() * 1.5 + (i > 25 ? 0.8 : 0),
        inverterTemp: 35 + Math.random() * 15,
        throttleUsage: 30 + Math.random() * 40,
        brakeEvents: 80 + Math.random() * 60,
        speedMax: 25 + Math.random() * 15,
      };
    });

    // Generate significant events
    const significantEvents: SignificantEvent[] = [
      {
        id: "1",
        date: dailyMetrics[5].date,
        type: "maintenance",
        severity: "info",
        title: "Routine Maintenance Completed",
        description: "Battery calibration and motor inspection performed",
        component: "Battery & Motor",
      },
      {
        id: "2",
        date: dailyMetrics[12].date,
        type: "anomaly",
        severity: "warning",
        title: "High Temperature Event",
        description: "Motor temperature exceeded 75°C during operation",
        value: 78,
        unit: "°C",
        component: "Motor",
      },
      {
        id: "3",
        date: dailyMetrics[18].date,
        type: "alert",
        severity: "critical",
        title: "Battery Health Drop",
        description: "Sudden 5% drop in battery health detected",
        value: 5,
        unit: "%",
        component: "Battery",
      },
      {
        id: "4",
        date: dailyMetrics[25].date,
        type: "milestone",
        severity: "success",
        title: "10,000 km Milestone",
        description: "Vehicle reached 10,000 km total distance",
        value: 10000,
        unit: "km",
        component: "Odometer",
      },
    ];

    // Component health analysis
    const componentHealth: ComponentHealth[] = [
      {
        component: "Battery Pack",
        health: 82,
        status: "good",
        lastService: "2024-08-15",
        nextService: "2025-02-15",
        criticalIssues: 1,
        trend: "declining",
      },
      {
        component: "Motor System",
        health: 88,
        status: "good",
        lastService: "2024-08-15",
        nextService: "2025-03-15",
        criticalIssues: 0,
        trend: "stable",
      },
      {
        component: "Inverter",
        health: 91,
        status: "excellent",
        lastService: "2024-07-20",
        nextService: "2025-07-20",
        criticalIssues: 0,
        trend: "stable",
      },
      {
        component: "Brake System",
        health: 75,
        status: "fair",
        lastService: "2024-06-10",
        nextService: "2024-12-10",
        criticalIssues: 2,
        trend: "declining",
      },
      {
        component: "TBOX/Telematics",
        health: 95,
        status: "excellent",
        lastService: "2024-09-01",
        nextService: "2025-09-01",
        criticalIssues: 0,
        trend: "stable",
      },
    ];

    return {
      scooterId,
      timestamp: today.toISOString(),
      overallHealth: 84,
      significantEvents,
      dailyMetrics,
      componentHealth,
      predictiveInsights: {
        batteryLifeRemaining: 18,
        motorServiceDue: 45,
        criticalMaintenanceAlerts: [
          "Brake pads require replacement within 2 weeks",
          "Battery health trending downward - schedule inspection",
          "Motor temperature patterns suggest bearing wear",
        ],
        recommendedActions: [
          "Schedule brake system maintenance",
          "Perform battery diagnostic test",
          "Update firmware to latest version",
          "Calibrate motor control parameters",
        ],
      },
      performanceMetrics: {
        reliability: 87,
        efficiency: 82,
        utilization: 78,
        safetyScore: 92,
      },
      comparisonData: {
        fleetAverage: 79,
        topPerformer: 96,
        ranking: 23,
        totalFleetSize: 150,
      },
    };
  };

  const startDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const steps = [
        "Connecting to data warehouse...",
        "Fetching 30-day historical data...",
        "Processing daily metrics...",
        "Analyzing component health trends...",
        "Identifying significant events...",
        "Generating predictive insights...",
        "Comparing with fleet data...",
        "Building comprehensive report...",
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setProgress(((i + 1) / steps.length) * 100);
      }

      const report = generateMock30DayData();
      setDiagnosticReport(report);
    } catch (err) {
      setError("Failed to generate 30-day diagnostic analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    progress,
    diagnosticReport,
    error,
    startDiagnostic,
  };
};

// Component Status Badge
const StatusBadge: React.FC<{ status: string; size?: "sm" | "md" }> = ({
  status,
  size = "sm",
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      excellent: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
      },
      good: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      fair: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
      },
      poor: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
      },
      critical: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
      },
      warning: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        border: "border-yellow-500/30",
      },
      info: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      success: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
      },
      improving: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30",
      },
      stable: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      declining: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
      },
    };
    return configs[status] || configs.info;
  };

  const config = getStatusConfig(status);
  const padding = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`${config.bg} ${config.text} ${config.border} ${padding} ${textSize} border rounded-full font-medium capitalize`}
    >
      {status}
    </span>
  );
};

// Chart Components
const TrendChart: React.FC<{
  data: DailyMetrics[];
  dataKey: string;
  title: string;
  color: string;
  unit?: string;
}> = ({ data, dataKey, title, color, unit = "" }) => {
  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center">
          <LineChart className="w-4 h-4 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={10}
              tickFormatter={(value) => new Date(value).getDate().toString()}
            />
            <YAxis stroke="#9CA3AF" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#F3F4F6",
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value) => [`${value}${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const ComponentHealthChart: React.FC<{ components: ComponentHealth[] }> = ({
  components,
}) => {
  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Component Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={components} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
            <YAxis
              dataKey="component"
              type="category"
              stroke="#9CA3AF"
              fontSize={10}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#F3F4F6",
              }}
              formatter={(value) => [`${value}%`, "Health Score"]}
            />
            <Bar dataKey="health" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PerformanceRadarChart: React.FC<{ metrics: any }> = ({ metrics }) => {
  const data = [
    { metric: "Reliability", value: metrics.reliability, fullMark: 100 },
    { metric: "Efficiency", value: metrics.efficiency, fullMark: 100 },
    { metric: "Utilization", value: metrics.utilization, fullMark: 100 },
    { metric: "Safety", value: metrics.safetyScore, fullMark: 100 },
  ];

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-center">
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.metric} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(item.value / 100) * 188.5} 188.5`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {item.value}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300">{item.metric}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Components
const LoadingState: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="bg-slate-900/60 border-slate-700/50 w-full max-w-md backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <RefreshCw className="w-16 h-16 text-blue-400 animate-spin" />
        </div>
        <CardTitle className="text-2xl text-blue-400 mb-2">
          Processing 30-Day Analytics
        </CardTitle>
        <CardDescription className="text-slate-300">
          Analyzing comprehensive vehicle data and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-slate-400 text-sm">
          {Math.round(progress)}% Complete
        </p>
      </CardContent>
    </Card>
  </div>
);

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-lg backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <BarChart3 className="w-16 h-16 text-green-400" />
        </div>
        <CardTitle className="text-3xl text-white mb-2">
          30-Day Factory Analytics
        </CardTitle>
        <CardDescription className="text-slate-300">
          Comprehensive vehicle diagnostic and performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-slate-300 text-sm">
              30-day trend analysis
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-slate-300 text-sm">
              Component health tracking
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-300 text-sm">
              Predictive maintenance alerts
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-slate-300 text-sm">
              Fleet performance comparison
            </span>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          type="button"
        >
          <Activity className="w-5 h-5 inline mr-2" />
          Generate 30-Day Analysis
        </button>
      </CardContent>
    </Card>
  </div>
);

const DiagnosticResults: React.FC<{ report: DiagnosticReport }> = ({
  report,
}) => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            30-Day Factory Analytics Report
          </h1>
          <div className="flex items-center justify-center space-x-6 text-slate-400">
            <span>Scooter ID: {report.scooterId}</span>
            <span>•</span>
            <span>Analysis Period: Last 30 Days</span>
            <span>•</span>
            <span>
              Generated: {new Date(report.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "components", label: "Components", icon: Settings },
            { id: "events", label: "Events", icon: Calendar },
            { id: "insights", label: "Insights", icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                activeSection === id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        report.overallHealth >= 90
                          ? "bg-green-500/20"
                          : report.overallHealth >= 70
                          ? "bg-yellow-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      <span
                        className={`text-2xl font-bold ${
                          report.overallHealth >= 90
                            ? "text-green-400"
                            : report.overallHealth >= 70
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {report.overallHealth}
                      </span>
                    </div>
                  </div>
                  <p className="text-white font-semibold">Overall Health</p>
                  <p className="text-slate-400 text-sm">
                    {report.overallHealth >= 90
                      ? "Excellent"
                      : report.overallHealth >= 70
                      ? "Good"
                      : "Needs Attention"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">
                    #{report.comparisonData.ranking}
                  </p>
                  <p className="text-white font-semibold">Fleet Ranking</p>
                  <p className="text-slate-400 text-sm">
                    out of {report.comparisonData.totalFleetSize}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">
                    {report.predictiveInsights.criticalMaintenanceAlerts.length}
                  </p>
                  <p className="text-white font-semibold">Critical Alerts</p>
                  <p className="text-slate-400 text-sm">require attention</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Wrench className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">
                    {report.predictiveInsights.motorServiceDue}
                  </p>
                  <p className="text-white font-semibold">Service Due</p>
                  <p className="text-slate-400 text-sm">days remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceRadarChart metrics={report.performanceMetrics} />
              <ComponentHealthChart components={report.componentHealth} />
            </div>

            {/* Fleet Comparison */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Fleet Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Your Vehicle</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${report.overallHealth}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold w-12">
                        {report.overallHealth}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Fleet Average</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${report.comparisonData.fleetAverage}%`,
                          }}
                        />
                      </div>
                      <span className="text-white font-semibold w-12">
                        {report.comparisonData.fleetAverage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Top Performer</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${report.comparisonData.topPerformer}%`,
                          }}
                        />
                      </div>
                      <span className="text-white font-semibold w-12">
                        {report.comparisonData.topPerformer}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trends Section */}
        {activeSection === "trends" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                data={report.dailyMetrics}
                dataKey="batteryHealth"
                title="Battery Health %"
                color="#10B981"
                unit="%"
              />
              <TrendChart
                data={report.dailyMetrics}
                dataKey="motorTemp"
                title="Motor Temperature"
                color="#F59E0B"
                unit="°C"
              />
              <TrendChart
                data={report.dailyMetrics}
                dataKey="distance"
                title="Daily Distance"
                color="#3B82F6"
                unit="km"
              />
              <TrendChart
                data={report.dailyMetrics}
                dataKey="efficiency"
                title="Energy Efficiency"
                color="#8B5CF6"
                unit="%"
              />
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Vibration & Wear Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={report.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickFormatter={(value) =>
                          new Date(value).getDate().toString()
                        }
                      />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="vibration"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name="Vibration Level"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gauge className="w-5 h-5 mr-2" />
                    Usage Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart data={report.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="throttleUsage"
                        stroke="#9CA3AF"
                        fontSize={10}
                        name="Throttle Usage %"
                      />
                      <YAxis
                        dataKey="distance"
                        stroke="#9CA3AF"
                        fontSize={10}
                        name="Distance km"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F3F4F6",
                        }}
                        formatter={(value, name) => [
                          `${value}${name === "throttleUsage" ? "%" : "km"}`,
                          name === "throttleUsage"
                            ? "Throttle Usage"
                            : "Distance",
                        ]}
                      />
                      <Scatter dataKey="distance" fill="#3B82F6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Statistical Summary */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  30-Day Statistical Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Total Distance",
                      value: report.dailyMetrics
                        .reduce((sum, day) => sum + day.distance, 0)
                        .toFixed(1),
                      unit: "km",
                      icon: MapPin,
                      color: "text-blue-400",
                    },
                    {
                      label: "Operating Hours",
                      value: report.dailyMetrics
                        .reduce((sum, day) => sum + day.operatingHours, 0)
                        .toFixed(1),
                      unit: "hrs",
                      icon: Clock,
                      color: "text-green-400",
                    },
                    {
                      label: "Charging Cycles",
                      value: report.dailyMetrics.reduce(
                        (sum, day) => sum + day.chargingCycles,
                        0
                      ),
                      unit: "cycles",
                      icon: Battery,
                      color: "text-yellow-400",
                    },
                    {
                      label: "Total Errors",
                      value: report.dailyMetrics.reduce(
                        (sum, day) => sum + day.errorCount,
                        0
                      ),
                      unit: "errors",
                      icon: AlertTriangle,
                      color: "text-red-400",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <stat.icon
                        className={`w-8 h-8 ${stat.color} mx-auto mb-2`}
                      />
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-slate-400">{stat.unit}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Components Section */}
        {activeSection === "components" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.componentHealth.map((component) => (
                <Card
                  key={component.component}
                  className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">
                        {component.component}
                      </CardTitle>
                      <StatusBadge status={component.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Health Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              component.health >= 90
                                ? "bg-green-500"
                                : component.health >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${component.health}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold">
                          {component.health}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">
                          Last Service
                        </span>
                        <span className="text-slate-300 text-sm">
                          {component.lastService}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">
                          Next Service
                        </span>
                        <span className="text-slate-300 text-sm">
                          {component.nextService}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">
                          Critical Issues
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            component.criticalIssues === 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {component.criticalIssues}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Trend</span>
                        <div className="flex items-center space-x-1">
                          {component.trend === "improving" ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : component.trend === "declining" ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <Activity className="w-4 h-4 text-blue-400" />
                          )}
                          <StatusBadge status={component.trend} size="sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Component Performance Matrix */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Component Performance Matrix
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Health vs. Critical Issues correlation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={report.componentHealth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="health"
                      stroke="#9CA3AF"
                      name="Health Score"
                      domain={[0, 100]}
                    />
                    <YAxis
                      dataKey="criticalIssues"
                      stroke="#9CA3AF"
                      name="Critical Issues"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value, name, props) => [
                        value,
                        name === "health" ? "Health Score" : "Critical Issues",
                      ]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.component || ""
                      }
                    />
                    <Scatter dataKey="health" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events Section */}
        {activeSection === "events" && (
          <div className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Significant Events Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.significantEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/50"
                    >
                      <div className="flex-shrink-0">
                        {event.type === "maintenance" && (
                          <Wrench className="w-6 h-6 text-blue-400" />
                        )}
                        {event.type === "anomaly" && (
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        )}
                        {event.type === "alert" && (
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        )}
                        {event.type === "milestone" && (
                          <Target className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={event.severity} />
                            <span className="text-slate-400 text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-300 mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-400 text-sm">
                            Component: {event.component}
                          </span>
                          {event.value && (
                            <span className="text-slate-400 text-sm">
                              Value: {event.value}
                              {event.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Event Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Maintenance",
                            value: report.significantEvents.filter(
                              (e) => e.type === "maintenance"
                            ).length,
                            fill: "#3B82F6",
                          },
                          {
                            name: "Anomaly",
                            value: report.significantEvents.filter(
                              (e) => e.type === "anomaly"
                            ).length,
                            fill: "#F59E0B",
                          },
                          {
                            name: "Alert",
                            value: report.significantEvents.filter(
                              (e) => e.type === "alert"
                            ).length,
                            fill: "#EF4444",
                          },
                          {
                            name: "Milestone",
                            value: report.significantEvents.filter(
                              (e) => e.type === "milestone"
                            ).length,
                            fill: "#10B981",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Event Severity Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["critical", "warning", "info", "success"].map(
                      (severity) => {
                        const count = report.significantEvents.filter(
                          (e) => e.severity === severity
                        ).length;
                        const percentage =
                          (count / report.significantEvents.length) * 100;
                        return (
                          <div
                            key={severity}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <StatusBadge status={severity} />
                              <span className="text-slate-300 capitalize">
                                {severity}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-slate-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    severity === "critical"
                                      ? "bg-red-500"
                                      : severity === "warning"
                                      ? "bg-yellow-500"
                                      : severity === "info"
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-white font-semibold w-6">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Insights Section */}
        {activeSection === "insights" && (
          <div className="space-y-6">
            {/* Predictive Maintenance */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Predictive Maintenance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Critical Maintenance Alerts
                    </h3>
                    <div className="space-y-3">
                      {report.predictiveInsights.criticalMaintenanceAlerts.map(
                        (alert, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                          >
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                            <p className="text-slate-300 text-sm">{alert}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recommended Actions
                    </h3>
                    <div className="space-y-3">
                      {report.predictiveInsights.recommendedActions.map(
                        (action, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                            <p className="text-slate-300 text-sm">{action}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictive Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Battery Life Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#374151"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#10B981"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${
                          (report.predictiveInsights.batteryLifeRemaining /
                            24) *
                          314
                        } 314`}
                        className="transition-all duration-2000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {report.predictiveInsights.batteryLifeRemaining}
                      </span>
                      <span className="text-xs text-slate-400">months</span>
                    </div>
                  </div>
                  <p className="text-slate-300">
                    Estimated remaining battery life
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on current degradation patterns
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Service Schedule Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Battery className="w-5 h-5 text-green-400" />
                        <span className="text-slate-300">Battery Service</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        60 days
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Gauge className="w-5 h-5 text-yellow-400" />
                        <span className="text-slate-300">Motor Service</span>
                      </div>
                      <span className="text-yellow-400 font-semibold">
                        {report.predictiveInsights.motorServiceDue} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-300">
                          Safety Inspection
                        </span>
                      </div>
                      <span className="text-blue-400 font-semibold">
                        90 days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI-Powered Insights */}
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  AI-Powered Diagnostic Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-semibold">
                          Performance Trend
                        </h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Vehicle shows declining efficiency over the past 10
                        days. Pattern suggests motor temperature correlation
                        with performance drop.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-white font-semibold">
                          Usage Pattern Alert
                        </h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Detected unusual high-throttle usage patterns that may
                        accelerate component wear. Consider driver training.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h4 className="text-white font-semibold">
                          Optimization Opportunity
                        </h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Battery charging patterns are optimal. Current charging
                        schedule extends battery life by an estimated 15%.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-semibold">
                          Fleet Comparison
                        </h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        This vehicle ranks in top 25% for reliability but bottom
                        40% for efficiency. Focus on operational optimization.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-center space-x-4 pt-8 pb-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh Analysis</span>
          </button>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(report, null, 2);
              const dataBlob = new Blob([dataStr], {
                type: "application/json",
              });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `diagnostic-report-${report.scooterId}-${
                new Date().toISOString().split("T")[0]
              }.json`;
              link.click();
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Factory30DayDiagnosticDashboard: React.FC = () => {
  const { isLoading, progress, diagnosticReport, error, startDiagnostic } =
    use30DayDiagnosticData(862487061363723);

  if (isLoading) {
    return <LoadingState progress={progress} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <button
              onClick={startDiagnostic}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Retry Analysis
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (diagnosticReport) {
    return <DiagnosticResults report={diagnosticReport} />;
  }

  return <StartScreen onStart={startDiagnostic} />;
};

export default Factory30DayDiagnosticDashboard;
