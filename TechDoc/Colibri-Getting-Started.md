# Colibri 시작하기 (Getting Started)

**Colibri**는 **744B 매개변수 MoE(Mixture of Experts) 모델인 GLM-5.2**를 순수 C 언어로 구현된 초경량 엔진으로 구동하는 프로젝트입니다. 단 **25GB RAM**만 있는 일반 소비자용 머신에서도 실행할 수 있도록 설계되었습니다.

---

## 프로젝트 설명

Colibri는 744B 규모의 MoE 모델이 토큰당 **약 40B 매개변수만 활성화**한다는 점과, 활성화된 전문가(Expert)들만 토큰마다 달라진다는 점(약 11GB)을 활용합니다:

- **밀집 부분(Dense part)** — Attention, Shared Experts, Embeddings 등 약 17B 매개변수 → **int4로 RAM에 상주** (약 9.9GB)
- **라우팅된 전문가(Routed Experts)** — 75개 MoE 레이어 × 256 = **19,456개 전문가**, 각각 int4 기준 약 19MB → **디스크에 저장** (약 370GB)

핵심 아이디어는 **모델이 빠른 메모리에 "맞아야" 할 필요가 없다**는 것입니다. 전문가를 필요할 때 디스크에서 스트리밍하여, VRAM·RAM·Storage를 하나의 관리된 메모리 계층 구조로 취급합니다.

---

## 동작 원리

### 토큰당 처리 경로 (The Per-Token Path)

모든 레이어의 모든 토큰은 **Route → Union → Place → Overlap → Learn**의 5단계를 거칩니다:

1. **Route** — 라우터가 입력 토큰에 대해 어떤 전문가를 활성화할지 결정
2. **Union** — 배치 내 여러 토큰이 동일한 전문가를 선택하면 **중복 제거** (batch-union)
3. **Place** — 전문가를 어디서 가져올지 결정 (VRAM > RAM > 디스크). 배치 정책은 **속도에만 영향**을 미치며, 라우터 결정과 가중치 정밀도는 변하지 않음
4. **Overlap** — 비동기 I/O 풀(`PIPE=1`)이 누락된 전문가를 디스크에서 로드하는 동안 상주 전문가로 계산 수행. 라우터 미리보기 스레드(`PILOT=1`)가 다음 레이어의 전문가를 프리페치 (라우팅은 **71.6% 예측 가능**)
5. **Learn** — `.coli_usage` 파일에 라우팅 기록을 저장하고, 자주 사용되는 전문가를 자동으로 고정(Pin)

### 메모리 계층 구조

[VRAM / RAM / NVMe 3계층 전문가 배치]

동일한 엔진이 전체 스펙트럼을 커버합니다:
- **25GB 노트북**: 모든 전문가를 디스크에서 스트리밍 (느리지만 정확)
- **대형 호스트**: 전체 전문가 셋이 상주 (`CUDA_EXPERT_GB=auto PIN_GB=all`) → 디스크 병목 완전 제거
- **멀티소켓 호스트**: `COLI_NUMA=1`로 메모리 컨트롤러 인터리빙

계층 사이에는 **학습형 캐시**가 작동합니다. 사용자 워크로드가 어떤 전문가를 사용하는지 기록하고, 가장 빈번한 전문가를 자동 고정 — **사용할수록 빨라집니다**.

### 압축 KV 상태

MLA(Multi-head Latent Attention)가 KV 상태를 토큰당 576 floats로 압축 (32,768 → 576, **57배 압축**). `.coli_kv` 파일에 저장되어 재시작 시에도 KV 상태가 유지되며, 중단되지 않은 세션과 바이트 단위로 동일합니다.

### Speculative Decoding (추론 가속)

GLM-5.2의 네이티브 MTP(Multi-Token Prediction) 헤드가 메인 모델이 검증할 토큰을 초안 작성 → 한 번의 배치 forward로 검증. **2.2~2.8 tokens/forward**.

> ⚠️ **중요 규칙**: MTP 헤드는 반드시 **int8**을 사용해야 합니다. int4 버전은 수용율이 0~4%로 붕괴됩니다 ([#8](https://github.com/JustVugg/colibri/issues/8)). 초안과 검증이 동일한 함수를 계산해야 하므로 `SPEC_PIN=1`로 두 연산을 하나의 커널 계열에 고정합니다 ([#163](https://github.com/JustVugg/colibri/issues/163)).

---

## 장점

| 항목 | 설명 |
|------|------|
| **초저사양 구동** | 25GB RAM만 있는 노트북에서도 744B 모델 실행 가능 |
| **순수 C, 의존성 제로** | BLAS, Python 런타임, GPU가 필요 없음 |
| **정확성 유지** | 기본 정책은 **모델 정밀도나 라우터 의미론을 절대 변경하지 않음** |
| **학습형 캐시** | 사용자 워크로드가 자주 사용하는 전문가를 기록하고 자동으로 고정(Pin)하여 사용할수록 빨라짐 |
| **GPU 지원** | CUDA 백엔드로 VRAM에 전문가를 상주시키면 디스크 병목 제거 |
| **Metal 지원** | Apple Silicon에서 GPU 가속 가능 |
| **압축 KV 상태** | MLA Attention으로 토큰당 576 floats (57배 압축) → 재시작 시에도 KV 상태 유지 |
| **추론 가속** | Speculative Decoding (MTP 헤드)로 2.2~2.8 tokens/forward |
| **NUMA 지원** | 멀티소켓 호스트에서 메모리 컨트롤러 인터리빙 |
| **웹 대시보드** | 실시간 토큰 메트릭, 하드웨어 패널, Expert Brain/Atlas 시각화 |
| **Grammar-forced 출력** | `GRAMMAR=file.gbnf`로 구조화된 JSON 출력 시 수용율 추가 확보 |
| **오픈소스** | Apache 2.0 라이선스 (GLM-5.2 가중치는 Z.ai의 MIT 라이선스) |

---

## 단점

| 항목 | 설명 |
|------|------|
| **디스크 의존성** | 370GB의 전문가 데이터를 디스크에 보관해야 함 |
| **저사양 환경 속도 저하** | 25GB RAM 환경에서는 0.05~0.1 tok/s로 매우 느림 |
| **초기 모델 다운로드/변환** | 370GB+ 용량의 모델을 직접 변환하거나 다운로드해야 함 |
| **int4 MTP 헤드 주의** | int4 MTP 헤드는 수용율 0~4%로 붕괴되므로 int8 버전 필수 |
| **Python 의존성 (일부)** | 변환기와 API 게이트웨이에 Python 필요 |
| **Windows 빌드** | 네이티브 빌드보다는 사전 빌드된 바이너리 사용 권장 |

---

## 실제 성능

동일한 엔진, 동일한 int4 컨테이너 — 하드웨어가 전문가의 배치 위치만 결정합니다. [전체 벤치마크](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md):

| 하드웨어 | Decode 속도 | 비고 |
|----------|------------|------|
| **6× RTX 5090 (전문가 전체 VRAM 상주)** | **5.8~6.8 tok/s** | TTFT 약 13초 |
| **128GB CPU-only 데스크탑** | ~1.8 tok/s (웜) | RAM 상주 |
| **단일 RTX 5070 Ti** | 1.07 tok/s | GPU-resident 파이프라인 |
| **25GB 개발 머신** | 0.05~0.1 tok/s (콜드) | 순수 디스크 스트리밍 |

---

## 경쟁 프로젝트

README에는 직접적인 경쟁 프로젝트에 대한 언급이 없습니다. 그러나 Colibri가 해결하는 문제 영역(초대형 MoE 모델을 저사양 하드웨어에서 구동)을 고려할 때, 다음과 같은 유사 접근 방식의 프로젝트들이 있습니다:

| 프로젝트 | 설명 |
|----------|------|
| **llama.cpp** | 다양한 LLM을 CPU/GPU에서 효율적으로 실행하는 C++ 기반 추론 엔진 |
| **ExLlamaV2** | GPTQ 양자화를 활용한 GPU 중심의 고속 추론 엔진 |
| **vLLM** | PagedAttention 기법으로 GPU 메모리 효율을 극대화한 추론 서버 |
| **DeepSpeed** | Microsoft의 대규모 분산 학습/추론 프레임워크 |

Colibri의 차별점은 **순수 C, 의존성 제로, 744B MoE 모델을 25GB RAM에서 구동**한다는 극한의 경량화에 있습니다.

---

## 설치 방법

### 1. 시스템 요구사항

- **RAM**: 최소 25GB (권장)
- **디스크**: 최소 400GB 이상의 여유 공간 (모델 370GB + 기타 파일)
- **운영체제**: Linux, Windows, macOS
- **컴파일러**: GCC (Linux/macOS) 또는 MSVC (Windows)
- **Python 3**: 모델 변환 및 API 게이트웨이용 (런타임은 미필요)

### 2. 저장소 클론

```bash
git clone https://github.com/JustVugg/colibri.git
cd colibri
```

### 3. 빌드

```bash
cd c
./setup.sh   # GCC/OpenMP 확인, 빌드, 자체 테스트 실행
```

또는 루트에서 `make` 명령어로도 빌드 가능합니다.

Nix/NixOS 사용자는:
```bash
nix develop   # flake.nix 제공
```

### 4. 모델 다운로드

**사전 변환된 GLM-5.2 int4 컨테이너**를 Hugging Face에서 다운로드합니다:

> ⚠️ **반드시 int8 MTP 헤드가 포함된 버전을 사용하세요!**  
> 원본 미러는 int4 MTP 헤드를 제공하여 수용율이 0%로 붕괴됩니다.

```bash
# 올바른 버전 (int8 MTP 포함)
huggingface-cli download mateogrgic/GLM-5.2-colibri-int4-with-int8-mtp
```

또는 FP8 소스에서 직접 변환할 수도 있습니다 (Python 필요, 전체 756GB를 한 번에 디스크에 올릴 필요 없이 샤드 단위로 처리):

```bash
cd c
./coli convert --model /nvme/glm52_i4   # 샤드 단위로 다운로드+변환 (일회성)
```

**int8 MTP 헤드 확인 방법**:
```bash
ls -l /path/to/model/out-mtp-*
# int8 (올바름): 3527131672 / 5366238584 / 1065950496
```

### 5. 실행

```bash
# 환경 변수로 모델 경로 설정
export COLI_MODEL=/path/to/glm52_i4

# 대화형 채팅
./coli chat

# 배치 플랜 확인 (VRAM/RAM/디스크 배치 계획)
./coli plan

# 상태 진단 (읽기 전용)
./coli doctor

# 웹 대시보드 + API 서버 (단일 포트)
./coli web --model /path/to/glm52_i4

# OpenAI 호환 API 서버 (API 전용)
./coli serve --model /path/to/glm52_i4
```

런타임 엔진은 순수 C로 동작합니다. Python은 일회성 변환기와 선택적 API 게이트웨이에만 사용됩니다.

### 6. Windows 사용자

사전 빌드된 바이너리를 다운로드하는 것이 가장 간편합니다:

1. [Releases 페이지](https://github.com/JustVugg/colibri/releases)에서 `colibri--windows-x86_64.zip` 다운로드
2. 압축 해제 후 `colibri-*-windows-x86_64.exe` → `glm.exe`로 이름 변경
3. [Python 3](https://www.python.org/downloads/) 설치
4. `coli chat` 실행

자세한 내용은 [Windows 가이드](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) 참조.

---

## 대시보드 기능

`./coli web`으로 실행되는 웹 대시보드는 3가지 주요 화면을 제공합니다:

| 페이지 | 설명 |
|--------|------|
| **Dashboard** | 실시간 토큰 메트릭, 턴별 시간 분석, VRAM/RAM/디스크 계층 막대, 라이브 mini-brain |
| **Brain** | 19,456개 전문가를 살아있는 피질(cortex)로 시각화 — 색상은 저장 계층, 밝기는 라우팅 빈도, 호버 시 토픽 친화도 표시 |
| **Atlas** | 측정된 Expert Atlas를 3D 은하계로 표시 — 13,260개 전문가가 토픽(시, 법률, 중국어, SQL 등)별로 클러스터링 |

---

## 프로젝트 후원

Colibri는 25GB RAM의 12코어 노트북에서 시작된 1인 프로젝트입니다. 현재는 실제 하드웨어에서 측정된 커뮤니티 데이터로 발전했습니다. 기여 방법:

- ⭐ 레포지토리 스타 및 공유
- 🐛 사용자 하드웨어에서의 벤치마크 데이터 공유 (Issues)
- 💬 GitHub Issues를 통한 개발 후원 또는 하드웨어 기증 문의

---

## 추가 자료

| 주제 | 문서 |
|------|------|
| 빠른 시작 가이드 | [docs/quickstart.md](https://github.com/JustVugg/colibri/blob/main/docs/quickstart.md) |
| 벤치마크 및 품질 측정 | [docs/benchmarks.md](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md) |
| 튜닝 가이드 | [docs/tuning.md](https://github.com/JustVugg/colibri/blob/main/docs/tuning.md) |
| Windows 네이티브 빌드 (+ CUDA DLL) | [docs/windows.md](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) |
| CUDA 백엔드 | [docs/cuda.md](https://github.com/JustVugg/colibri/blob/main/docs/cuda.md) |
| Metal 백엔드 | [docs/metal.md](https://github.com/JustVugg/colibri/blob/main/docs/metal.md) |
| OpenAI 호환 API + KV 슬롯 | [docs/api.md](https://github.com/JustVugg/colibri/blob/main/docs/api.md) |
| Grammar-forced Drafts (구조화 출력) | [docs/grammar-draft.md](https://github.com/JustVugg/colibri/blob/main/docs/grammar-draft.md) |
| 환경 변수 목록 | [docs/ENVIRONMENT.md](https://github.com/JustVugg/colibri/blob/main/docs/ENVIRONMENT.md) |

---

> **팁**: Colibri는 사용할수록 빨라집니다 (`.coli_usage` 파일에 라우팅 기록을 저장하고 자주 사용하는 전문가를 자동으로 고정). 처음에는 느릴 수 있지만, 지속적으로 사용하면 성능이 향상됩니다. MTP speculative decoding이 도움이 되는지는 캐시 온도(cache temperature)에 달려 있으므로, 직접 측정하고 `DRAFT=0`으로 비활성화할지 판단하세요.

---

## 이름의 유래

벌새(Colibri/Hummingbird)는 무게가 몇 그램에 불과하지만, 하루에 수천 송이의 꽃을 방문합니다. 이 엔진은 744B 매개변수의 거대 모델을 벌새의 식량으로 유지합니다: 25GB RAM, 12개의 CPU 코어, 그리고 많은 디스크 인내심.

---

**라이선스**: 엔진 — Apache 2.0 / GLM-5.2 가중치 — Z.ai 배포, MIT
