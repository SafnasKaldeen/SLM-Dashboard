// ==========================================
// app/api/cache-analytics/export/route.ts
// ==========================================
// Export analytics data for external analysis
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';


export async function GET_EXPORT(req: NextRequest) {
  const redis = await getRedis();
  
  try {
    const topHashes = await redis.zrange('query:prewarm:candidates', 0, -1, { REV: true });
    
    const allData = [];
    for (const hash of topHashes) {
      const statsKey = `query:stats:${hash}`;
      const stats = await redis.get(statsKey);
      if (stats) {
        allData.push(JSON.parse(stats));
      }
    }
    
    // Format as CSV
    const csvHeader = "Hash,SQL,Executions,Hits,Misses,HitRate,AvgDuration,AvgRowCount,PreWarmScore,LastExecuted,FirstSeen\n";
    const csvRows = allData.map(s => 
      `"${s.shortHash}","${s.sql.replace(/"/g, '""')}",${s.totalExecutions},${s.totalHits},${s.totalMisses},${s.cacheHitRate.toFixed(2)},${s.avgDuration.toFixed(0)},${s.avgRowCount.toFixed(0)},${s.preWarmScore},${s.lastExecuted},${s.firstSeen}`
    ).join("\n");
    
    return new NextResponse(csvHeader + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=cache-analytics.csv"
      }
    });
    
  } catch (error) {
    console.error("❌ Failed to export analytics:", error);
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 });
  }
}