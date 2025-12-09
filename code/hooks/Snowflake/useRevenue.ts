import { useEffect, useState } from "react";
import { RevenueFilters } from "@/components/revenue/revenue-filters";

// Define the expected structure from the stored procedure
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
  // "STATION_UTILIZATION": string;
}

export const useRevenue = (filters?: RevenueFilters) => {
  const [data, setData] = useState<RevenueApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !filters ||
      !filters.dateRange ||
      !(filters.dateRange.from instanceof Date) ||
      !(filters.dateRange.to instanceof Date)
    ) {
      console.warn("❌ Skipping fetch: Missing or invalid dateRange");
      return;
    }

    const fetchRevenueData = async () => {
      setLoading(true);

      const fromDate = filters.dateRange.from.toISOString().split("T")[0];
      const toDate = filters.dateRange.to.toISOString().split("T")[0];

      // console.log(filters.aggregation);

      const sql = `
        CALL GET_REVENUE_METRICS_NEW(
          '${fromDate}'::DATE,
          '${toDate}'::DATE,
          ${filters.selectedAreas.length > 0 ? `'${filters.selectedAreas.join(",")}'` : "NULL"},
          ${filters.selectedStations.length > 0 ? `'${filters.selectedStations.join(",")}'` : "NULL"},
          ${filters.aggregation.length > 0 ? `'${filters.aggregation}'` : "NULL"}
        )
      `;

      console.log("🔍 Executing SQL:", sql);

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        const result = await response.json();
        console.log("✅ Revenue result from stored procedure:", result[0]);

        // Match the shape returned from the backend
        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0]?.GET_REVENUE_METRICS_NEW
        ) {
          setData(result[0].GET_REVENUE_METRICS_NEW);
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
  }, [filters]);

  return { data, loading };
};
