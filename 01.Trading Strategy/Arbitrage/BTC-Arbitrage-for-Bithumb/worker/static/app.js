"use strict";

const nf0 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function $(id) {
  return document.getElementById(id);
}

function fmtKrw(v) {
  if (!Number.isFinite(v)) return "—";
  return nf0.format(v) + " KRW";
}

function fmtUsdt(v) {
  if (!Number.isFinite(v)) return "—";
  return nf2.format(v) + " USDT";
}

function fmtPct(v) {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return sign + nf2.format(v) + "%";
}

function pctClass(v) {
  if (!Number.isFinite(v) || v === 0) return "";
  return v > 0 ? "pos" : "neg";
}

function badge(action) {
  if (action === "BITHUMB_SELL") return '<span class="badge-sell">빗썸 매도</span>';
  if (action === "BITHUMB_BUY") return '<span class="badge-buy">빗썸 매수</span>';
  return '<span class="badge-wait">대기</span>';
}

function barPct(v) {
  if (!Number.isFinite(v)) return 0;
  const width = Math.min(Math.abs(v) * 20, 100);
  const color = v >= 0 ? "var(--red)" : "var(--green)";
  const dir = v >= 0 ? "right" : "left";
  return (
    '<span class="bar"><i style="width:' + width.toFixed(0) + '%;background:' + color +
    ';margin-' + dir + ':0"></i></span>'
  );
}

function renderSignals(status) {
  const rows = $("rows");
  if (!status || !status.snapshot || !status.snapshot.prices) {
    rows.innerHTML = '<tr><td colspan="7" class="err">아직 스냅샷이 없습니다. 크론 실행을 기다리거나 /api/refresh 를 호출하세요.</td></tr>';
    return;
  }
  rows.innerHTML = status.snapshot.prices
    .map(function (p) {
      return (
        '<tr>' +
        '<td class="coin">' + p.coin + "</td>" +
        "<td>" + fmtKrw(p.bithumbKrw) + "</td>" +
        "<td>" + fmtUsdt(p.binanceUsdt) + "</td>" +
        "<td>" + fmtKrw(p.binanceKrw) + "</td>" +
        '<td class="' + pctClass(p.premiumPct) + '">' + barPct(p.premiumPct) + fmtPct(p.premiumPct) + "</td>" +
        '<td class="' + pctClass(p.netPct) + '">' + fmtPct(p.netPct) + "</td>" +
        "<td>" + badge(actionFor(p.coin, status)) + "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function actionFor(coin, status) {
  if (status.snapshot) {
    const p = status.snapshot.prices.find(function (x) { return x.coin === coin; });
    if (p) {
      const threshold = status.thresholdPct;
      if (p.premiumPct >= threshold) return "BITHUMB_SELL";
      if (p.premiumPct <= -threshold) return "BITHUMB_BUY";
    }
  }
  return "NEUTRAL";
}

function sparkline(points) {
  if (!points || points.length === 0) return "";
  const w = 260, h = 28;
  const vals = points.map(function (p) { return p.p; }).filter(function (v) { return Number.isFinite(v); });
  if (vals.length === 0) return "";
  let min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  if (max - min < 0.5) { max += 0.25; min -= 0.25; }
  const pts = vals.map(function (v, i) {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 4) - 2;
    return x.toFixed(1) + "," + y.toFixed(1);
  });
  const color = vals[vals.length - 1] >= 0 ? "#f85149" : "#3fb950";
  return (
    '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">' +
    '<polyline fill="none" stroke="' + color + '" stroke-width="1.5" points="' + pts.join(" ") + '"/></svg>'
  );
}

function renderSparks(status) {
  const rows = $("sparks");
  const history = status && status.history ? status.history : [];
  if (history.length === 0) {
    rows.innerHTML = '<tr><td colspan="2" class="loading">아직 히스토리가 없습니다.</td></tr>';
    return;
  }
  const coins = ["BTC", "ETH", "SOL", "XRP"];
  rows.innerHTML = coins
    .map(function (coin) {
      const points = history.map(function (h) {
        return { p: h.p[coin] };
      }).filter(function (x) { return x.p !== undefined; });
      return "<tr><td class=\"coin\">" + coin + "</td><td>" + sparkline(points) + "</td></tr>";
    })
    .join("");
}

function renderMeta(status, signals) {
  const el = $("meta");
  if (!status || !status.snapshot) {
    el.innerHTML = '<span class="err">스냅샷 없음</span>';
    return;
  }
  const s = status.snapshot;
  const threshold = signals && signals.thresholdPct != null ? signals.thresholdPct : "—";
  const fxLabel = s.fxSource === "bithumb-usdt" ? "빗썸 KRW-USDT" : "두나무 환율";
  const ago = Math.max(0, Math.round((Date.now() - s.fetchedAtMs) / 60000));
  const stale = ago > 10 ? '<span class="stale">⚠ stale ' + ago + "분 전</span>" : "최신";
  el.innerHTML =
    '<span>환율(USD/KRW): <b>' + nf2.format(s.usdKrw) + "</b> (" + fxLabel + ")</span>" +
    '<span>시그널 임계값: <b>±' + threshold + "%</b></span>" +
    "<span>상태: " + stale + "</span>";
}

function renderUpdated(status) {
  const el = $("updated");
  if (!status || !status.snapshot) {
    el.textContent = "데이터 없음";
    return;
  }
  const d = new Date(status.snapshot.fetchedAt);
  const kst = d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  el.textContent = "마지막 갱신: " + kst + " (KST)";
}

async function refresh() {
  try {
    const [status, signals] = await Promise.all([
      fetch("/api/status").then(function (r) { return r.json(); }),
      fetch("/api/signals").then(function (r) { return r.json(); }),
    ]);
    renderSignals(status);
    renderSparks(status);
    renderMeta(status, signals);
    renderUpdated(status);
  } catch (e) {
    $("rows").innerHTML = '<tr><td colspan="7" class="err">로드 실패: ' + e + "</td></tr>";
  }
}

refresh();
setInterval(refresh, 60000);
