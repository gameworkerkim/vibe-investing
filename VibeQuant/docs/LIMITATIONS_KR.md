# 한계 — 냉정한 평가

이 문서는 **하드 제약과 알려진 고장**을 나열합니다. Cloudflare 무료 티어 + Pyodide
대시보드 개발의 제품 진실로 취급하세요. 여기 항목을 README/ROADMAP에서 “완료”로
표시하려면 해당 항목을 이 문서에서 제거한 뒤에만 가능합니다.

## 1. 제품 목표 vs 약속하지 않는 것

| 목표 | 약속하지 않음 |
|---|---|
| GS Quant API 레벨 대체 | 전체 표면 패리티, Marquee 데이터셋, GS 인증 |
| 동일 클래스/메서드명 (`Gs`→`Vi`) | 골드만삭스와 동일 수치 |
| 대시보드 Python 스크립트 | 사용자 코드의 서버측 실행 |
| Cloudflare Free 호스팅 | 무제한 종목·분봉·전 세계 유니버스 ingest |

## 2. Cloudflare Free — 하드스톱

| 한도 | 대략 값 | 기능 영향 |
|---|---|---|
| Worker CPU / 요청 | **10 ms** | Worker 내 대용량 JSON/Yahoo 파싱 실패 또는 연기 필요 |
| Worker CPU / Cron | **10 ms** | 일일 Cron 대량 ingest 불가 — lazy fill 우선 |
| 요청 / 일 | **100,000** | API+Cron 공유; 공개 남용 시 쿼터 소진 |
| 서브요청 / 요청 | **50** | TOSS 깊은 페이지네이션 루프 실패 |
| Worker 번들 | **3 MB** | 비대한 npm 시세 SDK 부적합 — 얇은 `fetch` 파서 |
| D1 쓰기 / 일 | **100,000** | 모든 봉을 D1에 저장 금지 |
| KV 쓰기 / 일 | **~1,000** | Free에서 KV를 주 캐시로 쓰지 말 것 — Cache API |
| 계정 Cron 수 | **5** | Phase 1은 단순 스케줄 하나 |
| **TOSS API — Worker에 고정 IP 없음** | **Free에서 차단** | Cloudflare Free Workers는 공유 IP 풀; TOSS는 IP 화이트리스트 요구 → Worker 직통 불가. [WORKER_TOSS_IP.md](WORKER_TOSS_IP.md) 참조. |

**지연 기대치 (정직):**

- 캐시 히트 (엣지): 보통 수십 ms.
- R2 읽기 + Worker: 종종 50–200 ms+.
- Cold lazy Yahoo fill: 제공자에 따라 **수 초**; CPU 예산에 걸려 실패 가능.
- Pyodide 첫 로드 (pandas/numpy): 첫 방문 **수 초~수십 초**.

## 3. Pyodide / 브라우저 계산 — 하드스톱

| 제약 | 영향 |
|---|---|
| 네이티브 확장 없음 | 대시보드에서 **QuantLib 불가** |
| 패키지 크기 / 메모리 | 전체 `vi_quant` 트리 **로드 불가**; 얇은 `vi_browser`만 |
| 브라우저 RAM | 대형 멀티에셋 백테스트는 OOM 또는 탭 정지 |
| 시크릿 접근 없음 | 웹뷰에 TOSS OAuth 불가 |
| UI 단일 스레드 | 긴 스크립트는 청크하지 않으면 탭 블로킹 |
| 수치 패리티 | 함수명 동일 ≠ CPython 로컬/`vi_quant` 또는 GS와 동일 float |

**대시보드 내 (데모 스테이지):** `get_candles`, `returns`, `volatility`,
`moving_average`, `correlation`, `max_drawdown`, `zscores`, `beta`,
`annualized_return`, `sharpe_ratio`, `rsi`, `macd`, `bollinger_bands`,
`backtest`, `ma_cross_signal`, `show_chart`.

**교육용 백테스트 상한:** `days` ≤ 500 권장; 단일 종목; 다음 봉 규칙만.
멀티에셋·분봉 엔진은 브라우저 범위 밖.

**대시보드 밖:** `IRSwap.calc`, GS식 풀 백테스트 엔진, `ViDataApi`/벤치마크 의존 econometrics,
원격 Dataset 기반 공휴일 캘린더, **TOSS 실시간** (Worker IP — 별도 ingest로 후순위).

## 4. 알려진 코드 고장 (현재 로컬 `vi_quant`)

저장소에 **지금** 존재하며 동작한다고 광고하면 안 됩니다:

| 이슈 | 영향 |
|---|---|
| `vi_quant.base`가 없는 `json_convertors` import | 모듈 import 실패 |
| 공휴일 `Dataset` stub / `.id` 부재 | 강제 시 캘린더 크래시; 기본값은 공휴일을 영업일로 오판 |
| `sharpe_ratio` / `excess_returns` 기본 경로 | `ViDataApi`로 `NotImplementedError` |
| stub `Asset`에 `get_marquee_id` 없음 | Asset 기반 econometrics 실패 |
| Python provider가 예외를 삼킴 | 빈 데이터가 “종목 없음”처럼 보임 |
| Express `backend` ↔ `ViSession.domain` | E2E 미연결; 이중 스택 |
| Express `/api/health` 마운트 버그 | 레거시 서버 사용 시 404 가능 |
| Neon 스키마 미사용; Vercel cron 경로 부재 | “DB/cron 구현” 주장은 과장되었음 |

## 5. GS Quant 호환 — 사용자 기대가 깨지는 지점

| 사용자 기대 | 실제 |
|---|---|
| `pip` 설치로 Marquee 워크플로 대체 | 오프라인/오픈 서브셋만; 다수 API stub |
| Marquee식 `Dataset('...')` | Stub / 진행 중; ID가 GS와 다름 |
| 영업일 유틸이 “그냥 동작” | 실제 공휴일 피드 없으면 틀리거나 크래시 |
| 아무 gs-quant 노트북이나 한 줄 마이그레이션 | 가격·리스크·포트폴리오·스크린에는 거짓 |
| 대시보드 = 풀 리서치 워크스테이션 | 대시보드 = **작은 API 서브셋 검증 샌드박스** |

## 6. 보안 제약 (대시보드)

- 사용자 코드는 **사용자 브라우저**에서 실행 (멀티테넌트 서버 샌드박스 아님).
- 그래도 사용자 기기 기준으로는 스크립트를 불신 (UI XSS 주의).
- Worker는 업스트림 시크릿을 에러 본문에 반사하지 말 것.
- Free 레이트리밋은 거칠다; 스크래핑 시 쿼터 소진을 예상할 것.

## 7. Free / WASM을 떠나는 시점 (명시적 분기)

Phase 1 Exit 이후, 그리고 새 Phase로 문서화할 때만:

- 더 무거운 ingest CPU를 위한 Workers Paid
- 서버측 노트북용 별도 Python 샌드박스 호스트 (Cloudflare Pages 아님)
- 로컬 QuantLib 패리티 트랙 (ROADMAP Phase 2)

그 전까지 에이전트·기여자는 Free + Pyodide 설계를 구현하며, 숨겨진 유료 아키텍처를
가정하지 말 것.
