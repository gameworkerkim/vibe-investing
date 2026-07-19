# VibeQuant 로드맵 (한국어)

**포지션:** GS Quant **대체가 아님.** API 스타일만 빌린 **멀티 LLM 퀀트 위원회 기본 스테이지**
(+ 교육용 샌드박스 OK).

**핵심 목표**

1. **위원회 스테이지:** 같은 `vi_browser` API·같은 Cloudflare 시세로 LLM 산출물을 재현·검증.
2. **대시보드 검증 루프:** 웹뷰 Python → **Pyodide** → Worker 시세 → 표/차트/stdout.
3. **Cloudflare Free 우선.** WASM/무료로 안 되는 것은 로컬·후속 Phase로 연기하고 문서에 명시.

**진행 순서 (규범)**

1. **기본 스테이지 완성** (시세·실행·차트·위원회 체크리스트) ← 현재
2. **백테스트** (교육용·재현 가능 지표: Sharpe / MDD / CAGR 등)
3. **커뮤니티** — 타인이 올린 퀀트 스크립트·결과를 같은 스테이지에서 평가
4. **LLM 퀀트 확장** — 위원회 워크플로·에이전트 산출물 자동화

**원칙 — 얇은 수직 슬라이스.**

`Pages → Pyodide → Worker /candles → R2/D1 → timeseries (+ 이후 backtest)`

레거시 Vercel/Neon/Upstash는 확장하지 않음.

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

## Phase 2 — 교육용 백테스트 (위원회 스테이지 위)

**목표:** 샌드박스에서 **재현 가능한** 단순 백테스트. 프로덕션 연구 엔진이 아님.

- [ ] `vi_browser` 백테스트 미니 API (예: 신호 시계열 → 포지션 → equity curve)
- [ ] 성과 지표: 수익률, MDD, Sharpe(단순), CAGR — stdout + 차트
- [ ] 골든 백테스트 스크립트 + 위원회 체크리스트 항목 추가
- [ ] 메모리/일수 상한 문서화 (WASM)

**Exit:** 웹뷰에서 동일 스크립트·동일 시세로 백테스트 숫자가 두 번 일치.

## Phase 3 — 커뮤니티 평가

**목표:** 타인이 만든 퀀트를 **같은 스테이지**에서 돌려보고 평가.

- [ ] 스크립트/결과 공유 포맷 (gist·레포 링크 또는 R2 아티팩트)
- [ ] 평가 루브릭: 재현성, 리스크 지표, 데이터 소스, 한계 고지
- [ ] UI: “공유 샘플 불러오기 → 실행 → 지표 비교”
- [ ] 스팸/악성 코드: 브라우저 전용 실행 유지, 서버 `exec` 금지

**Exit:** 외부 스크립트 1개를 위원회 스테이지에서 재현·평가 가능.

## Phase 4 — LLM 퀀트 확장

**목표:** 위원회 워크플로를 LLM 에이전트와 연결.

- [ ] 골든 프롬프트 + 산출물 스키마 (스크립트 / 가정 / 리스크)
- [ ] 멀티 LLM bake-off 하네스 (동일 시세 스냅샷)
- [ ] (선택) 로컬 `vi_quant` 헤비 경로 — QuantLib 등은 데스크톱만

## Phase 5 — 배포·배포물

- [ ] PyPI `vi-quant` (로컬 SDK, 선택)
- [ ] 문서 사이트; 위원회 체크리스트 공개
- [ ] CI: pytest + lint · `CONTRIBUTING.md`

**코어 Won't-do:** GS Quant 대체 주장, Marquee/GS 인증, 서버측 임의 Python,
무료 티어 전 세계 대량 ingest, “프로덕션 헤지펀드 OMS” 약속.

## Non-Goals

- GS / Marquee와 수치 동일 또는 GS Quant 대체
- Pyodide 안 전체 `vi_quant` / QuantLib
- 편의상 멀티 SaaS로 Cloudflare Free를 대체
- Cloudflare 위 Streamlit/NiceGUI 주 대시보드

## 관련 문서

- [docs/ARCHITECTURE_TARGET_KR.md](docs/ARCHITECTURE_TARGET_KR.md)
- [docs/LIMITATIONS_KR.md](docs/LIMITATIONS_KR.md)
- [README_KR.md](README_KR.md)
