export const COINS = ["BTC", "ETH", "SOL", "XRP"] as const;
export type Coin = (typeof COINS)[number];

export type FxSource = "bithumb-usdt" | "dunamu";

export interface CoinPrice {
  coin: Coin;
  /** 빗썸 현재가 (KRW) */
  bithumbKrw: number;
  /** 바이낸스 현재가 (USDT) */
  binanceUsdt: number;
  /** 바이낸스 현재가를 원화로 환산 (USDT × USD/KRW) */
  binanceKrw: number;
  /** 김치 프리미엄 (%) = (빗썸 / 바이낸스KRW - 1) × 100 */
  premiumPct: number;
  /** 가격 스프레드 (KRW) = 빗썸 - 바이낸스KRW */
  spreadKrw: number;
  /** 수수료·출금비 차감 후 추정 순이익률 (%) */
  netPct: number;
}

export interface Snapshot {
  fetchedAt: string;
  fetchedAtMs: number;
  /** USD/KRW 환율 */
  usdKrw: number;
  fxSource: FxSource;
  prices: CoinPrice[];
}

export type SignalAction = "BITHUMB_SELL" | "BITHUMB_BUY" | "NEUTRAL";

export interface SignalDecision {
  coin: Coin;
  action: SignalAction;
  premiumPct: number;
  netPct: number;
  /** 이번 스캔에서 임계값을 새로 돌파해 알림이 필요한지 */
  triggered: boolean;
}

export interface AlertState {
  action: SignalAction;
  /** 이 상태로 진입한 시각 (ms) */
  since: number;
  /** 마지막 알림 발송 시각 (ms) */
  lastAlertAt: number;
}

export type AlertStateMap = Partial<Record<Coin, AlertState>>;
