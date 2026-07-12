"""
db/db.py — MySQL 연결 및 저장 헬퍼

schema.sql 로 생성한 테이블에 대해 ticker/price/fundamental/news/score/report를
upsert한다. MySQL에 연결할 수 없으면(로컬에 아직 DB를 안 띄운 경우 등)
경고만 출력하고 None을 반환해, 파이프라인이 DB 없이도 계속 동작하게 한다.
"""

import os
from typing import Optional, Iterable, Dict, Any

try:
    import pymysql
    from pymysql.cursors import DictCursor
except ImportError:
    pymysql = None


def get_connection():
    if pymysql is None:
        print("[db] PyMySQL 미설치 — pip install PyMySQL 필요. DB 저장을 건너뜁니다.")
        return None
    try:
        return pymysql.connect(
            host=os.getenv("MYSQL_HOST", "127.0.0.1"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "ackman_quant"),
            charset="utf8mb4",
            cursorclass=DictCursor,
            autocommit=True,
        )
    except Exception as e:
        print(f"[db] MySQL 연결 실패 — DB 저장 없이 계속 진행합니다: {e}")
        return None


def upsert_ticker(conn, ticker: str, market: str, name: str = "", sector: str = "",
                   is_special_situation: bool = False) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO tickers (ticker, market, name, sector, is_special_situation)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          market = VALUES(market), name = VALUES(name), sector = VALUES(sector),
          is_special_situation = VALUES(is_special_situation)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (ticker, market, name, sector, int(is_special_situation)))


def save_price_snapshot(conn, ticker: str, as_of_date: str, data: Dict[str, Any]) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO price_snapshots
          (ticker, as_of_date, price, pct_from_52w_low, pct_from_52w_high,
           above_50ma, above_200ma, rsi_14, avg_volume_30d)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          price=VALUES(price), pct_from_52w_low=VALUES(pct_from_52w_low),
          pct_from_52w_high=VALUES(pct_from_52w_high), above_50ma=VALUES(above_50ma),
          above_200ma=VALUES(above_200ma), rsi_14=VALUES(rsi_14),
          avg_volume_30d=VALUES(avg_volume_30d)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (
            ticker, as_of_date, data.get("price"), data.get("pct_from_52w_low"),
            data.get("pct_from_52w_high"), int(bool(data.get("above_50ma"))),
            int(bool(data.get("above_200ma"))), data.get("rsi_14"), data.get("avg_volume_30d"),
        ))


def save_fundamental_snapshot(conn, ticker: str, period: str, source: str,
                               data: Dict[str, Any]) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO fundamental_snapshots
          (ticker, period, source, revenue, operating_income, net_income, fcf,
           debt_ratio, per, pbr, psr, ev_ebitda, fcf_yield, roe, roic,
           revenue_growth_yoy, net_income_growth_yoy)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
          revenue=VALUES(revenue), operating_income=VALUES(operating_income),
          net_income=VALUES(net_income), fcf=VALUES(fcf), debt_ratio=VALUES(debt_ratio),
          per=VALUES(per), pbr=VALUES(pbr), psr=VALUES(psr), ev_ebitda=VALUES(ev_ebitda),
          fcf_yield=VALUES(fcf_yield), roe=VALUES(roe), roic=VALUES(roic),
          revenue_growth_yoy=VALUES(revenue_growth_yoy),
          net_income_growth_yoy=VALUES(net_income_growth_yoy)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (
            ticker, period, source, data.get("revenue"), data.get("operating_income"),
            data.get("net_income"), data.get("fcf"), data.get("debt_ratio"),
            data.get("per"), data.get("pbr"), data.get("psr"), data.get("ev_ebitda"),
            data.get("fcf_yield"), data.get("roe"), data.get("roic"),
            data.get("revenue_growth_yoy"), data.get("net_income_growth_yoy"),
        ))


def save_news_items(conn, ticker: str, items: Iterable[Dict[str, Any]]) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO news_items (ticker, published_at, title, url, source, sentiment_score)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    with conn.cursor() as cur:
        for it in items:
            cur.execute(sql, (
                ticker, it.get("published_at"), it.get("title", "")[:500],
                it.get("url"), it.get("source"), it.get("sentiment_score"),
            ))


def save_ackman_score(conn, ticker: str, run_date: str, scores: Dict[str, Any]) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO ackman_scores
          (ticker, run_date, quality_score, valuation_score, catalyst_score,
           risk_score, total_score, grade, position_weight_pct)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
          quality_score=VALUES(quality_score), valuation_score=VALUES(valuation_score),
          catalyst_score=VALUES(catalyst_score), risk_score=VALUES(risk_score),
          total_score=VALUES(total_score), grade=VALUES(grade),
          position_weight_pct=VALUES(position_weight_pct)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (
            ticker, run_date, scores["quality_score"], scores["valuation_score"],
            scores["catalyst_score"], scores["risk_score"], scores["total_score"],
            scores["grade"], scores.get("position_weight_pct"),
        ))


def save_ackman_report(conn, ticker: str, run_date: str, report_text: str,
                        model_used: Optional[str] = None) -> None:
    if conn is None:
        return
    sql = """
        INSERT INTO ackman_reports (ticker, run_date, report_text, model_used)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE report_text=VALUES(report_text), model_used=VALUES(model_used)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (ticker, run_date, report_text, model_used))
