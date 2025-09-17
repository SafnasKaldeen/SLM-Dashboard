import { useState, useEffect, useMemo, useCallback } from "react";

// Core interfaces - only what's actually used
interface TelemetryAnalytics {
  DATE_HOUR: string;
  TBOXID: number;
  DATA_POINTS: number;
  AVG_EFFICIENCY: number;
  MIN_EFFICIENCY: number;
  MAX_EFFICIENCY: number;
  AVG_ELECTRICAL_POWER: number;
  AVG_MECHANICAL_POWER: number;
  TOTAL_POWER_CONSUMED: number;
  AVG_BATTERY_HEALTH: number;
  AVG_BATTERY_TEMP: number;
  AVG_MOTOR_TEMP: number;
  AVG_INVERTERTEMP: number;
  VALID_READINGS: number;
  IDLE_READINGS: number;
  OPERATIONAL_READINGS: number;
  CRITICAL_ANOMALIES: number;
  HIGH_ANOMALIES: number;
  MEDIUM_ANOMALIES: number;
  LOW_ANOMALIES: number;
  EFFICIENCY_ANOMALIES: number;
  TEMPERATURE_ANOMALIES: number;
  POWER_ANOMALIES: number;
  MECHANICAL_ANOMALIES: number;
  ELECTRICAL_ANOMALIES: number;
}

interface GearPerformance {
  GEAR_POSITION: number;
  DATA_POINTS: number;
  AVG_EFFICIENCY: number;
  ANOMALY_COUNT: number;
  OPERATIONAL_TIME_PERCENT: number;
}

interface AnomalyData {
  TIMESTAMP: string;
  ANOMALY_TYPE: string;
  SEVERITY: string;
  CONFIDENCE: number;
  DESCRIPTION: string;
  PARAMETER_VALUES: string;
  RECOMMENDATION: string;
  GEAR_POSITION: number;
  EFFICIENCY_VALUE: number;
}

interface SystemHealth {
  OVERALL_HEALTH_SCORE: number;
  BATTERY_HEALTH_TREND: number;
  EFFICIENCY_TREND: number;
  CRITICAL_ANOMALIES: number;
  HIGH_ANOMALIES: number;
  MEDIUM_ANOMALIES: number;
  LOW_ANOMALIES: number;
  POWER_LOSS_EVENTS: number;
  THERMAL_EVENTS: number;
  DATA_QUALITY_SCORE: number;
  OPERATIONAL_EFFICIENCY: number;
  AVG_DAILY_UTILIZATION: number;
  RANGE: number;
}

interface ThresholdConfig {
  minRPM: number;
  minThrottlePercent: number;
  minPowerW: number;
  minCurrentA: number;
  criticalEfficiencyPercent: number;
  lowEfficiencyPercent: number;
  mediumEfficiencyPercent: number;
  batteryOverheatTemp: number;
  motorOverheatTemp: number;
  inverterOverheatTemp: number;
  criticalBatteryTemp: number;
  currentSpikeA: number;
  highPowerW: number;
  abnormalRPMChange: number;
  voltageStabilityThreshold: number;
}

interface TimeFilters {
  timeRange?: number;
  groupBy?: 'hour' | 'day' | 'week';
}

interface TelemetryFilters {
  operationalOnly?: boolean;
  validReadingsOnly?: boolean;
}

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  minRPM: 20,
  minThrottlePercent: 5,
  minPowerW: 50,
  minCurrentA: 10,
  criticalEfficiencyPercent: 0.5,
  lowEfficiencyPercent: 1.0,
  mediumEfficiencyPercent: 3.0,
  batteryOverheatTemp: 340,
  motorOverheatTemp: 40,
  inverterOverheatTemp: 40,
  criticalBatteryTemp: 360,
  currentSpikeA: 350,
  highPowerW: 120000,
  abnormalRPMChange: 300,
  voltageStabilityThreshold: 10,
};

function useTelemetryData(
  IMEI: number,
  timeFilters: TimeFilters = { timeRange: 500, groupBy: 'hour' },
  telemetryFilters: TelemetryFilters = { operationalOnly: false, validReadingsOnly: false },
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
) {
  const [telemetryData, setTelemetryData] = useState<TelemetryAnalytics[]>([]);
  const [gearData, setGearData] = useState<GearPerformance[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchSnowflakeData = useCallback(async (query: string, queryName?: string) => {
    try {
      // Log the query for debugging
      console.log(`Executing ${queryName || 'query'}:`, query);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: query,
          warehouse: process.env.SNOWFLAKE_WAREHOUSE || "COMPUTE_WH",
          database: process.env.SNOWFLAKE_DATABASE || "SOURCE_DATA",
          schema: process.env.SNOWFLAKE_SCHEMA || "VEHICLE_DATA",
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Snowflake API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log(`${queryName || 'Query'} result:`, result);
      
      return result.data || result.rows || result || [];
    } catch (error) {
      console.error(`${queryName || 'Query'} failed:`, error);
      throw error;
    }
  }, []);

  const buildFilterConditions = useCallback(() => {
    const conditions: string[] = [];

    if (timeFilters.timeRange) {
      conditions.push(`CTIME >= EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '${timeFilters.timeRange} HOURS')`);
    }

    if (telemetryFilters.operationalOnly) {
      conditions.push(`MOTORRPM > ${thresholds.minRPM}`);
      conditions.push(`THROTTLEPERCENT > ${thresholds.minThrottlePercent}`);
      conditions.push(`BATCURRENT > ${thresholds.minCurrentA}`);
    }

    if (telemetryFilters.validReadingsOnly) {
      conditions.push(`BATVOLT > 0`);
      conditions.push(`MOTORRPM IS NOT NULL`);
      conditions.push(`THROTTLEPERCENT IS NOT NULL`);
    }

    return conditions;
  }, [timeFilters, telemetryFilters, thresholds]);

  const getTimeGrouping = useCallback(() => {
    switch (timeFilters.groupBy) {
      case 'day': return "DATE_TRUNC('day', TO_TIMESTAMP(CTIME))";
      case 'week': return "DATE_TRUNC('week', TO_TIMESTAMP(CTIME))";
      default: return "DATE_TRUNC('hour', TO_TIMESTAMP(CTIME))";
    }
  }, [timeFilters.groupBy]);

  const queries = useMemo(() => {
    const baseConditions = buildFilterConditions();
    const timeGrouping = getTimeGrouping();
    const whereClause = `WHERE TBOXID = '${IMEI}'${baseConditions.length > 0 ? ' AND ' + baseConditions.join(' AND ') : ''}`;

    return {
      // Simplified telemetry analytics query to avoid complex calculations initially
      telemetryAnalytics: `
        WITH base_data AS (
          SELECT
            ${timeGrouping} as date_hour,
            TBOXID,
            CTIME,
            BATVOLT,
            BATCURRENT,
            MOTORRPM,
            THROTTLEPERCENT,
            GEARINFORMATION,
            BATTEMP,
            MOTORTEMP,
            INVERTERTEMP,
            BATSOH,
            SIDESTANDINFO,
            -- Basic power calculation
            CASE WHEN ABS(BATVOLT * BATCURRENT) > 10 THEN ABS(BATVOLT * BATCURRENT) ELSE 0 END as electrical_power,
            
            -- Operational state flags
            CASE WHEN BATCURRENT > ${thresholds.minCurrentA} AND MOTORRPM > ${thresholds.minRPM} 
                      AND SIDESTANDINFO = 0 THEN 1 ELSE 0 END as is_operational,
            CASE WHEN MOTORRPM <= ${thresholds.minRPM} AND THROTTLEPERCENT <= ${thresholds.minThrottlePercent} 
                 THEN 1 ELSE 0 END as is_idle,
            CASE WHEN BATVOLT > 0 AND MOTORRPM IS NOT NULL AND THROTTLEPERCENT IS NOT NULL 
                 THEN 1 ELSE 0 END as is_valid,
            
            -- Anomaly flags
            CASE WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 1 ELSE 0 END as is_critical_anomaly,
            CASE WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 1 ELSE 0 END as is_high_anomaly,
            CASE WHEN MOTORTEMP > ${thresholds.motorOverheatTemp * 0.8} OR BATTEMP > ${thresholds.batteryOverheatTemp}
                 THEN 1 ELSE 0 END as is_medium_anomaly,
            CASE WHEN MOTORTEMP > ${thresholds.motorOverheatTemp * 0.9} OR BATTEMP > ${thresholds.batteryOverheatTemp * 0.9}
                 THEN 1 ELSE 0 END as is_low_anomaly
                 
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
          ORDER BY CTIME
        )
        SELECT
          date_hour::string as DATE_HOUR,
          TBOXID,
          COUNT(*) as DATA_POINTS,
          AVG(CASE 
            WHEN electrical_power > 0 AND MOTORRPM > ${thresholds.minRPM} 
            THEN (MOTORRPM * THROTTLEPERCENT / 100.0) / electrical_power * 1000
            ELSE 0 
          END) as AVG_EFFICIENCY,
          AVG(CASE 
            WHEN electrical_power > 0 AND MOTORRPM > ${thresholds.minRPM} 
            THEN (MOTORRPM * THROTTLEPERCENT / 100.0) / electrical_power * 1000
            ELSE 0 
          END) as MIN_EFFICIENCY,
          AVG(CASE 
            WHEN electrical_power > 0 AND MOTORRPM > ${thresholds.minRPM} 
            THEN (MOTORRPM * THROTTLEPERCENT / 100.0) / electrical_power * 1000
            ELSE 0 
          END) as MAX_EFFICIENCY,
          AVG(electrical_power) as AVG_ELECTRICAL_POWER,
          AVG(CASE WHEN MOTORRPM > 0 AND THROTTLEPERCENT > 0 THEN
            (MOTORRPM * (THROTTLEPERCENT / 100.0) * GREATEST(GEARINFORMATION, 1) * 0.05)
          ELSE 0 END) as AVG_MECHANICAL_POWER,
          SUM(electrical_power) / 1000.0 as TOTAL_POWER_CONSUMED,
          AVG(BATSOH) as AVG_BATTERY_HEALTH,
          AVG(BATTEMP) as AVG_BATTERY_TEMP,
          AVG(MOTORTEMP) as AVG_MOTOR_TEMP,
          AVG(INVERTERTEMP) as AVG_INVERTERTEMP,
          SUM(is_valid) as VALID_READINGS,
          SUM(is_idle) as IDLE_READINGS,
          SUM(is_operational) as OPERATIONAL_READINGS,
          SUM(is_critical_anomaly) as CRITICAL_ANOMALIES,
          SUM(is_high_anomaly) as HIGH_ANOMALIES,
          SUM(is_medium_anomaly) as MEDIUM_ANOMALIES,
          SUM(is_low_anomaly) as LOW_ANOMALIES,
          SUM(CASE WHEN BATTEMP > ${thresholds.batteryOverheatTemp} OR MOTORTEMP > ${thresholds.motorOverheatTemp} 
                        OR INVERTERTEMP > 70 THEN 1 ELSE 0 END) as TEMPERATURE_ANOMALIES,
          SUM(CASE WHEN ABS(BATVOLT * BATCURRENT) > ${thresholds.highPowerW} OR ABS(BATCURRENT) > ${thresholds.currentSpikeA}
               THEN 1 ELSE 0 END) as POWER_ANOMALIES,
          SUM(CASE WHEN MOTORRPM > 600 THEN 1 ELSE 0 END) as MECHANICAL_ANOMALIES,
          SUM(CASE WHEN ABS(BATCURRENT) > ${thresholds.currentSpikeA} THEN 1 ELSE 0 END) as ELECTRICAL_ANOMALIES
        FROM base_data
        GROUP BY date_hour, TBOXID
        ORDER BY date_hour DESC
      `,

      gearPerformance: `
        SELECT
          GEARINFORMATION as GEAR_POSITION,
          COUNT(*) as DATA_POINTS,
          AVG(CASE
            WHEN MOTORRPM > ${thresholds.minRPM} AND THROTTLEPERCENT > ${thresholds.minThrottlePercent} AND ABS(BATVOLT * BATCURRENT) > 0
            THEN (MOTORRPM * (THROTTLEPERCENT / 100.0) * GEARINFORMATION * 0.05) / ABS(BATVOLT * BATCURRENT) * 100
            ELSE NULL
          END) as AVG_EFFICIENCY,
          SUM(CASE WHEN ABS(BATVOLT * BATCURRENT) > ${thresholds.highPowerW} 
                        OR BATTEMP > ${thresholds.batteryOverheatTemp}
                        OR MOTORTEMP > ${thresholds.motorOverheatTemp}
                   THEN 1 ELSE 0 END) as ANOMALY_COUNT,
          (SUM(CASE WHEN BATCURRENT > ${thresholds.minCurrentA} AND MOTORRPM > ${thresholds.minRPM} 
                        AND SIDESTANDINFO = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as OPERATIONAL_TIME_PERCENT
        FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
        ${whereClause}
        AND GEARINFORMATION BETWEEN 1 AND 6
        GROUP BY GEARINFORMATION
        ORDER BY GEARINFORMATION
      `,

      anomalyDetection: `
        WITH anomaly_data AS (
          SELECT
            TO_TIMESTAMP(CTIME) as timestamp,
            BATTEMP, 
            MOTORTEMP, 
            INVERTERTEMP,
            GEARINFORMATION, 
            MOTORRPM, 
            THROTTLEPERCENT,
            ABS(BATVOLT * BATCURRENT) as electrical_power,
            CASE
              WHEN ABS(BATVOLT * BATCURRENT) > ${thresholds.minPowerW} AND MOTORRPM > ${thresholds.minRPM} 
                   AND THROTTLEPERCENT > ${thresholds.minThrottlePercent}
              THEN (MOTORRPM * (THROTTLEPERCENT / 100.0) * GREATEST(GEARINFORMATION, 1) * 0.05) 
                   / ABS(BATVOLT * BATCURRENT) * 100
              ELSE NULL
            END as efficiency
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
          AND MOTORRPM > ${thresholds.minRPM}
          AND THROTTLEPERCENT > ${thresholds.minThrottlePercent}
        )
        SELECT
          timestamp::string as TIMESTAMP,
          CASE
            WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 'battery_critical_temp'
            WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 'motor_overheating'
            ELSE 'performance_issue'
          END as ANOMALY_TYPE,
          CASE
            WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 'high'
            WHEN efficiency < ${thresholds.mediumEfficiencyPercent} THEN 'medium'
            ELSE 'low'
          END as SEVERITY,
          CASE
            WHEN efficiency < ${thresholds.criticalEfficiencyPercent} THEN 0.95
            WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 0.90
            ELSE 0.75
          END as CONFIDENCE,
          CASE
            WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 'Battery temperature critical'
            WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 'Motor overheating detected'
            ELSE 'Performance anomaly detected'
          END as DESCRIPTION,
          CONCAT(
            'Efficiency: ', COALESCE(ROUND(efficiency, 2), 0), '%, ',
            'Power: ', ROUND(electrical_power, 0), 'W, ',
            'BatTemp: ', BATTEMP, '°C'
          ) as PARAMETER_VALUES,
          CASE
            WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 'EMERGENCY: Stop immediately, activate cooling'
            WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 'Stop operation, allow cooling'
            ELSE 'Monitor performance closely'
          END as RECOMMENDATION,
          GEARINFORMATION as GEAR_POSITION,
          COALESCE(efficiency, 0) as EFFICIENCY_VALUE
        FROM anomaly_data
        WHERE efficiency < ${thresholds.lowEfficiencyPercent}
           OR BATTEMP > ${thresholds.batteryOverheatTemp}
           OR MOTORTEMP > ${thresholds.motorOverheatTemp}
        ORDER BY timestamp DESC
        LIMIT 100
      `,

      systemHealth: `
        WITH health_metrics AS (
          SELECT
            AVG(BATSOH) as avg_battery_health,
            AVG(CASE
              WHEN MOTORRPM > ${thresholds.minRPM} AND THROTTLEPERCENT > ${thresholds.minThrottlePercent} AND ABS(BATVOLT * BATCURRENT) > 0
              THEN (MOTORRPM * (THROTTLEPERCENT / 100.0) * GREATEST(GEARINFORMATION, 1) * 0.05) 
                   / ABS(BATVOLT * BATCURRENT) * 100
              ELSE NULL
            END) as avg_efficiency,
            COUNT(*) as total_readings,
            SUM(CASE WHEN BATVOLT > 0 AND MOTORRPM IS NOT NULL THEN 1 ELSE 0 END) as valid_readings,
            SUM(CASE WHEN BATCURRENT > ${thresholds.minCurrentA} AND MOTORRPM > ${thresholds.minRPM} 
                          THEN 1 ELSE 0 END) as operational_readings,
            SUM(CASE WHEN BATTEMP > ${thresholds.criticalBatteryTemp} THEN 1 ELSE 0 END) as critical_anomalies,
            SUM(CASE WHEN MOTORTEMP > ${thresholds.motorOverheatTemp} THEN 1 ELSE 0 END) as high_anomalies,
            SUM(CASE WHEN BATTEMP > ${thresholds.batteryOverheatTemp} THEN 1 ELSE 0 END) as thermal_events,
            MAX(TOTAL_DISTANCE_KM) - MIN(TOTAL_DISTANCE_KM) as distance_traveled,
            (MAX(BATPERCENT) - MIN(BATPERCENT)) as battery_consumed
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
        )
        SELECT
          GREATEST(0, LEAST(100, 100 - 
            (critical_anomalies * 50.0 / NULLIF(operational_readings, 0)) -
            (high_anomalies * 25.0 / NULLIF(operational_readings, 0))
          )) as OVERALL_HEALTH_SCORE,
          CASE WHEN avg_battery_health > 85 THEN 1 ELSE -1 END as BATTERY_HEALTH_TREND,
          CASE WHEN avg_efficiency > 3.0 THEN 1 ELSE -1 END as EFFICIENCY_TREND,
          critical_anomalies as CRITICAL_ANOMALIES,
          high_anomalies as HIGH_ANOMALIES,
          thermal_events as MEDIUM_ANOMALIES,
          0 as LOW_ANOMALIES,
          critical_anomalies as POWER_LOSS_EVENTS,
          thermal_events as THERMAL_EVENTS,
          (valid_readings * 100.0 / NULLIF(total_readings, 0)) as DATA_QUALITY_SCORE,
          (operational_readings * 100.0 / NULLIF(valid_readings, 0)) as OPERATIONAL_EFFICIENCY,
          (operational_readings * 100.0 / NULLIF(total_readings, 0)) as AVG_DAILY_UTILIZATION,
          CASE 
            WHEN battery_consumed > 0 THEN (distance_traveled / battery_consumed) * 100 
            ELSE 0 
          END as RANGE
        FROM health_metrics
      `
    };
  }, [IMEI, buildFilterConditions, getTimeGrouping, thresholds]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Execute queries one by one to isolate any issues
      console.log("Starting telemetry data fetch...");
      
      const telemetryResult = await fetchSnowflakeData(queries.telemetryAnalytics, "telemetryAnalytics");
      setTelemetryData(telemetryResult || []);
      
      const gearResult = await fetchSnowflakeData(queries.gearPerformance, "gearPerformance");
      setGearData(gearResult || []);
      
      const anomalyResult = await fetchSnowflakeData(queries.anomalyDetection, "anomalyDetection");
      setAnomalies(anomalyResult || []);
      
      const healthResult = await fetchSnowflakeData(queries.systemHealth, "systemHealth");
      setSystemHealth(healthResult?.[0] || null);
      
      setDebugInfo({
        telemetryCount: telemetryResult?.length || 0,
        gearCount: gearResult?.length || 0,
        anomalyCount: anomalyResult?.length || 0,
        healthData: !!healthResult?.[0]
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load telemetry data";
      console.error("Telemetry data loading error:", error);
      setError(errorMessage);
      setTelemetryData([]);
      setGearData([]);
      setAnomalies([]);
      setSystemHealth(null);
    } finally {
      setLoading(false);
    }
  }, [queries, fetchSnowflakeData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    telemetryData,
    gearData,
    anomalies,
    systemHealth,
    loading,
    error,
    debugInfo,
    refetch: loadData,
  };
}

export default useTelemetryData;
export type { 
  TelemetryAnalytics, 
  GearPerformance, 
  AnomalyData, 
  SystemHealth, 
  ThresholdConfig,
  TelemetryFilters,
  TimeFilters
};