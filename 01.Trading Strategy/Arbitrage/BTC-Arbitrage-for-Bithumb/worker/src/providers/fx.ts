import { FxSource } from "../types";
import { fetchBithumbTickers } from "./bithumb";
import { fetchJson } from "./http";

/**
 * USD/KRW 환산율 조회.
 *
 * 두 기준은 측정하는 값이 다르다 — 어느 쪽이 "맞다"기보다 목적이 다르다.
 *
 * - `usdt` (기본): 빗썸 자체 `KRW-USDT` 시세를 환산율로 쓴다.
 *   바이낸스 USDT 가격을 같은 거래소의 USDT 시세로 되돌리므로, 결과는
 *   **USDT 를 실제로 옮겼을 때 남는 코인 고유 스프레드**다. 스테이블코인 프리미엄이
 *   양쪽에서 상쇄되어 값이 0 근처에 몰리고, ±1.5% 는 거의 발동하지 않는다.
 * - `fx`: 두나무 실환율(FRX.KRWUSD)을 쓴다. 흔히 말하는 **헤드라인 김치 프리미엄**으로,
 *   USDT 프리미엄이 그대로 포함된다. 값이 크게 움직이므로 임계값을 높게 잡아야 한다.
 *
 * 1순위 조회가 실패하면 나머지 한쪽으로 폴백한다(지역 차단·일시 장애 대비).
 */
export type FxMode = "usdt" | "fx";

export interface FxRate {
  rate: number;
  source: FxSource;
}

async function fromBithumbUsdt(): Promise<FxRate | null> {
  try {
    const map = await fetchBithumbTickers(["KRW-USDT"]);
    const rate = map["KRW-USDT"];
    if (rate && rate > 0) return { rate, source: "bithumb-usdt" };
    console.warn("[fx] bithumb KRW-USDT 응답에 값이 없음");
  } catch (error) {
    // 조용히 폴백하면 기준이 바뀐 걸 아무도 모른다. 반드시 남긴다.
    console.warn("[fx] bithumb KRW-USDT 실패", error instanceof Error ? error.message : error);
  }
  return null;
}

async function fromDunamu(): Promise<FxRate | null> {
  try {
    const data = await fetchJson<Array<{ code: string; basePrice: number }>>(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD",
      "dunamu fx"
    );
    const item = Array.isArray(data) ? data.find((d) => d.code === "FRX.KRWUSD") : undefined;
    if (item && Number.isFinite(item.basePrice) && item.basePrice > 0) {
      return { rate: item.basePrice, source: "dunamu" };
    }
    console.warn("[fx] dunamu 응답에 FRX.KRWUSD 가 없음");
  } catch (error) {
    console.warn("[fx] dunamu 실패", error instanceof Error ? error.message : error);
  }
  return null;
}

export async function fetchUsdKrw(mode: FxMode = "usdt"): Promise<FxRate> {
  const order = mode === "fx" ? [fromDunamu, fromBithumbUsdt] : [fromBithumbUsdt, fromDunamu];
  for (const source of order) {
    const rate = await source();
    if (rate) return rate;
  }
  throw new Error("usd/krw rate unavailable on all sources");
}
