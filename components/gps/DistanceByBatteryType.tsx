"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DistanceByBatteryTypeProps {
  filters?: any;
  data?: {
    BATTERY_TYPE: string;
    MAKE?: string;
    TOTAL_DISTANCE: number;
  }[];
  loading?: boolean;
}

export function DistanceByBatteryType({
  filters,
  data = [],
  loading = false,
}: DistanceByBatteryTypeProps) {
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

  // Group by BATTERY_TYPE and sum TOTAL_DISTANCE
  const grouped = new Map<
    string,
    { distance: number; color: string; count: number }
  >();

  data.forEach((d, i) => {
    const key = d.BATTERY_TYPE || "Unknown";
    if (!grouped.has(key)) {
      grouped.set(key, {
        distance: d.TOTAL_DISTANCE ?? 0,
        color: colors[grouped.size % colors.length],
        count: 1,
      });
    } else {
      const entry = grouped.get(key)!;
      entry.distance += d.TOTAL_DISTANCE ?? 0;
      entry.count += 1;
    }
  });

  const totalDistance = Array.from(grouped.values()).reduce(
    (sum, g) => sum + g.distance,
    0
  );

  const chartData = Array.from(grouped.entries()).map(
    ([name, { distance, color, count }]) => ({
      name,
      value:
        totalDistance > 0 ? Math.round((distance / totalDistance) * 100) : 0,
      distance,
      vehicles: count,
      color,
    })
  );

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
                      {d.value}% of total distance
                    </div>
                    <div className="text-sm font-medium">
                      Distance: {d.distance.toLocaleString()} km
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vehicles: {d.vehicles}
                    </div>
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
