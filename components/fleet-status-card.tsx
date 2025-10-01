import { Card, CardContent } from "@/components/ui/card"
import { Battery, Cpu, MapPin, AlertTriangle } from "lucide-react"
import StatusItem from "./status-item"
import { Skeleton } from "@/components/ui/skeleton"

interface FleetStatusCardProps {
  data: {
    totalScooters: number
    activeScooters: number
    inactiveScooters: number
    alertsCount: number
    batteryAvg: number
    motorHealth: number
  }
  isLoading: boolean
}

export default function FleetStatusCard({ data, isLoading }: FleetStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { totalScooters, activeScooters, inactiveScooters, alertsCount, batteryAvg, motorHealth } = data

  // Calculate status based on values
  const getAlertStatus = (count: number) => (count > 10 ? "critical" : count > 5 ? "warning" : "normal")
  const getBatteryStatus = (avg: number) => (avg < 30 ? "critical" : avg < 50 ? "warning" : "normal")
  const getMotorStatus = (health: number) => (health < 70 ? "critical" : health < 85 ? "warning" : "normal")

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatusItem label="Total Scooters" value={totalScooters} icon={<MapPin className="h-5 w-5" />} />
          <StatusItem label="Active" value={activeScooters} status="normal" icon={<MapPin className="h-5 w-5" />} />
          <StatusItem
            label="Inactive"
            value={inactiveScooters}
            status={inactiveScooters > totalScooters * 0.3 ? "warning" : "normal"}
            icon={<MapPin className="h-5 w-5" />}
          />
          <StatusItem
            label="Alerts"
            value={alertsCount}
            status={getAlertStatus(alertsCount)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatusItem
            label="Avg Battery"
            value={`${batteryAvg}%`}
            status={getBatteryStatus(batteryAvg)}
            icon={<Battery className="h-5 w-5" />}
          />
          <StatusItem
            label="Motor Health"
            value={`${motorHealth}%`}
            status={getMotorStatus(motorHealth)}
            icon={<Cpu className="h-5 w-5" />}
          />
        </div>
      </CardContent>
    </Card>
  )
}
