"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HeatmapCell {
  x: any;
  y: any;
  value: number;
  color: string;
  label?: string;
}

interface HeatmapConfig {
  type: "heatmap";
  colorScheme?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  title?: string;
  variant?: "square" | "circle" | "rounded";
  showValues?: boolean;
  animationDuration?: number;
  legendPosition?: "top" | "bottom" | "left" | "right";
  gridGap?: 1 | 2 | 4;
  cellSize?: "small" | "medium" | "large";
  xAxis?: string;
  yAxis?: string;
}

interface HeatmapComponentProps {
  chartData: HeatmapCell[];
  chartConfig: HeatmapConfig;
  colors: string[];
  TooltipComponent?: React.ComponentType<any>;
}

const HeatmapComponent: React.FC<HeatmapComponentProps> = ({
  chartData,
  chartConfig,
  colors,
  TooltipComponent,
}) => {
  // State for configurable options
  const [showLegend, setShowLegend] = useState(chartConfig.showLegend ?? true);
  const [showTooltip, setShowTooltip] = useState(
    chartConfig.showTooltip ?? true
  );
  const [showGrid, setShowGrid] = useState(chartConfig.showGrid ?? false);
  const [showValues, setShowValues] = useState(chartConfig.showValues ?? true);
  const [showAxes, setShowAxes] = useState(chartConfig.showAxes ?? true);

  const [heatmapVariant, setHeatmapVariant] = useState<
    "square" | "circle" | "rounded"
  >(chartConfig.variant || "rounded");

  const [gridGap, setGridGap] = useState<1 | 2 | 4>(chartConfig.gridGap || 2);

  const [cellSize, setCellSize] = useState<"small" | "medium" | "large">(
    chartConfig.cellSize || "medium"
  );

  // Sync state with prop changes
  useEffect(() => {
    setShowLegend(chartConfig.showLegend ?? true);
  }, [chartConfig.showLegend]);

  useEffect(() => {
    setShowTooltip(chartConfig.showTooltip ?? true);
  }, [chartConfig.showTooltip]);

  useEffect(() => {
    setShowGrid(chartConfig.showGrid ?? false);
  }, [chartConfig.showGrid]);

  useEffect(() => {
    setShowValues(chartConfig.showValues ?? true);
  }, [chartConfig.showValues]);

  useEffect(() => {
    setShowAxes(chartConfig.showAxes ?? true);
  }, [chartConfig.showAxes]);

  useEffect(() => {
    setHeatmapVariant(chartConfig.variant || "rounded");
  }, [chartConfig.variant]);

  useEffect(() => {
    setGridGap(chartConfig.gridGap || 2);
  }, [chartConfig.gridGap]);

  useEffect(() => {
    setCellSize(chartConfig.cellSize || "medium");
  }, [chartConfig.cellSize]);

  const {
    title,
    showLabels = false,
    animationDuration = 800,
    legendPosition = "bottom",
  } = chartConfig;

  // Calculate unique X and Y values for axes
  const { uniqueXValues, uniqueYValues, gridData } = useMemo(() => {
    const xSet = new Set(chartData.map((cell) => cell.x));
    const ySet = new Set(chartData.map((cell) => cell.y));

    const uniqueX = Array.from(xSet).sort();
    const uniqueY = Array.from(ySet).sort();

    // Create a 2D grid mapping for proper positioning
    const grid = new Map();
    chartData.forEach((cell) => {
      const key = `${cell.x}-${cell.y}`;
      grid.set(key, cell);
    });

    return {
      uniqueXValues: uniqueX,
      uniqueYValues: uniqueY,
      gridData: grid,
    };
  }, [chartData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const values = chartData.map((cell) => cell.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = total / values.length;

    return { total, min, max, avg, count: values.length };
  }, [chartData]);

  // Calculate distinct colors and labels for legend
  const legendItems = useMemo(() => {
    const map = new Map();
    chartData.forEach(({ color, label }) => {
      if (label && !map.has(label)) {
        map.set(label, color);
      }
    });

    // If no labels, fall back to unique colors
    if (map.size === 0) {
      chartData.forEach(({ color }) => {
        if (!map.has(color)) {
          map.set(color, color);
        }
      });
    }

    return Array.from(map.entries()).map(([label, color]) => ({
      label,
      color,
    }));
  }, [chartData]);

  // Get cell size classes and pixel values
  const getCellSizeClass = () => {
    switch (cellSize) {
      case "small":
        return "w-8 h-8 text-xs";
      case "large":
        return "w-16 h-16 text-sm";
      default:
        return "w-12 h-12 text-xs";
    }
  };

  const cellSizeInPx = (() => {
    switch (cellSize) {
      case "small":
        return 32;
      case "large":
        return 64;
      default:
        return 48; // medium
    }
  })();

  const gapInPx = (() => {
    switch (gridGap) {
      case 1:
        return 4;
      case 4:
        return 16;
      default:
        return 8; // gap-2
    }
  })();

  // Get variant classes
  const getVariantClass = () => {
    switch (heatmapVariant) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded-md";
    }
  };

  // Get gap class
  const getGapClass = () => {
    switch (gridGap) {
      case 1:
        return "gap-1";
      case 4:
        return "gap-4";
      default:
        return "gap-2";
    }
  };

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {title || "Heatmap Chart"}
          </CardTitle>
          <div className="text-sm text-slate-400 mt-1">
            Total: {stats.total.toLocaleString()} • {stats.count} cells • Min:{" "}
            {stats.min.toFixed(1)} • Max: {stats.max.toFixed(1)} • Avg:{" "}
            {stats.avg.toFixed(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Main Chart Container */}
        <div className="flex flex-col items-center space-y-4">
          {/* Heatmap with Axes Container */}
          <div className="flex items-start justify-center">
            {/* Y-axis container */}
            {showAxes && (
              <div className="flex items-center mr-3">
                {/* Y-axis label (rotated) */}
                <div
                  className="text-sm font-medium text-slate-300 mr-2 select-none flex items-center justify-center"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    height: `${
                      uniqueYValues.length * cellSizeInPx +
                      (uniqueYValues.length - 1) * gapInPx
                    }px`,
                  }}
                >
                  {chartConfig.yAxis || "Y Axis"}
                </div>

                {/* Y-axis values */}
                <div className="flex flex-col justify-between select-none">
                  {uniqueYValues.map((yValue, index) => (
                    <div
                      key={index}
                      className="text-xs text-slate-400 font-mono flex items-center justify-end"
                      style={{
                        height: `${cellSizeInPx}px`,
                        marginBottom:
                          index < uniqueYValues.length - 1 ? `${gapInPx}px` : 0,
                      }}
                    >
                      {String(yValue)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Heatmap Grid Container */}
            <div className="flex flex-col items-center">
              {/* Heatmap Grid */}
              <div
                className={`grid ${getGapClass()}`}
                style={{
                  gridTemplateColumns: `repeat(${uniqueXValues.length}, ${cellSizeInPx}px)`,
                  gridTemplateRows: `repeat(${uniqueYValues.length}, ${cellSizeInPx}px)`,
                }}
              >
                {uniqueYValues.map((yValue) =>
                  uniqueXValues.map((xValue) => {
                    const cell = gridData.get(`${xValue}-${yValue}`);
                    const isEmpty = !cell;

                    return (
                      <div
                        key={`${xValue}-${yValue}`}
                        className={`
                          ${getCellSizeClass()} 
                          ${getVariantClass()}
                          flex items-center justify-center 
                          font-medium transition-all duration-300 
                          ${
                            isEmpty
                              ? "bg-slate-800/30 border border-dashed border-slate-600"
                              : "hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer"
                          }
                          relative group
                          ${showGrid ? "border border-slate-600" : ""}
                        `}
                        style={{
                          backgroundColor: isEmpty ? undefined : cell.color,
                          animationDelay: `${
                            (uniqueYValues.indexOf(yValue) *
                              uniqueXValues.length +
                              uniqueXValues.indexOf(xValue)) *
                            20
                          }ms`,
                        }}
                        title={
                          showTooltip && cell
                            ? `X: ${cell.x}, Y: ${
                                cell.y
                              }, Value: ${cell.value.toFixed(2)}${
                                cell.label ? `, Label: ${cell.label}` : ""
                              }`
                            : undefined
                        }
                      >
                        {showValues && cell && (
                          <span className="text-white drop-shadow-sm font-semibold">
                            {cell.value.toFixed(1)}
                          </span>
                        )}

                        {/* Enhanced Tooltip */}
                        {showTooltip && cell && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                            <div className="font-semibold text-slate-200">
                              {cell.label || `Cell (${cell.x}, ${cell.y})`}
                            </div>
                            <div className="text-slate-300">
                              Position: ({cell.x}, {cell.y})
                            </div>
                            <div className="text-slate-300">
                              Value:{" "}
                              <span className="font-mono text-white">
                                {cell.value.toFixed(2)}
                              </span>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* X-axis values */}
              {showAxes && (
                <div
                  className="flex justify-between mt-2"
                  style={{
                    width: `${
                      uniqueXValues.length * cellSizeInPx +
                      (uniqueXValues.length - 1) * gapInPx
                    }px`,
                  }}
                >
                  {uniqueXValues.map((xValue, index) => (
                    <div
                      key={index}
                      className="text-xs text-slate-400 font-mono flex items-center justify-center select-none"
                      style={{
                        width: `${cellSizeInPx}px`,
                      }}
                    >
                      {String(xValue)}
                    </div>
                  ))}
                </div>
              )}

              {/* X-axis label */}
              {showAxes && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-slate-300 text-center">
                    {chartConfig.xAxis || "X Axis"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Legend */}
          {showLegend && legendItems.length > 0 && (
            <div className="w-full">
              <div className="text-sm font-medium text-slate-300 mb-3 text-center">
                Legend
              </div>
              <div
                className={`flex flex-wrap gap-4 ${
                  legendPosition === "center"
                    ? "justify-center"
                    : legendPosition === "right"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {legendItems.map(({ label, color }, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span
                      className={`w-4 h-4 ${getVariantClass()}`}
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Panel */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-200">
                {stats.min.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Minimum</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-200">
                {stats.max.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Maximum</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-200">
                {stats.avg.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Average</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-200">
                {stats.count}
              </div>
              <div className="text-xs text-slate-400">Total Cells</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapComponent;
