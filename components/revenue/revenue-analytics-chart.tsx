"use client";

import { useState, useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ComposedChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";

interface RevenueAnalyticsChartProps {
  filters?: {
    aggregation?: "daily" | "monthly" | "quarterly" | "annually";
    selectedAreas?: string[];
    selectedStations?: string[];
  };
  data?: any[]; // monthlySwapEfficiency or your time-series data
  loading?: boolean;
  error?: string;
}

export function RevenueAnalyticsChart({
  filters,
  data = [],
  loading = false,
  error,
}: RevenueAnalyticsChartProps) {
  const [viewType, setViewType] = useState<"daily" | "hourly">("daily");

  // Transform your data into the format needed for charts
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { daily: [], hourly: [] };
    }

    // Process your actual data structure
    const processedData = data.map((item, index) => {
      // Adapt based on your actual data structure
      // This assumes your data has properties like: date, revenue, swaps, etc.
      const revenue =
        item.revenue || item.totalRevenue || item.total_revenue || 0;
      const swaps = item.swaps || item.totalSwaps || item.total_swaps || 0;
      const efficiency =
        item.averageEfficiency ||
        item.swapEfficiency ||
        item.swap_efficiency ||
        Math.min(100);
      const avgPerSwap =
        item.avgPerSwap ||
        item.revenuePerSwap ||
        item.revenue_per_swap ||
        (revenue && swaps ? revenue / swaps : 0);

      return {
        // For daily view - adapt field names based on your actual data
        date: item.date || item.period || item.month || `Day ${index + 1}`,
        revenue,
        swaps,
        avgPerSwap,
        efficiency,
        optimalRevenue: revenue / (efficiency / 100), // Calculate optimal revenue
        // For hourly view (if you have hourly data)
        hour:
          item.hour || item.time || `${String(index % 24).padStart(2, "0")}:00`,
      };
    });

    // Generate hourly data if not available (optional - you might want to remove this)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = `${String(hour).padStart(2, "0")}:00`;
      const dailyAvg =
        processedData.reduce((sum, d) => sum + d.revenue, 0) /
          processedData.length || 0;
      const swapAvg =
        processedData.reduce((sum, d) => sum + d.swaps, 0) /
          processedData.length || 0;

      // Simulate hourly distribution (peak hours: 7-9, 17-19)
      const peakMultiplier =
        (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
          ? 1.5
          : hour >= 1 && hour <= 5
          ? 0.3
          : 1;

      const revenue = Math.round((dailyAvg * peakMultiplier) / 24);
      const swaps = Math.round((swapAvg * peakMultiplier) / 24);
      const efficiency = Math.min(100, Math.max(70, 85 + Math.random() * 15));

      return {
        hour: hourStr,
        revenue,
        swaps,
        avgPerSwap: dailyAvg / swapAvg || 8.0,
        efficiency,
        optimalRevenue: revenue / (efficiency / 100),
      };
    });

    return {
      daily: processedData,
      hourly: hourlyData,
    };
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-[400px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load chart data
            </p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!chartData.daily.length && !chartData.hourly.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No chart data available
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your filters or check back later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentData = viewType === "daily" ? chartData.daily : chartData.hourly;
  const timeKey = viewType === "daily" ? "date" : "hour";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* <Button
            variant={viewType === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("daily")}
            disabled={!chartData.daily.length}
          >
            Daily View
          </Button>
          <Button
            variant={viewType === "hourly" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("hourly")}
            disabled={!chartData.hourly.length}
          >
            Hourly View
          </Button> */}
        </div>

        {/* Data summary */}
        <div className="text-xs text-muted-foreground">
          {currentData.length} data points
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue from Swaps</TabsTrigger>
          <TabsTrigger value="combined">Revenue vs Swaps</TabsTrigger>
          <TabsTrigger value="efficiency">Swap Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={timeKey}
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
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {viewType === "daily" ? "Date" : "Hour"}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {label}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold">
                              ${payload[0].value?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Battery Swaps
                            </span>
                            <span className="font-bold">
                              {data.swaps?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Avg per Swap
                            </span>
                            <span className="font-bold">
                              ${data.avgPerSwap?.toFixed(2)}
                            </span>
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
        </TabsContent>

        <TabsContent value="combined">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={timeKey}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <div className="font-bold">
                                ${payload[0]?.value?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Battery Swaps
                              </span>
                              <div className="font-bold">
                                {payload[1]?.value?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="hsl(var(--primary))"
                opacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="swaps"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="efficiency">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={timeKey}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={[70, 100]}
              />
              <YAxis
                yAxisId="optimal"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                hide // Hide this axis as we're using it just for the optimal revenue line
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Battery Swaps
                              </span>
                              <div className="font-bold">
                                {data.swaps?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Efficiency
                              </span>
                              <div className="font-bold">
                                {data.efficiency}%
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <div className="font-bold">
                                ${data.revenue?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Optimal Revenue
                              </span>
                              <div className="font-bold">
                                $
                                {data.optimalRevenue
                                  ?.toFixed(0)
                                  ?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="swaps"
                fill="hsl(var(--chart-2))"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 5 }}
              />
              <Line
                yAxisId="optimal"
                type="monotone"
                dataKey="optimalRevenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                // strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Optimal Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
