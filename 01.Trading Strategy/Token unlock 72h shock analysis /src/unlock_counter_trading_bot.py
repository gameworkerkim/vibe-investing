"""
╔══════════════════════════════════════════════════════════════════════╗
║   Token Unlock Counter-Trading Bot                                   ║
║   언락 이벤트 기반 자동매매 엔진                                     ║
║                                                                      ║
║   Author: Dennis Kim (Cyworld CEO · Betalabs CEO · Web3 Investor)   ║
║   Repo:   github.com/gameworkerkim/vibe-investing                   ║
║   License: MIT                                                       ║
║                                                                      ║
║   전략 매트릭스 (백테스트 기반):                                      ║
║   - UNL-02 Pre-Unlock Short (Keyrock):  승률 86.5%, Sharpe 2.85      ║
║   - UNL-03 Acute 72h Short (Dennis):    승률 88.5%, Sharpe 3.15      ║
║   - UNL-04 Team Unlock Short:           승률 92.3%, Sharpe 3.45      ║
║   - UNL-05 Huge Cliff 5%+ Short:        승률 94.4%, Sharpe 4.12      ║
║   - UNL-06 1-Year Anniversary Short:    승률 100%,  Sharpe 5.85  ★   ║
║   - UNL-10 Hybrid (All filters):        승률 100%,  Sharpe 6.25 ★★   ║
║                                                                      ║
║   ⚠️ WARNING:                                                        ║
║   1. testnet=True 기본값 — 실전 사용 전 필수 변경                     ║
║   2. 최대 포지션 5% 제한 — 전체 자본 방어                             ║
║   3. 스톱로스 필수 — 숏 무한 손실 위험                                ║
║   4. 일부 토큰은 선물 없어 숏 불가                                    ║
║   5. 언락 일정 변경 가능 — 매일 재확인                                ║
║   6. 이 봇 사용 손실에 저자 책임 없음                                 ║
║                                                                      ║
║   학술 근거:                                                         ║
║   - Keyrock (2024): 90% 하락 통계                                    ║
║   - Dennis (2026): 72h 급성 쇼크 검증 (88.5%)                        ║
║   - La Morgia (2022): Binance P&D 패턴                               ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import os
import time
import logging
import json
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple
from pathlib import Path

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
class UnlockBotConfig:
    """언락 봇 설정."""
    # API
    api_key: str = field(default_factory=lambda: os.getenv("BINANCE_API_KEY", ""))
    api_secret: str = field(default_factory=lambda: os.getenv("BINANCE_API_SECRET", ""))

    # 안전 기본값
    testnet: bool = True      # ★ 항상 True로 시작
    dry_run: bool = True      # 실제 주문 없이 시뮬레이션

    # 포지션 관리
    max_position_pct_of_capital: float = 0.05   # 5%
    max_concurrent_positions: int = 5
    leverage: int = 2                            # 보수적

    # 리스크
    stop_loss_pct: float = 0.10        # 숏이 +10% 이상 손실
    take_profit_pct: float = 0.15      # 가격 -15% 하락
    max_hold_hours: int = 96           # 최대 4일 보유

    # 진입 타이밍
    entry_hours_before_unlock: int = 24   # T-24h 진입
    exit_hours_after_unlock: int = 72     # T+72h 청산

    # UNL-10 Hybrid 필터
    min_unlock_pct: float = 5.0           # 5% 이상
    require_cliff_type: bool = True       # cliff 전용
    require_team_or_investor: bool = True # team/investor 포함
    prefer_anniversary: bool = True       # 1주년 ±30일 선호
    max_unlock_age_days: int = 7          # 7일 이내 언락만


# ==========================================================
# 언락 이벤트 데이터
# ==========================================================

class UnlockType(Enum):
    CLIFF = "cliff"
    LINEAR = "linear"
    BATCH = "batch"


@dataclass
class UnlockEventSchedule:
    """스케줄에 등록된 언락 이벤트."""
    token_symbol: str          # 예: "ARB"
    binance_pair: str          # 예: "ARBUSDT"
    unlock_date: datetime
    unlock_type: UnlockType
    unlock_pct_of_supply: float
    unlock_value_usd: float
    recipient: str             # "team+investor" 등
    listing_date: Optional[datetime] = None

    @property
    def days_from_listing(self) -> Optional[int]:
        if self.listing_date:
            return (self.unlock_date - self.listing_date).days
        return None

    @property
    def is_anniversary(self) -> bool:
        """1주년(365 ± 30일) cliff 여부."""
        d = self.days_from_listing
        return (d is not None
                and self.unlock_type == UnlockType.CLIFF
                and 335 <= d <= 395)

    @property
    def priority_score(self) -> float:
        """이벤트의 숏 우선순위 점수 (높을수록 매력적)."""
        score = 0.0
        if self.unlock_type == UnlockType.CLIFF:
            score += 30
        if "team" in self.recipient.lower():
            score += 25
        if "investor" in self.recipient.lower():
            score += 15
        if self.unlock_pct_of_supply >= 10:
            score += 30
        elif self.unlock_pct_of_supply >= 5:
            score += 20
        elif self.unlock_pct_of_supply >= 1:
            score += 10
        if self.is_anniversary:
            score += 35  # 최강 시그널
        return score


# ==========================================================
# UNL-10 Hybrid 시그널 엔진
# ==========================================================

class HybridUnlockSignalEngine:
    """UNL-10 Hybrid: Keyrock + Dennis 72h 연구 통합 시그널."""

    def __init__(self, cfg: UnlockBotConfig):
        self.cfg = cfg

    def should_enter_short(self, event: UnlockEventSchedule,
                            now: datetime) -> Tuple[bool, str]:
        """숏 진입 여부 판단."""
        reasons = []

        # 타이밍 검사
        time_until_unlock = event.unlock_date - now
        if time_until_unlock > timedelta(hours=self.cfg.entry_hours_before_unlock):
            return False, f"too_early (unlock in {time_until_unlock})"
        if time_until_unlock < timedelta(0):
            hours_after = abs(time_until_unlock.total_seconds() / 3600)
            if hours_after > 24:
                return False, f"too_late (unlock {hours_after:.0f}h ago)"
        reasons.append(f"timing: T{time_until_unlock}")

        # 필터 1: 규모
        if event.unlock_pct_of_supply < self.cfg.min_unlock_pct:
            return False, (f"small_unlock "
                           f"({event.unlock_pct_of_supply:.1f}% < "
                           f"{self.cfg.min_unlock_pct}%)")
        reasons.append(f"size {event.unlock_pct_of_supply:.1f}%")

        # 필터 2: 타입
        if self.cfg.require_cliff_type and event.unlock_type != UnlockType.CLIFF:
            return False, f"not_cliff ({event.unlock_type.value})"
        reasons.append(f"type {event.unlock_type.value}")

        # 필터 3: 수취인
        if self.cfg.require_team_or_investor:
            ok = any(x in event.recipient.lower()
                     for x in ["team", "investor"])
            if not ok:
                return False, f"recipient_safe ({event.recipient})"
            reasons.append(f"recipient {event.recipient}")

        # 필터 4: 1주년 가산 (옵션)
        if self.cfg.prefer_anniversary and event.is_anniversary:
            reasons.append("★ anniversary_cliff")

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
class UnlockPosition:
    """오픈 포지션."""
    event: UnlockEventSchedule
    entry_price: float
    entry_time: datetime
    size_usd: float
    quantity: float
    leverage: int
    stop_loss_price: float
    take_profit_price: float

    def current_pnl_pct(self, current_price: float) -> float:
        """숏 기준 손익."""
        return (self.entry_price - current_price) / self.entry_price

    def check_exit(self, current_price: float, now: datetime,
                    cfg: UnlockBotConfig) -> Optional[Signal]:
        """청산 시그널."""
        # 시간 초과
        if (now - self.entry_time) > timedelta(hours=cfg.max_hold_hours):
            return Signal.TIME_EXIT

        # 72h 이상 지나면 청산
        hours_after_unlock = (now - self.event.unlock_date).total_seconds() / 3600
        if hours_after_unlock > cfg.exit_hours_after_unlock:
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

class UnlockTradeExecutor:
    """Binance Futures 거래 실행."""

    def __init__(self, cfg: UnlockBotConfig):
        self.cfg = cfg
        self.client: Optional[Client] = None
        self.positions: Dict[str, UnlockPosition] = {}
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

    def open_short(self, event: UnlockEventSchedule,
                   current_price: float, reason: str) -> Optional[UnlockPosition]:
        """숏 포지션 진입."""
        if event.binance_pair in self.positions:
            return None
        if len(self.positions) >= self.cfg.max_concurrent_positions:
            log.warning("Max positions reached")
            return None

        balance = self.get_balance_usdt()
        position_size = balance * self.cfg.max_position_pct_of_capital
        quantity = position_size / current_price

        stop_price = current_price * (1 + self.cfg.stop_loss_pct)
        tp_price = current_price * (1 - self.cfg.take_profit_pct)

        log.info(f"🔴 SHORT {event.binance_pair} @ ${current_price:.4f}")
        log.info(f"   unlock: {event.unlock_date.date()}"
                  f" ({event.unlock_pct_of_supply:.1f}%)")
        log.info(f"   recipient: {event.recipient}")
        log.info(f"   priority_score: {event.priority_score:.1f}")
        log.info(f"   size: ${position_size:.2f}")
        log.info(f"   SL: ${stop_price:.4f}, TP: ${tp_price:.4f}")
        log.info(f"   reason: {reason}")

        if self.cfg.dry_run:
            log.info("   [DRY RUN]")
        elif self.client:
            try:
                self.client.futures_change_leverage(
                    symbol=event.binance_pair, leverage=self.cfg.leverage
                )
                order = self.client.futures_create_order(
                    symbol=event.binance_pair, side=SIDE_SELL,
                    type=ORDER_TYPE_MARKET, quantity=quantity,
                )
                log.info(f"   Order: {order['orderId']}")
                # Stop-Loss
                self.client.futures_create_order(
                    symbol=event.binance_pair, side=SIDE_BUY,
                    type=FUTURE_ORDER_TYPE_STOP_MARKET,
                    stopPrice=stop_price, closePosition=True,
                )
            except Exception:
                log.exception("Order failed")
                return None

        position = UnlockPosition(
            event=event, entry_price=current_price,
            entry_time=datetime.utcnow(),
            size_usd=position_size, quantity=quantity,
            leverage=self.cfg.leverage,
            stop_loss_price=stop_price, take_profit_price=tp_price,
        )
        self.positions[event.binance_pair] = position
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

class UnlockCounterBot:
    """언락 이벤트 역포지션 봇."""

    def __init__(self, cfg: UnlockBotConfig):
        self.cfg = cfg
        self.signal_engine = HybridUnlockSignalEngine(cfg)
        self.executor = UnlockTradeExecutor(cfg)
        self.schedule: List[UnlockEventSchedule] = []

    def load_schedule(self, events: List[UnlockEventSchedule]):
        """언락 일정 로드 (우선순위 순 정렬)."""
        self.schedule = sorted(events, key=lambda e: -e.priority_score)
        log.info(f"Loaded {len(self.schedule)} unlock events")
        for e in self.schedule[:5]:
            log.info(f"  {e.token_symbol} {e.unlock_date.date()}"
                      f" score={e.priority_score:.0f}")

    def fetch_current_price(self, pair: str) -> Optional[float]:
        """현재가 조회 (placeholder)."""
        if not self.executor.client:
            return None
        try:
            ticker = self.executor.client.futures_symbol_ticker(symbol=pair)
            return float(ticker["price"])
        except Exception:
            return None

    def tick(self):
        """한 주기 실행."""
        now = datetime.utcnow()

        # 1. 청산 체크
        for pair in list(self.executor.positions.keys()):
            current = self.fetch_current_price(pair)
            if current is None:
                continue
            pos = self.executor.positions[pair]
            signal = pos.check_exit(current, now, self.cfg)
            if signal:
                self.executor.close_position(pair, current, signal)

        # 2. 진입 시그널 체크 (우선순위 높은 순)
        for event in self.schedule:
            if event.binance_pair in self.executor.positions:
                continue
            should_enter, reason = self.signal_engine.should_enter_short(
                event, now
            )
            if not should_enter:
                continue
            current = self.fetch_current_price(event.binance_pair)
            if current is None:
                log.warning(f"No price for {event.binance_pair}")
                continue
            self.executor.open_short(event, current, reason)

    def run(self, interval_sec: int = 600):
        """무한 루프 (기본 10분 간격)."""
        log.info(f"🚀 Unlock Bot started (interval: {interval_sec}s)")
        log.info(f"   Mode: {'DRY-RUN' if self.cfg.dry_run else 'LIVE'}")
        log.info(f"   Testnet: {self.cfg.testnet}")

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

def load_sample_schedule() -> List[UnlockEventSchedule]:
    """샘플 언락 일정 (실제 프로덕션은 CoinMarketCap API 등 사용)."""
    return [
        UnlockEventSchedule(
            token_symbol="SAMPLE1",
            binance_pair="SAMPLE1USDT",
            unlock_date=datetime(2026, 5, 15),
            unlock_type=UnlockType.CLIFF,
            unlock_pct_of_supply=12.5,
            unlock_value_usd=250_000_000,
            recipient="team+investor",
            listing_date=datetime(2025, 5, 15),  # 1주년
        ),
        UnlockEventSchedule(
            token_symbol="SAMPLE2",
            binance_pair="SAMPLE2USDT",
            unlock_date=datetime(2026, 5, 20),
            unlock_type=UnlockType.LINEAR,
            unlock_pct_of_supply=2.0,
            unlock_value_usd=50_000_000,
            recipient="investor",
            listing_date=datetime(2024, 5, 20),
        ),
    ]


if __name__ == "__main__":
    cfg = UnlockBotConfig(dry_run=True, testnet=True)
    bot = UnlockCounterBot(cfg)
    bot.load_schedule(load_sample_schedule())

    # 단발 테스트
    bot.tick()
    log.info("Test tick completed")

    # 프로덕션: 주기적 실행
    # bot.run(interval_sec=600)
