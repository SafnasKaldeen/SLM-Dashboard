"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

// Define the props interface
interface MotorPerformanceChartProps {
  dateRange: { from: Date; to: Date }
}

// Define the data structure
interface MotorData {
  date: string
  efficiency: number
  temperature: number
  torque: number
  power: number
}

export default function MotorPerformanceChart({ dateRange }: MotorPerformanceChartProps) {
  const [data, setData] = useState<MotorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/motor-performance?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
        // const result = await response.json();
        // setData(result.data);

        // For demo purposes, generate sample data
        const sampleData: MotorData[] = []

        // Generate dates between the range
        const startDate = new Date(dateRange.from)
        const endDate = new Date(dateRange.to)
        const dayInterval = 3 // Data points every 3 days

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + dayInterval)) {
          sampleData.push({
            date: `Feb ${date.getDate().toString().padStart(2, "0")}`,
            efficiency: 75 + Math.random() * 20, // 75-95%
            temperature: 35 + Math.random() * 15, // 35-50°C
            torque: 80 + Math.random() * 40, // 80-120 Nm
            power: 15 + Math.random() * 10, // 15-25 kW
          })
        }

        setData(sampleData)
      } catch (error) {
        console.error("Error fetching motor performance data:", error)
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
        <LineChart
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
              value: "Efficiency (%)",
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
              value: "Temperature (°C)",
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
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#06b6d4"
            yAxisId="left"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f97316"
            yAxisId="right"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="torque"
            stroke="#a855f7"
            yAxisId="left"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="power"
            stroke="#22c55e"
            yAxisId="left"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
