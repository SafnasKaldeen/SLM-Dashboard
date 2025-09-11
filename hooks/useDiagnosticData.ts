import { useState } from 'react';
import { 
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
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { ComponentType } from 'react';

// Types
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
  icon: ComponentType<{ className?: string }>;
}

export interface DiagnosticReport {
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
  dataFreshness?: string;
}

export interface DiagnosticHookResult {
  isLoading: boolean;
  progress: number;
  diagnosticReport: DiagnosticReport | null;
  error: string | null;
  startDiagnostic: () => void;
}

// Mock hook that simulates daily batch data from Snowflake (updated at 12 AM)
export const useDiagnosticData = (scooterId: number): DiagnosticHookResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLastBatchTime = () => {
    const now = new Date();
    const today12AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    // If current time is before 12 AM, use yesterday's 12 AM
    if (now < today12AM) {
      today12AM.setDate(today12AM.getDate() - 1);
    }
    return today12AM;
  };

  const generateMockData = (): DiagnosticReport => {
    // Data represents the last 24-hour period ending at last 12 AM batch
    const lastBatchTime = getLastBatchTime();

    // Generate alerts based on daily batch analysis
    const alerts: DiagnosticAlert[] = [
      {
        id: 'bat_temp_daily_max',
        severity: 'warning',
        component: 'Battery',
        message: 'Daily max battery temperature exceeded threshold',
        value: 47,
        threshold: 45,
        timestamp: new Date(lastBatchTime.getTime() + 14 * 60 * 60 * 1000).toISOString() // 2 PM yesterday
      },
      {
        id: 'bat_cycles_increment',
        severity: 'info',
        component: 'Battery',
        message: 'Battery cycles increased by 3 in last 24h',
        value: 1853,
        threshold: 2000,
        timestamp: lastBatchTime.toISOString()
      },
      {
        id: 'motor_rpm_anomaly',
        severity: 'critical',
        component: 'Motor',
        message: 'RPM spikes detected 15 times in last 24h period',
        value: 15,
        threshold: 5,
        timestamp: new Date(lastBatchTime.getTime() + 16 * 60 * 60 * 1000).toISOString() // 4 PM yesterday
      },
      {
        id: 'inverter_error_count',
        severity: 'warning',
        component: 'Inverter',
        message: '7 inverter errors logged in past 24h',
        value: 7,
        threshold: 3,
        timestamp: lastBatchTime.toISOString()
      }
    ];

    // Daily aggregated metrics from the last 24h batch
    const batteryMetrics: MetricData[] = [
      {
        label: 'Avg Battery Voltage (24h)',
        value: 47.8,
        unit: 'V',
        change: -1.2,
        status: 'warning',
        icon: Battery
      },
      {
        label: 'Min SOH (24h)',
        value: 86,
        unit: '%',
        change: -1.0,
        status: 'good',
        icon: Activity
      },
      {
        label: 'Max Battery Current (24h)',
        value: 22.4,
        unit: 'A',
        change: 4.2,
        status: 'good',
        icon: Zap
      },
      {
        label: 'Max Cell Diff (24h)',
        value: 0.18,
        unit: 'V',
        change: 0.03,
        status: 'warning',
        icon: Settings
      },
      {
        label: 'Charging Cycles (24h)',
        value: 3,
        unit: 'cycles',
        change: 1,
        status: 'good',
        icon: RefreshCw
      }
    ];

    const motorMetrics: MetricData[] = [
      {
        label: 'Max Motor Temp (24h)',
        value: 78,
        unit: '°C',
        change: 8.2,
        status: 'warning',
        icon: Thermometer
      },
      {
        label: 'Avg Motor RPM (24h)',
        value: 2850,
        unit: 'RPM',
        change: -180,
        status: 'good',
        icon: Gauge
      },
      {
        label: 'Max RPM Recorded (24h)',
        value: 7200,
        unit: 'RPM',
        change: 450,
        status: 'good',
        icon: TrendingUp
      },
      {
        label: 'Max Inverter Temp (24h)',
        value: 52,
        unit: '°C',
        change: 6.1,
        status: 'warning',
        icon: Thermometer
      }
    ];

    const systemMetrics: MetricData[] = [
      {
        label: 'System Uptime (24h)',
        value: 22.5,
        unit: 'hours',
        status: 'good',
        icon: Clock
      },
      {
        label: 'TBOX Voltage Range (24h)',
        value: 0.4,
        unit: 'V',
        change: 0.1,
        status: 'good',
        icon: Battery
      },
      {
        label: 'Error Count (24h)',
        value: 12,
        unit: 'errors',
        change: 3,
        status: 'warning',
        icon: AlertTriangle
      },
      {
        label: 'MEMS Errors (24h)',
        value: 2,
        unit: 'errors',
        change: 1,
        status: 'warning',
        icon: Settings
      }
    ];

    const usageMetrics: MetricData[] = [
      {
        label: 'Distance (24h)',
        value: 47.8,
        unit: 'km',
        change: 5.2,
        status: 'good',
        icon: MapPin
      },
      {
        label: 'Avg Throttle (24h)',
        value: 42,
        unit: '%',
        change: -3.1,
        status: 'good',
        icon: Gauge
      },
      {
        label: 'Operating Time (24h)',
        value: 8.2,
        unit: 'hours',
        change: 1.2,
        status: 'good',
        icon: Clock
      },
      {
        label: 'Brake Events (24h)',
        value: 145,
        unit: 'events',
        change: 23,
        status: 'good',
        icon: CheckCircle
      }
    ];

    return {
      scooterId,
      timestamp: lastBatchTime.toISOString(),
      overallHealth: 81, // Slightly lower due to recent alerts
      alerts,
      metrics: {
        battery: batteryMetrics,
        motor: motorMetrics,
        system: systemMetrics,
        usage: usageMetrics
      },
      trends: {
        batteryHealth: [89, 88, 87, 86, 86, 85, 81], // 7-day trend
        motorTemp: [72, 74, 76, 75, 77, 78, 78], // Daily max temps
        usage: [38.2, 42.1, 45.8, 41.2, 44.7, 52.3, 47.8] // Daily distance
      },
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2025-02-15',
      dataFreshness: `Last updated: ${lastBatchTime.toLocaleString()}`
    };
  };

  const startDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate diagnostic process with batch data consideration
      const steps = [
        'Connecting to Snowflake...',
        'Fetching latest batch data (12 AM)...',
        'Analyzing 24h battery metrics...',
        'Processing motor performance data...',
        'Calculating system health trends...',
        'Aggregating usage statistics...',
        'Generating diagnostic report...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(((i + 1) / steps.length) * 100);
      }

      const report = generateMockData();
      setDiagnosticReport(report);
    } catch (err) {
      setError('Failed to complete diagnostic analysis from Snowflake batch data');
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
SQL Queries for Real Implementation (Daily Batch Processing at 12 AM):

1. Daily Battery Health Metrics:
*/
/*
WITH daily_battery_metrics AS (
  SELECT 
    tboxid,
    DATE_TRUNC('day', TO_TIMESTAMP(ctime)) as batch_date,
    AVG(batvolt) as avg_battery_voltage,
    MIN(batsoh) as min_soh,
    MAX(batcurrent) as max_battery_current,
    MAX(batcelldiffmax) as max_cell_diff,
    MAX(battemp) as max_battery_temp,
    COUNT(CASE WHEN batcyclecount > LAG(batcyclecount) OVER (PARTITION BY tboxid ORDER BY ctime) THEN 1 END) as daily_cycles
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid, DATE_TRUNC('day', TO_TIMESTAMP(ctime))
);
*/

/*
2. Daily Motor Performance Analysis:
*/
/*
WITH daily_motor_metrics AS (
  SELECT 
    tboxid,
    DATE_TRUNC('day', TO_TIMESTAMP(ctime)) as batch_date,
    MAX(motortemp) as max_motor_temp,
    AVG(motorrpm) as avg_motor_rpm,
    MAX(motorrpm) as max_motor_rpm,
    MAX(invertertemp) as max_inverter_temp,
    COUNT(CASE WHEN motorrpm > 7000 THEN 1 END) as high_rpm_events
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid, DATE_TRUNC('day', TO_TIMESTAMP(ctime))
);
*/

/*
3. Daily System Health and Error Analysis:
*/
/*
WITH daily_system_health AS (
  SELECT 
    tboxid,
    DATE_TRUNC('day', TO_TIMESTAMP(ctime)) as batch_date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN inverter_error != '' AND inverter_error IS NOT NULL THEN 1 END) as inverter_error_count,
    COUNT(CASE WHEN battery_error != '' AND battery_error IS NOT NULL THEN 1 END) as battery_error_count,
    COUNT(CASE WHEN tbox_mems_error_flag > 0 THEN 1 END) as mems_error_count,
    MAX(tbox_internal_bat_volt) - MIN(tbox_internal_bat_volt) as tbox_voltage_range,
    COUNT(DISTINCT HOUR(TO_TIMESTAMP(ctime))) as operating_hours
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid, DATE_TRUNC('day', TO_TIMESTAMP(ctime))
);
*/

/*
4. Daily Usage Statistics:
*/
/*
WITH daily_usage_metrics AS (
  SELECT 
    tboxid,
    DATE_TRUNC('day', TO_TIMESTAMP(ctime)) as batch_date,
    MAX(total_distance_km) - MIN(total_distance_km) as daily_distance,
    AVG(throttlepercent) as avg_throttle_percent,
    COUNT(CASE WHEN brakestatus > 0 THEN 1 END) as brake_events,
    COUNT(CASE WHEN throttlepercent > 0 THEN 1 END) as active_throttle_time
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid, DATE_TRUNC('day', TO_TIMESTAMP(ctime))
);
*/

/*
5. 7-Day Trend Analysis:
*/
/*
WITH weekly_trends AS (
  SELECT 
    tboxid,
    DATE_TRUNC('day', TO_TIMESTAMP(ctime)) as batch_date,
    MIN(batsoh) as daily_min_soh,
    MAX(motortemp) as daily_max_motor_temp,
    MAX(total_distance_km) - MIN(total_distance_km) as daily_distance
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '7 days'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid, DATE_TRUNC('day', TO_TIMESTAMP(ctime))
  ORDER BY batch_date DESC
);
*/

/*
6. Alert Generation Logic:
*/
/*
WITH alert_conditions AS (
  SELECT 
    tboxid,
    CASE 
      WHEN MAX(battemp) > 45 THEN 'Battery temperature exceeded 45°C'
      WHEN MAX(batcelldiffmax) > 0.15 THEN 'Cell voltage difference exceeds safe threshold'
      WHEN COUNT(CASE WHEN motorrpm > 7000 THEN 1 END) > 5 THEN 'Excessive high RPM events detected'
      WHEN COUNT(CASE WHEN inverter_error != '' THEN 1 END) > 3 THEN 'Multiple inverter errors in 24h period'
    END as alert_message,
    CASE 
      WHEN MAX(battemp) > 50 OR COUNT(CASE WHEN motorrpm > 8000 THEN 1 END) > 0 THEN 'critical'
      WHEN MAX(battemp) > 45 OR MAX(batcelldiffmax) > 0.15 THEN 'warning'
      ELSE 'info'
    END as severity
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid
);
*/

/*
7. Overall Health Score Calculation:
*/
/*
WITH health_score AS (
  SELECT 
    tboxid,
    CASE 
      WHEN MIN(batsoh) < 80 THEN 60
      WHEN MIN(batsoh) < 85 THEN 75
      WHEN MIN(batsoh) < 90 THEN 85
      ELSE 95
    END as battery_health_score,
    CASE 
      WHEN MAX(motortemp) > 80 THEN 60
      WHEN MAX(motortemp) > 70 THEN 75
      ELSE 90
    END as motor_health_score,
    CASE 
      WHEN COUNT(CASE WHEN inverter_error != '' THEN 1 END) > 5 THEN 60
      WHEN COUNT(CASE WHEN inverter_error != '' THEN 1 END) > 2 THEN 80
      ELSE 95
    END as system_health_score
  FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
  WHERE tboxid = 862487061363723
    AND TO_TIMESTAMP(ctime) >= CURRENT_DATE - INTERVAL '1 day'
    AND TO_TIMESTAMP(ctime) < CURRENT_DATE
  GROUP BY tboxid
),
overall_health AS (
  SELECT 
    tboxid,
    (battery_health_score + motor_health_score + system_health_score) / 3 as overall_health_score
  FROM health_score
);
*/