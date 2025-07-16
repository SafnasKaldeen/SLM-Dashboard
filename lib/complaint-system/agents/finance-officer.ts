import { BaseAgent } from "./base-agent"
import type { Complaint, AgentDecision } from "../types"

export class FinanceOfficer extends BaseAgent {
  constructor() {
    super("Finance Officer", [
      "payment_verification",
      "billing_dispute_resolution",
      "refund_processing",
      "transaction_analysis",
    ])
  }

  canHandle(complaint: Complaint): boolean {
    return complaint.type === "Payment"
  }

  async processComplaint(complaint: Complaint): Promise<AgentDecision> {
    const analysis = this.analyzeComplaintText(complaint.description)
    const relevantData = this.findRelevantData(complaint)

    // Find relevant payment records
    const paymentRecord = this.findPaymentRecord(complaint)

    if (paymentRecord) {
      const financialAssessment = this.assessFinancialIssue(complaint, paymentRecord)

      if (financialAssessment.isSimpleRefund) {
        return this.generateDecision(
          "Process refund",
          `Payment issue verified. Transaction ${paymentRecord.id} status: ${paymentRecord.status}. Amount: $${paymentRecord.amount}`,
          `Process refund of $${paymentRecord.amount} to customer's ${paymentRecord.paymentMethod}`,
          0.95,
          {
            paymentRecord,
            refundAmount: paymentRecord.amount,
            customer: relevantData.customer,
          },
        )
      }

      if (financialAssessment.requiresInvestigation) {
        return this.generateDecision(
          "Investigate payment discrepancy",
          `Complex payment issue requiring detailed investigation. Transaction status: ${paymentRecord.status}`,
          "Conduct thorough payment investigation and contact payment processor if needed",
          0.8,
          {
            paymentRecord,
            investigationRequired: true,
            complexity: "high",
          },
        )
      }
    }

    return this.generateDecision(
      "Request additional payment information",
      "Insufficient payment information to resolve complaint. Customer verification required",
      "Contact customer for additional payment details and transaction information",
      0.7,
      { requiresCustomerInfo: true },
    )
  }

  private findPaymentRecord(complaint: Complaint) {
    return this.database.paymentRecords.find((record) => record.customerId === complaint.customerId)
  }

  private assessFinancialIssue(complaint: Complaint, paymentRecord: any) {
    const text = complaint.description.toLowerCase()

    if (text.includes("refund") && paymentRecord.status === "completed") {
      return { isSimpleRefund: true, requiresInvestigation: false }
    }

    if (text.includes("charged twice") || text.includes("duplicate")) {
      return { isSimpleRefund: false, requiresInvestigation: true }
    }

    if (paymentRecord.status === "failed" && text.includes("charged")) {
      return { isSimpleRefund: false, requiresInvestigation: true }
    }

    return { isSimpleRefund: false, requiresInvestigation: false }
  }
}
