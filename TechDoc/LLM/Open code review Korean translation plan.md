# Open Code Review — 한국어 번역 계획

> Upstream: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)  
> 기준 시점: 2026-07-12 (`main`)  
> 원칙: **한국어 1순위 → 일본어 2순위**  
> 관련 내부 가이드: [`Open code review guide.md`](./Open%20code%20review%20guide.md)

---

## 1. 목표

1. 공식 사이트(`pages/`)에서 한국어가 EN/ZH/JA와 동등하게 동작하게 한다.
2. README·CONTRIBUTING 한국어본을 EN과 섹션 동기화하고 용어를 통일한다.
3. VS Code 확장·예제·플러그인까지 확장하되, **사이트 → 문서 → 주변 도구** 순으로 진행한다.
4. 일본어는 이미 핵심이 갖춰져 있으므로, 한국어 완료 후 **드리프트 동기화·품질 QA·VS Code**를 2순위로 한다.

---

## 2. 현황 스냅샷

| 영역 | 한국어 (ko) | 일본어 (ja) | 비고 |
|------|-------------|-------------|------|
| `README.*.md` | ✅ 있음 | ✅ 있음 | KO: Path Filtering 등 일부 섹션/영문 헤딩 잔존 |
| `CONTRIBUTING.*.md` | ✅ 있음 | ✅ 있음 | KO: Setup/Branching 등 영문 혼용 |
| `pages/src/i18n/*.ts` | ❌ `ko.ts` 없음 | ✅ `ja.ts` (271키) | `Language = 'en' \| 'zh' \| 'ja'` |
| `pages/src/content/docs/` | ❌ 없음 | ✅ 17파일 | KO는 EN 폴백 |
| `pages/src/content/blog/` | ❌ 없음 | ✅ 1편 | |
| VS Code i18n | ❌ | ❌ | 현재 `en` + `zh-cn`만 |
| `plugins/.../CODEX.*.md` | ✅ | ❌ | |
| `examples/**/README.md` | ❌ | ❌ | EN만 |
| SECURITY / GOVERNANCE / ROADMAP | ❌ | ❌ | EN만 (낮은 우선순위) |

사이트 i18n 키 분포 (EN/ZH/JA 동일 271키):

| 그룹 | 키 수 |
|------|------:|
| `navbar` | 6 |
| `hero` | 7 |
| `highlights` | 15 |
| `usecases` | 8 |
| `features` | 15 |
| `benchmark` | 11 |
| `quickstart` | 19 |
| `footer` | 2 |
| `blog` | 8 |
| `docs` | 180 |
| **합계** | **271** |

참고: JA docs는 [PR #282](https://github.com/alibaba/open-code-review/pull/282)에서 추가됨. 사이트 docs 번역은 **zh를 1차 소스**(EN에 없는 내용 가능), README는 **en과 섹션 동기화** 후 번역하는 패턴이 확립되어 있음.

---

## 3. 공통 작업 규칙

1. **유지(번역 금지)**: CLI 명령·플래그·경로·패키지명·URL·코드 식별자  
   예: `ocr`, `ocr review`, `--from`, `--batch`, `~/.opencodereview`, `@alibaba-group/open-code-review`
2. **유지(고유명사)**: Open Code Review, Alibaba, Anthropic, OpenAI, DashScope, DeepSeek, Claude Code, MCP, AACR-BENCH, SEM.F1
3. **마크업 보존**: `<code>...</code>`, 줄바꿈 `\n`, 마크다운 링크·앵커·상대경로
4. **원문 소스**
   - 사이트 UI 문자열: `en.ts` 키 구조 + `zh.ts`/`ja.ts` 의미 참고
   - 사이트 docs MD: `zh` 우선, EN으로 교차 검증
   - README/CONTRIBUTING: `en` heading 단위 diff 후 번역
5. **검증 (`pages/`)**
   - `npm run typecheck`
   - `npm run build`
   - 언어 스위처에서 ko 전환 before/after 스크린샷 (프로젝트 PR 규칙)

---

## 4. 전체 로드맵 (한국어 우선)

```text
[KO Phase 1] 사이트 i18n 인프라 (ko.ts + Language 배선)
      ↓
[KO Phase 2] 사이트 docs 17파일 + index 연결
      ↓
[KO Phase 3] README / CONTRIBUTING 동기화·품질
      ↓
[KO Phase 4] 블로그 1편
      ↓
[KO Phase 5] VS Code 확장 (ko)
      ↓
[KO Phase 6] examples / plugins 보강 / 2차 문서
      ↓
[JA Phase A] EN/ZH 대비 drift 동기화 + 용어 QA
      ↓
[JA Phase B] VS Code 확장 (ja) + CODEX.ja + examples
```

### 4.1 KO Phase 1 — 사이트 언어 인프라 (최우선)

- `types.ts`에 `'ko'` 추가
- `ko.ts` 신설 (271키)
- `context.tsx`에 import / `SUPPORTED_LANGUAGES` / 브라우저 `ko` 감지
- Navbar 언어 스위처에 한국어 노출

### 4.2 KO Phase 2 — 사이트 docs 본문

`pages/src/content/docs/ko/` 17파일 + `docs/index.ts`의 `koDocs`.

번역 순서 (온보딩 → 심화):

1. `quickstart.md`
2. `installation.md`
3. `configuration.md`
4. `cli-reference.md`
5. `review-rules.md`
6. `viewer.md`
7. `integrations.md`
8. `integrations/ci.md`
9. `integrations/agent-skill.md`
10. `integrations/claude-code.md`
11. `integrations/subprocess.md`
12. `mcp.md`
13. `tools.md`
14. `architecture.md`
15. `telemetry.md`
16. `faq.md`
17. `contributing.md`

### 4.3 KO Phase 3 — 기존 루트 문서 품질

- `README.ko-KR.md`: EN 대비 누락 섹션(예: Path Filtering), 영문 헤딩(`Commands`, `Examples`, `Review Rules` 등) 정리
- `CONTRIBUTING.ko-KR.md`: `Setup`, `Branching`, `Code of Conduct` 등 잔여 영문·콩글리시 정리

### 4.4 KO Phase 4 — 블로그

- `pages/src/content/blog/ko/introducing-ocr-blog.md`
- `blog/index.ts`에 `koPosts` 연결

### 4.5 KO Phase 5 — VS Code

- `extensions/vscode/src/shared/i18n.ts`에 `ko` (또는 `ko-kr`) locale
- `package.nls.ko.json` (또는 `package.nls.ko-kr.json`)
- 확장 README 한국어본 (선택)

### 4.6 KO Phase 6 — 주변 문서

- `examples/**/README` 한국어
- 플러그인/스킬 보강 (CODEX.ko는 이미 있음)
- 선택: SECURITY / CODE_OF_CONDUCT / GOVERNANCE / ROADMAP

### 4.7 JA 2순위 (한국어 Phase 1~5 이후)

1. README/docs/i18n EN·ZH 대비 drift 점검
2. 용어·문체 QA
3. VS Code `ja` + `CODEX.ja-JP.md` + examples

---

## 5. Phase 1 한국어 용어집 초안

> 목적: `ko.ts`·docs·README에서 같은 개념을 같은 말로 쓰기.  
> 표기: **권장 한국어** / 필요 시 병기 `(English)` / **유지(원문)** 구분.

### 5.1 제품·고유명사 (유지)

| EN | KO 표기 |
|----|---------|
| Open Code Review | Open Code Review |
| OCR / `ocr` | OCR / `ocr` (명령은 코드 그대로) |
| Alibaba / Alibaba Group | Alibaba / Alibaba Group (필요 시 알리바바 병기) |
| Claude Code | Claude Code |
| Anthropic / OpenAI / DashScope / DeepSeek / Z.AI | 원문 유지 |
| MCP / Model Context Protocol | MCP / Model Context Protocol |
| AACR-BENCH / SEM.F1 / F1 | 원문 유지 |
| Pull Request / PR | Pull Request / PR |
| WebUI | WebUI |

### 5.2 핵심 도메인 용어

| EN | 권장 KO | 비고 / 금지안 |
|----|---------|---------------|
| code review | 코드 리뷰 | |
| review (동사/명사) | 리뷰 | “심사/검수” 지양 |
| Agent | Agent | UI에서는 병기 가능: Agent(에이전트). 과도한 음역 지양 |
| deterministic engineering | 결정적 엔지니어링 | JA「確定性」에 맞추되 KO는 기존 가이드 용어 유지 |
| hybrid architecture | 하이브리드 아키텍처 | |
| provider | 프로바이더 | “공급자/제공자”보다 프로바이더 (CLI UX와 일치) |
| built-in provider | 내장 프로바이더 | |
| custom provider | 커스텀 프로바이더 | |
| model | 모델 | |
| endpoint | 엔드포인트 | |
| API key | API 키 | |
| protocol | 프로토콜 | `anthropic` / `openai` 값은 원문 |
| workspace | 워크스페이스 | |
| staged / unstaged / untracked | 스테이징됨 / 미스테이징 / 추적되지 않음 | 표에서 짧게: staged / unstaged / untracked 병기 가능 |
| diff | diff | 본문에서 “차이(diff)” 첫 등장 병기 가능 |
| branch | 브랜치 | |
| commit | 커밋 | |
| ref | ref | |
| merge-base | merge-base | |
| changeset | 변경 세트 | |
| concurrency / concurrent | 동시성 / 동시 | |
| flag | 플래그 | |
| dry-run / preview | 미리보기(dry-run) | |
| scan | 스캔 | `ocr scan`은 명령 유지 |
| batch / batching | 배치 / 배칭 | 전략 값 `none` 등은 원문 |
| token / token budget | 토큰 / 토큰 예산 | |
| telemetry | 텔레메트리 | “원격 측정” 지양 |
| session | 세션 | |
| viewer | 뷰어 | Session Viewer → 세션 뷰어 |
| reflection (module) | 리플렉션 | 모듈명 성격, “반성” 지양 |
| positioning | 위치 지정 | comment positioning → 코멘트 위치 지정 |
| review rules | 리뷰 규칙 | |
| rule matching | 규칙 매칭 | |
| false positive | 오탐 | |
| precision / recall | 정밀도 / 재현율 | 벤치마크 표 헤더는 PRECISION/RECALL 유지 가능 |
| adoption rate | 채택률 | |
| benchmark | 벤치마크 | |
| quick start | 빠른 시작 | 내비는「빠른 시작」 |
| getting started | 시작하기 | |
| installation | 설치 | |
| configuration | 설정 | |
| verification | 검증 | |
| interactive setup | 대화형 설정 | |
| manual configuration | 수동 설정 | |
| integrations | 통합 | |
| contributing | 기여 | |
| architecture | 아키텍처 | |
| tools | 도구 | |
| table of contents | 목차 | |
| search | 검색 | |
| copy / copied | 복사 / 복사됨! | |
| learn more | 자세히 보기 | |
| get started | 시작하기 | |
| features | 기능 | Core Features → 핵심 기능 |
| use cases | 활용 사례 | |
| blog | 블로그 | |
| docs | 문서 | |
| footer copyright | © Copyright 2026. All rights reserved. | 원문 유지(JA와 동일) |

### 5.3 CLI·모드·플래그 관련

| EN | 권장 KO |
|----|---------|
| Workspace Mode | 워크스페이스 모드 |
| Branch Diff Mode | 브랜치 diff 모드 |
| Single Commit Mode | 단일 커밋 모드 |
| Agent Mode | Agent 모드 |
| Requirement Context | 요구사항 컨텍스트 |
| Flag Reference | 플래그 레퍼런스 |
| Output format | 출력 형식 |
| Output audience | 출력 대상 (`human` / `agent` 값 유지) |
| Built-in | 내장 |
| Current dir | 현재 디렉터리 |
| Whole repo | 전체 저장소 |

### 5.4 사이트 UI 카피 방향 (톤)

- **짧고 직접적**: 마케팅 과장·번역투(“~을 위한 것입니까?”)보다 개발자 문서 톤
- **존댓말**: 본문 설명은 합니다체, UI 버튼은 명사형/하다형 짧게 (`시작하기`, `자세히 보기`)
- **영문 병기**: 첫 등장에만 필요할 때. 같은 화면에서 반복 병기하지 않음
- **숫자·단위·브랜드 배지**: `20K+`, `1M+`, `1/9`, `> 30%`, `AACR-BENCH` 등 **값 그대로**

### 5.5 Phase 1용 내비·히어로 초안 문장

| Key | EN | KO 초안 |
|-----|----|---------|
| `navbar.features` | Features | 기능 |
| `navbar.benchmark` | Benchmark | 벤치마크 |
| `navbar.quickstart` | Quick Start | 빠른 시작 |
| `navbar.docs` | Docs | 문서 |
| `navbar.blog` | Blog | 블로그 |
| `navbar.getStarted` | Get Started | 시작하기 |
| `hero.title` | AI Code Review\nValidated on Millions of\nReal-World Tasks | AI 코드 리뷰\n수백만 실전 태스크로\n검증됨 |
| `hero.description` | Open Code Review brings Alibaba's… | Open Code Review는 Alibaba에서 검증된 코드 리뷰 Agent를 워크플로에 연결합니다. 원하는 LLM을 붙이고, 데이터는 비공개로 유지하며, 개발자가 실제로 채택하는 리뷰 코멘트를 받으세요. |
| `hero.quickStart` | Quick Start | 빠른 시작 |
| `hero.learnMore` | Learn More | 자세히 보기 |
| `hero.terminal` | Terminal | 터미널 |
| `hero.copied` | Copied! | 복사됨! |
| `hero.copyFailed` | Copy failed | 복사 실패 |
| `footer.brand` | Open Code Review | Open Code Review |
| `footer.copyright` | © Copyright 2026… | © Copyright 2026. All rights reserved. |

> 나머지 랜드페이지·docs 180키는 위 용어집을 따르며 `zh.ts`/`ja.ts`를 의미 참고용으로 사용. 확정 전 PR에서 리뷰어가 용어집 섹션만 먼저 코멘트해도 됨.

### 5.6 용어 미결(리뷰 포인트)

| 항목 | 후보 A | 후보 B | 권장 |
|------|--------|--------|------|
| Provider | 프로바이더 | 제공자 | **프로바이더** |
| Agent | Agent | 에이전트 | **Agent** (필요 시 병기) |
| Telemetry | 텔레메트리 | 원격 분석 | **텔레메트리** |
| Staged | 스테이징됨 | staged | 본문 **스테이징됨**, 표는 병기 |
| Deterministic | 결정적 | 확정적 | **결정적** (내부 가이드와 일치) |

---

## 6. `ko.ts` 스캐폴드 PR 계획 (KO Phase 1)

Upstream 저장소: `alibaba/open-code-review`  
권장 브랜치: `docs/add-korean-i18n-scaffold` 또는 `feat/pages-ko-i18n`  
권장 PR 제목: `docs(pages): add Korean (ko) i18n scaffold`

### 6.1 PR 목표 / 비목표

**목표**

- 사이트에서 언어를 `ko`로 전환 가능
- 랜드페이지·문서 셸·블로그 셸 문자열이 한국어로 표시
- 브라우저 언어 `ko*` 자동 감지 + localStorage `ocr-lang` 저장

**비목표 (다음 PR)**

- `pages/src/content/docs/ko/**` 본문 MD (Phase 2)
- README/CONTRIBUTING 수정 (Phase 3)
- VS Code (Phase 5)
- 일본어 변경

> docs 본문이 없어도 사이드바/검색 UI는 `ko.ts`로 한국어가 되고, MD 본문만 EN 폴백된다. Phase 1만으로도 언어 선택 UX는 완성된다.

### 6.2 변경 파일 체크리스트

| 파일 | 변경 |
|------|------|
| `pages/src/i18n/types.ts` | `Language`에 `'ko'` 추가 |
| `pages/src/i18n/ko.ts` | **신규** — `en.ts`와 동일 키, 한국어 값 |
| `pages/src/i18n/context.tsx` | `import { ko }`, `translations`, `SUPPORTED_LANGUAGES` |
| `pages/src/components/Navbar.tsx` | 언어 메뉴에 `한국어` / `ko` 항목 |
| (해당 시) 기타 하드코딩 언어 목록 | `en`/`zh`/`ja`만 나열한 곳 검색 후 보강 |

### 6.3 구현 순서 (커밋 단위 권장)

#### Commit 1 — 타입·배선 스캐폴드

1. `types.ts`: `export type Language = 'en' | 'zh' | 'ja' | 'ko';`
2. `ko.ts`를 **우선 EN 값 복사본**으로 생성 (`export const ko`) — 타입체크 통과용
3. `context.tsx` 연결:

```ts
import { ko } from './ko';
const translations: Record<Language, TranslationKeys> = { en, zh, ja, ko };
const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ja', 'ko'];
```

4. Navbar에 `{ code: 'ko', label: '한국어' }` 추가

#### Commit 2 — 고임팩트 UI 문자열 번역

순서대로 채우기 (용어집 §5 적용):

1. `navbar.*` (6)
2. `hero.*` (7)
3. `footer.*` (2)
4. `features.*` (15)
5. `highlights.*` + `usecases.*` (23)
6. `benchmark.*` (11)
7. `quickstart.*` (19)
8. `blog.*` (8)

#### Commit 3 — `docs.*` 180키

하위 순서:

1. `docs.sidebar.*`
2. `docs.search.*` / `docs.toc` / `docs.copy`
3. `docs.install*` / `docs.config*`
4. `docs.review*`
5. `docs.scan*`
6. `docs.viewer*` / `docs.mcp*` / `docs.env*`
7. 나머지 docs 키

### 6.4 키 패리티 검증 스크립트 (PR 전 로컬)

```bash
# pages/ 에서
node -e "
const fs=require('fs');
const keys=s=>[...s.matchAll(/'([^']+)':\s*'/g)].map(m=>m[1]);
const en=keys(fs.readFileSync('src/i18n/en.ts','utf8'));
const ko=keys(fs.readFileSync('src/i18n/ko.ts','utf8'));
const miss=en.filter(k=>!ko.includes(k));
const extra=ko.filter(k=>!en.includes(k));
console.log({en:en.length, ko:ko.length, miss, extra});
process.exit(miss.length||extra.length?1:0);
"
```

### 6.5 수동 QA 체크리스트

- [ ] 언어 스위처에 한국어 표시
- [ ] `ko` 선택 후 새로고침해도 유지 (localStorage)
- [ ] 브라우저 언어 `ko-KR`에서 최초 진입 시 `ko` 선택
- [ ] 랜딩: 내비/히어로/기능/벤치마크/퀵스타트/푸터
- [ ] Docs 페이지: 사이드바·검색 플레이스홀더·목지 라벨 한국어, 본문은 EN 폴백(의도)
- [ ] Blog 목록/검색 셸 한국어
- [ ] HTML 이스케이프: `docs.*`의 `<code>` 깨짐 없음
- [ ] `npm run typecheck` / `npm run build` 통과
- [ ] PR에 before/after 스크린샷 (랜딩 + docs 사이드바)

### 6.6 PR 본문 템플릿

```markdown
## Background
공식 사이트 i18n은 en/zh/ja만 지원합니다. README.ko-KR은 있으나 pages에 ko가 없어
사이트 언어 전환이 불가능합니다.

## Changes
- Add `pages/src/i18n/ko.ts` (271 keys, parity with en/zh/ja)
- Extend `Language` / `LanguageProvider` / Navbar switcher for `ko`
- Browser language detection for `ko*`

## Out of scope
- `pages/src/content/docs/ko/**` (follow-up)
- README/CONTRIBUTING edits
- VS Code / examples

## Verification
- [ ] npm run typecheck
- [ ] npm run build
- [ ] Screenshots: landing + docs sidebar in Korean
```

### 6.7 후속 PR 쪼개기 (Phase 1 이후)

| PR | 내용 | 의존 |
|----|------|------|
| **KO-1** | `ko.ts` 스캐폴드 + 배선 (본 문서 §6) | 없음 |
| **KO-2a** | docs/ko 온보딩 4종: quickstart, installation, configuration, cli-reference | KO-1 |
| **KO-2b** | docs/ko 나머지 13종 + `docs/index.ts` | KO-2a 또는 KO-1 |
| **KO-3** | README.ko-KR / CONTRIBUTING.ko-KR 동기화·용어 정리 | 용어집 확정 |
| **KO-4** | blog/ko + blog index | KO-1 |
| **KO-5** | VS Code `ko` nls + i18n.ts | 용어집 |
| **KO-6** | examples 한국어 (선택) | KO-3 |
| **JA-1** | JA drift/QA | KO 핵심 완료 후 |
| **JA-2** | VS Code `ja` + CODEX.ja + examples | JA-1 |

---

## 7. 리스크·주의사항

1. **키 드리프트**: upstream이 자주 릴리스되므로 PR 직전에 `en.ts`와 키 diff 재확인.
2. **docs 폴백 UX**: Phase 1만 머지되면 사이드바는 KO·본문은 EN. PR 설명에 명시해 리뷰어 혼란 방지.
3. **용어 불일치**: README.ko-KR 기존 문체(영문 혼용)와 `ko.ts` 톤이 다를 수 있음 → Phase 3에서 README를 용어집에 맞춤.
4. **HTML in strings**: `docs.reviewDesc` 등 `<code>` 포함 키는 번역 후 태그 쌍 검증.
5. **CLA**: upstream 기여 시 Alibaba CLA 서명 필요.

---

## 8. 즉시 다음 액션

1. 이 문서 §5 용어집 미결 항목(프로바이더/Agent/텔레메트리) 확정
2. upstream fork에서 **KO-1 (`ko.ts` 스캐폴드 PR)** 진행
3. KO-1 머지 후 KO-2a(docs 온보딩) 착수
4. 한국어 Phase 1~5 안정화 후 일본어 2순위 착수

---

## 9. 참고 링크

- Repo: https://github.com/alibaba/open-code-review
- Site: https://alibaba.github.io/open-code-review/
- i18n: `pages/src/i18n/{en,zh,ja,context,types}.ts`
- Docs index: `pages/src/content/docs/index.ts`
- JA docs PR: https://github.com/alibaba/open-code-review/pull/282
- 기존 KO README: `README.ko-KR.md`
- 기존 KO CODEX: `plugins/open-code-review/CODEX.ko-KR.md`
