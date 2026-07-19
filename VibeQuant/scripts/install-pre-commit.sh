#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HOOK="$ROOT/.git/hooks/pre-commit"
TARGET="../../VibeQuant/scripts/pre-commit-hook.sh"
# From .git/hooks, relative path to VibeQuant script
mkdir -p "$ROOT/.git/hooks"
ln -sfn "$TARGET" "$HOOK"
chmod +x "$ROOT/VibeQuant/scripts/pre-commit-hook.sh"
echo "Installed pre-commit → $HOOK → $TARGET"
