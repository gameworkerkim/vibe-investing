"""
07_top30_report.py — 최종 Top 30 리포트 + 주식 종목 -forecast 스타일 HTML 대시보드

산출:
  - outputs/top30_{date}.json   (전체 데이터)
  - outputs/top30_{date}.csv    (엑셀 열람용)
  - outputs/dashboard_{date}.html (Plotly 인터랙티브 차트)

대시보드 요소 (종목별):
  1. 애널리스트 목표가 분포 (low → high, 현재가 표시)
  2. Buy/Hold/Sell 분포 바 차트
  3. 매출 YoY/QoQ + EPS surprise 추이
  4. X/뉴스 멘션 타임라인
  5. Bull vs Bear thesis 비교 카드
"""

import json
import csv
import datetime as dt
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))


def generate_csv(top30: list, out_path: Path):
    """top 30을 간결한 CSV로 저장."""
    with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "rank", "ticker", "sector", "price",
            "conviction_score", "recommendation", "target_price_12m", "stop_loss",
            "revenue_yoy", "revenue_qoq", "eps_surprise_pct", "eps_yoy",
            "pct_from_52w_low", "rsi_14", "macd",
            "news_sentiment_score", "x_bullish_pct", "reddit_bullish_ratio",
            "analyst_strong_buy", "analyst_buy", "analyst_hold", "analyst_sell",
            "analyst_avg_target", "upside_to_target_pct",
            "bull_thesis", "bear_thesis", "risk_scenario", "pm_verdict",
        ])
        
        for i, item in enumerate(top30, 1):
            t = item.get("technical", {}) or {}
            f_ = item.get("fundamentals", {}) or {}
            s = item.get("sentiment", {}) or {}
            a = item.get("analyst", {}) or {}
            d = item.get("debate", {}) or {}
            pm = d.get("pm", {}) or {}
            bull = d.get("bull", {}) or {}
            bear = d.get("bear", {}) or {}
            risk = d.get("risk", {}) or {}
            
            w.writerow([
                i, item["ticker"], item.get("sector", ""), t.get("price", ""),
                pm.get("conviction_score", ""), pm.get("recommendation", ""),
                pm.get("target_price_12m", ""), pm.get("stop_loss", ""),
                f_.get("revenue_yoy", ""), f_.get("revenue_qoq", ""),
                f_.get("eps_surprise_pct", ""), f_.get("eps_yoy", ""),
                t.get("pct_from_52w_low", ""), t.get("rsi_14", ""), t.get("macd_signal", ""),
                s.get("news_sentiment_score", ""), s.get("x_bullish_pct", ""),
                s.get("reddit_bullish_ratio", ""),
                a.get("strong_buy", ""), a.get("buy", ""), a.get("hold", ""), a.get("sell", ""),
                a.get("avg_target", ""), a.get("upside_to_target_pct", ""),
                bull.get("thesis", "")[:200], bear.get("thesis", "")[:200],
                risk.get("downside_scenario", "")[:200], pm.get("pm_verdict", "")[:300],
            ])


def generate_html_dashboard(top30: list, out_path: Path):
    """간단한 self-contained HTML dashboard.
    Plotly CDN 사용 — 외부 라이브러리 설치 불필요."""
    
    cards_html = []
    for i, item in enumerate(top30[:30], 1):
        t = item.get("technical", {}) or {}
        f_ = item.get("fundamentals", {}) or {}
        a = item.get("analyst", {}) or {}
        d = item.get("debate", {}) or {}
        pm = d.get("pm", {}) or {}
        bull = d.get("bull", {}) or {}
        bear = d.get("bear", {}) or {}
        
        rec = pm.get("recommendation", "HOLD")
        rec_color = {
            "STRONG_BUY": "#10b981", "BUY": "#34d399",
            "HOLD": "#fbbf24", "SELL": "#f87171", "STRONG_SELL": "#ef4444"
        }.get(rec, "#94a3b8")
        
        # Analyst 분포
        sb, b, h, s, ss = a.get("strong_buy", 0), a.get("buy", 0), a.get("hold", 0), a.get("sell", 0), a.get("strong_sell", 0)
        total = sb + b + h + s + ss or 1
        sb_pct, b_pct, h_pct, s_pct, ss_pct = [x/total*100 for x in (sb, b, h, s, ss)]
        
        price = t.get("price", 0)
        avg_t = a.get("avg_target", 0)
        high_t = a.get("high_target", 0)
        low_t = a.get("low_target", 0)
        upside = a.get("upside_to_target_pct", 0) * 100 if isinstance(a.get("upside_to_target_pct"), (int, float)) else 0
        
        # 목표가 분포 position (low→high 중 현재가·평균 위치)
        price_pos = ((price - low_t) / (high_t - low_t) * 100) if high_t > low_t else 50
        avg_pos = ((avg_t - low_t) / (high_t - low_t) * 100) if high_t > low_t else 50
        
        card = f"""
        <div class="card" id="card-{i}">
          <div class="card-head">
            <div class="rank">#{i}</div>
            <div class="ticker">{item['ticker']}</div>
            <div class="sector">{item.get('sector', '')}</div>
            <div class="rec" style="background:{rec_color}">{rec}</div>
          </div>
          
          <div class="price-row">
            <div><span class="label">현재가</span><span class="val">${price:.2f}</span></div>
            <div><span class="label">12M 목표</span><span class="val">${avg_t:.2f}</span></div>
            <div><span class="label">Upside</span><span class="val {'pos' if upside > 0 else 'neg'}">{upside:+.1f}%</span></div>
            <div><span class="label">Conviction</span><span class="val">{pm.get('conviction_score', '-')}/10</span></div>
          </div>
          
          <div class="section-title">애널리스트 목표가 분포</div>
          <div class="target-bar">
            <span class="low">${low_t:.0f}</span>
            <div class="target-track">
              <div class="target-avg" style="left:{avg_pos:.0f}%"></div>
              <div class="target-current" style="left:{price_pos:.0f}%"></div>
            </div>
            <span class="high">${high_t:.0f}</span>
          </div>
          <div class="target-legend">
            <span>🔵 현재가 ${price:.0f}</span>
            <span>🟢 평균 목표 ${avg_t:.0f}</span>
          </div>
          
          <div class="section-title">Buy / Hold / Sell 분포</div>
          <div class="analyst-bar">
            <div class="seg sb" style="width:{sb_pct:.0f}%" title="Strong Buy {sb}">{sb}</div>
            <div class="seg b" style="width:{b_pct:.0f}%" title="Buy {b}">{b}</div>
            <div class="seg h" style="width:{h_pct:.0f}%" title="Hold {h}">{h}</div>
            <div class="seg s" style="width:{s_pct:.0f}%" title="Sell {s}">{s}</div>
            <div class="seg ss" style="width:{ss_pct:.0f}%" title="Strong Sell {ss}">{ss}</div>
          </div>
          <div class="analyst-legend">
            <span style="color:#10b981">Strong Buy {sb}</span>
            <span style="color:#34d399">Buy {b}</span>
            <span style="color:#fbbf24">Hold {h}</span>
            <span style="color:#f87171">Sell {s}</span>
            <span style="color:#ef4444">Strong Sell {ss}</span>
          </div>
          
          <div class="section-title">펀더멘털 & 심리</div>
          <div class="metrics-grid">
            <div><span class="label">Revenue YoY</span><span class="val {'pos' if (f_.get('revenue_yoy') or 0) > 0 else 'neg'}">{(f_.get('revenue_yoy') or 0)*100:+.1f}%</span></div>
            <div><span class="label">Revenue QoQ</span><span class="val">{(f_.get('revenue_qoq') or 0)*100:+.1f}%</span></div>
            <div><span class="label">EPS Surprise</span><span class="val pos">{(f_.get('eps_surprise_pct') or 0)*100:+.1f}%</span></div>
            <div><span class="label">52w Low 대비</span><span class="val">{(t.get('pct_from_52w_low') or 0)*100:+.1f}%</span></div>
            <div><span class="label">RSI</span><span class="val">{t.get('rsi_14', 0):.0f}</span></div>
            <div><span class="label">MACD</span><span class="val">{t.get('macd_signal', '-')}</span></div>
          </div>
          
          <div class="theses">
            <div class="bull-box">
              <div class="box-title">🐂 Bull Thesis</div>
              <div class="box-body">{(bull.get('thesis', '') or '')[:500]}</div>
            </div>
            <div class="bear-box">
              <div class="box-title">🐻 Bear Thesis</div>
              <div class="box-body">{(bear.get('thesis', '') or '')[:500]}</div>
            </div>
          </div>
          
          <div class="pm-verdict">
            <strong>PM Verdict:</strong> {pm.get('pm_verdict', '')[:400]}<br>
            <strong>Stop Loss:</strong> ${pm.get('stop_loss', '-')}
          </div>
        </div>
        """
        cards_html.append(card)
    
    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Earnings Momentum — Top 30 · {dt.date.today()}</title>
<style>
  body {{ font-family: -apple-system, 'Segoe UI', 'Noto Sans KR', sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:20px; }}
  h1 {{ color:#fbbf24; }}
  .card {{ background:#1e293b; border-radius:10px; padding:20px; margin-bottom:24px; box-shadow:0 4px 12px rgba(0,0,0,0.3); }}
  .card-head {{ display:flex; align-items:center; gap:15px; margin-bottom:15px; }}
  .rank {{ font-size:28px; font-weight:700; color:#fbbf24; }}
  .ticker {{ font-size:28px; font-weight:700; }}
  .sector {{ color:#94a3b8; font-size:14px; }}
  .rec {{ margin-left:auto; padding:6px 14px; border-radius:6px; font-weight:700; color:white; }}
  .price-row {{ display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:20px; padding:12px; background:#0f172a; border-radius:6px; }}
  .price-row .label {{ display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; }}
  .price-row .val {{ font-size:20px; font-weight:600; }}
  .val.pos {{ color:#10b981; }} .val.neg {{ color:#ef4444; }}
  .section-title {{ font-size:12px; color:#94a3b8; text-transform:uppercase; margin:12px 0 6px; letter-spacing:0.5px; }}
  .target-bar {{ display:flex; align-items:center; gap:10px; }}
  .target-track {{ flex:1; height:8px; background:linear-gradient(90deg,#ef4444,#fbbf24,#10b981); border-radius:4px; position:relative; }}
  .target-avg {{ position:absolute; top:-4px; width:2px; height:16px; background:#10b981; }}
  .target-current {{ position:absolute; top:-4px; width:2px; height:16px; background:#3b82f6; }}
  .target-legend {{ font-size:11px; color:#94a3b8; margin-top:4px; display:flex; gap:15px; }}
  .analyst-bar {{ display:flex; height:24px; border-radius:4px; overflow:hidden; }}
  .seg {{ display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:600; }}
  .seg.sb {{ background:#10b981; }} .seg.b {{ background:#34d399; }} .seg.h {{ background:#fbbf24; }}
  .seg.s {{ background:#f87171; }} .seg.ss {{ background:#ef4444; }}
  .analyst-legend {{ font-size:11px; margin-top:6px; display:flex; gap:12px; }}
  .metrics-grid {{ display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin:10px 0; }}
  .metrics-grid > div {{ padding:8px; background:#0f172a; border-radius:4px; }}
  .metrics-grid .label {{ display:block; font-size:10px; color:#94a3b8; text-transform:uppercase; }}
  .metrics-grid .val {{ display:block; font-size:15px; font-weight:600; margin-top:2px; }}
  .theses {{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }}
  .bull-box, .bear-box {{ padding:12px; border-radius:6px; }}
  .bull-box {{ background:#064e3b; border-left:3px solid #10b981; }}
  .bear-box {{ background:#7f1d1d; border-left:3px solid #ef4444; }}
  .box-title {{ font-weight:600; margin-bottom:6px; }}
  .box-body {{ font-size:13px; line-height:1.5; color:#cbd5e1; }}
  .pm-verdict {{ margin-top:14px; padding:12px; background:#0f172a; border-left:3px solid #fbbf24; border-radius:4px; font-size:13px; line-height:1.5; }}
</style>
</head>
<body>
<h1>🚀 Earnings Momentum — Top 30</h1>
<p style="color:#94a3b8">Generated: {dt.datetime.now().strftime('%Y-%m-%d %H:%M KST')} · Universe: NASDAQ + S&P 500</p>
{''.join(cards_html)}
</body></html>
"""
    
    out_path.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    date = dt.date.today().isoformat()
    out_dir = Path(__file__).parent.parent / "outputs"
    
    judged_path = out_dir / f"judged_{date}.json"
    if not judged_path.exists():
        print(f"Run 06_multi_agent_judge.py first.")
        sys.exit(1)
    
    with open(judged_path) as f:
        data = json.load(f)
    
    top30 = data["tickers"][:30]
    
    # JSON (전체)
    json_path = out_dir / f"top30_{date}.json"
    with open(json_path, "w") as f:
        json.dump({"date": date, "top30": top30}, f, indent=2, default=str)
    
    # CSV (엑셀)
    csv_path = out_dir / f"top30_{date}.csv"
    generate_csv(top30, csv_path)
    
    # HTML (대시보드)
    html_path = out_dir / f"dashboard_{date}.html"
    generate_html_dashboard(top30, html_path)
    
    print(f"✅ Top 30 generated:")
    print(f"   JSON: {json_path}")
    print(f"   CSV:  {csv_path}")
    print(f"   HTML: {html_path}")
