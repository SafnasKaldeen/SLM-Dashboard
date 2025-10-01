import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ChevronRight, Brain } from "lucide-react";
import { DiagnosticProgress } from "@/types";

export const DiagnosticLoadingState: React.FC<{
  progress: DiagnosticProgress;
}> = ({ progress }) => {
  const getStageIndex = (stage: string) => {
    const stages = [
      "initializing",
      "fetching",
      "processing",
      "analyzing",
      "complete",
    ];
    return stages.indexOf(stage);
  };

  return (
    <div className="min-h-screenflex items-center justify-center">
      <Card className="backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-slate-100 font-semibold">
            Advanced Motor Diagnostics
          </CardTitle>
          <CardDescription className="text-center text-slate-300 text-lg">
            {progress.currentOperation}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">
                Overall Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {progress.totalRecords > 0
                    ? (
                        (progress.processedRecords / progress.totalRecords) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${
                    progress.totalRecords > 0
                      ? (progress.processedRecords / progress.totalRecords) *
                        100
                      : 0
                  }%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Current Stage</span>
              <span className="text-lg font-semibold text-blue-300 capitalize">
                {progress.stage.replace("_", " ")}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    progress.totalBatches > 0
                      ? (progress.processedBatches / progress.totalBatches) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Total Records</div>
              <div className="text-xl font-bold text-slate-200">
                {progress.totalRecords.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Processed</div>
              <div className="text-xl font-bold text-green-400">
                {progress.processedRecords.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Batches</div>
              <div className="text-xl font-bold text-blue-400">
                {progress.processedBatches} / {progress.totalBatches}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Errors</div>
              <div className="text-xl font-bold text-red-400">
                {progress.errors.length}
              </div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="space-y-4">
            <div className="text-sm text-slate-300 font-medium">
              Processing Stages
            </div>
            <div className="flex justify-between items-center">
              {(
                [
                  "initializing",
                  "fetching",
                  "processing",
                  "analyzing",
                  "complete",
                ] as const
              ).map((stage, index) => {
                const currentStageIndex = getStageIndex(progress.stage);
                const isActive = progress.stage === stage;
                const isCompleted = index < currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                  <div
                    key={stage}
                    className="flex flex-col items-center space-y-2 flex-1"
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                            : isCompleted
                            ? "bg-green-400"
                            : "bg-slate-600"
                        }`}
                      />
                      {isActive && (
                        <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-blue-400"
                          : isCompleted
                          ? "text-green-400"
                          : "text-slate-500"
                      } capitalize`}
                    >
                      {stage.replace("_", " ")}
                    </span>
                    {index < 4 && (
                      <div
                        className={`h-0.5 w-full transition-colors duration-300 ${
                          isCompleted ? "bg-green-400" : "bg-slate-600"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {progress.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="text-red-300 font-medium">
                  Processing Warnings ({progress.errors.length})
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {progress.errors.slice(-5).map((error, index) => (
                  <div
                    key={index}
                    className="text-sm text-red-400 bg-red-950/30 rounded-lg p-2"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
