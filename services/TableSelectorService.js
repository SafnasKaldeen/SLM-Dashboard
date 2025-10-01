import { ReportGenerationService } from "./ReportGenerationService.js";
import { TableSelectionPrompts } from "../Prompts/TableSelectionPrompts.js";
import { ResponseParser } from "../parsers/ResponseParser.js";
import { TableValidator } from "../validators/TableValidator.js";

class TableSelectorService {
  /**
   * Select relevant tables for a given human-readable query
   * @param {string} humanQuery - Natural language query from user
   * @param {Array} tableDescriptions - Array of table descriptions
   * @returns {Promise<{selectedTables: string[], reasoning: string}>} - Object containing relevant table names and reasoning
   */
  static async selectRelevantTables(humanQuery, tableDescriptions) {
    try {
      // Validate input
      TableValidator.validateInput(humanQuery, tableDescriptions);

      // Create the prompt for table selection
      const prompt = TableSelectionPrompts.createTableSelectionPrompt(
        humanQuery,
        tableDescriptions
      );

      // Get LLM response using your existing service (likely a raw string)
      const llmResponse = await ReportGenerationService(prompt);

      // Parse the response to extract table names
      const selectedTables = ResponseParser.parseTableSelectionResponse(
        llmResponse,
        tableDescriptions
      );

      // Parse reasoning/explanation text from raw LLM response string
      const reasoning = ResponseParser.parseReasoningFromResponse(llmResponse);

      console.log(`Selected tables for query '${humanQuery}':`, selectedTables);
      console.log(`Reasoning from LLM:`, reasoning);

      return { selectedTables, reasoning };
    } catch (error) {
      console.error("Error in table selection:", error);
      // Fallback: return all tables and fallback reasoning
      return {
        selectedTables: tableDescriptions.map((desc) => desc.table),
        reasoning: "Failed to retrieve reasoning, defaulted to all tables.",
      };
    }
  }

  /**
   * Enhanced table selection with relationship analysis
   * @param {string[]} selectedTables
   * @param {Array} relationships - Array of table relationships
   * @returns {string[]} - Enhanced table selection
   */
  static enhanceTableSelection(selectedTables, relationships = []) {
    const enhancedTables = new Set(selectedTables);

    // Add related tables that might be needed for joins
    for (const table of selectedTables) {
      const relatedTables = relationships
        .filter((rel) => rel.fromTable === table || rel.toTable === table)
        .map((rel) => (rel.fromTable === table ? rel.toTable : rel.fromTable));

      relatedTables.forEach((relTable) => enhancedTables.add(relTable));
    }

    return Array.from(enhancedTables);
  }
}

export { TableSelectorService };
