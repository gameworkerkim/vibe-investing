# Community share format

JSON (or JS module) artifact for **Phase 3** community evaluation on the committee stage.
Browser-only execution — never server `exec`.

Korean: [SHARE_FORMAT_KR.md](SHARE_FORMAT_KR.md) · Rubric: [COMMUNITY_RUBRIC.md](COMMUNITY_RUBRIC.md)

## Schema (v1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `schema` | string | yes | `"vibequant.share/v1"` |
| `id` | string | yes | Stable id, e.g. `share-ma-cross-005930` |
| `title_en` / `title_ko` / `title_zh` | string | yes (en) | Chip label |
| `author` | string | yes | Display name or handle |
| `python` | string | yes | Runnable on Pyodide + `vi_browser` (async OK) |
| `data` | object | yes | `{ provider, symbols[], days }` — must match script |
| `expected` | object | yes | Markers for rubric (see below) |
| `disclosures` | string[] | yes | Limits / not-advice / next-bar assumptions |
| `limits` | string[] | no | Extra hard limits (WASM, free Yahoo, …) |
| `source_url` | string | no | Optional gist/repo link (display only in v1) |

### `expected`

```json
{
  "stdout_markers": ["VQ_METRICS", "total_return=", "mdd=", "sharpe=", "cagr="],
  "source_ok": ["yahoo", "r2", "cache", "candles"]
}
```

Scripts should print a machine-readable line:

```text
VQ_METRICS total_return=0.12 mdd=-0.08 sharpe=0.45 cagr=0.09
```

Exact numeric equality is **not** required (live candles move). Rubric checks markers + successful run + disclosed limits.

## Bundled samples

In-repo (no fetch): `pages/js/community-samples.js` → `COMMUNITY_SAMPLES`.

Optional later: R2 `/cdn/samples/*.json` or gist URL loader.

## Safety

- Run only in the user’s browser via Pyodide.
- Do not add Worker endpoints that `exec` shared Python.
- Prefer `vi_browser` imports; thin `gs_quant.timeseries` aliases via `vi_compat` are OK.

## Example

See the `share-ma-cross-005930` entry in `community-samples.js`.
