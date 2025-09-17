import { SupportAgent } from "../agents/support-agent"
import { Technician } from "../agents/technician"
import { StationManager } from "../agents/station-manager"
import { FinanceOfficer } from "../agents/finance-officer"
import { ComplaintManager } from "../agents/complaint-manager"
import type { Complaint, WorkflowStep, AgentResult } from "../types/complaint-types"

export class ComplaintCrew {
  private supportAgent = new SupportAgent()
  private technician = new Technician()
  private stationManager = new StationManager()
  private financeOfficer = new FinanceOfficer()
  private complaintManager = new ComplaintManager()

  private workflow: WorkflowStep[] = []

  async processComplaint(complaint: Complaint): Promise<{
    workflow: WorkflowStep[]
    finalResult: AgentResult
    resolution: string
  }> {
    this.workflow = []

    try {
      // Step 1: Customer Submission (conceptual start node)
      this.workflow.push({
        id: "customer_submission_start",
        agent: "customer_submission",
        action: "Complaint submitted by customer",
        timestamp: new Date(),
        status: "completed",
        duration: 0, // Instantaneous
      })

      // Step 2: Support Agent - Initial triage
      const supportResult = await this.executeStep("support_agent", "Initial complaint triage and classification", () =>
        this.supportAgent.processComplaint(complaint),
      )

      // Step 3: Route to appropriate specialist based on support agent's recommendation
      let specialistResult: AgentResult
      const recommendedAgent = supportResult.data?.recommendedAgent

      if (recommendedAgent === "Technician") {
        specialistResult = await this.executeStep("technician", "Technical diagnosis and repair planning", () =>
          this.technician.processComplaint(complaint),
        )
      } else if (recommendedAgent === "Finance Officer") {
        specialistResult = await this.executeStep("finance_officer", "Financial analysis and payment resolution", () =>
          this.financeOfficer.processComplaint(complaint),
        )
      } else if (recommendedAgent === "Station Manager") {
        specialistResult = await this.executeStep("station_manager", "Station operations and capacity management", () =>
          this.stationManager.processComplaint(complaint),
        )
      } else {
        // Default to complaint manager for complex cases
        specialistResult = await this.executeStep("complaint_manager", "Complex case management and coordination", () =>
          this.complaintManager.processComplaint(complaint),
        )
      }

      // Step 4: Complaint Manager oversight for high-priority cases or if specialist confidence is low
      let finalResult = specialistResult
      if (complaint.priority === "critical" || complaint.priority === "high" || specialistResult.confidence < 0.7) {
        finalResult = await this.executeStep(
          "complaint_manager",
          "Management oversight and resolution coordination",
          () => this.complaintManager.processComplaint(complaint),
        )
      }

      // Step 5: Resolution Complete (conceptual end node)
      this.workflow.push({
        id: "resolution_complete_end",
        agent: "resolution_complete",
        action: "Complaint resolution finalized",
        timestamp: new Date(),
        status: "completed",
        duration: 0, // Instantaneous
      })

      // Generate final resolution summary
      const resolution = this.generateResolutionSummary(complaint, this.workflow)

      return {
        workflow: this.workflow,
        finalResult,
        resolution,
      }
    } catch (error) {
      // Error handling step
      const errorResult: AgentResult = {
        result: "Workflow execution failed",
        reasoning: `Error in complaint processing: ${error}`,
        confidence: 0.1,
        nextAction: "Manual intervention required",
      }

      await this.executeStep("error_handler", "Error recovery and manual escalation", () =>
        Promise.resolve(errorResult),
      )

      return {
        workflow: this.workflow,
        finalResult: errorResult,
        resolution: "Complaint requires manual review due to system error.",
      }
    }
  }

  private async executeStep(
    agent: string,
    action: string,
    execution: () => Promise<AgentResult>,
  ): Promise<AgentResult> {
    const stepId = `${agent}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    // Add pending step
    const step: WorkflowStep = {
      id: stepId,
      agent,
      action,
      timestamp: new Date(),
      status: "processing",
    }
    this.workflow.push(step)

    try {
      // Execute the agent's processing
      const result = await execution()

      // Update step with results
      const duration = Date.now() - startTime
      step.status = "completed"
      step.result = result
      step.duration = duration
      step.toolUsed = result.toolUsed // Capture tool used

      console.log(`[${agent.toUpperCase()}] ${action} - Completed in ${duration}ms`)
      console.log(`Result: ${result.result}`)
      console.log(`Confidence: ${result.confidence}`)
      console.log(`Next Action: ${result.nextAction}`)
      if (result.toolUsed) console.log(`Tool Used: ${result.toolUsed}`)

      return result
    } catch (error) {
      // Update step with error
      step.status = "failed"
      step.duration = Date.now() - startTime

      console.error(`[${agent.toUpperCase()}] ${action} - Failed:`, error)

      throw error
    }
  }

  private generateResolutionSummary(complaint: Complaint, workflowSteps: WorkflowStep[]): string {
    const completedSteps = workflowSteps.filter((step) => step.status === "completed")
    const workflowSummary = completedSteps.map((step) => `${step.agent} (${step.action})`).join(" -> ")

    const finalResult = completedSteps[completedSteps.length - 1]?.result || {
      result: "No final result available.",
      confidence: 0,
      nextAction: "N/A",
    }

    const resolutionTemplate = `
Complaint Resolution Summary for Complaint ID: ${complaint.id}
-----------------------------------------------------------------
Original Complaint:
  Title: ${complaint.title}
  Description: ${complaint.description}
  Type: ${complaint.type}
  Priority: ${complaint.priority}

Workflow Path:
${workflowSummary || "No steps completed."}

Final Agent Assessment:
  Result: ${finalResult.result}
  Confidence: ${Math.round(finalResult.confidence * 100)}%
  Next Action: ${finalResult.nextAction}

Overall Status: ${finalResult.confidence > 0.7 ? "Resolved (High Confidence)" : "Requires Further Review"}
Total Processing Time: ${this.getTotalProcessingTime()}ms
    `.trim()

    return resolutionTemplate
  }

  private getTotalProcessingTime(): number {
    return this.workflow.reduce((total, step) => total + (step.duration || 0), 0)
  }
}
