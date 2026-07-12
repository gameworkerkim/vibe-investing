# 텐센트 Hunyuan Hy3 소개 - Hy3 Getting Started 가이드

> 작성일: 2026-07-12 | 대상 모델: Tencent Hy3 (정식 출시 2026-07-06)
> 본 문서의 모든 수치는 텐센트 공식 발표 및 서드파티 벤치마크 자료에 근거하며, 출처는 문서 말미 References에 명시함.

---

## 1. 개요

Hy3는 텐센트 Hy 팀(구 Hunyuan)이 2026년 7월 6일 정식 출시한 MoE(Mixture-of-Experts) 기반 LLM이다. 4월 23일 공개된 Hy3 preview를 50개 이상 제품 팀의 피드백과 강화학습(RL) 스케일업으로 개선한 정식 버전으로, 야오슌위(姚顺雨, Yao Shunyu) Chief AI Scientist 합류 201일 만에 나온 첫 완성형 결과물이다. 1월 말 인프라 재구축부터 정식 출시까지 약 6개월 만에 end-to-end 모델 개발 루프를 완주했다. 무한 자금과 인력을 갈아 넣어 996을 기본으로 일했다고 한다. 9시 출근, 저녁 9시 퇴근, 주 6일 출근을 996이라고 중국에서 부른다.

핵심 포지셔닝은 명확하다. 최대 파라미터 경쟁이 아니라 "**실무 생산성 시나리오에서 신뢰할 수 있는 저비용 에이전트 모델**"이다. 텐센트 표현으로는 자기 크기 대비 2 ~ 5배 파라미터의 플래그십 오픈소스 모델에 필적하는 성능을 낸다.

## 2. 모델 스펙

| 항목 | 값 |
|---|---|
| 아키텍처 | MoE (hybrid fast/slow thinking) |
| 총 파라미터 | 295B |
| 활성 파라미터 | 21B (192 experts 중 top-8 활성화) |
| MTP 레이어 | 3.8B (1 layer) |
| 레이어 수 | 80 (MTP 제외) |
| Attention | GQA, 64 heads / 8 KV heads / head dim 128 |
| Context Length | 256K |
| Vocabulary | 120,832 |
| 정밀도 | BF16 (FP8 양자화 버전 별도 제공) |
| 라이선스 | **Apache 2.0** (preview는 Tencent Hy Community License였음) |
| 가중치 배포 | Hugging Face, ModelScope, GitCode, CNB |

## 3. 가격 비교: Hy3 vs DeepSeek vs Claude vs ChatGPT

### 3.1 Hy3 공식 가격 (Tencent Cloud TokenHub 기준)

| 구분 | 가격 (RMB/1M tokens) | USD 환산 | KRW 환산(약) |
|---|---|---|---|
| Input | 1위안 | $0.15 | ~195원 |
| Output | 4위안 | $0.59 | ~780원 |
| Cached input | 0.25위안 | $0.037 | ~49원 |

동급 성능 모델 대비 압도적으로 낮은 가격대이며, preview 출시 이후 일일 토큰 소비량이 20배 증가했다.

### 3.2 주요 모델 가격 비교표 (2026년 7월, 공식가 기준, USD/1M tokens)

| 모델 | Input | Output | 캐시 히트 Input | Hy3 대비 Output 배율 | Context |
|---|---|---|---|---|---|
| **Tencent Hy3** | $0.15 | $0.59 | $0.037 | 1.0x | 256K |
| DeepSeek V4 Flash | $0.14 | $0.28 | $0.0028 | 0.47x | 1M |
| DeepSeek V4 Pro | $0.435 | $0.87 | $0.003625 | 1.5x | 1M |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | 8.5x | 200K |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | 25x | 1M |
| Claude Opus 4.8 | $5.00 | $25.00 | $0.50 | 42x | 1M |
| GPT-5.4 (OpenAI) | $2.50 | $15.00 | ~0.1x input | 25x | 1M |
| GPT-5.5 (OpenAI) | $5.00 | $30.00 | ~0.1x input | 51x | — |

### 3.3 가격 비교 해석

**vs DeepSeek — 조건부.** 성능 체급이 맞는 V4 Pro와 비교하면 Hy3가 명확히 싸다(Input 1/3, Output 2/3 수준). 단 V4 Pro의 현재 가격은 75% 할인 적용가로, 원래 정가는 $1.74/$3.48였다. 반면 최저가 라인인 V4 Flash와 비교하면 DeepSeek이 더 싸다 — Input은 거의 동급이지만 Output이 절반 이하이고, 캐시 히트 단가는 10배 이상 저렴하다($0.0028 vs $0.037). DeepSeek은 캐시 히트 시 input 98% 할인이 별도 설정 없이 자동 적용되므로, 동일 시스템 프롬프트를 반복 전송하는 에이전트 루프·RAG처럼 캐시 히트율이 높은 워크로드에서는 실효 비용 격차가 표면 단가보다 크게 벌어진다.

**vs Claude / ChatGPT — 압도적 우위.** Output 기준 Hy3는 Claude Sonnet 4.6의 1/25, Opus 4.8의 1/42, GPT-5.5의 1/51 수준이다. 두 진영 모두 프롬프트 캐싱(~90% 할인)과 배치 API(50% 할인, Claude 기준)로 실효 비용을 낮출 수 있으나, 할인을 최대로 중첩해도 Hy3의 표면 단가에 도달하지 못한다. 다만 이 격차는 성능 격차와 맞바꾼 것으로, 최고난도 추론·멀티툴 오케스트레이션이 필요한 태스크에서는 프론티어 모델의 태스크당 성공률이 토큰당 단가 차이를 상쇄할 수 있다.

**청구서 함정 3가지.** 
(1) DeepSeek V4는 thinking 모드가 기본값 — 보이지 않는 내부 추론 토큰이 output 요금으로 청구된다. Hy3는 `no_think`가 기본이라 순간적으로 증가하는 폭탄 과금 리스크가 없다. 

(2) OpenAI GPT-5.5의 output 가격은 출처 간 $25 ~ 30 편차가 있으므로 프로덕션 예산은 공식 페이지에서 재확인할 것. 
(3) 에이전트 워크로드는 매 스텝마다 누적 컨텍스트를 재전송하므로 채팅 대비 토큰 소비가 10 ~ 100배 — 단가 차이가 그대로 증폭된다.

## 4. 장점

**(1) 비용 효율.** 활성 파라미터 21B로 추론 비용을 억제하면서 2~5배 규모 플래그십과 경쟁하는 성능. OpenRouter 기준 텐센트의 토큰 호출 점유율이 6월 8.7%까지 상승한 것이 시장 반응의 방증.

**(2) 에이전트/툴콜 안정성.** 공식 출시 버전의 핵심 개선 포인트. 툴콜 성공률과 오류 복구 개선, 무한 루프 유발 invalid call 감소. SWE-Bench Verified에서 CodeBuddy, Cline, KiloCode 등 서로 다른 에이전트 스캐폴딩 간 정확도 편차 4% 이내 — 프로덕션 에이전트 빌더에게 벤치마크 점수보다 중요한 특성.

**(3) 환각 억제.** "근거가 있으면 답하고, 근거가 없으면 없다고 말하고, 출처를 혼동하거나 데이터를 지어내지 않는다"는 원칙으로 학습. 내부 실사용 시나리오 평가에서 환각률 12.5% → 5.4%, 상식 오류율 25.4% → 12.7%.

**(4) 멀티턴/장문 컨텍스트 유지.** 멀티턴 이슈율 17.4% → 7.9%, MRCR(장대화 벤치마크) 42.9% → 75.1%. 지시어 해소(coreference), 생략 복원, 다중 턴 제약 상속 등 실무 페인포인트 중심 개선.

**(5) 실무 검증.** WorkBuddy 내부 평가에서 태스크 해결률 72% → 90%, 평균 완료 시간 34% 단축. 3개 지역·6개 매장광구·5,220개 연결 셀의 석유회사 연결 현금흐름 모델을 하드코딩 없이 라이브 수식으로 구축한 사례 등 오피스/재무 모델링 실전 사례가 공개됨.

**(6) 완전 오픈소스.** Apache 2.0 상용 친화 라이선스, FP8 양자화 버전과 파인튜닝 파이프라인(full/LoRA, DeepSpeed ZeRO, LLaMA-Factory 연동), 압축 툴킷 AngelSlim까지 제공.

## 5. 단점 및 한계

**(1) 최상위 추론력의 벽.** 하드코어 코딩, 복잡한 추론, 멀티툴 조율 등 핵심 역량에서 Claude, GPT-5.5 등 1군 프론티어 모델에 여전히 뒤진다는 평가. GPQA Diamond에서 Hy3와 DeepSeek V4 Pro 모두 ~90%로 GPT-5.4(93.0%), Gemini 3.1 Pro(94.3%)에 못 미침.

**(2) 컨텍스트 길이.** 256K는 실용적이지만 DeepSeek V4 Pro의 1M 대비 1/4. 초대형 코드베이스·문서 일괄 분석에는 불리.

**(3) 메모리 요구량.** MoE 특성상 요청당 연산은 21B지만 295B 전체가 메모리에 상주해야 함. 셀프호스팅 권장 사양은 H20-3e급 8 GPU.

**(4) 내부 검증 수치 의존.** 환각률, WorkBuddy 해결률 등 인상적인 수치 다수가 텐센트 내부 평가 기반. 표준화된 공개 벤치마크가 아니므로 독립 재현이 어려움.

**(5) 텐센트 내부 지위의 한계.** WeChat 생태계는 자체 모델 WeLM을 주력으로 유지 중 — Hy가 텐센트의 통합 AI 파운데이션이 되지 못했다는 점은 장기 전략상 리스크로 지적됨.

## 6. 경쟁 모델 비교

| 축 | Hy3 (Tencent) | DeepSeek V4 계열 | Qwen 3.7 (Alibaba) | Claude / GPT-5.5 |
|---|---|---|---|---|
| 구조 | 295B MoE / A21B | V4 Pro: 1.6T MoE / A~48B급 | 3.7 Max: 비공개(proprietary) | 비공개 |
| Context | 256K | V4 Pro: 1M | — | 모델별 상이 |
| 라이선스 | Apache 2.0 | MIT (자체 호스팅 가능) | Max는 API 전용 | 클로즈드 |
| 강점 | 에이전트 안정성, 환각 억제, 비용 | 알고리즘/경쟁 코딩(LiveCodeBench 93.5%), 초장문 | 장시간 자율 에이전트(35시간 런), SWE-bench Pro 60.6% | 최고난도 추론, 멀티툴 조율, 창의적 작업 |
| 가격대 | 최저가 티어 | V4 Pro도 저가($0.87/1M output) | Max $7.50/1M output | 최고가 티어 |

**vs DeepSeek V4.** 서드파티 비교(CodingFleet)에서 Hy3가 18개 공유 벤치마크 중 12개에서 V4 Pro를 앞섬. 특히 오염 없는(contamination-free) 신규 벤치마크 DeepSWE에서 28.0% vs 8.0%로 20포인트 격차 — 툴 사용 일반화 능력의 차이로 해석됨. HLE도 툴 없이 근소 열세(37.0% vs 37.7%)지만 툴 사용 시 5포인트 우위(53.2% vs 48.2%). 반면 V4 Pro는 1M 컨텍스트, MIT 라이선스, 반복 컨텍스트에서 디스크 캐싱 비용 우위. SWE-bench Verified는 Hy3 74.4% vs V4 약 72%로 근소 우위.

**vs Qwen (알리바바).** Qwen 3.7 Max는 SWE-bench Pro 60.6%(독점 모델 최고치), 35시간 자율 에이전트 런 등 "Agent Frontier"를 표방하는 프리미엄 노선. 단 API 전용(알리바바 클라우드 종속)이고 output 기준 Hy3 대비 10배 이상 비쌈. 오픈웨이트 + 저비용 + 자체 호스팅이 필요하면 Hy3, 최장시간 자율 에이전트 성능이 필요하면 Qwen Max.

**vs Claude / ChatGPT(GPT-5.5).** 프론티어급 난이도의 추론, 복잡한 멀티스텝 문제 해결, 멀티툴 오케스트레이션에서는 여전히 이들이 우위. Hy3의 전략은 정면 승부가 아니라 "기업 실무의 대부분을 극단적으로 낮은 비용으로 처리"하는 것. 텐센트 자체 블라인드 평가(전문가 270명, 유효 비교 312건)에서 Hy3 2.67/4 vs GLM-5.1 2.51/4 — 프론트엔드 개발, CI/CD, 데이터·스토리지 태스크에서 격차가 가장 컸음.

## 7. Getting Started

### 7.1 접근 경로 선택

| 경로 | 대상 | 비고 |
|---|---|---|
| Tencent Cloud TokenHub API | 즉시 사용, 인프라 불필요 | 위 가격표 적용 |
| OpenRouter 등 글로벌 플랫폼 | 해외 개발자 | 순차 연동 중 (preview는 이미 등재) |
| 자체 호스팅 (vLLM/SGLang) | 데이터 주권·커스터마이징 필요 시 | 8x H20-3e급 GPU 권장 |
| Yuanbao / WorkBuddy | 최종 사용자 체험 | Yuanbao 에이전트 기능 무료 |

### 7.2 Tencent Cloud API 직접 호출 (호스팅형)

텐센트 공식 문서 센터(aistudio.tencent.com/hunyuan/doc-center) 및 Tencent Cloud 문서 기준. Hunyuan API는 OpenAI 인터페이스 규격과 호환되므로, OpenAI 공식 SDK에서 `base_url`과 `api_key`만 교체하면 애플리케이션 수정 없이 전환할 수 있다.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.hunyuan.cloud.tencent.com/v1",
    # API Key는 콘솔에서 발급: console.cloud.tencent.com/hunyuan/api-key
    api_key="YOUR_HUNYUAN_API_KEY",
)

response = client.chat.completions.create(
    model="hy3",
    messages=[{"role": "user", "content": "안녕하세요."}],
)
print(response.choices[0].message.content)
```

공식 문서에서 확인해야 할 운영상 유의점:

| 항목 | 내용 |
|---|---|
| 엔드포인트 | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| 동시성 제한 | 기본 5 concurrent (주계정·서브계정 공유, 상향은 별도 신청) |
| `stop` 파라미터 | OpenAI는 매칭 문자열 **직전**에서 중단, Hunyuan은 매칭 문자열 **직후**에서 중단 — 이 차이에 의존하는 파싱 로직은 주의 |
| 스트리밍 usage | `stream_options.include_usage=true` 설정 시 마지막 청크에 usage 반환 |
| Embedding | `hunyuan-embedding` 고정, dimensions 1024 고정, `input`/`model` 파라미터만 지원 |
| Function calling | OpenAI 규격의 2-pass 흐름 지원 (모델이 함수·인자 선택 → 클라이언트가 실행 → 결과를 컨텍스트에 부착해 재요청) |
| 플랫폼 이관 | Hunyuan 기능은 **TokenHub로 이관 중** — Hy3 등 신규 모델은 TokenHub(`tencent-tokenhub`)/TokenPlan(`tencent-tokenplan`) 엔드포인트 우선 제공. API Key 권한 범위를 제한할 경우 허용 모델에 `hy3` 포함 필요 |

텐센트가 호환성 유지를 공언하고 있으나 세부 동작 차이가 존재하므로, OpenAI에서 마이그레이션할 때는 위 표의 항목을 회귀 테스트 대상에 포함하는 것을 권장한다.

### 7.3 모델 다운로드 (자체 호스팅용)

```bash
# Hugging Face
huggingface-cli download tencent/Hy3          # BF16
huggingface-cli download tencent/Hy3-FP8      # FP8 양자화 버전 (메모리 절감)
```

가중치 미러: Hugging Face, ModelScope, GitCode, CNB.

### 7.4 vLLM으로 서빙

```bash
# 소스 빌드
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv pip install --editable . --torch-backend=auto

# MTP(Multi-Token Prediction) 활성화 서버 기동
export VLLM_FLASHINFER_ALLREDUCE_BACKEND=trtllm
vllm serve tencent/Hy3 \
  --tensor-parallel-size 8 \
  --speculative-config.method mtp \
  --speculative-config.num_speculative_tokens 2 \
  --tool-call-parser hy_v3 \
  --reasoning-parser hy_v3 \
  --enable-auto-tool-choice \
  --port 8000 \
  --served-model-name hy3
```

### 7.5 SGLang으로 서빙

```bash
git clone https://github.com/sgl-project/sglang
cd sglang
pip3 install pip --upgrade
pip3 install "transformers>=5.6.0"
pip3 install -e "python"

python3 -m sglang.launch_server \
  --model tencent/Hy3 \
  --tp-size 8 \
  --tool-call-parser hunyuan \
  --reasoning-parser hunyuan \
  --speculative-num-steps 2 \
  --speculative-eagle-topk 1 \
  --speculative-num-draft-tokens 3 \
  --speculative-algorithm EAGLE \
  --port 8000 \
  --served-model-name hy3
```

### 7.6 OpenAI 호환 API 호출 (자체 호스팅 서버 기준)

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="hy3",
    messages=[
        {"role": "user", "content": "안녕하세요. 자기소개를 간단히 해주세요."},
    ],
    temperature=0.9,   # 공식 권장값
    top_p=1.0,         # 공식 권장값
    # reasoning_effort:
    #   "no_think" (기본, 즉답) | "low" | "high" (심층 chain-of-thought)
    extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}},
)
print(response.choices[0].message.content)
```

운용 팁: 수학·코딩·복잡 추론에는 `reasoning_effort="high"`, 단순 응답·대량 처리에는 `"no_think"`. 이 파라미터 하나로 fast/slow thinking을 전환하는 것이 Hy3 하이브리드 설계의 핵심 인터페이스다.

### 7.7 파인튜닝 및 양자화

Full fine-tuning과 LoRA를 모두 지원하며 DeepSpeed ZeRO 설정과 LLaMA-Factory 연동이 포함된 공식 파이프라인이 제공된다(레포 `finetune/` 디렉터리). 압축은 AngelSlim 툴킷으로 양자화·저비트·speculative sampling을 지원한다.

### 7.8 AI 코딩 도구 연동 (Using Hy3 in Programming/OpenClaw Tools)

텐센트 공식 문서 센터는 Hy3를 주요 AI 코딩 도구에 연결하는 가이드를 별도 섹션으로 제공한다. TokenHub 공식 문서(接入 AI 工具) 기준으로 전체 내용을 정리한다.

#### 7.8.1 공통 사전 준비

1. TokenHub 콘솔의 API Key 관리 페이지(console.cloud.tencent.com/tokenhub/apikey)에서 API Key 생성.
2. **주의**: 접근 범위(可访问范围)를 "제한 범위"로 설정할 경우, 허용 모델 목록에 반드시 **Hy3**(및 preview 사용 시 **Hy3 preview**)를 체크해야 한다. 이 항목을 놓치면 인증은 통과하되 모델 호출이 실패한다.
3. 생성 직후 API Key를 복사·보관. 이후 재확인이 불가능하다.

#### 7.8.2 Claude Code (Anthropic 프로토콜)

Claude Code는 Anthropic Messages 프로토콜을 사용하므로 TokenHub의 Anthropic 호환 엔드포인트를 사용한다. **Base URL은 루트 경로**(`/v1` 없음)라는 점이 OpenAI 호환 도구와 다르다.

`~/.claude/settings.json` (Windows: `사용자디렉터리/.claude/settings.json`)에 다음을 설정:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://tokenhub.tencentmaas.com",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "hy3",
    "CLAUDE_CODE_SUBAGENT_MODEL": "hy3",
    "ENABLE_TOOL_SEARCH": false
  }
}
```

환경 변수별 의미(공식 문서 기준):

| 환경 변수 | 필수 | 설명 |
|---|---|---|
| `ANTHROPIC_BASE_URL` | 예 | TokenHub 접속 시 `https://tokenhub.tencentmaas.com` 고정 |
| `ANTHROPIC_AUTH_TOKEN` | 예 | TokenHub 콘솔에서 발급한 API Key |
| `ANTHROPIC_MODEL` | 예 | 기본 호출 모델명 (`hy3` 또는 `hy3-preview`) |
| `ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL` | 아니오 | Claude Code의 3개 모델 티어를 모두 동일 모델로 매핑 — 백그라운드 경량 호출이 존재하지 않는 기본 모델로 라우팅되어 조용히 실패하는 문제 방지 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 아니오 | 서브에이전트 모델. 주 모델과 통일 권장 (크로스 모델 호환성 이슈 방지) |
| `ENABLE_TOOL_SEARCH` | 아니오 | `false` 필수 — 아래 제약 참고 |

설정 후 새 터미널에서 `claude` 실행 → `/status` 입력 → API Endpoint가 `https://tokenhub.tencentmaas.com`, Model이 `hy3`로 표시되면 적용 완료.

운영상 제약 두 가지(공식 문서 명시):

**심층 추론 활성화**: 위 설정 기준 Hy3의 기본 사고 모드는 `no_think`다. 심층 추론(high)이 필요하면 Claude Code 내에서 `/config` 실행 → Thinking mode를 `true`로 변경 → 재시작.

**웹 검색 제한**: Claude Code는 서드파티 모델의 내장 네이티브 web search 사용을 차단한다. Hy3 설정 후 검색이 트리거되면 실패한다. 대안은 검색 MCP 연결:

```bash
# 텐센트 클라우드 MCP 마켓의 웹 검색 MCP 추가 (별도 클라우드 API 키 필요)
claude mcp add --transport sse WebSearchMCP "https://mcp-api.tencent-cloud.com/sse/XXX"

# 네이티브 검색 도구를 명시적으로 비활성화하고 기동 (MCP 안정 호출 보장)
claude --disallowedTools "WebSearch"
```

MCP 추가 후 Claude Code 재시작 필수. 검색 MCP용 클라우드 API 키는 모델 API Key와 별개의 독립 키다.

#### 7.8.3 OpenAI 호환 도구 (Cline, Cursor, Roo Code, Kilo Code, OpenCode, Cherry Studio, Codex)

이 그룹은 모두 동일한 3개 값으로 연동된다. **Base URL에 `/v1`이 포함**된다는 점이 Claude Code와 다르다.

| 설정 항목 | 값 |
|---|---|
| API Provider | `OpenAI Compatible` |
| Base URL | `https://tokenhub.tencentmaas.com/v1` |
| API Key | TokenHub에서 발급한 API Key |
| Model ID | `hy3` |

도구별 진입 경로 (공식 문서 기준):

| 도구 | 형태 | 설정 위치 |
|---|---|---|
| Cline | VSCode 확장 | 첫 실행 시 "Bring my own API key" → Continue, 또는 우상단 설정 버튼 |
| Cursor | IDE | Settings → Models → OpenAI 호환 커스텀 엔드포인트 |
| Roo Code | VSCode 확장 | Provider 설정에서 OpenAI Compatible 선택 |
| Kilo Code | VSCode 확장 | Provider 설정 (출시 시점에 Hy3 무료 액세스 프로모션 제공) |
| OpenCode | CLI | provider 설정 파일에 OpenAI 호환 엔드포인트 등록 |
| Cherry Studio | 데스크톱 앱 | 모델 제공자 추가 → OpenAI 호환 |
| Codex | CLI | config에 OpenAI 호환 프로바이더 등록 |

#### 7.8.4 OpenClaw / Hermes Agent (전용 통합)

**OpenClaw**: 공식 프로바이더 플러그인이 제공된다. TokenHub(`tencent-tokenhub`)와 TokenPlan(`tencent-tokenplan`) 두 엔드포인트를 지원하며, 내장 카탈로그가 `https://tokenhub.tencentmaas.com/v1`을 사용한다. 모델 ID는 `hy3` — 텐센트의 `HY-3D-*` 계열(3D 생성 API)과 혼동하지 말 것.

```bash
# TokenHub 연결
openclaw onboard --non-interactive \
  --auth-choice tokenhub-api-key \
  --tokenhub-api-key "$TOKENHUB_API_KEY"
```

Gateway를 launchd/systemd/Docker 등 관리형 서비스로 운영하는 경우, 인터랙티브 셸에서 export한 키는 관리형 프로세스에 보이지 않으므로 `~/.openclaw/.env`에 `TOKENHUB_API_KEY`를 영속 설정해야 한다.

**Hermes Agent**: Nous Portal(portal.nousresearch.com) 구독 게이트웨이를 통해 접근한다. `hermes setup --portal`로 OAuth 연결 후 포털 카탈로그에서 Hy3 모델을 선택하는 방식이며, 출시 프로모션 기간에는 무료 티어가 제공되었다.

#### 7.8.5 공식 연동 문서 전체 목록

| 도구 | 공식 문서 URL |
|---|---|
| 문서 센터 (영문) | https://aistudio.tencent.com/hunyuan/doc-center |
| 接入 AI 工具 (연동 문서 목차) | https://cloud.tencent.com.cn/document/product/1823/130931 |
| CodeBuddy Code | https://cloud.tencent.com.cn/document/product/1823/131901 |
| WorkBuddy | https://cloud.tencent.com.cn/document/product/1823/131902 |
| Claude Code | https://cloud.tencent.com.cn/document/product/1823/131903 |
| OpenClaw | https://cloud.tencent.com.cn/document/product/1823/130935 |
| Hermes Agent | https://cloud.tencent.com.cn/document/product/1823/131927 |
| OpenCode | https://cloud.tencent.com.cn/document/product/1823/130936 |
| Cline | https://cloud.tencent.com.cn/document/product/1823/130932 |
| Cursor | https://cloud.tencent.com.cn/document/product/1823/130933 |
| Kilo Code | https://cloud.tencent.com.cn/document/product/1823/131904 |
| Roo Code | https://cloud.tencent.com.cn/document/product/1823/131905 |
| Codex | https://cloud.tencent.com.cn/document/product/1823/133532 |

## 8. 추천 사용 시나리오

**Hy3 권장:** 기업용 AI 에이전트(툴콜 안정성이 핵심 요건), 대량 트래픽 저비용 처리(고객 응대, 문서·데이터 처리 자동화), 오피스 생산성(재무 모델링, 보고서·프레젠테이션 생성), 자체 호스팅이 필요한 규제 환경(Apache 2.0).

**타 모델 권장:** 100만 토큰급 초장문 일괄 분석 → DeepSeek V4 Pro. 수십 시간 단위 자율 에이전트 런 → Qwen 3.7 Max. 최고난도 추론·수학 증명·창의적 장문 작업 → Claude, GPT-5.5.

한 줄 요약: **Hy3는 "일상적 기업 업무의 대부분을 프론티어의 극히 일부 비용으로 안정적으로 처리하는" 실용주의 모델이다.** 벤치마크 1등이 아니라 프로덕션 신뢰성으로 승부하는 야오슌위식 "AI 후반전" 철학의 첫 실물이다.

---

## References

1. Tencent 공식 보도자료 — "Tencent Hunyuan Officially Releases Hy3" (2026-07-06): https://www.tencent.com/en-us/articles/2202386.html
2. Tencent Hy 기술 블로그 — "Introducing Hy3": https://hy.tencent.com/research/hy3
3. GitHub 공식 레포 (스펙·Quickstart·배포 가이드): https://github.com/Tencent-Hunyuan/Hy3
4. Hugging Face 모델 카드: https://huggingface.co/tencent/Hy3 / FP8: https://huggingface.co/tencent/Hy3-FP8
5. TechNode — 출시 및 가격 보도 (2026-07-07): https://technode.com/2026/07/07/tencent-launches-hunyuan-hy3-integrates-model-across-multiple-products/
6. Caixin Global — 출시 보도, Yao Shunyu·OpenRouter 점유율 (2026-07-06): https://www.caixinglobal.com/2026-07-06/tencent-launches-upgraded-hunyuan-3-ai-model-with-free-agent-feature-102461489.html
7. Pandaily — WorkBuddy 90% 태스크 해결률·실전 사례: https://pandaily.com/tencent-hunyuan-hy3-launch-agent-90-percent-task-resolution-jul2026-v2
8. CodingFleet — "Hy3 vs DeepSeek V4 Pro" 벤치마크 비교: https://codingfleet.com/blog/hy3-vs-deepseek-v4-pro/
9. CodingFleet — "DeepSeek V4 Pro vs Qwen 3.7 Max": https://codingfleet.com/blog/deepseek-v4-pro-vs-qwen-3-7-max/
10. AIMadeTools — "Tencent Hy3 vs DeepSeek V4" (SWE-bench 비교): https://www.aimadetools.com/blog/tencent-hy3-vs-deepseek-v4/
11. BigGo Finance — Hy3 비판적 분석 (WeLM·1군 대비 한계): https://finance.biggo.com/news/eac480c0-1840-4271-858a-eb43389b8811
12. The Standard — 오픈소스 라이선스·가격 보도: https://www.thestandard.com.hk/innovation/article/336512/Tencents-Hunyuan-releases-Hy3-available-on-WorkBuddy-and-more
13. OpenRouter 모델 비교 페이지: https://openrouter.ai/compare/deepseek/deepseek-v4-pro/tencent/hy3-preview
14. Artificial Analysis — Hy3 지능·가격·속도 비교: https://artificialanalysis.ai/models/comparisons/deepseek-v4-flash-vs-hy3
15. Tencent Hunyuan 공식 문서 센터: https://aistudio.tencent.com/hunyuan/doc-center
16. Tencent Cloud — Hunyuan OpenAI 호환 인터페이스 공식 문서 (엔드포인트·stop 동작·동시성·embedding·function call): https://cloud.tencent.com/document/product/1729/111007
17. OpenClaw — Tencent Cloud TokenHub/TokenPlan 프로바이더 연동 가이드 (hy3 모델 접근): https://docs.openclaw.ai/providers/tencent
18. Tencent Cloud TokenHub — Claude Code 연동 공식 문서 (settings.json 전체 설정·심층 추론·웹 검색 MCP): https://cloud.tencent.com.cn/document/product/1823/131903
19. Tencent Cloud TokenHub — 接入 AI 工具 문서 목차 (CodeBuddy/WorkBuddy/Claude Code/OpenClaw/Hermes/OpenCode/Cline/Cursor/Kilo/Roo/Codex): https://cloud.tencent.com.cn/document/product/1823/130931
20. Tencent Cloud TokenHub — Cline 연동 공식 문서 (OpenAI Compatible 설정 패턴): https://cloud.tencent.com.cn/document/product/1823/130932
21. DeepSeek 공식 Models & Pricing (V4 Flash/Pro 가격): https://api-docs.deepseek.com/quick_start/pricing/
22. Anthropic 공식 Pricing 문서 (Claude 모델별 가격·캐싱·배치 할인): https://platform.claude.com/docs/en/about-claude/pricing
23. CloudZero — Claude API Pricing 2026 / Claude Opus 4.8 Pricing (GPT-5.4/5.5 가격 비교 포함): https://www.cloudzero.com/blog/claude-api-pricing/
24. Morphllm — AI Coding Costs 2026 (주요 모델 공식가 통합 비교, 2026-06-18 기준): https://www.morphllm.com/ai-coding-costs

*주: 환각률(5.4%), 상식 오류율(12.7%), WorkBuddy 태스크 해결률(90%), 블라인드 평가(2.67/4 vs GLM-5.1 2.51/4)는 텐센트 내부 평가 수치로, 독립 재현된 공개 벤치마크가 아님. KRW 환산은 2026년 7월 초 환율(1 CNY ≈ 195 KRW) 기준 근사치. 3.2절 가격표는 2026년 7월 초 각사 공식 발표가 기준이며, DeepSeek V4 Pro는 프로모션 할인가, GPT-5.5 output은 출처 간 $25~30 편차 존재. LLM API 가격은 수시로 변동하므로 프로덕션 예산 확정 전 각사 공식 가격 페이지 재확인 필수.*
