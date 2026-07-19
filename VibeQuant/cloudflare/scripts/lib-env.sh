#!/usr/bin/env bash
# Shared helpers for Cloudflare scripts — load .dev.vars safely.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_VARS="$ROOT/.dev.vars"
WRANGLER_TOML="$ROOT/wrangler.toml"
WRANGLER_PAGES="$ROOT/wrangler.pages.toml"

load_dev_vars() {
  if [[ ! -f "$DEV_VARS" ]]; then
    echo "error: missing $DEV_VARS — run: ./scripts/setup-secrets.sh --local" >&2
    return 1
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    case "$line" in
      CLOUDFLARE_API_TOKEN=*|CLOUDFLARE_ACCOUNT_ID=*|TOSS_CLIENT_ID=*|TOSS_CLIENT_SECRET=*)
        export "$line"
        ;;
    esac
  done < "$DEV_VARS"
  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    echo "error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID required in .dev.vars" >&2
    return 1
  fi
}

require_npx() {
  if ! command -v npx >/dev/null 2>&1; then
    echo "error: Node.js / npx required" >&2
    return 1
  fi
}

set_toml_account_id() {
  local file="$1"
  local acc="$2"
  [[ -f "$file" ]] || return 0
  if grep -qE '^\s*#?\s*account_id\s*=' "$file"; then
    local tmp
    tmp="$(mktemp)"
    awk -v acc="$acc" '
      BEGIN { done=0 }
      /^[[:space:]]*#?[[:space:]]*account_id[[:space:]]*=/ && !done {
        print "account_id = \"" acc "\""
        done=1
        next
      }
      { print }
      END { if (!done) print "account_id = \"" acc "\"" }
    ' "$file" > "$tmp"
    mv "$tmp" "$file"
  else
    printf '\naccount_id = "%s"\n' "$acc" >> "$file"
  fi
}

set_d1_database_id() {
  local id="$1"
  local tmp
  tmp="$(mktemp)"
  awk -v id="$id" '
    BEGIN { in_d1=0 }
    /^\[\[d1_databases\]\]/ { in_d1=1; print; next }
    in_d1 && /^database_id[[:space:]]*=/ {
      print "database_id = \"" id "\""
      in_d1=0
      next
    }
    /^\[/ { in_d1=0 }
    { print }
  ' "$WRANGLER_TOML" > "$tmp"
  mv "$tmp" "$WRANGLER_TOML"
}

wrangler() {
  npx --yes wrangler "$@"
}
