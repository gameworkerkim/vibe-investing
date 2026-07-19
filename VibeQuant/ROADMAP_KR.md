# VibeQuant 로드맵 (한국어)

목표: **GS Quant와 API 레벨 호환**되는 완전 오픈소스 퀀트 엔진.
모든 `Gs*` 심볼을 `Vi*`로 변경, Goldman Sachs Marquee 백엔드를 오픈 데이터 소스와
오픈소스 가격/리스크 엔진으로 대체.

추적 기준: `goldmansachs/gs-quant` @ release 2.1.1.

**원칙 — 얇은 수직 슬라이스 우선.** gs-quant API 표면 전체를 넓게 포팅하는 대신,
각 Phase는 실제로 동작하는 end-to-end 경로 하나를 완성한 후(예: `ViSession → ViDataApi →
Dataset.get_data() → timeseries`), 그 후에 커버리지를 넓혀갑니다.

## Phase 0 — 기반 (스케폴딩 & 호환성 레이어)

**목표:** 프로젝트 뼈대, 네이밍 규칙, 동작하는 `ViSession`.

- [x] `vibe-investing/VibeQuant/` 레포지토리 구조
- [x] GS → VI API 매핑표 ([docs/API_MAPPING.md](docs/API_MAPPING.md))
- [x] 공식 문서 대응 매뉴얼 ([docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md))
- [x] `vi_quant` 패키지 스켈레톤 + `ViSession` (embedded 모드, 인증 불필요)
- [x] 자동 rename 파이프라인: gs-quant 소스 vendoring + `gs_quant→vi_quant`, `Gs→Vi` 변환 + 라이선스 헤더 보존 (`scripts/vendor_rename.py`)
- [x] 순수 로컬 모듈 포팅: `errors`, `datetime`, `timeseries` (algebra/statistics/econometrics/technicals/analysis)
- [ ] CI: pytest + flake8, Python 3.9–3.12 매트릭스 (로컬 pytest 있음; CI 워크플로우 미완)
- [x] LICENSE (Apache-2.0) + NOTICE (gs-quant 저작자 표시)
- [ ] `CONTRIBUTING.md`, 라이선스 정책 (Apache-2.0 호환 의존성만)

**Exit 기준:** `pip install -e .` 동작; `import vi_quant`; timeseries 함수가
gs-quant에서 포팅한 테스트 통과.

## Phase 1 — 데이터 백엔드 (REST API + Redis 캐시 + Neon DB)

**목표:** 독립 실행형 데이터 백엔드가 REST API를 통해 시장 데이터를 제공.
`vi_quant` Python 클라이언트와 `VibeQuantClient` (TypeScript/Node.js) 양쪽에서 소비.

- [x] 백엔드 프로젝트 스케폴드: TypeScript + Express, Vercel 배포 준비 (`backend/`)
- [x] `src/routes/`: `/api/v1/candles`, `/api/v1/market-data`, `/api/v1/assets`, `/api/health`
- [x] `src/providers/`: Yahoo Finance (`yahoo-finance2` v4, 무료, 키 불필요) + TOSS Open API (한국·미국 주식, OAuth2)
- [x] `src/db/`: Neon PostgreSQL 스키마 (`market_assets`, `market_candles` — JSONB + BRIN 인덱스, `cache_metadata`)
- [x] `src/db/redis.ts`: Upstash Redis 캐시 레이어 + 슬라이딩 윈도우 rate limiter (경로당 10 req/s, 전역 100 req/s)
- [x] 보안 미들웨어: Helmet, CORS, 입력 검증, 선택적 API 키, OWASP 준수 헤더
- [x] `scripts/setup-env.sh`: 대화형 터미널 스크립트로 인증 정보 입력 (소스에 시크릿 없음)
- [x] `scripts/pre-commit-hook.sh`: API 키·DB URL·토큰 포함된 커밋 차단
- [x] Python + TypeScript 클라이언트 예제 (`examples/vibequant_client.py`, `examples/vibequant-client.ts`)
- [x] Python 제공자 레이어: `vi_quant/providers/` — UnifiedProvider (TOSS + Yahoo Finance + Mock), 모든 5개 함수 백엔드 간 동일 시그니처
- [x] `docs/PROVIDER_API_MATCHING.md` — TOSS ↔ Yahoo Finance ↔ VibeQuant 통합 인터페이스 매핑
- [x] `Dockerfile` + `docker-compose.yml` — 로컬 백테스트 환경 (Jupyter + Mock 제공자)
- [x] `notebooks/01_backtest_demo.py` — 결정론적 Mock 백테스트 데모 (자격증명 불필요)
- [x] 보안 정책 문서 ([SECURITY.md](SECURITY.md) — LLM 판독 가능)
- [ ] Vercel 배포 (무료 티어) + Neon·Upstash 연동
- [ ] `vi_quant/data/`를 백엔드 REST API 호출로 연결 (현재 stub 교체)
- [ ] End-to-end 노트북 1개: Python → 백엔드 → Yahoo Finance → timeseries

**Exit 기준:** `VibeQuantClient.getPriceSeries("yahoo", "AAPL")`가 DataFrame 반환;
`vi_quant.providers.get_provider().fetch_candles("005930")`가 백엔드를 통해 동작.

## Phase 2 — 가격 결정, 리스크 & 백테스트 코어

**목표:** `Instrument.calc(Measure)`와 제네릭 백테스트 엔진, 로컬 실행.

- [ ] `ViPriceApi` / `ViRiskApi` — QuantLib 백엔드: 금리 스왑/스왑션, FX 옵션, 주식 옵션 우선
- [ ] 리스크 측정: `Price`, `DollarPrice`, `IRDelta`, `IRVega`, `EqDelta`, `EqVega`, `FXDelta`, `Theta` (상품별 커버리지/패리티 테이블)
- [ ] `PricingContext` / `HistoricalPricingContext` — 로컬 병렬 실행
- [ ] `ViBacktestApi` + `GenericEngine` 완전 로컬 실행 (`Strategy`, 트리거, 액션)
- [ ] `ViPortfolioApi` — 로컬 포트폴리오 저장소 (SQLite/DuckDB)
- [ ] 가이드: pricing-and-risk, backtesting

**Exit 기준:** `IRSwap('Pay','10y','USD').calc(Price())`가 QuantLib 기반 가격 반환;
gs-quant 백테스트 예제가 rename 후 end-to-end 실행.

## Phase 3 — 포트폴리오 분석, 팩터 모델 & 헤징

**목표:** 오픈 모델로 기관 수준 분석 제공.

- [ ] `ViFactorRiskModelApi` / `ViRiskModelApi`: Fama-French + 통계적(PCA) 팩터 모델 (오픈 데이터로 구축)
- [ ] `PortfolioManager` 보고서: 성과, 팩터 리스크, 테마 노출
- [ ] `ViScenarioApi` / `ViFactorScenarioApi`: 시장 충격 & 팩터 시나리오 엔진
- [ ] `ViHedgeApi`: 헤지 최적화 (cvxpy)
- [ ] `ViIndexApi`, 스크린 (`ViScreenApi`, `ViDataScreenApi`, `ViBaseScreenerApi`)
- [ ] 최적화 도구 (`markets/optimizer.py`) — 오픈 솔버 사용

**Exit 기준:** 오픈 팩터 모델로 주식 포트폴리오의 팩터 리스크 보고서 생성;
헤지 최적화 예제 실행.

## Phase 4 — 플랫폼 & 배포

**목표:** 패키지 가능한 라이브러리, 문서화, 생태계 통합.
롱테일 GS API(ESG, Carbon, Workspaces, Marketview)는 명시적으로 **코어 팀의
non-goal**이며, 커뮤니티 기여를 환영합니다.

- [ ] 자체 호스팅 **VI Platform** 서비스 (FastAPI) — VI REST 라우트 노출, `ViSession` 원격 모드 지원
- [ ] Sphinx 문서 사이트 (gs-quant `docs/` 툴체인 재사용) = SDK Reference
- [ ] PyPI `vi-quant` 배포; gs-quant 릴리스 추적 시맨틱 버저닝
- [ ] 예제 노트북: GS Quant 튜토리얼 포팅 (rename + 오픈 데이터)
- [ ] 호환성 테스트 하네스: alias shim으로 모든 공개 심볼 import 체크

**Exit 기준:** `pip install vi-quant`; 문서 사이트 게시; 공개 API 심볼이 패리티
상태와 함께 문서화됨.

**Won't-do (커뮤니티 기여 환영):** 개별 API shim —
`GsEsgApi→ViEsgApi`, `GsCarbonApi→ViCarbonApi`, `GsWorkspacesMarketsApi`,
`GsMarketviewDashboardsApi`, `GsDataGridApi`, `GsPlotApi`, `GsContentApi`,
`GsUsersApi`, `GsGroupsApi`, `GsMonitorsApi`, `GsParserApi`.

## Non-Goals (하지 않는 것)

- Goldman Sachs 독점 데이터·모델·수치 결과의 완전 재현
- Marquee UI 기능 (PlotTool Pro, Marquee 웹 링크)
- GS 내부 인증 (`KerberosSession`, SSO 패스스루)
- 롱테일 ESG / Carbon / Thematics / Workspaces / Marketview / DataGrid API shim
