import { fetchJson } from "./http";

/**
 * 빗썸 공개 시세 API (인증 불필요)
 * 참고: https://apidocs.bithumb.com/reference/현재가-조회
 * GET https://api.bithumb.com/v1/ticker?markets=KRW-BTC,KRW-ETH,...
 */
const BITHUMB_BASE = "https://api.bithumb.com/v1";

interface BithumbTicker {
  market: string;
  trade_price: number;
}

export async function fetchBithumbTickers(markets: string[]): Promise<Record<string, number>> {
  if (markets.length === 0) return {};
  const url = `${BITHUMB_BASE}/ticker?markets=${encodeURIComponent(markets.join(","))}`;
  const data = await fetchJson<BithumbTicker[]>(url, "bithumb ticker");
  if (!Array.isArray(data)) throw new Error("bithumb ticker unexpected payload");
  const map: Record<string, number> = {};
  for (const t of data) {
    const price = Number(t.trade_price);
    // 0·NaN 은 "값 없음"으로 취급한다. 그대로 두면 프리미엄이 ±100% 로 튄다.
    if (Number.isFinite(price) && price > 0) map[t.market] = price;
  }
  return map;
}
