// File: /components/MotorDiagnosticsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, Thermometer, Gauge, AlertCircle } from "lucide-react";
import { motorDiagnosticsService, DiagnosticResult, MotorPerformanceMetrics } from '@/services/motorDiagnosticsService';

interface MotorDiagnosticsPanelProps {
  tboxId: number;
  onDiagnosticsComplete?: (result: DiagnosticResult) => void;
}

export default function MotorDiagnosticsPanel({ tboxId, onDiagnosticsComplete }: MotorDiagnosticsPanelProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runDiagnostics();
  }, [tboxId]);

  const runDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await motorDiagnosticsService.analyzeMotorData(tboxId);
      setDiagnostics(result);
      if (onDiagnosticsComplete) {
        onDiagnosticsComplete(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Running motor diagnostics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-2 text-red-600">Diagnostics error: {error}</p>
          <button 
            onClick={runDiagnostics}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!diagnostics) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className={`
        ${diagnostics.severity === 'critical' ? 'border-red-300 bg-red-50' : ''}
        ${diagnostics.severity === 'warning' ? 'border-yellow-300 bg-yellow-50' : ''}
        ${diagnostics.severity === 'normal' ? 'border-green-300 bg-green-50' : ''}
      `}>
        <CardHeader className="flex flex-row items-center space-y-0">
          {diagnostics.severity === 'critical' && <AlertTriangle className="h-6 w-6 text-red-500" />}
          {diagnostics.severity === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
          {diagnostics.severity === 'normal' && <CheckCircle className="h-6 w-6 text-green-500" />}
          <CardTitle className="ml-2">Motor Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`
            ${diagnostics.severity === 'critical' ? 'text-red-700' : ''}
            ${diagnostics.severity === 'warning' ? 'text-yellow-700' : ''}
            ${diagnostics.severity === 'normal' ? 'text-green-700' : ''}
            font-medium
          `}>
            {diagnostics.summary}
          </p>
        </CardContent>
      </Card>

      {/* Issues List */}
      {diagnostics.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Issues</CardTitle>
            <CardDescription>
              {diagnostics.issues.length} issue(s) found during diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnostics.issues.map((issue, index) => (
                <div key={index} className={`
                  p-3 rounded border
                  ${issue.severity === 'high' ? 'bg-red-50 border-red-200' : ''}
                  ${issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : ''}
                  ${issue.severity === 'low' ? 'bg-blue-50 border-blue-200' : ''}
                `}>
                  <div className="flex items-start">
                    {issue.severity === 'high' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />}
                    {issue.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />}
                    {issue.severity === 'low' && <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />}
                    <div className="flex-1">
                      <h4 className="font-medium">{issue.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Detected: {new Date(issue.timestamp * 1000).toLocaleString()}
                      </p>
                      {issue.suggestedActions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Recommended actions:</p>
                          <ul className="text-sm list-disc list-inside mt-1">
                            {issue.suggestedActions.slice(0, 2).map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {diagnostics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnostics.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5 mr-2">
                    {rec.toLowerCase().includes('priority') || rec.toLowerCase().includes('immediate') ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <span className={`
                    ${rec.toLowerCase().includes('priority') || rec.toLowerCase().includes('immediate') 
                      ? 'text-red-600 font-medium' : 'text-gray-700'}
                  `}>
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <button 
          onClick={runDiagnostics}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-run Diagnostics
        </button>
      </div>
    </div>
  );
}