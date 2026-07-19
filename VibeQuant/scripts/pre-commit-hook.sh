#!/usr/bin/env bash
# Pre-commit: block secrets (Cloudflare + legacy). macOS-friendly (no grep -P).
# Install from repo root:
#   ln -sf ../../VibeQuant/scripts/pre-commit-hook.sh .git/hooks/pre-commit
# Or:
#   bash VibeQuant/scripts/install-pre-commit.sh

set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'
SECRETS_FOUND=0

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)

block() {
  echo -e "${RED}BLOCKED${NC}: $1"
  SECRETS_FOUND=1
}

for file in $STAGED; do
  base="$(basename "$file")"

  case "$file" in
    *.dev.vars|*/.dev.vars|.env|.env.*|*/.env|*/.env.*)
      if [[ "$base" != ".env.example" && "$base" != ".dev.vars.example" ]]; then
        block "$file — secret env file must not be committed"
        continue
      fi
      ;;
  esac

  if [[ "$base" == ".env.example" || "$base" == ".dev.vars.example" ]]; then
    continue
  fi

  content="$(git show ":$file" 2>/dev/null || true)"
  [[ -z "$content" ]] && continue

  # Live assignments only — ignore code that references env.TOSS_* / process.env
  if echo "$content" | grep -Eiq \
    '(TOSS_CLIENT_SECRET[[:space:]]*[=:][[:space:]]*["'"'"'][A-Za-z0-9+/=_-]{16,}["'"'"']|CLOUDFLARE_API_TOKEN[[:space:]]*[=:][[:space:]]*["'"'"']?[A-Za-z0-9._-]{20,}|DATABASE_URL[[:space:]]*=[[:space:]]*postgresql://[^[:space:]@]+@|UPSTASH_REDIS_TOKEN[[:space:]]*[=:][[:space:]]*["'"'"'][A-Za-z0-9._-]{16,}["'"'"'])'
  then
    block "$file — looks like a live secret"
  fi
  # Bare client_secret=VALUE (not env. / process.env)
  if echo "$content" | grep -Eiq \
    'client_secret[[:space:]]*[=:][[:space:]]*["'"'"'][A-Za-z0-9+/=_-]{16,}["'"'"']'
  then
    block "$file — looks like a live client_secret"
  fi
done

if [[ $SECRETS_FOUND -eq 1 ]]; then
  echo ""
  echo "Remove secrets from staged files."
  echo "Cloudflare: VibeQuant/cloudflare/scripts/setup-secrets.sh"
  echo "Legacy backend: VibeQuant/backend/scripts/setup-env.sh"
  exit 1
fi

exit 0
