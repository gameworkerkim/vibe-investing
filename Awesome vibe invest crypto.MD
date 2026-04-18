# Awesome Vibe Invest — Crypto Edition

> **비트코인을 비롯한 암호화폐를 위한 LLM 트레이딩 GitHub 큐레이션 (2026년 4월 기준)**
> **벤치마크 결과**와 **지속적 업데이트**를 갖춘 프로젝트 중심으로 객관적 평가를 제공합니다.

---

## Executive Summary (English)

In October 2025, Nof1's Alpha Arena delivered the first hard data on whether modern LLMs can actually trade crypto: six frontier models — GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5, Grok 4, DeepSeek V3.1, and Qwen3-Max — were each given $10,000 in real USDC and turned loose on Hyperliquid perpetuals. The result was uncomfortable: **DeepSeek V3.1 finished +46%, GPT-5 lost 75%**, and the dispersion exposed a brutal truth — model intelligence does not equal trading intelligence. Discipline, position sizing, and risk control mattered more than benchmark IQ.

Crypto's structural differences from equities — 24/7 markets, MEV-extractable mempools, on-chain transparency, sub-second Solana finality, decentralized perpetual venues like Hyperliquid — have created a distinct LLM-trading ecosystem with its own toolchain. **Solana has emerged as the dominant agent chain**: ElizaOS now exceeds 17,600 GitHub stars, Solana Agent Kit covers 60+ DeFi actions, GOAT toolkit spans 200+ on-chain plugins across 30+ chains, and Rust-native frameworks like Rig handle MEV-grade latency requirements. Solana Foundation's product lead Vibhu Norby has gone on record predicting that **99% of on-chain transactions will be agent-driven within two years**.

This curation focuses on three filters: (1) **published benchmark results** — projects with measurable, reproducible performance data (Alpha Arena, CryptoTrade EMNLP 2024, FS-ReasoningAgent ablations, Bitcoin multi-agent backtests with realistic slippage); (2) **active maintenance** — repos with substantial commits in the last 90 days; (3) **production-grade infrastructure** — frameworks battle-tested by real on-chain volume, not just paper demos. The honest assessment of the field as of April 2026 is that *most* LLM crypto trading bots underperform basic momentum strategies after fees and slippage, but a small subset of academically benchmarked frameworks combined with production-grade execution infrastructure is genuinely changing what's possible.

---

## 한글 요약

2025년 10월, Nof1 연구소의 **Alpha Arena**가 LLM이 실제로 암호화폐를 거래할 수 있는지에 대한 첫 번째 단단한 데이터를 내놓았다. 6개 frontier 모델(GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5, Grok 4, DeepSeek V3.1, Qwen3-Max)에 각각 $10,000의 실제 USDC를 주고 Hyperliquid 무기한 선물 거래소에 풀어놓은 실험이었다. 결과는 불편했다 — **DeepSeek V3.1는 +46% 수익, GPT-5는 -75% 손실**. 분산이 엄청났고, 잔인한 진실 하나가 드러났다: **모델의 지능이 곧 트레이딩 지능은 아니다**. 벤치마크 IQ보다 규율, 포지션 사이징, 리스크 통제가 더 중요했다.

크립토는 주식과 구조적으로 다르다 — 24/7 시장, MEV 추출이 가능한 멤풀, 온체인 투명성, Solana의 sub-second 결제, Hyperliquid 같은 탈중앙 무기한 거래소. 이런 차이가 별도의 LLM 트레이딩 생태계와 도구 체계를 만들어냈다. **Solana가 에이전트 체인의 주류로 부상**했다: ElizaOS는 GitHub stars 17,600개를 넘었고, Solana Agent Kit는 60+ DeFi 액션을, GOAT 툴킷은 30+ 체인의 200+ 온체인 플러그인을 커버하며, Rig 같은 Rust-native 프레임워크는 MEV 등급의 latency 요구를 처리한다. Solana 재단의 product 리드 Vibhu Norby는 *"향후 2년 안에 온체인 트랜잭션의 99%가 에이전트 주도로 전환된다"* 고 공언했다.

이 큐레이션은 3가지 필터를 적용한다
(1) **공개된 벤치마크 결과** — 측정 가능하고 재현 가능한 성과 데이터를 가진 프로젝트 (Alpha Arena, CryptoTrade EMNLP 2024, FS-ReasoningAgent ablation 연구, 현실적 slippage 적용 비트코인 멀티 에이전트 백테스트). 
(2) **지속적 유지보수** — 최근 90일 안에 의미 있는 커밋이 있는 레포. 
(3) **프로덕션급 인프라** — 페이퍼 데모가 아니라 실제 온체인 볼륨에서 검증된 프레임워크. 2026년 4월 시점의 솔직한 평가: *대다수* LLM 암호화폐 봇은 수수료와 슬리피지를 빼고 나면 단순 모멘텀 전략보다 못한 성과를 낸다. 그러나 학술적으로 벤치마크된 일부 프레임워크와 프로덕션급 실행 인프라의 조합은 진짜로 가능성을 바꾸고 있다.

---

## 평가 기준

기존 어썸 시리즈와 동일한 5개 차원에 **크립토 특화 차원** 2개를 추가했습니다.

| 차원 | 의미 |
|---|---|
| **활성도** | 🟢 활발 (최근 3개월 내 커밋 다수) / 🟡 유지보수 / 🔴 정체 (6개월+ 무커밋) |
| **성숙도** | POC / Research (학술 검증) / Production-ish (실제 자본 운용) |
| **학습곡선** | ⭐ 쉬움 / ⭐⭐ 중간 / ⭐⭐⭐ 가파름 |
| **벤치마크** | ✅ 공개된 정량 결과 / 🟡 백테스트 결과만 / ❌ 미공개 |
| **라이선스** | MIT / Apache / GPL / Custom |
| **체인 커버리지** | 🟧 EVM / 🟪 Solana / 🟦 Hyperliquid / 🟫 멀티체인 / 🟡 CEX 전용 |
| **MEV 보호** | 있음 / 없음 — 온체인 봇에 필수 |

---

## 목차

1. [벤치마크 & 평가 인프라](#1-벤치마크--평가-인프라-가장-중요)
2. [학술 검증 LLM 트레이딩 프레임워크](#2-학술-검증-llm-트레이딩-프레임워크)
3. [프로덕션 멀티 에이전트 트레이딩 봇](#3-프로덕션-멀티-에이전트-트레이딩-봇)
4. [Solana 네이티브 AI 에이전트 프레임워크](#4-solana-네이티브-ai-에이전트-프레임워크)
5. [멀티체인 / EVM 에이전트 툴킷](#5-멀티체인--evm-에이전트-툴킷)
6. [MEV / DEX 전용 봇](#6-mev--dex-전용-봇)
7. [예측 시장 (Polymarket / Kalshi) AI 에이전트](#7-예측-시장-polymarket--kalshi-ai-에이전트)
8. [데이터 인프라 & 온체인 분석](#8-데이터-인프라--온체인-분석)
9. [공통 함정 (Crypto 특화)](#9-공통-함정-crypto-특화)

---

## 1. 벤치마크 & 평가 인프라 (가장 중요)

> **이 카테고리의 자료가 다른 모든 카테고리보다 먼저 와야 합니다.** 벤치마크 없이는 어떤 LLM 트레이딩 도구가 좋은지 객관적으로 알 수 없습니다.

### 🏆 [Nof1 Alpha Arena](https://nof1.ai/)
> 6개 frontier LLM(GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5, Grok 4, DeepSeek V3.1, Qwen3-Max)에 각각 $10,000 USDC를 주고 Hyperliquid에서 자율 거래시킨 최초의 실거래 벤치마크. Season 1: 2025-10-17 ~ 2025-11-03.

- **활성도**: 🟢 활발 (Season 2 진행 중) | **성숙도**: Production (실제 자본) | **학습곡선**: ⭐ (관전용) | **벤치마크**: ✅ 가장 강함 | **체인**: 🟦 Hyperliquid | **공개**: 결과 무료, 코드 비공개
- **강점**:
  - 업계에서 유일한 **실제 자본 + 실시간 + 공개 leaderboard** 벤치마크. 모든 거래가 온체인에서 검증 가능
  - 결과가 충격적으로 dispersion이 큼 — 벤치마크 IQ ≠ 트레이딩 IQ를 입증
  - HyperDash를 통한 copy-trading 연동 가능 — 본인이 직접 모델 follow 가능
  - Bank of England FPC가 *"semi-autonomous deep trading agents가 시장 충격을 증폭할 수 있다"* 고 언급할 만큼 정책 영향력 있음
- **약점**:
  - Nof1의 harness 자체는 비공개 — 정확한 prompt, system message, 데이터 피드 미공개
  - Season 1은 2주, sample size 작음 — 통계적으로 결론짓기 부족
  - "Unrealized P&L 미반영" 같은 측정 quirk가 있어 단기 순위 해석 주의
  - 모델별 성과 차이가 *trading skill*보다 *risk profile*의 함수일 가능성이 높음
- **적합 사용자**: LLM 트레이딩 평가의 baseline을 알고 싶은 모든 사람. 특정 모델을 본인 시스템에 도입하기 전 반드시 leaderboard 확인
- **결정적 데이터** (Season 1 종료 시점): DeepSeek V3.1 +46%, Qwen3 Max 2위, Claude Sonnet 4.5 3위, GPT-5 -75%

### [Tom-roujiang/Awesome-LLM-Quantitative-Trading-Papers](https://github.com/Tom-roujiang/Awesome-LLM-Quantitative-Trading-Papers)
> CryptoTrade(EMNLP 2024), FS-ReasoningAgent, QuantAgent, AlphaQuanter 등 최신 LLM 트레이딩 페이퍼 큐레이션. **암호화폐 특화 페이퍼들의 시작점**.

- **활성도**: 🟢 매월 갱신 | **성숙도**: 메타 자료 | **벤치마크**: ✅ 다수 페이퍼 링크 | **라이선스**: MIT
- **강점**: 학술 SOTA 추적의 가장 빠른 길
- **약점**: 코드 품질은 페이퍼별로 천차만별
- **적합 사용자**: 연구자, 트렌드 follower

### [DeepFund (HKUST, NeurIPS 2025)](https://github.com/) (코드 검색 필요)
> live arena 형식으로 LLM이 펀드 투자에서 전문가 수준이 될 수 있는지 평가. 크립토와 주식 모두 포함.

- **활성도**: 🟢 | **성숙도**: Research | **벤치마크**: ✅
- **강점**: 학회 검증, 평가 메소드 신뢰도 높음
- **적합 사용자**: LLM의 trading 능력을 객관 비교하려는 평가자

---

## 2. 학술 검증 LLM 트레이딩 프레임워크

### 🥇 [Xtra-Computing/CryptoTrade](https://github.com/Xtra-Computing/CryptoTrade)
> EMNLP 2024 채택. **on-chain + off-chain 데이터를 결합**한 reflective LLM 에이전트. 일일 트레이딩 후 자기 결정을 reflect하는 메커니즘이 핵심. BTC/ETH/SOL 등 다양한 시장 조건에서 traditional 전략 대비 우수한 수익 검증.

- **활성도**: 🟡 유지보수 (논문 후 업데이트 줄어듦) | **성숙도**: Research (학회 검증) | **학습곡선**: ⭐⭐ | **벤치마크**: ✅ EMNLP 2024 페이퍼에 ablation 결과 | **체인**: 🟧🟪 (BTC/ETH/SOL 데이터) | **라이선스**: 학술용
- **강점**:
  - **암호화폐 LLM 트레이딩의 가장 인용 많은 학술 레퍼런스**
  - Reflection 메커니즘이 단순하지만 효과적 — 모든 후속 연구가 이 패턴을 차용
  - on-chain 데이터(가스, EIP-1559 등)를 LLM 컨텍스트에 직접 넣는 접근이 신선
- **약점**:
  - 2024년 데이터 기준 — 2025-2026 시장 상황에서 재현성 검증 필요
  - 페이퍼는 좋지만 실거래 운영 코드는 아님
  - 후속 페이퍼들이 *"강한 LLM(GPT-4-turbo)이 약한 LLM(GPT-3.5)보다 못한"* 현상을 발견 — 단순 모델 업그레이드가 답이 아님
- **적합 사용자**: 학술 baseline부터 구축하려는 연구자, 자체 reflection 모듈 설계의 reference

### [Persdre/FS-ReasoningAgent](https://github.com/Persdre/FS-ReasoningAgent)
> 사실 정보(factual)와 주관 정보(subjective)를 분리해서 추론하는 멀티 에이전트 프레임워크. **BTC +7%, ETH +2%, SOL +10% 수익 개선** 입증. Bull market에서는 subjective news가, Bear market에서는 factual info가 더 좋은 결과를 낸다는 ablation 발견.

- **활성도**: 🟡 | **성숙도**: Research | **학습곡선**: ⭐⭐ | **벤치마크**: ✅ 정량 ablation | **체인**: 🟧🟪 (BTC/ETH/SOL)
- **강점**:
  - 가장 정교한 ablation 연구 중 하나 — 시장 regime별로 어떤 정보 유형이 유효한지 데이터로 보임
  - "강한 LLM이 약한 LLM보다 못한" 역설을 직접 다룸
  - SOL +10%는 단순 baseline 대비 의미 있는 개선
- **약점**: SOL 같은 변동성 큰 자산에서의 7-10% 개선이 trading skill인지 운인지 단정 어려움
- **적합 사용자**: factual vs subjective 분리가 본인 도메인에 도움 될지 검증하려는 연구자

### Bitcoin Explainable Zero-Shot Multi-Agent (ScienceDirect 2025)
> Bitcoin 가격에 특화된 zero-shot reasoning 멀티 에이전트. **Reddit sentiment 활용 시 23.30% total return**, news sentiment는 오히려 noise를 주입한다는 ablation. Slippage와 거래 수수료를 명시적으로 반영한 realistic backtesting + G-EVAL 기반 LLM 평가 프로토콜로 reproducibility 강화.

- **활성도**: 🟢 (2025년 11월 게재) | **성숙도**: Research | **벤치마크**: ✅ 정량 + reproducible | **체인**: 🟧 (BTC)
- **강점**:
  - Crypto 분야에서 드물게 **slippage + fee를 반영한 realistic backtesting**
  - Reddit > News라는 발견은 다른 연구들과 일관됨 (subjective signal의 가치)
  - LLM-based 평가 프로토콜(G-EVAL)로 reasoning 일관성 검증
- **약점**: BTC 단일 자산. 다른 코인 일반화는 별도 검증 필요
- **적합 사용자**: BTC 트레이더, sentiment 소스를 어디서 끌어올지 결정해야 하는 개발자

---

## 3. 프로덕션 멀티 에이전트 트레이딩 봇

### 🏆 [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) (Crypto fork 다수)
> 55,800+ stars. 18명의 전설적 투자가(Buffett, Munger, Cathie Wood, Burry 등)를 LLM 에이전트로 구현한 멀티 에이전트 헤지펀드. **AI-Hedge-Fund for Crypto** 라는 크립토 전용 fork도 활발.

- **활성도**: 🟢 매우 활발 | **성숙도**: Research (POC 명시) | **학습곡선**: ⭐⭐ | **벤치마크**: 🟡 자체 backtester 내장 | **체인**: 🟡 + 🟧 (CEX 위주, fork에 따라 DEX)
- **강점**: 가장 인기 많은 multi-agent 헤지펀드 reference architecture, Ollama 지원으로 로컬 LLM 실행 가능
- **약점**: 캐릭터 prompt가 stylistic하지만 실제 투자가 의사결정과는 거리, "not for real trading" 명시
- **적합 사용자**: 멀티 에이전트 패턴 학습, 자체 시스템의 reference

### [alsk1992/CloddsBot](https://github.com/alsk1992/CloddsBot)
> 1000+ 시장(Polymarket, Kalshi, Binance, Hyperliquid, Solana DEX, 5개 EVM 체인)에서 자율 거래하는 오픈소스 AI 에이전트. **Claude 기반**. Self-hosted. **118+ 전략, 8개 LLM 프로바이더, x402 agent-to-agent 결제 프로토콜 지원**.

- **활성도**: 🟢 매우 활발 | **성숙도**: Production-ish | **학습곡선**: ⭐⭐⭐ | **벤치마크**: 🟡 strategy별 자체 metric | **체인**: 🟫 멀티체인 (Solana + EVM 5개 + Hyperliquid + CEX) | **MEV 보호**: ✅ Jito + Flashbots
- **강점**:
  - 본 카테고리에서 **가장 종합적인 단일 패키지** — 7개 거래소(Binance, Bybit, Hyperliquid, MEXC, Drift, Percolator, Lighter), 최대 200x 레버리지
  - 멀티 LLM 프로바이더 (Claude primary + GPT-4 + Gemini + Groq + Together + Fireworks + AWS Bedrock + Ollama)
  - Unified risk engine (circuit breaker, VaR/CVaR, volatility regime detection, stress testing, Kelly sizing, daily loss limits, kill switch) — production-grade
  - x402 protocol 기반 agent-to-agent USDC 결제 — agent commerce 미래에 베팅
  - arXiv:2508.03474 기반 cross-platform arbitrage detection
- **약점**:
  - 너무 많은 기능 = 학습곡선 가파름. 처음 보는 사람은 어디서 시작할지 막막
  - 일부 strategy는 `dry-run` 디폴트지만, 200x 레버리지 + meme coin swarm 같은 기능은 위험 자체
  - 활성도는 좋지만 long-term 메인테이너 신뢰도는 검증 시간 필요
- **적합 사용자**: 진지한 prop trading, 멀티 시장 동시 운용, agent commerce 실험자
- **주의**: README의 *"Pump.fun swarm trading (20 wallets)"* 같은 기능은 윤리적/법적 회색지대

### [qrak/LLM_trader](https://github.com/qrak/LLM_trader)
> Vision AI 차트 분석 + 실시간 Neural Engine + 라이브 모니터링 대시보드. **RAG 파이프라인에 DefiLlama TVL 통합**, 다중 모델 consensus ("Council of Models") 아키텍처, 다양한 trader personality.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐⭐ | **벤치마크**: 🟡 라이브 대시보드(semanticsignal.qrak.org) | **체인**: 🟡 CEX 중심 | **라이선스**: 확인 필요
- **강점**:
  - **차트 비전 분석** — 다른 LLM 트레이더들이 잘 안 하는 영역
  - DefiLlama 통합으로 on-chain TVL을 fundamentals signal로 활용
  - Discord 커뮤니티 활성화 + 라이브 시그널 공유
  - 엄격한 pytest 테스트 디렉토리로 LLM parsing regression 방지
- **약점**: 라이브 대시보드의 백테스트 결과는 검증되었지만 실거래 PnL은 별개
- **적합 사용자**: 차트 패턴 + sentiment 결합 트레이딩에 관심, 커뮤니티 신호 받고 싶은 사용자

### [nMaroulis/sibyl](https://github.com/nMaroulis/sibyl)
> AI 에이전트 + LLM 기반 크립토 인사이트 + 트레이딩 대시보드. **Bollinger Surge, Impulse Breakout, Quantum Momentum** 등 자체 알고리즘 + 백테스팅 + RAG 시스템(수천 개의 크립토 출판물). 비-LLM Chronos 모듈도 보유 (TensorFlow Bi-LSTM, Gated Transformer Units, ARIMA).

- **활성도**: 🟢 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐⭐ | **벤치마크**: 🟡 자체 backtest | **체인**: 🟡 CEX
- **강점**: LLM 외에 클래식 ML도 통합 — 하이브리드 접근, 풍부한 시각화 + 대시보드
- **약점**: ChromaDB + RAG 셋업이 무거움
- **적합 사용자**: 대시보드 중심 트레이딩, 직관적 UX 선호 사용자

---

## 4. Solana 네이티브 AI 에이전트 프레임워크

> Solana는 sub-second finality + $0.00025 fee로 **AI 에이전트의 디폴트 체인**으로 부상. 2026년 Solana 재단은 *"향후 2년 안에 온체인 트랜잭션의 99%가 에이전트 주도로 전환된다"* 고 공언.

### 🏆 [elizaOS/eliza](https://github.com/elizaOS/eliza)
> **GitHub 17,600+ stars** — 크립토와 AI 교차점에서 가장 인기 있는 레포 중 하나. TypeScript AI 에이전트 프레임워크. Solana, Twitter/X, Discord, Telegram 등 다중 클라이언트 지원. Character JSON 기반 에이전트 정의. ELIZA 토큰을 통한 플러그인 인센티브 구조.

- **활성도**: 🟢 매우 활발 | **성숙도**: Production | **학습곡선**: ⭐⭐ | **벤치마크**: ❌ (인프라용) | **체인**: 🟪 Solana 중심 + 멀티체인 | **라이선스**: MIT
- **강점**:
  - **소셜 페르소나 + 트레이딩 에이전트의 결합** — 다른 프레임워크가 못하는 영역
  - Solana Foundation이 공식 추천하는 프레임워크 중 하나
  - Plugin 생태계가 가장 크다 (Solana Agent Kit, GOAT 등 모두 ElizaOS plugin 존재)
  - Cross-chain 지원 (Chainlink CCIP)
- **약점**:
  - "AI agent token" 메이저 narrative와 강하게 묶여 있어 **token speculation 영향** 받음
  - Twitter/Discord bot으로 시작한 프레임워크라, 순수 트레이딩보다는 social agent에 강함
  - 보안 검증된 strategy 모듈 부족 — 직접 짜야 함
- **적합 사용자**: AI 에이전트가 트위터에서 떠들면서 동시에 트레이딩까지 하길 원하는 사용자, Solana 네이티브 개발

### 🥈 [sendaifun/solana-agent-kit](https://github.com/sendaifun/solana-agent-kit)
> Solana 프로토콜에 모든 AI 에이전트를 연결하는 오픈소스 툴킷. **60+ Solana 액션 자율 수행** — Token, NFT, DeFi (Jupiter swap, Solayer staking, lending), Blinks 플러그인. Python (`solana-agent-kit-py`) 버전도 별도 제공.

- **활성도**: 🟢 매우 활발 | **성숙도**: Production | **학습곡선**: ⭐ | **벤치마크**: ❌ (인프라용) | **체인**: 🟪 Solana 전용 | **라이선스**: MIT
- **강점**:
  - **Solana DeFi 통합의 사실상 표준** — Jupiter, Raydium, Orca 등 주요 프로토콜 다 커버
  - LangChain, Vercel AI SDK, OpenAI agents 모두 지원하는 어댑터
  - 셋업이 간단 (`npm install` 후 wallet + plugin만 추가)
- **약점**:
  - Solana 외 체인 지원 없음
  - Trading "전략"은 사용자가 직접 — Kit은 액션 layer일 뿐
- **적합 사용자**: Solana DeFi에 진심인 개발자, 빠른 프로토타이핑

### [GOAT (Great Onchain Agent Toolkit) by Crossmint](https://github.com/goat-sdk/goat)
> AI 에이전트와 모든 온체인 앱을 연결하는 universal adapter. **30+ 체인 + 200+ 플러그인** (Solana Jupiter/Orca + Ethereum Uniswap/Aave + 기타). 모든 wallet (Crossmint Smart Wallets, Coinbase 포함) 지원.

- **활성도**: 🟢 활발 | **성숙도**: Production | **학습곡선**: ⭐⭐ | **벤치마크**: ❌ (인프라용) | **체인**: 🟫 멀티체인 | **라이선스**: 오픈소스
- **강점**:
  - **체인 무관 universal interface** — Solana Agent Kit이 Solana 전용이라면 GOAT은 모든 체인
  - 200+ 플러그인 = 개발자가 직접 통합 안 해도 됨
  - Crossmint의 wallet infrastructure 통합으로 KYC/non-custodial 둘 다 지원
- **약점**:
  - 깊이는 chain-specific kit보다 떨어질 수 있음 (Solana 깊이는 Solana Agent Kit이 더 좋음)
  - 200+ 플러그인 품질 편차 큼
- **적합 사용자**: 멀티체인 에이전트 빌더, 체인별 통합 코드 안 쓰고 싶은 개발자

### [Rig (rig-onchain-kit)](https://github.com/0xPlaygrounds/rig)
> **Rust-native** AI 에이전트 프레임워크. Listen.rs와 결합하면 Solana에서 sub-millisecond 거래 가능. **MEV 전략, HFT** 같은 latency-critical 애플리케이션 전용. Jito bundle 제출 지원.

- **활성도**: 🟢 활발 | **성숙도**: Production | **학습곡선**: ⭐⭐⭐ (Rust) | **벤치마크**: 🟡 latency 메트릭 | **체인**: 🟪 Solana 특화 | **MEV 보호**: ✅ Jito bundles | **라이선스**: 오픈소스
- **강점**:
  - **유일한 production-grade Rust LLM agent framework**
  - sub-ms latency = MEV 경쟁에서 의미 있음
  - Rust 타입 시스템으로 compile-time 정확성
- **약점**:
  - Rust 개발 능력 필수 → 진입장벽 높음
  - 생태계가 TS/Python보다 작음
- **적합 사용자**: HFT, MEV, latency-sensitive 운영 전문가

### [solana-foundation/awesome-solana-ai](https://github.com/solana-foundation/awesome-solana-ai)
> Solana 재단의 공식 AI 도구 큐레이션. SAID Protocol(에이전트 신원/평판), Splatworld, SP3ND Agent, Breeze Agent Kit(yield farming) 등.

- **활성도**: 🟢 자주 갱신 | **라이선스**: MIT (메타)
- **적합 사용자**: Solana AI 생태계 신규 도구 발굴

---

## 5. 멀티체인 / EVM 에이전트 툴킷

### [wen82fastik/ai-crypto-cryptocurrency-trading-bot](https://github.com/wen82fastik/ai-crypto-cryptocurrency-trading-bot)
> Binance, Hyperliquid, Bybit, OKX, Coinbase, MT4/MT5, Solana DEX, Uniswap, 30+ 거래소를 커버하는 universal AI 트레이딩 봇. LLM 에이전트 (GPT-4o, Claude, DeepSeek) 기반. Copy trading, arbitrage, DCA, grid, scalping, futures, DeFi 전략.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐⭐ | **벤치마크**: ❌ (전략별 자체 백테스트) | **체인**: 🟫 멀티체인 + CEX | **라이선스**: MIT
- **강점**: 가장 광범위한 거래소 커버리지, YAML 기반 설정으로 빠른 배포, Telegram 통합
- **약점**: README가 SEO 키워드로 도배 → 품질 신호 모호, 30+ 거래소 모두 동일 깊이로 지원되는지 의문
- **적합 사용자**: 다중 거래소 운용, 빠른 시작이 필요한 사용자

---

## 6. MEV / DEX 전용 봇

> MEV 영역은 **윤리적/법적 회색지대**가 큽니다. Sandwich attack은 다른 사용자에게 직접적 손실을 입힙니다. 본 큐레이션은 *기술 정보* 목적입니다.

### 🏆 [jito-labs/mev-bot](https://github.com/jito-labs/mev-bot)
> Jito 공식 Solana 백런 차익 봇. **SOL/USDC를 타깃으로 하는 backrun arbitrage**. Jito mempool과 bundle을 활용. Raydium, Raydium CLMM, Orca Whirlpools, Orca AMM 지원.

- **활성도**: 🟢 (Jito 메인테인) | **성숙도**: Production | **학습곡선**: ⭐⭐⭐ | **체인**: 🟪 Solana | **MEV 타입**: Backrun arbitrage (sandwich보다 윤리적)
- **강점**: Solana MEV의 reference 구현, **백런 = 사용자에 직접 피해 안 줌** (앞서간 거래 후 균형 회복)
- **약점**: Solana 전용, 경쟁 치열해 single-bot 수익성 점점 어려워짐
- **적합 사용자**: Solana MEV 학습 시작점

### [keidev-sol/Solana-Mev-Bot](https://github.com/keidev-sol/Solana-Mev-Bot)
> 고성능 Solana MEV 봇. Arbitrage, liquidations, price inefficiency 전략 + 멀티 wallet 지원.

- **활성도**: 🟢 | **체인**: 🟪 Solana
- **강점**: 다중 전략 지원
- **약점**: 검증 정보 적음, sandwich attack 가능성 — 윤리적 주의

---

## 7. 예측 시장 (Polymarket / Kalshi) AI 에이전트

> 2026년 3월 Polymarket 거래량 $2B 돌파, **에이전트 주도 거래량이 35-40% 차지**. AI 에이전트가 가장 빠르게 침투 중인 영역.

### [Parsec API](https://github.com/) (검색 권장)
> Polymarket, Kalshi, Opinion, Limitless, PredictFun을 통합하는 prediction market 인프라. AI agent trading용 MCP 서버. Generous free tier.

- **활성도**: 🟢 | **성숙도**: Production-ish | **학습곡선**: ⭐⭐ | **체인**: 🟪🟧 멀티체인 (Polygon for Polymarket)
- **강점**: 5개 prediction market을 단일 인터페이스로, MCP server = Claude Desktop 즉시 연결
- **약점**: 여전히 미국 규제 리스크 존재 (Kalshi는 CFTC 등록되어 있어 안전, Polymarket은 미국 사용자 차단)
- **적합 사용자**: 정치/규제/스포츠 이벤트를 시장 신호로 활용하려는 트레이더

### [PolyMind](https://github.com/) (검색 권장)
> 실시간 Polymarket 트레이딩 알림 + 멀티 AI 분석 (Groq, Claude, Gemini). Whale bets, volume spikes, 코디네이트된 wallets, 12 signal types 추적. Free tier.

- **강점**: 멀티 LLM consensus로 noise 감소, whale 활동 추적
- **적합 사용자**: 알림 기반 운용, manual 결정 + AI 분석 결합

### Polymarket MCP Server
> Claude가 Polymarket을 자연어로 거래할 수 있게 해주는 MCP 서버. 45 tools, 실시간 모니터링, enterprise-grade safety features.

- **강점**: 즉시 Claude Desktop 연결
- **적합 사용자**: Polymarket을 본격 거래하고 싶지만 코드 작성 안 하려는 사용자

---

## 8. 데이터 인프라 & 온체인 분석

### [ChainPulse](https://github.com/) (검색 권장)
> AI 기반 Bitcoin 네트워크 인텔리전스 CLI. 자연어로 mempool, fees, blocks, mining 분석.

- **강점**: 비트코인 온체인 데이터를 자연어로 직접 쿼리
- **적합 사용자**: BTC 온체인 분석 자동화

### [Coinugget](https://github.com/) (검색 권장)
> 실시간 RSI 신호, price action, volume spikes 대시보드. 무료, sign-up 불필요.

- **강점**: 빠른 시작, 무료
- **약점**: AI보다는 rule-based, "AI" 라벨이지만 실제 LLM 활용 제한적
- **적합 사용자**: 가벼운 시그널 모니터링

### [CryptoInscriber](https://github.com/) (검색 권장)
> 모든 크립토 거래소에서 라이브 historical trade data 다운로드.

- **강점**: 백테스트용 데이터 수집의 시작점
- **적합 사용자**: 본인 LLM 트레이딩 봇의 백테스트 데이터 필요한 개발자

### [DefiLlama API](https://defillama.com/docs/api)
> 모든 DeFi 프로토콜의 TVL, 수익률, 토큰 데이터. 무료 + open source.

- **강점**: DeFi sentiment의 fundamental layer로 LLM 컨텍스트에 추가 가능
- **적합 사용자**: DeFi 통합 트레이딩 에이전트 빌더

---

## 9. 공통 함정 (Crypto 특화)

크립토 LLM 트레이딩은 주식과 다른 함정이 있습니다.

### 9.1 24/7 시장의 함정
- **인간이 자고 있을 때 봇이 청산되는 게 가장 흔한 시나리오** — 미국 시간 기준 새벽 3시(아시아 시간 오전)에 변동성 폭발이 자주 발생
- 해결: kill switch, 시간대별 max position size, 알림 + 자동 청산 보호

### 9.2 Slippage가 Sharpe ratio를 잡아먹는다
- 페이퍼 백테스트 Sharpe 4.0 → 실거래 Sharpe 0.5는 흔함. 차이의 90%는 slippage + 수수료
- 특히 alt-coin / low-liquidity 토큰: 시장가 주문 1,000 USDC가 0.5% 가격을 밀어버림
- *"Bitcoin Explainable Multi-Agent" 페이퍼처럼 slippage를 명시적으로 백테스트에 반영해야 함*

### 9.3 MEV — 본인이 sandwich 당함
- DEX에서 swap 할 때 봇이 본인 거래를 sandwich → 0.3-2% 자동 손실
- 해결: Jito bundle, Flashbots Protect, MEV-protect RPC 사용

### 9.4 거래소 리스크 (CEX 의존성)
- **FTX, Mt.Gox, QuadrigaCX** — CEX는 망한다
- 봇이 CEX에 자본 보관 시 **출금 한도, 갑작스런 KYC 요구, 거래소 freeze** 등으로 자본 회수 불가능 시나리오 항상 존재
- 해결: 자본 분산, 봇 운용 자본은 trading 액수만 거래소에 둠 (장기 보관 X), DEX 비중 늘림

### 9.5 토큰 / 모델 narrative 트랩
- ElizaOS, GOAT 같은 프레임워크가 인기 = **AI agent token speculation**과 결합되어 가격 상승
- 본인이 사용하는 프레임워크의 발행 토큰을 동시에 보유하면 **이해 충돌** 발생 — 프레임워크 객관 평가 불가
- 해결: 프레임워크와 토큰을 분리해서 평가

### 9.6 LLM hallucination → 자본 손실
- LLM이 *"BTC가 $200K 갈 것"* 같은 컨센서스 환각을 만들면 봇은 leveraged long 진입
- Alpha Arena의 GPT-5 -75%는 이 패턴의 극단 사례
- 해결: 다중 모델 consensus (CloddsBot, qrak/LLM_trader 패턴), reflection mechanism (CryptoTrade 패턴), 손절 강제

### 9.7 24시간 변동성 vs LLM 호출 latency
- LLM 호출 1회 ≈ 5-30초. 그 동안 BTC가 1% 움직이는 일 흔함
- 해결: latency-critical 결정에는 작은 모델 (Haiku, gpt-5-mini), 깊은 분석은 큰 모델로 비동기 처리

### 9.8 거버넌스 / 규제
- **미국 SEC**: 토큰 트레이딩 봇 자체는 회색지대지만, **타인 자금 운용은 RIA 등록 필요**
- **한국 금감원**: 가상자산 거래소 이용은 OK, but 자동매매 도구 영업·판매는 별도 검토 필요
- **EU MiCA**: 2024년부터 완전 시행. 알고리즘 트레이딩에 명시적 의무
- **자금세탁방지(AML)**: DEX 봇이 mixer / privacy coin과 연결되면 추후 OFAC 제재 리스크

---

## 추천 시작 경로 (사용자 유형별)

### A. **AI 트레이딩 능력 수준 평가가 목적**
1. [Nof1 Alpha Arena](https://nof1.ai/leaderboard) leaderboard 매일 관전
2. HyperDash로 상위 모델 copy-trading (소액)
3. 그 다음 본인 시스템 구축 결정

### B. **학술 baseline + 본인 개선이 목적**
1. [Xtra-Computing/CryptoTrade](https://github.com/Xtra-Computing/CryptoTrade) 클론 → 페이퍼 읽기
2. [FS-ReasoningAgent](https://github.com/Persdre/FS-ReasoningAgent) ablation 결과 재현
3. 본인 개선 모듈 추가

### C. **Solana DeFi 자동화가 목적**
1. [solana-agent-kit](https://github.com/sendaifun/solana-agent-kit) (60+ DeFi action) 시작
2. ElizaOS를 social layer로 추가
3. MEV 보호: Jito bundles 활용

### D. **멀티 시장 prop trading이 목적**
1. [CloddsBot](https://github.com/alsk1992/CloddsBot)으로 시작 (1000+ 시장)
2. **반드시 dry-run 모드 6개월** 후 실거래
3. circuit breaker, daily loss limit 디폴트 그대로 유지

### E. **예측 시장 자동매매가 목적**
1. Parsec API + Polymarket MCP 등록
2. Claude Desktop에서 자연어로 거래 → 익숙해지면 autonomous agent로 전환
3. Kalshi (CFTC 등록)부터 시작 → Polymarket으로 확장

### F. **MEV가 목적**
1. [jito-labs/mev-bot](https://github.com/jito-labs/mev-bot) 코드 학습
2. Rust로 [Rig + Listen.rs] 환경 구축
3. **Backrun arbitrage만** — sandwich attack은 윤리적 X

---

## 가장 중요한 한 가지

**Alpha Arena Season 1의 결과를 다시 보세요**: GPT-5 -75%, DeepSeek V3.1 +46%. 이것이 의미하는 바는:

> **모델이 강력해도 risk management가 없으면 망한다.**
> **모델이 평범해도 discipline + position sizing이 좋으면 이긴다.**

LLM 크립토 트레이딩의 진짜 알파는 *"어떤 모델을 쓰는가"* 가 아니라 *"어떻게 risk를 통제하는가"* 입니다. 이 큐레이션의 모든 도구는 **risk management 기능을 갖췄는지** 를 1차 평가 기준으로 보세요. Kelly sizing, stop-loss, circuit breaker, kill switch가 디폴트로 있는 도구를 선택하세요.

---

## 기여 / 업데이트

이 문서는 **2026년 4월 시점 스냅샷**입니다. 크립토 + AI 분야는 주 단위로 변하므로, 사용 전 각 레포의 마지막 커밋 일자, 이슈 활성도를 확인하세요.

별 표시 ⭐ 수치는 시점에 따라 변동합니다. **별 수가 곧 품질은 아닙니다.**

기여 환영합니다:
- ⭐ 별 누르기
- 🐛 누락된 좋은 레포 제보
- 💬 평가에 대한 반박
- 📊 본인이 직접 검증한 백테스트 결과 공유

---

## 🔗 관련 자료

- **Awesome Vibe Invest (주식)**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)
- **Harness Quant v2** (LLM 기반 분석 패키지): [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)
- **LTCM의 사례로 배우는 모델을 읽는 힘**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD)
- **Microsoft의 Fintool 인수 분석**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)

---

## Disclaimer

이 큐레이션의 모든 콘텐츠는 **연구·교육 목적**입니다.

- 어떤 도구도 수익을 보장하지 않습니다 — Alpha Arena의 GPT-5 -75%가 실제 데이터입니다
- 모든 평가는 작성 시점의 공개 정보 기반 주관적 평가입니다
- 실전 자본 운용 전 반드시 **dry-run + paper trading 6개월** 이상 거치세요
- 미국 SEC/CFTC, 한국 금감원, EU MiCA 모두 AI 기반 자동 트레이딩에 규제 적용 가능 — 타인 자금 운용은 라이선스 검토 필수
- MEV bot의 sandwich attack 같은 일부 전략은 윤리적 회색지대 + 일부 관할권에서 시장 조작으로 해석 가능
- 투자 결과 + 법적 리스크에 대한 책임은 사용자에게 있습니다

---

<p align="center">
  <i>"Model intelligence is not trading intelligence."</i><br>
  <i>"모델의 지능이 곧 트레이딩 지능은 아니다."</i><br>
  — Alpha Arena Season 1 lesson
</p>
