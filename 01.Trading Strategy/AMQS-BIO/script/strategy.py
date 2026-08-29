"""
AMQS-BIO: Adaptive Momentum Quant Strategy for US Biopharma
=====================================================================

AMQS 프레임워크(Kim, H., 2026 — vibe-investing)를 **미국 바이오·제약 섹터**로 확장한
sub-strategy. 치료영역별 서브테마 · 점프 리스크 필터 · XBI 레짐 · 금리 가중 25%.

바이오 확장 포인트:
  * Universe: Metabolic · Oncology · Immunology · Neuro · Rare · Virology · Tools · AI-Platform
  * Top-8 선별 + 서브테마당 최대 2종
  * 90일 단일일 급락/급등 사전 배제 · 갭 기준 포지션 캡
  * 벤치마크: XBI · IBB · SPY

Author: Built for Dennis Kim — extends vibe-investing/AMQS
License: MIT
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Universe — AI 인프라 밸류체인
# ---------------------------------------------------------------------------
# 사용자 요청 반영: 인텔(INTC) · AMD · 스토리지(MU/STX/WDC/PSTG) · 델(DELL) · 스노우플레이크(SNOW)
# + AI 데이터센터 구축에 직접 노출된 핵심 종목.

BIO_SUBTHEMES: Dict[str, List[str]] = {
    "Metabolic/Obesity": ["LLY", "NVO", "AMGN", "VKTX"],
    "Oncology":          ["MRK", "PFE", "EXEL", "INCY", "RVMD"],
    "Immunology/I&I":    ["ABBV", "ARGX", "APGE"],
    "Neuro":             ["BIIB", "AXSM", "ACAD"],
    "Rare/Genetic":      ["VRTX", "ALNY", "BMRN", "IONS"],
    "Virology":          ["GILD", "MRNA"],
    "Tools/Dx":          ["TMO", "DHR", "ILMN", "EXAS"],
    "AI-Platform":       ["TEM", "RXRX", "SDGR", "ABSI", "RLAY"],
}

BIO_TICKERS: List[str] = [t for grp in BIO_SUBTHEMES.values() for t in grp]

BIO_ETFS: List[str] = ["IBB", "XBI"]

LARGE_CAP_TICKERS = {
    "LLY", "NVO", "MRK", "PFE", "AMGN", "ABBV", "GILD", "VRTX", "ALNY",
    "TMO", "DHR", "BIIB", "REGN", "JNJ",
}

TICKER_SUBTHEME: Dict[str, str] = {
    t: theme for theme, names in BIO_SUBTHEMES.items() for t in names
}

# 방어 바스켓 (Risk-Off 50% / Defensive 100%)
DEFENSIVE_BASKET: List[str] = ["BRK-B", "WMT", "COST", "JNJ", "KO", "PG", "PEP"]

# 거시 참조 티커
MACRO_TICKERS = {
    "SPY": "SPY",
    "XBI": "XBI",
    "IBB": "IBB",
    "VIX": "^VIX",
    "TNX": "^TNX",
}


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class AMQSBioConfig:
    """AMQS-AI-Infra 파라미터의 바이오 재보정판."""

    # --- 4-Factor Momentum Composite weights -------------------------------
    w_factor_a: float = 0.35   # 12-1 momentum (Jegadeesh-Titman)
    w_factor_b: float = 0.35   # 6-1
    w_factor_c: float = 0.22   # 3-1
    w_factor_d: float = 0.08   # Vol-adjusted (inverse of 60D vol)

    # --- 100점 종합 채점 차원 가중치 ----------------------------------------
    #   모멘텀 35 / 단기 하락 매수 15 / 추세 품질 25 / 변동성 알파 15 / 거시 10
    w_momentum_signal: float = 0.30
    w_pullback_buy:    float = 0.10
    w_trend_quality:   float = 0.20
    w_vol_adj_alpha:   float = 0.15
    w_macro_fit:       float = 0.25

    # --- 사전 필터 ---------------------------------------------------------
    min_mkt_cap_usd: float = 5e9          # $10B (AI 인프라는 중형주 포함 → M7 의 $20B 보다 완화)
    min_avg_dollar_vol_30d: float = 50e6  # $100M
    max_vol_annualized: float = 0.70       # 100% (SMCI 등 고변동 허용, 단 상한)
    max_beta: float = 2.0
    max_single_day_drop_90d: float = -0.20
    max_single_day_gain_90d: float = 0.25 # 90일 내 -35%+ 단일일 폭락 배제

    # --- 단기 하락 매수(Pullback-in-Uptrend) 파라미터 -----------------------
    pullback_min_5d: float = -0.03
    pullback_min_20d: float = -0.05
    pullback_rsi_oversold: float = 30.0
    require_above_50dma: bool = True

    # --- 선별 & 포지션 사이징 ----------------------------------------------
    top_n: int = 8                        # Top-N 선별 (원본 AMQS 방식)
    max_per_subtheme: int = 2              # 서브테마당 최대 종목 수 (분산)
    sizing_mode: str = "tilted_equal"      # tilted_equal | vol_target | kelly_quarter
    tilt_strength: float = 1.5
    max_weight_per_name: float = 0.12
    min_weight_per_name: float = 0.04
    stop_loss_from_entry: float = -0.12    # -12% from rebalance entry
    max_drawdown_252d: float = -0.35       # AI 인프라 고변동 반영 (M7 -25% → -30%)

    # --- 거시 레짐 필터 ----------------------------------------------------
    risk_on_vix_max: float = 22.0
    risk_off_vix_min: float = 30.0
    risk_off_qqq_below_200ma_weeks: int = 1
    defensive_xbi_5d_threshold: float = -0.08

    # --- 리밸런싱 ----------------------------------------------------------
    min_cash_runway_months: int = 24
    event_blackout: List[str] = field(default_factory=list)
    blackout_action: str = "exclude"
    tnx_uptrend_lookback: int = 60
    tnx_uptrend_threshold: float = 0.15
    rate_penalty_smallcap: float = 0.60
    rate_penalty_largecap: float = 0.90
    assumed_worst_gap: float = -0.55
    max_portfolio_loss_per_event: float = 0.03
    use_gap_based_sizing: bool = True
    rebalance_band: float = 0.25
    min_holding_days: int = 10
    fx_cost_bps: float = 75.0
    relative_pullback_xbi_mult: float = 1.5

    rebalance_dow: int = 0                 # Monday open (Friday close signals)
    txn_cost_bps: float = 25.0
    slippage_bps: float = 20.0


# ---------------------------------------------------------------------------
# Helper indicators
# ---------------------------------------------------------------------------

def _safe_return(s: pd.Series, n: int) -> float:
    s = s.dropna()
    if len(s) <= n:
        return float("nan")
    return float(s.iloc[-1] / s.iloc[-n - 1] - 1.0)


def _factor_12_1(s: pd.Series) -> float:
    s = s.dropna()
    if len(s) < 253:
        return float("nan")
    return float(s.iloc[-21] / s.iloc[-252] - 1.0)


def _factor_6_1(s: pd.Series) -> float:
    s = s.dropna()
    if len(s) < 127:
        return float("nan")
    return float(s.iloc[-21] / s.iloc[-126] - 1.0)


def _factor_3_1(s: pd.Series) -> float:
    s = s.dropna()
    if len(s) < 64:
        return float("nan")
    return float(s.iloc[-21] / s.iloc[-63] - 1.0)


def _ann_vol(returns: pd.Series, n: int = 60) -> float:
    r = returns.dropna().iloc[-n:]
    if len(r) < n // 2:
        return float("nan")
    return float(r.std() * math.sqrt(252))


def _sharpe_like(returns: pd.Series, n: int = 126, rf_ann: float = 0.04) -> float:
    r = returns.dropna().iloc[-n:]
    if len(r) < n // 2 or r.std() == 0:
        return float("nan")
    daily_rf = (1 + rf_ann) ** (1 / 252) - 1
    return float((r.mean() - daily_rf) / r.std() * math.sqrt(252))


def _max_drawdown(prices: pd.Series, n: int = 252) -> float:
    s = prices.dropna().iloc[-n:]
    if len(s) < 30:
        return float("nan")
    peak = s.cummax()
    return float((s / peak - 1.0).min())


def _rsi(prices: pd.Series, n: int = 14) -> float:
    s = prices.dropna()
    if len(s) < n + 1:
        return float("nan")
    delta = s.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = gain / loss.replace(0, np.nan)
    return float(100 - 100 / (1 + rs.iloc[-1]))


def _dist_52w_high(prices: pd.Series) -> float:
    s = prices.dropna().iloc[-252:]
    if s.empty:
        return float("nan")
    return float(s.iloc[-1] / s.max() - 1.0)


def _above_ma(prices: pd.Series, n: int) -> bool:
    s = prices.dropna()
    if len(s) < n:
        return False
    return bool(s.iloc[-1] > s.iloc[-n:].mean())


def _positive_month_count(prices: pd.Series, months: int = 12) -> int:
    s = prices.dropna()
    if len(s) < months * 21 + 1:
        return 0
    monthly = s.iloc[::-21].iloc[: months + 1][::-1]
    rets = monthly.pct_change().dropna()
    return int((rets > 0).sum())


def _max_single_day_gain(prices: pd.Series, n: int = 90) -> float:
    s = prices.dropna().iloc[-n - 1:]
    if len(s) < 2:
        return 0.0
    return float(s.pct_change().max())


def _max_single_day_drop(prices: pd.Series, n: int = 90) -> float:
    s = prices.dropna().iloc[-n - 1:]
    if len(s) < 2:
        return 0.0
    return float(s.pct_change().min())


def _beta(returns: pd.Series, market_returns: pd.Series, n: int = 252) -> float:
    r = returns.dropna().iloc[-n:]
    m = market_returns.dropna().iloc[-n:]
    aligned = pd.concat([r, m], axis=1).dropna()
    if len(aligned) < 60 or aligned.iloc[:, 1].var() == 0:
        return float("nan")
    return float(aligned.cov().iloc[0, 1] / aligned.iloc[:, 1].var())


# ---------------------------------------------------------------------------
# Per-ticker measurement
# ---------------------------------------------------------------------------

@dataclass
class TickerMetrics:
    ticker: str
    price: float
    subtheme: str

    factor_a_12_1: float
    factor_b_6_1: float
    factor_c_3_1: float
    factor_d_inv_vol: float

    ret_5d: float
    ret_20d: float
    ret_60d: float
    vol_60d: float
    sharpe_6m: float
    mdd_12m: float
    rsi_14: float
    dist_52w_high: float
    above_50dma: bool
    above_200dma: bool
    positive_months_12m: int
    max_single_day_drop_90d: float
    beta_spy: float

    filtered_out: bool = False
    filter_reason: str = ""
    z_factor_a: float = 0.0
    z_factor_b: float = 0.0
    z_factor_c: float = 0.0
    z_factor_d: float = 0.0
    four_factor_composite: float = 0.0
    score_momentum: float = 0.0
    score_pullback: float = 0.0
    score_quality: float = 0.0
    score_vol_alpha: float = 0.0
    score_macro: float = 0.0
    total_score_100: float = 0.0
    selected: bool = False
    signal: str = "HOLD"
    reason: str = ""
    weight: float = 0.0


def measure(prices: pd.DataFrame, market: Optional[pd.Series] = None) -> List[TickerMetrics]:
    rets = prices.pct_change(fill_method=None)
    market_rets = market.pct_change(fill_method=None) if market is not None else None

    out: List[TickerMetrics] = []
    for t in prices.columns:
        p = prices[t]
        if p.dropna().empty:
            continue
        r = rets[t]
        vol = _ann_vol(r, 60)
        out.append(TickerMetrics(
            ticker=t,
            price=float(p.dropna().iloc[-1]),
            subtheme=TICKER_SUBTHEME.get(t, "Other"),
            factor_a_12_1=_factor_12_1(p),
            factor_b_6_1=_factor_6_1(p),
            factor_c_3_1=_factor_3_1(p),
            factor_d_inv_vol=(1.0 / vol) if vol and not math.isnan(vol) and vol > 0 else float("nan"),
            ret_5d=_safe_return(p, 5),
            ret_20d=_safe_return(p, 20),
            ret_60d=_safe_return(p, 60),
            vol_60d=vol,
            sharpe_6m=_sharpe_like(r, 126),
            mdd_12m=_max_drawdown(p, 252),
            rsi_14=_rsi(p, 14),
            dist_52w_high=_dist_52w_high(p),
            above_50dma=_above_ma(p, 50),
            above_200dma=_above_ma(p, 200),
            positive_months_12m=_positive_month_count(p, 12),
            max_single_day_drop_90d=_max_single_day_drop(p, 90),
            beta_spy=_beta(r, market_rets) if market_rets is not None else float("nan"),
        ))
    return out


# ---------------------------------------------------------------------------
# Pre-filter
# ---------------------------------------------------------------------------

def _max_single_day_gain(prices: pd.Series, n: int = 90) -> float:
    s = prices.dropna().iloc[-n - 1:]
    if len(s) < 2:
        return 0.0
    return float(s.pct_change().max())


def apply_bio_prefilter(
    metrics: List[TickerMetrics],
    config: AMQSBioConfig,
    market_caps: Optional[Dict[str, float]] = None,
    cash_runway_months: Optional[Dict[str, int]] = None,
    single_day_gains: Optional[Dict[str, float]] = None,
) -> None:
    market_caps = market_caps or {}
    cash_runway_months = cash_runway_months or {}
    single_day_gains = single_day_gains or {}
    for m in metrics:
        reasons: List[str] = []
        mc = market_caps.get(m.ticker)
        if mc is not None and mc < config.min_mkt_cap_usd:
            reasons.append(f"mkt_cap<${config.min_mkt_cap_usd / 1e9:.0f}B")
        if not math.isnan(m.vol_60d) and m.vol_60d > config.max_vol_annualized:
            reasons.append(f"vol60d>{config.max_vol_annualized:.0%}(점프변동)")
        if not math.isnan(m.beta_spy) and m.beta_spy > config.max_beta:
            reasons.append(f"beta>{config.max_beta:.1f}")
        if m.max_single_day_drop_90d < config.max_single_day_drop_90d:
            reasons.append(f"단일일{m.max_single_day_drop_90d:.0%}갭다운")
        gain = single_day_gains.get(m.ticker, 0.0)
        if gain > config.max_single_day_gain_90d:
            reasons.append(f"단일일+{gain:.0%}급등(이벤트잔상)")
        runway = cash_runway_months.get(m.ticker)
        if runway is not None and runway < config.min_cash_runway_months:
            reasons.append(f"runway {runway}M<{config.min_cash_runway_months}M")
        if m.ticker in config.event_blackout and config.blackout_action == "exclude":
            reasons.append("카탈리스트 블랙아웃")
        if reasons:
            m.filtered_out = True
            m.filter_reason = " · ".join(reasons)


# ---------------------------------------------------------------------------
# Scoring — 100점 종합
# ---------------------------------------------------------------------------

def _zscore(values: List[float]) -> List[float]:
    arr = np.array(values, dtype=float)
    mask = ~np.isnan(arr)
    if mask.sum() < 2:
        return [0.0] * len(values)
    mu = arr[mask].mean()
    sd = arr[mask].std(ddof=0)
    if sd == 0:
        return [0.0] * len(values)
    return [float((v - mu) / sd) if not math.isnan(v) else 0.0 for v in arr]


def _pullback_raw(m: TickerMetrics, config: AMQSBioConfig, xbi_ret_5d: float = 0.0) -> float:
    """단기 하락 매수(Pullback-in-Uptrend). 4중 게이트 + XBI 상대 낙폭 필터."""
    if math.isnan(m.factor_a_12_1) or m.factor_a_12_1 <= 0:
        return 0.0
    if math.isnan(m.factor_b_6_1) or m.factor_b_6_1 <= 0:
        return 0.0
    if config.require_above_50dma and not m.above_50dma:
        return 0.0

    dip_5d = max(0.0, -m.ret_5d) if not math.isnan(m.ret_5d) else 0.0
    dip_20d = max(0.0, -m.ret_20d) if not math.isnan(m.ret_20d) else 0.0

    if dip_5d < abs(config.pullback_min_5d) and dip_20d < abs(config.pullback_min_20d):
        return 0.0

    # 종목만 혼자 빠졌으면 기업 고유 악재 → DIP 금지
    if not math.isnan(m.ret_5d) and m.ret_5d < xbi_ret_5d * config.relative_pullback_xbi_mult:
        return 0.0

    trend_mult = 1.0 + min(max(m.factor_a_12_1, 0.0), 1.0)
    base = (0.7 * dip_5d + 0.3 * dip_20d) * trend_mult

    bonus = 0.0
    if not math.isnan(m.rsi_14):
        if m.rsi_14 <= config.pullback_rsi_oversold:
            bonus = 0.02 * (config.pullback_rsi_oversold - m.rsi_14) / config.pullback_rsi_oversold
        elif m.rsi_14 < 40:
            bonus = 0.005 * (40 - m.rsi_14) / 10

    return base + bonus


def macro_fit_bio(
    spy_above_200ma: bool,
    vix: float,
    tnx_60d_change: float,
    config: AMQSBioConfig,
) -> Dict[str, float]:
    base = 50.0
    if spy_above_200ma:
        base += 25.0
    if vix <= config.risk_on_vix_max:
        base += 15.0
    elif vix >= config.risk_off_vix_min:
        base -= 25.0
    rate_headwind = tnx_60d_change >= config.tnx_uptrend_threshold
    large = base * (config.rate_penalty_largecap if rate_headwind else 1.0)
    small = base * (config.rate_penalty_smallcap if rate_headwind else 1.0)
    return {
        "large_cap": max(0.0, min(100.0, large)),
        "small_cap": max(0.0, min(100.0, small)),
        "rate_headwind": float(rate_headwind),
    }


def gap_capped_weight(config: AMQSBioConfig) -> float:
    if not config.use_gap_based_sizing:
        return config.max_weight_per_name
    cap = config.max_portfolio_loss_per_event / abs(config.assumed_worst_gap)
    return min(config.max_weight_per_name, cap)


def score(
    metrics: List[TickerMetrics],
    config: AMQSBioConfig,
    macro_segments: Optional[Dict[str, float]] = None,
    xbi_ret_5d: float = 0.0,
) -> None:
    # 1. 4-Factor Composite (z-scores)
    a = [m.factor_a_12_1 for m in metrics]
    b = [m.factor_b_6_1 for m in metrics]
    c = [m.factor_c_3_1 for m in metrics]
    d = [m.factor_d_inv_vol for m in metrics]
    za, zb, zc, zd = _zscore(a), _zscore(b), _zscore(c), _zscore(d)
    for i, m in enumerate(metrics):
        m.z_factor_a, m.z_factor_b, m.z_factor_c, m.z_factor_d = za[i], zb[i], zc[i], zd[i]
        m.four_factor_composite = (
            config.w_factor_a * za[i] + config.w_factor_b * zb[i]
            + config.w_factor_c * zc[i] + config.w_factor_d * zd[i]
        )

    # 2. Dimension 1: 모멘텀 신호 강도 (35)
    for m in metrics:
        ffc_pct = (m.four_factor_composite + 2) / 4
        ffc_pct = max(0.0, min(1.0, ffc_pct))
        d52 = m.dist_52w_high
        if math.isnan(d52):
            high_pts = 0.5
        elif d52 >= -0.01:
            high_pts = 1.0
        elif d52 >= -0.05:
            high_pts = 1.0 - (abs(d52) - 0.01) / 0.04 * 0.5
        elif d52 >= -0.10:
            high_pts = 0.5 - (abs(d52) - 0.05) / 0.05 * 0.5
        else:
            high_pts = 0.0
        trend_pts = m.positive_months_12m / 12
        m.score_momentum = 100 * (0.60 * ffc_pct + 0.25 * high_pts + 0.15 * trend_pts)

    # 3. Dimension 2: 단기 하락 매수 모멘텀 (15)
    pullback_raw = [_pullback_raw(m, config, xbi_ret_5d) for m in metrics]
    pb_z = _zscore(pullback_raw)
    for i, m in enumerate(metrics):
        pb_pct = max(0.0, min(1.0, (pb_z[i] + 1) / 3))
        if pullback_raw[i] == 0:
            pb_pct = 0.0
        m.score_pullback = 100 * pb_pct

    # 4. Dimension 3: 추세 품질 & 가속도 (25)
    for m in metrics:
        above200_pts = 1.0 if m.above_200dma else 0.0
        accel_pts = 0.0
        if not math.isnan(m.factor_b_6_1) and not math.isnan(m.factor_c_3_1):
            accel_diff = m.factor_c_3_1 - m.factor_b_6_1 / 2
            accel_pts = max(0.0, min(1.0, (accel_diff + 0.1) / 0.2))
        m.score_quality = 100 * (0.6 * above200_pts + 0.4 * accel_pts)

    # 5. Dimension 4: 변동성 조정 알파 (15)
    sharpe_raw = [m.sharpe_6m for m in metrics]
    sh_z = _zscore(sharpe_raw)
    for i, m in enumerate(metrics):
        sh_pct = max(0.0, min(1.0, (sh_z[i] + 1.5) / 3))
        mdd_pts = 1.0
        if not math.isnan(m.mdd_12m):
            if m.mdd_12m >= -0.30:
                mdd_pts = 1.0
            elif m.mdd_12m >= -0.45:
                mdd_pts = 1.0 - (abs(m.mdd_12m) - 0.30) / 0.15
            else:
                mdd_pts = 0.0
        m.score_vol_alpha = 100 * (0.70 * sh_pct + 0.30 * mdd_pts)

    # 6. Dimension 5: 거시 환경 적합성 (25) — 세그먼트별
    macro_segments = macro_segments or {"large_cap": 70.0, "small_cap": 55.0}
    for m in metrics:
        seg = "large_cap" if m.ticker in LARGE_CAP_TICKERS else "small_cap"
        m.score_macro = macro_segments.get(seg, macro_segments.get("large_cap", 70.0))

    # 7. Total
    for m in metrics:
        m.total_score_100 = (
            config.w_momentum_signal * m.score_momentum
            + config.w_pullback_buy   * m.score_pullback
            + config.w_trend_quality  * m.score_quality
            + config.w_vol_adj_alpha  * m.score_vol_alpha
            + config.w_macro_fit      * m.score_macro
        )

    # 8. Signal classification
    for m in metrics:
        if m.filtered_out:
            m.signal = "EXCLUDED"
            m.reason = f"사전 필터 탈락: {m.filter_reason}"
            continue
        if not math.isnan(m.mdd_12m) and m.mdd_12m < config.max_drawdown_252d:
            m.signal = "EXIT"
            m.reason = f"12M MDD {m.mdd_12m:.1%} < {config.max_drawdown_252d:.0%} (장기 모멘텀 붕괴)"
            continue
        if m.score_pullback > 60 and m.score_momentum > 50:
            m.signal = "DIP_BUY"
            m.reason = (
                f"5D {m.ret_5d * 100:+.1f}% / 20D {m.ret_20d * 100:+.1f}% 단기 하락, "
                f"12-1 {m.factor_a_12_1 * 100:+.0f}% / 6-1 {m.factor_b_6_1 * 100:+.0f}% 추세 유지"
                f"{', RSI ' + format(m.rsi_14, '.0f') + ' 과매도' if not math.isnan(m.rsi_14) and m.rsi_14 < 35 else ''}"
            )
        elif m.total_score_100 >= 80:
            m.signal = "CENTER"
            m.reason = f"중심 포지션 (점수 {m.total_score_100:.0f}/100)"
        elif m.total_score_100 >= 65:
            m.signal = "SATELLITE"
            m.reason = f"위성 포지션 (점수 {m.total_score_100:.0f}/100)"
        elif m.total_score_100 >= 50:
            m.signal = "TACTICAL"
            m.reason = f"전술적 보유 (점수 {m.total_score_100:.0f}/100)"
        else:
            m.signal = "REDUCE"
            m.reason = f"비중 축소 (점수 {m.total_score_100:.0f}/100)"


# ---------------------------------------------------------------------------
# Selection (Top-N with subtheme cap) + Position sizing
# ---------------------------------------------------------------------------

def select_top_n(metrics: List[TickerMetrics], config: AMQSBioConfig) -> List[TickerMetrics]:
    """점수순 Top-N 선별. 서브테마당 max_per_subtheme 로 과집중 방지."""
    eligible = [m for m in metrics
                if m.signal not in ("EXIT", "EXCLUDED", "REDUCE")]
    eligible.sort(key=lambda m: m.total_score_100, reverse=True)

    selected: List[TickerMetrics] = []
    per_theme: Dict[str, int] = {}
    for m in eligible:
        if len(selected) >= config.top_n:
            break
        if per_theme.get(m.subtheme, 0) >= config.max_per_subtheme:
            continue
        selected.append(m)
        per_theme[m.subtheme] = per_theme.get(m.subtheme, 0) + 1
        m.selected = True
    return selected


def allocate(metrics: List[TickerMetrics], config: AMQSBioConfig,
             regime: str = "RISK_ON") -> None:
    """Top-N 선별 후 score-tilted allocation. 레짐이 총 투자비중 조절."""
    if regime == "RISK_OFF":
        invested = 0.50
    elif regime == "DEFENSIVE":
        invested = 0.00
    else:
        invested = 1.00

    max_w = gap_capped_weight(config)

    for m in metrics:
        m.selected = False
        m.weight = 0.0

    selected = select_top_n(metrics, config)
    if not selected or invested == 0:
        return

    n = len(selected)
    base = invested / n

    if config.sizing_mode == "tilted_equal":
        raw = np.array([
            max(0.0, base * (1.0 + config.tilt_strength * (m.total_score_100 - 65) / 30))
            for m in selected
        ])
    elif config.sizing_mode == "vol_target":
        inv_vol = np.array([
            1.0 / m.vol_60d if not math.isnan(m.vol_60d) and m.vol_60d > 0 else 0.0
            for m in selected
        ])
        raw = inv_vol / inv_vol.sum() * invested if inv_vol.sum() > 0 else np.array([base] * n)
    elif config.sizing_mode == "kelly_quarter":
        kelly = np.array([
            max(0.0, (m.total_score_100 - 50) / 100 / max(m.vol_60d ** 2, 0.01))
            for m in selected
        ])
        raw = kelly / kelly.sum() * invested / 4 if kelly.sum() > 0 else np.array([base] * n)
    else:
        raw = np.array([base] * n)

    raw = np.clip(raw, config.min_weight_per_name, max_w)
    if raw.sum() > 0:
        if config.use_gap_based_sizing:
            # 갭 캡: 종목별 상한 유지. 미투자분은 현금.
            pass
        else:
            raw = raw / raw.sum() * invested

    for m, w in zip(selected, raw):
        m.weight = float(w)


# ---------------------------------------------------------------------------
# Macro Regime Filter
# ---------------------------------------------------------------------------

@dataclass
class MacroRegime:
    label: str
    xbi_above_200ma: bool
    vix_level: float
    xbi_5d_return: float
    rate_headwind: bool
    reason: str


def detect_regime_bio(
    xbi: pd.Series,
    vix: pd.Series,
    config: AMQSBioConfig,
) -> MacroRegime:
    xbi = xbi.dropna()
    vix = vix.dropna()
    if len(xbi) < 200 or vix.empty:
        return MacroRegime("RISK_ON", True, 20.0, 0.0, False, "데이터 부족 — 기본 Risk-On")

    xbi_last = float(xbi.iloc[-1])
    xbi_200ma = float(xbi.iloc[-200:].mean())
    above_200ma = xbi_last > xbi_200ma
    vix_last = float(vix.iloc[-1])
    xbi_5d_ret = float(xbi.iloc[-1] / xbi.iloc[-6] - 1.0) if len(xbi) >= 6 else 0.0

    if xbi_5d_ret < config.defensive_xbi_5d_threshold:
        return MacroRegime(
            "DEFENSIVE", above_200ma, vix_last, xbi_5d_ret, False,
            f"XBI 5일 {xbi_5d_ret:.1%} 급락 → 방어 바스켓 전환",
        )

    if not above_200ma or vix_last > config.risk_off_vix_min:
        details = []
        if not above_200ma:
            details.append(f"XBI < 200MA ({xbi_last:.1f} vs {xbi_200ma:.1f})")
        if vix_last > config.risk_off_vix_min:
            details.append(f"VIX {vix_last:.1f} > {config.risk_off_vix_min:.0f}")
        return MacroRegime("RISK_OFF", above_200ma, vix_last, xbi_5d_ret, False, " · ".join(details))

    return MacroRegime(
        "RISK_ON", above_200ma, vix_last, xbi_5d_ret, False,
        f"XBI +200MA, VIX {vix_last:.1f}<{config.risk_off_vix_min:.0f}, 5D {xbi_5d_ret:+.1%}",
    )


def _tnx_change(tnx: Optional[pd.Series], lookback: int) -> float:
    if tnx is None:
        return 0.0
    s = tnx.dropna()
    if len(s) <= lookback:
        return 0.0
    return float(s.iloc[-1] / s.iloc[-lookback - 1] - 1.0)


# ---------------------------------------------------------------------------
# End-to-end pipeline
# ---------------------------------------------------------------------------

def run_amqs_bio(
    prices: pd.DataFrame,
    spy: Optional[pd.Series] = None,
    xbi: Optional[pd.Series] = None,
    vix: Optional[pd.Series] = None,
    tnx: Optional[pd.Series] = None,
    config: Optional[AMQSBioConfig] = None,
    market_caps: Optional[Dict[str, float]] = None,
    cash_runway_months: Optional[Dict[str, int]] = None,
) -> Tuple[pd.DataFrame, MacroRegime]:
    cfg = config or AMQSBioConfig()

    if xbi is not None and vix is not None:
        regime = detect_regime_bio(xbi, vix, cfg)
    else:
        regime = MacroRegime("RISK_ON", True, 20.0, 0.0, False, "거시 데이터 없음 — 기본 Risk-On")

    spy_above = True
    if spy is not None and len(spy.dropna()) >= 200:
        s = spy.dropna()
        spy_above = float(s.iloc[-1]) > float(s.iloc[-200:].mean())

    tnx_chg = _tnx_change(tnx, cfg.tnx_uptrend_lookback)
    macro_segments = macro_fit_bio(spy_above, regime.vix_level, tnx_chg, cfg)
    regime.rate_headwind = bool(macro_segments.get("rate_headwind"))

    xbi_ret_5d = regime.xbi_5d_return
    market = spy if spy is not None else xbi
    metrics = measure(prices, market=market)

    single_day_gains = {
        t: _max_single_day_gain(prices[t], 90)
        for t in prices.columns
        if t in prices and not prices[t].dropna().empty
    }
    apply_bio_prefilter(metrics, cfg, market_caps, cash_runway_months, single_day_gains)
    score(metrics, cfg, macro_segments=macro_segments, xbi_ret_5d=xbi_ret_5d)
    allocate(metrics, cfg, regime=regime.label)

    rows = []
    for m in metrics:
        rows.append({
            "ticker": m.ticker,
            "subtheme": m.subtheme,
            "price": round(m.price, 2),
            "factor_A_12-1": round(m.factor_a_12_1, 4) if not math.isnan(m.factor_a_12_1) else None,
            "factor_B_6-1":  round(m.factor_b_6_1, 4)  if not math.isnan(m.factor_b_6_1) else None,
            "factor_C_3-1":  round(m.factor_c_3_1, 4)  if not math.isnan(m.factor_c_3_1) else None,
            "vol_60d":       round(m.vol_60d, 4)       if not math.isnan(m.vol_60d) else None,
            "ret_5d":        round(m.ret_5d, 4)        if not math.isnan(m.ret_5d) else None,
            "ret_20d":       round(m.ret_20d, 4)       if not math.isnan(m.ret_20d) else None,
            "rsi_14":        round(m.rsi_14, 1)        if not math.isnan(m.rsi_14) else None,
            "dist_52w_high": round(m.dist_52w_high, 4) if not math.isnan(m.dist_52w_high) else None,
            "above_50dma":   m.above_50dma,
            "above_200dma":  m.above_200dma,
            "mdd_12m":       round(m.mdd_12m, 4)       if not math.isnan(m.mdd_12m) else None,
            "4factor_z":     round(m.four_factor_composite, 3),
            "score_momentum":round(m.score_momentum, 1),
            "score_pullback":round(m.score_pullback, 1),
            "score_quality": round(m.score_quality, 1),
            "score_vol_alpha":round(m.score_vol_alpha, 1),
            "score_macro":   round(m.score_macro, 1),
            "total_100":     round(m.total_score_100, 1),
            "selected":      m.selected,
            "signal":        m.signal,
            "weight":        round(m.weight, 4),
            "reason":        m.reason,
        })
    df = pd.DataFrame(rows).sort_values("total_100", ascending=False).reset_index(drop=True)
    return df, regime
