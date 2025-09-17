export class NotificationTool {
  name = "Notification Tool"
  description = "Sends notifications to customers, agents, or relevant personnel via email or SMS."

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`[NotificationTool] Sending email to ${to} with subject: "${subject}"`)
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log(`[NotificationTool] Email sent to ${to}.`)
    return true
  }

  async sendSMS(toPhoneNumber: string, message: string): Promise<boolean> {
    console.log(`[NotificationTool] Sending SMS to ${toPhoneNumber} with message: "${message.substring(0, 50)}..."`)
    // Simulate SMS sending
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(`[NotificationTool] SMS sent to ${toPhoneNumber}.`)
    return true
  }

  async notifyAgent(agentName: string, message: string): Promise<boolean> {
    console.log(`[NotificationTool] Notifying ${agentName}: "${message.substring(0, 50)}..."`)
    // Simulate internal notification
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log(`[NotificationTool] ${agentName} notified.`)
    return true
  }
}
