// components/sales/model-sales-chart.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react"; // Changed icon to Package (represents product/model)
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ModelSalesData {
  model: string;
  sales: number;
  revenue: number;
  percentage: number;
}

interface ModelSalesChartProps {
  data: ModelSalesData[];
  loading?: boolean;
}

const COLORS = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
];

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

export const ModelSalesChart = ({
  data,
  loading = false,
}: ModelSalesChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Sales by Model
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Distribution of sales across models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] rounded-lg">
            <div className="h-6 w-1/3 rounded-md bg-muted mb-4 animate-pulse" />
            <div className="flex justify-center items-center h-[240px] gap-2 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
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
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Sales by Model
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No model data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No model sales data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data to match the expected format
  const chartData = data.map((item, index) => ({
    name: item.model,
    value: item.percentage,
    revenue: item.revenue,
    sales: item.sales,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Sales by Model
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribution of sales across models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={150}
              paddingAngle={2}
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
                          {d.value.toFixed(2)}% of total sales
                        </div>
                        <div className="text-sm font-medium">
                          Sales: {formatNumber(d.sales)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: {formatCurrency(d.revenue)}
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
                <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent pr-2 mt-4 flex justify-center">
                  <div className="flex flex-wrap gap-4 justify-center">
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
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
