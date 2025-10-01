import { BaseAgent } from "./base-agent"
import type { Complaint, AgentDecision } from "../types"

export class StationManager extends BaseAgent {
  constructor() {
    super("Station Manager", [
      "station_operations",
      "facility_management",
      "swap_process_optimization",
      "station_maintenance",
    ])
  }

  canHandle(complaint: Complaint): boolean {
    return complaint.type === "Battery" && complaint.description.toLowerCase().includes("station")
  }

  async processComplaint(complaint: Complaint): Promise<AgentDecision> {
    const analysis = this.analyzeComplaintText(complaint.description)
    const relevantData = this.findRelevantData(complaint)

    // Find relevant station data
    const stationInfo = this.findRelevantStation(complaint)

    if (stationInfo) {
      const stationIssue = this.identifyStationIssue(complaint, stationInfo)

      if (stationIssue.canResolve) {
        return this.generateDecision(
          "Resolve station issue",
          `Station issue identified at ${stationInfo.location}: ${stationIssue.type}. Station status: ${stationInfo.status}`,
          `Implement solution: ${stationIssue.solution}. Monitor station performance`,
          0.85,
          {
            station: stationInfo,
            issue: stationIssue,
            customer: relevantData.customer,
          },
        )
      }

      if (stationIssue.requiresMaintenance) {
        return this.generateDecision(
          "Schedule station maintenance",
          `Station at ${stationInfo.location} requires maintenance. Issue: ${stationIssue.type}`,
          "Schedule maintenance crew and notify customers of temporary service interruption",
          0.9,
          {
            station: stationInfo,
            maintenanceRequired: true,
            priority: stationIssue.priority,
          },
        )
      }
    }

    return this.generateDecision(
      "Escalate to Technician",
      "Station issue requires technical expertise for resolution",
      "Route to Technician for specialized technical resolution",
      0.75,
      { requiresTechnicalSupport: true },
    )
  }

  private findRelevantStation(complaint: Complaint) {
    // In a real system, this would use location data from the complaint
    // For now, return a random station for demonstration
    return this.database.batteryStations[0]
  }

  private identifyStationIssue(complaint: Complaint, station: any) {
    const text = complaint.description.toLowerCase()

    if (text.includes("dirty") || text.includes("clean")) {
      return {
        type: "Cleanliness issue",
        canResolve: true,
        requiresMaintenance: false,
        solution: "Deploy cleaning crew and implement regular cleaning schedule",
        priority: "medium",
      }
    }

    if (text.includes("swap") || text.includes("stuck")) {
      return {
        type: "Battery swap mechanism",
        canResolve: false,
        requiresMaintenance: true,
        priority: "high",
      }
    }

    if (text.includes("payment") || text.includes("card")) {
      return {
        type: "Payment system malfunction",
        canResolve: false,
        requiresMaintenance: true,
        priority: "high",
      }
    }

    return {
      type: "General station issue",
      canResolve: false,
      requiresMaintenance: false,
      priority: "medium",
    }
  }
}
