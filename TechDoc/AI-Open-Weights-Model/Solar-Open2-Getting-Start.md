# Solar Open 2 (250B-A15B) 프로젝트 가이드 — 최종 검증판

> **문서 버전** v2.0 (2026-07-27) · **검증 기준** Upstage 공식 모델 카드 / 기술 블로그(2026-07-22) / 국내외 보도
> **주의** 벤치마크 수치는 업스테이지 자체 발표 기준이며, 제3자 독립 검증(Artificial Analysis 등)은 아직 축적되지 않았다. 도입 판단 시 내부 데이터로 재현 평가할 것을 전제로 읽어야 한다.

---

## 0. v1 대비 주요 수정 사항

| # | 항목 | v1 기술 | 정정 내용 |
|---|---|---|---|
| 1 | 토크나이저 | "한국어 전용 토크나이저" | 한국어 **최적화** 토크나이저. 모델 자체는 한·영·일 다국어. 한국어 오피스 텍스트 기준 비교 12종 중 1위, 차점 글로벌 모델 대비 약 24% 우위 |
| 2 | NoPE | "NoPE로 1M 지원" | NoPE는 **softmax attention 층에 위치 인코딩을 적용하지 않는 설계**. 1M은 Hybrid Attention(고정 크기 state) + NoPE 조합의 결과 |
| 3 | Mistral 비교 | "모든 주요 벤치마크에서 압도적 우위" | **부정확**. SWE-Bench는 70.4 vs 69.6으로 근소, Terminal Bench Hard는 Mistral(33.3)이 Solar(28.3)보다 우위 |
| 4 | 경쟁 모델 표 | MiMo-V2.5 누락 | **MiMo-V2.5(310B-A15B)** 는 활성 파라미터가 동일한 최직접 경쟁자. 반드시 포함 |
| 5 | Ko-GDPval | 86.8 (vs V4-Flash 85.0) | 맞으나 불완전. 블로그 기준 **86.75점으로 1.6T급 DeepSeek-V4-Pro(86.91)와 0.16점 차** — 이쪽이 핵심 메시지 |
| 6 | Kimi K3 | "활성 파라미터 미공개" | 보도 기준 **896 experts 중 16개 활성**, Modified MIT, 멀티모달, 가중치 공개 2026-07-27 |
| 7 | Docker 실행 | `--logits-processors` 누락 | 공식 권장 구성에 포함된 필수 플래그. 누락 시 템플릿 처리 동작이 달라짐 |
| 8 | 추론 파싱 | 미기재 | Transformers 직접 사용 시 `<|think:end|>` 토큰 기준 수동 분리 필요 |
| 9 | 학습 스펙 | 미기재 | 12T 토큰 / NVIDIA B200 / 2M GPU-hours / vocab 196,608 |
| 10 | 양자화 | "H200 2장" | 공식 블로그는 H200 2장. 단 Nota INT4-GlobalPruned 카드는 **2×H100** 서빙 기준 명시 — 구성별로 다름 |

---

## 1. 프로젝트 배경

**Solar Open 2**는 업스테이지가 2026년 7월 22일 개발자 행사 '솔라 오픈 웨이트 데이'에서 공개한 오픈 웨이트 파운데이션 모델이다. 정부의 독자 AI 파운데이션 모델(독파모) 사업 맥락에서 나온 2차 공개 모델이며, Hugging Face에 상업적 이용이 가능한 라이선스로 배포됐다.

핵심 설계 목표는 **Chat이 아니라 Agent**다. 김성훈 대표는 대화만 잘하는 모델이 아니라 지시받은 일을 끝까지 수행하는 능력에 집중했다고 설명했다. 업스테이지가 정의한 Agentic Use의 세 요건은 다음과 같다.

1. **Long-horizon task** — 수십 회의 추론·도구 호출을 거쳐 작업을 완결
2. **Long-context** — 긴 문서와 작업 이력을 유지
3. **Instruction following & tool calling** — 지시를 정확히 따르고 도구를 안정적으로 호출

여기에 네 번째 실무 요건인 **추론 비용**이 붙는다. Agent는 계획→실행→검증→수정을 반복하므로 Chat 대비 토큰 소모가 훨씬 크고, 기업이 자체 인프라에 올리려면 모델이 지나치게 크거나 느려서는 안 된다는 것이 설계 전제다.

### 1.1 아키텍처 스펙 (공식 모델 카드 기준)

| 항목 | 값 |
|---|---|
| 모델명 | Solar Open 2 (250B-A15B) |
| 아키텍처 | Hybrid-Attention Mixture-of-Experts |
| 총 파라미터 | 250B (250,287,794,944) |
| 활성 파라미터 | 15B / 토큰 |
| 레이어 | 48 |
| Hidden size | 4,096 |
| 어텐션 패턴 | `[Softmax, Linear×3] × 12` (전체 48층 중 75%가 linear) |
| 어텐션 헤드 | Softmax: 64 query / 8 KV (GQA), Linear: 64 query |
| 위치 인코딩 | NoPE (RoPE 미사용) |
| Expert 수 | 321개 (routed 320 + shared 1) |
| 활성 Expert | routed top-8 + shared 1 |
| Vocabulary | 196,608 |
| 컨텍스트 | 1M 토큰 |
| 사전학습 토큰 | 약 12T |
| 학습 하드웨어 | NVIDIA B200 |
| 학습 GPU 시간 | 2M GPU-hours |
| 공식 언어 | 한국어 · 영어 · 일본어 |
| 라이선스 | Upstage Solar License |
| 하드웨어 요건 | 최소 H200 ×4 / 권장 H200 ×8 |

---

## 2. 장점 (Strengths)

### 2.1 추론 효율성 — 이 모델의 실질적 상품성

250B 총 파라미터 중 토큰당 15B만 활성화한다. 더 중요한 것은 **KV 캐시를 유지하는 층이 48층 중 12층(25%)** 뿐이라는 점이다. Linear attention 층은 시퀀스 정보를 고정 크기 state로 관리하므로 컨텍스트가 길어져도 모든 층의 KV 캐시가 동일 비율로 증가하지 않는다. 동형 all-softmax 모델 대비 롱컨텍스트 메모리가 약 1/4 수준이다.

결과적으로 BF16은 H200 4장, 양자화 시 H200 2장에서 구동된다. **자체 인프라 온프레미스 배포가 현실적으로 가능한 유일한 준-프런티어 오픈 웨이트 모델**이라는 점이 최대 차별점이다.

### 2.2 학습 효율 — Selective Weight Transfer

전작 Solar Open 100B의 가중치 중 새 아키텍처에서도 쓸 수 있는 부분만 선별 전이해 초기화했다. 모델 카드 기준 **전이된 가중치는 전체의 2.3%** 에 불과하고 나머지는 무작위 초기화다.

- 200B-A15B proxy 실험: 동일 loss 도달에 필요한 토큰이 random init 약 22B → SWT 약 12B (**약 58% 수준**)
- 아키텍처 효과 검증: Solar Open 100B의 all-softmax 구조가 671B 토큰으로 도달한 MMLU 성능을, Solar Open 2 아키텍처는 **210B 토큰**으로 도달

### 2.3 Agentic Use 최적화 — 학습 데이터 설계

단순 시나리오 생성이 아니라 **검증 가능한 환경**을 만들어 통과한 데이터만 학습에 썼다는 점이 특징이다.

| 도메인 | 검증 방식 |
|---|---|
| 검색 | 질문을 구조·자명성·검색 가능성·해결 가능성·출처 근거 다단계로 검증 |
| 도구 호출 | 도구 선택 적절성이 아니라 **실제 환경 변경 후 상태를 다시 읽어 결과 검증** |
| 코딩 | 터미널 작업 후 스스로 테스트 생성·실행, 실패 시 수정·재검증 루프를 데이터에 포함 |
| 오피스 | 여러 문서·스프레드시트 교차 확인, 수식 포함 시트 입력 변경 후 재계산 등 실무형 태스크. **한국 업무 환경 특유의 문서 처리 시나리오를 별도 반영** |

마지막 항목이 실무적으로 중요하다. "한국어를 잘 생성한다"가 아니라 "한국어로 주어진 업무를 실제로 수행한다"를 목표로 설계했다는 의미다.

### 2.4 한국어 토큰 효율

같은 한국어 텍스트를 글로벌 모델 대비 **약 50~80% 수준의 토큰**으로 처리한다. 한국어 오피스 업무 텍스트 기준 비교 대상 12개 토크나이저 중 1위이며, 차점 글로벌 모델 대비 약 24% 앞선다.

이는 벤치마크 점수가 아니라 **직접적인 비용 항목**이다. 동일 업무에서 토큰 소모가 30% 줄면 Agent 반복 호출 환경에서 운영비가 그대로 30% 줄고, 유효 컨텍스트는 그만큼 길어진다.

### 2.5 실무형 산출물 능력 — Ko-GDPval

Ko-GDPval은 변호사·회계사·감염관리 전문가 등 **58개 직군, 170개 실제 업무 시나리오**에서 모델이 보고서·계획서·발표자료 같은 문서 산출물을 직접 만들어 평가받는 벤치마크다.

- Solar Open 2: **86.75**
- DeepSeek-V4-Pro (1.6T): 86.91 — **0.16점 차**
- MiMo-V2.5-Pro (1T): 84.62

활성 파라미터 기준으로 Solar Open 2는 DeepSeek-V4-Pro의 약 1/3(15B)을 쓴다. 공개된 산출물 예시에는 FATF 상호평가 사전 대응 자료(규제기관 제출용 PDF + 55건 모니터링 워크북 xlsx 상호 정합), 의료기기 PMS 정기 보고서, 법무법인 광고 자체 점검 결과(인용 판례표·법령 색인 포함) 등이 포함된다.

### 2.6 상업적 활용 가능 라이선스

Upstage Solar License로 상업적 사용, fine-tuning, distillation을 통한 파생 모델 개발이 모두 허용된다.

---

## 3. 단점 및 한계 (Weaknesses)

### 3.1 하드웨어 진입 장벽

BF16 기준 H200 4장(최소)·8장(권장). 공식 예제는 **141GB 이상 메모리를 가진 GPU 8장**을 가정한다. 양자화로 2장까지 낮출 수 있으나, 개인 환경이나 소규모 팀에는 여전히 비현실적이다. 실질 도입 주체는 대기업·금융권·공공기관·GPU 클라우드 사용자로 한정된다.

### 3.2 공식 지원 언어 3개

한·영·일에 국한된다. 중국어·유럽어군은 공식 미지원이며, 글로벌 다국어 서비스에는 추가 검증·비용이 발생한다. 아시아-태평양 한·일 시장에 집중된 포지셔닝으로 봐야 한다.

### 3.3 일본어 성능 근거 부재

공식 언어에 일본어가 포함돼 있으나 **모델 카드에 일본어 벤치마크가 게재되지 않았다**. 한국어는 9개 벤치마크가 공개된 것과 대비된다. 일본 시장 도입 검토 시 자체 평가가 필수다.

### 3.4 서빙 환경 의존성

Linear attention 커널 최적화에 `fla-core`(KDA 커널) 설치가 전제된다. **미설치 시 Transformers가 현저히 느린 PyTorch fallback으로 동작**한다. 프로덕션은 사실상 vLLM 전용이며, 그것도 업스테이지 포크(v0.22.0-solar-open2) 기준이다. 업스트림 vLLM/SGLang 일반 빌드로는 reasoning·tool-call 파서가 동작하지 않는다.

### 3.5 추론 토큰 비용

`reasoning_effort="high"` 사용 시 reasoning 블록 상한이 131,072 토큰이다. 활성 파라미터가 작아도 **출력 토큰량 자체가 많으면 절감분이 상쇄**될 수 있다. 실측 기준 end-to-end 태스크 비용 비교가 필요하다.

### 3.6 생태계 미성숙

2026년 7월 공개된 신규 모델로 파인튜닝 레시피, 커뮤니티 튜닝 모델, llama.cpp/Ollama 계열 지원이 아직 얕다. 라이선스의 "Solar" 접두사·"Built with Solar" 표기 의무도 서구권 오픈소스 채택에는 마찰 요인으로 지적된다.

### 3.7 자체 발표 벤치마크 의존

현시점 모든 수치는 업스테이지 발표 기준이며 일부는 in-house 벤치마크(Ko-AIME'25, KBank-MMLU, Ko-GDPval)다. 독립 검증 전까지는 참고치로 다뤄야 한다.

---

## 4. 벤치마크 (공식 모델 카드 전문)

### 4.1 영어 벤치마크

| 벤치마크 | **Solar Open 2**<br>250B-A15B | Solar Open 100B<br>102B-A12B | Command A+<br>218B-A25B | Mistral Medium 3.5<br>128B dense | MiMo-V2.5<br>310B-A15B | DeepSeek-V4-Flash<br>284B-A13B |
|---|---|---|---|---|---|---|
| **지식·추론** | | | | | | |
| MMLU-Pro | **86.2** | 80.4 | 79.0 | 81.2 | 84.6 | 85.9 |
| GPQA-Diamond | 86.3 | 66.2 | 75.6 | 77.5 | 83.0 | **88.9** |
| HLE (w/o tools) | 28.8 | 11.5 | 11.4 | 12.8 | 24.3 | **32.3** |
| LiveCodeBench (v6) | **92.4** | 56.5 | 86.1 | 84.9 | 89.1 | 92.3 |
| ArtifactsBench | 55.9 | 43.4 | 42.8 | 49.8 | 59.3 | **61.0** |
| HMMT2602 | 93.9 | 68.9 | 73.5 | 62.9 | 61.4 | **94.7** |
| AIME2026 | 95.7 | 87.7 | 96.0 | 89.0 | 92.3 | **97.0** |
| **지시이행·롱컨텍스트** | | | | | | |
| Multi-Challenge | 61.0 | 40.5 | 45.8 | 49.8 | 39.0 | **62.0** |
| IFBench | 80.0 | 57.7 | 73.9 | 69.0 | 67.1 | **80.3** |
| AA-LCR | 62.3 | 36.0 | 46.0 | 61.0 | 62.7 | **63.7** |
| **에이전트** | | | | | | |
| SWE-Bench Verified | 70.4 | 15.4 | 14.4 | 69.6 | 73.0 | **73.8** |
| Terminal Bench Hard | 28.3 | 2.3 | 25.0 | 33.3 | **41.7** | 34.1 |
| APEX-Agents | **16.6** | 2.4 | 1.6 | 6.1 | 13.4 | 13.2 |
| MCP-Atlas | 58.2 | 34.4 | 27.2 | 30.7 | **63.9** | 58.2 |
| τ³ (banking) | 19.6 | 7.4 | 5.8 | 5.8 | 8.7 | **22.3** |
| GDPval-AA v2 (ELO) | 1128 | – | 712 | 929 | 1145 | **1187** |

**해석 포인트**
- 1위 항목은 MMLU-Pro, LiveCodeBench, APEX-Agents 3개. 나머지 다수는 DeepSeek-V4-Flash·MiMo-V2.5가 근소 우위다.
- **APEX-Agents 16.6은 유의미하다.** 실제 업무형 Agent 능력 평가에서 2위(MiMo 13.4)와 격차가 있다.
- **Terminal Bench Hard 28.3은 약점**이다. 터미널 기반 장기 작업에서는 MiMo-V2.5(41.7), DeepSeek(34.1), Mistral(33.3)에 밀린다. CLI 자동화 에이전트가 주 용도라면 재검토가 필요하다.
- τ³ banking 19.6도 금융 도메인 대화형 에이전트로는 낮은 편이다.

### 4.2 한국어 벤치마크

| 벤치마크 | **Solar Open 2** | Solar Open 100B | MiMo-V2.5 | DeepSeek-V4-Flash | Claude Haiku 4.5 | GPT-5.4 mini |
|---|---|---|---|---|---|---|
| KMMLU-Pro | 78.4 | 64.0 | 69.1 | **78.9** | 67.9 | 78.1 |
| CLIcK | **90.7** | 78.9 | 78.4 | 89.2 | 53.5 | 89.6 |
| HAE-RAE v1.1 | **73.8** | 73.3 | 61.7 | 73.1 | 38.5 | 69.4 |
| Ko-AIME'25† | 97.7 | 80.0 | 88.0 | **98.0** | 81.7 | 90.7 |
| HRM8K | 92.2 | 87.6 | 90.7 | **93.4** | 90.6 | 91.3 |
| KBank-MMLU† | **80.8** | 65.5 | 71.0 | 79.5 | 68.9 | 79.0 |
| KBL (법률) | **75.5** | 65.5 | 69.8 | 72.8 | 69.9 | 75.3 |
| KorMedMCQA | 93.0 | 84.4 | 87.7 | 94.1 | 87.0 | **94.2** |
| Ko-GDPval† | **86.8** | 3.4 | 81.0 | 85.0 | 68.3 | 59.4 |
| **한국어 평균** | **85.4** | 66.95 | – | 84.9 | 69.6 | 80.8 |

† 업스테이지 in-house 벤치마크

**해석 포인트**
- **KBank-MMLU(금융) 80.8, KBL(법률) 75.5 1위**는 국내 금융·법률 도메인 도입에 직접적인 근거다.
- KorMedMCQA는 3위. 의료 도메인은 GPT-5.4 mini(94.2)·DeepSeek(94.1)이 우위다.
- Ko-GDPval에서 전작(3.4)과의 격차가 비정상적으로 크다. 전작이 문서 산출물 생성 자체를 못했다는 뜻이며, 이번 세대의 핵심 개선점이 여기임을 보여준다.

### 4.3 전작 대비 개선폭

| 카테고리 | 벤치마크 | Solar Open 2 | Solar Open 100B | 상승폭 |
|---|---|---|---|---|
| 지식·과학 추론 | GPQA-Diamond | 86.26 | 66.16 | +20.10p |
| 수학 | HMMT | 93.94 | 68.94 | +25.00p |
| 코딩 | LiveCodeBench | 92.42 | 56.49 | +35.93p |
| 지시 이행 | IFBench | 80.00 | 57.70 | +22.30p |
| 한국어 종합 | 한국어 평균 | 85.43 | 66.95 | +18.48p |

---

## 5. 경쟁 프로젝트 비교

### 5.1 Kimi K3 (Moonshot AI) — 규모 극단의 반대편

| 항목 | **Solar Open 2** | **Kimi K3** |
|---|---|---|
| 개발사 | Upstage (한국) | Moonshot AI (중국) |
| 총 파라미터 | 250B | **2.8T** |
| Expert 구성 | 320 routed + 1 shared, top-8 활성 | 896 experts, 16개 활성 (보도 기준) |
| 공개일 | 2026-07-22 | API 2026-07-16 / 가중치 2026-07-27 |
| 컨텍스트 | 1M | 1M |
| 멀티모달 | 텍스트 전용 | **네이티브 비전 지원** |
| 추론 모드 | `none` / `high` 선택 | thinking mode 상시 활성 |
| 라이선스 | Upstage Solar License | Modified MIT |
| 공식 언어 | 한 · 영 · 일 | 중 · 영 중심 |
| API 가격 | 자체 서빙 | $3 / $15 per 1M tokens |
| 하드웨어 | H200 2~4장 | 테라바이트급 스토리지 + 분산 클러스터 |

Kimi K3는 현재까지 공개된 최대 규모 오픈 웨이트 모델로, Arena Frontend Code Arena에서 1위(1,679점)를 기록하며 Claude Fable 5, GPT-5.6 Sol을 앞섰다. Artificial Analysis 종합 ELO 1,547로 K2.6 대비 732점 상승했다.

**두 모델은 경쟁 관계가 아니라 다른 시장에 있다.** Kimi K3는 프런티어 성능을 오픈 웨이트로 가져오는 것이 목적이고, Solar Open 2는 **자체 인프라에 실제로 올릴 수 있는 성능/비용 지점**을 노린다. 온프레미스가 요구되는 국내 금융·공공 도입에서 2.8T 모델은 애초에 선택지가 아니다.

다만 K3의 자체 발표 벤치마크는 가중치 공개 전 API 기준이었고, 추론이 느리고 reasoning 토큰 소모가 크다는 지적이 있다는 점은 함께 봐야 한다.

### 5.2 MiMo-V2.5 (310B-A15B) — 가장 직접적인 경쟁자

**활성 파라미터가 15B로 동일**한 유일한 비교 대상이다. 즉 추론 비용 구조가 거의 같다.

| 항목 | Solar Open 2 우위 | MiMo-V2.5 우위 |
|---|---|---|
| 지식 | MMLU-Pro 86.2 vs 84.6, GPQA 86.3 vs 83.0 | – |
| 코딩 | LiveCodeBench 92.4 vs 89.1 | SWE-Bench 70.4 vs **73.0** |
| 에이전트 | APEX-Agents 16.6 vs 13.4 | Terminal Bench Hard 28.3 vs **41.7**, MCP-Atlas 58.2 vs **63.9** |
| 지시이행 | Multi-Challenge 61.0 vs 39.0, IFBench 80.0 vs 67.1 | – |
| 한국어 | 전 항목 우위 (평균 85.4 vs 미공개) | – |
| 총 파라미터 | 250B (메모리 유리) | 310B |

**결론**: 한국어·지시이행은 Solar, **MCP 도구 호출과 터미널 장기 작업은 MiMo가 우위**다. MCP-Atlas 58.2 vs 63.9는 MCP 기반 에이전트를 주 용도로 하는 조직에게는 무시하기 어려운 격차다.

### 5.3 DeepSeek-V4-Flash (284B-A13B)

가장 균형 잡힌 경쟁자로, 16개 영어 벤치마크 중 9개에서 1위다. Solar Open 2가 앞서는 것은 MMLU-Pro(86.2 vs 85.9), LiveCodeBench(92.4 vs 92.3), APEX-Agents(16.6 vs 13.2) 정도이며 앞의 둘은 오차 범위다.

한국어에서는 종합 평균 85.4 vs 84.9로 Solar가 앞서지만, KMMLU-Pro·Ko-AIME·HRM8K·KorMedMCQA는 DeepSeek이 우위다. **DeepSeek이 이 정도 한국어 성능을 낸다는 사실 자체가 Solar Open 2의 한국어 우위 서사를 상당히 약화시킨다.** 실질 차별점은 한국어 성능 자체보다 토큰 효율·온프레미스 적합성·데이터 주권 쪽에 있다.

### 5.4 Mistral Medium 3.5 (128B dense)

Solar Open 2가 지식·코딩·한국어에서 명확히 앞선다(MMLU-Pro 86.2 vs 81.2). 단 **에이전트 영역은 대등하거나 열세**다 — SWE-Bench 70.4 vs 69.6(근소), Terminal Bench Hard 28.3 vs 33.3(열세), AA-LCR 62.3 vs 61.0. Apache 2.0 라이선스라는 점은 Mistral의 확실한 강점이다.

### 5.5 Command A+ (218B-A25B)

Solar Open 2가 전반적으로 크게 앞선다(MMLU-Pro 86.2 vs 79.0, GPQA 86.3 vs 75.6). 특히 **SWE-Bench 70.4 vs 14.4**로 에이전트 코딩에서는 사실상 비교 대상이 아니다. 활성 파라미터도 25B로 Solar보다 크다.

### 5.6 선택 가이드

| 요구 조건 | 권장 |
|---|---|
| 한국어 문서 업무 + 온프레미스 | **Solar Open 2** |
| 금융·법률 도메인 한국어 | **Solar Open 2** (KBank-MMLU·KBL 1위) |
| MCP 기반 도구 호출 집약형 에이전트 | MiMo-V2.5 검토 |
| 터미널/CLI 장기 자동화 | MiMo-V2.5, DeepSeek-V4-Flash |
| 최고 성능, 인프라 제약 없음 | Kimi K3, DeepSeek-V4-Pro |
| 라이선스 자유도 최우선 | Mistral (Apache 2.0), Kimi K3 (Modified MIT) |
| 다국어(중·유럽어) 필수 | DeepSeek 계열 |

---

## 6. Getting Started

### 6.1 시스템 요구사항

| 구성 | 하드웨어 | 비고 |
|---|---|---|
| BF16 최소 | NVIDIA H200 ×4 | 공식 최소 사양 |
| BF16 권장 | NVIDIA H200 ×8 | 공식 예제는 141GB급 GPU 8장 가정 |
| 양자화 (공식 블로그) | H200 ×2 | NotaAI 양자화 모델 |
| INT4 + Expert Pruning | H100 ×2 | Nota INT4-GlobalPruned 카드 기준 |

실제 메모리 요구량은 컨텍스트 길이와 서빙 설정에 따라 달라진다.

### 6.2 Transformers (로컬 실험용)

업스테이지 Transformers 브랜치를 사용해야 한다.

```bash
# CUDA 지원 PyTorch를 먼저 설치할 것
python -m pip install -U \
  "git+https://github.com/upstageAI/transformers.git@v5.14.1-solar-open2" \
  "fla-core[cuda]>=0.5.1" \
  accelerate einops
```

> `fla-core`가 없으면 최적화된 KDA 커널 대신 현저히 느린 PyTorch fallback으로 동작한다. 반드시 설치할 것.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "upstage/Solar-Open2-250B"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=False)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    dtype=torch.bfloat16,
    trust_remote_code=False,
)
model.eval()

messages = [{"role": "user", "content": "업스테이지가 무엇인가요?"}]
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    reasoning_effort="high",
    think_render_option="preserved",
)

input_device = model.get_input_embeddings().weight.device
model_inputs = tokenizer(prompt, return_tensors="pt").to(input_device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768,
    do_sample=True,
    temperature=1.0,
    top_p=1.0,
)

# 추론 트레이스와 최종 답변 분리 (Transformers 직접 사용 시 필수)
new_token_ids = generated_ids[0, model_inputs.input_ids.shape[-1]:].tolist()
think_end_id = tokenizer.convert_tokens_to_ids("<|think:end|>")

if think_end_id in new_token_ids:
    answer_start = len(new_token_ids) - new_token_ids[::-1].index(think_end_id)
else:
    # 종료 마커가 없으면 추론 도중 max_new_tokens에 도달한 것
    answer_start = len(new_token_ids)

reasoning = tokenizer.decode(new_token_ids[:answer_start], skip_special_tokens=True).strip()
answer = tokenizer.decode(new_token_ids[answer_start:], skip_special_tokens=True).strip()

print("[reasoning]", reasoning)
print("[answer]", answer)
```

**답변이 비어 있다면** 추론 블록이 끝나기 전에 `max_new_tokens`에 도달한 것이다. 값을 늘려 재시도한다.

### 6.3 vLLM 프로덕션 서빙 (권장)

#### 옵션 1: Docker

```bash
# 이미지 기준: vLLM v0.22.0 / CUDA 12.9
docker run --rm --gpus all --ipc=host \
  -p 8000:8000 \
  -v "${HF_HOME:-$HOME/.cache/huggingface}:/root/.cache/huggingface" \
  upstage/vllm-solar-open2 \
  upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

> **`--logits-processors`는 공식 권장 구성의 필수 항목이다.** v1 문서에서 누락돼 있었다.

#### 옵션 2: 소스 설치

```bash
pip install -U uv

VLLM_PRECOMPILED_WHEEL_LOCATION="https://github.com/vllm-project/vllm/releases/download/v0.22.0/vllm-0.22.0%2Bcu129-cp38-abi3-manylinux_2_28_x86_64.whl" \
VLLM_USE_PRECOMPILED=1 \
uv pip install --reinstall-package vllm --torch-backend=cu129 \
  "git+https://github.com/UpstageAI/vllm.git@v0.22.0-solar-open2"
```

```bash
vllm serve upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

#### API 호출

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "solar-open2-250b",
    "messages": [{"role": "user", "content": "What is Upstage?"}],
    "max_tokens": 131584,
    "temperature": 1.0,
    "top_p": 1.0,
    "reasoning_effort": "high"
  }'
```

> `max_tokens`는 추론 트레이스와 최종 답변을 **모두 포함**한다. reasoning 상한이 131,072이므로 그 이상의 여유를 둬야 답변이 잘리지 않는다.

### 6.4 공식 양자화 모델 (NotaAI)

| 모델 | 방식 | 비고 |
|---|---|---|
| `nota-ai/Solar-Open2-250B-Nota-INT4-GlobalPruned` | W4A16 INT4 + 글로벌 expert pruning | 층별 expert 수 가변, 2×H100 서빙 |
| `nota-ai/Solar-Open2-250B-Nota-NVFP4` | NVFP4 | Blackwell 계열 최적 |
| `nota-ai/Solar-Open2-250B-Nota-INT4` | W4A16 INT4 | pruning 미적용 |

GlobalPruned 버전은 전체 네트워크 관점에서 expert 중요도를 측정해 층별로 남길 expert 수를 다르게 가져간다. 균일 pruning 대비 정확도 보존이 낫다.

### 6.5 추론 모드 설정

| 모드 | `reasoning_effort` | temperature | top_p | max_tokens |
|---|---|---|---|---|
| 직접 응답 | `"none"` | 1.0 | 1.0 | 최대 128K |
| 고급 추론 | `"high"` | 1.0 | 1.0 | 최대 256K |

**멀티턴 주의**: 이전 턴의 추론 트레이스를 대화 이력에서 제거하면 안 된다. `think_render_option=preserved`(기본값)가 자동 처리한다.

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "√2가 무리수임을 증명하라."}],
    reasoning_effort="high",
    temperature=1.0,
    top_p=1.0,
    max_tokens=131584,
)

print(response.choices[0].message.reasoning)  # 추론 트레이스 (별도 필드)
print(response.choices[0].message.content)    # 최종 답변
```

### 6.6 도구 호출 (Tool Calling)

서버를 `--tool-call-parser solar_open2 --enable-auto-tool-choice`로 기동해야 한다. 이후는 표준 OpenAI function calling 인터페이스와 동일하다.

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {"location": {"type": "string"}},
            "required": ["location"],
        },
    },
}]

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "서울 날씨가 어때?"}],
    tools=tools,
)
print(response.choices[0].message.tool_calls)
```

### 6.7 Claude Code / Hermes Agent 연동

단일 vLLM 서버가 두 인터페이스를 동시에 노출한다. Claude Code는 Anthropic 호환 `/v1/messages`, Hermes Agent는 OpenAI 호환 `/v1`을 사용한다. MCP로 노출된 도구는 동일한 tool-calling 인터페이스를 통해 모델에 전달되며, 두 에이전트 모두 MCP를 네이티브 지원한다.

**Claude Code — 환경변수 방식**

```bash
export ANTHROPIC_BASE_URL=http://localhost:8000
export ANTHROPIC_AUTH_TOKEN=dummy   # 비어 있지 않은 임의 값
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
claude
```

모델명은 서버의 `--served-model-name`과 정확히 일치해야 한다.

**Claude Code — 업스테이지 제공 스크립트**

```bash
curl -fsSL https://console.upstage.ai/claude-upstage.sh | bash
```

**Hermes Agent** — Solar Open 2는 Hermes Official 모델이다. `~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  default: solar-open2-250b
  base_url: http://localhost:8000/v1
  api_key: dummy
```

### 6.8 플레이그라운드

별도 설정 없이 Upstage Playground에서 체험 가능하다. **제공 기간은 2026년 7월 31일까지**다.

---

## 7. 중요 사용 예 (Key Use Cases)

### 7.1 규제 대응 문서 자동 생성 — 상호 정합 다중 산출물

업스테이지가 Ko-GDPval 산출물로 공개한 대표 사례이자 이 모델의 가장 차별적인 능력이다. **동일 데이터로부터 형식이 다른 두 개 이상의 산출물을 서로 숫자가 맞도록 생성**한다.

- 규제기관 제출용 요약 보고서(PDF) — 위험 등급별·국가별 익스포저
- 실무 모니터링 워크북(xlsx) — 룰에 적발된 개별 거래 전건 명세

일반적인 LLM이 실패하는 지점이 바로 두 산출물 간 합계 불일치다.

```python
prompt = """다음 거래 로그(첨부)에 대해 두 개의 산출물을 생성하라.

[산출물 1] 규제기관 제출용 대응 보고서
- 위험 등급(고/중/저)별 거래 건수 및 금액 합계
- 국가별 익스포저 상위 10개국
- 적발 룰(R1~R4)별 요약

[산출물 2] 내부 모니터링 워크북 (xlsx)
- 적발 거래 전건 명세 (거래ID, 일시, 금액, 통화, 상대국, 적발룰, 위험등급)
- 산출물 1의 모든 집계값과 SUMIF로 검증 가능한 구조

제약: 산출물 1의 모든 수치는 산출물 2에서 재계산 가능해야 한다.
불일치가 발생하면 산출물 2를 기준으로 산출물 1을 수정하라."""
```

**적용 영역**: FATF/AML 대응, 금융감독원 보고, 의료기기 PMS 정기보고, 광고 심의 자체점검, 공시자료 작성.

### 7.2 1M 컨텍스트 계약서·규정 교차 검토

컨텍스트가 1M이면 **RAG 청킹 없이 문서 전체를 한 번에 넣을 수 있다**. 조항 간 상호 참조가 중요한 문서에서 청킹은 구조적으로 답을 망친다.

```python
messages = [{
    "role": "user",
    "content": f"""아래는 본계약서, 부속합의서 3건, 우리 회사 표준계약 가이드라인 전문이다.

{full_documents}   # 약 400K 토큰

다음을 수행하라:
1. 본계약과 각 부속합의서 간 상충 조항 전부 적출 (조항 번호 명시)
2. 표준 가이드라인 위반 조항과 위반 사유
3. 위반 조항별 수정 제안 문구
4. 리스크 등급(상/중/하) 및 협상 우선순위

근거 없는 추정은 하지 말고, 원문 조항을 인용해 제시하라."""
}]
```

**주의**: 롱컨텍스트 벤치마크 AA-LCR은 62.3으로 최상위(DeepSeek 63.7)와 근소하지만 절대값 자체가 높지 않다. 1M을 실제로 채워 쓸 때의 검색 정확도는 자체 needle-in-haystack 테스트로 검증할 것.

### 7.3 스프레드시트 재계산형 에이전트

학습 데이터에 명시적으로 포함된 시나리오다. 수식이 있는 시트의 입력값을 바꾸고 결과를 다시 계산하는 작업이다.

```python
tools = [
    {"type": "function", "function": {
        "name": "read_sheet",
        "description": "시트 범위를 읽어 값과 수식을 반환",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "sheet": {"type": "string"}, "range": {"type": "string"}
        }, "required": ["path", "sheet", "range"]}}},
    {"type": "function", "function": {
        "name": "write_cells",
        "description": "셀에 값 또는 수식을 기록",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "updates": {"type": "array", "items": {"type": "object"}}
        }, "required": ["path", "updates"]}}},
    {"type": "function", "function": {
        "name": "recalculate",
        "description": "워크북 전체 재계산 후 지정 셀 결과 반환",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "check_cells": {"type": "array", "items": {"type": "string"}}
        }, "required": ["path"]}}},
]

# "환율 가정을 1,340원에서 1,420원으로 변경하고, 영향받는 부문별 영업이익을
#  재계산한 뒤 변동폭 상위 3개 부문에 대한 코멘트를 작성하라"
```

핵심은 모델이 **쓰기 후 다시 읽어 결과를 검증**하도록 학습됐다는 점이다. `recalculate` 도구를 반드시 제공해 이 루프를 활성화해야 한다.

### 7.4 사내 코드베이스 에이전트 (Claude Code 연동)

SWE-Bench Verified 70.4는 자체 인프라에서 돌릴 수 있는 모델로는 최상위권이다. 소스코드 외부 유출이 금지된 조직에 직접적인 답이 된다.

```bash
# 1. 사내 GPU 노드에서 vLLM 기동 (6.3절)
# 2. 개발자 워크스테이션
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
cd ~/legacy-erp && claude
```

**단, Terminal Bench Hard 28.3은 짚고 넘어가야 한다.** 파일 단위 수정·테스트 통과형 작업(SWE-Bench)은 강하지만, 터미널에서 장기간 자율적으로 환경을 조작하는 작업은 상대적으로 약하다. 자율 실행 범위를 좁게 잡고 human-in-the-loop을 유지하는 편이 안전하다.

### 7.5 MCP 기반 사내 시스템 오케스트레이션

```yaml
# 사내 MCP 서버 구성 예
servers:
  - name: erp-mcp          # 전표 조회/기표
  - name: groupware-mcp    # 결재 상신, 문서함
  - name: dw-mcp           # 데이터웨어하우스 쿼리
  - name: hr-mcp           # 인사 마스터 (읽기 전용)
```

```
"이번 분기 부서별 판관비 집행률을 조회해서 예산 대비 90% 초과 부서를
찾고, 해당 부서장 앞으로 집행 현황 요약과 잔여 예산 계획 요청 공문을
기안 상신해줘."
```

**MCP-Atlas 58.2는 최상위권(MiMo 63.9)과 격차가 있다.** 도구 개수가 많고 스키마가 복잡할수록 오호출 가능성이 올라간다. 실무 권장 설계:
- 세션당 노출 도구를 15개 이하로 제한
- 쓰기(write) 도구는 반드시 승인 게이트를 통과시킬 것
- 도구 description을 한국어로 명확하게 작성 (한국어 이해도가 강점이므로 활용)

### 7.6 도메인 특화 파생 모델 개발

라이선스가 fine-tuning·distillation을 허용한다. KBank-MMLU 80.8·KBL 75.5라는 베이스 성능은 금융·법률 특화 파생 모델의 출발점으로 유리하다.

```
Solar-KFinance-v1   # 국내 금융 규정·상품 약관 특화
Solar-KLegal-v1     # 판례·법령 특화
Solar-Med-PMS-v1    # 의료기기 시판후조사 문서 특화
```

> 모델명 접두사 "Solar" 필수, 홍보물에 "Built with Solar" 표기, 라이선스 사본 동봉 의무.

---

## 8. 한국 시장 사업 도입 시나리오

### 8.0 전제: 왜 지금 한국에서 유효한가

세 가지 조건이 동시에 성립한다.

1. **망분리·데이터 주권 규제** — 금융권 망분리, 공공 클라우드 보안인증(CSAP), 개인정보 국외이전 제한으로 해외 API 사용이 구조적으로 어렵다.
2. **온프레미스 가능한 하드웨어 요건** — H200 2~4장은 중견기업도 감당 가능한 수준이다. 프런티어급 오픈 모델 중 이 조건을 만족하는 사실상 유일한 선택지다.
3. **한국어 업무 문맥 학습** — 한국 업무 환경 특유의 문서 처리 시나리오가 학습에 반영됐다.

업스테이지 측 레퍼런스로는 조달청 생성형 AI 업무지원 서비스 1호 공급사 선정(2025-12), 포털 '다음' 적용 계획, 지자체·공공·교육기관 대상 에이전트 플랫폼 '타임리' 공급이 언급된다.

### 8.1 금융권 — 준법감시·AML 에이전트

| 항목 | 내용 |
|---|---|
| 대상 | 은행, 증권, 보험, 가상자산사업자(VASP) |
| 근거 | KBank-MMLU 80.8(1위), Ko-GDPval 86.8, 규제 문서 다중 산출물 능력 |
| 문제 | AML/CFT 모니터링 알람 폭증, FATF 상호평가 대응 문서 작업 과중, 망분리로 외부 LLM 사용 불가 |
| 구성 | 내부망 H200 ×4 + vLLM + MCP(코어뱅킹 읽기전용, AML 룰엔진, 문서관리) |
| 산출 | 의심거래보고(STR) 초안, 감독기관 제출 보고서 + 검증용 워크북 동시 생성, 내부통제 점검조서 |
| KPI | 알람 1건당 심사 소요시간, STR 초안 반려율, 보고서 작성 리드타임 |
| 리스크 | τ³ banking 19.6은 대화형 금융 에이전트로는 낮음 → **고객 응대가 아닌 백오피스 문서 업무로 범위를 한정할 것** |

**단계적 도입 권고**: 1단계 문서 초안 생성(사람 검토 필수) → 2단계 알람 1차 분류 → 3단계 정형 보고서 자동화. 고객 직접 접점은 최소 1년 이상 유예.

### 8.2 법무·법률 서비스 — 계약 검토 및 자체점검

| 항목 | 내용 |
|---|---|
| 대상 | 로펌, 대기업 법무팀, 사내 컴플라이언스 |
| 근거 | KBL 75.5(1위), 1M 컨텍스트, 인용 판례표·법령 색인 산출 사례 |
| 문제 | 계약서 검토가 주니어 인력에 집중, 조항 간 상충 누락, 개정 법령 반영 지연 |
| 구성 | 온프레미스(수임 정보 외부 유출 절대 불가) + 사내 판례·계약 DB MCP 연동 |
| 산출 | 조항별 리스크 등급표, 표준계약 대비 편차 리포트, 협상 포인트 요약, 광고 심의 자체점검 결과 |
| KPI | 계약 1건당 검토 시간, 상충 조항 적출률(사람 대비), 재검토 지적 건수 |
| 리스크 | 법률 판단은 최종 책임이 변호사에게 있음. **초안 생성 도구로만 포지셔닝하고 결과물에 검토 필수 워터마크 삽입** |

### 8.3 제조 대기업 — 기술문서·품질 문서 자동화

| 항목 | 내용 |
|---|---|
| 대상 | 반도체·자동차·화학·조선 |
| 근거 | 1M 컨텍스트, 스프레드시트 재계산 학습, 온프레미스 |
| 문제 | 설계 변경 시 연관 문서 수십 종 수동 갱신, 해외 인증 대응 문서 반복 작성, 도면·사양서와 문서 불일치 |
| 구성 | 폐쇄망 + PLM/MES MCP 연동 + Document Parse 결합(문서 → LLM 가독 포맷 변환) |
| 산출 | 설계 변경 통지서(ECN) 초안, 품질 부적합 보고서, 8D 리포트, 해외 인증 제출 문서 다국어(한·영·일) |
| KPI | ECN 발행 리드타임, 문서 간 불일치 지적 건수 |
| 특기 | **한·영·일 3개 언어 지원이 정확히 일본 고객사 대응 시나리오와 맞는다.** 일본 완성차·전자 고객사를 둔 국내 부품사에 특히 적합 |

### 8.4 공공·지자체 — 민원 응대 및 행정문서

| 항목 | 내용 |
|---|---|
| 대상 | 중앙부처, 광역·기초지자체, 공공기관, 교육기관 |
| 근거 | Sovereign AI 정합, 조달청 공급 실적, CLIcK 90.7(한국 문화·상식 이해) |
| 문제 | 민원 응대 인력 부족, 조례·규정 개정 시 연관 문서 갱신, 국외 이전 불가 데이터 |
| 구성 | 공공 클라우드 또는 자체 IDC, 양자화 모델(H200 ×2)로 예산 최소화 |
| 산출 | 민원 답변 초안, 조례 개정 대비표, 사업계획서·정산보고서, 회의록 요약 |
| KPI | 민원 처리 소요일, 반복 민원 자동응답률 |
| 조달 관점 | 오픈 웨이트 + 국산 = **국산 AI 도입 실적 및 정보주권 요건을 동시 충족**. 사업 제안서에서 강력한 차별화 요소 |

### 8.5 중견기업 — 백오피스 에이전트 (양자화 저비용 진입)

| 항목 | 내용 |
|---|---|
| 대상 | 매출 1천억 ~ 1조 규모, 전담 AI 인력 1 ~ 3명 |
| 구성 | **H200 ×2 (Nota INT4-GlobalPruned)** 또는 H100 ×2. 초기 CAPEX 최소화 |
| 산출 | 계약 검토 1차, 견적·제안서 초안, 회계 전표 분류, 사내 규정 Q&A |
| 접근 | 클라우드 GPU로 3개월 PoC → 효과 확인 후 온프레미스 전환 |
| 실패 요인 | 도구(MCP) 정비 없이 모델만 도입하면 실패한다. **ERP/그룹웨어 API 정비가 선행 과제** |

### 8.6 한국 시나리오 종합 우선순위

| 우선순위 | 세그먼트 | 근거 강도 | 도입 난이도 | 예상 ROI |
|---|---|---|---|---|
| 1 | 금융 백오피스 문서 | 높음 (KBank 1위) | 중 | 높음 |
| 2 | 공공 행정문서 | 높음 (조달 실적) | 낮음 | 중 |
| 3 | 법무 계약 검토 | 높음 (KBL 1위) | 중 | 높음 |
| 4 | 제조 기술문서 | 중 | 높음 | 높음 |
| 5 | 사내 코드 에이전트 | 중 (SWE 70.4 / Terminal 28.3) | 중 | 중 |

---

## 9. 일본 시장 사업 도입 시나리오

### 9.0 전제: 일본 시장의 구조적 특성

일본은 **온프레미스 선호가 구조적으로 강한 시장**이다. 클라우드 기반 미국·중국 모델보다 로컬 배포 가능한 모델이 도입 문턱에서 유리하다. 업스테이지는 이미 일본 법인을 운영하며, 일본 AI 기업 카라쿠리와 공동 개발한 일본어 특화 모델 **Syn Pro(31B)** 로 W&B Nejumi 리더보드 1위 실적을 보유하고 있다.

**핵심 전략: Syn Pro와 Solar Open 2의 2단 구성.**

| 구분 | Syn Pro (31B) | Solar Open 2 (250B-A15B) |
|---|---|---|
| 강점 | 일본어·문화 문맥 파인튜닝, 검증된 일본어 성능 | Agentic 실행력, 1M 컨텍스트, 문서 산출물 |
| 하드웨어 | 소규모 온프레미스 | H200 2~4장 |
| 역할 | 대화·요약·분류 등 경량 태스크 | 다단계 업무 실행, 복합 문서 생성 |

### 9.1 중대 유의사항 — 일본어 성능 근거 부재

**Solar Open 2 모델 카드에는 일본어 벤치마크가 게재돼 있지 않다.** 한국어는 9개 벤치마크가 공개된 것과 대조적이다. 공식 지원 언어에 포함돼 있다는 사실만으로 일본 고객사에 제안하는 것은 위험하다.

**필수 선행 작업**:
1. W&B Nejumi 리더보드 기준 자체 평가 실시
2. JMMLU, JCommonsenseQA 등 공개 일본어 벤치마크 자체 측정
3. 일본어 토큰 효율 실측 (한국어와 달리 최적화 근거가 공개되지 않음)
4. 고객사 실제 문서로 PoC — 특히 경어체(敬語)·비즈니스 관용 표현 정확도

이 검증 없이 진입하면 첫 PoC에서 신뢰를 잃는다.

### 9.2 한일 크로스보더 문서 업무 — 가장 강력한 진입점

일본 시장에서 Solar Open 2의 **진짜 차별점은 일본어 단독 성능이 아니라 한·영·일 동시 지원**이다. 이 조합을 제공하는 오픈 웨이트 모델은 사실상 없다.

| 항목 | 내용 |
|---|---|
| 대상 | 한일 합작법인, 일본 진출 한국 기업, 한국 진출 일본 기업, 상사 |
| 문제 | 계약서·사양서·품질문서를 3개 언어로 동시 유지, 번역 외주 비용과 리드타임, 번역 후 원문 대비 정합성 붕괴 |
| 해법 | 단순 번역이 아닌 **동일 사실 기반 다국어 산출물 동시 생성** (7.1절 능력 그대로 적용) |
| 산출 | 한·일 대역 계약서, 품질 부적합 보고서 3개국어판, 본사 보고자료(한) + 현지 제출자료(일) 정합 세트 |
| KPI | 번역 외주비, 다국어 문서 리드타임, 언어판 간 불일치 지적 건수 |

```python
prompt = """다음 품질 부적합 사례 데이터로 세 개의 산출물을 생성하라.

[1] 일본 고객사 제출용 8D 리포트 (일본어, 경어체, 제조업 표준 문체)
[2] 한국 본사 보고용 요약 (한국어, 원인분석·재발방지 중심)
[3] 글로벌 품질 DB 등록용 영문 요약 (영어, 200 words 이내)

제약:
- 세 산출물의 수치(불량률, 검출 로트 수, 대상 수량)는 완전히 일치할 것
- [1]은 일본 고객사가 그대로 접수 가능한 형식일 것
- 원인이 불명확한 항목은 추정하지 말고 '조사 중'으로 표기할 것"""
```

### 9.3 일본 제조업 — 온프레미스 품질·설계 문서

| 항목 | 내용 |
|---|---|
| 대상 | 자동차 부품, 전자부품, 정밀기계, 소재 |
| 근거 | 온프레미스 선호 시장 특성 + 1M 컨텍스트 + 스프레드시트 재계산 |
| 문제 | 기술 노하우 외부 유출 극도로 기피, 도면·사양서 방대, 숙련 인력 고령화로 문서화 지식 소실 |
| 구성 | 완전 폐쇄망 H200 ×2~4, PLM 연동, Syn Pro 병행 |
| 특기 | 일본 제조업은 **문서 형식 준수 요구가 매우 엄격**하다. 사내 표준 서식을 few-shot 또는 파인튜닝으로 반드시 주입할 것 |
| 진입 전략 | 완전 자동화가 아닌 "ベテランの暗黙知の形式知化"(숙련자 암묵지의 형식지화) 프레이밍이 수용도가 높다 |

### 9.4 일본 금융·보험 — 규제 대응 문서

| 항목 | 내용 |
|---|---|
| 대상 | 지방은행, 손해보험, 생명보험 |
| 근거 | 규제 문서 다중 산출물 생성, 온프레미스 |
| 문제 | 금융청 보고 문서 작성 부담, 지방은행의 IT 인력 부족, 데이터 외부 반출 불가 |
| 구성 | 양자화 모델(H200 ×2)로 초기 투자 억제 |
| 유의 | **한국 금융 규정 학습이 일본 금융 규정에 전이되지 않는다.** KBank-MMLU 1위를 일본 시장 근거로 쓰면 안 된다. 금융청 규정·업계 서식 RAG 구축이 필수 선행 |

### 9.5 일본 공공·자치체 — 신중 접근 권고

일본 자치체 시장은 계약 사이클이 길고 국산·준국산 선호가 강하다. **한국산 모델 단독 제안은 현실적으로 어렵다.** 
현실적 경로:
- 일본 SIer·통신사(NTT, SoftBank 등)를 통한 간접 진입
- Syn Pro처럼 **일본 기업과의 공동 개발·파생 모델 형태**로 접근
- 라이선스상 "Solar" 접두사 의무가 있으므로 `Solar-<파트너명>-JP-v1` 형태 네이밍이 불가피 — 사전에 파트너와 협의 필요

### 9.6 일본 시나리오 종합 우선순위

| 우선순위 | 세그먼트 | 근거 강도 | 진입 난이도 | 비고 |
|---|---|---|---|---|
| 1 | 한일 크로스보더 문서 | 높음 (구조적 차별점) | 낮음 | 즉시 착수 가능 |
| 2 | 일본 진출 한국 기업 사내 도입 | 높음 | 낮음 | 의사결정권이 한국 본사에 있음 |
| 3 | 일본 제조업 온프레미스 | 중 (일본어 검증 필요) | 중 | Syn Pro 병행 필수 |
| 4 | 일본 금융 | 중 | 높음 | 규정 RAG 선행 |
| 5 | 일본 공공 | 낮음 | 매우 높음 | 파트너 경유만 현실적 |

---

## 10. 도입 판단 체크리스트

### 10.1 기술 검증 (PoC 이전)

- [ ] 자체 데이터로 벤치마크 재현 — 공개 수치는 참고치일 뿐
- [ ] 1M 컨텍스트 needle-in-haystack 자체 측정 (AA-LCR 62.3의 실전 의미 확인)
- [ ] MCP 도구 15개 이상 환경에서 오호출률 측정 (MCP-Atlas 58.2 리스크)
- [ ] `reasoning_effort="high"` 시 실제 출력 토큰량 측정 → 활성 파라미터 절감분과 상계
- [ ] 일본어 사용 시 Nejumi/JMMLU 자체 평가 (필수)
- [ ] `fla-core` 설치 여부에 따른 처리량 차이 실측

### 10.2 인프라

- [ ] BF16(H200 ×4~8) vs 양자화(×2) TCO 비교
- [ ] 업스테이지 vLLM 포크 의존성 — 업스트림 vLLM 업그레이드 경로 확인
- [ ] 동시 사용자 수 기준 처리량 산정 (Agent는 세션당 토큰 소모가 큼)
- [ ] 장애 시 폴백 경로 (Solar Pro 3 API 등)

### 10.3 거버넌스·법무

- [ ] Upstage Solar License 전문 검토 — 파생 모델 정의 범위
- [ ] 파생 모델 개발 시 "Solar" 접두사·"Built with Solar" 표기 계획
- [ ] 라이선스 사본 배포 프로세스
- [ ] 쓰기 권한 도구에 대한 승인 게이트 설계
- [ ] 산출물 검토 책임 소재 명문화 (법률·의료·금융 영역 필수)

### 10.4 조직

- [ ] MCP 대상 사내 시스템 API 정비 상태 — **모델보다 이쪽이 병목**
- [ ] 사내 문서 표준 서식 수집 (few-shot / 파인튜닝 재료)
- [ ] 검토자 역할 재정의 — 작성자에서 검증자로

---

## 11. 라이선스

Upstage Solar License로 배포되며 **상업적 사용, fine-tuning, distillation을 통한 파생 모델 개발이 허용**된다.

파생 AI 모델 생성 시 의무사항:

| 구분 | 내용 |
|---|---|
| 네이밍 | 모델명에 "Solar" 접두사 (예: `Solar-MyModel-v1`) |
| 표시 | 관련 공개 자료에 "Built with Solar" 명시 |
| 고지 | Upstage Solar License 사본 포함 |

> Apache 2.0(Mistral)이나 Modified MIT(Kimi K3) 대비 제약이 있다. 자체 브랜드 제품에 임베딩할 경우 네이밍 의무가 마케팅 제약이 될 수 있으므로 사전 검토가 필요하다.

---

## 12. 인용

```bibtex
@misc{solar-open-2-2026,
    title={Solar Open 2 Technical Report},
    author={Upstage AI},
    year={2026},
    url={https://huggingface.co/upstage/Solar-Open2-250B}
}
```

---

## 13. 참고 자료

| 구분 | 링크 |
|---|---|
| 모델 카드 | https://huggingface.co/upstage/Solar-Open2-250B |
| Technical Report | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/Solar_Open_2_Tech_Report.pdf |
| 라이선스 | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/LICENSE |
| 기술 블로그 (KO) | https://www.upstage.ai/blog/ko/solar-open-2 |
| 기술 블로그 (EN) | https://www.upstage.ai/blog/en/solar-open-2 |
| Transformers 브랜치 | https://github.com/upstageAI/transformers/tree/v5.14.1-solar-open2 |
| vLLM 포크 | https://github.com/UpstageAI/vllm/tree/v0.22.0-solar-open2 |
| 양자화 모델 | https://huggingface.co/nota-ai |
| Syn Pro (일본어 특화) | https://www.upstage.ai/blog/en/upstage-ai-jp-syn-pro |
| 데모 (~2026-07-31) | https://open2-beta.upstage.ai/ |

---

*본 문서의 벤치마크 수치는 업스테이지 공식 발표 기준이며, 독립 제3자 검증이 축적되기 전까지는 자체 재현 평가를 전제로 활용할 것을 권장한다.*
