"""
common/tools.py — LLM tool_use 스펙 + dispatcher

이 파일은 common/data.py의 함수들을 LLM이 호출할 수 있는 tool로 래핑한다.
Anthropic tool_use 스키마 형식을 따른다.
"""

from typing import Dict, Any, List
from dataclasses import asdict

from common.data import (
    get_price_snapshot,
    get_fundamental_snapshot,
    get_sentiment_snapshot,
    get_analyst_snapshot,
    get_news_sentiment,
)


# ============================================================================
# Tool 스펙 (LLM에 전달)
# ============================================================================
TOOLS: List[Dict[str, Any]] = [
    {
        "name": "get_price_snapshot",
        "description": "Get current price, 52-week low/high distance, MA50/MA200 position, "
                       "RSI, MACD for a ticker. Use this to check technical setup.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker, e.g. 'NVDA'"}
            },
            "required": ["ticker"],
        },
    },
    {
        "name": "get_fundamental_snapshot",
        "description": "Get latest quarterly revenue growth (YoY, QoQ), EPS surprise vs consensus, "
                       "next earnings date, gross/FCF margins. Use this to check if earnings momentum exists.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker"}
            },
            "required": ["ticker"],
        },
    },
    {
        "name": "get_sentiment_snapshot",
        "description": "Get social and news sentiment: X mentions/bullish %, Reddit mention count and "
                       "bullish/bearish ratio, news sentiment score. Use to gauge crowd psychology.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker"}
            },
            "required": ["ticker"],
        },
    },
    {
        "name": "get_analyst_snapshot",
        "description": "Get analyst consensus: strong buy / buy / hold / sell / strong sell counts, "
                       "average/median/high/low 12-month price targets. Use for sell-side consensus check.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker"}
            },
            "required": ["ticker"],
        },
    },
    {
        "name": "get_news_headlines",
        "description": "Get latest news headlines for a ticker from past 7 days with basic sentiment score.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string", "description": "Stock ticker"},
                "days": {"type": "integer", "description": "Lookback days (default 7)", "default": 7},
            },
            "required": ["ticker"],
        },
    },
]


# ============================================================================
# Dispatcher — LLM이 tool을 호출하면 여기서 실제 함수 실행
# ============================================================================
def dispatch(tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
    """LLM의 tool_use 요청을 실제 함수 호출로 변환."""
    ticker = tool_input.get("ticker", "").upper()
    
    if tool_name == "get_price_snapshot":
        result = get_price_snapshot(ticker)
        return asdict(result) if result else {"error": f"No data for {ticker}"}
    
    if tool_name == "get_fundamental_snapshot":
        result = get_fundamental_snapshot(ticker)
        return asdict(result) if result else {"error": f"No data for {ticker}"}
    
    if tool_name == "get_sentiment_snapshot":
        result = get_sentiment_snapshot(ticker)
        return asdict(result) if result else {"error": f"No data for {ticker}"}
    
    if tool_name == "get_analyst_snapshot":
        result = get_analyst_snapshot(ticker)
        return asdict(result) if result else {"error": f"No data for {ticker}"}
    
    if tool_name == "get_news_headlines":
        days = tool_input.get("days", 7)
        return get_news_sentiment(ticker, days=days)
    
    return {"error": f"Unknown tool: {tool_name}"}
