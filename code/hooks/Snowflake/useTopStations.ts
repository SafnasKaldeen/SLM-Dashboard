import { useEffect, useState } from "react";
import { RevenueFilters } from "@/components/revenue/revenue-filters";

interface StationData {
  LOCATIONNAME: string;
  LATEST_NET_REVENUE: number;
  PERSONALBEST: number;
  PERIOD: string;
  "PREVIOUS YEARS revenue percentage": number | null;
  STATIONNAME: string;
  "STATION_UTILIZATION": string;
}

interface TopStationsResponse {
  data: StationData[];
}

export const useTopStations = (filters?: RevenueFilters) => {
  const [data, setData] = useState<TopStationsResponse | null>(null);
  const [topStationsLoading, settopStationsLoading] = useState(true);

  useEffect(() => {
    if (
      !filters ||
      !filters.dateRange ||
      !(filters.dateRange.from instanceof Date) ||
      !(filters.dateRange.to instanceof Date)
    ) {
      console.warn("❌ Skipping fetch: Missing or invalid dateRange");
      setData(null);
      settopStationsLoading(false);
      return;
    }

    const fetchRevenueData = async () => {
      settopStationsLoading(true);

      const fromDate = filters.dateRange.from.toISOString().split("T")[0];
      const toDate = filters.dateRange.to.toISOString().split("T")[0];

      const sql = `
        CALL GET_TOP5(
          '${fromDate}'::DATE,
          '${toDate}'::DATE,
          ${filters.aggregation.length > 0 ? `'${filters.aggregation}'` : "NULL"}
        )
      `;

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        const result = await response.json();
        console.log("✅ Raw result from stored procedure:", result[0]);

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0]?.GET_TOP5 &&
          Array.isArray(result[0].GET_TOP5.data)
        ) {
          setData(result[0].GET_TOP5);
        } else {
          console.warn("⚠️ Unexpected response shape or empty data", result);
          setData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching revenue data:", error);
        setData(null);
      } finally {
        settopStationsLoading(false);
      }
    };

    fetchRevenueData();
  }, [filters?.dateRange?.from, filters?.dateRange?.to, filters?.aggregation]);

  return { data, topStationsLoading };
};
