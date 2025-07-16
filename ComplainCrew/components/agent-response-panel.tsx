"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  MessageSquare,
  Zap,
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { AgentResult, WorkflowStep } from "../types/complaint-types";

interface AgentResponsePanelProps {
  result: AgentResult | null;
  resolution: string;
  workflow: WorkflowStep[];
}

export function AgentResponsePanel({
  result,
  resolution,
  workflow,
}: AgentResponsePanelProps) {
  const formatTimestamp = (timestamp: Date | string) => {
    if (!timestamp) return "N/A";
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) return "Invalid Date";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "processing":
        return <Zap className="w-4 h-4 text-blue-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full">
      {!result ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No Analysis Yet
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Submit a complaint to see AI analysis and recommendations here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Result */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Analysis Result</h3>
            </div>
            <p className="text-slate-200 mb-4 leading-relaxed">
              {result.result}
            </p>

            {/* Confidence Score */}
            {result.confidence !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Confidence</span>
                  <span
                    className={`text-sm font-medium ${getConfidenceColor(
                      result.confidence
                    )}`}
                  >
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getConfidenceBarColor(
                      result.confidence
                    )}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Reasoning</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {result.reasoning}
            </p>
          </div>

          {/* Next Action */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Next Action</h3>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300 text-sm">{result.nextAction}</p>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="text-yellow-400 mt-1 flex-shrink-0">
                      •
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Data */}
          {result.data && Object.keys(result.data).length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Additional Context</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(result.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm"
                  >
                    <span className="text-slate-400 capitalize font-medium">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="text-slate-300 break-all">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-slate-600" />

          {/* Workflow Timeline */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <h3 className="text-white font-semibold">Processing Timeline</h3>
            </div>
            <div className="space-y-3">
              {workflow.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-slate-700 border-slate-600 text-slate-300"
                        >
                          {step.agent.replace("_", " ")}
                        </Badge>
                        <span className="text-slate-300 text-sm">
                          {step.action}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {step.duration !== undefined && (
                      <span>{step.duration}ms</span>
                    )}
                    <span>{formatTimestamp(step.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution */}
          {resolution && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-green-300 font-semibold">
                  Final Resolution
                </h3>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <pre className="text-sm text-green-200 whitespace-pre-wrap font-mono leading-relaxed">
                  {resolution}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
