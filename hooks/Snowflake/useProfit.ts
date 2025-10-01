import { useEffect, useState } from "react";

// Type definitions
export interface ProfitMetrics {
  DATE: string;
  LOCATION: string;
  STATIONNAME: string;
  TOTAL_REVENUE: number;
  TOTAL_EXPENSES: number;
  TOTAL_PROFIT: number;
}

export interface ProfitApiResponse {
  PROFIT_MARGINE: number;
  BREAK_EVEN_SWAPS: number;
  TOTAL_PROFIT: number;
  "previous segment PROFIT_MARGINE": number;
  "previous segment TOTAL_PROFIT": number;
  data: ProfitMetrics[];
}

export interface ProfitFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  selectedAreas: string[];
  selectedStations: string[];
  aggregation: string;
}

// Helper to escape single quotes in SQL values
const escapeSQL = (str: string) => str.replace(/'/g, "''");

/**
 * Custom hook to fetch profit metrics from backend.
 */
export const useProfit = (filters?: ProfitFilters) => {
  const [data, setData] = useState<ProfitApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for invalid filters early
    if (
      !filters ||
      !filters.dateRange ||
      !(filters.dateRange.from instanceof Date) ||
      !(filters.dateRange.to instanceof Date)
    ) {
      console.warn("❌ Skipping fetch: Missing or invalid dateRange filters.");
      setLoading(false);
      // Set a specific error for invalid filters if needed, or just warn and return
      // setError(new Error("Invalid date range provided."));
      return;
    }

    const fetchProfitData = async () => {
      setLoading(true);
      setData(null); // Clear previous data on new fetch
      setError(null); // Clear any previous errors

     
      const fromDate = filters.dateRange.from.toLocaleDateString('en-CA');
      const toDate = filters.dateRange.to.toLocaleDateString('en-CA');


      const sql = `
        CALL GET_PROFIT_METRICS_PROCEDURE(
          '${fromDate}'::DATE,
          '${toDate}'::DATE,
          ${
            filters.selectedAreas.length > 0
              ? `'${filters.selectedAreas.map(escapeSQL).join(",")}'`
              : "NULL"
          },
          ${
            filters.selectedStations.length > 0
              ? `'${filters.selectedStations.map(escapeSQL).join(",")}'`
              : "NULL"
          },
          ${filters.aggregation ? `'${escapeSQL(filters.aggregation)}'` : "NULL"}
        )
      `;

      // console.log("🔍 Executing SQL:", sql);

      try {
        const response = await fetch("/api/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql }),
        });

        if (!response.ok) {
          // Handle non-2xx HTTP responses gracefully
          const errorDetail = await response.text();
          // console.error(`❌ HTTP error! Status: ${response.status}, Details: ${errorDetail}`);
          setError(new Error(`Failed to fetch data: ${response.status} ${response.statusText}. Details: ${errorDetail.substring(0, 100)}...`));
          return; // Stop execution here, don't try to parse JSON
        }

        const result = await response.json();
        console.log("✅ Raw result from stored procedure:", result[0]);

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0]?.GET_PROFIT_METRICS_PROCEDURE
        ) {
          const payload = result[0].GET_PROFIT_METRICS_PROCEDURE;
          if (
            typeof payload.TOTAL_PROFIT === "number" &&
            Array.isArray(payload.data)
          ) {
            setData(payload);
          } else {
            console.warn("⚠️ Response received but invalid format", payload);
            setData(null); // Ensure data is null if format is unexpected
            setError(new Error("API response is in an unexpected format."));
          }
        } else {
          console.warn("⚠️ Unexpected response shape", result);
          setData(null); // Ensure data is null if shape is unexpected
          setError(new Error("API returned an unexpected data structure."));
        }
      } catch (e: any) {
        // Catch network errors or issues during JSON parsing
        console.error("❌ Network or parsing error fetching profit data:", e);
        setData(null); // Ensure data is null on error
        setError(e instanceof Error ? e : new Error("An unknown network or data processing error occurred."));
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [filters]);

  return {
    data,
    loading,
    error,
    profit: data?.TOTAL_PROFIT ?? null,
  };
};