"""
Broker abstraction layer
========================
Phase 1 — CLIBroker: prints rebalance instructions to stdout
Phase 2 — KISBroker: 한국투자증권 (Korea Investment & Securities) Open API placeholder

The strategy code in amqs_m7.py calls broker.rebalance(target_weights). Every
real-world concern (auth, account, FX, market hours) is encapsulated here, so
upgrading from Phase 1 to Phase 2 changes ZERO lines in strategy.py / amqs_m7.py.
"""

from __future__ import annotations

import abc
import datetime as dt
import os
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class Order:
    ticker: str
    side: str             # BUY | SELL
    target_weight: float
    delta_weight: float
    notes: str = ""


class Broker(abc.ABC):
    @abc.abstractmethod
    def get_positions(self) -> Dict[str, float]: ...

    @abc.abstractmethod
    def rebalance(self, target: Dict[str, float],
                  as_of: Optional[dt.datetime] = None) -> List[Order]: ...


# ---------------------------------------------------------------------------
# Phase 1
# ---------------------------------------------------------------------------

class CLIBroker(Broker):
    """Prints rebalance instructions; simulates state in memory."""

    def __init__(self, paper: bool = True):
        self.paper = paper
        self._positions: Dict[str, float] = {}

    def get_positions(self) -> Dict[str, float]:
        return dict(self._positions)

    def rebalance(self, target: Dict[str, float],
                  as_of: Optional[dt.datetime] = None) -> List[Order]:
        as_of = as_of or dt.datetime.now()
        cur = self.get_positions()
        all_t = set(cur) | set(target)
        orders: List[Order] = []
        for t in sorted(all_t):
            c, g = cur.get(t, 0.0), target.get(t, 0.0)
            d = g - c
            if abs(d) < 0.005:
                continue
            orders.append(Order(
                ticker=t, side="BUY" if d > 0 else "SELL",
                target_weight=g, delta_weight=d,
                notes=f"{d:+.1%}",
            ))

        if orders:
            tag_paper = " (paper)" if self.paper else " (LIVE)"
            print(f"  리밸런싱 지시{tag_paper}:")
            for o in orders:
                sigil = "[BUY ]" if o.side == "BUY" else "[SELL]"
                print(f"     {sigil}  {o.ticker:<6} -> 목표 {o.target_weight:>6.1%}  ({o.notes})")
        else:
            print("  리밸런싱 불필요 (드리프트 < 0.5%)")

        self._positions = {k: v for k, v in target.items() if v > 0}
        return orders


# ---------------------------------------------------------------------------
# Phase 2: 한국투자증권 Open API
# ---------------------------------------------------------------------------

class KISBroker(Broker):
    """
    한국투자증권 (Korea Investment & Securities) Open API.

    이 클래스는 Phase 2 자리표시입니다. 구현 전 다음 준비물 필요:
      1. https://apiportal.koreainvestment.com 에서 앱키/시크릿 발급
      2. 해외주식 거래 가능 계좌 (CANO, ACNT_PRDT_CD='01')
      3. 환경변수: KIS_APP_KEY, KIS_APP_SECRET, KIS_ACCOUNT_NO, KIS_ACCOUNT_PRODUCT

    핵심 엔드포인트 (해외주식):
      POST /oauth2/tokenP
      GET  /uapi/overseas-stock/v1/trading/inquire-balance
      POST /uapi/overseas-stock/v1/trading/order
      GET  /uapi/overseas-price/v1/quotations/price

    주의:
      * 미국 시장 시간 (한국시간 23:30~06:00 ET 표준시 / 22:30~05:00 서머타임)
      * 환전 우선 처리 필요 (KRW → USD)
      * 모의투자 도메인은 :29443 / 실전은 :9443
    """

    BASE_REAL = "https://openapi.koreainvestment.com:9443"
    BASE_VTS  = "https://openapivts.koreainvestment.com:29443"

    def __init__(self, paper: bool = True):
        self.paper = paper
        self.base_url = self.BASE_VTS if paper else self.BASE_REAL
        self.app_key = os.environ.get("KIS_APP_KEY", "")
        self.app_secret = os.environ.get("KIS_APP_SECRET", "")
        self.account_no = os.environ.get("KIS_ACCOUNT_NO", "")
        self.account_product = os.environ.get("KIS_ACCOUNT_PRODUCT", "01")
        self._token: Optional[str] = None
        self._token_expires: Optional[dt.datetime] = None

    def _ensure_token(self) -> str:
        # TODO: POST /oauth2/tokenP {grant_type, appkey, appsecret}
        #       응답: access_token (24h 유효), expires_in
        raise NotImplementedError(
            "KIS 토큰 발급 미구현. _ensure_token() 에 requests.post(...) 구현 필요."
        )

    def get_positions(self) -> Dict[str, float]:
        # TODO: GET /uapi/overseas-stock/v1/trading/inquire-balance
        #       헤더: authorization, appkey, appsecret, tr_id (TTTS3012R 등)
        #       응답: output1 (보유종목), output2 (외화잔고)
        #       비중 = ovrs_cblc_amt / 전체 외화평가금액
        raise NotImplementedError("KIS 잔고 조회 미구현")

    def rebalance(self, target: Dict[str, float],
                  as_of: Optional[dt.datetime] = None) -> List[Order]:
        # TODO 구현 순서:
        #   1) self._ensure_token()
        #   2) current = self.get_positions()
        #   3) AUM 산출 → 종목별 목표 수량 (현재가 조회로 USD 환산)
        #   4) 차이만큼 매수/매도 주문 (POST .../order, tr_id JTTT1002U=매수/JTTT1006U=매도)
        #   5) 환율 처리 (KRW → USD 사전 환전)
        #   6) 미국 시장시간 가드 (개장 30분 전후 회피)
        raise NotImplementedError("KIS 리밸런싱 미구현 — Phase 2에서 구현")


class DryRunBroker(CLIBroker):
    """CLI와 동일, 'DRY RUN' 라벨 명시."""
    def rebalance(self, target, as_of=None):
        print("  [DRY RUN] 실제 주문 없음")
        return super().rebalance(target, as_of)


def build_broker(name: str, paper: bool = True) -> Broker:
    n = name.lower()
    if n == "cli":    return CLIBroker(paper=paper)
    if n == "kis":    return KISBroker(paper=paper)
    if n == "dryrun": return DryRunBroker(paper=paper)
    raise ValueError(f"알 수 없는 broker: {name}")
