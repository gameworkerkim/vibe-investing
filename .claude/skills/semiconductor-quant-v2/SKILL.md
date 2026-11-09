---
name: semiconductor-quant-v2
description: 반도체 4개 서브섹터(GPU/CPU/메모리/스토리지) 퀀트 스코어링·포트폴리오 구성·백테스트를 수행한다. 이 저장소의 SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11 프롬프트(프롬프트 A~E)와 검증 파이프라인(script/run_validation.py)을 재사용한다. 사용자가 "반도체 퀀트", "semiconductor quant", "국면 판정", "모멘텀 스코어", "크라우딩", "워크포워드 백테스트", "SEMI 스코어" 등을 요청하거나 <DATA> 블록을 주며 반도체 종목 스코어/포지션을 요구할 때 사용한다. 일반 투자 조언, 다른 전략, 반도체 외 종목의 무관한 백테스트에는 사용하지 않는다.
---

# Semiconductor Quant V2 — 반도체 퀀트 스킬

이 스킬은 `01.Trading Strategy/Awesome claude quant scripts/SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11/`
폴더의 프롬프트 규칙(A~E)과 검증 파이프라인을 그대로 재사용한다. 새 규칙을 만들지 않는다.
**LLM은 엑셀이지 오라클이 아니다** — 규칙은 프롬프트에서, 숫자는 주입된 데이터에서 나온다.

- 규칙 원문: `SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11.md` (소스 오브 트루스)
- 축약 규칙표: `references/regime-and-factors.md`, `references/portfolio-and-backtest.md`
- 검증 파이프라인: `script/run_validation.py` (정합성 검사 20개 + 단위 테스트 22개 + 워크포워드 백테스트)

## 모드 판정 (사용자 요청에서 결정)

| 사용자 요청 | 모드 |
|---|---|
| `<DATA>` 블록과 함께 스코어/국면/포지션 요구 | `compute` |
| "코드로 만들어줘" / "백테스트 코드" / "Python 구현" | `codegen` |
| "검증해줘" / "돌려봐" / "백테스트 실행" | `validate` (파이프라인 실행) |
| 이미 나온 `result/` 산출물 해석 요청 | `interpret` |

## 공통 계약 (모든 모드에 적용)

- **기준일 AS_OF**: 요청에 주어진 날짜 이후 정보는 사용하지 않는다(룩어헤드 차단). 학습 데이터의 시장 서사는 신호가 아니라 "검증할 가설"로만 취급한다.
- **데이터 계약**: `<DATA>` 블록의 수치만 사용한다. 없는 값은 기억·추정으로 채우지 말고 `N/A(데이터 없음)`로 표기하고, 그 값이 필요한 스코어는 산출하지 않는다. 0으로 채우는 것도 금지.
- **수익률**: USD 기준 배당 포함 총수익률. 한국 상장 종목은 KRW→USD 환산 후 미국 거래 캘린더에 맞춰 직전 종가 이월(carry-forward).
- **이익**: NTM(향후 12개월) 블렌디드 EPS만 사용. FY 기준은 회계연도 차이로 왜곡되므로 금지.
- **출력**: 본문 설명 10줄 이내 + 마지막에 3.2 JSON 스키마 하나만 출력. 매수·매도 권유, 목표주가, `<DATA>` 밖 수치 인용 금지. 판단 근거는 `rationale_codes`(예: REV_UP, CROWD_HIGH, REGIME_R3, DIVERGENCE_HIGH, VALUE_TRAP, QUALITY_MOMENTUM)로 기록.

## compute 모드

1. `references/regime-and-factors.md`의 규칙으로 사이클 국면(R1~R4/N/A)과 팩터 z-score를 계산한다. 중간 산출물 표(원시값 → z-score → 가중합)를 **반드시** 보여준다.
2. 프롬프트 A 컴포지트 = Σ(국면별 가중치 × 서브섹터 중립 z) → 0~100 백분위. 서브섹터별 상위 2 롱 후보 / 하위 1 언더웨이트 후보.
3. 요청에 포지션 구성이 포함되면 `references/portfolio-and-backtest.md`의 프롬프트 C/E 규칙으로 후보 선정·crowd_z·사이징·리스크 트리거를 적용하고 제약 위반 체크리스트를 함께 출력한다.
4. 출력 JSON은 원문 3.2 스키마(`references/`의 output-schema 예시)와 정확히 일치해야 한다.
5. 서브섹터 내 종목이 3개 미만이면 그 서브섹터 내 z-score는 계산하지 않는다. 상장 기간이 신호 룩백보다 짧은 종목은 해당 신호를 N/A로 둔다.

## codegen 모드

프롬프트 D의 "codegen" 계약을 따른다: 같은 로직을 Python(pandas) 함수로 작성하고 **단위 테스트를 포함**한다. 수치 계산은 하지 않는다.

- `factors.py`(mom_12_1·mom_3m·revision·quality·value·low_vol), `regime.py`(국면 판정), `portfolio.py`(크라우딩·사이징), `hedge.py`(풋 스프레드), `backtest.py`(워크포워드)로 모듈화.
- 백테스트 사양(원문 5절): 데이터 2020-01~, 12M 워밍업, 평가 2021-01~AS_OF, 워크포워드(파라미터는 2021~2024에서만 결정), 2026-07은 튜닝 금지 스트레스 구간, 결측 N/A, 비용(수수료 3bp+슬리피지 5bp, 숏 차입비용 일할, 옵션 스프레드 절반), 보고 지표(CAGR·변동성·샤프·MDD·칼마·회전율·헤지 효율).
- 이 레포의 `script/` 구현을 참조 구현으로 활용하되 그대로 복사하지 말고, 요청된 환경(Qlib/vectorbt 등)에 맞게 작성한다.

## validate 모드 (파이프라인 실행)

```bash
cd "<repo>/01.Trading Strategy/Awesome claude quant scripts/SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11"
python3 script/run_validation.py            # 전체: 정합성 검사+테스트+백테스트+차트 (~80초)
python3 script/run_validation.py --no-charts --skip-tests   # 빠른 실행
python3 -m unittest script/tests -v         # 단위 테스트만
```

결과는 `result/`에 저장된다: `consistency_report.json`, `backtest_summary.json`, `backtest_equity.csv`, `factor_weights_monthly.csv`, `regime_history.csv`, `prompt_a_compute_asof.json`, `prompt_c_positions_asof.json`, 차트 PNG 7장, `validation_report.md`.

실행 후 채팅에는 다음을 요약한다(터미널 출력 원문을 그대로 붙여넣지 않는다):
- 정합성 검사 통과 수 / 단위 테스트 결과 / 국면 판정 일치율
- 워크포워드 선택 파라미터와 IS/OOS/스트레스 구간 성과(샤프·MDD·헤지 효율)
- 발견된 프롬프트 이슈(예: "상위 1/3 vs 롱 6~8종목" 충돌, 숏 후보 부족) — `result/validation_report.md` 6절 참고

## interpret 모드

`result/`의 JSON/CSV/PNG를 읽고 한국어로 해석한다. 합성 데이터 기반이라는 점과 "모든 가중치는 초기값"임을 반드시 함께 명시한다. 특정 종목 매매를 권유하지 않는다.

## 알아둘 점

- 이 스킬의 수치(가중치·임계값)는 원문 프롬프트의 **초기값**이다. 검증 후에도 수치는 바뀌지 않았다면 사용자에게 "초기값이며 워크포워드 검증 결과 X"라고 짚어준다.
- `<DATA>`가 없는 compute 요청은 수치를 만들지 말고, 어떤 데이터가 필요한지(3.1 유니버스 + 8절 데이터 소스 매핑) 물어본다.
- 원문 프롬프트가 바뀌면 이 스킬의 references와 `script/config.py`를 함께 갱신해야 한다(문서-스킬-코드 1:1 대응).
