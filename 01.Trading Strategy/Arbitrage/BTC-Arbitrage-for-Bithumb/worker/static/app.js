"use strict";

const nf0 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const REFRESH_MS = 60000;
// 크론이 5분 주기이므로 10분 넘게 안 바뀌면 스캔이 죽은 것으로 본다.
const STALE_MIN = 10;

function $(id) {
  return document.getElementById(id);
}

/** 서버 값을 innerHTML 로 넣기 전에 escape (문자열 필드가 그대로 마크업이 되지 않도록) */
function esc(v) {
  return String(v).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function fmtKrw(v) {
  return num(v) === null ? "—" : nf0.format(v) + " KRW";
}

function fmtUsdt(v) {
  return num(v) === null ? "—" : nf2.format(v) + " USDT";
}

function fmtPct(v) {
  if (num(v) === null) return "—";
  const sign = v > 0 ? "+" : "";
  return sign + nf2.format(v) + "%";
}

function pctClass(v) {
  if (num(v) === null || v === 0) return "";
  return v > 0 ? "pos" : "neg";
}

function badge(action) {
  if (action === "BITHUMB_SELL") return '<span class="badge-sell">빗썸 매도</span>';
  if (action === "BITHUMB_BUY") return '<span class="badge-buy">빗썸 매수</span>';
  return '<span class="badge-wait">대기</span>';
}

function barPct(v) {
  if (num(v) === null) return "";
  const width = Math.min(Math.abs(v) * 20, 100);
  const color = v >= 0 ? "var(--red)" : "var(--green)";
  const dir = v >= 0 ? "right" : "left";
  return (
    '<span class="bar"><i style="width:' + width.toFixed(0) + '%;background:' + color +
    ";margin-" + dir + ':0"></i></span>'
  );
}

/**
 * 코인별 시그널 판정.
 * 임계값은 /api/status·/api/signals 응답의 thresholdPct 에서 온다.
 * (과거에는 status 에 없는 필드를 읽어 항상 undefined → 모든 행이 "대기"로 보였다.)
 */
function actionFor(coin, premiumPct, threshold, signals) {
  if (signals && Array.isArray(signals.signals)) {
    const found = signals.signals.find(function (s) { return s.coin === coin; });
    if (found) return found.action;
  }
  if (num(premiumPct) === null || num(threshold) === null) return "NEUTRAL";
  if (premiumPct >= threshold) return "BITHUMB_SELL";
  if (premiumPct <= -threshold) return "BITHUMB_BUY";
  return "NEUTRAL";
}

function renderSignals(status, signals) {
  const rows = $("rows");
  if (!status || !status.snapshot || !status.snapshot.prices) {
    rows.innerHTML =
      '<tr><td colspan="7" class="err">아직 스냅샷이 없습니다. 크론 실행을 기다리거나 /api/refresh 를 호출하세요.</td></tr>';
    return;
  }
  const threshold = num(status.thresholdPct) !== null
    ? status.thresholdPct
    : (signals ? num(signals.thresholdPct) : null);

  rows.innerHTML = status.snapshot.prices
    .map(function (p) {
      const action = actionFor(p.coin, p.premiumPct, threshold, signals);
      return (
        "<tr>" +
        '<td class="coin">' + esc(p.coin) + "</td>" +
        "<td>" + fmtKrw(p.bithumbKrw) + "</td>" +
        "<td>" + fmtUsdt(p.binanceUsdt) + "</td>" +
        "<td>" + fmtKrw(p.binanceKrw) + "</td>" +
        '<td class="' + pctClass(p.premiumPct) + '">' + barPct(p.premiumPct) + fmtPct(p.premiumPct) + "</td>" +
        '<td class="' + pctClass(p.netPct) + '">' + fmtPct(p.netPct) + "</td>" +
        "<td>" + badge(action) + "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function sparkline(vals) {
  const w = 260, h = 28;
  if (!vals || vals.length === 0) return "";
  // 점이 하나뿐이면 (i / (n-1)) 이 0/0 → NaN 좌표가 되어 SVG 가 깨진다. 가로선으로 그린다.
  if (vals.length === 1) {
    const mid = (h / 2).toFixed(1);
    return (
      '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">' +
      '<polyline fill="none" stroke="#8b949e" stroke-width="1.5" points="0,' + mid + " " + w + "," + mid + '"/></svg>'
    );
  }
  let min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  if (max - min < 0.5) { max += 0.25; min -= 0.25; }
  const span = max - min;
  const pts = vals.map(function (v, i) {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
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
  // 감시 코인은 COINS 설정으로 바뀔 수 있으므로 스냅샷에서 가져온다 (하드코딩 금지).
  const coins = status.snapshot && status.snapshot.prices
    ? status.snapshot.prices.map(function (p) { return p.coin; })
    : Object.keys(history[history.length - 1].p || {});

  rows.innerHTML = coins
    .map(function (coin) {
      const vals = history
        .map(function (h) { return h.p ? h.p[coin] : null; })
        .filter(function (v) { return num(v) !== null; });
      return '<tr><td class="coin">' + esc(coin) + "</td><td>" + sparkline(vals) + "</td></tr>";
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
  const t = num(status.thresholdPct) !== null
    ? status.thresholdPct
    : (signals ? num(signals.thresholdPct) : null);
  const threshold = t === null ? "—" : nf2.format(t);
  const fxLabel = s.fxSource === "bithumb-usdt" ? "빗썸 KRW-USDT" : "두나무 환율";
  const basis = status.fxMode === "fx" ? "헤드라인 김프" : "실행 가능 스프레드";
  const ago = Math.max(0, Math.round((Date.now() - s.fetchedAtMs) / 60000));
  const stale = ago > STALE_MIN ? '<span class="stale">⚠ stale ' + ago + "분 전</span>" : "최신";
  el.innerHTML =
    "<span>환산율(USD/KRW): <b>" + fmtNum(s.usdKrw) + "</b> (" + fxLabel + " · " + basis + ")</span>" +
    "<span>시그널 임계값: <b>±" + threshold + "%</b></span>" +
    "<span>상태: " + stale + "</span>";
}

function fmtNum(v) {
  return num(v) === null ? "—" : nf2.format(v);
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

async function getJson(path) {
  // no-store: 대시보드는 항상 최신 스냅샷을 봐야 한다. 엣지 캐시는 서버 헤더로 따로 제어한다.
  const res = await fetch(path, { headers: { accept: "application/json" }, cache: "no-store" });
  // r.json() 만 부르면 500 이 HTML 을 돌려줄 때 파싱 오류로 뭉개진다.
  if (!res.ok) throw new Error(path + " → HTTP " + res.status);
  return res.json();
}

async function refresh() {
  try {
    const [status, signals] = await Promise.all([getJson("/api/status"), getJson("/api/signals")]);
    renderSignals(status, signals);
    renderSparks(status);
    renderMeta(status, signals);
    renderUpdated(status);
  } catch (e) {
    $("rows").innerHTML =
      '<tr><td colspan="7" class="err">로드 실패: ' + esc(e && e.message ? e.message : e) + "</td></tr>";
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
