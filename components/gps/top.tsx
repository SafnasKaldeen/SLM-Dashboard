"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Bike, ArrowDownUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Filters {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  selectedBatteryTypes?: string[];
}

interface ScooterData {
  TBOXID: string;
  BATTERY_NAME: string;
  CAPACITY: number;
  TOTAL_DISTANCE: number;
  LAST_USED: string;
  PERIOD_START: string;
  GPS_POINTS: number;
}

function buildScooterDistanceQuery(
  startDate: string,
  endDate: string,
  batteryTypes: string[] = []
) {
  // Base query
  let query = `
    SELECT 
      TBOXID,
      BATTERY_NAME,
      CAPACITY,
      DATE_TRUNC('MONTH', GPS_DATE) AS PERIOD_START,
      SUM(DISTANCE_KM) AS TOTAL_DISTANCE,
      COUNT(*) AS GPS_POINTS,
      MAX(GPS_DATE) AS LAST_USED
    FROM REPORT_DB.GPS_DASHBOARD.VEHICLE_DAILY_DISTANCE
    WHERE GPS_DATE BETWEEN '${startDate}' AND '${endDate}'
  `;

  // Add battery type filter if specified
  if (batteryTypes && batteryTypes.length > 0) {
    const batteryTypeFilter = batteryTypes
      .map((type) => `'${type}'`)
      .join(", ");
    query += ` AND BATTERY_NAME IN (${batteryTypeFilter})`;
  }

  query += `
    GROUP BY TBOXID, BATTERY_NAME, CAPACITY, PERIOD_START
    ORDER BY TOTAL_DISTANCE DESC
    LIMIT 100;
  `;

  return query;
}

async function fetchTopScooters(
  startDate: string,
  endDate: string,
  batteryTypes: string[] = []
): Promise<ScooterData[]> {
  try {
    const query = buildScooterDistanceQuery(startDate, endDate, batteryTypes);

    // console.log("Executing query:", query);

    const response = await fetch("/api/snowflake/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Snowflake query failed:", response.status, errorText);
      throw new Error(`Query failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    // console.log("Query result:", result);

    return result || [];
  } catch (error) {
    console.error("Error fetching scooter data:", error);
    throw error;
  }
}

export default function TopPerformingScooters({
  filters,
  loading: parentLoading = false,
}: {
  filters: Filters;
  loading?: boolean;
}) {
  const [scooters, setScooters] = useState<ScooterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDescending, setIsDescending] = useState(true);

  // Data fetching logic (kept from second component)
  useEffect(() => {
    const loadData = async () => {
      // Reset error state
      setError(null);

      // Check if both dates exist and are valid Date objects
      if (
        !filters.dateRange?.from ||
        !filters.dateRange?.to ||
        !(filters.dateRange.from instanceof Date) ||
        !(filters.dateRange.to instanceof Date) ||
        isNaN(filters.dateRange.from.getTime()) ||
        isNaN(filters.dateRange.to.getTime())
      ) {
        console.log("Invalid date range:", filters.dateRange);
        setScooters([]);
        return;
      }

      setLoading(true);

      try {
        const startDate = format(filters.dateRange.from, "yyyy-MM-dd");
        const endDate = format(filters.dateRange.to, "yyyy-MM-dd");

        // console.log("Fetching top scooters for:", {
        //   dateRange: `${startDate} to ${endDate}`,
        //   batteryTypes: filters.selectedBatteryTypes,
        // });

        const data = await fetchTopScooters(
          startDate,
          endDate,
          filters.selectedBatteryTypes || []
        );

        // console.log(`Loaded ${data.length} scooter records`);
        setScooters(data);
      } catch (error) {
        console.error("Error loading scooter data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
        setScooters([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    filters.dateRange?.from,
    filters.dateRange?.to,
    JSON.stringify(filters.selectedBatteryTypes), // Handle array dependency
  ]);

  // UI logic (styled like first component)
  const sortedScooters = useMemo(() => {
    return [...scooters].sort((a, b) =>
      isDescending
        ? b.TOTAL_DISTANCE - a.TOTAL_DISTANCE
        : a.TOTAL_DISTANCE - b.TOTAL_DISTANCE
    );
  }, [scooters, isDescending]);

  const toggleOrder = () => setIsDescending((prev) => !prev);

  const maxDistance = sortedScooters[0]?.TOTAL_DISTANCE || 0;

  const getBadge = (index: number) => {
    if (isDescending) {
      if (index === 0)
        return (
          <Badge className="bg-yellow-400/90 text-black rounded-full px-2 py-1 shadow-sm">
            🥇 <span className="ml-1 font-medium">Gold</span>
          </Badge>
        );
      if (index === 1)
        return (
          <Badge className="bg-gray-300 text-black rounded-full px-2 py-1 shadow-sm">
            🥈 <span className="ml-1 font-medium">Silver</span>
          </Badge>
        );
      if (index === 2)
        return (
          <Badge className="bg-orange-300 text-black rounded-full px-2 py-1 shadow-sm">
            🥉 <span className="ml-1 font-medium">Bronze</span>
          </Badge>
        );
    } else {
      if (index === 0)
        return (
          <Badge className="bg-red-500/90 text-white rounded-full px-2 py-1 shadow-sm">
            🛑 <span className="ml-1 font-medium">Lowest</span>
          </Badge>
        );
      if (index === 1)
        return (
          <Badge className="bg-yellow-200 text-black rounded-full px-2 py-1 shadow-sm">
            ⚠️ <span className="ml-1 font-medium">Low</span>
          </Badge>
        );
      if (index === 2)
        return (
          <Badge className="bg-orange-200 text-black rounded-full px-2 py-1 shadow-sm">
            🟠 <span className="ml-1 font-medium">Moderate</span>
          </Badge>
        );
    }
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
      : `${distance.toFixed(1)} km`;
  };

  const getBatteryTypeColor = (batteryName: string) => {
    const colors: Record<string, string> = {
      BLUE: "bg-blue-100 text-blue-800",
      ORANGE: "bg-orange-100 text-orange-800",
      GREEN: "bg-green-100 text-green-800",
    };
    return colors[batteryName] || "bg-gray-100 text-gray-800";
  };

  // Loading state (styled like first component)
  if (loading || parentLoading) {
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

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Distance Scooters</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Bike className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-red-500 font-medium">Error loading data</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (styled like first component)
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
            <p>
              {!filters.dateRange?.from || !filters.dateRange?.to
                ? "Please select a date range to view top performing scooters."
                : filters.selectedBatteryTypes &&
                  filters.selectedBatteryTypes.length > 0
                ? `No scooters found for the selected period with battery types: ${filters.selectedBatteryTypes.join(
                    ", "
                  )}`
                : "No scooters found for the selected period."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main content (styled like first component)
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle>
            {isDescending
              ? "Top Distance Scooters"
              : "Lowest Distance Scooters"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isDescending
              ? "Scooters with the highest total distance traveled"
              : "Scooters with the lowest total distance traveled"}
          </p>
          {filters.selectedBatteryTypes &&
            filters.selectedBatteryTypes.length > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                Filtered by: {filters.selectedBatteryTypes.join(", ")}
              </div>
            )}
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
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sortedScooters.slice(0, 5).map((scooter, index) => {
            const displayPercentage =
              maxDistance > 0
                ? (scooter.TOTAL_DISTANCE / maxDistance) * 100
                : 0;

            return (
              <div
                key={`${scooter.TBOXID}-${scooter.PERIOD_START}-${index}`}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <p
                        className="text-sm font-medium leading-none truncate max-w-[160px]"
                        title={scooter.TBOXID}
                      >
                        {scooter.TBOXID}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Last used: {formatDate(scooter.LAST_USED)}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getBatteryTypeColor(
                          scooter.BATTERY_NAME
                        )}`}
                      >
                        {scooter.BATTERY_NAME}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scooter.CAPACITY} Ah
                      </Badge>
                    </div>
                    {/* <div className="text-xs text-muted-foreground">
                      Period: {scooter.PERIOD_START.slice(0, 7)} •{" "}
                      {scooter.GPS_POINTS} GPS points
                    </div> */}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-green-600">
                      {formatDistance(scooter.TOTAL_DISTANCE)}
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
