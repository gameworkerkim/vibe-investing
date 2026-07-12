"""
clients/dart_client.py — DART(전자공시시스템) Open API 클라이언트

  - Base URL: https://opendart.fss.or.kr/api
  - 고유번호(corp_code) 조회: GET /corpCode.xml (zip 응답, 로컬 캐시)
  - 단일회사 전체 재무제표: GET /fnlttSinglAcntAll.json

DART_API_KEY가 없으면 국내 종목 재무데이터 조회를 건너뛰고 None을 반환한다
(무료 발급: https://opendart.fss.or.kr).
"""

import io
import os
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from typing import Dict, Optional

import requests

BASE_URL = "https://opendart.fss.or.kr/api"
CACHE_DIR = Path(__file__).resolve().parent.parent / ".cache"
CORP_CODE_CACHE = CACHE_DIR / "dart_corp_codes.xml"

# 사업보고서(연간) 우선, 없으면 최근 분기 순으로 시도
REPORT_CODES_NEWEST_FIRST = [
    ("11011", "사업보고서"),
    ("11014", "3분기보고서"),
    ("11012", "반기보고서"),
    ("11013", "1분기보고서"),
]


def _api_key() -> Optional[str]:
    return os.getenv("DART_API_KEY") or None


def is_available() -> bool:
    return _api_key() is not None


def _download_corp_code_map(api_key: str) -> bytes:
    resp = requests.get(f"{BASE_URL}/corpCode.xml", params={"crtfc_key": api_key}, timeout=30)
    resp.raise_for_status()
    return resp.content


def get_corp_code_map(force_refresh: bool = False) -> Dict[str, Dict[str, str]]:
    """stock_code(6자리) -> {corp_code, corp_name} 매핑. 결과를 로컬에 캐싱한다."""
    api_key = _api_key()
    if not api_key:
        return {}

    CACHE_DIR.mkdir(exist_ok=True)
    if force_refresh or not CORP_CODE_CACHE.exists():
        raw_zip = _download_corp_code_map(api_key)
        with zipfile.ZipFile(io.BytesIO(raw_zip)) as zf:
            xml_bytes = zf.read("CORPCODE.xml")
        CORP_CODE_CACHE.write_bytes(xml_bytes)

    root = ET.fromstring(CORP_CODE_CACHE.read_bytes())
    mapping = {}
    for item in root.iter("list"):
        stock_code = (item.findtext("stock_code") or "").strip()
        if not stock_code:
            continue
        mapping[stock_code] = {
            "corp_code": (item.findtext("corp_code") or "").strip(),
            "corp_name": (item.findtext("corp_name") or "").strip(),
        }
    return mapping


def _fetch_statement(api_key: str, corp_code: str, bsns_year: str, reprt_code: str,
                      fs_div: str = "CFS") -> Optional[list]:
    resp = requests.get(
        f"{BASE_URL}/fnlttSinglAcntAll.json",
        params={
            "crtfc_key": api_key,
            "corp_code": corp_code,
            "bsns_year": bsns_year,
            "reprt_code": reprt_code,
            "fs_div": fs_div,
        },
        timeout=15,
    )
    if not resp.ok:
        return None
    payload = resp.json()
    if payload.get("status") != "000":
        return None
    return payload.get("list", [])


def _pick_account(rows: list, account_names: list, sj_div: Optional[str] = None) -> Optional[float]:
    """계정과목명 후보 리스트 중 첫 매치의 당기 금액(thstrm_amount)을 반환."""
    for name in account_names:
        for row in rows:
            if sj_div and row.get("sj_div") != sj_div:
                continue
            if row.get("account_nm", "").strip() == name:
                raw = (row.get("thstrm_amount") or "0").replace(",", "")
                try:
                    return float(raw)
                except ValueError:
                    continue
    return None


def get_fundamental_snapshot(stock_code: str, bsns_year: Optional[str] = None) -> Optional[Dict]:
    """
    국내 종목의 최근 재무제표를 조회해 정량 지표 dict로 반환.
    반환 필드: revenue, operating_income, net_income, total_assets, total_liabilities,
               total_equity, debt_ratio, period, corp_name
    실패 시 None.
    """
    api_key = _api_key()
    if not api_key:
        return None

    import datetime as dt
    year = bsns_year or str(dt.date.today().year - 1)  # 사업보고서는 전년도가 최신 확정치인 경우가 많음

    corp_map = get_corp_code_map()
    info = corp_map.get(stock_code)
    if not info or not info["corp_code"]:
        print(f"[dart] {stock_code}: corp_code를 찾을 수 없음")
        return None

    for reprt_code, _label in REPORT_CODES_NEWEST_FIRST:
        rows = _fetch_statement(api_key, info["corp_code"], year, reprt_code)
        if not rows:
            continue

        revenue = _pick_account(rows, ["매출액", "수익(매출액)", "영업수익"], sj_div="IS")
        operating_income = _pick_account(rows, ["영업이익", "영업이익(손실)"], sj_div="IS")
        net_income = _pick_account(rows, ["당기순이익", "당기순이익(손실)"], sj_div="IS")
        total_assets = _pick_account(rows, ["자산총계"], sj_div="BS")
        total_liabilities = _pick_account(rows, ["부채총계"], sj_div="BS")
        total_equity = _pick_account(rows, ["자본총계"], sj_div="BS")

        if revenue is None and net_income is None:
            continue

        debt_ratio = (total_liabilities / total_equity * 100) if total_liabilities and total_equity else None

        return {
            "ticker": stock_code,
            "corp_name": info["corp_name"],
            "period": f"{year}-{reprt_code}",
            "revenue": revenue,
            "operating_income": operating_income,
            "net_income": net_income,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "total_equity": total_equity,
            "debt_ratio": debt_ratio,
        }

    print(f"[dart] {stock_code}: {year}년 재무제표를 찾지 못함")
    return None
