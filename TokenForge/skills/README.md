# skills/

TokenForge ⑤스킬 탭에서 생성되는 SKILL.md(Claude·opencode 스킬 포맷)를 위한 폴더입니다.

- [`tokenforge-sample/SKILL.md`](./tokenforge-sample/SKILL.md) — 이 대시보드가 만들어내는 산출물의 예시(전체 계획 + 단계별 한국어 초안 → 영어 최적화 프롬프트 번들)
- 템플릿 로직: `shared/prompts.ts`(`buildSkillMarkdown`) · 프론트 `frontend/app.js`(`skillMarkdown`)

## 설치 위치

| 도구 | 경로 |
|------|------|
| Claude Code | `~/.claude/skills/<name>/SKILL.md` |
| opencode | `~/.config/opencode/skills/<name>/SKILL.md` |
| 저장소 | `skills/<name>/SKILL.md` |

## 생성 흐름

1. ②계획 탭에서 전체 계획 프롬프트 생성 → ③Forge에서 단계별 프롬프트 영어 최적화
2. ⑤스킬 탭에서 "현재 계획" 또는 "기억 항목" 선택 → **SKILL.md 생성/복사/다운로드**
3. 에이전트가 스킬을 로드 → 프로젝트 전반 이해(전체 계획 프롬프트) + 단계별 실행(영어 프롬프트)
