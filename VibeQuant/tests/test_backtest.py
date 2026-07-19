"""Educational backtest — deterministic, next-bar rules."""

from vi_browser.backtest import backtest, ma_cross_signal


def _mock_candles(n=80, start=100.0):
    out = []
    price = start
    for i in range(n):
        # gentle uptrend with a dip mid-way
        shock = 0.4 if i < 40 else (-0.3 if i < 55 else 0.5)
        close = max(1.0, price + shock)
        out.append(
            {
                "time": f"t{i:04d}",
                "open": price,
                "high": max(price, close) + 0.2,
                "low": min(price, close) - 0.2,
                "close": close,
                "volume": 1000,
            }
        )
        price = close
    return out


class TestBacktest:
    def test_always_flat_is_one_equity(self):
        c = _mock_candles(40)
        bt = backtest(c, [0] * len(c), fee_bps=0)
        assert bt["equity"][-1] == 1.0
        assert bt["metrics"]["total_return"] == 0.0

    def test_always_long_matches_buy_hold_minus_entry_fee(self):
        c = _mock_candles(50)
        closes = [x["close"] for x in c]
        sig = [1] * len(c)
        bt = backtest(c, sig, fee_bps=0)
        buy_hold = closes[-1] / closes[0] - 1.0
        # next-bar: miss first bar return vs pure buy-hold from bar0
        assert abs(bt["metrics"]["total_return"] - buy_hold) < 0.15

    def test_deterministic_twice(self):
        c = _mock_candles(60)
        sig = ma_cross_signal(c, 5, 15)
        a = backtest(c, sig, fee_bps=10)
        b = backtest(c, sig, fee_bps=10)
        assert a["metrics"] == b["metrics"]
        assert a["equity"] == b["equity"]

    def test_metrics_keys(self):
        c = _mock_candles(60)
        sig = ma_cross_signal(c, 5, 15)
        m = backtest(c, sig)["metrics"]
        for k in ("total_return", "mdd", "sharpe", "cagr", "bars", "fee_bps"):
            assert k in m
        assert m["mdd"] <= 0.0
        assert m["bars"] == 60

    def test_ma_cross_length(self):
        c = _mock_candles(40)
        sig = ma_cross_signal(c, 5, 10)
        assert len(sig) == 40
        assert set(sig) <= {0, 1}
