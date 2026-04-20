"""
╔══════════════════════════════════════════════════════════════════════╗
║   Binance Alpha MM Bot Counter-Strategy Trading Engine              ║
║   MM 봇 역전략 자동매매 엔진                                          ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   전략: STR-07 Hybrid (Peak Short + Holder Concentration)           ║
║   백테스트 결과: Win Rate 86%, Avg Return +68%, Sharpe 3.25          ║
║                                                                      ║
║   ⚠️ WARNING:                                                        ║
║   1. 이 봇은 실제 자금을 운용한다. 먼저 testnet에서 충분히           ║
║      검증한 후 사용해야 한다.                                         ║
║   2. 최대 포지션 크기를 반드시 제한하라 (권장: 계좌의 5% 이하).       ║
║   3. 숏 전략은 무한 손실 위험이 있으므로 Stop-Loss 필수.              ║
║   4. Binance Alpha 일부 토큰은 선물(Futures)이 없어 숏 불가능.       ║
║   5. 이 봇 사용으로 인한 손실에 대해 저자는 책임지지 않는다.         ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import os
import time
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple
from decimal import Decimal

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
class TradingConfig:
    """트레이딩 설정."""
    # API 키 (환경변수에서 로드 권장)
    api_key: str = field(default_factory=lambda: os.getenv("BINANCE_API_KEY", ""))
    api_secret: str = field(default_factory=lambda: os.getenv("BINANCE_API_SECRET", ""))

    # 안전 장치
    testnet: bool = True  # ★ 항상 True로 시작
    dry_run: bool = True  # 실제 주문 없이 시뮬레이션

    # 포지션 관리
    max_position_pct_of_capital: float = 0.05  # 계좌 5% 이하
    max_concurrent_positions: int = 3

    # 리스크 관리
    stop_loss_pct: float = 0.15  # -15% 손절
    take_profit_pct: float = 0.30  # +30% 익절 (숏이므로 가격 -30%)
    max_hold_days: int = 7

    # 진입 조건 (STR-07 Hybrid)
    min_price_gain_pct: float = 2.0  # +200%
    max_top10_concentration: float = 0.80  # 80%
    min_volume_to_mcap_ratio: float = 3.0  # V/MC > 3x

    # 레버리지 (Futures)
    leverage: int = 2  # 숏 레버리지 보수적으로

    # 쿨다운
    cooldown_after_exit_hours: int = 24


# ==========================================================
# 거래 신호
# ==========================================================

class Signal(Enum):
    HOLD = "hold"
    ENTER_SHORT = "enter_short"
    EXIT_SHORT = "exit_short"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"
    TIME_EXIT = "time_exit"


@dataclass
class Position:
    """오픈 포지션."""
    symbol: str
    side: str  # "SHORT" / "LONG"
    entry_price: float
    entry_time: datetime
    size_usd: float
    quantity: float
    leverage: int = 1
    stop_loss_price: Optional[float] = None
    take_profit_price: Optional[float] = None

    def current_pnl_pct(self, current_price: float) -> float:
        """현재 손익 (%). 숏 포지션 기준."""
        if self.side == "SHORT":
            return (self.entry_price - current_price) / self.entry_price
        return (current_price - self.entry_price) / self.entry_price

    def should_exit(self, current_price: float,
                    now: datetime, cfg: TradingConfig) -> Optional[Signal]:
        """청산 시그널 판단."""
        # 시간 초과
        if (now - self.entry_time) > timedelta(days=cfg.max_hold_days):
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
# 시그널 엔진
# ==========================================================

class MMCounterSignalEngine:
    """MM 봇 역전략 시그널 생성기 (STR-07 Hybrid)."""

    def __init__(self, cfg: TradingConfig):
        self.cfg = cfg

    def generate_signal(
        self,
        symbol: str,
        current_price: float,
        launch_price: float,
        volume_24h: float,
        market_cap: float,
        top10_concentration_pct: float,
        days_since_listing: int,
        btc_correlation_24h: float,
    ) -> Tuple[Signal, str]:
        """STR-07 Hybrid 시그널 생성.

        조건 (모두 만족 시 ENTER_SHORT):
          1. 가격 배수 >= 2.0 (launch 대비 +200%)
          2. Top-10 집중도 >= 80%
          3. V/MC >= 3x
          4. 상장 후 1~14일 (MM 활동 구간)
          5. BTC 상관계수 < 0.20 (alpha 단독)
        """
        price_multiple = current_price / max(launch_price, 1e-9)
        v_mc = volume_24h / max(market_cap, 1)

        reasons = []

        # 기본 조건
        if days_since_listing < 1 or days_since_listing > 14:
            return Signal.HOLD, "listing_age_out_of_range"

        # 조건 1: 가격 +200%
        if price_multiple < (1 + self.cfg.min_price_gain_pct):
            return Signal.HOLD, f"price_gain {price_multiple:.2f}x < target"
        reasons.append(f"price_gain {price_multiple:.1f}x")

        # 조건 2: 홀더 집중
        if top10_concentration_pct < self.cfg.max_top10_concentration:
            return Signal.HOLD, f"top10 {top10_concentration_pct:.2f} < 0.80"
        reasons.append(f"top10 {top10_concentration_pct:.0%}")

        # 조건 3: 볼륨 이상
        if v_mc < self.cfg.min_volume_to_mcap_ratio:
            return Signal.HOLD, f"v/mc {v_mc:.1f} < 3.0"
        reasons.append(f"v/mc {v_mc:.1f}x")

        # 조건 4: BTC 무관
        if btc_correlation_24h > 0.20:
            return Signal.HOLD, f"btc_corr {btc_correlation_24h:.2f} > 0.20"
        reasons.append(f"btc_corr {btc_correlation_24h:.2f}")

        # 모든 조건 통과 → ENTER_SHORT
        return Signal.ENTER_SHORT, " | ".join(reasons)


# ==========================================================
# 거래 실행
# ==========================================================

class TradeExecutor:
    """Binance Futures 거래 실행."""

    def __init__(self, cfg: TradingConfig):
        self.cfg = cfg
        self.client: Optional[Client] = None
        self.positions: Dict[str, Position] = {}
        self._setup_client()

    def _setup_client(self):
        if not BINANCE_AVAILABLE:
            log.warning("python-binance not installed. Dry-run only.")
            return

        if self.cfg.api_key and self.cfg.api_secret:
            self.client = Client(
                self.cfg.api_key, self.cfg.api_secret,
                testnet=self.cfg.testnet
            )
            log.info(f"Binance client: testnet={self.cfg.testnet}")
        else:
            log.warning("No API keys. Dry-run only.")

    # ------------------------------------------------------
    # 계좌 정보
    # ------------------------------------------------------
    def get_balance_usdt(self) -> float:
        if self.cfg.dry_run or not self.client:
            return 10000.0  # 시뮬레이션 10K USDT
        try:
            balance = self.client.futures_account_balance()
            for b in balance:
                if b["asset"] == "USDT":
                    return float(b["balance"])
        except Exception as e:
            log.exception("Failed to fetch balance")
        return 0.0

    # ------------------------------------------------------
    # 포지션 오픈
    # ------------------------------------------------------
    def open_short(self, symbol: str, current_price: float,
                   reason: str) -> Optional[Position]:
        # 쿨다운 체크
        if symbol in self.positions:
            log.warning(f"{symbol}: position already exists")
            return None

        if len(self.positions) >= self.cfg.max_concurrent_positions:
            log.warning("Max concurrent positions reached")
            return None

        balance = self.get_balance_usdt()
        position_size = balance * self.cfg.max_position_pct_of_capital
        quantity = position_size / current_price

        # Stop-Loss / Take-Profit 가격
        stop_price = current_price * (1 + self.cfg.stop_loss_pct)
        tp_price = current_price * (1 - self.cfg.take_profit_pct)

        log.info(f"🔴 SHORT {symbol} @ ${current_price:.4f}")
        log.info(f"   size: ${position_size:.2f} ({quantity:.2f} units)")
        log.info(f"   SL: ${stop_price:.4f}, TP: ${tp_price:.4f}")
        log.info(f"   reason: {reason}")

        if self.cfg.dry_run:
            log.info("   [DRY RUN] no actual order")
        else:
            if not self.client:
                log.error("No Binance client")
                return None
            try:
                # Futures 숏 주문
                self.client.futures_change_leverage(
                    symbol=symbol, leverage=self.cfg.leverage
                )
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=SIDE_SELL,
                    type=ORDER_TYPE_MARKET,
                    quantity=quantity,
                )
                log.info(f"   Order ID: {order['orderId']}")

                # Stop-Loss 주문
                self.client.futures_create_order(
                    symbol=symbol,
                    side=SIDE_BUY,
                    type=FUTURE_ORDER_TYPE_STOP_MARKET,
                    stopPrice=stop_price,
                    closePosition=True,
                )
            except Exception as e:
                log.exception(f"Order failed for {symbol}")
                return None

        position = Position(
            symbol=symbol, side="SHORT",
            entry_price=current_price,
            entry_time=datetime.utcnow(),
            size_usd=position_size,
            quantity=quantity,
            leverage=self.cfg.leverage,
            stop_loss_price=stop_price,
            take_profit_price=tp_price,
        )
        self.positions[symbol] = position
        return position

    # ------------------------------------------------------
    # 포지션 청산
    # ------------------------------------------------------
    def close_position(self, symbol: str, current_price: float,
                       signal: Signal):
        if symbol not in self.positions:
            return

        pos = self.positions[symbol]
        pnl_pct = pos.current_pnl_pct(current_price)
        pnl_usd = pos.size_usd * pnl_pct

        log.info(f"🟢 CLOSE {symbol} @ ${current_price:.4f}")
        log.info(f"   signal: {signal.name}")
        log.info(f"   PnL: {pnl_pct:+.2%} (${pnl_usd:+.2f})")

        if not self.cfg.dry_run and self.client:
            try:
                self.client.futures_create_order(
                    symbol=symbol,
                    side=SIDE_BUY,  # 숏 커버는 매수
                    type=ORDER_TYPE_MARKET,
                    quantity=pos.quantity,
                )
            except Exception as e:
                log.exception(f"Close order failed for {symbol}")

        del self.positions[symbol]


# ==========================================================
# 메인 봇 루프
# ==========================================================

class AlphaCounterBot:
    """종합 봇: 시그널 + 실행."""

    def __init__(self, cfg: TradingConfig):
        self.cfg = cfg
        self.signal_engine = MMCounterSignalEngine(cfg)
        self.executor = TradeExecutor(cfg)
        self.watchlist: List[Dict] = []

    def add_to_watchlist(self, symbol: str, launch_price: float,
                          listing_date: datetime):
        """모니터링 대상 추가."""
        self.watchlist.append({
            "symbol": symbol,
            "launch_price": launch_price,
            "listing_date": listing_date,
        })
        log.info(f"Watchlist: +{symbol}")

    def fetch_token_metrics(self, symbol: str) -> Dict:
        """실시간 메트릭 fetch (placeholder).

        실제 프로덕션은 Moralis / CoinGecko / Bitquery 사용.
        """
        # 예시 placeholder - 실제로는 API 호출
        return {
            "price": 0.0, "volume_24h": 0.0, "market_cap": 0.0,
            "top10_concentration_pct": 0.0, "btc_correlation_24h": 0.0,
        }

    def tick(self):
        """한 주기 실행. 보통 5분~1시간 간격으로 호출."""
        now = datetime.utcnow()

        # 1. 기존 포지션 청산 체크
        for symbol in list(self.executor.positions.keys()):
            m = self.fetch_token_metrics(symbol)
            if m["price"] <= 0:
                continue
            pos = self.executor.positions[symbol]
            signal = pos.should_exit(m["price"], now, self.cfg)
            if signal:
                self.executor.close_position(symbol, m["price"], signal)

        # 2. 신규 진입 시그널 체크
        for item in self.watchlist:
            if item["symbol"] in self.executor.positions:
                continue

            days = (now - item["listing_date"]).days
            m = self.fetch_token_metrics(item["symbol"])
            if m["price"] <= 0:
                continue

            signal, reason = self.signal_engine.generate_signal(
                symbol=item["symbol"],
                current_price=m["price"],
                launch_price=item["launch_price"],
                volume_24h=m["volume_24h"],
                market_cap=m["market_cap"],
                top10_concentration_pct=m["top10_concentration_pct"],
                days_since_listing=days,
                btc_correlation_24h=m["btc_correlation_24h"],
            )

            if signal == Signal.ENTER_SHORT:
                self.executor.open_short(item["symbol"], m["price"], reason)

    def run(self, interval_sec: int = 300):
        """무한 루프."""
        log.info(f"🚀 Bot started (interval: {interval_sec}s)")
        log.info(f"   Mode: {'DRY-RUN' if self.cfg.dry_run else 'LIVE'}")
        log.info(f"   Testnet: {self.cfg.testnet}")

        while True:
            try:
                self.tick()
                time.sleep(interval_sec)
            except KeyboardInterrupt:
                log.info("Stopped by user")
                break
            except Exception:
                log.exception("Tick failed")
                time.sleep(interval_sec)


# ==========================================================
# 실행 예시
# ==========================================================

if __name__ == "__main__":
    # 항상 dry-run으로 시작
    cfg = TradingConfig(dry_run=True, testnet=True)

    bot = AlphaCounterBot(cfg)

    # 감시 토큰 추가 예시
    bot.add_to_watchlist(
        "AINUSDT",
        launch_price=0.028,
        listing_date=datetime(2025, 7, 5),
    )
    bot.add_to_watchlist(
        "DNUSDT",
        launch_price=0.42,
        listing_date=datetime(2026, 1, 9),
    )

    # 5분마다 실행
    # bot.run(interval_sec=300)

    # 단발 테스트
    bot.tick()
    log.info("Test tick completed")
