import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function getCache(key) {
  return await redis.get(key);
}

export async function setCache(key, value, ttlSeconds = 3600) {
  await redis.set(key, value, { ex: ttlSeconds });
}