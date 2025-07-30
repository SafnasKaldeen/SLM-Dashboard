"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  BarChart3,
  Battery,
  Route,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Database,
  AlertTriangle,
  Users,
} from "lucide-react";

export default function BatchReportsPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [reportType, setReportType] = useState("comprehensive");
  const [timeRange, setTimeRange] = useState("30d");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock report data with batch analysis focus
  const availableReports = [
    {
      id: 1,
      name: "Daily GPS Batch Analysis Report",
      type: "comprehensive",
      status: "completed",
      generatedAt: "2024-01-15 01:30",
      size: "4.2 MB",
      pages: 67,
      format: "PDF",
      dataPoints: 2340000,
      vehiclesAnalyzed: 1247,
    },
    {
      id: 2,
      name: "Vehicle Usage Summary Report",
      type: "vehicle_usage",
      status: "completed",
      generatedAt: "2024-01-15 01:15",
      size: "2.1 MB",
      pages: 34,
      format: "Excel",
      dataPoints: 890000,
      vehiclesAnalyzed: 1247,
    },
    {
      id: 3,
      name: "Route Metrics Analysis",
      type: "route_analysis",
      status: "generating",
      generatedAt: null,
      size: null,
      pages: null,
      format: "PDF",
      progress: 78,
      dataPoints: 1560000,
      vehiclesAnalyzed: 856,
    },
    {
      id: 4,
      name: "Battery Health Tracker Report",
      type: "battery_health",
      status: "completed",
      generatedAt: "2024-01-15 00:45",
      size: "1.8 MB",
      pages: 28,
      format: "PDF",
      dataPoints: 456000,
      vehiclesAnalyzed: 1247,
    },
    {
      id: 5,
      name: "Alert Logs Summary",
      type: "alert_analysis",
      status: "failed",
      generatedAt: "2024-01-14 23:30",
      size: null,
      pages: null,
      format: "PDF",
      error: "Insufficient alert data for analysis period",
      dataPoints: 23000,
      vehiclesAnalyzed: 234,
    },
  ];

  const reportTemplates = [
    {
      id: "comprehensive",
      name: "Daily GPS Batch Analysis Report",
      description:
        "Complete analysis of GPS data, telemetry, routes, battery health, and alerts from daily batch processing",
      sections: [
        "Executive Summary",
        "Vehicle Usage Summary (DAILY_VEHICLE_USAGE_SUMMARY)",
        "Route Metrics Analysis (DAILY_ROUTE_METRICS)",
        "Battery Health Tracking (BATTERY_HEALTH_TRACKER)",
        "Alert Logs Analysis (ALERT_LOGS)",
        "Heatmap Coordinates",
        "Performance Recommendations",
      ],
      estimatedPages: "60-80",
      estimatedTime: "25-30 min",
      dataPoints: "2M+",
    },
    {
      id: "vehicle_usage",
      name: "Vehicle Usage Summary Report",
      description:
        "Detailed analysis of daily vehicle usage including distance, battery consumption, and efficiency metrics",
      sections: [
        "Daily Distance Analysis",
        "Battery Consumption Patterns",
        "Temperature and RPM Analysis",
        "Idle Time Assessment",
        "Efficiency Scoring",
        "Vehicle Performance Ranking",
      ],
      estimatedPages: "30-40",
      estimatedTime: "15-20 min",
      dataPoints: "800K+",
    },
    {
      id: "route_analysis",
      name: "Route Metrics Analysis Report",
      description:
        "Analysis of most frequent routes, efficiency scores, and optimization opportunities",
      sections: [
        "Route Frequency Analysis",
        "Efficiency Score Breakdown",
        "Duration vs Distance Analysis",
        "Popular Route Corridors",
        "Optimization Recommendations",
      ],
      estimatedPages: "25-35",
      estimatedTime: "12-18 min",
      dataPoints: "1.5M+",
    },
    {
      id: "battery_health",
      name: "Battery Health Tracker Report",
      description:
        "Comprehensive battery health monitoring including SOH trends, cycle counts, and temperature analysis",
      sections: [
        "SOH Trend Analysis",
        "Battery Cycle Tracking",
        "Temperature Impact Assessment",
        "Health Status Distribution",
        "Maintenance Recommendations",
        "Replacement Scheduling",
      ],
      estimatedPages: "20-30",
      estimatedTime: "10-15 min",
      dataPoints: "450K+",
    },
    {
      id: "alert_analysis",
      name: "Alert Logs Analysis Report",
      description:
        "Analysis of generated alerts including severity distribution, location patterns, and resolution tracking",
      sections: [
        "Alert Type Distribution",
        "Severity Analysis",
        "Geographic Alert Patterns",
        "Time-based Alert Trends",
        "Resolution Status Tracking",
        "Prevention Strategies",
      ],
      estimatedPages: "15-25",
      estimatedTime: "8-12 min",
      dataPoints: "25K+",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "generating":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "queued":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FileText className="h-4 w-4" />;
      case "generating":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      case "queued":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "comprehensive":
        return <BarChart3 className="h-5 w-5" />;
      case "vehicle_usage":
        return <Users className="h-5 w-5" />;
      case "route_analysis":
        return <Route className="h-5 w-5" />;
      case "battery_health":
        return <Battery className="h-5 w-5" />;
      case "alert_analysis":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Batch Analysis Reports
          </h1>
          <p className="text-slate-400">
            Generate comprehensive reports from daily GPS and telemetry batch
            processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <Settings className="mr-2 h-4 w-4" />
            Report Templates
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 bg-slate-800/50 p-1">
          <TabsTrigger
            value="generate"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
          >
            Generate Report
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
          >
            Report History
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
          >
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  Report Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your batch analysis report parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">
                        Daily GPS Batch Analysis Report
                      </SelectItem>
                      <SelectItem value="vehicle_usage">
                        Vehicle Usage Summary Report
                      </SelectItem>
                      <SelectItem value="route_analysis">
                        Route Metrics Analysis Report
                      </SelectItem>
                      <SelectItem value="battery_health">
                        Battery Health Tracker Report
                      </SelectItem>
                      <SelectItem value="alert_analysis">
                        Alert Logs Analysis Report
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Time Range</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Report Title</Label>
                  <Input
                    placeholder="Enter custom report title"
                    className="bg-slate-800/50 border-slate-700 text-slate-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Include Data Tables</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vehicle_usage" defaultChecked />
                      <Label
                        htmlFor="vehicle_usage"
                        className="text-sm text-slate-400"
                      >
                        DAILY_VEHICLE_USAGE_SUMMARY
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="route_metrics" defaultChecked />
                      <Label
                        htmlFor="route_metrics"
                        className="text-sm text-slate-400"
                      >
                        DAILY_ROUTE_METRICS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="battery_health" defaultChecked />
                      <Label
                        htmlFor="battery_health"
                        className="text-sm text-slate-400"
                      >
                        BATTERY_HEALTH_TRACKER
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert_logs" />
                      <Label
                        htmlFor="alert_logs"
                        className="text-sm text-slate-400"
                      >
                        ALERT_LOGS
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Output Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Workbook</SelectItem>
                      <SelectItem value="csv">CSV Data Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Report Preview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">
                    Report Preview
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Preview of the selected report template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportTemplates
                    .filter((template) => template.id === reportType)
                    .map((template) => (
                      <div key={template.id} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-cyan-600/20 text-cyan-400">
                            {getReportTypeIcon(template.id)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-slate-200 mb-2">
                              {template.name}
                            </h3>
                            <p className="text-slate-400 mb-4">
                              {template.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">
                                  Estimated Pages:
                                </span>
                                <span className="text-slate-300 ml-2">
                                  {template.estimatedPages}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Generation Time:
                                </span>
                                <span className="text-slate-300 ml-2">
                                  {template.estimatedTime}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Data Points:
                                </span>
                                <span className="text-slate-300 ml-2">
                                  {template.dataPoints}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-md font-medium text-slate-300">
                            Report Sections:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {template.sections.map((section, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded bg-slate-800/30 border border-slate-700/30"
                              >
                                <div className="w-6 h-6 rounded-full bg-cyan-600/20 text-cyan-400 text-xs flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-slate-300">
                                  {section}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Report History</CardTitle>
              <CardDescription className="text-slate-400">
                Previously generated batch analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-md font-medium text-slate-300">
                          {report.name}
                        </h3>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">
                            {report.status}
                          </span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-400">
                        {report.generatedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{report.generatedAt}</span>
                          </div>
                        )}
                        {report.size && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{report.size}</span>
                          </div>
                        )}
                        {report.pages && (
                          <div className="flex items-center gap-1">
                            <span>{report.pages} pages</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          <span>
                            {report.dataPoints?.toLocaleString()} points
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{report.vehiclesAnalyzed} vehicles</span>
                        </div>
                      </div>
                      {report.status === "generating" && report.progress && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Generating...</span>
                            <span>{report.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${report.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {report.status === "failed" && report.error && (
                        <div className="mt-2 text-xs text-red-400">
                          Error: {report.error}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {report.status === "completed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 bg-transparent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {report.status === "generating" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 bg-transparent"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {report.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 bg-transparent"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
              >
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center">
                    {getReportTypeIcon(template.id)}
                    <span className="ml-2">{template.name}</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Pages:</span>
                        <span className="text-slate-300 ml-2">
                          {template.estimatedPages}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Time:</span>
                        <span className="text-slate-300 ml-2">
                          {template.estimatedTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Data Points:</span>
                        <span className="text-slate-300 ml-2">
                          {template.dataPoints}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">
                        Sections:
                      </h4>
                      <div className="space-y-1">
                        {template.sections.map((section, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-slate-400"
                          >
                            <div className="w-4 h-4 rounded-full bg-cyan-600/20 text-cyan-400 text-xs flex items-center justify-center">
                              {index + 1}
                            </div>
                            <span>{section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={() => {
                        setReportType(template.id);
                        setActiveTab("generate");
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
