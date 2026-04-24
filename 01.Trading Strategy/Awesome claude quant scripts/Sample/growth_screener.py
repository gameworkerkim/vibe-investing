"""
S&P 500 Growth Factor Screener
================================

Filters S&P 500 universe by 7 growth criteria:
  1. 3-year average EPS growth > 15%
  2. 3-year average revenue growth > 10%
  3. ROE > 15% (TTM)
  4. Forward P/E < 40
  5. PEG < 1.5
  6. Operating Cash Flow / Net Income >= 80%
  7. Listed in S&P 500 universe

Requires (run locally — Yahoo Finance API blocked in some sandboxes):
    pip install yfinance pandas requests beautifulsoup4 lxml tqdm

Usage:
    python growth_screener.py
    python growth_screener.py --output my_screen.csv --min-eps-growth 0.20

Output:
    growth_screen_results.csv (passed only, sorted by composite score)
    growth_screen_full.csv    (all S&P 500 with per-criterion pass/fail)

Notes on data source:
  - yfinance is free but rate-limited and occasionally inconsistent.
  - For institutional use, swap in Financial Modeling Prep, EOD HD, Refinitiv,
    or Bloomberg via their respective APIs (see DATA_PROVIDER section).
  - 3-year averages here use the 3 most recent fiscal years from yfinance's
    income statement / financials. Adjust if you prefer CAGR vs. simple mean.
"""

from __future__ import annotations

import argparse
import time
from dataclasses import dataclass, asdict
from typing import Optional

import pandas as pd
import requests
import yfinance as yf
from tqdm import tqdm


# ---------------------------------------------------------------------------
# Default thresholds (override via CLI)
# ---------------------------------------------------------------------------
DEFAULTS = {
    "min_eps_growth_3y": 0.15,    # 15%
    "min_rev_growth_3y": 0.10,    # 10%
    "min_roe": 0.15,              # 15%
    "max_forward_pe": 40.0,
    "max_peg": 1.5,
    "min_cfo_to_ni": 0.80,        # 80%
}


# ---------------------------------------------------------------------------
# 1. Universe: S&P 500 constituents
# ---------------------------------------------------------------------------
def get_sp500_tickers() -> list[str]:
    """Scrape current S&P 500 constituents from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {"User-Agent": "Mozilla/5.0 (research-screener)"}
    html = requests.get(url, headers=headers, timeout=30).text
    tables = pd.read_html(html)
    df = tables[0]
    # Yahoo uses '-' instead of '.' (BRK.B -> BRK-B)
    return [t.replace(".", "-") for t in df["Symbol"].astype(str).tolist()]


# ---------------------------------------------------------------------------
# 2. Helpers — compute the 3-year averages from yfinance financials
# ---------------------------------------------------------------------------
def _three_year_avg_growth(series: pd.Series) -> Optional[float]:
    """Simple mean of YoY growth rates over the most recent 3 transitions."""
    s = series.dropna().sort_index()
    if len(s) < 4:
        return None
    yoy = s.pct_change().dropna()
    last3 = yoy.tail(3)
    if len(last3) < 3:
        return None
    return float(last3.mean())


def _safe(x):
    try:
        if x is None:
            return None
        return float(x)
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# 3. Data structure
# ---------------------------------------------------------------------------
@dataclass
class TickerMetrics:
    ticker: str
    name: Optional[str] = None
    sector: Optional[str] = None
    market_cap: Optional[float] = None
    eps_growth_3y: Optional[float] = None
    rev_growth_3y: Optional[float] = None
    roe: Optional[float] = None
    forward_pe: Optional[float] = None
    peg: Optional[float] = None
    cfo_to_ni: Optional[float] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# 4. Pull metrics for a single ticker
# ---------------------------------------------------------------------------
def fetch_metrics(ticker: str) -> TickerMetrics:
    out = TickerMetrics(ticker=ticker)
    try:
        t = yf.Ticker(ticker)
        info = t.info or {}
        out.name = info.get("longName") or info.get("shortName")
        out.sector = info.get("sector")
        out.market_cap = _safe(info.get("marketCap"))
        out.forward_pe = _safe(info.get("forwardPE"))
        # yfinance has both 'pegRatio' (TTM-based) and 'trailingPegRatio'.
        out.peg = _safe(info.get("trailingPegRatio") or info.get("pegRatio"))
        out.roe = _safe(info.get("returnOnEquity"))

        # --- 3-year EPS / revenue growth from income statement ---
        fin = t.financials  # index = line items, columns = fiscal years
        if fin is not None and not fin.empty:
            cols = fin.columns
            if "Total Revenue" in fin.index:
                rev = fin.loc["Total Revenue", cols].astype(float)
                out.rev_growth_3y = _three_year_avg_growth(rev)
            for eps_row in ("Diluted EPS", "Basic EPS"):
                if eps_row in fin.index:
                    eps = fin.loc[eps_row, cols].astype(float)
                    out.eps_growth_3y = _three_year_avg_growth(eps)
                    break

        # --- CFO / Net income (TTM proxy: most recent fiscal year) ---
        cf = t.cashflow
        if cf is not None and not cf.empty:
            cfo_row = (
                "Operating Cash Flow"
                if "Operating Cash Flow" in cf.index
                else "Total Cash From Operating Activities"
                if "Total Cash From Operating Activities" in cf.index
                else None
            )
            ni = _safe(info.get("netIncomeToCommon"))
            if cfo_row and len(cf.columns) > 0 and ni and ni > 0:
                cfo = _safe(cf.loc[cfo_row, cf.columns[0]])
                if cfo is not None:
                    out.cfo_to_ni = cfo / ni

    except Exception as e:
        out.error = f"{type(e).__name__}: {e}"
    return out


# ---------------------------------------------------------------------------
# 5. Apply filters & rank
# ---------------------------------------------------------------------------
def apply_filters(df: pd.DataFrame, t: dict) -> pd.DataFrame:
    df = df.copy()
    df["pass_eps_growth"] = df["eps_growth_3y"] > t["min_eps_growth_3y"]
    df["pass_rev_growth"] = df["rev_growth_3y"] > t["min_rev_growth_3y"]
    df["pass_roe"]        = df["roe"] > t["min_roe"]
    df["pass_fpe"]        = df["forward_pe"] < t["max_forward_pe"]
    df["pass_peg"]        = df["peg"] < t["max_peg"]
    df["pass_cfo_ni"]     = df["cfo_to_ni"] >= t["min_cfo_to_ni"]
    pass_cols = [c for c in df.columns if c.startswith("pass_")]
    df["passed_all"] = df[pass_cols].all(axis=1)
    df["criteria_passed_count"] = df[pass_cols].sum(axis=1)

    # Composite score: lower PEG / Forward PE = better, higher growth = better.
    # Quick z-score-style ranking among passing names only.
    if df["passed_all"].any():
        passing = df[df["passed_all"]].copy()
        passing["score"] = (
            passing["eps_growth_3y"].rank(pct=True) * 0.3
            + passing["rev_growth_3y"].rank(pct=True) * 0.2
            + passing["roe"].rank(pct=True) * 0.2
            + (1 - passing["forward_pe"].rank(pct=True)) * 0.15
            + (1 - passing["peg"].rank(pct=True)) * 0.15
        )
        df.loc[passing.index, "score"] = passing["score"]
    else:
        df["score"] = pd.NA
    return df


# ---------------------------------------------------------------------------
# 6. Main
# ---------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="S&P 500 Growth Screener")
    p.add_argument("--output", default="growth_screen_results.csv")
    p.add_argument("--full-output", default="growth_screen_full.csv")
    p.add_argument("--min-eps-growth", type=float, default=DEFAULTS["min_eps_growth_3y"])
    p.add_argument("--min-rev-growth", type=float, default=DEFAULTS["min_rev_growth_3y"])
    p.add_argument("--min-roe",        type=float, default=DEFAULTS["min_roe"])
    p.add_argument("--max-forward-pe", type=float, default=DEFAULTS["max_forward_pe"])
    p.add_argument("--max-peg",        type=float, default=DEFAULTS["max_peg"])
    p.add_argument("--min-cfo-ni",     type=float, default=DEFAULTS["min_cfo_to_ni"])
    p.add_argument("--limit", type=int, default=None,
                   help="For testing — only fetch first N tickers")
    p.add_argument("--sleep", type=float, default=0.3,
                   help="Seconds between Yahoo requests (rate-limit politeness)")
    args = p.parse_args()

    thresholds = {
        "min_eps_growth_3y": args.min_eps_growth,
        "min_rev_growth_3y": args.min_rev_growth,
        "min_roe":           args.min_roe,
        "max_forward_pe":    args.max_forward_pe,
        "max_peg":           args.max_peg,
        "min_cfo_to_ni":     args.min_cfo_ni,
    }
    print(f"[*] Thresholds: {thresholds}")

    print("[*] Fetching S&P 500 constituents from Wikipedia ...")
    tickers = get_sp500_tickers()
    if args.limit:
        tickers = tickers[: args.limit]
    print(f"[*] Universe size: {len(tickers)}")

    rows = []
    for tk in tqdm(tickers, desc="Pulling fundamentals"):
        rows.append(asdict(fetch_metrics(tk)))
        time.sleep(args.sleep)

    df = pd.DataFrame(rows)
    df = apply_filters(df, thresholds)

    df.to_csv(args.full_output, index=False)
    passed = df[df["passed_all"]].sort_values("score", ascending=False)
    passed.to_csv(args.output, index=False)

    print(f"\n[*] Wrote full results: {args.full_output}  ({len(df)} rows)")
    print(f"[*] Wrote passing only: {args.output}  ({len(passed)} rows)")
    if len(passed):
        print("\nTop 15 passing names:")
        cols = ["ticker", "name", "sector", "eps_growth_3y", "rev_growth_3y",
                "roe", "forward_pe", "peg", "cfo_to_ni", "score"]
        print(passed[cols].head(15).to_string(index=False))
    else:
        print("\n[!] No tickers passed all criteria — try loosening thresholds.")


if __name__ == "__main__":
    main()
