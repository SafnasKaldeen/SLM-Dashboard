import { useEffect, useState } from "react";
import { RevenueFilters } from "@/components/revenue/revenue-filters";

export interface RevenueByAreaData {
  AREA: string;
  STATION?: string;
  TOTAL_REVENUE: number;
  UTILIZATION?: number;
  TRIPS?: number;
}

export const useRevenueByArea = (filters?: RevenueFilters) => {
  const [data, setData] = useState<RevenueByAreaData[] | null>(null);
  const [Arealoading, setArealoading] = useState(true);

  useEffect(() => {
    if (
  !filters ||
  !filters.dateRange ||
  !(filters.dateRange.from instanceof Date) ||
  !(filters.dateRange.to instanceof Date)
) {
  console.warn("❌ Skipping fetch: Missing or invalid dateRange");
  setArealoading(false);
  return;
}


    const fetchRevenueData = async () => {
      setArealoading(true);

      const fromDate = filters.dateRange.from.toISOString().split("T")[0];
      const toDate = filters.dateRange.to.toISOString().split("T")[0];

      const areasList = filters.selectedAreas.length
        ? `'${filters.selectedAreas.join("','")}'`
        : null;

      const stationsList = filters.selectedStations.length
        ? `'${filters.selectedStations.join("','")}'`
        : null;

      const sql = `
        SELECT
          LOCATIONNAME AS AREA,
          STATIONNAME AS STATION,
          SUM(TOTAL_REVENUE) AS TOTAL_REVENUE,
        FROM MY_REVENUESUMMARY
        WHERE DATE BETWEEN '${fromDate}' AND '${toDate}'
          ${areasList ? `AND AREA IN (${areasList})` : ""}
          ${stationsList ? `AND STATION IN (${stationsList})` : ""}
        GROUP BY AREA, STATION
        ORDER BY AREA
      `;

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.warn("⚠️ Unexpected result:", result);
          setData(null);
        }
      } catch (error) {
        console.error("❌ Error:", error);
        setData(null);
      } finally {
        setArealoading(false);
      }
    };

    fetchRevenueData();
  }, [filters]);

  return { data, Arealoading };
};
