# DeepSeek-V4 프리뷰 종합 분석

> **부제**: 백만 토큰 컨텍스트 시대를 여는 오픈소스 MoE 모델 — Claude / GPT-5 / Gemini 대비 전면 비교
>
> **작성일**: 2026년 4월 24일 Dennis Kim
repo: https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column
---

## 1. 개요 (Executive Summary)

DeepSeek가 **DeepSeek-V4 시리즈**의 프리뷰 버전을 공개했다. 두 개의 강력한 MoE(Mixture-of-Experts) 언어 모델로 구성되며, 두 모델 모두 **100만(1M) 토큰 컨텍스트**를 지원한다.

| 모델 | 총 파라미터 | 활성 파라미터 | 컨텍스트 | 정밀도 |
|---|---|---|---|---|
| **DeepSeek-V4-Flash** | 284B | 13B | 1M | FP4 + FP8 Mixed |
| **DeepSeek-V4-Pro** | 1.6T | 49B | 1M | FP4 + FP8 Mixed |

> *FP4 + FP8 Mixed: MoE 전문가 파라미터는 FP4, 나머지 대부분의 파라미터는 FP8 정밀도로 운용된다.*

핵심 메시지는 명확하다. **DeepSeek-V4-Pro-Max는 현재 이용 가능한 최고의 오픈소스 모델**로 자리매김했으며, 특히 **코딩 벤치마크(LiveCodeBench, Codeforces, Apex Shortlist)에서 Claude·GPT-5·Gemini를 모두 상회**하는 세계 1위 성능을 기록했다.

---

## 2. 핵심 아키텍처 혁신

### 2.1 하이브리드 어텐션 구조 (Hybrid Attention)

- **CSA (Compressed Sparse Attention)** + **HCA (Heavily Compressed Attention)** 결합
- 1M 토큰 컨텍스트에서 DeepSeek-V3.2 대비:
  - **단일 토큰 추론 FLOPs → 27% 수준**
  - **KV 캐시 → 10% 수준**
- 장문 추론의 비용 구조를 재정의

### 2.2 Manifold-Constrained Hyper-Connections (mHC)

- 기존 residual connection을 강화
- 레이어 간 신호 전파의 안정성을 높이면서 모델 표현력을 유지

### 2.3 Muon Optimizer 채택

- 더 빠른 수렴과 높은 훈련 안정성 확보

---

## 3. 학습 파이프라인

- **사전학습**: 32조(32T) 이상의 다양하고 고품질 토큰
- **사후학습 (2단계 패러다임)**:
  1. **도메인별 전문가 독립 양성** — SFT + GRPO 기반 강화학습
  2. **단일 모델로 통합(Consolidation)** — on-policy distillation를 통해 도메인별 숙련도를 하나의 모델로 통합

---

## 4. 3가지 추론 모드

| 모드 | 특징 | 주 용도 | 응답 형식 |
|---|---|---|---|
| **Non-think** | 빠르고 직관적인 응답 | 일상 업무, 저위험 결정 | `</think>` summary |
| **Think High** | 의식적 논리 분석, 느리지만 정확 | 복잡한 문제 해결, 계획 수립 | `<think>` thinking `</think>` summary |
| **Think Max** | 추론 능력의 극한 탐색 | 모델 추론 한계 실험 | 특수 시스템 프롬프트 + `<think>` thinking `</think>` summary |

---

## 5. Base 모델 성능 (DeepSeek-V3.2 → V4 비교)

| 벤치마크 | V3.2-Base | V4-Flash-Base | V4-Pro-Base |
|---|---:|---:|---:|
| 활성 파라미터 | 37B | 13B | 49B |
| 총 파라미터 | 671B | 284B | 1.6T |
| **MMLU-Pro (5-shot)** | 65.5 | 68.3 | **73.5** |
| **MMMLU (5-shot)** | 87.9 | 88.8 | **90.3** |
| **Simple-QA Verified (25-shot)** | 28.3 | 30.1 | **55.2** |
| **FACTS Parametric (25-shot)** | 27.1 | 33.9 | **62.6** |
| **SuperGPQA (5-shot)** | 45.0 | 46.5 | **53.9** |
| **MultiLoKo (5-shot)** | 38.7 | 42.2 | **51.1** |
| **HumanEval (Pass@1)** | 62.8 | 69.5 | **76.8** |
| **GSM8K (EM)** | 91.1 | 90.8 | **92.6** |
| **MATH (4-shot)** | 60.5 | 57.4 | **64.5** |
| **LongBench-V2 (1-shot)** | 40.2 | 44.7 | **51.5** |

**주목할 변화**:
- **지식 정확도(FACTS Parametric) 27.1 → 62.6** — 2배 이상의 약진
- **Simple-QA Verified 28.3 → 55.2** — 사실성 대폭 개선
- **장문 처리(LongBench-V2) 40.2 → 51.5** — 1M 컨텍스트 아키텍처의 효과 확인

---

## 6. **[핵심]** Claude / GPT-5 / Gemini 대비 DeepSeek-V4-Pro-Max 상세 비교

> 비교 대상: **Claude Opus 4.6 Max**, **GPT-5.4 xHigh**, **Gemini 3.1 Pro High**, **DeepSeek-V4-Pro Max**
>
> 참고군: Kimi K2.6 Thinking, GLM-5.1 Thinking (오픈소스 경쟁 모델)

### 6.1 지식 및 추론 (Knowledge & Reasoning)

| 벤치마크 | Opus 4.6 Max | GPT-5.4 xHigh | Gemini 3.1 Pro | **DS-V4-Pro Max** | 1위 |
|---|---:|---:|---:|---:|:---:|
| MMLU-Pro (EM) | 89.1 | 87.5 | **91.0** | 87.5 | Gemini |
| SimpleQA-Verified | 46.2 | 45.3 | **75.6** | 57.9 | Gemini |
| Chinese-SimpleQA | 76.4 | 76.8 | **85.9** | 84.4 | Gemini |
| GPQA Diamond | 91.3 | 93.0 | **94.3** | 90.1 | Gemini |
| HLE (Humanity's Last Exam) | 40.0 | 39.8 | **44.4** | 37.7 | Gemini |
| HMMT 2026 Feb | 96.2 | **97.7** | 94.7 | 95.2 | GPT-5.4 |
| IMOAnswerBench | 75.3 | **91.4** | 81.0 | 89.8 | GPT-5.4 |
| Apex | 34.5 | 54.1 | **60.9** | 38.3 | Gemini |

**해석**: 순수 지식과 초고난도 추론(HLE, GPQA, Apex)에서는 **Gemini 3.1 Pro가 가장 강력**하고, 수학 경시 계열(HMMT, IMO)에서는 **GPT-5.4**가 1위다. **DeepSeek-V4-Pro Max는 오픈소스 중 단연 1위**이지만, 상위 클로즈드 모델과의 격차는 HLE·Apex 같은 최난도 영역에서 여전히 존재한다.

### 6.2 코딩 (Coding) — **DeepSeek의 강점 영역**

| 벤치마크 | Opus 4.6 Max | GPT-5.4 xHigh | Gemini 3.1 Pro | **DS-V4-Pro Max** | 1위 |
|---|---:|---:|---:|---:|:---:|
| **LiveCodeBench (Pass@1)** | 88.8 | - | 91.7 | **93.5** | **DeepSeek** |
| **Codeforces (Rating)** | - | 3168 | 3052 | **3206** | **DeepSeek** |
| **Apex Shortlist** | 85.9 | 78.1 | 89.1 | **90.2** | **DeepSeek** |

**해석**: **실전 코딩 3대 벤치마크를 DeepSeek-V4-Pro Max가 모두 석권**. Codeforces 3206 레이팅은 경쟁 프로그래밍의 **그랜드마스터 상위권**에 해당하며, 이는 오픈소스 모델이 코딩 영역에서 최상위 클로즈드 모델을 앞지른 첫 사례로 기록될 만하다.

### 6.3 장문 컨텍스트 (Long Context @ 1M)

| 벤치마크 | Opus 4.6 Max | GPT-5.4 xHigh | Gemini 3.1 Pro | **DS-V4-Pro Max** | 1위 |
|---|---:|---:|---:|---:|:---:|
| MRCR 1M (MMR) | **92.9** | - | 76.3 | 83.5 | Claude |
| CorpusQA 1M (ACC) | **71.7** | - | 53.8 | 62.0 | Claude |

**해석**: 장문 검색·이해 영역에서는 **Claude Opus 4.6이 압도적**. DeepSeek-V4-Pro Max는 Gemini 3.1 Pro를 앞서는 2위권을 확보했으나, Claude의 리드는 명확하다. 1M 컨텍스트 "지원"과 "활용"은 별개의 문제라는 점이 다시 확인된다.

### 6.4 에이전틱 / 도구 활용 (Agentic & Tool Use)

| 벤치마크 | Opus 4.6 Max | GPT-5.4 xHigh | Gemini 3.1 Pro | **DS-V4-Pro Max** | 1위 |
|---|---:|---:|---:|---:|:---:|
| Terminal Bench 2.0 | 65.4 | **75.1** | 68.5 | 67.9 | GPT-5.4 |
| SWE Verified | **80.8** | - | 80.6 | 80.6 | Claude |
| SWE Pro | 57.3 | **57.7** | 54.2 | 55.4 | GPT-5.4 |
| SWE Multilingual | **77.5** | - | - | 76.2 | Claude |
| BrowseComp | 83.7 | 82.7 | **85.9** | 83.4 | Gemini |
| HLE w/ tools | 53.1 | 52.0 | 51.6 | 48.2 | Claude |
| GDPval-AA (Elo) | 1619 | **1674** | 1314 | 1554 | GPT-5.4 |
| MCPAtlas Public | **73.8** | 67.2 | 69.2 | 73.6 | Claude |
| Toolathlon | 47.2 | **54.6** | 48.8 | 51.8 | GPT-5.4 |

**해석**: 에이전틱 영역은 **GPT-5.4와 Claude가 박빙**, DeepSeek-V4-Pro Max는 **SWE Verified에서 80.6으로 동률 1위**를 기록하며 실전 소프트웨어 엔지니어링 태스크에서 경쟁력을 입증. 단, 복합 에이전트 워크플로(Terminal Bench, Toolathlon, GDPval)에서는 여전히 GPT-5.4가 앞선다.

---

## 7. 카테고리별 세계 1위 요약

| 영역 | 1위 모델 | 비고 |
|---|---|---|
| **순수 지식 (MMLU-Pro, GPQA, HLE)** | Gemini 3.1 Pro | 단독 선두 |
| **수학 경시 (HMMT, IMO)** | GPT-5.4 xHigh | Think Max 모드 기준 |
| **실전 코딩 (LiveCodeBench, Codeforces, Apex Shortlist)** | **DeepSeek-V4-Pro Max** | **오픈소스 최초 3관왕** |
| **장문 컨텍스트 (MRCR 1M, CorpusQA 1M)** | Claude Opus 4.6 Max | 큰 격차로 선두 |
| **에이전틱 / 도구 활용 (Terminal Bench, GDPval, Toolathlon)** | GPT-5.4 xHigh | Claude와 박빙 |
| **SWE Verified (실전 SW 엔지니어링)** | Claude / DeepSeek 동률 | 80.6 vs 80.8 |
| **팩트 검색 (SimpleQA, Chinese-SimpleQA)** | Gemini 3.1 Pro | DS가 오픈소스 1위 |

---

## 8. V4-Flash vs V4-Pro: 모드별 성능 비교

| 벤치마크 | Flash Non-Think | Flash High | Flash Max | Pro Non-Think | Pro High | Pro Max |
|---|---:|---:|---:|---:|---:|---:|
| MMLU-Pro | 83.0 | 86.4 | 86.2 | 82.9 | 87.1 | **87.5** |
| SimpleQA-Verified | 23.1 | 28.9 | 34.1 | 45.0 | 46.2 | **57.9** |
| GPQA Diamond | 71.2 | 87.4 | 88.1 | 72.9 | 89.1 | **90.1** |
| LiveCodeBench | 55.2 | 88.4 | 91.6 | 56.8 | 89.8 | **93.5** |
| HMMT 2026 Feb | 40.8 | 91.9 | 94.8 | 31.7 | 94.0 | **95.2** |
| Apex Shortlist | 9.3 | 72.1 | 85.7 | 9.2 | 85.5 | **90.2** |
| SWE Verified | 73.7 | 78.6 | 79.0 | 73.6 | 79.4 | **80.6** |
| MRCR 1M | 37.5 | 76.9 | 78.7 | 44.7 | 83.3 | **83.5** |

**핵심 관찰**:
- Flash-Max는 충분한 thinking budget이 주어지면 **Pro-High에 근접하는 추론 성능**을 달성
- 다만 **순수 지식(SimpleQA, FACTS)과 최상위 agentic 태스크**에서는 Pro가 명확한 우위
- **Non-Think 모드에서 Flash가 일부 지식 벤치에서 Pro를 근소하게 앞서는 현상** — 파라미터가 많다고 항상 유리한 것은 아님을 시사

---

## 9. 배포 및 사용

| 항목 | 내용 |
|---|---|
| **라이선스** | MIT License (상업적 활용 완전 허용) |
| **배포 채널** | HuggingFace, ModelScope |
| **권장 샘플링** | `temperature=1.0`, `top_p=1.0` |
| **Think Max 권장 컨텍스트** | 최소 **384K 토큰** |
| **채팅 템플릿** | Jinja 미포함, Python 인코딩 스크립트 제공 (OpenAI 호환) |

### 간단한 인코딩 예시

```python
from encoding_dsv4 import encode_messages, parse_message_from_completion_text

messages = [
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "Hello! I am DeepSeek.",
     "reasoning_content": "thinking..."},
    {"role": "user", "content": "1+1=?"}
]

prompt = encode_messages(messages, thinking_mode="thinking")

import transformers
tokenizer = transformers.AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V4-Pro")
tokens = tokenizer.encode(prompt)
```

---

## 10. 산업적 의미 및 시사점

### 10.1 오픈소스 AI 경쟁 구도의 재편

- DeepSeek-V4-Pro Max는 단순한 "오픈소스 1위"를 넘어 **특정 영역(코딩)에서 클로즈드 모델을 정면으로 앞섰다**
- MIT 라이선스 + FP4/FP8 혼합 정밀도는 **기업용 자체 서빙 경제성**을 크게 개선

### 10.2 1M 컨텍스트 효율성의 의미

- KV 캐시 10% 수준은 실제 서빙 비용을 **약 10배 절감**할 가능성을 시사
- 긴 문서 기반 RAG, 법률·연구 지원, 장편 코드베이스 분석 등 **엔터프라이즈 장문 유스케이스의 TCO 재계산**이 필요

### 10.3 지역/언어별 강점

- **Chinese-SimpleQA 84.4** — 오픈소스 중 독보적, 한국/중국/일본 등 아시아 시장 활용성 매우 높음
- **MultiLoKo 51.1 (Base)** — 다국어 로컬 지식 능력도 V3.2 대비 큰 개선

### 10.4 한국 Web3 생태계 관점

- **온체인 데이터 분석, 스마트 컨트랙트 감사, Web3 리서치 자동화**: LiveCodeBench 93.5 + 1M 컨텍스트는 솔리디티·무브·러스트 기반 계약 감사에 강력한 도구
- **거래소 상장 리서치·딥다이브 리포트 작성**: Chinese-SimpleQA 84.4 + 다국어 처리 능력으로 한중영 3개 언어 리포트 동시 생산 가능
- **자체 호스팅 + MIT 라이선스**: 고객 데이터 주권을 유지하며 AI 서비스 통합 가능

---

## 11. 결론

DeepSeek-V4 프리뷰는 세 가지 측면에서 AI 모델 경쟁 지형에 의미 있는 변화를 가져온다.

1. **코딩 영역에서 오픈소스가 클로즈드를 앞섰다** — LiveCodeBench, Codeforces, Apex Shortlist 3관왕
2. **1M 컨텍스트를 10배 싸게 돌리는 엔지니어링 해법을 제시했다** — CSA/HCA 하이브리드 어텐션
3. **오픈소스 생태계가 프론티어 격차를 HLE·Apex 외 영역에서는 실질적으로 좁혔다**

Gemini 3.1 Pro가 지식·팩트에서 1위, GPT-5.4가 수학·에이전틱에서 1위, Claude Opus 4.6이 장문·SWE에서 1위를 차지한 현 구도에서, **DeepSeek-V4-Pro Max는 "코딩 세계 1위 + 기타 영역 오픈소스 1위 + MIT 라이선스"라는 독특한 포지셔닝**을 확보했다. 이는 특히 자체 서빙을 고려하는 기업과 연구기관에게 가장 매력적인 선택지로 부상할 전망이다.

---

## 부록. 원문 인용 정보

```
@misc{deepseekai2026deepseekv4,
  title={DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence},
  author={DeepSeek-AI},
  year={2026},
}
```

**라이선스**: MIT License
**모델 저장소**: HuggingFace / ModelScope
**권장 Think Max 컨텍스트**: ≥ 384K tokens
