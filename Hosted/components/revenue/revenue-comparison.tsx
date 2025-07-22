"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const monthlyComparison = [
  { period: "Jan 2023", current: 145000, previous: 132000, growth: 9.8 },
  { period: "Feb 2023", current: 152000, previous: 138000, growth: 10.1 },
  { period: "Mar 2023", current: 148000, previous: 142000, growth: 4.2 },
  { period: "Apr 2023", current: 165000, previous: 155000, growth: 6.5 },
  { period: "May 2023", current: 158000, previous: 148000, growth: 6.8 },
  { period: "Jun 2023", current: 172000, previous: 162000, growth: 6.2 },
];

const areaComparison = [
  { area: "Downtown", q1: 420000, q2: 465000, q3: 445000, q4: 495000 },
  {
    area: "University District",
    q1: 280000,
    q2: 295000,
    q3: 275000,
    q4: 310000,
  },
  { area: "Business District", q1: 380000, q2: 395000, q3: 385000, q4: 420000 },
  { area: "Residential Areas", q1: 180000, q2: 185000, q3: 175000, q4: 195000 },
  { area: "Tourist Zone", q1: 320000, q2: 340000, q3: 355000, q4: 375000 },
];

const segmentComparison = [
  { segment: "Regular Users", revenue: 485000, percentage: 42, growth: 8.5 },
  { segment: "Premium Members", revenue: 325000, percentage: 28, growth: 12.3 },
  { segment: "Corporate", revenue: 185000, percentage: 16, growth: 15.2 },
  { segment: "Students", revenue: 95000, percentage: 8, growth: 6.8 },
  { segment: "Tourists", revenue: 75000, percentage: 6, growth: 22.1 },
];

export function RevenueComparison() {
  const [AggregationType, setAggregationType] = useState<
    "period" | "area" | "segment"
  >("period");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Aggregation</span>
          <Select
            value={AggregationType}
            onValueChange={(value: "period" | "area" | "segment") =>
              setAggregationType(value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="period">Time Period</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem disabled value="segment">
                Customer Segment
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {AggregationType === "period" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Comparission: </span>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Revenue</SelectItem>
                <SelectItem value="quarterly">Expense</SelectItem>
                <SelectItem value="custom">Profit</SelectItem>
                <SelectItem value="yearly">Swap</SelectItem>
                {/* <SelectItem value="custom">Payments</SelectItem> */}
                <SelectItem disabled value="custom">
                  Users
                </SelectItem>
                <SelectItem value="custom">Stations</SelectItem>
                {/* <SelectItem value="custom">Batteries</SelectItem> */}
                <SelectItem disabled value="custom">
                  Vehicles
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          {AggregationType === "period" && (
            <Card>
              <CardHeader>
                <CardTitle>Period-over-Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="period"
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
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <div className="font-medium mb-2">{label}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Current:
                                  </span>
                                  <span className="font-bold">
                                    ${payload[0].value?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Previous:
                                  </span>
                                  <span className="font-bold">
                                    ${payload[1].value?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Growth:
                                  </span>
                                  <span className="font-bold text-green-600">
                                    +{payload[0].payload.growth}%
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
                      dataKey="current"
                      fill="hsl(var(--primary))"
                      name="Current Period"
                    />
                    <Bar
                      dataKey="previous"
                      fill="hsl(var(--muted))"
                      name="Previous Period"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {AggregationType === "area" && (
            <Card>
              <CardHeader>
                <CardTitle>Area Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={areaComparison}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="area"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="q1" fill="hsl(var(--chart-1))" name="Q1" />
                    <Bar dataKey="q2" fill="hsl(var(--chart-2))" name="Q2" />
                    <Bar dataKey="q3" fill="hsl(var(--chart-3))" name="Q3" />
                    <Bar dataKey="q4" fill="hsl(var(--chart-4))" name="Q4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {AggregationType === "segment" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Segment Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={segmentComparison} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      type="number"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="segment"
                      type="category"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <div className="font-medium mb-2">{label}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Revenue:
                                  </span>
                                  <span className="font-bold">
                                    ${payload[0].value?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Share:
                                  </span>
                                  <span className="font-bold">
                                    {payload[0].payload.percentage}%
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    Growth:
                                  </span>
                                  <span className="font-bold text-green-600">
                                    +{payload[0].payload.growth}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="table">
          {AggregationType === "period" && (
            <Card>
              <CardHeader>
                <CardTitle>Period Comparison Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Period</th>
                        <th className="text-right p-2">Current Revenue</th>
                        <th className="text-right p-2">Previous Revenue</th>
                        <th className="text-right p-2">Growth</th>
                        <th className="text-right p-2">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyComparison.map((item) => (
                        <tr key={item.period} className="border-b">
                          <td className="p-2 font-medium">{item.period}</td>
                          <td className="p-2 text-right">
                            ${item.current.toLocaleString()}
                          </td>
                          <td className="p-2 text-right">
                            ${item.previous.toLocaleString()}
                          </td>
                          <td className="p-2 text-right text-green-600">
                            +{item.growth}%
                          </td>
                          <td className="p-2 text-right">
                            ${(item.current - item.previous).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {AggregationType === "segment" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Segment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Segment</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Market Share</th>
                        <th className="text-right p-2">Growth Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segmentComparison.map((item) => (
                        <tr key={item.segment} className="border-b">
                          <td className="p-2 font-medium">{item.segment}</td>
                          <td className="p-2 text-right">
                            ${item.revenue.toLocaleString()}
                          </td>
                          <td className="p-2 text-right">{item.percentage}%</td>
                          <td className="p-2 text-right text-green-600">
                            +{item.growth}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
