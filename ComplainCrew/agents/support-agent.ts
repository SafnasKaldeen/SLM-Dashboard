import { generateText } from "ai"
import { groq } from "@ai-sdk/groq";
import { DatabaseTool } from "../tools/database-tool"
import { AnalysisTool } from "../tools/analysis-tool"
import { NotificationTool } from "../tools/notification-tool"
import type { Complaint, AgentResult } from "../types/complaint-types"

export class SupportAgent {
  name = "Support Agent"
  role = "Initial Complaint Triage"
  description =
    "First point of contact for all complaints. Classifies, gathers initial information, and routes to the appropriate specialist."

  private dbTool = new DatabaseTool()
  private analysisTool = new AnalysisTool()
  private notificationTool = new NotificationTool()

  async processComplaint(complaint: Complaint): Promise<AgentResult> {
    console.log(`[SupportAgent] Processing complaint: ${complaint.id} - ${complaint.title}`)

    // Use Analysis Tool for initial sentiment and keywords
    const { sentiment, keywords } = await this.analysisTool.analyzeComplaintText(complaint.description)

    // Use Database Tool to get any existing details (though for new complaints, it might be empty)
    const existingComplaint = await this.dbTool.getComplaintDetails(complaint.id)

    // Use AI to determine the best routing
    const { text: routingDecision } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `A customer submitted a complaint: "${complaint.title} - ${complaint.description}".
      Category: ${complaint.type}, Priority: ${complaint.priority}.
      Initial sentiment: ${sentiment}, Keywords: ${keywords.join(", ")}.
      Based on this, recommend the most suitable agent for further processing. Choose from: Technician, Finance Officer, Station Manager, Complaint Manager.
      Provide only the agent name.`,
    })

    let recommendedAgent: string
    if (routingDecision.includes("Technician")) {
      recommendedAgent = "Technician"
    } else if (routingDecision.includes("Finance Officer")) {
      recommendedAgent = "Finance Officer"
    } else if (routingDecision.includes("Station Manager")) {
      recommendedAgent = "Station Manager"
    } else {
      recommendedAgent = "Complaint Manager" // Default for general or complex cases
    }

    // Update complaint status in DB
    await this.dbTool.updateComplaintStatus(complaint.id, "In Progress")
    await this.notificationTool.notifyAgent(recommendedAgent, `New complaint ${complaint.id} routed to you.`)

    return {
      result: `Complaint triaged and routed to ${recommendedAgent}.`,
      reasoning: `Based on the complaint category (${complaint.type}), priority (${complaint.priority}), and text analysis (sentiment: ${sentiment}, keywords: ${keywords.join(", ")}), the complaint was routed to the ${recommendedAgent}.`,
      confidence: 0.9,
      nextAction: `Forward to ${recommendedAgent} for specialized handling.`,
      data: { recommendedAgent, sentiment, keywords },
      toolUsed: "analysis_tool", // Indicate tool used
    }
  }
}
