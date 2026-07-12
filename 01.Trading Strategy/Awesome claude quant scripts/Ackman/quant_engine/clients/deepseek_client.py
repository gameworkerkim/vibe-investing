"""
clients/deepseek_client.py — DeepSeek LLM 클라이언트

OpenAI 호환 REST 엔드포인트(POST /chat/completions)를 requests로 직접 호출한다.
DEEPSEEK_API_KEY가 없으면 is_available()이 False를 반환하고, 상위 로직은
정성 코멘트 생성을 건너뛴 채 정량 점수만으로 리포트를 구성한다.
"""

import os
from typing import Dict, List, Optional

import requests


def is_available() -> bool:
    return bool(os.getenv("DEEPSEEK_API_KEY"))


def chat(system_prompt: str, user_prompt: str, temperature: float = 0.4,
         max_tokens: int = 2000) -> Optional[str]:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("[deepseek] DEEPSEEK_API_KEY 미설정 — LLM 코멘트 생성을 건너뜁니다.")
        return None

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    messages: List[Dict] = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        resp = requests.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
            timeout=60,
        )
        if not resp.ok:
            print(f"[deepseek] API 오류 {resp.status_code}: {resp.text[:300]}")
            return None
        payload = resp.json()
        return payload["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[deepseek] 호출 실패: {e}")
        return None
