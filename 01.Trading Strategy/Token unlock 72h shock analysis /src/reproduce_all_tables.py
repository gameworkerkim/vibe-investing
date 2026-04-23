"""
Master Reproduction Script for
"The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance"

Author: HoKwang Kim (Independent Researcher)
Date: April 23, 2026
License: MIT

Usage:
    python reproduce_all_tables.py [--data-dir DATA_DIR] [--output-dir OUTPUT_DIR]

This script runs all analyses reported in the paper and reproduces every
table and statistical result. It depends on the 10 CSV files in /data/.

Requires: numpy, pandas, scipy, statsmodels (see requirements.txt)
"""

import argparse
import os
import sys
import subprocess


TESTS = [
    ("test_01_primary_binomial.py", "Primary binomial test (Table 1)"),
    ("test_02_bonferroni_adjustment.py", "Bonferroni correction (Appendix D)"),
    ("test_03_btc_regime_anova.py", "BTC regime ANOVA (Table 2)"),
    ("test_04_recipient_analysis.py", "Recipient category analysis (Table 3)"),
    ("test_05_multivariate_regression.py", "OLS regression (Table 5)"),
    ("robustness_checks_full.py", "Robustness checks (Section 8, 9 checks)"),
    ("backtest_10_strategies.py", "10 backtest specifications (Appendix E)"),
    ("unl10_strategy_backtest.py", "UNL-10 hybrid strategy (illustrative)"),
]


def run_test(script_name, description, data_dir, output_dir):
    """Run a single test script."""
    print(f"\n{'=' * 70}")
    print(f"RUNNING: {script_name}")
    print(f"PURPOSE: {description}")
    print(f"{'=' * 70}")
    
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    cmd = [sys.executable, script_path, "--data-dir", data_dir, "--output-dir", output_dir]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FAILED: {script_name}")
        print(f"   Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"⚠️  SKIP: {script_name} not found (will be added in next release)")
        return None


def main():
    parser = argparse.ArgumentParser(
        description='Reproduce all results from the Token Unlock 72h Shock paper.'
    )
    parser.add_argument(
        '--data-dir',
        default='../data',
        help='Path to data directory containing CSV files (default: ../data)'
    )
    parser.add_argument(
        '--output-dir',
        default='./results',
        help='Path to output directory for results (default: ./results)'
    )
    parser.add_argument(
        '--skip-backtests',
        action='store_true',
        help='Skip backtest scripts (faster; for quick statistical verification only)'
    )
    args = parser.parse_args()
    
    # Verify data directory
    if not os.path.isdir(args.data_dir):
        print(f"❌ ERROR: Data directory not found: {args.data_dir}")
        sys.exit(1)
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Check required data files
    required_files = [
        "01_binance_token_unlock_events_2023_2025.csv",
        "02_hypothesis_verification_summary.csv",
        "03_recipient_category_analysis.csv",
        "04_btc_relative_performance_matrix.csv",
        "05_unlock_trading_strategies_backtest.csv",
        "06_hourly_prices_events.csv",
        "07_top10_index_constituents.csv",
        "08_eth_prices_events.csv",
        "09_tested_hypotheses_list.csv",
        "10_regression_analysis_inputs.csv",
    ]
    
    missing = [f for f in required_files if not os.path.isfile(os.path.join(args.data_dir, f))]
    if missing:
        print(f"⚠️  WARNING: Missing data files in {args.data_dir}:")
        for f in missing:
            print(f"   - {f}")
        print("   Some analyses may be skipped or produce incomplete results.")
    
    print(f"""
{'*' * 70}
Master Reproduction Script
Paper: The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events
Author: HoKwang Kim (Independent Researcher)
{'*' * 70}
Data directory: {args.data_dir}
Output directory: {args.output_dir}
Python: {sys.version.split()[0]}
""")
    
    # Run each test
    results = {}
    for script_name, description in TESTS:
        if args.skip_backtests and 'backtest' in script_name:
            print(f"\nSKIPPING (--skip-backtests): {script_name}")
            results[script_name] = None
            continue
        
        success = run_test(script_name, description, args.data_dir, args.output_dir)
        results[script_name] = success
    
    # Summary
    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")
    succeeded = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    print(f"Succeeded: {succeeded}")
    print(f"Failed:    {failed}")
    print(f"Skipped:   {skipped}")
    print(f"\nResults written to: {args.output_dir}")
    print(f"\nTo compare with paper tables, see:")
    print(f"  - Table 1: {args.output_dir}/table1_primary_binomial.txt")
    print(f"  - Table 2: {args.output_dir}/table2_btc_regimes.txt")
    print(f"  - Table 3: {args.output_dir}/table3_recipient_categories.txt")
    print(f"  - Table 5: {args.output_dir}/table5_ols_regression.txt")
    print(f"  - Appendix D: {args.output_dir}/appendix_d_bonferroni.txt")
    print(f"  - Appendix E: {args.output_dir}/appendix_e_backtests.txt")


if __name__ == "__main__":
    main()
