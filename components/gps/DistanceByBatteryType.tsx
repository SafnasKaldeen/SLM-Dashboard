"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { GPSFilters } from "@/types/gps";

interface BatteryData {
  BATTERY_NAME: string;
  TOTAL_DISTANCE: number;
  VEHICLE_COUNT: number;
}

const batteryTypeColors: Record<string, string> = {
  GREEN: "#10b981",
  BLUE: "#0ea5e9",
  ORANGE: "#f59e0b",
};

const allowedBatteryTypes = ["GREEN", "BLUE", "ORANGE"];
function buildBatteryDistanceQuery(
  startDate: string,
  endDate: string,
  batteryTypes: string[] = [],
  selectedScooters: string[] = [],
  selectedBms: string[] = []
) {
  const typesToFilter =
    batteryTypes.length > 0 ? batteryTypes : allowedBatteryTypes;

  const batteryFilter = `AND BATTERY_NAME IN (${typesToFilter
    .map((t) => `'${t}'`)
    .join(", ")})`;

  const scooterFilter =
    selectedScooters.length > 0
      ? `AND UPPER(TBOXID) IN (${selectedScooters
          .map((s) => `'${s.toUpperCase()}'`)
          .join(", ")})`
      : "";

  const bmsFilter =
    selectedBms.length > 0
      ? `AND UPPER(BMSID) IN (${selectedBms
          .map((b) => `'${b.toUpperCase()}'`)
          .join(", ")})`
      : "";

  return `
    SELECT 
      BATTERY_NAME,
      COUNT(DISTINCT TBOXID) AS VEHICLE_COUNT,
      SUM(DISTANCE_KM) AS TOTAL_DISTANCE
    FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
    WHERE GPS_DATE BETWEEN '${startDate}' AND '${endDate}'
      AND TBOXID IS NOT NULL
      AND DISTANCE_KM > 0
      ${batteryFilter}
      ${scooterFilter}
      ${bmsFilter}
    GROUP BY BATTERY_NAME
    ORDER BY TOTAL_DISTANCE DESC
    LIMIT 50;
  `;
}

export default function DistanceByBatteryType({
  filters,
}: {
  filters: GPSFilters;
}) {
  const [data, setData] = useState<BatteryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filters?.dateRange?.from || !filters?.dateRange?.to) {
      return;
    }

    const startDate = format(filters.dateRange.from, "yyyy-MM-dd");
    const endDate = format(filters.dateRange.to, "yyyy-MM-dd");
    const query = buildBatteryDistanceQuery(
      startDate,
      endDate,
      filters.selectedBatteryTypes || [],
      filters.selectedScooters || [],
      filters.selectedBmses || []
    );

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching battery data with query:", query);
        const response = await axios.post("/api/query", { sql: query });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching battery data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return (
      <div className="w-full h-[300px] rounded-lg bg-background p-6">
        <div className="h-6 w-1/3 rounded-md bg-gray-300 mb-4 animate-pulse" />
        <div className="flex justify-center items-center h-[240px] gap-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full animate-pulse"
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#ddd",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No data available for selected period.</p>
      </div>
    );
  }

  const totalDistance = data.reduce(
    (sum, item) => sum + item.TOTAL_DISTANCE,
    0
  );

  const chartData = data.map((item) => ({
    name: item.BATTERY_NAME ?? "Unknown",
    value:
      totalDistance > 0
        ? Math.round((item.TOTAL_DISTANCE / totalDistance) * 100)
        : 0,
    distance: item.TOTAL_DISTANCE,
    vehicleCount: item.VEHICLE_COUNT,
    color: batteryTypeColors[item.BATTERY_NAME] ?? "#888888",
  }));

  return (
    <ResponsiveContainer width="100%" height={550}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={180}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="font-medium">{d.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {d.value}% of total distance
                    </div>
                    <div className="text-sm font-medium">
                      Distance: {d.distance.toLocaleString()} km
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vehicles: {d.vehicleCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-y-4 gap-x-2 pb-10">
              {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
