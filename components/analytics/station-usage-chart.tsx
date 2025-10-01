"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

// Define the props interface
interface StationUsageChartProps {
  dateRange: { from: Date; to: Date }
}

// Define the data structure
interface StationData {
  date: string
  capacity: number
  usage: number
  peakUsage: number
}

export default function StationUsageChart({ dateRange }: StationUsageChartProps) {
  const [data, setData] = useState<StationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/station-usage?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
        // const result = await response.json();
        // setData(result.data);

        // For demo purposes, generate sample data
        const sampleData: StationData[] = []

        // Generate dates between the range
        const startDate = new Date(dateRange.from)
        const endDate = new Date(dateRange.to)
        const dayInterval = 2 // Data points every 2 days

        const capacity = 1000 // Fixed capacity

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + dayInterval)) {
          const baseUsage = 500 + Math.random() * 300 // 500-800
          const peakUsage = baseUsage + Math.random() * 200 // baseUsage + (0-200)

          sampleData.push({
            date: `Feb ${date.getDate().toString().padStart(2, "0")}`,
            capacity: capacity,
            usage: baseUsage,
            peakUsage: peakUsage > capacity ? capacity : peakUsage, // Cap at capacity
          })
        }

        setData(sampleData)
      } catch (error) {
        console.error("Error fetching station usage data:", error)
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
        <AreaChart
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
            label={{
              value: "kWh",
              angle: -90,
              position: "insideLeft",
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
          <Area
            type="monotone"
            dataKey="capacity"
            stroke="#475569"
            fill="#475569"
            fillOpacity={0.2}
            strokeDasharray="5 5"
            name="Total Capacity"
          />
          <Area
            type="monotone"
            dataKey="usage"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.6}
            name="Average Usage"
          />
          <Area
            type="monotone"
            dataKey="peakUsage"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.6}
            name="Peak Usage"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
