# DeepSeek's Hardware Optimization DNA — 칼럼 패키지

> **HFT에서 단련된 커널 엔지니어링과 미국 규제에 대한 중국의 대답**
> *Kernel Engineering Forged in HFT, and China's Answer to U.S. Sanctions*
> *HFT 锤炼出的内核工程,以及中国对美国制裁的回应*

발행: **2026년 4월 26일** | 저자: **Dennis Kim (김호광)**
GitHub: [github.com/gameworkerkim/vibe-investing](https://github.com/gameworkerkim/vibe-investing)

---

## 다운로드 / Downloads / 下载

| 언어 (Language) | Markdown | PDF | Word |
|---|---|---|---|
| 🇰🇷 **한국어** | [deepseek_column_ko.md](./deepseek_column_ko.md) | [deepseek_column_ko.pdf](./deepseek_column_ko.pdf) | [deepseek_column_ko.docx](./deepseek_column_ko.docx) |
| 🇺🇸 **English** | [deepseek_column_en.md](./deepseek_column_en.md) | [deepseek_column_en.pdf](./deepseek_column_en.pdf) | [deepseek_column_en.docx](./deepseek_column_en.docx) |
| 🇨🇳 **中文 (简体)** | [deepseek_column_zh.md](./deepseek_column_zh.md) | — | — |

---

## 한 줄 요약 / One-line Summary / 一句话总结

- **🇰🇷** 딥씨크 V4의 진짜 충격은 1.6조 파라미터가 아니라, 헤지펀드 출신 팀이 제재된 H800에서 시작한 "커널 최적화 문화"가 모델을 넘어 **DeepEP 같은 인프라 라이브러리까지 오픈소스화**하면서 화웨이 Ascend 위로 옮겨가고 있다는 점이다 — 미국의 칩 봉쇄가 이 속도로 무력화될 수 있는 이유.

- **🇺🇸** The real shock of DeepSeek V4 isn't its 1.6T parameters — it's that a hedge-fund-bred team's **"kernel-carving culture,"** forged on sanctioned H800s, has now graduated from open-sourcing models to **open-sourcing infrastructure libraries like DeepEP**, while migrating onto Huawei Ascend silicon. That's why U.S. chip sanctions can be neutralized faster than expected.

- **🇨🇳** DeepSeek V4 真正的冲击不是 1.6 万亿参数,而是这个出身对冲基金的团队,在被制裁的 H800 上锤炼出的 **"削内核文化"**,如今已从开源模型,升级到 **连 DeepEP 这样的基础设施库都开源**,并迁移到华为昇腾芯片上 —— 这就是美国芯片封锁会被快速中和的原因。

---

## 칼럼 구조 (8개 섹션)

| # | 섹션 | 핵심 내용 |
|---|---|---|
| 1 | **다시 딥씨크, 충격의 결이 다르다** | V4 (2026.04.24) — 화웨이 Ascend 우선 최적화의 정치적 의미 |
| 2 | **HFT의 유전자** | High-Flyer 헤지펀드 출신이 만든 "마이크로초 단위 비용 함수" 문화 |
| 3 | **오픈소스 인프라 패키지** | DeepEP / DeepGEMM / FlashMLA / DualPipe / 3FS — 수직 통합 도표 |
| 4 | **알고리즘-하드웨어 공동설계** | MLA, DSA, FP8 학습 — H800 제약을 알고리즘 입력값으로 |
| 5 | **[심층] DeepEP 해부** | CUDA → NVLink/RDMA → MoE all-to-all → Normal/Low-Latency 커널 → 훅 오버랩 → 생태계 |
| 6 | **미국 규제 응전 3단계** | ① 알고리즘으로 격차 메우기 ② 중국산 칩 이전 ③ 오픈소스 락인 |
| 7 | **한국 산업 시사점** | 비용 보틀랙, 수직 통합 깊이, 규제 종속도 — 세 가지 자문 |
| 8 | **결론** | "마지막 클럭 사이클"의 경쟁 — 인프라 커널까지 최적화하는 시대 |

---

## DeepEP 핵심 수치 (5장 심층)

공식 GitHub README 기준 — H800 + CX7 InfiniBand 400 Gb/s.

**Normal Kernel** — 학습/프리필 (4,096 토큰 배치)

| 통신 유형 | Dispatch #EP | 병목 대역폭 |
|---|---|---|
| Intranode | 8 | **153 GB/s** (NVLink, 이론치 160 GB/s의 96%) |
| Internode | 32 | **58 GB/s** (RDMA, 명목 50 GB/s 초과) |

**Low-Latency Kernel** — 추론 디코딩 (128 토큰 배치)

| Dispatch #EP | Latency | Combine #EP | Latency |
|---|---|---|---|
| 8 | **77 μs** | 8 | **114 μs** |
| 256 | **194 μs** | 256 | **360 μs** |

**핵심 메시지**: "전문가 수가 늘어도 사용자가 체감하는 지연은 거의 일정하다."

---

## 생태계 신호 — NVIDIA 락인을 풀고 있는 사람들

| 포크/브랜치 | 운영 주체 | 핵심 기여 |
|---|---|---|
| **Mori-EP** | AMD ROCm 공식 분기 | 비-NVIDIA GPU 지원 |
| **uccl-ep (UCCL)** | 커뮤니티 | NVIDIA·AMD GPU + EFA·Broadcom·CX7 NIC 이기종 지원 |
| **AntGroup-Opt** | 앤트그룹 네트워크플랫폼부 | SM-Free 시리즈 (PR #347, #483, #500) |
| **Hybrid-EP** | NVIDIA | TMA 명령어, NVFP4 데이터 타입 실험 |
| **Tencent (PR #130)** | 텐센트 네트워크플랫폼부 | 노멀 커널 최대 30% 향상 |
| **DeepXTrace** | 앤트그룹 | 느린 랭크 진단 분석 도구 |

---

## 라이선스 / License

- 본 칼럼: © 2026 Dennis Kim (김호광). All rights reserved.
- DeepEP, DeepSeek 모델 등 인용된 외부 자료: 각 원저작자의 라이선스(MIT 등)를 따름.
- 본 칼럼은 분석·평론 목적이며, **투자 자문 또는 법률 자문이 아닙니다**.

---

## 인용 출처 (Sources)

- [DeepSeek-AI / DeepEP — 공식 GitHub](https://github.com/deepseek-ai/DeepEP)
- [DeepSeek-V3 Technical Report (arXiv 2412.19437)](https://arxiv.org/pdf/2412.19437)
- Reuters / CNN / Bloomberg — DeepSeek V4 보도 (2026.04.24)
- Bain & Company — DeepSeek 효율성 분석
- 그 외 공개된 분석 자료

---

## Contact

문의/피드백: GitHub Issues 또는 이메일.

---

*"모델만 푸는 시대는 끝났다. 인프라 커널까지 최적화하는 시대다."*
*"The era of just open-sourcing models is over. We are in the era of open-sourcing infrastructure kernels."*
*"只发布模型的时代结束了。现在是连基础设施内核都要做最优化的时代。"*
