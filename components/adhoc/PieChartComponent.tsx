"use client";

import React, { useState, useMemo, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChartConfig {
  type: "pie";
  colorScheme?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  title?: string;
  variant?: "pie" | "donut" | "sunburst";
  subCategory?: string;
  yAxis?: string;
  xAxis?: string;
  colorBy?: "CATEGORY";
  showPercentage?: boolean;
  animationDuration?: number;
  legendPosition?: "top" | "bottom" | "left" | "right";
}

interface ChartComponentProps {
  chartData: any[];
  chartConfig: ChartConfig;
  colors: string[];
  TooltipComponent?: React.ComponentType<any>;
}

const PieChartComponent = ({
  chartData,
  chartConfig,
  colors,
  TooltipComponent,
}: ChartComponentProps) => {
  const hasSubCategory =
    typeof chartConfig.subCategory === "string" &&
    chartConfig.subCategory.trim() !== "" &&
    chartConfig.subCategory !== chartConfig.xAxis;

  // Add state for configurable options
  const [showLegend, setShowLegend] = useState(chartConfig.showLegend ?? true);
  const [showTooltip, setshowTooltip] = useState(
    chartConfig.showTooltip ?? true
  );
  const [showGrid, setshowGrid] = useState(chartConfig.showGrid ?? false);

  // Add state for chart variant toggle
  const [chartVariant, setChartVariant] = useState<"pie" | "donut">(
    chartConfig.variant === "pie" ? "pie" : "donut"
  );

  // ✅ FIX: Sync state with prop changes
  useEffect(() => {
    setShowLegend(chartConfig.showLegend ?? true);
  }, [chartConfig.showLegend]);

  useEffect(() => {
    setshowTooltip(chartConfig.showTooltip ?? true);
  }, [chartConfig.showTooltip]);

  useEffect(() => {
    setshowGrid(chartConfig.showGrid ?? false);
  }, [chartConfig.showGrid]);

  useEffect(() => {
    setChartVariant(chartConfig.variant === "pie" ? "pie" : "donut");
  }, [chartConfig.variant]);

  useEffect(() => {
    console.log("ChartConfig updated:", chartConfig, chartData);
  }, [chartConfig, chartData]);

  // Determine chart type based on config and data
  const chartType = useMemo(() => {
    if (hasSubCategory) {
      return "sunburst";
    } else {
      return chartVariant;
    }
  }, [chartVariant, hasSubCategory]);

  const {
    title,
    variant = "donut",
    yAxis = "value",
    xAxis = "category",
    subCategory,
    showLabels = false, // Default to false since we're using custom legend
    showPercentage = true,
    animationDuration = 800,
    legendPosition = "bottom",
  } = chartConfig;

  // Calculate total for percentage calculations
  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item[yAxis] || 0), 0);
  }, [chartData, yAxis]);

  // Get unique categories and subcategories for stats
  const categoryStats = useMemo(() => {
    if (!hasSubCategory || !subCategory) return [];

    const categoryMap = new Map();
    const uniqueSubCategories = new Set();

    chartData.forEach((item) => {
      const cat = item[xAxis] || "Unknown";
      const subCat = item[subCategory] || "Unknown";
      const value = item[yAxis] || 0;

      uniqueSubCategories.add(subCat);

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { total: 0, subcategories: [] });
      }

      categoryMap.get(cat).total += value;
      categoryMap.get(cat).subcategories.push({ name: subCat, value });
    });

    return {
      categories: Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        total: data.total,
        subcategories: data.subcategories,
      })),
      uniqueSubCategories: Array.from(uniqueSubCategories),
    };
  }, [chartData, xAxis, subCategory, yAxis, hasSubCategory]);

  // Transform data for proper sunburst chart
  const transformDataForSunburst = useMemo(() => {
    if (!subCategory || !hasSubCategory || subCategory === xAxis) return null;

    // Group data by category first
    const categoryGroups = new Map();

    chartData.forEach((item) => {
      const categoryName = item[xAxis] || "Unknown";
      const subCategoryName = item[subCategory] || "Unknown";
      const value = item[yAxis] || 0;

      // Skip if category and subcategory are the same (no real hierarchy)
      if (categoryName === subCategoryName) return;

      if (!categoryGroups.has(categoryName)) {
        categoryGroups.set(categoryName, {
          total: 0,
          subcategories: new Map(),
        });
      }

      const group = categoryGroups.get(categoryName);
      group.total += value;

      // Group subcategories to avoid duplicates
      if (!group.subcategories.has(subCategoryName)) {
        group.subcategories.set(subCategoryName, 0);
      }
      group.subcategories.set(
        subCategoryName,
        group.subcategories.get(subCategoryName) + value
      );
    });

    // If no valid hierarchy found, return null to fallback to pie/donut
    if (categoryGroups.size === 0) return null;

    // Create sunburst data structure
    const sunburstData = Array.from(categoryGroups.entries()).map(
      ([categoryName, data], categoryIndex) => {
        const categoryColor = colors[categoryIndex % colors.length];

        return {
          name: categoryName,
          value: data.total,
          itemStyle: {
            color: categoryColor,
            opacity: 0.8,
          },
          children: Array.from(data.subcategories.entries()).map(
            ([subCatName, subCatValue], subIndex) => {
              // Create variations of the parent category color for subcategories
              const baseColor = categoryColor;
              const opacity = 0.6 + (subIndex * 0.2) / data.subcategories.size;

              return {
                name: `${categoryName} - ${subCatName}`,
                value: subCatValue,
                itemStyle: {
                  color: baseColor,
                  opacity: Math.min(opacity, 1),
                },
                // Store original subcategory name for tooltip
                originalSubCategory: subCatName,
                parentCategory: categoryName,
              };
            }
          ),
        };
      }
    );

    return sunburstData;
  }, [chartData, subCategory, colors, yAxis, xAxis, hasSubCategory]);

  // Transform data for donut/pie chart - FIXED to group by category
  const transformDataForDonut = useMemo(() => {
    // Always group by main category (xAxis) regardless of subcategory presence
    const categoryGroups = new Map();

    chartData.forEach((item) => {
      const categoryName = item[xAxis] || "Unknown";
      const value = item[yAxis] || 0;

      if (!categoryGroups.has(categoryName)) {
        categoryGroups.set(categoryName, 0);
      }

      categoryGroups.set(
        categoryName,
        categoryGroups.get(categoryName) + value
      );
    });

    // Convert to chart data format
    return Array.from(categoryGroups.entries()).map(([name, value], index) => ({
      name: name,
      value: value,
      itemStyle: {
        color: colors[index % colors.length],
      },
    }));
  }, [chartData, colors, yAxis, xAxis]);

  // Generate legend data for sunburst
  const sunburstLegendData = useMemo(() => {
    if (!transformDataForSunburst) return [];

    return transformDataForSunburst.map((item) => item.name);
  }, [transformDataForSunburst]);

  // Generate ECharts options
  const getChartOptions = useMemo(() => {
    const isSunburst = chartType === "sunburst" && transformDataForSunburst;

    const baseOptions = {
      tooltip: showTooltip
        ? {
            trigger: "item",
            backgroundColor: "#1e293b",
            borderColor: "#475569",
            textStyle: {
              color: "#cbd5e1",
            },
            formatter: function (params: any) {
              const percentage = ((params.value / total) * 100).toFixed(1);
              const displayName = params.data?.originalSubCategory
                ? `${params.data.parentCategory} - ${params.data.originalSubCategory}`
                : params.name;

              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px; color: #f1f5f9;">${displayName}</div>
                  <div style="color: #cbd5e1;">Value: <span style="font-family: monospace; color: #ffffff;">${params.value?.toLocaleString()}</span></div>
                  ${
                    showPercentage
                      ? `<div style="color: #cbd5e1;">Percentage: <span style="font-family: monospace; color: #ffffff;">${percentage}%</span></div>`
                      : ""
                  }
                </div>
              `;
            },
          }
        : undefined,

      legend: showLabels
        ? {
            orient:
              legendPosition === "left" || legendPosition === "right"
                ? "vertical"
                : "horizontal",
            [legendPosition]:
              legendPosition === "top"
                ? 10
                : legendPosition === "bottom"
                ? 10
                : 20,
            textStyle: {
              color: "#cbd5e1",
              fontSize: 12,
            },
            itemGap: 10,
            itemWidth: 14,
            itemHeight: 14,
            data: isSunburst ? sunburstLegendData : undefined,
          }
        : undefined,

      animation: true,
      animationDuration: animationDuration,

      backgroundColor: "transparent",
    };

    if (isSunburst) {
      return {
        ...baseOptions,
        series: [
          {
            name: "Sunburst",
            type: "sunburst",
            data: transformDataForSunburst,
            radius: [0, 140],
            center: ["50%", "50%"],
            sort: null,
            emphasis: {
              focus: "ancestor",
              label: {
                show: false, // Hide labels on emphasis
              },
            },
            levels: [
              {
                // Root level (not visible, just for structure)
              },
              {
                // First layer - Categories (inner ring)
                r0: "20%",
                r: "50%",
                itemStyle: {
                  borderWidth: 2,
                  borderColor: "#1e293b",
                },
                label: {
                  show: false, // Hide labels on inner ring
                },
              },
              {
                // Second layer - Subcategories (outer ring)
                r0: "50%",
                r: "85%",
                label: {
                  show: false, // Hide labels on outer ring
                },
                itemStyle: {
                  borderWidth: 1,
                  borderColor: "#1e293b",
                },
              },
            ],
          },
        ],
      };
    } else {
      return {
        ...baseOptions,
        series: [
          {
            name: chartType === "pie" ? "Pie Chart" : "Donut Chart",
            type: "pie",
            data: transformDataForDonut,
            radius: chartType === "pie" ? "90%" : ["25%", "90%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: "#1e293b",
              borderWidth: 2,
            },
            label: {
              show: false, // Hide all segment labels - show only legend
            },
            labelLine: {
              show: false, // Hide label lines since we're not showing labels
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
    }
  }, [
    chartType,
    transformDataForSunburst,
    transformDataForDonut,
    showTooltip,
    showLegend,
    showLabels,
    showPercentage,
    total,
    legendPosition,
    animationDuration,
    sunburstLegendData,
  ]);

  // Enhanced data for stats - FIXED to use grouped data for pie/donut
  const enhancedData = useMemo(() => {
    if (chartType === "pie" || chartType === "donut") {
      return transformDataForDonut.map((item, index) => ({
        ...item,
        percentage: total > 0 ? ((item.value || 0) / total) * 100 : 0,
        color: colors[index % colors.length],
      }));
    }

    return chartData.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item[yAxis] || 0) / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }, [chartData, total, yAxis, colors, chartType, transformDataForDonut]);

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {title ||
              `${
                chartType === "sunburst"
                  ? "Sunburst"
                  : chartType === "pie"
                  ? "Pie"
                  : "Donut"
              } Chart`}
          </CardTitle>
          <div className="text-sm text-slate-400 mt-1">
            Total: {total.toLocaleString()} • {enhancedData.length} segments
            {hasSubCategory && categoryStats.categories && (
              <span>
                {" "}
                • {categoryStats.categories.length} categories •{" "}
                {categoryStats.uniqueSubCategories.length} subcategories
              </span>
            )}
          </div>
        </div>

        {/* Chart Variant Toggle Buttons - Only show when no subcategory */}
        {!hasSubCategory && (
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              variant={chartVariant === "donut" ? "default" : "outline"}
              onClick={() => setChartVariant("donut")}
              size="sm"
            >
              Donut
            </Button>
            <Button
              variant={chartVariant === "pie" ? "default" : "outline"}
              onClick={() => setChartVariant("pie")}
              size="sm"
            >
              Pie
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative">
          <ReactECharts
            option={getChartOptions}
            style={{ height: "400px", width: "100%" }}
            opts={{ renderer: "svg" }}
          />

          {/* Center text for sunburst and donut charts */}
          {(chartType === "donut" || chartType === "sunburst") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-sm font-bold text-slate-200">
                  {total.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Total</div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Custom Legend Below Chart - FIXED */}
        {(chartType === "pie" || chartType === "donut") && showLegend && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {enhancedData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">
                  {item.name} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}

        {chartType === "sunburst" && categoryStats.categories && showLegend && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {categoryStats.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-sm text-slate-300">{cat.name}</span>
              </div>
            ))}
          </div>
        )}
        {/* <pre>{chartConfig && JSON.stringify(chartConfig, null, 2)}</pre> */}
      </CardContent>
    </Card>
  );
};

export default PieChartComponent;
