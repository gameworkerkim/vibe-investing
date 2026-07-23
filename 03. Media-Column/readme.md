# 미디어 칼럼 (Media Column)

전자신문 · ZDNet Korea · 벤처스퀘어 등 **외부 미디어에 게재된 김호광 칼럼** 아카이브입니다.

- **사이트:** [docs.vibequant.cc/columns](https://docs.vibequant.cc/columns/) — 그룹「미디어 · …」로 필터 · 검색
- **원천:** 이 폴더의 Markdown → `VibeQuant/content` 빌드 → Cloudflare Pages
- **가이드:** 메타는 HTML 주석(`<!-- -->`) 안 YAML. 본문 상단에 **발행일 · 미디어 · 주제**, 하단에 **원문 링크**. ([COLUMN_GUIDELINE](../02.Investment%20Idea%20Column/COLUMN_GUIDELINE.md) 참고)

> `_catalog.mjs` / `_ingest.mjs` 로 일괄 생성. `FETCH=1 node _ingest.mjs` 시 원문 URL이 있으면 본문 일부를 가져옵니다.

---

## 추천 (Featured)

| 날짜 | 미디어 | 제목 | 주제 |
|------|--------|------|------|
| 2026-02-23 | 전자신문 | 인공지능 실체화와 능동형 에이전트, 노동의 종말인가? | AI · 에이전트 |
| 2026-02-09 | 전자신문 | 미국 AI 빅테크, '돈 버는 AI'로의 전환 | 버티컬 AI |
| 2026-02-02 | 전자신문 | 피지컬 AI · 유니트리 | 로봇 · 피지컬AI |
| 2025-12-08 | 전자신문 | 해킹의 계절 (업비트·라자루스) | 보안 · 거래소 |
| 2025-11-24 | 전자신문 | 비트코인 급락 · MSCI 퇴출 공포 | 가상자산 · 매크로 |
| 2025-11-03 | 전자신문 | 치맥 회동 · 반도체 전쟁 | 반도체 · 지정학 |
| 2025-09-29 | 전자신문 | 네이버–두나무 · 업비트 빅딜 | 핀테크 |
| 2025-07-14 | 전자신문 | 테라-루나 · 알고리즘 스테이블 | 스테이블코인 |
| 2025-06-26 | 전자신문 | GENIUS Act 이후 스테이블 | 규제 · 원화 |
| 2025-05-15 | 전자신문 | AI 코딩 · 시니어 개발자 | 바이브코딩 |

검색: 사이트에서 `미디어` 또는 `전자신문` · `스테이블` · `해킹` 등으로 AND 검색.

---

## 주제별 폴더 (검색·SEO)

| 폴더 | 그룹 ID | 다루는 키워드 |
|------|---------|----------------|
| [AI/](./AI/) | `media-ai` | AI, 피지컬AI, 딥시크, 바이브코딩, 소버린AI, 노동 |
| [Crypto-Stablecoin/](./Crypto-Stablecoin/) | `media-crypto` | 비트코인, 스테이블, GENIUS, 거래소, STO, MSCI |
| [Security/](./Security/) | `media-security` | 해킹, 라자루스, 스미싱, 패스워드, 북한, FDS |
| [Blockchain-P2E/](./Blockchain-P2E/) | `media-blockchain` | NFT, P2E, 메인넷, 클레이튼, 투표 |
| [Macro-Policy/](./Macro-Policy/) | `media-macro` | 관세, 트럼프, 반도체, 정책 |
| [Society-Culture/](./Society-Culture/) | `media-society` | 영화, 아트, 플랫폼, 헬스케어 |

각 MD 파일명: `YYYY-MM-DD-제목슬러그.md` — 날짜·제목이 파일명에 포함되어 GitHub·sitemap·검색에 유리합니다.

---

## 미디어별

| 미디어 | 대략 시기 | 비고 |
|--------|-----------|------|
| **전자신문** | 2022, 2024-05~2026-02 | 네이버 뉴스 검색 다수 |
| **ZDNet Korea** | 2014~2020 | 보안·블록체인 기고 |
| **벤처스퀘어** | 2018 | 게임×블록체인·ICO |

---

## 새 칼럼 추가

1. `_catalog.mjs`에 항목 추가 (`date`, `media`, `folder`, `title`, `topics`, `url`)
2. `node _ingest.mjs` (또는 `FETCH=1 node _ingest.mjs`)
3. `cd VibeQuant/content && npm run build` (또는 배포 파이프라인)

파일 직접 작성 시 상단 주석 YAML에 `media`, `source_url`, `tags`, `group`, `date` 를 넣고, 본문 상단/하단 형식을 기존 글과 맞추세요.

---

*카탈로그 기준일: 2026-07-23 (네이버 뉴스「김호광 칼럼」검색)*
