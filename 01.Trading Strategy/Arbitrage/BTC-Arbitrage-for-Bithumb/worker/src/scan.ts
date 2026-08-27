import { configFromEnv } from "./config";
import { Env } from "./env";
import {
  computePremium,
  computeSpreadKrw,
  estimateNetPct,
  evaluateSignal,
  shouldSendAlert,
  updateAlertState,
} from "./signals";
import {
  kvStore,
  loadAlertStates,
  saveAlertStates,
  saveSnapshot,
} from "./storage";
import { fetchBithumbTickers } from "./providers/bithumb";
import { fetchBinancePrices } from "./providers/binance";
import { fetchUsdKrw } from "./providers/fx";
import { SYMBOLS } from "./config";
import {
  formatSignalMessage,
  sendTelegramMessage,
} from "./alerts";
import { AlertStateMap, CoinPrice, SignalDecision, Snapshot } from "./types";

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
 * 2) 프리미엄/스프레드/순이익 계산
 * 3) 히스테리시스+쿨다운 기반 시그널 평가
 * 4) 스냅샷·히스토리·알림상태 KV 저장
 * 5) 트리거된 시그널 텔레그램 알림
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
      fetchUsdKrw(),
    ]);

    const prices: CoinPrice[] = config.coins.map((coin) => {
      const bithumbKrw = bithumbMap[SYMBOLS.bithumb[coin]] ?? NaN;
      const binanceUsdt = binanceMap[SYMBOLS.binance[coin]] ?? NaN;
      const binanceKrw = Number.isFinite(binanceUsdt) ? binanceUsdt * fx.rate : NaN;
      const premiumPct = Number.isFinite(bithumbKrw) && Number.isFinite(binanceKrw)
        ? computePremium(bithumbKrw, binanceKrw)
        : NaN;
      const spreadKrw = Number.isFinite(bithumbKrw) && Number.isFinite(binanceKrw)
        ? computeSpreadKrw(bithumbKrw, binanceKrw)
        : NaN;
      const netPct = Number.isFinite(premiumPct)
        ? estimateNetPct(premiumPct, coin, config, fx.rate)
        : NaN;
      return { coin, bithumbKrw, binanceUsdt, binanceKrw, premiumPct, spreadKrw, netPct };
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
      if (!Number.isFinite(price.premiumPct)) continue;
      const prev = prevStates[price.coin];
      const evaluation = evaluateSignal(price.coin, price.premiumPct, config, prev);
      const state = updateAlertState(prev, evaluation.action, now);
      states[price.coin] = state;
      const decision: SignalDecision = {
        coin: price.coin,
        action: evaluation.action,
        premiumPct: price.premiumPct,
        netPct: price.netPct,
        triggered: evaluation.triggered,
      };
      signals.push(decision);
      if (shouldSendAlert(evaluation, prev, config, now)) {
        alerts.push(decision);
      }
    }

    await Promise.all([
      saveSnapshot(store, snapshot),
      saveAlertStates(store, states),
    ]);

    // 텔레그램 알림
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
        if (ok) alertsSent += 1;
      }
    }

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
      fxSource: "dunamu",
      prices: [],
      signals: [],
      alertsSent: 0,
      error: message,
    };
  }
}

/** 가장 최근 저장된 스냅샷으로 현재 시그널 목록 재구성 (대시보드용, 네트워크 호출 없음) */
export function signalsFromSnapshot(
  snapshot: Snapshot | null,
  signalThresholdPct: number
): Array<Pick<SignalDecision, "coin" | "action" | "premiumPct" | "netPct">> {
  if (!snapshot) return [];
  return snapshot.prices
    .filter((p) => Number.isFinite(p.premiumPct))
    .map((p) => {
      const action =
        p.premiumPct >= signalThresholdPct
          ? ("BITHUMB_SELL" as const)
          : p.premiumPct <= -signalThresholdPct
            ? ("BITHUMB_BUY" as const)
            : ("NEUTRAL" as const);
      return { coin: p.coin, action, premiumPct: p.premiumPct, netPct: p.netPct };
    });
}
