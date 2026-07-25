---
title: "Microsoft Qlib スタートガイド — 日本の開発者のための完全版(トスOpen API連携テスト中)"
description: "MicrosoftのオープンソースAI指向クオンツ投資プラットフォームQlibのインストール、ワークフロー、ベンチマーク、実践上の注意点を網羅した完全ガイド"
lang: ja
featured: false
schema_type: TechArticle
date: 2026-07-05
---

# Microsoft Qlib スタートガイド — 日本の開発者のための完全版(トスOpen API連携テスト中)

> 最終検証日: 2026-07-05 (microsoft/qlib mainブランチ基準)
> 対象読者: Python開発経験があり、クオンツ/ML バックテスト環境を初めて構築する開発者

---

## 1. Qlibプロジェクト概要

**Qlib**は、マイクロソフトリサーチ(MSRA)が2020年9月にオープンソースとして公開した**AI指向クオンツ投資プラットフォーム**(AI-oriented Quantitative Investment Platform)である。データ処理、モデル訓練、バックテストへとつながる全体MLパイプラインを含み、アルファ発掘 → リスクモデリング → ポートフォリオ最適化 → 注文執行に至るクオンツ投資の全過程をカバーする。

サポートする学習パラダイムは3つに定義できる。マイクロソフトリサーチチームが開発してから、本当にオールインワンに拡張されたケースである。

| パラダイム | 用途 | 代表的な実装 |
| :--- | :--- | :--- |
| 教師あり学習 (Supervised Learning) | 複雑な非線形市場パターンの発掘 | LightGBM、GRU、Transformerなど25種以上 |
| 市場動的モデリング (Market Dynamics) | コンセプトドリフト対応、非定常性への適応 | DDG-DA、Rolling Retraining |
| 強化学習 (Reinforcement Learning) | 連続的な取引意思決定、注文執行最適化 | PPO、OPDS (order execution) |

ここに**RD-Agent**(LLMベースの自律R&Dエージェント)が組み合わされ、ファクター発掘とモデル最適化を自動化する方向へ進化中である。関連論文は "R&D-Agent-Quant: A Multi-Agent Framework for Data-Centric Factors and Model Joint Optimization" (arXiv:2505.15155)。

プロジェクト規模: GitHub Star約40,000+、Fork 6,000+ (2026年時点)。Pythonクオンツオープンソースの中で最上位クラス。これ以下はあまり見る必要がない。

---

## 2. 核心的な長所

### 2.1 オールインワン(All-in-One)パイプライン
データ処理 → ファクター演算 → モデル訓練 → バックテスト → レポート分析 → オンラインサービングまでを1つのフレームワークで処理する。zipline(バックテストのみ)、backtrader(戦略実行のみ)、別々のファクターライブラリを組み合わせていた既存のワークフローと比較して、統合コストが大幅に削減される。

### 2.2 検証済みの高性能データインフラ
Qlibは金融時系列に特化したバイナリストレージフォーマットと2段キャッシュ(ExpressionCache、DatasetCache)を独自に設計した。公式ベンチマーク(800銘柄×14ファクター、2007–2020日次、1 CPU基準)

| ストレージ方式 | 所要時間(秒) | Qlibフルキャッシュ比較 |
| :--- | ---: | ---: |
| MySQL | 365.3 ± 7.5 | 約49倍遅い |
| InfluxDB | 368.2 ± 3.6 | 約50倍遅い |
| MongoDB | 253.6 ± 6.7 | 約34倍遅い |
| HDF5 | 184.4 ± 3.7 | 約25倍遅い |
| Qlib (キャッシュなし) | 147.0 ± 8.8 | 約20倍遅い |
| Qlib (+ExpressionCache) | 47.6 ± 1.0 | 約6倍遅い |
| **Qlib (+Expression +Datasetキャッシュ)** | **7.4 ± 0.3** | 基準 |

64 CPU並列環境ではキャッシュなしでも8.8秒、ExpressionCacheのみで4.2秒まで短縮される。汎用DBは多層インターフェースと不要なフォーマット変換のため金融データロードにおいて構造的に不利であるというのがMSRAの分析である。
この点は筆者も同意する。ExpressionCacheの性能は本当に金融クオンツにおいて圧倒的である。

### 2.3 表現式ベースのファクターエンジン
`Ref($close, 1)/$close - 1`のような文字列表現式でファクターを定義すると、エンジンが自動でベクトル化演算とキャッシングを処理する。pandasで直接rolling/shiftを組み合わせるよりコードが短く、キャッシュの再利用により繰り返し実験で特に速い。

### 2.4 論文再現可能なモデル動物園 (Model Zoo)
LightGBM、XGBoost、CatBoostのようなGBDT系列からLSTM、GRU、ALSTM、GATs、Transformer、Localformer、TRA、TCN、ADARNN、ADD、IGMTF、HIST、KRNN、Sandwich、TabNet、DoubleEnsemble、TCTS、SFM、TFTまで25種以上のSOTAモデルが、同一のデータセット(Alpha158/Alpha360)と同一のバックテスト条件で比較可能な形で実装されている。「論文の数値を直接再現できる唯一のクオンツフレームワーク」という評価は過言ではない。

### 2.5 市場の非定常性(Non-stationarity)対応ツールを内蔵
金融データの分布変化(regime change)に対応するRolling RetrainingとメタラーニングベースのDDG-DAがベンチマークとともに提供される。この部分は他のオープンソースバックテスターにはほとんどないQlib独自の領域である。

### 2.6 RD-Agentによる自動化R&D
LLMがファクター仮説生成 → コード実装 → バックテスト → 結果評価 → 改善ループを自律的に実行する。リサーチレポート(PDF)からファクターを抽出して実装するシナリオもサポートする。デモ: rdagent.azurewebsites.net

---

## 3. 類似プロジェクト比較

| プロジェクト | 性格 | Qlib比較での位置づけ |
| :--- | :--- | :--- |
| **zipline / zipline-reloaded** | イベントベースバックテスター | バックテスト専用。MLパイプライン、ファクターエンジンなし。Quantopian終了後もコミュニティが維持 |
| **backtrader** | イベントベースバックテスター | 戦略ロジック実装に強み、ML統合は手作業。ユーザー数が多い |
| **vectorbt** | ベクトル化バックテスター | 速度は非常に速いが、ファクターリサーチ・モデル訓練フレームワークではない |
| **QuantConnect (LEAN)** | クラウドクオンツプラットフォーム | 実取引連携に強み、C#/Python。オープンリサーチの再現性はQlibが優位 |
| **Qbot / QuantMind / qlib-learning** | Qlibベースの上位アプリケーション | Qlibをコアエンジンとして使う派生プロジェクト。すばやい体験用 |

まとめると、Qlibは**「AIモデルリサーチ+バックテスト統合」**というポジションで事実上競合がない。一方、**実取引の注文連携**(ブローカーAPI)は範囲外なので、実戦での取引まで進むには別途の執行レイヤーを自分で構築する必要がある。

---

## 4. インストール (Getting Started)

### 4.1 環境要件

| 項目 | 内容 |
| :--- | :--- |
| OS | Linux、Windows、macOS (Linux推奨 — `run_all_model.py`など一部のスクリプトはLinux専用) |
| Python | **3.8~3.12** 公式サポート |
| パッケージ管理 | Conda強く推奨(システムPython使用時ヘッダーファイル欠落によりビルド失敗の可能性) |
| 必須依存関係 | numpy、cython、lightgbm、pytorch(ディープラーニングモデル使用時) |

```bash
conda create -n qlib python=3.10
conda activate qlib
```

### 4.2 インストール方法3種

**方法1: pip (安定版、推奨)**
```bash
pip install pyqlib
```

**方法2: ソースインストール (mainブランチの最新機能が必要な場合)**
```bash
pip install numpy
pip install --upgrade cython

git clone https://github.com/microsoft/qlib.git && cd qlib
pip install .            # 開発参加時: pip install -e ".[dev]"
```
> 注意: 過去のドキュメントの`python setup.py install`方式は非推奨(deprecated)である。必ず`pip install .`を使用すること。

**方法3: Docker (環境分離)**
```bash
docker pull pyqlib/qlib_image_stable:stable
docker run -it --name qlib -v <ローカルディレクトリ>:/app pyqlib/qlib_image_stable:stable
```

**Apple Silicon (M1/M2/M3) Macユーザー**: LightGBMのビルドがOpenMP依存関係の欠落により失敗する可能性がある。先に`brew install libomp`を実行してからインストールすること。

**インストール確認**:
```python
import qlib
print(qlib.__version__)   # 0.9.x
```

### 4.3 データ準備 — 重要な変更事項

> **[2026年現在の状況]** データセキュリティポリシーの強化により**公式データダウンロードスクリプトが一時中断**されている。公式READMEが案内する代替経路は、コミュニティ(chenditc)が維持するinvestment_dataリポジトリである。旧版ドキュメントの`python scripts/get_data.py qlib_data_cn ...`コマンドはもはや動作を保証しない。

**推奨: コミュニティデータセット (中国A株、TuShareベース、日次更新)**
```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

**公式スクリプト (復旧時に使用可能、Yahoo Financeクローラーベース)**
```bash
# 日次
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data --region cn
# 1分足
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data_1min --region cn --interval 1min
```

**データ整合性チェック** (習慣として推奨):
```bash
python scripts/check_data_health.py check_data --qlib_dir ~/.qlib/qlib_data/cn_data
```

### 4.4 初期化

```python
import qlib
from qlib.constant import REG_CN   # 旧版: qlib.config — 現在はqlib.constant

provider_uri = "~/.qlib/qlib_data/cn_data"
qlib.init(provider_uri=provider_uri, region=REG_CN)
```

`region`は`REG_CN`(中国)、`REG_US`(米国)、`REG_TW`(台湾)をサポートする。region設定はデータパスだけでなく**取引制約ルール**(中国の値幅制限、T+1、最小取引単位など)にも影響するため、カスタム市場データを使う場合はバックテスト設定で取引ルールを必ず別途確認する必要がある。

---

## 5. 最初のワークフローを実行する

### 5.1 qrunで自動実行 (設定ファイルベース)

`qrun`はデータセット構築 → モデル学習 → シグナル生成 → バックテスト → 評価をYAML1つで自動化する。

```bash
cd examples    # 注意: qlibソースルートディレクトリで実行するとimport衝突が発生する
qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml
```

実行結果例 (CSI300 + Alpha158 + LightGBM、公式README基準):

```
'The following are analysis results of the excess return without cost.'
annualized_return   0.178316    # 年換算超過収益17.83%
information_ratio   1.996555
max_drawdown       -0.081806

'The following are analysis results of the excess return with cost.'
annualized_return   0.128982    # 取引コスト反映時12.90%
information_ratio   1.444287
max_drawdown       -0.091078
```

取引コスト反映の前後で年間収益率が約5%pt差があることに注目すること。**コストを反映しないバックテスト数値をそのまま信じてはいけない理由**をフレームワークがデフォルト出力で示している。

### 5.2 コードベースのカスタムワークフロー

qrunの自動ワークフローが合わない場合、モジュール単位で直接組み立てることができる。最小例:

```python
import qlib
from qlib.constant import REG_CN
from qlib.utils import init_instance_by_config
from qlib.workflow import R
from qlib.workflow.record_temp import SignalRecord, PortAnaRecord

qlib.init(provider_uri="~/.qlib/qlib_data/cn_data", region=REG_CN)

market = "csi300"
benchmark = "SH000300"

data_handler_config = {
    "start_time": "2008-01-01",
    "end_time": "2020-08-01",
    "fit_start_time": "2008-01-01",
    "fit_end_time": "2014-12-31",
    "instruments": market,
}

task = {
    "model": {
        "class": "LGBModel",
        "module_path": "qlib.contrib.model.gbdt",
        "kwargs": {"loss": "mse", "num_leaves": 210, "learning_rate": 0.05},
    },
    "dataset": {
        "class": "DatasetH",
        "module_path": "qlib.data.dataset",
        "kwargs": {
            "handler": {
                "class": "Alpha158",
                "module_path": "qlib.contrib.data.handler",
                "kwargs": data_handler_config,
            },
            "segments": {
                "train": ("2008-01-01", "2014-12-31"),
                "valid": ("2015-01-01", "2016-12-31"),
                "test":  ("2017-01-01", "2020-08-01"),
            },
        },
    },
}

model = init_instance_by_config(task["model"])
dataset = init_instance_by_config(task["dataset"])

with R.start(experiment_name="my_first_workflow"):
    model.fit(dataset)
    R.save_objects(trained_model=model)
    rec = R.get_recorder()
    SignalRecord(model, dataset, rec).generate()   # 予測シグナルを保存
```

### 5.3 表現式エンジンでデータを直接照会する

```python
from qlib.data import D

# 単純照会
df = D.features(
    ["SH600000"],
    ["$close", "$volume"],
    start_time="2020-01-01", end_time="2020-12-31", freq="day",
)

# 表現式でファクターを即席定義: 5日モメンタム、20日ボラティリティ
df = D.features(
    D.instruments("csi300"),
    ["Ref($close, 5)/$close - 1", "Std($close/Ref($close,1)-1, 20)"],
    start_time="2019-01-01", end_time="2020-12-31",
)
```

この表現式文字列がそのままファクター定義であり、結果はExpressionCacheにキャッシュされて2回目の呼び出しから劇的に速くなる。

### 5.4 グラフィカルレポート

```bash
python -m pip install ".[analysis]"
jupyter notebook examples/workflow_by_code.ipynb
```
> 旧版ドキュメントの`examples/estimator/analyze_from_estimator.ipynb`のパスは廃止された。

ノートブックで確認できるレポート: グループ別累積収益、ロングショート収益分布、IC/月別IC、シグナル自己相関、ポートフォリオバックテスト収益カーブ。

---

## 6. ベンチマーク — モデル別性能比較

### 6.1 データセットの理解: Alpha158 vs Alpha360

| データセット | 特徴 | 適合モデル |
| :--- | :--- | :--- |
| **Alpha158** | 人が設計した158個のファクター(典型的な特徴量エンジニアリング)。特徴量間の空間的関係が弱い | GBDT系列(LightGBM、CatBoostなど) |
| **Alpha360** | 直近60日の生の価格/出来高そのまま(特徴量エンジニアリング最小)。時間軸の空間的関係が強い | ディープラーニング系列(GRU、ALSTM、TRAなど) |

この区分が重要な理由: **テーブルデータではGBDTが、生の時系列ではニューラルネットワークが有利**という一般的なML常識がQlibベンチマークでもそのまま再現される。自分のファクターの性質に応じてモデル系列を選ぶべきであり、「最近流行りのモデル」を無条件に使うのは非効率である。

### 6.2 市場動的適応ベンチマーク (CSI500、Alpha158、2017.01–2020.08ローリング)

公式benchmarks_dynamic数値:

| モデル | IC | ICIR | Rank IC | 年換算収益 | IR | MDD |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| RR[Linear] (ローリング再学習) | 0.0945 | 0.5989 | 0.1069 | 8.57% | 1.368 | -9.86% |
| DDG-DA[Linear] | 0.0983 | 0.6157 | 0.1108 | 7.64% | 1.190 | -7.69% |
| RR[LightGBM] | 0.0816 | 0.5887 | 0.0912 | 7.71% | 1.320 | -9.09% |
| **DDG-DA[LightGBM]** | **0.0878** | **0.6185** | **0.0975** | **12.61%** | **2.010** | **-7.44%** |

ポイント: DDG-DA(メタラーニングベースの分布適応)をLightGBMに組み合わせると、単純ローリング再学習と比較して年間収益+4.9%pt、IR 1.32 → 2.01に改善される。**同一モデルでも市場変化への適応戦略によって成果が大きく分かれる**というのがQlibベンチマークの核心的な教訓である。

### 6.3 全モデル比較表

25種以上のモデルのAlpha158/Alpha360性能比較表は以下で維持・更新される:
`https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md`

複数のモデルを一度に実行して直接比較するには (Linux専用)
```bash
python run_all_model.py run 10          # 全モデル10回反復
python run_all_model.py run 3 lightgbm Alpha158 csi500   # 特定モデル/データセット/ユニバース
```
ランダム性のあるディープラーニングモデルは最低20回の反復後に平均を見ることを公式ドキュメントが推奨している。**単一実行結果でモデルの優劣を判断するのは統計的に無意味である。**

---

## 7. 日本の開発者のための実践セクション: KRXデータ連携

Qlibは韓国市場を公式にはサポートしていない(regionはCN/US/TWのみ存在)。しかし、CSV → Qlibバイナリ変換ツール(`dump_bin.py`)があるため、KOSPI/KOSDAQデータを付けることは難しくない。
トス Open APIを繋ぐこともそれほど難しくない。

### 7.1 pykrxでデータ収集 → CSV生成

```python
# pip install pykrx
from pykrx import stock
import pandas as pd, os

os.makedirs("csv_kr", exist_ok=True)
tickers = stock.get_market_ticker_list(market="KOSPI")

for t in tickers[:50]:   # 例: 上位50銘柄
    df = stock.get_market_ohlcv("20180101", "20260630", t)
    df = df.reset_index().rename(columns={
        "날짜": "date", "시가": "open", "고가": "high",
        "저가": "low", "종가": "close", "거래량": "volume",
    })
    df["symbol"] = t
    # Qlibの慣例: 修正株価計算用factor列 (未修正データなら1.0)
    df["factor"] = 1.0
    df.to_csv(f"csv_kr/{t}.csv", index=False)
```

### 7.2 Qlibバイナリへの変換

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

### 7.3 韓国データ使用時の必須チェックリスト

| 項目 | 内容 |
| :--- | :--- |
| **修正株価(factor)** | pykrxのデフォルトOHLCVは修正株価反映方式の確認が必要。株式分割/配当落ちを反映しないデータでバックテストすると収益率が歪む |
| **取引ルール** | region=REG_CNを使うと中国の値幅制限(±10%)とT+1ルールが適用される。韓国(±30%価格制限、T+0の回転が可能)とは異なるため、バックテストexecutor設定をカスタマイズすること |
| **取引停止/上場廃止** | 生存者バイアス(survivorship bias)を防ぐため、上場廃止銘柄を含むデータの確保が理想的。pykrxは現在上場中の銘柄中心のため限界を認識する必要がある |
| **カレンダー** | 韓国の休場日カレンダーが自動生成されているか`~/.qlib/qlib_data/kr_data/calendars/day.txt`を確認 |
| **ベンチマーク指数** | KOSPI200指数を別のシンボルとして入れ、バックテストのベンチマークに指定する |
| **Alpha158ファクター** | ファクター定義自体は市場中立的なので韓国データにもそのまま適用可能。ただし検証は韓国市場で再度行う必要がある(中国CSI300のICが韓国で再現される保証はない) |

### 7.4 トスOpen API ↔ Qlib連携ミドルウェア (Node.js/TypeScript + Redis)

QlibはPythonフレームワークだが、Qlibが実際に要求するのは「その形式に合ったデータ」だけである。つまり、データを作るパイプライン自体はどの言語で組んでも構わない。本節では、**トス証券のOpen APIから相場を取得し、上記7.1/7.2節のCSV慣例(`date,open,high,low,close,volume,symbol,factor`)に正規化して`dump_bin.py`に渡すミドルウェア**をNode.js/TypeScript + Redisで実装した結果をまとめる。

**このミドルウェアの範囲は認証と相場/銘柄データの照会までである。注文の作成・修正・取消のような実取引(トレーディング)機能は意図的に含んでいない。** その部分は各自の必要に応じて拡張すべき領域と判断した — 詳しい理由と拡張方法は7.4.6節を参照。

コードはリポジトリの[`TechDoc/Quant_Qlib/toss-qlib-middleware/`](./toss-qlib-middleware)の下にある([韓国語README](./toss-qlib-middleware/README.md) / [English README](./toss-qlib-middleware/README_EN.md) / [llms.txt](./toss-qlib-middleware/llms.txt))。トスOpen API自体の認証・エンドポイント仕様は、リポジトリに既にある[`Toss/`](../../Toss)プロジェクト(実際に動作するトスOpen API連携ダッシュボード)の[`GUIDE.md`](../../Toss/GUIDE.md)、[`src/toss.js`](../../Toss/src/toss.js)、[`docs/Toss_OpenAPI_Guide.md`](../../Toss/docs/Toss_OpenAPI_Guide.md)を根拠に合わせた。

#### 7.4.1 なぜミドルウェアが必要か

Qlibの`dump_bin.py`はCSVだけを理解すればよく、Qlibエンジンはその後のバイナリフォーマット/キャッシュだけを気にする。一方、トスOpen APIはOAuth2認証、トークン失効、rate limit、ページネーションといった「APIクライアントらしい」問題を抱えている。この2つの関心事(認証・呼び出し管理 vs ファクター/モデリング)を1つのPythonコードベースに無理に統合するより、別のミドルウェアが相場を正規化されたCSVに落とし込み、Qlibはその結果だけを消費する構造の方がすっきりしている。

```
TOSS Open API  --OAuth2-->  [Node.js/TS ミドルウェア]  --CSV(csv_kr/*.csv)-->  scripts/dump_bin.py  -->  ~/.qlib/qlib_data/kr_data
                                   |
                                 Redis (トークンキャッシュ + 相場キャッシュ)
```

#### 7.4.2 認証 (OAuth2 Client Credentials — 確認済みの仕様)

トス証券のOpen APIは、ユーザーログイン段階のない**OAuth2 Client Credentials Grant**を使う。`Toss/src/toss.js`(このリポジトリに既にある実際に動作する連携実装)と`Toss/docs/Toss_OpenAPI_Guide.md`(OpenAPI仕様v1.0.3の分析文書)に基づいて確認した仕様:

1. トス証券WTSログイン → 設定 → Open APIメニューで`client_id` / `client_secret`を発行
2. `POST {baseUrl}/oauth2/token`に`grant_type=client_credentials`、`client_id`、`client_secret`を**form-urlencodedボディ**で送信(Basic Authヘッダーではない) → `access_token`、`expires_in`を応答
3. 有効期間は**86,400秒(24時間)でrefresh tokenがない** — 失効前にclient_secretで直接再発行するロジックを実装する必要がある
4. 以降のすべての呼び出しに`Authorization: Bearer {access_token}`ヘッダーを付ける
5. 口座/注文のような口座単位のAPIには`X-Tossinvest-Account`ヘッダーが別途必要(このミドルウェアは口座/注文APIを呼び出さないため実装していない)

> **検証状態**: 公式ドキュメント(`developers.tossinvest.com/docs`)はJavaScriptレンダリングのため直接パースはできないが、`POST /oauth2/token`に上記のform-bodyリクエストを実際に送ると(認証情報が誤っていても)`{"error":"invalid_client", ...}`形式の実際の応答が返ってくる — つまりエンドポイントのパスとリクエスト形式自体は実動作で確認済みである。キャンドル/相場応答の正確なフィールドスキーマは未確定のため、ミドルウェアが複数の候補キーを防御的に許容する。サービス自体が2026年6月時点で事前申込段階であり、正式オープン日が未定であることも考慮すること(`Toss/docs/Toss_OpenAPI_Guide.md`参照)。

#### 7.4.3 Redisキャッシング戦略

| キャッシュ対象 | キー | TTL | 理由 |
| :--- | :--- | :--- | :--- |
| Access Token | `toss:access_token` | `86400 - 安全マージン(デフォルト1時間)` | refresh tokenがないため、失効よりずっと前に先制して再発行する必要がある |
| トークン再発行ロック | `toss:access_token:lock` | 10秒 (`SET NX`) | 複数のリクエストが同時にトークン失効を検知しても、1つのリクエストだけが再発行し残りはキャッシュを再確認することでthundering herdを防ぐ |
| 確定済みの過去キャンドル | `toss:candles:{symbol}:{interval}:{start}:{end}` | 1日(`CANDLE_TTL_HISTORICAL_SEC`) | すでに終了したキャンドルは値が変わらないため長くキャッシュする |
| 当日(未確定)キャンドル | 上と同じキー | 短く(`CANDLE_TTL_TODAY_SEC`、デフォルト30秒) | 取引時間中は当日キャンドルの値が継続的に更新されるため、キャッシュを長く保持してはいけない |
| 現在価格 | `toss:price:{symbol}` | 短く(`PRICE_TTL_SEC`、デフォルト5秒) | 銘柄単位のキャッシュなので複数のバッチリクエストがキャッシュを再利用できる |

401(トークン失効/無効)応答を受けるとキャッシュを即座にクリアし1回再試行し、429(rate limit)は`Retry-After`ヘッダーを見てbackoffしてから再試行する。キャンドルAPIはリクエストごとに最大200件(`count`)しか返さず`start`/`end`フィルターがないため、最新のキャンドルから`before`カーソルで逆順ページネーションした後に昇順に並べ替える(`Toss/src/toss.js`の`fetchCandles`と同じ戦略)。

#### 7.4.4 インストールと実行

```bash
cd TechDoc/Quant_Qlib/toss-qlib-middleware
npm install
npm run setup       # 対話形式で.envを生成 + 希望すれば実際のトークン発行テストまで実行
npm run typecheck
npm test                # Redisサーバーなしでもパスする(インメモリアダプターでロジック検証)
npm run dev              # http://localhost:4000、実際のRedisが必要
```

`npm run setup`(`scripts/setup.sh`)は`TOSS_CLIENT_ID`/`SECRET`などのプライベート値を対話形式で入力させて`.env`を生成(権限600)し、希望すればその場で実際の`/oauth2/token`呼び出しまで試して認証情報が有効かすぐに確認してくれる。

`.env`の核心項目(`Toss/.env.example`と同じキー名を使用):

```
TOSS_BASE_URL=https://openapi.tossinvest.com
TOSS_TOKEN_PATH=/oauth2/token
TOSS_CANDLES_PATH=/api/v1/candles
TOSS_PRICES_PATH=/api/v1/prices
REDIS_URL=redis://127.0.0.1:6379
QLIB_CSV_EXPORT_DIR=./csv_kr
```

パスが変わってもコード修正なしで`.env`だけ直せばよいように、すべてのエンドポイントパスを環境変数に切り出している。

#### 7.4.5 APIとQlibパイプラインの連結

ミドルウェアが公開するエンドポイント:

| メソッド | パス | 説明 |
| :--- | :--- | :--- |
| GET | `/health` | ヘルスチェック |
| GET | `/api/candles/:symbol?start=&end=&interval=day` | 正規化されたキャンドルJSONを照会(Redisキャッシュ経由、`before`ページネーション内蔵) |
| GET | `/api/prices?symbols=005930,000660` | 現在価格のバッチ照会(カンマ区切り、最大200件ずつチャンク) |
| POST | `/api/export/qlib` `{symbols, start, end, outDir?}` | 複数銘柄を一度に照会し、7.1節のCSVフォーマットで`csv_kr/{symbol}.csv`を生成 |

サーバーなしでCSVだけ抽出したい場合はCLIを使う:

```bash
npm run export:qlib -- --symbols 005930,000660 --start 2020-01-01 --end 2026-07-01
```

生成されたCSVは7.2節の変換コマンドにそのまま渡せばよい:

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

#### 7.4.6 トレーディング(注文執行)をなぜ含めなかったか

このミドルウェアは**データパイプライン**であり**注文執行システム**ではない。Qlib自体も3節で述べたように実取引の注文連携は範囲外であり、バックテストの成果が実取引の成果を保証しないというのが8.3節の核心的な注意点である。認証と相場照会は誰にとってもほぼ同じように必要な共通基盤であるためミドルウェアとして作る価値があるが、注文ロジック(注文状態管理、再試行時の重複注文防止、リスク限度、約定確認)は各自の戦略・リスク許容度によって完全に異なるため、汎用として作ること自体が危険である。

拡張するには[`src/trading/README.md`](./toss-qlib-middleware/src/trading/README.md)を参照すること。このミドルウェアの`TossAuthService`(トークンキャッシング)と`TossApiClient`(HTTPクライアントパターン)を再利用して注文エンドポイントだけを追加すればよいが、実注文コードは必ず少額/模擬環境で先に検証する必要がある。

---

## 8. 注意点 (Pitfalls) — 実践で必ず遭遇する問題

### 8.1 環境/インストール関連

1. **ソースルートでのimport禁止**: qlibリポジトリのルートディレクトリで`import qlib`を実行すると、ローカルフォルダがパッケージを覆い隠して`ModuleNotFoundError: No module named 'qlib.data._libs.rolling'`エラーが出る。必ず`cd examples`後に実行するか、別のパスで作業すること。
2. **pandas 2.x互換性**: pandas 1.5 → 2.0で`groupby`の`group_key`デフォルト値が変更され、一部の例(TRA dataset、TFT、RL order executionスクリプト)がエラーを出す可能性がある。公式対応があるが完全ではないため、問題が起きたらpandasバージョンを固定(`pandas<2.0`)するのが速い回避策である。
3. **TFTモデルはPython 3.6~3.7 + tensorflow 1.15専用**: 最新環境では動作しない。ベンチマークごとにrequirements.txtが異なるためモデルごとに確認すること。
4. **Redisがなくても動作する**: Redis未接続時はキャッシュの一部が無効化されるだけでコア機能は正常である。ただし、すでにRedisを使っていてロックがこじれると`QlibCacheException`が発生 — Redisキーの削除で解決。
5. **multiprocessingエラー (Windows)**: `RuntimeError: An attempt has been made to start a new process...`は、Windowsで`if __name__ == "__main__":`ガードなしで実行した際に発生する典型的な問題。

### 8.2 データ品質関連

6. **Yahoo Financeデータの限界**: 公式クローラーデータはYahooソースのため欠損/エラーが存在すると公式ドキュメント自体が明示している。高品質データがあれば自社データの使用が公式の推奨事項である。`check_data_health.py`をパイプラインに常時含めること。
7. **オフラインデータの増分更新不可**: 公式配布データは容量削減のため一部のフィールドが削除されており、増分アップデートができない。継続的な更新が必要ならcollectorで最初から収集して増分更新体系を構築する必要がある。

### 8.3 方法論関連 — 最も重要

8. **未来参照(look-ahead bias)**: カスタムファクターを作る際、`Ref($close, -1)`のような負のRefは未来データ参照である。ラベル定義には必要だが、フィーチャーに入るとバックテストが無意味になる。
9. **取引コスト・スリッページ**: 上記5.1の例のように、コスト反映の有無で年間収益率が17.8% → 12.9%に変わる。韓国市場への適用時は取引税(0.18%~)、手数料、気配値スリッページをexecutor設定に必ず反映すること。
10. **過剰最適化(overfitting)**: Alpha158の上でハイパーパラメータをvalid区間に合わせて繰り返しチューニングすると、test成果は必然的に膨らむ。ローリング検証(benchmarks_dynamic方式)が単一train/valid/test分割より信頼できる。
11. **IC 0.05は「良い」数値ではなく「出発点」**: 日次IC 0.03~0.05水準のシグナルは取引コストと容量制約を超えられないケースがほとんどである。ICよりICIR(安定性)とコスト反映後のIRを見るべきである。
12. **バックテストは執行ではない**: Qlibのバックテスト成果が実取引の成果を保証しない。オーダーブックの深さ、約定遅延、市場インパクトは別問題であり、Qlib RL order executionモジュールがこのギャップの一部を扱うが完全ではない。

> この点を一言でまとめると: **Qlibは計算機であり、神託ではない。** フレームワークがいかに精巧でも、入力データの品質と方法論の規律が結果を決める。

---

## 9. RD-Agent連携 (任意)

```bash
pip install rdagent
# LLM APIキー設定後
rdagent fin_factor    # ファクター発掘ループ
rdagent fin_model     # モデル最適化ループ
rdagent fin_factor_report --report_folder=<PDFフォルダ>   # レポートベースのファクター抽出
```

注意点: RD-AgentはLLM API呼び出しコストが相当かかり(ファクターループ1回に数十~数百回の呼び出し)、生成されたファクターの統計的有意性は人が別途検証する必要がある。自動化は検証を代替しない。

---

## 10. 推奨学習パス

| 段階 | やること | 予想所要時間 |
| :--- | :--- | :--- |
| 1 | インストール + コミュニティデータダウンロード + `qrun` LightGBMベンチマーク1回実行 | 半日 |
| 2 | `workflow_by_code.ipynb`でレポート解釈(IC、グループ収益、バックテストカーブ) | 1日 |
| 3 | 表現式エンジンで自分だけのファクター3つを定義 → Alpha158に追加 → 性能比較 | 2~3日 |
| 4 | KRXデータ変換 + 韓国市場バックテストパイプライン構築 | 1週間 |
| 4.5 | (任意) トスOpen APIミドルウェアで4段階のCSV生成を自動化(7.4節) | 2~3日 |
| 5 | ローリング再学習(benchmarks_dynamic)導入 → 単一分割と結果比較 | 1週間 |
| 6 | (任意) RL order execution / RD-Agent実験 — 実取引の注文連携は各自で構築(7.4.6節) | 以降 |

---

## 11. 参考資料

| 資料 | リンク |
| :--- | :--- |
| GitHubリポジトリ | https://github.com/microsoft/qlib |
| 公式ドキュメント | https://qlib.readthedocs.io |
| モデルベンチマーク表 | https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md |
| 動的適応ベンチマーク | https://github.com/microsoft/qlib/tree/main/examples/benchmarks_dynamic |
| コミュニティデータ (CN) | https://github.com/chenditc/investment_data/releases |
| RD-Agent | https://github.com/microsoft/RD-Agent |
| Qlib論文 | https://arxiv.org/abs/2009.11189 |
| R&D-Agent-Quant論文 | https://arxiv.org/abs/2505.15155 |
| Qlib-Server (オンラインモード) | https://github.com/microsoft/qlib-server |
| トス証券Open API公式ドキュメント | https://developers.tossinvest.com/docs |
| トスOpen API ↔ Qlibミドルウェア (本リポジトリ) | [`TechDoc/Quant_Qlib/toss-qlib-middleware`](./toss-qlib-middleware) |
| トスOpen API連携参考プロジェクト (本リポジトリ) | [`Toss/`](../../Toss) — 実際に動作するダッシュボード、GUIDE.md・docs/Toss_OpenAPI_Guide.md含む |

---

*本文書は2026-07-05時点のmicrosoft/qlib mainブランチと公式ドキュメントを対照検証して作成された。数値(ベンチマーク、性能比較)はすべて公式リポジトリの公開資料が出典であり、実行環境により再現結果は変わる可能性がある。7.4節のトスOpen APIミドルウェアは、本リポジトリの`Toss/`プロジェクト(実際に動作する連携ダッシュボード)のソース・ドキュメントを根拠に認証仕様を合わせ、独自の単体テスト(`npm test`、10件パス)でロジックを検証した。`POST /oauth2/token`に実際のリクエストを送り(誤った認証情報でも)`invalid_client`応答を受けてエンドポイントのパスとリクエスト形式自体は実動作確認ができたが、キャンドル/相場応答の正確なフィールドスキーマは実アカウント発行後に再確認が必要である。*
