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

## 보안 기능 (로드맵 1단계 반영, 2026-08-02)

| 기능 | 설명 |
|---|---|
| 세션 필수화 | `leaf_sid` 쿠키 없는 meta·이미지 요청 403 |
| 서명 URL | `?exp=&sig=` (HMAC-SHA256·세션 바인딩·TTL 120s), meta에서 발급 |
| 레이트리밋 | D1 기반 분당: 이미지 15/세션, 60/IP, 알림 5/세션, meta 10/세션 |
| 서버 프리-컴포지트 WM | 업로드 시 Sharp로 공통 문구 합성 → R2 |
| 신원 시각 WM | `email` · `sessionId` · `IP`를 화면에 반투명 표시 + canvas 픽셀 베이크 |
| 비가시 LSB WM | `LEAFWM1` JSON을 Blue LSB에 삽입 (PNG 무손실에만 유효) |
| 세션 쿠키 | `leaf_sid` (HttpOnly, 30일) via `GET /Leaf/api/viewer-identity` |
| 캡처 징후 로그 | `POST /Leaf/api/capture-alert` → D1 (서버 신뢰소스, detail allowlist) |
| 관리자 로그 | `GET /Leaf/api/capture-log` — `Authorization: Bearer` 필수 |
| 입력 차단 | 우클릭·인쇄 단축키 등 |
| 원본 격리 | private R2, Workers 게이트만 서빙 |

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
- [x] 보안 로드맵 1단계 — 세션 필수화 + 서명 URL + 레이트리밋 + 로그/알림 보호 (17/17 통과)
- [ ] 단계 2~4 — 서버 신원 WM, WM 견고성, 결함·비용 (로드맵은 `docs/05`)
- [ ] P3 이후 — 인증·결제·관리자 (로드맵은 기능 명세 §13)
