"""
engine/ackman_framework.py — 빌 애크먼 5-Step 정량 스코어링

'Ackman undervalued quant prompt.md' Section 4의 5단계 프레임워크를
Quality / Valuation / Catalyst / Risk 각 0~25점, 총 0~100점으로 수치화한다.

원문의 Risk Score는 "낮을수록 좋음"으로 표기되어 있으나, 4개 구성 점수를
그대로 합산해 총점(/100)을 만드는 출력 형식과 모순되므로, 여기서는
Risk Score를 "하방 방어력(안전마진)" 점수로 해석해 높을수록 안전 =
총점에 유리하도록 구현한다 (md 1.2절 검증 노트 참고).

특수상황(FNMA/FMCC류, is_special_situation=True) 종목은 Valuation 단계에서
FCF Yield 국채 대비 2배 / 내재가치 대비 50% 할인 기준을 적용하고,
일반 우량주는 국채 수익률 이상 + 완화된 할인 기준을 적용한다 (md 1.2, 2단계 이원화).
"""

import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional

_NUMERIC_FIELDS = (
    "price", "pct_from_52w_high", "pct_from_52w_low", "rsi_14",
    "revenue", "operating_income", "net_income", "fcf", "debt_ratio",
    "per", "forward_per", "pbr", "psr", "ev_ebitda", "fcf_yield", "roe", "roic",
    "revenue_growth_yoy", "net_income_growth_yoy",
)


def _safe_float(v) -> Optional[float]:
    """외부 데이터 소스가 'Infinity'/'NaN' 같은 비수치 문자열을 섞어 줄 수 있어
    (예: yfinance가 FNMA/FMCC류 극단적 재무구조 종목에 반환) 방어적으로 정제한다."""
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


@dataclass
class AckmanMetrics:
    ticker: str
    market: str  # 'KR' | 'US'
    is_special_situation: bool = False

    # 가격/기술적
    price: Optional[float] = None
    pct_from_52w_high: Optional[float] = None   # 음수 (예: -0.25 = 고점 대비 -25%)
    pct_from_52w_low: Optional[float] = None
    above_50ma: Optional[bool] = None
    above_200ma: Optional[bool] = None
    rsi_14: Optional[float] = None

    # 재무/밸류에이션
    revenue: Optional[float] = None
    operating_income: Optional[float] = None
    net_income: Optional[float] = None
    fcf: Optional[float] = None
    debt_ratio: Optional[float] = None  # %
    per: Optional[float] = None
    forward_per: Optional[float] = None
    pbr: Optional[float] = None
    psr: Optional[float] = None
    ev_ebitda: Optional[float] = None
    fcf_yield: Optional[float] = None   # 소수 (0.05 = 5%)
    roe: Optional[float] = None         # 소수
    roic: Optional[float] = None        # 소수
    revenue_growth_yoy: Optional[float] = None
    net_income_growth_yoy: Optional[float] = None

    risk_free_rate: float = 0.045  # 10년 국채 수익률 기본값 4.5%

    # 뉴스/촉매
    news_avg_sentiment: float = 0.0
    news_mentions: int = 0
    news_headlines: List[str] = field(default_factory=list)

    def __post_init__(self):
        for name in _NUMERIC_FIELDS:
            setattr(self, name, _safe_float(getattr(self, name)))


@dataclass
class ScoreResult:
    ticker: str
    quality_score: float
    quality_notes: List[str]
    valuation_score: float
    valuation_notes: List[str]
    catalyst_score: float
    catalyst_notes: List[str]
    risk_score: float
    risk_notes: List[str]
    total_score: float
    grade: str
    position_weight_pct: float


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _score_quality(m: AckmanMetrics) -> (float, List[str]):
    notes = []
    score = 0.0

    # 해자 proxy: 영업이익률
    op_margin = (m.operating_income / m.revenue) if (m.operating_income and m.revenue) else None
    if op_margin is not None:
        if op_margin >= 0.25:
            score += 8; notes.append(f"영업이익률 {op_margin:.1%} — 강한 해자 시그널")
        elif op_margin >= 0.15:
            score += 5; notes.append(f"영업이익률 {op_margin:.1%} — 보통 수준의 해자")
        else:
            score += 2; notes.append(f"영업이익률 {op_margin:.1%} — 해자 약함")
    else:
        notes.append("영업이익률 데이터 없음 — 해자 평가 보류")

    # 현금 창출력: FCF 마진
    fcf_margin = (m.fcf / m.revenue) if (m.fcf and m.revenue) else None
    if fcf_margin is not None:
        if fcf_margin >= 0.20:
            score += 8; notes.append(f"FCF 마진 {fcf_margin:.1%} — 우수한 현금창출력")
        elif fcf_margin >= 0.10:
            score += 5; notes.append(f"FCF 마진 {fcf_margin:.1%} — 보통")
        elif fcf_margin > 0:
            score += 2; notes.append(f"FCF 마진 {fcf_margin:.1%} — 취약")
        else:
            notes.append("FCF 마진 음수 — 현금창출력 위험")
    else:
        notes.append("FCF 데이터 없음")

    # 재무 건전성: 부채비율
    if m.debt_ratio is not None:
        if m.debt_ratio < 50:
            score += 6; notes.append(f"부채비율 {m.debt_ratio:.0f}% — 건전")
        elif m.debt_ratio < 150:
            score += 4; notes.append(f"부채비율 {m.debt_ratio:.0f}% — 보통")
        else:
            score += 1; notes.append(f"부채비율 {m.debt_ratio:.0f}% — 위험 수준")
    else:
        notes.append("부채비율 데이터 없음")

    # 경영진 자본배분 proxy: ROE
    if m.roe is not None:
        if m.roe >= 0.20:
            score += 3; notes.append(f"ROE {m.roe:.1%} — 우수한 자본배분")
        elif m.roe >= 0.10:
            score += 2; notes.append(f"ROE {m.roe:.1%} — 양호")
        else:
            score += 1; notes.append(f"ROE {m.roe:.1%} — 미흡")
    else:
        notes.append("ROE 데이터 없음")

    return round(_clamp(score, 0, 25), 1), notes


def _score_valuation(m: AckmanMetrics) -> (float, List[str]):
    notes = []
    score = 0.0
    rfr = m.risk_free_rate or 0.045

    # FCF Yield 기준 (이원화)
    if m.fcf_yield is not None:
        hurdle = rfr * 2 if m.is_special_situation else rfr
        ratio = m.fcf_yield / hurdle if hurdle else 0
        pts = _clamp(ratio * 10, 0, 12)
        score += pts
        track = "특수상황(국채×2 기준)" if m.is_special_situation else "우량주(국채 기준)"
        notes.append(f"FCF Yield {m.fcf_yield:.1%} vs 허들 {hurdle:.1%} ({track}) → {pts:.1f}/12점")
    else:
        notes.append("FCF Yield 데이터 없음")

    # PER 절대 수준 (5년 평균 미가용 시 절대 기준으로 근사)
    if m.per is not None and m.per > 0:
        ref = 40 if m.is_special_situation else 25
        pts = _clamp((ref - m.per) / ref * 7, 0, 7) if m.per < ref else 0
        score += pts
        notes.append(f"PER {m.per:.1f}배 (기준 {ref}배) → {pts:.1f}/7점")
    else:
        notes.append("PER 데이터 없음/적자")

    # PBR / EV-EBITDA 보조 지표
    aux = 0.0
    if m.pbr is not None and m.pbr > 0:
        aux += _clamp((5 - m.pbr) / 5 * 3, 0, 3)
    if m.ev_ebitda is not None and m.ev_ebitda > 0:
        aux += _clamp((20 - m.ev_ebitda) / 20 * 3, 0, 3)
    score += aux
    notes.append(f"PBR/EV-EBITDA 보조점수 → {aux:.1f}/6점")

    return round(_clamp(score, 0, 25), 1), notes


CATALYST_KEYWORDS = ["buyback", "activist", "acquisition", "merger", "spin-off",
                      "spinoff", "restructuring", "regulator", "settlement",
                      "conservatorship", "dividend increase", "ceo"]


def _score_catalyst(m: AckmanMetrics) -> (float, List[str]):
    notes = []
    score = 0.0

    # 일시적 mispricing 스윗스팟: 고점 대비 -15%~-45% 하락 구간을 애크먼식 기회로 간주
    if m.pct_from_52w_high is not None:
        dd = -m.pct_from_52w_high  # 양수화
        if 0.15 <= dd <= 0.45:
            score += 10; notes.append(f"52주 고점 대비 {dd:.1%} 하락 — 애크먼식 '일시적 공포' 구간")
        elif 0.05 <= dd < 0.15:
            score += 5; notes.append(f"52주 고점 대비 {dd:.1%} 하락 — 경미한 조정")
        elif dd > 0.45:
            score += 3; notes.append(f"52주 고점 대비 {dd:.1%} 하락 — 구조적 훼손 가능성, 신중 필요")
        else:
            score += 2; notes.append("52주 고점 근접 — 명백한 저평가 촉매 부재")
    else:
        notes.append("52주 고점 데이터 없음")

    # 특수상황(정책/규제 촉매)
    if m.is_special_situation:
        score += 8
        notes.append("특수상황 종목 — 정책/규제 촉매 보유 (예: conservatorship 해제)")

    # 뉴스 헤드라인 내 촉매 키워드
    hits = [kw for kw in CATALYST_KEYWORDS
            if any(kw in h.lower() for h in m.news_headlines)]
    if hits:
        pts = _clamp(len(hits) * 2, 0, 7)
        score += pts
        notes.append(f"뉴스 촉매 키워드 감지: {', '.join(hits[:5])} → {pts:.1f}점")
    else:
        notes.append("뉴스에서 명시적 촉매 키워드 미감지")

    return round(_clamp(score, 0, 25), 1), notes


def _score_risk(m: AckmanMetrics) -> (float, List[str]):
    """하방 방어력 점수 (높을수록 안전 = 총점에 유리)."""
    notes = []
    score = 0.0

    # 레버리지 리스크
    if m.debt_ratio is not None:
        pts = _clamp((150 - m.debt_ratio) / 150 * 8, 0, 8)
        score += pts
        notes.append(f"부채비율 {m.debt_ratio:.0f}% → 레버리지 안전점수 {pts:.1f}/8")
    else:
        notes.append("부채비율 미확인 — 레버리지 리스크 판단 보류")

    # Value Trap 리스크: 성장률이 마이너스면서 밸류에이션만 싼 경우 감점
    growth = m.revenue_growth_yoy
    if growth is not None:
        if growth >= 0.05:
            score += 8; notes.append(f"매출 성장률 {growth:.1%} — Value Trap 리스크 낮음")
        elif growth >= 0:
            score += 5; notes.append(f"매출 성장률 {growth:.1%} — 보통")
        else:
            score += 1; notes.append(f"매출 성장률 {growth:.1%} — Value Trap 가능성 주의")
    else:
        notes.append("매출 성장률 데이터 없음")

    # 사업 리스크 proxy: 영업이익률 안정성
    op_margin = (m.operating_income / m.revenue) if (m.operating_income and m.revenue) else None
    if op_margin is not None and op_margin > 0:
        score += 5; notes.append(f"영업이익 흑자 (마진 {op_margin:.1%}) — 사업 리스크 낮음")
    elif op_margin is not None:
        notes.append("영업적자 — 사업 리스크 높음")
    else:
        notes.append("영업이익률 데이터 없음")

    # 극단적 낙폭 리스크(구조적 훼손 가능성)
    if m.pct_from_52w_high is not None:
        dd = -m.pct_from_52w_high
        if dd <= 0.45:
            score += 4; notes.append("낙폭이 구조적 붕괴 수준은 아님")
        else:
            notes.append(f"52주 고점 대비 {dd:.1%} 낙폭 — 구조적 리스크 가능성")

    return round(_clamp(score, 0, 25), 1), notes


def _grade(total: float) -> str:
    if total >= 85:
        return "Strong Buy"
    if total >= 70:
        return "Buy"
    if total >= 60:
        return "Watch"
    return "Pass"


def _position_weight(total: float) -> float:
    if total < 60:
        return 0.0
    return round(_clamp((total - 60) / 40 * 20, 0, 20), 1)


def score_ticker(m: AckmanMetrics) -> ScoreResult:
    q, q_notes = _score_quality(m)
    v, v_notes = _score_valuation(m)
    c, c_notes = _score_catalyst(m)
    r, r_notes = _score_risk(m)
    total = round(q + v + c + r, 1)

    return ScoreResult(
        ticker=m.ticker,
        quality_score=q, quality_notes=q_notes,
        valuation_score=v, valuation_notes=v_notes,
        catalyst_score=c, catalyst_notes=c_notes,
        risk_score=r, risk_notes=r_notes,
        total_score=total,
        grade=_grade(total),
        position_weight_pct=_position_weight(total),
    )


def rank_top_picks(results: List[ScoreResult], top_n: int = 7) -> List[ScoreResult]:
    """애크먼의 '초집중' 철학에 따라 상위 N개(기본 7개)만 반환."""
    return sorted(results, key=lambda r: r.total_score, reverse=True)[:top_n]
