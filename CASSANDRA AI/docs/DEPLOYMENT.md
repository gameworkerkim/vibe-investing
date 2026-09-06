# CASSANDRA AI — 배포 및 운영 전략

> Vercel (Hobby, $0) + Neon (Free, $0) = **$0/월 운영**

---

## 빠른 배포 (Vercel + Neon)

### 1. Neon DB 생성
```bash
# 1. https://neon.tech → Sign up (GitHub)
# 2. Create Project → "cassandra-db"
# 3. Connection string 복사
# postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/cassandra-db?sslmode=require
```

### 2. Vercel 배포
```bash
npm i -g vercel
cd dart-monitor
vercel login
vercel
# → Import existing project
# → Repository: gameworkerkim/cassandra-ai  (not vibe-investing)
# → Framework: Next.js
# → Root Directory: ./     ← empty / repo root. Do NOT use "CASSANDRA AI"
```

### 3. 환경변수 설정 (Vercel Dashboard)
```
DATABASE_URL=postgresql://...   # Neon 연결 문자열
DART_API_KEY=발급받은_40자리
NEXT_PUBLIC_APP_NAME=CASSANDRA AI
```

### 4. DB 마이그레이션
```bash
npx prisma migrate deploy
```

### 5. 도메인
```
https://cassandra-ai.vercel.app  (기본)
→ 커스텀 도메인 추가 가능 ($10~15/년)
```

## 자동화

### GitHub Actions (무료)
`.github/workflows/daily-sync.yml` 이 매일 09:00 / 18:00 KST에 자동 실행됩니다.
GitHub **Variables**에 등록 필요 (Secrets가 아닌 Variables 탭).

```bash
# Settings → Secrets and variables → Actions → Variables 탭
DATABASE_URL=postgresql://...
DART_API_KEY=...
```

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│                    사용자                        │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────┐
│  Vercel (Hobby, $0)                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Next.js  │  │ API      │  │ 정적 에셋      │  │
│  │ SSR/ISR  │  │ Routes   │  │ (CDN 캐시)    │  │
│  └──────────┘  └────┬─────┘  └───────────────┘  │
│                     │                            │
│  Edge Network (글로벌 PoP, DDoS 방어, WAF)      │
└─────────────────────┼────────────────────────────┘
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
┌──────────────┐ ┌─────────┐ ┌──────────────────┐
│ Neon (무료)  │ │ Supabase│ │ OCI Always Free  │
│ PostgreSQL   │ │ (대체)  │ │ ARM Ampere A1    │
│ 0.5GB/무료   │ │         │ │ 4 OCPU 24GB RAM  │
└──────────────┘ └─────────┘ │                  │
                              │ ┌──────────────┐ │
                              │ │ DART 폴러    │ │
                              │ │ 크롤러       │ │
                              │ │ LLM 워커     │ │
                              │ │ 백업 (cron)  │ │
                              │ └──────────────┘ │
                              └──────────────────┘
```

## 비용 분석

### 서비스별 월 예상 비용

| 서비스 | 플랜 | 월 비용 | 용도 |
|---|---|---|---|
| **Vercel** | Hobby | $0 | Next.js 호스팅, API Routes, CDN, HTTPS |
| **Neon** | Free | $0 | PostgreSQL (0.5GB, 100h compute) |
| **OCI** | Always Free | $0 | ARM 4C/24GB + 200GB Block + 20GB Object Storage |
| **Redis** | OCI 자체 호스팅 | $0 | 세션, 캐시, 작업 큐 (같은 VM에 Docker) |
| **도메인** | 선택 | $10~15/년 | 커스텀 도메인 |
| **LLM API** | 종량제 | $5~30/월 | DeepSeek V3 + Claude Haiku (예상 500~1000콜/일) |
| **이메일** | SendGrid Free | $0 | 100건/일 무료 (인증 메일, 알림) |

> **총계: $0/월 (LLM 제외), LLM 포함 $5~30/월**

### Vercel Hobby 한도 체크

| 리소스 | 무료 한도 | 예상 사용량 | 적합 |
|---|---|---|---|
| Edge Requests | 100만/월 | ~50만/월 | ✅ |
| Fast Data Transfer | 100GB/월 | ~10GB/월 | ✅ |
| Function Invocations | 100만/월 | ~50만/월 | ✅ |
| Function Active CPU | 4시간/월 | ~2시간/월 | ✅ |
| Function Memory | 360GB-hr/월 | ~100GB-hr/월 | ✅ |
| Image Optimization | 5,000/월 | ~500/월 | ✅ |
| ISR Reads | 100만/월 | ~10만/월 | ✅ |
| 빌드 | 100분/일 | ~10분/배포 | ✅ |

### Neon Free 한도 체크

| 리소스 | 무료 한도 | 예상 사용량 | 적합 |
|---|---|---|---|
| 스토리지 | 0.5GB | ~50MB (초기) | ✅ |
| Compute | 100시간/월 | ~24시간/월 (sleep 모드 시 0) | ✅ |
| 프로젝트 | 1개 | 1개 | ✅ |
| 브랜치 | 10개 | 1개 | ✅ |

> Neon은 사용하지 않을 때 자동 sleep → compute 시간 절약.  
> 스토리지가 부족하면 Supabase(500MB)나 Railway($5)로 마이그레이션.

## OCI Always Free — 워커 서버

### 사양
- **ARM Ampere A1**: 4 OCPU, 24GB RAM
- **Block Volume**: 200GB (PostgreSQL 데이터, 로그)
- **Object Storage**: 20GB (PDF 아카이브, 백업)
- **OS**: Ubuntu 22.04 LTS

### 실행할 작업
| 작업 | 스케줄 | 설명 |
|---|---|---|
| **DART 폴러** | 09:00~18:00 매 5분 | OpenDART list.json → 신규 공시 감지 |
| **유니버스 갱신** | 매일 08:30 | 코스닥 100종목 풀 업데이트 |
| **거래량 분석** | 매일 15:35 | Naver Finance API → 거래량 스파이크 |
| **LLM 분석** | 이벤트 기반 | 공시 본문 → DeepSeek NER → Claude 분석 |
| **DB 백업** | 매일 03:00 | pg_dump → OCI Object Storage |
| **PDF 아카이브** | 공시 접수 시 | DART PDF → Object Storage 저장 |

### Docker Compose 구성 (OCI VM)
```yaml
# docker-compose.worker.yml
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: dart_monitor
    volumes:
      - /mnt/block/pg_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      DATABASE_URL: postgresql://postgres:${PG_PASSWORD}@postgres/dart_monitor
      REDIS_URL: redis://redis:6379
      DART_API_KEY: ${DART_API_KEY}
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on: [postgres, redis]
    restart: unless-stopped
```

## 배포 파이프라인

```
GitHub (main 브랜치)
    │
    ├── git push → Vercel 자동 배포 (웹앱)
    │              └── Preview Deploy (PR 마다)
    │              └── Production Deploy (main)
    │
    └── git push → GitHub Actions → OCI VM SSH 배포 (워커)
                   └── docker compose pull
                   └── docker compose up -d
```

### Vercel 배포 설정
```bash
# 1. GitHub 연동
# vercel.com → Import Project → gameworkerkim/cassandra-ai

# 2. 환경변수 설정
DATABASE_URL=postgresql://...  # Neon 연결 문자열
DART_API_KEY=...
NEXT_PUBLIC_APP_NAME="CASSANDRA AI"

# 3. 빌드 설정 (자동 감지)
# Framework: Next.js
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm install
```

### Neon DB 연결
```bash
# 1. Neon에서 프로젝트 생성
# 2. Vercel Integration으로 연결
# 3. DATABASE_URL 환경변수 자동 주입
# 4. Prisma 마이그레이션:
npx prisma migrate deploy
```

## 운영 모니터링

| 도구 | 비용 | 용도 |
|---|---|---|
| **Uptime Kuma** (OCI) | $0 | 헬스체크, 장애 알림 (Telegram) |
| **Vercel Analytics** | Hobby 포함 | 트래픽, 성능 |
| **Neon Dashboard** | 무료 | DB 사용량, 쿼리 성능 |
| **Sentry** | 무료 티어 | 에러 트래킹 (5K events/월) |

## 확장 시나리오

### 사용자 100명 초과 시
1. Vercel Pro ($20/월) 전환 → 빌드 큐 제거, 빠른 배포
2. Neon → Supabase Pro ($25/월) 마이그레이션 → 8GB DB
3. Redis → Upstash Redis (무료 티어 256MB)

### LLM 호출량 증가 시
1. Claude Haiku → 자체 미세조정 모델 (OCI GPU 인스턴스)
2. 배치 처리로 전환 (실시간 대신 1시간 단위)
3. 캐싱 레이어 추가 (동일 질의 재사용)

### 전체 비용 예측

| 단계 | 사용자 | 월 비용 | 구성 |
|---|---|---|---|
| **베타** | 1~10명 | $0 | Vercel Hobby + Neon Free + OCI Free |
| **초기** | 10~50명 | $0~5 | Vercel Hobby + Neon Free + LLM 소량 |
| **성장** | 50~200명 | $25~50 | Vercel Pro + Neon Free + LLM |
| **안정** | 200+명 | $100~300 | Vercel Pro + Supabase + LLM + 모니터링 |

## 보안 고려사항

1. **환경변수**: Vercel Dashboard에서 관리, 로컬 `.env`는 Git 제외
2. **DB 접근**: Neon의 IP 제한 + SSL 강제 연결
3. **API 레이트 리밋**: Vercel WAF 기본 포함, 추가 커스텀 룰 3개
4. **DDoS**: Vercel 자동 방어
5. **백업**: OCI Object Storage 일일 pg_dump, 14일 보존
6. **블랙리스트 데이터**: OCI VM 로컬 파일시스템에만 저장, GitHub 미커밋
