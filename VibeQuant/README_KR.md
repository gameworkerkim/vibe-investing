# VibeQuant (한국어)

**VibeQuant**는 [GS Quant](https://github.com/goldmansachs/gs-quant)(`gs_quant`)와
Python API 레벨에서 호환되는 완전 오픈소스 퀀트 금융 엔진입니다.

GS Quant는 세계 최고 수준의 퀀트 툴킷이지만, 실제 가치인 데이터·가격 모델·리스크 엔진은
골드만삭스의 Marquee 플랫폼 안에 있고 기관용 `client_id` / `client_secret`이 필요합니다.
VibeQuant는 그 폐쇄형 백엔드를 오픈 데이터 소스와 오픈소스 가격/리스크 엔진으로 대체하면서,
동일한 클래스명·메서드 시그니처·워크플로우를 유지하여 기존 GS Quant 코드를 한 줄 변경으로
마이그레이션할 수 있습니다.

> **네이밍 규칙:** 모든 `Gs*` 심볼은 `Vi*`(Vibe Investing)로 변경됩니다.
> `gs_quant` → `vi_quant`, `GsSession` → `ViSession`, `GsDataApi` → `ViDataApi` 등.
> 전체 매핑은 [API 매핑 테이블](docs/API_MAPPING.md)을 참조하세요.

## 왜 필요한가

| | GS Quant | VibeQuant |
|---|---|---|
| 클라이언트 라이브러리 | 오픈소스 (Apache 2.0) | 오픈소스 (Apache 2.0) |
| 데이터 / 모델 / 연산 | Goldman Sachs Marquee (폐쇄형, 기관 전용) | 오픈소스: yfinance, FRED, OpenFIGI, QuantLib, 로컬 엔진 |
| 인증 | `client_id` / `client_secret` 필수 | 불필요 (일부 데이터 제공자는 옵션 키) |
| 실행 방식 | 원격 (GS 서버) | 로컬 우선, 자체 호스팅 백엔드 |
| API 표면 | `gs_quant.*` / `Gs*` | `vi_quant.*` / `Vi*` — 시그니처 호환 (수치 동일 아님) |

## 호환성 안내

VibeQuant는 **API 레벨 호환성**(동일 모듈, `Gs`→`Vi` 접두어만 다른 클래스명, 동일 메서드
시그니처)을 목표로 합니다. **수치적으로 동일한 결과를 보장하지 않습니다.**
가격 결정과 리스크는 오픈소스 엔진(QuantLib 등)에서 실행되며, 골드만삭스의 독점 모델과
데이터를 사용하지 않습니다. 알려진 수치 차이는 가격 기능이 추가될 때 모듈별로 문서화합니다
([로드맵](ROADMAP_KR.md) 참조).

## 빠른 시작

```bash
pip install -e .
```

아래 기능은 지금 바로 동작합니다:

```python
import pandas as pd
from vi_quant.session import ViSession
from vi_quant.timeseries import returns, volatility, correlation, moving_average

# 인증 불필요 — 기본 embedded 로컬 모드
ViSession.use()

prices = pd.Series(...)          # 임의의 가격 시계열 (예: yfinance)
r = returns(prices)
vol = volatility(prices, 22)
ma = moving_average(prices, 22)
```

파생상품 가격 결정은 **아직 미구현**입니다 (Phase 2 예정):

```python
# PLANNED (Phase 2) — 목표 API 형태만 표시, 현재 동작하지 않음
from vi_quant.instrument import IRSwap
from vi_quant.risk import Price
IRSwap('Pay', '10y', 'USD').calc(Price())
```

GS Quant에서 마이그레이션은 기계적 rename입니다:

```python
# Before (GS Quant)                      # After (VibeQuant)
from gs_quant.session import GsSession   from vi_quant.session import ViSession
GsSession.use(client_id=..., ...)        ViSession.use()
```

## 아키텍처

GS Quant와 동일한 3계층 아키텍처. Marquee 원격 백엔드를 플러그형 오픈 백엔드로 대체:

| 계층 | 모듈 | GS Quant 백엔드 | VibeQuant 백엔드 |
|---|---|---|---|
| 데이터 | `vi_quant/providers/` | Marquee Data APIs | 통합 제공자: TOSS + Yahoo Finance + Mock (자동 감지) |
| 데이터 | `backend/` | — | REST 데이터 서버 (Express+TS, Redis 캐시, Neon DB, Vercel) |
| 모델 | `vi_quant/instrument/`, `vi_quant/risk/` | GS 가격·리스크 엔진 | QuantLib + 로컬 분석 |
| 애플리케이션 | `vi_quant/markets/`, `vi_quant/backtests/` | Marquee 포트폴리오·백테스트 서비스 | 로컬 포트폴리오 저장소 + 로컬 백테스트 엔진 |

## 문서

모든 기술 문서는 영어로 작성됩니다. 아래는 한국어 참조 문서입니다.

| 문서 | 설명 |
|---|---|
| [README.md](README.md) | 영문 README (공식) |
| [README_KR.md](README_KR.md) | 한국어 README (이 문서) |
| [ROADMAP_KR.md](ROADMAP_KR.md) | 한국어 로드맵 |
| [docs/API_MAPPING.md](docs/API_MAPPING.md) | GS → VI API 매핑표 (영문) |
| [docs/API_MAPPING_KR.md](docs/API_MAPPING_KR.md) | GS → VI API 매핑표 (한국어) |
| [docs/PROVIDER_API_MATCHING.md](docs/PROVIDER_API_MATCHING.md) | TOSS ↔ Yahoo Finance ↔ VibeQuant 통합 인터페이스 매핑 (영문) |
| [docs/PROVIDER_API_MATCHING_KR.md](docs/PROVIDER_API_MATCHING_KR.md) | TOSS ↔ Yahoo Finance ↔ VibeQuant 통합 인터페이스 매핑 (한국어) |
| [docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md) | 공식 GS Quant 문서 대응 매뉴얼 (영문) |
| [docs/OFFICIAL_DOCS_GUIDE_KR.md](docs/OFFICIAL_DOCS_GUIDE_KR.md) | 공식 GS Quant 문서 대응 매뉴얼 (한국어) |
| [SECURITY.md](SECURITY.md) | 보안 정책 문서 (영문, LLM 판독 가능) |

## 현황

**Pre-Alpha 스케폴딩 — 아직 동작하는 가격 엔진이 아닙니다.**

| 모듈 | 상태 |
|---|---|
| `vi_quant.session` (`ViSession`, embedded 모드) | 구현 완료 |
| `vi_quant.errors` (`MqError` 계열) | 구현 완료 (gs-quant에서 vendoring) |
| `vi_quant.timeseries` (algebra, statistics, econometrics, technicals, analysis) | 구현 완료 (gs-quant에서 vendoring, 완전 로컬 동작) |
| `vi_quant.datetime` (캘린더, 상대일자, 일수 계산) | 구현 완료 (vendored; 공휴일 데이터셋은 Phase 1 예정) |
| `vi_quant.data` (`Dataset` 제공자: yfinance/FRED/로컬) | Stub — Phase 1 |
| `vi_quant.providers` (UnifiedProvider: TOSS + Yahoo Finance + Mock) | 구현 완료 (자동 감지, 모든 백엔드에서 동일 시그니처) |
| `backend/` (Express + TypeScript REST 데이터 서버) | 구현 완료 (Yahoo Finance + TOSS API, Upstash Redis, Neon DB, Vercel 배포 준비) |
| `Dockerfile` + `docker-compose.yml` | 구현 완료 (로컬 백테스트, `docker compose up`) |
| `vi_quant.instrument` / `vi_quant.risk` (가격 결정) | 미착수 — Phase 2 |
| `vi_quant.backtests`, `vi_quant.markets` (포트폴리오) | 미착수 — Phase 2+ |

전체 계획은 [ROADMAP_KR.md](ROADMAP_KR.md)를 참조하세요.

## 데이터 제공자 — 함수명 변경 없이 백엔드 교체

```python
from vi_quant.providers import get_provider

# 자동 감지: TOSS(키 있으면) → Yahoo(항상 가능) → Mock(폴백)
p = get_provider()

# 모든 백엔드에서 동일한 5개 함수:
p.fetch_candles("AAPL", 260)           # → [{time, open, high, low, close, volume}]
p.fetch_prices(["AAPL", "TSLA"])       # → {"AAPL": {price, change, changeRate}}
p.fetch_asset("005930")                # → {symbol, name, exchange, currency}
p.provider_name()                      # → "toss" | "yahoo" | "mock"
p.is_available()                       # → True | False

# 특정 제공자 강제:
p = get_provider("yahoo")              # Yahoo Finance (글로벌, 키 불필요)
p = get_provider("mock")               # 결정론적 PRNG (자격증명 불필요)
```

자세한 매핑은 [docs/PROVIDER_API_MATCHING.md](docs/PROVIDER_API_MATCHING.md) 참조.

## Docker 빠른 시작

```bash
cd VibeQuant
docker compose build          # 컨테이너 빌드
docker compose run vibequant  # Mock 제공자로 대화형 Python
docker compose up -d          # Jupyter 서버 :8888 포트

# Yahoo Finance로 강제 (자격증명 불필요):
VI_QUANT_PROVIDER=yahoo docker compose run vibequant
```

## 라이선스

Apache 2.0. VibeQuant는 독립적인 오픈소스 프로젝트입니다. Goldman Sachs와 제휴,
보증, 또는 지원 관계가 없습니다. "GS Quant"는 Apache 2.0 라이선스 하에 API 호환성
목적으로만 참조됩니다.

## 면책

연구·교육 목적으로만 제공됩니다. 어떠한 내용도 투자 조언을 구성하지 않습니다.
실제 자금 운용 전 모든 모델과 데이터를 검증하세요.
