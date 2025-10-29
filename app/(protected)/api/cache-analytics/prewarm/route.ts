// POST /api/cache-analytics/prewarm - Pre-warm cache for specific queries
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const redis = await getRedis();
  
  try {
    const { queryHashes, topN } = await req.json();
    
    let hashesToPrewarm: string[] = [];
    
    if (queryHashes && Array.isArray(queryHashes)) {
      // Pre-warm specific hashes
      hashesToPrewarm = queryHashes;
    } else if (topN && typeof topN === "number") {
      // Pre-warm top N candidates
      hashesToPrewarm = await redis.zrange('query:prewarm:candidates', -topN, -1, { REV: true });
    } else {
      return NextResponse.json({ error: "Must provide either queryHashes array or topN number" }, { status: 400 });
    }
    
    const results = [];
    
    for (const hash of hashesToPrewarm) {
      const statsKey = `query:stats:${hash}`;
      const stats = await redis.get(statsKey);
      
      if (stats) {
        const queryStats = JSON.parse(stats);
        results.push({
          hash: queryStats.shortHash,
          sql: queryStats.sql.substring(0, 100) + "...",
          score: queryStats.preWarmScore,
          status: "queued"
        });
        
        // Add to pre-warm queue
        await redis.lpush('prewarm:queue', JSON.stringify({
          queryHash: hash,
          sql: queryStats.sql,
          priority: queryStats.preWarmScore,
          queuedAt: new Date().toISOString()
        }));
      }
    }
    
    return NextResponse.json({
      message: `Queued ${results.length} queries for pre-warming`,
      queries: results
    });
    
  } catch (error) {
    console.error("❌ Failed to queue pre-warm:", error);
    return NextResponse.json({ error: "Failed to queue pre-warm" }, { status: 500 });
  }
}