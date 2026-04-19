"""
common/data.py — 데이터 수집 레이어

수집 소스:
  - 주가/거래량: yfinance
  - 펀더멘털/어닝: Finnhub (earnings surprise, analyst consensus)
  - X(Twitter): X API v2 (bearer token) / fallback: Nitter scraping
  - Reddit: PRAW (r/wallstreetbets, r/stocks, r/investing)
  - News: NewsAPI.org + RSS fallback
  - 섹터 ETF: SPDR 11개 (XLK, XLF, XLV, XLE, XLY, XLP, XLI, XLB, XLRE, XLU, XLC)
"""

import os
import time
import datetime as dt
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any

import pandas as pd
import numpy as np
import requests

# Soft imports — 사용자 환경에 따라 설치 여부 다름
try:
    import yfinance as yf
except ImportError:
    yf = None

try:
    import finnhub
except ImportError:
    finnhub = None

try:
    import praw
except ImportError:
    praw = None


# ============================================================================
# 환경 변수
# ============================================================================
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "earnings-momentum-agent/1.0")


# ============================================================================
# 유니버스 (NASDAQ 100 + S&P 500 대표 티커)
# 운영 시에는 매일 아침 위키피디아·SEC·Nasdaq FTP에서 자동 갱신 권장
# ============================================================================
SPDR_SECTOR_ETFS = {
    "XLK": "Technology", "XLF": "Financials", "XLV": "Healthcare",
    "XLE": "Energy", "XLY": "Consumer Discretionary", "XLP": "Consumer Staples",
    "XLI": "Industrials", "XLB": "Materials", "XLRE": "Real Estate",
    "XLU": "Utilities", "XLC": "Communication Services",
}


# ============================================================================
# Data classes
# ============================================================================
@dataclass
class PriceSnapshot:
    ticker: str
    price: float
    pct_from_52w_low: float
    pct_from_52w_high: float
    above_50ma: bool
    above_200ma: bool
    rsi_14: float
    macd_signal: str  # "bullish" / "bearish" / "neutral"
    avg_volume_30d: float
    date: str


@dataclass
class FundamentalSnapshot:
    ticker: str
    revenue_yoy: float  # year-over-year growth (latest quarter)
    revenue_qoq: float  # quarter-over-quarter growth
    eps_actual_last_q: float
    eps_estimate_last_q: float
    eps_surprise_pct: float  # (actual - estimate) / estimate
    eps_yoy: float
    next_earnings_date: Optional[str]
    guidance_raised: Optional[bool]
    gross_margin: Optional[float]
    fcf_margin: Optional[float]


@dataclass
class SentimentSnapshot:
    ticker: str
    x_mentions_7d: int
    x_bullish_pct: float       # 0.0-1.0
    x_volume_delta_pct: float  # 전주 대비 증감
    news_mentions_7d: int
    news_sentiment_score: float  # -1.0 ~ +1.0
    reddit_mentions_7d: int
    reddit_bullish_ratio: float  # (bullish) / (bearish)


@dataclass
class AnalystSnapshot:
    ticker: str
    strong_buy: int
    buy: int
    hold: int
    sell: int
    strong_sell: int
    avg_target: float
    median_target: float
    high_target: float
    low_target: float
    n_revisions_up_30d: int
    n_revisions_down_30d: int


# ============================================================================
# 1. 가격/테크니컬 데이터
# ============================================================================
def get_price_snapshot(ticker: str, period: str = "1y") -> Optional[PriceSnapshot]:
    """yfinance로 1년치 가격 받아 저점·이평선·RSI·MACD 계산."""
    if yf is None:
        raise RuntimeError("yfinance not installed. pip install yfinance")
    
    try:
        hist = yf.Ticker(ticker).history(period=period)
        if hist.empty:
            return None
        
        close = hist["Close"]
        high_52w = close.max()
        low_52w = close.min()
        current = close.iloc[-1]
        
        pct_from_low = (current - low_52w) / low_52w
        pct_from_high = (current - high_52w) / high_52w  # 음수
        
        ma50 = close.rolling(50).mean().iloc[-1] if len(close) >= 50 else np.nan
        ma200 = close.rolling(200).mean().iloc[-1] if len(close) >= 200 else np.nan
        
        # RSI 14
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = -delta.where(delta < 0, 0).rolling(14).mean()
        rs = gain / loss.replace(0, np.nan)
        rsi = (100 - 100 / (1 + rs)).iloc[-1] if not rs.isna().all() else 50.0
        
        # MACD
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9, adjust=False).mean()
        macd_signal = ("bullish" if macd_line.iloc[-1] > signal_line.iloc[-1]
                      else "bearish")
        # 교차 여부 (최근 3일 내)
        if len(macd_line) >= 3:
            recent_cross = (macd_line.iloc[-3:] - signal_line.iloc[-3:]).abs().min() < 0.1
            if recent_cross:
                macd_signal = "neutral"
        
        avg_vol = hist["Volume"].tail(30).mean() if "Volume" in hist else 0
        
        return PriceSnapshot(
            ticker=ticker,
            price=float(current),
            pct_from_52w_low=float(pct_from_low),
            pct_from_52w_high=float(pct_from_high),
            above_50ma=bool(current > ma50) if not np.isnan(ma50) else False,
            above_200ma=bool(current > ma200) if not np.isnan(ma200) else False,
            rsi_14=float(rsi) if not np.isnan(rsi) else 50.0,
            macd_signal=macd_signal,
            avg_volume_30d=float(avg_vol),
            date=hist.index[-1].strftime("%Y-%m-%d"),
        )
    except Exception as e:
        print(f"[price] {ticker} failed: {e}")
        return None


# ============================================================================
# 2. 펀더멘털 / 어닝 (Finnhub)
# ============================================================================
def get_fundamental_snapshot(ticker: str) -> Optional[FundamentalSnapshot]:
    """Finnhub API로 최근 4분기 실적 + 어닝 서프라이즈 수집."""
    if not FINNHUB_API_KEY:
        print(f"[fundamental] {ticker}: FINNHUB_API_KEY not set — using yfinance fallback")
        return _fundamental_yfinance_fallback(ticker)
    
    if finnhub is None:
        raise RuntimeError("finnhub-python not installed. pip install finnhub-python")
    
    client = finnhub.Client(api_key=FINNHUB_API_KEY)
    try:
        # 어닝 서프라이즈 (최근 4분기)
        earnings = client.company_earnings(ticker, limit=4)
        if not earnings or len(earnings) < 2:
            return None
        
        latest = earnings[0]
        prev = earnings[1] if len(earnings) > 1 else None
        prev_year = earnings[3] if len(earnings) >= 4 else None
        
        eps_surprise = ((latest["actual"] - latest["estimate"]) / abs(latest["estimate"])
                       if latest.get("estimate") else 0.0)
        
        # 매출 (basic financials)
        basic = client.company_basic_financials(ticker, "all")
        metric = basic.get("metric", {})
        
        revenue_yoy = metric.get("revenueGrowthYoyQuarterly", 0) / 100 if metric.get("revenueGrowthYoyQuarterly") else 0
        revenue_qoq = metric.get("revenueGrowthQuarterlyYoy", 0) / 100 if metric.get("revenueGrowthQuarterlyYoy") else 0
        
        # 다음 어닝일
        calendar = client.earnings_calendar(_from=dt.date.today().isoformat(),
                                            to=(dt.date.today() + dt.timedelta(days=90)).isoformat(),
                                            symbol=ticker)
        next_eps_date = None
        if calendar.get("earningsCalendar"):
            next_eps_date = calendar["earningsCalendar"][0].get("date")
        
        return FundamentalSnapshot(
            ticker=ticker,
            revenue_yoy=float(revenue_yoy),
            revenue_qoq=float(revenue_qoq),
            eps_actual_last_q=float(latest.get("actual", 0)),
            eps_estimate_last_q=float(latest.get("estimate", 0)),
            eps_surprise_pct=float(eps_surprise),
            eps_yoy=(float(latest["actual"] - prev_year["actual"]) / abs(prev_year["actual"])
                    if prev_year and prev_year.get("actual") else 0.0),
            next_earnings_date=next_eps_date,
            guidance_raised=None,  # Finnhub 무료 tier에는 없음 — 뉴스로 감지 필요
            gross_margin=metric.get("grossMarginTTM", None),
            fcf_margin=metric.get("fcfMarginTTM", None),
        )
    except Exception as e:
        print(f"[fundamental] {ticker} failed: {e}")
        return _fundamental_yfinance_fallback(ticker)


def _fundamental_yfinance_fallback(ticker: str) -> Optional[FundamentalSnapshot]:
    """Finnhub 없을 때 yfinance의 quarterly_income_stmt 사용."""
    if yf is None:
        return None
    try:
        t = yf.Ticker(ticker)
        quarterly = t.quarterly_income_stmt
        if quarterly is None or quarterly.empty:
            return None
        
        rev = quarterly.loc["Total Revenue"] if "Total Revenue" in quarterly.index else None
        eps = quarterly.loc["Basic EPS"] if "Basic EPS" in quarterly.index else None
        
        if rev is None or len(rev) < 2:
            return None
        
        rev_yoy = (rev.iloc[0] - rev.iloc[3]) / abs(rev.iloc[3]) if len(rev) >= 4 else 0
        rev_qoq = (rev.iloc[0] - rev.iloc[1]) / abs(rev.iloc[1]) if len(rev) >= 2 else 0
        
        info = t.info
        return FundamentalSnapshot(
            ticker=ticker,
            revenue_yoy=float(rev_yoy),
            revenue_qoq=float(rev_qoq),
            eps_actual_last_q=float(eps.iloc[0]) if eps is not None and len(eps) > 0 else 0.0,
            eps_estimate_last_q=0.0,
            eps_surprise_pct=0.0,
            eps_yoy=float((eps.iloc[0] - eps.iloc[3]) / abs(eps.iloc[3])) if eps is not None and len(eps) >= 4 else 0.0,
            next_earnings_date=info.get("earningsDate", [None])[0] if isinstance(info.get("earningsDate"), list) else None,
            guidance_raised=None,
            gross_margin=info.get("grossMargins"),
            fcf_margin=info.get("freeCashflow", 0) / info.get("totalRevenue", 1) if info.get("totalRevenue") else None,
        )
    except Exception as e:
        print(f"[fundamental fallback] {ticker} failed: {e}")
        return None


# ============================================================================
# 3. 심리 (X, Reddit, News)
# ============================================================================
def get_x_sentiment(ticker: str, days: int = 7) -> Dict[str, Any]:
    """X API v2로 $ticker 검색. bearer token 없으면 StockTwits fallback."""
    if X_BEARER_TOKEN:
        try:
            end = dt.datetime.utcnow()
            start = end - dt.timedelta(days=days)
            query = f"${ticker} -is:retweet lang:en"
            url = "https://api.twitter.com/2/tweets/counts/recent"
            headers = {"Authorization": f"Bearer {X_BEARER_TOKEN}"}
            params = {"query": query, "granularity": "day",
                     "start_time": start.isoformat() + "Z",
                     "end_time": end.isoformat() + "Z"}
            r = requests.get(url, headers=headers, params=params, timeout=10)
            if r.status_code == 200:
                data = r.json()
                total = data.get("meta", {}).get("total_tweet_count", 0)
                return {"mentions": total, "bullish_pct": 0.5}  # tone은 별도 분석 필요
        except Exception as e:
            print(f"[x] {ticker} failed: {e}")
    
    # Fallback — StockTwits (무료, 유사한 sentiment 제공)
    return _stocktwits_sentiment(ticker)


def _stocktwits_sentiment(ticker: str) -> Dict[str, Any]:
    """StockTwits API — message count + 작성자의 bullish/bearish 태깅."""
    try:
        url = f"https://api.stocktwits.com/api/2/streams/symbol/{ticker}.json"
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return {"mentions": 0, "bullish_pct": 0.5}
        
        data = r.json()
        messages = data.get("messages", [])
        bull = sum(1 for m in messages
                  if m.get("entities", {}).get("sentiment", {}).get("basic") == "Bullish")
        bear = sum(1 for m in messages
                  if m.get("entities", {}).get("sentiment", {}).get("basic") == "Bearish")
        total = bull + bear
        
        return {
            "mentions": len(messages),
            "bullish_pct": bull / total if total > 0 else 0.5,
        }
    except Exception as e:
        print(f"[stocktwits] {ticker} failed: {e}")
        return {"mentions": 0, "bullish_pct": 0.5}


def get_reddit_sentiment(ticker: str, days: int = 7) -> Dict[str, Any]:
    """r/wallstreetbets, r/stocks, r/investing에서 ticker 언급 카운트."""
    if not (REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET):
        return {"mentions": 0, "bullish_ratio": 1.0}
    
    if praw is None:
        raise RuntimeError("praw not installed. pip install praw")
    
    try:
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT,
        )
        subreddits = ["wallstreetbets", "stocks", "investing"]
        total_mentions = 0
        bullish_kw = ["buy", "call", "moon", "rocket", "bull", "long", "yolo"]
        bearish_kw = ["sell", "put", "short", "bear", "crash", "dump"]
        bull_count = bear_count = 0
        
        for sub in subreddits:
            for post in reddit.subreddit(sub).search(ticker, time_filter="week", limit=25):
                total_mentions += 1
                text = (post.title + " " + (post.selftext or "")).lower()
                if any(kw in text for kw in bullish_kw): bull_count += 1
                if any(kw in text for kw in bearish_kw): bear_count += 1
        
        ratio = bull_count / bear_count if bear_count > 0 else (bull_count if bull_count > 0 else 1.0)
        return {"mentions": total_mentions, "bullish_ratio": ratio}
    except Exception as e:
        print(f"[reddit] {ticker} failed: {e}")
        return {"mentions": 0, "bullish_ratio": 1.0}


def get_news_sentiment(ticker: str, days: int = 7) -> Dict[str, Any]:
    """NewsAPI.org로 뉴스 헤드라인 수집 + LLM 또는 keyword 기반 sentiment 점수."""
    if not NEWSAPI_KEY:
        return {"mentions": 0, "sentiment_score": 0.0, "headlines": []}
    
    try:
        url = "https://newsapi.org/v2/everything"
        from_date = (dt.date.today() - dt.timedelta(days=days)).isoformat()
        params = {
            "q": f"{ticker} stock",
            "from": from_date,
            "sortBy": "popularity",
            "language": "en",
            "pageSize": 20,
            "apiKey": NEWSAPI_KEY,
        }
        r = requests.get(url, params=params, timeout=10)
        if r.status_code != 200:
            return {"mentions": 0, "sentiment_score": 0.0, "headlines": []}
        
        data = r.json()
        articles = data.get("articles", [])
        headlines = [a["title"] for a in articles if a.get("title")]
        
        # 간단 키워드 기반 (실제 운영 시 LLM으로 대체 — 04_sentiment_engine.py 참고)
        positive = ["beat", "surge", "rally", "growth", "upgrade", "breakout", "soar", "jump"]
        negative = ["miss", "plunge", "crash", "downgrade", "drop", "disappoint", "slump", "fall"]
        pos = sum(1 for h in headlines for w in positive if w in h.lower())
        neg = sum(1 for h in headlines for w in negative if w in h.lower())
        total = pos + neg
        score = (pos - neg) / total if total > 0 else 0.0
        
        return {"mentions": len(headlines), "sentiment_score": score, "headlines": headlines[:5]}
    except Exception as e:
        print(f"[news] {ticker} failed: {e}")
        return {"mentions": 0, "sentiment_score": 0.0, "headlines": []}


def get_sentiment_snapshot(ticker: str) -> SentimentSnapshot:
    """세 소스 통합."""
    x = get_x_sentiment(ticker)
    reddit = get_reddit_sentiment(ticker)
    news = get_news_sentiment(ticker)
    
    return SentimentSnapshot(
        ticker=ticker,
        x_mentions_7d=x.get("mentions", 0),
        x_bullish_pct=x.get("bullish_pct", 0.5),
        x_volume_delta_pct=0.0,  # 전주 대비 — 실제 운영 시 저장·비교 필요
        news_mentions_7d=news.get("mentions", 0),
        news_sentiment_score=news.get("sentiment_score", 0.0),
        reddit_mentions_7d=reddit.get("mentions", 0),
        reddit_bullish_ratio=reddit.get("bullish_ratio", 1.0),
    )


# ============================================================================
# 4. 애널리스트 컨센서스 (Finnhub)
# ============================================================================
def get_analyst_snapshot(ticker: str) -> Optional[AnalystSnapshot]:
    if not FINNHUB_API_KEY or finnhub is None:
        return _analyst_yfinance_fallback(ticker)
    
    client = finnhub.Client(api_key=FINNHUB_API_KEY)
    try:
        trends = client.recommendation_trends(ticker)
        if not trends:
            return _analyst_yfinance_fallback(ticker)
        
        latest = trends[0]
        targets = client.price_target(ticker)
        
        return AnalystSnapshot(
            ticker=ticker,
            strong_buy=latest.get("strongBuy", 0),
            buy=latest.get("buy", 0),
            hold=latest.get("hold", 0),
            sell=latest.get("sell", 0),
            strong_sell=latest.get("strongSell", 0),
            avg_target=float(targets.get("targetMean", 0)),
            median_target=float(targets.get("targetMedian", 0)),
            high_target=float(targets.get("targetHigh", 0)),
            low_target=float(targets.get("targetLow", 0)),
            n_revisions_up_30d=0,  # 별도 호출 필요
            n_revisions_down_30d=0,
        )
    except Exception as e:
        print(f"[analyst] {ticker} failed: {e}")
        return _analyst_yfinance_fallback(ticker)


def _analyst_yfinance_fallback(ticker: str) -> Optional[AnalystSnapshot]:
    if yf is None:
        return None
    try:
        t = yf.Ticker(ticker)
        info = t.info
        return AnalystSnapshot(
            ticker=ticker,
            strong_buy=info.get("strongBuy", 0) or 0,
            buy=info.get("buy", 0) or 0,
            hold=info.get("hold", 0) or 0,
            sell=info.get("sell", 0) or 0,
            strong_sell=info.get("strongSell", 0) or 0,
            avg_target=float(info.get("targetMeanPrice", 0) or 0),
            median_target=float(info.get("targetMedianPrice", 0) or 0),
            high_target=float(info.get("targetHighPrice", 0) or 0),
            low_target=float(info.get("targetLowPrice", 0) or 0),
            n_revisions_up_30d=0,
            n_revisions_down_30d=0,
        )
    except Exception as e:
        print(f"[analyst fallback] {ticker} failed: {e}")
        return None


# ============================================================================
# 5. 유니버스 로더 — NASDAQ-100 + S&P500 티커
# ============================================================================
def load_universe() -> List[str]:
    """위키피디아에서 NASDAQ-100 + S&P500 티커 목록을 받는다."""
    tickers = set()
    
    # S&P 500
    try:
        sp500 = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")[0]
        tickers.update(sp500["Symbol"].str.replace(".", "-").tolist())
    except Exception as e:
        print(f"[universe] S&P500 load failed: {e}")
    
    # NASDAQ-100
    try:
        nasdaq = pd.read_html("https://en.wikipedia.org/wiki/Nasdaq-100")[4]
        col = "Ticker" if "Ticker" in nasdaq.columns else "Symbol"
        tickers.update(nasdaq[col].tolist())
    except Exception as e:
        print(f"[universe] NASDAQ load failed: {e}")
    
    return sorted(tickers)


if __name__ == "__main__":
    # 테스트
    print("Testing data layer...")
    t = "NVDA"
    print(f"\n--- {t} Price ---")
    ps = get_price_snapshot(t)
    if ps:
        print(f"  Price: ${ps.price:.2f}, from 52w low: {ps.pct_from_52w_low:.1%}, RSI: {ps.rsi_14:.1f}")
    
    print(f"\n--- {t} Fundamental ---")
    fs = get_fundamental_snapshot(t)
    if fs:
        print(f"  Rev YoY: {fs.revenue_yoy:.1%}, EPS surprise: {fs.eps_surprise_pct:.1%}")
    
    print(f"\n--- {t} Sentiment ---")
    ss = get_sentiment_snapshot(t)
    print(f"  News: {ss.news_mentions_7d} mentions, score {ss.news_sentiment_score:+.2f}")
