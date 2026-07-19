# LLM Quant 출력 스키마

DeepSeek ↔ Pyodide 실행기 사이의 위원회 스테이지 계약입니다.

영문: [LLM_OUTPUT_SCHEMA.md](LLM_OUTPUT_SCHEMA.md)

## Worker → Pages 응답

```json
{
  "ok": true,
  "mode": "answer | python | hybrid",
  "answer": "사용자 언어 설명",
  "python": "string | null",
  "model": "deepseek-v4-pro | deepseek-v4-flash",
  "finance": true
}
```

| 필드 | 의미 |
|---|---|
| `mode=answer` | 설명만 (`python` null) |
| `mode=python` | 실행 가능한 `vi_browser` 스크립트 필수 |
| `mode=hybrid` | 짧은 답 + 검증용 파이썬 |

## DeepSeek가 내야 하는 JSON

```json
{
  "mode": "answer | python | hybrid",
  "answer": "string",
  "python": "string | null",
  "notes": "가정 / 한계",
  "risks": "선택 — 짧은 리스크 고지"
}
```

## 허용 파이썬 표면

`vi_browser` import만. `get_candles`는 async. `days` ≤ 180 권장.  
`os` / `subprocess` / `eval` / `exec` / `open` / `requests` 금지.

## 골든 프롬프트

UI 칩: `pages/js/llm-prompts.js`

## 다음 슬라이스

- 성공 프롬프트·stdout R2 아카이브 (사람 평가)
- 동일 시세 스냅샷 멀티 모델 bake-off
