"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Battery, Cpu, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Mock data - replace with your actual data
const mockAlertData = {
  stats: {
    total: 12,
    critical: 3,
    warning: 7,
    info: 2,
  },
  alerts: [
    {
      id: "ALT-001",
      type: "battery",
      severity: "critical",
      message: "Battery critically low",
      scooter: "SCT-003",
      time: "2 hours ago",
    },
    {
      id: "ALT-002",
      type: "motor",
      severity: "warning",
      message: "Motor overheating",
      scooter: "SCT-005",
      time: "3 hours ago",
    },
    {
      id: "ALT-003",
      type: "gps",
      severity: "warning",
      message: "GPS signal lost",
      scooter: "SCT-002",
      time: "5 hours ago",
    },
    {
      id: "ALT-004",
      type: "battery",
      severity: "warning",
      message: "Battery below 20%",
      scooter: "SCT-007",
      time: "6 hours ago",
    },
    {
      id: "ALT-005",
      type: "motor",
      severity: "critical",
      message: "Motor failure detected",
      scooter: "SCT-009",
      time: "1 day ago",
    },
  ],
}

interface AlertStatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

function AlertStatCard({ title, value, icon, color }: AlertStatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${color}`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AlertsOverview() {
  const [alertData, setAlertData] = useState(mockAlertData)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/alerts');
        // const data = await response.json();
        // setAlertData(data);

        // Using mock data for now
        setTimeout(() => {
          setAlertData(mockAlertData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch alert data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const { stats, alerts } = alertData

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "battery":
        return <Battery className="h-5 w-5" />
      case "motor":
        return <Cpu className="h-5 w-5" />
      case "gps":
        return <MapPin className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "warning":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "info":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AlertStatCard
          title="Total Alerts"
          value={stats.total}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-gray-100 text-gray-800"
        />
        <AlertStatCard
          title="Critical"
          value={stats.critical}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-red-100 text-red-800"
        />
        <AlertStatCard
          title="Warning"
          value={stats.warning}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-amber-100 text-amber-800"
        />
        <AlertStatCard
          title="Info"
          value={stats.info}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-blue-100 text-blue-800"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Latest alerts across the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Scooter</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getAlertIcon(alert.type)}
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAlertColor(alert.severity)} variant="outline">
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.scooter}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{alert.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
