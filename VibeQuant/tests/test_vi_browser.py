"""Tests for vi_browser — Pyodide-safe SDK."""

import numpy as np
import pandas as pd
import pytest
from vi_browser.timeseries import (
    returns,
    volatility,
    moving_average,
    momentum,
    correlation,
    zscores,
    max_drawdown,
    beta,
    annualized_return,
    sharpe_ratio,
)


@pytest.fixture
def prices():
    idx = pd.date_range("2025-01-01", periods=252, freq="B")
    rng = np.random.default_rng(42)
    return pd.Series(100 * np.exp(np.cumsum(rng.normal(0, 0.01, 252))), index=idx)


class TestViBrowser:

    def test_returns_matches_pct_change(self, prices):
        r = returns(prices)
        expected = prices.pct_change()
        pd.testing.assert_series_equal(r.dropna(), expected.dropna(), check_names=False)

    def test_volatility_positive(self, prices):
        vol = volatility(prices, 22)
        assert (vol.dropna() > 0).all()

    def test_moving_average_matches_rolling_mean(self, prices):
        ma = moving_average(prices, 22)
        expected = prices.rolling(22).mean().dropna()
        common = ma.index.intersection(expected.index)
        assert len(common) > 100
        np.testing.assert_allclose(ma[common].values, expected[common].values)

    def test_momentum_matches_shift_ratio(self, prices):
        m = momentum(prices, 22)
        expected = prices / prices.shift(22) - 1.0
        pd.testing.assert_series_equal(m.dropna(), expected.dropna(), check_names=False)

    def test_self_correlation_is_one(self, prices):
        c = correlation(prices, prices, 22)
        np.testing.assert_allclose(c.dropna().values, 1.0, atol=1e-9)

    def test_zscores_bounded(self, prices):
        z = zscores(prices, 22)
        assert z.dropna().abs().max() < 10

    def test_max_drawdown_non_positive(self, prices):
        dd = max_drawdown(prices)
        assert (dd.dropna() <= 0).all()

    def test_self_beta_is_one(self, prices):
        b = beta(prices, prices, 22)
        np.testing.assert_allclose(b.dropna().values, 1.0, atol=1e-9)

    def test_annualized_return_reasonable(self, prices):
        r = annualized_return(prices)
        assert -1.0 < r < 2.0

    def test_sharpe_ratio_float(self, prices):
        s = sharpe_ratio(prices)
        assert isinstance(s, float)
        assert -5.0 < s < 5.0
