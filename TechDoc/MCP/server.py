"""
AMQS-AI-Infra MCP Server
========================
vibe-investing 레포의 Adaptive Momentum Quant Strategy (AMQS) for AI Infra 를
MCP(Model Context Protocol) 서버로 노출하는 Getting Started 샘플.

MCP 3대 primitive 를 모두 사용한다:
  - Tools     : get_regime / get_momentum_score / get_top_signals / check_stop_loss
  - Resources : amqs://universe (AI 인프라 universe 목록)
  - Prompts   : cross_validate_ticker (Python 신호의 LLM 펀더멘털 교차검증)

실행:
  python server.py                 # stdio transport (Claude Desktop 용)
  AMQS_MOCK=1 python server.py     # 네트워크 없이 합성 데이터로 데모

원본 전략: https://github.com/gameworkerkim/vibe-investing
           /tree/main/01.Trading Strategy/Adaptive Momentum Quant Strategy (AMQS) for AI Infra
License: MIT — "Built on AMQS by Dennis Kim, vibe-investing repository."

주의: 본 코드는 연구·교육용 시뮬레이션 도구이며 투자 손익을 보장하지 않는다.
"""

import os
import json
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# 0. 서버 인스턴스
# ---------------------------------------------------------------------------
mcp = FastMCP(
    "amqs-ai-infra",
    instructions=(
        "AMQS-AI-Infra 퀀트 전략 신호 서버. 4-Factor 모멘텀 composite, "
        "거시 레짐 필터(QQQ 200MA + VIX), Top-N 선별(서브테마 캡), -12% 손절 판정을 제공한다. "
        "모든 출력은 연구용 참고 신호이며 투자 권유가 아니다."
    ),
)

MOCK = os.environ.get("AMQS_MOCK", "0") == "1"

# ---------------------------------------------------------------------------
# 1. Universe — AI 데이터센터 밸류체인 (서브테마 분산 캡의 기준)
# ---------------------------------------------------------------------------
UNIVERSE: dict[str, str] = {
    # 연산 / GPU / 가속기
    "NVDA": "compute", "AMD": "compute", "INTC": "compute",
    "AVGO": "compute", "MRVL": "compute", "TSM": "compute",
    # 메모리 / 스토리지
    "MU": "memory", "STX": "memory", "WDC": "memory", "PSTG": "memory",
    # 서버 / 시스템
    "DELL": "server", "SMCI": "server", "HPE": "server",
    # 네트워킹
    "ANET": "network", "CSCO": "network",
    # 데이터 / 소프트웨어
    "SNOW": "software", "ORCL": "software", "PLTR": "software",
    # 전력 / 냉각
    "VRT": "power",
}
SUBTHEME_CAP = 4      # 서브테마당 최대 편입 종목 수
STOP_LOSS_PCT = -12.0 # 고정 손절선 (%)


# ---------------------------------------------------------------------------
# 2. 데이터 계층 — yfinance (실데이터) 또는 합성 데이터 (MOCK)
# ---------------------------------------------------------------------------
_price_cache: dict[str, pd.Series] = {}

def _synthetic_prices(ticker: str, days: int = 400) -> pd.Series:
    """네트워크 없는 환경(데모/CI)용 재현 가능한 합성 가격."""
    rng = np.random.default_rng(abs(hash(ticker)) % (2**32))
    drift = rng.uniform(-0.0002, 0.0015)
    vol = rng.uniform(0.015, 0.035)
    rets = rng.normal(drift, vol, days)
    prices = 100.0 * np.exp(np.cumsum(rets))
    idx = pd.bdate_range(end=datetime.now(timezone.utc).date(), periods=days)
    return pd.Series(prices, index=idx, name=ticker)

def get_prices(ticker: str, days: int = 400) -> pd.Series:
    """일별 종가 시계열. MOCK=1 이면 합성, 아니면 yfinance."""
    if ticker in _price_cache:
        return _price_cache[ticker]
    if MOCK:
        s = _synthetic_prices(ticker, days)
    else:
        import yfinance as yf
        df = yf.download(ticker, period="2y", auto_adjust=True, progress=False)
        if df.empty:
            raise ValueError(f"{ticker}: 가격 데이터를 가져올 수 없음")
        close = df["Close"]
        s = close.iloc[:, 0] if isinstance(close, pd.DataFrame) else close
        s = s.dropna()
    _price_cache[ticker] = s
    return s


# ---------------------------------------------------------------------------
# 3. 전략 계층 — AMQS 핵심 로직 (문서용 단순화 버전)
# ---------------------------------------------------------------------------
def _ret(s: pd.Series, lookback: int, skip: int = 21) -> float:
    """N-1 모멘텀: 최근 1개월(skip=21거래일)을 제외한 lookback 수익률."""
    if len(s) < lookback + skip:
        return np.nan
    return float(s.iloc[-1 - skip] / s.iloc[-lookback - skip] - 1.0)

def four_factor_raw(s: pd.Series) -> dict[str, float]:
    """4-Factor: 12-1 / 6-1 / 3-1 모멘텀 + 60일 실현변동성(역방향)."""
    vol60 = float(s.pct_change().tail(60).std() * np.sqrt(252))
    return {
        "mom_12_1": _ret(s, 252),
        "mom_6_1": _ret(s, 126),
        "mom_3_1": _ret(s, 63),
        "vol_60d": vol60,
    }

def composite_scores(universe: list[str]) -> pd.DataFrame:
    """universe 횡단면 z-score 합성 → 0~100 모멘텀 점수."""
    rows = {}
    for t in universe:
        try:
            rows[t] = four_factor_raw(get_prices(t))
        except Exception:
            continue  # 데이터 없는 종목은 자동 제외 (원본 정책과 동일)
    df = pd.DataFrame(rows).T.dropna()
    z = (df - df.mean()) / df.std(ddof=0)
    # 변동성은 낮을수록 좋으므로 부호 반전, 가중 합성
    df["composite_z"] = (
        0.40 * z["mom_12_1"] + 0.30 * z["mom_6_1"]
        + 0.20 * z["mom_3_1"] - 0.10 * z["vol_60d"]
    )
    cz = df["composite_z"]
    df["score"] = ((cz - cz.min()) / (cz.max() - cz.min()) * 100).round(1)
    df["subtheme"] = [UNIVERSE.get(t, "etc") for t in df.index]
    return df.sort_values("score", ascending=False)

def classify_tier(score: float) -> str:
    if score >= 80: return "CENTER"
    if score >= 65: return "SATELLITE"
    if score >= 50: return "TACTICAL"
    return "WATCH"

def macro_regime() -> dict:
    """거시 레짐 필터: QQQ 200일선 + VIX 수준(MOCK 시 합성 프록시)."""
    qqq = get_prices("QQQ")
    ma200 = float(qqq.tail(200).mean())
    last = float(qqq.iloc[-1])
    above_ma = last > ma200
    if MOCK:
        vix = 18.0 + (abs(hash("VIX_TODAY")) % 15)  # 재현 가능한 데모 값
    else:
        vix_s = get_prices("^VIX")
        vix = float(vix_s.iloc[-1])
    if above_ma and vix < 25:
        regime = "RISK_ON"
    elif not above_ma and vix >= 30:
        regime = "DEFENSIVE"
    else:
        regime = "RISK_OFF"
    return {
        "regime": regime,
        "qqq_close": round(last, 2),
        "qqq_ma200": round(ma200, 2),
        "qqq_above_ma200": above_ma,
        "vix": round(vix, 2),
        "as_of": datetime.now(timezone.utc).isoformat(),
        "mock": MOCK,
    }


# ---------------------------------------------------------------------------
# 4. MCP Tools — LLM 이 호출하는 함수. docstring 이 그대로 tool description 이 된다.
# ---------------------------------------------------------------------------
@mcp.tool()
def get_regime() -> str:
    """현재 거시 레짐(RISK_ON / RISK_OFF / DEFENSIVE)을 판정한다.
    QQQ 200일 이동평균 상회 여부와 VIX 수준을 결합한 AMQS 거시 필터.
    RISK_ON 에서만 신규 매수 신호가 유효하다."""
    return json.dumps(macro_regime(), ensure_ascii=False, indent=2)

@mcp.tool()
def get_momentum_score(ticker: str) -> str:
    """단일 종목의 AMQS 4-Factor 모멘텀 지표와 0~100 점수, 신호 tier 를 반환한다.
    ticker 는 AI 인프라 universe 내 미국 상장 심볼 (예: NVDA, MU, VRT)."""
    ticker = ticker.upper().strip()
    if ticker not in UNIVERSE:
        return json.dumps({
            "error": f"{ticker} 는 AMQS-AI-Infra universe 에 없음",
            "universe": sorted(UNIVERSE.keys()),
        }, ensure_ascii=False)
    df = composite_scores(list(UNIVERSE.keys()))
    if ticker not in df.index:
        return json.dumps({"error": f"{ticker}: 데이터 부족으로 자동 제외됨"}, ensure_ascii=False)
    row = df.loc[ticker]
    out = {
        "ticker": ticker,
        "subtheme": row["subtheme"],
        "score": float(row["score"]),
        "tier": classify_tier(float(row["score"])),
        "factors": {
            "mom_12_1": round(float(row["mom_12_1"]), 4),
            "mom_6_1": round(float(row["mom_6_1"]), 4),
            "mom_3_1": round(float(row["mom_3_1"]), 4),
            "vol_60d": round(float(row["vol_60d"]), 4),
        },
        "rank_in_universe": int(df.index.get_loc(ticker)) + 1,
        "note": "기술적 신호만 포함. 매출가속·13F·EPS 상향은 LLM 교차검증 프롬프트로 보완할 것.",
        "mock": MOCK,
    }
    return json.dumps(out, ensure_ascii=False, indent=2)

@mcp.tool()
def get_top_signals(top_n: int = 10) -> str:
    """AMQS Top-N 매수 후보를 반환한다. 서브테마당 최대 4종 캡을 적용해
    GPU 등 단일 테마 과집중을 방지한다. 거시 레짐이 RISK_ON 이 아니면 경고를 포함한다."""
    top_n = max(1, min(int(top_n), len(UNIVERSE)))
    df = composite_scores(list(UNIVERSE.keys()))
    picks, theme_count = [], {}
    for t, row in df.iterrows():
        theme = row["subtheme"]
        if theme_count.get(theme, 0) >= SUBTHEME_CAP:
            continue
        theme_count[theme] = theme_count.get(theme, 0) + 1
        picks.append({
            "ticker": t, "subtheme": theme,
            "score": float(row["score"]),
            "tier": classify_tier(float(row["score"])),
        })
        if len(picks) >= top_n:
            break
    reg = macro_regime()
    return json.dumps({
        "regime": reg["regime"],
        "warning": None if reg["regime"] == "RISK_ON"
                   else "레짐이 RISK_ON 이 아님 — AMQS 규칙상 신규 매수 보류",
        "subtheme_cap": SUBTHEME_CAP,
        "top_signals": picks,
        "as_of": reg["as_of"],
        "disclaimer": "연구용 신호. 투자 권유 아님. 원금 손실 가능.",
        "mock": MOCK,
    }, ensure_ascii=False, indent=2)

@mcp.tool()
def check_stop_loss(ticker: str, entry_price: float) -> str:
    """보유 종목의 -12% 고정 손절선 도달 여부를 판정한다.
    entry_price 는 평균 매수 단가(USD)."""
    ticker = ticker.upper().strip()
    s = get_prices(ticker)
    last = float(s.iloc[-1])
    pnl_pct = (last / float(entry_price) - 1.0) * 100
    return json.dumps({
        "ticker": ticker,
        "entry_price": float(entry_price),
        "last_price": round(last, 2),
        "pnl_pct": round(pnl_pct, 2),
        "stop_loss_line_pct": STOP_LOSS_PCT,
        "action": "EXIT — 손절선 도달" if pnl_pct <= STOP_LOSS_PCT else "HOLD",
        "mock": MOCK,
    }, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# 5. MCP Resource — 읽기 전용 컨텍스트 (tool 호출 없이 참조 가능한 데이터)
# ---------------------------------------------------------------------------
@mcp.resource("amqs://universe")
def universe_resource() -> str:
    """AMQS-AI-Infra universe (~19종) 와 서브테마 매핑."""
    by_theme: dict[str, list[str]] = {}
    for t, theme in UNIVERSE.items():
        by_theme.setdefault(theme, []).append(t)
    return json.dumps({
        "strategy": "AMQS-AI-Infra",
        "subtheme_cap": SUBTHEME_CAP,
        "stop_loss_pct": STOP_LOSS_PCT,
        "universe_by_subtheme": by_theme,
    }, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# 6. MCP Prompt — Python(기술 신호) / LLM(펀더멘털) 역할 분담용 교차검증 템플릿
# ---------------------------------------------------------------------------
@mcp.prompt()
def cross_validate_ticker(ticker: str) -> str:
    """AMQS 기술 신호를 펀더멘털·내러티브로 교차검증하는 프롬프트를 생성한다."""
    return f"""당신은 AMQS-AI-Infra 전략의 교차검증 담당 애널리스트다.
먼저 get_momentum_score 도구로 {ticker.upper()} 의 기술적 신호를 조회한 뒤,
Python 이 다루지 못하는 다음 3가지를 웹 검색과 지식으로 평가하라:

1. Revenue Acceleration — 최근 2개 분기 매출 성장률 가속 여부
2. 기관 수급 — 최신 13F 에서의 편입/축소 방향
3. EPS Revision — 최근 90일 컨센서스 상향/하향

각 항목을 긍정/중립/부정으로 판정하고, 기술 점수와 결합해
CENTER / SATELLITE / TACTICAL / WATCH 최종 tier 를 제안하라.
기술 신호와 펀더멘털이 충돌하면 그 사실을 명시하고 보수적 판정을 택하라.
이 결과는 연구용이며 투자 권유가 아니라는 고지를 마지막에 포함하라."""


# ---------------------------------------------------------------------------
# 7. Entry point — stdio transport (Claude Desktop 등 로컬 호스트용)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run(transport="stdio")
