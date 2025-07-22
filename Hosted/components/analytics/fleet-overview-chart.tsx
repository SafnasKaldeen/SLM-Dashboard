"use client"

import { useEffect, useState } from "react"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

// Define the props interface
interface FleetOverviewChartProps {
  dateRange: { from: Date; to: Date }
}

// Define the data structure
interface FleetData {
  date: string
  activeVehicles: number
  distance: number
  energyUsage: number
  efficiency: number
}

export default function FleetOverviewChart({ dateRange }: FleetOverviewChartProps) {
  const [data, setData] = useState<FleetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/fleet-overview?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
        // const result = await response.json();
        // setData(result.data);

        // For demo purposes, generate sample data
        const sampleData: FleetData[] = []

        // Generate dates between the range
        const startDate = new Date(dateRange.from)
        const endDate = new Date(dateRange.to)
        const dayInterval = 4 // Data points every 4 days

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + dayInterval)) {
          const activeVehicles = 80 + Math.floor(Math.random() * 40) // 80-120
          const distance = 800 + Math.random() * 400 // 800-1200
          const energyUsage = 120 + Math.random() * 60 // 120-180

          sampleData.push({
            date: `Feb ${date.getDate().toString().padStart(2, "0")}`,
            activeVehicles: activeVehicles,
            distance: distance,
            energyUsage: energyUsage,
            efficiency: distance / energyUsage, // Calculate efficiency
          })
        }

        setData(sampleData)
      } catch (error) {
        console.error("Error fetching fleet overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            yAxisId="left"
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#94a3b8" },
            }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            yAxisId="right"
            orientation="right"
            label={{
              value: "Distance (km)",
              angle: 90,
              position: "insideRight",
              style: { fill: "#94a3b8" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderColor: "#475569",
              color: "#e2e8f0",
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              color: "#94a3b8",
            }}
          />
          <Bar dataKey="activeVehicles" fill="#06b6d4" yAxisId="left" name="Active Vehicles" />
          <Bar dataKey="energyUsage" fill="#f97316" yAxisId="left" name="Energy Usage (kWh)" />
          <Line
            type="monotone"
            dataKey="distance"
            stroke="#22c55e"
            strokeWidth={2}
            yAxisId="right"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Distance (km)"
          />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#a855f7"
            strokeWidth={2}
            yAxisId="left"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Efficiency (km/kWh)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
