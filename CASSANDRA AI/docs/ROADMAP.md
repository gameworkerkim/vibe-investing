# CASSANDRA AI — 작업 로드맵

## 완료 (v0.7.0) — 2026-06-24

### 코어
- [x] 관계망 그래프 (Cytoscape.js) + 통합 검색
- [x] 실시간 검색어 순위 (24시간)
- [x] 핀보드 + 리포트 (MD 다운로드)
- [x] 동명이인 생년월일 구분 (SameNameGroup)
- [x] BAD ASS / Good 투표 + 댓글
- [x] 제보·분석요청 게시판
- [x] CB 신호 6종 자동 탐지
- [x] 법인명 변경 추적 (CorpEvent)
- [x] 경제 지표 대시보드 (Naver 모바일 API)
- [x] 코스닥 100종목 추출 + JSON 데이터
- [x] 3,920개 상장사 DART corp_code 매핑
- [x] 로그인 + 세션 (Supabase SSR Auth)
- [x] 챗봇 DART 분석 (4단계 검색)
- [x] 공시 분석 패널 (위험 신호 + 카테고리)
- [x] WIKI — 주식셀럽 (10명 + 코멘트)
- [x] DART 지식베이스 (사명변경·대주주·소송 82건)
- [x] 시총 하위 200개사 3개월 공시 캐싱
- [x] 일일 공시 동기화 (`npm run daily` + 8종 룰셋)
- [x] DB: 541개사, 2,630건 공시
- [x] Vercel + Neon 배포 ($0/월)
- [x] vibe-investing Lab 허브 (`https://vibequant.cc/lab/`) — 기본 탭 DART Monitor. Apex HTML은 `VibeQuant/pages/lab/` (Pages `vibequant-web`). 앱 소스는 이 레포가 아니라 [`cassandra-ai`](https://github.com/gameworkerkim/cassandra-ai) Root `./`

### SpaceX 대시보드 (`/spacex`)
- [x] SPCX 티커 교체 (UFO → SPCX), 스테일 종목 자동 DB 정리
- [x] Yahoo Finance 신규 IPO 종목 null-price 처리 (목록에서 누락 안 됨)
- [x] nitter 전면 차단 → Google News RSS 폴백
- [x] 뉴스 HTML 엔티티(`&lt;a href=...`) 디코딩 수정

### 퀀트 대시보드 (`/quant`) 실데이터 전환
- [x] ARDS-X: `Math.random()` 더미 → QQQ 실데이터(MA20/MA60/RSI/VIX) + 레짐 4단계
- [x] AMQS-M7: 하드코딩 → NVDA·AVGO·AMD·QCOM·ASML·MU·TSM Yahoo Finance 실데이터
- [x] ARDS 헤지: 고정 65%/25%/10% → `calculateHedgeWeight(regime)` 동적 산출
- [x] NASDAQ 주간 Top: `weeklyData()` 하드코딩(6/8-6/13 고정) → `range=5d` 실데이터
- [x] Redis 캐시 30분(장중) / 2시간(마감후)

### TQQQ 투자 관리 (`/tqqq`) — 관리자 전용
- [x] QQQ/TQQQ/QLD/TLT/IEF 실시간 시세 (Yahoo Finance 6mo)
- [x] RSI14·Williams%R·SMA20/50·drawdown20d 자동 계산
- [x] 딥바잉 트랜치 5단계 (-3%/-5%/-8%/-12%/-20%)
- [x] 일일 액션 알람 (STRONG_BUY / BUY / WATCH / HOLD / REBALANCE)
- [x] 투자 로그 입력/조회/삭제 (Neon DB `TqqqLog` 테이블 자동 생성)
- [x] DCA 플래너 + 백테스트 시뮬레이션 (4개 시나리오 × 4개 금액 × 4개 기간)
- [x] QLD vs TQQQ 비교 테이블 (2배 vs 3배 레버리지)
- [x] 헤더 관리자 탭에 📈 TQQQ 추가

### 🇺🇸 Trump Pick 대시보드 (`/trump`) ⭐ NEW
- [x] 헤더에 🇺🇸 Trump Pick 탭 추가 (SpaceX 옆)
- [x] Truth Social Mastodon API → RSS 애그리게이터 → 직접 RSS 3단계 폴백
- [x] Google News RSS 7개 쿼리 + Yahoo News 병렬 수집
- [x] DeepSeek V3(`deepseek-chat`) 분석: 의도 요약·무드·종목 픽 BUY/SELL
- [x] 증분 캐싱: 신규 항목 해시 비교 → 신규만 배치 한국어 번역 → 변동 없으면 재분석 안 함
- [x] Redis 3키: `trump:seen-hashes`(48h) / `trump:items`(24h) / `trump:analysis`(1h)
- [x] 뉴스·SNS 모든 항목 한국어 요약 + 원문 토글(`<details>`)
- [x] 트루스소셜 탭 → "인용 뉴스" 방식으로 재구성 (직접 RSS 차단 대응)
- [x] 하단 투자 위험 고지 명기
- [x] 로딩 메시지 "Claude" → "AI"

### 네비게이션 정리
- [x] 인명검색 상단 메뉴에서 제거 → WIKI 탭 내부로 통합
- [x] Trump Pick 탭 중복 헤더 렌더링 버그 수정

---

## 진행 중

### 데이터 확장
- [ ] 전체 코스닥 상시 공시 캐싱
- [ ] DART dsab007 인물명 검색 파이프라인
- [ ] 공시-뉴스 크로스레퍼런스

### LLM 파이프라인
- [ ] DeepSeek V3 NER (개체명 인식) 코스닥 연동
- [ ] 다중 LLM 앙상블 → 신호 발화
- [ ] 주식셀럽 → 시스템 프롬프트 주입

### Trump Pick 고도화
- [ ] Truth Social 유료 API 또는 스크래핑 서비스 연동 (scrapecreators 등)
- [ ] 트럼프 정책 카테고리별 섹터 영향 이력 DB화
- [ ] 알림 (신규 포스트 감지 → 카카오/슬랙 Webhook)

### 인프라
- [ ] OCI Always Free 크롤러 서버
- [ ] CI/CD 자동화
