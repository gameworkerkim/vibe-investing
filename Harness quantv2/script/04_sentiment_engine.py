"""
04_sentiment_engine.py — LLM 기반 심리 분석 엔진

각 종목에 대해:
  1. 최근 7일 X 멘션·톤
  2. 뉴스 헤드라인 + sentiment
  3. Reddit (r/wallstreetbets, r/stocks) 언급·톤
  4. 특이 이벤트 (guidance 상향, 경영진 교체, 소송, 인수 등)

Claude Haiku로 빠른 sentiment 분류 → Opus로 종합 판단.

Nvidia-forecast 스타일: 매수 심리, 매도 심리, 기대 catalyst를 모두 표시.

출력: outputs/sentiment_scored_{YYYY-MM-DD}.json
"""

import os
import json
import datetime as dt
from pathlib import Path
from dataclasses import asdict
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.data import get_sentiment_snapshot, get_news_sentiment

try:
    import anthropic
    client = anthropic.Anthropic() if os.getenv("ANTHROPIC_API_KEY") else None
except ImportError:
    client = None


QUICK_MODEL = "claude-haiku-4-5-20251001"
DEEP_MODEL = "claude-opus-4-7"


def analyze_headlines_with_llm(ticker: str, headlines: list) -> dict:
    """
    뉴스 헤드라인을 Claude Haiku에 보내 5가지 신호 추출:
      - 어닝 관련 (beat/miss/upcoming)
      - guidance 관련 (raised/lowered)
      - 분석가 action (upgrade/downgrade/target raise)
      - 규제/소송 (headwind)
      - 제품·파트너십 (tailwind)
    """
    if not client or not headlines:
        return {"signals": [], "summary": "No LLM or headlines"}
    
    prompt = f"""Analyze these news headlines for {ticker} from the past 7 days.
Extract 5 signal categories as JSON:

Headlines:
{chr(10).join(f"- {h}" for h in headlines[:20])}

Output strict JSON:
{{
  "earnings_signal": "beat" | "miss" | "upcoming" | "neutral",
  "guidance_signal": "raised" | "lowered" | "maintained" | "none",
  "analyst_action": "upgrade" | "downgrade" | "target_raise" | "target_cut" | "none",
  "regulatory_risk": "high" | "medium" | "low" | "none",
  "product_catalyst": "strong" | "moderate" | "weak" | "none",
  "expected_volatility": "high" | "medium" | "low",
  "one_line_summary": "..."
}}"""
    
    try:
        resp = client.messages.create(
            model=QUICK_MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(b.text for b in resp.content if hasattr(b, "text"))
        
        import re
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            return json.loads(m.group(0))
    except Exception as e:
        print(f"[llm] {ticker} failed: {e}")
    
    return {"signals": [], "summary": "LLM parse failed"}


def score_sentiment(technical_passed: list) -> list:
    """각 종목에 sentiment 레이어 추가."""
    scored = []
    for i, item in enumerate(technical_passed):
        ticker = item["ticker"]
        if i % 10 == 0:
            print(f"  ...sentiment {i}/{len(technical_passed)}")
        
        sent = get_sentiment_snapshot(ticker)
        news = get_news_sentiment(ticker, days=7)
        headlines = news.get("headlines", [])
        
        llm_signals = analyze_headlines_with_llm(ticker, headlines)
        
        combined = {
            **item,
            "sentiment": asdict(sent),
            "news_headlines": headlines[:5],
            "llm_signals": llm_signals,
        }
        scored.append(combined)
    
    return scored


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    tech_path = out_dir / f"technical_passed_{date}.json"
    if not tech_path.exists():
        print(f"Run 03_technical_filter.py first.")
        sys.exit(1)
    
    with open(tech_path) as f:
        data = json.load(f)
    
    print(f"[sentiment] Analyzing {data['count']} tickers")
    scored = score_sentiment(data["tickers"])
    
    out_path = out_dir / f"sentiment_scored_{date}.json"
    with open(out_path, "w") as f:
        json.dump({"date": date, "count": len(scored), "tickers": scored}, f, indent=2)
    print(f"Saved → {out_path}")
