/**
 * Thin asset / last-price helpers for the committee data router.
 * Metadata from D1 when present; otherwise symbol heuristics (no Yahoo quote scrape).
 */

import type { Env } from "./env";
import { getCandlesPayload } from "./candles";

export type AssetInfo = {
  symbol: string;
  provider: string;
  name: string;
  exchange: string;
  currency: string;
  assetType: string;
  source: string;
  updated_at?: string | null;
};

function heuristics(symbol: string, provider: string): AssetInfo {
  const sym = symbol.trim().toUpperCase();
  const isKr =
    sym.endsWith(".KS") ||
    sym.endsWith(".KQ") ||
    (/^\d{5,6}$/.test(sym));
  return {
    symbol: sym,
    provider,
    name: sym,
    exchange: isKr ? "KRX" : "Unknown",
    currency: isKr ? "KRW" : "USD",
    assetType: "EQUITY",
    source: "heuristics",
    updated_at: null,
  };
}

export async function getAssetInfo(
  env: Env,
  provider: string,
  symbolRaw: string
): Promise<AssetInfo> {
  const symbol = decodeURIComponent(symbolRaw || "").trim().toUpperCase();
  const base = heuristics(symbol, provider);

  if (!env.DB) return base;

  try {
    const row = await env.DB.prepare(
      `SELECT symbol, name, currency, updated_at FROM assets
       WHERE provider = ? AND UPPER(symbol) = ? LIMIT 1`
    )
      .bind(provider, symbol)
      .first<{ symbol: string; name: string | null; currency: string | null; updated_at: string }>();

    if (row) {
      return {
        ...base,
        name: row.name || base.name,
        currency: row.currency || base.currency,
        updated_at: row.updated_at,
        source: "d1",
      };
    }
  } catch {
    /* fall through to heuristics */
  }
  return base;
}

export type PriceQuote = {
  symbol: string;
  price: number;
  change: number;
  changeRate: number;
  date?: string;
  volume?: number;
  source: string;
};

export async function getPriceQuotes(
  env: Env,
  provider: string,
  symbols: string[]
): Promise<Record<string, PriceQuote>> {
  const out: Record<string, PriceQuote> = {};
  const uniq = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 20);

  await Promise.all(
    uniq.map(async (symbol) => {
      try {
        const payload = await getCandlesPayload(env, provider, symbol, 5);
        const rows = (payload as { candles?: Array<Record<string, unknown>>; source?: string }).candles || [];
        const src = (payload as { source?: string }).source || "candles";
        if (rows.length >= 2) {
          const last = rows[rows.length - 1];
          const prev = rows[rows.length - 2];
          const close = Number(last.close);
          const prevClose = Number(prev.close);
          out[symbol] = {
            symbol,
            price: close,
            change: Math.round((close - prevClose) * 10000) / 10000,
            changeRate: Math.round((close / Math.max(prevClose, 1e-12) - 1) * 100 * 10000) / 10000,
            date: String(last.time ?? ""),
            volume: last.volume != null ? Number(last.volume) : undefined,
            source: src,
          };
        } else if (rows.length === 1) {
          const last = rows[0];
          out[symbol] = {
            symbol,
            price: Number(last.close),
            change: 0,
            changeRate: 0,
            date: String(last.time ?? ""),
            volume: last.volume != null ? Number(last.volume) : undefined,
            source: src,
          };
        }
      } catch {
        /* skip failed symbol */
      }
    })
  );

  return out;
}
