import crypto from "crypto";

/**
 * SQL date/time functions that produce dynamic values
 * NOTE: We intentionally do NOT detect date literals like '2025-10-03'
 * because they could be static historical queries, not dynamic application-generated dates
 */

const DYNAMIC_DATE_FUNCTIONS = [
  // Standard SQL
  'current_date',
  'current_timestamp',
  'current_time',
  'localtime',
  'localtimestamp',
  
  // MySQL
  'now(',
  'curdate(',
  'curtime(',
  'sysdate(',
  'utc_date',
  'utc_time',
  'utc_timestamp',
  
  // SQL Server / Snowflake
  'getdate(',
  'getutcdate(',
  'sysdatetime(',
  'sysutcdatetime(',
  'sysdatetimeoffset(',
  
  // PostgreSQL
  'now(',
  'timeofday(',
  'transaction_timestamp(',
  'statement_timestamp(',
  'clock_timestamp(',
  
  // Oracle
  'sysdate',
  'systimestamp',
  
  // Snowflake specific
  'current_timestamp(',
  'current_date(',
];

/**
 * Detects if SQL contains dynamic date/time FUNCTIONS only
 * Does NOT treat date literals as dynamic
 */
function hasDynamicDates(sql: string): boolean {
  const lower = sql.toLowerCase();
  
  // Check for any dynamic date function
  return DYNAMIC_DATE_FUNCTIONS.some(func => lower.includes(func));
}

/**
 * Normalizes SQL for stats tracking by replacing dynamic function calls
 * but preserving date literals (they might be static historical queries)
 */
function normalizeSQL(sql: string): string {
  let normalized = sql.trim().toLowerCase().replace(/\s+/g, " ");
  
  // Normalize spacing in function calls
  normalized = normalized.replace(/current_date\s*\(\s*\)/gi, 'current_date()');
  normalized = normalized.replace(/current_timestamp\s*\(\s*\)/gi, 'current_timestamp()');
  normalized = normalized.replace(/current_time\s*\(\s*\)/gi, 'current_time()');
  normalized = normalized.replace(/now\s*\(\s*\)/gi, 'now()');
  normalized = normalized.replace(/curdate\s*\(\s*\)/gi, 'curdate()');
  normalized = normalized.replace(/getdate\s*\(\s*\)/gi, 'getdate()');
  normalized = normalized.replace(/sysdate\s*\(\s*\)/gi, 'sysdate()');
  
  // Normalize INTERVAL expressions (but keep the number for pattern matching)
  // INTERVAL 7 DAY, INTERVAL '7' DAY, etc.
  normalized = normalized.replace(/interval\s+['"]?\d+['"]?/gi, 'interval __N__');
  
  // We intentionally DO NOT replace date literals like '2025-10-03'
  // because they might be static queries for specific historical periods
  
  return normalized;
}

/**
 * Generates cache hash - includes date suffix ONLY for queries with dynamic functions
 */
function generateCacheHash(sql: string, userId?: string, options?: { forceDynamic?: boolean }): string {
  const normalizedSql = sql.trim().toLowerCase().replace(/\s+/g, " ");
  
  let cacheKey = normalizedSql;
  
  // Only append date if query has dynamic functions OR explicitly forced
  if (hasDynamicDates(sql) || options?.forceDynamic) {
    const today = new Date().toISOString().slice(0, 10);
    cacheKey = `${normalizedSql}:date:${today}`;
  }
  
  const queryString = userId ? `${userId}:${cacheKey}` : cacheKey;
  return crypto.createHash("sha256").update(queryString).digest("hex");
}

/**
 * Generates stats hash - normalized for pattern tracking
 */
function generateStatsHash(sql: string, userId?: string): string {
  const normalizedSql = normalizeSQL(sql);
  const queryString = userId ? `${userId}:${normalizedSql}` : normalizedSql;
  return crypto.createHash("sha256").update(queryString).digest("hex");
}

/**
 * Determines cache strategy based on query type
 */
function getCacheStrategy(sql: string, options?: { forceDynamic?: boolean }): {
  type: 'static' | 'daily' | 'hourly';
  ttl: number | null;
  description: string;
} {
  const lower = sql.toLowerCase();
  
  // Force dynamic if specified
  if (options?.forceDynamic) {
    return {
      type: 'daily',
      ttl: 86400,
      description: 'Explicitly marked as dynamic, cached for 24 hours',
    };
  }
  
  // Queries with time-of-day sensitivity
  const hasTimeFunc = [
    'current_timestamp',
    'current_time',
    'now(',
    'getdate(',
    'sysdatetime(',
  ].some(func => lower.includes(func));
  
  if (hasTimeFunc) {
    return {
      type: 'hourly',
      ttl: 3600, // 1 hour
      description: 'Time-sensitive query, cached for 1 hour',
    };
  }
  
  // Queries with date sensitivity (CURRENT_DATE, CURDATE, etc.)
  if (hasDynamicDates(sql)) {
    return {
      type: 'daily',
      ttl: 86400, // 24 hours
      description: 'Date-sensitive query, cached for 24 hours',
    };
  }
  
  // Static queries (including those with date literals)
  return {
    type: 'static',
    ttl: null, // Can be persistent
    description: 'Static query, eligible for persistent caching',
  };
}

/**
 * Test examples to verify the function-only detection
 */
export function testNormalization() {
  const testCases = [
    {
      name: "CURRENT_DATE function",
      sql: "SELECT * FROM sales WHERE date = CURRENT_DATE()",
      shouldBeDynamic: true,
    },
    {
      name: "Date literal (static historical query)",
      sql: "SELECT * FROM sales WHERE date = '2025-10-03'",
      shouldBeDynamic: false, // Static - specific date
    },
    {
      name: "DATEADD with CURRENT_DATE",
      sql: "SELECT * FROM sales WHERE date >= DATEADD(day, -7, CURRENT_DATE())",
      shouldBeDynamic: true,
    },
    {
      name: "NOW function",
      sql: "SELECT * FROM logs WHERE timestamp > NOW() - INTERVAL 1 HOUR",
      shouldBeDynamic: true,
    },
    {
      name: "BETWEEN date range (static)",
      sql: "SELECT * FROM sales WHERE date BETWEEN '2025-10-01' AND '2025-10-03'",
      shouldBeDynamic: false, // Static - specific historical period
    },
    {
      name: "Static query",
      sql: "SELECT * FROM users WHERE status = 'active'",
      shouldBeDynamic: false,
    },
    {
      name: "Timestamp literal (static)",
      sql: "SELECT * FROM events WHERE created_at > '2025-10-03 14:30:00'",
      shouldBeDynamic: false, // Static - specific timestamp
    },
    {
      name: "GETDATE (SQL Server)",
      sql: "SELECT * FROM orders WHERE order_date = CAST(GETDATE() AS DATE)",
      shouldBeDynamic: true,
    },
    {
      name: "Month comparison (static)",
      sql: "SELECT * FROM sales WHERE MONTH(date) = 10 AND YEAR(date) = 2025",
      shouldBeDynamic: false,
    },
  ];
  
  console.log("Testing Query Normalization (Functions Only):\n");
  
  testCases.forEach(({ name, sql, shouldBeDynamic }) => {
    const isDynamic = hasDynamicDates(sql);
    const cacheHash = generateCacheHash(sql);
    const statsHash = generateStatsHash(sql);
    const normalized = normalizeSQL(sql);
    const strategy = getCacheStrategy(sql);
    
    const passed = isDynamic === shouldBeDynamic;
    
    console.log(`\n${name}:`);
    console.log(`  SQL: ${sql.substring(0, 80)}${sql.length > 80 ? '...' : ''}`);
    console.log(`  Dynamic: ${isDynamic} (expected: ${shouldBeDynamic}) ${passed ? '✓' : '✗ FAILED'}`);
    console.log(`  Normalized: ${normalized.substring(0, 60)}...`);
    console.log(`  Cache Hash: ${cacheHash.substring(0, 16)}...`);
    console.log(`  Stats Hash: ${statsHash.substring(0, 16)}...`);
    console.log(`  Strategy: ${strategy.type} - ${strategy.description}`);
    console.log(`  TTL: ${strategy.ttl ? `${strategy.ttl}s` : 'None (persistent eligible)'}`);
    
    if (!passed) {
      console.log(`  ⚠️  TEST FAILED - Detection mismatch!`);
    }
  });
  
  console.log('\n\nSummary:');
  console.log('✓ Date literals are treated as STATIC (can become persistent)');
  console.log('✓ Date functions are treated as DYNAMIC (daily refresh)');
  console.log('✓ Use forceDynamic flag if your app generates date literals dynamically');
}

// Export all functions
export {
  hasDynamicDates,
  normalizeSQL,
  generateCacheHash,
  generateStatsHash,
  getCacheStrategy,
  DYNAMIC_DATE_FUNCTIONS,
};