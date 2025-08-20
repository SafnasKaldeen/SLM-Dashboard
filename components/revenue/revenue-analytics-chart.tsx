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
  data?: any[];
  loading?: boolean;
  error?: string;
}

export function RevenueAnalyticsChart({
  filters,
  data = [],
  loading = false,
  error,
}: RevenueAnalyticsChartProps) {
  // Get the aggregation level from filters, default to daily since your data appears to be daily
  const aggregation = filters?.aggregation || "daily";

  // Transform your data into the format needed for charts
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Process your actual data structure - mapping to your exact field names
    const processedData = data.map((item, index) => {
      const revenue = item.TOTAL_REVENUE || 0;
      const swaps = item.TOTAL_SWAPS || 0;
      const efficiency = item.SWAP_EFFICIENCY || 0;
      const avgPerSwap = item.AVERAGE_REVENUE_PER_SWAP || 0;
      const date = item.DATE || `Day ${index + 1}`;

      // Format the period label based on aggregation
      let periodLabel;

      if (aggregation === "daily") {
        // For daily view, show the date as-is or format it nicely
        const dateObj = new Date(date);
        periodLabel = isNaN(dateObj.getTime())
          ? date
          : dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      } else if (aggregation === "monthly") {
        // For monthly, group by month
        const dateObj = new Date(date);
        periodLabel = isNaN(dateObj.getTime())
          ? date
          : dateObj.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
      } else if (aggregation === "quarterly") {
        // For quarterly, group by quarter
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
          periodLabel = `Q${quarter} ${dateObj.getFullYear()}`;
        } else {
          periodLabel = date;
        }
      } else {
        // For annually, group by year
        const dateObj = new Date(date);
        periodLabel = isNaN(dateObj.getTime())
          ? date
          : dateObj.getFullYear().toString();
      }

      // Calculate optimal revenue (what revenue would be at 100% efficiency)
      const optimalRevenue =
        efficiency > 0 ? (revenue / efficiency) * 100 : revenue;

      return {
        period: periodLabel,
        revenue,
        swaps,
        avgPerSwap,
        efficiency,
        optimalRevenue,
        date: date, // Keep original date for sorting if needed
      };
    });

    return processedData;
  }, [data, aggregation]);

  // Get display labels based on aggregation
  const getDisplayLabels = () => {
    switch (aggregation) {
      case "daily":
        return {
          periodLabel: "Date",
          title: "Revenue from Swaps",
          combinedTitle: "Revenue vs Swaps",
          efficiencyTitle: "Swap Efficiency",
        };
      case "monthly":
        return {
          periodLabel: "Month",
          title: "Revenue from Swaps",
          combinedTitle: "Revenue vs Swaps",
          efficiencyTitle: "Swap Efficiency",
        };
      case "quarterly":
        return {
          periodLabel: "Quarter",
          title: "Revenue from Swaps",
          combinedTitle: "Revenue vs Swaps",
          efficiencyTitle: "Swap Efficiency",
        };
      case "annually":
        return {
          periodLabel: "Year",
          title: "Revenue from Swaps",
          combinedTitle: "Revenue vs Swaps",
          efficiencyTitle: "Swap Efficiency",
        };
      default:
        return {
          periodLabel: "Period",
          title: "Revenue from Swaps",
          combinedTitle: "Revenue vs Swaps",
          efficiencyTitle: "Swap Efficiency",
        };
    }
  };

  const labels = getDisplayLabels();

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
  if (!chartData.length) {
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

  // Calculate some summary stats
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSwaps = chartData.reduce((sum, item) => sum + item.swaps, 0);
  const avgEfficiency =
    chartData.reduce((sum, item) => sum + item.efficiency, 0) /
    chartData.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Show current aggregation level and summary stats */}
        <div className="text-sm text-muted-foreground capitalize">
          {aggregation} View • {chartData.length} data points
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">{labels.title}</TabsTrigger>
          <TabsTrigger value="combined">{labels.combinedTitle}</TabsTrigger>
          <TabsTrigger value="efficiency">{labels.efficiencyTitle}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
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
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {labels.periodLabel}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {label}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold text-primary">
                              {payload[0].value?.toLocaleString()}
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
                              {data.avgPerSwap?.toFixed(2)}
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
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                label={{
                  value: "Revenue",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                label={{ value: "Swaps", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <div className="font-bold text-primary">
                                {data.revenue?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Battery Swaps
                              </span>
                              <div className="font-bold text-orange-600">
                                {data.swaps?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Avg per Swap
                              </span>
                              <div className="font-bold">
                                {data.avgPerSwap?.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Efficiency
                              </span>
                              <div className="font-bold">
                                {data.efficiency?.toFixed(1)}%
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
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="swaps"
                stroke="#ea580c"
                strokeWidth={3}
                dot={{ fill: "#ea580c", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#ea580c" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="efficiency">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="swaps"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                label={{
                  value: "Battery Swaps",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="efficiency"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                // domain={[90, 100]}
                label={{
                  value: "Efficiency (%)",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const revenueGap = data.optimalRevenue - data.revenue;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{label}</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Battery Swaps
                              </span>
                              <div className="font-bold text-blue-600">
                                {data.swaps?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Efficiency
                              </span>
                              <div className="font-bold text-green-600">
                                {data.efficiency?.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Actual Revenue
                              </span>
                              <div className="font-bold text-primary">
                                {data.revenue?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Potential Revenue
                              </span>
                              <div className="font-bold text-green-600">
                                {data.optimalRevenue
                                  ?.toFixed(0)
                                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              </div>
                            </div>
                            {revenueGap > 0 && (
                              <div className="col-span-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Revenue Gap
                                </span>
                                <div className="font-bold text-red-500">
                                  -
                                  {revenueGap
                                    ?.toFixed(0)
                                    ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="swaps"
                dataKey="swaps"
                fill="#3b82f6"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="efficiency"
                type="monotone"
                dataKey="efficiency"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: "#16a34a", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "#16a34a" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Demo component to show the chart with your sample data
export default function Demo() {
  const sampleData = [
    {
      AVERAGE_REVENUE_PER_SWAP: 250,
      DATE: "2025-05-01",
      SWAP_EFFICIENCY: 100,
      TOTAL_REVENUE: 4750,
      TOTAL_SWAPS: 19,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 246.739130435,
      DATE: "2025-05-02",
      SWAP_EFFICIENCY: 98.717692308,
      TOTAL_REVENUE: 5675,
      TOTAL_SWAPS: 23,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 247,
      DATE: "2025-05-03",
      SWAP_EFFICIENCY: 98.727272727,
      TOTAL_REVENUE: 6175,
      TOTAL_SWAPS: 25,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 247.115384615,
      DATE: "2025-05-04",
      SWAP_EFFICIENCY: 98.541666667,
      TOTAL_REVENUE: 6425,
      TOTAL_SWAPS: 26,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 245.967741935,
      DATE: "2025-05-05",
      SWAP_EFFICIENCY: 98.214285714,
      TOTAL_REVENUE: 7625,
      TOTAL_SWAPS: 31,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 246.739130435,
      DATE: "2025-05-06",
      SWAP_EFFICIENCY: 99.242727273,
      TOTAL_REVENUE: 5675,
      TOTAL_SWAPS: 23,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 246.052631579,
      DATE: "2025-05-07",
      SWAP_EFFICIENCY: 98.148888889,
      TOTAL_REVENUE: 4675,
      TOTAL_SWAPS: 19,
    },
    {
      AVERAGE_REVENUE_PER_SWAP: 250,
      DATE: "2025-05-08",
      SWAP_EFFICIENCY: 100,
      TOTAL_REVENUE: 5000,
      TOTAL_SWAPS: 20,
    },
  ];

  const [selectedAggregation, setSelectedAggregation] = useState("daily");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Battery Swap Revenue Analytics</h2>
        <div className="flex gap-2">
          {["daily", "monthly", "quarterly", "annually"].map((agg) => (
            <Button
              key={agg}
              variant={selectedAggregation === agg ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAggregation(agg)}
              className="capitalize"
            >
              {agg}
            </Button>
          ))}
        </div>
      </div>

      <RevenueAnalyticsChart
        filters={{ aggregation: selectedAggregation as any }}
        data={sampleData}
        loading={false}
        error={undefined}
      />
    </div>
  );
}
