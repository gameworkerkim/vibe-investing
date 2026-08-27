import { FxSource } from "../types";
import { fetchBithumbTickers } from "./bithumb";

/**
 * USD/KRW 환율 조회.
 *
 * 1순위: 빗썸 자체 KRW-USDT 시세 — 바이낸스 USDT 가격과 같은 거래소(빗썸)에서 환산하므로
 *        김치 프리미엄 계산이 내부적으로 일관됨(환율 시차 제거).
 * 2순위: 두나무 환율 API (무료·키 불필요) https://quotation-api-cdn.dunamu.com
 */
export interface FxRate {
  rate: number;
  source: FxSource;
}

export async function fetchUsdKrw(): Promise<FxRate> {
  try {
    const map = await fetchBithumbTickers(["KRW-USDT"]);
    const rate = map["KRW-USDT"];
    if (rate && rate > 0) return { rate, source: "bithumb-usdt" };
  } catch {
    // fallthrough
  }

  const res = await fetch(
    "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
  );
  if (!res.ok) throw new Error(`dunamu fx http ${res.status}`);
  const data = (await res.json()) as Array<{ code: string; basePrice: number }>;
  const item = data.find((d) => d.code === "FRX.KRWUSD");
  if (!item || !item.basePrice) throw new Error("dunamu fx no data");
  return { rate: item.basePrice, source: "dunamu" };
}
