import { ArbConfig, WITHDRAWAL_FEES_USD } from "./config";
import { AlertState, AlertStateMap, Coin, SignalAction } from "./types";

export interface PriceInput {
  coin: Coin;
  bithumbKrw: number;
  /** 바이낸스 가격을 원화로 환산한 값 */
  binanceKrw: number;
}

export interface SignalEvaluation {
  action: SignalAction;
  /** 이번 스캔에서 상태가 새로 트리거됐는지 (NEUTRAL → 방향 전환) */
  triggered: boolean;
}

/** 김치 프리미엄(%) = (빗썸 / 바이낸스KRW - 1) × 100 */
export function computePremium(bithumbKrw: number, binanceKrw: number): number {
  if (!binanceKrw || binanceKrw <= 0) return 0;
  return (bithumbKrw / binanceKrw - 1) * 100;
}

/** 가격 스프레드(KRW) = 빗썸 - 바이낸스KRW */
export function computeSpreadKrw(bithumbKrw: number, binanceKrw: number): number {
  return bithumbKrw - binanceKrw;
}

/**
 * 수수료·출금비 차감 후 추정 순이익률(%).
 * 라운드트립 테이커 수수료 + 코인별 출금 수수료(USD→KRW 환산)를 프리미엄에서 뺀다.
 * 출금비 % = 출금수수료USD × USD/KRW ÷ 진입금액(KRW) × 100 (금액이 클수록 비중 감소)
 */
export function estimateNetPct(
  premiumPct: number,
  coin: Coin,
  config: ArbConfig,
  usdKrw: number
): number {
  const takerCost = config.bithumbTakerFeePct + config.binanceTakerFeePct;
  const withdrawalCostPct =
    (WITHDRAWAL_FEES_USD[coin] * usdKrw * 100) / config.assumedCapitalKrw;
  return premiumPct - takerCost - withdrawalCostPct;
}

/**
 * 히스테리시스가 적용된 시그널 평가.
 *
 * - NEUTRAL(대기): |프리미엄| ≥ 임계값이면 방향 시그널 트리거
 *   - 프리미엄 ≥ +threshold → BITHUMB_SELL (빗썸 비싼 쪽 → 빗썸에서 매도·바이낸스에서 매수)
 *   - 프리미엄 ≤ -threshold → BITHUMB_BUY  (빗썸 싼 쪽 → 빗썸에서 매수·바이낸스에서 매도)
 * - 트리거된 상태: 해제 임계값 안쪽으로 들어와야 NEUTRAL 로 복귀 (플래핑 방지)
 */
export function evaluateSignal(
  _coin: Coin,
  premiumPct: number,
  config: ArbConfig,
  prev?: AlertState
): SignalEvaluation {
  const threshold = config.signalThresholdPct;
  const clear = config.signalClearPct;

  if (prev && prev.action !== "NEUTRAL") {
    const cleared =
      prev.action === "BITHUMB_SELL"
        ? premiumPct <= clear
        : premiumPct >= -clear;
    if (cleared) return { action: "NEUTRAL", triggered: false };
    return { action: prev.action, triggered: false };
  }

  if (premiumPct >= threshold) return { action: "BITHUMB_SELL", triggered: true };
  if (premiumPct <= -threshold) return { action: "BITHUMB_BUY", triggered: true };
  return { action: "NEUTRAL", triggered: false };
}

/** 코인별 알림 상태 갱신 (쿨다운을 지나야 알림 발송) */
export function updateAlertState(
  prev: AlertState | undefined,
  action: SignalAction,
  now: number
): AlertState {
  const since = prev && prev.action === action ? prev.since : now;
  const lastAlertAt = prev?.lastAlertAt ?? 0;
  return { action, since, lastAlertAt };
}

/** 알림 발송 여부: 방향이 새로 트리거됐고, 마지막 알림 이후 쿨다운이 지났는지 */
export function shouldSendAlert(
  evaluation: SignalEvaluation,
  prev: AlertState | undefined,
  config: ArbConfig,
  now: number
): boolean {
  if (!evaluation.triggered) return false;
  if (!prev?.lastAlertAt) return true;
  return now - prev.lastAlertAt >= config.alertCooldownMs;
}

export function newAlertStates(): AlertStateMap {
  return {};
}
