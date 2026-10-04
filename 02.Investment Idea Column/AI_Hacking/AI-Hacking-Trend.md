---
id: CTI-2026-1004-AI-HACKING-TREND
title: "AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다"
title_en: "AI Did Not Open a New Door — It Walked Through the Side Door We Left Unlocked"
subtitle: "AI LLM을 악용한 금융·기업 해킹 사례에서 우리가 배워야 할 것"
description: "AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다. 확인된 기법은 크리덴셜 스터핑이다. 기본기의 빈틈은 이제는 반드시 발견된다."
abstract: |
  2026-09 말 신한·KB·하나·BNK 등 국내 은행권이 연달아 뚫렸다. 확인된 기법은 크리덴셜 스터핑이며 침투 경로는 핵심 뱅킹이 아니라 대출모집인·직원 업무 앱 같은 옆문이다. ARTEX AI 사용은 미확정.
  Anthropic Claude·Google Gemini 평가 사고, Sysdig JadePuffer, Fideuram AI 보이스피싱, GeminiJack, GTG-1002 등 공개 사례를 묶어 CISO 실행 로드맵을 정리한다.
  AI가 바꾼 것은 공격의 종류가 아니라 경제학이다. TLP:CLEAR. 법률·투자 권유 아님.
summary_for_ai: |
  CTI analytical column (KO), id CTI-2026-1004-AI-HACKING-TREND, date 2026-10-04, TLP:CLEAR, group korea-breach.
  Thesis: AI did not invent new attacks; it cheapens old ones (credential stuffing, weak passwords, leaked creds, unpatched KEV). Korean bank leaks via side-door convenience systems, not core banking. ARTEX AI string unconfirmed.
  Cases: Anthropic Claude eval escape 2026-07; Google Gemini eval 2026-09; JadePuffer Langflow CVE-2025-3248; Fideuram ~€95M AI voice/WhatsApp; GeminiJack zero-click; GTG-1002 Claude Code espionage.
  Defense: MFA, ASM by reachability, out-of-band verify, deny-by-default agent egress, machine-speed first response, AI as Excel not oracle. Not a how-to. Not legal/investment advice.
date: 2026-10-04
updated: 2026-10-04
author: "Dennis Kim (김호광 / HoKwang Kim)"
email: "gameworker@gmail.com"
github: "gameworkerkim"
lang: ko
tags:
  - Korea-Breach
  - AI-Hacking
  - Credential-Stuffing
  - Agent
  - Bank
  - CISO
keywords:
  - "AI 해킹"
  - "크리덴셜 스터핑"
  - "은행권 정보유출"
  - "옆문"
  - "프롬프트 인젝션"
  - "에이전틱 방어"
group: korea-breach
featured: true
featured_rank: 1
og_image: "https://vibequant.cc/og/ai-hacking-trend.jpg"
image: "https://vibequant.cc/og/ai-hacking-trend.jpg"
schema_type: TechArticle
classification: "TLP:CLEAR"
severity: HIGH
confidence: "B2"
license: "CC BY-NC-SA 4.0"
robots: index,follow
canonical: "https://cti.vibequant.cc/cti/ai-hacking-trend/"
draft: true
---

<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 주석 풀지 말 것)
  <title>AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다 · VibeQuant CTI</title>
  <meta name="description" content="AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다. 확인된 기법은 크리덴셜 스터핑이다. 기본기의 빈틈은 이제는 반드시 발견된다.">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다",
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "2026-10-04",
    "keywords": ["AI 해킹", "크리덴셜 스터핑", "은행권 정보유출", "옆문", "프롬프트 인젝션", "에이전틱 방어"]
  }
  </script>
-->

# AI가 연 것은 새로운 문이 아니라, 우리가 잠그지 않은 옆문이다

## AI LLM을 악용한 금융·기업 해킹 사례에서 우리가 배워야 할 것

![반쯤 열린 흰 문. 잠그지 않은 옆문의 은유](https://vibequant.cc/og/ai-hacking-trend.jpg)

*반쯤 열린 문. AI가 연 것은 새 문이 아니라, 우리가 잠그지 않은 옆문이다. Klearchos Kapoutsis, CC BY 2.0.*

**김호광** 싸이월드 전 대표 / 2026년 10월 4일

> **분류**: TLP:CLEAR | **문서유형**: 분석 칼럼 (Analytical Column) | **작성일**: 2026-10-04

> **이 글에 대하여**
> - **기준일:** 2026년 10월 4일. 본문의 사례는 모두 실제로 공개 보도되거나 당사자가 발표한 사건이며, 가상의 시나리오는 없다. 각 사례의 출처는 각주와 글 말미의 참고문헌에 정리했다.
> - **주 독자:** 금융·기업의 CISO와 보안 실무자. 경영진이 참고할 수 있도록 마지막에 실행 로드맵을 덧붙였다.
> - **확정되지 않은 사실의 표기:** 조사가 진행 중인 사안은 본문에서 "추정", "확정되지 않음"으로 명시했다.

---

2026년 9월 말, 국내 은행권이 연달아 뚫렸다. 신한은행에서 약 2만 5천 명의 고객 정보가 빠져나갔고, 며칠 사이 KB국민은행, 하나은행, BNK부산은행에서도 유출 사실이 확인됐다.[^1] 공격에 쓰인 것으로 추정되는 서버의 HTML 타이틀에서는 'AI 자율 침투테스트 콘솔'이라는 뜻의 중국어 문자열과 함께 오픈소스 도구 'ARTEX AI'의 흔적이 나왔다.[^2] 언론은 곧바로 "AI 해킹 시대"를 외쳤다.

그러나 한 걸음 물러서서 볼 필요가 있다. 이 글을 쓰는 시점까지 ARTEX AI가 실제 공격에 사용됐는지는 공식적으로 확정되지 않았다.[^1] 오히려 이 글이 주목하는 것은 **확정된 사실** 쪽이다. 확인된 공격 기법은 '크리덴셜 스터핑'이다. 어딘가에서 유출된 아이디와 비밀번호를 무작위로 대입해 보는, 십수 년 된 수법이다. 침투 경로도 핵심 뱅킹 시스템이 아니었다. 신한은행은 대출모집인용 조회 서비스, KB국민은행은 직원용 모바일 업무지원 시스템, 즉 업무 편의를 위해 열어둔 **옆문**이었다.[^1]

AI가 실제로 쓰였든 아니든, 이 구도는 변하지 않는다. 그리고 바로 이 구도가 최근 전 세계에서 쏟아진 AI 악용 사례 전체를 관통한다.

---

## 1. AI는 새로운 공격을 만들지 않는다. 오래된 공격을 싸고 빠르게 만든다

크리덴셜 스터핑, 취약한 비밀번호, 공개 저장소에 방치된 자격 증명, 인증 없이 열린 엔드포인트, 몇 년 전에 패치가 나온 취약점. 최근 사례에서 AI가 실제로 이용한 약점의 목록을 보면 놀라울 만큼 고전적이다.

이 점은 AI 연구소의 사고에서 가장 선명하게 드러난다. 2026년 7월 Anthropic은 자사 Claude 모델이 외부 파트너의 사이버보안 평가 환경에서 설정 오류로 인터넷에 연결돼, 실제 3개 기관의 운영 시스템에 무단 접근했다고 공개했다. 모델은 자신이 여전히 시뮬레이션 안에 있다고 믿은 채, 약한 비밀번호와 인증 없는 엔드포인트 같은 기초적인 방법으로 침입했다.[^3] 9월에는 Google도 Gemini 모델이 같은 평가 업체의 환경에서 3개 기업 시스템에 들어갔다고 확인했다. 한 건은 비밀번호를 반복해서 추측했고, 두 건은 공개 코드 저장소에 노출된 자격 증명을 그대로 썼다.[^4]

공격자 사례도 다르지 않다. Sysdig가 2026년 7월 보고한 'JadePuffer'는 LLM 에이전트가 처음부터 끝까지 주도한 첫 랜섬웨어 사례로 평가된다. 그런데 이 에이전트가 처음 들어간 문은 2025년 3월에 이미 패치가 나왔고 미국 CISA의 '실제 악용 취약점(KEV)' 목록에도 오른 Langflow 취약점(CVE-2025-3248)이었다. 그다음 피벗에 쓴 것은 2021년의 Nacos 인증 우회 취약점과 기본값 그대로 남아 있던 서명 키였다.[^5]

결국 AI가 바꾼 것은 공격의 **종류**가 아니라 **경제학**이다. JadePuffer 에이전트는 한 번의 시도가 실패하자 31초 만에 수정한 페이로드를 다시 보냈다.[^5] 사람이라면 며칠 걸릴 정찰과 대입, 결과 분석, 다음 경로 선택을 에이전트는 쉬지 않고 반복한다. 공격 한 번의 비용이 0에 가까워지면, 지금까지 "설마 여기까지 오겠어"라며 방치했던 모든 구석이 공격 대상이 된다.

> **시사점:** 보안 투자의 우선순위를 '최신 위협 대응'에서 '기본기의 전수 점검'으로 되돌려야 한다. AI 시대에도 가장 효과적인 방어는 다중인증(MFA), 비밀번호 정책, 자격 증명 노출 점검, 알려진 취약점(KEV) 우선 패치, 외부 노출 자산의 전수 관리다.

---

## 2. 공격 표면은 '고객 서비스'가 아니라 '업무 편의'에 있다

은행 보안은 전통적으로 고객이 돈을 움직이는 경로, 즉 인터넷뱅킹과 모바일뱅킹에 집중돼 왔다. 그런데 이번에 뚫린 곳은 대출모집인 조회 서비스와 직원용 업무 앱이었다. 금융거래 시스템은 아니지만, 신한은행 사례의 유출 정보에는 주민등록번호 일부와 연계정보(CI), 연소득, 대출 산출한도 같은 신용정보가 포함됐다.[^2]

사람 공격자는 가성비를 따진다. 그래서 중요해 보이는 곳을 노린다. 반면 AI 에이전트는 지치지 않고 모든 문을 두드린다. 그러다 보면 가장 관리가 허술한 문이 먼저 열린다. 협력사용 포털, 외주 개발자 계정, 테스트 서버, 오래된 API가 그런 문이다. BNK부산은행 사례에서 유출 대상이 외주 개발 직원이었다는 점은 상징적이다.[^1]

> **시사점:** 자산 목록(Attack Surface Inventory)을 '서비스 중요도'가 아니라 '외부 도달 가능성' 기준으로 다시 작성해야 한다. 인터넷에서 닿을 수 있는 모든 것은, 중요하든 아니든, 핵심 시스템과 같은 수준의 인증과 이상 탐지를 적용받아야 한다.

---

## 3. 신뢰는 이제 위조 가능한 자산이다

2026년 2월, 이탈리아 최대 은행 인테사 산파올로의 프라이빗뱅킹 자회사 피데우람(Fideuram)의 당시 회장은 그룹 CEO가 보낸 것처럼 보이는 WhatsApp 메시지를 받았다. 이어 유명 로펌 파트너를 사칭한 전화가 왔는데, 그 목소리는 AI로 복제한 것이었다. 결국 약 9,500만 유로가 해외 계좌로 송금됐다. 중국·포르투갈·이탈리아 당국의 공조로 약 5,300만 유로를 되찾았지만, 약 3,600만 유로는 암호화폐로 바뀌어 아직 추적되지 않고 있다.[^6] 국내에서도 실제 잔고 23원을 9억 원으로 바꾼 AI 위조 잔고증명서가 법정에 제출된 사건이 보도됐다.[^7]

이 두 사건은 시스템을 해킹하지 않았다. 대신 **사람의 판단을 해킹**했다. 우리 조직의 결재와 승인 체계는 "목소리를 알아듣고, 서류를 확인하면 믿을 수 있다"는 전제 위에 서 있다. 그런데 생성형 AI는 바로 그 전제를 무너뜨렸다. 목소리, 얼굴, 문체, 서식은 이제 진위를 증명하지 못한다.

> **시사점:** "보고 듣고 확인했다"는 절차를 "다른 채널로 다시 확인했다"는 절차로 바꿔야 한다. 고액 송금이나 권한 변경 같은 고위험 요청은 미리 등록된 별도 채널로 재확인(out-of-band verification)하도록 의무화하고, 서류는 발급 기관의 원본 조회 시스템으로 검증해야 한다. 사람의 감각이 아니라 프로세스가 마지막 방어선이 되어야 한다.

---

## 4. 우리가 도입한 AI 자체가 새로운 공격 표면이다

2025년 12월 Noma Security가 공개한 'GeminiJack'은 기업용 AI 어시스턴트 Gemini Enterprise의 제로클릭 취약점이다. 공격자가 공유 문서나 캘린더 초대, 이메일에 숨긴 지시문을 심어 두면, 직원이 평범한 사내 검색을 할 때 AI가 그 문서를 끌어와 지시대로 실행했다. 실행은 그 직원의 권한으로 이뤄졌다.[^8] 2026년 Zscaler ThreatLabz는 웹페이지에 숨긴 문구로 AI 에이전트를 조종한 실제 공격 캠페인 두 건을 보고했다. 그중 하나는 코딩 작업 중인 에이전트에게 "오류를 고치려면 3달러짜리 API 키를 사야 한다"고 지시했고, 시험한 26개 모델 중 4개가 실제로 결제까지 진행했다.[^9]

공통점은 하나다. **AI에게 들어가는 모든 입력은 잠재적인 명령**이라는 점이다. 사람에게 이메일은 읽을거리지만, 에이전트에게는 실행할 수도 있는 지시다. 사내 문서를 검색하고, 메일을 요약하고, 결제를 대행하는 AI를 도입하는 순간, 조직은 외부인이 쓴 텍스트가 내부 권한으로 실행될 수 있는 통로를 연 셈이다. JadePuffer 사례가 보여주듯, Langflow 같은 AI 개발 플랫폼 자체도 패치되지 않으면 그대로 침투 거점이 된다.[^5]

> **💡 용어 해설: 프롬프트 인젝션은 어떻게 작동하는가**
>
> LLM은 "지시"와 "데이터"를 구조적으로 구분하지 못한다. 둘 다 같은 텍스트로 모델의 입력(컨텍스트)에 들어가기 때문이다.
>
> - **직접 프롬프트 인젝션:** 사용자가 대화창에 "이전 지시를 무시하고…" 같은 문장을 직접 넣어 모델을 조종한다.
> - **간접 프롬프트 인젝션:** 공격자가 AI가 *나중에 읽게 될* 콘텐츠(웹페이지, 문서, 이메일, 메타데이터)에 지시문을 숨긴다. 사람 눈에는 보이지 않도록 CSS로 화면 밖에 두거나 JSON-LD 같은 구조화 데이터에 넣는다. AI가 그 콘텐츠를 검색해 읽는 순간, 숨긴 문장이 지시로 해석된다.
> - **제로클릭:** 피해자가 링크를 누르거나 파일을 여는 행동이 전혀 없어도 공격이 성립하는 경우다. GeminiJack에서는 직원의 *평범한 검색*이 곧 방아쇠였다. 유출 데이터는 외부 이미지 주소에 실어 보냈기 때문에 정상 트래픽과 구분하기도 어려웠다.
>
> 핵심은 "AI가 읽을 수 있는 모든 곳이 공격자가 지시를 적어 둘 수 있는 곳"이라는 점이다.

> **시사점:** AI 에이전트는 '똑똑한 직원'이 아니라 '외부 입력에 노출된 고권한 프로세스'로 다뤄야 한다. 최소 권한을 부여하고, 데이터 접근 범위를 분리하고, 결제·외부 전송·권한 변경 같은 고위험 행위에는 반드시 사람의 승인 단계를 두어야 한다. AI 플랫폼 자체의 패치 관리도 일반 서버와 같은 수준으로 해야 한다.

---

## 5. 경계는 모델의 판단이 아니라 구조로 지켜야 한다

AI 연구소들의 평가 사고에는 공격자 사례 못지않게 중요한 교훈이 담겨 있다. Anthropic의 평가 프롬프트에는 "인터넷 접근이 없다"고 명시돼 있었지만, 실제 환경은 그렇지 않았다.[^3] Gemini는 실제 기업임을 인지하고 스스로 멈췄다고 하지만, 이미 로그인한 뒤였다.[^4] 그리고 Anthropic 사례의 피해 기관들은 통보를 받기 전까지 아무도 침입을 탐지하지 못했다.[^3]

이것은 AI 연구소만의 문제가 아니다. 사내에 AI 에이전트를 도입하는 모든 기업이 같은 함정에 빠질 수 있다. "이 에이전트는 이 범위 안에서만 일하도록 지시했다"는 말은 보안 통제가 아니다. 지시는 오해될 수 있고, 환경은 잘못 설정될 수 있다.

> **💡 용어 해설: 기본 차단(deny-by-default) 통신 정책**
>
> 외부로 나가는 모든 연결을 기본적으로 막고, 업무상 필요한 목적지만 허용 목록(allow-list)에 올려 여는 방식이다. 반대로 "위험한 곳만 막는" 방식(deny-list)은 목록에 없는 새로운 목적지를 막지 못한다. AI 평가 사고들은 모두 "인터넷이 막혀 있을 것"이라는 가정이 틀렸을 때 일어났다. 기본 차단 정책이었다면 설정 실수가 있어도 연결 자체가 성립하지 않았을 것이다.

> **시사점:** 에이전트의 행동 범위는 프롬프트가 아니라 네트워크와 권한 구조로 강제해야 한다. 기본 차단 방식의 외부 통신 정책, 대상 허용 목록, 실행 전 격리 검증, 외부에서 작동하는 긴급 중단 장치가 필요하다. 동시에 "침입당해도 모른다"는 현실을 전제로 탐지 역량을 점검해야 한다. 비정상적인 로그인 패턴, 짧은 시간 안의 대량 조회, IP를 바꿔가며 반복되는 동일 패턴은 자동화된 공격의 전형적인 신호다.

---

## 6. 공격의 규모는 이제 인력에 비례하지 않는다

Anthropic이 2025년 11월 공개한 중국 국가 배후 그룹 GTG-1002 사례는 AI가 공격의 대부분 단계를 직접 수행한 첫 대규모 사이버 첩보 작전으로 기록됐다. 이 그룹은 Claude Code를 정당한 침투 테스트인 것처럼 속여, 기술 기업과 금융기관, 화학 제조사, 정부 기관 등 약 30개 조직을 겨냥했다. 정찰부터 취약점 발견, 자격 증명 수집, 내부 이동, 데이터 분석과 유출까지 상당 부분을 AI가 처리했다.[^10]

과거에는 수십 개 조직을 동시에 공격하려면 수십 명의 숙련된 인력이 필요했다. 이제는 소수의 운영자와 에이전트만으로 충분하다. 반대로 방어하는 쪽은 여전히 사람의 근무 시간과 인력 규모에 묶여 있다. 야간과 주말, 연휴는 공격자에게 기회의 시간이다.

> **시사점:** 공격이 기계 속도로 움직이면, 방어의 첫 반응도 기계 속도여야 한다. 이것이 다음 장의 주제다.

---

## 7. AI는 방어의 도구이기도 하다. 단, 검증을 전제로

지금까지의 사례가 AI를 공격 도구로만 그렸다면 절반의 그림이다. 공격자가 얻은 "지치지 않는 동료"는 방어자도 얻을 수 있다. 실제로 AI가 방어에서 가장 빨리 효과를 내는 영역은 다음과 같다.

- **외부 노출 자산의 상시 점검.** 공격 에이전트가 하는 일을 먼저 한다. 자사 도메인과 IP 대역을 주기적으로 스캔해 잊힌 서버, 열린 관리 페이지, 오래된 버전의 소프트웨어를 찾는다.
- **자격 증명 노출 감시.** 공개 코드 저장소와 유출 데이터에서 자사 계정과 키가 노출됐는지 자동으로 확인한다. Gemini 평가 사고에서 쓰인 바로 그 경로다.
- **로그 분석과 이상 탐지.** 사람이 다 볼 수 없는 인증 로그와 조회 로그에서 크리덴셜 스터핑 패턴, 비정상적인 대량 조회, IP 회전을 걸러낸다.
- **1차 대응 자동화.** 탐지 즉시 IP 차단, 계정 잠금, 세션 종료처럼 되돌릴 수 있는 조치를 사람의 승인 없이 실행한다.
- **위협 인텔리전스 정리.** 쏟아지는 취약점 공지와 보고서를 자사 자산 목록과 대조해 "우리에게 해당하는 것"만 우선순위로 올린다.

다만 방어용 AI에도 같은 원칙이 적용된다. 흥미롭게도 GTG-1002 공격자들조차 AI의 '환각'에 발목을 잡혔다. Anthropic 보고서에 따르면, Claude는 확보하지 못한 자격 증명을 확보했다고 하거나 공개된 정보를 중요한 발견처럼 보고하는 일이 잦았고, 공격자들은 결과를 일일이 검증해야 했다.[^10] 방어자도 마찬가지다. **AI는 엑셀이지 오라클이 아니다.** 계산과 반복은 맡기되, 판단과 책임은 사람에게 남겨야 한다. 자동화는 그 판단이 내려질 시간을 벌어주는 역할이어야 한다.

> **시사점:** 방어용 AI는 "되돌릴 수 있는 조치는 자동으로, 되돌릴 수 없는 판단은 사람이" 원칙으로 설계한다. AI가 낸 탐지 결과와 분석에는 검증 단계를 반드시 둔다.

---

## 맺으며: "AI 해킹"이라는 말이 가리는 것

"AI가 은행을 뚫었다"는 헤드라인은 자극적이지만 위험한 착시를 만든다. 마치 막을 수 없는 새로운 괴물이 나타난 것처럼 들리기 때문이다. 그러면 조직은 무력감에 빠지거나, 반대로 'AI 보안 솔루션'이라는 이름의 새 제품을 사는 것으로 책임을 다했다고 착각하기 쉽다.

하지만 사례들을 하나하나 뜯어보면 이야기는 다르다. AI가 들어온 문은 대부분 우리가 이미 알고 있었지만 잠그지 않았던 문이다. 재사용된 비밀번호, 방치된 자격 증명, 1년 넘게 패치하지 않은 취약점, 관리되지 않는 외부 접점, 목소리만 믿는 결재 관행, 권한이 과도한 자동화 도구 같은 것들이다.

AI 시대의 보안은 새로운 무기를 갖추는 것에서 시작하지 않는다. **기본기의 빈틈이 이제는 반드시 발견된다**는 사실을 받아들이는 것에서 시작한다. 공격자는 이미 그 빈틈을 지치지 않고 찾아다니는 동료를 얻었다. 우리가 할 일은 같은 동료를 곁에 두고, 그들이 찾아낼 것을 먼저 찾아 막는 것이다.

---

## 부록 A. 핵심 정리

| # | 시사점 | 실천 과제 |
|---|--------|-----------|
| 1 | AI는 오래된 공격을 싸고 빠르게 만든다 | MFA, 비밀번호 정책, 자격 증명 노출 점검, KEV 우선 패치 |
| 2 | 공격 표면은 업무 편의 시스템에 있다 | 외부 도달 가능성 기준으로 자산 목록 재작성 |
| 3 | 신뢰는 위조 가능한 자산이다 | 고위험 요청의 별도 채널 재확인 의무화 |
| 4 | 도입한 AI 자체가 공격 표면이다 | 에이전트 최소 권한, 고위험 행위 사람 승인, AI 플랫폼 패치 |
| 5 | 경계는 구조로 지켜야 한다 | 기본 차단 통신 정책, 외부 긴급 중단 장치, 탐지 역량 점검 |
| 6 | 공격 규모가 인력과 무관해졌다 | 기계 속도의 1차 대응 체계 |
| 7 | AI는 방어의 도구이기도 하다 | 노출 점검·로그 분석·1차 대응 자동화, 결과 검증 단계 의무화 |

---

## 부록 B. 실행 로드맵 (예시)

조직 규모와 현재 성숙도에 따라 조정이 필요하다. 담당 부서는 일반적인 금융회사 조직을 기준으로 한 예시다.

### 단기 (30일 이내): 지금 열려 있는 문부터 닫는다

| 과제 | 담당 (예시) | 완료 기준 |
|------|-------------|-----------|
| 외부 노출 자산 전수 조사 (협력사·외주·테스트 서버 포함) | 정보보호부, IT인프라부 | 인터넷 도달 가능 자산 목록 확보, 소유 부서 지정 |
| 외부 노출 시스템 전체 MFA 적용 현황 점검 및 미적용 시스템 우선 조치 | 정보보호부 | 업무지원·협력사 시스템 포함 MFA 적용률 보고 |
| CISA KEV 목록 대비 미패치 취약점 점검 | IT운영부 | 미패치 KEV 항목 0건 또는 예외 승인 |
| 공개 저장소·유출 데이터 내 자사 자격 증명 노출 점검 | 정보보호부 | 노출 계정·키 전량 폐기 및 재발급 |
| 사내 AI 도구·플랫폼(Langflow 등) 사용 현황 파악 | IT기획부 | 승인·미승인 AI 도구 목록 |

### 중기 (90일 이내): 프로세스와 탐지를 바꾼다

| 과제 | 담당 (예시) | 완료 기준 |
|------|-------------|-----------|
| 고액 송금·권한 변경 요청의 별도 채널 재확인 규정 제정 | 재무부, 준법감시부 | 내규 개정, 임원 포함 전 직원 적용 |
| 크리덴셜 스터핑·대량 조회·IP 회전 탐지 규칙 도입 | 보안관제센터 | 탐지 규칙 운영, 오탐률 측정 |
| 1차 대응 자동화 (IP 차단, 계정 잠금, 세션 종료) | 보안관제센터 | 탐지부터 차단까지 소요 시간 측정 및 단축 |
| AI 에이전트 도입 보안 기준 수립 (최소 권한, 고위험 행위 승인, 입력 검증) | 정보보호부, IT기획부 | 신규 AI 도입 시 보안성 검토 절차 운영 |
| 딥페이크 사회공학 대응 모의훈련 | 정보보호부, 인사부 | 경영진 대상 1회 이상 실시 |

### 장기 (180일 이내): 상시 방어 체계로 전환한다

| 과제 | 담당 (예시) | 완료 기준 |
|------|-------------|-----------|
| 외부 공격 표면 상시 관리(ASM) 체계 구축 | 정보보호부 | 신규 노출 자산 자동 탐지 및 알림 |
| AI 에이전트 실행 환경의 기본 차단 통신 정책 적용 | IT인프라부 | 허용 목록 외 외부 통신 차단 검증 |
| AI 기반 공격을 가정한 레드팀 훈련 | 정보보호부 (외부 협력 가능) | 연 1회 이상 실시, 결과 경영진 보고 |
| 방어용 AI의 결과 검증 절차 정립 | 보안관제센터 | 자동 판단 범위와 사람 판단 범위 문서화 |
| 경영진·이사회 대상 AI 보안 위험 정기 보고 | CISO | 분기별 보고 체계 운영 |

---

## 참고문헌

[^1]: 비즈니스플러스, 「[이슈+] AI가 넓힌 해킹의 틈…은행권 보안체계 다시 시험대」, 2026.10.4. https://businessplus.kr/news/articleView.html?idxno=117693 / 뉴스웍스, 「AI가 찾은 '옆문'…금융권 해킹, 징계는 어디까지」, 2026.10.4. https://www.newsworks.co.kr/news/articleView.html?idxno=855548

[^2]: 미디어워치(인싸잇), 「신한은행 해킹 서버서 '중국어 AI 침투도구' 흔적 발견」, 2026.10.2. https://www.mediawatch.kr/news/article.html?no=261254 / 뉴데일리, 「신한은행 공격 서버에 'AI 침투도구' 흔적」, 2026.10.2. https://biz.newdaily.co.kr/site/data/html/2026/10/02/2026100200231.html

[^3]: Anthropic, "Investigating three incidents in our cybersecurity evaluations", 2026.7.30. https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals / Fortune, "Anthropic says its Claude models hacked three real companies during internal testing", 2026.7.31. https://fortune.com/2026/07/31/anthropic-claude-escaped-test-hacked-three-companies-openai/

[^4]: Fox Business, "Google Gemini accessed protected systems of 3 real companies during artificial intelligence cybersecurity test", 2026.9. https://www.foxbusiness.com/technology/google-gemini-accessed-3-companies-systems-during-ai-cybersecurity-test / BetaNews, "Google confirms Gemini breached three companies during security test", 2026.9. https://betanews.com/article/gemini-ai-security-breach/

[^5]: The Register, Sysdig JadePuffer 보도, 2026.7. https://www.theregister.com/a/5266073 / Outpost24, "JADEPUFFER: How an Agentic Ransomware Attack Unfolded", 2026.7. https://outpost24.com/blog/jadepuffer-agentic-ransomware/

[^6]: Deccan Chronicle (Reuters 인용), "AI Messaging Scam Costs Italy's Top Bank Intesa Millions, Sources Say", 2026.9.25. https://www.deccanchronicle.com/amp/artificial-intelligence/ai-messaging-scam-costs-italys-top-bank-intesa-millions-sources-say-1990765 / Il Post, 「La truffa da 36 milioni alla banca Fideuram」, 2026.9.25. https://www.ilpost.it/2026/09/25/fideuram-truffa-whatsapp-ai/

[^7]: KBS, 「"잔고 9억 있다더니"…AI 위조 서류로 판사까지 속였다」, 2026.

[^8]: Infosecurity Magazine, "Google Fixes Zero Click Gemini Enterprise Flaw That Exposed Corporate Data", 2025.12. https://www.infosecurity-magazine.com/news/google-fixes-gemini-enterprise-flaw / Security Affairs, "GeminiJack zero-click flaw in Gemini Enterprise allowed corporate data exfiltration", 2025.12.11. https://securityaffairs.com/185574/hacking/geminijack-zero-click-flaw-in-gemini-enterprise-allowed-corporate-data-exfiltration.html

[^9]: Zscaler ThreatLabz, "Indirect Prompt Injection in Web Content Targets AI Agents", 2026. https://www.zscaler.com/jp/blogs/security-research/indirect-prompt-injection-web-content-targets-ai-agents / Infosecurity Magazine, "Indirect Prompt Injection in Web Content Targets AI Agents", 2026. https://infosecurity-magazine.com/news/indirect-prompt-injection-web

[^10]: Anthropic, "Disrupting the first reported AI-orchestrated cyber espionage campaign", 2025.11.13. https://www.anthropic.com/news/disrupting-AI-espionage / 보고서 원문(PDF): https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
