#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
config.py — SEMICONDUCTOR-QUANT-PROMPTS-V2 검증용 상수 정의
===========================================================
SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11.md 의 모든 수치는 여기에서 나온다.
검증 원칙: "LLM은 엑셀이지 오라클이 아니다" — 규칙은 프롬프트, 숫자는 코드.
"""
from __future__ import annotations

import pandas as pd

# ---------------------------------------------------------------- 기준일
AS_OF = pd.Timestamp("2026-11-09")          # 프롬프트 공통 계약의 기준일
DATA_END = pd.Timestamp("2026-11-06")       # AS_OF 직전 마지막 거래일
BACKTEST_START = pd.Timestamp("2020-01-02") # 백테스트 데이터 시작
EVAL_START = pd.Timestamp("2021-01-01")     # 12M 워밍업 후 평가 시작
IS_END = pd.Timestamp("2024-12-31")         # 워크포워드 인샘플 종료
OOS_START = pd.Timestamp("2025-01-01")      # 아웃오브샘플 시작
STRESS_START = pd.Timestamp("2026-07-01")   # 2026-07 모멘텀 붕괴 스트레스 구간
STRESS_END = pd.Timestamp("2026-08-31")     # (튜닝 금지 구간)

# ---------------------------------------------------------------- 3.1 유니버스
# ticker -> (서브섹터, 이중 노출 {다른 서브섹터: 비중})
UNIVERSE = {
    "NVDA":     ("GPU", {}),
    "AMD":      ("CPU", {"GPU": 0.30}),   # 매출 다수 세그먼트 기준 1차 분류, 이중 노출 표시
    "AVGO":     ("GPU", {}),
    "MRVL":     ("GPU", {}),
    "INTC":     ("CPU", {}),
    "ARM":      ("CPU", {}),
    "QCOM":     ("CPU", {}),
    "MU":       ("MEM", {}),
    "000660.KS": ("MEM", {}),             # SK하이닉스
    "005930.KS": ("MEM", {}),             # 삼성전자 (메모리 순수도 낮음)
    "WDC":      ("STO", {}),
    "STX":      ("STO", {}),
    "SNDK":     ("STO", {}),              # 2025 분할 상장 -> 이전 결측 처리 대상
    "PSTG":     ("STO", {}),
    "NTAP":     ("STO", {}),
}
SECTOR_OF = {t: v[0] for t, v in UNIVERSE.items()}
DUAL_EXPOSURE = {t: v[1] for t, v in UNIVERSE.items()}
SUBSECTORS = ["GPU", "CPU", "MEM", "STO"]

# 사이클 민감도: 메모리·스토리지 ×1.0, GPU·CPU ×0.5 (프롬프트 A 3))
CYCLE_SENSITIVITY = {"GPU": 0.5, "CPU": 0.5, "MEM": 1.0, "STO": 1.0}

# 국면 판정용 메모리·스토리지 업체 (프롬프트 A 2) 재고일수)
REGIME_INV_NAMES = ["MU", "000660.KS", "WDC", "STX"]

# ---------------------------------------------------------------- 프롬프트 A
# 국면별 가중치 (초기값, 합계 100): mom_12_1 / revision / cycle
REGIME_WEIGHTS_A = {
    "R1":  {"mom_12_1": 30, "revision": 50, "cycle": 20},
    "R2":  {"mom_12_1": 45, "revision": 45, "cycle": 10},
    "R3":  {"mom_12_1": 25, "revision": 35, "cycle": 40},
    "R4":  {"mom_12_1": 15, "revision": 35, "cycle": 50},
    "N/A": {"mom_12_1": 40, "revision": 60, "cycle": 0},
}
# cycle 점수 기본값
CYCLE_SCORE = {"R2": 1.0, "R1": 0.5, "R3": -0.5, "R4": -1.0, "N/A": 0.0}

# divergence: rank(mom_12_1) - rank(mom_3m) 상위 20% -> DIVERGENCE_HIGH
DIVERGENCE_TOP_PCT = 0.20

# ---------------------------------------------------------------- 프롬프트 B
# 서브섹터별 가중치 (초기값): revision / quality / value / cycle
SUBSECTOR_WEIGHTS_B = {
    "GPU": {"revision": 40, "quality": 35, "value": 25, "cycle": 0},
    "CPU": {"revision": 50, "quality": 30, "value": 20, "cycle": 0},
    "MEM": {"revision": 40, "quality": 15, "value": 20, "cycle": 25},
    "STO": {"revision": 35, "quality": 20, "value": 35, "cycle": 10},
}
VALUE_TRAP_REV_SIGMA = -1.0    # value 높고 revision < -1σ -> VALUE_TRAP
QM_SIGMA = 1.0                 # quality·revision 동시 +1σ -> QUALITY_MOMENTUM
MIN_ANALYSTS = 5               # 추정 애널리스트 5명 미만이면 revision N/A

# ---------------------------------------------------------------- 프롬프트 C
C_LONG_N = (6, 8)              # 롱 종목 수 6~8
C_SHORT_N = (4, 6)             # 숏 종목 수 4~6
C_GROSS_LONG = 1.20            # 롱 그로스 ≤ 120%
C_GROSS_SHORT = 0.70           # 숏 그로스 ≤ 70%
C_CAP_LONG = 0.20              # 종목 상한 롱 ≤ 20%
C_CAP_SHORT = 0.12             # 종목 상한 숏 ≤ 12%
C_TARGET_VOL = 0.15            # 포트폴리오 목표 변동성 연 15%
C_CROWD_LONG_EXCLUDE = 2.5     # 롱 후보 crowd_z < +2.5
C_CROWD_X75 = (1.5, 2.0)       # +1.5~+2.0 -> ×0.75
C_CROWD_X50 = 2.0              # +2.0 이상 -> ×0.5
C_SUBSECTOR_NET_CAP = 0.25     # 서브섹터 순노출 |net| ≤ 25%
C_SHORT_REV = -0.5             # 숏 (b): revision이 -0.5σ 미만
C_DTC_LIMIT = 5.0              # 숏 금지: days-to-cover > 5
C_BORROW_FEE_LIMIT = 0.05      # 숏 금지: 차입비용 연 5% 초과
# 리스크 트리거 (단계적)
C_TRIGGER_5D = (-0.05, 0.20)   # 팩터 5일 -5% -> 그로스 -20%
C_TRIGGER_10D = (-0.10, 0.40)  # 팩터 10일 -10% -> 그로스 -40%
C_VOL_RATIO = 1.5              # r = σ20/σ90 > 1.5 -> 비중 ×(1/r)
C_STOP_MULT = 2.5              # 손절: -2.5 × σ20 × √5
C_REENTRY_R = 1.2              # 재진입: 중앙값 r < 1.2
C_REENTRY_DAYS = 3             # 3거래일 연속
C_REENTRY_STEP = 0.5           # 줄인 그로스의 50%씩 복원
# crowd_z 구성 요소 가중치 (13F는 최대 20% — 단독 사용 금지)
CROWD_W = {"short_interest": 0.25, "dtc": 0.15, "iv_pct": 0.15,
           "skew": 0.15, "etf_flow": 0.15, "13f": 0.15}

# ---------------------------------------------------------------- 프롬프트 D
D_BASE_W = {"momentum": 40, "value": 20, "quality": 20, "low_vol": 20}
D_TIMING_LOW = {"momentum": 20, "value": 20, "quality": 20, "low_vol": 40}
D_SHARPE_LOW, D_SHARPE_LOW_MONTHS = 0.0, 2   # 샤프 ≤ 0 2개월 연속 -> 저모멘텀
D_SHARPE_HIGH, D_SHARPE_HIGH_MONTHS = 0.3, 2 # 샤프 > 0.3 2개월 연속 -> 복귀
D_OVERLAP_MULT = 0.5                         # Jaccard < 5y평균-1σ -> momentum ×0.5
D_TERCILE = 1 / 3
# 팩터별 리밸런싱: 월말
# 백테스트 비용: 미국 수수료 3bp + 슬리피지 5bp, 숏 차입비용 일할
COST_US = 0.0003 + 0.0005
# ---------------------------------------------------------------- 프롬프트 D — 테일 헤지
H_STRIKE_BUY, H_STRIKE_SELL = 0.90, 0.80    # -10% 매수 / -20% 매도
H_TENOR_M = 3                               # 3개월 풋 스프레드, 월별 롤
H_BUDGET = 0.015                            # 연간 프리미엄 ≤ NAV 1.5%
H_DD_TRIGGER = -0.10                        # 드로다운 -10% -> 명목 ×2
H_SPREAD_COST = 0.5                         # 옵션 매수·매도 스프레드 절반 비용
H_RF = 0.04                                 # 무위험(프리미엄 계산용)

# ---------------------------------------------------------------- 프롬프트 E
# 국면별 크라우딩 임계값: ×0.75 시작 / ×0.5 시작 / 롱 후보 제외
E_THRESHOLDS = {
    "R1":  {"x75": 2.0, "x50": 2.5, "exclude": 3.0},
    "R2":  {"x75": 2.0, "x50": 2.5, "exclude": 3.0},
    "R3":  {"x75": 1.0, "x50": 1.5, "exclude": 2.0},
    "R4":  {"x75": 0.5, "x50": 1.0, "exclude": 1.5},
    "N/A": {"x75": 1.5, "x50": 2.0, "exclude": 2.5},
}
E_MEM_STO_LONG_CAP = 0.40      # R3·R4: 메모리+스토리지 롱 그로스 합 ≤ 40%
E_TRANSITION = 0.5             # 국면 전환 달: 새 임계값 50% 반영

# ---------------------------------------------------------------- 원본(v1) 대조용
V1_GROSS_LONG, V1_N_NAMES, V1_CAP = 1.60, 4, 0.15  # 원본: 롱 160%/4종목/15% 상한 (모순)

# ---------------------------------------------------------------- 출력 JSON 스키마 (3.2)
SCHEMA_KEYS = {
    "as_of", "mode", "regime", "scores", "candidates", "positions",
    "risk_flags", "data_gaps",
}
SCORE_KEYS = {"ticker", "subsector", "dual_exposure", "factor_z", "composite",
              "rank_in_universe", "rationale_codes", "missing"}
FACTOR_Z_KEYS = {"mom_12_1", "mom_3m", "revision", "quality", "value", "cycle"}
