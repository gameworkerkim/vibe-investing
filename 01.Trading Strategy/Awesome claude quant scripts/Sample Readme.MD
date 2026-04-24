# S&P 500 Growth Factor Screener

> 7개 성장 팩터로 S&P 500 종목을 필터링하는 스크리너
> Built by a stock research analyst persona — Apr 2026

## script

당신은 주식 리서치 애널리스트입니다. Growth 팩터 스크리너를 csv로 구현해주세요.

조건:
- 유니버스: S&P500
- 3년 평균 EPS 성장률 > 15%
- 3년 평균 매출 성장률 > 10%
- ROE > 15% (최근 4분기)
- Forward P/E < 40 (성장과 가격의 균형)
- PEG < 1.5
- 현금흐름이 순이익 대비 80% 이상

## 1. Screening Criteria (스크리닝 기준)

| # | 지표 | 임계값 | 의미 |
|---|---|---|---|
| 1 | 3년 평균 EPS 성장률 | **> 15%** | 이익 성장의 지속성 |
| 2 | 3년 평균 매출 성장률 | **> 10%** | 탑라인 성장성 |
| 3 | ROE (TTM) | **> 15%** | 자본 효율성 |
| 4 | Forward P/E | **< 40** | 가격 합리성 (성장 vs 가격 균형) |
| 5 | PEG Ratio | **< 1.5** | 성장 대비 밸류에이션 |
| 6 | CFO / Net Income | **≥ 80%** | 이익의 현금흐름 전환력 (이익 품질) |
| 7 | Universe | S&P 500 | 대형주 안정성 |

## 2. 제공 파일

| 파일 | 용도 |
|---|---|
| `growth_screener.py` | 사용자가 로컬에서 실행하는 스크리너 (yfinance 기반) |
| `sample_growth_screen_results.csv` | 제가 직접 web research로 검증한 후보 14종목 (PASS/FAIL 표시) |
| `Sameple README.md` | 본 문서 |

## 3. Sample CSV 결과 요약

조사한 14개 후보 중 **9개가 모든 기준을 통과**합니다 (2026년 4월 기준):

### ✅ 통과 종목 (9)

| Ticker | Sector | Forward P/E | PEG | ROE | 비고 |
|---|---|---|---|---|---|
| **NVDA** | IT | 23.97 | 0.63 | 101.5% | AI 인프라 절대 강자 |
| **META** | Comm | 22.15 | 1.03 | 30.2% | DCF 강력, 광고 회복 |
| **MSFT** | IT | 24.13 | 0.81 | 34.4% | PEG 빠르게 떨어짐 |
| **AVGO** | IT | 30.19 | 0.73 | 33.4% | VMware 통합 효과 |
| **LLY** | Health | 27.01 | 1.22 | 101.2% | GLP-1 wave |
| **APP** | Comm | 24.35 | 0.81 | 213.0% | AppLovin AXON 광고 AI |
| **NOW** | IT | 21.59 | 0.96 | 15.5% | ROE 임계값 근접 |
| **INTU** | IT | 15.30 | 0.66 | 23.5% | 매출성장 ~13%로 borderline |
| **VRTX** | Health | 22.21 | 0.15 | 22.3% | CASGEVY + Journavx 파이프라인 |

### ❌ 탈락 종목 (5)

| Ticker | 탈락 사유 |
|---|---|
| **ANET** | PEG 1.65~1.88 (>1.5) |
| **NFLX** | PEG 2.18 (5yr EBITDA 기준) — TTM EPS 기준은 1.01로 통과 |
| **GOOGL** | Forward EPS 성장률 ~6-7% (2026 CapEx $175-185B 영향) |
| **MA** | PEG 1.61, EPS/매출 성장 ~13-16% |
| **AXON** | Forward P/E 51.25, TTM ROE 4.5% |

## 4. 로컬 실행 방법

### 환경 준비
```bash
pip install yfinance pandas requests beautifulsoup4 lxml tqdm
```

### 기본 실행 (전체 S&P 500)
```bash
python growth_screener.py
```

### 빠른 테스트 (처음 30개 종목만)
```bash
python growth_screener.py --limit 30
```

### 임계값 커스터마이즈
```bash
python growth_screener.py \
  --min-eps-growth 0.20 \
  --max-forward-pe 30 \
  --max-peg 1.0 \
  --output strict_screen.csv
```

### 출력 파일
- `growth_screen_results.csv` — 모든 기준을 통과한 종목, composite score 순으로 정렬
- `growth_screen_full.csv` — 전체 S&P 500 + 각 기준별 PASS/FAIL 컬럼

## 5. 방법론 노트 (Methodology Notes)

### 데이터 소스
- 본 sample CSV는 **yfinance 차단 환경**으로 인해 제가 web search로 종목별 fundamental을 직접 조회한 결과입니다.
- 주요 출처: **stockanalysis.com, gurufocus.com, financecharts.com, fullratio.com, macrotrends.com, SEC 10-K 공시**.
- 로컬에서 `growth_screener.py`를 실행하면 yfinance가 모든 데이터를 자동 fetch합니다.

### 3년 성장률 계산
- "3년 평균"의 정의는 두 가지가 있습니다:
  - **단순 평균 (Simple Mean of YoY)**: `(g_y1 + g_y2 + g_y3) / 3` ← 본 스크립트 default
  - **연복리 (CAGR)**: `(End / Start)^(1/3) - 1`
- 두 방식은 변동성이 클 때 다른 값을 보입니다. 보수적 평가가 필요하면 CAGR로 변경하세요.

### PEG 계산 차이 주의
- yfinance의 `trailingPegRatio`와 `pegRatio`는 다른 값을 반환할 수 있습니다.
- GuruFocus는 5년 EBITDA 성장률, 다른 곳은 TTM EPS 성장률 또는 NTM 추정치를 사용합니다.
- **NFLX 사례**: TTM EPS 기준 PEG = 1.01 (통과), 5yr EBITDA 기준 PEG = 2.18 (탈락)
- 본 스크립트는 yfinance의 `trailingPegRatio` 우선, 없으면 `pegRatio`를 사용합니다.

### CFO / Net Income 비율
- 본 스크립트는 **최근 회계연도 1년치**를 사용합니다 (TTM 근사).
- 더 정밀한 분석을 원하면 4-quarter rolling sum을 사용하도록 코드를 수정하세요.
- **음수 순이익 처리**: NI ≤ 0이면 비율 계산 skip.

### 일회성 항목
- yfinance의 EPS는 GAAP diluted EPS이며 일회성 비용(impairment, restructuring)을 포함합니다.
- 정확도를 높이려면 adjusted/non-GAAP EPS API (FMP, EOD HD)를 사용하세요.

## 6. 기관/유료 데이터로 업그레이드

본 스크립트는 무료 yfinance를 사용해 빠른 프로토타이핑에 적합합니다. 운용 단계에서는 다음 API들로 교체를 권장합니다:

| 제공자 | 강점 | 가격대 |
|---|---|---|
| **Financial Modeling Prep** | REST API, 깔끔한 fundamental 데이터 | $19~/월 |
| **EOD Historical Data** | 글로벌 커버리지, 사후수정 데이터 | $19~/월 |
| **Polygon.io** | 실시간 + fundamental | $29~/월 |
| **Refinitiv / FactSet** | 기관급 품질, 스크리너 빌더 내장 | 기업 계약 |
| **Bloomberg Terminal** | 모든 기관 표준; EQS 펑크션 | $24K+/년 |

`fetch_metrics()` 함수만 교체하면 동일한 필터/스코어링 로직이 동작합니다.

## 7. 한계 및 주의사항

1. **본 스크리너는 투자 권유가 아니며**, 백테스트 + 정성 분석 + 위험 관리와 결합하여 사용해야 합니다.
2. **Forward P/E와 PEG는 애널리스트 추정치**에 의존하므로 추정치 변경 시 결과가 크게 바뀝니다.
3. **섹터 효과**: 본 기준은 IT/헬스케어에 우호적이고, 금융/유틸리티에는 불리합니다 (특히 PEG 기준).
4. **시점 의존성**: 2026년 4월 기준 데이터입니다. 분기 실적 발표 이후 다시 실행하세요.
5. **Survivorship bias**: 현재 S&P 500 구성 종목만 보므로 과거에 편입/탈락된 종목은 누락됩니다.

---

**Disclaimer**: 본 스크리너 결과는 정보 제공 목적이며 투자 권유가 아닙니다. 모든 투자 결정의 책임은 사용자에게 있습니다.
