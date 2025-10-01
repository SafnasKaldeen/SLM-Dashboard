// app/(protected)/api/stations/route.ts
import { NextResponse } from "next/server";
import { DEFAULT_CHARGING_STATIONS } from "./data";

export async function GET() {
  try {
    return NextResponse.json(DEFAULT_CHARGING_STATIONS);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load stations" }, { status: 500 });
  }
}
