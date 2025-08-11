"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FleetStatusCard from "./fleet-status-card";
import ScooterStatusTable from "./scooter-status-table";
import MotorOverview from "./motor-overview";
import AlertsOverview from "./alerts-overview";
import BatteryAnalyticsChart from "@/components/BatteryAnalyticsChart";
import dynamic from "next/dynamic";
// import { FleetMap } from "./fleet/fleet-map";
const ScooterMap = dynamic(() => import("@/components/ScooterMap"), {
  ssr: false,
});
// Mock data - replace with your actual API calls
const mockFleetData = {
  totalScooters: 120,
  activeScooters: 87,
  inactiveScooters: 33,
  alertsCount: 12,
  batteryAvg: 76,
  motorHealth: 92,
};

export default function DashboardOverview() {
  const [fleetData, setFleetData] = useState(mockFleetData);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/fleet-status');
        // const data = await response.json();
        // setFleetData(data);

        // Using mock data for now
        setTimeout(() => {
          setFleetData(mockFleetData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch fleet data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <FleetStatusCard data={fleetData} isLoading={isLoading} />

      <ScooterMap />
    </div>
  );
}
