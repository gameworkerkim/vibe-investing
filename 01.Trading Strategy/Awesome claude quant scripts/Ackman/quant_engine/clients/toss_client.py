"""
clients/toss_client.py — TOSS 증권 Open API 클라이언트

  - Base URL: https://openapi.tossinvest.com
  - 인증: OAuth 2.0 Client Credentials (POST /oauth2/token), 토큰 캐싱
  - 시세: GET /api/v1/prices?symbols=...
  - 일봉: GET /api/v1/candles?symbol=...&interval=1d&count=200 (필요 시 before 페이지네이션)

TOSS_CLIENT_ID / TOSS_CLIENT_SECRET이 없으면 MOCK 모드로 동작한다.
MOCK 모드는 종목코드 기반 결정론적 합성 일봉을 생성하므로, 키 없이도
스코어링 로직을 그대로 로컬에서 시연·검증할 수 있다.
(Toss/src/toss.js 의 Node 구현을 Python으로 이식)
"""

import hashlib
import math
import os
import time
from datetime import date, timedelta
from typing import Dict, List, Optional

import requests

_token_cache = {"token": None, "expires_at": 0.0}


def _base_url() -> str:
    return os.getenv("TOSS_BASE_URL", "https://openapi.tossinvest.com")


def _client_id() -> Optional[str]:
    return os.getenv("TOSS_CLIENT_ID") or None


def _client_secret() -> Optional[str]:
    return os.getenv("TOSS_CLIENT_SECRET") or None


def is_mock() -> bool:
    return not _client_id() or not _client_secret()


def _get_access_token() -> str:
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 30:
        return _token_cache["token"]

    resp = requests.post(
        f"{_base_url()}/oauth2/token",
        data={
            "grant_type": "client_credentials",
            "client_id": _client_id(),
            "client_secret": _client_secret(),
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10,
    )
    if not resp.ok:
        raise RuntimeError(f"Toss OAuth 실패: {resp.status_code} {resp.text}")
    payload = resp.json()
    ttl = payload.get("expires_in", 3600)
    _token_cache["token"] = payload["access_token"]
    _token_cache["expires_at"] = now + ttl
    return _token_cache["token"]


def _authed_get(path: str, params: Dict) -> Dict:
    token = _get_access_token()
    resp = requests.get(
        f"{_base_url()}{path}",
        params=params,
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if not resp.ok:
        raise RuntimeError(f"Toss API {path} 실패: {resp.status_code} {resp.text}")
    return resp.json()


def fetch_prices(codes: List[str]) -> Dict[str, Dict]:
    """여러 종목 현재가 조회. 반환: {code: {price, change, change_rate}}"""
    if is_mock():
        return _mock_prices(codes)

    out: Dict[str, Dict] = {}
    for i in range(0, len(codes), 200):
        chunk = codes[i:i + 200]
        payload = _authed_get("/api/v1/prices", {"symbols": ",".join(chunk)})
        rows = payload.get("prices") or payload.get("data") or []
        for row in rows:
            code = row.get("symbol") or row.get("code")
            out[code] = {
                "price": _num(row.get("price", row.get("close", row.get("last")))),
                "change": _num(row.get("change")),
                "change_rate": _num(row.get("changeRate", row.get("rate"))),
            }
    return out


def fetch_candles(code: str, days: int = 260) -> List[Dict]:
    """일봉 조회. 반환: [{time, close}] (과거 → 현재 정렬)"""
    if is_mock():
        return _mock_candles(code, days)

    collected: List[Dict] = []
    before = None
    while len(collected) < days:
        params = {"symbol": code, "interval": "1d", "count": 200}
        if before:
            params["before"] = before
        payload = _authed_get("/api/v1/candles", params)
        rows = payload.get("candles") or payload.get("data") or []
        if not rows:
            break
        for r in rows:
            collected.append({
                "time": r.get("time", r.get("timestamp", r.get("date"))),
                "close": _num(r.get("close", r.get("c"))),
            })
        before = rows[-1].get("time", rows[-1].get("timestamp"))
        if len(rows) < 200:
            break

    seen = set()
    uniq = []
    for r in collected:
        k = str(r["time"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)
    uniq.sort(key=lambda r: str(r["time"]))
    return uniq[-days:]


def _num(v):
    if v is None:
        return None
    if isinstance(v, str):
        try:
            return float(v.replace(",", ""))
        except ValueError:
            return None
    return float(v)


# ---------------------------------------------------------------------------
# MOCK 모드: 결정론적 합성 데이터 (키 없이 시연/검증용)
# ---------------------------------------------------------------------------

def _hash_seed(s: str) -> int:
    h = hashlib.sha256(s.encode("utf-8")).digest()
    return int.from_bytes(h[:4], "big")


def _rng(seed: int):
    a = seed & 0xFFFFFFFF

    def _next() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t = (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) ^ t
        t &= 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return _next


def _mock_candles(code: str, days: int = 260) -> List[Dict]:
    seed = _hash_seed(code)
    rand = _rng(seed)
    ann_drift = -0.25 + rand() * 0.85
    ann_vol = 0.18 + rand() * 0.57
    daily_drift = ann_drift / 252
    daily_vol = ann_vol / math.sqrt(252)

    price = 1000 + (seed % 400) * 1000
    out = []
    flip_at = 0.55 + rand() * 0.35
    start = date(2026, 6, 5)
    for i in range(days):
        t = i / days
        local_drift = daily_drift * (-1.4 if rand() < 0.5 else 1.2) if t > flip_at else daily_drift
        u1 = max(1e-9, rand())
        u2 = rand()
        zn = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        shock = local_drift + daily_vol * zn
        price = max(50.0, price * (1 + shock))
        d = start - timedelta(days=(days - i))
        out.append({"time": d.isoformat(), "close": round(price)})
    return out


def _mock_prices(codes: List[str]) -> Dict[str, Dict]:
    out = {}
    for code in codes:
        c = _mock_candles(code, 6)
        last, prev = c[-1]["close"], c[-2]["close"]
        out[code] = {
            "price": last,
            "change": last - prev,
            "change_rate": round((last / prev - 1) * 100, 2),
        }
    return out
