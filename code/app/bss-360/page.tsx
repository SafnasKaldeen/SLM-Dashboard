"use client"

import { useState } from "react"
import BSS360Dashboard from "@/components/bss-360/bss-360-dashboard"
import DeviceListPanel from "@/components/bss-360/device-list-panel"
import BatchSelector from "@/components/bss-360/batch-selector"
import { Card } from "@/components/ui/card"

export default function BSS360Page() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<string>("all")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">BSS 360 Analytics</h1>
        <p className="text-slate-400">Comprehensive batch data analysis and device monitoring</p>
      </div>

      {/* Top Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BatchSelector selectedBatch={selectedBatch} onBatchChange={setSelectedBatch} />
        </div>
        <Card className="bg-slate-800/50 border-slate-700 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Total Devices</p>
            <p className="text-2xl font-bold text-cyan-400">24</p>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List Sidebar */}
        <div className="lg:col-span-1">
          <DeviceListPanel selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
        </div>

        {/* Main Analytics Dashboard */}
        <div className="lg:col-span-3">
          <BSS360Dashboard selectedDevice={selectedDevice} selectedBatch={selectedBatch} />
        </div>
      </div>
    </div>
  )
}
