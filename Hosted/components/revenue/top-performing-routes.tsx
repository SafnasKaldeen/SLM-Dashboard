"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";

interface StationData {
  LOCATIONNAME: string;
  LATEST_NET_REVENUE: number;
  PERSONALBEST: number;
  PERIOD: string;
  "PREVIOUS YEARS revenue percentage": number | null;
  STATIONNAME: string;
  STATION_UTILIZATION: string; // percentage string like "88.78"
}

interface TopPerformingStationsProps {
  filters: any;
  data?: {
    data: StationData[];
  };
  loading?: boolean;
}

export function TopPerformingStations({
  filters,
  data,
  loading,
}: TopPerformingStationsProps) {
  const topStations = data?.data || [];

  const sortedStations = [...topStations].sort(
    (a, b) => b.LATEST_NET_REVENUE - a.LATEST_NET_REVENUE
  );

  const maxRevenue = sortedStations[0]?.LATEST_NET_REVENUE || 0;

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedStations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No stations found for the selected filters</p>
        </div>
      </div>
    );
  }

  const getBadge = (index: number) => {
    if (index === 0)
      return (
        <Badge className="text-[12px] bg-yellow-400 text-black">🥇 Gold</Badge>
      );
    if (index === 1)
      return (
        <Badge className="text-[12px] bg-gray-300 text-black">🥈 Silver</Badge>
      );
    if (index === 2)
      return (
        <Badge className="text-[12px] bg-orange-300 text-black">
          🥉 Bronze
        </Badge>
      );
    return null;
  };

  return (
    <div className="space-y-4">
      {sortedStations.map((station, index) => {
        const utilizationRate = parseFloat(station.STATION_UTILIZATION) || 0;

        const displayPercentage =
          maxRevenue > 0 ? (station.LATEST_NET_REVENUE / maxRevenue) * 100 : 0;

        return (
          <Card
            key={`${station.STATIONNAME}-${station.PERIOD ?? index}`}
            className="p-4"
          >
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <p className="text-sm font-medium leading-none">
                      {station.STATIONNAME}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{station.LOCATIONNAME}</span>
                    <span>•</span>
                    <span>{utilizationRate.toFixed(1)}% utilization</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-green-600">
                    {typeof station.LATEST_NET_REVENUE === "number" &&
                    !isNaN(station.LATEST_NET_REVENUE)
                      ? station.LATEST_NET_REVENUE.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </p>
                  <div className="flex items-end pb-2 flex-row gap-1">
                    <div className="px-3">{getBadge(index)}</div>
                    <Badge
                      variant={
                        displayPercentage >= 100 ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {displayPercentage.toFixed(1)}% of top
                    </Badge>
                  </div>
                </div>
              </div>
              <Progress value={displayPercentage} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
