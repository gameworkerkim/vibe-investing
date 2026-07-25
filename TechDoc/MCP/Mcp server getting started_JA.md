---
title: "MCPサーバー開発 Getting Started — 概念からAMQS-AI-Infra Signal Serverの実装まで"
description: "MCP(Model Context Protocol)の概念・特徴・APIとの違いを第1部で包括的に整理し、第2部でAMQSクオンツ戦略を題材に実際に動作するMCPサーバーを構築・テスト・Claude Desktopへ接続する実践ガイド。"
keywords:
  - "MCP"
  - "Model Context Protocol"
  - "MCPサーバー開発"
  - "FastMCP"
  - "Claude Desktop"
  - "AMQS"
  - "MCP tools resources prompts"
  - "MCPセキュリティ"
lang: ja
featured: false
schema_type: TechArticle
---

# MCPサーバー開発 Getting Started — 概念からAMQS-AI-Infra Signal Serverの実装まで

> 第1部でMCP(Model Context Protocol)の概念・特徴・APIとの違いを包括的に整理する。
> 第2部で[vibe-investing / AMQS-AI-Infra](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra)
> クオンツ戦略を題材に**実際に動作するMCPサーバーを自作し、テストし、Claude Desktopに接続する**全過程を扱う。
> 同梱コード(`server.py`)はstdioハンドシェイクからtool呼び出しまで実際に検証済みである。

---

# 第1部 — MCPの概念理解

## 1. MCPとは何か?

MCP(Model Context Protocol)は、2024年11月にAnthropicが発表した**オープン標準プロトコル**であり、AIモデル(特にLLM)が外部のデータソースやツールと接続できるようにする通信規約である。その後OpenAI、Google、Microsoftなど主要IT企業が採用し、AI業界の事実上の標準(de facto standard)として定着した。

### 1.1 なぜMCPが必要なのか? — 問題の系譜

| 段階 | 状況 | 限界 |
|---|---|---|
| 1. LLM単独 | 学習時点の知識のみで応答 | リアルタイム情報("今の天気")が取得できず、外部世界との相互作用ができない |
| 2. Agentフレームワーク | Langchain・CrewAIなどがLLMを外部ツール(検索・API・DB)に接続 | フレームワークごとにツール別の個別SDK作成が必要 — M×N統合問題 |
| 3. **MCP** | 単一標準プロトコルで統合 | M+Nに縮小 — ツール提供者はMCPサーバーを1つ作れば、すべてのホストで利用可能 |

M×N問題を具体的に見ると、Agentフレームワークがた個 × 外部ツールが個の組み合わせごとにコネクタを個別開発する必要があった。ツール提供者はすべてのフレームワークと個別に連携しなければならない非効率に悩まされていた。MCPはこれを**「AI分野のUSB-Cポート」**のような標準接続方式で解決する — MCPをサポートするどのAIアプリケーションも、MCPをサポートするどのデータソースにも即座に接続できる。

### 1.2 MCPアーキテクチャ

| 構成要素 | 役割 | 例 |
|---|---|---|
| **MCPホスト(Host)** | LLMを含むAIアプリケーション環境 | Claude Desktop、Cursor、Windsurf |
| **MCPクライアント(Client)** | ホスト内でLLMとMCPサーバー間の通信を仲介。サーバーごとに1:1接続 | ホストに内蔵 |
| **MCPサーバー(Server)** | 外部サービス(DB・Web API・ファイルシステムなど)と接続し、LLMにコンテキストと機能を提供 | slack-mcp-server、notion-mcp-server、**本文書のAMQSサーバー** |
| **転送層(Transport)** | JSON-RPC 2.0ベースのメッセージ交換 | stdio(ローカル)、Streamable HTTP(リモート) |

```
┌─────────────── Host (Claude Desktop) ───────────────┐
│  LLM ↔ Client A ── stdio ──→ Server A (AMQS信号)     │
│        Client B ── stdio ──→ Server B (Slack)        │
│        Client C ── HTTP ───→ Server C (リモートDB)   │
└──────────────────────────────────────────────────────┘
```

1つのホストが複数のサーバーに同時接続し、LLMは対話コンテキストに応じてどのサーバーのどの機能を使うかを自ら判断する。

## 2. MCPの中核的な特徴

| 特徴 | 内容 |
|---|---|
| **オープン標準(Open Standard)** | 仕様とSDKがオープンソースで公開。特定のAIモデル・ベンダーに依存せず、誰でもサーバー・クライアントを実装できる |
| **双方向通信(Bidirectional)** | 一回限りのリクエスト-レスポンスではなく、継続セッションベース。サーバーがクライアントに通知(notification)を送る、またはサーバーが逆にLLM推論を要求(sampling)することも仕様に含まれる |
| **汎用性(Universality)** | 一度MCP標準を実装すれば、様々なデータソースへのアクセスが標準化される。サーバーはホストがClaudeかCursorかを気にする必要がない |
| **動的発見(Dynamic Discovery)** | クライアントが実行時に`list_tools`でサーバー機能を照会 — 事前コーディングなしにAIがツールを自動探索・相互作用 |
| **組み合わせ可能性(Composability)** | 複数サーバーのtoolをLLMが自由に組み合わせ、マルチステップワークフローを実行 |

## 3. MCP vs 既存API — 何が違うのか?

| 区分 | 既存APIの直接統合 | MCP |
|---|---|---|
| 接続方式 | サービスごとに個別接続・個別SDK | 単一標準プロトコルで複数ツールにアクセス |
| ツール発見 | 開発者がドキュメントを読み手動でコーディング | AIが実行時に自動探索(`list_tools`) |
| 通信モデル | 一回限りのリクエスト-レスポンス(stateless) | 継続セッションベースの双方向リアルタイム通信 |
| 呼び出し主体 | アプリケーションコードが呼び出しタイミングを決定 | **LLMが対話コンテキストの中で呼び出しの有無・順序・組み合わせを決定** |
| インターフェース仕様 | OpenAPI/Swagger — 人間・コード向け | JSON Schema + 自然言語description — **LLM向け** |
| 統合コスト | M(アプリ)×N(ツール)コネクタ | M+N(ツールごとにサーバー1個) |
| 関係性 | — | **MCPはAPIを代替しない** — サーバー内部では依然としてREST API・DBを呼び出す。MCPはその上のLLMフレンドリーなアダプタ層 |

最後の行が最も重要である。MCPサーバー開発とは、結局「既存のAPI・ライブラリ・計算ロジックを**LLMが理解し呼び出せる形にラップすること**」である。第2部で作るAMQSサーバーも内部的にはyfinance APIとpandasの計算を使いつつ、これをMCP toolとして公開する。

## 4. MCP活用例 — 概念から実践へ

### 例1: ニュース要約とSlack送信
「今朝のニュース3件を要約してSlackのAI newsチャンネルに投稿して」→ AIが検索MCPサーバーでニュースを収集 → 核心を要約 → slack-mcp-serverで指定チャンネルに投稿。**異なる2つのサーバーをLLMが自律的に組み合わせる**ことがポイントである。

### 例2: YouTubeチャンネル分析とNotionレポート
「最近の動画10本を分析してNotionにレポートを作って」→ YouTube AnalyticsのMCPで視聴継続率・離脱地点を分析 → インサイト文書を作成 → notion-mcp-serverでレポートページを生成。

### 例3: 業務自動化サーバーのエコシステム
`slack-mcp-server`(メッセージ送受信)・`notion-mcp-server`(DB管理)・`google-calendar-mcp-server`(スケジュール管理)など — すでに数千の公開サーバーが存在する。

### 例4: クオンツ投資信号サーバー(本文書のテーマ)
「今のレジームを確認して、RISK_ONならTop 10を出して、私のMUの損切りラインも見て」→ AMQS MCPサーバーの3つのtoolをLLMが順次組み合わせる。例1〜3が*他人が作ったサーバーを使う*ことなら、第2部は**このようなサーバーを自分で作る方法**である。

---

# 第2部 — MCPサーバー開発実践: AMQS-AI-Infra Signal Server

## 5. なぜAMQSがMCPサンプルに適しているのか

AMQS-AI-Infraの原文書には既に**Python / LLMの役割分担表**が存在する。この表がそのままMCPサーバーの設計図になり得る。

| AMQS役割分担 | 担当 | MCPマッピング |
|---|---|---|
| 4-Factorモメンタム・損切り・レジーム・Top-N選別 | Python(自動) | **Tools** — LLMが呼び出す決定論的計算 |
| Universe・戦略パラメータ(静的参照) | Python | **Resources** — 読み取り専用コンテキスト |
| Revenue Acceleration・13F・EPS Revision・ナラティブ | LLM(知識・検索) | **Prompts** — クロス検証ワークフローテンプレート |

つまり、「Pythonが技術信号を計算し、LLMがファンダメンタルズを検討する」というAMQSの哲学(「LLMはエクセルであり、オラクルではない」)が、MCPの3大primitive(Tools / Resources / Prompts)に1:1で対応する。決定論的計算はコードに、判断はモデルに置く構造 — これがMCPサーバー設計の定石である。

## 6. 開発者視点でのアーキテクチャ再解釈

第1部のHost / Client / Server構造を開発者の視点で見直してみる。

| 構成要素 | 開発者が実際に触るもの |
|---|---|
| Host | 作らない(既製アプリを使用) |
| Client | 作らない(ホストに内蔵) — プロトコルテスト用にのみ記述 |
| **Server** | **私たちが作るもの** — 本文書のすべて |
| 転送層 | SDKが処理 — transportの種類だけ選択 |

### 6.1 3大Primitive

| Primitive | 制御主体 | 用途 | AMQSサンプルでは |
|---|---|---|---|
| **Tools** | model-controlled(LLMが呼び出しを決定) | 関数実行、副作用の可能性あり | `get_regime`、`get_momentum_score`、`get_top_signals`、`check_stop_loss` |
| **Resources** | application-controlled(ホストが管理) | 読み取り専用データ、URIで識別 | `amqs://universe` |
| **Prompts** | user-controlled(ユーザーが選択) | 再利用可能なプロンプトテンプレート | `cross_validate_ticker` |

### 6.2 Transportの選択

| Transport | 通信方式 | 用途 | 備考 |
|---|---|---|---|
| **stdio** | 標準入出力 | ローカル(Claude Desktop、Cursor) | 最初は必ずこれから。デプロイ・認証不要 |
| **Streamable HTTP** | 単一HTTPエンドポイント | リモートサーバー | 2025-03仕様以降SSEを代替する現行標準 |
| SSE(legacy) | HTTP + Server-Sent Events | リモート(旧型) | deprecated — 新規開発では使用しないこと |

> 初期資料の「stdio(ローカル)またはSSE(リモート)」という記述は旧仕様基準である。現行仕様ではリモートtransportは**Streamable HTTP**に統合された。

### 6.3 SDKの選択

| 基準 | Python(`mcp` + FastMCP) | TypeScript(`@modelcontextprotocol/sdk`) |
|---|---|---|
| クオンツ・データ作業 | pandas / numpy / yfinanceエコシステムに直結 | 別途ブリッジが必要 |
| コード量 | デコレータ3種で完結 | やや冗長 |
| デプロイ | `uv` / `pip` | `npx`ワンコマンドデプロイが有利 |
| 本サンプル | **採用** | — |

クオンツ信号サーバーはデータスタックがPythonにあるため、Python SDKが自然な選択である。`FastMCP`は関数シグネチャとdocstringからtool schemaを自動生成する — docstringがそのままLLMに表示されるtool descriptionになるため、**docstringの品質がtool呼び出しの精度を左右する**。

## 7. プロジェクト構造と環境設定

```
amqs-mcp-server/
├── server.py                            # MCPサーバー本体(単一ファイル)
├── requirements.txt
├── claude_desktop_config.example.json   # Claude Desktop接続の設定例
└── MCP_Server_Getting_Started.md        # 本文書
```

```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 即時デモ(ネットワーク・APIキー不要、合成価格)
AMQS_MOCK=1 python server.py

# 実データ(yfinance)
python server.py
```

`AMQS_MOCK=1`は再現可能な合成価格で動作するオフラインモードである。Tossダッシュボードのモックモードと同じ考え方 — キーなしでロジックを実演できることが、文書とCIを「生きた文書」にする条件である。

## 8. サーバー実装の段階別解剖

`server.py`の全文は同梱ファイルを参照。ここでは核心パターンのみ取り上げる。

### Step 1 — サーバーインスタンスとinstructions

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "amqs-ai-infra",
    instructions=(
        "AMQS-AI-Infra quant strategy signal server. ... "
        "All output is a research reference signal, not investment advice."
    ),
)
```

`instructions`はクライアントがサーバー全体の性格を理解するためのシステムヒントである。金融ツールであれば**ディスクレーマーをサーバーレベルに埋め込むこと**が、各tool出力に繰り返すよりも安全である(本サンプルは両方行う)。

### Step 2 — 層の分離: データ / 戦略 / MCP

```
データ層     get_prices()          yfinanceまたは合成データ + キャッシュ
戦略層       composite_scores()    4-Factor z-score → 0〜100スコア(MCPと無関係な純関数)
MCP層        @mcp.tool()           戦略関数を薄くラップしJSONにシリアライズ
```

戦略ロジックをMCPデコレータから分離すると、(1)ユニットテストが容易になり、(2)同じロジックをCLI・バックテスト・Signal Botで再利用できる。元リポジトリの`script/strategy.py`(エンジン)/`script/amqs_ai_infra.py`(CLI)の分離と同じ原理である。これが3章で述べた「MCPはAPIのアダプタ層」のコード実装である。

### Step 3 — Tool定義: docstring = LLM向け仕様書

```python
@mcp.tool()
def get_top_signals(top_n: int = 10) -> str:
    """AMQS Top-Nの買い候補を返す。サブテーマごとに最大4種のキャップを適用し、
    GPUなど単一テーマへの過集中を防止する。マクロレジームがRISK_ONでない場合は警告を含む。"""
```

チェックリスト

| 項目 | 理由 |
|---|---|
| 型ヒント必須(`top_n: int = 10`) | JSON Schema自動生成の根拠 |
| docstringに動作・制約・前提を明記 | LLMがこのtoolをいつ使うか判断する唯一の根拠 |
| 戻り値は構造化されたJSON文字列 | LLMのパース安定性を確保(`ensure_ascii=False`で非ASCII文字を保存) |
| 入力検証+エラーをJSONで返す | universe外のticker要求時に例外の代わりに`{"error": ..., "universe": [...]}` — LLMが自ら復旧可能 |
| 上限クランプ(`min(top_n, len(UNIVERSE))`) | LLMが`top_n=999`を入れても安全 |

### Step 4 — ドメインルールをtool内部で強制

サブテーマキャップ(テーマごとに最大4種)は、LLMに「守ってください」と依頼するものではなく、**コードが強制する**:

```python
for t, row in df.iterrows():
    theme = row["subtheme"]
    if theme_count.get(theme, 0) >= SUBTHEME_CAP:
        continue          # GPU偏重をコードレベルで遮断
```

検証結果(Top-10、mock): `compute 4 / server 3 / software 2 / network 1` — キャップが正常に動作。リスクルールはプロンプトではなくコードに置く。これが「LLMはエクセル」原則のMCP版である。

### Step 5 — ResourceとPrompt

```python
@mcp.resource("amqs://universe")     # URIスキームは自由 — サーバー内の名前空間の慣例
def universe_resource() -> str: ...

@mcp.prompt()
def cross_validate_ticker(ticker: str) -> str: ...
```

Promptは「Pythonができないこと(売上加速・13F・EPS Revision)をLLMに実行させる標準指示文」をサーバーが配布するチャネルである。元リポジトリの`prompts/AMQS_AI_Infra_kr.MD`をコピー&ペーストしていたワークフローが、MCPではホストUIからのワンクリック呼び出しに変わる。

## 9. テスト — 3段階検証パイプライン

| 段階 | 方法 | 検証対象 |
|---|---|---|
| 1. ユニット | モジュールをimportして関数を直接呼び出す | 戦略ロジック(MCPとは無関係) |
| 2. プロトコル | MCPクライアントによるstdioハンドシェイク | initialize → list_tools → call_tool |
| 3. インタラクティブ | MCP Inspector | 実際のホスト視点でのUI検証 |

### 9.1 ユニットテスト

```python
import os; os.environ["AMQS_MOCK"] = "1"
import server
print(server.get_top_signals(10))   # デコレータを経ても関数として直接呼び出し可能
```

### 9.2 プロトコルテスト(実行検証済み)

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

params = StdioServerParameters(command="python", args=["server.py"],
                               env={"AMQS_MOCK": "1"})
async with stdio_client(params) as (r, w):
    async with ClientSession(r, w) as s:
        await s.initialize()
        tools = await s.list_tools()      # 4つのtoolを確認
        out = await s.call_tool("get_regime", {})
```

実行結果

```
TOOLS: ['get_regime', 'get_momentum_score', 'get_top_signals', 'check_stop_loss']
RESOURCES: ['amqs://universe']
PROMPTS: ['cross_validate_ticker']
CALL get_regime OK: {"regime": "RISK_ON", ...}
```

このテストが第1部第2章の「動的発見(Dynamic Discovery)」特徴の実証である — クライアントはサーバーコードを一切知らずに、実行時の照会だけで機能一覧とschemaを取得する。

### 9.3 MCP Inspector

```bash
npx @modelcontextprotocol/inspector python server.py
```

ブラウザUIでtool一覧・schema・呼び出し結果を対話的に確認する。Claude Desktop接続前の必須関門。

> よくある落とし穴: stdioサーバーで`print()`デバッグを禁止。stdoutはJSON-RPCチャネルであるため、ログは必ず`logging`(stderr)に送ること。これがstdioサーバー誤動作の原因第1位である。

## 10. Claude Desktopへの接続

`claude_desktop_config.json`の位置:

| OS | パス |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "amqs-ai-infra": {
      "command": "python",
      "args": ["/ABSOLUTE/PATH/TO/amqs-mcp-server/server.py"],
      "env": { "AMQS_MOCK": "0" }
    }
  }
}
```

注意事項: (1)パスは必ず絶対パス、(2)venv使用時は`command`をvenv内のpythonの絶対パスに、(3)修正後はClaude Desktopを完全に再起動すること。接続すると次のような対話が可能になる:

```
ユーザー: 今のレジームを確認して、RISK_ONならTop 10を出してMUが何位か教えて。
         あとMUの平均取得単価が200ドルだから損切りラインに達したかも見て。

Claude: [get_regime] → RISK_ON
        [get_top_signals(10)] → MU 3位、tier SATELLITE
        [check_stop_loss("MU", 200.0)] → pnl -17.95%, action EXIT
        → 「損切りライン-12%を下回りました。AMQSルール上EXIT信号です...」
```

第1部第4章の「ニュース要約→Slack送信」の例と同様に、ユーザーは自然言語で話し、LLMがtoolの組み合わせを自ら決定する。このtool orchestrationがMCPの実質的な価値である。

## 11. リモートデプロイ(Streamable HTTP)

stdioからリモートへの切り替えは最後の1行変更のみで完了する:

```python
mcp.run(transport="streamable-http")   # デフォルト http://localhost:8000/mcp
```

| 項目 | stdio | Streamable HTTP |
|---|---|---|
| 利用者 | 本人1人 | チーム・外部公開 |
| 認証 | 不要(ローカルプロセス) | **OAuth 2.1必須**(仕様要件) |
| デプロイ | — | Docker + reverse proxy、またはCloudflare Workersなど |
| 状態管理 | プロセス=セッション | セッションIDベース、サーバースケールアウトを考慮 |

Signal Botのウェブビュー(`python -m http.server 8011`)をチームに共有していたのと同様に、MCPサーバーもリモート化すればチーム全員のClaudeが同一のAMQS信号ソースを使えるようになる — ただし認証なしの公開は絶対に禁止(次節参照)。

## 12. セキュリティ考慮事項(CTI視点)

MCPは新たな攻撃対象領域である。サーバーを作った瞬間、防御者視点も同時に持つ必要がある。

| 脅威 | 内容 | 本サンプルの対応/推奨 |
|---|---|---|
| Tool Poisoning | 悪意あるサーバーがtool descriptionに隠れた指示を埋め込み、LLMを操作 | **サーバー作成者**として: descriptionを機能説明に限定。**利用者**として: サードパーティサーバーのdescriptionを監査後にインストール |
| Prompt Injection(間接的) | toolが返した外部データ(ニュース・Web)内の指示文をLLMが実行 | 戻り値を構造化JSONに限定し、自由テキストを最小化 |
| Confused Deputy | LLMがユーザーの意図を超えるtool呼び出しを実行 | 副作用のあるtool(注文実行など)は作らない — 本サーバーは**read-only信号専用**。実取引連携時はhuman-in-the-loopの承認を必須化 |
| Secrets露出 | configの`env`にAPIキーを平文保存 | KIS APIなどの連携時はOSキーチェーン/シークレットマネージャーを使用。`.gitignore`+pre-commitシークレットスキャン(LAON VaultGuard系ツール) |
| Rug Pull | 信頼を得た後、サーバーのアップデートでtoolの動作が変更される | バージョン固定インストール、変更差分のレビュー |
| 無認証のリモート公開 | Streamable HTTPサーバーの公開時に無断使用・データ漏洩 | OAuth 2.1+レート制限、内部網は最低限mTLS |

金融信号サーバー特有のリスクの一つ: **LLMがtool出力を過剰解釈し確定的な取引助言に変換すること**。対策は三重である — サーバー`instructions`にディスクレーマー、各tool出力に`disclaimer`フィールド、promptテンプレート末尾に告知を強制。

## 13. 拡張ロードマップ

| 段階 | 内容 | 難易度 |
|---|---|---|
| 1 | `backtest.py`連携 — `run_backtest(start, end)` toolを追加 | 低 |
| 2 | Signal Botの`signals.json`をResourceとして公開(`amqs://signals/latest`) | 低 |
| 3 | ARDS-Xレジーム分類器を別のMCPサーバーへ — AMQS/ARDSのハンドオフをLLMがオーケストレーション | 中 |
| 4 | Toss Open API / KIS API連携 — ただし実注文toolは承認ゲート必須 | 高 |
| 5 | クリプトニュースパイプライン(web3paper)連携 — ニュース収集・要約toolでCTI/投資を統合 | 中 |
| 6 | Streamable HTTP + OAuthによるチーム展開、多言語(KR/EN/ZH/JP)のtool description | 中 |

## 14. まとめ

**概念(第1部)**
1. MCPはLLMと外部ツールのM×N統合問題をM+Nに縮小するオープン標準 — 「AIのUSB-Cポート」。
2. Host / Client / Server構造で開発者が作るのはServerだけである。
3. MCPはAPIを代替しない — 既存API上に載る**LLMフレンドリーなアダプタ層**であり、核心的な違いは動的発見とLLM主導の呼び出しである。

**開発(第2部)**
4. MCPサーバー開発とは、**決定論的計算をTools、静的データをResources、LLMワークフローをPrompts**として公開することである。
5. AMQSのPython/LLM役割分担表がそのままMCP設計図になる — リスクルール(サブテーマキャップ、損切り)はプロンプトではなくコードに強制する。
6. 開発順序: FastMCP + stdio → ユニットテスト → プロトコルテスト → Inspector → Claude Desktop → (必要に応じて)Streamable HTTP + OAuth。
7. サーバーを作る瞬間、攻撃対象領域も作られる — Tool Poisoning、Injection、Secretsを設計段階から考慮する。

## 参考リンク

- MCP公式仕様・文書: https://modelcontextprotocol.io
- Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra原文書: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

---

*本文書とコードは研究・教育目的であり、投資勧誘ではない。AMQSは高リスクなクオンツ戦略であり、元本損失の可能性がある。*
*License: MIT — "Built on AMQS by Dennis Kim, vibe-investing repository."*
