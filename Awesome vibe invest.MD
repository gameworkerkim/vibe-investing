# Awesome Vibe Invest

> **AI/LLM을 활용한 투자·트레이딩 GitHub 레포지토리 큐레이션 (2026년 4월 기준)**
> 단순 나열이 아니라 **객관적 평가 (강점/약점/적합 사용자)** 를 함께 제공합니다.

"바이브 인베스팅(vibe investing)"은 바이브 코딩에서 파생된 개념으로, **자연어 지시 → LLM이 도구를 호출 → 시장 데이터 수집·분석 → 투자 의사결정 산출**까지의 agentic 파이프라인을 지칭합니다. 이 문서는 그 흐름에 활용할 수 있는 오픈소스 자산을 정리합니다.

---

## 📐 평가 기준

각 레포는 다음 5개 차원으로 평가합니다.

| 차원 | 의미 |
|---|---|
| **활성도** | 🟢 활발 (최근 3개월 내 커밋 다수) / 🟡 유지보수 (커밋 드묾) / 🔴 정체 (6개월+ 무커밋) |
| **성숙도** | POC (논문·데모 수준) / Research (실험적 사용 가능) / Production-ish (운영에 준하는 안정성) |
| **학습곡선** | ⭐ 쉬움 / ⭐⭐ 중간 / ⭐⭐⭐ 가파름 |
| **한국 시장** | KOSPI/KOSDAQ 지원 여부 |
| **라이선스** | MIT/Apache/AGPL/Custom 등 |

⚠️ **공통 면책**: 모든 오픈소스 트레이딩 도구는 **교육·연구 목적**입니다. 실전 자본 운용 전 반드시 자체 백테스트, 페이퍼 트레이딩, 법률 검토를 거치세요. 어떤 레포도 수익을 보장하지 않으며, 다수가 README에 "not for real trading"을 명시합니다.

---

## 📚 목차

1. [멀티 에이전트 프레임워크](#1-멀티-에이전트-프레임워크-multi-agent-frameworks)
2. [LLM 단일 에이전트 / 리서치 도구](#2-llm-단일-에이전트--리서치-도구)
3. [강화학습 트레이딩](#3-강화학습-트레이딩-rl)
4. [금융 도메인 LLM](#4-금융-도메인-llm)
5. [백테스트 엔진](#5-백테스트-엔진)
6. [데이터 & 인프라 (MCP, APIs)](#6-데이터--인프라-mcp-apis)
7. [메모리 & 컨텍스트 시스템](#7-메모리--컨텍스트-시스템)
8. [Production / Risk Engineering](#8-production--risk-engineering)
9. [벤치마크 & 페이퍼](#9-벤치마크--페이퍼-컬렉션)
10. [한국 / 아시아 시장 자원](#10-한국--아시아-시장-자원)
11. [메타 어썸 리스트](#11-메타-어썸-리스트)
12. [공통 함정 (Common Pitfalls)](#12-공통-함정-common-pitfalls)

---

## 1. 멀티 에이전트 프레임워크 (Multi-Agent Frameworks)

> 여러 LLM 에이전트가 각자 역할(Bull/Bear/Risk/PM 등)을 맡아 토론하고 합의에 도달하는 구조. **현재 vibe invest 분야의 메인스트림.**

### 🏆 [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) — 55.8k ⭐
> 전설의 투자가들(Buffett, Munger, Cathie Wood, Burry, Ackman, Damodaran, Graham 등) 18명을 각각 LLM 에이전트로 구현하고 합의 알고리즘으로 매수/매도 결정.

- **활성도**: 🟢 활발 | **성숙도**: Research (POC 명시) | **학습곡선**: ⭐⭐ | **한국 시장**: ❌ | **라이선스**: MIT
- **강점**:
  - 가장 인기 많은 AI 헤지펀드 레포 (55k+ stars). 커뮤니티/이슈 활발 → 문제 해결 자료 풍부
  - 투자 철학을 캐릭터로 의인화 → 결과의 reasoning을 이해하기 쉬움
  - Ollama 지원으로 로컬 LLM(GPT-4o-mini 등)에서도 동작 → API 비용 절감
  - Backtester 내장
- **약점**:
  - 저자가 명시적으로 "proof of concept, not for real trading" 표기 — 실거래 자동화 비추천
  - 캐릭터 프롬프트가 stylistic하지만 실제 투자가들의 의사결정 frame과는 거리가 있음 (Buffett이 진짜 이렇게 결정하지 않음)
  - Risk Manager 에이전트가 단순 (포지션 한도만 체크, 진짜 risk attribution 없음)
  - 데이터 소스 의존도 높음 (Financial Datasets API 유료 키 필요)
- **적합 사용자**: AI 멀티 에이전트 아키텍처 학습자, 에이전트 토론 패턴 연구자, 자체 시스템의 reference architecture로 활용하려는 개발자
- **하지 말 것**: 결과만 보고 자동매매 연결

### [TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents) — 학술적 기반 강함
> 7개 역할(Fundamentals/Sentiment/News/Technical Analyst + Bull/Bear Researcher + Trader + Risk Manager)을 LangGraph로 오케스트레이션. 2026-03 v0.2.3에서 GPT-5.4/Gemini 3.1/Claude 4.6 + 5단계 평점 + 다국어 지원.

- **활성도**: 🟢 활발 | **성숙도**: Research | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: Apache 2.0
- **강점**:
  - 학술 논문(arXiv:2412.20138) 기반 → 설계 근거가 문서화됨
  - OpenAI/Google/Anthropic/xAI/OpenRouter/Ollama 멀티 프로바이더 지원
  - LangGraph 기반 → 워크플로 시각화/디버깅 용이
  - "real trading firm" 구조 모사 → 분업 명확
- **약점**:
  - LangGraph 학습 필요 → 진입장벽
  - 논문 데이터셋이 2024년 6-11월에 머무름 → 2026년 시장 검증 부족
  - 5-tier rating으로 출력이 매끈하지만 실제 returns에 잘 매핑되지 않을 수 있음 ("Strong Buy"가 outperform을 보장하지 않음)
- **적합 사용자**: 멀티 에이전트 패턴을 학술적으로 깊이 이해하려는 사용자, 본인 분야에 응용하려는 연구자
- **추천 활용법**: 본인 패키지의 single-agent를 7-role debate로 업그레이드하는 reference로 사용

### [AI4Finance-Foundation/FinRobot](https://github.com/AI4Finance-Foundation/FinRobot)
> Financial Chain-of-Thought (CoT) 프롬프팅 기반 4계층 아키텍처(AI Agents Layer / LLM Algorithms Layer / LLMOps & DataOps / Foundation Models)로 가장 구조화된 오픈소스 플랫폼.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish 진입 | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: Apache 2.0
- **강점**:
  - AI4Finance 재단의 메인 프로젝트 → 대학·기업 contributor 다수
  - **FinRobot Pro** 모듈로 equity research 리포트 자동 생성까지 end-to-end
  - Smart Scheduler로 task별 최적 LLM 자동 라우팅
  - Document Analysis Agent가 10-K/10-Q 같은 SEC 파일 직접 처리
- **약점**:
  - 의존성 무거움 (autogen + 다수 패키지) → 환경 셋업 까다로움
  - 코드베이스 크고 추상화 깊어 처음 읽기 어려움
  - 일부 기능(특히 Pro)은 별도 셋업 필요
- **적합 사용자**: 종합 financial AI 플랫폼이 필요한 팀, equity research 자동화에 진심인 사용자

### [Open-Finance-Lab/AgenticTrading](https://github.com/Open-Finance-Lab/AgenticTrading)
> Neo4j 그래프 메모리 + MCP/A2A 프로토콜 + DAG 실행 엔진. Memory Agent가 task plan과 agent feedback을 저장해 장기 학습. Alpha/Data/Risk/Cost/Portfolio Construction/Backtest 6개 agent pool로 구성.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: MIT
- **강점**:
  - 가장 먼저 MCP/A2A 프로토콜을 진지하게 채택한 finance agent framework
  - Neo4j 메모리로 cross-session 학습 → 단순 stateless 호출보다 실용적
  - DAG 기반 동적 워크플로 → market regime별로 실행 순서 변경 가능
  - 각 agent pool이 독립 deploy 가능 (모듈성)
- **약점**:
  - Neo4j 운영 필요 → 인프라 부담
  - 문서화가 ByteByteGo 수준은 아님, 코드 읽으며 이해해야 함
  - 비교적 신생 프로젝트라 community 답변 적음
- **적합 사용자**: MCP/A2A 패러다임을 finance에 도입하려는 인프라 엔지니어, self-improving 시스템 연구자

### [LLMQuant](https://github.com/LLMQuant) (Organization)
> Alpha Agent (멀티 에이전트 알파 리서치), Magents (multi-agent generative trading system), data-mcp (AI-native finance용 MCP server), QuantMind (quantitative finance용 지식 추출), quant-wiki (퀀트 지식 오픈소싱)를 운영하는 컬렉티브.

- **활성도**: 🟢 활발 | **성숙도**: Research | **학습곡선**: ⭐⭐ | **한국 시장**: 🟡 (중국어 자료, 한국어 화자 일부 친화) | **라이선스**: 다양 (대부분 MIT)
- **강점**:
  - **AI-native quantitative finance 생태계** 구축 시도 → 단일 레포가 아닌 협업 가능한 모듈 모음
  - quant-wiki의 자료가 한·중·영 다국어 지원 시도 → 아시아 사용자 친화
  - data-mcp 서버는 즉시 Claude Desktop / Cursor와 연결 가능
- **약점**:
  - 개별 레포 별 활성도 편차 큼
  - 일부 모듈은 학술 데모 수준
- **적합 사용자**: 아시아 시장 친화적 자료를 찾는 사용자, MCP server 패턴 학습자

### [dragon1086/prism-insight](https://github.com/dragon1086/prism-insight) — 550 ⭐
> 13+ 전문 에이전트(기술/수급/재무/산업/뉴스/시장/거시/전략가/매수·매도)가 협업해 **한국·미국 주식**의 급등주 포착 → 애널리스트급 PDF 리포트 → **KIS API 기반 실제 자동매매**까지 end-to-end. 텔레그램 다국어 브로드캐스트와 라이브 대시보드([analysis.stocksimulation.kr](https://analysis.stocksimulation.kr/))로 성과 공개.

- **활성도**: 🟢 활발 (2026-04 업데이트) | **성숙도**: Production-ish | **학습곡선**: ⭐⭐ | **한국 시장**: ✅ 네이티브 (+ `prism-us/` 미국 mirror) | **라이선스**: AGPL-3.0 (+ 상용 dual)
- **강점**:
  - **한국+미국 양대 시장을 네이티브 지원** (KR `cores/` + US `prism-us/` 병렬 파이프라인)
  - 한국투자증권 KIS API 연동 **실제 자동매매** — POC가 아닌 live trading (매수·매도 에이전트, stop-loss, multi-account fan-out)
  - **ChatGPT Plus/Pro 구독을 Codex OAuth Proxy로 재활용 → LLM API 요금 $0** 모드 공식 지원
  - Docker + cron 기반 매일 돌아가는 파이프라인, 라이브 대시보드로 과거 성과 공개 검증 가능
- **약점**:
  - AGPL-3.0 → 상용 제품 내장 시 소스 공개 의무 (dual 상용 라이선스 별도 문의 필요)
  - KIS API 전제 → 한국투자증권 계좌 필수, 다른 브로커(키움 등)는 직접 작업
  - 75k+ LOC 규모 → 처음 읽는 사람에게 진입장벽
  - 백테스트 불가 구조 — LLM 에이전트 기반이라 결정론적 재현이 어려움 (공개 라이브 대시보드의 forward test 결과로만 검증 가능)
- **적합 사용자**: 한국(+미국) 주식을 실제 자동매매하려는 개인/소규모 팀, 멀티에이전트 파이프라인의 프로덕션 참조 아키텍처가 필요한 개발자
- **하지 말 것**: AGPL 고지 없이 SaaS 포크, 라이브 대시보드 성과 확인 없이 큰 금액 실계좌 투입

---

## 2. LLM 단일 에이전트 / 리서치 도구

### [virattt/dexter](https://github.com/virattt/dexter) — 21.3k ⭐
> deep financial research용 자율 에이전트 (TypeScript). ai-hedge-fund 저자의 후속작.

- **활성도**: 🟢 활발 | **성숙도**: Research | **학습곡선**: ⭐⭐ | **한국 시장**: ❌ | **라이선스**: 확인 필요
- **강점**:
  - TypeScript 기반 → web 통합 용이
  - Deep research 패턴 (multi-step reasoning + 여러 소스 통합)
  - 동일 저자의 ai-hedge-fund와 연계 가능
- **약점**:
  - 후발 프로젝트라 자료 적음
  - Production 검증 사례 부족
- **적합 사용자**: TS/Node 환경 개발자, 종목별 deep research 자동화

### [pipiku915/FinMem-LLM-StockTrading](https://github.com/pipiku915/FinMem-LLM-StockTrading)
> Profiling/Memory(layered)/Decision-making 3 모듈로 인지구조를 모사하는 트레이딩 에이전트. Adjustable cognitive span으로 인간 트레이더의 인지 한계를 넘는 정보 보존. ICLR Workshop 2024 수록.

- **활성도**: 🟡 유지보수 | **성숙도**: Research | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: 확인 필요
- **강점**:
  - 메모리 모듈이 가장 정교한 LLM 트레이딩 에이전트 중 하나
  - 학술 검증 (논문·워크샵)
  - LLM의 character/profile을 명시적으로 디자인 → 행동 일관성
- **약점**:
  - 메모리 시스템 셋업이 까다로움 (vector DB + embedding 모델 필요)
  - 단일 종목 중심, 포트폴리오 운용은 약함
- **적합 사용자**: agent memory architecture에 진심인 연구자

### [OnePunchMonk/AgentQuant](https://github.com/OnePunchMonk/AgentQuant)
> VIX와 모멘텀으로 시장 regime(Bull/Bear/Crisis)을 감지한 뒤 LLM(Gemini 2.5 Flash)이 regime-optimal 전략 파라미터를 제안하고, walk-forward analysis와 ablation study로 검증.

- **활성도**: 🟢 활발 | **성숙도**: Research | **학습곡선**: ⭐⭐ | **한국 시장**: ❌ | **라이선스**: 확인 필요
- **강점**:
  - **walk-forward + ablation study가 내장된 드문 레포** → look-ahead bias 회피 패턴 학습
  - regime detection이 명시적 → market context-aware
  - 코드가 간결, 입문 학습용으로 좋음
- **약점**:
  - Gemini 2.5 Flash 의존 (다른 모델 swap은 직접 해야 함)
  - 전략 폭이 제한적 (모멘텀/평균회귀 위주)
- **적합 사용자**: 백테스트 방법론을 코드로 배우려는 사용자, regime-aware 전략 설계자

### [MingyuJ666/Stockagent](https://github.com/MingyuJ666/Stockagent)
> 실제 주식시장 환경을 시뮬레이션하여 거시경제, 정책 변화, 기업 펀더멘털, 글로벌 이벤트의 영향을 평가하는 LLM 다중 에이전트 시스템. 4단계(Initial/Trading/Post-Trading/Special Events) 워크플로.

- **활성도**: 🟡 유지보수 | **성숙도**: Research (preprint) | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: 확인 필요
- **강점**:
  - test-set leakage 회피 설계 (LLM의 사전 지식 차단)
  - 외부 충격 시뮬레이션 가능 → 정책/규제 시나리오 분석
- **약점**:
  - 실시간 시장 운용보다는 학술 시뮬레이션 도구
  - 에이전트 행동의 realism은 제한적
- **적합 사용자**: 시장 미시구조 연구자, AI 행동경제 실험자

---

## 3. 강화학습 트레이딩 (RL)

### [AI4Finance-Foundation/FinRL](https://github.com/AI4Finance-Foundation/FinRL)
> Quantitative Finance에서 자동화된 주식 트레이딩을 위한 Deep Reinforcement Learning 라이브러리. 본 분야의 사실상 표준.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐⭐⭐ | **한국 시장**: 🟡 (확장 가능) | **라이선스**: MIT
- **강점**:
  - 분야 표준, 논문·튜토리얼 풍부
  - SAC/PPO/A2C/DDPG/TD3/DQN 등 거의 모든 주요 알고리즘 지원
  - 다중 시장(주식/선물/암호) 환경 제공
  - DRL 백테스트 + 실거래 (Alpaca) 연결까지 end-to-end
- **약점**:
  - DRL 자체의 한계 (높은 분산, 하이퍼파라미터 민감, sample efficiency 낮음)
  - 다른 사용자들의 backtest 결과가 종종 cherry-picked
  - 실거래 환경에서 distribution shift에 약함
- **적합 사용자**: DRL 연구자, RL을 finance에 적용하려는 학생

### [tensortrade-org/TensorTrade](https://github.com/tensortrade-org/tensortrade)
> 강화학습 기반 트레이딩 위한 모듈러 프레임워크.

- **활성도**: 🟡 유지보수 | **성숙도**: Research | **학습곡선**: ⭐⭐⭐ | **한국 시장**: 🟡 | **라이선스**: Apache 2.0
- **강점**: 모듈성 좋음, gym 환경과 호환
- **약점**: FinRL 대비 활성도 떨어짐, 최신 RL 알고리즘 통합 느림
- **적합 사용자**: gym-style API 선호 사용자

---

## 4. 금융 도메인 LLM

### [AI4Finance-Foundation/FinGPT](https://github.com/AI4Finance-Foundation/FinGPT)
> 금융 분야 LLM과 NLP에 관심있는 모두를 위한 playground. open-source financial LLM의 대표.

- **활성도**: 🟢 활발 | **성숙도**: Research | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ | **라이선스**: MIT
- **강점**:
  - LoRA fine-tuning 코드/데이터셋 공개
  - sentiment analysis, news classification 등 task별 모델 제공
  - Bloomberg GPT의 오픈소스 대안
- **약점**:
  - 모델 품질이 frontier LLM(GPT-5/Claude 4) 대비 떨어짐 → 실전에서는 GPT/Claude를 그대로 쓰는 게 나은 경우가 많음
  - fine-tuning 인프라 (GPU) 필요
- **적합 사용자**: domain-specific LLM 학습 경험을 쌓고 싶은 ML 엔지니어

### [chancefocus/PIXIU](https://github.com/chancefocus/PIXIU)
> 금융 LLM, 136K instruction sample 데이터셋, 종합 평가 벤치마크를 제공하는 오픈소스 자원.

- **활성도**: 🟡 유지보수 | **성숙도**: Research (벤치마크) | **학습곡선**: ⭐⭐ | **한국 시장**: ❌ | **라이선스**: 확인 필요
- **강점**: 평가 벤치마크가 강함 → LLM 비교에 유용
- **약점**: 모델 자체는 outdated (frontier 대비)
- **적합 사용자**: financial LLM 평가/비교 연구자

---

## 5. 백테스트 엔진

### [polakowo/vectorbt](https://github.com/polakowo/vectorbt)
> 벡터화 백테스트 엔진. 다종목·다전략을 NumPy로 빠르게 처리.

- **활성도**: 🟢 활발 | **성숙도**: Production-ish | **학습곡선**: ⭐⭐⭐ | **한국 시장**: 🟡 | **라이선스**: 무료 (Pro는 유료)
- **강점**:
  - **속도가 압도적** (수만 종목 × 수백 전략 백테스트가 몇 분)
  - 풍부한 지표/플롯 라이브러리
  - vectorbt Pro에서 더 발전된 기능
- **약점**:
  - API 학습곡선 가파름 (NumPy/Pandas/Numba 깊은 이해 필요)
  - event-driven 백테스트 패턴과는 다름 → 일부 전략 표현 어려움
- **적합 사용자**: 대규모 백테스트가 필요한 퀀트 리서처

### [mementum/backtrader](https://github.com/mementum/backtrader)
> 클래식한 event-driven 백테스트 프레임워크.

- **활성도**: 🔴 정체 (저자 활동 줄어듦) | **성숙도**: Production-ish | **학습곡선**: ⭐⭐ | **한국 시장**: 🟡 | **라이선스**: GPLv3
- **강점**: 직관적 API, 풍부한 자료, broker 연결 쉬움
- **약점**: 메인테이너 부재, 속도 느림 (vectorbt의 1/100 수준)
- **적합 사용자**: 코드 가독성을 우선시하는 사용자, 단일 전략 깊이 분석

### [stefan-jansen/zipline-reloaded](https://github.com/stefan-jansen/zipline-reloaded)
> Quantopian zipline의 maintained 포크.

- **활성도**: 🟢 활발 | **성숙도**: Production-ish | **학습곡선**: ⭐⭐⭐ | **한국 시장**: ❌ (US 위주) | **라이선스**: Apache 2.0
- **강점**: 미국 주식 데이터 통합 잘 됨, Quantopian 코드 호환
- **약점**: 미국 시장 위주, 셋업 까다로움
- **적합 사용자**: 미국 주식 backtesting, Quantopian 시절 코드 보유 사용자

---

## 6. 데이터 & 인프라 (MCP, APIs)

### [LLMQuant/data-mcp](https://github.com/LLMQuant/data-mcp)
> AI-native finance를 위한 knowledge harness — LLMQuant Data용 MCP server.

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **학습곡선**: ⭐ | **한국 시장**: 🟡 | **라이선스**: MIT
- **강점**: Claude Desktop / Cursor에 즉시 연결, MCP 표준 따름
- **약점**: LLMQuant 데이터 의존
- **적합 사용자**: MCP 워크플로 사용자

### [폴리마켓/예측시장 MCP servers]
> Polymarket용 AI-Powered MCP Server (45 tools, 실시간 모니터링, 안전 기능), Parsec API (Polymarket/Kalshi/Opinion/Limitless/PredictFun 통합 prediction market 인프라, AI agent trading용 MCP server)

- **활성도**: 🟢 활발 | **성숙도**: Research → Production-ish | **라이선스**: 다양
- **강점**: prediction market 데이터를 자연어로 즉시 호출
- **약점**: prediction market 자체의 유동성 제한, 규제 리스크
- **적합 사용자**: 정치/규제/스포츠 이벤트 베팅 가격을 시장 시그널로 활용하려는 사용자

### [ranaroussi/yfinance](https://github.com/ranaroussi/yfinance)
> Yahoo Finance 비공식 Python wrapper. 무료 시세/펀더멘털.

- **활성도**: 🟢 활발 | **성숙도**: Production-ish | **학습곡선**: ⭐ | **한국 시장**: 🟡 (지원하지만 데이터 품질 낮음) | **라이선스**: Apache 2.0
- **강점**: 무료, 설치 간단, 거의 모든 글로벌 시장 커버
- **약점**: **비공식 → rate limit 빈번**, 가끔 API 변경으로 깨짐, 실시간 아님 (15분 지연)
- **적합 사용자**: 프로토타이핑, 학습 (실전 운용은 유료 데이터로)

### [Polygon.io](https://polygon.io/), [Alpha Vantage](https://www.alphavantage.co/), [Finnhub](https://finnhub.io/)
> 유료 시장 데이터 API. SDK 모두 GitHub에 공개.

- **강점**: 안정성, 실시간, 옵션·tick 데이터, 뉴스/공시 통합
- **약점**: 비용 ($29~$200+/월)
- **적합 사용자**: 실전 자동매매, 분 단위 이하 분석

### [koreainvestment/open-trading-api](https://github.com/koreainvestment/open-trading-api) — 한국투자증권 공식
> 한국투자증권 공식 OpenAPI Python wrapper. mcp/websocket/realtime/openapi/trading-api/stocks/investment/stock-trading/claude/autotrade/koreainvestment 등 태그.

- **활성도**: 🟢 활발 | **성숙도**: Production | **학습곡선**: ⭐⭐ | **한국 시장**: ✅ (네이티브) | **라이선스**: 확인 필요
- **강점**: **국내 주식 실거래 가능한 거의 유일한 공식 LLM-친화 API**, MCP 지원
- **약점**: 한국투자증권 계좌 필수, 미국 주식은 별도 권한
- **적합 사용자**: 한국 주식 자동매매하는 모든 사용자

---

## 7. 메모리 & 컨텍스트 시스템

### [zilliztech/GPTCache](https://github.com/zilliztech/GPTCache) (간접 활용)
> LLM 호출 캐싱. 같은 종목 분석 반복시 비용 절감.

- **활성도**: 🟢 | **라이선스**: MIT
- **강점**: 비용 절감 직접 효과, 의미 기반 캐시 (semantic)
- **약점**: 시장 데이터처럼 자주 바뀌는 입력엔 부적합 (TTL 잘 관리해야)
- **적합 사용자**: 동일 분석을 여러 번 돌리는 워크플로

### [Mem0 (mem0ai/mem0)](https://github.com/mem0ai/mem0)
> LLM agent용 universal memory layer. 사용자별/세션별 사실을 영속 저장.

- **활성도**: 🟢 활발 | **라이선스**: Apache 2.0
- **강점**: trading 에이전트가 "지난번 NVDA 분석에서 무슨 결론을 냈는지" 자동 회상
- **약점**: trading 특화 아님, 자체 적용 필요
- **적합 사용자**: 장기 운영하는 트레이딩 에이전트 구축자

---

## 8. Production / Risk Engineering

### NoFx (검색 인기 상위)
> 자동 안전 모드를 갖춘 AI 트레이딩 어시스턴트. 3회 연속 잘못된 콜 후 자동 자본 보호. 모든 prediction에 rolling accuracy score 추적, 임계 미달시 safety mode 발동.

- **활성도**: 🟢 (정확한 repo는 검색 필요) | **성숙도**: Research → Production-ish
- **강점**: **risk engineering이 코어 디자인** — 단순 LLM 신호가 아닌 자기 신뢰도 추적
- **약점**: LLM 정확도 측정의 ground truth 정의가 까다로움
- **적합 사용자**: 자동매매 운영하면서 drawdown control이 절실한 사용자

### [Open-Finance-Lab/AgenticTrading의 Risk Agent Pool]
> 같은 프레임워크 내 risk attribution 모듈. (위 1번 참조)

- **강점**: 알파/리스크/비용을 분리 attribution
- **적합 사용자**: 포트폴리오 레벨 risk decomposition 필요한 사용자

---

## 9. 벤치마크 & 페이퍼 컬렉션

### [Tom-roujiang/Awesome-LLM-Quantitative-Trading-Papers](https://github.com/Tom-roujiang/Awesome-LLM-Quantitative-Trading-Papers)
> QuantAgent (HFT용), AlphaQuanter (HKUST의 RL 기반 종단 에이전트), R&D-Agent-Quant (CMU/MSRA NeurIPS 2025), Janus-Q (HKUST 26-02), Fin-PRM (Qwen Dianjin), DeepFund (HKUST NeurIPS 2025), AlphaForgeBench (NTU/HKUST 26-02) 등 큐레이션.

- **활성도**: 🟢 매월 갱신 | **라이선스**: MIT (메타데이터)
- **강점**: 학계 최신 동향 추적의 시작점
- **약점**: 코드는 각 페이퍼별로 별도 확인 필요
- **적합 사용자**: 연구자, 트렌드 follower

### [DeepFund](https://github.com/) (HKUST, NeurIPS 2025)
> live arena 관점에서 LLM이 펀드 투자에서 전문가 수준이 될 수 있는지 평가.

- **강점**: live arena 형식 → LLM의 실시간 의사결정 능력 평가
- **적합 사용자**: LLM의 trading 능력을 객관 비교하려는 평가자

### [PHANTOM (Goldman Sachs, NeurIPS 2025)](https://github.com/)
> 금융 long-context QA에서 hallucination 검출 벤치마크.

- **강점**: GS가 직접 만든 벤치마크 → 산업 신뢰도
- **적합 사용자**: financial LLM의 신뢰성 평가, hallucination mitigation 연구

### [FinMCP-Bench (Qwen Dianjin team)](https://github.com/)
> MCP 프로토콜 하 실세계 금융 도구 사용 LLM 에이전트 벤치마크.

- **강점**: MCP 시대의 첫 금융 벤치마크
- **적합 사용자**: MCP-기반 finance agent 빌더

---

## 10. 한국 / 아시아 시장 자원

### [koreainvestment/open-trading-api](https://github.com/koreainvestment/open-trading-api)
> 위 6번에서 설명. **한국 주식 자동매매의 사실상 표준.**

### [pyKRX](https://github.com/sharebook-kr/pykrx)
> KRX (한국거래소) 데이터를 Python으로 수집.

- **활성도**: 🟢 활발 | **성숙도**: Production-ish | **학습곡선**: ⭐ | **한국 시장**: ✅ (네이티브) | **라이선스**: MIT
- **강점**: KOSPI/KOSDAQ 종목 마스터, OHLCV, 거래대금, 공매도, 외국인/기관 보유 데이터까지 무료
- **약점**: 가격 데이터만, 펀더멘털 약함
- **적합 사용자**: 한국 시장 분석하는 모든 사용자

### [FinanceDataReader](https://github.com/financedata-org/FinanceDataReader)
> 한국+해외 시장 통합 데이터.

- **활성도**: 🟢 | **라이선스**: MIT
- **강점**: KOSPI/KOSDAQ + NASDAQ/NYSE 통합 인터페이스
- **약점**: 비공식 스크래핑 위주 → 안정성 변동
- **적합 사용자**: 한·미 통합 백테스트

### [LLMQuant/quant-wiki](https://github.com/LLMQuant/quant-wiki)
> 퀀트 지식의 오픈소싱과 한화. 국내외 퀀트 금융 산업의 정보 격차를 메우는 것이 목표.

- **강점**: 한·중·영 다국어 자료
- **적합 사용자**: 한국어 퀀트 자료가 부족하다고 느낀 사용자

### 한국어 메타 자원
- 김프 차익 / 김치 프리미엄 도구들 (다수, 별도 큐레이션 필요)
- DART (전자공시) API 활용 — `OpenDartReader` 등
- **한국 주식 AI 멀티에이전트 자동매매**: [§1의 prism-insight](#dragon1086prism-insight--550-) 참조 — 한국+미국 동시 지원, KIS API 연동 live trading

---

## 11. 메타 어썸 리스트

### [georgezouq/awesome-ai-in-finance](https://github.com/georgezouq/awesome-ai-in-finance)
> 금융시장의 LLM, 딥러닝 전략, 도구를 큐레이션. TradingAgents, FinRobot, ATLAS (self-improving 25 agents), InvicTrade, OpenFinClaw, ProfitPlay Agent Arena 등 다수 포함.

- **활성도**: 🟢 매주 갱신 | **라이선스**: MIT (메타)
- **강점**: 가장 포괄적인 finance + AI 어썸 리스트, 자주 갱신
- **약점**: **객관적 평가 부재** (단순 나열) ← 이 문서가 보완하려는 부분
- **적합 사용자**: 새 레포 발굴 시작점

### [caramaschiHG/awesome-ai-agents-2026](https://github.com/caramaschiHG/awesome-ai-agents-2026)
> 300+ AI 에이전트, 프레임워크, 도구. 20+ 카테고리. 매월 갱신. XVARY Stock Research (Claude Code skill for SEC EDGAR + 시장 데이터)도 포함.

- **강점**: AI 에이전트 전반 (finance 외) 컨텍스트 함께 파악 가능
- **적합 사용자**: 트레이딩 외 AI agent 트렌드까지 보려는 사용자

### XVARY Stock Research (Claude Code skill)
> SEC EDGAR + 시장 데이터용 Claude Code skill: /analyze, /score, /compare.

- **강점**: Claude Code 사용자에게 즉시 사용 가능, MIT 라이선스
- **적합 사용자**: Claude Code 워크플로 사용자

---

## 12. 공통 함정 (Common Pitfalls)

오픈소스 AI 트레이딩 프로젝트를 평가/사용할 때 반드시 의심해야 할 함정들.

### 🚨 12.1 백테스트 신뢰성
- **Look-ahead bias**: LLM 시스템 프롬프트에 "as of {date}"를 명시하지 않으면 모델이 미래 정보를 활용 → 백테스트 수익률이 비현실적으로 높음. *체크리스트*: signal_generator가 현재 시점 데이터만 보는가?
- **Survivorship bias**: 현재 S&P500 멤버만으로 과거 백테스트 → 상장폐지 종목 누락. 진짜 백테스트는 historical constituents 필요
- **Data snooping**: 같은 데이터로 100가지 전략 시도 → 통계적으로 우연 알파 발견. *체크리스트*: out-of-sample 테스트 비율 충분한가?

### 🚨 12.2 LLM 특유 함정
- **Hallucinated metrics**: LLM이 종목의 실제 PER/매출과 다른 숫자를 만들어냄. *대응*: 모든 정량 데이터는 도구 호출 결과로만 결정, LLM이 직접 만든 숫자는 검증
- **Recency bias**: 학습 cutoff 이후 발생한 사건/티커를 모름. *대응*: 무조건 최신 도구 호출
- **Authority bias**: "Buffett 에이전트가 BUY 했다" → 실제 Buffett의 의사결정과 무관, 단지 prompt가 그렇게 생긴 것

### 🚨 12.3 운영 함정
- **Slippage/commission 미반영**: 백테스트는 화려한데 실거래로 가면 수익률 절반 → 0
- **Liquidity 무시**: 일평균 거래대금 1억 안 되는 종목에 100억 주문 = 못 채움
- **Borrow availability 무시**: SHORT 시그널이 좋아도 borrow 안 되면 실행 불가
- **세금/수수료**: 한국은 단타 수익에 양도세 부담, 미국 주식은 환차손익까지

### 🚨 12.4 거버넌스 함정
- **법적 자격**: 미국 SEC, 한국 금감원 모두 AI 기반 투자자문에 등록 의무. 본인 자산만 운용은 OK, 타인 자금 운용은 라이선스 필요
- **개인정보**: 사용자별 포트폴리오 보관시 GDPR/개인정보보호법 적용
- **광고 규제**: "AI가 100% 수익 보장" 같은 광고는 자본시장법 위반

### 🚨 12.5 LLM 비용 함정
- 멀티 에이전트 토론 라운드 늘릴수록 토큰 비용 기하급수적
- Opus 모델로 매일 100종목 분석 = 월 수십~수백만원 가능
- *대응*: deep model은 final 결정에만, screening은 haiku/mini로

---

## 🎯 추천 시작 경로 (사용자 유형별)

### A. **AI 멀티 에이전트 학습이 목적**
1. `virattt/ai-hedge-fund` 클론해서 `--ollama`로 무료 실행 → 결과 직관 파악
2. `TauricResearch/TradingAgents` 코드 정독 → LangGraph 구조 학습
3. 본인 시나리오에 맞게 system prompt 변형

### B. **본인 자금 자동매매가 목적 (한국)**
1. `pyKRX` + `koreainvestment/open-trading-api`로 데이터·실거래 연결
2. 작은 규모 (100만원 이하)로 페이퍼 트레이딩 6개월
3. 그 후에도 단일 LLM 신호에 모든 자본 베팅하지 말 것

### C. **본인 자금 자동매매가 목적 (미국)**
1. Polygon.io/Alpha Vantage 유료 키 + Alpaca 페이퍼 트레이딩
2. `vectorbt`로 백테스트 → walk-forward 검증
3. `AgentQuant`의 walk-forward 패턴 코드 참고

### D. **연구·논문이 목적**
1. `Tom-roujiang/Awesome-LLM-Quantitative-Trading-Papers`로 SOTA 추적
2. `DeepFund`, `FinMCP-Bench`로 본인 모델 평가
3. `FinRobot` / `AgenticTrading` 중 하나를 base로 fork

### E. **MCP/Claude Desktop 통합이 목적**
1. `LLMQuant/data-mcp` + Polymarket MCP 서버 등록
2. 본인 도구를 FastMCP로 노출 (참고: `harness_quant/mcp_server`)

---

## 📝 기여 / 업데이트

이 문서는 **2026년 4월 시점 스냅샷**입니다. AI 트레이딩 분야는 월 단위로 변하므로, 실제 사용 전 각 레포의 마지막 커밋 일자, 이슈 활성도를 확인하세요.

별 표시 ⭐ 수치는 시점에 따라 변동합니다. **별 수가 곧 품질은 아닙니다** — README가 좋아서 별이 모인 경우도 많습니다.

---

## 🔗 관련 자원 (직접 큐레이션)

- **Anthropic 공식 cookbook**: https://github.com/anthropics/anthropic-cookbook (Claude API 패턴)
- **MCP 공식 문서**: https://modelcontextprotocol.io/
- **LangGraph 튜토리얼**: https://langchain-ai.github.io/langgraph/
- **본 문서 작성에 사용된 reference 패키지**: harness_quant (자체 작성, 본 문서와 함께 배포)

---

**Disclaimer**: 본 문서의 모든 평가는 작성 시점의 공개 정보 기반 주관적 평가이며, 특정 레포의 사용을 권유하거나 금지하지 않습니다. 투자 결과에 대한 책임은 사용자에게 있습니다. 라이선스/저작권/규제 검토는 사용 전 별도로 수행하세요.
