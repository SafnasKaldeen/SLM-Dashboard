import catalog from "../Prompts/catalog.js"; // Adjust path as needed

export class SemanticBuilderService {
  /**
   * Build semantic model JSON filtered by selected tables from the organization catalog.
   * Falls back to catalog access control if organization catalog accessControl is missing.
   *
   * @param {string[]} selectedTables - List of selected table names (case-insensitive)
   * @param {object} organizationCatalog - Full catalog with tables, relationships, measures, filters, accessControl
   * @returns {object} Filtered semantic model JSON
   */
  static buildSemanticModel(selectedTables, organizationCatalog) {
    if (!Array.isArray(selectedTables) || selectedTables.length === 0) {
      return {
        tables: {},
        relationships: [],
        measures: {},
        default_filters: {},
        accessControl: {},
      };
    }

    // Normalize selectedTables to lowercase for case-insensitive matching
    const normalizedSelected = selectedTables.map((tbl) => tbl.toLowerCase());

    // 1. Filter tables metadata by selected tables (case-insensitive match)
    const filteredTables = {};
    for (const tblName of Object.keys(organizationCatalog.tables || {})) {
      if (normalizedSelected.includes(tblName.toLowerCase())) {
        filteredTables[tblName] = organizationCatalog.tables[tblName];
      }
    }

    // 2. Filter relationships where both left and right tables are in selectedTables
    const filteredRelationships = (
      organizationCatalog.relationships || []
    ).filter(
      (rel) =>
        normalizedSelected.includes(rel.left_table.toLowerCase()) &&
        normalizedSelected.includes(rel.right_table.toLowerCase())
    );

    // 3. Filter measures whose expression references any selected table
    const filteredMeasures = {};
    if (organizationCatalog.measures) {
      for (const [measureName, measureDef] of Object.entries(
        organizationCatalog.measures
      )) {
        const exprLower = measureDef.expression.toLowerCase();
        if (normalizedSelected.some((tbl) => exprLower.includes(tbl))) {
          filteredMeasures[measureName] = measureDef;
        }
      }
    }

    // 4. Include default filters from organization catalog as is
    const default_filters = organizationCatalog.default_filters || {};

    // 5. Filter accessControl entries by selected tables (case-insensitive)
    const filteredAccessControl = {};
    if (organizationCatalog.accessControl) {
      for (const [tblName, perms] of Object.entries(
        organizationCatalog.accessControl
      )) {
        if (normalizedSelected.includes(tblName.toLowerCase())) {
          filteredAccessControl[tblName] = perms;
        }
      }
    }

    // 6. If no access control found in org catalog, fallback to catalog's access control
    if (
      Object.keys(filteredAccessControl).length === 0 &&
      catalog.accessControl
    ) {
      for (const [tblName, perms] of Object.entries(catalog.accessControl)) {
        if (normalizedSelected.includes(tblName.toLowerCase())) {
          filteredAccessControl[tblName] = perms;
        }
      }
    }

    // 7. Return constructed semantic model JSON
    return {
      tables: filteredTables,
      relationships: filteredRelationships,
      measures: filteredMeasures,
      default_filters,
      accessControl: filteredAccessControl,
    };
  }
}
