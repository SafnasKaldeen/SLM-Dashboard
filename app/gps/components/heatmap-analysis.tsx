"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Map, TrendingUp, Users, Battery, AlertTriangle, Settings, Download, RefreshCw } from "lucide-react"
import CartoMap from "@/components/maps/carto-map"

interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  count: number
  batteryDrain?: number
  avgSpeed?: number
  alertCount?: number
}

interface GridCell {
  id: string
  lat: number
  lng: number
  size: number // in meters
  tripCount: number
  batteryDrainEvents: number
  avgBatteryDrain: number
  deadZoneMinutes: number
  signalLossEvents: number
  category: "high_usage" | "battery_drain_hotspot" | "dead_zone" | "normal"
}

export default function HeatmapAnalysis() {
  const [selectedLayer, setSelectedLayer] = useState("usage_density")
  const [gridSize, setGridSize] = useState(500) // meters
  const [timeRange, setTimeRange] = useState("24h")
  const [intensityThreshold, setIntensityThreshold] = useState(50)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock heatmap data
  const heatmapData: HeatmapPoint[] = [
    {
      lat: 6.9271,
      lng: 79.8612,
      intensity: 0.95,
      count: 2340,
      batteryDrain: 15.2,
      avgSpeed: 18.5,
      alertCount: 12,
    },
    {
      lat: 6.9319,
      lng: 79.8478,
      intensity: 0.87,
      count: 1876,
      batteryDrain: 12.8,
      avgSpeed: 22.1,
      alertCount: 8,
    },
    {
      lat: 6.9156,
      lng: 79.8567,
      intensity: 0.78,
      count: 1654,
      batteryDrain: 18.9,
      avgSpeed: 15.3,
      alertCount: 15,
    },
    {
      lat: 6.9234,
      lng: 79.8723,
      intensity: 0.65,
      count: 1432,
      batteryDrain: 11.4,
      avgSpeed: 25.7,
      alertCount: 5,
    },
    {
      lat: 7.2906,
      lng: 80.6337,
      intensity: 0.52,
      count: 1298,
      batteryDrain: 14.6,
      avgSpeed: 20.8,
      alertCount: 7,
    },
    {
      lat: 6.0535,
      lng: 80.221,
      intensity: 0.43,
      count: 987,
      batteryDrain: 9.8,
      avgSpeed: 28.2,
      alertCount: 3,
    },
  ]

  // Mock grid cell data
  const gridCells: GridCell[] = [
    {
      id: "GRID_001",
      lat: 6.9271,
      lng: 79.8612,
      size: 500,
      tripCount: 2340,
      batteryDrainEvents: 45,
      avgBatteryDrain: 15.2,
      deadZoneMinutes: 12,
      signalLossEvents: 3,
      category: "high_usage",
    },
    {
      id: "GRID_002",
      lat: 6.9319,
      lng: 79.8478,
      size: 500,
      tripCount: 1876,
      batteryDrainEvents: 67,
      avgBatteryDrain: 18.9,
      deadZoneMinutes: 8,
      signalLossEvents: 2,
      category: "battery_drain_hotspot",
    },
    {
      id: "GRID_003",
      lat: 6.9156,
      lng: 79.8567,
      size: 500,
      tripCount: 234,
      batteryDrainEvents: 12,
      avgBatteryDrain: 8.4,
      deadZoneMinutes: 145,
      signalLossEvents: 23,
      category: "dead_zone",
    },
    {
      id: "GRID_004",
      lat: 6.9234,
      lng: 79.8723,
      size: 500,
      tripCount: 1432,
      batteryDrainEvents: 23,
      avgBatteryDrain: 11.4,
      deadZoneMinutes: 5,
      signalLossEvents: 1,
      category: "normal",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "high_usage":
        return "#10b981" // green
      case "battery_drain_hotspot":
        return "#ef4444" // red
      case "dead_zone":
        return "#6b7280" // gray
      case "normal":
        return "#3b82f6" // blue
      default:
        return "#8b5cf6" // purple
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "high_usage":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "battery_drain_hotspot":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "dead_zone":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "normal":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "high_usage":
        return "High Usage"
      case "battery_drain_hotspot":
        return "Battery Drain Hotspot"
      case "dead_zone":
        return "Dead Zone"
      case "normal":
        return "Normal"
      default:
        return "Unknown"
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  // Prepare map data based on selected layer
  const getMapData = () => {
    switch (selectedLayer) {
      case "usage_density":
        return {
          markers: heatmapData.map((point) => ({
            position: [point.lat, point.lng] as [number, number],
            popup: `<strong>Usage Density</strong><br>Trips: ${point.count}<br>Intensity: ${(point.intensity * 100).toFixed(1)}%`,
            color: point.intensity > 0.7 ? "#ef4444" : point.intensity > 0.5 ? "#f59e0b" : "#10b981",
            size: point.intensity > 0.7 ? "large" : point.intensity > 0.5 ? "medium" : "small",
          })),
          clusters: heatmapData.map((point) => ({
            center: [point.lat, point.lng] as [number, number],
            radius: point.intensity * 1000,
            color: "#06b6d4",
            fillColor: "#06b6d4",
            fillOpacity: point.intensity * 0.4,
          })),
        }
      case "battery_drain":
        return {
          markers: heatmapData
            .filter((point) => point.batteryDrain && point.batteryDrain > 10)
            .map((point) => ({
              position: [point.lat, point.lng] as [number, number],
              popup: `<strong>Battery Drain Hotspot</strong><br>Avg Drain: ${point.batteryDrain}%<br>Trips: ${point.count}`,
              color: point.batteryDrain! > 15 ? "#ef4444" : "#f59e0b",
              icon: "battery",
            })),
          clusters: [],
        }
      case "dead_zones":
        return {
          markers: gridCells
            .filter((cell) => cell.category === "dead_zone")
            .map((cell) => ({
              position: [cell.lat, cell.lng] as [number, number],
              popup: `<strong>Dead Zone</strong><br>Signal Loss: ${cell.signalLossEvents} events<br>Dead Time: ${cell.deadZoneMinutes}min`,
              color: "#6b7280",
              icon: "alert",
            })),
          clusters: [],
        }
      default:
        return { markers: [], clusters: [] }
    }
  }

  const mapData = getMapData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Heatmap Analysis</h1>
          <p className="text-slate-400">GPS density analysis with grid-based aggregation and hotspot detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
            <Settings className="mr-2 h-4 w-4" />
            Configure Grid
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Analysis Controls */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100">Analysis Configuration</CardTitle>
          <CardDescription className="text-slate-400">
            Configure heatmap parameters and visualization settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Layer Type</Label>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage_density">Usage Density</SelectItem>
                  <SelectItem value="battery_drain">Battery Drain Hotspots</SelectItem>
                  <SelectItem value="dead_zones">Dead Zones</SelectItem>
                  <SelectItem value="signal_loss">Signal Loss Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Grid Size</Label>
              <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number.parseInt(value))}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="250">250m x 250m</SelectItem>
                  <SelectItem value="500">500m x 500m</SelectItem>
                  <SelectItem value="1000">1km x 1km</SelectItem>
                  <SelectItem value="2000">2km x 2km</SelectItem>
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
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Map className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-slate-300 flex items-center justify-between">
              <span>Intensity Threshold</span>
              <span className="text-cyan-400">{intensityThreshold}%</span>
            </Label>
            <Slider
              value={[intensityThreshold]}
              onValueChange={(value) => setIntensityThreshold(value[0])}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Map className="mr-2 h-5 w-5 text-cyan-500" />
            Heatmap Visualization
          </CardTitle>
          <CardDescription className="text-slate-400">
            Interactive map showing {selectedLayer.replace("_", " ")} analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CartoMap
            center={[6.9271, 79.8612]}
            zoom={12}
            markers={mapData.markers}
            clusters={mapData.clusters}
            height="500px"
          />
        </CardContent>
      </Card>

      {/* Grid Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Grid Cell Analysis</CardTitle>
            <CardDescription className="text-slate-400">
              {gridSize}m x {gridSize}m grid aggregation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gridCells.map((cell) => (
                <div key={cell.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-slate-300 font-medium">{cell.id}</h4>
                    <Badge className={getCategoryBadgeColor(cell.category)}>{getCategoryName(cell.category)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Trips:</span>
                      <span className="text-slate-300 ml-2">{cell.tripCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Battery Events:</span>
                      <span className="text-slate-300 ml-2">{cell.batteryDrainEvents}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg Drain:</span>
                      <span className="text-slate-300 ml-2">{cell.avgBatteryDrain}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dead Time:</span>
                      <span className="text-slate-300 ml-2">{cell.deadZoneMinutes}min</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Signal Loss:</span>
                      <span className="text-slate-300 ml-2">{cell.signalLossEvents} events</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-300 ml-2">
                        {cell.lat.toFixed(4)}, {cell.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Hotspot Summary</CardTitle>
            <CardDescription className="text-slate-400">Key insights from heatmap analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="h-5 w-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">Battery Drain Hotspots</h4>
                </div>
                <p className="text-slate-300 text-sm mb-2">2 locations with &gt;15% battery drain detected</p>
                <div className="text-xs text-slate-400">
                  <div>• Colombo Central: 18.9% avg drain</div>
                  <div>• Kandy Hills: 15.2% avg drain</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                  <h4 className="text-gray-400 font-medium">Dead Zones</h4>
                </div>
                <p className="text-slate-300 text-sm mb-2">1 area with significant signal loss identified</p>
                <div className="text-xs text-slate-400">
                  <div>• Grid GRID_003: 145min dead time, 23 signal loss events</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <h4 className="text-green-400 font-medium">High Usage Areas</h4>
                </div>
                <p className="text-slate-300 text-sm mb-2">1 high-density usage corridor identified</p>
                <div className="text-xs text-slate-400">
                  <div>• Colombo Fort Hub: 2,340 trips, 95% intensity</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <h4 className="text-blue-400 font-medium">Recommendations</h4>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>• Install additional charging stations in hotspot areas</div>
                  <div>• Investigate signal infrastructure in dead zones</div>
                  <div>• Optimize routes to avoid high drain locations</div>
                  <div>• Monitor battery health in affected vehicles</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
