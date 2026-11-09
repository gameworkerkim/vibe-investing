#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hedge.py — 프롬프트 D 4) 테일 헤지 (SMH/SOXX 3개월 풋 스프레드)
=============================================================
- 행사가 -10% 매수 / -20% 매도, 월별 롤
- 연간 프리미엄 ≤ NAV 1.5% 예산, 드로다운 -10% 시 명목 ×2(예산 내)
- Black-Scholes 평가, 매수·매도 스프레드 절반 비용
"""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

import config as C


def _phi(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def bs_put(spot: float, strike: float, t_years: float, r: float, iv: float) -> float:
    if t_years <= 0 or iv <= 0:
        return max(strike - spot, 0.0)
    d1 = (math.log(spot / strike) + (r + 0.5 * iv * iv) * t_years) / (iv * math.sqrt(t_years))
    d2 = d1 - iv * math.sqrt(t_years)
    return strike * math.exp(-r * t_years) * _phi(-d2) - spot * _phi(-d1)


def put_spread_price(spot: float, iv: float, t_years: float,
                     r: float = C.H_RF) -> tuple[float, float]:
    """(프리미엄, 노셔널 대비 페이오프 비율). k1=-10%, k2=-20%."""
    k1, k2 = spot * C.H_STRIKE_BUY, spot * C.H_STRIKE_SELL
    prem = bs_put(spot, k1, t_years, r, iv) - bs_put(spot, k2, t_years, r, iv)
    payoff = (np.clip(k1 - spot, 0, None) - np.clip(k2 - spot, 0, None)) / spot
    return prem / spot, payoff


class TailHedge:
    """월별 3M 풋 스프레드 롤 + 예산 관리. NAV 기반으로 동작."""

    def __init__(self, budget: float = C.H_BUDGET, dd_trigger: float = C.H_DD_TRIGGER):
        self.budget = budget
        self.dd_trigger = dd_trigger
        self.notional = 1.0          # NAV 대비 명목 배수
        self.prem_paid_ytd = 0.0     # 연간 프리미엄 누적(NAV 비율)
        self.spread = None           # {"strike_ratio": (k1,k2)/spot, "T0":, "iv0":}
        self.roll_date = None
        self.annual_prem = 0.0

    def roll(self, t: pd.Timestamp, spot: float, iv: float, nav: float,
             dd: float) -> float:
        """월말 롤. 반환값은 NAV에서 차감할 거래 비용(스프레드 절반).
        프리미엄 자체는 보유 스프레드의 mark-to-market으로 매일 반영된다(이중 차감 금지).
        명목은 '연간 프리미엄 = 예산'이 되도록 배분(월 분할), 드로다운 -10% 시 ×2.
        """
        t_years = C.H_TENOR_M / 12.0
        prem, _ = put_spread_price(spot, iv, t_years)
        notional = self.budget / (12.0 * prem) if prem > 0 else 0.0
        if dd <= self.dd_trigger:
            notional *= 2.0                        # 드로다운 -10% -> 명목 ×2
        room = self.budget - self.prem_paid_ytd
        if prem * notional > room:                 # 예산 상한(연 1.5% NAV)
            notional = max(room / prem, 0.0)
        fee = prem * notional * C.H_SPREAD_COST / 100.0
        self.spread = {"spot0": spot, "k1": spot * C.H_STRIKE_BUY,
                       "k2": spot * C.H_STRIKE_SELL, "T_years": t_years,
                       "iv0": iv, "notional": notional}
        self.roll_date = t
        self.prem_paid_ytd += prem * notional
        self.annual_prem += prem * notional
        return fee

    def mark(self, t: pd.Timestamp, spot: float, iv: float) -> float:
        """일별 평가손익(NAV 비율)."""
        if self.spread is None:
            return 0.0
        days_left = max((self.spread["T_years"] * 365
                         - (t - self.roll_date).days) / 365.0, 0.0)
        p0, _ = put_spread_price(self.spread["spot0"], self.spread["iv0"],
                                 self.spread["T_years"])
        p1, _ = put_spread_price(spot, iv, days_left)
        return (p1 - p0) * self.spread["notional"]

    def yearly_reset(self):
        self.prem_paid_ytd = 0.0
