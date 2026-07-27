<!--
---
title: "DeepSeek-V4 (Pro/Flash) Getting Started — オープンウェイトガイド"
title_en: "DeepSeek-V4 (Pro/Flash) Getting Started — Open-Weight Guide"
subtitle: "1M コンテキスト MoE · MIT ライセンス · Think High/Max · vLLM/SGLang 展開"
description: "DeepSeek-V4 Pro(1.6T-A49B)・Flash(284B-A13B) の公式スペック・ベンチマーク・encoding_dsv4・vLLM/DSpark・Claude Code 連携・韓国語第三者評価・導入チェックリスト TechDoc。1M コンテキスト・MIT ライセンス対応。"
abstract: |
  DeepSeek-V4 は 2026 年 4 月末に公開されたオープンウェイト MoE ファミリー（Pro 1.6T / Flash 284B、1M context、MIT）である。
  CSA+HCA ハイブリッド attention で KV キャッシュ 10%。Non-think / Think High / Think Max の 3 段推論モード。
  本ドキュメントは v1 訂正、Flash 2×H200・Pro 8×H200 ハードウェア、API・自社ホスティング、韓・日事業シナリオを整理する。
summary_for_ai: |
  Hands-on TechDoc for DeepSeek-V4 Pro and Flash open-weight MoE models.
  MIT license, 1M context, encoding_dsv4 (no Jinja template), vLLM v0.23+, DSpark serving.
  Third-party Korean benchmarks avg 84.9. Preview status — verify GA checkpoints.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim（金浩光）"
lang: ja
tags: [DeepSeek V4, DeepSeek, Open Weight, MoE, LLM, vLLM, 日本語]
keywords: ["DeepSeek V4", "DeepSeek-V4-Flash", "DeepSeek-V4-Pro", "オープンウェイト", "1M context", "MIT license", "CSA HCA", "Agentic LLM"]
group: llm-agents
featured: true
featured_rank: 2
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# DeepSeek-V4 (Pro 1.6T-A49B / Flash 284B-A13B) プロジェクトガイド — 最終検証版

> **ドキュメント版** v2.0 (2026-07-27) · **検証基準** DeepSeek 公式 HF モデルカード / DeepSeek API Docs / 技術報告書 (arXiv 2606.19348)
> **範囲変更** v1 は Flash 単独文書だったが、V4 は **Pro/Flash 2 種ファミリーリリース** のため両方を扱う。アーキテクチャが同一で、分離記述は誤解を招く。
> **状態** 公式モデルカードは自らを **preview version** と表記する。GA チェックポイントは別途存在する。

---

## 0. v1 からの主要修正事項

| # | 項目 | v1 の記載 | 訂正内容 |
|---|---|---|---|
| 1 | Expert 構成 | 「256 routed + 1 shared」 | **公式モデルカードに expert 数未公開。** 出典不明の数値のため削除 |
| 2 | アーキテクチャ | 「静的トークン ID→expert ID ハッシュテーブル」 | **公式 3 大アップグレードにない** (Hybrid Attention / mHC / Muon)。事前リーク情報の推定のため削除 |
| 3 | Attention | 「ハイブリッドローカル + 長距離」 | 正確には **CSA (Compressed Sparse Attention) + HCA (Heavily Compressed Attention)** |
| 4 | Flash ハードウェア | 「FP8 H100 2 枚 / INT4 H100 1 枚」 | **誤り。** Instruct は FP4+FP8 混合約 158GB。1M コンテキスト込み約 170〜175GB → **2×H200 または 4×A100**。2×H100 (160GB) は不足 |
| 5 | Flash メモリ | 「FP8 約 500GB、INT4 後 141〜155GB」 | Flash に該当しない数値。§2.1 と自己矛盾 |
| 6 | 推奨構成 | 「16GPU マシン」 | Flash 基準では過大。16GPU は **Pro マルチノード** 条件 |
| 7 | コーディング性能 | 「Flash がコーディング最上位」 | モデルカードがその表現を付けた対象は **V4-Pro-Max**。Flash-Max は LiveCodeBench 91.6 (Pro-Max 93.5) |
| 8 | チャットテンプレート | `apply_chat_template` 例 | **モデルカードが Jinja テンプレート未提供を明記。** `encoding_dsv4` 必須 — v1 コードは動作しない |
| 9 | サンプリング | temperature 0.7 / top_p 0.9 | 公式推奨は **1.0 / 1.0** |
| 10 | vLLM | `--enforce-eager` | CUDA グラフを無効化し本番スループットが大幅低下。削除 |
| 11 | 推論モード | 未記載 | **Non-think / Think High / Think Max 3 段モード** が V4 利用の核心。完全欠落 |
| 12 | DSpark | 未記載 | 2026-06-27 公開。MTP-1 比 **ユーザーあたり生成速度 60〜85% 向上**、無損失 |
| 13 | Claude Code | `api.deepseek.com/v1` | 誤り。Anthropic 互換エンドポイントは **`/anthropic`**、モデル ID は `deepseek-v4-pro[1m]` |
| 14 | レガシー API | 未記載 | `deepseek-chat` / `deepseek-reasoner` は **2026-07-24 15:59 UTC 終了** (既に経過) |
| 15 | 韓国語 | 「ベンチマーク未公開」 | DeepSeek 自身の公開はないが **第三者 (Upstage) 評価で韓国語平均 84.9** — 韓国事業判断を変える数値 |
| 16 | GGUF | 表を確定情報のように記載 | コミュニティビルドで公式チェックポイント比 **未検証**。断定表現を緩和 |
| 17 | 学習スペック | 部分記載 | 32T トークン / Muon optimizer / 2 段階 post-training (ドメイン専門家個別育成 → on-policy distillation 統合) |
| 18 | 出力上限 | 未記載 | 最大出力 **384K トークン**。Think Max はコンテキスト窓 **384K 以上** 推奨 |

---

## 1. プロジェクト背景

**DeepSeek-V4** は中国 DeepSeek が 2026 年 4 月末に公開したオープンウェイト MoE モデルファミリーである。技術報告書のタイトルが設計意図をそのまま示す — *Towards Highly Efficient Million-Token Context Intelligence*。**1M トークンコンテキストを経済的に実現すること** が目標である。

> **公開日注意**: ソースにより 4 月 22・23・24・27 日で食い違う。HF 論文掲載は 4 月 26 日。本ドキュメントでは「2026 年 4 月末」で統一し、正確な日付が必要なら DeepSeek 公式チャネルを確認すること。

### 1.1 3 大アーキテクチャアップグレード (公式)

| 項目 | 内容 |
|---|---|
| **Hybrid Attention** | CSA + HCA の結合。1M コンテキストで V4-Pro は **V3.2 比単一トークン推論 FLOPs 27%、KV キャッシュ 10%** |
| **mHC** | Manifold-Constrained Hyper-Connections。残差接続を強化し層間信号伝播の安定性を高めつつ表現力を維持 |
| **Muon Optimizer** | 収束速度と学習安定性の改善 |

V3.2 の MLA (Multi-head Latent Attention) を置いたのが CSA+HCA である。attention がシーケンス長に二乗で増える問題を圧縮で回避する発想であり、**KV キャッシュを 10 分の 1 にしたことがこのモデルの経済性のすべて** と見てよい。

### 1.2 学習パイプライン

- 事前学習: **32T 以上** の高品質トークン
- 事後学習 2 段階:
  1. ドメイン別専門家モデルを **個別育成** (SFT + GRPO ベース RL)
  2. **on-policy distillation** で単一モデルに統合

この「個別育成後統合」構造が V4 のドメイン偏りが小さい理由と考えられる。

### 1.3 モデルラインナップ

| モデル | 総パラメータ | 活性 | コンテキスト | 精度 |
|---|---|---|---|---|
| DeepSeek-V4-Flash-Base | 284B | 13B | 1M | FP8 Mixed |
| DeepSeek-V4-Flash | 284B | 13B | 1M | FP4 + FP8 Mixed* |
| DeepSeek-V4-Pro-Base | 1.6T | 49B | 1M | FP8 Mixed |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | FP4 + FP8 Mixed* |

\* MoE expert パラメータは FP4、残り大部分は FP8

派生チェックポイント: `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (§2.5), `nvidia/DeepSeek-V4-Pro-NVFP4`

### 1.4 推論モード (V4 利用の核心)

| モード | 特性 | 用途 | 応答形式 |
|---|---|---|---|
| **Non-think** | 高速な直感的応答 | 日常業務、低リスク判断 | `</think>` 要約 |
| **Think High** | 意識的な論理分析、遅いが正確 | 複雑な問題解決、計画立案 | `<think>` 思考 `</think>` 要約 |
| **Think Max** | 推論を最大限拡張 | モデル推論限界の探索 | 特殊システムプロンプト + `<think>` 思考 `</think>` 要約 |

**モード選択が性能を支配する。** 以下は同一モデルでモードのみ変えた結果である。

| ベンチマーク | Flash Non-Think | Flash Max | Pro Non-Think | Pro Max |
|---|---|---|---|---|
| HLE | 8.1 | 34.8 | 7.7 | **37.7** |
| LiveCodeBench | 55.2 | 91.6 | 56.8 | **93.5** |
| Apex | 1.0 | 33.0 | 0.4 | **38.3** |
| MRCR 1M | 37.5 | 78.7 | 44.7 | **83.5** |
| BrowseComp | – | 73.2 | – | **83.4** |

Non-think と Max の差は LiveCodeBench で 36 点、Apex で 32 点である。**モードを誤るとモデル変更より大きな損失になる。**

---

## 2. 長所 (Strengths)

### 2.1 ロングコンテキスト経済性 — このモデルの本質

V3.2 比 KV キャッシュ 10%、推論 FLOPs 27%。1M コンテキストを「対応する」ではなく **「耐えうるコストで対応する」** ことが差別点である。Flash の 1M 全体 KV キャッシュは約 10GB 程度で、158GB 重みの上に載せても 2×H200 に収まる。

### 2.2 MIT ライセンス — 実質最大の強み

重み、派生モデル、再配布、商用利用すべて制約なし。モデル名接頭辞も表記義務もない。Upstage Solar License (ネーミング・表記義務) や Llama 系ライセンスと比べ **自社ブランド製品への組み込み摩擦は 0** である。

企業視点では性能指標より重要になりうる。法務レビューが事実上不要な唯一の準フロンティア級モデル群である。

### 2.3 Flash の自社ホスティング適合性

Flash 284B-A13B は **FP4+FP8 約 158GB** で、1M コンテキスト KV とランタイムオーバーヘッドを足しても約 170〜175GB である。2×H200 (282GB) なら余裕で収まる。Pro 比 85〜95% 品質をはるかに低いインフラで得られるというのが実務者の一般的評価である。

### 2.4 圧倒的な API 価格

| モデル | 入力 (キャッシュミス) | 出力 | 入力 (キャッシュヒット) |
|---|---|---|---|
| DeepSeek-V4-Pro | $0.435 / 1M | $0.87 / 1M | $0.003625 / 1M |
| DeepSeek-V4-Flash | $0.14 / 1M | $0.28 / 1M | $0.0028 / 1M |

2026 年 5 月 22 日より V4-Pro の 75% 割引が常時価格に移行した。**キャッシュヒット入力 $0.003625/1M** が特に重要である。同一システムプロンプトを繰り返すエージェントワークロードでは入力コストが事実上消える。

### 2.5 DSpark — サーブ最適化 (2026-06-27)

新モデルではなく **既存 V4 重みに draft モジュールを付与したもの** である。公式カードも "not a new model" と明記する。

| 項目 | 内容 |
|---|---|
| 方式 | 並列 draft backbone + 小型逐次 head、confidence head と負荷認識スケジューラ |
| 効果 | MTP-1 比 **ユーザーあたり生成速度 60〜85% 向上**、出力無損失 |
| スループット | 80 tok/s/user (Flash)・35 tok/s/user (Pro) 条件で総スループット +51%・+52% |
| 高速条件 | 120 tok/s/user・50 tok/s/user 条件で +661%・+406% |
| チェックポイント | `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (MIT) |
| コード | DeepSpec (github.com/deepseek-ai/DeepSpec, MIT) |

**注意**: 60〜85% は naive デコードではなく **DeepSeek 自身の MTP-1 比** の数値である。他サーブスタックへの移植で再現される保証はなく、2026 年 7 月初時点で独立再現報告もまだない。

### 2.6 エージェントツールエコシステム統合

Anthropic 互換エンドポイントを公式提供するため Claude Code、OpenCode、Copilot Chat、Cline などにプロキシなしで接続できる。`awesome-deepseek-agent` リポジトリに 20 種コーディングツール別公式設定が整理されている。

### 2.7 Base モデル公開

`V4-Pro-Base`, `V4-Flash-Base` が同時公開され **continued pretraining が可能** である。Instruct のみ公開するモデルと決定的に異なる点であり、ドメイン特化モデルを本気で作る計画ならこれが選択理由になる。

---

## 3. 短所と限界 (Weaknesses)

### 3.1 Pro は事実上クラスター専用

| 構成 | 要件 |
|---|---|
| V4-Pro 重み | 約 862GB (HF 表記) / vLLM 推奨レシピ約 960GB フットプリント |
| 単一ノード | **8×H200 141GB (1,128GB)** または B300 8-GPU ノード |
| マルチノード | 16×H100 80GB 2 ノード + NVLink/InfiniBand |
| 8×H100 80GB | **不可** (640GB で不足) |

量子化では解決しない。Q4 程度まで下げても約 430GB で、1M KV を足すと再び 8×H100 を超える。**Pro をワークステーションモデルにする量子化レベルは存在せず、やや小さいクラスターモデルになるだけである。**

### 3.2 チャットテンプレート不在 — 統合時最大の罠

モデルカードは明記する: **今回のリリースは Jinja 形式チャットテンプレートを含まない。** 代わりに `encoding` フォルダの Python スクリプト (`encoding_dsv4`) でメッセージをエンコードし出力をパースする必要がある。

既存パイプラインが `tokenizer.apply_chat_template()` に依存するならそのコードは動作しない。vLLM/SGLang は内部処理するが、Transformers 直接使用やカスタムサーブでは **エンコーディング層を自前実装する必要がある。**

### 3.3 公式多言語情報の非対称性

DeepSeek 公式ベンチマークは英語・中国語中心 (C-Eval, CMMLU, Chinese-SimpleQA)。韓国語・日本語専用ベンチマークは公開されていない。Base モデルの MultiLoKo (多言語) が V3.2 38.7 → Flash 42.2 → Pro 51.1 と改善した程度が間接根拠である。

**ただしこれは「韓国語ができない」という意味ではない。** §5 参照。

### 3.4 サーブスタック制約

| スタック | 状態 |
|---|---|
| vLLM | ネイティブ対応 v0.22.0、本番ハードニング v0.23.0 |
| SGLang | Day-0 公式対応。MegaMoE は **Blackwell (B200/B300/GB200/GB300) 専用** |
| TGI | preview 時点未対応 |
| Ollama / llama.cpp | **コミュニティ GGUF のみ存在し公式チェックポイント比未検証** |

また 2026 年 5 月時点で **RTX Pro 6000 Blackwell で vLLM Inductor コンパイルパスクラッシュ** の報告が多数ある。メモリは十分でもソフトウェアパスが不安定なため、このカードで機器構成する前に現行 vLLM/ドライバ状態を必ず確認すること。

### 3.5 Flash の性能限界領域

Flash-Max は大きな thinking budget を与えると Pro に準じる推論性能を出すが、**純粋な知識作業と最も複雑なエージェントワークフローでは Pro に劣る。** モデルカードが直接認める部分である。

具体的に SimpleQA-Verified が Flash-Max 34.1 vs Pro-Max 57.9 で 23.8 点差である。**事実正確性が重要な用途では Flash は危険である。**

### 3.6 地政学・規制リスク (ホスティング API に限定)

DeepSeek **ホスティングサービス/アプリ/API** は多数の国で政府機器使用が禁止または制限されている。韓国は 2025 年個人情報保護委員会が国外移転問題でアプリサービスを一時停止し是正勧告し、多数の省庁・公共機関・金融圏がアクセスを遮断した。米国は連邦一部機関と多数州政府が政府機器使用を禁止し関連法案が発議された。日本・豪州・台湾・イタリアなども類似措置を取った。

**核心の区別**: これらの規制は **データが中国に送信されるホスティングサービス** を対象とし、MIT ライセンスで配布された **重みを自社インフラで稼働する行為** を禁止するものではない。この区別が §9〜11 事業シナリオ全体の前提である。

ただし組織によっては「中国製モデル」自体を排除する調達政策が存在しうるため、事前確認が必要である。

### 3.7 Preview 状態

モデルカードは自らを preview と表記する。GA チェックポイントで品質変更の可能性があるため、preview で確立したベースラインは **評価基準線として使い、最終成果物品質保証の根拠としては使わない** のが安全である。

---

## 4. ベンチマーク (公式モデルカード)

### 4.1 V4-Pro-Max vs フロンティアモデル

| ベンチマーク | Opus-4.6 Max | GPT-5.4 xHigh | Gemini-3.1-Pro High | K2.6 Thinking | GLM-5.1 Thinking | **DS-V4-Pro Max** |
|---|---|---|---|---|---|---|
| **知識・推論** | | | | | | |
| MMLU-Pro | 89.1 | 87.5 | **91.0** | 87.1 | 86.0 | 87.5 |
| SimpleQA-Verified | 46.2 | 45.3 | **75.6** | 36.9 | 38.1 | 57.9 |
| Chinese-SimpleQA | 76.4 | 76.8 | **85.9** | 75.9 | 75.0 | 84.4 |
| GPQA Diamond | 91.3 | 93.0 | **94.3** | 90.5 | 86.2 | 90.1 |
| HLE | 40.0 | 39.8 | **44.4** | 36.4 | 34.7 | 37.7 |
| LiveCodeBench | 88.8 | – | 91.7 | 89.6 | – | **93.5** |
| Codeforces (Rating) | – | 3168 | 3052 | – | – | **3206** |
| HMMT 2026 Feb | 96.2 | **97.7** | 94.7 | 92.7 | 89.4 | 95.2 |
| IMOAnswerBench | 75.3 | **91.4** | 81.0 | 86.0 | 83.8 | 89.8 |
| Apex | 34.5 | 54.1 | **60.9** | 24.0 | 11.5 | 38.3 |
| Apex Shortlist | 85.9 | 78.1 | 89.1 | 75.5 | 72.4 | **90.2** |
| **ロングコンテキスト** | | | | | | |
| MRCR 1M | **92.9** | – | 76.3 | – | – | 83.5 |
| CorpusQA 1M | **71.7** | – | 53.8 | – | – | 62.0 |
| **エージェント** | | | | | | |
| Terminal Bench 2.0 | 65.4 | **75.1** | 68.5 | 66.7 | 63.5 | 67.9 |
| SWE Verified | **80.8** | – | 80.6 | 80.2 | – | 80.6 |
| SWE Pro | 57.3 | 57.7 | 54.2 | **58.6** | 58.4 | 55.4 |
| SWE Multilingual | **77.5** | – | – | 76.7 | 73.3 | 76.2 |
| BrowseComp | 83.7 | 82.7 | **85.9** | 83.2 | 79.3 | 83.4 |
| HLE w/ tools | 53.1 | 52.0 | 51.6 | **54.0** | 50.4 | 48.2 |
| GDPval-AA (Elo) | 1619 | **1674** | 1314 | 1482 | 1535 | 1554 |
| MCPAtlas Public | **73.8** | 67.2 | 69.2 | 66.6 | 71.8 | 73.6 |
| Toolathlon | 47.2 | **54.6** | 48.8 | 50.0 | 40.7 | 51.8 |

**解釈ポイント**
- **コーディングは 1 位である。** LiveCodeBench 93.5、Codeforces 3206 でクローズドフロンティアを上回る。これが V4-Pro の最も確実な根拠である。
- **MCPAtlas 73.6 は Opus-4.6 (73.8) と事実上同率** である。MCP ベースエージェントでオープンウェイトがクローズドに並ぶ稀な事例である。
- **SimpleQA-Verified 57.9 は Gemini (75.6) に大きく劣る。** 事実照会型ワークロードには不適で、RAG なしでは使うべきでない。
- **ロングコンテキスト実測は期待に届かない。** 1M 対応だが MRCR 1M 83.5、CorpusQA 1M 62.0 で Opus-4.6 (92.9 / 71.7) に劣る。**1M を「入れられる」と「正確に読む」は別である。**
- Apex 38.3 は Gemini (60.9)・GPT-5.4 (54.1) と差が大きい。

### 4.2 モード別比較 (Flash vs Pro)

| ベンチマーク | Flash Non-Think | Flash High | Flash Max | Pro Non-Think | Pro High | Pro Max |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.0 | 86.4 | 86.2 | 82.9 | 87.1 | **87.5** |
| SimpleQA-Verified | 23.1 | 28.9 | 34.1 | 45.0 | 46.2 | **57.9** |
| Chinese-SimpleQA | 71.5 | 73.2 | 78.9 | 75.8 | 77.7 | **84.4** |
| GPQA Diamond | 71.2 | 87.4 | 88.1 | 72.9 | 89.1 | **90.1** |
| HLE | 8.1 | 29.4 | 34.8 | 7.7 | 34.5 | **37.7** |
| LiveCodeBench | 55.2 | 88.4 | 91.6 | 56.8 | 89.8 | **93.5** |
| Codeforces | – | 2816 | 3052 | – | 2919 | **3206** |
| HMMT 2026 Feb | 40.8 | 91.9 | 94.8 | 31.7 | 94.0 | **95.2** |
| Apex | 1.0 | 19.1 | 33.0 | 0.4 | 27.4 | **38.3** |
| MRCR 1M | 37.5 | 76.9 | 78.7 | 44.7 | 83.3 | **83.5** |
| CorpusQA 1M | 15.5 | 59.3 | 60.5 | 35.6 | 56.5 | **62.0** |
| Terminal Bench 2.0 | 49.1 | 56.6 | 56.9 | 59.1 | 63.3 | **67.9** |
| SWE Verified | 73.7 | 78.6 | 79.0 | 73.6 | 79.4 | **80.6** |
| SWE Pro | 49.1 | 52.3 | 52.6 | 52.1 | 54.4 | **55.4** |
| BrowseComp | – | 53.5 | 73.2 | – | 80.4 | **83.4** |
| MCPAtlas | 64.0 | 67.4 | 69.0 | 69.4 | **74.2** | 73.6 |
| Toolathlon | 40.7 | 43.5 | 47.8 | 46.3 | 49.0 | **51.8** |

**実務上最も重要な表である。**

- **Flash High がコスパ最適点である。** MMLU-Pro 86.4 は Flash Max (86.2) より高く、LiveCodeBench 88.4 は Max (91.6) と 3.2 点差だがトークン消費ははるかに少ない。
- **MCPAtlas は Pro High (74.2) が Pro Max (73.6) より高い。** ツール呼び出しでは過剰推論が有害である。**エージェントオーケストレーションは High に固定すること。**
- **Non-think はコーディング・数学・エージェントに使うべきでない。** LiveCodeBench 55.2、Apex 1.0、HLE 8.1 で事実上無力である。Non-think は分類・要約・ルーティング専用である。
- **SWE Verified は Flash High 78.6 vs Pro Max 80.6 で 2 点差** である。コード修正作業なら Flash で十分である。

### 4.3 Base モデル (事前学習品質)

| ベンチマーク | V3.2-Base | V4-Flash-Base | V4-Pro-Base |
|---|---|---|---|
| MMLU (5-shot) | 87.8 | 88.7 | **90.1** |
| MMLU-Pro (5-shot) | 65.5 | 68.3 | **73.5** |
| MMMLU (5-shot) | 87.9 | 88.8 | **90.3** |
| C-Eval (5-shot) | 90.4 | 92.1 | **93.1** |
| CMMLU (5-shot) | 88.9 | 90.4 | **90.8** |
| **MultiLoKo (多言語)** | 38.7 | 42.2 | **51.1** |
| Simple-QA verified | 28.3 | 30.1 | **55.2** |
| FACTS Parametric | 27.1 | 33.9 | **62.6** |
| SuperGPQA | 45.0 | 46.5 | **53.9** |
| HumanEval | 62.8 | 69.5 | **76.8** |
| BigCodeBench | **63.9** | 56.8 | 59.2 |
| MATH | 60.5 | 57.4 | **64.5** |
| LongBench-V2 | 40.2 | 44.7 | **51.5** |

**MultiLoKo 51.1 (Pro) は V3.2 比 +12.4 点** で改善幅が最大の項目の一つである。多言語能力が世代間で実質的に向上したシグナルである。

注意点: **BigCodeBench と MATH で V4-Flash-Base が V3.2-Base より低い。** 活性パラメータが 37B → 13B に減った代償であり、Flash を V3.2 代替として無批判に採用すると回帰が起きうる。

---

## 5. 韓国語・日本語性能 — 公式情報なし、第三者データあり

DeepSeek は韓国語ベンチマークを公開していない。しかし **Upstage が Solar Open 2 発表 (2026-07-22) 時に DeepSeek-V4-Flash を比較群として評価したデータ** がある。競合が自社モデルを際立たせる表である点から、V4-Flash に有利に操作するインセンティブはないデータである。

| 韓国語ベンチマーク | DeepSeek-V4-Flash | Solar Open 2 | GPT-5.4 mini | Claude Haiku 4.5 |
|---|---|---|---|---|
| KMMLU-Pro | **78.9** | 78.4 | 78.1 | 67.9 |
| CLIcK | 89.2 | **90.7** | 89.6 | 53.5 |
| HAE-RAE v1.1 | 73.1 | **73.8** | 69.4 | 38.5 |
| Ko-AIME'25 | **98.0** | 97.7 | 90.7 | 81.7 |
| HRM8K | **93.4** | 92.2 | 91.3 | 90.6 |
| KBank-MMLU (金融) | 79.5 | **80.8** | 79.0 | 68.9 |
| KBL (法律) | 72.8 | **75.5** | 75.3 | 69.9 |
| KorMedMCQA | 94.1 | 93.0 | **94.2** | 87.0 |
| Ko-GDPval | 85.0 | **86.8** | 59.4 | 68.3 |
| **韓国語平均** | 84.9 | **85.4** | 80.8 | 69.6 |

また Ko-GDPval で **DeepSeek-V4-Pro (1.6T) は 86.91 点** で Solar Open 2 (86.75) を僅差で上回った。

**結論が覆る。** v1 文書の「韓国語性能情報不足 → 韓国導入時追加ファインチューニング必要」という診断は事実と異なる。**DeepSeek-V4-Flash は韓国語専用最適化モデルと 0.5 点差の韓国語性能を出す。** 韓国語数学 (Ko-AIME 98.0、HRM8K 93.4) と総合知識 (KMMLU-Pro 78.9) はむしろ先行する。

**日本語** は依然として公開データがない。Nejumi リーダーボードや JMMLU 自社測定が必要である。

**韓国語利用時の実務注意点**
- トークナイザが韓国語最適化されておらず **トークン消費が韓国語特化モデルより多い。** 性能は同等でもコストは不利になりうるため実測が必要
- 韓国特有の文書書式・行政慣用表現は学習されていない可能性が高い。Ko-GDPval 85.0 はそれでもかなり高い数値だが、社内書式 few-shot 注入は必須
- 中国語政治・歴史関連トピックで応答バイアスが報告されている。該当ドメインを扱うなら事前検証すること

---

## 6. 競合プロジェクト比較

### 6.1 Solar Open 2 (Upstage, 250B-A15B)

| 項目 | **DeepSeek-V4-Flash** | **Solar Open 2** |
|---|---|---|
| 開発元 | DeepSeek (中国) | Upstage (韓国) |
| 総 / 活性 | 284B / 13B | 250B / 15B |
| 公開 | 2026 年 4 月末 | 2026-07-22 |
| コンテキスト | 1M | 1M |
| **ライセンス** | **MIT (無制約)** | Upstage Solar License (ネーミング・表記義務) |
| Base 公開 | **あり** | なし |
| ハードウェア | 2×H200 (FP4+FP8) | 4×H200 (BF16) / 2×H200 (量子化) |
| 韓国語平均 | 84.9 | **85.4** |
| MMLU-Pro | 85.9 | **86.2** |
| LiveCodeBench | 92.3 | **92.4** |
| SWE-Bench Verified | **73.8** | 70.4 |
| MCP-Atlas | 58.2 | 58.2 |
| Terminal Bench Hard | **34.1** | 28.3 |
| τ³ (banking) | **22.3** | 19.6 |
| APEX-Agents | 13.2 | **16.6** |

**正直な結論**: 両モデルは性能上対等で韓国語ですら 0.5 点差である。Solar Open 2 が優位なのは APEX-Agents、韓国語トークン効率 (グローバル比 50〜80%)、韓国業務文脈学習である。DeepSeek-V4-Flash が優位なのは **MIT ライセンス、Base モデル公開、エージェントコーディング (SWE・Terminal)、より低い活性パラメータ** である。

韓国企業の選択基準は性能ではなく別軸で分かれる — **国産調達要件があれば Solar、ライセンス自由度とファインチューニング柔軟性が重要なら DeepSeek、中国製排除政策があれば Solar。**

### 6.2 Kimi K3 (Moonshot AI, 2.8T)

| 項目 | DeepSeek-V4-Pro | Kimi K3 |
|---|---|---|
| 総パラメータ | 1.6T | **2.8T** |
| 活性 | 49B | 16 experts 活性 (896 中) |
| 公開 | 2026 年 4 月末 | API 7/16、重み **2026-07-27** |
| ライセンス | MIT | Modified MIT |
| マルチモーダル | テキスト | **ネイティブビジョン** |
| コンテキスト | 1M | 1M |
| API 価格 | $0.435 / $0.87 | $3 / $15 |
| 推論モード | 3 段選択 | thinking 常時 |

モデルカード基準 K2.6 Thinking との比較で V4-Pro-Max は LiveCodeBench (93.5 vs 89.6)、MCPAtlas (73.6 vs 66.6) で先行し、SWE Pro (55.4 vs 58.6)、HLE w/tools (48.2 vs 54.0) で劣る。K3 は世代が一つ進んでいるため重み公開後に再評価が必要である。

**価格差が決定的である。** V4-Pro は K3 の約 1/7〜1/17 水準である。フロンティア最上段が不要な大半の本番ワークロードでは V4-Pro の経済性が圧倒する。

### 6.3 V4-Pro vs V4-Flash 選択基準

| 条件 | 推奨 |
|---|---|
| 事実正確性が重要 (SimpleQA 57.9 vs 34.1) | **Pro** |
| コード修正・テスト通過 (SWE 80.6 vs 79.0) | **Flash** — 1.6 点差にインフラ 5 倍 |
| ロングコンテキスト正確度 (MRCR 83.5 vs 78.7) | Pro |
| MCP ツール呼び出し (74.2 vs 69.0) | Pro High |
| ブラウジングエージェント (83.4 vs 73.2) | **Pro** — 10 点差 |
| 自社ホスティング予算制約 | **Flash** |
| 分類・ルーティング・要約 | Flash Non-think |

一般原則: **Flash High をデフォルトにし、SimpleQA・BrowseComp 型タスクのみ Pro にルーティング** するハイブリッドがコスト対効果最適である。DeepSeek 公式 Claude Code レシピもまさにこの構造 (メイン Pro、サブエージェント Flash) である。

---

## 7. Getting Started

### 7.1 ハードウェア要件

| モデル | 精度 | 重み | 総 VRAM 予算 | 構成 |
|---|---|---|---|---|
| **V4-Flash** | FP4+FP8 | ~158GB | ~170–175GB | **2×H200** または 4×A100 80GB |
| V4-Flash | コミュニティ INT4 | ~90GB | – | 4×RTX 4090 (未検証) |
| **V4-Pro** | FP4+FP8 | ~862GB | ~960GB | **8×H200 141GB 単一ノード** または B300 8-GPU |
| V4-Pro | マルチノード | – | – | 16×H100 80GB 2 ノード + IB |

- システム RAM: Flash 基準 256GB 以上、ストレージ NVMe 500GB 以上
- vLLM テンソル並列は 2 の累乗 (1/2/4/8) で最適。2×A100 (160GB) は 1M コンテキスト予算に不足のため 4×A100 推奨
- **V4-Pro は 8×H100 80GB (640GB) に収まらない**

### 7.2 チャットエンコーディング (必須の事前理解)

**本リリースには Jinja チャットテンプレートがない。** `encoding` フォルダのスクリプトを使用する。

```python
from encoding_dsv4 import encode_messages, parse_message_from_completion_text
import transformers

messages = [
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "Hello! I am DeepSeek.", "reasoning_content": "thinking..."},
    {"role": "user", "content": "1+1=?"},
]

# messages -> string
prompt = encode_messages(messages, thinking_mode="thinking")

# string -> tokens
tokenizer = transformers.AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V4-Pro")
tokens = tokenizer.encode(prompt)
```

マルチターンでは前ターンの `reasoning_content` を維持することに注意する。

### 7.3 vLLM サーブ (推奨)

```bash
# vLLM v0.23.0 以上推奨 (ネイティブ対応は v0.22.0 から)
pip install -U vllm

# V4-Flash: 2×H200、1M コンテキスト
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --served-model-name deepseek-v4-flash \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel

# 保守的開始 (4×A100、128K コンテキスト)
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --tensor-parallel-size 4 \
  --max-model-len 131072
```

```bash
# V4-Pro: 8×H200
vllm serve deepseek-ai/DeepSeek-V4-Pro \
  --served-model-name deepseek-v4-pro \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --max-model-len 393216   # Think Max は 384K 以上推奨
```

> v1 の `--enforce-eager` は削除した。CUDA グラフを無効化し本番スループットを大幅に下げる。

### 7.4 SGLang サーブ

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path deepseek-ai/DeepSeek-V4-Flash \
    --host 0.0.0.0 --port 30000 \
    --tp 2 \
    --context-length 1048576
```

MegaMoE バックエンド (精度損失ほぼなくスループット向上、Pro 基準 GPQA ~89.5) は **Blackwell 系 (B200/B300/GB200/GB300) 専用** である。Hopper (H100/H200) では使用できない。

### 7.5 DSpark 適用

```bash
# 既存重み + draft モジュール。別モデルではない
vllm serve deepseek-ai/DeepSeek-V4-Flash-DSpark \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel
```

同一出力分布を保証するため品質回帰なくスループットのみ上がる。ただし自社スタックで 60〜85% がそのまま再現されるかは実測すること。

### 7.6 サンプリングパラメータ

| パラメータ | 公式推奨 | 備考 |
|---|---|---|
| temperature | **1.0** | v1 の 0.7 は誤り |
| top_p | **1.0** | v1 の 0.9 は誤り |
| max output | 最大 384K | |
| コンテキスト (Think Max) | **384K 以上** | 不足時は推論途中で切れる |

### 7.7 API 利用 (自社ホスティングなし)

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "説明して"}],
    "thinking": true
  }'
```

- OpenAI ChatCompletions 形式と Anthropic 形式 **両方対応**
- thinking モードはモデル ID ではなく `thinking` パラメータで制御
- **レガシー `deepseek-chat` / `deepseek-reasoner` は 2026-07-24 15:59 UTC より終了** し HTTP 400 を返す。`deepseek-v4-flash` / `deepseek-v4-pro` に置換すること
- **ホスティング API はデータが中国に送信される。** 機密情報には使用しないこと (§3.6)

### 7.8 Claude Code 連携 (公式設定)

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<your DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
cd /path/to/project && claude
```

> v1 の `api.deepseek.com/v1` は誤りである。Anthropic 互換パスは **`/anthropic`** であり、`[1m]` 接尾辞は 1M コンテキストを指定する DeepSeek 固有 modifier のため文書どおり維持する。ゲートウェイ経由では課金精算時にこの接尾辞正規化が必要な場合がある。

**自社ホスティング vLLM に接続する場合** は上記 URL を内部エンドポイントに置き換えればよい。規制環境での標準パスである。

### 7.9 GGUF / ローカル実行 (未検証)

llama.cpp・Ollama 用コミュニティ GGUF は存在するが **公式チェックポイント比検証されていない。** 実験用途のみとし、本番には vLLM または SGLang を使うこと。メインライン対応は時点により異なるため導入前に現行状態を直接確認すること。

---

## 8. 重要利用例 (Key Use Cases)

### 8.1 リポジトリ全体コードエージェント — 最強領域

LiveCodeBench 93.5、Codeforces 3206 はクローズドフロンティアを上回る数値である。ここに 1M コンテキストが加わると **モノリシックレガシーコードベースを丸ごと入れてリファクタリング** するシナリオが成立する。

```bash
# 社内 vLLM に Claude Code 接続
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
cd ~/legacy-erp && claude
```

**コスト設計が核心である。** オーケストレーションは Pro、サブエージェントは Flash に分離すれば品質損失ほぼなくコストが大きく下がる。SWE Verified が Flash High 78.6 vs Pro Max 80.6 なのでサブエージェントに Pro を使う理由はない。

### 8.2 1M コンテキスト文書分析 — ただし検証後

```python
from openai import OpenAI
client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "content": f"""
以下は本契約書、附属合意書 3 件、社内標準契約ガイドライン全文である。

{full_documents}

1. 文書間の矛盾条項を条項番号付きですべて抽出
2. 標準ガイドライン違反条項と違反理由
3. 条項別リスク等級と交渉優先順位

根拠のない推測は禁止し、原文条項を引用して提示せよ。
"""}],
    temperature=1.0, top_p=1.0, max_tokens=131072,
)
```

**必ず指摘すべき限界**: MRCR 1M 83.5、CorpusQA 1M 62.0 である。Opus-4.6 (92.9 / 71.7) より低い。**コンテキストに入れたから正確に読む保証はない。**

実務推奨:
- 100 万トークンを満たさず **200〜400K 水準で運用**
- 重要条項は **2 回独立クエリでクロス検証**
- 自社 needle-in-haystack テストで実戦閾値を先に測定すること

### 8.3 MCP ベースエージェントオーケストレーション

MCPAtlas Public 73.6 は Opus-4.6 (73.8) と事実上同率で、オープンウェイト中最高位である。

```python
resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[...],
    tools=mcp_tools,
    extra_body={"thinking": True},   # Think High
)
```

**Think High を使うこと。** MCPAtlas が Pro High 74.2 > Pro Max 73.6 で、最大推論がむしろ損になる。ツール呼び出しでは過剰な熟考が誤動作を増やす。

### 8.4 事実照会型ワークロード — 使用禁止または RAG 必須

SimpleQA-Verified が Pro-Max 57.9、Flash-Max 34.1 である。Gemini-3.1-Pro (75.6) と差が大きい。

**Flash で事実質問を処理すると 3 分の 2 が誤る可能性がある。** 社内知識 Q&A、規定照会、顧客問い合わせ対応などは必ず RAG で根拠を注入し、根拠のない回答を拒否するシステムプロンプト設計が必要である。

```python
SYSTEM = """提供文書に根拠がない内容は絶対に答えないこと。
根拠がなければ「該当情報を見つけられません」と答え、
回答したすべての事実について出典文書名とページを明記せよ。"""
```

### 8.5 ドメイン特化 continued pretraining

**Base モデル公開がこのシナリオを可能にする。** MIT ライセンスのため派生モデルネーミング・表記義務もない。

```
V4-Flash-Base → 国内金融規定・約款 continued pretraining → 自社ブランドモデル
V4-Flash-Base → 日本語コーパス continued pretraining → 日本語特化モデル
V4-Flash-Base → 社内コードベース + 技術文書 → 組織専用コーディングモデル
```

284B-A13B は continued pretraining が現実的な最大規模に近い。1.6T Pro-Base の学習インフラ要件は事実上国家級である。

### 8.6 コスト最適化ルーティング

```python
def route(task_type: str) -> dict:
    return {
        "classify":   {"model": "deepseek-v4-flash", "thinking": False},
        "summarize":  {"model": "deepseek-v4-flash", "thinking": False},
        "code_fix":   {"model": "deepseek-v4-flash", "thinking": True},
        "code_arch":  {"model": "deepseek-v4-pro",   "thinking": True},
        "tool_agent": {"model": "deepseek-v4-pro",   "thinking": True},   # Max ではない
        "fact_query": {"model": "deepseek-v4-pro",   "thinking": True},   # + RAG
        "browse":     {"model": "deepseek-v4-pro",   "thinking": True},
    }[task_type]
```

キャッシュヒット入力が $0.003625/1M のため **システムプロンプトを固定し prefix caching を最大活用** すれば入力コストはほぼ消える。エージェントワークロードでこの効果が最大である。

---

## 9. 韓国市場事業導入シナリオ

### 9.0 前提: 規制の正確な範囲を理解すること

韓国は 2025 年個人情報保護委員会が DeepSeek アプリの国外移転問題で国内サービスを一時停止し是正勧告し、外務部・国防省・産業通商資源部など多数省庁と韓水原・韓電 KPS など公共機関、主要金融圏がアクセスを遮断した。カカオ・LINE ヤフーなど民間 IT 企業も業務目的使用を禁止した。

**しかしこれら措置の対象はホスティングサービスである。** MIT ライセンス重みを社内 GPU で稼働する行為はデータがどこにも出ないため規制論理自体が成立しない。

**したがって韓国で DeepSeek-V4 の唯一の正当な導入経路は自社ホスティングである。** API 利用は論外として安全である。

同時に現実的制約も認めるべきである。調達・審査過程で「中国製モデル」という事実自体が減点要因になる組織がある。特に公共・防衛・金融一部はモデル出所を技術検証と無関係に排除する。**この場合 Solar Open 2 が代替であり、性能差は 0.5 点水準で実質損失はほぼない。**

### 9.1 ソフトウェア開発組織 — 最優先

| 項目 | 内容 |
|---|---|
| 対象 | ゲーム会社、SI、プラットフォーム、スタートアップ開発チーム |
| 根拠 | LiveCodeBench 93.5 (1 位)、Codeforces 3206、SWE Verified 80.6、MIT ライセンス |
| 課題 | ソースコード外部持ち出し禁止、商用コーディングアシスタントライセンスコスト、レガシーコード文書化不足 |
| 構成 | 社内 2×H200 に Flash + Claude Code/OpenCode 接続。Pro はクラウド GPU で必要時 |
| KPI | PR リードタイム、レビュー指摘件数、テストカバレッジ |
| 強み | **規制グレーゾーンがない。** コードに個人情報がなく、自社ホスティングで、ライセンスが MIT である |

韓国で DeepSeek-V4 を導入する際、政治的摩擦が最も少なく効果が最も確実な領域である。

### 9.2 金融圏 — 自社ホスティングバックオフィス

| 項目 | 内容 |
|---|---|
| 根拠 | KBank-MMLU 79.5、KBL 72.8、τ³ banking 22.3 (Solar 19.6 比優位)、ネットワーク分離対応 |
| 構成 | 内部網 2×H200 Flash。外部通信完全遮断 |
| 成果物 | 規定 Q&A (RAG 必須)、審査報告書初稿、コードレビュー |
| リスク | **SimpleQA 34.1 (Flash)。** 金融規定質問を RAG なしで処理してはならない |
| 現実 | 多数金融機関が既に DeepSeek アクセスを遮断している。自社ホスティングでも **内部承認難易度が高い。** 事前に情報保護部門と「重み自社稼働 ≠ データ国外移転」の論点を整理すること |

### 9.3 製造・物流 — オンプレミス文書・コード

| 項目 | 内容 |
|---|---|
| 根拠 | 1M コンテキスト、MIT ライセンスで自社ブランド組み込み自由 |
| 用途 | PLC/MES レガシーコード分析、技術文書多言語化 (韓・英・中)、仕様書クロス検証 |
| 特記 | **中国現地法人・協力会社がある企業では中国語能力 (C-Eval 93.1、CMMLU 90.8) が実質資産になる。** Solar Open 2 は中国語非対応 |
| リスク | 技術ノウハウ流出懸念が大きい業種のため完全閉域網必須 |

### 9.4 公共・防衛 — 推奨しない

技術的には自社ホスティングで解決できるが、**調達政策と国情院セキュリティ審査で中国製モデルは通過が事実上困難である。** 政府は公共 IT 事業の AI 技術について国家情報院セキュリティ審査を要求している状況である。

この領域は Solar Open 2 または他国産モデルでアプローチするのが現実的である。

### 9.5 韓国シナリオ優先順位

| 順位 | セグメント | 性能根拠 | 規制摩擦 | 総合 |
|---|---|---|---|---|
| 1 | 開発組織コーディングエージェント | 非常に高い | 低い | **積極推奨** |
| 2 | 製造オンプレミス (中国連携) | 高い | 中 | 推奨 |
| 3 | ドメイン特化派生モデル開発 | 高い (Base 公開) | 低い | 推奨 |
| 4 | 金融バックオフィス | 中 | 高い | 条件付き |
| 5 | 公共・防衛 | – | 非常に高い | 非推奨 |

---

## 10. 日本市場事業導入シナリオ

### 10.0 前提: 未検証の日本語 + オンプレミス志向

日本はオンプレミス志向が構造的に強い市場であり MIT ライセンスオープンウェイトは原理的によく合う。一方 **日本語性能について公開根拠がまったくない。** MultiLoKo 51.1 (Pro Base) が間接シグナルにすぎない。

日本政府も DeepSeek 関連規制を検討してきた国の一つとして言及され、LINE ヤフーは役職員業務使用を禁止した実績がある。

**必須の事前作業**
1. W&B Nejumi リーダーボード基準の自社測定
2. JMMLU / JCommonsenseQA 自社測定
3. 日本語トークン効率実測 (中国語最適化トークナイザが日本語漢字処理に有利な可能性とかな処理に不利な可能性が共存)
4. 敬語体・ビジネス慣用表現正確度 PoC

この検証なしに日本の顧客へ提案してはならない。

### 10.1 日本 IT・SIer コーディングエージェント — 最優先

| 項目 | 内容 |
|---|---|
| 根拠 | コードは言語中立である。**日本語検証問題を回避する唯一の用途** |
| 対象 | SIer、社内情報システム部門、SaaS 開発会社 |
| 課題 | COBOL・レガシー資産の近代化、開発人材不足、コード外部持ち出し禁止 |
| 構成 | オンプレミス 2×H200 Flash + Claude Code |
| 強み | SWE Multilingual 76.2 で多言語コードベース (日本語コメント含む) に強い |

日本市場で即時着手可能な唯一のシナリオである。

### 10.2 日本語特化派生モデル開発 — 中長期戦略

**Base モデル公開 + MIT ライセンスが生む機会である。**

Upstage が Solar ベースで日本のカラクリと Syn Pro (31B) を作り Nejumi 1 位を記録したのと同じ戦略を、DeepSeek-V4-Flash-Base 上で **ライセンス制約なしに** 実行できる。Solar License は "Solar" 接頭辞と "Built with Solar" 表記を要求するが、MIT は何も要求しない。

| 段階 | 内容 |
|---|---|
| 1 | V4-Flash-Base に日本語コーパス continued pretraining |
| 2 | 日本ビジネス文書・敬語体 SFT |
| 3 | 自社ブランドで配布 (ネーミング自由) |
| 条件 | 284B 規模 CPT は相当なコンピュートが必要。日本パートナーまたはソフトバンク AI クラウド等の活用検討 |

### 10.3 日本製造業 — 条件付き

| 項目 | 内容 |
|---|---|
| 根拠 | オンプレミス適合、1M コンテキスト、中国現地工場対応時の中国語能力 |
| リスク | 日本製造業は文書形式遵守要求が極めて厳しい。日本語検証未完状態では危険 |
| アプローチ | コード・設計データ分析から始め、日本語文書生成は検証後 |

### 10.4 日本金融・公共 — 非推奨

中国製モデルへの警戒が強く契約サイクルが長い。日本パートナーとの共同開発派生モデル形態 (§10.2) 以外は現実性が低い。

### 10.5 日本シナリオ優先順位

| 順位 | セグメント | 日本語依存度 | 総合 |
|---|---|---|---|
| 1 | コーディングエージェント | 低い | **即時着手可能** |
| 2 | 日本語派生モデル開発 | – (直接改善) | 中長期最大機会 |
| 3 | 製造設計・コード分析 | 低い | 推奨 |
| 4 | 日本語文書業務 | 高い | 検証後 |
| 5 | 金融・公共 | 高い | 非推奨 |

---

## 11. 米国市場事業導入シナリオ

### 11.0 前提: 規制地形が最も複雑な市場

米国では 3 つの層を区別する必要がある。

| 層 | 状態 |
|---|---|
| 一般消費者 | 全国的禁止なし |
| 連邦・州政府・国防・情報機関 | **政府機器・システムで禁止。** Commerce、Navy、NASA など多数機関、テキサス・ニューヨーク・バージニア・テネシーなど多数州 |
| 政府契約者 | 契約条件により拘束されうる |
| 民間企業 | 自社方針に従う |

`No DeepSeek on Government Devices Act` (H.R.1121) など連邦レベル立法が進行した。

**決定的な区別**: これらの規制は「DeepSeek アプリケーションまたはその後継アプリケーション・サービス」を対象とし、根拠は **データが中国サーバーに送信される** 点である。**米国インフラで MIT 重みを自社稼働する行為はデータ送信が発生しない。**

実際に NVIDIA が `nvidia/DeepSeek-V4-Pro-NVFP4` 量子化モデルを配布し build.nvidia.com にモデルカードを掲載し、Runpod・Spheron など米国 GPU クラウドが展開ガイドを提供している。**米国インフラ上で V4 を稼働するのは既に標準的慣行である。**

### 11.1 AI スタートアップ — コスト構造そのものを変える選択

| 項目 | 内容 |
|---|---|
| 対象 | シード〜シリーズ A、フロンティア API コストがバーンレートを圧迫する段階 |
| 根拠 | V4-Pro が Opus 比入力約 34 倍、出力約 86 倍安価。MIT ライセンス |
| 構成 | 初期 API → PMF 確認後自社ホスティング移行 |
| 注意 | **エンタープライズデューデリジェンスで「中国モデル？」質問が必ず出る。** 自社ホスティングアーキテクチャ図を事前準備すること |
| 強み | MIT のためファインチューニング・再配布・自社ブランド化に法的摩擦がない |

### 11.2 開発者ツール / コーディング SaaS

| 項目 | 内容 |
|---|---|
| 根拠 | LiveCodeBench 93.5、Codeforces 3206、SWE Verified 80.6 |
| 経済性 | コーディングエージェントはトークン消費が極端である。**ここで 34〜86 倍の価格差がマージンを生む** |
| 構成 | 自社 VPC 内 8×H200 (Pro) または 2×H200 (Flash) クラスター |
| 事例 | Morph などが既に V4-Flash を bf16 無量子化でサーブ中 |
| リスク | サーバーレスホスト多数が活性値を fp8 量子化し参照重みと出力が異なる。**品質一貫性が重要なら自社サーブすること** |

### 11.3 規制産業 (ヘルスケア・金融) — VPC 展開

| 項目 | 内容 |
|---|---|
| 根拠 | HIPAA・SOC2・GLBA 準拠のためデータが外部に出られない |
| 構成 | AWS/Azure/GCP VPC 内自社展開。外部 egress 遮断 |
| 経済性 | p5.48xlarge オンデマンド約 $55/h、1 年予約約 $33/h |
| **冷静な計算** | API 料金 ($0.14/$0.28) 基準の損益分岐は **日 30〜40 億トークン** 水準である。8×H100 単一ノードでは物理的に処理できない量である |
| 結論 | **コスト削減ではなくデータ主権・規制準拠・ファインチューニングが自社ホスティングの理由である。** コスト論理で自社ホスティングを正当化するとデューデリジェンスで崩れる |

### 11.4 連邦契約者 / 公共 — 契約書確認必須

技術的には自社ホスティング可能だが、**契約条項に中国起源ソフトウェア排除条項がある場合がある。** 重みがソフトウェアに該当するかの解釈は契約ごとに異なる。

法務レビューなしで進めてはならない領域である。進めるなら:
- 契約担当官 (CO) への事前書面照会
- モデル出所、展開アーキテクチャ、データフローの文書化
- 代替モデル (Llama、Mistral、GPT-OSS 等) の並行検討

### 11.5 米国シナリオ優先順位

| 順位 | セグメント | 経済性 | 規制摩擦 | 総合 |
|---|---|---|---|---|
| 1 | コーディング SaaS / 開発者ツール | 非常に高い | 低い | **積極推奨** |
| 2 | AI スタートアップバックエンド | 非常に高い | 中 (デューデリジェンス対応) | 推奨 |
| 3 | 規制産業 VPC | 低い (主権が目的) | 中 | 条件付き |
| 4 | 連邦契約者 | – | 高い | 法務レビュー必須 |
| 5 | 政府機関直接 | – | 禁止 | 不可 |

### 11.6 3 カ国比較サマリー

| 軸 | 韓国 | 日本 | 米国 |
|---|---|---|---|
| 規制性質 | 個人情報国外移転 + 公共遮断 | 検討段階 + 民間自主禁止 | 政府・契約者明示禁止 |
| 自社ホスティング正当性 | 成立 | 成立 | 成立 (慣行確立) |
| 言語根拠 | **第三者データ十分 (84.9)** | **なし (検証必須)** | 問題なし |
| 最適参入点 | 開発組織コーディング | コーディング + 派生モデル開発 | コーディング SaaS |
| 最大障害 | 中国製排除感情 | 日本語未検証 | エンタープライズデューデリジェンス |
| 代替モデル | Solar Open 2 (性能対等) | Syn Pro 等現地モデル | Llama、Mistral、GPT-OSS |

**3 市場すべてでコーディングエージェントが最優先である。** 言語検証が不要で、性能根拠が最も確実 (LiveCodeBench 1 位) で、個人情報が介在せず規制摩擦が最小だからである。

---

## 12. 導入判断チェックリスト

### 12.1 技術検証

- [ ] Flash vs Pro 実タスク品質差の測定 — 大半 Flash で十分という仮説をまず反証すること
- [ ] **モード別 (Non-think / High / Max) 品質・コスト・遅延 3 軸測定** — 最大のレバーである
- [ ] 1M コンテキスト needle-in-haystack 自社測定 (MRCR 83.5 / CorpusQA 62.0 の実戦的意味)
- [ ] SimpleQA 脆弱性対応: RAG パイプライン構築と根拠なし回答拒否の検証
- [ ] `encoding_dsv4` 統合 — 既存 `apply_chat_template` 依存コードの全数点検
- [ ] 韓国語トークン効率実測 (性能は同等でもコストは異なりうる)
- [ ] 日本語利用時は Nejumi / JMMLU 自社評価 (必須)
- [ ] DSpark 適用前後スループット実測
- [ ] 中国語政治・歴史ドメイン応答バイアス点検 (該当時)

### 12.2 インフラ

- [ ] vLLM v0.23.0 以上確認。SGLang MegaMoE は Blackwell 専用
- [ ] RTX Pro 6000 Blackwell 使用時 Inductor コンパイル問題の現行状態確認
- [ ] Pro 導入時 8×H200 単一ノード確保可能性 (8×H100 では不可)
- [ ] サーバーレスホスト使用時 fp8 活性値量子化の有無確認 — 参照重みと出力が異なる
- [ ] Preview → GA 移行時再評価計画
- [ ] キャッシュヒット最適化設計 (prefix caching)

### 12.3 ガバナンス・法務

- [ ] **ホスティング API 使用禁止の決定** — 機密データは自社ホスティング以外選択肢なし
- [ ] 組織調達政策の中国製ソフトウェア排除条項確認
- [ ] (米国) 連邦契約条項レビュー、CO 事前照会
- [ ] (韓国) 情報保護部門と「重み自社稼働 ≠ データ国外移転」論点の事前整理
- [ ] エンタープライズ顧客デューデリジェンス対応資料準備 (展開アーキテクチャ、データフロー図)
- [ ] MIT ライセンス写し同梱 (唯一の義務)

### 12.4 コスト

- [ ] **自社ホスティング損益分岐の実計算** — API 比日 30〜40 億トークンが損益分岐。大半の組織はこれを超えない
- [ ] 自社ホスティングの真の理由を明文化: データ主権 / 規制準拠 / ファインチューニング / 遅延のいずれか
- [ ] モード別トークン消費測定後ルーティング方針策定

---

## 13. ライセンス

**MIT License.** リポジトリとモデル重みの両方に適用される。

| 項目 | 内容 |
|---|---|
| 商用利用 | 自由 |
| 修正・ファインチューニング | 自由 |
| 再配布 | 自由 |
| 派生モデルネーミング | **制約なし** |
| 表記義務 | **なし** |
| 唯一の義務 | ライセンス・著作権表示の写し同梱 |

Upstage Solar License (接頭辞・表記義務)、Llama Community License (ユーザー数制限・表記)、Modified MIT (Kimi K3) 比で最も自由である。**自社ブランド製品に組み込む計画ならこの項目だけでも選択根拠になる。**

---

## 14. 引用

```bibtex
@misc{deepseekai2026deepseekv4,
      title={DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence},
      author={DeepSeek-AI},
      year={2026},
}
```

---

## 15. 参考資料

| 区分 | リンク |
|---|---|
| V4-Pro モデルカード | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro |
| V4-Flash モデルカード | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash |
| V4-Pro-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base |
| V4-Flash-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base |
| DSpark チェックポイント | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark |
| DSpark (Flash) | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark |
| NVIDIA NVFP4 量子化 | https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4 |
| 技術報告書 | https://arxiv.org/abs/2606.19348 |
| API ドキュメント | https://api-docs.deepseek.com/ |
| Claude Code 連携 (公式) | https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/ |
| コーディングエージェント統合 (公式) | https://api-docs.deepseek.com/guides/coding_agents/ |
| SGLang 展開ガイド | https://lmsysorg.mintlify.app/cookbook/autoregressive/DeepSeek/DeepSeek-V4 |
| DeepSpec (spec decoding) | https://github.com/deepseek-ai/DeepSpec |

---

*ベンチマーク数値は DeepSeek 公式モデルカード基準である。韓国語データは Upstage が Solar Open 2 発表時に公開した第三者評価結果であり DeepSeek 公式数値ではない。モデルカード自体が preview 状態を明記するため、導入判断は自社データ再現評価を前提とすること。*
