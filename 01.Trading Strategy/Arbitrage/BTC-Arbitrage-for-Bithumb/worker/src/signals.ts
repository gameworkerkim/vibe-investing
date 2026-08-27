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
  /** 이번 스캔에서 상태가 새로 트리거됐는지 (NEUTRAL → 방향, 또는 방향 반전) */
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
 *
 * 차익거래는 프리미엄의 **방향과 무관하게 그 절댓값만큼** 벌 수 있는 구조다.
 * 프리미엄 -3% (빗썸이 싼 경우)는 "빗썸 매수 · 바이낸스 매도"로 +3% 를 노리는 것이므로,
 * 부호를 그대로 두고 비용을 빼면 -3.14% 처럼 손실로 오독되는 값이 나온다.
 * 따라서 |프리미엄| 을 총이익으로 보고 비용을 차감한다.
 *
 * 비용 = 라운드트립 테이커 수수료 + 코인별 출금 수수료(USD→KRW 환산)
 * 출금비 % = 출금수수료USD × USD/KRW ÷ 진입금액(KRW) × 100 (금액이 클수록 비중 감소)
 *
 * 주의: 원화 입출금·USDT 전송 지연·슬리피지·호가 깊이는 반영하지 않은 낙관적 추정치다.
 */
export function estimateNetPct(
  premiumPct: number,
  coin: Coin,
  config: ArbConfig,
  usdKrw: number
): number {
  const grossPct = Math.abs(premiumPct);
  const takerCost = config.bithumbTakerFeePct + config.binanceTakerFeePct;
  const withdrawalCostPct =
    (WITHDRAWAL_FEES_USD[coin] * usdKrw * 100) / config.assumedCapitalKrw;
  return grossPct - takerCost - withdrawalCostPct;
}

/**
 * 히스테리시스가 적용된 시그널 평가.
 *
 * - NEUTRAL(대기): |프리미엄| ≥ 임계값이면 방향 시그널 트리거
 *   - 프리미엄 ≥ +threshold → BITHUMB_SELL (빗썸 비싼 쪽 → 빗썸에서 매도·바이낸스에서 매수)
 *   - 프리미엄 ≤ -threshold → BITHUMB_BUY  (빗썸 싼 쪽 → 빗썸에서 매수·바이낸스에서 매도)
 * - 트리거된 상태: 해제 임계값 안쪽으로 들어와야 NEUTRAL 로 복귀 (플래핑 방지)
 * - 단, 반대 방향으로 임계값을 넘기면 NEUTRAL 을 거치지 않고 즉시 반전한다.
 *   (거치게 두면 실제로 뒤집힌 기회를 한 스캔 주기만큼 놓친다)
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
    if (prev.action === "BITHUMB_SELL" && premiumPct <= -threshold) {
      return { action: "BITHUMB_BUY", triggered: true };
    }
    if (prev.action === "BITHUMB_BUY" && premiumPct >= threshold) {
      return { action: "BITHUMB_SELL", triggered: true };
    }
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

/**
 * 코인별 알림 상태 갱신.
 * `lastAlertAt` 은 여기서 건드리지 않는다 — 실제 발송에 성공했을 때만
 * `markAlertSent` 로 갱신해야 쿨다운이 의미를 갖는다.
 */
export function updateAlertState(
  prev: AlertState | undefined,
  action: SignalAction,
  now: number
): AlertState {
  const since = prev && prev.action === action ? prev.since : now;
  const lastAlertAt = prev?.lastAlertAt ?? 0;
  return { action, since, lastAlertAt };
}

/** 알림 발송에 성공한 시각을 기록 (쿨다운 기준점) */
export function markAlertSent(state: AlertState, now: number): AlertState {
  return { ...state, lastAlertAt: now };
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
