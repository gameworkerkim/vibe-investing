/**
 * Render vi_browser.show_chart() payloads with Chart.js.
 * Supports single series (values) or multi series (datasets).
 */

let chartInstance = null;
let chartJsPromise = null;

const PALETTE = [
  "#b6f34d",
  "#7ec8ff",
  "#f0c27a",
  "#c4a0ff",
  "#ff7b72",
  "#9ae6b4",
];

function loadChartJs() {
  if (globalThis.Chart) return Promise.resolve(globalThis.Chart);
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
    s.onload = () => resolve(globalThis.Chart);
    s.onerror = () => reject(new Error("Failed to load Chart.js"));
    document.head.appendChild(s);
  });
  return chartJsPromise;
}

function setChartEmpty(empty) {
  const wrap = document.getElementById("chart-wrap");
  const titleEl = document.getElementById("chart-title");
  if (wrap) {
    wrap.hidden = false;
    wrap.classList.toggle("is-empty", !!empty);
  }
  if (titleEl) titleEl.hidden = !!empty;
}

export function clearChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  const canvas = document.getElementById("chart-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  setChartEmpty(true);
  try {
    delete globalThis.__VQ_CHART__;
  } catch {
    globalThis.__VQ_CHART__ = null;
  }
}

function buildDatasets(payload) {
  if (Array.isArray(payload.datasets) && payload.datasets.length) {
    return payload.datasets.map((ds, i) => {
      const color = PALETTE[i % PALETTE.length];
      return {
        label: ds.label || `s${i}`,
        data: (ds.values || []).map((v) => (v == null ? null : Number(v))),
        borderColor: color,
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.15,
        fill: false,
        spanGaps: true,
      };
    });
  }
  const values = Array.isArray(payload.values) ? payload.values.map((v) => (v == null ? null : Number(v))) : [];
  return [
    {
      label: payload.series_label || payload.title || "series",
      data: values,
      borderColor: PALETTE[0],
      backgroundColor: "rgba(182, 243, 77, 0.12)",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.15,
      fill: true,
      spanGaps: true,
    },
  ];
}

export async function renderChartFromWindow() {
  const payload = globalThis.__VQ_CHART__;
  const wrap = document.getElementById("chart-wrap");
  const canvas = document.getElementById("chart-canvas");
  const titleEl = document.getElementById("chart-title");
  if (!payload || !wrap || !canvas) {
    clearChart();
    return false;
  }

  const labels = Array.isArray(payload.labels) ? payload.labels : [];
  const datasets = buildDatasets(payload);
  const hasPoints = datasets.some((d) => d.data.some((v) => v != null));
  if (!labels.length || !datasets.length || !hasPoints) {
    clearChart();
    return false;
  }

  await loadChartJs();
  if (chartInstance) chartInstance.destroy();

  setChartEmpty(false);
  if (titleEl) {
    titleEl.hidden = false;
    titleEl.textContent = payload.title || "Chart";
  }

  const multi = datasets.length > 1;
  chartInstance = new globalThis.Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: multi,
          labels: { color: "#8aa99c", boxWidth: 12, font: { size: 11 } },
        },
      },
      scales: {
        x: {
          ticks: { color: "#8aa99c", maxTicksLimit: 8, font: { size: 10 } },
          grid: { color: "rgba(232, 245, 240, 0.06)" },
        },
        y: {
          ticks: { color: "#8aa99c", font: { size: 10 } },
          grid: { color: "rgba(232, 245, 240, 0.06)" },
        },
      },
    },
  });
  return true;
}
