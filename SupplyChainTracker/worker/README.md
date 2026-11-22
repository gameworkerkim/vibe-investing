# SupplyChainTracker Worker

Cloudflare Workers + Hono + D1 기반 인증·관리 API (이메일 로그인 + 관리자 승인).

## 실행

```bash
cd worker
npm install
npm run db:migrate:local   # 로컬 D1 마이그레이션 + 관리자 시드
npm run dev                # http://localhost:8787
```

- `/` 홈, `/login` 로그인, `/signup` 가입 신청, `/dashboard` 대시보드
- API: `/api/auth/*`, `/api/admin/*`, `/api/health`

## 초기 관리자

| 항목 | 값 |
|---|---|
| 이메일 | testcode@naver.com |
| 비밀번호 | admin12345 (최초 로그인 시 강제 변경됨) |

## 인증 흐름

1. `POST /api/auth/signup` → `pending` 상태로 저장
2. 관리자가 `/dashboard`에서 승인/거부 (`POST /api/admin/users/:id/approve|reject`)
3. 승인된 사용자만 로그인 가능
4. `must_change_password=1` 계정은 최초 로그인 후 비밀번호 강제 변경
5. 비밀번호는 PBKDF2-SHA256(100,000회, 랜덤 솔트) 해시 저장, 세션은 HttpOnly 쿠키

## 배포 (Cloudflare 계정 인증 필요 — 수동 확인 사항)

```bash
npx wrangler login                                    # 1. 계정 로그인 (브라우저 인증)
npx wrangler d1 create sct-db                         # 2. 원격 D1 생성 → database_id 발급
#    → wrangler.toml 의 database_id 를 발급값으로 교체
npm run db:migrate:remote                             # 3. 원격 마이그레이션 + 관리자 시드
npm run deploy                                        # 4. Workers 배포
```

- Workers 무료 티어는 요청당 CPU 10ms 제한 → PBKDF2 100,000회 연산이 초과할 수 있음.
  로그인 시 CPU 초과가 발생하면 Workers 유료 플랜(Standard) 또는 반복 횟수 조정(`src/password.ts`의 `ITERATIONS`).
- 이후 M2(수집기)에서 SAM.gov API 키, M3(AI 분석)에서 OpenAI API 키가 추가로 필요함.

## 파일 구조

```
worker/
├── migrations/        # D1 스키마 + 관리자 시드
├── src/
│   ├── index.ts       # Hono 앱 + 페이지 라우팅
│   ├── auth.ts        # signup/login/me/change-password/logout
│   ├── admin.ts       # 사용자 승인·거부, 감사 로그
│   ├── middleware.ts  # 세션 인증 미들웨어
│   ├── password.ts    # PBKDF2 해시/검증
│   ├── session.ts     # 세션 토큰·쿠키
│   ├── audit.ts       # 감사 로그
│   └── html.ts        # 최소 HTML UI
└── wrangler.toml
```
