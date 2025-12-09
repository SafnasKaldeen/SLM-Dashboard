"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Home, CreditCard, Map } from "lucide-react";
import { useExpenses } from "@/hooks/Snowflake/useExpenses";

interface ExpenseAnalysisProps {
  filters?: any;
}

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`}></div>;
}

function ExpenseCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <div className="flex items-center">
          <Skeleton className="h-3 w-3 rounded mr-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function ExpenseCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ExpenseCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ChartSkeleton({ height = 300 }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Skeleton className={`w-full h-${height === 300 ? "72" : "96"}`} />
          {/* Simulate chart elements */}
          {/* <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-2 w-8" />
            ))}
          </div> */}
          <div className="absolute top-4 left-4 bottom-4 flex flex-col justify-between">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-1 w-6" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-4 w-12 mb-1" />
                    <div className="flex justify-end">
                      <Skeleton className="h-2 w-8" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend skeleton */}
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-3 w-6" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-4 h-4 rounded" />
                  ))}
                </div>
                <Skeleton className="h-3 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-24" />
                  <div className="text-right">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col justify-center h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="relative">
            <Skeleton className="w-64 h-64 rounded-full" />
            {/* Simulate pie chart segments */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TabsSkeleton() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="grid w-full grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md" />
        ))}
      </div>

      <div className="space-y-4">
        <ChartSkeleton />
      </div>
    </Tabs>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Loading indicator
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading expense data...</span>
        </div>
      </div> */}

      {/* Cards skeleton */}
      <ExpenseCardsSkeleton />

      {/* Tabs skeleton */}
      <TabsSkeleton />

      <ChartSkeleton height={500} />
    </div>
  );
}

function calculateTrend(current: number, previous: number) {
  if (previous === null || previous === undefined) return 0;
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return ((current - previous) / previous) * 100;
}

// Helper function to get color intensity based on value
function getHeatmapColor(value: number, max: number, baseColor: string) {
  if (max === 0) return "hsl(var(--muted))";
  const intensity = value / max;

  // Extract HSL values from CSS custom property
  const baseHsl = baseColor.replace("hsl(var(--", "").replace("))", "");

  switch (baseHsl) {
    case "chart-1":
      return `hsl(220 70% ${95 - intensity * 35}%)`;
    case "chart-2":
      return `hsl(160 60% ${95 - intensity * 35}%)`;
    case "chart-3":
      return `hsl(30 80% ${95 - intensity * 35}%)`;
    default:
      return `hsl(220 70% ${95 - intensity * 35}%)`;
  }
}

// Heatmap Component
function ExpenseHeatmap({ monthlyExpenseData }) {
  const maxValues = useMemo(() => {
    if (!monthlyExpenseData.length)
      return { electricity: 0, directPay: 0, rent: 0 };

    return {
      electricity: Math.max(...monthlyExpenseData.map((d) => d.electricity)),
      directPay: Math.max(...monthlyExpenseData.map((d) => d.directPay)),
      rent: Math.max(...monthlyExpenseData.map((d) => d.rent)),
    };
  }, [monthlyExpenseData]);

  const categories = [
    {
      key: "electricity",
      label: "Electricity",
      baseColor: "hsl(var(--chart-1))",
    },
    { key: "directPay", label: "Direct Pay", baseColor: "hsl(var(--chart-2))" },
    { key: "rent", label: "Rent", baseColor: "hsl(var(--chart-3))" },
  ];

  // Helper function to determine text color based on background intensity
  const getTextColor = (intensity) => {
    // Use dark text for light backgrounds (low intensity) and light text for dark backgrounds (high intensity)
    return intensity > 0.5 ? "text-white" : "text-gray-900";
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  {category.key === "electricity" && (
                    <Zap className="h-4 w-4" />
                  )}
                  {category.key === "directPay" && (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {category.key === "rent" && <Home className="h-4 w-4" />}
                  {category.label} Expense Intensity
                </CardTitle>
                <Badge variant="outline">
                  Max: {maxValues[category.key].toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {monthlyExpenseData.map((station) => {
                  const value = station[category.key];
                  const intensity =
                    maxValues[category.key] > 0
                      ? value / maxValues[category.key]
                      : 0;
                  const backgroundColor = getHeatmapColor(
                    value,
                    maxValues[category.key],
                    category.baseColor
                  );
                  const textColorClass = getTextColor(intensity);

                  return (
                    <div
                      key={`${category.key}-${station.name}`}
                      className={`relative group p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 hover:shadow-md ${textColorClass}`}
                      style={{ backgroundColor }}
                    >
                      <div className="text-xs font-medium truncate">
                        {station.name}
                      </div>
                      <div className="text-sm font-bold mt-1">
                        {value.toLocaleString()}
                      </div>
                      <div
                        className={`absolute bottom-1 right-1 text-xs opacity-75`}
                      >
                        {(intensity * 100).toFixed(0)}%
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap text-popover-foreground">
                        <div className="font-medium">{station.name}</div>
                        <div>
                          {category.label}: {value.toLocaleString()}
                        </div>
                        <div>Intensity: {(intensity * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <div className="flex items-center gap-1">
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                    <div
                      key={intensity}
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: getHeatmapColor(
                          intensity * maxValues[category.key],
                          maxValues[category.key],
                          category.baseColor
                        ),
                      }}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Separate component for expense cards
function ExpenseCards({ totalExpenses, totalTrend, expenseBreakdown }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalExpenses.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp
              className={`mr-1 h-3 w-3 ${
                totalTrend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={totalTrend >= 0 ? "text-green-500" : "text-red-500"}
            >
              {totalTrend >= 0 ? "+" : ""}
              {totalTrend.toFixed(1)}%
            </span>
            <span className="ml-1">vs last period</span>
          </div>
        </CardContent>
      </Card>

      {expenseBreakdown.map((expense) => (
        <Card key={expense.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {expense.category}
            </CardTitle>
            {expense.category === "Electricity" && (
              <Zap className="h-4 w-4 text-muted-foreground" />
            )}
            {expense.category === "Direct Pay" && (
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            )}
            {expense.category === "Rent" && (
              <Home className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expense.amount.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp
                className={`mr-1 h-3 w-3 ${
                  expense.trend >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={
                  expense.trend >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {expense.trend >= 0 ? "+" : ""}
                {expense.trend.toFixed(1)}%
              </span>
              <span className="ml-1">
                {expense.trend === 0 ? "Stable" : "vs last period"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Separate component for tabs
function ExpenseTabs({
  viewType,
  setViewType,
  monthlyExpenseData,
  expenseBreakdown,
  totalExpenses,
}) {
  return (
    <Tabs
      value={viewType}
      onValueChange={(value) => setViewType(value)}
      className="space-y-4"
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        <TabsTrigger value="Expense Volume">Volume</TabsTrigger>
        <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyExpenseData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const totalValue = payload.reduce(
                          (acc, cur) => acc + (cur.value || 0),
                          0
                        );

                        return (
                          <div
                            className="rounded-lg border bg-background p-3 shadow-sm"
                            style={{ minWidth: 160 }}
                          >
                            <div className="mb-2 font-semibold">{label}</div>
                            {payload.map((entry, idx) => (
                              <div
                                key={`tooltip-item-${idx}`}
                                className="flex justify-between text-sm"
                                style={{ color: entry.color }}
                              >
                                <span>{entry.name}</span>
                                <span>
                                  {entry.value?.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              </div>
                            ))}
                            <div className="mt-2 border-t pt-1 flex justify-between font-bold text-primary">
                              <span>Total</span>
                              <span>
                                {totalValue.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="electricity"
                    stackId="a"
                    fill="hsl(var(--chart-1))"
                    name="Electricity"
                  />
                  <Bar
                    dataKey="directPay"
                    stackId="a"
                    fill="hsl(var(--chart-2))"
                    name="Direct Pay"
                  />
                  <Bar
                    dataKey="rent"
                    stackId="a"
                    fill="hsl(var(--chart-3))"
                    name="Rent"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle> Stationwise expense trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={monthlyExpenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="electricity"
                  fill="hsl(var(--chart-1))"
                  name="Electricity"
                />
                <Bar
                  yAxisId="left"
                  dataKey="directPay"
                  fill="hsl(var(--chart-2))"
                  name="Direct Pay"
                />
                <Bar
                  yAxisId="left"
                  dataKey="rent"
                  fill="hsl(var(--chart-3))"
                  name="Rent"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  name="Total Expenses"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="breakdown" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4 overflow-y-auto max-h-[550px] flex flex-col">
            {expenseBreakdown.map((expense) => (
              <Card key={expense.category} className="flex-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {expense.category}
                    </CardTitle>
                    <Badge variant="secondary">
                      {((expense.amount / totalExpenses) * 100).toFixed(1)}% of
                      total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {expense.amount.toLocaleString()}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Monthly expense
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${
                            (expense.amount / totalExpenses) * 100 || 0
                          }%`,
                          backgroundColor: expense.color,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col justify-center h-full">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="amount"
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="font-medium">
                                {data.category}
                              </span>
                            </div>
                            <div className="grid gap-2">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Amount:</span>
                                <span className="font-semibold">
                                  {data.amount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Percentage:</span>
                                <span className="font-semibold">
                                  {(
                                    (data.amount / totalExpenses) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {payload?.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.payload.category} (
                              {(
                                (entry.payload.amount / totalExpenses) *
                                100
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="Expense Volume" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Expense Evolution Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyExpenseData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
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
                  dataKey="electricity"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                  name="Electricity"
                />
                <Area
                  type="monotone"
                  dataKey="directPay"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                  name="Direct Pay"
                />
                <Area
                  type="monotone"
                  dataKey="rent"
                  stackId="1"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.6}
                  name="Rent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heatmap" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Expense Intensity Heatmap
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visual representation of expense intensity across stations. Darker
              colors indicate higher expenses.
            </p>
          </CardHeader>
          <CardContent>
            <ExpenseHeatmap monthlyExpenseData={monthlyExpenseData} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export function ExpenseAnalysis({ filters }: ExpenseAnalysisProps) {
  const [viewType, setViewType] = useState<
    "overview" | "trends" | "breakdown" | "Expense Volume" | "heatmap"
  >("overview");

  const { data, loading } = useExpenses(filters);

  // Destructure previous period data safely
  const prev = data?.previous || {};

  // Calculate total expenses (current period)
  const totalExpenses = useMemo(() => {
    return (
      data?.data?.reduce((acc, station) => {
        return (
          acc +
          (Number(station.TOTAL_ELCTRICITY_BILL) || 0) +
          (Number(station.TOTAL_DIRECTPAY_COMMISSION) || 0) +
          (Number(station.TOTAL_STATION_RENT) || 0)
        );
      }, 0) ?? 0
    );
  }, [data?.data]);

  // Previous total expenses
  const prevTotalExpenses =
    Number(data?.["previous segment OVERALL_EXPENSES"]) || 0;

  // Calculate overall trend
  const totalTrend = calculateTrend(totalExpenses, prevTotalExpenses);

  const electricityAmount = Number(data?.OVERALL_ELCTRICITY_BILL ?? 0);
  const prevElectricityAmount = Number(
    data?.["previous segment OVERALL_ELCTRICITY_BILL"] ?? 0
  );

  const directPayAmount = Number(data?.OVERALL_DIRECTPAY_COMMISSION ?? 0);
  const prevDirectPayAmount = Number(
    data?.["previous segment OVERALL_DIRECTPAY_COMMISSION"] ?? 0
  );

  const rentAmount = Number(data?.OVERALL_STATION_RENT ?? 0);
  const prevRentAmount = Number(
    data?.["previous segment OVERALL_STATION_RENT"] ?? 0
  );

  const maintenanceAmount = Number(data?.OVERALL_MAINTANANCE_COST ?? 0);
  const prevMaintenanceAmount = Number(
    data?.["previous segment OVERALL_MAINTANANCE_COST"] ?? 0
  );

  // Trends per category
  const electricityTrend = calculateTrend(
    electricityAmount,
    prevElectricityAmount
  );
  const directPayTrend = calculateTrend(directPayAmount, prevDirectPayAmount);
  const rentTrend = calculateTrend(rentAmount, prevRentAmount);

  // Expense breakdown array for cards and charts
  const expenseBreakdown = [
    {
      category: "Electricity",
      amount: electricityAmount,
      trend: electricityTrend,
      color: "hsl(var(--chart-1))",
    },
    {
      category: "Direct Pay",
      amount: directPayAmount,
      trend: directPayTrend,
      color: "hsl(var(--chart-2))",
    },
    {
      category: "Rent",
      amount: rentAmount,
      trend: rentTrend,
      color: "hsl(var(--chart-3))",
    },
  ];

  // Prepare data for charts
  const monthlyExpenseData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((station) => ({
      name: station.STATIONNAME,
      electricity: Number(station.TOTAL_ELCTRICITY_BILL) || 0,
      directPay: Number(station.TOTAL_DIRECTPAY_COMMISSION) || 0,
      rent: Number(station.TOTAL_STATION_RENT) || 0,
      total:
        (Number(station.TOTAL_ELCTRICITY_BILL) || 0) +
        (Number(station.TOTAL_DIRECTPAY_COMMISSION) || 0) +
        (Number(station.TOTAL_STATION_RENT) || 0),
    }));
  }, [data]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">No expense data available</p>
            <p className="text-sm">
              Please check your filters or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ExpenseCards
        totalExpenses={totalExpenses}
        totalTrend={totalTrend}
        expenseBreakdown={expenseBreakdown}
      />

      <ExpenseTabs
        viewType={viewType}
        setViewType={setViewType}
        monthlyExpenseData={monthlyExpenseData}
        expenseBreakdown={expenseBreakdown}
        totalExpenses={totalExpenses}
      />
    </div>
  );
}
