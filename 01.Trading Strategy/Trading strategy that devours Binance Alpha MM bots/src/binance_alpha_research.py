"""
╔══════════════════════════════════════════════════════════════════════╗
║   Binance Alpha MM Bot Research Engine                              ║
║   온체인 데이터 수집 + MM 봇 패턴 탐지 엔진                            ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   목적:                                                              ║
║   1. Binance Alpha 상장 토큰 리스트 수집                             ║
║   2. 각 토큰의 온체인 지갑 수 및 증가 추이 추적                       ║
║   3. Top-10 홀더 집중도 계산                                         ║
║   4. BTC 가격/볼륨과의 상관관계 분석                                  ║
║   5. MM 봇 5단계 모델 기반 현재 단계 탐지                             ║
║                                                                      ║
║   Disclaimer:                                                        ║
║   본 코드는 연구·교육 목적이며, 특정 프로젝트나 재단을               ║
║   시세조종 행위자로 확정하지 않는다. 통계적 패턴 분석 도구이다.      ║
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
import json
import logging

# ==========================================================
# 설정
# ==========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


class MMPhase(Enum):
    """MM Bot 5단계 모델 (Alpha Architect 2019 + 자체 확장)."""
    ACCUMULATION = 1   # 사전매집: 가격 ±5%, 볼륨 정상
    PUMP_SIGNAL = 2    # 펌프 시작: +10%, 볼륨 +15%
    PEAK_FORMATION = 3 # 정점 유도: +40~200%, wash trade 급증
    DISTRIBUTION = 4   # 덤프 시작: -30~-60%, 볼륨 급감
    CAPITULATION = 5   # 완전 붕괴: -80~-99%


@dataclass
class TokenMetrics:
    """단일 토큰의 온체인 메트릭 스냅샷."""
    symbol: str
    timestamp: datetime

    # 가격·볼륨
    price_usd: float
    volume_24h_usd: float
    market_cap_usd: float

    # 온체인 홀더
    holder_count: int
    top10_concentration_pct: float
    unique_buyers_24h: int
    daily_holder_delta: int = 0

    # 계산 필드
    volume_to_mcap_ratio: float = field(init=False)

    # BTC 상관관계
    btc_correlation_24h: Optional[float] = None
    btc_correlation_7d: Optional[float] = None

    # 성과 지표
    price_multiple_vs_launch: Optional[float] = None
    days_since_listing: Optional[int] = None

    def __post_init__(self):
        self.volume_to_mcap_ratio = (
            self.volume_24h_usd / self.market_cap_usd
            if self.market_cap_usd > 0 else 0
        )


# ==========================================================
# 데이터 수집 클래스
# ==========================================================

class BinanceAlphaResearcher:
    """Binance Alpha 토큰 리서치 엔진."""

    # 무료 API 엔드포인트
    BINANCE_API = "https://api.binance.com"
    COINGECKO_API = "https://api.coingecko.com/api/v3"
    ETHERSCAN_API = "https://api.etherscan.io/api"
    BSCSCAN_API = "https://api.bscscan.com/api"

    def __init__(self, etherscan_key: Optional[str] = None,
                 bscscan_key: Optional[str] = None):
        """
        무료 공개 API는 rate limit이 엄격하므로 Etherscan/BSCScan
        API 키를 등록해두는 것이 권장된다.
        """
        self.etherscan_key = etherscan_key
        self.bscscan_key = bscscan_key
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "vibe-investing/1.0 (research)"
        })

    # ------------------------------------------------------
    # 1. 토큰 메타데이터
    # ------------------------------------------------------
    def fetch_alpha_token_list(self) -> pd.DataFrame:
        """
        Binance Alpha에 상장된 토큰 리스트를 가져온다.
        (공식 API가 제한적이므로 실제 구현은 announcement scraping이
        주가 된다. 본 예시에서는 공개 데이터로 시뮬레이션.)
        """
        # 실제 프로덕션에서는 아래 주소를 스크랩:
        # https://www.binance.com/en/support/announcement/new-cryptocurrency-listing
        log.info("Fetching Binance Alpha token list...")

        # 예시 하드코딩 (실제 프로덕션은 API 크롤링)
        return pd.read_csv("01_binance_alpha_tokens_research.csv")

    # ------------------------------------------------------
    # 2. 가격·볼륨 데이터
    # ------------------------------------------------------
    def fetch_price_volume(self, symbol: str,
                           days: int = 30) -> pd.DataFrame:
        """CoinGecko에서 일별 가격·볼륨 history를 가져온다."""
        try:
            url = f"{self.COINGECKO_API}/coins/{symbol.lower()}/market_chart"
            r = self.session.get(url, params={
                "vs_currency": "usd", "days": days,
            }, timeout=30)
            r.raise_for_status()
            data = r.json()

            prices = pd.DataFrame(data.get("prices", []),
                                   columns=["ts", "price"])
            volumes = pd.DataFrame(data.get("total_volumes", []),
                                    columns=["ts", "volume"])
            mcaps = pd.DataFrame(data.get("market_caps", []),
                                  columns=["ts", "mcap"])

            df = prices.merge(volumes, on="ts").merge(mcaps, on="ts")
            df["timestamp"] = pd.to_datetime(df["ts"], unit="ms")
            return df[["timestamp", "price", "volume", "mcap"]]
        except Exception as e:
            log.warning(f"Price fetch failed for {symbol}: {e}")
            return pd.DataFrame()

    # ------------------------------------------------------
    # 3. 온체인 홀더 수
    # ------------------------------------------------------
    def fetch_holder_count(self, contract: str,
                           chain: str = "bsc") -> int:
        """
        ERC20/BEP20 토큰의 현재 홀더 수를 조회.
        BSCScan/Etherscan API가 공식 홀더 엔드포인트를 제공하지
        않으므로 실제 프로덕션에서는 The Graph, Moralis, Bitquery
        등의 서비스를 권장.

        여기서는 간이 구현 (token balance 이벤트 카운팅).
        """
        try:
            # 예: Moralis API 사용 (API 키 필요)
            # 또는 Bitquery GraphQL
            # 또는 BSCScan의 tokentx 엔드포인트로 유니크 주소 카운트
            if chain == "bsc":
                url = self.BSCSCAN_API
                key = self.bscscan_key
            else:
                url = self.ETHERSCAN_API
                key = self.etherscan_key

            if not key:
                log.warning(f"No API key for {chain}, returning 0")
                return 0

            r = self.session.get(url, params={
                "module": "token",
                "action": "tokenholderlist",
                "contractaddress": contract,
                "page": 1, "offset": 10000,
                "apikey": key,
            }, timeout=30)
            r.raise_for_status()
            data = r.json()
            if data.get("status") == "1":
                return len(data.get("result", []))
            return 0
        except Exception as e:
            log.warning(f"Holder fetch failed for {contract}: {e}")
            return 0

    def calculate_top10_concentration(self, contract: str,
                                       chain: str = "bsc") -> float:
        """Top 10 홀더 집중도 (%)."""
        try:
            # 실제 구현은 Moralis / Bitquery 권장
            # 여기서는 시뮬레이션
            return 0.0
        except Exception as e:
            log.warning(f"Concentration calc failed: {e}")
            return 0.0

    # ------------------------------------------------------
    # 4. BTC 데이터 (상관관계 계산용)
    # ------------------------------------------------------
    def fetch_btc_data(self, days: int = 30) -> pd.DataFrame:
        return self.fetch_price_volume("bitcoin", days)


# ==========================================================
# MM 봇 패턴 탐지 엔진
# ==========================================================

class MMBotDetector:
    """5단계 MM Bot 페이즈 탐지 엔진."""

    def __init__(self):
        self.phase_rules = {
            MMPhase.ACCUMULATION: self._is_accumulation,
            MMPhase.PUMP_SIGNAL: self._is_pump_signal,
            MMPhase.PEAK_FORMATION: self._is_peak_formation,
            MMPhase.DISTRIBUTION: self._is_distribution,
            MMPhase.CAPITULATION: self._is_capitulation,
        }

    # ------------------------------------------------------
    # 페이즈 판별 로직
    # ------------------------------------------------------
    def _is_accumulation(self, m: TokenMetrics,
                         prev: Optional[TokenMetrics] = None) -> bool:
        """사전매집: 가격 ±5%, 볼륨 정상."""
        if m.days_since_listing is not None and m.days_since_listing > 0:
            return False
        return m.holder_count < 5000 and m.top10_concentration_pct > 90

    def _is_pump_signal(self, m: TokenMetrics,
                        prev: Optional[TokenMetrics] = None) -> bool:
        """펌프 시작: 가격 +10%, 볼륨 +15% (15분)."""
        if prev is None:
            return False
        price_change = (m.price_usd - prev.price_usd) / prev.price_usd
        volume_change = (m.volume_24h_usd - prev.volume_24h_usd) / \
                        max(prev.volume_24h_usd, 1)
        return 0.08 <= price_change <= 0.15 and volume_change > 0.12

    def _is_peak_formation(self, m: TokenMetrics,
                           prev: Optional[TokenMetrics] = None) -> bool:
        """정점 유도: +40~200%, wash trade 급증."""
        if m.price_multiple_vs_launch is None:
            return False
        # 가격 1.4배 이상 + V/MC 비율 비정상 (wash 의심)
        return (m.price_multiple_vs_launch >= 1.4 and
                m.volume_to_mcap_ratio > 3.0)

    def _is_distribution(self, m: TokenMetrics,
                         prev: Optional[TokenMetrics] = None) -> bool:
        """덤프 시작: -30~-60%, 볼륨 급감, 홀더 정체."""
        if prev is None:
            return False
        price_drop = (m.price_usd - prev.price_usd) / prev.price_usd
        holder_stagnant = abs(m.daily_holder_delta) < 100
        return -0.60 <= price_drop <= -0.20 and holder_stagnant

    def _is_capitulation(self, m: TokenMetrics,
                         prev: Optional[TokenMetrics] = None) -> bool:
        """완전 붕괴: -80~-99%, 거의 거래 없음."""
        if m.price_multiple_vs_launch is None:
            return False
        return (m.price_multiple_vs_launch < 0.2 and
                m.volume_to_mcap_ratio < 0.3)

    # ------------------------------------------------------
    # 메인 탐지
    # ------------------------------------------------------
    def detect_phase(self, current: TokenMetrics,
                     previous: Optional[TokenMetrics] = None) -> Tuple[MMPhase, float]:
        """
        현재 토큰의 MM Bot 단계를 판별.
        반환: (단계, 신뢰도 0~1)
        """
        scores = {}
        for phase, rule_fn in self.phase_rules.items():
            if rule_fn(current, previous):
                scores[phase] = 1.0

        if not scores:
            # 판별 불가 - 기본값
            return MMPhase.ACCUMULATION, 0.3

        # 가장 높은 단계를 선택 (5단계 모델은 선형적)
        best = max(scores.keys(), key=lambda p: p.value)
        return best, scores[best]


# ==========================================================
# 상관관계 분석
# ==========================================================

class CorrelationAnalyzer:
    """BTC와 Alpha 토큰의 상관관계 분석."""

    @staticmethod
    def rolling_correlation(
        alpha_prices: pd.Series,
        btc_prices: pd.Series,
        window: int = 24
    ) -> pd.Series:
        """Rolling correlation (기본 24시간 윈도우)."""
        alpha_ret = alpha_prices.pct_change()
        btc_ret = btc_prices.pct_change()
        return alpha_ret.rolling(window).corr(btc_ret)

    @staticmethod
    def classify_correlation_type(corr_24h: float,
                                   corr_7d: float,
                                   corr_30d: float) -> str:
        """상관관계 유형 분류 (전략 시그널 생성용)."""
        if corr_24h > 0.4 and corr_7d > 0.4:
            return "정상_상관"
        if corr_24h > 0.2 and corr_7d < 0:
            return "위상_반전"  # ★ MM 봇 행위 의심
        if abs(corr_24h) < 0.15 and abs(corr_7d) < 0.15:
            return "MM_단독_행동"  # ★★ 강한 의심
        if corr_24h > 0 and corr_7d > 0 and corr_30d < 0:
            return "초기_동조_후_분리"
        return "미분류"


# ==========================================================
# 메인 리서치 파이프라인
# ==========================================================

def run_full_research(token_symbols: List[str],
                      etherscan_key: Optional[str] = None,
                      bscscan_key: Optional[str] = None) -> pd.DataFrame:
    """
    전체 리서치 파이프라인 실행.
    1. 각 토큰의 최신 메트릭 수집
    2. MM Bot 페이즈 탐지
    3. BTC 상관관계 계산
    4. 종합 점수 산출
    """
    researcher = BinanceAlphaResearcher(etherscan_key, bscscan_key)
    detector = MMBotDetector()
    analyzer = CorrelationAnalyzer()

    log.info("=" * 60)
    log.info(f"Researching {len(token_symbols)} tokens")
    log.info("=" * 60)

    # BTC 기준 데이터 먼저 가져오기
    btc_df = researcher.fetch_btc_data(days=30)

    results = []
    for i, symbol in enumerate(token_symbols, 1):
        log.info(f"[{i}/{len(token_symbols)}] {symbol}")

        try:
            # 가격·볼륨
            price_df = researcher.fetch_price_volume(symbol, days=30)
            if price_df.empty:
                continue

            latest = price_df.iloc[-1]

            # 홀더 (실제로는 contract address 필요)
            # holder_count = researcher.fetch_holder_count(contract, chain)
            holder_count = 0  # placeholder

            # 메트릭 객체 생성
            metrics = TokenMetrics(
                symbol=symbol,
                timestamp=latest["timestamp"],
                price_usd=float(latest["price"]),
                volume_24h_usd=float(latest["volume"]),
                market_cap_usd=float(latest["mcap"]),
                holder_count=holder_count,
                top10_concentration_pct=0.0,
                unique_buyers_24h=0,
            )

            # 페이즈 탐지
            phase, confidence = detector.detect_phase(metrics)

            # 상관관계
            if not btc_df.empty and len(price_df) > 24:
                merged = price_df.merge(btc_df, on="timestamp",
                                          suffixes=("_a", "_btc"))
                corr_24h = (merged["price_a"].pct_change()
                            .corr(merged["price_btc"].pct_change()))
                corr_class = analyzer.classify_correlation_type(
                    corr_24h, corr_24h, corr_24h)
            else:
                corr_24h = None
                corr_class = "데이터부족"

            results.append({
                "symbol": symbol,
                "price_usd": metrics.price_usd,
                "volume_24h_usd_m": metrics.volume_24h_usd / 1e6,
                "market_cap_usd_m": metrics.market_cap_usd / 1e6,
                "v_mc_ratio": metrics.volume_to_mcap_ratio,
                "holder_count": metrics.holder_count,
                "mm_phase": phase.name,
                "mm_confidence": confidence,
                "btc_correlation_24h": corr_24h,
                "correlation_type": corr_class,
                "research_timestamp": metrics.timestamp,
            })

            # Rate limit 방지
            time.sleep(1.2)

        except Exception as e:
            log.exception(f"Failed: {symbol}")

    return pd.DataFrame(results)


# ==========================================================
# 실행
# ==========================================================

if __name__ == "__main__":
    # 예시: Alpha에 상장된 토큰 몇 개를 대상으로
    sample_tokens = [
        "epiko-protocol", "nexpace", "obol-network",
        "huma-finance", "paal-ai",
        # 실제 사용 시 CoinGecko ID 정확히 확인 필요
    ]

    df = run_full_research(
        sample_tokens,
        # etherscan_key=os.environ.get("ETHERSCAN_KEY"),
        # bscscan_key=os.environ.get("BSCSCAN_KEY"),
    )

    if not df.empty:
        df.to_csv("alpha_research_output.csv", index=False,
                   encoding="utf-8-sig")
        log.info(f"Saved {len(df)} results to alpha_research_output.csv")
        log.info("\n" + df.to_string())
    else:
        log.warning("No results collected")
