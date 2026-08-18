<!--

---
title: "중국은 지금 '정부용 윈도우'를 지우고 있다"
subtitle: "CMIT판 Windows 10 조기 폐기가 말해주는 것 — 미중 기술전쟁의 다음 국면"
description: "2026년 8월 중국 국가안전부가 정부 전용 Windows 10(CMIT판) 조기 제거를 지시한 블룸버그 보도. 2017년 MS-CETC 합작의 실패, 신창 조달, 기린·UOS 대체와 미중 스택 분기를 정리한다."
abstract: |
  2026-08-18 Bloomberg: MSS instructed some state-linked entities to remove Windows 10 China Government Edition (CMIT) months ahead of the Feb 2027 sunset.
  CMIT (2016, MS 49% / CETC 51%) was a managed-dependence compromise: no OneDrive, domestic updates, China-controlled telemetry, optional national crypto.
  The 2025-10 Windows 10 EOS left CMIT as the last allowed Windows in Chinese government procurement. July 2026 central laptop awards were already all domestic OS.
  This is sovereign-stack cleanup, not a consumer market share war (Windows still ~88% of China desktop traffic). MSFT China revenue impact is small; Xinchuang OS names hit limit-up.
  Admiralty-coded claims; MSS order itself is B2 (Bloomberg anonymous sources, no official confirmation). Not investment advice.
summary_for_ai: |
  Opinion/geotech column (not investment advice), as of 2026-08-18.
  Thesis: China's early removal of CMIT Windows 10 Government Edition ends a 9-year managed-dependence bargain, not merely an OS refresh.
  Fact core: Bloomberg 2026-08-18; CMIT = Microsoft 49% / CETC 51% JV (2016); product announced 2017-05-23 (Terry Myerson blog); Windows 10 global EOS 2025-10; planned CMIT sunset 2027-02, pulled forward.
  Xinchuang timeline 2014–2026; July 2026 central agency notebook awards all domestic OS.
  Consumer vs state split: StatCounter Jul 2026 China desktop Windows 87.64% (Win10 43.56% / Win11 50.01%).
  Watch: official MSS confirmation (absent); scope ("some" agencies); Kylin/UOS/HarmonyOS 5 procurement; US mirror logic (Huawei/ZTE/TikTok/FCC robots).
  Do not claim a proven Windows backdoor. Admiralty grades in section 6. Not a stock tip.
date: 2026-08-18
updated: 2026-08-18
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - Windows10
  - CMIT
  - 중국
  - 신창
  - 미중기술전쟁
  - 마이크로소프트
keywords:
  - "Windows 10 China Government Edition"
  - "CMIT"
  - "신창"
  - "기린 V10"
  - "UOS"
  - "CETC"
  - "MSS"
  - "Windows 10 지원종료"
group: security
featured: true
featured_rank: 0
schema_type: TechArticle
draft: false
robots: index,follow
---
-->
# 중국은 지금 '정부용 윈도우'를 지우고 있다

## CMIT판 Windows 10 조기 폐기가 말해주는 것 — 미중 기술전쟁의 다음 국면

*2026년 8월 18일 | Vibe Quant Insight*

---

## 1. 시작하는 말 - 9년짜리 타협의 종료

2026년 8월 18일, 블룸버그는 중국 국가안전부(MSS, 国家安全部)가 일부 국가 연계 기관에 **정부 전용으로 커스터마이즈된 Windows 10을 컴퓨터에서 제거하라고 지시했다**고 보도했다. 사안의 민감성 때문에 익명을 요구한 복수의 소식통을 인용한 보도다.

이 소프트웨어는 일반 Windows 10이 아니다. 마이크로소프트와 중국전자과기집단(CETC)이 세운 합작사 **C&M Information Technologies(CMIT)** 가 개발한 `Windows 10 China Government Edition`, 통칭 **CMIT판**이다. 당초 폐기 예정일은 **2027년 2월**이었다. 이번 지시로 그 일정이 수 개월 앞당겨졌다.

핵심은 "낡은 OS를 교체한다"가 아니다. **미국 기술을 중국식으로 개조해서라도 쓰겠다던 9년짜리 타협 자체가 끝나가고 있다**는 것이다.

---

## 2. 주요 특징으로 보는 CMIT판의 특징

CMIT판을 이해하지 못하면 이 뉴스의 의미를 이해할 수 없다. 중국 정부는 윈도우8.x의 클라우드 기능에 경계감을 감추지 못했다. 클라우드 서버가 역외 IDC에 존재한다는 것과 이 데이터가 미국 정부가 볼 수 있다는 우려였다. 2017년 5월 23일 상하이에서 마이크로소프트가 공식 발표한 이 제품은, 단순한 지역화 버전이 아니라 **주권과 상용성의 협상 결과물**이었다.

마이크로소프트는 핵심 커널을 제외하고 상당한 수준의 소스 코드를 중국 정부에 제공하여 보안 검수를 했고, 많은 기능을 삭제했다.

### 2.1 제국의 조공처럼 보이는 지배구조 - 소수지분 마이크로소프트

| 항목 | 내용 |
|---|---|
| 합작사명 | C&M Information Technologies Co. (中电科技·CMIT) |
| 설립 | 2016년 |
| 지분 | 마이크로소프트 49% : CETC 51% — **중국 측 과반** |
| 초대 CEO | Beth Xu |
| 배경 | 2014년 중국 정부 조달에서 Windows 8 금지 → 2년간의 국가 보안 심사 |

마이크로소프트가 49%라는 소수지분에 머물렀다는 점이 결정적이다. 제품의 통제권은 처음부터 중국 측에 있었다.

### 2.2 기술으로 무엇을 빼고, 무엇을 넣었나?

**베이스라인**
- Windows 10 **Enterprise Edition** 기반 (Home/Pro가 아님)
- 엔터프라이즈급 보안·ID·배포·관리 기능을 그대로 상속

**제거(Removal)**
- **OneDrive** 등 클라우드 스토리지 연동 제거 — 데이터가 국경 밖으로 나가는 경로 자체를 차단
- 엔터테인먼트 성격의 소비자 기능 다수 제거
- 일부 네이티브 기능은 국가보안 요구에 맞춰 **비활성화(disabled)** 처리

**통제(Control)**
- **텔레메트리 전량 관리** — 어떤 진단 데이터를 수집·전송할지 중국 측이 결정
- **업데이트 채널 국내화** — 패치 배포를 CMIT가 운영, 활성화(activation)까지 중국 내부에서 처리
- 운영 데이터가 중국 밖으로 나가지 않도록 배포 구성 (당시 마이크로소프트 임원 설명)

**대체(Substitution)**
- **자체 암호 알고리즘 사용 허용** — 마이크로소프트 표준 암호 모듈 대신 중국 정부가 지정한 암호 체계를 적용할 수 있도록 개방
- 실무적으로는 중국 상용암호 표준(SM2/SM3/SM4) 계열로 이해되나, 마이크로소프트·CMIT 공식 문서에 알고리즘명이 명시된 것은 아니다. (모른다)

**유통**
- **레노버**가 최초 OEM 선탑재 파트너
- 초기 파일럿 고객 3곳: **중국 해관총서**(국가급), **상하이시 경제정보화위원회**(지방급), **웨스톤(卫士通, Westone Information Technology)**(국유기업급)

### 2.3 중국 정부판 윈도우 10의 설계가 의미했던 것

CMIT판의 기능 목록을 뒤집어 읽으면, **중국이 미국산 OS의 어떤 기능을 신뢰하지 않았는지**가 그대로 드러난다.

> 클라우드 동기화(데이터 유출 경로) · 텔레메트리(관측 채널) · 업데이트 서버(공급망 진입점) · 암호 모듈(백도어 의심 지점)

이 네 가지가 CMIT판이 손댄 대부분이다. 즉 **위협모델이 명시적으로 '벤더 자체'였다.** 2017년의 해법은 "이 네 가지만 통제하면 미국산 OS를 써도 된다"였고, 2026년의 결론은 "그걸로도 부족하다"에 가까우며 이제는 디커플링을 하려는 것이다.

---

## 3. 왜 하필 지금인가? - 미중 갈등이라는 배경

### 3.1 재점화된 통상 마찰

2026년 여름, 미중 갈등은 명백히 다시 가열됐다.

**미국 측 조치**
- 7월 말: FCC, 인간형·4족보행 로봇 신규 모델 수입 전면 금지 (사실상 대중국 조치)
- 8월 초: 국토안보부, 위구르 강제노동방지법(UFLPA) 대상에 중국 기업 43곳 추가
- 8월 6일: 트럼프 대통령, 폴리실리콘 파생상품에 무역확장법 232조 기반 **최저수입가격(MIP) + 15% 추가관세** 포고령 서명

**중국 측 대응**
- 8월 5일: 드론 및 관련 부품·기술의 대미 수출 건별 엄격 심사, 신속허가 절차 배제
- 미국 인증기관과의 중국강제인증(CCC) 협력 중단
- 어플라이드 DNA 사이언스 등 미국 기업·단체 제재

주목할 점은 **중국이 희토류 카드는 꺼내지 않았다**는 것이다. 관영 환구시보조차 자국 대응을 "전반적으로 자제된 수준"으로 평가했다. 9월로 예정된 시진핑 주석의 방미 정상회담을 앞두고 판을 깨지 않으려는 계산이다.

### 3.2 그래서 마이크로소프트, 윈도우 10이라는 OS였다

여기서 CMIT판 조기 폐기는 시그널이다.

관세도 아니고, 희토류도 아니고, 상대국 기업 제재도 아니다. **자국 내부의 IT 자산을 정리하는 조치**다. 미국을 직접 때리지 않으면서, 대미 의존도를 실질적으로 줄이고, 협상 테이블에서 "우리는 당신 없이도 된다"는 신호를 보낼 수 있다. 정상회담을 앞둔 시점에 고를 수 있는 카드 중 **마찰 대비 효과비가 가장 높은 선택**이다.

리눅스 데스크탑용 배포판도 상당한 사용성이 확보되었고, 중국 정부는 오픈소스 기반의 리눅스 배포판을 자유롭게 수정하고 자국의 보안 가이드를 붙일 수 있기 때문에 문제가 없다고 봤다.

### 3.3 핵심 트리거 - Windows 10 글로벌 지원 종료

기술적 계기도 맞물렸다. 마이크로소프트는 **2025년 10월 Windows 10의 메인스트림 지원을 전 세계적으로 종료**했다. 그 결과 CMIT판은 *중국 정부 조달에서 공식적으로 허용되는 유일한 Windows*로 남게 됐다. 특수 계약에 따라 보안 업데이트는 계속 제공되고 있었지만, 구조적으로는 **하나의 벤더, 하나의 제품, 하나의 예외**라는 극도로 취약한 형태였다.

마이크로소프트 대변인은 블룸버그에 이 제품과 관련해 인지하고 있는 보안 사고는 없으며 정기 보안 업데이트가 계속 제공되고 있다고 밝혔다. 블룸버그 소식통들은 이번 지시의 배경을 **데이터 보안 우려**로 지목했지만, 구체적으로 어떤 취약점을 문제 삼았는지는 특정되지 않았다.

### 3.4 12년에 걸친 신창(信创) 로드맵

이번 조치는 돌발이 아니다. 일관된 중국의 기술 독립과 내재화라는 궤적의 마지막 구간에 있었다.

| 시점 | 조치 |
|---|---|
| 2014 | 정부 조달에서 Windows 8 금지 |
| 2016 | CMIT 합작사 설립 (49:51) |
| 2017.5 | Windows 10 China Government Edition 발표 |
| 2019 | 정부기관 외산 PC 3년 내 교체 지시 |
| 2022 | 중앙기관·국유기업에 외산 브랜드 PC 전면 퇴출 지시 |
| 2023.12 (2024.3 보도) | 정부 조달 가이드라인 — Intel/AMD CPU, Windows, 외산 DB 배제, "안전가신(安全可信)" 기준 도입 |
| 2026.7 | 중앙기관 노트북 조달 4개 낙찰 패키지 **전부** 국산 OS로 대체, CMIT판 목록에서 제외 |
| 2026.8 | MSS, 일부 국가 연계 기관에 CMIT판 제거 지시 |

2026년 7월 조달 결과가 특히 중요하다. **8월의 지시는 이미 6–7월에 사실상 집행이 끝난 정책을 공식화한 것**에 가깝다.

---

## 4. 중국 소프트웨어 시장은 이미 준비가 되었다.

**국산 OS 진영 주가**
- 후난 기린신안(Hunan Kylinsec): 상하이 일일 상한가 **+20%**
- 아처마인드(Archermind, 中科创达 계열): **+20%** 상한가
- 중국연통소프트(China National Software, 中国软件): **+10%**

**대체 스택은 이미 준비되어 있다**
- OS: **기린 V10(Kylin V10)**, **UOS(통신소프트웨어/UnionTech)**, **HarmonyOS 5** 노트북
- 실리콘: 화웨이 **칭윈(Qingyun)** 데스크톱 + 자체 설계 **Kirin 9000X**

**그런데 — 소비자 시장은 전혀 다르다**

StatCounter 기준 2026년 7월 중국 데스크톱 웹 트래픽에서 Windows 점유율은 **87.64%**다. 그중 Windows 10이 **43.56%**, Windows 11이 50.01%. 메인스트림 지원 종료 10개월이 지난 시점에서 **중국 데스크톱 5대 중 2대는 여전히 지원이 끊긴 마이크로소프트 OS**를 돌리고 있다.

이 격차가 이번 사안의 성격을 정확히 규정한다.

> **이것은 시장 점유율 전쟁이 아니라 중국 공공 기관과 핵심 기관의 주권 인프라 정리 작업이다.**

정부·국유기업 영역에서는 국산화가 사실상 완료 단계지만, 민간 소비자 시장에서 Windows를 밀어낸 힘은 거의 없다. 중국의 국산화는 **행정력이 닿는 곳까지**이며, 그 경계는 매우 뚜렷하다.

**마이크로소프트 재무 영향**
한 증권 리서치 분석은 중국 시장이 마이크로소프트 전체 매출에서 차지하는 비중을 약 1.5% 수준으로 추정하며, 정부 관련 매출 소멸의 재무적 타격은 제한적이라고 평가했다 *(→ 2차 분석, 신뢰도 C3)*. 마이크로소프트가 중국에 남는 이유는 정부 조달이 아니라 **해외 진출 중국 기업 대상 Azure 영업과 현지 엔지니어링 인재**다. 실제로 바이트댄스 한 곳만으로 연 10억 달러 이상의 마이크로소프트 AI·클라우드 지출이 예상된다는 보도가 있다.

**재무적으로는 미미하고, 상징적으로는 결정적이다.** 이 비대칭이 이 뉴스의 본질이다.

---

## 5. 핵심 분석 - 운영체제는 신뢰의 모든 것이다.

### 5.1 "관리된 의존"이라는 모델의 실패

CMIT판은 **"신뢰할 수 없는 벤더의 제품을, 통제 가능한 형태로 개조해서 쓴다"**는 모델이었다. 텔레메트리를 끄고, 업데이트를 국내화하고, 암호를 바꾸고, 지분 과반을 쥔다.

이론적으로는 합리적이다. 실무적으로는 확장된 보안 안정성을 게런티하기에는 **불가능하다.**

OS는 수천만 줄의 코드 위에 서 있다. 텔레메트리 API를 끄는 것과 커널이 무엇을 하는지 아는 것은 전혀 다른 문제다. 소스 접근권이 있어도 컴파일러·빌드 파이프라인·서명 체인·마이크로코드까지 검증할 수는 없다. 결국 **"이 정도면 통제했다"는 판단은 검증이 아니라 어쩔 수 없는 차선책, 신념**이 될 수 밖에 없었다.

2017년의 중국은 그 차선책을 믿고 신념을 가질 용의가 있었다. 2026년의 중국은 그렇지 않다.

### 5.2 스택 전체로의 확산

OS는 시작점이지 종착점이 아니다. 신뢰 문제는 스택을 타고 아래로, 그리고 위로 번진다.

```
        AI 모델 / 에이전트   ← 딥시크, 문샷, 알리바바 Qwen
        AI 가속기            ← 화웨이 어센드, 캄브리콘
        클라우드             ← 알리클라우드, 화웨이클라우드
        DB / 미들웨어        ← 오션베이스, 다멩, 진창
  ★     OS                  ← 기린 V10, UOS, HarmonyOS 5
        CPU                 ← 룽손, 화웨이 Kirin, 하이곤
        펌웨어 / BIOS
```

★ 지점의 결정은 위아래 모든 층에 조달 신호를 보낸다. 정부 PC에 Windows가 없다면, 그 위에 올라갈 소프트웨어의 호환성 요구사항이 전부 재정의된다. **이번 조치는 OS 뉴스가 아니라 조달 표준 뉴스**로 읽는 편이 정확하다.

### 5.3 G2 무역 전쟁의 대칭성 - 미국도 같은 논리를 쓰고 있다

여기서 반드시 짚어야 할 점이 있다. 중국의 논리는 특별하지 않다. 미국 역시 이미 사용하는 논리이기 때문에 미국 역시 중국 정부에 이의를 제기하기 힘들다.

미국은 화웨이·ZTE 장비를 통신망에서 걷어냈고, 정부 기기에서 틱톡을 금지했으며, FCC는 중국산 로봇 수입을 막았다. 근거는 정확히 동일하다.

 **적성국 벤더가 만든 코드는 그 국가의 법적 관할 아래 있다.**

즉 이것은 "중국이 폐쇄적으로 돌아섰다"는 이야기가 아니다. **양측 모두 동일한 위협모델을 채택했고, 그 결과 글로벌 IT 스택이 미국과 중국 중 하나를 선택해야하고 두 개로 갈라지고 있다**는 이야기다. CMIT판은 그 분기가 시작되기 전 마지막 시기에 만들어진, 일종의 화석 같은 타협물이다.

### 5.4 한국에 주는 의미

1. **소프트웨어 주권 논의의 현실적 문제** — 중국조차 12년이 걸렸고, 그것도 강제적인 행정력이 닿는 영역에 한정된다. "국산 OS 전환"류 담론은 이 타임스케일과 경계 조건을 전제로 논의되어야 한다.

2. **CTI 관점** — 국가급 행위자가 OS 공급망을 위협모델의 1순위로 명시했다는 것은, 반대 방향의 공격 역시 같은 레이어에서 사이버 전쟁 시나리오가 상정되고 있다는 뜻이다. 업데이트 채널·서명 체인·펌웨어는 이미 국가 간 보이지 않는 사이버 전쟁의 핵심 전장이다.

3. **투자 관점** — 중국 신창(信创) 관련주는 이번 같은 정책 이벤트에 상한가로 반응하는 **정책 베타** 자산이다. 펀더멘털이 아니라 조달 예산과 행정 지시가 가격을 만든다. 반대로 마이크로소프트에 대한 영향은 헤드라인 대비 실질이 작다. **헤드라인 리스크와 실적 리스크를 구분하는 것**이 이 뉴스에서 가장 실용적인 교훈이다.

---

## 6. 신뢰도 평가 (Admiralty Code)

| 주장 | 판정 | 등급 |
|---|---|---|
| CMIT판 Windows 10이 존재하고 중국 정부·국유기업이 사용해왔다 | 마이크로소프트 공식 발표로 확인 | **A1** |
| CMIT는 MS-CETC 합작사(49:51), 2016년 설립 | 다수 1차 보도 일치 | **A1** |
| CMIT판이 OneDrive 제거·텔레메트리 관리·자체 암호 허용 기능을 가진다 | 마이크로소프트 공식 블로그 명시 | **A1** |
| 마이크로소프트가 2025년 10월 Windows 10 지원을 종료했다 | 확정 사실 | **A1** |
| MSS가 일부 국가 연계 기관에 CMIT판 제거를 지시했다 | 블룸버그 익명 소식통 단독, 다수 매체 인용 보도, 중국 정부 공식 확인 없음 | **B2** |
| 당초 폐기 예정일이 2027년 2월이었다 | 블룸버그 보도, 복수 매체 재인용 | **B2** |
| 배경이 데이터 보안 우려다 | 소식통 진술, 구체적 취약점 미특정 | **C3** |
| 중국 국산 OS 주가가 급등했다 | 시장 데이터로 검증 가능 | **A1** |
| 자체 암호가 SM2/SM3/SM4 계열이다 | 업계 통념, 공식 문서 미확인 | **C3** |
| 9월 정상회담을 겨냥한 타이밍이다 | 정황 기반 해석 | **C3** |
| 미국 기술 의존도 축소 흐름의 일환이다 | 12년간의 정책 궤적과 정합 | **A2** |

---

## 7. 아직 확인되지 않은 것과 관료의 창구 지도.

보고서나 SNS에 인용할 때 아래 세 가지는 넘지 말아야 할 선이 있다. 중국 정부 관료들은 창구 지도를 한다는 것이다. 공식적이지 않지만, 기업인들, 공산당 관련 업체의 중요 인사를 불러 구두로 서류로 남기기 까다로운 정책을 협의 한다.

1. **범위가 불명확하다.** 블룸버그 보도는 "일부(some)" 국가 연계 기관이라고만 했다. *전 국유기관 일괄 삭제령*으로 확대 해석하면 안 된다. CMIT는 취재 요청에 응답하지 않았다.

2. **중국 정부 공식 발표는 없다.** 국가안전부 명의의 공개 문건이 확인된 바 없다. "블룸버그가 익명 소식통을 인용해 보도했다"는 층위를 유지해야 한다.

3. **특정 취약점은 지목되지 않았다.** "백도어가 발견돼서"라는 식의 인과 서술은 현재 근거를 넘어선다.

**권장 표현:**

> "중국 국가안전부가 일부 국가 연계 기관에 정부용 Windows 10(CMIT판) 제거를 지시했다고 블룸버그가 보도했다. 당초 2027년 2월 예정이던 폐기 일정을 수 개월 앞당긴 것이다."

---

## 8. 맺으며

2017년 5월, 마이크로소프트 임원은 상하이 무대에서 "중국 정부는 보안과 신뢰에 대해 세계 최고 수준의 기준을 갖고 있다"고 말했다. 그 기준에 맞추기 위해 2년간의 국가 보안 심사를 거쳤고, 지분 49%짜리 합작사를 세웠고, OneDrive를 떼어냈고, 암호 모듈까지 내주는 형태로 중국 시장을 유지하려고 했다.

9년 뒤, 그 모든 양보에도 불구하고 답은 **"그래도 지워라"**였다.

이 사건에서 배울 것은 중국의 폐쇄성이 아니다. **국가 단위 신뢰가 무너지면, 아무리 정교하게 설계된 기술적 타협도 결국 정치적 결정 앞에서 유효기간이 끝난다**는 것이다. 엔지니어링으로 지정학을 해결할 수는 없다.

OS에서 시작해 CPU, DB, 클라우드, AI 모델, AI 가속기까지 — 전 스택의 이중화는 이미 진행 중인 현실이다. 다음 질문은 "분리가 일어날 것인가"가 아니라 "**어느 쪽 스택에도 속하지 않은 나라들은 무엇을 선택할 것인가?**"다.

미중 무역 갈등에서 인공지능을 포함한 전쟁의 트로피가 될만한 국가이다. 명말청초의 광해군의 외교 무대처럼, 남한산성을 내려다보는 그 질문의 한복판에 있다.

---

## 레퍼런스

### 1차 보도 — 이번 사안 (2026.8.18)

1. Bloomberg, *China Removes Microsoft Windows at State Users Ahead of Plan*, 2026-08-18
   https://www.bloomberg.com/news/articles/2026-08-18/china-axing-microsoft-windows-from-state-agencies-ahead-of-plan

2. The Edge Malaysia, *China axing Microsoft Windows from state agencies ahead of plan* (Bloomberg 신디케이션 전문), 2026-08-18
   https://theedgemalaysia.com/node/814910

3. Tom's Hardware (Luke James), *China reportedly orders state agencies to uninstall its government-only edition of Windows 10*, 2026-08-18 — 주가 반응, 국산 스택 현황, StatCounter 점유율 데이터
   https://www.tomshardware.com/software/operating-systems/china-reportedly-orders-state-agencies-to-uninstall-its-government-only-edition-of-windows-10

4. TechRadar Pro (Mike Moore), *China is finally pulling Windows 10 from government machines*, 2026-08-18
   https://www.techradar.com/pro/china-is-finally-pulling-windows-10-from-government-machines-and-says-thats-ahead-of-schedule

5. Benzinga / Yahoo Finance, *Microsoft Faces Fresh China Headwind As Beijing Reportedly Accelerates Windows Exit From Govt Systems*, 2026-08-18
   https://finance.yahoo.com/technology/articles/microsoft-faces-fresh-china-headwind-080837164.html

6. Seeking Alpha, *Microsoft Windows older version being removed at China state-linked entities ahead of plan*, 2026-08-18
   https://seekingalpha.com/news/4634187-microsoft-windows-older-version-being-removed-at-china-state-linked-entities-ahead-of-plan

7. TradingKey, *Win10 Government Edition Phased Out Early as Microsoft's China Business Faces New Headwinds*, 2026-08-18 — 2026년 7월 중앙기관 조달 결과, MSFT 매출 비중 추정
   https://www.tradingkey.com/analysis/stocks/us-stocks/262114664-win10-government-removal-microsoft-china-headwinds-tradingkey

### CMIT판 원 출처 (2017)

8. **Terry Myerson (Microsoft), *Announcing Windows 10 China Government Edition and the new Surface Pro*, Windows Experience Blog, 2017-05-23** — CMIT판 기능 명세의 1차 출처
   https://blogs.windows.com/windowsexperience/2017/05/23/announcing-windows-10-china-government-edition-new-surface-pro/

9. Microsoft Official Blog, 동일 발표문, 2017-05-23
   https://blogs.microsoft.com/blog/2017/05/23/announcing-windows-10-china-government-edition-new-surface-pro/

10. The Seattle Times, *Microsoft develops Windows 10 version for China's government*, 2017-05-23 — 2년간 보안 심사, 데이터 국외 미유출 구성
    https://www.seattletimes.com/business/microsoft/microsoft-develops-windows-10-version-for-chinas-government/

11. China Daily, *Microsoft unveils Windows tailored for government customers*, 2017-05-25 — 49:51 지분구조, 파일럿 고객 3곳, 자체 암호 알고리즘
    https://www.pressreader.com/hong-kong/china-daily/20170525/282127816421572

12. Tom's Hardware, *Microsoft Announces Windows 10 China Government Edition*, 2017-05-23
    https://www.tomshardware.com/news/windows-10-china-government-edition,34488.html

13. Notebookcheck, *Microsoft intros Windows 10 China Government Edition*, 2017-05 — 레노버 OEM 선탑재
    https://www.notebookcheck.net/Microsoft-intros-Windows-10-China-Government-Edition.223472.0.html

### 미중 갈등 배경

14. Financial Times (Malay Mail 재인용), *China blocks use of Intel and AMD chips in government computers*, 2024-03-24 — 2023년 12월 발표된 정부 조달 가이드라인
    https://www.malaymail.com/news/money/2024/03/24/china-blocks-use-of-intel-and-amd-chips-in-government-computers-ft-reports/125245

15. 아주경제, *[종합] 미중 무역전쟁 다시 불붙나…美, 이번에는 폴리실리콘 관세 15% 추진*, 2026-08-06
    https://www.ajunews.com/view/20260806152224127

16. 미주 한국일보, *정상회담 앞 미중 무역갈등 고조…시진핑 방미 영향받나*, 2026-08-07 — FCC 로봇 수입금지, UFLPA 43곳 추가, 드론 수출통제
    http://www.koreatimes.com/article/20260807/1624747

17. 글로벌이코노믹, *미·중, 9월 정상회담 앞두고 AI·로봇·무역 갈등 격화*, 2026-08-06
    https://www.g-enews.com/article/Global-Biz/2026/08/2026080616222675320c8c1c064d_1

18. Wikipedia, *2026 state visit by Donald Trump to China* (2026년 5월 13–15일 베이징 정상회담)
    https://en.wikipedia.org/wiki/2026_state_visit_by_Donald_Trump_to_China

---

*본 칼럼의 모든 사실 주장에는 Admiralty Code 신뢰도 등급이 부여되어 있습니다. B2 이하 등급의 주장을 인용하실 때는 출처와 불확실성을 함께 표기하시기 바랍니다.*

*LLM은 엑셀이지 오라클이 아니다.*
