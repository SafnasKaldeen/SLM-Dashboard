"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type definitions
interface ChartDataItem {
  [key: string]: string | number;
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  sizeBy?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface ScatterChartComponentProps {
  chartData?: ChartDataItem[];
  chartConfig?: ChartConfig;
  colors?: string[];
}

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  chartConfig,
  hasColorBy,
  hasSizeBy,
}: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3 text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-300">{chartConfig.xAxis}:</span>
          <span className="font-medium text-white">
            {typeof data[chartConfig.xAxis] === "number"
              ? data[chartConfig.xAxis].toLocaleString()
              : data[chartConfig.xAxis]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-300">{chartConfig.yAxis}:</span>
          <span className="font-medium text-white">
            {typeof data[chartConfig.yAxis] === "number"
              ? data[chartConfig.yAxis].toLocaleString()
              : data[chartConfig.yAxis]}
          </span>
        </div>
        {hasColorBy && chartConfig.colorBy && data[chartConfig.colorBy] && (
          <div className="flex items-center gap-2">
            <span className="text-slate-300">{chartConfig.colorBy}:</span>
            <span className="font-medium text-white">
              {data[chartConfig.colorBy]}
            </span>
          </div>
        )}
        {hasSizeBy && chartConfig.sizeBy && data[chartConfig.sizeBy] && (
          <div className="flex items-center gap-2">
            <span className="text-slate-300">{chartConfig.sizeBy}:</span>
            <span className="font-medium text-white">
              {typeof data[chartConfig.sizeBy] === "number"
                ? data[chartConfig.sizeBy].toLocaleString()
                : data[chartConfig.sizeBy]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ScatterChartComponent: React.FC<ScatterChartComponentProps> = ({
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

  // Strict check for sizeBy: must be non-empty string
  const hasSizeBy: boolean =
    typeof chartConfig.sizeBy === "string" && chartConfig.sizeBy.trim() !== "";

  const uniqueGroupKeys = useMemo((): string[] => {
    if (!hasColorBy || !chartConfig.colorBy) return [];
    return [...new Set(chartData.map((d) => String(d[chartConfig.colorBy!])))];
  }, [chartData, chartConfig.colorBy, hasColorBy]);

  // Calculate size range for bubble sizing
  const sizeRange = useMemo(() => {
    if (!hasSizeBy || !chartConfig.sizeBy) return { min: 0, max: 0 };

    const sizeValues = chartData
      .map((d) => Number(d[chartConfig.sizeBy!]))
      .filter((val) => !isNaN(val));

    if (sizeValues.length === 0) return { min: 0, max: 0 };

    return {
      min: Math.min(...sizeValues),
      max: Math.max(...sizeValues),
    };
  }, [chartData, chartConfig.sizeBy, hasSizeBy]);

  // Function to calculate bubble size
  const calculateBubbleSize = (value: number): number => {
    if (!hasSizeBy || sizeRange.max === sizeRange.min) return 64; // Default size

    const minSize = 20;
    const maxSize = 420;
    const normalizedValue =
      (value - sizeRange.min) / (sizeRange.max - sizeRange.min);
    return minSize + normalizedValue * (maxSize - minSize);
  };

  // Function to get color for a data point
  const getPointColor = (dataPoint: ChartDataItem, index: number): string => {
    if (!hasColorBy || !chartConfig.colorBy) {
      return colors[0]; // Default single color
    }

    const colorByValue = String(dataPoint[chartConfig.colorBy]);
    const colorIndex = uniqueGroupKeys.indexOf(colorByValue);
    return colors[colorIndex % colors.length];
  };

  const renderScatter = () => {
    if (!hasColorBy) {
      // Single color scatter plot
      return (
        <Scatter
          dataKey={chartConfig.yAxis}
          fill={colors[0]}
          shape={(props: any) => {
            const { cx, cy, payload } = props;
            const size =
              hasSizeBy && chartConfig.sizeBy
                ? calculateBubbleSize(Number(payload[chartConfig.sizeBy]))
                : 64;

            return (
              <circle
                cx={cx}
                cy={cy}
                r={Math.sqrt(size) / 2}
                fill={colors[0]}
                fillOpacity={0.7}
                stroke={colors[0]}
                strokeWidth={2}
              />
            );
          }}
        />
      );
    }

    // Multi-colored scatter plot with separate series for each color group
    return uniqueGroupKeys.map((groupKey, groupIndex) => {
      const groupData = chartData.filter(
        (item) => String(item[chartConfig.colorBy!]) === groupKey
      );

      return (
        <Scatter
          key={groupKey}
          name={groupKey}
          data={groupData}
          fill={colors[groupIndex % colors.length]}
          shape={(props: any) => {
            const { cx, cy, payload } = props;
            const size =
              hasSizeBy && chartConfig.sizeBy
                ? calculateBubbleSize(Number(payload[chartConfig.sizeBy]))
                : 64;

            return (
              <circle
                cx={cx}
                cy={cy}
                r={Math.sqrt(size) / 2}
                fill={colors[groupIndex % colors.length]}
                fillOpacity={0.7}
                stroke={colors[groupIndex % colors.length]}
                strokeWidth={2}
              />
            );
          }}
        />
      );
    });
  };

  if (!chartConfig.xAxis || !chartConfig.yAxis) {
    return <div className="text-red-500">Invalid chart configuration</div>;
  }

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Scatter Chart</CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={hasColorBy ? undefined : chartData}>
            {chartConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            )}
            <XAxis
              dataKey={chartConfig.xAxis}
              type="number"
              stroke="#cbd5e1"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey={chartConfig.yAxis}
              type="number"
              stroke="#cbd5e1"
              tick={{ fontSize: 12 }}
            />
            {chartConfig.showTooltip && (
              <Tooltip
                content={
                  <CustomTooltip
                    chartConfig={chartConfig}
                    hasColorBy={hasColorBy}
                    hasSizeBy={hasSizeBy}
                  />
                }
                cursor={{ strokeDasharray: "3 3" }}
              />
            )}
            {chartConfig.showLegend && hasColorBy && <Legend />}
            {renderScatter()}
          </ScatterChart>
        </ResponsiveContainer>

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
              <Badge variant="secondary">Color by</Badge> {chartConfig.colorBy}
            </p>
          )}
          {hasSizeBy && chartConfig.sizeBy && (
            <p>
              <Badge variant="secondary">Size by</Badge> {chartConfig.sizeBy}
            </p>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default ScatterChartComponent;
