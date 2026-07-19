#!/usr/bin/env bash
set -euo pipefail

# DEPRECATED for new work. Prefer Cloudflare secrets:
#   cd cloudflare && ./scripts/setup-secrets.sh --local
#   cd cloudflare && ./scripts/setup-secrets.sh --remote
# This script only covers the legacy Express + Neon + Upstash stack.

echo "VibeQuant Data Backend — Environment Setup (LEGACY)"
echo "===================================================="
echo "For TOSS + Cloudflare keys use: cloudflare/scripts/setup-secrets.sh"
echo ""

ENV_FILE="$(dirname "$0")/../.env"

# ── Neon PostgreSQL ──────────────────────────────────────
echo "1. Neon PostgreSQL Database URL"
echo "   Get this from https://console.neon.tech → your project → Connection Details"
echo "   Format: postgresql://user:pass@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"
echo ""
read -rsp "   DATABASE_URL (input hidden): " DB_URL
echo ""

# ── Upstash Redis ────────────────────────────────────────
echo "2. Upstash Redis"
echo "   Get from https://console.upstash.com → your Redis database"
echo ""
read -rp "   UPSTASH_REDIS_URL: " REDIS_URL
read -rsp "   UPSTASH_REDIS_TOKEN (input hidden): " REDIS_TOKEN
echo ""

# ── TOSS Open API ────────────────────────────────────────
echo "3. TOSS Open API (optional — skip if using only Yahoo Finance)"
echo "   Get from https://developers.tossinvest.com"
echo ""
read -rp "   TOSS_CLIENT_ID (press Enter to skip): " TOSS_ID
if [ -n "$TOSS_ID" ]; then
  read -rsp "   TOSS_CLIENT_SECRET (input hidden): " TOSS_SECRET
  echo ""
fi

# ── Write .env ───────────────────────────────────────────
cat > "$ENV_FILE" <<EOF
DATABASE_URL=${DB_URL}
UPSTASH_REDIS_URL=${REDIS_URL}
UPSTASH_REDIS_TOKEN=${REDIS_TOKEN}
TOSS_CLIENT_ID=${TOSS_ID:-}
TOSS_CLIENT_SECRET=${TOSS_SECRET:-}
PORT=8080
NODE_ENV=development
RATE_LIMIT_PER_ROUTE=10
RATE_LIMIT_GLOBAL=100
CACHE_TTL_SECONDS=300
EOF

chmod 600 "$ENV_FILE"
echo ""
echo "Done. .env written to $(realpath "$ENV_FILE") with 600 permissions."
