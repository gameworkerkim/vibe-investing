# 🌊 vibe-investing

> **인공지능을 이용한 바이브 투자(Vibe Investing) 관련 의견과 자료를 나누는 레포**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with](https://img.shields.io/badge/Made%20with-Claude%20%2B%20Python-blue)]()
[![Updates](https://img.shields.io/badge/Updates-Monthly-brightgreen)]()

---

## 📌 Quick Links

📖 **[Awesome Vibe Invest — AI 투자 GitHub 어썸 리스트](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)**
> 30개+ AI 투자 GitHub 레포지토리를 직접 평가한 큐레이션. 강점/약점/적합 사용자까지 객관적으로 정리.

🛠️ **[Harness Quant v2 — 개발 중인 AI 트레이딩 플랫폼](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)**
> LLM이 도구를 호출하며 추론하는 agentic loop 방식으로 NASDAQ/S&P500을 분석하는 6개 시나리오 + 백테스트 + MCP 서버 + 멀티 에이전트 토론 패키지.

---

## 🤔 Vibe Investing이란?

**Vibe Coding**(바이브 코딩)이 자연어로 LLM에 지시해서 코드를 만드는 패러다임이라면,
**Vibe Investing**(바이브 인베스팅)은 자연어 지시 → LLM이 도구를 호출 → 시장 데이터·뉴스·소셜 신호 수집·분석 → 투자 의사결정 산출까지의 **agentic 파이프라인**을 지칭합니다.

전통적 알고리즘 트레이딩이 "if RSI < 30 then buy" 같은 경직된 룰 기반이라면, vibe investing은:

- **자연어로 전략 정의** ("섹터가 호전되고 시장에서 호평받는 종목을 찾아줘")
- **LLM이 능동적으로 도구 호출** (가격, 펀더멘털, 뉴스, 소셜, 내부자 거래)
- **다층적 추론과 합의** (Bull/Bear/Risk/PM 멀티 에이전트 토론)
- **JSON으로 구조화된 결정** (사람이 검증 가능한 reasoning trail)

이 레포는 vibe investing의 **현재 도구·솔루션 지형을 정리**하고, **직접 만들고 있는 레퍼런스 구현체**를 함께 공개합니다.

---

## 📦 이 레포에는 무엇이 있나요?

### 1️⃣ Awesome Vibe Invest

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)

AI/LLM을 활용한 투자·트레이딩 GitHub 레포지토리 큐레이션.

기존 어썸 리스트와 다른 점:

| 일반 어썸 리스트 | Awesome Vibe Invest |
|---|---|
| 단순 나열 | **객관적 평가** (강점 + 약점 + 적합 사용자) |
| ⭐ 수치만 강조 | 활성도·성숙도·학습곡선·한국 시장·라이선스 5축 평가 |
| 미국 위주 | **한국/아시아 시장 자원 별도 섹션** |
| 좋은 점만 적음 | **공통 함정 (Pitfalls) 12가지 정리** |
| "어떤 게 좋다"만 | **사용자 유형별 시작 경로 5개** |

다루는 12개 카테고리:

```
1. 멀티 에이전트 프레임워크 (AI Hedge Fund, TradingAgents, FinRobot, AgenticTrading)
2. LLM 단일 에이전트 / 리서치 도구 (Dexter, FinMem, AgentQuant)
3. 강화학습 트레이딩 (FinRL, TensorTrade)
4. 금융 도메인 LLM (FinGPT, PIXIU)
5. 백테스트 엔진 (vectorbt, backtrader, zipline-reloaded)
6. 데이터 & 인프라 (MCP servers, Polygon, Finnhub, 한국투자증권 OpenAPI)
7. 메모리 & 컨텍스트 시스템
8. Production / Risk Engineering
9. 벤치마크 & 페이퍼 컬렉션
10. 한국 / 아시아 시장 자원 (pyKRX, FinanceDataReader, LLMQuant quant-wiki)
11. 메타 어썸 리스트
12. 공통 함정 (Common Pitfalls) — 백테스트·LLM·운영·거버넌스·비용
```

### 2️⃣ Harness Quant v2 — 개발 중인 AI 트레이딩 플랫폼

[**🛠️ 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)

NASDAQ/S&P500 종목을 대상으로 **하네스 엔지니어링** (LLM이 도구를 호출하며 추론하는 agentic loop) 방식으로 분석하는 패키지. Awesome Vibe Invest의 평가 기준을 만들 때 쌓인 노하우를 코드로 구현.

**6개 시나리오 매트릭스:**

| 번호 | 기간 | 방향 | 트리거 |
|---|---|---|---|
| 01 | 단기 (1d~4w) | LONG | 섹터 호전 + 종목 호평 |
| 02 | 중기 (1~3y) | LONG | 구조적 성장 (펀더멘털 + thesis) |
| 03 | 단기 | LONG/SHORT | 섹터 트렌드 이탈 (양/음 divergence) |
| 04 | 중기 | LONG/SHORT | 섹터 베이스라인 대비 구조적 알파/언더퍼폼 |
| 05 | 단기 | SHORT/AVOID | 급락 임박 시그널 (R1~R6 confluence) |
| 06 | 중기 | SHORT/AVOID | 구조적 쇠퇴 (D1~D7 confluence) |

**+ 부가 모듈:**
- 🤝 **Bull vs Bear 멀티 에이전트 토론** (TradingAgents 패턴)
- 📊 **백테스트 엔진** (vectorbt 호환, walk-forward 지원)
- 🔌 **MCP 서버** (Claude Desktop / Cowork 직접 연결)
- 🎯 **오케스트레이터** (cron 자동 실행 + Slack/Telegram 알림)
- ⚙️ **GitHub Actions 워크플로** (매일 미국장 마감 후 자동 실행)

---

## 🎯 왜 이 레포가 필요한가요?

AI 트레이딩 분야는 **월 단위로 새 레포가 쏟아져 나옵니다.**

- virattt/ai-hedge-fund가 55,000 stars를 넘었고
- TradingAgents, FinRobot, AgenticTrading 같은 프레임워크가 매월 메이저 업데이트
- Claude/GPT-5/Gemini 3 등 frontier LLM이 끊임없이 진화
- MCP 같은 새 표준이 등장하면서 인프라 지형도 매주 바뀜

문제는 — **어떤 것이 실제로 쓸만한지, 어떤 것이 README만 화려한지** 판단하기 어렵다는 점입니다. 별 수가 곧 품질도 아니고, 학술 논문 기반이라고 실전에서 작동하는 것도 아니며, 백테스트 결과는 종종 cherry-picked입니다.

이 레포는 그 혼란을 정리하기 위한 **개인 큐레이션의 공개판**입니다. 동시에, 큐레이션 과정에서 배운 패턴을 **직접 구현체로** 만들어 함께 공개합니다.

---

## 🚀 어디서 시작하면 되나요?

### 처음 오신 분
👉 **[Awesome Vibe Invest의 "🎯 추천 시작 경로" 섹션](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD#-추천-시작-경로-사용자-유형별)** 부터 보세요. 사용자 유형별 5가지 시작 경로를 정리해두었습니다.

### 바로 코드를 보고 싶은 분
👉 **[Harness Quant v2 README](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)** 의 "사용 예시" 섹션부터 보세요. 5분 안에 첫 시나리오를 실행할 수 있습니다.

### 본인 자금으로 자동매매 하려는 분
👉 **반드시** Awesome Vibe Invest의 [공통 함정 섹션](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD#12-공통-함정-common-pitfalls) 12가지를 먼저 읽으세요. 이 단계를 건너뛴 사람들이 가장 많이 잃습니다.

---

## 🗺️ 로드맵

- [x] Awesome Vibe Invest v1 공개
- [x] Harness Quant v2 공개 (6 시나리오 + 백테스트 + MCP + 토론)
- [ ] **영문 번역판** (international reach 확대)
- [ ] **자동 갱신 봇** — GitHub API로 별 수/마지막 커밋/contributor 수 자동 수집
- [ ] **한국 주식(KOSPI/KOSDAQ) 시나리오** 추가 — pyKRX + 한국투자증권 OpenAPI 연동
- [ ] **온체인 자산** 통합 — DeFi/스테이블코인/예측시장 신호
- [ ] **월간 인사이트 리포트** — 주요 시그널 백테스트 hit-rate 공개

---

## 🤝 기여하기 (Contributing)

다음 모두 환영합니다:

- ⭐ **별 누르기** — 가장 큰 응원
- 🐛 **누락된 좋은 레포 제보** — 이슈 또는 PR
- 💬 **평가에 대한 반박** — 토론은 큐레이션 품질을 높입니다
- 🌍 **영문 번역** — international contribution
- 🇰🇷 **한국 시장 자원 추천** — DART, ECOS, NICE 등 활용 사례 환영
- 📊 **본인 백테스트 결과 공유** — Harness Quant 시나리오의 walk-forward 결과 등

이슈 또는 PR로 부담 없이 알려주세요. **반대 의견도 환영합니다** — "이 평가는 틀렸다"는 피드백이 가장 가치 있습니다.

---

## ⚠️ Disclaimer

이 레포의 모든 콘텐츠는 **연구/교육 목적**입니다.

- 어떤 도구도 수익을 보장하지 않습니다
- 모든 평가는 작성 시점의 공개 정보 기반 주관적 평가입니다
- 실전 자본 운용 전 반드시 자체 백테스트, 페이퍼 트레이딩, 법률 검토를 거치세요
- 미국 SEC, 한국 금감원 모두 AI 기반 투자자문 서비스에 등록 의무가 있을 수 있습니다 (본인 자산 운용은 OK, 타인 자금 운용은 라이선스 필요)
- 투자 결과에 대한 책임은 사용자에게 있습니다

---

## 👤 About

**김호광 (Dennis Kim)**
주식회사 싸이월드 CEO,  개발자, Hacker 
Web3, 블록체인, AI 트레이딩 영역에서 활동하고 있습니다.

- 📧 gameworker@gmail.com
- 🔗 [GitHub @gameworkerkim](https://github.com/gameworkerkim)

이 레포는  AI를 활용한 창업가로서의 회복 과정에서 얻은 인사이트를 바탕으로 만들어졌습니다.

---

## 📜 라이선스

MIT License — 자유롭게 사용·수정·배포 가능합니다. 출처 표기만 부탁드립니다.

---

<p align="center">
  ⭐ <b>이 레포가 도움이 되셨다면 별 하나로 응원해주세요.</b> ⭐<br>
  매월 갱신을 약속드립니다.
</p>
