import { describe, expect, it } from "vitest";
import { configForFxSource, configFromVars, DEFAULT_CONFIG } from "../worker/src/config";

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

describe("configForFxSource (환산율 폴백 시 기준 재조정)", () => {
  it("fx 요청이 bithumb-usdt 로 폴백되면 순이익 기준·기본 임계값으로 되돌린다", () => {
    const requested = configFromVars({ FX_MODE: "fx" });
    expect(requested.signalBasis).toBe("premium");
    expect(requested.signalThresholdPct).toBe(1.5);

    // 두나무가 죽어서 빗썸 KRW-USDT 로 폴백된 상황
    const actual = configForFxSource(requested, "bithumb-usdt");
    expect(actual.signalBasis).toBe("net");
    // 1.5% 를 그대로 들고 가면 ±0.1% 짜리 실행 스프레드에서는 영원히 발동하지 않는다
    expect(actual.signalThresholdPct).toBe(0.2);
    expect(actual.signalClearPct).toBe(0.05);
  });

  it("usdt 요청이 dunamu 로 폴백되면 프리미엄 기준으로 바뀐다", () => {
    const actual = configForFxSource(configFromVars({}), "dunamu");
    expect(actual.signalBasis).toBe("premium");
    expect(actual.signalThresholdPct).toBe(1.5);
  });

  it("출처가 요청과 일치하면 그대로 둔다", () => {
    const c = configFromVars({});
    expect(configForFxSource(c, "bithumb-usdt")).toBe(c);
  });

  it("사용자가 명시한 임계값은 폴백에도 존중한다", () => {
    const c = configFromVars({ FX_MODE: "fx", SIGNAL_THRESHOLD_PCT: "0.9" });
    expect(c.thresholdsExplicit).toBe(true);
    const actual = configForFxSource(c, "bithumb-usdt");
    expect(actual.signalBasis).toBe("net");
    expect(actual.signalThresholdPct).toBe(0.9);
  });
});
