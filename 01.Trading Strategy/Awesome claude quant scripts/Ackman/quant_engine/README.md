# 빌 애크먼 페르소나 퀀트 엔진

[`../Ackman undervalued quant prompt.md`](../Ackman%20undervalued%20quant%20prompt.md)의 5-Step 프레임워크(Quality/Valuation/Catalyst/Risk)를
코드로 구현한 로컬 퀀트 분석 엔진. TOSS 증권 Open API(가격), DART Open API(국내 재무제표),
Yahoo Finance(미국 재무·밸류에이션), 뉴스(NewsAPI/Google News RSS)를 수집해 정량 점수를 산출하고,
DeepSeek LLM으로 빌 애크먼 페르소나의 정성 코멘트를 생성한다. 결과는 MySQL과 `result/*.md`에 저장된다.

## 데이터 흐름

```
TOSS(가격/일봉, KR+US 공용, 키 없으면 MOCK)
DART(KR 재무제표) 또는 Yahoo Finance(US 재무 + 밸류에이션 멀티플)
뉴스(NewsAPI 또는 RSS 폴백)
        │
        ▼
engine/ackman_framework.py  — Quality/Valuation/Catalyst/Risk 정량 스코어링 (각 0~25점)
        │
        ▼
engine/persona_prompt.py    — DeepSeek 호출, 애크먼 페르소나 코멘트 생성
        │
        ▼
MySQL 저장 + result/ackman_report_YYYY-MM-DD.md 출력
```

## 1. 설치

```bash
cd "01.Trading Strategy/Awesome claude quant scripts/Ackman/quant_engine"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. 자격증명 입력 (터미널 대화형)

```bash
python scripts/setup_credentials.py
```

TOSS Client ID/Secret, DART API Key, DeepSeek API Key, MySQL 접속정보를 순서대로 물어보고
프로젝트 루트의 `.env`에 저장한다 (`.gitignore`에 포함되어 커밋되지 않음). 비밀 값은
입력 시 화면에 표시되지 않는다. **모든 항목을 비워두고 엔터만 눌러도 실행 가능** —
아래 "키 없이 로컬 테스트" 참고. 이 스크립트에서만 웹 대시보드 접속 키(`ADMIN_SETUP_KEY`)를
설정할 수 있다 (비워두면 다음 단계에서 자동 생성됨).

## 2-1. 자격증명 입력 (웹 대시보드, 선택)

터미널 대신 브라우저에서 입력하고 싶다면:

```bash
python dashboard/app.py
```

실행하면 터미널에 아래처럼 **바로 클릭/복사 가능한 접속 URL 두 개**가 출력된다 (둘 다
127.0.0.1에만 바인딩되어 외부에서는 접근 불가):

```
자격증명 설정 (비밀 키 필요):
  http://127.0.0.1:8765/admin/setup/<퍼센트 인코딩된 ADMIN_SETUP_KEY>

종목 검색·분석 (키 불필요, 127.0.0.1 로컬 전용):
  http://127.0.0.1:8765/admin/analyze/
```

- 설정 페이지 URL의 키 부분이 `.env`의 `ADMIN_SETUP_KEY`와 정확히 일치해야만 열리고, 다르면 404.
  종목 분석 페이지(`/admin/analyze/`)는 조회 전용이라 키 없이 열린다 — 자세한 내용은 2-2절 참고.
- `ADMIN_SETUP_KEY`에 `#` 같은 URL 예약 문자가 포함되면 브라우저가 그 뒤를 서버로
  아예 보내지 않으므로(fragment 처리), 반드시 퍼센트 인코딩된 형태로 접속해야 한다 —
  터미널에 출력되는 URL은 이미 인코딩되어 있으므로 그대로 쓰면 된다.
- `ADMIN_SETUP_KEY` 자체는 대시보드 화면에서 바꿀 수 없다 (닭이 먼저냐 달걀이 먼저냐
  문제 방지). 변경하려면 `scripts/setup_credentials.py`를 다시 실행하거나 `.env`를 직접 수정.
- 이 키는 소스코드에 하드코딩되어 있지 않다 — 이 저장소는 공개 GitHub 저장소이므로,
  키는 항상 로컬 `.env`(git 추적 제외)에서만 읽는다.
- 대시보드는 각 연동(TOSS/DART/DeepSeek/NewsAPI/MySQL)의 현재 설정 상태를 상단에
  ✅/❌ 배지로 보여준다.

## 2-2. 종목 검색·분석 (웹 대시보드)

설정 페이지 상단의 "종목 분석 페이지로 이동" 링크를 클릭하거나
`http://127.0.0.1:8765/admin/analyze/` 로 직접 접속한다.

**이 페이지는 비밀 키 없이 열린다** (`/admin/setup/<key>`와 달리). 127.0.0.1에만
바인딩되어 외부(LAN/인터넷)에서는 접근할 수 없지만, 실제 API 키·비밀번호가 오가는
설정 페이지와 달리 이쪽은 조회 전용이라 키 없이도 접속 URL이 간단하도록 의도적으로
열어두었다. 같은 PC를 여러 사람이 쓰는 환경이라면 이 점을 감안할 것.

- 검색창에 **티커**(`MSFT`, `005930`) 또는 **종목명**(`Microsoft`, `삼성전자`)을 입력.
  - 국내 종목명은 DART 상장사 목록에서, 해외/티커는 Yahoo Finance 검색 API에서 후보를 찾는다.
  - 검색어가 후보 중 하나와 정확히 일치하면(예: `MSFT`) 바로 분석 결과로 진입하고,
    모호하면(예: `Microsoft`) 후보 목록을 보여주고 클릭해서 선택한다.
- 결과는 Quality/Valuation/Catalyst/Risk 스코어 카드 + 애크먼 페르소나 코멘트로 웹뷰에 렌더링된다
  (터미널 대신 브라우저에서 바로 확인).
- 결과 화면의 **"Markdown으로 저장" / "HTML로 저장"** 버튼으로 리포트를 파일로 다운로드할 수 있다.
  검색 1회당 DeepSeek/TOSS/DART 등 실제 API를 호출하므로(키가 설정된 경우) 비용/횟수에 유의.
- 이 검색 결과는 MySQL에는 저장되지 않는다 — 일괄 실행·DB 적재는 `python main.py`를 사용.
- 종합 점수가 60점 미만(Pass 등급)이면 포지션 비중은 "포지션 없음 — Pass 등급(매수 대상 아님)"으로
  표시된다(0%를 계단식으로 끊는 대신 등급으로 설명). Watch 이상(60점 이상)부터 `X% (상한 20%)` 형식으로 표시.

## 3. MySQL 스키마 적용

```bash
mysql -u root -p < db/schema.sql
```

## 4. 실행

```bash
# 기본값: 애크먼 실제 2026 Q1 13F 상위 보유 종목 (BN, AMZN, UBER, MSFT, QSR, META, HHH, FNMA, FMCC)
python main.py

# 종목/특수상황 지정
python main.py --tickers MSFT,AMZN,UBER,BN,QSR,META,HHH,FNMA,FMCC --special FNMA,FMCC

# 국내 종목 (6자리 코드는 자동으로 KR 마켓으로 인식, DART 재무제표 사용)
python main.py --tickers 005930,000660

# DB/LLM 없이 정량 점수만 로컬 확인
python main.py --no-db --no-llm
```

## 키 없이 로컬 테스트

이 프로젝트는 모든 외부 연동에 **키가 없어도 동작하는 폴백**을 갖추고 있어, 실제 키 발급
전에도 파이프라인 전체를 로컬에서 검증할 수 있다.

| 연동 | 키 없을 때 동작 |
|---|---|
| TOSS Open API | 종목코드 기반 결정론적 합성 일봉(MOCK)을 생성 — 가격/기술적 지표가 실제 시세와 다름에 유의. 키가 있어도 실제 호출이 실패하면(예: 서비스 사전신청 단계) 자동으로 MOCK 폴백 |
| DART Open API | 국내 종목 재무제표 조회를 건너뜀 (미국 종목은 영향 없음, Yahoo Finance만 사용) |
| DeepSeek | LLM 호출을 건너뛰고 정량 점수 기반 템플릿 코멘트로 대체 |
| MySQL | 연결 실패 시 경고만 출력하고 DB 저장 없이 계속 진행 (`--no-db`로 명시적 생략도 가능) |
| Yahoo Finance | 키 불필요 (미국 종목 가격/재무 데이터의 기본 소스) |
| 뉴스 | NewsAPI 키 없으면 Google News RSS로 자동 폴백 (키 불필요) |

즉 키를 하나도 설정하지 않은 상태에서 `python main.py --tickers MSFT --no-db --no-llm`을
실행해도 Yahoo Finance 실데이터 기반 정량 리포트가 출력된다. 단, TOSS 키가 없으면
가격/기술적 지표(52주 고저, RSI, 이평선)는 **합성 데이터**이므로 실제 투자 판단에 쓰지 말 것.

## 프로젝트 구조

```
quant_engine/
├── main.py                    # CLI 오케스트레이터
├── scripts/
│   ├── setup_credentials.py   # 터미널 대화형 키 입력
│   └── env_store.py           # .env 필드 정의 + 로드/저장 공통 로직
├── dashboard/
│   ├── app.py                 # 웹 대시보드 (Flask, 127.0.0.1 전용) — 설정 + 종목 검색/분석
│   └── templates/
│       ├── setup.html         # 자격증명 설정 화면
│       └── analyze.html       # 종목 검색·분석 웹뷰
├── db/
│   ├── schema.sql             # MySQL DDL
│   └── db.py                  # 연결 + upsert 헬퍼
├── clients/
│   ├── toss_client.py         # TOSS Open API (가격/일봉, MOCK 폴백)
│   ├── dart_client.py         # DART Open API (KR 재무제표 + 상장사명 검색)
│   ├── yahoo_client.py        # Yahoo Finance (US 재무/밸류에이션 + 심볼 검색)
│   ├── news_client.py         # 뉴스 헤드라인 (NewsAPI/RSS)
│   └── deepseek_client.py     # DeepSeek 채팅 완성 API
├── engine/
│   ├── technicals.py          # 캔들 → 기술적 지표
│   ├── ackman_framework.py    # 5-Step 정량 스코어링
│   ├── pipeline.py            # 단일 종목 분석 파이프라인 (CLI/대시보드 공용)
│   ├── ticker_resolver.py     # 티커/종목명 검색어 → (ticker, market) 해석
│   └── persona_prompt.py      # 애크먼 페르소나 프롬프트 + MD/HTML 리포트 조립
└── result/                    # 실행별 마크다운 리포트 출력 (git 추적 제외)
```

## 알려진 한계 (MVP 단계)

- DART는 시장 밸류에이션 멀티플(PER/PBR 등)을 제공하지 않아, 국내 종목은 Yahoo의
  `{code}.KS`/`.KQ` 티커로 보완 조회한다. 상장이 없거나 야후 커버리지 밖인 종목은
  해당 지표가 비어있을 수 있다.
- Valuation 단계의 "5년 평균 대비 할인율" 기준(원문 md 2단계)은 무료 데이터 소스로
  안정적인 5년치 히스토리를 구하기 어려워, 절대 PER/PBR 기준으로 근사했다.
- ROIC는 야후가 직접 제공하지 않아 영업이익 기반으로 근사 계산한다.
- DART 재무제표는 종목/연도에 따라 특정 보고서가 조회되지 않을 수 있다(예: 000660 SK하이닉스는
  최근 연도 사업/분기보고서가 조회되지 않는 경우 확인됨). 이 경우 재무 항목이 일부 비어있는 채로
  Yahoo 보완 데이터만 반영되며, 파이프라인이 죽지는 않는다.
- TOSS Open API는 아직 사전 신청 단계라, 발급받은 키로도 실제 호출이 401로 실패할 수 있다 —
  이 경우 자동으로 MOCK 가격 데이터로 폴백한다(터미널에 `[toss] ... MOCK으로 폴백` 로그 출력).
