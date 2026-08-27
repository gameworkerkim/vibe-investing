import { COINS, Coin, FxSource } from "./types";
import type { FxMode } from "./providers/fx";
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

/**
 * 시그널 판정 기준.
 *
 * - `net`     : 수수료·출금비를 뺀 **순이익률**로 판정한다. 실제로 먹을 수 있는 폭이므로
 *               임계값이 곧 "이만큼 남으면 알려줘"가 된다.
 * - `premium` : 비용 차감 전 **프리미엄 절댓값**으로 판정한다. 헤드라인 김프 모니터링용.
 *
 * 기준은 `FX_MODE` 를 따라간다 (`basisForFxMode`). 섞으면 안 되기 때문이다 —
 * `fx` 모드의 프리미엄에는 USDT 프리미엄이 그대로 들어 있어서, 여기에 순이익 판정을 걸면
 * "USDT 를 3% 비싸게 사야 얻는 3%"를 실현 가능한 이익으로 착각한 **거짓 신호**가 나온다.
 */
export type SignalBasis = "net" | "premium";

export function basisForFxMode(fxMode: FxMode): SignalBasis {
  return fxMode === "fx" ? "premium" : "net";
}

/**
 * **실제로 받아온** 환산율 출처에 맞는 기준.
 *
 * 요청한 모드가 아니라 결과를 봐야 한다. `FX_MODE=fx` 로 두었어도 두나무가 죽으면
 * 빗썸 KRW-USDT 로 폴백되는데, 이때 프리미엄은 ±0.1% 짜리 실행 가능 스프레드가 된다.
 * 여기에 헤드라인용 임계값 1.5% 를 그대로 들이대면 시그널이 영원히 발생하지 않는다.
 */
export function basisForFxSource(source: FxSource): SignalBasis {
  return source === "dunamu" ? "premium" : "net";
}

/**
 * 기준별 기본 임계값.
 *
 * `usdt`(net) 기준의 프리미엄은 실측 ±0.1% 수준이고 왕복 비용만 0.28% 안팎이라,
 * 예전 기본값 `±1.5%` 로는 알림이 영원히 발생하지 않았다. 순이익 기준으로 바꾸면서
 * 실제로 발동하는 값으로 조정한다.
 */
export const THRESHOLDS_BY_FX_MODE: Record<FxMode, { threshold: number; clear: number }> = {
  // 순이익 0.2% = 500만원 기준 약 1만원. 비용을 이미 뺀 값이라 0 이 손익분기다.
  usdt: { threshold: 0.2, clear: 0.05 },
  // 헤드라인 김프는 통째로 몇 % 씩 움직이므로 기존 값을 유지한다.
  fx: { threshold: 1.5, clear: 0.5 },
};

export interface ArbConfig {
  coins: Coin[];
  /** 환산율 기준 — "usdt"(실행 가능 스프레드) 또는 "fx"(헤드라인 김프). providers/fx.ts 참고 */
  fxMode: FxMode;
  /** 시그널 판정 기준 — fxMode 에서 파생 */
  signalBasis: SignalBasis;
  /** 시그널 트리거 임계값 (%) — basis 가 net 이면 순이익률, premium 이면 프리미엄 절댓값 */
  signalThresholdPct: number;
  /** 히스테리시스 해제 임계값 (%) — 단위는 signalThresholdPct 와 동일 */
  signalClearPct: number;
  /** 코인별 알림 쿨다운 (ms) */
  alertCooldownMs: number;
  /** 빗썸 테이커 수수료 (%) */
  bithumbTakerFeePct: number;
  /** 바이낸스 테이커 수수료 (%) */
  binanceTakerFeePct: number;
  /** 수수료 비중 계산에 가정하는 1회 진입 금액 (KRW) */
  assumedCapitalKrw: number;
  /** 임계값을 사용자가 직접 지정했는지 — 폴백 시 기본값을 다시 계산할지 판단 */
  thresholdsExplicit: boolean;
}

/**
 * 환산율 폴백이 일어났을 때 기준·임계값을 실제 출처에 맞춰 다시 맞춘다.
 * 사용자가 임계값을 명시했다면 그 값은 존중한다.
 */
export function configForFxSource(config: ArbConfig, source: FxSource): ArbConfig {
  const basis = basisForFxSource(source);
  if (basis === config.signalBasis) return config;

  const defaults = THRESHOLDS_BY_FX_MODE[basis === "premium" ? "fx" : "usdt"];
  return {
    ...config,
    signalBasis: basis,
    signalThresholdPct: config.thresholdsExplicit ? config.signalThresholdPct : defaults.threshold,
    signalClearPct: config.thresholdsExplicit ? config.signalClearPct : defaults.clear,
  };
}

export const DEFAULT_CONFIG: ArbConfig = {
  coins: [...COINS],
  fxMode: "usdt",
  signalBasis: "net",
  signalThresholdPct: THRESHOLDS_BY_FX_MODE.usdt.threshold,
  signalClearPct: THRESHOLDS_BY_FX_MODE.usdt.clear,
  alertCooldownMs: 30 * 60 * 1000,
  bithumbTakerFeePct: 0.04,
  binanceTakerFeePct: 0.1,
  assumedCapitalKrw: 5_000_000,
  thresholdsExplicit: false,
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

  // 임계값 기본값은 FX_MODE 를 따라간다. 명시적으로 지정하면 그 값이 우선한다.
  const fxMode: FxMode = vars.FX_MODE === "fx" ? "fx" : DEFAULT_CONFIG.fxMode;
  const defaults = THRESHOLDS_BY_FX_MODE[fxMode];

  return {
    coins: coins.length > 0 ? coins : DEFAULT_CONFIG.coins,
    fxMode,
    signalBasis: basisForFxMode(fxMode),
    signalThresholdPct: num(vars.SIGNAL_THRESHOLD_PCT, defaults.threshold),
    signalClearPct: num(vars.SIGNAL_CLEAR_PCT, defaults.clear),
    alertCooldownMs: num(vars.ALERT_COOLDOWN_MIN, DEFAULT_CONFIG.alertCooldownMs / 60000) * 60_000,
    bithumbTakerFeePct: num(vars.BITHUMB_TAKER_FEE_PCT, DEFAULT_CONFIG.bithumbTakerFeePct),
    binanceTakerFeePct: num(vars.BINANCE_TAKER_FEE_PCT, DEFAULT_CONFIG.binanceTakerFeePct),
    assumedCapitalKrw: num(vars.ASSUMED_CAPITAL_KRW, DEFAULT_CONFIG.assumedCapitalKrw),
    thresholdsExplicit:
      vars.SIGNAL_THRESHOLD_PCT !== undefined || vars.SIGNAL_CLEAR_PCT !== undefined,
  };
}

/** Env 바인딩에서 설정 로드 */
export function configFromEnv(env: Env): ArbConfig {
  return configFromVars({
    COINS: env.COINS,
    FX_MODE: env.FX_MODE,
    SIGNAL_THRESHOLD_PCT: env.SIGNAL_THRESHOLD_PCT,
    SIGNAL_CLEAR_PCT: env.SIGNAL_CLEAR_PCT,
    ALERT_COOLDOWN_MIN: env.ALERT_COOLDOWN_MIN,
    BITHUMB_TAKER_FEE_PCT: env.BITHUMB_TAKER_FEE_PCT,
    BINANCE_TAKER_FEE_PCT: env.BINANCE_TAKER_FEE_PCT,
    ASSUMED_CAPITAL_KRW: env.ASSUMED_CAPITAL_KRW,
  });
}
