# VibeQuant 배포·커밋 이력

**프로덕션 배포**와 그에 포함된 **git 커밋**을 남기는 로그입니다.
배포 방법: [cloudflare/DEPLOY_KR.md](../cloudflare/DEPLOY_KR.md).
로드맵: [ROADMAP_KR.md](../ROADMAP_KR.md).

| 문서 | 언어 |
|---|---|
| 이 파일 | 한국어 |
| [DEPLOY_HISTORY.md](DEPLOY_HISTORY.md) | English |

**고정 URL**

| 면 | URL |
|---|---|
| Pages (대시보드) | https://vibequant-web.pages.dev/ |
| Lab (TokenForge) | https://vibequant.cc/lab/ |
| Worker (API) | https://vibequant-api.gameworker-4bb.workers.dev |
| Health | https://vibequant-api.gameworker-4bb.workers.dev/api/health |
| TokenForge health | https://api.vibequant.cc/api/v1/tokenforge/health |

**명령 (`VibeQuant/cloudflare`에서)**

```bash
npm run deploy:worker
npm run deploy:pages
# 또는: ./scripts/deploy.sh
```

git push만으로는 Pages/Worker가 갱신되지 **않습니다**.

---

## 기록 추가 방법

프로덕션 배포마다 **배포 로그** 맨 위에 행을 추가합니다 (최신이 위):

1. 일시 (KST)
2. 배포한 `main` 커밋 SHA
3. Worker version ID (wrangler 출력) 및/또는 Pages 배포 URL
4. 변경 한 줄 요약

---

## 배포 로그

### 2026-07-20 (Pages 배포 예정) — Phase 3 커뮤니티 + 배포 이력 문서

| 항목 | 값 |
|---|---|
| Git | (이번 커밋) — Phase 3 UI/루브릭/공유 포맷 + DEPLOY_HISTORY |
| Pages | 푸시 후 `npm run deploy:pages` |
| 메모 | `#community`, `share-ma-cross-005930`, `vi_compat` |

### 2026-07-20 ~15:02 KST — API 호환 Phase 0–2

| 항목 | 값 |
|---|---|
| Git | `67cb4cc` on `main` — *Ship API compat Phases 0–2: matrix, timeseries shims, and data router.* |
| Worker | `vibequant-api` · Version ID `3f3945bf-83b4-412d-b29a-46df4c463784` · health `version: "0.3.0"` |
| Pages | 프로젝트 `vibequant-web` · 이번 배포 https://969d2f97.vibequant-web.pages.dev → 별칭 https://vibequant-web.pages.dev/ |
| 명령 | `npm run deploy:worker && npm run deploy:pages` |

**포함 내용**

- 로드맵을 API 호환 Phase 0–4로 재편; 기반(CF + Pyodide + 교육용 백테스트 + LLM 프롬프트) 완료 표시
- Phase 0: [API_COMPAT_MATRIX_KR.md](API_COMPAT_MATRIX_KR.md)
- Phase 1: 브라우저 시머 — `ema` / `sma`, `change`, `index`, `percentiles`
- Phase 2: 데이터 라우터 — `get_prices`, `get_asset`, `get_last_price`, thin `ViDataApi`
- Worker: `GET /api/v1/assets/...`, `/prices/...`, `/market-data/...`

**스모크 (배포 후)**

```bash
curl -sS https://vibequant-api.gameworker-4bb.workers.dev/api/health
# 기대: status=ok, version=0.3.0, assets/prices/market_data 필드 존재
```

---

## 커밋 이력 (VibeQuant 트랙, 최근)

`main`의 `VibeQuant/` 하위 커밋 (최신 위). 전체: `git log -- VibeQuant/`.

### 2026-07-20

| SHA | 제목 |
|---|---|
| `67cb4cc` | Ship API compat Phases 0–2: matrix, timeseries shims, and data router. |

### 2026-07-19 (위원회 스테이지 강화)

| SHA | 제목 |
|---|---|
| `dcb3738` | Polish manuals with screenshots and fix README doc tables. |
| `99d2dfd` | Update Korean user manual for clarity and detail |
| `0bc3339` | Add files via upload |
| `05ef4bf` | Default LLM Quant model to DeepSeek V4 Flash. |
| `9d19cae` | Add 2x2 workspace, user manuals, and finance-only LLM errors. |
| `d5d4e13` | Stack workspace as LLM prompt, Python, then result with copy actions. |
| `85de656` | Reject short candle caches and store a fuller Yahoo series in R2. |
| `d95f214` | Require None-safe formatting in LLM-generated Python. |
| `24e6809` | Add LLM prompt running spinner and progress phases. |
| `7bbf07e` | Tighten LLM Python contract for Pyodide vi_browser lists. |
| `e9135e2` | Polish LLM Quant Prompt: golden chips, schema checks, DeepSeek status. |
| `bab9005` | Document DeepSeek and secrets setup in English and Korean. |
| `23b2c4f` | Add LLM Quant Prompt with DeepSeek V4 Pro/Flash. |
| `7346eb9` | Improve Momentum example output, grades, and N/A ranking. |
| `010b4cf` | Fix demo sample formatting when indicator values are None. |
| `b1459bb` | Add semiconductor Examples demos for the web runner. |
| `5f38d9f` | Sync demo indicators with vi_browser and ship educational backtest. |
| `3c909b4` | Add RSI, MACD, Bollinger Bands + show_chart to vi_browser |
| `b65641d` | Document TOSS API IP limitation, close issue |
| `dcd0568` | Ship P0/P1 ops: TOSS Worker path, watchlist, security hooks, Pages UX. |
| `71087f8` | Add live demo screenshots to READMEs and ship Pages GS/VI UI. |
| `e0e3a25` | Vibe Quant Dashboard |

레포 루트 문서(예: `f0d391d` `llms.txt`)는 `VibeQuant/` 밖에 있을 수 있습니다.

---

## 관련 문서

- [cloudflare/DEPLOY_KR.md](../cloudflare/DEPLOY_KR.md) — 빌드·배포 방법
- [ROADMAP_KR.md](../ROADMAP_KR.md) — Phase 0–4 상태
- [API_COMPAT_MATRIX_KR.md](API_COMPAT_MATRIX_KR.md) — API pass/fail
- [LIMITATIONS_KR.md](LIMITATIONS_KR.md) — Free/WASM 하드스톱
