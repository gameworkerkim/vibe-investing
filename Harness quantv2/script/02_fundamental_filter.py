"""
02_fundamental_filter.py

전 단계 universe에서 다음 기준을 통과한 종목만 남긴다:
  - 매출 YoY > 10% (성장성)
  - 매출 QoQ > 0% (직전 분기 대비 상승)
  - EPS 어닝 서프라이즈 > +5% (컨센서스 대비 beat)
  - EPS YoY > 0% (전년 동기 대비 개선)

출력: outputs/fundamental_passed_{YYYY-MM-DD}.json
"""

import json
import datetime as dt
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from dataclasses import asdict
from common.data import get_fundamental_snapshot


MIN_REVENUE_YOY = 0.10        # 10%
MIN_REVENUE_QOQ = 0.0         # 직전 분기 대비 상승
MIN_EPS_SURPRISE = 0.05       # 5% beat
MIN_EPS_YOY = 0.0             # 전년 동기 대비 개선


def filter_fundamentals(universe: list) -> list:
    passed = []
    for i, item in enumerate(universe):
        ticker = item["ticker"]
        if i % 25 == 0:
            print(f"  ...fundamentals {i}/{len(universe)}")
        
        fs = get_fundamental_snapshot(ticker)
        if fs is None:
            continue
        
        if (fs.revenue_yoy >= MIN_REVENUE_YOY and
            fs.revenue_qoq >= MIN_REVENUE_QOQ and
            fs.eps_surprise_pct >= MIN_EPS_SURPRISE and
            fs.eps_yoy >= MIN_EPS_YOY):
            
            combined = {**item, "fundamentals": asdict(fs)}
            passed.append(combined)
    
    passed.sort(key=lambda x: (
        x["fundamentals"]["eps_surprise_pct"] + x["fundamentals"]["revenue_yoy"]
    ), reverse=True)
    
    return passed


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    # 전 단계 로드
    universe_path = out_dir / f"universe_filtered_{date}.json"
    if not universe_path.exists():
        print(f"Run 01_universe_scanner.py first! Missing: {universe_path}")
        sys.exit(1)
    
    with open(universe_path) as f:
        universe_data = json.load(f)
    
    print(f"[fundamental] Filtering {universe_data['count']} tickers")
    passed = filter_fundamentals(universe_data["tickers"])
    
    out_path = out_dir / f"fundamental_passed_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(passed), "tickers": passed}, f, indent=2)
    
    print(f"[fundamental] {len(passed)} passed. Top 5:")
    for item in passed[:5]:
        f = item["fundamentals"]
        print(f"  {item['ticker']:6s} RevYoY:{f['revenue_yoy']:+.1%}  EPS surprise:{f['eps_surprise_pct']:+.1%}")
    print(f"Saved → {out_path}")
