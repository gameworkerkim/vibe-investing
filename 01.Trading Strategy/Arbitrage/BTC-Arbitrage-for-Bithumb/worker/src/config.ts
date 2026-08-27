import { COINS, Coin } from "./types";
import type { Env } from "./env";

/** 거래 페어 심볼 매핑 (빗썸 = KRW 마켓, 바이낸스 = USDT) */
export const SYMBOLS: Record<
  "bithumb" | "binance",
  Record<Coin, string>
> = {
  bithumb: { BTC: "KRW-BTC", ETH: "KRW-ETH", SOL: "KRW-SOL", XRP: "KRW-XRP" },
  binance: { BTC: "BTCUSDT", ETH: "ETHUSDT", SOL: "SOLUSDT", XRP: "XRPUSDT" },
};

/**
 * 출금 수수료 추정치 (USD).
 * 거래소 정책에 따라 달라지므로 대략적인 값이며, docs 의 개발 계획에서 튜닝 항목으로 표기.
 * 정확한 값은 각 거래소 출금 정책을 확인 후 조정할 것.
 */
export const WITHDRAWAL_FEES_USD: Record<Coin, number> = {
  BTC: 5,
  ETH: 8,
  SOL: 1,
  XRP: 5,
};

export interface ArbConfig {
  coins: Coin[];
  /** 시그널 트리거 프리미엄 임계값 (%) */
  signalThresholdPct: number;
  /** 히스테리시스 해제 임계값 (%) */
  signalClearPct: number;
  /** 코인별 알림 쿨다운 (ms) */
  alertCooldownMs: number;
  /** 빗썸 테이커 수수료 (%) */
  bithumbTakerFeePct: number;
  /** 바이낸스 테이커 수수료 (%) */
  binanceTakerFeePct: number;
  /** 수수료 비중 계산에 가정하는 1회 진입 금액 (KRW) */
  assumedCapitalKrw: number;
}

export const DEFAULT_CONFIG: ArbConfig = {
  coins: [...COINS],
  signalThresholdPct: 1.5,
  signalClearPct: 0.5,
  alertCooldownMs: 30 * 60 * 1000,
  bithumbTakerFeePct: 0.04,
  binanceTakerFeePct: 0.1,
  assumedCapitalKrw: 5_000_000,
};

/** 문자열 파라미터 → 숫자 (없으면 fallback) */
function num(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function configFromVars(vars: Record<string, string | undefined>): ArbConfig {
  const coins = (vars.COINS ?? DEFAULT_CONFIG.coins.join(","))
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is Coin => (COINS as readonly string[]).includes(s));

  return {
    coins: coins.length > 0 ? coins : DEFAULT_CONFIG.coins,
    signalThresholdPct: num(vars.SIGNAL_THRESHOLD_PCT, DEFAULT_CONFIG.signalThresholdPct),
    signalClearPct: num(vars.SIGNAL_CLEAR_PCT, DEFAULT_CONFIG.signalClearPct),
    alertCooldownMs: num(vars.ALERT_COOLDOWN_MIN, DEFAULT_CONFIG.alertCooldownMs / 60000) * 60_000,
    bithumbTakerFeePct: num(vars.BITHUMB_TAKER_FEE_PCT, DEFAULT_CONFIG.bithumbTakerFeePct),
    binanceTakerFeePct: num(vars.BINANCE_TAKER_FEE_PCT, DEFAULT_CONFIG.binanceTakerFeePct),
    assumedCapitalKrw: num(vars.ASSUMED_CAPITAL_KRW, DEFAULT_CONFIG.assumedCapitalKrw),
  };
}

/** Env 바인딩에서 설정 로드 */
export function configFromEnv(env: Env): ArbConfig {
  return configFromVars({
    COINS: env.COINS,
    SIGNAL_THRESHOLD_PCT: env.SIGNAL_THRESHOLD_PCT,
    SIGNAL_CLEAR_PCT: env.SIGNAL_CLEAR_PCT,
    ALERT_COOLDOWN_MIN: env.ALERT_COOLDOWN_MIN,
    BITHUMB_TAKER_FEE_PCT: env.BITHUMB_TAKER_FEE_PCT,
    BINANCE_TAKER_FEE_PCT: env.BINANCE_TAKER_FEE_PCT,
    ASSUMED_CAPITAL_KRW: env.ASSUMED_CAPITAL_KRW,
  });
}
