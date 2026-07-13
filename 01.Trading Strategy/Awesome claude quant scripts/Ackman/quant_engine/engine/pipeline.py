"""
engine/pipeline.py — 단일 종목 분석 파이프라인 (CLI와 웹 대시보드 공용)

TOSS(가격) + DART/Yahoo(재무) + 뉴스를 모아 AckmanMetrics를 구성하고,
정량 스코어링과 DeepSeek 코멘트 생성까지 한 번에 수행한다.
main.py(CLI 일괄 실행)와 dashboard/app.py(웹 검색)가 이 모듈을 공유해
동일한 분석 로직을 유지한다.
"""

from typing import List, Optional, Tuple

from clients import toss_client, dart_client, yahoo_client, news_client
from engine import technicals, persona_prompt
from engine.ackman_framework import AckmanMetrics, ScoreResult, score_ticker


def classify_market(ticker: str) -> str:
    return "KR" if ticker.isdigit() and len(ticker) == 6 else "US"


def _kr_multiples_via_yahoo(ticker: str) -> Optional[dict]:
    """DART는 시장 멀티플(PER/PBR 등)을 주지 않으므로, 야후의 .KS/.KQ 티커로 보완 조회."""
    for suffix in (".KS", ".KQ"):
        data = yahoo_client.get_fundamental_snapshot(f"{ticker}{suffix}")
        if data:
            return data
    return None


def gather_metrics(ticker: str, is_special: bool, risk_free_rate: float) -> Tuple[AckmanMetrics, List[dict], str]:
    market = classify_market(ticker)

    candles = toss_client.fetch_candles(ticker, days=260)
    tech = technicals.compute_technicals(candles) or {}

    if market == "KR":
        dart_data = dart_client.get_fundamental_snapshot(ticker) or {}
        yahoo_supplement = _kr_multiples_via_yahoo(ticker) or {}
        company_name = dart_data.get("corp_name", "")
        fundamentals = {
            "revenue": dart_data.get("revenue"),
            "operating_income": dart_data.get("operating_income"),
            "net_income": dart_data.get("net_income"),
            "debt_ratio": dart_data.get("debt_ratio"),
            "fcf": yahoo_supplement.get("fcf"),
            "per": yahoo_supplement.get("per"),
            "forward_per": yahoo_supplement.get("forward_per"),
            "pbr": yahoo_supplement.get("pbr"),
            "psr": yahoo_supplement.get("psr"),
            "ev_ebitda": yahoo_supplement.get("ev_ebitda"),
            "fcf_yield": yahoo_supplement.get("fcf_yield"),
            "roe": yahoo_supplement.get("roe"),
            "roic": yahoo_supplement.get("roic"),
            "revenue_growth_yoy": yahoo_supplement.get("revenue_growth_yoy"),
            "net_income_growth_yoy": yahoo_supplement.get("net_income_growth_yoy"),
        }
    else:
        yahoo_data = yahoo_client.get_fundamental_snapshot(ticker) or {}
        company_name = yahoo_data.get("long_name", "")
        fundamentals = yahoo_data

    news_items = news_client.get_recent_headlines(ticker, company_name=company_name)
    news_summary = news_client.summarize_sentiment(news_items)
    headlines = [it["title"] for it in news_items]

    metrics = AckmanMetrics(
        ticker=ticker,
        market=market,
        is_special_situation=is_special,
        price=tech.get("price"),
        pct_from_52w_high=tech.get("pct_from_52w_high"),
        pct_from_52w_low=tech.get("pct_from_52w_low"),
        above_50ma=tech.get("above_50ma"),
        above_200ma=tech.get("above_200ma"),
        rsi_14=tech.get("rsi_14"),
        revenue=fundamentals.get("revenue"),
        operating_income=fundamentals.get("operating_income"),
        net_income=fundamentals.get("net_income"),
        fcf=fundamentals.get("fcf"),
        debt_ratio=fundamentals.get("debt_ratio"),
        per=fundamentals.get("per"),
        forward_per=fundamentals.get("forward_per"),
        pbr=fundamentals.get("pbr"),
        psr=fundamentals.get("psr"),
        ev_ebitda=fundamentals.get("ev_ebitda"),
        fcf_yield=fundamentals.get("fcf_yield"),
        roe=fundamentals.get("roe"),
        roic=fundamentals.get("roic"),
        revenue_growth_yoy=fundamentals.get("revenue_growth_yoy"),
        net_income_growth_yoy=fundamentals.get("net_income_growth_yoy"),
        risk_free_rate=risk_free_rate,
        news_avg_sentiment=news_summary.get("avg_sentiment", 0.0),
        news_mentions=news_summary.get("mentions", 0),
        news_headlines=headlines,
    )
    return metrics, news_items, company_name


def analyze_ticker(ticker: str, is_special: bool, risk_free_rate: float,
                    use_llm: bool = True) -> Tuple[AckmanMetrics, ScoreResult, str, List[dict], str]:
    """티커 하나를 전체 분석: 데이터 수집 → 정량 스코어링 → 페르소나 코멘트.
    반환: (metrics, score, commentary, news_items, company_name)"""
    metrics, news_items, company_name = gather_metrics(ticker, is_special, risk_free_rate)
    score = score_ticker(metrics)
    commentary = persona_prompt.generate_commentary(metrics, score, use_llm=use_llm)
    return metrics, score, commentary, news_items, company_name
