# CLAUDE.md — TokenForge (서브 프로젝트)

> vibe-investing 레포 내 독립 프로젝트. 작업 시 이 파일 먼저 읽기.
> 상세: [`readme.md`](readme.md) · 리서치: [`docs/RESEARCH.md`](docs/RESEARCH.md) · Phase 2: [`docs/PHASE2_WIKI.md`](docs/PHASE2_WIKI.md)

## 목표
한국어·외국어 프롬프트 → **DeepSeek으로 영어 최적화** → **Claude/ChatGPT 토큰 절약 예측** →
계획·프롬프트를 **기억**하고 **SKILL.md**로 내보내는 브라우저 변환기(Cloudflare Pages free tier).

## 절대 규칙
1. **오직 무료 티어**: Cloudflare Pages/Pages Functions/KV free. 유료 기능 금지.
2. **API 키는 시크릿/설정 전용**: 코드·레포에 하드코딩·커밋 금지. `.dev.vars` / `pages secret` / 클라이언트 설정(로컬스토리지).
3. **키 없으면 mock 모드**: 로컬·CI·배포 전 단계에서 키 없이 빌드·테스트·동작 가능해야 함.
4. **토큰 수치는 추정임을 명시**: UI·문서에서 "추정 ±15%" 표기. ChatGPT만 tiktoken CDN 정밀모드(실패 시 폴백).
5. **의미 보존 우선**: 과도한 압축 금지(품질 저하 방지) — 최적화 시스템 프롬프트가 "100% 요구 보존" 강제.
6. UI는 한국어 기본.

## 아키텍처
```
frontend/          정적(vanilla JS, 빌드 불필요) — index.html / styles.css / app.js / lib/tokens.js
functions/api/     Pages Functions — health / plan / optimize / memory
shared/            서버 공용 — llm.ts(DeepSeek+mock) · prompts.ts(시스템 프롬프트·스킬 빌더) · storage.ts(기억) · http.ts · types.ts
skills/            SKILL.md 예시·설치 안내
docs/              RESEARCH · PHASE2_WIKI 기획
tests/             vitest (tokens/llm/storage)
```

- Pages 설정 `wrangler.toml` (`pages_build_output_dir = "frontend"`, KV `TF_MEMORY`)
- 기억 백엔드 우선순위: **KV(기본) < Upstash Redis(REST) < localStorage(브라우저 폴백)**. Neon은 Phase 2.
- 저장소 미구성 시 서버는 `backend:"none"`, 프론트가 localStorage 폴백 자동 처리.

## 명령
```bash
npm install
npm run dev        # wrangler pages dev (로컬 KV 에뮬레이션, mock 모드)
npm run typecheck  # tsc --noEmit
npm test           # vitest run
```

## 작업 체크리스트
- shared/prompts.ts의 시스템 프롬프트 수정 시 → 반드시 tests/llm.test.ts의 파싱 계약(JSON 키) 유지 확인
- 토큰 추정 파라미터 변경 시 → tests/tokens.test.ts·`frontend/lib/tokens.js` 함께 갱신
- UI 요소 추가 시 → id는 app.js와 일치, styles.css 클래스 재사용
