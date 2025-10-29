"use client";

import { useState, useEffect, useRef } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { RevenueFilters } from "./revenue-filters";

interface RevenueChartProps {
  filters: RevenueFilters;
}

interface RevenueChartData {
  ACTIVE_STATIONS: number;
  AVG_NET_REVENUE_PER_PERIOD: number;
  data: Array<{
    PERIOD: string;
    NET_REVENUE: number;
  }>;
}

export function RevenueChart({ filters }: RevenueChartProps) {
  const [data, setData] = useState<RevenueChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const prevFiltersRef = useRef<string>("");
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!filters.dateRange?.from || !filters.dateRange?.to) {
        return;
      }

      // Check if filters are the same
      const currentFiltersString = JSON.stringify(filters);
      if (prevFiltersRef.current === currentFiltersString) {
        console.log("Filters unchanged, skipping update");
        return;
      }

      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log("Already fetching, skipping duplicate request");
        return;
      }

      console.log("Fetching revenue data with filters:", filters);
      isFetchingRef.current = true;

      setLoading(true);
      setError(null);

      try {
        // Build geographic filter conditions with proper SQL escaping
        const buildGeographicFilters = () => {
          let conditions = [];

          if (filters.selectedProvinces.length > 0) {
            const provinces = filters.selectedProvinces
              .map((p) => `'${p.replace(/'/g, "''")}'`)
              .join(", ");
            conditions.push(`adp.PROVICE_NAME IN (${provinces})`);
          }

          if (filters.selectedDistricts.length > 0) {
            const districts = filters.selectedDistricts
              .map((d) => `'${d.replace(/'/g, "''")}'`)
              .join(", ");
            conditions.push(`adp.DISTRICT_NAME IN (${districts})`);
          }

          if (filters.selectedAreas.length > 0) {
            const areas = filters.selectedAreas
              .map((a) => `'${a.replace(/'/g, "''")}'`)
              .join(", ");
            conditions.push(`rs.LOCATIONNAME IN (${areas})`);
          }

          if (filters.selectedStations.length > 0) {
            const stations = filters.selectedStations
              .map((s) => `'${s.replace(/'/g, "''")}'`)
              .join(", ");
            conditions.push(`rs.STATIONNAME IN (${stations})`);
          }

          return conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
        };

        const addOneDay = (date: Date) => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + 1);
          return newDate;
        };

        const geographicFilters = buildGeographicFilters();

        // Get aggregation format - simplified for Snowflake compatibility
        const getAggregationFormat = () => {
          switch (filters.aggregation) {
            case "daily":
              return "rs.DATE"; // group by raw date
            case "monthly":
              return "DATE_TRUNC('MONTH', rs.DATE)";
            case "quarterly":
              return "DATE_TRUNC('QUARTER', rs.DATE)";
            case "annually":
              return "DATE_TRUNC('YEAR', rs.DATE)";
            default:
              return "DATE_TRUNC('MONTH', rs.DATE)";
          }
        };

        const aggregationFormat = getAggregationFormat();

        // Simplified main query for chart data
        const chartQuery = `
          SELECT 
            ${aggregationFormat} as PERIOD,
            SUM(rs.GROSS_REVENUE) as NET_REVENUE
          FROM DB_DUMP.PUBLIC.MY_REVENUESUMMARY rs
          LEFT JOIN SOURCE_DATA.MASTER_DATA.AREA_DISTRICT_PROVICE_LOOKUP adp 
            ON rs.LOCATIONNAME = adp.AREA_NAME
           WHERE rs.DATE >= '${
             addOneDay(filters.dateRange.from).toISOString().split("T")[0]
           }'
            AND rs.DATE <= '${
              addOneDay(filters.dateRange.to).toISOString().split("T")[0]
            }'
            AND rs.GROSS_REVENUE > 0
            ${geographicFilters}
          GROUP BY ${aggregationFormat}
          ORDER BY ${aggregationFormat}
        `;

        console.log("Chart Query:", chartQuery);

        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql: chartQuery }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chart data: ${response.status}`);
        }

        const result = await response.json();
        console.log("Chart Data:", result);

        if (result && result.length > 0) {
          // Transform the simple query result
          const chartData = {
            ACTIVE_STATIONS: 0, // Not needed for chart display
            AVG_NET_REVENUE_PER_PERIOD: 0, // Not needed for chart display
            data: result.map((row: any) => ({
              PERIOD: row.PERIOD,
              NET_REVENUE: row.NET_REVENUE,
            })),
          };

          setData(chartData);
        } else {
          setData({
            ACTIVE_STATIONS: 0,
            AVG_NET_REVENUE_PER_PERIOD: 0,
            data: [],
          });
        }
      } catch (err: any) {
        console.error("Error fetching chart data:", err);
        setError(err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        prevFiltersRef.current = currentFiltersString;
      }
    };

    fetchRevenueData();
  }, [
    filters.dateRange?.from,
    filters.dateRange?.to,
    filters.selectedProvinces,
    filters.selectedDistricts,
    filters.selectedAreas,
    filters.selectedStations,
    filters.aggregation,
  ]);

  // Format period for display based on aggregation type
  const formatPeriodForDisplay = (period: string, aggregationType: string) => {
    try {
      switch (aggregationType) {
        case "daily":
          return new Date(period).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        case "monthly":
          const [year, month] = period.split("-");
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return `${monthNames[parseInt(month) - 1]} ${year}`;
        case "quarterly":
          return period; // Format like "2024-Q1"
        case "annually":
          return period; // Just the year
        default:
          return period;
      }
    } catch {
      return period;
    }
  };

  // Skeleton while loading
  if (loading) {
    return (
      <div className="w-full h-[350px] rounded-lg bg-background p-6">
        <div className="h-6 w-1/4 rounded-md bg-gray-300 mb-4 animate-pulse" />
        <div className="h-full flex items-center justify-center">
          <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[350px] text-red-500">
        <div className="text-center">
          <p>Error loading chart data</p>
          <p className="text-sm mt-1">{error.message || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        <div className="text-center">
          <p>No revenue data available for the selected filters</p>
          <p className="text-sm mt-1">
            Try adjusting your date range or location filters
          </p>
        </div>
      </div>
    );
  }

  // Transform chart data
  const chartData = data.data.map((entry) => ({
    period: entry.PERIOD,
    displayPeriod: formatPeriodForDisplay(entry.PERIOD, filters.aggregation),
    revenue: entry.NET_REVENUE,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="displayPeriod"
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            `Rs. ${value.toLocaleString(undefined, {
              notation: value > 1000000 ? "compact" : "standard",
              maximumFractionDigits: 1,
            })}`
          }
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        Period
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        Revenue
                      </span>
                      <span className="text-sm font-bold">
                        Rs. {payload[0].value?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          strokeWidth={2}
          className="stroke-primary"
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, className: "fill-primary" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
