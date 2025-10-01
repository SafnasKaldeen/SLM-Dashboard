"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, AlertTriangle, User, Wrench, MapPin, DollarSign, Users } from "lucide-react"
import type { WorkflowStep, AgentRole } from "@/lib/complaint-system/types"

interface AgentResponsePanelProps {
  workflowSteps: WorkflowStep[]
  nextSteps: string[]
}

export function AgentResponsePanel({ workflowSteps, nextSteps }: AgentResponsePanelProps) {
  const getAgentIcon = (role: AgentRole) => {
    switch (role) {
      case "Support Agent":
        return <User className="h-4 w-4" />
      case "Technician":
        return <Wrench className="h-4 w-4" />
      case "Station Manager":
        return <MapPin className="h-4 w-4" />
      case "Finance Officer":
        return <DollarSign className="h-4 w-4" />
      case "Complaint Manager":
        return <Users className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500/10 text-green-400 border-green-500/20"
    if (confidence >= 0.6) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    return "bg-red-500/10 text-red-400 border-red-500/20"
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp)
  }

  return (
    <div className="space-y-4">
      {/* Agent Decisions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Agent Decisions & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <div key={step.id} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getAgentIcon(step.agentRole)}
                      <span className="text-white font-medium ml-2">{step.agentRole}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {formatTimestamp(step.timestamp)}
                      </Badge>
                      {step.decision && (
                        <Badge className={getConfidenceColor(step.decision.confidence)}>
                          {Math.round(step.decision.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>

                  {step.decision && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-blue-400">Decision:</p>
                        <p className="text-sm text-slate-300">{step.decision.decision}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-green-400">Reasoning:</p>
                        <p className="text-sm text-slate-300">{step.decision.reasoning}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-yellow-400">Next Action:</p>
                        <p className="text-sm text-slate-300">{step.decision.nextAction}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {workflowSteps.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No agent responses yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
