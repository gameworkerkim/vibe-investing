# vibequant.cc Lab 통합 로드맵 — MY-IP + LAON VaultGuard

> **버전**: v1.1 (2026-07-27)
> **목표**: vibequant.cc/lab에 네트워크 진단 도구(MY-IP) + 시크릿 스캐너(LAON VaultGuard) 통합
> **인프라**: Cloudflare Pages (정적) + Cloudflare CDN (API 응답 캐시) + Vercel (API/백엔드) + Neon (PostgreSQL) + Upstash Redis (Rate limit/Job queue)

---

## 0. 원안 비판적 검토 및 수정 사항

### 0.1 MY-IP 누락 기능 (원안 대비 5개 추가 발굴)

원안은 MY-IP 기능을 10여 개로 기술했으나, 실제 upstream(jason5ng32/MyIP, ★11.3k)에는 **아래 기능이 추가로 존재**한다:

| # | 누락 기능 | 설명 | Lab 적용 판단 |
|---|----------|------|-------------|
| 1 | **ASN History & Upstream Topology** | IP prefix의 ASN 변동 이력 + Tier 1 백본까지의 업스트림 경로 시각화 | ✅ 추가 — CTI 연계에 강력한 가치 |
| 2 | **DNS Resolver (Multi-Source)** | 다중 소스(DNS over HTTPS 제공자)에서 실시간 DNS 쿼리 결과 비교 → 오염 탐지 | ✅ 추가 — 검열/차단 점검과 연계 |
| 3 | **Proxy Rule Testing** | 프록시 소프트웨어 규칙 설정 정확성 테스트 (DOMAIN, IP-CIDR 등) | ✅ 추가 — 네트워크 진단 실용성 |
| 4 | **Cybersecurity Checklist (258항목)** | 사이버보안 점검 리스트 — 기본 보안 위생 자가진단 | ✅ 추가 — Lab의 교육적 가치 |
| 5 | **Shareable Diagnostic Reports** | Cloudflare KV 기반 진단 결과 공유 URL 생성 | ⚠️ 보류 — KV 의존성, Phase 2 이후 검토 |

### 0.2 아키텍처 수정 사항

원안의 가장 큰 문제: **Cloudflare Workers에 Node.js 백엔드 전체를 올리는 것**.

| 원안 | 문제점 | 수정안 |
|------|--------|--------|
| Workers에 IP 조회 API | Workers CPU 10ms 제한, MaxMind DB 100MB+ 로드 불가 | Vercel Serverless로 MaxMind API 처리 |
| Workers에 DNS/WebRTC 검사 | WebRTC는 브라우저 측, DNS는 외부 resolver 필요 | 프론트엔드에서 직접 WebRTC API 호출, DNS는 Vercel API로 프록시 |
| Workers에 MTR/속도 테스트 | Workers는 TCP 소켓 열기 제한으로 MTR 불가 | **Phase 2 이후** 전용 VPS 고려 또는 제한적 기능만 제공 |
| Cloudflare KV에 MaxMind DB | KV value limit 25MB, MaxMind DB 100MB+ | **Neon Postgres**에 MaxMind 데이터 적재 (IP range 검색 인덱스) |

**최종 아키텍처 결정**: **Vercel(기존 CASSANDRA AI 계정) + Neon**을 백엔드로, **Cloudflare Pages + CDN**(기존 vibequant.cc/lab)을 프론트엔드 및 API 캐시로, **Upstash Redis**는 Rate limit·Job queue 전용으로 최소화하는 하이브리드 구조. IP 조회 결과 캐싱은 Cloudflare CDN(`Cache-Control`)이 Upstash Redis(일 10,000 커맨드 제한)보다 무제한에 가까워 단일 장애점을 제거한다.

### 0.3 LAON VaultGuard Demo 전략 수정

원안은 "GitHub API로 공개 레포 스캔"을 제안했으나, LAON VaultGuard는 **로컬 CLI 도구**이므로 웹 데모에 맞게 재설계 필요:

- **원안 문제**: LAON VaultGuard는 `simple-git`으로 로컬 레포를 clone 후 분석하는 구조. 웹에서 이걸 직접 제공하려면 서버에서 git clone을 수행해야 함.
- **수정안**: 
  - (1) **교육형 Demo**: 미리 스캔한 결과를 시각화 + "직접 실행해보세요" CTA
  - (2) **경량 웹 스캐너**: GitHub URL 입력 → Vercel 백엔드에서 clone → 스캔 → 결과 반환 (Neon/Redis로 용량 관리)
  - (3) **VS Code Extension 중심**: Lab에서 VS Code 확장 다운로드 유도가 더 실용적

---

## 1. 통합 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                    vibequant.cc (Cloudflare Pages)                   │
├─────────────────────────────────────────────────────────────────────┤
│  📋 CTI (cti.vibequant.cc)           🧪 Lab (lab.vibequant.cc)     │
│  └── APT·공급망·AI 보안 리포트       └── 신규 통합 대시보드        │
├─────────────────────────────────────────────────────────────────────┤
│                         Lab 대시보드 구성                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  🔍 MY-IP Light  │  │ 🛡️ VaultGuard   │  │ 📊 CTI 연계      │  │
│  │  IP 조회         │  │  데모 스캐너     │  │  위협 리포트     │  │
│  │  DNS 누출 검사   │  │  멀티 LLM 결과   │  │  ↔ 스캔 결과     │  │
│  │  WebRTC 검사     │  │  SARIF 다운로드  │  │  연관 분석       │  │
│  │  사이버보안 체크  │  │  VS Code 확장    │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
     ┌──────┴──────┐              │                     │
     │ Cloudflare  │  Cache hit: < 5ms (edge), Cache-Control: max-age=3600
     │  CDN Cache  │  IP lookup result → stale-while-revalidate=86400
     │ (무제한·무료) │
     └──────┬──────┘
            │ cache miss
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Vercel API (기존 CASSANDRA AI 계정)               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ /api/myip/*      │  │ /api/vaultguard/*│  │ /api/cti/*       │  │
│  │ IP·DNS·WebRTC    │  │ 스캔·분석·SARIF  │  │ 연관성 분석      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  Neon (PostgreSQL)   │  │  Upstash Redis           │
│  ├── MaxMind IP DB   │  │  ├── Rate limit 전용      │
│  ├── 스캔 결과 저장   │  │  └── Job queue (스캔 대기) │
│  └── CTI 피드 메타    │  │                          │
└──────────────────────┘  └──────────────────────────┘
```

### 1.2 기술 스택 매핑

| 계층 | 기술 | 무료 티어 한도 |
|------|------|--------------|
| **정적 프론트엔드** | Cloudflare Pages (기존 vibequant.cc/lab) | 무제한 대역폭 |
| **API 응답 캐시** | Cloudflare CDN (`Cache-Control` + `stale-while-revalidate`) | **무제한** (Free Tier) |
| **API 서버** | Vercel Serverless (Next.js 15 — CASSANDRA AI와 동일 스택) | 월 100GB 대역폭, 60s 실행 |
| **데이터베이스** | Neon (PostgreSQL) | 월 10GB 스토리지, 100시간 컴퓨팅 |
| **Rate limit / Job queue** | Upstash Redis | 일 10,000 커맨드 (Rate limit 전용으로 충분) |
| **모니터링** | Umami (기존 vibequant.cc 자체 호스팅) | — |
| **LLM API** | DeepSeek (기본), Claude/GPT (선택) | 종량제 |

> **핵심 원칙**: CASSANDRA AI(`dart-monitor-pi.vercel.app`)와 동일한 Next.js 15 + Prisma + Neon + Upstash Redis 스택을 재사용한다. 새 프로젝트가 아닌 **기존 Vercel 팀에 새 Next.js 앱을 추가**하거나 **API Route**로 통합한다.

### 1.3 Cloudflare CDN 캐시 전략 — Redis 없이 IP 조회 무제한 캐싱

**왜 Cloudflare CDN인가?**

Upstash Redis 프리 티어는 **일 10,000 커맨드** 제한이 있어 IP 조회 캐시 용도로는 취약하다. IP 조회 한 번에 `GET`+`SETEX` 2커맨드 → 하루 5,000명이면 한도 소진. Cloudflare CDN은 **무제한**이며 이미 vibequant.cc가 Cloudflare 위에 있다.

**구현**:

```
Client → GET /api/myip?ip=8.8.8.8
  → Cloudflare Edge (api.vibequant.cc, orange cloud proxied)
    → 캐시 HIT  → < 5ms 응답 (Vercel까지 요청 안 감)
    → 캐시 MISS → Vercel Origin → Neon 조회
                 → Cache-Control: public, max-age=3600, stale-while-revalidate=86400
                 → Cloudflare Edge에 자동 캐싱
```

**Vercel API 응답 헤더 설정**:

```typescript
// Next.js API Route
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  const data = await queryNeon(ip);

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Vary': 'Accept-Encoding',
      // IP별 캐시 분리: Cloudflare는 기본적으로 query string을 cache key에 포함
    },
  });
}
```

**캐시 정책**:

| 데이터 유형 | TTL | stale-while-revalidate | 이유 |
|------------|-----|----------------------|------|
| IP 지리정보 조회 | 1시간 (3600s) | 24시간 (86400s) | GeoIP DB는 월 1회 갱신, IP-위치 매핑은 거의 불변 |
| CTI 피드 요약 | 10분 (600s) | 1시간 (3600s) | 보안 위협 인텔리전스는 변동 가능 |
| 서비스 상태 체크 | 5분 (300s) | 15분 (900s) | 실시간성 요구 |
| 스캔 결과 | 캐시 안 함 | — | 사용자별 고유 데이터 |

**Upstash Redis 역할 축소**:

| 용도 | Redis → Cloudflare CDN 전환 | 남은 Redis 사용량 |
|------|---------------------------|------------------|
| IP 조회 캐시 | ❌ 제거 → Cloudflare CDN | — |
| Rate limit | ✅ Redis 유지 (INCR + EXPIRE) | IP당 2커맨드/요청 |
| Scan job queue | ✅ Redis 유지 (LPUSH/BRPOP) | 스캔 건당 4커맨드 |
| **예상 Redis 사용량** | | **월 3,000커맨드 미만** (Rate limit + Job queue만) |

> **결론**: IP 조회 캐시를 Cloudflare CDN으로 이전하면 Redis 한도(일 10,000cmd)는 Rate limit 전용으로도 넉넉해지고, CDN이 전 세계 330+ 엣지에서 응답하므로 지연시간도 개선된다.



---

## 2. 기능별 구현 전략

### 2.1 MY-IP Light (네트워크 진단)

| 기능 | 구현 방식 | 난이도 |
|------|----------|--------|
| IP 주소 조회 | Vercel API → request header에서 client IP 추출 + MaxMind lookup (Neon) | 하 |
| IP 정보 검색 (임의 IP) | Vercel API → Neon에서 IP range 검색 → GeoLite2 결과 | 하 |
| DNS 누출 테스트 | 프론트엔드: `fetch()`로 다중 DNS resolver 호출, 결과 비교 | 하 (순수 FE) |
| WebRTC 연결 검사 | 프론트엔드: `RTCPeerConnection` API, ICE candidate 수집 | 하 (순수 FE) |
| 브라우저 핑거프린트 | 프론트엔드: Canvas/WebGL/Audio fingerprinting JS | 하 (순수 FE) |
| 검열 차단 확인 | Vercel API → 외부 URL HEAD 요청 → 응답 코드 판정 | 중 |
| 사이버보안 체크리스트 | 정적 JS + localStorage로 진행도 저장 | 하 |
| **제외** (Phase 2) | | |
| 속도 테스트 | 대용량 다운로드/업로드 → Vercel 대역폭 초과 위험 | 보류 |
| MTR 테스트 | TCP 소켓 필요 → Serverless 불가. 전용 VPS 필요 | 보류 |
| ASN History | RIPE Stat API 호출 필요 + 시각화 | Phase 2 |

**MaxMind DB 처리 방안**:
- GeoLite2-City.mmdb + GeoLite2-ASN.mmdb → 약 100MB
- Neon에 IP range 테이블(Appropriate IP range lookup)로 변환 적재
- API 응답에 `Cache-Control: public, max-age=3600` → Cloudflare CDN이 자동 캐싱
- `npm run update-geoip` → cron job (Vercel Cron Jobs / GitHub Actions)으로 월 1회 갱신

### 2.2 LAON VaultGuard Demo (시크릿 스캐너)

| 기능 | 구현 방식 | 난이도 |
|------|----------|--------|
| 데모 스캔 결과 시각화 | 기존 LAON VaultGuard 백테스트 결과(54 tests)를 JSON → 정적 대시보드 | 하 |
| URL 입력 스캔 | GitHub URL 입력 → Vercel에서 `simple-git` clone → scan → 결과 | 중 |
| 멀티 LLM 결과 비교 | DeepSeek API (기본, 저비용) + Claude 선택적 사용 | 중 |
| SARIF 다운로드 | `GET /api/vaultguard/scan/:id/sarif` → `application/sarif+json` | 하 |
| VS Code 확장 다운로드 | 기존 `.vsix` 정적 파일 제공 + VS Marketplace 링크 | 하 |
| **의도적 제외** | | |
| 실시간 모니터링 | 서버에서 지속적 polling은 Free Tier 초과. 데모로 충분 | — |
| Pre-commit hook | CLI 도구이므로 Lab 웹에서 제공 불가. 설치 가이드로 대체 | — |

**스캔 워크플로우**:
```
사용자 입력: GitHub URL
  → POST /api/vaultguard/scan { url, providers?, files_only? }
  → Vercel API Route:
      1. simple-git clone (shallow: --depth 1, 50MB limit)
      2. candidate-filter (git grep 60+ patterns)
      3. LLM harness (DeepSeek 기본, Claude 선택)
      4. 결과 저장 (Neon)
      5. 응답: scan_id + findings + summary
  → 프론트엔드: SSE로 진행상황 실시간 업데이트
```

**용량 제한** (Vercel + Neon Free Tier 준수):
- Clone 크기: 50MB 제한
- 파일 수: 최대 500개까지만 스캔
- 스캔 결과: 24시간 후 자동 삭제 (Neon 용량 관리)
- Rate limit: IP당 5회/시간 (Upstash Redis INCR + EXPIRE)

### 2.3 CTI ↔ Lab 연계

| 연계 포인트 | 구현 |
|------------|------|
| 스캔된 시크릿 유형 → CTI 태그 매핑 | `aws_access_key` → "Cloud Credential Leak" 태그로 CTI 리포트 연결 |
| IP 지리정보 → CTI 위협 지역 분석 | 특정 국가 IP → 해당 국가 APT 그룹 리포트 자동 추천 |
| 취약점 유형 → MITRE ATT&CK 매핑 | CWE → ATT&CK Technique ID (LAON VaultGuard에 이미 Security_Standards.md 존재) |
| Lab에서 발견된 패턴 → CTI 리포트 소재 | 예: "최근 7일간 발견된 GCP 키 42건" → CTI 트렌드 리포트 자동 생성 |

---

## 3. 경쟁력 분석 (비판적 보완)

### 3.1 시크릿 스캐닝 — 현실적 포지셔닝

원안은 LAON VaultGuard의 "유일한 멀티 LLM 접근법"을 강조했으나, 현실은 더 냉정하게 봐야 한다:

| 경쟁 요소 | 실제 상황 | 대응 전략 |
|----------|----------|-----------|
| GitHub Secret Protection ($19/월) | AI 기반, 오탐률 94% 감소. GitHub 생태계 내 완전 통합 | GitHub 사용자는 이걸로 충분. **"GitHub 안 쓰는 곳"**을 타겟 (GitLab, Bitbucket, 자체 호스팅) |
| GitGuardian | 2025년 4,400만 달러 펀딩. 400K+ 개발자 사용. 엔터프라이즈급 | 직접 경쟁 불가. **한국어·한국 클라우드(KT, NCP) 특화**로 틈새 공략 |
| TruffleHog | 2,500만 달러 시리즈 B. 오픈소스 + SaaS 전환 성공 사례 | **Ollama 오프라인 모드**만으로는 부족. Pre-commit hook + VS Code 확장을 차별화 요소로 |
| Gitleaks | 단순·빠름. CI/CD 파이프라인 표준 | LAON은 Gitleaks의 대체가 아닌 **보완재**. "Gitleaks로 1차 필터링 → LAON으로 정밀 분석" |

**수정된 USP**:
> "GitHub 밖의 코드도, 한국 클라우드 키도, 인터넷 없이도 — 멀티 LLM이 교차 검증하는 시크릿 감시"

### 3.2 MY-IP — 현실적 포지셔닝

| 경쟁 요소 | 실제 상황 | 대응 전략 |
|----------|----------|-----------|
| ipcheck.ing (MyIP 공식 데모) | 이미 11.3k 스타. 완전판 기능 | Lab은 **경량판 + CTI 연계** 차별화. 완전판이 아니라 "보안 연구자의 진단 도구 모음"으로 포지셔닝 |
| ipinfo.io | API 기반, 유료 | MaxMind + 자체 GeoIP DB로 무료 대체 |
| whatismyip.com | 광고 범벅, 기능 제한 | 광고 없는 클린 UX + 다국어(이미 한글 지원) |

**수정된 차별화**:
> MY-IP를 그대로 배포하는 것이 아니라, **보안 연구자에게 필요한 5가지 핵심 기능**만 선별해 Lab에 통합. CTI 연계로 "이 IP에서 발견된 APT 활동"까지 연결.

### 3.3 통합 Lab의 강점 (SWOT)

| 강점 (Strengths) | 약점 (Weaknesses) |
|-----------------|-------------------|
| • CTI + 진단 도구 + 스캐너를 단일 도메인에서 제공 | • 1인 개발. 지속적 유지보수 리스크 |
| • 모든 인프라 무료 티어. 운영비 $0 | • MTR/속도 테스트 등 핵심 기능 제외 |
| • 한국어 완벽 지원. 한국 시장 선점 가능 | • LAON VaultGuard는 CLI 도구 — 웹 데모 전환에 한계 |
| • 기존 vibequant.cc 방문자(퀀트/보안)에게 자연스러운 확장 | • Free Tier 한도(Neon 100h, Redis 10k cmd)에서 트래픽 증가 시 대응 어려움 |

| 기회 (Opportunities) | 위협 (Threats) |
|---------------------|---------------|
| • 틴왕 AWS 키 노출(2026.06) 등 한국 보안 사고 증가로 수요 ↑ | • GitHub Secret Protection AI가 급속도로 발전 중 |
| • 중소기업·스타트업 대상 무료 보안 감사 도구 수요 | • TruffleHog, GitGuardian의 시장 지배력 강화 |
| • Cloudflare + Vercel 무료 티어의 "제로 비용 운영" 스토리텔링 | • "AI 생성 코드 70%" 프로젝트의 신뢰도 문제 |

---

## 4. 마케팅 및 SNS 홍보 방안

### 4.1 타겟 세분화 (원안 수정)

| 세그먼트 | 규모 | 니즈 | 채널 | 퍼널 목표 |
|----------|------|------|------|-----------|
| **한국 개발자 (주니어~시니어)** | 약 50만 명 | GitHub에 실수로 키 올리기 전에 체크 | OKKY, 인프런, Velog | VS Code 확장 다운로드 |
| **보안 입문자** | 약 5만 명 | 무료 보안 도구 학습 | 디스코드, 유튜브 | Lab 방문 → CLI 설치 |
| **스타트업 CTO** | 약 2만 개사 | 비용 없는 보안 감사 | LinkedIn, X | 무료 스캔 실행 |
| **vibequant.cc 기존 방문자** | 월 약 5천~1만 PV | CTI + 실용 도구 | 뉴스레터, vibequant.cc 배너 | Lab 체류 시간 증가 |

### 4.2 콘텐츠 캘린더 (6주)

| 주차 | 콘텐츠 | 채널 | 측정 지표 |
|------|--------|------|-----------|
| **W1** | "한국판 TruffleHog? LAON VaultGuard 소개" | LinkedIn 아티클, GitHub README | ★ Star, Fork |
| **W2** | "Cloudflare + Vercel로 월 $0에 보안 연구실 운영하기" | Velog, X (Thread) | 조회수, 북마크 |
| **W3** | "내 GitHub 레포에 AWS 키가 있을까? 5분 무료 스캔" | YouTube Shorts (60초) | 조회수, Lab 전환율 |
| **W4** | "Gitleaks vs LAON VaultGuard: 같은 레포, 다른 결과" | HackerNews, r/netsec | 토론, 인바운드 링크 |
| **W5** | "사이버보안 체크리스트 258: 당신의 점수는?" | X (인포그래픽), 인프런 | 다운로드, 공유 |
| **W6** | "vibequant.cc Lab 오픈 — IP 진단 + 시크릿 스캔 무료" | 전체 채널 동시 발표 | DAU, GitHub Star |

### 4.3 채널별 운영 전략

| 채널 | 전략 | 콘텐츠 유형 |
|------|------|------------|
| **GitHub** | README 다국어, "good first issue" 5개, 기여자 배지 | 문서, 코드 |
| **LinkedIn** | 보안 인사이트 + vibequant.cc 링크 | 장문 아티클 (주 1회) |
| **X (Twitter)** | 짧은 팁, CTI 속보, 빌드 로그 | 280자 이내 스레드 (주 3회) |
| **YouTube** | 튜토리얼 + 데모 | 5~15분 영상 (월 2회) |
| **OKKY / 인프런** | 한국어 기술 블로그 포스팅 | 3,000자 이상 (월 2회) |

### 4.4 오픈소스 성장 전략

```
GitHub Star → Lab 방문 → 무료 스캔 → VS Code 확장 설치 → Pre-commit hook → 유료 전환 (장기)
```

- `npx laon-vaultguard scan` CLI 명령어가 Lab에서 CTA로 노출
- VS Code Marketplace 배지 GitHub README에 부착
- `awesome-security` 리스트에 PR 제출

---

## 5. 단계별 구현 로드맵

### Phase 0 — 기반 정비 (1주, 현재~8/3)

| 작업 | 상세 | 소유자 |
|------|------|--------|
| **Lab 페이지 기본 UI** | `pages-lab/index.html` → 대시보드 레이아웃 (3패널: MY-IP / VaultGuard / CTI) | FE |
| **Vercel 프로젝트 생성** | `vibequant-lab` Next.js 앱 생성 (CASSANDRA AI와 동일 팀) | Infra |
| **Neon DB 스키마** | MaxMind IP table + scan_results table + cti_feed cache | Backend |
| **Redis 설정** | Rate limit + scan job queue 전용 (IP 캐시는 Cloudflare CDN이 담당) | Infra |
| **CI/CD** | GitHub Actions → Vercel 자동 배포 (CASSANDRA AI 패턴 복사) | DevOps |

### Phase 1 — MY-IP Light (1~2주, 8/4~8/17)

| 기능 | API 엔드포인트 | 프론트엔드 |
|------|---------------|-----------|
| IP 조회 (본인) | `GET /api/myip` → IP, GeoIP, ASN | 카드형 결과 UI |
| IP 검색 (임의) | `GET /api/myip?ip=8.8.8.8` | 검색창 + 결과 비교 |
| DNS 누출 테스트 | 순수 FE (fetch 5개 DNS resolver) | 테이블형 결과 (Resolver × 결과) |
| WebRTC 검사 | 순수 FE (RTCPeerConnection) | ICE candidate 리스트 |
| 브라우저 핑거프린트 | 순수 FE (Canvas + AudioContext) | 해시값 + 엔트로피 점수 |
| 검열 차단 확인 | `POST /api/myip/censorship { urls[] }` | URL 입력 → 국가별 차단 결과 테이블 |
| 보안 체크리스트 | 순수 FE (localStorage) | 258항목 체크리스트 + 점수 |

### Phase 2 — VaultGuard Demo (2~3주, 8/18~9/7)

| 기능 | API 엔드포인트 | 프론트엔드 |
|------|---------------|-----------|
| URL 스캔 | `POST /api/vaultguard/scan { url }` → scan_id | URL 입력 폼 + 진행상황 바 |
| 진행상황 | `GET /api/vaultguard/scan/:id` (SSE) | SSE EventSource → 실시간 로그 |
| 결과 보기 | `GET /api/vaultguard/scan/:id/result` | 시크릿 유형별 그룹화, 시각화 |
| SARIF 다운로드 | `GET /api/vaultguard/scan/:id/sarif` | 다운로드 버튼 |
| VS Code 확장 | 정적 파일 + Marketplace 링크 | 다운로드 CTA 카드 |
| 멀티 LLM 비교 | 결과 페이지에 모델별 confidence 비교 차트 | Provider × Confidence 매트릭스 |

### Phase 3 — CTI 연계 (1~2주, 9/8~9/21)

| 기능 | 구현 |
|------|------|
| 스캔 결과 ↔ CTI 리포트 연결 | 발견된 시크릿 유형 → 관련 CTI 리포트 태그 → 링크 |
| IP 지리정보 → APT 그룹 매핑 | 사용자 IP 국가 → 해당 지역 활동 APT 그룹 리포트 표시 |
| CTI 피드 (실시간) | `GET /api/cti/feed` → 최근 7일 CTI 리포트 요약 |
| 연관 분석 카드 | Lab 하단: "이 IP에서 동일 국가의 APT 3건 활동 중" 배너 |

### Phase 4 — 지속 고도화 (9/22~)

| 작업 | 상세 |
|------|------|
| 사용자 피드백 수집 | Lab에 간단한 피드백 위젯 (Umami 이벤트 + Netlify Forms) |
| 성능 모니터링 | Umami 커스텀 이벤트: scan_started, scan_completed, sarif_downloaded |
| SEO 최적화 | Lab 각 기능별 메타 태그 + 구조화 데이터 |
| 콘텐츠 확장 | "이번 주 발견된 시크릿 Top 5" 위클리 리포트 (자동 생성) |
| 확장 가능성 검토 | MTR/속도 테스트를 위한 전용 VPS 비용 대비 가치 평가 |

---

## 6. 기술적 리스크 및 대응

| 리스크 | 가능성 | 영향 | 대응 |
|--------|--------|------|------|
| Neon 100h 컴퓨팅 초과 | 중 | 서비스 중단 | Cloudflare CDN 캐시 적극 활용 (max-age=3600) → Neon 쿼리 최소화 |
| Vercel 60s timeout (스캔) | 상 | 대형 레포 스캔 실패 | 스캔 크기 제한 (50MB, 500파일) + chunked 응답 |
| Upstash 10k cmd 초과 | 하 (↓) | Rate limit 일시 해제 | IP 캐시는 Cloudflare CDN으로 이전 → 남은 커맨드는 Rate limit·Job queue 전용 (월 3,000 미만) |
| MaxMind 라이선스 변경 | 저 | GeoIP 기능 중단 | IPAPI.is / IP2Location fallback |
| DeepSeek API 중단/가격 인상 | 중 | LLM 스캔 불가 | Ollama fallback (단, Serverless에서는 Ollama 실행 불가 → Claude로 전환) |
| "AI 코드 70%" 신뢰도 이슈 | 저 | 채택률 저하 | LAON VaultGuard는 0.5까지 안정화, 자체 백테스트 54건 통과 |

---

## 7. 성공 지표 (MVP 기준, Phase 2 완료 시)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| Lab 월간 활성 사용자 | 500+ | Umami Analytics |
| 스캔 실행 횟수 (월) | 200+ | Neon `scan_results` COUNT |
| VS Code 확장 다운로드 | 100+ | VS Marketplace 통계 |
| GitHub Star 증가 | +100 | GitHub Insights |
| 평균 세션 시간 | 3분+ | Umami |
| SARIF 다운로드 수 | 50+/월 | API 카운터 |

---

## 8. 부록: 기존 인프라 현황

| 리소스 | 상태 | 비고 |
|--------|------|------|
| vibequant.cc (Cloudflare Pages) | ✅ 운영 중 | `VibeQuant/pages/` |
| lab.vibequant.cc | ✅ 배포됨, "곧 연결" 상태 | `VibeQuant/pages-lab/` (빈 페이지) |
| cti.vibequant.cc | ✅ 운영 중 | `VibeQuant/pages-cti/` |
| CASSANDRA AI (Vercel) | ✅ 운영 중 | `dart-monitor-pi.vercel.app`, Next.js 15 + Prisma + Neon + Redis |
| toss-dashboard (Vercel) | ✅ 운영 중 | Next.js 15 + Drizzle + Neon + Redis |
| LAON VaultGuard v0.5 | ✅ 출시 완료 | npm 패키지, 54 tests pass, Docker 지원 |
| MY-IP (upstream) | ✅ 11.3k Star | jason5ng32/MyIP, MIT 라이선스 |

---

> *"정규식은 속도, LLM은 문맥 — 둘을 함께 쓸 때 진짜 안정성이 확보됩니다."*
>
> *vibequant.cc Lab은 단순한 도구 모음이 아니라, CTI 인텔리전스와 실용적 보안 진단을 연결하는 연구 공간입니다.*
