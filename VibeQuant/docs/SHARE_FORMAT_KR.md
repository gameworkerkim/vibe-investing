# 커뮤니티 공유 포맷

위원회 스테이지 **Phase 3** 평가용 JSON(또는 JS 모듈) 아티팩트.
브라우저 전용 실행 — 서버 `exec` 금지.

영문: [SHARE_FORMAT.md](SHARE_FORMAT.md) · 루브릭: [COMMUNITY_RUBRIC_KR.md](COMMUNITY_RUBRIC_KR.md)

## 스키마 (v1)

| 필드 | 타입 | 필수 | 메모 |
|------|------|------|------|
| `schema` | string | yes | `"vibequant.share/v1"` |
| `id` | string | yes | 예: `share-ma-cross-005930` |
| `title_en` / `title_ko` / `title_zh` | string | yes (en) | 칩 라벨 |
| `author` | string | yes | 표시 이름 |
| `python` | string | yes | Pyodide + `vi_browser`에서 실행 가능 |
| `data` | object | yes | `{ provider, symbols[], days }` |
| `expected` | object | yes | 루브릭 마커 |
| `disclosures` | string[] | yes | 한계·투자조언 아님 등 |
| `limits` | string[] | no | 추가 하드 리밋 |
| `source_url` | string | no | gist/레포 링크 (v1은 표시만) |

### `expected`

```json
{
  "stdout_markers": ["VQ_METRICS", "total_return=", "mdd=", "sharpe=", "cagr="],
  "source_ok": ["yahoo", "r2", "cache", "candles"]
}
```

스크립트는 다음 한 줄을 출력:

```text
VQ_METRICS total_return=0.12 mdd=-0.08 sharpe=0.45 cagr=0.09
```

실시세 변동으로 **수치 완전 일치는 요구하지 않음**. 마커·성공 실행·고지가 기준.

## 번들 샘플

레포 내: `pages/js/community-samples.js` → `COMMUNITY_SAMPLES`.

## 안전

- Pyodide 브라우저 실행만.
- 공유 Python을 Worker에서 `exec`하는 API 추가 금지.
- `vi_browser` 권장; `vi_compat`의 thin `gs_quant.timeseries` 별칭 OK.
