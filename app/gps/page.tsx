"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GPSFilters } from "@/components/gps/gps-filters";
import { GPSMetrics } from "@/components/gps/gps-metrics";
import { GPSChart } from "@/components/gps/gps-chart";
import { TopPerformingScooters } from "@/components/gps/top";
import { DistanceByBatteryType } from "@/components/gps/DistanceByBatteryType";
import GPSMap from "@/components/gps/GPSMap";
import CustomizableMap from "@/components/gps/canvas-map";

export default function GPSPage() {
  const [filters, setFilters] = useState<GPSFilters>({
    quickTime: "last_year",
    dateRange: undefined,
    aggregation: "monthly",
    selectedTboxes: [],
    selectedBmses: [],
    selectedBatteryTypes: [],
  });

  const GPSData = [
    { date: "2024-01", GPS: 10000 },
    { date: "2024-02", GPS: 12000 },
    { date: "2024-03", GPS: 9000 },
    { date: "2024-04", GPS: 14000 },
    { date: "2024-05", GPS: 16000 },
    { date: "2024-06", GPS: 13000 },
  ];

  const topScootersData = [
    {
      scooterId: "A001",
      model: "Scooter A",
      totalDistance: 8000,
      averageDailyDistance: 42.1,
      lastUsed: "2024-07-26",
      status: "active",
      area: "Colombo",
    },
    {
      scooterId: "B002",
      model: "Scooter B",
      totalDistance: 7000,
      averageDailyDistance: 38.7,
      lastUsed: "2024-07-25",
      status: "maintenance",
      area: "Kandy",
    },
    {
      scooterId: "C003",
      model: "Scooter C",
      totalDistance: 6000,
      averageDailyDistance: 35.5,
      lastUsed: "2024-07-24",
      status: "inactive",
      area: "Galle",
    },
    {
      scooterId: "D004",
      model: "Scooter D",
      totalDistance: 5000,
      averageDailyDistance: 30.2,
      lastUsed: "2024-07-23",
      status: "active",
      area: "Jaffna",
    },
    {
      scooterId: "E005",
      model: "Scooter E",
      totalDistance: 4000,
      averageDailyDistance: 28.9,
      lastUsed: "2024-07-22",
      status: "inactive",
      area: "Negombo",
    },
    {
      scooterId: "F006",
      model: "Scooter F",
      totalDistance: 3000,
      averageDailyDistance: 25.4,
      lastUsed: "2024-07-21",
      status: "maintenance",
      area: "Kandy",
    },
    {
      scooterId: "G007",
      model: "Scooter G",
      totalDistance: 2000,
      averageDailyDistance: 20.1,
      lastUsed: "2024-07-20",
      status: "active",
      area: "Colombo",
    },
  ];

  // ✅ NEW GPS-by-Area-based distance data (by battery type)
  const batteryTypeAreaData = [
    { BATTERY_TYPE: "Li-ion", AREA: "Colombo", TOTAL_DISTANCE: 15000 },
    { BATTERY_TYPE: "Li-ion", AREA: "Kandy", TOTAL_DISTANCE: 10000 },
    { BATTERY_TYPE: "Lead Acid", AREA: "Galle", TOTAL_DISTANCE: 7000 },
    { BATTERY_TYPE: "NiMH", AREA: "Jaffna", TOTAL_DISTANCE: 5000 },
    { BATTERY_TYPE: "Li-ion", AREA: "Negombo", TOTAL_DISTANCE: 4000 },
    { BATTERY_TYPE: "Lead Acid", AREA: "Kandy", TOTAL_DISTANCE: 3000 },
  ];

  // ✅ Transform for pie chart: Group total distance by BATTERY_TYPE
  const batteryTypeDistanceData = useMemo(() => {
    const map = new Map<string, number>();

    batteryTypeAreaData.forEach((entry) => {
      const { BATTERY_TYPE, TOTAL_DISTANCE } = entry;
      if (map.has(BATTERY_TYPE)) {
        map.set(BATTERY_TYPE, map.get(BATTERY_TYPE)! + TOTAL_DISTANCE);
      } else {
        map.set(BATTERY_TYPE, TOTAL_DISTANCE);
      }
    });

    return Array.from(map.entries()).map(([BATTERY_TYPE, TOTAL_DISTANCE]) => ({
      BATTERY_TYPE,
      TOTAL_DISTANCE,
    }));
  }, [batteryTypeAreaData]);

  const isDateRangeSet =
    filters.dateRange &&
    filters.dateRange.from instanceof Date &&
    filters.dateRange.to instanceof Date;

  const handleFiltersChange = (newFilters: GPSFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPS Overview</h2>
      </div>

      <GPSFilters onFiltersChange={handleFiltersChange} />

      {isDateRangeSet ? (
        <>
          <GPSMetrics GPSData={GPSData} filters={filters} />

          {/* <div className="bg-red-600 h-[500px]">
            <CustomizableMap
              element={{
                id: "map-01",
                type: "map",
                position: { x: 0, y: 0 },
                size: { width: 600, height: 400 },
                config: {
                  latitudeField: { id: "latitude", name: "Latitude" },
                  longitudeField: { id: "longitude", name: "Longitude" },
                  sizeField: "utilization_rate",
                  colorField: "area",
                  pingSpeedField: { id: "ping_speed", name: "Ping Speed" },
                  showLegend: true,
                  center: { lat: 7, lng: 80 },
                  zoom: 6,
                  categoryField: "type",
                },
              }}
              dataSources={[
                {
                  id: "mapData",
                  name: "Station Points",
                  data: [
                    {
                      id: "1",
                      name: "Station Alpha",
                      latitude: 7.123456,
                      longitude: 80.123456,
                      type: "Battery Swap",
                      area: "Ampara",
                      utilization_rate: 75,
                      ping_speed: 100,
                      timestamp: "2024-07-01T08:00:00Z",
                      status: "active",
                    },
                    {
                      id: "2",
                      name: "Station Beta",
                      latitude: 6.987654,
                      longitude: 79.876543,
                      type: "Battery Swap",
                      area: "Colombo",
                      utilization_rate: 90,
                      ping_speed: 85,
                      timestamp: "2024-07-01T08:05:00Z",
                      status: "warning",
                    },
                  ],
                },
              ]}
            />
          </div> */}
          <div className="grid gap-4">
            <GPSChart filters={filters} data={GPSData} loading={false} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TopPerformingScooters filters={filters} data={topScootersData} />

            {/* 🥧 Replaced GPS by Area with Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distance by Battery Type</CardTitle>
                <CardDescription>
                  Proportion of total distance travelled by battery types across
                  all areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <DistanceByBatteryType
                  filters={filters}
                  data={batteryTypeDistanceData}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-muted-foreground">
            Please select a valid date range to view GPS data.
          </p>
        </div>
      )}
    </div>
  );
}
