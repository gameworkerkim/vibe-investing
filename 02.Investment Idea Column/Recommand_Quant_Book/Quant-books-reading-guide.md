# 퀀트 트레이딩 필독서 10선 — 해설과 읽기 로드맵

퀀트 트레이딩은 많은 이론이 쌓은 분야입니다. 경제와 투자라는 모델의 변화와 불균형을 찾아 하나의 규칙을 찾아 수익을 발굴하기 때문에 때론 기존에 동작하던 퀀트 알고리즘이 제대로 동작하지 않을 때가 있습니다. 시대의 흐름에 따라 같은 퀀트 전략으로 수익의 문이 닫혔거나 시장의 변화로 새로운 시그널이 필요할 때가 된 것입니다. 도움이 되셨으면 합니다.

> 영어권 퀀트 커뮤니티에서 공통적으로 높은 평가를 받는 도서 10권에 **난이도, 선수 지식, 핵심 개념, 읽을 때 주의할 점, 읽기 순서, 보완 도서**를 더해 정리한 가이드입니다.

---

## 한눈에 보기

| # | 도서 | 저자 | 초판 | 난이도 | 분야 | 수학 요구 수준 |
|---|------|------|------|--------|------|----------------|
| 1 | Quantitative Trading | Ernest P. Chan | 2008 (2판 2021) | ★★☆☆☆ | 실전 입문 | 기초 통계 |
| 2 | Inside the Black Box | Rishi K. Narang | 2009 (3판 2024) | ★☆☆☆☆ | 퀀트 펀드 구조 | 거의 없음 |
| 3 | Advances in Financial Machine Learning | Marcos López de Prado | 2018 | ★★★★★ | 금융 ML | 통계·ML·선형대수 |
| 4 | Systematic Trading | Robert Carver | 2015 | ★★★☆☆ | 체계적 운용 | 기초 통계 |
| 5 | Algorithmic and High-Frequency Trading | Cartea · Jaimungal · Penalva | 2015 | ★★★★★ | HFT·최적 실행 | 확률미분방정식·확률제어 |
| 6 | The Man Who Solved the Market | Gregory Zuckerman | 2019 | ★☆☆☆☆ | 역사·논픽션 | 없음 |
| 7 | Volatility Trading | Euan Sinclair | 2008 (2판 2013) | ★★★★☆ | 옵션·변동성 | 옵션 이론·통계 |
| 8 | Trading and Exchanges | Larry Harris | 2003 | ★★☆☆☆ | 마켓 마이크로스트럭처 | 거의 없음 |
| 9 | Algorithmic Trading | Ernest P. Chan | 2013 | ★★★☆☆ | 전략 구현 | 시계열 기초 |
| 10 | Quantitative Portfolio Management | Michael Isichenko | 2021 | ★★★★☆ | Stat-Arb·포트폴리오 | 통계·최적화 |

---

## 도서별 해설

### 1. Quantitative Trading — Ernest P. Chan

**한 줄 요약:** 개인·소규모 팀이 퀀트 트레이딩 "사업"을 시작하는 법.

- **핵심 개념:** 전략 아이디어 발굴, 백테스트 함정(생존 편향, 룩어헤드 편향, 데이터 스누핑), 켈리 공식 기반 포지션 사이징, 실행 인프라
- **이 책을 더 잘 쓰는 법:** 2판(2021)은 MATLAB 외에 **Python·R 예제**가 추가되었으니 2판을 고르세요. 예제를 그대로 따라 치기보다 직접 데이터로 재현해 보는 편이 학습 효과가 큽니다.
- **주의할 점:** 개인 트레이더 관점이라 기관 수준의 리스크 모델·거래비용 모델은 얕습니다. 일부 전략 사례는 출간 이후 알파가 소멸했을 가능성이 높으니 "방법론"으로 읽으세요.

### 2. Inside the Black Box — Rishi K. Narang

**한 줄 요약:** 퀀트 펀드의 "부품도(圖)".

- **핵심 개념:** 알파 모델 → 리스크 모델 → 거래비용 모델 → 포트폴리오 구성 → 실행 모델로 이어지는 파이프라인, 퀀트 전략의 유형(추세·평균회귀·가치·캐리 등), 퀀트 펀드 평가 방법
- **이 책을 더 잘 쓰는 법:** 이후 읽을 모든 책을 이 책의 프레임 위에 "어디에 해당하는 부품인가"로 꽂아 넣으면 지식이 흩어지지 않습니다. 사실상 **전체 로드맵의 지도** 역할입니다.
- **주의할 점:** 코드나 수식은 거의 없습니다. 구현 능력을 기르는 책이 아니라 구조를 이해하는 책입니다.

### 3. Advances in Financial Machine Learning — Marcos López de Prado

**한 줄 요약:** "금융 데이터에 일반 ML을 그대로 쓰면 안 되는 이유"와 그 해법.

- **핵심 개념:** 정보 기반 바(Dollar/Volume/Imbalance Bars), Fractional Differentiation, Triple Barrier Method, Meta Labeling, Purged K-Fold CV와 Embargo, Combinatorial Purged CV, 특성 중요도(MDI·MDA·SFI), Deflated Sharpe Ratio
- **이 책을 더 잘 쓰는 법:** 장(章)마다 연습문제가 있고 코드 스니펫이 짧게 제시됩니다. 오픈소스 구현(mlfinlab 계열 등)을 참고하되, **직접 구현해 보는 것**이 이해의 핵심입니다. 한국어판은 『실전 금융 머신 러닝 완벽 분석』(에이콘)으로 나와 있습니다.
- **주의할 점:** 밀도가 매우 높고 설명이 압축적입니다. 일부 기법(정보 기반 바, 메타 라벨링 등)은 실무 적용 효과에 대해 커뮤니티 내 이견도 있습니다. "모두 정답"이 아니라 **검증 문화와 사고방식**을 배우는 책으로 읽는 것을 권합니다.

### 4. Systematic Trading — Robert Carver

**한 줄 요약:** 과최적화 없이 오래 살아남는 규칙 기반 포트폴리오 설계법.

- **핵심 개념:** 변동성 타기팅, 예측 신호(Forecast)의 스케일링과 결합, 핸드크래프팅(Handcrafting) 기반 가중치 결정, 비용을 고려한 매매 빈도 설계, "Semi-automatic trader / Asset allocating investor / Staunch systems trader" 세 가지 운용 유형
- **이 책을 더 잘 쓰는 법:** 저자의 오픈소스 백테스트 프레임워크 **pysystemtrade**(GitHub)와 블로그(qoppac)를 함께 보면 책의 개념이 코드로 어떻게 구현되는지 확인할 수 있습니다.
- **주의할 점:** 주로 선물(Futures) 기반 추세·캐리 전략을 전제로 합니다. 개별 주식 Stat-Arb에는 그대로 대응되지 않는 부분이 있습니다.

### 5. Algorithmic and High-Frequency Trading — Cartea, Jaimungal, Penalva

**한 줄 요약:** HFT·최적 실행·마켓 메이킹의 수학적 교과서.

- **핵심 개념:** 지정가 주문장(LOB) 모델링, 시장 충격(Market Impact), Almgren–Chriss 계열 최적 실행, 마켓 메이킹의 재고 위험 관리, 확률적 최적 제어(HJB 방정식)
- **이 책을 더 잘 쓰는 법:** 1부(마이크로스트럭처·경험적 사실)와 2부(수학 도구), 3부(응용)를 순서대로 읽되, 수학이 막히면 2부를 참고서처럼 왕복하세요. 대학원 강의 교재로 쓰이는 수준입니다.
- **주의할 점:** **이 목록에서 수학적으로 가장 어렵습니다.** 확률미분방정식과 확률제어 기초 없이 펼치면 진도가 나가지 않습니다. 실제 HFT 인프라(지연, 거래소 연결, 하드웨어)는 다루지 않습니다.

### 6. The Man Who Solved the Market — Gregory Zuckerman

**한 줄 요약:** 짐 사이먼스와 르네상스 테크놀로지스의 이야기.

- **핵심 내용:** 수학자·암호학자·음성인식 연구자들이 어떻게 메달리온 펀드를 만들었는지, 데이터 수집·정제 문화, 과학자 조직 운영 방식
- **이 책을 더 잘 쓰는 법:** 동기 부여와 "퀀트 조직 문화"를 이해하는 용도로 가장 먼저, 혹은 쉬어가는 타이밍에 읽기 좋습니다. 한국어판은 『시장을 풀어낸 수학자』로 나와 있습니다.
- **주의할 점:** 기술적 비밀은 공개되지 않습니다(애초에 알려진 것이 없습니다). 전략을 배우는 책으로 기대하면 실망합니다.

### 7. Volatility Trading — Euan Sinclair

**한 줄 요약:** 옵션 트레이더가 실제로 돈을 버는 지점, 즉 "변동성의 가격 오류" 다루기.

- **핵심 개념:** 다양한 실현 변동성 추정량(Parkinson, Garman–Klass, Yang–Zhang 등), 내재변동성 vs 실현변동성 스프레드, 델타 헤징 방식과 손익 분해, 켈리 기반 자금 관리, VIX·변동성 상품
- **이 책을 더 잘 쓰는 법:** 블랙-숄즈와 그릭스(Greeks)를 먼저 이해하고 들어가야 합니다. 후속작 『Positional Option Trading』(2020)과 함께 읽으면 실전 관점이 확장됩니다.
- **주의할 점:** 옵션 경험이 전혀 없다면 첫 책으로는 부적합합니다. 아래 보완 도서의 Hull 교과서나 Natenberg를 먼저 보세요.

### 8. Trading and Exchanges — Larry Harris

**한 줄 요약:** 시장이 "실제로" 어떻게 작동하는가에 대한 백과사전.

- **핵심 개념:** 트레이더 유형(정보 거래자, 유동성 공급자, 노이즈 트레이더 등)과 그들 사이의 제로섬 구조, 주문 유형, 호가 스프레드의 구성 요소, 역선택, 시장 구조 설계
- **이 책을 더 잘 쓰는 법:** 5번(HFT 교과서)의 직관적 전편(前篇)으로 읽으면 좋습니다. "내 전략의 수익은 시장에서 누구의 돈인가?"라는 질문에 답하게 해줍니다.
- **주의할 점:** 2003년 출간이라 전자거래·HFT 확산 이후의 시장 구조 변화는 반영되어 있지 않습니다. 개념 체계는 여전히 유효하지만 사례는 구식입니다.

### 9. Algorithmic Trading — Ernest P. Chan

**한 줄 요약:** 평균 회귀와 모멘텀 전략을 통계적으로 구현하는 실전서.

- **핵심 개념:** 정상성 검정(ADF, Hurst 지수, 분산비 검정), 공적분(Engle–Granger, Johansen), 칼만 필터를 활용한 동적 헤지 비율, 시계열·횡단면 모멘텀, 위험 관리
- **이 책을 더 잘 쓰는 법:** 1번 책의 "속편"입니다. 1번이 사업과 프로세스라면 9번은 전략 수학입니다. 예제가 MATLAB 중심이니 Python으로 옮겨가며 읽으면 그 자체로 좋은 연습이 됩니다.
- **주의할 점:** 거래비용·체결 슬리피지를 낙관적으로 가정한 예제가 있습니다. 백테스트 수익률을 그대로 믿지 마세요.

### 10. Quantitative Portfolio Management — Michael Isichenko

**한 줄 요약:** 현업 Stat-Arb 퀀트의 실전 노트를 정리한 고급서.

- **핵심 개념:** 데이터 소싱과 정제, 수익률 예측(Forecasting)과 예측 결합, 리스크 팩터 모델, 거래비용을 반영한 포트폴리오 최적화, 시뮬레이션과 과최적화 방지
- **이 책을 더 잘 쓰는 법:** 2번(구조) → 3번(ML 검증) → 4번(운용 체계)을 거친 뒤 읽으면 "현업은 이렇게 다 엮는구나"가 보입니다.
- **주의할 점:** 서술이 압축적이고 독자에게 상당한 배경지식을 요구합니다. 주식 Stat-Arb 중심이라 다른 자산군과는 거리가 있습니다.

---

## 읽기 순서 — 단계별 로드맵

### 0단계: 동기 부여와 큰 그림 (1~2주)

1. **The Man Who Solved the Market** (6번) — 왜 이 분야인가
2. **Inside the Black Box** (2번) — 퀀트 펀드의 전체 구조 지도

### 1단계: 기초 실전 (1~2개월)

3. **Quantitative Trading** (1번) — 백테스트와 운영의 기본
4. **Trading and Exchanges** (8번) — 시장이 작동하는 원리
5. **Algorithmic Trading** (9번) — 평균 회귀·모멘텀 구현

> 이 단계를 마치면 간단한 전략을 직접 백테스트하고, 그 결과의 함정을 스스로 의심할 수 있어야 합니다.

### 2단계: 체계화와 검증 (2~3개월)

6. **Systematic Trading** (4번) — 포지션 사이징과 포트폴리오 설계
7. **Advances in Financial Machine Learning** (3번) — 과최적화를 막는 검증 문화

### 3단계: 전문 트랙 선택 (각 2~3개월)

관심 분야에 따라 하나를 고르세요.

| 트랙 | 핵심 도서 | 함께 보면 좋은 책 |
|------|-----------|-------------------|
| **주식 Stat-Arb / 포트폴리오** | 10. Quantitative Portfolio Management | Grinold & Kahn, Paleologo |
| **HFT / 실행 알고리즘** | 5. Algorithmic and High-Frequency Trading | Bouchaud et al. |
| **옵션 / 변동성** | 7. Volatility Trading | Hull, Natenberg |
| **선물 / 추세 추종** | (4번 심화) | Carver 후속작, Clenow |
| **ML 퀀트** | (3번 심화) | López de Prado 후속작, Jansen |

### 배경별 추천 시작점

| 독자 유형 | 추천 순서 |
|-----------|-----------|
| 개발자 (코딩 강함, 금융 약함) | 2 → 8 → 1 → 9 → 4 → 3 |
| 금융 전공 (금융 강함, 코딩 약함) | 2 → 1 → 9 → 4 → 10 |
| 수학·물리 전공 | 2 → 8 → 3 → 5 또는 10 |
| ML 엔지니어 | 2 → 1 → 3 → 10 |
| 옵션 트레이더 지망 | 2 → 8 → (Hull) → 7 |

---

## 보완하면 좋은 도서

위 10권이 다루지 않거나 얕게 다루는 영역을 채우는 책들입니다.

### 포트폴리오·리스크 이론

- **Active Portfolio Management** — Richard Grinold, Ronald Kahn: 정보비율(IR)과 "운용의 기본 법칙(Fundamental Law)"을 정립한 고전. 10번 이전에 읽으면 이해도가 크게 올라갑니다.
- **Advanced Portfolio Management** — Giuseppe Paleologo: 팩터 모델과 펀더멘털·퀀트 포트폴리오 관리의 실무를 간결하게 정리.
- **Expected Returns** — Antti Ilmanen: 자산군별 기대수익률의 원천(가치, 캐리, 모멘텀 등)을 실증적으로 정리한 참고서.
- **Efficiently Inefficient** — Lasse Heje Pedersen: 헤지펀드 전략 유형별 해설과 운용자 인터뷰.

### 머신러닝

- **Machine Learning for Asset Managers** — Marcos López de Prado: AFML보다 짧고 친절한 후속작. 3번이 너무 어렵다면 이 책을 먼저 읽는 것도 방법입니다.
- **Machine Learning for Algorithmic Trading** — Stefan Jansen: Python 코드 중심으로 데이터 수집부터 딥러닝·강화학습까지 폭넓게 다루는 실습서.

### 마이크로스트럭처·실행

- **Trades, Quotes and Prices** — Jean-Philippe Bouchaud 외: 시장 충격과 주문 흐름에 대한 물리학적·실증적 접근. 5번과 상호 보완적입니다.

### 옵션·파생상품 기초

- **Options, Futures, and Other Derivatives** — John C. Hull: 파생상품 표준 교과서. 7번 이전의 필수 선수 과목.
- **Option Volatility and Pricing** — Sheldon Natenberg: 트레이더 관점의 옵션 입문 고전.

### 추세 추종·선물

- **Leveraged Trading**, **Advanced Futures Trading Strategies** — Robert Carver: 4번의 실전 확장판.
- **Following the Trend** — Andreas Clenow: 분산형 추세 추종 전략의 구현과 성과 분석.

### 수학 기초

- **Stochastic Calculus for Finance I·II** — Steven Shreve: 5번을 읽기 위한 확률미적분 기초.
- **The Elements of Statistical Learning** — Hastie, Tibshirani, Friedman: ML의 통계적 기초 (무료 PDF 공개).

---

## 읽을 때 지켜야 할 원칙

1. **책의 전략을 그대로 쓰지 말 것.** 출판된 전략은 대부분 이미 알파가 줄었거나 소멸했습니다. 책에서 가져가야 할 것은 전략이 아니라 **방법론과 검증 습관**입니다.
2. **읽은 만큼 코드로 재현할 것.** 특히 1, 3, 4, 9번은 직접 구현해 봐야 의미가 생깁니다. 공개 데이터(Yahoo Finance, FRED, 거래소 데이터 등)로 충분히 시작할 수 있습니다.
3. **백테스트 결과를 기본적으로 의심할 것.** 생존 편향, 룩어헤드 편향, 거래비용 누락, 다중 검정 문제를 항상 체크하세요. Deflated Sharpe Ratio(3번)와 Purged CV는 이 의심을 정량화하는 도구입니다.
4. **시장 구조를 먼저 이해할 것.** 8번을 건너뛰고 전략부터 짜면, "왜 이 신호가 돈이 되는가(누가 돈을 잃는가)"에 답하지 못하는 전략을 만들게 됩니다.
5. **판(Edition)을 확인할 것.** 1번(2판 2021), 2번(3판 2024), 7번(2판 2013)은 개정판에서 내용이 상당히 보강되었습니다.

---

## 요약

| 목적 | 우선순위 도서 |
|------|---------------|
| 처음 시작 | 6 → 2 → 1 |
| 전략 구현 능력 | 1 → 9 → 4 |
| 과최적화 방지와 ML | 3 (+ ML for Asset Managers) |
| 기관 수준 운용 체계 | 2 → 4 → 10 (+ Grinold & Kahn) |
| HFT·실행 | 8 → 5 (+ Bouchaud) |
| 옵션·변동성 | Hull → 7 |
