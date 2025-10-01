export type ComplaintType = "Scooter" | "Battery" | "Payment" | "Other"
export type ComplaintStatus = "Open" | "In Progress" | "Escalated" | "Resolved"
export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical"
export type AgentRole =
  | "Support Agent"
  | "Technician"
  | "Station Manager"
  | "Finance Officer"
  | "Complaint Manager"
  | "Admin"

export interface Complaint {
  id: string
  title: string
  description: string
  type: ComplaintType
  status: ComplaintStatus
  priority: ComplaintPriority
  customerId: string
  customerEmail: string
  assignedAgentRole?: AgentRole
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  escalationHistory: EscalationRecord[]
  communicationLog: CommunicationRecord[]
  metadata?: Record<string, any>
}

export interface AgentDecision {
  agentRole: AgentRole
  decision: string
  reasoning: string
  nextAction: string
  confidence: number
  timestamp: Date
  data?: Record<string, any>
}

export interface EscalationRecord {
  fromAgent: AgentRole
  toAgent: AgentRole
  reason: string
  timestamp: Date
}

export interface CommunicationRecord {
  agentRole: AgentRole
  message: string
  timestamp: Date
  type: "internal" | "customer"
}

export interface ComplaintMetrics {
  totalComplaints: number
  resolvedComplaints: number
  averageResolutionTime: number
  complaintsByType: Record<string, number>
  complaintsByStatus: Record<string, number>
  agentPerformance: Record<AgentRole, { assigned: number; resolved: number; averageTime: number }>
}

export interface WorkflowStep {
  id: string
  agentRole: AgentRole
  status: "pending" | "processing" | "completed" | "failed"
  decision?: AgentDecision
  timestamp: Date
}

export interface AgentDatabase {
  scooterIssues: ScooterIssue[]
  batteryStations: BatteryStation[]
  paymentRecords: PaymentRecord[]
  customers: Customer[]
  technicalSolutions: TechnicalSolution[]
}

export interface ScooterIssue {
  id: string
  type: string
  symptoms: string[]
  solution: string
  severity: "low" | "medium" | "high"
  estimatedRepairTime: number
}

export interface BatteryStation {
  id: string
  location: string
  status: "operational" | "maintenance" | "offline"
  batterySlots: number
  availableBatteries: number
  lastMaintenance: Date
  commonIssues: string[]
}

export interface PaymentRecord {
  id: string
  customerId: string
  amount: number
  status: "completed" | "pending" | "failed" | "refunded"
  transactionDate: Date
  paymentMethod: string
}

export interface Customer {
  id: string
  email: string
  name: string
  subscriptionType: "basic" | "premium" | "enterprise"
  totalRides: number
  lastActivity: Date
  complaints: string[]
}

export interface TechnicalSolution {
  id: string
  problemType: string
  keywords: string[]
  solution: string
  successRate: number
  averageResolutionTime: number
}
