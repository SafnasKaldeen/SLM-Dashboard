// utils/TableSelectorUtils.ts
import { TableDescription } from "../models/TableDescription.js";

// utils/TableSelectorUtils.ts
export default class TableSelectorUtils {

  /**
   * Fetch table descriptions dynamically from Snowflake metadata
   */
  static async fetchTableDescriptions(): Promise<TableDescription[]> {
    const sql = `
      SELECT 
        DATABASE_NAME,
        SCHEMA_NAME,
        TABLE_NAME,
        TABLE_TYPE,
        COMMENT,
        COLUMNS
      FROM ADHOC.METADATA.META_DATA
      ORDER BY DATABASE_NAME, SCHEMA_NAME, TABLE_NAME
    `;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/RunSQLQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    // console.log("Metadata response:", json);

    // ❌ Adjusted: use result.rows instead of json.rows
    if (!json?.result?.rows) {
      throw new Error("Invalid metadata response: no rows field in result");
    }

    return json.result.rows.map((row: any, index: number) => {
      // Each row should be an object from Snowflake
      const tableName = row.TABLE_NAME;
      const comment = row.COMMENT || "";
      const columnsRaw = row.COLUMNS;

      if (!tableName || typeof tableName !== "string") {
        console.warn(`Skipping invalid table at index ${index}`, row);
        return null; // Skip invalid entries
      }

      const columns =
        typeof columnsRaw === "string"
          ? columnsRaw.split(",").map((c) => c.trim())
          : Array.isArray(columnsRaw)
          ? columnsRaw
          : [];

      return new TableDescription(tableName, comment, columns);
    }).filter(Boolean) as TableDescription[]; // Remove nulls
  }

  /**
   * Sample fallback table descriptions (hardcoded)
   */
  static createSampleTableDescriptions(): TableDescription[] {
    return [
      new TableDescription("EMPLOYEES", "Employee details", ["ID", "NAME", "DEPARTMENT"]),
      new TableDescription("DEPARTMENTS", "Department info", ["ID", "NAME"]),
    ];
  }

  /**
   * Log table selection results
   */
  static logSelectionResults(
    query: string,
    selectedTables: TableDescription[],
    allTables: TableDescription[]
  ) {
    console.log(`Query: ${query}`);
    console.log("Selected tables:", selectedTables);
    console.log("All available tables:", allTables);
  }
}
