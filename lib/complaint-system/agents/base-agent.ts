import type { Complaint, AgentDecision, AgentRole } from "../types"
import { mockDatabase } from "../mock-database"

export abstract class BaseAgent {
  protected role: AgentRole
  protected capabilities: string[]
  protected database = mockDatabase

  constructor(role: AgentRole, capabilities: string[]) {
    this.role = role
    this.capabilities = capabilities
  }

  abstract processComplaint(complaint: Complaint): Promise<AgentDecision>
  abstract canHandle(complaint: Complaint): boolean

  protected generateDecision(
    decision: string,
    reasoning: string,
    nextAction: string,
    confidence: number,
    data?: Record<string, any>,
  ): AgentDecision {
    return {
      agentRole: this.role,
      decision,
      reasoning,
      nextAction,
      confidence,
      timestamp: new Date(),
      data,
    }
  }

  protected analyzeComplaintText(text: string): {
    keywords: string[]
    sentiment: "positive" | "neutral" | "negative"
    urgency: "low" | "medium" | "high"
  } {
    const lowerText = text.toLowerCase()

    // Simple keyword extraction
    const keywords = []
    const keywordPatterns = {
      scooter: ["scooter", "bike", "vehicle", "motor", "wheel", "brake"],
      battery: ["battery", "charge", "power", "swap", "station"],
      payment: ["payment", "billing", "charge", "refund", "transaction", "money"],
      urgent: ["urgent", "emergency", "critical", "immediately", "asap"],
    }

    for (const [category, patterns] of Object.entries(keywordPatterns)) {
      if (patterns.some((pattern) => lowerText.includes(pattern))) {
        keywords.push(category)
      }
    }

    // Simple sentiment analysis
    const negativeWords = ["bad", "terrible", "awful", "broken", "failed", "angry", "frustrated"]
    const positiveWords = ["good", "great", "excellent", "satisfied", "happy"]

    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length

    let sentiment: "positive" | "neutral" | "negative" = "neutral"
    if (negativeCount > positiveCount) sentiment = "negative"
    else if (positiveCount > negativeCount) sentiment = "positive"

    // Urgency detection
    const urgentKeywords = ["urgent", "emergency", "critical", "immediately", "stuck", "stranded"]
    const urgency = urgentKeywords.some((word) => lowerText.includes(word)) ? "high" : "medium"

    return { keywords, sentiment, urgency }
  }

  protected findRelevantData(complaint: Complaint): Record<string, any> {
    const relevantData: Record<string, any> = {}

    // Find customer data
    const customer = this.database.customers.find(
      (c) => c.id === complaint.customerId || c.email === complaint.customerEmail,
    )
    if (customer) {
      relevantData.customer = customer
    }

    // Find relevant technical solutions
    const solutions = this.database.technicalSolutions.filter((solution) =>
      solution.keywords.some((keyword) => complaint.description.toLowerCase().includes(keyword.toLowerCase())),
    )
    if (solutions.length > 0) {
      relevantData.solutions = solutions
    }

    return relevantData
  }
}
