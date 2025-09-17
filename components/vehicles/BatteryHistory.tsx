import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
} from "recharts";
import {
  Battery,
  Thermometer,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Gauge,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Cpu,
  Target,
  FileText,
  Loader2,
  Filter,
  Settings,
} from "lucide-react";

// Import the hook and types
import useBatteryData, {
  TboxData,
  BatterySwapEvent,
  BatterySession,
  DiagnosticMetrics,
  BatteryFilters,
} from "@/hooks/useBatteryData"; // Adjust path as needed

interface ProcessedDataPoint extends TboxData {
  continuousTemp?: number;
  continuousVoltage?: number;
  continuousCurrent?: number;
  continuousCellDiff?: number;
  swapTransition?: boolean;
  transitionProgress?: number;
}

// Helper function to safely convert values to numbers
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Function to create continuous data with smooth battery swap transitions
const createContinuousData = (data: TboxData[]): ProcessedDataPoint[] => {
  if (data.length === 0) return [];

  const processedData: ProcessedDataPoint[] = [];

  // First, identify swap points
  const swapPoints: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].BMS_ID !== data[i - 1].BMS_ID) {
      swapPoints.push(i);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const currentPoint = { ...data[i] } as ProcessedDataPoint;

    // Check if this is a swap point
    const isSwapPoint = swapPoints.includes(i);
    const isPreviousSwapPoint = i > 0 && swapPoints.includes(i - 1);

    if (isSwapPoint && i > 0) {
      // This is the new battery after swap
      const prevPoint = data[i - 1];
      const currentBatteryPoint = data[i];

      // Create interpolated values for the swap transition
      currentPoint.continuousTemp =
        (safeNumber(prevPoint.BATTEMP) +
          safeNumber(currentBatteryPoint.BATTEMP)) /
        2;
      currentPoint.continuousVoltage =
        (safeNumber(prevPoint.BATVOLT) +
          safeNumber(currentBatteryPoint.BATVOLT)) /
        2;
      currentPoint.continuousCurrent =
        (safeNumber(prevPoint.BATCURRENT) +
          safeNumber(currentBatteryPoint.BATCURRENT)) /
        2;
      currentPoint.continuousCellDiff =
        (safeNumber(prevPoint.BATCELLDIFFMAX) +
          safeNumber(currentBatteryPoint.BATCELLDIFFMAX)) /
        2;
      currentPoint.swapTransition = true;
      currentPoint.transitionProgress = 0.5;
    } else if (isPreviousSwapPoint) {
      // This is the hour after swap, gradually transition to new battery values
      currentPoint.continuousTemp = safeNumber(currentPoint.BATTEMP);
      currentPoint.continuousVoltage = safeNumber(currentPoint.BATVOLT);
      currentPoint.continuousCurrent = safeNumber(currentPoint.BATCURRENT);
      currentPoint.continuousCellDiff = safeNumber(currentPoint.BATCELLDIFFMAX);
      currentPoint.swapTransition = false;
    } else {
      // Normal operation - use actual values
      currentPoint.continuousTemp = safeNumber(currentPoint.BATTEMP);
      currentPoint.continuousVoltage = safeNumber(currentPoint.BATVOLT);
      currentPoint.continuousCurrent = safeNumber(currentPoint.BATCURRENT);
      currentPoint.continuousCellDiff = safeNumber(currentPoint.BATCELLDIFFMAX);
      currentPoint.swapTransition = false;
    }

    processedData.push(currentPoint);
  }

  return processedData;
};

// Function to create BMS-segmented data for area charts
const createBMSSegmentedData = (data: ProcessedDataPoint[], metric: string) => {
  if (!data.length) return [];

  const uniqueBMSIds = [...new Set(data.map((d) => d.BMS_ID))];
  const segmentedData = [];

  for (let i = 0; i < data.length; i++) {
    const dataPoint = { ...data[i] };

    // For each BMS, set the metric value only if this point belongs to that BMS
    uniqueBMSIds.forEach((bmsId) => {
      const key = `${metric}_${bmsId}`;
      if (data[i].BMS_ID === bmsId) {
        switch (metric) {
          case "temp":
            dataPoint[key] = safeNumber(
              data[i].continuousTemp || data[i].BATTEMP
            );
            break;
          case "voltage":
            dataPoint[key] = safeNumber(
              data[i].continuousVoltage || data[i].BATVOLT
            );
            break;
          case "current":
            dataPoint[key] = safeNumber(
              data[i].continuousCurrent || data[i].BATCURRENT
            );
            break;
          case "cellDiff":
            dataPoint[key] = safeNumber(
              data[i].continuousCellDiff || data[i].BATCELLDIFFMAX
            );
            break;
          case "soh":
            dataPoint[key] = safeNumber(data[i].BATSOH);
            break;
          case "charge":
            dataPoint[key] = safeNumber(data[i].BATPERCENT);
            break;
          default:
            dataPoint[key] = 0;
        }
      } else {
        dataPoint[key] = null; // Null values create gaps in the area
      }
    });

    segmentedData.push(dataPoint);
  }

  return segmentedData;
};

// Enhanced tooltip for BMS awareness
const ScooterTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProcessedDataPoint;

    return (
      <div className="rounded-lg border border-slate-700 shadow-xl bg-slate-900 p-4 max-w-xs">
        <div className="text-sm font-medium text-slate-200 mb-2">
          {new Date(safeNumber(data.CTIME) * 1000).toLocaleString()}
        </div>
        <div className="text-xs text-slate-300 mb-2 flex items-center gap-2 flex-wrap">
          <span className="text-blue-400 font-mono">{data.BMS_ID}</span>
          {data.swapTransition && (
            <>
              <span>|</span>
              <span className="text-purple-400 font-semibold">SWAP</span>
            </>
          )}
          <span>|</span>
          <span className="text-green-400">
            {safeNumber(data.TOTAL_DISTANCE_KM).toFixed(1)}km
          </span>
        </div>
        <div className="grid gap-1 text-xs max-h-32 overflow-y-auto">
          {payload.map(
            (entry: any, index: number) =>
              entry.value !== null && (
                <div key={index} className="flex justify-between">
                  <span style={{ color: entry.color }}>{entry.name}:</span>
                  <span className="font-medium text-slate-200">
                    {typeof entry.value === "number"
                      ? entry.value.toFixed(2)
                      : entry.value}
                  </span>
                </div>
              )
          )}
          <div className="border-t border-slate-600 mt-2 pt-2 text-xs text-slate-400">
            <div>
              SOH: {safeNumber(data.BATSOH).toFixed(1)}% | Cycles:{" "}
              {safeNumber(data.BATCYCLECOUNT)}
            </div>
            <div>
              State: {data.STATE} | Distance:{" "}
              {safeNumber(data.TOTAL_DISTANCE_KM).toFixed(1)}km
            </div>
            {data.swapTransition && (
              <div className="text-purple-400 font-semibold">
                Battery Swap Transition
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Filters Panel Component
const FiltersPanel: React.FC<{
  filters: BatteryFilters;
  onFiltersChange: (filters: BatteryFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg z-10 min-w-64">
          <h4 className="font-medium text-slate-200 mb-3">Data Filters</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Include Idle Data
              </label>
              <input
                type="checkbox"
                checked={filters.includeIdleData || false}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    includeIdleData: e.target.checked,
                  })
                }
                className="rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Min Battery Temp (°C)
              </label>
              <input
                type="number"
                value={filters.minBatteryTemp || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minBatteryTemp: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 rounded text-sm"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Max Battery Temp (°C)
              </label>
              <input
                type="number"
                value={filters.maxBatteryTemp || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxBatteryTemp: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 rounded text-sm"
                placeholder="e.g., 65"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Min SOH (%)
              </label>
              <input
                type="number"
                value={filters.minSOH || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minSOH: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 rounded text-sm"
                placeholder="e.g., 70"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BatteryHistory: React.FC<{ IMEI: string }> = ({ IMEI }) => {
  const [selectedTboxId, setSelectedTboxId] = useState<string>(IMEI || "");
  const [inputTboxId, setInputTboxId] = useState<string>("");
  const [filters, setFilters] = useState<BatteryFilters>({
    timeRange: 500, // 500 hours default
    includeIdleData: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Use the real data hook
  const {
    batteryData,
    batterySwaps,
    batterySessions,
    diagnostics,
    loading,
    error,
    debugInfo,
    refetch,
  } = useBatteryData(selectedTboxId, filters);

  // Process the real data for continuous charts
  const processedData = useMemo(() => {
    return createContinuousData(batteryData);
  }, [batteryData]);

  // Color mapping for different BMS IDs
  const bmsColors = useMemo(() => {
    const uniqueBmsIds = [...new Set(batteryData.map((d) => d.BMS_ID))];
    const colors = [
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#ec4899", // Pink
      "#84cc16", // Lime
      "#f97316", // Orange
    ];
    return uniqueBmsIds.reduce((acc, bmsId, index) => {
      acc[bmsId] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [batteryData]);

  // Create segmented data for each metric
  const temperatureData = useMemo(
    () => createBMSSegmentedData(processedData, "temp"),
    [processedData]
  );
  const voltageData = useMemo(
    () => createBMSSegmentedData(processedData, "voltage"),
    [processedData]
  );
  const currentData = useMemo(
    () => createBMSSegmentedData(processedData, "current"),
    [processedData]
  );
  const cellDiffData = useMemo(
    () => createBMSSegmentedData(processedData, "cellDiff"),
    [processedData]
  );
  const sohData = useMemo(
    () => createBMSSegmentedData(processedData, "soh"),
    [processedData]
  );
  const chargeData = useMemo(
    () => createBMSSegmentedData(processedData, "charge"),
    [processedData]
  );

  const uniqueBMSIds = [...new Set(batteryData.map((d) => d.BMS_ID))];

  // Handle TBOX ID submission
  const handleTboxSubmit = () => {
    if (inputTboxId.trim()) {
      setSelectedTboxId(inputTboxId.trim());
      setShowFilters(false);
    }
  };

  // Loading state
  if (loading && selectedTboxId) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-slate-400 text-lg mb-2">
            Loading battery diagnostics...
          </p>
          <p className="text-slate-500 text-sm">
            Analyzing data for {selectedTboxId}
          </p>
          {debugInfo && (
            <div className="mt-4 text-xs text-slate-500 space-y-1">
              <p>Telemetry Records: {safeNumber(debugInfo.telemetryCount)}</p>
              <p>Battery Swaps: {safeNumber(debugInfo.swapCount)}</p>
              <p>Battery Sessions: {safeNumber(debugInfo.sessionCount)}</p>
              <p>Unique Batteries: {safeNumber(debugInfo.uniqueBatteries)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error && selectedTboxId) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-red-300 mb-4">
            Data Loading Error
          </h2>
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-slate-300 text-sm">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSelectedTboxId("")}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Change TBOX ID
            </button>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No TBOX ID selected state
  if (!selectedTboxId) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Battery className="w-20 h-20 mx-auto mb-6 text-purple-400" />
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">
            Scooter Battery Diagnostics
          </h2>
          <p className="text-slate-400 mb-6">
            Enter a TBOX ID to analyze battery performance and health metrics
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter TBOX ID (e.g., SCOOTER_001, TB_12345)"
              value={inputTboxId}
              onChange={(e) => setInputTboxId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleTboxSubmit();
                }
              }}
            />
            <button
              onClick={handleTboxSubmit}
              disabled={!inputTboxId.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Load Battery Data
            </button>
          </div>
          <div className="mt-8 text-xs text-slate-500">
            <p>• Real-time battery swap detection</p>
            <p>• Health & performance analytics</p>
            <p>• Multi-battery session tracking</p>
          </div>
        </div>
      </div>
    );
  }

  // No data available
  if (!diagnostics || batteryData.length === 0) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-semibold text-slate-200 mb-4">
            No Battery Data Found
          </h2>
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-slate-300 mb-2">
              No battery telemetry data found for:{" "}
              <span className="font-mono text-yellow-400">
                {selectedTboxId}
              </span>
            </p>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Time Range: {filters.timeRange} hours</p>
              <p>Include Idle Data: {filters.includeIdleData ? "Yes" : "No"}</p>
              {debugInfo && <p>Database Query: Executed successfully</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSelectedTboxId("")}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Change TBOX ID
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, timeRange: 720 }))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try 30 Days
            </button>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Battery className="w-8 h-8 text-purple-400" />
              Battery Diagnostics
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-slate-400">
                Scooter:{" "}
                <span className="font-mono text-blue-400">
                  {selectedTboxId}
                </span>{" "}
                | Battery swap tracking & health analysis
              </p>
              {debugInfo && (
                <div className="text-xs text-slate-500 flex items-center gap-4">
                  <span>
                    {safeNumber(debugInfo.telemetryCount)} data points
                  </span>
                  <span>•</span>
                  <span>
                    {safeNumber(debugInfo.uniqueBatteries)} unique batteries
                  </span>
                  <span>•</span>
                  <span>{batterySwaps.length} swaps detected</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.timeRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  timeRange: Number(e.target.value),
                }))
              }
              className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value={24}>Last 24 Hours</option>
              <option value={72}>Last 3 Days</option>
              <option value={168}>Last 7 Days</option>
              <option value={336}>Last 14 Days</option>
              <option value={720}>Last 30 Days</option>
            </select>

            <FiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />

            <button
              onClick={() => setSelectedTboxId("")}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              Change Scooter
            </button>

            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div
          className={`rounded-lg p-6 border-2 ${
            diagnostics.overallHealth === "Excellent"
              ? "bg-green-900/20 border-green-700"
              : diagnostics.overallHealth === "Good"
              ? "bg-blue-900/20 border-blue-700"
              : diagnostics.overallHealth === "Fair"
              ? "bg-yellow-900/20 border-yellow-700"
              : "bg-red-900/20 border-red-700"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-6 h-6" />
              Overall Health: {diagnostics.overallHealth}
            </h2>
            <div className="text-sm text-slate-400">
              {safeNumber(diagnostics.totalBatteries)} batteries tracked |{" "}
              {safeNumber(diagnostics.totalSwaps)} swaps detected
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {safeNumber(diagnostics.totalBatteries)}
              </div>
              <div className="text-slate-400 text-sm">Unique Batteries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {safeNumber(diagnostics.totalSwaps)}
              </div>
              <div className="text-slate-400 text-sm">Battery Swaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {safeNumber(diagnostics.swapFrequency).toFixed(1)}
              </div>
              <div className="text-slate-400 text-sm">Swaps/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {safeNumber(diagnostics.avgSessionDuration).toFixed(1)}h
              </div>
              <div className="text-slate-400 text-sm">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {diagnostics.thermalPerformance}
              </div>
              <div className="text-slate-400 text-sm">Thermal Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {diagnostics.voltageStability}
              </div>
              <div className="text-slate-400 text-sm">Voltage Status</div>
            </div>
          </div>
        </div>

        {/* Battery Usage Timeline */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Battery Usage Timeline
            <span className="text-sm text-slate-400 ml-4">
              Charge level & health over time with swap transitions
            </span>
          </h3>

          {/* BMS Legend */}
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
            {Object.entries(bmsColors).map(([bmsId, color]) => (
              <div key={bmsId} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-slate-300 font-mono">
                  {bmsId}
                </span>
              </div>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-400 opacity-50"></div>
              <span className="text-sm text-purple-300">Swap Transition</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="CTIME"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickFormatter={(value) => {
                  const date = new Date(safeNumber(value) * 1000);
                  return date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: filters.timeRange <= 72 ? "numeric" : undefined,
                  });
                }}
              />
              <YAxis
                yAxisId="percent"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                domain={[0, 100]}
                label={{
                  value: "Charge %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#94a3b8" },
                }}
              />
              <YAxis
                yAxisId="soh"
                orientation="right"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                domain={[70, 100]}
                label={{
                  value: "SOH %",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "#94a3b8" },
                }}
              />
              <Tooltip content={<ScooterTooltip />} />

              {/* Battery charge level area */}
              <Area
                yAxisId="percent"
                type="monotone"
                dataKey={(data: ProcessedDataPoint) =>
                  safeNumber(data.BATPERCENT)
                }
                fill="#10b981"
                fillOpacity={0.3}
                stroke="#10b981"
                strokeWidth={2}
                name="Charge Level (%)"
              />

              {/* Battery SOH line */}
              <Line
                yAxisId="soh"
                type="monotone"
                dataKey={(data: ProcessedDataPoint) => safeNumber(data.BATSOH)}
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={(props: any) => {
                  const { payload } = props;
                  if (payload && payload.swapTransition) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill="#a855f7"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                    );
                  }
                  return false;
                }}
                name="Battery Health (%)"
              />

              {/* Swap event markers */}
              {batterySwaps.map((swap, idx) => (
                <ReferenceLine
                  key={idx}
                  x={safeNumber(swap.timestamp)}
                  stroke="#a855f7"
                  strokeDasharray="2 2"
                  strokeWidth={2}
                  label={{
                    value: "SWAP",
                    position: "top",
                    fontSize: 10,
                    fill: "#a855f7",
                  }}
                />
              ))}

              {/* Reference lines for health thresholds */}
              <ReferenceLine
                yAxisId="soh"
                y={85}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: "Warning (85%)",
                  position: "topRight",
                  fontSize: 10,
                  fill: "#f59e0b",
                }}
              />
              <ReferenceLine
                yAxisId="soh"
                y={75}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: "Critical (75%)",
                  position: "topRight",
                  fontSize: 10,
                  fill: "#ef4444",
                }}
              />

              {/* Low charge warning */}
              <ReferenceLine
                yAxisId="percent"
                y={20}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                opacity={0.7}
                label={{
                  value: "Low Charge (20%)",
                  position: "topLeft",
                  fontSize: 10,
                  fill: "#f59e0b",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Analysis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              Battery Temperature by BMS
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="CTIME"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) => {
                    const date = new Date(safeNumber(value) * 1000);
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#94a3b8" },
                  }}
                />
                <Tooltip content={<ScooterTooltip />} />

                {/* Create separate Area for each BMS */}
                {uniqueBMSIds.map((bmsId) => (
                  <Area
                    key={bmsId}
                    type="monotone"
                    dataKey={`temp_${bmsId}`}
                    stackId="temp"
                    stroke={bmsColors[bmsId]}
                    fill={bmsColors[bmsId]}
                    fillOpacity={0.6}
                    name={`${bmsId} Temp (°C)`}
                    connectNulls={false}
                  />
                ))}

                <ReferenceLine
                  y={45}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: "Warning (45°C)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#f59e0b",
                  }}
                />
                <ReferenceLine
                  y={65}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Critical (65°C)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#ef4444",
                  }}
                />

                {/* Swap event markers */}
                {batterySwaps.map((swap, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={safeNumber(swap.timestamp)}
                    stroke="#a855f7"
                    strokeDasharray="1 1"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Voltage Analysis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Battery Voltage by BMS
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={voltageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="CTIME"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) => {
                    const date = new Date(safeNumber(value) * 1000);
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  domain={[42, 56]}
                  label={{
                    value: "V",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#94a3b8" },
                  }}
                />
                <Tooltip content={<ScooterTooltip />} />

                {/* Create separate Area for each BMS */}
                {uniqueBMSIds.map((bmsId) => (
                  <Area
                    key={bmsId}
                    type="monotone"
                    dataKey={`voltage_${bmsId}`}
                    stackId="voltage"
                    stroke={bmsColors[bmsId]}
                    fill={bmsColors[bmsId]}
                    fillOpacity={0.6}
                    name={`${bmsId} Voltage (V)`}
                    connectNulls={false}
                  />
                ))}

                <ReferenceLine
                  y={44}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Min Safe (44V)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#ef4444",
                  }}
                />
                <ReferenceLine
                  y={52}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label={{
                    value: "Nominal (52V)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#10b981",
                  }}
                />

                {/* Swap event markers */}
                {batterySwaps.map((swap, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={safeNumber(swap.timestamp)}
                    stroke="#a855f7"
                    strokeDasharray="1 1"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cell Imbalance Analysis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Cell Imbalance by BMS
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={cellDiffData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="CTIME"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) => {
                    const date = new Date(safeNumber(value) * 1000);
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  label={{
                    value: "mV",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#94a3b8" },
                  }}
                />
                <Tooltip content={<ScooterTooltip />} />

                {/* Create separate Area for each BMS */}
                {uniqueBMSIds.map((bmsId) => (
                  <Area
                    key={bmsId}
                    type="monotone"
                    dataKey={`cellDiff_${bmsId}`}
                    stackId="cellDiff"
                    stroke={bmsColors[bmsId]}
                    fill={bmsColors[bmsId]}
                    fillOpacity={0.6}
                    name={`${bmsId} Cell Diff (mV)`}
                    connectNulls={false}
                  />
                ))}

                <ReferenceLine
                  y={300}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: "Warning (300mV)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#f59e0b",
                  }}
                />
                <ReferenceLine
                  y={500}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "Critical (500mV)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#ef4444",
                  }}
                />

                {/* Swap event markers */}
                {batterySwaps.map((swap, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={safeNumber(swap.timestamp)}
                    stroke="#a855f7"
                    strokeDasharray="1 1"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Current Flow Analysis */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-400" />
              Battery Current by BMS
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="CTIME"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickFormatter={(value) => {
                    const date = new Date(safeNumber(value) * 1000);
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  label={{
                    value: "A",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#94a3b8" },
                  }}
                />
                <Tooltip content={<ScooterTooltip />} />

                {/* Create separate Area for each BMS */}
                {uniqueBMSIds.map((bmsId) => (
                  <Area
                    key={bmsId}
                    type="monotone"
                    dataKey={`current_${bmsId}`}
                    stackId="current"
                    stroke={bmsColors[bmsId]}
                    fill={bmsColors[bmsId]}
                    fillOpacity={0.6}
                    name={`${bmsId} Current (A)`}
                    connectNulls={false}
                  />
                ))}

                <ReferenceLine
                  y={0}
                  stroke="#64748b"
                  strokeDasharray="2 2"
                  label={{
                    value: "Zero Current",
                    position: "topLeft",
                    fontSize: 10,
                    fill: "#64748b",
                  }}
                />
                <ReferenceLine
                  y={-25}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: "High Discharge (-25A)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#ef4444",
                  }}
                />
                <ReferenceLine
                  y={25}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label={{
                    value: "Fast Charge (+25A)",
                    position: "topRight",
                    fontSize: 10,
                    fill: "#10b981",
                  }}
                />

                {/* Swap event markers */}
                {batterySwaps.map((swap, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={safeNumber(swap.timestamp)}
                    stroke="#a855f7"
                    strokeDasharray="1 1"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Battery Sessions Performance Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Battery Session Analysis
            </h3>
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-slate-300 font-medium">
                        Battery ID
                      </th>
                      <th className="text-right p-3 text-slate-300 font-medium">
                        Duration
                      </th>
                      <th className="text-right p-3 text-slate-300 font-medium">
                        SOH
                      </th>
                      <th className="text-right p-3 text-slate-300 font-medium">
                        Max Temp
                      </th>
                      <th className="text-right p-3 text-slate-300 font-medium">
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {batterySessions.slice(0, 20).map((session, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: bmsColors[session.BMSID],
                              }}
                            ></div>
                            <span className="font-mono text-blue-400 text-xs">
                              {session.BMSID}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {safeNumber(session.DURATION).toFixed(1)}h
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`font-semibold ${
                              safeNumber(session.AVGSOH) > 90
                                ? "text-green-400"
                                : safeNumber(session.AVGSOH) > 80
                                ? "text-blue-400"
                                : safeNumber(session.AVGSOH) > 70
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {safeNumber(session.AVGSOH).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`${
                              safeNumber(session.MAXTEMP) > 60
                                ? "text-red-400"
                                : safeNumber(session.MAXTEMP) > 45
                                ? "text-yellow-400"
                                : "text-slate-300"
                            }`}
                          >
                            {safeNumber(session.MAXTEMP).toFixed(1)}°C
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`${
                              safeNumber(session.ERROREVENTS) > 0
                                ? "text-red-400 font-semibold"
                                : "text-green-400"
                            }`}
                          >
                            {safeNumber(session.ERROREVENTS)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batterySessions.length > 20 && (
                  <div className="text-center text-slate-400 text-xs py-2">
                    Showing first 20 of {batterySessions.length} sessions
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Battery Swap Events */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              Recent Battery Swap Events
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto h-full">
              {batterySwaps.length > 0 ? (
                batterySwaps
                  .slice(-10)
                  .reverse()
                  .map((swap, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg hover:bg-purple-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-purple-300">
                          {new Date(
                            safeNumber(swap.TIMESTAMP) * 1000
                          ).toLocaleString()}
                        </div>
                        <div
                          className={`text-sm px-2 py-1 rounded font-medium ${
                            safeNumber(swap.CHARGECHANGE) > 0
                              ? "bg-green-900/50 text-green-400"
                              : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {safeNumber(swap.CHARGECHANGE) > 0 ? "+" : ""}
                          {safeNumber(swap.CHARGECHANGE).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: bmsColors[swap.OLDBMSID],
                            }}
                          ></div>
                          <span className="text-slate-400 font-mono text-xs">
                            {swap.OLDBMSID}
                          </span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: bmsColors[swap.NEWBMSID],
                            }}
                          ></div>
                          <span className="text-blue-400 font-mono text-xs">
                            {swap.NEWBMSID}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">
                            SOH: {safeNumber(swap.OLDSOH).toFixed(1)}% →{" "}
                            {safeNumber(swap.NEWSOH).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400 py-8">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No battery swaps detected in current timeframe</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try extending the time range or checking filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Insights & Recommendations */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Diagnostic Insights & Recommendations
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Analysis */}
            <div>
              <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Performance Analysis
              </h4>
              <div className="space-y-3">
                {/* Preferred Batteries */}
                {diagnostics.preferredBatteries.length > 0 && (
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <div className="font-medium text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Best Performing Batteries
                    </div>
                    <div className="text-sm text-green-200 mb-2">
                      {diagnostics.preferredBatteries.map((batteryId, idx) => (
                        <span key={batteryId} className="font-mono">
                          {batteryId}
                          {idx < diagnostics.preferredBatteries.length - 1
                            ? ", "
                            : ""}
                        </span>
                      ))}{" "}
                      show optimal performance
                    </div>
                    <div className="text-xs text-green-400 font-medium space-y-1">
                      <div>→ Prioritize these batteries for extended trips</div>
                      <div>→ Monitor for degradation patterns</div>
                      <div>→ Use as performance benchmarks</div>
                    </div>
                  </div>
                )}

                {/* Efficiency Metrics */}
                <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                  <div className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Battery Efficiency
                  </div>
                  <div className="text-sm text-blue-200 mb-2">
                    Average:{" "}
                    {safeNumber(diagnostics.batteryEfficiency).toFixed(1)} km
                    per % charge
                  </div>
                  <div className="text-xs text-blue-400 font-medium">
                    {safeNumber(diagnostics.batteryEfficiency) > 0.8
                      ? "→ Excellent efficiency - maintain current usage patterns"
                      : safeNumber(diagnostics.batteryEfficiency) > 0.5
                      ? "→ Good efficiency - monitor for improvements"
                      : "→ Low efficiency - investigate battery degradation"}
                  </div>
                </div>

                {/* Swap Pattern Analysis */}
                <div className="p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg">
                  <div className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Swap Pattern Analysis
                  </div>
                  <div className="text-sm text-purple-200 mb-2">
                    {safeNumber(diagnostics.swapFrequency).toFixed(1)} swaps/day
                    | Avg session:{" "}
                    {safeNumber(diagnostics.avgSessionDuration).toFixed(1)}h
                  </div>
                  <div className="text-xs text-purple-400 font-medium">
                    {safeNumber(diagnostics.swapFrequency) > 2
                      ? "→ High swap frequency - check charging infrastructure"
                      : safeNumber(diagnostics.swapFrequency) > 1
                      ? "→ Normal swap pattern for active usage"
                      : "→ Low swap frequency - battery lasting well"}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues & Maintenance */}
            <div>
              <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Issues & Maintenance
              </h4>
              <div className="space-y-3">
                {/* Problematic Batteries */}
                {diagnostics.problematicBatteries.length > 0 ? (
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
                    <div className="font-medium text-red-300 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Batteries Requiring Attention
                    </div>
                    <div className="text-sm text-red-200 mb-2">
                      {diagnostics.problematicBatteries.map(
                        (batteryId, idx) => (
                          <span key={batteryId} className="font-mono">
                            {batteryId}
                            {idx < diagnostics.problematicBatteries.length - 1
                              ? ", "
                              : ""}
                          </span>
                        )
                      )}{" "}
                      showing issues
                    </div>
                    <div className="text-xs text-red-400 font-medium space-y-1">
                      <div>→ Schedule detailed battery inspection</div>
                      <div>→ Consider replacement if SOH &lt; 75%</div>
                      <div>→ Monitor thermal and voltage patterns</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <div className="font-medium text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      No Critical Battery Issues
                    </div>
                    <div className="text-sm text-green-200">
                      All batteries performing within acceptable parameters
                    </div>
                  </div>
                )}

                {/* Thermal Performance */}
                <div
                  className={`p-4 border rounded-lg ${
                    diagnostics.thermalPerformance === "Excellent"
                      ? "bg-green-900/20 border-green-800/50"
                      : diagnostics.thermalPerformance === "Good"
                      ? "bg-blue-900/20 border-blue-800/50"
                      : diagnostics.thermalPerformance === "Fair"
                      ? "bg-yellow-900/20 border-yellow-800/50"
                      : "bg-red-900/20 border-red-800/50"
                  }`}
                >
                  <div
                    className={`font-medium mb-2 flex items-center gap-2 ${
                      diagnostics.thermalPerformance === "Excellent"
                        ? "text-green-300"
                        : diagnostics.thermalPerformance === "Good"
                        ? "text-blue-300"
                        : diagnostics.thermalPerformance === "Fair"
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}
                  >
                    <Thermometer className="w-4 h-4" />
                    Thermal Management: {diagnostics.thermalPerformance}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      diagnostics.thermalPerformance === "Excellent"
                        ? "text-green-400"
                        : diagnostics.thermalPerformance === "Good"
                        ? "text-blue-400"
                        : diagnostics.thermalPerformance === "Fair"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {diagnostics.thermalPerformance === "Poor"
                      ? "→ Immediate cooling system inspection required"
                      : diagnostics.thermalPerformance === "Fair"
                      ? "→ Monitor thermal patterns, check ventilation"
                      : "→ Thermal management operating normally"}
                  </div>
                </div>

                {/* Voltage Stability */}
                <div
                  className={`p-4 border rounded-lg ${
                    diagnostics.voltageStability === "Stable"
                      ? "bg-green-900/20 border-green-800/50"
                      : "bg-red-900/20 border-red-800/50"
                  }`}
                >
                  <div
                    className={`font-medium mb-2 ${
                      diagnostics.voltageStability === "Stable"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    Voltage Stability: {diagnostics.voltageStability}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      diagnostics.voltageStability === "Stable"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {diagnostics.voltageStability === "Unstable"
                      ? "→ Check battery connections and BMS calibration"
                      : "→ Voltage regulation within normal parameters"}
                  </div>
                </div>

                {/* Maintenance Schedule */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="font-medium text-slate-300 mb-2">
                    Recommended Maintenance
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Weekly: Visual inspection of battery compartment</div>
                    <div>Bi-weekly: Connection tightness check</div>
                    <div>Monthly: Cell balance verification</div>
                    <div>Quarterly: Full diagnostic cycle test</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="text-center text-slate-500 text-sm py-4 border-t border-slate-800">
          <div className="flex justify-center items-center gap-6 text-xs">
            <span>Scooter: {selectedTboxId}</span>
            <span>•</span>
            <span>Data Points: {batteryData.length}</span>
            <span>•</span>
            <span>Time Range: {filters.timeRange}h</span>
            <span>•</span>
            <span>
              Batteries Tracked: {safeNumber(diagnostics.totalBatteries)}
            </span>
            <span>•</span>
            <span
              className={`px-2 py-1 rounded ${
                diagnostics.overallHealth === "Excellent"
                  ? "bg-green-900/50 text-green-400"
                  : diagnostics.overallHealth === "Good"
                  ? "bg-blue-900/50 text-blue-400"
                  : diagnostics.overallHealth === "Fair"
                  ? "bg-yellow-900/50 text-yellow-400"
                  : "bg-red-900/50 text-red-400"
              }`}
            >
              {diagnostics.overallHealth.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryHistory;
