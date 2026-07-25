---
title: "iTransformer スタートガイド"
description: "清華大学×アントグループの「反転Transformer」— 多変量時系列予測の新しいパラダイム"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - iTransformer
  - 時系列予測
  - 多変量予測
  - 清華大学
  - アントグループ
tags:
  - 時系列
  - Transformer
  - 機械学習
  - クオンツ
---

# iTransformer スタートガイド

> 清華大学×アントグループの「反転Transformer」— 多変量時系列予測の新しいパラダイム

---

## はじめに

iTransformer(Inverted Transformer)は、清華大学(Tsinghua University)とアントグループ(Alipay)が共同で提案した時系列予測モデルであり、**ICLR 2024 Spotlight**に選出された。

名前の核心は「Inverted(反転)」— Transformerアーキテクチャ自体はそのままに、**データを投入する方向を180度反転させた**。この単純な発想の転換が、多変量時系列予測でSOTAを達成した。

TimesFMが「一つのモデルで全ドメインをカバー」するファウンデーションモデルであるなら、iTransformerは「**変数間の相関関係を最もよく捉える**」多変量特化モデルである。両モデルは目的が異なるため、競合関係にもあり、相互補完関係にもある。

株式銘柄間の相関を捉えるカップリングシグナルを見つけるのが得意である。そのため、価格の非対称性・市場の非効率性を捉え、不均衡から均衡へ戻るタイミングを掴んでトレーディングする際に有効である。セクターローテーションの捕捉や、銘柄間の共分散構造予測によるリバランストリガー生成にも有用である。ただし、手間がかかる。TimesFMに対する優位性があり、両者を組み合わせて使うと有用である。

一行要約: 中原多俊杰，灿若江沙；天下尽英雄，壮如三国。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| 開発 | 清華大学 + アントグループ(Alipay) |
| 発表 | ICLR 2024 Spotlight |
| ライセンス | MIT オープンソース |
| GitHub | https://github.com/thuml/iTransformer |
| pipパッケージ | `pip install iTransformer` |
| 関連ライブラリ | GluonTS(AWS)、NeuralForecast(Nixtla)、Time-Series-Library |

---

## コアアイデア — 何を「反転」させたのか?

### 既存Transformerの問題

既存のTransformerが多変量時系列を処理する際は、**同一時点の複数変数**を一つのトークン(Temporal Token)にまとめていた。例えば電力網データにおいて「午前9時の温度+湿度+風速」を一つのトークンとして処理する方式である。

この方式の問題点:
- 温度(°C)と電力(kWh)のように**物理的な意味と単位が全く異なる値**を強制的に結合すると、意味情報が失われる。
- タイムスタンプ(時刻)自体は、自然言語の単語のように**独立した意味を持たない**。

### iTransformerの解決策

| 区分 | 既存Transformer | iTransformer |
|------|-----------------|--------------|
| **トークン定義** | 各時間ステップを一つのトークンに | **各変数(チャネル)を一つのトークンに** |
| **アテンションの役割** | 時間的依存関係のモデリング | **変数間の多変量相関関係**のモデリング |
| **フィードフォワードの役割** | 各時点の特徴のエンコーディング | **全時系列の表現**のエンコーディング |

つまり、iTransformerは**全時系列を特徴(feature)**として、**各変数をトークン**として扱う。アテンションは「変数Aと変数Bはどんな関係か?」を学習し、FFNは「変数Aの時系列パターンは何か?」を学習する。

---

## 長所(Pros)

### 1. 多変量予測のSOTA性能
複数の実データセットで最先端の性能を達成した。
- GNSS高度時系列: **RMSE 5.1mm、MAE 3.7mm**(PatchTSTと共に1位)
- Traffic、ETTh1、Weatherなどの標準ベンチマークで既存Transformer系モデル全般に対して優位

### 2. Transformerモジュールの修正不要
アテンション、フィードフォワード、レイヤー正規化など**Transformerの基本モジュールを一切修正していない**。データ構成方式のみを再設計したため:
- FlashAttentionなど効率的なアテンション機構をそのままプラグイン可能
- 今後のTransformer改善事項を即座に吸収可能

### 3. 未見の変数への一般化
入力トークン数が柔軟であるため、**変数チャネル数に制限がない**。一部の変数のみで学習した後、学習時に見なかった新しい変数へ一般化できる。

### 4. 長いルックバックウィンドウの活用
ルックバックウィンドウが長くなっても性能低下が少ない。既存のTemporal Transformerはコンテキストが長くなるとむしろノイズが増加する問題があった。

### 5. 豊富なエコシステム統合
- **GluonTS**(AWS) — クラウド時系列パイプライン
- **NeuralForecast**(Nixtla) — TimeGPTと同じエコシステム
- **Time-Series-Library**(清華大学) — 公式ベンチマークライブラリ

---

## 短所(Cons)

### 1. O(N²)の計算複雑度
変数数Nに対して**O(N²)**の複雑度を持つ。数千個のIoTセンサーのように変数が非常に多い場合、メモリと計算コストが指数的に増加する。

### 2. 時間的局所情報の弱化
反転されたフレームワークは変数間の相関関係をよく捉える一方、隣接する時点間の依存性(temporal locality)が弱まる可能性がある。単変量時系列や時間的パターンが重要な場合、通常のTransformerより不利になる場合がある。

### 3. 季節性ノイズへの敏感さ
研究によると、iTransformerは**季節性ノイズ(Seasonality Noise)**に比較的敏感である。強い季節パターンがあるデータ(観光、小売など)では前処理が重要になる。

### 4. 潜在表現の時系列構造の欠如
一部の研究では、標準的なiTransformerが学習した潜在表現が**明確な時系列局所性**を欠く可能性があると指摘されている。隣接する時点の表現が潜在空間で遠く離れて散らばることがある。

### 5. ファウンデーションモデルではない
TimesFMとは異なり、iTransformerは**新しいドメインごとに学習が必要**である。ゼロショット予測を支援せず、各データセットに合わせたファインチューニングが必要である。

---

## インストールと構成

### 環境要件
- Python 3.7以上
- PyTorch 2.3+推奨
- CUDA対応GPU(大規模データセットに推奨)

### 方法1: pipインストール(クイックスタート)

```bash
pip install iTransformer
```

### 方法2: ソースコードインストール(公式実装)

```bash
git clone https://github.com/thuml/iTransformer.git
cd iTransformer

conda create --name itransformer python=3.7
conda activate itransformer
pip install -r requirements.txt
```

### インストール確認

```python
import torch
from iTransformer import iTransformer

print("iTransformer installed successfully!")
print(f"PyTorch version: {torch.__version__}")
```

---

## 使用例

### 基本的な単変量予測

```python
import torch
from iTransformer import iTransformer

model = iTransformer(
    num_variates=1,           # 変数の数
    lookback_len=96,          # 過去データの長さ
    dim=256,                  # モデル次元
    depth=6,                  # Transformerレイヤー数
    heads=8,                  # アテンションヘッド数
    dim_head=64,              # 各ヘッドの次元
    pred_length=24,           # 予測長
    use_reversible_instance_norm=True
)

# 入力: (バッチ、過去長、変数数)
time_series = torch.randn(2, 96, 1)
predictions = model(time_series)
print(f"予測結果: {predictions.shape}")  # (2, 24, 1)
```

### 多変量マルチステップ予測

```python
multi_model = iTransformer(
    num_variates=137,         # Solarデータセットの137変数
    lookback_len=96,
    dim=256,
    depth=6,
    heads=8,
    dim_head=64,
    pred_length=(12, 24, 36, 48),  # 複数の予測長を同時出力
    use_reversible_instance_norm=True
)

multi_input = torch.randn(2, 96, 137)
multi_predictions = multi_model(multi_input)

for pred_len, pred in multi_predictions.items():
    print(f"{pred_len}ステップ予測: {pred.shape}")
```

### iTransformer2D: 時空間デュアルアテンション

変数関係と時系列パターンを**同時に**考慮する必要がある場合(例: 空間的に分散したセンサー):

```python
from iTransformer import iTransformer2D

model_2d = iTransformer2D(
    num_variates=137,
    num_time_tokens=16,       # 時系列を16個の時間トークンに分割
    lookback_len=96,
    dim=256,
    depth=6,
    heads=8,
    dim_head=64,
    pred_length=(12, 24, 36, 48)
)

input_data = torch.randn(2, 96, 137)
predictions_2d = model_2d(input_data)
```

> **iTransformer2Dを選ぶべき場合**: 気象観測所のように空間的に隣接するセンサー群の時系列を予測する場合。変数間アテンションと時間的アテンションの両方を活用し、標準iTransformerより豊かな表現を学習する。

### 公式スクリプトによる学習

```bash
# 多変量予測(Trafficデータセット)
bash ./scripts/multivariate_forecasting/Traffic/iTransformer.sh

# Transformer対iTransformerの性能比較
bash ./scripts/boost_performance/Weather/iTransformer.sh

# 未見の変数への一般化テスト
bash ./scripts/variate_generalization/ECL/iTransformer.sh

# ルックバックウィンドウ拡大の効果テスト
bash ./scripts/increasing_lookback/Traffic/iTransformer.sh

# FlashAttention高速化バージョン
bash ./scripts/efficient_attentions/iFlashTransformer.sh
```

### データセット

公式実験データセットのダウンロード:
- [Google Drive](https://drive.google.com/drive/folders/1ZOYpTUa82_jCcxIdTmyr0LXQfvaM9vIy)
- [Tsinghua Cloud](https://cloud.tsinghua.edu.cn/f/84fbc752d0e94980a610/)

---

## 主要ハイパーパラメータ

| パラメータ | 説明 | 代表値 |
|----------|------|--------|
| `num_variates` | 変数(チャネル)の数 | データセットの特徴数 |
| `lookback_len` | ルックバックウィンドウの長さ | 96、192、336、720 |
| `dim` | モデル隠れ次元 | 256、512 |
| `depth` | Transformerレイヤー数 | 2、3、6 |
| `heads` | アテンションヘッド数 | 4、8 |
| `dim_head` | 各ヘッドの次元 | 64 |
| `pred_length` | 予測長(タプルで複数指定可能) | 24、48、96、192 |
| `use_reversible_instance_norm` | 可逆インスタンス正規化 | True推奨 |

---

## 代表的な活用事例

| 分野 | 説明 | iTransformer適合度 |
|------|------|---------------------|
| GNSS高度時系列 | 衛星ナビゲーションデータ処理 | ★★★★★(共同1位) |
| 電力価格予測 | リアルタイム電力市場予測 | ★★★★☆ |
| 太陽光発電予測 | 日次発電量予測 | ★★★★☆ |
| 高速道路通行量予測 | 交通流予測 | ★★★★★ |
| 石炭層メタン生産予測 | エネルギー採掘生産量 | ★★★★☆ |
| 海面温度予測 | 転移学習と組み合わせた活用 | ★★★★☆ |
| 異常検知 | 多変量時系列の異常検知 | ★★★☆☆ |
| 株式ポートフォリオ分析 | 銘柄間相関の捕捉 | ★★★★☆ |

---

## TimesFM対iTransformer比較

両モデルは目的が異なるため、状況に応じて選択が変わる。

| 基準 | TimesFM | iTransformer |
|------|---------|--------------|
| **モデルタイプ** | ファウンデーションモデル | 特化アーキテクチャ |
| **ゼロショット予測** | ○ | ×(学習が必要) |
| **多変量サポート** | 限定的 | ○(中核的強み) |
| **単変量性能** | ○ | 相対的に劣位 |
| **変数間関係の捕捉** | × | ○ |
| **Googleエコシステム統合** | ○ | × |
| **AWSエコシステム統合** | × | ○(GluonTS) |
| **インストール難易度** | 高(JAX依存) | 低(pip一行) |
| **即時使用可能性** | ○ | × |

**選択ガイド:**
- 新しいドメイン、データ不足 → **TimesFM**(ゼロショット)
- センサー/金融変数間の相関が重要 → **iTransformer**(多変量)
- 両アプローチの組み合わせ: iTransformerでファインチューニングする前にTimesFMでベースラインを確認

---

## 株式・予測市場での活用可能性

### 株式市場でのiTransformer

iTransformerの**変数間相関学習**は金融データに特に有用である。

**強みが発揮されるシナリオ:**
- **セクターローテーション分析**: テック株/エネルギー株/金融株間の相関変化を捕捉
- **ファクターモデル補完**: PBR、PER、ROEなど複数ファクターの相互関係を学習
- **ポートフォリオ最適化**: 銘柄間の共分散構造予測によるリバランストリガー生成
- **ペアトレーディング**: 同一セクター2銘柄のスプレッド予測

**活用例:**
```python
# KOSPI 200銘柄の30日間リターン予測
model = iTransformer(
    num_variates=200,    # 200銘柄
    lookback_len=252,    # 1年間の取引日
    pred_length=20,      # 20取引日(1ヶ月)予測
    dim=512,
    depth=4,
    heads=8,
    dim_head=64,
    use_reversible_instance_norm=True
)
```

### Polymarketでの活用

iTransformerは**複数の経済指標を同時に考慮**できるため、Polymarketの複合マーケットに有利である。

例: 「2025年末の米国景気後退の有無」マーケット
```
入力変数(num_variates=6):
- 失業率
- 10年物金利
- 2年物金利(イールドカーブ)
- ISM製造業PMI
- 消費者信頼感指数
- S&P 500リターン

→ iTransformerが6変数間の相関を学習し、景気後退確率を推定
→ Polymarketの現在価格と比較して価格差の機会を探索
```

---

## 参考資料

- **論文**: [iTransformer: Inverted Transformers Are Effective for Time Series Forecasting (ICLR 2024)](https://arxiv.org/abs/2310.06625)
- **公式コード**: https://github.com/thuml/iTransformer
- **発表スライド**: https://cloud.tsinghua.edu.cn/f/175ff98f7e2d44fbbe8e/
- **ポスター**: https://cloud.tsinghua.edu.cn/f/36a2ae6c132d44c0bd8c/
- **Time-Series-Library**(清華大学公式ベンチマーク): https://github.com/thuml/Time-Series-Library

---

*最終更新: 2025年6月 | 作成: Vibe Investing Research*
