#!/usr/bin/env bash
#
# Leaf — 화보집 이미지 업로드 스크립트
#
# 원본 이미지를 "리사이즈(≤1600px) + 워터마크 사전 합성" 후 private R2 버킷(leaf-images)에 업로드.
# (Workers 무료 티어 CPU 10ms 제한 때문에 요청 시 합성이 아닌 업로드 시 합성)
#
# 사용법:
#   ./upload-photobook.sh                      # 기본값: album 1, ~/Downloads/김소희 화보
#   ./upload-photobook.sh 2                    # album 2 지정
#   ./upload-photobook.sh 2 "/path/to/폴더"     # 폴더 지정
#   ./upload-photobook.sh 1 "$HOME/Downloads/김소희 화보" "Leaf | user@leaf.com"
#   ./upload-photobook.sh 1 "" "" 32           # 페이지당 변형 32개 (기본 16)
#
# 업로드만 하면 페이지 수는 R2에서 자동 집계되어 재배포 불필요.
# 이후 뷰어에서 album 1이면 https://vibequant.cc/Leaf/ 에 바로 반영됨.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_SOURCE="$HOME/Downloads/김소희 화보"
DEFAULT_WATERMARK="Leaf | 개인 열람용 | 무단전재 금지"

ALBUM_ID="${1:-1}"
SOURCE="${2:-$DEFAULT_SOURCE}"
WATERMARK="${3:-$DEFAULT_WATERMARK}"
VARIANTS="${4:-0}"

# ── 사전 검사 ──
if ! command -v node >/dev/null 2>&1; then
  echo "[오류] node.js가 필요합니다." >&2
  exit 1
fi

if [ ! -d "$SOURCE" ]; then
  echo "[오류] 소스 폴더가 없습니다: $SOURCE" >&2
  exit 1
fi

if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "[준비] 의존성 설치 중 (sharp)..."
  (cd "$SCRIPT_DIR" && npm install --no-audit --no-fund)
fi

# ── 실행 ──
COUNT="$(find "$SOURCE" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) | wc -l | tr -d ' ')"
echo ">>> 업로드 대상: album=${ALBUM_ID}, 이미지 ${COUNT}장, 변형 ${VARIANTS:-16}/페이지"
echo ">>> 소스: ${SOURCE}"
echo ">>> 워터마크: ${WATERMARK}"

VAR_ARGS=()
if [ "$VARIANTS" -gt 0 ]; then VAR_ARGS=(--variants "$VARIANTS"); fi

(cd "$SCRIPT_DIR" && node prepare-and-upload.js \
  --album "$ALBUM_ID" \
  --source "$SOURCE" \
  --watermark "$WATERMARK" \
  "${VAR_ARGS[@]}")

echo ""
echo "✔ 완료. 뷰어 확인: https://vibequant.cc/Leaf/  (album ${ALBUM_ID})"
echo "  메타: https://vibequant.cc/Leaf/api/albums/${ALBUM_ID}/meta"
