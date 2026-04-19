"""
03_technical_filter.py

펀더멘털 통과 종목 중 아래 테크니컬 조건 충족분만 남긴다:
  - 52주 저점 대비 +15% 이상 (저점 형성 후 반등 확인)
  - 52주 고점 대비 -30% 이내 (너무 꺾인 종목 제외)
  - 50일 이평선 위 OR RSI 40~70 구간 (과열·바닥권 모두 제외)
  - MACD bullish OR neutral (하락 추세 아님)

출력: outputs/technical_passed_{YYYY-MM-DD}.json
"""

import json
import datetime as dt
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from dataclasses import asdict
from common.data import get_price_snapshot


MIN_REBOUND_FROM_LOW = 0.15   # 저점 +15%
MAX_DRAWDOWN_FROM_HIGH = -0.30  # 고점 -30%
RSI_MIN, RSI_MAX = 40, 70


def filter_technical(fundamentals_passed: list) -> list:
    passed = []
    for i, item in enumerate(fundamentals_passed):
        ticker = item["ticker"]
        if i % 20 == 0:
            print(f"  ...technical {i}/{len(fundamentals_passed)}")
        
        ps = get_price_snapshot(ticker, period="1y")
        if ps is None:
            continue
        
        # 저점 반등 확인
        if ps.pct_from_52w_low < MIN_REBOUND_FROM_LOW:
            continue
        # 과도한 drawdown 제외
        if ps.pct_from_52w_high < MAX_DRAWDOWN_FROM_HIGH:
            continue
        # RSI 건강 구간
        if not (RSI_MIN <= ps.rsi_14 <= RSI_MAX):
            continue
        # 50MA 위 or MACD 상승
        if not (ps.above_50ma or ps.macd_signal == "bullish"):
            continue
        
        combined = {**item, "technical": asdict(ps)}
        passed.append(combined)
    
    # 저점 반등 강도로 정렬
    passed.sort(key=lambda x: x["technical"]["pct_from_52w_low"], reverse=True)
    return passed


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    fund_path = out_dir / f"fundamental_passed_{date}.json"
    if not fund_path.exists():
        print(f"Run 02_fundamental_filter.py first. Missing: {fund_path}")
        sys.exit(1)
    
    with open(fund_path) as f:
        data = json.load(f)
    
    print(f"[technical] Filtering {data['count']} tickers")
    passed = filter_technical(data["tickers"])
    
    out_path = out_dir / f"technical_passed_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(passed), "tickers": passed}, f, indent=2)
    
    print(f"[technical] {len(passed)} passed. Top 5 by rebound:")
    for item in passed[:5]:
        t = item["technical"]
        print(f"  {item['ticker']:6s} from low:{t['pct_from_52w_low']:+.1%}  RSI:{t['rsi_14']:.1f}  MACD:{t['macd_signal']}")
    print(f"Saved → {out_path}")
