// prompts/TableSelectionPrompts.js

import { OrgContext } from "./OrgContext.js";
export class TableSelectionPrompts {
  /**
   * Create a well-structured prompt for table selection
   * @param {string} query - User query
   * @param {Array} descriptions - Table descriptions
   * @param {string} [context] - Optional organizational context or business rules
   * @returns {string} - Formatted prompt
   */
  static createTableSelectionPrompt(query, descriptions, context = OrgContext) {
    const formattedTables = this._formatTableDescriptions(descriptions);
    const tablesSection = formattedTables.join("\n\n");

    // Add context section if provided
    const contextSection = context.trim()
      ? `ORGANIZATIONAL CONTEXT:\n${context.trim()}\n\n`
      : "";

    return `${contextSection}You are a database expert helping to identify relevant tables for analytical queries.

ANALYTICAL REQUEST: "${query}"

AVAILABLE TABLES:
${tablesSection}

TASK: Analyze the query and determine which tables are needed. Consider:
1. Tables that contain the primary data requested
2. Tables needed for joins and relationships
3. Lookup or dimension tables only if directly relevant
4. Tables needed for filtering or grouping
5. Avoid including unnecessary tables

IMPORTANT:
- Select only tables relevant to answering the query
- Consider relationships like foreign keys and common columns
- Focus on data needed for calculations, filters, and grouping

RESPONSE FORMAT: Return a JSON object with the selected table names and a short reasoning. Return nothing else.

Example:
{
  "tables": ["returns", "order_items", "products", "categories", "reviews"],
  "reasoning": "Returns are needed to count returned products. Order items provide product link. Products and categories give metadata. Reviews give average rating."
}

SELECTED TABLES:
`;
  }

  /**
   * Format table descriptions for the prompt
   * @private
   */
  static _formatTableDescriptions(descriptions) {
    return descriptions.map((desc) => {
      let tableInfo = `Table: ${desc.table}
Description: ${desc.description}
Columns: ${desc.columns.join(", ")}`;

      if (desc.businessPurpose) {
        tableInfo += `\nBusiness Purpose: ${desc.businessPurpose}`;
      }
      if (desc.primaryKey) {
        tableInfo += `\nPrimary Key: ${desc.primaryKey}`;
      }

      return tableInfo;
    });
  }
}
