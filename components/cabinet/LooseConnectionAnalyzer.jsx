"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function LooseConnectionAnalyzer({
  currentData,
  historicalData,
  anomalyDetector,
}) {
  // Calculate connection health metrics
  const connectionMetrics = useMemo(() => {
    if (!currentData.length || !historicalData.length) {
      return {
        overallHealth: 0,
        volatilityScore: 0,
        anomalyCount: 0,
        trendingIssues: [],
      };
    }

    let totalAnomalies = 0;
    let volatilitySum = 0;
    let healthyConnections = 0;
    const issueTypes = {};

    currentData.forEach((cabinet) => {
      if (!cabinet.timestamp) return;

      // Get historical data for this cabinet
      const cabinetHistory = historicalData.filter((h) => h.no === cabinet.no);

      if (cabinetHistory.length < 2) return;

      // Calculate voltage volatility
      const voltages = cabinetHistory.map((h) => h.v || 0);
      const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
      const variance =
        voltages.reduce((sum, v) => sum + Math.pow(v - avgVoltage, 2), 0) /
        voltages.length;
      const volatility = Math.sqrt(variance);

      volatilitySum += volatility;

      // Check for anomalies
      const previousCabinet = cabinetHistory[cabinetHistory.length - 2];
      const anomalies = anomalyDetector.detectAnomalies(
        cabinet,
        previousCabinet
      );

      totalAnomalies += anomalies.length;

      // Track issue types
      anomalies.forEach((anomaly) => {
        issueTypes[anomaly.type] = (issueTypes[anomaly.type] || 0) + 1;
      });

      // Check connection health
      if (
        cabinet.communication === 1 &&
        volatility < 5 &&
        anomalies.length === 0
      ) {
        healthyConnections++;
      }
    });

    const avgVolatility =
      currentData.length > 0 ? volatilitySum / currentData.length : 0;
    const healthPercentage =
      currentData.length > 0
        ? (healthyConnections / currentData.length) * 100
        : 0;

    // Get trending issues
    const trendingIssues = Object.entries(issueTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    return {
      overallHealth: Math.round(healthPercentage),
      volatilityScore: Math.round(avgVolatility * 10) / 10,
      anomalyCount: totalAnomalies,
      trendingIssues,
    };
  }, [currentData, historicalData, anomalyDetector]);

  // Get health color
  const getHealthColor = (health) => {
    if (health >= 80) return "text-green-400";
    if (health >= 60) return "text-yellow-400";
    if (health >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getHealthBgColor = (health) => {
    if (health >= 80) return "bg-green-600";
    if (health >= 60) return "bg-yellow-600";
    if (health >= 40) return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Overall Health Score */}
      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-200">
            Connection Health
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Overall Health</span>
            <span
              className={`text-sm font-bold ${getHealthColor(
                connectionMetrics.overallHealth
              )}`}
            >
              {connectionMetrics.overallHealth}%
            </span>
          </div>

          <Progress value={connectionMetrics.overallHealth} className="h-2" />

          <div className="text-xs text-slate-400">
            {connectionMetrics.overallHealth >= 80 &&
              "Excellent connection quality"}
            {connectionMetrics.overallHealth >= 60 &&
              connectionMetrics.overallHealth < 80 &&
              "Good connection quality"}
            {connectionMetrics.overallHealth >= 40 &&
              connectionMetrics.overallHealth < 60 &&
              "Fair connection quality"}
            {connectionMetrics.overallHealth < 40 && "Poor connection quality"}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Volatility Score */}
        {/* <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-medium text-slate-200">
              Volatility
            </span>
          </div>
          <div className="text-sm font-bold text-orange-400">
            {connectionMetrics.volatilityScore}V
          </div>
          <div className="text-xs text-slate-400">
            {connectionMetrics.volatilityScore < 2
              ? "Stable"
              : connectionMetrics.volatilityScore < 5
              ? "Moderate"
              : "High"}
          </div>
        </div> */}

        {/* Anomaly Count */}
        <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-slate-200">
              Anomalies
            </span>
          </div>
          <div className="text-sm font-bold text-red-400">
            {connectionMetrics.anomalyCount}
          </div>
          <div className="text-xs text-slate-400">
            {connectionMetrics.anomalyCount === 0
              ? "None detected"
              : "Issues found"}
          </div>
        </div>

        {/* Active Cabinets */}
        <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-xs font-medium text-slate-200">Active</span>
          </div>
          <div className="text-sm font-bold text-green-400">
            {
              currentData.filter((c) => c.timestamp && c.communication === 1)
                .length
            }
          </div>
          <div className="text-xs text-slate-400">
            of {currentData.length} cabinets
          </div>
        </div>
      </div>

      {/* Trending Issues */}
      {/* {connectionMetrics.trendingIssues.length > 0 && (
        <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-200">Top Issues</span>
          </div>
          <div className="space-y-1">
            {connectionMetrics.trendingIssues.map((issue, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-red-300">{issue.type}</span>
                <span className="text-red-400 font-medium">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Health Thresholds */}
      {/* <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
        <div className="text-xs text-slate-400 mb-2">Health Thresholds</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-green-400">Excellent</span>
            <span className="text-slate-400">80-100%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">Good</span>
            <span className="text-slate-400">60-79%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-400">Fair</span>
            <span className="text-slate-400">40-59%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">Poor</span>
            <span className="text-slate-400">0-39%</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
