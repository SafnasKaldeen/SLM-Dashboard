export type ComplaintCategory = "technical" | "billing" | "service" | "general"
export type ComplaintPriority = "low" | "medium" | "high" | "critical"
export type ComplaintStatus = "Open" | "In Progress" | "Escalated" | "Resolved" | "Closed"

export interface Complaint {
  id: string
  customerId: string
  customerEmail: string
  title: string
  description: string
  type: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  createdAt: Date
  updatedAt: Date
  scooterId?: string
  stationId?: string
  assignedAgent?: string
  resolutionSummary?: string
}

export interface AgentResult {
  result: string
  reasoning: string
  confidence: number
  nextAction: string
  recommendations?: string[]
  data?: Record<string, any>
  toolUsed?: string // Added to track which tool was used by the agent
}

// In complaint-form.tsx (or .ts)

export type ComplaintFormInput = {
  title: string;
  description: string;
  type: ComplaintCategory;
  priority: ComplaintPriority;
  // add other fields user fills in the form here
};


export interface WorkflowStep {
  id: string
  agent: string
  action: string
  timestamp: Date
  status: "processing" | "completed" | "failed"
  result?: AgentResult
  duration?: number
  toolUsed?: string // Added to track tool usage within a step
}

export interface WorkflowNode {
  id: string
  name: string
  type: "start" | "agent" | "tool" | "model" | "memory" | "end"
  icon: string // Lucide React icon name
}

export interface WorkflowEdge {
  from: string
  to: string
  label?: string
  type?: "solid" | "dashed" // Added for different line styles
}
