import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Satellite, MapPin, Cpu } from "lucide-react";

interface GPSMetricsProps {
  aggregatedData: Array<{
    PERIOD_START: string;
    TOTAL_DISTANCE: number;
    TOTAL_POINTS: number;
    VEHICLE_COUNT: number;
    TBOX_IDS: number[];
    BMS_IDS: string[];
    BATTERY_NAMES: string[];
  }>;
  loading?: boolean;
  error?: any;
}

export function GPSMetrics({
  aggregatedData,
  loading,
  error,
}: GPSMetricsProps) {
  // Show loading state
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-400">
            <Satellite className="h-5 w-5" />
            <span className="font-medium">Error loading metrics:</span>
          </div>
          <p className="text-red-400/80 mt-1 text-sm">
            {error.message || "Unknown error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Check for empty data
  if (!aggregatedData || aggregatedData.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No data available for the selected filters
        </CardContent>
      </Card>
    );
  }

  // Calculate totals from aggregated data
  const totalDistance = aggregatedData.reduce(
    (acc, cur) => acc + (cur.TOTAL_DISTANCE || 0),
    0
  );

  const totalGPSPoints = aggregatedData.reduce(
    (acc, cur) => acc + (cur.TOTAL_POINTS || 0),
    0
  );

  // Count unique scooters across all periods
  const uniqueScooters = new Set<number>();
  aggregatedData.forEach((period) => {
    if (period.TBOX_IDS) {
      period.TBOX_IDS.forEach((id) => uniqueScooters.add(id));
    }
  });
  const totalScooters = uniqueScooters.size;

  const metrics = [
    {
      title: "Total GPS Records",
      value: totalGPSPoints.toLocaleString(),
      description: "Number of GPS points",
      icon: Satellite,
    },
    {
      title: "Total Scooters",
      value: totalScooters.toLocaleString(),
      description: "Number of active scooters in the data",
      icon: Cpu,
    },
    {
      title: "Total Distance",
      value: `${Math.round(totalDistance).toLocaleString()} km`,
      description: "Total distance travelled over the period",
      icon: MapPin,
    },
    {
      title: "Average Distance per period",
      value: `${Math.round(
        totalDistance / Math.max(1, aggregatedData.length)
      ).toLocaleString()} km`,
      description: "Average distance travelled per period",
      icon: Cpu,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ title, value, description, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
