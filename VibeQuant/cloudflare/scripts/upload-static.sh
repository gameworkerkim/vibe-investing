#!/usr/bin/env bash
# Upload files to R2 vibequant-static for CDN delivery via Worker /cdn/*
#
# Usage:
#   ./scripts/upload-static.sh <local-path> [r2-key]
#   ./scripts/upload-static.sh ./logo.png images/logo.png
#   ./scripts/upload-static.sh ./static/          # sync directory tree
#
# After upload: GET https://<worker>/cdn/<r2-key>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib-env.sh
source "$SCRIPT_DIR/lib-env.sh"

load_dev_vars
require_npx
cd "$ROOT"

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

BUCKET="vibequant-static"

usage() {
  cat <<'EOF'
Upload static tests / images to R2 (CDN via Worker /cdn/*)

  ./scripts/upload-static.sh <local-file> [r2-key]
  ./scripts/upload-static.sh <local-dir>            # preserves relative paths under key prefix

Examples:
  ./scripts/upload-static.sh ../pages/favicon.png images/favicon.png
  ./scripts/upload-static.sh ./static/images/
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

SRC="$1"
KEY_ARG="${2:-}"

guess_ctype() {
  local lower
  lower="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  case "$lower" in
    *.png) echo "image/png" ;;
    *.jpg|*.jpeg) echo "image/jpeg" ;;
    *.webp) echo "image/webp" ;;
    *.gif) echo "image/gif" ;;
    *.svg) echo "image/svg+xml" ;;
    *.json) echo "application/json" ;;
    *.css) echo "text/css" ;;
    *.js) echo "text/javascript" ;;
    *.txt|*.md) echo "text/plain; charset=utf-8" ;;
    *.html) echo "text/html; charset=utf-8" ;;
    *.wasm) echo "application/wasm" ;;
    *) echo "application/octet-stream" ;;
  esac
}

upload_one() {
  local file="$1"
  local key="$2"
  local ctype
  ctype="$(guess_ctype "$file")"
  echo "put r2://${BUCKET}/${key}  (${ctype})"
  # Wrangler v4 defaults to local simulator — always use --remote for live CDN
  wrangler r2 object put "${BUCKET}/${key}" --file="$file" --content-type="$ctype" --remote
}

if [[ -d "$SRC" ]]; then
  SRC="$(cd "$SRC" && pwd)"
  while IFS= read -r -d '' f; do
    rel="${f#"$SRC"/}"
    upload_one "$f" "$rel"
  done < <(find "$SRC" -type f -print0)
elif [[ -f "$SRC" ]]; then
  if [[ -n "$KEY_ARG" ]]; then
    upload_one "$SRC" "$KEY_ARG"
  else
    upload_one "$SRC" "$(basename "$SRC")"
  fi
else
  echo "error: not found: $SRC" >&2
  exit 1
fi

echo ""
echo "CDN paths (after Worker deploy):"
echo "  /cdn/<key>"
echo "List bucket:"
echo "  npx wrangler r2 object list $BUCKET"
