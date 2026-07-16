# MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started

> 초경량 1B 파라미터 로컬 LLM 시작 가이드
> 모델 페이지: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
> 라이선스: Apache-2.0 (베이스 모델 MiniCPM5-1B로부터 상속)

---

## 1. 모델 개요

| 항목 | 내용 |
| :--- | :--- |
| 파라미터 규모 | 1B (10억) |
| 베이스 모델 | `openbmb/MiniCPM5-1B` |
| 미세 조정 데이터 | Fable 5 데이터 (post-training) |
| 배포 포맷 | GGUF (llama.cpp 계열 런타임용 양자화 빌드) |
| 최대 컨텍스트 | 128K 토큰 (131,072 / upstream `config.json` 기준) |
| 아키텍처 | llama |
| 채팅 템플릿 | MiniCPM5 네이티브 템플릿이 GGUF 메타데이터에 내장 |
| 지원 언어 | 영어, 중국어 |
| 특화 영역 | 코드 생성/디버깅, 명령어 수행(Instruction Following), 도구 호출(Tool Calling) |

이 모델은 CPU 단독 또는 저사양 GPU 환경에서도 구동 가능한 초경량 모델로, llama.cpp, Ollama, LM Studio, jan, KoboldCpp 등 GGUF 호환 런타임 전반에서 사용할 수 있습니다. 'Thinking' 모드(Chain-of-Thought 추론)와 'No Think' 모드(빠른 응답)를 전환할 수 있는 하이브리드 추론 구조가 특징입니다.

참고: 이름에 포함된 'Fable 5'는 학습 데이터 출처를 가리키는 표기이며, Anthropic의 상용 폐쇄형 모델 'Claude Fable 5'와는 별개의 오픈소스 커뮤니티 모델입니다.

---

## 2. 제공 파일 (양자화 버전 선택)

| 파일 | 양자화 | 크기 | 비고 |
| :--- | :--- | :--- | :--- |
| `...-Q4_K_M.gguf` | Q4_K_M | 약 657 MB | 최소 용량, 저메모리 환경용 |
| `...-Q5_K_M.gguf` | Q5_K_M | 약 751 MB | 품질/용량 균형 |
| `...-Q8_0.gguf` | Q8_0 | 약 1.1 GB | **권장 기본값** |
| `...-F16.gguf` | F16 | 약 2.1 GB | 풀 프리시전 변환 원본 |

**선택 가이드**: 1B 모델은 양자화 손실에 상대적으로 민감하므로, 메모리 여유가 있다면 **Q8_0**을 기본으로 사용하는 것을 권장합니다. 램 2GB 미만의 극단적 제약 환경에서만 Q4_K_M을 고려하십시오.

---

## 3. 설치 및 실행 방법

### 3.1 llama.cpp (CLI)

macOS / Linux 설치:

```bash
curl -LsSf https://llama.app/install.sh | sh
```

Windows (WinGet):

```bash
winget install llama.cpp
```

터미널에서 직접 추론:

```bash
llama cli -hf GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

로컬 파일로 직접 실행 (Q8_0 기준):

```bash
llama-cli \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -p "Write a Python function to merge two sorted lists." \
  -n 512 \
  --temp 0.9 --top-p 0.95 \
  -c 8192
```

컨텍스트 길이(`-c`)는 최대 131,072까지 지원하지만, 실제 사용 가능한 길이는 VRAM/RAM에 따라 조정해야 합니다.

### 3.2 llama.cpp 서버 (OpenAI 호환 API)

```bash
llama-server \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -c 8192 --port 8080
```

서버 기동 후 `http://localhost:8080`에서 웹 UI 및 OpenAI 호환 `/v1/chat/completions` 엔드포인트를 사용할 수 있습니다. 기존 OpenAI SDK 기반 코드에서 `base_url`만 변경하면 그대로 연동됩니다.

### 3.3 Ollama

```bash
ollama run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

HuggingFace 저장소에서 직접 pull하여 실행하는 방식으로, 별도의 Modelfile 작성이 필요 없습니다.

### 3.4 LM Studio / jan / KoboldCpp

저장소의 `.gguf` 파일을 다운로드하여 로드하기만 하면 됩니다. MiniCPM5 채팅 템플릿이 GGUF 메타데이터에 내장되어 있으므로 템플릿을 수동 설정할 필요가 없습니다.

- LM Studio: 검색창에 `GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF` 입력 후 원하는 양자화 버전 다운로드

### 3.5 llama-cpp-python (Python 연동)

```bash
pip install llama-cpp-python
```

```python
from llama_cpp import Llama

llm = Llama.from_pretrained(
    repo_id="GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    filename="MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf",
)

response = llm.create_chat_completion(
    messages=[
        {"role": "user", "content": "두 정렬 리스트를 병합하는 파이썬 함수를 작성해줘."}
    ]
)
print(response["choices"][0]["message"]["content"])
```

### 3.6 vLLM

```bash
pip install vllm
vllm serve "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF"
```

OpenAI 호환 API 호출:

```bash
curl -X POST "http://localhost:8000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  --data '{
    "model": "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'
```

### 3.7 Docker Model Runner

```bash
docker model run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

### 3.8 코딩 에이전트 연동 (Pi / Hermes / OpenClaw)

llama.cpp 서버를 백엔드로 띄운 뒤, OpenAI 호환 엔드포인트(`http://localhost:8080/v1`)를 각 에이전트의 커스텀 프로바이더로 등록하는 방식입니다. 로컬 코딩 에이전트 실험용으로 유용합니다.

---

## 4. 샘플링 파라미터 권장값

베이스 모델(MiniCPM5-1B)의 생성 기본값을 상속합니다.

| 모드 | 파라미터 |
| :--- | :--- |
| **Think** (기본값) | `temperature=0.9`, `top_p=0.95` |
| **No Think** | `temperature=0.7`, `top_p=0.95`, `enable_thinking=False` |

- **Think 모드**: 최종 답변 전에 내부 추론(reasoning) 블록을 출력합니다. 복잡한 코딩/추론 작업에 적합하지만, 파이프라인에 연동할 때는 추론 블록을 파싱·제거하는 후처리 로직이 필요합니다.
- **No Think 모드**: 추론 과정 없이 즉답합니다. 지연 시간이 중요한 챗봇/분류 작업에 적합합니다.

---

## 5. 성능 벤치마크

V2 버전에서 도구 호출(Tool Calling) 성능이 크게 개선되었습니다. (모델 제작자 공개 수치 기준)

| 모델 | BFCL (non_live) | BFCL (live) | API-Bank |
| :--- | :--- | :--- | :--- |
| MiniCPM5-1B (Base) | 41.51% | 60.24% | 7.30% |
| **V2 Thinking 모델** | **43.06%** | **63.33%** | **22.10%** |

특히 API-Bank 점수가 7.30% → 22.10%로 3배가량 상승한 점이 도구 호출 특화 학습의 효과를 보여줍니다. 도구 사용에 더 특화된 파생 모델로 `MiniCPM5-Claude-Toolusage`도 별도 제공됩니다.

---

## 6. 장점

- **초경량 로컬 구동**: 최소 657MB(Q4_K_M)로 CPU 단독, 라즈베리파이급 SBC, 구형 노트북에서도 실행 가능
- **128K 장문 컨텍스트**: 1B급 모델로는 이례적인 긴 컨텍스트 지원. 대규모 코드베이스·장문 문서 분석에 활용 가능
- **하이브리드 추론**: Think/No Think 모드 전환으로 품질과 속도를 작업별로 선택
- **도구 호출 강화**: 동급 1B 오픈소스 모델 대비 Tool Calling 성능에서 SOTA를 목표로 설계
- **넓은 런타임 호환성**: llama.cpp, Ollama, LM Studio, vLLM, Docker 등 사실상 모든 GGUF 생태계 지원
- **Apache-2.0 라이선스**: 상업적 이용 및 재배포에 제약이 적음
- **템플릿 내장**: 채팅 템플릿이 GGUF에 포함되어 있어 별도 설정 없이 즉시 사용 가능

---

## 7. 단점 및 한계

- **1B 규모의 근본적 한계**: 복잡한 일반 추론, 다단계 논리, 폭넓은 세계 지식에서 프론티어급 모델(GPT-4, Claude 등)과 격차가 큼. 범용 어시스턴트보다는 특정 태스크(코딩 보조, 도구 호출 라우팅, 분류)에 한정해 사용하는 것이 현실적
- **Thinking 모드의 부가 출력**: 추론 블록이 최종 답변에 앞서 출력되므로, 애플리케이션 연동 시 파싱 로직이 추가로 필요. 추론 블록만큼 토큰 소비와 지연 시간도 증가
- **실효 컨텍스트 제약**: 128K는 이론상 최대치이며, 실제 사용 가능한 길이는 런타임과 하드웨어(RAM/VRAM)에 좌우됨. 저사양 환경에서는 8K 내외 설정이 현실적
- **양자화 민감도**: 소형 모델 특성상 Q4 이하 양자화에서 품질 저하가 상대적으로 두드러질 수 있음 (Q8_0 권장 사유)
- **언어 커버리지**: 공식 지원 언어는 영어·중국어 중심. 한국어 성능은 별도 검증 필요
- **인퍼런스 프로바이더 미지원**: 현재 HuggingFace Inference Providers에 배포되어 있지 않아 클라우드 API 형태로는 사용 불가 (로컬 구동 전용)

---

## 8. 활용 시나리오 제안

| 시나리오 | 권장 설정 |
| :--- | :--- |
| 로컬 코딩 어시스턴트 (오프라인) | Q8_0 + Think 모드, llama-server + 에디터 연동 |
| 온디바이스 도구 호출 라우터 | Q8_0 + Think 모드 (BFCL/API-Bank 강점 활용) |
| 저지연 챗봇 / 분류기 | Q5_K_M + No Think 모드 |
| 대규모 문서/코드베이스 요약 | F16 또는 Q8_0 + 긴 `-c` 설정 (RAM 확보 필수) |
| 엣지 디바이스 실험 | Q4_K_M + 컨텍스트 4K 이하 |

---

## 9. 참고 링크

- GGUF 저장소: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Transformers 체크포인트: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking
- 베이스 모델: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
