# LLM Quant Prompt

Educational sandbox: DeepSeek builds a finance answer and/or `vi_browser` Python that runs in the browser (Pyodide).

| Doc | Language |
|---|---|
| This file | English |
| [LLM_QUANT_PROMPT_KR.md](LLM_QUANT_PROMPT_KR.md) | 한국어 |
| [SECRETS_SETUP.md](SECRETS_SETUP.md) / [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md) | All secrets (DeepSeek, Cloudflare, TOSS) |

## Setup DeepSeek API key (terminal)

Full walkthrough (hidden input, verify health, troubleshooting):  
**[SECRETS_SETUP.md §3](SECRETS_SETUP.md#3-deepseek-api-key)** · **[SECRETS_SETUP_KR.md §3](SECRETS_SETUP_KR.md#3-deepseek-api-키)**

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare

# Local wrangler (.dev.vars)
./scripts/setup-deepseek.sh --local
# or: npm run setup-deepseek

# Worker secret (production)
./scripts/setup-deepseek.sh --remote
# or: npm run setup-deepseek:remote

# Both
./scripts/setup-deepseek.sh --local --remote
```

Key source: https://platform.deepseek.com/api_keys  
Never put the key in Pages / browser JS.

## Models

| Choice | API model | Use |
|---|---|---|
| V4 Flash | `deepseek-v4-flash` | Default — finance gate + fast quant prompts |
| V4 Pro | `deepseek-v4-pro` | Heavier quant logic / code gen |

## API

`POST /api/v1/llm/quant-prompt`

```json
{ "prompt": "NVDA 22-day momentum?", "model": "flash" }
```

## Abuse rules

1. **30s cooldown** per browser (localStorage) and per IP (Worker).
2. **Finance only** (US stocks, KR stocks, crypto, quant). Reject → **1 minute** Cache API block.
3. **Archive / human eval** of successful runs — deferred (Phase 3 community).

## Deploy

```bash
cd cloudflare
npm run deploy:worker   # after code changes
npm run deploy:pages    # UI
```
