#!/usr/bin/env bash
#
# Leaf — 보안 회귀(백)테스트 스크립트
# 근거: docs/05-보안-개선-로드맵.md §5 회귀 검증 체크리스트 + 추가 보안 검증
#
# 사용법:
#   LEAF_ADMIN_TOKEN=<토큰> ./security-check.sh                # 라이브
#   LEAF_ADMIN_TOKEN=<토큰> ./security-check.sh http://localhost:8787  # 로컬 dev
#
# 종료 코드: 모든 검증 통과 시 0, 실패 시 1.

set -u
BASE_URL="${1:-https://vibequant.cc}"
TOKEN="${LEAF_ADMIN_TOKEN:-}"
JAR="$(mktemp)"; OTHER="$(mktemp)"
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ❌ $1 (기대 $2 / 실제 $3)"; }
check() { # check <이름> <기대코드> <실제코드>
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "$2" "$3"; fi
}

echo "== 대상: $BASE_URL/Leaf =="

# ── 1) 세션/서명 URL 흐름 ──
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/albums/1/pages/1")
check "쿠키 없이 이미지 직접 요청 차단(403)" "403" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/albums/1/meta")
check "쿠키 없이 meta 차단(403)" "403" "$C"

curl -s -c "$JAR" -o /dev/null "$BASE_URL/Leaf/api/viewer-identity"

META=$(curl -s -b "$JAR" "$BASE_URL/Leaf/api/albums/1/meta")
C=$(echo "$META" | python3 -c "import sys,json;print(json.load(sys.stdin)['totalPages'])" 2>/dev/null || echo "0")
[ "$C" = "25" ] && ok "메타 페이지 수(25)" || bad "메타 페이지 수(25)" "25" "$C"

URL1=$(echo "$META" | python3 -c "import sys,json;print(json.load(sys.stdin)['pages'][0]['url'])")
C=$(curl -s -b "$JAR" -o /dev/null -w "%{http_code}" "$BASE_URL$URL1")
check "정상 서명 URL(200)" "200" "$C"

TAMPERED=$(echo "$URL1" | sed 's/&sig=.*/&sig=0000000000000000000000000000000000000000000000000000000000000000/')
C=$(curl -s -b "$JAR" -o /dev/null -w "%{http_code}" "$BASE_URL$TAMPERED")
check "서명 변조 차단(403)" "403" "$C"

curl -s -c "$OTHER" -o /dev/null "$BASE_URL/Leaf/api/viewer-identity"
C=$(curl -s -b "$OTHER" -o /dev/null -w "%{http_code}" "$BASE_URL$URL1")
check "타 세션 재사용 차단(403)" "403" "$C"

C=$(curl -s -b "$JAR" -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/albums/1/pages/1?exp=1000000000&sig=0000000000000000000000000000000000000000000000000000000000000000")
check "만료 URL 차단(403)" "403" "$C"

# ── 2) 레이트리밋: 25장 빠른 순회 → 429 포함 ──
CODES=""
echo "$META" | python3 -c "
import sys,json
for p in json.load(sys.stdin)['pages']: print(p['url'])
" | while read -r u; do
  curl -s -b "$JAR" -o /dev/null -w "%{http_code}" "$BASE_URL$u"
  echo
done > /tmp/leaf-rl-codes.txt
CODES=$(cat /tmp/leaf-rl-codes.txt | tr -d '\n')
if echo "$CODES" | grep -q "429"; then ok "레이트리밋(25장 순회 → 429)"; else bad "레이트리밋(25장 순회 → 429)" "429 포함" "$CODES"; fi
rm -f /tmp/leaf-rl-codes.txt

# ── 3) 관리자 로그 보호 ──
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/capture-log")
check "capture-log 무인증 차단(401)" "401" "$C"

if [ -n "$TOKEN" ]; then
  C=$(curl -s -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/capture-log")
  check "capture-log 토큰 인증(200)" "200" "$C"
else
  echo "  ⚠️ LEAF_ADMIN_TOKEN 미설정 — capture-log 200 케이스 생략"
fi

# ── 4) 캡처 알림 신뢰소스 / 입력 검증 ──
C=$(curl -s -X POST -H "Content-Type: application/json" -d '{"albumId":1,"page":5,"detail":"contextmenu","email":"victim@evil.com"}' -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/capture-alert")
check "알림 쿠키 없음 차단(403)" "403" "$C"

C=$(curl -s -b "$JAR" -X POST -H "Content-Type: application/json" -d '{"albumId":1,"page":5,"detail":"<script>alert(1)</script>"}' -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/api/capture-alert")
check "알림 XSS detail 차단(400)" "400" "$C"

# ── 5) 보안 헤더 ──
H=$(curl -sI "$BASE_URL/Leaf/")
echo "$H" | grep -qi "x-frame-options: DENY" && ok "X-Frame-Options: DENY" || bad "X-Frame-Options: DENY" "DENY" "$(echo "$H" | grep -i x-frame || echo 없음)"
echo "$H" | grep -qi "x-content-type-options: nosniff" && ok "X-Content-Type-Options" || bad "X-Content-Type-Options" "nosniff" "없음"
echo "$H" | grep -qi "referrer-policy: no-referrer" && ok "Referrer-Policy" || bad "Referrer-Policy" "no-referrer" "없음"

# ── 6) 기타 라우트 ──
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/Leaf/audit")
check "audit 페이지(200)" "200" "$C"
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
check "기존 사이트 무영향(200)" "200" "$C"

rm -f "$JAR" "$OTHER"
echo ""
echo "== 결과: PASS=$PASS FAIL=$FAIL =="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
