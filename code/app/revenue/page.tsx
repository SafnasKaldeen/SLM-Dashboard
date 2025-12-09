"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueOverview } from "@/components/revenue/revenue-overview";
import { RevenueMetrics } from "@/components/revenue/revenue-metrics";
import { RevenueChart } from "@/components/revenue/revenue-chart";
import { TopPerformingStations } from "@/components/revenue/top-performing-routes";
import { RevenueByArea } from "@/components/revenue/revenue-by-vehicle-type";
import {
  RevenueFilters,
  type RevenueFilters as RevenueFiltersType,
} from "@/components/revenue/revenue-filters";
import { useRevenue } from "@/hooks/Snowflake/useRevenue";
import { useRevenueByArea } from "@/hooks/Snowflake/useRevenue4stations";
import { useTopStations } from "@/hooks/Snowflake/useTopStations";

export default function RevenuePage() {
  const [filters, setFilters] = useState<RevenueFiltersType>({
    selectedAreas: [],
    selectedStations: [],
    customerSegments: [],
    revenueRange: {},
    paymentMethods: [],
    aggregation: "monthly",
  });

  // Set default date range to past year if not already set
  useEffect(() => {
    if (!filters.dateRange?.from || !filters.dateRange?.to) {
      const today = new Date();

      const from = new Date(today);
      from.setMonth(today.getMonth() - 12);
      from.setDate(1);

      const to = new Date(today.getFullYear(), today.getMonth(), 0);

      setFilters((prev) => ({
        ...prev,
        dateRange: { from, to },
      }));
    }
  }, [filters.dateRange?.from, filters.dateRange?.to]);

  const handleFiltersChange = (newFilters: RevenueFiltersType) => {
    setFilters(newFilters);
  };

  const { data: revenueData, loading } = useRevenue(filters);
  const { data: ArearevenueData, Arealoading } = useRevenueByArea(filters);
  const { data: topStationsData, topStationsLoading } = useTopStations(filters);

  const isDateRangeSet =
    filters.dateRange &&
    filters.dateRange.from instanceof Date &&
    filters.dateRange.to instanceof Date;

  const chartTitle = useMemo(() => {
    return filters.selectedAreas.length === 1
      ? `Revenue by Stations - ${filters.selectedAreas[0]}`
      : "Revenue by Area";
  }, [filters.selectedAreas]);

  const chartDescription = useMemo(() => {
    return filters.selectedAreas.length === 1
      ? `Distribution of revenue across BSS stations in ${filters.selectedAreas[0]}`
      : "Distribution of revenue across different service areas";
  }, [filters.selectedAreas]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Overview</h2>
      </div>

      <RevenueFilters onFiltersChange={handleFiltersChange} />

      {isDateRangeSet && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <RevenueMetrics
              filters={filters}
              data={revenueData}
              loading={loading}
            />
          </div>

          <div className="grid gap-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  {filters.aggregation.charAt(0).toUpperCase() +
                    filters.aggregation.slice(1)}{" "}
                  revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart
                  filters={filters}
                  data={revenueData}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing BSS Stations</CardTitle>
                <CardDescription>
                  Stations generating the highest revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopPerformingStations
                  filters={filters}
                  data={topStationsData}
                  loading={topStationsLoading}
                />
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueOverview data={revenueData} loading={loading} />
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Area</CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueByArea
                  filters={filters}
                  data={ArearevenueData}
                  loading={Arealoading}
                  chartTitle={chartTitle}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
