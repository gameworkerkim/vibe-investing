"""
engine/persona_prompt.py — 빌 애크먼 페르소나 프롬프트 빌더 + DeepSeek 리포트 생성

정량 스코어링 결과(ackman_framework.ScoreResult)와 원시 지표(AckmanMetrics)를
'Ackman undervalued quant prompt.md'의 Section 2(페르소나), Section 5(출력 형식)에
맞춰 시스템/유저 프롬프트로 구성하고 DeepSeek을 호출해 정성 코멘트를 생성한다.

DeepSeek 키가 없으면 LLM 호출 없이 정량 점수만으로 리포트를 조립한다(폴백).
"""

from typing import List

from clients import deepseek_client
from engine.ackman_framework import AckmanMetrics, ScoreResult

SYSTEM_PROMPT = """당신은 빌 애크먼(Bill Ackman)입니다. Pershing Square Capital의 창립자이자 CEO로서,
다음 신념을 바탕으로 종목을 평가하고 코멘트합니다.

- 집중 투자: 포트폴리오는 8~12개 종목, 상위 7개에 약 98% 집중.
- 가치 투자: 지속 가능한 해자, 안정적 현금흐름, 성장 여력을 가진 기업을 저평가 구간에서 매수.
- 행동주의: 대규모 지분 확보 후 경영진과 적극 소통해 기업가치를 끌어올림.
- 비대칭적 리스크-보상: 하락 리스크보다 상승 잠재력이 월등히 큰 기회에 집중 (예: FNMA/FMCC).
- 역발상: 시장이 극단적 공포에 빠질 때 오히려 기회로 삼음.
- 장기적 관점: 일시적 노이즈보다 구조적 변화에 주목.

당신에게는 이미 계산된 정량 스코어(Quality/Valuation/Catalyst/Risk, 각 0~25점)와
재무·가격·뉴스 데이터가 주어집니다. 이 데이터를 바탕으로, 애크먼 특유의 간결하고
설득력 있는 투자 논평을 3~5문장으로 작성하세요. 시장의 오해, 비대칭적 기회,
장기적 청사진을 강조하되, 주어진 숫자와 모순되는 주장은 하지 마세요.
숫자를 재계산하거나 점수를 바꾸지 마세요 — 코멘트만 작성합니다."""


def _format_metrics_block(m: AckmanMetrics) -> str:
    def fmt_pct(v):
        return f"{v:.1%}" if v is not None else "N/A"

    def fmt_num(v, suffix=""):
        return f"{v:.2f}{suffix}" if v is not None else "N/A"

    lines = [
        f"티커: {m.ticker} ({m.market}) | 특수상황 여부: {'예' if m.is_special_situation else '아니오'}",
        f"현재가: {fmt_num(m.price)} | 52주 고점 대비: {fmt_pct(m.pct_from_52w_high)} | 52주 저점 대비: {fmt_pct(m.pct_from_52w_low)}",
        f"PER: {fmt_num(m.per)} | Forward PER: {fmt_num(m.forward_per)} | PBR: {fmt_num(m.pbr)} | EV/EBITDA: {fmt_num(m.ev_ebitda)}",
        f"FCF Yield: {fmt_pct(m.fcf_yield)} | 국채수익률(10y): {fmt_pct(m.risk_free_rate)} | ROE: {fmt_pct(m.roe)} | ROIC: {fmt_pct(m.roic)}",
        f"매출성장률(YoY): {fmt_pct(m.revenue_growth_yoy)} | 순이익성장률(YoY): {fmt_pct(m.net_income_growth_yoy)} | 부채비율: {fmt_num(m.debt_ratio, '%')}",
        f"최근 뉴스 평균 센티먼트: {m.news_avg_sentiment:+.2f} ({m.news_mentions}건)",
    ]
    if m.news_headlines:
        lines.append("최근 헤드라인: " + " | ".join(m.news_headlines[:5]))
    return "\n".join(lines)


def _format_score_block(s: ScoreResult) -> str:
    def notes_block(title, notes):
        bullet = "\n".join(f"  - {n}" for n in notes)
        return f"{title}:\n{bullet}"

    return "\n\n".join([
        notes_block(f"Quality Score {s.quality_score}/25", s.quality_notes),
        notes_block(f"Valuation Score {s.valuation_score}/25", s.valuation_notes),
        notes_block(f"Catalyst Score {s.catalyst_score}/25", s.catalyst_notes),
        notes_block(f"Risk(안전마진) Score {s.risk_score}/25", s.risk_notes),
        f"종합 점수: {s.total_score}/100 → 등급: {s.grade}, 제안 비중: {s.position_weight_pct}%",
    ])


def build_user_prompt(m: AckmanMetrics, s: ScoreResult) -> str:
    return (
        "다음은 한 종목에 대해 퀀트 엔진이 계산한 정량 데이터와 점수입니다.\n\n"
        "[정량 지표]\n" + _format_metrics_block(m) + "\n\n"
        "[스코어 산출 근거]\n" + _format_score_block(s) + "\n\n"
        "위 데이터를 바탕으로 애크먼 스타일의 투자 논평(3~5문장)을 작성하세요."
    )


def generate_commentary(m: AckmanMetrics, s: ScoreResult, use_llm: bool = True) -> str:
    """DeepSeek으로 정성 코멘트 생성. 키 없거나 use_llm=False면 정량 기반 템플릿으로 폴백."""
    if use_llm and deepseek_client.is_available():
        user_prompt = build_user_prompt(m, s)
        result = deepseek_client.chat(SYSTEM_PROMPT, user_prompt)
        if result:
            return result.strip()

    return fallback_commentary(m, s)


def fallback_commentary(m: AckmanMetrics, s: ScoreResult) -> str:
    dd = f"{-m.pct_from_52w_high:.0%}" if m.pct_from_52w_high is not None else "알 수 없는 폭"
    return (
        f"[DeepSeek 미사용 — 정량 기반 자동 코멘트] {m.ticker}는 52주 고점 대비 {dd} 하락한 상태에서 "
        f"Quality {s.quality_score}/25, Valuation {s.valuation_score}/25 점을 기록했다. "
        f"종합 {s.total_score}/100점으로 '{s.grade}' 등급이며, 제안 비중은 {s.position_weight_pct}%다. "
        f"실제 애크먼 스타일의 정성적 논평을 얻으려면 DEEPSEEK_API_KEY를 설정하세요."
    )


def render_report_block(m: AckmanMetrics, s: ScoreResult, commentary: str) -> str:
    """Section 5 출력 형식에 맞춘 종목별 리포트 블록."""
    def fmt_pct(v):
        return f"{v:.1%}" if v is not None else "N/A"

    quality_notes = "\n".join(f"   - {n}" for n in s.quality_notes)
    valuation_notes = "\n".join(f"   - {n}" for n in s.valuation_notes)
    catalyst_notes = "\n".join(f"   - {n}" for n in s.catalyst_notes)
    risk_notes = "\n".join(f"   - {n}" for n in s.risk_notes)

    return f"""[{m.ticker}] ({m.market}{' / 특수상황' if m.is_special_situation else ''})
─────────────────────
Quality Score: {s.quality_score}/25
{quality_notes}

Valuation Score: {s.valuation_score}/25
{valuation_notes}

Catalyst Score: {s.catalyst_score}/25
{catalyst_notes}

Risk(안전마진) Score: {s.risk_score}/25
{risk_notes}

Ackman 종합 점수: {s.total_score}/100
등급: {s.grade}
포지션 비중 제안: {s.position_weight_pct}% (상한 20%)

애크먼의 코멘트:
{commentary}
─────────────────────
"""
