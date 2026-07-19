# VibeQuant 데이터 제공자 API 매칭표 (한국어)

이 문서는 TOSS Open API와 Yahoo Finance 데이터 소스를 VibeQuant 통합 제공자
인터페이스로 매핑합니다. 목표: **데이터 소스를 함수명 변경 없이 교체할 수 있게 하는 것**.

## 통합 인터페이스 (Python)

```
vi_quant/providers/
├── __init__.py          # 활성 제공자 재수출
├── unified.py           # UnifiedProvider 기본 클래스 + 팩토리
├── toss_provider.py     # TOSS Open API 어댑터 (한국·미국 주식)
├── yahoo_provider.py    # Yahoo Finance 어댑터 (글로벌)
└── mock_provider.py     # 결정론적 Mock (자격증명 불필요)
```

모든 제공자는 **동일한 시그니처**의 5개 함수를 노출합니다:

| # | 함수 | TOSS | Yahoo Finance | Mock | 목적 |
|---|---|---|---|---|---|
| 1 | `fetch_candles(code, days=260)` | `GET /api/v1/candles` | `yf.historical()` | 결정론적 PRNG | 일봉 시계열 `[{time, close, ...}]` |
| 2 | `fetch_prices(codes)` | `GET /api/v1/prices` | `yf.quote()` 배치 | 결정론적 PRNG | 현재가 `Map<code, {price, change, changeRate}>` |
| 3 | `fetch_asset(code)` | `GET /api/v1/stocks` | `yf.quoteSummary()` | 정적 조회 테이블 | 자산 메타데이터 (이름, 거래소, 통화, 유형) |
| 4 | `is_available()` | `TOSS_CLIENT_ID + TOSS_CLIENT_SECRET` env 확인 | 항상 `True` (키 불필요) | 항상 `True` | 이 제공자가 설정되었는가? |
| 5 | `provider_name()` | `"toss"` | `"yahoo"` | `"mock"` | 제공자 식별자 문자열 |

## 엔드포인트 매핑: TOSS → Yahoo Finance → 통합

### 캔들 (과거 가격)

| 기능 | TOSS 엔드포인트 | Yahoo Finance | 통합 출력 |
|---|---|---|---|
| URL | `GET /api/v1/candles` | `yahooFinance.historical()` | `fetch_candles(code, days)` |
| 파라미터 | `?symbol=&interval=1d&count=200&before=` | `{symbol, period1, period2, interval}` | `(code: str, days: int)` |
| 호출당 최대 | 200봉 | ~10년치 일봉 | 내부 페이지네이션 |
| 속도 제한 | ~1 req/s | ~2000 req/hr | 내부 스로틀링 |
| 간격 | `1d` 전용 | `1d`, `1wk`, `1mo` | 기본 `1d` |
| 인증 | Bearer 토큰 (OAuth2) | 없음 | 제공자별 |
| 시장 | KR + US | 글로벌 | 제공자별 필터링 |
| 반환 필드 | `time, open_price, close_price, high_price, low_price, volume` | `date, open, high, low, close, volume` | 정규화: `{time, open, high, low, close, volume}` |
| 심볼 형식 | KR: `069500`, US: `AAPL` | 모두 대문자: `AAPL`, `TSLA` | 제공자별; 래퍼가 접미사 추가 |
| 정렬 순서 | desc (TOSS) → 래퍼가 asc 정렬 | asc | 항상 asc (오래된 순) |

### 현재가

| 기능 | TOSS 엔드포인트 | Yahoo Finance | 통합 출력 |
|---|---|---|---|
| URL | `GET /api/v1/prices` | `yahooFinance.quote()` | `fetch_prices(codes)` |
| 파라미터 | `?symbols=CODE1,CODE2,...` | `[symbols]` | `(codes: list[str])` |
| 최대 심볼 | 호출당 200개 | 호출당 ~50개 | 내부 청크 분할 |
| 인증 | Bearer 토큰 | 없음 | 제공자별 |
| 반환 필드 | `symbol, price, change, changeRate` | `symbol, regularMarketPrice, ...` | 정규화: `{code: {price, change, changeRate}}` |

### 자산 메타데이터

| 기능 | TOSS 엔드포인트 | Yahoo Finance | 통합 출력 |
|---|---|---|---|
| URL | `GET /api/v1/stocks?symbol=` | `yahooFinance.quoteSummary()` | `fetch_asset(code)` |
| 인증 | Bearer 토큰 | 없음 | 제공자별 |
| 반환 필드 | `symbol, name, exchange, currency, type` | `price.shortName, price.exchangeName, ...` | `{symbol, name, exchange, currency, assetType}` |

## 제공자 선택 로직

우선순위 (런타임 자동 감지):

```
1. TOSS   — TOSS_CLIENT_ID + TOSS_CLIENT_SECRET 설정 시 (한국·미국 주식)
2. Yahoo  — 항상 폴백으로 사용 가능 (글로벌, 키 불필요)
3. Mock   — 아무것도 설정되지 않은 경우 (자격증명 없음)
```

`UnifiedProvider`가 자동 선택하며, 환경 변수로 강제 지정 가능:

```python
# 자동 감지 (TOSS > Yahoo > Mock 우선)
from vi_quant.providers import get_provider
provider = get_provider()

# 특정 제공자 강제
provider = get_provider("yahoo")
provider = get_provider("mock")
```

## 마이그레이션 치트 시트

### TOSS.js → vi_quant providers (Python)

```python
# Before (TOSS Node.js)
# const { fetchCandles, fetchPrices, isMock } = await import('./src/toss.js');

# After (VibeQuant Python)
from vi_quant.providers import get_provider

provider = get_provider()
candles = provider.fetch_candles("069500", days=260)
prices   = provider.fetch_prices(["069500", "AAPL"])
info     = provider.fetch_asset("069500")
print(f"사용 중: {provider.provider_name()}, 사용 가능: {provider.is_available()}")
```

### 직접 제공자 사용 (자동 감지 우회)

```python
from vi_quant.providers.toss_provider import TossProvider
from vi_quant.providers.yahoo_provider import YahooProvider
from vi_quant.providers.mock_provider import MockProvider

# TOSS 전용 (한국 시장 1차)
toss = TossProvider()
samsung = toss.fetch_candles("005930")

# Yahoo 전용 (글로벌 커버리지)
yahoo = YahooProvider()
apple = yahoo.fetch_candles("AAPL")

# Mock 전용 (결정론적 테스트 데이터)
mock = MockProvider()
test_data = mock.fetch_candles("TEST", 100)
```

## 심볼 형식 규칙

| 시장 | TOSS 심볼 | Yahoo 심볼 | Mock |
|---|---|---|---|
| KOSPI 200 ETF | `069500` | `069500.KS` | `069500` |
| Samsung Electronics | `005930` | `005930.KS` | `005930` |
| Apple | `AAPL` | `AAPL` | `AAPL` |
| Tesla | `TSLA` | `TSLA` | `TSLA` |

제공자는 심볼 형식을 내부적으로 처리합니다. 사용자는 항상 **TOSS 스타일 베어 코드**
(예: KODEX 200은 `"069500"`, Apple은 `"AAPL"`)를 전달합니다. Yahoo 제공자는
숫자형 한국 코드에 `.KS` 접미사를 자동으로 추가합니다.
