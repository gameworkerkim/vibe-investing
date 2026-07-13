"""
dashboard/app.py — 로컬 전용 자격증명 설정 웹 대시보드

TOSS/DART/DeepSeek/News/MySQL 자격증명을 웹 폼으로 입력해 .env에 저장한다.
scripts/setup_credentials.py(터미널)와 scripts/env_store.py 로직을 공유한다.

접속: http://127.0.0.1:8765/admin/setup/<ADMIN_SETUP_KEY>
  - URL 경로의 값이 .env에 저장된 ADMIN_SETUP_KEY와 정확히 일치해야만 접근 가능.
  - 키가 아직 없으면 최초 실행 시 무작위로 생성해 .env에 저장하고, 접속 URL을
    터미널에 출력한다.
  - 127.0.0.1에만 바인딩 — 외부(LAN/인터넷)에서는 접근할 수 없다.
  - 이 스크립트 자체(app.py)에는 실제 키 값을 절대 하드코딩하지 않는다 —
    .env(로컬, git 추적 제외)에서만 읽는다.

주의: URL에 '#' 문자를 쓰면 브라우저가 그 뒤를 서버로 보내지 않는다(fragment
디코더가 클라이언트에서 잘라냄). '#'이 포함된 키로 접속하려면 반드시 %23으로
퍼센트 인코딩해야 한다 — 아래 실행 시 출력되는 URL은 이미 인코딩되어 있다.
"""

import datetime as dt
import os
import secrets
import sys
from pathlib import Path
from typing import Dict
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, Response, abort, render_template, request

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env")

from scripts.env_store import ADMIN_KEY_FIELD, ENV_PATH, FIELDS, load_existing_env, mask, write_env  # noqa: E402
from clients import toss_client, dart_client, deepseek_client, yahoo_client  # noqa: E402
from db import db as dbmod  # noqa: E402
from engine import persona_prompt, ticker_resolver  # noqa: E402
from engine.pipeline import analyze_ticker, classify_market  # noqa: E402

# 검색 결과 캐시: 다운로드 시 LLM/API를 재호출하지 않기 위해 마지막 분석 결과를 보관.
# 단일 사용자 로컬 도구이므로 프로세스 메모리 캐시로 충분하다.
_LAST_RESULTS: Dict[str, Dict] = {}

app = Flask(__name__)

HOST = "127.0.0.1"
PORT = int(os.getenv("DASHBOARD_PORT", "8765"))


def _get_or_create_admin_key() -> str:
    existing = load_existing_env(ENV_PATH)
    key = existing.get(ADMIN_KEY_FIELD) or os.getenv(ADMIN_KEY_FIELD)
    if key:
        return key
    key = secrets.token_urlsafe(24)
    values = {f.key: existing.get(f.key, f.default) for f in FIELDS}
    values[ADMIN_KEY_FIELD] = key
    write_env(values, ENV_PATH)
    print(f"[dashboard] ADMIN_SETUP_KEY가 없어 새로 생성해 .env에 저장했습니다.")
    return key


ADMIN_KEY = _get_or_create_admin_key()
# 템플릿의 링크(href)에 넣을 퍼센트 인코딩된 키. secret에 '#'/'&'/'%' 같은 URL
# 예약 문자가 섞이면 브라우저가 fragment/쿼리 구분자로 오해해 링크가 깨지므로,
# 페이지 내 모든 링크는 반드시 이 인코딩된 값을 사용한다.
ADMIN_KEY_URL = quote(ADMIN_KEY, safe="")


def _connection_status() -> list:
    """각 연동의 현재 설정 상태. MySQL만 실제 ping, 나머지는 키 존재 여부만 확인
    (외부 API를 페이지 로드마다 호출하지 않기 위함)."""
    status = [
        {
            "name": "TOSS Open API",
            "ok": not toss_client.is_mock(),
            "detail": "실키 설정됨" if not toss_client.is_mock() else "키 없음 — MOCK 가격 데이터 사용",
        },
        {
            "name": "DART Open API",
            "ok": dart_client.is_available(),
            "detail": "실키 설정됨" if dart_client.is_available() else "키 없음 — 국내 재무데이터 조회 불가",
        },
        {
            "name": "DeepSeek LLM",
            "ok": deepseek_client.is_available(),
            "detail": "실키 설정됨" if deepseek_client.is_available() else "키 없음 — 정량 템플릿 코멘트로 대체",
        },
        {
            "name": "NewsAPI",
            "ok": bool(os.getenv("NEWSAPI_KEY")),
            "detail": "실키 설정됨" if os.getenv("NEWSAPI_KEY") else "키 없음 — Google News RSS로 대체",
        },
    ]

    conn = dbmod.get_connection()
    status.append({
        "name": "MySQL",
        "ok": conn is not None,
        "detail": "연결 성공" if conn is not None else "연결 실패 — db/schema.sql 적용 및 서버 실행 여부 확인",
    })
    if conn is not None:
        conn.close()

    return status


@app.route("/admin/setup/<path:secret>", methods=["GET", "POST"])
def setup(secret):
    if not secrets.compare_digest(secret, ADMIN_KEY):
        abort(404)

    saved = False
    if request.method == "POST":
        existing = load_existing_env(ENV_PATH)
        values = {}
        for f in FIELDS:
            submitted = request.form.get(f.key, "").strip()
            values[f.key] = submitted if submitted else existing.get(f.key, f.default)
        write_env(values, ENV_PATH)
        load_dotenv(ENV_PATH, override=True)
        saved = True

    existing = load_existing_env(ENV_PATH)
    groups = {}
    for f in FIELDS:
        groups.setdefault(f.group, []).append({
            "key": f.key,
            "label": f.label,
            "is_secret": f.is_secret,
            "current_display": mask(existing.get(f.key, "")) if f.is_secret else (existing.get(f.key) or f.default),
            "placeholder": f.default,
        })

    return render_template(
        "setup.html",
        groups=groups,
        saved=saved,
        status=_connection_status(),
        secret=ADMIN_KEY_URL,
    )


@app.route("/admin/analyze/", methods=["GET"])
def analyze():
    query = request.args.get("q", "").strip()
    picked_ticker = request.args.get("ticker", "").strip()
    picked_market = request.args.get("market", "").strip()
    is_special = request.args.get("special") == "1"

    candidates = []
    result = None
    error = None

    def run_analysis(ticker: str, market: str):
        nonlocal result, error
        try:
            risk_free_rate = yahoo_client.get_risk_free_rate() or 0.045
            metrics, score, commentary, _news_items, company_name = analyze_ticker(
                ticker, is_special, risk_free_rate, use_llm=True)
            entry = {
                "metrics": metrics, "score": score, "commentary": commentary,
                "company_name": company_name, "run_date": dt.date.today().isoformat(),
            }
            _LAST_RESULTS[ticker] = entry
            result = entry
        except Exception as e:
            error = f"{ticker} 분석 중 오류가 발생했습니다: {e}"

    if picked_ticker:
        run_analysis(picked_ticker, picked_market or classify_market(picked_ticker))
    elif query:
        candidates = ticker_resolver.resolve(query)
        exact = [c for c in candidates if c["ticker"].upper() == query.upper()]
        if len(candidates) == 1 or len(exact) == 1:
            picked = exact[0] if exact else candidates[0]
            run_analysis(picked["ticker"], picked["market"])
            candidates = []
        elif not candidates:
            error = f"'{query}'에 대한 검색 결과가 없습니다. 티커나 정확한 종목명으로 다시 시도하세요."

    return render_template(
        "analyze.html",
        query=query, candidates=candidates, result=result, error=error,
        is_special=is_special, setup_secret=ADMIN_KEY_URL,
    )


@app.route("/admin/analyze/download/<ticker>.<fmt>")
def download(ticker, fmt):
    if fmt not in ("md", "html"):
        abort(404)

    cached = _LAST_RESULTS.get(ticker)
    if not cached:
        abort(404, description="캐시된 분석 결과가 없습니다. 먼저 검색을 다시 실행하세요.")

    m, s, commentary = cached["metrics"], cached["score"], cached["commentary"]
    if fmt == "md":
        content = persona_prompt.render_report_block(m, s, commentary)
        mimetype = "text/markdown"
    else:
        content = persona_prompt.render_report_html(m, s, commentary, cached["company_name"])
        mimetype = "text/html"

    filename = f"ackman_{ticker}_{cached['run_date']}.{fmt}"
    return Response(content, mimetype=mimetype,
                     headers={"Content-Disposition": f"attachment; filename={filename}"})


@app.route("/")
def index():
    abort(404)


if __name__ == "__main__":
    print("=" * 70)
    print("Ackman Quant Engine — 대시보드")
    print("=" * 70)
    print("자격증명 설정 (비밀 키 필요):\n")
    print(f"  http://{HOST}:{PORT}/admin/setup/{ADMIN_KEY_URL}\n")
    print("종목 검색·분석 (키 불필요, 127.0.0.1 로컬 전용):\n")
    print(f"  http://{HOST}:{PORT}/admin/analyze/\n")
    print("설정 페이지는 .env의 ADMIN_SETUP_KEY 값과 URL이 정확히 일치해야만 열립니다.")
    print("분석 페이지는 키 없이 열리지만, 127.0.0.1에만 바인딩되어 있어 외부(LAN/인터넷)")
    print("에서는 접근할 수 없고, 같은 PC의 다른 사용자/프로세스는 접근할 수 있습니다.")
    print("=" * 70)
    app.run(host=HOST, port=PORT, debug=False)
