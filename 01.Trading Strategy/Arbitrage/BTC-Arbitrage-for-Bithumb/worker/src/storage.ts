import { AlertStateMap, Snapshot } from "./types";

/**
 * KV 네임스페이스 레이어.
 * 스냅샷 최신본 + 최근 히스토리 + 코인별 알림 상태를 저장한다.
 */
const KEY_SNAPSHOT = "snapshot:latest";
const KEY_HISTORY = "snapshot:history";
const KEY_ALERT_STATE = "state:alerts";
const DEFAULT_HISTORY_SIZE = 48; // 5분 간격 → 약 4시간 분량

export interface HistoryPoint {
  t: number;
  p: Record<string, number>; // coin → premiumPct
}

export interface Store {
  readJson: <T>(key: string) => Promise<T | null>;
  writeJson: (key: string, value: unknown) => Promise<void>;
}

export function kvStore(kv: KVNamespace): Store {
  return {
    async readJson<T>(key: string): Promise<T | null> {
      const raw = await kv.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    async writeJson(key: string, value: unknown): Promise<void> {
      await kv.put(key, JSON.stringify(value));
    },
  };
}

export async function loadSnapshot(store: Store): Promise<Snapshot | null> {
  return store.readJson<Snapshot>(KEY_SNAPSHOT);
}

export async function saveSnapshot(
  store: Store,
  snapshot: Snapshot,
  historySize = DEFAULT_HISTORY_SIZE
): Promise<void> {
  await store.writeJson(KEY_SNAPSHOT, snapshot);

  const history = (await store.readJson<HistoryPoint[]>(KEY_HISTORY)) ?? [];
  const point: HistoryPoint = {
    t: snapshot.fetchedAtMs,
    p: Object.fromEntries(snapshot.prices.map((x) => [x.coin, x.premiumPct])),
  };
  history.push(point);
  while (history.length > historySize) history.shift();
  await store.writeJson(KEY_HISTORY, history);
}

export async function loadHistory(store: Store): Promise<HistoryPoint[]> {
  return (await store.readJson<HistoryPoint[]>(KEY_HISTORY)) ?? [];
}

export async function loadAlertStates(store: Store): Promise<AlertStateMap> {
  return (await store.readJson<AlertStateMap>(KEY_ALERT_STATE)) ?? {};
}

export async function saveAlertStates(store: Store, states: AlertStateMap): Promise<void> {
  await store.writeJson(KEY_ALERT_STATE, states);
}
