# VibeQuant 로드맵 (한국어)

**핵심 목표**

1. **GS Quant를 API 레벨에서 대체** (`gs_quant` → `vi_quant`, `Gs*` → `Vi*`).
   오픈 데이터·엔진 사용 — Marquee/GS 수치 동일 아님.
2. **대시보드 검증 루프:** 웹뷰에 Python 퀀트 스크립트 입력 → **Pyodide (WASM)** 실행 →
   시세는 **Cloudflare** → 표/차트/stdout으로 검증.
3. **Cloudflare 무료 티어 우선.** Paid Workers, 브라우저 QuantLib, 서버측 Python 실행이
   필요한 기능은 연기하거나 불가라고 표기.

추적 기준: `goldmansachs/gs-quant` @ release 2.1.1.

**원칙 — 얇은 수직 슬라이스.** 실제로 도는 경로 하나를 먼저 완성:

`Pages 웹뷰 → Pyodide 스크립트 → Worker `/api/v1/candles` → R2/D1 → timeseries 결과`

그다음 커버리지를 넓힘. 레거시 Vercel/Neon/Upstash 스택은 확장하지 않음.

문서는 무료 티어·WASM 한계를 규범으로 적어, 여러 코딩 에이전트가 동일한 제약 위에서
구현·비교 검증할 수 있게 한다 (희망적 “나중에 유료” 기능으로 문서를 쓰지 않음).

## Phase 0 — 기반 (완료 / 동결)

- [x] 레포 구조, Apache-2.0 + NOTICE
- [x] GS → VI 매핑 문서, vendor rename 스크립트
- [x] 로컬 `ViSession` + vendored `timeseries` / `errors` / `datetime` (부분; LIMITATIONS 참조)
- [x] 레거시 Express `backend/` + Python `providers/` (전환용)
- [ ] CI: pytest + flake8 매트릭스
- [ ] `CONTRIBUTING.md`

**Exit:** `pip install -e .`; timeseries 서브셋 테스트 통과. *(서브셋 기준 충족)*

## Phase 1 — Cloudflare 데이터면 + Pyodide 대시보드 (활성)

**목표:** 무료 티어 시세는 Cloudflare, 스크립트 검증은 웹뷰.

### 1A — Cloudflare (Free)

- [ ] Hono Worker: `/api/health`, `/api/v1/candles/:provider/:symbol`,
      `/api/v1/assets/:provider/:symbol`, `/api/v1/market-data/...`
- [ ] 바인딩: D1 (메타/인덱스), R2 (캔들 본체), Cache API (핫 JSON)
- [ ] 스키마: `assets`, `candle_objects`, `watchlist` (ARCHITECTURE_TARGET 참조)
- [ ] Yahoo ingest: 일 1회 Cron **또는** 읽기 시 lazy fill (Cron CPU 10ms — 실패 시 lazy 우선)
- [ ] 무료용 watchlist 상한 (예: 20–50 종목)
- [ ] Express/`backend/` 멀티 SaaS 기능 확장 동결 (참고용만 유지)
- [ ] TOSS: CF secrets로 Worker 옵션 경로 — Phase 1 Exit에 필수 아님;
      free Cron에서 TOSS 대량 페이지네이션 금지 — **[x] TOSS IP 제한 문서화 (WORKER_TOSS_IP.md); Yahoo 주 제공자 확정**

### 1B — Pages + Pyodide 웹뷰

- [ ] 정적 대시보드: 코드 에디터 + 실행 + stdout/표/차트
- [ ] Pyodide 로드; 얇은 `vi_browser`(또는 동등) wheel/CDN 패키지 — **[x] `vi_browser/` 패키지 (`data.py` + `timeseries.py`) 완료**
- [ ] `get_candles` / `get_prices` → Worker API `fetch`만 (브라우저에 시크릿 없음)
- [ ] WASM 안전 서브셋 포팅: `returns`, `volatility`, `moving_average`, `correlation`,
      `max_drawdown` (순수 pandas/numpy) — **[x] `vi_browser` 모듈 생성; timeseries 서브셋 + 데이터 fetch 완료**
- [ ] 골든 스크립트 데모: 삼성/AAPL 캔들 → vol/returns 플롯
- [ ] UI에 패키지 로드 시간·메모리 한계 표시

**Exit 기준**

1. Cloudflare Free에 Pages + Worker + D1 + R2 배포.
2. 웹뷰에 짧은 Python 스크립트를 붙여넣어 실행하고 검증 가능한 출력 확인.
3. 스크립트는 Cloudflare 시세를 사용 (서버 Python 실행 아님).
4. LIMITATIONS에 이 경로에서 막히는 GS/`vi_quant` 기능이 모두 나열됨.

## Phase 2 — 로컬/헤비 패리티 (무료 WASM 아님)

**목표:** WASM/무료로 못 가는 GS API 패리티를 로컬에서 심화.

- [ ] stub 경계 수리 (`Dataset`, 캘린더, `ViDataApi`) — 실패를 명시적으로
- [ ] 로컬 QuantLib 가격 경로 (`Instrument.calc`) — **데스크톱/CI만**, 대시보드 WASM 아님
- [ ] 선택: Cloudflare R2 → 로컬 연구 노트북 동기화
- [ ] 로컬 백테스트; 요약 아티팩트는 필요 시 R2로 export

**Exit:** rename 친화적 가격 예제 1개가 **로컬**에서 동작; 대시보드는 여전히 WASM 서브셋만.

## Phase 3 — 포트폴리오 분석 (오픈 모델)

- [ ] 팩터/시나리오/헤지 모듈 (로컬 우선)
- [ ] 대시보드는 사전계산 R2 아티팩트 호출 가능; 브라우저 풀 최적화 아님

## Phase 4 — 배포

- [ ] PyPI `vi-quant` (로컬 SDK)
- [ ] 문서 사이트; 심볼별 패리티 상태
- [ ] 공개 심볼 호환성 하네스

**코어 Won't-do:** Marquee UI, GS 인증, ESG/Carbon 롱테일 shim,
임의 사용자 Python의 서버 실행, 무료 티어 전 세계 대량 ingest 약속.

## Non-Goals

- GS / Marquee와 수치 동일
- Pyodide 안 전체 `vi_quant`
- 편의상 멀티 SaaS로 Cloudflare Free를 대체
- Cloudflare 위 주 대시보드로 Streamlit/NiceGUI

## 관련 문서

- [docs/ARCHITECTURE_TARGET_KR.md](docs/ARCHITECTURE_TARGET_KR.md)
- [docs/LIMITATIONS_KR.md](docs/LIMITATIONS_KR.md)
- [README_KR.md](README_KR.md)
