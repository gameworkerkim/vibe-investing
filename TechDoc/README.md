# TechDoc

> [Dennis Kim (@gameworkerkim)](https://github.com/gameworkerkim)이 최근 유행하는 기술을 평가하고 큐레이션한 기술 문서 모음 -- 서버리스, 클라우드 비용 절감, AI/LLM, 개발자 인프라를 다룹니다.
>
> English version: [README_EN.md](README_EN.md)

---

## LLM Wiki

> **LLM Wiki**는 AI가 GitHub 코드베이스를 분석해 구조·아키텍처·API를 **위키 형태의 문서로 자동 생성**하고, 자연어 Q&A로 코드를 탐색하게 해주는 새로운 도구 카테고리입니다. 아래 3종을 비교/정리했습니다.

| 문서 | 제공 주체 | 형태 | 한 줄 설명 |
|---|---|---|---|
| [DeepWiki 시작하기](DeepWiki/DeepWiki_Getting_Started.md) | Cognition Labs (Devin) | 호스팅 SaaS | `github.com` → `deepwiki.com` URL 치환만으로 위키 생성. 진입장벽 제로. 설치형 `deepwiki-open` 포함 |
| [Google Code Wiki 시작하기](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) | Google | 호스팅 SaaS | Gemini 기반. 코드 변경 시 문서·다이어그램 자동 재생성, 모든 설명이 소스 파일에 하이퍼링크 |
| [OpenWiki 기술 문서](openwiki/README.md) | LangChain (오픈소스) | 로컬 CLI | AI 코딩 에이전트용 위키. `AGENTS.md`/`CLAUDE.md` 자동 관리, CI 자동 갱신, 프라이빗 저장소 지원 |

> **요약** — 공개 저장소를 빠르게 훑으려면 **DeepWiki**·**Google Code Wiki**(무설치·무료), 사내 프라이빗 코드나 로컬 LLM·에이전트 연동이 필요하면 **OpenWiki**(로컬 실행)를 선택하세요.

---

## NEW

| 문서 | 설명 |
|---|---|
| [iTransformer 시작 가이드](TimesFM/iTransformer_가이드.md) | 칭화대 × 앤트그룹 ICLR 2024 Spotlight — 반전된 Transformer로 다변량 시계열 SOTA 달성, 설치·예제·주식 활용 포함 |
| [TimesFM 분석 가이드](TimesFM/TimesFM_분석_가이드.md) | Google Research 시계열 파운데이션 모델 -- 장단점, 주식/Polymarket 활용, 중국·해외 경쟁 프로젝트 비교 |
| [AI 코딩 워크플로우 가이드](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | Claude Code, Cursor, ChatGPT를 활용한 실전 AI 코딩 워크플로우 비교 및 전략 가이드 |
| [Open Code 리뷰 가이드](LLM/Open%20code%20review%20guide.md) | AI 코딩 CLI 도구 Open Code 심층 리뷰 -- DeepSeek V4 Pro 연동, 설정 최적화, 도구별 비교 |
| [Supabase 완전 가이드](OpenSource_Firebase/SuperBase_guide.md) | 오픈소스 Firebase 대안 -- PostgreSQL, Auth, Storage, Realtime, Edge Functions, Vercel 통합 |

---

## 목차

- [LLM Wiki](#llm-wiki)
- [서버리스 & SaaS 무료 티어](#서버리스--saas-무료-티어)
- [클라우드 비용 절감](#클라우드-비용-절감)
- [AI / LLM](#ai--llm)
- [시계열 예측 모델 (TSFM)](#시계열-예측-모델-tsfm)
- [AI 코딩 어시스턴트](#ai-코딩-어시스턴트)
- [AI 에이전트 & 웹 표준](#ai-에이전트--웹-표준)
- [개발자 도구 & 기타](#개발자-도구--기타)

---

## 서버리스 & SaaS 무료 티어

무료 티어를 제공하는 서버리스 플랫폼과 SaaS 서비스를 평가/비교한 문서입니다. 인프라 비용을 최소화하려는 개발자와 스타트업을 위한 실무 가이드입니다.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [Cloudflare 무료 티어 가이드](CloudFlare/Cloudflare%20free%20tier%20guide.md) | Cloudflare 무료 티어 종합 가이드: Workers, Pages, D1, R2, KV, 보안 서비스. | 2026-05-12 |
| [Oracle Cloud 무료 티어 가이드](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) | Oracle Cloud 평생 무료 티어 한국어 가이드: ARM VM, Compute, 데이터베이스, 네트워킹. | 2026-05-09 |
| [Neon 리뷰](Neon/Neon_review.md) | Neon.tech 평가 -- 서버리스 PostgreSQL, 브랜칭, 무료 티어 제한, 가격, 성능 분석. | 2026-06-09 |
| [Turso 가이드](SQLite_%20Turso/Turso_guide.md) | 엣지 분산 SQLite Turso 가이드 -- 셋업, 복제, 활용 사례, 무료 티어. | 2026-06-09 |
| [Upstash 가이드](Serverless_Redis/upstash_guide.md) | 서버리스 Redis/Kafka Upstash 평가 및 비교 -- 요청 단위 과금, 무료 티어 분석. | 2026-06-09 |
| [Vercel 분석](vercel/vercel_analysis.md) | Vercel 플랫폼 심층 분석: 가격 체계, 엣지 함수, 제한 사항, 워크로드별 비용 효율. | 2026-06-09 |
| [글로벌 무료 CDN 가이드](github_cdn/Global%20free%20cdn%20guide.md) | jsDelivr, GitHub raw CDN 등 글로벌 무료 CDN을 활용한 정적 에셋 전송 가이드. | 2026-06-12 |
| [GitHub CDN](github_cdn/github_cdn.md) | GitHub 저장소를 jsDelivr와 연동해 무료 CDN으로 활용하는 기술 심층 가이드. | 2026-06-10 |
| [무료 이메일 발송 솔루션 가이드](FreeEmail/FreeEmail_guide.md) | Resend, Brevo, Mailgun, MailerSend, Amazon SES, Mailtrap, SendGrid, Postmark 8종 비교 분석 및 Vercel + Next.js 환경별 추천. | 2026-06-14 |
| [Supabase 완전 가이드](OpenSource_Firebase/SuperBase_guide.md) | 오픈소스 Firebase 대안 Supabase 가이드 -- PostgreSQL, Auth, Storage, Realtime, Edge Functions, Vercel 통합, 가격 분석. | 2026-06-14 |

## 클라우드 비용 절감

클라우드 인프라 지출 절감에 초점을 맞춘 문서입니다. 기술 의사결정자와 경영진을 대상으로 합니다.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [AWS 비용 절감 for CEO](AWS/Aws%20cost%20reduction%20for%20ceo.md) | 경영진을 위한 AWS 비용 절감 전략: 예약 인스턴스, Savings Plans, 사이징 최적화, 아키텍처 개선. | 2026-05-30 |

## AI / LLM

대규모 언어 모델 관련 문서 -- 토큰 최적화, 로컬 배포, 보안, 지식 관리.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [Caveman RTK 토큰 최적화](LLM/Caveman%20rtk%20token%20optimization.md) | LLM 상호작용 토큰 최적화 기법 -- 프롬프트 엔지니어링과 컨텍스트 관리를 통한 비용/지연 감소. | 2026-06-13 |
| [Quivr 가이드](LLM/Quivr_guide.md) | LLM 기반 오픈소스 세컨드 브레인/지식 관리 플랫폼 Quivr 설정 및 활용 가이드. | 2026-06-13 |
| [시크릿 스캐닝 LLM 하니스 프롬프트](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | 코드베이스에서 시크릿, API 키, 자격 증명을 탐지하는 LLM 기반 프롬프트 하니스 설계. | 2026-06-06 |
| [Ollama 설치 가이드](Local_LLM/Ollama_Install_Guilde.md) | 개인 하드웨어에서 로컬 LLM(Llama, Mistral 등)을 실행하는 Ollama 단계별 설치 가이드. | 2026-05-xx |
| [Headroom 완전 가이드](Headroom/Headroom%20complete%20guide.md) | AI 에이전트 컨텍스트 지능형 압축 도구 -- 토큰 60~95% 절감. SmartCrusher, CodeCompressor, CacheAligner 엔진. DeepSeek V4 Pro, Open Code 연동. | 2026-06-12 |
| [Open Code 리뷰 가이드](LLM/Open%20code%20review%20guide.md) | AI 코딩 CLI 도구 Open Code 심층 리뷰 -- DeepSeek V4 Pro 연동, 설치, 설정 최적화, 커맨드 레퍼런스, 타 도구와 비교 분석. | 2026-06-15 |

## 시계열 예측 모델 (TSFM)

시계열 파운데이션 모델(Time Series Foundation Model) 및 특화 아키텍처 분석 — 주식/거시경제/예측 시장 활용 포함.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [TimesFM 분석 가이드](TimesFM/TimesFM_분석_가이드.md) | Google Research 시계열 파운데이션 모델 -- 장단점, 주식/Polymarket 활용, 중국·해외 경쟁 프로젝트 비교. | 2026-06-19 |
| [iTransformer 시작 가이드](TimesFM/iTransformer_가이드.md) | 칭화대 × 앤트그룹 ICLR 2024 Spotlight — 반전된 Transformer로 다변량 시계열 SOTA, 설치·예제·주식 활용. | 2026-06-19 |

## AI 코딩 어시스턴트

AI 코딩 어시스턴트 비교, 가격, 개발 환경 통합을 다룬 문서입니다.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [MiniMax 코딩 가이드 (KO/EN)](MiniMax%20Coding%20Guide/) | MiniMax를 AI 코딩 어시스턴트로 활용하는 실무 가이드 -- VS Code 연동, 에이전트 워크플로우, DeepSeek/Anthropic/OpenAI 대비 가격/성능 비교. | 2026-06-04 |
| [Visual Studio C# LLM 가이드 (KO/EN)](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.en.md) | Visual Studio용 C# 코딩 AI 어시스턴트 추천 + DeepSeek 및 다양한 LLM 연결 방법 (자료 검증 포함). | 2026-06-04 |
| [AI 코딩 워크플로우 가이드](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | Claude Code, Cursor, ChatGPT를 활용한 실전 AI 코딩 워크플로우 전략 -- 도구 선택, 병렬 활용, 컨텍스트 관리, 비용 최적화. | 2026-06-16 |

## AI 에이전트 & 웹 표준

AI 에이전트가 탐색하고 이해하며 작업을 수행할 수 있는 웹사이트 구축 표준을 다룬 문서입니다.

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [에이전트 친화 웹사이트 가이드 (KO/EN/JA)](agent-friendly-website-guide/) | Google web.dev(2026-04), Chrome WebMCP EPP, Jeremy Howard의 llms.txt 표준을 통합한 3개국어 11장+부록 실무 가이드. 시맨틱 HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP 수록. CC BY 4.0. | 2026-05-19 |

## 개발자 도구 & 기타

| 문서 | 설명 | 최종 수정일 |
|---|---|---|
| [Bigfive 시작하기](Bigfive/Bigfive%20getting%20started.md) | Big Five 성격 특성 모델을 구현한 웹 기반 성격 평가 프레임워크 Bigfive 시작 가이드. | 2026-05-27 |

---

## 최근 업데이트

최근 추가되거나 크게 수정된 문서 (최신순):

| 날짜 | 문서 | 내용 |
|---|---|---|
| 2026-07-11 | [DeepWiki 시작하기](DeepWiki/DeepWiki_Getting_Started.md) | LLM Wiki -- AI 코드 문서 자동화 (SaaS + 설치형) |
| 2026-07-11 | [Google Code Wiki 시작하기](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) | LLM Wiki -- Gemini 기반, 자동 재생성 문서 |
| 2026-07-11 | [OpenWiki 기술 문서](openwiki/README.md) | LLM Wiki -- 에이전트용 로컬 위키 CLI |
| 2026-06-19 | [iTransformer 시작 가이드](TimesFM/iTransformer_가이드.md) | 칭화대 다변량 시계열 모델 |
| 2026-06-19 | [TimesFM 분석 가이드](TimesFM/TimesFM_분석_가이드.md) | Google 시계열 파운데이션 모델 |
| 2026-06-16 | [AI 코딩 워크플로우 가이드](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | AI 코딩 도구 실전 전략 |
| 2026-06-15 | [Open Code 리뷰 가이드](LLM/Open%20code%20review%20guide.md) | AI 코딩 CLI 도구 심층 리뷰 |
| 2026-06-14 | [Supabase 완전 가이드](OpenSource_Firebase/SuperBase_guide.md) | 오픈소스 Firebase 대안 |
| 2026-06-14 | [무료 이메일 발송 솔루션 가이드](FreeEmail/FreeEmail_guide.md) | 무료 이메일 SaaS 비교 |
| 2026-06-13 | [Caveman RTK 토큰 최적화](LLM/Caveman%20rtk%20token%20optimization.md) | LLM 토큰 절감 |
| 2026-06-13 | [Quivr 가이드](LLM/Quivr_guide.md) | AI를 나만의 비서로 |
| 2026-06-12 | [Headroom 완전 가이드](Headroom/Headroom%20complete%20guide.md) | LLM 토큰 압축 솔루션 |
| 2026-06-12 | [글로벌 무료 CDN 가이드](github_cdn/Global%20free%20cdn%20guide.md) | 무료 CDN 가이드 |
| 2026-06-10 | [GitHub CDN](github_cdn/github_cdn.md) | jsDelivr 내용 추가 |
| 2026-06-09 | [Upstash 가이드](Serverless_Redis/upstash_guide.md) | 무료 Redis SaaS |
| 2026-06-09 | [Turso 가이드](SQLite_%20Turso/Turso_guide.md) | SQLite 에지 컴퓨팅 |
| 2026-06-09 | [Neon 리뷰](Neon/Neon_review.md) | SaaS DB 무료 사용 |
| 2026-06-09 | [Vercel 분석](vercel/vercel_analysis.md) | 무료 SaaS 웹서버 |
| 2026-06-07 | [Ollama 설치 가이드](Local_LLM/Ollama_Install_Guilde.md) | 로컬 LLM 설치 가이드 |
| 2026-06-07 | [에이전트 친화 웹사이트 가이드](agent-friendly-website-guide/) | AI 에이전트 친화 웹 구축 가이드 |
| 2026-06-06 | [시크릿 스캐닝 LLM 하니스 프롬프트](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | 보안 문서 |
| 2026-06-04 | [MiniMax 코딩 가이드 + VS C# LLM 가이드](MiniMax%20Coding%20Guide/) | AI 코딩 어시스턴트 비교 가이드 |
| 2026-05-30 | [AWS 비용 절감 for CEO](AWS/Aws%20cost%20reduction%20for%20ceo.md) | 비용 절감 |
| 2026-05-27 | [Bigfive 시작하기](Bigfive/Bigfive%20getting%20started.md) | 빅파이브 가이드 |
| 2026-05-12 | [Cloudflare 무료 티어 가이드](CloudFlare/Cloudflare%20free%20tier%20guide.md) | 클라우드플레어 무료 티어 사용법 |
| 2026-05-09 | [Oracle Cloud 무료 티어 가이드](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) | 오라클 클라우드 무료 티어 사용법 |

---

## AI 에이전트 참고 사항

이 디렉토리는 가능한 한 시맨틱 구조를 따릅니다. 가장 빠른 기계 판독 진입점은 [llms.txt](llms.txt)를 참조하세요. 자체 `llms.txt` 파일이 있는 하위 디렉토리(예: `agent-friendly-website-guide/`)는 추가적인 구조화 색인을 제공합니다.

## 라이선스

개별 문서에 별도 명시가 없는 한, Dennis Kim이 작성한 문서는 참고 자료로 공유됩니다. `agent-friendly-website-guide/`는 CC BY 4.0으로 라이선스됩니다.
