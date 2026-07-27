<!--
---
title: "Solar Open 2 (250B-A15B) Getting Started — Upstage オープンウェイトガイド"
title_en: "Solar Open 2 (250B-A15B) Getting Started — Upstage Open-Weight Guide"
subtitle: "Agent向け Hybrid MoE · 1M コンテキスト · H200 オンプレミス展開"
description: "Upstage Solar Open 2(250B-A15B) の公式スペック・ベンチマーク・Docker/vLLM セットアップ・量子化・エージェント導入チェックリストをまとめた TechDoc。Chat ではなく Agent 設計前提と v1 訂正事項を含む。"
abstract: |
  Solar Open 2 は Upstage が 2026-07-22 に公開した Hybrid-Attention MoE オープンウェイトモデル（総 250B、活性 15B/トークン、1M コンテキスト）である。
  Agentic Use（ロングホライズン・ロングコンテキスト・ツール呼び出し）とオンプレミス推論コスト（H200×4 BF16 / 量子化時 ×2）を同時に狙う。
  本ドキュメントは v1 誤りの訂正、アーキテクチャ・ベンチマーク・競合モデル（MiMo-V2.5 等）、Docker/Transformers 実行、導入前チェック項目を公式モデルカード・技術ブログ基準で整理する。
summary_for_ai: |
  Hands-on TechDoc for Upstage Solar Open 2 (250B-A15B), released 2026-07-22.
  Hybrid-Attention MoE, NoPE + linear attention, 1M context, Upstage Solar License.
  Benchmarks are vendor-reported; third-party verification still thin. Not investment advice.
  Verify current HF card, Docker flags, and quantization notes before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim（金浩光）"
lang: ja
tags:
  - Solar Open 2
  - Upstage
  - Open Weight
  - MoE
  - LLM
  - Agent
  - vLLM
  - 日本語
keywords:
  - "Solar Open 2"
  - "250B-A15B"
  - "Upstage"
  - "オープンウェイト"
  - "Hybrid Attention MoE"
  - "1M context"
  - "H200"
  - "Agentic LLM"
group: llm-agents
featured: true
featured_rank: 3
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Solar Open 2 (250B-A15B) プロジェクトガイド — 最終検証版

> **ドキュメント版** v2.0 (2026-07-27) · **検証基準** Upstage 公式モデルカード / 技術ブログ(2026-07-22) / 国内外報道
> **注意** ベンチマーク数値は Upstage 自身の発表基準であり、第三者独立検証（Artificial Analysis 等）はまだ蓄積されていない。導入判断時は内部データでの再現評価を前提に読むこと。

---

## 0. v1 からの主要修正事項

| # | 項目 | v1 の記載 | 訂正内容 |
|---|---|---|---|
| 1 | トークナイザ | 「韓国語専用トークナイザー」 | 韓国語**最適化**トークナイザー。モデル自体は韓・英・日多言語。韓国語オフィステキスト基準比較 12 種中 1 位、差はグローバルモデル比約 24% 優位 |
| 2 | NoPE | 「NoPE で 1M 対応」 | NoPE は **softmax attention 層に位置エンコーディングを適用しない設計**。1M は Hybrid Attention（固定サイズ state）+ NoPE の組み合わせの結果 |
| 3 | Mistral 比較 | 「主要ベンチマークすべてで圧倒的優位」 | **不正確**。SWE-Bench は 70.4 vs 69.6 で僅差、Terminal Bench Hard は Mistral(33.3) が Solar(28.3) より優位 |
| 4 | 競合モデル表 | MiMo-V2.5 欠落 | **MiMo-V2.5(310B-A15B)** は活性パラメータが同一の最直接競合。必ず含める |
| 5 | Ko-GDPval | 86.8 (vs V4-Flash 85.0) | 正しいが不完全。ブログ基準 **86.75 点で 1.6T 級 DeepSeek-V4-Pro(86.91) と 0.16 点差** — こちらが核心メッセージ |
| 6 | Kimi K3 | 「活性パラメータ未公開」 | 報道基準 **896 experts 中 16 個活性**、Modified MIT、マルチモーダル、重み公開 2026-07-27 |
| 7 | Docker 実行 | `--logits-processors` 欠落 | 公式推奨構成に含まれる必須フラグ。欠落時はテンプレート処理の挙動が変わる |
| 8 | 推論パース | 未記載 | Transformers 直接使用時は `<|think:end|>` トークン基準の手動分離が必要 |
| 9 | 学習スペック | 未記載 | 12T トークン / NVIDIA B200 / 2M GPU-hours / vocab 196,608 |
| 10 | 量子化 | 「H200 2 枚」 | 公式ブログは H200 2 枚。ただし Nota INT4-GlobalPruned カードは **2×H100** サーブ基準明記 — 構成により異なる |

---

## 1. プロジェクト背景

**Solar Open 2** は Upstage が 2026 年 7 月 22 日の開発者イベント「Solar Open Weight Day」で公開したオープンウェイト基盤モデルである。政府の独自 AI 基盤モデル（독파모）事業の文脈から出た第 2 次公開モデルで、Hugging Face に商用利用可能なライセンスで配布された。

核心設計目標は **Chat ではなく Agent** である。キム・ソンフン CEO は会話だけが上手いモデルではなく、指示された仕事を最後まで遂行する能力に集中したと説明した。Upstage が定義する Agentic Use の 3 要件は以下の通り。

1. **Long-horizon task** — 数十回の推論・ツール呼び出しを経てタスクを完結
2. **Long-context** — 長文書と作業履歴を維持
3. **Instruction following & tool calling** — 指示を正確に従い、ツールを安定して呼び出す

ここに 4 つ目の実務要件である **推論コスト** が加わる。Agent は計画→実行→検証→修正を繰り返すため Chat 比でトークン消費がはるかに大きく、企業が自社インフラに載せるにはモデルが過大または遅すぎてはならない — これが設計前提である。

### 1.1 アーキテクチャスペック（公式モデルカード基準）

| 項目 | 値 |
|---|---|
| モデル名 | Solar Open 2 (250B-A15B) |
| アーキテクチャ | Hybrid-Attention Mixture-of-Experts |
| 総パラメータ | 250B (250,287,794,944) |
| 活性パラメータ | 15B / トークン |
| レイヤー | 48 |
| Hidden size | 4,096 |
| アテンションパターン | `[Softmax, Linear×3] × 12`（全 48 層の 75% が linear） |
| アテンションヘッド | Softmax: 64 query / 8 KV (GQA)、Linear: 64 query |
| 位置エンコーディング | NoPE（RoPE 不使用） |
| Expert 数 | 321 個（routed 320 + shared 1） |
| 活性 Expert | routed top-8 + shared 1 |
| Vocabulary | 196,608 |
| コンテキスト | 1M トークン |
| 事前学習トークン | 約 12T |
| 学習ハードウェア | NVIDIA B200 |
| 学習 GPU 時間 | 2M GPU-hours |
| 公式言語 | 韓国語 · 英語 · 日本語 |
| ライセンス | Upstage Solar License |
| ハードウェア要件 | 最小 H200 ×4 / 推奨 H200 ×8 |

---

## 2. 長所 (Strengths)

### 2.1 推論効率 — 本モデルの実質的商品性

250B 総パラメータ中、トークンあたり 15B のみ活性化する。より重要なのは **KV キャッシュを維持する層が 48 層中 12 層（25%）** だけという点である。Linear attention 層はシーケンス情報を固定サイズ state で管理するため、コンテキストが長くなっても全層の KV キャッシュが同率で増加しない。同型 all-softmax モデル比でロングコンテキストメモリは約 1/4 水準。

結果として BF16 は H200 4 枚、量子化時は H200 2 枚で稼働する。**自社インフラオンプレミス展開が現実的に可能な唯一の準フロンティアオープンウェイトモデル** — これが最大の差別化点である。

### 2.2 学習効率 — Selective Weight Transfer

前作 Solar Open 100B の重みのうち、新アーキテクチャでも使える部分のみ選択転移して初期化した。モデルカード基準 **転移された重みは全体の 2.3%** に過ぎず、残りはランダム初期化である。

- 200B-A15B proxy 実験：同一 loss 到達に必要なトークン random init 約 22B → SWT 約 12B（**約 58% 水準**）
- アーキテクチャ効果検証：Solar Open 100B の all-softmax 構造が 671B トークンで到達した MMLU 性能を、Solar Open 2 アーキテクチャは **210B トークン** で到達

### 2.3 Agentic Use 最適化 — 学習データ設計

単純なシナリオ生成ではなく、**検証可能な環境**を作り通過したデータのみ学習に使った点が特徴である。

| ドメイン | 検証方式 |
|---|---|
| 検索 | 質問を構造・自明性・検索可能性・解決可能性・出典根拠の多段階で検証 |
| ツール呼び出し | ツール選択の適切性ではなく **実際の環境変更後に状態を再読みして結果検証** |
| コーディング | ターミナル作業後に自らテスト生成・実行、失敗時は修正・再検証ループをデータに含む |
| オフィス | 複数文書・スプレッドシートの相互確認、数式付きシートの入力変更後再計算等の実務型タスク。**韓国業務環境特有の文書処理シナリオを別途反映** |

最後の項目が実務的に重要である。「韓国語をよく生成する」ではなく「韓国語で与えられた業務を実際に遂行する」ことを目標に設計した意味である。

### 2.4 韓国語トークン効率

同一韓国語テキストをグローバルモデル比 **約 50~80% 水準のトークン** で処理する。韓国語オフィス業務テキスト基準比較対象 12 トークナイザー中 1 位で、差はグローバルモデル比約 24% 先行する。

これはベンチマークスコアではなく **直接的なコスト項目** である。同一業務でトークン消費が 30% 減れば Agent 反復呼び出し環境では運用費がそのまま 30% 減り、有効コンテキストはそれだけ長くなる。

### 2.5 実務型成果物力 — Ko-GDPval

Ko-GDPval は弁護士・会計士・感染管理専門家等 **58 職種、170 の実際の業務シナリオ** でモデルが報告書・計画書・プレゼン資料等の文書成果物を直接作成し評価されるベンチマークである。

- Solar Open 2: **86.75**
- DeepSeek-V4-Pro (1.6T): 86.91 — **0.16 点差**
- MiMo-V2.5-Pro (1T): 84.62

活性パラメータ基準で Solar Open 2 は DeepSeek-V4-Pro の約 1/3(15B) を使用する。公開された成果物例には FATF 相互評価事前対応資料（規制当局提出用 PDF + 55 件モニタリングワークブック xlsx 相互整合）、医療機器 PMS 定期報告書、法律事務所広告自己点検結果（引用判例表・法令索引含む）等が含まれる。

### 2.6 商用利用可能ライセンス

Upstage Solar License により商用利用、fine-tuning、distillation による派生モデル開発がすべて許可される。

---

## 3. 短所および限界 (Weaknesses)

### 3.1 ハードウェア参入障壁

BF16 基準 H200 4 枚（最小）·8 枚（推奨）。公式例は **141GB 以上メモリを持つ GPU 8 枚** を前提とする。量子化で 2 枚まで下げられるが、個人環境や小規模チームには依然非現実的である。実質的導入主体は大企業・金融機関・公共機関・GPU クラウド利用者に限定される。

### 3.2 公式サポート言語 3 つ

韓·英·日に限定される。中国語·欧州語群は公式未サポートであり、グローバル多言語サービスには追加検証·コストが発生する。アジア太平洋韓·日市場に集中したポジショニングと見るべきである。

### 3.3 日本語性能根拠の欠如

公式言語に日本語が含まれるが **モデルカードに日本語ベンチマークが掲載されていない**。韓国語は 9 ベンチマーク公開との対比である。日本市場導入検討時は自社評価が必須である。

### 3.4 サーブ環境依存

Linear attention カーネル最適化に `fla-core`（KDA カーネル）インストールが前提である。**未インストール時は Transformers が著しく遅い PyTorch fallback で動作**する。プロダクションは事実上 vLLM 専用であり、それも Upstage フォーク(v0.22.0-solar-open2) 基準である。アップストリーム vLLM/SGLang 一般ビルドでは reasoning·tool-call パーサーが動作しない。

### 3.5 推論トークンコスト

`reasoning_effort="high"` 使用時、reasoning ブロック上限は 131,072 トークンである。活性パラメータが小さくても **出力トークン量自体が多ければ節減分が相殺**される可能性がある。実測基準の end-to-end タスクコスト比較が必要である。

### 3.6 エコシステム未成熟

2026 年 7 月公開の新規モデルで fine-tuning レシピ、コミュニティチューニングモデル、llama.cpp/Ollama 系サポートがまだ浅い。ライセンスの "Solar" 接頭辞·"Built with Solar" 表記義務も欧米 OSS 採用には摩擦要因として指摘される。

### 3.7 自社発表ベンチマーク依存

現時点すべての数値は Upstage 発表基準であり、一部は in-house ベンチマーク(Ko-AIME'25, KBank-MMLU, Ko-GDPval)である。独立検証が蓄積するまで参考値として扱うべきである。

---

## 4. ベンチマーク（公式モデルカード全文）

### 4.1 英語ベンチマーク

| ベンチマーク | **Solar Open 2**<br>250B-A15B | Solar Open 100B<br>102B-A12B | Command A+<br>218B-A25B | Mistral Medium 3.5<br>128B dense | MiMo-V2.5<br>310B-A15B | DeepSeek-V4-Flash<br>284B-A13B |
|---|---|---|---|---|---|---|
| **知識·推論** | | | | | | |
| MMLU-Pro | **86.2** | 80.4 | 79.0 | 81.2 | 84.6 | 85.9 |
| GPQA-Diamond | 86.3 | 66.2 | 75.6 | 77.5 | 83.0 | **88.9** |
| HLE (w/o tools) | 28.8 | 11.5 | 11.4 | 12.8 | 24.3 | **32.3** |
| LiveCodeBench (v6) | **92.4** | 56.5 | 86.1 | 84.9 | 89.1 | 92.3 |
| ArtifactsBench | 55.9 | 43.4 | 42.8 | 49.8 | 59.3 | **61.0** |
| HMMT2602 | 93.9 | 68.9 | 73.5 | 62.9 | 61.4 | **94.7** |
| AIME2026 | 95.7 | 87.7 | 96.0 | 89.0 | 92.3 | **97.0** |
| **指示追従·ロングコンテキスト** | | | | | | |
| Multi-Challenge | 61.0 | 40.5 | 45.8 | 49.8 | 39.0 | **62.0** |
| IFBench | 80.0 | 57.7 | 73.9 | 69.0 | 67.1 | **80.3** |
| AA-LCR | 62.3 | 36.0 | 46.0 | 61.0 | 62.7 | **63.7** |
| **エージェント** | | | | | | |
| SWE-Bench Verified | 70.4 | 15.4 | 14.4 | 69.6 | 73.0 | **73.8** |
| Terminal Bench Hard | 28.3 | 2.3 | 25.0 | 33.3 | **41.7** | 34.1 |
| APEX-Agents | **16.6** | 2.4 | 1.6 | 6.1 | 13.4 | 13.2 |
| MCP-Atlas | 58.2 | 34.4 | 27.2 | 30.7 | **63.9** | 58.2 |
| τ³ (banking) | 19.6 | 7.4 | 5.8 | 5.8 | 8.7 | **22.3** |
| GDPval-AA v2 (ELO) | 1128 | – | 712 | 929 | 1145 | **1187** |

**解釈ポイント**
- 1 位項目は MMLU-Pro、LiveCodeBench、APEX-Agents の 3 つ。残り多数は DeepSeek-V4-Flash·MiMo-V2.5 が僅差優位。
- **APEX-Agents 16.6 は有意である。** 実際の業務型 Agent 能力評価で 2 位(MiMo 13.4)との差がある。
- **Terminal Bench Hard 28.3 は弱点である。** ターミナル基盤の長期作業では MiMo-V2.5(41.7)、DeepSeek(34.1)、Mistral(33.3) に劣る。CLI 自動化エージェントが主用途なら再検討が必要。
- τ³ banking 19.6 も金融ドメイン対話型エージェントとしては低い。

### 4.2 韓国語ベンチマーク

| ベンチマーク | **Solar Open 2** | Solar Open 100B | MiMo-V2.5 | DeepSeek-V4-Flash | Claude Haiku 4.5 | GPT-5.4 mini |
|---|---|---|---|---|---|---|
| KMMLU-Pro | 78.4 | 64.0 | 69.1 | **78.9** | 67.9 | 78.1 |
| CLIcK | **90.7** | 78.9 | 78.4 | 89.2 | 53.5 | 89.6 |
| HAE-RAE v1.1 | **73.8** | 73.3 | 61.7 | 73.1 | 38.5 | 69.4 |
| Ko-AIME'25† | 97.7 | 80.0 | 88.0 | **98.0** | 81.7 | 90.7 |
| HRM8K | 92.2 | 87.6 | 90.7 | **93.4** | 90.6 | 91.3 |
| KBank-MMLU† | **80.8** | 65.5 | 71.0 | 79.5 | 68.9 | 79.0 |
| KBL (法律) | **75.5** | 65.5 | 69.8 | 72.8 | 69.9 | 75.3 |
| KorMedMCQA | 93.0 | 84.4 | 87.7 | 94.1 | 87.0 | **94.2** |
| Ko-GDPval† | **86.8** | 3.4 | 81.0 | 85.0 | 68.3 | 59.4 |
| **韓国語平均** | **85.4** | 66.95 | – | 84.9 | 69.6 | 80.8 |

† Upstage in-house ベンチマーク

**解釈ポイント**
- **KBank-MMLU(金融) 80.8、KBL(法律) 75.5 1 位** は国内金融·法律ドメイン導入の直接的根拠である。
- KorMedMCQA は 3 位。医療ドメインは GPT-5.4 mini(94.2)·DeepSeek(94.1) が優位。
- Ko-GDPval で前作(3.4)との差が異常に大きい。前作が文書成果物生成自体ができなかった意味であり、今世代の核心改善点がここにあることを示す。

### 4.3 前作比改善幅

| カテゴリ | ベンチマーク | Solar Open 2 | Solar Open 100B | 上昇幅 |
|---|---|---|---|---|
| 知識·科学推論 | GPQA-Diamond | 86.26 | 66.16 | +20.10p |
| 数学 | HMMT | 93.94 | 68.94 | +25.00p |
| コーディング | LiveCodeBench | 92.42 | 56.49 | +35.93p |
| 指示追従 | IFBench | 80.00 | 57.70 | +22.30p |
| 韓国語総合 | 韓国語平均 | 85.43 | 66.95 | +18.48p |

---

## 5. 競合プロジェクト比較

### 5.1 Kimi K3 (Moonshot AI) — 規模極端の反対側

| 項目 | **Solar Open 2** | **Kimi K3** |
|---|---|---|
| 開発社 | Upstage (韓国) | Moonshot AI (中国) |
| 総パラメータ | 250B | **2.8T** |
| Expert 構成 | 320 routed + 1 shared、top-8 活性 | 896 experts、16 個活性（報道基準） |
| 公開日 | 2026-07-22 | API 2026-07-16 / 重み 2026-07-27 |
| コンテキスト | 1M | 1M |
| マルチモーダル | テキスト専用 | **ネイティブビジョン対応** |
| 推論モード | `none` / `high` 選択 | thinking mode 常時活性 |
| ライセンス | Upstage Solar License | Modified MIT |
| 公式言語 | 韓 · 英 · 日 | 中 · 英中心 |
| API 価格 | 自社サーブ | $3 / $15 per 1M tokens |
| ハードウェア | H200 2~4 枚 | テラバイト級ストレージ + 分散クラスタ |

Kimi K3 は現時点で公開された最大規模オープンウェイトモデルで、Arena Frontend Code Arena で 1 位(1,679 点)を記録し Claude Fable 5、GPT-5.6 Sol を上回った。Artificial Analysis 総合 ELO 1,547 で K2.6 比 732 点上昇。

**両モデルは競合関係ではなく異なる市場にある。** Kimi K3 はフロンティア性能をオープンウェイトで持ち込むことが目的で、Solar Open 2 は **自社インフラに実際に載せられる性能/コスト地点** を狙う。オンプレミスが要求される国内金融·公共導入では 2.8T モデルはそもそも選択肢にならない。

ただし K3 の自社発表ベンチマークは重み公開前 API 基準であり、推論が遅く reasoning トークン消費が大きいという指摘もある点は併せて見るべきである。

### 5.2 MiMo-V2.5 (310B-A15B) — 最直接競合

**活性パラメータが 15B で同一** の唯一の比較対象である。すなわち推論コスト構造がほぼ同じ。

| 項目 | Solar Open 2 優位 | MiMo-V2.5 優位 |
|---|---|---|
| 知識 | MMLU-Pro 86.2 vs 84.6、GPQA 86.3 vs 83.0 | – |
| コーディング | LiveCodeBench 92.4 vs 89.1 | SWE-Bench 70.4 vs **73.0** |
| エージェント | APEX-Agents 16.6 vs 13.4 | Terminal Bench Hard 28.3 vs **41.7**、MCP-Atlas 58.2 vs **63.9** |
| 指示追従 | Multi-Challenge 61.0 vs 39.0、IFBench 80.0 vs 67.1 | – |
| 韓国語 | 全項目優位（平均 85.4 vs 未公開） | – |
| 総パラメータ | 250B（メモリ有利） | 310B |

**結論**：韓国語·指示追従は Solar、**MCP ツール呼び出しとターミナル長期作業は MiMo が優位**。MCP-Atlas 58.2 vs 63.9 は MCP 基盤エージェントを主用途とする組織には無視しにくい差である。

### 5.3 DeepSeek-V4-Flash (284B-A13B)

最もバランスの取れた競合で、16 英語ベンチマーク中 9 個で 1 位。Solar Open 2 が先行するのは MMLU-Pro(86.2 vs 85.9)、LiveCodeBench(92.4 vs 92.3)、APEX-Agents(16.6 vs 13.2) 程度で、前 2 つは誤差範囲である。

韓国語では総合平均 85.4 vs 84.9 で Solar が先行するが、KMMLU-Pro·Ko-AIME·HRM8K·KorMedMCQA は DeepSeek が優位。**DeepSeek がこの程度の韓国語性能を出す事実自体が Solar Open 2 の韓国語優位ナラティブをかなり弱める。** 実質的差別化点は韓国語性能自体よりトークン効率·オンプレミス適合性·データ主権側にある。

### 5.4 Mistral Medium 3.5 (128B dense)

Solar Open 2 は知識·コーディング·韓国語で明確に先行(MMLU-Pro 86.2 vs 81.2)。ただし **エージェント領域は同等か劣勢** — SWE-Bench 70.4 vs 69.6(僅差)、Terminal Bench Hard 28.3 vs 33.3(劣勢)、AA-LCR 62.3 vs 61.0。Apache 2.0 ライセンスは Mistral の確実な強みである。

### 5.5 Command A+ (218B-A25B)

Solar Open 2 は全体的に大きく先行(MMLU-Pro 86.2 vs 79.0、GPQA 86.3 vs 75.6)。特に **SWE-Bench 70.4 vs 14.4** でエージェントコーディングでは事実上比較対象にならない。活性パラメータも 25B で Solar より大きい。

### 5.6 選択ガイド

| 要求条件 | 推奨 |
|---|---|
| 韓国語文書業務 + オンプレミス | **Solar Open 2** |
| 金融·法律ドメイン韓国語 | **Solar Open 2** (KBank-MMLU·KBL 1 位) |
| MCP 基盤ツール呼び出し集約型エージェント | MiMo-V2.5 検討 |
| ターミナル/CLI 長期自動化 | MiMo-V2.5、DeepSeek-V4-Flash |
| 最高性能、インフラ制約なし | Kimi K3、DeepSeek-V4-Pro |
| ライセンス自由度最優先 | Mistral (Apache 2.0)、Kimi K3 (Modified MIT) |
| 多言語(中·欧州語)必須 | DeepSeek 系 |

---

## 6. Getting Started

### 6.1 システム要件

| 構成 | ハードウェア | 備考 |
|---|---|---|
| BF16 最小 | NVIDIA H200 ×4 | 公式最小仕様 |
| BF16 推奨 | NVIDIA H200 ×8 | 公式例は 141GB 級 GPU 8 枚前提 |
| 量子化（公式ブログ） | H200 ×2 | NotaAI 量子化モデル |
| INT4 + Expert Pruning | H100 ×2 | Nota INT4-GlobalPruned カード基準 |

実際のメモリ要件はコンテキスト長とサーブ設定により異なる。

### 6.2 Transformers（ローカル実験用）

Upstage Transformers ブランチを使用する必要がある。

```bash
# CUDA 対応 PyTorch を先にインストールすること
python -m pip install -U \
  "git+https://github.com/upstageAI/transformers.git@v5.14.1-solar-open2" \
  "fla-core[cuda]>=0.5.1" \
  accelerate einops
```

> `fla-core` がないと最適化 KDA カーネルの代わりに著しく遅い PyTorch fallback で動作する。必ずインストールすること。

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "upstage/Solar-Open2-250B"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=False)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    dtype=torch.bfloat16,
    trust_remote_code=False,
)
model.eval()

messages = [{"role": "user", "content": "Upstage とは何ですか？"}]
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    reasoning_effort="high",
    think_render_option="preserved",
)

input_device = model.get_input_embeddings().weight.device
model_inputs = tokenizer(prompt, return_tensors="pt").to(input_device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768,
    do_sample=True,
    temperature=1.0,
    top_p=1.0,
)

# 推論トレースと最終回答の分離（Transformers 直接使用時は必須）
new_token_ids = generated_ids[0, model_inputs.input_ids.shape[-1]:].tolist()
think_end_id = tokenizer.convert_tokens_to_ids("<|think:end|>")

if think_end_id in new_token_ids:
    answer_start = len(new_token_ids) - new_token_ids[::-1].index(think_end_id)
else:
    # 終了マーカーがなければ推論途中で max_new_tokens に到達した
    answer_start = len(new_token_ids)

reasoning = tokenizer.decode(new_token_ids[:answer_start], skip_special_tokens=True).strip()
answer = tokenizer.decode(new_token_ids[answer_start:], skip_special_tokens=True).strip()

print("[reasoning]", reasoning)
print("[answer]", answer)
```

**回答が空なら** 推論ブロックが終わる前に `max_new_tokens` に到達した。値を増やして再試行する。

### 6.3 vLLM プロダクションサーブ（推奨）

#### オプション 1: Docker

```bash
# イメージ基準: vLLM v0.22.0 / CUDA 12.9
docker run --rm --gpus all --ipc=host \
  -p 8000:8000 \
  -v "${HF_HOME:-$HOME/.cache/huggingface}:/root/.cache/huggingface" \
  upstage/vllm-solar-open2 \
  upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

> **`--logits-processors` は公式推奨構成の必須項目である。** v1 ドキュメントで欠落していた。

#### オプション 2: ソースインストール

```bash
pip install -U uv

VLLM_PRECOMPILED_WHEEL_LOCATION="https://github.com/vllm-project/vllm/releases/download/v0.22.0/vllm-0.22.0%2Bcu129-cp38-abi3-manylinux_2_28_x86_64.whl" \
VLLM_USE_PRECOMPILED=1 \
uv pip install --reinstall-package vllm --torch-backend=cu129 \
  "git+https://github.com/UpstageAI/vllm.git@v0.22.0-solar-open2"
```

```bash
vllm serve upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

#### API 呼び出し

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "solar-open2-250b",
    "messages": [{"role": "user", "content": "What is Upstage?"}],
    "max_tokens": 131584,
    "temperature": 1.0,
    "top_p": 1.0,
    "reasoning_effort": "high"
  }'
```

> `max_tokens` は推論トレースと最終回答を **両方含む**。reasoning 上限が 131,072 なのでそれ以上の余裕を持たないと回答が切れる。

### 6.4 公式量子化モデル (NotaAI)

| モデル | 方式 | 備考 |
|---|---|---|
| `nota-ai/Solar-Open2-250B-Nota-INT4-GlobalPruned` | W4A16 INT4 + グローバル expert pruning | 層別 expert 数可変、2×H100 サーブ |
| `nota-ai/Solar-Open2-250B-Nota-NVFP4` | NVFP4 | Blackwell 系最適 |
| `nota-ai/Solar-Open2-250B-Nota-INT4` | W4A16 INT4 | pruning 未適用 |

GlobalPruned 版はネットワーク全体の expert 重要度を測定し層別に残す expert 数を変える。均一 pruning 比で精度保持が良い。

### 6.5 推論モード設定

| モード | `reasoning_effort` | temperature | top_p | max_tokens |
|---|---|---|---|---|
| 直接応答 | `"none"` | 1.0 | 1.0 | 最大 128K |
| 高度推論 | `"high"` | 1.0 | 1.0 | 最大 256K |

**マルチターン注意**：前ターンの推論トレースを会話履歴から削除してはならない。`think_render_option=preserved`（デフォルト）が自動処理する。

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "√2 が無理数であることを証明せよ。"}],
    reasoning_effort="high",
    temperature=1.0,
    top_p=1.0,
    max_tokens=131584,
)

print(response.choices[0].message.reasoning)  # 推論トレース（別フィールド）
print(response.choices[0].message.content)    # 最終回答
```

### 6.6 ツール呼び出し (Tool Calling)

サーバーを `--tool-call-parser solar_open2 --enable-auto-tool-choice` で起動する必要がある。その後は標準 OpenAI function calling インターフェースと同じ。

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {"location": {"type": "string"}},
            "required": ["location"],
        },
    },
}]

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "ソウルの天気は？"}],
    tools=tools,
)
print(response.choices[0].message.tool_calls)
```

### 6.7 Claude Code / Hermes Agent 連携

単一 vLLM サーバーが 2 インターフェースを同時公開する。Claude Code は Anthropic 互換 `/v1/messages`、Hermes Agent は OpenAI 互換 `/v1` を使用する。MCP で公開されたツールは同一 tool-calling インターフェース経由でモデルに渡され、両エージェントとも MCP をネイティブサポートする。

**Claude Code — 環境変数方式**

```bash
export ANTHROPIC_BASE_URL=http://localhost:8000
export ANTHROPIC_AUTH_TOKEN=dummy   # 空でない任意値
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
claude
```

モデル名はサーバーの `--served-model-name` と完全一致させること。

**Claude Code — Upstage 提供スクリプト**

```bash
curl -fsSL https://console.upstage.ai/claude-upstage.sh | bash
```

**Hermes Agent** — Solar Open 2 は Hermes Official モデル。`~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  default: solar-open2-250b
  base_url: http://localhost:8000/v1
  api_key: dummy
```

### 6.8 プレイグラウンド

別途設定なしで Upstage Playground で体験可能。**提供期間は 2026 年 7 月 31 日まで**。

---

## 7. 重要使用例 (Key Use Cases)

### 7.1 規制対応文書自動生成 — 相互整合複数成果物

Upstage が Ko-GDPval 成果物として公開した代表事例であり、本モデル最大の差別化能力である。**同一データから形式の異なる 2 つ以上の成果物を数値が一致するよう生成**する。

- 規制当局提出用要約報告書(PDF) — リスク等級別·国別エクスポージャ
- 実務モニタリングワークブック(xlsx) — ルール適発個別取引全件明細

一般 LLM が失敗する点はまさに 2 成果物間の合計不一致である。

```python
prompt = """添付取引ログについて 2 つの成果物を生成せよ。

[成果物 1] 規制当局提出用対応報告書
- リスク等級(高/中/低)別取引件数および金額合計
- 国別エクスポージャ上位 10 カ国
- 適発ルール(R1~R4)別要約

[成果物 2] 内部モニタリングワークブック (xlsx)
- 適発取引全件明細（取引ID、日時、金額、通貨、相手国、適発ルール、リスク等級）
- 成果物 1 のすべての集計値が SUMIF で検証可能な構造

制約：成果物 1 のすべての数値は成果物 2 から再計算可能でなければならない。
不一致が発生したら成果物 2 を基準に成果物 1 を修正せよ。"""
```

**適用領域**：FATF/AML 対応、金融監督当局報告、医療機器 PMS 定期報告、広告審議自己点検、開示資料作成。

### 7.2 1M コンテキスト契約書·規定相互レビュー

コンテキスト 1M なら **RAG チャンキングなしで文書全体を一度に投入できる**。条項間相互参照が重要な文書ではチャンキングが構造的に回答を壊す。

```python
messages = [{
    "role": "user",
    "content": f"""以下は本契約書、附属合意書 3 件、当社標準契約ガイドライン全文である。

{full_documents}   # 約 400K トークン

以下を実行せよ：
1. 本契約と各附属合意書間の抵触条項をすべて抽出（条項番号明記）
2. 標準ガイドライン違反条項と違反理由
3. 違反条項別修正提案文
4. リスク等級(高/中/低)および交渉優先順位

根拠のない推測はせず、原文条項を引用して提示せよ。"""
}]
```

**注意**：ロングコンテキストベンチマーク AA-LCR は 62.3 で最上位(DeepSeek 63.7)と僅差だが絶対値自体が高くない。1M を実際に埋めて使う際の検索精度は自社 needle-in-haystack テストで検証すること。

### 7.3 スプレッドシート再計算型エージェント

学習データに明示的に含まれるシナリオ。数式のあるシートの入力値を変え結果を再計算する作業である。

```python
tools = [
    {"type": "function", "function": {
        "name": "read_sheet",
        "description": "シート範囲を読み値と数式を返す",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "sheet": {"type": "string"}, "range": {"type": "string"}
        }, "required": ["path", "sheet", "range"]}}},
    {"type": "function", "function": {
        "name": "write_cells",
        "description": "セルに値または数式を記録",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "updates": {"type": "array", "items": {"type": "object"}}
        }, "required": ["path", "updates"]}}},
    {"type": "function", "function": {
        "name": "recalculate",
        "description": "ワークブック全体再計算後指定セル結果を返す",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "check_cells": {"type": "array", "items": {"type": "string"}}
        }, "required": ["path"]}}},
]

# 「為替前提を 1,340 ウォンから 1,420 ウォンに変更し、影響部門別営業利益を
#  再計算した上、変動幅上位 3 部門のコメントを作成せよ」
```

核心はモデルが **書き込み後再読みして結果を検証**するよう学習された点である。`recalculate` ツールを必ず提供しこのループを活性化すること。

### 7.4 社内コードベースエージェント (Claude Code 連携)

SWE-Bench Verified 70.4 は自社インフラで回せるモデルとして最上位級。ソースコード外部流出が禁止された組織への直接的答えである。

```bash
# 1. 社内 GPU ノードで vLLM 起動（6.3 節）
# 2. 開発者ワークステーション
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
cd ~/legacy-erp && claude
```

**ただし Terminal Bench Hard 28.3 は押さえておくべき。** ファイル単位修正·テスト通過型作業(SWE-Bench)は強いが、ターミナルで長期自律的に環境を操作する作業は相対的に弱い。自律実行範囲を狭く human-in-the-loop を維持する方が安全である。

### 7.5 MCP 基盤社内システムオーケストレーション

```yaml
# 社内 MCP サーバー構成例
servers:
  - name: erp-mcp          # 伝票照会/起票
  - name: groupware-mcp    # 決裁起案、文書箱
  - name: dw-mcp           # データウェアハウスクエリ
  - name: hr-mcp           # 人事マスタ（読み取り専用）
```

```
「今四半期の部門別販管費執行率を照会し、予算対比 90% 超過部門を
 見つけ、該当部門長宛に執行状況要約と残予算計画依頼公文を
 起案せよ。」
```

**MCP-Atlas 58.2 は最上位(MiMo 63.9)との差がある。** ツール数が多くスキーマが複雑ほど誤呼び出し可能性が上がる。実務推奨設計：
- セッションあたり公開ツールを 15 個以下に制限
- 書き込み(write)ツールは必ず承認ゲートを通す
- ツール description を韓国語で明確に記述（韓国語理解度が強みなので活用）

### 7.6 ドメイン特化派生モデル開発

ライセンスは fine-tuning·distillation を許可する。KBank-MMLU 80.8·KBL 75.5 というベース性能は金融·法律特化派生モデルの出発点として有利である。

```
Solar-KFinance-v1   # 国内金融規制·商品約款特化
Solar-KLegal-v1     # 判例·法令特化
Solar-Med-PMS-v1    # 医療機器市販後調査文書特化
```

> モデル名接頭辞 "Solar" 必須、広報物に "Built with Solar" 表記、ライセンス写同封義務。

---

## 8. 韓国市場事業導入シナリオ

### 8.0 前提：なぜ今韓国で有効か

3 条件が同時に成立する。

1. **網分離·データ主権規制** — 金融網分離、公共クラウド CSAP、個人情報国外移転制限で海外 API 使用が構造的に困難。
2. **オンプレミス可能なハードウェア要件** — H200 2~4 枚は中堅企業も負担可能な水準。フロンティア級オープンモデル中この条件を満たす事実上唯一の選択肢。
3. **韓国語業務文脈学習** — 韓国業務環境特有の文書処理シナリオが学習に反映された。

Upstage 側レファレンスとして調達庁生成 AI 業務支援サービス 1 号供給社選定(2025-12)、ポータル「Daum」適用計画、自治体·公共·教育機関向けエージェントプラットフォーム「Timely」供給が言及される。

### 8.1 金融 — コンプライアンス·AML エージェント

| 項目 | 内容 |
|---|---|
| 対象 | 銀行、証券、保険、VASP |
| 根拠 | KBank-MMLU 80.8(1 位)、Ko-GDPval 86.8、規制文書複数成果物力 |
| 問題 | AML/CFT モニタリングアラーム急増、FATF 相互評価対応文書作業過多、網分離で外部 LLM 使用不可 |
| 構成 | 内部網 H200 ×4 + vLLM + MCP(コアバンキング読取専用、AML ルールエンジン、文書管理) |
| 成果物 | 疑わしい取引報告(STR)草稿、監督当局提出報告書 + 検証用ワークブック同時生成、内部統制点検調書 |
| KPI | アラーム 1 件あたり審査所要時間、STR 草稿却下率、報告書作成リードタイム |
| リスク | τ³ banking 19.6 は対話型金融エージェントとしては低い → **顧客対応ではなくバックオフィス文書業務に範囲を限定すること** |

**段階的導入推奨**：1 段階文書草稿生成(人間レビュー必須) → 2 段階アラーム 1 次分類 → 3 段階定型報告書自動化。顧客直接接点は最低 1 年以上猶予。

### 8.2 法務·法律サービス — 契約レビューおよび自己点検

| 項目 | 内容 |
|---|---|
| 対象 | ローファーム、大企業法務、社内コンプライアンス |
| 根拠 | KBL 75.5(1 位)、1M コンテキスト、引用判例表·法令索引成果事例 |
| 問題 | 契約レビューがジュニア人材に集中、条項間抵触見落とし、改正法令反映遅延 |
| 構成 | オンプレミス(受任情報外部流出絶対不可) + 社内判例·契約 DB MCP 連携 |
| 成果物 | 条項別リスク等級表、標準契約対比偏差レポート、交渉ポイント要約、広告審議自己点検結果 |
| KPI | 契約 1 件あたりレビュー時間、抵触条項抽出率(人間比)、再レビュー指摘件数 |
| リスク | 法的判断の最終責任は弁護士にある。**草稿生成ツールとしてのみポジショニングし成果物にレビュー必須ウォーターマーク挿入** |

### 8.3 製造大企業 — 技術文書·品質文書自動化

| 項目 | 内容 |
|---|---|
| 対象 | 半導体·自動車·化学·造船 |
| 根拠 | 1M コンテキスト、スプレッドシート再計算学習、オンプレミス |
| 問題 | 設計変更時に関連文書数十種手動更新、海外認証対応文書反復作成、図面·仕様書と文書不一致 |
| 構成 | 閉域網 + PLM/MES MCP 連携 + Document Parse 結合(文書 → LLM 可読フォーマット変換) |
| 成果物 | 設計変更通知(ECN)草稿、品質不適合報告書、8D レポート、海外認証提出文書多言語(韓·英·日) |
| KPI | ECN 発行リードタイム、文書間不一致指摘件数 |
| 特記 | **韓·英·日 3 言語サポートがまさに日本顧客対応シナリオと一致する。** 日本完成車·電子顧客を持つ国内部品メーカーに特に適合 |

### 8.4 公共·自治体 — 민원対応および行政文書

| 項目 | 内容 |
|---|---|
| 対象 | 中央省庁、広域·基礎自治体、公共機関、教育機関 |
| 根拠 | Sovereign AI 整合、調達実績、CLIcK 90.7(韓国文化·常識理解) |
| 問題 | 민원対応人員不足、条例·規定改正時関連文書更新、国外移転不可データ |
| 構成 | 公共クラウドまたは自社 IDC、量子化モデル(H200 ×2)で予算最小化 |
| 成果物 | 민원回答草稿、条例改正対比表、事業計画書·精算報告書、議事録要約 |
| KPI | 민원処理所要日、反복 민원 自動応答率 |
| 調達観点 | オープンウェイト + 国産 = **国産 AI 導入実績および情報主権要件を同時充足**。事業提案書で強力な差別化要素 |

### 8.5 中堅企業 — バックオフィスエージェント（量子化低コスト参入）

| 項目 | 内容 |
|---|---|
| 対象 | 売上 1 千億~1 兆ウォン規模、専任 AI 人員 1~3 名 |
| 構成 | **H200 ×2 (Nota INT4-GlobalPruned)** または H100 ×2。初期 CAPEX 最小化 |
| 成果物 | 契約レビュー 1 次、見積·提案書草稿、会計伝票分類、社内規定 Q&A |
| アプローチ | クラウド GPU で 3 ヶ月 PoC → 効果確認後オンプレミス移行 |
| 失敗要因 | ツール(MCP)整備なしにモデルのみ導入すると失敗する。**ERP/グループウェア API 整備が先行課題** |

### 8.6 韓国シナリオ総合優先順位

| 優先順位 | セグメント | 根拠強度 | 導入難易度 | 予想 ROI |
|---|---|---|---|---|
| 1 | 金融バックオフィス文書 | 高 (KBank 1 位) | 中 | 高 |
| 2 | 公共行政文書 | 高 (調達実績) | 低 | 中 |
| 3 | 法務契約レビュー | 高 (KBL 1 位) | 中 | 高 |
| 4 | 製造技術文書 | 中 | 高 | 高 |
| 5 | 社内コードエージェント | 中 (SWE 70.4 / Terminal 28.3) | 中 | 中 |

---

## 9. 日本市場事業導入シナリオ

### 9.0 前提：日本市場の構造的特性

日本は **オンプレミス選好が構造的に強い市場** である。クラウド基盤の米国·中国モデルよりローカル展開可能モデルが導入ハードルで有利。Upstage はすでに日本法人を運営し、日本 AI 企業 Karakuri と共同開発した日本語特化モデル **Syn Pro(31B)** で W&B Nejumi リーダーボード 1 位実績を持つ。

**核心戦略：Syn Pro と Solar Open 2 の 2 段構成。**

| 区分 | Syn Pro (31B) | Solar Open 2 (250B-A15B) |
|---|---|---|
| 強み | 日本語·文化文脈 fine-tuning、検証済み日本語性能 | Agentic 実行力、1M コンテキスト、文書成果物 |
| ハードウェア | 小規模オンプレミス | H200 2~4 枚 |
| 役割 | 対話·要約·分類等軽量タスク | 多段階業務実行、複合文書生成 |

### 9.1 重大注意事項 — 日本語性能根拠欠如

**Solar Open 2 モデルカードには日本語ベンチマークが掲載されていない。** 韓国語は 9 ベンチマーク公開との対照。公式サポート言語に含まれる事実だけで日本顧客に提案するのは危険である。

**必須先行作業**：
1. W&B Nejumi リーダーボード基準自社評価実施
2. JMMLU、JCommonsenseQA 等公開日本語ベンチマーク自社測定
3. 日本語トークン効率実測（韓国語と異なり最適化根拠が未公開）
4. 顧客実文書で PoC — 特に敬語·ビジネス慣用表現精度

この検証なしに参入すると最初の PoC で信頼を失う。

### 9.2 日韓クロスボーダー文書業務 — 最強参入点

日本市場で Solar Open 2 の **真の差別点は日本語単独性能ではなく韓·英·日同時サポート** である。この組み合わせを提供するオープンウェイトモデルは事実上ない。

| 項目 | 内容 |
|---|---|
| 対象 | 日韓合弁、日本進出韓国企業、韓国進出日本企業、商社 |
| 問題 | 契約書·仕様書·品質文書を 3 言語同時維持、翻訳外注コストとリードタイム、翻訳後原文対比整合性崩壊 |
| 解決 | 単純翻訳ではなく **同一事実基盤多言語成果物同時生成**（7.1 節能力をそのまま適用） |
| 成果物 | 日韓対訳契約書、品質不適合報告書 3 言語版、本社報告(韓) + 現地提出(日)整合セット |
| KPI | 翻訳外注費、多言語文書リードタイム、言語版間不一致指摘件数 |

```python
prompt = """以下品質不適合事例データから 3 つの成果物を生成せよ。

[1] 日本顧客提出用 8D レポート（日本語、敬語、製造業標準文体）
[2] 韓国本社報告用要約（韓国語、原因分析·再発防止中心）
[3] グローバル品質 DB 登録用英語要約（200 words 以内）

制約：
- 3 成果物の数値(不良率、検出ロット数、対象数量)は完全に一致すること
- [1] は日本顧客がそのまま受付可能な形式であること
- 原因不明項目は推測せず「調査中」と表記すること"""
```

### 9.3 日本製造業 — オンプレミス品質·設計文書

| 項目 | 内容 |
|---|---|
| 対象 | 自動車部品、電子部品、精密機械、素材 |
| 根拠 | オンプレミス選好市場特性 + 1M コンテキスト + スプレッドシート再計算 |
| 問題 | 技術ノウハウ外部流出極度忌避、図面·仕様書膨大、熟練人材高齢化で文書化知識喪失 |
| 構成 | 完全閉域網 H200 ×2~4、PLM 連携、Syn Pro 並行 |
| 特記 | 日本製造業は **文書形式遵守要求が非常に厳しい**。社内標準様式を few-shot または fine-tuning で必ず注入 |
| 参入戦略 | 完全自動化ではなく「ベテランの暗黙知の形式知化」フレーミングの方が受容度が高い |

### 9.4 日本金融·保険 — 規制対応文書

| 項目 | 内容 |
|---|---|
| 対象 | 地方銀行、損害保険、生命保険 |
| 根拠 | 規制文書複数成果物生成、オンプレミス |
| 問題 | 金融庁報告文書作成負担、地方銀行 IT 人員不足、データ外部持ち出し不可 |
| 構成 | 量子化モデル(H200 ×2)で初期投資抑制 |
| 注意 | **韓国金融規制学習は日本金融規制に転移しない。** KBank-MMLU 1 位を日本市場根拠にしてはならない。金融庁規制·業界様式 RAG 構築が必須先行 |

### 9.5 日本公共·自治体 — 慎重アプローチ推奨

日本自治体市場は契約サイクルが長く国産·準国産選好が強い。**韓国産モデル単独提案は現実的に困難。**
現実的路線：
- 日本 SIer·通信(NTT、SoftBank 等)経由の間接参入
- Syn Pro のように **日本企業との共同開発·派生モデル形態** でアプローチ
- ライセンス上 "Solar" 接頭辞義務があるため `Solar-<パートナー名>-JP-v1` 命名不可避 — 事前にパートナーと協議

### 9.6 日本シナリオ総合優先順位

| 優先順位 | セグメント | 根拠強度 | 参入難易度 | 備考 |
|---|---|---|---|---|
| 1 | 日韓クロスボーダー文書 | 高 (構造的差別点) | 低 | 即着手可能 |
| 2 | 日本進出韓国企業社内導入 | 高 | 低 | 意思決定権が韓国本社 |
| 3 | 日本製造業オンプレミス | 中 (日本語検証必要) | 中 | Syn Pro 並行必須 |
| 4 | 日本金融 | 中 | 高 | 規制 RAG 先行 |
| 5 | 日本公共 | 低 | 非常に高 | パートナー経由のみ現実的 |

---

## 10. 導入判断チェックリスト

### 10.1 技術検証（PoC 以前）

- [ ] 自社データでベンチマーク再現 — 公開数値は参考値に過ぎない
- [ ] 1M コンテキスト needle-in-haystack 自社測定（AA-LCR 62.3 の実戦意味確認）
- [ ] MCP ツール 15 個以上環境で誤呼び出し率測定（MCP-Atlas 58.2 リスク）
- [ ] `reasoning_effort="high"` 時の実際出力トークン量測定 → 活性パラメータ節減分との相殺
- [ ] 日本語使用時 Nejumi/JMMLU 自社評価（必須）
- [ ] `fla-core` インストール有無によるスループット差実測

### 10.2 インフラ

- [ ] BF16(H200 ×4~8) vs 量子化(×2) TCO 比較
- [ ] Upstage vLLM フォーク依存 — アップストリーム vLLM アップグレード経路確認
- [ ] 同時ユーザー数基準スループット算出（Agent はセッションあたりトークン消費大）
- [ ] 障害時フォールバック経路（Solar Pro 3 API 等）

### 10.3 ガバナンス·法務

- [ ] Upstage Solar License 全文レビュー — 派生モデル定義範囲
- [ ] 派生モデル開発時 "Solar" 接頭辞·"Built with Solar" 表記計画
- [ ] ライセンス写配布プロセス
- [ ] 書き込み権限ツールへの承認ゲート設計
- [ ] 成果物レビュー責任所在明文化（法律·医療·金融領域必須）

### 10.4 組織

- [ ] MCP 対象社内システム API 整備状態 — **モデルよりこちらがボトルネック**
- [ ] 社内文書標準様式収集（few-shot / fine-tuning 材料）
- [ ] レビュアー役割再定義 — 作成者から検証者へ

---

## 11. ライセンス

Upstage Solar License で配布され、**商用利用、fine-tuning、distillation による派生モデル開発が許可**される。

派生 AI モデル生成時の義務：

| 区分 | 内容 |
|---|---|
| ネーミング | モデル名に "Solar" 接頭辞（例：`Solar-MyModel-v1`） |
| 表示 | 関連公開資料に "Built with Solar" 明記 |
| 告知 | Upstage Solar License 写同封 |

> Apache 2.0(Mistral) や Modified MIT(Kimi K3) 比で制約がある。自社ブランド製品に埋め込む場合ネーミング義務がマーケティング制約になり得るため事前レビューが必要。

---

## 12. 引用

```bibtex
@misc{solar-open-2-2026,
    title={Solar Open 2 Technical Report},
    author={Upstage AI},
    year={2026},
    url={https://huggingface.co/upstage/Solar-Open2-250B}
}
```

---

## 13. 参考資料

| 区分 | リンク |
|---|---|
| モデルカード | https://huggingface.co/upstage/Solar-Open2-250B |
| Technical Report | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/Solar_Open_2_Tech_Report.pdf |
| ライセンス | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/LICENSE |
| 技術ブログ (KO) | https://www.upstage.ai/blog/ko/solar-open-2 |
| 技術ブログ (EN) | https://www.upstage.ai/blog/en/solar-open-2 |
| Transformers ブランチ | https://github.com/upstageAI/transformers/tree/v5.14.1-solar-open2 |
| vLLM フォーク | https://github.com/UpstageAI/vllm/tree/v0.22.0-solar-open2 |
| 量子化モデル | https://huggingface.co/nota-ai |
| Syn Pro (日本語特化) | https://www.upstage.ai/blog/en/upstage-ai-jp-syn-pro |
| デモ (~2026-07-31) | https://open2-beta.upstage.ai/ |

---

*本ドキュメントのベンチマーク数値は Upstage 公式発表基準であり、独立第三者検証が蓄積するまで自社再現評価を前提に活用することを推奨する。*
