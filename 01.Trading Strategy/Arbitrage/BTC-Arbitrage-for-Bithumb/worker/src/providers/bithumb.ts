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
  const url = `${BITHUMB_BASE}/ticker?markets=${markets.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`bithumb ticker http ${res.status}`);
  const data = (await res.json()) as BithumbTicker[];
  const map: Record<string, number> = {};
  for (const t of data) map[t.market] = Number(t.trade_price);
  return map;
}
