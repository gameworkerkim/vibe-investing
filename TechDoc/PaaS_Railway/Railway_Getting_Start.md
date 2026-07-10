# Railway.com Getting Started 가이드

> 최종 검증일: 2026-07-10 | 요금 및 정책은 변동 가능하므로 공식 문서 기준으로 재확인 권장

## 1. Railway란?

Railway는 인프라 관리의 복잡성을 추상화하고 애플리케이션을 빠르게 배포할 수 있도록 해주는 PaaS(Platform as a Service)이다. GitHub 리포지토리, Docker 이미지, 로컬 코드를 연결하면 빌드, 배포, 호스팅, 관측성(observability)까지 플랫폼이 처리한다.
1인 개발자, 취미 프로젝트용으로 적합하며 트래픽이 폭증할 때는 꼭 서비스를 이전할 수 있는 플랜을 준비해야 한다. 초단위 과금이라 트래픽이 몰릴 때 정말 배포와 유지보수의 편리함을 넘어 괴로워진다.

- 공식 사이트: https://railway.com
- 공식 문서: https://docs.railway.com

## 2. 요금 구조 (2026년 기준, 중요)

과거의 "무제한 무료 티어"는 존재하지 않는다. 현재 구조는 다음과 같다.

| 플랜 | 비용 | 내용 |
|------|------|------|
| Trial | 1회성 $5 크레딧 | 가입 시 자동 부여, 30일 유효. 최대 1GB RAM, 공유 vCPU, 프로젝트당 5개 서비스. GitHub 계정 미검증 시 아웃바운드 네트워크 제한(Limited Trial) |
| Free | $0/월 | Trial 종료 후 전환. 월 $1 크레딧(이월 불가), 1 vCPU / 0.5GB RAM, 1개 프로젝트, 프로젝트당 3개 서비스. DB 병행 운영 시 며칠 내 크레딧 소진 가능 |
| Hobby | $5/월 | 실질적 시작점. 구독료 $5가 사용량에 합산됨(사용량 $3이면 $5만, $8이면 $8 청구) |
| Pro | $20/월 (인당) | 팀/프로덕션용. 동일하게 구독료가 사용량 크레딧으로 작동 |

핵심 요약

- 과금은 초 단위 사용량 기반(usage-based)이며, 트래픽 급증 시 비용이 함께 증가한다.
- 프로덕션 워크로드는 최소 Hobby, 팀 단위는 Pro가 현실적이다.
- Trial 크레딧 소진 또는 30일 경과 시 서비스가 중지되며, 볼륨 데이터는 일정 기간 보존 후 삭제되므로 백업 계획이 필요하다.

참고

- 요금 플랜: https://docs.railway.com/pricing/plans
- Free Trial 정책: https://docs.railway.com/pricing/free-trial
- 요금 개요: https://railway.com/pricing

## 3. 사전 준비

1. Railway 계정 생성: https://railway.com 에서 Login 클릭 후 가입
2. GitHub 계정 연동 권장: 계정 검증(verification)을 통과해야 Full Trial(네트워크 제한 없음)이 적용된다. 미검증 시 아웃바운드 네트워크와 포트가 제한된다.
3. (CLI 사용 시) Node.js 18+ 또는 Homebrew, shell 환경

## 4. 배포 방법

### 4.1 GitHub 리포지토리에서 배포 (권장)

1. https://railway.com/new 접속 후 New Project 클릭
2. "Deploy from GitHub repo" 선택 (최초 1회 GitHub 계정 연동 필요)
3. 배포할 리포지토리 검색 후 선택
4. Deploy Now 클릭 → Railway가 스택(Next.js, Django, Rails, Go 등)을 자동 감지하여 빌드 및 배포
5. 이후 해당 브랜치에 push할 때마다 자동 재배포

참고: https://docs.railway.com/quick-start

### 4.2 CLI로 배포

```bash
# 1. Railway CLI 설치 (택 1)
npm install -g @railway/cli
# 또는
brew install railway
# 또는
bash <(curl -fsSL cli.new)

# 2. 로그인
railway login

# 3. 프로젝트 초기화 (신규 프로젝트인 경우)
railway init

# 4. 프로젝트 디렉토리에서 배포
railway up
```

참고: https://docs.railway.com/guides/cli

### 4.3 Docker 이미지 배포

Docker Hub 또는 GitHub Container Registry(ghcr.io)의 이미지를 직접 지정하여 배포할 수 있다. 커스텀 Dockerfile을 리포지토리 루트에 두면 Railway가 이를 우선 사용한다. 향후 타 플랫폼 이전 가능성을 고려한다면 초기부터 Docker 기반 배포를 사용하는 것이 이식성 측면에서 유리하다.

참고: https://docs.railway.com/guides/services

### 4.4 템플릿으로 배포

템플릿 마켓플레이스에서 사전 구성된 스택(예: Next.js, WordPress, n8n, Strapi 등)을 원클릭으로 배포할 수 있다. 처음이라면 공식 NextJS 템플릿으로 연습하는 것을 권장한다.

참고: https://railway.com/templates

## 5. 데이터베이스 추가

프로젝트 캔버스에서 New → Database 선택으로 PostgreSQL, MySQL, Redis, MongoDB를 추가할 수 있다.

- 서비스 간 통신은 프라이빗 네트워킹(내부 도메인)을 사용하면 이그레스(egress) 비용이 발생하지 않는다.
- 연결 정보는 환경 변수(예: `DATABASE_URL`)로 자동 주입 가능하다.
- 자동 백업이 제공되지만, 중요 데이터는 별도의 외부 백업 전략(pg_dump 정기 실행 등)을 병행할 것.

참고: https://docs.railway.com/guides/databases

## 6. 프로덕션 체크리스트

| 항목 | 설정 위치 / 방법 |
|------|------|
| 헬스 체크 | 서비스 Settings → Healthcheck Path 지정 (무중단 배포 전제 조건) |
| 커스텀 도메인 | 서비스 Settings → Domains (TLS 인증서 자동 발급) |
| 환경 분리 | Environments 기능으로 production / staging 분리 |
| 수평 확장 | 서비스 Settings → Replicas (다중 리전 배치 가능) |
| 롤백 | Deployments 탭에서 이전 배포로 즉시 복원 |
| 비용 알림 | Workspace Settings → Usage에서 Usage Limit / 알림 설정 필수 |
| 로그/메트릭 | Observability 탭에서 통합 제공 |

참고: https://docs.railway.com/guides/healthchecks, https://docs.railway.com/reference/scaling

## 7. 주의점

1. **비용 모니터링 필수**: 사용량 기반 과금 특성상 월 비용 예측이 어렵다. Usage Limit(하드 리밋) 설정을 권장한다.
2. **Free/Trial 플랜의 한계**: 월 $1 크레딧으로는 상시 실행 서비스 1개도 빠듯하며 DB 병행은 사실상 불가능하다. 프로덕션에는 부적합하다.
3. **리전 제한**: AWS/GCP 등 대형 클라우드 대비 지원 리전이 제한적이다.
4. **IaC 지원 부족**: Terraform 수준의 완전한 Infrastructure-as-Code를 지원하지 않는다. 인프라를 코드로 엄격히 관리해야 하는 팀에는 한계가 있다.
5. **이식성**: 플랫폼 종속을 피하려면 초기부터 Dockerfile 기반 배포를 사용할 것.
6. **성능 이슈 보고**: 일부 워크로드(예: 디스크 I/O 집약 작업)에서 성능 저하 보고가 있으므로, 도입 전 자체 벤치마크를 권장한다. (일화적 보고 수준이며 일반화된 검증 자료는 아님)

## 8. 경쟁 PaaS와의 위치

- **vs Heroku**: Heroku는 2026년 2월 6일 sustaining engineering(유지보수) 모드 전환을 발표했다. 신규 기능 개발이 중단되고 신규 Enterprise 계약도 받지 않는다(기존 고객은 계속 사용 및 갱신 가능). Railway는 동일한 배포 모델을 제공하면서 자동 확장, 사용량 기반 과금, 다중 리전, 영구 스토리지를 네이티브 지원하여 가장 학습 곡선이 낮은 이전 대상 중 하나로 꼽힌다.
- **vs Render**: 둘 다 Git 기반 배포와 관리형 DB를 제공한다. Render는 고정 인스턴스 과금으로 비용 예측이 쉽고, Railway는 사용량 과금과 다중 리전 네이티브 지원이 강점이다.
- **vs Fly.io**: 빠르고 가볍게 시작하려면 Railway, Docker 기반 글로벌 에지 워크로드가 필요하면 Fly.io.
- **vs Vercel**: Vercel은 프론트엔드/서버리스 함수에 최적화(실행 시간 제한 존재), Railway는 백엔드/DB/워커/크론까지 전체 스택을 장기 실행 서버 모델로 하나의 프로젝트에서 관리한다.

참고: https://docs.railway.com/maturity/compare-to-heroku

## 9. 요약

| 구분 | 내용 |
|------|------|
| 추천 대상 | 사이드 프로젝트, 스타트업, 빠른 프로토타이핑, Heroku 이전 검토 팀 |
| 가격 정책 | 사용량 기반 (초 단위 과금, 구독료가 사용량 크레딧에 합산) |
| 시작 비용 | Trial $5 크레딧(30일) → Free $1/월 크레딧 → 실질 시작점 Hobby $5/월 |
| 주요 강점 | 개발자 경험, 자동 확장, 원클릭 DB, 자체 하드웨어(Gen 2 Metal), 무중단 배포 |
| 주요 약점 | 비용 예측 어려움, 리전 제한, IaC 미지원, 사실상 무료 티어 부재 |

## 참고 링크 (Reference)

- Railway 공식 사이트: https://railway.com
- 공식 문서: https://docs.railway.com
- Quick Start: https://docs.railway.com/quick-start
- 요금 플랜: https://docs.railway.com/pricing/plans
- Free Trial 정책: https://docs.railway.com/pricing/free-trial
- CLI 가이드: https://docs.railway.com/guides/cli
- 데이터베이스 가이드: https://docs.railway.com/guides/databases
- 템플릿 마켓플레이스: https://railway.com/templates
- Heroku 비교 (공식): https://docs.railway.com/maturity/compare-to-heroku
- Heroku sustaining mode 발표 관련 분석: https://encore.dev/articles/end-of-heroku
- Railway 무료 티어 현황 분석 (2026): https://kuberns.com/blogs/railway-free-tier/
