#!/usr/bin/env bash
# Set DeepSeek API key for the LLM Quant Prompt feature.
#
# Usage:
#   ./scripts/setup-deepseek.sh --local     # append DEEPSEEK_API_KEY to .dev.vars
#   ./scripts/setup-deepseek.sh --remote    # wrangler secret put DEEPSEEK_API_KEY
#   ./scripts/setup-deepseek.sh --local --remote
#
# Get a key: https://platform.deepseek.com/api_keys
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib-env.sh
source "$SCRIPT_DIR/lib-env.sh"

ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEV_VARS="$ROOT/.dev.vars"
WRANGLER_TOML="$ROOT/wrangler.toml"
DO_LOCAL=0
DO_REMOTE=0

usage() {
  cat <<'EOF'
VibeQuant — DeepSeek API key setup

  --local    Write/update DEEPSEEK_API_KEY in cloudflare/.dev.vars (chmod 600)
  --remote   Upload DEEPSEEK_API_KEY to Worker via: wrangler secret put
  -h         Help

Examples:
  cd cloudflare
  ./scripts/setup-deepseek.sh --local
  ./scripts/setup-deepseek.sh --remote
  ./scripts/setup-deepseek.sh --local --remote

Notes:
  - Value is never echoed.
  - Models used by the Worker: deepseek-v4-flash (gate + fast), deepseek-v4-pro (quant).
  - After --remote, redeploy is not required for secrets; next request picks them up.

Full manuals:
  ../docs/SECRETS_SETUP.md
  ../docs/SECRETS_SETUP_KR.md
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local)  DO_LOCAL=1; shift ;;
    --remote) DO_REMOTE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

if [[ "$DO_LOCAL" -eq 0 && "$DO_REMOTE" -eq 0 ]]; then
  usage
  exit 1
fi

echo "VibeQuant — DeepSeek API key"
echo "============================"
echo "Get key: https://platform.deepseek.com/api_keys"
echo ""

KEY=""
read -rsp "DEEPSEEK_API_KEY (hidden): " KEY
echo ""
if [[ -z "$KEY" ]]; then
  echo "error: empty key" >&2
  exit 1
fi

if [[ "$DO_LOCAL" -eq 1 ]]; then
  touch "$DEV_VARS"
  chmod 600 "$DEV_VARS" || true
  if grep -q '^DEEPSEEK_API_KEY=' "$DEV_VARS" 2>/dev/null; then
    # replace existing line
    tmp="$(mktemp)"
    grep -v '^DEEPSEEK_API_KEY=' "$DEV_VARS" >"$tmp" || true
    mv "$tmp" "$DEV_VARS"
  fi
  printf 'DEEPSEEK_API_KEY=%s\n' "$KEY" >>"$DEV_VARS"
  chmod 600 "$DEV_VARS"
  echo "OK: wrote DEEPSEEK_API_KEY to .dev.vars (local wrangler dev)"
fi

if [[ "$DO_REMOTE" -eq 1 ]]; then
  load_dev_vars 2>/dev/null || true
  require_npx
  export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
  export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
  echo "$KEY" | npx --yes wrangler secret put DEEPSEEK_API_KEY --config "$WRANGLER_TOML"
  echo "OK: DEEPSEEK_API_KEY uploaded to Worker secrets"
fi

echo ""
echo "Test (after Worker can reach DeepSeek):"
echo "  curl -sS -X POST \"\$VIBEQUANT_API_BASE/api/v1/llm/quant-prompt\" \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"prompt\":\"NVDA 22일 모멘텀을 설명해줘\",\"model\":\"flash\"}'"
echo ""
