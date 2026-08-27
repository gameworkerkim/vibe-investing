/**
 * 바이낸스 공개 시세 API (인증 불필요)
 * 일부 지역(미국 등)은 api.binance.com 이 IP 차단(451)할 수 있어
 * 마켓 데이터 전용 호스트 data-api.binance.vision 으로 폴백한다.
 * GET https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT",...]
 */
const BINANCE_PRIMARY = "https://api.binance.com/api/v3/ticker/price";
const BINANCE_FALLBACK = "https://data-api.binance.vision/api/v3/ticker/price";

interface BinancePrice {
  symbol: string;
  price: string;
}

async function requestPrices(base: string, symbols: string[]): Promise<Record<string, number> | null> {
  const params = encodeURIComponent(JSON.stringify(symbols));
  const res = await fetch(`${base}?symbols=${params}`);
  if (!res.ok) return null;
  const data = (await res.json()) as BinancePrice[];
  const map: Record<string, number> = {};
  for (const p of data) map[p.symbol] = Number(p.price);
  return map;
}

export async function fetchBinancePrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const primary = await requestPrices(BINANCE_PRIMARY, symbols);
  if (primary) return primary;
  const fallback = await requestPrices(BINANCE_FALLBACK, symbols);
  if (fallback) return fallback;
  throw new Error("binance ticker failed on all hosts");
}
