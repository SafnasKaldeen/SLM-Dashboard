"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Battery,
  Zap,
  TrendingUp,
  Clock,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertCircle,
} from "lucide-react";

interface BatterySwapMetricsProps {
  filters?: {
    aggregation?: "daily" | "monthly" | "quarterly" | "annually";
    selectedAreas?: string[];
    selectedStations?: string[];
  };
  data?: {
    totalSwaps?: number;
    totalRevenue?: number;
    avgRevenuePerSwap?: number;
    avgSwapTime?: number;
    swapsChange?: string;
    revenueChange?: string;
    revenuePerSwapChange?: string;
    swapTimeChange?: string;
  };
  loading?: boolean;
  error?: string;
}

export function BatterySwapMetrics({
  filters,
  data,
  loading = false,
  error,
}: BatterySwapMetricsProps) {
  const aggregationLabel = filters?.aggregation || "month";

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load metrics data
            </p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show no data state
  if (
    !data ||
    (data.totalSwaps === undefined &&
      data.totalRevenue === undefined &&
      data.avgRevenuePerSwap === undefined &&
      data.avgSwapTime === undefined)
  ) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Battery className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No battery swap data available
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your filters or check back later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricsData = [
    {
      title: "Total Battery Swaps",
      value: data.totalSwaps?.toLocaleString() || "—",
      change: data.swapsChange || null,
      icon: Battery,
      description: `vs last ${aggregationLabel}`,
      available: data.totalSwaps !== undefined,
    },
    {
      title: "Battery Swap Revenue",
      value: data.totalRevenue ? `${data.totalRevenue.toLocaleString()}` : "—",
      change: data.revenueChange || null,
      icon: Zap,
      description: `vs last ${aggregationLabel}`,
      available: data.totalRevenue !== undefined,
    },
    {
      title: "Revenue per Swap",
      value: data.avgRevenuePerSwap
        ? `${data.avgRevenuePerSwap.toFixed(2)}`
        : "—",
      change: data.revenuePerSwapChange || null,
      icon: TrendingUp,
      description: `vs last ${aggregationLabel}`,
      available: data.avgRevenuePerSwap !== undefined,
    },
    {
      title: "Average Swap Time",
      value: data.avgSwapTime ? `${data.avgSwapTime} min` : "—",
      change: data.swapTimeChange || null,
      icon: Clock,
      description: `vs last ${aggregationLabel}`,
      available: data.avgSwapTime !== undefined,
      invertChange: true, // For swap time, decrease is good (green)
    },
  ];

  return (
    <>
      {metricsData.map((metric) => {
        const Icon = metric.icon;

        if (!metric.available) {
          return (
            <Card key={metric.title} className="opacity-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <div className="text-xs text-muted-foreground">
                  Data not available
                </div>
              </CardContent>
            </Card>
          );
        }

        const changeValue = metric.change;
        const hasChange = changeValue && changeValue !== "0%";
        let isPositive = false;
        let showGreen = false;

        if (hasChange) {
          isPositive = !changeValue.startsWith("-");
          // For swap time, invert the color logic (decrease is good)
          showGreen = metric.invertChange ? !isPositive : isPositive;
        }

        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {hasChange ? (
                <div className="flex items-center text-xs text-muted-foreground">
                  {isPositive ? (
                    <ArrowUpIcon
                      className={`mr-1 h-3 w-3 ${
                        showGreen ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  ) : (
                    <ArrowDownIcon
                      className={`mr-1 h-3 w-3 ${
                        showGreen ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  )}
                  <span
                    className={showGreen ? "text-green-500" : "text-red-500"}
                  >
                    {changeValue}
                  </span>
                  <span className="ml-1">{metric.description}</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {metric.description}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
