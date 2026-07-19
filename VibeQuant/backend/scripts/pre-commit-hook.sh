#!/usr/bin/env bash
# Pre-commit hook: scan staged files for secrets before allowing commit.
# Install: ln -s ../../scripts/pre-commit-hook.sh .git/hooks/pre-commit

set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'

STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)

SECRETS_FOUND=0

for file in $STAGED; do
  if [[ "$file" == *.env* ]] && [[ "$file" != ".env.example" ]]; then
    echo -e "${RED}BLOCKED${NC}: $file — .env files must not be committed."
    SECRETS_FOUND=1
    continue
  fi

  if [[ "$file" == *.env.example ]]; then
    continue
  fi

  # Scan for common secret patterns
  if git show ":$file" 2>/dev/null | grep -qP '(client_secret\s*[=:]\s*["\x27]?\w{8,}|DATABASE_URL\s*=\s*postgresql://[^@\s]+@|UPSTASH_REDIS_TOKEN\s*[=:]\s*["\x27]?\w{8,}|TOSS_CLIENT_SECRET\s*[=:]\s*["\x27]?\w{8,})' 2>/dev/null; then
    echo -e "${RED}BLOCKED${NC}: $file contains a secret (API key, DB URL, or token)."
    SECRETS_FOUND=1
  fi
done

if [ $SECRETS_FOUND -eq 1 ]; then
  echo ""
  echo "Remove secrets from staged files or add them to .env (see .env.example)."
  echo "Use 'scripts/setup-env.sh' to configure credentials interactively."
  exit 1
fi

exit 0
