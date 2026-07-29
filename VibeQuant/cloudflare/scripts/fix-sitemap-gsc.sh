#!/usr/bin/env bash
# Disable Cloudflare checks that cause GSC "사이트맵을 읽을 수 없음" (error 1010).
# Needs an API token with: Zone Settings Write + Zone WAF Write (or Account Super Admin).
#
#   export CLOUDFLARE_API_TOKEN=...
#   ./scripts/fix-sitemap-gsc.sh
#
set -euo pipefail
TOKEN="${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}"
ZONE_NAME="${ZONE_NAME:-vibequant.cc}"

api() {
  local method="$1" path="$2" data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4/${path}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      --data "$data"
  else
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4/${path}" \
      -H "Authorization: Bearer ${TOKEN}"
  fi
}

ZONE_ID="$(api GET "zones?name=${ZONE_NAME}" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["result"][0]["id"] if d.get("result") else "")')"
[[ -n "$ZONE_ID" ]] || { echo "zone not found / token lacks Zone Read"; exit 1; }
echo "zone=$ZONE_ID"

patch_setting() {
  local name="$1" value="$2"
  local resp
  resp="$(api PATCH "zones/${ZONE_ID}/settings/${name}" "{\"value\":${value}}")"
  echo -n "$name: "
  python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if d.get("success") else d.get("errors"))' <<<"$resp"
}

# Browser Integrity Check → off (this returns CF error 1010 to non-browser clients)
patch_setting browser_check '"off"'
# Security level → essentially_off (optional but helps crawlers)
patch_setting security_level '"essentially_off"'

# Bot Fight Mode (free) — setting name varies by plan
patch_setting bot_fight_mode false || true

echo
echo "Verify sitemap with a non-browser UA (must be 200, not 1010):"
code="$(curl -sS -o /dev/null -w '%{http_code}' -A 'Python-urllib/3.9' "https://${ZONE_NAME}/sitemap.xml")"
echo "Python-urllib → HTTP $code (want 200)"
code="$(curl -sS -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' "https://${ZONE_NAME}/sitemap.xml")"
echo "Googlebot → HTTP $code (want 200)"
echo
echo "Then in GSC: delete sitemap → resubmit https://${ZONE_NAME}/sitemap.xml"
