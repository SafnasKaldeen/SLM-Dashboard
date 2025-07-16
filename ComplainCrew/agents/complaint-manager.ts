import { generateText } from "ai"
import { groq } from "@ai-sdk/groq";
import { DatabaseTool } from "../tools/database-tool"
import { AnalysisTool } from "../tools/analysis-tool"
import { NotificationTool } from "../tools/notification-tool"
import type { Complaint, AgentResult } from "../types/complaint-types"

export class ComplaintManager {
  name = "Complaint Manager"
  role = "Complex Case Management & Oversight"
  description =
    "Oversees high-priority, complex, or escalated complaints, ensuring cross-functional coordination and satisfactory resolution."

  private dbTool = new DatabaseTool()
  private analysisTool = new AnalysisTool()
  private notificationTool = new NotificationTool()

  async processComplaint(complaint: Complaint): Promise<AgentResult> {
    console.log(`[ComplaintManager] Processing complex complaint: ${complaint.id} - ${complaint.title}`)

    const complaintDetails = await this.dbTool.getComplaintDetails(complaint.id)
    if (!complaintDetails) {
      return {
        result: "Complaint details not found.",
        reasoning: "Could not retrieve complaint from database.",
        confidence: 0.1,
        nextAction: "Manual intervention required.",
      }
    }

    const { text: managementStrategy } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `As a complaint manager, review the following complaint and its current status: "${complaintDetails.description}".
      Current Status: ${complaintDetails.status}, Priority: ${complaintDetails.priority}.
      Propose a comprehensive strategy to resolve this, considering potential escalations or cross-departmental coordination.`,
    })

    await this.dbTool.updateComplaintStatus(complaint.id, "Escalated")
    await this.notificationTool.notifyAgent(
      "All relevant agents",
      `Complaint ${complaint.id} escalated. Management strategy: ${managementStrategy}`,
    )
    await this.notificationTool.sendEmail(
      complaint.customerEmail,
      `Important Update on your complaint ${complaint.id}`,
      `Dear ${complaint.customerEmail},\n\nYour complaint (${complaint.id}) has been escalated to our Complaint Management team. We are implementing the following strategy to ensure a swift resolution: ${managementStrategy}.`,
    )

    // Simulate final resolution if confidence is high
    const finalResolutionText = `Complaint ${complaint.id} successfully managed. Final strategy: ${managementStrategy}.`
    await this.dbTool.addResolutionSummary(complaint.id, finalResolutionText)
    await this.dbTool.updateComplaintStatus(complaint.id, "Resolved")

    return {
      result: `Complaint management strategy implemented: ${managementStrategy}`,
      reasoning: `Developed and initiated a comprehensive strategy for this high-priority/complex complaint, involving cross-functional coordination.`,
      confidence: 0.95,
      nextAction: "Monitor resolution progress and ensure customer satisfaction.",
      data: { managementStrategy },
      toolUsed: "database_tool", // Indicate tool used
    }
  }
}
