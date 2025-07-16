import { getComplaintById, mockComplaints } from "../database/mock-data"
import type { Complaint } from "../types/complaint-types"

export class DatabaseTool {
  name = "Database Tool"
  description = "Provides access to the complaint database for retrieving and updating complaint information."

  async getComplaintDetails(complaintId: string): Promise<Complaint | undefined> {
    console.log(`[DatabaseTool] Fetching details for complaint ID: ${complaintId}`)
    // Simulate database lookup
    await new Promise((resolve) => setTimeout(resolve, 500))
    const complaint = getComplaintById(complaintId)
    if (complaint) {
      console.log(`[DatabaseTool] Found complaint: ${JSON.stringify(complaint)}`)
    } else {
      console.log(`[DatabaseTool] Complaint ID ${complaintId} not found.`)
    }
    return complaint
  }

  async updateComplaintStatus(complaintId: string, newStatus: string): Promise<boolean> {
    console.log(`[DatabaseTool] Updating status for complaint ID ${complaintId} to ${newStatus}`)
    // Simulate database update
    await new Promise((resolve) => setTimeout(resolve, 500))
    const complaint = getComplaintById(complaintId)
    if (complaint) {
      complaint.status = newStatus as any // Cast to ComplaintStatus
      complaint.updatedAt = new Date()
      console.log(`[DatabaseTool] Status updated for complaint ID ${complaintId}.`)
      return true
    }
    console.log(`[DatabaseTool] Complaint ID ${complaintId} not found for status update.`)
    return false
  }

  async addResolutionSummary(complaintId: string, summary: string): Promise<boolean> {
    console.log(`[DatabaseTool] Adding resolution summary for complaint ID ${complaintId}`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const complaint = getComplaintById(complaintId)
    if (complaint) {
      complaint.resolutionSummary = summary
      complaint.updatedAt = new Date()
      console.log(`[DatabaseTool] Resolution summary added for complaint ID ${complaintId}.`)
      return true
    }
    console.log(`[DatabaseTool] Complaint ID ${complaintId} not found for resolution summary.`)
    return false
  }

  async getRecentComplaints(limit = 5): Promise<Complaint[]> {
    console.log(`[DatabaseTool] Fetching ${limit} recent complaints.`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Return a copy to prevent direct modification of mock data outside the tool
    return [...mockComplaints].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit)
  }
}
