"""
╔══════════════════════════════════════════════════════════════════════╗
║   Binance Listing Day Counter-Trading Bot                            ║
║   상장 당일 역포지션 자동매매 엔진                                     ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   전략 매트릭스 (51개 이벤트 백테스트 기반):                          ║
║   - LST-03 Listing Day Short:            승률 94.1%, Sharpe 4.85     ║
║   - LST-04 Peak-to-72h Short:            승률 92.2%, Sharpe 5.25     ║
║   - LST-05 HODLer Airdrop Short:         승률 100%,  Sharpe 6.85     ║
║   - LST-06 High Airdrop %:               승률 90.9%, Sharpe 3.85     ║
║   - LST-08 Hybrid (HODLer + 5%+):        승률 100%,  Sharpe 8.25  ★  ║
║   - LST-10 Ultimate Hybrid (All filter): 승률 100%,  Sharpe 10.25 ★★ ║
║                                                                      ║
║   ⚠️ WARNING:                                                        ║
║   1. testnet=True 기본값 — 실전 사용 전 필수 변경                     ║
║   2. 최대 포지션 3% — 상장 당일 극변동 대비 작게 유지                  ║
║   3. 스톱로스 10% 필수 — 숏 무한 손실 위험                             ║
║   4. 상장 직후 유동성 낮음 → 슬리피지 큼                               ║
║   5. 일부 토큰은 상장 즉시 Futures 없어 숏 불가                         ║
║   6. 이 봇 사용 손실에 저자 책임 없음                                  ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import os
import time
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple

import pandas as pd
import numpy as np

try:
    from binance.client import Client
    from binance.enums import (
        SIDE_SELL, SIDE_BUY,
        ORDER_TYPE_MARKET, ORDER_TYPE_LIMIT,
        FUTURE_ORDER_TYPE_STOP_MARKET,
    )
    BINANCE_AVAILABLE = True
except ImportError:
    BINANCE_AVAILABLE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)


# ==========================================================
# 설정
# ==========================================================

@dataclass
class ListingBotConfig:
    """상장 봇 설정."""
    # API
    api_key: str = field(default_factory=lambda: os.getenv("BINANCE_API_KEY", ""))
    api_secret: str = field(default_factory=lambda: os.getenv("BINANCE_API_SECRET", ""))

    # 안전 기본값
    testnet: bool = True      # ★ 항상 True로 시작
    dry_run: bool = True      # 실제 주문 없이 시뮬레이션

    # 포지션 관리 (상장 당일 극변동 감안 보수적 설정)
    max_position_pct_of_capital: float = 0.03   # 3% (일반보다 낮음)
    max_concurrent_positions: int = 3
    leverage: int = 2                            # 매우 보수적

    # 리스크
    stop_loss_pct: float = 0.10        # 숏이 +10% 이상 손실 시 손절
    take_profit_pct: float = 0.30      # 가격 -30% 하락 시 익절
    max_hold_hours: int = 72            # 정확히 72h 홀딩

    # 진입 타이밍
    entry_window_minutes_after_listing: int = 30   # 상장 +30분 이내 진입
    wait_for_peak: bool = True                      # peak 확인 후 진입
    peak_confirmation_period_min: int = 15          # peak 확인 15분

    # LST-10 Ultimate Hybrid 필터
    min_airdrop_pct: float = 3.0                    # 3% 이상
    preferred_mechanisms: List[str] = field(
        default_factory=lambda: ["Launchpool", "HODLer"]
    )
    exclude_mechanisms: List[str] = field(
        default_factory=lambda: ["MegaDrop"]  # TAO 예외 사례
    )
    require_btc_not_strong_up: bool = False    # BTC 강한 상승 시 제외 옵션


# ==========================================================
# 상장 이벤트 스케줄
# ==========================================================

class ListingMechanism(Enum):
    LAUNCHPOOL = "Launchpool"
    HODLER = "HODLer"
    MEGADROP = "MegaDrop"


@dataclass
class UpcomingListing:
    """예정된 상장 이벤트."""
    token_symbol: str          # "MANTA"
    binance_pair: str          # "MANTAUSDT"
    listing_datetime: datetime  # UTC
    mechanism: ListingMechanism
    airdrop_pct_of_supply: float
    airdrop_value_usd: float
    announcement_url: str = ""

    @property
    def priority_score(self) -> float:
        """숏 우선순위 점수."""
        score = 0.0

        # 메커니즘 가중치
        if self.mechanism == ListingMechanism.HODLER:
            score += 30  # 가장 심각
        elif self.mechanism == ListingMechanism.LAUNCHPOOL:
            score += 25
        elif self.mechanism == ListingMechanism.MEGADROP:
            score -= 20  # 역사적으로 예외 (TAO)

        # 에어드롭 규모
        if self.airdrop_pct_of_supply >= 7.5:
            score += 35  # Hamster/DOGS/Catizen 급
        elif self.airdrop_pct_of_supply >= 5.0:
            score += 25
        elif self.airdrop_pct_of_supply >= 3.0:
            score += 15
        elif self.airdrop_pct_of_supply >= 1.0:
            score += 5

        # 에어드롭 달러 규모 (큰 에어드롭 = 더 큰 매도압)
        if self.airdrop_value_usd >= 100_000_000:
            score += 20
        elif self.airdrop_value_usd >= 50_000_000:
            score += 10

        return score


# ==========================================================
# LST-10 Ultimate Hybrid 시그널 엔진
# ==========================================================

class ListingCounterSignalEngine:
    """상장 당일 역포지션 시그널 생성."""

    def __init__(self, cfg: ListingBotConfig):
        self.cfg = cfg
        self.peak_prices: Dict[str, float] = {}  # 추적

    def should_enter_short(
        self,
        listing: UpcomingListing,
        current_price: float,
        current_time: datetime,
        btc_24h_change_pct: float,
    ) -> Tuple[bool, str]:
        """숏 진입 여부 판단."""
        reasons = []

        # 타이밍 검사
        time_since_listing = current_time - listing.listing_datetime
        if time_since_listing < timedelta(0):
            return False, "before_listing"

        max_entry_window = timedelta(
            minutes=self.cfg.entry_window_minutes_after_listing
        )
        if time_since_listing > max_entry_window:
            return False, f"entry_window_closed ({time_since_listing})"
        reasons.append(f"time_since_listing: {time_since_listing}")

        # 필터 1: 메커니즘 체크
        if listing.mechanism.value in self.cfg.exclude_mechanisms:
            return False, f"mechanism_excluded ({listing.mechanism.value})"
        if listing.mechanism.value not in self.cfg.preferred_mechanisms:
            return False, f"mechanism_not_preferred ({listing.mechanism.value})"
        reasons.append(f"mech {listing.mechanism.value}")

        # 필터 2: Airdrop % 체크
        if listing.airdrop_pct_of_supply < self.cfg.min_airdrop_pct:
            return False, (f"airdrop_too_small "
                            f"{listing.airdrop_pct_of_supply:.1f}%")
        reasons.append(f"airdrop {listing.airdrop_pct_of_supply:.1f}%")

        # 필터 3: BTC 환경 체크 (옵션)
        if (self.cfg.require_btc_not_strong_up
                and btc_24h_change_pct > 3.0):
            return False, f"btc_strong_up ({btc_24h_change_pct:.1f}%)"
        reasons.append(f"btc_24h {btc_24h_change_pct:.2f}%")

        # 필터 4: Peak 확인 (선택)
        if self.cfg.wait_for_peak:
            sym = listing.token_symbol
            if sym not in self.peak_prices:
                self.peak_prices[sym] = current_price
                return False, "first_observation (tracking peak)"
            prev_peak = self.peak_prices[sym]
            if current_price > prev_peak:
                self.peak_prices[sym] = current_price
                return False, f"still_rising (new peak ${current_price:.4f})"
            # Peak 형성 확인 (3% 하락)
            drawdown_from_peak = (prev_peak - current_price) / prev_peak
            if drawdown_from_peak < 0.03:
                return False, "peak_not_confirmed (dd < 3%)"
            reasons.append(f"peak_dd {drawdown_from_peak:.1%}")

        # 모든 조건 만족 → ENTER_SHORT
        return True, " | ".join(reasons)


# ==========================================================
# 포지션 관리
# ==========================================================

class Signal(Enum):
    HOLD = "hold"
    ENTER_SHORT = "enter_short"
    EXIT_SHORT = "exit_short"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"
    TIME_EXIT = "time_exit"


@dataclass
class ListingPosition:
    """오픈 포지션."""
    listing: UpcomingListing
    entry_price: float
    entry_time: datetime
    size_usd: float
    quantity: float
    leverage: int
    stop_loss_price: float
    take_profit_price: float

    def current_pnl_pct(self, current_price: float) -> float:
        return (self.entry_price - current_price) / self.entry_price

    def check_exit(self, current_price: float, now: datetime,
                    cfg: ListingBotConfig) -> Optional[Signal]:
        # 시간 초과
        hours_held = (now - self.entry_time).total_seconds() / 3600
        if hours_held >= cfg.max_hold_hours:
            return Signal.TIME_EXIT

        pnl = self.current_pnl_pct(current_price)

        # 손절 (숏: 가격 상승 = 손실)
        if pnl <= -cfg.stop_loss_pct:
            return Signal.STOP_LOSS

        # 익절 (숏: 가격 하락)
        if pnl >= cfg.take_profit_pct:
            return Signal.TAKE_PROFIT

        return None


# ==========================================================
# 거래 실행
# ==========================================================

class ListingTradeExecutor:
    def __init__(self, cfg: ListingBotConfig):
        self.cfg = cfg
        self.client: Optional[Client] = None
        self.positions: Dict[str, ListingPosition] = {}
        self._setup_client()

    def _setup_client(self):
        if not BINANCE_AVAILABLE:
            log.warning("python-binance not installed")
            return
        if self.cfg.api_key and self.cfg.api_secret:
            self.client = Client(
                self.cfg.api_key, self.cfg.api_secret,
                testnet=self.cfg.testnet
            )

    def get_balance_usdt(self) -> float:
        if self.cfg.dry_run or not self.client:
            return 10000.0
        try:
            balance = self.client.futures_account_balance()
            for b in balance:
                if b["asset"] == "USDT":
                    return float(b["balance"])
        except Exception:
            log.exception("Balance fetch failed")
        return 0.0

    def open_short(self, listing: UpcomingListing,
                    current_price: float, reason: str) -> Optional[ListingPosition]:
        if listing.binance_pair in self.positions:
            return None
        if len(self.positions) >= self.cfg.max_concurrent_positions:
            log.warning("Max positions reached")
            return None

        balance = self.get_balance_usdt()
        position_size = balance * self.cfg.max_position_pct_of_capital
        quantity = position_size / current_price

        stop_price = current_price * (1 + self.cfg.stop_loss_pct)
        tp_price = current_price * (1 - self.cfg.take_profit_pct)

        log.info(f"🔴 SHORT {listing.binance_pair} @ ${current_price:.4f}")
        log.info(f"   listing: {listing.listing_datetime}")
        log.info(f"   mechanism: {listing.mechanism.value}")
        log.info(f"   airdrop: {listing.airdrop_pct_of_supply:.1f}%"
                  f" (${listing.airdrop_value_usd/1e6:.1f}M)")
        log.info(f"   priority: {listing.priority_score:.1f}")
        log.info(f"   size: ${position_size:.2f} ({quantity:.2f} units)")
        log.info(f"   SL: ${stop_price:.4f}, TP: ${tp_price:.4f}")
        log.info(f"   reason: {reason}")

        if self.cfg.dry_run:
            log.info("   [DRY RUN]")
        elif self.client:
            try:
                self.client.futures_change_leverage(
                    symbol=listing.binance_pair, leverage=self.cfg.leverage
                )
                order = self.client.futures_create_order(
                    symbol=listing.binance_pair, side=SIDE_SELL,
                    type=ORDER_TYPE_MARKET, quantity=quantity,
                )
                log.info(f"   Order: {order['orderId']}")
                self.client.futures_create_order(
                    symbol=listing.binance_pair, side=SIDE_BUY,
                    type=FUTURE_ORDER_TYPE_STOP_MARKET,
                    stopPrice=stop_price, closePosition=True,
                )
            except Exception:
                log.exception("Order failed")
                return None

        position = ListingPosition(
            listing=listing, entry_price=current_price,
            entry_time=datetime.utcnow(),
            size_usd=position_size, quantity=quantity,
            leverage=self.cfg.leverage,
            stop_loss_price=stop_price, take_profit_price=tp_price,
        )
        self.positions[listing.binance_pair] = position
        return position

    def close_position(self, pair: str, current_price: float,
                        signal: Signal):
        if pair not in self.positions:
            return
        pos = self.positions[pair]
        pnl_pct = pos.current_pnl_pct(current_price)
        pnl_usd = pos.size_usd * pnl_pct

        log.info(f"🟢 CLOSE {pair} @ ${current_price:.4f}")
        log.info(f"   signal: {signal.name}")
        log.info(f"   PnL: {pnl_pct:+.2%} (${pnl_usd:+.2f})")

        if not self.cfg.dry_run and self.client:
            try:
                self.client.futures_create_order(
                    symbol=pair, side=SIDE_BUY,
                    type=ORDER_TYPE_MARKET, quantity=pos.quantity,
                )
            except Exception:
                log.exception("Close failed")

        del self.positions[pair]


# ==========================================================
# 메인 봇
# ==========================================================

class ListingCounterBot:
    """상장 당일 역포지션 봇."""

    def __init__(self, cfg: ListingBotConfig):
        self.cfg = cfg
        self.signal_engine = ListingCounterSignalEngine(cfg)
        self.executor = ListingTradeExecutor(cfg)
        self.schedule: List[UpcomingListing] = []

    def load_schedule(self, listings: List[UpcomingListing]):
        """상장 일정 로드."""
        self.schedule = sorted(listings, key=lambda x: -x.priority_score)
        log.info(f"Loaded {len(self.schedule)} upcoming listings")
        for lst in self.schedule[:5]:
            log.info(f"  {lst.token_symbol} {lst.listing_datetime}"
                      f" score={lst.priority_score:.0f}")

    def fetch_current_price(self, pair: str) -> Optional[float]:
        if not self.executor.client:
            return None
        try:
            ticker = self.executor.client.futures_symbol_ticker(symbol=pair)
            return float(ticker["price"])
        except Exception:
            return None

    def fetch_btc_24h_change(self) -> float:
        if not self.executor.client:
            return 0.0
        try:
            ticker = self.executor.client.get_ticker(symbol="BTCUSDT")
            return float(ticker["priceChangePercent"])
        except Exception:
            return 0.0

    def tick(self):
        """한 주기 실행."""
        now = datetime.utcnow()
        btc_change = self.fetch_btc_24h_change()

        # 1. 기존 포지션 청산 체크
        for pair in list(self.executor.positions.keys()):
            current = self.fetch_current_price(pair)
            if current is None:
                continue
            pos = self.executor.positions[pair]
            signal = pos.check_exit(current, now, self.cfg)
            if signal:
                self.executor.close_position(pair, current, signal)

        # 2. 진입 시그널 체크
        for listing in self.schedule:
            if listing.binance_pair in self.executor.positions:
                continue
            current = self.fetch_current_price(listing.binance_pair)
            if current is None:
                continue

            should_enter, reason = self.signal_engine.should_enter_short(
                listing, current, now, btc_change
            )
            if should_enter:
                self.executor.open_short(listing, current, reason)

    def run(self, interval_sec: int = 60):
        """무한 루프. 상장 당일은 1분 간격 권장."""
        log.info(f"🚀 Listing Day Bot started")
        log.info(f"   Mode: {'DRY-RUN' if self.cfg.dry_run else 'LIVE'}")
        log.info(f"   Testnet: {self.cfg.testnet}")
        log.info(f"   Interval: {interval_sec}s")

        while True:
            try:
                self.tick()
                time.sleep(interval_sec)
            except KeyboardInterrupt:
                log.info("Stopped")
                break
            except Exception:
                log.exception("Tick failed")
                time.sleep(interval_sec)


# ==========================================================
# 실행 예시
# ==========================================================

def load_sample_schedule() -> List[UpcomingListing]:
    """샘플 상장 일정 (실제는 Binance Announcement API 사용)."""
    return [
        UpcomingListing(
            token_symbol="SAMPLE1",
            binance_pair="SAMPLE1USDT",
            listing_datetime=datetime(2026, 5, 15, 10, 0),
            mechanism=ListingMechanism.HODLER,
            airdrop_pct_of_supply=5.0,
            airdrop_value_usd=85_000_000,
        ),
        UpcomingListing(
            token_symbol="SAMPLE2",
            binance_pair="SAMPLE2USDT",
            listing_datetime=datetime(2026, 5, 22, 10, 0),
            mechanism=ListingMechanism.LAUNCHPOOL,
            airdrop_pct_of_supply=3.5,
            airdrop_value_usd=42_000_000,
        ),
    ]


if __name__ == "__main__":
    cfg = ListingBotConfig(dry_run=True, testnet=True)
    bot = ListingCounterBot(cfg)
    bot.load_schedule(load_sample_schedule())
    bot.tick()
    log.info("Test tick completed")

    # 프로덕션:
    # bot.run(interval_sec=60)  # 1분 주기 (상장 당일)
