"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState, useEffect, use } from "react";
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

type BarStyle = "colored" | "grouped" | "stacked";

interface BarChartComponentProps {
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
  barStyle,
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
              barStyle === "colored" &&
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

const BarChartComponent: React.FC<BarChartComponentProps> = ({
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
  // Strict check for colorBy: must be non-empty string
  const hasColorBy: boolean =
    typeof chartConfig.colorBy === "string" &&
    chartConfig.colorBy.trim() !== "";

  const [barStyle, setBarStyle] = useState<BarStyle>("colored");

  // If colorBy is removed or not enabled, reset barStyle to "colored"
  useEffect(() => {
    // console.log("changed", chartData, chartConfig);
    if (!hasColorBy && barStyle !== "colored") {
      setBarStyle("colored");
    }
  }, [hasColorBy, barStyle]);

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

  const renderBars = () => {
    // Case 1: No colorBy selected - single color for all bars
    if (!hasColorBy) {
      return (
        <Bar
          key="bar"
          dataKey={chartConfig.yAxis}
          name={chartConfig.yAxis}
          // Custom cell renderer to force single color
          shape={(props: any) => {
            const { fill, ...otherProps } = props; // Do not extract PRODUCT_ID
            return <rect {...otherProps} fill={colors[0]} />;
          }}
        />
      );
    }

    // Case 2: ColorBy selected + "Colored" style - multicolored bars
    if (hasColorBy && barStyle === "colored") {
      return (
        <Bar
          key="bar"
          dataKey={chartConfig.yAxis}
          name={chartConfig.yAxis}
          // Custom cell renderer for multicolored bars
          shape={(props: any) => {
            const { payload, fill, ...otherProps } = props;
            // Get color based on the colorBy value for this data point
            const colorByValue = payload[chartConfig.colorBy!];
            const colorIndex = uniqueGroupKeys.indexOf(String(colorByValue));
            const barColor = colors[colorIndex % colors.length];
            return <rect {...otherProps} fill={barColor} />;
          }}
        />
      );
    }

    // Case 3 & 4: ColorBy selected + "Grouped" or "Stacked" - separate bars per category
    return uniqueGroupKeys.map((key: string, index: number) => (
      <Bar
        key={key}
        dataKey={key}
        fill={colors[index % colors.length]}
        stackId={barStyle === "stacked" ? "stack" : undefined}
        name={key}
      />
    ));
  };

  if (!chartConfig.xAxis || !chartConfig.yAxis) {
    return <div className="text-red-500">Invalid chart configuration</div>;
  }

  const chartDataToUse =
    hasColorBy && barStyle !== "colored" ? groupedData : chartData;

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">Bar Chart</CardTitle>

        {/* Show style buttons ONLY if colorBy is enabled */}
        {hasColorBy && (
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              variant={barStyle === "colored" ? "default" : "outline"}
              onClick={() => setBarStyle("colored")}
            >
              Colored
            </Button>
            <Button
              variant={barStyle === "grouped" ? "default" : "outline"}
              onClick={() => setBarStyle("grouped")}
            >
              Grouped
            </Button>
            <Button
              variant={barStyle === "stacked" ? "default" : "outline"}
              onClick={() => setBarStyle("stacked")}
            >
              Stacked
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        <div
          style={{
            ...(!hasColorBy &&
              ({
                "--bar-fill": colors[0],
              } as React.CSSProperties)),
          }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartDataToUse}>
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
                      barStyle={barStyle}
                    />
                  }
                  cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                />
              )}
              {chartConfig.showLegend && <Legend />}
              {renderBars()}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inject CSS to force single color when no colorBy */}
        {!hasColorBy && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .recharts-bar-rectangle {
                fill: ${colors[0]} !important;
              }
            `,
            }}
          />
        )}

        {/* Debug Info */}
        {/* <div className="mt-4 space-y-1 text-xs">
          <p>
            <Badge variant="secondary">xAxis</Badge> {chartConfig.xAxis}
          </p>
          <p>
            <Badge variant="secondary">yAxis</Badge> {chartConfig.yAxis}
          </p>
          {hasColorBy && chartConfig.colorBy && (
            <p>
              <Badge variant="secondary">Group by</Badge> {chartConfig.colorBy}
            </p>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
