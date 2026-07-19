import type { Env } from "./env";
import type { Candle } from "./types";
import { fetchTossCandles, tossConfigured } from "./toss";
import { tryAddWatchlist } from "./watchlist";

export type { Candle };

function yahooTicker(symbol: string): string {
  const s = symbol.trim();
  if (s.includes(".")) return s;
  // KRX 6-digit codes
  if (/^\d{6}$/.test(s)) return `${s}.KS`;
  return s;
}

function mockCandles(symbol: string, days: number): Candle[] {
  const out: Candle[] = [];
  let price = 100 + ([...symbol].reduce((a, c) => a + c.charCodeAt(0), 0) % 50);
  const start = Date.now() - days * 86_400_000;
  for (let i = 0; i < days; i++) {
    const shock = Math.sin(i / 7) * 1.4 + ((i * 17) % 10 - 5) * 0.08;
    const open = price;
    const close = Math.max(1, price + shock);
    const high = Math.max(open, close) + 0.4;
    const low = Math.min(open, close) - 0.4;
    const d = new Date(start + i * 86_400_000);
    out.push({
      time: d.toISOString().slice(0, 10),
      open: round4(open),
      high: round4(high),
      low: round4(low),
      close: round4(close),
      volume: 1000 + i * 3,
    });
    price = close;
  }
  return out;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function rangeForDays(days: number): string {
  if (days <= 5) return "5d";
  if (days <= 30) return "1mo";
  if (days <= 90) return "3mo";
  if (days <= 180) return "6mo";
  if (days <= 365) return "1y";
  if (days <= 730) return "2y";
  return "5y";
}

/** Enough bars to compute common windows (e.g. momentum 22) for the requested span. */
function minBarsForDays(days: number): number {
  const d = Math.max(1, Math.floor(days));
  // ~trading-day density; never require more than requested days
  return Math.min(d, Math.max(25, Math.floor(d * 0.5)));
}

function hasEnoughBars(candles: Candle[] | null | undefined, days: number): boolean {
  return !!candles && candles.length >= minBarsForDays(days);
}

/** Persist a longer series in R2 so a one-off days=3 request cannot poison the cache. */
function r2FetchDays(days: number): number {
  return Math.max(days, 365);
}

async function fetchYahoo(symbol: string, days: number): Promise<Candle[] | null> {
  const ticker = encodeURIComponent(yahooTicker(symbol));
  const range = rangeForDays(days);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "VibeQuant/0.1 (+https://github.com/gameworkerkim/vibe-investing)",
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const raw = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: { quote?: Array<{ open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }> };
      }>;
    };
  };
  const result = raw.chart?.result?.[0];
  const ts = result?.timestamp;
  const q = result?.indicators?.quote?.[0];
  if (!ts?.length || !q?.close?.length) return null;

  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = q.close[i];
    const o = q.open?.[i] ?? c;
    const h = q.high?.[i] ?? c;
    const l = q.low?.[i] ?? c;
    const v = q.volume?.[i] ?? 0;
    if (c == null || o == null || h == null || l == null) continue;
    candles.push({
      time: new Date(ts[i] * 1000).toISOString().slice(0, 10),
      open: round4(o),
      high: round4(h),
      low: round4(l),
      close: round4(c),
      volume: Math.round(v || 0),
    });
  }
  if (!candles.length) return null;
  return candles.slice(-days);
}

async function readR2(env: Env, key: string): Promise<Candle[] | null> {
  if (!env.DATA) return null;
  try {
    const obj = await env.DATA.get(key);
    if (!obj) return null;
    const data = (await obj.json()) as { candles?: Candle[] };
    return Array.isArray(data.candles) && data.candles.length ? data.candles : null;
  } catch {
    return null;
  }
}

async function writeR2(env: Env, key: string, candles: Candle[], meta: Record<string, unknown>): Promise<void> {
  if (!env.DATA) return;
  try {
    await env.DATA.put(key, JSON.stringify({ ...meta, candles }), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch {
    /* free-tier / binding issues — ignore */
  }
}

async function touchD1(
  env: Env,
  provider: string,
  symbol: string,
  r2Key: string,
  rows: number
): Promise<void> {
  if (!env.DB) return;
  const assetId = `${provider}:${symbol}`;
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO assets (id, provider, symbol, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`
    )
      .bind(assetId, provider, symbol, now)
      .run();
    await env.DB.prepare(
      `INSERT INTO candle_objects (asset_id, interval, r2_key, rows, refreshed_at)
       VALUES (?, '1d', ?, ?, ?)
       ON CONFLICT(asset_id, interval) DO UPDATE SET
         r2_key = excluded.r2_key,
         rows = excluded.rows,
         refreshed_at = excluded.refreshed_at`
    )
      .bind(assetId, r2Key, rows, now)
      .run();
  } catch {
    /* schema may be missing — ignore */
  }
}

export async function getCandlesPayload(
  env: Env,
  provider: string,
  symbol: string,
  days: number
): Promise<{
  provider: string;
  symbol: string;
  days: number;
  source: string;
  candles: Candle[];
  detail?: string;
}> {
  const r2Key = `candles/${provider}/${symbol}/1d.json`;

  if (provider === "mock") {
    const candles = mockCandles(symbol, days);
    return { provider, symbol, days, source: "mock", candles };
  }

  // Cache API → R2 → provider fetch → mock
  const cacheKey = new Request(
    `https://vibequant.internal/candles/${provider}/${symbol}?days=${days}`
  );
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) {
    try {
      const body = (await hit.json()) as { candles: Candle[]; source?: string };
      // Never serve cached mock fallbacks — retry live providers
      // Also skip short poisoned caches (e.g. 3 bars left from a days=3 write)
      const cached = body.candles?.slice(-days);
      if (
        hasEnoughBars(cached, days) &&
        body.source &&
        !String(body.source).startsWith("mock")
      ) {
        return {
          provider,
          symbol,
          days,
          source: body.source || "cache",
          candles: cached!,
        };
      }
    } catch {
      /* continue */
    }
  }

  const fromR2 = await readR2(env, r2Key);
  if (hasEnoughBars(fromR2, days)) {
    const sliced = fromR2!.slice(-days);
    const payload = { provider, symbol, days, source: "r2", candles: sliced };
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      })
    );
    return payload;
  }

  if (provider === "toss") {
    if (!tossConfigured(env)) {
      const candles = mockCandles(symbol, days);
      return { provider: "mock", symbol, days, source: "mock_toss_unconfigured", candles };
    }
    try {
      const toss = await fetchTossCandles(env, symbol, days);
      if (toss?.length) {
        await writeR2(env, r2Key, toss, { provider, symbol, interval: "1d" });
        await touchD1(env, provider, symbol, r2Key, toss.length);
        await tryAddWatchlist(env, symbol, "toss");
        const payload = { provider, symbol, days, source: "toss", candles: toss };
        await cache.put(
          cacheKey,
          new Response(JSON.stringify(payload), {
            headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
          })
        );
        return payload;
      }
      const candles = mockCandles(symbol, days);
      return {
        provider: "mock",
        symbol,
        days,
        source: "mock_toss_empty",
        candles,
        detail: "TOSS returned no bars",
      };
    } catch (err) {
      const candles = mockCandles(symbol, days);
      return {
        provider: "mock",
        symbol,
        days,
        source: "mock_toss_fallback",
        candles,
        detail: err instanceof Error ? err.message : "toss_error",
      };
    }
  }

  // yahoo — fetch a longer series for R2 so short requests cannot poison storage
  try {
    const storeDays = r2FetchDays(days);
    const yahooFull = await fetchYahoo(symbol, storeDays);
    if (yahooFull?.length) {
      await writeR2(env, r2Key, yahooFull, { provider, symbol, interval: "1d" });
      await touchD1(env, provider, symbol, r2Key, yahooFull.length);
      await tryAddWatchlist(env, symbol, "yahoo");
      const yahoo = yahooFull.slice(-days);
      const payload = { provider, symbol, days, source: "yahoo", candles: yahoo };
      await cache.put(
        cacheKey,
        new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
        })
      );
      return payload;
    }
  } catch {
    /* fall through */
  }

  const candles = mockCandles(symbol, days);
  return { provider: "mock", symbol, days, source: "mock_yahoo_fallback", candles };
}
