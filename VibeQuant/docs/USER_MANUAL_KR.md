# Vibe Quant — 사용 매뉴얼 (한국어)

멀티 LLM 퀀트 위원회용 교육 샌드박스입니다. 투자 자문이 아닙니다.

| 언어 | 매뉴얼 |
|---|---|
| 한국어 | 이 문서 |
| English | [USER_MANUAL.md](USER_MANUAL.md) |
| 中文 | [USER_MANUAL_ZH.md](USER_MANUAL_ZH.md) |

**라이브 데모:** [https://vibequant-web.pages.dev/#workspace](https://vibequant-web.pages.dev/#workspace)

---

## 1. 화면 구성

| 영역 | 역할 |
|---|---|
| **LLM 프롬프트 입력** (좌상) | 자연어 퀀트 요청 → DeepSeek → (선택) 파이썬 생성 |
| **파이썬 입력** (우상) | 브라우저(Pyodide)에서 `vi_browser` 코드 편집·실행 |
| **결과** (좌하) | 성공 stdout / LLM 답변 |
| **Error log** (좌하) | 실패, 트레이스백, 거부된 프롬프트 |
| **차트** (우하) | `show_chart(...)` 출력 |

언어는 상단 선택기(`ko` / `en` / `zh`)로 바꿉니다.

---

## 2. Examples(샘플) 사용법

Examples 칩은 반도체 바스켓(**NVDA · MU · SNDK · AVGO**)용 데모 코드를 파이썬 에디터에 넣습니다.

### 순서

1. 사이트에서 **Examples** 칩 바(또는 `#workspace`)로 이동합니다.
2. **Momentum**, **RSI**, **Moving Average**, 골든 **multifactor** 등 칩을 클릭합니다.
3. **파이썬 입력**에 코드가 채워지면 내용을 확인한 뒤 **실행**을 누릅니다.
4. **결과**에서 print, **차트**에서 시계열, 실패 시 **Error log**를 확인합니다.

### 버튼

| 컨트롤 | 동작 |
|---|---|
| **골든 샘플** | 위원회 multifactor 데모 로드 |
| **Clear** | 파이썬 에디터 비우기 |
| **복사** 아이콘 | 파이썬 / LLM 프롬프트 클립보드 복사 |
| API 표 **샘플 로드** | 해당 행의 짧은 API 샘플 로드 |

### 팁

`days`는 180 이하를 권장합니다. 긴 시리즈는 브라우저 RAM을 많이 씁니다. 데스크톱 Chrome/Firefox를 권장합니다(iOS에서 Pyodide가 실패할 수 있음).

---

## 3. LLM으로 퀀트 만들기

DeepSeek가 금융 전용 프롬프트를 설명 및/또는 실행 가능한 `vi_browser` 파이썬으로 바꿉니다. API 키는 Worker에만 있습니다. 설정: [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md) · 기능: [LLM_QUANT_PROMPT_KR.md](LLM_QUANT_PROMPT_KR.md).

### 순서

1. **LLM 프롬프트 입력**에서 **모델**을 고릅니다. `V4 Flash`(기본, 속도) / `V4 Pro`(무거운 코드).
2. 금융 질문을 직접 쓰거나, 골든 LLM 칩(예: 반도체 모멘텀)을 클릭합니다.
3. **실행**을 누릅니다. 제한: **30초에 1회**.
4. 진행: DeepSeek 호출 → (있으면) 생성 파이썬 실행.
5. 결과물:
   - **결과**: 답변·실행 요약  
   - **파이썬 입력**: 코드가 오면 자동 반영  
   - **차트**: `show_chart` 호출 시  
   - **Error log**: 비금융 거부, 쿨다운, 런타임 오류  

### 좋은 프롬프트 예시

```text
NVDA, MU, SNDK, AVGO의 22일 모멘텀을 비교해줘.
계산 가능한 종목만 랭킹하고, N/A는 제외해.
vi_browser로 파이썬을 만들어 실행 가능하게 해줘.
```

```text
005930(삼성전자)에 대해 MA(10/30) 크로스 교육용 백테스트를 돌려줘.
fee_bps=10, metrics(total_return, mdd, sharpe, cagr)를 출력하고 equity를 show_chart로 그려줘.
```

```text
퀀트에서 22일 모멘텀 Momentum = close/close[22]-1 공식을 한국어로 짧게 설명해줘.
코드 실행 없이 answer 모드로만 답해.
```

### 모델이 지켜야 할 규칙

- 금융만 (미국·한국 주식, 크립토, 퀀트 지표). 그 외는 거부(쿨다운).
- 브라우저는 **리스트 API** (pandas 아님):
  - `candles = await get_candles("NVDA", days=180, provider="yahoo")`
  - `closes = [c["close"] for c in candles]`
- 최상위 `await`만 — `asyncio.run` 금지.
- `None`에 `:.2f` 금지 — `fmt` 헬퍼 사용.
- 한국 종목은 보통 `.KS` (예: `000660.KS`).

스키마: [LLM_OUTPUT_SCHEMA_KR.md](LLM_OUTPUT_SCHEMA_KR.md).

---

## 4. 파이썬으로 퀀트 만들기

**파이썬 입력**에 `vi_browser` 코드를 쓰고 **실행**합니다. 계산은 브라우저(Pyodide), 시세는 Worker(`provider="yahoo"`)입니다.

### 최소 템플릿

```python
from vi_browser import get_candles, momentum, show_chart

def fmt(x, n=2):
    return "N/A" if x is None else f"{x:.{n}f}"

def last_num(xs):
    for x in reversed(xs):
        if x is not None:
            return x
    return None

TICKERS = ["NVDA", "MU", "AVGO"]
WINDOW = 22

rows = []
series = {}
for sym in TICKERS:
    candles = await get_candles(sym, days=180, provider="yahoo")
    closes = [c["close"] for c in candles]
    m = momentum(closes, WINDOW)
    last = last_num(m)
    series[sym] = m
    rows.append((sym, last))
    print(f"{sym}: mom{WINDOW}={fmt(None if last is None else last * 100)}%")

ranked = sorted([(s, v) for s, v in rows if v is not None], key=lambda x: -x[1])
print("rank:", ", ".join(f"{s}={fmt(v*100)}%" for s, v in ranked))
show_chart(series, title="22d momentum", series_label="mom")
```

### 자주 쓰는 `vi_browser` API

| API | 용도 |
|---|---|
| `get_candles(symbol, days=..., provider="yahoo")` | OHLCV dict 리스트 |
| `returns` / `volatility` / `moving_average` | 기본 시계열 |
| `momentum(closes, window=22)` | 가격 모멘텀 |
| `rsi` / `macd` / `bollinger_bands` | 지표 |
| `max_drawdown(closes)` | MDD 스칼라 |
| `backtest` / `ma_cross_signal` | 교육용 백테스트 |
| `show_chart(...)` | 우측 차트 |

GS → VI 이름 매핑: [API_MAPPING_KR.md](API_MAPPING_KR.md). 사이트 API 페이지: `apis.html`.

### 작업 흐름 팁

1. **Examples** 칩으로 시작한 뒤 티커·윈도우만 수정합니다.
2. 또는 **LLM**으로 초안을 받은 뒤 손으로 다듬고 다시 **실행**합니다.
3. `None` 포맷 오류는 **Error log**를 보고 `fmt` / 길이 검사를 추가합니다.
4. 캔들이 너무 짧으면 잠시 후 재시도합니다(Worker가 짧은 R2 캐시를 버리고 Yahoo를 다시 받습니다).

---

## 5. 한계와 주의

- Cloudflare 무료 티어 + 브라우저 RAM — GS Quant/Marquee 대체가 아닙니다.
- 수치는 **교육·재현**용이며 매매 신호가 아닙니다.
- LLM 기능은 Worker에 DeepSeek가 설정되어 있어야 합니다 (`/api/health`의 `deepseek.configured: true`).
- [LIMITATIONS_KR.md](LIMITATIONS_KR.md) 및 사이트 하단 고지를 읽으세요.

*LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.*
