// Error Display Component
const DiagnosticError: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
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
          Unable to fetch daily batch data from Snowflake
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
          <p className="text-red-300 text-sm break-words">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          type="button"
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Retry Analysis
        </button>
      </CardContent>
    </Card>
  </div>
);

// Loading State Component
const DiagnosticLoadingState: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <Card className="bg-slate-900/60 border-slate-700/50 w-full max-w-md backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <RefreshCw className="w-16 h-16 text-blue-400 animate-spin" />
        </div>
        <CardTitle className="text-2xl text-blue-400 mb-2">
          Processing Daily Batch
        </CardTitle>
        <CardDescription className="text-slate-300">
          Analyzing 24-hour vehicle data from Snowflake
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

// Start Screen Component
const DiagnosticStartScreen: React.FC<{ onStartDiagnostic: () => void }> = ({ 
  onStartDiagnostic 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <Card className="bg-slate-900/60 border-slate-700/50 w-full max-w-md backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Activity className="w-16 h-16 text-green-400" />
        </div>
        <CardTitle className="text-2xl text-white mb-2">
          Factory Diagnostics
        </CardTitle>
        <CardDescription className="text-slate-300">
          Scooter ID: {DIAGNOSTIC_CONFIG.SCOOTER_ID}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
          <p className="text-slate-300 text-sm">
            Analyze daily batch data including battery health, motor performance, 
            system alerts, and usage patterns from the latest 24-hour period.
          </p>
        </div>
        <button
          onClick={onStartDiagnostic}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          type="button"
        >
          <Activity className="w-5 h-5 inline mr-2" />
          Start Daily Analysis
        </button>
      </CardContent>
    </Card>
  </div>
);

// Metric Card Component
const MetricCard: React.FC<{ metric: MetricData }> = ({ metric }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-green-400 border-green-500/30 bg-green-500/10';
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-slate-400';
    return change > 0 ? 'text-red-400' : 'text-green-400';
  };

  return (
    <Card className={`${getStatusColor(metric.status)} border backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <metric.icon className="w-5 h-5" />
            <div>
              <p className="text-xs font-medium opacity-80">{metric.label}</p>
              <p className="text-lg font-bold">
                {metric.value} {metric.unit}
              </p>
              {metric.change !== undefined && (
                <p className={`text-xs flex items-center ${getChangeColor(metric.change)}`}>
                  {metric.change > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(metric.change)} {metric.unit}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Alert Card Component
const AlertCard: React.FC<{ alert: DiagnosticAlert }> = ({ alert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      default: return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`${getSeverityColor(alert.severity)} border backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {getSeverityIcon(alert.severity)}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {alert.component}
              </span>
              <span className="text-xs opacity-60">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{alert.message}</p>
            {alert.value && alert.threshold && (
              <p className="text-xs opacity-80">
                Value: {alert.value} | Threshold: {alert.threshold}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Health Score Component
const HealthScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'from-green-500/20 to-green-600/20';
    if (score >= 70) return 'from-yellow-500/20 to-yellow-600/20';
    return 'from-red-500/20 to-red-600/20';
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-white mb-2">Overall Health Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBackground(score)} border border-slate-600/30`}>
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-3">
          {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Attention'}
        </p>
      </CardContent>
    </Card>
  );
};

// Main Results Component
const DiagnosticResults: React.FC<{ report: DiagnosticReport }> = ({ report }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Factory Diagnostic Report
        </h1>
        <p className="text-slate-400">
          Scooter ID: {report.scooterId} | {report.dataFreshness}
        </p>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <HealthScoreDisplay score={report.overallHealth} />
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 text-sm">Last Service</p>
            <p className="text-white font-semibold">{report.lastMaintenance}</p>
            <p className="text-slate-400 text-sm mt-2">Next Service</p>
            <p className="text-green-400 font-semibold">{report.nextMaintenance}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Data Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-semibold">Batch Current</p>
            <p className="text-slate-400 text-xs">Daily 12AM Update</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {report.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Active Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Metrics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Battery Metrics */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Battery className="w-6 h-6 mr-2" />
            Battery Analytics (24h)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.metrics.battery.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>

        {/* Motor Metrics */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Gauge className="w-6 h-6 mr-2" />
            Motor Analytics (24h)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.metrics.motor.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            System Analytics (24h)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.metrics.system.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>

        {/* Usage Metrics */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <MapPin className="w-6 h-6 mr-2" />
            Usage Analytics (24h)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.metrics.usage.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          7-Day Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Battery Health %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1 h-16">
                {report.trends.batteryHealth.map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-green-500/60 to-green-400/60 rounded-t flex-1"
                    style={{ height: `${(value / 100) * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Latest: {report.trends.batteryHealth[report.trends.batteryHealth.length - 1]}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Daily Max Motor Temp °C</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1 h-16">
                {report.trends.motorTemp.map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-orange-500/60 to-orange-400/60 rounded-t flex-1"
                    style={{ height: `${(value / 100) * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Latest: {report.trends.motorTemp[report.trends.motorTemp.length - 1]}°C
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Daily Distance km</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1 h-16">
                {report.trends.usage.map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-blue-500/60 to-blue-400/60 rounded-t flex-1"
                    style={{ height: `${(value / 60) * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Latest: {report.trends.usage[report.trends.usage.length - 1]} km
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-8">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          type="button"
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Refresh Analysis
        </button>
      </div>
    </div>
  </div>
);import React, { useState, useEffect } from "react";
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
  Clock
} from "lucide-react";

// Configuration constants
const DIAGNOSTIC_CONFIG = {
  SCOOTER_ID: 862487061363723,
} as const;

// Types for our diagnostic data
interface DiagnosticAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  component: string;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

interface MetricData {
  label: string;
  value: number;
  unit: string;
  change?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
}

interface DiagnosticReport {
  scooterId: number;
  timestamp: string;
  overallHealth: number;
  alerts: DiagnosticAlert[];
  metrics: {
    battery: MetricData[];
    motor: MetricData[];
    system: MetricData[];
    usage: MetricData[];
  };
  trends: {
    batteryHealth: number[];
    motorTemp: number[];
    usage: number[];
  };
  lastMaintenance: string;
  nextMaintenance: string;
}

// Mock hook that simulates data from Snowflake
const useDiagnosticData = (scooterId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = (): DiagnosticReport => {
    // Simulate real-time data that would come from Snowflake queries
    const now = new Date();
    
    const alerts: DiagnosticAlert[] = [
      {
        id: 'bat_temp_high',
        severity: 'warning',
        component: 'Battery',
        message: 'Battery temperature elevated',
        value: 42,
        threshold: 40,
        timestamp: now.toISOString()
      },
      {
        id: 'bat_cycles',
        severity: 'info',
        component: 'Battery',
        message: 'Battery cycle count approaching service interval',
        value: 1850,
        threshold: 2000,
        timestamp: now.toISOString()
      },
      {
        id: 'motor_rpm_spike',
        severity: 'critical',
        component: 'Motor',
        message: 'Unusual RPM spikes detected',
        value: 8500,
        threshold: 8000,
        timestamp: new Date(now.getTime() - 300000).toISOString()
      }
    ];

    const batteryMetrics: MetricData[] = [
      {
        label: 'Battery Voltage',
        value: 48.2,
        unit: 'V',
        change: -2.1,
        status: 'warning',
        icon: Battery
      },
      {
        label: 'State of Health',
        value: 87,
        unit: '%',
        change: -1.2,
        status: 'good',
        icon: Activity
      },
      {
        label: 'Battery Current',
        value: 15.8,
        unit: 'A',
        change: 3.2,
        status: 'good',
        icon: Zap
      },
      {
        label: 'Cell Voltage Diff',
        value: 0.15,
        unit: 'V',
        change: 0.05,
        status: 'warning',
        icon: Settings
      }
    ];

    const motorMetrics: MetricData[] = [
      {
        label: 'Motor Temperature',
        value: 68,
        unit: '°C',
        change: 5.2,
        status: 'good',
        icon: Thermometer
      },
      {
        label: 'Motor RPM',
        value: 3450,
        unit: 'RPM',
        change: -120,
        status: 'good',
        icon: Gauge
      },
      {
        label: 'Inverter Temp',
        value: 45,
        unit: '°C',
        change: 2.1,
        status: 'good',
        icon: Thermometer
      }
    ];

    const systemMetrics: MetricData[] = [
      {
        label: 'System Version',
        value: 2.14,
        unit: '',
        status: 'good',
        icon: Settings
      },
      {
        label: 'TBOX Internal Voltage',
        value: 12.8,
        unit: 'V',
        change: 0.1,
        status: 'good',
        icon: Battery
      },
      {
        label: 'Brake Status',
        value: 0,
        unit: '',
        status: 'good',
        icon: CheckCircle
      }
    ];

    const usageMetrics: MetricData[] = [
      {
        label: 'Total Distance',
        value: 2847.6,
        unit: 'km',
        change: 45.2,
        status: 'good',
        icon: MapPin
      },
      {
        label: 'Throttle Usage',
        value: 65,
        unit: '%',
        change: -5.1,
        status: 'good',
        icon: Gauge
      },
      {
        label: 'Operating Hours',
        value: 142.5,
        unit: 'h',
        change: 8.2,
        status: 'good',
        icon: Clock
      }
    ];

    return {
      scooterId,
      timestamp: now.toISOString(),
      overallHealth: 84,
      alerts,
      metrics: {
        battery: batteryMetrics,
        motor: motorMetrics,
        system: systemMetrics,
        usage: usageMetrics
      },
      trends: {
        batteryHealth: [92, 91, 89, 88, 87, 86, 87],
        motorTemp: [65, 67, 68, 66, 68, 69, 68],
        usage: [120, 135, 142, 138, 145, 150, 142]
      },
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2025-02-15'
    };
  };

  const startDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate diagnostic process
      const steps = [
        'Connecting to vehicle...',
        'Reading sensor data...',
        'Analyzing battery metrics...',
        'Checking motor performance...',
        'Evaluating system health...',
        'Generating report...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(((i + 1) / steps.length) * 100);
      }

      const report = generateMockData();
      setDiagnosticReport(report);
    } catch (err) {
      setError('Failed to complete diagnostic analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    progress,
    diagnosticReport,
    error,
    startDiagnostic
  };
};

/*
SQL Queries for Real Implementation:

1. Overall Health Score:
WITH health_metrics AS (
  SELECT 
    tboxid,
    AVG(batsoh) as avg_soh,
    AVG(battemp) as avg_temp,
    COUNT(CASE WHEN inverter_error != '' THEN 1 END)