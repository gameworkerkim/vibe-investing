# Phase 2 — WIKI 기반 프로젝트 전반 이해 + 프롬프트 개선/추천 (기획)

> 목표: 프로젝트 전체를 담은 WIKI를 기억해 두고, 사용자가 세부 프롬프트를 작성할 때
> **"이 프로젝트의 목표·용어·규칙·이전 결정"을 컨텍스트로 자동 주입**해
> 프롬프트 품질을 높이고 중복 질문·모순을 줄이는 RAG 기반 추천 레이어.

## 1. 왜 WIKI+RAG인가

- 코딩 프롬프트 품질은 **도메인 컨텍스트(프로젝트 전반 이해)**에 크게 좌우됨.
- 매 프롬프트마다 설명을 붙이면 토큰이 낭비되고, 빼먹으면 품질이 떨어짐.
- WIKI(문서) → 임베딩 → 유사도 검색 → 프롬프트 생성 시 관련 조각만 자동 첨부 = **컨텍스트를 사지방비로**.

## 2. 아키텍처 (Cloudflare 무료 스택 기반)

```
사용자 프롬프트(한국어/외국어)
        │
        ▼
┌─────────────────────────────────────────────┐
│ 1. 질의 이해 (DeepSeek: 의도·키워드·문서 유형)   │
│ 2. 벡터 검색 (관련 WIKI 청크 top-k)            │
│ 3. 컨텍스트 합성 (기억 Memory + WIKI 조각)      │
│ 4. 최적화 + 추천 (기존 /api/optimize 확장)     │
└─────────────────────────────────────────────┘
        │
        ▼
  최적화 영어 프롬프트 + 사용 근거(추천) + 토큰 예측
```

## 3. 구성 요소

| 구성 | Phase 1 현재 | Phase 2 제안 |
|------|--------------|--------------|
| 문서 저장 | 기억(Memory, KV/Upstash) | **Neon Postgres**: `wiki_docs`, `wiki_chunks`(본문·임베딩·메타) |
| 검색 | 키워드(q LIKE) | **Vectorize**(Cloudflare) 벡터 인덱스 또는 pgvector — `embed()`/Workers AI 임베딩 |
| 임베딩 | — | Workers AI `@cf/baai/bge-*` 계열 (free tier) 또는 DeepSeek/커스텀 |
| 주입 | memoryId 1개 수동 첨부 | 자동 top-k 청크 합성(`context` 필드) |
| 학습 피드백 | 저장만 | 최적화 후 사용자가 "좋음/나쁨" → WIKI 품질 점수 갱신 |

### 인덱싱 파이프라인
- WIKI 문서 등록(`POST /api/wiki/ingest`) → 청크 분할(제목·헤딩 단위, ~512 tokens)
- 임베딩 생성 → `wiki_chunks.embedding` 저장
- 문서 변경 시 해당 청크만 재인덱싱 (증분)

### 추천 로직(순서)
1. 사용자 프롬프트의 도메인/의도 분류(LLM) → 검색 필터
2. 벡터 유사도 top-k + 키워드 보조 점수
3. **"이전 결정/금지사항"이 있으면 명시적 주입** (모순 방지)
4. 최적화 프롬프트에 `[PROJECT MEMORY/WIKI]` 컨텍스트 포함 → `summary_ko`에 반영 근거 표시

## 4. API 추가 계획

| 메서드 | 경로 | 동작 |
|--------|------|------|
| POST | `/api/wiki/ingest` | 문서(제목/마크다운/태그) → 청크+임베딩 저장 |
| GET | `/api/wiki/search?q=` | 유사 청크 반환(디버그/미리보기) |
| POST | `/api/optimize` | `wiki: true` 옵션 → 자동 RAG 컨텍스트 주입 |
| POST | `/api/memory/:id/feedback` | 최적화 품질 피드백 → 점수 갱신 |

## 5. 오픈 이슈

- 임베딩 모델 선택: Workers AI 무료(bge 등) vs 벡터 품질 → 한국어 임베딩 평가 필요
- WIKI 초기 콘텐츠 확보: 저장된 기억을 자동 승격(project → wiki_docs) vs 수동 큐레이션
- Vectorize(free tier: 5M vectors 1GB) 한도 점검 — Phase 1 기억 데이터는 KV 유지, WIKI만 벡터
- 멀티 테넌트/접근 제어는 개인용 범위에서 후순위

## 6. 마일스톤

- [ ] Neon + pgvector(또는 Vectorize) 연동, `wiki_docs` 스키마
- [ ] 임베딩 파이프라인 + `/api/wiki/ingest`
- [ ] `/api/optimize` RAG 자동 주입
- [ ] WIKI 편집 UI(⑤스킬 탭 옆 "위키" 탭) + 피드백
- [ ] 오픈소스 커뮤니티 WIKI 공유 포맷
