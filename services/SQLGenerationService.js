import {
  permissionCheckPrompt,
  sqlGenerationPrompt,
} from "../Prompts/SQLGenerationPrompts.js";
import { ReportGenerationService } from "./ReportGenerationService.js";
import MongoDBManager from "../lib/mongodb.ts";

export class SQLQueryService {
  static validateQueryParameters(semanticModel) {
    if (!semanticModel || typeof semanticModel !== "object") {
      throw new Error("Semantic model must be an object");
    }
    if (!semanticModel.query) {
      throw new Error("Semantic model must include 'query' string");
    }
    return true;
  }

  // Extract JSON block from the LLM response (handles fenced and non-fenced JSON)
  static extractJSON(text) {
    // Remove code fences
    let cleaned = text.replace(/```json\n?|```/g, "").trim();

    // Fix JS-style multi-line strings with + signs into valid JSON
    cleaned = cleaned.replace(/"\s*\+\s*"/g, ""); // remove `" + "` concatenations
    cleaned = cleaned.replace(/\\n/g, "\\n"); // keep newlines escaped

    // Try to match the actual JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in LLM response.");
    }

    return jsonMatch[0];
  }

  static async callLLM(prompt) {
    // Call your LLM here, e.g., fetch or API call
    return await ReportGenerationService(prompt);
  }

  static async runPermissionCheck(semanticModel) {
    // console.log(
    //   "🔄 Running permission check...",
    //   JSON.stringify(semanticModel, null, 2)
    // );
    const prompt = permissionCheckPrompt(semanticModel);
    // console.log("🔄 LLM Request for Permission Check:", prompt);
    const llmResponse = await this.callLLM(prompt);
    const jsonText = this.extractJSON(llmResponse);
    // console.log("🔄 LLM Response for Permission Check:", jsonText);

    try {
      return JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON parse error on permission check response:", err);
      console.error("Raw JSON text:", jsonText);
      throw new Error(
        "Failed to parse permission check JSON response: " + err.message
      );
    }
  }

  static async runSQLGeneration(semanticModel, resolvedQuery = null) {
    const prompt = sqlGenerationPrompt(semanticModel, resolvedQuery);
    console.log("🔄 LLM Request for SQL Generation:", prompt);
    const llmResponse = await this.callLLM(prompt);
    const jsonText = this.extractJSON(llmResponse);
    // console.log("🔄 LLM Response for SQL Generation:", jsonText);

    try {
      return JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON parse error on SQL generation response:", err);
      console.error("Raw JSON text:", jsonText);
      throw new Error(
        "Failed to parse SQL generation JSON response: " + err.message
      );
    }
  }

  static async generateQuery(semanticModel) {
    this.validateQueryParameters(semanticModel);

    // console.log("🔄 Running permission check...", semanticModel);
    // Step 1: Run permission check
    const permissionResult = await this.runPermissionCheck(semanticModel);
    // console.log("✅ Permission check result:", permissionResult);
    if (!permissionResult.allowed) {
      // Save failure details to MongoDB for analysis
      try {
        await MongoDBManager.savePermissionFailure({
          semanticModel,
          explanation:
            permissionResult.explanation || "No explanation provided",
          timestamp: new Date(),
        });
        console.log("🔴 Permission failure saved to DB");
      } catch (err) {
        console.error("Error saving permission failure to DB:", err);
      }

      return {
        sql: "",
        explanation: permissionResult.explanation,
      };
    }

    // Step 2: Permissions allowed, generate SQL
    // Pass resolvedQuery from permission check if available, else null
    const resolvedQuery = permissionResult.resolvedQuery || null;

    const sqlResult = await this.runSQLGeneration(semanticModel, resolvedQuery);

    if (!sqlResult.sql || !sqlResult.explanation) {
      throw new Error("Invalid response from SQL generation step.");
    }

    return {
      sql: sqlResult.sql.trim(),
      explanation: sqlResult.explanation.trim(),
    };
  }
}
