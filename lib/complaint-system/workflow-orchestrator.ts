import { SupportAgent } from "./agents/support-agent"
import { Technician } from "./agents/technician"
import { StationManager } from "./agents/station-manager"
import { FinanceOfficer } from "./agents/finance-officer"
import { ComplaintManager } from "./agents/complaint-manager"
import type { Complaint, AgentDecision, WorkflowStep, AgentRole } from "./types"

export class WorkflowOrchestrator {
  private agents: Map<AgentRole, any>
  private complaintQueue: Complaint[]
  private activeWorkflows: Map<string, WorkflowStep[]>

  constructor() {
    this.agents = new Map([
      ["Support Agent", new SupportAgent()],
      ["Technician", new Technician()],
      ["Station Manager", new StationManager()],
      ["Finance Officer", new FinanceOfficer()],
      ["Complaint Manager", new ComplaintManager()],
    ])
    this.complaintQueue = []
    this.activeWorkflows = new Map()
  }

  async processNewComplaint(complaint: Complaint): Promise<{
    complaint: Complaint
    decision: AgentDecision
    nextSteps: string[]
    workflowSteps: WorkflowStep[]
  }> {
    // Initialize workflow
    const workflowSteps: WorkflowStep[] = []

    // Step 1: Support Agent processes complaint
    const supportAgent = this.agents.get("Support Agent")
    const supportStep: WorkflowStep = {
      id: `step_${Date.now()}_support`,
      agentRole: "Support Agent",
      status: "processing",
      timestamp: new Date(),
    }
    workflowSteps.push(supportStep)

    const supportDecision = await supportAgent.processComplaint(complaint)
    supportStep.decision = supportDecision
    supportStep.status = "completed"

    // Update complaint based on support agent decision
    complaint.assignedAgentRole = this.determineNextAgent(supportDecision)
    complaint.status = "In Progress"
    complaint.updatedAt = new Date()

    // Step 2: Route to appropriate specialist agent
    if (complaint.assignedAgentRole && complaint.assignedAgentRole !== "Support Agent") {
      const specialistAgent = this.agents.get(complaint.assignedAgentRole)
      if (specialistAgent) {
        const specialistStep: WorkflowStep = {
          id: `step_${Date.now()}_specialist`,
          agentRole: complaint.assignedAgentRole,
          status: "processing",
          timestamp: new Date(),
        }
        workflowSteps.push(specialistStep)

        const specialistDecision = await specialistAgent.processComplaint(complaint)
        specialistStep.decision = specialistDecision
        specialistStep.status = "completed"

        // Check if resolution is achieved
        if (specialistDecision.decision.includes("resolve") || specialistDecision.decision.includes("solution")) {
          complaint.status = "Resolved"
          complaint.resolvedAt = new Date()
        }
      }
    }

    // Store workflow
    this.activeWorkflows.set(complaint.id, workflowSteps)

    const nextSteps = this.generateNextSteps(complaint, workflowSteps)

    return {
      complaint,
      decision: supportDecision,
      nextSteps,
      workflowSteps,
    }
  }

  private determineNextAgent(decision: AgentDecision): AgentRole {
    const decisionText = decision.decision.toLowerCase()

    if (decisionText.includes("technician")) return "Technician"
    if (decisionText.includes("station manager")) return "Station Manager"
    if (decisionText.includes("finance officer")) return "Finance Officer"
    if (decisionText.includes("complaint manager")) return "Complaint Manager"

    return "Support Agent"
  }

  private generateNextSteps(complaint: Complaint, workflowSteps: WorkflowStep[]): string[] {
    const steps: string[] = []
    const lastStep = workflowSteps[workflowSteps.length - 1]

    if (complaint.status === "Resolved") {
      steps.push("Send resolution confirmation to customer")
      steps.push("Update complaint database")
      steps.push("Generate satisfaction survey")
    } else {
      steps.push(`Continue processing with ${complaint.assignedAgentRole}`)
      steps.push("Monitor complaint progress")
      if (lastStep?.decision?.confidence && lastStep.decision.confidence < 0.7) {
        steps.push("Consider escalation if no progress in 2 hours")
      }
    }

    return steps
  }

  getWorkflowSteps(complaintId: string): WorkflowStep[] {
    return this.activeWorkflows.get(complaintId) || []
  }

  addComplaintToQueue(complaint: Complaint): void {
    this.complaintQueue.push(complaint)
  }

  getComplaintQueue(): Complaint[] {
    return [...this.complaintQueue]
  }
}
