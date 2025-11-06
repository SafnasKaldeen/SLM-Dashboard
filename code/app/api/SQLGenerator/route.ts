import { NextResponse } from "next/server";
import { SQLQueryService } from "@/services/SQLGenerationService";

export async function POST(req: Request) {
  try {
    const semanticModel = await req.json();

    // Validate semanticModel has the required props (optional but recommended)
    if (!semanticModel || !semanticModel.query || !semanticModel.executorRole) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid semanticModel payload",
        },
        { status: 400 }
      );
    }

    const { sql, explanation } = await SQLQueryService.generateQuery(semanticModel);

    return NextResponse.json({
      success: true,
      query: semanticModel.query,
      executorRole: semanticModel.executorRole,
      sql,
      explanation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
