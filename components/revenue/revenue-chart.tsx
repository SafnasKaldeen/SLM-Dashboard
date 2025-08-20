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

interface RevenueChartProps {
  filters?: any;
  data?: {
    ACTIVE_STATIONS: number;
    AVG_NET_REVENUE_PER_PERIOD: number;
    data: Array<{
      PERIOD: string;
      NET_REVENUE: number;
    }>;
  };
  loading?: boolean;
}

export function RevenueChart({
  filters,
  data,
  loading = false,
}: RevenueChartProps) {
  // Skeleton while loading
  if (loading) {
    return (
      <div className="w-full h-[350px] rounded-lg bg-background p-6">
        <div className="h-6 w-1/4 rounded-md bg-gray-300 mb-4 animate-pulse" />
        <div className="h-full flex items-center justify-center">
          <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No revenue data available.
      </div>
    );
  }

  // Transform chart data
  const chartData = data.data.map((entry) => ({
    date: new Date(entry.PERIOD).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    revenue: entry.NET_REVENUE,
  }));

  return (
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
                      Revenue
                    </div>
                    <div className="text-sm font-bold">
                      {payload[0].value.toLocaleString()}
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
          dataKey="revenue"
          strokeWidth={2}
          className="stroke-primary"
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, className: "fill-primary" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
