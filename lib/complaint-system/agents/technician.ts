import { BaseAgent } from "./base-agent"
import type { Complaint, AgentDecision } from "../types"

export class Technician extends BaseAgent {
  constructor() {
    super("Technician", ["hardware_diagnosis", "mechanical_repair", "battery_analysis", "technical_troubleshooting"])
  }

  canHandle(complaint: Complaint): boolean {
    return ["Scooter", "Battery"].includes(complaint.type) && ["In Progress", "Escalated"].includes(complaint.status)
  }

  async processComplaint(complaint: Complaint): Promise<AgentDecision> {
    const analysis = this.analyzeComplaintText(complaint.description)
    const relevantData = this.findRelevantData(complaint)

    // Find matching scooter issues in database
    const matchingIssue = this.findMatchingScooterIssue(complaint)

    if (matchingIssue) {
      return this.generateDecision(
        "Apply technical solution",
        `Identified issue: ${matchingIssue.type}. Symptoms match: ${matchingIssue.symptoms.join(", ")}. Severity: ${matchingIssue.severity}`,
        `Implement solution: ${matchingIssue.solution}. Estimated repair time: ${matchingIssue.estimatedRepairTime} minutes`,
        0.9,
        {
          issue: matchingIssue,
          customer: relevantData.customer,
          estimatedTime: matchingIssue.estimatedRepairTime,
        },
      )
    }

    // Check if requires physical inspection
    if (this.requiresPhysicalInspection(complaint)) {
      return this.generateDecision(
        "Schedule physical inspection",
        `Technical analysis indicates hardware issue requiring on-site inspection. Urgency: ${analysis.urgency}`,
        "Dispatch field technician for physical inspection and repair",
        0.8,
        { inspectionRequired: true, urgency: analysis.urgency },
      )
    }

    return this.generateDecision(
      "Escalate to Complaint Manager",
      "Complex technical issue requiring specialized resources or further investigation",
      "Route to Complaint Manager for resource allocation and advanced troubleshooting",
      0.7,
      { requiresEscalation: true, complexity: "high" },
    )
  }

  private findMatchingScooterIssue(complaint: Complaint) {
    const text = complaint.description.toLowerCase()

    return this.database.scooterIssues.find((issue) =>
      issue.symptoms.some((symptom) => text.includes(symptom.toLowerCase())),
    )
  }

  private requiresPhysicalInspection(complaint: Complaint): boolean {
    const physicalKeywords = ["brake", "wheel", "motor", "noise", "vibration", "loose", "broken"]
    const text = complaint.description.toLowerCase()

    return physicalKeywords.some((keyword) => text.includes(keyword))
  }
}
