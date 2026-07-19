# GS → VI API 매핑표 (한국어)

이 문서는 GS Quant(`gs_quant`) 공개 API와 VibeQuant(`vi_quant`) 공개 API 사이의
공식 매핑표입니다. 규칙은 기계적입니다: **`gs_quant` → `vi_quant`, 접두어 `Gs` → `Vi`**.
그 외 모듈 구조, 접두어 없는 클래스명, 메서드 시그니처는 그대로 유지됩니다.

기준 출처: `goldmansachs/gs-quant` @ `master` (release 2.1.1, 2026-07).

## 1. 패키지 및 모듈 매핑

| GS Quant | VibeQuant | 비고 |
|---|---|---|
| `gs_quant` | `vi_quant` | 최상위 패키지 |
| `gs_quant.session` | `vi_quant.session` | 세션/인증을 로컬 백엔드로 대체 |
| `gs_quant.api.gs.*` | `vi_quant.api.vi.*` | API 클라이언트 계층 (3절 참조) |
| `gs_quant.data` | `vi_quant.data` | 동일 클래스명 (`Dataset`, `DataContext`, `Fields`) |
| `gs_quant.instrument` | `vi_quant.instrument` | 동일 상품 클래스 (`IRSwap`, `FXOption`, ...) |
| `gs_quant.risk` | `vi_quant.risk` | 동일 측정값 (`Price`, `IRDelta`, `DollarPrice`, ...) |
| `gs_quant.markets` | `vi_quant.markets` | `Portfolio`, `PricingContext`, 최적화 도구, 바스켓 |
| `gs_quant.backtests` | `vi_quant.backtests` | Strategy / 트리거 / 액션 / 엔진 |
| `gs_quant.timeseries` | `vi_quant.timeseries` | 대수, 계량경제학, 기술적 지표, 측정값 |
| `gs_quant.models` | `vi_quant.models` | 리스크 모델 추상화 |
| `gs_quant.entities` | `vi_quant.entities` | 엔티티 추상화 |
| `gs_quant.analytics` | `vi_quant.analytics` | DataGrid, 프로세서, 워크스페이스 |
| `gs_quant.datetime` | `vi_quant.datetime` | 날짜/스케줄 유틸리티 (순수 로컬, 그대로 포팅) |
| `gs_quant.common` | `vi_quant.common` | 공유 타입/Enum (그대로 포팅) |
| `gs_quant.errors` | `vi_quant.errors` | `MqError` 계층 구조 그대로 유지 |
| `gs_quant.target` | `vi_quant.target` | 생성된 서비스 타입 (VI 스키마용 재생성) |
| `gs_quant.content` | `vi_quant.content` | 콘텐츠/리서치 API |
| `gs_quant.tracing` | `vi_quant.tracing` | OpenTelemetry 스타일 추적 (그대로 포팅) |

## 2. 세션 및 인증

| GS Quant | VibeQuant | 백엔드 변경 |
|---|---|---|
| `GsSession` | `ViSession` | Marquee OAuth → 선택적 로컬/자체 호스팅 인증 |
| `GsSession.use(Environment.PROD, client_id, client_secret)` | `ViSession.use()` | 자격증명 선택적; 기본값 로컬 백엔드 |
| `GsSession.get(...)` | `ViSession.get(...)` | 동일 팩토리 시그니처 |
| `Environment.PROD / QA / DEV` | `Environment.PROD / QA / DEV` | VI 엔드포인트로 해석 (5절 참조) |
| `KerberosSession` | *(포팅 안 함)* | GS 내부 전용 |
| `PassThroughSession` | `PassThroughSession` | 기존 토큰으로 자체 호스팅 VI 백엔드용 |
| `PassThroughGSSSOSession` | *(포팅 안 함)* | GS SSO 내부 전용 |
| `MQLoginSession` | *(포팅 안 함)* | Marquee 로그인 내부 전용 |

## 3. API 클라이언트 클래스 (`gs_quant.api.gs.*` → `vi_quant.api.vi.*`)

| GS 클래스 (모듈) | VI 클래스 (모듈) | 오픈 백엔드 (Phase — 로드맵 참조) |
|---|---|---|
| `GsSession` (`session`) | `ViSession` (`session`) | 로컬 (P0) |
| `GsDataApi` (`api.gs.data`) | `ViDataApi` (`api.vi.data`) | yfinance / FRED / 로컬 Parquet-DuckDB (P1) |
| `GsAssetApi` (`api.gs.assets`) | `ViAssetApi` (`api.vi.assets`) | OpenFIGI + 로컬 증권 마스터 (P1) |
| `GsSecurityMasterApi` (`api.gs.secmaster`) | `ViSecurityMasterApi` (`api.vi.secmaster`) | 로컬 증권 마스터 DB (P1) |
| `GsSecurityMasterFederatedApi` (`api.gs.federated_secmaster`) | `ViSecurityMasterFederatedApi` (`api.vi.federated_secmaster`) | 로컬 소스 연합 (P3) |
| `GsIdType` (`api.gs.assets`) | `ViIdType` (`api.vi.assets`) | Enum, 그대로 포팅 (P1) |
| `GsAsset` (`target.assets`) | `ViAsset` (`target.assets`) | 데이터 클래스, 그대로 포팅 (P1) |
| `GsTemporalXRef` (`target.assets`) | `ViTemporalXRef` (`target.assets`) | 데이터 클래스, 그대로 포팅 (P1) |
| `GsPriceApi` (`api.gs.price`) | `ViPriceApi` (`api.vi.price`) | QuantLib 가격 서비스 (P2) |
| `GsRiskApi` (`api.gs.risk`) | `ViRiskApi` (`api.vi.risk`) | QuantLib + 로컬 리스크 엔진 (P2) |
| `GsRiskModelApi` (`api.gs.risk_models`) | `ViRiskModelApi` (`api.vi.risk_models`) | 오픈 팩터 모델 (Fama-French, 통계적 PCA) (P3) |
| `GsFactorRiskModelApi` (`api.gs.risk_models`) | `ViFactorRiskModelApi` (`api.vi.risk_models`) | 오픈 팩터 모델 (P3) |
| `GsScenarioApi` (`api.gs.scenarios`) | `ViScenarioApi` (`api.vi.scenarios`) | 로컬 시나리오 엔진 (P3) |
| `GsFactorScenarioApi` (`api.gs.scenarios`) | `ViFactorScenarioApi` (`api.vi.scenarios`) | 로컬 시나리오 엔진 (P3) |
| `GsBacktestApi` (`api.gs.backtests`) | `ViBacktestApi` (`api.vi.backtests`) | 로컬 제네릭 엔진 (P2) |
| `GsBacktestApiAsync` (`api.gs.backtests`) | `ViBacktestApiAsync` (`api.vi.backtests`) | 로컬 제네릭 엔진, 비동기 (P2) |
| `GsBacktestXassetApi` (`api.gs.backtests_xasset`) | `ViBacktestXassetApi` (`api.vi.backtests_xasset`) | 로컬 크로스에셋 엔진 (P3) |
| `GsBacktestXassetApiAsync` (`api.gs.backtests_xasset`) | `ViBacktestXassetApiAsync` (`api.vi.backtests_xasset`) | 로컬 크로스에셋 엔진, 비동기 (P3) |
| `GsPortfolioApi` (`api.gs.portfolios`) | `ViPortfolioApi` (`api.vi.portfolios`) | 로컬 포트폴리오 저장소 (SQLite/DuckDB) (P2) |
| `GsReportApi` (`api.gs.reports`) | `ViReportApi` (`api.vi.reports`) | 로컬 리포트 엔진 (P3) |
| `GsIndexApi` (`api.gs.indices`) | `ViIndexApi` (`api.vi.indices`) | 로컬 지수 구축 (P3) |
| `GsHedgeApi` (`api.gs.hedges`) | `ViHedgeApi` (`api.vi.hedges`) | 로컬 최적화 도구 (cvxpy) (P3) |
| `GsScreenApi` (`api.gs.screens`) | `ViScreenApi` (`api.vi.screens`) | 데이터 저장소 기반 로컬 스크리닝 (P3) |
| `GsBaseScreenerApi` (`api.gs.base_screener`) | `ViBaseScreenerApi` (`api.vi.base_screener`) | 로컬 스크리닝 (P3) |
| `GsDataScreenApi` (`api.gs.data_screen`) | `ViDataScreenApi` (`api.vi.data_screen`) | 로컬 스크리닝 (P3) |
| `GsEsgApi` (`api.gs.esg`) | `ViEsgApi` (`api.vi.esg`) | 오픈 ESG 데이터셋 (P4) |
| `GsCarbonApi` (`api.gs.carbon`) | `ViCarbonApi` (`api.vi.carbon`) | 오픈 탄소 데이터셋 (P4) |
| `GsThematicApi` (`api.gs.thematics`) | `ViThematicApi` (`api.vi.thematics`) | 로컬 테마 바스켓 (P4) |
| `GsCountryApi` (`api.gs.countries`) | `ViCountryApi` (`api.vi.countries`) | 정적 참조 데이터, 번들 제공 (P1) |
| `GsContentApi` (`api.gs.content`) | `ViContentApi` (`api.vi.content`) | 로컬/RSS 콘텐츠 저장소 (P4) |
| `GsUsersApi` (`api.gs.users`) | `ViUsersApi` (`api.vi.users`) | 로컬 사용자 저장소 (P4) |
| `GsGroupsApi` (`api.gs.groups`) | `ViGroupsApi` (`api.vi.groups`) | 로컬 사용자 저장소 (P4) |
| `GsMonitorsApi` (`api.gs.monitors`) | `ViMonitorsApi` (`api.vi.monitors`) | 로컬 모니터 (P4) |
| `GsDataGridApi` (`api.gs.datagrid`) | `ViDataGridApi` (`api.vi.datagrid`) | 로컬 DataGrid 영속성 (P4) |
| `GsPlotApi` (`api.gs.plots`) | `ViPlotApi` (`api.vi.plots`) | 로컬 플롯 영속성 (P4) |
| `GsParserApi` (`api.gs.parser`) | `ViParserApi` (`api.vi.parser`) | 로컬 파서 (P4) |
| `GsWorkspacesMarketsApi` (`api.gs.workspaces`) | `ViWorkspacesMarketsApi` (`api.vi.workspaces`) | 로컬 워크스페이스 영속성 (P4) |
| `GsMarketviewDashboardsApi` (`api.gs.marketview`) | `ViMarketviewDashboardsApi` (`api.vi.marketview`) | 로컬 대시보드 (P4) |
| `GsCalendar` (`datetime.gscalendar`) | `ViCalendar` (`datetime.vicalendar`) | 번들 공휴일 캘린더 (P1) |
| `GsDataSource` (`backtests.data_sources`) | `ViDataSource` (`backtests.data_sources`) | `ViDataApi` 래핑 (P2) |

## 4. 접두어 없는 공개 API (이름 변경 없음)

이 클래스들은 동일한 이름과 시그니처를 유지하며, 전송 계층만 Marquee HTTP 호출에서
VI 백엔드로 변경됩니다:

| 모듈 | 주요 심볼 (변경 없음) |
|---|---|
| `vi_quant.data` | `Dataset`, `DataContext`, `DataCoordinate`, `Fields` |
| `vi_quant.instrument` | `IRSwap`, `IRSwaption`, `FXOption`, `EqOption`, `CDIndex`, ... (모든 `Instrument` 서브클래스) |
| `vi_quant.risk` | `Price`, `DollarPrice`, `IRDelta`, `IRVega`, `EqDelta`, `FXDelta`, `CarryScenario`, `MarketDataShockBasedScenario`, ... |
| `vi_quant.markets` | `PricingContext`, `HistoricalPricingContext`, `Portfolio`, `PositionSet`, `SecurityMaster`, `Basket`, `OptimizerStrategy` |
| `vi_quant.markets.portfolio_manager` | `PortfolioManager` |
| `vi_quant.backtests` | `Strategy`, `TriggerRequirements`, `PeriodicTrigger`, `AddTradeAction`, `HedgeAction`, `GenericEngine`, `EquityVolEngine`, `PredefinedAssetEngine` |
| `vi_quant.timeseries` | `returns`, `volatility`, `correlation`, `beta`, `zscores`, `moving_average`, ... (모든 함수) |
| `vi_quant.models` | `FactorRiskModel`, `MacroRiskModel`, `Format` |
| `vi_quant.errors` | `MqError`, `MqValueError`, `MqRequestError`, ... |

## 5. 엔드포인트

| 환경 | GS Quant 엔드포인트 | VibeQuant 엔드포인트 |
|---|---|---|
| `Environment.PROD` | `https://marquee.gs.com` | `VI_QUANT_API_URL` (기본값 `http://localhost:8080`) |
| `Environment.QA` | `https://marquee-qa.gs.com` | `VI_QUANT_QA_API_URL` (기본값 `http://localhost:8081`) |
| `Environment.DEV` | GS 내부 | `http://localhost:8082` |
| 인증 엔드포인트 | `https://idfs.gs.com/as/token.oauth2` | 로컬 토큰 발급기 (선택적; 기본값 익명) |

VI 백엔드는 선택적 자체 호스팅 서비스("VI Platform")로, 동일한 REST 라우트
(`/v1/data/...`, `/v1/assets/...`, `/v1/risk/...`)를 노출합니다.
**임베디드 모드**(기본값)에서는 `ViSession`이 HTTP를 완전히 우회하고
인프로세스 엔진으로 디스패치합니다.

## 6. 환경 변수 및 설정

| GS Quant | VibeQuant |
|---|---|
| `CLIENT_ID` / `CLIENT_SECRET` | 불필요; 자체 호스팅 인증 시 `VI_CLIENT_ID` / `VI_CLIENT_SECRET` |
| — | `VI_QUANT_API_URL` — 백엔드 URL (미설정 시 임베디드 모드) |
| — | `VI_QUANT_DATA_DIR` — 로컬 데이터 저장소 경로 (기본값 `~/.vi_quant/data`) |
| — | `VI_QUANT_FRED_API_KEY` — FRED 매크로 시리즈용 선택 키 |
| `gs_quant/config.ini` | `vi_quant/config.ini` |

## 7. 연락처 / 메타데이터 문자열

| GS Quant | VibeQuant |
|---|---|
| `gs-quant@gs.com` | `gameworkerkim/vibe-investing` GitHub Issues |
| `developer.gs.com/docs/gsquant/` | `VibeQuant/docs/` |

## 8. 명시적으로 포팅하지 않는 항목

| 심볼 | 이유 |
|---|---|
| `KerberosSession`, `PassThroughGSSSOSession`, `MQLoginSession` | GS 내부 인증 메커니즘 |
| `gs_quant.api.fred` | 대체됨 — FRED는 1차 `ViDataApi` 백엔드 |
| Marquee 전용 UI 딥링크 | 해당 없음; VI는 로컬 아티팩트 경로 반환 |

## 9. 마이그레이션 치트 시트

```python
# 1. 패키지 rename
import gs_quant                      ->  import vi_quant

# 2. 접두어 rename
from gs_quant.session import GsSession        ->  from vi_quant.session import ViSession
from gs_quant.api.gs.data import GsDataApi    ->  from vi_quant.api.vi.data import ViDataApi
from gs_quant.api.gs.assets import GsAssetApi ->  from vi_quant.api.vi.assets import ViAssetApi

# 3. 세션 초기화 (자격증명 선택적)
GsSession.use(Environment.PROD, client_id=cid, client_secret=sec)
->  ViSession.use()   # 임베디드 로컬 백엔드
->  ViSession.use(Environment.PROD)  # 자체 호스팅 VI Platform

# 4. 그 외 모든 것은 변경 없음
IRSwap('Pay', '10y', 'USD').calc(Price())
```

2단계 sed로 스크립트 마이그레이션:

```bash
grep -rl "gs_quant" . | xargs sed -i '' -e 's/gs_quant/vi_quant/g' -e 's/\bGs\([A-Z]\)/Vi\1/g'
```
