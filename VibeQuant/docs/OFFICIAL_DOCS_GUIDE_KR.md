# GS Quant 공식 문서 — VibeQuant 대응 매뉴얼 (한국어)

이 매뉴얼은 GS Quant 공식 문서([developer.gs.com/docs/gsquant/](https://developer.gs.com/docs/gsquant/))의
모든 섹션을 VibeQuant 대응 항목으로 매핑합니다. VibeQuant로 작업하면서 GS 문서를
참조하거나, VibeQuant 문서 커버리지를 추적하는 데 사용합니다.

**범례** — VibeQuant 대응 항목의 상태:
`Compatible` (rename만으로 동작) · `Adapted` (동일 API, 다른 백엔드/동작) ·
`Planned` (로드맵 Phase 참조) · `N/A` (GS 플랫폼 전용, 의도적으로 포팅 안 함)

## 1. 개요 및 시작하기

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/` (개요) | `VibeQuant/README.md` | Compatible |
| `/docs/gsquant/getting-started/` | `VibeQuant/README.md` § Quick Start | Adapted - 자격증명 불필요; `pip install vi-quant` (예정) |

## 2. 인증

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/authentication/` | `docs/guides/authentication.md` | Planned - P0 |
| `/docs/gsquant/authentication/sessions/` | 세션 가이드 — `ViSession` 생명주기 | Adapted - 임베디드 모드가 기본; OAuth 없음 |
| `/docs/gsquant/authentication/gs-session/` | "VI Session" 가이드 (`ViSession.use()` / `.get()`) | Adapted - `client_id`/`client_secret` 선택적 |
| `/docs/gsquant/authentication/proxy/` | 프록시 설정 가이드 | Compatible - 동일한 `requests` 레벨 프록시 지원 |

## 3. 데이터

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/data/` | `docs/guides/data.md` | Planned - P1 |
| `/data/data-environment/datasets/` | `Dataset` 가이드 — 오픈 데이터셋 카탈로그 (yfinance, FRED, 로컬)가 Marquee 카탈로그 대체 | Adapted - Dataset ID 다름; VI 자체 카탈로그 + GS-ID 별칭 테이블 제공 |
| `/data/data-environment/data-context/` | `DataContext` 가이드 | Compatible |
| `/data/data-environment/data-coordinates/` | `DataCoordinate` 가이드 | Adapted - VI 카탈로그 기준으로 좌표 해석 |
| `/data/data-environment/entities/` | Entities 가이드 (`Country`, `Index`, `Asset`, ...) | Adapted - 로컬 증권 마스터 기반 |
| `/data/accessing-data/querying-data/` | 데이터 쿼리 가이드 (`Dataset.get_data`) | Adapted |
| `/data/accessing-data/financial-series/` | 금융 시계열 가이드 | Adapted |
| `/data/accessing-data/exporting-data/` | 데이터 내보내기 가이드 (pandas/CSV/Excel) | Compatible |
| `/data/accessing-data/map-symbology/` | 심볼 매핑 가이드 | Adapted - OpenFIGI 기반, Marquee xref 대체 |
| `/data/accessing-data/map-symbology-secmaster/` | 증권 마스터 심볼 가이드 | Planned - P1 |
| `/data/accessing-data/secmaster_sdk/` | `ViSecurityMasterApi` SDK 가이드 | Planned - P1 |
| `/data/data-analytics/timeseries/` | Timeseries 함수 가이드 (`vi_quant.timeseries`) | Compatible - 순수 로컬 함수 변경 없이 포팅 |
| `/data/data-analytics/datagrid/*` (개요, 프로세서, 영속성, 시각화) | DataGrid 가이드 | Planned - P4 — 영속성은 로컬 파일, Marquee 아님 |
| `/data/data-visualization/charting-data/` | 차트 가이드 (matplotlib/plotly) | Adapted - PlotTool Pro 링크 → 로컬 차트 |

## 4. 가격 결정 및 리스크

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/pricing-and-risk/` | `docs/guides/pricing-and-risk.md` | Planned - P2 |
| `/pricing-and-risk/instruments/` | Instruments 가이드 (`vi_quant.instrument`) | Adapted - QuantLib 엔진으로 가격 결정, GS 엔진 아님 |
| `/pricing-and-risk/measures/` | 리스크 측정 가이드 (`Price`, `IRDelta`, ...) | Adapted - 측정 커버리지는 Phase별 확장; 패리티 테이블 유지 |
| `/pricing-and-risk/pricing-context/` | `PricingContext` 가이드 (배치, 비동기, 과거) | Adapted - 서버 배치 대신 로컬 병렬 실행 |
| `/pricing-and-risk/portfolios/` | 포트폴리오 가격 가이드 (`vi_quant.markets.Portfolio`) | Adapted |
| `/pricing-and-risk/scenarios/` | 시나리오 가이드 (시장 충격, 캐리, 롤포워드) | Planned - P3 |

## 5. 마켓

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/markets/` | `docs/guides/markets.md` | Planned - P1–P3 |
| `/markets/assets-and-security-master/` | 자산 및 SecurityMaster 가이드 | Adapted - 로컬 증권 마스터 |
| `/markets/dates/` | 상대 날짜 가이드 (`0b`, `-1m`, RDate) | Compatible - 순수 로컬, 번들 캘린더로 변경 없이 포팅 |

## 6. 헤징

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/hedging/` | `docs/guides/hedging.md` | Planned - P3 |
| `/hedging/hedging-using-ml/` | ML 헤징 가이드 (로컬 최적화, cvxpy/sklearn) | Planned - P3 |

## 7. 기여

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/contribute/getting-started/` | `CONTRIBUTING.md` | Planned - P0 |
| `/contribute/approved-licenses/` | 라이선스 정책 (Apache-2.0 호환 의존성만) | Planned - P0 |
| `/contribute/building-docs/` | 문서 빌드 가이드 (Sphinx, gs-quant와 동일 툴체인) | Planned - P4 |
| `/contribute/functions/` | Timeseries 함수 작성 가이드 | Planned - P4 |
| `/contribute/creating-tests/` | 테스트 가이드 (pytest) | Planned - P0 |
| `/contribute/pycharm/` | IDE 설정 가이드 | Planned - P4 |

## 8. SDK 레퍼런스

| GS 문서 페이지 | VibeQuant 대응 | 상태 |
|---|---|---|
| `/docs/gsquant/api/` (SDK Reference) | Sphinx 생성 `vi_quant` API 레퍼런스 (`docs/` rst, gs-quant에서 상속) | Planned - P4 |

## 9. GS 플랫폼 전용 콘텐츠 (포팅 안 함)

| GS 문서 / 플랫폼 영역 | 이유 |
|---|---|
| Marquee Portfolio Analytics UI 딥 링크 | Marquee 없음; VI는 로컬 아티팩트 출력 |
| PlotTool Pro 연동 | GS 제품; 로컬에서 matplotlib/plotly 사용 |
| Marquee 데이터셋 권한/라이선스 페이지 | 권한 없음 — 모든 VI 데이터 소스는 오픈 |
| GS DAP®, Transaction Banking, 기타 developer.gs.com 서비스 | 범위 밖 |

## 10. VibeQuant 문서 규칙

1. 모든 VibeQuant 문서는 **영어**로 작성됩니다.
2. 각 가이드 페이지 헤더에는 해당 GS 문서 페이지와 호환성 상태(위 범례)가 명시됩니다.
3. gs-quant master의 공개 API가 변경될 때마다 이 매뉴얼과 [API_MAPPING.md](API_MAPPING.md)를 동일 PR에서 업데이트해야 합니다.
