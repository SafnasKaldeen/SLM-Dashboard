
// ==========================================
// app/api/cache-analytics/details/[hash]/route.ts
// ==========================================
// View detailed logs for a specific query
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';


export async function GET_QUERY_DETAILS(
  req: NextRequest,
  { params }: { params: { hash: string } }
) {
  const redis = await getRedis();
  const { hash } = params;
  
  try {
    // Get query statistics
    const statsKey = `query:stats:${hash}`;
    const stats = await redis.get(statsKey);
    
    if (!stats) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    const queryStats = JSON.parse(stats);
    
    // Get recent execution logs
    const logPattern = `query:log:${hash.substring(0, 8)}:*`;
    const logKeys = await redis.keys(logPattern);
    
    const recentLogs = [];
    for (const key of logKeys.slice(-50)) { // Last 50 executions
      const log = await redis.get(key);
      if (log) {
        recentLogs.push(JSON.parse(log));
      }
    }
    
    // Sort by timestamp descending
    recentLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json({
      statistics: queryStats,
      recentExecutions: recentLogs.map(log => ({
        timestamp: log.timestamp,
        cacheStatus: log.cacheStatus,
        duration: log.duration,
        rowCount: log.rowCount,
        userId: log.userId
      })),
      recommendation: generateRecommendation(queryStats)
    });
    
  } catch (error) {
    console.error("❌ Failed to fetch query details:", error);
    return NextResponse.json({ error: "Failed to fetch query details" }, { status: 500 });
  }
}

function generateRecommendation(stats: any): string {
  const { preWarmScore, cacheHitRate, totalMisses, avgDuration } = stats;
  
  if (preWarmScore > 70) {
    return "🔥 HIGHLY RECOMMENDED for pre-warming. This query is executed frequently with significant misses.";
  } else if (preWarmScore > 50) {
    return "✅ GOOD CANDIDATE for pre-warming. Consider adding to scheduled pre-warm jobs.";
  } else if (cacheHitRate > 80) {
    return "✨ Already performing well. Current caching strategy is effective.";
  } else if (totalMisses < 5) {
    return "📊 Insufficient data. Monitor for more executions before deciding.";
  } else if (avgDuration < 1000) {
    return "⚡ Fast query. Pre-warming may not provide significant benefits.";
  }
  
  return "📌 MODERATE CANDIDATE. Review execution patterns before pre-warming.";
}
