import { generateText } from "ai"
import { groq } from "@ai-sdk/groq";
import { DatabaseTool } from "../tools/database-tool"
import { AnalysisTool } from "../tools/analysis-tool"
import { NotificationTool } from "../tools/notification-tool"
import type { Complaint, AgentResult } from "../types/complaint-types"

export class Technician {
  name = "Technician"
  role = "Technical Diagnosis & Repair"
  description =
    "Handles technical issues related to scooters and charging stations, diagnosing problems and scheduling repairs."

  private dbTool = new DatabaseTool()
  private analysisTool = new AnalysisTool()
  private notificationTool = new NotificationTool()

  async processComplaint(complaint: Complaint): Promise<AgentResult> {
    console.log(`[Technician] Processing technical complaint: ${complaint.id} - ${complaint.title}`)

    const complaintDetails = await this.dbTool.getComplaintDetails(complaint.id)
    if (!complaintDetails) {
      return {
        result: "Complaint details not found.",
        reasoning: "Could not retrieve complaint from database.",
        confidence: 0.1,
        nextAction: "Escalate to Complaint Manager for manual review.",
      }
    }

    const { text: diagnosis } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `As a technician, analyze the following technical complaint about a scooter or station: "${complaintDetails.description}".
      Scooter ID: ${complaintDetails.scooterId || "N/A"}, Station ID: ${complaintDetails.stationId || "N/A"}.
      Provide a brief diagnosis and a recommended next step (e.g., "Schedule on-site inspection", "Order replacement part", "Remote diagnostic check").`,
    })

    let nextAction = "Schedule on-site inspection"
    if (diagnosis.includes("remote diagnostic")) {
      nextAction = "Perform remote diagnostic check"
    } else if (diagnosis.includes("order replacement")) {
      nextAction = "Order replacement part"
    }

    await this.dbTool.updateComplaintStatus(complaint.id, "In Progress")
    await this.notificationTool.sendEmail(
      complaint.customerEmail,
      `Update on your complaint ${complaint.id}`,
      `Dear ${complaint.customerEmail},\n\nYour technical complaint (${complaint.id}) is being reviewed. Initial diagnosis: ${diagnosis}. We will proceed with ${nextAction}.`,
    )

    return {
      result: `Technical diagnosis complete: ${diagnosis}`,
      reasoning: `Performed initial diagnosis based on complaint description and identified ${nextAction} as the next step.`,
      confidence: 0.85,
      nextAction: nextAction,
      data: { diagnosis, scooterId: complaintDetails.scooterId, stationId: complaintDetails.stationId },
      toolUsed: "notification_tool", // Indicate tool used
    }
  }
}
