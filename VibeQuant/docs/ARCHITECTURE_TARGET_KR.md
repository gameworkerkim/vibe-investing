# 목표 아키텍처 — Cloudflare Free + Pyodide 웹뷰

**상태:** 신규 개발 규범 (2026-07-19)  
**대체:** 주 플랫폼으로서의 멀티 SaaS(Vercel + Neon + Upstash) 계획  
**관련:** [LIMITATIONS_KR.md](LIMITATIONS_KR.md) · [ROADMAP_KR.md](../ROADMAP_KR.md)

## 1. 목표

| 목표 | 구현 |
|---|---|
| GS Quant 대체 (API 레벨) | 로컬 `vi_quant` + 브라우저 얇은 서브셋 `vi_browser` |
| 대시보드 스크립트 검증 | Pages 웹뷰 + Pyodide가 사용자 Python 실행 |
| 시세 | Cloudflare Worker + D1 + R2 + Cache/CDN |
| 비용 | **Cloudflare 무료 티어 우선** |

## 2. 런타임 분리 (타협 불가)

```
사용자 브라우저
  ├─ Pages UI (에디터, 차트)
  └─ Pyodide WASM
        ├─ 사용자 퀀트 스크립트
        ├─ vi_browser (얇은 SDK)
        └─ fetch ──► Worker API ──► Cache / D1 / R2
                                      │
                                      └─ Yahoo (이후 TOSS) ingest
```

- 사용자 Python을 Worker에서 **절대 실행하지 않음**.
- TOSS/`API_KEY` 시크릿을 브라우저 번들에 **넣지 않음**.
- 로컬 `pip install vi_quant`는 헤비 연구용이며 대시보드 경로가 아님.

## 3. 바인딩 (`wrangler.toml` 스케치)

```toml
name = "vibequant-api"
main = "src/index.ts"
compatibility_date = "2026-07-01"

[[d1_databases]]
binding = "DB"
database_name = "vibequant"
database_id = "<id>"

[[r2_buckets]]
binding = "DATA"
bucket_name = "vibequant-data"

[triggers]
crons = ["0 8 * * *"]   # UTC 하루 1회; 작업 최소화 (CPU 10ms)

[vars]
DEFAULT_PROVIDER = "yahoo"
```

Pages가 웹뷰를 호스팅하고 `/api/*`를 Worker로 라우팅 (또는 Pages Functions 얇은 프록시).

무료에서는 KV보다 **Cache API 우선** (KV 쓰기 ~1천/일로 빡셈).

## 4. D1 스키마 (인덱스만)

캔들 **본체는 R2**. D1은 메타와 오브젝트 포인터만.

```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_assets_ps ON assets(provider, symbol);

CREATE TABLE candle_objects (
  asset_id TEXT NOT NULL,
  interval TEXT NOT NULL DEFAULT '1d',
  r2_key TEXT NOT NULL,
  rows INTEGER,
  from_ts TEXT,
  to_ts TEXT,
  refreshed_at TEXT NOT NULL,
  PRIMARY KEY (asset_id, interval)
);

CREATE TABLE watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'yahoo',
  priority INTEGER DEFAULT 100
);
```

### R2 키 레이아웃

```
candles/{provider}/{symbol}/{interval}.json
ingest/{yyyy-mm-dd}/{symbol}.raw.json
```

## 5. API 표면 (Worker)

| Method | Path | 역할 |
|---|---|---|
| GET | `/api/health` | 생존 확인 (시크릿 없음) |
| GET | `/api/v1/candles/:provider/:symbol` | OHLCV JSON (Cache → R2 → lazy Yahoo) |
| GET | `/api/v1/market-data/:provider/:symbol/price` | 종가 시계열 |
| GET | `/api/v1/market-data/:provider/:symbol/last` | 최신 봉 |
| GET | `/api/v1/assets/:provider/:symbol` | 자산 메타 |

검증: 엄격한 심볼 정규식. CORS: 프로덕션은 Pages 오리진만.

## 6. Cron (Free)

| 제약 | 값 | 설계 함의 |
|---|---|---|
| Cron당 CPU | **10 ms** | JSON 파싱 거의 불가 |
| 계정 Cron 수 | **5** | Phase 1은 일 1회 작업 하나 |
| 일 요청 | API와 합산 **10만** | ingest는 드물게 |

**전략 A (Cron이 빡세면 우선):** Cron 없이 첫 `GET /candles`에서 **lazy fill**.  
**전략 B:** 일 1회 Cron이 watchlist 상위 N만 최소 파싱으로 갱신.

## 7. Pyodide / 웹뷰 계약

```python
from vi_browser import get_candles, returns, volatility

df = get_candles("AAPL", days=260)
print(volatility(df["close"], 22))
```

| Phase 1 범위 | 범위 밖 |
|---|---|
| pandas/numpy timeseries 서브셋 | QuantLib, 전체 `vi_quant` |
| Worker 경유 HTTP 시세 | 브라우저에서 TOSS 직접 호출 |
| 반환 프레임 차트 | 수 GB 백테스트 |

## 8. 비용 (무료 목표)

| 제품 | 무료 한도 (대략) | Phase 1 사용 |
|---|---|---|
| Workers | 일 10만 req, CPU 10ms | API + 선택 Cron |
| Pages | 정적 호스팅 | 웹뷰 + Pyodide 자산 |
| D1 | 읽기 5M/일, 쓰기 10만/일 | 메타만 |
| R2 | 저장 10GB; 이그레스 무료 | 캔들 본체 |
| Cache API | 엣지 캐시 | 핫 캔들 |

**목표 월 비용: $0** (한도 내). 초과 시 조용한 업그레이드가 아니라 에러로 실패.

## 9. 레거시

| 경로 | 현재 역할 |
|---|---|
| `backend/` Express | 참고 / 동결 — 기능 추가 금지 |
| `vi_quant/providers` | 로컬 연구; 대시보드는 Worker 사용 |
| Neon / Upstash / Vercel 계획 | 주 플랫폼으로서 폐기 |

## 10. 에이전트 / 구현 노트

Free + WASM 한계를 **하드 요구사항**으로 구현할 것. ROADMAP이 Free를 벗어나기 전까지
Workers Paid, DO 레이트리밋 팜, 서버 샌드박스를 가정하지 말 것.
