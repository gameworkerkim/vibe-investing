"""
AMQS-BIO: Adaptive Momentum Quant Strategy for US Biopharma
===========================================================

AMQS-AI-Infra (Kim, H., 2026 — vibe-investing) 를 미국 바이오제약 섹터로 확장한
sub-strategy. 기존 strategy.py 의 지표 헬퍼를 재사용하되, **바이오 고유의 점프
리스크(binary event risk)** 를 반영해 사전필터·채점 가중치·포지션 사이징을 재설계.

AI-Infra 대비 핵심 변경 4가지
------------------------------
1) 점프 필터 (NEW / 가장 중요)
   AI 인프라는 확산과정(diffusion)이지만 바이오는 점프과정(jump)이다.
   -12% 손절은 임상 실패 갭에 무력하다 (시가 -55% 체결).
   → 사후 손절 대신 **사전 배제**: 90일 내 단일일 급락/급등 임계를 강하게 조인다.
   → 단일일 +25% 급등도 배제한다. 12-1 모멘텀이 추세가 아니라 이벤트 잔상이면
      z-score 가 오염되기 때문이다 (예: uniQure 2026-06-17 +78%).

2) 거시 가중치 10% → 25%
   바이오는 롱듀레이션 자산이라 금리 방향이 지배 변수다. AI 인프라에서 거시는
   보조 필터였지만, 바이오에서는 팩터 그 자체다.

3) 서브테마 캡 4종 → 2종, Top-N 10 → 8
   GLP-1, 유전자치료 등은 카탈리스트 날 상관계수가 1에 수렴한다.
   AI 인프라의 서브테마 상관보다 훨씬 극단적이라 캡을 더 조인다.

4) 노트레이드 밴드 (NEW)
   AI-Infra 백테스트 회전율이 ~1,384%/년이었다. 한국 개인 기준
   (20~30bps + 환전 50~100bps + 양도세 22%) 에서는 알파가 비용에 전부 잠식된다.
   → 목표비중 상대편차 25% 미만이면 리밸런싱 스킵.

Author: Built for Dennis Kim — extends vibe-investing/AMQS
License: MIT
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional

# 기존 AMQS 엔진의 지표 헬퍼 재사용
from .strategy import (  # noqa: F401
    TickerMetrics,
    measure,
    _zscore,
    _max_single_day_drop,
)


# ---------------------------------------------------------------------------
# Universe — 미국 바이오제약 밸류체인
# ---------------------------------------------------------------------------
# 설계 원칙: AI-Infra 가 "AI 데이터센터 CAPEX" 라는 단일 드라이버로 묶였던 것과 달리,
# 바이오는 치료영역(modality/indication)이 상관구조를 결정한다. 서브테마를
# 치료영역 기준으로 자른다.

BIO_SUBTHEMES: Dict[str, List[str]] = {
    "Metabolic/Obesity": ["LLY", "NVO", "AMGN", "VKTX"],      # GLP-1 · 인크레틴
    "Oncology":          ["MRK", "PFE", "EXEL", "INCY", "RVMD"],
    "Immunology/I&I":    ["ABBV", "ARGX", "APGE"],
    "Neuro":             ["BIIB", "AXSM", "ACAD"],
    "Rare/Genetic":      ["VRTX", "ALNY", "BMRN", "IONS"],
    "Virology":          ["GILD", "MRNA"],
    "Tools/Dx":          ["TMO", "DHR", "ILMN", "EXAS"],
    "AI-Platform":       ["TEM", "RXRX", "SDGR", "ABSI", "RLAY"],  # 대부분 사전필터 탈락 예상
}

BIO_TICKERS: List[str] = [t for grp in BIO_SUBTHEMES.values() for t in grp]

TICKER_SUBTHEME: Dict[str, str] = {
    t: theme for theme, names in BIO_SUBTHEMES.items() for t in names
}

# 벤치마크: 대형주 가중(IBB) vs 동일가중 소형주(XBI) 의 스프레드가
# 금리 레짐의 프록시로 작동한다. 둘 다 추적한다.
BENCHMARKS = ["IBB", "XBI", "SPY"]

# 거시 참조 — AI-Infra 는 QQQ 기준이었으나 바이오는 SPY + 금리가 본질
MACRO_TICKERS = {
    "SPY": "SPY",
    "VIX": "^VIX",
    "TNX": "^TNX",   # 10Y yield x 10 — 바이오에서 가장 중요한 단일 변수
}


@dataclass
class AMQSBioConfig:
    """AMQS-AI-Infra 파라미터의 바이오 재보정판."""

    # --- 4-Factor Momentum Composite -----------------------------------
    # 바이오 모멘텀은 카탈리스트 주도라 지속기간이 짧다.
    # 12-1 비중을 낮추고 6-1/3-1 로 이동 (AI-Infra: 0.50/0.30/0.15/0.05)
    w_factor_a: float = 0.35   # 12-1
    w_factor_b: float = 0.35   # 6-1
    w_factor_c: float = 0.22   # 3-1
    w_factor_d: float = 0.08   # Vol-adjusted

    # --- 100점 채점 차원 가중치 -----------------------------------------
    # 거시 10 -> 25 로 대폭 상향. 바이오는 듀레이션 자산이다.
    w_momentum_signal: float = 0.30   # AI-Infra 0.35
    w_pullback_buy:    float = 0.10   # AI-Infra 0.15
    w_trend_quality:   float = 0.20   # AI-Infra 0.25
    w_vol_adj_alpha:   float = 0.15   # 동일
    w_macro_fit:       float = 0.25   # AI-Infra 0.10  <-- 핵심 변경

    # --- 사전 필터 (점프 리스크 반영) -----------------------------------
    min_mkt_cap_usd: float = 5e9            # AI-Infra $10B -> 바이오 중형주 허용
    min_avg_dollar_vol_30d: float = 50e6
    max_vol_annualized: float = 0.70        # AI-Infra 1.00 -> 강화.
                                            # 바이오 고변동은 '추세 변동'이 아니라
                                            # '점프 변동'이라 모멘텀 신호가 아니다.
    max_beta: float = 2.0

    # 점프 필터 — 본 전략의 핵심
    max_single_day_drop_90d: float = -0.20  # AI-Infra -0.35 -> 대폭 강화
    max_single_day_gain_90d: float = 0.25   # NEW. 급등 잔상 배제
    min_cash_runway_months: int = 24        # NEW. 금리상승기 희석 리스크 게이트
                                            # (yfinance 미제공 -> LLM/수동 입력)

    # 이벤트 블랙아웃 — PDUFA / phase 3 판독 예정 종목 (수동 또는 LLM 공급)
    event_blackout: List[str] = field(default_factory=list)
    blackout_action: str = "exclude"        # exclude | halve

    # --- 선별 & 포지션 사이징 -------------------------------------------
    top_n: int = 8                          # AI-Infra 10
    max_per_subtheme: int = 2               # AI-Infra 4 -> 카탈리스트 상관 반영
    max_weight_per_name: float = 0.12       # AI-Infra 0.18
    min_weight_per_name: float = 0.04
    stop_loss_from_entry: float = -0.12     # 유지하되 '갭에는 무력'을 전제로 운용
    max_drawdown_252d: float = -0.35

    # 갭 기준 사이징: 최악 갭 가정 하에서 포트 손실 한도를 역산
    assumed_worst_gap: float = -0.55        # 임상 실패 시 전형적 시가 갭
    max_portfolio_loss_per_event: float = 0.03
    use_gap_based_sizing: bool = True

    # --- 거시 레짐 (금리 항 강화) ----------------------------------------
    risk_on_vix_max: float = 22.0
    risk_off_vix_min: float = 28.0
    # NEW: 10Y 금리 추세. 바이오에서는 VIX 보다 중요하다.
    tnx_uptrend_lookback: int = 60
    tnx_uptrend_threshold: float = 0.15     # 60일 +15% 상승 시 금리 역풍 판정
    rate_penalty_smallcap: float = 0.60     # 소형/무수익 종목 거시점수 승수
    rate_penalty_largecap: float = 0.90     # 현금창출 대형주 승수

    # --- 리밸런싱 (비용 방어) --------------------------------------------
    rebalance_dow: int = 0
    rebalance_band: float = 0.25            # NEW. 상대편차 25% 미만이면 스킵
    min_holding_days: int = 10              # NEW. 최소 보유기간
    txn_cost_bps: float = 25.0              # 한국 개인 현실 반영 (기관 5bps 아님)
    slippage_bps: float = 20.0
    fx_cost_bps: float = 75.0               # NEW. 환전 비용


# ---------------------------------------------------------------------------
# 바이오 전용 사전필터
# ---------------------------------------------------------------------------

def _max_single_day_gain(prices, n: int = 90) -> float:
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
    """AI-Infra 사전필터 + 점프 리스크 게이트.

    single_day_gains 는 measure() 단계에서 _max_single_day_gain 으로 산출해 주입.
    cash_runway_months 는 yfinance 로 안 나오므로 LLM/수동 공급.
    """
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

        if not math.isnan(m.beta_qqq) and m.beta_qqq > config.max_beta:
            reasons.append(f"beta>{config.max_beta:.1f}")

        # --- 점프 필터 ---
        if m.max_single_day_drop_90d < config.max_single_day_drop_90d:
            reasons.append(f"단일일{m.max_single_day_drop_90d:.0%}갭다운")

        gain = single_day_gains.get(m.ticker, 0.0)
        if gain > config.max_single_day_gain_90d:
            reasons.append(f"단일일+{gain:.0%}급등(이벤트잔상)")

        # --- 자금조달 게이트 ---
        runway = cash_runway_months.get(m.ticker)
        if runway is not None and runway < config.min_cash_runway_months:
            reasons.append(f"runway {runway}M<{config.min_cash_runway_months}M")

        # --- 이벤트 블랙아웃 ---
        if m.ticker in config.event_blackout and config.blackout_action == "exclude":
            reasons.append("카탈리스트 블랙아웃")

        if reasons:
            m.filtered_out = True
            m.filter_reason = " · ".join(reasons)


# ---------------------------------------------------------------------------
# 갭 기준 포지션 사이징
# ---------------------------------------------------------------------------

def gap_capped_weight(config: AMQSBioConfig) -> float:
    """손절이 아니라 '사이즈'로 갭 리스크를 통제한다.

    -12% 손절은 임상 실패 갭(-55%)에서 체결되지 않는다. 유일하게 신뢰 가능한
    통제 수단은 사전 비중 상한이다.

        max_weight = 이벤트당 허용 포트 손실 / 최악 갭 크기
        예) 3% / 55% = 5.45%
    """
    if not config.use_gap_based_sizing:
        return config.max_weight_per_name
    cap = config.max_portfolio_loss_per_event / abs(config.assumed_worst_gap)
    return min(config.max_weight_per_name, cap)


# ---------------------------------------------------------------------------
# 거시 적합성 (금리 조건부)
# ---------------------------------------------------------------------------

def macro_fit_bio(
    spy_above_200ma: bool,
    vix: float,
    tnx_60d_change: float,
    config: AMQSBioConfig,
) -> Dict[str, float]:
    """세그먼트별 거시 점수(0~100)를 반환.

    핵심: 바이오에서는 금리 방향이 VIX 보다 지배적이다. 같은 거시환경이라도
    현금창출 대형주와 무수익 소형주의 듀레이션 노출이 완전히 다르므로
    단일 점수가 아니라 세그먼트별 점수를 낸다.
    """
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


if __name__ == "__main__":
    cfg = AMQSBioConfig()
    print(f"Universe: {len(BIO_TICKERS)} tickers / {len(BIO_SUBTHEMES)} subthemes")
    print(f"갭 기준 최대 비중: {gap_capped_weight(cfg):.2%} "
          f"(명목 상한 {cfg.max_weight_per_name:.0%})")
    print("현 거시(2026-08-29 가정: SPY>200MA, VIX 저점, 10Y 상승추세):")
    for k, v in macro_fit_bio(True, 15.0, 0.18, cfg).items():
        print(f"  {k}: {v}")
