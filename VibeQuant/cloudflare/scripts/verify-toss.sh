#!/usr/bin/env bash
# Verify TOSS OAuth + candles using local .dev.vars (never prints secrets).
# Usage: ./scripts/verify-toss.sh [symbol]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEV_VARS="$ROOT/.dev.vars"
SYMBOL="${1:-005930}"

if [[ ! -f "$DEV_VARS" ]]; then
  echo "FAIL: missing $DEV_VARS — run ./scripts/setup-secrets.sh --local" >&2
  exit 1
fi

set -a
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  case "$line" in
    TOSS_CLIENT_ID=*|TOSS_CLIENT_SECRET=*|TOSS_BASE_URL=*)
      export "$line"
      ;;
  esac
done < "$DEV_VARS"
set +a

BASE="${TOSS_BASE_URL:-https://openapi.tossinvest.com}"
BASE="${BASE%/}"

if [[ -z "${TOSS_CLIENT_ID:-}" || -z "${TOSS_CLIENT_SECRET:-}" ]]; then
  echo "FAIL: TOSS_CLIENT_ID / TOSS_CLIENT_SECRET empty in .dev.vars" >&2
  exit 1
fi

echo "1) OAuth token…"
HTTP_CODE="$(curl -sS -o /tmp/vq-toss-token.json -w "%{http_code}" -X POST "$BASE/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=${TOSS_CLIENT_ID}" \
  --data-urlencode "client_secret=${TOSS_CLIENT_SECRET}")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "FAIL: OAuth HTTP $HTTP_CODE"
  head -c 240 /tmp/vq-toss-token.json; echo
  if grep -qi 'IP address not allowed' /tmp/vq-toss-token.json 2>/dev/null; then
    echo ""
    echo "HINT: TOSS IP allowlist blocked this machine."
    echo "      Add your public IP (and later Cloudflare Worker egress) in the TOSS console."
    echo "      See cloudflare/docs/TOSS.md"
  fi
  exit 1
fi

TOKEN="$(python3 -c 'import json; print(json.load(open("/tmp/vq-toss-token.json"))["access_token"])')"
echo "   OK (token length=${#TOKEN})"

echo "2) Candles symbol=$SYMBOL…"
HTTP_CODE="$(curl -sS -o /tmp/vq-toss-candles.json -w "%{http_code}" \
  "$BASE/api/v1/candles?symbol=${SYMBOL}&interval=1d&count=5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "FAIL: candles HTTP $HTTP_CODE"
  head -c 300 /tmp/vq-toss-candles.json; echo
  exit 1
fi

python3 - <<'PY'
import json
d=json.load(open("/tmp/vq-toss-candles.json"))
rows = d if isinstance(d, list) else (d.get("candles") or d.get("data") or d.get("items") or [])
if not rows:
    print("FAIL: empty candles — keys=", list(d.keys()) if isinstance(d, dict) else type(d))
    raise SystemExit(1)
keys = list(rows[0].keys()) if isinstance(rows[0], dict) else type(rows[0])
print(f"   OK bars={len(rows)} sample_keys={keys}")
PY

rm -f /tmp/vq-toss-token.json /tmp/vq-toss-candles.json
echo "PASS: TOSS local credentials work."
