# Cloudflare 빌드·배포 가이드 (한국어)

무료 티어 기준. **시세/CDN/대시보드**를 Cloudflare에 올리고, 퀀트 계산은 Pages의 Pyodide에서 실행합니다.

| 문서 | 언어 |
|---|---|
| 이 파일 | 한국어 |
| [DEPLOY.md](DEPLOY.md) | English |

---

## 0. 작업 디렉터리 (중요)

홈(`~`)이 아니라 **반드시** 아래 경로에서 실행하세요.

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
# 또는 레포 클론 경로:
# cd <repo>/VibeQuant/cloudflare
```

주석에 `→` 같은 특수문자가 있으면 zsh가 깨질 수 있습니다. **명령은 한 줄씩** 실행하세요.

---

## 1. 리소스 맵

| 리소스 | 이름 | 설정 파일 | 용도 |
|---|---|---|---|
| Worker | `vibequant-api` | `wrangler.toml` | `/api/*`, CDN `/cdn/*` |
| Pages | `vibequant-web` | `wrangler.pages.toml` | Pyodide 대시보드 (`../pages`) |
| D1 | `vibequant` | `schema.sql` | 메타/인덱스 |
| R2 | `vibequant-data` | binding `DATA` | 캔들 본체 (이후) |
| R2 | `vibequant-static` | binding `STATIC` | 정적·이미지 → CDN |
| CDN | Worker `/cdn/*` + Pages `_headers` | — | 엣지 캐시 |

**Worker와 Pages 설정을 섞지 마세요.**  
Pages 배포는 반드시 `--config wrangler.pages.toml` (또는 `./scripts/deploy.sh`).

---

## 2. 사전 준비

### 2.1 API 토큰 권한

[API Tokens](https://dash.cloudflare.com/profile/api-tokens) — Account 권한:

- Workers Scripts → **Edit**
- D1 → **Edit**
- Workers R2 Storage → **Edit**
- Cloudflare Pages → **Edit**
- Account Settings → **Read**

### 2.2 R2 활성화 (error **10042**)

```
Please enable R2 through the Cloudflare Dashboard [code: 10042]
```

1. Dashboard → **R2 Object Storage**
2. **Get started / Enable R2** (무료라도 결제수단 요구 가능)
3. `./scripts/bootstrap.sh` 재실행

### 2.3 Pages “already exists” (error **8000002**)

```
A project with this name already exists [code: 8000002]
```

→ **정상.** `vibequant-web`이 이미 있음. create를 건너뛰고 `./scripts/deploy.sh`로 진행.

### 2.4 npm peer 의존성

`package.json`은 `wrangler@^4.112` + `@cloudflare/workers-types@^5` 조합입니다.  
`ERESOLVE`가 나면:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 3. 빌드·배포 절차

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
npm install

# 1) 시크릿 → .dev.vars (TOSS 선택 + Cloudflare 키)
./scripts/setup-secrets.sh --local

# 2) D1 / R2 / Pages + schema + CDN smoke (원격 R2)
./scripts/bootstrap.sh

# 3) (선택) TOSS → Worker secrets
./scripts/setup-secrets.sh --remote

# 4) Worker + Pages 배포
#    deploy 출력의 *.workers.dev 주소를 그대로 사용
export VIBEQUANT_API_BASE="https://vibequant-api.<YOUR_SUBDOMAIN>.workers.dev"
./scripts/deploy.sh

# 5) 정적/이미지 → 원격 R2 → /cdn/*
./scripts/upload-static.sh ./static/images/logo.png images/logo.png
```

### 스크립트 역할

| 스크립트 | 역할 |
|---|---|
| `setup-secrets.sh --local` | `.dev.vars` + `account_id` 기록 |
| `setup-secrets.sh --remote` | TOSS → Worker secret |
| `bootstrap.sh` | D1/R2/Pages 생성, schema, R2 smoke (`--remote`) |
| `deploy.sh` | Worker deploy + Pages deploy (`wrangler.pages.toml`) |
| `upload-static.sh` | 파일/폴더 → R2 static (`--remote`) |

### Wrangler v4 주의: R2는 기본이 로컬

`Resource location: local` 이면 클라우드가 아닙니다.  
스크립트는 `--remote`를 사용합니다. 수동 업로드 시:

```bash
npx wrangler r2 object put vibequant-static/tests/hello.txt \
  --file=./static/tests/hello.txt \
  --content-type="text/plain; charset=utf-8" \
  --remote
```

### Pages 설정 파일 경고

```
missing the "pages_build_output_dir" field … Ignoring configuration file
```

→ Worker용 `wrangler.toml`을 Pages가 읽은 경우.  
`./scripts/deploy.sh`는 `wrangler.pages.toml`을 쓰도록 되어 있습니다. 수동 시:

```bash
npx wrangler pages deploy ../pages \
  --config wrangler.pages.toml \
  --project-name=vibequant-web \
  --commit-dirty=true
```

---

## 4. 정적·이미지 (CDN)

```
cloudflare/static/
  tests/hello.txt   # bootstrap이 원격 R2에 시드
  images/           # 업로드할 이미지
```

```bash
./scripts/upload-static.sh ./static/images/chart.png images/chart.png
./scripts/upload-static.sh ./static/images/
```

URL:

```text
$VIBEQUANT_API_BASE/cdn/images/chart.png
```

대시보드 (`pages/js/runtime-config.js`, deploy 시 생성):

```js
window.VIBEQUANT_API_BASE  // Worker URL
window.VIBEQUANT_CDN_BASE  // 보통 API + "/cdn"
```

---

## 5. 스모크 체크

```bash
curl -sS "$VIBEQUANT_API_BASE/api/health"
curl -sS "$VIBEQUANT_API_BASE/cdn/tests/hello.txt"
# Pages: https://vibequant-web.pages.dev/
```

로컬 대시보드만:

```bash
cd ../pages && python3 -m http.server 8787
# http://127.0.0.1:8787/
```

---

## 6. 설정 파일 요약

| 파일 | 용도 |
|---|---|
| `wrangler.toml` | Worker only (D1, R2 DATA/STATIC) |
| `wrangler.pages.toml` | Pages only (`pages_build_output_dir = "../pages"`) |
| `.dev.vars` | 로컬 시크릿 (**커밋 금지**) |
| `.dev.vars.example` | 플레이스홀더 |
| `schema.sql` | D1 스키마 |
| `../pages/_headers` | Pages 엣지 캐시 헤더 |

`database_id` / `account_id`는 bootstrap·setup-secrets가 로컬에 채웁니다.  
레포의 플레이스홀더(`REPLACE_WITH_D1_DATABASE_ID`)면 deploy가 거절하므로, 클론 후 bootstrap을 한 번 돌리세요.

---

## 7. 트러블슈팅

| 증상 | 조치 |
|---|---|
| `cd: no such file: cloudflare` | §0 절대 경로 사용 |
| npm `ERESOLVE` workers-types | `npm install` (types v5 + wrangler 4.112) |
| R2 `10042` | Dashboard에서 R2 Enable |
| Pages `8000002` | 이미 있음 → deploy 진행 |
| R2 `local` | `--remote` 또는 `upload-static.sh` 사용 |
| Pages `pages_build_output_dir` 경고 | `--config wrangler.pages.toml` |
| D1 placeholder | `./scripts/bootstrap.sh` |
