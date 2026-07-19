import type { Env } from "./env";

/** Free-tier watchlist cap (cron / priority symbols). */
export const WATCHLIST_MAX = 50;

export type WatchItem = { symbol: string; provider: string; priority: number };

export async function listWatchlist(env: Env): Promise<WatchItem[]> {
  if (!env.DB) return [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT symbol, provider, priority FROM watchlist ORDER BY priority ASC, symbol ASC LIMIT ?`
    )
      .bind(WATCHLIST_MAX)
      .all<{ symbol: string; provider: string; priority: number }>();
    return results || [];
  } catch {
    return [];
  }
}

export async function watchlistCount(env: Env): Promise<number> {
  if (!env.DB) return 0;
  try {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM watchlist`).first<{ n: number }>();
    return Number(row?.n || 0);
  } catch {
    return 0;
  }
}

/** Add symbol if under cap. No-op if already present or DB missing. */
export async function tryAddWatchlist(
  env: Env,
  symbol: string,
  provider: string
): Promise<{ added: boolean; count: number; max: number }> {
  const count = await watchlistCount(env);
  if (!env.DB) return { added: false, count, max: WATCHLIST_MAX };
  if (count >= WATCHLIST_MAX) return { added: false, count, max: WATCHLIST_MAX };
  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO watchlist (symbol, provider, priority) VALUES (?, ?, 100)`
    )
      .bind(symbol, provider)
      .run();
    const next = await watchlistCount(env);
    return { added: next > count, count: next, max: WATCHLIST_MAX };
  } catch {
    return { added: false, count, max: WATCHLIST_MAX };
  }
}
