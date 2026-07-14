---
name: ackman-quant
description: Analyzes a specific US or Korean stock (by ticker or company name) through Bill Ackman's investment persona using this repo's local Ackman Quant Engine (01.Trading Strategy/Awesome claude quant scripts/Ackman/quant_engine) — a Python pipeline that pulls TOSS/DART/Yahoo Finance/news data, computes a Quality/Valuation/Catalyst/Risk score (0-100), and generates Ackman-style commentary via DeepSeek. Use this whenever the user asks to analyze, evaluate, or score a stock "like Bill Ackman", "애크먼 스타일로", "애크먼 관점에서", "빌 애크먼처럼", or asks for a "퀀트 분석"/quant score/저평가 분석 of a specific ticker or company name — even if they don't say "Ackman" by name but are clearly asking this repo's quant engine to evaluate a stock. Don't use this for generic investment advice, unrelated backtests, or requests about other strategies in this repo.
---

# Ackman Quant Engine — 종목 분석 스킬

이 스킬은 이 저장소에 이미 구축된 로컬 퀀트 엔진(`01.Trading Strategy/Awesome claude quant scripts/Ackman/quant_engine`)을
호출해, 사용자가 지목한 종목 하나를 빌 애크먼 페르소나로 분석하고 결과를 채팅에 요약해 보여준다.
새로운 분석 로직을 만들지 않는다 — 이미 검증된 `main.py` CLI와 `engine/ticker_resolver.py`를 그대로 재사용한다.

## 사전 조건 (세션당 한 번만 확인)

`<repo>/01.Trading Strategy/Awesome claude quant scripts/Ackman/quant_engine/.venv`가 있는지 확인한다.
없으면 먼저 그 디렉터리의 `README.md` 1절대로 `python3 -m venv .venv && source .venv/bin/activate &&
pip install -r requirements.txt`를 실행해 준비한다 (일회성 설정, 사용자에게 알리고 진행).

`.env`는 이미 이 환경에 TOSS/DART/DeepSeek/MySQL 키가 설정되어 있다고 가정한다. 만약 실행 결과에
`DEEPSEEK_API_KEY 미설정` 같은 메시지가 보이면, 정성 코멘트 대신 정량 점수만 나온 것이니 사용자에게
`python scripts/setup_credentials.py` 또는 대시보드(`python dashboard/app.py`)로 키를 넣어야 한다고 안내한다.

## 실행 순서

### 1. 무엇을 분석할지 파악

사용자의 요청에서 티커(`MSFT`, `005930`) 또는 종목명(영문/한글, 예: `Microsoft`, `삼성전자`)을 뽑아낸다.
이미 요청 자체에 정확한 6자리 국내 코드나 명확한 티커가 있으면 2단계를 건너뛰고 바로 3단계로 가도 된다.

### 2. 티커/종목명을 실제 티커로 해석

번들된 리졸버 스크립트를 실행한다 (프로젝트 루트 경로와 검색어를 인자로 전달):

```bash
cd "<repo>/01.Trading Strategy/Awesome claude quant scripts/Ackman/quant_engine"
source .venv/bin/activate
python "<이 스킬 디렉터리>/scripts/resolve_ticker.py" "$(pwd)" "<검색어>"
```

`[{"ticker": "MSFT", "name": "Microsoft Corporation", "market": "US"}, ...]` 형태의 JSON을 출력한다.
(국내 종목명은 DART 상장사 목록에서, 그 외는 Yahoo Finance 검색 API에서 후보를 찾는다.)

- **후보 0개**: DART/Yahoo 검색은 한글로 된 해외 기업 이름(예: "테슬라", "엔비디아", "알파벳")을
  이해하지 못해 자주 빈 결과를 준다. 바로 포기하지 말고, 잘 알려진 회사라면 네 지식으로 실제 티커를
  먼저 추측해본 뒤(예: 테슬라→TSLA, 엔비디아→NVDA, 알파벳/구글→GOOGL) 그 티커로 다시
  `resolve_ticker.py`를 돌려 확인하거나, 확신이 있으면 바로 3단계로 진행해도 된다. 정말 모르는
  회사면 그때 사용자에게 정확한 티커를 물어본다.
- **후보 1개**: 바로 3단계로 진행. 사용자에게 다시 확인받을 필요 없음.
- **후보 여러 개**: 티커/종목명/시장을 목록으로 보여주고, 어떤 종목인지 사용자에게 확인받은 뒤 진행.
  (검색어가 후보 중 하나와 정확히 일치하면 — 예: 검색어가 정확히 `MSFT` — 그 후보를 바로 골라도 된다.)

### 3. 분석 실행

같은 디렉터리에서, 저장소의 기존 CLI를 그대로 호출한다 — 새 파이프라인을 짜지 않는다:

```bash
python main.py --tickers <해석된 티커>
```

해당 종목이 애크먼의 실제 비대칭 베팅/특수상황 사례(FNMA, FMCC 등 정부보호관리·규제 촉매가 핵심인
케이스)이거나 사용자가 그런 맥락으로 설명한다면 `--special <티커>`를 추가한다 — Valuation 단계의
FCF Yield/할인율 기준이 우량주 트랙 대신 특수상황 트랙(국채 대비 2배, 더 관대한 할인 기준)으로
바뀐다. 자세한 배경은 `../Ackman undervalued quant prompt.md`의 1.2절 참고.

이 호출은 `.env`에 설정된 실제 TOSS/DART/DeepSeek 키를 사용하고, MySQL에 결과를 저장하며,
`result/`에 리포트 파일도 남긴다 — 다른 실행(대시보드, 반복 CLI 실행)과 동일한 방식이라 기록이 섞여도 문제없다.

MySQL이 안 떠 있으면 `[db] MySQL 연결 실패 — DB 저장 없이 계속 진행합니다` 경고만 찍히고 계속
진행된다 — 이건 실패가 아니라 정상적인 폴백이니 사용자에게 에러처럼 보고하지 않는다.

### 4. 결과를 채팅에 정리해서 보여주기

터미널 원본 출력을 그대로 붙여넣지 말고, 다음을 뽑아 자연스럽게 요약한다 (한국어로):

- 종합 점수(X/100)와 등급(Strong Buy / Buy / Watch / Pass)
- Quality / Valuation / Catalyst / Risk 네 항목 점수와 핵심 근거 1~2개씩
- 포지션 비중 제안 (Pass 등급이면 "포지션 없음"으로 뜨는 게 정상 — 60점 미만은 항상 0%)
- 애크먼 페르소나 코멘트(LLM 생성 논평) 전문 또는 핵심 요지

## 알아둘 점

- TOSS Open API는 아직 사전 신청 단계라, 실제 키가 있어도 가격/기술적 지표(52주 고저, RSI, 이동평균)가
  결정론적 MOCK 데이터일 수 있다. 사용자가 이 숫자로 실제 투자 판단을 하려는 낌새가 보이면 이 점을 짚어준다.
- 국내 종목은 6자리 숫자 코드(예: `005930`), 그 외는 전부 미국/해외 티커로 처리된다.
- 이 스킬은 파이프라인을 새로 만들지 않고 `main.py`/`engine/ticker_resolver.py`를 그대로 부른다 —
  두 파일의 동작이 바뀌면 이 스킬의 안내도 같이 손봐야 한다. 헷갈리면 quant_engine의 `README.md` 확인.
