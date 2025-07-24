"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChartConfig {
  type: "radialBar";
  colorScheme?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  title?: string;
  variant?: "radialBar" | "gauge" | "semicircle" | "quarter";
  subCategory?: string;
  yAxis?: string;
  xAxis?: string;
  colorBy?: "CATEGORY";
  showPercentage?: boolean;
  animationDuration?: number;
  legendPosition?: "top" | "bottom" | "left" | "right";
  innerRadius?: string | number;
  outerRadius?: string | number;
  barSize?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  clockWise?: boolean;
  minAngle?: number;
  maxBarSize?: number;
  showBackground?: boolean;
  backgroundOpacity?: number;
  sortBy?: "value" | "name" | "none";
  sortOrder?: "asc" | "desc";
  showCenterText?: boolean;
  centerText?: string;
  centerSubText?: string;
  showDataLabels?: boolean;
  dataLabelPosition?: "inside" | "outside" | "insideStart" | "insideEnd";
  gradient?: boolean;
  gradientDirection?: "horizontal" | "vertical" | "radial";
  strokeWidth?: number;
  strokeColor?: string;
  hoverAnimation?: boolean;
  animationType?: "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out";
  showMinMaxLabels?: boolean;
  showValueOnHover?: boolean;
  compactLegend?: boolean;
  customTooltipFormatter?: (value: any, name: string, props: any) => string;
}

interface ChartComponentProps {
  chartData: any[];
  chartConfig: ChartConfig;
  colors: string[];
  TooltipComponent?: React.ComponentType<any>;
}

const EnhancedTooltip = ({
  active,
  payload,
  label,
  customTooltipFormatter,
  showPercentage,
  showMinMaxLabels,
  processedData,
  xAxis,
  yAxis,
}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formattedValue = customTooltipFormatter
      ? customTooltipFormatter(data.value, data.name, data.payload)
      : `${
          typeof data.value === "number"
            ? data.value.toLocaleString()
            : data.value
        }`;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-white mb-2">{data.payload[xAxis]}</p>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-slate-200">
            Value: <strong>{formattedValue}</strong>
          </span>
        </div>
        {showPercentage && (
          <div className="text-sm text-slate-300 mt-1">
            Percentage: <strong>{data.payload.percentage.toFixed(1)}%</strong>
          </div>
        )}
        {showMinMaxLabels && (
          <div className="text-xs text-slate-400 mt-1">
            Max:{" "}
            {Math.max(
              ...processedData.map((d: any) => d[yAxis] || 0)
            ).toLocaleString()}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const RadialBarChartComponent = ({
  chartData,
  chartConfig,
  colors,
  TooltipComponent,
}: ChartComponentProps) => {
  // Destructure config with defaults
  const {
    title,
    variant = "radialBar",
    yAxis = "RETURN_RATE",
    xAxis = "name",
    showLabels = false,
    showPercentage = true,
    animationDuration = 800,
    legendPosition = "bottom",
    innerRadius = "20%",
    outerRadius = "100%",
    barSize = 15,
    cornerRadius = 0,
    startAngle = 90,
    endAngle = 450,
    clockWise = true,
    minAngle = 15,
    maxBarSize = 30,
    showBackground = true,
    backgroundOpacity = 0.3,
    centerText,
    centerSubText,
    dataLabelPosition = "insideStart",
    gradient = false,
    gradientDirection = "radial",
    strokeWidth = 0,
    strokeColor = "#1e293b",
    hoverAnimation = true,
    animationType = "ease",
    showMinMaxLabels = false,
    showValueOnHover = true,
    compactLegend = false,
    customTooltipFormatter,
    showLegend: initialShowLegend = true,
    showTooltip: initialShowTooltip = true,
    showGrid: initialShowGrid = false,
    showCenterText: initialShowCenterText = true,
    showDataLabels: initialShowDataLabels = false,
    sortBy: initialSortBy = "none",
    sortOrder: initialSortOrder = "desc",
  } = chartConfig;

  // States
  const [showLegend, setShowLegend] = useState(initialShowLegend);
  const [showTooltip, setShowTooltip] = useState(initialShowTooltip);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [chartVariant, setChartVariant] = useState<
    "radialBar" | "gauge" | "semicircle" | "quarter"
  >(variant);
  const [showCenterText, setShowCenterText] = useState(initialShowCenterText);
  const [showDataLabels, setShowDataLabels] = useState(initialShowDataLabels);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // Sync states with props on changes
  useEffect(() => setShowLegend(initialShowLegend), [initialShowLegend]);
  useEffect(() => setShowTooltip(initialShowTooltip), [initialShowTooltip]);
  useEffect(() => setShowGrid(initialShowGrid), [initialShowGrid]);
  useEffect(() => setChartVariant(variant), [variant]);
  useEffect(
    () => setShowCenterText(initialShowCenterText),
    [initialShowCenterText]
  );
  useEffect(
    () => setShowDataLabels(initialShowDataLabels),
    [initialShowDataLabels]
  );
  useEffect(() => setSortBy(initialSortBy), [initialSortBy]);
  useEffect(() => setSortOrder(initialSortOrder), [initialSortOrder]);

  // Memoized chart dimension settings based on variant
  const getChartDimensions = useMemo(() => {
    switch (chartVariant) {
      case "gauge":
        return {
          innerRadius: "30%",
          outerRadius: "100%",
          startAngle: 180,
          endAngle: 0,
        };
      case "semicircle":
        return {
          innerRadius,
          outerRadius,
          startAngle: 180,
          endAngle: 0,
        };
      case "quarter":
        return {
          innerRadius,
          outerRadius,
          startAngle: 180,
          endAngle: 90,
        };
      default:
        return {
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
        };
    }
  }, [chartVariant, innerRadius, outerRadius, startAngle, endAngle]);

  // Calculate total for percentages
  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item[yAxis] || 0), 0);
  }, [chartData, yAxis]);

  // Process data with colors, sorting, and percentages
  const processedData = useMemo(() => {
    let data = chartData.map((item, index) => ({
      ...item,
      fill: item.fill || colors[index % colors.length],
      percentage: total > 0 ? ((item[yAxis] || 0) / total) * 100 : 0,
      color: colors[index % colors.length],
    }));

    if (sortBy !== "none") {
      data = data.sort((a, b) => {
        let compareValue = 0;
        if (sortBy === "value") {
          compareValue = (a[yAxis] || 0) - (b[yAxis] || 0);
        } else if (sortBy === "name") {
          compareValue = (a[xAxis] || "")
            .toString()
            .localeCompare((b[xAxis] || "").toString());
        }
        return sortOrder === "asc" ? compareValue : -compareValue;
      });

      // Reapply colors after sorting
      data = data.map((item, index) => ({
        ...item,
        fill: colors[index % colors.length],
        color: colors[index % colors.length],
      }));
    }
    return data;
  }, [chartData, colors, yAxis, total, sortBy, sortOrder, xAxis]);

  // Enhanced data for legend and tooltip usage
  const enhancedData = useMemo(() => {
    return processedData.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item[yAxis] || 0) / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }, [processedData, total, yAxis, colors]);

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {title ||
              (chartVariant === "gauge" ? "Gauge" : "Radial Bar") + " Chart"}
          </CardTitle>
          <div className="text-sm text-slate-400 mt-1">
            Total: {total.toLocaleString()} • {enhancedData.length} segments
          </div>
        </div>

        {/* Chart Variant Buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
          {/* {["radialBar", "gauge", "semicircle", "quarter"].map( */}
          {["radialBar", "gauge", "quarter"].map((variantOption) => (
            <Button
              key={variantOption}
              variant={chartVariant === variantOption ? "default" : "outline"}
              onClick={() => setChartVariant(variantOption as any)}
              size="sm"
            >
              {variantOption.charAt(0).toUpperCase() + variantOption.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Control Panel */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <Button
            variant={sortBy === "value" ? "default" : "outline"}
            onClick={() => setSortBy(sortBy === "value" ? "none" : "value")}
            size="sm"
            className="h-7"
          >
            Sort by Value
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => setSortBy(sortBy === "name" ? "none" : "name")}
            size="sm"
            className="h-7"
          >
            Sort by Name
          </Button>
          {sortBy !== "none" && (
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              size="sm"
              className="h-7"
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </Button>
          )}
          <Button
            variant={showDataLabels ? "default" : "outline"}
            onClick={() => setShowDataLabels(!showDataLabels)}
            size="sm"
            className="h-7"
          >
            Labels
          </Button>
          <Button
            variant={showCenterText ? "default" : "outline"}
            onClick={() => setShowCenterText(!showCenterText)}
            size="sm"
            className="h-7"
          >
            Center Text
          </Button>
        </div>

        <div className="relative">
          <ResponsiveContainer width="100%" height={400}>
            <RadialBarChart
              innerRadius={getChartDimensions.innerRadius}
              outerRadius={getChartDimensions.outerRadius}
              barSize={Math.min(barSize, maxBarSize)}
              data={processedData}
              startAngle={getChartDimensions.startAngle}
              endAngle={getChartDimensions.endAngle}
            >
              <RadialBar
                minAngle={minAngle}
                label={
                  showDataLabels
                    ? {
                        position: dataLabelPosition,
                        fill: "#fff",
                        fontSize: 12,
                        formatter: (value: any) =>
                          `${value}${showPercentage ? "%" : ""}`,
                      }
                    : false
                }
                background={
                  showBackground
                    ? { fill: strokeColor, opacity: backgroundOpacity }
                    : false
                }
                clockWise={clockWise}
                dataKey={yAxis}
                cornerRadius={cornerRadius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              {showTooltip && (
                <Tooltip
                  content={
                    TooltipComponent ? (
                      <TooltipComponent />
                    ) : (
                      <EnhancedTooltip
                        customTooltipFormatter={customTooltipFormatter}
                        showPercentage={showPercentage}
                        showMinMaxLabels={showMinMaxLabels}
                        processedData={processedData}
                        xAxis={xAxis}
                        yAxis={yAxis}
                      />
                    )
                  }
                />
              )}
              {showLegend && (
                <Legend
                  iconSize={compactLegend ? 8 : 10}
                  layout={
                    legendPosition === "left" || legendPosition === "right"
                      ? "vertical"
                      : "horizontal"
                  }
                  verticalAlign={
                    legendPosition === "top"
                      ? "top"
                      : legendPosition === "bottom"
                      ? "bottom"
                      : "middle"
                  }
                  align={
                    legendPosition === "left"
                      ? "left"
                      : legendPosition === "right"
                      ? "right"
                      : "center"
                  }
                  wrapperStyle={{ fontSize: compactLegend ? "10px" : "12px" }}
                />
              )}
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center text */}
          {showCenterText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-200">
                  {centerText || total.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  {centerSubText || "Total"}
                </div>
                {showMinMaxLabels && (
                  <div className="text-xs text-slate-500 mt-1">
                    Max:{" "}
                    {Math.max(
                      ...processedData.map((d) => d[yAxis] || 0)
                    ).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom Legend Below */}
        {showLegend && (
          <div
            className={`mt-4 flex flex-wrap gap-${
              compactLegend ? "2" : "4"
            } justify-center`}
          >
            {enhancedData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span
                  className={`w-${compactLegend ? "3" : "4"} h-${
                    compactLegend ? "3" : "4"
                  } rounded`}
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`text-${
                    compactLegend ? "xs" : "sm"
                  } text-slate-300`}
                >
                  {item[xAxis]}
                  {showPercentage && ` (${item.percentage.toFixed(1)}%)`}
                  {showMinMaxLabels &&
                    item[yAxis] ===
                      Math.max(...processedData.map((d) => d[yAxis] || 0)) && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        MAX
                      </Badge>
                    )}
                  {showMinMaxLabels &&
                    item[yAxis] ===
                      Math.min(...processedData.map((d) => d[yAxis] || 0)) && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        MIN
                      </Badge>
                    )}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RadialBarChartComponent;
