import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configFromVars } from "../worker/src/config";
import { runArbitrageScan, signalsFromSnapshot } from "../worker/src/scan";
import { Env } from "../worker/src/env";
import { Snapshot } from "../worker/src/types";

function fakeKv(): KVNamespace {
  const map = new Map<string, string>();
  return {
    map,
    async get(key: string) {
      return map.get(key) ?? null;
    },
    async put(key: string, value: string) {
      map.set(key, value);
    },
    async delete(key: string) {
      map.delete(key);
    },
  } as unknown as KVNamespace;
}

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: {} as Fetcher,
    ARB_DATA: fakeKv(),
    ENVIRONMENT: "test",
    ...overrides,
  } as Env;
}

function route(url: string, payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
    ...(url.includes("binance") ? {} : {}),
  });
}

function env0(): Env {
  return makeEnv();
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockMarkets(bithumbPrices: Record<string, number>, binancePrices: Record<string, number>, fx = 1400) {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("api.bithumb.com/v1/ticker")) {
      const markets = new URL(url).searchParams.get("markets") ?? "";
      const items = markets.split(",").map((m) => ({
        market: m,
        trade_price: bithumbPrices[m] ?? 0,
      }));
      return route(url, items);
    }
    if (url.includes("binance.vision") || url.includes("binance.com")) {
      const raw = new URL(url).searchParams.get("symbols") ?? "[]";
      const symbols = JSON.parse(raw) as string[];
      const items = symbols.map((s) => ({ symbol: s, price: String(binancePrices[s] ?? 0) }));
      return route(url, items);
    }
    if (url.includes("dunamu.com")) {
      return route(url, [{ code: "FRX.KRWUSD", basePrice: fx }]);
    }
    if (url.includes("api.telegram.org")) {
      return route(url, { ok: true });
    }
    throw new Error("unexpected fetch: " + url);
  });
}

describe("runArbitrageScan", () => {
  it("정상 파이프라인: 가격·프리미엄 계산 및 스냅샷 저장", async () => {
    // BTC 프리미엄 +2% (빗썸 102,000,000 vs 바이낸스 100,000,000원 환산)
    const binanceUsdt: Record<string, number> = { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 };
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      binanceUsdt
    );

    const env = makeEnv();
    const result = await runArbitrageScan(env);

    expect(result.ok).toBe(true);
    expect(result.usdKrw).toBe(1400);
    expect(result.fxSource).toBe("bithumb-usdt");
    expect(result.prices.length).toBe(4);

    const btc = result.prices.find((p) => p.coin === "BTC")!;
    expect(btc.binanceUsdt).toBeCloseTo(71428.57);
    expect(btc.binanceKrw).toBeCloseTo(71428.57 * 1400);
    expect(btc.premiumPct).toBeCloseTo(2.0, 1);

    // 임계값 1.5% 초과 → BTC 시그널 + 알림 발송
    const btcSignal = result.signals.find((s) => s.coin === "BTC")!;
    expect(btcSignal.action).toBe("BITHUMB_SELL");
    expect(result.alertsSent).toBe(0); // TELEGRAM 미설정 시 알림 없음
  });

  it("텔레그램 설정 시 트리거 알림 발송", async () => {
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const env = makeEnv({
      TELEGRAM_BOT_TOKEN: "bot123",
      TELEGRAM_CHAT_ID: "chat123",
    });
    const result = await runArbitrageScan(env);
    expect(result.alertsSent).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("api.telegram.org"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("동일 상태 유지 시 재알림 없음 (히스테리시스)", async () => {
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const env = makeEnv({ TELEGRAM_BOT_TOKEN: "bot123", TELEGRAM_CHAT_ID: "chat123" });
    const first = await runArbitrageScan(env);
    expect(first.alertsSent).toBe(1);

    // 두 번째 스캔: 동일 상태 유지 → 알림 없음 (트리거 아님)
    const second = await runArbitrageScan(env);
    expect(second.alertsSent).toBe(0);
  });

  it("발송 성공 시 lastAlertAt 을 KV 에 기록한다 (쿨다운 기준점)", async () => {
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const kv = fakeKv();
    const env = makeEnv({ ARB_DATA: kv, TELEGRAM_BOT_TOKEN: "bot123", TELEGRAM_CHAT_ID: "chat123" });
    const result = await runArbitrageScan(env);
    expect(result.alertsSent).toBe(1);

    const states = JSON.parse((await kv.get("state:alerts")) as string);
    expect(states.BTC.action).toBe("BITHUMB_SELL");
    // 예전에는 lastAlertAt 이 영원히 0 이라 30분 쿨다운이 아무 일도 하지 않았다.
    expect(states.BTC.lastAlertAt).toBe(result.fetchedAtMs);
  });

  it("반대 방향으로 뒤집히면 쿨다운 이내에는 알림을 억제한다", async () => {
    const kv = fakeKv();
    const env = makeEnv({ ARB_DATA: kv, TELEGRAM_BOT_TOKEN: "bot123", TELEGRAM_CHAT_ID: "chat123" });

    // 1) +2% → BITHUMB_SELL 알림 발송
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    expect((await runArbitrageScan(env)).alertsSent).toBe(1);

    // 2) -2% 로 반전 → 방향은 즉시 뒤집히지만 쿨다운(30분) 이내라 알림은 없다
    mockMarkets(
      { "KRW-BTC": 98_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const flipped = await runArbitrageScan(env);
    const btc = flipped.signals.find((s) => s.coin === "BTC")!;
    expect(btc.action).toBe("BITHUMB_BUY");
    expect(btc.triggered).toBe(true);
    expect(flipped.alertsSent).toBe(0);
  });

  it("한 거래소 시세가 빠져도 나머지 코인은 계속 계산한다", async () => {
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 }, // ETH 누락(0)
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const result = await runArbitrageScan(env0());
    expect(result.ok).toBe(true);
    const eth = result.prices.find((p) => p.coin === "ETH")!;
    // KV 는 JSON 이라 NaN 을 저장할 수 없다 → 처음부터 null 로 표현한다
    expect(eth.premiumPct).toBeNull();
    expect(eth.netPct).toBeNull();
    expect(result.signals.some((s) => s.coin === "ETH")).toBe(false);
    expect(result.signals.some((s) => s.coin === "BTC")).toBe(true);
  });

  it("스냅샷은 JSON 라운드트립 후에도 값이 보존된다 (NaN 미사용)", async () => {
    mockMarkets(
      { "KRW-BTC": 102_000_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const kv = fakeKv();
    const result = await runArbitrageScan(makeEnv({ ARB_DATA: kv }));
    const stored = JSON.parse((await kv.get("snapshot:latest")) as string);
    expect(stored.prices).toEqual(result.prices);
  });

  it("프리미엄이 임계값 미만이면 NEUTRAL", async () => {
    mockMarkets(
      { "KRW-BTC": 100_500_000, "KRW-ETH": 4_900_000, "KRW-SOL": 210_000, "KRW-XRP": 700, "KRW-USDT": 1400 },
      { BTCUSDT: 71428.57, ETHUSDT: 3500, SOLUSDT: 150, XRPUSDT: 0.5 }
    );
    const env = makeEnv();
    const result = await runArbitrageScan(env);
    const btc = result.signals.find((s) => s.coin === "BTC")!;
    expect(btc.action).toBe("NEUTRAL");
  });

  it("업스트림 오류 시 ok:false + error", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const env = makeEnv();
    const result = await runArbitrageScan(env);
    expect(result.ok).toBe(false);
    // 어떤 업스트림이 먼저 거부되는지는 구현 세부사항이므로 메시지 문자열에 고정하지 않는다
    expect(result.error).toBeTruthy();
    expect(result.prices).toEqual([]);
  });

  it("바이낸스 폴백 호스트 사용", async () => {
    const calls: string[] = [];
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("bithumb")) {
        return route(url, [{ market: "KRW-BTC", trade_price: 100_000_000 }]);
      }
      if (url.includes("dunamu")) {
        return route(url, [{ code: "FRX.KRWUSD", basePrice: 1400 }]);
      }
      if (url.includes("binance.com") && !url.includes("vision")) {
        return new Response("blocked", { status: 451 });
      }
      if (url.includes("binance.vision")) {
        return route(url, [{ symbol: "BTCUSDT", price: "71428.57" }]);
      }
      throw new Error("unexpected: " + url);
    });
    const env = makeEnv();
    const result = await runArbitrageScan(env);
    expect(result.ok).toBe(true);
    expect(calls.some((c) => c.includes("data-api.binance.vision"))).toBe(true);
  });
});

describe("signalsFromSnapshot", () => {
  it("스냅샷 없으면 빈 배열", () => {
    expect(signalsFromSnapshot(null, 1.5)).toEqual([]);
  });

  it("스냅샷 프리미엄으로 시그널 재구성", () => {
    const snapshot: Snapshot = {
      fetchedAt: new Date(0).toISOString(),
      fetchedAtMs: 0,
      usdKrw: 1400,
      fxSource: "dunamu",
      prices: [
        {
          coin: "BTC",
          bithumbKrw: 102_000_000,
          binanceUsdt: 70000,
          binanceKrw: 98_000_000,
          premiumPct: 4.08,
          spreadKrw: 4_000_000,
          netPct: 3.9,
        },
      ],
    };
    const signals = signalsFromSnapshot(snapshot, configFromVars({}).signalThresholdPct);
    expect(signals[0].action).toBe("BITHUMB_SELL");
  });
});
