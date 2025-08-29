import { NextRequest, NextResponse } from "next/server";
import SnowflakeConnectionManager from "@/lib/snowflake";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Cache configuration
const CACHE_DIR = path.join(process.cwd(), ".cache", "snowflake");
const LAST_CLEANUP_FILE = path.join(CACHE_DIR, ".last-cleanup");

interface CacheEntry {
  data: any[];
  timestamp: number;
  hash: string;
}

// -------------------- Helper Functions --------------------

// Ensure cache directory exists
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Generate hash for SQL query
function generateQueryHash(sql: string, userId?: string): string {
  const normalizedSql = sql.trim().toLowerCase().replace(/\s+/g, " ");
  const queryString = userId ? `${userId}:${normalizedSql}` : normalizedSql;
  return crypto.createHash("sha256").update(queryString).digest("hex");
}

// Get cache file path
function getCacheFilePath(hash: string): string {
  return path.join(CACHE_DIR, `${hash}.json`);
}

// Read last cleanup date
async function getLastCleanupDate(): Promise<string | null> {
  try {
    const dateStr = await fs.readFile(LAST_CLEANUP_FILE, "utf-8");
    return dateStr;
  } catch {
    return null;
  }
}

// Set last cleanup date
async function setLastCleanupDate(date: string) {
  await fs.writeFile(LAST_CLEANUP_FILE, date, "utf-8");
}

// -------------------- Daily Cleanup --------------------
async function cleanCacheDaily(): Promise<void> {
  await ensureCacheDir();
  const today = new Date().toISOString().slice(0, 10);
  const lastCleanup = await getLastCleanupDate();
  if (lastCleanup === today) return; // already cleaned today

  const files = await fs.readdir(CACHE_DIR);
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(CACHE_DIR, file);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const entry: CacheEntry = JSON.parse(content);
        const fileDate = new Date(entry.timestamp).toISOString().slice(0, 10);
        if (fileDate < today) {
          await fs.unlink(filePath);
          console.log(`Removed old cache: ${file}`);
        }
      } catch {
        await fs.unlink(filePath).catch(() => {});
      }
    }
  }

  await setLastCleanupDate(today);
  console.log("Daily cache cleanup completed");
}

// -------------------- Cache Read/Write --------------------
async function readFromCache(hash: string): Promise<any[] | null> {
  try {
    const cacheFilePath = getCacheFilePath(hash);
    const cacheData = await fs.readFile(cacheFilePath, "utf-8");
    const cacheEntry: CacheEntry = JSON.parse(cacheData);
    return cacheEntry.data || null;
  } catch {
    return null;
  }
}

async function writeToCache(hash: string, data: any[]): Promise<void> {
  try {
    await ensureCacheDir();
    const cacheEntry: CacheEntry = {
      data,
      timestamp: Date.now(),
      hash,
    };
    const cacheFilePath = getCacheFilePath(hash);
    await fs.writeFile(cacheFilePath, JSON.stringify(cacheEntry, null, 2));
    console.log(`Data cached for query hash: ${hash}`);
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

// -------------------- API Handler --------------------
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1️⃣ Daily cleanup before processing
    await cleanCacheDaily();

    // 2️⃣ Parse request body
    const { sql, userId } = await req.json();
    if (!sql || typeof sql !== "string") {
      return NextResponse.json({ error: "Missing or invalid SQL" }, { status: 400 });
    }

    // 3️⃣ Generate query hash for caching
    const queryHash = generateQueryHash(sql, userId);
    const shortHash = queryHash.substring(0, 8); // Short hash for logging

    // 4️⃣ Check cache first
    const cachedData = await readFromCache(queryHash);
    if (cachedData) {
      const duration = Date.now() - startTime;
      console.log(`🟢 CACHE HIT [${shortHash}] - Records: ${cachedData.length} - Duration: ${duration}ms - User: ${userId || 'anonymous'}`);
      
      return NextResponse.json(cachedData, {
        status: 200,
        headers: {
          "X-Cache-Status": "HIT",
          "X-Cache-Hash": queryHash,
        },
      });
    }

    // 5️⃣ Cache miss - execute query
    console.log(`🔴 CACHE MISS [${shortHash}] - Executing Snowflake query - User: ${userId || 'anonymous'}`);
    console.log(`📝 Query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    
    await SnowflakeConnectionManager.connect();
    const connection = SnowflakeConnectionManager.getConnection();

    const queryStartTime = Date.now();
    const rows = await new Promise<any[]>((resolve, reject) => {
      connection.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          if (err) {
            console.error("Snowflake query error:", err);
            return reject(err);
          }
          resolve(rows || []);
        },
      });
    });
    const queryDuration = Date.now() - queryStartTime;

    if (!rows || rows.length === 0) {
      console.log(`⚠️ EMPTY RESULT [${shortHash}] - Query duration: ${queryDuration}ms`);
      return NextResponse.json({ error: "No records found" }, { status: 404 });
    }

    // 6️⃣ Cache the results
    await writeToCache(queryHash, rows);
    
    const totalDuration = Date.now() - startTime;
    console.log(`✅ QUERY COMPLETE [${shortHash}] - Records: ${rows.length} - Query: ${queryDuration}ms - Total: ${totalDuration}ms`);

    return NextResponse.json(rows, {
      status: 200,
      headers: {
        "X-Cache-Status": "MISS",
        "X-Cache-Hash": queryHash,
        "X-Query-Duration": queryDuration.toString(),
        "X-Total-Duration": totalDuration.toString(),
      },
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ QUERY ERROR - Duration: ${duration}ms - Error:`, err.message || err);
    return NextResponse.json([{ error: "snowflake connection failed" }], { status: 500 });
  }
}