import YahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet } from "../db/redis";

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  assetType: string;
  exchange: string;
  currency: string;
}

let _yf: any = null;
function yf() {
  if (!_yf) _yf = new YahooFinance();
  return _yf;
}

export async function getYahooCandles(
  symbol: string,
  days = 365,
  interval: "1d" | "1wk" = "1d"
): Promise<Candle[]> {
  const cacheKey = `yahoo:candles:${symbol}:${interval}:${days}`;
  const cached = await cacheGet<Candle[]>(cacheKey);
  if (cached) return cached;

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const result = await yf().historical(symbol, {
    period1: start.toISOString().slice(0, 10),
    period2: end.toISOString().slice(0, 10),
    interval: interval as "1d" | "1wk",
  });

  const candles: Candle[] = result.map((row: any) => ({
    timestamp: row.date instanceof Date ? row.date.toISOString() : String(row.date),
    open: Number(row.open) || 0,
    high: Number(row.high) || 0,
    low: Number(row.low) || 0,
    close: Number(row.close) || 0,
    volume: Number(row.volume) || 0,
  }));

  await cacheSet(cacheKey, candles);
  return candles;
}

export async function getYahooAssetInfo(symbol: string): Promise<AssetInfo> {
  const cacheKey = `yahoo:asset:${symbol}`;
  const cached = await cacheGet<AssetInfo>(cacheKey);
  if (cached) return cached;

  const result = await yf().quoteSummary(symbol, {
    modules: ["price", "summaryProfile"],
  });

  const price: any = (result as any).price ?? {};
  const info: AssetInfo = {
    symbol,
    name: price.shortName || price.longName || symbol,
    assetType: price.quoteType || "EQUITY",
    exchange: price.exchangeName || "Unknown",
    currency: price.currency || "USD",
  };

  await cacheSet(cacheKey, info);
  return info;
}
