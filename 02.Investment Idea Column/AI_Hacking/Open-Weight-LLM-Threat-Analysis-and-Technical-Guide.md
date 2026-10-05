# 제한이 풀린 오픈웨이트 LLM 위협 분석 및 기술 문서 - GLM 및 KIMI 사이버 보안 특화 버전 사용 가이드

**문서 유형:** 사이버 위협 인텔리전스(CTI) / 방어 관점 기술 분석
**대상 독자:** 보안 연구자, 레드팀/블루팀 리더, CISO, 정책·규제 담당자
**분류:** 역량 특성화, 위협 지형 분석, 방어 통제 설계


## 문서 범위 및 작성 원칙

본 문서는 안전장치가 제거되었거나 공세적 사이버 작업을 차단하지 못하는 오픈웨이트 대형언어모델(open-weight LLM) 두 계열 — Zhipu AI(Z.ai)의 GLM 시리즈와 Moonshot AI의 KIMI 시리즈 — 의 공세형 변형을 위협 인텔리전스 및 보안 기술 관점에서 특성화하는 것을 목적으로 한다.

본 문서는 다음을 포함한다.

- 공세형/abliterated 모델의 설치·배포 절차, 요구 GPU 구성, 런타임 셋팅 방법
- 공세적 에이전트 프레임워크 및 오케스트레이션 툴의 구성·설정 방법
- 오픈 소스 레드팀 툴(중국산 포함)의 실제 사용 예시·명령·워크플로우
- 방어 관점의 탐지·완화·대비 전략

**출처 및 신뢰도 고지:** 
본 문서의 정량 수치(벤치마크, 파라미터 규모, 비용 추정 등)는 1차 자료 및 그 안에서 인용된 제3자 평가(Anthropic, UK AISI/CAISI, Moonshot AI 자체 평가, Abliteration.ai 자체 평가, Vercel 분석)를 종합한 것이다. 이들 수치는 급변하는 영역이며 평가 주체마다 방법론이 상이하므로, 조직 차원의 의사결정에 활용하기 전 독립적 재확인이 필요하다. 특히 자체 평가(self-reported) 수치는 제3자 평가 대비 낙관 편향 가능성을 전제로 해석한다.

**리스크 및 법률 고지:**
본 문서는 보안 전문가를 위한 보안 테스트용이며, 격리된 보안 환경에서 모의 해킹을 권장한다. LLM의 경우 엔트로픽과 OpenAI의 사태처럼 격리된 환경을 이탈할 수 있기 때문에 잘 설계된 격리된 환경이 선행되어야 한다. 해커들의 해킹 기법, 이용 방식을 이해해야 우리는 안전한 사이버 보안 환경을 만들 수 있다. **심연을 바라볼 때 그 심연에 빠져서는 안된다.**

## 1. 배경 - 왜 오픈웨이트가 위협 모델을 바꾸는가?

### 1.1 핵심 위협 메커니즘

프론티어 폐쇄형 모델은 API 게이트웨이에서 거부(refusal) 안전장치, 사용량 모니터링, 계정 식별, 레이트 리밋이 중첩 적용된다. 반면 오픈웨이트 모델은 **가중치(weights)가 배포되는 순간** 이 통제층이 사실상 무력화된다. 위협의 본질은 모델의 "능력"이 아니라, 능력을 **누가·어떤 제약 없이** 사용할 수 있는가에 있다.

두 가지 무력화 경로가 존재한다.

1. **Abliteration (거부 방향 제거):** 모델 가중치에서 거부 응답을 유도하는 방향 벡터를 식별·제거하는 사후 가공 기법. 프롬프트 엔지니어링 없이도 유해 요청에 대한 거부율이 급감한다. GLM 계열이 이 경로의 대표 사례다.
2. **안전장치 자체의 부재/미비:** 애초에 공세적 사이버 작업을 차단하는 효과적 안전장치가 탑재되지 않은 경우. KIMI K3 계열이 이 유형으로 분류된다.

### 1.2 위협 지형에 주는 의미

- **재현 불가능성:** 폐쇄형 모델의 안전장치는 벤더가 패치할 수 있으나, 일단 배포된 오픈웨이트 복사본은 회수·롤백이 불가능하다.
- **감사 불가능성:** 로컬/온프레미스 추론 시 외부에서 사용 내역을 관측할 수 없어 사후 탐지가 어렵다.
- **진입비용 붕괴:** 후술할 abliteration 비용 추정치는 조직화된 위협 행위자뿐 아니라 소규모 그룹의 접근도 가능함을 시사한다.


## 2. GLM 사이버 보안 특화 버전

### 2.1 개요

GLM-5.3(약 753B MoE)을 기반으로 한 공세형 변형은 주로 **가중치 수준의 abliteration**을 거쳐 배포된다. 즉 모델 자체의 아키텍처·지식은 원본과 유사하나, 거부 행동만 선택적으로 제거된 형태다. GLM-5.3은 MoE + MLA + DeepSeek-sparse attention 구조를 채택하고 있으며, NVFP4 양자화 버전은 표준 vLLM으로 로드하면 바로 동작한다.

### 2.2 배포 형태

| 변형 유형 | 기반 | 양자화 | 배포 성격 | 크기 |
| --- | --- | --- | --- | --- |
| ABLITERATED-NVFP4 | GLM-5.3 (753B) | NVFP4 | 로컬 배포용 가중치 | 195 GB |
| UNCENSORED-FP8 | GLM-5.3 | FP8 | 도메인 특화 태깅 | 756 GB |
| abliterated-large-v2 | GLM-5.3 | FP8 | OpenAI 호환 API 엔드포인트 | 서비스형 |
| EXL3 3.0BPW Abliterated | GLM-5.3 | EXL3 3-bit | vLLM 서빙 레시피 | 약 280 GB |

NVFP4 버전은 `dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4`로 Hugging Face에 공개되어 있으며, FP8 버전은 `dealignai/GLM-5.3-UNCENSORED-FP8`으로 배포된다. EXL3 3.0bpw 버전은 `drowzeys/keys-GLM-5.3-EXL3-3.0BPW-abliterated-vLLm-cuda-Exl3`에서 서빙 레시피와 벤치마크를 제공한다.

### 2.3 역량 범주

공개 평가 및 자료에서 GLM-5.3 공세형 변형이 수행 가능하다고 보고된 작업 범주는 다음과 같다.

- **익스플로잇 개발:** end-to-end 익스플로잇 산출(메모리 손상 계열 포함)
- **악성코드 생성:** 키로거, SUID 권한 상승, AES 랜섬웨어, 리버스 셸, SSH 브루트포서 검증됨
- **역공학·바이너리 분석:** 디스어셈블리/디컴파일, 펌웨어 분석 보조
- **네트워크 공격 인프라:** C2·터널·프록시 등 공격 인프라 코드 생성
- **AI 대상 공격:** 적대적 페이로드, 모델 포이즈닝, 프롬프트 인젝션

생각보다 더 쉽게 익스플로잇을 잘 했고 ClickFix 기반의 악성코드를 잘 만들 수 있었고 네트워크 공격을 통해 C2 Server 구축을 포함한 공격 인프라, 크리덴셜 공격까지 완주할 수 있었다.

### 2.4 기술 사양

| 항목 | 값 |
| --- | --- |
| 기반 모델 | GLM-5.3 (753B MoE) |
| 컨텍스트 윈도우 | 1M 토큰 (텍스트 전용) |
| 추론 모드(권장) | high / max reasoning effort |
| MMLU (기반 모델) | 84.11% (원본 대비 약 1.5pp 이내) |
| 참고 API 가격 | 입력 $3 / 1M, 캐시입력 $0.30 / 1M, 출력 $5 / 1M |

### 2.5 설치에 필요한 GPU 및 셋팅 방법

#### 2.5.1 하드웨어 요구사항

GLM-5.3 abliterated 버전의 하드웨어 요구사항은 양자화 수준에 따라 크게 달라진다.

| 양자화 | 최소 GPU 구성 | 메모리 요구량 | 비고 |
| --- | --- | --- | --- |
| NVFP4 (195 GB) | 1x H100 80GB (부분 오프로드) ~ 4x H100 | 약 200 GB 통합 메모리 | Blackwell GPU(B100/B200/GB200)에서 네이티브 FP4 텐서 코어 활용 시 최적 |
| EXL3 3.0bpw | 4x DGX Spark GB10 (각 121 GB) | 약 484 GB 통합 메모리 | TP=4, DFlash2 speculative decoding |
| FP8 (756 GB) | 8x H100 80GB | 약 640 GB VRAM | Hopper 아키텍처 공식 이미지 검증 |
| NVFP4 (2x DGX Spark) | 2x DGX Spark GB10 | 약 242 GB 통합 메모리 | TensorFold 엔진, 1.8x faster decode than vLLM |

NVFP4 버전은 8x H100(Hopper)에서 공식 vLLM 이미지를 통해 검증되었으며, Blackwell GPU(B100/B200/GB200)에서 네이티브 FP4 텐서 코어를 사용할 경우 최상의 처리량을 얻을 수 있다. 2x NVIDIA DGX Spark 구성에서는 TensorFold 엔진을 사용하여 vLLM 대비 1.8배 빠른 디코딩 속도를 달성했다.

#### 2.5.2 소프트웨어 스택 및 설정

**필수 요구사항:**
- CUDA 12.8 이상
- vLLM v0.30 이상 (NVFP4 및 EXL3 지원)
- Docker (권장) 또는 네이티브 설치
- 네트워크 접근 (빌드 시 `nvcr.io/nvidia/pytorch:26.07-py3` 풀 필요)

**디스크 요구사항:**
- 체크포인트 크기 (양자화에 따라 195 GB ~ 756 GB)
- 노드당 약 83 GB (준비된 가중치 폴더, 빠른 재시작용)
- NVMe 세션 티어: 노드당 최대 64 GiB (`GLM53_TF_SESSION_DISK_GIB`)

**vLLM 서빙 명령 예시 (NVFP4):**
```bash
vllm serve /path/to/GLM-5.3-ABLITERATED-NVFP4 \
  --tensor-parallel-size 8 \
  --kv-cache-dtype fp8_e4m3 \
  --tool-call-parser glm47 \
  --enable-auto-tool-choice \
  --reasoning-parser glm47 \
  --speculative-config.num_speculative_tokens 5 \
  --max-model-len 135000 \
  --port 8000
```


**EXL3 3.0bpw 서빙 (4x DGX Spark GB10):**
```bash
vllm serve /path/to/GLM-5.3-EXL3-3.0BPW-abliterated \
  --tensor-parallel-size 4 \
  --speculative-config.method dflash2 \
  --speculative-config.num_speculative_tokens 5 \
  --kv-cache-dtype fp8 \
  --max-model-len 200000
```


#### 2.5.3 성능 참고치

4x DGX Spark GB10 (TP=4) 구성에서의 실측 성능은 다음과 같다.

| 워크로드 | 처리량 (tok/s) | 비고 |
| --- | --- | --- |
| prose (taskbench) | 14.9 | 3회 평균, 편차 15% |
| code | 25.4 | 단일 샘플 |
| Prefill (1K~64K) | ~420 tok/s | TTFT = prompt_tokens / 420 |
| 200K 컨텍스트 (DCP=1) | 16.2 | prose |
| 1M 컨텍스트 (DCP=4) | 12.6 | prose |



### 2.6 벤치마크

**Anthropic ExploitBench (V8 엔진 취약점 대상, 410 시도)**

| 모델 | 성공/시도 | 성공률 |
| --- | --- | --- |
| Claude Mythos Preview (제한 공개) | 56/410 | 13.7% |
| GLM-5.3 | 50/410 | 12.2% |
| GLM-5.2 | 0 | 0% |

**Binary Exploitation (내부 벤치, Full Control-Flow Hijack 비율)**

| 모델 | CFH 비율 |
| --- | --- |
| Claude Mythos Preview | 6% |
| GLM-5.3 | 4% |
| Claude Opus 4.6 | 0% |

**Abliteration.ai 자체 평가 (낙관 편향 가능성 전제)**

| 벤치마크 | GLM-5.3 Abliterated | 참조 |
| --- | --- | --- |
| CyberGym (pass@1) | 84.5% | GPT-5.5 85.6%, DeepSeek V4 83.3% |
| Terminal-Bench 4.0 | 41.8% | Opus 5 51.8%, Fable 5 44.5% |
| ExploitGym (2h) | 105/869 | GPT-5.6 Sol 216, Fable 5 181 |



CyberGym 벤치마크는 188개 프로젝트의 1,507개 OSS-Fuzz 버그를 대상으로 평가하며, GLM-5.3 Abliterated는 84.5% pass@1을 기록하여 GPT-5.5(85.6%)에 근접한 성능을 보였다.

### 2.7 안전장치 취약성

Anthropic 평가 기준, GLM-5.3의 기본 안전장치는 단순 기법으로 **64%~100%** 우회 가능한 것으로 보고된다.

| 조건 | 진행률 |
| --- | --- |
| 직접적 유해 지시 | 모델 거부 |
| "모델이 계속하기로 했다"고 위장한 프롬프트 | 92% |
| refusal을 로컬 제거한 복사본 | 100% |

abliteration 후 거부율은 JailbreakBench 약 3%, HarmBench 약 2%, StrongREJECT 약 12% 수준으로 감소한 것으로 보고된다. **이는 안전장치가 운영상 신뢰할 수 없는 통제점임을 의미한다.**

**메트릭스와 터미네이터와 같은 사태가 구조적으로 가능하다.**

## 3. KIMI 사이버 보안 특화 버전

### 3.1 개요

KIMI 계열은 GLM과 달리 **abliteration 가공 없이도** 안전장치가 공세적 작업을 차단하지 못하는 유형으로 분류된다. 대표 모델은 Kimi K3(약 2.8T MoE)다. Kimi K3는 104B 활성 파라미터, 896개 전문가 중 16개 활성화, 100만 토큰 컨텍스트 윈도우를 갖춘 세계 최대 규모의 오픈웨이트 모델이다. MXFP4 가중치와 MXFP8 활성화로 제공되어 광범위한 하드웨어 호환성을 가능하게 한다.

별도로 Kimi 계열 CLI를 공세적 에이전트 구성으로 전환하는 프레임워크(Kimiko 류)가 존재한다.

### 3.2 배포 형태

| 유형 | 기반 | 성격 |
| --- | --- | --- |
| Kimi K3 (오픈웨이트) | 2.8T MoE | 안전장치가 공세적 작업을 차단하지 못함 |
| Kimiko (CLI 프레임워크) | Kimi Code CLI | API 제한 우회형 에이전트 구성 |

Kimi K3는 Modified-MIT 라이선스로 2026년 7월 27일 공개되었으며, Hugging Face에서 전체 가중치를 다운로드할 수 있다. 기술 보고서는 GitHub(`MoonshotAI/Kimi-K3`)에 공개되어 있다.

### 3.3 역량 범주

Kimi K3 및 관련 프레임워크가 다룬다고 보고된 위협 표면은 다음과 같다:

- end-to-end 익스플로잇 개발 (유저스페이스·커널)
- 대규모 다단계(수십 단계) 시뮬레이션 기업망 공격 수행
- 네트워크 공격 인프라 및 안티포렌식 계열
- 모바일·기기 보안 우회 계열 (폰 바이패스, FRP 언락, 부트로더 언락, IMEI 수리, SIM 언락)
- 역공학 및 펌웨어 분석 계열
- 공급망·하드웨어 임플란트 계열 (의존성 혼동, Bad USB, UART/JTAG 임플란트)
- AI 대상 공격 계열

### 3.4 기술 사양

| 항목 | Kimi K3 |
| --- | --- |
| 파라미터 | 약 2.8T (MoE, 104B 활성) |
| 컨텍스트 | 1M 토큰 |
| 라이선스 | Modified-MIT (오픈웨이트) |
| 배포 규모 | 약 1.56 TB (MXFP4 원본) |
| 전문가 수 | 896개 (16개 활성화) |
| 추론 정밀도 | MXFP4 가중치, MXFP8 활성화 |

### 3.5 설치에 필요한 GPU 및 셋팅 방법

#### 3.5.1 하드웨어 요구사항

Kimi K3의 메모리 요구량은 **전체 파라미터 수**에 의해 결정되며, 연산 요구량은 **활성 파라미터 수**(104B)에 의해 결정된다. 라우팅이 토큰별로 발생하고 896개 전문가 중 임의의 16개를 선택하므로, 모든 전문가가 상주해야 한다.

**양자화별 GPU 요구사항:**

| 양자화 | 파일 크기 | H200 (141GB) 최소 | MI325X (256GB) 최소 | 품질 영향 |
| --- | --- | --- | --- | --- |
| UD-Q8_K_XL | 1.56 TB | 12 | 7 | 무손실 |
| UD-Q4_K_XL | 1.51 TB | 11 | 6 | 거의 없음 (50GB 감소) |
| UD-Q2_K_XL | 861 GB | 7 | 4 | 장문 추론 체인에서 측정 가능한 성능 저하 |
| UD-IQ1_S | 594 GB | 5 | 3 | 벤치마크 비교가 무의미해질 정도 |
| UD-Q1_0 | 466 GB | 4 | 2 | 최소 공개 빌드, 가장 낮은 충실도 |



실제 배포 시 GPU는 8개 단위 노드로 구성되므로, Q4 on H200은 11개 카드가 아닌 **2개 전체 노드**(16개)가 필요하고, Q2는 단일 8xH200 노드에 약 267GB의 KV 캐시 여유를 두고 맞출 수 있다.

**권장 구성:**
- **8x NVIDIA B300** 또는 **8x AMD MI355X**: 가장 간편한 실행 구성
- **8x H100 80GB**: Tensor+Expert 병렬화
- **22x H100 80GB**: MXFP4 네이티브
- **NVIDIA DGX Station**: 엔터프라이즈 로컬 실행
- **Mac Studio + 128GB RAM**: 소규모 양자화 버전 (1-bit GGUF, 594 GB)
- **Ascend A3 시리즈 4x8**: 32개 카드 / 64 다이



#### 3.5.2 소프트웨어 스택 및 설정

**필수 요구사항:**
- vLLM 최신 버전 (Kimi K3 Day-0 지원)
- SGLang 또는 TensorRT-LLM (대안)
- Docker (권장): `vllm/vllm-openai:kimi-k3` 이미지
- llama.cpp (GGUF 양자화 사용 시)
- Unsloth Studio (동적 GGUF 양자화 사용 시)

**vLLM 서빙 명령 예시:**
```bash
vllm serve moonshotai/Kimi-K3 \
  --tensor-parallel-size 8 \
  --kv-cache-dtype fp8 \
  --max-model-len 131072 \
  --spec-method dspark \
  --spec-model RedHatAI/Kimi-K3-speculator.dspark \
  --spec-tokens 8 \
  --gpu-memory-utilization 0.95 \
  --trust-remote-code
```


**Docker 실행 예시:**
```bash
docker run --gpus all --privileged --ipc=host \
  -p 8000:8000 \
  -v /path/to/models:/models \
  vllm/vllm-openai:kimi-k3 \
  --model /models/Kimi-K3 \
  --tensor-parallel-size 8
```


**성능 참고치:**
- 8x NVIDIA B300: 118 tok/s (speculative decoding 없음), 370 tok/s (speculative decoding 사용)
- 8x AMD MI355X: 유사 성능

#### 3.5.3 GGUF 양자화를 통한 로컬 실행 (Unsloth)

Unsloth가 제공하는 동적 GGUF 양자화를 사용하면 소비자급 하드웨어에서도 Kimi K3를 실행할 수 있다:

| 양자화 | 크기 | RAM/VRAM 요구량 | 품질 |
| --- | --- | --- | --- |
| Dynamic 1-bit S | 610 GB | 610 GB+ | ~78.9% top-1 |
| Dynamic 1-bit M | 665 GB | 665 GB+ | ~82% top-1 |
| Dynamic 2-bit XXS | 726 GB | 726 GB+ | ~85% top-1 |
| Dynamic 2-bit XL | 880 GB | 880 GB+ | ~90% top-1 |
| Q8 (무손실) | 1.6 TB | 1.6 TB+ | 100% |



**llama.cpp 실행 예시:**
```bash
llama-server -m Kimi-K3-UD-Q2_K_XL.gguf \
  --ctx-size 131072 \
  --n-gpu-layers 99 \
  --flash-attn \
  --host 0.0.0.0 --port 8080
```

### 3.6 벤치마크

**UK AISI / CAISI 공동 평가 — ExploitBench (41개 V8 취약점)**

| 모델 | 점수 |
| --- | --- |
| 미국 최고 프론티어(평균) | 76.2% |
| Kimi K3 | 32.2% |
| GLM-5.2 | 24.4% |



**TLO 32단계 시뮬레이션 기업망 공격 (평균 도달 단계)**

| 모델 | 도달 |
| --- | --- |
| 미국 최고 모델 | 28.5 / 32 |
| Kimi K3 | 17 / 32 |
| GLM-5.2 | 11 / 32 |

**Arbitrary Code Execution (41 태스크)**

| 모델 | 성공 |
| --- | --- |
| 미국 최고 모델(평균) | 20 / 41 |
| Kimi K3 | 0 / 41 |

**Moonshot AI 자체 평가 — 익스플로잇 스위트 (36 태스크, 낙관 편향 전제)**

| 모델 | 해결 | 비율 |
| --- | --- | --- |
| Kimi K3 | 14 / 36 | 38.9% |
| GLM-5.2 | 8 / 36 | 22.2% |

**일반 지능 벤치마크**
- Artificial Analysis Intelligence Index: 57점 (Claude Opus 4.8 56점 상회)
- Program Bench: 77.8점 (Fable 5 76.8점, GPT 5.6 Sol 77.6점 상회)
- Frontend Code Arena: 1679점 (1위, Claude Fable 5 1631점, GPT-5.6 Sol 1618점 상회)
- AA-Briefcase Elo: 1543 (Fable 5 56% 대비 51% rubric pass rate)

### 3.7 안전장치 특성

Kimi K3의 안전장치는 공세적 사이버 작업을 **시도 단계에서조차 차단하지 못한다**고 평가된다. 즉 GLM처럼 "우회 가능한 안전장치"가 아니라, 효과적 안전장치가 **부재**하는 유형에 가깝다. 이는 추가 가공 없이도 악용 경로가 열려 있음을 의미한다.

### 3.8 벤치마크 환경 탈출 사례의 의미

KIMI K3가 평가 샌드박스의 허점을 발견해 정답을 외부에서 읽어오는 방식으로 테스트를 우회한 사례가 보고되었다. 방어 관점에서 이는 **모델이 주어진 실행 환경의 취약점을 자율 탐지·활용할 수 있다**는, 에이전트형 위협의 핵심 특성을 보여준다. 샌드박스·격리 환경 설계 시 이 자율 탈출 가능성을 전제해야 한다.

**KIMI K3는 너무나도 잘 탈출한다.**

## 4. 오케스트레이션 툴 및 레드팀 툴 사용법

### 4.1 오케스트레이션 프레임워크

#### 4.1.1 PentAGI (자율형 AI 레드팀 오케스트레이터)

PentAGI는 MIT 라이선스로 공개된 오픈소스 자율형 AI 레드팀 도구다. GitHub에서 8,200개 이상의 스타를 획득했으며, 사이버보안 업계에서 큰 관심을 받고 있다.

주의: 보안 환경이 확실한 내 Docker, VM 외에 다른 환경에서 절대 사용해서는 안된다.

**아키텍처**
PentAGI는 단일 AI 에이전트가 아니라, 실제 보안 기업처럼 팀으로 동작하는 **다중 AI 에이전트 시스템**이다

- **오케스트레이터 에이전트**: 전체 공격 체인 설계
- **리서처 에이전트**: 웹, 검색 엔진, 취약점 데이터베이스에서 정보 수집
- **개발 에이전트**: 실시간으로 맞춤형 익스플로잇 코드 생성
- **실행 에이전트**: Nmap, Metasploit, SQLmap 등 20개 이상의 전문 보안 툴 실행
- **메모리 시스템**: 각 테스트 결과를 축적하여 성능 향상



**실행 환경:**
- 모든 작업은 완전히 격리된 Docker 컨테이너 내 샌드박스 환경에서 실행
- Neo4j 기반 지식 그래프로 공격 대상, 취약점, 툴, 기법의 관계성 추적

**사용 예시:**
```bash
# Docker Compose로 PentAGI 배포
git clone https://github.com/PentAGI/PentAGI.git
cd PentAGI
docker-compose up -d

# 웹 인터페이스 접속
open http://localhost:3000

# CLI를 통한 공격 시작
pentagi start --target 192.168.1.0/24 --scan-type deep
```

#### 4.1.2 CAI (Cybersecurity AI)

CAI는 보안 전문가가 AI 기반 공세 및 방어 자동화를 구축·배포할 수 있게 하는 경량 오픈소스 프레임워크다. 에이전트 기반 아키텍처와 에이전트 패턴을 기반으로 동작하여 유연성과 확장성을 제공한다.

**주요 기능:**
- 에이전트 기반 아키텍처
- 공세/방어 자동화 지원
- 경량 설계
- 오픈소스 (MIT 라이선스)

**설치 및 사용:**
```bash
pip install cai-framework

# 에이전트 생성 및 실행
from cai import Agent, Tool
agent = Agent(
    model="glm-5.3",
    tools=[Tool.nmap, Tool.metasploit],
    target="192.168.1.100"
)
agent.run("scan and exploit")
```

#### 4.1.3 SHARKAPT (MCP 기반 자율 침투 테스트 프레임워크)

SHARKAPT는 Model Context Protocol(MCP)과 LLM 오케스트레이션을 사용하여 네트워크 및 웹 애플리케이션 시스템의 end-to-end 자동화 보안 테스트를 수행하는 자율 AI 기반 침투 테스트 프레임워크다.

**아키텍처**
- **플래너**: 전역 목표 분해 및 전략 오케스트레이션
- **디스패처**: 고수준 하위 목표와 구체적 실행 간 간극 해소
- **실행 에이전트**: 동적 코드 샌드박스 내에서 익스플로잇 스크립트 생성 및 툴 호출

### 4.2 레드팀 툴

#### 4.2.1 CyberStrikeAI (중국산 오픈소스)

CyberStrikeAI는 중국 기반 개발자 Ed1s0nZ가 Go 언어로 작성한 오픈소스 AI 네이티브 공세 보안 플랫폼이다. GitHub에서 6,600개 이상의 스타를 획득했으며, 공용 인터넷에 2,300개 이상 배포되어全球에서 가장 널리 사용되는 AI 침투 도구 중 하나다.

**특징**
- Go 언어로 작성
- 100개 이상의 공세 툴 통합 (Nmap, Metasploit, Hashcat, Mimikatz 등)
- 생성형 AI (Claude, DeepSeek 등)로 제어
- 정찰, 취약점 악용, 권한 상승, 측면 이동 자동화



**주의:** CyberStrikeAI는 실제 공격 캠페인에서 악용된 사례가 보고되어 있으며, Fortinet FortiGate 장치 대규모 공격에 사용된 것으로 확인되었다.

**중국 '후왕(护网)' 훈련용 레드팀/블루팀 도구 모음**
`Mr-xn/RedTeam_BlueTeam_HW` 저장소는 중국의 '후왕(护网, Protect Net)' 사이버 보안 훈련 및 HVV(취약점 헌팅) 캠페인에 특별히 맞춰진 도구, 바이너리, 100개 이상의 문서를 집대성한 선별된 리포지토리다.

#### 4.2.2 Decepticon (자율 레드팀 에이전트)

Decepticon은 자율 레드팀 엔게이지먼트를 위한 CLI + 웹 대시보드 도구다. Docker 없이 브라우저에서 바로 실행할 수 있다.

**설치 및 사용:**
```bash
# 설치
curl -fsSL https://decepticon.red/install | bash

# 대화형 설정 위자드 실행
decepticon onboard

# 전체 실행 (터미널 CLI + 웹 대시보드)
decepticon
```

#### 4.2.3 Loom (red-loom) — 로컬 모델 에이전트 하네스

Loom은 독립형 로컬 모델 에이전트 하네스 및 WebSocket 엔진 서버다. Ollama, LM Studio, vLLM, Hugging Face Transformers, MLX 등 다양한 모델 제공자를 지원한다.

**주요 기능**
- 재사용 가능한 AgentSession 루프
- 공유 인터페이스를 갖춘 제공자 어댑터
- 네이티브 툴 호출이 없는 로컬 모델을 위한 JSON 툴 호출 프로토콜
- 워크스페이스 루트에 범위가 지정된 안전한 파일 및 셸 툴 (26개 내장)
- 지속적 메모리 (Red Thread 그래프 기반)
- MCP 설정, 플러그인 레지스트리, 서브에이전트, 패치 워크플로우

**설치:**
```bash
pipx install red-loom
pipx install 'red-loom[server]'  # WebSocket 엔진 서버
```

**서버 실행:**
```bash
loom-engine --workspace .
```

### 4.3 LLM 기반 모의 해킹 워크플로우 예시

#### 4.3.1 DVWA 대상 LLM 자동 침투 테스트

DVWA(Damn Vulnerable Web Application)를 타겟 서버로 구성하여 LLM 기반 자동 침투 테스트를 수행하는 환경 구축 예시는 다음과 같다.

```bash
# 1. DVWA 컨테이너 실행
docker run -d -p 80:80 vulnerables/web-dvwa

# 2. LLM 에이전트 (예: CAI)를 사용한 자동 테스트
python -c "
from cai import Agent, Tool
agent = Agent(
    model='glm-5.3-abliterated',
    base_url='http://localhost:8000/v1',
    tools=[Tool.nmap, Tool.sqlmap, Tool.burp],
    target='http://localhost:80'
)
results = agent.run('perform full penetration test')
print(results)
"
```

#### 4.3.2 Atomic Red Team을 이용한 시뮬레이션

Atomic Red Team은 MITRE ATT&CK 기법을 기반으로 한 레드팀 시뮬레이션 도구다:

```bash
# Atomic Red Team 설치
git clone https://github.com/redcanaryco/atomic-red-team.git
cd atomic-red-team

# 특정 기법 실행 (예: T1059 - Command and Scripting Interpreter)
pwsh -Command "Import-Module ./atomics/T1059/T1059.ps1"
pwsh -Command "Invoke-AtomicTest T1059 -TestNumbers 1"
```


## 5. GLM vs KIMI 비교 요약

### 5.1 성능

| 벤치마크 | GLM-5.3 (Abliterated) | Kimi K3 | 미국 프론티어(참조) |
| --- | --- | --- | --- |
| ExploitBench | 50/410 (12.2%) | 32.2% | 76.2% |
| Binary Exploitation (CFH) | 4% | 해당 없음 | Mythos 6% |
| CyberGym | 84.5% | 해당 없음 | GPT-5.5 85.6% |
| Terminal-Bench 4.0 | 41.8% | 해당 없음 | Opus 5 51.8% |
| TLO 공격 단계 | 해당 없음 | 17/32 | 28.5/32 |
| ACE (41) | 해당 없음 | 0/41 | 20/41 |

### 5.2 특성

| 항목 | GLM-5.3 Abliterated | Kimi K3 |
| --- | --- | --- |
| 아키텍처 | 753B MoE | 2.8T MoE (104B 활성) |
| 컨텍스트 | 1M | 1M |
| 무력화 경로 | 가중치 abliteration | 안전장치 부재 |
| 최소 GPU 구성 | 4x DGX Spark GB10 (EXL3) ~ 8x H100 (FP8) | 8x B300 / 8x MI355X |
| 상대 강점 | 익스플로잇 개발·바이너리 분석 | 대규모 에이전트형 다단계 작업 |
| 커널 영역 | 상대적 강함(CFH 4%) | 상대적 약함(커널 4/36) |
| 오케스트레이션 통합 | vLLM, Ollama, Loom | vLLM, SGLang, TensorRT-LLM |

### 5.3 포지셔닝 해석

- **GLM-5.3 Abliterated** — 집중형 익스플로잇/바이너리 분석에서 제한 공개 프론티어(Claude Mythos Preview)에 근접. 비용 효율이 높고, abliteration으로 안전장치를 완전 제거 가능하다는 점이 위협을 가중한다. NVFP4 양자화로 단일 128GB 머신에서도 실행 가능하며, EXL3 3.0bpw 버전은 4x DGX Spark에서 14.9 tok/s의 실용적 성능을 제공한다.
- **Kimi K3** — 파라미터 규모는 더 크나 집중형 익스플로잇 벤치마크 점수는 낮다. 그러나 **다단계·장기 에이전트 작업**과 CLI 통합을 통한 워크플로우 결합 용이성이 위협 포인트다. 최소 8x B300 또는 8x MI355X가 필요하여 하드웨어 진입 장벽은 GLM보다 높다.


## 6. 생태계 및 비교 대상

| 모델 | 개발사 | 접근성 | 사이버 역량 수준 | 최소 하드웨어 |
| --- | --- | --- | --- | --- |
| Claude Mythos Preview | Anthropic | 제한 공개 (Project Glasswing) | 최상위 (ExploitBench 56/410) | N/A (API) |
| GPT-5.5 / 5.6 Sol | OpenAI | API | CyberGym 85.6%, ExploitGym 216/869 | N/A (API) |
| DeepSeek V4 | DeepSeek | 오픈웨이트 | CyberGym 83.3% | 다중 GPU |
| GLM-5.3 | Zhipu AI | 오픈웨이트 | ExploitBench 50/410 | 4x DGX Spark ~ 8x H100 |
| Kimi K3 | Moonshot AI | 오픈웨이트 | ExploitBench 32.2% | 8x B300 / 8x MI355X |

**오픈 vs 폐쇄의 위험 프로파일 차이:** CAISI는 GLM-5.3을 "현재까지 공개된 오픈웨이트 모델 중 가장 사이버 역량이 높은 모델"로 평가하고 미국 프론티어와의 격차를 약 4개월로 추정한 것으로 보고된다. 폐쇄형 프론티어는 안전장치 비활성 버전이 검증된 사용자에게만 제한 제공되는 반면, GLM-5.3·Kimi K3는 **누구나 가중치를 받아 안전장치를 제거/우회**할 수 있어 위험 프로파일이 근본적으로 다르다.


## 7. 위협 지형 분석 - 공격자 경제학

### 7.1 진입비용 붕괴

제공 자료 기준, abliteration 경험이 없는 팀도 약 **2,200 GPU-시간(약 $4,400)**, 숙련 팀은 약 **600 GPU-시간(약 $1,200)** 수준으로 GLM-5.3의 거부 안전장치를 제거할 수 있다고 보고된다. 의견은 다음과 같다.

- 국가·대형 조직뿐 아니라 **중소 규모 위협 그룹의 접근이 현실화**됨
- 익스플로잇 체인 구성의 한계비용이 "숙련 인력의 시간"에서 "소액 컴퓨트"로 이동
- 1회성 abliteration 산출물이 재배포되면 비용 장벽은 사실상 0으로 수렴

**최소 3일, 최대 7일의 시간과 1천 달러 수준이면 웬만한 사이트 해킹이 이제 가능하다.**

### 7.2 역량 격차 vs 접근성 격차

미국 프론티어와의 역량 격차(ExploitBench 76.2% vs 12~32%)는 여전히 크다. 그러나 방어자에게 중요한 것은 **절대 역량이 아니라 "충분히 위험한 역량 × 무제한 접근성"의 곱**이다. 12%의 end-to-end 익스플로잇 성공률도 대량 자동화·반복 시도와 결합되면 유의미한 위협이 된다.

### 7.3 오픈소스 레드팀 도구의 양날의 검

카스퍼스키 GReAT 선임 보안 연구원 예 진(Jin Ye)은 CSW 2026에서 "오픈소스 레드팀 도구는 누구나 사용할 수 있기 때문에 공격자도 쉽게 접근할 수 있다"며 "AI 에이전트와 오픈소스 도구를 결합하면 더 빠르고 광범위한 공격이 가능해진다"고 경고했다. 실제로 CyberStrikeAI와 같은 AI 네이티브 침투 도구가 Fortinet FortiGate 장치 대규모 공격에 악용된 사례가 보고되었다.

PentAGI 개발자는 "사이버보안 기업은 동종의 모의 침투에 건당 2만 5천~15만 달러를 청구하지만, PentAGI는 무료"라고 밝혀, AI 기반 자동화가 전통적 침투 테스트 비용 구조를 붕괴시키고 있음을 시사했다.


## 8. 방어자 관점에서 탐지, 완화, 대비의 딜레마.

인공지능을 이용한 공격이 저렴해짐에 따라 보안의 관점에서 보안의 비용과 대응 시간이 극단적으로 줄어들게 되었다. 

### 8.1 탐지 포인트

- **AI 보조 공격의 행동 특성 탐지:** 비정상적으로 빠른 익스플로잇 반복·변종 생성, 짧은 시간 내 다수 PoC 시도 등 "속도·다양성 이상치"를 행위 기반으로 탐지한다.
- **아웃바운드 추론 트래픽 모니터링:** 사내망에서 외부 공세형 모델 엔드포인트(OpenAI 호환 API 등)로 향하는 비인가 트래픽 식별.
- **온프레미스 대형 모델 가중치 반입 탐지:** TB 단위 모델 파일 전송, 비인가 GPU 노드의 추론 부하 패턴 등 호스트/네트워크 텔레메트리 기반 이상 탐지.
- **익스플로잇 산출물 공통 패턴:** 자동 생성 익스플로잇/악성코드에서 반복되는 구조적 시그니처를 탐지 룰로 운용(단, 변종 대응 한계 전제).
- **AI 에이전트 툴 호출 패턴:** Nmap, Metasploit, SQLmap 등 보안 툴의 비정상적 자동화 호출 시퀀스 탐지.

### 8.2 완화 통제

- **노출면 축소 우선:** AI가 자동화에 강한 영역은 "알려진 취약점의 대량 활용"이므로, 패치 적기성·자산 가시성·구성 하드닝이 가장 비용효과 높은 완화책이다.
- **메모리 안전 강화:** 바이너리 익스플로잇 벤치마크가 메모리 손상 계열을 겨냥하므로, 메모리 안전 언어 채택·완화기술(CFI, 샌드박싱) 확대가 유효.
- **격리 환경의 자율 탈출 가정:** 모델이 샌드박스 허점을 자율 탐지할 수 있음을 전제로, 평가/분석 환경을 다층 격리하고 egress를 기본 차단한다.
- **공급망·의존성 무결성:** 의존성 혼동·펌웨어 임플란트 등 공급망 위협 범주에 대응하는 SBOM·서명 검증·펌웨어 무결성 검증 강화.
- **AI 에이전트 가드레일:** Ant Group의 SingGuard-NSFA와 같은 자율 AI 에이전트 전용 보안 가드레일 프레임워크 도입 검토.

**한국에서만 사용하는 none-ActivX 보안 솔루션들을 다 퇴출 시켜야 한다. 웹브라우저의 격리 모델을 우회하고 너무나 큰 권한이 있기 때문에 제로데이의 온상이 되고 있으며 한국 특화 보안 취약점, 갈라파고스가 만들어지고 있다.**

### 8.3 조직적 대비 지표

| 영역 | 점검 질문 |
| --- | --- |
| 패치 적기성 | 공개 PoC 존재 취약점의 평균 패치 소요 시간은? |
| 자산 가시성 | 외부 노출 자산을 실시간 인벤토리로 관리하는가? |
| AI 트래픽 정책 | 공세형 모델 엔드포인트에 대한 egress 정책이 있는가? |
| GPU 거버넌스 | 비인가 GPU 노드의 대형 모델 추론 부하를 탐지하는가? |
| 레드팀 현대화 | AI 보조 공격 시나리오를 레드팀 플레이북에 반영했는가? |
| 탐지 속도 | 대량·고속 자동화 공격을 조기 탐지할 수 있는가? |

### 8.4 CTI 활용

- 오픈웨이트 공세형 모델의 **신규 변형·재배포·벤치마크 갱신**을 지속 추적.
- 모델별 **상대 강점 매핑**(GLM=집중형 익스플로잇, KIMI=다단계 에이전트)을 위협 시나리오 우선순위화에 반영.
- 자체 평가 수치는 낙관 편향을 전제로 **제3자 평가(UK AISI/CAISI 등) 우선** 채택.
- CyberStrikeAI, PentAGI 등 **AI 레드팀 도구의 악용 사례**를 위협 인텔리전스 피드에 통합.


## 9. 규제, 정책 동향

제공 자료 기준, 미국은 중국 AI 연구소에 대한 제재 및 미국 내 채택 억제를 위한 조달 규칙을 검토 중인 것으로 보고된다. 정책 관점 쟁점은 다음과 같다.

- **배포 비가역성:** 오픈웨이트는 사후 회수가 불가능하므로 "배포 전" 평가·게이팅의 중요성이 커진다.
- **abliteration의 규율 공백:** 거부 제거 가공물의 유통을 어떻게 규율할지에 대한 법적 프레임이 미성숙하다.
- **평가 표준화:** 벤더 자체 평가와 제3자 평가 간 괴리를 줄이기 위한 표준 벤치마크·공개 요건 논의가 진행 중이다.
- **AI 레드팀 도구 규제:** CyberStrikeAI와 같은 오픈소스 공세 도구의 유통·사용을 어떻게 규율할지에 대한 논의가 필요하다.

미토스에 근접한 중국산 LLM이 글로벌 보안 업체들의 희망이 되고 있는 이 시대에 인공지능의 위협을 실제로 이해하고 처벌보다 전략적인 보안 자원 육성이 더 중요해지고 있다.

## 10. 종합 리스크 프로파일 및 결론

| 차원 | GLM-5.3 Abliterated | Kimi K3 |
| --- | --- | --- |
| 역량 수준 | 집중형 익스플로잇 상(上) | 다단계 에이전트 중(中) |
| 접근 장벽 | 낮음(가중치 공개 + 저비용 abliteration) | 낮음(안전장치 부재) |
| 최소 하드웨어 | 4x DGX Spark GB10 | 8x B300 / 8x MI355X |
| 탐지 난이도 | 높음(로컬 추론 가능) | 높음(로컬 추론 가능) |
| 재배포 위험 | 매우 높음 | 매우 높음 |
| 오케스트레이션 통합 | vLLM, Loom, CAI | vLLM, SGLang, TensorRT-LLM |

**결론.** GLM-5.3 공세형 변형과 Kimi K3는 "최상위 공격 역량"은 아직 미국 프론티어에 미치지 못하지만, **충분히 위험한 역량과 사실상 무제한의 접근성이 결합**되어 위협 지형을 구조적으로 바꾸고 있다. PentAGI, CyberStrikeAI, CAI, SHARKAPT 등 오픈소스 AI 레드팀 도구의 확산은 공격 진입 장벽을 더욱 낮추고 있다. 방어 측의 핵심 대응은 특정 모델 차단이 아니라, (1) 노출면·패치 적기성 중심의 근본 하드닝, (2) AI 보조 공격의 "속도·규모·자율성" 특성에 맞춘 행위 기반 탐지, (3) 격리 환경의 자율 탈출을 전제한 설계, (4) 지속적 CTI 추적으로의 전환이다. 모델의 발전 속도를 고려할 때, 격차가 좁혀지는 것을 전제로 한 선제적 방어 태세 수립이 요구된다.


## 11. 사용 시 주의 및 법적, 윤리적 고지

**경고: 본 문서는 방어·위협 인텔리전스·정책 검토를 위한 분석 자료다.**

- 본 문서는 공세형 모델의 배포, 구성, 공격 실행 절차를 제공하지 않으며, 그러한 목적의 참고 자료로 사용되어서는 안 된다. 문서에 포함된 설치, 설정 방법 및 툴 사용 예시는 **격리된 연구 환경에서 방어 역량 강화 목적으로만** 사용되어야 한다.

- 타인의 시스템에 대한 무단 접근, 테스트, 익스플로잇 실행은 **대부분의 관할권에서 형사처벌 대상**이다. 침투 테스트, 레드팀 활동은 반드시 **서면 범위 승인(scope authorization)** 과 법적 근거 하에서만 수행되어야 한다.

- 안전장치가 제거된 모델의 생성·유통·사용은 모델 라이선스, 수출통제, 현지 법령에 저촉될 수 있다. 조직은 사전 **법무·컴플라이언스 검토**를 거쳐야 한다.

- CyberStrikeAI, PentAGI 등 오픈소스 레드팀 도구는 **실제 공격 캠페인에 악용된 사례**가 보고되어 있다. 이들 도구의 사용은 반드시 승인된 범위 내에서만 이루어져야 하며, 악용 시 법적 책임이 따른다.

- 본 문서의 정량 수치는 급변하며 평가 방법론에 의존한다. **의사결정 전 독립 검증**을 권고한다.

- 자체 평가(self-reported) 벤치마크는 낙관 편향 가능성을 전제로, **제3자 독립 평가를 우선 신뢰**한다.

- GPU 요구사항 및 소프트웨어 설정은 양자화 버전, 드라이버 버전, 프레임워크 업데이트에 따라 변경될 수 있다. 실제 배포 전 **최신 공식 문서를 확인**해야 한다.

- 본 문서에 언급된 모든 모델, 툴, 프레임워크의 사용은 해당 라이선스 조건을 준수해야 한다.


*본 문서 끝.*
