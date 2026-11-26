# 크래프톤 라온-1 미니(Raon-1 mini) 기술 가이드

게임회사에서 만든 LLM은 무엇이 다른가? 

- 작성 기준일: 2026-11-26 (정식 버전 공개 다음 날)
- 기준 자료: 크래프톤 보도자료, Hugging Face 모델 카드(`KRAFTON/Raon-1-mini` 및 gguf / nvfp4 / mlx 저장소), GitHub `krafton-ai/Raon-1-mini`, 국내 언론 보도
- 읽기 전 주의: 이 문서의 벤치마크 수치는 전부 크래프톤이 직접 측정해 모델 카드에 올린 값이다. 비교 모델 점수도 크래프톤의 평가 환경에서 나온 것이며, 제3자 재현 결과는 아직 거의 없다. 공개 직후 문서이므로 포크 브랜치, 버전 핀, 명령어는 모델 카드에서 한 번 더 대조하고 쓰는 것을 권한다.

---

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 개발 | 크래프톤(KRAFTON AI), 설계부터 프롬 스크래치 학습까지 자체 수행 |
| 공개 | 프리뷰 2026-10-21, 정식 2026-11-25 |
| 규모 | 30B-A4B 표기. 실제 전체 28.8B, 토큰당 활성 4.3B |
| 구조 | 희소 MoE + 하이브리드 어텐션(선형 어텐션 18층 + 풀 어텐션 7층) |
| 문맥 길이 | 262,144 토큰 |
| 입력 | 텍스트 전용(이미지 입력 없음) |
| 언어 | 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 태국어. 한국어가 가장 강하다고 명시 |
| 추론 강도 | `none` / `low` / `medium` / `high`(기본) / `xhigh` / `max` 6단계 |
| 라이선스 | 가중치·설정 파일은 Apache 2.0. 호스팅 API와 플레이그라운드는 별도 약관 |
| 실행 경로 | Transformers, vLLM, llama.cpp(GGUF), MLX |
| 최소 공식 프로파일 | NVFP4 체크포인트로 RTX 5090(32GB) 1장, 문맥 32K |

한 줄 평가: 같은 30B급 해외 오픈웨이트와 비교하면 "한국어 대화, 긴 대화의 지시 유지, 환각 억제"에서 앞서고 "코딩, 터미널 작업, 장문 독해, 함수 호출 정확도"에서 뒤진다. 국내 대형 모델과 비교하면 10~25배 작은 크기로 수능 문항별 평가에서 비슷한 점수를 냈다는 것이 핵심 메시지이며, 그 우위는 평가 방식에 따라 달라진다.

---

## 2. 모델 설명

### 2.1 위치와 로드맵

크래프톤은 2026년 4월 AI 모델 브랜드 '라온(Raon)'을 출범하고 음성·비전 모델을 오픈소스로 공개해 왔다. 라온-1 미니는 그 라인업의 기반 LLM이고, 이후 규모를 키운 '라온-1'과 실시간 양방향(full-duplex) 음성 모델로 확장할 계획이라고 밝혔다.

### 2.2 아키텍처 상세

| 필드 | 값 |
|---|---|
| 전체 / 활성 파라미터 | 28.8B / 4.3B |
| 레이어 | 25 |
| 어텐션 구성 | Raon Delta Attention(RDA, 선형) 18층 + Gated MLA(풀 어텐션) 7층, 3:1 비율 |
| Hidden size | 2,560 |
| 어텐션 헤드 | 40 (RDA head dim 128, MLA는 QK 192 / V 128) |
| 전문가(Expert) | 라우팅 대상 128개 중 토큰당 6개 + 공유 1개 활성 |
| Expert intermediate size | 1,088 (첫 레이어 dense FFN은 12,032) |
| 위치 인코딩 | NoPE(없음) |
| 활성 함수 | SiTU-GLU |
| 잔차 연결 | Raon-mHC, 4 스트림 |
| 어휘 크기 | 259,840, LM head 비공유(untied) |

핵심 설계 세 가지.

1. Raon Delta Attention(RDA). 고정 크기 상태를 갖는 선형 어텐션이다. 모델 카드는 Kimi Delta Attention의 지우기(erase) 게이트와 쓰기(write) 게이트를 분리해 긴 문맥 성능을 높였다고 설명한다.
2. 하이브리드 배치. 25층 중 18층이 RDA라서 KV 캐시를 갖는 층은 7개뿐이다. KV 캐시는 BF16 기준 토큰당 약 8KiB다. 단순 계산으로 262,144 토큰 전체를 채워도 약 2GiB 수준이다(런타임 오버헤드 제외, 필자 계산).
3. Raon-mHC. DeepSeek의 manifold-constrained hyper-connections를 더 값싸게 만든 변형이라고 소개한다.

### 2.3 추론 강도 조절 방식

`max`를 제외한 단계는 체크포인트에 함께 들어 있는 스티어링 벡터로 구현된다. `max`만 스티어링 없이 동작한다. 모델 자체는 thinking 모드를 전제로 설계됐다.

---

## 3. 특징과 장점

1. 크기 대비 연산 효율. 28.8B 중 4.3B만 활성화하므로 토큰당 연산은 4B급 모델에 가깝고, 메모리에는 28.8B 전체가 올라간다. 즉 "빠르지만 가볍지는 않다"가 정확한 표현이다.
2. 긴 문맥의 메모리 비용이 낮다. KV 캐시가 7개 층에만 생기므로 문맥을 늘려도 메모리 증가가 완만하다. 동시 요청 수와 문맥 길이를 함께 늘려야 하는 서빙 환경에서 유리하다.
3. 한국어 구어체 대화. 내부 평가 Chatbot Korean 92.7로 비교군 최고다. 단, 비공개 내부 벤치마크다.
4. 긴 대화에서의 지시 유지. MultiChallenge 64.9로 해외 동급 6종을 모두 앞섰고, IFBench도 84.9로 Flint(88.4) 다음이다.
5. 환각 억제. AA-Omniscience에서 +1.0으로 비교군 중 유일하게 양수다. 이 지표는 틀린 답에 감점을 주므로, 모르는 것을 지어내지 않는 성향이 상대적으로 낫다는 뜻으로 읽을 수 있다.
6. 에이전트 과제. GDPVal 72.3, BrowseComp Plus 55.9로 동급 MoE 비교군 중 최고다.
7. 6단계 추론 강도. 요청 단위로 비용과 품질을 조절할 수 있다.
8. Apache 2.0. 가중치를 상업적으로 쓰고 수정·재배포할 수 있다.
9. 배포 경로가 넓다. 4개 런타임, 공식 양자화(MXFP8, NVFP4, GGUF 5종, MLX), DFlash2 추측 디코딩용 드래프트 모델까지 함께 제공한다.
10. 프리뷰 대비 개선 폭. MMLU Pro 76.5 → 82.7, MultiChallenge 59.0 → 64.9, GDPVal 66.0 → 72.3, AutomationBench 29.7 → 39.9, 수능 문항별 387.9 → 401.3.

---

## 4. 단점과 한계

1. 코딩·터미널 작업이 약하다. Terminal-Bench Lite 52.0은 비교군 공동 최하위이고(Inkling 2 Mini 77.0), SWE-Verified 71.0은 7개 중 5위, LiveCodeBench v6 81.7은 4위다. 코딩 에이전트의 주력 모델로 고르기는 어렵다.
2. 일반 지식 폭. MMLU Pro 82.7은 Flint만 앞서는 7개 중 6위다.
3. 장문 독해 품질. AA-LCR 70.7로 Inkling 2 Mini(80.7), Qwen3.8-27B(80.3), Muse Glimmer(81.3)에 약 10점 뒤진다. 선형 어텐션 덕에 긴 문맥을 "싸게" 담을 수는 있지만, 긴 문맥을 "잘" 읽는 것과는 별개라는 점을 구분해야 한다.
4. 함수 호출 정확도는 중간 수준. BFCL v4 61.6으로 Qwen3.8-27B(72.4), Gemma 4(65.8), Qwen3.6(64.7)보다 낮다. 에이전트 종합 과제 점수는 좋지만 도구 호출 스키마가 복잡한 워크플로는 검증이 필요하다.
5. 텍스트 전용. 비교군의 Qwen, Gemma 4, Inkling 2 Mini, Muse Glimmer는 이미지 입력을 지원한다. 문서·스크린샷 처리가 필요하면 별도 OCR/비전 파이프라인이 있어야 한다.
6. 여러 문항을 한 번에 주면 점수가 크게 떨어진다. 수능에서 문항별 401.3 대 영역별 일괄 371.8로 29.5점 차이가 난다. A.X K2(8.0점 차), Solar Mini 4.5 Preview(차이 거의 없음)에 비해 낙폭이 크다.
7. 런타임이 포크에 묶여 있다. vLLM은 `krafton-ai/vllm`의 `raon` 브랜치, llama.cpp는 `krafton-ai/llama.cpp`의 `raon-1-mini` 브랜치가 필요하고 업스트림 반영은 대기 중이다. 보안 패치와 버전 업을 크래프톤 포크 일정에 맞춰야 한다.
8. 소비자 GPU에서는 문맥이 줄어든다. 262K 문맥은 서버급 설정이고, RTX 5090 공식 프로파일은 32K다.
9. "가볍다"는 표현의 한계. 기본 체크포인트(MXFP8)는 32GB GPU에 온전히 올라가지 않아 CPU 오프로드가 필요하다.
10. 검증 공백. 양자화별(NVFP4, GGUF) 정확도 손실 수치가 없고, 벤치마크가 어느 체크포인트로 측정됐는지도 명시돼 있지 않다. 처리 속도(tok/s) 공식 수치도 없다. Chatbot Korean은 내부 벤치마크, AutomationBench는 공식 세트가 아닌 공개 스플릿, 채점 모델과 사용자 시뮬레이터는 gpt-5.6-luna다.
11. 정식 버전에서 내려간 지표도 있다. AA-Omniscience 3.5 → 1.0, Chatbot Korean 92.9 → 92.7.
12. 프리뷰 단계 커뮤니티 평가에서 출력 토큰 사용량이 많다는 지적이 있었다(프리뷰 기준이며 정식 버전에서 달라졌을 수 있다).

---

## 5. 한국 LLM과 비교: 2027학년도 수능

조건: 전체 시험 507문항 26개 영역, 450점 만점 환산(국어·수학·영어 각 100, 한국사 50, 사회·과학 합산 100). 텍스트 전용 부분집합은 318문항, 352.5점 만점. 라온-1 미니는 `high` 추론 강도로 측정. 방법론은 커뮤니티 공개 벤치마크(hehee9의 CSAT-benchmark)를 따랐다고 밝힌다.

| 모델 | 규모 | 전체: 영역별 일괄 | 전체: 문항별 | 텍스트: 영역별 일괄 | 텍스트: 문항별 |
|---|---|---|---|---|---|
| **라온-1 미니** | 30B-A4B | 371.8 | **401.3** | 324.4 | 336.2 |
| 라온-1 미니 프리뷰 | 30B-A4B | 361.4 | 387.9 | 312.2 | 335.6 |
| A.X K2 (SK텔레콤) | 688B-A33B | 391.7 | 399.7 | **336.4** | 342.1 |
| Solar Open 2 (업스테이지) | 250B-A15B | 328.0 | 400.1 | 263.7 | **345.2** |
| Solar Mini 4.5 Preview | 35B-A3B | **395.6** | 394.3 | 336.3 | 335.4 |
| K-EXAONE 2.0 (LG AI연구원) | 750B-A37B | 359.1 | 368.0 | 299.3 | 320.1 |
| Motif 3 | 314B-A13.2B | 249.1 | 326.2 | 204.0 | 284.4 |

굵은 글씨는 국내 모델 중 열별 최고점.

### 해석

1. "국내 1위"는 네 가지 측정 중 한 가지(전체 시험, 문항별)에서만 성립한다. 그 격차도 Solar Open 2와 1.2점, A.X K2와 1.6점으로 사실상 동률 구간이다.
2. 영역별 일괄 제시에서는 Solar Mini 4.5 Preview(395.6)와 A.X K2(391.7)에 20점 이상 뒤져 국내 6종 중 3위다.
3. 텍스트 전용 부분집합에서는 문항별·영역별 모두 3위다. 문항별은 Solar Open 2(345.2), A.X K2(342.1) 다음이다.
4. 효율 관점의 주장은 유효하다. 전체 파라미터 기준 A.X K2는 약 24배, K-EXAONE 2.0은 약 26배, Motif 3은 약 11배, Solar Open 2는 약 9배 크다. 그 크기 차이에도 문항별 점수가 같은 구간에 있다.
5. 공정한 동급 비교 대상은 Solar Mini 4.5 Preview(35B-A3B)다. 문항별은 라온이 7.0점 앞서고, 일괄 제시는 Solar Mini가 23.8점 앞선다. 한 문제씩 처리하는 워크로드는 라온, 한 프롬프트에 많은 항목을 넣는 워크로드는 Solar Mini 쪽이 유리하다는 신호다.
6. 수능은 한 해 시험 한 세트이므로 1~2점 차이에 순위 의미를 두기 어렵다. 반복 측정 편차는 공개돼 있지 않다.
7. 국내 모델 간 라이선스 조건은 모델마다 다르므로 상업 활용 전 각 모델 카드에서 직접 확인해야 한다. 라온-1 미니는 Apache 2.0이다.

---

## 6. 오픈웨이트 동급 모델과 비교

### 6.1 비교 대상

| 모델 | 개발사 | 구조 | 입력 |
|---|---|---|---|
| Qwen3.6-35B-A3B | 알리바바 | MoE | 텍스트 + 이미지 |
| Gemma 4 26B-A4B | 구글 | MoE | 텍스트 + 이미지 |
| Flint (40B-A2.5B) | Recursive | MoE, 코딩 에이전트 특화 | 텍스트 |
| Inkling 2 Mini (26.4B-A5.4B) | Thinking Machines Lab | 루프형 MoE | 텍스트 + 이미지 |
| Qwen3.8-27B | 알리바바 | Dense | 텍스트 + 이미지 |
| Muse Glimmer 30B | 메타 | Dense, 로컬 에이전트 특화 | 텍스트 + 이미지 |

모두 26B~40B급으로 라온-1 미니와 같은 체급이다. "더 큰 해외 모델"과의 비교가 아니라는 점에 유의한다.

### 6.2 벤치마크 전체 표

| 분류 | 벤치마크 | 라온-1 미니 | 프리뷰 | Qwen3.6 35B-A3B | Gemma 4 26B-A4B | Flint | Inkling 2 Mini | Qwen3.8 27B | Muse Glimmer 30B |
|---|---|---|---|---|---|---|---|---|---|
| 지식 | MMLU Pro | 82.7 | 76.5 | 85.9 | 82.9 | 77.7 | 83.5 | 85.7 | 84.0 |
| 지식 | AA-Omniscience | **1.0** | 3.5 | -7.2 | -46.6 | -45.0 | -0.3 | -0.5 | -34.7 |
| 추론 | GPQA Diamond | 86.0 | 84.3 | 83.2 | 80.7 | 70.8 | 86.6 | 89.7 | 82.6 |
| 추론 | AIME 2026 | 96.7 | 93.3 | 92.9 | 87.1 | 89.6 | 97.5 | 98.8 | 92.9 |
| 추론 | HMMT Feb 2026 | 87.1 | 84.1 | 84.5 | 79.9 | 76.9 | 88.6 | 95.8 | 74.6 |
| 지시·멀티턴 | IFBench | 84.9 | 84.2 | 66.6 | 80.9 | 88.4 | 77.0 | 82.4 | 78.7 |
| 지시·멀티턴 | MultiChallenge | **64.9** | 59.0 | 58.2 | 58.4 | 54.8 | 52.4 | 63.6 | 63.4 |
| 코딩 | LiveCodeBench v6 | 81.7 | 81.6 | 81.2 | 83.4 | 88.5 | 87.4 | 79.3 | 77.4 |
| 코딩 | SciCode | 41.3 | 38.7 | 35.6 | 39.6 | 33.7 | 43.8 | 44.6 | 43.6 |
| 코딩 | SWE-Verified | 71.0 | 70.8 | 63.2 | 61.6 | 76.0 | 74.2 | 74.6 | 72.0 |
| 코딩 | Terminal-Bench Lite | 52.0 | 47.0 | 63.3 | 52.0 | 57.3 | 77.0 | 67.0 | 70.7 |
| 에이전트 | GDPVal | 72.3 | 66.0 | 68.4 | 58.8 | 63.8 | 69.9 | 74.3 | 68.2 |
| 에이전트 | AutomationBench | 39.9 | 29.7 | 24.9 | 36.2 | 30.8 | 56.7 | 58.7 | 32.1 |
| 에이전트 | BrowseComp Plus | 55.9 | 55.7 | 34.8 | 32.2 | 49.2 | 48.3 | 58.0 | 52.8 |
| 에이전트 | BFCL v4 Overall | 61.6 | 59.8 | 64.7 | 65.8 | 51.5 | 58.7 | 72.4 | 51.8 |
| 긴 문맥 | AA-LCR | 70.7 | 67.3 | 69.3 | 67.0 | 65.7 | 80.7 | 80.3 | 81.3 |
| 긴 문맥 | GDP.pdf | 7.7 | 5.8 | 6.6 | 3.6 | 1.8 | 10.6 | 11.2 | 8.4 |
| 한국어 | Chatbot Korean (내부) | **92.7** | 92.9 | 74.5 | 90.6 | 66.5 | 81.9 | 90.1 | 87.0 |

각주: SWE-Verified는 mini-SWE-agent 하네스. GDPVal은 Elo가 아닌 judge 점수. AutomationBench는 공개 스플릿. GDP.pdf는 PDF를 사전 OCR한 텍스트 전용 버전. 굵은 글씨는 해외 6종 전체를 앞선 항목.

### 6.3 항목별 순위 (프리뷰 제외 7개 모델 기준, 필자 집계)

| 구분 | 벤치마크 | 순위 |
|---|---|---|
| 1위 | AA-Omniscience, MultiChallenge, Chatbot Korean | 3개 |
| 2위 | IFBench, GDPVal, BrowseComp Plus | 3개 |
| 3위 | GPQA Diamond, AIME 2026, HMMT, AutomationBench | 4개 |
| 4위 | LiveCodeBench, SciCode, BFCL v4, AA-LCR, GDP.pdf | 5개 |
| 5위 이하 | SWE-Verified(5위), MMLU Pro(6위), Terminal-Bench Lite(공동 최하위) | 3개 |

MoE 4종(Qwen3.6, Gemma 4, Flint, Inkling 2 Mini)으로 좁히면 18개 중 5개(AA-Omniscience, MultiChallenge, GDPVal, BrowseComp Plus, Chatbot Korean)에서 1위다.

### 6.4 해석

1. 가장 강한 종합 경쟁자는 Qwen3.8-27B(dense)다. 18개 중 13개에서 라온-1 미니를 앞선다. 라온이 이기는 것은 AA-Omniscience, IFBench, MultiChallenge, LiveCodeBench, Chatbot Korean이다. 다만 dense 27B는 토큰마다 27B 전부를 연산하므로 토큰당 연산량은 라온(4.3B 활성)이 훨씬 적다.
2. Inkling 2 Mini는 코딩·터미널·장문·자동화에서 크게 앞선다. 라온은 한국어, 지시 유지, 웹 검색형 과제에서 앞선다.
3. Flint는 코딩 지표와 IFBench만 강하고 지식·한국어는 크게 약하다. 용도가 겹치지 않는다.
4. Gemma 4 26B-A4B는 활성 파라미터가 같아 가장 직접적인 구조 비교 대상이다. 라온은 추론(GPQA, AIME, HMMT), 에이전트(GDPVal, BrowseComp Plus), SWE-Verified에서 앞서고 MMLU Pro, LiveCodeBench, BFCL에서 근소하게 뒤진다. Gemma 4는 한국어 대화 점수도 90.6으로 높고 이미지 입력이 된다.
5. 수능으로 보면 다른 그림이 나온다. 전체 시험 문항별에서 Muse Glimmer 423.4, Gemma 4 422.3, Qwen3.8-27B 421.2, Inkling 2 Mini 412.8로 해외 동급 4종이 라온(401.3)을 앞선다. 이들은 이미지 입력을 쓴다. 텍스트 전용 부분집합(문항별)으로 보면 Qwen3.8-27B 340.4, Muse Glimmer 338.5, 라온 336.2, Gemma 4 335.2, Inkling 2 Mini 329.8로 거의 같은 구간이다. 즉 전체 시험 격차의 상당 부분은 멀티모달 유무에서 나온다.

| 수능 (해외 동급) | 입력 | 전체: 영역별 | 전체: 문항별 | 텍스트: 영역별 | 텍스트: 문항별 |
|---|---|---|---|---|---|
| 라온-1 미니 | 텍스트 | 371.8 | 401.3 | 324.4 | 336.2 |
| Qwen3.6-35B-A3B | 텍스트 + 이미지 | 376.1 | 388.1 | 299.1 | 305.2 |
| Gemma 4 26B-A4B | 텍스트 + 이미지 | 392.3 | 422.3 | 318.5 | 335.2 |
| Flint | 텍스트 | 270.1 | 313.5 | 236.0 | 272.5 |
| Inkling 2 Mini | 텍스트 + 이미지 | 361.8 | 412.8 | 334.6 | 329.8 |
| Qwen3.8-27B | 텍스트 + 이미지 | 400.2 | 421.2 | 335.3 | 340.4 |
| Muse Glimmer 30B | 텍스트 + 이미지 | 396.7 | 423.4 | 252.7 | 338.5 |

---

## 7. 설치와 운용의 포인트

### 7.1 하드웨어별 경로 선택

| 환경 | 권장 경로 | 체크포인트 | 문맥 | 비고 |
|---|---|---|---|---|
| RTX 5090 (32GB) 1장 | vLLM 포크 | `KRAFTON/Raon-1-mini-nvfp4` | 32K | 공식 프로파일. 동시 8 시퀀스, KV 캐시 3GiB |
| 24GB GPU | llama.cpp 포크 | GGUF `Q4_K_M`(19.7GB) 또는 `IQ4_XS`(16.2GB) | 축소 필요 | 공식 프로파일 없음. 문맥을 줄여 직접 검증 |
| Apple silicon (32GB 이상 권장) | MLX 또는 llama.cpp 포크 | `KRAFTON/Raon-1-mini-mlx`(NVFP4 양자화) | 메모리에 맞춰 조정 | DFlash2 드래프트가 약 1GB 추가 |
| 서버급 GPU (NVIDIA B300 등) | vLLM 포크 | `KRAFTON/Raon-1-mini`(MXFP8) | 262,144 | 크래프톤이 테스트한 구성 |
| 32GB GPU + Transformers | Transformers | `KRAFTON/Raon-1-mini`(MXFP8) | - | `device_map="auto"`로 CPU 오프로드. 실험용 |

GGUF 파일 크기(공식 저장소 기준).

| 양자화 | 크기 |
|---|---|
| IQ4_XS | 16.2GB |
| Q4_K_M | 19.7GB |
| Q5_K_M | 22.2GB |
| Q6_K | 25.8GB |
| Q8_0 | 30.7GB |
| DFlash 드래프트 (Q8_0) | 733MB |

Q6_K 이하는 imatrix로 양자화됐고, BF16 가중치에서 변환됐다.

### 7.2 운용 체크리스트

1. 포크를 쓴다. vLLM과 llama.cpp 모두 크래프톤 포크 브랜치가 필요하다. Hugging Face의 "Use this model" 패널에는 Ollama, LM Studio, Docker Model Runner 명령이 자동 표시되지만, 모델 카드 본문은 업스트림 지원이 대기 중이라고 적고 있다. 이 도구들은 로드가 되는지 먼저 확인하고, 안 되면 포크 빌드로 간다.
2. 샘플링 값을 지킨다. temperature 1.0, top_p 0.95, top_k 20, min_p 0, repetition_penalty 1.0, frequency_penalty 0.
3. presence_penalty는 작업별로 다르다. 대화·요약·지식 질의·에이전트는 1.5, 코딩과 수학은 0. 하나의 서버로 두 용도를 다 받는다면 서버 기본값이 아니라 요청 단위로 지정한다.
4. 추론 강도를 라우팅한다. 단순 대화와 간단한 도구 호출은 `none`, 수학·코딩·다단계 에이전트 작업은 `high` 이상. 모델 카드는 후자에 `none`을 쓰지 말라고 권고한다. 허용되지 않은 값을 보내면 HTTP 400이 반환된다.
5. `max_tokens`를 넉넉히 준다. thinking 토큰이 출력 한도에 포함된다. 예제는 32,768을 쓴다. 답이 중간에 잘리면 한도를 올리거나 추론 강도를 낮춘다.
6. `truncate_history_thinking`은 `false`가 권장값이다.
7. 추측 디코딩을 켠다. 드래프트 모델 `KRAFTON/Raon-1-mini-dflash2`를 붙이면 속도가 오른다. 향상 폭은 하드웨어와 워크로드에 따라 달라지며 공식 수치는 없다.
8. vLLM 첫 기동은 커널 컴파일로 약 10분 걸린다. 장애가 아니다. 컨테이너 이미지로 운영한다면 컴파일 산출물을 이미지나 볼륨에 보존한다.
9. 여러 항목을 한 프롬프트에 몰아넣지 않는다. 수능 결과가 보여주듯 문항 단위로 쪼개 호출할 때 품질이 높다. 배치 처리는 프롬프트 병합이 아니라 동시 요청으로 한다.
10. `trust_remote_code=True`가 필요하다. Transformers와 MLX 경로는 저장소의 원격 코드를 실행한다. 운영 환경에서는 리비전(커밋 해시)을 고정하고, 격리된 환경에서 코드를 한 번 검토한 뒤 쓴다.
11. 서버 노출 범위. 예제는 모두 `127.0.0.1` 바인딩에 자리표시자 API 키를 쓴다. 외부에 열 때는 인증 계층과 리버스 프록시를 앞에 둔다.
12. 라이선스 경계. Apache 2.0은 저장소의 가중치와 설정 파일에 적용된다. 호스팅 API와 플레이그라운드는 별도의 Hosted Access Terms가 적용되고, 향후 과금 가능성이 약관에 포함돼 있다. 민감 데이터는 로컬 추론으로 처리하는 편이 안전하다.
13. 양자화 품질은 직접 잰다. NVFP4와 GGUF의 정확도 손실 수치가 공개돼 있지 않으므로, 자사 평가 세트로 MXFP8 대비 회귀 테스트를 돌린 뒤 양자화 수준을 결정한다.

---

## 8. Getting Started

### 8.0 사전 준비

```bash
pip install -U huggingface_hub
hf auth login        # 다운로드가 401/403으로 막히면 모델 페이지에서 접근 요청 후 재시도
```

프리뷰 저장소는 접근 요청(자동 승인)이 필요했다. 정식 저장소의 모델 카드에는 게이팅 언급이 없다.

가장 빨리 결과를 보려면 8.1(llama.cpp)로, RTX 5090에서 API 서버를 띄우려면 8.2로, Mac이면 8.5로 간다.

### 8.1 llama.cpp (GGUF) — 가장 간단한 로컬 실행

빌드.

```bash
git clone -b raon-1-mini https://github.com/krafton-ai/llama.cpp
cd llama.cpp
# Apple silicon에서는 -DGGML_CUDA=ON 을 뺀다.
# Windows는 Developer Command Prompt에서 -G Ninja 를 추가한다.
cmake -B build -DGGML_CUDA=ON -DLLAMA_BUILD_BORINGSSL=ON
cmake --build build --config Release -j
```

터미널 대화.

```bash
./build/bin/llama-cli \
    -hf KRAFTON/Raon-1-mini-gguf:Q4_K_M \
    --ctx-size 262144 \
    --n-predict 32768 \
    --temp 1.0 \
    --top-p 0.95 \
    --top-k 20 \
    --min-p 0.0 \
    --repeat-penalty 1.0 \
    --frequency-penalty 0.0 \
    --presence-penalty 1.5 \
    --reasoning on \
    --chat-template-kwargs '{
      "enable_thinking": true,
      "truncate_history_thinking": false
    }'
```

OpenAI 호환 서버.

```bash
./build/bin/llama-server \
    -hf KRAFTON/Raon-1-mini-gguf:Q4_K_M \
    --host 127.0.0.1 \
    --port 8000 \
    --alias Raon-1-mini \
    --ctx-size 262144 \
    --parallel 1 \
    --n-predict 32768 \
    --temp 1.0 \
    --top-p 0.95 \
    --top-k 20 \
    --min-p 0.0 \
    --repeat-penalty 1.0 \
    --frequency-penalty 0.0 \
    --presence-penalty 1.5 \
    --reasoning on \
    --chat-template-kwargs '{
      "enable_thinking": true,
      "truncate_history_thinking": false
    }'
```

조정 포인트.

- 메모리가 빠듯하면 `--ctx-size`를 32768이나 16384로 낮춘다.
- 코딩·수학은 `--presence-penalty 0`.
- 추론 강도: `--reasoning-effort low` 등. 서버에서는 강도를 지정하지 않은 요청의 기본값이 된다.
- thinking 끄기: `--reasoning off --reasoning-effort none` 과 함께 chat-template-kwargs의 `enable_thinking`을 `false`로.
- 추측 디코딩: 아래 세 줄을 명령 끝에 추가한다. 드래프트 모델은 자동으로 내려받는다.

```bash
    --spec-type draft-dflash \
    --spec-draft-n-max 7 \
    --spec-draft-sampling probabilistic
```

### 8.2 vLLM — RTX 5090 (32GB) 한 장

요구 사항: git, CUDA Toolkit 13(`nvcc`가 PATH에 있어야 함), gcc/g++.

```bash
VLLM_REF="raon"

uv venv --python 3.12
source .venv/bin/activate

VLLM_USE_PRECOMPILED=1 uv pip install \
    "vllm @ git+https://github.com/krafton-ai/vllm.git@${VLLM_REF}"
```

```bash
# WSL2에서만 필요
export VLLM_WSL2_ENABLE_PIN_MEMORY=1

vllm serve KRAFTON/Raon-1-mini-nvfp4 \
    --host 127.0.0.1 --port 8000 \
    --served-model-name Raon-1-mini \
    --max-model-len 32768 \
    --max-num-batched-tokens 2048 \
    --max-num-seqs 8 \
    --gpu-memory-utilization 0.85 \
    --kv-cache-dtype fp8_e4m3 \
    --kv-cache-memory 3221225472 \
    --enable-prefix-caching --async-scheduling \
    --spec-method dflash \
    --spec-model KRAFTON/Raon-1-mini-dflash2 \
    --spec-tokens 7 \
    --reasoning-parser raon_1 \
    --enable-auto-tool-choice --tool-call-parser raon_1 \
    --default-chat-template-kwargs '{"enable_thinking":true,"truncate_history_thinking":false}'
```

첫 기동은 커널 컴파일로 약 10분이 걸리고, 이후에는 재사용한다.

### 8.3 vLLM — 서버급 GPU, 262K 문맥

설치는 8.2와 같다. 아래 명령은 모델 카드가 제시한 핵심 플래그를 조합해 재구성한 것이므로, 실제 적용 전 모델 카드의 원문 명령과 대조한다.

```bash
vllm serve KRAFTON/Raon-1-mini \
    --host 127.0.0.1 --port 8000 \
    --served-model-name Raon-1-mini \
    --max-model-len 262144 \
    --kv-cache-dtype fp8_e4m3 \
    --enable-prefix-caching \
    --spec-method dflash \
    --spec-model KRAFTON/Raon-1-mini-dflash2 \
    --spec-tokens 7 \
    --reasoning-parser raon_1 \
    --enable-auto-tool-choice --tool-call-parser raon_1 \
    --default-chat-template-kwargs '{"enable_thinking":true,"truncate_history_thinking":false}'
```

### 8.4 Transformers — 파이썬에서 직접

```bash
uv venv --python 3.12 --seed
source .venv/bin/activate

pip install \
    "transformers==5.16.1" \
    "accelerate==1.15.0"
```

아래 코드는 모델 카드의 설명(로드 인자, 템플릿 인자, 추론 강도 메서드, `</think>` 분리)을 따라 작성한 것이다. 세부 인자는 모델 카드 예제와 대조한다.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "KRAFTON/Raon-1-mini"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,   # 저장소 원격 코드 실행. 운영에서는 revision 고정 권장
    dtype="auto",
    device_map="auto",        # 32GB GPU에서는 일부가 CPU로 오프로드된다
)

model.set_reasoning_effort("high")   # none / low / medium / high / xhigh / max

messages = [{"role": "user", "content": "라온-1 미니의 구조를 세 문장으로 설명해 줘."}]
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_dict=True,
    return_tensors="pt",
    enable_thinking=True,              # "none"을 쓸 때는 False로 함께 바꾼다
    truncate_history_thinking=False,
).to(model.device)

output = model.generate(
    **inputs,
    max_new_tokens=8192,
    do_sample=True,
    temperature=1.0,
    top_p=0.95,
    top_k=20,
)

text = tokenizer.decode(output[0][inputs["input_ids"].shape[-1]:])
reasoning, _, answer = text.rpartition("</think>")
print(answer.strip())
```

Transformers에는 presence penalty가 내장돼 있지 않아 모델의 원격 코드가 이를 적용한다.

### 8.5 MLX — Apple silicon

```bash
uv venv --python 3.12
source .venv/bin/activate

pip install "mlx==0.32.4" "mlx-lm==0.32.2" "transformers==5.20.1"

hf download KRAFTON/Raon-1-mini-mlx --local-dir Raon-1-mini-mlx
```

파이썬 API.

```python
from mlx_lm import load, generate

model, tokenizer = load("KRAFTON/Raon-1-mini-mlx")

messages = [{"role": "user", "content": "서울의 가을을 한 문단으로 묘사해 줘."}]
prompt = tokenizer.apply_chat_template(messages, add_generation_prompt=True)

text = generate(model, tokenizer, prompt=prompt, verbose=True)
```

OpenAI 호환 서버(프리뷰 저장소의 명령 형식을 정식 저장소 이름으로 바꾼 것).

```bash
python -m mlx_lm server \
    --model KRAFTON/Raon-1-mini-mlx \
    --trust-remote-code \
    --host 127.0.0.1 \
    --port 8000 \
    --max-tokens 32768 \
    --chat-template-args '{
      "enable_thinking": true,
      "truncate_history_thinking": false
    }'
```

MLX 경로의 선택 기준.

| 필요 기능 | 사용할 것 |
|---|---|
| 도구 호출 | `mlx_lm server` (`reasoning_effort`는 무시됨) |
| 추론 강도 조절, DFlash2 추측 디코딩 | 저장소에 포함된 `raon_mlx_model.py`의 `generate` / `serve` (`--reasoning-effort`, `--no-dflash`). 이 서버는 도구 호출 미지원 |

DFlash2 경로는 위에 고정한 `mlx` / `mlx-lm` 0.32.x 버전에서만 동작하고, 버전이 다르면 경고 후 드래프트 없이 생성한다. `raon_mlx_model.py`의 정확한 인자는 `--help`로 확인한다.

### 8.6 API 호출

서버(vLLM 또는 llama-server)가 `http://localhost:8000/v1`에 떠 있다고 가정한다.

```bash
curl http://localhost:8000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
      "model": "Raon-1-mini",
      "messages": [
        {"role": "user", "content": "크래프톤 AI에 대해 알려 줘."}
      ],
      "max_tokens": 32768,
      "temperature": 1.0,
      "top_p": 0.95,
      "top_k": 20,
      "min_p": 0.0,
      "repetition_penalty": 1.0,
      "frequency_penalty": 0.0,
      "presence_penalty": 1.5,
      "reasoning_effort": "high",
      "chat_template_kwargs": {
        "enable_thinking": true,
        "truncate_history_thinking": false
      }
    }'
```

파이썬(OpenAI SDK).

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

def ask(prompt: str, effort: str = "high", coding: bool = False) -> str:
    thinking = effort != "none"
    resp = client.chat.completions.create(
        model="Raon-1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=32768,
        temperature=1.0,
        top_p=0.95,
        frequency_penalty=0.0,
        presence_penalty=0.0 if coding else 1.5,
        reasoning_effort=effort,
        extra_body={
            "top_k": 20,
            "min_p": 0.0,
            "repetition_penalty": 1.0,
            "chat_template_kwargs": {
                "enable_thinking": thinking,
                "truncate_history_thinking": False,
            },
        },
    )
    return resp.choices[0].message.content

print(ask("안녕, 오늘 점심 메뉴 추천해 줘.", effort="none"))
print(ask("이진 탐색을 파이썬으로 구현해 줘.", effort="high", coding=True))
```

추론 강도를 지정하는 세 가지 방법.

| 방법 | 위치 |
|---|---|
| 최상위 필드 | `reasoning_effort` |
| 템플릿 인자 | `chat_template_kwargs.reasoning_effort` |
| Responses API | `reasoning.effort` |

### 8.7 도구 호출

vLLM은 `--enable-auto-tool-choice --tool-call-parser raon_1`과 `--reasoning-parser raon_1`을 켠 상태여야 한다. 요청 형식은 OpenAI 표준 `tools` 스키마를 그대로 쓴다.

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "도시의 현재 날씨를 조회한다.",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

resp = client.chat.completions.create(
    model="Raon-1-mini",
    messages=[{"role": "user", "content": "서울 날씨 어때?"}],
    tools=tools,
    tool_choice="auto",
    max_tokens=8192,
    presence_penalty=1.5,
    reasoning_effort="low",
    extra_body={"top_k": 20},
)
print(resp.choices[0].message.tool_calls)
```

BFCL v4 점수가 중간 수준이므로, 인자가 많은 도구나 중첩 스키마는 호출 결과를 검증(JSON 스키마 검증, 실패 시 재시도)하는 가드를 두는 편이 좋다.

### 8.8 에이전트 하네스 연결

모델 카드는 Hermes Agent(`~/.hermes/config.yaml`), Pi(`~/.pi/agent/models.json`), OpenCode(`opencode.json`) 설정 예시를 제공한다. 공통 값은 다음과 같다.

| 항목 | 값 |
|---|---|
| Base URL | `http://localhost:8000/v1` |
| Model ID | `Raon-1-mini` |
| API key | 자리표시자(임의 문자열) |
| Context window | 262,144 (백엔드 설정 이하로 맞출 것. RTX 5090 프로파일이면 32,768) |
| Max output | 32,768 |

### 8.9 문제 해결

| 증상 | 원인과 조치 |
|---|---|
| vLLM 첫 기동이 10분 가까이 멈춘 듯 보임 | 커널 컴파일 중. 정상 |
| `nvcc` 관련 빌드 오류 | CUDA Toolkit 13 설치 및 PATH 확인 |
| WSL2에서 로드 실패나 성능 저하 | `VLLM_WSL2_ENABLE_PIN_MEMORY=1` 설정 |
| 업스트림 llama.cpp / Ollama / LM Studio에서 모델 로드 실패 | 크래프톤 포크(`raon-1-mini` 브랜치) 빌드 사용 |
| `reasoning_effort` 요청에 HTTP 400 | 허용 값(none, low, medium, high, xhigh, max) 외의 값 전송 |
| 답변이 중간에 잘림 | thinking이 출력 토큰을 소진. `max_tokens` 상향 또는 강도 하향 |
| MLX에서 추론 강도가 먹지 않음 | `mlx_lm`은 무시함. `raon_mlx_model.py` 사용 |
| MLX에서 도구 호출이 안 됨 | `raon_mlx_model.py serve`는 미지원. `mlx_lm server` 사용 |
| 32GB GPU에서 OOM | 기본(MXFP8)이 아닌 NVFP4 체크포인트 사용, 문맥 32K, `--gpu-memory-utilization 0.85` |
| 코드·수식 출력이 어색하게 변형됨 | `presence_penalty`를 0으로 |
| 다운로드 401/403 | `hf auth login`, 필요 시 모델 페이지에서 접근 요청 |

---

## 9. 용도별 권고

| 용도 | 적합도 | 근거 |
|---|---|---|
| 한국어 고객 응대, 캐릭터·컴패니언 대화 | 높음 | Chatbot Korean, MultiChallenge, IFBench |
| 긴 대화에서 규칙·제약을 유지해야 하는 상담·업무 봇 | 높음 | MultiChallenge 비교군 1위 |
| 웹 검색·리서치형 에이전트 | 높음 | BrowseComp Plus, GDPVal |
| 환각 비용이 큰 지식 질의(RAG 결합 전제) | 중상 | AA-Omniscience 양수. 지식 폭 자체는 좁으므로 RAG 병행 |
| 온프레미스·망분리 환경의 한국어 범용 모델 | 중상 | Apache 2.0, 단일 GPU 구동. 포크 의존은 부담 |
| 수학·과학 추론 | 중 | 동급 3위권. Qwen3.8-27B와 Inkling 2 Mini가 우위 |
| 코딩 에이전트, 터미널 자동화 | 낮음 | Terminal-Bench Lite, SWE-Verified. Inkling 2 Mini, Flint, Qwen3.8-27B가 우위 |
| 수십만 토큰 문서의 정밀 독해 | 낮음 | AA-LCR. 문맥을 담는 비용은 싸지만 정확도는 동급 대비 낮음 |
| 이미지·스크린샷·PDF 원본 처리 | 불가 | 텍스트 전용 |

도입 판단을 위한 최소 검증 절차.

1. 자사 실제 대화 로그 100~200건으로 Gemma 4 26B-A4B, Qwen3.8-27B와 블라인드 비교.
2. 같은 세트를 MXFP8와 NVFP4(또는 Q4_K_M)로 돌려 양자화 회귀 확인.
3. 추론 강도별 지연 시간과 출력 토큰 수 측정 후 라우팅 규칙 확정.
4. 도구 호출 성공률을 자사 스키마로 별도 측정.

---

## 10. 첨부 초안 대비 정정 사항

| 초안 내용 | 확인 결과 |
|---|---|
| "더 큰 해외 모델에 비해 열위" | 비교 대상은 모두 26B~40B급 동급 모델이다. 체급 차이로 설명할 수 없다 |
| 4-bit 가중치 약 17.6GB, 권장 메모리 19~22GB | 공식 출처에서 확인되지 않는다. 공식 GGUF는 IQ4_XS 16.2GB, Q4_K_M 19.7GB이고 NVFP4 파일 크기는 모델 카드에 없다 |
| 국내 비교 표(4종) | 국내 비교 5종은 A.X K2, Solar Open 2, Solar Mini 4.5 Preview, K-EXAONE 2.0, Motif 3이다. Motif 3이 빠져 있었다 |
| 수능 "국내 1위" | 전체 시험 문항별 방식에서만 성립. 텍스트 전용 부분집합과 영역별 일괄 방식에서는 3위 |
| GDPVal, BrowseComp Plus "최고" | 동급 MoE 비교군 한정. dense인 Qwen3.8-27B가 두 항목 모두 더 높다(74.3, 58.0) |
| AIME 96.7 등 "경쟁력" | Qwen3.8-27B(98.8), Inkling 2 Mini(97.5)가 더 높아 동급 3위 |
| 한국어 구어체 92.7 | 비공개 내부 벤치마크이며 프리뷰(92.9)보다 소폭 낮다 |
| vLLM, llama.cpp "지원" | 두 런타임 모두 크래프톤 포크 브랜치가 필요하다 |
| 24GB GPU, 32GB Apple silicon 실행 가능 | 제3자 추정이다. 공식 프로파일은 RTX 5090 32GB(문맥 32K)와 B300뿐이다 |
| 활성 파라미터 | 모델 카드 기준 4.3B. 보도자료와 기사는 "약 40억 개"로 반올림 표기 |

---

## 11. 출처

- 크래프톤 보도자료, 「크래프톤, 독자 개발 고효율 LLM '라온-1 미니' 정식 출시」: https://www.krafton.com/news/press/
- Hugging Face 모델 카드: https://huggingface.co/KRAFTON/Raon-1-mini
- Hugging Face GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Hugging Face NVFP4: https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Hugging Face MLX: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- GitHub: https://github.com/krafton-ai/Raon-1-mini
- 프리뷰 모델 카드(구조 표, API 예시 형식): https://huggingface.co/KRAFTON/Raon-1-mini-preview
- 머니투데이, 「수능 401점 받은 크래프톤 AI」: https://www.mt.co.kr/amp/tech/2026/11/25/2026112515184181223
- 뉴시스(네이트 뉴스 전재): https://m.news.nate.com/view/20261125n22108
- ZDNet Korea: https://zdnet.co.kr/view/?no=20261125153804
- 디일렉: https://www.thelec.kr/news/articleView.html?idxno=65925
- 프리뷰 단계 커뮤니티 수능 평가(토큰 사용량 지적): https://arca.live/b/headline/186753751
- 비교 모델 정보: Thinking Machines Lab(Inkling 2 Mini) https://thinkingmachines.ai/news/inkling-2-mini/ , Meta(Muse Glimmer) https://developer.meta.com/ai/models/muse-glimmer/ , Recursive Flint 소개 https://www.marktechpost.com/2026/10/21/recursive-flint-local-coding-model/
