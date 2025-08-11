"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { da, is } from "date-fns/locale";

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
  const [isDescending, setIsDescending] = useState(true);
  const toggleOrder = () => setIsDescending((prev) => !prev);

  const topStations = data?.data || [];

  const sortedStations = useMemo(() => {
    return [...topStations].sort((a, b) =>
      isDescending
        ? b.LATEST_NET_REVENUE - a.LATEST_NET_REVENUE
        : a.LATEST_NET_REVENUE - b.LATEST_NET_REVENUE
    );
  }, [topStations, isDescending]);

  const maxRevenue = data?.data.reduce(
    (max, station) => Math.max(max, station.LATEST_NET_REVENUE || 0),
    0
  );

  const getBadge = (index: number) => {
    if (isDescending) {
      if (index === 0)
        return (
          <Badge
            className="text-[12px] bg-yellow-400 text-black cursor-help"
            title="Top 1 Station"
          >
            🥇 Gold
          </Badge>
        );
      if (index === 1)
        return (
          <Badge
            className="text-[12px] bg-gray-300 text-black cursor-help"
            title="Top 2 Station"
          >
            🥈 Silver
          </Badge>
        );
      if (index === 2)
        return (
          <Badge
            className="text-[12px] bg-orange-300 text-black cursor-help"
            title="Top 3 Station"
          >
            🥉 Bronze
          </Badge>
        );
    } else {
      if (index === 0)
        return (
          <Badge
            className="text-[12px] bg-red-500 text-white cursor-help"
            title="Lowest performer"
          >
            🛑 Lowest
          </Badge>
        );
      if (index === 1)
        return (
          <Badge
            className="text-[12px] bg-yellow-200 text-black cursor-help"
            title="Low performer"
          >
            ⚠️ Low
          </Badge>
        );
      if (index === 2)
        return (
          <Badge
            className="text-[12px] bg-orange-200 text-black cursor-help"
            title="Moderate performer"
          >
            🟠 Moderate
          </Badge>
        );
    }
    return null;
  };

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
          <p>No stations found for the selected filters. Try adjusting them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mt-4">
        <div className="text-xl font-semibold">
          {isDescending
            ? "Top Performing BSS Stations"
            : "Lowest Performing BSS Stations"}
          <div className="text-sm text-muted-foreground font-normal">
            {isDescending
              ? "Stations generating the highest revenue"
              : "Stations generating the lowest revenue"}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={toggleOrder}
          className="text-xs gap-1"
        >
          <ArrowDownUp className="w-4 h-4" />
          {isDescending ? "Descending" : "Ascending"}
        </Button>
      </div>

      {sortedStations.slice(0, 5).map((station, index) => {
        const utilizationRate = parseFloat(station.STATION_UTILIZATION);
        const displayUtilization = !isNaN(utilizationRate)
          ? `${utilizationRate.toFixed(1)}% utilization`
          : "No data";

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
                    <p
                      className="text-sm font-medium leading-none truncate max-w-[160px]"
                      title={station.STATIONNAME}
                    >
                      {station.STATIONNAME}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span title={station.LOCATIONNAME}>
                      {station.LOCATIONNAME}
                    </span>
                    <span>•</span>
                    <span>{displayUtilization}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-green-600">
                    {typeof station.LATEST_NET_REVENUE === "number" &&
                    !isNaN(station.LATEST_NET_REVENUE)
                      ? `LKR ${station.LATEST_NET_REVENUE.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : "N/A"}
                  </p>
                  <div className="flex items-center flex-row gap-1">
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
