---
title: "CIA가 북한 주민에게 알려준 인터넷 사용법은, 사실 우리 모두의 사용법이다"
title_en: "What the CIA Told North Koreans About Internet Opsec Applies to Everyone"
subtitle: "첩보 캠페인의 수칙이 일상 보안 습관과 겹치는 지점"
description: "2024년 CIA 북한·중국·이란 정보원 모집 영상 수칙을 일반 사용자 위협 모델로 옮긴다. 시크릿 모드 오해, VPN 신뢰 이전, 기록 삭제의 한계를 정리한다."
abstract: |
  2024년 10월 2일 CIA는 한국어·중국어·페르시아어로 「안전하게 련락하는 방법」 영상을 배포했다. 집·직장 PC 금지, 최신 브라우저, 시크릿 모드, VPN/Tor, 기록 삭제, 사칭 주의가 핵심이다.
  같은 수칙은 일반인에게도 유효하다. 회사 장비의 관찰권, 시크릿 모드가 지우지 못하는 네트워크 흔적, VPN의 신뢰 이전, 「삭제=없음」이 아닌 「애초에 남기지 않기」가 실무 교훈이다.
  위협 모델에 따라 효과는 달라진다. 광고·피싱에는 충분하지만 국가급 감시·신뢰할 수 없는 OS(붉은별 등) 앞에서는 불충분하다. 보안 교육·정보 제공 목적. 법률 자문·투자 권유 아님.
summary_for_ai: |
  Korean security/opsec education column (not legal advice), date 2026-08-27.
  Source event: CIA 2024-10-02 online informant recruitment campaign in Mandarin, Korean, Farsi (X/FB/IG/Telegram/LinkedIn/YouTube/dark web). NK Korean version uses cultural language (련락, 웨브열람기, 콤퓨터).
  Thesis: tradecraft tips for life-or-death contacts largely equal everyday internet hygiene for civilians; difference is threat model.
  Tips mapped: (1) don't use home/work PCs — observer owns the device (MDM/DLP/corp TLS intercept); (2) patch browsers — n-days dominate; (3) incognito only clears local traces, not ISP/DNS/site logs — use with VPN/Tor; (4) VPN transfers trust, avoid hostile-jurisdiction/free VPNs; (5) delete history is weak vs forensics — prefer not leaving data + FDE; (6) phishing/domain reading; (7) account separation.
  Limits: insufficient vs North Korean state surveillance; Red Star OS watermarking; real targets likely overseas laborers/diplomats/IT earners with foreign connectivity.
  Follow-ups: 2025-05 Mandarin videos for Chinese officials (Reuters/Al Jazeera).
date: 2026-08-27
updated: 2026-08-27
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - CIA
  - 북한
  - OPSEC
  - 시크릿모드
  - VPN
  - Tor
  - 보안
  - 피싱
keywords:
  - "CIA 정보원 모집"
  - "북한 인터넷"
  - "시크릿 모드 오해"
  - "VPN 신뢰 이전"
  - "위협 모델"
  - "붉은별 OS"
  - "브라우저 기록 삭제"
  - "피싱"
group: korea-hacking
featured: true
featured_rank: 0
schema_type: BlogPosting
draft: false
robots: index,follow
---

<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 주석 풀지 말 것)
  <title>CIA가 북한 주민에게 알려준 인터넷 사용법은, 사실 우리 모두의 사용법이다 · VibeQuant</title>
  <meta name="description" content="2024년 CIA 북한·중국·이란 정보원 모집 영상 수칙을 일반 사용자 위협 모델로 옮긴다. 시크릿 모드 오해, VPN 신뢰 이전, 기록 삭제의 한계를 정리한다.">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "CIA가 북한 주민에게 알려준 인터넷 사용법은, 사실 우리 모두의 사용법이다",
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "2026-08-27",
    "keywords": ["CIA 정보원 모집", "북한 인터넷", "시크릿 모드 오해", "VPN 신뢰 이전", "위협 모델", "붉은별 OS", "브라우저 기록 삭제", "피싱"]
  }
  </script>
-->

# CIA가 북한 주민에게 알려준 인터넷 사용법은, 사실 우리 모두의 사용법이다

## 들어가며

2024년 10월 2일, 미국 중앙정보국(CIA)은 북한·중국·이란 주민을 대상으로 한 온라인 정보원 모집 캠페인을 시작했다. 한국어·중국어(만다린)·페르시아어 세 개 언어로 **"CIA에 안전하게 련락하는 방법"** 이라는 텍스트 전용 영상과 인포그래픽을 제작해 X(트위터), 페이스북, 인스타그램, 텔레그램, 링크드인, 유튜브, 그리고 다크웹에 동시 게시했다.

북한 대상 한국어판은 2분 10초 분량으로, "련락", "웨브열람기"(웹 브라우저), "콤퓨터", "사회교제망"(사회관계망), "로씨아" 같은 북한식 표기와 어휘를 그대로 썼다. 자막을 만든 쪽이 북한 문화어를 아는 사람이라는 뜻이다.

CIA 대변인은 "이 전선에서 우리의 노력은 러시아에서 성공했으며, 다른 권위주의 정권에 있는 사람들도 우리가 문을 열었다는 것을 알기를 바란다"고 밝혔다. 실제로 CIA는 2022년부터 러시아어 안내문을 SNS에 올렸고 2023년에는 영상까지 제작했다. 이번 캠페인은 그 확장판이다.

여기까지는 첩보의 영역이다. 그런데 영상에 담긴 수칙 자체를 뜯어보면, **국가정보기관이 목숨을 걸고 접촉하는 사람에게 권하는 보안 수칙과, 일반인이 일상에서 지켜야 할 인터넷 사용 습관이 거의 완전히 겹친다**. 이 칼럼은 그 겹침에 대한 이야기다.

---

## 1. CIA가 제시한 수칙

영상에 담긴 내용을 정리하면 다음과 같다.

### 기기와 장소

- **집이나 직장 컴퓨터를 사용하지 말 것**
- 자신과 쉽게 연결되지 않는 기기를 사용할 것

### 접속 방식

- **최신 버전의 웹 브라우저** 사용
- **비공개 열람 모드**(시크릿 모드) 사용
- **신뢰할 수 있는 암호화 VPN 또는 토르(Tor) 네트워크** 경유
- 미국에 비우호적인 국가(북한·러시아·중국·이란 등)에 소재한 VPN 업체는 이용하지 말 것

### 접속 후 처리

- 검색 기록(Search History) 삭제
- 웹 브라우저 사용 기록(Browser History) 삭제

> *"우(위)의 주의사항대로 한 후에 선생의 콤(컴)퓨터에서 검색리(이)력과 웨브(웹)열람기 사용리(이)력을 반드시 지우십시오"*

### 사칭 주의

- CIA를 사칭하는 웹사이트와 SNS 계정을 조심하고, 공식 사이트 주소와 계정인지 반드시 확인할 것

### 연락 시 제공할 정보

- 이름, 소재지, **본인의 실제 신원과 연결되지 않는** 연락처
- CIA가 관심 가질 만한 정보
- 회신은 보장되지 않으며 시간이 걸릴 수 있고, 스팸함으로 갈 수 있으니 확인할 것

---

## 2. 항목별로, 일반 사용자에게 그대로 옮겨보면

### "집이나 직장 컴퓨터는 쓰지 말라" → 장비의 소유자가 곧 관찰자다

북한 주민에게 이 수칙은 국가 감시망 회피를 뜻한다. 일반 직장인에게는 다른 층위지만 구조는 같다.

회사 노트북에는 대개 MDM(모바일 기기 관리) 에이전트, DLP(정보유출방지) 솔루션, 프록시 인증서가 들어가 있다. 사내 프록시에 회사 루트 인증서가 설치돼 있으면 HTTPS 트래픽도 중간에서 복호화해 들여다볼 수 있다. 즉 **"자물쇠 아이콘이 떴으니 안전하다"는 감각은 회사 장비에서는 성립하지 않는다**.

이직 준비, 노무 상담, 병원 진료 예약, 개인 금융 업무를 회사 장비에서 하지 말라는 조언은 여기서 나온다. 불법이라서가 아니라, **그 장비의 관찰 권한이 나에게 없기 때문이다**.

공용 PC방, 호텔 비즈니스센터, 도서관 단말도 동일하다. 소유자가 내가 아닌 장비는 전부 같은 범주다.

### "최신 브라우저를 쓰라" → 패치는 가장 값싼 보안 투자다

가장 평범해 보이지만 실효는 가장 크다. 브라우저 취약점은 대부분 클릭 한 번, 심지어 방문만으로 코드 실행까지 이어지는 종류다. 공격자가 실제로 활용하는 것은 이름 붙은 0-day보다 **패치가 나왔는데 사용자가 적용하지 않은 n-day**가 압도적으로 많다.

일반 사용자 버전으로 옮기면: 브라우저·OS 자동 업데이트를 끄지 말 것. "업데이트하면 느려진다"는 이유로 몇 달째 미루고 있는 상태가 가장 흔한 취약점이다.

### "시크릿 모드를 쓰라" → 여기서 가장 큰 오해가 발생한다

시크릿 모드가 지우는 것은 **내 기기 안에 남는 흔적**이다. 방문 기록, 쿠키, 세션, 자동완성 입력값. 그게 전부다.

시크릿 모드가 지우지 못하는 것은 상당히 많다. 

- ISP(인터넷 서비스 제공자)가 보는 접속 기록
- 회사·학교 네트워크 관리자가 보는 트래픽
- 내가 접속한 사이트가 기록하는 내 IP 주소
- DNS 질의 기록
- 라우터·공유기 로그

브라우저 시크릿 모드는 **익명 모드가 아니라 "이 기기를 나중에 다른 사람이 켰을 때 안 보이게 하는 모드"**에 가깝다. 국내에서 이 오해는 대단히 널리 퍼져 있고, 실제 피해로 이어진 사례도 적지 않다.

CIA가 시크릿 모드"만" 권하지 않고 VPN 또는 Tor를 <strong>함께</strong> 권한 이유가 정확히 이것이다. 로컬 흔적은 시크릿 모드가, 네트워크 경로 흔적은 VPN/Tor가 담당한다. **두 개는 서로를 대체하지 않는다.**

### "신뢰할 수 있는 VPN을 쓰라" → VPN은 감시를 없애는 게 아니라 감시자를 바꾸는 것이다

이 항목이 가장 중요하고, 가장 자주 잘못 이해된다.

VPN을 켜면 내 트래픽은 ISP에게 안 보이게 된다. 대신 **VPN 사업자에게 전부 보이게 된다**. 감시 가능성이 사라진 게 아니라 감시 주체가 KT·SKT에서 VPN 회사로 이전된 것뿐이다. 이것을 신뢰 이전(trust transfer)이라고 부른다.

CIA가 "북한·러시아·중국·이란 소재 VPN 업체는 쓰지 말라"고 명시한 이유가 여기 있다. 정보원 입장에서 VPN 사업자가 자국 정보기관에 로그를 넘길 수 있는 관할권에 있다면, VPN을 켜는 행위 자체가 자수와 같다.

일반 사용자 버전으로 옮기면 이렇게 된다:

> **무료 VPN 앱은 어떻게 수익을 내는가?**

서버 대역폭은 공짜가 아니다. 대가 없이 무료로 운영되는 VPN은 대개 트래픽 데이터를 판매하거나, 광고를 주입하거나, 사용자 기기를 프록시 노드로 되팔아 수익을 낸다. 앱스토어 상위권 "무료 VPN"들이 실제로 이런 모델로 적발된 사례는 반복적으로 보고돼왔다.

체크할 항목은 세 가지다: **① 사업자 소재 관할권, ② 무로그 정책에 대한 제3자 감사 이력, ③ 수익 모델의 투명성.** 셋 다 확인 안 되면 그 VPN은 ISP보다 나을 이유가 없다.

### "기록을 삭제하라" → 가장 강조된 항목이자, 실은 가장 약한 항목

CIA가 자막에서까지 "반드시"를 붙여 강조한 수칙이지만, 기술적으로는 이 목록에서 가장 방어력이 약하다.

브라우저에서 "기록 삭제"를 눌러도 시스템에는 흔적이 남는다. DNS 캐시, 시스템 이벤트 로그, 프리페치(Prefetch), 썸네일 캐시, 페이지 파일과 하이버네이션 파일에 남은 메모리 잔재, 파일시스템 저널. 포렌식 도구를 든 조사자에게 "기록 삭제" 버튼은 거의 장애물이 되지 않는다.

**여기서 일반 사용자가 가져갈 교훈은 "잘 지우는 법"이 아니라 관점의 전환이다.**

> 지웠으니 없다 (×)
> 애초에 남기지 않았으니 없다 (○)

중고 노트북·스마트폰을 팔기 전 "휴지통 비우기"만 하고 넘기는 관행, 회사 반납 PC를 그냥 반납하는 관행이 위험한 이유가 이것이다. 삭제는 지우는 게 아니라 **"덮어써도 된다"고 표시하는 것**에 가깝다. 실제로 필요한 것은 전체 디스크 암호화(BitLocker, FileVault)와 암호화 키 폐기, 혹은 공장 초기화다.

### "사칭 사이트를 조심하라" → 일반 사용자에게 실질 피해가 가장 큰 항목

북한 주민에게 가짜 CIA 사이트는 함정 수사를 뜻한다. 일반 사용자에게는 그냥 **피싱**이다. 그리고 통계적으로, 일반인이 실제로 돈과 계정을 잃는 경로의 압도적 다수가 여기다.

옮겨 적으면 다음과 같다.

- 검색 결과 최상단의 **광고 링크를 클릭해 은행·거래소에 접속하지 말 것.** 공식 도메인을 직접 입력하거나 북마크를 쓸 것. 검색 광고를 이용한 은행·암호화폐 거래소 사칭은 지금도 활발한 수법이다.
- 도메인을 끝에서부터 읽을 것. `kbstar.com.secure-login.xyz`의 실제 소유자는 `secure-login.xyz`다.
- 급하게 만드는 메시지는 그 자체가 신호다. "계정이 정지됩니다", "지금 확인하지 않으면" 같은 시간 압박은 판단력을 떨어뜨리기 위한 설계다.

### "본인 신원과 연결되지 않는 연락처를 쓰라" → 계정 분리

정보원에게는 생존 조건이지만, 일반인에게도 유효한 습관이다. 실명·주거래 이메일을 모든 서비스에 쓰면, 한 곳의 유출이 전체 신원의 유출이 된다.

메인 이메일, 금융 전용 이메일, 가입용 이메일을 분리하는 것. 별칭(alias) 기능이나 일회용 주소를 활용하는 것. 크리덴셜 스터핑(유출된 아이디·비번 조합을 다른 사이트에 대입하는 공격)이 여전히 잘 통하는 이유는 대부분의 사람이 이 분리를 하지 않기 때문이다.

---

## 3. 다만, 같은 수칙이 같은 안전을 주지는 않는다 — 위협 모델의 문제

여기까지 읽고 "그럼 나도 CIA 수준의 보안을 하고 있는 거네"라고 결론 내리면 곤란하다. 보안에서 가장 중요한 질문은 "무엇을 하느냐"가 아니라 **"누구로부터 지키느냐"**다. 이것을 위협 모델(threat model)이라고 부른다.

같은 수칙이라도 다음 내용을 명심해야 한다.

- **일반인 vs. 광고 추적기업**: 위 수칙들로 충분히 방어된다.
- **일반인 vs. 피싱 사기범**: 충분하다. 특히 사칭 주의 항목이 결정적이다.
- **직원 vs. 회사 감사**: 부분적으로만 방어된다. 회사 장비에 설치된 에이전트는 브라우저 아래 계층에서 동작한다.
- **북한 주민 vs. 북한 국가보위성**: **명백히 불충분하다**.

마지막 항목이 이 캠페인의 실질적인 한계다. 북한의 일반 주민에게는 애초에 국제 인터넷 접근권이 없다. 내부망인 광명망만 쓸 수 있고, 국제망 접속은 극소수 특권 계층에 한정된다. BBC 보도에서 한국외국어대 메이슨 리치 교수도 "러시아에서의 성공을 그대로 옮긴 것으로 보이지만, 대다수 북한 주민이 인터넷에 접근할 수 없다는 점에서 효과에는 의문이 있다"고 지적했다.

더 근본적인 문제는 단말 자체다. 북한의 자체 운영체제 붉은별(Red Star OS)은 열어보는 파일에 기기 고유 식별자를 은밀히 삽입하는 워터마킹 기능이 있는 것으로 오래전부터 분석돼왔다. **브라우저 기록을 지우는 것으로는 손댈 수 없는 계층이다**. 신뢰할 수 없는 OS 위에서 아무리 브라우저를 조심스럽게 써도, 그 브라우저를 실행시켜주는 주체가 이미 관찰자라면 게임은 시작 전에 끝나 있다.

그래서 이 영상의 실제 타깃은 평양의 일반 주민이 아니라, **해외 파견 노동자, 재외공관 인원, IT 외화벌이 조직원, 중국 접경 지역에서 중국 통신망을 잡을 수 있는 사람**으로 보는 것이 합리적이다. 실제로 CIA가 텔레그램과 다크웹에까지 동시 게시한 것은 그런 계층을 상정한 선택이다.

일반 사용자에게 이 대목의 교훈은 이렇게 정리될 수 있다.

> **보안 수칙은 절대적 안전을 주지 않는다. 특정 상대에 대한 특정 수준의 저항력을 줄 뿐이다.**
> 내 상대가 광고회사인지, 사기범인지, 회사인지, 국가인지에 따라 같은 조치의 값이 완전히 달라진다.

---

## 마치며 — 첩보 수칙과 생활 수칙 사이의 거리

이 사례에서 흥미로운 지점은, 세계 최고 수준의 정보기관이 목숨이 걸린 접촉자에게 권하는 수칙이 **놀랍도록 평범하다**는 사실이다. 최신 브라우저를 쓰고, 남의 장비를 쓰지 말고, 익명화 네트워크를 거치고, 흔적을 정리하고, 가짜 사이트를 조심하라. 특별한 도구도, 비밀 기술도 없다.

보안이 어려운 이유는 어려운 것을 모르기 때문이 아니라, **쉬운 것을 안 하기 때문이다**. 업데이트 알림을 미루고, 무료 VPN을 깔고, 검색 광고 링크로 은행에 접속하고, 시크릿 모드를 익명 모드로 착각하는 일상의 습관들이 실제 사고의 대부분을 만든다.

그리고 반대 방향의 교훈도 있다. 우리가 무심코 하는 인터넷 사용이 어디에 어떤 흔적을 남기는지를, **누군가는 그 흔적 때문에 목숨을 잃을 수 있는 환경에서 계산하고 있다**는 사실. 내가 남기는 데이터가 누구에게, 어떤 경로로, 얼마나 오래 보이는지를 한 번쯤 지도로 그려보는 일 — 그것이 이 첩보 캠페인이 뜻하지 않게 남긴 가장 실용적인 교훈일지 모른다.

---

## 참고 자료

**1차 자료**

- CIA 공식 발표문 — *CIA Posts Instructions in Mandarin, Korean, and Farsi on How to Securely Contact CIA* (2024.10.02)
  https://www.cia.gov/stories/story/cia-posts-instructions-in-mandarin-korean-and-farsi-on-how-to-securely-contact-cia
- CIA 공식 X(트위터) 게시물
  https://x.com/CIA/status/1841591032322154938

**주요 보도**

- BBC — *CIA seeks informants in North Korea, Iran and China*
  https://www.bbc.com/news/articles/cwyvng0jw78o
- Reuters (Deccan Herald 게재) — *CIA expands online recruitment of informants to China, Iran, North Korea*
  https://www.deccanherald.com/world/cia-expands-online-recruitment-of-informants-to-china-iran-north-korea-3217414
- VOA 한국어 — *CIA, 북한 정보원 온라인 모집…"핵무기 역량 파악에 집중"*
  https://www.voakorea.com/a/7809717.html
- RFA 자유아시아방송 — *CIA, 북 정보원 온라인 모집*
  https://www.rfa.org/korean/in_focus/nk_nuclear_talks/cia-employment-10022024151746.html
- 아시아경제 — *"련락 후 콤퓨터 검색리력 삭제하라"…CIA 북한 정보원 모집 나선 美*
  https://www.asiae.co.kr/article/2024100320101212022
- MBC — *[이 시각 세계] CIA, 북한 정보원 온라인 모집*
  https://imnews.imbc.com/replay/2024/nwtoday/article/6642509_36523.html
- SCMP — *CIA seeks informants in China, North Korea and Iran, recruiting online*
  https://www.scmp.com/news/china/article/3280854/cia-boosts-online-recruiting-efforts-china-iran-and-north-korea

**후속 경과**

- Reuters (Malay Mail 게재) — *CIA ups China spy drive with Mandarin videos for disillusioned officials* (2025.05.02)
  https://www.malaymail.com/news/world/2025/05/02/cia-ups-china-spy-drive-with-mandarin-videos-for-disillusioned-officials/175270
- Al Jazeera — *CIA releases videos coaxing Chinese officials to leak secrets to US* (2025.05.02)
  https://www.aljazeera.com/news/2025/5/2/cia-releases-videos-coaxing-chinese-officials-to-leak-secrets-to-us
