// validators/TableValidator.js
export class TableValidator {
  /**
   * Validate input parameters
   * @param {string} humanQuery - User query
   * @param {Array} tableDescriptions - Table descriptions
   * @throws {Error} - If validation fails
   */
  static validateInput(humanQuery, tableDescriptions) {
    if (
      !humanQuery ||
      typeof humanQuery !== "string" ||
      humanQuery.trim().length === 0
    ) {
      throw new Error("Human query is required and must be a non-empty string");
    }

    if (!Array.isArray(tableDescriptions) || tableDescriptions.length === 0) {
      throw new Error("Table descriptions must be a non-empty array");
    }

    // Validate each table description
    tableDescriptions.forEach((desc, index) => {
      this._validateTableDescription(desc, index);
    });
  }

  /**
   * Validate individual table description
   * @private
   */
  static _validateTableDescription(desc, index) {
    if (!desc || typeof desc !== "object") {
      throw new Error(`Table description at index ${index} must be an object`);
    }

    if (!desc.table || typeof desc.table !== "string") {
      throw new Error(
        `Table description at index ${index} must have a valid table name`
      );
    }

    if (!desc.description || typeof desc.description !== "string") {
      throw new Error(
        `Table description at index ${index} must have a valid description`
      );
    }

    if (!Array.isArray(desc.columns) || desc.columns.length === 0) {
      throw new Error(
        `Table description at index ${index} must have a non-empty columns array`
      );
    }
  }

  /**
   * Validate table relationships
   * @param {Array} relationships - Table relationships
   * @param {Array} availableTables - Available table names
   * @returns {boolean} - Validation result
   */
  static validateRelationships(relationships, availableTables) {
    if (!Array.isArray(relationships)) {
      return false;
    }

    return relationships.every((rel) => {
      return (
        rel.fromTable &&
        rel.toTable &&
        availableTables.includes(rel.fromTable) &&
        availableTables.includes(rel.toTable)
      );
    });
  }
}
