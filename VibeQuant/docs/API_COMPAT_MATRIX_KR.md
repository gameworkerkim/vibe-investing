# API 호환 매트릭스

**목적:** 위원회 스테이지용 pass/fail 표. 계층:

| 계층 | 런타임 | 의미 |
|------|--------|------|
| **browser** | Pyodide + `vi_browser` | 웹뷰에서 오늘 동작 |
| **local** | CPython + `vi_quant` | `pip install -e .` 서브셋 |
| **stub** | 존재하나 미구현 | import는 되나 실사용 불가 |
| **planned** | 로드맵만 | 미구현 |

이름 매핑: [API_MAPPING_KR.md](API_MAPPING_KR.md). 한계: [LIMITATIONS_KR.md](LIMITATIONS_KR.md). 로드맵: [../ROADMAP_KR.md](../ROADMAP_KR.md).

**범례:** ✅ pass · ⚠️ 부분 · ❌ fail / N/A

---

## 1. 데이터 접근

| API | GS 대응 | browser | local | stub | 메모 |
|-----|---------|---------|-------|------|------|
| `vi_browser.get_candles` | Dataset / GsDataApi | ✅ | ✅ | — | 위원회 주경로 |
| `vi_browser.get_prices` | 일괄 최종가 | ✅ Phase 2 | ✅ | — | 캔들 라우팅 |
| `vi_browser.get_last_price` | 최근 봉 | ✅ Phase 2 | ✅ | — | |
| `vi_browser.get_asset` | GsAssetApi thin | ✅ Phase 2 | ✅ | — | Worker `/assets` |
| `ViDataApi.get_market_data` | GsDataApi | ⚠️ thin | ❌ | ✅ | 브라우저는 `get_candles` 권장 |
| `Dataset` / Marquee | gs_quant.data | ❌ | stub/planned | — | WASM 불가 |
| `provider='toss'` | KR 브로커 | ❌ 후순위 | — | — | WORKER_TOSS_IP.md |

**Worker 라우트**

| 라우트 | 상태 | 메모 |
|--------|------|------|
| `GET /api/v1/candles/:provider/:symbol` | ✅ | Cache → R2 → Yahoo |
| `GET /api/v1/assets/:provider/:symbol` | ✅ Phase 2 | D1 + 휴리스틱 |
| `GET /api/v1/prices/:provider?symbols=` | ✅ Phase 2 | 최근 종가 |
| `GET /api/v1/market-data/:provider/:symbol` | ✅ Phase 2 | last price 별칭 |
| `GET /api/v1/watchlist` | ✅ | 상한 50 |

---

## 2. 시계열 (위원회 핵심)

| API | GS 대응 | browser | local | 메모 |
|-----|---------|---------|-------|------|
| `returns` | returns | ✅ | ✅ | |
| `volatility` | volatility | ✅ | ✅ | 브라우저: 연율화 윈도우 |
| `moving_average` / `sma` | moving_average | ✅ | ✅ | |
| `ema` / `exponential_moving_average` | exponential_moving_average | ✅ Phase 1 | ✅ (API 다름) | 브라우저는 **span** EMA |
| `momentum` | — | ✅ | — | |
| `change` | change | ✅ Phase 1 | ✅ | \(X_t - X_0\) |
| `index` | index | ✅ Phase 1 | ✅ | \(initial \cdot X_t / X_0\) |
| `percentiles` | percentiles | ✅ Phase 1 | ✅ | 단순 rolling rank |
| `correlation` / `zscores` / `beta` | 동명 | ✅ | ✅ | |
| `max_drawdown` | max_drawdown | ✅ | ✅ | 브라우저: 스칼라 MDD |
| `rsi` / `macd` / `bollinger_bands` | technicals | ✅ | ✅/부분 | |
| Window / DateOffset 전부 | Window | ❌ | ⚠️ | 브라우저 미지원 |

---

## 3. 백테스트·시각화

| API | browser | local | 메모 |
|-----|---------|-------|------|
| `backtest` / `ma_cross_signal` | ✅ | ✅ | 교육용 next-bar |
| `show_chart` | ✅ | print stub | Chart.js |
| `gs_quant.backtests` 엔진 | ❌ | planned/stub | WASM 불가 |

---

## 4. 세션 / 상품 / 리스크

| API | browser | local | 메모 |
|-----|---------|-------|------|
| `ViSession` | ❌ (`vi_browser` 사용) | ✅ 부분 | Marquee OAuth 없음 |
| `IRSwap` / QuantLib | ❌ | planned | 데스크톱만 |
| `ViRiskApi` | ❌ | stub/planned | |

---

## 5. 위원회 pass 기준

브라우저 스테이지 **pass**:

1. `vi_browser`(또는 문서화된 thin 별칭)만 import
2. `get_candles` / `get_prices` / `get_asset`로 시세
3. 표에 있는 시계열·교육용 백테스트만 사용
4. 동일 캔들 스냅샷에서 지표 재현

QuantLib·Marquee Dataset·TOSS 실시간은 설계상 **fail** (후속 Phase).

---

## 동기화 체크리스트

브라우저 API 추가 시:

1. `vi_browser/` 구현
2. `pages/js/pyodide-runner.js` 리스트형 미러
3. bootstrap `__vq_entry` import
4. 이 표 + `api-catalog.js` 샘플
5. ROADMAP Phase 0–2 Exit 시 체크
