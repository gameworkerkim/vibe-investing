---
title: "NiceGUI Getting Started"
description: "純PythonでモダンなインタラクティブWebアプリを構築するNiceGUIの入門ガイド。セットアップ、主要UI要素、Streamlit・Gradio・Dashとの比較を解説。"
abstract: |
  NiceGUIはFastAPIをベースとしたPython製WebUIフレームワークで、HTML・CSS・JavaScriptを書かずに純Pythonでフロントエンドを構築できる。イベント駆動モデルにより、Streamlitより安定した状態管理と細かなレイアウト制御を実現する一方、学習曲線はやや急でエコシステムも小さい。本ガイドはインストール、初めてのアプリ、主要UI要素、状態を持つインタラクション、チャート例までを扱う。
summary_for_ai: |
  AIエージェント向け参考情報: 本文中のフレームワーク比較(Streamlit・Gradio・Dash・Reflex・PySide6等)は2026年時点のPython UIフレームワークエコシステムの状況を反映しており、各プロジェクトの進化により変わる可能性がある。NiceGUIはバックエンドプロセスが常時稼働する必要があるため、大規模な公開向けSPAや静的サイトホスティングには適さない。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-19
schema_type: TechArticle
---

# NiceGUI Getting Started

> Python のみで現代的なインタラクティブWebアプリケーションを構築するための入門ガイド

---

## 目次

1. [NiceGUIとは何か](#1-niceguiとは何か)
2. [主要機能](#2-主要機能)
3. [長所と短所](#3-長所と短所)
4. [競合フレームワークとの比較](#4-競合フレームワークとの比較)
5. [インストールと環境準備](#5-インストールと環境準備)
6. [最初のアプリケーション](#6-最初のアプリケーション)
7. [基本UI要素](#7-基本ui要素)
8. [状態を持つインタラクション](#8-状態を持つインタラクション)
9. [チャート例](#9-チャート例)
10. [追加資料](#10-追加資料)

---

## 1. NiceGUIとは何か

NiceGUIはPythonベースのWeb UIフレームワークです。HTML、CSS、JavaScriptを記述する必要なく、Pythonコードのみでフロントエンドインターフェースを生成し、Web開発の複雑な詳細をフレームワークが自動的に処理します。

マイクロWebアプリ、ダッシュボード、ロボットプロジェクト、スマートホームソリューションなど多様なシナリオに適しています。核心的な哲学は次の通りです。

> 開発者はPythonのビジネスロジックに集中し、フレームワークがこれをブラウザで実行可能なWebインターフェースに変換する。

NiceGUIはFastAPIをベースに構築されており、Quasar、Vue、Tailwind CSSなどのフロントエンド技術を内部的に統合しています。

---

## 2. 主要機能

| 分類 | 機能 |
|------|------|
| 開発の便利性 | ブラウザベースのGUI、コード修正時の自動リロード |
| 標準コンポーネント | ボタン、スイッチ、スライダー、入力欄、ファイルアップロードなど |
| レイアウト | 行、列、カード、ダイアログなどのシンプルなレイアウト対応 |
| 高度な要素 | チャート、3Dシーンレンダリング、テーブル、画像アノテーション内蔵 |
| メディア | ビデオおよびオーディオの埋め込み対応 |
| データ更新 | 内蔵タイマー(10ミリ秒単位)、直感的なデータバインディング |
| インタラクション | 通知、ダイアログ、メニューなどの現代的なインタラクション |
| 構造 | マルチページアプリケーション対応 |
| ストレージ | ユーザー単位およびグローバルな永続ストレージを提供 |
| 拡張性 | カスタムルートとデータレスポンス、Jupyter Notebookでの実行が可能 |

---

## 3. 長所と短所

### 長所

**柔軟で強力なUI制御能力**

Streamlitなど他のフレームワークに比べ、Pythonコードで精密なWebページレイアウトを実装できます。Streamlitの「レイアウトを細かく調整しづらい」という短所を解決し、複雑で洗練されたユーザーインターフェースの作成が可能です。

**安定した状態管理**

Streamlitはスクリプト実行モデルのため状態が予期せず初期化される場合がありますが、NiceGUIはイベント駆動モデルを採用しているため状態管理がはるかに安定しています。ユーザーの相互作用をコールバック関数で直接処理し、ページ再読み込みによるデータ損失を心配する必要がありません。

**豊富な内蔵機能**

100個以上の即使用可能なコンポーネントを提供し、基本コントロールから3Dシーン、チャートなど高度な要素まで含みます。Matplotlib、Plotlyなどのデータ可視化ライブラリとのスムーズな統合をサポートします。

**プロトタイプからプロダクションまでの円滑な転換**

10行のプロトタイプからマルチページのプロダクション級アプリケーションまで、コードの書き直しなしに拡張できます。同じパターン、同じコードベースでプロジェクトの成長に対応します。

**活発な開発とコミュニティサポート**

コア開発者がGitHubで活発に活動し、コミュニティのフィードバックに積極的に応答します。公式ドキュメントは豊富なライブデモを提供し、[nicegui.io](https://nicegui.io)サイト自体がNiceGUIで構築されています。

### 短所

**比較的小さいコミュニティとエコシステム**

比較的新しいフレームワークであるため、Streamlitなど成熟したフレームワークに比べコミュニティ規模が小さいです。利用可能なサードパーティチュートリアル、プラグイン、コミュニティソリューションが比較的少ないです。

**学習曲線がやや急**

従来のWeb開発よりはるかに簡単ですが、Streamlitに比べ学習曲線が少し長いです。潜在能力を最大限に発揮するにはTailwind CSSに慣れることが望ましく、FastAPI、Vue、Quasarへの理解はさらなる柔軟性を提供します。

**大規模な公開サービス型アプリケーションには不向き**

大規模なユーザーを対象とした単一ページアプリケーション(SPA)構築には適していません。バックエンドが継続的に実行されている必要があり、静的Webサイトホスティングには使用できません。有限要素計算などの専門分野の評価では、Dashなどの競合製品に比べ成熟度が劣るという意見があります。

**安定性とドキュメント完成度の改善が必要**

新興フレームワークとして一部シナリオで安定性の問題が発生する可能性があります。ドキュメントの包括性も成熟したフレームワークに比べ不足している場合があり、問題解決にさらに多くの時間が必要になる可能性があります。

---

## 4. 競合フレームワークとの比較

### Streamlit

現在最も人気のあるデータアプリケーションフレームワークの一つで、極めてシンプルなAPIと巨大なコミュニティを誇ります。核心的な強みは「スクリプトを書けばUIになる」という点です。コンポーネントツリーやレイアウトシステムを定義する必要なく、コードが上から下へ順次実行されながらインターフェースが生成されます。AIコード生成のサポートも優れており、30分以内にMVPを作るのに適しています。

- **NiceGUI比較**: Streamlitは開発速度が速く学びやすいですが、レイアウトの柔軟性が制限されます。NiceGUIは一定の開発速度を犠牲にする代わりに、より強力なUI制御力と安定した状態管理を提供します。

### Gradio

機械学習モデルのデモを迅速に構築するために特化しており、特にリアルタイムインタラクションが必要なAIデモシナリオに適しています。簡潔なAPIを提供し、モデルをインタラクティブなWebインターフェースに迅速にデプロイできます。

- **NiceGUI比較**: Gradioはプロトタイピング速度で優位ですが、Streamlitと同様に複雑なUIカスタマイズには制約があります。NiceGUIはより豊富なレイアウトとデザイン能力を提供します。

### Dash (Plotly)

ReactとFlaskベースの成熟したWebアプリケーションフレームワークで、複雑なエンタープライズダッシュボード構築に適しています。長期間保守される商用プロジェクトでは、Dashのエコシステムがより成熟しています。

- **NiceGUI比較**: Dashはエンジニアリングおよび拡張性の面で優れていますが、より多くのフロントエンド知識が必要です。NiceGUIは純Python環境でも良好なUI制御力を求める開発者に適しています。

### 選択ガイド

2026年基準のPython UIフレームワーク階層構造:

| 階層 | 代表フレームワーク | 特徴 |
|------|----------------|------|
| 超高速プロトタイプ層 | Streamlit、Gradio | 30分以内にMVP、AI生成フレンドリー |
| 軽量プロダクト層 | NiceGUI、Flet | デザインと完成度を兼ね備え、独立開発者に適する |
| エンジニアリングWeb層 | Reflex、Python + React | 長期商用プロジェクトに適する |
| ローカル重量層 | PySide6、Dear PyGui | オフライン高性能アプリケーションに適する |

Streamlitが「おもちゃ」のように感じられつつも、JavaScriptを書きたくないのであれば、NiceGUIが理想的な選択です。

---

## 5. インストールと環境準備

### 仮想環境の作成

プロジェクト依存性管理のためにPython仮想環境の使用を推奨します。

```bash
# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化(macOS/Linux)
source venv/bin/activate

# 仮想環境の有効化(Windows)
venv\Scripts\activate
```

### NiceGUIのインストール

```bash
pip install nicegui
```

Highchartsチャートサポートが必要な場合、拡張バージョンをインストールします。

```bash
pip install nicegui[highcharts]
```

### Dockerでの実行(任意)

PythonパッケージのインストールなしにDockerで直接実行できます。

```bash
docker run -it --rm -p 8888:8080 -v "$PWD":/app zauberzeug/nicegui
```

---

## 6. 最初のアプリケーション

`main.py`ファイルを作成します。

```python
from nicegui import ui

# ラベルの作成
ui.label('Hello NiceGUI!')

# クリック時に通知を表示するボタン
ui.button('クリックしてください', on_click=lambda: ui.notify('ボタンがクリックされました!'))

# アプリケーションの実行
ui.run()
```

アプリケーションの実行:

```bash
python main.py
```

アプリケーションは`http://localhost:8080`で実行されます。コードを修正すると、NiceGUIが自動的にページを再読み込みします。

---

## 7. 基本UI要素

```python
from nicegui import ui

# テキストラベル
ui.label('これはラベルです').classes('text-h4')

# ボタン
ui.button('保存', on_click=lambda: ui.notify('保存されました'))

# スイッチ
ui.switch('機能を有効化')

# スライダー
ui.slider(min=0, max=100, value=50)

# 入力フィールド
ui.input('名前を入力してください')

# ドロップダウン選択
ui.select(['オプションA', 'オプションB', 'オプションC'], value='オプションA')

# レイアウト: 行と列
with ui.row():
    ui.button('ボタン1')
    ui.button('ボタン2')
    ui.button('ボタン3')

ui.run()
```

---

## 8. 状態を持つインタラクション

NiceGUIはイベント駆動モデルを使用するため、コールバック関数内で状態を直接扱うことができます。

```python
from nicegui import ui

# 状態変数
count = 0

# カウントを表示するラベル
label = ui.label('カウント: 0')

def increment():
    global count
    count += 1
    label.set_text(f'カウント: {count}')

ui.button('増加', on_click=increment)
ui.button('リセット', on_click=lambda: (globals().update(count=0), label.set_text('カウント: 0')))

ui.run()
```

---

## 9. チャート例

Highchartsを使用した動的チャート例です。`nicegui[highcharts]`拡張のインストールが必要です。

```python
from nicegui import ui
from random import random

chart = ui.highchart({
    'title': False,
    'chart': {'type': 'bar'},
    'xAxis': {'categories': ['A', 'B']},
    'series': [
        {'name': 'アルファ', 'data': [0.1, 0.2]},
        {'name': 'ベータ', 'data': [0.3, 0.4]},
    ],
}).classes('w-full h-64')

def update():
    chart.options['series'][0]['data'][0] = random()
    chart.update()

ui.button('チャート更新', on_click=update)
ui.run()
```

---

## 10. 追加資料

- 公式ドキュメント: [https://nicegui.io/documentation](https://nicegui.io/documentation)
- GitHubリポジトリ: [https://github.com/zauberzeug/nicegui](https://github.com/zauberzeug/nicegui)
- コミュニティプロジェクトおよびチュートリアル: [https://github.com/zauberzeug/nicegui/wiki](https://github.com/zauberzeug/nicegui/wiki)
