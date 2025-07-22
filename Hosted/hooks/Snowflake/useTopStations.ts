import { useEffect, useState } from "react";
import { RevenueFilters } from "@/components/revenue/revenue-filters";

interface StationData {
  LOCATIONNAME: string;
  LATEST_NET_REVENUE: number;
  PERSONALBEST: number;
  PERIOD: string;
  "PREVIOUS YEARS revenue percentage": number | null;
  STATIONNAME: string;
  STATION_UTILIZATION: string; // numeric string without %
}

interface TopStationsResponse {
  data: StationData[];
}

export const useTopStations = (filters?: RevenueFilters) => {
  const [data, setData] = useState<TopStationsResponse | null>(null);
  const [topStationsLoading, settopStationsLoading] = useState(true);

  // Helper to transform API data keys to UI expected keys
  const transformApiData = (apiData: any[]): StationData[] => {
    return apiData.map((item) => ({
      LOCATIONNAME: item.LOCATIONNAME,
      LATEST_NET_REVENUE: item.NET_REVENUE,
      PERSONALBEST: 0, // default or from API if available
      PERIOD: "", // default or from API if available
      "PREVIOUS YEARS revenue percentage":
        item["PREVIOUS YEARS revenue percentage"] ?? null,
      STATIONNAME: item.STATIONNAME,
      STATION_UTILIZATION: item["UTILIZATION RATE PERCENTAGE"]
        ? item["UTILIZATION RATE PERCENTAGE"].replace("%", "")
        : "0",
    }));
  };

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
          const transformedData = transformApiData(result[0].GET_TOP5.data);
          setData({ data: transformedData });
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
