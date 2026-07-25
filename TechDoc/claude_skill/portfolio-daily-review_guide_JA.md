---
title: "portfolio-daily-review インストール・使用ガイド"
description: "ポートフォリオを一日一回チェックし、定量トリガーが発動した際にクオンツ・ニュース・SNSの3つのソースを相互検証して投資判断材料を生成するClaude Skill。"
abstract: |
  本ガイドはportfolio-daily-review Claude Skillのインストールと設定について解説する。このスキルはローカルJSONファイルから保有銘柄を読み込み、毎日定量トリガー(T1~T5)をチェックし、トリガーが実際に発動した場合にのみクオンツ/ニュース/SNSの3ソース完全交差検証を実行する — それ以外はノイズを避けるため沈黙する。SKILL.mdのワークフロー全文、参照ファイル(トリガールール、センチメント解釈ガイド、アクションフレームワーク)、トリガーチェック用Pythonスクリプト、サンプルデータ、カスタマイズポイントを収録する。
summary_for_ai: |
  AIエージェント向け参考情報: このスキルは3つの原則を中心に設計されている。(1)「意味のある変化」の定義はLLMの裁量ではなく定量規則(trigger-rules.md)で固定される、(2)「市場同調フィルター」は銘柄の変動がベンチマークの変動から1.5%p以内であれば簡易報告に格下げする、(3)登録された投資論拠の有効性は価格変動より先にチェックされ、SNSの極端なセンチメントは方向性シグナルではなく潜在的な逆指標として扱われる。出力は明示的に判断材料であり投資助言ではないとされ、各レビューの最終行にはこの免責事項を記載しなければならない。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# portfolio-daily-review インストール・使用ガイド

> ポートフォリオを一日一回チェックし、定量トリガーが発動した際に
> クオンツ・ニュース・SNSの3ソースを相互検証して投資判断材料を
> 生成するClaude Skill
> コンセプト・設計背景は[Claude_skill_guide.md](./Claude_skill_guide.md)第6章を参照

---

## 1. このスキルが行うこと

- **トリガーフレーズ**: 「ポートフォリオチェック」「私のアカウントどう?」「今日のレビュー」「保有銘柄チェック」「リバランスが必要?」「デイリーチェック」
- **核心動作**:
  1. `assets/portfolio.json`から保有銘柄・平均コスト・リスク限度を読み込む(毎回再入力不要)
  2. 現在価格をWeb検索で更新後、**定量トリガー(T1~T5)**を判定
  3. **トリガー未発動→「異常なし」の1行で終了**(ノイズ遮断がこのスキルの第一規則)
  4. 発動時のみクオンツ/ニュース/SNSの3ソースを**独立収集→交差検証マトリクス**
  5. アクション候補(保持/減量/増量/損切り検討/追加観察)+反対論拠+反証条件を提示
  6. `last_review`を更新しレビューログを記録(次回レビューのデルタ計算用)

**3つの設計特徴**

- **「変動」の定義をLLMの裁量に任せない** — trigger-rules.mdの定量規則+判定スクリプトで固定
- **市場同調フィルター** — 銘柄の変動がベンチマークから1.5%p以内であれば「市場同調変動」に格下げし簡易報告のみ(指数下落日ごとに銘柄別の長文分析が氾濫するのを防ぐ)
- **thesis優先** — 価格変動より先に登録された投資論拠の有効性をチェックする。SNSの極端な偏りは逆指標候補としてのみ扱う

---

## 2. インストール方法

3つの方法のうち1つを選択してください。

### 方法A: Claude.ai(Web/アプリ)— 推奨

1. このリポジトリのスキルフォルダ全体をzip圧縮するか、配布された`.skill`ファイルを準備します。
   ```bash
   # フォルダから直接作成する場合(zip = .skillと同じフォーマット)
   zip -r portfolio-daily-review.skill portfolio-daily-review/
   ```
2. Claude.ai→**Settings→Capabilities→Skills**でアップロードします。(有料プラン)
3. アップロード後、新しい会話でトリガーフレーズを話すと自動的に発動します。

### 方法B: Claude Code

個人スキルディレクトリにフォルダごとコピーします:

```bash
cp -r portfolio-daily-review/ ~/.claude/skills/portfolio-daily-review/
```

Claude Code再起動後、自然言語で言及するだけで使用できます。

### 方法C: Claude API

[Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)を参考に
`.skill`パッケージをアップロードすれば、API呼び出しでも同様に動作します。

> **検証のヒント**: インストール後「今使えるスキルを教えて」と聞くと、ロードされているか確認できます。

---

## 3. フォルダ構造

```
portfolio-daily-review/
├── SKILL.md                      # ワークフロー本体(0~5段階)
├── assets/
│   └── portfolio.json            # ポートフォリオ状態(インストール後に自分のものに置き換え)
├── references/
│   ├── trigger-rules.md          # T1~T5の定量トリガー定義
│   ├── sentiment-guide.md        # SNS解釈規則(逆指標・操作チェック)
│   └── action-framework.md       # アクション候補5種のマッピング+出力形式
└── scripts/
    └── check_triggers.py         # トリガー判定スクリプト(実行検証済み)
```

---

## 4. 初期設定(重要)

インストール直後の`assets/portfolio.json`は**サンプルデータ**です。以下の2つの方法で置き換えてください:

**対話で**: 最初のレビューリクエスト時、スキルが保有銘柄・数量・平均コストを尋ねてファイルを埋めます。
または「ポートフォリオを更新して: サムスン電子200株、平均コスト71,000ウォン、...」のように直接話してもかまいません。

**ファイルの直接編集**: 以下のスキーマに従ってください。`thesis`(投資論拠)は必ず記入してください —
アクション判定時に価格より先にチェックされる項目です。

---

## 5. ファイル全文

以下の内容をそのままコピーし、同じフォルダ構造で保存すればスキルが完成します。

### 5.1 SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  ユーザーの投資ポートフォリオを一日一回チェックし、事前に定義された変動
  トリガーが発動した場合、クオンツ分析・市場ニュース・SNSセンチメントの
  3つのソースを統合して投資判断材料を生成するスキル。ユーザーが「ポート
  フォリオチェック」「私のアカウントどう?」「今日のレビュー」「保有銘柄
  チェック」「リバランスが必要?」「デイリーチェック」などを言及した場合は
  必ずこのスキルを使用すること。ポートフォリオ状態はassets/portfolio.json
  から読み込み、ユーザーが銘柄/数量の変更を話した場合、このファイルの更新
  もこのスキルで処理する。
---

# Portfolio Daily Review

## 目的

感情ではなく規則でポートフォリオをチェックする。トリガー未発動なら「異常
なし」の1行で終わり、発動時のみ3ソース(クオンツ/ニュース/SNS)統合評価
を行う。

原則: **トリガーは定量規則で、ソースは独立収集後の交差検証で、
結論はアクション候補+反証条件で。**

## ワークフロー

### 0段階: 状態のロード

`assets/portfolio.json`を読み込む。

- `last_review`が今日の日付であれば: 「今日のレビューは既に完了」を
  知らせ、再実行の有無をユーザーに確認する(1日1回の原則)。
- ファイルが空か`positions`がなければ: ユーザーに保有銘柄・数量・
  平均コストを尋ねてファイルを先に埋める。リスク限度(`risk_limits`)も
  合わせて確認する。
- ユーザーが「サムスン電子50株追加した」といった変更を話したら
  ファイルを更新し、変更内容を要約して確認を得る。

### 1段階: 相場更新とトリガー判定

各ポジションの現在価格をWeb検索で確認する。学習データの記憶で
価格を答えない。

`references/trigger-rules.md`の定量規則(T1~T5)で判定する。
`scripts/check_triggers.py`が実行可能な環境であればスクリプトで判定し、
そうでなければ規則文書に従って手動計算する。

**トリガー未発動時**: 現在価格テーブル+「トリガーなし、アクション不要」
で終了する。不要な分析を生成しない。これがこのスキルの最も重要な規則
である。

### 2段階: 3ソース収集(トリガー発動銘柄のみ)

各ソースを**独立して**収集し、収集段階で互いに混ぜない。

**[A] クオンツ視点**
- 該当銘柄のファクター状態: 1M/3Mモメンタム、セクター相対強度、
  ボラティリティ変化
- 市場レジームとの整合性 — `quant-market-brief`スキルがインストール
  されており、本日のブリーフィングが会話にあればそのレジーム判定を
  再利用する。なければVIX/金利/指数のみで簡易レジームを判定し
  「簡易」であることを表記する。

**[B] 市場ニュース**
- Web検索でトリガー原因のニュースを特定する。
- 一次出典(開示、決算発表、監督機関発表)を優先する。推測的な記事と
  事実を区別して表記する。原因ニュースを特定できなければ「原因不明の
  価格変動」として記録する — これ自体が重要な情報である。

**[C] SNSセンチメント**
- X(Twitter)、Reddit、国内コミュニティの反応の方向性と強度をWeb検索
  で把握する。
- `references/sentiment-guide.md`を必ず先に読む。核心: SNSは
  逆指標になり得る。極端な偏り(恐怖/興奮)はそれ自体がシグナルで
  あり、方向性シグナルとしてそのまま使わない。
- 個別アカウントを特定して引用せず、集計された方向/強度のみを扱う。

### 3段階: 交差検証と統合評価

3つのソースの方向性の一致状況をマトリクスにまとめる:

| ソース | 方向 | 強度 | 核心的根拠 |
|---|---|---|---|
| クオンツ | 肯定/中立/否定 | 強/中/弱 | |
| ニュース | | | 一次出典かどうかを表記 |
| SNS | | | 極端な偏り時は逆指標の可能性を表記 |

- **3つ一致**→信頼度高として表記
- **2:1分裂**→少数意見の根拠を必ず本文に残す
- **ニュース(事実)とクオンツ(価格行動)が衝突**→その事実自体を
  強調する。価格がニュースを先に反映したか、ニュースがまだ価格に
  反映されていないかのどちらかである

### 4段階: アクション候補の提示

`references/action-framework.md`基準で以下の形式を守る:

- **アクション候補**: 保持/減量/増量/損切り検討/追加観察のうち1~2個
- 各候補の**根拠と反対論拠の両方**を明示
- **反証条件**: 「Xが観測されればこの評価は無効」を必ず含める
- 最終決定はユーザーの責任であることを明示する。買い/売りの指示語を
  使わない

### 5段階: 状態の更新

`assets/portfolio.json`の`last_review`を今日の日付に更新し、
`review_log`配列に要約1行を追加する(次回レビューの「前日との
デルタ」計算に使用)。ログは最新10件のみ保持する。

## ガイドライン

- トリガーがなければ沈黙する。毎日長文の分析を出すことはノイズである。
- 3つのソースの重みを任意に決めない。不一致は不一致として報告する。
- すべての数値に照会時刻を明記する。
- リスク限度(T3)違反は他のすべてのトリガーより先に、目立つように
  報告する。
- このスキルの出力は判断材料であり投資助言ではないことを最終行に
  明示する。
```

### 5.2 assets/portfolio.json(サンプル)

```json
{
  "base_currency": "KRW",
  "last_review": null,
  "risk_limits": {
    "single_position_max_pct": 20,
    "daily_drawdown_alert_pct": -3.0,
    "portfolio_drawdown_alert_pct": -5.0
  },
  "positions": [
    {
      "ticker": "005930.KS",
      "name": "サムスン電子",
      "asset_class": "equity_kr",
      "qty": 100,
      "avg_price": 72000,
      "thesis": "HBMサイクル"
    },
    {
      "ticker": "NVDA",
      "name": "エヌビディア",
      "asset_class": "equity_us",
      "qty": 10,
      "avg_price": 118.5,
      "thesis": "AIインフラcapex"
    },
    {
      "ticker": "BTC",
      "name": "ビットコイン",
      "asset_class": "crypto",
      "qty": 0.5,
      "avg_price": 61000000,
      "thesis": "マクロヘッジ"
    }
  ],
  "review_log": []
}
```

### 5.3 references/trigger-rules.md

```markdown
# 変動トリガーの定義

「変動が生じた」とは以下の定量条件のうち**1つ以上を満たす**ことを意味する。
LLMの主観的判断(「かなり下がった気がする」)をトリガーとして使わない。

| トリガー | 条件 | 優先度 |
|---|---|---|
| **T1** 個別急変動 | 銘柄の日次変動率の絶対値≥3%(クリプトは≥7%) | 中 |
| **T2** ポートフォリオ変動 | 全体評価額の日次変動率の絶対値≥2% | 高 |
| **T3** リスク限度 | `risk_limits`項目違反(比重超過、損失限度到達) | **最高** |
| **T4** イベント | 保有銘柄関連の一次出典による重大ニュース(決算発表/ガイダンス変更、規制、セキュリティ事故・ハッキング、上場廃止/取引停止事案、大規模有償増資・CB) | 高 |
| **T5** ボラティリティジャンプ | 銘柄の歴史的ボラティリティ(20日)が前日比+50%以上 | 中 |

## 判定規則

- 複数トリガー同時発動時は**優先度の高いものから**報告する。
- T3(リスク限度)は他の分析より先に、別途の警告ブロックとして報告する。
- 資産クラス別の閾値差: クリプトは基本ボラティリティが高いため
  T1閾値を7%に上方調整する。ユーザーが`portfolio.json`に
  `trigger_overrides`を追加すればその値を優先する。
- トリガー判定に使用した現在価格と照会時刻を必ず記録する。
- 取引時間中の照会時: 日次変動率は前日終値比で計算し「取引時間中基準」
  と表記する。

## 非トリガー(分析しない場合)

- 指数全体が同じ方向に動き、個別銘柄が単純に同調した場合
  (銘柄の変動率−ベンチマークの変動率の絶対値<1.5%pであれば
  T1が発動していても「市場同調変動」に格下げし簡易報告のみ)
- 出来高が20日平均の50%未満の小幅変動
```

### 5.4 references/sentiment-guide.md

```markdown
# SNSセンチメント解釈ガイド

SNSは情報源であると同時に**群衆心理の温度計**である。方向性シグナルとして
そのまま使ってはならず、以下の規則で解釈する。

## 収集対象

- X(Twitter): 銘柄ティッカー/キーワードの言及量と論調
- Reddit: r/stocks、r/wallstreetbets、銘柄別サブレディット(米国株)
- 国内: 銘柄討論室の雰囲気、主要投資コミュニティ(韓国株)
- クリプト: X+Telegramチャンネルの雰囲気

Web検索で把握可能な範囲までのみ収集する。アクセス不可能なソースは
「確認不可」として記録し推測しない。

## 解釈規則

### 1. 方向と強度を分離する

- 方向: 肯定/中立/否定
- 強度: 弱(通常水準)/中(言及量増加)/強(言及量急増+論調の偏り)

### 2. 極端な偏りは逆指標候補

- **極端な恐怖**(パニック売りの言及、「終わった」論調が支配的): 短期的な
  底のシグナルである可能性
- **極端な興奮**(利益証明の急増、「必ず上がる」論調が支配的): 短期的な
  過熱シグナルである可能性
- どちらの場合もマトリクスに「極端な偏り — 逆指標の可能性」を必ず
  併記する

### 3. 言及量の急増自体がシグナル

論調に関係なく言及量が通常の数倍に急増した場合、ボラティリティ拡大
シグナルとして別途表記する。

### 4. 操作の可能性チェック

- 新規アカウント/ボットパターンの一方向投稿の急増→「ポンプ/FUD
  キャンペーンの可能性」を表記
- 特に小型株・クリプトでは出典不明の好材料/悪材料の噂は一次出典確認
  前まで、ニュース([B]ソース)ではなくSNS([C]ソース)としてのみ
  分類する

### 5. 引用の原則

- 個別アカウント・ユーザーを特定して引用しない
- 集計された方向/強度/言及量の変化のみを報告する
```

### 5.5 references/action-framework.md

````markdown
# アクションフレームワーク

評価結果をアクション候補にマッピングする基準。**候補の提示までにとどめ**、
最終決定はユーザーの責任である。買い/売りの指示語を使わない。

## アクション候補5種

| 候補 | 提示条件(例) |
|---|---|
| **保持** | 3ソースが中立~肯定、thesis(投資論拠)の損傷なし |
| **追加観察** | ソース間で2:1分裂、または原因不明の変動 |
| **減量** | 3ソースが否定で一致+thesis部分損傷、またはT3比重限度超過 |
| **増量** | 3ソースが肯定で一致+価格は下落(先行反映の解消)+限度に余裕あり |
| **損切り検討** | thesis自体を無効化する一次出典の事実が発生(例: 中核事業の規制確定) |

## 出力形式(必須)

各トリガー発動銘柄ごとに:

```
### {銘柄名} ({ティッカー}) — トリガー: {T1~T5}

**交差検証マトリクス**
| ソース | 方向 | 強度 | 核心的根拠 |
|---|---|---|---|
| クオンツ | | | |
| ニュース | | | |
| SNS  | | | |

**一致度**: {3ソース一致/2:1分裂/全面不一致}

**アクション候補**: {1~2個}
- 根拠:
- 反対論拠:

**反証条件**: {Xが観測されればこの評価は無効}

**thesisチェック**: 登録された投資論拠「{thesis}」は{有効/部分損傷/無効化}
```

## 核心原則

1. **thesis優先**: 価格変動より先に投資論拠の有効性をチェックする。
   価格が下落してもthesisが有効であれば「保持+観察」がデフォルトである。
2. **反対論拠必須**: どの候補も反対論拠なしに提示しない。
3. **反証条件必須**: 反証不可能な評価は評価ではない。
4. **限度が王**: T3(リスク限度)違反時は他のソースがいかに肯定的でも
   限度遵守のための候補(減量)を必ず含める。
5. 最終行に告知: 「本レビューは判断材料であり投資助言ではありません。」
````

### 5.6 scripts/check_triggers.py

```python
#!/usr/bin/env python3
"""
ポートフォリオトリガー判定スクリプト。

トリガー定義はreferences/trigger-rules.mdと同期させる必要がある。
使用法:
    python check_triggers.py --portfolio ../assets/portfolio.json --prices prices.json

prices.json形式(ClaudeがWeb検索で収集した現在価格を入れる):
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA":      {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC":       {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
"""

import argparse
import json
import sys
from datetime import date

T1_EQUITY_PCT = 3.0     # 個別急変動(株式)
T1_CRYPTO_PCT = 7.0     # 個別急変動(クリプト)
T2_PORTFOLIO_PCT = 2.0  # ポートフォリオ全体変動
MARKET_SYNC_BAND = 1.5  # 市場同調判定バンド(%p)


def pct(a, b):
    return (a - b) / b * 100.0 if b else 0.0


def check(portfolio: dict, prices: dict) -> dict:
    triggers = []
    total_now, total_prev = 0.0, 0.0
    limits = portfolio.get("risk_limits", {})

    # 評価額の集計
    values = {}
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            triggers.append({"type": "DATA_MISSING", "ticker": t,
                             "msg": "現在価格未確認 — Web検索での収集が必要"})
            continue
        now = p["qty"] * prices[t]["price"]
        prev = p["qty"] * prices[t]["prev_close"]
        values[t] = now
        total_now += now
        total_prev += prev

    # T1 / T5 個別銘柄
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            continue
        d = pct(prices[t]["price"], prices[t]["prev_close"])
        limit = T1_CRYPTO_PCT if p.get("asset_class") == "crypto" else T1_EQUITY_PCT
        if abs(d) >= limit:
            bench = prices[t].get("benchmark_change_pct")
            sync = bench is not None and abs(d - bench) < MARKET_SYNC_BAND
            triggers.append({
                "type": "T1", "priority": "MID", "ticker": t,
                "change_pct": round(d, 2),
                "market_sync": sync,
                "msg": f"{p['name']} 日次 {d:+.2f}%"
                       + (" (市場同調 — 簡易報告)" if sync else ""),
            })

    # T2 ポートフォリオ
    if total_prev:
        pd = pct(total_now, total_prev)
        if abs(pd) >= T2_PORTFOLIO_PCT:
            triggers.append({"type": "T2", "priority": "HIGH",
                             "change_pct": round(pd, 2),
                             "msg": f"ポートフォリオ評価額 日次 {pd:+.2f}%"})

    # T3 リスク限度
    max_pct = limits.get("single_position_max_pct")
    if max_pct and total_now:
        for t, v in values.items():
            w = v / total_now * 100.0
            if w > max_pct:
                triggers.append({"type": "T3", "priority": "CRITICAL", "ticker": t,
                                 "weight_pct": round(w, 1),
                                 "msg": f"{t} 比重 {w:.1f}% > 限度 {max_pct}%"})

    dd = limits.get("portfolio_drawdown_alert_pct")
    if dd is not None and total_prev:
        pd = pct(total_now, total_prev)
        if pd <= dd:
            triggers.append({"type": "T3", "priority": "CRITICAL",
                             "msg": f"ポートフォリオ 日次 {pd:+.2f}% ≤ 損失限度 {dd}%"})

    order = {"CRITICAL": 0, "HIGH": 1, "MID": 2}
    triggers.sort(key=lambda x: order.get(x.get("priority", "MID"), 3))

    return {
        "date": date.today().isoformat(),
        "portfolio_value": round(total_now, 2),
        "portfolio_change_pct": round(pct(total_now, total_prev), 2) if total_prev else None,
        "triggered": bool([t for t in triggers if t["type"].startswith("T")]),
        "triggers": triggers,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--portfolio", required=True)
    ap.add_argument("--prices", required=True)
    args = ap.parse_args()

    with open(args.portfolio, encoding="utf-8") as f:
        portfolio = json.load(f)
    with open(args.prices, encoding="utf-8") as f:
        prices = json.load(f)

    result = check(portfolio, prices)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
```

---

## 6. スクリプト単体テスト

Claudeなしでもトリガー判定ロジックを検証できます:

```bash
cat > prices.json << 'EOF'
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA": {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC": {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
EOF
python3 scripts/check_triggers.py --portfolio assets/portfolio.json --prices prices.json
```

サンプル実行結果: BTC比重86.4%>限度20%→**T3(CRITICAL)最優先ソート**、
サムスン電子-3.12% / NVDA-4.19%→T1発動。優先度ソート(CRITICAL>HIGH>MID)が
正常に動作することを確認しました。

---

## 7. 使用例

```
> 今日のポートフォリオをレビューして

[portfolio-daily-review発動]
1. portfolio.jsonロード→3ポジション、last_review確認
2. 相場Web検索→NVDA -4.2%(T1)、その他はトリガーなし
3. NVDAのみ3ソース収集: クオンツ(モメンタム/セクター相対強度) / ニュース(一次出典) / SNS(方向・強度)
4. 交差検証マトリクス→一致度判定→アクション候補+反証条件
5. thesis「AIインフラcapex」の有効性チェック
6. last_review更新+review_log記録
```

トリガーがない日は:

```
> 今日のポートフォリオをレビューして
現在価格テーブル+「トリガーなし、アクション不要。」(終わり)
```

---

## 8. カスタマイズポイント

| 項目 | 位置 | デフォルト値 | 備考 |
|---|---|---|---|
| 個別急変動の閾値(T1) | trigger-rules.md、check_triggers.py | 株式±3% / クリプト±7% | 両方の同期が必須 |
| ポートフォリオ変動の閾値(T2) | 〃 | ±2% | |
| リスク限度(T3) | portfolio.json `risk_limits` | 比重20% / 日次-3% / 全体-5% | ファイルのみ修正すればよい |
| 市場同調バンド | check_triggers.py `MARKET_SYNC_BAND` | 1.5%p | |
| レビューログ保持件数 | SKILL.md 5段階 | 10件 | |

> **注意**: 閾値変更時は`trigger-rules.md`(Claudeが読む規則)と
> `check_triggers.py`(スクリプト定数)を必ず一緒に修正してください。両者が
> ずれると、スクリプト実行環境と非実行環境で判定が異なります。

---

## 9. quant-market-briefとの併用

```
朝のルーティン:
1. 「今日の市況を要約して」        → quant-market-brief: レジーム判定
2. 「ポートフォリオをレビューして」  → portfolio-daily-review: 同じ会話の
                                       レジーム判定を2段階[A]クオンツソース
                                       で再利用
```

同じ会話で順に実行すればレジームコンテキストが自動連結されます。
ブリーフィングがなければスキルが簡易レジーム判定に代替し「簡易」であることを
表記します。

---

## 10. 注意事項

- 本スキルの出力は**判断材料であり投資助言ではありません。** 最終決定は
  ユーザーの責任です。
- `portfolio.json`には実際の口座番号・証券会社の認証情報などの機密情報を
  入れないでください。銘柄・数量・平均コストのみで十分です。公開リポジトリ
  にコミットする場合、実際のポートフォリオファイルは`.gitignore`処理を
  推奨します。
- スキルはデモ/教育目的であり、実際の使用前に自分の環境で十分にテストして
  ください。
