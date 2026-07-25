---
title: "Microsoft Qlib入門ガイド — 韓国語圏開発者向け完全ガイド(Toss Open API連携テスト)"
description: "MicrosoftのAI指向クオンツ投資プラットフォームQlibのインストール、データ準備、初回ワークフロー実行、ベンチマーク解釈、韓国市場(KRX)データ連携までを網羅する完全ガイド。"
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-05
schema_type: TechArticle
---

# Microsoft Qlib入門ガイド — 韓国語圏開発者向け完全ガイド(Toss Open API連携テスト)

> 最終検証日: 2026-07-05(microsoft/qlib mainブランチ)
> 対象読者: クオンツ/ML バックテスト環境の構築を始めるPython開発者

---

## 1. Qlibプロジェクト概要

**Qlib**はMicrosoft Research(MSRA)が2020年9月にオープンソース化した**AI指向のクオンツ投資プラットフォーム**である。データ処理、モデル学習、バックテストという一連のMLパイプラインをカバーし、アルファ発見→リスクモデリング→ポートフォリオ最適化→注文実行までのクオンツ投資の全ワークフローを包含する。

3つの学習パラダイムをサポートしている。

| パラダイム | 目的 | 代表的な実装 |
| :--- | :--- | :--- |
| 教師あり学習 | 複雑な非線形市場パターンの発見 | LightGBM、GRU、Transformer(25種以上のモデル) |
| 市場動態対応 | コンセプトドリフト・非定常性への適応 | DDG-DA、Rolling Retraining |
| 強化学習 | 継続的な取引判断、注文実行の最適化 | PPO、OPDS |

**RD-Agent**(LLMベースの自律R&Dエージェント)はこれをさらに拡張し、ファクターの自動発見とモデル最適化を実現する。論文: "R&D-Agent-Quant: A Multi-Agent Framework for Data-Centric Factors and Model Joint Optimization"(arXiv:2505.15155)を参照。

プロジェクト規模: GitHub Star約4万、フォーク6,000件以上(2026年時点)。Pythonクオンツ分野トップクラスのオープンソースである。

---

## 2. 主な利点

### 2.1 オールインワンパイプライン
データ処理→ファクター計算→モデル学習→バックテスト→レポート分析→オンラインサービングまで、すべてが一つのフレームワークに統合されている。zipline(バックテスト専用)、backtrader(戦略専用)、個別のファクターライブラリを組み合わせる方式に比べ、統合コストを大幅に削減する。

### 2.2 実証済みの高性能データインフラ
Qlibは独自の金融時系列バイナリストレージ形式と2層キャッシュ(ExpressionCache、DatasetCache)を設計した。公式ベンチマーク(800銘柄×14ファクター、2007-2020日次、1 CPU):

| ストレージ | 時間(秒) | Qlibフルキャッシュとの比較 |
| :--- | ---: | ---: |
| MySQL | 365.3 ± 7.5 | 約49倍遅い |
| InfluxDB | 368.2 ± 3.6 | 約50倍遅い |
| MongoDB | 253.6 ± 6.7 | 約34倍遅い |
| HDF5 | 184.4 ± 3.7 | 約25倍遅い |
| Qlib(キャッシュなし) | 147.0 ± 8.8 | 約20倍遅い |
| Qlib(+ExpressionCache) | 47.6 ± 1.0 | 約6倍遅い |
| **Qlib(+Expression+Datasetキャッシュ)** | **7.4 ± 0.3** | 基準値 |

64 CPUではキャッシュなしが8.8秒、ExpressionCacheのみが4.2秒まで短縮される。汎用データベースは多層インターフェースと不要なフォーマット変換のため、金融データ読み込みにおいて構造的に不利である。

### 2.3 式ベースのファクターエンジン
`Ref($close, 1)/$close - 1`のような文字列式でファクターを定義すると、エンジンが自動でベクトル化計算とキャッシングを処理する。pandasのrolling/shiftの組み合わせよりコードが大幅に短く、キャッシュ再利用により反復実験で特に高速である。

### 2.4 再現可能なモデルズー
GBDT系(LightGBM、XGBoost、CatBoost)からディープラーニング(LSTM、GRU、ALSTM、GATs、Transformer、Localformer、TRA、TCN、ADARNN、ADD、IGMTF、HIST、KRNN、Sandwich、TabNet、DoubleEnsemble、TCTS、SFM、TFT)まで、同一データセット(Alpha158/Alpha360)と同一バックテスト条件下で比較可能な25種以上のSOTAモデルを提供する。「論文の数値を直接再現できる唯一のクオンツフレームワーク」と言っても過言ではない。

### 2.5 非定常性対応の組み込みツール
Rolling RetrainingとメタラーニングベースのDDG-DAが、市場レジームの変化にベンチマーク付きで対応する。これはQlib独自の領域であり、他のオープンソースバックテスターにはほぼ存在しない。

### 2.6 RD-Agentによる自動R&D
LLMがファクター仮説→コード化→バックテスト→評価→改善のループを自律的に実行する。研究レポート(PDF)からのファクター抽出もサポートする。デモ: rdagent.azurewebsites.net

---

## 3. 類似プロジェクトとの比較

| プロジェクト | 性質 | Qlibとの位置関係 |
| :--- | :--- | :--- |
| **zipline / zipline-reloaded** | イベントベースのバックテスター | バックテスト専用。MLパイプラインやファクターエンジンなし。Quantopian終了後はコミュニティが維持 |
| **backtrader** | イベントベースのバックテスター | 戦略ロジックに強い。ML統合は手動。韓国ユーザーが多い |
| **vectorbt** | ベクトル化バックテスター | 非常に高速だが、ファクター研究・モデル学習のフレームワークではない |
| **QuantConnect(LEAN)** | クラウドクオンツプラットフォーム | ライブトレーディング連携に強い、C#/Python。研究の再現性ではQlibが優位 |
| **Qbot / QuantMind / qlib-learning** | Qlibベースの上位アプリケーション | Qlibをコアエンジンとして利用。素早い探索が可能 |

要約すると、Qlibは実質的に競合が存在しない**「AIモデル研究+バックテスト統合」**の領域を占めている。ただし**実際の注文実行**(ブローカーAPI)はスコープ外であり、実際の取引には独自の実行レイヤーを構築する必要がある。

---

## 4. インストール

### 4.1 要件

| 項目 | 詳細 |
| :--- | :--- |
| OS | Linux、Windows、macOS(Linux推奨 — `run_all_model.py`などの一部スクリプトはLinux専用) |
| Python | **3.8~3.12**を公式サポート |
| パッケージマネージャー | Condaを強く推奨(システムPythonではヘッダーファイル不足によるビルド失敗の可能性) |
| 必須依存関係 | numpy、cython、lightgbm、pytorch(ディープラーニングモデル用) |

```bash
conda create -n qlib python=3.10
conda activate qlib
```

### 4.2 3つのインストール方法

**方法1: pip(安定版、推奨)**
```bash
pip install pyqlib
```

**方法2: ソースインストール(最新mainブランチの機能用)**
```bash
pip install numpy
pip install --upgrade cython

git clone https://github.com/microsoft/qlib.git && cd qlib
pip install .            # 開発用: pip install -e ".[dev]"
```
> 注意: 古い`python setup.py install`は非推奨。常に`pip install .`を使用すること。

**方法3: Docker(分離環境)**
```bash
docker pull pyqlib/qlib_image_stable:stable
docker run -it --name qlib -v <local_dir>:/app pyqlib/qlib_image_stable:stable
```

**Apple Silicon(M1/M2/M3)Macユーザー**: OpenMP不足によりLightGBMのビルドが失敗する場合がある。まず`brew install libomp`を実行すること。

**インストール確認**:
```python
import qlib
print(qlib.__version__)   # 0.9.x
```

### 4.3 データ準備 — 重要な変更事項

> **【2026年時点】** データセキュリティ方針の強化により、公式データダウンロードスクリプトは一時的に停止されている。公式READMEはchenditcによるコミュニティ維持のinvestment_dataリポジトリを推奨している。旧文書の`python scripts/get_data.py qlib_data_cn ...`コマンドはもう動作しない。

**推奨: コミュニティデータセット(中国A株、TuShareベース、日次更新)**
```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

**公式スクリプト(復旧時、Yahoo Financeクローラーベース)**
```bash
# 日次
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data --region cn
# 1分足
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data_1min --region cn --interval 1min
```

**データ整合性チェック**(推奨する習慣):
```bash
python scripts/check_data_health.py check_data --qlib_dir ~/.qlib/qlib_data/cn_data
```

### 4.4 初期化

```python
import qlib
from qlib.constant import REG_CN

provider_uri = "~/.qlib/qlib_data/cn_data"
qlib.init(provider_uri=provider_uri, region=REG_CN)
```

`region`は`REG_CN`(中国)、`REG_US`(米国)、`REG_TW`(台湾)をサポートする。regionはデータパス**および取引制約ルール**(中国の値幅制限、T+1、最小取引単位)に影響するため、カスタム市場データを使用する場合はバックテスト設定で取引ルールを別途検討すること。

---

## 5. 初回ワークフロー実行

### 5.1 qrunによる自動化(設定ファイルベース)

`qrun`はデータセット構築→モデル学習→シグナル生成→バックテスト→評価を単一のYAMLで自動化する。

```bash
cd examples    # 重要: qlibリポジトリルートから実行するとimportの衝突が発生する
qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml
```

出力例(CSI300+Alpha158+LightGBM、公式READMEより):

```
'The following are analysis results of the excess return without cost.'
annualized_return   0.178316    # 年間超過収益率17.83%
information_ratio   1.996555
max_drawdown       -0.081806

'The following are analysis results of the excess return with cost.'
annualized_return   0.128982    # コスト込みで12.90%
information_ratio   1.444287
max_drawdown       -0.091078
```

コストなしとコスト込みの収益率の間に約5%pの差があることに注目してほしい。フレームワークはデフォルトで**コストなしバックテストの数値を信頼してはならない理由**を示している。

### 5.2 コードベースのカスタムワークフロー

qrunの自動ワークフローが合わない場合、モジュールを直接組み立てる:

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
    SignalRecord(model, dataset, rec).generate()
```

### 5.3 式エンジンによる直接データクエリ

```python
from qlib.data import D

# シンプルなクエリ
df = D.features(
    ["SH600000"],
    ["$close", "$volume"],
    start_time="2020-01-01", end_time="2020-12-31", freq="day",
)

# その場でファクターを定義: 5日モメンタム、20日ボラティリティ
df = D.features(
    D.instruments("csi300"),
    ["Ref($close, 5)/$close - 1", "Std($close/Ref($close,1)-1, 20)"],
    start_time="2019-01-01", end_time="2020-12-31",
)
```

式文字列そのものがファクター定義であり、結果はExpressionCacheにキャッシュされるため、以降の呼び出しで劇的に高速化する。

### 5.4 グラフィカルレポート

```bash
python -m pip install ".[analysis]"
jupyter notebook examples/workflow_by_code.ipynb
```

利用可能なレポート: グループ累積収益、ロングショート収益分布、IC/月次IC、シグナル自己相関、ポートフォリオバックテスト収益曲線。

---

## 6. ベンチマーク — モデル性能比較

### 6.1 データセットの理解: Alpha158 vs Alpha360

| データセット | 特徴 | 最適なモデルタイプ |
| :--- | :--- | :--- |
| **Alpha158** | 158の人間設計ファクター(典型的な特徴量エンジニアリング)。特徴間の空間的関係が弱い | GBDT系(LightGBM、CatBoostなど) |
| **Alpha360** | 直近60日の生の価格/出来高(特徴量エンジニアリング最小)。時間的空間関係が強い | ディープラーニング(GRU、ALSTM、TRAなど) |

この区別が重要なのは、**「表形式データではGBDTが勝ち、生の時系列ではニューラルネットが勝つ」という一般的なML法則がQlibのベンチマークで忠実に再現されている**からである。自分のファクター特性に基づいてモデルファミリーを選ぶべきで、「最も話題のモデル」を盲目的に使うのは非効率である。

### 6.2 市場動態適応ベンチマーク(CSI500、Alpha158、2017.01-2020.08 rolling)

| モデル | IC | ICIR | Rank IC | 年間収益率 | IR | MDD |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| RR[Linear] | 0.0945 | 0.5989 | 0.1069 | 8.57% | 1.368 | -9.86% |
| DDG-DA[Linear] | 0.0983 | 0.6157 | 0.1108 | 7.64% | 1.190 | -7.69% |
| RR[LightGBM] | 0.0816 | 0.5887 | 0.0912 | 7.71% | 1.320 | -9.09% |
| **DDG-DA[LightGBM]** | **0.0878** | **0.6185** | **0.0975** | **12.61%** | **2.010** | **-7.44%** |

重要な結論: DDG-DA(メタラーニング分布適応)をLightGBMと組み合わせると、単純なrolling retrainingに比べ年間収益率が+4.9%p向上し、IRは1.32から2.01に改善する。**同じモデルでも、市場変化への適応戦略によって結果が劇的に変わる。**

### 6.3 全モデル比較表

25種以上のモデルの性能比較は以下で維持されている:
`https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md`

複数モデルを自分で実行する場合(Linuxのみ):
```bash
python run_all_model.py run 10          # 全モデル、10回反復
python run_all_model.py run 3 lightgbm Alpha158 csi500   # 特定モデル/データセット/ユニバース
```

公式ドキュメントはランダム性のあるディープラーニングモデルには20回以上の反復を推奨している。**単一実行でモデルの優劣を判断することは統計的に無意味である。**

---

## 7. 韓国語圏開発者向け実践セクション: KRXデータ連携

Qlibは韓国市場を公式サポートしていない(regionはCN/US/TWのみ)。しかしCSV→Qlibバイナリ変換ツール(`dump_bin.py`)が存在するため、KOSPI/KOSDAQデータの連携は比較的容易である。

### 7.1 pykrxによるデータ収集→CSV生成

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
    # Qlib規約: 調整後価格計算用のfactor列(未調整の場合は1.0)
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

### 7.3 韓国市場データの必須チェックリスト

| 項目 | 詳細 |
| :--- | :--- |
| **調整後価格(factor)** | pykrxのOHLCVが調整後価格を反映しているか確認すること。株式分割・配当を調整せずにバックテストすると収益が歪む |
| **取引ルール** | `region=REG_CN`を使用すると中国の±10%値幅制限とT+1が適用される。韓国のルール(±30%値幅制限、T+0回転)に合わせてバックテストのexecutorをカスタマイズすること |
| **取引停止/上場廃止** | サバイバーシップバイアスを防ぐため上場廃止銘柄を含めること。pykrxは現行上場銘柄中心である点に注意 |
| **カレンダー** | `~/.qlib/qlib_data/kr_data/calendars/day.txt`で韓国祝日カレンダーの自動生成を確認すること |
| **ベンチマーク指数** | バックテストのベンチマーク用にKOSPI200を別シンボルとして追加すること |
| **Alpha158ファクター** | ファクター定義は市場中立であり韓国データにも適用可能。ただし検証は再度行う必要がある — CSI300のICが韓国市場で再現されない可能性がある |

### 7.4 Toss Open API↔Qlibミドルウェア(Node.js/TypeScript+Redis)

Qlibはpythonフレームワークだが、Qlibが実際に必要とするのは「Qlibの形式のデータ」である。データパイプラインはどの言語でも構築できる。本節では、Toss証券のOpen APIから価格データを取得し、Qlib CSV形式(`date,open,high,low,close,volume,symbol,factor`)に正規化して`dump_bin.py`に供給するミドルウェアについて説明する。

**スコープ: 認証と市場/銘柄データの照会のみ。注文の作成・変更・取消(取引)は意図的に除外している。** 理由は7.4.6節を参照。

コードは[`TechDoc/Quant_Qlib/toss-qlib-middleware/`](./toss-qlib-middleware)にある([韓国語README](./toss-qlib-middleware/README.md) / [英語README](./toss-qlib-middleware/README_EN.md) / [llms.txt](./toss-qlib-middleware/llms.txt))。Toss Open APIの認証/エンドポイント仕様は本リポジトリの既存[`Toss/`](../../Toss)プロジェクトと整合させた。

#### 7.4.1 なぜミドルウェアが必要か

Qlibの`dump_bin.py`はCSVを理解するだけでよく、Qlibエンジンはその後のバイナリ形式とキャッシュにのみ関与する。Toss Open APIにはOAuth2認証、トークン期限、レート制限、ページネーションといった「APIクライアントの問題」がある。認証/呼び出し管理をファクター/モデリングから分離することで両方がクリーンに保たれる。

```
TOSS Open API  --OAuth2-->  [Node.js/TSミドルウェア]  --CSV(csv_kr/*.csv)-->  scripts/dump_bin.py  -->  ~/.qlib/qlib_data/kr_data
                                   |
                                 Redis(トークンキャッシュ+価格キャッシュ)
```

#### 7.4.2 認証(OAuth2 Client Credentials)

Toss証券のOpen APIは**OAuth2 Client Credentials Grant**(ユーザーログイン不要)を使用する。仕様は`Toss/src/toss.js`と`Toss/docs/Toss_OpenAPI_Guide.md`から検証済み:

1. Toss WTSにログイン→設定→Open APIメニュー→`client_id` / `client_secret`を発行
2. `grant_type=client_credentials`、`client_id`、`client_secret`を**form-urlencodedボディ**として(Basic Authヘッダーではなく)`POST {baseUrl}/oauth2/token`に送信→`access_token`、`expires_in`を返却
3. 有効期限は**86,400秒(24時間)、refresh tokenなし** — 期限前に事前再発行を実装すること
4. 以降のすべての呼び出しは`Authorization: Bearer {access_token}`ヘッダーを使用
5. アカウントレベルのAPIには追加の`X-Tossinvest-Account`ヘッダーが必要(未実装 — ミドルウェアはアカウント/注文APIを呼び出さない)

> **検証状況**: 公式文書(`developers.tossinvest.com/docs`)はJavaScriptレンダリングを使用しているが、上記のform-bodyリクエストを`POST /oauth2/token`に送信すると(誤った認証情報でも)`{"error":"invalid_client", ...}`が返され、実際のテストによりエンドポイントパスとリクエスト形式が確認された。正確なローソク足/価格レスポンスのフィールドスキーマは未確認であり、ミドルウェアは複数の候補キーを防御的に受け入れる。サービス自体は2026年6月時点で事前登録段階であり、確定したローンチ日はまだない。

#### 7.4.3 Redisキャッシング戦略

| キャッシュ対象 | キー | TTL | 理由 |
| :--- | :--- | :--- | :--- |
| アクセストークン | `toss:access_token` | `86400 - safety_margin(デフォルト1時間)` | refresh tokenがないため期限のかなり前に事前再発行が必要 |
| トークン再発行ロック | `toss:access_token:lock` | 10秒(`SET NX`) | 複数リクエストが同時に期限切れを検知した際のthundering herd防止 |
| 確定済み過去ローソク足 | `toss:candles:{symbol}:{interval}:{start}:{end}` | 1日(`CANDLE_TTL_HISTORICAL_SEC`) | 確定済みローソク足は変化しないため長期キャッシュ |
| 当日(未確定)ローソク足 | 同じキー | 短時間(`CANDLE_TTL_TODAY_SEC`、デフォルト30秒) | 取引時間中は現在のローソク足が更新され続ける |
| 現在価格 | `toss:price:{symbol}` | 短時間(`PRICE_TTL_SEC`、デフォルト5秒) | 銘柄単位のキャッシュでバッチ間の再利用が可能 |

401(トークン期限切れ/無効)→即座にキャッシュをクリアして1回リトライ。429(レート制限)→`Retry-After`ヘッダーを確認してバックオフ。ローソク足APIは1リクエストあたり最大200件で`start`/`end`フィルターがないため、`before`カーソルで最新から後方にページネーションし、昇順にソートする(`Toss/src/toss.js`と同じ戦略)。

#### 7.4.4 インストールと実行

```bash
cd TechDoc/Quant_Qlib/toss-qlib-middleware
npm install
npm run setup       # 対話式.env生成+オプションのライブトークン発行テスト
npm run typecheck
npm test            # Redisサーバーなしでも通過する(ロジック検証用インメモリアダプタ)
npm run dev         # http://localhost:4000、実際のRedisが必要
```

主要な`.env`項目(`Toss/.env.example`と同じキー名):

```
TOSS_BASE_URL=https://openapi.tossinvest.com
TOSS_TOKEN_PATH=/oauth2/token
TOSS_CANDLES_PATH=/api/v1/candles
TOSS_PRICES_PATH=/api/v1/prices
REDIS_URL=redis://127.0.0.1:6379
QLIB_CSV_EXPORT_DIR=./csv_kr
```

すべてのエンドポイントパスは環境変数化されており、コードを変更せず`.env`だけを変更できる。

#### 7.4.5 API・Qlibパイプライン連携

ミドルウェアのエンドポイント:

| メソッド | パス | 説明 |
| :--- | :--- | :--- |
| GET | `/health` | ヘルスチェック |
| GET | `/api/candles/:symbol?start=&end=&interval=day` | 正規化されたローソク足JSON(Redisキャッシュ経由、`before`ページネーション内蔵) |
| GET | `/api/prices?symbols=005930,000660` | 複数銘柄の現在価格をバッチ取得(カンマ区切り、200件単位でチャンク化) |
| POST | `/api/export/qlib` `{symbols, start, end, outDir?}` | 複数銘柄を取得→`csv_kr/{symbol}.csv`にCSV出力(7.1節の形式) |

サーバーを起動せずCSVのみ生成するCLI:

```bash
npm run export:qlib -- --symbols 005930,000660 --start 2020-01-01 --end 2026-07-01
```

生成されたCSVは7.2節の変換コマンドに直接投入できる。

#### 7.4.6 取引(注文実行)を含めない理由

このミドルウェアは**データパイプライン**であり、**注文実行システムではない**。Qlib自体(3章参照)もライブ注文連携をスコープ外としており、8.3節でもバックテスト性能がライブ結果を保証しないことを警告している。認証と価格照会はミドルウェアとして標準化する価値のある共通基盤だが、注文ロジック(状態管理、冪等性/重複防止、リスク限度、フィル確認)は戦略・リスク許容度によって大きく異なり、汎用的な実装は危険である。

拡張する場合は[`src/trading/README.md`](./toss-qlib-middleware/src/trading/README.md)を参照。`TossAuthService`(トークンキャッシング)と`TossApiClient`(HTTPパターン)は再利用可能だが、**実注文コードは必ず小額/ペーパー環境で先に検証すること。**

---

## 8. 落とし穴 — 実際に遭遇する問題

### 8.1 環境/インストール

1. **リポジトリルートからインポートしない**: qlibリポジトリのルートから`import qlib`を実行すると`ModuleNotFoundError: No module named 'qlib.data._libs.rolling'`が発生する(ローカルフォルダがパッケージをシャドウイングする)。常に先に`cd examples`すること。
2. **pandas 2.x互換性**: pandas 1.5→2.0で`groupby`の`group_key`デフォルトが変更され、TRAデータセット、TFT、RL注文実行スクリプトが破損する可能性がある。`pandas<2.0`への固定が最速の回避策。
3. **TFTモデルはPython 3.6-3.7+tensorflow 1.15が必要**: 現代的な環境では動作しない。モデルごとのrequirements.txtを確認すること。
4. **Redisなしでも動作する**: コア機能はRedisなしでも問題なく動作し、キャッシュ部分のみ無効化される。Redisを使用しロックが固まった場合は`QlibCacheException`が発生する — Redisキーを削除すること。
5. **Windowsでのmultiprocessing**: `RuntimeError: An attempt has been made to start a new process...` — `if __name__ == "__main__":`ガードなしで実行した際のWindows特有の典型的な問題。

### 8.2 データ品質

6. **Yahoo Financeデータの限界**: 公式クローラーはYahoo Financeデータを使用しており、ドキュメント自体が欠損/エラーを認めている。独自の高品質データを使用することが公式の推奨事項である。パイプラインに`check_data_health.py`を常設すること。
7. **オフラインデータは差分更新できない**: 公式配布データはサイズ削減のため一部フィールドを除外しており、差分更新ができない。継続的な更新が必要な場合は差分更新システムを含む独自のコレクターを最初から構築すること。

### 8.3 方法論 — 最も重要

8. **先読みバイアス**: 負の`Ref`(例: `Ref($close, -1)`)を使用したカスタムファクターは未来データを参照する。これはラベル定義には必要だが、特徴量に漏れるとバックテストが無意味になる。
9. **取引コストとスリッページ**: 5.1節で示したように、コストにより年間収益率が17.8%から12.9%に変化する。韓国市場では取引税(0.18%~)、手数料、ビッドアスクスリッページをexecutor設定に反映すること。
10. **過学習**: 検証セットでハイパーパラメータを反復調整すると、必然的にテスト性能が過大評価される。単一のtrain/valid/test分割よりrolling validation(benchmarks_dynamicアプローチ)の方が信頼性が高い。
11. **IC 0.05は「良い」のではなく「出発点」である**: 日次IC 0.03-0.05水準のシグナルは通常、取引コストと容量制約を克服できない。ICだけでなくICIR(安定性)とコスト調整後のIRを見ること。
12. **バックテストは実行ではない**: Qlibのバックテスト性能はライブ結果を保証しない。オーダーブックの深さ、フィル遅延、マーケットインパクトは別の問題である。QlibのRL注文実行モジュールはこのギャップを部分的に解消するが完全ではない。

> 一言でまとめると: **Qlibは計算機であり、オラクルではない。** フレームワークがいかに精巧であっても、入力データの品質と方法論的な規律が結果を決定する。

---

## 9. RD-Agent連携(オプション)

```bash
pip install rdagent
# LLM APIキーを設定後:
rdagent fin_factor    # ファクター発見ループ
rdagent fin_model     # モデル最適化ループ
rdagent fin_factor_report --report_folder=<PDFフォルダ>   # レポートベースのファクター抽出
```

注意: RD-AgentはかなりのLLM API費用が発生する(ファクターループごとに数十~数百回の呼び出し)。生成されたファクターは独立した統計的検証が必要である。自動化は検証の代替にはならない。

---

## 10. 推奨学習パス

| 段階 | タスク | 推定所要時間 |
| :--- | :--- | :--- |
| 1 | インストール+コミュニティデータダウンロード+`qrun` LightGBMベンチマークを1回実行 | 半日 |
| 2 | `workflow_by_code.ipynb`でレポートを解釈(IC、グループ収益、バックテスト曲線) | 1日 |
| 3 | 式エンジンでカスタムファクターを3つ定義→Alpha158に追加→性能比較 | 2~3日 |
| 4 | KRXデータ変換+韓国市場バックテストパイプライン | 1週間 |
| 4.5 | (オプション)Toss Open APIミドルウェア(7.4節)によるステップ4のCSV生成自動化 | 2~3日 |
| 5 | rolling retraining(benchmarks_dynamic)を採用→単一分割との比較 | 1週間 |
| 6 | (オプション)RL注文実行/RD-Agent実験 — ライブ注文連携は自前実装(7.4.6節) | それ以降 |

---

## 11. 参考資料

| リソース | リンク |
| :--- | :--- |
| GitHubリポジトリ | https://github.com/microsoft/qlib |
| 公式ドキュメント | https://qlib.readthedocs.io |
| モデルベンチマーク表 | https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md |
| 動的適応ベンチマーク | https://github.com/microsoft/qlib/tree/main/examples/benchmarks_dynamic |
| コミュニティデータ(CN) | https://github.com/chenditc/investment_data/releases |
| RD-Agent | https://github.com/microsoft/RD-Agent |
| Qlib論文 | https://arxiv.org/abs/2009.11189 |
| R&D-Agent-Quant論文 | https://arxiv.org/abs/2505.15155 |
| Qlib-Server(オンラインモード) | https://github.com/microsoft/qlib-server |
| Toss証券Open API文書 | https://developers.tossinvest.com/docs |
| Toss↔Qlibミドルウェア(本リポジトリ) | [`TechDoc/Quant_Qlib/toss-qlib-middleware`](./toss-qlib-middleware) |
| Toss APIリファレンスプロジェクト(本リポジトリ) | [`Toss/`](../../Toss) — 動作するダッシュボード、GUIDE.mdとdocs/Toss_OpenAPI_Guide.mdを含む |

---

*本文書は2026年7月5日に、microsoft/qlib mainブランチと公式ドキュメントとの相互検証に基づいて作成された。すべての指標(ベンチマーク、性能比較)は公式リポジトリの公開資料に基づいており、再現結果は実行環境によって異なる場合がある。7.4節のToss Open APIミドルウェアは本リポジトリの`Toss/`プロジェクトのソースと文書に基づいて認証仕様を整合させ、自己のユニットテスト(`npm test`、10件パス)でロジックを検証した。`POST /oauth2/token`は(誤った認証情報でも)`invalid_client`レスポンスを返し、実際のテストによりエンドポイントパスとリクエスト形式が確認されたが、正確なローソク足/価格レスポンスのフィールドスキーマは実際のアカウント発行後に再検証が必要である。*
