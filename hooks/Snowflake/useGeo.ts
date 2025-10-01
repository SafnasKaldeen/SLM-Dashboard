import React, { useEffect, useState } from "react";

// --- Types ---

export interface StationUtilizationParams {
  dateRange: {
    from: Date;
    to: Date;
  };
  selectedAreas: string[];
  selectedStations: string[];
  aggregation: "daily" | "weekly" | "monthly";
}

export interface StationUtilizationMetrics {
  DATE: string;
  LOCATION: string;
  STATIONNAME: string;
  TOTAL_REVENIE: number; // typo as per your API
  PERSONAL_BEST?: number;
  UTILIZATION_PERCENTAGE: number;
}

export interface StationUtilizationApiResponse {
  AVERAGE_UTILIZATION: number;
  MAX_UTILIZATION: number;
  MIN_UTILIZATION: number;
  data: StationUtilizationMetrics[];
  TOTAL_STATION_COUNT: number;
  TOP_PEFORMER_STATION: string; // corrected type
  TOP_PEFORMER_AREA: string;    // corrected type
}

// --- Hook ---

export function useStationUtilization(params: StationUtilizationParams) {
  const [data, setData] = useState<StationUtilizationApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const escapeSQL = (str: string) => str.replace(/'/g, "''");

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {

      const fromDate = params.dateRange.from.toLocaleDateString('en-CA');
      const toDate = params.dateRange.to.toLocaleDateString('en-CA');


        const areas =
          params.selectedAreas.length > 0
            ? `'${params.selectedAreas.map(escapeSQL).join(",")}'`
            : "NULL";

        const stations =
          params.selectedStations.length > 0
            ? `'${params.selectedStations.map(escapeSQL).join(",")}'`
            : "NULL";

        const aggregation = params.aggregation
          ? `'${escapeSQL(params.aggregation)}'`
          : "NULL";

        const sql = `
          CALL GET_STATION_UTILIZATION_PROCEDURE(
            '${fromDate}'::DATE,
            '${toDate}'::DATE,
            ${areas},
            ${stations},
            ${aggregation}
          )
        `;

        // console.log("🔍 Executing SQL:", sql);

        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${res.statusText} - ${text}`);
        }

        const json = await res.json();

        if (
          Array.isArray(json) &&
          json.length > 0 &&
          json[0].GET_STATION_UTILIZATION_PROCEDURE
        ) {
          if (!isCancelled) {
            setData(json[0].GET_STATION_UTILIZATION_PROCEDURE);
          }
        } else {
          if (!isCancelled) {
            console.warn("⚠️ Unexpected response structure:", json);
            setError("Unexpected API response structure");
            setData(null);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Unknown error");
          setData(null);
        }
      } finally {
        if (!isCancelled) setLoading(false);
        console.log("🔄 Station Utilization fetch completed", data);
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [params]);

  return {
    data,
    loading,
    error,
  };
}
