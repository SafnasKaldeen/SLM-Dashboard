"use client";

import React, { useMemo } from "react";
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

interface DataItem {
  [key: string]: any;
}

interface Props {
  data: DataItem[];
  xField: string; // Field name for X axis
  yField: string; // Field name for Y axis (numeric)
  legendField?: string; // Optional grouping field for color legend
  barChartType?: "clustered" | "stacked"; // Bar chart style
  colors?: string[]; // Optional color palette
  width?: number | string;
  height?: number | string;
}

const defaultColors = [
  "#4f46e5",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function CustomBarChart({
  data,
  xField,
  yField,
  legendField,
  barChartType = "clustered",
  colors = defaultColors,
  width = "100%",
  height = 300,
}: Props) {
  // Extract unique legend keys if legendField is specified
  const legendKeys = useMemo(() => {
    if (!legendField || legendField === "none") return [];
    return Array.from(new Set(data.map((d) => d[legendField])));
  }, [data, legendField]);

  // Transform data for grouped bars:
  // Aggregate yField values by xField and legendField
  const transformedData = useMemo(() => {
    if (!legendKeys.length) return data;

    const grouped: Record<string, any> = {};

    data.forEach((item) => {
      const xVal = item[xField];
      const groupVal = item[legendField!];
      const yVal = Number(item[yField]) || 0;

      if (!grouped[xVal]) grouped[xVal] = { [xField]: xVal };

      // Sum values if multiple items exist for same xVal and groupVal
      grouped[xVal][groupVal] = (grouped[xVal][groupVal] || 0) + yVal;
    });

    return Object.values(grouped);
  }, [data, xField, yField, legendField, legendKeys]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={transformedData.length > 0 ? transformedData : data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip />
        {legendKeys.length > 0 && <Legend />}
        {legendKeys.length > 0 ? (
          legendKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              fill={colors[i % colors.length]}
              stackId={barChartType === "stacked" ? "stack" : undefined}
              radius={[2, 2, 0, 0]}
            />
          ))
        ) : (
          <Bar dataKey={yField} fill={colors[0]} radius={[2, 2, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
