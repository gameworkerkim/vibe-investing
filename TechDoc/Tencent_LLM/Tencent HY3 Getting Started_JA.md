---
title: "テンセント Hunyuan Hy3 の紹介 — Hy3 Getting Started ガイド"
description: "テンセントのHy3モデル(2026年7月6日正式リリース)のスペック、DeepSeek/Claude/ChatGPTとの価格比較、長所と短所、競合モデル比較、API・セルフホスティング・AIコーディングツール連携までのGetting Startedガイド。"
keywords:
  - "テンセント Hy3"
  - "Hunyuan Hy3"
  - "Hy3 使い方"
  - "Hy3 料金"
  - "Hy3 vs DeepSeek"
  - "MoE LLM"
  - "TokenHub"
  - "Claude Code 連携"
lang: ja
featured: false
schema_type: TechArticle
---

# テンセント Hunyuan Hy3 の紹介 — Hy3 Getting Started ガイド

> 作成日: 2026-07-12 | 対象モデル: Tencent Hy3(正式リリース 2026-07-06)
> 本文書のすべての数値はテンセントの公式発表およびサードパーティのベンチマーク資料に基づき、出典は文末の References に明記する。

---

## 1. 概要

Hy3はテンセントのHyチーム(旧Hunyuan)が2026年7月6日に正式リリースしたMoE(Mixture-of-Experts)ベースのLLMである。4月23日に公開されたHy3 previewを50以上のプロダクトチームのフィードバックと強化学習(RL)のスケールアップで改良した正式版であり、Chief AI Scientistである姚順雨(Yao Shunyu)氏の入社201日目に登場した最初の完成形の成果物である。1月末のインフラ再構築から正式リリースまで約6か月でend-to-endのモデル開発ループを完走した。無限の資金と人員を投入し、996(9時始業・21時終業・週6日勤務、中国でこう呼ばれる)を基本として働いたという。

コアポジショニングは明確である。最大パラメータ競争ではなく「**実務の生産性シナリオで信頼できる低コストのエージェントモデル**」である。テンセントの表現によれば、自身のサイズの2〜5倍のパラメータを持つフラッグシップオープンソースモデルに匹敵する性能を発揮する。

## 2. モデルスペック

| 項目 | 値 |
|---|---|
| アーキテクチャ | MoE(hybrid fast/slow thinking) |
| 総パラメータ数 | 295B |
| アクティブパラメータ数 | 21B(192エキスパートのうちtop-8が活性化) |
| MTPレイヤー | 3.8B(1層) |
| レイヤー数 | 80(MTP除く) |
| Attention | GQA、64ヘッド / 8 KVヘッド / head dim 128 |
| コンテキスト長 | 256K |
| 語彙数 | 120,832 |
| 精度 | BF16(FP8量子化版も別途提供) |
| ライセンス | **Apache 2.0**(previewはTencent Hy Community Licenseだった) |
| 重み配布 | Hugging Face、ModelScope、GitCode、CNB |

## 3. 価格比較: Hy3 vs DeepSeek vs Claude vs ChatGPT

### 3.1 Hy3公式価格(Tencent Cloud TokenHub基準)

| 区分 | 価格(RMB/1Mトークン) | USD換算 | KRW換算(目安) |
|---|---|---|---|
| Input | 1元 | $0.15 | 約195ウォン |
| Output | 4元 | $0.59 | 約780ウォン |
| キャッシュヒットInput | 0.25元 | $0.037 | 約49ウォン |

同等性能のモデルと比較して圧倒的に低い価格帯であり、preview公開後、日次トークン消費量が20倍に増加した。

### 3.2 主要モデル価格比較表(2026年7月、公式価格基準、USD/1Mトークン)

| モデル | Input | Output | キャッシュヒットInput | Hy3比のOutput倍率 | Context |
|---|---|---|---|---|---|
| **Tencent Hy3** | $0.15 | $0.59 | $0.037 | 1.0x | 256K |
| DeepSeek V4 Flash | $0.14 | $0.28 | $0.0028 | 0.47x | 1M |
| DeepSeek V4 Pro | $0.435 | $0.87 | $0.003625 | 1.5x | 1M |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | 8.5x | 200K |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | 25x | 1M |
| Claude Opus 4.8 | $5.00 | $25.00 | $0.50 | 42x | 1M |
| GPT-5.4(OpenAI) | $2.50 | $15.00 | 入力の約0.1倍 | 25x | 1M |
| GPT-5.5(OpenAI) | $5.00 | $30.00 | 入力の約0.1倍 | 51x | — |

### 3.3 価格比較の解釈

**vs DeepSeek — 条件付き。**性能クラスが近いV4 Proと比較すると、Hy3が明確に安い(Inputは約1/3、Outputは約2/3の水準)。ただしV4 Proの現行価格は75%割引適用後のものであり、元の定価は$1.74/$3.48であった。一方、最安ラインであるV4 Flashと比較すると、DeepSeekの方が安い — Inputはほぼ同等だが、Outputは半分以下であり、キャッシュヒット単価は10倍以上安い($0.0028 vs $0.037)。DeepSeekはキャッシュヒット時にInputが98%割引される仕組みが特別な設定なしに自動適用されるため、同一のシステムプロンプトを繰り返し送信するエージェントループやRAGのようにキャッシュヒット率が高いワークロードでは、実効コストの差が表面上の単価より大きく広がる。

**vs Claude / ChatGPT — 圧倒的優位。**Output基準でHy3はClaude Sonnet 4.6の1/25、Opus 4.8の1/42、GPT-5.5の1/51の水準である。両陣営ともプロンプトキャッシング(~90%割引)とバッチAPI(Claudeで50%割引)で実効コストを下げられるが、割引を最大限重ねてもHy3の表面単価には届かない。ただし、この差は性能差との交換であり、最高難度の推論やマルチツール・オーケストレーションが必要なタスクでは、フロンティアモデルのタスク当たり成功率がトークン単価の差を相殺できる場合がある。

**請求書の落とし穴3つ。**
(1)DeepSeek V4はthinkingモードがデフォルトである — 目に見えない内部推論トークンがoutput料金として請求される。Hy3は`no_think`がデフォルトのため、突発的な暴走課金のリスクがない。

(2)OpenAI GPT-5.5のoutput価格は出典間で$25〜30の差があるため、本番予算は公式ページで再確認すること。
(3)エージェントワークロードは各ステップで累積コンテキストを再送信するため、チャットに比べて10〜100倍のトークンを消費し、単価差がそのまま増幅される。

## 4. 長所

**(1)コスト効率。**アクティブパラメータ21Bで推論コストを抑えつつ、2〜5倍規模のフラッグシップと競合する性能。OpenRouter基準でテンセントのトークン呼び出しシェアが6月に8.7%まで上昇したことが市場反応の証左。

**(2)エージェント/ツールコールの安定性。**公式リリース版の中核的な改善点。ツールコール成功率とエラー回復の改善、無限ループを誘発する無効な呼び出しの減少。SWE-Bench Verifiedにおいて、CodeBuddy、Cline、KiloCodeなど異なるエージェントスキャフォールディング間の精度差が4%以内 — プロダクションエージェントビルダーにとってベンチマークスコアよりも重要な特性。

**(3)ハルシネーション抑制。**「根拠があれば答え、根拠がなければないと言い、出典を混同したりデータを作り出したりしない」という原則で学習。内部の実使用シナリオ評価でハルシネーション率が12.5%→5.4%、常識エラー率が25.4%→12.7%に改善。

**(4)マルチターン/長文コンテキストの維持。**マルチターン問題率が17.4%→7.9%、MRCR(長対話ベンチマーク)が42.9%→75.1%。指示語解決(coreference)、省略復元、複数ターンにわたる制約の継承など、実務のペインポイントを中心に改善。

**(5)実務での検証。**WorkBuddy内部評価でタスク解決率が72%→90%、平均完了時間が34%短縮。3地域・6鉱区・5,220連結セルの石油会社の連結キャッシュフローモデルをハードコーディングなしにライブ数式で構築した事例など、オフィス/財務モデリングの実践事例が公開されている。

**(6)完全オープンソース。**Apache 2.0の商用フレンドリーなライセンス、FP8量子化版とファインチューニングパイプライン(full/LoRA、DeepSpeed ZeRO、LLaMA-Factory連携)、圧縮ツールキットAngelSlimまで提供。

## 5. 短所と限界

**(1)最上位推論力の壁。**ハードコアなコーディング、複雑な推論、マルチツール調整などの中核能力において、Claude、GPT-5.5などの第一線のフロンティアモデルに依然として劣るとの評価。GPQA DiamondではHy3とDeepSeek V4 Proともに約90%で、GPT-5.4(93.0%)、Gemini 3.1 Pro(94.3%)に及ばない。

**(2)コンテキスト長。**256Kは実用的だが、DeepSeek V4 Proの1Mに対して1/4。超大規模コードベースや文書の一括分析には不利。

**(3)メモリ要件。**MoEの特性上、リクエスト当たりの計算は21Bだが、295B全体がメモリに常駐する必要がある。セルフホスティング推奨スペックはH20-3eクラス8GPU。

**(4)内部検証値への依存。**ハルシネーション率、WorkBuddy解決率など印象的な数値の多くがテンセントの内部評価に基づく。標準化された公開ベンチマークではないため、独立した再現が難しい。

**(5)テンセント内での地位の限界。**WeChatエコシステムは自社モデルWeLMを主力として維持中 — Hyがテンセントの統合AIファウンデーションになれていないことは、長期戦略上のリスクとして指摘される。

## 6. 競合モデル比較

| 軸 | Hy3(Tencent) | DeepSeek V4系 | Qwen 3.7(Alibaba) | Claude / GPT-5.5 |
|---|---|---|---|---|
| 構造 | 295B MoE / A21B | V4 Pro: 1.6T MoE / A約48Bクラス | 3.7 Max: 非公開(proprietary) | 非公開 |
| Context | 256K | V4 Pro: 1M | — | モデルにより異なる |
| ライセンス | Apache 2.0 | MIT(自己ホスティング可) | MaxはAPI専用 | クローズド |
| 強み | エージェント安定性、ハルシネーション抑制、コスト | アルゴリズム/競技コーディング(LiveCodeBench 93.5%)、超長文 | 長時間自律エージェント(35時間ラン)、SWE-bench Pro 60.6% | 最高難度の推論、マルチツール調整、創造的作業 |
| 価格帯 | 最安値ティア | V4 Proも低価格($0.87/1M output) | Max $7.50/1M output | 最高価格ティア |

**vs DeepSeek V4。**サードパーティ比較(CodingFleet)では、18の共有ベンチマークのうち12でHy3がV4 Proを上回った。特に汚染のない(contamination-free)新規ベンチマークDeepSWEでは28.0% vs 8.0%と20ポイントの差 — ツール使用の一般化能力の違いと解釈される。HLEもツールなしではわずかに劣る(37.0% vs 37.7%)が、ツール使用時には5ポイント優位(53.2% vs 48.2%)。一方V4 Proは1Mコンテキスト、MITライセンス、繰り返しコンテキストにおけるディスクキャッシングのコスト優位性を持つ。SWE-bench VerifiedはHy3が74.4% vs V4の約72%でわずかに優位。

**vs Qwen(アリババ)。**Qwen 3.7 MaxはSWE-bench Pro 60.6%(独占モデル最高値)、35時間の自律エージェントランなど、「Agent Frontier」を標榜するプレミアム路線。ただしAPI専用(アリババクラウドに依存)であり、output基準でHy3より10倍以上高価。オープンウェイト+低コスト+自己ホスティングが必要ならHy3、最長時間の自律エージェント性能が必要ならQwen Max。

**vs Claude / ChatGPT(GPT-5.5)。**フロンティア級の難易度の推論、複雑なマルチステップ問題解決、マルチツールオーケストレーションでは依然としてこれらが優位。Hy3の戦略は正面対決ではなく、「企業実務の大部分を極めて低コストで処理する」ことにある。テンセント自身のブラインド評価(専門家270名、有効比較312件)ではHy3が2.67/4 vs GLM-5.1の2.51/4 — フロントエンド開発、CI/CD、データ・ストレージタスクで差が最も大きかった。

## 7. Getting Started

### 7.1 アクセス経路の選択

| 経路 | 対象 | 備考 |
|---|---|---|
| Tencent Cloud TokenHub API | 即時利用、インフラ不要 | 上記価格表が適用 |
| OpenRouterなどのグローバルプラットフォーム | 海外開発者 | 順次連携中(previewは既に登録済) |
| セルフホスティング(vLLM/SGLang) | データ主権・カスタマイズが必要な場合 | H20-3eクラス8GPU推奨 |
| Yuanbao / WorkBuddy | 最終ユーザー体験 | Yuanbaoのエージェント機能は無料 |

### 7.2 Tencent Cloud APIの直接呼び出し(ホスティング型)

テンセント公式ドキュメントセンター(aistudio.tencent.com/hunyuan/doc-center)およびTencent Cloud文書に基づく。Hunyuan APIはOpenAIインターフェース仕様に互換性があるため、OpenAI公式SDKで`base_url`と`api_key`だけを差し替えれば、アプリケーションの修正なしに切り替えられる。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.hunyuan.cloud.tencent.com/v1",
    # APIキーはコンソールで発行: console.cloud.tencent.com/hunyuan/api-key
    api_key="YOUR_HUNYUAN_API_KEY",
)

response = client.chat.completions.create(
    model="hy3",
    messages=[{"role": "user", "content": "こんにちは。"}],
)
print(response.choices[0].message.content)
```

公式文書で確認すべき運用上の注意点:

| 項目 | 内容 |
|---|---|
| エンドポイント | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| 同時実行数制限 | デフォルト5並列(メイン・サブアカウントで共有、上限緩和は別途申請) |
| `stop`パラメータ | OpenAIはマッチ文字列の**直前**で停止、Hunyuanはマッチ文字列の**直後**で停止 — この差異に依存する解析ロジックは注意が必要 |
| ストリーミングusage | `stream_options.include_usage=true`設定時、最後のチャンクにusageが返る |
| Embedding | `hunyuan-embedding`固定、dimensions 1024固定、`input`/`model`パラメータのみサポート |
| Function calling | OpenAI仕様の2パスフローをサポート(モデルが関数・引数を選択→クライアントが実行→結果をコンテキストに付加して再リクエスト) |
| プラットフォーム移行 | Hunyuanの機能は**TokenHubへ移行中** — Hy3などの新モデルはTokenHub(`tencent-tokenhub`)/TokenPlan(`tencent-tokenplan`)エンドポイントを優先提供。APIキーの権限範囲を制限する場合、許可モデルに`hy3`を含める必要がある |

テンセントは互換性維持を公言しているが、細部の動作差異が存在するため、OpenAIから移行する際は上表の項目を回帰テスト対象に含めることを推奨する。

### 7.3 モデルのダウンロード(セルフホスティング用)

```bash
# Hugging Face
huggingface-cli download tencent/Hy3          # BF16
huggingface-cli download tencent/Hy3-FP8      # FP8量子化版(メモリ節約)
```

重みミラー: Hugging Face、ModelScope、GitCode、CNB。

### 7.4 vLLMでのサービング

```bash
# ソースビルド
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv pip install --editable . --torch-backend=auto

# MTP(Multi-Token Prediction)を有効化してサーバー起動
export VLLM_FLASHINFER_ALLREDUCE_BACKEND=trtllm
vllm serve tencent/Hy3 \
  --tensor-parallel-size 8 \
  --speculative-config.method mtp \
  --speculative-config.num_speculative_tokens 2 \
  --tool-call-parser hy_v3 \
  --reasoning-parser hy_v3 \
  --enable-auto-tool-choice \
  --port 8000 \
  --served-model-name hy3
```

### 7.5 SGLangでのサービング

```bash
git clone https://github.com/sgl-project/sglang
cd sglang
pip3 install pip --upgrade
pip3 install "transformers>=5.6.0"
pip3 install -e "python"

python3 -m sglang.launch_server \
  --model tencent/Hy3 \
  --tp-size 8 \
  --tool-call-parser hunyuan \
  --reasoning-parser hunyuan \
  --speculative-num-steps 2 \
  --speculative-eagle-topk 1 \
  --speculative-num-draft-tokens 3 \
  --speculative-algorithm EAGLE \
  --port 8000 \
  --served-model-name hy3
```

### 7.6 OpenAI互換APIの呼び出し(セルフホスティングサーバー基準)

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="hy3",
    messages=[
        {"role": "user", "content": "こんにちは。簡単に自己紹介してください。"},
    ],
    temperature=0.9,   # 公式推奨値
    top_p=1.0,         # 公式推奨値
    # reasoning_effort:
    #   "no_think"(デフォルト、即答) | "low" | "high"(深いchain-of-thought)
    extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}},
)
print(response.choices[0].message.content)
```

運用ヒント: 数学・コーディング・複雑な推論には`reasoning_effort="high"`、単純な応答・大量処理には`"no_think"`。このパラメータ一つでfast/slow thinkingを切り替えることがHy3ハイブリッド設計の中核インターフェースである。

### 7.7 ファインチューニングと量子化

Full fine-tuningとLoRAの両方をサポートし、DeepSpeed ZeRO設定とLLaMA-Factory連携を含む公式パイプラインが提供される(リポジトリの`finetune/`ディレクトリ)。圧縮はAngelSlimツールキットで量子化・低ビット・speculative samplingをサポートする。

### 7.8 AIコーディングツールとの連携(Using Hy3 in Programming/OpenClaw Tools)

テンセント公式ドキュメントセンターは、Hy3を主要なAIコーディングツールに接続するガイドを別セクションとして提供している。TokenHub公式文書(接入 AI 工具)に基づき全内容を整理する。

#### 7.8.1 共通の事前準備

1. TokenHubコンソールのAPIキー管理ページ(console.cloud.tencent.com/tokenhub/apikey)でAPIキーを生成。
2. **注意**: アクセス範囲(可访问范围)を「制限範囲」に設定する場合、許可モデルリストに必ず**Hy3**(previewを使う場合は**Hy3 preview**も)をチェックする必要がある。この項目を見逃すと、認証は通るがモデル呼び出しが失敗する。
3. 生成直後にAPIキーをコピー・保管すること。その後は再確認できない。

#### 7.8.2 Claude Code(Anthropicプロトコル)

Claude CodeはAnthropic Messagesプロトコルを使用するため、TokenHubのAnthropic互換エンドポイントを利用する。OpenAI互換ツールと異なり、**Base URLはルートパス**(`/v1`なし)である点に注意。

`~/.claude/settings.json`(Windows: `ユーザーディレクトリ/.claude/settings.json`)に以下を設定:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://tokenhub.tencentmaas.com",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "hy3",
    "CLAUDE_CODE_SUBAGENT_MODEL": "hy3",
    "ENABLE_TOOL_SEARCH": false
  }
}
```

各環境変数の意味(公式文書基準):

| 環境変数 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_BASE_URL` | はい | TokenHub接続時は`https://tokenhub.tencentmaas.com`に固定 |
| `ANTHROPIC_AUTH_TOKEN` | はい | TokenHubコンソールで発行したAPIキー |
| `ANTHROPIC_MODEL` | はい | デフォルト呼び出しモデル名(`hy3`または`hy3-preview`) |
| `ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL` | いいえ | Claude Codeの3つのモデルティアをすべて同一モデルにマッピング — バックグラウンドの軽量呼び出しが存在しないデフォルトモデルにルーティングされて静かに失敗する問題を防止 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | いいえ | サブエージェントモデル。主モデルと統一することを推奨(クロスモデル互換性問題を防止) |
| `ENABLE_TOOL_SEARCH` | いいえ | `false`必須 — 下記の制約を参照 |

設定後、新しいターミナルで`claude`を実行→`/status`を入力→API EndpointがHunyuanは`https://tokenhub.tencentmaas.com`、Modelが`hy3`と表示されれば適用完了。

運用上の制約2点(公式文書に明記):

**深い推論の有効化**: 上記設定では、Hy3のデフォルトの思考モードは`no_think`である。深い推論(high)が必要な場合はClaude Code内で`/config`を実行→Thinking modeを`true`に変更→再起動。

**Web検索の制限**: Claude Codeはサードパーティモデルによるネイティブ内蔵Web検索の使用をブロックする。Hy3設定後に検索がトリガーされると失敗する。代替策は検索MCPの接続:

```bash
# テンセントクラウドMCPマーケットのWeb検索MCPを追加(別途クラウドAPIキーが必要)
claude mcp add --transport sse WebSearchMCP "https://mcp-api.tencent-cloud.com/sse/XXX"

# ネイティブ検索ツールを明示的に無効化して起動(MCP呼び出しの安定性を保証)
claude --disallowedTools "WebSearch"
```

MCP追加後はClaude Codeの再起動が必須。検索MCP用のクラウドAPIキーはモデルAPIキーとは別の独立したキーである。

#### 7.8.3 OpenAI互換ツール(Cline、Cursor、Roo Code、Kilo Code、OpenCode、Cherry Studio、Codex)

このグループはすべて同一の3つの値で連携する。Claude Codeと異なり、**Base URLに`/v1`が含まれる**点に注意。

| 設定項目 | 値 |
|---|---|
| API Provider | `OpenAI Compatible` |
| Base URL | `https://tokenhub.tencentmaas.com/v1` |
| API Key | TokenHubで発行したAPIキー |
| Model ID | `hy3` |

ツールごとの設定場所(公式文書基準):

| ツール | 形態 | 設定場所 |
|---|---|---|
| Cline | VSCode拡張機能 | 初回実行時「Bring my own API key」→Continue、または右上の設定ボタン |
| Cursor | IDE | Settings → Models → OpenAI互換カスタムエンドポイント |
| Roo Code | VSCode拡張機能 | Provider設定でOpenAI Compatibleを選択 |
| Kilo Code | VSCode拡張機能 | Provider設定(リリース時点でHy3無料アクセスプロモーションを提供) |
| OpenCode | CLI | provider設定ファイルにOpenAI互換エンドポイントを登録 |
| Cherry Studio | デスクトップアプリ | モデルプロバイダー追加 → OpenAI Compatible |
| Codex | CLI | configにOpenAI互換プロバイダーを登録 |

#### 7.8.4 OpenClaw / Hermes Agent(専用連携)

**OpenClaw**: 公式プロバイダープラグインが提供される。TokenHub(`tencent-tokenhub`)とTokenPlan(`tencent-tokenplan`)の2つのエンドポイントをサポートし、内蔵カタログは`https://tokenhub.tencentmaas.com/v1`を使用する。モデルIDは`hy3` — テンセントの`HY-3D-*`系(3D生成API)と混同しないこと。

```bash
# TokenHub接続
openclaw onboard --non-interactive \
  --auth-choice tokenhub-api-key \
  --tokenhub-api-key "$TOKENHUB_API_KEY"
```

Gatewayをlaunchd/systemd/Dockerなどのマネージドサービスとして運用する場合、インタラクティブシェルでexportしたキーはマネージドプロセスから見えないため、`~/.openclaw/.env`に`TOKENHUB_API_KEY`を永続設定する必要がある。

**Hermes Agent**: Nous Portal(portal.nousresearch.com)のサブスクリプションゲートウェイを通じてアクセスする。`hermes setup --portal`でOAuth連携後、ポータルカタログからHy3モデルを選択する方式であり、リリースプロモーション期間には無料ティアが提供された。

#### 7.8.5 公式連携文書 全リスト

| ツール | 公式文書URL |
|---|---|
| ドキュメントセンター(英語) | https://aistudio.tencent.com/hunyuan/doc-center |
| 接入 AI 工具(連携文書目次) | https://cloud.tencent.com.cn/document/product/1823/130931 |
| CodeBuddy Code | https://cloud.tencent.com.cn/document/product/1823/131901 |
| WorkBuddy | https://cloud.tencent.com.cn/document/product/1823/131902 |
| Claude Code | https://cloud.tencent.com.cn/document/product/1823/131903 |
| OpenClaw | https://cloud.tencent.com.cn/document/product/1823/130935 |
| Hermes Agent | https://cloud.tencent.com.cn/document/product/1823/131927 |
| OpenCode | https://cloud.tencent.com.cn/document/product/1823/130936 |
| Cline | https://cloud.tencent.com.cn/document/product/1823/130932 |
| Cursor | https://cloud.tencent.com.cn/document/product/1823/130933 |
| Kilo Code | https://cloud.tencent.com.cn/document/product/1823/131904 |
| Roo Code | https://cloud.tencent.com.cn/document/product/1823/131905 |
| Codex | https://cloud.tencent.com.cn/document/product/1823/133532 |

## 8. 推奨利用シナリオ

**Hy3推奨:** ツールコールの安定性が中核要件となる企業向けAIエージェント、大量トラフィックの低コスト処理(顧客対応、文書・データ処理の自動化)、オフィス生産性(財務モデリング、レポート・プレゼンテーション生成)、自己ホスティングが必要な規制環境(Apache 2.0)。

**他モデル推奨:** 100万トークン級の超長文一括分析→DeepSeek V4 Pro。数十時間単位の自律エージェントラン→Qwen 3.7 Max。最高難度の推論・数学証明・創造的な長文作業→Claude、GPT-5.5。

一言でまとめると: **Hy3は「日常的な企業業務の大部分をフロンティアのごくわずかなコストで安定的に処理する」実用主義モデルである。**ベンチマーク1位ではなく、プロダクションの信頼性で勝負する姚順雨式「AI後半戦」哲学の最初の実物である。

---

## 参考文献(References)

1. テンセント公式プレスリリース — "Tencent Hunyuan Officially Releases Hy3"(2026-07-06): https://www.tencent.com/en-us/articles/2202386.html
2. Tencent Hy技術ブログ — "Introducing Hy3": https://hy.tencent.com/research/hy3
3. GitHub公式リポジトリ(スペック・Quickstart・デプロイガイド): https://github.com/Tencent-Hunyuan/Hy3
4. Hugging Faceモデルカード: https://huggingface.co/tencent/Hy3 / FP8: https://huggingface.co/tencent/Hy3-FP8
5. TechNode — リリースおよび価格報道(2026-07-07): https://technode.com/2026/07/07/tencent-launches-hunyuan-hy3-integrates-model-across-multiple-products/
6. Caixin Global — リリース報道、Yao Shunyu・OpenRouterシェア(2026-07-06): https://www.caixinglobal.com/2026-07-06/tencent-launches-upgraded-hunyuan-3-ai-model-with-free-agent-feature-102461489.html
7. Pandaily — WorkBuddy 90%タスク解決率・実践事例: https://pandaily.com/tencent-hunyuan-hy3-launch-agent-90-percent-task-resolution-jul2026-v2
8. CodingFleet — "Hy3 vs DeepSeek V4 Pro"ベンチマーク比較: https://codingfleet.com/blog/hy3-vs-deepseek-v4-pro/
9. CodingFleet — "DeepSeek V4 Pro vs Qwen 3.7 Max": https://codingfleet.com/blog/deepseek-v4-pro-vs-qwen-3-7-max/
10. AIMadeTools — "Tencent Hy3 vs DeepSeek V4"(SWE-bench比較): https://www.aimadetools.com/blog/tencent-hy3-vs-deepseek-v4/
11. BigGo Finance — Hy3批判的分析(WeLM・第一線との比較における限界): https://finance.biggo.com/news/eac480c0-1840-4271-858a-eb43389b8811
12. The Standard — オープンソースライセンス・価格報道: https://www.thestandard.com.hk/innovation/article/336512/Tencents-Hunyuan-releases-Hy3-available-on-WorkBuddy-and-more
13. OpenRouterモデル比較ページ: https://openrouter.ai/compare/deepseek/deepseek-v4-pro/tencent/hy3-preview
14. Artificial Analysis — Hy3インテリジェンス・価格・速度比較: https://artificialanalysis.ai/models/comparisons/deepseek-v4-flash-vs-hy3
15. Tencent Hunyuan公式ドキュメントセンター: https://aistudio.tencent.com/hunyuan/doc-center
16. Tencent Cloud — Hunyuan OpenAI互換インターフェース公式文書(エンドポイント・stop動作・同時実行・embedding・function call): https://cloud.tencent.com/document/product/1729/111007
17. OpenClaw — Tencent Cloud TokenHub/TokenPlanプロバイダー連携ガイド(hy3モデルアクセス): https://docs.openclaw.ai/providers/tencent
18. Tencent Cloud TokenHub — Claude Code連携公式文書(settings.json全設定・深い推論・Web検索MCP): https://cloud.tencent.com.cn/document/product/1823/131903
19. Tencent Cloud TokenHub — 接入 AI 工具文書目次(CodeBuddy/WorkBuddy/Claude Code/OpenClaw/Hermes/OpenCode/Cline/Cursor/Kilo/Roo/Codex): https://cloud.tencent.com.cn/document/product/1823/130931
20. Tencent Cloud TokenHub — Cline連携公式文書(OpenAI Compatible設定パターン): https://cloud.tencent.com.cn/document/product/1823/130932
21. DeepSeek公式 Models & Pricing(V4 Flash/Pro価格): https://api-docs.deepseek.com/quick_start/pricing/
22. Anthropic公式 Pricing文書(Claudeモデル別価格・キャッシング・バッチ割引): https://platform.claude.com/docs/en/about-claude/pricing
23. CloudZero — Claude API Pricing 2026 / Claude Opus 4.8 Pricing(GPT-5.4/5.5価格比較含む): https://www.cloudzero.com/blog/claude-api-pricing/
24. Morphllm — AI Coding Costs 2026(主要モデル公式価格の統合比較、2026-06-18基準): https://www.morphllm.com/ai-coding-costs

*注: ハルシネーション率(5.4%)、常識エラー率(12.7%)、WorkBuddyタスク解決率(90%)、ブラインド評価(2.67/4 vs GLM-5.1の2.51/4)はテンセント内部評価の数値であり、独立して再現された公開ベンチマークではない。KRW換算は2026年7月初旬の為替レート(1 CNY ≈ 195 KRW)に基づく近似値。3.2節の価格表は2026年7月初旬の各社公式発表に基づき、DeepSeek V4 Proはプロモーション割引価格、GPT-5.5のoutputは出典間で$25〜30の差がある。LLM APIの価格は随時変動するため、本番予算確定前に各社の公式価格ページを再確認すること。*
