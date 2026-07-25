---
title: "TimesFM(Time Series Foundation Model)分析ガイド"
description: "Google Researchが開発した時系列予測ファウンデーションモデルの総合分析"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - TimesFM
  - Google Research
  - 時系列予測
  - ファウンデーションモデル
  - ゼロショット予測
tags:
  - 時系列
  - ファウンデーションモデル
  - Google
  - クオンツ
---

# TimesFM(Time Series Foundation Model)分析ガイド

> Google Researchが開発した時系列予測ファウンデーションモデルの総合分析

---

## はじめに

TimesFMはGoogle Researchが開発した時系列予測専用のファウンデーションモデル(Foundation Model)である。

従来の時系列予測は各ドメインごとに個別のモデルを学習する必要があった。小売の需要予測、金融の価格予測、製造設備の異常検知はいずれも別々のデータとモデルを必要としていた。TimesFMはこのパラダイムを変える。1,000億個以上の実データの時系列で事前学習されたこのモデルは、**追加学習なしで(ゼロショット)**新しいドメインの時系列データを即座に予測できる。

ChatGPTがテキストの世界で実現したように、TimesFMは時系列データの世界で「一つのモデルで全てを予測する」というビジョンを実現している。

2024年のICML(国際機械学習会議)で発表された論文*"A decoder-only foundation model for time-series forecasting"*に基づいており、現在の最新バージョンはTimesFM 2.5(2025年9月)である。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| 開発 | Google Research |
| 発表 | ICML 2024 |
| 最新バージョン | TimesFM 2.5(2025年9月) |
| パラメータ数 | 200M(v2.5基準) |
| 事前学習データ | 1,000億個以上の実データ時系列ポイント |
| ライセンス | Apache 2.0 オープンソース(公式Google支援製品ではない) |
| 主な統合先 | BigQuery ML、Google Sheets、Vertex Model Garden |
| GitHub | https://github.com/google-research/timesfm |
| HuggingFace | google/timesfm-2.0-500m-pytorch |

TimesFMは**パッチベースのデコーダー専用(decoder-only)Transformerアーキテクチャ**を採用している。32個の連続した時点(timepoints)を一つのパッチ(patch)としてトークン化して処理する方式で、LLMがテキストトークンを処理する方式と構造的に類似している。

---

## 長所(Pros)

### 1. 優れたゼロショット(Zero-Shot)性能
追加学習なしで新しい時系列データに対して即座に優れた予測を提供する。小売、金融、製造、医療など多様なドメインと時間単位(秒/分/時/日/月/年)で検証された性能を示す。

### 2. 効率的なモデルサイズ
200Mパラメータは最新LLMと比較して非常に小さいサイズである。GPT-4(数千億パラメータ)の1/1000水準でありながら、時系列予測では同等以上の性能を発揮する。

### 3. 長いコンテキスト長のサポート
TimesFM 2.5は最大**16Kコンテキスト長**をサポートする。以前のバージョン(2,048)より約8倍長い時系列データを一度に処理できるため、数年分の日次データを入力として活用できる。

### 4. 確率的予測(Quantile Forecast)のサポート
最大1Kホライズンまでの連続分位数予測(continuous quantile forecast)を提供する30Mの分位数ヘッド(quantile head)を選択的に使用できる。単純な点予測(point forecast)ではなく、信頼区間を含む確率的予測が可能である。

### 5. Googleエコシステムとの統合
- **BigQuery ML**: SQL一行で大規模時系列予測を実行
- **Google Sheets**: スプレッドシートから直接予測機能を活用
- **Vertex Model Garden**: エンタープライズ級MLOpsパイプラインへの統合

### 6. 多様なバックエンドと拡張性
- PyTorchとFlax(JAX)バックエンドの両方をサポート
- マルチGPUトレーニングおよび微調整(fine-tuning)が可能
- HuggingFace Transformers + PEFT(LoRA)による効率的なファインチューニング

### 7. XReg: 共変量(Covariate)サポート
TimesFM 2.5以降、XReg機能により外部変数(天気、イベント、プロモーションなど)を組み合わせた予測が可能になった。

### 8. 継続的な更新
2025年以降、Flaxバージョン、XRegサポート、Agent Skillsなど様々な改善が行われており、コミュニティのPull Requestが積極的に反映されている。

---

## 短所(Cons)

### 1. 公式サポート製品ではない
オープンソースとして公開されているが、**公式にサポートされるGoogle製品ではない**。企業導入時にSLAや公式技術サポートを期待することは難しい。

### 2. 単変量(Univariate)中心
公開されているチェックポイントは単変量時系列予測に最適化されている。複数変数間の相関関係が重要な多変量(multivariate)予測シナリオでは限界がある。

### 3. 依存関係とインストールの問題
JAX、Lingvo、Praxisなど特殊な依存関係がある。
- Pythonバージョン互換性の問題が報告されている
- Colab環境で`lingvo`パッケージのインストール失敗例あり
- 初期設定にかなりの試行錯誤が必要な場合がある

### 4. ブラックボックスモデル
事前学習されたファウンデーションモデルの特性上、**予測の根拠を説明することが難しい**。金融・医療など説明可能性(Explainability)が重要なドメインでは規制リスクが存在する。

### 5. 特定ドメインでの検証不足
電力価格予測など一部のドメインでは、Chronos-BoltやTime-MoEに比べて性能が低いという研究結果がある。導入前に対象ドメインでの検証が必須である。

### 6. リアルタイム処理の制約
大容量時系列データのリアルタイム(real-time)処理には別途サービング基盤の構築が必要である。

---

## 株式・予測市場での活用可能性

### 株式市場予測でのTimesFM

TimesFMは株価予測に直接適用可能な構造を持っている。しかし実際の適用時には以下の点を考慮する必要がある。

**可能性**
- OHLCV(始値/高値/安値/終値/取引量)データを時系列として処理
- ゼロショット予測により個別銘柄の学習なしで即座に予測可能
- 分位数予測により価格範囲および変動性を推定
- BigQuery MLとの連携で大規模な銘柄の一括予測が可能

**限界**
- 株式市場は時系列以外にニュース、開示情報、感情など非構造化データの影響が大きい
- 市場構造の変化(レジームチェンジ)に脆弱な可能性がある
- 取引戦略として直接活用するには追加レイヤー(リスク管理、ポートフォリオ最適化)が必要
- 短期(1〜5日)予測より中長期のトレンド予測に適している可能性がある

**実用的な活用方法**
| 活用事例 | 適合度 | 説明 |
|-----------|--------|------|
| 株価トレンド方向予測 | ★★★☆☆ | 方向性予測は可能だが精度は限定的 |
| 変動性予測 | ★★★★☆ | 分位数予測を活用すると効果的 |
| 需要/売上予測(企業分析) | ★★★★★ | 決算発表前の売上推定に有用 |
| マクロ経済指標予測 | ★★★★☆ | CPI、金利など経済指標の予測 |
| ポートフォリオリバランストリガー | ★★★☆☆ | トレンド転換点の検知に活用 |

### 予測市場(Prediction Market)での活用

#### Polymarketでの直接適用可能性

Polymarketは特定の事象のYES/NO確率を取引する予測市場である。TimesFMが直接有用なカテゴリー:

**高い適合性**
- **経済指標関連マーケット**: 「2025年米国CPI 3%超過?」のようなマーケットで過去のCPI時系列を活用した予測
- **金融イベント**: 「連邦準備制度2025年利下げ回数」など金利パスの予測
- **商品価格**: 原油、金価格関連マーケット

**低い適合性**
- 政治的イベント(選挙結果など)— 時系列より世論調査データの方が適している
- 一回限りの事象(スポーツの結果など)— 時系列パターンが存在しない

**Polymarket活用戦略の例**
```
1. 目標マーケット選定: 「2025年12月米国失業率4.5%超過?」
2. 過去データ収集: FRED APIから月次失業率時系列をダウンロード
3. TimesFM予測実行: 今後6ヶ月の分位数予測
4. 確率変換: 予測分布から閾値超過確率を算出
5. マーケット価格比較: Polymarketの現在価格と比較して価格差の機会を探索
```

#### 国内(韓国)予測市場

韓国ではまだPolymarketのような本格的な予測市場は活性化していない。韓国ではPolymarketのような予測市場は違法である。
- **カカオトーク公開チャットの世論集計**などの非公式予測チャネル
- **証券会社リサーチのコンセンサス** — TimesFMでコンセンサス対比の決算サプライズを予測可能

---

## 競合プロジェクト比較

### グローバル競合モデル

| モデル | 開発 | 国 | パラメータ | オープンソース | ゼロショット | 多変量 | 確率的予測 |
|------|--------|------|----------|----------|--------|--------|-------------|
| **TimesFM 2.5** | Google Research | 米国 | 200M | ○ | ○ | 限定的 | 部分的 |
| TimeGPT | Nixtla | 米国 | 非公開 | ×(商用API) | ○ | ○ | ○ |
| Chronos-Bolt | Amazon | 米国 | 様々 | ○ | ○ | ○ | ○ |
| Moirai | Salesforce | 米国 | 様々 | ○ | ○ | ○ | ○ |
| Time-MoE | 北京航空航天大学 | 中国 | 様々 | ○ | ○ | 部分的 | 限定的 |
| MOMENT | CMU | 米国 | 様々 | ○ | ○ | ○ | 限定的 |
| Lag-Llama | ServiceNow | カナダ | 様々 | ○ | ○ | × | ○ |
| UniTS | 復旦大学 | 中国 | 様々 | ○ | ○ | ○ | 限定的 |
| TimesNet | 同済大学 | 中国 | 様々 | ○ | × | ○ | × |

### 中国の競合プロジェクト詳細分析

#### 1. Time-MoE(Time Mixture of Experts)
- **開発**: 北京航空航天大学(Beihang University)
- **特徴**: Mixture of Experts(MoE)アーキテクチャを時系列に初めて適用
- **強み**: 電力価格予測(Electricity Price Forecasting)でTimesFMを上回る
- **弱み**: 確率的予測機能が限定的、コミュニティ規模が相対的に小さい
- **GitHub**: https://github.com/Time-MoE/Time-MoE

#### 2. UniTS(Universal Time Series)
- **開発**: 復旦大学(Fudan University)
- **特徴**: 単一モデルで予測、分類、異常検知、補間など多様なタスクを処理
- **強み**: マルチタスク学習、多変量サポート
- **弱み**: 特化モデルに対して個別タスク性能が劣る可能性がある
- **備考**: 中国NLP研究陣のLLM方法論を時系列に転用適用

#### 3. TimesNet
- **開発**: 同済大学(Tongji University)
- **特徴**: 1D時系列を2D空間に変換してCNNで処理する独創的アプローチ
- **強み**: 長期予測、短期予測、補間、異常検知、分類など5つのタスク
- **弱み**: ファウンデーションモデルではなくアーキテクチャ研究レベル、ゼロショット不可
- **GitHub**: https://github.com/thuml/Time-Series-Library

#### 4. PatchTST
- **開発**: 清華大学 + IBM Research
- **特徴**: TimesFMと類似したパッチベースのアプローチ、Transformerベース
- **備考**: TimesFMのアーキテクチャ的先行研究とみなせる

#### 5. iTransformer
- **開発**: 中国科学院(Chinese Academy of Sciences)
- **特徴**: Transformerのアテンション機構を時間次元ではなく変数次元に適用
- **強み**: 多変量予測で優れた性能

### 米国/カナダの競合プロジェクト詳細分析

#### 1. Chronos & Chronos-Bolt(Amazon)
- **特徴**: T5アーキテクチャベース、時系列値をトークン化して言語モデルとして処理
- **強み**: 確率的予測の最強者、電力価格予測でTimesFMを上回る
- **弱み**: 推論速度がChronos-Boltで大幅に改善されたが依然として重い
- **特記事項**: AWS SageMaker JumpStartによるワンクリックデプロイをサポート

#### 2. TimeGPT(Nixtla)
- **特徴**: 最初の商用時系列ファウンデーションモデル、API形式で提供
- **強み**: 最も使いやすいインターフェース、Fine-tuningサポート、異常検知を含む
- **弱み**: オープンソースではない、API費用発生、モデル内部構造非公開
- **価格**: 月$29〜$299(2025年基準)

#### 3. Moirai(Salesforce)
- **特徴**: パッチベースのマスキングエンコーダー、多様な頻度(frequency)を一つのモデルで処理
- **強み**: 多変量サポート、確率的予測、多様なモデルサイズ(Small/Base/Large)
- **弱み**: 推論速度、特定ドメインでTimesFMに対する性能劣位

#### 4. MOMENT(CMU)
- **特徴**: 時系列分析のための大型事前学習モデル、マスキング方式を使用
- **強み**: 異常検知、分類、補間など広範なタスク
- **特記事項**: 教師あり学習ベースでファインチューニング時に性能が最大化

### 性能比較(研究結果要約)

| タスク | 1位 | 2位 | TimesFM順位 |
|--------|-----|-----|-------------|
| 長期予測(Long-horizon) | TimesFM | Moirai | **1位** |
| 電力価格予測 | Chronos-Bolt | Time-MoE | 3位 |
| 短期負荷予測 | TimesFM | Chronos | **1位** |
| 月間降水量予測 | TimesFM | SARIMA | **1位**(一部季節) |
| 多変量予測 | Moirai | iTransformer | 下位圏 |
| 異常検知 | MOMENT | UniTS | 対象外 |

---

## 使用開始ガイド

### インストール

```bash
# PyTorchバージョン(推奨)
pip install timesfm[torch]

# JAX/Flaxバージョン
pip install timesfm[jax]
```

### 基本予測の例(PyTorch)

```python
import timesfm
import numpy as np

# モデルのロード
tfm = timesfm.TimesFm(
    hparams=timesfm.TimesFmHparams(
        backend="torch",
        per_core_batch_size=32,
        horizon_len=128,
    ),
    checkpoint=timesfm.TimesFmCheckpoint(
        huggingface_repo_id="google/timesfm-2.0-200m-pytorch"
    ),
)

# 予測の実行
forecast_input = [np.sin(np.linspace(0, 20, 100))]  # 例の時系列
point_forecast, quantile_forecast = tfm.forecast(forecast_input)
```

### BigQuery ML連携

```sql
-- BigQuery MLでTimesFMを活用する例
SELECT *
FROM ML.FORECAST(
  MODEL `project.dataset.timesfm_model`,
  STRUCT(30 AS horizon, 0.9 AS confidence_level)
)
```

---

## 活用ロードマップ(投資関連)

```
Phase 1: データ収集
├── FRED API: マクロ経済時系列(GDP、CPI、失業率)
├── Yahoo Finance / FinanceDataReader: 株価データ
└── DART: 企業四半期実績データ

Phase 2: TimesFM適用
├── ゼロショット予測で基礎性能を測定
├── ドメインデータでLoRAファインチューニング
└── 分位数予測で信頼区間を生成

Phase 3: シグナル生成
├── 予測値対コンセンサス比較
├── Polymarket価格とTimesFM確率の比較
└── リスク調整後リターンの計算

Phase 4: 実戦適用
├── ポートフォリオリバランストリガー
├── オプション戦略(変動性予測活用)
└── 予測市場のアービトラージ
```

---

## 要約比較表

| 特徴 | TimesFM | TimeGPT | Chronos | Moirai | Time-MoE |
|------|---------|---------|---------|--------|----------|
| 開発 | Google | Nixtla | Amazon | Salesforce | 北京航空航天大学 |
| パラメータ | 200M | 非公開 | 様々 | 様々 | 様々 |
| オープンソース | ○ | × | ○ | ○ | ○ |
| ゼロショット | ○ | ○ | ○ | ○ | ○ |
| 多変量 | 限定的 | ○ | ○ | ○ | 部分的 |
| 確率的予測 | ○ | ○ | ○ | ○ | 限定的 |
| Google統合 | ○ | × | × | × | × |
| 推論速度 | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| コミュニティ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |

---

## 結論

TimesFMはGoogle Researchが開発した**軽量化された時系列ファウンデーションモデル**であり、ゼロショット予測性能とGoogleエコシステム統合が主な強みである。200Mパラメータという小さいサイズで優れた性能を発揮し、BigQuery MLによるエンタープライズ級の活用が可能である。

**投資/金融の文脈での活用ポイント**
- 株価よりも**マクロ経済指標、企業売上、需要予測**に適している
- Polymarketなど予測市場で経済指標関連マーケットの確率算出に活用可能
- 単独使用よりLLMベースのニュース感情分析と組み合わせるとシナジーが最大化される

**選択基準**
- BigQuery/GCP環境 → **TimesFM**
- AWS環境 → **Chronos-Bolt**
- APIのみ必要 → **TimeGPT**
- 多変量+確率的予測 → **Moirai**
- 電力/エネルギードメイン → **Time-MoE**

---

## 参考資料

- [GitHubリポジトリ](https://github.com/google-research/timesfm)
- [論文(arXiv)](https://arxiv.org/abs/2310.10688)
- [HuggingFaceチェックポイント](https://huggingface.co/google/timesfm-2.0-200m-pytorch)
- [Google Researchブログ](https://research.google/blog/a-decoder-only-foundation-model-for-time-series-forecasting/)
- [BigQuery ML連携ドキュメント](https://cloud.google.com/bigquery/docs/reference/standard-sql/bigqueryml-syntax-forecast)

---

*最終更新: 2025年6月 | 作成: Vibe Investing Research*
