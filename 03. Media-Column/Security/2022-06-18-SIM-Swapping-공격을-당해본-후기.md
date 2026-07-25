---
title: "SIM Swapping 공격을 당해본 후기"
title_en: ""
subtitle: ""
description: "최근 암호화폐 거래소 사용자들을 상대로 사용자의 유심을 복사하여 코인을 도둑질하는 SIM Swapping 공격이 빈번해지고 있다고 칼럼을 쓴 바 있다."
abstract: |
  최근 암호화폐 거래소 사용자들을 상대로 사용자의 유심을 복사하여 코인을 도둑질하는 SIM Swapping 공격이 빈번해지고 있다고 칼럼을 쓴 바 있다. 필자는 이 공격을 방어하기 위한 방법도 자세히 설명했다. 지난 목요일 밤, 필자는 SIM Swapping 공격을 노출된 것 같다.
summary_for_ai: |
  전자신문(RPM9) 게재 김호광 칼럼. 날짜 2022-06-18. 주제: SIM스와핑, 보안.
  원문: https://www.rpm9.com/news/articleView.html?idxno=118545. 정보 제공 목적이며 투자 권유가 아님. 원문은 각 언론사에 귀속.
date: 2022-06-18
updated: 2022-06-18
author: "김호광 (Dennis Kim)"
lang: ko
media: "전자신문(RPM9)"
source_url: "https://www.rpm9.com/news/articleView.html?idxno=118545"
tags:
  - "미디어칼럼"
  - "전자신문(RPM9)"
  - "SIM스와핑"
  - "보안"
keywords:
  - "SIM스와핑"
  - "보안"
  - "전자신문(RPM9)"
  - "김호광 칼럼"
group: media-security
featured: false
featured_rank: 99
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---

<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 주석 풀지 말 것)
  값 원천은 위 frontmatter.
  <title>SIM Swapping 공격을 당해본 후기 · VibeQuant</title>
  <meta name="description" content="최근 암호화폐 거래소 사용자들을 상대로 사용자의 유심을 복사하여 코인을 도둑질하는 SIM Swapping 공격이 빈번해지고 있다고 칼럼을 쓴 바 있다.">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "SIM Swapping 공격을 당해본 후기",
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "2022-06-18",
    "keywords": ["SIM스와핑", "보안", "전자신문(RPM9)", "김호광 칼럼"],
    "publisher": { "@type": "Organization", "name": "전자신문(RPM9)" }
  }
  </script>
-->

# SIM Swapping 공격을 당해본 후기

2022.06.18 김호광 / Dennis Kim

---

최근 암호화폐 거래소 사용자들을 상대로 사용자의 유심을 복사하여 코인을 도둑질하는 SIM Swapping 공격이 빈번해지고 있다고 칼럼을 쓴 바 있다. 필자는 이 공격을 방어하기 위한 방법도 자세히 설명했다. 지난 목요일 밤, 필자는 SIM Swapping 공격을 노출된 것 같다. 아무 일도 없었지만 갑자기 아이폰의 전화와 문자, 데이터 통신이 두절되었고 곧이어 유심은 아무런 이유 없이 잠겼다.

심야에 유심이 잠기자 할 수 있는 일은 없었다. 그 동안 필자는 보안 관제가 내 눈에서 확인되고방화벽 보안 업데이트가 충실한 회사 인터넷과 집 인터넷만 와이파이 접속을 했다.

일반적으로 유심을 복사했을 경우 할 수 있는 것은 가입한 웹사이트 및 서비스의 패스워드를 변경해서 개인 정보를 탈취하여 2차 범죄를 저지르는 것이다.

유심 스와핑 공격의 목적은 가상화폐 거래소의 패스워드를 초기화하고 출금 인증 번호를 해커가 복사함 유심을 넣은 폰으로 받아 가상화폐를 가로채는 것이다. 만일 필자가 유심에 보안 패스워드를 입력하지 않았다면 어떻게 되었을까? 아마도 가상화폐 거래소에 보관된 코인들은 도둑질 당했을 것이다. 유심이 잠기고 난 폰은 말 그대로 벽돌이 되기 때문에 이통사 고객 서비스 센터에서 빠른 대응은 쉽지 않다. 눈뜨고 코 베이는 사태가 일어날 수 있었던 것이다.

다행인 것은 유심 보안을 위해 필자의 칼럼처럼 유심에 보안 패스워드를 입력했기 때문에 해커들에게 유심을 빼앗기지 않았던 것이다.

유심스와핑은 아무리 보안 전문가라도 방어가 불가능하다. 다만 유심에 보안 패스워드를 등록하고 각 서비스에 OTP로 계정을 보호하는 수 밖에 없다. 유심 보안 설정을 하는 방법은 간단하다.

안드로이드 : 설정→ 잠금화면(생체인식) 및 보안→ 기타 보안 설정→ USIM 잠금 설정→ 초기 비밀번호 ‘0000’ 입력→ 확인

## 아이폰 : 설정→ 셀룰러→ SIM PIN→ 초기 비밀번호 ‘0000’ 입력→ 완료

심 스와핑 공격이 빈번한 미국 등에서 심스와핑 공격을 막기 위해 보안 가이드라인을 만들고 기술적인 보안을 추가 검토하고 있다. 미국의 T-Mobile은 심 카드를 변경하기 위해서는 2명의 관리자가 승인하는 체계로 변경함으로써 해커가 이통사 내부자 혹은 내부망에서 심 스와핑 공격의 가능성을 낮췄다.

미국 연방 통신 위원회(Federal Communications Commission)는 2021년 10월 유심 스와핑 공격을 막기 위한 가이드라인 초안을 발표하면서 적극 대처했다. 이런 가이드라인과 이통사의 보안 강화까지 몇년의 시간이 소요될 것으로 보인다.

이제 우리는 스마트폰에 많은 개인 정보와 프라이버시, 디지털 자산을 보유하고 있다. 스마트폰 보안의 중요성도 날로 높아가고 있지만, 막상 당하면 대책이 없는 것이 유심 스와핑 공격이다.

필자가 경험해본 유심 스와핑 공격의 교훈은 보안은 개인이 주의 깊고 철저하게 지켜야 한다는 것이다.

---

## 원문 링크

- [전자신문(RPM9) — SIM Swapping 공격을 당해본 후기](https://www.rpm9.com/news/articleView.html?idxno=118545)

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다. 원문은 각 언론사에 귀속됩니다.*
