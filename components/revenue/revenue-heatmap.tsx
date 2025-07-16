"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useStationUtilization,
  StationUtilizationParams,
} from "@/hooks/Snowflake/useGeo";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";

// Utility colors
const getRevenueColor = (revenue: number) => {
  if (revenue === undefined || revenue === null || isNaN(revenue))
    return "bg-muted";
  if (revenue >= 15000) return "bg-green-500";
  if (revenue >= 12000) return "bg-yellow-500";
  if (revenue >= 8000) return "bg-orange-500";
  if (revenue >= 5000) return "bg-red-500";
  return "bg-muted";
};

const getUtilizationColor = (utilization: number) => {
  if (utilization === undefined || utilization === null || isNaN(utilization))
    return "text-gray-500";
  if (utilization >= 85) return "text-green-600";
  if (utilization >= 70) return "text-yellow-600";
  return "text-red-600";
};

// Skeleton card for loading
const SkeletonCard = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
    </CardContent>
  </Card>
);

export function RevenueHeatmap() {
  const filters = useMemo<StationUtilizationParams>(() => {
    const today = new Date();
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    const from = new Date(to.getFullYear(), to.getMonth() - 11, 1);

    return {
      dateRange: { from, to },
      selectedAreas: [],
      selectedStations: [],
      aggregation: "monthly",
    };
  }, []);

  const { data, loading, error } = useStationUtilization(filters);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={`summary-${idx}`} />
          ))}
        </div>
        <hr className="border-t border-muted" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={`area-${idx}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data || !data.data.length) return <div>No data found</div>;

  const groupedData = data.data.reduce<Record<string, typeof data.data>>(
    (acc, item) => {
      if (!acc[item.LOCATION]) acc[item.LOCATION] = [];
      acc[item.LOCATION].push(item);
      return acc;
    },
    {}
  );

  const totalRevenue = data.data.reduce((sum, s) => sum + s.TOTAL_REVENIE, 0);
  const totalStations = data.data.length;
  const avgUtilization = Math.round(
    data.data.reduce((sum, s) => sum + s.UTILIZATION_PERCENTAGE, 0) /
      totalStations
  );

  const topPerformerStation = data.data.reduce(
    (max, s) => (s.TOTAL_REVENIE > max.TOTAL_REVENIE ? s : max),
    data.data[0]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {topPerformerStation.STATIONNAME}
            </div>
            <div className="text-xs text-muted-foreground">
              ${topPerformerStation.TOTAL_REVENIE.toLocaleString()} revenue
            </div>
          </CardContent>
        </Card>
      </div>

      <hr className="border-t border-muted" />

      {/* Area Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedData).map(([area, stations]) => {
          const areaRevenue = stations.reduce(
            (sum, s) => sum + s.TOTAL_REVENIE,
            0
          );
          const avgUtil = Math.round(
            stations.reduce((sum, s) => sum + s.UTILIZATION_PERCENTAGE, 0) /
              stations.length
          );

          return (
            <Card
              key={area}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedArea === area ? "ring-2 ring-primary" : ""
              }`}
              onClick={() =>
                setSelectedArea(selectedArea === area ? null : area)
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{area}</CardTitle>
                  <Badge variant="secondary">{stations.length} stations</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Revenue
                    </span>
                    <span className="font-bold">
                      ${areaRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Avg Utilization
                    </span>
                    <span
                      className={`font-bold ${getUtilizationColor(avgUtil)}`}
                    >
                      {avgUtil}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Station Performance
                    </div>
                    <div className="flex gap-1">
                      {[...stations]
                        .sort((a, b) => b.TOTAL_REVENIE - a.TOTAL_REVENIE)
                        .map((station, idx) => (
                          <div
                            key={idx}
                            className={`h-2 flex-1 rounded ${getRevenueColor(
                              station.TOTAL_REVENIE
                            )}`}
                            title={`${
                              station.STATIONNAME
                            }: $${station.TOTAL_REVENIE.toLocaleString()}`}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Station View */}
      {selectedArea && groupedData[selectedArea] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedArea} - Station Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...groupedData[selectedArea]]
                .sort((a, b) => b.TOTAL_REVENIE - a.TOTAL_REVENIE)
                .map((station) => (
                  <Card
                    key={`${station.STATIONNAME}-${
                      station.DATE || station.LOCATION
                    }`}
                    className="border-l-4 border-l-primary"
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="font-medium">{station.STATIONNAME}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Revenue
                          </span>
                          <span className="font-bold">
                            ${station.TOTAL_REVENIE.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Utilization
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-bold ${getUtilizationColor(
                                station.UTILIZATION_PERCENTAGE
                              )}`}
                            >
                              {station.UTILIZATION_PERCENTAGE}%
                            </span>
                            {station.UTILIZATION_PERCENTAGE >= 85 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : station.UTILIZATION_PERCENTAGE < 50 ? (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getRevenueColor(
                                station.TOTAL_REVENIE
                              )}`}
                              style={{
                                width: `${station.UTILIZATION_PERCENTAGE}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
