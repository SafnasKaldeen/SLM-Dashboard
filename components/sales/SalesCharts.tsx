// components/sales/sales-charts.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ModelSalesChart } from "./region-sales-chart";
import { m } from "framer-motion";

interface SalesChartsProps {
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
    subscriptions: number;
  }>;
  modelSales: Array<{
    model: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  loading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-LK").format(num);
};

export const SalesCharts = ({
  monthlySales,
  modelSales,
  loading = false,
}: SalesChartsProps) => {
  // Skeleton while loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-full h-[350px] rounded-lg bg-background p-6">
          <div className="h-6 w-1/4 rounded-md bg-muted mb-4 animate-pulse" />
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-[250px] bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full h-[350px] rounded-lg bg-background p-6">
            <div className="h-6 w-1/4 rounded-md bg-muted mb-4 animate-pulse" />
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-[250px] bg-muted animate-pulse rounded-md" />
            </div>
          </div>
          <div className="w-full h-[350px] rounded-lg bg-background p-6">
            <div className="h-6 w-1/4 rounded-md bg-muted mb-4 animate-pulse" />
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-[250px] bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!monthlySales || monthlySales.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No sales data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sales volume and revenue over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              {/* <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              /> */}
              <YAxis
                orientation="left"
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
                            Month
                          </div>
                          <div className="text-sm font-medium">{label}</div>
                          {payload.map((entry, index) => (
                            <div key={index}>
                              <div className="text-xs text-muted-foreground uppercase mt-2">
                                {entry.name}
                              </div>
                              <div className="text-sm font-bold">
                                {entry.name === "Revenue" ||
                                entry.name === "revenue"
                                  ? formatCurrency(Number(entry.value))
                                  : formatNumber(Number(entry.value))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="sales"
                strokeWidth={2}
                className="stroke-primary"
                name="Sales Count"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, className: "fill-primary" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Revenue</CardTitle>
            <CardDescription className="text-muted-foreground">
              Revenue performance by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
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
                                {formatCurrency(Number(payload[0].value))}
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
                  dataKey="revenue"
                  fill="hsl(217, 91%, 60%)" // This is Tailwind's blue-500 in HSL
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <ModelSalesChart data={modelSales} />
      </div>
    </div>
  );
};
