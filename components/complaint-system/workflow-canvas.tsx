"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, ArrowRight, User, Wrench, MapPin, DollarSign, Users } from "lucide-react"
import type { WorkflowStep, AgentRole } from "@/lib/complaint-system/types"

interface WorkflowCanvasProps {
  workflowSteps: WorkflowStep[]
  isProcessing: boolean
}

export function WorkflowCanvas({ workflowSteps, isProcessing }: WorkflowCanvasProps) {
  const [animatedSteps, setAnimatedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (workflowSteps.length > 0) {
      workflowSteps.forEach((step, index) => {
        setTimeout(() => {
          setAnimatedSteps((prev) => new Set([...prev, step.id]))
        }, index * 1000)
      })
    }
  }, [workflowSteps])

  const getAgentIcon = (role: AgentRole) => {
    switch (role) {
      case "Support Agent":
        return <User className="h-6 w-6" />
      case "Technician":
        return <Wrench className="h-6 w-6" />
      case "Station Manager":
        return <MapPin className="h-6 w-6" />
      case "Finance Officer":
        return <DollarSign className="h-6 w-6" />
      case "Complaint Manager":
        return <Users className="h-6 w-6" />
      default:
        return <User className="h-6 w-6" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500/50 bg-green-500/10"
      case "processing":
        return "border-yellow-500/50 bg-yellow-500/10"
      case "failed":
        return "border-red-500/50 bg-red-500/10"
      default:
        return "border-slate-500/50 bg-slate-500/10"
    }
  }

  return (
    <div className="w-full h-96 bg-slate-900 rounded-lg p-6 overflow-auto">
      <div className="flex items-center justify-center min-h-full">
        {workflowSteps.length === 0 ? (
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <p>Submit a complaint to see the workflow</p>
          </div>
        ) : (
          <div className="flex items-center space-x-8">
            {/* Customer Node */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">📝</div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Customer</p>
                <p className="text-xs text-slate-400">Submits complaint</p>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-6 w-6 text-slate-400" />

            {/* Workflow Steps */}
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center mb-2 transition-all duration-500 ${getStatusColor(
                      step.status,
                    )} ${animatedSteps.has(step.id) ? "scale-100 opacity-100" : "scale-75 opacity-50"}`}
                  >
                    <div className="text-white">{getAgentIcon(step.agentRole)}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {getStatusIcon(step.status)}
                      <p className="text-sm font-medium text-white ml-1">{step.agentRole}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {step.status === "processing"
                        ? "Processing..."
                        : step.status === "completed"
                          ? "Completed"
                          : step.status === "failed"
                            ? "Failed"
                            : "Pending"}
                    </p>
                    {step.decision && (
                      <Badge variant="outline" className="mt-1 text-xs border-slate-600 text-slate-300">
                        {step.decision.confidence > 0.8
                          ? "High Confidence"
                          : step.decision.confidence > 0.6
                            ? "Medium Confidence"
                            : "Low Confidence"}
                      </Badge>
                    )}
                  </div>
                </div>

                {index < workflowSteps.length - 1 && <ArrowRight className="h-6 w-6 text-slate-400 mx-4" />}
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <>
                <ArrowRight className="h-6 w-6 text-slate-400" />
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-slate-800 border border-yellow-500/50 flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-yellow-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">Processing</p>
                    <p className="text-xs text-slate-400">Analyzing...</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
