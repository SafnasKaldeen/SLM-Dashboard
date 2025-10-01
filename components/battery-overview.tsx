"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Battery, BatteryCharging, BatteryWarning, BatteryFull } from "lucide-react"
import StatusItem from "./status-item"

// Mock data - replace with your actual data
const mockBatteryData = {
  stats: {
    avgCharge: 76,
    lowBatteryCount: 12,
    criticalBatteryCount: 5,
    fullChargeCount: 45,
    avgCycleCount: 124,
    avgTemperature: 28.5,
  },
  history: [
    { time: "00:00", avgCharge: 82 },
    { time: "04:00", avgCharge: 78 },
    { time: "08:00", avgCharge: 65 },
    { time: "12:00", avgCharge: 58 },
    { time: "16:00", avgCharge: 72 },
    { time: "20:00", avgCharge: 76 },
    { time: "24:00", avgCharge: 80 },
  ],
}

export default function BatteryOverview() {
  const [batteryData, setBatteryData] = useState(mockBatteryData)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/battery-status');
        // const data = await response.json();
        // setBatteryData(data);

        // Using mock data for now
        setTimeout(() => {
          setBatteryData(mockBatteryData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch battery data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const { stats, history } = batteryData

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Battery Charge History</CardTitle>
          <CardDescription>Average battery charge over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted/20 rounded-lg flex items-center justify-center">
            {/* This is a placeholder for the actual chart */}
            <div className="text-center">
              <p className="text-muted-foreground">Battery charge history would be displayed here</p>
              <p className="text-xs text-muted-foreground mt-2">
                Data points: {history.map((item) => `${item.time}: ${item.avgCharge}%`).join(", ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Battery Statistics</CardTitle>
          <CardDescription>Current battery status across fleet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusItem
            label="Average Charge"
            value={`${stats.avgCharge}%`}
            status={stats.avgCharge < 30 ? "critical" : stats.avgCharge < 50 ? "warning" : "normal"}
            icon={<Battery className="h-5 w-5" />}
          />
          <StatusItem
            label="Low Battery"
            value={stats.lowBatteryCount}
            status={stats.lowBatteryCount > 10 ? "warning" : "normal"}
            icon={<BatteryWarning className="h-5 w-5" />}
          />
          <StatusItem
            label="Critical Battery"
            value={stats.criticalBatteryCount}
            status={stats.criticalBatteryCount > 0 ? "critical" : "normal"}
            icon={<BatteryWarning className="h-5 w-5" />}
          />
          <StatusItem
            label="Full Charge"
            value={stats.fullChargeCount}
            status="normal"
            icon={<BatteryFull className="h-5 w-5" />}
          />
          <StatusItem
            label="Avg Cycle Count"
            value={stats.avgCycleCount}
            status={stats.avgCycleCount > 200 ? "warning" : "normal"}
            icon={<BatteryCharging className="h-5 w-5" />}
          />
          <StatusItem
            label="Avg Temperature"
            value={`${stats.avgTemperature}°C`}
            status={stats.avgTemperature > 35 ? "critical" : stats.avgTemperature > 30 ? "warning" : "normal"}
            icon={<BatteryCharging className="h-5 w-5" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}
