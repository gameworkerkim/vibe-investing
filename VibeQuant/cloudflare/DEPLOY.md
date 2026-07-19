# Cloudflare build & deploy guide (English)

Free-tier oriented. **Market data / CDN / dashboard** run on Cloudflare; quant compute runs in the browser via Pyodide on Pages.

| Doc | Language |
|---|---|
| This file | English |
| [DEPLOY_KR.md](DEPLOY_KR.md) | 한국어 |

---

## 0. Working directory (required)

Do **not** run from `$HOME`. Always:

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
# or: cd <clone>/VibeQuant/cloudflare
```

Avoid pasting comments that contain special arrows (`→`) into zsh — run **one command per line**.

---

## 1. Resource map

| Resource | Name | Config | Role |
|---|---|---|---|
| Worker | `vibequant-api` | `wrangler.toml` | `/api/*`, CDN `/cdn/*` |
| Pages | `vibequant-web` | `wrangler.pages.toml` | Pyodide dashboard (`../pages`) |
| D1 | `vibequant` | `schema.sql` | Meta / index |
| R2 | `vibequant-data` | binding `DATA` | Candle bodies (later) |
| R2 | `vibequant-static` | binding `STATIC` | Static tests & images → CDN |
| CDN | Worker `/cdn/*` + Pages `_headers` | — | Edge cache |

**Do not mix Worker and Pages configs.**  
Pages does **not** support `--config` / custom wrangler paths.  
Keep Pages config in `../pages/wrangler.toml` and deploy with  
`cd ../pages && wrangler pages deploy .` (or `./scripts/deploy.sh`).

---

## 2. Prerequisites

**Secrets (DeepSeek / Cloudflare / TOSS):**  
[docs/SECRETS_SETUP.md](../docs/SECRETS_SETUP.md) · [docs/SECRETS_SETUP_KR.md](../docs/SECRETS_SETUP_KR.md)

```bash
./scripts/setup-secrets.sh --local          # Cloudflare (+ optional TOSS) → .dev.vars
./scripts/setup-deepseek.sh --remote        # DEEPSEEK_API_KEY → Worker
```

### 2.1 API token permissions

[API Tokens](https://dash.cloudflare.com/profile/api-tokens) — Account:

- Workers Scripts → **Edit**
- D1 → **Edit**
- Workers R2 Storage → **Edit**
- Cloudflare Pages → **Edit**
- Account Settings → **Read**

### 2.2 Enable R2 (error **10042**)

```
Please enable R2 through the Cloudflare Dashboard [code: 10042]
```

1. Dashboard → **R2 Object Storage**
2. **Get started / Enable R2** (payment method may be required on free tier)
3. Re-run `./scripts/bootstrap.sh`

### 2.3 Pages “already exists” (error **8000002**)

```
A project with this name already exists [code: 8000002]
```

→ **OK.** `vibequant-web` already exists. Skip create and run `./scripts/deploy.sh`.

### 2.4 npm peer deps

`package.json` pins `wrangler@^4.112` with `@cloudflare/workers-types@^5`.  
On `ERESOLVE`:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 3. Build & deploy

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
npm install

./scripts/setup-secrets.sh --local
./scripts/bootstrap.sh
./scripts/setup-secrets.sh --remote   # optional TOSS → Worker

# deploy.sh auto-detects the workers.dev URL from the Worker deploy log
# optional override:
# export VIBEQUANT_API_BASE="https://vibequant-api.gameworker-4bb.workers.dev"
./scripts/deploy.sh

./scripts/upload-static.sh ./static/images/logo.png images/logo.png
```

### Scripts

| Script | Role |
|---|---|
| `setup-secrets.sh --local` | Write `.dev.vars` + `account_id` |
| `setup-secrets.sh --remote` | TOSS → Worker secrets |
| `setup-deepseek.sh --local/--remote` | `DEEPSEEK_API_KEY` → `.dev.vars` / Worker |
| `bootstrap.sh` | D1/R2/Pages, schema, R2 smoke (`--remote`) |
| `deploy.sh` | Worker + Pages (`wrangler.pages.toml`) |
| `upload-static.sh` | Files → R2 static (`--remote`) |

### Wrangler v4: R2 defaults to local

If you see `Resource location: local`, the object is **not** in the cloud.  
Scripts pass `--remote`. Manual upload:

```bash
npx wrangler r2 object put vibequant-static/tests/hello.txt \
  --file=./static/tests/hello.txt \
  --content-type="text/plain; charset=utf-8" \
  --remote
```

### Pages `--config` error

```
Pages does not support custom paths for the Wrangler configuration file
```

→ Remove `--config` / `-c`. Correct flow:

```bash
cd /Users/dennis/vibe-investing/VibeQuant/pages
npx wrangler pages deploy . --project-name=vibequant-web --commit-dirty=true
```

---

## 4. Static / images (CDN)

```
cloudflare/static/
  tests/hello.txt
  images/
```

```bash
./scripts/upload-static.sh ./static/images/chart.png images/chart.png
```

URL: `$VIBEQUANT_API_BASE/cdn/images/chart.png`

Dashboard runtime (`pages/js/runtime-config.js`, written by deploy):

```js
window.VIBEQUANT_API_BASE
window.VIBEQUANT_CDN_BASE
```

---

## 5. Smoke checks

```bash
curl -sS "$VIBEQUANT_API_BASE/api/health"
curl -sS "$VIBEQUANT_API_BASE/cdn/tests/hello.txt"
# Pages: https://vibequant-web.pages.dev/
```

Local dashboard only:

```bash
cd ../pages && python3 -m http.server 8787
```

---

## 6. Config files

| File | Role |
|---|---|
| `wrangler.toml` | Worker only |
| `../pages/wrangler.toml` | Pages only |
| `wrangler.pages.toml` | Deprecated pointer — do not pass via `--config` |
| `.dev.vars` | Local secrets (**do not commit**) |
| `.dev.vars.example` | Placeholders |
| `schema.sql` | D1 schema |
| `../pages/_headers` | Pages cache headers |

After clone, run bootstrap so `database_id` is filled (repo may ship `REPLACE_WITH_D1_DATABASE_ID`).

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `cd: no such file: cloudflare` | Use absolute path in §0 |
| npm `ERESOLVE` | Reinstall with types v5 |
| R2 `10042` | Enable R2 in Dashboard |
| Pages `8000002` | Already exists → deploy |
| R2 `local` | Use `--remote` |
| Pages `--config` error | `cd pages && wrangler pages deploy .` |
| runtime-config still has YOUR_SUBDOMAIN | Re-run `deploy.sh` (auto-detect) or export the real workers.dev URL |
| D1 placeholder | `./scripts/bootstrap.sh` |
