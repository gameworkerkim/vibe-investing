# LLM Quant Prompt

Educational sandbox: DeepSeek builds a finance answer and/or `vi_browser` Python that runs in the browser (Pyodide).

## Setup DeepSeek API key (terminal)

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
| V4 Flash | `deepseek-v4-flash` | Finance gate + fast prompts |
| V4 Pro | `deepseek-v4-pro` | Default quant logic / code gen |

## API

`POST /api/v1/llm/quant-prompt`

```json
{ "prompt": "NVDA 22-day momentum?", "model": "pro" }
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
