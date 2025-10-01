"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip, TreemapProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartConfig {
  type: "treemap";
  title?: string;
  xAxis?: string; // name field
  yAxis?: string; // value field
  showTooltip?: boolean;
  showLegend?: boolean;
}

interface ChartComponentProps {
  chartData: any[];
  chartConfig: ChartConfig;
  colors: string[];
  TooltipComponent?: React.ComponentType<any>;
}

const TreemapChartComponent = ({
  chartData,
  chartConfig,
  colors,
  TooltipComponent,
}: ChartComponentProps) => {
  const {
    title,
    xAxis = "name",
    yAxis = "value",
    showTooltip = true,
    showLegend = true,
  } = chartConfig;

  // Transform and validate chart data
  const transformedData = useMemo(() => {
    return chartData.map((item, index) => ({
      name: item[xAxis] || `Item ${index}`,
      value: item[yAxis] ?? 0,
      fill: colors[index % colors.length],
    }));
  }, [chartData, xAxis, yAxis, colors]);

  const total = useMemo(() => {
    return transformedData.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [transformedData]);

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {title || "Treemap Chart"}
          </CardTitle>
          <div className="text-sm text-slate-400 mt-1">
            Total: {total.toLocaleString()} • {transformedData.length} segments
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={transformedData}
              dataKey="value"
              nameKey="name"
              stroke="#475569"
              aspectRatio={4 / 3}
              fill={colors[0]}
            >
              {showTooltip && <Tooltip content={<DefaultTooltip />} />}
            </Treemap>
          </ResponsiveContainer>
        </div>

        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {transformedData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-slate-300">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Default tooltip if not passed from props
const DefaultTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-100 shadow-lg">
      <div className="font-semibold">{item.name}</div>
      <div>Value: {item.value}</div>
    </div>
  );
};

export default TreemapChartComponent;
