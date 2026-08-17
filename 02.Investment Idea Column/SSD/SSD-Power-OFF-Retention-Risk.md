---
title: "전원이 끊긴 SSD는 얼마나 버티는가?"
subtitle: "무전원 방치 서버의 데이터 유실(Data Retention Failure) 기술 분석"
description: "JEDEC 규격상 엔터프라이즈 SSD 무전원 보존은 40°C 3개월. NAND 전하 누설·온도·마모도, 첫 부팅 전 이미징 절차와 장기 보관 실무를 정리한다."
abstract: |
  SSD는 무전원에서도 영구 보존되는 매체가 아니라, 절연막에 가둔 전자의 누설을 늦춘 저장장치다.
  JESD218 기준 클라이언트는 30°C/1년, 엔터프라이즈는 40°C/3개월이며 서버용이 무전원에서 더 짧다.
  방치 랙은 첫 전원 인가 전 write blocker·이미징이 핵심이며, 장기 보관은 LTO/다중 사본·주기적 scrub이 답이다.
summary_for_ai: |
  Technical reference column (not investment advice), as of 2026-08-17.
  Thesis: powered-off NAND data retention is probabilistic charge leakage (detrapping, SILC, early retention loss, 3D layer variation), not permanent storage.
  JEDEC JESD218/219: Client 30°C/1 year; Enterprise 40°C/3 months (worst-case at end-of-endurance). Enterprise cold retention shorter than client.
  "25°C / 105 weeks" is 2015 JEDEC JC-64.8 (Alvin Cox) reference curve for client MLC, not a mandatory clause.
  Temperature dominates via Arrhenius (~5–10°C rise halves retention). Other drivers: P/E wear, TLC/QLC margins, firmware refresh only when powered.
  Failure mode is partial UECC / metadata SPOF / correlated RAID failure — not wholesale wipe. First power-on can destroy recoverability (fsck, TRIM, GC, auto-rebuild).
  Recovery order: document → write-blocker image → work on copies → stop at UECC → professional chip-off if needed.
  Cold archive: do not use SSD long-term; prefer LTO/HDD multi-copy; scrub+rewrite; ambient logging. Not a stock tip.
date: 2026-08-17
updated: 2026-08-17
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - SSD
  - NAND
  - 데이터보존
  - JEDEC
  - 서버
  - 스토리지
  - 데이터복구
keywords:
  - "SSD 무전원 보존"
  - "data retention"
  - "JESD218"
  - "JEDEC"
  - "엔터프라이즈 SSD"
  - "NAND 전하 누설"
  - "UECC"
  - "write blocker"
  - "Arrhenius"
group: semi-storage
featured: true
featured_rank: 0
schema_type: BlogPosting
draft: false
robots: index,follow
---

# 전원이 끊긴 SSD는 얼마나 버티는가?

## — 무전원 방치 서버의 데이터 유실(Data Retention Failure) 기술 분석

SSD는 전기가 장기간 끊기면 데이터를 잃어버린다.

> **핵심 요지**
> SSD는 "전원을 안 써도 데이터가 남는 저장장치"가 아니라, **"전자를 절연막 안에 가둬 두고 새는 속도를 늦춰 놓은 저장장치"** 다.
> 시간·온도·마모도가 누적되면 전하는 반드시 새어 나가고, 임계전압(Vth) 분포가 겹치는 순간 ECC 정정 한계를 넘어 데이터가 복구 불가 영역으로 넘어간다.
> 그리고 서버용(엔터프라이즈) SSD의 **무전원 보존 규격은 소비자용보다 오히려 짧다.** 2–3년 방치된 서버 랙은 규격상 이미 한참 전에 보증 구간을 벗어나 있다.

---

## 1. 물리학 - 왜 전원이 없으면 데이터가 사라지는가?

NAND 플래시의 1비트는 절연막(터널 산화막)으로 둘러싸인 저장층, 플로팅 게이트(FG) 또는 전하 트랩(CTF, Charge Trap Flash) — 안에 **주입된 전자의 양**으로 표현된다. 전자 개수가 셀의 임계전압(Vth)을 결정하고, 컨트롤러는 읽기 기준전압(Vread)으로 그 상태를 판독한다.

전원이 끊긴 상태에서 데이터를 잃는 주요 메커니즘은 네 가지다.

| 메커니즘 | 내용 |
|---|---|
| **Detrapping / 전하 손실** | 절연막의 트랩에 걸려 있던 전자가 열에너지로 탈출. 시간의 로그 스케일로 진행되어 초기에 빠르게, 이후 완만하게 누적된다. |
| **SILC (Stress-Induced Leakage Current)** | P/E 사이클로 산화막에 생긴 결함이 누설 경로를 만든다. 마모된 셀에서 지배적. |
| **Early retention loss (3D NAND 고유)** | 프로그램 직후 수십 분–수 시간 내에 Vth가 급격히 이동. 3D CTF 구조에서 특히 관측되며, 방치 이전부터 마진을 깎아 놓는다. |
| **레이어 간 공정 편차** | 3D NAND는 적층 위치에 따라 셀 특성이 다르다. 가장 약한 워드라인이 전체 블록의 실패 시점을 결정한다. |

결과는 "0과 1이 뒤집힌다"가 아니라 **Vth 분포가 옆으로 밀리고 넓어지면서 인접 상태와 겹친다**는 것이다. 겹침 영역의 비트가 곧 RBER(Raw Bit Error Rate)이며, RBER이 LDPC/BCH의 정정 능력을 초과하면 그 페이지는 **UECC(Uncorrectable ECC)** — 즉 읽기 실패다.

---

## 2. JEDEC 규격의 정확한 의미 

`JESD218` / `JESD219`는 SSD 내구성·보존 규격을 정의한다. 자주 인용되는 두 숫자는 다음과 같다.

| 등급 | 활성 사용 조건(전원 ON) | **무전원 보존 요구** |
|---|---|---|
| **Client(소비자용)** | 40°C, 8시간/일 | **30°C에서 1년** |
| **Enterprise(서버용)** | 55°C, 24시간/일 | **40°C에서 3개월** |

여기서 반드시 함께 읽어야 하는 전제가 세 개 있다.

**(1) 이 숫자는 "수명을 다 쓴 상태"의 최악 조건이다.**
규격은 *"SSD가 정격 내구성(TBW/DWPD)까지 기록된 뒤 전원을 내린다"* 는 시나리오를 가정한다. 즉 1년/3개월은 **가장 마모된 시점의 최저 보증선**이다. P/E 사이클을 거의 쓰지 않은 드라이브는 실제로 이보다 훨씬 오래 버틴다. 이 전제를 빼고 "SSD는 1년이면 날아간다"고 쓰면 과장이 될 수 있다.

**(2) 반대로, 서버 SSD가 더 취약하다는 점이 종종 간과된다.**
엔터프라이즈 SSD의 무전원 규격은 40°C에서 **3개월**이다. 상시 고온·고쓰기 워크로드를 전제로 설계되었기 때문에, 전원이 끊긴 뒤의 보증 구간은 소비자용보다 짧다. **"서버용이니까 더 튼튼할 것"이라는 직관은 무전원 보관에서는 역전된다.**

**(3) "25°C에서 105주(약 2년)" 수치의 출처.**
널리 인용되는 이 표는 2015년 JEDEC JC-64.8 의장(Alvin Cox, Seagate)의 발표 자료에 실린 **클라이언트 MLC 기준 추정 곡선**이다. 규격 본문의 강제 조항이 아니라 온도 의존성을 보여주는 참고 데이터이며, 인용할 때는 이 맥락을 함께 밝히는 것이 정확하다.

---

## 3. 또 다른 변수 온도 - 유일하게 지수적으로 작동하는 변수

전하 손실은 열활성화 과정이므로 **Arrhenius 모델**을 따른다.

$$t_{retention} \propto \exp\left(\frac{E_a}{k_B T}\right)$$

활성화 에너지 $E_a$ 를 약 1.1 eV로 잡으면 실무 경험칙은 다음과 같다.

- **약 5–10°C 상승할 때마다 보존 기간이 절반**으로 줄어든다.
  (문헌에 따라 "5°C당 절반"과 "10°C당 절반"이 함께 쓰인다. 공정·셀 타입·마모도에 따라 $E_a$ 가 달라지기 때문이며, 보수적으로 판단해야 하는 상황에서는 5°C 쪽을 쓰는 것이 안전하다.)

참고용 추정 스케일(클라이언트 MLC 기준, 마모 말기 가정)

| 보관 온도 | 대략적 보존 기간 |
|---|---|
| 25°C | ~2년 |
| 30°C | ~1년 |
| 40°C | ~수개월 |
| 55°C | ~수주 |

**실무적 공포** 냉방이 끊긴 IDC, 창고, 컨테이너, 여름철 무공조 사무실에 랙을 세워 둔 경우 — 실측 온도가 30°C를 넘나든다면 "2–3년"이 아니라 **"1년 이내"** 를 위험 구간으로 봐야 할 수 있다. 그리고 대부분의 서버가 방치된 상황에서는 **아무도 그 온도를 기록하지 않았다**는 점이 진짜 문제다. 보존 여부를 사후에 추정할 근거 자체가 없다.

---

## 4. 나머지 변수들

**P/E 사이클 소진도 (가장 중요한 2순위 변수)**
쓰기가 많았던 드라이브는 산화막 손상으로 SILC가 증가하고, Vth 마진이 이미 좁아져 있다. SMART의 `Percentage Used`(NVMe) 또는 `Wear Leveling Count`(SATA)가 높은 드라이브는 같은 기간·같은 온도에서 훨씬 먼저 실패한다. 로그 서버·DB 서버·캐시 노드처럼 쓰기 집중 워크로드를 돌린 SSD가 가장 위험하다.

**셀 타입 (SLC → MLC → TLC → QLC)**
비트/셀이 늘어날수록 상태 수가 2배씩 늘고(SLC 2 / MLC 4 / TLC 8 / QLC 16), 같은 전압 범위를 더 잘게 쪼개므로 상태 간 마진이 좁아진다. QLC는 상태 간격이 **수백 mV 수준**까지 내려가므로 작은 전하 드리프트에도 상태 경계를 넘는다. 복구 관점에서도 SLC/MLC는 Read Retry 몇 단계로 해결되지만, QLC는 시도해야 할 기준전압 조합이 폭발적으로 늘어나 회수 난이도가 급격히 올라간다.

**2D vs 3D NAND**
3D NAND는 셀 크기가 크고 전하 트랩 구조라서 미세화된 평면(2D) NAND보다 내구성·보존 특성이 **개선**되었다. 즉 최신 드라이브가 무조건 더 취약하다는 이야기는 아니다. 다만 3D 고유의 early retention loss와 레이어 편차가 있어 마진이 균일하지 않다.

**컨트롤러 펌웨어의 유무**
같은 NAND라도 read voltage calibration, background media scan, adaptive refresh를 구현한 펌웨어가 있으면 회수 가능 범위가 크게 달라진다. **다만 이 기능들은 전원이 켜져 있을 때만 동작한다.**

---

## 5. 진짜 헬게이트 - "다 날아간다"가 아니라 "일부만 조용히 날아간다"

무전원 방치의 결과는 디스크 전체 소실이 아니다. 확률적·부분적 손상이며, 그래서 더 위험하다.

- **부분 UECC:** 파일의 일부 블록만 읽히지 않는다. 이미지·영상은 깨진 채로 열리고, 아카이브(zip/tar)는 특정 지점 이후 전체가 무효화된다.
- **메타데이터 단일 실패점:** 파일시스템 슈퍼블록/inode 테이블, DB 인덱스, FTL 매핑 테이블처럼 **작지만 전체 접근을 좌우하는 영역**이 손상되면, 데이터 본체 99%가 멀쩡해도 논리적으로 접근 불가가 된다. 대용량 UGC 아카이브에서 가장 흔한 전손 시나리오다.
- **RAID 상관 실패:** 같은 배치, 같은 워크로드, 같은 온도에서 방치된 어레이의 디스크들은 **동시에 열화된다**. HDD 시대의 "1개 고장 → 리빌드" 가정이 성립하지 않는다. 리빌드 중 다른 멤버에서 UECC가 나면 어레이 전체가 실패한다.
- **부팅 실패 vs 데이터 생존의 혼동:** 펌웨어/부트 영역 손상으로 드라이브가 인식되지 않아도 NAND 안의 데이터는 상당 부분 남아 있을 수 있다. 반대로 정상 부팅되었지만 조용히 파일이 깨져 있을 수도 있다. **"켜졌다"는 것은 "데이터가 있다"는 증거가 아니다.**

> ### 대규모 UGC 아카이브라는 맥락
> 사진·동영상·방명록처럼 **재생성이 원리적으로 불가능한 데이터**는 손실이 곧 영구 소멸이다. 매출 데이터는 재집계할 수 있지만 2005년에 올라간 사진은 어디에도 원본이 없다.

---

## 6. 전원을 넣기 전에 해야 할 일 — 첫 부팅이 마지막 기회다

**가장 흔한 치명적 실수는 "일단 켜서 확인해 보는 것"이다.** 방치된 SSD에 전원을 넣는 순간 다음이 자동 실행될 수 있다.

- 파일시스템 저널 재생(journal replay) 및 자동 `fsck` → 손상 구조를 "정리"하면서 덮어쓰기
- TRIM/UNMAP 발행 → 삭제 표시된 영역의 물리적 소거
- 가비지 컬렉션 / 웨어 레벨링 → 블록 재배치
- RAID 컨트롤러의 자동 리빌드 시작 → 열화된 멤버로부터 잘못된 데이터로 덮어쓰기

즉 **첫 전원 인가는 진단 행위가 아니라 상태 변경 행위**다. 아래 순서를 권한다.

1. **현장 상태 기록 (전원 인가 전)**
   랙 실측 온도·습도, 방치 기간, 드라이브 모델/시리얼, RAID 컨트롤러 모델과 **디스크 슬롯 순서**를 사진과 문서로 남긴다. RAID 구성 정보(스트라이프 크기, 순서, 패리티 회전)를 잃으면 물리적 데이터가 살아 있어도 재조립이 어려워진다.

2. **부팅하지 않고, 읽기 전용으로 이미징**
   OS 부팅 없이 하드웨어/소프트웨어 **write blocker** 를 경유해 드라이브를 연결하고, 전체 섹터를 이미지 파일로 덮는다(`ddrescue` 계열, 에러 맵 로그 필수). 원본은 그 이후 만지지 않는다. 모든 분석·복구 시도는 **이미지의 사본**에서 한다.

3. **가능하면 저온에서, 짧게**
   읽기 시도 자체가 드라이브를 가열시킨다. 온도가 올라가면 남은 마진이 더 빨리 소모된다. 통풍을 확보하고, 실패한 영역을 반복 재시도하며 오래 돌리지 않는다(1차 패스는 에러 건너뛰기, 2차 패스에서 재시도).

4. **RAID는 물리 디스크 단위로 개별 이미징 후 소프트웨어 재조립**
   컨트롤러에 어레이를 자동 임포트/리빌드하게 두지 않는다. 개별 이미지를 확보한 뒤 소프트웨어로 파라미터를 추정해 재구성한다.

5. **UECC가 나오면 그 시점에서 멈춘다**
   읽기 실패 섹터가 확인되면 자체 시도를 중단하고 전문 복구 업체로 이관한다. NAND 칩 직접 판독(chip-off), 컨트롤러 우회, 기준전압 스윕(Read Retry 전수 탐색), FTL 재구성은 전용 장비 영역이다. **아마추어 재시도는 남은 마진을 소모시켜 전문 복구 성공률을 떨어뜨린다.**

6. **무결성 해시를 남긴다**
   이미징 직후 이미지 전체와 개별 파일의 해시(SHA-256)를 기록하고 취득 절차·시각·담당자를 문서화한다. 이후 어떤 변화가 복구 과정에서 생긴 것인지 구분할 수 있어야 한다.
   *데이터가 분쟁·감사·조사와 관련될 가능성이 있다면, 기술적 이미징과 별개로 절차의 증거 능력 요건이 관할·사안별로 다르다. 이 문서는 기술 참고 자료이며 법률 자문이 아니다. 착수 전에 변호사 및 디지털 포렌식 전문가와 절차를 확정하는 것을 권한다.*

---

## 7. 최악의 참사 피하기 - "3–6개월마다 잠깐 켜기"는 절반만 맞다

통용되는 권고 — *"장기 보관 시 3–6개월에 한 번 1–2시간 전원을 켜라"* — 는 방향은 맞지만 메커니즘을 오해하기 쉽다.

**정확히는 이렇다.**
전원 인가 자체가 셀을 재충전하지 않는다. 리프레시는 컨트롤러가 **해당 블록을 읽고 다른 블록에 다시 쓸 때**만 일어난다. 일부 엔터프라이즈/산업용 SSD는 background media scan으로 블록별 경과 시간과 BER을 감시해 임계 초과 블록을 자동 재기록하지만, **모든 SSD가 이 기능을 갖고 있지는 않다.** 특히 소비자용 드라이브는 정적 데이터(오래 쓰이지 않은 데이터)를 스캔하지 않거나 매우 제한적으로만 처리한다.

또한 **1–2시간은 수 TB 어레이를 전수 스캔할 시간이 못 된다.** 컨트롤러가 리프레시할 기회를 얻지 못한 채 다시 전원이 내려간다.

**실효성 있는 대책(강한 것부터):**

| 우선순위 | 조치 |
|---|---|
| ① | **SSD를 장기 보관 매체로 쓰지 않는다.** 콜드 아카이브는 LTO 테이프 또는 HDD/객체 스토리지 다중 사본으로 이전. 3-2-1 원칙 준수. |
| ② | **주기적 전수 읽기 + 재기록(scrub).** 6–12개월마다 전 데이터를 읽어 BER을 확인하고, 가능하면 새 매체로 재기록. 읽기만으로는 리프레시가 보장되지 않으므로 재기록이 핵심. |
| ③ | **정기 전원 인가는 "충분한 시간" 확보 시에만 유효.** 최소 수 시간–수십 시간, 백그라운드 스크럽/patrol read를 실제로 완주시킬 것. 드라이브 펌웨어의 refresh 지원 여부를 벤더 문서로 확인. |
| ④ | **환경 통제.** 보관 온도를 낮고 일정하게(가능하면 20–25°C 이하, 40°C 절대 초과 금지). 온도 로거로 **기록**을 남긴다 — 사후에 위험도를 판단할 수 있는 유일한 근거다. |
| ⑤ | **마모도 기준 분류.** SMART `Percentage Used`가 높은 드라이브는 장기 보관 대상에서 제외하고 데이터를 먼저 이전. |

---

## 8. 요약 체크리스트

**규격 이해**
- [ ] 클라이언트 = 30°C/1년, 엔터프라이즈 = 40°C/3개월. **서버 SSD의 무전원 보증이 더 짧다.**
- [ ] 이 숫자는 정격 내구성을 소진한 최악 조건 기준이다. 신품은 더 오래 버티고, 마모 드라이브는 더 짧다.
- [ ] "25°C/105주"는 2015년 JEDEC 발표 참고 데이터이며 강제 규격이 아니다.

**위험 평가**
- [ ] 방치 기간뿐 아니라 **실측 보관 온도**와 **P/E 소진도**를 함께 본다. 온도만이 지수적으로 작동한다.
- [ ] TLC/QLC, 쓰기 집중 워크로드, 무공조 환경 → 위험 상향.
- [ ] RAID는 상관 실패를 전제로 판단한다.

**복구 착수**
- [ ] 켜기 전에 기록 → write blocker 경유 → 전체 이미징 → 사본에서만 작업.
- [ ] 자동 fsck / TRIM / RAID 자동 리빌드를 차단한다.
- [ ] UECC 발생 시 즉시 중단하고 전문 업체로 이관.
- [ ] 해시·절차·시각을 문서화한다.

**한 줄 결론**
> SSD의 무전원 보존은 **보증이 아니라 확률**이다. 2–3년 방치는 "확실히 날아갔다"는 뜻도 아니지만, "괜찮을 것"이라고 가정할 근거는 전혀 없다. 그리고 그 확률을 확인하는 유일한 시도 — 첫 전원 인가 — 는 **되돌릴 수 없다.**

---

## 참고 자료

- JEDEC `JESD218` (Solid-State Drive Requirements and Endurance Test Method) / `JESD219` (Solid-State Drive Endurance Workloads) — 등급별 무전원 보존 요구 정의
- Alvin Cox (Seagate, JEDEC JC-64.8 의장), *JEDEC SSD Specifications Explained*, 2015 — 온도-보존기간 추정 표의 원출처
- Western Digital, *SSD Endurance and HDD Workloads* (White Paper) — JESD218 보존 규격 표 및 전원 ON 상태 백그라운드 리프레시 동작 설명
- Dell, *SSD Data Retention Considerations When Powering Off Systems for a Prolonged Duration* (KB 000198930) — P/E 사이클·TBW·보관 온도의 영향, 40°C 초과 보관 금지 권고
- Q. Luo, S. Ghose, Y. Cai, E. F. Haratsch, O. Mutlu, *Improving 3D NAND Flash Memory Lifetime by Tolerating Early Retention Loss and Process Variation* (SIGMETRICS/POMACS 2018) — 3D NAND의 early retention loss 및 레이어 간 공정 편차
- R. Micheloni et al. / N. Papandreou et al., *Reliability of 3D NAND flash memory with a focus on read voltage calibration* — 3D TLC/QLC의 RBER 특성과 기준전압 캘리브레이션
- ATP, *SSD Data Retention in High Temperature Environments* — 온도에 따른 보존 특성 및 산업용 설계 요소

*본 문서는 기술 참고 자료이며, 특정 사안에 대한 법률 자문이나 데이터 복구 결과에 대한 보증이 아니다.*
