# 차가운 데이터센터 바닥에 장기 방치 싸이월드 서버 데이터 복원 · 보안 패치 · 클라우드 이관 종합 플레이북

**문서 버전** v1.0
**작성 기준일** 2026-08-18
**대상** 서버 약 300대 / CentOS(2024년 이후 패치 없음) / MySQL(2021-08 이후 패치 없음) / Nginx(패치 없음)
**이관 대상** 파일 데이터 3.8 PB → AWS S3, DB 10 GB → AWS Managed DB
**투입 인력** SE 10명 (시그마체인 주장)
**신뢰도 표기** 본 문서의 정량 추정치에는 CTI Admiralty Code 방식의 신뢰도 등급을 병기한다. (A ~ F: 출처 신뢰도 / 1 ~ 6: 정보 확실성)

---

오디세우스는 고향으로 돌아가기 위해 트로이에서 전쟁을 했다. 교착된 전쟁을 뚫기 위해 거대한 목마를 만들어 트로이 성안으로 잠입하는데 성공했다. 이 오래된 신화는 보안 업계에서 트로이 목마라는 악성 코드의 모티브가 되었다. 유지보수 인력이 사라지고 데이터센터에 있다가 IDC 비용을 내지 못해서 방치된 서버의 전원이 내려가고 IDC 센터 한 구석 바닥에 서버가 있다면 단순히 데이터 복원의 일이 아니다. 


## 0. 시작하는 말 - 왜 "부팅"이 복구의 시작이 아닌가?

### 0.1 장기 방치된 서버는 전원을 넣는다고 실행 가능한 상태가 되지 않는다

장기간 방치된 서버는 전원 버튼을 누르는 순간 서비스가 살아나는 물건이 아니다. 2년의 무전원·무패치 기간은 서버를 "잠들어 있던 상태"로 보존하지 않는다. 그 기간 동안 다음 세 가지가 동시에 진행된다.

1. **물리적 열화** — 무전원 상태의 SSD 셀 전하 손실, HDD 베어링·윤활유 고착(stiction), RAID 컨트롤러 배터리/슈퍼캐패시터 수명 종료, CMOS 배터리 소진에 따른 시스템 시각 초기화. 하드웨어는 "쉬는" 것이 아니라 "늙는다".

2. **논리적 부패** — 마지막 종료가 정상 종료(graceful shutdown)가 아니었다면 파일시스템 저널, DB 리두 로그, 애플리케이션 큐가 모두 미완결 상태로 남아 있다. 부팅과 함께 자동 복구가 시작되면, 그 복구가 **증거와 데이터를 동시에 훼손**될 수 있다.

3. **보안 부채 누적** — OS·DB·웹서버가 2년간 패치되지 않은 상태에서, 그 2년간 공개된 원격 코드 실행 취약점은 전부 "이미 무기화되어 유통되는" 상태다. 즉, 이 서버들은 패치 관점에서 2년 전이 아니라 **2년치 취약점을 한꺼번에 안고 있는 현재**에 놓인다.

여기서 가장 위험한 오판은 "전원이 꺼져 있었으니 침해도 없었다"는 추론이다. 전원이 꺼진 시점 **이전**에 침해가 있었다면, 그 침해는 디스크 위에 그대로 동면(dormant)하고 있다. 백도어는 전원이 들어오기를 기다린다. 따라서 복원 작업의 첫 단계는 부팅이 아니라 **사전 점검과 침해 전제(assume breach) 조사**여야 한다.

### 0.2 오디세이의 목마 — 성벽을 무너뜨린 것은 공성추가 아니었다

『오디세이』가 전하는 트로이 함락의 핵심은 전투력의 우열이 아니다. 10년을 버틴 성벽은 정면 공격으로 뚫리지 않았다. 성이 무너진 것은 **성 안의 사람들이 스스로 문을 열고, 스스로 목마를 끌어들였기 때문**이다.

이 비유가 이 프로젝트에 정확히 대응하는 지점은 세 가지다.

| 트로이 | 본 복원 프로젝트 |
|---|---|
| 10년을 버틴 성벽 | 방화벽, 망분리, 접근통제 — 정면으로는 견고하다 |
| 성 안으로 들여온 목마 | 검증 없이 운영망으로 반입되는 방치 서버·디스크·백업 테이프 |
| "전리품이니 안전하다"는 판단 | "우리 자산이었으니 신뢰할 수 있다"는 판단 |
| 카산드라·라오콘의 경고 무시 | 사전 점검·포렌식 절차를 일정 압박으로 생략 |
| 밤중에 안에서 열린 문 | 부팅 즉시 활성화되는 동면 백도어·크론·systemd 유닛 |

**목마를 성 안으로 끌어들인 행위는 단 한 번의 결정이었고, 되돌릴 수 없었다.** 이 프로젝트에서 그에 해당하는 단 한 번의 결정은 *"검증되지 않은 방치 서버를 운영망 또는 AWS 신규 환경에 직결하는 것"* 이다. 사소한 보안적 실수 — 임시로 열어둔 22번 포트 하나, 옛 관리자 계정 하나, 백업 스크립트에 하드코딩된 자격증명 하나 — 가 3.8 PB 전체의 신뢰성을 무너뜨린다.

그리고 싸이월드는 **보안 사고의 파급이 기술 이슈로 끝나지 않는 자산**이다. 전 국민이 자신의 사진·일기·방명록·일촌평이 그 안에 있다는 것을 알고 있고, 이미 과거의 데이터 유출 사건들로 인해 사회적 민감도가 최고 수준으로 형성되어 있다. 여기서 발생하는 유출은 "서버 300대 사고"가 아니라 "국민 데이터 사고"로 규정된다. 따라서 본 프로젝트의 보안은 **아무리 강조해도 과하지 않으며, 일정보다 우선하는 제약조건**으로 취급한다.

> **원칙 1 (Assume Breach)** — 모든 방치 서버는 "침해되었을 가능성이 있는 자산"으로 분류하고, 침해 아님이 **증명될 때까지** 격리망에서만 다룬다.
> **원칙 2 (Read-Only First)** — 원본 매체는 이미지화 이전에 쓰기 작업을 일절 허용하지 않는다.
> **원칙 3 (No Direct Path)** — 방치 서버에서 운영망/AWS로의 직접 경로는 어떤 단계에서도 만들지 않는다. 반드시 정제(clean-room) 구간을 경유한다.

### 0.3 랙에서 분리된 채, 두 곳의 데이터센터에, 무전원으로 - 정합성의 실체적 어려움

이 프로젝트가 일반적인 "레거시 서버 패치 후 클라우드 이관" 과제와 근본적으로 다른 지점은 **서버 데이터의 물리적 형상이 이미 해체되어 있다**는 점이다.

현 상태의 특징은 다음과 같다.

- 서버가 **2개 데이터센터에 분산**되어 있고,
- 상당량이 **랙에서 분리(derack)** 되어 IDC 한 구석 바닥에 보관 상태이며,
- 전원이 인가되지 않은 **무전원(cold) 상태**로 장기간 방치되었다.

이 조건에서 데이터 정합성(consistency)을 맞추는 작업은, **당시 운영 담당자가 그대로 있다 하더라도 쉽지 않다.** 이유는 담당자의 기억이나 역량 부족이 아니라, 정합성을 성립시키던 정보가 물리적 배치에 암묵적으로 저장되어 있었기 때문이다.

| 랙 분리로 상실되는 암묵 정보 | 왜 문제인가? |
|---|---|
| 랙-유닛 위치 ↔ 논리 노드 ID(호스트명/샤드번호) 매핑 | 클러스터의 어느 노드가 어느 샤드의 마스터였는지 알 수 없다 |
| 케이블링 토폴로지 (스위치 포트 ↔ NIC) | VLAN·본딩·이중화 구성이 재현되지 않아 클러스터가 스플릿 브레인으로 기동 |
| 디스크 슬롯 순서 ↔ RAID 멤버 순서 | 슬롯 순서가 바뀐 채 컨트롤러에 인식되면 **어레이 재구성 시 데이터 파괴** |
| JBOD/외장 스토리지 ↔ 헤드 노드 결선 | LUN 매핑 소실, 마운트포인트 뒤바뀜 |
| DC-A / DC-B 중 어느 쪽이 Primary였는가 | 두 사본 중 어느 쪽이 최신인지 판정 근거가 사라짐 |
| 마지막 정상 백업 세트의 물리 소재 | 복구 기준점(RPO) 자체를 특정할 수 없음 |

특히 **양 데이터센터에 동일 데이터의 사본이 존재하는 경우**, 복원의 난제는 "데이터를 읽는 것"이 아니라 **"두 사본 중 어느 것이 진본인지 판정하는 것"** 으로 이동한다. 복제(replication)가 비정상 종료되었다면 DC-A와 DC-B는 서로 다른 시점에서 멈춰 있고, 어느 한쪽이 전체적으로 최신인 것도 아니다. 디렉터리 단위로, 파일 단위로, 심지어 동일 파일의 블록 단위로 신선도가 엇갈릴 수 있다.

따라서 본 플레이북은 정합성 문제를 다음과 같이 재정의했다.

> **정합성 확보 = ① 물리 자산 재식별 → ② 논리 신원 복원 → ③ 사본 간 차분 판정 → ④ 진본 선정 규칙 적용 → ⑤ 판정 결과의 감사 가능한 기록**

이 다섯 단계는 Phase 0 ~ Phase 3에서 순차적으로 다룬다. 어느 하나를 생략하면 3.8 PB를 S3로 올린 뒤에 "무엇을 올렸는지 설명할 수 없는 상태"가 된다. **설명할 수 없는 데이터는 복원된 데이터가 아니다.**

---

## 1. 전체 단계 개요

```
Phase 0  물리 자산 실사 및 재식별 (무전원 상태에서 수행)
   ↓
Phase 1  격리망 콜드 부팅 및 비파괴 하드웨어 점검
   ↓
Phase 2  침해 흔적 조사 (포렌식 이미지 기반 / Assume Breach)
   ↓
Phase 3  데이터 정합성 판정 (DC-A vs DC-B 차분, 진본 선정)
   ↓
Phase 4  보안 패치 (파일럿 5~10대 → 전체 300대)
   ↓
Phase 5  파일 데이터 3.8 PB → S3 이관
   ↓
Phase 6  DB 10 GB → AWS Managed DB 이관
   ↓
Phase 7  통합 검증 · 보안 감사 · 인수
```

**게이트(Gate) 원칙**: 각 Phase 종료 시 체크리스트 100% 충족 + 서면 승인 없이는 다음 Phase로 진행하지 않는다. 게이트 미통과 항목은 예외 승인(Waiver) 문서로만 우회 가능하며, 예외는 보안팀장·CISO 공동 서명을 요구한다.

---

## Phase 0 — 물리 자산 실사 및 재식별 (전원 인가 이전)

### 0-A 목적

전원을 넣기 전에, **되돌릴 수 없는 실수의 사전 확률을 낮춘다.** 이 단계의 산출물은 자산 대장 하나가 아니라 "부팅해도 되는 서버 / 부팅하면 안 되는 서버"의 분류다.

### 0-B 핵심 작업

| # | 작업 | 방법 | 산출물 |
|---|---|---|---|
| 0.1 | 물리 실사 (DC-A/DC-B 각각) | 2인 1조 육안 확인, 사진 촬영(4면 + 라벨 + 디스크 슬롯) | `asset_inventory_DC-A.csv` |
| 0.2 | 섀시 라벨/서비스태그/시리얼 채록 | 서비스태그, MAC, 자산번호, 원 랙위치 라벨 | 동일 CSV |
| 0.3 | **디스크 슬롯 순서 보존** | 섀시별 디스크 탈거 여부 확인, 탈거 시 슬롯번호 재부여 후 라벨링 | `disk_slot_map.csv` |
| 0.4 | 외장 스토리지/JBOD 결선 흔적 조사 | SAS 케이블 라벨, 인클로저 시리얼 | `enclosure_map.csv` |
| 0.5 | 네트워크 토폴로지 역추적 | 구 스위치 config 백업, DHCP/DNS 존 파일, 모니터링 시스템 DB, IPAM | `topology_reconstructed.md` |
| 0.6 | 백업 매체 소재 확인 | 테이프, 백업 어플라이언스, 오프사이트 보관분 | `backup_media_inventory.csv` |
| 0.7 | 사전 위험 등급 분류 | 아래 0-C 기준 적용 | `boot_risk_classification.csv` |
| 0.8 | 문서·인적 자원 수집 | 구 운영 문서, 런북, 담당자 인터뷰(녹취 동의 필수) | `tribal_knowledge_capture.md` |

### 0-C 부팅 위험 등급 분류 기준

| 등급 | 조건 | 처리 |
|---|---|---|
| **R0 (부팅 금지)** | 디스크가 탈거되어 슬롯 순서 불명 / RAID 컨트롤러 배터리 팽창·누액 / 침수·부식 흔적 | 원본 절대 보존, 디스크 단위 이미징 전용 장비에서만 취급 |
| **R1 (조건부 부팅)** | 디스크 슬롯 순서 확인됨, 외관 정상, 단 무전원 24개월 초과 | 이미징 완료 후에만 부팅 허용 |
| **R2 (부팅 가능)** | 랙 유지, 슬롯 순서 유지, 무전원 12개월 이하, 정상 종료 로그 존재 | 격리망 부팅 허용 |

> 슬롯 순서를 모르는 상태로 RAID 어레이를 컨트롤러에 인식시키는 것이 이 프로젝트에서 **데이터를 영구 파괴할 수 있는 1순위 시나리오**다. 컨트롤러가 "Foreign Configuration"을 임포트하거나 자동 리빌드를 개시하면 패리티가 잘못된 순서로 재계산되어 복구가 불가능해진다. Phase 0의 최우선 산출물이 `disk_slot_map.csv`인 이유다. (신뢰도: A2)

### 0-D 무전원 장기 방치의 매체별 열화 리스크

| 매체 | 리스크 | 기술적 근거 | 대응 |
|---|---|---|---|
| **SSD/NVMe** | 무전원 상태 셀 전하 손실 → 정정 불가 비트오류(UECC), 펌웨어 메타데이터 손상 | JEDEC의 SSD 신뢰성 규격 체계(JESD218 계열)는 전원 차단 상태 데이터 보존을 **소비자용 등급 약 1년(30℃ 기준), 엔터프라이즈 등급 약 3개월(40℃ 기준) 수준**으로 규정한다. 즉 24개월 무전원은 **보증 구간을 크게 초과**한다. (신뢰도: B2) | 최우선 이미징 대상. 첫 전원 인가 후 즉시 전체 읽기(read scrub) → 재기록(refresh) 금지, **읽기만** 수행 |
| **HDD** | 스핀업 실패(stiction), 베어링 고착, 헤드 고착, 모터 기동 전류 급증 | 회전체 장기 정지 시 윤활 유막 소실. 스핀업 재시도 반복이 플래터 손상을 가속 | 1회 스핀업 실패 시 재시도 금지, 데이터 복구 전문업체 이관 판단 |
| **RAID 캐시 BBU/슈퍼캡** | 수명 종료 → 컨트롤러가 Write-Back → Write-Through 강제 전환, 캐시에 남은 더티 데이터 유실 | 배터리 백업 캐시의 보존 시간은 통상 수십 시간 단위 | 컨트롤러 이벤트 로그에서 "cache data lost" 이벤트 확인 필수 |
| **CMOS 배터리** | 시스템 시각 초기화 → TLS 인증서 검증 실패, 로그 타임스탬프 왜곡, Kerberos/토큰 실패 | — | 부팅 즉시 BIOS 시각 수동 설정, NTP 연동은 격리망 내부 NTP로 |
| **테이프** | 자성 열화, 테이프 접착(sticking), 드라이브 부재 | LTO 세대 호환은 통상 읽기 2세대 | 드라이브 확보 여부 선확인, 복원 리허설 1본 선행 |
| **광학/구형 매체** | 디스크 로트(disc rot) | — | 별도 취급 |

### Phase 0 체크리스트

```
[ ] 0.1  DC-A 물리 실사 완료 (총 __대, 사진 __매)
[ ] 0.2  DC-B 물리 실사 완료 (총 __대, 사진 __매)
[ ] 0.3  자산 대장(asset_inventory) 2개 DC 통합 완료, 300대 대비 실사 일치율 __%
[ ] 0.4  실사 불일치(대장에 있으나 미발견 / 발견되었으나 대장 없음) 목록 작성 및 에스컬레이션
[ ] 0.5  디스크 슬롯 맵 작성 완료 — 섀시별 슬롯 순서 확정 또는 '불명' 판정
[ ] 0.6  R0/R1/R2 부팅 위험 등급 전 대수 분류 완료
[ ] 0.7  R0 자산 물리 격리 보관 구역 지정 및 접근통제 적용
[ ] 0.8  외장 스토리지/JBOD 결선 맵 복원 또는 '불명' 판정
[ ] 0.9  구 네트워크 토폴로지 역추적 자료 확보 (스위치 config / IPAM / DNS / 모니터링 DB)
[ ] 0.10 백업 매체 인벤토리 및 판독 드라이브 확보 여부 확인
[ ] 0.11 당시 담당자 인터뷰 완료 (__명), 녹취/서면 동의 확보
[ ] 0.12 개인정보 포함 자산 식별 및 개인정보 취급 대장 등재
[ ] 0.13 반입/반출 절차서 및 자산 이동 이력(Chain of Custody) 양식 확정
[ ] 0.14 Phase 0 게이트 승인 (보안팀장 / 인프라팀장 / PM 서명)
```

---

## Phase 1 — 격리망 콜드 부팅 및 비파괴 하드웨어 점검

### 1-A 격리(Clean-Room) 환경 요건

방치 서버를 다루는 네트워크는 **운영망·인터넷·AWS와 물리적으로 분리**된 조사망(Forensic Enclave)이어야 한다.

| 항목 | 요건 |
|---|---|
| 인터넷 접속 | **차단** (아웃바운드 전면 Deny, DNS 포함) |
| 운영망 접속 | **차단** (L2 분리, 별도 스위치·별도 VLAN·별도 물리 포트) |
| 내부 서비스 | 격리망 전용 NTP, 격리망 전용 패치 저장소(로컬 미러), 로그 수집기 |
| 로그 | 전 작업 세션 기록(터미널 레코딩), 조사망 스위치 미러링 및 PCAP 상시 캡처 |
| 반출 | 조사망 → 정제망 이동은 단방향 파일 이관(승인된 파일 형식 + 해시 검증)만 허용 |
| 계정 | 조사 전용 계정, 원 서버의 기존 계정으로는 로그인하지 않음 |

> **아웃바운드 차단이 핵심이다.** 동면 백도어의 첫 동작은 대부분 C2 서버로의 콜백(beaconing)이다. 아웃바운드가 열려 있는 상태에서 첫 부팅을 하면, 조사 이전에 공격자가 먼저 침해 사실을 알게 된다. 동시에 캡처된 PCAP의 콜백 시도 자체가 **가장 강력한 침해 증거**가 된다.

### 1-B 콜드 부팅 절차 (서버 1대 기준)

| 순서 | 작업 | 금지사항 |
|---|---|---|
| 1 | 섀시 개방, 육안 점검(먼지, 배터리 팽창, 커패시터 누액, 부식) | — |
| 2 | 디스크 슬롯 순서 재확인 및 사진 |  디스크 임의 재삽입 금지 |
| 3 | **디스크 전량 탈거** 후 섀시만 전원 인가 (BIOS/BMC 점검) | 디스크 장착 상태 첫 부팅 금지 |
| 4 | BMC/iDRAC/iLO 이벤트 로그 수집, 시스템 시각 설정 | — |
| 5 | RAID 컨트롤러 설정 **읽기 전용 조회**, 기존 설정 덤프 저장 | Foreign Config Import 금지, Initialize 금지, Auto-Rebuild 금지 |
| 6 | 디스크는 별도 워크스테이션에서 **쓰기 방지 장치(Write Blocker)** 경유 개별 이미징 | 원본 마운트 금지 |
| 7 | 이미징 완료·해시 검증 후, **복제본으로만** 부팅 시험 | 원본 부팅 금지 |
| 8 | Live 미디어(RescueCD) 부팅으로 파일시스템 `ro,noexec,nodev,nosuid` 마운트 후 조사 | 설치 OS로 부팅 금지(Phase 2 완료 전) |

### 1-C 300대를 10명이 처리하기 위한 라인 편성

| 라인 | 인원 | 역할 | 처리량 목표 |
|---|---|---|---|
| L1 물리 실사·반입 | 2 | 실사, 라벨링, 이동 이력 | 40대/일 |
| L2 하드웨어 점검 | 2 | 섀시 점검, BMC 로그, RAID 설정 덤프 | 15대/일 |
| L3 이미징 | 3 | Write Blocker 기반 디스크 이미징, 해시 | 12~20 디스크/일 (용량 의존) |
| L4 포렌식 분석 | 2 | IOC 트리아지, 타임라인 | 10대/일 |
| L5 자동화·플랫폼 | 1 | 스크립트, 저장소 미러, 대시보드 | 상시 |

> **병목은 이미징이다.** 3.8 PB 전량을 포렌식 이미징하는 것은 현실적으로 불가능하므로, **① OS/시스템 볼륨은 전수 이미징, ② 대용량 데이터 볼륨은 이미징 대신 "쓰기 방지 마운트 + 해시 매니페스트 + 표본 심층 검사"** 로 이원화한다. 이 결정은 문서화하고 게이트 승인 대상에 포함한다.

### Phase 1 체크리스트

```
[ ] 1.1  조사망(Forensic Enclave) 구축 완료, 아웃바운드 전면 차단 검증 (테스트 콜백으로 확인)
[ ] 1.2  조사망 PCAP 상시 캡처 및 보존 정책 적용
[ ] 1.3  Write Blocker 장비 확보 (__대) 및 동작 검증
[ ] 1.4  이미징 저장 공간 확보 (필요 용량 __TB, 확보 __TB)
[ ] 1.5  섀시 육안 점검 이상 자산 목록 작성 (배터리 팽창/누액/부식)
[ ] 1.6  BMC/iDRAC/iLO 이벤트 로그 전 대수 수집
[ ] 1.7  RAID 컨트롤러 기존 설정 덤프 전 대수 확보 (Foreign Import 미실행 확인)
[ ] 1.8  SMART 전수 수집 및 위험 디스크(재할당 섹터/미보정 오류) 목록화
[ ] 1.9  OS 볼륨 전수 이미징 완료 및 SHA-256 해시 검증 통과율 __%
[ ] 1.10 스핀업 실패 디스크 목록 및 데이터복구 업체 이관 판단 완료
[ ] 1.11 시스템 시각(BIOS/CMOS) 보정 및 조사망 NTP 동기 완료
[ ] 1.12 원본 매체 무결성 서약 — 원본 쓰기 발생 0건 확인 (감사 로그 근거 첨부)
[ ] 1.13 Phase 1 게이트 승인
```

---

## Phase 2 — 침해 흔적 조사 (Assume Breach)

### 2-A 조사 원칙

이 단계의 목표는 "침해가 있었는지"를 묻는 것이 아니라, **"침해가 없었음을 어느 수준까지 입증할 수 있는지"** 를 확정하는 것이다. 결론은 다음 3가지 중 하나로만 기록한다.

| 판정 | 의미 | 후속 처리 |
|---|---|---|
| **C (Compromised)** | 침해 지표 확인 | 해당 서버 재사용 금지. 데이터만 정제 후 추출, OS는 폐기·재설치 |
| **S (Suspicious)** | 설명되지 않는 이상 징후 존재 | 심층 분석 대기, 잠정적으로 C 취급 |
| **N (No indicators found)** | 지표 미발견 (≠ "침해 없음") | 패치 대상 편입, 단 Phase 4에서 재검증 |

> **"N"은 무죄 판결이 아니라 증거 부재다.** 이 문구를 보고서에 명시적으로 남긴다. 2년 전의 로그가 로테이션으로 소실되었다면, 그 구간에 대해서는 어떤 판정도 불가능하다.

### 2-B 침해 지표(IOC) 수집 항목

| 분류 | 점검 대상 | 착안점 |
|---|---|---|
| 지속성(Persistence) | `/etc/cron*`, 사용자 crontab, `systemd` 유닛/타이머, `/etc/rc.local`, `~/.bashrc`, `/etc/ld.so.preload` | 정상 목록과 diff. `ld.so.preload`는 존재 자체가 강한 의심 신호 |
| 계정 | `/etc/passwd`, `/etc/shadow`, `/etc/sudoers*`, `authorized_keys`, UID 0 중복 | 알 수 없는 SSH 공개키 = 사실상 확정적 침해 지표 |
| 웹셸 | Nginx `root`/`alias` 경로 하위 스크립트, 업로드 디렉터리 | 실행 가능 확장자, 난독화 문자열, 최근 mtime |
| 바이너리 무결성 | `rpm -Va`, 패키지 해시 비교 | `ps`, `ls`, `netstat`, `ss`, `sshd` 변조 여부 |
| 로그 이상 | `wtmp/btmp/lastlog`, `secure`, `messages`, Nginx access/error | **로그 파일 크기 0 / 특정 구간 결손 = 은폐 시도 지표** |
| 커널 모듈 | `lsmod`, `/lib/modules` 내 서명 없는 모듈 | 루트킷 |
| DB | MySQL `user` 테이블, `FILE`/`SUPER` 권한 계정, `general_log`, `init_file`, UDF `.so` | 2021년 이후 미패치 → DB 경유 침해 시나리오 우선 검토 |
| 파일시스템 타임라인 | `/tmp`, `/var/tmp`, `/dev/shm`, `/root` | 삭제된 inode, 시각 역전(timestomping) |
| 네트워크 | 조사망 PCAP의 아웃바운드 시도 | 콜백 도메인/IP → CTI 조회 |

### 2-C 이 환경에 특히 중요한 취약점 계열

2년 이상 미패치 상태에서 우선 확인해야 할 공격 표면은 다음과 같다. (실제 버전 확인 후 CVE 목록을 확정한다 — 신뢰도: B2)

1. **웹서버 계층** — Nginx 및 그 앞단의 리버스 프록시/WAF, 그리고 함께 배포된 PHP/애플리케이션 런타임. 실무상 침해는 Nginx 본체보다 그 뒤의 애플리케이션에서 발생하는 비율이 압도적으로 높다.
2. **DB 계층** — MySQL 5.7 계열은 2023년 10월 EOL. 2021년 8월 이후 누적 보안 수정 전량 미적용.
3. **OS 계층** — CentOS 7은 2024년 6월 EOL, CentOS 8은 2021년 12월 EOL. **EOL 이후 공개된 커널·glibc·OpenSSL·sudo·polkit 계열 권한상승 취약점은 벤더 패치가 존재하지 않는다.**
4. **관리 인터페이스** — BMC(iDRAC/iLO/IPMI) 펌웨어. 무전원이어도 전원 코드가 연결되어 있었다면 BMC는 살아 있었을 수 있다. **이 경로는 반드시 별도 조사한다.**
5. **인증 자산** — 만료된 TLS 사설키, SSH 호스트키, API 키, DB 계정. **전량 폐기·재발급 대상**으로 간주한다.

### 2-D CentOS EOL이 만들어내는 구조적 제약

이 프로젝트에서 반드시 조기에 확정해야 하는 사항이 있다.

> **CentOS는 EOL 상태이므로, "최신 보안 패치를 적용한다"는 목표가 원칙적으로 달성 불가능하다.**

- 공식 미러(`mirror.centos.org`)는 서비스 종료되어 `yum update`가 **저장소 접속 실패로 그대로 끝난다.** 아카이브(`vault.centos.org`)로 전환해야 하는데, 아카이브에는 **EOL 시점까지의 패치만** 존재한다.
- 즉 CentOS 7 서버에 vault 저장소로 패치를 적용하면 **2024년 6월 시점까지의 보안 상태**에 도달할 뿐이며, 그 이후 2년치 취약점은 남는다.

새로 리눅스 계열의 OS를 설치하고 안정성, 호환성을 확보해야 한다.

따라서 Phase 4의 실제 목표를 다음과 같이 재정의해야 한다.

| 선택지 | 내용 | 평가 |
|---|---|---|
| **(a) Vault 패치 + 완화 통제** | vault.centos.org 기준 최대 패치 + 망분리·WAF·EDR·최소권한으로 잔여 위험 보전 | **데이터 추출 기간 동안의 잠정 대책으로만 타당** |
| **(b) 유상 확장 지원(ELS) 도입** | 상용 벤더의 CentOS 확장 지원 계약 | 예산·계약 리드타임 필요 |
| **(c) OS 교체(RHEL/Rocky/Alma/Ubuntu)** | 이관 대상 OS를 현행화하여 재구축 | **최종 해답. 단 애플리케이션 호환성 검증 필요** |
| **(d) 데이터만 추출 후 서버 폐기** | 서버를 살리지 않고 데이터만 꺼내 S3/RDS로 이관 | **본 프로젝트 목적(데이터 복원)에 가장 부합** |

> **권고**: 본 프로젝트의 목적이 "서비스 재개"가 아니라 **"데이터 복원 및 클라우드 이관"** 이라면, 300대 전체를 완전 패치하여 장기 운영하는 시나리오는 비용·위험 모두에서 열등하다. **(a)+(d) 조합** — 즉 *데이터 추출에 필요한 최소 기간만 패치·완화 통제로 버티고, 추출 완료 후 서버는 폐기(데이터 완전 삭제 후 매체 파기)* — 를 기본 전략으로 제안한다. Phase 4의 패치는 "영구 운영을 위한 패치"가 아니라 **"안전한 추출 창구를 확보하기 위한 패치"** 로 목적을 좁힌다. (신뢰도: B2)

### Phase 2 체크리스트

```
[ ] 2.1  IOC 트리아지 스크립트 검증 완료 (오탐/누락 시험)
[ ] 2.2  전 대수 트리아지 수행 (__/300)
[ ] 2.3  C/S/N 판정 완료 및 대장 기록 — C: __대, S: __대, N: __대
[ ] 2.4  ld.so.preload / 미등록 SSH 공개키 / UID 0 중복 점검 결과 첨부
[ ] 2.5  rpm -Va 기반 바이너리 무결성 결과 및 예외 사유 정리
[ ] 2.6  웹셸 스캔 완료 (Nginx 문서 루트 및 업로드 경로 전수)
[ ] 2.7  로그 결손 구간 목록화 — "판정 불가 구간" 명시
[ ] 2.8  MySQL 계정/권한/UDF/init_file 점검 완료
[ ] 2.9  BMC/IPMI 펌웨어 버전 및 접근 로그 조사 완료
[ ] 2.10 조사망 PCAP 아웃바운드 콜백 시도 분석 완료 (시도 __건, CTI 조회 결과 첨부)
[ ] 2.11 모든 인증 자산(TLS키/SSH키/DB계정/API키) 폐기·재발급 대상 목록 확정
[ ] 2.12 침해 확인 시 개인정보 유출 신고 판단 프로세스 가동 (법무·개인정보보호책임자 통보)
[ ] 2.13 OS 전략 (a)/(b)/(c)/(d) 의사결정 서면 확정
[ ] 2.14 Phase 2 게이트 승인 (CISO 서명 필수)
```

---

## Phase 3 — 데이터 정합성 판정 (DC-A vs DC-B)

### 3-A 정합성 판정의 5단계

| 단계 | 내용 | 산출물 |
|---|---|---|
| ① 물리 자산 재식별 | Phase 0 결과 + 디스크 UUID/시리얼 기반 재구성 | `physical_identity.csv` |
| ② 논리 신원 복원 | 디스크 내부에서 호스트명·IP·샤드번호·클러스터 멤버십 역추출 | `logical_identity.csv` |
| ③ 사본 간 차분 판정 | DC-A / DC-B 매니페스트 대조 | `divergence_report.csv` |
| ④ 진본 선정 규칙 적용 | 아래 3-C 규칙 | `golden_copy_decision.csv` |
| ⑤ 감사 기록 | 판정 근거·판정자·판정 시각 기록 | `integrity_audit_log.jsonl` |

### 3-B 논리 신원 역추출 방법 (랙 정보가 소실된 경우)

디스크 이미지 내부에서 다음을 읽어 **서버의 원래 신원을 복원**한다.

| 근거 파일 | 얻을 수 있는 정보 |
|---|---|
| `/etc/hostname`, `/etc/sysconfig/network` | 호스트명 |
| `/etc/sysconfig/network-scripts/ifcfg-*` | IP, VLAN, 본딩, MAC |
| `/etc/fstab`, `/etc/multipath.conf` | 마운트 구조, LUN/WWID 매핑 |
| `/etc/my.cnf` (`server_id`, `log_bin`, `relay_log`) | MySQL 복제 토폴로지, 마스터/슬레이브 여부 |
| `mysql/master.info`, `relay-log.info`, `auto.cnf` | 복제 소스 호스트, 적용 위치, server UUID |
| `/etc/nginx/nginx.conf`, `conf.d/*` | upstream 멤버 = 클러스터 구성 역추적 |
| `/etc/hosts` | 구 클러스터 멤버 전체 목록 (매우 유용) |
| 모니터링 에이전트 설정 | 서비스 그룹, 태그, 역할 |
| `/var/log/messages` 최종 엔트리 | **마지막 가동 시각 = 데이터 신선도 기준점** |
| RAID 컨트롤러 로그 | 어레이 구성, 멤버 순서, 최종 상태 |

> `/etc/hosts`와 `master.info`의 조합은 랙 배치도가 완전히 소실된 상황에서 **클러스터 위상을 복원하는 가장 신뢰도 높은 근거**다. (신뢰도: A2)

### 3-C 진본(Golden Copy) 선정 규칙

두 데이터센터의 사본이 다를 때 적용하는 **사전 확정 규칙**이다. 규칙을 먼저 확정하고 나서 데이터를 보는 것이 원칙이다. (사후에 규칙을 만들면 판정이 자의적이 된다.)

| 우선순위 | 규칙 | 비고 |
|---|---|---|
| R-1 | 양측 해시 동일 → 어느 쪽이든 채택, 1부만 이관 | 중복 제거 |
| R-2 | 한쪽만 존재 → 존재하는 쪽 채택 + **누락 사유 조사 기록** | 삭제였는지 미복제였는지 구분 |
| R-3 | 크기·해시 상이, mtime 명확 → **최종 가동 시각이 늦은 DC의 사본** 채택 | 단 CMOS 초기화로 시각 신뢰 불가한 자산은 제외 |
| R-4 | 시각 신뢰 불가 → **파일 자체의 내부 메타데이터** 기준 (이미지 EXIF, 파일 헤더, DB 레코드 시각) | 자동 판정 불가 시 R-6 |
| R-5 | 한쪽이 절단(truncated)·손상 → 정상 파싱되는 쪽 채택 | 파일 유형별 검증기 필요 |
| R-6 | 판정 불가 | **양측 모두 보존**하여 `_dcA` / `_dcB` 접미로 S3에 병렬 적재 + 격리 목록 등재 |

> R-6은 실패가 아니라 **정직한 처리**다. 임의로 하나를 버리는 것보다, 판정 불가로 표시하고 둘 다 보존하는 것이 개인 데이터 복원에서 옳다. 3.8 PB에서 R-6 비율은 통상 수 % 이내로 수렴한다. (신뢰도: C3)

### 3-D 3.8 PB 규모에서의 현실적 검증 전략

전량 SHA-256은 I/O 병목으로 비현실적일 수 있다. 다음 3계층으로 나눈다.

| 계층 | 방법 | 적용 범위 | 목적 |
|---|---|---|---|
| L1 빠른 대조 | 경로 + 크기 + mtime 매니페스트 | **전량 100%** | 존재/누락/명백한 차이 판정 |
| L2 해시 대조 | xxHash64 또는 BLAKE3 (SHA-256보다 수 배 빠름) | **전량 100%** (I/O 허용 시) 또는 L1 차이 발생분 + 무작위 10% | 내용 동일성 |
| L3 심층 검증 | SHA-256 + 파일 유형별 파싱 검증(JPEG/PNG 디코드, ZIP CRC 등) | 표본 1~3% + R-4/R-5/R-6 대상 전량 | 실제 사용 가능성 |

**매니페스트는 S3 이관 전·후 모두 생성하여 대조한다.** 이관 후 대조 없이는 "3.8 PB를 올렸다"고 말할 수 없다.

### Phase 3 체크리스트

```
[ ] 3.1  진본 선정 규칙(R-1~R-6) 서면 확정 및 승인 — 데이터 확인 이전에 확정했음을 기록
[ ] 3.2  논리 신원 역추출 완료 (__/300), 신원 불명 자산 __대
[ ] 3.3  클러스터 위상 복원도 작성 (MySQL 복제 / Nginx upstream 기준)
[ ] 3.4  각 자산의 '마지막 가동 시각' 확정, CMOS 초기화로 시각 신뢰 불가 자산 별도 표기
[ ] 3.5  DC-A 전량 L1 매니페스트 생성 완료 (파일 __억건, __PB)
[ ] 3.6  DC-B 전량 L1 매니페스트 생성 완료
[ ] 3.7  L2 해시 매니페스트 생성 완료 (커버리지 __%)
[ ] 3.8  차분 리포트 생성 — 동일 __%, 편측존재 __%, 상이 __%, 판정불가 __%
[ ] 3.9  R-1~R-6 규칙 적용 결과 및 진본 결정 대장 완성
[ ] 3.10 R-6(판정 불가) 목록 및 병렬 보존 계획 확정
[ ] 3.11 표본 심층 검증(L3) 실시 및 실제 개방 가능성 검증 통과율 __%
[ ] 3.12 개인정보 포함 데이터 분류(사진/일기/방명록/회원정보) 및 접근통제 등급 부여
[ ] 3.13 정합성 판정 감사 로그 무결성(해시 체인) 적용
[ ] 3.14 Phase 3 게이트 승인
```

---

## Phase 4 — 보안 패치 (파일럿 → 전체)

**목적 재확인**: 본 Phase의 패치는 *영구 운영*이 아니라 **안전한 데이터 추출 창구 확보**를 목적으로 한다. (Phase 2-D 결정 사항)

### 4-A 패치 이전 필수 선결 조건

| # | 선결 조건 | 이유 |
|---|---|---|
| 1 | Phase 2 판정 **N** 자산만 대상 | C/S 자산은 패치해도 신뢰할 수 없다 |
| 2 | 전 자산 스냅샷/이미지 백업 완료 | 롤백 불가 시 패치 금지 |
| 3 | **CentOS vault 저장소 로컬 미러 구축** | 격리망은 인터넷 차단, 공식 미러도 종료 |
| 4 | 인증 자산 전량 재발급 완료 | 구 키를 유지한 채 패치하면 백도어를 패치하는 셈 |
| 5 | 디스크 여유 공간 확보 (`/boot` 최소 200MB, `/` 최소 5GB) | 커널 패치 실패 주 원인 |
| 6 | 콘솔(BMC/시리얼) 접근 확보 | 부팅 실패 시 원격 복구 유일 수단 |
| 7 | 부팅 실패 대응 런북 작성 | 예상 실패 6~15대 (원 시나리오 문서 기준) |

### 4-B 패치 순서와 서비스 영향

```
스냅샷 → 서비스 정지 → 저장소 전환 → 패치 사전점검
   → OS(비커널) 패치 → Nginx 패치 → MySQL 패치 → 커널 패치
   → 리부트 → 헬스체크 → 검증 → 승인/롤백
```

**커널 패치를 마지막에 두는 이유**: 커널 외 패키지 패치는 리부트 없이 검증 가능하므로, 리부트를 1회로 줄이고 실패 원인 분리를 쉽게 한다.

### 4-C 파일럿 (5~10대) 판정 기준

| 지표 | 통과 기준 |
|---|---|
| 부팅 성공률 | 10/10 또는 9/10 이상 |
| 서비스 기동 성공률 | 100% (Nginx, MySQL) |
| DB 정합성 | `mysqlcheck` 오류 0건, 행수 일치 |
| 성능 회귀 | 기준 대비 -10% 이내 |
| 취약점 스캔 | 패치 전 대비 심각도 High 이상 항목 감소 확인 |
| 롤백 리허설 | **최소 1대는 의도적으로 롤백을 실행하여 성공 확인** |

> 롤백 리허설을 실제로 수행하지 않은 롤백 계획은 계획이 아니다. 파일럿에서 반드시 1회 실행한다.

### 4-D 전체 300대 배치 전략

| 항목 | 값 |
|---|---|
| 배치 크기 | 20~30대 |
| 배치 수 | 10~15 |
| 동시 병렬도 | 배치 내 5대 (Ansible `serial: 5`) |
| 배치당 소요 | 4~6시간 (패치+검증) |
| 배치 간 관찰 구간 | 최소 2시간 (지연 발현 장애 포착) |
| 총 소요 | 8~12 영업일 |
| 중단 기준(Abort Criteria) | 한 배치에서 실패율 20% 초과 시 전체 중단 및 원인 분석 |

### Phase 4 체크리스트

```
[ ] 4.1  대상 자산 확정 (Phase 2 판정 N 자산 __대)
[ ] 4.2  vault.centos.org 로컬 미러 구축 및 GPG 키 검증 완료
[ ] 4.3  MySQL / Nginx 패키지 로컬 저장소 확보 (버전 고정 명시)
[ ] 4.4  전 대수 스냅샷/이미지 백업 완료 및 복원 리허설 1건 성공
[ ] 4.5  인증 자산 재발급 완료 (SSH 호스트키 __, TLS __, DB 계정 __)
[ ] 4.6  패치 사전점검 스크립트 전 대수 통과 (실패 자산 __대 → 사유별 처리)
[ ] 4.7  파일럿 __대 선정 및 승인
[ ] 4.8  파일럿 패치 실행 및 판정 기준 전 항목 통과
[ ] 4.9  **롤백 리허설 1대 이상 실제 수행 및 성공 확인**
[ ] 4.10 파일럿 결과 보고서 작성 및 CCB 승인
[ ] 4.11 Ansible 플레이북 검증 (--check 모드 → 스테이징 → 운영)
[ ] 4.12 배치 편성표 및 배치별 담당자/시간창 확정
[ ] 4.13 중단 기준(Abort Criteria) 및 에스컬레이션 경로 사전 합의
[ ] 4.14 배치 1~N 실행 및 배치별 검증 리포트 첨부
[ ] 4.15 부팅 실패 자산 처리 완료 (예상 6~15대 / 실제 __대)
[ ] 4.16 패치 후 취약점 재스캔 실시 및 잔여 위험(EOL 미해결분) 문서화
[ ] 4.17 잔여 위험에 대한 완화 통제 적용 (망분리/WAF/EDR/최소권한) 및 승인
[ ] 4.18 Phase 4 게이트 승인
```

---

## Phase 5 — 파일 데이터 3.8 PB → AWS S3

### 5-A 전송 방식 결정

| 방식 | 예상 소요 | 적합성 |
|---|---|---|
| 전용선 1 Gbps | 약 350~420일 | **부적합** |
| 전용선 10 Gbps | 약 50~60일 (효율 60~80% 반영) | 조건부 |
| 전용선 100 Gbps | 약 5~7일 | 적합하나 회선 확보 리드타임·비용 검토 필요 |
| **AWS Snowball Edge 다중 병행** | 디바이스 수·왕복 물류에 의존 | **PB급에 현실적** |
| 물리 대용량 전송 서비스 | 초대용량 전용 | 계약 가능성 확인 필요 |

> **권고: 하이브리드.** ① 대용량 콜드 데이터(사진·동영상 등 대부분)는 **Snowball Edge 다중 병행**으로 물류 전송, ② 변경분·소용량·메타데이터·DB는 **전용선**으로 전송, ③ 전송 후 매니페스트 대조로 통합. Direct Connect 프로비저닝 리드타임(수주~수개월)이 전체 일정의 임계 경로가 되지 않도록 **Phase 0과 동시에 착수**한다. (신뢰도: B2)

### 5-B 보안 요건 (금융권/개인정보 기준 준용)

| 항목 | 요건 |
|---|---|
| 전송 중 암호화 | TLS 1.2 이상 / Snowball 자체 암호화 |
| 저장 시 암호화 | S3 SSE-KMS, **CMK(고객 관리 키)** 사용, 키 정책 최소권한 |
| 버킷 정책 | Block Public Access 전면 적용, `aws:SecureTransport` 강제 |
| 버전관리/보존 | 버전관리 활성화, **Object Lock(Compliance 모드)** 로 조작 방지 |
| 접근 로깅 | CloudTrail Data Events + S3 서버 액세스 로그, 별도 계정으로 전송 |
| 무결성 | 업로드 시 체크섬(SHA-256/CRC32C) 지정 및 서버측 검증 |
| 스토리지 클래스 | 초기 S3 Standard → 검증 완료 후 Glacier 계열 전환(Lifecycle) |
| 계정 분리 | 데이터 계정 / 로그 계정 / 보안 계정 분리 |
| 개인정보 | 리전 확정(국내 리전 여부), 국외이전 여부 법무 검토 **필수** |

### Phase 5 체크리스트

```
[ ] 5.1  Direct Connect 발주 완료 (발주일 __, 예상 개통 __) — Phase 0과 동시 착수 확인
[ ] 5.2  전송 방식 결정 서면 확정 (전용선 / Snowball / 하이브리드)
[ ] 5.3  VPC/서브넷/보안그룹/NACL 설계 및 구축 완료
[ ] 5.4  S3 버킷 생성, SSE-KMS(CMK), Block Public Access, 버전관리, Object Lock 적용
[ ] 5.5  버킷 정책에 SecureTransport 강제 및 최소권한 IAM 역할 적용
[ ] 5.6  CloudTrail Data Events / 액세스 로그 별도 계정 전송 구성
[ ] 5.7  개인정보 국외이전 여부 법무·개인정보보호책임자 검토 완료
[ ] 5.8  이관 전 매니페스트(L1/L2) 최종 확정 및 동결(freeze)
[ ] 5.9  파일럿 이관 (1~10 TB) 및 무결성 100% 검증
[ ] 5.10 본 이관 진행률 관리 (__PB / 3.8PB, __%)
[ ] 5.11 이관 후 매니페스트 생성 및 이관 전 매니페스트와 대조 — 불일치 __건
[ ] 5.12 불일치 전건 재전송 및 재검증 완료 (잔여 0건 확인)
[ ] 5.13 R-6(판정 불가) 데이터 병렬 적재 및 격리 태깅 완료
[ ] 5.14 Lifecycle 정책 적용 및 비용 추계 검증
[ ] 5.15 Phase 5 게이트 승인
```

---

## Phase 6 — DB 10 GB → AWS Managed DB

### 6-A 핵심 리스크: MySQL LTS 버전 업그레이드

2021년 8월 이후 미패치 상태에서 8.0 LTS 으로 올릴 때의 주요 실패 요인:

| 요인 | 내용 | 대응 |
|---|---|---|
| 데이터 딕셔너리 변환 실패 | 구버전 mysql의 `.frm` → 8.0 트랜잭셔널 데이터 딕셔너리 전환 중 오류 | `mysqlsh` 업그레이드 체커 사전 실행 |
| 예약어 충돌 | 8.0 신규 예약어(`rank`, `groups`, `lead` 등)를 컬럼/테이블명으로 사용 | 사전 스캔 후 리네임 또는 백틱 처리 |
| 문자셋/콜레이션 변경 | 기본값 `utf8mb4_general_ci` → `utf8mb4_0900_ai_ci` | **정렬 순서 변경으로 애플리케이션 결과가 달라질 수 있음.** 명시적 콜레이션 고정 |
| 인증 플러그인 변경 | `mysql_native_password` → `caching_sha2_password` | 구 클라이언트 호환 검토 |
| 제거된 옵션/구문 | `query_cache`, `NO_AUTO_CREATE_USER` 등 | my.cnf 정제 |
| 파티션/스토리지 엔진 | MyISAM 파티션 미지원 등 | InnoDB 전환 |
| 손상 테이블 | 비정상 종료로 인한 InnoDB 손상 | `mysqlcheck` 및 필요 시 `innodb_force_recovery` 단계적 사용 |

> **10 GB는 전송이 문제가 아니라 호환성과 변환이 문제다.** 전송은 10Gbps에서 수십 분이지만, 스키마 호환성 정리와 검증에 최소 3~6 영업일이 소요된다.

### 6-B 권고 절차

1. 이미지에서 복제한 데이터 디렉터리로 **격리망에 구버전 mysql db 인스턴스 기동** (원본 미접촉)
2. `mysqlcheck --all-databases --check` 로 손상 여부 확인, 필요 시 복구
3. **논리 백업(`mysqldump` 또는 `mysqlpump`) 생성** — 물리 파일 승계보다 논리 이관이 안전
4. `mysqlsh -- util check-for-server-upgrade` 로 8.0 호환성 리포트 확보
5. 리포트 지적사항 수정 (예약어, 콜레이션, 옵션)
6. 정제망에 최신 버전 MySQL 스테이징 구축 → 임포트 → 검증
7. AWS RDS/Aurora로 이관 (DMS 또는 dump 임포트)
8. 행수·체크섬·주요 쿼리 결과 대조, 저장 프로시저/트리거/뷰/이벤트 검증
9. 애플리케이션 연동 테스트

### Phase 6 체크리스트

```
[ ] 6.1  DB 원본 이미지 복제본에서 구버전 mysql 인스턴스 기동 성공 (원본 미접촉 확인)
[ ] 6.2  mysqlcheck 손상 점검 완료 — 손상 테이블 __개 / 복구 __개
[ ] 6.3  논리 백업 생성 및 백업 파일 해시 기록
[ ] 6.4  업그레이드 체커 리포트 확보 및 지적사항 전건 처리 (__건/__건)
[ ] 6.5  예약어 충돌 스캔 및 처리 완료
[ ] 6.6  문자셋/콜레이션 정책 확정 (정렬 순서 변경 영향 검토 포함)
[ ] 6.7  인증 플러그인 호환성 결정
[ ] 6.8  8.0 스테이징 임포트 성공 및 검증
[ ] 6.9  RDS/Aurora 파라미터 그룹·백업·암호화(KMS)·Multi-AZ 설정 완료
[ ] 6.10 데이터 무결성 검증: 테이블 수, 행수, 체크섬 전건 일치
[ ] 6.11 프로시저/함수/트리거/뷰/이벤트 개수 및 동작 검증
[ ] 6.12 주요 쿼리 성능 비교 (회귀 -10% 이내)
[ ] 6.13 개인정보 컬럼 식별 및 암호화/마스킹 정책 적용
[ ] 6.14 DB 접속 계정 전량 신규 발급, 구 계정 전량 폐기 확인
[ ] 6.15 Phase 6 게이트 승인
```

---

## Phase 7 — 통합 검증 · 보안 감사 · 인수

### 7-A 최종 검증 항목

| 영역 | 검증 내용 | 통과 기준 |
|---|---|---|
| 데이터 완전성 | 이관 전/후 매니페스트 대조 | 불일치 0건 (또는 R-6 격리분만 예외) |
| 데이터 사용성 | 무작위 표본 개방 테스트 (사진 디코드, 텍스트 인코딩) | 표본 __건 중 실패 0건 |
| DB 정합성 | 행수·체크섬·객체 수 | 100% 일치 |
| 접근통제 | IAM/KMS/버킷 정책 최소권한 검증 | 과도권한 0건 |
| 암호화 | 전송/저장 암호화 적용률 | 100% |
| 로깅/감사 | CloudTrail, S3 액세스 로그, 작업 이력 | 결손 구간 0 |
| 취약점 | 최종 스캔 | High 이상 잔여 항목 전건 완화 통제 문서화 |
| 개인정보 | 처리 근거, 보유기간, 파기 계획 | 법무 승인 |
| 원본 매체 폐기 | 데이터 완전 삭제 + 물리 파기 증명서 | 자산 대장 대비 100% |

### 7-B 원본 자산 폐기 (Phase 2-D의 (d) 전략 채택 시)

이관·검증 완료 후 원본 서버·디스크는 **폐기 대상**이다. 이 단계를 생략하면 2년 후 동일한 문제가 반복된다.

```
검증 완료 확인 → 폐기 승인 → 매체별 처리
  · SSD/NVMe : 암호 삭제(Crypto Erase) + 물리 파기
  · HDD      : 표준 삭제 또는 소자(Degauss) + 물리 파기
  · 테이프    : 소자 + 물리 파기
→ 파기 증명서 수령 → 자산 대장 말소 → 감사 기록 보존
```

### Phase 7 체크리스트

```
[ ] 7.1  최종 매니페스트 대조 리포트 (불일치 0건)
[ ] 7.2  표본 사용성 테스트 통과 (__건)
[ ] 7.3  DB 최종 정합성 검증 통과
[ ] 7.4  IAM/KMS/버킷 정책 최소권한 감사 통과
[ ] 7.5  최종 취약점 스캔 및 잔여 위험 등록부(Risk Register) 확정
[ ] 7.6  전 작업 감사 로그 보존 정책 적용 (보존기간 __년)
[ ] 7.7  개인정보 처리 근거·보유기간·파기계획 법무 승인
[ ] 7.8  침해 정황 발견 자산에 대한 신고·통지 의무 이행 여부 최종 확인
[ ] 7.9  운영 인수인계 문서 작성 (구성도, 런북, 복구 절차)
[ ] 7.10 원본 매체 폐기 완료 및 파기 증명서 수령 (__/__대)
[ ] 7.11 자산 대장 말소 및 Chain of Custody 종결
[ ] 7.12 프로젝트 종료 보고 및 최종 승인 (CISO / 경영진)
```

---

# 부록 A. 스크립트 모음

> **공통 주의사항**
> 1. 모든 스크립트는 **격리망(Forensic Enclave) 내부에서만** 실행한다.
> 2. `S-01`~`S-03`은 **원본 매체에 쓰기를 수행하지 않는다.** 마운트는 반드시 `ro,noexec,nodev,nosuid`.
> 3. 실행 전 반드시 1대에서 검증하고, 결과를 눈으로 확인한 뒤 확산한다.
> 4. 스크립트는 표준 출력이 아니라 **파일로 증거를 남긴다.** 증거 디렉터리는 사후 변경 금지.
> 5. `set -euo pipefail` 을 기본으로 하되, 조사 스크립트는 개별 항목 실패로 전체가 중단되지 않도록 항목별 오류를 흡수한다.

---

## A-1. `S-01_cold_inspect.sh` — 콜드 부팅 후 비파괴 사전 점검

Live/Rescue 미디어로 부팅한 상태에서 실행. **디스크를 마운트하지 않고** 하드웨어·매체 상태만 수집한다.

```bash
#!/usr/bin/env bash
# S-01_cold_inspect.sh
# 목적: 장기 방치 서버의 비파괴 사전 점검 (원본 쓰기 없음)
# 실행: Live/Rescue 미디어 부팅 후 root 권한
# 산출: /evidence/<TAG>/cold_inspect/*
set -uo pipefail

TAG="${1:-$(hostname)-$(date +%Y%m%dT%H%M%S)}"
OUT="/evidence/${TAG}/cold_inspect"
mkdir -p "$OUT"
LOG="${OUT}/_run.log"

log() { printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$LOG"; }
run() { # run <파일명> <명령...>  : 실패해도 계속 진행
  local f="$1"; shift
  log "COLLECT ${f} :: $*"
  { "$@"; } > "${OUT}/${f}" 2> "${OUT}/${f}.err" || log "  WARN: 실패(코드 $?) - ${f}"
}

log "=== S-01 콜드 점검 시작 : TAG=${TAG} ==="

# ── 0. 조사자 기록 ────────────────────────────────────────────
cat > "${OUT}/00_context.txt" <<CTX
조사 태그      : ${TAG}
조사 시각(UTC) : $(date -u +%FT%TZ)
조사자         : ${INSPECTOR:-미기재}
자산번호       : ${ASSET_ID:-미기재}
데이터센터     : ${DC_SITE:-미기재}
원 랙 위치     : ${RACK_POS:-미기재}
부팅위험등급   : ${BOOT_RISK:-미기재}
CTX

# ── 1. 시스템 시각 (CMOS 배터리 소진 확인) ────────────────────
{
  echo "system_clock_utc=$(date -u +%FT%TZ)"
  echo "hwclock=$(hwclock -r 2>/dev/null || echo READ_FAIL)"
} > "${OUT}/01_clock.txt"
# 시각이 과거로 크게 어긋나 있으면 CMOS 배터리 소진 → 로그 타임스탬프 신뢰도 하락
YEAR="$(date -u +%Y)"
if [ "$YEAR" -lt 2020 ]; then
  log "  ALERT: 시스템 시각 이상(${YEAR}). CMOS 배터리 소진 의심 → 타임스탬프 신뢰 불가로 기록"
  echo "CLOCK_UNRELIABLE=true" >> "${OUT}/01_clock.txt"
fi

# ── 2. 하드웨어 인벤토리 ──────────────────────────────────────
run 02_dmidecode.txt        dmidecode
run 03_lscpu.txt            lscpu
run 04_meminfo.txt          cat /proc/meminfo
run 05_lspci.txt            lspci -vvv
run 06_lsblk.txt            lsblk -o NAME,KNAME,SIZE,TYPE,ROTA,MODEL,SERIAL,WWN,FSTYPE,UUID,LABEL,MOUNTPOINT
run 07_blkid.txt            blkid
run 08_lsscsi.txt           lsscsi -s
run 09_dmesg.txt            dmesg

# ── 3. 매체 건강 상태 (SMART) : 무전원 장기방치 핵심 지표 ─────
: > "${OUT}/10_smart_summary.csv"
echo "device,type,model,serial,power_on_hours,power_cycles,reallocated,pending,uncorrectable,media_wearout,percentage_used,overall_health" \
  >> "${OUT}/10_smart_summary.csv"

for d in /dev/sd? /dev/nvme?n?; do
  [ -b "$d" ] || continue
  base="$(basename "$d")"
  smartctl -x "$d" > "${OUT}/smart_${base}.txt" 2>&1 || true

  model=$(awk -F: '/Device Model|Model Number/{gsub(/^ +/,"",$2);print $2;exit}' "${OUT}/smart_${base}.txt")
  serial=$(awk -F: '/Serial Number/{gsub(/^ +/,"",$2);print $2;exit}' "${OUT}/smart_${base}.txt")
  poh=$(awk '/Power_On_Hours|Power On Hours/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  pc=$(awk '/Power_Cycle_Count|Power Cycles/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  realloc=$(awk '/Reallocated_Sector_Ct/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  pending=$(awk '/Current_Pending_Sector/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  uncorr=$(awk '/Offline_Uncorrectable|Media and Data Integrity Errors/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  wear=$(awk '/Media_Wearout_Indicator|Wear_Leveling_Count/{print $(NF);exit}' "${OUT}/smart_${base}.txt")
  used=$(awk -F: '/Percentage Used/{gsub(/[ %]/,"",$2);print $2;exit}' "${OUT}/smart_${base}.txt")
  health=$(awk -F: '/SMART overall-health|SMART Health Status/{gsub(/^ +/,"",$2);print $2;exit}' "${OUT}/smart_${base}.txt")
  type=$([ "${base:0:4}" = "nvme" ] && echo SSD || ( [ "$(cat /sys/block/${base}/queue/rotational 2>/dev/null)" = "0" ] && echo SSD || echo HDD ))

  printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
    "$d" "$type" "${model:-NA}" "${serial:-NA}" "${poh:-NA}" "${pc:-NA}" \
    "${realloc:-NA}" "${pending:-NA}" "${uncorr:-NA}" "${wear:-NA}" "${used:-NA}" "${health:-NA}" \
    >> "${OUT}/10_smart_summary.csv"

  # 위험 판정
  for v in "$realloc" "$pending" "$uncorr"; do
    if [ -n "${v:-}" ] && [ "${v}" != "0" ] && [ "${v}" != "NA" ]; then
      log "  ALERT: ${d} 매체 오류 지표 비정상 (realloc=${realloc:-NA} pending=${pending:-NA} uncorr=${uncorr:-NA}) → 이미징 최우선"
      echo "${d}" >> "${OUT}/11_at_risk_devices.txt"
      break
    fi
  done
done

# ── 4. RAID 컨트롤러 : 읽기 전용 조회만 수행 ──────────────────
#  경고: Foreign Config Import / Initialize / Auto-Rebuild 를 절대 실행하지 않는다.
if command -v storcli64 >/dev/null 2>&1; then
  run 20_storcli_show_all.txt storcli64 /call show all
  run 21_storcli_events.txt   storcli64 /call show events
elif command -v perccli64 >/dev/null 2>&1; then
  run 20_perccli_show_all.txt perccli64 /call show all
elif command -v hpssacli >/dev/null 2>&1; then
  run 20_hpssacli.txt hpssacli ctrl all show config detail
elif command -v ssacli >/dev/null 2>&1; then
  run 20_ssacli.txt ssacli ctrl all show config detail
else
  log "  NOTE: RAID CLI 미발견 → BIOS/BMC 화면 캡처로 대체 기록 필요"
fi
run 22_mdstat.txt cat /proc/mdstat

# ── 5. 파티션 테이블 백업 (구조 보존) ─────────────────────────
for d in /dev/sd? /dev/nvme?n?; do
  [ -b "$d" ] || continue
  b="$(basename "$d")"
  sfdisk -d "$d" > "${OUT}/30_parttable_${b}.sfdisk" 2>/dev/null || true
  sgdisk --backup="${OUT}/30_gpt_${b}.bin" "$d" >/dev/null 2>&1 || true
done

# ── 6. LVM 메타데이터 (읽기 전용) ─────────────────────────────
run 40_pvs.txt pvs -o+pv_used --readonly
run 41_vgs.txt vgs --readonly
run 42_lvs.txt lvs -a -o+devices --readonly

# ── 7. 마운트 여부 최종 확인 (원본 보호 증거) ─────────────────
mount | grep -E '^/dev/(sd|nvme|mapper)' > "${OUT}/50_mounts.txt" || true
if [ -s "${OUT}/50_mounts.txt" ]; then
  log "  CRITICAL: 원본 블록 디바이스가 마운트되어 있음! 즉시 언마운트하고 사유를 기록하라."
else
  log "  OK: 원본 블록 디바이스 마운트 없음 (무결성 보존)"
fi

# ── 8. 증거 봉인 ──────────────────────────────────────────────
( cd "$OUT" && find . -type f ! -name 'MANIFEST.sha256' -print0 \
  | sort -z | xargs -0 sha256sum > MANIFEST.sha256 )
log "=== S-01 완료. 증거: ${OUT} (파일 $(wc -l < "${OUT}/MANIFEST.sha256")개 봉인) ==="
```

**판독 가이드**

| 관찰 | 해석 | 조치 |
|---|---|---|
| `CLOCK_UNRELIABLE=true` | CMOS 소진 → 로그·파일 mtime 신뢰 불가 | Phase 3의 R-3 규칙 적용 대상에서 제외, R-4로 이동 |
| `11_at_risk_devices.txt` 존재 | 매체 오류 발생 중 | **최우선 이미징**, 재시도 최소화 |
| `Percentage Used` 높음(SSD) | 수명 소진 | 이미징 중 실패 대비 `ddrescue` 사용 |
| storcli 이벤트에 cache/battery 관련 오류 | 캐시 유실 가능 | 해당 볼륨 데이터 정합성 의심 등급 상향 |
| `50_mounts.txt` 비어있지 않음 | **원본 오염 발생** | 작업 중단, 사고 보고 |

---

## A-2. `S-02_forensic_image.sh` — 쓰기 방지 이미징 + 해시 검증

```bash
#!/usr/bin/env bash
# S-02_forensic_image.sh <소스디바이스> <출력디렉터리> [태그]
# 목적: 원본 매체를 비파괴로 이미징하고 해시로 무결성 증명
# 전제: 하드웨어 Write Blocker 경유 연결 또는 blockdev --setro 적용
set -euo pipefail

SRC="${1:?사용법: $0 /dev/sdX /images [태그]}"
DEST_DIR="${2:?출력 디렉터리 필요}"
TAG="${3:-$(basename "$SRC")-$(date +%Y%m%dT%H%M%S)}"

IMG="${DEST_DIR}/${TAG}.img"
MAP="${DEST_DIR}/${TAG}.mapfile"
META="${DEST_DIR}/${TAG}.meta.txt"
mkdir -p "$DEST_DIR"

[ -b "$SRC" ] || { echo "오류: $SRC 는 블록 디바이스가 아님"; exit 1; }

# 1) 마운트 상태면 즉시 중단
if mount | grep -q "^${SRC}"; then
  echo "치명적 오류: ${SRC} 가 마운트되어 있음. 이미징 중단."; exit 2
fi

# 2) 소프트웨어 읽기전용 강제 (하드웨어 Write Blocker의 보조 수단)
blockdev --setro "$SRC"
if [ "$(blockdev --getro "$SRC")" != "1" ]; then
  echo "치명적 오류: 읽기전용 설정 실패. 중단."; exit 3
fi
echo "읽기전용 설정 확인: OK"

# 3) 메타데이터 기록
{
  echo "tag=${TAG}"
  echo "source=${SRC}"
  echo "size_bytes=$(blockdev --getsize64 "$SRC")"
  echo "sector_size=$(blockdev --getss "$SRC")"
  echo "model=$(cat /sys/block/$(basename "$SRC")/device/model 2>/dev/null || echo NA)"
  echo "serial=$(udevadm info --query=property --name="$SRC" 2>/dev/null | awk -F= '/ID_SERIAL_SHORT/{print $2}')"
  echo "wwn=$(udevadm info --query=property --name="$SRC" 2>/dev/null | awk -F= '/ID_WWN=/{print $2}')"
  echo "start_utc=$(date -u +%FT%TZ)"
  echo "operator=${INSPECTOR:-미기재}"
  echo "asset_id=${ASSET_ID:-미기재}"
  echo "dc_site=${DC_SITE:-미기재}"
  echo "slot=${DISK_SLOT:-미기재}"
} > "$META"

# 4) 이미징 : 불량 섹터 대응이 가능한 ddrescue 우선
if command -v ddrescue >/dev/null 2>&1; then
  echo "ddrescue 1차 패스 (빠른 스캔, 불량 구간 건너뜀)"
  ddrescue -n -b "$(blockdev --getss "$SRC")" "$SRC" "$IMG" "$MAP"
  echo "ddrescue 2차 패스 (불량 구간 재시도 3회)"
  ddrescue -d -r3 -b "$(blockdev --getss "$SRC")" "$SRC" "$IMG" "$MAP"
else
  echo "경고: ddrescue 미설치 → dd 사용 (불량 섹터 대응 불가)"
  dd if="$SRC" of="$IMG" bs=1M conv=noerror,sync status=progress
fi

# 5) 해시 계산 (원본 vs 이미지)
echo "원본 해시 계산 중..."
SRC_HASH=$(dd if="$SRC" bs=1M status=none | sha256sum | awk '{print $1}')
echo "이미지 해시 계산 중..."
IMG_HASH=$(sha256sum "$IMG" | awk '{print $1}')

{
  echo "end_utc=$(date -u +%FT%TZ)"
  echo "source_sha256=${SRC_HASH}"
  echo "image_sha256=${IMG_HASH}"
} >> "$META"

if [ "$SRC_HASH" = "$IMG_HASH" ]; then
  echo "verify=PASS" >> "$META"
  echo "무결성 검증 통과 (해시 일치)"
else
  echo "verify=FAIL" >> "$META"
  echo "경고: 해시 불일치. 불량 섹터 존재 시 정상일 수 있음 → mapfile 확인 필요"
  if [ -f "$MAP" ]; then
    ddrescue --log-rates=/dev/null 2>/dev/null || true
    grep -c '' "$MAP" >/dev/null 2>&1 && echo "mapfile=${MAP} (복구 실패 구간 확인)" >> "$META"
  fi
fi

# 6) 이미지 자체를 읽기전용으로
chmod 0440 "$IMG"
echo "완료: ${IMG}"
echo "메타: ${META}"
```

---

## A-3. `S-03_ioc_triage.sh` — 침해 흔적 트리아지 (읽기 전용 마운트 기반)

```bash
#!/usr/bin/env bash
# S-03_ioc_triage.sh <마운트루트> <출력디렉터리>
# 목적: 이미지 복제본을 ro 마운트한 상태에서 침해 지표 수집
# 예: mount -o ro,noexec,nodev,nosuid,loop image.img /mnt/target
#     ./S-03_ioc_triage.sh /mnt/target /evidence/host01/ioc
set -uo pipefail

ROOT="${1:?사용법: $0 <마운트루트> <출력디렉터리>}"
OUT="${2:?출력 디렉터리 필요}"
mkdir -p "$OUT"
FINDINGS="${OUT}/FINDINGS.md"
: > "$FINDINGS"

sev() { printf '- **[%s]** %s\n' "$1" "$2" >> "$FINDINGS"; echo "[$1] $2"; }
cp_if() { [ -e "${ROOT}$1" ] && cp -a "${ROOT}$1" "${OUT}/$2" 2>/dev/null; }

echo "# 침해 흔적 트리아지 결과" >> "$FINDINGS"
echo "" >> "$FINDINGS"
echo "- 대상: \`${ROOT}\`" >> "$FINDINGS"
echo "- 수집 시각(UTC): $(date -u +%FT%TZ)" >> "$FINDINGS"
echo "- 조사자: ${INSPECTOR:-미기재}" >> "$FINDINGS"
echo "" >> "$FINDINGS"
echo "## 지표" >> "$FINDINGS"

# ── 1. 기본 신원 ──────────────────────────────────────────────
{
  echo "hostname=$(cat "${ROOT}/etc/hostname" 2>/dev/null)"
  echo "os_release=$(cat "${ROOT}/etc/redhat-release" 2>/dev/null || cat "${ROOT}/etc/os-release" 2>/dev/null | head -3)"
  echo "kernel_installed=$(ls "${ROOT}/lib/modules" 2>/dev/null | tr '\n' ' ')"
  echo "last_syslog_entry=$(tail -1 "${ROOT}/var/log/messages" 2>/dev/null)"
  echo "last_secure_entry=$(tail -1 "${ROOT}/var/log/secure" 2>/dev/null)"
} > "${OUT}/00_identity.txt"

# ── 2. ld.so.preload : 존재 자체가 강한 의심 신호 ─────────────
if [ -s "${ROOT}/etc/ld.so.preload" ]; then
  sev CRITICAL "/etc/ld.so.preload 존재 및 내용 있음 → 유저랜드 루트킷 강력 의심"
  cp_if /etc/ld.so.preload 10_ld.so.preload
fi

# ── 3. 계정 / 권한 ────────────────────────────────────────────
cp_if /etc/passwd 20_passwd
cp_if /etc/group  21_group
cp_if /etc/shadow 22_shadow
cp_if /etc/sudoers 23_sudoers
[ -d "${ROOT}/etc/sudoers.d" ] && cp -a "${ROOT}/etc/sudoers.d" "${OUT}/23_sudoers.d" 2>/dev/null

# UID 0 중복
awk -F: '$3==0 {print $1}' "${ROOT}/etc/passwd" 2>/dev/null > "${OUT}/24_uid0_accounts.txt"
UID0_CNT=$(wc -l < "${OUT}/24_uid0_accounts.txt")
[ "$UID0_CNT" -gt 1 ] && sev CRITICAL "UID 0 계정이 ${UID0_CNT}개 (root 외 특권 계정 존재)"

# 쉘 로그인 가능 계정 목록
awk -F: '$7 !~ /(nologin|false)$/ {print $1":"$3":"$7}' "${ROOT}/etc/passwd" 2>/dev/null \
  > "${OUT}/25_login_shell_accounts.txt"

# 빈 패스워드
awk -F: '$2=="" {print $1}' "${ROOT}/etc/shadow" 2>/dev/null > "${OUT}/26_empty_password.txt"
[ -s "${OUT}/26_empty_password.txt" ] && sev CRITICAL "빈 패스워드 계정 발견"

# ── 4. SSH 공개키 : 미등록 키는 사실상 확정적 침해 지표 ───────
: > "${OUT}/30_authorized_keys.txt"
find "${ROOT}/root" "${ROOT}/home" -maxdepth 3 -name 'authorized_keys*' 2>/dev/null | while read -r f; do
  echo "=== ${f#$ROOT} ===" >> "${OUT}/30_authorized_keys.txt"
  cat "$f" >> "${OUT}/30_authorized_keys.txt" 2>/dev/null
  # 지문 산출
  ssh-keygen -lf "$f" >> "${OUT}/31_key_fingerprints.txt" 2>/dev/null || true
done
[ -s "${OUT}/30_authorized_keys.txt" ] && sev HIGH "SSH authorized_keys 발견 → 자산관리대장의 승인 키 목록과 지문 대조 필수"

cp_if /etc/ssh/sshd_config 32_sshd_config
grep -Ei '^(PermitRootLogin|PasswordAuthentication|PermitEmptyPasswords|Port|AllowUsers)' \
  "${ROOT}/etc/ssh/sshd_config" 2>/dev/null > "${OUT}/33_sshd_key_settings.txt"
grep -qi '^PermitEmptyPasswords[[:space:]]*yes' "${ROOT}/etc/ssh/sshd_config" 2>/dev/null \
  && sev CRITICAL "sshd: PermitEmptyPasswords yes"

# ── 5. 지속성 메커니즘 ────────────────────────────────────────
for p in /etc/crontab /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly \
         /etc/cron.monthly /var/spool/cron /etc/rc.local /etc/rc.d/rc.local /etc/anacrontab; do
  [ -e "${ROOT}${p}" ] && cp -a "${ROOT}${p}" "${OUT}/40_$(echo "$p" | tr '/' '_')" 2>/dev/null
done

# 크론에서 의심 패턴 탐색
grep -rEl 'curl|wget|base64|/dev/tcp|nc |ncat|python -c|perl -e|chmod \+x|/tmp/' \
  "${ROOT}/etc/cron"* "${ROOT}/var/spool/cron" "${ROOT}/etc/crontab" 2>/dev/null \
  > "${OUT}/41_suspicious_cron.txt"
[ -s "${OUT}/41_suspicious_cron.txt" ] && sev HIGH "크론에 원격 다운로드/인코딩/역쉘 의심 패턴 존재"

# systemd 유닛 : 패키지 소유가 아닌 유닛 식별
find "${ROOT}/etc/systemd/system" "${ROOT}/usr/lib/systemd/system" \
     -name '*.service' -o -name '*.timer' 2>/dev/null | sed "s|^${ROOT}||" \
  > "${OUT}/42_systemd_units.txt"
grep -rEl 'ExecStart=.*(curl|wget|/tmp/|/dev/shm/|base64)' \
  "${ROOT}/etc/systemd/system" 2>/dev/null > "${OUT}/43_suspicious_units.txt"
[ -s "${OUT}/43_suspicious_units.txt" ] && sev HIGH "systemd 유닛에 의심 ExecStart 존재"

# 쉘 프로파일 변조
grep -rE 'curl|wget|base64|/dev/tcp' \
  "${ROOT}/etc/profile" "${ROOT}/etc/profile.d" "${ROOT}/etc/bashrc" \
  "${ROOT}/root/.bashrc" "${ROOT}/root/.bash_profile" 2>/dev/null \
  > "${OUT}/44_profile_suspicious.txt"
[ -s "${OUT}/44_profile_suspicious.txt" ] && sev MEDIUM "쉘 프로파일에 의심 패턴"

# ── 6. 로그 은폐 흔적 ─────────────────────────────────────────
: > "${OUT}/50_zeroed_logs.txt"
for lf in messages secure cron maillog audit/audit.log wtmp btmp lastlog; do
  f="${ROOT}/var/log/${lf}"
  if [ -e "$f" ] && [ ! -s "$f" ]; then
    echo "/var/log/${lf} : 크기 0" >> "${OUT}/50_zeroed_logs.txt"
  fi
done
[ -s "${OUT}/50_zeroed_logs.txt" ] && sev HIGH "핵심 로그 파일 크기 0 → 로그 삭제/은폐 의심"

# 로그인 기록
last -f "${ROOT}/var/log/wtmp"    > "${OUT}/51_last_wtmp.txt" 2>/dev/null || true
lastb -f "${ROOT}/var/log/btmp"   > "${OUT}/52_lastb_btmp.txt" 2>/dev/null || true
grep -Ei 'accepted (password|publickey)' "${ROOT}/var/log/secure"* 2>/dev/null \
  | tail -500 > "${OUT}/53_ssh_accepted.txt" || true
grep -Ei 'failed password' "${ROOT}/var/log/secure"* 2>/dev/null \
  | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -50 \
  > "${OUT}/54_ssh_bruteforce_src.txt" || true

# 로그 커버리지 구간 (판정 불가 구간 산출용)
{
  echo "=== /var/log/messages 존재 파일 및 기간 ==="
  for f in "${ROOT}"/var/log/messages*; do
    [ -e "$f" ] || continue
    echo "--- ${f#$ROOT}"
    (zcat -f "$f" 2>/dev/null || cat "$f") | head -1
    (zcat -f "$f" 2>/dev/null || cat "$f") | tail -1
  done
} > "${OUT}/55_log_coverage.txt" 2>/dev/null

# ── 7. 바이너리 무결성 (rpm DB 사용) ──────────────────────────
if command -v rpm >/dev/null 2>&1 && [ -d "${ROOT}/var/lib/rpm" ]; then
  rpm --root="$ROOT" -Va --nodeps --noscripts --notriggers 2>/dev/null \
    > "${OUT}/60_rpm_verify_all.txt" || true
  # 5번째 문자가 5(MD5 불일치)이고 c(설정파일)가 아닌 항목 = 바이너리 변조 후보
  awk '$1 ~ /5/ && $2 != "c"' "${OUT}/60_rpm_verify_all.txt" \
    > "${OUT}/61_rpm_binary_mismatch.txt" 2>/dev/null || true
  [ -s "${OUT}/61_rpm_binary_mismatch.txt" ] && \
    sev HIGH "rpm -Va: 비설정 파일 해시 불일치 $(wc -l < "${OUT}/61_rpm_binary_mismatch.txt")건 → 변조 가능성"
  rpm --root="$ROOT" -qa --last > "${OUT}/62_rpm_install_history.txt" 2>/dev/null || true
  # 마지막 정상 패치 시점 확인
  head -20 "${OUT}/62_rpm_install_history.txt" > "${OUT}/63_recent_packages.txt"
fi

# ── 8. 웹셸 스캔 (Nginx 문서 루트) ────────────────────────────
[ -d "${ROOT}/etc/nginx" ] && cp -a "${ROOT}/etc/nginx" "${OUT}/70_nginx_conf" 2>/dev/null
WEBROOTS=$(grep -rhoE '^\s*(root|alias)\s+[^;]+;' "${ROOT}/etc/nginx" 2>/dev/null \
  | awk '{print $2}' | tr -d ';' | sort -u)
echo "$WEBROOTS" > "${OUT}/71_webroots.txt"
: > "${OUT}/72_webshell_candidates.txt"
for wr in $WEBROOTS; do
  tgt="${ROOT}${wr}"
  [ -d "$tgt" ] || continue
  grep -rIlE 'eval\s*\(|assert\s*\(|base64_decode|shell_exec|passthru|system\s*\(|popen\s*\(|\$_(POST|GET|REQUEST)\s*\[' \
    "$tgt" 2>/dev/null >> "${OUT}/72_webshell_candidates.txt" || true
  # 업로드 경로에 실행 가능 확장자
  find "$tgt" -type f \( -name '*.php' -o -name '*.jsp' -o -name '*.jspx' -o -name '*.asp' -o -name '*.aspx' -o -name '*.py' -o -name '*.sh' \) \
    -newermt '2020-01-01' 2>/dev/null >> "${OUT}/73_executable_in_webroot.txt" || true
done
[ -s "${OUT}/72_webshell_candidates.txt" ] && \
  sev CRITICAL "웹셸 후보 $(sort -u "${OUT}/72_webshell_candidates.txt" | wc -l)건 발견 → 개별 정밀 분석 필수"

# ── 9. MySQL 침해 지표 ───────────────────────────────────────
cp_if /etc/my.cnf 80_my.cnf
[ -d "${ROOT}/etc/my.cnf.d" ] && cp -a "${ROOT}/etc/my.cnf.d" "${OUT}/80_my.cnf.d" 2>/dev/null
grep -Ei '^(init_file|init-file|plugin_dir|secure_file_priv|general_log|log_bin|server_id|datadir)' \
  "${ROOT}/etc/my.cnf" "${ROOT}"/etc/my.cnf.d/* 2>/dev/null > "${OUT}/81_mysql_key_settings.txt"
grep -qiE '^(init_file|init-file)' "${ROOT}/etc/my.cnf" 2>/dev/null \
  && sev HIGH "my.cnf에 init_file 설정 → 기동 시 임의 SQL 실행 경로"

DATADIR=$(awk -F= '/^datadir/{gsub(/[ \t]/,"",$2);print $2;exit}' "${ROOT}/etc/my.cnf" 2>/dev/null)
DATADIR="${DATADIR:-/var/lib/mysql}"
# 플러그인 디렉터리의 비표준 .so = UDF 백도어 후보
find "${ROOT}/usr/lib64/mysql/plugin" "${ROOT}/usr/lib/mysql/plugin" -name '*.so' 2>/dev/null \
  > "${OUT}/82_mysql_plugins.txt"
find "${ROOT}${DATADIR}" -maxdepth 1 -name '*.so' 2>/dev/null > "${OUT}/83_so_in_datadir.txt"
[ -s "${OUT}/83_so_in_datadir.txt" ] && sev CRITICAL "MySQL datadir에 .so 파일 존재 → UDF 백도어 강력 의심"

# ── 10. 임시 디렉터리 / 타임스톰핑 ────────────────────────────
for d in /tmp /var/tmp /dev/shm /root; do
  find "${ROOT}${d}" -maxdepth 3 -type f -printf '%T+ %s %M %u %p\n' 2>/dev/null \
    | sort >> "${OUT}/90_tmp_inventory.txt"
done
# 실행 권한 있는 임시 파일
find "${ROOT}/tmp" "${ROOT}/var/tmp" "${ROOT}/dev/shm" -maxdepth 3 -type f -perm -u+x 2>/dev/null \
  > "${OUT}/91_executable_in_tmp.txt"
[ -s "${OUT}/91_executable_in_tmp.txt" ] && sev HIGH "임시 디렉터리에 실행 권한 파일 존재"

# SUID/SGID 비정상
find "$ROOT" -xdev -type f \( -perm -4000 -o -perm -2000 \) -printf '%M %u %g %p\n' 2>/dev/null \
  | sed "s|${ROOT}||" > "${OUT}/92_suid_sgid.txt"

# ── 11. 커널 모듈 ────────────────────────────────────────────
find "${ROOT}/lib/modules" -name '*.ko' -newermt '2021-01-01' 2>/dev/null \
  | sed "s|${ROOT}||" > "${OUT}/93_recent_kmods.txt"

# ── 12. 판정 요약 ────────────────────────────────────────────
{
  echo ""
  echo "## 판정 제안"
  C=$(grep -c '\[CRITICAL\]' "$FINDINGS" || true)
  H=$(grep -c '\[HIGH\]' "$FINDINGS" || true)
  M=$(grep -c '\[MEDIUM\]' "$FINDINGS" || true)
  echo ""
  echo "| 심각도 | 건수 |"
  echo "|---|---|"
  echo "| CRITICAL | ${C} |"
  echo "| HIGH | ${H} |"
  echo "| MEDIUM | ${M} |"
  echo ""
  if [ "${C:-0}" -gt 0 ]; then
    echo "**제안 판정: C (Compromised)** — 서버 재사용 금지. 데이터만 정제 추출."
  elif [ "${H:-0}" -gt 0 ]; then
    echo "**제안 판정: S (Suspicious)** — 심층 분석 필요. 잠정적으로 C로 취급."
  else
    echo "**제안 판정: N (No indicators found)** — 지표 미발견. 단 이는 '침해 없음'의 증명이 아니다."
    echo ""
    echo "> 로그 결손 구간(\`55_log_coverage.txt\`)에 대해서는 어떤 판정도 성립하지 않음을 명시한다."
  fi
  echo ""
  echo "최종 판정은 자동 제안이 아니라 **분석자 검토 후 서면 확정**한다."
} >> "$FINDINGS"

( cd "$OUT" && find . -type f ! -name 'MANIFEST.sha256' -print0 | sort -z | xargs -0 sha256sum > MANIFEST.sha256 )
echo "완료. 결과 요약: ${FINDINGS}"
```

---

## A-4. `S-04_centos_vault_repo.sh` — EOL CentOS 저장소 전환 (필수 선행)

> 이 스크립트 없이는 `yum update`가 **저장소 접속 실패로 끝난다.** CentOS 공식 미러는 서비스 종료되었고 아카이브(vault)로만 접근 가능하다.

```bash
#!/usr/bin/env bash
# S-04_centos_vault_repo.sh
# 목적: EOL CentOS의 저장소를 사내 미러(권장) 또는 vault 아카이브로 전환
# 주의: 격리망에서는 반드시 사내 미러를 사용한다(외부 접속 차단 원칙).
set -euo pipefail

MIRROR_BASE="${MIRROR_BASE:-http://repo.internal.local/centos}"   # 사내 미러 (권장)
USE_VAULT="${USE_VAULT:-0}"                                        # 1이면 vault.centos.org 직접 사용
BACKUP_DIR="/root/repo-backup-$(date +%Y%m%dT%H%M%S)"

# 1) 버전 판별
if [ -f /etc/centos-release ]; then
  FULLVER=$(rpm -q --qf '%{VERSION}.%{RELEASE}\n' centos-release 2>/dev/null | head -1)
  MAJOR=$(rpm -E %{rhel})
else
  echo "CentOS 계열이 아님. 중단."; exit 1
fi
echo "감지: CentOS major=${MAJOR}"

# 2) EOL 시점 아카이브 버전 매핑 (환경에 맞게 확인 후 사용)
case "$MAJOR" in
  7) ARCHIVE_VER="${ARCHIVE_VER:-7.9.2009}" ;;
  8) ARCHIVE_VER="${ARCHIVE_VER:-8.5.2111}" ;;
  *) echo "지원하지 않는 major 버전: ${MAJOR}"; exit 1 ;;
esac
echo "아카이브 버전: ${ARCHIVE_VER}"

if [ "$USE_VAULT" = "1" ]; then
  BASE="https://vault.centos.org/${ARCHIVE_VER}"
else
  BASE="${MIRROR_BASE}/${ARCHIVE_VER}"
fi
echo "저장소 기준 URL: ${BASE}"

# 3) 기존 repo 파일 백업
mkdir -p "$BACKUP_DIR"
cp -a /etc/yum.repos.d/. "$BACKUP_DIR"/ 2>/dev/null || true
echo "기존 저장소 백업: ${BACKUP_DIR}"

# 4) 기존 repo 비활성화
for f in /etc/yum.repos.d/*.repo; do
  [ -e "$f" ] || continue
  mv "$f" "${f}.disabled"
done

# 5) 신규 repo 작성
if [ "$MAJOR" = "7" ]; then
  cat > /etc/yum.repos.d/centos-archive.repo <<'REPO7'
[base-archive]
name=CentOS-7 - Base (Archive)
baseurl=__BASE__/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
enabled=1

[updates-archive]
name=CentOS-7 - Updates (Archive)
baseurl=__BASE__/updates/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
enabled=1

[extras-archive]
name=CentOS-7 - Extras (Archive)
baseurl=__BASE__/extras/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
enabled=1
REPO7
  sed -i "s|__BASE__|${BASE}|g" /etc/yum.repos.d/centos-archive.repo
else
  cat > /etc/yum.repos.d/centos-archive.repo <<'REPO8'
[baseos-archive]
name=CentOS-8 - BaseOS (Archive)
baseurl=__BASE__/BaseOS/$basearch/os/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
enabled=1

[appstream-archive]
name=CentOS-8 - AppStream (Archive)
baseurl=__BASE__/AppStream/$basearch/os/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
enabled=1
REPO8
  sed -i "s|__BASE__|${BASE}|g" /etc/yum.repos.d/centos-archive.repo
fi

# 6) 캐시 재구성 및 검증
yum clean all >/dev/null 2>&1 || true
rm -rf /var/cache/yum /var/cache/dnf 2>/dev/null || true

if yum makecache -y >/dev/null 2>&1 || yum makecache fast -y >/dev/null 2>&1; then
  echo "저장소 전환 성공"
  yum repolist
else
  echo "저장소 전환 실패 → 백업 복구"
  rm -f /etc/yum.repos.d/centos-archive.repo
  cp -a "$BACKUP_DIR"/. /etc/yum.repos.d/
  exit 2
fi

# 7) GPG 서명 검증이 켜져 있는지 최종 확인 (금융권 필수)
if grep -q '^gpgcheck=0' /etc/yum.repos.d/centos-archive.repo; then
  echo "치명적: gpgcheck=0 발견. 중단."; exit 3
fi
echo "GPG 검증 활성 확인: OK"

# 8) 잔여 위험 고지
cat <<'WARN'

================================================================
[중요] 이 저장소는 EOL 시점까지의 패치만 포함한다.
       EOL 이후 공개된 취약점은 벤더 패치가 존재하지 않는다.
       → Phase 2-D에서 결정한 완화 통제(망분리/WAF/EDR/최소권한)를
         반드시 병행 적용하고, 잔여 위험을 문서화하라.
================================================================
WARN
```

---

## A-5. `S-05_patch_precheck.sh` — 패치 사전 점검 (실패 예방)

```bash
#!/usr/bin/env bash
# S-05_patch_precheck.sh
# 목적: 패치 실행 전 실패 요인 사전 차단. 하나라도 실패하면 패치 진행 금지.
set -uo pipefail

RC=0
PASS=0; FAIL=0
OUT="/var/log/patch-precheck-$(date +%Y%m%dT%H%M%S).log"

chk() { # chk <항목명> <조건결과(0=통과)> <상세>
  if [ "$2" -eq 0 ]; then
    printf '  [PASS] %-38s %s\n' "$1" "${3:-}" | tee -a "$OUT"; PASS=$((PASS+1))
  else
    printf '  [FAIL] %-38s %s\n' "$1" "${3:-}" | tee -a "$OUT"; FAIL=$((FAIL+1)); RC=1
  fi
}

echo "=== 패치 사전 점검 : $(hostname) / $(date -u +%FT%TZ) ===" | tee "$OUT"

# 1. 권한
[ "$(id -u)" -eq 0 ]; chk "root 권한" $? ""

# 2. 디스크 여유 (커널 패치 실패 1순위 원인)
BOOT_AVAIL=$(df -Pm /boot 2>/dev/null | awk 'NR==2{print $4}')
ROOT_AVAIL=$(df -Pm /      | awk 'NR==2{print $4}')
VAR_AVAIL=$(df -Pm /var    | awk 'NR==2{print $4}')
[ "${BOOT_AVAIL:-0}" -ge 200 ]; chk "/boot 여유 >= 200MB"  $? "현재 ${BOOT_AVAIL:-NA}MB"
[ "${ROOT_AVAIL:-0}" -ge 5120 ]; chk "/ 여유 >= 5GB"       $? "현재 ${ROOT_AVAIL:-0}MB"
[ "${VAR_AVAIL:-0}"  -ge 3072 ]; chk "/var 여유 >= 3GB"    $? "현재 ${VAR_AVAIL:-0}MB"

# 3. 설치된 커널 개수 (과다 시 /boot 고갈)
KCNT=$(rpm -q kernel 2>/dev/null | wc -l)
[ "$KCNT" -le 3 ]; chk "설치 커널 <= 3개" $? "현재 ${KCNT}개 (초과 시 package-cleanup --oldkernels 검토)"

# 4. 저장소 정상 동작 (S-04 선행 필수)
yum repolist enabled >/dev/null 2>&1; chk "yum 저장소 응답" $? ""
REPOCNT=$(yum repolist enabled 2>/dev/null | grep -cE '^[a-zA-Z0-9]' || echo 0)
[ "$REPOCNT" -ge 1 ]; chk "활성 저장소 1개 이상" $? "${REPOCNT}개"

# 5. GPG 검증 활성 (금융권 필수)
! grep -rq '^gpgcheck=0' /etc/yum.repos.d/ 2>/dev/null; chk "gpgcheck=0 없음" $? ""

# 6. RPM DB 정상
rpm -qa >/dev/null 2>&1; chk "RPM DB 조회 정상" $? ""
[ ! -f /var/lib/rpm/.rpm.lock ]; chk "RPM 락 없음" $? ""

# 7. 진행 중 yum 트랜잭션 잔여
! yum-complete-transaction --help >/dev/null 2>&1 || \
  [ -z "$(ls /var/lib/yum/transaction-* 2>/dev/null)" ]
chk "미완료 yum 트랜잭션 없음" $? ""

# 8. 백업/스냅샷 존재 증거 (파일 기반 플래그)
[ -f /var/lib/patch-guard/backup.ok ]; chk "백업 완료 플래그 존재" $? "없으면 패치 금지: /var/lib/patch-guard/backup.ok"

# 9. 서비스 현황 기록 (패치 후 비교 기준)
mkdir -p /var/lib/patch-guard
systemctl list-units --type=service --state=running --no-legend --no-pager 2>/dev/null \
  | awk '{print $1}' | sort > /var/lib/patch-guard/services.before
ss -Hltnp 2>/dev/null | awk '{print $4}' | sort -u > /var/lib/patch-guard/listeners.before
[ -s /var/lib/patch-guard/services.before ]; chk "실행 서비스 목록 기록" $? "$(wc -l < /var/lib/patch-guard/services.before)개"

# 10. Nginx 설정 문법
if command -v nginx >/dev/null 2>&1; then
  nginx -t >/dev/null 2>&1; chk "nginx 설정 문법 정상(패치 전)" $? ""
  nginx -v 2>&1 | tee -a "$OUT" >/dev/null
  nginx -V 2>&1 > /var/lib/patch-guard/nginx.before
fi

# 11. MySQL 상태 및 백업
if command -v mysql >/dev/null 2>&1; then
  mysqladmin ping >/dev/null 2>&1; chk "mysqld 응답" $? ""
  mysql -N -e "SELECT VERSION();" 2>/dev/null > /var/lib/patch-guard/mysql_version.before
  chk "MySQL 버전 기록" $? "$(cat /var/lib/patch-guard/mysql_version.before 2>/dev/null)"
  # 테이블/행수 스냅샷 (검증 기준)
  mysql -N -e "SELECT table_schema, COUNT(*) FROM information_schema.tables GROUP BY 1;" \
    2>/dev/null > /var/lib/patch-guard/mysql_tablecount.before
  [ -f /var/lib/patch-guard/mysql_dump.ok ]; chk "MySQL 논리 백업 플래그" $? "없으면 DB 패치 금지"
fi

# 12. 콘솔 접근 (부팅 실패 대비)
[ -n "${BMC_REACHABLE:-}" ]; chk "BMC/콘솔 접근 확인(환경변수)" $? "BMC_REACHABLE=1 로 명시 필요"

# 13. 시스템 시각
if command -v chronyc >/dev/null 2>&1; then
  chronyc tracking >/dev/null 2>&1; chk "시각 동기(chrony)" $? ""
elif command -v ntpq >/dev/null 2>&1; then
  ntpq -p >/dev/null 2>&1; chk "시각 동기(ntpd)" $? ""
fi
Y=$(date +%Y); [ "$Y" -ge 2024 ]; chk "시스템 연도 정상" $? "현재 ${Y}"

# 14. 예상 패치 규모
yum check-update > /var/lib/patch-guard/updates.pending 2>/dev/null
PKGS=$(grep -cE '^[a-zA-Z0-9].*\.(x86_64|noarch|i686)' /var/lib/patch-guard/updates.pending || echo 0)
echo "  [INFO] 갱신 대상 패키지: ${PKGS}개" | tee -a "$OUT"
grep -qE '^kernel' /var/lib/patch-guard/updates.pending && \
  echo "  [INFO] 커널 갱신 포함 → 리부트 필수" | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "=== 결과: PASS ${PASS} / FAIL ${FAIL} ===" | tee -a "$OUT"
if [ "$RC" -ne 0 ]; then
  echo "!!! 사전 점검 실패. 패치를 진행하지 마십시오. 로그: ${OUT}" | tee -a "$OUT"
fi
exit "$RC"
```

---

## A-6. `S-06_patch_apply.sh` — 패치 적용 (백업 → 패치 → 헬스체크 → 자동 롤백)

```bash
#!/usr/bin/env bash
# S-06_patch_apply.sh [--dry-run]
# 순서: 스냅샷 → 서비스 정지 → OS(비커널) → Nginx → MySQL → 커널 → 리부트 → 헬스체크
# 실패 시 자동 롤백(yum history undo) 시도 후 결과 보고
set -uo pipefail

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

TS=$(date +%Y%m%dT%H%M%S)
WORK="/var/lib/patch-guard"
LOG="/var/log/patch-apply-${TS}.log"
BK="/var/backups/prepatch-${TS}"
mkdir -p "$WORK" "$BK"

log() { printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$LOG"; }
die() { log "치명적 오류: $*"; log "롤백 절차 확인 필요. 로그: ${LOG}"; exit 1; }
do_cmd() {
  if [ "$DRY_RUN" -eq 1 ]; then log "[DRY-RUN] $*"; return 0; fi
  log "실행: $*"
  "$@" >> "$LOG" 2>&1
}

log "===== 패치 적용 시작 : $(hostname) ====="
[ "$DRY_RUN" -eq 1 ] && log "*** DRY-RUN 모드 : 실제 변경 없음 ***"

# ── 0. 사전 점검 재확인 (게이트) ──────────────────────────────
if [ "$DRY_RUN" -eq 0 ]; then
  /usr/local/sbin/S-05_patch_precheck.sh || die "사전 점검 실패 → 패치 중단"
fi

# ── 1. 설정 백업 ──────────────────────────────────────────────
log "--- 1. 설정/메타데이터 백업 ---"
for p in /etc /boot/grub2 /var/spool/cron; do
  [ -e "$p" ] && tar czf "${BK}/$(echo "$p" | tr '/' '_').tar.gz" "$p" 2>/dev/null
done
rpm -qa --qf '%{NAME}-%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort > "${BK}/rpm-list.before"
uname -r > "${BK}/kernel.before"
cp -a /etc/yum.repos.d "${BK}/yum.repos.d" 2>/dev/null || true
log "백업 위치: ${BK}"

# ── 2. yum history 기준점 기록 (롤백 앵커) ────────────────────
YUM_TID_BEFORE=$(yum history list 2>/dev/null | awk 'NR==4{print $1}' | tr -d '|')
echo "${YUM_TID_BEFORE}" > "${BK}/yum_tid.before"
log "yum 트랜잭션 기준점: ${YUM_TID_BEFORE}"

# ── 3. 서비스 정지 (역순 의존) ────────────────────────────────
log "--- 3. 서비스 정지 ---"
for svc in nginx php-fpm httpd mysqld mariadb; do
  systemctl is-active --quiet "$svc" 2>/dev/null && { do_cmd systemctl stop "$svc"; echo "$svc" >> "${BK}/stopped_services"; }
done

# ── 4. OS 비커널 보안 패치 ────────────────────────────────────
log "--- 4. OS 보안 패치 (커널 제외) ---"
if [ "$DRY_RUN" -eq 1 ]; then
  yum --security check-update 2>&1 | tail -40 | tee -a "$LOG"
else
  # --security 플러그인이 없는 환경도 있으므로 폴백
  if yum --security check-update >/dev/null 2>&1; then
    yum -y --security --exclude='kernel*' update >> "$LOG" 2>&1 || log "경고: 보안 패치 일부 실패"
  else
    log "경고: yum-plugin-security 미지원 → 전체 update로 대체(--exclude kernel)"
    yum -y --exclude='kernel*' update >> "$LOG" 2>&1 || log "경고: 패치 일부 실패"
  fi
fi

# ── 5. Nginx 패치 ─────────────────────────────────────────────
log "--- 5. Nginx 패치 ---"
if rpm -q nginx >/dev/null 2>&1; then
  cp -a /etc/nginx "${BK}/nginx.conf.before" 2>/dev/null || true
  do_cmd yum -y update nginx
  if [ "$DRY_RUN" -eq 0 ]; then
    if nginx -t >> "$LOG" 2>&1; then
      log "nginx 설정 문법 정상"
    else
      log "경고: nginx 설정 문법 오류 → 설정 원복 시도"
      rm -rf /etc/nginx && cp -a "${BK}/nginx.conf.before" /etc/nginx
      nginx -t >> "$LOG" 2>&1 || die "nginx 설정 복구 실패"
      log "설정 원복 완료. 신버전 문법 차이 항목을 수동 조정하라."
    fi
  fi
fi

# ── 6. MySQL 패치 ─────────────────────────────────────────────
log "--- 6. MySQL 패치 ---"
if rpm -qa | grep -qiE '^(mysql|mariadb)'; then
  [ -f "${WORK}/mysql_dump.ok" ] || die "MySQL 논리 백업 미확인 → DB 패치 중단"
  do_cmd yum -y update 'mysql*' 'mariadb*'
  if [ "$DRY_RUN" -eq 0 ]; then
    systemctl start mysqld 2>/dev/null || systemctl start mariadb 2>/dev/null || log "경고: DB 기동 실패"
    sleep 10
    if mysqladmin ping >/dev/null 2>&1; then
      log "DB 기동 확인. mysql_upgrade / mysqlcheck 수행"
      mysql_upgrade >> "$LOG" 2>&1 || log "경고: mysql_upgrade 경고 발생 (로그 확인)"
      mysqlcheck --all-databases --check >> "$LOG" 2>&1 || log "경고: mysqlcheck 오류 발생"
    else
      log "치명적: DB 기동 실패 → 롤백 필요"
      ROLLBACK_NEEDED=1
    fi
  fi
fi

# ── 7. 커널 패치 (마지막) ─────────────────────────────────────
log "--- 7. 커널 패치 ---"
if yum check-update kernel >/dev/null 2>&1; then
  do_cmd yum -y update 'kernel*'
  if [ "$DRY_RUN" -eq 0 ]; then
    # 부팅 실패 대비: 이전 커널 엔트리 보존 확인
    NEWK=$(rpm -q kernel --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort -V | tail -1)
    log "신규 커널: ${NEWK} / 기존: $(cat "${BK}/kernel.before")"
    grep -c 'menuentry ' /boot/grub2/grub.cfg 2>/dev/null | xargs -I{} log "grub 엔트리 수: {}"
    log "부팅 실패 시 BMC 콘솔에서 이전 커널 엔트리를 선택하여 복구하라."
    # initramfs 재생성 (드라이버 호환 문제 예방)
    dracut -f --regenerate-all >> "$LOG" 2>&1 || log "경고: dracut 재생성 실패"
  fi
fi

# ── 8. 롤백 판단 ──────────────────────────────────────────────
if [ "${ROLLBACK_NEEDED:-0}" = "1" ] && [ "$DRY_RUN" -eq 0 ]; then
  log "--- 자동 롤백 개시 (yum history undo ${YUM_TID_BEFORE}) ---"
  YUM_TID_NOW=$(yum history list 2>/dev/null | awk 'NR==4{print $1}' | tr -d '|')
  if [ -n "$YUM_TID_NOW" ] && [ "$YUM_TID_NOW" != "$YUM_TID_BEFORE" ]; then
    yum -y history undo "$YUM_TID_NOW" >> "$LOG" 2>&1 \
      && log "패키지 롤백 성공" || log "패키지 롤백 실패 → 스냅샷 복원 필요"
  fi
  # 설정 복원
  for t in "${BK}"/_etc.tar.gz; do [ -f "$t" ] && tar xzf "$t" -C / 2>/dev/null; done
  log "롤백 완료(또는 부분 완료). 스냅샷 복원 여부를 판단하라."
  exit 1
fi

# ── 9. 결과 기록 ──────────────────────────────────────────────
rpm -qa --qf '%{NAME}-%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort > "${BK}/rpm-list.after"
diff "${BK}/rpm-list.before" "${BK}/rpm-list.after" > "${BK}/rpm-diff.txt" || true
log "변경 패키지: $(grep -c '^>' "${BK}/rpm-diff.txt" || echo 0)개 추가/갱신"

if [ "$DRY_RUN" -eq 1 ]; then
  log "===== DRY-RUN 종료 (실제 변경 없음) ====="
  exit 0
fi

# ── 10. 리부트 안내 ───────────────────────────────────────────
if [ -f /var/run/reboot-required ] || \
   [ "$(uname -r)" != "$(rpm -q kernel --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort -V | tail -1)" ]; then
  log "커널 변경 감지 → 리부트 필요"
  touch "${WORK}/reboot.pending"
  log "다음 단계: (1) BMC 콘솔 준비 (2) 'systemctl reboot' (3) S-07 검증 스크립트 실행"
else
  log "리부트 불필요. S-07 검증 스크립트를 실행하라."
fi

log "===== 패치 적용 종료. 로그: ${LOG} / 백업: ${BK} ====="
```

---

## A-7. `S-07_postpatch_verify.sh` — 패치 후 검증

```bash
#!/usr/bin/env bash
# S-07_postpatch_verify.sh
# 목적: 패치/리부트 후 기능·보안 검증. 실패 항목이 있으면 롤백 판단 근거로 사용.
set -uo pipefail

WORK="/var/lib/patch-guard"
TS=$(date +%Y%m%dT%H%M%S)
RPT="/var/log/postpatch-verify-${TS}.md"
PASS=0; FAIL=0; WARN=0

ok()   { printf '| %s | ✅ PASS | %s |\n' "$1" "${2:-}" >> "$RPT"; PASS=$((PASS+1)); }
ng()   { printf '| %s | ❌ FAIL | %s |\n' "$1" "${2:-}" >> "$RPT"; FAIL=$((FAIL+1)); }
warn() { printf '| %s | ⚠️ WARN | %s |\n' "$1" "${2:-}" >> "$RPT"; WARN=$((WARN+1)); }

{
  echo "# 패치 후 검증 리포트"
  echo ""
  echo "- 호스트: \`$(hostname)\`"
  echo "- 시각(UTC): $(date -u +%FT%TZ)"
  echo "- 커널: \`$(uname -r)\` (패치 전: \`$(cat /var/backups/prepatch-*/kernel.before 2>/dev/null | tail -1)\`)"
  echo ""
  echo "| 항목 | 결과 | 상세 |"
  echo "|---|---|---|"
} > "$RPT"

# 1. 부팅 성공 및 업타임
UP=$(awk '{printf "%d", $1/60}' /proc/uptime)
ok "부팅 성공" "업타임 ${UP}분"

# 2. 커널 로드 상태
if [ "$(uname -r)" = "$(rpm -q kernel --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort -V | tail -1)" ]; then
  ok "최신 커널로 부팅" "$(uname -r)"
else
  warn "최신 커널 미적용" "실행 $(uname -r) / 설치 최신 $(rpm -q kernel --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort -V | tail -1)"
fi

# 3. dmesg 에러/드라이버 문제
DMERR=$(dmesg --level=err,crit,alert,emerg 2>/dev/null | wc -l)
[ "$DMERR" -eq 0 ] && ok "dmesg 심각 오류 없음" "" || warn "dmesg 오류 ${DMERR}건" "드라이버 호환성 확인 필요"

# 4. 실패 유닛
FAILED=$(systemctl list-units --state=failed --no-legend --no-pager 2>/dev/null | wc -l)
[ "$FAILED" -eq 0 ] && ok "실패 systemd 유닛 없음" "" || ng "실패 유닛 ${FAILED}건" "$(systemctl list-units --state=failed --no-legend --no-pager | awk '{print $2}' | tr '\n' ' ')"

# 5. 서비스 목록 비교 (패치 전 기록 대비)
if [ -f "${WORK}/services.before" ]; then
  systemctl list-units --type=service --state=running --no-legend --no-pager 2>/dev/null \
    | awk '{print $1}' | sort > "${WORK}/services.after"
  MISSING=$(comm -23 "${WORK}/services.before" "${WORK}/services.after" | tr '\n' ' ')
  [ -z "$MISSING" ] && ok "패치 전 실행 서비스 전부 복귀" "" || ng "미복귀 서비스" "${MISSING}"
fi

# 6. 리스닝 포트 비교
if [ -f "${WORK}/listeners.before" ]; then
  ss -Hltnp 2>/dev/null | awk '{print $4}' | sort -u > "${WORK}/listeners.after"
  LMISS=$(comm -23 "${WORK}/listeners.before" "${WORK}/listeners.after" | tr '\n' ' ')
  LNEW=$(comm -13 "${WORK}/listeners.before" "${WORK}/listeners.after" | tr '\n' ' ')
  [ -z "$LMISS" ] && ok "리스닝 포트 전부 복귀" "" || ng "미복귀 포트" "${LMISS}"
  [ -z "$LNEW" ] && ok "신규 리스닝 포트 없음" "" || warn "신규 포트 출현" "${LNEW} (사유 확인)"
fi

# 7. Nginx
if command -v nginx >/dev/null 2>&1; then
  nginx -t >/dev/null 2>&1 && ok "nginx 설정 문법" "$(nginx -v 2>&1)" || ng "nginx 설정 문법 오류" ""
  systemctl is-active --quiet nginx && ok "nginx 실행 중" "" || ng "nginx 미실행" ""
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 5 http://127.0.0.1/ 2>/dev/null || echo 000)
  [ "$code" != "000" ] && ok "HTTP 응답" "HTTP ${code}" || ng "HTTP 무응답" ""
fi

# 8. MySQL
if command -v mysql >/dev/null 2>&1; then
  if mysqladmin ping >/dev/null 2>&1; then
    ok "mysqld 응답" "$(mysql -N -e 'SELECT VERSION();' 2>/dev/null)"
    # 테이블 수 비교
    if [ -f "${WORK}/mysql_tablecount.before" ]; then
      mysql -N -e "SELECT table_schema, COUNT(*) FROM information_schema.tables GROUP BY 1;" \
        2>/dev/null > "${WORK}/mysql_tablecount.after"
      if diff -q "${WORK}/mysql_tablecount.before" "${WORK}/mysql_tablecount.after" >/dev/null; then
        ok "DB 테이블 수 일치" ""
      else
        ng "DB 테이블 수 불일치" "$(diff "${WORK}/mysql_tablecount.before" "${WORK}/mysql_tablecount.after" | tr '\n' ' ' | cut -c1-160)"
      fi
    fi
    ERRC=$(mysqlcheck --all-databases --check 2>&1 | grep -ci 'error' || true)
    [ "$ERRC" -eq 0 ] && ok "mysqlcheck 오류 없음" "" || ng "mysqlcheck 오류 ${ERRC}건" ""
    # 복제 상태(해당 시)
    mysql -N -e "SHOW SLAVE STATUS\G" 2>/dev/null | grep -E 'Slave_(IO|SQL)_Running|Seconds_Behind' \
      > "${WORK}/replication.after" 2>/dev/null || true
  else
    ng "mysqld 무응답" ""
  fi
fi

# 9. 파일시스템 / 마운트
BADMNT=$(awk '$4 ~ /^ro/ && $2 !~ /(proc|sys|cgroup|snap)/ {print $2}' /proc/mounts 2>/dev/null | tr '\n' ' ')
[ -z "$BADMNT" ] && ok "읽기전용 전환된 마운트 없음" "" || ng "읽기전용 마운트 발생" "${BADMNT}"
DFULL=$(df -Ph | awk 'NR>1 && $5+0 >= 90 {print $6"("$5")"}' | tr '\n' ' ')
[ -z "$DFULL" ] && ok "디스크 사용률 정상" "" || warn "사용률 90% 이상" "${DFULL}"

# 10. 패치 적용 확인
PEND=$(yum check-update 2>/dev/null | grep -cE '^[a-zA-Z0-9].*\.(x86_64|noarch|i686)' || echo 0)
[ "$PEND" -eq 0 ] && ok "잔여 갱신 패키지 없음" "" || warn "잔여 갱신 ${PEND}개" "EOL 저장소 한계 또는 제외 패키지"

# 11. 보안 기본 통제 재확인 (패치로 원복되는 경우 있음)
grep -qi '^PermitRootLogin[[:space:]]*no' /etc/ssh/sshd_config 2>/dev/null \
  && ok "PermitRootLogin no" "" || warn "PermitRootLogin 설정 확인 필요" "패치 후 원복 여부 점검"
[ "$(getenforce 2>/dev/null || echo NA)" != "Disabled" ] \
  && ok "SELinux 미비활성" "$(getenforce 2>/dev/null)" || warn "SELinux Disabled" ""
systemctl is-active --quiet firewalld 2>/dev/null || systemctl is-active --quiet iptables 2>/dev/null \
  && ok "호스트 방화벽 활성" "" || warn "호스트 방화벽 비활성" ""

# 12. 무결성 재확인 (패치 후 IOC 재점검 - 축약판)
[ ! -s /etc/ld.so.preload ] && ok "ld.so.preload 비어있음" "" || ng "ld.so.preload 내용 존재" "재침해 의심"
NEWKEYS=$(find /root/.ssh /home/*/.ssh -name 'authorized_keys' -newermt "-1 day" 2>/dev/null | tr '\n' ' ')
[ -z "$NEWKEYS" ] && ok "24시간 내 SSH 키 변경 없음" "" || warn "SSH 키 최근 변경" "${NEWKEYS}"

# ── 요약 ─────────────────────────────────────────────────────
{
  echo ""
  echo "## 요약"
  echo ""
  echo "| PASS | WARN | FAIL |"
  echo "|---|---|---|"
  echo "| ${PASS} | ${WARN} | ${FAIL} |"
  echo ""
  if [ "$FAIL" -gt 0 ]; then
    echo "**판정: 검증 실패 — 롤백 검토 대상.** FAIL 항목 전건 해소 또는 예외 승인 없이 다음 배치로 진행 금지."
  elif [ "$WARN" -gt 0 ]; then
    echo "**판정: 조건부 통과 —** WARN 항목의 사유를 기록하고 담당자 확인 서명."
  else
    echo "**판정: 통과.**"
  fi
} >> "$RPT"

cat "$RPT"
[ "$FAIL" -eq 0 ] || exit 1
```

---

## A-8. `patch_playbook.yml` — Ansible 배치 패치 (300대 확산용)

```yaml
---
# patch_playbook.yml
# 사용: ansible-playbook -i inventory/batch01.ini patch_playbook.yml --check   (선행)
#       ansible-playbook -i inventory/batch01.ini patch_playbook.yml
# 원칙: serial 로 소규모 병렬, any_errors_fatal 로 배치 즉시 중단
- name: "싸이월드 레거시 서버 보안 패치 (배치 단위)"
  hosts: patch_batch
  become: true
  serial: 5                    # 배치 내 5대씩
  any_errors_fatal: false      # 개별 실패는 격리, 임계치는 별도 판단
  max_fail_percentage: 20      # 20% 초과 실패 시 배치 중단
  gather_facts: true

  vars:
    patch_guard_dir: /var/lib/patch-guard
    backup_root: /var/backups
    script_dir: /usr/local/sbin
    min_boot_mb: 200
    min_root_mb: 5120
    require_backup_flag: true

  pre_tasks:
    - name: "OS 계열 확인 (CentOS 전용)"
      ansible.builtin.assert:
        that:
          - ansible_facts['os_family'] == 'RedHat'
        fail_msg: "RedHat 계열이 아님 — 대상 제외"

    - name: "패치 가드 디렉터리 생성"
      ansible.builtin.file:
        path: "{{ patch_guard_dir }}"
        state: directory
        mode: '0750'

    - name: "백업 완료 플래그 확인 (없으면 패치 금지)"
      ansible.builtin.stat:
        path: "{{ patch_guard_dir }}/backup.ok"
      register: backup_flag

    - name: "백업 미확인 시 중단"
      ansible.builtin.fail:
        msg: "백업 완료 플래그 없음 — 스냅샷/이미지 백업 후 재시도"
      when: require_backup_flag and not backup_flag.stat.exists

    - name: "/boot 여유 공간 확인"
      ansible.builtin.assert:
        that:
          - (ansible_facts['mounts'] | selectattr('mount','equalto','/boot') | list | length == 0)
            or ((ansible_facts['mounts'] | selectattr('mount','equalto','/boot') | first).size_available / 1048576) > min_boot_mb
        fail_msg: "/boot 여유 공간 부족 — 구커널 정리 필요"

    - name: "루트 여유 공간 확인"
      ansible.builtin.assert:
        that:
          - ((ansible_facts['mounts'] | selectattr('mount','equalto','/') | first).size_available / 1048576) > min_root_mb
        fail_msg: "/ 여유 공간 부족"

    - name: "스크립트 배포"
      ansible.builtin.copy:
        src: "scripts/{{ item }}"
        dest: "{{ script_dir }}/{{ item }}"
        mode: '0750'
      loop:
        - S-04_centos_vault_repo.sh
        - S-05_patch_precheck.sh
        - S-06_patch_apply.sh
        - S-07_postpatch_verify.sh

  tasks:
    - name: "1. 저장소를 사내 미러(EOL 아카이브)로 전환"
      ansible.builtin.command: "{{ script_dir }}/S-04_centos_vault_repo.sh"
      environment:
        MIRROR_BASE: "{{ internal_mirror_base }}"
      register: repo_switch
      changed_when: "'저장소 전환 성공' in repo_switch.stdout"

    - name: "2. 사전 점검"
      ansible.builtin.command: "{{ script_dir }}/S-05_patch_precheck.sh"
      register: precheck
      failed_when: precheck.rc != 0
      changed_when: false

    - name: "3. 설정 백업 (/etc)"
      ansible.builtin.archive:
        path: /etc
        dest: "{{ backup_root }}/etc-{{ ansible_date_time.iso8601_basic_short }}.tar.gz"
        format: gz
      changed_when: true

    - name: "4. 패치 전 패키지 목록 기록"
      ansible.builtin.shell: |
        rpm -qa --qf '%{NAME}-%{VERSION}-%{RELEASE}.%{ARCH}\n' | sort > {{ patch_guard_dir }}/rpm.before
      changed_when: false

    - name: "5. 서비스 정지 (패치 대상 서비스)"
      ansible.builtin.service:
        name: "{{ item }}"
        state: stopped
      loop: [nginx, php-fpm, mysqld]
      failed_when: false

    - name: "6. 보안 패치 적용 (커널 제외)"
      ansible.builtin.yum:
        name: '*'
        state: latest
        security: true
        exclude: 'kernel*'
      register: os_patch
      retries: 2
      delay: 30
      until: os_patch is succeeded

    - name: "7. Nginx 패치"
      ansible.builtin.yum:
        name: nginx
        state: latest
      when: "'nginx' in ansible_facts.packages | default({})"
      register: nginx_patch

    - name: "8. Nginx 설정 문법 검증"
      ansible.builtin.command: nginx -t
      register: nginx_t
      changed_when: false
      failed_when: nginx_t.rc != 0
      when: nginx_patch is defined and nginx_patch is changed

    - name: "9. MySQL 패치"
      ansible.builtin.yum:
        name: ['mysql-server', 'mysql']
        state: latest
      failed_when: false
      register: mysql_patch

    - name: "10. 커널 패치 (마지막)"
      ansible.builtin.yum:
        name: 'kernel*'
        state: latest
      register: kernel_patch

    - name: "11. initramfs 재생성 (드라이버 호환성)"
      ansible.builtin.command: dracut -f --regenerate-all
      when: kernel_patch is changed
      changed_when: true

    - name: "12. 리부트 (커널 변경 시)"
      ansible.builtin.reboot:
        reboot_timeout: 900
        connect_timeout: 30
        post_reboot_delay: 60
        test_command: "systemctl is-system-running --wait || true"
      when: kernel_patch is changed

    - name: "13. 서비스 기동"
      ansible.builtin.service:
        name: "{{ item }}"
        state: started
        enabled: true
      loop: [mysqld, php-fpm, nginx]
      failed_when: false

    - name: "14. 패치 후 검증"
      ansible.builtin.command: "{{ script_dir }}/S-07_postpatch_verify.sh"
      register: verify
      changed_when: false
      failed_when: verify.rc != 0

    - name: "15. 검증 리포트 수거"
      ansible.builtin.fetch:
        src: "{{ item }}"
        dest: "reports/{{ inventory_hostname }}/"
        flat: true
      with_fileglob: []
      failed_when: false

  post_tasks:
    - name: "검증 리포트 로컬 수집"
      ansible.builtin.shell: "ls -t /var/log/postpatch-verify-*.md | head -1"
      register: rptpath
      changed_when: false

    - name: "리포트 가져오기"
      ansible.builtin.fetch:
        src: "{{ rptpath.stdout }}"
        dest: "reports/{{ inventory_hostname }}.md"
        flat: true
      when: rptpath.stdout != ""

  handlers:
    - name: "롤백 안내"
      ansible.builtin.debug:
        msg: "실패 호스트는 yum history undo 및 스냅샷 복원 절차로 수동 롤백하라."
```

---

## A-9. `S-08_manifest_build.sh` — 대용량 매니페스트 생성 (정합성 판정 입력)

```bash
#!/usr/bin/env bash
# S-08_manifest_build.sh <스캔루트> <출력파일> [해시모드] [병렬도]
# 해시모드: none(L1) | fast(xxhash/blake3, L2) | sha256(L3)
# 출력: TSV — relpath \t size \t mtime_epoch \t hash \t hashalgo
set -euo pipefail

ROOT="${1:?사용법: $0 <스캔루트> <출력파일> [none|fast|sha256] [병렬도]}"
OUTF="${2:?출력 파일 필요}"
MODE="${3:-fast}"
JOBS="${4:-$(nproc)}"

[ -d "$ROOT" ] || { echo "오류: ${ROOT} 디렉터리 없음"; exit 1; }
# 원본 보호: 읽기전용 마운트 여부 경고
if ! findmnt -no OPTIONS --target "$ROOT" 2>/dev/null | grep -q '\bro\b'; then
  echo "경고: ${ROOT} 가 읽기전용 마운트가 아님. 원본 보호 원칙 확인 필요."
fi

# 해시 도구 선택
case "$MODE" in
  none)   HASHER=""; ALGO="none" ;;
  fast)
    if command -v b3sum >/dev/null 2>&1;      then HASHER="b3sum --no-names"; ALGO="blake3"
    elif command -v xxh128sum >/dev/null 2>&1; then HASHER="xxh128sum -H2"; ALGO="xxh128"
    elif command -v xxhsum >/dev/null 2>&1;    then HASHER="xxhsum -H1";    ALGO="xxh64"
    else echo "경고: 고속 해시 도구 없음 → sha256으로 대체"; HASHER="sha256sum"; ALGO="sha256"; fi ;;
  sha256) HASHER="sha256sum"; ALGO="sha256" ;;
  *) echo "알 수 없는 모드: ${MODE}"; exit 1 ;;
esac

echo "스캔 루트 : ${ROOT}"
echo "해시 모드 : ${MODE} (${ALGO})"
echo "병렬도    : ${JOBS}"
START=$(date +%s)

emit_one() {
  local f="$1" root="$2" hasher="$3" algo="$4"
  local rel size mtime h
  rel="${f#$root/}"
  # stat 실패(권한/손상) 시에도 레코드는 남긴다
  if ! read -r size mtime < <(stat -c '%s %Y' "$f" 2>/dev/null); then
    printf '%s\t%s\t%s\t%s\t%s\n' "$rel" "ERR" "ERR" "STAT_FAIL" "$algo"; return
  fi
  if [ -z "$hasher" ]; then
    printf '%s\t%s\t%s\t%s\t%s\n' "$rel" "$size" "$mtime" "-" "none"
  else
    h=$($hasher "$f" 2>/dev/null | awk '{print $1}')
    printf '%s\t%s\t%s\t%s\t%s\n' "$rel" "$size" "$mtime" "${h:-READ_FAIL}" "$algo"
  fi
}
export -f emit_one

TMP="${OUTF}.part"
: > "$TMP"

# 파일 목록 → 병렬 처리
if command -v parallel >/dev/null 2>&1; then
  find "$ROOT" -xdev -type f -print0 2>/dev/null \
    | parallel -0 -j "$JOBS" --will-cite emit_one {} "$ROOT" "$HASHER" "$ALGO" >> "$TMP"
else
  find "$ROOT" -xdev -type f -print0 2>/dev/null \
    | xargs -0 -P "$JOBS" -I{} bash -c 'emit_one "$@"' _ {} "$ROOT" "$HASHER" "$ALGO" >> "$TMP"
fi

# 정렬(대조 성능) 및 요약
LC_ALL=C sort -t$'\t' -k1,1 "$TMP" > "$OUTF"
rm -f "$TMP"

FILES=$(wc -l < "$OUTF")
BYTES=$(awk -F'\t' '$2 ~ /^[0-9]+$/ {s+=$2} END{printf "%.0f", s}' "$OUTF")
FAILS=$(awk -F'\t' '$4=="READ_FAIL" || $4=="STAT_FAIL"' "$OUTF" | wc -l)
ELAPSED=$(( $(date +%s) - START ))

cat > "${OUTF}.meta" <<META
manifest_file=${OUTF}
scan_root=${ROOT}
hash_mode=${MODE}
hash_algo=${ALGO}
file_count=${FILES}
total_bytes=${BYTES}
total_tib=$(awk "BEGIN{printf \"%.3f\", ${BYTES}/1099511627776}")
read_failures=${FAILS}
elapsed_sec=${ELAPSED}
generated_utc=$(date -u +%FT%TZ)
host=$(hostname)
operator=${INSPECTOR:-미기재}
dc_site=${DC_SITE:-미기재}
manifest_sha256=$(sha256sum "$OUTF" | awk '{print $1}')
META

echo "완료: 파일 ${FILES}건 / $(awk "BEGIN{printf \"%.2f\", ${BYTES}/1099511627776}") TiB / 읽기실패 ${FAILS}건 / ${ELAPSED}초"
[ "$FAILS" -gt 0 ] && echo "경고: 읽기 실패 ${FAILS}건 — 매체 손상 가능. 별도 목록화 필요."
cat "${OUTF}.meta"
```

---

## A-10. `S-09_reconcile_dc.py` — DC-A / DC-B 차분 판정 및 진본 선정

```python
#!/usr/bin/env python3
"""
S-09_reconcile_dc.py — 두 데이터센터 매니페스트를 대조하여 진본(Golden Copy)을 판정한다.

사용:
  ./S-09_reconcile_dc.py --a manifest_dcA.tsv --b manifest_dcB.tsv \
      --a-last-boot 2024-05-01T09:00:00Z --b-last-boot 2024-04-18T22:10:00Z \
      --a-clock-reliable true --b-clock-reliable false \
      --out-dir ./reconcile_out

규칙(사전 확정, Phase 3-C):
  R-1 해시 동일            → 동일. 1부만 이관
  R-2 편측 존재            → 존재하는 쪽 채택 + 누락 사유 조사
  R-3 상이 + 시각 신뢰 가능 → 최종 가동 시각이 늦은 DC 채택
  R-4 상이 + 시각 신뢰 불가 → 내부 메타데이터 검사 필요 (수동/후속)
  R-5 한쪽 손상/절단        → 정상 파싱되는 쪽 채택 (후속 검증 필요)
  R-6 판정 불가            → 양측 보존, 격리 목록 등재
"""
import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone


def parse_iso(s):
    if not s:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def load_manifest(path):
    """TSV: relpath, size, mtime_epoch, hash, algo"""
    rows = {}
    bad = 0
    with open(path, "r", encoding="utf-8", errors="surrogateescape") as fh:
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 5:
                bad += 1
                continue
            rel, size, mtime, h, algo = parts[0], parts[1], parts[2], parts[3], parts[4]
            rows[rel] = {
                "size": size,
                "mtime": mtime,
                "hash": h,
                "algo": algo,
                "readable": h not in ("READ_FAIL", "STAT_FAIL"),
            }
    return rows, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--a", required=True, help="DC-A 매니페스트 TSV")
    ap.add_argument("--b", required=True, help="DC-B 매니페스트 TSV")
    ap.add_argument("--a-label", default="DC-A")
    ap.add_argument("--b-label", default="DC-B")
    ap.add_argument("--a-last-boot", default=None, help="DC-A 최종 가동 시각 ISO8601")
    ap.add_argument("--b-last-boot", default=None, help="DC-B 최종 가동 시각 ISO8601")
    ap.add_argument("--a-clock-reliable", default="true")
    ap.add_argument("--b-clock-reliable", default="true")
    ap.add_argument("--out-dir", default="./reconcile_out")
    args = ap.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    a_rows, a_bad = load_manifest(args.a)
    b_rows, b_bad = load_manifest(args.b)

    a_clock = args.a_clock_reliable.lower() == "true"
    b_clock = args.b_clock_reliable.lower() == "true"
    a_boot = parse_iso(args.a_last_boot)
    b_boot = parse_iso(args.b_last_boot)

    # 시각 신뢰 가능 여부 및 어느 쪽이 최신인지
    newer = None
    if a_clock and b_clock and a_boot and b_boot:
        newer = args.a_label if a_boot > b_boot else args.b_label
    elif a_clock and not b_clock:
        newer = args.a_label
    elif b_clock and not a_clock:
        newer = args.b_label

    all_keys = set(a_rows) | set(b_rows)
    stats = {k: 0 for k in ("R-1", "R-2a", "R-2b", "R-3", "R-4", "R-5", "R-6")}
    bytes_selected = 0

    dec_path = os.path.join(args.out_dir, "golden_copy_decision.csv")
    div_path = os.path.join(args.out_dir, "divergence_report.csv")
    q_path = os.path.join(args.out_dir, "quarantine_R6.csv")
    audit_path = os.path.join(args.out_dir, "integrity_audit_log.jsonl")

    with open(dec_path, "w", newline="", encoding="utf-8") as fd, \
         open(div_path, "w", newline="", encoding="utf-8") as fv, \
         open(q_path, "w", newline="", encoding="utf-8") as fq, \
         open(audit_path, "w", encoding="utf-8") as fa:

        wd = csv.writer(fd); wd.writerow(["relpath", "rule", "selected_source", "size", "hash", "note"])
        wv = csv.writer(fv); wv.writerow(["relpath", "rule", "a_size", "b_size", "a_hash", "b_hash", "a_mtime", "b_mtime"])
        wq = csv.writer(fq); wq.writerow(["relpath", "reason", "a_size", "b_size", "a_hash", "b_hash"])

        for rel in sorted(all_keys):
            a = a_rows.get(rel)
            b = b_rows.get(rel)

            # R-2: 편측 존재
            if a and not b:
                rule, sel, note = "R-2a", args.a_label, "DC-B 미존재 — 삭제/미복제 사유 조사 필요"
                stats["R-2a"] += 1
            elif b and not a:
                rule, sel, note = "R-2b", args.b_label, "DC-A 미존재 — 삭제/미복제 사유 조사 필요"
                stats["R-2b"] += 1

            # R-5: 한쪽 읽기 불가
            elif a and b and (not a["readable"] or not b["readable"]):
                if a["readable"] and not b["readable"]:
                    rule, sel, note = "R-5", args.a_label, "DC-B 읽기 실패 — 매체 손상 의심"
                elif b["readable"] and not a["readable"]:
                    rule, sel, note = "R-5", args.b_label, "DC-A 읽기 실패 — 매체 손상 의심"
                else:
                    rule, sel, note = "R-6", "NONE", "양측 모두 읽기 실패 — 복구 대상"
                    stats["R-6"] += 1
                    wq.writerow([rel, note, a["size"], b["size"], a["hash"], b["hash"]])
                if rule == "R-5":
                    stats["R-5"] += 1

            # R-1: 해시 동일
            elif a["hash"] == b["hash"] and a["hash"] not in ("-", ""):
                rule, sel, note = "R-1", args.a_label, "양측 동일 — 1부만 이관"
                stats["R-1"] += 1

            # 해시 미산출(L1 매니페스트)일 때는 size+mtime로 대체 판정
            elif a["hash"] == "-" and b["hash"] == "-" and a["size"] == b["size"] and a["mtime"] == b["mtime"]:
                rule, sel, note = "R-1", args.a_label, "L1 기준 동일(크기·mtime) — L2 해시 재검증 권고"
                stats["R-1"] += 1

            else:
                # 상이 → R-3 / R-4 / R-6
                wv.writerow([rel, "DIVERGENT", a["size"], b["size"], a["hash"], b["hash"], a["mtime"], b["mtime"]])

                a_mt = int(a["mtime"]) if a["mtime"].isdigit() else None
                b_mt = int(b["mtime"]) if b["mtime"].isdigit() else None

                if a_clock and b_clock and a_mt is not None and b_mt is not None and a_mt != b_mt:
                    sel = args.a_label if a_mt > b_mt else args.b_label
                    rule, note = "R-3", f"mtime 기준 최신 채택 (a={a_mt}, b={b_mt})"
                    stats["R-3"] += 1
                elif newer:
                    sel = newer
                    rule, note = "R-3", f"파일 mtime 판정 불가 → DC 최종가동시각 기준 {newer} 채택"
                    stats["R-3"] += 1
                else:
                    rule, sel = "R-4", "MANUAL"
                    note = "시각 신뢰 불가 — 파일 내부 메타데이터 검사 필요"
                    stats["R-4"] += 1
                    wq.writerow([rel, note, a["size"], b["size"], a["hash"], b["hash"]])

            src = a if sel == args.a_label else (b if sel == args.b_label else None)
            if src:
                wd.writerow([rel, rule, sel, src["size"], src["hash"], note])
                if src["size"].isdigit():
                    bytes_selected += int(src["size"])
            else:
                wd.writerow([rel, rule, sel, "", "", note])

            fa.write(json.dumps({
                "relpath": rel, "rule": rule, "selected": sel, "note": note,
                "decided_utc": datetime.now(timezone.utc).isoformat(),
                "decider": os.environ.get("INSPECTOR", "미기재"),
            }, ensure_ascii=False) + "\n")

    total = len(all_keys)
    summary = {
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "a_label": args.a_label, "b_label": args.b_label,
        "a_files": len(a_rows), "b_files": len(b_rows),
        "a_malformed_lines": a_bad, "b_malformed_lines": b_bad,
        "union_files": total,
        "a_clock_reliable": a_clock, "b_clock_reliable": b_clock,
        "newer_dc": newer,
        "rules": stats,
        "selected_bytes": bytes_selected,
        "selected_tib": round(bytes_selected / (1024 ** 4), 3),
        "manual_review_required": stats["R-4"] + stats["R-6"],
    }
    with open(os.path.join(args.out_dir, "summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"\n결정 대장 : {dec_path}")
    print(f"차분 리포트: {div_path}")
    print(f"격리 목록  : {q_path}")
    print(f"감사 로그  : {audit_path}")
    if summary["manual_review_required"] > 0:
        print(f"\n[주의] 수동 판정 필요 {summary['manual_review_required']}건 — 자동 판정으로 종결하지 말 것.")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

---

## A-11. `S-10_s3_upload_verify.sh` — S3 이관 및 이관 후 무결성 대조

```bash
#!/usr/bin/env bash
# S-10_s3_upload_verify.sh <소스경로> <s3://버킷/프리픽스> <사전매니페스트>
# 목적: SSE-KMS 암호화 업로드 + 이관 후 매니페스트 대조로 무결성 증명
set -euo pipefail

SRC="${1:?사용법: $0 <소스경로> <s3://버킷/프리픽스> <사전매니페스트>}"
DST="${2:?S3 대상 필요}"
PRE_MANIFEST="${3:?사전 매니페스트 필요}"

KMS_KEY_ID="${KMS_KEY_ID:?KMS_KEY_ID 환경변수 필요 (CMK)}"
STORAGE_CLASS="${STORAGE_CLASS:-STANDARD}"
CONCURRENCY="${CONCURRENCY:-32}"
TS=$(date +%Y%m%dT%H%M%S)
WORK="./s3verify-${TS}"
mkdir -p "$WORK"

echo "=== S3 이관 시작 ==="
echo "소스        : ${SRC}"
echo "대상        : ${DST}"
echo "KMS 키      : ${KMS_KEY_ID}"
echo "스토리지 클래스: ${STORAGE_CLASS}"

# 0) 사전 조건 검증
command -v aws >/dev/null 2>&1 || { echo "aws CLI 필요"; exit 1; }
aws sts get-caller-identity > "${WORK}/identity.json" || { echo "AWS 자격증명 실패"; exit 1; }

BUCKET=$(echo "$DST" | sed -E 's#^s3://([^/]+).*#\1#')
PREFIX=$(echo "$DST" | sed -E 's#^s3://[^/]+/?##')

# 버킷 보안 설정 검증 (금융권 필수)
echo "--- 버킷 보안 설정 검증 ---"
aws s3api get-public-access-block --bucket "$BUCKET" > "${WORK}/pab.json" 2>/dev/null \
  && grep -q '"BlockPublicAcls": true' "${WORK}/pab.json" \
  && echo "  [OK] Block Public Access 적용" \
  || { echo "  [FAIL] Block Public Access 미적용 → 중단"; exit 2; }

aws s3api get-bucket-encryption --bucket "$BUCKET" > "${WORK}/enc.json" 2>/dev/null \
  && grep -q 'aws:kms' "${WORK}/enc.json" \
  && echo "  [OK] 기본 암호화(KMS) 적용" \
  || { echo "  [FAIL] KMS 기본 암호화 미적용 → 중단"; exit 2; }

aws s3api get-bucket-versioning --bucket "$BUCKET" > "${WORK}/ver.json" 2>/dev/null
grep -q '"Status": "Enabled"' "${WORK}/ver.json" \
  && echo "  [OK] 버전관리 활성" || echo "  [WARN] 버전관리 비활성 — 권고 위반"

aws s3api get-object-lock-configuration --bucket "$BUCKET" > "${WORK}/lock.json" 2>/dev/null \
  && echo "  [OK] Object Lock 설정 확인" || echo "  [WARN] Object Lock 미설정"

# 1) 전송 성능 설정
aws configure set default.s3.max_concurrent_requests "$CONCURRENCY"
aws configure set default.s3.multipart_chunksize 64MB
aws configure set default.s3.multipart_threshold 128MB

# 2) 업로드
echo "--- 업로드 실행 ---"
aws s3 sync "$SRC" "$DST" \
  --sse aws:kms \
  --sse-kms-key-id "$KMS_KEY_ID" \
  --storage-class "$STORAGE_CLASS" \
  --only-show-errors \
  2>&1 | tee "${WORK}/sync.log"

# 3) 이관 후 목록 수집 (S3 인벤토리 대신 즉시 list)
echo "--- 이관 후 목록 수집 ---"
aws s3api list-objects-v2 --bucket "$BUCKET" --prefix "$PREFIX" \
  --query 'Contents[].[Key,Size,ETag]' --output text > "${WORK}/s3_objects.tsv"

# 4) 대조
echo "--- 무결성 대조 ---"
awk -F'\t' '{print $1"\t"$2}' "$PRE_MANIFEST" | LC_ALL=C sort > "${WORK}/local.tsv"
awk -v p="$PREFIX" -F'\t' '{k=$1; sub("^"p"/?","",k); print k"\t"$2}' "${WORK}/s3_objects.tsv" \
  | LC_ALL=C sort > "${WORK}/remote.tsv"

comm -23 "${WORK}/local.tsv" "${WORK}/remote.tsv" > "${WORK}/missing_or_mismatch.tsv" || true
comm -13 "${WORK}/local.tsv" "${WORK}/remote.tsv" > "${WORK}/extra_in_s3.tsv" || true

LOCAL_N=$(wc -l < "${WORK}/local.tsv")
REMOTE_N=$(wc -l < "${WORK}/remote.tsv")
MISS_N=$(wc -l < "${WORK}/missing_or_mismatch.tsv")
EXTRA_N=$(wc -l < "${WORK}/extra_in_s3.tsv")

# 5) 표본 심층 검증 (SHA-256 대조)
echo "--- 표본 SHA-256 검증 (100건) ---"
: > "${WORK}/sample_hash_check.txt"
awk -F'\t' '{print $1}' "${WORK}/remote.tsv" | shuf -n 100 2>/dev/null | while read -r key; do
  [ -f "${SRC}/${key}" ] || continue
  lh=$(sha256sum "${SRC}/${key}" | awk '{print $1}')
  aws s3api head-object --bucket "$BUCKET" --key "${PREFIX}/${key}" \
    --checksum-mode ENABLED > "${WORK}/_ho.json" 2>/dev/null || continue
  # 다운로드 대조 (체크섬 미설정 객체 대비)
  aws s3 cp "s3://${BUCKET}/${PREFIX}/${key}" "${WORK}/_tmpobj" --quiet 2>/dev/null || continue
  rh=$(sha256sum "${WORK}/_tmpobj" | awk '{print $1}')
  if [ "$lh" = "$rh" ]; then
    echo "PASS ${key}" >> "${WORK}/sample_hash_check.txt"
  else
    echo "FAIL ${key} local=${lh} remote=${rh}" >> "${WORK}/sample_hash_check.txt"
  fi
  rm -f "${WORK}/_tmpobj"
done
SAMP_FAIL=$(grep -c '^FAIL' "${WORK}/sample_hash_check.txt" || true)

# 6) 리포트
cat > "${WORK}/REPORT.md" <<RPT
# S3 이관 무결성 리포트

- 생성(UTC): $(date -u +%FT%TZ)
- 소스: \`${SRC}\`
- 대상: \`${DST}\`
- 담당: ${INSPECTOR:-미기재}

| 항목 | 값 |
|---|---|
| 로컬 객체 수 | ${LOCAL_N} |
| S3 객체 수 | ${REMOTE_N} |
| 누락/크기 불일치 | ${MISS_N} |
| S3 초과 객체 | ${EXTRA_N} |
| 표본 해시 검증 실패 | ${SAMP_FAIL} |

## 판정
$( if [ "$MISS_N" -eq 0 ] && [ "${SAMP_FAIL:-0}" -eq 0 ]; then
     echo "**통과** — 누락 0건, 표본 해시 전건 일치."
   else
     echo "**미통과** — 누락 ${MISS_N}건 / 표본 실패 ${SAMP_FAIL}건. 재전송 후 재검증 필수."
   fi )

## 첨부
- \`missing_or_mismatch.tsv\`
- \`extra_in_s3.tsv\`
- \`sample_hash_check.txt\`
- \`sync.log\`
RPT

cat "${WORK}/REPORT.md"
echo ""
echo "작업 디렉터리: ${WORK}"
[ "$MISS_N" -eq 0 ] && [ "${SAMP_FAIL:-0}" -eq 0 ] || exit 1
```

---

## A-12. `S-11_mysql_precheck.sh` — MySQL 5.7 → 8.0 이관 사전 점검

```bash
#!/usr/bin/env bash
# S-11_mysql_precheck.sh
# 목적: 8.0 업그레이드 실패 요인을 사전에 전수 조사
# 실행: 격리망의 복제본 5.7 인스턴스에 대해 실행 (원본 미접촉)
set -uo pipefail

MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
OUT="./mysql-precheck-$(date +%Y%m%dT%H%M%S)"
mkdir -p "$OUT"
Q() { mysql -u"$MYSQL_USER" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -N -B -e "$1" 2>>"${OUT}/_errors.log"; }

echo "=== MySQL 이관 사전 점검 ===" | tee "${OUT}/summary.txt"

# 1. 버전 및 기본 정보
Q "SELECT VERSION();" > "${OUT}/01_version.txt"
Q "SHOW VARIABLES WHERE Variable_name IN
   ('version','datadir','character_set_server','collation_server',
    'innodb_file_per_table','lower_case_table_names','sql_mode',
    'default_authentication_plugin','log_bin','server_id','secure_file_priv');" \
   > "${OUT}/02_key_variables.txt"
echo "버전: $(cat "${OUT}/01_version.txt")" | tee -a "${OUT}/summary.txt"

# 2. 스토리지 엔진 분포 (MyISAM은 8.0 이관 시 InnoDB 전환 권고)
Q "SELECT engine, COUNT(*) AS tables, ROUND(SUM(data_length+index_length)/1024/1024,1) AS mb
   FROM information_schema.tables
   WHERE table_schema NOT IN ('mysql','information_schema','performance_schema','sys')
   GROUP BY engine ORDER BY 3 DESC;" > "${OUT}/03_engines.txt"
MYISAM=$(awk '$1=="MyISAM"{print $2}' "${OUT}/03_engines.txt")
[ -n "${MYISAM:-}" ] && echo "[주의] MyISAM 테이블 ${MYISAM}개 → InnoDB 전환 검토" | tee -a "${OUT}/summary.txt"

# 3. 8.0 예약어 충돌 (테이블/컬럼명)
cat > "${OUT}/_reserved.txt" <<'RW'
CUBE
CUME_DIST
DENSE_RANK
EMPTY
EXCEPT
FIRST_VALUE
FUNCTION
GROUPING
GROUPS
JSON_TABLE
LAG
LAST_VALUE
LATERAL
LEAD
NTH_VALUE
NTILE
OF
OVER
PERCENT_RANK
RANK
RECURSIVE
ROW_NUMBER
SYSTEM
WINDOW
RW
RESERVED=$(paste -sd, "${OUT}/_reserved.txt" | sed "s/[^,]*/'&'/g")
Q "SELECT 'TABLE' AS kind, table_schema, table_name, '' AS col
   FROM information_schema.tables
   WHERE UPPER(table_name) IN (${RESERVED})
     AND table_schema NOT IN ('mysql','information_schema','performance_schema','sys')
   UNION ALL
   SELECT 'COLUMN', table_schema, table_name, column_name
   FROM information_schema.columns
   WHERE UPPER(column_name) IN (${RESERVED})
     AND table_schema NOT IN ('mysql','information_schema','performance_schema','sys');" \
   > "${OUT}/04_reserved_word_conflicts.txt"
RWC=$(wc -l < "${OUT}/04_reserved_word_conflicts.txt")
echo "예약어 충돌: ${RWC}건" | tee -a "${OUT}/summary.txt"

# 4. 문자셋/콜레이션 (8.0 기본값 변경으로 정렬 순서 달라질 수 있음)
Q "SELECT table_schema, table_collation, COUNT(*)
   FROM information_schema.tables
   WHERE table_schema NOT IN ('mysql','information_schema','performance_schema','sys')
   GROUP BY 1,2;" > "${OUT}/05_collations.txt"
Q "SELECT table_schema, table_name, column_name, character_set_name, collation_name
   FROM information_schema.columns
   WHERE collation_name IS NOT NULL
     AND collation_name NOT LIKE 'utf8mb4%'
     AND table_schema NOT IN ('mysql','information_schema','performance_schema','sys');" \
   > "${OUT}/06_non_utf8mb4_columns.txt"
NONU=$(wc -l < "${OUT}/06_non_utf8mb4_columns.txt")
echo "비 utf8mb4 컬럼: ${NONU}건 (한글 데이터 인코딩 확인 필수)" | tee -a "${OUT}/summary.txt"

# 5. 계정/권한 (침해 조사 겸용)
Q "SELECT user, host, plugin, authentication_string='' AS empty_pw,
          Super_priv, File_priv, Process_priv, Grant_priv
   FROM mysql.user ORDER BY user;" > "${OUT}/07_users.txt"
Q "SELECT user, host FROM mysql.user WHERE authentication_string='' OR authentication_string IS NULL;" \
  > "${OUT}/08_empty_password_users.txt"
[ -s "${OUT}/08_empty_password_users.txt" ] && echo "[위험] 빈 패스워드 DB 계정 존재" | tee -a "${OUT}/summary.txt"
Q "SELECT user, host FROM mysql.user WHERE Super_priv='Y' OR File_priv='Y';" \
  > "${OUT}/09_privileged_users.txt"
Q "SELECT user, host FROM mysql.user WHERE host='%';" > "${OUT}/10_wildcard_host_users.txt"
[ -s "${OUT}/10_wildcard_host_users.txt" ] && echo "[위험] host='%' 계정 존재" | tee -a "${OUT}/summary.txt"

# 6. UDF / 플러그인 백도어 점검
Q "SELECT * FROM mysql.func;" > "${OUT}/11_udf_functions.txt" 2>/dev/null
[ -s "${OUT}/11_udf_functions.txt" ] && echo "[위험] 사용자 정의 함수(UDF) 등록됨 → 백도어 가능성" | tee -a "${OUT}/summary.txt"
Q "SELECT plugin_name, plugin_library FROM information_schema.plugins WHERE plugin_library IS NOT NULL;" \
  > "${OUT}/12_plugins.txt"

# 7. 8.0 제거/변경 옵션 사용 여부
Q "SHOW VARIABLES WHERE Variable_name IN
   ('query_cache_type','query_cache_size','innodb_file_format',
    'innodb_large_prefix','show_compatibility_56','metadata_locks_cache_size');" \
   > "${OUT}/13_removed_options.txt"

# 8. 파티션 + 비InnoDB 조합 (8.0에서 미지원)
Q "SELECT DISTINCT t.table_schema, t.table_name, t.engine
   FROM information_schema.tables t
   JOIN information_schema.partitions p
     ON t.table_schema=p.table_schema AND t.table_name=p.table_name
   WHERE p.partition_name IS NOT NULL AND t.engine <> 'InnoDB';" \
   > "${OUT}/14_nonnative_partitions.txt"
[ -s "${OUT}/14_nonnative_partitions.txt" ] && echo "[차단] 비InnoDB 파티션 테이블 존재 → 8.0 업그레이드 차단 요인" | tee -a "${OUT}/summary.txt"

# 9. 객체 수 (이관 후 대조 기준)
Q "SELECT 'tables', COUNT(*) FROM information_schema.tables
   WHERE table_schema NOT IN ('mysql','information_schema','performance_schema','sys')
   UNION ALL SELECT 'routines', COUNT(*) FROM information_schema.routines
   UNION ALL SELECT 'triggers', COUNT(*) FROM information_schema.triggers
   UNION ALL SELECT 'views', COUNT(*) FROM information_schema.views
   UNION ALL SELECT 'events', COUNT(*) FROM information_schema.events;" \
   > "${OUT}/15_object_counts.txt"

# 10. 테이블별 행수 (이관 후 대조 기준 — 정확값)
Q "SELECT table_schema, table_name FROM information_schema.tables
   WHERE table_type='BASE TABLE'
     AND table_schema NOT IN ('mysql','information_schema','performance_schema','sys');" \
  | while read -r db tb; do
      [ -z "${tb:-}" ] && continue
      n=$(Q "SELECT COUNT(*) FROM \`${db}\`.\`${tb}\`;")
      printf '%s\t%s\t%s\n' "$db" "$tb" "${n:-ERR}"
    done > "${OUT}/16_exact_rowcounts.tsv"
echo "행수 스냅샷: $(wc -l < "${OUT}/16_exact_rowcounts.tsv") 테이블" | tee -a "${OUT}/summary.txt"

# 11. 손상 점검
mysqlcheck -u"$MYSQL_USER" -h"$MYSQL_HOST" -P"$MYSQL_PORT" --all-databases --check \
  > "${OUT}/17_mysqlcheck.txt" 2>&1 || true
CORRUPT=$(grep -ci 'error' "${OUT}/17_mysqlcheck.txt" || true)
echo "mysqlcheck 오류: ${CORRUPT}건" | tee -a "${OUT}/summary.txt"

# 12. 공식 업그레이드 체커 (mysqlsh 존재 시)
if command -v mysqlsh >/dev/null 2>&1; then
  mysqlsh --uri "${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}" -- \
    util check-for-server-upgrade --outputFormat=JSON \
    > "${OUT}/18_upgrade_checker.json" 2>&1 || true
  echo "업그레이드 체커 결과: ${OUT}/18_upgrade_checker.json" | tee -a "${OUT}/summary.txt"
else
  echo "[권고] mysql-shell 설치 후 util.checkForServerUpgrade() 실행 필수" | tee -a "${OUT}/summary.txt"
fi

# 13. 논리 백업 (이관 원본)
DUMP="${OUT}/full_dump.sql.gz"
mysqldump -u"$MYSQL_USER" -h"$MYSQL_HOST" -P"$MYSQL_PORT" \
  --all-databases --single-transaction --routines --triggers --events \
  --hex-blob --default-character-set=utf8mb4 --set-gtid-purged=OFF 2>>"${OUT}/_errors.log" \
  | gzip > "$DUMP"
if [ -s "$DUMP" ]; then
  sha256sum "$DUMP" > "${DUMP}.sha256"
  echo "논리 백업 완료: ${DUMP} ($(du -h "$DUMP" | cut -f1))" | tee -a "${OUT}/summary.txt"
  touch /var/lib/patch-guard/mysql_dump.ok 2>/dev/null || true
else
  echo "[실패] 논리 백업 생성 실패 — _errors.log 확인" | tee -a "${OUT}/summary.txt"
fi

echo ""
echo "=== 점검 완료: ${OUT} ===" | tee -a "${OUT}/summary.txt"
cat "${OUT}/summary.txt"
```

---

# 부록 B. 리스크 등록부 (Risk Register)

| ID | 리스크 | 발생 확률 | 영향 | 대응 | 소유자 |
|---|---|---|---|---|---|
| R-01 | 동면 백도어가 첫 부팅 시 활성화되어 C2 통신 | 중 | **치명** | 조사망 아웃바운드 전면 차단, PCAP 상시 캡처 (Phase 1) | 보안팀 |
| R-02 | RAID 슬롯 순서 오인으로 어레이 재구성 → 데이터 영구 파괴 | 중 | **치명** | 슬롯 맵 선작성, Foreign Import 금지, 이미징 후 부팅 (Phase 0/1) | 인프라팀 |
| R-03 | 무전원 24개월 SSD 셀 전하 손실로 UECC 발생 | **중~고** | 높음 | 최우선 이미징, `ddrescue` 사용, 읽기 전용 (Phase 1) | 인프라팀 |
| R-04 | HDD 스핀업 실패(고착) | 중 | 높음 | 1회 실패 시 재시도 금지, 전문 복구 업체 이관 | 인프라팀 |
| R-05 | 개별 서버 부팅 실패 (예상 6~15대 / 300대) | 고 | 중 | 스냅샷 필수, BMC 콘솔 확보, 이전 커널 엔트리 보존 (Phase 4) | SE팀 |
| R-06 | CentOS EOL로 최신 패치 확보 불가 | **확정** | 높음 | Phase 2-D의 완화 통제 + 추출 후 서버 폐기 전략 | CISO |
| R-07 | MySQL 5.7 → 8.0 데이터 딕셔너리/예약어/콜레이션 실패 | 고 | 중 | `S-11` 사전 점검, 논리 백업 기반 이관 | DBA |
| R-08 | 한글 데이터 인코딩 손상 (euckr/utf8 혼재) | **중~고** | 높음 | 컬럼별 문자셋 조사, 변환 전 표본 육안 검증 | DBA |
| R-09 | DC-A/DC-B 사본 신선도 판정 불가(R-6) 대량 발생 | 중 | 중 | 양측 병렬 보존, 격리 목록 관리 (Phase 3) | 데이터팀 |
| R-10 | CMOS 초기화로 타임스탬프 신뢰 불가 → 진본 판정 근거 상실 | 고 | 중 | 파일 내부 메타데이터 기반 R-4 경로, 판정 불가 명시 | 데이터팀 |
| R-11 | Direct Connect 프로비저닝 지연이 임계 경로화 | 고 | 높음 | Phase 0과 동시 발주, Snowball 병행 전략 | PM |
| R-12 | 3.8 PB 전송 중 무결성 손상 미탐지 | 중 | **치명** | 이관 전/후 매니페스트 대조 의무화, 표본 SHA-256 (Phase 5) | 데이터팀 |
| R-13 | 개인정보 국외 이전 법적 요건 미충족 | 중 | **치명** | 리전 확정 및 법무·개인정보보호책임자 사전 검토 | 법무/CPO |
| R-14 | 침해 확인 시 신고·통지 의무 지연 | 중 | **치명** | Phase 2 착수 시점부터 CPO·법무 상시 참여 | CPO |
| R-15 | SE 10명으로 300대 처리 시 이미징 병목 | **고** | 중 | OS 볼륨 전수 / 데이터 볼륨 매니페스트 이원화, 라인 편성 (Phase 1-C) | PM |
| R-16 | 구 자격증명(SSH키/DB계정/API키) 재사용으로 재침해 | 중 | **치명** | 인증 자산 전량 폐기·재발급을 패치 선결 조건화 (Phase 4-A) | 보안팀 |
| R-17 | 원본 매체 폐기 누락으로 데이터 잔존 | 중 | 높음 | Crypto Erase + 물리 파기 + 증명서 대조 (Phase 7-B) | 인프라팀 |

---

# 부록 C. 종합 일정 (병렬화 반영)

```
주차   1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
─────────────────────────────────────────────────────────
P0 실사  ████
P1 격리     ██████
P2 조사        ████████
P3 정합성          ████████████
P4 패치               ██████████
P5 S3                    ████████████████████
P6 DB                          ██████
P7 검증                                 ██████
DX 발주  ████████████████ (Direct Connect 리드타임 — 최우선 착수)
```

| 시나리오 | 총 소요 | 전제 |
|---|---|---|
| **최소** | 약 8~10주 | 100Gbps 회선 또는 Snowball 다중 병행, Phase 병렬 최대화, 침해 판정 C 소수 |
| **보통** | 약 3.5~5개월 | 10Gbps 순차, 침해 판정 C 다수 발생, R-4/R-6 수동 판정 상당량 |
| **최대** | 약 7~13개월 | 1Gbps, Direct Connect 프로비저닝 지연, 다수 자산 하드웨어 복구 필요 |

> 원 시나리오 문서 대비 **+2~4주**가 추가되었다. 이는 Phase 0~3(물리 실사·격리·침해 조사·정합성 판정)이 새로 편입되었기 때문이다. 이 기간은 절약할 수 없다. 절약하면 목마를 성 안으로 들이는 결정을 하게 된다.

---

# 부록 D. 마스터 체크리스트 (요약 1페이지)

```
■ 착수 전
[ ] 이 문서의 원칙 1~3(Assume Breach / Read-Only First / No Direct Path) 전원 숙지 및 서명
[ ] Direct Connect 발주 (임계 경로 — 1주차 착수)
[ ] 법무·개인정보보호책임자(CPO) 프로젝트 상시 참여 확정
[ ] Chain of Custody 양식 및 반입/반출 절차 확정

■ Phase 0 물리 실사        → 체크리스트 0.1 ~ 0.14
■ Phase 1 격리·이미징      → 체크리스트 1.1 ~ 1.13
■ Phase 2 침해 조사        → 체크리스트 2.1 ~ 2.14   (CISO 서명 필수)
■ Phase 3 정합성 판정      → 체크리스트 3.1 ~ 3.14
■ Phase 4 보안 패치        → 체크리스트 4.1 ~ 4.18   (롤백 리허설 필수)
■ Phase 5 S3 이관          → 체크리스트 5.1 ~ 5.15
■ Phase 6 DB 이관          → 체크리스트 6.1 ~ 6.15
■ Phase 7 검증·인수·폐기   → 체크리스트 7.1 ~ 7.12

■ 절대 금지 (Never)
[×] 검증 전 원본 매체 쓰기
[×] 슬롯 순서 불명 상태의 RAID Foreign Config Import / Initialize / Rebuild
[×] 조사망 아웃바운드 개방
[×] 방치 서버 → 운영망/AWS 직결
[×] 구 자격증명(SSH키/DB계정/API키) 유지
[×] gpgcheck=0 설정
[×] 백업 없는 패치
[×] 롤백 리허설 없는 롤백 계획
[×] 매니페스트 대조 없는 "이관 완료" 선언
```

---

# 부록 E. 신뢰도 및 검증 필요 항목

본 문서의 수치·규격 관련 서술 중 **실행 전 반드시 실환경에서 재확인**해야 하는 항목:

| 항목 | 본문 서술 | 확인 방법 |
|---|---|---|
| SSD 무전원 보존 기간 | 소비자 ~1년(30℃), 엔터프라이즈 ~3개월(40℃) 수준 | JEDEC JESD218 계열 규격 원문 및 제조사 제품 데이터시트 확인 |
| CentOS EOL 시점 | CentOS 8: 2021-12 / CentOS 7: 2024-06 | 실 설치 버전(`/etc/centos-release`) 확인 후 확정 |
| vault 아카이브 버전 문자열 | 7.9.2009 / 8.5.2111 | 실제 아카이브 디렉터리 구조 확인 (사내 미러 구성 시점) |
| MySQL 5.7 EOL | 2023-10 | Oracle 라이프사이클 정책 확인 |
| 부팅 실패율 2~5% | 원 시나리오 문서 인용 | **파일럿 5~10대 결과로 실측 대체** |
| 전송 효율 60~80% | 일반적 경험치 | 파일럿 이관(1~10TB) 실측으로 대체 |
| Direct Connect 리드타임 | 수주~수개월 | AWS 및 회선사업자 견적 시 확정 |

> **파일럿의 목적은 이 표를 실측값으로 바꾸는 것이다.** 추정치로 300대를 진행하지 않는다.

---

**문서 끝.**

작성: Betalabs Inc. / 검토 요청 대상: 보안팀 · 인프라팀 · DBA · 법무 · CPO · CISO
분류: 대외 공개  — 배포 시 접근통제 및 워터마킹 적용
