"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FleetUtilizationChartProps {
  dateRange: { from: Date; to: Date }
}

export function FleetUtilizationChart({ dateRange }: FleetUtilizationChartProps) {
  const [loading, setLoading] = useState(true)
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [efficiencyData, setEfficiencyData] = useState<any[]>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Generate utilization data
      const utilData = []
      const startDate = new Date(dateRange.from)
      const endDate = new Date(dateRange.to)

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 2)) {
        utilData.push({
          date: `Feb ${date.getDate()}`,
          activeHours: Math.floor(Math.random() * 6) + 6, // 6-12 hours
          idleHours: Math.floor(Math.random() * 4) + 2, // 2-6 hours
          maintenanceHours: Math.floor(Math.random() * 2), // 0-2 hours
          chargingHours: Math.floor(Math.random() * 4) + 2, // 2-6 hours
        })
      }

      // Generate efficiency data
      const effData = []

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 2)) {
        effData.push({
          date: `Feb ${date.getDate()}`,
          energyEfficiency: Math.floor(Math.random() * 15) + 80, // 80-95%
          distancePerCharge: Math.floor(Math.random() * 50) + 200, // 200-250 km
          costPerKm: (Math.random() * 0.05 + 0.1).toFixed(2), // 0.10-0.15 per km
        })
      }

      setUtilizationData(utilData)
      setEfficiencyData(effData)
      setLoading(false)
    }, 1500)
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
          <p className="mt-2 text-sm text-slate-300">Loading utilization data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="utilization">
        <TabsList>
          <TabsTrigger value="utilization">Time Utilization</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={utilizationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                stackOffset="expand"
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "#475569",
                    color: "#e2e8f0",
                  }}
                />
                <Legend />
                <Bar dataKey="activeHours" name="Active Hours" stackId="a" fill="#06b6d4" />
                <Bar dataKey="idleHours" name="Idle Hours" stackId="a" fill="#3b82f6" />
                <Bar dataKey="chargingHours" name="Charging Hours" stackId="a" fill="#f59e0b" />
                <Bar dataKey="maintenanceHours" name="Maintenance Hours" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "#475569",
                    color: "#e2e8f0",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="energyEfficiency"
                  name="Energy Efficiency (%)"
                  stroke="#06b6d4"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="distancePerCharge"
                  name="Distance per Charge (km)"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="costPerKm"
                  name="Cost per km ($)"
                  stroke="#f59e0b"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
