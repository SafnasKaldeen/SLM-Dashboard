// main prompts module

import {
  SQLPromptFormatters,
  verifyAccessControlTables,
} from "../utils/SQLPromptFormatters.js";
import catalog from "./catalog.js";

// Utility to resolve access control
function resolveAccessControl(semanticModel) {
  return catalog.accessControl;
}

export const permissionCheckPrompt = (
  semanticModel,
  organizationalContext = ""
) => {
  const tables = semanticModel.semanticModel.tables || {};
  const relationships = semanticModel.semanticModel.relationships || [];
  const measures = semanticModel.semanticModel.measures || {};
  const filters = semanticModel.semanticModel.default_filters || {};
  const accessControl = resolveAccessControl(semanticModel);
  const selectedTables = semanticModel.selectedTables;

  const formattedTables = SQLPromptFormatters.formatTables(tables);
  const formattedRelationships =
    SQLPromptFormatters.formatRelationships(relationships);
  const formattedMeasures = SQLPromptFormatters.formatMeasures(measures);
  const formattedFilters = SQLPromptFormatters.formatFilters(filters);

  const formattedAccessControl =
    SQLPromptFormatters.formatAccessControlForTables(
      accessControl,
      selectedTables
    );

  return `
You are an expert semantic analyzer and access controller.

## USER QUERY
"${semanticModel.query || "No query provided"}"

## USER ROLE
${semanticModel.executorRole || "guest"}

${
  organizationalContext
    ? `## ORGANIZATIONAL CONTEXT\n${organizationalContext}\n`
    : ""
}
## DATABASE SCHEMA

### Tables and Columns
${formattedTables}

### Relationships
${formattedRelationships}

### Access Control
${formattedAccessControl}

## INSTRUCTIONS

1. Identify all tables and columns required to answer the user's query, resolving synonyms and semantic equivalences.
2. Detect any ambiguous or unknown terms in the query.
3. Check if the user role has explicit read access to all required tables and columns, strictly enforcing the accessControl lists provided in the schema.
4. Do NOT assume or infer any implicit permissions. Access must be granted only if the user role is explicitly listed in the 'read' permissions for the table.
5. If there are column-level constraints for any required columns, the user role must also be explicitly listed in the allowed roles for those columns. If the role is not listed, deny access for that column.
6. If the user role is NOT explicitly authorized for any required table or column, deny access immediately, specifying the exact table or column causing denial.
7. Strictly identify ambiguous or unknown terms that cannot be resolved by the schema or measures. If such terms exist, do not proceed with access checks or query generation; immediately respond with a JSON object listing those terms.
8. If access is insufficient (missing explicit permissions), respond with a JSON object denying access, including the specific role, table, or column causing denial.
9. If the query needs more context or information, ask for clarification in the JSON response.
10. Do NOT generate SQL queries or any other output.
11. If the query cannot be answered due to insufficient information, return an empty response with a clear explanation.

---

### Output Format

Return exactly one JSON object with one of these formats:

- If ambiguous terms:

{
  "allowed": false,
  "explanation": "Ambiguous terms found: [...] Please clarify."
}

- If insufficient permissions:

{
  "allowed": false,
  "explanation": "The user role '<role>' does not have read access to the '<table>' table or the '<column>' column, which is required for this query."
}

- If access granted:

{
  "allowed": true,
  "explanation": "Access granted to the required tables and columns and Query has no ambiguous terms."
}

Do not add any extra text or commentary.
`.trim();
};

export const sqlGenerationPrompt = (
  semanticModel,
  resolvedQuery = null,
  organizationalContext = ""
) => {
  const tables = semanticModel.semanticModel.tables || {};
  const relationships = semanticModel.semanticModel.relationships || [];
  const measures = semanticModel.semanticModel.measures || {};
  const filters = semanticModel.semanticModel.default_filters || {};
  const accessControl = resolveAccessControl(semanticModel);
  const selectedTables = Object.keys(tables).map((t) => t.toLowerCase());
  verifyAccessControlTables(selectedTables, accessControl);

  const formattedTables = SQLPromptFormatters.formatTables(tables);
  const formattedRelationships =
    SQLPromptFormatters.formatRelationships(relationships);
  const formattedMeasures = SQLPromptFormatters.formatMeasures(measures);
  const formattedFilters = SQLPromptFormatters.formatFilters(filters);
  const formattedAccessControl =
    SQLPromptFormatters.formatAccessControlForTables(
      accessControl,
      selectedTables
    );

  const queryToUse =
    resolvedQuery || semanticModel.query || "No query provided";

  return `
You are an expert SQL query generator.

## USER QUERY
"${queryToUse}"

## USER ROLE
${semanticModel.executorRole || "guest"}

${
  organizationalContext
    ? `## ORGANIZATIONAL CONTEXT\n${organizationalContext}\n`
    : ""
}
## DATABASE SCHEMA

### Tables and Columns
${formattedTables}

### Relationships
${formattedRelationships}

### Predefined Measures
${formattedMeasures}

### Default Filters
${formattedFilters}

### Access Control
${formattedAccessControl}

## INSTRUCTIONS
1. Generate a SQL query that answers the user's question accurately.
2. Include GROUP BY, ORDER BY, COALESCE, and LIMIT if applicable.
3. Must check default filters and apply them to the query whenever applicable. If not applied, give an explanation.
4. Use proper JOIN syntax and optimize for performance.
5. If the query contains ambiguous terms, check if synonyms are available or measures are defined, and use them to resolve ambiguity.
6. Use meaningful aliases for readability and maintainability; also add such synonyms in the explanation.
7. Ensure SQL is syntactically correct.
8. Return exactly one JSON object with "sql" and a very descriptive "explanation".
9. If data is insufficient, return empty sql with explanation.
10. Do not add extra commentary or text.

IMPORTANT: Return the JSON object in valid JSON format, escaping all newlines inside string values as \\n. The entire JSON should be parseable by standard JSON parsers.

## OUTPUT FORMAT
{
  "sql": "...",
  "explanation": "..."
}
`.trim();
};
