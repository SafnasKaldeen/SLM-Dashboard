"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Type definitions
interface ChartDataItem {
  [key: string]: string | number;
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

type AreaStyle = "colored" | "stacked" | "overlay";

interface AreaChartComponentProps {
  chartData?: ChartDataItem[];
  chartConfig?: ChartConfig;
  colors?: string[];
}

interface GroupedDataItem {
  [key: string]: string | number;
}

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  chartConfig,
  hasColorBy,
  areaStyle,
}: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-slate-200 mb-2">
        {chartConfig.xAxis}: {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-medium text-white">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
            {hasColorBy &&
              areaStyle === "colored" &&
              entry.payload[chartConfig.colorBy] && (
                <span className="text-slate-400 text-xs">
                  ({chartConfig.colorBy}: {entry.payload[chartConfig.colorBy]})
                </span>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  chartData = [],
  chartConfig = {},
  colors = [
    "#3b82f6",
    "#facc15",
    "#34d399",
    "#fb923c",
    "#8b5cf6",
    "#ec4899",
    "#f87171",
    "#14b8a6",
    "#a3e635",
  ],
}) => {
  const hasColorBy =
    typeof chartConfig.colorBy === "string" &&
    chartConfig.colorBy.trim() !== "";

  const [areaStyle, setAreaStyle] = useState<AreaStyle>("colored");

  useEffect(() => {
    if (!hasColorBy && areaStyle !== "colored") {
      setAreaStyle("colored");
    }
  }, [hasColorBy, areaStyle]);

  const uniqueGroupKeys = useMemo((): string[] => {
    if (!hasColorBy || !chartConfig.colorBy) return [];
    return [...new Set(chartData.map((d) => String(d[chartConfig.colorBy!])))];
  }, [chartData, chartConfig.colorBy, hasColorBy]);

  const groupedData = useMemo((): GroupedDataItem[] => {
    if (
      !chartConfig.xAxis ||
      !chartConfig.yAxis ||
      !hasColorBy ||
      !chartConfig.colorBy
    )
      return [];

    const result: { [key: string]: GroupedDataItem } = {};

    chartData.forEach((item) => {
      const xKey = String(item[chartConfig.xAxis!]);
      const colorKey = String(item[chartConfig.colorBy!]);
      const value = item[chartConfig.yAxis!];

      if (!result[xKey]) {
        result[xKey] = { [chartConfig.xAxis!]: xKey };
      }

      result[xKey][colorKey] = value;
    });

    return Object.values(result);
  }, [chartData, chartConfig, hasColorBy]);

  const renderAreas = () => {
    if (!hasColorBy) {
      return (
        <Area
          key="area"
          type="monotone"
          dataKey={chartConfig.yAxis}
          name={chartConfig.yAxis}
          stroke={colors[0]}
          fill={colors[0]}
          fillOpacity={0.6}
        />
      );
    }

    if (hasColorBy && areaStyle === "colored") {
      return (
        <Area
          key="area"
          type="monotone"
          dataKey={chartConfig.yAxis}
          name={chartConfig.yAxis}
          stroke={colors[0]}
          fill={colors[0]}
          fillOpacity={0.6}
        />
      );
    }

    return uniqueGroupKeys.map((key: string, index: number) => (
      <Area
        key={key}
        type="monotone"
        dataKey={key}
        name={key}
        stroke={colors[index % colors.length]}
        fill={colors[index % colors.length]}
        fillOpacity={areaStyle === "stacked" ? 0.6 : 0.3}
        stackId={areaStyle === "stacked" ? "stack" : undefined}
      />
    ));
  };

  if (!chartConfig.xAxis || !chartConfig.yAxis) {
    return <div className="text-red-500">Invalid chart configuration</div>;
  }

  const chartDataToUse =
    hasColorBy && areaStyle !== "colored" ? groupedData : chartData;

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">Area Chart</CardTitle>

        {hasColorBy && (
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              variant={areaStyle === "colored" ? "default" : "outline"}
              onClick={() => setAreaStyle("colored")}
            >
              Colored
            </Button>
            <Button
              variant={areaStyle === "stacked" ? "default" : "outline"}
              onClick={() => setAreaStyle("stacked")}
            >
              Stacked
            </Button>
            <Button
              variant={areaStyle === "overlay" ? "default" : "outline"}
              onClick={() => setAreaStyle("overlay")}
            >
              Overlay
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartDataToUse}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            )}
            <XAxis
              dataKey={chartConfig.xAxis}
              stroke="#cbd5e1"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} />
            {chartConfig.showTooltip && (
              <Tooltip
                content={
                  <CustomTooltip
                    chartConfig={chartConfig}
                    hasColorBy={hasColorBy}
                    areaStyle={areaStyle}
                  />
                }
                cursor={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              />
            )}
            {chartConfig.showLegend && <Legend />}
            {renderAreas()}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AreaChartComponent;
