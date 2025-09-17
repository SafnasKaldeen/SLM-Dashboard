import type { WorkflowNode, WorkflowEdge } from "../types/complaint-types"

export const workflowNodes: WorkflowNode[] = [
  { id: "customer_submission", name: "Customer Submission", type: "start", icon: "MessageSquare" },
  { id: "support_agent", name: "Support Agent", type: "agent", icon: "Bot" },
  { id: "technician", name: "Technician", type: "agent", icon: "Wrench" },
  { id: "station_manager", name: "Station Manager", type: "agent", icon: "MapPin" },
  { id: "finance_officer", name: "Finance Officer", type: "agent", icon: "DollarSign" },
  { id: "complaint_manager", name: "Complaint Manager", type: "agent", icon: "Users" },
  { id: "analysis_tool", name: "Analysis Tool", type: "tool", icon: "Search" },
  { id: "database_tool", name: "Database Tool", type: "tool", icon: "Database" },
  { id: "notification_tool", name: "Notification Tool", type: "tool", icon: "Bell" },
  { id: "groq_chat_model", name: "Groq Chat Model", type: "model", icon: "Cpu" }, // Representing Groq
  { id: "simple_memory", name: "Simple Memory", type: "memory", icon: "HardDrive" }, // Generic memory
  { id: "resolution_complete", name: "Resolution Complete", type: "end", icon: "CheckCircle" },
]

export const workflowEdges: WorkflowEdge[] = [
  // Initial flow
  { from: "customer_submission", to: "support_agent", type: "solid" },

  // Support Agent interactions
  { from: "support_agent", to: "analysis_tool", type: "solid" },
  { from: "analysis_tool", to: "support_agent", type: "solid" },
  { from: "support_agent", to: "database_tool", type: "solid" },
  { from: "database_tool", to: "support_agent", type: "solid" },
  { from: "support_agent", to: "notification_tool", type: "solid" },
  { from: "notification_tool", to: "support_agent", type: "solid" },
  { from: "support_agent", to: "groq_chat_model", type: "dashed", label: "Chat Model" },
  { from: "groq_chat_model", to: "support_agent", type: "dashed" },
  { from: "support_agent", to: "simple_memory", type: "dashed", label: "Memory" },
  { from: "simple_memory", to: "support_agent", type: "dashed" },

  // Routing from Support Agent to specialists
  { from: "support_agent", to: "technician", label: "Technical Issue", type: "solid" },
  { from: "support_agent", to: "station_manager", label: "Station Issue", type: "solid" },
  { from: "support_agent", to: "finance_officer", label: "Billing Issue", type: "solid" },
  { from: "support_agent", to: "complaint_manager", label: "Complex/General", type: "solid" },

  // Technician workflow
  { from: "technician", to: "analysis_tool", type: "solid" },
  { from: "analysis_tool", to: "technician", type: "solid" },
  { from: "technician", to: "database_tool", type: "solid" },
  { from: "database_tool", to: "technician", type: "solid" },
  { from: "technician", to: "notification_tool", type: "solid" },
  { from: "notification_tool", to: "technician", type: "solid" },
  { from: "technician", to: "groq_chat_model", type: "dashed" },
  { from: "groq_chat_model", to: "technician", type: "dashed" },
  { from: "technician", to: "simple_memory", type: "dashed" },
  { from: "simple_memory", to: "technician", type: "dashed" },
  { from: "technician", to: "complaint_manager", label: "Escalate", type: "solid" },
  { from: "technician", to: "resolution_complete", label: "Resolved", type: "solid" },

  // Station Manager workflow
  { from: "station_manager", to: "analysis_tool", type: "solid" },
  { from: "analysis_tool", to: "station_manager", type: "solid" },
  { from: "station_manager", to: "database_tool", type: "solid" },
  { from: "database_tool", to: "station_manager", type: "solid" },
  { from: "station_manager", to: "notification_tool", type: "solid" },
  { from: "notification_tool", to: "station_manager", type: "solid" },
  { from: "station_manager", to: "groq_chat_model", type: "dashed" },
  { from: "groq_chat_model", to: "station_manager", type: "dashed" },
  { from: "station_manager", to: "simple_memory", type: "dashed" },
  { from: "simple_memory", to: "station_manager", type: "dashed" },
  { from: "station_manager", to: "complaint_manager", label: "Escalate", type: "solid" },
  { from: "station_manager", to: "resolution_complete", label: "Resolved", type: "solid" },

  // Finance Officer workflow
  { from: "finance_officer", to: "analysis_tool", type: "solid" },
  { from: "analysis_tool", to: "finance_officer", type: "solid" },
  { from: "finance_officer", to: "database_tool", type: "solid" },
  { from: "database_tool", to: "finance_officer", type: "solid" },
  { from: "finance_officer", to: "notification_tool", type: "solid" },
  { from: "notification_tool", to: "finance_officer", type: "solid" },
  { from: "finance_officer", to: "groq_chat_model", type: "dashed" },
  { from: "groq_chat_model", to: "finance_officer", type: "dashed" },
  { from: "finance_officer", to: "simple_memory", type: "dashed" },
  { from: "simple_memory", to: "finance_officer", type: "dashed" },
  { from: "finance_officer", to: "complaint_manager", label: "Escalate", type: "solid" },
  { from: "finance_officer", to: "resolution_complete", label: "Resolved", type: "solid" },

  // Complaint Manager workflow
  { from: "complaint_manager", to: "analysis_tool", type: "solid" },
  { from: "analysis_tool", to: "complaint_manager", type: "solid" },
  { from: "complaint_manager", to: "database_tool", type: "solid" },
  { from: "database_tool", to: "complaint_manager", type: "solid" },
  { from: "complaint_manager", to: "notification_tool", type: "solid" },
  { from: "notification_tool", to: "complaint_manager", type: "solid" },
  { from: "complaint_manager", to: "groq_chat_model", type: "dashed" },
  { from: "groq_chat_model", to: "complaint_manager", type: "dashed" },
  { from: "complaint_manager", to: "simple_memory", type: "dashed" },
  { from: "simple_memory", to: "complaint_manager", type: "dashed" },
  { from: "complaint_manager", to: "resolution_complete", label: "Resolved", type: "solid" },
  { from: "complaint_manager", to: "support_agent", label: "Re-route", type: "solid" }, // Can re-route if needed
]
