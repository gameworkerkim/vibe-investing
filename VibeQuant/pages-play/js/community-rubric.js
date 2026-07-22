/**
 * Score a community share run against SHARE_FORMAT expected markers.
 * See docs/COMMUNITY_RUBRIC.md
 */

/**
 * @param {string} stdout
 * @param {object} artifact
 * @param {{ ok?: boolean }} [runMeta]
 */
export function scoreCommunityRun(stdout, artifact, runMeta = {}) {
  const text = String(stdout || "");
  const expected = artifact?.expected || {};
  const markers = Array.isArray(expected.stdout_markers) ? expected.stdout_markers : [];
  const sourceOk = Array.isArray(expected.source_ok) ? expected.source_ok : ["yahoo", "r2", "cache", "candles"];

  const hasTraceback = text.includes("Traceback (most recent call last)");
  const runOk = runMeta.ok !== false && !hasTraceback;

  const missingMarkers = markers.filter((m) => !text.includes(m));
  const metricsPass = markers.length > 0 && missingMarkers.length === 0;

  const sourceMatch = text.match(/source=([a-z0-9_]+)/i);
  const sourceVal = sourceMatch ? sourceMatch[1].toLowerCase() : "";
  const mockOnly = /source=local_mock/i.test(text) && !sourceOk.includes("local_mock");
  const dataPass =
    sourceOk.some((s) => text.toLowerCase().includes(`source=${s.toLowerCase()}`)) ||
    (sourceVal && sourceOk.map((s) => s.toLowerCase()).includes(sourceVal));
  // If no source= line but Worker path printed provider/yahoo in banners — still fail soft if mockOnly
  const dataSourcePass = mockOnly ? false : dataPass || /provider=yahoo/i.test(text);

  const disclosures = Array.isArray(artifact?.disclosures) ? artifact.disclosures : [];
  const disclosuresPass = disclosures.length > 0;

  const checks = [
    {
      id: "reproducibility",
      pass: runOk,
      detail: runOk ? "ran without traceback" : "traceback or run failure",
    },
    {
      id: "risk_metrics",
      pass: metricsPass,
      detail: metricsPass
        ? `markers ok (${markers.length})`
        : `missing: ${missingMarkers.join(", ") || "none configured"}`,
    },
    {
      id: "data_source",
      pass: dataSourcePass,
      detail: dataSourcePass
        ? `source ok (${sourceVal || "provider hint"})`
        : mockOnly
          ? "local_mock only — Worker live path preferred"
          : "no allowed source= in stdout",
    },
    {
      id: "disclosures",
      pass: disclosuresPass,
      detail: disclosuresPass
        ? `${disclosures.length} disclosure(s)`
        : "artifact missing disclosures[]",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const metrics = parseVqMetrics(text);

  return {
    passed,
    total: checks.length,
    checks,
    metrics,
    disclosures,
    limits: Array.isArray(artifact?.limits) ? artifact.limits : [],
  };
}

/** @param {string} text */
export function parseVqMetrics(text) {
  const line = String(text)
    .split("\n")
    .find((l) => l.includes("VQ_METRICS"));
  if (!line) return {};
  const out = {};
  const re = /([a-zA-Z_][a-zA-Z0-9_]*)=(-?[0-9]+(?:\.[0-9]+)?(?:e-?[0-9]+)?)/g;
  let m;
  while ((m = re.exec(line))) {
    out[m[1]] = Number(m[2]);
  }
  return out;
}
