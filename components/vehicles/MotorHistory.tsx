import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings,
  Activity,
  Thermometer,
  Gauge,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  BarChart3,
  PlayCircle,
  Database,
  Clock,
  FileText,
  Brain,
  Wrench,
  Download,
  Calendar,
  Shield,
  Target,
  Cpu,
  Battery,
  Wifi,
  XCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// -------------------- Interfaces --------------------
interface OptimizedTelemetry {
  CTIME: number;
  MOTORTEMP: number;
  MOTORRPM: number;
  STATE: string;
  INVERTER_ERROR: string;
  BRAKESTATUS: number;
  GEARINFORMATION: number;
  TBOXID: number;
}

interface ProcessedReading {
  timestamp: string;
  time: number;
  motorTemp: number;
  motorRPM: number;
  state: string;
  hasBrake: boolean;
  gear: number;
  hasError: boolean;
  errorType: string;
  isMotorOn: boolean;
}

interface DiagnosticBatch {
  batchId: number;
  records: OptimizedTelemetry[];
  processed: boolean;
  errors: number;
  timeRange: { start: number; end: number };
}

interface DiagnosticProgress {
  totalBatches: number;
  processedBatches: number;
  currentBatch: number;
  totalRecords: number;
  processedRecords: number;
  stage: "initializing" | "fetching" | "processing" | "analyzing" | "complete";
  errors: string[];
  currentOperation: string;
}

interface SignificantEvent {
  id: string;
  type:
    | "thermal_stress"
    | "rpm_spike"
    | "state_change"
    | "error_burst"
    | "efficiency_drop";
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  data: any;
  recommendations: string[];
}

interface FactoryDiagnosticReport {
  scooterId: number;
  reportDate: string;
  analysisTimespan: { start: string; end: string };
  overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";
  riskScore: number;
  significantEvents: SignificantEvent[];
  maintenanceRecommendations: MaintenanceRecommendation[];
  criticalMetrics: CriticalMetrics;
  performanceAnalysis: PerformanceAnalysis;
  predictiveInsights: PredictiveInsight[];
}

interface MaintenanceRecommendation {
  priority: "immediate" | "urgent" | "scheduled" | "preventive";
  component: string;
  issue: string;
  action: string;
  estimatedCost: string;
  timeframe: string;
}

interface CriticalMetrics {
  maxTemp: number;
  maxRPM: number;
  totalErrors: number;
  motorOnTime: number;
  thermalStress: number;
  operationalEfficiency: number;
  errorRate: number;
  averageLoad: number;
}

interface PerformanceAnalysis {
  temperatureProfile: Array<{
    range: string;
    percentage: number;
    risk: string;
  }>;
  rpmDistribution: Array<{
    range: string;
    frequency: number;
    efficiency: number;
  }>;
  stateAnalysis: Array<{
    state: string;
    duration: number;
    performance: number;
  }>;
  gearEfficiency: Array<{ gear: number; efficiency: number; usage: number }>;
}

interface PredictiveInsight {
  type: string;
  probability: number;
  timeframe: string;
  description: string;
  preventiveActions: string[];
}

// -------------------- Custom Hook for Diagnostic Data --------------------
const useDiagnosticData = (scooterId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<DiagnosticProgress>({
    totalBatches: 0,
    processedBatches: 0,
    currentBatch: 0,
    totalRecords: 0,
    processedRecords: 0,
    stage: "initializing",
    errors: [],
    currentOperation: "Initializing diagnostic system...",
  });
  const [diagnosticReport, setDiagnosticReport] =
    useState<FactoryDiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDiagnostic = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDiagnosticReport(null);

    try {
      // Stage 1: Initialize and get total record count
      setProgress((prev) => ({
        ...prev,
        stage: "initializing",
        currentOperation: "Calculating total records...",
      }));

      const totalRecords = await DiagnosticService.getTotalRecordCount(
        scooterId,
        30
      );
      const batchSize = 1000;
      const totalBatches = Math.ceil(totalRecords / batchSize);

      setProgress((prev) => ({
        ...prev,
        totalRecords,
        totalBatches,
        stage: "fetching",
        currentOperation: "Starting data retrieval...",
      }));

      // Stage 2: Fetch all data in batches
      const allProcessedData: ProcessedReading[] = [];
      let processedRecords = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const offset = batchIndex * batchSize;
        const actualBatchSize = Math.min(batchSize, totalRecords - offset);

        setProgress((prev) => ({
          ...prev,
          currentBatch: batchIndex + 1,
          processedBatches: batchIndex,
          currentOperation: `Fetching batch ${
            batchIndex + 1
          }/${totalBatches} (${actualBatchSize} records)...`,
        }));

        try {
          // Add 10 record padding from previous batch if not first batch
          const paddingOffset =
            batchIndex > 0 ? Math.max(0, offset - 10) : offset;
          const paddingSize =
            batchIndex > 0 ? actualBatchSize + 10 : actualBatchSize;

          const rawBatch = await DiagnosticService.fetchBatch(
            scooterId,
            paddingOffset,
            paddingSize,
            30
          );
          const processedBatch = DiagnosticService.processRawData(rawBatch);

          // Remove duplicates if padding was used
          const uniqueProcessedBatch =
            batchIndex > 0
              ? processedBatch.filter(
                  (record) =>
                    !allProcessedData.some(
                      (existing) => existing.time === record.time
                    )
                )
              : processedBatch;

          allProcessedData.push(...uniqueProcessedBatch);
          processedRecords += uniqueProcessedBatch.length;

          setProgress((prev) => ({
            ...prev,
            processedRecords,
            processedBatches: batchIndex + 1,
          }));
        } catch (batchError) {
          const errorMessage = `Error processing batch ${batchIndex + 1}: ${
            batchError instanceof Error ? batchError.message : "Unknown error"
          }`;
          setProgress((prev) => ({
            ...prev,
            errors: [...prev.errors, errorMessage],
          }));
        }

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Stage 3: Process and analyze data
      setProgress((prev) => ({
        ...prev,
        stage: "processing",
        currentOperation: "Processing telemetry data...",
      }));

      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress((prev) => ({
        ...prev,
        stage: "analyzing",
        currentOperation:
          "Analyzing performance patterns and detecting anomalies...",
      }));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 4: Generate comprehensive report
      const report = DiagnosticService.generateFactoryReport(allProcessedData);

      setProgress((prev) => ({
        ...prev,
        stage: "complete",
        currentOperation: "Diagnostic complete!",
      }));

      setDiagnosticReport(report);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setProgress((prev) => ({
        ...prev,
        errors: [...prev.errors, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [scooterId]);

  return {
    isLoading,
    progress,
    diagnosticReport,
    error,
    startDiagnostic,
  };
};

// -------------------- Diagnostic Service --------------------
class DiagnosticService {
  static async getTotalRecordCount(
    scooterId: number,
    daysBack: number = 30
  ): Promise<number> {
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 400)
    );
    return Math.floor(Math.random() * 45000) + 25000; // 25k-70k records
  }

  static async fetchBatch(
    scooterId: number,
    offset: number,
    batchSize: number = 1000,
    daysBack: number = 30
  ): Promise<OptimizedTelemetry[]> {
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 500)
    );

    const batch: OptimizedTelemetry[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < batchSize; i++) {
      const timeOffset = offset + i;
      const baseTemp = 25 + Math.sin(timeOffset * 0.01) * 10; // Gradual temp changes
      const thermalSpike = Math.random() > 0.97 ? 40 : 0; // Occasional thermal stress

      batch.push({
        CTIME: now - timeOffset * 60, // 1 minute intervals
        MOTORTEMP: Math.max(20, baseTemp + Math.random() * 15 + thermalSpike),
        MOTORRPM:
          Math.random() > 0.25
            ? Math.random() * 3800 + (Math.random() > 0.95 ? 1000 : 0)
            : 0,
        STATE: ["idle", "running", "charging", "maintenance", "standby"][
          Math.floor(Math.random() * 5)
        ],
        INVERTER_ERROR:
          Math.random() > 0.94
            ? [
                "Thermal Warning",
                "Voltage Spike",
                "Current Overload",
                "Communication Error",
              ][Math.floor(Math.random() * 4)]
            : "No Error",
        BRAKESTATUS: Math.random() > 0.85 ? 1 : 0,
        GEARINFORMATION: Math.floor(Math.random() * 5) + 1,
        TBOXID: scooterId,
      });
    }

    return batch;
  }

  static processRawData(rawData: OptimizedTelemetry[]): ProcessedReading[] {
    return rawData
      .filter((reading) => reading.CTIME && reading.CTIME > 0)
      .map((reading) => {
        const normalizedTemp = this.normalizeMotorTemperature(
          reading.MOTORTEMP || 0
        );
        const rpm = Math.max(0, reading.MOTORRPM || 0);
        const motorOn = this.isMotorRunning(normalizedTemp, rpm);

        return {
          timestamp: new Date(reading.CTIME * 1000).toISOString(),
          time: reading.CTIME,
          motorTemp: normalizedTemp,
          motorRPM: rpm,
          state: (reading.STATE || "unknown")
            .toLowerCase()
            .replace(/[^a-z_]/g, "_"),
          hasBrake: reading.BRAKESTATUS === 1,
          gear: Math.max(0, reading.GEARINFORMATION || 0),
          hasError:
            reading.INVERTER_ERROR &&
            reading.INVERTER_ERROR !== "No Error" &&
            reading.INVERTER_ERROR !== "null" &&
            reading.INVERTER_ERROR.trim() !== "",
          errorType:
            reading.INVERTER_ERROR &&
            reading.INVERTER_ERROR !== "No Error" &&
            reading.INVERTER_ERROR !== "null"
              ? reading.INVERTER_ERROR.trim()
              : "No Error",
          isMotorOn: motorOn,
        };
      })
      .sort((a, b) => a.time - b.time);
  }

  static normalizeMotorTemperature(temp: number): number {
    if (!temp || temp === 0) return 0;
    if (temp > 200) return temp - 273.15;
    return temp;
  }

  static isMotorRunning(temp: number, rpm: number): boolean {
    return temp > 35 || rpm > 100;
  }

  static detectSignificantEvents(data: ProcessedReading[]): SignificantEvent[] {
    const events: SignificantEvent[] = [];

    // Thermal stress events
    data.forEach((reading, index) => {
      if (reading.motorTemp > 85) {
        events.push({
          id: `thermal-${index}`,
          type: "thermal_stress",
          timestamp: reading.timestamp,
          severity:
            reading.motorTemp > 95
              ? "critical"
              : reading.motorTemp > 90
              ? "high"
              : "medium",
          description: `Motor temperature reached ${reading.motorTemp.toFixed(
            1
          )}°C`,
          data: { temperature: reading.motorTemp, rpm: reading.motorRPM },
          recommendations: [
            "Check cooling system",
            "Inspect thermal sensors",
            "Verify load conditions",
          ],
        });
      }
    });

    // RPM spikes
    for (let i = 1; i < data.length; i++) {
      const rpmChange = data[i].motorRPM - data[i - 1].motorRPM;
      if (rpmChange > 2000) {
        events.push({
          id: `rpm-spike-${i}`,
          type: "rpm_spike",
          timestamp: data[i].timestamp,
          severity: rpmChange > 3000 ? "high" : "medium",
          description: `RPM spike of ${rpmChange.toFixed(0)} detected`,
          data: {
            rpmChange,
            fromRPM: data[i - 1].motorRPM,
            toRPM: data[i].motorRPM,
          },
          recommendations: [
            "Check throttle response",
            "Inspect motor controller",
            "Verify gear transitions",
          ],
        });
      }
    }

    // Error bursts
    const errorWindows = this.findErrorBursts(data);
    errorWindows.forEach((window, index) => {
      events.push({
        id: `error-burst-${index}`,
        type: "error_burst",
        timestamp: window.start,
        severity:
          window.count > 10 ? "critical" : window.count > 5 ? "high" : "medium",
        description: `${window.count} errors detected in ${window.duration} minutes`,
        data: {
          errorCount: window.count,
          duration: window.duration,
          errors: window.errors,
        },
        recommendations: [
          "Immediate diagnostic required",
          "Check electrical connections",
          "Review system logs",
        ],
      });
    });

    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static findErrorBursts(data: ProcessedReading[]): Array<{
    start: string;
    count: number;
    duration: number;
    errors: string[];
  }> {
    const windows = [];
    const windowSize = 300; // 5 minutes in seconds

    for (let i = 0; i < data.length; i++) {
      const windowStart = data[i].time;
      const windowEnd = windowStart + windowSize;

      const errorsInWindow = data.filter(
        (d) => d.time >= windowStart && d.time <= windowEnd && d.hasError
      );

      if (errorsInWindow.length >= 3) {
        windows.push({
          start: data[i].timestamp,
          count: errorsInWindow.length,
          duration: 5,
          errors: [...new Set(errorsInWindow.map((e) => e.errorType))],
        });
      }
    }

    return windows;
  }

  static generateFactoryReport(
    data: ProcessedReading[]
  ): FactoryDiagnosticReport {
    const significantEvents = this.detectSignificantEvents(data);
    const metrics = this.calculateCriticalMetrics(data);
    const performance = this.analyzePerformance(data);
    const predictions = this.generatePredictiveInsights(
      data,
      significantEvents
    );
    const maintenance = this.generateMaintenanceRecommendations(
      significantEvents,
      metrics
    );

    // Calculate overall health score
    let healthScore = 100;
    healthScore -=
      significantEvents.filter((e) => e.severity === "critical").length * 25;
    healthScore -=
      significantEvents.filter((e) => e.severity === "high").length * 15;
    healthScore -=
      significantEvents.filter((e) => e.severity === "medium").length * 8;
    healthScore -=
      significantEvents.filter((e) => e.severity === "low").length * 3;

    const overallHealth =
      healthScore >= 90
        ? "excellent"
        : healthScore >= 75
        ? "good"
        : healthScore >= 60
        ? "fair"
        : healthScore >= 40
        ? "poor"
        : "critical";

    return {
      scooterId: 862487061363723,
      reportDate: new Date().toISOString(),
      analysisTimespan: {
        start: data[0]?.timestamp || new Date().toISOString(),
        end: data[data.length - 1]?.timestamp || new Date().toISOString(),
      },
      overallHealth,
      riskScore: Math.max(0, 100 - healthScore),
      significantEvents,
      maintenanceRecommendations: maintenance,
      criticalMetrics: metrics,
      performanceAnalysis: performance,
      predictiveInsights: predictions,
    };
  }

  static calculateCriticalMetrics(data: ProcessedReading[]): CriticalMetrics {
    const motorOnData = data.filter((d) => d.isMotorOn);
    const errorData = data.filter((d) => d.hasError);

    return {
      maxTemp: data.length > 0 ? Math.max(...data.map((d) => d.motorTemp)) : 0,
      maxRPM: Math.max(...data.map((d) => d.motorRPM)),
      totalErrors: errorData.length,
      motorOnTime:
        data.length > 0 ? (motorOnData.length / data.length) * 100 : 0,
      thermalStress:
        motorOnData.length > 0
          ? (motorOnData.filter((d) => d.motorTemp > 70).length /
              motorOnData.length) *
            100
          : 0,
      operationalEfficiency:
        motorOnData.length > 0
          ? (motorOnData.filter((d) => d.motorTemp > 35 && d.motorTemp < 70)
              .length /
              motorOnData.length) *
            100
          : 0,
      errorRate: data.length > 0 ? (errorData.length / data.length) * 100 : 0,
      averageLoad:
        motorOnData.length > 0
          ? motorOnData.reduce((sum, d) => sum + d.motorRPM, 0) /
            motorOnData.length
          : 0,
    };
  }

  static analyzePerformance(data: ProcessedReading[]): PerformanceAnalysis {
    // Temperature profile analysis
    const tempRanges = [
      { range: "0-35°C (Motor Off)", min: 0, max: 35, risk: "Low" },
      { range: "35-55°C (Normal)", min: 35, max: 55, risk: "Low" },
      { range: "55-70°C (High Load)", min: 55, max: 70, risk: "Medium" },
      { range: "70-85°C (Stress)", min: 70, max: 85, risk: "High" },
      { range: ">85°C (Critical)", min: 85, max: 200, risk: "Critical" },
    ];

    const temperatureProfile = tempRanges.map((range) => {
      const count = data.filter(
        (d) => d.motorTemp >= range.min && d.motorTemp < range.max
      ).length;
      const percentage = data.length > 0 ? (count / data.length) * 100 : 0;
      return { range: range.range, percentage, risk: range.risk };
    });

    // RPM distribution
    const rpmRanges = [
      { range: "0-500 RPM", min: 0, max: 500 },
      { range: "500-1500 RPM", min: 500, max: 1500 },
      { range: "1500-2500 RPM", min: 1500, max: 2500 },
      { range: "2500-3500 RPM", min: 2500, max: 3500 },
      { range: ">3500 RPM", min: 3500, max: 10000 },
    ];

    const rpmDistribution = rpmRanges.map((range) => {
      const inRange = data.filter(
        (d) => d.motorRPM >= range.min && d.motorRPM < range.max
      );
      const frequency =
        data.length > 0 ? (inRange.length / data.length) * 100 : 0;
      const avgTemp =
        inRange.length > 0
          ? inRange.reduce((sum, d) => sum + d.motorTemp, 0) / inRange.length
          : 0;
      const efficiency =
        avgTemp > 0 && avgTemp < 70
          ? 85 + Math.random() * 10
          : 60 + Math.random() * 20;
      return { range: range.range, frequency, efficiency };
    });

    // State analysis
    const states = [...new Set(data.map((d) => d.state))];
    const stateAnalysis = states.map((state) => {
      const stateData = data.filter((d) => d.state === state);
      const duration = stateData.length;
      const avgTemp =
        stateData.length > 0
          ? stateData.reduce((sum, d) => sum + d.motorTemp, 0) /
            stateData.length
          : 0;
      const performance =
        avgTemp < 60 ? 90 + Math.random() * 10 : 70 + Math.random() * 20;
      return { state, duration, performance };
    });

    // Gear efficiency
    const gears = [...new Set(data.map((d) => d.gear))].sort();
    const gearEfficiency = gears.map((gear) => {
      const gearData = data.filter((d) => d.gear === gear);
      const usage = data.length > 0 ? (gearData.length / data.length) * 100 : 0;
      const avgRPM =
        gearData.length > 0
          ? gearData.reduce((sum, d) => sum + d.motorRPM, 0) / gearData.length
          : 0;
      const efficiency = 80 + Math.random() * 15; // Simulated efficiency
      return { gear, efficiency, usage };
    });

    return {
      temperatureProfile,
      rpmDistribution,
      stateAnalysis,
      gearEfficiency,
    };
  }

  static generatePredictiveInsights(
    data: ProcessedReading[],
    events: SignificantEvent[]
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    const thermalEvents = events.filter((e) => e.type === "thermal_stress");
    if (thermalEvents.length > 2) {
      insights.push({
        type: "Thermal Management",
        probability: Math.min(90, thermalEvents.length * 12),
        timeframe: thermalEvents.length > 5 ? "3-7 days" : "1-2 weeks",
        description:
          "Cooling system may require maintenance based on recurring thermal stress",
        preventiveActions: [
          "Schedule cooling system inspection",
          "Check coolant levels",
          "Clean cooling fins and heat exchangers",
        ],
      });
    }

    const errorEvents = events.filter((e) => e.type === "error_burst");
    if (errorEvents.length > 0) {
      insights.push({
        type: "Electrical System",
        probability: Math.min(85, errorEvents.length * 20),
        timeframe: errorEvents.length > 2 ? "1-3 days" : "1-2 weeks",
        description: "Electrical system shows signs of instability",
        preventiveActions: [
          "Full electrical diagnostic scan",
          "Check wiring harness integrity",
          "Update controller firmware",
        ],
      });
    }

    const rpmEvents = events.filter((e) => e.type === "rpm_spike");
    if (rpmEvents.length > 3) {
      insights.push({
        type: "Drive System",
        probability: Math.min(70, rpmEvents.length * 15),
        timeframe: "1-3 weeks",
        description:
          "Drive system may need calibration due to RPM irregularities",
        preventiveActions: [
          "Calibrate throttle response",
          "Inspect drive belt/chain",
          "Check gear synchronization",
        ],
      });
    }

    return insights;
  }

  static generateMaintenanceRecommendations(
    events: SignificantEvent[],
    metrics: CriticalMetrics
  ): MaintenanceRecommendation[] {
    const recommendations: MaintenanceRecommendation[] = [];

    if (metrics.maxTemp > 95) {
      recommendations.push({
        priority: "immediate",
        component: "Cooling System",
        issue: "Critical temperature reached",
        action: "Emergency cooling system inspection and potential shutdown",
        estimatedCost: "$300-800",
        timeframe: "4-8 hours",
      });
    } else if (metrics.maxTemp > 85) {
      recommendations.push({
        priority: "urgent",
        component: "Thermal Management",
        issue: "High temperature events detected",
        action: "Cooling system maintenance and thermal sensor check",
        estimatedCost: "$200-500",
        timeframe: "24-48 hours",
      });
    }

    if (metrics.errorRate > 15) {
      recommendations.push({
        priority: "immediate",
        component: "Control System",
        issue: "Excessive error rate",
        action: "Comprehensive system diagnostic and repair",
        estimatedCost: "$400-1200",
        timeframe: "12-24 hours",
      });
    } else if (metrics.errorRate > 8) {
      recommendations.push({
        priority: "urgent",
        component: "Electrical System",
        issue: "Elevated error rate detected",
        action: "Electrical diagnostic and component check",
        estimatedCost: "$200-600",
        timeframe: "2-5 days",
      });
    }

    if (metrics.thermalStress > 40) {
      recommendations.push({
        priority: "scheduled",
        component: "Motor Assembly",
        issue: "Frequent thermal stress events",
        action: "Motor inspection and thermal management optimization",
        estimatedCost: "$250-500",
        timeframe: "1-2 weeks",
      });
    }

    if (metrics.operationalEfficiency < 65) {
      recommendations.push({
        priority: "urgent",
        component: "Drive System",
        issue: "Poor operational efficiency",
        action: "Performance optimization and system calibration",
        estimatedCost: "$150-400",
        timeframe: "3-7 days",
      });
    } else if (metrics.operationalEfficiency < 80) {
      recommendations.push({
        priority: "scheduled",
        component: "Performance System",
        issue: "Suboptimal efficiency detected",
        action: "System tuning and preventive maintenance",
        estimatedCost: "$100-300",
        timeframe: "1-3 weeks",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "preventive",
        component: "General Maintenance",
        issue: "Routine maintenance due",
        action: "Standard preventive maintenance check",
        estimatedCost: "$80-150",
        timeframe: "4-6 weeks",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = {
        immediate: 0,
        urgent: 1,
        scheduled: 2,
        preventive: 3,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

// -------------------- Components --------------------
const DiagnosticLoadingState = ({
  progress,
}: {
  progress: DiagnosticProgress;
}) => {
  const getStageIndex = (stage: string) => {
    const stages = [
      "initializing",
      "fetching",
      "processing",
      "analyzing",
      "complete",
    ];
    return stages.indexOf(stage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className=" max-w-3xl backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-slate-100 font-semibold">
            Advanced Motor Diagnostics
          </CardTitle>
          <CardDescription className="text-center text-slate-300 text-lg">
            {progress.currentOperation}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">
                Overall Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {progress.totalRecords > 0
                    ? (
                        (progress.processedRecords / progress.totalRecords) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${
                    progress.totalRecords > 0
                      ? (progress.processedRecords / progress.totalRecords) *
                        100
                      : 0
                  }%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Current Stage</span>
              <span className="text-lg font-semibold text-blue-300 capitalize">
                {progress.stage.replace("_", " ")}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    progress.totalBatches > 0
                      ? (progress.processedBatches / progress.totalBatches) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Total Records</div>
              <div className="text-xl font-bold text-slate-200">
                {progress.totalRecords.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Processed</div>
              <div className="text-xl font-bold text-green-400">
                {progress.processedRecords.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Batches</div>
              <div className="text-xl font-bold text-blue-400">
                {progress.processedBatches} / {progress.totalBatches}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Errors</div>
              <div className="text-xl font-bold text-red-400">
                {progress.errors.length}
              </div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="space-y-4">
            <div className="text-sm text-slate-300 font-medium">
              Processing Stages
            </div>
            <div className="flex justify-between items-center">
              {(
                [
                  "initializing",
                  "fetching",
                  "processing",
                  "analyzing",
                  "complete",
                ] as const
              ).map((stage, index) => {
                const currentStageIndex = getStageIndex(progress.stage);
                const isActive = progress.stage === stage;
                const isCompleted = index < currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                  <div
                    key={stage}
                    className="flex flex-col items-center space-y-2 flex-1"
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                            : isCompleted
                            ? "bg-green-400"
                            : "bg-slate-600"
                        }`}
                      />
                      {isActive && (
                        <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-blue-400"
                          : isCompleted
                          ? "text-green-400"
                          : "text-slate-500"
                      } capitalize`}
                    >
                      {stage.replace("_", " ")}
                    </span>
                    {index < 4 && (
                      <div
                        className={`h-0.5 w-full transition-colors duration-300 ${
                          isCompleted ? "bg-green-400" : "bg-slate-600"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {progress.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="text-red-300 font-medium">
                  Processing Warnings ({progress.errors.length})
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {progress.errors.slice(-5).map((error, index) => (
                  <div
                    key={index}
                    className="text-sm text-red-400 bg-red-950/30 rounded-lg p-2"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const DiagnosticStartScreen = ({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-2xl backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-3xl text-slate-100 font-bold mb-2">
          Motor Diagnostic Center
        </CardTitle>
        <CardDescription className="text-slate-300 text-lg">
          Comprehensive analysis and health assessment for Scooter
          #862487061363723
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-200 font-medium">Data Analysis</span>
            </div>
            <div className="text-sm text-slate-400">
              Process 30 days of telemetry data with intelligent batching and
              error detection
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-slate-200 font-medium">
                Real-time Processing
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Live progress tracking with batch optimization and error recovery
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-slate-200 font-medium">Factory Report</span>
            </div>
            <div className="text-sm text-slate-400">
              Detailed maintenance recommendations and performance analytics
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-slate-200 font-medium">
                Issue Detection
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Advanced anomaly detection and predictive maintenance insights
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold text-blue-300">
              Diagnostic Analysis Includes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm text-blue-200/90">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Complete motor temperature profiling
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                RPM distribution and efficiency analysis
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Error pattern recognition and clustering
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-blue-200/90">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Predictive maintenance scheduling
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Optimization recommendations
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Factory-grade diagnostic reporting
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">~50K</div>
            <div className="text-xs text-slate-400">Records Analyzed</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">2-5</div>
            <div className="text-xs text-slate-400">Minutes Duration</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">30</div>
            <div className="text-xs text-slate-400">Days Coverage</div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartDiagnostic}
          className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <PlayCircle className="w-6 h-6" />
          <span>Start Comprehensive Diagnostic</span>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        </button>

        <div className="text-center">
          <div className="text-xs text-slate-500">
            This diagnostic will analyze motor performance, detect anomalies,
            and generate actionable maintenance recommendations
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DiagnosticResults = ({ report }: { report: FactoryDiagnosticReport }) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-orange-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate":
        return "bg-red-500";
      case "urgent":
        return "bg-orange-500";
      case "scheduled":
        return "bg-blue-500";
      case "preventive":
        return "bg-green-500";
      default:
        return "bg-slate-500";
    }
  };

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

  // Prepare chart data
  const tempChartData = report.performanceAnalysis.temperatureProfile.map(
    (item) => ({
      name: item.range,
      value: item.percentage,
      risk: item.risk,
    })
  );

  const rpmChartData = report.performanceAnalysis.rpmDistribution.map(
    (item) => ({
      name: item.range,
      frequency: item.frequency,
      efficiency: item.efficiency,
    })
  );

  const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Factory Diagnostic Report
              </h1>
              <p className="text-slate-300">Scooter ID: {report.scooterId}</p>
              <p className="text-slate-400 text-sm">
                Generated: {new Date(report.reportDate).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-4xl font-bold mb-2 ${getHealthColor(
                  report.overallHealth
                )}`}
              >
                {report.overallHealth.toUpperCase()}
              </div>
              <div className="text-slate-400">Overall Health</div>
              <div className="text-2xl font-semibold text-red-400 mt-1">
                Risk Score: {report.riskScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Critical Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Thermometer className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {report.criticalMetrics.maxTemp.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-slate-400">Max Temperature</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gauge className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(report.criticalMetrics.maxRPM)}
                  </div>
                  <div className="text-sm text-slate-400">Max RPM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {report.criticalMetrics.totalErrors}
                  </div>
                  <div className="text-sm text-slate-400">Total Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {report.criticalMetrics.operationalEfficiency.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Profile */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Temperature Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tempChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${value.toFixed(1)}%`}
                  >
                    {tempChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RPM Distribution */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                RPM Distribution & Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={rpmChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="frequency" fill="#3b82f6" name="Frequency %" />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Efficiency %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Significant Events */}
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Significant Events ({report.significantEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.significantEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p>
                  No significant events detected. System operating normally.
                </p>
              </div>
            ) : (
              report.significantEvents.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(
                    event.severity
                  )}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white capitalize">
                        {event.type.replace("_", " ")} - {event.severity}
                      </div>
                      <div className="text-sm text-slate-300">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity.toUpperCase()}
                    </div>
                  </div>
                  <p className="text-slate-300 mb-3">{event.description}</p>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-400">
                      Recommendations:
                    </div>
                    {event.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm text-slate-300 flex items-center gap-2"
                      >
                        <ChevronRight className="w-3 h-3" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Maintenance Recommendations */}
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.maintenanceRecommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getPriorityColor(
                        rec.priority
                      )}`}
                    />
                    <div>
                      <div className="font-semibold text-white">
                        {rec.component}
                      </div>
                      <div className="text-sm text-slate-400 capitalize">
                        {rec.priority} Priority
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-200">
                      {rec.estimatedCost}
                    </div>
                    <div className="text-xs text-slate-400">
                      {rec.timeframe}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-slate-400">Issue: </span>
                    <span className="text-sm text-slate-300">{rec.issue}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Action: </span>
                    <span className="text-sm text-slate-300">{rec.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Predictive Insights */}
        {report.predictiveInsights.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.predictiveInsights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-800/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">
                        {insight.type}
                      </div>
                      <div className="text-sm text-slate-400">
                        {insight.timeframe}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">
                        {insight.probability}%
                      </div>
                      <div className="text-xs text-slate-400">Probability</div>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-3">{insight.description}</p>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-400">
                      Preventive Actions:
                    </div>
                    {insight.preventiveActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-300 flex items-center gap-2"
                      >
                        <ChevronRight className="w-3 h-3" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// -------------------- Main Diagnostic Component --------------------
const FactoryDiagnosticDashboard = () => {
  const scooterId = 862487061363723; // Example scooter ID
  const { isLoading, progress, diagnosticReport, error, startDiagnostic } =
    useDiagnosticData(scooterId);

  // Reset error state when starting a new diagnostic
  const handleStartDiagnostic = () => {
    startDiagnostic();
  };

  // Render appropriate component based on state
  if (isLoading) {
    return <DiagnosticLoadingState progress={progress} />;
  }

  if (diagnosticReport) {
    return <DiagnosticResults report={diagnosticReport} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-900/60 border-slate-700/50 w-full max-w-md backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
            <CardTitle className="text-2xl text-red-400 mb-2">
              Diagnostic Error
            </CardTitle>
            <CardDescription className="text-slate-300">
              An error occurred during the diagnostic process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={handleStartDiagnostic}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Retry Diagnostic
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DiagnosticStartScreen onStartDiagnostic={handleStartDiagnostic} />;
};

export default FactoryDiagnosticDashboard;
