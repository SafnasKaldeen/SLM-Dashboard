import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";

interface RevenueMetricsProps {
  data?: {
    ACTIVE_STATIONS: number;
    AVG_NET_REVENUE_PER_PERIOD: number;
    "TOTAL REVENUE": number;
    "previous segment ACTIVE_STATIONS": number;
    "previous segment AVG_NET_REVENUE_PER_PERIOD": number;
    "previous segment TOTAL REVENUE": number;
    UTILIZATION_RATE: number;
    "previous segment UTILIZATION_RATE"?: number;
    data: Array<{
      PERIOD: string;
      NET_REVENUE: number;
    }>;
  };
  loading?: boolean;
  error?: any;
}

export function RevenueMetrics({ data, loading, error }: RevenueMetricsProps) {
  if (loading || error || !data || !data.data || data.data.length === 0)
    return null;

  const totalRevenue = data["TOTAL REVENUE"];
  const prevTotalRevenue = data["previous segment TOTAL REVENUE"];
  const totalRevenueTrend =
    prevTotalRevenue && prevTotalRevenue !== 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
      : null;
  const isTotalRevUp = totalRevenueTrend != null && totalRevenueTrend >= 0;

  const avgRevenue = data.AVG_NET_REVENUE_PER_PERIOD;
  const prevAvgRevenue = data["previous segment AVG_NET_REVENUE_PER_PERIOD"];
  const avgRevenueTrend =
    prevAvgRevenue && prevAvgRevenue !== 0
      ? ((avgRevenue - prevAvgRevenue) / prevAvgRevenue) * 100
      : null;
  const isAvgRevUp = avgRevenueTrend != null && avgRevenueTrend >= 0;

  const activeStations = data.ACTIVE_STATIONS;
  const prevActiveStations = data["previous segment ACTIVE_STATIONS"];
  const stationTrend =
    prevActiveStations && prevActiveStations !== 0
      ? ((activeStations - prevActiveStations) / prevActiveStations) * 100
      : null;
  const isStationUp = stationTrend != null && stationTrend >= 0;

  const utilizationRate = data.UTILIZATION_RATE;
  const prevUtilization = data["previous segment UTILIZATION_RATE"];
  const utilizationTrend =
    typeof prevUtilization === "number" && prevUtilization !== 0
      ? ((utilizationRate - prevUtilization) / prevUtilization) * 100
      : null;
  const isUtilizationUp = utilizationTrend != null && utilizationTrend >= 0;

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(1)}%`;

  const metrics = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toLocaleString()}`,
      prev: `Prev: ${prevTotalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change:
        totalRevenueTrend != null ? formatPercent(totalRevenueTrend) : "N/A",
      isIncrease: isTotalRevUp,
    },
    {
      title: "Avg Revenue per Period",
      value: avgRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      prev: `Prev: ${prevAvgRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      change: avgRevenueTrend != null ? formatPercent(avgRevenueTrend) : "N/A",
      isIncrease: isAvgRevUp,
    },
    {
      title: "Active BSS Stations",
      value: `${activeStations}`,
      prev: `Prev: ${prevActiveStations}`,
      icon: MapPin,
      change: stationTrend != null ? formatPercent(stationTrend) : "N/A",
      isIncrease: isStationUp,
    },
    {
      title: "Station Utilization Rate",
      value: `${utilizationRate.toFixed(2)}%`,
      prev:
        prevUtilization != null ? `Prev: ${prevUtilization.toFixed(1)}%` : null,
      icon: TrendingDown,
      change:
        utilizationTrend != null ? formatPercent(utilizationTrend) : "N/A",
      isIncrease: isUtilizationUp,
    },
  ];

  return (
    <>
      {metrics.map(({ title, value, icon: Icon, change, isIncrease, prev }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
              {prev && <div>{prev}</div>}
              {change === "N/A" ? (
                <span className="text-muted-foreground">N/A</span>
              ) : (
                <div className="flex items-center">
                  {isIncrease ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={isIncrease ? "text-green-500" : "text-red-500"}
                  >
                    {change}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
