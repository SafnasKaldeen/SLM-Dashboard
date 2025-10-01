export class SemanticBuilderService {
  /**
   * Build semantic model JSON from selected tables and organization catalog
   * @param {string[]} selectedTables - List of selected table names
   * @param {object} organizationCatalog - Full catalog with tables, columns, relationships, measures, filters
   * @returns {object} - Semantic model JSON
   */
  static buildSemanticModel(selectedTables, organizationCatalog) {
    // 1. Filter tables metadata by selected tables
    const filteredTables = {};
    selectedTables.forEach((tableName) => {
      if (organizationCatalog.tables[tableName]) {
        filteredTables[tableName] = organizationCatalog.tables[tableName];
      }
    });

    // 2. Filter relationships where both sides are in selected tables
    const filteredRelationships = organizationCatalog.relationships.filter(
      (rel) =>
        selectedTables.includes(rel.left_table) &&
        selectedTables.includes(rel.right_table)
    );

    // 3. Optionally filter measures related to selected tables
    const filteredMeasures = {};
    if (organizationCatalog.measures) {
      for (const [measureName, measureDef] of Object.entries(
        organizationCatalog.measures
      )) {
        if (
          selectedTables.some((tbl) =>
            measureDef.expression.toLowerCase().includes(tbl.toLowerCase())
          )
        ) {
          filteredMeasures[measureName] = measureDef;
        }
      }
    }

    // 4. Optionally filter default filters related to selected tables
    const default_filters = organizationCatalog.default_filters;

    // 5. Filter access control by selected tables
    const filteredAccessControl = {};
    if (organizationCatalog.accessControl) {
      selectedTables.forEach((tbl) => {
        if (organizationCatalog.accessControl[tbl]) {
          filteredAccessControl[tbl] = organizationCatalog.accessControl[tbl];
        }
      });
    }

    // 6. Construct semantic model JSON
    return {
      tables: filteredTables,
      relationships: filteredRelationships,
      measures: filteredMeasures,
      default_filters: default_filters,
    };
  }
}
