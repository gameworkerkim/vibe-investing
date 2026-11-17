# WorkBuddy + Futu MCP + Hy4 preview: 홍콩·미국 주식 투자 보조 에이전트 가이드

2026-11-14 기준 · Dennis Kim (김호광)

## 개요

이 프로젝트는 Tencent의 데스크톱 AI 에이전트 워크벤치 WorkBuddy에 Futu(富途) MCP 커넥터와 Tencent Hunyuan의 Hy4 preview 모델을 묶어, 홍콩·미국 주식 투자 보조 에이전트를 만드는 워크플로우다. 사용자가 일상 언어로 지시하면 에이전트가 여러 시장의 시세와 계좌 데이터를 정리하고 거래 세션을 구분해 준다. 사람은 전략과 리스크 관리에 집중하고, 조회·정리·초안 작성은 에이전트에 맡기는 것이 목표다.

이 문서는 첨부된 분석을 뼈대로 하고, 2026년 11월 14일 기준 공개 자료로 수치와 연결 절차를 확인해 보완했다. 확인하지 못한 항목은 본문에 그렇게 표시했다.

## 소개

구성 요소는 세 가지이며, 각각 실행 환경, 두뇌, 손 역할을 맡는다.

| 구성 요소 | 역할 | 핵심 사양 |
| --- | --- | --- |
| [WorkBuddy](https://www.workbuddy.cn/) | 실행 환경. 요청을 분해하고 도구를 호출하며 로컬 파일을 읽고 쓰는 데스크톱 에이전트 | 커넥터는 MCP 기반이며, 데스크톱 앱의 커스텀 커넥터로 임의의 MCP 서버를 추가할 수 있다 ([Tencent Cloud 문서](https://cloud.tencent.com/document/product/1831/134525)) |
| [Hy4 preview](https://huggingface.co/tencent/Hy4-preview) | 두뇌. 계획 수립과 도구 호출을 담당하는 LLM | 총 770B, 토큰당 49B 활성 MoE, 컨텍스트 100만 토큰, Apache 2.0 오픈 웨이트, 2026년 8월 28일 공개 |
| [Futu MCP](https://open.futunn.com/zh-cn/mcp-docs/overview) | 손. 시세·계좌·주문 도구 세트 | Futu가 호스팅하는 HTTP MCP 서비스, 130개 이상 도구, OAuth 2.1 인증 ([Futu 가이드](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010)) |

동작 순서는 단순하다.

1. 사용자가 WorkBuddy 대화창에 자연어로 지시한다.
2. Hy4 preview가 작업을 단계로 나누고 필요한 Futu MCP 도구를 고른다.
3. Futu MCP가 OAuth로 인증된 계정 권한 안에서 시세, 보유 종목, 주문 데이터를 돌려준다.
4. WorkBuddy가 결과를 표, 리포트, 엑셀 같은 로컬 파일로 정리한다.

Futu MCP의 도구는 여섯 범주로 나뉜다.

| 범주 | 도구 수 | 예 |
| --- | --- | --- |
| 실시간 시세·푸시 | 17+ | 실시간 호가, K선, 호가 깊이 |
| 파생상품·전략 | 27+ | 옵션 분석, 변동성, 워런트 알림 |
| 종목 리서치 | 31+ | 재무 데이터, 애널리스트 평가 |
| 거래·주문 관리 | 19+ | 주문, 보유 조회, 주문 수정 |
| 시장 스크리닝 | 43+ | 244개 스크리닝 팩터 |
| 기술 지표·개인화 | 10+ | MACD, KDJ, RSI |

## 장점

**1. 실행형 에이전트와 로컬 처리**

WorkBuddy는 채팅창이 아니라 요청을 스스로 분해하고 도구를 호출해 파일을 만드는 실행형 에이전트다. 과정과 결과를 사용자가 추적하고 검토할 수 있다. 데스크톱 앱이어서 로컬 파일을 직접 읽고 쓰고 스크립트를 실행하므로, 산출물을 내 PC에 두기 쉽다. 다만 모델 추론은 Tencent 클라우드에서 이루어지므로, 프롬프트에 담긴 데이터까지 로컬에 격리되는 것은 아니다.

**2. 에이전트 작업에 맞춰진 모델과 100만 토큰 컨텍스트**

Hy4 preview는 여러 종목의 재무제표와 리서치 노트를 한 번에 올려놓고 처리할 수 있다. Tencent 발표 기준 Terminal-Bench 2.1 점수는 85.4로 전 세대 Hy3의 70.8에서 14.6점 올랐다 ([비교 기사](https://mer.vin/news/tencents-hy4-preview-edges-out-glm-5-3-and-kimi-k3/)). 강한 수치가 터미널 조작, 도구 호출 같은 에이전트 과제에 몰려 있어, 도구 130개를 다루는 이 워크플로우와 잘 맞는다. 이 점수는 제조사 자체 보고치이므로 자기 작업으로 검증하는 편이 안전하다 ([OrcaRouter 분석](https://www.orcarouter.ai/blog/tencent-hy4-preview-launch)).

**3. Futu MCP의 넓은 금융 기능**

시세 조회에서 끝나지 않고 계좌 데이터, 스크리닝, 파생상품 분석, 주문까지 한 커넥터에서 다룬다. 인증이 OAuth 2.1이라 API 키를 파일에 적어 둘 필요가 없다. Futu 안내에 따르면 거래는 기본값이 모의 환경이고, 실거래는 사용자 확인을 거치며, AI는 거래 비밀번호에 접근하지 못하고, 호출 내역이 감사 로그로 남는다 ([Futu 가이드](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010)).

**4. Tencent 생태계 통합과 낮은 진입 비용**

WeChat, QQ, Feishu, DingTalk 등 협업 도구와 연동되어 기존 업무 환경에 붙이기 쉽다. 첨부 분석은 Lite 요금을 월 39위안으로 적었고, 제3자 정리도 39·99·299위안 3단계를 전한다. 다만 Tencent Cloud [과금 문서](https://cloud.tencent.com/document/product/1831/134334)는 2026년 7월 1일부터 개인판을 표준·고급·플래그십 3단계로 개편했다고 적고 있어, 현재 가격은 결제 화면에서 확인해야 한다. 무료판은 매달 500 크레딧을 준다 ([크레딧 정리](https://www.woshipm.com/operate/6458164.html)).

## 단점

아래 1·2·3·5번은 첨부 분석이 사용자 후기를 근거로 제시한 항목이며, 이번 조사에서 원 출처를 따로 확인하지는 못했다.

**1. 데스크톱과 모바일 사이 동기화 부재**

데스크톱에서 만든 파일, 리포트, 앱이 모바일로 실시간 동기화되지 않는다. 모바일 앱은 데스크톱 에이전트를 원격 제어하는 용도에 가깝고, 산출물은 데스크톱에서 확인해야 한다.

**2. 결과물 검증 부재**

에이전트가 완료했다고 보고한 결과가 실제로 맞는지 스스로 검증하지 않는 사례가 보고된다. 이미지 비율을 잘못 만들고도 정확하다고 답하거나 오류를 합리화하는 식이다. 숫자 하나가 틀리면 판단이 틀어지는 투자 보조 도구에서는 가장 큰 리스크다.

**3. 코드와 로직에 대한 과도한 자율성**

코드를 최적화한다며 핵심 오류 처리 로직을 임의로 바꿔 장애를 낸 사례가 있다. 전략이나 리스크 규칙을 스크립트로 두고 에이전트에게 수정을 맡길 때 같은 일이 생길 수 있다.

**4. 비용 예측의 어려움**

Hy4 preview의 WorkBuddy 무료 기간은 2026년 9월 10일에 끝났다 ([공지 보도](https://news.mydrivers.com/1/1147/1147486.htm)). 이후에는 크레딧이 소모되며, 긴 컨텍스트와 반복되는 도구 호출은 짧은 문답보다 훨씬 많이 쓴다 ([요금 안내](https://toolnavs.com/zh/article/1989-workbuddy-mian-fei-ma-tao-can-he-ji-fen-zhe-yang-xuan-geng-sheng-qian)). 첨부 분석은 단순 조회에 실행 모드(Craft)를 쓰면 크레딧이 빨리 줄어든다고 지적한다. 시세 스크리닝처럼 결과가 큰 도구를 반복 호출하는 투자 워크플로우는 특히 그렇다.

**5. 제한적인 파일 형식**

Word, Excel, PPT, MD 수정만 공식 지원하고 PDF 편집은 지원하지 않는다. 리서치 보고서와 공시가 주로 PDF로 배포되는 점을 생각하면 실무에서 걸린다.

**6. preview 모델과 단일 브로커 종속**

Hy4는 아직 preview다. Tencent도 사전·사후 학습에 개선 여지가 크다고 인정한다 ([Tencent Cloud 개발자 글](https://cloud.tencent.com/developer/article/2745909)). 또 이 구성은 Futu 계좌가 있어야만 동작한다.

## 보강할 점

가장 먼저 보강할 것은 신뢰성과 안전성이며, 나머지는 편의와 확장의 문제다.

| 영역 | 보강 방향 |
| --- | --- |
| 신뢰성 | 금융 데이터와 거래 결과에 자동 검증 단계 도입. 주문 전 잔고·포지션 교차 확인, 데이터 타임스탬프 검증 |
| 안전성 | Futu 쪽 확인 절차에 더해, WorkBuddy 쪽에도 에이전트가 고칠 수 없는 리스크 규칙과 전략 로직용 샌드박스 제공 |
| 확장성 | Interactive Brokers, Longbridge 등 다른 브로커 MCP 연동으로 선택권 확대 |
| 동기화 | 데스크톱과 모바일 사이 산출물 클라우드 동기화 |
| 문서 지원 | PDF 읽기와 주석·편집 |
| 모델 유연성 | 작업별 모델 분담. WorkBuddy 모델 목록에는 Hy3, GLM-5.2, Kimi K3도 있으므로 조회는 싼 모델, 분석은 Hy4로 나눌 수 있다 ([모델 목록 소개](https://cloud.tencent.com/developer/article/2733836)) |
| 백테스팅 | 간단한 전략 백테스팅과 시뮬레이션 내장 |

## 유사 프로젝트

유사 프로젝트는 브로커 MCP, 데이터 MCP, 토론형 에이전트, 코드 프레임워크로 나뉜다. 이 프로젝트는 범용 워크벤치 안에서 지시한다는 점이 다르다.

| 프로젝트 | 유형 | 핵심 특징 | 이 프로젝트와의 차이 |
| --- | --- | --- | --- |
| Longbridge MCP | 브로커 공식 MCP | 110개 이상 도구, 미국·홍콩 시장, 실제 주문 라우팅과 포지션 관리, Rust 기반 서버 | Longbridge에 종속되지만 실거래 실행의 안정성에 초점 |
| Webull OpenAPI MCP | 브로커 MCP | 미국, 홍콩, 일본, 싱가포르 등 다중 지역, 거래와 시장 데이터 접근 | Webull 생태계 전용. 범용 에이전트 워크벤치와의 결합은 아님 |
| [通达信 MCP](https://finance.sina.com.cn/wm/2026-06-03/doc-iniacxkh2221676.shtml) | 데이터 MCP | WorkBuddy 커넥터 마켓에 입점한 첫 제3자 금융 데이터 제공자, 도구 10종 | 같은 워크벤치에서 동작하나 데이터·리서치 중심. 계좌·주문은 다루지 않음 |
| [futu-stock-mcp-server](https://github.com/shuizhengqi1/futu-stock-mcp-server) | 커뮤니티 MCP | 로컬 OpenD 게이트웨이를 거쳐 Futu OpenAPI를 MCP로 감싼 오픈소스. 거래 기능을 환경 변수로 켜고 끈다 | 같은 Futu 계좌를 쓰지만 직접 설치·운영해야 함. 통제권은 더 큼 |
| openinvest (Hermes Agent) | AI 투자 에이전트 | 포트폴리오 추적, 실시간 가격, 4개 역할의 LLM 위원회가 토론해 BUY/HOLD/SELL 판단과 메모 작성 | 의사결정 토론 구조에 특화. 이 프로젝트는 실행 워크플로우에 강점 |
| Lumibot | Python 트레이딩 프레임워크 | 백테스팅, 페이퍼 트레이딩, 실브로커 연결까지 전략 수명주기 관리. Alpaca, IB, Tradier 등 다중 브로커 | 코드 기반 전략 개발과 백테스팅에 강점. 노코드 워크벤치와 접근이 다름 |
| TradingAgents | 멀티 에이전트 LLM 프레임워크 | 애널리스트, 강세·약세 연구원, 트레이더, 리스크 팀의 역할 기반 토론 | 연구·데모 목적에 가깝고 실제 브로커 연동이 없음 |

Longbridge, Webull, openinvest, Lumibot, TradingAgents 행은 첨부 분석의 내용을 그대로 옮겼다.

## Getting Started

설치부터 첫 조회까지는 다섯 단계이며, 실거래는 마지막에 따로 켠다. WorkBuddy 메뉴 이름은 버전마다 달라지므로 실제 화면을 기준으로 한다.

### 1. 준비물

- Futu 증권 계좌와 본인 확인 완료. 계좌 개설 가능 여부는 거주 국가에 따라 다르니 먼저 확인한다.
- WorkBuddy 데스크톱 앱. 중국판은 [workbuddy.cn](https://www.workbuddy.cn/), 국제판은 workbuddy.ai에서 받는다. 커스텀 MCP 설정은 데스크톱 앱에서만 되고 웹 버전에는 없다 ([Atlas Cloud 실측](https://www.atlascloud.ai/zh/blog/tips/workbuddy-mcp)).
- 실시간 시세가 필요한 시장의 시세 권한.

### 2. 모델 선택

새 대화를 열고 모델 선택기에서 Hy4 preview를 고른다. 선택기는 보통 대화창 위나 왼쪽 아래의 드롭다운이다 ([CSDN 가이드](https://blog.csdn.net/z17code/article/details/164174326)). 무료 기간이 끝났으니 크레딧 배율을 확인하고, 목록에 정식판 Hy4가 보이면 그쪽을 검토한다.

### 3. Futu MCP 연결

1. 대화창 왼쪽의 + 버튼에서 커넥터를 연다. 목록에 Futu 카드가 있으면 추가 버튼을 누르고 바로 4번으로 간다.
2. 없으면 커스텀 커넥터를 눌러 mcp.json 편집기를 연다.
3. `mcpServers` 아래에 Futu 엔드포인트를 추가하고 저장한다. 기존 항목은 그대로 둔다.
4. 처음 추가하면 신뢰 확인이 뜬다. Trust를 누르고, 상태가 인증 필요로 바뀌면 Connect를 누른다.
5. 브라우저에 열린 Futu OAuth 화면에서 계정을 확인하고 승인한다.
6. WorkBuddy로 돌아와 초록 점과 도구 목록이 보이는지 확인한다.

```json
{
  "mcpServers": {
    "futu-mcp": {
      "type": "http",
      "url": "https://mcp.futunn.com/mcp"
    }
  }
}
```

엔드포인트는 [Futu MCP 문서](https://open.futunn.com/zh-cn/mcp-docs/overview)의 값이고, 설정 형식과 Trust, Connect 흐름은 WorkBuddy에 원격 MCP를 붙이는 [Tencent Ardot 문서](https://docs.ardot.tencent.com/en/ardot-mcp/remote-mcp.html)의 예를 따랐다. Futu가 WorkBuddy 전용 절차를 따로 공개했는지는 확인하지 못했다.

### 4. 첫 프롬프트

읽기 전용 질문으로 시작해 데이터가 맞는지 Futu 앱 화면과 대조한다.

- "텐센트(HK.00700)와 엔비디아(US.NVDA)의 현재가와 오늘 거래량을 표로 정리해 줘. 각 값의 조회 시각도 적어 줘."
- "내 보유 종목을 홍콩과 미국으로 나눠 비중을 계산하고, 지금 각 시장이 정규장인지 장전·장후인지 표시해 줘."
- "홍콩 주식 중 RSI가 30 미만이고 오늘 거래량이 평소의 두 배를 넘는 종목을 찾아 엑셀로 저장해 줘."

### 5. 안전 설정

- [ ] 모의 거래 환경에서 주문 흐름을 끝까지 시험한다. Futu MCP의 기본값이 모의 환경이다.
- [ ] 실거래 전환은 읽기 전용 결과를 여러 날 대조한 뒤에 한다.
- [ ] 주문 전에 종목, 수량, 가격, 계좌를 에이전트가 다시 출력하게 하고 사람이 승인한다.
- [ ] 손절 한도, 종목당 비중 같은 리스크 규칙은 에이전트가 수정하지 못하는 별도 파일에 둔다.
- [ ] Futu의 감사 로그를 주기적으로 확인한다.
- [ ] 조회는 Ask, 설계는 Plan, 파일 생성과 실행만 Craft로 나눠 크레딧을 아낀다.

모드 구분은 첨부 분석에 따른 것이고, 나머지 안전 장치는 [Futu 가이드](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010)에 근거한다.

## 종합 평가

이 조합은 조회, 정리, 리포트 초안 같은 분석 보조에는 지금도 쓸 만하지만, 주문 실행을 맡기기에는 이르다. 에이전트 실행 환경, 오픈 웨이트 모델, 실제 브로커의 도구 세트를 묶어 LLM을 정보 요약기에서 실행 가능한 보조 에이전트로 끌어올리려는 시도라는 점에서 방향은 분명하다.

약한 고리는 브로커 쪽이 아니라 에이전트 쪽에 있다. Futu MCP는 모의 환경 기본값과 사용자 확인을 갖추고 있지만, 에이전트가 틀린 숫자를 맞다고 보고하거나 로직을 임의로 고치는 문제는 그 앞 단계에서 생긴다. 유사 프로젝트가 브로커 API의 안정성이나 코드로 명시한 리스크 관리에 무게를 두는 데 비해, 이 프로젝트의 강점은 통합된 환경에서 편하게 지시할 수 있다는 데 있다. 검증과 가드레일이 보강되면 노코드로 투자 분석 워크플로우를 빠르게 꾸리려는 사용자에게 좋은 선택지가 된다.

이 문서는 공개 정보와 사용자 후기에 기반한 기술 평가이며, 특정 금융 상품이나 투자 전략에 대한 조언이 아니다.

## 출처

- [Futu MCP 개요](https://open.futunn.com/zh-cn/mcp-docs/overview) (Futu OpenAPI 문서)
- [富途AI完整指南](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010) (Futu HK)
- [WorkBuddy 커넥터 문서](https://cloud.tencent.com/document/product/1831/134525), [과금 설명](https://cloud.tencent.com/document/product/1831/134334) (Tencent Cloud)
- [Ardot Remote MCP: WorkBuddy 설정 예](https://docs.ardot.tencent.com/en/ardot-mcp/remote-mcp.html) (Tencent)
- [WorkBuddy MCP 실측](https://www.atlascloud.ai/zh/blog/tips/workbuddy-mcp) (Atlas Cloud)
- [Hy4 preview 발표 정리](https://cloud.tencent.com/developer/article/2733836), [WorkBuddy 탑재 소개](https://cloud.tencent.com/developer/article/2745909) (Tencent Cloud 개발자 커뮤니티)
- [Hy4 preview 모델 카드](https://huggingface.co/tencent/Hy4-preview) (Hugging Face)
- [Hy4 preview 벤치마크 비교](https://mer.vin/news/tencents-hy4-preview-edges-out-glm-5-3-and-kimi-k3/), [OrcaRouter 분석](https://www.orcarouter.ai/blog/tencent-hy4-preview-launch)
- [Hy4 preview 무료 기간 공지 보도](https://news.mydrivers.com/1/1147/1147486.htm) (快科技)
- [通达信 MCP 입점 발표](https://finance.sina.com.cn/wm/2026-06-03/doc-iniacxkh2221676.shtml) (新浪财经)
- [futu-stock-mcp-server](https://github.com/shuizhengqi1/futu-stock-mcp-server) (GitHub)
- 첨부 분석 문서: 단점 1·2·3·5번, 유사 프로젝트 일부, 모드 구분의 근거
