/**
 * Render vi_browser.show_chart() payloads with Chart.js.
 */

let chartInstance = null;
let chartJsPromise = null;

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

export function clearChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  const wrap = document.getElementById("chart-wrap");
  const canvas = document.getElementById("chart-canvas");
  if (wrap) wrap.hidden = true;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  try {
    delete globalThis.__VQ_CHART__;
  } catch {
    globalThis.__VQ_CHART__ = null;
  }
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
  const values = Array.isArray(payload.values) ? payload.values.map(Number) : [];
  if (!labels.length || !values.length || labels.length !== values.length) {
    clearChart();
    return false;
  }

  await loadChartJs();
  if (chartInstance) chartInstance.destroy();

  wrap.hidden = false;
  if (titleEl) titleEl.textContent = payload.title || "Chart";

  const accent = "#b6f34d";
  chartInstance = new globalThis.Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: payload.series_label || payload.title || "series",
          data: values,
          borderColor: accent,
          backgroundColor: "rgba(182, 243, 77, 0.12)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.15,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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
