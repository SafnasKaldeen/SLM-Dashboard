// src/components/KeyMetricsSection.jsx
"use client";

import React from "react";
import { useSwaps } from "@/hooks/Snowflake/useSwaps";
import { TrendingUp, Battery, Clock } from "lucide-react";
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
import HourlySwapsChart from "./HourlySwapsChart";

const TrendSection = ({ filters }) => {
  const {
    data: swapData,
    loading,
    error,
    totalSwaps,
    totalRevenue,
    revenuePerSwap,
    averageSwapTime,
    performanceComparison,
    areawiseData,
    datewiseData,
  } = useSwaps(filters);

  // Calculate growth percentages for display
  const formatGrowthPercentage = (growth) => {
    if (growth === null || growth === undefined || isNaN(growth)) return null;
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  };

  // Prepare data in the format BatterySwapMetrics expects
  const metricsData = React.useMemo(() => {
    return {
      totalSwaps,
      totalRevenue,
      avgRevenuePerSwap: revenuePerSwap,
      avgSwapTime: averageSwapTime,
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
      swapTimeChange: null,
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
              <BatterySwapMetrics
                filters={filters}
                data={metricsData}
                loading={loading}
                error={error?.message}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Analytics Chart - Full Width */}
      <div className="grid gap-6 lg:grid-cols-1 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Swap Trends Analytics
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
                data={datewiseData}
                loading={loading}
                error={error?.message}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Hourly Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Hourly Swap Distribution
            </CardTitle>
            <CardDescription>
              Battery swap patterns across different hours of the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <HourlySwapsChart filters={filters} />
            )}
          </CardContent>
        </Card>

        {/* Area Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5" /> Swaps by Area Categories
            </CardTitle>
            <CardDescription>
              Distribution of swaps across different location types
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
    </>
  );
};

export default TrendSection;
