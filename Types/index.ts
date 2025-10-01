export interface OptimizedTelemetry {
  CTIME: number;
  MOTORTEMP: number;
  MOTORRPM: number;
  STATE: string;
  INVERTER_ERROR: string;
  BRAKESTATUS: number;
  GEARINFORMATION: number;
  TBOXID: number;
}

export interface ProcessedReading {
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

export interface DiagnosticBatch {
  batchId: number;
  records: OptimizedTelemetry[];
  processed: boolean;
  errors: number;
  timeRange: { start: number; end: number };
}

export interface DiagnosticProgress {
  totalBatches: number;
  processedBatches: number;
  currentBatch: number;
  totalRecords: number;
  processedRecords: number;
  stage: "initializing" | "fetching" | "processing" | "analyzing" | "complete";
  errors: string[];
  currentOperation: string;
}

export interface SignificantEvent {
  id: string;
  type: "thermal_stress" | "rpm_spike" | "state_change" | "error_burst" | "efficiency_drop";
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  data: any;
  recommendations: string[];
}

export interface FactoryDiagnosticReport {
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

export interface MaintenanceRecommendation {
  priority: "immediate" | "urgent" | "scheduled" | "preventive";
  component: string;
  issue: string;
  action: string;
  estimatedCost: string;
  timeframe: string;
}

export interface CriticalMetrics {
  maxTemp: number;
  maxRPM: number;
  totalErrors: number;
  motorOnTime: number;
  thermalStress: number;
  operationalEfficiency: number;
  errorRate: number;
  averageLoad: number;
}

export interface PerformanceAnalysis {
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

export interface PredictiveInsight {
  type: string;
  probability: number;
  timeframe: string;
  description: string;
  preventiveActions: string[];
}