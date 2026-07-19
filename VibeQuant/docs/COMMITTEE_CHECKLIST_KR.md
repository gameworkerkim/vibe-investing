# 멀티 LLM 퀀트 위원회 — 검증 체크리스트

Vibe Quant는 **인공지능 퀀트 헤지펀드의 퀀트 위원회**가 같은 API·같은 시세로
산출물을 재현하는지 확인하는 **기본 스테이지**(교육용 샌드박스 OK)입니다.
GS Quant 대체가 아닙니다. 기본 기능 이후: 백테스트 → 커뮤니티 평가 → LLM 퀀트 확장.

라이브 실행기: https://vibequant-web.pages.dev/#workspace

## 골든 스크립트 (최소 — 교육용 백테스트)

```python
from vi_browser import get_candles, ma_cross_signal, backtest, show_chart

candles = await get_candles("005930", days=180)
sig = ma_cross_signal(candles, fast=10, slow=30)
bt = backtest(candles, sig, fee_bps=10)
show_chart(bt["equity"], title="equity (MA cross)")
print(bt["metrics"])
```

## 위원회 검증 항목

| # | 확인 | 통과 기준 |
|---|---|---|
| 1 | 시세 소스 | stdout에 `source=yahoo` 또는 `r2`/`cache` (mock만이면 재시도) |
| 2 | 바 수 | `days`와 비슷한 길이 (거래일 기준 다소 적을 수 있음) |
| 3 | 지표 | `rsi` / `macd` / `bollinger_bands`(또는 MA/vol)가 유한 값 |
| 4 | 백테스트 지표 | `metrics`에 `total_return`, `mdd`, `sharpe`, `cagr`; `mdd ≤ 0` |
| 5 | 차트 | 결과 패널에 equity(또는 종가) 라인 표시 |
| 6 | 재현 | 동일 스크립트를 두 LLM이 다시 실행해도 같은 숫자(같은 시세 스냅샷) |
| 7 | 금지 | Worker/서버에서 사용자 Python 실행 없음 · Pages에 시크릿 없음 |

## 브라우저 한계

- iOS Safari: Pyodide 실패 가능 → 데스크톱 Chrome/Firefox 권장
- 첫 로드: 수 초~수십 초; RAM을 위해 `days` ≤ ~500 권장
- 교육용 백테스트만: 다음 봉·종가 수익률·단순 수수료 — 프로덕션 엔진 아님
- QuantLib / `IRSwap.calc`: 브라우저 불가 (로컬 / 후속)
- TOSS 실시간: 후순위 (IP 제한) — 스테이지는 Yahoo 사용

## 관련

- [API_MAPPING_KR.md](API_MAPPING_KR.md)
- [LIMITATIONS_KR.md](LIMITATIONS_KR.md)
- [SECURITY.md](../SECURITY.md)
