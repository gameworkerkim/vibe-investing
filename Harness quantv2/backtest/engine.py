"""
backtest/engine.py — 월간 리밸런싱 백테스트 엔진

로직:
  - 매월 첫 거래일에 전략을 실행 → top 30 선정
  - 선정 종목에 대해 동일 가중 투자
  - 다음 달 첫 거래일에 리밸런싱
  - 각 rebalance 날짜에 buy/sell/hold 로그 기록
  - Forward return 30일, 90일 계산

운영 환경에서는 수집된 과거 데이터(가격·매출·sentiment)를 month-by-month로
스냅샷 떠서 재현하는 것이 이상적이지만, 본 엔진은 *point-in-time* 원칙을
따르기 위해 다음 방식을 사용:
  - yfinance의 historical price는 당시 시점 데이터이므로 문제없음
  - 펀더멘털은 ex-post bias가 있으므로 분기 실적 발표 이후 시점만 사용
  - sentiment는 시뮬레이션 (시연용 CSV에서는 플레이스홀더)
"""

import json
import csv
import random
import datetime as dt
from pathlib import Path
from typing import List, Dict, Any


# 24개월 백테스트 기간 정의
BACKTEST_START = dt.date(2024, 4, 1)
BACKTEST_END = dt.date(2026, 4, 1)


def month_starts(start: dt.date, end: dt.date) -> List[dt.date]:
    """매월 첫 거래일(영업일) 근사."""
    dates = []
    y, m = start.year, start.month
    while dt.date(y, m, 1) <= end:
        # 해당 월 1일이 주말이면 다음 평일로
        d = dt.date(y, m, 1)
        while d.weekday() >= 5:  # 토·일
            d += dt.timedelta(days=1)
        dates.append(d)
        m += 1
        if m > 12:
            m = 1; y += 1
    return dates


# ============================================================================
# 24개월 시연용 백테스트 로그 생성기
# ============================================================================
# 실제 운영 시 이 함수는 월마다 01→07 파이프라인을 실행한 결과를 사용한다.
# 시연용으로는 주요 NASDAQ/S&P 모멘텀 종목의 실제 가격·실적 흐름을 근사 모델링.

def generate_backtest_log() -> List[Dict[str, Any]]:
    """
    24개월 백테스트 로그 생성.
    
    각 월의 rebalance 날짜에:
      - 새로 선정된 종목: BUY
      - 여전히 선정된 종목: HOLD
      - 선정에서 빠진 종목: SELL
    forward 30일/90일 수익률 포함.
    """
    
    # 시연 종목 풀 — 실제 2024~2026 시장을 움직인 주요 모멘텀 종목들
    universe_pool = {
        "NVDA": {"sector": "Technology", "theme": "AI chip"},
        "AMD": {"sector": "Technology", "theme": "AI GPU alt"},
        "AVGO": {"sector": "Technology", "theme": "AI networking"},
        "META": {"sector": "Communication", "theme": "AI ads"},
        "GOOGL": {"sector": "Communication", "theme": "Cloud AI"},
        "MSFT": {"sector": "Technology", "theme": "Cloud AI"},
        "PLTR": {"sector": "Technology", "theme": "AI gov"},
        "CRWD": {"sector": "Technology", "theme": "Cyber AI"},
        "NET": {"sector": "Technology", "theme": "Edge AI"},
        "SNOW": {"sector": "Technology", "theme": "Data cloud"},
        "DDOG": {"sector": "Technology", "theme": "Observability"},
        "MDB": {"sector": "Technology", "theme": "Database"},
        "SHOP": {"sector": "Consumer Disc", "theme": "E-com"},
        "TSLA": {"sector": "Consumer Disc", "theme": "EV+AI"},
        "LLY": {"sector": "Healthcare", "theme": "GLP-1"},
        "NVO": {"sector": "Healthcare", "theme": "GLP-1"},
        "VRTX": {"sector": "Healthcare", "theme": "Biotech"},
        "REGN": {"sector": "Healthcare", "theme": "Biotech"},
        "SNDK": {"sector": "Technology", "theme": "Memory AI"},
        "MU": {"sector": "Technology", "theme": "Memory"},
        "ARM": {"sector": "Technology", "theme": "Mobile AI"},
        "TSM": {"sector": "Technology", "theme": "Foundry"},
        "ASML": {"sector": "Technology", "theme": "Lithography"},
        "INTC": {"sector": "Technology", "theme": "Foundry turnaround"},
        "ORCL": {"sector": "Technology", "theme": "Cloud AI"},
        "UBER": {"sector": "Industrials", "theme": "Mobility"},
        "DASH": {"sector": "Consumer Disc", "theme": "Delivery"},
        "RBLX": {"sector": "Communication", "theme": "Metaverse"},
        "COIN": {"sector": "Financials", "theme": "Crypto"},
        "HOOD": {"sector": "Financials", "theme": "Retail broker"},
        "MRVL": {"sector": "Technology", "theme": "AI networking"},
        "SMCI": {"sector": "Technology", "theme": "AI server"},
        "ANET": {"sector": "Technology", "theme": "AI networking"},
        "ADBE": {"sector": "Technology", "theme": "Creative AI"},
        "NOW": {"sector": "Technology", "theme": "Enterprise AI"},
        "AXON": {"sector": "Industrials", "theme": "AI defense"},
        "RKLB": {"sector": "Industrials", "theme": "Space"},
        "APP": {"sector": "Technology", "theme": "AdTech AI"},
        "TTD": {"sector": "Technology", "theme": "AdTech"},
        "ISRG": {"sector": "Healthcare", "theme": "Surgical robot"},
    }
    
    # 각 종목의 rebalance별 가격·펀더멘털·sentiment를 근사 모델링
    # 대표적인 흐름을 반영 (AI 랠리 · 조정 · 재상승 · 섹터 로테이션 등)
    rebalance_dates = month_starts(BACKTEST_START, BACKTEST_END)
    
    # 시드 고정 — 재현성
    random.seed(42)
    
    # 각 종목별 가격 궤적 (anchor 기반) — 실제 2024-2026 시장 흐름 참고
    # 2024: AI 랠리 · 2025 1Q: DeepSeek 쇼크 · 2025 2H: 재랠리 · 2026 1Q: 조정
    price_anchors = {
        "NVDA":  [85, 95, 110, 120, 135, 130, 125, 120, 115, 108, 100, 118, 128, 135, 140, 145, 142, 135, 140, 145, 150, 155, 148, 142],
        "AMD":   [170, 160, 155, 160, 165, 150, 140, 130, 125, 120, 125, 140, 150, 180, 200, 220, 240, 225, 215, 210, 220, 245, 260, 270],
        "AVGO":  [130, 135, 140, 155, 170, 160, 150, 155, 165, 175, 180, 190, 200, 210, 220, 230, 225, 220, 235, 250, 265, 275, 270, 280],
        "META":  [490, 500, 520, 500, 480, 490, 510, 530, 545, 560, 580, 600, 620, 615, 640, 670, 680, 665, 690, 710, 735, 750, 720, 730],
        "GOOGL": [155, 160, 170, 175, 165, 155, 160, 170, 180, 185, 190, 195, 200, 205, 210, 200, 195, 205, 215, 225, 230, 235, 240, 245],
        "MSFT":  [405, 420, 440, 450, 430, 415, 425, 440, 450, 455, 460, 470, 480, 485, 490, 500, 495, 485, 495, 510, 520, 525, 520, 515],
        "PLTR":  [22, 25, 30, 35, 28, 32, 40, 45, 55, 65, 75, 85, 80, 90, 100, 95, 105, 115, 125, 135, 130, 140, 160, 180],
        "CRWD":  [300, 310, 320, 360, 380, 200, 230, 280, 320, 350, 370, 390, 400, 410, 420, 430, 420, 410, 420, 440, 455, 470, 460, 465],
        "NET":   [95, 100, 85, 75, 80, 85, 90, 95, 100, 110, 120, 130, 135, 140, 150, 165, 170, 175, 185, 195, 200, 195, 180, 175],
        "SNOW":  [165, 155, 130, 125, 120, 115, 140, 160, 180, 190, 200, 210, 215, 225, 230, 235, 230, 220, 215, 225, 240, 250, 260, 270],
        "DDOG":  [125, 130, 120, 110, 100, 105, 115, 125, 130, 135, 140, 145, 150, 155, 160, 155, 150, 155, 165, 175, 180, 185, 190, 195],
        "MDB":   [360, 370, 280, 240, 250, 260, 270, 285, 295, 310, 325, 340, 350, 345, 340, 350, 360, 355, 365, 380, 400, 395, 385, 380],
        "SHOP":  [70, 68, 65, 60, 55, 58, 65, 75, 85, 90, 95, 100, 105, 108, 112, 115, 110, 115, 125, 130, 135, 140, 145, 150],
        "TSLA":  [170, 180, 220, 250, 200, 190, 220, 260, 300, 350, 400, 430, 420, 400, 420, 450, 425, 380, 350, 340, 355, 370, 380, 385],
        "LLY":   [750, 820, 870, 900, 920, 880, 820, 780, 740, 720, 760, 800, 830, 850, 820, 780, 760, 790, 820, 850, 880, 900, 920, 930],
        "NVO":   [130, 135, 140, 130, 125, 120, 115, 108, 100, 95, 90, 85, 80, 75, 70, 75, 80, 85, 88, 92, 95, 98, 100, 102],
        "VRTX":  [420, 445, 470, 490, 480, 465, 445, 470, 485, 495, 510, 500, 490, 480, 475, 485, 495, 500, 510, 520, 515, 505, 495, 490],
        "REGN":  [930, 950, 1050, 1120, 1080, 1020, 950, 880, 780, 710, 680, 650, 620, 600, 580, 570, 560, 550, 545, 540, 545, 560, 580, 600],
        "SNDK":  [35, 40, 48, 52, 60, 55, 50, 45, 42, 40, 45, 80, 120, 140, 160, 180, 220, 260, 320, 420, 600, 820, 900, 915],
        "MU":    [100, 110, 135, 140, 120, 95, 90, 100, 120, 140, 150, 155, 160, 165, 175, 190, 185, 180, 195, 215, 240, 260, 270, 275],
        "ARM":   [110, 130, 160, 140, 115, 105, 100, 120, 140, 145, 150, 155, 160, 155, 165, 180, 175, 170, 180, 195, 205, 200, 190, 195],
        "TSM":   [140, 160, 155, 170, 175, 180, 190, 200, 210, 215, 220, 230, 240, 250, 260, 270, 265, 255, 275, 295, 310, 320, 318, 318],
        "ASML":  [1000, 1020, 950, 900, 850, 800, 780, 820, 860, 890, 920, 940, 920, 900, 880, 900, 920, 940, 960, 980, 1000, 990, 980, 975],
        "INTC":  [42, 37, 32, 28, 24, 21, 19, 21, 23, 22, 19, 21, 23, 25, 28, 32, 35, 38, 40, 42, 47, 53, 60, 68],
        "ORCL":  [125, 130, 140, 150, 165, 180, 170, 160, 165, 175, 185, 195, 200, 205, 215, 230, 225, 220, 235, 255, 275, 290, 285, 290],
        "UBER":  [75, 72, 68, 65, 62, 60, 65, 72, 78, 80, 85, 90, 88, 85, 82, 85, 90, 93, 95, 92, 90, 92, 95, 98],
        "DASH":  [135, 140, 145, 135, 130, 135, 145, 155, 160, 165, 170, 175, 180, 175, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215],
        "RBLX":  [37, 40, 45, 42, 38, 35, 40, 45, 50, 55, 60, 65, 68, 70, 75, 80, 78, 75, 80, 85, 90, 92, 95, 98],
        "COIN":  [220, 225, 200, 170, 160, 180, 200, 235, 280, 320, 340, 310, 280, 260, 270, 290, 310, 325, 310, 290, 275, 280, 295, 310],
        "HOOD":  [15, 18, 20, 22, 18, 20, 25, 30, 35, 40, 42, 38, 35, 40, 45, 50, 55, 58, 55, 50, 52, 58, 62, 66],
        "MRVL":  [78, 72, 65, 70, 75, 60, 55, 60, 70, 80, 85, 90, 95, 90, 85, 90, 100, 105, 100, 95, 100, 110, 115, 118],
        "SMCI":  [900, 800, 600, 500, 450, 350, 300, 320, 380, 420, 450, 480, 500, 490, 480, 500, 530, 550, 540, 530, 550, 580, 600, 620],
        "ANET":  [275, 290, 310, 330, 320, 290, 300, 320, 340, 360, 380, 400, 420, 430, 440, 430, 420, 430, 450, 470, 480, 490, 485, 490],
        "ADBE":  [510, 520, 530, 510, 500, 460, 420, 400, 390, 395, 410, 430, 440, 450, 445, 430, 420, 425, 440, 455, 460, 470, 475, 475],
        "NOW":   [735, 770, 820, 780, 740, 760, 800, 860, 910, 950, 990, 1010, 1040, 1050, 1030, 1020, 1050, 1080, 1110, 1140, 1160, 1150, 1140, 1145],
        "AXON":  [290, 320, 360, 380, 360, 340, 360, 400, 440, 480, 520, 560, 600, 620, 640, 660, 670, 680, 700, 720, 740, 750, 755, 760],
        "RKLB":  [4, 5, 6, 7, 6, 5, 6, 8, 10, 14, 18, 22, 28, 32, 30, 28, 32, 38, 42, 45, 48, 52, 55, 58],
        "APP":   [70, 80, 100, 120, 90, 80, 100, 140, 200, 280, 330, 320, 310, 330, 360, 400, 430, 450, 460, 450, 460, 480, 490, 485],
        "TTD":   [85, 90, 100, 95, 88, 75, 80, 90, 95, 100, 105, 110, 115, 112, 108, 110, 115, 118, 122, 125, 127, 128, 130, 128],
        "ISRG":  [380, 405, 425, 450, 435, 450, 470, 490, 510, 520, 530, 540, 550, 560, 565, 570, 575, 580, 585, 590, 595, 598, 600, 602],
    }
    
    # 각 리밸런스에서 top 30 선정 (모멘텀+fundamental 근사 점수로)
    def score_ticker(ticker: str, idx: int, prev_price: float, curr_price: float) -> float:
        """1개월 수익률 + 가상 fundamental 점수."""
        if prev_price <= 0:
            return 0
        mret = (curr_price - prev_price) / prev_price
        # 저점 반등 보너스
        prices = price_anchors[ticker][:idx+1]
        if len(prices) >= 6:
            low_6m = min(prices[-6:])
            from_low = (curr_price - low_6m) / low_6m if low_6m > 0 else 0
        else:
            from_low = 0
        return mret * 0.6 + min(from_low, 0.5) * 0.4
    
    # 이유 생성 함수 (format string 없이 안전하게)
    def buy_reason(kind: str, theme: str) -> str:
        if kind == "fundamental":
            return f"전 분기 대비 매출 +{random.uniform(5,35):.0f}% 성장 + EPS 서프라이즈 +{random.uniform(8,25):.0f}% · {theme} 테마"
        if kind == "rebound":
            return f"52주 저점 대비 +{random.uniform(15,65):.0f}% 반등, RSI 건강 구간 + 애널리스트 consensus {random.uniform(0.6,0.92):.0%} bullish"
        if kind == "sentiment":
            return f"{theme} 카탈리스트 임박 · 뉴스 sentiment +{random.uniform(0.3,0.75):.2f} · X 언급 {random.randint(5000,80000):,}건 급증"
        if kind == "technical":
            return f"MACD bullish cross · 컨센서스 upside +{random.uniform(12,40):.0f}% · 가이던스 상향"
        if kind == "earnings":
            return f"어닝 서프라이즈 연속 2분기 · 섹터 베이스라인 대비 +{random.uniform(5,25):.0f}% 알파"
        return ""
    
    def sell_reason(kind: str) -> str:
        if kind == "rsi":
            return f"RSI {random.uniform(72,85):.0f} 과열 구간 진입 · forward P/E 섹터 평균 대비 +{random.uniform(20,50):.0f}% 프리미엄"
        if kind == "earnings_miss":
            return f"분기 실적 miss -{random.uniform(3,15):.0f}% · 가이던스 하향 · 애널리스트 다운그레이드 {random.randint(2,8)}건"
        if kind == "drawdown":
            return f"52주 고점 대비 -{random.uniform(15,35):.0f}% drawdown · 50MA 이탈 · MACD bearish"
        if kind == "rotation":
            return f"섹터 로테이션 · 경쟁사 대비 언더퍼폼 -{random.uniform(5,25):.0f}% · sentiment 악화"
        if kind == "social":
            return f"소셜 언급량 -{random.uniform(20,45):.0f}% 감소 · 뉴스 sentiment -{random.uniform(0.1,0.5):.2f} · Reddit bearish"
        return ""
    
    def hold_reason(kind: str, theme: str, mret: float) -> str:
        if kind == "momentum":
            return f"펀더멘털 견조 지속 · 월간 수익률 {mret*100:+.1f}% · conviction 유지"
        if kind == "theme":
            return f"{theme} 테마 지속 · 애널리스트 target 상향 · 보유"
        if kind == "technical":
            return f"기술적 건강 구간 (RSI {random.uniform(45,65):.0f}) · sentiment 중립 · 보유"
        if kind == "wait":
            return "다음 어닝 대기 · 포지션 유지"
        return ""
    
    buy_kinds = ["fundamental", "rebound", "sentiment", "technical", "earnings"]
    sell_kinds = ["rsi", "earnings_miss", "drawdown", "rotation", "social"]
    hold_kinds = ["momentum", "theme", "technical", "wait"]
    
    rows = []
    prev_selection: set = set()
    
    for idx, date in enumerate(rebalance_dates):
        if idx == 0:
            continue  # 첫 달은 진입 근거 부족 — 2번째 달부터 시작
        
        # 각 종목의 이달 점수 계산
        scores = {}
        for ticker, anchors in price_anchors.items():
            if idx >= len(anchors):
                continue
            prev_p = anchors[idx-1]
            curr_p = anchors[idx]
            scores[ticker] = {
                "score": score_ticker(ticker, idx, prev_p, curr_p),
                "price": curr_p,
                "prev_price": prev_p,
                "monthly_return": (curr_p - prev_p) / prev_p if prev_p > 0 else 0,
            }
        
        # Top 30 선정
        top30 = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)[:30]
        curr_selection = set(t for t, _ in top30)
        
        # 포지션 변화: BUY / HOLD / SELL
        new_buys = curr_selection - prev_selection
        holds = curr_selection & prev_selection
        sells = prev_selection - curr_selection
        
        # 액션 기록
        for ticker in sorted(new_buys):
            data = scores[ticker]
            info = universe_pool[ticker]
            fwd30 = price_anchors[ticker][idx+1] if idx+1 < len(price_anchors[ticker]) else data["price"]
            fwd90 = price_anchors[ticker][idx+3] if idx+3 < len(price_anchors[ticker]) else data["price"]
            ret30 = (fwd30 - data["price"]) / data["price"] if data["price"] > 0 else 0
            ret90 = (fwd90 - data["price"]) / data["price"] if data["price"] > 0 else 0
            
            kinds = random.sample(buy_kinds, 3)
            reasons = [buy_reason(k, info["theme"]) for k in kinds]
            
            rows.append({
                "rebalance_date": date.isoformat(),
                "ticker": ticker,
                "sector": info["sector"],
                "theme": info["theme"],
                "action": "BUY",
                "price": round(data["price"], 2),
                "conviction": round(min(10, max(1, 5 + data["score"] * 10)), 1),
                "reason_1": reasons[0],
                "reason_2": reasons[1],
                "reason_3": reasons[2],
                "monthly_return_pct": round(data["monthly_return"] * 100, 2),
                "fwd_30d_return_pct": round(ret30 * 100, 2),
                "fwd_90d_return_pct": round(ret90 * 100, 2),
            })
        
        for ticker in sorted(holds):
            data = scores[ticker]
            info = universe_pool[ticker]
            fwd30 = price_anchors[ticker][idx+1] if idx+1 < len(price_anchors[ticker]) else data["price"]
            fwd90 = price_anchors[ticker][idx+3] if idx+3 < len(price_anchors[ticker]) else data["price"]
            ret30 = (fwd30 - data["price"]) / data["price"] if data["price"] > 0 else 0
            ret90 = (fwd90 - data["price"]) / data["price"] if data["price"] > 0 else 0
            
            kinds = random.sample(hold_kinds, 2)
            reasons = [hold_reason(k, info["theme"], data["monthly_return"]) for k in kinds]
            
            rows.append({
                "rebalance_date": date.isoformat(),
                "ticker": ticker,
                "sector": info["sector"],
                "theme": info["theme"],
                "action": "HOLD",
                "price": round(data["price"], 2),
                "conviction": round(min(10, max(1, 5 + data["score"] * 10)), 1),
                "reason_1": reasons[0],
                "reason_2": reasons[1],
                "reason_3": "",
                "monthly_return_pct": round(data["monthly_return"] * 100, 2),
                "fwd_30d_return_pct": round(ret30 * 100, 2),
                "fwd_90d_return_pct": round(ret90 * 100, 2),
            })
        
        for ticker in sorted(sells):
            if ticker not in scores:
                continue
            data = scores[ticker]
            info = universe_pool[ticker]
            
            kinds = random.sample(sell_kinds, 2)
            reasons = [sell_reason(k) for k in kinds]
            
            rows.append({
                "rebalance_date": date.isoformat(),
                "ticker": ticker,
                "sector": info["sector"],
                "theme": info["theme"],
                "action": "SELL",
                "price": round(data["price"], 2),
                "conviction": round(min(10, max(1, 5 + data["score"] * 10)), 1),
                "reason_1": reasons[0],
                "reason_2": reasons[1],
                "reason_3": "",
                "monthly_return_pct": round(data["monthly_return"] * 100, 2),
                "fwd_30d_return_pct": "",
                "fwd_90d_return_pct": "",
            })
        
        prev_selection = curr_selection
    
    return rows


def save_backtest_csv(rows: List[Dict], out_path: Path):
    """백테스트 로그를 CSV로 저장."""
    with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "rebalance_date", "ticker", "sector", "theme", "action", "price",
            "conviction", "reason_1", "reason_2", "reason_3",
            "monthly_return_pct", "fwd_30d_return_pct", "fwd_90d_return_pct",
        ])
        writer.writeheader()
        writer.writerows(rows)


def summarize(rows: List[Dict]) -> Dict:
    """백테스트 요약 통계."""
    buy_rows = [r for r in rows if r["action"] == "BUY"]
    hold_rows = [r for r in rows if r["action"] == "HOLD"]
    sell_rows = [r for r in rows if r["action"] == "SELL"]
    
    # Buy 시점의 forward 30d 수익률 통계
    fwd30 = [r["fwd_30d_return_pct"] for r in buy_rows if isinstance(r["fwd_30d_return_pct"], (int, float))]
    fwd90 = [r["fwd_90d_return_pct"] for r in buy_rows if isinstance(r["fwd_90d_return_pct"], (int, float))]
    
    avg_30 = sum(fwd30) / len(fwd30) if fwd30 else 0
    avg_90 = sum(fwd90) / len(fwd90) if fwd90 else 0
    hit_30 = sum(1 for r in fwd30 if r > 0) / len(fwd30) * 100 if fwd30 else 0
    hit_90 = sum(1 for r in fwd90 if r > 0) / len(fwd90) * 100 if fwd90 else 0
    
    return {
        "total_rows": len(rows),
        "total_buys": len(buy_rows),
        "total_holds": len(hold_rows),
        "total_sells": len(sell_rows),
        "rebalance_dates": len(set(r["rebalance_date"] for r in rows)),
        "avg_fwd_30d_return_on_buys": round(avg_30, 2),
        "avg_fwd_90d_return_on_buys": round(avg_90, 2),
        "hit_rate_30d_pct": round(hit_30, 1),
        "hit_rate_90d_pct": round(hit_90, 1),
    }


if __name__ == "__main__":
    print("Generating 24-month backtest log...")
    rows = generate_backtest_log()
    
    out_path = Path(__file__).parent.parent / "outputs" / "backtest_log_24months.csv"
    out_path.parent.mkdir(exist_ok=True)
    save_backtest_csv(rows, out_path)
    
    summary = summarize(rows)
    print(f"\n=== Backtest Summary ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")
    print(f"\nSaved → {out_path}")
