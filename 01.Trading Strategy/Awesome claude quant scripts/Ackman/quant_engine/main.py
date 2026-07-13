"""
main.py — 빌 애크먼 페르소나 퀀트 엔진 CLI

데이터 흐름:
  TOSS Open API(가격/일봉, KR+US 공용, 키 없으면 MOCK)
  + DART Open API(KR 재무제표) / Yahoo Finance(US 재무 + 밸류에이션 멀티플)
  + 뉴스(NewsAPI 또는 Google News RSS, 촉매 감지)
  → engine.ackman_framework 로 Quality/Valuation/Catalyst/Risk 정량 스코어링
  → engine.persona_prompt 로 DeepSeek 호출해 애크먼 페르소나 정성 코멘트 생성
  → MySQL 저장 + result/ 에 마크다운 리포트 출력

사용:
  python main.py
  python main.py --tickers MSFT,AMZN,UBER,BN,QSR,META,HHH,FNMA,FMCC --special FNMA,FMCC
  python main.py --tickers 005930,000660 --top-n 5
  python main.py --no-db --no-llm      # DB/LLM 없이 정량 점수만 로컬 확인
"""

import argparse
import datetime as dt
from pathlib import Path
from typing import List

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env")

from db import db as dbmod  # noqa: E402
from engine import persona_prompt  # noqa: E402
from engine.ackman_framework import rank_top_picks  # noqa: E402
from engine.pipeline import analyze_ticker  # noqa: E402
from clients import yahoo_client  # noqa: E402

DEFAULT_TICKERS = ["BN", "AMZN", "UBER", "MSFT", "QSR", "META", "HHH", "FNMA", "FMCC"]
DEFAULT_SPECIAL = {"FNMA", "FMCC"}


def run(tickers: List[str], special: set, top_n: int, use_db: bool, use_llm: bool) -> str:
    run_date = dt.date.today().isoformat()
    risk_free_rate = yahoo_client.get_risk_free_rate() or 0.045
    print(f"[main] 10년 국채 수익률: {risk_free_rate:.2%}")

    conn = dbmod.get_connection() if use_db else None

    blocks = []
    results = []
    for ticker in tickers:
        print(f"\n[main] === {ticker} 분석 시작 ===")
        is_special = ticker in special
        metrics, score, commentary, news_items, company_name = analyze_ticker(
            ticker, is_special, risk_free_rate, use_llm=use_llm)

        block = persona_prompt.render_report_block(metrics, score, commentary)
        blocks.append(block)
        results.append(score)
        print(f"[main] {ticker}: 종합 {score.total_score}/100 ({score.grade})")

        if conn is not None:
            dbmod.upsert_ticker(conn, ticker, metrics.market, company_name, is_special_situation=is_special)
            if metrics.price is not None:
                dbmod.save_price_snapshot(conn, ticker, run_date, {
                    "price": metrics.price,
                    "pct_from_52w_low": metrics.pct_from_52w_low,
                    "pct_from_52w_high": metrics.pct_from_52w_high,
                    "above_50ma": metrics.above_50ma,
                    "above_200ma": metrics.above_200ma,
                    "rsi_14": metrics.rsi_14,
                    "avg_volume_30d": None,
                })
            source = "DART" if metrics.market == "KR" else "YAHOO"
            dbmod.save_fundamental_snapshot(conn, ticker, run_date, source, {
                "revenue": metrics.revenue, "operating_income": metrics.operating_income,
                "net_income": metrics.net_income, "fcf": metrics.fcf,
                "debt_ratio": metrics.debt_ratio, "per": metrics.per, "pbr": metrics.pbr,
                "psr": metrics.psr, "ev_ebitda": metrics.ev_ebitda, "fcf_yield": metrics.fcf_yield,
                "roe": metrics.roe, "roic": metrics.roic,
                "revenue_growth_yoy": metrics.revenue_growth_yoy,
                "net_income_growth_yoy": metrics.net_income_growth_yoy,
            })
            dbmod.save_news_items(conn, ticker, news_items)
            dbmod.save_ackman_score(conn, ticker, run_date, {
                "quality_score": score.quality_score, "valuation_score": score.valuation_score,
                "catalyst_score": score.catalyst_score, "risk_score": score.risk_score,
                "total_score": score.total_score, "grade": score.grade,
                "position_weight_pct": score.position_weight_pct,
            })
            dbmod.save_ackman_report(conn, ticker, run_date, block,
                                      model_used="deepseek" if use_llm else "fallback-template")

    top_picks = rank_top_picks(results, top_n)
    top_lines = [f"{i+1}. {r.ticker} — {r.total_score}점 — {r.grade}" for i, r in enumerate(top_picks)]

    report = (
        f"[빌 애크먼의 {run_date} 저평가주 퀀트 리포트]\n\n"
        + "\n".join(blocks)
        + f"\nTop {top_n} Pick (점수순):\n" + "\n".join(top_lines) + "\n"
    )

    if conn is not None:
        conn.close()

    return report


def main():
    parser = argparse.ArgumentParser(description="빌 애크먼 페르소나 퀀트 엔진")
    parser.add_argument("--tickers", default=",".join(DEFAULT_TICKERS),
                         help="쉼표로 구분된 티커 목록 (미국 티커 또는 국내 6자리 코드)")
    parser.add_argument("--special", default=",".join(DEFAULT_SPECIAL),
                         help="특수상황(비대칭 베팅) 종목으로 취급할 티커 목록")
    parser.add_argument("--top-n", type=int, default=7)
    parser.add_argument("--no-db", action="store_true", help="MySQL 저장 건너뛰기")
    parser.add_argument("--no-llm", action="store_true", help="DeepSeek 호출 건너뛰고 정량 점수만 출력")
    args = parser.parse_args()

    tickers = [t.strip() for t in args.tickers.split(",") if t.strip()]
    special = {t.strip() for t in args.special.split(",") if t.strip()}

    report = run(tickers, special, args.top_n, use_db=not args.no_db, use_llm=not args.no_llm)

    print("\n" + "=" * 70)
    print(report)

    out_path = PROJECT_ROOT / "result" / f"ackman_report_{dt.date.today().isoformat()}.md"
    out_path.write_text(report, encoding="utf-8")
    print(f"[main] 리포트 저장 완료: {out_path}")


if __name__ == "__main__":
    main()
