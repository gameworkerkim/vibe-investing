# MedBridge AI (가칭) 사업 계획서 초안

> **AI × 동남아 의사 × 미국 원격 의료 + 원격 약국**
> Disruptive Telehealth for the Post-Shortage Era

- **문서 버전**: v1.0 (초안)
- **작성일**: 2026년 4월 25일
- **단계**: Seed / Pre-Seed 투자 유치용 검토 자료. / 사업 계획서 샘플

---

## 0. Executive Summary

미국 의료 시스템은 구조적 공급 부족, 만성적 비용 상승, 의사 소진율 급증이라는 3중 위기에 직면해 있다. HRSA는 2037년까지 약 **187,130명의 전일제(FTE) 의사 부족**을 전망하고 있으며([HRSA/AAMC](https://link.springer.com/article/10.1007/s11606-025-09575-7)), 미국 의사의 약 1/3은 주당 60시간 이상 근무해 일반 직장인(~5%) 대비 6배 높은 과로에 노출되어 있다([AMA Update](https://www.ama-assn.org/practice-management/physician-health/national-physician-burnout-study-latest-statistics-burnout)).

**MedBridge AI**는 세 가지 구조적 우위를 결합한 파괴적 원격 의료 플랫폼을 지향한다:

1. **AI 기반 1차 진단** — FDA 2026 CDS 가이던스 완화 흐름을 활용한 Non-Device CDS 설계로 규제 부담 최소화
2. **미국 면허 보유 동남아/아시아 의사 네트워크** — 인건비 60~80% 절감, 24/7 커버리지
3. **원격 약국 통합** — Amazon Pharmacy급 당일/익일 배송 파트너십으로 처방→배송 원스톱

2033년 미국 원격 의료 시장은 약 **$328.81B 규모(CAGR 19.8%)** 로 성장이 예상되며([Market Data Forecast](https://www.marketdataforecast.com/market-reports/united-states-telehealth-market)), 원격 진료비는 대면 대비 **평균 23% 저렴**([Penn Medicine OnDemand 연구, AJMC](https://www.pennmedicine.org/news/employee-telemed-visits-25-percent-less-costly-for-health-system))하다는 점에서 가격 경쟁력은 이미 증명되었다. 본 계획서는 이 시장 기회를 **규제 현실에 부합하는 하이브리드 모델**로 공략하는 로드맵을 제시한다.

---

## 1. 문제 정의 (Problem)

### 1.1 구조적 의사 부족
- HRSA는 2027년 124,180명 → 2032년 167,030명 → **2037년 187,130명**의 FTE 의사 부족을 예측 ([HRSA/AAMC 2024 보고](https://link.springer.com/article/10.1007/s11606-025-09575-7))
- AAMC는 2036년까지 **최대 86,000명 의사 부족**, 그 중 **일차 진료 20,200~40,400명** 부족 전망 ([AAMC](https://www.aamc.org/advocacy-policy/addressing-physician-workforce-shortage))
- HRSA는 **약 7,488개 의료 전문인력 부족 지역(HPSA)** 을 지정하고 있으며 7,400만 명이 영향을 받음

### 1.2 의료비 폭증 + 의사 소진
- 미국 원격 의료 시장 자체가 폭발적으로 성장 중: 2024년 $64.69B → 2025년 $77.50B → 2033년 $328.81B (CAGR 19.80%) ([Market Data Forecast](https://www.marketdataforecast.com/market-reports/united-states-telehealth-market))
- 2025년 기준 **미국 의사의 41.9%가 번아웃 증상**, 응급의학(49.8%), 비뇨기외과(49.5%), 종양내과(49.3%)는 50%에 육박 ([AMA 2025 Organizational Biopsy](https://www.ama-assn.org/practice-management/physician-health/physician-burnout-rate-continues-decline-falling-nearly-42))
- **미국 의사의 약 1/3이 주 60시간 이상 근무** (일반 직장인: 5%) ([AMA Update](https://www.ama-assn.org/practice-management/physician-health/national-physician-burnout-study-latest-statistics-burnout))

### 1.3 가격 투명성 부재
- Penn Medicine OnDemand는 원격 진료 **$380 vs 대면 $493** — 환자당 **$113, 23% 비용 절감** 입증 ([Penn Medicine](https://www.pennmedicine.org/news/employee-telemed-visits-25-percent-less-costly-for-health-system) / [AHA](https://www.aha.org/aha-center-health-innovation-market-scan/2023-06-20-penn-medicine-study-crunches-big-numbers-document-telemedicine-savings))
- 그러나 대부분의 DTC 원격 의료 기업은 여전히 **미국 면허 의사 인건비 구조**에 묶여 있음 — 진정한 파괴적 가격 혁신은 아직 도래하지 않음

---

## 2. 솔루션 (Solution)

### 2.1 3-Layer 진료 아키텍처

| 레이어 | 담당 | 핵심 기능 | 규제 상태 |
|---|---|---|---|
| **L1 – AI 트리아지** | Claude/GPT 기반 LLM + FDA-cleared 진단 디바이스 (TytoCare 수준) | 초기 문진, 사진/음성/웨어러블 분석, 1차 소견 | Non-Device CDS (2026 FDA 가이던스 [해설](https://www.faegredrinker.com/en/insights/publications/2026/1/key-updates-in-fdas-2026-general-wellness-and-clinical-decision-support-software-guidance)) |
| **L2 – 동남아 면허 의사** | IMLC 경로 또는 USMLE 취득한 필리핀/인도/말레이시아 의사 | AI 소견 검토, 처방 결정, 케이스 라우팅 | 환자 소재 주 면허 필수 ([IMLC](https://imlcc.com/)) |
| **L3 – 미국 면허 PA/NP 슈퍼바이저** | 복잡 케이스/긴급 케이스 전담 | 고위험 케이스 최종 서명, 주법 준수 | APRN Compact / 주별 라이선싱 |

### 2.2 제품 구성
1. **MedBridge 앱** — 환자 앱(iOS/Android) + 의사 대시보드(Web)
2. **MedBridge RX** — Amazon Pharmacy / PillPack / General Medicine 같은 원격 약국과 API 통합
3. **MedBridge AI Co-pilot** — HIPAA 준수 LLM 기반 진료 보조 (FDA Non-Device CDS 범위 내)
4. **Home Smart Clinic Kit (옵션)** — TytoCare급 홈 진단 디바이스 구독 ([TytoCare 사례](https://www.tytocare.com/))

### 2.3 FDA 규제 준수 설계
FDA는 **2026년 1월 6일** CDS 소프트웨어 가이던스를 개정해 "Non-Device CDS" 범위를 확대, 생성형 AI 포함 특정 소프트웨어가 의사의 "독립적 검토"가 가능한 경우 집행재량(enforcement discretion) 대상이 되도록 완화했다 ([Faegre Drinker 해설](https://www.faegredrinker.com/en/insights/publications/2026/1/key-updates-in-fdas-2026-general-wellness-and-clinical-decision-support-software-guidance), [Covington & Burling 해설](https://www.cov.com/en/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance), [Orrick 해설](https://www.orrick.com/en/Insights/2026/01/FDA-Eases-Oversight-for-AI-Enabled-Clinical-Decision-Support-Software-and-Wearables)).

MedBridge AI의 L1 AI는 **의사에게만 권고를 제공**하고, 근거를 투명하게 공개하며, 이미지 분석·연속 생체신호·시간 민감 판단은 제외함으로써 Non-Device CDS 4대 요건을 만족하도록 설계한다.

---

## 3. 시장 기회 (Market Opportunity)

### 3.1 시장 규모 (TAM / SAM / SOM)

| 구분 | 2025 | 2033 | CAGR | 출처 |
|---|---|---|---|---|
| 미국 원격 의료 TAM | $77.50B | $328.81B | 19.80% | [Market Data Forecast](https://www.marketdataforecast.com/market-reports/united-states-telehealth-market) |
| 글로벌 원격 의료 | $160.13B | $806.89B (2035) | 17.55% | [Precedence Research](https://www.precedenceresearch.com/telemedicine-market) |
| SAM (저-중 복잡도 1차 진료) | ~$25B | ~$100B | — | 추정 |
| SOM (5년 차 목표) | — | ~$500M | — | 추정 (SAM의 0.5%) |

### 3.2 비용 차익 (Cost Arbitrage) — 핵심 경쟁력

| 국가 | 의사 평균 연봉 | 미국 대비 | 출처 |
|---|---|---|---|
| 미국 | ~$316,000 | 1.0× | [World Population Review](https://worldpopulationreview.com/country-rankings/doctor-pay-by-country) |
| 태국 (경력 1~3년) | ~฿1,254,355 (~$35,000) | 0.11× | [ERI SalaryExpert – Thailand](https://www.salaryexpert.com/salary/job/doctor/thailand) |
| 필리핀 (Internal Medicine) | ~PHP 1,270,550 (~$22,000) | 0.07× | [ERI SalaryExpert – Philippines](https://www.erieri.com/salary/job/medical-doctor/philippines) |
| 필리핀 (온라인 진료) | PHP 50,000~150,000/월 | 0.04~0.11× | [Bossjob 리포트](https://bossjob.ph/blog/job-search-tips/7540/doctor-salary-philippines/) |

**핵심 인사이트**: 동일 자격 수준의 의사를 고용할 때 동남아 대비 미국은 **8~15배 인건비 프리미엄**을 지불한다. 이 갭은 USMLE를 통과한 의사에게도 여전히 5~8배 수준으로 유지된다.

### 3.3 비용 절감 효과 (검증)
- Penn Medicine OnDemand: 원격 **$380 vs 대면 $493**, **환자당 $113 절감** ([Penn Medicine](https://www.pennmedicine.org/news/employee-telemed-visits-25-percent-less-costly-for-health-system))
- TytoCare 통합 시 **ER 방문 평균 10.8~11.3% 감소**, 총 진료비 평균 **5~8.5% 감소** ([TytoCare](https://www.tytocare.com/news-and-press/tytocare-integrates-with-teladoc-health-to-augment-virtual-primary-and-urgent-care/))

---

## 4. 비즈니스 모델 (Business Model)

### 4.1 수익 구조
| 매출 라인 | 설명 | 예상 기여 비율 (Year 3) |
|---|---|---|
| **B2C 구독 (MedBridge Plus)** | 월 $9.99 무제한 메시지 + 할인 진료 | 30% |
| **페이-퍼-비짓 (B2C)** | 메시지 $19 / 영상 $29 (Amazon One Medical $29/$49 대비 50%↓) | 40% |
| **처방 마진 (RX)** | 약국 파트너 리베이트 + 자체 마진 | 20% |
| **B2B (고용주/보험사)** | 중소 고용주 대상 원격 의료 베네핏 패키지 | 10% |

**벤치마크**: Amazon One Medical은 **메시지 $29 / 영상 $49** 가격을 책정 ([Pharmaphorum](https://pharmaphorum.com/news/amazon-bundles-its-telehealth-services-under-one-brand)). MedBridge는 인건비 우위로 이 가격을 **반값 수준**으로 공격 가능.

### 4.2 Unit Economics (가설, Year 3 목표)
- ARPU (페이-퍼-비짓 이용자): $150/년
- ARPU (구독자): $120/년
- 의사 1인당 월 처리 진료 수: AI 보조 시 800~1,200건 (업계 평균 ~400건 대비 2~3×)
- 진료당 의사 변동 인건비: $6~10 (미국 $60~80 대비 80~90% ↓)
- 목표 Gross Margin: 55~65%

---

## 5. 경쟁 구도 (Competitive Landscape)

### 5.1 직접 경쟁사

| 기업 | 2024/25 재무 | 전략 | 취약점 |
|---|---|---|---|
| **Amazon One Medical** | 3.9B 인수 ([CNN Business](https://www.cnn.com/2023/02/22/tech/ftc-amazon-one-medical-deal)), 150+ 오프라인 ([Pharmaphorum](https://pharmaphorum.com/news/amazon-bundles-its-telehealth-services-under-one-brand)) | 하이브리드 + 약국 통합 | 美 면허 의사 고용 고비용 구조 |
| **Hims & Hers** | 2025 매출 **$2.35B (+59% YoY)**, 구독자 **2.5M+** ([Q4 2025 Report](https://www.gurufocus.com/news/8644287/hims-hers-health-hims-achieves-strong-revenue-growth-in-q4-2025)) | DTC 구독, 특화 세그먼트 | 범용 의료 커버리지 약함 |
| **Teladoc Health** | 2025 매출 **$2,530.0M (-2%)**, 순손실 **$200.3M** ([Teladoc 2025 실적](https://ir.teladochealth.com/news-and-events/investor-news/press-release-details/2026/Teladoc-Health-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx)) | B2B, 17.1M visits/yr ([10-K](https://www.stocktitan.net/sec-filings/TDOC/10-k-teladoc-health-inc-files-annual-report-affeb2a15834.html)) | 레거시, Medicare 축소 리스크 |
| **General Medicine** | 2025 5월 **$32M 시드 조달 (Matrix 주도)** ([Fortune](https://fortune.com/article/general-medicine-startup-pillpack-founders-raise/)) | 헬스케어 마켓플레이스, 35+ 전문과 | 단순 마켓플레이스, 진료 품질 통제 한계 |

### 5.2 간접 경쟁 / 생태계

| 플레이어 | 영향 | 참고 |
|---|---|---|
| **CVS MinuteClinic + Walgreens VillageMD** | VillageMD 680개 클리닉 + 2,000+ PCP ([Healthcare Huddle](https://www.healthcarehuddle.com/p/walgreens-villagemd-closures)) | 오프라인 하이브리드 경쟁자, 다만 VillageMD 재무 악화 |
| **TytoCare** | TIME 2025 최고 발명품 — AI 폐음 진단 Suite FDA 승인 ([TIME](https://time.com/collections/best-inventions-special-mentions/7320862/tytocare-ai-respiratory-suite/)), Teladoc 2026 통합 ([보도자료](https://www.tytocare.com/news-and-press/tytocare-integrates-with-teladoc-health-to-augment-virtual-primary-and-urgent-care/)) | **파트너십 후보** (경쟁 아님) |
| **PathAI / Nanox AI** | FDA 승인 AI 진단 플랫폼 | 기술 파트너십 가능 |

### 5.3 차별화 포지션 (Positioning Map)

```
            낮은 가격 ($)
                │
     MedBridge AI ●
                │   ● General Medicine
                │
좁은 특화 ────────┼──────── 광범위 커버
                │
    ● Hims/Hers │   ● Amazon One Medical
                │   ● Teladoc
            높은 가격 ($$$)
```

---

## 6. 규제 리스크 매트릭스 (Regulatory Risk Matrix)

### 6.1 핵심 장벽

#### 🚨 **주별 의사 면허 (가장 심각한 장벽)**
- 원칙: **환자가 위치한 주의 면허가 필요** — IMLC는 미국 내 주간 이동만 지원 ([IMLCC](https://imlcc.com/))
- 현재 **43개 주 + DC + Guam**이 IMLC 회원 ([CompHealth](https://comphealth.com/resources/interstate-medical-licensure-compact))
- 평균 처리 기간: **19일**, 51%가 1주 내 발급 ([PracticeSeeker](https://practiceseeker.com/resources/interstate-medical-licensure-compact-what-it-means-for-you))
- **해외 의사는 직접 적용 불가**, GME가 ACGME/AOA 인증이 아닌 경우 자격 없음
- **우회 전략**: USMLE 통과 + ACGME 수련 수료 + IMLC 가입주를 SPL로 설정한 동남아 출신 의사 채용

#### 🚨 **AI 진단 규제 (FDA)**
- 2026년 1월 6일 FDA는 CDS 가이던스 개정, **"Non-Device CDS" 범위 확대** ([FDA 공식 발표 해설](https://www.acr.org/News-and-Publications/2026/fda-updates-guidance-on-clinical-decision-support))
- 다만 **의료 영상 분석, 연속 생체신호 패턴 분석, 시간 민감 결정은 여전히 기기 규제 대상** ([Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software))
- **환자 대면 AI(심볼 체커, 챗봇)는 여전히 기기로 분류** ([Ketryx 해설](https://www.ketryx.com/blog/understanding-the-fdas-2026-clinical-decision-support-software-guidance-what-medical-device-companies-need-to-know))
- **우회 전략**: AI는 HCP(의사) 대면으로만 출력, 투명한 로직 공개, 이미지 분석 기능은 별도 FDA 510(k) 승인 경로

### 6.2 리스크 요약표

| 리스크 | 심각도 | 확률 | 완화 전략 |
|---|---|---|---|
| 해외 의사 면허 불인정 | ★★★★★ | 높음 | USMLE/ACGME 통과 해외 출신 의사만 채용 (Fellowship Pool) |
| AI 진단 기기 재분류 | ★★★★☆ | 중간 | Non-Device CDS 4대 요건 엄수, 법무 자문 상시 |
| Medicare 원격 수가 축소 | ★★★☆☆ | 중간 | B2C 및 자가지불 시장 중심 전략 |
| HIPAA 해외 서버 이슈 | ★★★☆☆ | 낮음 | AWS/Azure US 리전, BAA 체결 |
| 언어/문화 장벽 | ★★☆☆☆ | 낮음 | 필리핀/인도 출신 의사(영어 모국어 수준) 우선 |
| 의료 사고 책임 | ★★★★☆ | 중간 | Medical Malpractice + E&O + Cyber Liability 삼중 보험 |

---

## 7. Go-to-Market 로드맵

### Phase 1 (2026 H2 – 2027): 프로토타입 & 규제 검증
- IMLC 가입주 중 **5개 주(FL, TX, CO, AZ, GA)** 에서 파일럿
- USMLE 통과 필리핀/인도 출신 의사 10~20명 채용 (전원 미국 면허 보유)
- AI L1 MVP 구축 (Anthropic Claude API 기반 + RAG 의학 지식베이스)
- Amazon Pharmacy 또는 독립 약국 네트워크와 LOI 체결
- FDA Pre-Submission 미팅 신청

### Phase 2 (2027 – 2028): 확장 & FDA 전략
- 주 커버리지 **15 → 30**
- B2B 파일럿: 중소 고용주(50~500명) 타겟
- FDA Non-Device CDS 공식 문서화 완료
- 시리즈 A (목표 $30~50M)

### Phase 3 (2029 – 2030): 파괴적 스케일
- 50개 주 커버리지
- Home Smart Clinic Kit 구독 런칭
- 자체 FDA 510(k) 승인 AI 진단 모듈 출시
- 시리즈 B (목표 $100M+)

---

## 8. 팀 구성 & 투자 요청

### 8.1 필수 채용
- **CEO**: 디지털 헬스/크립토 시장 동시 경험 보유 (Betalabs / Web3Paper 네트워크 활용 가능)
- **Chief Medical Officer (CMO)**: 미국 면허 + 원격의료 경험 필수
- **VP Regulatory Affairs**: FDA CDS 및 HIPAA 전문
- **VP International Recruiting**: 필리핀/인도 USMLE 의사 풀 확보
- **Head of AI/ML**: LLM + 의학 온톨로지 통합 경험

### 8.2 투자 요청 (Seed)
- **금액**: $3~5M
- **용도**:
  - AI 엔지니어링 (40%)
  - 규제 자문 및 FDA 프리-서브미션 (20%)
  - 의사 채용/면허 취득 지원 (15%)
  - 파일럿 진료비/운영비 (15%)
  - 마케팅/GTM (10%)
- **핵심 KPI (18개월)**:
  - 파일럿 주 5개 오픈
  - 완료 진료 10,000건
  - NPS 60+
  - 진료당 변동 비용 $15 이하

---

## 9. 시나리오 플래닝

### 시나리오 A – 낙관적 (확률 25%)
- FDA가 2027년 Non-Device CDS 범위를 환자 대면까지 확대
- IMLC가 일부 해외 수련의까지 확장
- 시장 점유율 2030년 2~3% 달성, ARR $300M

### 시나리오 B – 기본 (확률 55%)
- 규제 현상 유지, 하이브리드 모델 성공
- ARR $100~150M, Series B 후 전략적 인수 논의

### 시나리오 C – 비관적 (확률 20%)
- Medicare 원격 수가 대폭 축소 + Amazon 공격적 가격 덤핑
- 특화 세그먼트(여성 건강, 만성질환)로 피벗

### 경쟁사 반응 예상
| 경쟁사 | 예상 반응 | 시점 |
|---|---|---|
| Amazon One Medical | **자본력 기반 카피캣** (인도/필리핀 미국 면허 의사 센터) | 18~24개월 내 |
| Hims & Hers | 특화 세그먼트 방어 (구독 충성도) | 방어적 |
| Teladoc | B2B 관계 활용한 "인증 미국 의사" 조건 강화 | 즉각적 |
| General Medicine | $32M 시드로 유사 모델 시도 | 12~18개월 내 |

---

## 10. 결론

| 평가 항목 | 등급 | 근거 |
|---|---|---|
| 시장 기회 | **S** | 2033년 $328B 시장, CAGR 19.8% |
| 비용 경쟁력 | **S** | 미국 대비 1/8 ~ 1/15 인건비 |
| 규제 장벽 | **A+ (높음)** | 주별 면허, FDA AI 규제 |
| 실현 가능성 | **A-** | USMLE + IMLC 경로로 우회 가능, 하이브리드 구조 |
| 투자 유치력 | **A** | General Medicine $32M 사례 + Amazon/PillPack 내러티브 |

**최종 평가**: "완전한 美 의사 대체"는 불가능하지만, **"AI 80~90% + USMLE 통과 해외 출신 의사 10~20% + 원격 약국 통합"** 의 하이브리드 모델은 매우 파괴적이다. FDA의 2026년 CDS 완화와 IMLC의 점진적 확장 흐름은 이 모델에 우호적인 규제 환경을 제공한다. 2027~2028년 프로토타입, 2029~2030년 본격 파괴 가능.

---

## 부록 A — 핵심 참고문헌 (References)

### 시장 데이터
1. Market Data Forecast — [U.S. Telehealth Market Report (2025–2033)](https://www.marketdataforecast.com/market-reports/united-states-telehealth-market)
2. Precedence Research — [Telemedicine Market Report (2026–2035)](https://www.precedenceresearch.com/telemedicine-market)
3. IMARC Group — [Telemedicine Market 2025–2033](https://www.imarcgroup.com/telemedicine-market)

### 의사 부족 & 번아웃
4. HRSA / AAMC — [The National Physician Shortage, JGIM 2025](https://link.springer.com/article/10.1007/s11606-025-09575-7)
5. AAMC — [Addressing the Physician Workforce Shortage](https://www.aamc.org/advocacy-policy/addressing-physician-workforce-shortage)
6. AMA — [Physician Burnout Rate 2025](https://www.ama-assn.org/practice-management/physician-health/physician-burnout-rate-continues-decline-falling-nearly-42)
7. AMA — [National Physician Burnout Study](https://www.ama-assn.org/practice-management/physician-health/national-physician-burnout-study-latest-statistics-burnout)

### 원격 의료 비용 절감
8. Penn Medicine — [OnDemand 23% Cost Savings Study (AJMC)](https://www.pennmedicine.org/news/employee-telemed-visits-25-percent-less-costly-for-health-system)
9. AHA — [Penn Medicine Study Analysis](https://www.aha.org/aha-center-health-innovation-market-scan/2023-06-20-penn-medicine-study-crunches-big-numbers-document-telemedicine-savings)

### 의사 임금 비교
10. World Population Review — [Doctor Pay by Country 2026](https://worldpopulationreview.com/country-rankings/doctor-pay-by-country)
11. ERI SalaryExpert — [Thailand Doctor Salary](https://www.salaryexpert.com/salary/job/doctor/thailand)
12. ERI SalaryExpert — [Philippines Medical Doctor Salary](https://www.erieri.com/salary/job/medical-doctor/philippines)

### FDA 규제 (2026 CDS Guidance)
13. Faegre Drinker — [Key Updates in FDA's 2026 CDS Guidance](https://www.faegredrinker.com/en/insights/publications/2026/1/key-updates-in-fdas-2026-general-wellness-and-clinical-decision-support-software-guidance)
14. Covington & Burling — [5 Key Takeaways from FDA's 2026 CDS Guidance](https://www.cov.com/en/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance)
15. Arnold & Porter — [FDA Cuts Red Tape on CDS and Wearables](https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software)
16. Orrick — [FDA Eases Oversight for AI-Enabled CDS](https://www.orrick.com/en/Insights/2026/01/FDA-Eases-Oversight-for-AI-Enabled-Clinical-Decision-Support-Software-and-Wearables)
17. Ketryx — [Understanding the FDA's 2026 CDS Guidance](https://www.ketryx.com/blog/understanding-the-fdas-2026-clinical-decision-support-software-guidance-what-medical-device-companies-need-to-know)

### 면허 규제
18. IMLCC — [Interstate Medical Licensure Compact Official Site](https://imlcc.com/)
19. CompHealth — [IMLC States List and Guide 2026](https://comphealth.com/resources/interstate-medical-licensure-compact)
20. PracticeSeeker — [IMLC What It Means for You](https://practiceseeker.com/resources/interstate-medical-licensure-compact-what-it-means-for-you)

### 경쟁사 분석
21. Teladoc Health — [Q4 & Full Year 2025 Results](https://ir.teladochealth.com/news-and-events/investor-news/press-release-details/2026/Teladoc-Health-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx)
22. Teladoc Health — [2025 10-K SEC Filing](https://www.stocktitan.net/sec-filings/TDOC/10-k-teladoc-health-inc-files-annual-report-affeb2a15834.html)
23. Hims & Hers — [Q4 2025 Revenue $618M, Full Year $2.35B](https://www.gurufocus.com/news/8644287/hims-hers-health-hims-achieves-strong-revenue-growth-in-q4-2025)
24. Fortune — [General Medicine $32M Seed Round](https://fortune.com/article/general-medicine-startup-pillpack-founders-raise/)
25. CNN Business — [Amazon closes $3.9B One Medical deal](https://www.cnn.com/2023/02/22/tech/ftc-amazon-one-medical-deal)
26. Pharmaphorum — [Amazon One Medical Pricing Strategy](https://pharmaphorum.com/news/amazon-bundles-its-telehealth-services-under-one-brand)
27. Healthcare Huddle — [Walgreens VillageMD Closures Analysis](https://www.healthcarehuddle.com/p/walgreens-villagemd-closures)

### AI 의료 디바이스 (파트너십 후보)
28. TIME — [TytoCare AI Respiratory Suite Best Invention 2025](https://time.com/collections/best-inventions-special-mentions/7320862/tytocare-ai-respiratory-suite/)
29. TytoCare — [Teladoc Integration Announcement 2026](https://www.tytocare.com/news-and-press/tytocare-integrates-with-teladoc-health-to-augment-virtual-primary-and-urgent-care/)

---

> **Disclaimer**: 본 문서는 아이디어 검증 단계의 사업 계획 초안이며, 실제 실행 시 미국 변호사(의료법/FDA/이민), 의료 과실 보험 중개인, 세무/회계 전문가의 자문이 필수적이다. 본 문서에 기재된 수치·예측은 공개된 시장 조사 자료에 근거하나 2026년 4월 시점의 추정치이며, 실제 결과는 규제·시장 변동에 따라 크게 달라질 수 있다.
