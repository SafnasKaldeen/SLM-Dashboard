import { BaseAgent } from "./base-agent"
import type { Complaint, AgentDecision } from "../types"

export class ComplaintManager extends BaseAgent {
  constructor() {
    super("Complaint Manager", [
      "workflow_oversight",
      "escalation_management",
      "performance_monitoring",
      "resource_allocation",
    ])
  }

  canHandle(complaint: Complaint): boolean {
    return complaint.status === "Escalated" || complaint.priority === "Critical"
  }

  async processComplaint(complaint: Complaint): Promise<AgentDecision> {
    const analysis = this.analyzeComplaintText(complaint.description)
    const relevantData = this.findRelevantData(complaint)

    // Assess complaint complexity and resource requirements
    const complexityAssessment = this.assessComplaintComplexity(complaint)

    if (complexityAssessment.requiresMultipleAgents) {
      return this.generateDecision(
        "Coordinate multi-agent resolution",
        `Complex complaint requiring coordination between multiple agents. Complexity score: ${complexityAssessment.score}`,
        "Assign complaint to multiple specialized agents and coordinate resolution efforts",
        0.85,
        {
          complexity: complexityAssessment,
          requiredAgents: complexityAssessment.requiredAgents,
          customer: relevantData.customer,
        },
      )
    }

    if (complexityAssessment.requiresEscalation) {
      return this.generateDecision(
        "Escalate to Admin",
        `High-priority complaint requiring administrative intervention. Customer: ${complaint.customerEmail}`,
        "Escalate to Admin for immediate attention and resource allocation",
        0.9,
        {
          escalationReason: "Administrative intervention required",
          priority: complaint.priority,
          customer: relevantData.customer,
        },
      )
    }

    return this.generateDecision(
      "Reassign to appropriate agent",
      `Complaint can be resolved by specialized agent. Recommended agent based on analysis: ${this.recommendAgent(complaint)}`,
      `Reassign to ${this.recommendAgent(complaint)} with priority handling`,
      0.8,
      {
        recommendedAgent: this.recommendAgent(complaint),
        priorityHandling: true,
      },
    )
  }

  private assessComplaintComplexity(complaint: Complaint) {
    let score = 0
    const requiredAgents = []

    // Check if multiple domains are involved
    const text = complaint.description.toLowerCase()
    if (text.includes("scooter") || text.includes("motor")) {
      score += 1
      requiredAgents.push("Technician")
    }
    if (text.includes("station") || text.includes("swap")) {
      score += 1
      requiredAgents.push("Station Manager")
    }
    if (text.includes("payment") || text.includes("billing")) {
      score += 1
      requiredAgents.push("Finance Officer")
    }

    // Check priority and escalation history
    if (complaint.priority === "Critical") score += 2
    if (complaint.escalationHistory.length > 0) score += 1

    return {
      score,
      requiresMultipleAgents: requiredAgents.length > 1,
      requiresEscalation: score > 3 || complaint.priority === "Critical",
      requiredAgents,
    }
  }

  private recommendAgent(complaint: Complaint): string {
    const text = complaint.description.toLowerCase()

    if (text.includes("payment") || text.includes("billing")) return "Finance Officer"
    if (text.includes("station")) return "Station Manager"
    if (text.includes("scooter") || text.includes("technical")) return "Technician"

    return "Support Agent"
  }
}
