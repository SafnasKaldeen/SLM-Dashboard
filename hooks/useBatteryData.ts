import { useState, useEffect, useMemo, useCallback } from "react";

// Core interfaces for battery diagnostics
interface TboxData {
  TBOX_INTERNAL_BAT_VOLT: number;
  SIDESTANDINFO: number;
  BATTEMP: number;
  BATVOLT: number;
  BRAKESTATUS: number;
  TBOX_MEMS_ERROR_FLAG: number;
  INVERTER_ERROR: string;
  STATE: string;
  BATCELLDIFFMAX: number;
  BATCYCLECOUNT: number;
  BATSOH: number;
  BATPERCENT: number;
  THROTTLEPERCENT: number;
  BATCURRENT: number;
  GEARINFORMATION: number;
  BATTERY_ERROR: string;
  SYS_VERSION: number;
  CTIME: number;
  MOTORRPM: number;
  BMSID: string;
  MOTORTEMP: number;
  INVERTERTEMP: number;
  TBOX_ID: string;
  TBOXID: string;
  RPM: number;
  BMS_ID: string; // Derived from BMSID or TBOX_ID
  TBOX_START_TIME: number;
  TOTAL_DISTANCE_KM: number;
  SIM_ICCID: string;
}

interface BatterySwapEvent {
  timestamp: number;
  oldBmsId: string;
  newBmsId: string;
  oldSOH: number;
  newSOH: number;
  chargeChange: number;
  consolidatedCount?: number; // Number of rapid swaps consolidated
  duration?: number; // Duration of swap session in seconds
}

interface BatterySession {
  bmsId: string;
  startTime: number;
  endTime: number;
  duration: number;
  avgSOH: number;
  avgTemp: number;
  avgVoltage: number;
  startCharge: number;
  endCharge: number;
  chargeConsumed: number;
  distanceCovered: number;
  avgCurrent: number;
  maxTemp: number;
  minVoltage: number;
  cycleCount: number;
  errorEvents: number;
}

interface DiagnosticMetrics {
  totalBatteries: number;
  totalSwaps: number;
  avgSessionDuration: number;
  preferredBatteries: string[];
  problematicBatteries: string[];
  swapFrequency: number;
  batteryEfficiency: number;
  thermalPerformance: string;
  voltageStability: string;
  overallHealth: string;
}

interface BatteryFilters {
  timeRange: number; // hours
  includeIdleData?: boolean;
  minBatteryTemp?: number;
  maxBatteryTemp?: number;
  minSOH?: number;
}

// Utility function to clean BMS IDs
function cleanBmsId(bmsId: string): string {
  if (!bmsId || typeof bmsId !== 'string') return '';
  
  // Remove control characters, whitespace, and normalize
  return bmsId
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '') // Remove control characters
    .trim()
    .replace(/\s+/g, '') // Remove all whitespace
    .toUpperCase();
}

// Utility functions to normalize sensor data
function normalizeTemperature(temp: number): number {
  if (temp > 200) {
    // Likely in Kelvin, convert to Celsius
    return Math.round((temp - 273.15) * 10) / 10;
  }
  return Math.round(temp * 10) / 10;
}

function normalizeVoltage(voltage: number): number {
  if (voltage > 200) {
    // Likely in millivolts, convert to volts
    return Math.round((voltage / 10) * 10) / 10;
  }
  return Math.round(voltage * 10) / 10;
}

function calculateEfficiency(distance: number, chargeConsumed: number): number {
  if (chargeConsumed <= 0 || distance <= 0) return 0;
  return Math.round((distance / chargeConsumed) * 100) / 100;
}

// Check if two BMS IDs are essentially the same after cleaning
function areSameBattery(bmsId1: string, bmsId2: string): boolean {
  const clean1 = cleanBmsId(bmsId1);
  const clean2 = cleanBmsId(bmsId2);
  
  // Direct match after cleaning
  if (clean1 === clean2) return true;
  
  // Handle cases where one might be a substring of another due to truncation
  if (clean1.length > 10 && clean2.length > 10) {
    const minLength = Math.min(clean1.length, clean2.length);
    if (minLength > 10) {
      return clean1.substring(0, minLength) === clean2.substring(0, minLength);
    }
  }
  
  return false;
}

// Consolidate rapid swaps within time window
function consolidateRapidSwaps(swaps: BatterySwapEvent[], timeWindowMinutes: number = 10): BatterySwapEvent[] {
  if (swaps.length === 0) return [];
  
  const consolidated: BatterySwapEvent[] = [];
  const timeWindowSeconds = timeWindowMinutes * 60;
  
  // Sort by timestamp descending (newest first)
  const sortedSwaps = [...swaps].sort((a, b) => b.timestamp - a.timestamp);
  
  let i = 0;
  while (i < sortedSwaps.length) {
    const currentSwap = sortedSwaps[i];
    const swapGroup: BatterySwapEvent[] = [currentSwap];
    
    // Look ahead for swaps within time window involving same batteries
    let j = i + 1;
    while (j < sortedSwaps.length) {
      const nextSwap = sortedSwaps[j];
      const timeDiff = currentSwap.timestamp - nextSwap.timestamp;
      
      if (timeDiff <= timeWindowSeconds) {
        // Check if this involves the same pair of batteries (in either direction)
        const sameOldNew = (areSameBattery(currentSwap.oldBmsId, nextSwap.oldBmsId) && 
                           areSameBattery(currentSwap.newBmsId, nextSwap.newBmsId));
        const sameNewOld = (areSameBattery(currentSwap.oldBmsId, nextSwap.newBmsId) && 
                           areSameBattery(currentSwap.newBmsId, nextSwap.oldBmsId));
        
        if (sameOldNew || sameNewOld) {
          swapGroup.push(nextSwap);
          sortedSwaps.splice(j, 1); // Remove from main list
        } else {
          j++;
        }
      } else {
        break; // Beyond time window
      }
    }
    
    if (swapGroup.length > 1) {
      // Create consolidated swap event
      const firstSwap = swapGroup[swapGroup.length - 1]; // Oldest in group
      const lastSwap = swapGroup[0]; // Newest in group
      
      const consolidatedSwap: BatterySwapEvent = {
        timestamp: lastSwap.timestamp,
        oldBmsId: cleanBmsId(firstSwap.oldBmsId),
        newBmsId: cleanBmsId(lastSwap.newBmsId),
        oldSOH: firstSwap.oldSOH,
        newSOH: lastSwap.newSOH,
        chargeChange: swapGroup.reduce((sum, swap) => sum + swap.chargeChange, 0),
        consolidatedCount: swapGroup.length,
        duration: lastSwap.timestamp - firstSwap.timestamp
      };
      
      // Only add if it's actually a different battery after consolidation
      if (!areSameBattery(consolidatedSwap.oldBmsId, consolidatedSwap.newBmsId)) {
        consolidated.push(consolidatedSwap);
      }
    } else {
      // Single swap, check if it's a real swap (different batteries)
      const cleanedSwap = {
        ...currentSwap,
        oldBmsId: cleanBmsId(currentSwap.oldBmsId),
        newBmsId: cleanBmsId(currentSwap.newBmsId)
      };
      
      if (!areSameBattery(cleanedSwap.oldBmsId, cleanedSwap.newBmsId)) {
        consolidated.push(cleanedSwap);
      }
    }
    
    i++;
  }
  
  return consolidated.sort((a, b) => b.timestamp - a.timestamp);
}

function useBatteryData(
  tboxId: string,
  filters: BatteryFilters = { timeRange: 168 } // Default 7 days
) {
  const [batteryData, setBatteryData] = useState<TboxData[]>([]);
  const [batterySwaps, setBatterySwaps] = useState<BatterySwapEvent[]>([]);
  const [batterySessions, setBatterySessions] = useState<BatterySession[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchSnowflakeData = useCallback(async (query: string, queryName?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: query,
          warehouse: process.env.SNOWFLAKE_WAREHOUSE || "AIDASHBOARD",
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

    // Time range filter
    conditions.push(`CTIME >= EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '${filters.timeRange} HOURS')`);

    // Optional filters
    if (filters.minBatteryTemp) {
      conditions.push(`BATTEMP >= ${filters.minBatteryTemp}`);
    }

    if (filters.maxBatteryTemp) {
      conditions.push(`BATTEMP <= ${filters.maxBatteryTemp}`);
    }

    if (filters.minSOH) {
      conditions.push(`BATSOH >= ${filters.minSOH}`);
    }

    // Exclude idle data if requested
    if (!filters.includeIdleData) {
      conditions.push(`NOT (MOTORRPM <= 20 AND THROTTLEPERCENT <= 50 AND ABS(BATCURRENT) <= 20)`);
    }

    return conditions;
  }, [filters]);

  const queries = useMemo(() => {
    const filterConditions = buildFilterConditions();
    const whereClause = `WHERE TBOXID = '${tboxId}' AND ${filterConditions.join(' AND ')}`;

    return {
      // Main battery telemetry data with cleaned BMS IDs
      batteryTelemetry: `
        SELECT
          TBOX_INTERNAL_BAT_VOLT,
          SIDESTANDINFO,
          BATTEMP,
          BATVOLT,
          BRAKESTATUS,
          TBOX_MEMS_ERROR_FLAG,
          COALESCE(INVERTER_ERROR, '') as INVERTER_ERROR,
          COALESCE(STATE, 'UNKNOWN') as STATE,
          BATCELLDIFFMAX,
          BATCYCLECOUNT,
          BATSOH,
          BATPERCENT,
          THROTTLEPERCENT,
          BATCURRENT,
          GEARINFORMATION,
          COALESCE(BATTERY_ERROR, '') as BATTERY_ERROR,
          SYS_VERSION,
          CTIME,
          MOTORRPM,
          -- Clean BMSID by removing control characters
          REGEXP_REPLACE(COALESCE(BMSID, 'BMS_UNKNOWN'), '[\\x00-\\x1F\\x7F-\\x9F]', '') as BMSID,
          MOTORTEMP,
          INVERTERTEMP,
          TBOX_ID,
          TBOXID,
          RPM,
          -- Create cleaned BMS_ID
          CASE 
            WHEN BMSID IS NOT NULL AND BMSID != '' THEN 
              UPPER(TRIM(REGEXP_REPLACE(BMSID, '[\\x00-\\x1F\\x7F-\\x9F]', '')))
            WHEN TBOX_ID IS NOT NULL THEN CONCAT('BMS_', RIGHT(TBOX_ID, 2))
            ELSE CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))
          END as BMS_ID,
          TBOX_START_TIME,
          COALESCE(TOTAL_DISTANCE_KM, 0) as TOTAL_DISTANCE_KM,
          COALESCE(SIM_ICCID, '') as SIM_ICCID
        FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
        ${whereClause}
        ORDER BY CTIME ASC
      `,

      // Improved battery swap detection with cleaning and consolidation
      batterySwapDetection: `
        WITH cleaned_data AS (
          SELECT
            CTIME,
            -- Clean BMS ID by removing control characters and normalizing
            UPPER(TRIM(REGEXP_REPLACE(
              COALESCE(BMSID, CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))), 
              '[\\x00-\\x1F\\x7F-\\x9F]', ''
            ))) as current_bms,
            BATSOH,
            BATPERCENT,
            TOTAL_DISTANCE_KM,
            -- Add row number for better LAG handling
            ROW_NUMBER() OVER (ORDER BY CTIME) as row_num
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
        ),
        battery_changes AS (
          SELECT
            CTIME,
            current_bms,
            LAG(current_bms, 1) OVER (ORDER BY CTIME) as previous_bms,
            BATSOH,
            LAG(BATSOH, 1) OVER (ORDER BY CTIME) as previous_soh,
            BATPERCENT,
            LAG(BATPERCENT, 1) OVER (ORDER BY CTIME) as previous_charge,
            TOTAL_DISTANCE_KM,
            -- Calculate time difference from previous reading
            LAG(CTIME, 1) OVER (ORDER BY CTIME) as previous_time
          FROM cleaned_data
        ),
        potential_swaps AS (
          SELECT
            CTIME as timestamp,
            previous_bms as oldBmsId,
            current_bms as newBmsId,
            COALESCE(previous_soh, 0) as oldSOH,
            COALESCE(BATSOH, 0) as newSOH,
            COALESCE((BATPERCENT - previous_charge), 0) as chargeChange,
            (CTIME - previous_time) as time_gap
          FROM battery_changes
          WHERE current_bms != previous_bms
            AND current_bms IS NOT NULL
            AND previous_bms IS NOT NULL
            AND previous_bms != ''
            AND current_bms != ''
            -- Filter out rapid oscillations (less than 30 seconds apart are likely data issues)
            AND (CTIME - previous_time) >= 30
            -- Filter out cases where BMS IDs are very similar (likely same battery with data corruption)
            AND LENGTH(current_bms) > 5
            AND LENGTH(previous_bms) > 5
        )
        SELECT *
        FROM potential_swaps
        ORDER BY timestamp DESC
        LIMIT 100
      `,

      // Enhanced battery session analysis with cleaned BMS IDs
      batterySessionAnalysis: `
        WITH cleaned_base_data AS (
            SELECT *,
            UPPER(TRIM(REGEXP_REPLACE(
              COALESCE(BMSID, CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))), 
              '[\\x00-\\x1F\\x7F-\\x9F]', ''
            ))) as bms_id
            FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
            ${whereClause}
        ),
        bms_changes AS (
            SELECT *,
            LAG(bms_id, 1, 'DIFFERENT') OVER (ORDER BY CTIME) as prev_bms_id
            FROM cleaned_base_data
        ),
        session_groups AS (
            SELECT *,
            SUM(CASE WHEN bms_id != prev_bms_id THEN 1 ELSE 0 END) 
                OVER (ORDER BY CTIME) as session_group
            FROM bms_changes
        ),
        battery_sessions AS (
            SELECT
            bms_id,
            session_group,
            MIN(CTIME) as session_start,
            MAX(CTIME) as session_end,
            COUNT(*) as data_points,
            AVG(BATSOH) as avg_soh,
            AVG(BATTEMP) as avg_temp,
            AVG(BATVOLT) as avg_voltage,
            MIN(BATPERCENT) as min_charge,
            MAX(BATPERCENT) as max_charge,
            AVG(ABS(BATCURRENT)) as avg_current,
            MAX(BATTEMP) as max_temp,
            MIN(BATVOLT) as min_voltage,
            MAX(BATCYCLECOUNT) as cycle_count,
            MIN(TOTAL_DISTANCE_KM) as start_distance,
            MAX(TOTAL_DISTANCE_KM) as end_distance,
            SUM(CASE WHEN BATTERY_ERROR IS NOT NULL AND BATTERY_ERROR != '' 
                    OR INVERTER_ERROR IS NOT NULL AND INVERTER_ERROR != ''
                THEN 1 ELSE 0 END) as error_events
            FROM session_groups
            GROUP BY bms_id, session_group
        )
        SELECT
            bms_id as bmsId,
            session_start as startTime,
            session_end as endTime,
            ROUND((session_end - session_start) / 3600.0, 2) as duration,
            ROUND(avg_soh, 1) as avgSOH,
            ROUND(avg_temp, 1) as avgTemp,
            ROUND(avg_voltage, 2) as avgVoltage,
            ROUND(max_charge, 1) as startCharge,
            ROUND(min_charge, 1) as endCharge,
            ROUND(max_charge - min_charge, 1) as chargeConsumed,
            ROUND(COALESCE(end_distance - start_distance, 0), 2) as distanceCovered,
            ROUND(avg_current, 1) as avgCurrent,
            ROUND(max_temp, 1) as maxTemp,
            ROUND(min_voltage, 2) as minVoltage,
            cycle_count as cycleCount,
            error_events as errorEvents
        FROM battery_sessions
        WHERE (session_end - session_start) > 360  -- Filter out sessions shorter than 6 minutes
          AND bms_id != ''  -- Ensure we have valid BMS ID
          AND LENGTH(bms_id) > 5  -- Reasonable BMS ID length
        ORDER BY session_start DESC
        LIMIT 100
        `,

      // System diagnostics with cleaned data
      systemDiagnostics: `
        WITH cleaned_battery_stats AS (
          SELECT
            COUNT(DISTINCT UPPER(TRIM(REGEXP_REPLACE(
              COALESCE(BMSID, CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))), 
              '[\\x00-\\x1F\\x7F-\\x9F]', ''
            )))) as total_batteries,
            AVG(BATSOH) as avg_soh,
            AVG(BATTEMP) as avg_temp,
            COUNT(*) as total_readings,
            SUM(CASE WHEN BATTERY_ERROR IS NOT NULL AND BATTERY_ERROR != '' 
                     OR BATTEMP > 65
                THEN 1 ELSE 0 END) as critical_events,
            SUM(CASE WHEN BATVOLT < 44 OR BATVOLT > 54 THEN 1 ELSE 0 END) as voltage_anomalies,
            MAX(TOTAL_DISTANCE_KM) - MIN(TOTAL_DISTANCE_KM) as distance_covered,
            (MAX(BATPERCENT) - MIN(BATPERCENT)) as charge_consumed,
            COUNT(DISTINCT DATE_TRUNC('day', TO_TIMESTAMP(CTIME))) as active_days
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
        ),
        cleaned_battery_performance AS (
          SELECT
            UPPER(TRIM(REGEXP_REPLACE(
              COALESCE(BMSID, CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))), 
              '[\\x00-\\x1F\\x7F-\\x9F]', ''
            ))) as bms_id,
            AVG(BATSOH) as avg_soh,
            AVG(BATTEMP) as avg_temp,
            SUM(CASE WHEN BATTERY_ERROR IS NOT NULL AND BATTERY_ERROR != '' THEN 1 ELSE 0 END) as error_count,
            COUNT(*) as readings_count,
            MAX(TOTAL_DISTANCE_KM) - MIN(TOTAL_DISTANCE_KM) as distance,
            (MAX(BATPERCENT) - MIN(BATPERCENT)) as charge_used
          FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
          ${whereClause}
          GROUP BY UPPER(TRIM(REGEXP_REPLACE(
            COALESCE(BMSID, CONCAT('BMS_', SUBSTRING(TBOXID, LENGTH(TBOXID)-1, 2))), 
            '[\\x00-\\x1F\\x7F-\\x9F]', ''
          )))
          HAVING COUNT(*) > 10 AND LENGTH(bms_id) > 5
        )
        SELECT
          bs.total_batteries,
          bs.avg_soh,
          bs.avg_temp,
          bs.critical_events,
          bs.voltage_anomalies,
          bs.total_readings,
          bs.distance_covered,
          bs.charge_consumed,
          bs.active_days,
          CASE WHEN bs.charge_consumed > 0 
               THEN ROUND(bs.distance_covered / bs.charge_consumed, 2)
               ELSE 0 END as battery_efficiency,
          LISTAGG(
            CASE WHEN bp.avg_soh >= 90 AND (bp.error_count * 100.0 / bp.readings_count) < 5 
                 THEN bp.bms_id END, ','
          ) WITHIN GROUP (ORDER BY bp.avg_soh DESC) as preferred_batteries,
          LISTAGG(
            CASE WHEN bp.avg_soh < 85 OR (bp.error_count * 100.0 / bp.readings_count) > 10 OR bp.avg_temp > 45
                 THEN bp.bms_id END, ','
          ) WITHIN GROUP (ORDER BY bp.avg_soh ASC) as problematic_batteries
        FROM cleaned_battery_stats bs
        CROSS JOIN cleaned_battery_performance bp
        GROUP BY bs.total_batteries, bs.avg_soh, bs.avg_temp, bs.critical_events, 
                 bs.voltage_anomalies, bs.total_readings, bs.distance_covered, 
                 bs.charge_consumed, bs.active_days
      `
    };
  }, [tboxId, buildFilterConditions]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Fetch main telemetry data
      const telemetryResult = await fetchSnowflakeData(queries.batteryTelemetry, "batteryTelemetry");
      setBatteryData(telemetryResult || []);
      
      // Fetch and process battery swaps
      const swapResult = await fetchSnowflakeData(queries.batterySwapDetection, "batterySwapDetection");
      const rawSwaps = swapResult || [];
      
      // Apply client-side consolidation for rapid swaps
      const consolidatedSwaps = consolidateRapidSwaps(rawSwaps, 10); // 10-minute window
      setBatterySwaps(consolidatedSwaps);
      
      // Fetch battery sessions
      const sessionResult = await fetchSnowflakeData(queries.batterySessionAnalysis, "batterySessionAnalysis");
      setBatterySessions(sessionResult || []);
      
      // Fetch system diagnostics
      const diagnosticResult = await fetchSnowflakeData(queries.systemDiagnostics, "systemDiagnostics");
      const rawDiagnostics = diagnosticResult?.[0];
      
      if (rawDiagnostics) {
        const safeNumber = (value: any, defaultValue: number = 0): number => {
          const num = Number(value);
          return isNaN(num) ? defaultValue : num;
        };

        const processedDiagnostics: DiagnosticMetrics = {
          totalBatteries: safeNumber(rawDiagnostics.TOTAL_BATTERIES),
          totalSwaps: consolidatedSwaps.length,
          avgSessionDuration: sessionResult?.length > 0 ? 
            sessionResult.reduce((sum: number, s: any) => sum + safeNumber(s.duration), 0) / sessionResult.length : 0,
          preferredBatteries: rawDiagnostics.PREFERRED_BATTERIES ? 
            rawDiagnostics.PREFERRED_BATTERIES.split(',').filter(Boolean) : [],
          problematicBatteries: rawDiagnostics.PROBLEMATIC_BATTERIES ? 
            rawDiagnostics.PROBLEMATIC_BATTERIES.split(',').filter(Boolean) : [],
          swapFrequency: consolidatedSwaps.length / Math.max(1, safeNumber(rawDiagnostics.ACTIVE_DAYS, 1)),
          batteryEfficiency: safeNumber(rawDiagnostics.BATTERY_EFFICIENCY),
          thermalPerformance: (() => {
            const temp = safeNumber(rawDiagnostics.AVG_TEMP);
            return temp < 35 ? "Excellent" : 
                   temp < 45 ? "Good" : 
                   temp < 55 ? "Fair" : "Poor";
          })(),
          voltageStability: (() => {
            const anomalies = safeNumber(rawDiagnostics.VOLTAGE_ANOMALIES);
            const readings = safeNumber(rawDiagnostics.TOTAL_READINGS, 1);
            return (anomalies / readings) < 0.05 ? "Stable" : "Unstable";
          })(),
          overallHealth: (() => {
            const soh = safeNumber(rawDiagnostics.AVG_SOH);
            const criticalEvents = safeNumber(rawDiagnostics.CRITICAL_EVENTS);
            return soh > 90 && criticalEvents < 5 ? "Excellent" :
                   soh > 80 && criticalEvents < 15 ? "Good" :
                   soh > 70 ? "Fair" : "Poor";
          })()
        };
        setDiagnostics(processedDiagnostics);
      }
      
      setDebugInfo({
        telemetryCount: telemetryResult?.length || 0,
        rawSwapCount: rawSwaps.length,
        consolidatedSwapCount: consolidatedSwaps.length,
        sessionCount: sessionResult?.length || 0,
        diagnosticsFound: !!rawDiagnostics,
        timeRange: filters.timeRange,
        uniqueBatteries: [...new Set(telemetryResult?.map((d: any) => d.BMS_ID) || [])].length,
        swapsConsolidated: rawSwaps.length - consolidatedSwaps.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load battery data";
      console.error("Battery data loading error:", error);
      setError(errorMessage);
      setBatteryData([]);
      setBatterySwaps([]);
      setBatterySessions([]);
      setDiagnostics(null);
    } finally {
      setLoading(false);
    }
  }, [queries, fetchSnowflakeData, filters.timeRange]);

  useEffect(() => {
    if (tboxId) {
      loadData();
    }
  }, [loadData, tboxId]);

  return {
    batteryData,
    batterySwaps,
    batterySessions,
    diagnostics,
    loading,
    error,
    debugInfo,
    refetch: loadData,
  };
}


export type {
  TboxData,
  BatterySwapEvent,
  BatterySession,
  DiagnosticMetrics,
  BatteryFilters
};

export default useBatteryData;
