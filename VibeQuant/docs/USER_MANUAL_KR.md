# Vibe Quant — 사용 매뉴얼 (한국어)

본 서비스는 Quant 학습용으로 개발된 서비스이며, 헤지펀드의 퀀트 알고리즘을 배우기 위한 **교육 샌드박스**입니다. **투자 자문이 아닙니다.**

기본 컨셉은 전통적인 Quant 알고리즘을 이해하기 위해 GS Quant와 유사한 퀀트 API와 별도의 시세 데이터셋으로 서비스를 구성하는 것입니다. 파이썬에 익숙하다면 `vi_browser` / `vi_quant` API로 인사이트를 직접 검증할 수 있습니다.

여기에 **LLM 퀀트 프롬프트**를 더하면, 원하는 질문을 자연어로 입력해 파이썬 퀀트 코드를 만들고 **바로 실행·결과까지** 확인할 수 있습니다.

우리가 잊지 말아야 할 것 한 가지.

*LLM은 계산을 용이하게 하는 엑셀이지, 결과를 만드는 오라클이 아닙니다.*

| 언어 | 매뉴얼 |
|---|---|
| 한국어 | 이 문서 |
| English | [USER_MANUAL.md](USER_MANUAL.md) |
| 中文 | [USER_MANUAL_ZH.md](USER_MANUAL_ZH.md) |

**라이브 데모:** [https://vibequant-web.pages.dev/#workspace](https://vibequant-web.pages.dev/#workspace)

---

## 1. 화면 구성 — LLM과 파이썬 워크벤치

실행기(`#workspace`)는 왼쪽 **LLM 프롬프트**, 오른쪽 **파이썬 입력**으로 나뉩니다. 아래에는 **결과 / Error log / 차트**가 이어집니다.

![LLM 프롬프트 입력과 파이썬 입력 패널](../images/Prompt_Python.png)

| 영역 | 역할 |
|---|---|
| **LLM 프롬프트 입력** (좌) | 자연어 퀀트 요청. 툴바: **모델 → Clear → 복사 → 실행** |
| **파이썬 입력** (우) | `vi_browser` 코드 편집·실행. 툴바: **복사 → Clear → 골든 샘플 → 실행** |
| **결과** | LLM 설명 + Pyodide stdout |
| **Error log** | 비금융 거부, 쿨다운, 파이썬 예외 |
| **차트** | `show_chart(...)` 출력 (호출이 없으면 비어 있음) |

언어는 상단 선택기(`ko` / `en` / `zh`)로 바꿉니다.

### LLM 실행이 실제로 하는 일

**실행**을 누르면 다음이 **한 흐름으로** 진행됩니다.

1. DeepSeek 호출 (금융 게이트)  
2. 파이썬이 있으면 → **파이썬 입력에 코드 자동 삽입**  
3. **즉시 Pyodide로 실행** → print는 **결과**, `show_chart`는 **차트**, 오류는 **Error log**

코드를 손본 뒤에는 LLM을 다시 부르지 말고, 오른쪽 **파이썬 실행**만 누르면 됩니다.

---

## 2. Examples · API 샘플 — GS Quant ↔ VI Quant

페이지 상단 **Examples** 칩과 **GS Quant ↔ VI Quant API** 표로, 브라우저에서 바로 도는 샘플을 로드할 수 있습니다.

![GS Quant ↔ VI Quant API 설명과 샘플 로드](../images/Quant_Sample.png)

- 규칙: `gs_quant` → `vi_quant`, `Gs*` → `Vi*`  
- **BROWSER**(초록): 이 페이지(Pyodide)에서 실행  
- **LOCAL**(파랑): `pip` 로컬 라이브러리  
- **PLANNED**(보라): 예정 (예: TOSS 실시간)  
- 행의 **샘플 로드** → 파이썬 에디터에 코드 삽입 → **실행**

### Examples 칩 사용 순서

1. **Examples**에서 Momentum / RSI / MA / multifactor 등 선택  
2. **파이썬 입력**에 코드가 채워지면 확인 후 **실행**  
3. **결과** · **차트** · 필요 시 **Error log** 확인  

| 컨트롤 | 동작 |
|---|---|
| **골든 샘플** | multifactor 위원회 데모 |
| **Clear** | 에디터 비우기 (LLM / 파이썬 각각) |
| **복사** | 프롬프트 또는 코드 복사 |
| API 표 **샘플 로드** | 해당 API 짧은 스니펫 |

팁: `days` ≤ 180, 데스크톱 Chrome/Firefox 권장.

---

## 3. LLM으로 퀀트 만들기

DeepSeek는 금융 전용 프롬프트를 **설명**하거나 **실행 가능한 `vi_browser` 파이썬**으로 바꿉니다.  
API 키는 Worker에만 있습니다 → [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md) · [LLM_QUANT_PROMPT_KR.md](LLM_QUANT_PROMPT_KR.md).

### 기본 순서

1. **모델**: `V4 Flash`(기본) / `V4 Pro`  
2. 골든 칩을 누르거나 프롬프트를 직접 입력  
3. **실행** (30초에 1회)  
4. **결과**에서 LLM 답 + `=== Pyodide run ===` 실행 출력 확인  
5. 차트는 코드에 `show_chart`가 있을 때만 표시  

### 퀀트 기초 (이 사이트 정의)

| 개념 | 의미 | API |
|---|---|---|
| 모멘텀 N일 | \(P_t/P_{t-N}-1\) | `momentum(closes, window=N)` |
| 이동평균 | 최근 N일 종가 평균 | `moving_average(closes, N)` |
| MA 크로스 | 단기 MA > 장기 MA → 롱(1) | `ma_cross_signal(candles, fast, slow)` |
| RSI(14) | ≥70 과매수 / ≤30 과매도 | `rsi(closes, 14)` |
| 변동성 | 수익률 σ × √252 | `volatility(closes, 22)` |
| MDD | 고점 대비 최대 낙폭(음수 비율) | `max_drawdown(closes)` |
| 백테스트 | 교육용 equity·metrics | `backtest(candles, signal, fee_bps=…)` |

시세:

```python
candles = await get_candles("NVDA", days=180, provider="yahoo")
closes = [c["close"] for c in candles]   # pandas / iloc 금지
```

한국 종목은 보통 `005930.KS`처럼 **`.KS`** 접미사가 필요합니다.

### 시나리오별 사용 예

#### A. 크로스섹션 모멘텀 랭킹

```text
NVDA, MU, SNDK, AVGO의 22일 모멘텀을 비교해줘.
계산 가능한 종목만 랭킹하고 N/A는 제외해.
vi_browser 파이썬을 만들고 show_chart로 모멘텀 시계열도 그려줘.
```

| 보는 곳 | 내용 |
|---|---|
| 결과 | 설명 + Pyodide 랭킹 출력 |
| 파이썬 입력 | 생성된 코드 |
| 차트 | 종목별 모멘텀 시계열 |

#### B. MA 크로스 교육용 백테스트

```text
005930.KS(삼성전자) MA(10/30) 크로스 교육용 백테스트.
fee_bps=10, metrics(total_return, mdd, sharpe, cagr) 출력,
equity를 show_chart로 그려줘.
```

권장 형태:

```python
signals = ma_cross_signal(candles, fast=10, slow=30)
result = backtest(candles, signals, fee_bps=10)
print(result["metrics"])
show_chart(result["equity"], title="Equity", series_label="equity")
```

#### C. RSI 구간

```text
AAPL과 TSLA의 RSI(14) 최근 값을 비교하고
overbought/oversold/mid 구간을 알려줘. 가능하면 show_chart로 RSI를 그려줘.
```

#### D. 변동성 · MDD (크립토)

```text
BTC-USD와 ETH-USD의 연율화 변동성(22)과 max_drawdown을
vi_browser로 계산해 숫자와 함께 비교 설명해줘.
```

#### E. 설명만 (실행 없음)

```text
Momentum = close/close[22]-1 공식을 한국어로 짧게 설명해줘.
코드 실행 없이 answer 모드로만 답해.
```

#### F. 비금융 → 거부

금융(미국·한국 주식·크립토·퀀트)이 아니면 Error log에 안내가 뜨고 약 1분 쿨다운됩니다.

### 규칙 요약

- 최상위 `await`만 (`asyncio.run` 금지)  
- `None`에 `:.2f` 금지 → `fmt` / `last_num`  
- 차트 필요 시 프롬프트에 `show_chart`를 명시  

스키마: [LLM_OUTPUT_SCHEMA_KR.md](LLM_OUTPUT_SCHEMA_KR.md).

---

## 4. 파이썬으로 퀀트 만들기

LLM 없이, 또는 생성 코드를 다듬을 때 **파이썬 입력 → 실행**을 사용합니다.  
계산은 브라우저(Pyodide), 시세는 Worker(`provider="yahoo"`)입니다.

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
rows, series = [], {}

for sym in TICKERS:
    candles = await get_candles(sym, days=180, provider="yahoo")
    closes = [c["close"] for c in candles]
    m = momentum(closes, WINDOW)
    last = last_num(m)
    series[sym] = m
    rows.append((sym, last))
    print(f"{sym}: mom{WINDOW}={fmt(None if last is None else last * 100)}%")

ranked = sorted([(s, v) for s, v in rows if v is not None], key=lambda x: -x[1])
print("rank:", ", ".join(f"{s}={fmt(v * 100)}%" for s, v in ranked))
show_chart(series, title="22d momentum", series_label="mom")
```

### 자주 쓰는 API

| API | 용도 |
|---|---|
| `get_candles(...)` | OHLCV dict 리스트 |
| `returns` / `volatility` / `moving_average` | 기본 시계열 |
| `momentum(closes, window=22)` | 가격 모멘텀(비율) |
| `rsi` / `macd` / `bollinger_bands` | 지표 |
| `max_drawdown(closes)` | MDD 스칼라 |
| `ma_cross_signal` / `backtest` | 교육용 시그널·백테스트 |
| `show_chart(...)` | 우측 차트 |

전체 매핑: [API_MAPPING_KR.md](API_MAPPING_KR.md).

---

## 5. 한계와 주의

- Cloudflare 무료 티어 + 브라우저 RAM — GS Quant / Marquee 대체가 아닙니다.  
- 수치는 **교육·재현**용이며 매매 신호가 아닙니다.  
- LLM은 Worker에 DeepSeek 설정 필요 (`/api/health` → `deepseek.configured: true`).  
- [LIMITATIONS_KR.md](LIMITATIONS_KR.md) 및 사이트 하단 고지.

*LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.*
