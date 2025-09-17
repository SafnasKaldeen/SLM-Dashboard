import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import type { Complaint } from "../types/complaint-types"

export class GroqService {
  private model = groq("llama3-8b-8192") // Using a specific Groq model

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set. GroqService will not function correctly.")
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
      })
      return text
    } catch (error) {
      console.error("Error generating text with Groq:", error)
      throw new Error("Failed to generate text with Groq.")
    }
  }

  async generateAgentResponse(
    agentRole: string,
    complaintData: Complaint,
    context: any,
  ): Promise<{
    result: string
    reasoning: string
    nextAction: string
    confidence: number
    recommendations: string[]
  }> {
    const systemPrompt = `
You are a ${agentRole} in an AI-powered complaint resolution system.
Your role is to provide expert analysis and recommendations within your domain.

Agent Capabilities:
- Support Agent: Initial triage, customer communication, basic troubleshooting
- Technician: Hardware diagnosis, repair planning, technical solutions
- Station Manager: Station operations, capacity management, maintenance coordination
- Finance Officer: Payment processing, billing disputes, refund management
- Complaint Manager: Complex case management, escalation handling, team coordination

Your response should be concise and actionable.
    `

    const prompt = `
Process this complaint as a ${agentRole}:

Complaint Details:
- ID: ${complaintData.id}
- Title: ${complaintData.title}
- Description: ${complaintData.description}
- Type: ${complaintData.type}
- Priority: ${complaintData.priority}
- Customer Email: ${complaintData.customerEmail}
${complaintData.scooterId ? `- Scooter ID: ${complaintData.scooterId}` : ""}
${complaintData.stationId ? `- Station ID: ${complaintData.stationId}` : ""}

Additional Context from Tools/Previous Agents:
${JSON.stringify(context, null, 2)}

Based on the above, provide your analysis and decision.
Format your response as JSON with keys:
- result: Your main finding/conclusion (e.g., "Identified root cause", "Refund approved")
- reasoning: Your thought process and analysis (e.g., "Database search confirmed...", "Analysis tool categorized as...")
- nextAction: Recommended next step in the workflow (e.g., "Route to Technician", "Process refund")
- confidence: Your confidence level (0.0-1.0)
- recommendations: An array of specific, actionable recommendations (e.g., ["Send customer email", "Schedule maintenance"])
    `

    const response = await this.generateResponse(prompt)

    try {
      const analysis = JSON.parse(response)
      return {
        result: analysis.result || "Analysis completed",
        reasoning: analysis.reasoning || "No reasoning provided",
        nextAction: analysis.nextAction || "Continue standard process",
        confidence: analysis.confidence || 0.7,
        recommendations: analysis.recommendations || ["Follow standard procedures"],
      }
    } catch {
      // Fallback if JSON parsing fails
      return {
        result: response,
        reasoning: "Generated response without structured reasoning",
        nextAction: "Continue standard process",
        confidence: 0.7,
        recommendations: ["Follow standard procedures"],
      }
    }
  }
}
