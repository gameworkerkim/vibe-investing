import { describe, expect, it } from "vitest";
import {
  Store,
  kvStore,
  loadAlertStates,
  loadHistory,
  loadSnapshot,
  saveAlertStates,
  saveSnapshot,
} from "../worker/src/storage";
import { Snapshot } from "../worker/src/types";

function fakeKv(): KVNamespace & { map: Map<string, string> } {
  const map = new Map<string, string>();
  const kv = {
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
  } as unknown as KVNamespace & { map: Map<string, string> };
  return kv;
}

function snapshot(fetchedAtMs: number, premiums: Record<string, number>): Snapshot {
  return {
    fetchedAt: new Date(fetchedAtMs).toISOString(),
    fetchedAtMs,
    usdKrw: 1400,
    fxSource: "dunamu",
    prices: Object.entries(premiums).map(([coin, premiumPct]) => ({
      coin: coin as Snapshot["prices"][number]["coin"],
      bithumbKrw: 100_000_000 + premiumPct * 1_000_000,
      binanceUsdt: 70_000,
      binanceKrw: 98_000_000,
      premiumPct,
      spreadKrw: premiumPct * 1_000_000,
      netPct: premiumPct - 1,
    })),
  };
}

describe("kvStore", () => {
  it("JSON 읽기/쓰기 라운드트립", async () => {
    const store: Store = kvStore(fakeKv());
    await store.writeJson("a/b", { hello: "world" });
    expect(await store.readJson<{ hello: string }>("a/b")).toEqual({ hello: "world" });
    expect(await store.readJson<unknown>("missing")).toBeNull();
  });

  it("snapshot 저장·로드", async () => {
    const store: Store = kvStore(fakeKv());
    const snap = snapshot(1000, { BTC: 1.2 });
    await saveSnapshot(store, snap);
    expect(await loadSnapshot(store)).toEqual(snap);
  });

  it("history 는 최근 N개만 유지", async () => {
    const store: Store = kvStore(fakeKv());
    for (let i = 0; i < 60; i++) {
      await saveSnapshot(store, snapshot(i, { BTC: i }), 48);
    }
    const history = await loadHistory(store);
    expect(history.length).toBe(48);
    expect(history[0].t).toBe(12);
    expect(history[47].t).toBe(59);
  });

  it("alert states 저장·로드", async () => {
    const store: Store = kvStore(fakeKv());
    await saveAlertStates(store, { BTC: { action: "BITHUMB_SELL", since: 1, lastAlertAt: 1 } });
    const states = await loadAlertStates(store);
    expect(states.BTC?.action).toBe("BITHUMB_SELL");
    expect(await loadAlertStates(kvStore(fakeKv()))).toEqual({});
  });
});
