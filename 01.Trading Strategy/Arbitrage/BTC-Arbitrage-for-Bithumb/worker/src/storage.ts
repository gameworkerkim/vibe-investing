import { AlertStateMap, MaybeNumber, Snapshot } from "./types";

/**
 * KV 네임스페이스 레이어.
 * 스냅샷 최신본 + 최근 히스토리 + 코인별 알림 상태를 저장한다.
 *
 * KV 쓰기 예산 주의: 무료 플랜은 하루 1,000 write 다.
 * 5분 크론 = 288 스캔/일 이므로 스캔당 쓰기를 3회로 두면 864 write/일 로
 * 한도에 거의 붙는다. 그래서 알림 상태는 **바뀐 경우에만** 저장한다.
 */
const KEY_SNAPSHOT = "snapshot:latest";
const KEY_HISTORY = "snapshot:history";
const KEY_ALERT_STATE = "state:alerts";
const DEFAULT_HISTORY_SIZE = 48; // 5분 간격 → 약 4시간 분량

export interface HistoryPoint {
  t: number;
  p: Record<string, MaybeNumber>; // coin → premiumPct
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
  const history = (await store.readJson<HistoryPoint[]>(KEY_HISTORY)) ?? [];
  const point: HistoryPoint = {
    t: snapshot.fetchedAtMs,
    p: Object.fromEntries(snapshot.prices.map((x) => [x.coin, x.premiumPct])),
  };
  history.push(point);
  // 히스토리 크기 축소(설정 변경)에도 대응하도록 뒤에서 historySize 개만 남긴다.
  const trimmed = history.length > historySize ? history.slice(-historySize) : history;

  await Promise.all([
    store.writeJson(KEY_SNAPSHOT, snapshot),
    store.writeJson(KEY_HISTORY, trimmed),
  ]);
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

/**
 * 알림 상태가 실제로 바뀌었을 때만 KV 에 쓴다 (쓰기 예산 절약).
 * 대부분의 스캔은 전 코인 NEUTRAL 유지라 쓰기가 발생하지 않는다.
 * @returns 실제로 저장했으면 true
 */
export async function saveAlertStatesIfChanged(
  store: Store,
  prev: AlertStateMap,
  next: AlertStateMap
): Promise<boolean> {
  if (JSON.stringify(prev) === JSON.stringify(next)) return false;
  await saveAlertStates(store, next);
  return true;
}
