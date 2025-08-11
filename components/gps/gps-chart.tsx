// =======================
// GPSChart Component
// =======================
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GPSFilters } from "@/types/gps";

interface GPSChartProps {
  filters: GPSFilters;
}

export function GPSChart({ filters }: GPSChartProps) {
  const [aggregatedData, setAggregatedData] = useState<
    { period: string; totalDistance: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAggregatedDistanceData = async () => {
      const {
        dateRange,
        aggregation,
        selectedTboxes,
        selectedBmses,
        selectedBatteryTypes,
      } = filters;

      if (!dateRange?.from || !dateRange?.to) {
        setAggregatedData([]);
        return;
      }

      setLoading(true);

      const startDate = format(new Date(dateRange.from), "yyyy-MM-dd");
      const endDate = format(new Date(dateRange.to), "yyyy-MM-dd");

      const query = buildAggregatedDistanceQuery(
        startDate,
        endDate,
        aggregation,
        selectedTboxes,
        selectedBmses,
        selectedBatteryTypes
      );

      // console.log("Executing GPS chart query:", query);
      try {
        const response = await fetch("/api/snowflake/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const json = await response.json();
        const rows = json || [];

        const transformed = rows.map((row: any) => ({
          period: row.PERIOD_START,
          totalDistance: row.TOTAL_DISTANCE,
        }));

        // console.log("Fetched GPS Data:", transformed);
        setAggregatedData(transformed);
      } catch (error) {
        console.error("Failed to fetch GPS chart data", error);
        setAggregatedData([]);
      } finally {
        setLoading(false);
      }
    };

    console.log("Fetching GPS data with filters:", filters);
    fetchAggregatedDistanceData();
  }, [filters]);

  // Loading skeleton
  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Distance by Period</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="w-full h-[350px] rounded-lg bg-background p-6">
            <div className="h-6 w-1/4 rounded-md bg-gray-300 mb-4 animate-pulse" />
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data message
  if (!aggregatedData || aggregatedData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Distance by Period</CardTitle>
        </CardHeader>
        <CardContent className="pl-2 flex items-center justify-center h-[350px] text-muted-foreground">
          No distance data available.
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = aggregatedData.map((entry) => ({
    date: new Date(entry.period).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    distance: entry.totalDistance,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-lg">Distance by Period</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toLocaleString()} km`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-1">
                        <div className="text-xs text-muted-foreground uppercase">
                          Period
                        </div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground uppercase mt-2">
                          Distance
                        </div>
                        <div className="text-sm font-bold">
                          {payload[0].value?.toLocaleString()} km
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="distance"
              strokeWidth={2}
              className="stroke-primary"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, className: "fill-primary" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Helper to build SQL query
function buildAggregatedDistanceQuery(
  startDate: string,
  endDate: string,
  aggregation: "daily" | "weekly" | "monthly" | "quarterly" | "annually",
  tboxes?: string[],
  bmses?: string[],
  batteryTypes?: string[]
) {
  let truncUnit = "DAY";
  if (aggregation === "weekly") truncUnit = "WEEK";
  else if (aggregation === "monthly") truncUnit = "MONTH";
  else if (aggregation === "quarterly") truncUnit = "QUARTER";
  else if (aggregation === "annually") truncUnit = "YEAR";

  const conditions = [`GPS_DATE BETWEEN '${startDate}' AND '${endDate}'`];

  if (tboxes?.length) {
    const clause = tboxes.map((id) => `'${id}'`).join(", ");
    conditions.push(`TBOXID IN (${clause})`);
  }

  if (bmses?.length) {
    const clause = bmses.map((id) => `'${id}'`).join(", ");
    conditions.push(`BMSID IN (${clause})`);
  }

  if (batteryTypes?.length) {
    const clause = batteryTypes.map((id) => `'${id}'`).join(", ");
    conditions.push(`BATTERY_TYPE_ID IN (${clause})`);
  }

  const whereClause = conditions.join(" AND ");

  return `
    SELECT 
      DATE_TRUNC('${truncUnit}', GPS_DATE) AS PERIOD_START,
      SUM(DISTANCE_KM) AS TOTAL_DISTANCE
    FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
    WHERE ${whereClause}
    GROUP BY PERIOD_START
    ORDER BY PERIOD_START;
  `;
}
