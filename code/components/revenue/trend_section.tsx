// src/components/KeyMetricsSection.jsx
"use client";

import React from "react";
import { useSwaps } from "@/hooks/Snowflake/useSwaps";
import { TrendingUp, Battery } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartSkeleton,
  MetricCardSkeleton,
} from "@/components/revenue/skeletons";
import { BatterySwapMetrics } from "./battery-swap-metrics";
import { RevenueAnalyticsChart } from "./revenue-analytics-chart";
import SwapVolumeChart from "./swap-volume-chart";

const TrendSection = ({ filters }) => {
  const {
    data: swapData,
    loading,
    error,
    totalSwaps,
    totalRevenue, // ✅ Added missing totalRevenue
    revenuePerSwap,
    averageSwapTime,
    monthlySwapEfficiency,
    performanceComparison, // ✅ Added for growth calculations
    areawiseData,
    datewiseData,
  } = useSwaps(filters);

  // 🔍 Debug logging
  React.useEffect(() => {
    console.log("🔄 TrendSection Debug:", {
      filters,
      loading,
      error,
      totalSwaps,
      totalRevenue,
      revenuePerSwap,
      averageSwapTime,
      performanceComparison,
    });
  }, [
    filters,
    loading,
    error,
    totalSwaps,
    totalRevenue,
    revenuePerSwap,
    averageSwapTime,
  ]);

  // ✅ Calculate growth percentages for display
  const formatGrowthPercentage = (growth) => {
    if (growth === null || growth === undefined || isNaN(growth)) return null;
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  };

  // ✅ Prepare data in the format BatterySwapMetrics expects
  const metricsData = React.useMemo(() => {
    return {
      totalSwaps,
      totalRevenue,
      avgRevenuePerSwap: revenuePerSwap, // ✅ Map to expected prop name
      avgSwapTime: averageSwapTime, // ✅ Map to expected prop name
      swapsChange: performanceComparison
        ? formatGrowthPercentage(performanceComparison.growth.swapsGrowth)
        : null,
      revenueChange: performanceComparison
        ? formatGrowthPercentage(performanceComparison.growth.revenueGrowth)
        : null,
      revenuePerSwapChange: performanceComparison
        ? formatGrowthPercentage(
            performanceComparison.growth.revenuePerSwapGrowth
          )
        : null,
      swapTimeChange: null, // Add if you have swap time growth data
    };
  }, [
    totalSwaps,
    totalRevenue,
    revenuePerSwap,
    averageSwapTime,
    performanceComparison,
  ]);

  return (
    <>
      {/* Key Metrics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Key Performance Metrics</h2>
        </div>

        <div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* ✅ Fixed: Pass 'data' prop instead of 'metrics' */}
              <BatterySwapMetrics
                filters={filters}
                data={metricsData} // ✅ Correct prop name
                loading={loading}
                error={error?.message}
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Revenue Analytics Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Swap Trends
            </CardTitle>
            <CardDescription>
              Track revenue patterns from battery swap transactions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <RevenueAnalyticsChart
                filters={filters}
                data={monthlySwapEfficiency} // Your time-series data
                loading={loading}
                error={error?.message}
              />
            )}
          </CardContent>
        </Card>

        {/* Swap Volume Analysis Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5" /> Battery Swaps by Area Categories
            </CardTitle>
            <CardDescription>
              Distribution of swaps across different area types
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <SwapVolumeChart
                filters={filters}
                data={swapData}
                areawiseData={areawiseData}
                datewiseData={datewiseData}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <h4 className="font-semibold mb-2">
                ⚠️ Failed to load swap metrics
              </h4>
              <p className="text-sm align-middle">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🔍 Debug Panel (Development Only) */}
      {/* {process.env.NODE_ENV === "development" && (
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">🔍 Debug Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <div>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </div>
              <div>
                <strong>Error:</strong> {error ? "Yes" : "No"}
              </div>
              <div>
                <strong>Total Swaps:</strong> {totalSwaps ?? "null"}
              </div>
              <div>
                <strong>Total Revenue:</strong> {totalRevenue ?? "null"}
              </div>
              <div>
                <strong>Revenue Per Swap:</strong> {revenuePerSwap ?? "null"}
              </div>
              <div>
                <strong>Average Swap Time:</strong> {averageSwapTime ?? "null"}
              </div>
              <div>
                <strong>Monthly Data Points:</strong>{" "}
                {monthlySwapEfficiency?.length ?? 0}
              </div>
              <div>
                <strong>Performance Comparison:</strong>{" "}
                {performanceComparison ? "Available" : "None"}
              </div>

              {performanceComparison && (
                <details>
                  <summary className="cursor-pointer">Growth Data</summary>
                  <div className="mt-1 p-2 bg-white rounded text-xs">
                    <div>
                      Swaps Growth:{" "}
                      {performanceComparison.growth.swapsGrowth?.toFixed(1)}%
                    </div>
                    <div>
                      Revenue Growth:{" "}
                      {performanceComparison.growth.revenueGrowth?.toFixed(1)}%
                    </div>
                    <div>
                      Revenue/Swap Growth:{" "}
                      {performanceComparison.growth.revenuePerSwapGrowth?.toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </details>
              )}

              <details>
                <summary className="cursor-pointer">
                  Prepared Metrics Data
                </summary>
                <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                  {JSON.stringify(metricsData, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )} */}
    </>
  );
};

export default TrendSection;
