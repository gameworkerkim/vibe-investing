"""
clients/yahoo_client.py — Yahoo Finance(yfinance) 데이터 클라이언트

미국(및 야후가 커버하는 해외) 종목의 가격/밸류에이션/퀄리티 지표를 수집한다.
API 키가 필요 없어 로컬 테스트의 기본 데이터 소스로 사용된다.
"""

import math
from typing import Dict, Optional

import numpy as np

try:
    import yfinance as yf
except ImportError:
    yf = None


def _require_yf():
    if yf is None:
        raise RuntimeError("yfinance not installed. pip install yfinance")


def get_price_snapshot(ticker: str, period: str = "1y") -> Optional[Dict]:
    """52주 고저 위치, 50/200일 이평선, RSI14 등 기술적 지표."""
    _require_yf()
    try:
        hist = yf.Ticker(ticker).history(period=period)
        if hist.empty:
            return None

        close = hist["Close"]
        high_52w = float(close.max())
        low_52w = float(close.min())
        current = float(close.iloc[-1])

        pct_from_low = (current - low_52w) / low_52w if low_52w else None
        pct_from_high = (current - high_52w) / high_52w if high_52w else None

        ma50 = close.rolling(50).mean().iloc[-1] if len(close) >= 50 else np.nan
        ma200 = close.rolling(200).mean().iloc[-1] if len(close) >= 200 else np.nan

        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = -delta.where(delta < 0, 0).rolling(14).mean()
        rs = gain / loss.replace(0, np.nan)
        rsi = (100 - 100 / (1 + rs)).iloc[-1] if not rs.isna().all() else 50.0

        avg_vol = float(hist["Volume"].tail(30).mean()) if "Volume" in hist else None

        return {
            "ticker": ticker,
            "price": current,
            "pct_from_52w_low": pct_from_low,
            "pct_from_52w_high": pct_from_high,
            "above_50ma": bool(current > ma50) if not np.isnan(ma50) else None,
            "above_200ma": bool(current > ma200) if not np.isnan(ma200) else None,
            "rsi_14": float(rsi) if not np.isnan(rsi) else None,
            "avg_volume_30d": avg_vol,
            "as_of_date": hist.index[-1].strftime("%Y-%m-%d"),
        }
    except Exception as e:
        print(f"[yahoo:price] {ticker} 실패: {e}")
        return None


def get_fundamental_snapshot(ticker: str) -> Optional[Dict]:
    """
    밸류에이션/퀄리티 지표.
    ROIC는 야후가 직접 제공하지 않아 영업이익*(1-법인세추정)/투하자본 으로 근사한다.
    """
    _require_yf()
    try:
        t = yf.Ticker(ticker)
        info = t.info
        if not info or info.get("regularMarketPrice") is None and info.get("currentPrice") is None:
            return None

        market_cap = info.get("marketCap")
        free_cashflow = info.get("freeCashflow")
        fcf_yield = (free_cashflow / market_cap) if free_cashflow and market_cap else None

        total_debt = info.get("totalDebt") or 0
        total_cash = info.get("totalCash") or 0
        equity = info.get("bookValue", 0) * (info.get("sharesOutstanding") or 0) if info.get("bookValue") else None
        invested_capital = None
        roic = None
        operating_margin = info.get("operatingMargins")
        total_revenue = info.get("totalRevenue")
        if equity is not None and total_revenue and operating_margin is not None:
            invested_capital = (equity or 0) + total_debt - total_cash
            ebit = total_revenue * operating_margin
            nopat = ebit * (1 - 0.21)  # 미국 법인세 실효세율 근사치
            if invested_capital and invested_capital > 0:
                roic = nopat / invested_capital

        debt_ratio = None
        if info.get("debtToEquity") is not None:
            debt_ratio = info["debtToEquity"]  # yfinance는 이미 %(=부채/자본*100) 근사값으로 제공

        return {
            "ticker": ticker,
            "market_cap": market_cap,
            "revenue": total_revenue,
            "operating_income": (total_revenue * operating_margin) if total_revenue and operating_margin else None,
            "net_income": info.get("netIncomeToCommon"),
            "fcf": free_cashflow,
            "debt_ratio": debt_ratio,
            "per": info.get("trailingPE"),
            "forward_per": info.get("forwardPE"),
            "pbr": info.get("priceToBook"),
            "psr": info.get("priceToSalesTrailing12Months"),
            "ev_ebitda": info.get("enterpriseToEbitda"),
            "fcf_yield": fcf_yield,
            "roe": info.get("returnOnEquity"),
            "roic": roic,
            "revenue_growth_yoy": info.get("revenueGrowth"),
            "net_income_growth_yoy": info.get("earningsGrowth"),
            "sector": info.get("sector"),
            "long_name": info.get("longName") or info.get("shortName"),
        }
    except Exception as e:
        print(f"[yahoo:fundamental] {ticker} 실패: {e}")
        return None


def get_risk_free_rate() -> Optional[float]:
    """10년 미국 국채 수익률(^TNX, 단위 %)을 소수(예: 0.045)로 반환."""
    _require_yf()
    try:
        hist = yf.Ticker("^TNX").history(period="5d")
        if hist.empty:
            return None
        return float(hist["Close"].iloc[-1]) / 100
    except Exception as e:
        print(f"[yahoo:rfr] 조회 실패, 기본값 4.5% 사용: {e}")
        return None
