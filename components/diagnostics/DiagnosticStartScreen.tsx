import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  Activity,
  FileText,
  AlertTriangle,
  Brain,
  ChevronRight,
  PlayCircle,
  Wrench,
  CheckCircle,
} from "lucide-react";

interface DiagnosticStartScreenProps {
  onStartDiagnostic: () => void;
}

export const DiagnosticStartScreen: React.FC<DiagnosticStartScreenProps> = ({
  onStartDiagnostic,
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-3xl text-slate-100 font-bold mb-2">
          Motor Diagnostic Center
        </CardTitle>
        <CardDescription className="text-slate-300 text-lg">
          Comprehensive analysis and health assessment for Scooter
          #862487061363723
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-200 font-medium">Data Analysis</span>
            </div>
            <div className="text-sm text-slate-400">
              Process 30 days of telemetry data with intelligent batching and
              error detection
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-slate-200 font-medium">
                Real-time Processing
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Live progress tracking with batch optimization and error recovery
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-slate-200 font-medium">Factory Report</span>
            </div>
            <div className="text-sm text-slate-400">
              Detailed maintenance recommendations and performance analytics
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-slate-200 font-medium">
                Issue Detection
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Advanced anomaly detection and predictive maintenance insights
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold text-blue-300">
              Diagnostic Analysis Includes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm text-blue-200/90">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Complete motor temperature profiling
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                RPM distribution and efficiency analysis
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Error pattern recognition and clustering
              </li>
            </ul>
            <ul className="space-y-2 text-sm text-blue-200/90">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Predictive maintenance scheduling
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Optimization recommendations
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Factory-grade diagnostic reporting
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">~50K</div>
            <div className="text-xs text-slate-400">Records Analyzed</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">2-5</div>
            <div className="text-xs text-slate-400">Minutes Duration</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-200">30</div>
            <div className="text-xs text-slate-400">Days Coverage</div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartDiagnostic}
          className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <PlayCircle className="w-6 h-6" />
          <span>Start Comprehensive Diagnostic</span>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        </button>

        <div className="text-center">
          <div className="text-xs text-slate-500">
            This diagnostic will analyze motor performance, detect anomalies,
            and generate actionable maintenance recommendations
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
