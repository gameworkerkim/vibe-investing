# DAT Strategy — Mean Reversion Quant Script

> *DAT(Digital Asset Treasury) 전략 기업의 주가와 보유 암호화폐 가격 간 평균회귀를 활용한 시그널 생성 스크립트 — Python + Kotlin*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue)](https://python.org)
[![Kotlin 1.9](https://img.shields.io/badge/Kotlin-1.9%2B-purple)](https://kotlinlang.org)
[![Series](https://img.shields.io/badge/Series-Awesome%20Claude%20Quant%20Scripts-orange)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)

---

## 핵심 문서 및 소스코드

| 자료 | 링크 |
|------|------|
| **📄 기본 문서 (한국어 전체 가이드)** | [DAT quant strategy kr.MD](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/DAT%20quant%20strategy/DAT%20quant%20strategy%20kr.MD) |
| **💻 소스코드 (Python + Kotlin)** | [src/ 폴더](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/DAT%20quant%20strategy/src) |

---

## 빠른 시작

### Python 사용자

```bash
pip install -r requirements.txt
python dat_zscore_strategy.py
```

### Kotlin 사용자

```bash
gradle init --type kotlin-application
# DatZScoreStrategy.kt를 src/main/kotlin/에 복사
gradle run
```

또는 IntelliJ IDEA에서 `main()` 함수에 우클릭 → Run.

---

## 분석 대상 (NASDAQ + NYSE)

| 티커 | 기업명 | 거래소 | 보유 자산 |
|------|-------|-------|---------|
| MSTR | MicroStrategy / Strategy Inc. | NASDAQ | BTC |
| MARA | Marathon Digital Holdings | NASDAQ | BTC |
| RIOT | Riot Platforms | NASDAQ | BTC |
| GLXY | Galaxy Digital | NASDAQ | BTC |
| COIN | Coinbase Global | NASDAQ | ETH proxy |
| BMNR | BitMine Immersion | NYSE American | ETH |
| SBET | SharpLink Gaming | NASDAQ | ETH |

---

## 분석 방법

```
① 가격 데이터 수집 (yfinance / Yahoo Finance API)
② 피어슨 상관관계 분석
③ 가격 비율 (Stock / Crypto) 계산
④ 90일 Rolling Z-Score (look-ahead bias 방지)
⑤ 매수/매도 시그널 생성 (Z ≤ -2 매수, Z ≥ +2 매도)
```

상관계수가 0.75 이상이면 페어 트레이딩의 통계적 유효성이 인정됩니다. MSTR-BTC 페어의 경우 r ≈ 0.87로 가장 강한 상관관계를 보입니다.

---

## 파일 구조

```
DAT quant strategy/
├── README.md                       ← 본 파일
├── DAT quant strategy kr.MD        ← 메인 한국어 문서 (이론 + 코드 + 사례)
└── src/
    ├── dat_zscore_strategy.py      ← Python 단독 실행 스크립트
    ├── DatZScoreStrategy.kt        ← Kotlin 단독 실행 스크립트
    ├── build.gradle.kts            ← Kotlin Gradle 빌드 설정
    └── requirements.txt            ← Python 의존성 목록
```

---

## 자주 묻는 질문 (FAQ)

본 스크립트 공개 후 받은 질문과 답변을 정리합니다.

### 일반 질문

**Q. "MSTR이 BTC와 0.87 상관관계인데, 직접 BTC 사면 되지 않나?"**

좋은 질문입니다. 직접 BTC 보유는 equity-specific 리스크(희석, 부채, 경영 결정)를 피할 수 있다는 장점이 있습니다. 그러나 MSTR은 (a) 차입 전략을 통한 BTC 레버리지, (b) 401k/IRA 같은 BTC가 직접 들어갈 수 없는 계좌에서의 노출, (c) 회사의 추가 사업 가치를 제공합니다.

순수성(BTC) vs. 컨벡시티(MSTR)의 trade-off입니다. 본 스크립트는 어느 쪽을 선택할지 정하지 않습니다 — 이미 MSTR을 선택한 사람의 *진입 타이밍*을 식별할 뿐입니다.

---

**Q. "왜 Kotlin도 만들었나?"**

대부분의 퀀트 도구는 데이터 사이언티스트만 사용한다고 가정합니다. 그러나 핀테크 백엔드는 JVM에서 돌아가고, 안드로이드 트레이딩 앱은 타입 안전성이 필요합니다.

Kotlin 버전 추가는 약 2일이 들었지만, 훨씬 넓은 사용자에게 도구를 열어줍니다. 같은 로직, 다른 생태계 — 스크립트를 *재사용 가능한 라이브러리*로 만드는 작업입니다.

365일 24시간 서비스 다운이 없어야하는 환경에서는 신뢰성 있는 JVM 환경의 코틀린이 안정적이며, 트레이딩 레이턴시에서 파이썬보다 안정적입니다. 

---

**Q. "Spot BTC ETF 이후 MSTR 프리미엄이 사라지면 이 전략도 무효 아닌가?"**

정확한 지적이고, disclaimer에 명시한 바입니다. 평균회귀는 *상관관계 지속*을 전제로 합니다. GENIUS Act, ETF 경쟁으로 인한 구조적 프리미엄 압축이 지속되면 과거 패턴이 무효일 수 있습니다.

스크립트는 *기회를 식별*할 뿐, *보장*하지 않습니다. 실거래 전 walk-forward 검증과 사전등록된 out-of-sample 테스트가 필요합니다.

---

### 비판적 댓글

**Q. "또 backtest fitting 아닌가"**

합리적 우려입니다. 90일 rolling window는 look-ahead bias 방지를 위한 것이지만, 파라미터 선택 자체는 in-sample입니다.

Walk-forward 분석과 out-of-sample 검증이 다음 단계로 권장됩니다 — 본 README와 메인 문서에 명시되어 있습니다. 이 검증을 함께 진행하실 분 환영합니다.

---

**Q. "이게 무슨 quant인가, 기본 통계 아닌가"**

맞습니다 — 가격 비율의 Z-Score는 기본기입니다. 본 스크립트의 가치는 수학적 새로움이 아니라 다음에 있습니다:

- **(a)** 7개 페어의 통합 분석 (개별 분석 대신 cross-asset)
- **(b)** Python + Kotlin 동시 구현 (대부분의 quant tool은 Python only)
- **(c)** [vibe-investing](https://github.com/gameworkerkim/vibe-investing) 시리즈와의 연계 (DAT mNAV 칼럼 + Awesome Claude Quant Scripts)

더 고급 기법은 [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) 시리즈의 ML/cointegration 모듈을 참조하시면 됩니다.

---

**Q. "투자 추천하는 거냐? 책임질 거냐?"**

Disclaimer에 명시한 바와 같이 연구·교육 목적이며 *투자 조언이 아닙니다*. 스크립트는 통계적 패턴을 식별할 뿐, 투자 결정은 사용자에게 있습니다.

모든 working paper와 오픈소스 퀀트 도구의 표준 입장입니다.

---

### 협업 제안

**Q. "한국 시장(KOSPI) 버전도 가능한가?"**

흥미로운 제안입니다. 현재 DAT 유니버스는 미국 상장 종목입니다. 한국 시장에는 직접적 DAT 대응 종목이 없지만, 향후 한국 기업이 BTC 트레저리 전략을 채택하면 프레임워크가 그대로 적용됩니다.

한국 시장은 미국 시장에 비해 유동성과 거래량이 부족한 코스닥 기업이 많습니다. DAT를 추구하는 기업이 있지만 가상화폐의 변동성과 한국 시장의 규제로 인해 리스크가 많습니다.
 
누군가가 확장하실 의향이 있다면 **PR 환영**입니다.

---

## Related Resources

- **자매 칼럼**: [DAT 기업의 mNAV 아비트리지 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD) — 15개 DAT 기업 + Jim Chanos 페어 트레이드 복기
- **시리즈 진입점**: [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) — 8대 퀀트 전략 + 학계 원전 30+편
- **학술 논문**: [SSRN 6632838 — The 72-Hour Shock?](https://ssrn.com/abstract=6632838) — vibe-investing 시리즈 첫 SSRN Working Paper

---

## Disclaimer

본 스크립트는 **연구·교육 목적**입니다.

- 투자 권유가 아닙니다
- 백테스트 결과는 슬리피지/수수료/세금 미반영 (illustrative only)
- Spot BTC ETF · GENIUS Act 등 regime change 시 과거 패턴 무효 가능
- 한국 거주자: 해외주식 양도소득세 22%, 외환거래법 신고 의무
- Claude를 포함한 LLM이 생성한 코드는 *반드시 사용자가 검증*해야 합니다
- 모든 투자 결과에 대한 책임은 사용자 본인에게 있습니다

> *Past performance does not guarantee future results.*

---

## Contact & Citation

**저자**: 김호광 (Dennis Kim / HoKwang Kim)
**소속**: Independent Researcher · Cyworld CEO
**이메일**: gameworker@gmail.com
**ORCID**: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
**GitHub**: [@gameworkerkim](https://github.com/gameworkerkim)

본 스크립트를 학술/연구 목적으로 활용 시 vibe-investing 레포 출처 표기를 부탁드립니다.

---

*시리즈: vibe-investing / Awesome Claude Quant Scripts (9번째 모듈)*
*최종 수정: 2026년 4월 27일*
