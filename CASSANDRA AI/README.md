# CASSANDRA AI

> [!IMPORTANT]
> **이 프로젝트는 [vibe-investing](https://github.com/gameworkerkim/vibe-investing) 모노레포의 일부입니다.**
> 더 많은 퀀트 전략 · 칼럼 · 논문 · 보안 도구(LAON VaultGuard) · 투자 대시보드를 보려면 메인 레포를 방문하세요.
>
> **This project is part of the [vibe-investing](https://github.com/gameworkerkim/vibe-investing) monorepo.**
> Visit the main repo for more quant strategies, columns, papers, security tools (LAON VaultGuard), and investment dashboards.

> **Toss × DART × LLM 리스크 모니터링**
>
> 코스닥 1,822개 종목 DART 공시 실시간 분석 + 주식셀럽 관계망

배포: **[dart-monitor-pi.vercel.app](https://dart-monitor-pi.vercel.app)** · Lab 허브: **[vibequant.cc/lab](https://vibequant.cc/lab/)**

**소스 경로 (배포할 때 여기를 가리킬 것)**

| 무엇 | GitHub | Root / 업로드 경로 |
|---|---|---|
| DART Monitor 앱 (Vercel) | [`gameworkerkim/cassandra-ai`](https://github.com/gameworkerkim/cassandra-ai) | Root Directory **`./`** (패키지 이름 `dart-monitor`) |
| 모노레포 사본 | [`vibe-investing/CASSANDRA AI`](https://github.com/gameworkerkim/vibe-investing/tree/main/CASSANDRA%20AI) | 폴더명에 공백. Vercel Root로 쓰지 말 것 |
| Lab 페이지 `vibequant.cc/lab/` | [`vibe-investing/VibeQuant/pages/lab`](https://github.com/gameworkerkim/vibe-investing/tree/main/VibeQuant/pages/lab) | Pages `vibequant-web`에 `VibeQuant/pages` 전체를 업로드 |

---

## 현재 기능 (v0.7.0)

### 🔍 검색 + 관계망 분석
- 회사명·인물명·법인명 통합 검색 (3,920개 DART 기업)
- Cytoscape.js 관계망 그래프 (회사↔인물↔법인)
- 공시 분석 패널: 위험 신호 + 카테고리 + 타임라인
- 실시간 검색어 (24시간)

### 📊 퀀트 대시보드 (`/quant`)
- **ARDS-X**: QQQ 실데이터(MA20/MA60/RSI/VIX)로 시장 국면 4단계 분류 + 20일 히스토리 차트
- **AMQS-M7**: NVDA·AVGO·AMD·QCOM·ASML·MU·TSM 실데이터 기반 20일 모멘텀 + 종목별 시그널
- **ARDS 헤지**: 레짐에 따라 Long/헤지/안전자산 비중 자동 산출 + 프로그레스바
- **NASDAQ 상승·하락 TOP**: 데일리/주간 Top 20 실시간 (Yahoo Finance, 하드코딩 제거)
- Yahoo Finance 실시간 · 캐시 30분(장중) / 2시간(마감후)

### 🚀 SpaceX 대시보드 (`/spacex`)
- SPCX 포함 우주항공 관련주 실시간 시세 (Yahoo Finance)
- 스테일 종목(UFO 등) 자동 DB 정리
- Elon Musk 관련 Google News RSS + LLM 분석
- 뉴스 HTML 엔티티 디코딩 처리

### 🇺🇸 Trump Pick 대시보드 (`/trump`) ⭐ NEW
- **데이터 수집**: Truth Social Mastodon API → RSS 애그리게이터 → Google/Yahoo News 3단계 폴백
- **AI 분석**: DeepSeek V3(`deepseek-chat`)로 트럼프 의도 요약 + 영향 종목 BUY/SELL 평가
- **증분 캐싱**: 신규 항목만 탐지 → 한국어 배치 번역 → 신규 있을 때만 재분석 (Redis)
- **캐시 전략**: `trump:seen-hashes`(48h) / `trump:items`(24h) / `trump:analysis`(1h)
- **종목 픽**: STRONG_BUY / BUY / WATCH / SELL / STRONG_SELL + 신뢰도 바
- **탭 구성**: 종목 픽 / 뉴스(한국어 요약) / 트루스소셜 인용
- **리스크 고지**: 하단 투자 위험 고지 명기

### 📈 TQQQ 투자 관리 (`/tqqq`) — 관리자 전용
- **일일 액션 알람**: STRONG_BUY / BUY / WATCH / HOLD / REBALANCE 자동 판단
- **딥바잉 트랜치**: QQQ 20일 고점 대비 -3% / -5% / -8% / -12% / -20% 5단계
- **투자 로그**: 날짜·종목·주수·단가·USD/KRW 입력 → Neon DB 저장
- **보유 현황**: 평단가·손익 자동 계산
- **DCA 플래너**: 월 100만~500만원 × QQQ/TQQQ/채권 비중
- **백테스트 시뮬레이션**: QQQ 13% / QLD 19% / TQQQ 24% / 혼합 17% × 5~20년
- **QLD vs TQQQ 비교**: 2배 vs 3배 레버리지 장단점 테이블

### 👤 WIKI + 인명검색 (`/wiki`)
- 투자자 WIKI: 10명 주요 투자자 정보 (연관 기업·특이 패턴·뉴스)
- **인명검색 통합** (상단 메뉴에서 WIKI 탭으로 이동): DART 공시 인물 검색 + GitHub Actions 스크래핑

### 🤖 DART 분석 챗봇
- 4단계 검색: DB → DART API → 인물 → 실시간 폴백
- 카테고리별 공시 집계 (CB·소송·대주주·증자·합병)

### 📌 핀보드 + 리포트
- 관심 인물/회사 핀 고정 → 이상 징후 분석 리포트

### 💬 제보·분석 게시판 + 🗳️ 집단 평가

---

## 데이터

| 항목 | 규모 |
|---|---|
| DB 기업 | 541개사 |
| DB 공시 | 2,630건 |
| DART 매핑 | 3,920개 코스닥 |
| DART 실시간 | 최근 3개월 |
| 주식셀럽 | 10명 |
| 룰셋 | 8종 |
| 퀀트 종목 | QQQ + AMQS-M7 7종 + TQQQ/QLD/TLT/IEF |
| Trump Pick 관심 종목 | 11개 섹터 50+ 종목 |

---

## 실행

```bash
npm run dev          # 개발 서버
npm run daily        # 일일 공시 동기화 (09:00 / 18:00 cron)
npm run extract      # 코스닥 100종목 추출 + 이상 플래그
npm run setup        # DART API 키 입력
```

---

## 기술 스택

| 계층 | 기술 |
|---|---|
| 프레임워크 | Next.js 15.5 + TypeScript |
| DB | PostgreSQL (Neon Serverless) |
| ORM | Prisma 6 |
| 캐시 | Upstash Redis |
| UI | React 19 + Tailwind CSS 4 + Recharts + Cytoscape.js |
| 외부 API | DART OpenAPI · Yahoo Finance · Google News RSS · Truth Social |
| LLM | DeepSeek V3 (`deepseek-chat`) |
| 배포 | Vercel ($0) + Neon ($0) |

---

## 환경변수

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL |
| `DART_API_KEY` | DART OpenAPI |
| `DEEPSEEK_API_KEY` | Trump Pick AI 분석 (DeepSeek V3) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서버사이드 |
| `UPSTASH_REDIS_REST_URL` | Redis 캐시 |
| `UPSTASH_REDIS_REST_TOKEN` | Redis 캐시 |

---

## 문서

- [ROADMAP.md](docs/ROADMAP.md) — 작업 로드맵
- [SERVICE_FLOW.md](docs/SERVICE_FLOW.md) — 서비스 흐름도
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — 배포 전략
- [TECH_STACK.md](docs/TECH_STACK.md) — 기술 스택

---

## 라이선스

공익 목적. 상업적 이용 제한.
