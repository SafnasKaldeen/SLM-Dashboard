"use client";

import React, { ReactNode, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartConfig {
  xAxis: string;
  yAxis: string;
  colorBy?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

type DataItem = Record<string, any>;

interface LineChartComponentProps {
  chartData: DataItem[];
  chartConfig: ChartConfig;
  colors?: string[];
  TooltipComponent?: React.ComponentType<TooltipProps<any, any>>; // Accepts recharts Tooltip props
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#facc15",
  "#34d399",
  "#fb923c",
  "#8b5cf6",
  "#ec4899",
  "#f87171",
  "#14b8a6",
  "#a3e635",
];

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  chartData,
  chartConfig,
  colors = DEFAULT_COLORS,
  TooltipComponent,
}) => {
  const hasColorBy =
    typeof chartConfig.colorBy === "string" &&
    chartConfig.colorBy.trim().length > 0;

  const uniqueGroupKeys = useMemo(() => {
    if (!hasColorBy) return [];
    return Array.from(
      new Set(chartData.map((d) => d[chartConfig.colorBy!]))
    ) as string[];
  }, [chartData, chartConfig.colorBy, hasColorBy]);

  const groupedData = useMemo(() => {
    if (!chartConfig.xAxis || !chartConfig.yAxis || !hasColorBy) return [];

    const result: Record<string, any> = {};

    chartData.forEach((item) => {
      const xKey = item[chartConfig.xAxis];
      const colorKey = item[chartConfig.colorBy!];
      const value = item[chartConfig.yAxis];

      if (!result[xKey]) {
        result[xKey] = { [chartConfig.xAxis]: xKey };
      }
      result[xKey][colorKey] = value;
    });

    return Object.values(result);
  }, [chartData, chartConfig, hasColorBy]);

  if (!chartConfig.xAxis || !chartConfig.yAxis) {
    return <div className="text-red-500">Invalid chart configuration</div>;
  }

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Line Chart</CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={hasColorBy ? groupedData : chartData}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            )}
            <XAxis
              dataKey={chartConfig.xAxis}
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            {chartConfig.showTooltip &&
              (TooltipComponent ? (
                <Tooltip content={<TooltipComponent />} />
              ) : (
                <Tooltip />
              ))}
            {chartConfig.showLegend && <Legend />}
            {hasColorBy ? (
              uniqueGroupKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={chartConfig.yAxis}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Debug Info */}
        {/* <div className="mt-4 space-y-1 text-xs">
          <p>
            <Badge variant="secondary">xAxis</Badge> {chartConfig.xAxis}
          </p>
          <p>
            <Badge variant="secondary">yAxis</Badge> {chartConfig.yAxis}
          </p>
          {hasColorBy && (
            <p>
              <Badge variant="secondary">Group by</Badge> {chartConfig.colorBy}
            </p>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default LineChartComponent;
