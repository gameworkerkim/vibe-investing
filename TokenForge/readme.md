# TokenForge — 주요 기능

> 한국어·외국어 코딩 프롬프트를 **DeepSeek(무료 tier)**으로 **caveman-ultra 영어**로 최적화하고,
> **Claude / ChatGPT** 토큰 절약·비용을 예측하는 **웹 브라우저 변환기** + **스킬 빌더**.
> Cloudflare Pages **free tier** (정적 페이지 + Pages Functions + KV 기억).
>
> **대시보드**: [vibequant.cc/lab](https://vibequant.cc/lab/) (VibeQuant Lab · TokenForge 탭). DeepSeek 키는 Play Worker(`vibequant-api`) 시크릿을 재사용합니다.
> 영어 출력은 [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) ultra 스타일 — *"Why use many token when few token do trick?"*

**참고**: 이 폴더는 메인 `vibe-investing` 레포의 서브 프로젝트로, 독립 실행됩니다. 개념 검증·시장 리서치는 [`docs/RESEARCH.md`](docs/RESEARCH.md), Phase 2(WIKI+RAG)는 [`docs/PHASE2_WIKI.md`](docs/PHASE2_WIKI.md) 참고.

---

## 1. 왜 필요한가

- 코딩 에이전트(Claude Code, ChatGPT)는 **영어 프롬프트가 한국어보다 토큰 효율이 좋고**, 프롬프트의 50~70%는 군더더기입니다.
- "한국어로 생각 → 영어로 최적화"를 한 번에: 번역 + 토큰 압축 + 품질 유지를 **하나의 워크플로**로 처리합니다.

## 2. 핵심 워크플로 (6단계)

| # | 단계 | 동작 | 구현 |
|---|------|------|------|
| 1 | **전체 계획 프롬프트 설명** | 목표를 넣으면 AI가 프로젝트를 목표→제약→산출물→단계→리스크로 분해하는 "마스터 전체 계획 프롬프트"(영어)를 만들고, 분해 원리를 한국어로 설명 | `POST /api/plan` |
| 2 | **기억(Memory)** | 계획·세부 프롬프트·위키 스니펫 저장/검색. Cloudflare KV(기본) 또는 Upstash Redis(옵션), 미구성 시 브라우저 localStorage 폴백 | `POST/GET/DELETE /api/memory`, `shared/storage.ts` |
| 3 | **세부 프롬프트 작성** | 각 단계의 세부 프롬프트를 **한국어/일본어/중국어/기타** 원하는 언어로 작성·편집 | UI(②계획 탭) |
| 4 | **DeepSeek 영어 최적화** | 원문을 대상 모델(Claude/ChatGPT)에 맞춘 **caveman-ultra 영어**로 재작성(관사·인사·필러 제거, 요구사항 100% 보존) + 변경 이유(ko)·추천 반환 | `POST /api/optimize` · Worker `POST /api/v1/tokenforge/optimize` |
| 5 | **토큰 절약 예상도** | 원문 vs 최적화문의 **토큰 수·절약율·비용**을 Claude/ChatGPT 각각 표시. 기본은 임베디드 추정기, ChatGPT는 **tiktoken CDN 정밀모드**(o200k) 선택 가능 | `frontend/lib/tokens.js` |
| 6 | **스킬로 만들기** | 계획 + 최적화 프롬프트 번들을 **SKILL.md**(Claude·opencode 스킬 포맷)로 생성·다운로드 | UI(⑤스킬 탭), `shared/prompts.ts` |

### 대시보드 화면
① 워크플로 · ② 계획 · ③ 최적화(Forge) · ④ 기억 · ⑤ 스킬 · ⚙️ 설정(API 키/base URL/모델/가격/정밀도)

## 3. 기술 스택

- **프론트**: vanilla HTML/CSS/JS(빌드 불필요) — Cloudflare Pages가 정적 서빙
- **API**: Pages Functions (`functions/api/*`) — DeepSeek 프록시(키는 서버 시크릿 또는 클라이언트 헤더) + 기억 CRUD
- **기억**: Cloudflare KV `TF_MEMORY` (기본) / Upstash Redis REST (옵션) / localStorage (폴백)
- **LLM**: DeepSeek (OpenAI 호환), 모델 기본 `deepseek-v4-flash`, 환경변수로 변경 가능(`deepseek-chat` 등)
- **토큰**: 임베디드 휴리스틱 + `gpt-tokenizer`(CDN) 정밀 계수
- **테스트**: vitest(**25 tests**) + `tsc --noEmit` — mock이 한글을 영어 래퍼에 남기지 않고 실제로 토큰을 줄이는지는 `tests/savings.test.ts`가 검증

## 4. 빠른 시작 (로컬, 키 없이 mock 가능)

```bash
npm install
npm run dev        # wrangler pages dev → http://127.0.0.1:8788
```

- DeepSeek 키 없이도 **mock 모드**로 계획/최적화 UI를 체험할 수 있습니다.
- 키가 있으면 `⚙️ 설정`에 입력하거나 `.dev.vars`/시크릿으로 설정하세요.

## 5. 배포 (Cloudflare Pages free tier)

```bash
npx wrangler kv namespace create TOKENFORGE_MEMORY   # KV 생성
# wrangler.toml 의 [[kv_namespaces]].id 를 반환값으로 교체
npx wrangler pages secret put DEEPSEEK_API_KEY        # 선택 (없으면 BYOK/mock)
npm run deploy
```

| 항목 | 비용 | 비고 |
|------|------|------|
| Pages 정적 + Functions | 무료 | 무료 한도 내 |
| KV 기억 | 무료 티어 100k 읽기/1k 쓰기/일 | 개인 사용 충분, 초과 시 Upstash |
| DeepSeek API | 무료/유료 tier 선택 | 키 없으면 mock |

## 6. 환경 변수 (`wrangler.toml`·`.dev.vars`)

| 변수 | 기본 | 설명 |
|------|------|------|
| `DEEPSEEK_API_KEY` | — | DeepSeek 키 (없으면 mock/live 판정은 자동) |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | OpenAI 호환 베이스 |
| `DEEPSEEK_MODEL` | `deepseek-v4-flash` | 모델명 (구버전 `deepseek-chat`) |
| `UPSTASH_REDIS_REST_URL`/`_TOKEN` | — | 설정 시 KV 대신 Upstash 기억 |
| `NEON_DATABASE_URL` | — | (Phase 2 예정) Neon Postgres |

## 7. API

### Pages Functions (독립 앱 `TokenForge/`)

| 메서드 | 경로 | 동작 |
|--------|------|------|
| GET | `/api/health` | 모드(live/mock)·저장소·모델 |
| POST | `/api/plan` | 전체 계획 프롬프트 + 단계 생성 |
| POST | `/api/optimize` | 한국어/외국어 → caveman-ultra 영어 + 추천 |
| GET/POST/DELETE | `/api/memory` | 기억 조회(검색)/저장/삭제 |

요청 헤더 `x-deepseek-key` 로 클라이언트 키(BYOK) 전달 가능.

### VibeQuant Worker (Lab · `api.vibequant.cc`)

Play와 **같은** `DEEPSEEK_API_KEY`를 쓰지만 **금융 게이트 없음**(코딩 프롬프트 변환기). IP 쿨다운 ~12초. Lab 기억은 브라우저 localStorage (`backend: none`).

| 메서드 | 경로 | 동작 |
|--------|------|------|
| GET | `/api/v1/tokenforge/health` | `mode` live/mock · DeepSeek 설정 여부 |
| POST | `/api/v1/tokenforge/plan` | 전체 계획 |
| POST | `/api/v1/tokenforge/optimize` | caveman-ultra 영어 최적화 |
| GET/POST/DELETE | `/api/v1/tokenforge/memory` | Worker는 저장소 없음 — Lab이 localStorage 사용 |

Worker 미배포 시 Lab UI는 클라이언트 mock으로 폴백합니다. 배포: `cd VibeQuant/cloudflare && ./scripts/deploy.sh`.

## 8. 개발 명령

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```

## 9. 로드맵

- [x] **Phase 1**: 번역+토큰 최적화 변환기, 기억, mock/live 듀얼 모드, 스킬 빌더
- [x] **Lab 대시보드**: [vibequant.cc/lab](https://vibequant.cc/lab/) TokenForge 탭 (Play 톤의 Syne/IBM Plex UI). 소스 `VibeQuant/pages-lab/` → 배포 복사본 `VibeQuant/pages/lab/`
- [x] **Worker API**: `GET/POST /api/v1/tokenforge/*` — Play DeepSeek 키 재사용, 금융 게이트 없음
- [x] **Caveman ultra**: 영어 `optimized_prompt`는 관사·인사·ROLE/TASK 보일러플레이트 없이 전보체. mock도 CJK를 영어 래퍼에 남기지 않음 (`shared/mock.ts`)
- [ ] Phase 1.5: 다중 프롬프트 일괄 최적화, 계획 단계 ↔ 최적화 결과 바인딩 자동화
- [ ] **Phase 2 (WIKI+RAG)**: 프로젝트 전반 WIKI(Neon Postgres) → 임베딩 → 유사도 검색으로 프롬프트 개선·추천 — [`docs/PHASE2_WIKI.md`](docs/PHASE2_WIKI.md)
- [ ] 개인화: 자주 쓰는 스타일·용어 학습, 사용 이력 기반 추천
- [ ] 공개: 오픈소스 커뮤니티 WIKI
- [ ] Lab 탭: VaultGuard · MY-IP (곧)

## 주의

- 토큰 수치는 **예상치**(±15%)이며 실제 토크나이저와 다를 수 있습니다. ChatGPT는 정밀모드에서 실제 o200k_base 사용.
- 과도한 압축은 품질을 해칠 수 있어 **의미 보존**을 최우선으로 합니다. caveman은 **문체**(관사·공손·필러)만 줄이고 요구사항·경로·코드는 그대로 둡니다.
- 본 프로젝트는 연구 목적입니다.
