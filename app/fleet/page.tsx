"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, TrendingUp, BarChart3 } from "lucide-react";
import {
  Battery,
  Zap,
  MapPin,
  Activity,
  Users,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { FleetStatusOverview } from "@/components/fleet/fleet-status-overview";
import { FleetMaintenanceTable } from "@/components/fleet/fleet-maintenance-table";
import { FleetUtilizationChart } from "@/components/fleet/fleet-utilization-chart";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import ScooterStatusTable from "@/components/scooter-status-table";

export default function FleetPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 1, 1), // Feb 1, 2024
    to: new Date(2024, 1, 28), // Feb 28, 2024
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Fleet Management
          </h1>
          <p className="text-slate-400">
            Comprehensive overview of your EV fleet
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="w-full md:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">
                  Total Vehicles
                </p>
                <p className="text-2xl font-bold text-slate-100">128</p>
                <div className="flex items-center text-xs text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Car className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Active Now</p>
                <p className="text-2xl font-bold text-slate-100">72</p>
                <div className="flex items-center text-xs text-green-400">
                  <Activity className="h-3 w-3 mr-1" />
                  56% utilization
                </div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">
                  Avg Battery
                </p>
                <p className="text-2xl font-bold text-slate-100">78%</p>
                <div className="flex items-center text-xs text-yellow-400">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Fleet average
                </div>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Alerts</p>
                <p className="text-2xl font-bold text-slate-100">3</p>
                <div className="flex items-center text-xs text-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires attention
                </div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Fleet Utilization</CardTitle>
            <CardDescription className="text-slate-400">
              Usage patterns and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FleetUtilizationChart dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
