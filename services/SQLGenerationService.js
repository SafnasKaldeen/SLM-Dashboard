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

  // Extract JSON block from LLM output
  static extractJSON(text) {
    try {
      let cleaned = text.replace(/```json\n?|```/g, "").trim();
      cleaned = cleaned.replace(/"\s*\+\s*"/g, ""); // remove `" + "` concatenations
      cleaned = cleaned.replace(/\\n/g, "\\n"); // keep newlines escaped
      const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error("No JSON object found in LLM response.");
      return jsonMatch[0];
    } catch (err) {
      console.error("❌ Failed to extract JSON from LLM response:", err);
      throw err;
    }
  }

  static async callLLM(prompt) {
    return await ReportGenerationService(prompt);
  }

  static async runPermissionCheck(semanticModel) {
    const prompt = permissionCheckPrompt(semanticModel);
    console.log("🔍 Permission Check Prompt:\n", prompt);

    const llmResponse = await this.callLLM(prompt);
    const jsonText = this.extractJSON(llmResponse);
    console.log("📥 LLM Response for Permission Check:", jsonText);

    try {
      return JSON.parse(jsonText);
    } catch (err) {
      console.error("❌ JSON parse error (Permission Check):", err);
      throw new Error("Failed to parse permission check JSON: " + err.message);
    }
  }

  static async runSQLGeneration(semanticModel, resolvedQuery = null) {
    const prompt = sqlGenerationPrompt(semanticModel, resolvedQuery);

    const llmResponse = await this.callLLM(prompt);
    // console.log("📥 Raw SQL LLM Response:\n", llmResponse);

    const jsonText = this.extractJSON(llmResponse);
    // console.log("📥 Parsed JSON Text (SQL Generation):", jsonText);

    try {
      return JSON.parse(jsonText);
    } catch (err) {
      console.error("❌ JSON parse error (SQL Generation):", err);
      throw new Error("Failed to parse SQL generation JSON: " + err.message);
    }
  }

  static async generateQuery(semanticModel) {
    this.validateQueryParameters(semanticModel);

    // Step 1: Permission Check
    const permissionResult = await this.runPermissionCheck(semanticModel);
    if (!permissionResult.allowed) {
      try {
        await MongoDBManager.savePermissionFailure({
          semanticModel,
          explanation:
            permissionResult.explanation || "No explanation provided",
          timestamp: new Date(),
        });
        console.warn("🔐 Permission failure saved to DB");
      } catch (err) {
        console.error("❌ Failed to save permission failure to DB:", err);
      }

      return {
        sql: "",
        explanation: permissionResult.explanation,
      };
    }

    // Step 2: SQL Generation
    try {
      const resolvedQuery = permissionResult.resolvedQuery || null;
      const sqlResult = await this.runSQLGeneration(
        semanticModel,
        resolvedQuery
      );

      if (!sqlResult.sql || !sqlResult.explanation) {
        console.error(
          "⚠️ SQL generation returned incomplete response:",
          sqlResult
        );
        throw new Error("Invalid response from SQL generation step.");
      }

      return {
        sql: sqlResult.sql.trim(),
        explanation: sqlResult.explanation.trim(),
      };
    } catch (err) {
      console.error("🔥 SQL Generation Error:", err);
      return {
        sql: "",
        explanation:
          "An error occurred during SQL generation. Please try again later.",
      };
    }
  }
}
