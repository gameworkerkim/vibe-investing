# 기술 검토: VibeQuant 백엔드 Cloudflare 이전 (Workers / Pages / D1 / R2 / KV) (한국어)

> **폐기(대체) (2026-07-19):** 주 플랫폼 결정은 **Cloudflare Free + Pyodide 웹뷰**
> (시세=CF, 퀀트 계산=브라우저 WASM). 규범 문서는
> [ARCHITECTURE_TARGET_KR.md](ARCHITECTURE_TARGET_KR.md),
> [LIMITATIONS_KR.md](LIMITATIONS_KR.md), [../ROADMAP_KR.md](../ROADMAP_KR.md).
> 이 파일은 과거 분석용으로만 유지.
> 참고: 아래 일부 CPU 서술은 `fetch` 대기를 CPU로 취급한 오해가 있을 수 있음.
> I/O 대기는 보통 CPU에 안 잡히지만, Free **CPU 10ms**는 파싱/Cron을 여전히 제약함.

**날짜:** 2026-07-19
**범위:** `VibeQuant/backend/`를 Vercel+Neon+Upstash에서 Cloudflare Workers+Pages+D1+R2+KV로 이전
**결론:** 부분 가능 — 백그라운드 작업 권장, 전체 이전은 차단

## 1. 요약 비교

| 구성요소 | 현재 스택 | Cloudflare 대체 | 호환성 |
|---|---|---|---|
| 서버리스 컴퓨트 | Vercel (Express) | Workers / Pages Functions | Express 코드를 Hono/itty-router로 재작성 필요 |
| 관계형 DB | Neon PostgreSQL | D1 (SQLite) | 스키마 포팅 가능; TimescaleDB 없음, JSONB 인덱스 없음, 단일 스레드 |
| 캐시 + 속도 제한 | Upstash Redis | KV (캐시) + Durable Objects (속도 제한) | KV는 최종 일관성; Durable Objects 작동하나 더 복잡 |
| 객체 저장소 | N/A (미사용) | R2 | 최고 수준: 무료 이그레스, S3 API |
| 정적 호스팅 | Vercel | Pages | 드롭인 호환 |
| 백그라운드 크론 | Vercel cron (6h 최소) | Workers Cron Triggers (1분 최소) | 더 나은 세분성 |
| 비동기 큐 | N/A | Queues | 새로운 기능 |
| CDN | Vercel Edge | Cloudflare CDN (글로벌, 330+ 도시) | 우수한 커버리지 |

## 2. Vercel → Cloudflare 직접 이전 분석

### 2.1 Express → Workers 이전

Workers는 **Web Fetch API**를 사용합니다 — Express 미들웨어, `app.use()`, `app.listen()`은 Workers 런타임에 존재하지 않습니다. `backend/src/index.ts` 전체를 Workers 호환 프레임워크로 재작성해야 합니다.

| 현재 (Express) | Cloudflare (Workers) | 이전 노력 |
|---|---|---|
| `app.use(helmet())` | 수동 헤더 설정 또는 `hono/secure-headers` | 낮음 |
| `app.use(cors())` | `hono/cors` 또는 수동 헤더 | 낮음 |
| `app.get('/api/...', handler)` | `app.get('/api/...', handler)` in Hono | 중간 |
| `app.listen(8080)` | `export default app` (fetch export) | 낮음 |
| Express 미들웨어 체인 | Hono 미들웨어 (유사 패턴) | 중간 |
| Route params `:provider/:symbol` | Hono에서 동일 | 낮음 |
| Rate limiter (`@upstash/ratelimit`) | Durable Objects (재작성 필요) | **높음** |
| `@neondatabase/serverless` | `@libsql/client` 또는 D1 바인딩 | 중간 |
| `yahoo-finance2` (npm) | Workers에서 작동하지 않을 수 있음 (128MB, 10ms 무료 CPU) | **높음** |

### 2.2 런타임 제약 (치명적)

Workers 무료 티어는 데이터 가져오기 백엔드에 심각한 제한이 있습니다:

| 제한 | 값 | 영향 |
|---|---|---|
| **요청당 CPU 시간** | 10 ms | Yahoo Finance HTTP 호출만 200-500ms 소요 — **무료 티어에서 불가능** |
| **메모리** | 128 MB | `yahoo-finance2` + 결과 데이터는 적합할 수 있으나 빡빡함 |
| **호출당 서브요청** | 50 | 각 외부 API 호출이 카운트; TOSS 캔들 페이지네이션이 이 제한에 도달 가능 |
| **Worker 번들 크기** | 3 MB | `yahoo-finance2` 패키지만 ~1.5 MB — 빡빡함 |

**판정:** 무료 티어 Workers는 외부 API로 아웃바운드 HTTP 호출을 하는 **데이터 가져오기 백엔드를 실행할 수 없습니다**. 10ms CPU 제한은 사실적인 API 호출을 불가능하게 만듭니다. Workers Paid(30s wall time, 30ms CPU)조차도 Yahoo Finance 과거 데이터 가져오기에는 빡빡합니다.

### 2.3 Neon PostgreSQL → D1 이전

D1은 SQLite이며 PostgreSQL이 아닙니다. 주요 차이점:

| 기능 | Neon (PostgreSQL) | D1 (SQLite) | 상태 |
|---|---|---|---|
| JSONB 컬럼 타입 | 네이티브, GIN 인덱스 | JSON을 TEXT로 저장, 인덱스 지원 없음 | **손실** — JSON 쿼리 훨씬 느림 |
| TimescaleDB 확장 | 지원됨 | 사용 불가 | **손실** — 시계열 하이퍼테이블 없음 |
| BRIN 인덱스 | 지원됨 | 사용 불가 | **손실** |
| 동시 읽기 | 완전 MVCC | 단일 작성자, 읽기 진행 가능 | 저하됨 (단일 스레드) |
| `INSERT ... ON CONFLICT` | 완전 upsert | `INSERT ... ON CONFLICT` 지원 | 호환 |
| 커넥션 풀링 | PgBouncer 포함 | HTTP 기반, 풀링 불필요 | 더 나음 (단순) |
| 스키마 마이그레이션 | Drizzle Kit | Drizzle Kit (동일) | **호환** |
| 저장 제한 | 0.5 GB 무료 | DB당 500 MB 무료 (총 5 GB) | 유사 |
| 행 읽기/쓰기 | 무제한 무료 (CU-hrs 모델) | 5M 읽기/일, 100K 쓰기/일 | Neon 무료와 비슷 |

**판정:** D1은 현재 `market_assets` + `market_candles` 테이블을 Neon 대체할 수 있으나 JSONB GIN 인덱스와 TimescaleDB를 잃습니다. 저용량 시계열(< 5M 읽기/일)에 D1은 적합합니다. Drizzle 스키마는 최소한의 변경으로 포팅 가능합니다 (`pg-core`를 `sqlite-core`로 교체).

### 2.4 Upstash Redis → KV + Durable Objects

**캐시 레이어 (KV):**

| 기능 | Upstash Redis | Cloudflare KV | 비고 |
|---|---|---|---|
| 강한 일관성 | 예 | **아니오** (최종 일관성) | KV는 최대 60초까지 오래된 데이터 반환 가능 |
| 캐시 TTL | 모든 값 | **최소 30초** | 단기 캐시 불가 |
| 원자적 연산 | INCR, DECR, SETNX | 없음 | 카운터 없음 |
| 리스트 연산 | LRANGE, RPUSH | 없음 | 리스트 데이터 구조 없음 |
| 키 크기 | 무제한 | 512 바이트 | 복합 키에 빡빡함 |
| 무료 읽기/쓰기 | 500K/월 | 100K 읽기/일, 1K 쓰기/일 | KV 읽기가 더 관대함 |

**속도 제한 (Durable Objects):**

Durable Objects는 원자적 카운터로 `@upstash/ratelimit`을 대체할 수 있으나 상당한 코드 변경이 필요합니다. 각 속도 제한 라우트마다 DO 클래스가 필요합니다:

```typescript
// Durable Object 속도 제한 (의사 코드)
export class RateLimiter extends DurableObject {
  async fetch(request: Request) {
    const ip = request.headers.get('cf-connecting-ip');
    const key = `rate:${ip}`;
    let count = (await this.ctx.storage.get(key)) || 0;
    if (count >= 10) return new Response('429', { status: 429 });
    await this.ctx.storage.put(key, count + 1);
    return new Response('ok');
  }
}
```

**판정:** KV는 캐싱용으로 Upstash Redis를 대체할 수 없습니다 (최종 일관성, 30초 최소 TTL). Durable Objects는 속도 제한을 대체할 수 있으나 코드 복잡성이 증가합니다. **Upstash Redis가 이 사용 사례에 우수합니다.**

### 2.5 R2 (객체 저장소) — 새로운 기능

R2는 순이득입니다. 아직 구현되지 않았으나 활성화된 사용 사례:

| 사용 사례 | 이점 |
|---|---|
| 캐시된 OHLCV CSV/Parquet 파일 | 무료 저장 + 무료 이그레스 |
| 백테스트 결과 아티팩트 | DB 대신 R2에 저장 및 서빙 |
| 노트북 HTML 내보내기 | Pages를 통해 R2에서 게시 |
| 과거 분석용 데이터 레이크 | 10 GB 무료 저장 |

**판정:** R2는 이 프로젝트에 가장 강력한 Cloudflare 제품입니다. 추가 서비스 없이 Vercel 스택에 동등한 기능이 없습니다.

## 3. 권장 아키텍처 — Cloudflare

Workers 무료 티어 CPU 제한으로 인해 **직접 이전은 차단됩니다**. 권장 아키텍처는 **하이브리드**입니다:

### 옵션 A: Cloudflare를 백그라운드 데이터 레이어로 (권장)

```
┌────────────────────────────────────────────────────────────────┐
│  Vercel (프론트엔드 + API)       Cloudflare (백그라운드 데이터)  │
│                                                                │
│  Node.js Backend (:8080)        Workers Cron (5분마다)          │
│  │                              │                               │
│  │  GET /api/v1/candles         │  Yahoo/TOSS 데이터 가져오기    │
│  │  (캐시에서 읽기)              │  D1 + R2에 저장               │
│  │                              │  KV 캐시 갱신                 │
│  │                              │                               │
│  Upstash Redis                 D1 (SQLite)                     │
│  (핫 캐시, 속도 제한)            └ market_candles (시계열)      │
│                                R2 (Parquet/CSV)                │
│                                └ 콜드 저장 + 대량 내보내기      │
│                                KV (최종 일관성 캐시)            │
│                                └ 사전 계산된 대시보드            │
└────────────────────────────────────────────────────────────────┘
```

- **Vercel**은 실시간 API 제공 계속 (Express, 저지연, Upstash Redis)
- **Cloudflare Workers**는 5분마다 크론 작업 실행, Yahoo/TOSS 데이터 사전 가져오기
- **D1**은 분석 쿼리용 과거 시계열 저장
- **R2**는 대량 내보내기 파일 저장 (Parquet/CSV)
- **KV**는 최종 일관성으로 사전 계산된 대시보드 집계 제공

### 옵션 B: 전체 이전 (Workers Paid 필요, $5/월)

Workers Paid가 허용된다면 ($5/월로 10M 요청, 30s wall time, 30ms CPU 잠금 해제):

- Express를 **Hono**로 교체 (Express 유사 API, Workers 네이티브)
- Neon을 **D1**으로 교체 (저용량 시계열에 허용 가능)
- 캐싱용 Upstash Redis 유지 (KV는 현재 사용량에서 대체 불가)
- 객체 저장용 **R2** 추가
- 속도 제한용 **Durable Objects** 사용
- 더 긴 타임아웃으로 Workers에서 TOSS/Yahoo 가져오기 유지

```typescript
// Workers의 Hono (Express 대체)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/*', cors());
app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.get('/api/v1/candles/:provider/:symbol', async (c) => {
  // D1 + R2 캐시에서 가져오기
  return c.json({ ... });
});

export default app;
```

### 옵션 C: Pages Functions + D1 + R2 (가장 단순)

대시보드 전용 사용 사례 (전체 데이터 가져오기 백엔드가 아닌 경우):

- **Pages**가 대시보드 정적 프론트엔드 + API 함수 호스팅
- **D1**이 사용자 관심종목, 설정 저장
- **R2**가 별도 Worker 크론으로 가져온 캐시된 CSV 데이터 저장
- 데이터 가져오기 Worker(옵션 A)가 D1 + R2 사전 채우기

이 방식은 무거운 데이터 가져오기를 유료 Worker 티어로 이동하여 10ms CPU 제한을 회피합니다 (또는 API용 Vercel 유지).

## 4. 비용 비교 (규모별)

| 월간 사용량 | Vercel+Neon+Upstash | Cloudflare 올프리 | Cloudflare Workers Paid |
|---|---|---|---|
| 1만 API 호출/일 | $0 | $0 | $5 |
| 10만 API 호출/일 | $0 ($20 Vercel Pro) | N/A (무료 초과) | $5 + 초과분 (~$0.30/백만) |
| 5 GB DB 저장 | $0 (Neon 무료) 또는 $1.75 | $0 (D1 무료) | $0 (포함) |
| 50만 Redis ops | $0 | N/A (KV 10만 읽기/일) | N/A |
| 50 GB 이그레스/월 | $0 (Vercel) 또는 $4.50 (Neon) | $0 | $0 |
| 크론 세분성 | 6시간 최소 (Vercel) | 1분 최소 | 1분 최소 |
| **최적 적합** | 실시간 API + 캐시 | 백그라운드 데이터 + 저장 | 전체 백엔드 이전 |

## 5. 결정 매트릭스

| 요구사항 | Vercel+Neon+Upstash | Cloudflare 무료 | Cloudflare 유료 ($5/월) |
|---|---|---|---|
| 실시간 OHLCV API | 우수 | **차단됨** (10ms CPU) | 양호 (Hono + D1) |
| 속도 제한 | Upstash (원자적) | Durable Objects (복잡) | Durable Objects |
| 강한 일관성 캐시 | Upstash Redis | **사용 불가** (KV는 최종) | **사용 불가** (여전히 KV) |
| 시계열 DB | Neon (TimescaleDB) | D1 (기본 SQLite) | D1 (기본 SQLite) |
| JSON 쿼리 | PostgreSQL JSONB + GIN | TEXT만, 인덱스 없음 | TEXT만, 인덱스 없음 |
| 객체 저장 | 사용 안 함 | R2 (우수, 무료 이그레스) | R2 (우수) |
| 크론 세분성 | 6시간 최소 | 1분 | 1분 |
| 백그라운드 데이터 가져오기 | 동일 프로세스 | **차단됨** (10ms CPU) | Workers Paid (30ms CPU) |
| npm 생태계 지원 | 완전 Node.js | Workers 서브셋 | Workers 서브셋 |
| 규모별 이그레스 비용 | $$$ (Neon, Vercel 초과분) | 무료 | 무료 |

## 6. 권장사항

**데이터 API용 현재 Vercel+Neon+Upstash 스택을 유지하세요.** 더 단순하고, 이미 구축되어 있으며, 실시간 쿼리를 잘 처리합니다.

**Cloudflare 추가 용도:**

1. **D1** — 콜드/과거 시계열 저장 (크론으로 채움, 실시간 아님)
2. **R2** — 대량 데이터 저장 (백테스트 결과, CSV 내보내기, Parquet 파일) — 무료 이그레스가 주요 장점
3. **Workers Cron** — 백그라운드 데이터 사전 가져오기 (Vercel의 6시간 최소 대신 5분마다)
4. **Pages** — UI를 API에서 분리하려는 경우 정적 대시보드 프론트엔드 옵션

**Cloudflare Workers 무료 티어로의 전체 이전은 시도하지 마세요.** 10ms CPU 제한은 데이터 가져오기 백엔드 실행을 불가능하게 만듭니다. Workers Paid조차도 200-500ms가 일상적인 `yahoo-finance2` HTTP 호출에 어려움을 겪을 수 있습니다.

## 7. 조치 항목 (하이브리드 옵션 A)

| # | 조치 | 서비스 |
|---|---|---|
| 1 | 크론 기반 데이터 가져오기용 Cloudflare Worker 생성 | Workers |
| 2 | `market_assets` + `market_candles`에 맞는 D1 스키마 생성 (Drizzle SQLite 방언) | D1 |
| 3 | Parquet/CSV 내보내기용 R2 버킷 추가 | R2 |
| 4 | Worker 크론: 5분마다 Yahoo/TOSS 데이터 가져오기 → D1 + R2에 저장 → KV 갱신 | Workers Cron |
| 5 | Vercel Express 백엔드는 실시간 API용으로 유지 (Upstash Redis에서 읽기) | Vercel |
| 6 | 대시보드는 KV에서 사전 계산된 집계 읽기 (대시보드에는 최종 일관성 허용) | KV |
