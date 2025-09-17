import { generateText } from "ai"
import { groq } from "@ai-sdk/groq";
import { DatabaseTool } from "../tools/database-tool"
import { AnalysisTool } from "../tools/analysis-tool"
import { NotificationTool } from "../tools/notification-tool"
import type { Complaint, AgentResult } from "../types/complaint-types"

export class FinanceOfficer {
  name = "Finance Officer"
  role = "Financial Analysis & Payment Resolution"
  description = "Handles billing disputes, refund requests, and other financial discrepancies."

  private dbTool = new DatabaseTool()
  private analysisTool = new AnalysisTool()
  private notificationTool = new NotificationTool()

  async processComplaint(complaint: Complaint): Promise<AgentResult> {
    console.log(`[FinanceOfficer] Processing billing complaint: ${complaint.id} - ${complaint.title}`)

    const complaintDetails = await this.dbTool.getComplaintDetails(complaint.id)
    if (!complaintDetails) {
      return {
        result: "Complaint details not found.",
        reasoning: "Could not retrieve complaint from database.",
        confidence: 0.1,
        nextAction: "Escalate to Complaint Manager for manual review.",
      }
    }

    const { text: financialAssessment } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `As a finance officer, analyze the following billing complaint: "${complaintDetails.description}".
      Customer Email: ${complaintDetails.customerEmail}.
      Determine the appropriate financial action (e.g., "Issue full refund", "Adjust charge", "Request more information from customer").`,
    })

    let nextAction = "Issue full refund"
    if (financialAssessment.includes("adjust charge")) {
      nextAction = "Adjust charge"
    } else if (financialAssessment.includes("request more information")) {
      nextAction = "Request more information from customer"
    }

    await this.dbTool.updateComplaintStatus(complaint.id, "In Progress")
    await this.notificationTool.sendEmail(
      complaint.customerEmail,
      `Update on your billing complaint ${complaint.id}`,
      `Dear ${complaint.customerEmail},\n\nYour billing complaint (${complaint.id}) has been reviewed. Our assessment: ${financialAssessment}. We will proceed with ${nextAction}.`,
    )

    return {
      result: `Financial assessment complete: ${financialAssessment}`,
      reasoning: `Reviewed billing details and determined the appropriate financial action.`,
      confidence: 0.9,
      nextAction: nextAction,
      data: { financialAssessment, customerEmail: complaintDetails.customerEmail },
      toolUsed: "notification_tool", // Indicate tool used
    }
  }
}
