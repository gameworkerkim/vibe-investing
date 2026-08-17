---
title: "백도어의 경제학"
subtitle: "왜 중국산 공유기와 CCTV에는 문이 열려 있는가 — 사실과 오해"
description: "Zbtlink ENDLESSDOORS(CVE-2026-66747)로 본 출하 펌웨어 백도어. 원격 유지보수 비용 절감이 구매자·내부망으로 전가되는 구조, OEM/ODM·산차이 유통, 실무 대응과 한계를 정리한다."
abstract: |
  2026년 8월 5일 VulnCheck가 Zbtlink 공유기 20개 모델 출하 펌웨어에서 ENDLESSDOORS(CVE-2026-66747, CVSS 9.3) 루트 원격제어 임플란트를 공개했다.
  핵심은 국적 스파이 서사가 아니라, 원격 AS 비용 절감이 구매자 리스크로 전가되는 외부효과·정보 비대칭(레몬 마켓)이다.
  D-Link·Juniper·XZ·Tenda 사례와 대조해 의도성 스펙트럼을 정리하고, 모델명 인벤토리·이그레스 탐지·조달 기준 변경을 권고한다.
summary_for_ai: |
  Opinion/security-economics column (not investment advice), as of 2026-08-17.
  Thesis: ENDLESSDOORS is an incentive/accounting problem — outbound unauthenticated root remote-maintenance channel ships in OEM firmware; savings accrue to vendor, risk to buyers.
  Incident: VulnCheck (Jacob Baines) 2026-08-05; CVE-2026-66747 / CWE-506; CVSS 4.0 9.3; implant based on ycsunjane/rctl (2015); process masquerades as kworker; outbound C2 ports 7000/7001; no inbound listen.
  Vendor Zbtlink claimed after-sales remote support; researchers found it in all public firmware images, not samples only; no coordinated disclosure because behavior appeared intentional.
  Economics: AS cost avoidance, Akerlof lemon market (buyers cannot audit firmware), state as another demander of backdoors (Juniper ScreenOS Dual_EC).
  Misconceptions addressed: not China-only; not all intentional; patches/factory reset insufficient when implant is in vendor init.
  Practical: inventory by model (ZBT/Wiflyer/ODM), detect non-bracket kworker, alert on egress not only block, prefer replace over trust remaining image, change procurement (signed updates, EOL, PSIRT).
  Limits: device count estimates unverified; no proven wild exploitation; intent unresolved; CVE count is not a safety ranking. Not a stock tip.
date: 2026-08-17
updated: 2026-08-17
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - 백도어
  - ENDLESSDOORS
  - Zbtlink
  - 사이버보안
  - OEM
  - 공유기
  - CVE-2026-66747
keywords:
  - "ENDLESSDOORS"
  - "CVE-2026-66747"
  - "Zbtlink"
  - "백도어"
  - "공유기 펌웨어"
  - "원격 유지보수"
  - "OEM ODM"
  - "VulnCheck"
  - "kworker rctl"
group: korea-hacking
featured: true
featured_rank: 0
schema_type: BlogPosting
draft: false
robots: index,follow
---

# 백도어의 경제학

## 왜 중국산 공유기와 CCTV에는 문이 열려 있는가? - 사실과 오해

> **요약**
> 2026년 8월 5일, VulnCheck는 중국 Zbtlink(선전 즈보퉁전자, 深圳智博通电子) 공유기 20개 모델의 **출하 펌웨어 전량**에서 루트 권한 원격제어 임플란트를 발견했다고 공개했다. 이름은 ENDLESSDOORS, 식별번호는 CVE-2026-66747, CVSS 4.0 기준 9.3(Critical)이다.
> 이 사건의 핵심은 "중국이 스파이 짓을 했다"가 아니다. **원격 유지보수라는 비용 절감 수단이, 그 비용을 지불하지 않는 제3자(구매자)에게 리스크로 전가되는 구조**다. 백도어는 도덕의 문제이기 전에 개인과 기업의 디지털 자산과 리스크를 포괄한 회계의 문제라는 점을을 인지해야 한다.

백도어의 이름은 엔드레스 도어즈, ENDLESS DOORS라는 점은 이 사건이 얼마나 말이 안되는지를 설명하는 단어일 것이다.

---

## 1. 사건 정리, ENDLESSDOORS (CVE-2026-66747)

| 항목 | 내용 |
|---|---|
| 공개 | 2026년 8월 5일, VulnCheck(연구자 Jacob Baines) |
| 식별번호 | CVE-2026-66747 / CWE-506 (Embedded Malicious Code) |
| 심각도 | CVSS 4.0 = 9.3, `AV:N/AC:L/PR:N/UI:N/VC:H/VI:H/VA:H` |
| 정체 | 오픈소스 도구 `rctl`(remote control linux)의 개조판. OpenWrt 패키지 `librctl.so`로 통합 |
| 원본 | GitHub `ycsunjane/rctl` — 2015년 1월 14일 업로드 후 갱신 없음 |
| 위장 | 프로세스명 `kworker`. 실제 커널 스레드는 `[kworker/...]`로 대괄호 표시되나, 이 프로세스는 대괄호 없이 나타나며 VSZ가 0이 아니다 |
| 구성 파일 | `/usr/sbin/kworker`, `/usr/lib/librctl.so`, `/etc/kworker.cfg`, `/etc/init.d/skworker` |
| 통신 | **인바운드 리스닝 포트 없음.** 평문 TCP 아웃바운드로 C2에 접속(명령 채널 7000, 대화형 셸 콜백 7001), 약 35초 주기 재시도 |
| 인증 | 없음. 최초 등록은 39바이트(33바이트 분류 문자열 + LAN MAC)뿐. 서버·클라이언트 상호 검증 전무 |
| 실행 | 서버가 보낸 문자열을 `popen()`으로 uid 0 실행. 예약어 `rctlbash` 수신 시 PTY 할당 후 `/bin/sh` 리버스 셸 |
| 영향 | 20개 모델, 21개 펌웨어 이미지(2년 이상 축적분). Wiflyer·ZBT·ZBTWiFi 등으로 OEM/ODM 리브랜딩 유통 |
| C2 | `zbtctl.epplink[.]net`(알리바바 클라우드 상하이), `47.107.224[.]89`(알리바바 선전), `online-string[.]com`(Vultr), `rbdg4nzqadui[.]wikaba[.]com`(장쑤 둥윈 클라우드, DDNS) |

기술적으로 주목할 점은 **아웃바운드 설계**다. 열린 포트가 없으므로 Shodan으로 찾을 수 없고, NAT 뒤에 있어도 방화벽 3중 뒤에 있어도 무관하다. 장비가 스스로 전화를 걸기 때문이다. VulnCheck의 표현대로, 공격의 전부는 **"전화를 받는 것"**이다. 실제로 연구팀은 rctl 프로토콜을 go-exploit으로 구현해 자기 테스트 장비의 아웃바운드 세션을 가로채고 root 셸을 획득했다.

**제조사 반응.** Zbtlink는 이를 "애프터서비스 전용 원격 유지보수 기능"이며 "통상 샘플 유닛에만 남겨 고객의 소프트웨어 디버깅을 돕는 용도"라고 해명했고, 무단 접근에 사용된 적은 없다고 주장했다. 이후 해당 모델 판매를 중단하고 펌웨어를 다운로드 페이지에서 내렸으며, rctl 컴포넌트를 제거한 업데이트를 개발 중이라고 밝혔다.

다만 이 해명에는 두 가지 긴장이 있다. 첫째, 연구팀이 확인한 21개 이미지는 **샘플이 아니라 공개 다운로드 페이지의 정식 배포 펌웨어 전량**이었다. 둘째, Baines가 지적한 대로 정당한 유지보수 기능이라면 왜 커널 스레드 이름으로 위장하고 무인증 평문으로 구현했는지가 설명되지 않는다.

**그리고 VulnCheck는 사전 통보를 하지 않았다.** 조정 공개(coordinated disclosure)는 "벤더가 그 동작을 의도하지 않았다"는 전제 위에 서 있다. 파서의 메모리 손상 버그가 아니라 벤더 자신의 init 스크립트가 20개 모델·수년간에 걸쳐 구동해 온 컴포넌트라면 그 전제가 성립하지 않는다는 판단이었다. 이 선택 자체가 이 사건의 성격을 요약한다.

---

## 2. 백도어의 비용 구조 - 누가 이득을 보고, 누가 비용을 내는가?

### 2.1 원격 유지보수는 압도적으로 싸다

임베디드 장비 제조사의 사후지원 비용은 통화 시간, RMA 반송 물류, 현장 출동으로 구성된다. 저가 공유기 한 대의 마진이 몇 달러인 시장에서 보안 패치 RMA 한 건은 그 제품 수십 대의 이익을 지운다. 이 비용을 없애는 가장 값싼 수단이 **상시 아웃바운드 원격 접속 채널**이다. 코드는 이미 존재하고(GitHub), 통합 비용은 사실상 0이며, 인증과 암호화를 붙이는 작업만 생략하면 개발 공수도 들지 않는다.

2013년 D-Link 사건에서 연구자 Craig Heffner가 내린 추정도 정확히 이것이었다. 일부 프로그램이 설정을 자동 변경할 필요가 있었고, 웹서버에 이미 그 코드가 있었으며, 문제는 사용자가 바꿀 수 있는 비밀번호뿐이었다. 그래서 비밀번호를 우회하는 최상위 경로를 만들었다. 문제의 문자열 `xmlset_roodkcableoj28840ybtide`를 뒤집으면 `edit by 04882 joel backdoor`가 된다. 악의가 아니라 **편의**의 산물이라는 점이 오히려 무섭고 중국 제조업의 특징을 보여주고 있다.

### 2.2 절감은 제조사 것, 리스크는 구매자 것 - 전형적 외부효과

여기가 제조업 이익을 극대하기 위한 경제학이 자리 잡는다. 원격 채널로 발생한 **편익은 제조사가 회수**하고, 그 채널이 탈취될 때의 **손실은 구매자·구매자의 내부망·구매자의 고객**이 부담할 수 밖에 없다. 비용이 의사결정자에게 청구되지 않으므로, 합리적인 제조사는 계속 이 선택을 한다. 규제나 조달 기준으로 비용을 내부화하지 않는 한 구조는 바뀌지 않는다.

### 2.3 정보 비대칭 - 왜 보안에 투자한 제조사가 시장에서 사라진다.

구매자는 펌웨어를 열어 볼 수 없다. 바이너리를 언패킹하고 프로세스 목록을 비교할 수 있는 구매자는 전체의 0.1%도 되지 않는다. 관측 가능한 신호는 가격, 스펙 표, 리뷰 별점뿐이다. 이 상태에서 **보안 검증 비용을 지출한 제품과 지출하지 않은 제품은 진열대에서 구별되지 않는다.** 결과는 중고차 시장에서 딜러가 하는 말만 믿어야하는 애컬로프의 레몬 마켓과 같다. 검증 비용을 아낀 쪽이 가격 경쟁에서 이기고, 투자한 쪽이 퇴출된다. ENDLESSDOORS가 20개 모델, 2년 이상 축적된 펌웨어에 걸쳐 있었고 그동안 아무도 몰랐다는 사실이 이 비대칭의 크기와 리스크를 보여주고 있다.

### 2.4 국가는 백도어의 또 다른 지불자

수요 측에 국가가 들어오면 백도어의 가격은 올라간다. 2015년 12월 미국의 보안 장비 회사인 Juniper는 ScreenOS 펌웨어에서 **"승인되지 않은 코드"**를 발견했다고 공지했다. 두 건이었다. CVE-2015-7755는 SSH·Telnet에 심긴 하드코딩 비밀번호로, 문자열 자체가 `<<< %s(un='%s') = %u` 형태여서 로그 포맷 문자열처럼 보이도록 설계돼 있었다. CVE-2015-7756은 Dual_EC_DRBG의 Q 파라미터를 교체해 VPN 트래픽을 수동적으로 복호화할 수 있게 만든 것이었다. 미국 기업 제품, 미국 정부 기관이 대량 도입한 장비였다. 스노든 문서로 공개된 NSA ANT 카탈로그와 배송 중 장비 개조(interdiction) 기법도 같은 범주에 속한다.

즉 백도어는 **국적의 문제가 아니라 인센티브의 문제**다. 유지보수 비용을 아끼려는 제조사와 감시 역량을 원하는 국가는, 동일한 구조물을 서로 다른 이유로 백도어를 원한다.

격리 메모리 구역을 가지고 있는 ARM CPU 계열을 사용하는 애플은 이 경리된 메모리 환경을 뛰어넘는 버그가 알려졌다. 러시아의 해커들이 사용했고 중국에서 유행했으며 미국의 보안 기업에서 만든 해킹 프로그램으로 추정되고 있다. 

구글과 애플이 말하는 보안이 강하다는 신화와 마케팅에 우리는 살아가고 있다.

---

## 3. 오해 정리

### 오해 1 — "중국 제품에만 있다"

| 사례 | 연도 | 국적/성격 |
|---|---|---|
| D-Link·Planex·Alpha Networks 웹 인증 우회 (CVE-2013-6026) | 2013 | 대만/일본. User-Agent 문자열 하나로 무인증 관리자 접근. 2013년 10월 실제 악용 관측 |
| Juniper ScreenOS 승인되지 않은 코드 (CVE-2015-7755/7756) | 2015 | 미국. 하드코딩 비밀번호 + VPN 복호화 |
| XZ Utils 백도어 (CVE-2024-3094) | 2024 | 오픈소스 공급망. 다년간 신뢰를 축적한 커미터가 삽입 |

CERT/CC가 2026년 Tenda 사건 자료에서 정리한 것처럼, 출하 제품 펌웨어에 2차 인증 경로가 남아 장기간 생존하는 패턴은 D-Link, Netgear, TP-Link 등 다수 벤더에서 반복적으로 관측됐다. 중국 제조사의 빈도가 높은 것은 사실이지만, **원인은 국적이 아니라 저가 대량 OEM이라는 사업 모델**을 살펴보아야 한다.

### 오해 2 — "모든 백도어는 의도적이다"

의도성은 이진값이 아니라 스펙트럼이다. 같은 "중국 장비 취약점"이라도 성격이 전혀 다르다.

- **방치된 오픈소스의 재사용** — ENDLESSDOORS의 기반 `rctl`은 2015년 1월 업로드 후 단 한 번도 갱신되지 않은 개인 저장소다. 원저자에게 악의가 있었다는 증거는 없다. 문제는 그것을 20개 모델 출하 펌웨어에 root로 상주시킨 통합 결정이다.
- **디버그 경로가 살아남은 경우** — Tenda CVE-2026-11405(CERT/CC VU#213560, 2026년 7월 6일 공개)는 `/bin/httpd`의 `login()` 함수가 MD5 기반 정상 인증 실패 시 **대체 코드 경로**로 넘어가는 구조다. 소유자가 어떤 비밀번호를 설정해도 무의미하다. 영향은 FH1201, W15E, AC10, AC5, AC6 계열 5개 펌웨어 빌드. CERT/CC는 2026년 5월 19일 벤더에 통보했으나 7주간 응답이 없어 패치 없이 공개했다.
- **설계 관행이 만든 사실상의 마스터키** — Huawei HG630 V2(CVE-2020-37220, CVSS 4.0 8.7, CWE-798). 기본 비밀번호가 시리얼 번호 뒤 8자리인데, 그 시리얼을 `/api/system/deviceinfo`에서 **무인증으로** 조회할 수 있었다. 숨긴 문이 아니라, 잠그지 않은 문이다.
- **평범한 메모리 취약점** — Dahua 카메라 CVE-2025-31700/31701(각 CVSS 8.1, Bitdefender 보고). 전자는 ONVIF 요청 핸들러의 스택 버퍼 오버플로, 후자는 RPC 파일 업로드 핸들러 오버플로다. Dahua는 2025년 7월 7일 패치를 배포하고 7월 23일 어드바이저리를 공개했다. 다만 후자의 업로드 엔드포인트가 **문서화되지 않은 경로**였다는 점은 앞의 범주와 겹친다.
- **백도어가 아닌 사건** — 2025년 7월 23일 룩셈부르크 국가 통신망(POST Luxembourg) 마비는 백도어가 아니었다. 특수 제작된 트래픽이 Huawei VRP 기반 기업용 라우터를 무한 재부팅 루프에 빠뜨린 미공개 취약점 문제였고, 유선·4G·5G와 긴급통화(112)가 3시간 이상 중단됐다. 이 사건의 문제는 백도어 여부가 아니라 **공개의 부재**다. 발생 후 10개월이 지난 2026년 5월까지 CVE가 발급되지 않았고, 동일 장비를 쓰는 다른 통신사에 대한 공개 경고도 없었다.

### 오해 3 — "패치가 나오면 끝난다"

ENDLESS DOORS에는 이 논리가 통하지 않는다. 비밀번호 변경도, 공장 초기화도 답이 아니다. 임플란트가 펌웨어 안에 있고 벤더의 init 스크립트가 부팅 때마다 실행하기 때문이다. 설령 rctl을 제거한 펌웨어가 나온다 해도, **처음에 그것을 넣어 출하한 이미지의 나머지 부분을 신뢰할 것인가**라는 질문이 남는다. VulnCheck의 권고가 "패치"가 아니라 "교체, 최소한 엄격한 이그레스 통제 + 해당 LAN을 비신뢰 구간으로 취급"인 이유다. 이것은 패치 문제가 아니라 **장비 신뢰(device trust) 문제**다.

앤드레스 백도어 사건을 만든 장비는 그냥 버리고 교체하는 것이 낫다. 다른 대안은 너무 복잡하고 리스크가 크기 때문이다.

---

## 4. 수호지 경제학 - OEM/ODM과 '산차이(山寨)' 원가 구조

취약점 하나의 파급력을 결정하는 것은 심각도 점수가 아니라 유통 구조에 집중해야 한다.

Zbtlink는 OEM/ODM 서비스를 공개적으로 판매한다. 즉 동일한 하드웨어와 동일한 펌웨어가 원하는 브랜드 이름을 달고 글로벌 시장에 출고된다. "Wiflyer WG3526"은 ZBT 라벨을 붙인 쌍둥이와 동일한 취약 장비다. 그래서 VulnCheck의 권고 1번은 "브랜드가 아니라 **모델명으로 재고를 조사하라**"이며, 연구팀 스스로 "실제 영향 대수는 우리가 검사한 20개 모델보다 클 수 있지만 나머지를 열거할 방법이 없다"고 명시했다.

빠른 출시와 최저 원가를 목표로 하는 개발 문화에서 보안 검증은 가장 먼저 삭제되는 항목이다. 전담 보안 인력, 펌웨어 SBOM, 서드파티 라이브러리 수명 관리, 서명된 업데이트 채널은 모두 고정비다. 대당 마진이 몇 달러인 제품에서 이 고정비는 정당화되지 않는다. **"답이 없다"는 표현은 감정적 과장이 아니라 손익계산서의 결론이다.**

아마도 ZBTLink에 내부 개발팀이 존재하지 않을지도 모른다. 어디서 왔는지 모르지만 원래 펌웨어 개발자도 없고 일부 UI를 교체하는 수준의 외주 개발팀만 존재할지도 모른다. 

---

## 5. 검증된 사건 연표

| 시점 | 대상 | 성격 | 식별번호 |
|---|---|---|---|
| 2013.10 | D-Link / Planex / Alpha Networks 라우터 | 백도어(User-Agent 인증 우회), 실제 악용 관측 | CVE-2013-6026 |
| 2015.12 | Juniper ScreenOS | 백도어(하드코딩 비밀번호 + VPN 복호화) | CVE-2015-7755 / 7756 |
| 2021.01 | FiberHome HG6245D / RP2602 | 백도어 28건 + 취약점. IPv6 방화벽 부재. 2021년 2월 최신 펌웨어(RP2613)도 취약 확인 | CVE-2021-27143–27164 등 |
| 2022.06 등록 | Xiongmai DVR/NVR/IP 카메라 | 백도어(`macGuarder`·`dvrHelper` 내 정적 root 자격증명) | CVE-2021-41506 |
| 2025.07 | Dahua 카메라 | 취약점(ONVIF 스택 오버플로 / 미문서화 업로드 엔드포인트). 2025.7.7 패치 | CVE-2025-31700 / 31701 |
| 2025.07 | Huawei VRP 기업용 라우터 (룩셈부르크 POST) | 미공개 취약점에 의한 전국망 3시간+ 마비. **CVE 미발급** | — |
| 2026.07 | Tenda 5개 펌웨어 빌드 | 백도어(인증 폴백 경로). 패치 없음 | CVE-2026-11405 |
| 2026.08 | Zbtlink 20개 모델 | 백도어(출하 펌웨어 내장 root 원격제어) | CVE-2026-66747 |

---

## 6. 실무 대응

**1) 모델명 기준 인벤토리.** 브랜드 로고가 아니라 케이스와 관리 페이지의 모델 번호로 확인한다. Zbtlink, ZBT, ZBTWiFi, Wiflyer, 그리고 출처가 불분명한 무브랜드 셀룰러 CPE가 대상이다. 호텔·지사 사무실 장비, 차량 탑재 라우터, 협력업체가 설치한 장비가 특히 누락되기 쉽다.

**2) 프로세스 목록 확인.** SSH 접속 후 `ps`. 대괄호 없는 `kworker`이면서 VSZ가 0이 아닌 프로세스가 임플란트다. 통상 2개가 보인다. 파일 시스템에서는 `/usr/sbin/kworker`, `/usr/lib/librctl.so`, `/etc/kworker.cfg`, `/etc/init.d/skworker`를 확인한다.

**3) 차단이 아니라 탐지 우선.** C2 도메인·IP를 이그레스와 리졸버에서 막되, **차단만 하지 말고 알림을 걸어야 한다.** 차단만 하면 감염 자산의 존재 자체가 보이지 않는다. 네트워크 인프라 세그먼트에서 나가는 7000/7001 아웃바운드는 별도로 감시한다. VulnCheck가 Suricata·Snort·YARA 룰을 함께 공개했으므로 그대로 적용할 수 있다.

**4) 신뢰 기준으로 판단.** 셸 접근이 가능하면 init 스크립트를 비활성화할 수 있으나, 그 시점부터 "이것을 넣어 출하한 이미지의 나머지"를 신뢰하는 셈이다. 실 트래픽을 처리하는 장비라면 교체가 정답이다. 즉시 교체가 불가능하면 최소한 엄격한 이그레스 통제 아래로 옮기고 해당 LAN을 비신뢰 구간으로 취급한다.

**5) 조달 기준을 바꾸는 것이 유일한 근본 대응.** 개별 사용자가 펌웨어를 감사할 수는 없다. 바꿀 수 있는 것은 구매 조건이다. 서명된 업데이트 채널, 명시된 보안 지원 종료일(EOL), CVE 대응 이력, 공개 연락 창구(security.txt 또는 PSIRT) 유무. Tenda 사례에서 CERT/CC의 통보에 7주간 무응답이었다는 사실은, 그 자체가 가격표와 함께 평가되어야 하는 정보다.

---

## 7. 현실적 한계점

이 칼럼의 주장에는 다음 한계가 있다. 정말 몇 대가 이 장비 계열인지 OEM 출시이기 때문에 알 도리가 없다.

1. **"10만 대 이상"은 추정치다.** VulnCheck의 기술 블로그는 이 숫자를 제시하지 않았다. 로이터를 포함한 보도와 2차 분석에서 유통 규모를 근거로 산출된 값이며, OEM 리브랜딩 물량을 열거할 방법이 없다는 점을 연구팀 스스로 인정했다. 실제 대수는 더 클 수도, 더 작을 수도 있다.

2. **실제 침해가 입증된 것은 아니다.** VulnCheck는 자사 테스트 장비에서 탈취를 실증했고 펌웨어 이미지에서 임플란트를 확인했다. 그러나 야생에서 이 C2가 실제로 명령을 내렸다는 증거, 또는 특정 위협 행위자가 이를 운용했다는 귀속(attribution)은 공개되지 않았다. **"장악 가능한 상태"와 "장악되었다"는 다르다.**

3. **의도성은 여전히 미확정이다.** VulnCheck는 의도적 삽입으로 판단했고, Zbtlink는 AS용 기능이라고 주장한다. 정황(전량 배포 펌웨어 포함, 커널 스레드명 위장, 무인증 평문)은 벤더 해명과 충돌하지만, 내부 의사결정 문서가 공개되지 않은 상태에서 최종 판정은 불가능하다. 이 칼럼은 인센티브 구조를 설명할 뿐 동기를 확정하지 않는다.

4. **"경쟁 제품 방해용 백도어"는 다루지 않았다.** 업계에서 자주 언급되는 시나리오지만, 공개적인 사례를 다루기에는 국가 안보의 문제일지도 모르기 때문에 삭제했다.

5. **CVE는 실태 지표가 아니다.** 룩셈부르크 사례가 보여주듯 심각한 사건에도 CVE가 발급되지 않을 수 있다. 반대로 연구자가 많이 들여다보는 벤더는 CVE 수가 늘어난다. **CVE 건수로 벤더 간 안전성을 비교하는 것은 통계적으로 무의미하다.** 5절 연표는 사건 목록이며 순위표가 아니다.

6. **국가별 비교의 근본적 비대칭.** 서방 제품의 백도어(Juniper, D-Link)는 상당 부분 벤더 자체 공지나 독립 연구로 드러났고, 중국 제품은 외부 연구자에 의해 드러나는 경향이 있다. 반대로 서방 정보기관의 개입은 스노든 유출 같은 예외적 사건이 있어야 관측된다. **관측된 사례 분포는 실제 분포가 아니라 관측 역량의 분포일 수 있다.**

7. **"교체하라"는 권고의 실행 가능성.** 지사 20곳에 저가 CPE를 깔아 놓은 중소기업에게 전량 교체는 즉시 집행 가능한 선택이 아니다. 이 칼럼의 권고는 리스크의 방향을 제시하는 것이고, 실제 집행은 예산·계약·가용성 제약 안에서 단계적으로 이뤄질 수밖에 없다.

8. **본 칼럼은 공개 자료에만 근거한다.** 필자는 해당 장비를 직접 리버스 엔지니어링하거나 C2 인프라를 독립 관측하지 않았다. 기술 세부는 VulnCheck 어드바이저리와 CERT/CC 공지 등 1차 자료를 재구성한 것이다.

---

## 맺으며.

ENDLESS DOORS는 특별히 정교하지 않다. 프로토콜의 어휘는 두 개다. *이걸 root로 실행해라*, 그리고 *root 셸을 달라*. 암호화도, 인증도, 서버 검증도 없다. 2015년에 업로드되고 잊힌 개인 저장소 코드에서 출발한 것이다.

그런데도 약 20개 모델, 2년치 펌웨어를 타고 전 세계 가정과 사무실과 차량으로 나갔다. 정교함이 필요하지 않았기 때문이다. **필요했던 것은 아무도 그 비용을 청구받지 않는 구조뿐이었다.** 그리고 그 구조는 패치로 고쳐지지 않는다.

그리고 우리는 중국의 제조업에 기대서 살아가고 있고 그걸 검증할 수 없이 미국과 글로벌 회사의 브랜드로 이들 제품을 만나고 있다.

---

## 레퍼런스

**ENDLESSDOORS / Zbtlink**
- Jacob Baines, "ENDLESSDOORS Is Phoning Home. Pick Up.", VulnCheck, 2026-08-05 — https://www.vulncheck.com/blog/zbt-endlessdoors
- VulnCheck Advisory, "ENDLESSDOORS: Zbtlink Router rctl/kworker Phone-Home Root Implant (CVE-2026-66747)" — https://www.vulncheck.com/advisories/zbt-endlessdoors
- CVE Record CVE-2026-66747 — https://www.cve.org/CVERecord?id=CVE-2026-66747
- 원본 오픈소스 `ycsunjane/rctl` — https://github.com/ycsunjane/rctl
- The Register, "Chinese router vendor denies its firmware contains backdoors – but pauses downloads to fix security issues anyway", 2026-08-06 — https://www.theregister.com/security/2026/08/06/chinese-router-vendor-denies-its-firmware-contains-backdoors-but-pauses-downloads-to-fix-security-issues-anyway/
- The Hacker News, "Chinese-Made Zbtlink Routers Ship With Backdoor That Opens Unauthenticated Root Shells" (Zbtlink 공식 입장 추가 업데이트 포함) — https://thehackernews.com/2026/08/chinese-made-zbtlink-routers-ship-with.html
- Cloud Security Alliance Labs, "Zbtlink ENDLESSDOORS Supply Chain" 리서치 노트, 2026-08-06 — https://labs.cloudsecurityalliance.org/research/csa-research-note-zbtlink-endlessdoors-supply-chain-20260806/
- Security Affairs, "Researchers Discover Hidden Backdoor in 20 Router Models Allowing Remote Root Access" — https://securityaffairs.com/196785/security/researchers-discover-hidden-backdoor-in-20-router-models-allowing-remote-root-access.html

**Tenda (CVE-2026-11405)**
- CERT/CC VU#213560, "Tenda firmware (multiple versions) contains hidden authentication backdoor", 2026-07-06 — https://kb.cert.org/vuls/id/213560
- The Hacker News, "CERT/CC Warns of Hidden Admin Backdoor in Tenda Router Firmware" — https://thehackernews.com/2026/07/certcc-warns-of-hidden-admin-backdoor.html
- SecurityWeek, "Unpatched Backdoor in Tenda Firmware Grants Admin Access to Devices" — https://www.securityweek.com/unpatched-backdoor-in-tenda-firmware-grants-admin-access-to-devices/

**Huawei**
- The Record, "Huawei zero-day attack behind last year's crash of Luxembourg's entire telecoms network", 2026-05 — https://therecord.media/huawei-zero-day-behind-last-year-luxembourg-telecom-outage
- VulnCheck Advisory, "Huawei HG630 V2 Router Authentication Bypass via Serial Number (CVE-2020-37220)" — https://www.vulncheck.com/advisories/huawei-hg630-v2-router-authentication-bypass-via-serial-number
- Exploit-DB 48310 (Eslam Medhat, 2020-04-13) — https://www.exploit-db.com/exploits/48310

**Dahua**
- The Hacker News, "Critical Dahua Camera Flaws Enable Remote Hijack via ONVIF and File Upload Exploits", 2025-07 — https://thehackernews.com/2025/07/critical-dahua-camera-flaws-enable.html
- Security Affairs, "Dahua Camera flaws allow remote hacking. Update firmware now" — https://securityaffairs.com/180602/hacking/dahua-camera-flaws-allow-remote-hacking-update-firmware-now.html

**FiberHome / Xiongmai**
- Pierre Kim, "Multiple vulnerabilities found in FiberHome HG6245D routers", 2021-01-12 — https://pierrekim.github.io/blog/2021-01-12-fiberhome-ont-0day-vulnerabilities.html
- NVD, CVE-2021-41506 (Xiongmai DVR/NVR/IP camera static root credentials) — https://nvd.nist.gov/vuln/detail/CVE-2021-41506

**중국 이외 사례**
- Rapid7, "CVE-2015-7755: Juniper ScreenOS Authentication Backdoor", 2015-12-20 — https://www.rapid7.com/blog/post/2015/12/20/cve-2015-7755-juniper-screenos-authentication-backdoor/
- Matthew Green, "On the Juniper backdoor" — https://blog.cryptographyengineering.com/2015/12/22/on-juniper-backdoor/
- Checkoway et al., "A Systematic Analysis of the Juniper Dual EC Incident" — https://eprint.iacr.org/2016/376.pdf
- SecurityWeek, "Backdoor Vulnerability Reported in D-Link Routers" (CVE-2013-6026), 2013-10 — https://www.securityweek.com/backdoor-vulnerability-reported-d-link-routers/
- Krebs on Security, "Important Security Update for D-Link Routers", 2013-12 — https://krebsonsecurity.com/2013/12/important-security-update-for-d-link-routers/
