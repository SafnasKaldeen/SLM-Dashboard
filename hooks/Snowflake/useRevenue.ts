import { useEffect, useState } from "react";
import { RevenueFilters } from "@/components/revenue/revenue-filters";

export interface RevenueMetrics {
  PERIOD: string;
  NET_REVENUE: number;
}

export interface RevenueApiResponse {
  ACTIVE_STATIONS: number;
  AVG_NET_REVENUE_PER_PERIOD: number;
  "TOTAL REVENUE": number;
  "previous segment ACTIVE_STATIONS": number;
  "previous segment AVG_NET_REVENUE_PER_PERIOD": number;
  "previous segment TOTAL REVENUE": number;
  UTILIZATION_RATE: number;
  "previous segment UTILIZATION_RATE"?: number;
  data: RevenueMetrics[];
}

// Helper: Check if a value is a valid Date
const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

// Helper: Format date in local timezone YYYY-MM-DD (no ISO to avoid UTC shift)
const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useRevenue = (filters?: RevenueFilters) => {
  const [data, setData] = useState<RevenueApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract and format dates once, with validation (only date part, no time)
  const fromDate = filters?.dateRange?.from && isValidDate(filters.dateRange.from)
    ? formatDateLocal(filters.dateRange.from)
    : undefined;
  const toDate = filters?.dateRange?.to && isValidDate(filters.dateRange.to)
    ? formatDateLocal(filters.dateRange.to)
    : undefined;

  useEffect(() => {
    if (!fromDate || !toDate) {
      console.warn("❌ Skipping fetch: Missing or invalid dateRange");
      return;
    }

    const fetchRevenueData = async () => {
      setLoading(true);

      // Format arrays as SQL lists or use NULL
      const formatArray = (arr?: string[]) =>
        arr && arr.length > 0
          ? `[${arr.map((v) => `'${v}'`).join(",")}]`
          : "NULL";

      const sql = `
        CALL GET_REVENUE_METRICS_NEW(
          '${fromDate}'::DATE,
          '${toDate}'::DATE,
          ${formatArray(filters?.selectedAreas)},
          ${formatArray(filters?.selectedStations)},
          ${filters?.aggregation && filters.aggregation.length > 0 ? `'${filters.aggregation}'` : "NULL"}
        )
      `;

      console.log("📤 Executing SQL query:", sql);

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        const result = await response.json();

        // The stored procedure should return an array with an object containing GET_REVENUE_METRICS_NEW
        if (Array.isArray(result) && result.length > 0 && result[0]?.GET_REVENUE_METRICS_NEW) {
          setData(result[0].GET_REVENUE_METRICS_NEW);
          // console.log("✅ Revenue data fetched successfully:", result[0].GET_REVENUE_METRICS_NEW);
        } else {
          console.warn("⚠️ Unexpected response shape", result);
          setData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching revenue data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [
    fromDate,   // use formatted date strings to avoid unnecessary re-renders caused by time shifts
    toDate,
    JSON.stringify(filters?.selectedAreas ?? []),
    JSON.stringify(filters?.selectedStations ?? []),
    filters?.aggregation,
  ]);

  return { data, loading };
};
