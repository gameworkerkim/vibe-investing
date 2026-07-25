---
title: "Astryx スタートガイド"
description: "2026年6月18日にMITライセンスでオープンソース公開されたMetaの「Agent-Ready」統合デザインシステム"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Astryx
  - Meta デザインシステム
  - React StyleX
  - agent-ready UI
  - デザイントークン
tags:
  - UI
  - デザインシステム
  - React
  - Meta
  - オープンソース
---

# Astryx スタートガイド

> Metaが2026年6月18日にMITライセンスでオープンソース公開した「Agent-Ready」統合デザインシステム
> 公式サイト: [astryx.atmeta.com](https://astryx.atmeta.com) | GitHub: [facebook/astryx](https://github.com/facebook/astryx) | 現在Beta(v0.1.x)

一言まとめ: Metaが自社で使用していたデザインシステムをオープンソースとして公開した。単純なUIライブラリではなく、コンポーネント+テーマ+テンプレート+CLI+MCPサーバーへと拡張し、小規模スタートアップがデザイナーなしでも一貫したUXを実現できるようにした。ひと言でいうと素晴らしい。

---

## 1. Astryxとは何か?

AstryxはMeta内部で8年間成長し、13,000以上の内部アプリを動かしてきた社内最大のデザインシステムをReact + StyleXベースで再構築して公開したものである。単純なUIライブラリではなく、**コンポーネント+テーマ+テンプレート+CLI+MCPサーバー**が一つのシステムに統合された形であり、最初から人間とAIコーディングエージェントが同じ方式・同じレファレンスでUIを作るように設計されている。

| 項目 | 内容 |
|---|---|
| 公開日 | 2026年6月18日(Beta) |
| ライセンス | MIT |
| 基盤技術 | React、StyleX(Metaのコンパイル時CSSエンジン)、TypeScript |
| コンポーネント数 | 150以上(アクセシビリティ・ダークモード標準サポート) |
| 公開テーマ | 7種のnpmパッケージ(neutral、butter、chocolate、matcha、stone、gothic、y2k) |
| 検証履歴 | Meta内部8年、13,000以上のアプリ、更新の約半分は内部ビルダーコミュニティの貢献 |
| ビルド要件 | なし — pre-built CSSを提供、PostCSS/Babelプラグイン不要 |

---

## 2. 主な特徴

### 2.1 Agent-Ready / AI-fluent設計

- すべてのコンポーネントが同じnaming・prop・composition規則に従うため、いくつか学習すれば人間もAIも残りのコンポーネントの動作を予測できる
- CLIがself-describing JSON manifestを返す — AIエージェントがhelpテキストをスクレイピングせず、構造化されたコマンド体系を直接読み取る
- **MCP(Model Context Protocol)サーバー**を内蔵 — Claude、Cursor、Copilotなどのエージェントがコンポーネントのapiをプログラム的に照会・スキャフォールディング可能
- リポジトリに`CLAUDE.md`が含まれ、`npx astryx init`実行時にAIエージェント用ドキュメントがプロジェクトに自動セットアップされる

### 2.2 ベンダー依存のない完全なカスタマイズ

| カスタマイズ層 | 方式 |
|---|---|
| Design Token | テーマ=CSSカスタムプロパティのオーバーライド集合。色・タイポグラフィ・radius・motionをトークンレベルで変更すると全コンポーネントが再スタイル化される(コンポーネントコードの変更なし) |
| Styling Override | 内部はStyleXだが消費者には非可視。`className`でTailwind、CSS Modules、通常のCSSどの方式でもオーバーライド可能 |
| Swizzle(Eject) | `npx astryx swizzle Button` — コンポーネント全体のソースをプロジェクトに抽出して直接所有・修正。カスタマイズしたものだけを所有し、残りはアップストリームの更新を維持 |
| Open Internals | すべてのprimitiveがexportされ、どのレベルでも組み合わせ可能。閉じたtop-level APIの裏に閉じ込められていない |

### 2.3 3層アーキテクチャ

| Layer | 構成要素 | 役割 |
|---|---|---|
| Foundations | Typography、Color、Layout、Accessibility | 視覚的一貫性とアクセシビリティの基盤 |
| Components | 150以上のTypeScriptコンポーネント | 再利用可能なUIビルディングブロック(Button、Modal、DataTable、Form Wizardなど) |
| Patterns / Templates | Table Page、Detail Page、Form Wizard、Navigation、Data Entry Flow | 検証済みのページ単位の設計ソリューション — CLIで全ソースをスキャフォールディング |

### 2.4 その他の技術的特徴

- **Context-aware spacing compensation**: コンポーネント入れ子時に発生するdouble padding問題をシステムが自動補正 — 他のデザインシステムとの主要な差別化点
- **Guidance over enforcement**: デザインに関する意見はドキュメントと例にのみ存在。値を渡すとコンポーネントはそのままレンダリングされる(ガードレールが開発者と争わない)
- デプロイ方式は2種類: (1) pre-built stylesheet importのみで使用、(2) StyleXソースビルド(`@astryxdesign/build`)

---

## 3. インストールと初期設定

### 3.1 パッケージインストール

```bash
# npm
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli

# pnpm
pnpm add @astryxdesign/core @astryxdesign/theme-neutral
pnpm add -D @astryxdesign/cli
```

CLIを安定して使用するには`package.json`にスクリプト登録を推奨する(AIエージェントや新規開発者がCLIを呼び出す際のパスエラーを防止):

```json
"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

### 3.2 CSS設定(Next.js + Tailwind基準 — 最もシンプルな方法)

ビルドプラグインなしでpre-built CSSがTailwindと共存する。

```css
/* src/app/globals.css */
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
@import '@astryxdesign/core/tailwind-theme.css';
@import 'tailwindcss/utilities.css' layer(utilities);
```

`tailwind-theme.css`はXDSトークンをTailwind utilityにブリッジする:

| Tailwind class | XDS token |
|---|---|
| `text-primary` / `text-secondary` | `--color-text-primary` / `--color-text-secondary` |
| `bg-surface` / `bg-card` / `bg-body` | `--color-background-*` |
| `rounded-sm` / `md` / `lg` | `--radius-inner` / `element` / `container` |
| `shadow-sm` / `md` / `lg` | `--shadow-low` / `med` / `high` |

### 3.3 Theme Provider設定

```tsx
// src/app/providers.tsx
'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
```

```tsx
// src/app/layout.tsx
import './globals.css';
import {Providers} from './providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3.4 最初のコンポーネント使用

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello XDS" variant="primary" />;
}
```

コンポーネントはper-path import(`@astryxdesign/core/Button`)方式であり、`Button`はchildrenの代わりに`label` propを受け取るなど、システム全体が一貫したprop規則に従う。Vite使用時も同じCSS import + Provider構成でよく、別途のビルドプラグインは不要である。

---

## 4. 使用例

### 4.1 CLIの活用

```bash
npx astryx --help                        # 全コマンド一覧
npx astryx init                          # プロジェクト初期化(AIエージェント用ドキュメント自動セットアップ)
npx astryx component Button              # コンポーネント全ドキュメント + 関連blockテンプレート
npx astryx template --list               # ページ/blockテンプレート全リスト
npx astryx template dashboard            # ダッシュボードページ全ソース生成
npx astryx template settings --skeleton  # レイアウトスケルトン(空間注釈付き)
npx astryx docs                          # レファレンスドキュメント(原則、トークン、テーマ、スタイリング)
npx astryx docs tokens                   # spacing/color/radius/typographyトークンレファレンス
npx astryx docs theme                    # テーマガイド(Theme、defineTheme、light/dark)
npx astryx theme build                   # プロダクション用テーマCSSビルド
npx astryx swizzle Button                # コンポーネントソースのeject
npx astryx upgrade --apply               # バージョン間マイグレーションcodemod実行
npx astryx gap-report                    # 欠落機能レポート
```

コンポーネントドキュメントはCLIなしでもcoreパッケージから直接照会できる:

```bash
node node_modules/@astryxdesign/core/docs.mjs Button          # 特定コンポーネントの全ドキュメント
node node_modules/@astryxdesign/core/docs.mjs --list --brief  # 全コンポーネントの要約リスト
```

### 4.2 Swizzleワークフロー

```bash
# 1. 実際のコンポーネントソースを自分のリポジトリに抽出
npx astryx swizzle Button
```

```tsx
// 2. パッケージの代わりにローカルコピーをimport
import {Button} from './components/Button';
```

Ejectしたソースは自由に修正可能であり、カスタマイズしなかった残りのコンポーネントは継続してパッケージの更新を受け取る。

### 4.3 ページテンプレートで素早く開始

テンプレートはcontent-only構造であり、`XDSLayout`にheader/content/panelスロットを組み合わせたダッシュボード・設定・フォーム・詳細ページパターンを提供する。グローバルナビゲーションは`XDSAppShell`、`XDSTopNav`、`XDSSideNav`でラップして追加する。

```bash
npx astryx template dashboard   # → ダッシュボードページの全ソースがプロジェクトに生成される
```

### 4.4 AIエージェント連携(MCP)

`npx astryx init`でプロジェクトを初期化するとAIエージェント用ドキュメントが設定され、MCPサーバーを通じてClaude Code・Cursorなどがコンポーネントapi・トークン・テンプレートを構造化された形で直接照会する。エージェントが任意のCSSラッパーを作り出す代わりに、システムのmachine-readable manifestを基準にブランドガイドラインに合致するUIを生成するため、AI生成コードのスタイル断片化とUIデバッグ時間が大幅に減少する。

---

## 5. スタートアップのための活用方法

### 5.1 なぜスタートアップに適しているのか

| スタートアップの課題 | Astryxの解決策 |
|---|---|
| デザイナー不在/デザインリソース不足 | Meta 8年検証済みコンポーネント + 7種テーマ → トークンだけ変えてブランド化。アクセシビリティ・ダークモードが標準搭載で別途投資不要 |
| 「ビッグテックのシステム導入=他社のブランドに見える」 | テーマ=CSS変数のオーバーライドなので、フォーク・ラッピングなしで完全に自社ブランドに変形可能 |
| copy/pasteコンポーネント集の保守負債 | アップストリームの修正・アップグレード経路(`astryx upgrade --apply` codemod)を維持。swizzleしたものだけを直接所有 |
| AIコーディングツール依存度が高い小規模チーム | エージェントがMCP/CLIでシステムを直接読み取るため、vibe codingの結果物の一貫性が構造的に保証される |
| ライセンスコスト | MIT — 商用製品への無制限無料使用 |

### 5.2 段階別導入ロードマップ

**Phase 1 — MVP(Day 1〜7)**

1. `npm install` + CSS import + `<Theme>` Provider — ビルド設定なしで即時起動
2. `npx astryx template --list`で製品タイプに合ったテンプレートを選択(dashboard、settings、formなど)
3. 基本テーマ(neutral)をそのまま使用し、製品ロジックに集中 — UIは「80%完成」状態から出発

**Phase 2 — ブランド化(Week 2〜4)**

1. `npx astryx docs tokens`でトークン構造を把握
2. ブランドの色・タイポグラフィ・radiusをCSSカスタムプロパティでオーバーライドした自社テーマを定義(`defineTheme`)
3. `npx astryx theme build`でプロダクションテーマCSSを生成 — コンポーネントコードは一行も変更しない

**Phase 3 — 差別化(Month 2以降)**

1. 競争力が必要なコア画面のコンポーネントのみ`swizzle`でejectして深度カスタマイズ
2. 残りはアップストリーム追従を維持 → 保守負債を最小化
3. `astryx gap-report`で必要な機能をアップストリームに要求するか、直接コントリビュート

**AI-ネイティブ開発体系(全段階並行)**

1. `npx astryx init`でエージェントドキュメント設定 + MCPサーバー連携
2. Claude Code / Cursorに「Astryxテンプレートベースで決済設定ページを生成」といったタスクを委任
3. エージェントがmanifestを読んでシステム規則に合致したコードを生成 → レビューコスト削減

### 5.3 スタートアップ類型別活用シナリオ

| 類型 | 活用方式 |
|---|---|
| B2B SaaS | dashboard/table page/settingsテンプレートでadmin・analytics画面を数日で構築。DataTable、Form Wizardなど複雑なコンポーネントは既に検証済み |
| Fintech / Web3 | アクセシビリティ・ダークモード標準サポートで規制・監査対応負担を軽減。トークンベースのテーマでマルチブランド(ホワイトラベル)対応 |
| エージェンシー/受託開発 | クライアント別テーマパッケージのみ入れ替えて同一コードベースで複数プロジェクトを納品 — 納期短縮 |
| AI-native製品 | LLMがUIを動的生成する製品でAstryx manifestをgroundingソースとして使用 — 生成UIの一貫性確保 |
| 社内ツール(internal tools) | Astryxの原産地自体がMeta internal tools。運用ダッシュボード・バックオフィスに最も検証された使用先 |

### 5.4 導入前チェックリスト(リスク)

- **Betaステージ**(v0.1.x): 公開プロジェクトとしては初期であり、breaking changeの可能性があるため`astryx upgrade --apply` codemod経路をCIに含めること
- **React専用**: Vue/Svelteスタックには不適合
- **コンポーネント数表記の差異**: GitHub READMEは150+、ドキュメントサイトは160+と表記 — 実際に必要なコンポーネントは`npx astryx component --list`で直接確認推奨
- **未公開パッケージ**: `@astryxdesign/lab`(実験的コンポーネント)、`@astryxdesign/vega`(チャートラッパー)はまだnpm未配布 — チャートが中核となる製品は別途チャートライブラリを併用する必要がある
- **コミュニティ成熟度**: 公開3週目基準でGitHub 6.3kスター、イシュー140以上 — エコシステム(サードパーティ拡張、チュートリアル)はshadcn/ui、MUIに比べまだ薄い

---

## 6. まとめ

Astryxの核心的価値は3つである。

1. **検証済みの豊富さ** — Meta 8年、13,000以上のアプリで磨かれた150以上のコンポーネントとページパターン
2. **依存のないカスタマイズ** — トークンテーマ→classNameオーバーライド→swizzle ejectの3段階の自由度、MITライセンス
3. **人間-AI共用設計** — CLI JSON manifestとMCPサーバーで人間とエージェントが同じレファレンスでビルド

スタートアップの立場では、「UIの80%を検証済みシステムに任せ、残り20%の差別化とビジネスロジックに集中する」ツールとまとめられる。ただし、Betaステージであるため、アップグレードcodemod経路を確保し、コア依存コンポーネントを事前検証した上で導入するのが安全である。

---

## 参考資料

- 公式サイト: https://astryx.atmeta.com
- 紹介ブログ: https://astryx.atmeta.com/blog/introducing-astryx
- 技術的背景: https://astryx.atmeta.com/blog/how-astryx-works
- GitHub: https://github.com/facebook/astryx
- Component Storybook: https://facebook.github.io/astryx/
- StyleX: https://stylexjs.com
