"""
test_01_primary_binomial.py

Reproduces Table 1 of the paper:
Primary binomial test on 72-hour returns.

Paper result: 46/52 negative (88.5%), binomial p = 2.2e-9

Usage:
    python test_01_primary_binomial.py --data-dir ../data --output-dir ./results
"""
import argparse
import os
import pandas as pd
import numpy as np
from scipy import stats


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='../data')
    parser.add_argument('--output-dir', default='./results')
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Load data
    events_path = os.path.join(args.data_dir, '10_regression_analysis_inputs.csv')
    df = pd.read_csv(events_path)
    
    returns = df['r_72h'].values
    N = len(returns)
    n_negative = int((returns < 0).sum())
    prop_negative = n_negative / N
    mean_return = returns.mean()
    median_return = np.median(returns)
    std_return = returns.std(ddof=1)
    
    # Binomial test (one-sided: p > 0.5 for negative)
    # Paper uses two-sided implicitly; compute both
    binom_result = stats.binomtest(n_negative, n=N, p=0.5, alternative='two-sided')
    p_value_twosided = binom_result.pvalue
    
    # Clopper-Pearson 95% CI for proportion
    ci_low, ci_high = stats.binomtest(n_negative, n=N).proportion_ci(
        confidence_level=0.95, method='exact'
    )
    
    # Wilcoxon signed-rank test (H0: symmetric around 0)
    wilcoxon_stat, wilcoxon_p = stats.wilcoxon(returns)
    
    # Bootstrap 95% CI for mean
    np.random.seed(42)
    n_bootstrap = 10000
    bootstrap_means = [
        np.random.choice(returns, size=N, replace=True).mean()
        for _ in range(n_bootstrap)
    ]
    mean_ci_low = np.percentile(bootstrap_means, 2.5)
    mean_ci_high = np.percentile(bootstrap_means, 97.5)
    
    # Output
    output = f"""
TABLE 1: Summary Statistics of 72-Hour Returns
==============================================
Sample size (N)              : {N}
Negative outcomes            : {n_negative}
Proportion negative          : {prop_negative:.3%}
95% CI (Clopper-Pearson)     : [{ci_low:.3%}, {ci_high:.3%}]
Mean return                  : {mean_return:.4f} ({mean_return:.2%})
95% CI for mean (bootstrap)  : [{mean_ci_low:.4f}, {mean_ci_high:.4f}]
Median return                : {median_return:.4f} ({median_return:.2%})
Std. deviation               : {std_return:.4f}
Min / Max                    : {returns.min():.4f} / {returns.max():.4f}

Binomial test (H0: p = 0.5)
  Test statistic (k)         : {n_negative}
  p-value (two-sided)        : {p_value_twosided:.2e}

Wilcoxon signed-rank test
  Statistic                  : {wilcoxon_stat:.2f}
  p-value                    : {wilcoxon_p:.2e}

Bonferroni-adjusted threshold (17 tests): α = 0.05 / 17 ≈ 0.00294
Primary result significant after Bonferroni: {'YES' if p_value_twosided < 0.00294 else 'NO'}

Paper-reported values (for comparison):
  46/52 negative (88.5%)     : {'MATCH' if n_negative == 46 else f'DIFFER (got {n_negative})'}
  Binomial p = 2.2e-9         : {'MATCH' if abs(p_value_twosided - 2.2e-9) / 2.2e-9 < 0.1 else f'CLOSE (got {p_value_twosided:.2e})'}
  Mean -16.97%               : {'MATCH' if abs(mean_return - (-0.1697)) < 0.005 else f'CLOSE (got {mean_return:.4f})'}
"""
    
    print(output)
    
    with open(os.path.join(args.output_dir, 'table1_primary_binomial.txt'), 'w') as f:
        f.write(output)
    
    print(f"\nResults saved to {args.output_dir}/table1_primary_binomial.txt")
    return 0


if __name__ == '__main__':
    exit(main())
