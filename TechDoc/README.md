# TechDoc

> Dennis Kim (@gameworkerkim)이 최근 유행하는 기술을 평가하고 큐레이션한 기술 문서 모음 — 서버리스, 클라우드 비용 절감, AI/LLM, 퀀트 금융, Claude Skills, MCP, AI 에이전트 프레임워크, 오픈웨이트 모델, 웹 분석, SEO, UI 프레임워크, 개발자 인프라를 다룹니다.
>
> English version: [README_EN.md](README_EN.md)

---

## 목차

1. [LLM Wiki](#llm-wiki)
2. [AI 오픈웨이트 모델 비교 분석](#ai-오픈웨이트-모델-비교-분석) **NEW**
3. [퀀트 금융 & 트레이딩 플랫폼](#퀀트-금융--트레이딩-플랫폼)
4. [Claude Skills & 프롬프트 최적화](#claude-skills--프롬프트-최적화)
5. [MCP & AI 에이전트](#mcp--ai-에이전트)
6. [AI 에이전트 & 오케스트레이션](#ai-에이전트--오케스트레이션) **NEW**
7. [서버리스 & SaaS 무료 티어](#서버리스--saas-무료-티어)
8. [UI/오픈소스 프레임워크](#ui오픈소스-프레임워크)
9. [Python SaaS & 배포](#python-saas--배포)
10. [클라우드 비용 절감](#클라우드-비용-절감)
11. [AI / LLM](#ai--llm)
12. [LLM 모델 & 로컬 배포](#llm-모델--로컬-배포)
13. [시계열 예측 모델 (TSFM)](#시계열-예측-모델-tsfm)
14. [AI 코딩 어시스턴트](#ai-코딩-어시스턴트)
15. [리버스 엔지니어링 & LLM](#리버스-엔지니어링--llm) **NEW**
16. [AI 에이전트 & 웹 표준](#ai-에이전트--웹-표준)
17. [클라우드플레어 웹 분석 & SEO 최적화](#클라우드플레어-웹-분석--seo-최적화) **NEW**
18. [중국/AI 산업 분석](#중국ai-산업-분석)
19. [OpenCode 한국어화](#opencode-한국어화)
20. [개발자 도구 & 기타](#개발자-도구--기타)

---

## LLM Wiki

LLM Wiki는 AI가 GitHub 코드베이스를 분석해 구조·아키텍처·API를 위키 형태의 문서로 자동 생성하고, 자연어 Q&A로 코드를 탐색하게 해주는 새로운 도구 카테고리입니다. 아래 3종을 비교/정리했습니다.

| 문서 | 제공 주체 | 형태 | 한 줄 설명 |
|------|----------|------|-----------|
| [DeepWiki 시작하기](DeepWiki/DeepWiki_Getting_Started.md) | Cognition Labs (Devin) | 호스팅 SaaS | `github.com` → `deepwiki.com` URL 치환만으로 위키 생성. 진입장벽 제로. 설치형 deepwiki-open 포함 |
| [Google Code Wiki 시작하기](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) | Google | 호스팅 SaaS | Gemini 기반. 코드 변경 시 문서·다이어그램 자동 재생성, 모든 설명이 소스 파일에 하이퍼링크 |
| [OpenWiki 기술 문서](openwiki/README.md) | LangChain (오픈소스) | 로컬 CLI | AI 코딩 에이전트용 위키. AGENTS.md/CLAUDE.md 자동 관리, CI 자동 갱신, 프라이빗 저장소 지원 |

> **요약** — 공개 저장소를 빠르게 훑으려면 DeepWiki·Google Code Wiki(무설치·무료), 사내 프라이빗 코드나 로컬 LLM·에이전트 연동이 필요하면 OpenWiki(로컬 실행)를 선택하세요.

---

## AI 오픈웨이트 모델 비교 분석

**Solar Open2 · DeepSeek V4 · KIMI K3 3종 정면 비교** — 2026년 상반기 가장 주목받은 오픈웨이트 LLM을 벤치마크, 하드웨어 요구사항, 가성비, 사용 시나리오별로 분석한 실전 가이드입니다. 한국어 성능, 셀프호스팅 비용, 코딩 에이전트 연동까지 상세히 다룹니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Awesome Open Weight Model — 3종 비교](AI-Open-Weights-Model/readme.md) · [EN](AI-Open-Weights-Model/readme_EN.md) · [JA](AI-Open-Weights-Model/readme_JA.md) | Solar Open2(한국어 1위, 250B로 1.6T급)·DeepSeek V4-Flash(가성비 셀프호스팅 최강)·KIMI K3(프론트엔드 코딩 Arena 1위, 2.8T) 3종 벤치마크·사용 시나리오·라이선스·하드웨어 비교. **NEW** | 2026-07-22 |
| [DeepSeek V4 Getting Start](AI-Open-Weights-Model/DeepSeek-GettingStart.md) · [EN](AI-Open-Weights-Model/DeepSeek-GettingStart_EN.md) · [JA](AI-Open-Weights-Model/DeepSeek-GettingStart_JA.md) | DeepSeek V4 Pro·V4-Flash 실전 시작 가이드 — API·셀프호스팅·vLLM·SGLang 설정, 코딩 도구(Claude Code·Cline·OpenCode) 연동. | 2026-07-22 |
| [KIMI K3 Getting Start](AI-Open-Weights-Model/KIMI-K3-GettingStart.md) · [EN](AI-Open-Weights-Model/KIMI-K3-GettingStart_EN.md) · [JA](AI-Open-Weights-Model/KIMI-K3-GettingStart_JA.md) | Moonshot AI KIMI K3(2.8T MoE/활성 21B) 시작 가이드 — 프론트엔드 코딩 Arena 1위, 256K 컨텍스트, Mooncake 서빙, 사용 사례. | 2026-07-22 |
| [Solar Open2 Getting Start](AI-Open-Weights-Model/Solar-Open2-Getting-Start.md) · [EN](AI-Open-Weights-Model/Solar-Open2-Getting-Start_EN.md) · [JA](AI-Open-Weights-Model/Solar-Open2-Getting-Start_JA.md) | 업스테이지 Solar Open2 한국어 특화 모델 가이드 — 250B로 1.6T급 성능, 한국어-영어 크로스링구얼, API·로컬 실행. | 2026-07-22 |

> *"오픈웨이트 모델의 시대. Solar Open2는 한국어 이해가 필요한 모든 서비스의 현실적 답, DeepSeek V4-Flash는 가성비 끝판왕, KIMI K3는 코딩 에이전트의 새 기준."*

---

## 퀀트 금융 & 트레이딩 플랫폼

**최다 조회 · 실사용 의도 1위** — GitHub 트래픽에서 가장 높은 방문자 수를 기록한 섹션입니다. AI 퀀트 투자자를 위한 실전 플랫폼 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Toss Open API IP 화이트리스트 — 인디 주의점 (KR)](Toss/Toss-OpenAPI-IP-Whitelist-Indie-Caution_KR.md) · [EN](Toss/Toss-OpenAPI-IP-Whitelist-Indie-Caution_EN.md) | 지정 IP만 허용하는 Toss OAuth가 GHA·로컬에서 실패한 실전 기록. CASSANDRA Naver 롤백·체크리스트. | 2026-07-26 |
| [Qlib 시작 가이드 (KR)](Quant_Qlib/Qlib-getting-started-KR.md) | Microsoft Qlib 완전 가이드 — 설치·데이터 준비·워크플로우·벤치마크·KRX 데이터 연동·토스 Open API 미들웨어 연결. | 2026-07-18 |
| [toss-qlib-middleware](Quant_Qlib/toss-qlib-middleware/README.md) · [EN](Quant_Qlib/toss-qlib-middleware/README_EN.md) | 토스증권 Open API ↔ Microsoft Qlib 연동 미들웨어. OAuth2 + market data → CSV 파이프라인 + Redis 캐싱. Node.js/TypeScript. | 2026-07-18 |
| [GS Quant Getting Started](GS_Quant/GS%20Quant%20Getting%20Started.md) | Goldman Sachs 기관급 퀀트 금융 툴킷 — 장단점·8종 플랫폼 비교·주의사항·설치·사용 케이스. 코어 프라이싱/리스크는 GS 서버에서 처리, Python SDK는 클라이언트. | 2026-07-17 |
| [키움증권 REST API SDK & LLM 트레이딩 스킬](Kiwoom_OpenAPI/readme.md) **NEW** | 키움증권 OpenAPI+(855페이지, 500+ 엔드포인트)의 Python·Java·TypeScript 멀티 언어 SDK 개발 로드맵과 Claude Skill 기반 자연어 트레이딩 아키텍처(Intent 분류기·Safety Guard·WebSocket 실시간 체결). | 2026-07-24 |
| [Robinhood MCP 시작 가이드](Robinhood/Robinhood-MCP-Getting-Started.md) · [EN](Robinhood/Robinhood-MCP-Getting-Started_EN.md) · [CN](Robinhood/Robinhood-MCP-Getting-Started_CN.md) · [JA](Robinhood/Robinhood-MCP-Getting-Started_JA.md) **NEW** | Robinhood 공식 Agentic Trading MCP(2026.05.27 출시) + 6개 커뮤니티 MCP 서버 종합 가이드. OAuth·전용 계좌 격리·인증 방식별 리스크 분석·선택 가이드. 4개국어. | 2026-07-24 |

> *"Qlib는 Microsoft가 공개한 AI 퀀트 플랫폼의 표준, GS Quant는 월가의 실전 무기, 키움 OpenAPI는 한국 개인 투자자의 현실적인 진입로. 셋을 함께 보면 퀀트 투자의 전체 지도가 그려진다."*

---

## Claude Skills & 프롬프트 최적화

**Claude Skill 수요 폭발** — Claude Agent Skills로 퀀트 투자 워크플로우를 자동화하는 방법과, 프롬프트 최적화 도구 5종 비교.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Claude Skills — 퀀트 투자 워크플로우](claude_skill/readme.md) | `quant-market-brief` + `portfolio-daily-review` 2종 스킬. Claude.ai·Claude Code·API 설치 가이드 포함. "LLM은 엑셀이지, 신탁이 아니다." | 2026-07-05 |
| [Claude Skill 제작 가이드](claude_skill/Claude_skill_guide.md) | Skill 해부학·설계 원칙·2종 실전 예제(데일리 시황 + 포트폴리오 리뷰)·스킬 연결·흔한 실수. | 2026-07-05 |
| [quant-market-brief.skill](claude_skill/quant-market-brief.skill) | 퀀트 관점 데일리 시황 요약 스킬 패키지. ([사용 가이드](claude_skill/quant-market-brief_guide.md) · [샘플: 2026-07-05](claude_skill/quant-market-brief-2026-07-05.md)) | 2026-07-05 |
| [portfolio-daily-review.skill](claude_skill/portfolio-daily-review.skill) | 포트폴리오 일일 모니터링 & 평가 스킬 패키지. ([사용 가이드](claude_skill/portfolio-daily-review_guide.md)) | 2026-07-05 |
| [Claude 프롬프트 최적화 도구 5종 비교](claude/Claude-prompt-optimizer-tools-guide.md) | CheswickDEV·johnpsasser·severity1·Hashaam101·nidhinjs 5종 오픈소스 프롬프트 옵티마이저 비교. Hook·Skill·Meta-optimizer 메커니즘·선택 가이드. | 2026-07-14 |

> *"스킬은 프롬프트를 써본 사람과 만들어본 사람의 간극을 보여준다. 이 디렉토리는 그 간극을 메우는 실전 교본."*

---

## MCP & AI 에이전트

Model Context Protocol(MCP)은 LLM이 외부 도구·데이터소스와 안전하게 통신하는 표준 프로토콜입니다. AMQS 퀀트 전략을 MCP 서버로 구현한 실전 예제를 다룹니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [MCP 서버 개발 Getting Started](MCP/Mcp%20server%20getting%20started.md) | MCP 개념·아키텍처·API 대비 차별점 + AMQS 퀀트 시그널 서버 구현(Part 1+2). FastMCP·검증 파이프라인·Claude Desktop 연동·보안·원격 배포까지. | 2026-07-28 |
| [AMQS-AI-Infra MCP Server](MCP/README.md) · [EN](MCP/README.en.md) | AMQS 전략을 MCP로 구현한 실전 서버. 4 Tools·1 Resource·1 Prompt, FastMCP + Validation Pipeline + Claude Desktop Config. | 2026-07-28 |
| [MCP Security Migration Guide](MCP/MCP-2026-07-28-Security-Migration-Guide.md) | MCP 보안 마이그레이션 가이드. | 2026-07-28 |

> *"MCP는 LLM에게 손과 발을 달아주는 프로토콜. API가 '데이터를 주세요'라면, MCP는 '이 도구를 써서 일을 처리하세요'다."*

---

## AI 에이전트 & 오케스트레이션

**오픈소스 AI 에이전트 및 오케스트레이션 프레임워크의 실전 평가** — Andrew Ng의 OpenWorker부터 Microsoft Agent Framework, Linux Foundation AAIF의 goose까지, 프로덕션 도입을 위한 보안·거버넌스·라이선스 심층 분석.

### 오픈소스 AI 에이전트 큐레이션

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Awesome Agent — 오픈소스 AI 에이전트 실측 큐레이션](Awesome-Agent/readme.md) · [EN](Awesome-Agent/readme_EN.md) · [JA](Awesome-Agent/readme_JA.md) **NEW** | OpenWorker(Andrew Ng)·goose(Linux Foundation AAIF)·OpenHands(All Hands AI) 3종 실측 비교. CTI 관점 보안 분석(이중 블랙박스·공급망 리스크·승인 피로·도구 난립) + 15개 도입 체크리스트. 3개국어. | 2026-07-22 |
| [OpenWorker 리뷰](Awesome-Agent/Openworker-Review.md) · [EN](Awesome-Agent/Openworker-Review_EN.md) · [JA](Awesome-Agent/Openworker-Review_JA.md) | Andrew Ng의 AI 에이전트 플랫폼 심층 분석 — 아키텍처·장단점·경쟁사 비교·보안 고려사항. | 2026-07-22 |
| [goose 리뷰](Awesome-Agent/Goose-Review.md) · [EN](Awesome-Agent/Goose-Review_EN.md) · [JA](Awesome-Agent/Goose-Review_JA.md) | Linux Foundation AAIF 산하 goose 에이전트 프레임워크 분석 — MCP 기반 확장성·거버넌스 모델·보안 경계. | 2026-07-22 |
| [OpenHands 리뷰](Awesome-Agent/OpenHands-Review.md) · [EN](Awesome-Agent/OpenHands-Review_EN.md) · [JA](Awesome-Agent/OpenHands-Review_JA.md) | All Hands AI의 OpenHands(구 OpenDevin) 분석 — 코드 생성 에이전트의 실제 성능·한계·보안 경계. | 2026-07-22 |

### AI 에이전트 프레임워크

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [AI Agent Framework — Microsoft vs LangChain 비교](AI-Agent-Framework/AI-Agent-Framework.md) · [EN](AI-Agent-Framework/AI-Agent-Framework_EN.md) · [CN](AI-Agent-Framework/AI-Agent-Framework_CN.md) · [JA](AI-Agent-Framework/AI-Agent-Framework_JA.md) **NEW** | Microsoft Agent Framework for Go(MAF Go) vs LangChain/LangGraph 에이전트 오케스트레이션 프레임워크 비교. 선언적 에이전트·핸드오프·RAG·멀티에이전트 패턴·선택 기준·Getting Started 코드. Go 진영 대안(Eino·ADK Go·무프레임워크) 포함. 4개국어. | 2026-07-22 |

### LLM 프록시 & 라우팅

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [OpenCodex — LLM 프록시 분석](LLM_Proxy/Opencodex.md) · [EN](LLM_Proxy/Opencodex_EN.md) · [CN](LLM_Proxy/Opencodex_CN.md) · [JA](LLM_Proxy/Opencodex_JA.md) **NEW** | `@bitkyc08/opencodex` 경량 로컬 LLM 프록시 분석 — 40+ 제공자(Anthropic·Gemini·xAI·DeepSeek·Ollama 등) 라우팅, OAuth·ChatGPT 계정 풀·대시보드. 약관 리스크·동명 프로젝트 구분법 포함. 4개국어. | 2026-07-23 |

> *"AI 에이전트 도입의 진짜 관문은 기술이 아니라 보안과 거버넌스다. 이중 블랙박스를 열고, 공급망 리스크를 평가하고, 승인 게이트를 설계하는 데서 진짜 엔지니어링이 시작된다."*

---

## 서버리스 & SaaS 무료 티어

무료 티어를 제공하는 서버리스 플랫폼과 SaaS 서비스를 평가/비교한 문서입니다. 인프라 비용을 최소화하려는 개발자와 스타트업을 위한 실무 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Cloudflare 무료 티어 사용법 — VibeQuant 사례](CloudFlare/Cloudflare_무료티어_사용법.md) | Cloudflare란·장단점·Vercel 등 PaaS 비교·권장 스택·vibequant.cc 설계(무료만·GitHub SEO/GEO·칼럼 유실 문제·GS Quant/Pyodide)·설정·주의점. **추천 1순위** | 2026-07-24 |
| [Cloudflare 무료 티어 가이드](CloudFlare/Cloudflare%20free%20tier%20guide.md) | Cloudflare 무료 티어 종합 가이드: Workers, Pages, D1, R2, KV, 보안 서비스. | 2026-05-12 |
| [Oracle Cloud 무료 티어 가이드](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) | Oracle Cloud 평생 무료 티어 한국어 가이드: ARM VM, Compute, 데이터베이스, 네트워킹. | 2026-05-09 |
| [Neon 리뷰](Neon/Neon_review.md) | Neon.tech 평가 — 서버리스 PostgreSQL, 브랜칭, 무료 티어 제한, 가격, 성능 분석. | 2026-06-09 |
| [Turso 가이드](SQLite_%20Turso/Turso_guide.md) | 엣지 분산 SQLite Turso 가이드 — 셋업, 복제, 활용 사례, 무료 티어. | 2026-06-09 |
| [Upstash 가이드](Serverless_Redis/upstash_guide.md) | 서버리스 Redis/Kafka Upstash 평가 및 비교 — 요청 단위 과금, 무료 티어 분석. | 2026-06-09 |
| [Vercel 분석](vercel/vercel_analysis.md) | Vercel 플랫폼 심층 분석: 가격 체계, 엣지 함수, 제한 사항, 워크로드별 비용 효율. | 2026-06-09 |
| [글로벌 무료 CDN 가이드](github_cdn/Global%20free%20cdn%20guide.md) | jsDelivr, GitHub raw CDN 등 글로벌 무료 CDN을 활용한 정적 에셋 전송 가이드. | 2026-06-12 |
| [GitHub CDN](github_cdn/github_cdn.md) | GitHub 저장소를 jsDelivr와 연동해 무료 CDN으로 활용하는 기술 심층 가이드. | 2026-06-10 |
| [무료 이메일 발송 솔루션 가이드](FreeEmail/FreeEmail_guide.md) | Resend, Brevo, Mailgun, MailerSend, Amazon SES, Mailtrap, SendGrid, Postmark 8종 비교 분석 및 Vercel + Next.js 환경별 추천. | 2026-06-14 |
| [Supabase 완전 가이드](OpenSource_Firebase/SuperBase_guide.md) | 오픈소스 Firebase 대안 Supabase 가이드 — PostgreSQL, Auth, Storage, Realtime, Edge Functions, Vercel 통합, 가격 분석. | 2026-06-14 |

---

## UI/오픈소스 프레임워크

**조회수 3위, 실사용 의도 최상위** — UI/오픈소스 가이드. Python 기반 웹 UI부터 Meta의 디자인 시스템, 브라우저 Python 실행까지.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Astryx Getting Started](UI_OpenSource/Astryx%20getting%20started.md) | Meta의 MIT 라이선스 "Agent-Ready" 통합 디자인 시스템(React + StyleX) — 150+ 컴포넌트·7개 테마·CLI·MCP 서버·템플릿. 8년간 Meta 내부 13,000+ 앱에서 검증. | 2026-07-15 |
| [NiceGUI Getting Started](Python_NiceUI/NiceGUI-Getting-Started.md) | Python만으로 현대적 인터랙티브 Web 앱 구축 — Streamlit·Gradio·Dash와 비교, 설치·UI 요소·상태 관리·차트 예제. | 2026-07-18 |
| [Pyodide 기술 문서](Python_Pyodide/Pyodide.md) | 브라우저에서 Python 실행 — WebAssembly + CPython. PEP 783 표준화, JS-Python FFI, Worker 패턴, 경쟁 제품 8종 비교(검증·확장판). | 2026-07-19 |

> *"Astryx는 디자인 시스템의 끝판왕, NiceGUI는 Python으로 프론트엔드를 찍는 마법, Pyodide는 브라우저에서 Python을 돌리는 혁명. 하나씩 정복하라."*

---

## Python SaaS & 배포

Python으로 만든 웹앱을 공짜로 배포하는 방법과 PaaS 플랫폼 비교.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Python SaaS 무료 호스팅](Python_SaaS/Python-SaaS-Free-Hosting-Platforms.md) | Python 웹앱을 무료로 호스팅할 수 있는 플랫폼 10종 비교 — Streamlit Cloud, Railway, Render, Fly.io, Hugging Face Spaces 등. | 2026-07-15 |
| [무료 웹 호스팅 완전 비교](Free_Hosting/FreeHosting.md) | GitHub Pages, Netlify, Vercel, Cloudflare Pages, Railway, Render, Fly.io, Firebase 등 8종 무료 호스팅 종합 비교. | 2026-07-15 |
| [Railway Getting Started](PaaS_Railway/Railway_Getting_Start.md) | Railway PaaS 시작 가이드 — 배포, 데이터베이스, 환경변수, 템플릿, 가격 정책. | 2026-07-11 |
| [Orca Getting Started](orca/Orca%20getting%20started%20.md) | Orca 플랫폼 시작 가이드 — 프로덕션 배포 자동화. | 2026-07-12 |

---

## 클라우드 비용 절감

클라우드 인프라 지출 절감에 초점을 맞춘 문서입니다. 기술 의사결정자와 경영진을 대상으로 합니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [AWS 비용 절감 for CEO](AWS/Aws%20cost%20reduction%20for%20ceo.md) | 경영진을 위한 AWS 비용 절감 전략: 예약 인스턴스, Savings Plans, 사이징 최적화, 아키텍처 개선. | 2026-05-30 |

---

## AI / LLM

대규모 언어 모델 관련 문서 — 토큰 최적화, 로컬 배포, 보안, 지식 관리, LLM 앱 검증.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Caveman RTK 토큰 최적화](LLM/Caveman%20rtk%20token%20optimization.md) | LLM 상호작용 토큰 최적화 기법 — 프롬프트 엔지니어링과 컨텍스트 관리를 통한 비용/지연 감소. | 2026-06-13 |
| [Quivr 가이드](LLM/Quivr_guide.md) | LLM 기반 오픈소스 세컨드 브레인/지식 관리 플랫폼 Quivr 설정 및 활용 가이드. 38,000+★. | 2026-06-13 |
| [시크릿 스캐닝 LLM 하니스 프롬프트](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | 코드베이스에서 시크릿, API 키, 자격 증명을 탐지하는 LLM 기반 프롬프트 하니스 설계. | 2026-06-06 |
| [Claude Security Plugin 가이드 (KR)](LLM_Security/Claude-Security-Plugin-Guide_KR.md) · [EN](LLM_Security/Claude-Security-Plugin-Guide_EN.md) · [CN](LLM_Security/Claude-Security-Plugin-Guide_CN.md) · [JA](LLM_Security/Claude-Security-Plugin-Guide_JA.md) | Claude Code 내 멀티에이전트 취약점 스캐너(`claude-security`) + 예방적 코드 리뷰(`security-guidance`) 완전 가이드. 아키텍처·6페이즈 파이프라인·3렌즈 검증 패널·12종 경쟁사 비교·Getting Started. 4개국어. | 2026-07-26 |
| [Ollama 설치 가이드](Local_LLM/Ollama_Install_Guilde.md) | 개인 하드웨어에서 로컬 LLM(Llama, Mistral 등)을 실행하는 Ollama 단계별 설치 가이드. | 2026-05-xx |
| [Headroom 완전 가이드](Headroom/Headroom%20complete%20guide.md) | AI 에이전트 컨텍스트 지능형 압축 도구 — 토큰 60~95% 절감. SmartCrusher, CodeCompressor, CacheAligner 엔진. | 2026-06-12 |
| [Open Code 리뷰 가이드](LLM/Open%20code%20review%20guide.md) | AI 코딩 CLI 도구 Open Code 심층 리뷰 — DeepSeek V4 Pro 연동, 설치, 설정 최적화, 커맨드 레퍼런스, 타 도구와 비교 분석. | 2026-06-15 |
| [Tencent HY3 Getting Started (KR)](Tencent_LLM/Tencent%20HY3%20Getting%20Started%20KR.md) | 텐센트 Hy3(295B MoE) 실전 시작 가이드 — 가격·성능 비교(Claude Sonnet의 1/25), 셀프호스팅·코딩 도구 연동. | 2026-07-16 |
| [Awesome LLM Apps — 팩트체크 리뷰](Awesome-LLM-Apps/Awesome-LLM-Apps-review.md) · [EN](Awesome-LLM-Apps/Awesome-LLM-Apps-review_EN.md) · [CN](Awesome-LLM-Apps/Awesome-LLM-Apps-review_CN.md) · [JA](Awesome-LLM-Apps/Awesome-LLM-Apps-review_JA.md) **NEW** | GitHub 11.8만 스타 `Shubhamsaboo/awesome-llm-apps` 저장소의 실사용 검증 리뷰. 15개 카테고리(Agent Skills·RAG·Chatbot·Finance 등), 100+ 실행 가능한 템플릿 평가. 프레임워크 파편화·프로덕션 부적합·릴리스 부재 한계 분석. 4개국어. | 2026-07-23 |
| [ClawSecCheck — AI 에이전트 보안 자가 감사](Claw_Security/ClawSecCheck.md) · [EN](Claw_Security/ClawSecCheck_EN.md) · [CN](Claw_Security/ClawSecCheck_CN.md) · [JA](Claw_Security/ClawSecCheck_JA.md) **NEW** | OpenClaw AI 에이전트 보안 감사 도구 `ClawSecCheck` 분석. Python 표준 라이브러리만 사용(의존성 제로), Lethal Trifecta 지표, A-F 채점, RISK-01~10 위험 엔진, CI 게이트, UNKNOWN≠PASS 설계 원칙. 4개국어. | 2026-07-22 |

---

## LLM 모델 & 로컬 배포

최신 LLM 모델 분석, 로컬 실행 가이드, 초경량 추론 엔진.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [MiniCPM5 1B Fable5 Thinking](LLM_%20Minicpm5/Minicpm5%201b%20fable5%20thinking%20getting%20started.md) | MiniCPM5 1B 모델에 Fable5 Thinking 적용 — 로컬에서 Claude 수준 사고형 추론을 초경량으로 구현. | 2026-07-16 |
| [Bonsai-27B GGUF 가이드](LLM_Bonsai/Bonsai-27b-gguf.md) | Bonsai-27B 모델 GGUF 양자화 로컬 실행 가이드 — llama.cpp·Ollama 연동, VRAM 최적화. | 2026-07-16 |
| [Qwen 로컬 설치 가이드](Local_LLM/Qwen_Local_Install_guilde.md) | 알리바바 Qwen 시리즈 로컬 설치 및 실행 가이드 — Ollama·vLLM·SGLang 설정. | 2026-07-10 |
| [Zcode GLM 리뷰](Zcode/GLM_Reveiw.md) | 중국 칭화대 GLM 시리즈 모델 분석 및 평가 — ChatGLM·GLM-4 성능·한국어 지원·라이선스. | 2026-07-14 |
| [Colibri Getting Started](Colibri-Getting-Started.md) · [EN](Colibri-Getting-Started_EN.md) · [CN](Colibri-Getting-Started_CN.md) · [JA](Colibri-Getting-Started_JA.md) **NEW** | 744B GLM-5.2 MoE 모델을 순수 C로 25GB RAM에서 구동하는 초경량 엔진. NVMe/VRAM/RAM 3계층 스트리밍 아키텍처, 학습형 캐시(사용할수록 빨라짐), Speculative Decoding, 의존성 제로, Apache 2.0. 4개국어. | 2026-07-24 |

---

## 시계열 예측 모델 (TSFM)

시계열 파운데이션 모델(Time Series Foundation Model) 및 특화 아키텍처 분석 — 주식/거시경제/예측 시장 활용 포함.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [TimesFM 분석 가이드](TimesFM/TimesFM_%EB%B6%84%EC%84%9D_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | Google Research 시계열 파운데이션 모델 — 장단점, 주식/Polymarket 활용, 중국·해외 경쟁 프로젝트 비교. | 2026-06-19 |
| [iTransformer 시작 가이드](TimesFM/iTransformer_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | 칭화대 × 앤트그룹 ICLR 2024 Spotlight — 반전된 Transformer로 다변량 시계열 SOTA, 설치·예제·주식 활용. | 2026-06-19 |

---

## AI 코딩 어시스턴트

AI 코딩 어시스턴트 비교, 가격, 개발 환경 통합을 다룬 문서입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [MiniMax 코딩 가이드 (KO/EN)](MiniMax%20Coding%20Guide/README.md) | MiniMax를 AI 코딩 어시스턴트로 활용하는 실무 가이드 — VS Code 연동, 에이전트 워크플로우, DeepSeek/Anthropic/OpenAI 대비 가격/성능 비교. | 2026-06-04 |
| [Visual Studio C# LLM 가이드 (KO/EN)](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.ko.md) | Visual Studio용 C# 코딩 AI 어시스턴트 추천 + DeepSeek 및 다양한 LLM 연결 방법 (자료 검증 포함). | 2026-06-04 |
| [AI 코딩 워크플로우 가이드](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | Claude Code, Cursor, ChatGPT를 활용한 실전 AI 코딩 워크플로우 전략 — 도구 선택, 병렬 활용, 컨텍스트 관리, 비용 최적화. | 2026-06-16 |

---

## 리버스 엔지니어링 & LLM

역공학 및 바이너리 분석에 LLM을 접목한 도구 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [GhidraGPT Getting Started](GhidraGPT-Getting-Sarted.md) · [EN](GhidraGPT-Getting-Sarted_EN.md) · [CN](GhidraGPT-Getting-Sarted_CN.md) · [JA](GhidraGPT-Getting-Sarted_JA.md) **NEW** | NSA Ghidra 리버싱 프레임워크에 LLM(Claude·GPT·Ollama·Qwen)을 연동하는 GhidraGPT 플러그인 가이드. 기계어→C 디컴파일 LLM 보조, Function Rewrite·Code Explanation·보안 분석 워크플로우. 민감 코드는 Ollama 로컬 모드 권장. 4개국어. | 2026-07-24 |

---

## AI 에이전트 & 웹 표준

AI 에이전트가 탐색하고 이해하며 작업을 수행할 수 있는 웹사이트 구축 표준을 다룬 문서입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [에이전트 친화 웹사이트 가이드 (KO/EN/JA)](agent-friendly-website-guide/README.md) | Google web.dev(2026-04), Chrome WebMCP EPP, Jeremy Howard의 llms.txt 표준을 통합한 3개국어 11장+부록 실무 가이드. 시맨틱 HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP 수록. CC BY 4.0. | 2026-05-19 |

---

## 클라우드플레어 웹 분석 & SEO 최적화

**웹 분석·SEO·AI 검색 가시성을 동시에 최적화하는 실전 가이드** — Cloudflare Workers로 서비스하는 사이트의 분석 도구 선택부터 Google Search Console·네이버·IndexNow·AI Overviews까지 커버합니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Cloudflare Web Analytics 완전 가이드](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide.md) · [EN](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_EN.md) · [CN](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_CN.md) · [JA](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_JA.md) **NEW** | Cloudflare 네이티브 분석(Web Analytics·Zaraz·Workers Engine+Logpush+R2)과 서드파티(Umami·Plausible·GoatCounter·GA4·Matomo·PostHog 등) 도구 비교. 단계별 선택 가이드·권장 경로("Web Analytics → Umami 확장"). 4개국어. | 2026-07-25 |
| [Umami 셀프호스팅 계획 — vibequant](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant.md) · [EN](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_EN.md) · [CN](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_CN.md) · [JA](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_JA.md) **NEW** | vibequant.cc의 Umami 셀프호스팅 설계 문서. Cloudflare Pages + D1 환경에서의 구체적 배포 설정·비용 분석·프라이버시 중심 설계. 4개국어. | 2026-07-25 |
| [SEO & AI 가독성 실무 가이드 — vibequant](SEO/SEO-AI-Readability-Guide.md) · [EN](SEO/SEO-AI-Readability-Guide_EN.md) · [JA](SEO/SEO-AI-Readability-Guide_JA.md) **NEW** | Cloudflare Pages 멀티 서브도메인 환경의 GSC·네이버·IndexNow·AI Overviews 통합 SEO 최적화. Phase 1~7 체크리스트, 브랜드 엔티티 분리 전략, 11가지 SEO 오해 정정(AI 검색별 인덱스·Google-Extended·사이트맵 최적화 등). P0~P3 실행 체크리스트. 3개국어. | 2026-07-25 |

> *"Good SEO = Good AI readability. 검색엔진과 AI 에이전트가 모두 이해하는 사이트를 만드는 것은 같은 과업의 두 측면이다."*

---

## 중국/AI 산업 분석

중국 AI 산업의 구조적 분석 — 피지컬 AI, 오픈소스 전략, 엔지니어링 문화.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [China Physical AI 분석](China-Physical-AI/China-Physical-AI.md) | 중국의 피지컬 AI(로보틱스·제조·드론) 산업 생태계 분석 — 주요 기업·정부 정책·기술 스택·글로벌 경쟁 구도. | 2026-07-17 |
| [Grok Build 오픈소스 분석](Grok_Build/Grok_build_oss_analysis_20260715.md) | xAI Grok의 빌드 시스템 오픈소스 공개 분석 — 인프라·훈련 파이프라인·기술적 의사결정 인사이트. | 2026-07-15 |
| [Loop Engineering 실패 분석](Loop/Why-Does-Loop-Engineering-Fail%3F.md) | "왜 루프 엔지니어링은 실패하는가" — AI 코딩의 반복적 접근법이 실패하는 구조적 원인과 해결 전략. | 2026-07-16 |

---

## OpenCode 한국어화

AI 코딩 CLI 도구 **OpenCode**의 한국어 번역 및 현지화 프로젝트.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [OpenCode 한국어화 README](OpenCode_KR/README.md) | OpenCode 한국어 번역 프로젝트 개요 — 목표·진행 상황·기여 방법. | 2026-07-17 |
| [번역 용어집 (Glossary)](OpenCode_KR/Glossary.md) | OpenCode UI/CLI 용어의 한글 번역 기준 용어집. | 2026-07-17 |
| [번역 계획 (Translation Plan)](OpenCode_KR/Translation_Plan.md) | 단계별 번역 로드맵 및 우선순위. | 2026-07-17 |

---

## 개발자 도구 & 기타

기타 유틸리티, 네트워크 도구, 성격 평가 프레임워크.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Bigfive 시작하기](Bigfive/Bigfive%20getting%20started.md) | Big Five 성격 특성 모델을 구현한 웹 기반 성격 평가 프레임워크 Bigfive 시작 가이드. | 2026-05-27 |
| [MY-IP 프로젝트 분석](MY-IP/MY-IP.md) **NEW** | jason5ng32의 Node.js 기반 네트워크 진단 통합 웹앱(10.1k 스타) 분석 — IP 조회·WHOIS·DNS 누출·WebRTC·속도 테스트·브라우저 핑거프린트 등 10여 가지 도구 단일 인터페이스 제공. | 2026-07-24 |
| [LLM Wiki 소개](LLM_Wiki_%EC%86%8C%EA%B0%9C.md) · [EN](LLM_Wiki_%EC%86%8C%EA%B0%9C_EN.md) · [CN](LLM_Wiki_%EC%86%8C%EA%B0%9C_CN.md) · [JA](LLM_Wiki_%EC%86%8C%EA%B0%9C_JA.md) | LLM Wiki 카테고리 개요 문서 — DeepWiki·Google Code Wiki·OpenWiki 3종 비교. 4개국어. | 2026-07-11 |

---

## 최근 업데이트

최근 추가되거나 크게 수정된 문서 (최신순):

| 날짜 | 문서 | 내용 |
|------|------|------|
| 2026-07-28 | MCP 서버 개발 Getting Started | MCP 개념 + AMQS 시그널 서버 구현 완전 가이드 |
| 2026-07-28 | AMQS-AI-Infra MCP Server | MCP 서버 README (4 Tools·1 Resource·1 Prompt) |
| 2026-07-26 | Claude Security Plugin 가이드 | claude-security + security-guidance 멀티에이전트 보안 플러그인 완전 가이드 (4개국어) |
| 2026-07-26 | Toss Open API IP 화이트리스트 | Toss OAuth 인디 주의점 + CASSANDRA Naver 롤백 (KR·EN) |
| 2026-07-25 | Cloudflare Web Analytics 완전 가이드 | Cloudflare 네이티브 + 서드파티 분석 도구 비교 (4개국어) |
| 2026-07-25 | Umami 셀프호스팅 계획 | vibequant.cc Umami 배포 설계 (4개국어) |
| 2026-07-25 | SEO & AI 가독성 실무 가이드 | vibequant.cc GSC·네이버·AI Overviews SEO 최적화 (3개국어) |
| 2026-07-24 | Colibri Getting Started | 744B GLM-5.2 MoE 초경량 C 엔진 (4개국어) |
| 2026-07-24 | GhidraGPT Getting Started | NSA Ghidra + LLM 리버싱 플러그인 (4개국어) |
| 2026-07-24 | 키움증권 REST API SDK & LLM 트레이딩 스킬 | 500+ 엔드포인트 분석·멀티 언어 SDK·Claude Skill 아키텍처 |
| 2026-07-24 | Robinhood MCP 시작 가이드 | 공식 + 커뮤니티 MCP 7종 비교 (4개국어) |
| 2026-07-24 | MY-IP 프로젝트 분석 | 네트워크 진단 통합 웹앱 분석 |
| 2026-07-23 | OpenCodex — LLM 프록시 분석 | 40+ 제공자 라우팅 프록시 (4개국어) |
| 2026-07-23 | Awesome LLM Apps 팩트체크 리뷰 | 11.8만 스타 LLM 앱 저장소 실사용 검증 (4개국어) |
| 2026-07-22 | ClawSecCheck — AI 에이전트 보안 감사 | OpenClaw 보안 자가 감사 도구 (4개국어) |
| 2026-07-22 | AI Agent Framework 비교 | MAF Go vs LangChain/LangGraph (4개국어) |
| 2026-07-22 | Awesome Agent — AI 에이전트 큐레이션 | OpenWorker·goose·OpenHands 실측 비교 (3개국어) |
| 2026-07-22 | Awesome Open Weight Model — 3종 비교 | Solar Open2·DeepSeek V4·KIMI K3 벤치마크 분석 (3개국어) |
| 2026-07-24 | Cloudflare 무료 티어 사용법 — VibeQuant 사례 | Cloudflare 운영 설계 (KR) |
| 2026-07-19 | Pyodide 기술 문서 | 브라우저 Python 실행 — 검증·확장판 (8종 비교) |
| 2026-07-18 | Qlib 시작 가이드 (KR) | Microsoft Qlib 한국어 완전 가이드 |
| 2026-07-18 | toss-qlib-middleware | 토스 Open API ↔ Qlib 연동 미들웨어 |
| 2026-07-18 | NiceGUI Getting Started | Python으로 Web UI 구축 (4종 경쟁 프레임워크 비교) |
| 2026-07-17 | GS Quant Getting Started | Goldman Sachs 퀀트 툴킷 완전 가이드 |
| 2026-07-17 | China Physical AI 분석 | 중국 피지컬 AI 산업 생태계 |
| 2026-07-16 | Tencent HY3 Getting Started | 텐센트 Hy3 시작 가이드 |
| 2026-07-16 | MiniCPM5 1B Fable5 Thinking | 초경량 사고형 추론 모델 |
| 2026-07-16 | Bonsai-27B GGUF | 로컬 LLM 양자화 가이드 |
| 2026-07-16 | Loop Engineering 실패 분석 | AI 코딩 루프의 구조적 한계 |
| 2026-07-15 | Astryx Getting Started | Meta 디자인 시스템 |
| 2026-07-15 | Python SaaS 무료 호스팅 | Python 웹앱 무료 배포 10종 비교 |
| 2026-07-15 | 무료 웹 호스팅 완전 비교 | 8종 무료 호스팅 종합 |
| 2026-07-15 | Grok Build 오픈소스 분석 | xAI Grok 빌드 시스템 |
| 2026-07-14 | Claude 프롬프트 최적화 5종 | 오픈소스 프롬프트 옵티마이저 비교 |
| 2026-07-14 | Zcode GLM 리뷰 | 칭화대 GLM 시리즈 분석 |
| 2026-07-12 | Orca Getting Started | 배포 자동화 플랫폼 |
| 2026-07-11 | Railway Getting Started | PaaS 시작 가이드 |
| 2026-07-11 | DeepWiki 시작하기 | LLM Wiki — AI 코드 문서 자동화 |
| 2026-07-11 | Google Code Wiki 시작하기 | LLM Wiki — Gemini 기반 |
| 2026-07-11 | OpenWiki 기술 문서 | LLM Wiki — 에이전트용 로컬 위키 CLI |
| 2026-07-10 | Qwen 로컬 설치 가이드 | 알리바바 Qwen 로컬 LLM |
| 2026-07-05 | Claude Skills 퀀트 워크플로우 | 2종 스킬 + 제작 가이드 |
| 2026-06-19 | iTransformer 시작 가이드 | 칭화대 다변량 시계열 모델 |
| 2026-06-19 | TimesFM 분석 가이드 | Google 시계열 파운데이션 모델 |
| 2026-06-16 | AI 코딩 워크플로우 가이드 | 코딩 도구 실전 전략 |
| 2026-06-15 | Open Code 리뷰 가이드 | CLI 도구 심층 리뷰 |
| 2026-06-14 | Supabase 완전 가이드 | 오픈소스 Firebase 대안 |
| 2026-06-14 | 무료 이메일 발송 솔루션 | 이메일 SaaS 8종 비교 |
| 2026-06-13 | Caveman RTK 토큰 최적화 | LLM 토큰 절감 |
| 2026-06-13 | Quivr 가이드 | AI 지식 관리 |
| 2026-06-12 | Headroom 완전 가이드 | 토큰 압축 솔루션 |
| 2026-06-12 | 글로벌 무료 CDN 가이드 | CDN 무료 활용 |
| 2026-06-10 | GitHub CDN | jsDelivr 상세 |
| 2026-06-09 | Upstash 가이드 | 서버리스 Redis |
| 2026-06-09 | Turso 가이드 | 엣지 SQLite |
| 2026-06-09 | Neon 리뷰 | 서버리스 PostgreSQL |
| 2026-06-09 | Vercel 분석 | 무료 SaaS 웹서버 |
| 2026-06-07 | Ollama 설치 가이드 | 로컬 LLM |
| 2026-06-07 | 에이전트 친화 웹사이트 가이드 | AI 에이전트 웹 표준 |
| 2026-06-06 | 시크릿 스캐닝 하니스 | LLM 보안 |
| 2026-06-04 | MiniMax 코딩 가이드 | AI 코딩 어시스턴트 |
| 2026-05-30 | AWS 비용 절감 for CEO | 클라우드 비용 |
| 2026-05-27 | Bigfive 시작하기 | 성격 평가 도구 |
| 2026-05-12 | Cloudflare 무료 티어 가이드 | Cloudflare 무료 플랜 |
| 2026-05-09 | Oracle Cloud 무료 티어 가이드 | Oracle 무료 VM |

---

## AI 에이전트 참고 사항

이 디렉토리는 가능한 한 시맨틱 구조를 따릅니다. 가장 빠른 기계 판독 진입점은 [llms.txt](llms.txt)를 참조하세요. 자체 llms.txt 파일이 있는 하위 디렉토리(예: `agent-friendly-website-guide/`, `Quant_Qlib/toss-qlib-middleware/`, `MCP/`, `China-Physical-AI/`, `AI-Open-Weights-Model/`, `Awesome-Agent/`, `AI-Agent-Framework/`)는 추가적인 구조화 색인을 제공합니다.

## 라이선스

개별 문서에 별도 명시가 없는 한, Dennis Kim이 작성한 문서는 참고 자료로 공유됩니다. `agent-friendly-website-guide/`는 CC BY 4.0으로 라이선스됩니다.
