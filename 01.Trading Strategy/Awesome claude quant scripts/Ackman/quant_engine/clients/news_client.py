"""
clients/news_client.py — 뉴스 헤드라인 수집 (촉매/센티먼트 분석용)

NEWSAPI_KEY가 있으면 NewsAPI.org, 없으면 Google News RSS(키 불필요)로 폴백한다.
키워드 기반 간이 sentiment score를 계산해 LLM 프롬프트에 참고자료로 넘긴다.
"""

import datetime as dt
import email.utils
import os
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional
from urllib.parse import quote

import requests

POSITIVE_WORDS = ["beat", "surge", "rally", "growth", "upgrade", "breakout", "soar",
                   "jump", "buyback", "raise", "record", "outperform"]
NEGATIVE_WORDS = ["miss", "plunge", "crash", "downgrade", "drop", "disappoint",
                   "slump", "fall", "lawsuit", "probe", "cut", "recall"]


def _parse_published_at(raw: str) -> Optional[dt.datetime]:
    """RSS(RFC 822: 'Sun, 12 Jul 2026 14:01:04 GMT')와 NewsAPI(ISO 8601) 포맷을
    모두 MySQL DATETIME에 바로 넣을 수 있는 naive datetime으로 정규화."""
    if not raw:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed
    except (TypeError, ValueError):
        pass
    try:
        parsed = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed
    except ValueError:
        return None


def _newsapi_key():
    return os.getenv("NEWSAPI_KEY") or None


def _score_headline(title: str) -> float:
    lower = title.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in lower)
    total = pos + neg
    return (pos - neg) / total if total else 0.0


def _fetch_newsapi(query: str, days: int) -> List[Dict]:
    key = _newsapi_key()
    from_date = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    resp = requests.get(
        "https://newsapi.org/v2/everything",
        params={
            "q": query, "from": from_date, "sortBy": "publishedAt",
            "language": "en", "pageSize": 20, "apiKey": key,
        },
        timeout=10,
    )
    if not resp.ok:
        return []
    articles = resp.json().get("articles", [])
    out = []
    for a in articles:
        title = a.get("title") or ""
        if not title:
            continue
        out.append({
            "title": title,
            "url": a.get("url"),
            "source": (a.get("source") or {}).get("name"),
            "published_at": _parse_published_at(a.get("publishedAt")),
            "sentiment_score": _score_headline(title),
        })
    return out


def _fetch_google_news_rss(query: str) -> List[Dict]:
    url = f"https://news.google.com/rss/search?q={quote(query)}&hl=en-US&gl=US&ceid=US:en"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        out = []
        for item in root.iter("item"):
            title = (item.findtext("title") or "").strip()
            if not title:
                continue
            out.append({
                "title": title,
                "url": (item.findtext("link") or "").strip(),
                "source": (item.findtext("source") or "Google News").strip(),
                "published_at": _parse_published_at((item.findtext("pubDate") or "").strip()),
                "sentiment_score": _score_headline(title),
            })
        return out[:20]
    except Exception as e:
        print(f"[news:rss] '{query}' 조회 실패: {e}")
        return []


def get_recent_headlines(ticker: str, company_name: str = "", days: int = 7) -> List[Dict]:
    """최근 뉴스 헤드라인 수집. NewsAPI 키가 있으면 우선 사용, 없으면 Google News RSS."""
    query = f"{company_name} {ticker}".strip() if company_name else f"{ticker} stock"

    if _newsapi_key():
        try:
            items = _fetch_newsapi(query, days)
            if items:
                return items
        except Exception as e:
            print(f"[news:newsapi] {ticker} 실패, RSS로 폴백: {e}")

    return _fetch_google_news_rss(query)


def summarize_sentiment(items: List[Dict]) -> Dict:
    if not items:
        return {"mentions": 0, "avg_sentiment": 0.0}
    scores = [it["sentiment_score"] for it in items]
    return {
        "mentions": len(items),
        "avg_sentiment": sum(scores) / len(scores),
    }
