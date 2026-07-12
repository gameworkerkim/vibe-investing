# Open Code Review — 한국어 번역 기여 계획 / Korean Translation Contribution Plan

> **참고 / Note**: 본 계획은 PR #282에서 이미 추가된 일본어 docs 사례와 프로젝트 구조를 참고하여 수립했습니다. / This plan was drafted by referencing the Japanese docs and project structure already added in PR #282.

---

## 현재 상태 요약 / Current Status Summary

**KO** — 언어별·영역별 번역 커버리지 현황입니다.
**EN** — Translation coverage by area and language.

| 영역 / Area | 일본어 / Japanese (ja) | 한국어 / Korean (ko) | 비고 / Notes |
|------|-------------|-------------|------|
| **README.\*.md** | O 있음 / Present (EN과 구조 거의 동일 / structure nearly identical to EN) | O 있음 / Present | 일부 섹션·제목 누락, 영문 잔존 / Some sections/titles missing, English remnants |
| **CONTRIBUTING.\*.md** | O 있음 / Present | O 있음 / Present | 영문 혼용 많음 / Frequent English mixing |
| **사이트 UI / Site UI** (`pages/src/i18n/*.ts`) | O `ja.ts` (271키 / 271 keys, EN/ZH 완전 대응 / fully mapped) | X 없음 / None | Language 타입도 `en\|zh\|ja`만 / Language type only has `en\|zh\|ja` |
| **사이트 문서 / Site docs** (`pages/src/content/docs/`) | O 17개 전부 / All 17 files | X 없음 / None | → EN 폴백 / falls back to EN |
| **사이트 블로그 / Site blog** | O 1편 / 1 post | X 없음 / None | |
| **VS Code 확장 i18n / VS Code extension i18n** | X (`en`, `zh-cn`만 / only) | X | |
| **plugins/.../CODEX.\*.md** | X | O `CODEX.ko-KR.md` | |
| **examples/ README** | X EN만 / EN only | X EN만 / EN only | |
| **SECURITY / GOVERNANCE / ROADMAP** | X EN만 / EN only | X EN만 / EN only | |

---

## 번역 우선순위 (Phase별) / Translation Priority (by Phase)

### Phase 0 — 공통 규칙 (사전 준비) / Common Rules (Prerequisites)

**KO**
- **원문 소스 / Source of truth**:
  - 사이트 docs: `zh` 우선 (EN에 없는 내용이 있을 수 있음)
  - README/CONTRIBUTING: `en`과 섹션 동기화 후 번역
- **유지 항목 (번역하지 않음) / Do NOT translate**:
  - CLI 명령어·플래그: `ocr`, `--batch`, `--config`, `--format`, `--output` 등
  - 경로: `~/.opencodereview`, `./.opencodereview/`, `extensions/vscode/` 등
  - 패키지명: `@alibaba/open-code-review`, `@modelcontextprotocol/sdk` 등
  - URL: `https://github.com/...`, `https://alibaba.github.io/open-code-review`
  - 코드 블록 전체 (예제 코드, JSON/YAML 설정)
- **용어집 선정**: `Glossary.md` 참조
- **검증 / Verification**:
  - `pages/` 변경 시: `npm run typecheck` + `npm run build`
  - 언어 전환 스크린샷 (프로젝트 기여 규칙 준수)

**EN**
- **Source of truth**:
  - Site docs: prefer `zh` (may contain content not present in EN)
  - README/CONTRIBUTING: sync sections with `en` first, then translate
- **Items to keep untranslated**: CLI commands/flags, paths, package names, URLs, and entire code blocks (as listed above)
- **Terminology**: see `Glossary.md`
- **Verification**: run `npm run typecheck` + `npm run build` for `pages/` changes; attach language-switch screenshots per project rules

---

### Phase 1 — 한국어 사이트 언어 인프라 (최우선) / Korean Site Language Infrastructure (Top Priority)

**KO — 이유**: 사용자 유입의 공식 사이트(`alibaba.github.io/open-code-review`)가 KO로 제공되어야 함.
**EN — Rationale**: The official site (`alibaba.github.io/open-code-review`), the main user entry point, must be available in Korean.

#### 작업 항목 / Tasks

1. **`pages/src/i18n/types.ts`** 에 `'ko'` 추가 / Add `'ko'`
2. **`pages/src/i18n/ko.ts`** 신설 (EN/ZH/JA 271키 전체) / Create new file with all 271 keys
3. **`pages/src/contexts/i18n/context.tsx`**:
   - `ko` import
   - `SUPPORTED_LANGUAGES`에 `ko` 추가 / Add `ko`
   - 브라우저 언어 감지에 `ko` 연결 / Wire `ko` into browser language detection
4. **Navbar** 언어 스위처에 "한국어" 노출 / Expose "한국어" in the language switcher

#### 번역 키 그룹 순서 (체감 임팩트 순) / Translation Key Group Order (by perceived impact)

| 순서 / Order | 키 그룹 / Key Group | 키 수 (추정) / Keys (est.) | 설명 / Description |
|------|---------|-------------|------|
| 1 | `navbar` / `hero` / `footer` | ~30 | 메인 내비게이션, 히어로, 푸터 / Main nav, hero, footer |
| 2 | `features` / `highlights` / `usecases` | ~40 | 기능 소개, 하이라이트, 사용 사례 / Features, highlights, use cases |
| 3 | `benchmark` / `quickstart` | ~20 | 성능 비교, 퀵스타트 / Benchmark, quickstart |
| 4 | `docs.*` (사이드바·문서 UI) | ~180 | 문서 내비게이션, UI 문자열 / Docs nav, UI strings |
| 5 | `blog.*` | ~10 | 블로그 관련 문자열 / Blog strings |

---

### Phase 2 — 한국어 사이트 문서 본문 / Korean Site Documentation Body

**KO** — **`pages/src/content/docs/ko/`** 에 EN/ZH/JA와 동일한 17개 파일 생성
**EN** — Create the same 17 files as EN/ZH/JA under **`pages/src/content/docs/ko/`**

#### 문서 번역 순서 (온보딩 → 심화) / Doc Translation Order (onboarding → advanced)

| 순서 / Order | 파일 / File | 내용 / Content |
|------|------|------|
| 1 | `quickstart.md` | 퀵스타트 가이드 / Quickstart guide |
| 2 | `installation.md` | 설치 방법 / Installation |
| 3 | `configuration.md` | 설정 옵션 / Configuration options |
| 4 | `cli-reference.md` | CLI 명령어 참조 / CLI reference |
| 5 | `review-rules.md` | 리뷰 규칙 / Review rules |
| 6 | `viewer.md` | 뷰어 사용법 / Viewer usage |
| 7 | `integrations.md` | 통합 개요 / Integrations overview |
| 8 | `integrations/ci.md` | CI 통합 / CI integration |
| 9 | `integrations/agent-skill.md` | Agent Skill 통합 / Agent Skill integration |
| 10 | `integrations/claude-code.md` | Claude Code 통합 / Claude Code integration |
| 11 | `integrations/subprocess.md` | 서브프로세스 통합 / Subprocess integration |
| 12 | `mcp.md` | MCP (Model Context Protocol) |
| 13 | `tools.md` | 도구 / Tools |
| 14 | `architecture.md` | 아키텍처 / Architecture |
| 15 | `telemetry.md` | 텔레메트리 / Telemetry |
| 16 | `faq.md` | 자주 묻는 질문 / FAQ |
| 17 | `contributing.md` | 기여 가이드 / Contributing guide |

> **KO** — 이후 `pages/src/content/docs/index.ts`에 `koDocs` 등록 (`docsMap.ko`)
> **EN** — Then register `koDocs` in `pages/src/content/docs/index.ts` (`docsMap.ko`)

---

### Phase 3 — 한국어 기존 문서 품질/동기화 / Korean Existing Docs Quality & Sync

**KO** — 이미 존재하나 EN 대비 갭이 있는 파일들 정리
**EN** — Clean up files that already exist but have gaps compared to EN

#### README.ko-KR.md

- **누락된 섹션 보강 / Fill missing sections**:
  - `### Path Filtering`
  - `### Output Formats`
  - `### Exit Codes`
- **영문 제목 정리 / Clean up English titles**:
  - `Commands` → `명령어`
  - `Examples` → `예제`
  - `Review Rules` → `리뷰 규칙`
  - `Telemetry` → `텔레메트리`
  - `Contributing` → `기여하기`
- **KO** — EN 최신 섹션과 heading 단위 diff 후 보강 / **EN** — Diff against the latest EN headings and fill gaps

#### CONTRIBUTING.ko-KR.md

- **KO** — Setup, Branching, Code of Conduct 등 잔여 영문 헤딩·용어 정리
- **EN** — Clean up remaining English headings/terms (Setup, Branching, Code of Conduct, etc.)
- **KO** — 프로젝트 특화 규칙 (Commit Convention, PR Template 등) 반영
- **EN** — Reflect project-specific rules (Commit Convention, PR Template, etc.)

#### 블로그 / Blog

- **KO** — `pages/src/content/blog/ko/introducing-ocr-blog.md` 생성 / `pages/src/content/blog/index.ts`에 `ko` 연결
- **EN** — Create `pages/src/content/blog/ko/introducing-ocr-blog.md`; wire `ko` into `pages/src/content/blog/index.ts`

---

### Phase 4 — 일본어 유지보수·품질 (신규 대량 번역보다 QA) / Japanese Maintenance & Quality (QA over new bulk translation)

**KO** — JA 핵심은 완료되었으나, 품질 및 동기화 점검 필요
**EN** — Japanese core is done, but quality and sync checks are needed

- **동기화 점검 / Sync check**: EN/ZH 신규 커밋 대비 README.ja-JP.md, docs/ja/*, i18n/ja.ts drift 확인 / Check drift against new EN/ZH commits
- **품질 패스 / Quality pass**:
  - 용어 통일 (기계번역 티 나는 문장 개선) / Unify terminology, improve machine-translated phrasing
  - 명령·플래그 오역 검수 / Review command/flag mistranslations
- **블로그·docs frontmatter** title·summary 일관성 / Consistency of blog/docs frontmatter title & summary

---

### Phase 5 — VS Code 확장 (양쪽 공통) / VS Code Extension (both languages)

**KO** — 제품 UI 노출이 크므로 docs 다음 우선순위
**EN** — High product-UI exposure, so next priority after docs

| 작업 / Task | 파일·위치 / File & Location |
|------|----------|
| Locale 추가 / Add locales | `extensions/vscode/src/shared/i18n.ts`에 `ja`, `ko` 추가 |
| Package NLS | `package.nls.ja.json`, `package.nls.ko.json` 생성 / create |
| README | `README.ja-JP.md`, `README.ko-KR.md` (확장용 / for extension) |
| 문자열 그룹 순서 / String group order | `Idle/Running/Done` → `Config` → `EnvSetup` → `CustomProvider` → 에러·토스트 / errors & toasts |

---

### Phase 6 — 플러그인·예제·2차 문서 (낮은 우선순위) / Plugins, Examples & Secondary Docs (low priority)

- **`plugins/open-code-review/`**:
  - JA용 `CODEX.ja-JP.md` (KO는 이미 있음 / KO already exists)
  - `commands/review.md`, `skills/.../SKILL.md` 다국어 (필요 시 / if needed)
- **`examples/github_actions | gitlab_ci | gitflic_ci/README.md`** → `ko`/`ja`
- 선택적 / Optional: `SECURITY.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `ROADMAP.md` 번역 / translation

---

## 언어별 "해야 할 일" 한눈에 / To-Do at a Glance by Language

### 한국어 (KO) — 우선순위 순서 / Korean — priority order

| 순서 / Order | 작업 / Task |
|------|------|
| 1 | 사이트 i18n (`ko.ts` + 언어 스위치) / Site i18n (`ko.ts` + language switch) |
| 2 | 사이트 docs 17개 + `index` 연결 / 17 site docs + `index` wiring |
| 3 | README/CONTRIBUTING 갭 메우기·용어 정리 / Fill gaps & clean terms |
| 4 | 블로그 1편 / 1 blog post |
| 5 | VS Code i18n |
| 6 | examples / 기타 정책 문서 / other policy docs |

### 일본어 (JA) — 우선순위 순서 / Japanese — priority order

| 순서 / Order | 작업 / Task |
|------|------|
| 1 | EN/ZH 대비 drift 동기화 + 용어 QA / Sync drift + terminology QA |
| 2 | VS Code i18n (현재 공백 / currently empty) |
| 3 | 플러그인 CODEX JA / examples |
| 4 | 선택적 2차 문서 / optional secondary docs |

---

## 작업 분할 제안 (PR 단위) / Suggested Work Breakdown (by PR)

| PR | 내용 / Content | 언어 / Lang | 예상 파일 수 / Est. files |
|----|------|------|-------------|
| **A** | `ko.ts` + Language 배선 + 스위처 / wiring + switcher | KO | 4~5 |
| **B** | docs `ko/` 온보딩 4종 (quickstart~cli) / onboarding 4 | KO | 4 |
| **C** | docs `ko/` 나머지 13종 + index / remaining 13 + index | KO | 14 |
| **D** | README/CONTRIBUTING KO 동기화·품질 / sync & quality | KO | 2 |
| **E** | blog KO | KO | 2 |
| **F** | JA drift/QA 패치 / patch | JA | 5~10 |
| **G** | VS Code `ja`+`ko` | 공통 / Both | 6~8 |
| **H** | examples + plugins | 공통 / Both | 5~10 |

---

## PR 제출 시 체크리스트 / PR Submission Checklist

- [ ] `npm run typecheck` 통과 / passes
- [ ] `npm run build` 통과 / passes
- [ ] 언어 전환 스크린샷 첨부 (프로젝트 규칙) / Attach language-switch screenshots (project rule)
- [ ] CLI 명령어·플래그·경로·패키지명·URL·코드 블록 원문 유지 확인 / Confirm CLI commands, flags, paths, package names, URLs, and code blocks kept as-is
- [ ] 용어집 준수 확인 / Confirm glossary compliance
- [ ] Frontmatter (`title`, `description`, `summary`) 번역 완료 / translated
- [ ] 기존 EN/ZH/JA 파일과 동일한 구조 유지 / Same structure as existing EN/ZH/JA files

---

## 참고 자료 / References

- 프로젝트 저장소 / Repository: https://github.com/alibaba/open-code-review
- 공식 사이트 / Official site: https://alibaba.github.io/open-code-review
- 일본어 PR #282 / Japanese PR #282: https://github.com/alibaba/open-code-review/pull/282
- i18n 패턴 참고 / i18n pattern reference: `pages/src/i18n/ja.ts`, `pages/src/content/docs/ja/`

---

> **다음 단계 / Next step**: Phase 1용 `ko.ts` 스캐폴드나 용어집 기반 `ko.ts` 초안 작성을 원하시면 말씀해 주세요. / If you'd like a `ko.ts` scaffold for Phase 1 or a glossary-based `ko.ts` draft, let me know — I'll split and provide it right away.
