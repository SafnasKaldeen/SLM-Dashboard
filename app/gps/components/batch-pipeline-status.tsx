"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Database,
  Users,
  Route,
  Battery,
} from "lucide-react"

interface BatchJob {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "queued"
  startTime: string
  endTime?: string
  progress: number
  recordsProcessed: number
  totalRecords: number
  duration?: string
  error?: string
  tableTarget?: string
}

interface BatchPipelineStatusProps {
  refreshInterval?: number
}

export default function BatchPipelineStatus({ refreshInterval = 5000 }: BatchPipelineStatusProps) {
  const [jobs, setJobs] = useState<BatchJob[]>([
    {
      id: "gps_analysis",
      name: "GPS Data Analysis",
      status: "completed",
      startTime: "2024-01-15 00:00:15",
      endTime: "2024-01-15 00:23:45",
      progress: 100,
      recordsProcessed: 2340000,
      totalRecords: 2340000,
      duration: "23m 30s",
      tableTarget: "FACT_GPS",
    },
    {
      id: "telemetry_processing",
      name: "Telemetry Data Processing",
      status: "running",
      startTime: "2024-01-15 00:25:00",
      progress: 67,
      recordsProcessed: 1560000,
      totalRecords: 2340000,
      tableTarget: "FACT_VEHICLE_TELEMETRY",
    },
    {
      id: "vehicle_usage_summary",
      name: "Vehicle Usage Summary",
      status: "completed",
      startTime: "2024-01-15 00:45:12",
      endTime: "2024-01-15 00:52:33",
      progress: 100,
      recordsProcessed: 1247,
      totalRecords: 1247,
      duration: "7m 21s",
      tableTarget: "DAILY_VEHICLE_USAGE_SUMMARY",
    },
    {
      id: "route_metrics",
      name: "Route Metrics Calculation",
      status: "queued",
      startTime: "",
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 890000,
      tableTarget: "DAILY_ROUTE_METRICS",
    },
    {
      id: "battery_health",
      name: "Battery Health Analysis",
      status: "failed",
      startTime: "2024-01-15 01:00:00",
      endTime: "2024-01-15 01:15:45",
      progress: 45,
      recordsProcessed: 560,
      totalRecords: 1247,
      error: "Connection timeout to battery monitoring system",
      tableTarget: "BATTERY_HEALTH_TRACKER",
    },
    {
      id: "alert_generation",
      name: "Alert Generation",
      status: "completed",
      startTime: "2024-01-15 01:20:00",
      endTime: "2024-01-15 01:22:15",
      progress: 100,
      recordsProcessed: 23,
      totalRecords: 23,
      duration: "2m 15s",
      tableTarget: "ALERT_LOGS",
    },
  ])

  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate job progress updates
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === "running" && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 5, 100)
            const newRecordsProcessed = Math.floor((newProgress / 100) * job.totalRecords)

            if (newProgress >= 100) {
              return {
                ...job,
                progress: 100,
                recordsProcessed: job.totalRecords,
                status: "completed" as const,
                endTime: new Date().toISOString().slice(0, 19).replace("T", " "),
                duration: "15m 30s", // Mock duration
              }
            }

            return {
              ...job,
              progress: newProgress,
              recordsProcessed: newRecordsProcessed,
            }
          }
          return job
        }),
      )
      setLastUpdate(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "queued":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "running":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "queued":
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getJobIcon = (jobId: string) => {
    switch (jobId) {
      case "gps_analysis":
        return <Route className="h-5 w-5" />
      case "telemetry_processing":
        return <Activity className="h-5 w-5" />
      case "vehicle_usage_summary":
        return <Users className="h-5 w-5" />
      case "route_metrics":
        return <Route className="h-5 w-5" />
      case "battery_health":
        return <Battery className="h-5 w-5" />
      case "alert_generation":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const completedJobs = jobs.filter((job) => job.status === "completed").length
  const runningJobs = jobs.filter((job) => job.status === "running").length
  const failedJobs = jobs.filter((job) => job.status === "failed").length
  const totalRecordsProcessed = jobs.reduce((sum, job) => sum + job.recordsProcessed, 0)

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Completed Jobs</p>
                <p className="text-2xl font-bold text-green-400">{completedJobs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Running Jobs</p>
                <p className="text-2xl font-bold text-blue-400">{runningJobs}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Failed Jobs</p>
                <p className="text-2xl font-bold text-red-400">{failedJobs}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Records Processed</p>
                <p className="text-2xl font-bold text-cyan-400">{(totalRecordsProcessed / 1000000).toFixed(1)}M</p>
              </div>
              <Database className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Details */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-cyan-500" />
            Batch Pipeline Status
          </CardTitle>
          <CardDescription className="text-slate-400">
            Real-time status of daily batch processing jobs - Last updated: {lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-700/50 text-cyan-400">{getJobIcon(job.id)}</div>
                    <div>
                      <h4 className="text-slate-300 font-medium">{job.name}</h4>
                      {job.tableTarget && <p className="text-xs text-slate-500">Target: {job.tableTarget}</p>}
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusIcon(job.status)}
                    <span className="ml-1 capitalize">{job.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  {job.startTime && (
                    <div>
                      <span className="text-slate-400">Start:</span>
                      <span className="text-slate-300 ml-2">{job.startTime}</span>
                    </div>
                  )}
                  {job.endTime && (
                    <div>
                      <span className="text-slate-400">End:</span>
                      <span className="text-slate-300 ml-2">{job.endTime}</span>
                    </div>
                  )}
                  {job.duration && (
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-300 ml-2">{job.duration}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Progress:</span>
                    <span className="text-slate-300 ml-2">{job.progress.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Records: {job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()}
                    </span>
                    <span className="text-slate-300">{job.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2 bg-slate-700" />
                </div>

                {job.error && (
                  <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Error: {job.error}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
