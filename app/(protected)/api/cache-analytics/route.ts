// app/api/cache-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

interface CacheCandidate {
  queryHash: string;
  hits: number;
  misses: number;
  total: number;
  hitRatio: number;
  score: number;
  sql: string;
  isCached: boolean;
  isPersistent: boolean;
  cacheSize: number;
  ttl: number | null;
  lastCacheHit: string | null;
  consecutiveDaysNoHits: number;
  recentHits: number;
  activeDays: number;
}

interface Summary {
  totalQueries: number;
  totalHits: number;
  totalMisses: number;
  averageHitRatio: number;
  cachedQueries: number;
  persistentQueries: number;
  expiringSoon: number;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sortBy = searchParams.get('sortBy') || 'score';
  const limit = parseInt(searchParams.get('limit') || '50');
  const showOnlyPersistent = searchParams.get('persistent') === 'true';

  try {
    const redis = await getRedis();
    
    // Use SCAN instead of KEYS to avoid blocking Redis
    const statsKeys: string[] = [];
    let cursor = '0'; // Change from number to string

    do {
      const result = await redis.scan(cursor, {
        MATCH: 'query:stats:*',
        COUNT: 100
      });
      
      cursor = result.cursor.toString(); // Ensure cursor is always string
      statsKeys.push(...result.keys);
    } while (cursor !== '0'); // Compare with string '0'
    
    if (statsKeys.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        candidates: [],
        summary: {
          totalQueries: 0,
          totalHits: 0,
          totalMisses: 0,
          averageHitRatio: 0,
          cachedQueries: 0,
          persistentQueries: 0,
          expiringSoon: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const candidates: CacheCandidate[] = [];
    
    let totalHits = 0;
    let totalMisses = 0;
    let cachedCount = 0;
    let persistentCount = 0;
    let expiringSoonCount = 0;

    const last7Days = getLast7Days();
    const today = new Date().toISOString().slice(0, 10);

    // Process each query's stats
    for (const statsKey of statsKeys) {
      const statsData = await redis.get(statsKey);
      if (!statsData) continue;
      
      const stats = JSON.parse(statsData);
      const queryHash = statsKey.replace('query:stats:', '');
      
      const hits = stats.totalHits || 0;
      const misses = stats.totalMisses || 0;
      const total = hits + misses;
      
      if (total === 0) continue;
      
      const hitRatio = hits / total;
      
      totalHits += hits;
      totalMisses += misses;
      
      // Check all possible cache keys (static and date-based)
      let isCached = false;
      let cacheSize = 0;
      let ttl: number | null = null;
      let cacheKey = `cache:${queryHash}`;
      
      // Check static cache first
      let cachedData = await redis.get(cacheKey);
      
      // If not found, check today's date-based cache
      if (!cachedData) {
        cacheKey = `cache:${queryHash}:${today}`;
        cachedData = await redis.get(cacheKey);
      }
      
      if (cachedData) {
        isCached = true;
        cacheSize = Buffer.byteLength(cachedData, 'utf8');
        ttl = await redis.ttl(cacheKey);
      }
      
      if (isCached) cachedCount++;
      
      const isPersistent = stats.isPersistent || false;
      if (isPersistent) persistentCount++;
      
      // Check if expiring soon (less than 6 hours)
      if (ttl !== null && ttl > 0 && ttl < 21600) {
        expiringSoonCount++;
      }
      
      // Calculate recent activity with safe defaults
      const dailyHitHistory = stats.dailyHitHistory || {};
      const recentHits = last7Days.reduce((sum, date) => 
        sum + (dailyHitHistory[date] || 0), 0
      );
      
      const activeDays = last7Days.filter(date => 
        (dailyHitHistory[date] || 0) > 0
      ).length;
      
      // Filter by persistent if requested
      if (showOnlyPersistent && !isPersistent) continue;
      
      candidates.push({
        queryHash,
        hits,
        misses,
        total,
        hitRatio,
        score: stats.preWarmScore || 0,
        sql: stats.sql || 'N/A',
        isCached,
        isPersistent,
        cacheSize,
        ttl: ttl !== null && ttl > 0 ? ttl : null,
        lastCacheHit: stats.lastCacheHit || null,
        consecutiveDaysNoHits: stats.consecutiveDaysNoHits || 0,
        recentHits,
        activeDays,
      });
    }

    // Sort based on requested criteria
    if (sortBy === 'hits') {
      candidates.sort((a, b) => b.hits - a.hits);
    } else if (sortBy === 'hitRatio') {
      candidates.sort((a, b) => b.hitRatio - a.hitRatio);
    } else if (sortBy === 'score') {
      candidates.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'total') {
      candidates.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'recentActivity') {
      candidates.sort((a, b) => b.recentHits - a.recentHits);
    }

    // Limit results
    const limitedCandidates = candidates.slice(0, limit);

    // Calculate summary
    const totalQueries = candidates.length;
    const totalRequests = totalHits + totalMisses;
    const averageHitRatio = totalRequests > 0 ? totalHits / totalRequests : 0;

    const summary: Summary = {
      totalQueries,
      totalHits,
      totalMisses,
      averageHitRatio,
      cachedQueries: cachedCount,
      persistentQueries: persistentCount,
      expiringSoon: expiringSoonCount,
    };

    return NextResponse.json({
      success: true,
      count: limitedCandidates.length,
      candidates: limitedCandidates,
      summary,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        candidates: [],
        summary: {
          totalQueries: 0,
          totalHits: 0,
          totalMisses: 0,
          averageHitRatio: 0,
          cachedQueries: 0,
          persistentQueries: 0,
          expiringSoon: 0,
        },
      },
      { status: 500 }
    );
  }
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const now = Date.now();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now - (i * 86400000));
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

// POST endpoint for manual actions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { queryHash, action } = body;
    
    if (!queryHash) {
      return NextResponse.json(
        { success: false, error: 'queryHash is required' },
        { status: 400 }
      );
    }

    const redis = await getRedis();
    const statsKey = `query:stats:${queryHash}`;
    const today = new Date().toISOString().slice(0, 10);
    
    if (action === 'clearCache') {
      // Clear all possible cache keys
      const staticKey = `cache:${queryHash}`;
      const dateKey = `cache:${queryHash}:${today}`;
      const metaKeyStatic = `${staticKey}:meta`;
      const metaKeyDate = `${dateKey}:meta`;
      
      const deleted = await Promise.all([
        redis.del(staticKey),
        redis.del(dateKey),
        redis.del(metaKeyStatic),
        redis.del(metaKeyDate),
      ]);
      
      const totalDeleted = deleted.reduce((sum, val) => sum + val, 0);
      
      return NextResponse.json({
        success: true,
        message: totalDeleted > 0 ? `Cleared ${totalDeleted} cache entries` : 'No cache found',
        queryHash,
      });
      
    } else if (action === 'makePersistent') {
      const statsData = await redis.get(statsKey);
      if (!statsData) {
        return NextResponse.json(
          { success: false, error: 'Query stats not found' },
          { status: 404 }
        );
      }
      
      const stats = JSON.parse(statsData);
      stats.isPersistent = true;
      await redis.set(statsKey, JSON.stringify(stats));
      
      // Remove TTL from cache if exists
      const staticKey = `cache:${queryHash}`;
      const cachedData = await redis.get(staticKey);
      if (cachedData) {
        await redis.persist(staticKey);
        await redis.persist(`${staticKey}:meta`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Query marked as persistent',
        queryHash,
      });
      
    } else if (action === 'makeTemporary') {
      const statsData = await redis.get(statsKey);
      if (!statsData) {
        return NextResponse.json(
          { success: false, error: 'Query stats not found' },
          { status: 404 }
        );
      }
      
      const stats = JSON.parse(statsData);
      stats.isPersistent = false;
      await redis.set(statsKey, JSON.stringify(stats));
      
      // Set 24h expiration on cache
      const staticKey = `cache:${queryHash}`;
      const cachedData = await redis.get(staticKey);
      if (cachedData) {
        await redis.expire(staticKey, 86400);
        await redis.expire(`${staticKey}:meta`, 86400);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Query marked as temporary (24h TTL)',
        queryHash,
      });
      
    } else if (action === 'resetStats') {
      const statsData = await redis.get(statsKey);
      if (!statsData) {
        return NextResponse.json(
          { success: false, error: 'Query stats not found' },
          { status: 404 }
        );
      }
      
      const stats = JSON.parse(statsData);
      const resetStats = {
        queryHash: stats.queryHash,
        shortHash: stats.shortHash,
        sql: stats.sql,
        totalHits: 0,
        totalMisses: 0,
        totalExecutions: 0,
        avgDuration: 0,
        avgRowCount: 0,
        lastExecuted: null,
        lastCacheHit: null,
        firstSeen: new Date().toISOString(),
        cacheHitRate: 0,
        preWarmScore: 0,
        dailyHitHistory: {},
        consecutiveDaysNoHits: 0,
        isPersistent: false,
      };
      
      await redis.set(statsKey, JSON.stringify(resetStats));
      await redis.zRem('query:prewarm:candidates', queryHash);
      
      return NextResponse.json({
        success: true,
        message: 'Statistics reset',
        queryHash,
      });
      
    } else if (action === 'delete') {
      // Completely remove query from system
      const staticKey = `cache:${queryHash}`;
      const dateKey = `cache:${queryHash}:${today}`;
      
      await Promise.all([
        redis.del(staticKey),
        redis.del(dateKey),
        redis.del(`${staticKey}:meta`),
        redis.del(`${dateKey}:meta`),
        redis.del(statsKey),
        redis.zRem('query:prewarm:candidates', queryHash),
      ]);
      
      // Clean up old log entries
      const logKeys = await redis.keys(`query:log:${queryHash.substring(0, 8)}:*`);
      if (logKeys.length > 0) {
        await redis.del(...logKeys);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Query completely removed',
        queryHash,
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Failed to process request:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}