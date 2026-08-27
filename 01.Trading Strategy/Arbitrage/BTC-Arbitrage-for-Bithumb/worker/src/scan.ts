import { configFromEnv, SYMBOLS } from "./config";
import { Env } from "./env";
import {
  computePremium,
  computeSpreadKrw,
  estimateNetPct,
  evaluateSignal,
  markAlertSent,
  shouldSendAlert,
  updateAlertState,
} from "./signals";
import {
  kvStore,
  loadAlertStates,
  saveAlertStatesIfChanged,
  saveSnapshot,
} from "./storage";
import { fetchBithumbTickers } from "./providers/bithumb";
import { fetchBinancePrices } from "./providers/binance";
import { fetchUsdKrw } from "./providers/fx";
import {
  formatSignalMessage,
  sendTelegramMessage,
} from "./alerts";
import {
  AlertStateMap,
  CoinPrice,
  finiteOrNull,
  SignalDecision,
  Snapshot,
} from "./types";

export interface ScanResult {
  ok: boolean;
  fetchedAtMs: number;
  usdKrw: number;
  fxSource: Snapshot["fxSource"];
  prices: CoinPrice[];
  signals: SignalDecision[];
  alertsSent: number;
  error?: string;
}

/**
 * 차익거래 스캔 파이프라인.
 * 1) 빗썸·바이낸스·환율 동시 조회
 * 2) 프리미엄/스프레드/순이익 계산 (일부 코인이 빠져도 나머지는 계속)
 * 3) 히스테리시스+쿨다운 기반 시그널 평가
 * 4) 트리거된 시그널 텔레그램 알림
 * 5) 스냅샷·히스토리·알림상태 KV 저장 — 발송 성공 시각까지 반영해야 하므로 알림 뒤에 저장
 */
export async function runArbitrageScan(env: Env): Promise<ScanResult> {
  const config = configFromEnv(env);
  const store = kvStore(env.ARB_DATA);
  const now = Date.now();

  try {
    const bithumbMarkets = config.coins.map((c) => SYMBOLS.bithumb[c]);
    const binanceSymbols = config.coins.map((c) => SYMBOLS.binance[c]);

    const [bithumbMap, binanceMap, fx] = await Promise.all([
      fetchBithumbTickers(bithumbMarkets),
      fetchBinancePrices(binanceSymbols),
      fetchUsdKrw(config.fxMode),
    ]);

    const prices: CoinPrice[] = config.coins.map((coin) => {
      const bithumbKrw = bithumbMap[SYMBOLS.bithumb[coin]];
      const binanceUsdt = binanceMap[SYMBOLS.binance[coin]];
      const complete =
        Number.isFinite(bithumbKrw) &&
        bithumbKrw > 0 &&
        Number.isFinite(binanceUsdt) &&
        binanceUsdt > 0;

      if (!complete) {
        console.warn(`[scan] ${coin} 시세 누락 (bithumb=${bithumbKrw} binance=${binanceUsdt})`);
        return {
          coin,
          bithumbKrw: finiteOrNull(bithumbKrw ?? NaN),
          binanceUsdt: finiteOrNull(binanceUsdt ?? NaN),
          binanceKrw: null,
          premiumPct: null,
          spreadKrw: null,
          netPct: null,
        };
      }

      const binanceKrw = binanceUsdt * fx.rate;
      const premiumPct = computePremium(bithumbKrw, binanceKrw);
      return {
        coin,
        bithumbKrw,
        binanceUsdt,
        binanceKrw,
        premiumPct,
        spreadKrw: computeSpreadKrw(bithumbKrw, binanceKrw),
        netPct: estimateNetPct(premiumPct, coin, config, fx.rate),
      };
    });

    const snapshot: Snapshot = {
      fetchedAt: new Date(now).toISOString(),
      fetchedAtMs: now,
      usdKrw: fx.rate,
      fxSource: fx.source,
      prices,
    };

    // 시그널 평가 + 알림 상태 갱신
    const prevStates = await loadAlertStates(store);
    const states: AlertStateMap = {};
    const signals: SignalDecision[] = [];
    const alerts: SignalDecision[] = [];

    for (const price of prices) {
      const premiumPct = price.premiumPct;
      if (premiumPct === null) {
        // 시세를 못 받은 코인은 이전 상태를 그대로 보존한다.
        // 버리면 복구되는 순간 이미 진행 중이던 시그널이 다시 트리거된다.
        const carried = prevStates[price.coin];
        if (carried) states[price.coin] = carried;
        continue;
      }
      const prev = prevStates[price.coin];
      const evaluation = evaluateSignal(price.coin, premiumPct, config, prev);
      states[price.coin] = updateAlertState(prev, evaluation.action, now);
      const decision: SignalDecision = {
        coin: price.coin,
        action: evaluation.action,
        premiumPct,
        netPct: price.netPct,
        triggered: evaluation.triggered,
      };
      signals.push(decision);
      if (shouldSendAlert(evaluation, prev, config, now)) {
        alerts.push(decision);
      }
    }

    // 텔레그램 알림 — 발송에 성공한 것만 쿨다운 시각을 찍는다.
    let alertsSent = 0;
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    if (alerts.length > 0 && botToken && chatId) {
      const priceByCoin = new Map(prices.map((p) => [p.coin, p]));
      for (const alert of alerts) {
        const price = priceByCoin.get(alert.coin);
        if (!price) continue;
        const ok = await sendTelegramMessage(
          botToken,
          chatId,
          formatSignalMessage(alert, price)
        );
        if (!ok) continue;
        alertsSent += 1;
        const state = states[alert.coin];
        if (state) states[alert.coin] = markAlertSent(state, now);
      }
    }

    await Promise.all([
      saveSnapshot(store, snapshot),
      saveAlertStatesIfChanged(store, prevStates, states),
    ]);

    return {
      ok: true,
      fetchedAtMs: now,
      usdKrw: fx.rate,
      fxSource: fx.source,
      prices,
      signals,
      alertsSent,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[scan] error", message);
    return {
      ok: false,
      fetchedAtMs: now,
      usdKrw: 0,
      fxSource: config.fxMode === "fx" ? "dunamu" : "bithumb-usdt",
      prices: [],
      signals: [],
      alertsSent: 0,
      error: message,
    };
  }
}

/**
 * 가장 최근 저장된 스냅샷으로 현재 시그널 목록 재구성 (대시보드용, 네트워크 호출 없음).
 *
 * 주의: 여기에는 히스테리시스가 적용되지 않는다. KV 의 알림 상태(`state:alerts`)가
 * 아니라 프리미엄 값만 보고 임계값을 다시 판정하므로, 해제 구간(±0.5~1.5%)에서는
 * 대시보드가 NEUTRAL 을 보여주는 동안 알림 상태는 아직 방향을 유지할 수 있다.
 * 대시보드는 "지금 프리미엄이 임계값을 넘었는가"를 보여주는 용도다.
 */
export function signalsFromSnapshot(
  snapshot: Snapshot | null,
  signalThresholdPct: number
): Array<Pick<SignalDecision, "coin" | "action" | "premiumPct" | "netPct">> {
  if (!snapshot) return [];
  const result: Array<Pick<SignalDecision, "coin" | "action" | "premiumPct" | "netPct">> = [];
  for (const p of snapshot.prices) {
    if (p.premiumPct === null || !Number.isFinite(p.premiumPct)) continue;
    const action =
      p.premiumPct >= signalThresholdPct
        ? ("BITHUMB_SELL" as const)
        : p.premiumPct <= -signalThresholdPct
          ? ("BITHUMB_BUY" as const)
          : ("NEUTRAL" as const);
    result.push({ coin: p.coin, action, premiumPct: p.premiumPct, netPct: p.netPct });
  }
  return result;
}
