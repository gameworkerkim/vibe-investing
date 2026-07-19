# LLM Quant Prompt (한국어)

교육용 샌드박스: DeepSeek가 금융 답변 및/또는 브라우저(Pyodide)에서 돌릴 `vi_browser` 파이썬을 만듭니다.

시크릿(키) 입력은 **시크릿 매뉴얼**을 따르세요.

| 문서 | 언어 |
|---|---|
| [SECRETS_SETUP_KR.md](SECRETS_SETUP_KR.md) | 시크릿 전체 (DeepSeek / Cloudflare / TOSS) |
| [SECRETS_SETUP.md](SECRETS_SETUP.md) | Secrets (English) |
| [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md) | This feature (English) |

## DeepSeek 키 (요약)

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
./scripts/setup-deepseek.sh --remote
```

확인: `curl -sS https://vibequant-api.gameworker-4bb.workers.dev/api/health` → `deepseek.configured: true`

## 모델

| 선택 | API 모델 | 용도 |
|---|---|---|
| V4 Flash | `deepseek-v4-flash` | 기본 — 금융 게이트 + 빠른 퀀트 프롬프트 |
| V4 Pro | `deepseek-v4-pro` | 무거운 퀀트 로직 / 코드 생성 |

## API

`POST /api/v1/llm/quant-prompt`

```json
{ "prompt": "NVDA 22일 모멘텀?", "model": "flash" }
```

## 남용 방지

1. 브라우저·IP당 **30초 1회**
2. 금융만 (미국·한국 주식·크립토·퀀트). 거부 시 **1분** 캐시
3. 성공 결과 아카이브·사람 평가 — **후순위**

## 배포

```bash
cd cloudflare
npm run deploy:worker
npm run deploy:pages
```
