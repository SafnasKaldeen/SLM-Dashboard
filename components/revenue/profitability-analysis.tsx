"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useProfit, ProfitFilters } from "@/hooks/Snowflake/useProfit";

interface ProfitabilityAnalysisProps {
  filters?: ProfitFilters;
}

// Skeleton component for loading states
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`} />
);

export function ProfitabilityAnalysis({ filters }: ProfitabilityAnalysisProps) {
  const [viewType, setViewType] = useState<
    "overview" | "trends" | "areas" | "efficiency"
  >("overview");

  const { data, loading, error } = useProfit(filters);

  // Transform API data for charts
  const transformedData = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return { monthlyData: [], areaData: [] };
    }

    // Group by date for monthly trends
    const monthlyGroups = data.data.reduce((acc, item) => {
      const date = new Date(item.DATE);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          revenue: 0,
          expenses: 0,
          profit: 0,
          swapCount: 0,
        };
      }

      acc[monthYear].revenue += item.TOTAL_REVENUE;
      acc[monthYear].expenses += item.TOTAL_EXPENSES;
      acc[monthYear].profit += item.TOTAL_PROFIT;
      acc[monthYear].swapCount += 1;

      return acc;
    }, {} as Record<string, any>);

    const monthlyData = Object.values(monthlyGroups).map((month: any) => ({
      ...month,
      profitMargin:
        month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0,
      breakEvenSwaps:
        month.expenses > 0
          ? Math.ceil(month.expenses / (month.revenue / month.swapCount))
          : 0,
      actualSwaps: month.swapCount,
      ROI: month.expenses > 0 ? (month.profit / month.expenses) * 100 : 0, // <-- ADD THIS
    }));

    // Group by location for area analysis
    const areaGroups = data.data.reduce((acc, item) => {
      const location = item.LOCATION;

      if (!acc[location]) {
        acc[location] = {
          area: location,
          revenue: 0,
          expenses: 0,
          profit: 0,
          stations: new Set(),
        };
      }

      acc[location].revenue += item.TOTAL_REVENUE;
      acc[location].expenses += item.TOTAL_EXPENSES;
      acc[location].profit += item.TOTAL_PROFIT;
      acc[location].stations.add(item.STATIONNAME);

      return acc;
    }, {} as Record<string, any>);

    const areaData = Object.values(areaGroups).map((area: any) => ({
      ...area,
      stations: area.stations.size,
      profitMargin: area.revenue > 0 ? (area.profit / area.revenue) * 100 : 0,
      roi: area.expenses > 0 ? (area.profit / area.expenses) * 100 : 0,
    }));

    return { monthlyData, areaData };
  }, [data]);

  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    if (!data) {
      return {
        totalProfit: 0,
        profitMargin: 0,
        breakEvenSwaps: 0,
        profitGrowth: 0,
        safetyMargin: 0,
      };
    }

    // Use optional chaining (?.) and nullish coalescing (??) for safer access
    const totalProfit = data.TOTAL_PROFIT ?? 0;
    const profitMargin = data.PROFIT_MARGINE ?? 0;
    const breakEvenSwaps = data.BREAK_EVEN_SWAPS ?? 0;

    // Calculate growth compared to previous period
    const previousProfit = data["previous segment TOTAL_PROFIT"] ?? 0;
    const profitGrowth =
      previousProfit > 0
        ? ((totalProfit - previousProfit) / previousProfit) * 100
        : 0;

    // Calculate safety margin
    // Ensure data.data is an array before accessing .length
    const actualSwaps = data.data?.length ?? 0;
    const safetyMargin =
      breakEvenSwaps > 0
        ? ((actualSwaps - breakEvenSwaps) / breakEvenSwaps) * 100
        : 0;

    return {
      totalProfit,
      profitMargin,
      breakEvenSwaps,
      profitGrowth,
      safetyMargin,
    };
  }, [data]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metric cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>

          {/* Skeleton for chart */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error or no data state
  if (error || !data || !data.data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-semibold">
                {error ? "Error Loading Data" : "No Data Available"}
              </h3>
              <p className="text-muted-foreground">
                {error
                  ? "There was an error loading the profitability data. Please try again."
                  : "No profit data found for the selected filters. Try adjusting your date range or location filters."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profitability Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentMetrics.totalProfit.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {currentMetrics.profitGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  currentMetrics.profitGrowth >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {currentMetrics.profitGrowth >= 0 ? "+" : ""}
                {currentMetrics.profitGrowth.toFixed(1)}%
              </span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentMetrics.profitMargin.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data["previous segment PROFIT_MARGINE"] ? (
                <>
                  {currentMetrics.profitMargin >=
                  data["previous segment PROFIT_MARGINE"] ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      currentMetrics.profitMargin >=
                      data["previous segment PROFIT_MARGINE"]
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {(
                      currentMetrics.profitMargin -
                      data["previous segment PROFIT_MARGINE"]
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="ml-1">vs previous period</span>
                </>
              ) : (
                <span className="text-muted-foreground">Current period</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Break-even Swaps
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentMetrics.breakEvenSwaps.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-muted-foreground">for selected period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentMetrics.safetyMargin.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-muted-foreground">above break-even</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs
        value={viewType}
        onValueChange={(value: any) => setViewType(value)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="areas">By Area</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses vs Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={transformedData.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="font-medium mb-2">{label}</div>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Revenue:
                                </span>
                                <span className="font-bold text-green-600">
                                  {data.revenue.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Expenses:
                                </span>
                                <span className="font-bold text-red-600">
                                  {data.expenses.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Profit:
                                </span>
                                <span className="font-bold text-blue-600">
                                  {data.profit.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Margin:
                                </span>
                                <span className="font-bold">
                                  {data.profitMargin.toFixed(1)}%
                                </span>
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
                    fill="hsl(var(--chart-1))"
                    name="Revenue"
                    opacity={0.8}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="expenses"
                    fill="hsl(var(--chart-2))"
                    name="Expenses"
                    opacity={0.8}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="profitMargin"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    name="Profit Margin %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={transformedData.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Monthly Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="grid gap-4">
            {transformedData.areaData.map((area) => (
              <Card key={area.area}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.area}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {area.stations} stations
                      </Badge>
                      <Badge
                        variant={
                          area.profitMargin > 35
                            ? "default"
                            : area.profitMargin > 25
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {area.profitMargin.toFixed(1)}% margin
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Revenue
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {area.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Expenses
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {area.expenses.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Profit
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {area.profit.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">ROI</div>
                      <div className="text-xl font-bold text-purple-600">
                        {area.roi.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profitability</span>
                      <span>{area.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${Math.min(area.profitMargin, 50)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={transformedData.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    label={{
                      value: "Percentage (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ROI"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    name="ROI (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="profitMargin"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 1, r: 4 }}
                    name="Profit Margin (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
