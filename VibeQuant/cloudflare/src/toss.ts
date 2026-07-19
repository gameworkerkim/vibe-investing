import type { Candle } from "./types";

const DEFAULT_BASE = "https://openapi.tossinvest.com";
/** Free-tier Worker CPU: at most 2 pages × 200 bars */
const MAX_PAGES = 2;
const PAGE_SIZE = 200;

type TokenCache = { token: string; expiry: number };
let tokenCache: TokenCache | null = null;

export type TossEnv = {
  TOSS_CLIENT_ID?: string;
  TOSS_CLIENT_SECRET?: string;
  TOSS_BASE_URL?: string;
};

function baseUrl(env: TossEnv): string {
  return (env.TOSS_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

export function tossConfigured(env: TossEnv): boolean {
  return !!(env.TOSS_CLIENT_ID && env.TOSS_CLIENT_SECRET);
}

async function getAccessToken(env: TossEnv): Promise<string> {
  if (!env.TOSS_CLIENT_ID || !env.TOSS_CLIENT_SECRET) {
    throw new Error("TOSS_NOT_CONFIGURED");
  }
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiry) return tokenCache.token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.TOSS_CLIENT_ID,
    client_secret: env.TOSS_CLIENT_SECRET,
  });

  const res = await fetch(`${baseUrl(env)}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`TOSS_AUTH_${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  const ttl = Math.max(60, Number(data.expires_in || 3600) - 30);
  tokenCache = { token: data.access_token, expiry: now + ttl * 1000 };
  return tokenCache.token;
}

function normalizeRow(r: Record<string, unknown>): Candle | null {
  const time = String(r.time ?? r.timestamp ?? r.date ?? "");
  const open = Number(r.open_price ?? r.open);
  const high = Number(r.high_price ?? r.high);
  const low = Number(r.low_price ?? r.low);
  const close = Number(r.close_price ?? r.close);
  const volume = Number(r.volume ?? 0);
  if (!time || ![open, high, low, close].every((n) => Number.isFinite(n))) return null;
  const iso = Number.isFinite(Date.parse(time))
    ? new Date(time).toISOString().slice(0, 10)
    : time.slice(0, 10);
  return {
    time: iso,
    open: Math.round(open * 10000) / 10000,
    high: Math.round(high * 10000) / 10000,
    low: Math.round(low * 10000) / 10000,
    close: Math.round(close * 10000) / 10000,
    volume: Math.round(volume) || 0,
  };
}

function extractRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const rows = o.candles ?? o.data ?? o.items;
    if (Array.isArray(rows)) return rows as Record<string, unknown>[];
  }
  return [];
}

/** Fetch up to `days` daily candles. Max 2 pages (free CPU). */
export async function fetchTossCandles(
  env: TossEnv,
  symbol: string,
  days: number
): Promise<Candle[]> {
  const token = await getAccessToken(env);
  const collected: Candle[] = [];
  let before: string | undefined;
  const target = Math.min(Math.max(1, days), MAX_PAGES * PAGE_SIZE);

  for (let page = 0; page < MAX_PAGES && collected.length < target; page++) {
    const params = new URLSearchParams({
      symbol,
      interval: "1d",
      count: String(Math.min(PAGE_SIZE, target - collected.length)),
    });
    if (before) params.set("before", before);

    const res = await fetch(`${baseUrl(env)}/api/v1/candles?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`TOSS_CANDLES_${res.status}`);
    }

    const rows = extractRows(await res.json());
    if (!rows.length) break;

    for (const r of rows) {
      const c = normalizeRow(r);
      if (c) collected.push(c);
    }
    before = String(rows[rows.length - 1]?.time ?? rows[rows.length - 1]?.timestamp ?? "");
    if (!before || rows.length < PAGE_SIZE) break;
  }

  const seen = new Set<string>();
  const uniq: Candle[] = [];
  for (const c of collected) {
    if (seen.has(c.time)) continue;
    seen.add(c.time);
    uniq.push(c);
  }
  uniq.sort((a, b) => a.time.localeCompare(b.time));
  return uniq.slice(-days);
}
