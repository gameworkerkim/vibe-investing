import { fetchJson } from "./http";

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

/**
 * HTTP 에러뿐 아니라 네트워크 예외(DNS 실패·타임아웃·TLS)도 삼켜서 null 을 돌려준다.
 * 그래야 호출부가 폴백 호스트로 넘어갈 수 있다.
 */
async function requestPrices(base: string, symbols: string[]): Promise<Record<string, number> | null> {
  const params = encodeURIComponent(JSON.stringify(symbols));
  try {
    const data = await fetchJson<BinancePrice[]>(`${base}?symbols=${params}`, "binance ticker");
    if (!Array.isArray(data)) return null;
    const map: Record<string, number> = {};
    for (const p of data) {
      const price = Number(p.price);
      if (Number.isFinite(price) && price > 0) map[p.symbol] = price;
    }
    return map;
  } catch (error) {
    console.warn("[binance] host failed", base, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function fetchBinancePrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const primary = await requestPrices(BINANCE_PRIMARY, symbols);
  if (primary) return primary;
  const fallback = await requestPrices(BINANCE_FALLBACK, symbols);
  if (fallback) return fallback;
  throw new Error("binance ticker failed on all hosts");
}
