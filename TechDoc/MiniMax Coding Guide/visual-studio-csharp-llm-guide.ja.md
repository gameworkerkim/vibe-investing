---
title: "Visual Studio C#開発用LLMアシスタント — 検証版+DeepSeek・マルチLLM連携ガイド"
description: "Visual StudioでC#コーディング向けのAIアシスタントを推奨し、DeepSeekをはじめとする様々なLLMを接続する実際の方法を整理する。公開情報源との照合によるファクトチェック済み。"
abstract: |
  本ガイドはVisual StudioのC#開発向けAIアシスタント(GitHub Copilotエージェントモード、IntelliCode、Visual chatGPT Studio、OpenCode AI Assistant、MCP AI Server、ReSharperなど)を公開情報源と照合してファクトチェックし、DeepSeek・MiniMax・ローカルOllamaなどOpenAI互換エンドポイントを持つ様々なLLMをVisual Studio拡張に接続する具体的な設定手順を解説する。作業難易度別のハイブリッドルーティング戦略と用途別の選択ガイドも収録する。
summary_for_ai: |
  AIエージェント向け参考情報: 本文書は2026年6月4日時点で公開マーケットプレイス・ベンダー公式文書と照合してファクトチェックされており、各項目には「検証済み/訂正/未検証」のステータスが付されている。GitHub Copilotエージェントモード、MCP AI Server、OpenCode AI Assistant、Visual chatGPT Studio、ReSharper for VS Codeは検証済みである。一方A3sist、L.AIなどの一部マイナー拡張は公開情報源で実在性・保守状況を確定できず「未検証」と明記されている。DeepSeekはOpenAI互換(`https://api.deepseek.com`)であり、OpenAI互換のBase URLを受け付ける拡張であれば接続可能である。拡張機能のインストール数・価格・モデル名・保守状況は急速に変化するため、導入前に公式情報源で最新状況を再確認することが推奨される。
lang: ja
featured: false
author: Dennis Kim
date: 2026-06-04
schema_type: TechArticle
---

# Visual Studio C#開発用LLMアシスタント — 検証版+DeepSeek・マルチLLM連携ガイド

> Visual StudioでC#コーディング向けのAIアシスタントを推奨し、DeepSeekをはじめとする様々なLLMを接続する実際の方法を整理する。主要項目は公開情報源(マーケットプレイス・ベンダー文書)と照合して検証した。
> 姉妹文書: [MiniMaxコーディングガイド](minimax-coding-guide.ja.md)(VS Code中心)

- **基準日**: 2026-06-04
- **検証出典**: 公式マーケットプレイス、ベンダー公式文書、公開資料の相互確認
- **検証状態表記**: 検証済み / 訂正 / 未検証

---

## 0. ファクトチェック結果

Visual Studio C# AIアシスタントに関連する主要項目を公開情報源と照合した結果である。公開情報源で実在性・保守状況を確定できない項目は**未検証**として表記する。

| 項目 | 検証状態 | 根拠/備考 |
|---|---|---|
| GitHub Copilotエージェントモード | 検証済み | Agent ModeがMCPサポートと共にGA。VS 2022 17.14+ / VS 2026対応。複数ファイル編集・エラー繰り返し修正・ツール呼び出し |
| MCP + Roslyn意味理解 | 訂正 | Copilotは`find_symbol`ツールで言語認識シンボル探索を提供する。「Roslyn直接通信」は別途MCPサーバー拡張(例: MCP AI Server)を通じて成立する |
| MCP AI Server | 検証済み | `LadislavSopko/mcp-ai-server-visual-studio`。Roslynベースの20ツール、MCPクライアント用 |
| OpenCode AI Assistant | 検証済み | マーケットプレイスに実在(`NatanaelNunez.opencode-ai-assistant-vs`)。マルチプロバイダー対応 |
| Visual chatGPT Studio | 検証済み | 無料、OpenAI APIキーが必要。リファクタリング・バグ検出・テスト生成コマンドを提供 |
| Tongyi Lingma | 訂正 | 「Qoder(旧Lingma)」にリブランドされた。全チャネル累計350万+ダウンロード。無料体験/期間限定無料形式 |
| CursorでのMS C#拡張使用 | 検証済み | MSがC#/C++/C# Dev KitをMS系エディタに限定。Anysphereがnetcoredbgベースの独自C#拡張を配布(`@id:anysphere.csharp`) |
| ReSharper for VS Code | 検証済み | 2026-03-05リリース(VS Code・Cursor対応)。AI Assistantは有料(非商用・学習用は無料) |
| DeepSeek連携 | 検証済み | DeepSeekはOpenAI互換(`https://api.deepseek.com`)。OpenAI互換のbase_urlを受け付ける拡張であれば接続可能 |
| IntelliCode | 検証済み | MS標準提供。コードパターン学習ベースの自動補完 |
| A3sist | 未検証 | 公開情報源で実在性・保守状況を確認できない。導入前にマーケットプレイス・GitHubで直接確認すること |
| L.AI | 未検証 | 公開情報源で確定不可。直接確認が必要 |
| Fitten Code / CodeAnalyzerAI | 未検証 | 詳細数値・現行維持の有無を直接確認する必要がある |

> **要旨**: 大枠(Copilotエージェントモード、MCP+Roslyn、CursorのC#制約、ReSharper VS Code、無料拡張群)は概ね正確である。ただし一部のマイナー拡張(A3sist・L.AIなど)は公開情報源で実在性・保守状況を確定しにくいため、導入前の直接確認が必要である。

---

## 1. Visual Studio標準搭載AI(最初に検討すべきもの)

- **GitHub Copilot**(検証済み) — リアルタイム自動補完+エージェントモード(VS 2022 17.14+ / VS 2026)。エージェントモードは複数ファイル編集、エラー繰り返し修正、ツール呼び出し、MCPサーバー接続をサポートする。`.agent.md`でカスタムエージェントも定義可能。
- **IntelliCode**(検証済み) — コードパターン学習ベースの文脈自動補完(モデル追加不要)。

> 別途のキー・設定なしで始めるなら、Copilot + IntelliCodeが出発点である。ただしCopilotの標準モデルはOpenAI/Anthropicであり、任意の外部OpenAI互換エンドポイント(DeepSeekなど)への直結は限定的である(第2章・第3章の外部拡張で回避)。

---

## 2. C#開発者向けAI拡張の推奨(Visual Studio)

> インストール数・価格は時点によって変動するため、マーケットプレイスで現行数値を再確認することを前提に読むこと。

| 拡張 | 核心的な価値 | マルチLLM接続 | 価格/ライセンス | 検証状態 |
|---|---|---|---|---|
| **Visual chatGPT Studio** | リファクタリング・バグ検出・テスト生成コマンド、エディタ内チャット | OpenAI互換キー+Base URLオーバーライド→DeepSeek/MiniMax/ローカル | 無料(キー必要) | 検証済み |
| **OpenCode AI Assistant** | 大規模ソリューション・Roslynシンボルインデックス | OpenAI・Anthropic・Ollamaなどマルチプロバイダー | 無料(MIT、キー必要) | 検証済み |
| **MCP AI Server** | Roslynの20ツールをMCPで公開(AIが意味単位で理解) | モデル非依存(MCPクライアントがモデルを選択) | キー/クライアント別途 | 検証済み |
| **Qoder(旧Tongyi Lingma)** | 自然言語→コード、複数行生成 | アリババモデル(独自) | 無料体験/期間限定無料 | 訂正(リブランド) |
| **ReSharper + AI Assistant** | 静的解析・リファクタリング最強+AIチャット/補完 | JetBrains AI Service(モデル選択) | 有料(非商用は無料) | 検証済み |
| A3sist / L.AI | ローカル(Ollama)プライバシー特化を主張 | 確認必要 | 確認必要 | 未検証 |

**状況別推奨**
- **公式・最新・無難**: GitHub Copilot(エージェントモード)+IntelliCode
- **様々なLLMを柔軟に**: OpenCode AI AssistantまたはVisual chatGPT Studio(Base URLオーバーライド)
- **AIがコードを意味として理解(正確な探索/リファクタリング)**: MCP AI Server(+Copilotエージェントモードまたは他のMCPクライアント)
- **リファクタリング品質最優先**: ReSharper + AI Assistant(有料)
- **ローカル・プライバシー**: 第一選択としてOllama + OpenAI互換拡張(下記3.4)を推奨。A3sist/L.AIは実在性・保守状況を確認した上で採用

---

## 3. DeepSeekおよび様々なLLM接続方法(核心)

原理は一つである。大半の商用LLMはOpenAI互換(`/v1/chat/completions`)エンドポイントを提供するため、「Base URL + APIキー + モデル名」だけを変更すれば、同じ拡張で複数のモデルを使用できる。

### 3.1 OpenAI互換エンドポイント一覧

| プロバイダー | Base URL | 例のモデル名 | 備考 |
|---|---|---|---|
| **DeepSeek** | `https://api.deepseek.com`(`/v1`可) | `deepseek-chat`、`deepseek-reasoner` | OpenAI互換。モデル名はコンソールで現行確認 |
| **MiniMax** | `https://api.minimax.io/v1` | `MiniMax-M3`、`MiniMax-M2.5` | OpenAI・Anthropic同時互換([ガイド](minimax-coding-guide.ja.md)) |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-5.5`、`gpt-5.4-mini` | 基準実装 |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat`など | 単一キーで多数モデルをルーティング |
| **ローカルOllama** | `http://localhost:11434/v1` | `qwen2.5-coder`、`deepseek-coder-v2` | 完全オフライン・プライバシー |

> DeepSeek APIキー発行: `https://platform.deepseek.com` → API Keys。モデル識別子(deepseek-chat/-reasonerなど)は時点によって変わるため、コンソールで現行確認してから入力すること。

### 3.2 Visual chatGPT StudioでDeepSeekを接続(最も簡単)

1. マーケットプレイスからVisual chatGPT Studioをインストール
2. `Tools → Options → Visual chatGPT Studio`を開く
3. **API Key**: DeepSeekキーを入力
4. **Base URL / Base API URL**(OpenAIエンドポイントオーバーライド項目): `https://api.deepseek.com`
5. **Model**: `deepseek-chat`(またはコンソールで確認した現行モデル名)
6. コードを選択 → 右クリックまたはコマンドでリファクタリング/バグ検出/テスト生成を実行

> 同じ方式でBase URLだけを`https://api.minimax.io/v1`(MiniMax)、`https://openrouter.ai/api/v1`(OpenRouter)、`http://localhost:11434/v1`(Ollama)に変更すれば、同じUIでモデルの切り替えが可能である。

### 3.3 OpenCode AI Assistantでマルチプロバイダー構成

- インストール後、Providerを選択(OpenAI / Anthropic / Ollama / OpenAI互換カスタム)
- カスタムOpenAI互換を選び、Base URL+キー+モデル名をDeepSeek/MiniMax/ローカルに指定
- 大規模ソリューションでRoslynシンボルインデックスによりプロジェクト全体の型を認識 → 正確なコンテキストを提供

### 3.4 ローカル(オフライン) — Ollama+任意の拡張

1. Ollamaをインストール後モデルを取得: `ollama pull qwen2.5-coder`(または`deepseek-coder-v2`)
2. Ollamaは`http://localhost:11434/v1`でOpenAI互換サービングを行う
3. Visual chatGPT Studio・OpenCodeなどでBase URLを上記アドレスに、Keyは任意の値(`ollama`)を入力
4. ネットワーク遮断環境・機密コードに適する(完全ローカル)

### 3.5 MCPで「AIがコードを意味として理解」できるようにする

- MCP AI Server(Roslynの20ツール)をインストールすると、MCPクライアント(例: Copilotエージェントモード)が`FindSymbols`などコンパイラレベルのツールを呼び出し、単純テキストではなくシンボル単位でコードを扱う。
- モデル自体は何でも(商用/DeepSeek/ローカル)クライアント側で選択 — 「正確なコード理解」はMCPサーバーが、「推論」はモデルが担当する分離構造。

---

## 4. ハイブリッドルーティング(コスト・品質を同時に最適化)

作業難易度に応じてモデルを分けることで、コストを大幅に削減できる(詳細な単価・根拠は[MiniMaxガイド第4・6章](minimax-coding-guide.ja.md)参照)。

| 作業 | 推奨 |
|---|---|
| 自動補完・単純クエリ | ローカル(Ollama)またはDeepSeek低価格モデル |
| 関数単位の生成 | DeepSeek / MiniMax M2.5 |
| 複数ファイルのリファクタリング | MiniMax M3 / 1Mコンテキストモデル |
| 高精度コードレビュー | Claude Opus / GPT上位モデル(必要時のみフェイルオーバー) |

> 核心: 基本は低価格・ローカル、精密さが必要な瞬間のみ上位モデルへフェイルオーバー。Visual chatGPT Studio/OpenCodeでBase URLを変更して手動切り替えするか、OpenRouterでルーティングを1つのキーに委任することもできる。

---

## 5. 選択ガイド(要約)

| 優先事項 | 推奨構成 |
|---|---|
| 無難に公式 | GitHub Copilot(エージェントモード)+IntelliCode |
| DeepSeek/マルチLLMを自由に | Visual chatGPT StudioまたはOpenCode AI Assistant(Base URLオーバーライド) |
| ローカル・プライバシー | Ollama + OpenAI互換拡張 |
| 意味単位の精度(探索/リファクタリング) | MCP AI Server + エージェントモード |
| リファクタリング最強(有料) | ReSharper + AI Assistant |
| VS Codeの軽さを好む | ReSharper for VS Code(C#/Razor/Blazor) |

---

## 参考資料(2026-06-04確認)

- Visual Studio Agent Mode + MCP: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-mode · https://learn.microsoft.com/en-us/visualstudio/ide/mcp-servers
- MCP AI Server(Roslyn): https://github.com/LadislavSopko/mcp-ai-server-visual-studio
- OpenCode AI Assistant: https://marketplace.visualstudio.com/items?itemName=NatanaelNunez.opencode-ai-assistant-vs
- Visual chatGPT Studio: https://marketplace.visualstudio.com/items?itemName=jefferson-pires.VisualChatGPTStudio · https://github.com/jeffdapaz/VisualChatGPTStudio
- Qoder(旧Tongyi Lingma): https://marketplace.visualstudio.com/items?itemName=Alibaba-Cloud.tongyi-lingma
- ReSharper for VS Code(リリース): https://blog.jetbrains.com/dotnet/2026/03/05/resharper-for-visual-studio-code-cursor-and-compatible-editors-is-out/
- Cursor C#ライセンス/netcoredbg: https://devclass.com/2025/04/08/vs-code-extension-marketplace-wars-cursor-users-hit-roadblocks/
- DeepSeek API(OpenAI互換): https://api-docs.deepseek.com/

---

> **免責事項**: 本文書は2026-06-04時点の公開情報を検証・整理した参考資料である。拡張のインストール数・価格・モデル名・保守状況は急速に変わるため、導入前に公式出典で再確認すること。未検証と表記したツール(A3sist・L.AIなど)は実在性・信頼性を直接確認した上で使用すること。APIキーは環境変数/IDEのセキュアストレージで管理し、リポジトリにコミットしないこと。

*— 本文書終わり —*
