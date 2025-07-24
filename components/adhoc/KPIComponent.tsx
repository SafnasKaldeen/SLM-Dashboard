import React, { use, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  BarChart3,
  Activity,
  Hash,
  Type,
  Calendar,
  Clock,
  Percent,
  DollarSign,
  AlertTriangle,
  Info,
  Target,
  Users,
  Zap,
} from "lucide-react";

interface KPIConfig {
  type: "kpi";
  column: string;
  calculationType?:
    | "sum"
    | "avg"
    | "count"
    | "min"
    | "max"
    | "median"
    | "mode"
    | "distinct"
    | "first"
    | "last"
    | "range"
    | "std"
    | "variance";
  showTrend?: boolean;
  previousPeriodData?: any[];
  formatType?:
    | "auto"
    | "number"
    | "currency"
    | "percentage"
    | "date"
    | "time"
    | "duration"
    | "text";
  currencySymbol?: string;
  showIcon?: boolean;
  colorScheme?:
    | "auto"
    | "blue"
    | "green"
    | "red"
    | "purple"
    | "orange"
    | "yellow";
  showDetails?: boolean;
  target?: number;
  groupBy?: string;
  filterBy?: { column: string; value: any };
}

interface KPIComponentProps {
  chartData: any[];
  chartConfig: KPIConfig;
}

// Data type detection utility
const detectDataType = (
  values: any[]
): "number" | "string" | "date" | "boolean" | "mixed" => {
  if (values.length === 0) return "mixed";

  const sampleSize = Math.min(values.length, 10);
  const sample = values.slice(0, sampleSize);

  let numberCount = 0;
  let stringCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  sample.forEach((val) => {
    if (val === null || val === undefined) return;

    if (typeof val === "boolean") {
      booleanCount++;
    } else if (typeof val === "number" && !isNaN(val)) {
      numberCount++;
    } else if (typeof val === "string") {
      // Check if it's a valid date
      const dateVal = new Date(val);
      if (
        !isNaN(dateVal.getTime()) &&
        val.match(
          /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}/
        )
      ) {
        dateCount++;
      } else if (!isNaN(Number(val)) && val.trim() !== "") {
        numberCount++;
      } else {
        stringCount++;
      }
    }
  });

  const total = numberCount + stringCount + dateCount + booleanCount;
  if (total === 0) return "mixed";

  if (numberCount / total > 0.8) return "number";
  if (dateCount / total > 0.6) return "date";
  if (booleanCount / total > 0.8) return "boolean";
  if (stringCount / total > 0.8) return "string";

  return "mixed";
};

// Get valid calculations based on data type
const getValidCalculations = (dataType: string): string[] => {
  switch (dataType) {
    case "number":
      return [
        "sum",
        "avg",
        "count",
        "min",
        "max",
        "median",
        "range",
        "std",
        "variance",
        "distinct",
      ];
    case "string":
      return ["count", "distinct", "mode", "first", "last"];
    case "date":
      return ["count", "min", "max", "first", "last", "distinct", "range"];
    case "boolean":
      return ["count", "distinct", "mode"];
    case "mixed":
    default:
      return ["count", "distinct", "first", "last"];
  }
};

const KPIComponent = ({ chartData, chartConfig }: KPIComponentProps) => {
  const {
    column,
    calculationType = "sum",
    showTrend = true,
    previousPeriodData = [],
    formatType = "auto",
    currencySymbol = "Rs ",
    showIcon = true,
    colorScheme = "auto",
    showDetails = true,
    target,
    groupBy,
    filterBy,
  } = chartConfig;

  // Helper function to check if filter should be applied
  const shouldApplyFilter = (filterConfig: any) => {
    if (!filterConfig) return false;

    // Check if column exists and is not empty
    if (!filterConfig.column || filterConfig.column.trim() === "") return false;

    // Check if value exists and is not empty/null/undefined
    if (filterConfig.value === null || filterConfig.value === undefined)
      return false;

    // Handle string values
    if (
      typeof filterConfig.value === "string" &&
      filterConfig.value.trim() === ""
    )
      return false;

    // Handle array values
    if (Array.isArray(filterConfig.value) && filterConfig.value.length === 0)
      return false;

    // Handle object values (like {value: '', order: ''})
    if (
      typeof filterConfig.value === "object" &&
      !Array.isArray(filterConfig.value)
    ) {
      if (
        !filterConfig.value.value ||
        (typeof filterConfig.value.value === "string" &&
          filterConfig.value.value.trim() === "")
      ) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const shouldFilter = shouldApplyFilter(filterBy);

    if (!shouldFilter) {
      console.log("🚫 No filter applied - showing all data");
    } else {
      console.log("✅ Filter applied:", filterBy);
    }
  }, [filterBy]);

  // Filter data if filterBy is specified and valid
  const filteredData = useMemo(() => {
    // If no filter should be applied, return all data
    if (!shouldApplyFilter(filterBy)) {
      console.log("Returning all data - no valid filter");
      return chartData;
    }

    console.log("Applying filter:", filterBy);
    console.log("Original data length:", chartData.length);

    const filtered = chartData.filter((item) => {
      const itemValue = item[filterBy.column];
      const filterValue = filterBy.value;

      // Handle different comparison types
      if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
        // If filter value is an object, compare with its 'value' property
        return itemValue == filterValue.value;
      }

      return itemValue == filterValue;
    });

    console.log("Filtered data length:", filtered.length);
    return filtered;
  }, [chartData, filterBy]);

  const title = `${calculationType} of ${column}`;
  const description = `This KPI shows the ${calculationType} of the ${column} column.`;

  const decimalPlaces = ["avg", "std", "variance"].includes(calculationType)
    ? 2
    : 0;

  const showProgress = target ? target : false;

  // Extract and clean values
  const extractedValues = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    let values = filteredData
      .map((item) => item[column])
      .filter((val) => val !== null && val !== undefined && val !== "");

    // Convert string numbers to actual numbers
    values = values.map((val) => {
      if (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "") {
        return Number(val);
      }
      return val;
    });

    return values;
  }, [filteredData, column]);

  // Detect data type
  const dataType = useMemo(() => {
    return detectDataType(extractedValues);
  }, [extractedValues]);

  // Get valid calculations for this data type
  const validCalculations = useMemo(() => {
    return getValidCalculations(dataType);
  }, [dataType]);

  // Determine calculation type (auto-select if not provided or invalid)
  const effectiveCalculationType = useMemo(() => {
    if (calculationType && validCalculations.includes(calculationType)) {
      return calculationType;
    }

    // Auto-select based on data type
    if (dataType === "number") return "sum";
    if (dataType === "string") return "count";
    if (dataType === "date") return "count";
    if (dataType === "boolean") return "count";

    return "count";
  }, [calculationType, validCalculations, dataType]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (extractedValues.length === 0) {
      return {
        value: 0,
        nullCount: filteredData.length,
        totalCount: filteredData.length,
        uniqueCount: 0,
        hasErrors:
          filteredData.length === 0 &&
          chartData.length > 0 &&
          shouldApplyFilter(filterBy),
        errorMessage:
          filteredData.length === 0 &&
          chartData.length > 0 &&
          shouldApplyFilter(filterBy)
            ? "No data matches the current filter"
            : "No valid data found",
      };
    }

    const numericValues = extractedValues.filter(
      (val) => typeof val === "number" && !isNaN(val)
    );
    const stringValues = extractedValues.filter(
      (val) => typeof val === "string"
    );
    const dateValues = extractedValues.filter((val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return val instanceof Date && !isNaN(val.getTime());
    });

    const uniqueValues = [...new Set(extractedValues)];

    let calculatedValue = 0;
    let hasErrors = false;
    let errorMessage = "";

    try {
      switch (effectiveCalculationType) {
        case "sum":
          calculatedValue = numericValues.reduce((sum, val) => sum + val, 0);
          break;
        case "avg":
          calculatedValue =
            numericValues.length > 0
              ? numericValues.reduce((sum, val) => sum + val, 0) /
                numericValues.length
              : 0;
          break;
        case "count":
          calculatedValue = extractedValues.length;
          break;
        case "distinct":
          calculatedValue = uniqueValues.length;
          break;
        case "min":
          if (dataType === "number") {
            calculatedValue =
              numericValues.length > 0 ? Math.min(...numericValues) : 0;
          } else if (dataType === "date") {
            const dates = dateValues.map((d) => new Date(d).getTime());
            calculatedValue = dates.length > 0 ? Math.min(...dates) : 0;
          } else {
            calculatedValue =
              extractedValues.length > 0 ? extractedValues[0] : 0;
          }
          break;
        case "max":
          if (dataType === "number") {
            calculatedValue =
              numericValues.length > 0 ? Math.max(...numericValues) : 0;
          } else if (dataType === "date") {
            const dates = dateValues.map((d) => new Date(d).getTime());
            calculatedValue = dates.length > 0 ? Math.max(...dates) : 0;
          } else {
            calculatedValue =
              extractedValues.length > 0
                ? extractedValues[extractedValues.length - 1]
                : 0;
          }
          break;
        case "median":
          if (numericValues.length > 0) {
            const sorted = [...numericValues].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            calculatedValue =
              sorted.length % 2 === 0
                ? (sorted[mid - 1] + sorted[mid]) / 2
                : sorted[mid];
          }
          break;
        case "mode":
          const frequency = new Map();
          extractedValues.forEach((val) => {
            frequency.set(val, (frequency.get(val) || 0) + 1);
          });
          let maxFreq = 0;
          let modeValue = extractedValues[0];
          frequency.forEach((freq, val) => {
            if (freq > maxFreq) {
              maxFreq = freq;
              modeValue = val;
            }
          });
          calculatedValue = modeValue;
          break;
        case "range":
          if (dataType === "number" && numericValues.length > 0) {
            calculatedValue =
              Math.max(...numericValues) - Math.min(...numericValues);
          } else if (dataType === "date" && dateValues.length > 0) {
            const dates = dateValues.map((d) => new Date(d).getTime());
            calculatedValue = Math.max(...dates) - Math.min(...dates);
          }
          break;
        case "std":
          if (numericValues.length > 1) {
            const mean =
              numericValues.reduce((sum, val) => sum + val, 0) /
              numericValues.length;
            const variance =
              numericValues.reduce(
                (sum, val) => sum + Math.pow(val - mean, 2),
                0
              ) / numericValues.length;
            calculatedValue = Math.sqrt(variance);
          }
          break;
        case "variance":
          if (numericValues.length > 1) {
            const mean =
              numericValues.reduce((sum, val) => sum + val, 0) /
              numericValues.length;
            calculatedValue =
              numericValues.reduce(
                (sum, val) => sum + Math.pow(val - mean, 2),
                0
              ) / numericValues.length;
          }
          break;
        case "first":
          calculatedValue = extractedValues[0];
          break;
        case "last":
          calculatedValue = extractedValues[extractedValues.length - 1];
          break;
      }
    } catch (error) {
      hasErrors = true;
      errorMessage = `Calculation error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }

    return {
      value: calculatedValue,
      numericCount: numericValues.length,
      stringCount: stringValues.length,
      dateCount: dateValues.length,
      nullCount: filteredData.length - extractedValues.length,
      totalCount: filteredData.length,
      uniqueCount: uniqueValues.length,
      hasErrors,
      errorMessage,
    };
  }, [
    extractedValues,
    filteredData,
    effectiveCalculationType,
    dataType,
    chartData,
    filterBy,
  ]);

  // Auto-determine format type
  const effectiveFormatType = useMemo(() => {
    if (formatType !== "auto") return formatType;

    if (dataType === "date") return "date";
    if (dataType === "number") {
      // Check if values look like currency (contain $ or common currency patterns)
      const sampleValues = extractedValues.slice(0, 5);
      const hasCurrencyPattern = sampleValues.some(
        (val) =>
          typeof val === "string" &&
          (val.includes("$") || val.includes("€") || val.includes("£"))
      );
      if (hasCurrencyPattern) return "currency";

      // Check if values are percentages
      const hasPercentage = sampleValues.some(
        (val) => typeof val === "string" && val.includes("%")
      );
      if (hasPercentage) return "percentage";

      return "number";
    }

    return "text";
  }, [formatType, dataType, extractedValues]);

  // Calculate previous period value for trend
  const previousStats = useMemo(() => {
    if (!showTrend || !previousPeriodData || previousPeriodData.length === 0)
      return null;

    const prevValues = previousPeriodData
      .map((item) => item[column])
      .filter((val) => val !== null && val !== undefined && val !== "");

    if (prevValues.length === 0) return null;

    try {
      const numericPrevValues = prevValues.filter(
        (val) => typeof val === "number" && !isNaN(val)
      );

      let prevValue = 0;
      switch (effectiveCalculationType) {
        case "sum":
          prevValue = numericPrevValues.reduce((sum, val) => sum + val, 0);
          break;
        case "avg":
          prevValue =
            numericPrevValues.length > 0
              ? numericPrevValues.reduce((sum, val) => sum + val, 0) /
                numericPrevValues.length
              : 0;
          break;
        case "count":
          prevValue = prevValues.length;
          break;
        case "distinct":
          prevValue = [...new Set(prevValues)].length;
          break;
        default:
          prevValue = numericPrevValues.length > 0 ? numericPrevValues[0] : 0;
      }

      return { value: prevValue };
    } catch (error) {
      return null;
    }
  }, [previousPeriodData, column, effectiveCalculationType, showTrend]);

  // Calculate trend
  const trend = useMemo(() => {
    if (!showTrend || !previousStats || previousStats.value === 0) return null;

    const currentValue =
      typeof statistics.value === "number" ? statistics.value : 0;
    const change = currentValue - previousStats.value;
    const percentageChange = (change / Math.abs(previousStats.value)) * 100;

    return {
      change,
      percentageChange,
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
  }, [statistics.value, previousStats, showTrend]);

  // Format the display value
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";

    switch (effectiveFormatType) {
      case "currency":
        const numVal =
          typeof value === "number" ? value : parseFloat(value) || 0;
        return `${currencySymbol}${numVal.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })}`;
      case "percentage":
        const pctVal =
          typeof value === "number" ? value : parseFloat(value) || 0;
        return `${pctVal.toFixed(decimalPlaces)}%`;
      case "date":
        if (
          effectiveCalculationType === "min" ||
          effectiveCalculationType === "max"
        ) {
          return new Date(value).toLocaleDateString();
        }
        return value.toString();
      case "time":
        return new Date(value).toLocaleTimeString();
      case "duration":
        const hours = Math.floor(value / 3600000);
        const minutes = Math.floor((value % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
      case "number":
        const numericVal =
          typeof value === "number" ? value : parseFloat(value) || 0;
        return numericVal.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        });
      case "text":
      default:
        return value.toString();
    }
  };

  // Get icon based on calculation type and data type
  const getIcon = () => {
    if (!showIcon) return null;

    if (statistics.hasErrors) return <AlertTriangle className="w-5 h-5" />;

    switch (effectiveCalculationType) {
      case "sum":
        return <Calculator className="w-5 h-5" />;
      case "avg":
        return <BarChart3 className="w-5 h-5" />;
      case "count":
        return <Hash className="w-5 h-5" />;
      case "distinct":
        return <Users className="w-5 h-5" />;
      case "min":
      case "max":
        return <TrendingUp className="w-5 h-5" />;
      case "median":
        return <Minus className="w-5 h-5" />;
      case "mode":
        return <Target className="w-5 h-5" />;
      case "range":
        return <Activity className="w-5 h-5" />;
      case "std":
      case "variance":
        return <Zap className="w-5 h-5" />;
      case "first":
      case "last":
        if (dataType === "date") return <Calendar className="w-5 h-5" />;
        if (dataType === "string") return <Type className="w-5 h-5" />;
        return <Info className="w-5 h-5" />;
      default:
        return <Calculator className="w-5 h-5" />;
    }
  };

  // Get color scheme classes
  const getColorClasses = () => {
    let scheme = colorScheme;

    if (scheme === "auto") {
      if (statistics.hasErrors) scheme = "red";
      else if (dataType === "number") scheme = "blue";
      else if (dataType === "string") scheme = "purple";
      else if (dataType === "date") scheme = "green";
      else scheme = "orange";
    }

    const colorMap = {
      green: {
        icon: "text-green-400",
        value: "text-green-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
      red: {
        icon: "text-red-400",
        value: "text-red-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
      purple: {
        icon: "text-purple-400",
        value: "text-purple-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
      orange: {
        icon: "text-orange-400",
        value: "text-orange-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
      yellow: {
        icon: "text-yellow-400",
        value: "text-yellow-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
      blue: {
        icon: "text-blue-400",
        value: "text-blue-100",
        trend: {
          up: "text-green-400 bg-green-400/10",
          down: "text-red-400 bg-red-400/10",
          neutral: "text-slate-400 bg-slate-400/10",
        },
      },
    };

    return colorMap[scheme as keyof typeof colorMap] || colorMap.blue;
  };

  const colorClasses = getColorClasses();

  // Calculate progress if target is set
  const progress = useMemo(() => {
    if (!target || typeof statistics.value !== "number") return null;

    const percentage = (statistics.value / target) * 100;
    return {
      percentage: Math.min(percentage, 100),
      isComplete: percentage >= 100,
      remaining: Math.max(target - statistics.value, 0),
    };
  }, [target, statistics.value]);

  return (
    <Card className="bg-slate-900/40 border-slate-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div
                className={`p-2 rounded-lg bg-slate-800/50 ${colorClasses.icon}`}
              >
                {getIcon()}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold">
                {title ||
                  `${effectiveCalculationType.toUpperCase()} of ${column}`}
              </CardTitle>
              {description && (
                <p className="text-sm text-slate-400 mt-1">{description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="text-slate-300 border-slate-600"
            >
              {effectiveCalculationType.toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className="text-slate-300 border-slate-600"
            >
              {dataType.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {statistics.hasErrors ? (
          <div className="text-center py-4">
            <div className="text-red-400 text-sm mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              {filteredData.length === 0 &&
              chartData.length > 0 &&
              shouldApplyFilter(filterBy)
                ? "No Matching Data"
                : "Error"}
            </div>
            <div className="text-slate-400 text-xs">
              {statistics.errorMessage}
            </div>
            {filteredData.length === 0 &&
              chartData.length > 0 &&
              shouldApplyFilter(filterBy) && (
                <div className="text-slate-500 text-xs mt-2">
                  Try adjusting your filter criteria
                </div>
              )}
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <div
                  className={`text-3xl font-bold ${colorClasses.value} mb-1`}
                >
                  {formatValue(statistics.value)}
                </div>
                <div className="text-sm text-slate-400">
                  Based on {statistics.totalCount} records
                  {statistics.nullCount > 0 && (
                    <span className="text-yellow-400 ml-1">
                      ({statistics.nullCount} null)
                    </span>
                  )}
                </div>
              </div>

              {/* Trend indicator */}
              {showTrend && trend && (
                <div className="text-right">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      colorClasses.trend[
                        trend.direction as keyof typeof colorClasses.trend
                      ]
                    }`}
                  >
                    {trend.direction === "up" && (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {trend.direction === "down" && (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trend.direction === "neutral" && (
                      <Minus className="w-3 h-3" />
                    )}
                    {Math.abs(trend.percentageChange).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    vs previous period
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar for target */}
            {showProgress && progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress to target</span>
                  <span className="text-slate-300">
                    {progress.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 my-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress.isComplete ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Target: {formatValue(target)}
                  {!progress.isComplete &&
                    ` (${formatValue(progress.remaining)} remaining)`}
                </div>
              </div>
            )}

            {/* Additional stats */}
            {showDetails && (
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Data Type:</span>
                    <span className="ml-2 text-slate-200 capitalize">
                      {dataType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Unique Values:</span>
                    <span className="ml-2 text-slate-200">
                      {statistics.uniqueCount}
                    </span>
                  </div>
                  {dataType === "number" && (
                    <>
                      <div>
                        <span className="text-slate-400">Numeric Count:</span>
                        <span className="ml-2 text-slate-200">
                          {statistics.numericCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Valid Rate:</span>
                        <span className="ml-2 text-slate-200">
                          {(
                            (statistics.numericCount / statistics.totalCount) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </>
                  )}
                  {filterBy && (
                    <div className="col-span-2">
                      {filterBy.column && filterBy.value && (
                        <>
                          <span className="text-slate-400">Filter:</span>
                          <span className="ml-2 text-slate-200">
                            {`${filterBy.column} = ${filterBy.value}`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIComponent;
