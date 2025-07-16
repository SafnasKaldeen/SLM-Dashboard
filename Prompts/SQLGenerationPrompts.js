import { SQLPromptFormatters } from "../utils/SQLPromptFormatters.js";

export const permissionCheckPrompt = (
  semanticModel,
  organizationalContext = ""
) => {
  const formattedTables = SQLPromptFormatters.formatTables(
    semanticModel.semanticModel.tables
  );
  const formattedRelationships = SQLPromptFormatters.formatRelationships(
    semanticModel.semanticModel.relationships
  );
  const formattedMeasures = SQLPromptFormatters.formatMeasures(
    semanticModel.semanticModel.measures
  );
  const formattedFilters = SQLPromptFormatters.formatFilters(
    semanticModel.semanticModel.default_filters
  );
  const formattedAccessControl = SQLPromptFormatters.formatAccessControl(
    semanticModel.semanticModel.accessControl
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
1. Identify all tables and columns required to answer the user's query, resolving synonyms.
2. Detect any ambiguous or unknown terms in the query.
3. Check if the user role has explicit read access to all required tables and columns.
4. strictly check for ambiguity If ambiguous or unknown terms exist, respond with a JSON object explaining the ambiguity.
5. If access is insufficient, respond with a JSON object denying access.
6. If access is sufficient and no ambiguity, respond with a JSON object confirming allowed access and an explanation for the decision.
7. If the query needs more context or information, ask for clarification.
8. Do not generate SQL queries or any other output.
9. If the query cannot be answered due to insufficient information, return an empty response with an explanation.

## OUTPUT FORMAT
Return exactly one JSON object with one of these formats:

- If ambiguous terms:
{
  "allowed": false,
  "explanation": "Ambiguous terms found: [...] Please clarify."
}

- If insufficient permissions:
{
  "allowed": false,
  "explanation": "The user does not have sufficient permissions to access the required tables or columns
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
  const formattedTables = SQLPromptFormatters.formatTables(
    semanticModel.semanticModel.tables
  );
  const formattedRelationships = SQLPromptFormatters.formatRelationships(
    semanticModel.semanticModel.relationships
  );
  const formattedMeasures = SQLPromptFormatters.formatMeasures(
    semanticModel.semanticModel.measures
  );
  const formattedFilters = SQLPromptFormatters.formatFilters(
    semanticModel.semanticModel.default_filters
  );
  const formattedAccessControl = SQLPromptFormatters.formatAccessControl(
    semanticModel.semanticModel.accessControl
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

## INSTRUCTIONS
1. Generate a SQL query that answers the user's question accurately.
2. Include GROUP BY, ORDER BY, COALESCE, and LIMIT if applicable.
3. Must Check default filters and apply them to the query whenever applicable if not applied give an explanation.
4. Use proper JOIN syntax and optimize for performance.
5. If the query contains ambiguous terms, Check if synonyms are available or messures are defined, and use them to resolve ambiguity.
6. Use meaningful aliases for readability and maintainability also add such synonyms in the explanation.
7. Ensure SQL is syntactically correct.
8. Return exactly one JSON object with "sql" and very descriptive "explanation".
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
