# SEMICONDUCTOR-QUANT-PROMPTS-V2 검증 리포트 (합성 데이터)

- 기준일(AS_OF): 2026-11-09 · 백테스트: 2020-01-02 ~ 2026-11-06

> 프롬프트의 규칙이 '코드로 실행 가능한가'를 검증한다. 실시장 성과가 아니라 규칙의 정합성·룩어헤드 차단·사이징 실행가능성·워크포워드 프로세스를 확인하는 것이 목적이다.

## 1. 규칙 정합성 검사 (데이터 불필요)

전체 20개 검사 중 **20개 통과**, 0개 실패.

| 검사 | 결과 |
|---|---|
| weights_sum_A[R1] | OK |
| weights_sum_A[R2] | OK |
| weights_sum_A[R3] | OK |
| weights_sum_A[R4] | OK |
| weights_sum_A[N/A] | OK |
| weights_sum_B[GPU] | OK |
| weights_sum_B[CPU] | OK |
| weights_sum_B[MEM] | OK |
| weights_sum_B[STO] | OK |
| weights_sum_D_base | OK |
| weights_sum_D_timing_low | OK |
| v1_sizing_contradiction (원본 160%/4종목/15%상한) | OK |
| v2_sizing_feasibility (120%/70%, 롱6~8·숏4~6, 20%/12%) | OK |
| regime_rule_coverage (a,b,c 부호 조합 8개) | OK |
| regime_na_fallback (입력 2개 이상 N/A -> N/A/low) | OK |
| prompt_E_thresholds_monotonic (x75 < x50 < exclude) | OK |
| crowd_z_component_weights (13F ≤ 20%, 합=1) | OK |
| json_schema_keys (3.2 출력 스키마) | OK |
| hedge_spec (풋 스프레드 -10%/-20%, 예산 1.5%, DD트리거 -10%) | OK |
| lookahead_policy (AS_OF 이후 데이터 사용 금지) | OK |

### 사이징 모순 해소 (v1 → v2)

원본은 '롱 160% / 4종목 / 종목당 15% 상한'으로 최대 60%밖에 달성할 수 없어 수학적으로 불가능했다. v2는 롱 120% / 6~8종목 / 20% 상한으로 정합적이다.

![sizing](result/06_sizing_feasibility.png)

## 2. 단위 테스트

20개의 정적 검사 외, `tests.py` 22개 테스트 실행 — 실패 0, 오류 0.

## 3. 사이클 국면 판정 (프롬프트 A 2))

합성 데이터의 진국면 대비 규칙 기반 판정 일치율 **91%** (82개월). 2개 이상 입력 N/A면 N/A+low로 폴백된다.

![regime](result/03_regime_timeline.png)

## 4. AS_OF 시점 compute 데모 (프롬프트 A/B/C/E)

`result/prompt_a_compute_asof.json`(3.2 스키마), `result/prompt_c_positions_asof.json`(포지션+제약 체크), `result/prompt_b_candidates_asof.csv`(팩터 기여 분해)를 생성했다.

![composite](result/07_composite_asof.png)

## 5. 워크포워드 백테스트 (프롬프트 D)

- 파라미터 선택: 모멘텀 기본 가중치 후보 [30.0, 40.0, 50.0] 중 IS(2021-2024) 샤프 기준 **50** 선택 → OOS(2025-01~AS_OF)에 고정 적용.

| 구간 | CAGR | 연 변동성 | Sharpe | MaxDD | Calmar |
|---|---|---|---|---|---|
| full | 3.3% | 9.7% | 0.39 | -32.6% | 0.10 |
| in_sample_2021_2024 | 2.2% | 10.5% | 0.26 | -22.4% | 0.10 |
| out_of_sample_2025_2026 | 13.4% | 7.4% | 1.74 | -9.1% | 1.48 |

- 스트레스 구간(2026-07~08, 튜닝 금지): 헤지 없음 -3.1%, 헤지 포함 0.8%. 연 헤지 비용 1.45%, 헤지 효율(손실 감소/연 헤지 비용) = **2.6819**

![equity](result/01_equity_curve.png)

![dd](result/02_drawdown.png)

![stress](result/05_stress_zoom.png)

![weights](result/04_factor_weights.png)

## 6. 검증 중 발견된 프롬프트 이슈

1. **프롬프트 C 후보 규칙 내부 충돌**: 유니버스 15종목에서 'composite 상위 1/3'은 5종목인데 '롱 6~8종목' 규칙과 맞지 않는다. 검증 코드는 종목 수 규칙을 우선(상위 6)하고 이 갭을 `data_gaps`로 보고한다.
2. **숏 후보 부족**: 롱/숏 후보가 겹치는 종목이 있어 유효 숏 후보가 4종목 미만으로 줄 수 있다. 3.1의 확장 유니버스(9종목 추가)가 이 갭의 해소 경로다.
3. **국면 판정 경계월**: a/b/c z-score가 경계 근처에서 노이즈에 흔들려 국면 전환 인접월 오분류가 발생(합성 데이터 기준 일치율 91.5%). 실데이터에서는 판정월 기준 1개월 지연 확정 등 완충 규칙을 검토할 수 있다.

## 7. 산출물

- `result/consistency_report.json`, `backtest_summary.json`, `backtest_equity.csv`, `factor_weights_monthly.csv`, `factor_returns_daily.csv`, `regime_history.csv`, `prompt_a_compute_asof.json`, `prompt_b_candidates_asof.csv`, `prompt_c_positions_asof.json`, `factor_table_asof.json`
- 실행: `python script/run_validation.py` (Python 3.9+, pandas/numpy/matplotlib). 옵션: `--no-charts`, `--skip-tests`

> **고지:** 본 검증은 합성(synthetic) 데이터 기반이며 특정 종목 매매를 권유하지 않는다. 모든 가중치는 초기값이다. 실데이터 검증 시 `synthetic_data.py`의 데이터 계약과 동일한 컬럼으로 교체하면 된다.