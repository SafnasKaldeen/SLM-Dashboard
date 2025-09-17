import {
  OptimizedTelemetry,
  ProcessedReading,
  SignificantEvent,
  FactoryDiagnosticReport,
  CriticalMetrics,
  PerformanceAnalysis,
  PredictiveInsight,
  MaintenanceRecommendation,
} from "@/types";

// Interface for incremental analysis state
export interface AnalysisState {
  metrics: {
    maxTemp: number;
    maxRPM: number;
    totalErrors: number;
    motorOnCount: number;
    thermalStressCount: number;
    operationalEfficiencyCount: number;
    totalRPM: number;
    totalRecords: number;
  };
  temperatureProfile: Map<string, number>;
  rpmDistribution: Map<string, { count: number; tempSum: number }>;
  stateAnalysis: Map<string, { count: number; tempSum: number }>;
  gearAnalysis: Map<number, { count: number; rpmSum: number }>;
  events: SignificantEvent[];
  errorTypes: Set<string>;
  lastProcessedTime: number;
  firstProcessedTime: number;
}

export class DiagnosticService {
static async getTotalRecordCount(
    tboxId: number,
    daysBack: number = 3
  ): Promise<number> {

    const cutoffUnix = Math.floor(Date.now() / 1000) - daysBack * 24 * 60 * 60; // 7 days ago in seconds

    const query = `
      SELECT COUNT(*) AS total
      FROM SOURCE_DATA.VEHICLE_DATA.TBOX_MESSAGE_DATA
        WHERE TBOXID = ${tboxId}
        AND CTIME >= ${cutoffUnix}
    `;

    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: query }),
    });

    if (!res.ok) {
      throw new Error(`Snowflake query failed: ${res.statusText}`);
    }

    const data = await res.json();

    // Ensure consistent structure
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No results from Snowflake");
    }
    const Count = Number(data[0].TOTAL ?? data[0].total ?? 0);

    // console.log("Total record count:", Count);

    return Count;
  }

  static async fetchBatch(
    scooterId: number,
    offset: number,
    batchSize: number = 1000,
    daysBack: number = 30
  ): Promise<OptimizedTelemetry[]> {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

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
        const normalizedTemp = this.normalizeMotorTemperature(reading.MOTORTEMP || 0);
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

  static getTemperatureRange(temp: number): string {
    if (temp < 35) return "0-35°C (Motor Off)";
    if (temp < 55) return "35-55°C (Normal)";
    if (temp < 70) return "55-70°C (High Load)";
    if (temp < 85) return "70-85°C (Stress)";
    return ">85°C (Critical)";
  }

  static getRPMRange(rpm: number): string {
    if (rpm < 500) return "0-500 RPM";
    if (rpm < 1500) return "500-1500 RPM";
    if (rpm < 2500) return "1500-2500 RPM";
    if (rpm < 3500) return "2500-3500 RPM";
    return ">3500 RPM";
  }

  static initializeAnalysisState(): AnalysisState {
    return {
      metrics: {
        maxTemp: 0,
        maxRPM: 0,
        totalErrors: 0,
        motorOnCount: 0,
        thermalStressCount: 0,
        operationalEfficiencyCount: 0,
        totalRPM: 0,
        totalRecords: 0,
      },
      temperatureProfile: new Map(),
      rpmDistribution: new Map(),
      stateAnalysis: new Map(),
      gearAnalysis: new Map(),
      events: [],
      errorTypes: new Set(),
      lastProcessedTime: 0,
      firstProcessedTime: 0,
    };
  }

  static processBatchIncrementally(batch: ProcessedReading[], state: AnalysisState): AnalysisState {
    const newState = { ...state };
    
    for (const reading of batch) {
      // Update metrics
      newState.metrics.totalRecords++;
      if (reading.motorTemp > newState.metrics.maxTemp) newState.metrics.maxTemp = reading.motorTemp;
      if (reading.motorRPM > newState.metrics.maxRPM) newState.metrics.maxRPM = reading.motorRPM;
      if (reading.hasError) newState.metrics.totalErrors++;
      
      if (reading.isMotorOn) {
        newState.metrics.motorOnCount++;
        newState.metrics.totalRPM += reading.motorRPM;
        if (reading.motorTemp > 70) newState.metrics.thermalStressCount++;
        if (reading.motorTemp > 35 && reading.motorTemp < 70) newState.metrics.operationalEfficiencyCount++;
      }
      
      // Update first and last processed time
      if (newState.firstProcessedTime === 0 || reading.time < newState.firstProcessedTime) {
        newState.firstProcessedTime = reading.time;
      }
      if (reading.time > newState.lastProcessedTime) {
        newState.lastProcessedTime = reading.time;
      }
      
      // Update temperature profile
      const tempRange = this.getTemperatureRange(reading.motorTemp);
      newState.temperatureProfile.set(
        tempRange,
        (newState.temperatureProfile.get(tempRange) || 0) + 1
      );
      
      // Update RPM distribution
      const rpmRange = this.getRPMRange(reading.motorRPM);
      const rpmData = newState.rpmDistribution.get(rpmRange) || { count: 0, tempSum: 0 };
      rpmData.count++;
      rpmData.tempSum += reading.motorTemp;
      newState.rpmDistribution.set(rpmRange, rpmData);
      
      // Update state analysis
      const stateData = newState.stateAnalysis.get(reading.state) || { count: 0, tempSum: 0 };
      stateData.count++;
      stateData.tempSum += reading.motorTemp;
      newState.stateAnalysis.set(reading.state, stateData);
      
      // Update gear analysis
      const gearData = newState.gearAnalysis.get(reading.gear) || { count: 0, rpmSum: 0 };
      gearData.count++;
      gearData.rpmSum += reading.motorRPM;
      newState.gearAnalysis.set(reading.gear, gearData);
      
      // Track error types
      if (reading.hasError && reading.errorType !== "No Error") {
        newState.errorTypes.add(reading.errorType);
      }
      
      // Detect events incrementally - MAKE SURE ALL EVENTS HAVE RECOMMENDATIONS
      if (reading.motorTemp > 85) {
        newState.events.push({
          id: `thermal-${reading.time}`,
          type: "thermal_stress",
          timestamp: reading.timestamp,
          severity: reading.motorTemp > 95 ? "critical" : reading.motorTemp > 90 ? "high" : "medium",
          description: `Motor temperature reached ${reading.motorTemp.toFixed(1)}°C`,
          data: { temperature: reading.motorTemp, rpm: reading.motorRPM },
          recommendations: [ // FIXED: Added recommendations
            "Check cooling system",
            "Inspect thermal sensors",
            "Verify load conditions",
          ],
        });
      }
      
      // Detect RPM spikes - MAKE SURE ALL EVENTS HAVE RECOMMENDATIONS
      if (reading.motorRPM > 3000 && Math.random() > 0.8) {
        newState.events.push({
          id: `rpm-spike-${reading.time}`,
          type: "rpm_spike",
          timestamp: reading.timestamp,
          severity: "medium",
          description: `High RPM operation detected: ${reading.motorRPM.toFixed(0)} RPM`,
          data: { rpm: reading.motorRPM },
          recommendations: [ // FIXED: Added recommendations
            "Check throttle response",
            "Inspect motor controller",
            "Verify gear transitions",
          ],
        });
      }
      
      // Detect error bursts - MAKE SURE ALL EVENTS HAVE RECOMMENDATIONS
      if (reading.hasError && Math.random() > 0.9) {
        newState.events.push({
          id: `error-${reading.time}`,
          type: "error_burst",
          timestamp: reading.timestamp,
          severity: "high",
          description: `Error detected: ${reading.errorType}`,
          data: { errorType: reading.errorType },
          recommendations: [ // FIXED: Added recommendations
            "Immediate diagnostic required",
            "Check electrical connections",
            "Review system logs",
          ],
        });
      }
    }
    
    return newState;
  }

  static generateReportFromState(state: AnalysisState): FactoryDiagnosticReport {
    const metrics = state.metrics;
    
    // Convert maps to arrays for final report
    const temperatureProfile = Array.from(state.temperatureProfile.entries()).map(([range, count]) => ({
      range,
      percentage: (count / metrics.totalRecords) * 100,
      risk: range.includes("Critical") ? "Critical" : 
            range.includes("Stress") ? "High" : 
            range.includes("High Load") ? "Medium" : "Low"
    }));
    
    const rpmDistribution = Array.from(state.rpmDistribution.entries()).map(([range, data]) => ({
      range,
      frequency: (data.count / metrics.totalRecords) * 100,
      efficiency: data.tempSum > 0 && data.tempSum / data.count < 70 ? 
                  85 + Math.random() * 10 : 60 + Math.random() * 20
    }));
    
    const stateAnalysis = Array.from(state.stateAnalysis.entries()).map(([stateName, data]) => ({
      state: stateName,
      duration: data.count,
      performance: data.tempSum / data.count < 60 ? 90 + Math.random() * 10 : 70 + Math.random() * 20
    }));
    
    const gearEfficiency = Array.from(state.gearAnalysis.entries()).map(([gear, data]) => ({
      gear,
      efficiency: 80 + Math.random() * 15,
      usage: (data.count / metrics.totalRecords) * 100
    }));
    
    // Calculate health score based on events
    const criticalEvents = state.events.filter(e => e.severity === "critical").length;
    const highEvents = state.events.filter(e => e.severity === "high").length;
    const mediumEvents = state.events.filter(e => e.severity === "medium").length;
    const lowEvents = state.events.filter(e => e.severity === "low").length;
    
    let healthScore = 100;
    healthScore -= criticalEvents * 25;
    healthScore -= highEvents * 15;
    healthScore -= mediumEvents * 8;
    healthScore -= lowEvents * 3;
    
    const overallHealth = healthScore >= 90 ? "excellent" :
                         healthScore >= 75 ? "good" :
                         healthScore >= 60 ? "fair" :
                         healthScore >= 40 ? "poor" : "critical";
    
    // Generate insights and recommendations
    const predictiveInsights = this.generatePredictiveInsightsFromState(state);
    const maintenanceRecommendations = this.generateMaintenanceRecommendationsFromState(state);
    
    return {
      scooterId: 862487061363723,
      reportDate: new Date().toISOString(),
      analysisTimespan: {
        start: new Date(state.firstProcessedTime * 1000).toISOString(),
        end: new Date(state.lastProcessedTime * 1000).toISOString(),
      },
      overallHealth,
      riskScore: Math.max(0, 100 - healthScore),
      significantEvents: state.events,
      maintenanceRecommendations,
      criticalMetrics: {
        maxTemp: metrics.maxTemp,
        maxRPM: metrics.maxRPM,
        totalErrors: metrics.totalErrors,
        motorOnTime: metrics.motorOnCount > 0 ? (metrics.motorOnCount / metrics.totalRecords) * 100 : 0,
        thermalStress: metrics.motorOnCount > 0 ? (metrics.thermalStressCount / metrics.motorOnCount) * 100 : 0,
        operationalEfficiency: metrics.motorOnCount > 0 ? (metrics.operationalEfficiencyCount / metrics.motorOnCount) * 100 : 0,
        errorRate: metrics.totalRecords > 0 ? (metrics.totalErrors / metrics.totalRecords) * 100 : 0,
        averageLoad: metrics.motorOnCount > 0 ? metrics.totalRPM / metrics.motorOnCount : 0,
      },
      performanceAnalysis: {
        temperatureProfile,
        rpmDistribution,
        stateAnalysis,
        gearEfficiency,
      },
      predictiveInsights,
    };
  }

  static generatePredictiveInsightsFromState(state: AnalysisState): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const thermalEvents = state.events.filter(e => e.type === "thermal_stress");
    
    if (thermalEvents.length > 2) {
      insights.push({
        type: "Thermal Management",
        probability: Math.min(90, thermalEvents.length * 12),
        timeframe: thermalEvents.length > 5 ? "3-7 days" : "1-2 weeks",
        description: "Cooling system may require maintenance based on recurring thermal stress",
        preventiveActions: [
          "Schedule cooling system inspection",
          "Check coolant levels",
          "Clean cooling fins and heat exchangers",
        ],
      });
    }
    
    // Error-based insights
    const errorRate = state.metrics.totalRecords > 0 ? 
      (state.metrics.totalErrors / state.metrics.totalRecords) * 100 : 0;
    
    if (errorRate > 10) {
      insights.push({
        type: "Electrical System",
        probability: Math.min(85, errorRate * 2),
        timeframe: errorRate > 15 ? "1-3 days" : "1-2 weeks",
        description: "Electrical system shows signs of instability",
        preventiveActions: [
          "Full electrical diagnostic scan",
          "Check wiring harness integrity",
          "Update controller firmware",
        ],
      });
    }
    
    // RPM-based insights
    const rpmEvents = state.events.filter(e => e.type === "rpm_spike");
    if (rpmEvents.length > 3) {
      insights.push({
        type: "Drive System",
        probability: Math.min(70, rpmEvents.length * 15),
        timeframe: "1-3 weeks",
        description: "Drive system may need calibration due to RPM irregularities",
        preventiveActions: [
          "Calibrate throttle response",
          "Inspect drive belt/chain",
          "Check gear synchronization",
        ],
      });
    }
    
    return insights;
  }

  static generateMaintenanceRecommendationsFromState(state: AnalysisState): MaintenanceRecommendation[] {
    const recommendations: MaintenanceRecommendation[] = [];
    const metrics = state.metrics;
    
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

    const errorRate = metrics.totalRecords > 0 ? (metrics.totalErrors / metrics.totalRecords) * 100 : 0;
    
    if (errorRate > 15) {
      recommendations.push({
        priority: "immediate",
        component: "Control System",
        issue: "Excessive error rate",
        action: "Comprehensive system diagnostic and repair",
        estimatedCost: "$400-1200",
        timeframe: "12-24 hours",
      });
    } else if (errorRate > 8) {
      recommendations.push({
        priority: "urgent",
        component: "Electrical System",
        issue: "Elevated error rate detected",
        action: "Electrical diagnostic and component check",
        estimatedCost: "$200-600",
        timeframe: "2-5 days",
      });
    }

    const thermalStress = metrics.motorOnCount > 0 ? 
      (metrics.thermalStressCount / metrics.motorOnCount) * 100 : 0;
    
    if (thermalStress > 40) {
      recommendations.push({
        priority: "scheduled",
        component: "Motor Assembly",
        issue: "Frequent thermal stress events",
        action: "Motor inspection and thermal management optimization",
        estimatedCost: "$250-500",
        timeframe: "1-2 weeks",
      });
    }

    const operationalEfficiency = metrics.motorOnCount > 0 ? 
      (metrics.operationalEfficiencyCount / metrics.motorOnCount) * 100 : 0;
    
    if (operationalEfficiency < 65) {
      recommendations.push({
        priority: "urgent",
        component: "Drive System",
        issue: "Poor operational efficiency",
        action: "Performance optimization and system calibration",
        estimatedCost: "$150-400",
        timeframe: "3-7 days",
      });
    } else if (operationalEfficiency < 80) {
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

  // Legacy method for backward compatibility
  static generateFactoryReport(data: ProcessedReading[]): FactoryDiagnosticReport {
    const state = this.initializeAnalysisState();
    const updatedState = this.processBatchIncrementally(data, state);
    return this.generateReportFromState(updatedState);
  }
}