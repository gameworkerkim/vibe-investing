# Leaf — 모바일 웹 화보집 뷰어

> Cloudflare 무료 티어 기반, 이미지 보호(워터마크)가 적용된 웹 화보집 서비스.

## 라이브

- **뷰어**: https://vibequant.cc/Leaf/
- 배포 구성·업로드 방법: [`docs/03-배포-가이드.md`](docs/03-배포-가이드.md)

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/01-기능명세.md`](docs/01-기능명세.md) | 기능 명세 (회원/앨범/뷰어/결제/관리자/보안/아키텍처) |
| [`docs/02-이미지보호-기술검증.md`](docs/02-이미지보호-기술검증.md) | 이미지 복사·캡처 방지 기술 실측 검증 보고서 |
| [`docs/03-배포-가이드.md`](docs/03-배포-가이드.md) | 배포 구성·재배포·이미지 업로드 방법 |

## 핵심 아키텍처 결정

- 원본 이미지는 **private R2**에 격리, Workers 게이트로 서빙
- 워터마크는 **업로드 시 사전 합성(프리-컴포지트)** — Workers 무료 티어 CPU 10ms 제한 회피
- 세션·Rate limit: **D1** (외부 의존성 없음)

## 디렉터리

```
worker/       Cloudflare Worker (vibequant.cc/Leaf*) + ASSETS 뷰어
scripts/      prepare-and-upload.js — 리사이즈+워터마크+R2 업로드
docs/         기능명세·기술검증·배포가이드
prototype/    로컬 검증용 Express+sharp 프로토타입
```

## 상태

- [x] P0 — 기능 명세 + 기술 검증
- [x] MVP 배포 — vibequant.cc/Leaf/ (뷰어 + R2 이미지 + 캡처 알림)
- [ ] P3 이후 — 인증·결제·관리자 (로드맵은 기능 명세 §13)
