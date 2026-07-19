# TechDoc

> Dennis Kim (@gameworkerkim)이 최근 유행하는 기술을 평가하고 큐레이션한 기술 문서 모음 — 서버리스, 클라우드 비용 절감, AI/LLM, 퀀트 금융, Claude Skills, MCP, UI 프레임워크, 개발자 인프라를 다룹니다.
>
> English version: [README_EN.md](README_EN.md)

---

## 목차

1. [LLM Wiki](#llm-wiki)
2. [퀀트 금융 & 트레이딩 플랫폼](#퀀트-금융--트레이딩-플랫폼) **NEW**
3. [Claude Skills & 프롬프트 최적화](#claude-skills--프롬프트-최적화) **NEW**
4. [MCP & AI 에이전트](#mcp--ai-에이전트) **NEW**
5. [서버리스 & SaaS 무료 티어](#서버리스--saas-무료-티어)
6. [UI/오픈소스 프레임워크](#ui오픈소스-프레임워크) **NEW**
7. [Python SaaS & 배포](#python-saas--배포) **NEW**
8. [클라우드 비용 절감](#클라우드-비용-절감)
9. [AI / LLM](#ai--llm)
10. [LLM 모델 & 로컬 배포](#llm-모델--로컬-배포) **NEW**
11. [시계열 예측 모델 (TSFM)](#시계열-예측-모델-tsfm)
12. [AI 코딩 어시스턴트](#ai-코딩-어시스턴트)
13. [AI 에이전트 & 웹 표준](#ai-에이전트--웹-표준)
14. [중국/AI 산업 분석](#중국ai-산업-분석) **NEW**
15. [OpenCode 한국어화](#opencode-한국어화) **NEW**
16. [개발자 도구 & 기타](#개발자-도구--기타)

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

## 퀀트 금융 & 트레이딩 플랫폼

**최다 조회 · 실사용 의도 1위** — GitHub 트래픽에서 가장 높은 방문자 수를 기록한 섹션입니다. AI 퀀트 투자자를 위한 실전 플랫폼 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Qlib 시작 가이드 (KR)](Quant_Qlib/Qlib-getting-started-KR.md) | Microsoft Qlib 완전 가이드 — 설치·데이터 준비·워크플로우·벤치마크·KRX 데이터 연동·토스 Open API 미들웨어 연결. | 2026-07-18 |
| [toss-qlib-middleware](Quant_Qlib/toss-qlib-middleware/README.md) · [EN](Quant_Qlib/toss-qlib-middleware/README_EN.md) | 토스증권 Open API ↔ Microsoft Qlib 연동 미들웨어. OAuth2 + market data → CSV 파이프라인 + Redis 캐싱. Node.js/TypeScript. | 2026-07-18 |
| [GS Quant Getting Started](GS_Quant/GS%20Quant%20Getting%20Started.md) | Goldman Sachs 기관급 퀀트 금융 툴킷 — 장단점·8종 플랫폼 비교·주의사항·설치·사용 케이스. 코어 프라이싱/리스크는 GS 서버에서 처리, Python SDK는 클라이언트. | 2026-07-17 |

> *"Qlib는 Microsoft가 공개한 AI 퀀트 플랫폼의 표준, GS Quant는 월가의 실전 무기. 둘 다 읽고 나면 GitHub에 굴러다니는 트레이딩 봇이 얼마나 얕은지 보인다."*

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

## 서버리스 & SaaS 무료 티어

무료 티어를 제공하는 서버리스 플랫폼과 SaaS 서비스를 평가/비교한 문서입니다. 인프라 비용을 최소화하려는 개발자와 스타트업을 위한 실무 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
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

대규모 언어 모델 관련 문서 — 토큰 최적화, 로컬 배포, 보안, 지식 관리.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Caveman RTK 토큰 최적화](LLM/Caveman%20rtk%20token%20optimization.md) | LLM 상호작용 토큰 최적화 기법 — 프롬프트 엔지니어링과 컨텍스트 관리를 통한 비용/지연 감소. | 2026-06-13 |
| [Quivr 가이드](LLM/Quivr_guide.md) | LLM 기반 오픈소스 세컨드 브레인/지식 관리 플랫폼 Quivr 설정 및 활용 가이드. 38,000+★. | 2026-06-13 |
| [시크릿 스캐닝 LLM 하니스 프롬프트](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | 코드베이스에서 시크릿, API 키, 자격 증명을 탐지하는 LLM 기반 프롬프트 하니스 설계. | 2026-06-06 |
| [Ollama 설치 가이드](Local_LLM/Ollama_Install_Guilde.md) | 개인 하드웨어에서 로컬 LLM(Llama, Mistral 등)을 실행하는 Ollama 단계별 설치 가이드. | 2026-05-xx |
| [Headroom 완전 가이드](Headroom/Headroom%20complete%20guide.md) | AI 에이전트 컨텍스트 지능형 압축 도구 — 토큰 60~95% 절감. SmartCrusher, CodeCompressor, CacheAligner 엔진. | 2026-06-12 |
| [Open Code 리뷰 가이드](LLM/Open%20code%20review%20guide.md) | AI 코딩 CLI 도구 Open Code 심층 리뷰 — DeepSeek V4 Pro 연동, 설치, 설정 최적화, 커맨드 레퍼런스, 타 도구와 비교 분석. | 2026-06-15 |
| [Tencent HY3 Getting Started (KR)](Tencent_LLM/Tencent%20HY3%20Getting%20Started%20KR.md) | 텐센트 Hy3(295B MoE) 실전 시작 가이드 — 가격·성능 비교(Claude Sonnet의 1/25), 셀프호스팅·코딩 도구 연동. | 2026-07-16 |

---

## LLM 모델 & 로컬 배포

최신 LLM 모델 분석 및 로컬 실행 가이드.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [MiniCPM5 1B Fable5 Thinking](LLM_%20Minicpm5/Minicpm5%201b%20fable5%20thinking%20getting%20started.md) | MiniCPM5 1B 모델에 Fable5 Thinking 적용 — 로컬에서 Claude 수준 사고형 추론을 초경량으로 구현. | 2026-07-16 |
| [Bonsai-27B GGUF 가이드](LLM_Bonsai/Bonsai-27b-gguf.md) | Bonsai-27B 모델 GGUF 양자화 로컬 실행 가이드 — llama.cpp·Ollama 연동, VRAM 최적화. | 2026-07-16 |
| [Qwen 로컬 설치 가이드](Local_LLM/Qwen_Local_Install_guilde.md) | 알리바바 Qwen 시리즈 로컬 설치 및 실행 가이드 — Ollama·vLLM·SGLang 설정. | 2026-07-10 |
| [Zcode GLM 리뷰](Zcode/GLM_Reveiw.md) | 중국 칭화대 GLM 시리즈 모델 분석 및 평가 — ChatGLM·GLM-4 성능·한국어 지원·라이선스. | 2026-07-14 |

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

## AI 에이전트 & 웹 표준

AI 에이전트가 탐색하고 이해하며 작업을 수행할 수 있는 웹사이트 구축 표준을 다룬 문서입니다.

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [에이전트 친화 웹사이트 가이드 (KO/EN/JA)](agent-friendly-website-guide/README.md) | Google web.dev(2026-04), Chrome WebMCP EPP, Jeremy Howard의 llms.txt 표준을 통합한 3개국어 11장+부록 실무 가이드. 시맨틱 HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP 수록. CC BY 4.0. | 2026-05-19 |

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

| 문서 | 설명 | 최종 수정일 |
|------|------|------------|
| [Bigfive 시작하기](Bigfive/Bigfive%20getting%20started.md) | Big Five 성격 특성 모델을 구현한 웹 기반 성격 평가 프레임워크 Bigfive 시작 가이드. | 2026-05-27 |
| [LLM Wiki 소개](LLM_Wiki_%EC%86%8C%EA%B0%9C.md) | LLM Wiki 카테고리 개요 문서. | 2026-07-11 |

---

## 최근 업데이트

최근 추가되거나 크게 수정된 문서 (최신순):

| 날짜 | 문서 | 내용 |
|------|------|------|
| 2026-07-28 | MCP 서버 개발 Getting Started | MCP 개념 + AMQS 시그널 서버 구현 완전 가이드 |
| 2026-07-28 | AMQS-AI-Infra MCP Server | MCP 서버 README (4 Tools·1 Resource·1 Prompt) |
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

이 디렉토리는 가능한 한 시맨틱 구조를 따릅니다. 가장 빠른 기계 판독 진입점은 [llms.txt](llms.txt)를 참조하세요. 자체 llms.txt 파일이 있는 하위 디렉토리(예: `agent-friendly-website-guide/`, `Quant_Qlib/toss-qlib-middleware/`, `MCP/`, `China-Physical-AI/`)는 추가적인 구조화 색인을 제공합니다.

## 라이선스

개별 문서에 별도 명시가 없는 한, Dennis Kim이 작성한 문서는 참고 자료로 공유됩니다. `agent-friendly-website-guide/`는 CC BY 4.0으로 라이선스됩니다.
