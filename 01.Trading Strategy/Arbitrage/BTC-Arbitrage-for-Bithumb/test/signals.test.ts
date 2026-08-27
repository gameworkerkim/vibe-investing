import { describe, expect, it } from "vitest";
import { configFromVars, DEFAULT_CONFIG } from "../worker/src/config";
import {
  computePremium,
  computeSpreadKrw,
  directionFor,
  estimateNetPct,
  evaluateSignal,
  markAlertSent,
  shouldSendAlert,
  signalMetric,
  updateAlertState,
} from "../worker/src/signals";

const config = { ...DEFAULT_CONFIG };
/** 기본: FX_MODE=usdt → 순이익 기준, 임계값 0.2% / 해제 0.05% */
const netConfig = configFromVars({});
/** FX_MODE=fx → 프리미엄 절댓값 기준, 임계값 1.5% / 해제 0.5% */
const premiumConfig = configFromVars({ FX_MODE: "fx" });

describe("computePremium", () => {
  it("계산: (빗썸/바이낸스KRW - 1) × 100", () => {
    expect(computePremium(101_000_000, 100_000_000)).toBeCloseTo(1.0);
    expect(computePremium(99_000_000, 100_000_000)).toBeCloseTo(-1.0);
  });
  it("바이낸스 가격이 0 이면 0", () => {
    expect(computePremium(100, 0)).toBe(0);
  });
});

describe("computeSpreadKrw", () => {
  it("빗썸 - 바이낸스KRW", () => {
    expect(computeSpreadKrw(101_000_000, 100_000_000)).toBe(1_000_000);
  });
});

describe("estimateNetPct", () => {
  it("수수료와 출금비를 차감한다", () => {
    // 프리미엄 1.5% - (0.04 + 0.1) - 출금비(BTC 5USD × 1400 / 500만 × 100)
    const withdrawal = (5 * 1400 * 100) / config.assumedCapitalKrw;
    const expected = 1.5 - (0.04 + 0.1) - withdrawal;
    expect(estimateNetPct(1.5, "BTC", config, 1400)).toBeCloseTo(expected);
    // 진입금액이 클수록 출금비 비중이 작아진다
    const bigCapital = { ...config, assumedCapitalKrw: 50_000_000 };
    const withdrawalBig = (5 * 1400 * 100) / bigCapital.assumedCapitalKrw;
    expect(estimateNetPct(1.5, "BTC", bigCapital, 1400)).toBeCloseTo(
      1.5 - 0.14 - withdrawalBig
    );
  });

  it("역방향(음수 프리미엄)도 같은 크기의 순이익으로 계산한다", () => {
    // 빗썸이 3% 싸면 "빗썸 매수 · 바이낸스 매도"로 +3% 를 노린다.
    // 부호를 그대로 쓰면 -3.14% 라는 손실처럼 보이는 값이 나왔었다.
    expect(estimateNetPct(-3, "BTC", config, 1400)).toBeCloseTo(
      estimateNetPct(3, "BTC", config, 1400)
    );
    expect(estimateNetPct(-3, "BTC", config, 1400)).toBeGreaterThan(0);
  });
});

describe("signalMetric / directionFor", () => {
  it("basis=net 이면 순이익률, basis=premium 이면 프리미엄 절댓값", () => {
    expect(signalMetric(-3, 0.4, netConfig)).toBe(0.4);
    expect(signalMetric(-3, 0.4, premiumConfig)).toBe(3);
  });

  it("방향은 프리미엄 부호가 결정한다", () => {
    expect(directionFor(0.01)).toBe("BITHUMB_SELL");
    expect(directionFor(-0.01)).toBe("BITHUMB_BUY");
  });
});

describe("evaluateSignal — basis=net (기본, FX_MODE=usdt)", () => {
  it("순이익이 임계값을 넘으면 프리미엄 부호 방향으로 트리거", () => {
    // 프리미엄은 +0.5% 로 작지만 비용을 빼고도 0.3% 남으면 신호다
    const up = evaluateSignal(0.5, 0.3, netConfig);
    expect(up.action).toBe("BITHUMB_SELL");
    expect(up.triggered).toBe(true);

    const down = evaluateSignal(-0.5, 0.3, netConfig);
    expect(down.action).toBe("BITHUMB_BUY");
    expect(down.triggered).toBe(true);
  });

  it("프리미엄이 커도 비용을 못 넘기면 신호가 아니다 (거짓 신호 차단)", () => {
    // 예전 프리미엄 기준이라면 |2%| 로 발동했겠지만, 순이익이 음수면 실행할 이유가 없다
    const result = evaluateSignal(2.0, -0.05, netConfig);
    expect(result.action).toBe("NEUTRAL");
    expect(result.triggered).toBe(false);
  });

  it("해제 임계값 아래로 내려와야 중립 복귀", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    expect(evaluateSignal(0.5, 0.1, netConfig, prev).action).toBe("BITHUMB_SELL");
    expect(evaluateSignal(0.5, 0.04, netConfig, prev).action).toBe("NEUTRAL");
  });

  it("방향이 뒤집히고 임계값을 다시 넘기면 즉시 반전", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    const flipped = evaluateSignal(-0.5, 0.3, netConfig, prev);
    expect(flipped.action).toBe("BITHUMB_BUY");
    expect(flipped.triggered).toBe(true);
  });

  it("방향만 뒤집히고 임계값에 못 미치면 이전 상태 유지", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    const held = evaluateSignal(-0.5, 0.1, netConfig, prev);
    expect(held.action).toBe("BITHUMB_SELL");
    expect(held.triggered).toBe(false);
  });
});

describe("evaluateSignal — basis=premium (FX_MODE=fx)", () => {
  it("프리미엄 절댓값으로 판정하고 순이익은 보지 않는다", () => {
    expect(evaluateSignal(1.5, -99, premiumConfig).action).toBe("BITHUMB_SELL");
    expect(evaluateSignal(-1.5, -99, premiumConfig).action).toBe("BITHUMB_BUY");
    expect(evaluateSignal(0.1, 99, premiumConfig).action).toBe("NEUTRAL");
  });

  it("해제 임계값(0.5%) 안쪽으로 들어와야 중립 복귀 (플래핑 방지)", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    expect(evaluateSignal(0.8, 0, premiumConfig, prev).action).toBe("BITHUMB_SELL");
    expect(evaluateSignal(0.4, 0, premiumConfig, prev).action).toBe("NEUTRAL");
  });

  it("BITHUMB_BUY 방향도 대칭 동작", () => {
    const prev = { action: "BITHUMB_BUY" as const, since: 0, lastAlertAt: 0 };
    expect(evaluateSignal(-0.8, 0, premiumConfig, prev).action).toBe("BITHUMB_BUY");
    expect(evaluateSignal(-0.4, 0, premiumConfig, prev).action).toBe("NEUTRAL");
  });
});

describe("updateAlertState / markAlertSent / shouldSendAlert (쿨다운)", () => {
  it("상태 진입 시 since 갱신, 동일 상태는 유지", () => {
    const now = 1000;
    const s1 = updateAlertState(undefined, "BITHUMB_SELL", now);
    expect(s1).toEqual({ action: "BITHUMB_SELL", since: now, lastAlertAt: 0 });
    const s2 = updateAlertState(s1, "BITHUMB_SELL", 2000);
    expect(s2.since).toBe(now);
  });

  it("updateAlertState 는 lastAlertAt 을 건드리지 않고, markAlertSent 만 갱신한다", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 500 };
    expect(updateAlertState(prev, "BITHUMB_SELL", 9000).lastAlertAt).toBe(500);
    expect(markAlertSent(prev, 9000).lastAlertAt).toBe(9000);
    expect(markAlertSent(prev, 9000).since).toBe(0);
  });

  it("새 트리거 + 쿨다운 경과 → 알림 발송", () => {
    const evalResult = { action: "BITHUMB_SELL" as const, triggered: true };
    expect(shouldSendAlert(evalResult, undefined, config, 1000)).toBe(true);
    const recent = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 1000 };
    expect(shouldSendAlert(evalResult, recent, config, 1000 + 60_000)).toBe(false);
    expect(shouldSendAlert(evalResult, recent, config, 1000 + config.alertCooldownMs)).toBe(true);
  });

  it("트리거 아닌 평가는 알림 없음", () => {
    const evalResult = { action: "NEUTRAL" as const, triggered: false };
    expect(shouldSendAlert(evalResult, undefined, config, 0)).toBe(false);
  });
});
