---
title: "Qwenローカルインストールガイドと注意事項(改訂版)"
description: "Qwenのローカル環境構築ガイド最新版。モデルラインアップ(Qwen3 / 3.5 / 3.6 / 3.7-Max)、Ollama・LM Studio・Transformersでの導入、VRAM別ハードウェア選定、量子化、Thinking Mode、トラブルシューティングを収録。"
keywords:
  - "Qwen"
  - "Qwen3 ローカル導入"
  - "Ollama Qwen"
  - "LM Studio"
  - "量子化 Q4_K_M"
  - "VRAM 選定"
  - "アリババ LLM"
  - "ローカルLLM トラブルシューティング"
lang: ja
featured: false
schema_type: TechArticle
---

# Qwenローカルインストールガイドと注意事項(改訂版)

> 検証基準日: 2026-06-30 / 原文(Qwen2.5・初期Qwen3時点)を現行ラインアップ・ハードウェア基準に更新し、参考文献を付記。
> 核心原則: VRAM(または統合メモリ)はハード制約である — ウェイトが入らなければ実行自体ができない。量子化・context・KV cacheを合わせて計算すること。[R7][R10]

## Qwen(千問)概要
Qwen(中国語: 千問、「チエンウェン」)はアリババグループが開発した大規模言語モデル(LLM)および大規模マルチモーダルモデル群である。最初のバージョンは2023年4月にベータ形式で公開され、現在は世界最大のオープンソースAIエコシステムの一つに成長している。2026年3月、アリババはAIブランドを「Qwen大規模モデル」に統一し、以前の混乱を解消した。

## 主要機能
Qwenは様々なマルチモーダル・言語タスクを実行できる。

自然言語理解およびテキスト生成

視覚理解(画像、映像)

音声理解および処理

ツール呼び出しおよびAIエージェント機能

ロールプレイおよび複数ターン対話

モデルは大規模な多言語・マルチモーダルデータで事前学習され、高品質データでファインチューニングされて人間の好みに合致するよう設計されている。

## 技術構造および特徴
デュアルモードアーキテクチャ(思考モード/非思考モード)
Qwen3の核心的イノベーションは、1つのモデルに「思考モード」と「非思考モード」を同時に搭載し、効率を高めることである。

モード | 適用状況
思考モード | 複雑な論理推論、数学、プログラミングなど深い思考が必要なタスク
非思考モード | 速い応答が必要な一般的な対話
モデルは「思考予算(thinking budget)」メカニズムを通じて問題の複雑度を動的に評価し、計算リソースを自動的に配分する。

モデル構造
DenseモデルとMoE(Mixture of Experts)モデルが並存: 0.6Bから235Bまで様々な規模を提供。

Qwen3-Nextは高希薄度MoEアーキテクチャを適用: 総パラメータ800億、推論時には約30億パラメータ(約3.75%)のみを活性化し、効率を大幅に向上。

Qwen3-Maxは総パラメータ1兆(1T)以上、事前学習に36Tトークンを使用。

トレーニング戦略
3段階事前学習: 言語基盤の構築→推論能力の強化→長文能力の拡張。

4段階事後学習: 長い思考連鎖のコールドスタート、推論強化学習、モード融合などを含む。

「大規模モデルが小規模モデルを育成する」蒸留方式: 大規模モデルのデータで小規模モデルを訓練。

## 主要バージョンおよびモデル

Qwen 3.5
2026年2月 — フラッグシップモデル
総397B(アクティブ17B)
262Kネイティブコンテキスト(1Mまで拡張可能)
201言語サポート、Apache 2.0オープンソース

Qwen3.7-Max
2026年5月 — エージェント特化
35時間以上の超長期複雑タスクを完全自律で実行可能

Qwen3-Max
2025年9月 — 総パラメータ1T以上、LMArenaランキング世界3位

オープンソースモデルはQwen、Qwen1.5、Qwen2、Qwen2.5シリーズなどがあり、0.5B〜110Bまで様々。
また専用ビジョン言語モデル(Qwen-VL)、オーディオモデル(Qwen-Audio)、コードモデル(Qwen-Coder)、推論モデル(QwQ)などがある。

# 適用分野
Qwenは様々な分野で活用可能。

ソフトウェア開発: コード生成、デバッグ、レビュー、50以上のプログラミング言語をサポート

コンテンツ制作: 長文作成、SEO、ソーシャルメディア、翻訳(201言語)

研究およびデータ分析: 文献レビュー、チャート解釈、科学的推論、医療分析

企業業務: カスタマーサービスチャットボット、文書処理、ナレッジベースQ&A

ベンチマークテストにおいて、Qwen 3.5はSWE-Bench Verifiedで76.4点を記録し、GPT-5.2およびClaude Opus 4.5と同等の水準である。

## 使用方法
オープンソースモデル: Apache 2.0ライセンスで無料使用可能、Ollama、llama.cpp、LM Studioなどでローカル実行をサポート

APIサービス: アリババクラウドDashScope APIを通じて呼び出し

無料体験: Qwen Chat公式ウェブサイト(chat.qwen.ai)で対話可能

企業サービス: 全世界29万以上の企業顧客に提供

---

## 0. まず知っておくべきバージョン整理(文書アップデート)

原文は`qwen2.5`/`qwen3`/散発的な`qwen3.5:4b`のみを扱うが、2026-06基準でラインアップは以下のように拡張されている。

| 世代 | リリース | 構成 | マルチモーダル | 対応言語 | ライセンス | ローカル可否 |
|---|---|---|---|---|---|---|
| Qwen3 | 2025-04 | dense 0.6B〜32B + MoE 30B-A3B、235B-A22B | テキスト | 119 | Apache-2.0 | 可[R2][R7] |
| Qwen3.5 | 2026-02 | Small 0.8B/2B/4B/9B + 27B / 35B-A3B / 122B-A10B / 397B-A17B | vision(ネイティブ) | 201 | Apache-2.0 | 可[R1][R9] |
| Qwen3.6 | 2026-04〜05 | 27B(dense)/35B-A3B(MoE)、コーディング・エージェント強化 | vision | — | Apache-2.0 | 可[R11][R12] |
| Qwen3.7-Max | 2026-05-20 | 独占API専用、オープンウェイト未公開 | — | — | 非公開 | **不可(ローカル不可)**[R7] |

注意:
- 本ガイドは**オープンウェイトモデルのみ**を対象とする。`*-Max`、`*-Plus`などAPI専用モデルはローカルインストール対象ではない。[R7][R12]
- 2025-07〜08の「2507」リフレッシュでQwen3はハイブリッド(トグル)方式から**thinking/instruct分離チェックポイント**に分かれた。ダウンロード時にどの変種かを確認すること。[R7]

---

## 1. インストール方法の選択

| 方法 | 特徴 | 推奨対象 |
|---|---|---|
| Ollama | コマンド1行でインストール/実行、最も簡単 | LLM初心者、迅速なテスト |
| LM Studio | GUIベース、数クリック。MLX・GGUFをサポート | コーディングなしで使いたい方 |
| Hugging Face Transformers | Pythonコードで詳細制御 | 開発者、カスタマイズ |

---

## 2. Ollamaのインストール(最も簡単)

### 2.1 Ollamaのインストール[R8]

Windows
```powershell
irm https://ollama.com/install.ps1 | iex
```
または公式サイト(ollama.com)からインストーラーをダウンロード。

macOS
```bash
brew install ollama
```

Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 実行
```bash
ollama serve   # 手動起動(通常インストール後に自動実行)
```

### 2.3 モデルのダウンロードと実行[R8][R16]
```bash
# 現行推奨 — Qwen3系
ollama run qwen3:8b            # 基本/入門、約5GB
ollama run qwen3:4b            # 軽量
ollama run qwen3:14b           # 約9GB
ollama run qwen3:32b           # dense上位
ollama run qwen3:30b-a3b       # MoE: 30B品質・8B級速度(VRAMは全体分が必要)

# Qwen3.5系(マルチモーダル)
ollama run qwen3.5:9b          # 8GBカード推奨基本値、約6.6GB
ollama run qwen3.5:4b          # 軽量、約3.4GB(ファイル)

# 旧バージョン
ollama run qwen2.5:7b
```

利用可能なサイズ(例): qwen2.5 0.5/1.5/3/7/14/32/72B、qwen3 0.6〜32B + 30B-A3B/235B-A22B、qwen3.5 0.8/2/4/9/27/35/122/397B系。[R1][R2][R10]

注意:
- Ollamaのタグに`instruct`がなくてもchat用モデルである場合が多いが、Qwen3 2507以降はthinking/instruct変種が別々に配布されるため、**タグを直接確認する**こと。(原文の「すべてInstruct」という断定は現行基準では不正確)[R7]
- `qwen3.5:4b`の「3.4GB」は**GGUFファイルサイズ**であり、実行時のRAMではない。実際には+KV cache+contextオーバーヘッドを加える必要がある。[R7][R14]

### 2.4 自作GGUFファイルの使用(Modelfile)[R8]
```text
FROM qwen2.5-7b-instruct-q5_0.gguf
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.05
PARAMETER top_k 20
```
```bash
ollama create my-qwen -f Modelfile
ollama run my-qwen
```

注意: Qwen3.5のような**マルチモーダルGGUFはvision(mmproj)ファイル分離**の問題によりOllamaへの直接インポートが制限される場合がある。この場合はllama.cpp系バックエンドやLM Studioを推奨する。(Ollamaライブラリタグで受け取る場合は正常に動作)[R9]

---

## 3. LM Studioのインストール(GUI)

1. 公式サイトからmacOS/Windows/Linux用インストーラーをダウンロードしてインストール。
2. アプリを起動→`Cmd+Shift+M`(Mac)/`Ctrl+Shift+M`(PC)でモデル検索。
3. 「Qwen」を検索→ハードウェアに合うモデルをDownload。
4. Hugging Faceモデルカードの「Use this model → LM Studio」で直接接続も可能。
5. マルチモーダル/Thinkingトグルはモデル別のYAML設定が必要な場合があり、CLIで`lms import <パス>`の手動インポートもサポート。[R9]

Apple Siliconは**MLXフォーマット**をサポートするLM Studio使用時に性能面のメリットが大きい。[R9][R11]

---

## 4. Hugging Face Transformers(開発者向け)

### 4.1 事前準備
```bash
pip install transformers torch accelerate
pip install modelscope   # 中国地域からのダウンロードが速い
```

### 4.2 ロードと実行
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-30B-A3B"   # またはQwen/Qwen3-8Bなど

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",   # GPU/CPU自動割り当て、不足時はCPUオフロード
)

messages = [{"role": "user", "content": "Qwen、韓国語で自己紹介してください。"}]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True,   # 思考モード(Qwen3以上)
)

outputs = model.generate(
    **tokenizer([text], return_tensors="pt").to(model.device),
    max_new_tokens=200,
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

`enable_thinking=True`は複雑な推論に有利だが応答が遅くなる。日常会話は`False`を推奨。[R2][R8]

インストール前のVRAM適合性確認のヒント — ダウンロードなしでヘッダーのみを読んでメモリを推定: [R18]
```bash
uvx hf-mem --model-id Qwen/Qwen3-8B --experimental --max-model-len 8192
```

---

## 5. モデル選択ガイド(ハードウェア別・Q4_K_M基準)

VRAM数値はQ4_K_M GGUF基準であり、4K context KV cacheで**+1〜2GB**を追加で確保すること。VRAM不足時はOllama/llama.cppがsystem RAMに自動オフロードするが、速度が大きく低下する(10〜20倍遅いメモリ帯域幅)。[R13][R18]

| ハードウェア | 推奨モデル | 概算VRAM/RAM | 備考 |
|---|---|---|---|
| 旧型ノートPC(RAM 4〜8GB) | qwen3.5:4b / qwen2.5:3b | 3〜4GB(ファイル) | CPU-only可能、低速 |
| 一般デスクトップ(RAM 16GB) | qwen3:8b / qwen3.5:9b | 約5〜6.6GB | CPU-only可能[R13][R14] |
| GPU VRAM 8GB | qwen3.5:9b(Q4) / qwen3:7〜8b | 約5.5〜6.6GB | RTX 3060/4060級[R13][R14] |
| GPU VRAM 12GB | qwen3:14b(Q4) | 約9〜9.5GB | Q6_Kの余裕[R13][R14] |
| GPU VRAM 16〜24GB | qwen3:32b / qwen3.6:27b(約17GB) | 17〜20GB | 24GBでQ4_K_M快適[R12][R14] |
| GPU VRAM 24GB | qwen3.6:35b-a3b(UD-Q4約22GB) | 約22GB | contextを過度に設定しないこと[R12][R14] |
| マルチGPU/サーバー | qwen2.5:72b / 235B-A22B / 397B-A17B | 数十〜数百GB | tensor-parallel必要[R16][R19] |

MoEの落とし穴: `30B-A3B`、`35B-A3B`、`80B-A3B`などは**アクティブパラメータが3Bでも全体ウェイトをVRAMに載せる**必要がある。「3Bアクティブ=3Bメモリ」ではない。例: Qwen3-Next-80B-A3Bは非量子化時約160GB VRAM。[R14][R19]

---

## 6. 注意事項とヒント

### 6.1 ストレージ容量
- 7B≈5GB、14B≈9GB、27B≈17GB、32B≈20GB、35B-A3B≈22GB(Q4基準)。[R13][R14]
- Ollamaデフォルト保存パス: `~/.ollama/models`。余裕のある空き容量を確保。[R8]

### 6.2 量子化(Quantization)[R13][R16][R18]
- Q4_K_M: ほとんどのデフォルト値。VRAM約75%節約、品質損失最小。
- Q5_K_M: 約60%節約、Q4よりわずかに高品質。
- Q8_0: 最高品質の量子化。VRAM余裕がある場合。
- NVFP4: Blackwell(RTX 5060 Ti/5090)ネイティブ、Q4より効率的。
- 明示指定例: `ollama run qwen3:8b-q4_K_M`
- 警告: **Q2_Kは韓国語/中国語などCJK出力品質が目立って低下**する。CJK作業はQ4_K_Mを最低線として使うこと。[R13]

### 6.3 GPU使用
- NVIDIA: CUDAドライバが必要。
- Apple Silicon(M1〜M4): 統合メモリで大型モデルに有利。MLXフォーマット+LM Studioを推奨。(例: M3 Max 64GBでqwen3:32b約22 tok/s)[R13]
- VRAM不足時は`device_map="auto"`でCPUオフロードされるが、10〜20%を超えると体感速度が急落 — より小さいモデルを推奨。[R18]

### 6.4 韓国語での使用
- Qwen3系は119言語、Qwen3.5以降は201言語をサポート。韓国語性能は優秀で、韓国語プロンプトをそのまま使用可能。[R2][R9]

### 6.5 Thinking Mode(Qwen3以上)
- CLI: `ollama run qwen3 --think` / `--no-think` [R8]
- API: `{"model":"qwen3","think":false,...}`または`{"thinking":{"budget_tokens":1024}}`で推論予算の上限を設定[R8]
- プロンプト内の`/think`、`/no_think`トグルも一部の変種でサポート。
- 推奨: 要約・ドラフトはno-think、コードデバッグ・数学・論理はthink。

### 6.6 Context / KV cache注意(原文の欠落を補強)
- Qwen3.5/3.6はネイティブ256K(262,144)context、YaRNで約1Mまで拡張可能。[R12][R17]
- contextを長く設定するほどKV cacheがVRAMを大きく占有する。「最小VRAM」表は短/中context基準であり、128K〜256Kを実際に使うには余裕を大きく確保する必要がある。[R12]

### 6.7 ネットワーク
- 最初のダウンロード時はインターネットが必要(数GB〜数十GB)。以降は完全オフライン使用が可能。[R8]

### 6.8 ライセンス
- Qwen3/3.5/3.6のオープンウェイトはApache-2.0 — 商用利用可能。(ただし`*-Max` APIモデルは別途規約)[R7]

---

## 7. トラブルシューティング

| 問題 | 解決方法 |
|---|---|
| "CUDA out of memory" | より小さいモデルまたはより低い量子化(Q4→Q3)/context縮小[R12][R14] |
| Ollamaがモデルを見つけられない | `ollama pull qwen3:8b`で明示的にダウンロード[R8] |
| 応答が遅すぎる | CPU-onlyなら小型モデル(0.6〜4B)、またはオフロード比率を確認(10〜20%超はGPU不足)[R18] |
| LM Studioでモデルが表示されない | `lms import <モデルパス>`で手動インポート[R9] |
| マルチモーダルGGUFがOllamaで壊れる | mmproj分離の問題 — llama.cpp/LM Studioを使用[R9] |
| ダウンロード前のVRAM適合性確認 | `uvx hf-mem --model-id <repo> --experimental` [R18] |

---

## 参考文献(References)

- [R1] Ollama Library — qwen3.5(タグ、サイズ/マルチモーダル/256K context)。https://ollama.com/library/qwen3.5
- [R2] Ollama Library — qwen3(dense+MoE、thinkingフレームワーク)。https://ollama.com/library/qwen3
- [R7] Local AI Master、「How to Run Qwen3 Locally (2026): Setup Guide」— 8モデル構成、119言語、2507分離、Qwen3.7-Max API専用明示。https://localaimaster.com/blog/qwen-3-local-setup-guide
- [R8] Serverman、「Run Qwen3 on Ollama: All Sizes and Hardware Guide」— インストール/実行、--thinkトグル、KV/予算。https://www.serverman.co.uk/ai/ollama/how-to-run-qwen3-on-ollama/
- [R9] Unsloth Docs、「Qwen3.5 - How to Run Locally」— Small/大型構成、Ollama GGUF mmproj制限、LM Studio yamlトグル。https://unsloth.ai/docs/models/qwen3.5
- [R10] Ollama Library — qwen3.5 Tags(0.8b〜122bサイズ/容量)。https://ollama.com/library/qwen3.5/tags
- [R11] Ollama Library — qwen3.6(27B/35B、MLX、コーディング強化)。https://ollama.com/library/qwen3.6
- [R12] knightli、「Qwen3.6 VRAM Table」— 27B≈17GB、35B-A3B≈22GB(UD-Q4)、context/KV注意。https://knightli.com/en/2026/05/01/qwen3-6-local-vram-quantization-table/
- [R13] PromptQuorum、「Qwen Local Deployment Guide 2026」— Q4_K_M VRAM表、Q2_K CJK低下警告、Apple Silicon tok/s。https://www.promptquorum.com/local-llms/qwen-local-deployment-guide-2026
- [R14] InsiderLLM、「VRAM Cheat Sheet for Local LLMs」— qwen3.5 9B 6.6GB、visionオーバーヘッド、MoE全体ウェイト搭載。https://insiderllm.com/guides/vram-requirements-local-llms/
- [R16] Compute Market、「Qwen 3 Hardware Guide 0.8B〜72B」— ハードウェアティア/価格、量子化フォーマット。https://www.compute-market.com/blog/qwen-3-local-hardware-guide-2026
- [R17] M. Chen(Medium)、「Run Qwen3.6-35B-A3B on 6GB VRAM Using Llama.cpp」— 低スペックオフロード事例。https://mychen76.medium.com/run-qwen3-6-35b-a3b-on-6gb-vram-using-llama-cpp-30-tps-a89032e5a60c
- [R18] ai.rs、「Will This LLM Fit My GPU?」— hf-mem事前チェック、オフロード性能損失。https://ai.rs/ai-developer/will-llm-fit-my-gpu-vram-requirements
- [R19] Hugging Face Discussion — Qwen3-Next-80B-A3Bメモリ(非量子化時約160GB、MoE全体ウェイト搭載)。https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct/discussions/7

> 免責事項: モデルラインアップ・タグ・容量はアップストリーム(Ollama/HF/Unsloth)で随時更新される。実際のインストール前に該当ライブラリページで最新のタグ・ファイルサイズを再確認すること。
