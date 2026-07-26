---
title: "Toss Open API 보안 정책 변화 — 인디 개발자가 겪는 IP 화이트리스트의 함정"
title_en: "Toss Open API IP Whitelist Shift — Caution for Indie Developers"
subtitle: "OAuth는 되는데 CI·로컬에서는 안 된다: 지정 IP만 허용하는 증권 Open API의 실전 주의점"
description: "Toss Open API가 지정 IP만 허용하도록 정책을 강화한 뒤 GitHub Actions와 로컬에서 OAuth가 실패했고, CASSANDRA 코스닥 파이프라인을 Naver Finance로 롤백한 실전 기록입니다."
abstract: |
  토스증권 Open API는 국내·해외 시세를 OAuth Client Credentials로 다루기 좋아 인디 퀀트·모니터링 프로젝트에 매력적이다.
  그러나 호출 허용 IP를 콘솔에 등록한 고정 주소로 제한하는 보안 정책이 강화되면, GitHub-hosted runner처럼 IP가 매번 바뀌는 환경과 집 공인 IP가 바뀌는 로컬에서는 토큰 발급부터 실패한다.
  CASSANDRA AI는 한 달간 KOSDAQ 산출물이 []로 쌓였고, 원인은 DART가 아니라 Toss OAuth였다. 본 글은 테스트·운영 경험과 Naver Finance 롤백 결정, 인디 개발자가 증권 Open API를 고를 때 볼 체크리스트를 정리한다.
summary_for_ai: |
  전제: Toss Open API OAuth Client Credentials + IP allowlist. 데이터 기준일 2026-07-26.
  한계: 토스 콘솔 UI·정책 문구는 시점 의존. 투자 비권유. 코드 근거는 gameworkerkim/cassandra-ai.
date: 2026-07-26
updated: 2026-07-26
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - Toss
  - OpenAPI
  - 보안
  - 인디개발
  - GitHubActions
  - NaverFinance
  - CASSANDRA
keywords:
  - "Toss Open API IP 화이트리스트"
  - "증권 API OAuth 인디 개발"
  - "GitHub Actions 동적 IP"
  - "Naver Finance 롤백"
group: fintech-api
featured: true
featured_rank: 12
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---

# Toss Open API 보안 정책 변화 — 인디 개발자가 겪는 IP 화이트리스트의 함정

## OAuth는 되는데 CI·로컬에서는 안 된다

2026.07.26 김호광 / Dennis Kim

---

## 1. 도입

증권사 Open API는 인디 개발자에게 “공식 스펙 + 키만 있으면 되는” 길로 보인다. 토스증권 Open API도 예외가 아니었다. OAuth 2.0 Client Credentials, 국내·해외 시세 배치 조회, 문서와 `llms.txt`까지 갖춰져 있어 CASSANDRA AI(코스닥 DART 리스크 모니터)의 시세 레이어를 Naver Finance 비공식 모바일 API에서 Toss로 옮겼다.

한 달 뒤 대시보드의 코스닥 이상징후 리포트는 `totalStocks: 0`, 하위 JSON은 전부 `[]`였다. DART 키도 살아 있었고, GitHub Actions도 초록불이었다. 원인은 공시가 아니라 **시세 OAuth가 지정 IP 밖에서는 발급되지 않는 보안 정책**이었다.

이 글은 비난이 아니라 **주의점**이다. 금융 Open API의 IP 바인딩은 합리적 보안이지만, 인디·사이드프로젝트·공개 CI와는 상성이 나쁘다. 테스트와 운영에서 실제로 겪은 패턴을 남긴다.

---

## 2. 무엇을 붙였고, 무엇이 깨졌나

### 2-1. 전환 당시의 선택 (2026-06)

| 항목 | 내용 |
|------|------|
| 대상 레포 | [cassandra-ai](https://github.com/gameworkerkim/cassandra-ai) (로컬: dart-monitor) |
| 전환 커밋 | `56056d0` — Naver Finance → Toss Open API |
| 사용처 | `extract-kosdaq.ts`, `naver-crawler.ts`, `/api/quant-data`, `backfill-marketcap.ts` |
| 인증 | `POST /oauth2/token` · `grant_type=client_credentials` |
| 시세 | `GET /api/v1/prices`, `GET /api/v1/candles` |
| 실행 환경 | GitHub Actions (daily-sync, KST 09:00/18:00) + 로컬 |

의도는 분명했다. 비공식 스크래핑 대신 공식 API, GHA vars에 `TOSS_CLIENT_ID` / `TOSS_CLIENT_SECRET`만 넣으면 되는 구조.

### 2-2. 증상

- `data/kosdaq-anomaly-report.json` → `totalStocks: 0` (2026-06-26 `f81e2f3` 이후 연속)
- `kosdaq-*-.json` 전부 `[]`
- 스크립트 로그: `⚠️ Toss 토큰 발급 실패` → `⚠️ Toss 토큰 없음 — 빈 목록 반환`
- GHA 스텝은 `continue-on-error: true` + 스크립트 **exit 0** → 워크플로 성공 + 빈 JSON 자동 커밋

즉 **실패가 성공으로 포장**된 파이프라인이었다. 보안 정책이 바뀌어도 모니터링이 “정상”으로 보이면 한 달을 허비한다.

### 2-3. 원인: 지정 IP만 허용

토스 Open API 콘솔/정책 측에서 **등록된 IP에서만** 토큰·호출을 허용하도록 강화된 상태였다. 클라이언트 시크릿이 맞아도, 호출 원 IP가 allowlist 밖이면 OAuth가 거절된다.

| 환경 | IP 특성 | 결과 |
|------|---------|------|
| 집/카페 로컬 | 공인 IP 가변 · CGNAT | 토큰 실패 |
| GitHub-hosted runner | 매 job마다 IP 풀에서 할당 | 토큰 실패 |
| 고정 IP VPS / 사무실 회선 | allowlist에 등록 가능 | (이론상) 통과 |

인디 개발자가 흔히 쓰는 **GHA + 노트북** 조합이 정확히 막히는 지점이다.

---

## 3. 테스트·사용 경험에서 얻은 체크리스트

### 3-1. 토큰 발급을 먼저 계측하라

초기에 `getTossToken()`은 `!res.ok`일 때 경고만 찍고 HTTP status·body를 남기지 않았다. 401(자격증명)과 403(IP/정책)을 구분할 수 없으면 “키가 죽었다”고만 오해한다.

로컬에서 최소 검증:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST \
  'https://openapi.tossinvest.com/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=...&client_secret=..."
```

- **200** + `access_token` → 현재 IP는 allowlist 안
- **4xx** → 키 문제인지 IP 문제인지 body를 반드시 로그에 남길 것

### 3-2. “공식 API = CI 친화”는 아니다

| 질문 | 인디 프로젝트에서 볼 것 |
|------|-------------------------|
| IP allowlist가 있는가? | 있으면 GHA hosted는 사실상 탈락에 가깝다 |
| Self-hosted runner / 고정 IP가 필요한가? | 비용·운영 부담이 시크릿 관리보다 커질 수 있다 |
| 비공식 시세 API 폴백이 있는가? | Naver mobile API, Yahoo 등 — SLA 없지만 IP 바인딩은 없음 |
| 빈 응답을 성공으로 치는가? | `totalStocks===0` → fail 게이트가 필수 |

### 3-3. 시크릿을 `vars`에 넣지 마라

당시 GHA는 `vars.TOSS_CLIENT_*`를 썼다. repository variables는 로그·권한 측면에서 secrets보다 노출면이 넓다. IP 정책과 별개로, **자격증명은 항상 secrets**.

### 3-4. 제품 목적과 유니버스도 같이 점검

Toss 전환 과정에서 코스닥 소형주 동적 스크리닝(시총 5,000억 미만·SPAC 제외)이 깨지고, KOSPI 대형주 위주 하드코딩 유니버스로 바뀐 적도 있다. OAuth가 살아나도 **원래 가설(한계기업 이상징후)** 과 어긋날 수 있다. API 마이그레이션은 인증만이 아니라 **유니버스·필터·단위(억원 vs 원)** 회귀 테스트가 필요하다.

추가로 2026-07 기준 Naver `marketValue` API는 `sortType`(등락·거래량)을 무시하고 시총순만 반환한다. 롤백 시 **클라이언트 정렬**로 상승/거래량 랭킹을 복구했다. “예전에 되던 쿼리 파라미터”도 깨질 수 있다.

---

## 4. 우리가 내린 결정: Naver로 롤백

2026-07-26 기준 CASSANDRA 배치·시세 경로는 다시 **Naver Finance 모바일 API**를 쓴다.

| 레이어 | 롤백 후 |
|--------|---------|
| `scripts/extract-kosdaq.ts` | `m.stock.naver.com` marketValue + SPAC/시총 필터 복원 |
| `src/lib/naver-crawler.ts` | Naver 스크래핑 복원 |
| `/api/quant-data` | KOSDAQ 심리 게이지 Naver |
| `scripts/backfill-marketcap.ts` | Naver 시총 맵 → `Corp.marketCap` |
| GHA `daily-sync` | TOSS env 제거, `totalStocks=0`이면 exit 1 |

Toss 키와 콘솔 설정은 폐기하지 않아도 된다. **고정 IP ingest 머신(유휴 아이맥·VPS)** 을 두고 allowlist에 올리면 다시 쓸 수 있다. 다만 “공개 GHA만으로 $0 운영”을 목표로 하는 인디 스택에서는 Naver/Yahoo 쪽이 운용이 단순하다.

관련 코드: [gameworkerkim/cassandra-ai](https://github.com/gameworkerkim/cassandra-ai)  
인프라 방향(수집=배치, 서빙=Cloudflare): 동 레포 `docs/CLOUDFLARE_MIGRATION.md`

---

## 5. 인디 개발자를 위한 한 줄 원칙

1. **증권 Open API를 고를 때 문서의 “인증”만 보지 말고 “네트워크 바인딩(IP·Mutual TLS·기기)”을 먼저 보라.**  
2. **CI IP가 고정이 아니면, 그 API는 배치 파이프라인의 SPOF가 된다.**  
3. **빈 데이터를 성공으로 커밋하지 마라.** 한 달짜리 `[]` 히스토리보다 빨간 X가 싸다.  
4. **공식 API와 비공식 시세는 역할이 다르다.** 주문·계좌는 공식+고정망, 공개 모니터 시세는 폴백 가능한 소스.  
5. **정책은 바뀐다.** 키가 유효해도 어제 되던 호출이 오늘 막힐 수 있다 — health check에 OAuth 자체를 넣어라.

---

## 6. 정리

Toss Open API의 IP 화이트리스트는 금융권에서 자연스러운 보안 강화다. 문제는 인디 개발 기본 환경(노트북 + GitHub Actions)이 그 전제와 충돌한다는 점이다. CASSANDRA는 그 충돌을 “조용한 빈 JSON”으로 한 달간 겪었고, 코스닥 시세·시총 백필을 Naver로 되돌렸다.

증권 API를 사이드프로젝트에 붙이려는 사람에게 이 경험이 주는 메시지는 단순하다. **키가 아니라 네트워크 경계가 제품의 수명을 가른다.**

---

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다. Toss·Naver 등 상표는 각 권리자에게 속합니다.*
