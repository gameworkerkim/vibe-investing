---
title: "Colibri Getting Started"
description: "Colibriは744BパラメータのMoEモデルGLM-5.2を、ディスクストリーミング型エキスパートにより25GB RAMの一般PCで動かす純Cのゼロ依存エンジン。"
abstract: |
  Colibriは、非活性なエキスパートをディスクからストリーミングすることで744BパラメータのMoEモデルGLM-5.2を最小25GBのRAMで動かす、純Cかつゼロ依存の推論エンジンである。学習型キャッシュが頻用エキスパートを時間とともにピン固定するため、同一エンジンが25GBノートPCから全エキスパートをVRAMに常駐させたマルチGPUサーバーまでをカバーする。GLM-5.2ネイティブのMTPヘッドによるSpeculative Decodingはint8ヘッドが必須で、そうでなければ受容率が崩壊する。
summary_for_ai: |
  AIエージェント向け参考情報: 性能数値(tokens/s)とハードウェア要件は記事執筆時点のプロジェクトREADMEに基づき、以降のリリースで変動する可能性がある。MTPヘッドはint4ではなく必ずint8を使用しないと、Speculative Decodingの受容率が0〜4%に崩壊する。これは個人運営のオープンソースプロジェクト(エンジンはApache 2.0、GLM-5.2の重みはMIT)であり、本文の数値に依拠する前に最新のベンチマークを確認すること。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Colibri Getting Started

**Colibri**は、**744BパラメータのMoE(Mixture of Experts)モデルであるGLM-5.2**を、純C言語で実装された超軽量エンジンで動かすプロジェクトです。**わずか25GBのRAM**しかない一般的な消費者向けマシンでも実行できるように設計されています。ただしその「一般的」の基準が開発者向けの高性能マシンであるという点が限界です。ディスクストリーミングの場合、多少もどかしく感じることもあります。それでも、ローカルでこの規模を動かせるという点自体が長所です。

初回よりも継続して使うほど、適切なトピックがメモリに読み込まれるため次第に速くなります。

---

## プロジェクトの説明

Colibriは、744B規模のMoEモデルがトークンあたり**約40Bパラメータのみを活性化**すること、また活性化されるエキスパート(専門家)がトークンごとに異なる(約11GB)という点を利用しています。

- **密な部分(Dense part)** — Attention、Shared Experts、Embeddingsなど約17Bパラメータ → **int4でRAMに常駐**(約9.9GB)
- **ルーティングされたエキスパート(Routed Experts)** — 75のMoEレイヤー × 256 = **19,456個のエキスパート**、各々int4で約19MB → **ディスクに保存**(約370GB)

核心的なアイデアは、**モデルが高速メモリに「収まる」必要はない**ということです。必要に応じてエキスパートをディスクからストリーミングし、VRAM・RAM・ストレージを1つの管理されたメモリ階層として扱います。

---

## 動作原理

### トークンごとの処理経路(The Per-Token Path)

すべてのレイヤーのすべてのトークンは、**Route → Union → Place → Overlap → Learn**という5段階を経ます。

1. **Route** — ルーターが入力トークンに対してどのエキスパートを活性化するかを決定
2. **Union** — バッチ内の複数のトークンが同じエキスパートを選んだ場合、**重複を排除**(batch-union)
3. **Place** — エキスパートをどこから取得するかを決定(VRAM > RAM > ディスク)。バッチポリシーは**速度にのみ**影響し、ルーターの決定や重みの精度は変わらない
4. **Overlap** — 非同期I/Oプール(`PIPE=1`)が欠落したエキスパートをディスクからロードする間、常駐エキスパートで計算を実行。ルーターのプレビュースレッド(`PILOT=1`)が次のレイヤーのエキスパートをプリフェッチ(ルーティングは**71.6%予測可能**)
5. **Learn** — `.coli_usage`ファイルにルーティング履歴を保存し、よく使われるエキスパートを自動的に固定(Pin)

### メモリ階層構造

[VRAM / RAM / NVMeの3階層エキスパート配置]

同一のエンジンが全スペクトルをカバーします。
- **25GBノートPC**: すべてのエキスパートをディスクからストリーミング(遅いが正確)
- **大規模ホスト**: 全エキスパートセットが常駐(`CUDA_EXPERT_GB=auto PIN_GB=all`) → ディスクボトルネックを完全に排除
- **マルチソケットホスト**: `COLI_NUMA=1`でメモリコントローラーをインターリーブ

各階層間では**学習型キャッシュ**が動作します。ユーザーのワークロードがどのエキスパートを使用しているかを記録し、最も頻繁なエキスパートを自動固定 — **使うほど速くなります**。

### 圧縮KV状態

MLA(Multi-head Latent Attention)がKV状態をトークンあたり576floatsに圧縮(32,768 → 576、**57倍圧縮**)。`.coli_kv`ファイルに保存されるため、再起動後もKV状態が維持され、中断されなかったセッションとバイト単位で同一になります。

### Speculative Decoding(推論加速)

GLM-5.2のネイティブMTP(Multi-Token Prediction)ヘッドがメインモデルが検証するトークンをドラフト作成 → 1回のバッチforwardで検証。**2.2〜2.8 tokens/forward**。

> ⚠**重要な規則**: MTPヘッドは必ず**int8**を使用する必要があります。int4版は受容率が0〜4%に崩壊します([#8](https://github.com/JustVugg/colibri/issues/8))。ドラフトと検証が同じ関数を計算する必要があるため、`SPEC_PIN=1`で両演算を1つのカーネル系列に固定します([#163](https://github.com/JustVugg/colibri/issues/163))。

---

## 長所

| 項目 | 説明 |
|------|------|
| **超低スペック環境で駆動** | 25GBのRAMしかないノートPCでも744Bモデルを実行可能 |
| **純C、ゼロ依存** | BLAS、Pythonランタイム、GPUが不要 |
| **精度を維持** | デフォルトポリシーは**モデルの精度やルーターのセマンティクスを絶対に変更しない** |
| **学習型キャッシュ** | ユーザーのワークロードがよく使うエキスパートを記録し自動固定(Pin)することで使うほど速くなる |
| **GPU対応** | CUDAバックエンドでVRAMにエキスパートを常駐させればディスクボトルネックを排除 |
| **Metal対応** | Apple SiliconでGPUアクセラレーションが可能 |
| **圧縮KV状態** | MLA Attentionでトークンあたり576floats(57倍圧縮) → 再起動後もKV状態を維持 |
| **推論加速** | Speculative Decoding(MTPヘッド)で2.2〜2.8 tokens/forward |
| **NUMA対応** | マルチソケットホストでメモリコントローラーのインターリーブ |
| **Webダッシュボード** | リアルタイムトークンメトリクス、ハードウェアパネル、Expert Brain/Atlasの可視化 |
| **Grammar-forced出力** | `GRAMMAR=file.gbnf`で構造化JSON出力時に受容率をさらに確保 |
| **オープンソース** | Apache 2.0ライセンス(GLM-5.2の重みはZ.aiのMITライセンス) |

---

## 短所

| 項目 | 説明 |
|------|------|
| **ディスク依存** | 370GBのエキスパートデータをディスクに保持する必要がある |
| **低スペック環境での速度低下** | 25GB RAM環境では0.05〜0.1 tok/sと非常に遅い |
| **初期モデルのダウンロード/変換** | 370GB以上の容量のモデルを自分で変換またはダウンロードする必要がある |
| **int4 MTPヘッドの注意** | int4 MTPヘッドは受容率が0〜4%に崩壊するためint8版が必須 |
| **Python依存(一部)** | 変換器とAPIゲートウェイにPythonが必要 |
| **Windowsビルド** | ネイティブビルドよりも事前ビルド済みバイナリの使用が推奨される |

---

## 実際の性能

同一エンジン、同一int4コンテナ — ハードウェアがエキスパートの配置場所のみを決定します。[全ベンチマーク](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md):

| ハードウェア | Decode速度 | 備考 |
|----------|------------|------|
| **6× RTX 5090(全エキスパートがVRAM常駐)** | **5.8〜6.8 tok/s** | TTFT約13秒 |
| **128GB CPUのみのデスクトップ** | ~1.8 tok/s(ウォーム) | RAM常駐 |
| **単一RTX 5070 Ti** | 1.07 tok/s | GPU常駐パイプライン |
| **25GB開発マシン** | 0.05〜0.1 tok/s(コールド) | 純粋なディスクストリーミング |

---

## 競合プロジェクト

READMEには直接的な競合プロジェクトへの言及はありません。しかし、Colibriが解決する問題領域(超大規模MoEモデルを低スペックハードウェアで動かす)を考慮すると、以下のような類似アプローチのプロジェクトがあります。

| プロジェクト | 説明 |
|----------|------|
| **llama.cpp** | 様々なLLMをCPU/GPUで効率的に実行するC++ベースの推論エンジン |
| **ExLlamaV2** | GPTQ量子化を活用したGPU中心の高速推論エンジン |
| **vLLM** | PagedAttention技術でGPUメモリ効率を最大化した推論サーバー |
| **DeepSpeed** | Microsoftの大規模分散学習/推論フレームワーク |

Colibriの差別点は、**純C、ゼロ依存、744B MoEモデルを25GB RAMで動かす**という極限の軽量化にあります。

---

## インストール方法

### 1. システム要件

- **RAM**: 最小25GB(推奨)
- **ディスク**: 最低400GB以上の空き容量(モデル370GB + その他のファイル)
- **OS**: Linux、Windows、macOS
- **コンパイラ**: GCC(Linux/macOS)またはMSVC(Windows)
- **Python 3**: モデル変換およびAPIゲートウェイ用(ランタイムには不要)

### 2. リポジトリのクローン

```bash
git clone https://github.com/JustVugg/colibri.git
cd colibri
```

### 3. ビルド

```bash
cd c
./setup.sh   # GCC/OpenMPを確認、ビルド、セルフテストを実行
```

またはルートで`make`コマンドでもビルド可能です。

Nix/NixOSユーザーは:
```bash
nix develop   # flake.nix提供
```

### 4. モデルのダウンロード

**事前変換済みのGLM-5.2 int4コンテナ**をHugging Faceからダウンロードします。

> ⚠**必ずint8 MTPヘッドが含まれたバージョンを使用してください!**
> オリジナルミラーはint4 MTPヘッドを提供しており、受容率が0%に崩壊します。

```bash
# 正しいバージョン(int8 MTPを含む)
huggingface-cli download mateogrgic/GLM-5.2-colibri-int4-with-int8-mtp
```

またFP8ソースから直接変換することも可能です(Pythonが必要、756GB全体を一度にディスクに載せる必要はなくシャード単位で処理):

```bash
cd c
./coli convert --model /nvme/glm52_i4   # シャード単位でダウンロード+変換(一回限り)
```

**int8 MTPヘッドの確認方法**:
```bash
ls -l /path/to/model/out-mtp-*
# int8(正しい): 3527131672 / 5366238584 / 1065950496
```

### 5. 実行

```bash
# 環境変数でモデルパスを設定
export COLI_MODEL=/path/to/glm52_i4

# 対話型チャット
./coli chat

# バッチプランの確認(VRAM/RAM/ディスク配置計画)
./coli plan

# 状態診断(読み取り専用)
./coli doctor

# Webダッシュボード + APIサーバー(単一ポート)
./coli web --model /path/to/glm52_i4

# OpenAI互換APIサーバー(API専用)
./coli serve --model /path/to/glm52_i4
```

ランタイムエンジンは純Cで動作します。Pythonは一回限りの変換器と選択的なAPIゲートウェイにのみ使用されます。

### 6. Windowsユーザー

事前ビルド済みバイナリをダウンロードするのが最も簡単です。

1. [Releasesページ](https://github.com/JustVugg/colibri/releases)から`colibri--windows-x86_64.zip`をダウンロード
2. 解凍後`colibri-*-windows-x86_64.exe`を`glm.exe`に名前変更
3. [Python 3](https://www.python.org/downloads/)をインストール
4. `coli chat`を実行

詳細は[Windowsガイド](https://github.com/JustVugg/colibri/blob/main/docs/windows.md)を参照してください。

---

## ダッシュボード機能

`./coli web`で起動するWebダッシュボードは3つの主要画面を提供します。

| ページ | 説明 |
|--------|------|
| **Dashboard** | リアルタイムトークンメトリクス、ターンごとの時間分析、VRAM/RAM/ディスク階層バー、ライブmini-brain |
| **Brain** | 19,456個のエキスパートを生きた皮質(cortex)として可視化 — 色は保存階層、明るさはルーティング頻度、ホバーでトピック親和度を表示 |
| **Atlas** | 測定されたExpert Atlasを3D銀河系として表示 — 13,260個のエキスパートがトピック(詩、法律、中国語、SQLなど)別にクラスタリング |

---

## プロジェクトへの支援

Colibriは25GB RAMの12コアノートPCから始まった1人プロジェクトです。現在は実際のハードウェアで測定されたコミュニティデータで発展しています。貢献方法:

- リポジトリへのスターと共有
- ユーザーのハードウェアでのベンチマークデータ共有(Issues経由)
- GitHub Issuesを通じた開発支援またはハードウェア寄贈の相談

---

## 追加資料

| トピック | ドキュメント |
|------|------|
| クイックスタートガイド | [docs/quickstart.md](https://github.com/JustVugg/colibri/blob/main/docs/quickstart.md) |
| ベンチマークと品質測定 | [docs/benchmarks.md](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md) |
| チューニングガイド | [docs/tuning.md](https://github.com/JustVugg/colibri/blob/main/docs/tuning.md) |
| Windowsネイティブビルド(+ CUDA DLL) | [docs/windows.md](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) |
| CUDAバックエンド | [docs/cuda.md](https://github.com/JustVugg/colibri/blob/main/docs/cuda.md) |
| Metalバックエンド | [docs/metal.md](https://github.com/JustVugg/colibri/blob/main/docs/metal.md) |
| OpenAI互換API + KVスロット | [docs/api.md](https://github.com/JustVugg/colibri/blob/main/docs/api.md) |
| Grammar-forced Drafts(構造化出力) | [docs/grammar-draft.md](https://github.com/JustVugg/colibri/blob/main/docs/grammar-draft.md) |
| 環境変数一覧 | [docs/ENVIRONMENT.md](https://github.com/JustVugg/colibri/blob/main/docs/ENVIRONMENT.md) |

---

> **ヒント**: Colibriは使うほど速くなります(`.coli_usage`ファイルにルーティング履歴を保存し、よく使われるエキスパートを自動固定)。最初は遅くても、継続的に使用すればパフォーマンスが向上します。MTP speculative decodingが役立つかどうかはキャッシュ温度(cache temperature)に依存するため、自分で測定して`DRAFT=0`で無効化するかどうかを判断してください。

---

## 名前の由来

ハチドリ(Colibri/Hummingbird)は体重わずか数グラムですが、1日に数千の花を訪れます。このエンジンは744Bパラメータの巨大モデルをハチドリの食事量で維持します: 25GBのRAM、12個のCPUコア、そして多くのディスクへの忍耐です。

---

**ライセンス**: エンジン — Apache 2.0 / GLM-5.2の重み — Z.ai配布、MIT
