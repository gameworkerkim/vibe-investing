export const COINS = ["BTC", "ETH", "SOL", "XRP"] as const;
export type Coin = (typeof COINS)[number];

export type FxSource = "bithumb-usdt" | "dunamu";

/**
 * 조회 실패·부분 응답을 표현하기 위한 숫자 타입.
 * KV 는 JSON 으로 직렬화되므로 `NaN` 은 저장 시 `null` 로 바뀐다.
 * 처음부터 `null` 을 쓰면 타입과 저장 형태가 일치한다.
 */
export type MaybeNumber = number | null;

export interface CoinPrice {
  coin: Coin;
  /** 빗썸 현재가 (KRW) */
  bithumbKrw: MaybeNumber;
  /** 바이낸스 현재가 (USDT) */
  binanceUsdt: MaybeNumber;
  /** 바이낸스 현재가를 원화로 환산 (USDT × USD/KRW) */
  binanceKrw: MaybeNumber;
  /** 김치 프리미엄 (%) = (빗썸 / 바이낸스KRW - 1) × 100 */
  premiumPct: MaybeNumber;
  /** 가격 스프레드 (KRW) = 빗썸 - 바이낸스KRW */
  spreadKrw: MaybeNumber;
  /**
   * 수수료·출금비 차감 후 추정 순이익률 (%).
   * 방향(빗썸 매도/매수)과 무관하게 |프리미엄| 에서 비용을 뺀 "실행 시 남는 폭"이다.
   */
  netPct: MaybeNumber;
}

export interface Snapshot {
  fetchedAt: string;
  fetchedAtMs: number;
  /** 프리미엄 환산에 사용한 USD/KRW */
  usdKrw: number;
  fxSource: FxSource;
  prices: CoinPrice[];
}

export type SignalAction = "BITHUMB_SELL" | "BITHUMB_BUY" | "NEUTRAL";

export interface SignalDecision {
  coin: Coin;
  action: SignalAction;
  premiumPct: number;
  netPct: MaybeNumber;
  /** 이번 스캔에서 임계값을 새로 돌파해 알림이 필요한지 */
  triggered: boolean;
}

export interface AlertState {
  action: SignalAction;
  /** 이 상태로 진입한 시각 (ms) */
  since: number;
  /** 마지막 알림 발송 시각 (ms) — 발송에 성공했을 때만 갱신된다 */
  lastAlertAt: number;
}

export type AlertStateMap = Partial<Record<Coin, AlertState>>;

/** 유한한 숫자면 그대로, 아니면 null (KV 직렬화 안전) */
export function finiteOrNull(value: number): MaybeNumber {
  return Number.isFinite(value) ? value : null;
}
