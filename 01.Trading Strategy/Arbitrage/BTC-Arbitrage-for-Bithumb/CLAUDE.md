# BTC-Arbitrage-for-Bithumb

> 프로젝트 루트. 작업 시 이 파일을 먼저 읽고 규칙을 지킬 것.
> 문서: [`readme.md`](./readme.md) · [`README.md`](./README.md) · [`docs/DEVELOPMENT-PLAN.md`](./docs/DEVELOPMENT-PLAN.md)

## 목표
빗썸(KRW)과 바이낸스(USDT)의 가격 차이(김치 프리미엄)를 비교해 차익거래 시그널을 알려주는 서버리스 시그널 봇.
Cloudflare Workers(5분 크론) + 정적 대시보드 + 텔레그램 알림. **자동 매매는 하지 않음.**

## 스택 (아키텍처 결정 2026-08-27)
- **단일 Cloudflare Worker**: 크론(`*/5 * * * *`) + `/api/*` JSON API + 정적 자산(`worker/static/`)을 한 앱으로 배포
- **Cloudflare KV** (`ARB_DATA`): 스냅샷 최신본·히스토리(48개)·코인별 알림 상태 저장
- **공개 API만 사용** (키 불필요): 빗썸 `/v1/ticker`, 바이낸스 `/api/v3/ticker/price`(+`data-api.binance.vision` 폴백), 환율(빗썸 `KRW-USDT` → 두나무 폴백)
- **시크릿**: `TELEGRAM_BOT_TOKEN`·`TELEGRAM_CHAT_ID`·`ADMIN_TOKEN` — 코드/레포 커밋 금지. 로컬은 `.dev.vars`, 배포는 `wrangler secret put`
- **시그널 엔진은 순수 함수** (`worker/src/signals.ts`): 외부 의존성 없이 테스트

## 절대 규칙
1. **시그널은 수수료·출금비 반영 추정치**. 실제 실행 가능성·슬리피지를 보장하지 않는다고 명시
2. **과세·규제 고지 필수** — README·대시보드에 주의 고지 표시. 자동 매매·자동 출금 기능 추가 금지(연구 목적 유지)
3. **API 키 하드코딩·커밋 금지**. 시크릿은 `Env` 인터페이스에 optional(`?`)로 선언 → 키 없이도 빌드·테스트 가능
4. **미리 계산·저장 후 읽기**: 크론이 KV에 저장, `/api/*`는 연산 없이 KV만 읽음 + 엣지 캐시
5. **신호 알림 스팸 방지**: 히스테리시스(트리거 `±1.5%` / 해제 `±0.5%`) + 코인별 쿨다운(30분) 로직을 유지
6. **공개 시세는 폴백 필수**: 지역 차단·일시 장애 견딜 수 있게 이중 경로
7. 한국어 UI 기본. 등락색은 한국식(적=상승 프리미엄, 청=하락 프리미엄)

## 디렉터리
```
worker/src/          Worker 코드 (index·api·scan·signals·config·storage·alerts·env·providers)
worker/static/       정적 대시보드 (index.html + app.js)
test/                vitest 테스트 (node env, 네트워크는 mock)
docs/                개발 계획 등 문서
wrangler.jsonc       Workers 설정 (크론·KV·정적 자산·vars)
```

## 참조
- 빗썸 Open API: https://apidocs.bithumb.com/reference/현재가-조회 (Public API 분류당 150 req/s)
- bithumb-ai-trade-kit: https://github.com/bithumb-official/bithumb-ai-trade-kit
- 바이낸스 Market Data: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints

## 로컬 개발/검증
Cloudflare 계정 없이도 빌드·테스트 가능. 공개 API는 실데이터로 동작.
```bash
npm install
cp .dev.vars.example .dev.vars     # 텔레그램 토큰 등 (선택)
npm run dev                        # wrangler dev --test-scheduled
npm test                           # vitest
npm run typecheck                  # tsc --noEmit
# 수동 스캔: curl "http://localhost:8787/api/refresh?token=<ADMIN_TOKEN>"
# 크론 테스트: curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"
```
배포: `wrangler kv namespace create ARB_DATA` → `wrangler.jsonc`에 id 입력 → `wrangler secret put ...` → `npm run deploy`.
