# 커뮤니티 평가 루브릭

공유 아티팩트에 대해 대시보드 **불러오기 → 실행·채점** 후 사용 ([SHARE_FORMAT_KR.md](SHARE_FORMAT_KR.md)).

영문: [COMMUNITY_RUBRIC.md](COMMUNITY_RUBRIC.md)

## 검사 (동일 가중)

| ID | Pass 조건 |
|----|-----------|
| `reproducibility` | traceback 없이 실행 종료 |
| `risk_metrics` | `expected.stdout_markers` 문자열이 stdout에 모두 존재 |
| `data_source` | 허용된 `source`가 stdout에 표시 (`expected.source_ok`) |
| `disclosures` | 아티팩트에 비어 있지 않은 `disclosures` 배열 |

점수 = 통과 / 4. **Exit:** 번들 외부형 샘플이 스테이지에서 ≥ 3/4 (보통 Worker Yahoo면 4/4).

## 비교 패널

- 검사별 pass/fail
- 파싱된 `VQ_METRICS` (참고용, 수치 동등 검사 없음)
- 작성자 disclosures / limits

## Non-goals

- 작성자 간 Sharpe 순위
- 서버 채점
- 일자별 equity 비트 동일
