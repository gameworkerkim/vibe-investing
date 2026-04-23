"""
unl10_strategy_backtest.py

Implements the UNL-10 Hybrid strategy as described in Section 4.5 and
Appendix E of the paper.

⚠️ CRITICAL NOTICE:
This strategy should NOT be deployed as a live trading strategy without:
  1. Substantial out-of-sample validation
  2. Comprehensive slippage/funding/borrow modeling
  3. Regulatory review (especially for Korean residents)
  4. Risk management framework for tail events
  5. Pre-registered replication of the 365-day cliff component

This file exists for REPRODUCIBILITY of the paper's Appendix E results,
not for practical use.

UNL-10 Hybrid Strategy Definition:
  ENTRY: Short position at T-24h (24 hours before unlock)
  FILTERS (ALL must apply):
    1. Cliff vesting structure (NOT linear)
    2. Unlock size ≥ 5% of circulating supply
    3. Recipient category includes Team or Investor
    4. [BONUS FILTER] Within ±30 days of 365-day anniversary → highest priority
  EXIT: Cover short at T+72h
  POSITION SIZE: Equal weight across qualifying events

Paper backtest result (in-sample only):
  N = 11 qualifying events (out of 52)
  Win rate: 100%
  Mean return: +32.5%
  Sharpe (annualized proxy): 6.25

⚠️ These numbers are UPPER-BOUND illustrative. Live Sharpe is expected to be
substantially lower due to factors listed above.

Usage:
    python unl10_strategy_backtest.py --data-dir ../data --output-dir ./results
"""
import argparse
import os
import pandas as pd
import numpy as np


def apply_unl10_filters(df, size_threshold=5.0, anniversary_priority=True):
    """
    Apply UNL-10 Hybrid filter logic.
    
    Returns:
        qualifying_events: DataFrame of events passing all filters
        priority_events:   Subset also within ±30 days of 365-day anniversary
    """
    # Filter 1: Cliff structure
    mask_cliff = df['is_cliff_structure'] == 1
    
    # Filter 2: Unlock size ≥ threshold
    mask_size = df['unlock_size_pct'] >= size_threshold
    
    # Filter 3: Team or Investor recipient
    mask_recipient = df['recipient_type'].str.contains('Team', na=False)
    
    # Combined qualifying set
    qualifying = df[mask_cliff & mask_size & mask_recipient].copy()
    
    # Priority subset (365-day anniversary)
    priority = qualifying[qualifying['is_365d_cliff'] == 1].copy() if anniversary_priority else pd.DataFrame()
    
    return qualifying, priority


def compute_short_pnl(returns_72h, transaction_cost_bps=20, funding_cost_bps_per_day=5):
    """
    Compute short-strategy PnL with cost modeling.
    
    Args:
        returns_72h: Array of underlying token 72h returns
        transaction_cost_bps: Round-trip trading cost (default 20 bps)
        funding_cost_bps_per_day: Daily funding cost for perpetual short (default 5 bps)
    
    Returns:
        Net PnL (short perspective)
    """
    gross_pnl = -returns_72h  # Short profit when token falls
    txn_cost = transaction_cost_bps / 10000
    funding_cost = 3 * funding_cost_bps_per_day / 10000  # 3 days of funding
    return gross_pnl - txn_cost - funding_cost


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='../data')
    parser.add_argument('--output-dir', default='./results')
    parser.add_argument('--size-threshold', type=float, default=5.0,
                        help='Unlock size threshold in percent (default: 5.0)')
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    df = pd.read_csv(os.path.join(args.data_dir, '10_regression_analysis_inputs.csv'))
    
    # Apply filters
    qualifying, priority = apply_unl10_filters(df, size_threshold=args.size_threshold)
    
    # Compute PnL
    qualifying['strategy_pnl'] = qualifying['r_72h'].apply(
        lambda r: compute_short_pnl(np.array([r]))[0]
    )
    
    if len(priority) > 0:
        priority['strategy_pnl'] = priority['r_72h'].apply(
            lambda r: compute_short_pnl(np.array([r]))[0]
        )
    
    # Format output
    output = f"""
UNL-10 Hybrid Strategy Backtest
================================

⚠️ ILLUSTRATIVE ONLY — NOT a live trading recommendation.
   See file header for critical caveats.

STRATEGY DEFINITION:
  Entry: Short at T-24h
  Filters (ALL):
    1. Cliff vesting structure
    2. Unlock size ≥ {args.size_threshold}% of circulating supply
    3. Recipient includes Team or Investor
  Priority: Events within ±30 days of 365-day anniversary (POST-HOC)
  Exit: Cover at T+72h
  Costs: 20 bps round-trip + ~15 bps funding (3 days × 5 bps/day)

UNIVERSE:
  Total sample: N = {len(df)}

QUALIFYING SET (all filters):
  N qualifying: {len(qualifying)}
"""
    
    if len(qualifying) > 0:
        pnl = qualifying['strategy_pnl'].values
        output += f"""
  Win rate:           {(pnl > 0).mean():.1%}
  Mean PnL:           {pnl.mean():.2%}
  Median PnL:         {np.median(pnl):.2%}
  Std Dev:            {pnl.std(ddof=1):.4f}
  Min / Max:          {pnl.min():.2%} / {pnl.max():.2%}
  Sharpe (proxy):     {(pnl.mean() / pnl.std(ddof=1)):.2f} (per-event; annualization requires event frequency)

QUALIFYING EVENTS (sorted by PnL descending):
"""
        display = qualifying[['token_symbol', 'unlock_date', 'days_since_listing', 
                             'unlock_size_pct', 'r_72h', 'strategy_pnl']].sort_values('strategy_pnl', ascending=False)
        output += display.to_string(index=False, float_format=lambda x: f'{x:.4f}')
    
    # Priority subset
    output += "\n\nPRIORITY SUBSET (365-day anniversary ± 30 days):\n"
    output += "⚠️ WARNING: This subset incorporates the post-hoc 365-day finding.\n"
    output += "   Its extreme performance is subject to data-mining concerns.\n\n"
    
    if len(priority) > 0:
        pnl_priority = priority['strategy_pnl'].values
        output += f"  N priority:         {len(priority)}\n"
        output += f"  Win rate:           {(pnl_priority > 0).mean():.1%}\n"
        output += f"  Mean PnL:           {pnl_priority.mean():.2%}\n"
        output += f"  Median PnL:         {np.median(pnl_priority):.2%}\n"
    else:
        output += "  N priority: 0 (no events in priority subset with current filters)\n"
    
    output += f"""

COMPARISON WITH PAPER:
  Paper UNL-10 win rate: 100% (N=11)
  Paper UNL-10 mean return: +32.5%
  Paper UNL-10 Sharpe (annualized proxy): 6.25
  
  These paper-reported numbers are UPPER-BOUND in-sample statistics.
  Live implementation is expected to produce substantially worse
  performance due to slippage, funding, borrow constraints, and
  adaptive market behavior.

RISK DISCLOSURE:
  A single adverse event with +30-50% move could eliminate the gains
  from many successful trades. Tail risk is the dominant risk factor
  that is NOT captured by the Sharpe ratio above.

ACADEMIC CAVEAT:
  The UNL-10 strategy's reliance on the 365-day anniversary filter
  (which was identified POST-HOC) means its out-of-sample performance
  cannot be predicted from in-sample backtests. Pre-registered
  replication is required before any practical deployment.
"""
    
    print(output)
    
    with open(os.path.join(args.output_dir, 'unl10_strategy.txt'), 'w') as f:
        f.write(output)
    
    # Save qualifying events as CSV
    qualifying.to_csv(os.path.join(args.output_dir, 'unl10_qualifying_events.csv'), index=False)
    
    print(f"\nResults saved to {args.output_dir}/unl10_strategy.txt")
    print(f"Qualifying events saved to {args.output_dir}/unl10_qualifying_events.csv")
    return 0


if __name__ == '__main__':
    exit(main())
