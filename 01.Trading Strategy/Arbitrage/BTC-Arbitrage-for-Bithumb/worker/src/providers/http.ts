/**
 * 업스트림 공개 API 공용 HTTP 헬퍼.
 *
 * - 타임아웃: Worker 의 cron 은 여러 업스트림을 동시에 부르므로, 한 곳이 멈추면
 *   스캔 전체가 지연된다. 모든 호출에 AbortSignal 타임아웃을 건다.
 * - User-Agent: 일부 공개 API 는 UA 없는 요청을 차단한다.
 */
export const DEFAULT_TIMEOUT_MS = 8_000;

const USER_AGENT = "bithumb-arbitrage-signals/0.1 (+research)";

export async function fetchJson<T>(
  url: string,
  label: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`${label} http ${res.status}`);
  return (await res.json()) as T;
}
