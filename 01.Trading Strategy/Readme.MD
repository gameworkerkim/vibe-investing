# 01. Trading Strategy

vibe-investing 레포의 트레이딩 전략 인덱스입니다. 미국 주식(나스닥/S&P500), 가상화폐, 명품 섹터를 아우르는 정량 전략과 LLM 프롬프트, 그리고 학술 논문 기반 연구를 한곳에 모았습니다.

이 폴더 전체를 관통하는 방법론은 **Multi-LLM 교차검증**입니다. 동일한 프롬프트를 Claude, ChatGPT, Gemini, DeepSeek에 입력하고, 모델 간 합의는 robust한 신호로, 불일치는 사람이 더 깊이 검증해야 할 지점으로 다룹니다. 미래의 퀀트 시스템은 하나의 초지능이 아니라 서로 다른 철학을 가진 AI들의 위원회라는 가설 위에 서 있습니다.

→ [English version (영어 버전)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Readme%20EN.md)
→ [메인 README로 돌아가기](https://github.com/gameworkerkim/vibe-investing/blob/main/README.md)
→ [Paper 논문 폴더 (이 전략들의 학술적 기반)](https://github.com/gameworkerkim/vibe-investing/blob/main/Paper%20%EB%85%BC%EB%AC%B8/readme.md)

---

## 처음 오신 분들을 위한 읽는 순서

이 폴더에는 입문용부터 전문가용까지 난이도가 다양합니다. 본인 상황에 맞게 골라 읽으시길 권합니다.

- **기초부터 보고 싶다면**, 먼저 [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD)의 프롬프트 모음으로 LLM에게 종목을 발굴시키는 방법을 익히고, 그다음 [명품 투자 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md)처럼 칼럼 형식으로 읽기 쉬운 섹터 분석을 보는 것을 추천합니다.
- **테마별로 묶어서 보고 싶다면**, 아래 "테마별 정리" 섹션에서 관심 분야(AI/반도체, 배당, 가상화폐, 매크로/레짐, 공매도)를 선택하십시오.
- **데이터와 코드만 보고 싶다면**, 아래 "데이터·코드 중심 항목" 섹션에 백테스트 CSV와 재현 가능한 Python 스크립트가 포함된 전략만 모아두었습니다.
- **전략을 빠르게 선택하고 싶다면**, 아래 "전략 선택 결정 트리"를 보십시오.
- **LLM 프롬프트 라이브러리 레퍼런스를 찾고 있다면**, [Awesome LLM Prompts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20LLM%20Prompts.md)에서 금융·퀀트·크립토 투자용 공개 프롬프트 라이브러리 가이드를 확인하세요. prompts.chat, ternary-ai/prompts 등 주요 라이브러리 분석과 크립토 도메인 적용 가이드가 포함되어 있습니다.

---

## 전략 종합 분류 (Multi-LLM 교차검증 기반)

두 차례의 종합 리뷰(의견 A: 실무 검증 중심 / 의견 B: 전략 완성도·조건부 사용 중심)를 비교·종합하여 전략을 3단계로 분류했습니다. 두 의견이 일치하는 전략은 확정적 신호, 불일치하는 전략은 그 이유를 명시했습니다.

### Tier 1: Recommended (즉시 사용 가능 · 완성도 높음)

이 전략들은 **LLM 교차검증 완료, 백테스트 데이터 제공, 재현 가능한 코드/CSV 포함, 위험 고지 명시** 등 실무 검증이 가장 잘 갖춰진 전략들입니다.

| # | 전략 | 분류 | 핵심 특징 | 실적 / 근거 | 권장 이유 |
|---|------|------|-----------|-------------|-----------|
| 1 | **ARDS-X Regime Classifier** | 매크로·레짐 스위치 | 2-축 레짐 맵(5개 상태 분류). yfinance+FRED 무료 실데이터, 2014-2026 백테스트 | 조정·과매도 구간 60일 수익률 +5%대, 승률 77% | API 키 불필요. 대시보드+룩어헤드 없는 백테스트 CSV. **"어떤 전략을 써야 할지" 판정하는 메타 도구** |
| 2 | **AMQS** | AI·모멘텀 | 4-Factor Composite 모멘텀 + 거시 레짐 필터, 주간 리밸런싱 | 2024-01~2026-04: +114.1% vs QQQ +46.2%, Sharpe 1.33, MDD -16.9% | yfinance 기반 백테스트 엔진 + 실시간 스크리너 + 일별 NAV CSV. 4세대 검증 완료 |
| 3 | **AMQS-M7** | AI·모멘텀 (M7 특화) | M7(AAPL/MSFT/GOOGL/AMZN/META/NVDA/TSLA) 특화. "단기 하락 매수 모멘텀" 정식 편입. 4중 게이트 | AMQS 기반 + KR/EN/CN 3개 언어 프롬프트 | CLI 트래커 + 백테스트 + KIS 증권사 API 자리표시까지 갖춘 완성형 |
| 4 | **Token Unlock 72h Shock** | 가상화폐·포렌식 | 바이낸스 토큰 언락 72시간 내 폭락 실증 | 52건 중 88.5%가 음의 수익률(평균 -16.97%, p=2.2×10⁻⁹), SSRN 논문 #1 | 8개 Python 스크립트 + 10개 CSV로 논문 전체 표 재현 가능. 학술적 엄밀성 최상 |
| 5 | **Binance Listing Day Crash** | 가상화폐·포렌식 | 2024-2025 바이낸스 상장 51개 토큰 전수 분석 | 96.1%가 24시간 내 하락(72시간 평균 -45.24%), BTC 상승 환경에서도 평균 -35.2% | 분석 엔진 + 역전략 봇 + 5개 CSV. LST-10 Ultimate Hybrid 숏 전략 + 자기비판 로드맵 동봉 |
| 6 | **Midterm Signal** | 매크로·타이밍 | 미국 중간선거 조정장 매수 시그널, 1938-2022년 22개 사이클 직접 백테스트 | 승률 95.5%, 허구 주장 정정("1년 뒤 +36%" → 실제 기대치 +19%) | "과장 없이 반증 가능한 근거"만 사용하는 정직한 프롬프트 설계. 2026년 5월 현재 "매수 금지(2/6점)" |
| 7 | **Dual-Engine Capital Compounder** | 배당·자본환원 | TCRY(Total Capital Return Yield) 신호, 금융+리테일 2-엔진, 사이클 방어력 점수 추가 | 배당수익률+자사주 매입 합산 측정. 2008 GFC 배당 컷 사례 경고 포함 | 3개 언어 프롬프트 + CSV + Python 스크리너 번들 |
| 8 | **Dividend Growth Prompt** | 배당·인컴 | 3-LLM 교차검증 실증 완료. MSFT·UNH 만장일치 | 모델별 오류를 명시적으로 정정하는 audit-ready 설계 | Claude 추천 (섹터 준수도 A, 보수적 Sharpe 0.82) |
| 9 | **AI Supercycle Investment** | AI·테크 | 4-Layer 가치사슬 분산, "Picks and Shovels" 인프라 중심 | 3개 언어 + CSV + Python 스크리너 완성형 번들 | AI 슈퍼사이클 장기 분산투자 프레임워크 |
| 10 | **BNB Trading Bot** | 가상화폐·통계 | BNB-ETH 4년치 통계 분석 + ETH 이동평균 교차 기반 트레이딩 | 백테스트 +123.21%, SSRN 논문 #4 | 독립 실행형 신호 프로그램 + 13개 분석 CSV. 한/영/중 3개국어 지원 |
| 11 | **Luxury Investment Strategy** | 섹터(명품) | 명품 13개 기업·ETF의 2020-2026 데이터, 225건 백테스트 | GLUX ETF 분산 우위 입증. 저/중/고 위험 3단계 포트폴리오 제안 | 4개 CSV 데이터셋 제공. 입문용 칼럼형으로 읽기 쉬움 |

---

### 🥈 Tier 2: Conditional Use (조건부 사용 · 주의 필요)

이 전략들은 **완성되었으나 구조적 한계, LLM 간 괴리, 특수 조건** 등으로 인해 단독 사용 시 주의가 필요합니다. 아래 조건을 숙지한 후 사용하십시오.
퀀트 전략에 대한 이해가 높아야하며, LLM 프롬프트 사용에 대한 숙련도와 이해도가 필요합니다.

| # | 전략 | 분류 | 사용 조건 | 주의사항 |
|---|------|------|-----------|----------|
| 1 | **ARDS (원본)** | 방어·학술 | AMQS-M7의 대칭 헤지로 사용 | 정량 비중 발산 심각 (Claude 85% vs DeepSeek 225%, 14배 차이). **반드시 median + 보수적 캡(종목당 15% 이하) 적용** |
| 2 | **Pharma Sector Long/Short** | 섹터(제약) | Claude·DeepSeek 추천, 웹검색 필수 | 4개 LLM이 4개의 다른 포트폴리오 산출. Consensus 종목과 Divergence 종목 분리 후, Divergence 종목은 1차 출처 검증 필수. 합의 규칙 개발 전까지 **룰렛 게임 주의** |
| 3 | **MRDS** | 매크로·레짐 | 4-LLM 교차검증 메타 레이어 이해 후 | NVDA 데이터센터 매출 YoY +44%/+73%/+115% 환각 발견. **모든 정량 수치의 원본 교차검증 필수** |
| 4 | **AI Super Cycle Weekly Rebalance** | AI·고위험 | NVDA 단순 보유보다 "하락장에서 덜 깨지는" 가치 추구 | 초고집중 위험 (NVDA 25-44%). 보수 시나리오 +38.5% vs NVDA 단순 보유 +68.5%. 3-LLM median + 35% 캡 필수 |
| 5 | **DAT Quant Strategy** | 암호화폐·평균회귀 | 이미 DAT 기업 보유 시 진입 타이밍 식별용 | **"비트코인 직접 구매가 더 나음"** 경고 명시. Spot BTC ETF·GENIUS Act 등 레짐 체인지 시 과거 패턴 완전 무효 |
| 6 | **Binance Alpha MM 봇** | 가상화폐·포렌식 | MM 봇 5단계 행동 모델(MBP-5) 이해 후 | 백테스트 Sharpe 3.25는 과거 데이터, 실전 슬리피지·MM 행동 변화 고려. Phase 3 이외 구간 검증 미비 |
| 7 | **Declining Stock Quant Script** | 숏·하락 방어 | 인버스 ETF 변동성 부패(volatility decay) 이해 후 | **1일 초과 보유 시 추적오차 누적** — 반드시 단기 거래. 하락 예측 통계적 유의성 검증 미비 |
| 8 | **AI Supply Chain Bayesian Analysis** | 연구·정량 | 베이지안 프레임워크 이해 후 | 점수는 **상대 순위로만 활용, 절대값 신뢰 금지** |
| 9 | **Long-Term Dividend Investing** | 배당·코드 | Dividend Growth Prompt의 코드 구현 보완판 | 은퇴 자금·인컴 포트폴리오 구성용 |
| 10 | **VWAP Strategy** | 기술적 분석 | Turtle Trading 등 기존 전략과 비교 수준 | LLM 교차검증 리포트 부재. Claude·DeepSeek·ChatGPT 간 VWAP 시그널 차이 분석 필요 |

---

### 🔴 Tier 3: Research Stage (연구 단계 · 사용 불가)

이 전략들은 **미완성, 아이디어 노트 수준, 데이터·코드 부재**로 실전 사용이 불가능합니다. 참고용으로만 보십시오.
만들다 만 것과 아이디어 발전 단계의 하이리스크 전략들이 있습니다.

| # | 전략 | 현재 상태 | 개선 방향 |
|---|------|-----------|-----------|
| 1 | **REGIME** | "미완성" 명시. 거시 변수가 종목을 거의 설명 못 함(R² 1-3%). 금융공학 지식 없으면 사용 금지 경고 | A/B/C 3접근 중 하나로 통일. QQQ 베타 제거 후 잔차 분석 강화. 거시 레짐→포트폴리오 구성 전환 규칙 개발 |
| 2 | **Nasdaq Short Selling Strategy** | 아이디어 노트(IdeaNote.MD) 단계. 구체적 전략 부재 | 구체적 숏 진입 기준(커플링 계수 임계값) 정의. yfinance 기반 백테스트 필수. 공매도 비용(대출료, 규제) 반영 |
| 3 | **SaaS Short / HBM Long** | "준비중" 상태, 폴더만 있고 내용 부재 | 페어 전략 구체화. SaaS vs HBM 상관계수 분석. 헤지 비율 산출 방법론 필요 |
| 4 | **Disclosure Timing Around Token Unlocks** | Phase 3 연구 프로그램 설계 문서, 목표 실행 2027 Q1-Q2 | 공시 텍스트 마이닝을 위한 LLM 프롬프트 설계. 소규모 데이터셋으로 파일럿 연구 선행 |
| 5 | **ChainWar** | Phase 4 연구 프로그램 초안(v0.1), 목표 실행 2027 Q3-Q4 | 체인별 토큰 데이터 수집 자동화 스크립트. 통계적 유의성 검증 프레임워크 구축 |
| 6 | **Bitcoin-Nasdaq Coupling** | "짧은 아이디어 노트" 2025년 평균 0.52 → 2026년 4월 -0.20 급변 | 비대칭 커플링(하락은 함께, 상승은 따로) 정량화. 레짐별 상관계수 분리 분석 필요 |

---

## 전략 선택 결정 트리

```
1. 시장 국면을 먼저 판별해야 하나?
   → YES: ARDS-X Regime Classifier (무료 실데이터 기반, API 키 불필요)

2. AI/반도체 모멘텀을 추구하나?
   → YES: AMQS-M7 (완성형 코드+백테스트)
   → 고위험 고수익: AI Super Cycle Weekly Rebalance (NVDA 집중, 3-LLM median 필수)

3. 배당·인컴 포트폴리오를 구성하나?
   → YES: Dual-Engine Capital Compounder (TCRY 신호) 또는 Dividend Growth Prompt

4. 가상화폐 이벤트 기회를 노리나?
   → 토큰 언락: Token Unlock 72h Shock (숏)
   → 상장일: Binance Listing Day Crash (숏)
   → MM 봇 역전략: Binance Alpha MM 봇 (Phase 3 숏, 실전 슬리피지 고려)

5. 방어·헤지가 필요한가?
   → YES: ARDS (AMQS-M7 대칭 헤지, 비중 median + 15% 캡 필수)

6. 제약 섹터 특화가 필요한가?
   → YES: Pharma Sector Long/Short (Claude·DeepSeek 추천, 웹검색 필수, Consensus 종목만 사용)
```

---

## 테마별 정리

### AI / 반도체 / 모멘텀

- [AMQS — Adaptive Momentum Quant Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)/readme.md) (2026-05-02 v1.0, 한국어 + KR/EN 프롬프트). **차별화 항목.** 4-Factor Composite 모멘텀 + 거시 레짐 필터 + 주간 리밸런싱. 백테스트 +114.1% vs QQQ +46.2%, Sharpe 1.33. 시리즈 4세대.
- [AMQS-M7 — Magnificent 7 특화 확장판](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7/readme.md) (한국어 + KR/EN/CN 3개 언어). 5번째 점수 차원 "단기 하락 매수 모멘텀" 편입. 4중 게이트로 falling knife 차단.
- [AI Supercycle Investment](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD) — AI Super Cycle Weekly Rebalance 및 4-Layer 가치사슬 분산 전략.
- [나스닥 공매도 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Nasdaq%20short%20selling%20strategy/IdeaNote.MD) (미완성, 아이디어 단계)
- [SaaS Short / HBM Long](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/SaaS%20short%20HBM%20Long) (준비중)

### 가상화폐 — 시장 미시구조 및 포렌식

이 항목들은 모두 SSRN 논문 또는 5부작 칼럼 시리즈와 연결됩니다.

- [Token Unlock 72h Shock Analysis](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20/readme.MD) (2026-04-23 v3.0, 영어). **차별화 항목.** 52건 중 88.5% 음수익률(평균 -16.97%). SSRN 논문 #1(6632838). 8개 Python 스크립트 + 10개 CSV.
- [Binance Listing Day Crash](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20analysis.md) (2026-04-20, 한국어). **차별화 항목.** 51개 토큰 중 96.1% 24시간 내 하락. LST-10 Ultimate Hybrid 숏 전략 + [자기비판 로드맵](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20selfcritique%20roadmap.md).
- [Binance Alpha MM 봇을 잡아먹는 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Trading%20strategy%20that%20devours%20Binance%20Alpha%20MM%20bots/Binance%20alpha%20mm%20bot%20analysis.MD) (2026-04-20, 한국어). MBP-5 행동 모델. Phase 3 숏 백테스트 Sharpe 3.25.
- [BNB Trading Bot — BNB-ETH 정량 분석](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/BNB%20Trading%20Bot/Readme.md) (한/영/중). 백테스트 +123.21%. SSRN 논문 #4(6750298).
- [비트코인-나스닥 커플링](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/IdeaNodte.MD) (아이디어 노트).

### 배당 / 자본 환원

- [Dividend Growth Prompt](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD) — 3-LLM 교차검증, audit-ready 설계.
- [Dual-Engine Capital Compounder](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD) — TCRY 신호, 금융+리테일 2-엔진.
- [Long-Term Dividend Investing](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD) — 코드 구현 보완판.

### 매크로 / 레짐 진단 (4-LLM 교차검증)

- [ARDS-X Regime Classifier](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%20%E2%80%94%20Adaptive%20Recession-Defensive%20Strategy%20for%20AI_QQQ/README.md) (2026-06-06, 한국어 + KR/EN/CN). **차별화 항목.** yfinance+FRED 실데이터, 2-축 레짐 맵, 5개 상태 분류. "어떤 전략 책을 펴야 하나"를 판정하는 메타 도구.
- [ARDS — Adaptive Recession-Defensive Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%3A%20Adaptive%20Recession-Defensive%20Strategy/readme.md) (2026-05-18, 한국어, 4-LLM). AMQS-M7의 대칭 헤지. 핵심 발견: 실행 비중 14배 발산, 만장일치 종목 GLD 단 1종.
- [MRDS — Market Regime Diagnostic Quant Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Market%20Regime%20Diagnostic%20Quant%20Strategy/readme.md) (2026-05-19 v2.0, 한국어, 4-LLM). **차별화 항목.** NVDA 데이터센터 매출 YoY 환각 발견. 모든 정량 수치의 원본 교차검증 필요성 실증. 시리즈 5세대.

### 섹터 분석

- [명품 투자 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md) (2026-04-19, 한국어). 입문용 칼럼형. 13개 기업·ETF, 225건 백테스트.
- [Pharma Sector Long/Short](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme.MD) — 4-LLM 교차검증. Claude·DeepSeek 추천. Consensus 종목만 사용 권장.

### LLM 프롬프트 / 리소스

- [Awesome LLM Prompts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20LLM%20Prompts.md) (2026-07-15, 한국어) — 금융·퀀트·크립토 투자용 오픈소스 프롬프트 라이브러리 가이드. prompts.chat(143K+ 스타), ternary-ai/prompts(인지적 금융 에이전트), AgentDock 등 5개 주요 라이브러리 분석. TradFi 프롬프트의 크립토 도메인 변환 가이드, LLM 리스크 계층별 명세(환각·계산 신뢰성·군집·크립토 특유 리스크), 실무 활용 권고 포함. 실제 투자 판단이 아닌 분석 워크플로우 설계 참고자료.

---

## 투자 성과 관점의 종합 진단

| 평가 항목 | 현재 상태 | 시사점 |
|-----------|-----------|--------|
| **수익률 실증** | AMQS(+114.1%), BNB Bot(+123.21%), Binance Alpha 전략(Sharpe 3.25) 등 검증된 고성과 전략 존재 | 상당수 전략이 **과적합(overfitting) 가능성을 스스로 경고**하고 있음에도 과거 백테스트 수치 자체는 우수. 실거래 전 반드시 OOS(Out-of-Sample) 검증 필요 |
| **위험 관리** | ARDS(침체 방어), AMQS(거시 레짐 필터), Regime Classifier(상태 판별) 등 방어 전략 풍부 | Multi-LLM 합의 종목이 GLD(금) 하나뿐이었다는 ARDS 발견은 **분산투자 관점의 핵심 교훈** — LLM이 합의할 때만 매수하는 전략은 실패 가능성 높음 |
| **LLM 간 괴리 문제** | 모든 전략에서 모델 간 실행 비중이 극단적으로 발산(ARDS: Claude 85% vs DeepSeek 225%, 14배 차이) | "정량 의사결정은 사람이 최종 캡(cap) 적용" 철학이 반드시 필요. **단일 LLM에 투자 판단을 맡기지 말 것** |
| **Alpha Arena 실증 결과** | Alpha Arena에서 8개 LLM 실제 투자 대회 결과, 전체 포트폴리오 약 1/3 손실 기록 | LLM은 자료 조사에 강하지만, **타이밍과 포지션 관리에는 취약**함을 외부 실증도 확인. 본 레포의 "사람이 최종 cap 적용" 원칙과 일치 |

---

## 최종 종합 및 실무 제안

이 레포지토리의 궁극적인 강점은 **Multi-LLM 교차검증 방법론**에 있습니다. 본인이 실전에 활용한다면 아래 순서를 추천합니다:

1. **먼저 사용할 전략**: **ARDS-X(레짐 판별) → AMQS/AMQS-M7(모멘텀)**. ARDS-X로 시장 국면을 판별한 후, 조정·과매도 구간이면 AMQS로 모멘텀 추구, 침체 신호면 ARDS로 방어 전환. 두 전략을 결합하면 상승장과 하락장 모두 대응 가능.
2. **반드시 할 것**: 모든 프롬프트를 Claude, ChatGPT, DeepSeek, Gemini 중 **최소 3개 이상에 입력**하고, 비중은 **중앙값(median)으로 집계**한 뒤 사람의 보수적 캡(예: 종목당 15% 이하) 적용.
3. **피해야 할 전략(현재 시점)**: DAT Quant Strategy(저자 스스로 비권장), REGIME(미완성·매매 시그널 없음), 아직 폴더만 있는 SaaS Short/HBM Long. Tier 3 전략 6종은 참고만.
4. **실거래 전 검증 절차**: 백테스트 CSV 재현 → OOS 기간 설정 → 페이퍼 트레이딩 3개월 이상 → 이후에야 소액 실거래 고려.
5. **리스크 인식**: Alpha Arena 결과와 ARDS의 14배 비중 격차가 보여주듯, LLM은 아직 **"전체 자산 배분 결정"보다 "종목 아이디어 발굴 도구"** 로 활용하는 것이 현명합니다.
6. **가상화폐 전략은 testnet 필수**: 모든 봇 코드는 연구용 프로토타입으로, 실전 투입 전 법률 검토가 필수입니다.

---

## 데이터·코드 중심 항목 (백테스트 CSV + 재현 Python)

코드와 데이터로 직접 검증하고 싶다면 아래 항목들이 적합합니다.

- [ARDS-X Regime Classifier](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%20%E2%80%94%20Adaptive%20Recession-Defensive%20Strategy%20for%20AI_QQQ/README.md): yfinance + FRED 무료 CSV 기반. 룩어헤드 없는 백테스트 CSV + 대시보드 + KR/EN/CN 프롬프트. API 키 불필요.
- [AMQS](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)/readme.md): yfinance 기반 백테스트 엔진 + 실시간 스크리너 + 일별 NAV CSV
- [AMQS-M7](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7/readme.md): CLI 트래커 + 백테스트 + KIS 증권사 API 자리표시
- [Token Unlock 72h](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20/readme.MD): 8개 Python 스크립트 + 10개 CSV로 논문 전체 표 재현
- [BNB Trading Bot](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/BNB%20Trading%20Bot/Readme.md): 독립 실행형 신호 프로그램 + 13개 분석 CSV
- [Binance Listing Day Crash](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20analysis.md): 분석 엔진 + 역전략 봇 + 5개 CSV
- [Binance Alpha MM 봇](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Trading%20strategy%20that%20devours%20Binance%20Alpha%20MM%20bots/Binance%20alpha%20mm%20bot%20analysis.MD): 리서치 엔진 + 역전략 봇 + 5개 CSV
- [명품 투자 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md): 4개 CSV 데이터셋 (성과, 백테스트, 위험별 포트폴리오)

---

## 언어 지원 현황

| 항목 | 한국어 | 영어 | 중국어 |
|------|--------|------|--------|
| Awesome Claude Quant Scripts | O | O | 일부 프롬프트 |
| AMQS (원본) | O | 프롬프트만 | - |
| AMQS-M7 | O | 프롬프트 | 프롬프트 |
| ARDS | O | 업데이트 예정 | - |
| ARDS-X Regime Classifier | O | O | 프롬프트 |
| AI 헤지펀드 | O | 업데이트 예정 | - |
| MRDS | O | 업데이트 예정 | - |
| Token Unlock 72h | 보고서 KR | O (본문) | - |
| BNB Trading Bot | O | O | O |
| Binance Listing Day Crash | O | 업데이트 예정 | - |
| Binance Alpha MM 봇 | O | 업데이트 예정 | - |
| 명품 투자 전략 | O | 업데이트 예정 | - |
| Disclosure Timing | O | O | - |
| ChainWar | O | 업데이트 예정 | - |
| 비트코인-나스닥 커플링 | O | 업데이트 예정 | - |
| 나스닥 공매도 | O | 업데이트 예정 | - |
| Awesome LLM Prompts | O | - | - |

---

## 논문과의 연결 (학술적 기반)

이 폴더의 여러 가상화폐 전략은 SSRN에 게재된 4편의 작업 논문에서 도출되었습니다. 자세한 내용은 [Paper 논문 폴더](https://github.com/gameworkerkim/vibe-investing/blob/main/Paper%20%EB%85%BC%EB%AC%B8/readme.md)를 참조하십시오.

- 논문 #1 (SSRN 6632838): 72-Hour Shock, 바이낸스 토큰 언락 52건 → Token Unlock 72h 전략의 기반
- 논문 #2 (SSRN 6688740): 중앙화 거래소 에어드롭 분배 비대칭, BNB Chain 생태계
- 논문 #3 (SSRN 6705598): Less Volume More Variety, LLM 출력 길이와 컨트라리안 발굴 → Multi-LLM 방법론의 학술적 근거
- 논문 #4 (SSRN 6750298): Directional Decoupling, BNB-ETH 베타 변동성 비율 분해 → BNB Trading Bot의 기반

---

## 사용 시 권장 순서

1. 관심 시장 확인 (미국 주식 / 명품 / 가상화폐 / 매크로 레짐)
2. ARDS-X로 현재 시장 국면 진단
3. 해당 테마의 README와 칼럼 정독
4. 스크립트나 봇 실행 전 각 문서의 "한계" 및 "위험 고지" 섹션 필수 확인
5. CSV 데이터로 재현·검증
6. Multi-LLM 교차검증: 동일 프롬프트를 최소 3개 LLM에 입력, median으로 비중 집계, 사람의 보수적 캡 적용
7. 페이퍼 트레이딩으로 3개월 이상 검증 후 실거래 고려

---

## 위험 고지 (Disclaimer)

각 전략은 연구·교육 목적이며 투자 조언이 아닙니다. 백테스트 결과는 이상적 시나리오 기반이며 실거래 수익률과 다릅니다. LLM이 생성한 점수와 확률은 추정치이지 통계 모델의 출력이 아닙니다. 가상화폐 트레이딩 봇 코드는 모두 연구용 프로토타입으로, 실전 투입 전 testnet 검증과 법률 검토가 필수입니다. 한국 거주자는 해외주식 양도소득세 22%, 외환거래법, 가상자산이용자보호법 등 다중 규제 대상임을 유의하십시오. 자세한 내용은 [메인 README의 Disclaimer](https://github.com/gameworkerkim/vibe-investing/blob/main/README.md#disclaimer)를 참조하십시오.

---

## 저자

김호광 (Dennis Kim / HoKwang Kim) — Betalabs Inc. CEO, Microsoft Azure ex-MVP, CyworldZ 전 CEO

- ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)
- Email: [gameworker@gmail.com](mailto:gameworker@gmail.com)

라이선스: MIT (출처 표기 권장: "Dennis Kim / vibe-investing")
