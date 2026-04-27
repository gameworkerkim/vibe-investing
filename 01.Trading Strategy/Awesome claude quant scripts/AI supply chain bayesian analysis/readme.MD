# AI Supply Chain — Bayesian Multi-Factor Analysis

> *AI 공급망 종목의 단기 상승 확률을 베이지안 멀티팩터 프롬프트로 분석하는 LLM 기반 퀀트 분석 도구*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Series](https://img.shields.io/badge/Series-Awesome%20Claude%20Quant%20Scripts-orange)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)

---

## 핵심 문서 및 스크립트

| 자료 | 링크 |
|------|------|
| ** 분석 보고서 (한국어 전체)** | [AI supply chain bayesian analysis kr.MD](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/AI%20supply%20chain%20bayesian%20analysis%20kr.MD) |
| ** 분석 프롬프트 (재사용 가능)** | [src/Bayesian long prompt.txt](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/src/Bayesian%20long%20prompt.txt) |

---

## 본 모듈의 위치

다른 Awesome Claude Quant Scripts 모듈이 *코드 기반 백테스트 전략*이라면, 본 모듈은 **LLM(Claude)을 베이지안 분석가로 활용하는 프롬프트 엔지니어링 패턴**입니다.

- 입력: 자연어 프롬프트
- 출력: 구조화된 멀티팩터 분석 보고서
- 가치: *"같은 프롬프트로 동일 형식의 보고서를 재생성"* 가능한 재현성

---

## 빠른 사용법

### Step 1. 프롬프트 복사
[`src/Bayesian long prompt.txt`](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/src/Bayesian%20long%20prompt.txt)의 내용을 복사합니다.

### Step 2. Claude Opus 4.7에 입력
[Claude.ai](https://claude.ai) 또는 Anthropic API에서 Claude Opus 4.7 모델에 프롬프트를 그대로 붙여넣습니다.

### Step 3. 보고서 생성 후 검증
출력된 분석 결과를 본 폴더의 [참조 보고서](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/AI%20supply%20chain%20bayesian%20analysis%20kr.MD)와 비교하며 신뢰도를 평가합니다.

---

## 분석 대상 (5개 레이어)

| 레이어 | 종목 |
|--------|------|
| GPU / AI 가속기 | NVDA, AMD, INTC, AVGO |
| HBM / 메모리 | MU, 005930.KS, 000660.KS |
| 데이터센터 네트워킹 | ANET, CSCO, MRVL |
| 스토리지 | WDC, STX, PSTG |
| NPU / 온디바이스 AI | QCOM, AAPL, ARM |

---

## 점수 체계

| 팩터 | 가중치 | 평가 항목 |
|------|-------|---------|
| 기술적 분석 | 30% | MA50/200, MACD, RSI, 볼린저, 거래량, 다이버전스 |
| 펀더멘털·거시 | 30% | EPS 성장, P/E·PEG·P/S, FCF, CAPEX 사이클, 규제 |
| 수급·심리·매크로 | 40% | 13F, 공매도, 옵션 IV 스큐, 미디어 감성, VIX 민감도 |

---

## 베이지안 산식

```
사전 확률 (Prior) 설정
   ↓ (거시 환경 기반: 금리, VIX, AI Capex)
   ↓
리스크 점수 (0~10) 산출
   ↓
우도비 LR_down = 10^((score - 5) / 5)
   ↓
사후 하락 확률 (Posterior)
   ↓
상승 확률 = 1 − 하락 확률
   ↓
오차범위 ±5%p
```

---

## 분석 결과 요약 (2026년 4월 27일 기준)

### High Conviction Long Top 5

| 순위 | 티커 | 회사 | 상승 확률 | 레이어 |
|------|------|------|---------|------|
| 1 | AAPL | Apple Inc. | **75%** | NPU/온디바이스 AI |
| 2 | QCOM | Qualcomm Inc. | **72%** | NPU/온디바이스 AI |
| 3 | AVGO | Broadcom Inc. | **70%** | GPU/AI 가속기 (ASIC) |
| 4 | CSCO | Cisco Systems | **68%** | 데이터센터 네트워킹 |
| 5 | MRVL | Marvell Technology | **65%** | 데이터센터 네트워킹/ASIC |

### 가상 포트폴리오 (동일 가중)

- 기대 수익률 (20일): **+4.2%**
- 연간화 변동성: 18%
- **샤프 비율**: **0.92**
- **최대 손실 (MDD)**: **-5.7%**

> 자세한 종목별 분석은 [메인 보고서](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/AI%20supply%20chain%20bayesian%20analysis%20kr.MD)를 참조하세요.

---

## 💬 자주 묻는 질문 (FAQ)

### 일반 질문

**Q. "왜 NVDA·MU의 상승 확률이 낮게 나왔나? 펀더멘털 강력하지 않나?"**

맞습니다. NVDA·MU의 *기업 펀더멘털 자체*는 여전히 강력합니다. 본 분석에서 두 종목의 하락 확률이 높게 산출된 이유는 *밸류에이션 부담 + AI Capex 피크아웃 우려*에 따른 **상대적·단기 (5-20 거래일) 하락 확률**입니다.

장기 보유 관점이라면 두 종목 모두 *core holding* 후보로 평가됩니다. 본 분석은 *단기 진입 타이밍* 식별용입니다.

---

**Q. "왜 베이지안 모델인가? 단순 다중회귀가 아닌 이유는?"**

베이지안 프레임의 핵심 장점은 **사전 확률(Prior)에 거시 환경을 명시적으로 반영**할 수 있다는 점입니다. 다중회귀는 모든 변수를 *동등하게 in-sample*에서 학습하지만, 베이지안은 *현재 시장 국면(금리 동결, VIX 19.5, AI Capex 선별기)*을 prior로 설정 후 개별 신호로 업데이트합니다.

다만 본 분석은 *베이지안 사고 프레임*을 모방한 것이지 실제 베이지안 통계 모델 구동이 아닙니다. 상세는 [Section 5.1](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/AI%20supply%20chain%20bayesian%20analysis/AI%20supply%20chain%20bayesian%20analysis%20kr.MD#5-본-분석의-제약과-한계-)을 참조하세요.

---

### 비판적 댓글

**Q. "LLM이 만든 점수는 신뢰할 수 없지 않나?"**

타당한 지적입니다. 본 분석의 점수는 **상대적 비교용**이지 *절대값으로 신뢰할 통계*가 아닙니다. AAPL 2.17점과 QCOM 2.51점의 차이는 "AAPL이 약간 더 매력적"이라는 *순위 정보*만 의미하며, "AAPL이 13.5% 더 우수"라는 *비율 정보*는 아닙니다.

이 한계를 인지한 채로 *short-list 발굴 도구*로 활용하시기 바랍니다.

---

**Q. "출력이 매번 똑같지 않을 텐데 어떻게 재현 가능하다고 하나?"**

LLM은 stochastic합니다. 그러나 본 프롬프트는 다음을 통해 출력의 *구조적 일관성*을 보장합니다:

1. 분석 대상 종목을 명시 (자유도 차단)
2. 3대 팩터의 가중치를 명시 (가중 함수 고정)
3. 출력 형식을 강제 (테이블, 점수 범위)
4. 베이지안 산식을 명시 (확률 변환 방식 고정)

같은 프롬프트로 다른 LLM이 분석해도 *상위 5종목 순위*는 비교적 안정적입니다. 정확한 점수는 ±10% 변동 가능합니다.

---

**Q. "투자 추천이냐?"**

아닙니다. Disclaimer에 명시한 바와 같이 *연구·교육 목적*이며 투자 조언이 아닙니다. 본 분석은 통계적 패턴을 식별할 뿐, 투자 결정은 사용자에게 있습니다.

---

### 협업 제안

**Q. "한국 시장 (KOSPI) AI 공급망에도 적용 가능한가?"**

가능합니다. 프롬프트의 *분석 요청 대상* 섹션을 다음으로 변경하시면 됩니다:

```
- HBM/메모리:    삼성전자(005930), SK하이닉스(000660)
- 반도체 장비:   한미반도체(042700), 이오테크닉스(039030)
- AI 솔루션:     네이버(035420), 카카오(035720)
- 통신 인프라:   KT(030200), SK텔레콤(017670)
```

다만 LLM의 한국 종목 데이터 신뢰도가 미국 종목보다 낮을 수 있으므로 *해석 시 주의*가 필요합니다.

---

## 🔗 Related Resources

- 📰 [DAT 기업의 mNAV 아비트리지 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)
- 📰 [인텔(INTC) 주가 급등 분석 — AI 시대의 뉴노멀](https://github.com/gameworkerkim/vibe-investing/blob/main/Intel%20INTC%20AI%20NewNormal%20column.MD)
- 📚 [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)
- 🛠️ [DAT Quant Strategy](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/DAT%20quant%20strategy)
- 📄 [SSRN 6632838 — The 72-Hour Shock?](https://ssrn.com/abstract=6632838)

---

## Disclaimer

본 분석은 **연구·교육 목적의 가상 시뮬레이션**입니다.

- 특정 종목의 매수·매도를 권유하지 않습니다
- 점수와 확률은 LLM 기반 추정치이며, 실제 통계 모델 결과가 아닙니다
- 한국 거주자: 해외주식 양도소득세 22%, 외환거래법 신고 의무
- Claude를 포함한 LLM이 생성한 분석은 *반드시 사용자가 검증*해야 합니다
- 모든 투자 판단은 전문가와 상담 후 본인 책임하에 이루어져야 합니다

> *Past performance does not guarantee future results.*

---

## 📧 Contact

**저자**: 김호광 (Dennis Kim / HoKwang Kim)
**소속**: Independent Researcher · Betalabs Inc. CEO
**이메일**: gameworker@gmail.com
**ORCID**: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
**GitHub**: [@gameworkerkim](https://github.com/gameworkerkim)

---

*시리즈: vibe-investing / Awesome Claude Quant Scripts*
*최종 수정: 2026년 4월 27일*
