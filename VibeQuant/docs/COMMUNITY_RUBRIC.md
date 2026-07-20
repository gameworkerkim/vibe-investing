# Community evaluation rubric

Used by the dashboard after **Load → Run & score** on a shared artifact ([SHARE_FORMAT.md](SHARE_FORMAT.md)).

Korean: [COMMUNITY_RUBRIC_KR.md](COMMUNITY_RUBRIC_KR.md)

## Checks (equal weight)

| ID | Pass when |
|----|-----------|
| `reproducibility` | Run finishes without a Python traceback |
| `risk_metrics` | Every `expected.stdout_markers` substring appears in stdout |
| `data_source` | Stdout mentions an allowed source (`expected.source_ok`), or candles path without `local_mock` only if markers require live |
| `disclosures` | Artifact includes a non-empty `disclosures` array (author duty) |

Score = passed / 4. **Exit criterion:** one bundled external-style sample scores ≥ 3/4 on the stage (typically 4/4 with Worker Yahoo).

## Compare panel

UI shows:

- Pass/fail per check
- Parsed `VQ_METRICS` key=value pairs (informational; not equality-tested)
- Author disclosures / limits

## Non-goals

- Ranking strategies by Sharpe across authors
- Server-side grading
- Bit-identical equity curves across days
