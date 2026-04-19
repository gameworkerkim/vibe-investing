"""
06_multi_agent_judge.py — Bull / Bear / Risk / PM 멀티 에이전트 토론

각 종목에 대해 네 에이전트가 토론하여 최종 conviction 산출.
common/llm.py의 MultiAgentDebate 클래스를 사용.

출력: outputs/judged_{YYYY-MM-DD}.json
"""

import json
import datetime as dt
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.llm import MultiAgentDebate


def build_context(item: dict) -> dict:
    """에이전트에 전달할 compact context."""
    fund = item.get("fundamentals", {}) or {}
    tech = item.get("technical", {}) or {}
    sent = item.get("sentiment", {}) or {}
    an = item.get("analyst", {}) or {}
    llm_sig = item.get("llm_signals", {}) or {}
    
    return {
        "ticker": item["ticker"],
        "sector": item.get("sector", "Unknown"),
        "price": tech.get("price"),
        "pct_from_52w_low": tech.get("pct_from_52w_low"),
        "pct_from_52w_high": tech.get("pct_from_52w_high"),
        "rsi_14": tech.get("rsi_14"),
        "macd": tech.get("macd_signal"),
        "revenue_yoy": fund.get("revenue_yoy"),
        "revenue_qoq": fund.get("revenue_qoq"),
        "eps_surprise_pct": fund.get("eps_surprise_pct"),
        "eps_yoy": fund.get("eps_yoy"),
        "next_earnings_date": fund.get("next_earnings_date"),
        "gross_margin": fund.get("gross_margin"),
        "news_sentiment_score": sent.get("news_sentiment_score"),
        "news_mentions_7d": sent.get("news_mentions_7d"),
        "x_bullish_pct": sent.get("x_bullish_pct"),
        "reddit_bullish_ratio": sent.get("reddit_bullish_ratio"),
        "recent_headlines": item.get("news_headlines", []),
        "llm_signals": llm_sig,
        "analyst_strong_buy": an.get("strong_buy"),
        "analyst_buy": an.get("buy"),
        "analyst_hold": an.get("hold"),
        "analyst_sell": an.get("sell"),
        "analyst_avg_target": an.get("avg_target"),
        "analyst_high_target": an.get("high_target"),
        "analyst_low_target": an.get("low_target"),
        "upside_to_target_pct": an.get("upside_to_target_pct"),
    }


def judge_all(analyst_scored: list, limit: int = 50) -> list:
    """
    상위 `limit` 종목만 LLM 토론 (비용 고려).
    각 종목에 Bull/Bear/Risk/PM 토론 결과 첨부.
    """
    debate = MultiAgentDebate()
    judged = []
    
    to_judge = analyst_scored[:limit]
    print(f"[judge] Running debate for top {len(to_judge)} tickers")
    
    for i, item in enumerate(to_judge):
        print(f"  [{i+1}/{len(to_judge)}] {item['ticker']}...")
        try:
            ctx = build_context(item)
            result = debate.debate(item["ticker"], ctx)
            item["debate"] = result
            judged.append(item)
        except Exception as e:
            print(f"    failed: {e}")
            item["debate"] = {"error": str(e)}
            judged.append(item)
    
    # PM conviction score로 최종 정렬
    def pm_score(x):
        pm = (x.get("debate") or {}).get("pm") or {}
        return pm.get("conviction_score", 0) if isinstance(pm.get("conviction_score"), (int, float)) else 0
    
    judged.sort(key=pm_score, reverse=True)
    return judged


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    an_path = out_dir / f"analyst_scored_{date}.json"
    if not an_path.exists():
        print(f"Run 05_analyst_consensus.py first.")
        sys.exit(1)
    
    with open(an_path) as f:
        data = json.load(f)
    
    judged = judge_all(data["tickers"], limit=50)
    
    out_path = out_dir / f"judged_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(judged), "tickers": judged}, f, indent=2)
    print(f"Saved → {out_path}")
