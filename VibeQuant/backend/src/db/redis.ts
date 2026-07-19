import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN must be set");
  }
  _redis = new Redis({ url, token });
  return _redis;
}

let _globalLimiter: Ratelimit | null = null;

export function getGlobalLimiter(): Ratelimit {
  if (_globalLimiter) return _globalLimiter;
  _globalLimiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.RATE_LIMIT_GLOBAL) || 100,
      "1 s"
    ),
    prefix: "vi:global",
    analytics: true,
  });
  return _globalLimiter;
}

let _routeLimiters = new Map<string, Ratelimit>();

export function getRouteLimiter(route: string): Ratelimit {
  if (_routeLimiters.has(route)) return _routeLimiters.get(route)!;
  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.RATE_LIMIT_PER_ROUTE) || 10,
      "1 s"
    ),
    prefix: `vi:route:${route}`,
    analytics: true,
  });
  _routeLimiters.set(route, limiter);
  return limiter;
}

// ── Response Cache ───────────────────────────────────────

const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS) || 300;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get<T>(`vi:cache:${key}`);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttl = CACHE_TTL): Promise<void> {
  try {
    await getRedis().set(`vi:cache:${key}`, value, { ex: ttl });
  } catch {
    // cache write failure is non-fatal
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(`vi:cache:${pattern}`);
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  } catch {
    // non-fatal
  }
}
