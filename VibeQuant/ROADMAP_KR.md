# VibeQuant 로드맵 (한국어)

**포지션:** GS Quant **대체가 아님.** API 스타일만 빌린 **멀티 LLM 퀀트 위원회 기본 스테이지**
(+ 교육용 샌드박스 OK).

**핵심 목표**

1. **위원회 스테이지:** 같은 `vi_browser` API·같은 Cloudflare 시세로 LLM 산출물을 재현·검증.
2. **대시보드 검증 루프:** 웹뷰 Python → **Pyodide** → Worker 시세 → 표/차트/stdout.
3. **Cloudflare Free 우선.** WASM/무료로 안 되는 것은 로컬·후속 Phase로 연기하고 문서에 명시.
4. **API 연속성:** 주요 Vi/GS 표면을 감사하고, 완전 이식 불가 시 **시머 / 라우터 / 파사드**로 위원회 스크립트가 돌아가게 함.

**진행 순서 (활성)**

| Phase | 초점 | 상태 |
|-------|------|------|
| **0** | API 호환 매트릭스 | ✅ 완료 |
| **1** | 브라우저 시계열 시머·별칭 | ✅ 완료 |
| **2** | 데이터 라우터 (`get_prices` / `get_asset` / thin `ViDataApi`) | ✅ 완료 |
| **3** | 커뮤니티 평가 (+ 선택 `vi_compat` 파사드) | 예정 |
| **4** | LLM 아카이브 / 멀티 LLM bake-off | 부분 완료 |

**얇은 수직 슬라이스**

`Pages → Pyodide → Worker /candles|/assets|/prices → R2/D1 → timeseries 시머 + 교육용 backtest`

레거시 Vercel/Neon/Upstash는 확장하지 않음.

---

## 완료된 기반 (선행 — 동결)

위원회 스테이지가 이미 의존하는 과거 Phase 0–2 작업:

- [x] 레포 구조, Apache-2.0 + NOTICE, GS → VI 매핑 문서
- [x] 로컬 `ViSession` + vendored `timeseries` / `errors` / `datetime` (부분; LIMITATIONS 참조)
- [x] Cloudflare Worker: `/api/health`, `/api/v1/candles/...`, Cache → R2 → Yahoo
- [x] D1 메타 + R2 캔들 본체 + watchlist (최대 50)
- [x] Pages + Pyodide 대시보드 (에디터, 차트, 에러 로그, i18n, Clear)
- [x] `vi_browser` 코어: 캔들, 지표, 교육용 `backtest` / `ma_cross_signal`, `show_chart`
- [x] LLM Quant Prompt UI + Worker (`POST /api/v1/llm/quant-prompt`)
- [ ] **TOSS 실시간 — 후순위:** Worker→TOSS IP 화이트리스트로 불가 ([docs/WORKER_TOSS_IP.md](docs/WORKER_TOSS_IP.md))
- [ ] CI: pytest + flake8 · `CONTRIBUTING.md`

---

## Phase 0 — API 호환 매트릭스

**목표:** 어디서 무엇이 되는지 한 표로 고정. LLM·사람이 실행 전 pass/fail을 알 수 있게.

- [x] [docs/API_COMPAT_MATRIX_KR.md](docs/API_COMPAT_MATRIX_KR.md) — 계층: **browser** / **local** / **stub** / **planned**
- [x] 주요 `vi_quant` / GS 이름 API vs `vi_browser` pass/fail 메모
- [x] README / LIMITATIONS / `api-catalog.js`에서 링크

**Exit:** data + timeseries + session + risk/instruments 커버; browser 행마다 샘플 또는 명시적 실패 사유. ✅

---

## Phase 1 — 브라우저 시계열 시머

**목표:** Pyodide에서 흔한 GS/VI timeseries 공백을 메움 (전체 `vi_quant` 이식 없음).

- [x] `ema` / `exponential_moving_average` (span 기반)
- [x] `change`, `index` (시리즈 정규화)
- [x] `percentiles` (단순 rolling percentile rank)
- [x] 별칭 (`sma` → `moving_average` 등)
- [x] `pages/js/pyodide-runner.js` ↔ `vi_browser/` 동기화
- [x] `api-catalog.js` 샘플 갱신

**Exit:** EMA + change/index + percentiles 골든 스크립트가 동일 시세로 두 번 같은 stdout. ✅ (결정론 헬퍼)

**Non-goals:** WASM 안 QuantLib/리스크 전부; GS Window 엣지 케이스 완전 동등.

---

## Phase 2 — 데이터 라우터

**목표:** 익숙한 데이터 진입점을 Worker 캔들(또는 문서화된 stub)로 라우팅해 ImportError/빈 mock으로 죽지 않게.

- [x] `get_prices` / `get_last_price` → Worker 캔들(최근 봉), mock-only 제거
- [x] `get_asset` → `GET /api/v1/assets/:provider/:symbol` (D1 + 휴리스틱)
- [x] 브라우저 thin `ViDataApi` / 가격 헬퍼 → 동일 라우터
- [x] `/api/v1/market-data/...` 구현 또는 LIMITATIONS에 명시 (thin alias OK)
- [x] 부족한 경로 LIMITATIONS에 거부/문서화

**Exit:** 웹뷰에서 Worker 기동 시 `get_prices(["AAPL","005930.KS"])`, `get_asset("AAPL")`가 실시세 기반 필드 반환. ✅ (라우트·클라이언트 배선 완료; 배포 후 실시세 확인)

---

## Phase 3 — 커뮤니티 평가 (+ 파사드)

**목표:** 타인이 만든 퀀트를 **같은 스테이지**에서 평가. 선택적 GS 이름 파사드.

- [ ] 스크립트/결과 공유 포맷 (gist·레포 링크 또는 R2 아티팩트)
- [ ] 평가 루브릭: 재현성, 리스크 지표, 데이터 소스, 한계 고지
- [ ] UI: “공유 샘플 불러오기 → 실행 → 지표 비교”
- [ ] 스팸/악성 코드: 브라우저 전용 실행 유지, 서버 `exec` 금지
- [ ] (선택) `vi_compat`: 흔한 `gs_quant.*` / `Gs*` import 별칭 → `vi_browser` / 라우터

**Exit:** 외부 스크립트 1개를 위원회 스테이지에서 재현·평가 가능.

---

## Phase 4 — LLM 퀀트 확장

**목표:** 위원회 워크플로를 LLM 에이전트와 연결.

- [x] LLM Quant Prompt UI + Worker (`POST /api/v1/llm/quant-prompt`)
- [x] DeepSeek V4 Pro / Flash; 금융 게이트; 30초 쿨다운; 거부 1분 캐시
- [x] 골든 프롬프트 + 산출물 스키마 (스크립트 / 가정 / 리스크)
- [ ] 성공 프롬프트·stdout 아카이브 + 사람 평가
- [ ] 멀티 LLM bake-off 하네스 (동일 시세 스냅샷)
- [ ] (선택) 로컬 `vi_quant` 헤비 경로 — QuantLib 등은 데스크톱만

**Exit:** 두 모델이 동일 캔들 스냅샷에서 스크립트를 돌리고 산출물이 아카이브됨.

---

## Phase 5 — 배포·배포물

- [ ] PyPI `vi-quant` (로컬 SDK, 선택)
- [ ] 문서 사이트; 위원회 체크리스트 공개
- [ ] CI: pytest + lint · `CONTRIBUTING.md`

**코어 Won't-do:** GS Quant 대체 주장, Marquee/GS 인증, 서버측 임의 Python,
무료 티어 전 세계 대량 ingest, “프로덕션 헤지펀드 OMS”, 브라우저 안 전체 QuantLib.

## Non-Goals

- GS / Marquee와 수치 동일 또는 GS Quant 대체
- Pyodide 안 전체 `vi_quant` / QuantLib
- 편의상 멀티 SaaS로 Cloudflare Free를 대체
- Cloudflare 위 Streamlit/NiceGUI 주 대시보드

## 관련 문서

- [docs/API_COMPAT_MATRIX_KR.md](docs/API_COMPAT_MATRIX_KR.md)
- [docs/ARCHITECTURE_TARGET_KR.md](docs/ARCHITECTURE_TARGET_KR.md)
- [docs/LIMITATIONS_KR.md](docs/LIMITATIONS_KR.md)
- [docs/API_MAPPING_KR.md](docs/API_MAPPING_KR.md)
- [README_KR.md](README_KR.md)
