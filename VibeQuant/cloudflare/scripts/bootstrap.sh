#!/usr/bin/env bash
# Create Cloudflare Free resources: D1, R2 (data + static/CDN), Pages project.
# Idempotent where possible. Does not deploy code — use deploy.sh after.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib-env.sh
source "$SCRIPT_DIR/lib-env.sh"

load_dev_vars
require_npx
cd "$ROOT"

set_toml_account_id "$WRANGLER_TOML" "$CLOUDFLARE_ACCOUNT_ID"
set_toml_account_id "$WRANGLER_PAGES" "$CLOUDFLARE_ACCOUNT_ID"

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

D1_NAME="vibequant"
R2_DATA="vibequant-data"
R2_STATIC="vibequant-static"
PAGES_PROJECT="vibequant-web"

echo "VibeQuant Cloudflare bootstrap"
echo "=============================="
echo "account: ${CLOUDFLARE_ACCOUNT_ID:0:8}…"
echo ""

# ── D1 ───────────────────────────────────────────────────
echo "1) D1 database: $D1_NAME"
D1_LIST="$(wrangler d1 list --json 2>/dev/null || echo "[]")"
D1_ID="$(echo "$D1_LIST" | python3 -c "
import json,sys
name='$D1_NAME'
try:
    rows=json.load(sys.stdin)
except Exception:
    rows=[]
if isinstance(rows, dict):
    rows=rows.get('result') or rows.get('databases') or []
for r in rows:
    if r.get('name')==name or r.get('uuid')==name:
        print(r.get('uuid') or r.get('id') or '')
        break
" 2>/dev/null || true)"

if [[ -z "$D1_ID" ]]; then
  CREATE_OUT="$(wrangler d1 create "$D1_NAME" 2>&1 || true)"
  echo "$CREATE_OUT"
  D1_ID="$(echo "$CREATE_OUT" | sed -n 's/.*database_id\s*=\s*\"\([^\"]*\)\".*/\1/p' | head -1)"
  if [[ -z "$D1_ID" ]]; then
    D1_ID="$(echo "$CREATE_OUT" | grep -Eo '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1 || true)"
  fi
else
  echo "   already exists: $D1_ID"
fi

if [[ -n "$D1_ID" ]]; then
  set_d1_database_id "$D1_ID"
  echo "   wrote database_id → wrangler.toml"
  echo "   applying schema.sql …"
  wrangler d1 execute "$D1_NAME" --remote --file="$ROOT/schema.sql" || \
    wrangler d1 execute "$D1_NAME" --file="$ROOT/schema.sql" || true
else
  echo "   warning: could not resolve D1 id — set database_id in wrangler.toml manually"
fi
echo ""

# ── R2 buckets ───────────────────────────────────────────
# Prerequisite: enable R2 once in the dashboard (error 10042 if not).
# https://dash.cloudflare.com/?to=/:account/r2
R2_OK=1
create_r2() {
  local name="$1"
  local out
  echo "2) R2 bucket: $name"
  if wrangler r2 bucket list 2>/dev/null | grep -q "$name"; then
    echo "   already exists"
    return 0
  fi
  set +e
  out="$(wrangler r2 bucket create "$name" 2>&1)"
  local rc=$?
  set -e
  echo "$out"
  if [[ $rc -eq 0 ]]; then
    return 0
  fi
  if echo "$out" | grep -qE '10042|enable R2|Please enable R2'; then
    R2_OK=0
    cat <<'EOF'

   ✘ R2 is not enabled on this Cloudflare account (API code 10042).

   Fix (once per account):
     1. Open https://dash.cloudflare.com/ → select your account
     2. Go to R2 Object Storage
     3. Click "Purchase R2 plan" / "Get started" / "Enable R2"
        (Free tier still usually requires a payment method on file —
         you are not charged until you exceed free quotas.)
     4. Re-run: ./scripts/bootstrap.sh

EOF
    return 1
  fi
  echo "   create returned non-zero (may already exist)"
  return 0
}

create_r2 "$R2_DATA" || true
create_r2 "$R2_STATIC" || true
if [[ "$R2_OK" -ne 1 ]]; then
  echo "Stopping before Pages/CDN seed — enable R2, then re-run bootstrap."
  exit 1
fi
echo ""

# ── Pages project ────────────────────────────────────────
echo "3) Pages project: $PAGES_PROJECT"
PAGES_JSON="$(wrangler pages project list --json 2>/dev/null || echo "[]")"
HAS_PAGES="$(echo "$PAGES_JSON" | python3 -c "
import json,sys
name='$PAGES_PROJECT'
try:
    rows=json.load(sys.stdin)
except Exception:
    rows=[]
if isinstance(rows, dict):
    rows=rows.get('result') or []
print('yes' if any((r.get('name')==name) for r in rows) else 'no')
" 2>/dev/null || echo "no")"

if [[ "$HAS_PAGES" == "yes" ]]; then
  echo "   already exists"
else
  set +e
  PAGES_OUT="$(wrangler pages project create "$PAGES_PROJECT" --production-branch=main 2>&1)"
  PAGES_RC=$?
  set -e
  if [[ $PAGES_RC -eq 0 ]]; then
    echo "$PAGES_OUT"
  elif echo "$PAGES_OUT" | grep -qE '8000002|already exists'; then
    echo "   already exists (OK) — skip create"
  else
    echo "$PAGES_OUT"
    cat <<EOF

   ✘ Pages project create failed via API.

   Common fixes:
     A) API token: Account → Cloudflare Pages → Edit
     B) Dashboard: Workers & Pages → Create → Pages → name ${PAGES_PROJECT}
     C) Continue with: ./scripts/deploy.sh

EOF
  fi
fi
echo ""

# ── Placeholder static object (CDN smoke test) ───────────
echo "4) Seed CDN smoke object → r2://$R2_STATIC/tests/hello.txt (remote)"
mkdir -p "$ROOT/static/tests" "$ROOT/static/images"
if [[ ! -f "$ROOT/static/tests/hello.txt" ]]; then
  cat > "$ROOT/static/tests/hello.txt" <<EOF
VibeQuant CDN OK
bucket=$R2_STATIC
path=tests/hello.txt
EOF
fi
# Wrangler v4 defaults to LOCAL R2 simulator — must pass --remote for production bucket
wrangler r2 object put "${R2_STATIC}/tests/hello.txt" \
  --file="$ROOT/static/tests/hello.txt" \
  --content-type="text/plain; charset=utf-8" \
  --remote || true
echo ""

echo "Bootstrap done."
echo ""
echo "Next:"
echo "  1) ./scripts/setup-secrets.sh --remote   # TOSS → Worker secrets (optional)"
echo "  2) ./scripts/deploy.sh                  # Worker + Pages"
echo "  3) ./scripts/upload-static.sh static/images/foo.png images/foo.png"
echo ""
echo "CDN URL after Worker deploy:"
echo "  https://vibequant-api.<account>.workers.dev/cdn/tests/hello.txt"
echo "Pages:"
echo "  https://vibequant-web.pages.dev/"
