"""
╔══════════════════════════════════════════════════════════════════════╗
║   Token Unlock Impact Analyzer                                       ║
║   72-Hour Price Shock Research Engine                                ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   목적:                                                              ║
║   1. CoinMarketCap / CoinGecko / Tokenomist에서 언락 일정 수집       ║
║   2. 각 토큰의 언락 전후 72h 가격 추적                                ║
║   3. BTC 대비 상대 수익률 계산                                       ║
║   4. 언락 유형 (cliff/linear) × 수취인 × 규모별 영향 분석            ║
║   5. Keyrock 프레임워크와의 비교 분석                                 ║
║                                                                      ║
║   학술 근거:                                                         ║
║   - Keyrock (2024): "16,000 Token Unlocks" — 90% 하락 통계           ║
║   - Binance Research (2024): $155B FDV unlock report                 ║
║   - La Morgia et al. (2022): Pump-and-Dump detection                 ║
║                                                                      ║
║   ⚠️ Disclaimer:                                                     ║
║   연구·교육 목적. 투자 조언 아님. 특정 주체 불지목. MIT License.    ║
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

class UnlockType(Enum):
    """언락 유형."""
    CLIFF = "cliff"        # 단일 대형 방출
    LINEAR = "linear"      # 주기적 점진 방출
    BATCH = "batch"        # 조건부 일괄 방출
    EMISSION = "emission"  # 온체인 활동 기반 (마이닝/스테이킹)


class RecipientCategory(Enum):
    """수취인 카테고리 (Keyrock 프레임워크)."""
    TEAM = "team"                  # 코어 팀/개발자 (가장 위험)
    INVESTOR = "investor"          # VC/시드 투자자
    TEAM_INVESTOR = "team+investor"  # 팀+투자자 혼합 (가장 흔함)
    ECOSYSTEM = "ecosystem"        # 생태계 기금/보조금 (중립~긍정)
    COMMUNITY = "community"        # 커뮤니티 보상/에어드롭
    MINER = "miner"                # 채굴/스테이킹 보상
    BURN = "burn"                  # 소각 (분석 제외)


@dataclass
class UnlockEvent:
    """단일 언락 이벤트."""
    token_symbol: str
    unlock_date: datetime
    unlock_type: UnlockType
    unlock_pct_of_supply: float     # 순환공급량 대비 %
    unlock_value_usd: float          # USD 가치
    recipient: RecipientCategory

    # 가격 데이터 (분석 후 채움)
    price_t_minus_7d: Optional[float] = None
    price_at_unlock: Optional[float] = None
    price_t_plus_24h: Optional[float] = None
    price_t_plus_72h: Optional[float] = None
    price_t_plus_14d: Optional[float] = None

    btc_price_at_unlock: Optional[float] = None
    btc_price_t_plus_72h: Optional[float] = None

    # 계산된 메트릭
    return_72h_pct: Optional[float] = None
    btc_return_72h_pct: Optional[float] = None
    relative_vs_btc_pct: Optional[float] = None

    # 메타
    binance_listing_date: Optional[datetime] = None
    days_from_listing: Optional[int] = None
    notes: str = ""

    def compute_metrics(self):
        """72h 리턴 등 메트릭 계산."""
        if self.price_at_unlock and self.price_t_plus_72h:
            self.return_72h_pct = (
                (self.price_t_plus_72h - self.price_at_unlock)
                / self.price_at_unlock * 100
            )
        if self.btc_price_at_unlock and self.btc_price_t_plus_72h:
            self.btc_return_72h_pct = (
                (self.btc_price_t_plus_72h - self.btc_price_at_unlock)
                / self.btc_price_at_unlock * 100
            )
        if (self.return_72h_pct is not None
                and self.btc_return_72h_pct is not None):
            self.relative_vs_btc_pct = (
                self.return_72h_pct - self.btc_return_72h_pct
            )


# ==========================================================
# 데이터 수집
# ==========================================================

class UnlockDataCollector:
    """토큰 언락 일정 + 가격 데이터 수집 엔진."""

    COINGECKO_API = "https://api.coingecko.com/api/v3"
    COINMARKETCAP_API = "https://pro-api.coinmarketcap.com/v1"
    TOKENOMIST_API = "https://api.tokenomist.ai/v1"  # 가상 주소

    def __init__(self, coingecko_key: Optional[str] = None,
                 cmc_key: Optional[str] = None):
        self.coingecko_key = coingecko_key
        self.cmc_key = cmc_key
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "vibe-investing/1.0 (unlock-research)"
        })

    # ------------------------------------------------------
    # 1. 언락 일정 가져오기
    # ------------------------------------------------------
    def fetch_unlock_schedule(self, token_symbol: str) -> List[UnlockEvent]:
        """
        Tokenomist / DefiLlama / CoinMarketCap에서
        언락 일정을 가져온다.

        실제 구현은 API 키 필요. 여기서는 구조만 제공.
        """
        log.info(f"Fetching unlock schedule for {token_symbol}")

        # 실제 프로덕션 예시:
        # url = f"{self.TOKENOMIST_API}/unlocks/{token_symbol}"
        # r = self.session.get(url, headers={"X-API-Key": self.key})
        # data = r.json()
        # return [self._parse_event(e, token_symbol) for e in data["events"]]

        # 여기서는 CSV에서 로드
        try:
            df = pd.read_csv(
                "01_binance_token_unlock_events_2023_2025.csv"
            )
            events_df = df[df["token_symbol"] == token_symbol]
            events = []
            for _, row in events_df.iterrows():
                events.append(self._row_to_event(row))
            return events
        except FileNotFoundError:
            log.warning("CSV not found — using placeholder")
            return []

    def _row_to_event(self, row) -> UnlockEvent:
        """DataFrame 행을 UnlockEvent로 변환."""
        unlock_type = UnlockType(row["unlock_type"])
        recipient_str = row["recipient_category"]
        # 다중 수취인의 경우 첫 번째를 주요 카테고리로
        if "team" in recipient_str and "investor" in recipient_str:
            recipient = RecipientCategory.TEAM_INVESTOR
        elif "team" in recipient_str:
            recipient = RecipientCategory.TEAM
        elif "investor" in recipient_str:
            recipient = RecipientCategory.INVESTOR
        elif "ecosystem" in recipient_str:
            recipient = RecipientCategory.ECOSYSTEM
        elif "community" in recipient_str or "airdrop" in recipient_str:
            recipient = RecipientCategory.COMMUNITY
        elif "miner" in recipient_str:
            recipient = RecipientCategory.MINER
        else:
            recipient = RecipientCategory.TEAM_INVESTOR

        event = UnlockEvent(
            token_symbol=row["token_symbol"],
            unlock_date=datetime.strptime(row["unlock_date"], "%Y-%m-%d"),
            unlock_type=unlock_type,
            unlock_pct_of_supply=float(row["unlock_pct_of_supply"]),
            unlock_value_usd=float(row["unlock_value_usd_m"]) * 1e6,
            recipient=recipient,
            price_at_unlock=float(row["price_at_unlock_usd"]),
            price_t_plus_72h=float(row["price_after_72h_usd"]),
            return_72h_pct=float(row["change_72h_pct"]),
            btc_return_72h_pct=float(row["btc_change_72h_pct"]),
            relative_vs_btc_pct=float(row["relative_performance_vs_btc_pct"]),
            days_from_listing=int(row["days_from_listing"]),
            notes=str(row.get("notes", "")),
        )
        return event

    # ------------------------------------------------------
    # 2. 가격 데이터
    # ------------------------------------------------------
    def fetch_price_at_datetime(self, token_id: str,
                                 target: datetime) -> Optional[float]:
        """CoinGecko 과거 가격."""
        try:
            ts_from = int(target.timestamp())
            ts_to = int((target + timedelta(hours=1)).timestamp())
            url = f"{self.COINGECKO_API}/coins/{token_id}/market_chart/range"
            r = self.session.get(url, params={
                "vs_currency": "usd", "from": ts_from, "to": ts_to,
            }, timeout=30)
            r.raise_for_status()
            prices = r.json().get("prices", [])
            if prices:
                return float(prices[0][1])
        except Exception as e:
            log.warning(f"Price fetch failed for {token_id}@{target}: {e}")
        return None

    def fetch_btc_baseline(self, target: datetime) -> Optional[float]:
        """BTC 기준 가격."""
        return self.fetch_price_at_datetime("bitcoin", target)


# ==========================================================
# 분석 엔진
# ==========================================================

class UnlockImpactAnalyzer:
    """언락 이벤트의 가격 영향 분석."""

    def __init__(self):
        self.events: List[UnlockEvent] = []

    def load_events(self, events: List[UnlockEvent]):
        """분석 대상 이벤트 로드."""
        self.events = [e for e in events if e.return_72h_pct is not None]
        log.info(f"Loaded {len(self.events)} events for analysis")

    # ------------------------------------------------------
    # Dennis 가설 검증
    # ------------------------------------------------------
    def verify_dennis_hypothesis(self) -> Dict:
        """핵심 가설: '72h 내 언락 토큰은 BTC 대비 하락한다'."""
        if not self.events:
            return {}

        returns_72h = [e.return_72h_pct for e in self.events]
        btc_relative = [e.relative_vs_btc_pct for e in self.events]

        negative_count = sum(1 for r in returns_72h if r < 0)
        vs_btc_negative = sum(1 for r in btc_relative if r < 0)

        return {
            "total_events": len(self.events),
            "72h_negative_rate_pct": negative_count / len(self.events) * 100,
            "72h_avg_return_pct": np.mean(returns_72h),
            "72h_median_return_pct": np.median(returns_72h),
            "72h_std_return_pct": np.std(returns_72h),
            "vs_btc_negative_rate_pct": vs_btc_negative / len(self.events) * 100,
            "avg_relative_vs_btc_pct": np.mean(btc_relative),
            "keyrock_90pct_alignment": abs(negative_count / len(self.events)
                                           * 100 - 90) < 5,
        }

    # ------------------------------------------------------
    # 수취인별 분석 (Keyrock 프레임워크)
    # ------------------------------------------------------
    def analyze_by_recipient(self) -> pd.DataFrame:
        """수취인 카테고리별 영향 분석."""
        data = []
        for cat in RecipientCategory:
            cat_events = [e for e in self.events if e.recipient == cat]
            if not cat_events:
                continue
            returns = [e.return_72h_pct for e in cat_events]
            data.append({
                "category": cat.value,
                "count": len(cat_events),
                "avg_72h_return": np.mean(returns),
                "median": np.median(returns),
                "std": np.std(returns),
                "worst_case": min(returns),
                "best_case": max(returns),
            })
        return pd.DataFrame(data)

    # ------------------------------------------------------
    # 언락 유형별 분석
    # ------------------------------------------------------
    def analyze_by_type(self) -> pd.DataFrame:
        """Cliff vs Linear."""
        data = []
        for utype in UnlockType:
            type_events = [e for e in self.events
                           if e.unlock_type == utype]
            if not type_events:
                continue
            returns = [e.return_72h_pct for e in type_events]
            data.append({
                "unlock_type": utype.value,
                "count": len(type_events),
                "avg_72h_return": np.mean(returns),
                "median": np.median(returns),
                "std": np.std(returns),
            })
        return pd.DataFrame(data)

    # ------------------------------------------------------
    # 규모별 분석 (Keyrock 카테고리)
    # ------------------------------------------------------
    def analyze_by_size(self) -> pd.DataFrame:
        """
        Keyrock 규모 카테고리:
        - Nano (<0.1%)
        - Micro (0.1-0.5%)
        - Small (0.5-1%)
        - Medium (1-5%)
        - Large (5-10%)
        - Huge (>10%)
        """
        buckets = {
            "Nano (<0.1%)": (0, 0.1),
            "Micro (0.1-0.5%)": (0.1, 0.5),
            "Small (0.5-1%)": (0.5, 1),
            "Medium (1-5%)": (1, 5),
            "Large (5-10%)": (5, 10),
            "Huge (>10%)": (10, 100),
        }
        data = []
        for name, (low, high) in buckets.items():
            bucket_events = [
                e for e in self.events
                if low <= e.unlock_pct_of_supply < high
            ]
            if not bucket_events:
                continue
            returns = [e.return_72h_pct for e in bucket_events]
            data.append({
                "bucket": name,
                "count": len(bucket_events),
                "avg_72h_return": np.mean(returns),
                "median": np.median(returns),
            })
        return pd.DataFrame(data)

    # ------------------------------------------------------
    # 1주년 Cliff 검증 (본 연구 발견)
    # ------------------------------------------------------
    def analyze_anniversary_cliffs(self) -> Dict:
        """1주년 cliff 언락이 가장 치명적이라는 가설 검증."""
        anniversary_events = [
            e for e in self.events
            if (e.unlock_type == UnlockType.CLIFF
                and e.days_from_listing
                and 350 <= e.days_from_listing <= 380)
        ]
        if not anniversary_events:
            return {"note": "No anniversary cliff events"}

        returns = [e.return_72h_pct for e in anniversary_events]
        return {
            "anniversary_cliff_count": len(anniversary_events),
            "avg_return_72h_pct": np.mean(returns),
            "median_return_72h_pct": np.median(returns),
            "min_return_pct": min(returns),
            "max_return_pct": max(returns),
            "hit_rate_negative": sum(1 for r in returns if r < 0)
                                  / len(returns) * 100,
            "examples": [
                {"token": e.token_symbol,
                 "unlock_date": e.unlock_date.strftime("%Y-%m-%d"),
                 "return_72h": e.return_72h_pct}
                for e in sorted(anniversary_events,
                                 key=lambda x: x.return_72h_pct)[:5]
            ]
        }


# ==========================================================
# 메인 파이프라인
# ==========================================================

def run_full_analysis():
    """전체 분석 파이프라인."""
    log.info("=" * 60)
    log.info("Token Unlock Impact Analysis - 72 Hour Shock Study")
    log.info("=" * 60)

    # 1. 데이터 수집
    collector = UnlockDataCollector()

    tokens = ["APE", "SAND", "APT", "ARB", "AEVO", "STRK",
              "MOVE", "TRUMP", "LINEA", "JTO", "ONDO", "PYTH",
              "TIA", "ZK", "JUP", "OP", "FTM", "TAO"]

    all_events = []
    for token in tokens:
        events = collector.fetch_unlock_schedule(token)
        all_events.extend(events)

    log.info(f"Collected {len(all_events)} events")

    # 2. 분석
    analyzer = UnlockImpactAnalyzer()
    analyzer.load_events(all_events)

    # 3. 결과 출력
    print("\n" + "=" * 60)
    print("DENNIS HYPOTHESIS VERIFICATION")
    print("=" * 60)
    hypo = analyzer.verify_dennis_hypothesis()
    for k, v in hypo.items():
        if isinstance(v, float):
            print(f"  {k}: {v:.2f}")
        else:
            print(f"  {k}: {v}")

    print("\n" + "=" * 60)
    print("RECIPIENT CATEGORY ANALYSIS (Keyrock framework)")
    print("=" * 60)
    df_rec = analyzer.analyze_by_recipient()
    print(df_rec.to_string(index=False))

    print("\n" + "=" * 60)
    print("UNLOCK TYPE ANALYSIS")
    print("=" * 60)
    df_type = analyzer.analyze_by_type()
    print(df_type.to_string(index=False))

    print("\n" + "=" * 60)
    print("SIZE BUCKET ANALYSIS (Keyrock buckets)")
    print("=" * 60)
    df_size = analyzer.analyze_by_size()
    print(df_size.to_string(index=False))

    print("\n" + "=" * 60)
    print("1-YEAR ANNIVERSARY CLIFF (Our discovery)")
    print("=" * 60)
    anniv = analyzer.analyze_anniversary_cliffs()
    print(json.dumps(anniv, indent=2, default=str))

    # 4. CSV 저장
    df_rec.to_csv("recipient_analysis_output.csv", index=False,
                   encoding="utf-8-sig")
    df_type.to_csv("type_analysis_output.csv", index=False,
                    encoding="utf-8-sig")
    df_size.to_csv("size_analysis_output.csv", index=False,
                    encoding="utf-8-sig")

    log.info("Analysis complete. Output CSVs saved.")


if __name__ == "__main__":
    run_full_analysis()
