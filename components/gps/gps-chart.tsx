"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GPSChartProps {
  filters?: {
    aggregation: "daily" | "monthly" | "quarterly" | "annually";
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
  data?: Array<{
    date: string;
    GPS: number;
  }>;
  loading?: boolean;
}

export function GPSChart({ filters, data, loading = false }: GPSChartProps) {
  // Skeleton while loading
  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Distance travelled</CardTitle>
          <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="pl-2 h-64">
          <div className="w-full h-full bg-muted rounded-md animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Distance travelled</CardTitle>
          <p className="text-sm text-muted-foreground">
            No GPS data available for the selected period.
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No data to display
        </CardContent>
      </Card>
    );
  }

  // Format date based on aggregation
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!filters?.aggregation) return date.toLocaleDateString();

    switch (filters.aggregation) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "monthly":
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
      case "quarterly":
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      case "annually":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform chart data
  const chartData = data.map((entry) => ({
    date: formatDate(entry.date),
    distance: entry.GPS,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Total Distance travelled over time</CardTitle>
        <p className="text-sm text-muted-foreground">
          {filters?.aggregation
            ? `${
                filters.aggregation.charAt(0).toUpperCase() +
                filters.aggregation.slice(1)
              } `
            : ""}
          GPS data from{" "}
          {filters?.dateRange?.from?.toLocaleDateString() || "start"} to{" "}
          {filters?.dateRange?.to?.toLocaleDateString() || "end"}
        </p>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
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
                          {payload[0].value.toLocaleString()} km
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
