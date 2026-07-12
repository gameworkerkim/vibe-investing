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
아래 "키 없이 로컬 테스트" 참고.

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
| TOSS Open API | 종목코드 기반 결정론적 합성 일봉(MOCK)을 생성 — 가격/기술적 지표가 실제 시세와 다름에 유의 |
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
├── scripts/setup_credentials.py  # 터미널 대화형 키 입력
├── db/
│   ├── schema.sql             # MySQL DDL
│   └── db.py                  # 연결 + upsert 헬퍼
├── clients/
│   ├── toss_client.py         # TOSS Open API (가격/일봉, MOCK 폴백)
│   ├── dart_client.py         # DART Open API (KR 재무제표)
│   ├── yahoo_client.py        # Yahoo Finance (US 재무/밸류에이션)
│   ├── news_client.py         # 뉴스 헤드라인 (NewsAPI/RSS)
│   └── deepseek_client.py     # DeepSeek 채팅 완성 API
├── engine/
│   ├── technicals.py          # 캔들 → 기술적 지표
│   ├── ackman_framework.py    # 5-Step 정량 스코어링
│   └── persona_prompt.py      # 애크먼 페르소나 프롬프트 + 리포트 조립
└── result/                    # 실행별 마크다운 리포트 출력 (git 추적 제외)
```

## 알려진 한계 (MVP 단계)

- DART는 시장 밸류에이션 멀티플(PER/PBR 등)을 제공하지 않아, 국내 종목은 Yahoo의
  `{code}.KS`/`.KQ` 티커로 보완 조회한다. 상장이 없거나 야후 커버리지 밖인 종목은
  해당 지표가 비어있을 수 있다.
- Valuation 단계의 "5년 평균 대비 할인율" 기준(원문 md 2단계)은 무료 데이터 소스로
  안정적인 5년치 히스토리를 구하기 어려워, 절대 PER/PBR 기준으로 근사했다.
- ROIC는 야후가 직접 제공하지 않아 영업이익 기반으로 근사 계산한다.
