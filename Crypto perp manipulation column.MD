# 보이지 않는 손인가, 계획된 사기인가?
## — 가상화폐 선물 시장의 비정상적 pump & dump 패턴에 대한 수학적·온체인 검토

> *"규제받는 거래소에서는 벤포드의 법칙이 성립한다. 규제받지 않는 거래소에서는 성립하지 않는다."*
> — Cong, Li, Tang, Yang (2023), *Management Science*

**저자**: 김호광 (Dennis Kim) · Cyworld CEO
**발행일**: 2026년 4월 19일
**카테고리**: Market Microstructure · On-chain Forensics · Crypto Regulation

---

## Executive Summary (English)

Since 2024, crypto perpetual futures have become the dominant venue of price discovery for most altcoins — Q2 2025 saw approximately $12 trillion in perpetual futures volume across CEXs and DEXs, representing about 59% of all crypto derivatives activity. Alongside this growth, a recurring pattern has emerged on decentralized perpetual venues: a token's price rises 100-300% within minutes on thin order books, triggers a cascade of liquidations, and then collapses back to pre-event levels — often with four or more freshly funded wallets appearing on-chain and acting as a single economic entity.

This column does not accuse any specific token, foundation, or market maker. It asks a narrower, more defensible question: **can the observed pattern arise from ordinary market behavior, or does it statistically require coordinated action?** The answer, based on the academic and forensic literature, is the latter. Three strands of evidence converge:

1. **Benford's Law deviation** — Cong, Li, Tang, and Yang (2023, *Management Science*) show that unregulated exchanges systematically violate Benford's first-significant-digit distribution, with roughly 70%+ of reported volume inconsistent with authentic trading. Regulated exchanges do not exhibit this deviation.

2. **Microstructural anomalies** — recent arXiv research (2025) analyzing 1,101 trading pairs finds that confirmed pump events display a stereotyped pattern: extended "dormant" price flatness, a few-minute divergence of minute-level OHLC, and immediate reversion to pre-event levels. This pattern is structurally incompatible with information-driven price discovery.

3. **Forensic on-chain evidence** — in multiple documented incidents (XPL pre-market on Hyperliquid, August 2025; JELLY token, March 2025; Fartcoin, April 2025), blockchain security firms including PeckShield and Lookonchain identified four or more freshly funded wallets exhibiting coordinated entry, funding source correlation, and simultaneous exit — patterns that single-actor rational trading cannot explain.

The legally careful conclusion: the aggregate pattern across numerous incidents is statistically inconsistent with a natural market forming prices from independent bids and offers. Without attributing intent to any named party, the weight of academic, forensic, and on-chain evidence supports the inference that **a non-trivial share of "vertical" pump-dump events on perpetual futures venues is the product of coordinated strategies by a small number of actors** — whether characterized as whales, market makers, project-aligned entities, or unregulated prop desks. The relevant question is no longer *whether* this occurs but *how to design venues, rules, and regulation such that the expected profit from such strategies becomes negative.*

---

## 한글 요약

2024년 이후, 가상화폐 무기한 선물(perpetual futures)은 대부분의 알트코인 가격 형성의 주 무대가 되었다. 2025년 2분기 한 분기 동안 CEX와 DEX를 합쳐 약 12조 달러의 선물 거래량이 기록되었고, 이는 전체 암호화폐 파생상품 활동의 약 59%에 해당한다. 이 성장과 함께 탈중앙 선물 거래소에서 반복되는 패턴이 관찰된다 — **얇은 호가창에서 특정 토큰이 몇 분 안에 100~300% 급등한 뒤 청산 폭포(liquidation cascade)를 유발하고 사건 전 수준으로 되돌아가는 패턴**. 이때 온체인에서는 동시에 자금 공급을 받은 네 개 이상의 새 지갑이 단일 경제 주체처럼 행동하는 경우가 다수 보고된다.

본 칼럼은 **특정 토큰·재단·마켓메이커를 지목하지 않는다**. 다만 더 좁고 방어 가능한 질문을 던진다 — *"관찰된 패턴이 정상적 시장 행동에서 발생할 수 있는가, 아니면 통계적으로 좌표화된 행동을 요구하는가?"* 학술·포렌식 문헌의 답은 후자다. 세 개의 근거 축이 수렴한다:

1. **벤포드 법칙 이탈** — Cong, Li, Tang, Yang (2023, *Management Science*) 논문은 규제받지 않는 거래소에서 첫 유효 숫자 분포가 벤포드 법칙을 체계적으로 위반하며, 보고된 거래량의 약 70% 이상이 정상 거래와 일치하지 않음을 보였다. 규제받는 거래소에서는 이런 이탈이 없다.

2. **미시구조 이상** — 2025년 arXiv 연구(1,101개 거래쌍 분석)는 확인된 pump 이벤트가 *정형화된 패턴*을 보인다고 보고했다: 장기간의 "휴면(dormant)" 가격 평탄화 → 수 분간의 분(minute)-level OHLC 발산 → 이벤트 직전 수준으로의 즉각 복귀. 이 패턴은 정보 기반 가격 형성과 구조적으로 양립 불가능하다.

3. **포렌식 온체인 증거** — 문서화된 다수 사건에서(2025년 8월 Hyperliquid의 XPL 사전 거래 시장, 2025년 3월 JELLY 토큰, 2025년 4월 Fartcoin), PeckShield·Lookonchain 같은 블록체인 보안 기업이 *네 개 이상의 새 지갑이 동일한 자금 출처, 동시 진입, 동시 퇴각을 보이는* 패턴을 식별했다. 단일 합리적 트레이더 행동으로는 설명되지 않는다.

법적으로 조심스러운 결론은 이렇다: **다수 사건을 가로지르는 집계 패턴은 독립적 호가로부터 자연스럽게 가격이 형성되는 시장과 통계적으로 양립하지 않는다**. 특정 이름에 의도를 귀속시키지 않고도, 학술·포렌식·온체인 증거의 무게는 하나의 추론을 지지한다 — **선물 시장의 "수직적" pump-dump 이벤트의 상당 비중이 소수 주체들의 좌표화된 전략의 산물**이라는 추론(그 주체를 고래, 마켓메이커, 프로젝트 연관 엔터티, 규제되지 않는 prop desk 중 무엇으로 기술하든). 이제 남은 질문은 *이 일이 일어나는가*가 아니라 *이런 전략의 기대 이익이 음수가 되도록 거래소·규칙·규제를 어떻게 설계할 것인가*이다.

---

## 1. 무엇이 문제인가 — 패턴의 정의

먼저 본 칼럼이 다루는 패턴을 명확히 정의한다. 아래 5가지가 *동시에* 관찰될 때, 해당 이벤트는 일반적 가격 발견(price discovery)으로 설명하기 어려워진다.

| 조건 | 설명 | 정상 시장에서의 빈도 |
|---|---|---|
| **V (Vertical move)** | 수 분 내 100% 이상의 가격 움직임, 이후 곧바로 사건 직전 수준으로 복귀 | 매우 낮음 |
| **T (Thin liquidity)** | 호가창 유동성이 수백만 달러 수준, 대형 자산(BTC/ETH) 대비 수십배 얇음 | 소형 토큰에 흔함 |
| **C (Coordinated wallets)** | 4+ 개의 새로 funded된 지갑이 단일 자금원에서 같은 시점에 포지션 진입 | **극히 희귀** |
| **L (Liquidation cascade)** | 반대편 포지션이 강제 청산되어 가격을 같은 방향으로 추가 가속 | 고레버리지 시장에 내재 |
| **R (Round-trip profit)** | 원인 지갑이 정점 근처에서 청산하고 평균 진입가 이하로 되돌아옴 | 정상적 방향성 거래에서는 드묾 |

5개 조건이 동시에 성립하는 사건을 본 칼럼은 **"VTCLR 이벤트"** 로 부른다. 이 조건들은 아래에서 수학적으로 하나씩 다룬다.

## 2. 수학적으로 비정상적임을 증명하기 — 세 가지 정리

### 2-1. 벤포드의 법칙(Benford's Law)과 거래량 조작

**벤포드의 법칙**은 자연 발생 수치 데이터의 첫 유효 숫자 분포가 다음을 따른다고 예측한다:

$$P(d) = \log_{10}\left(1 + \frac{1}{d}\right), \quad d \in \{1,2,...,9\}$$

즉, 첫 자리가 1일 확률 ≈ 30.1%, 2일 확률 ≈ 17.6% ... 9일 확률 ≈ 4.6%. 금융 시장에서의 주가, 거래량, 시가총액은 매우 광범위한 규모에 걸쳐 있어 벤포드의 법칙을 잘 따르는 것으로 알려져 있다.

Cong, Li, Tang, Yang (2023, *Management Science*)의 연구는 29개 암호화폐 거래소를 대상으로 벤포드 법칙 적합도를 검정했다. 핵심 결과:

- 규제받는 거래소는 자연·금융시장에서 일관되게 관찰되는 패턴을 보임. 반면 규제받지 않는 거래소는 첫 유효 숫자 분포의 이상, 거래량 rounding, 거래 tail 분포가 비정상적으로 나타남
- 규제되지 않는 거래소 각각의 wash trading을 정량화한 결과, 보고된 거래량의 평균 70% 이상이 허위로 추정됨. 이 조작된 거래량(연간 수조 달러)은 거래소 순위를 끌어올리고 가격을 일시적으로 왜곡한다

카이제곱 적합도 검정(chi-square goodness-of-fit test)에서:

$$\chi^2 = \sum_{d=1}^{9} \frac{(O_d - E_d)^2}{E_d}$$

여기서 O는 관찰된 빈도, E는 벤포드 법칙 기대 빈도. 규제되지 않는 거래소의 χ² 통계량은 자유도 8에서 **p < 0.001**을 만족하며 벤포드 법칙을 기각한다. 이는 "거래자 이질성"이나 "특정 전략"으로 설명되지 않는다.

### 2-2. 확률론적 논증 — 4개 지갑의 동시성

VTCLR 이벤트에서 가장 결정적인 조건은 **C (Coordinated wallets)** — 새로 funded된 4+ 지갑이 단일 자금원에서 좁은 시간창 안에 같은 방향으로 진입하는 것이다.

이 사건이 우연히 발생할 확률을 계산해보자.

**가정**:
- 특정 거래소의 활성 지갑 수를 N = 1,500,000 (Hyperliquid 규모 기준)
- 특정 토큰 perp 시장에 하루 평균 진입하는 새 지갑 수 = n_new = 5,000
- 관심 시간 창 = 10분 (1일의 1/144)
- 10분 창 안에 새로 진입하는 지갑 수 ≈ 35개 (기대값)

**1차 confound — "같은 자금원"**: 네 지갑이 독립적으로 자금원을 선택하는 경우, 같은 CEX 출금 주소에서 funded될 확률은 지갑당 약 1/200 수준(주요 CEX/믹서 합산 기준). 네 지갑 모두 같은 주소에서 funded될 확률:

$$P(\text{same funding}) \approx \binom{35}{4} \cdot \left(\frac{1}{200}\right)^4 \approx 52,360 \cdot 6.25 \times 10^{-10} \approx 3.3 \times 10^{-5}$$

**2차 confound — "동시 진입 방향"**: 네 지갑이 모두 같은 방향(롱 또는 숏)일 확률 ≈ 2 × (1/2)⁴ = 1/8

**3차 confound — "규모 유사성"**: 포지션 사이즈가 서로 같은 order of magnitude일 확률 ≈ 1/10

**4차 confound — "시점 집중"**: 네 지갑의 진입이 모두 같은 block window(수 분) 안에 몰릴 확률 ≈ 1/20

**결합 확률**:

$$P(\text{all four simultaneously by chance}) \approx 3.3 \times 10^{-5} \times \frac{1}{8} \times \frac{1}{10} \times \frac{1}{20} \approx 2.1 \times 10^{-8}$$

즉, **우연에 의한 발생 확률은 약 2천만분의 1**. 보수적 추정이다. 그런데 2025년 Hyperliquid 한 플랫폼에서만 이런 패턴이 최소 3회 공개 보도됨 — JELLY(3월), XPL(8월), Fartcoin 관련 사건(이전)을 포함해 2025년에 최소 3건의 market manipulation 사건이 기록됨.

관찰된 발생 빈도 ≫ 우연 발생 확률이라는 통계적 귀결은 명확하다. **우연으로는 설명 불가능**.

### 2-3. 미시구조 정리 — OHLC 분(minute)-level 발산

arXiv:2504.15790 (2025)의 연구는 2024-08-15부터 2025-02-15까지 Poloniex의 1,101개 거래쌍, 약 820만 개의 분-level OHLCV 레코드를 분석하여 다음을 발견했다:

- 확인된 pump 이벤트에서, High와 Low 가격은 pump 자체 기간(몇 분에 불과)에 유의미하게 발산하고, 직후 즉시 재수렴하여 사건 전 수준으로 돌아온다. 이는 고전적 pump-and-dump 활동과 일치하는 빠른 가격 팽창과 수축을 보여준다

이를 수학적으로 표현하면, 가격의 instantaneous dispersion을 ξ(t) = (High(t) − Low(t)) / Close(t)로 정의할 때:

$$\xi(t) = \begin{cases} \xi_0 \approx 0.001-0.003 & \text{(통상적 정보 유입 하)} \\ \xi_{\text{pump}} \approx 0.3-1.0 & \text{(사건 시)} \\ \xi_0 & \text{(사건 직후, 2-5분 내)} \end{cases}$$

정보 기반 가격 발견 모델(Kyle 1985, Glosten-Milgrom 1985)에서는 새 정보가 시장에 반영되면 가격은 **새로운 균형 수준에 머문다**. 정보가 잘못된 것이었다면 며칠에 걸쳐 점진적으로 되돌아오지 수 분 만에 원점 복귀하지 않는다. **수 분 안에 원점 복귀하는 가격 움직임은 정보 유입이 아닌 유동성 충격의 지표**이며, 유동성 충격을 인위적으로 일으킬 수 있는 주체는 정의상 해당 시장에서 충분히 큰 지갑 또는 그 네트워크다.

## 3. 온체인 증거 — 공개된 사건 케이스 스터디

본 섹션은 **공개 보도된 사건만** 다룬다. 모든 인용은 1차 소스로 검증 가능하다.

### 3-1. Hyperliquid XPL pre-market (2025년 8월)

2025년 8월 26일 UTC 05:30경, 한 주소가 $500만을 추가 주입하여 XPL 토큰의 극히 얇은 유동성을 악용해 몇 분 안에 가격을 $0.60에서 $1.80으로 200%+ 상승시켰다. 이는 청산 폭포를 유발하고 격렬한 short squeeze를 만들어냈다. 공격자들은 최고가 부근 $1.1-$1.2 수준에서 포지션을 닫았다. 공매도자들의 총 추정 손실은 최대 $6,000만 달러에 달했고, 한 사용자는 $250만 손실을 보고했다. 조작자들은 $4,600만 이상의 이익을 실현했다.

2025년에만 Hyperliquid에서 이런 종류의 사건이 최소 3차례 발생했다. 3월에는 트레이더가 JELLY memecoin 선물 시장을 대상으로 공격을 가해 플랫폼의 market maker vault에 $1,350만 손실을 입혔다.

### 3-2. Fartcoin 사건 (2025년 4월)

2025년 4월 9일, PeckShield와 Lookonchain은 4개 지갑을 단일 엔터티로 연결하는 Fartcoin 조작 시도를 식별했다. 공격자는 4개 지갑에 걸쳐 145.24M 토큰에 해당하는 $1,500만 Fartcoin 롱 포지션을 축적했다. 그 다음 저유동성 환경에서 PeckShield가 "suicide" liquidation이라 부른 청산을 유발해, Hyperliquid의 Auto-Deleveraging(ADL) 메커니즘을 활성화시켰고 독성 포지션을 HLP(Hyperliquidity Provider) vault로 떠넘겼다.

공격 지갑들은 $3.02M의 청산 손실을 입었지만, 이는 crossvenue 헤징으로 실제로는 막대한 순이익을 얻었을 가능성이 높다. 4개의 새 지갑이 같은 엔터티이며, 동시에 USDC를 받고, 3시간 안에 좌표화된 long 청산을 겪었다. 27% pump 후 30% crash로 끝났다.

### 3-3. 2025년 10월 $200억 청산 사건

CoinGlass 데이터에 따르면 Hyperliquid가 $103억의 청산, Bybit이 $46.5억, Binance가 $24.1억을 기록하여 수 시간 안의 글로벌 손실의 대다수를 차지했다. Solidus Labs 분석은 pre-positioned 고래 거래와 거래소 단위 청산 메커니즘이 사건 충격을 유의미하게 증폭시켰음을 시사한다. 직접적 조작은 확인되지 않았지만, Solidus Labs는 공개 관세 발표 전에 발생한 의심스럽게 타이밍된 고래 거래를 플래그했다. 이는 정보 비대칭 악용의 신호일 수 있다.

## 4. "보이지 않는 손"의 세 가지 가능한 해석

관찰된 패턴을 놓고 생각할 수 있는 해석은 크게 세 가지다. 각각을 수학적 베이지안 관점에서 평가한다.

### H₁: 자연 시장 행동 (귀무가설)
- 확률: ≈ 0 (위 §2-2 계산 결과)
- **기각**

### H₂: 단일 고래의 합리적 방향성 거래
- 필요 조건: 단일 트레이더가 자본 손실 위험을 감수하며 단방향 진입
- 불일치: *사건 후 가격 복귀* + *4+ 지갑 자금 출처 동일성* + *진입·퇴각 동시성*
- 단일 고래 가설은 *여러 지갑의 상관 행동*을 설명하지 못함
- **약하게 지지됨 (부분적 설명 가능하지만 불완전)**

### H₃: 소수 주체의 좌표화된 전략
- 주체 후보: (a) 시장조성자 네트워크, (b) 프로젝트 연관 엔터티, (c) 규제되지 않는 prop trading desk
- 동기: (i) 청산 캐스케이드를 통한 차익, (ii) cross-venue hedge로 platform risk 전가, (iii) 거래량 상위 노출 유도
- **모든 관찰 패턴을 설명하는 유일한 단일 가설**

베이지안 추론:

$$P(H_3 | \text{observed}) = \frac{P(\text{observed} | H_3) \cdot P(H_3)}{\sum_i P(\text{observed} | H_i) \cdot P(H_i)}$$

P(observed | H₁) ≈ 0이고 P(observed | H₂) ≪ P(observed | H₃)이므로, **사전 확률이 어떻든 H₃이 사후 확률에서 지배적**이다.

중요한 점: 이 결론은 **특정 주체를 지목하지 않는다**. 단지 *"패턴을 설명하려면 어떤 형태의 좌표가 필요하다"* 는 일반론이다.

## 5. 법적으로 안전한 결론

본 칼럼은 특정 토큰 발행사, 재단, 마켓메이커를 지목하거나 그 주체에 법적 책임을 묻지 않는다. 한국 형법 제307조(명예훼손), 정보통신망법 제70조(정보통신망 명예훼손), 그리고 민사상 불법행위 책임을 고려할 때, 공개 보도된 사건을 그 1차 소스에 귀속시키고 **통계적 일반론**만을 도출하는 것이 적절하다.

도출할 수 있는 법적으로 안전한 결론은 다음과 같다.

### 결론 1 (통계적)
> **가상화폐 선물 시장에서 반복적으로 관찰되는 VTCLR 패턴(Vertical, Thin, Coordinated, Liquidation, Round-trip)은 독립적 시장 참여자들의 자연스러운 상호작용으로는 발생 확률이 실질적으로 0에 수렴한다.** 벤포드 법칙 이탈(Cong et al. 2023), 미시구조 이상(arXiv:2504.15790), 온체인 공개 사건의 집계 분석(PeckShield, Lookonchain, Solidus Labs 보고)이 모두 같은 방향을 가리킨다.

### 결론 2 (구조적)
> **이 패턴의 발생은 *특정 주체의 악의*를 증명할 필요 없이 거래소·프로토콜 설계 차원에서 해결 가능**하다. 외부 가격 피드 통합, 편차 상한(deviation cap), pre-market perpetuals에 대한 더 엄격한 유동성 조건, ADL 활성화 시 원인 지갑에 대한 추가 페널티 등이 그 방안이다. Hyperliquid는 외부 가격 피드, 편차 상한, 향상된 모니터링 도구를 도입했다.

### 결론 3 (정책적)
> **규제 대응의 초점은 "누가 조작했는가"가 아니라 "조작의 기대 이익을 어떻게 음수로 만드는가"에 있어야 한다.** 시장 참여자 식별·처벌은 탈중앙 특성상 어렵지만, 구조 변경을 통한 공격 비용 증가는 즉시 가능하다.

### 결론 4 (투자자용)
> **저유동성 알트코인 선물 시장에서의 단기 포지션은 무작위 변동성 노출이 아니라 *좌표화된 리스크*에 노출된다**. 개인 투자자는 (i) 유동성이 $수천만 이상인 시장만 참여, (ii) 4배 이상의 레버리지 회피, (iii) stop-loss 대신 제한된 자본 비중 사용, (iv) pre-market perpetuals 완전 회피를 권장한다.

## 6. 그렇다면 "보이지 않는 손"인가

제목의 수사적 질문으로 돌아가자. Adam Smith가 1759년에 제시한 "보이지 않는 손"의 원래 의미는 *개별 참여자의 이기적 행동이 총량 차원에서 사회적 후생을 증진시킨다*는 것이었다. 이는 **독립적** 참여자들의 **비조정** 행동을 전제로 한다.

본 칼럼이 분석한 VTCLR 패턴은 정반대다 — **조정된** 참여자들의 **의도된** 행동이 총량 차원에서 *다른* 참여자들의 후생을 감소시킨다. 이것은 Smith가 말한 보이지 않는 손이 **아니다**. 오히려 전통 시장에서 한 세기 동안 금지되어 온 *마켓 코너링(market cornering)*, *페인팅 더 테이프(painting the tape)*, *워시 트레이딩(wash trading)*의 현대적 변형이다.

증거의 무게는 다음을 시사한다:
- 특정 이름은 지목할 수 없지만, **집합적 패턴은 자연 발생이 아니다**
- "보이지 않는 손"이 아니라 **구조적으로 가능해진 좌표화된 전략**이다
- 해결은 적발·처벌이 아니라 **공격 비용을 증가시키는 메커니즘 설계**에 있다

모델은 언제나 진실을 가리킨다. 벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다. **적발 여부와 별개로, 패턴은 이미 거기에 있다.**

---

## 📚 References

### 학술 논문 (Peer-reviewed)

[¹] Cong, L.W., Li, X., Tang, K., & Yang, Y. (2023). *Crypto Wash Trading*. Management Science, 69(11), 6427-6454. https://doi.org/10.1287/mnsc.2021.02709 — 29개 거래소 벤포드 법칙 적합도 검정, 규제되지 않는 거래소의 거래량 중 70%+ wash trading 추정.

[²] Li, T., Shin, D., & Wang, B. (2023). *Cryptocurrency Pump-and-Dump Schemes*. Journal of Financial and Quantitative Analysis, 60(8), 3622-3659. https://doi.org/10.1017/S0022109025000201 — P&D 이벤트 발생 빈도, wealth transfer 메커니즘, 지갑-level 증거.

[³] Dhawan, A., & Putnins, T.J. (2023). *A New Wolf in Town? Pump-and-Dump Manipulation in Cryptocurrency Markets*. Review of Finance, 27, 935-975. — 암호화폐 시장의 pump-and-dump 특성화.

[⁴] Sirolly, A., Ma, H., Kanoria, Y., & Sethi, R. (2025, Nov). *Network-Based Detection of Wash Trading*. Columbia Business School Research Paper No. 5714122. https://ssrn.com/abstract=5714122 — Polymarket 사례, 지갑 간 closed cluster 기반 wash trading 탐지.

[⁵] Karbalaii, M. (2025). *Detecting crypto pump-and-dump schemes: A thresholding-based approach to handling market noise*. arXiv:2503.08692. — 시장 노이즈 대비 pump 탐지 thresholding 방법.

[⁶] *Microstructure and Manipulation: Quantifying Pump-and-Dump Dynamics in Cryptocurrency Markets*. arXiv:2504.15790v1 (2025). https://arxiv.org/html/2504.15790v1 — Poloniex 1,101 거래쌍, 820만 분-level OHLCV 레코드 분석.

[⁷] Wang, S., Cheng, N., & Zhang, T. (2025). *Wash trading and insider sales in NFT markets*. Journal of Banking & Finance, 180. https://www.sciencedirect.com/science/article/abs/pii/S0378426625001499 — NFT wash trading과 insider 행동의 공동 발생.

### 산업 보고서 / 포렌식 분석

[⁸] Chainalysis (2025). *Crypto Market Manipulation 2025: Suspected Wash Trading, Pump and Dump Schemes*. https://www.chainalysis.com/blog/crypto-market-manipulation-wash-trading-pump-and-dump-2025/ — DEX 기반 wash trading $704M 추정 (2024), 신규 토큰의 42.35%가 DEX 상장, 42% 토큰이 30일 내 거래 정지.

[⁹] Solidus Labs (Oct 2025). *$20 Billion Crypto Crash: What Liquidations Reveal About Market Integrity*. https://www.soliduslabs.com/post/when-whales-whisper-inside-the-20-billion-crypto-meltdown — 2025-10-10 크래시, 거래소별 청산 규모($103억 Hyperliquid, $46.5억 Bybit, $24.1억 Binance), 관세 발표 전 고래 거래 타이밍 이상.

[¹⁰] PeckShield, Lookonchain (Apr 2025). Fartcoin Hyperliquid 사건 분석 — https://cryptoadventure.com/fartcoin-whale-liquidated-for-3-million-on-hyperliquid-after-suspected-manipulation-play/

[¹¹] Hyperliquid XPL pre-market incident analysis (Aug 2025). https://www.panewslab.com/en/articles/fbf586fa-ad56-4881-8f37-301302a33300 — 4개 좌표화된 지갑, $500만 자금 주입, 200%+ 가격 상승, $4,600만+ 공격자 이익.

[¹²] DL News (Sep 2025). *Hyperliquid whale's $15m XPL token trade lays bare platform's vulnerabilities once more*. https://www.dlnews.com/articles/defi/hyperliquid-whale-inflates-xpl-token-future-contract-price-exposing-vulnerabilities/ — 2025년 Hyperliquid 최소 3건의 시장 조작 사건 언급.

[¹³] WisdomTree Prime (Dec 2025). *The Great Whale Slap: How a Whale Offloaded $4M in Losses to Hyperliquid's HLP Vault*. https://www.wisdomtreeprime.com/blog/the-great-whale-slap-how-a-whale-offloaded-4m-in-losses-to-hyperliquids-hlp-vault/ — GMX, dYdX, Hyperliquid 사례 비교 분석.

### 시장 데이터

[¹⁴] CoinGecko Annual Crypto Industry Report 2025 — 2025년 Perp DEX 공개 이자 229.6% 상승, CEX 공개 이자 20.8% 하락. https://www.coingecko.com/learn/rise-of-perpetuals-and-perp-dexs

[¹⁵] a16z crypto (Apr 2026). *A guide to perpetual futures: How they work and why they're growing so quickly*. CEX perp 거래량 $86.2조 (+47% YoY), DEX perp 거래량 $6.7조 (+346% YoY). https://a16zcrypto.com/posts/article/what-are-perpetual-futures/

[¹⁶] CoinMarketCap (Dec 2025). *Monthly Perpetual Futures Trading Volume on DEXes Hits $1T*. https://coinmarketcap.com/academy/article/dex-perps-trading-volume-1-trillion-monthly

### SEC/규제 액션

[¹⁷] U.S. SEC (Oct 9, 2024). Enforcement action against ZM Quant, Gorbit, CLS Global, MyTrade for artificial token volume generation — Chainalysis [⁸] 인용. 18명 개인·엔터티, 영국·포르투갈 touchpoint의 국제 거래 스킴.

### 고전 이론 (수학적 근거)

[¹⁸] Kyle, A.S. (1985). *Continuous Auctions and Insider Trading*. Econometrica, 53(6), 1315-1335. — 정보 기반 가격 발견의 기본 모델.

[¹⁹] Glosten, L.R., & Milgrom, P.R. (1985). *Bid, ask and transaction prices in a specialist market with heterogeneously informed traders*. Journal of Financial Economics, 14(1), 71-100. — bid-ask spread 형성의 정보 경제학.

[²⁰] Benford, F. (1938). *The law of anomalous numbers*. Proceedings of the American Philosophical Society, 78(4), 551-572. — 벤포드 법칙 원전.

---

## 관련 자료

- **Awesome Vibe Invest — Crypto Edition**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD) — Alpha Arena 결과 + 9개 카테고리 LLM 크립토 트레이딩 큐레이션
- **LTCM의 사례로 배우는 모델을 읽는 힘**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD) — 기능적 동질화와 시스템 리스크
- **Microsoft의 Fintool 인수 분석**: [링크](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)

---

## Disclaimer

본 칼럼은 **학술적·공익적 분석을 목적으로 한 연구·논평 저작물**이다.

- **특정 토큰, 재단, 프로젝트, 마켓메이커, 거래소, 개인을 지목하거나 그에게 법적 책임을 귀속시키지 않는다.** 언급된 구체적 사건(XPL, JELLY, Fartcoin 등)은 모두 **공개 보도된 사건**이며, 그 기술은 1차 소스(블록체인 보안 기업의 공개 보고서, 주요 암호화폐 매체의 보도)의 인용에 기반한다.
- 본 칼럼의 모든 확률 계산은 **제시된 가정 하의 추정치**이며, 실제 발생 가능성은 시장 상황에 따라 달라진다.
- **"시장 조작"을 주장하지 않는다**. 단지 관찰된 통계적 패턴이 정상 시장 행동의 확률 분포와 양립하지 않는다는 *수학적 관찰*을 기술한다. 각 개별 사건의 법적 성격 규명은 관할 수사·규제 기관의 몫이다.
- 본 칼럼의 분석은 투자 조언이 아니다. 암호화폐 선물 거래는 자본 전액 손실 위험이 있으며, 한국에서는 거주자 해외 암호화폐 선물 거래가 관련 법령에 따라 제한 또는 규제될 수 있다. 미국 거주자는 CFTC 규제 하에 **진정한 perpetual futures에는 접근 제한**이 있음을 유념해야 한다 [¹⁵].
- 본 칼럼의 통계·수학 논증은 참고용이며, 실제 규제·수사·소송 과정에는 더 엄격한 증거 기준과 맥락 분석이 필요하다.
- 본 칼럼은 [vibe-investing 레포](https://github.com/gameworkerkim/vibe-investing)의 일부로 MIT 라이선스 하에 공개된다. 인용·재배포 시 출처 표기를 부탁드린다.

---

<p align="center">
  <i><b>"Models always point to truth. Fingers always point to greed."</b></i><br>
  <i>"모델은 언제나 진실을 가리킨다. 손가락은 언제나 탐욕을 가리킨다."</i><br><br>
  <i><b>"Benford's law cannot lie. On-chain data lasts forever."</b></i><br>
  <i>"벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다."</i>
</p>
