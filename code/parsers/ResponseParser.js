export class ResponseParser {
  /**
   * Parse LLM response to extract table names
   * @param {string|object} response - Raw LLM response
   * @param {Array} tableDescriptions - Available table descriptions
   * @returns {Array} - Parsed table names
   */
  static parseTableSelectionResponse(response, tableDescriptions) {
    try {
      const selectedTables = this._extractJSONFromResponse(response);
      const validTables = this._validateSelectedTables(
        selectedTables,
        tableDescriptions
      );

      if (validTables.length === 0) {
        console.warn(
          "No valid tables found in LLM response, using keyword matching fallback"
        );
        return this._fallbackTableSelection(response, tableDescriptions);
      }

      return validTables;
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      console.log("Raw response:", response);

      // Fallback to keyword matching
      return this._fallbackTableSelection(response, tableDescriptions);
    }
  }

  /**
   * Parse reasoning/explanation text from LLM response (supports full JSON object or fallback)
   * @param {string|object} response - Raw LLM response
   * @returns {string} - Extracted reasoning text
   */
  static parseReasoningFromResponse(response) {
    if (typeof response !== "string") {
      response = JSON.stringify(response);
    }

    // Remove markdown code blocks completely
    let cleanedResponse = response
      .replace(/```json\n?/gi, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    // Extract first valid JSON object substring
    const jsonObjectString = this._extractFirstJSONObject(cleanedResponse);

    if (jsonObjectString) {
      try {
        const json = JSON.parse(jsonObjectString);
        if (json && typeof json === "object" && json.reasoning) {
          return json.reasoning;
        }
      } catch {
        // Ignore JSON parse errors, fallback below
      }
    }

    // Fallback: find first JSON array and get text after it
    const jsonArrayMatch = cleanedResponse.match(/\[.*?\]/s);
    if (jsonArrayMatch) {
      const afterJson = cleanedResponse
        .slice(jsonArrayMatch.index + jsonArrayMatch[0].length)
        .trim();
      return afterJson.replace(/^Reasoning:\s*/i, "");
    }

    // Last fallback: return entire cleaned text
    return cleanedResponse;
  }

  /**
   * Extract JSON array from LLM response
   * @private
   * @param {string|object} response
   */
  static _extractJSONFromResponse(response) {
    // Convert to string if it's not already
    if (typeof response !== "string") {
      response = JSON.stringify(response);
    }

    let cleanedResponse = response.trim();

    // Remove markdown-style code blocks
    cleanedResponse = cleanedResponse
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "");

    // Try to find a JSON array in the string
    const jsonMatch = cleanedResponse.match(/\[.*?\]/s);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    // Parse and return JSON
    return JSON.parse(cleanedResponse);
  }

  /**
   * Validate that selected tables exist in descriptions
   * @private
   */
  static _validateSelectedTables(selectedTables, tableDescriptions) {
    const availableTables = tableDescriptions.map((desc) => desc.table);
    return selectedTables.filter((table) => availableTables.includes(table));
  }

  /**
   * Fallback method using keyword matching if JSON parsing fails
   * @private
   * @param {string|object} response
   * @param {Array} tableDescriptions
   */
  static _fallbackTableSelection(response, tableDescriptions) {
    let responseText =
      typeof response === "string" ? response : JSON.stringify(response);

    const responseLower = responseText.toLowerCase();
    const selectedTables = [];

    for (const desc of tableDescriptions) {
      if (responseLower.includes(desc.table.toLowerCase())) {
        selectedTables.push(desc.table);
      }
    }

    // Fallback to first few tables if nothing matched
    if (selectedTables.length === 0) {
      return tableDescriptions
        .slice(0, Math.min(3, tableDescriptions.length))
        .map((desc) => desc.table);
    }

    return selectedTables;
  }

  /**
   * Extract the first balanced JSON object substring from a string
   * @private
   * @param {string} text
   * @returns {string|null} JSON substring or null if none found
   */
  static _extractFirstJSONObject(text) {
    const startIndex = text.indexOf("{");
    if (startIndex === -1) return null;

    let openBraces = 0;
    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === "{") openBraces++;
      else if (text[i] === "}") openBraces--;

      if (openBraces === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
    return null;
  }
}
