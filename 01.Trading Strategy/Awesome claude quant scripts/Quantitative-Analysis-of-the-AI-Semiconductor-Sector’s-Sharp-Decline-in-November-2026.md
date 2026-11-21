# 2026년 11월 나스닥 테크 급락을 분석하는 퀀트 전략과 LLM Prompt 공개

2026년 11월 21일 · Dennis Kim

## 핵심 판단

11월 20일 종가 기준으로 "단기 기술적 조정"이라는 진단은 유지하기 어렵고, 닷컴형 붕괴로 단정할 증거도 아직 없습니다. 가장 정합적인 해석은 이익은 살아 있으나 자금 조달과 금리가 흔들리는 **중기 리셋**입니다.

- 반도체는 이미 조정 범위를 벗어났습니다. 10월 초 고점 대비 필라델피아 반도체지수는 약 37\~41%, 엔비디아는 약 48%, 나스닥100은 19.8% 하락했습니다.
- "기계적 디레버리징" 가설은 약해졌습니다. 노무라 McElligott는 기계적 매수 여건이 갖춰졌는데도 반등하지 못하면 포지션 문제가 아니라고 경고했고, 11월 20일 나스닥은 5.28% 더 하락했습니다.
- 닷컴과의 결정적 차이로 꼽던 "자체 현금흐름 조달"이 흔들립니다. 3분기에 알파벳·아마존·메타는 설비투자가 영업현금흐름을 넘었습니다.
- 멀티플은 버블과 거리가 멉니다. 나스닥100 선행 PER은 약 18\~23배로 2000년 3월의 약 60배와 다릅니다. 다만 하드웨어 이익은 고객 설비투자의 함수이므로 낮은 PER이 바닥을 보장하지 않습니다.

| 시나리오 | 주관적 가중치 | 3\~12개월 경로 | 과거 유사 국면 |
| --- | --- | --- | --- |
| A. 단기 기술적 조정 | 약 20% | 수주 내 반등, 전고점 방향 회복 | 2026년 7월 모멘텀 언와인드 |
| B. 중기 리셋 | 약 50% | 6\~18개월 변동성 큰 박스권, 실적이 주가를 따라잡는 구간 | 2022년 |
| C. 구조적 하락 | 약 30% | 설비투자 삭감, 이익 하향, 다년 디레이팅 | 2000\~2002년 |

가중치는 아래 근거에 기반한 주관적 판단이며 예측이나 투자 권유가 아닙니다. 저는 투자 자문가가 아니므로 판단 재료로만 쓰시기 바랍니다.

## 하락의 경과와 원인

이번 하락은 한 번의 급락이 아니라 10월 6일 고점 이후 6주간 이어진 세 차례의 파동이며, 원인도 밸류에이션 하나가 아닙니다. 엔비디아 고유 악재, 연준의 금리 인상, 정책 변수, 대형 IPO 공급이 겹쳤습니다.

| 날짜 | 사건 | 시장 반응 |
| --- | --- | --- |
| 11월 20일 | [로이터의 SEC 엔비디아 회계 조사 보도, 구글의 2027년 브로드컴 설계 TPU 약 100만 개 감축 조사, 월간 옵션 만기](https://www.newsquawk.com/headlines/us-market-wrap-aggressive-equity-sell-off-sees-spx-enter-correction-and-ndx-test-bear-market). [쿡 연준 이사의 추가 긴축 발언](https://en.bloomingbit.io/feed/news/124916) | 나스닥 -5.28%(22,617.73), S&P500 -3.70%, 다우 -1.93%, SOX -10.73%, 엔비디아 -14.01%($125.53), VIX 37.09 |
| 11월 19일 | [앤트로픽 상장(공모가 83달러, 조달 1,195억 달러)](https://en.bloomingbit.io/feed/news/124916) | 상장 첫날 +17.1%, 다음 날 -8.5% |
| 11월 17일 | [엔비디아 3분기 실적: 매출 1,158억 달러(+103%), 4분기 가이던스 1,300억 달러](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2027) | 시간외 상승 후 매일 하락 |
| 11월 16일 | [엔비디아 이사회의 황 복귀 불가 보도, 상무부의 중국 기업 해외 연산자원 임대 차단](https://www.sisajournal-e.com/news/articleView.html?idxno=425087) | 나스닥 -2.49%, SOX -5.3% |
| 11월 13일 | [젠슨 황 CEO 사임 여파 확산](https://kr.investing.com/news/stock-market-news/article-2175891) | 나스닥 -0.91%, 엔비디아 시총 4조 달러 하회 |
| 11월 10일 | [물가 지표 예상 상회, 월러 이사의 50bp 인상 가능성 언급](https://www.cnn.com/2026/11/10/investing/bond-yields-inflation-fed) | 미 10년물 4.98%, 장중 5% 상회 |
| 11월 5일 | [민주당의 상하원 승리 뒤 랠리 반납, 데이터센터 건설 둔화 우려](https://finance.yahoo.com/markets/live/stock-market-today-thursday-november-5-dow-sp-500-nasdaq-plunge-chip-stocks-melt-down-193726491.html) | 나스닥 -5.5%, 나스닥100 -6.3%, SOX 약 -12% |
| 10월 6일 | [나스닥·S&P500 사상 최고 종가, 엔비디아 239.24달러](https://247wallst.com/investing/2026/11/20/nvidia-stock-plunges-12-after-reuters-reports-an-sec-probe-of-its-accounting-its-nvidias-worst-day-since-deepseek-and-it-has-lost-2-7-trillion-since-october/) | 고점 |

주간으로 나스닥은 10.0% 하락해 연초 대비 -2.7%가 됐고, 엔비디아는 주간 약 23% 하락했습니다([파이낸셜뉴스](https://www.fnnews.com/news/202611210748273869)).

## 닷컴 버블과의 비교

밸류에이션과 이익은 2000년과 분명히 다르지만, 자금 조달과 통화정책은 2000년에 가까워지고 있습니다. 즉 "다르다"의 근거 네 가지 중 두 가지만 온전히 남아 있습니다.

| 차원 | 2000년 닷컴 붕괴기 | 2026년 11월 | 퀀트의 해석 |
| --- | --- | --- | --- |
| 밸류에이션 | [나스닥100 선행 PER 약 60배(2000년 3월)](https://intuitionlabs.ai/articles/ai-bubble-vs-dot-com-comparison) | [나스닥100 선행 PER 약 17.9배(11월 19일)](https://dollarliquidity.com/en/valuation/nasdaq-100-forward-pe), 산출처에 따라 [약 23배](https://en.macromicro.me/series/23955/nasdaq-100-pe). 엔비디아는 연환산 EPS 기준 약 11.6배 | 차이 유효. 멀티플 압축은 이미 상당 부분 진행됐습니다. 남은 위험은 분모인 이익의 하향입니다 |
| 이익의 질 | 닷컴 기업 중 흑자는 약 14%. 다만 시스코는 2000 회계연도 매출 189억 달러, 순이익 27억 달러의 흑자 기업이었습니다 | [엔비디아 분기 매출 1,158억 달러, 순이익 653억 달러, 매출총이익률 74.8%](https://www.panabee.com/news/nvidia-earnings-q3-2027) | 차이 유효하나 과신 금물. 2000년에도 장비주는 흑자였고, 고객의 설비투자가 멈추자 이익이 무너졌습니다 |
| 설비투자 자금 조달 | 통신사의 부채 조달에 의존(근사 서술) | [4개사 2026년 설비투자 가이던스 7,200억\~7,400억 달러, 3분기에 마이크로소프트만 영업현금흐름이 설비투자 상회](https://www.decodingdiscontinuity.com/p/hyperscaler-ai-cash-flow). [하이퍼스케일러 채권 발행 연초 이후 2,960억 달러, 코어위브 채권 금리 16% 초과](https://www.cnbc.com/2026/11/06/coreweave-bond-yield-tops-16percent-as-ai-credit-stress-rises.html) | 차이 약화. 닷컴과의 차별점 가운데 가장 빠르게 좁혀지는 축입니다 |
| 통화정책 | 연준이 2000년 초까지 금리 인상 | [기준금리 3.75\~4.00%, 12월 25bp 인상이 대부분 반영](https://ceoeconomy.com/article/how-to-read-fed-decision-dot-plot), 10년물 4.91% | 유사. 성장주 할인율에 역풍이며 저가 매수 자금의 기회비용을 높입니다 |
| 수요 집중도 | 통신사와 닷컴 신생 기업에 장비 수요 집중(근사 서술) | 엔비디아 직접 고객 3곳이 매출의 36%. OpenAI와 앤트로픽의 약정이 클라우드 수주잔고의 40% 가까이 | 유사. 소수 구매자의 예산이 산업 전체 이익을 좌우합니다 |
| 낙폭과 기간 | 나스닥 5,048에서 1,139로 약 77% 하락, 31개월 소요. 전고점 회복은 약 15년 뒤(근사치) | 6주 만에 나스닥100 -19.8%, SOX 약 -37\~41%, 엔비디아 약 -48% | 속도는 2000년 첫 파동과 비슷합니다. 폭과 기간은 이익 하향 여부가 결정합니다 |

2000년 나스닥은 3\~5월 첫 급락 뒤 여름에 30% 이상 반등했다가 장기 하락으로 들어갔습니다(근사치). 따라서 반등이 나온다는 사실만으로는 두 국면을 가를 수 없습니다.

## 국면 판단 프레임워크

단기 조정과 구조적 하락을 가르는 것은 주가 수준이 아니라 여섯 가지 관측 지표의 방향입니다. 11월 20일 현재 세 개가 부정적, 한 개가 긍정적, 두 개가 미정입니다.

| 지표 | 단기 조정 쪽 신호 | 구조적 하락 쪽 신호 | 11월 20일 판독 |
| --- | --- | --- | --- |
| 수급 | 기계적 매수 트리거 이후 반등이 이어짐 | 반등 실패, 실수요 자금의 비중 축소 | 부정적. [4% 반등 시 CTA 매수 211억 달러가 대기했지만](https://thedarksideoftheboom.substack.com/p/mcelligott-when-the-machines-are) 반등은 없었습니다 |
| 신용 | AI 관련 CDS 안정, 발행 시장 유지 | 발행 중단, 투자등급으로 전염 | 부정적. 코어위브 5년 CDS 1,289bp, 오라클 약 298bp. [고등급 하이퍼스케일러 스프레드는 안정](https://www.cnbc.com/2026/11/11/morgan-stanley-ai-bonds-hyperscalers-credit.html) |
| 설비투자 가이던스 | 1월 말\~2월 초 실적에서 2027년 계획 유지 | 계획 삭감 | 미정. 구글의 TPU 약 100만 개 감축 조사가 첫 균열입니다 |
| 이익 수정 | 반도체 EPS 컨센서스 상향 지속 | 하향 전환 | 긍정적. 엔비디아 4분기 가이던스 1,300억 달러는 컨센서스 약 1,250억 달러를 상회. 다만 매출총이익률 가이던스는 71\~72%로 하락 |
| 금리 | 인상 기대 후퇴, 장기금리 하락 | 인상 지속, 10년물 5% 재상회 | 부정적이나 완화 조짐. 50bp 인상 기대는 소멸, 10년물은 4.91%로 하락 |
| 엔비디아 고유 리스크 | SEC 조사 범위 제한, 후임 CEO 확정 | 재무제표 재작성, 장기 경영 공백 | 미정. 조사 시작 시점과 범위가 밝혀지지 않았습니다 |

### 제 판단을 바꿀 조건

- A(단기 조정) 쪽으로 이동: 반등이 나스닥100의 200일 이동평균선 위에서 2주 이상 유지되고, 코어위브와 오라클의 CDS가 함께 축소될 때.
- C(구조적 하락) 쪽으로 이동: 하이퍼스케일러 한 곳 이상이 2027년 설비투자를 공식 하향하거나, 투자등급 AI 채권 발행이 막히거나, 엔비디아가 과거 실적을 정정할 때.
- 주의점: 엔비디아 고유 악재는 업종 전체의 수요와 분리해서 봐야 합니다. 한 종목의 거버넌스 문제를 AI 수요 붕괴로 읽으면 C를 과대평가하게 됩니다.

## AI와 AI 인프라 트렌드를 보는 관점

AI 수요는 실재하지만, 시장이 다시 가격을 매기는 대상은 수요의 유무가 아니라 회수 시점과 자금 조달 비용입니다. 닷컴의 교훈도 기술이 틀렸다는 것이 아니라, 기술이 옳아도 인프라 투자자의 수익은 오래 늦어질 수 있다는 것입니다.

1. **수요는 확인됩니다.** 엔비디아 데이터센터 매출은 분기 1,076억 달러로 1년 전보다 110% 늘었습니다. 2000년의 닷컴 기업들과 달리 매출과 이익이 존재합니다.
2. **회수 시점이 밀리고 있습니다.** 한 분석은 4개 하이퍼스케일러의 합산 잉여현금흐름이 2028년 약 -1,300억 달러이고 2030년에야 흑자로 돌아선다고 추정합니다. [S&P 글로벌은 6개사의 2027년 설비투자를 1조 3,000억 달러로 보며, 잉여현금흐름 흑자는 마이크로소프트뿐이라고 전망합니다](https://www.fool.com/investing/2026/09/06/hyperscalers-driving-ai-capex-cash-flow/).
3. **하드웨어 주가는 설비투자의 수준이 아니라 증가율의 변화를 따릅니다.** 2026년 계획은 전년 대비 60% 이상 증가였고, [2027년 컨센서스는 4개사 기준 약 28% 증가](https://www.yieldtheory.app/research/hyperscaler-capex-2027-forecast)입니다. 삭감이 없어도 증가율 둔화만으로 반도체 이익 모멘텀은 꺾입니다.
4. **순환 구조가 취약 지점입니다.** OpenAI와 앤트로픽의 약정이 클라우드 수주잔고의 40% 가까이를 차지합니다. 엔비디아는 최대 1,180억 달러의 보증 익스포저와 320억 달러의 네오클라우드 우발 약정을 공시했습니다. 공급자가 고객의 구매력을 뒷받치는 구조는 2000년 장비사의 벤더 파이낸싱과 닮았습니다.

정리하면 인프라 하드웨어는 성장주가 아니라 설비투자 사이클에 레버리지가 걸린 경기순환주로 평가하는 편이 맞습니다. 반면 AI 도입으로 비용을 줄이거나 매출을 늘리는 응용 기업은 인프라 과잉 투자의 수혜자가 될 수 있습니다. 모건스탠리 퀀트팀이 저변동성·가치주와 AI 도입 기업을 함께 권한 것도 같은 논리입니다.

## 투자 전략: 퀀트의 대응

지금은 방향을 맞히려는 베팅보다 노출을 줄여 두고, 확인된 조건에 따라 단계적으로 다시 싣는 규칙 기반 대응이 합리적입니다. 변동성이 평소의 두 배 수준이고, 여섯 지표 중 셋이 부정적이며, 기다리는 비용이 낮기 때문입니다.

### 원칙

1. **비중은 변동성에 맞춥니다.** VIX는 37.09입니다. 위험 예산이 같다면 변동성이 두 배일 때 적정 비중은 절반입니다. 종목 선택보다 총노출 크기가 성과를 좌우하는 구간입니다.
2. **가격이 아니라 조건에 따라 분할 진입합니다.** 많이 빠졌다는 사실은 매수 근거가 아닙니다. 2000년에도 첫 급락 뒤 큰 반등이 나온 다음 장기 하락이 이어졌습니다.
3. **대기 자금은 단기 국채에 둡니다.** [미국 3개월물 수익률은 11월 19일 4.34%](https://ceoeconomy.com/article/how-to-read-fed-decision-dot-plot)입니다. 조건이 확인될 때까지 기다리는 비용이 낮습니다.
4. **레버리지 상품은 뺍니다.** 반도체 3배 ETF인 SOXL은 11월 20일 하루에 31.83% 하락했습니다. 변동성이 큰 장에서는 방향을 맞혀도 복리 손실이 쌓입니다.
5. **단일 종목 한도를 지킵니다.** 엔비디아는 연환산 PER 약 11.6배로 싸 보이지만, SEC 조사와 CEO 공백은 분산으로 줄일 수 없는 이벤트 위험입니다.
6. **헤지보다 비중 축소가 쌉니다.** VIX 37에서는 풋옵션 매수 비용이 높습니다. 보호가 필요하면 옵션을 사기보다 비중을 줄이는 편이 효율적입니다.
7. **한국 투자자는 노출을 합산합니다.** [11월 20일 코스피는 5.21%, 삼성전자는 7.01%, SK하이닉스는 5.92% 하락했습니다](https://www.fnnews.com/news/202611210748273869). 미국 AI주와 한국 반도체주는 같은 요인에 움직이므로 하나의 노출로 계산해야 합니다.

### 단계적 재진입 규칙(예시)

평소 AI·반도체 목표 비중을 100으로 둘 때의 예시입니다. 임계값은 각자의 위험 한도에 맞게 조정해야 합니다.

| 단계 | 조건 | AI·반도체 비중 |
| --- | --- | --- |
| 현재 | 여섯 지표 중 셋이 부정적 | 50\~60 |
| 1차 복원 | 수급 안정: 나스닥100이 200일 이동평균선 위에서 2주 유지, VIX 25 이하 | +15 |
| 2차 복원 | 신용 안정: 코어위브와 오라클 CDS가 11월 초 수준 아래로 축소 | +15 |
| 3차 복원 | 실적 확인: 1월 말\~2월 초 실적에서 2027년 설비투자 계획 유지, 2월 말 엔비디아 실적에서 이익률 방어 | +15 |
| 이탈 | 하이퍼스케일러의 설비투자 공식 하향, 투자등급 AI 채권 발행 중단, 엔비디아 실적 정정 중 하나 | 30 이하 |

### 팩터와 AI 내 배분

| 구분 | 방향 | 이유 |
| --- | --- | --- |
| 모멘텀·고베타 | 축소 | 급락 뒤의 반등 국면에서 모멘텀 팩터는 큰 손실을 내는 경향이 있습니다. [골드만 고베타 모멘텀 바스켓은 7월에 37% 하락](https://app.hedgeye.com/insights/185196-goldman-s-high-beta-momentum-basket-on-track-for-worst-monthly-perform?type=macro)했습니다 |
| 퀄리티(순현금, 잉여현금흐름 흑자) | 확대 | 금리 인상기와 신용 경색에서 방어력이 큽니다 |
| 저변동성·가치 | 확대 | B와 C 양쪽에서 유효합니다. 모건스탠리 퀀트팀의 권고와 같은 방향입니다 |
| 부채 조달 네오클라우드·데이터센터 | 최소화 | 코어위브 채권 금리가 16%를 넘었고, [올해 데이터센터 채권의 절반 가까이가 투기등급](https://finance.biggo.com/news/b80bb435-5af0-45df-b54a-ade87ce99100)입니다 |
| 인프라 병목 기업(전력, 냉각, HBM) | 선별 유지 | 순현금이고 가격 결정력이 실적으로 확인되는 곳만 남깁니다. 메모리주는 11월 20일 13\~16% 하락해 변동성이 가장 큽니다 |
| AI 도입·응용 기업 | 점진 확대 | 인프라 가격이 내리면 수혜를 봅니다. 모건스탠리는 AI 도입 기업 바스켓의 상대적 견조함을 지적했습니다 |
| 하이퍼스케일러 | 중립 | 설비투자 삭감은 하드웨어에는 악재지만 이들의 현금흐름에는 호재입니다. 하드웨어 노출의 부분 헤지가 됩니다 |

### 시나리오별 대응

| 시나리오 | AI·반도체 비중 | 핵심 행동 |
| --- | --- | --- |
| A. 단기 조정 | 복원 규칙에 따라 100으로 회복 | 낙폭이 컸던 우량 반도체 비중을 되돌립니다. 초기 반등 일부를 놓치는 비용은 감수합니다 |
| B. 중기 리셋 | 50\~85 사이에서 6\~12개월 분할 | 인프라와 응용의 바벨을 유지하고, 정기 리밸런싱으로 변동성을 활용합니다 |
| C. 구조적 하락 | 30 이하 | 반등 때 하드웨어를 줄이고 퀄리티, 저변동성, 단기채 중심으로 옮깁니다 |

이 규칙은 어느 시나리오에서도 크게 틀리지 않도록 설계한 것입니다. A가 맞으면 초기 반등의 일부를 놓치고, C가 맞으면 손실을 크게 줄입니다. 투자 기간, 세금, 환 노출에 따라 적정 비중은 달라지므로 개인별 결정은 본인의 한도에 맞춰 하셔야 합니다.

## LLM 프롬프트: 한국어 마스터 버전

결론을 미리 전제하지 않도록 설계한 프롬프트입니다. 데이터 입력 블록, 세 가지 국면 분류, 확률과 반증 조건을 강제합니다. 중괄호 항목만 채워 쓰시면 됩니다.

```
# 역할
당신은 미국 주식 퀀트 리서치 데스크의 시니어 애널리스트입니다. 팩터 모델, 포지셔닝과 파생 수급, 크레딧, 기업 재무를 함께 읽습니다. 결론보다 근거와 반증 조건을 우선합니다.

# 과제
{분석 기준일} 기준 미국 나스닥 반도체·AI 기술주 급락이 아래 세 국면 중 어디에 가까운지 진단하는 보고서를 작성하세요.
(A) 단기 기술적 조정: 수급과 모멘텀 청산이 주도하며 수주 내 회복
(B) 중기 리셋: 6~18개월의 밸류에이션·자금조달 재조정, 이익은 유지
(C) 구조적 하락: 2000년 닷컴 붕괴처럼 설비투자 삭감과 이익 하향이 이어지는 다년 하락

# 입력 데이터
아래 블록의 수치를 1차 근거로 쓰세요. 블록에 없는 수치가 필요하면 웹 검색으로 확인하고, 확인하지 못한 수치는 "미확인"으로 표시하세요. 기억에 의존한 수치를 사실처럼 쓰지 마세요.
<data>
{지수·종목 등락률, 고점 대비 낙폭, 선행 PER, VIX, 금리, 하이퍼스케일러 설비투자·영업현금흐름·채권 발행, AI 관련 CDS, 포지셔닝 자료}
</data>

# 분석 절차
1. 하락 분해: 이번 하락을 네 갈래로 나눠 기여도를 추정하세요. (1) 개별 기업 고유 악재, (2) 포지셔닝과 기계적 수급(레버리지 ETF, 변동성 컨트롤, CTA, 딜러 감마), (3) 매크로·금리·정책, (4) AI 투자 수익성과 자금 조달 구조.
2. 국면 판별: 밸류에이션(선행 PER, PEG, EV/매출), 팩터 쏠림(모멘텀·고베타 크라우딩), 변동성(VIX 수준과 기간 구조), 크레딧(AI 관련 CDS와 발행 시장), 이익 수정 방향을 각각 A/B/C 중 어느 쪽 신호인지 표로 판정하세요.
3. 닷컴 비교: 2000년과 현재를 밸류에이션, 이익의 질, 설비투자 자금 조달(자체 현금흐름 대 부채), 통화정책, 수요 집중도와 순환 거래 측면에서 비교하세요. 2000년 통신장비주도 흑자였다는 점을 반영해, 현재 하드웨어 이익이 고객 설비투자에 얼마나 의존하는지 평가하세요.
4. AI 인프라 진단: 하이퍼스케일러 설비투자와 AI 소프트웨어·서비스 매출의 시차를 수치로 제시하고, 설비투자 증가율의 둔화가 하드웨어 매출과 주가에 미치는 영향을 설명하세요.
5. 과거 사례 기준율: 2000~2002년, 2018년 4분기, 2022년, 최근의 모멘텀 언와인드 사례에서 낙폭, 기간, 회복 경로를 비교하세요.
6. 시나리오: A/B/C 각각에 확률, 3~12개월 경로, 확률을 올리거나 내릴 관측 가능한 트리거를 제시하세요. 확률의 합은 100%여야 합니다.
7. 대응: 팩터(가치, 모멘텀, 퀄리티, 저변동성) 노출과 바벨 전략(인프라 병목 해소 기업 + AI 도입 수혜 기업)을 시나리오별로 제시하고, 집중도 리스크와 손실 한도를 관리하는 규칙을 포함하세요.

# 작성 원칙
- 강세 논리와 약세 논리를 각각 가장 강한 형태로 제시한 뒤 판단하세요.
- 사실, 추정, 의견을 구분해 표기하고, 모든 수치에 기준일과 출처를 붙이세요.
- 자체 계산은 계산식을 보이세요.
- 결론을 바꿀 반증 조건을 세 가지 이상 명시하세요.
- 개인 맞춤형 투자 권유가 아닌 일반 분석으로 작성하세요.

# 출력 형식
1. 한 문단 결론: 판정 국면, 확률, 핵심 근거 세 가지
2. 하락 분해 표
3. 국면 판별 표
4. 닷컴 비교 표와 해석
5. AI 인프라 진단
6. 시나리오 표: 확률, 경로, 트리거
7. 팩터·포트폴리오 대응
8. 반증 조건과 모니터링 일정
9. 출처 목록
분량은 A4 3~4쪽, 한국어로 작성하고 전문 용어는 처음 나올 때 영어를 병기하세요.
```

## LLM 프롬프트: 영어 마스터 버전

한국어 버전과 구조와 요구 사항이 동일합니다. 출력 언어를 바꾸려면 마지막 줄만 고치면 됩니다.

```
# Role
You are a senior analyst on a US equity quantitative research desk. You read factor models, positioning and derivatives flows, credit markets, and company financials together. You put evidence and falsification conditions ahead of conclusions.

# Task
As of {ANALYSIS_DATE}, write a report that diagnoses which of three regimes the sell-off in US Nasdaq semiconductor and AI technology stocks most resembles.
(A) Short-term technical correction: driven by flows and momentum unwinding, recovering within weeks
(B) Medium-term reset: a 6-18 month repricing of valuation and funding, with earnings intact
(C) Structural decline: a multi-year fall like the 2000 dot-com collapse, with capex cuts followed by earnings downgrades

# Input data
Use the figures in the block below as primary evidence. If you need a figure that is not in the block, verify it by web search and mark anything you could not verify as "unverified". Do not present figures recalled from memory as fact.
<data>
{index and stock returns, drawdowns from peak, forward P/E, VIX, rates, hyperscaler capex / operating cash flow / bond issuance, AI-related CDS, positioning data}
</data>

# Analysis steps
1. Decompose the decline: split it into four drivers and estimate each one's contribution. (1) Company-specific shocks, (2) positioning and mechanical flows (leveraged ETFs, vol control, CTAs, dealer gamma), (3) macro, rates and policy, (4) AI investment returns and funding structure.
2. Classify the regime: for valuation (forward P/E, PEG, EV/sales), factor crowding (momentum and high-beta), volatility (VIX level and term structure), credit (AI-related CDS and the new-issue market), and earnings revisions, state in a table whether each one signals A, B or C.
3. Compare with the dot-com era: contrast 2000 and today on valuation, earnings quality, capex funding (internal cash flow versus debt), monetary policy, and demand concentration and circular financing. Telecom equipment makers were also profitable in 2000, so assess how much current hardware earnings depend on customer capex.
4. Diagnose AI infrastructure: quantify the lag between hyperscaler capex and AI software and services revenue, and explain how a slowdown in capex growth affects hardware revenue and share prices.
5. Base rates: compare drawdown, duration and recovery path across 2000-2002, Q4 2018, 2022, and the most recent momentum unwinds.
6. Scenarios: for each of A, B and C give a probability, a 3-12 month path, and observable triggers that would raise or lower the probability. Probabilities must sum to 100%.
7. Positioning: propose factor exposures (value, momentum, quality, low volatility) and a barbell (infrastructure bottleneck solvers plus AI adopters) for each scenario, with rules for concentration risk and loss limits.

# Writing rules
- Present the bull case and the bear case each in its strongest form before you judge.
- Label facts, estimates and opinions separately, and attach an as-of date and a source to every figure.
- Show the formula for any calculation of your own.
- State at least three conditions that would change your conclusion.
- Write this as general analysis, not as personalized investment advice.

# Output format
1. One-paragraph conclusion: regime call, probabilities, three key reasons
2. Decline decomposition table
3. Regime classification table
4. Dot-com comparison table and interpretation
5. AI infrastructure diagnosis
6. Scenario table: probability, path, triggers
7. Factor and portfolio positioning
8. Falsification conditions and monitoring calendar
9. Source list
Length: 3-4 pages. Write in English.
```

## 출처와 한계

수치는 2026년 11월 20일 미국 장 마감 기준이며, 일부는 유료 본문을 열지 못해 검색 발췌만 확인했습니다.

### 본문을 확인한 출처

- [파이낸셜뉴스, 11월 21일 시황](https://www.fnnews.com/news/202611210748273869)
- [Bloomingbit, Nasdaq Slides 5.3%](https://en.bloomingbit.io/feed/news/124916)
- [Newsquawk, US Market Wrap 11월 20일](https://www.newsquawk.com/headlines/us-market-wrap-aggressive-equity-sell-off-sees-spx-enter-correction-and-ndx-test-bear-market)
- [24/7 Wall St., 엔비디아 SEC 조사 보도와 주가 경과](https://247wallst.com/investing/2026/11/20/nvidia-stock-plunges-12-after-reuters-reports-an-sec-probe-of-its-accounting-its-nvidias-worst-day-since-deepseek-and-it-has-lost-2-7-trillion-since-october/)
- [Yahoo Finance, 11월 5일 시황](https://finance.yahoo.com/markets/live/stock-market-today-thursday-november-5-dow-sp-500-nasdaq-plunge-chip-stocks-melt-down-193726491.html)
- [NVIDIA, 3분기 회계연도 2027 실적 발표](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2027)
- [Panabee, 엔비디아 3분기 공시 요약](https://www.panabee.com/news/nvidia-earnings-q3-2027): AI 생성 요약이므로 보증·약정 수치는 10-Q 원문 대조가 필요합니다
- [Decoding Discontinuity, 하이퍼스케일러 현금흐름](https://www.decodingdiscontinuity.com/p/hyperscaler-ai-cash-flow): 공개 요약부만 확인
- [BigGo Finance, 골드만삭스의 반도체 과매도 진단](https://finance.biggo.com/news/3cf5156f-0912-4bc1-a6cb-befc6d12a717)
- [Dark Side of the Boom, 노무라 McElligott 노트 요약](https://thedarksideoftheboom.substack.com/p/mcelligott-when-the-machines-are): 공개 요약부만 확인
- [IntuitionLabs, AI 버블과 닷컴 버블 비교](https://intuitionlabs.ai/articles/ai-bubble-vs-dot-com-comparison)

### 검색 발췌만 확인한 출처

- [CNBC, 코어위브 채권 금리와 AI 채권 발행](https://www.cnbc.com/2026/11/06/coreweave-bond-yield-tops-16percent-as-ai-credit-stress-rises.html)
- [CNBC, 모건스탠리의 하이퍼스케일러 채권 견해](https://www.cnbc.com/2026/11/11/morgan-stanley-ai-bonds-hyperscalers-credit.html)
- [华尔街见闻, 모건스탠리 퀀트 전략팀 보고서](https://wallstreetcn.com/articles/3784627)
- [Motley Fool, S&P 글로벌의 2027년 설비투자 전망](https://www.fool.com/investing/2026/09/06/hyperscalers-driving-ai-capex-cash-flow/)
- [Yield Theory, 2027년 설비투자 컨센서스](https://www.yieldtheory.app/research/hyperscaler-capex-2027-forecast)
- [Dollar Liquidity](https://dollarliquidity.com/en/valuation/nasdaq-100-forward-pe)와 [MacroMicro](https://en.macromicro.me/series/23955/nasdaq-100-pe)의 나스닥100 선행 PER
- [CNN, 11월 10일 국채 금리](https://www.cnn.com/2026/11/10/investing/bond-yields-inflation-fed), [CEO Economy, 연준 결정 해설](https://ceoeconomy.com/article/how-to-read-fed-decision-dot-plot)
- [시사저널e, 11월 17일 브리핑](https://www.sisajournal-e.com/news/articleView.html?idxno=425087), [Investing.com, 11월 14일 시황](https://kr.investing.com/news/stock-market-news/article-2175891)
- [Schwab, 11월 19일 시황](https://www.schwab.com/learn/story/market-volatility), [Hedgeye, 7월 모멘텀 언와인드](https://app.hedgeye.com/insights/185196-goldman-s-high-beta-momentum-basket-on-track-for-worst-monthly-perform?type=macro)

### 한계

- SOX 고점 대비 낙폭은 집계처마다 달라 37\~41% 범위로 적었습니다. 37%는 Schwab의 11월 19일 수치에 20일 하락률을 더한 자체 계산입니다.
- 나스닥100 선행 PER은 산출 방식에 따라 18배에서 23배까지 차이가 납니다.
- 닷컴 시기의 반등 폭, 회복 기간, 통신사 부채 조달은 출처를 열지 않은 근사 서술입니다.
- 시나리오 가중치는 주관적 판단입니다. 이 문서는 일반 분석이며 투자 자문이 아닙니다.
