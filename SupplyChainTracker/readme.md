# SupplyChainTracker — 미국 공공 정부 공급망 추적기

한국 공급망 기반 미국 연방정부 조달시장 진출 플랫폼 (Korea–US Procurement Sourcing Platform).

SAM.gov 등 미국 정부 조달 데이터를 자동 수집·분석하고, 한국 공급사 및 미국 파트너를 매칭하여 입찰부터 계약·납품까지 지원하는 자동화 시스템.

## 목표 단계

| 단계 | 내용 |
|---|---|
| 1. 탐색 | 조달 공고 자동 수집·분석, 기회 선별 |
| 2. 매칭 | 한국 공급사·미국 파트너 매칭, 원가 및 마진 계산 |
| 3. 계약·서류 | Deal Room, 입찰 문서 준비, 서류 인증, 계약 이행 관리 |

## 문서 구조

| 폴더 | 내용 |
|---|---|
| [법률](법률/) | 미국 조달 규정 컴플라이언스, 플랫폼 서비스 정책 |
| [기획](기획/) | 사업기획서, 계획 검토 의견 |
| [개발계획](개발계획/) | 시스템 구축 계획, 3단계 기술 로드맵, 개발 시나리오(순서·배포) |

## 기술 스택

| 영역 | 기술 |
|---|---|
| Runtime | Cloudflare Workers (Node.js + TypeScript) |
| Backend | Hono (Workers 위) |
| Database | Neon (PostgreSQL serverless, 무료 티어) + pgvector |
| Frontend | Next.js (Cloudflare Pages, vinext) + Recharts |
| 스케줄러 | Cloudflare Cron Triggers |
| AI 분석 | OpenAI API (JSON Schema 고정 출력, 모델 교체 가능 추상화) |
| 인증 | 구글 OAuth 2.0 직접 구현 — **구글 로그인 전용** |
| 문서 파싱 | unpdf (Workers) / OCR 필요 시 외부 파서 |
| 데이터 소스 | SAM.gov API, FPDS/USAspending, DLA DIBBS |
| 스토리지 | Cloudflare R2 (공고 원문·첨부 보관) |
| 모니터링 | Sentry |

- Workers 요청당 CPU 시간 제한 → AI 분석 등 무거운 작업은 Cron Triggers 배치로 분리
- Neon 무료 티어 제한(스토리지 0.5GB, 월 컴퓨팅 시간) → 데이터 누적 시 유료 전환 검토
- Cloudflare Queues / Workflows는 배치·알림 규모가 커진 후 도입 (초기 제외)
- Compliance 판정은 FAR/DFARS 원문 RAG로 근거 조항 첨부
- 초기 버전은 공개 정보만 처리 (CUI 미취급)

## 회원 가입 정책

**회원 가입은 구글 로그인(Google OAuth)만 지원한다.**

- 이메일/비밀번호 기반 자체 가입, 소셜 로그인 확장(카카오·네이버 등)은 지원하지 않는다.
- 가입 시 구글 계정 프로필의 최소 정보(이메일, 이름)만 수집한다.
- 자체 비밀번호 저장·관리를 하지 않아 계정 탈취 및 자격증명 관리 리스크를 제거한다.
- 상세 내용은 [법률/02-플랫폼-서비스정책.md](법률/02-플랫폼-서비스정책.md) 참조.

## 체크 사항

- [x] 사업계획 v1.0 작성
- [x] 검토 의견 및 3단계 기술 로드맵 작성
- [x] 법률(조달 규정·서비스 정책) 문서화
- [x] 회원 가입 정책 확정 — 구글 로그인 전용
- [ ] SAM.gov API 키 발급 (api.data.gov)
- [ ] M1: 정적 랜딩 배포 — vibequant.cc/SupplyChainTracker (M7에서 서브도메인 전환)
- [ ] Cloudflare Workers + Neon 프로젝트 초기 구성 (구글 OAuth 로그인)
- [ ] FPDS 낙찰 데이터 연동 (P0)
- [ ] Stage 1 (탐색) 착수 — 수집기 + AI 분석 파이프라인
- [ ] Stage 2 (매칭) — 공급사 DB·매칭 엔진·마진 계산기
- [ ] Stage 3 (계약·서류) — Deal Room·입찰 승인 워크플로·Audit Log
