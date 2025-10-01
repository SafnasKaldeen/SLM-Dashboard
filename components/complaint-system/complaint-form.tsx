"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2 } from "lucide-react"
import type { Complaint, ComplaintType, ComplaintPriority } from "@/lib/complaint-system/types"

interface ComplaintFormProps {
  onSubmit: (complaint: Partial<Complaint>) => Promise<void>
  isSubmitting: boolean
}

export function ComplaintForm({ onSubmit, isSubmitting }: ComplaintFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Other" as ComplaintType,
    priority: "Medium" as ComplaintPriority,
    customerEmail: "",
    customerId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      customerId: formData.customerId || `customer_${Date.now()}`,
    })

    // Reset form
    setFormData({
      title: "",
      description: "",
      type: "Other",
      priority: "Medium",
      customerEmail: "",
      customerId: "",
    })
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Submit New Complaint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Complaint Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              required
            />
          </div>

          <div>
            <Textarea
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ComplaintType })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Complaint Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Scooter">Scooter Issue</SelectItem>
                  <SelectItem value="Battery">Battery/Station Issue</SelectItem>
                  <SelectItem value="Payment">Payment Issue</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as ComplaintPriority })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="email"
                placeholder="Your Email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>

            <div>
              <Input
                placeholder="Customer ID (optional)"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Complaint...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Complaint
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
