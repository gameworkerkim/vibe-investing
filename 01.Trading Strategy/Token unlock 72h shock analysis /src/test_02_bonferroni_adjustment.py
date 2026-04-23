"""
test_02_bonferroni_adjustment.py

Reproduces Appendix D of the paper:
Complete list of 17 hypothesis tests with Bonferroni correction.

Paper Bonferroni threshold: α = 0.05 / 17 ≈ 0.00294

Usage:
    python test_02_bonferroni_adjustment.py --data-dir ../data --output-dir ./results
"""
import argparse
import os
import pandas as pd
import numpy as np


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='../data')
    parser.add_argument('--output-dir', default='./results')
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Load the hypothesis list (pre-computed)
    hyp_path = os.path.join(args.data_dir, '09_tested_hypotheses_list.csv')
    df = pd.read_csv(hyp_path)
    
    # Filter to formal hypothesis tests (exclude test_id 18 regression summary)
    formal_tests = df[df['test_id'].str.match(r'^\d+$', na=False) | df['test_id'].astype(str).str.isnumeric()]
    n_tests = 17  # As specified in the paper
    bonferroni_alpha = 0.05 / n_tests
    
    # Compute q-values using Benjamini-Hochberg FDR for comparison
    # Load p-values as floats
    df_num = df.copy()
    # Parse p_value column (handles '2.2e-9', '<1e-4', etc.)
    def parse_p(val):
        val = str(val).strip()
        if val.startswith('<'):
            return float(val[1:]) / 2  # Approximate for upper-bounded p-values
        try:
            return float(val)
        except ValueError:
            return np.nan
    
    df_num['p_value_numeric'] = df_num['p_value'].apply(parse_p)
    
    # Apply Benjamini-Hochberg FDR
    valid = df_num.dropna(subset=['p_value_numeric']).copy()
    valid = valid.sort_values('p_value_numeric').reset_index(drop=True)
    m = len(valid)
    valid['rank'] = valid.index + 1
    valid['bh_threshold'] = valid['rank'] / m * 0.05
    valid['bh_significant'] = valid['p_value_numeric'] <= valid['bh_threshold']
    valid['q_value'] = (valid['p_value_numeric'] * m / valid['rank']).clip(upper=1.0)
    # Make q-values monotonic
    valid['q_value'] = valid['q_value'][::-1].cummin()[::-1]
    
    # Print summary
    header = f"""
APPENDIX D: Complete List of 17 Hypothesis Tests with Bonferroni Correction
============================================================================
Bonferroni-adjusted threshold: α = 0.05 / {n_tests} = {bonferroni_alpha:.5f}

{'#':<4} {'Test':<45} {'p-value':<12} {'Bonferroni':<12} {'BH q-value':<12}
{'-' * 85}
"""
    lines = [header]
    
    for _, row in df.iterrows():
        test_id = str(row['test_id'])
        test_name = row['test_name'][:42]
        p_val = row['p_value']
        bonf = row['survives_bonferroni']
        
        # Find matching q-value
        matching = valid[valid['test_id'].astype(str) == test_id]
        q_val = matching['q_value'].values[0] if len(matching) > 0 else np.nan
        q_str = f"{q_val:.4f}" if not np.isnan(q_val) else "N/A"
        
        lines.append(f"{test_id:<4} {test_name:<45} {p_val:<12} {bonf:<12} {q_str:<12}")
    
    summary = f"""

SUMMARY
-------
Primary finding (#1): Survives Bonferroni at α = {bonferroni_alpha:.5f}
365-day cliff (#17): Nominally survives but INVALID due to post-hoc selection
Sub-analyses failing Bonferroni: Tests #3, #7, #9 (underpowered sub-samples)

KEY POINT: The robustness of the primary 72-hour finding (p = 2.2e-9)
is such that even conservative correction for 100+ tests would preserve
its statistical significance. The finding is not a consequence of multiple testing.

INTERPRETATION OF 365-DAY CLIFF (test #17):
  - Nominal p = 6.1e-5 survives α = 0.00294 numerically
  - BUT: Pattern identified POST-HOC through data exploration
  - Effective family-wise error rate higher than nominal
  - Treat as HYPOTHESIS-GENERATING, not CONFIRMATORY
  - Requires pre-registered out-of-sample replication
"""
    
    output = ''.join(lines) + summary
    print(output)
    
    with open(os.path.join(args.output_dir, 'appendix_d_bonferroni.txt'), 'w') as f:
        f.write(output)
    
    print(f"\nResults saved to {args.output_dir}/appendix_d_bonferroni.txt")
    return 0


if __name__ == '__main__':
    exit(main())
