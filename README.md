# vibe-investing

> **인공지능을 이용한 바이브 투자(Vibe Investing) 관련 의견과 자료를 나누는 레포**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with](https://img.shields.io/badge/Made%20with-Claude%20%2B%20Python-blue)]()
[![Updates](https://img.shields.io/badge/Updates-Monthly-brightgreen)]()
[![Awesome Lists](https://img.shields.io/badge/Awesome-Lists%20%C3%97%202-orange)]()
[![Columns](https://img.shields.io/badge/Columns-3%20Published-purple)]()

---

## Quick Links

### 📖 어썸 큐레이션 시리즈

| # | 제목 | 다루는 영역 |
|---|---|---|
| 1 | [**Awesome Vibe Invest**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD) | 주식 (NASDAQ / S&P500) — 30+ AI 투자 GitHub 레포 평가 |
| 2 | [**Awesome Vibe Invest — Crypto Edition**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD) | 비트코인 / 크립토 — 벤치마크 중심 LLM 트레이딩 큐레이션 |

### 칼럼 시리즈

| # | 제목 | 주제 |
|---|---|---|
| 1 | [**LTCM의 사례로 배우는 모델을 읽는 힘**](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD) | 1998년 LTCM 사태 분석 + 2026년 AI 바이브 투자의 리스크 |
| 2 | [**Microsoft의 Fintool 인수 — Excel이 곧 Bloomberg가 되는 날**](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD) | Microsoft의 Fintool 인수 시너지 분석 |
| 3 | [**보이지 않는 손인가, 좌표화된 전략인가**](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD) 🆕 | 가상화폐 선물 시장의 비정상적 pump & dump 패턴 수학적 검토 |

### 직접 개발 중인 도구

| # | 제목 | 설명 |
|---|---|---|
| 1 | [**Harness Quant v2**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD) | LLM 기반 NASDAQ/S&P500 분석 패키지 (6개 시나리오 + 백테스트 + MCP + 멀티 에이전트 토론) |

---

## Vibe Investing이란?

**Vibe Coding**(바이브 코딩)이 자연어로 LLM에 지시해서 코드를 만드는 패러다임이라면,
**Vibe Investing**(바이브 인베스팅)은 자연어 지시 → LLM이 도구를 호출 → 시장 데이터·뉴스·소셜 신호 수집·분석 → 투자 의사결정 산출까지의 **agentic 파이프라인**을 지칭합니다.

전통적 알고리즘 트레이딩이 "if RSI < 30 then buy" 같은 경직된 룰 기반이라면, vibe investing은:

- **자연어로 전략 정의** ("섹터가 호전되고 시장에서 호평받는 종목을 찾아줘")
- **LLM이 능동적으로 도구 호출** (가격, 펀더멘털, 뉴스, 소셜, 내부자 거래, 온체인 데이터)
- **다층적 추론과 합의** (Bull/Bear/Risk/PM 멀티 에이전트 토론)
- **JSON으로 구조화된 결정** (사람이 검증 가능한 reasoning trail)

이 레포는 vibe investing의 **현재 도구·솔루션 지형을 정리**하고, **시장의 흐름을 분석한 칼럼**을 함께 공개하며, **직접 만들고 있는 레퍼런스 구현체**도 함께 공유합니다.

---

## 이 레포에는 무엇이 있나요?

### 1. Awesome Vibe Invest (주식 편)

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)

NASDAQ / S&P500을 분석하는 AI 도구 30+ 큐레이션. 12개 카테고리 (멀티 에이전트 프레임워크, 강화학습 트레이딩, 금융 LLM, 백테스트 엔진, MCP 인프라, 한국 시장 자원, 공통 함정 등).

**핵심 차별점**:
- ⭐ 단순 나열이 아닌 **객관적 평가 (강점 + 약점 + 적합 사용자)**
- 📊 활성도·성숙도·학습곡선·한국 시장·라이선스 5축 평가
- 🇰🇷 **한국/아시아 시장 자원 별도 섹션** (pyKRX, 한국투자증권 OpenAPI 등)
- ⚠️ **공통 함정 12가지** (백테스트·LLM hallucination·운영·거버넌스·비용)
- 🎯 **사용자 유형별 시작 경로 5개**

### 2. Awesome Vibe Invest — Crypto Edition

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD)

비트코인을 비롯한 암호화폐 LLM 트레이딩 큐레이션. **벤치마크 결과**와 **지속적 업데이트**를 갖춘 프로젝트 중심으로 평가.

**가장 중요한 데이터 — Alpha Arena Season 1 결과**:
- 🥇 **DeepSeek V3.1**: +46% (실제 자본 $10,000 → $14,764)
- 🥈 Qwen3 Max
- 🥉 Claude Sonnet 4.5
- 🥉 Grok 4
- ❌ Gemini 2.5 Pro
- ❌ **GPT-5**: -75%

→ **모델 IQ가 곧 트레이딩 IQ는 아니다**라는 사실을 입증한 최초의 실거래 벤치마크.

**다루는 9개 카테고리**:
```
1. 벤치마크 & 평가 인프라 (Nof1 Alpha Arena 등 — 가장 중요)
2. 학술 검증 LLM 트레이딩 (CryptoTrade EMNLP 2024, FS-ReasoningAgent 등)
3. 프로덕션 멀티 에이전트 봇 (CloddsBot, qrak/LLM_trader 등)
4. Solana 네이티브 AI 에이전트 (ElizaOS 17.6k+ stars, Solana Agent Kit, GOAT, Rig)
5. 멀티체인 / EVM 에이전트 툴킷
6. MEV / DEX 전용 봇 (Jito mev-bot 등)
7. 예측 시장 (Polymarket / Kalshi) AI 에이전트
8. 데이터 인프라 & 온체인 분석
9. 공통 함정 (Crypto 특화) — 24/7 시장, slippage, MEV, CEX 리스크 등
```

### 3. 칼럼: LTCM의 사례로 배우는 모델을 읽는 힘

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD)

> *"모델은 언제나 진실을 가리킨다. 손가락은 언제나 탐욕을 가리킨다."*

1998년 노벨경제학상 수상자 2명이 운영한 헤지펀드 LTCM이 4개월 만에 청산된 사건을 분석하고, 이를 2026년 AI 바이브 투자 환경에 적용한 칼럼.

**다루는 내용**:
- 🏛️ LTCM의 흥망 (자본금 47억 달러 → 레버리지 130:1까지 폭증)
- 🔄 *기능적 동질화(functional homogenization)* — 같은 모델을 모두가 쓰면 시스템 리스크
- 📊 2026년 4월 시장 지표 (Shiller CAPE 38, 버핏 지표 230%, IT 섹터 CAPE 64.5)
- ⚠️ AI 바이브 투자가 LTCM을 닮은 3가지 이유
- 🛡️ 5가지 실용 원칙

### 4. 칼럼: Microsoft의 Fintool 인수 — Excel이 곧 Bloomberg가 되는 날

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)

> *"앞으로 30년의 터미널은 터미널이 아닐 것이다. 대답하는 스프레드시트 셀일 것이다."*

직원 6명, 조달 $7.24M의 스타트업 Fintool을 마이크로소프트가 인수한 사건 분석. $370억 규모의 금융 데이터 터미널 시장(Bloomberg, FactSet, S&P Capital IQ)에 대한 마이크로소프트의 진입 전략을 6가지 시너지 + 5가지 위험으로 입체적으로 분석.

**다루는 내용**:
- Fintool은 무엇이었나 (Y Combinator, Menlo Ventures, Cassius)
- 마이크로소프트가 이미 갖고 있던 것 (Copilot for Finance, Finance Agents, Agent Mode)
- 6가지 시너지 벡터 (Distribution × Depth, Excel native, Cross-app continuity 등)
- 5가지 위험 (Acqui-hire 실패 패턴, EU 규제, LLM hallucination 책임 등)
- 시장 충격 분석 (Bloomberg, FactSet, S&P Capital IQ mindshare 변화)

### 5. 칼럼: 보이지 않는 손인가, 계획된 사기인가?  

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)

> *"벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다."*

가상화폐 무기한 선물 시장에서 반복되는 "급등 → 청산 폭포 → 원점 복귀" 패턴을 **수학적·통계적 논증**과 **온체인 포렌식**으로 분석한 칼럼. 특정 토큰·재단·거래소를 지목하지 않고 통계적 귀납만으로 결론을 도출 — 법적 안전성과 논증 강도를 모두 확보했습니다.

**다루는 내용**:
- 🔢 **VTCLR 패턴 정의** — Vertical·Thin·Coordinated·Liquidation·Round-trip 5가지 조건
- 📐 **3가지 수학적 정리**: 벤포드 법칙 이탈(χ² 검정), 4+ 지갑 우연 동시성 확률 = 2×10⁻⁸, 미시구조 OHLC 발산
- 🔍 **공개 사건 3건** — Hyperliquid XPL(2025년 8월, $4,600만+ 공격자 이익), Fartcoin(2025년 4월, 4지갑 좌표화), 2025년 10월 $200억 청산
- 🧠 **베이지안 3가설 분석** — H₁(자연시장) 기각, H₂(단일 고래) 부분 지지, H₃(좌표화된 전략) 지배적
- ⚖️ **4가지 법적으로 안전한 결론** — 통계적·구조적·정책적·투자자용

### 6. Harness Quant v2 — 개발 중인 AI 트레이딩 플랫폼

[**🛠️ 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)

NASDAQ/S&P500 종목을 대상으로 **하네스 엔지니어링** (LLM이 도구를 호출하며 추론하는 agentic loop) 방식으로 분석하는 패키지. 어썸 큐레이션 과정에서 쌓인 노하우를 코드로 구현.

**6개 시나리오 매트릭스**:

| 번호 | 기간 | 방향 | 트리거 |
|---|---|---|---|
| 01 | 단기 (1d~4w) | LONG | 섹터 호전 + 종목 호평 |
| 02 | 중기 (1~3y) | LONG | 구조적 성장 (펀더멘털 + thesis) |
| 03 | 단기 | LONG/SHORT | 섹터 트렌드 이탈 (양/음 divergence) |
| 04 | 중기 | LONG/SHORT | 섹터 베이스라인 대비 구조적 알파/언더퍼폼 |
| 05 | 단기 | SHORT/AVOID | 급락 임박 시그널 (R1~R6 confluence) |
| 06 | 중기 | SHORT/AVOID | 구조적 쇠퇴 (D1~D7 confluence) |

**+ 부가 모듈**: Bull vs Bear 멀티 에이전트 토론, 백테스트 엔진, MCP 서버, 오케스트레이터, GitHub Actions 자동화.

---

## 왜 이 레포가 필요한가요?

AI 트레이딩 분야는 **월 단위로 새 레포가 쏟아져 나옵니다.**

- virattt/ai-hedge-fund가 55,800 stars를 넘었고
- ElizaOS는 17,600+ stars로 크립토 AI 에이전트의 표준이 됐고
- TradingAgents, FinRobot, AgenticTrading 같은 프레임워크가 매월 메이저 업데이트
- Claude Opus 4.7, GPT-5.4, Gemini 3.x 등 frontier LLM이 끊임없이 진화
- MCP 같은 새 표준이 등장하면서 인프라 지형도 매주 바뀜
- **Nof1 Alpha Arena는 GPT-5 -75%, DeepSeek +46%로 우리의 직관을 흔듭니다**

문제는 — **어떤 것이 실제로 쓸만한지, 어떤 것이 README만 화려한지** 판단하기 어렵다는 점입니다. 별 수가 곧 품질도 아니고, 학술 논문 기반이라고 실전에서 작동하는 것도 아니며, 백테스트 결과는 종종 cherry-picked입니다.

이 레포는 그 혼란을 정리하기 위한 **개인 큐레이션의 공개판**입니다. 동시에:
- 큐레이션 과정에서 배운 패턴을 **직접 구현체로** 만들어 함께 공개합니다
- 시장의 거시 흐름과 산업 변화를 **칼럼으로 분석**합니다
- 모든 콘텐츠를 **MIT 라이선스**로 자유롭게 활용 가능하게 공개합니다

---

## 어디서 시작하면 되나요?

### 처음 오신 분
본인 관심 영역에 맞춰 어썸 리스트를 골라 보세요:
- **주식 투자**: [Awesome Vibe Invest](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)의 *"추천 시작 경로"* 섹션
- **크립토 트레이딩**: [Awesome Vibe Invest — Crypto](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD)의 *"🎯 추천 시작 경로"* 섹션

### AI 시대의 시장 통찰을 얻고 싶은 분
칼럼을 읽으세요:
- **리스크 관리에 대한 통찰**: [LTCM 사례 칼럼](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD)
- **산업 변화에 대한 통찰**: [Microsoft Fintool 인수 칼럼](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)
- **시장 구조의 어두운 면에 대한 통찰**: [가상화폐 선물 pump-dump 패턴 분석](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)

### 바로 코드를 보고 싶은 분
[Harness Quant v2 README](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)의 *"사용 예시"* 섹션부터 보세요. 5분 안에 첫 시나리오를 실행할 수 있습니다.

### 본인 자금으로 자동매매 하려는 분
**반드시** 다음 함정 섹션들을 먼저 읽으세요:
- 주식: [Awesome Vibe Invest — 공통 함정 12가지](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD#12-공통-함정-common-pitfalls)
- 크립토: [Awesome Vibe Invest Crypto — 공통 함정 8가지](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD#9-공통-함정-crypto-특화)
- 선물 시장 구조 리스크: [보이지 않는 손 칼럼의 VTCLR 정의와 투자자 결론](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)

이 단계를 건너뛴 사람들이 가장 많이 잃습니다.

---

## 로드맵

### 완료
- [x] Awesome Vibe Invest v1 (주식, 30+ 레포)
- [x] Awesome Vibe Invest — Crypto Edition (크립토 + 벤치마크 중심)
- [x] Harness Quant v2 (6 시나리오 + 백테스트 + MCP + 토론)
- [x] LTCM 칼럼 (리스크 관리)
- [x] Microsoft Fintool 인수 칼럼
- [x] 가상화폐 선물 pump-dump 수학적 검토 칼럼

### 진행 중 / 예정
- [ ] **영문 번역판** — international reach 확대
- [ ] **자동 갱신 봇** — GitHub API로 별 수/마지막 커밋/contributor 수 자동 수집
- [ ] **한국 주식(KOSPI/KOSDAQ) 시나리오** — pyKRX + 한국투자증권 OpenAPI 연동
- [ ] **Anthropic의 finance agent 전략 칼럼**
- [ ] **한국 자산운용업의 1년 안 5가지 변화 칼럼**
- [ ] **온체인 자산 통합** — DeFi/스테이블코인/예측시장 신호
- [ ] **Awesome Vibe Invest — 한국 시장 Edition** (KOSPI/KOSDAQ 특화)
- [ ] **월간 인사이트 리포트** — 주요 시그널 백테스트 hit-rate 공개
- [ ] **VTCLR 패턴 탐지 오픈소스 도구** — 벤포드 법칙 + 지갑 클러스터링 기반 Python 패키지

---

## 콘텐츠 통계

```
어썸 큐레이션:    2개 (총 50+ 레포 평가)
칼럼:             3개 (총 25,000+ 단어)
직접 개발 도구:   1개 (Harness Quant — 7개 시나리오)
검증된 출처:      50+ 학술 페이퍼·공식 문서·산업 보고서
지원 언어:        한국어 (영문 요약 포함)
```

---

## 기여하기 (Contributing)

다음 모두 환영합니다:

- ⭐ **별 누르기** — 가장 큰 응원
- 🐛 **누락된 좋은 레포 제보** — 이슈 또는 PR
- 💬 **평가에 대한 반박** — 토론은 큐레이션 품질을 높입니다
- 🌍 **영문 번역** — international contribution
- 🇰🇷 **한국 시장 자원 추천** — DART, ECOS, NICE 등 활용 사례
- 📊 **본인 백테스트 결과 공유** — Harness Quant 시나리오의 walk-forward 결과
- 📰 **칼럼 주제 제안** — 다음에 다뤘으면 하는 시장 이슈

이슈 또는 PR로 부담 없이 알려주세요. **반대 의견도 환영합니다** — *"이 평가는 틀렸다"* 는 피드백이 가장 가치 있습니다.

---

## Disclaimer

이 레포의 모든 콘텐츠는 **연구·교육 목적**입니다.

- **어떤 도구도 수익을 보장하지 않습니다** — Alpha Arena의 GPT-5 -75%가 실제 데이터입니다
- 모든 평가는 작성 시점의 공개 정보 기반 주관적 평가입니다
- 실전 자본 운용 전 반드시 자체 백테스트, 페이퍼 트레이딩, 법률 검토를 거치세요
- 미국 SEC/CFTC, 한국 금감원, EU MiCA 모두 AI 기반 자동 트레이딩에 규제 적용 가능 — 본인 자산 운용은 OK, 타인 자금 운용은 라이선스 필요
- MEV bot의 sandwich attack 같은 일부 전략은 윤리적 회색지대 + 일부 관할권에서 시장 조작으로 해석 가능
- 시장 구조 분석 칼럼(예: 가상화폐 선물 pump-dump)은 특정 주체를 지목하지 않는 **통계적·학술적 논평**이며, 개별 사건의 법적 성격 규명은 관할 수사·규제 기관의 몫입니다
- 투자 결과 + 법적 리스크에 대한 책임은 사용자에게 있습니다

---

## About

**김호광 (Dennis Kim)**
Cyworld CEO · 개발자 · 작가
Web3, 블록체인, AI 트레이딩 영역에서 활동하고 있습니다.

- 📧 gameworker@gmail.com
- 🔗 [GitHub @gameworkerkim](https://github.com/gameworkerkim)

이 레포는 AI를 활용한 창업가로서의 얻은 인사이트를 바탕으로 만들어졌습니다.

---

## 라이선스

MIT License — 자유롭게 사용·수정·배포 가능합니다. 출처 표기만 부탁드립니다.

칼럼은 인용·재배포 시 *"김호광 (Dennis Kim) / vibe-investing 레포"* 출처 명기를 부탁드립니다.

---

<p align="center">
  <i><b>"Models always point to truth. Fingers always point to greed."</b></i><br>
  <i>"모델은 언제나 진실을 가리킨다. 손가락은 언제나 탐욕을 가리킨다."</i><br><br>
  <i><b>"Model intelligence is not trading intelligence."</b></i><br>
  <i>"모델의 지능이 곧 트레이딩 지능은 아니다."</i><br>
  — Alpha Arena Season 1 lesson<br><br>
  <i><b>"Benford's law cannot lie. On-chain data lasts forever."</b></i><br>
  <i>"벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다."</i>
</p>

<p align="center">
  ⭐ <b>이 레포가 도움이 되셨다면 별 하나로 응원해주세요.</b> ⭐<br>
  매월 갱신을 약속드립니다.
</p>
