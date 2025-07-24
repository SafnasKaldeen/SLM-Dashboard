import { useEffect, useState } from "react";

// Type definitions
export interface ExpenseMetrics {
  LOCATION: string;
  STATIONNAME: string;
  TOTAL_DIRECTPAY_COMMISSION: number;
  TOTAL_ELCTRICITY_BILL: number;
  TOTAL_MAINTANANCE_COST: number;
  TOTAL_STATION_RENT: number;
}

export interface ExpensesApiResponse {
  OVERALL_EXPENSES: number;
  OVERALL_DIRECTPAY_COMMISSION: number;
  OVERALL_ELCTRICITY_BILL: number;
  OVERALL_MAINTANANCE_COST: number;
  OVERALL_STATION_RENT: number;

  "previous segment OVERALL_EXPENSES": number;
  "previous segment OVERALL_DIRECTPAY_COMMISSION": number;
  "previous segment OVERALL_ELCTRICITY_BILL": number;
  "previous segment OVERALL_MAINTANANCE_COST": number;
  "previous segment OVERALL_STATION_RENT": number;

  data: ExpenseMetrics[];
}


export interface ExpensesFilters {
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
 * Custom hook to fetch expense metrics from backend.
 */
export const useExpenses = (filters?: ExpensesFilters) => {
  const [data, setData] = useState<ExpensesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !filters ||
      !filters.dateRange ||
      !(filters.dateRange.from instanceof Date) ||
      !(filters.dateRange.to instanceof Date)
    ) {
      console.warn("❌ Skipping fetch: Missing or invalid dateRange");
      setLoading(false);
      return;
    }

    const fetchExpensesData = async () => {
      setLoading(true);


      const fromDate = filters.dateRange.from.toLocaleDateString('en-CA');
      const toDate = filters.dateRange.to.toLocaleDateString('en-CA');

      const sql = `
        CALL GET_EXPENSE_METRICS_PROCEDURE(
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

        const result = await response.json();
        console.log("✅ Raw result from stored procedure:", result[0]);
        // Adjusting based on actual format
        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0]?.GET_EXPENSE_METRICS_PROCEDURE
        ) {
          const payload = result[0].GET_EXPENSE_METRICS_PROCEDURE;
          if (
            typeof payload.OVERALL_EXPENSES === "number" &&
            Array.isArray(payload.data)
          ) {
            setData(payload);
          } else {
            console.warn("⚠️ Response received but invalid format", payload);
            setData(null);
          }
        } else {
          console.warn("⚠️ Unexpected response shape", result);
          setData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching expenses data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesData();
  }, []);

  return { data, loading };
};
