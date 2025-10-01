import { BaseAgent } from "./base-agent"
import type { Complaint, AgentDecision } from "../types"

export class SupportAgent extends BaseAgent {
  constructor() {
    super("Support Agent", [
      "complaint_classification",
      "basic_troubleshooting",
      "customer_communication",
      "escalation_routing",
    ])
  }

  canHandle(complaint: Complaint): boolean {
    return complaint.status === "Open"
  }

  async processComplaint(complaint: Complaint): Promise<AgentDecision> {
    const analysis = this.analyzeComplaintText(complaint.description)
    const relevantData = this.findRelevantData(complaint)

    // Classify complaint type if not already classified
    const classifiedType = this.classifyComplaintType(complaint)

    // Check for quick solutions in database
    const quickSolution = this.findQuickSolution(complaint)
    if (quickSolution) {
      return this.generateDecision(
        "Provide immediate solution",
        `Found matching solution in database: ${quickSolution.solution}. Success rate: ${Math.round(quickSolution.successRate * 100)}%`,
        "Send solution to customer and monitor for confirmation",
        quickSolution.successRate,
        { solution: quickSolution, customer: relevantData.customer },
      )
    }

    // Determine escalation path
    const escalationTarget = this.determineEscalationTarget(classifiedType, analysis)

    return this.generateDecision(
      `Escalate to ${escalationTarget}`,
      `Complaint classified as ${classifiedType} with ${analysis.urgency} urgency. Keywords: ${analysis.keywords.join(", ")}. Sentiment: ${analysis.sentiment}`,
      `Route complaint to ${escalationTarget} for specialized resolution`,
      0.85,
      {
        classification: classifiedType,
        analysis,
        customer: relevantData.customer,
        escalationTarget,
      },
    )
  }

  private classifyComplaintType(complaint: Complaint): string {
    const text = (complaint.title + " " + complaint.description).toLowerCase()

    const typeKeywords = {
      Scooter: ["scooter", "bike", "vehicle", "motor", "wheel", "brake", "speed", "acceleration", "steering"],
      Battery: ["battery", "charge", "power", "swap", "station", "charging", "energy"],
      Payment: ["payment", "billing", "charge", "refund", "transaction", "money", "credit", "debit"],
    }

    let maxScore = 0
    let classifiedType = complaint.type || "Other"

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      const score = keywords.filter((keyword) => text.includes(keyword)).length
      if (score > maxScore) {
        maxScore = score
        classifiedType = type
      }
    }

    return classifiedType
  }

  private findQuickSolution(complaint: Complaint) {
    return this.database.technicalSolutions.find(
      (solution) =>
        solution.keywords.some((keyword) => complaint.description.toLowerCase().includes(keyword.toLowerCase())) &&
        solution.successRate > 0.8,
    )
  }

  private determineEscalationTarget(type: string, analysis: any): string {
    switch (type) {
      case "Scooter":
        return "Technician"
      case "Battery":
        return analysis.keywords.includes("station") ? "Station Manager" : "Technician"
      case "Payment":
        return "Finance Officer"
      default:
        return "Complaint Manager"
    }
  }
}
