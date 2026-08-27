import { describe, expect, it } from "vitest";
import { handleApi } from "../worker/src/api";
import { Env } from "../worker/src/env";
import { Snapshot } from "../worker/src/types";

function fakeKv(seed: Record<string, unknown> = {}): KVNamespace {
  const map = new Map<string, string>(
    Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)])
  );
  return {
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

const snapshot: Snapshot = {
  fetchedAt: new Date(1000).toISOString(),
  fetchedAtMs: 1000,
  usdKrw: 1400,
  fxSource: "bithumb-usdt",
  prices: [
    {
      coin: "BTC",
      bithumbKrw: 102_000_000,
      binanceUsdt: 71_428.57,
      binanceKrw: 100_000_000,
      premiumPct: 2,
      spreadKrw: 2_000_000,
      netPct: 1.72,
    },
    {
      coin: "ETH",
      bithumbKrw: null,
      binanceUsdt: null,
      binanceKrw: null,
      premiumPct: null,
      spreadKrw: null,
      netPct: null,
    },
  ],
};

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: {} as Fetcher,
    ARB_DATA: fakeKv({ "snapshot:latest": snapshot }),
    ...overrides,
  } as Env;
}

const get = (path: string, init?: RequestInit) =>
  new Request("https://example.com" + path, init);

describe("GET /api/status", () => {
  it("스냅샷과 함께 임계값을 내려준다 (대시보드 시그널 판정에 필요)", async () => {
    const res = await handleApi(get("/api/status"), makeEnv());
    const body = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(body.thresholdPct).toBe(1.5);
    expect(body.fxMode).toBe("usdt");
    expect((body.snapshot as Snapshot).prices.length).toBe(2);
  });

  it("엣지만 캐시하고 브라우저는 매번 재검증한다", async () => {
    const res = await handleApi(get("/api/status"), makeEnv());
    const cc = res.headers.get("Cache-Control") ?? "";
    expect(cc).toContain("s-maxage=240");
    // max-age=0 이 없으면 브라우저가 휴리스틱으로 캐시해 대시보드가 옛 데이터를 보여준다
    expect(cc).toContain("max-age=0");
  });
});

describe("GET /api/signals", () => {
  it("시세가 없는 코인은 시그널에서 제외", async () => {
    const res = await handleApi(get("/api/signals"), makeEnv());
    const body = (await res.json()) as { signals: Array<{ coin: string; action: string }> };
    expect(body.signals.map((s) => s.coin)).toEqual(["BTC"]);
    expect(body.signals[0].action).toBe("BITHUMB_SELL");
  });
});

describe("관리 API 인증", () => {
  it("ADMIN_TOKEN 미설정이면 항상 401", async () => {
    const res = await handleApi(get("/api/refresh?token=anything"), makeEnv());
    expect(res.status).toBe(401);
  });

  it("틀린 토큰은 401", async () => {
    const env = makeEnv({ ADMIN_TOKEN: "secret" });
    expect((await handleApi(get("/api/refresh?token=wrong"), env)).status).toBe(401);
    expect(
      (await handleApi(get("/api/refresh", { headers: { authorization: "Bearer wrong" } }), env))
        .status
    ).toBe(401);
  });

  it("오류 응답은 캐시하지 않는다", async () => {
    const res = await handleApi(get("/api/refresh?token=wrong"), makeEnv({ ADMIN_TOKEN: "s" }));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("텔레그램 미설정 시 503 (인증은 통과)", async () => {
    const env = makeEnv({ ADMIN_TOKEN: "secret" });
    const res = await handleApi(
      get("/api/telegram/test", { headers: { authorization: "Bearer secret" } }),
      env
    );
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("알 수 없는 경로", () => {
  it("404 JSON", async () => {
    const res = await handleApi(get("/api/nope"), makeEnv());
    expect(res.status).toBe(404);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
