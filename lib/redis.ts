// lib/redis.ts
import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    await redisClient.connect();
  }
  return redisClient;
}
