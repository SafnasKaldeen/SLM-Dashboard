"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bike } from "lucide-react";

interface ScooterDistanceData {
  scooterId: string;
  model: string;
  totalDistance: number;
  averageDailyDistance: number;
  lastUsed: string;
  status: "active" | "maintenance" | "inactive";
  area?: string;
}

interface TopPerformingScootersProps {
  filters?: any;
  data?: ScooterDistanceData[];
  loading?: boolean;
}

export function TopPerformingScooters({
  filters,
  data = [],
  loading = false,
}: TopPerformingScootersProps) {
  const sortedScooters = useMemo(
    () => [...data].sort((a, b) => b.totalDistance - a.totalDistance),
    [data]
  );

  const maxDistance = sortedScooters[0]?.totalDistance || 0;

  const getBadge = (index: number) => {
    const baseClass = "text-[12px] text-black cursor-help";
    if (index === 0)
      return (
        <Badge
          className={`${baseClass} bg-yellow-400`}
          title="Highest distance traveled"
        >
          🥇 Gold
        </Badge>
      );
    if (index === 1)
      return (
        <Badge
          className={`${baseClass} bg-gray-300`}
          title="Second highest distance"
        >
          🥈 Silver
        </Badge>
      );
    if (index === 2)
      return (
        <Badge
          className={`${baseClass} bg-orange-300`}
          title="Third highest distance"
        >
          🥉 Bronze
        </Badge>
      );
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDistance = (distance: number) => {
    return distance >= 1000
      ? `${(distance / 1000).toFixed(1)}k km`
      : `${distance} km`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Distance Scooters</CardTitle>
          <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="h-64">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedScooters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Distance Scooters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Scooters with the highest total distance traveled
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Bike className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No distance data available for selected filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Distance Scooters</CardTitle>
        <p className="text-sm text-muted-foreground">
          Scooters with the highest total distance traveled
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedScooters.slice(0, 5).map((scooter, index) => {
            const displayPercentage =
              maxDistance > 0 ? (scooter.totalDistance / maxDistance) * 100 : 0;

            return (
              <div key={scooter.scooterId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <p
                        className="text-sm font-medium leading-none truncate max-w-[160px]"
                        title={`${scooter.model} (${scooter.scooterId})`}
                      >
                        {scooter.model} ({scooter.scooterId})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Last used: {formatDate(scooter.lastUsed)}</span>
                      {scooter.area && (
                        <Badge variant="outline" className="text-xs">
                          {scooter.area}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-green-600">
                      {formatDistance(scooter.totalDistance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeof scooter.averageDailyDistance === "number"
                        ? `${scooter.averageDailyDistance.toFixed(1)} km/day`
                        : "N/A"}
                    </p>

                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {getBadge(index)}
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
                <Progress value={displayPercentage} className="h-2 mt-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
