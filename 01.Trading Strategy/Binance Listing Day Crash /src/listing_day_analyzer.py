"""
╔══════════════════════════════════════════════════════════════════════╗
║   Binance Listing Day Crash Research Engine                          ║
║   상장 당일 72시간 급성 하락 분석 엔진                                 ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   핵심 가설:                                                         ║
║   H1: 상장 당일 + 72시간 하락률 > BTC 동기간 하락률                   ║
║   H2: Airdrop % 증가 ∝ 하락 규모 증가                                 ║
║   H3: 바이낸스의 대규모 에어드롭이 구조적 매도압을 생성               ║
║                                                                      ║
║   구조 가설:                                                         ║
║   • Launchpool: BNB 7-10일 스테이킹 → 누적 에어드롭 → 상장 시 즉시 매도│
║   • HODLer:    과거 BNB snapshot → 공짜 지급 → 홀딩 인센티브 없음     ║
║   • MegaDrop:  제한된 사례, 분산 구조 — 상대 안전                     ║
║                                                                      ║
║   ⚠️ Disclaimer:                                                     ║
║   연구·교육 목적. 바이낸스의 합법적 에어드롭 프로그램이며            ║
║   특정 주체를 부정적으로 지목하지 않는다. 통계적 패턴 분석이다.       ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import time
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ==========================================================
# 데이터 모델
# ==========================================================

class ListingMechanism(Enum):
    """바이낸스 상장 에어드롭 메커니즘."""
    LAUNCHPOOL = "Launchpool"    # BNB 스테이킹 → 누적 에어드롭 (가장 많음)
    HODLER = "HODLer"            # 과거 BNB snapshot → 공짜 지급
    MEGADROP = "MegaDrop"        # 태스크 완료 + BNB 스테이킹
    LAUNCHPAD = "Launchpad"       # IEO 형식
    LISTING_ONLY = "Listing"      # 에어드롭 없이 상장만


@dataclass
class ListingEvent:
    """단일 상장 이벤트."""
    token_symbol: str
    token_name: str
    listing_date: datetime
    mechanism: ListingMechanism

    # 에어드롭 정보
    airdrop_pct_of_supply: float
    airdrop_value_usd: float

    # 가격 데이터
    initial_listing_price_usd: float
    price_24h_usd: Optional[float] = None
    price_72h_usd: Optional[float] = None
    peak_price_listing_day: Optional[float] = None

    # BTC 기준
    btc_price_at_listing: Optional[float] = None
    btc_price_24h: Optional[float] = None
    btc_price_72h: Optional[float] = None

    # 계산 필드
    change_24h_pct: Optional[float] = None
    change_72h_pct: Optional[float] = None
    btc_change_24h_pct: Optional[float] = None
    btc_change_72h_pct: Optional[float] = None
    relative_vs_btc_24h: Optional[float] = None
    relative_vs_btc_72h: Optional[float] = None
    peak_to_72h_drop_pct: Optional[float] = None

    notes: str = ""

    def compute_metrics(self):
        """모든 메트릭 자동 계산."""
        if self.price_24h_usd and self.initial_listing_price_usd:
            self.change_24h_pct = (
                (self.price_24h_usd - self.initial_listing_price_usd)
                / self.initial_listing_price_usd * 100
            )
        if self.price_72h_usd and self.initial_listing_price_usd:
            self.change_72h_pct = (
                (self.price_72h_usd - self.initial_listing_price_usd)
                / self.initial_listing_price_usd * 100
            )
        if self.btc_price_24h and self.btc_price_at_listing:
            self.btc_change_24h_pct = (
                (self.btc_price_24h - self.btc_price_at_listing)
                / self.btc_price_at_listing * 100
            )
        if self.btc_price_72h and self.btc_price_at_listing:
            self.btc_change_72h_pct = (
                (self.btc_price_72h - self.btc_price_at_listing)
                / self.btc_price_at_listing * 100
            )
        if (self.change_24h_pct is not None
                and self.btc_change_24h_pct is not None):
            self.relative_vs_btc_24h = (
                self.change_24h_pct - self.btc_change_24h_pct
            )
        if (self.change_72h_pct is not None
                and self.btc_change_72h_pct is not None):
            self.relative_vs_btc_72h = (
                self.change_72h_pct - self.btc_change_72h_pct
            )
        if self.peak_price_listing_day and self.price_72h_usd:
            self.peak_to_72h_drop_pct = (
                (self.price_72h_usd - self.peak_price_listing_day)
                / self.peak_price_listing_day * 100
            )


# ==========================================================
# 데이터 수집기
# ==========================================================

class BinanceListingCollector:
    """Binance Launchpool + HODLer + MegaDrop 데이터 수집."""

    BINANCE_API = "https://api.binance.com"
    COINGECKO_API = "https://api.coingecko.com/api/v3"
    BINANCE_ANNOUNCEMENT = "https://www.binance.com/en/support/announcement/c-48"

    def __init__(self, coingecko_key: Optional[str] = None):
        self.coingecko_key = coingecko_key
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "vibe-investing/1.0 (listing-research)"
        })

    # ------------------------------------------------------
    # 1. Binance 상장 일정 수집
    # ------------------------------------------------------
    def fetch_upcoming_listings(self) -> List[Dict]:
        """
        Binance 공지 페이지에서 상장 예정 토큰 수집.

        실제 프로덕션에서는 announcement scraping 또는
        Binance Square API 활용 필요.
        """
        log.info("Fetching upcoming Binance listings...")
        # Placeholder — 실제로는 공지 스크래핑 필요
        # https://www.binance.com/en/support/announcement/c-48
        return []

    def fetch_launchpool_history(self) -> pd.DataFrame:
        """과거 Launchpool 이력."""
        try:
            df = pd.read_csv(
                "01_binance_listing_day_crashes_2024_2025.csv"
            )
            return df[df["mechanism"] == "Launchpool"]
        except FileNotFoundError:
            log.warning("CSV not found")
            return pd.DataFrame()

    # ------------------------------------------------------
    # 2. 가격 데이터 수집
    # ------------------------------------------------------
    def fetch_listing_price_data(self, symbol: str,
                                  listing_date: datetime) -> Dict:
        """상장 당일부터 72h까지 가격 데이터."""
        try:
            # Binance API: 1시간 단위 klines
            symbol_pair = f"{symbol}USDT"
            start_ms = int(listing_date.timestamp() * 1000)
            end_ms = int((listing_date + timedelta(hours=96)).timestamp() * 1000)

            url = f"{self.BINANCE_API}/api/v3/klines"
            r = self.session.get(url, params={
                "symbol": symbol_pair, "interval": "1h",
                "startTime": start_ms, "endTime": end_ms,
                "limit": 96
            }, timeout=30)
            r.raise_for_status()
            klines = r.json()

            if not klines:
                return {}

            # klines 포맷: [open_time, open, high, low, close, volume, ...]
            listing_price = float(klines[0][1])   # open of first candle
            peak_day1 = max(float(k[2]) for k in klines[:24])  # high in 24h

            price_24h = float(klines[23][4]) if len(klines) > 23 else None
            price_72h = float(klines[71][4]) if len(klines) > 71 else None

            return {
                "listing_price": listing_price,
                "peak_day1": peak_day1,
                "price_24h": price_24h,
                "price_72h": price_72h,
            }
        except Exception as e:
            log.warning(f"Price fetch failed for {symbol}: {e}")
            return {}

    def fetch_btc_baseline(self, target: datetime,
                            hours_later: int = 72) -> Tuple[float, float]:
        """BTC 기준 가격 (상장 시점 + 72h 후)."""
        try:
            start_ms = int(target.timestamp() * 1000)
            end_ms = int((target + timedelta(hours=hours_later + 1)).timestamp() * 1000)

            url = f"{self.BINANCE_API}/api/v3/klines"
            r = self.session.get(url, params={
                "symbol": "BTCUSDT", "interval": "1h",
                "startTime": start_ms, "endTime": end_ms,
                "limit": hours_later + 1
            }, timeout=30)
            r.raise_for_status()
            klines = r.json()

            if not klines:
                return (0.0, 0.0)

            btc_start = float(klines[0][1])
            btc_end = float(klines[-1][4])
            return (btc_start, btc_end)
        except Exception:
            return (0.0, 0.0)


# ==========================================================
# 분석 엔진
# ==========================================================

class ListingCrashAnalyzer:
    """상장 당일 크래시 분석."""

    def __init__(self):
        self.events: List[ListingEvent] = []

    def load_events_from_csv(self, csv_path: str):
        """CSV에서 이벤트 로드."""
        df = pd.read_csv(csv_path)
        for _, row in df.iterrows():
            mech_str = row["mechanism"]
            mech = ListingMechanism(mech_str) if mech_str in [
                m.value for m in ListingMechanism
            ] else ListingMechanism.LISTING_ONLY

            event = ListingEvent(
                token_symbol=row["token_symbol"],
                token_name=row["token_name"],
                listing_date=datetime.strptime(
                    row["listing_date"], "%Y-%m-%d"),
                mechanism=mech,
                airdrop_pct_of_supply=float(row["airdrop_pct_of_total_supply"]),
                airdrop_value_usd=float(row["airdrop_value_usd_m"]) * 1e6,
                initial_listing_price_usd=float(row["initial_listing_price_usd"]),
                price_24h_usd=float(row["price_24h_usd"]),
                price_72h_usd=float(row["price_72h_usd"]),
                peak_price_listing_day=float(row["peak_price_listing_day_usd"]),
                change_24h_pct=float(row["change_24h_pct"]),
                change_72h_pct=float(row["change_72h_pct"]),
                btc_change_24h_pct=float(row["btc_change_24h_pct"]),
                btc_change_72h_pct=float(row["btc_change_72h_pct"]),
                relative_vs_btc_24h=float(row["relative_vs_btc_24h_pct"]),
                relative_vs_btc_72h=float(row["relative_vs_btc_72h_pct"]),
                peak_to_72h_drop_pct=float(row["peak_to_72h_drop_pct"]),
                notes=str(row.get("notes", "")),
            )
            self.events.append(event)
        log.info(f"Loaded {len(self.events)} events")

    # ------------------------------------------------------
    # Dennis 가설 검증
    # ------------------------------------------------------
    def verify_hypothesis_H1(self) -> Dict:
        """H1: 상장 당일 + 72시간 하락률이 BTC보다 큰가?"""
        if not self.events:
            return {}

        change_24h = [e.change_24h_pct for e in self.events
                      if e.change_24h_pct is not None]
        change_72h = [e.change_72h_pct for e in self.events
                      if e.change_72h_pct is not None]
        vs_btc_24h = [e.relative_vs_btc_24h for e in self.events
                      if e.relative_vs_btc_24h is not None]
        vs_btc_72h = [e.relative_vs_btc_72h for e in self.events
                      if e.relative_vs_btc_72h is not None]

        return {
            "H1_24h_negative_rate_pct": sum(1 for r in change_24h if r < 0)
                                          / len(change_24h) * 100,
            "H1_72h_negative_rate_pct": sum(1 for r in change_72h if r < 0)
                                          / len(change_72h) * 100,
            "H1_avg_24h_return": np.mean(change_24h),
            "H1_avg_72h_return": np.mean(change_72h),
            "H1_avg_vs_btc_24h": np.mean(vs_btc_24h),
            "H1_avg_vs_btc_72h": np.mean(vs_btc_72h),
            "H1_vs_btc_24h_underperform_rate": sum(1 for r in vs_btc_24h if r < 0)
                                                  / len(vs_btc_24h) * 100,
            "H1_vs_btc_72h_underperform_rate": sum(1 for r in vs_btc_72h if r < 0)
                                                  / len(vs_btc_72h) * 100,
        }

    def verify_hypothesis_H2(self) -> Dict:
        """H2: Airdrop % 증가 ∝ 하락 규모 증가?"""
        data = [(e.airdrop_pct_of_supply, e.change_72h_pct)
                for e in self.events
                if e.change_72h_pct is not None
                and e.airdrop_pct_of_supply > 0]

        if len(data) < 5:
            return {"error": "insufficient data"}

        x = np.array([d[0] for d in data])
        y = np.array([d[1] for d in data])
        correlation = np.corrcoef(x, y)[0, 1]

        # 버킷 분석
        high = [d[1] for d in data if d[0] >= 5.0]
        mid = [d[1] for d in data if 2.5 <= d[0] < 5.0]
        low = [d[1] for d in data if d[0] < 2.5]

        return {
            "H2_correlation_airdrop_vs_return": correlation,
            "H2_high_airdrop_5pct_plus_avg": np.mean(high) if high else None,
            "H2_mid_airdrop_2_5_to_5pct_avg": np.mean(mid) if mid else None,
            "H2_low_airdrop_under_2_5pct_avg": np.mean(low) if low else None,
            "H2_interpretation": (
                "H2 partially supported" if correlation < -0.2
                else "H2 not strongly supported"
            ),
        }

    def analyze_by_mechanism(self) -> pd.DataFrame:
        """메커니즘별 성과 분석."""
        data = []
        for mech in ListingMechanism:
            mech_events = [e for e in self.events if e.mechanism == mech]
            if not mech_events:
                continue
            returns_72h = [e.change_72h_pct for e in mech_events
                           if e.change_72h_pct is not None]
            if not returns_72h:
                continue

            data.append({
                "mechanism": mech.value,
                "count": len(mech_events),
                "avg_airdrop_pct": np.mean(
                    [e.airdrop_pct_of_supply for e in mech_events]),
                "avg_72h_return": np.mean(returns_72h),
                "median_72h": np.median(returns_72h),
                "std_72h": np.std(returns_72h),
                "worst_case": min(returns_72h),
                "best_case": max(returns_72h),
            })
        return pd.DataFrame(data)

    def compute_extreme_events(self) -> Dict:
        """극단 이벤트 집계."""
        extreme_drop = [e for e in self.events
                        if e.change_72h_pct is not None
                        and e.change_72h_pct < -55]
        extreme_peak_drop = [e for e in self.events
                             if e.peak_to_72h_drop_pct is not None
                             and e.peak_to_72h_drop_pct < -60]
        positive = [e for e in self.events
                    if e.change_72h_pct is not None
                    and e.change_72h_pct > 0]

        return {
            "extreme_drop_72h_pct_minus55": {
                "count": len(extreme_drop),
                "rate_pct": len(extreme_drop) / len(self.events) * 100,
                "tokens": [e.token_symbol for e in extreme_drop[:10]],
            },
            "extreme_peak_to_72h_drop_minus60": {
                "count": len(extreme_peak_drop),
                "rate_pct": len(extreme_peak_drop) / len(self.events) * 100,
            },
            "positive_72h_exceptions": {
                "count": len(positive),
                "tokens": [(e.token_symbol, e.change_72h_pct)
                           for e in positive],
            }
        }


# ==========================================================
# 메인 파이프라인
# ==========================================================

def run_full_analysis():
    log.info("=" * 60)
    log.info("Binance Listing Day Crash Analysis")
    log.info("=" * 60)

    analyzer = ListingCrashAnalyzer()
    analyzer.load_events_from_csv(
        "01_binance_listing_day_crashes_2024_2025.csv"
    )

    print("\n" + "=" * 60)
    print("H1: 상장 후 하락률이 BTC보다 큰가?")
    print("=" * 60)
    h1 = analyzer.verify_hypothesis_H1()
    for k, v in h1.items():
        if isinstance(v, float):
            print(f"  {k}: {v:.2f}")
        else:
            print(f"  {k}: {v}")

    print("\n" + "=" * 60)
    print("H2: Airdrop % 증가 ∝ 하락 규모 증가?")
    print("=" * 60)
    h2 = analyzer.verify_hypothesis_H2()
    for k, v in h2.items():
        if isinstance(v, float):
            print(f"  {k}: {v:.4f}")
        else:
            print(f"  {k}: {v}")

    print("\n" + "=" * 60)
    print("메커니즘별 분석")
    print("=" * 60)
    df_mech = analyzer.analyze_by_mechanism()
    print(df_mech.to_string(index=False))

    print("\n" + "=" * 60)
    print("극단 이벤트")
    print("=" * 60)
    extreme = analyzer.compute_extreme_events()
    print(json.dumps(extreme, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_full_analysis()
