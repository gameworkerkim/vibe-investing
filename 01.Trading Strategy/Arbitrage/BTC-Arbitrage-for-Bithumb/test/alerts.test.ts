import { describe, expect, it } from "vitest";
import {
  formatKrw,
  formatPremium,
  formatSignalMessage,
  formatTestMessage,
  formatUsdt,
  sendTelegramMessage,
} from "../worker/src/alerts";
import { CoinPrice, SignalDecision } from "../worker/src/types";

const price: CoinPrice = {
  coin: "BTC",
  bithumbKrw: 140_500_000,
  binanceUsdt: 96_850.5,
  binanceKrw: 139_500_000,
  premiumPct: 0.7167,
  spreadKrw: 1_000_000,
  netPct: 0.5767,
};

const decision: SignalDecision = {
  coin: "BTC",
  action: "BITHUMB_SELL",
  premiumPct: 0.7167,
  netPct: 0.5767,
  triggered: true,
};

describe("포맷", () => {
  it("formatKrw / formatUsdt / formatPremium", () => {
    expect(formatKrw(140_500_000)).toBe("140,500,000 KRW");
    expect(formatUsdt(96_850.5)).toBe("96,850.50 USDT");
    expect(formatPremium(1.2)).toBe("+1.20%");
    expect(formatPremium(-0.5)).toBe("-0.50%");
  });
});

describe("formatSignalMessage", () => {
  it("HTML 메시지에 방향·가격·프리미엄 포함", () => {
    const msg = formatSignalMessage(decision, price);
    expect(msg).toContain("BTC");
    expect(msg).toContain("매도");
    expect(msg).toContain("140,500,000 KRW");
    expect(msg).toContain("96,850.50 USDT");
    expect(msg).toContain("+0.72%");
    expect(msg).toContain("<b>");
  });

  it("BUY 방향 라벨", () => {
    const buy = formatSignalMessage({ ...decision, action: "BITHUMB_BUY" }, price);
    expect(buy).toContain("매수");
  });
});

describe("sendTelegramMessage", () => {
  it("성공 시 true 반환", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;
    try {
      expect(await sendTelegramMessage("token", "chat", "hi")).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("실패 시 false 반환", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response("nope", { status: 400 })) as typeof fetch;
    try {
      expect(await sendTelegramMessage("token", "chat", "hi")).toBe(false);
    } finally {
      globalThis.fetch = original;
    }
  });
});

it("formatTestMessage 상수", () => {
  expect(formatTestMessage()).toContain("차익거래 시그널");
});
