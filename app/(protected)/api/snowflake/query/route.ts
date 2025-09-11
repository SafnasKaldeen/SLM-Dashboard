import { runQuery } from "../../../gps/batch-analysis/Services/SnowflakeClientWith2FA";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const CACHE_DIR = path.join(process.cwd(), ".cache");

// Ensure cache folder exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {}
}

// Get cache file path for a query (using hash for shorter filenames)
function getCacheFilePath(query: string) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(query).digest('hex').substring(0, 32);
  return path.join(CACHE_DIR, hash + ".json");
}

// Get today's date string in YYYY-MM-DD format
function getTodayDateString() {
  return new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
}

// Check if cache file is from today
async function isCacheFromToday(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    const fileDate = stat.mtime.toLocaleDateString('en-CA');
    const today = getTodayDateString();
    return fileDate === today;
  } catch {
    return false;
  }
}

// Clean up all cache files that are not from today (runs on first request after midnight)
async function cleanupOldCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const today = getTodayDateString();
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(CACHE_DIR, file);
      try {
        const stat = await fs.stat(filePath);
        const fileDate = stat.mtime.toLocaleDateString('en-CA');
        
        if (fileDate !== today) {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted old cache file: ${file}`);
        }
      } catch (error) {
        // If we can't read the file, try to delete it anyway
        try {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted unreadable cache file: ${file}`);
        } catch {}
      }
    }
  } catch (error) {
    console.warn("⚠️ Cache cleanup failed:", error.message);
  }
}

// Check if we need to run cleanup (first request of the day)
let lastCleanupDate = '';
async function shouldRunCleanup() {
  const today = getTodayDateString();
  if (lastCleanupDate !== today) {
    lastCleanupDate = today;
    return true;
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    await ensureCacheDir();

    // Run cleanup on first request of the day
    if (await shouldRunCleanup()) {
      console.log(`🧹 Running daily cache cleanup for ${getTodayDateString()}`);
      await cleanupOldCache();
    }

    const filePath = getCacheFilePath(query);

    // Check if we have valid cache from today
    if (await isCacheFromToday(filePath)) {
      try {
        const cached = await fs.readFile(filePath, "utf-8");
        console.log("📋 Returning cached result");
        return NextResponse.json(JSON.parse(cached));
      } catch (error) {
        console.warn("⚠️ Failed to read cache file:", error.message);
        // Continue to run fresh query if cache read fails
      }
    }

    // Run fresh query
    console.log("🔍 Running fresh query");
    const results = await runQuery(query);

    // Save to cache
    try {
      await fs.writeFile(filePath, JSON.stringify(results), "utf-8");
      console.log("💾 Results cached successfully");
    } catch (error) {
      console.warn("⚠️ Failed to save to cache:", error.message);
      // Continue anyway, caching is not critical
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}