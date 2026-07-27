<!--
---
title: "DeepSeek-V4 (Pro/Flash) Getting Started — 오픈 웨이트 가이드"
title_en: "DeepSeek-V4 (Pro/Flash) Getting Started — Open-Weight Guide"
subtitle: "1M 컨텍스트 MoE · MIT 라이선스 · Think High/Max · vLLM/SGLang 배포"
description: "DeepSeek-V4 Pro(1.6T-A49B)·Flash(284B-A13B) 공식 스펙·벤치마크·encoding_dsv4·vLLM/DSpark·Claude Code 연동·한국어 제3자 평가·도입 체크리스트 TechDoc."
abstract: |
  DeepSeek-V4는 2026년 4월 말 공개된 오픈 웨이트 MoE 패밀리(Pro 1.6T/Flash 284B, 1M context, MIT).
  CSA+HCA 하이브리드 어텐션으로 KV 캐시 10%. Non-think/Think High/Think Max 3단 추론 모드.
  본 문서는 v1 정정, Flash 2×H200·Pro 8×H200 하드웨어, API·자체 호스팅, 한·일 사업 시나리오를 정리한다.
summary_for_ai: |
  Hands-on TechDoc for DeepSeek-V4 Pro and Flash open-weight MoE models.
  MIT license, 1M context, encoding_dsv4 (no Jinja template), vLLM v0.23+, DSpark serving.
  Third-party Korean benchmarks avg 84.9. Preview status — verify GA checkpoints.
date: 2026-07-27
updated: 2026-07-27
author: "김호광 (Dennis Kim)"
lang: ko
tags: [DeepSeek V4, DeepSeek, Open Weight, MoE, LLM, vLLM, 한국어]
keywords: ["DeepSeek V4", "DeepSeek-V4-Flash", "DeepSeek-V4-Pro", "오픈 웨이트", "1M context", "MIT license", "CSA HCA", "Agentic LLM"]
group: llm-agents
featured: true
featured_rank: 2
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# DeepSeek-V4 (Pro 1.6T-A49B / Flash 284B-A13B) 프로젝트 가이드 — 최종 검증판

> **문서 버전** v2.0 (2026-07-27) · **검증 기준** DeepSeek 공식 HF 모델 카드 / DeepSeek API Docs / 기술 보고서(arXiv 2606.19348)
> **범위 변경** v1은 Flash 단독 문서였으나, V4는 **Pro/Flash 2종 패밀리 릴리스**이므로 양쪽을 함께 다룬다. 아키텍처가 동일해 분리 서술이 오히려 오해를 만든다.
> **상태** 공식 모델 카드는 스스로를 **preview version**으로 표기한다. GA 체크포인트는 별도다.

---

## 0. v1 대비 주요 수정 사항

| # | 항목 | v1 기술 | 정정 내용 |
|---|---|---|---|
| 1 | Expert 구성 | "256 routed + 1 shared" | **공식 모델 카드에 expert 수 미공개.** 출처 불명 수치이므로 삭제 |
| 2 | 아키텍처 | "정적 토큰ID→전문가ID 해시 테이블" | **공식 3대 업그레이드에 없음** (Hybrid Attention / mHC / Muon). 사전 유출 정보로 추정, 삭제 |
| 3 | 어텐션 | "하이브리드 로컬 + 장거리" | 정확히는 **CSA(Compressed Sparse Attention) + HCA(Heavily Compressed Attention)** |
| 4 | Flash 하드웨어 | "FP8 H100 2장 / INT4 H100 1장" | **틀림.** Instruct는 FP4+FP8 혼합 약 158GB. 1M 컨텍스트 포함 약 170~175GB → **2×H200 또는 4×A100**. 2×H100(160GB)은 부족 |
| 5 | Flash 메모리 | "FP8 약 500GB, INT4 후 141~155GB" | Flash에 해당하지 않는 수치. §2.1과 자기모순 |
| 6 | 권장 구성 | "16GPU 머신" | Flash 기준으로 과대. 16GPU는 **Pro 멀티노드** 조건 |
| 7 | 코딩 성능 | "Flash가 코딩 최상위" | 모델 카드가 그 표현을 붙인 대상은 **V4-Pro-Max**. Flash-Max는 LiveCodeBench 91.6(Pro-Max 93.5) |
| 8 | 채팅 템플릿 | `apply_chat_template` 예제 | **모델 카드가 Jinja 템플릿 미제공을 명시.** `encoding_dsv4` 사용 필수 — v1 코드는 동작하지 않음 |
| 9 | 샘플링 | temperature 0.7 / top_p 0.9 | 공식 권장은 **1.0 / 1.0** |
| 10 | vLLM | `--enforce-eager` | CUDA 그래프를 끄므로 프로덕션 처리량이 크게 떨어짐. 제거 |
| 11 | 추론 모드 | 미기재 | **Non-think / Think High / Think Max 3단 모드**가 V4 사용의 핵심. 완전 누락 |
| 12 | DSpark | 미기재 | 2026-06-27 공개. MTP-1 대비 사용자당 생성속도 **60~85% 향상**, 무손실 |
| 13 | Claude Code | `api.deepseek.com/v1` | 오류. Anthropic 호환 엔드포인트는 **`/anthropic`**, 모델 ID는 `deepseek-v4-pro[1m]` |
| 14 | 레거시 API | 미기재 | `deepseek-chat`/`deepseek-reasoner`는 **2026-07-24 15:59 UTC 종료** (이미 경과) |
| 15 | 한국어 | "벤치마크 미공개" | DeepSeek 자체 공개는 없으나 **제3자(업스테이지) 평가에서 한국어 평균 84.9** — 한국 사업 판단을 바꾸는 수치 |
| 16 | GGUF | 표를 확정 정보처럼 기술 | 커뮤니티 빌드이며 공식 체크포인트 대비 **미검증**. 단정 표현 완화 |
| 17 | 학습 스펙 | 부분 기재 | 32T 토큰 / Muon optimizer / 2단계 post-training(도메인 전문가 개별 육성 → on-policy distillation 통합) |
| 18 | 출력 한도 | 미기재 | 최대 출력 **384K 토큰**. Think Max는 컨텍스트 창 **384K 이상** 권장 |

---

## 1. 프로젝트 배경

**DeepSeek-V4**는 중국 DeepSeek가 2026년 4월 말 공개한 오픈 웨이트 MoE 모델 패밀리다. 기술 보고서 제목이 설계 의도를 그대로 드러낸다 — *Towards Highly Efficient Million-Token Context Intelligence*. **1M 토큰 컨텍스트를 경제적으로 만드는 것**이 목표다.

> **공개일 주의**: 소스마다 4월 22·23·24·27일로 엇갈린다. HF 논문 게재는 4월 26일. 문서에서는 "2026년 4월 말"로 통일하고, 정확한 날짜가 필요하면 DeepSeek 공식 채널을 확인할 것.

### 1.1 3대 아키텍처 업그레이드 (공식)

| 항목 | 내용 |
|---|---|
| **Hybrid Attention** | CSA(Compressed Sparse Attention) + HCA(Heavily Compressed Attention) 결합. 1M 컨텍스트에서 V4-Pro는 **V3.2 대비 단일 토큰 추론 FLOPs 27%, KV 캐시 10%** |
| **mHC** | Manifold-Constrained Hyper-Connections. 잔차 연결을 강화해 층간 신호 전파 안정성을 높이면서 표현력 유지 |
| **Muon Optimizer** | 수렴 속도와 학습 안정성 개선 |

V3.2의 MLA(Multi-head Latent Attention)를 대체한 것이 CSA+HCA다. 어텐션이 시퀀스 길이에 제곱으로 증가하는 문제를 압축으로 우회한다는 발상이며, **KV 캐시를 10분의 1로 줄인 것이 이 모델의 경제성 전부**라고 봐도 무방하다.

### 1.2 학습 파이프라인

- 사전학습: **32T 이상**의 고품질 토큰
- 사후학습 2단계:
  1. 도메인별 전문가 모델을 **개별 육성** (SFT + GRPO 기반 RL)
  2. **on-policy distillation**으로 단일 모델에 통합

이 "개별 육성 후 통합" 구조가 V4의 도메인 편차가 작은 이유로 보인다.

### 1.3 모델 라인업

| 모델 | 총 파라미터 | 활성 | 컨텍스트 | 정밀도 |
|---|---|---|---|---|
| DeepSeek-V4-Flash-Base | 284B | 13B | 1M | FP8 Mixed |
| DeepSeek-V4-Flash | 284B | 13B | 1M | FP4 + FP8 Mixed* |
| DeepSeek-V4-Pro-Base | 1.6T | 49B | 1M | FP8 Mixed |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | FP4 + FP8 Mixed* |

\* MoE expert 파라미터는 FP4, 나머지 대부분은 FP8

파생 체크포인트: `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (§2.5), `nvidia/DeepSeek-V4-Pro-NVFP4`

### 1.4 추론 모드 (V4 사용의 핵심)

| 모드 | 특성 | 용도 | 응답 형식 |
|---|---|---|---|
| **Non-think** | 빠른 직관적 응답 | 일상 업무, 저위험 판단 | `</think>` 요약 |
| **Think High** | 의식적 논리 분석, 느리지만 정확 | 복잡한 문제 해결, 계획 수립 | `<think>` 사고 `</think>` 요약 |
| **Think Max** | 추론을 최대한 확장 | 모델 추론 한계 탐색 | 특수 시스템 프롬프트 + `<think>` 사고 `</think>` 요약 |

**모드 선택이 성능을 지배한다.** 아래는 동일 모델에서 모드만 바꾼 결과다.

| 벤치마크 | Flash Non-Think | Flash Max | Pro Non-Think | Pro Max |
|---|---|---|---|---|
| HLE | 8.1 | 34.8 | 7.7 | **37.7** |
| LiveCodeBench | 55.2 | 91.6 | 56.8 | **93.5** |
| Apex | 1.0 | 33.0 | 0.4 | **38.3** |
| MRCR 1M | 37.5 | 78.7 | 44.7 | **83.5** |
| BrowseComp | – | 73.2 | – | **83.4** |

Non-think와 Max의 격차가 LiveCodeBench에서 36점, Apex에서 32점이다. **모드를 잘못 잡으면 모델을 바꾼 것보다 큰 손실이 난다.**

---

## 2. 장점 (Strengths)

### 2.1 롱컨텍스트 경제성 — 이 모델의 본질

V3.2 대비 KV 캐시 10%, 추론 FLOPs 27%. 1M 컨텍스트를 "지원한다"가 아니라 **"감당 가능한 비용으로 지원한다"**가 차별점이다. Flash의 1M 전체 KV 캐시가 약 10GB 수준으로, 158GB 가중치 위에 얹어도 2×H200에 들어간다.

### 2.2 MIT 라이선스 — 실질적으로 가장 큰 강점

가중치, 파생 모델, 재배포, 상업적 사용 모두 제약이 없다. 모델명 접두사도, 표기 의무도 없다. Upstage Solar License(네이밍·표기 의무)나 Llama 계열 라이선스와 비교하면 **자체 브랜드 제품에 임베딩할 때의 마찰이 0**이다.

기업 관점에서 이것은 성능 지표보다 중요할 수 있다. 법무 검토가 사실상 필요 없는 유일한 준-프런티어급 모델군이다.

### 2.3 Flash의 자체 호스팅 적합성

Flash 284B-A13B는 **FP4+FP8 약 158GB**로, 1M 컨텍스트 KV와 런타임 오버헤드를 더해도 약 170~175GB다. 2×H200(282GB)이면 여유 있게 들어간다. Pro 대비 85~95% 품질을 훨씬 낮은 인프라로 얻는다는 것이 실무자들의 대체적 평가다.

### 2.4 압도적인 API 가격

| 모델 | 입력(캐시 미스) | 출력 | 입력(캐시 히트) |
|---|---|---|---|
| DeepSeek-V4-Pro | $0.435 / 1M | $0.87 / 1M | $0.003625 / 1M |
| DeepSeek-V4-Flash | $0.14 / 1M | $0.28 / 1M | $0.0028 / 1M |

2026년 5월 22일부로 V4-Pro의 75% 할인이 상시 가격으로 전환됐다. **캐시 히트 입력이 $0.003625/1M**라는 점이 특히 중요하다. 동일 시스템 프롬프트를 반복 사용하는 에이전트 워크로드에서 입력 비용이 사실상 사라진다.

### 2.5 DSpark — 서빙 최적화 (2026-06-27)

새 모델이 아니라 **기존 V4 가중치에 draft 모듈을 붙인 것**이다. 공식 카드도 "not a new model"이라고 명시한다.

| 항목 | 내용 |
|---|---|
| 방식 | 병렬 draft backbone + 소형 순차 head, confidence head와 부하 인지 스케줄러 |
| 효과 | MTP-1 대비 **사용자당 생성 속도 60~85% 향상**, 출력 무손실 |
| 처리량 | 80 tok/s/user(Flash)·35 tok/s/user(Pro) 조건에서 총 처리량 +51%·+52% |
| 고속 조건 | 120 tok/s/user·50 tok/s/user 조건에서 +661%·+406% |
| 체크포인트 | `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (MIT) |
| 코드 | DeepSpec (github.com/deepseek-ai/DeepSpec, MIT) |

**주의**: 60~85%는 naive 디코딩이 아니라 **DeepSeek 자체 MTP-1 대비** 수치다. 다른 서빙 스택에 그대로 이식했을 때 재현된다는 보장은 없고, 2026년 7월 초 기준 독립 재현 보고도 아직 없다.

### 2.6 에이전트 도구 생태계 통합

Anthropic 호환 엔드포인트를 공식 제공하므로 Claude Code, OpenCode, Copilot Chat, Cline 등에 프록시 없이 연결된다. `awesome-deepseek-agent` 저장소에 20종 코딩 도구별 공식 설정이 정리돼 있다.

### 2.7 Base 모델 공개

`V4-Pro-Base`, `V4-Flash-Base`가 함께 공개돼 **continued pretraining이 가능하다.** Instruct만 공개하는 모델과 결정적으로 다른 지점이며, 도메인 특화 모델을 진지하게 만들 계획이라면 이것이 선택 이유가 된다.

---

## 3. 단점 및 한계 (Weaknesses)

### 3.1 Pro는 사실상 클러스터 전용

| 구성 | 요건 |
|---|---|
| V4-Pro 가중치 | 약 862GB (HF 표기 기준) / vLLM 권장 레시피 약 960GB 풋프린트 |
| 단일 노드 | **8×H200 141GB (1,128GB)** 또는 B300 8-GPU 노드 |
| 멀티노드 | 16×H100 80GB 2노드 + NVLink/InfiniBand |
| 8×H100 80GB | **불가** (640GB로 부족) |

양자화로 해결되지 않는다. Q4 수준으로 낮춰도 약 430GB이고 1M KV를 더하면 다시 8×H100을 넘는다. **Pro를 워크스테이션 모델로 만드는 양자화 수준은 존재하지 않으며, 조금 작은 클러스터 모델이 될 뿐이다.**

### 3.2 채팅 템플릿 부재 — 통합 시 최대 함정

모델 카드가 명시한다: **이번 릴리스는 Jinja 형식 채팅 템플릿을 포함하지 않는다.** 대신 `encoding` 폴더의 Python 스크립트(`encoding_dsv4`)로 메시지를 인코딩하고 출력을 파싱해야 한다.

기존 파이프라인이 `tokenizer.apply_chat_template()`에 의존한다면 그 코드는 동작하지 않는다. vLLM/SGLang은 이를 내부 처리하지만, Transformers 직접 사용이나 커스텀 서빙에서는 **인코딩 레이어를 직접 구현해야 한다.**

### 3.3 공식 다국어 정보의 비대칭

DeepSeek 공식 벤치마크는 영어·중국어 중심이다(C-Eval, CMMLU, Chinese-SimpleQA). 한국어·일본어 전용 벤치마크는 공개되지 않았다. Base 모델의 MultiLoKo(다국어)가 V3.2 38.7 → Flash 42.2 → Pro 51.1로 개선됐다는 정도가 간접 근거다.

**단, 이것이 "한국어를 못한다"는 뜻은 아니다.** §5 참조.

### 3.4 서빙 스택 제약

| 스택 | 상태 |
|---|---|
| vLLM | 네이티브 지원 v0.22.0, 프로덕션 하드닝 v0.23.0 |
| SGLang | Day-0 공식 지원. MegaMoE는 **Blackwell(B200/B300/GB200/GB300) 전용** |
| TGI | preview 시점 미지원 |
| Ollama / llama.cpp | **커뮤니티 GGUF만 존재하며 공식 체크포인트 대비 미검증** |

또한 2026년 5월 기준 **RTX Pro 6000 Blackwell에서 vLLM Inductor 컴파일 경로 크래시** 보고가 다수 있다. 메모리는 충분해도 소프트웨어 경로가 불안정하므로, 이 카드로 장비를 구성하기 전에 현재 vLLM/드라이버 상태를 반드시 확인할 것.

### 3.5 Flash의 성능 한계 구간

Flash-Max는 큰 thinking budget을 주면 Pro에 준하는 추론 성능을 내지만, **순수 지식 작업과 가장 복잡한 에이전트 워크플로우에서는 Pro에 뒤진다.** 모델 카드가 직접 인정하는 부분이다.

구체적으로 SimpleQA-Verified가 Flash-Max 34.1 vs Pro-Max 57.9로 23.8점 차다. **사실 정확성이 중요한 용도에서 Flash는 위험하다.**

### 3.6 지정학·규제 리스크 (호스팅 API 한정)

DeepSeek **호스팅 서비스/앱/API**는 다수 국가에서 정부기기 사용이 금지되거나 제한된다. 한국은 2025년 개인정보보호위원회가 국외 이전 문제로 앱 서비스를 일시 중단시키고 시정 권고했으며, 다수 부처·공공기관·금융권이 접속을 차단했다. 미국은 연방 일부 기관과 다수 주정부가 정부기기 사용을 금지했고 관련 법안이 발의됐다. 일본·호주·대만·이탈리아 등도 유사 조치를 취했다.

**핵심 구분**: 이 규제들은 **데이터가 중국으로 전송되는 호스팅 서비스**를 겨냥한 것이지, MIT 라이선스로 배포된 **가중치를 자체 인프라에서 구동하는 행위**를 금지하는 것이 아니다. 이 구분이 §9~11 사업 시나리오 전체의 전제다.

다만 조직에 따라 "중국산 모델" 자체를 배제하는 조달 정책이 존재할 수 있으므로, 사전 확인이 필요하다.

### 3.7 Preview 상태

모델 카드가 스스로를 preview로 표기한다. GA 체크포인트에서 품질 변경 가능성이 있으므로, preview로 확립한 베이스라인은 **평가 기준선으로 쓰되 최종 산출물 품질 보증의 근거로 쓰지 않는 것**이 안전하다.

---

## 4. 벤치마크 (공식 모델 카드)

### 4.1 V4-Pro-Max vs 프런티어 모델

| 벤치마크 | Opus-4.6 Max | GPT-5.4 xHigh | Gemini-3.1-Pro High | K2.6 Thinking | GLM-5.1 Thinking | **DS-V4-Pro Max** |
|---|---|---|---|---|---|---|
| **지식·추론** | | | | | | |
| MMLU-Pro | 89.1 | 87.5 | **91.0** | 87.1 | 86.0 | 87.5 |
| SimpleQA-Verified | 46.2 | 45.3 | **75.6** | 36.9 | 38.1 | 57.9 |
| Chinese-SimpleQA | 76.4 | 76.8 | **85.9** | 75.9 | 75.0 | 84.4 |
| GPQA Diamond | 91.3 | 93.0 | **94.3** | 90.5 | 86.2 | 90.1 |
| HLE | 40.0 | 39.8 | **44.4** | 36.4 | 34.7 | 37.7 |
| LiveCodeBench | 88.8 | – | 91.7 | 89.6 | – | **93.5** |
| Codeforces (Rating) | – | 3168 | 3052 | – | – | **3206** |
| HMMT 2026 Feb | 96.2 | **97.7** | 94.7 | 92.7 | 89.4 | 95.2 |
| IMOAnswerBench | 75.3 | **91.4** | 81.0 | 86.0 | 83.8 | 89.8 |
| Apex | 34.5 | 54.1 | **60.9** | 24.0 | 11.5 | 38.3 |
| Apex Shortlist | 85.9 | 78.1 | 89.1 | 75.5 | 72.4 | **90.2** |
| **롱컨텍스트** | | | | | | |
| MRCR 1M | **92.9** | – | 76.3 | – | – | 83.5 |
| CorpusQA 1M | **71.7** | – | 53.8 | – | – | 62.0 |
| **에이전트** | | | | | | |
| Terminal Bench 2.0 | 65.4 | **75.1** | 68.5 | 66.7 | 63.5 | 67.9 |
| SWE Verified | **80.8** | – | 80.6 | 80.2 | – | 80.6 |
| SWE Pro | 57.3 | 57.7 | 54.2 | **58.6** | 58.4 | 55.4 |
| SWE Multilingual | **77.5** | – | – | 76.7 | 73.3 | 76.2 |
| BrowseComp | 83.7 | 82.7 | **85.9** | 83.2 | 79.3 | 83.4 |
| HLE w/ tools | 53.1 | 52.0 | 51.6 | **54.0** | 50.4 | 48.2 |
| GDPval-AA (Elo) | 1619 | **1674** | 1314 | 1482 | 1535 | 1554 |
| MCPAtlas Public | **73.8** | 67.2 | 69.2 | 66.6 | 71.8 | 73.6 |
| Toolathlon | 47.2 | **54.6** | 48.8 | 50.0 | 40.7 | 51.8 |

**해석 포인트**
- **코딩은 1위다.** LiveCodeBench 93.5, Codeforces 3206으로 폐쇄형 프런티어를 앞선다. 이것이 V4-Pro의 가장 확실한 근거다.
- **MCPAtlas 73.6은 Opus-4.6(73.8)과 사실상 동률**이다. MCP 기반 에이전트에서 오픈 웨이트가 폐쇄형과 붙는 드문 사례다.
- **SimpleQA-Verified 57.9는 Gemini(75.6)에 크게 뒤진다.** 사실 조회형 워크로드에는 부적합하며, RAG 없이 쓰면 안 된다.
- **롱컨텍스트 실측은 기대에 못 미친다.** 1M을 지원하지만 MRCR 1M 83.5, CorpusQA 1M 62.0으로 Opus-4.6(92.9 / 71.7)에 밀린다. **1M을 "넣을 수 있다"와 "정확히 읽는다"는 다르다.**
- Apex 38.3은 Gemini(60.9)·GPT-5.4(54.1)와 격차가 크다.

### 4.2 모드별 비교 (Flash vs Pro)

| 벤치마크 | Flash Non-Think | Flash High | Flash Max | Pro Non-Think | Pro High | Pro Max |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.0 | 86.4 | 86.2 | 82.9 | 87.1 | **87.5** |
| SimpleQA-Verified | 23.1 | 28.9 | 34.1 | 45.0 | 46.2 | **57.9** |
| Chinese-SimpleQA | 71.5 | 73.2 | 78.9 | 75.8 | 77.7 | **84.4** |
| GPQA Diamond | 71.2 | 87.4 | 88.1 | 72.9 | 89.1 | **90.1** |
| HLE | 8.1 | 29.4 | 34.8 | 7.7 | 34.5 | **37.7** |
| LiveCodeBench | 55.2 | 88.4 | 91.6 | 56.8 | 89.8 | **93.5** |
| Codeforces | – | 2816 | 3052 | – | 2919 | **3206** |
| HMMT 2026 Feb | 40.8 | 91.9 | 94.8 | 31.7 | 94.0 | **95.2** |
| Apex | 1.0 | 19.1 | 33.0 | 0.4 | 27.4 | **38.3** |
| MRCR 1M | 37.5 | 76.9 | 78.7 | 44.7 | 83.3 | **83.5** |
| CorpusQA 1M | 15.5 | 59.3 | 60.5 | 35.6 | 56.5 | **62.0** |
| Terminal Bench 2.0 | 49.1 | 56.6 | 56.9 | 59.1 | 63.3 | **67.9** |
| SWE Verified | 73.7 | 78.6 | 79.0 | 73.6 | 79.4 | **80.6** |
| SWE Pro | 49.1 | 52.3 | 52.6 | 52.1 | 54.4 | **55.4** |
| BrowseComp | – | 53.5 | 73.2 | – | 80.4 | **83.4** |
| MCPAtlas | 64.0 | 67.4 | 69.0 | 69.4 | **74.2** | 73.6 |
| Toolathlon | 40.7 | 43.5 | 47.8 | 46.3 | 49.0 | **51.8** |

**실무적으로 가장 중요한 표다.**

- **Flash High가 가성비 최적점이다.** MMLU-Pro 86.4는 Flash Max(86.2)보다 오히려 높고, LiveCodeBench 88.4는 Max(91.6)와 3.2점 차인데 토큰 소모는 훨씬 적다.
- **MCPAtlas는 Pro High(74.2)가 Pro Max(73.6)보다 높다.** 도구 호출에서는 과도한 추론이 오히려 해롭다. **에이전트 오케스트레이션은 High로 고정할 것.**
- **Non-think는 코딩·수학·에이전트에 쓰면 안 된다.** LiveCodeBench 55.2, Apex 1.0, HLE 8.1로 사실상 무력하다. Non-think는 분류·요약·라우팅 전용이다.
- **SWE Verified는 Flash High 78.6 vs Pro Max 80.6으로 2점 차**다. 코드 수정 작업이라면 Flash로 충분하다.

### 4.3 Base 모델 (사전학습 품질)

| 벤치마크 | V3.2-Base | V4-Flash-Base | V4-Pro-Base |
|---|---|---|---|
| MMLU (5-shot) | 87.8 | 88.7 | **90.1** |
| MMLU-Pro (5-shot) | 65.5 | 68.3 | **73.5** |
| MMMLU (5-shot) | 87.9 | 88.8 | **90.3** |
| C-Eval (5-shot) | 90.4 | 92.1 | **93.1** |
| CMMLU (5-shot) | 88.9 | 90.4 | **90.8** |
| **MultiLoKo (다국어)** | 38.7 | 42.2 | **51.1** |
| Simple-QA verified | 28.3 | 30.1 | **55.2** |
| FACTS Parametric | 27.1 | 33.9 | **62.6** |
| SuperGPQA | 45.0 | 46.5 | **53.9** |
| HumanEval | 62.8 | 69.5 | **76.8** |
| BigCodeBench | **63.9** | 56.8 | 59.2 |
| MATH | 60.5 | 57.4 | **64.5** |
| LongBench-V2 | 40.2 | 44.7 | **51.5** |

**MultiLoKo 51.1(Pro)은 V3.2 대비 +12.4점**으로 개선폭이 가장 큰 항목 중 하나다. 다국어 능력이 세대 간 실질적으로 향상됐다는 신호다.

주의할 점: **BigCodeBench와 MATH에서 V4-Flash-Base가 V3.2-Base보다 낮다.** 활성 파라미터가 37B → 13B로 줄어든 대가이며, Flash를 V3.2 대체재로 무비판적으로 채택하면 회귀가 발생할 수 있다.

---

## 5. 한국어·일본어 성능 — 공식 정보 없음, 제3자 데이터 있음

DeepSeek는 한국어 벤치마크를 공개하지 않았다. 그러나 **업스테이지가 Solar Open 2 발표(2026-07-22) 시 DeepSeek-V4-Flash를 비교군으로 평가한 데이터**가 있다. 경쟁사가 자사 모델을 돋보이게 하려고 만든 표라는 점에서, 오히려 V4-Flash에 유리하게 조작될 유인이 없는 데이터다.

| 한국어 벤치마크 | DeepSeek-V4-Flash | Solar Open 2 | GPT-5.4 mini | Claude Haiku 4.5 |
|---|---|---|---|---|
| KMMLU-Pro | **78.9** | 78.4 | 78.1 | 67.9 |
| CLIcK | 89.2 | **90.7** | 89.6 | 53.5 |
| HAE-RAE v1.1 | 73.1 | **73.8** | 69.4 | 38.5 |
| Ko-AIME'25 | **98.0** | 97.7 | 90.7 | 81.7 |
| HRM8K | **93.4** | 92.2 | 91.3 | 90.6 |
| KBank-MMLU (금융) | 79.5 | **80.8** | 79.0 | 68.9 |
| KBL (법률) | 72.8 | **75.5** | 75.3 | 69.9 |
| KorMedMCQA | 94.1 | 93.0 | **94.2** | 87.0 |
| Ko-GDPval | 85.0 | **86.8** | 59.4 | 68.3 |
| **한국어 평균** | 84.9 | **85.4** | 80.8 | 69.6 |

또한 Ko-GDPval에서 **DeepSeek-V4-Pro(1.6T)는 86.91점**으로 Solar Open 2(86.75)를 근소하게 앞섰다.

**결론이 뒤집힌다.** v1 문서의 "한국어 성능 정보 부족 → 한국 도입 시 추가 파인튜닝 필요"라는 진단은 사실과 다르다. **DeepSeek-V4-Flash는 한국어 전용 최적화 모델과 0.5점 차이의 한국어 성능을 낸다.** 한국어 수학(Ko-AIME 98.0, HRM8K 93.4)과 종합지식(KMMLU-Pro 78.9)은 오히려 앞선다.

**일본어**는 여전히 공개 데이터가 없다. Nejumi 리더보드나 JMMLU 자체 측정이 필요하다.

**한국어 사용 시 실무 유의점**
- 토크나이저가 한국어 최적화되지 않아 **토큰 소모가 한국어 특화 모델보다 많다.** 성능은 대등해도 비용은 불리할 수 있으므로 실측 필요
- 한국 특유의 문서 서식·행정 관용 표현은 학습되지 않았을 가능성이 높다. Ko-GDPval 85.0은 그럼에도 상당히 높은 수치이나, 사내 서식 few-shot 주입은 필수
- 중국어 정치·역사 관련 주제에서 응답 편향이 보고되어 왔다. 해당 도메인을 다룬다면 사전 검증할 것

---

## 6. 경쟁 프로젝트 비교

### 6.1 Solar Open 2 (Upstage, 250B-A15B)

| 항목 | **DeepSeek-V4-Flash** | **Solar Open 2** |
|---|---|---|
| 개발사 | DeepSeek (중국) | Upstage (한국) |
| 총 / 활성 | 284B / 13B | 250B / 15B |
| 공개 | 2026년 4월 말 | 2026-07-22 |
| 컨텍스트 | 1M | 1M |
| **라이선스** | **MIT (무제약)** | Upstage Solar License (네이밍·표기 의무) |
| Base 공개 | **있음** | 없음 |
| 하드웨어 | 2×H200 (FP4+FP8) | 4×H200 (BF16) / 2×H200 (양자화) |
| 한국어 평균 | 84.9 | **85.4** |
| MMLU-Pro | 85.9 | **86.2** |
| LiveCodeBench | 92.3 | **92.4** |
| SWE-Bench Verified | **73.8** | 70.4 |
| MCP-Atlas | 58.2 | 58.2 |
| Terminal Bench Hard | **34.1** | 28.3 |
| τ³ (banking) | **22.3** | 19.6 |
| APEX-Agents | 13.2 | **16.6** |

**정직한 결론**: 두 모델은 성능상 대등하며 한국어조차 0.5점 차다. Solar Open 2가 우위인 것은 APEX-Agents, 한국어 토큰 효율(글로벌 대비 50~80%), 한국 업무 문맥 학습이다. DeepSeek-V4-Flash가 우위인 것은 **MIT 라이선스, Base 모델 공개, 에이전트 코딩(SWE·Terminal), 더 낮은 활성 파라미터**다.

한국 기업의 선택 기준은 성능이 아니라 다른 축에서 갈린다 — **국산 조달 요건이 있으면 Solar, 라이선스 자유도와 파인튜닝 유연성이 중요하면 DeepSeek, 중국산 배제 정책이 있으면 Solar.**

### 6.2 Kimi K3 (Moonshot AI, 2.8T)

| 항목 | DeepSeek-V4-Pro | Kimi K3 |
|---|---|---|
| 총 파라미터 | 1.6T | **2.8T** |
| 활성 | 49B | 16 experts 활성 (896 중) |
| 공개 | 2026년 4월 말 | API 7/16, 가중치 **2026-07-27** |
| 라이선스 | MIT | Modified MIT |
| 멀티모달 | 텍스트 | **네이티브 비전** |
| 컨텍스트 | 1M | 1M |
| API 가격 | $0.435 / $0.87 | $3 / $15 |
| 추론 모드 | 3단 선택 | thinking 상시 |

모델 카드 기준 K2.6 Thinking과의 비교에서 V4-Pro-Max는 LiveCodeBench(93.5 vs 89.6), MCPAtlas(73.6 vs 66.6)에서 앞서고, SWE Pro(55.4 vs 58.6), HLE w/tools(48.2 vs 54.0)에서 뒤진다. K3는 세대가 하나 더 진행된 모델이므로 직접 비교는 가중치 공개 후 재평가가 필요하다.

**가격 차이가 결정적이다.** V4-Pro는 K3의 약 1/7 ~ 1/17 수준이다. 프런티어 최상단이 필요하지 않은 대부분의 프로덕션 워크로드에서 V4-Pro의 경제성이 압도한다.

### 6.3 V4-Pro vs V4-Flash 선택 기준

| 조건 | 권장 |
|---|---|
| 사실 정확성이 중요 (SimpleQA 57.9 vs 34.1) | **Pro** |
| 코드 수정·테스트 통과 (SWE 80.6 vs 79.0) | **Flash** — 1.6점 차에 인프라 5배 |
| 롱컨텍스트 정확도 (MRCR 83.5 vs 78.7) | Pro |
| MCP 도구 호출 (74.2 vs 69.0) | Pro High |
| 브라우징 에이전트 (83.4 vs 73.2) | **Pro** — 10점 차 |
| 자체 호스팅 예산 제약 | **Flash** |
| 분류·라우팅·요약 | Flash Non-think |

일반 원칙: **Flash High를 기본값으로 두고, SimpleQA·BrowseComp 유형의 작업만 Pro로 라우팅**하는 하이브리드가 비용 대비 최적이다. DeepSeek 공식 Claude Code 레시피도 정확히 이 구조다(메인 Pro, 서브에이전트 Flash).

---

## 7. Getting Started

### 7.1 하드웨어 요건

| 모델 | 정밀도 | 가중치 | 총 VRAM 예산 | 구성 |
|---|---|---|---|---|
| **V4-Flash** | FP4+FP8 | ~158GB | ~170–175GB | **2×H200** 또는 4×A100 80GB |
| V4-Flash | 커뮤니티 INT4 | ~90GB | – | 4×RTX 4090 (미검증) |
| **V4-Pro** | FP4+FP8 | ~862GB | ~960GB | **8×H200 141GB 단일 노드** 또는 B300 8-GPU |
| V4-Pro | 멀티노드 | – | – | 16×H100 80GB 2노드 + IB |

- 시스템 RAM: Flash 기준 256GB 이상, 스토리지 NVMe 500GB 이상
- vLLM 텐서 병렬은 2의 거듭제곱(1/2/4/8)에서 최적. 2×A100(160GB)은 1M 컨텍스트 예산에 미달하므로 4×A100 권장
- **V4-Pro는 8×H100 80GB(640GB)에 들어가지 않는다**

### 7.2 채팅 인코딩 (필수 선행 이해)

**이 릴리스에는 Jinja 채팅 템플릿이 없다.** `encoding` 폴더의 스크립트를 사용한다.

```python
from encoding_dsv4 import encode_messages, parse_message_from_completion_text
import transformers

messages = [
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "Hello! I am DeepSeek.", "reasoning_content": "thinking..."},
    {"role": "user", "content": "1+1=?"},
]

# messages -> string
prompt = encode_messages(messages, thinking_mode="thinking")

# string -> tokens
tokenizer = transformers.AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V4-Pro")
tokens = tokenizer.encode(prompt)
```

멀티턴에서 이전 턴의 `reasoning_content`를 유지해야 한다는 점에 주의할 것.

### 7.3 vLLM 서빙 (권장)

```bash
# vLLM v0.23.0 이상 권장 (네이티브 지원은 v0.22.0부터)
pip install -U vllm

# V4-Flash: 2×H200, 1M 컨텍스트
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --served-model-name deepseek-v4-flash \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel

# 보수적 시작 (4×A100, 128K 컨텍스트)
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --tensor-parallel-size 4 \
  --max-model-len 131072
```

```bash
# V4-Pro: 8×H200
vllm serve deepseek-ai/DeepSeek-V4-Pro \
  --served-model-name deepseek-v4-pro \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --max-model-len 393216   # Think Max는 384K 이상 권장
```

> v1의 `--enforce-eager`는 제거했다. CUDA 그래프를 비활성화해 프로덕션 처리량을 크게 떨어뜨린다.

### 7.4 SGLang 서빙

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path deepseek-ai/DeepSeek-V4-Flash \
    --host 0.0.0.0 --port 30000 \
    --tp 2 \
    --context-length 1048576
```

MegaMoE 백엔드(정확도 손실 거의 없이 처리량 향상, Pro 기준 GPQA ~89.5)는 **Blackwell 계열(B200/B300/GB200/GB300) 전용**이다. Hopper(H100/H200)에서는 사용할 수 없다.

### 7.5 DSpark 적용

```bash
# 기존 가중치 + draft 모듈. 별도 모델이 아님
vllm serve deepseek-ai/DeepSeek-V4-Flash-DSpark \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel
```

동일 출력 분포를 보장하므로 품질 회귀 없이 처리량만 오른다. 다만 자체 스택에서 60~85%가 그대로 재현되는지는 실측할 것.

### 7.6 샘플링 파라미터

| 파라미터 | 공식 권장 | 비고 |
|---|---|---|
| temperature | **1.0** | v1의 0.7은 오류 |
| top_p | **1.0** | v1의 0.9는 오류 |
| max output | 최대 384K | |
| 컨텍스트 (Think Max) | **384K 이상** | 미달 시 추론 도중 잘림 |

### 7.7 API 사용 (자체 호스팅 없이)

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "설명해줘"}],
    "thinking": true
  }'
```

- OpenAI ChatCompletions 형식과 Anthropic 형식 **양쪽 지원**
- thinking 모드는 모델 ID가 아니라 `thinking` 파라미터로 제어
- **레거시 `deepseek-chat` / `deepseek-reasoner`는 2026-07-24 15:59 UTC부로 종료**되어 HTTP 400을 반환한다. `deepseek-v4-flash` / `deepseek-v4-pro`로 교체할 것
- **호스팅 API는 데이터가 중국으로 전송된다.** 민감 정보에는 사용하지 말 것 (§3.6)

### 7.8 Claude Code 연동 (공식 설정)

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<your DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
cd /path/to/project && claude
```

> v1의 `api.deepseek.com/v1`은 오류다. Anthropic 호환 경로는 **`/anthropic`**이며, `[1m]` 접미사는 1M 컨텍스트를 지정하는 DeepSeek 고유 modifier이므로 문서 그대로 유지해야 한다. 게이트웨이를 경유한다면 과금 정산 시 이 접미사 정규화가 필요할 수 있다.

**자체 호스팅 vLLM에 연결하는 경우**는 위 URL을 내부 엔드포인트로 바꾸면 된다. 이것이 규제 환경에서의 표준 경로다.

### 7.9 GGUF / 로컬 실행 (미검증)

llama.cpp·Ollama용 커뮤니티 GGUF가 존재하나 **공식 체크포인트 대비 검증되지 않았다.** 실험 용도로만 사용하고, 프로덕션에는 vLLM 또는 SGLang을 쓸 것. 메인라인 지원 여부는 시점에 따라 달라지므로 도입 전 현재 상태를 직접 확인해야 한다.

---

## 8. 중요 사용 예 (Key Use Cases)

### 8.1 전체 리포지토리 코드 에이전트 — 최강 영역

LiveCodeBench 93.5, Codeforces 3206은 폐쇄형 프런티어를 앞선 수치다. 여기에 1M 컨텍스트가 붙으면 **모놀리식 레거시 코드베이스를 통째로 넣고 리팩터링**하는 시나리오가 성립한다.

```bash
# 사내 vLLM에 Claude Code 연결
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
cd ~/legacy-erp && claude
```

**비용 설계가 핵심이다.** 오케스트레이션은 Pro, 서브에이전트는 Flash로 분리하면 품질 손실 거의 없이 비용이 크게 떨어진다. SWE Verified가 Flash High 78.6 vs Pro Max 80.6이므로 서브에이전트에 Pro를 쓸 이유가 없다.

### 8.2 1M 컨텍스트 문서 분석 — 단, 검증 후

```python
from openai import OpenAI
client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "content": f"""
아래는 본계약서, 부속합의서 3건, 사내 표준계약 가이드라인 전문이다.

{full_documents}

1. 문서 간 상충 조항을 조항 번호와 함께 전부 적출
2. 표준 가이드라인 위반 조항과 위반 사유
3. 조항별 리스크 등급과 협상 우선순위

근거 없는 추정은 금지하고, 원문 조항을 인용해 제시하라.
"""}],
    temperature=1.0, top_p=1.0, max_tokens=131072,
)
```

**반드시 짚어야 할 한계**: MRCR 1M 83.5, CorpusQA 1M 62.0이다. Opus-4.6(92.9 / 71.7)에 비해 낮다. **컨텍스트에 넣었다고 정확히 읽는다는 보장이 없다.**

실무 권고:
- 100만 토큰을 다 채우지 말고 **200~400K 수준에서 운용**
- 중요 조항은 **2회 독립 질의로 교차 검증**
- 자체 needle-in-haystack 테스트로 실전 임계점을 먼저 측정할 것

### 8.3 MCP 기반 에이전트 오케스트레이션

MCPAtlas Public 73.6은 Opus-4.6(73.8)과 사실상 동률로, 오픈 웨이트 중 최상위다.

```python
resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[...],
    tools=mcp_tools,
    extra_body={"thinking": True},   # Think High
)
```

**Think High를 쓸 것.** MCPAtlas가 Pro High 74.2 > Pro Max 73.6으로, 최대 추론이 오히려 손해다. 도구 호출에서는 과도한 숙고가 오작동을 늘린다.

### 8.4 사실 조회형 워크로드 — 사용 금지 또는 RAG 필수

SimpleQA-Verified가 Pro-Max 57.9, Flash-Max 34.1이다. Gemini-3.1-Pro(75.6)와 격차가 크다.

**Flash로 사실 질의를 처리하면 3분의 2가 틀릴 수 있다.** 사내 지식 Q&A, 규정 조회, 고객 문의 응대 같은 용도는 반드시 RAG로 근거를 주입하고, 근거 없는 답변을 거부하도록 시스템 프롬프트를 설계해야 한다.

```python
SYSTEM = """제공된 문서에 근거가 없는 내용은 절대 답하지 마라.
근거가 없으면 '해당 정보를 찾을 수 없습니다'로 답하고,
답변한 모든 사실에 대해 출처 문서명과 페이지를 명시하라."""
```

### 8.5 도메인 특화 continued pretraining

**Base 모델이 공개된 것이 이 시나리오를 가능하게 한다.** MIT 라이선스이므로 파생 모델 네이밍·표기 의무도 없다.

```
V4-Flash-Base → 국내 금융 규정·약관 continued pretraining → 자체 브랜드 모델
V4-Flash-Base → 일본어 코퍼스 continued pretraining → 일본어 특화 모델
V4-Flash-Base → 사내 코드베이스 + 기술문서 → 조직 전용 코딩 모델
```

284B-A13B는 continued pretraining이 현실적인 최대 규모에 가깝다. 1.6T Pro-Base는 학습 인프라 요건이 사실상 국가급이다.

### 8.6 비용 최적화 라우팅

```python
def route(task_type: str) -> dict:
    return {
        "classify":   {"model": "deepseek-v4-flash", "thinking": False},
        "summarize":  {"model": "deepseek-v4-flash", "thinking": False},
        "code_fix":   {"model": "deepseek-v4-flash", "thinking": True},
        "code_arch":  {"model": "deepseek-v4-pro",   "thinking": True},
        "tool_agent": {"model": "deepseek-v4-pro",   "thinking": True},   # Max 아님
        "fact_query": {"model": "deepseek-v4-pro",   "thinking": True},   # + RAG
        "browse":     {"model": "deepseek-v4-pro",   "thinking": True},
    }[task_type]
```

캐시 히트 입력이 $0.003625/1M이므로 **시스템 프롬프트를 고정하고 prefix caching을 최대한 활용**하면 입력 비용이 거의 사라진다. 에이전트 워크로드에서 이 효과가 가장 크다.

---

## 9. 한국 시장 사업 도입 시나리오

### 9.0 전제: 규제의 정확한 범위를 이해할 것

한국은 2025년 개인정보보호위원회가 DeepSeek 앱의 국외 이전 문제로 국내 서비스를 일시 중단시키고 시정 권고했으며, 외교부·국방부·산업통상자원부 등 다수 부처와 한수원·한전KPS 등 공공기관, 주요 금융권이 접속을 차단했다. 카카오·라인야후 등 민간 IT 기업도 업무 목적 사용을 금지했다.

**그러나 이 조치들의 대상은 호스팅 서비스다.** MIT 라이선스 가중치를 사내 GPU에서 구동하는 것은 데이터가 어디로도 나가지 않으므로 규제 논리 자체가 성립하지 않는다.

**따라서 한국에서 DeepSeek-V4의 유일한 정당한 도입 경로는 자체 호스팅이다.** API 사용은 논외로 두는 것이 안전하다.

동시에 현실적 제약도 인정해야 한다. 조달·심사 과정에서 "중국산 모델"이라는 사실 자체가 감점 요인이 되는 조직이 있다. 특히 공공·방산·금융 일부는 모델 출처를 기술적 검증과 무관하게 배제한다. **이 경우 Solar Open 2가 대안이며, 성능 차이가 0.5점 수준이므로 실질 손실이 거의 없다.**

### 9.1 소프트웨어 개발 조직 — 1순위

| 항목 | 내용 |
|---|---|
| 대상 | 게임사, SI, 플랫폼, 스타트업 개발팀 |
| 근거 | LiveCodeBench 93.5(1위), Codeforces 3206, SWE Verified 80.6, MIT 라이선스 |
| 문제 | 소스코드 외부 반출 금지, 상용 코딩 어시스턴트 라이선스 비용, 레거시 코드 문서화 부재 |
| 구성 | 사내 2×H200에 Flash + Claude Code/OpenCode 연결. Pro는 클라우드 GPU로 필요 시 |
| KPI | PR 리드타임, 리뷰 지적 건수, 테스트 커버리지 |
| 강점 | **규제 회색지대가 없다.** 코드에는 개인정보가 없고, 자체 호스팅이며, 라이선스가 MIT다 |

한국에서 DeepSeek-V4를 도입할 때 정치적 마찰이 가장 적으면서 효과가 가장 확실한 영역이다.

### 9.2 금융권 — 자체 호스팅 백오피스

| 항목 | 내용 |
|---|---|
| 근거 | KBank-MMLU 79.5, KBL 72.8, τ³ banking 22.3(Solar 19.6 대비 우위), 망분리 대응 |
| 구성 | 내부망 2×H200 Flash. 외부 통신 완전 차단 |
| 산출 | 규정 Q&A(RAG 필수), 심사 보고서 초안, 코드 리뷰 |
| 리스크 | **SimpleQA 34.1(Flash).** 금융 규정 질의를 RAG 없이 처리하면 안 된다 |
| 현실 | 다수 금융사가 이미 DeepSeek 접속을 차단한 상태다. 자체 호스팅이라도 **내부 승인 난이도가 높다.** 사전에 정보보호 부서와 "가중치 자체 구동은 데이터 이전이 아니다"라는 논점을 정리할 것 |

### 9.3 제조·물류 — 온프레미스 문서·코드

| 항목 | 내용 |
|---|---|
| 근거 | 1M 컨텍스트, MIT 라이선스로 자체 브랜드 임베딩 자유 |
| 용도 | PLC/MES 레거시 코드 분석, 기술문서 다국어화(한·영·중), 사양서 교차 검증 |
| 특기 | **중국 현지 법인·협력사가 있는 기업에서 중국어 능력(C-Eval 93.1, CMMLU 90.8)이 실질 자산이 된다.** Solar Open 2는 중국어 미지원 |
| 리스크 | 기술 노하우 유출 우려가 큰 업종이므로 완전 폐쇄망 필수 |

### 9.4 공공·방산 — 권장하지 않음

기술적으로는 자체 호스팅으로 해결되지만, **조달 정책과 국정원 보안 심사에서 중국산 모델은 통과가 사실상 어렵다.** 정부가 공공 IT 사업의 AI 기술에 대해 국가정보원 보안 심사를 요구하고 있는 상황이다.

이 영역은 Solar Open 2 또는 다른 국산 모델로 접근하는 것이 현실적이다.

### 9.5 한국 시나리오 우선순위

| 순위 | 세그먼트 | 성능 근거 | 규제 마찰 | 종합 |
|---|---|---|---|---|
| 1 | 개발 조직 코딩 에이전트 | 매우 높음 | 낮음 | **적극 권장** |
| 2 | 제조 온프레미스 (중국 연계) | 높음 | 중 | 권장 |
| 3 | 도메인 특화 파생 모델 개발 | 높음 (Base 공개) | 낮음 | 권장 |
| 4 | 금융 백오피스 | 중 | 높음 | 조건부 |
| 5 | 공공·방산 | – | 매우 높음 | 비권장 |

---

## 10. 일본 시장 사업 도입 시나리오

### 10.0 전제: 검증되지 않은 일본어 + 온프레미스 선호

일본은 온프레미스 선호가 구조적으로 강한 시장이라 MIT 라이선스 오픈 웨이트가 원리적으로 잘 맞는다. 반면 **일본어 성능에 대한 공개 근거가 전혀 없다.** MultiLoKo 51.1(Pro Base)이 간접 신호일 뿐이다.

일본 정부도 DeepSeek 관련 규제를 검토해 온 국가 중 하나로 언급되며, 라인야후는 임직원 업무 사용을 금지한 바 있다.

**필수 선행 작업**
1. W&B Nejumi 리더보드 기준 자체 측정
2. JMMLU / JCommonsenseQA 자체 측정
3. 일본어 토큰 효율 실측 (중국어 최적화 토크나이저가 일본어 한자 처리에 유리할 가능성과 가나 처리에 불리할 가능성이 공존)
4. 경어체·비즈니스 관용 표현 정확도 PoC

이 검증 없이 일본 고객사에 제안하면 안 된다.

### 10.1 일본 IT·SIer 코딩 에이전트 — 1순위

| 항목 | 내용 |
|---|---|
| 근거 | 코드는 언어 중립적이다. **일본어 검증 문제를 우회하는 유일한 용도** |
| 대상 | SIer, 사내 정보시스템 부문, SaaS 개발사 |
| 문제 | COBOL·레거시 자산의 현대화, 개발 인력 부족, 코드 외부 반출 금지 |
| 구성 | 온프레미스 2×H200 Flash + Claude Code |
| 강점 | SWE Multilingual 76.2로 다국어 코드베이스(일본어 주석 포함)에 강함 |

일본 시장에서 즉시 착수 가능한 유일한 시나리오다.

### 10.2 일본어 특화 파생 모델 개발 — 중장기 전략

**Base 모델 공개 + MIT 라이선스가 만드는 기회다.**

업스테이지가 Solar 기반으로 일본 카라쿠리와 Syn Pro(31B)를 만들어 Nejumi 1위를 기록한 것과 같은 전략을, DeepSeek-V4-Flash-Base 위에서 **라이선스 제약 없이** 실행할 수 있다. Solar License는 "Solar" 접두사와 "Built with Solar" 표기를 요구하지만, MIT는 아무것도 요구하지 않는다.

| 단계 | 내용 |
|---|---|
| 1 | V4-Flash-Base에 일본어 코퍼스 continued pretraining |
| 2 | 일본 비즈니스 문서·경어체 SFT |
| 3 | 자체 브랜드로 배포 (네이밍 자유) |
| 조건 | 284B 규모 CPT는 상당한 컴퓨트가 필요. 일본 파트너 또는 소프트뱅크 AI 클라우드 등 활용 검토 |

### 10.3 일본 제조업 — 조건부

| 항목 | 내용 |
|---|---|
| 근거 | 온프레미스 적합, 1M 컨텍스트, 중국 현지 공장 대응 시 중국어 능력 |
| 리스크 | 일본 제조업은 문서 형식 준수 요구가 극도로 엄격하다. 일본어 검증 미완 상태로는 위험 |
| 접근 | 코드·설계 데이터 분석부터 시작하고, 일본어 문서 생성은 검증 후 |

### 10.4 일본 금융·공공 — 비권장

중국산 모델에 대한 경계가 강하고 계약 사이클이 길다. 일본 파트너와의 공동 개발 파생 모델 형태(§10.2)로 접근하는 것 외에는 현실성이 낮다.

### 10.5 일본 시나리오 우선순위

| 순위 | 세그먼트 | 일본어 의존도 | 종합 |
|---|---|---|---|
| 1 | 코딩 에이전트 | 낮음 | **즉시 착수 가능** |
| 2 | 일본어 파생 모델 개발 | – (직접 개선) | 중장기 최대 기회 |
| 3 | 제조 설계·코드 분석 | 낮음 | 권장 |
| 4 | 일본어 문서 업무 | 높음 | 검증 후 |
| 5 | 금융·공공 | 높음 | 비권장 |

---

## 11. 미국 시장 사업 도입 시나리오

### 11.0 전제: 규제 지형이 가장 복잡한 시장

미국은 세 개의 층위를 구분해야 한다.

| 층위 | 상태 |
|---|---|
| 일반 소비자 | 전국적 금지 없음 |
| 연방·주정부·국방·정보기관 | **정부 기기·시스템에서 금지.** Commerce, Navy, NASA 등 다수 기관, 텍사스·뉴욕·버지니아·테네시 등 다수 주 |
| 정부 계약자 | 계약 조건에 따라 구속될 수 있음 |
| 민간 기업 | 자체 정책에 따름 |

`No DeepSeek on Government Devices Act`(H.R.1121) 등 연방 차원 입법이 진행됐다.

**결정적 구분**: 이 규제들은 "DeepSeek 애플리케이션 또는 그 후속 애플리케이션·서비스"를 대상으로 하며, 근거는 **데이터가 중국 서버로 전송된다**는 점이다. **미국 인프라에서 MIT 가중치를 자체 구동하는 것은 데이터 전송이 발생하지 않는다.**

실제로 NVIDIA가 `nvidia/DeepSeek-V4-Pro-NVFP4` 양자화 모델을 배포하고 build.nvidia.com에 모델 카드를 게시했으며, Runpod·Spheron 등 미국 GPU 클라우드들이 배포 가이드를 제공하고 있다. **미국 인프라 위에서 V4를 구동하는 것은 이미 표준 관행이다.**

### 11.1 AI 스타트업 — 비용 구조 자체를 바꾸는 선택

| 항목 | 내용 |
|---|---|
| 대상 | 시드~시리즈A, 프런티어 API 비용이 번레이트를 압박하는 단계 |
| 근거 | V4-Pro가 Opus 대비 입력 약 34배, 출력 약 86배 저렴. MIT 라이선스 |
| 구성 | 초기 API → PMF 확인 후 자체 호스팅 전환 |
| 주의 | **엔터프라이즈 고객 실사에서 "중국 모델" 질문이 반드시 나온다.** 자체 호스팅 아키텍처 다이어그램을 미리 준비할 것 |
| 강점 | MIT라서 파인튜닝·재배포·자체 브랜드화에 법적 마찰이 없다 |

### 11.2 개발자 도구 / 코딩 SaaS

| 항목 | 내용 |
|---|---|
| 근거 | LiveCodeBench 93.5, Codeforces 3206, SWE Verified 80.6 |
| 경제성 | 코딩 에이전트는 토큰 소모가 극심하다. **여기서 34~86배 가격차가 마진을 만든다** |
| 구성 | 자사 VPC 내 8×H200(Pro) 또는 2×H200(Flash) 클러스터 |
| 사례 | Morph 등이 이미 V4-Flash를 bf16 무양자화로 서빙 중 |
| 리스크 | 서버리스 호스트 다수가 활성값을 fp8로 양자화해 참조 가중치와 출력이 달라진다. **품질 일관성이 중요하면 직접 서빙할 것** |

### 11.3 규제 산업 (헬스케어·금융) — VPC 배포

| 항목 | 내용 |
|---|---|
| 근거 | HIPAA·SOC2·GLBA 준수를 위해 어차피 데이터가 외부로 나갈 수 없다 |
| 구성 | AWS/Azure/GCP VPC 내 자체 배포. 외부 egress 차단 |
| 경제성 | p5.48xlarge 온디맨드 약 $55/h, 1년 예약 약 $33/h |
| **냉정한 계산** | API 요율($0.14/$0.28) 기준 손익분기는 **일 30~40억 토큰** 수준이다. 8×H100 단일 노드로는 물리적으로 소화할 수 없는 양이다 |
| 결론 | **비용 절감이 아니라 데이터 주권·규제 준수·파인튜닝이 자체 호스팅의 이유다.** 비용 논리로 자체 호스팅을 정당화하려 하면 실사에서 무너진다 |

### 11.4 연방 계약자 / 공공 — 계약서 확인 필수

기술적으로는 자체 호스팅이 가능하나, **계약 조항에 중국 기원 소프트웨어 배제 조항이 있을 수 있다.** 가중치가 소프트웨어에 해당하는지에 대한 해석이 계약마다 다르다.

법무 검토 없이 진행하면 안 되는 영역이다. 진행한다면:
- 계약 담당관(CO)에게 사전 서면 조회
- 모델 출처, 배포 아키텍처, 데이터 흐름을 문서화
- 대안 모델(Llama, Mistral, GPT-OSS 등) 병행 검토

### 11.5 미국 시나리오 우선순위

| 순위 | 세그먼트 | 경제성 | 규제 마찰 | 종합 |
|---|---|---|---|---|
| 1 | 코딩 SaaS / 개발자 도구 | 매우 높음 | 낮음 | **적극 권장** |
| 2 | AI 스타트업 백엔드 | 매우 높음 | 중 (실사 대응) | 권장 |
| 3 | 규제 산업 VPC 배포 | 낮음 (주권이 목적) | 중 | 조건부 |
| 4 | 연방 계약자 | – | 높음 | 법무 검토 필수 |
| 5 | 정부기관 직접 | – | 금지 | 불가 |

### 11.6 3개국 비교 요약

| 축 | 한국 | 일본 | 미국 |
|---|---|---|---|
| 규제 성격 | 개인정보 국외이전 + 공공 차단 | 검토 단계 + 민간 자율 금지 | 정부·계약자 명시 금지 |
| 자체 호스팅 정당성 | 성립 | 성립 | 성립 (관행 확립) |
| 언어 근거 | **제3자 데이터 충분 (84.9)** | **없음 (검증 필수)** | 문제 없음 |
| 최적 진입점 | 개발 조직 코딩 | 코딩 + 파생 모델 개발 | 코딩 SaaS |
| 최대 장애물 | 중국산 배제 정서 | 일본어 미검증 | 엔터프라이즈 실사 |
| 대안 모델 | Solar Open 2 (성능 대등) | Syn Pro 등 현지 모델 | Llama, Mistral, GPT-OSS |

**세 시장 모두에서 코딩 에이전트가 1순위다.** 언어 검증이 불필요하고, 성능 근거가 가장 확실하며(LiveCodeBench 1위), 개인정보가 개입하지 않아 규제 마찰이 최소이기 때문이다.

---

## 12. 도입 판단 체크리스트

### 12.1 기술 검증

- [ ] Flash vs Pro 실제 태스크 품질 격차 측정 — 대부분 Flash로 충분하다는 가설을 먼저 반증할 것
- [ ] **모드별(Non-think / High / Max) 품질·비용·지연 3축 측정** — 이것이 가장 큰 레버다
- [ ] 1M 컨텍스트 needle-in-haystack 자체 측정 (MRCR 83.5 / CorpusQA 62.0의 실전 의미)
- [ ] SimpleQA 취약성 대응: RAG 파이프라인 구축 및 근거 없는 답변 거부 검증
- [ ] `encoding_dsv4` 통합 — 기존 `apply_chat_template` 의존 코드 전수 점검
- [ ] 한국어 토큰 효율 실측 (성능은 대등해도 비용은 다를 수 있음)
- [ ] 일본어 사용 시 Nejumi / JMMLU 자체 평가 (필수)
- [ ] DSpark 적용 전후 처리량 실측
- [ ] 중국어 정치·역사 도메인 응답 편향 점검 (해당 시)

### 12.2 인프라

- [ ] vLLM v0.23.0 이상 확인. SGLang MegaMoE는 Blackwell 전용
- [ ] RTX Pro 6000 Blackwell 사용 시 Inductor 컴파일 이슈 현재 상태 확인
- [ ] Pro 도입 시 8×H200 단일 노드 확보 가능성 (8×H100으로는 불가)
- [ ] 서버리스 호스트 사용 시 fp8 활성값 양자화 여부 확인 — 참조 가중치와 출력이 달라짐
- [ ] Preview → GA 전환 시 재평가 계획
- [ ] 캐시 히트 최적화 설계 (prefix caching)

### 12.3 거버넌스·법무

- [ ] **호스팅 API 사용 금지 여부 결정** — 민감 데이터는 자체 호스팅 외 선택지 없음
- [ ] 조직 조달 정책의 중국산 소프트웨어 배제 조항 확인
- [ ] (미국) 연방 계약 조항 검토, CO 사전 조회
- [ ] (한국) 정보보호 부서와 "가중치 자체 구동 ≠ 데이터 국외이전" 논점 사전 정리
- [ ] 엔터프라이즈 고객 실사 대응 자료 준비 (배포 아키텍처, 데이터 흐름도)
- [ ] MIT 라이선스 사본 포함 (유일한 의무)

### 12.4 비용

- [ ] **자체 호스팅 손익분기 실계산** — API 대비 일 30~40억 토큰이 손익분기다. 대부분 조직은 이를 넘지 못한다
- [ ] 자체 호스팅의 진짜 이유를 명문화: 데이터 주권 / 규제 준수 / 파인튜닝 / 지연시간 중 무엇인가
- [ ] 모드별 토큰 소모 측정 후 라우팅 정책 수립

---

## 13. 라이선스

**MIT License.** 저장소와 모델 가중치 모두 해당한다.

| 항목 | 내용 |
|---|---|
| 상업적 사용 | 자유 |
| 수정·파인튜닝 | 자유 |
| 재배포 | 자유 |
| 파생 모델 네이밍 | **제약 없음** |
| 표기 의무 | **없음** |
| 유일한 의무 | 라이선스·저작권 고지 사본 포함 |

Upstage Solar License(접두사·표기 의무), Llama Community License(사용자 수 제한·표기), Modified MIT(Kimi K3) 대비 가장 자유롭다. **자체 브랜드 제품에 임베딩할 계획이라면 이 항목만으로도 선택 근거가 된다.**

---

## 14. 인용

```bibtex
@misc{deepseekai2026deepseekv4,
      title={DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence},
      author={DeepSeek-AI},
      year={2026},
}
```

---

## 15. 참고 자료

| 구분 | 링크 |
|---|---|
| V4-Pro 모델 카드 | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro |
| V4-Flash 모델 카드 | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash |
| V4-Pro-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base |
| V4-Flash-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base |
| DSpark 체크포인트 | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark |
| DSpark (Flash) | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark |
| NVIDIA NVFP4 양자화 | https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4 |
| 기술 보고서 | https://arxiv.org/abs/2606.19348 |
| API 문서 | https://api-docs.deepseek.com/ |
| Claude Code 연동 (공식) | https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/ |
| 코딩 에이전트 통합 (공식) | https://api-docs.deepseek.com/guides/coding_agents/ |
| SGLang 배포 가이드 | https://lmsysorg.mintlify.app/cookbook/autoregressive/DeepSeek/DeepSeek-V4 |
| DeepSpec (spec decoding) | https://github.com/deepseek-ai/DeepSpec |

---

*벤치마크 수치는 DeepSeek 공식 모델 카드 기준이다. 한국어 데이터는 업스테이지가 Solar Open 2 발표 시 공개한 제3자 평가 결과이며 DeepSeek 공식 수치가 아니다. 모델 카드 자체가 preview 상태를 명시하므로, 도입 판단은 자체 데이터 재현 평가를 전제로 할 것.*
