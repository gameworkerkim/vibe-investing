"""
05_analyst_consensus.py

각 종목의 애널리스트 컨센서스를 수집·정리.
Nvidia-forecast 스타일 dashboard에 쓰일 데이터 준비.

수집 항목:
  - Strong Buy / Buy / Hold / Sell / Strong Sell count
  - 평균/중간/최고/최저 12개월 목표가
  - 최근 30일 리비전 (상향/하향)
  - 현재가 vs 평균 목표가 갭 (upside %)

출력: outputs/analyst_scored_{YYYY-MM-DD}.json
"""

import json
import datetime as dt
from pathlib import Path
from dataclasses import asdict
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.data import get_analyst_snapshot


def score_analyst(sentiment_scored: list) -> list:
    result = []
    for i, item in enumerate(sentiment_scored):
        ticker = item["ticker"]
        if i % 10 == 0:
            print(f"  ...analyst {i}/{len(sentiment_scored)}")
        
        an = get_analyst_snapshot(ticker)
        if an is None:
            item["analyst"] = None
            result.append(item)
            continue
        
        current_price = item["technical"]["price"]
        upside = (an.avg_target - current_price) / current_price if current_price > 0 else 0.0
        total = an.strong_buy + an.buy + an.hold + an.sell + an.strong_sell
        bullish_ratio = ((an.strong_buy + an.buy) / total) if total > 0 else 0.0
        
        item["analyst"] = asdict(an)
        item["analyst"]["upside_to_target_pct"] = float(upside)
        item["analyst"]["bullish_ratio"] = float(bullish_ratio)
        
        result.append(item)
    
    # upside + bullish_ratio로 정렬
    result.sort(
        key=lambda x: (
            (x.get("analyst") or {}).get("upside_to_target_pct", 0) +
            (x.get("analyst") or {}).get("bullish_ratio", 0)
        ),
        reverse=True,
    )
    return result


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    sent_path = out_dir / f"sentiment_scored_{date}.json"
    if not sent_path.exists():
        print(f"Run 04_sentiment_engine.py first.")
        sys.exit(1)
    
    with open(sent_path) as f:
        data = json.load(f)
    
    scored = score_analyst(data["tickers"])
    
    out_path = out_dir / f"analyst_scored_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(scored), "tickers": scored}, f, indent=2)
    
    print(f"[analyst] Top 5 by upside + bullish ratio:")
    for item in scored[:5]:
        a = item.get("analyst") or {}
        if a:
            print(f"  {item['ticker']:6s} upside:{a.get('upside_to_target_pct',0):+.1%}  "
                  f"bullish:{a.get('bullish_ratio',0):.0%}  avg_target:${a.get('avg_target',0):.2f}")
    print(f"Saved → {out_path}")
