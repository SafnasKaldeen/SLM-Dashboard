// app/api/snowflake/connect/route.ts or route.js
import { connectToSnowflake } from "../../../gps/batch-analysis/Services/SnowflakeClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectToSnowflake();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
