import { runQuery } from "../../../gps/batch-analysis/Services/SnowflakeClientWith2FA";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache (query -> results)
const queryCache = new Map<string, any>();

// Optional: Set cache expiry in ms (e.g., 5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

// Stats
let cacheHits = 0;
let cacheMisses = 0;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    // console.log("📥 Received query:", query);

    // ✅ Check cache first
    if (queryCache.has(query)) {
      const cachedAt = cacheTimestamps.get(query) ?? 0;
      const isExpired = Date.now() - cachedAt > CACHE_TTL;

      if (!isExpired) {
        cacheHits++;
        console.log(`⚡ Cache HIT (hits: ${cacheHits}, misses: ${cacheMisses})`);
        return NextResponse.json(queryCache.get(query));
      }

      // Remove expired cache
      queryCache.delete(query);
      cacheTimestamps.delete(query);
    }

    // ❌ Not in cache → go to Snowflake
    cacheMisses++;
    console.log(`🐌 Cache MISS (hits: ${cacheHits}, misses: ${cacheMisses})`);

    const results = await runQuery(query);

    // ✅ Store in cache
    queryCache.set(query, results);
    cacheTimestamps.set(query, Date.now());

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
