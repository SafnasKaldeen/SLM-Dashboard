// utils/SQLPromptFormatters.js
export class SQLPromptFormatters {
  static formatTables(tables = {}) {
    return Object.entries(tables)
      .map(([tableName, tableData]) => {
        const columns = Object.entries(tableData.columns || {})
          .map(([colName, colData]) => `- ${colName} (${colData.type})`)
          .join("\n");

        return `Table: ${tableName}\nDescription: ${
          tableData.description || "N/A"
        }\nColumns:\n${columns}`;
      })
      .join("\n\n");
  }

  static formatRelationships(relationships = []) {
    if (!relationships.length) return "No relationships defined.";
    return relationships
      .map(
        (rel) =>
          `- ${rel.left_table}.${rel.left_column} → ${rel.right_table}.${rel.right_column} (${rel.type})`
      )
      .join("\n");
  }

  static formatMeasures(measures = {}) {
    if (!Object.keys(measures).length) return "No measures defined.";
    return Object.entries(measures)
      .map(
        ([name, data]) =>
          `- ${name}: ${data.expression || data.formula || "N/A"} (${
            data.description || "No description"
          })`
      )
      .join("\n");
  }

  static formatFilters(filters = {}) {
    const result = [];
    for (const [table, cols] of Object.entries(filters)) {
      for (const [column, { operator, value }] of Object.entries(cols)) {
        result.push(`- ${table}.${column} ${operator} ${value}`);
      }
    }
    return result.length ? result.join("\n") : "No default filters.";
  }

  static formatAccessControlForTables(accessControl = {}, selectedTables = []) {
    const lowerSelected = selectedTables.map((t) => t.toLowerCase());
    const entries = selectedTables.length
      ? Object.entries(accessControl).filter(([table]) =>
          lowerSelected.includes(table.toLowerCase())
        )
      : Object.entries(accessControl);

    if (!entries.length) {
      if (selectedTables.length > 0) {
        return `No access control defined for selected tables: ${selectedTables.join(
          ", "
        )}.`;
      }
      return "No access control defined.";
    }

    return entries
      .map(([table, perms]) => {
        const lines = [`Table: ${table}`];
        if (perms.read?.length) {
          lines.push(`  - Read: ${perms.read.join(", ")}`);
        } else {
          lines.push(`  - Read: (no roles have read access)`);
        }
        if (perms.write?.length) {
          lines.push(`  - Write: ${perms.write.join(", ")}`);
        }
        if (
          perms.columnConstraints &&
          Object.keys(perms.columnConstraints).length
        ) {
          lines.push(`  - Column Constraints:`);
          for (const [column, roles] of Object.entries(
            perms.columnConstraints
          )) {
            lines.push(`    • ${column}: ${roles.join(", ")}`);
          }
        }
        return lines.join("\n");
      })
      .join("\n\n");
  }
}

export function verifyAccessControlTables(
  selectedTables = [],
  accessControl = {}
) {
  const accessTables = Object.keys(accessControl).map((t) => t.toLowerCase());
  const missingTables = selectedTables.filter(
    (t) => !accessTables.includes(t.toLowerCase())
  );
  if (missingTables.length > 0) {
    console.warn(
      `Warning: Access control missing for tables: ${missingTables.join(", ")}`
    );
  } else {
    console.log("All selected tables have access control defined.");
  }
}
