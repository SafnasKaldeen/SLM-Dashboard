import { generateText } from "ai"
import { groq } from "@ai-sdk/groq";
import { DatabaseTool } from "../tools/database-tool"
import { AnalysisTool } from "../tools/analysis-tool"
import { NotificationTool } from "../tools/notification-tool"
import type { Complaint, AgentResult } from "../types/complaint-types"

export class StationManager {
  name = "Station Manager"
  role = "Station Operations & Capacity Management"
  description = "Manages issues related to station capacity, availability, and local operational concerns."

  private dbTool = new DatabaseTool()
  private analysisTool = new AnalysisTool()
  private notificationTool = new NotificationTool()

  async processComplaint(complaint: Complaint): Promise<AgentResult> {
    console.log(`[StationManager] Processing station complaint: ${complaint.id} - ${complaint.title}`)

    const complaintDetails = await this.dbTool.getComplaintDetails(complaint.id)
    if (!complaintDetails) {
      return {
        result: "Complaint details not found.",
        reasoning: "Could not retrieve complaint from database.",
        confidence: 0.1,
        nextAction: "Escalate to Complaint Manager for manual review.",
      }
    }

    const { text: actionPlan } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `As a station manager, analyze the following complaint regarding station operations: "${complaintDetails.description}".
      Station ID: ${complaintDetails.stationId || "N/A"}.
      Propose an action plan to address the issue (e.g., "Dispatch team to rebalance scooters", "Increase charging capacity", "Monitor usage patterns").`,
    })

    await this.dbTool.updateComplaintStatus(complaint.id, "In Progress")
    await this.notificationTool.notifyAgent(
      "Operations Team",
      `Action required at Station ${complaintDetails.stationId}: ${actionPlan}`,
    )
    await this.notificationTool.sendEmail(
      complaint.customerEmail,
      `Update on your complaint ${complaint.id}`,
      `Dear ${complaint.customerEmail},\n\nYour complaint regarding station operations (${complaint.id}) is being addressed. Our team is taking the following action: ${actionPlan}.`,
    )

    return {
      result: `Station issue action plan initiated: ${actionPlan}`,
      reasoning: `Developed an action plan to address the station capacity/availability issue at ${complaintDetails.stationId}.`,
      confidence: 0.8,
      nextAction: `Execute action plan and monitor station performance.`,
      data: { actionPlan, stationId: complaintDetails.stationId },
      toolUsed: "notification_tool", // Indicate tool used
    }
  }
}
