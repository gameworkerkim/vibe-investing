# Secrets setup manual (English)

How to enter **DeepSeek**, **Cloudflare**, and **TOSS** keys for VibeQuant.  
Values are never printed by the scripts. **Do not commit** secrets. **Do not paste keys into chat or GitHub issues.**

| Doc | Language |
|---|---|
| This file | English |
| [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md) | 한국어 |

Related: [SECURITY.md](../SECURITY.md) · [cloudflare/DEPLOY.md](../cloudflare/DEPLOY.md) · [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md)

---

## 0. Working directory

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
# or: cd <clone>/VibeQuant/cloudflare
```

---

## 1. Secret inventory

| Name | Where it lives | Used for | Script |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | Worker secret and/or `.dev.vars` | LLM Quant Prompt (DeepSeek V4 Pro / Flash) | `./scripts/setup-deepseek.sh` |
| `CLOUDFLARE_API_TOKEN` | **Your machine / CI only** (`.dev.vars`) | `wrangler` deploy & `secret put` | `./scripts/setup-secrets.sh --local` |
| `CLOUDFLARE_ACCOUNT_ID` | `.dev.vars` + `wrangler.toml` `account_id` | Same | `./scripts/setup-secrets.sh --local` |
| `TOSS_CLIENT_ID` | Worker secret / `.dev.vars` | TOSS Open API (optional; IP-limited → deferred) | `./scripts/setup-secrets.sh` |
| `TOSS_CLIENT_SECRET` | Worker secret / `.dev.vars` | TOSS OAuth secret | `./scripts/setup-secrets.sh` |

**Never** put any of these in `pages/` or browser JS.

| Location | Meaning |
|---|---|
| `cloudflare/.dev.vars` | Local `wrangler dev` + scripts (chmod 600, gitignored) |
| Worker secrets (`wrangler secret put`) | Production `vibequant-api` runtime |
| Pages / GitHub | **Forbidden** for API keys |

---

## 2. Recommended first-time order

1. Cloudflare token + account → local `.dev.vars`  
2. DeepSeek key → Worker (`--remote`) so the live site works  
3. TOSS (optional) → only if you later fix IP / proxy path  

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
npm install

./scripts/setup-secrets.sh --local
./scripts/setup-deepseek.sh --remote
# optional later:
# ./scripts/setup-secrets.sh --remote
```

---

## 3. DeepSeek API key

**Get a key:** https://platform.deepseek.com/api_keys  

DeepSeek keys typically look like `sk-…` (your dashboard shows the full string).  
When the script asks `DEEPSEEK_API_KEY (hidden):`, paste the **entire** key and press Enter. Nothing is echoed — that is normal.

### 3.1 Production (live site / Worker)

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
./scripts/setup-deepseek.sh --remote
# or: npm run setup-deepseek:remote
```

Example session:

```text
VibeQuant — DeepSeek API key
============================
Get key: https://platform.deepseek.com/api_keys

DEEPSEEK_API_KEY (hidden):
OK: DEEPSEEK_API_KEY uploaded to Worker secrets
```

Redeploy is **not** required after `secret put`; the next request picks up the secret.

### 3.2 Local wrangler

```bash
./scripts/setup-deepseek.sh --local
# or: npm run setup-deepseek
```

Appends/updates `DEEPSEEK_API_KEY=` in `.dev.vars`.

### 3.3 Both

```bash
./scripts/setup-deepseek.sh --local --remote
# or: npm run setup-deepseek:all
```

### 3.4 Verify

```bash
curl -sS https://vibequant-api.gameworker-4bb.workers.dev/api/health | python3 -m json.tool
```

Expect:

```json
"deepseek": { "configured": true }
```

Models used by the Worker:

| UI choice | API model | Role |
|---|---|---|
| V4 Flash | `deepseek-v4-flash` | Finance gate + fast prompts |
| V4 Pro | `deepseek-v4-pro` | Quant answer / Python generation (default) |

---

## 4. Cloudflare deploy credentials

Used only on your laptop/CI to run Wrangler — **not** stored as Worker runtime secrets.

**Create token:** https://dash.cloudflare.com/profile/api-tokens  

Suggested Account permissions:

- Workers Scripts → Edit  
- D1 → Edit  
- Workers R2 Storage → Edit  
- Cloudflare Pages → Edit  
- Account Settings → Read  

**Account ID:** Dashboard → Workers & Pages → Overview (right sidebar).

```bash
./scripts/setup-secrets.sh --local
```

Writes `.dev.vars` (mode 600) and sets `account_id` in wrangler configs.

---

## 5. TOSS Open API (optional / deferred)

TOSS realtime via Worker is **deferred** (no fixed egress IP on Cloudflare Free).  
Yahoo remains the primary demo provider. See [WORKER_TOSS_IP.md](WORKER_TOSS_IP.md).

If you still want secrets on file for later:

```bash
./scripts/setup-secrets.sh --local    # prompts for TOSS (Enter to skip)
./scripts/setup-secrets.sh --remote   # uploads TOSS_* to Worker if set
```

Portal: https://developers.tossinvest.com  

Verify local OAuth (may fail with IP allowlist):

```bash
./scripts/verify-toss.sh
```

---

## 6. Manual `wrangler secret put` (advanced)

If you prefer not to use the helper scripts:

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
export CLOUDFLARE_API_TOKEN="…"   # from your machine env / .dev.vars
export CLOUDFLARE_ACCOUNT_ID="…"

# Paste key, then Ctrl-D (EOF) — value is not shown
npx wrangler secret put DEEPSEEK_API_KEY --config wrangler.toml
npx wrangler secret put TOSS_CLIENT_ID --config wrangler.toml
npx wrangler secret put TOSS_CLIENT_SECRET --config wrangler.toml

npx wrangler secret list --config wrangler.toml
```

---

## 7. Safety checklist

- [ ] `.dev.vars` is gitignored and mode `600`  
- [ ] Pre-commit hook installed (`scripts/install-pre-commit.sh`)  
- [ ] No secrets in `pages/js/runtime-config.js` (API base URL only)  
- [ ] Rotated any key that was pasted into chat, email, or a public repo  
- [ ] `GET /api/health` shows `deepseek.configured: true` before using LLM Quant Prompt  

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Script prints only the help menu | Pass `--local` and/or `--remote` |
| `DEEPSEEK_NOT_CONFIGURED` on site | Run `./scripts/setup-deepseek.sh --remote` |
| `wrangler secret put` auth error | Set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` via `setup-secrets.sh --local` |
| LLM finance reject / 30s limit | By design — see [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md) |
| TOSS always mock | Expected on Free Worker without fixed IP |

Korean: [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md)
