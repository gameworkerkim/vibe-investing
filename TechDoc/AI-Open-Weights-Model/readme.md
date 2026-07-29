
# Solar Open2, DeepSeek V4, KIMI K3 비교 분석

---

## 1. 한눈에 보는 스펙 비교

| 구분 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 출시일 | 2026-07-22 | 2026-04-24 | 2026-04-24 | 2026-07-16 (API) |
| 총 파라미터 | 250B | 284B | 1.6T | 2.8T |
| 활성 파라미터 | 15B | 13B | 49B | 약 50~60B (16/896 experts) |
| 컨텍스트 | 1M 토큰 | 1M 토큰 | 1M 토큰 | 1M 토큰 |
| 아키텍처 | Hybrid-Attention MoE (선형+softmax, NoPE) | CSA+HCA (희소 어텐션) | CSA+HCA (희소 어텐션) | KDA + AttnRes + Stable LatentMoE |
| 언어 | 한·영·일 | 다국어 | 다국어 | 다국어 + 네이티브 비전 |
| 라이선스 | Upstage Solar License (Apache 2.0 기반, 귀속 표시 필요) | MIT (가장 자유로움) | MIT | TBD (오픈웨이트 2026-07-27 예정) |
| 자가 호스팅 하드웨어 | 4xH200 (BF16) / 2xH200 (NVFP4) | 2xH200 / 4xA100 80GB | 8xH200 (클러스터) | 64+ 가속기 (슈퍼노드), 최소 약 1.4TB VRAM |
| API 가격 (입력/출력) | 업스테이지 API | $0.14/$0.28 /M | $0.435/$0.87 /M | $3.00/$15.00 /M |

---

## 2. 핵심 벤치마크 비교

### 2-1. 지식 및 추론

| 벤치마크 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| MMLU-Pro | 86.2 | 85.9 | 87.5 | — |
| GPQA-Diamond | 86.3 | 88.9 | 90.1 | 93.5 |
| HLE (no tools) | 28.8 | 32.3 | 37.7 | — |
| HMMT2602 | 93.9 | 94.7 | 95.2 | 94.3 |
| AIME2026 | 95.7 | 97.0 | — | — |

### 2-2. 코딩

| 벤치마크 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| LiveCodeBench | 92.4 | 92.3 | 93.5 | — |
| SWE-Bench Verified | 70.4 | 73.8 | 80.6 | 67.5 (DeepSWE) |
| SWE-Bench Pro | — | 76.2 | 76.2 | 81.2 (FrontierSWE) |
| Terminal-Bench 2.1 | — | — | — | 88.3 |
| Program Bench | — | — | — | 77.8 |

### 2-3. 에이전트 및 도구 사용

| 벤치마크 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| APEX-Agents | 16.6 (1위) | 13.2 | — | — |
| MCP-Atlas | 58.2 | 58.2 | 73.6 | 76.0 |
| GDPval-AA (Elo) | 1,128 | 1,187 | 1,554 | 1,687 |
| BrowseComp | — | — | 83.4 | 91.2 (1위) |
| Automation Bench | — | — | — | 30.8 (1위) |

### 2-4. 한국어 특화

| 벤치마크 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 한국 벤치마크 평균 | 85.4 (1위) | 84.9 | — | — |
| Ko-GDPval | 86.8 (1.6T Pro와 동등) | 85.0 | 86.9 | — |
| CLiCK (언어·문화) | 90.7 (1위) | — | — | — |
| KBank-MMLU | 80.8 (1위) | — | — | — |

---

## 3. 각 모델의 핵심 강점

### 3-1. Solar Open2: 한국어·일본어 특화, 에이전트 워크플로 최적화

- **하이브리드 어텐션**: 36개 선형 어텐션 + 12개 softmax 어텐션 조합으로 1M 컨텍스트를 전체 softmax 대비 1/4 메모리로 처리
- **NoPE (위치 인코딩 없음)**: 선형 어텐션의 순환 상태가 토큰 순서를 내재 인코딩하여 길이 외삽 한계 원천 제거
- **한국 토큰 효율**: 한국어 텍스트를 글로벌 모델 대비 24% 적은 토큰으로 처리 (4.41 bytes/token)
- **MOPD (Multi-teacher On-Policy Distillation)**: 12개 도메인 전문가를 하나로 통합
- **에이전트 특화**: APEX-Agents 1위, MCP-Atlas에서 Flash와 동점, IFBench 80.0
- **Ko-GDPval 86.8**: 1.6T DeepSeek-V4-Pro와 거의 동급 성능, 모델 크기는 1/6 수준

### 3-2. DeepSeek V4: 가장 균형 잡힌 오픈소스 프론티어

- **V4-Flash (284B/13B)**: 가장 가성비 좋은 자가호스팅 모델 — 2xH200으로 1M 컨텍스트 구동
- **V4-Pro (1.6T/49B)**: 오픈소스 최강 코딩·수학 성능 — SWE-Bench Verified 80.6%, LiveCodeBench 93.5%
- **MIT 라이선스**: 가장 자유로운 상업적 활용 — 수정·배포·상용화 제한 없음
- **토큰 단위 압축 + DSA**: 1M 컨텍스트를 V3.2 대비 9.5배 적은 메모리로 처리
- **Huawei Ascend NPU 기반 학습**: 미국 칩 의존도 탈피 — 지정학적 리스크 헤지

### 3-3. KIMI K3: 규모와 비전, 프론트엔드 코딩의 정점

- **2.8T 파라미터**: 오픈소스 최초 3조 급 모델 — 896 experts 중 16개만 활성화
- **네이티브 비전**: 텍스트+이미지 입력 지원
- **프론트엔드 코드 Arena #1**: 1,679 Elo로 Claude Fable 5(1,631) 앞선 성능
- **2.5x 스케일링 효율**: K2 대비 동일한 컴퓨팅으로 2.5배 성능 향상
- **GPU 메모리 현실**: MXFP4 기준 약 1.4~1.5TB — 일반 서버/워크스테이션 불가, 데이터센터급 클러스터 필수

---

## 4. 사용 시나리오별 추천

### 4-1. 시나리오 1: 한국어/일본어 기업 에이전트 (사무·법무·금융)

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| 추천도 | 5/5 | 3/5 | 2/5 |
| 핵심 근거 | Ko-GDPval 86.8 (Pro와 동등), 한국어 토큰 24% 절감, 한·영·일 공식 지원 | 다국어 일반 성능 우수 | 한국어 특화 데이터 없음 |

**결론**: 한국 기업이 자사 문서·법무·금융 워크플로우를 자동화하는 에이전트를 구축한다면 Solar Open2가 압도적입니다. 한국어 이해·생성에서 글로벌 모델+닫힌 API를 모두 제치고 1위이며, Ko-GDPval에서 1.6T급 Pro 모델과 동급 성능을 250B 크기로 달성했습니다.

---

### 4-2. 시나리오 2: 사내 자체 호스팅 코딩 에이전트

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 추천도 | 3/5 | 4/5 | 5/5 | 2/5 |
| 핵심 근거 | SWE-Bench 70.4, 4xH200 | SWE 73.8, 2xH200, MIT | SWE 80.6, 8xH200, MIT | SWE 한정, 하드웨어 벽 |

**결론**:

- **하드웨어 여유 충분 (8xH200+)**: DeepSeek V4-Pro — SWE-Bench 80.6%, 코딩·수학 전분야 최강
- **가성비·자가호스팅 중시 (2~4 GPU)**: DeepSeek V4-Flash — V4-Pro의 85~95% 성능을 1/5 비용으로
- **Solar Open2**는 에이전트 도구 호출(MCP-Atlas 58.2)에서 Flash와 동급이며 한국어 코딩 환경에서 강점

---

### 4-3. 시나리오 3: 프론트엔드·풀스택 개발 보조

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| 추천도 | 2/5 | 3/5 | 5/5 |
| 핵심 근거 | LiveCodeBench 92.4 | LiveCodeBench 93.5 | Frontend Code Arena #1 (1,679 Elo) (1위), Program Bench 77.8 |

**결론**: 프론트엔드 개발, 특히 React/Next.js 기반 UI 구축에서는 KIMI K3가 압도적 1위입니다. Arena.ai 프론트엔드 코드 리더보드에서 Claude Fable 5까지 제쳤습니다. 백엔드·풀스택 전반은 DeepSeek V4-Pro가 더 균형 잡혀 있습니다.

---

### 4-4. 시나리오 4: 초소형·예산형 셀프호스팅 (단일 GPU ~ 소수 GPU)

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 추천도 | 4/5 | 5/5 | 1/5 | 불가 |
| 핵심 근거 | INT4 양자화 2xH200 (136GB) | INT4 양자화 4xRTX 4090 (96GB) | 1TB+ VRAM 필요 | 1.4TB+ VRAM, 64+ 가속기 |

**결론**: 예산형 하드웨어에서의 자가호스팅은 DeepSeek V4-Flash (INT4)와 Solar Open2 (NVFP4 양자화)의 2파전입니다.

- **가장 저렴**: DeepSeek V4-Flash INT4 — 4xRTX 4090 (96GB 총 VRAM)으로 구동 가능
- **양자화 품질 보존**: Solar Open2 NVFP4 — Nota AI의 MoE 특화 양자화로 평균 벤치마크 하락 -0.22점에 불과

---

### 4-5. 시나리오 5: API 기반 프로덕션 (비용·속도 중시)

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 추천도 | 3/5 | 5/5 | 4/5 | 1/5 |
| 핵심 근거 | 업스테이지 API | $0.14/$0.28/M | $0.435/$0.87/M | $3.00/$15.00/M |

**결론**: API 사용 시 DeepSeek V4-Flash가 압도적 가성비입니다.

- V4-Flash: 월 5,000만 토큰 기준 약 $14 ~ 21/일 → 월 $420 ~ 630
- KIMI K3: 동일 기준 약 $315/일 → 월 $9,450 (약 15~20배 비쌈)
- V4-Pro: 중간 가격대, 최고 성능이 필요한 경우에만

---

### 4-6. 시나리오 6: 장기 연구·심층 지식 작업 (1M 컨텍스트 활용)

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| 추천도 | 4/5 | 4/5 | 5/5 |
| 핵심 근거 | 1M 컨텍스트, NoPE로 길이 외삽 무제한 | 1M 컨텍스트, CSA/HCA | 1M 컨텍스트 + 네이티브 비전 + BrowseComp 91.2 (1위) |

**결론**: 1M 컨텍스트를 활용한 대규모 문서 분석·리서치 에이전트는 세 모델 모두 가능하나, KIMI K3가 BrowseComp (91.2), DeepSearchQA F1 (95.0)에서 최고치를 기록했습니다. 단, API 비용이 높아 실제 운영은 DeepSeek V4-Flash나 Solar Open2가 더 실용적입니다.

---

### 4-7. 시나리오 7: 라이선스·상업적 자유도 최우선

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| 추천도 | 3/5 | 5/5 | 2/5 |
| 핵심 근거 | Solar License (Solar 표기·귀속 필수, 파생 모델 이름 제한) | MIT (제한 없음) | 라이선스 TBD, 오픈웨이트 2026-07-27 예정 |

**결론**: MIT 라이선스의 DeepSeek V4가 가장 자유롭습니다. 수정·재배포·상용화·파생 모델 제작에 법적 제한이 없습니다. Solar Open2는 Upstage Solar License로 "Built with Solar" 표시 및 파생 모델명 접두사 "Solar" 의무가 있어 기업 법무 검토가 필요합니다.

---

## 5. 최종 요약: 사용 목적별 모델 선택 가이드

| 사용 목적 | 추천 모델 |
|---|---|
| 한국어/일본어 기업 에이전트 | Solar Open2 |
| 코딩 에이전트 (최고 성능) | DeepSeek V4-Pro |
| 코딩 에이전트 (가성비 자가호스팅) | DeepSeek V4-Flash |
| 프론트엔드 특화 | KIMI K3 |
| 예산형 셀프호스팅 (단일/소수 GPU) | DeepSeek V4-Flash (INT4) |
| 가장 자유로운 라이선스 | DeepSeek V4 (MIT) |
| API 기반 저비용 프로덕션 | DeepSeek V4-Flash |
| 1M 컨텍스트 심층 리서치 | KIMI K3 (API) / Solar Open2 (셀프) |
| 데이터센터급 풀스케일 배포 | KIMI K3 / DeepSeek V4-Pro |

---

## 6. 핵심 인사이트

1. **Solar Open2는 "작지만 강한" 특화 모델** — 250B로 1.6T급 한국어 성능, 2xH200 양자화 구동, 에이전트 도구 호출 1위. 한국 기업과 한국 공공 기관에는 사실상 최적, 거의 유일 대안.

2. **DeepSeek V4는 "가장 범용적인 오픈소스"** — Flash는 가성비 셀프호스팅의 표준, Pro는 오픈소스 최강 코딩·수학 성능. MIT 라이선스로 상업적 자유도 최고.

3. **KIMI K3는 "규모의 프론티어"** — 2.8T로 오픈소스 최대 규모, 프론트엔드 코딩 Arena 1위, 네이티브 비전. 그러나 하드웨어 벽(64+ 가속기, 1.4TB+ VRAM)과 높은 API 비용($3/$15/M)이 단점이나 코딩 성능에서 모든 단점을 커버.
