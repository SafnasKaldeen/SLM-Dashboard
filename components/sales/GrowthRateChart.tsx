"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthRateChartProps {
  data: Array<{
    city: string;
    growthRate: number;
  }>;
}

export const GrowthRateChart: React.FC<GrowthRateChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Rate Analysis</CardTitle>
        <CardDescription className="text-muted-foreground">
          Year-over-year growth by city
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="city"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
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
                            Growth Rate:
                          </span>
                          <span className="font-bold">
                            {Number(payload[0].value).toFixed(1)}%
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
              dataKey="growthRate"
              fill="hsl(145, 63%, 49%)" // Tailwind green-500 HSL
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
