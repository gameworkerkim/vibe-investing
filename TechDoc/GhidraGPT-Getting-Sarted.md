# GhidraGPT Getting Start

**GhidraGPT**는 NSA의 오픈소스 리버싱 프레임워크인 Ghidra에 LLM을 통합하는 플러그인입니다.
기드라(Ghidra)는 미국 국가안보국(NSA)이 개발하고 오픈 소스로 공개한 강력한 소프트웨어 리버스 엔지니어링(역공학) 도구입니다. 
기드라는 미국 국가안보국에 의해 개발되어 미국의 여러 정보기관에서 사용되던 리버스 엔지지어링 도구로, 2017년 3월 7일경 벌어진 WikiLeaks의 CIA Vault 7 유출로 세상에 처음 존재가 알려지게 되었습니다
이후 2019년 3월 5일, 미국 국가안보국은 RSA Conference에서 처음으로 실행 파일을 대중에 공개하였고, 한 달 뒤인 2019년 4월에는 GitHub에 소스 코드를 공개했습니다.

GhidraGPT는 LLM의 발전에 따라 인간이 노가다로 해야할 컴파일된 기계어 코드를 분석하여 사람이 읽을 수 있는 어셈블리어로 변환(디스어셈블)하고, C언어 수준의 코드로 복원(디컴파일)해 주는 핵심 기능을 LLM이 보조할 수 있게 한 것입니다.
한마디로 Ghidra에 LLM을 붙인 확장 서비스이며 시간을 많이 잡아 먹는 디스어셈블 등의 작업은 LLM이 대신하도록 하는 것이 확장 컨셉입니다.

주요 특징과 기능은 다음과 같습니다.

* 강력한 디컴파일러: 기계어를 C언어 형태로 변환해 주어 코드의 흐름과 로직을 훨씬 쉽게 이해할 수 있습니다.
* 다양한 플랫폼 지원: Windows, macOS, Linux에서 모두 실행 가능하며, x86, ARM, MIPS 등 다양한 프로세서 아키텍처를 지원합니다.
* 협업 기능: 팀 단위로 프로젝트를 공유하고 분석할 수 있는 서버 기능을 제공합니다.
* 확장성: 파이썬(Python) 및 자바(Java) 스크립트를 지원하여 사용자가 원하는 분석 자동화 기능을 직접 구현할 수 있습니다.
* 무료 및 오픈소스: 상용 고가 리버싱 도구(예: IDA Pro)의 강력한 대안으로 보안 연구원, 악성코드 분석가, 개발자들에게 널리 사용되고 있습니다.

---

## 핵심 장점

1. **생산성 향상**
   * 함수명/변수명 자동 리네이밍, 타입 추론, 주석 추가로 디컴파일 결과를 인간이 읽기 쉽게 개선
   * 컨텍스트 메뉴에서 우클릭 한 번으로 AI 분석 실행 (너무 편함)
2. **다양한 LLM 지원**
   * OpenAI, Anthropic, Google Gemini, Cohere, Mistral, DeepSeek, Grok, Ollama 등 폭넓은 모델 지원
   * OpenAI 호환 API도 사용 가능
3. **보안 및 사용성**
   * API 키를 자동 암호화하여 안전하게 저장
   * 실시간 스트리밍 응답으로 대기 시간 최소화
   * 전용 콘솔로 결과 확인 가능

---

## 단점 및 주의점

**단점:**

* LLM 응답이 항상 정확하지 않아 잘못된 분석 결과를 초래할 수 있음 (LLM 환각과 오류가 발생함)
* 인터넷 연결과 API 비용이 필수적 (로컬 Ollama 제외, DeepSeek v4 pro, Qwen이면 충분)
* Ghidra의 복잡한 구조와 결합 시 예상치 못한 충돌 가능성

**주의점:**

* 분석 대상 바이너리가 민감한 코드라면 외부 API로 전송되는 데이터를 반드시 확인해야 함
* LLM이 생성한 코드나 타입 정보를 맹신하지 말고 반드시 검증을 해야 함.
* Ghidra 10.0+, Java 11+, Maven 환경이 필요하며, 설치 시 `File → Install Extensions` 경로를 정확히 따라야 함

---

## 경쟁 프로젝트

| 프로젝트 | 차별점 |
|---------|--------|
| **Ghidra Assist** | 로컬 모델에 더 최적화되어 있고, 오픈소스 커뮤니티 지원이 활발함 |
| **BinAI** | 상용 제품으로, 바이너리 분석에 특화된 자체 모델을 제공하여 정확도에서 강점 |
| **IAIK's Ghidra Plugin** | 학술 연구 기반으로, 특정 분석 알고리즘에 강함 |
| **IDA Pro + ChatGPT** | IDA 사용자를 위한 스크립트로, 생태계가 더 크나 Ghidra에 특화되진 않음 |

> **요약**: GhidraGPT는 다양한 LLM을 지원하는 강력한 플러그인이지만, API 의존성과 분석 결과의 신뢰성 검증이 필수적입니다. 민감한 코드 분석 시에는 로컬 모델(Ollama) 사용을 권장합니다.

---

# GhidraGPT 시작하기: Ollama, ChatGPT, Claude, Qwen 설정 가이드

이 가이드는 GhidraGPT 플러그인을 설치하고, Ollama(로컬), ChatGPT, Claude, Qwen 등 다양한 LLM을 연동하는 방법을 단계별로 안내합니다.

---

## 사전 준비 사항

GhidraGPT를 사용하기 전에 다음 환경이 갖춰져 있어야 합니다:

| 항목 | 요구사항 |
|------|----------|
| **Ghidra** | 10.0 이상 |
| **Java** | Java 11+ |
| **Maven** | 빌드 시스템 |
| **인터넷** | API 기반 모델 사용 시 필수 (Ollama 제외) |

---

## 1. GhidraGPT 플러그인 설치

### 1.1 레포지토리 클론 및 빌드

```bash
git clone https://github.com/ZeroDaysBroker/GhidraGPT.git
cd GhidraGPT
GHIDRA_INSTALL_DIR=/path/to/ghidra mvn clean package
```

빌드가 완료되면 `target/GhidraGPT-x.y.z.zip` 파일이 생성됩니다.

### 1.2 Ghidra에 플러그인 설치

1. Ghidra 실행
2. `File → Install Extensions` 이동
3. `+` 버튼 클릭 후 `target/GhidraGPT-x.y.z.zip` 선택
4. Ghidra 재시작
5. `File → Configure → Analysis → GhidraGPTPlugin`에서 플러그인 활성화

---

## 2. 각 LLM 서비스별 API 키 설정

플러그인 설치 후, Ghidra 내에서 `GhidraGPT configuration panel`로 이동하여 API 키를 입력합니다. 모든 API 키는 자동으로 암호화되어 안전하게 저장됩니다.

### OpenAI (ChatGPT)

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 발급
2. GhidraGPT 설정 패널에서 **OpenAI** 선택
3. 발급받은 API 키 입력
4. 사용할 모델 선택 (예: `gpt-4`, `gpt-3.5-turbo`)

> **참고**: GhidraGPT는 기본적으로 OpenAI의 GPT 모델을 지원합니다.

---

### Anthropic (Claude)

1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. GhidraGPT 설정 패널에서 **Anthropic** 선택
3. API 키 입력
4. 사용할 Claude 모델 선택 (예: `claude-3-opus`, `claude-3-sonnet`)

GhidraGPT는 Anthropic의 Claude 모델을 공식 지원합니다.

---

### Ollama (로컬 무료 모델)

Ollama는 로컬에서 LLM을 실행할 수 있는 도구로, **인터넷 연결 없이** GhidraGPT를 사용할 수 있게 해줍니다.

#### 2.1 Ollama 설치

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** [Ollama 공식 사이트](https://ollama.com/)에서 설치파일 다운로드

#### 2.2 LLM 모델 다운로드

원하는 모델을 다운로드합니다. 예시:

```bash
# Meta의 Llama 3.1 (8B 경량 모델)
ollama run llama3.1:8b

# Qwen (코드 분석에 강점)
ollama run qwen2.5-coder:7b

# Mistral
ollama run mistral
```

> **팁**: 하드웨어 사양에 맞는 모델을 선택하세요. `llama3.1:8b`는 8GB VRAM에서 원활히 동작합니다.

#### 2.3 Ollama 서버 확인

Ollama는 기본적으로 `localhost:11434`에서 API 서버를 실행합니다.

```bash
# 실행 중인 모델 확인
ollama list
```

#### 2.4 GhidraGPT에 Ollama 연결

1. GhidraGPT 설정 패널에서 **Ollama** 선택
2. **Server URL**: `http://localhost:11434` 입력
3. **Model**: 앞서 다운로드한 모델명 입력 (예: `llama3.1:8b`, `qwen2.5-coder:7b`)

> **참고**: Ollama는 GhidraGPT가 지원하는 "Bring your own model" 방식으로 동작합니다.

---

### Qwen (OpenAI 호환 API 또는 Ollama)

Qwen은 두 가지 방식으로 사용할 수 있습니다:

#### 방식 A: Ollama를 통한 로컬 실행 (무료)

```bash
ollama run qwen2.5-coder:7b
```

이후 Ollama 설정 방식과 동일하게 GhidraGPT에서 연결합니다.

#### 방식 B: DashScope API (클라우드)

1. [阿里云 DashScope](https://dashscope.aliyun.com/)에서 API 키 발급
2. GhidraGPT 설정 패널에서 **OpenAI Compatible** 선택
3. **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1` 입력
4. **API Key**: DashScope API 키 입력
5. **Model**: `qwen-max`, `qwen-plus` 등 입력

> GhidraGPT는 OpenAI 호환 API를 지원하므로, Qwen의 OpenAI 호환 엔드포인트를 통해 연동할 수 있습니다.

---

## 3. 주요 기능 사용법

설치와 설정이 완료되면 다음 기능을 사용할 수 있습니다:

| 기능 | 설명 | 사용 방법 |
|------|------|-----------|
| **Function Rewrite** | 함수명/변수명 리네이밍, 타입 추론, 주석 추가 | 디컴파일 창에서 함수 우클릭 → Rewrite |
| **Code Explanation** | 함수 로직 상세 설명 | 우클릭 → Explain |
| **Code Analysis** | 취약점 탐지 및 보안 분석 | 우클릭 → Analyze |
| **Console** | 모델 응답 및 결과 확인 | GhidraGPT 콘솔 창에서 확인 |

---

## 4. 서비스별 비교 및 추천

| 서비스 | 장점 | 단점 | 추천 상황 |
|--------|------|------|-----------|
| **Ollama** | 무료, 오프라인, 프라이버시 보장 | 로컬 하드웨어 성능 필요, 응답 속도 느림 | 보안이 중요한 분석, 인터넷 없을 때 |
| **ChatGPT (OpenAI)** | 뛰어난 성능, 빠른 응답 | 유료, 인터넷 필수 | 일반적인 리버싱 작업 |
| **Claude** | 긴 컨텍스트, 코드 이해도 우수 | 유료, 인터넷 필수 | 복잡한 대규모 함수 분석 |
| **Qwen (Ollama)** | 무료, 코드 특화, 한국어 지원 | 로컬 하드웨어 성능 필요 | 한국어 주석/설명이 필요할 때 |
| **Qwen (API)** | 클라우드 성능, 한국어 지원 | 유료, 인터넷 필수 | 한국어 + 클라우드 성능 필요 시 |

---

## 주의사항

1. **데이터 프라이버시**: 민감한 바이너리 분석 시에는 반드시 **Ollama** 같은 로컬 모델을 사용하세요. 클라우드 API는 분석 대상 코드가 외부로 전송됩니다.
2. **결과 검증**: LLM이 생성한 코드나 타입 정보는 **반드시 수동으로 검증**하세요. AI는 때로 잘못된 분석 결과를 생성할 수 있습니다.
3. **API 비용**: OpenAI, Anthropic, DashScope(Qwen)는 사용량에 따라 비용이 발생합니다.

---

## 참고 자료

- [GhidraGPT GitHub 레포지토리](https://github.com/ZeroDaysBroker/GhidraGPT)
- [Ollama 공식 사이트](https://ollama.com/)
- [Ollama 지원 모델 목록](https://ollama.ai/library)
- [Hugging Face GGUF 모델](https://huggingface.co/docs/hub/en/ollama) - Ollama로 실행 가능

---

이제 GhidraGPT와 함께 AI 기반 리버스 엔지니어링을 시작해보세요.
