export class SQLPromptFormatters {
  static formatTables(tables = {}) {
    return Object.entries(tables)
      .map(([tableName, tableData]) => {
        const columns = Object.entries(tableData.columns || {})
          .map(([colName, colData]) => `- ${colName} (${colData.type})`)
          .join("\n");

        return `Table: ${tableName}\nDescription: ${
          tableData.description || "N/A"
        }\nfullName: ${tableData.fullName || "PUBLIC"}\nColumns:\n${columns}
        `;
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
        ([name, data]) => `- ${name}: ${data.expression} (${data.description})`
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

  static formatAccessControl(accessControl = {}) {
    const result = [];

    for (const [table, perms] of Object.entries(accessControl)) {
      result.push(`Table: ${table}`);
      if (perms.read) result.push(`  - Read: ${perms.read.join(", ")}`);
      if (perms.write) result.push(`  - Write: ${perms.write.join(", ")}`);
      if (perms.columnConstraints) {
        result.push("  - Column Constraints:");
        for (const [col, roles] of Object.entries(perms.columnConstraints)) {
          result.push(`    • ${col}: ${roles.join(", ")}`);
        }
      }
    }

    return result.length ? result.join("\n") : "No access control defined.";
  }
}
