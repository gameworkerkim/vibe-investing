"""
backtest_10_strategies.py

Reproduces Appendix E of the paper:
10 illustrative backtest specifications.

⚠️ ILLUSTRATIVE ONLY — These results should NOT be interpreted as live trading
recommendations. See paper Section 7.2 for comprehensive caveats.

Paper results (Table E.1):
  #1 Naive 72h short, all events : 88.5% win, +17.0% mean
  #2 Cliff-only events           : 89.5% win, +18.8% mean
  #3 Unlock size >3%             : 94.1% win, +21.3% mean
  #4 Team+Investor recipients    : 93.5% win, +20.8% mean
  #5 Hybrid 3 filters            : 95.5% win, +23.1% mean
  #6 365-day anniversary cliff   : 100% win, +27.5% mean (POST-HOC - INVALID)
  #7 Exclude Strong Down BTC     : 87.0% win, +14.8% mean
  #8 Large-cap tokens only       : 86.8% win, +16.2% mean
  #9 Small-cap tokens only       : 92.9% win, +19.5% mean
  #10 Naive LONG (control)       : 11.5% win, -17.0% mean

Usage:
    python backtest_10_strategies.py --data-dir ../data --output-dir ./results
"""
import argparse
import os
import pandas as pd
import numpy as np


def short_strategy_return(return_72h, transaction_cost_bps=20):
    """Compute short-strategy return from underlying 72h return.
    
    Entry: short at T-24h
    Exit:  cover at T+72h
    Short PnL: -(token_return) - transaction_cost
    """
    gross_pnl = -return_72h
    cost = transaction_cost_bps / 10000
    return gross_pnl - cost


def long_strategy_return(return_72h, transaction_cost_bps=20):
    """Control: naive long position."""
    cost = transaction_cost_bps / 10000
    return return_72h - cost


def backtest_spec(df, name, filter_func, is_long=False):
    """Run a single backtest spec and return summary."""
    subset = df[filter_func(df)].copy()
    if len(subset) == 0:
        return None
    
    if is_long:
        returns = subset['r_72h'].apply(long_strategy_return)
    else:
        returns = subset['r_72h'].apply(short_strategy_return)
    
    return {
        'Specification': name,
        'N': len(subset),
        'Win Rate': (returns > 0).mean(),
        'Mean Return': returns.mean(),
        'Median Return': returns.median(),
        'Std Dev': returns.std(ddof=1) if len(returns) > 1 else np.nan,
        'Sharpe (annualized proxy)': (returns.mean() / returns.std(ddof=1)) * np.sqrt(122) if len(returns) > 1 and returns.std(ddof=1) > 0 else np.nan,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='../data')
    parser.add_argument('--output-dir', default='./results')
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    df = pd.read_csv(os.path.join(args.data_dir, '10_regression_analysis_inputs.csv'))
    
    # Define 10 backtest specifications
    specs = [
        ("#1 Naive 72h short, all events", lambda d: pd.Series([True] * len(d), index=d.index)),
        ("#2 Cliff-only events", lambda d: d['is_cliff_structure'] == 1),
        ("#3 Unlock size >3%", lambda d: d['unlock_size_pct'] > 3.0),
        ("#4 Team+Investor recipients", lambda d: d['recipient_type'].str.contains('Team', na=False)),
        ("#5 Hybrid: cliff + >3% + Team/Investor", lambda d:
            (d['is_cliff_structure'] == 1) &
            (d['unlock_size_pct'] > 3.0) &
            (d['recipient_type'].str.contains('Team', na=False))),
        ("#6 365-day anniversary cliff ⚠️ POST-HOC", lambda d: d['is_365d_cliff'] == 1),
        ("#7 Exclude Strong Down BTC", lambda d: d['market_return_btc_72h'] > -0.05),
        ("#8 Large-cap tokens (rank <50)", lambda d: d['market_cap_rank_at_event'] < 50),
        ("#9 Small-cap tokens (rank ≥50)", lambda d: d['market_cap_rank_at_event'] >= 50),
    ]
    
    # Run all short strategies + long control
    results = []
    for name, filter_func in specs:
        r = backtest_spec(df, name, filter_func, is_long=False)
        if r:
            results.append(r)
    
    # #10 Long control
    r = backtest_spec(df, "#10 Naive LONG (control)", lambda d: pd.Series([True] * len(d), index=d.index), is_long=True)
    if r:
        results.append(r)
    
    results_df = pd.DataFrame(results)
    
    # Format output
    output = """
APPENDIX E: 10 Illustrative Backtest Specifications
====================================================

⚠️ ILLUSTRATIVE ONLY — These results are provided for completeness and
   reproducibility. They should NOT be interpreted as live trading
   recommendations. See paper Section 7.2 for extensive caveats.

Assumptions:
  - Transaction cost: 20 bps round-trip (10 bps per side)
  - Position: Short at T-24h, cover at T+72h (except #10 which is long)
  - Unleveraged returns reported
  - Zero slippage assumed (SIGNIFICANT LIMITATION for small-cap tokens)
  - Funding costs NOT included (would reduce returns further)

RESULTS:
"""
    
    output += "\n"
    output += results_df.to_string(index=False, float_format=lambda x: f'{x:.4f}' if abs(x) < 10 else f'{x:.1f}')
    output += """

CRITICAL CAVEATS (from paper):

1. These are IN-SAMPLE statistics. No out-of-sample validation has been performed.

2. Specification #5 (Hybrid) has small N. Its high in-sample win rate should be
   interpreted as an UPPER BOUND, not expected future performance.

3. Specification #6 (365-day anniversary) incorporates the post-hoc 365-day
   cliff finding. It is especially subject to data-mining concerns and should
   NOT be viewed as a valid statistical test.

4. Live implementation would likely produce substantially worse performance due to:
     - Slippage (especially for mid/small-cap tokens)
     - Funding costs (asymmetric, particularly for bearish tokens)
     - Borrow availability (for spot shorts)
     - Adaptive market behavior (if pattern becomes widely known)
     - Tail risk (single large adverse move could wipe out many winning trades)
     - Regulatory constraints (e.g., Korean residents face multiple overlapping regimes)

5. The SHARPE RATIO shown is a rough annualized proxy assuming 122 events per year.
   It is NOT directly comparable to traditional Sharpe ratios for continuous strategies.

CONCLUSION:
   Even the "best-performing" in-sample specification provides only weak evidence
   for a live-tradable strategy. The illustrative nature of these results cannot
   be overstated. Treat as academic completeness only.
"""
    
    print(output)
    
    with open(os.path.join(args.output_dir, 'appendix_e_backtests.txt'), 'w') as f:
        f.write(output)
    
    # Also save as CSV for reproduction
    results_df.to_csv(os.path.join(args.output_dir, 'appendix_e_backtests.csv'), index=False)
    
    print(f"\nResults saved to {args.output_dir}/appendix_e_backtests.txt")
    print(f"CSV saved to {args.output_dir}/appendix_e_backtests.csv")
    return 0


if __name__ == '__main__':
    exit(main())
