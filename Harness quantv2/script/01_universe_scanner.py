"""
01_universe_scanner.py

NASDAQ-100 + S&P500 약 600-700개 종목을 스캔해 다음 기준 통과분만 남긴다:
  - 시가총액 > $5B
  - 30일 평균 거래대금 > $50M
  - 미국 상장, OTC/Pink sheet 제외

출력: outputs/universe_filtered_{YYYY-MM-DD}.json
"""

import json
import datetime as dt
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.data import load_universe, get_price_snapshot

try:
    import yfinance as yf
except ImportError:
    yf = None


MIN_MARKET_CAP = 5_000_000_000   # $5B
MIN_AVG_DOLLAR_VOLUME = 50_000_000  # $50M/일


def scan() -> list:
    tickers = load_universe()
    print(f"[universe] Loaded {len(tickers)} tickers from NASDAQ-100 + S&P500")
    
    filtered = []
    for i, ticker in enumerate(tickers):
        if i % 50 == 0:
            print(f"  ...scanned {i}/{len(tickers)}")
        
        try:
            info = yf.Ticker(ticker).info
            mcap = info.get("marketCap", 0) or 0
            if mcap < MIN_MARKET_CAP:
                continue
            
            ps = get_price_snapshot(ticker, period="3mo")
            if ps is None:
                continue
            avg_dollar_vol = ps.avg_volume_30d * ps.price
            if avg_dollar_vol < MIN_AVG_DOLLAR_VOLUME:
                continue
            
            filtered.append({
                "ticker": ticker,
                "market_cap": mcap,
                "price": ps.price,
                "avg_dollar_volume_30d": avg_dollar_vol,
                "sector": info.get("sector", "Unknown"),
                "industry": info.get("industry", "Unknown"),
            })
        except Exception as e:
            continue
    
    print(f"[universe] {len(filtered)} tickers passed filters")
    return filtered


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    out_dir.mkdir(exist_ok=True)
    
    result = scan()
    out_path = out_dir / f"universe_filtered_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(result), "tickers": result}, f, indent=2)
    print(f"Saved → {out_path}")
