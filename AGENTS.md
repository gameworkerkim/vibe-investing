# AGENTS.md — vibe-investing

> AI 퀀트 투자 전략 · 칼럼 · 논문 · 도구를 모은 연구 레포. 대부분 Markdown 문서이며, 코드 프로젝트 3개가 각각 독립적으로 존재.

## 파일 이름 규칙

- 디렉토리·파일명에 **공백, 콜론, 한글, em dash(—), 괄호** 포함. glob/bash 등 모든 경로 인자에 **반드시 따옴표** 사용.
- 예: `"01.Trading Strategy/ARDS — Adaptive Recession-Defensive Strategy for AI_QQQ/"`

## 코드 프로젝트 (각각 독립 실행)

| 프로젝트 | 경로 | 언어 | 실행 | 테스트 |
|---|---|---|---|---|
| Toss AMQS 대시보드 | `Toss/` | Node.js (Express) | `npm install && npm start` | 없음 |
| AIInvestor (증권당) | `AIInvestor/` | Python (Azure Functions) | `pip install -r requirements.txt` | `pytest` (211 tests) |
| Vibe Invest Dashboard | `01.Trading Strategy/Vibe_Invest_Dashboard/` | TS (Cloudflare Pages+Workers) | `npm install && npm run dev` | `npm test` (vitest) |
| ARDS-X 레짐 분류기 | `01.Trading Strategy/ARDS — Adaptive Recession-Defensive Strategy for AI_QQQ/quant/` | Python | `pip install -r requirements.txt && python run.py` | 없음 |
| LAON VaultGuard | `LAON_VaultGuard/` | Node.js/TS (Express) | `npm install && npm run dev` (port 3101) | `npm test` (vitest) + `npm run backtest` |
| CASSANDRA AI | `CASSANDRA AI/` | TS (Next.js 15 + Prisma) | `npm install && npm run dev` | 없음 |
| toss-dashboard | `toss-dashboard/` | TS (Next.js 15 + Drizzle) | `npm install && npm run dev` | 없음 |

**중요**: 각 프로젝트는 루트가 아닌 **자기 폴더에서** 실행. 루트에 통합 빌드/테스트 없음.

- `Toss/` → Node ≥18, Express. `TOSS_CLIENT_ID`/`TOSS_CLIENT_SECRET` env 없으면 MOCK 모드.
- `AIInvestor/` → Python 3.11+ (CI는 3.11 사용). `AIInvestor/.venv` 또는 격리 venv.
- `Vibe_Invest_Dashboard/` → `esbuild`로 번들, `vitest`로 테스트, `tsc --noEmit` 타입체크. Cloudflare 계정 없이 로컬 모드+mock 가능.
- ARDS-X는 루트 `.venv`(pandas 등) 사용. FRED CSV + yfinance 데이터 (API 키 불필요).
- `LAON_VaultGuard/` → Node ≥18, TS+Express. 멀티 LLM(Claude·DeepSeek·GPT·MiniMax·Ollama) 교차검증 시크릿 스캐너. npm 패키지 `laon-vaultguard` 배포. `npm test`(vitest)·`npm run backtest`(54 tests). Ollama 오프라인 모드 지원, `docker-compose up -d` 가능.
- `CASSANDRA AI/` → Next.js 15 + Prisma(PostgreSQL/Neon) + Upstash Redis. DART OpenAPI 키·DeepSeek API 키·DB env 필요. Vercel 배포. 테스트 없음.
- `toss-dashboard/` → Next.js 15 + Drizzle ORM + Neon + Upstash Redis. `Toss/`(Express)와 별개의 Next.js 버전. 테스트 없음.

## git workflow

- 브랜치: `main` (CI에서 `main`/`dev` push → AIInvestor 자동 배포)
- 커밋 전 `.env` 파일이 스테이징되지 않았는지 확인할 것 (`.gitignore`에 `.env` 포함됨)
- AIInvestor 배포 CI: `.github/workflows/deploy-aiinvestor.yml` — `AIInvestor/**` 변경 시 자동 트리거

## 주의사항

1. **이 레포는 연구 목적**. 모든 코드는 실제 자금 운용 전 검증 필요. Disclaimer 섹션 참조.
2. **Vibe_Invest_Dashboard/CLAUDE.md** — 대시보드 아키텍처 규칙 (오직 무료 티어, LLM은 뉴스 요약 전용, CDN 캐시 우선 등). 해당 디렉토리 작업 시 반드시 읽을 것.
3. **Python venv**: 루트 `.venv`와 AIInvestor `.venv`는 별도 환경. 루트 `.venv`는 전략 스크립트용, `AIInvestor/.venv`는 Azure Functions용.
4. **opencode.json** 존재 — 모든 git 명령어는 실행 전 확인(`ask`). agent가 자동으로 git push/commit하지 않음.
5. **레포 전체가 한국어 기반**. 영문 README는 `Readme en.MD`. 칼럼·논문 대부분 한국어.
