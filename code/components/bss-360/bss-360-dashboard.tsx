"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import MetricsGrid from "./metrics-grid"
import CabinetHealthPanel from "./cabinet-health-panel"

// Mock data - replace with real API calls
const generateHeartbeatData = () => [
  { time: "00:00", t: 28, v: 48.2, i: 2.3, p: 111, e: 0.5 },
  { time: "04:00", t: 26, v: 48.1, i: 1.8, p: 87, e: 0.4 },
  { time: "08:00", t: 27, v: 48.3, i: 3.5, p: 169, e: 0.8 },
  { time: "12:00", t: 32, v: 47.9, i: 5.2, p: 249, e: 1.2 },
  { time: "16:00", t: 35, v: 47.5, i: 6.8, p: 323, e: 1.5 },
  { time: "20:00", t: 30, v: 48.0, i: 4.1, p: 197, e: 0.9 },
]

const generateBatchComparison = () => [
  { device: "BSS-001", avgTemp: 28.5, totalEnergy: 12.4, availability: 98.2 },
  { device: "BSS-002", avgTemp: 31.2, totalEnergy: 14.8, availability: 96.5 },
  { device: "BSS-003", avgTemp: 26.8, totalEnergy: 11.2, availability: 99.1 },
  { device: "BSS-004", avgTemp: 32.1, totalEnergy: 15.3, availability: 95.8 },
  { device: "BSS-005", avgTemp: 29.3, totalEnergy: 13.1, availability: 97.9 },
]

const generateCumulativeEnergy = () => [
  { date: "Day 1", energy: 245.3 },
  { date: "Day 2", energy: 512.8 },
  { date: "Day 3", energy: 758.1 },
  { date: "Day 4", energy: 1024.5 },
  { date: "Day 5", energy: 1289.3 },
  { date: "Day 6", energy: 1521.7 },
  { date: "Day 7", energy: 1842.5 },
]

interface BSS360DashboardProps {
  selectedDevice: string | null
  selectedBatch: string
}

export default function BSS360Dashboard({ selectedDevice, selectedBatch }: BSS360DashboardProps) {
  const heartbeatData = generateHeartbeatData()
  const batchData = generateBatchComparison()
  const energyData = generateCumulativeEnergy()

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <MetricsGrid selectedDevice={selectedDevice} selectedBatch={selectedBatch} />

      {/* Tabs for different views */}
      <Tabs defaultValue="telemetry" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
          <TabsTrigger value="cabinet">Cabinet Status</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Device Telemetry Timeline</CardTitle>
              <CardDescription>Temperature, Voltage, and Current over 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={heartbeatData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Area type="monotone" dataKey="t" stroke="#f97316" fill="url(#colorTemp)" name="Temperature (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Electrical Parameters</CardTitle>
              <CardDescription>Voltage, Current, and Power consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={heartbeatData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="v" stroke="#06b6d4" name="Voltage (V)" strokeWidth={2} />
                  <Line type="monotone" dataKey="i" stroke="#3b82f6" name="Current (A)" strokeWidth={2} />
                  <Line type="monotone" dataKey="p" stroke="#8b5cf6" name="Power (W)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Analysis Tab */}
        <TabsContent value="batch" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Batch Comparison</CardTitle>
              <CardDescription>Key metrics across all devices in batch</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="device" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Bar dataKey="avgTemp" fill="#f97316" name="Avg Temp (°C)" />
                  <Bar dataKey="totalEnergy" fill="#06b6d4" name="Total Energy (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Device Availability</CardTitle>
              <CardDescription>System uptime percentage by device</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={batchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" domain={[94, 100]} />
                  <YAxis dataKey="device" type="category" stroke="#94a3b8" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Bar dataKey="availability" fill="#10b981" name="Availability %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cabinet Status Tab */}
        <TabsContent value="cabinet" className="space-y-4">
          <CabinetHealthPanel selectedDevice={selectedDevice} />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Cumulative Energy Output</CardTitle>
              <CardDescription>Total energy generated over time (kWh)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#10b981"
                    fill="url(#colorEnergy)"
                    name="Energy (kWh)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts and Warnings */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-red-400">High Temperature Alert on BSS-004</p>
            <p className="text-slate-400 text-xs mt-1">
              Cabinet temperature exceeded 40°C - cooling system response needed
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-yellow-400">Low Communication Signal on BSS-012</p>
            <p className="text-slate-400 text-xs mt-1">Device signal strength below threshold - check connectivity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
