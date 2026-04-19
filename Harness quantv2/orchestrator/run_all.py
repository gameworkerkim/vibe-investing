"""
orchestrator/run_all.py — 전체 파이프라인을 순차 실행

Usage:
  python orchestrator/run_all.py                    # 오늘 날짜로 실행
  python orchestrator/run_all.py --date 2026-04-19  # 특정 날짜
  python orchestrator/run_all.py --skip-llm         # LLM 없이 필터만
  python orchestrator/run_all.py --limit 50         # LLM 토론 대상 수 제한
"""

import argparse
import subprocess
import sys
import datetime as dt
from pathlib import Path


PROJECT_ROOT = Path(__file__).parent.parent


def run_step(script: str, env=None) -> bool:
    path = PROJECT_ROOT / "scripts" / script
    print(f"\n{'='*60}")
    print(f"▶ Running {script}")
    print(f"{'='*60}")
    result = subprocess.run([sys.executable, str(path)], env=env)
    if result.returncode != 0:
        print(f"❌ {script} failed with exit code {result.returncode}")
        return False
    print(f"✅ {script} OK")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=dt.date.today().isoformat())
    parser.add_argument("--skip-llm", action="store_true",
                       help="Skip 04_sentiment_engine and 06_multi_agent_judge (LLM-heavy)")
    args = parser.parse_args()
    
    print(f"🚀 Earnings Momentum Agent — pipeline for {args.date}")
    
    steps = [
        "01_universe_scanner.py",
        "02_fundamental_filter.py",
        "03_technical_filter.py",
    ]
    if not args.skip_llm:
        steps.append("04_sentiment_engine.py")
    steps.append("05_analyst_consensus.py")
    if not args.skip_llm:
        steps.append("06_multi_agent_judge.py")
    steps.append("07_top30_report.py")
    
    for step in steps:
        if not run_step(step):
            print(f"\n⚠️  Pipeline halted at {step}")
            return 1
    
    print(f"\n🎉 Pipeline complete. Check outputs/ directory.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
