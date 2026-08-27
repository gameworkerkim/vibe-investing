import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../worker/src/config";
import {
  computePremium,
  computeSpreadKrw,
  estimateNetPct,
  evaluateSignal,
  markAlertSent,
  shouldSendAlert,
  updateAlertState,
} from "../worker/src/signals";

const config = { ...DEFAULT_CONFIG };

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

describe("evaluateSignal (히스테리시스)", () => {
  it("대기 상태에서 임계값 돌파 시 방향 트리거", () => {
    expect(evaluateSignal("BTC", 1.5, config).action).toBe("BITHUMB_SELL");
    expect(evaluateSignal("BTC", 1.5, config).triggered).toBe(true);
    expect(evaluateSignal("BTC", -1.5, config).action).toBe("BITHUMB_BUY");
    expect(evaluateSignal("BTC", 0.1, config).action).toBe("NEUTRAL");
  });

  it("트리거 상태는 해제 임계값 안쪽으로 들어와야 중립 복귀 (플래핑 방지)", () => {
    const prev = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    expect(evaluateSignal("BTC", 0.8, config, prev).action).toBe("BITHUMB_SELL");
    expect(evaluateSignal("BTC", 0.8, config, prev).triggered).toBe(false);
    expect(evaluateSignal("BTC", 0.4, config, prev).action).toBe("NEUTRAL");
    expect(evaluateSignal("BTC", 0.4, config, prev).triggered).toBe(false);
  });

  it("BITHUMB_BUY 방향도 대칭 동작", () => {
    const prev = { action: "BITHUMB_BUY" as const, since: 0, lastAlertAt: 0 };
    expect(evaluateSignal("BTC", -0.8, config, prev).action).toBe("BITHUMB_BUY");
    expect(evaluateSignal("BTC", -0.4, config, prev).action).toBe("NEUTRAL");
  });

  it("반대 방향 임계값을 넘기면 NEUTRAL 을 거치지 않고 즉시 반전", () => {
    const sell = { action: "BITHUMB_SELL" as const, since: 0, lastAlertAt: 0 };
    const flipped = evaluateSignal("BTC", -2.0, config, sell);
    expect(flipped.action).toBe("BITHUMB_BUY");
    expect(flipped.triggered).toBe(true);

    const buy = { action: "BITHUMB_BUY" as const, since: 0, lastAlertAt: 0 };
    const flippedBack = evaluateSignal("BTC", 2.0, config, buy);
    expect(flippedBack.action).toBe("BITHUMB_SELL");
    expect(flippedBack.triggered).toBe(true);
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
