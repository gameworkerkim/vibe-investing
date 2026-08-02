# Leaf — 모바일 웹 화보집 뷰어

> Cloudflare 무료 티어 기반, 이미지 보호(워터마크)가 적용된 웹 화보집 서비스.

## 라이브

- **뷰어**: https://vibequant.cc/Leaf/
- **유출 정보 추출 (감사)**: https://vibequant.cc/Leaf/audit — 이미지 업로드 시 LSB 페이로드(세션/IP/이메일/앨범/페이지/시각) 추출
- 배포: [`docs/03-배포-가이드.md`](docs/03-배포-가이드.md)
- 유출 검증: [`docs/04-유출검증-가이드.md`](docs/04-유출검증-가이드.md)

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/01-기능명세.md`](docs/01-기능명세.md) | 기능 명세 (회원/앨범/뷰어/결제/관리자/보안/아키텍처) |
| [`docs/02-이미지보호-기술검증.md`](docs/02-이미지보호-기술검증.md) | 이미지 복사·캡처 방지 기술 실측 검증 보고서 |
| [`docs/03-배포-가이드.md`](docs/03-배포-가이드.md) | 배포 구성·재배포·이미지 업로드 방법 |
| [`docs/04-유출검증-가이드.md`](docs/04-유출검증-가이드.md) | 유출본에서 열람자 식별·LSB 추출 절차 |

## 보안 기능 (로드맵 1~4단계 반영, 2026-08-02)

| 기능 | 설명 |
|---|---|
| 세션 필수화 | `leaf_sid` 쿠키 없는 meta·이미지 요청 403 |
| 서명 URL | `?exp=&sig=` (HMAC-SHA256·세션 바인딩·TTL 120s), meta에서 발급 |
| 레이트리밋 | D1 기반 분당: 이미지 15/세션, 60/IP, 알림 5/세션, meta 10/세션 |
| 서버 변형 WM (주력) | 페이지당 16종 변형을 세션에 결정적 배정, `v{n}` 태그로 유출 역추적 |
| 원본 격리 | `origin/`(고해상도)는 R2에만 보관, 서빙은 900px 변형만 |
| 신원 시각 WM | `email`·`sessionId(8)` 반투명 표시 + canvas 베이크 (행별 시프트, IP 제외) |
| 비가시 LSB WM | `LEAFWM1` JSON을 Blue LSB에 삽입 (PNG 무손실에만 유효·보조) |
| 세션→IP 추적 | D1 `sessions` (IP는 서버 전용, 화면 미노출) |
| 캡처 징후 로그 | `POST /Leaf/api/capture-alert` → D1 (서버 신뢰소스, detail allowlist) |
| 관리자 로그 | `GET /Leaf/api/capture-log` — `Authorization: Bearer` 필수 |
| 입력 차단 | 우클릭·인쇄 단축키 등 |

**보안 회귀 테스트**: `LEAF_ADMIN_TOKEN=<토큰> ./scripts/security-check.sh` (라이브 17/17)
상세: [`05-보안-개선-로드맵.md`](docs/05-보안-개선-로드맵.md)

유출 시 **1차 추적 = 시각 신원 문자열**, LSB는 보조. 상세는 [`04-유출검증-가이드.md`](docs/04-유출검증-가이드.md).

## 핵심 아키텍처 결정

- 원본 이미지는 **private R2**에 격리, Workers 게이트로 서빙
- 워터마크는 **업로드 시 사전 합성(프리-컴포지트)** — Workers 무료 티어 CPU 10ms 제한 회피
- **뷰어별 신원 워터마크**: `api/viewer-identity` → CSS + canvas 베이크 + LSB(`LEAFWM1`)
- 세션·캡처 로그: **D1**
- LSB 추출기: [`scripts/extract-invisible-wm.html`](scripts/extract-invisible-wm.html) · 라이브: `/Leaf/audit`

## 디렉터리

```
worker/       Cloudflare Worker (vibequant.cc/Leaf*) + ASSETS 뷰어
scripts/      prepare-and-upload.js, extract-invisible-wm.html
docs/         기능명세·기술검증·배포·유출검증
prototype/    로컬 검증용 Express+sharp 프로토타입
```

## 상태

- [x] P0 — 기능 명세 + 기술 검증
- [x] MVP 배포 — vibequant.cc/Leaf/ (뷰어 + R2 + 신원 WM + LSB + 캡처 알림)
- [x] 보안 로드맵 1~4단계 — 접근 통제 + 서버 변형 WM + 견고성 + 결함·비용 (17/17 통과)
- [ ] P3 이후 — 인증·결제·관리자 (로드맵은 기능 명세 §13)
