"""
engine/ticker_resolver.py — 티커 또는 종목명 검색어를 실제 (ticker, market) 후보로 해석

지원 입력:
  - 국내 6자리 종목코드 (예: "005930") — 그대로 KR 티커로 인정
  - 국내 종목명 (예: "삼성전자") — DART 상장사 목록에서 부분일치 검색
  - 미국/해외 티커 또는 회사명 (예: "MSFT", "Microsoft") — Yahoo Finance 검색 API
  - 위 방법으로 못 찾으면, 티커처럼 생긴 문자열(영문+점/하이픈)은 그대로 미국 티커로 간주
"""

import re
from typing import Dict, List

from clients import dart_client, yahoo_client

_KR_CODE_RE = re.compile(r"^\d{6}$")
_HANGUL_RE = re.compile(r"[가-힣]")
_BARE_TICKER_RE = re.compile(r"^[A-Za-z][A-Za-z.\-]{0,9}$")
_YAHOO_KR_SYMBOL_RE = re.compile(r"^(\d{6})\.(KS|KQ)$")


def resolve(query: str, limit: int = 6) -> List[Dict]:
    """반환: [{"ticker": str, "name": str, "market": "KR"|"US"}, ...] (중복 제거, 최대 limit개)"""
    query = query.strip()
    if not query:
        return []

    if _KR_CODE_RE.match(query):
        return [{"ticker": query, "name": "", "market": "KR"}]

    candidates: List[Dict] = []

    if _HANGUL_RE.search(query):
        for row in dart_client.search_by_name(query, limit=limit):
            candidates.append({"ticker": row["stock_code"], "name": row["corp_name"], "market": "KR"})

    for row in yahoo_client.search_symbol(query, limit=limit):
        symbol = row["symbol"]
        m = _YAHOO_KR_SYMBOL_RE.match(symbol)
        if m:
            candidates.append({"ticker": m.group(1), "name": row["name"], "market": "KR"})
        else:
            candidates.append({"ticker": symbol, "name": row["name"], "market": "US"})

    if not candidates and _BARE_TICKER_RE.match(query):
        candidates.append({"ticker": query.upper(), "name": "", "market": "US"})

    seen = set()
    deduped = []
    for c in candidates:
        key = (c["ticker"], c["market"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(c)

    return deduped[:limit]
