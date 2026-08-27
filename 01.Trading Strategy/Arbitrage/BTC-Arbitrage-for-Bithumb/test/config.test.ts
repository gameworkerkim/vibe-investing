import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, configFromVars } from "../worker/src/config";

describe("configFromVars", () => {
  it("기본값", () => {
    const c = configFromVars({});
    expect(c.coins).toEqual(["BTC", "ETH", "SOL", "XRP"]);
    expect(c.signalThresholdPct).toBe(DEFAULT_CONFIG.signalThresholdPct);
    expect(c.signalClearPct).toBe(DEFAULT_CONFIG.signalClearPct);
    expect(c.alertCooldownMs).toBe(30 * 60 * 1000);
    expect(c.fxMode).toBe("usdt");
  });

  it("FX_MODE 파싱 — 알 수 없는 값은 기본(usdt)", () => {
    expect(configFromVars({ FX_MODE: "fx" }).fxMode).toBe("fx");
    expect(configFromVars({ FX_MODE: "USDT" }).fxMode).toBe("usdt");
    expect(configFromVars({ FX_MODE: "nonsense" }).fxMode).toBe("usdt");
  });

  it("커스텀 변수 파싱", () => {
    const c = configFromVars({
      COINS: "btc, eth, doge, sol",
      SIGNAL_THRESHOLD_PCT: "2.5",
      SIGNAL_CLEAR_PCT: "0.75",
      ALERT_COOLDOWN_MIN: "15",
      BITHUMB_TAKER_FEE_PCT: "0.05",
      BINANCE_TAKER_FEE_PCT: "0.08",
      ASSUMED_CAPITAL_KRW: "10000000",
    });
    expect(c.coins).toEqual(["BTC", "ETH", "SOL"]);
    expect(c.signalThresholdPct).toBe(2.5);
    expect(c.signalClearPct).toBe(0.75);
    expect(c.alertCooldownMs).toBe(15 * 60 * 1000);
    expect(c.bithumbTakerFeePct).toBe(0.05);
    expect(c.binanceTakerFeePct).toBe(0.08);
    expect(c.assumedCapitalKrw).toBe(10_000_000);
  });

  it("잘못된 숫자는 fallback", () => {
    const c = configFromVars({ SIGNAL_THRESHOLD_PCT: "abc", ALERT_COOLDOWN_MIN: "x" });
    expect(c.signalThresholdPct).toBe(DEFAULT_CONFIG.signalThresholdPct);
    expect(c.alertCooldownMs).toBe(DEFAULT_CONFIG.alertCooldownMs);
  });
});
