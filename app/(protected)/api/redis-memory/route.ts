// app/api/redis-memory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

interface MemoryInfo {
  used_memory: number;
  used_memory_mb: number;
  used_memory_human: string;
  max_memory: number;
  max_memory_mb: number;
  max_memory_human: string;
  memory_usage_percent: number;
  peak_memory: number;
  peak_memory_mb: number;
  evicted_keys: number;
  total_keys: number;
  memory_status: 'healthy' | 'warning' | 'critical';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function parseMemoryValue(value: string): number {
  const match = value.match(/^(\d+(?:\.\d+)?)(M|G|K|B)$/);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'G': return num * 1024 * 1024 * 1024;
    case 'M': return num * 1024 * 1024;
    case 'K': return num * 1024;
    case 'B': return num;
    default: return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    const redis = await getRedis();

    // Get Redis INFO command output
    const info = await redis.info('memory');

    console.log('Redis INFO memory output:', info);
    
    // Parse the info string
    const lines = info.split('\r\n');
    const memoryData: { [key: string]: string } = {};
    
    lines.forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        memoryData[key] = value;
      }
    });

    // Get key count
    const dbSize = await redis.dbSize();

    // Get evicted keys count
    const evictedKeys = parseInt(memoryData.evicted_keys || '0');

    // Parse memory values
    const usedMemory = parseInt(memoryData.used_memory || '0');
    const maxMemory = parseInt(memoryData.maxmemory || '31457280'); // Default 30MB if not set
    const peakMemory = parseInt(memoryData.peak_memory || usedMemory.toString());

    // Convert to MB
    const usedMemoryMB = usedMemory / (1024 * 1024);
    const maxMemoryMB = maxMemory / (1024 * 1024);
    const peakMemoryMB = peakMemory / (1024 * 1024);

    // Calculate usage percentage
    const memoryUsagePercent = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;

    // Determine status
    let memoryStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (memoryUsagePercent > 90) {
      memoryStatus = 'critical';
    } else if (memoryUsagePercent > 70) {
      memoryStatus = 'warning';
    }

    const response: MemoryInfo = {
      used_memory: usedMemory,
      used_memory_mb: usedMemoryMB,
      used_memory_human: formatBytes(usedMemory),
      max_memory: maxMemory,
      max_memory_mb: maxMemoryMB,
      max_memory_human: formatBytes(maxMemory),
      memory_usage_percent: memoryUsagePercent,
      peak_memory: peakMemory,
      peak_memory_mb: peakMemoryMB,
      evicted_keys: evictedKeys,
      total_keys: dbSize,
      memory_status: memoryStatus,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to fetch Redis memory info:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch memory information',
        used_memory_mb: 0,
        max_memory_mb: 0,
        used_memory_human: '0 MB',
        max_memory_human: '0 MB',
        memory_usage_percent: 0,
        peak_memory_mb: 0,
        evicted_keys: 0,
        total_keys: 0,
        memory_status: 'healthy',
      },
      { status: 500 }
    );
  }
}