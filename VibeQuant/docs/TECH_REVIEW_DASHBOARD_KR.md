# 기술 검토: Python 대시보드 (Streamlit / NiceGUI) + Node.js 백엔드 연동

> **폐기(대체) (2026-07-19):** 주 대시보드 경로는 **Pages + Pyodide 웹뷰**이며,
> Cloudflare 위 Streamlit/NiceGUI가 아님. Streamlit/NiceGUI는 Worker API를 부르는
> **로컬** 도구로만 가능하고, Free 티어 호스팅 UI가 아님.
> 규범 문서: [ARCHITECTURE_TARGET_KR.md](ARCHITECTURE_TARGET_KR.md),
> [LIMITATIONS_KR.md](LIMITATIONS_KR.md), [../ROADMAP_KR.md](../ROADMAP_KR.md).

**날짜:** 2026-07-19
**범위:** VibeQuant 모니터링 대시보드 — Express+TypeScript 백엔드 위에 NiceGUI/Streamlit 프론트엔드 연동 가능성
**결론:** 승인 — 모든 항목 가능, 차단 요소 없음

## 1. 요약

| 질문 | 판정 | 신뢰도 |
|---|---|---|
| Streamlit이 Node.js 백엔드를 호출할 수 있는가? | **YES** | 높음 |
| NiceGUI가 Node.js 백엔드를 호출할 수 있는가? | **YES** | 높음 |
| Node.js가 유일한 데이터 레이어 역할이 가능한가? | **YES** | 높음 — 필요한 모든 엔드포인트 존재 |
| 듀얼 언어 레포(Python + TS)는 유지 가능한가? | **YES** | 높음 — 이미 Python+TS 공존 중 |
| Neon PostgreSQL을 Python에서 접근 가능한가? | **YES** | 높음 — 표준 PG, `psycopg2`/`asyncpg` 사용 |
| Upstash Redis를 Python에서 접근 가능한가? | **YES** | 높음 — 공식 `upstash-redis` SDK 존재 |
| Docker Compose로 통합 가능한가? | **YES** | 중간 — `backend/Dockerfile` 필요 |

## 2. 동작 원리

Streamlit과 NiceGUI 모두 Node.js 런타임을 내장하지 않습니다. **두 프레임워크 모두 HTTP REST API를 통해 백엔드에 연결됩니다** — 표준 마이크로서비스 / BFF(Backend For Frontend) 패턴입니다.

```
Streamlit / NiceGUI (Python)         Node.js Backend (Express+TS)
┌──────────────────────────┐         ┌───────────────────────────────┐
│                          │  HTTP   │                               │
│  httpx / requests        │ ──────▶ │  GET /api/v1/candles/{p}/{s} │
│  @st.cache_data /        │         │  GET /api/v1/assets/{p}/{s}   │
│  @st.cache_resource      │         │  GET /api/v1/market-data/...  │
│                          │ ◀────── │  GET /api/health              │
│  Plotly / Altair 차트    │  JSON   │                               │
└──────────────────────────┘         └───────────────────────────────┘
         Python                           Node.js (기존)
```

## 3. 세부 가능성 검토

### 3.1 Streamlit → Node.js 백엔드

Streamlit은 Python 프로세스로 실행됩니다. 모든 UI 상호작용마다 스크립트가 처음부터 다시 실행되므로, `@st.cache_data`로 중복 HTTP 호출을 방지해야 합니다:

```python
import streamlit as st
import httpx

BACKEND_URL = "http://localhost:8080"

@st.cache_data(ttl=300)  # 5분간 캐시
def fetch_candles(provider: str, symbol: str, days: int = 365) -> dict:
    r = httpx.get(
        f"{BACKEND_URL}/api/v1/candles/{provider}/{symbol}",
        params={"days": days},
    )
    r.raise_for_status()
    return r.json()
```

**제한사항:**
- WebSocket/스트리밍 미지원 → `st_autorefresh(interval=60)`으로 폴링
- CORS: 개발 모드는 `*` 허용, 프로덕션은 `localhost:8501`을 허용 목록에 추가

### 3.2 NiceGUI → Node.js 백엔드

NiceGUI는 내부 FastAPI/ASGI 서버에서 실행됩니다. HTTP 패턴은 동일하지만 비동기 지원과 타이머 제어가 더 정밀합니다:

```python
from nicegui import ui, app
import httpx

BACKEND_URL = "http://localhost:8080"

async def fetch_candles(provider: str, symbol: str, days: int = 365):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BACKEND_URL}/api/v1/candles/{provider}/{symbol}",
            params={"days": days},
        )
        return r.json()

@ui.page('/')
def index():
    candles = ui.aggrid({})
    ui.timer(60.0, lambda: refresh(candles))  # 60초마다

app.on_startup(lambda: app.storage.user.clear())
```

### 3.3 백엔드 엔드포인트 (대시보드에 모두 필요)

| 엔드포인트 | 반환값 | 대시보드 용도 |
|---|---|---|
| `GET /api/v1/candles/:provider/:symbol` | OHLCV 봉 | 메인 차트 데이터 |
| `GET /api/v1/market-data/:provider/:symbol/price` | 종가 시계열 | 라인 차트, 수익률 계산 |
| `GET /api/v1/market-data/:provider/:symbol/last` | 최신 봉 | 티커 패널, 관심종목 |
| `GET /api/v1/assets/:provider/:symbol` | 자산 메타데이터 | 검색, 정보 패널 |
| `GET /api/health` | 제공자/Redis/DB 상태 | 시스템 상태 대시보드 |

**판정:** 모든 대시보드 데이터 요구사항이 기존 엔드포인트로 충족됩니다. 새 백엔드 라우트 불필요.

### 3.4 듀얼 언어 레포 유지 가능성

VibeQuant 서브프로젝트는 이미 다중 언어입니다:

```
VibeQuant/
├── backend/          TypeScript (Express)
├── vi_quant/         Python (라이브러리)
├── dashboard/        Python (Streamlit/NiceGUI)  ← 신규
├── docker-compose.yml
├── pyproject.toml
└── Dockerfile
```

**완화 조치:**
- `npm`과 `pip`가 이미 공존 — 새로운 도구 불필요
- 단일 `.env` 파일을 VibeQuant 루트에 두고 모든 서비스가 참조
- 서비스별 개별 `Dockerfile` (이미 채택된 패턴)

### 3.5 Neon PostgreSQL — Python 접근

Neon은 표준 PostgreSQL입니다. Python에서 동일하게 연결:

```python
import psycopg2
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
```

**권장:** Python에서는 분석/ETL 용도로만 **읽기 전용** 접근. 일반 데이터 조회는 모두 Node.js 백엔드 API를 경유. Drizzle ORM 스키마를 단일 진실 공급원으로 유지하고 스키마 불일치를 방지합니다.

**주의사항:**
- Neon 서버리스는 ~5분 비활동 후 슬립 → 첫 쿼리 200-500ms 콜드 스타트
- 기존 DB 스키마는 정의되어 있으나 라우트에서 아직 데이터를 채우지 않음 — 분석 쿼리 전 동기화 크론 작업 필요할 수 있음

### 3.6 Upstash Redis — Python 접근

**중요 발견:** Upstash는 **REST (HTTP) API**를 사용하며, 표준 Redis TCP/RESP 프로토콜이 아닙니다. 널리 사용되는 `redis-py` 라이브러리는 Upstash와 **호환되지 않습니다**. 공식 Python SDK를 대신 사용하세요:

```python
# 틀림 — Upstash에 연결되지 않음
# import redis  # ❌ TCP/RESP 프로토콜

# 맞음 — Upstash REST API 사용
from upstash_redis import Redis  # pip install upstash-redis

r = Redis(url=os.getenv("UPSTASH_REDIS_URL"), token=os.getenv("UPSTASH_REDIS_TOKEN"))
cached = r.get("vi:cache:yahoo:candles:AAPL:1d:365")
```

**권장:** 일반 데이터는 Node.js 백엔드를 경유(이미 투명하게 캐시 처리). Python 직접 Redis 접근은 다음 용도로만:
- 대시보드 전용 캐시 키 (네임스페이스 `vi:dash:*`)
- 캐시 무효화
- 세션/사용자 설정 저장

**주의사항:**
- Upstash 무료 티어: 1GB 저장, 10K 명령/일 — 대시보드 메타데이터에 충분, 시계열 저장용 아님
- Python SDK가 Node.js SDK보다 덜 성숙함 — 기본 get/set/del/expire는 모두 작동

### 3.7 Docker Compose 통합

기존 `docker-compose.yml`에 3개 서비스 추가 필요:

```yaml
services:
  # 기존
  vibequant: { ... }
  vibequant-jupyter: { ... }

  # 신규
  vibequant-backend:
    build: { context: ./backend, dockerfile: Dockerfile }
    ports: ["8080:8080"]
    environment: [DATABASE_URL, UPSTASH_REDIS_URL, ...]

  vibequant-dashboard-streamlit:
    build: { context: ./dashboard, dockerfile: Dockerfile.streamlit }
    ports: ["8501:8501"]
    environment: [BACKEND_URL=http://vibequant-backend:8080, ...]
    depends_on: [vibequant-backend]

  vibequant-dashboard-nicegui:
    build: { context: ./dashboard, dockerfile: Dockerfile.nicegui }
    ports: ["8081:8080"]
    depends_on: [vibequant-backend]
```

**차이점:** `backend/`에 현재 Dockerfile이 없습니다. `api/index.ts` 진입점은 Vercel 전용입니다. Docker에서는 `node dist/index.js`(독립 실행형 Express `app.listen()` — 이미 `src/index.ts`에 구현됨)가 필요합니다.

## 4. 권장 스택

| 계층 | 선택 | 근거 |
|---|---|---|
| 빠른 대시보드 | **Streamlit** | Python 전용, 코드→UI 최단 경로, 내장 캐싱 |
| 풍부한 UI / 데스크톱급 | **NiceGUI** | 비동기, 더 많은 위젯, 타이머 기반 갱신, 대용량 테이블용 AG Grid |
| HTTP 클라이언트 | **httpx** | 비동기 지원, 커넥션 풀링, 두 프레임워크 모두 지원 |
| 차트 | **Plotly** | Streamlit 내장, NiceGUI에서도 독립 사용 가능 |
| Python → Redis | **upstash-redis** | Upstash REST API와 호환되는 유일한 Python SDK |
| Python → Neon | **psycopg2** | 읽기 전용 분석; 일반 데이터는 모두 백엔드 API 경유 |

## 5. 보안 정렬

| SECURITY.md 섹션 | 대시보드 준수 |
|---|---|
| 소스 코드에 시크릿 없음 | `BACKEND_URL`만 — 모든 제공자 키는 백엔드 `.env`에 |
| 속도 제한 | 백엔드에서 상속 (경로당 10/s, 전역 100/s) |
| CORS | 프로덕션 허용 목록에 `localhost:8501` 추가 |
| 입력 검증 | 백엔드가 심볼/제공자 검증 — 대시보드는 통과만 |
| HTTPS | 개발: localhost. 프로덕션: Vercel(백엔드) + Streamlit Cloud 또는 Docker 리버스 프록시 |
| Pre-commit | 동일한 `scripts/pre-commit-hook.sh`를 대시보드 Python 파일에 적용 |

## 6. 격차 및 조치 항목

| # | 격차 | 조치 |
|---|---|---|
| 1 | `backend/`에 Dockerfile 없음 | `backend/Dockerfile` 생성 (Node 20, `npm build && node dist/index.js`) |
| 2 | DB 테이블에 데이터 미적재 | 크론 작업 또는 `POST /api/v1/candles/sync` 엔드포인트 추가 |
| 3 | 멀티 심볼 배치 엔드포인트 없음 | 대시보드 효율화용 `POST /api/v1/candles/batch` 추가 (추후) |
| 4 | CORS 프로덕션 허용 목록 | Streamlit/NiceGUI 포트를 `corsMiddleware()`에 추가 |
| 5 | 실시간 업데이트용 WebSocket 없음 | 초기 전략은 폴링으로 수용; 필요 시 추후 WS 추가 |

## 7. 판정

**아키텍처는 타당하며 완전히 실현 가능합니다.** Streamlit과 NiceGUI는 표준 HTTP REST 호출을 통해 Node.js 백엔드에 연결됩니다 — 두 프레임워크 모두 Python 전용이지만 Python 백엔드를 요구하지 않습니다. 기존 Express+TS 서버는 이미 모니터링 대시보드에 필요한 모든 엔드포인트를 노출하고 있습니다. 듀얼 언어 레포 패턴은 이미 프로덕션에 적용 중입니다. 아키텍처적 차단 요소는 없습니다.

**권장 첫 단계:** `dashboard/app.py`(Streamlit)를 생성하여 `http://localhost:8080/api/health`를 호출 — 이것만으로 전체 연결 체인이 검증됩니다.
