import { useEffect, useState } from "react";

interface ComparisonFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  selectedAreas: string[];
  aggregation: "Monthly" | "Area";
}

export default function useComparisonData(filters: ComparisonFilters) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { dateRange, selectedAreas, aggregation } = filters;
      const fromMonth = dateRange.from.toISOString().slice(0, 7); // YYYY-MM
      const toMonth = dateRange.to.toISOString().slice(0, 7);

      let sql = "";

      if (aggregation === "Monthly") {
        sql = `
          SELECT * FROM DB_DUMP.PUBLIC.MONTH_COMPARISON
          WHERE DATE >= '${fromMonth}' AND DATE <= '${toMonth}'
          ORDER BY DATE
        `;
      } else {
        const areasList = selectedAreas.map((area) => `'${area}'`).join(", ");
        sql = `
          SELECT * FROM DB_DUMP.PUBLIC.LOCATION_COMPARISON
          WHERE LOCATION IN (${areasList})
          ORDER BY LOCATION, STATIONNAME
        `;
      }

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to fetch data");
        }

        setData(json.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { data, loading, error };
}
