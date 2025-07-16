"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface RevenueByAreaProps {
  filters?: any;
  data?: {
    AREA: string;
    STATION?: string;
    TOTAL_REVENUE: number;
    REVENUE?: number;
    UTILIZATION?: number;
    TRIPS?: number;
  }[];
  loading?: boolean;
}

export function RevenueByArea({
  filters,
  data = [],
  loading = false,
}: RevenueByAreaProps) {
  const colors = [
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  const isShowingStations = filters?.selectedAreas?.length === 1;

  if (loading) {
    return (
      <div className="w-full h-[300px] rounded-lg bg-background p-6">
        <div className="h-6 w-1/3 rounded-md bg-gray-300 mb-4 animate-pulse" />
        <div className="flex justify-center items-center h-[240px] gap-2 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full animate-pulse"
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#ddd",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No data available for selected filters.</p>
      </div>
    );
  }

  let chartData = [];

  if (isShowingStations) {
    const selectedArea = filters.selectedAreas[0];
    let stations = data.filter((d) => d.AREA === selectedArea);

    if (filters?.selectedStations?.length > 0) {
      stations = stations.filter((d) =>
        filters.selectedStations.includes(d.STATION)
      );
    }

    const totalRevenue = stations.reduce(
      (sum, d) => sum + (d.REVENUE ?? d.TOTAL_REVENUE ?? 0),
      0
    );

    chartData = stations.map((d, i) => ({
      name: d.STATION || "Unknown Station",
      value:
        totalRevenue > 0
          ? Math.round(
              ((d.REVENUE ?? d.TOTAL_REVENUE ?? 0) / totalRevenue) * 100
            )
          : 0,
      revenue: d.REVENUE ?? d.TOTAL_REVENUE ?? 0,
      utilization: d.UTILIZATION ?? null,
      trips: d.TRIPS ?? null,
      color: colors[i % colors.length],
    }));
  } else {
    let filtered: typeof data = Array.isArray(data) ? [...data] : [];

    if (filters?.selectedAreas?.length > 0) {
      filtered = filtered.filter((d) => filters.selectedAreas.includes(d.AREA));
    }

    const grouped = new Map<
      string,
      { revenue: number; color: string; count: number }
    >();

    filtered.forEach((d, i) => {
      const key = d.AREA;
      if (!grouped.has(key)) {
        grouped.set(key, {
          revenue: d.TOTAL_REVENUE ?? d.REVENUE ?? 0,
          color: colors[grouped.size % colors.length],
          count: 1,
        });
      } else {
        const entry = grouped.get(key)!;
        entry.revenue += d.TOTAL_REVENUE ?? d.REVENUE ?? 0;
        entry.count += 1;
      }
    });

    const totalRevenue = Array.from(grouped.values()).reduce(
      (sum, g) => sum + g.revenue,
      0
    );

    chartData = Array.from(grouped.entries()).map(
      ([name, { revenue, color, count }]) => ({
        name,
        value:
          totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        revenue,
        stations: count,
        color,
      })
    );
  }

  // Apply aggregation multiplier
  if (filters?.aggregation) {
    const multiplierMap: Record<string, number> = {
      daily: 1 / 30,
      monthly: 1,
      quarterly: 3,
      annually: 12,
    };
    const multiplier = multiplierMap[filters.aggregation] || 1;

    chartData = chartData.map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * multiplier),
    }));
  }

  return (
    <ResponsiveContainer width="100%" height={600}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={200}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="font-medium">{d.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {d.value}% of total revenue
                    </div>
                    <div className="text-sm font-medium">
                      Revenue: {d.revenue.toLocaleString()}
                    </div>
                    {isShowingStations ? (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Utilization: {d.utilization ?? "N/A"}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Trips: {d.trips?.toLocaleString() ?? "N/A"}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Stations: {d.stations}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
