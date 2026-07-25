---
title: "中国のフィジカルAI(Physical AI)・エンボディドAI(Embodied AI)オープンソース生態系"
description: "アント・グループ、アリババ、テンセントの基盤モデルからユニツリー、Galaxea、X Square Robotのヒューマノイドプラットフォーム、OpenLoongのような国家主導プロジェクトまで、中国のフィジカルAI・エンボディドAIオープンソース生態系を包括的に整理。"
abstract: |
  2026年1月末のアント・グループ(Robbyant/LingBot)による連続オープンソース公開を起点に、アリババ達摩院(RynnBrain)、
  高徳地図(ABotシリーズ)、テンセント(Hunyuan World Model)、ユニツリー(UnifoLM)、Galaxea(GalaxeaVLA)、
  X Square Robot(WALLシリーズ)、Dexmal(Dexbotic/DM0)、LimX Dynamics(FluxVLA)など主要プラットフォーム・ロボット企業が
  ほぼ同時多発的に基盤モデルとデータセットを無償公開した。これは個別企業の広報イベントではなく、ロボット実データの
  ボトルネック解消のための連合戦略、政府主導の産業政策との結合、米中技術覇権競争構図における開放型標準の先取りという
  3つの構造的潮流が重なった結果と解釈すべきである。本文書は原本資料の企業別プロジェクト一覧に最新ニュースと戦略コメンタリーを
  加え、原本になかった主要プレイヤー(Galaxea General/Galbot、BAAI、Spirit AI)を追加した更新版である。
summary_for_ai: |
  中国のフィジカルAI・エンボディドAIオープンソース生態系を包括的にまとめた継続更新版(最終更新2026-07-06)。
  インターネット・テック大手、ロボット企業、オープンソースコミュニティ・国家主導プロジェクトの3つに分類される。
  インターネット・テック大手: アント・グループ(LingBot-VLA/Depth/World/Map——知覚・行動・想像を貫く完全な体化知能スタック)、
  アリババ達摩院(RynnBrain、Google DeepMindのGemini Robotics-ERとNVIDIAのCosmos-Reason2を上回ると主張する2B~30B MoE体化基盤モデル)、
  テンセント(Hunyuan World Model 1.5/WorldPlay、オープンなリアルタイム対話型3Dワールド生成パイプライン)、
  高徳地図/アリババ(Action Manifold Learningを採用したABot-M0/N0/PhysWorld)。
  ロボット企業: ユニツリー(UnifoLM-WMA-0/VLA-0、企業価値約9.5兆ウォン相当で上海上場を目指す)、
  Zhipingfang/AlphaBrain(NeuroVLA、国際的検証は限定的)、Galaxea Dynamics(GalaxeaVLA/G0.5、アント LingBot-VLAのリファレンスハードウェア)
  対、別会社であるGalaxea General/Galbot(LDA-1B、中国初の「ロボット薬剤師」として薬局100店舗に導入)、
  LimX Dynamics(FluxVLA Engine、標準化されたVLAツールプラットフォーム)、
  X Square Robot(WALL-OSS-0.5/WALL-Bの「World Unified Model」、企業価値200億元クラブの一員)、
  Dexmal(Dexbotic 2.0ツールボックス、DM0の「Embodied-Native」事前学習アプローチ、RoboChallenge Table30ベンチマーク1位)。
  オープンソースコミュニティ・国家主導プロジェクト: OpenLoong(上海の国家級ヒューマノイドロボットイノベーションセンターが運営する
  国有企業主導の共通技術プラットフォームで、企業主導プロジェクトとは性格が異なる——2025年の世界ヒューマノイド出荷量の約87%が
  中国製)、OpenJiuwen(マルチエージェントSDK層、国際的な報道は限定的)、BAAIのRoboBrain 2.0(SNSから収集した人間動作動画から
  学習する学術・国家研究所ハイブリッド)、Spirit AI(「中国版Physical Intelligence」と呼ばれ、精選データではなく大規模な
  「ダーティデータ」学習を主張、RoboChallengeリーダーボードで米Physical Intelligenceのπ0.5を上回ったと報告)。
  全体戦略地形: テック大手は完全オープンソース化とハードウェアパートナーへの出資を組み合わせる(アリババはRynnBrainを
  オープンソース化しつつX Square Robotに約1億~1.4億ドルを投資)。ロボットハードウェア企業はオープンソースを主に開発者基盤の
  拡大とIPO・資金調達のストーリーテリングに活用する。純粋なAIスタートアップはベンチマーク順位競争をマーケティング手段とする。
  国家・学術陣営は政府の大量調達政策と直結した産業共通インフラを構築する。
date: 2026-07-06
author: "Dennis Kim"
lang: ja
tags:
  - フィジカルAI
  - エンボディドAI
  - 中国
  - ロボティクス
  - オープンソース
  - VLA
keywords:
  - 中国 フィジカルAI
  - エンボディドAI オープンソース
  - VLA基盤モデル
  - アント・グループ LingBot
  - アリババ RynnBrain
  - ユニツリー UnifoLM
  - 中国 ヒューマノイドロボット
featured: false
schema_type: TechArticle
draft: false
---

# 中国のフィジカルAI(Physical AI)・エンボディドAI(Embodied AI)オープンソース生態系

最終更新: 2026-07-06

## 0. なぜ今、中国はフィジカルAIを全面的にオープンソース化するのか?

2026年1月末のアント・グループ(Robbyant/LingBot)による連続オープンソース公開を起点に、アリババ達摩院(DAMO Academy、RynnBrain)、高徳地図(ABotシリーズ)、テンセント(Hunyuan World Model)、ユニツリー(UnifoLM)、Galaxea(GalaxeaVLA)、X Square Robot(WALLシリーズ)、Dexmal(原力灵机、Dexbotic/DM0)、LimX Dynamics(朱極動力、FluxVLA)といった主要プラットフォーム・ロボット企業がほぼ同時多発的に基盤モデルとデータセットを無償公開した。これは個別企業の広報イベントではなく、次の3つの構造的潮流が重なった結果として解釈すべきである。今、韓国にとって中国のフィジカルAIは機会と挑戦になっている。短期間で中国のオープンソース生態系に

1. **データボトルネック解消のための連合戦略**: ロボット実データはテキスト・画像データに比べ収集コストが圧倒的に高い。個別企業が各自データを蓄積するよりも、モデルアーキテクチャとパイプライン自体を公開して全世界の開発者のフィードバック・派生データを吸収する方が速い道だという判断が広がった(高徳ABot-M0の「孤立したサイロの統合」ロジック、Galaxea Generalの低品質データ再活用戦略など)。
2. **政府主導の産業政策との結合**: 中国政府はロボット・ヒューマノイドを戦略産業に指定し、2025年の世界ヒューマノイド出荷量の相当部分が中国で行われた。上海の国有企業「ヒューマノイドロボット上海有限公司」が主導するOpenLoongのように、国家級イノベーションセンターが直接オープンソースコミュニティを形成する例もある。
3. **米中技術覇権競争構図における開放型標準の先取り**: ブルームバーグなど外国メディアは、アリババのRynnBrain公開について「中国のオープンソース戦略が西側の閉鎖型技術優位を弱める可能性がある」と評した。Google DeepMind(Gemini Robotics-ER)、NVIDIA(Cosmos)、Physical Intelligence(π0系列)といった米国陣営の閉鎖的・部分公開戦略と対照的な完全オープンソース路線である。

以下は原本資料の企業別プロジェクト一覧に最新ニュース・戦略コメンタリーを加え、原本になかった主要プレイヤー(Galaxea General/Galbot、BAAI、Spirit AI)を追加した更新版である。

## 機会と挑戦

1. 多くの韓国・米国企業は中国のプラットフォームを警戒している。そのためセキュリティ・パートナーシップ・レギュレーション・利用の拡張性における信頼の問題を、オープンソースで突破しようとしているのである。
2. それでも、多くの工場が「暗黙知」で構成されているため、この学習結果が中国のクラウドや競合企業に取り込まれるという懸念は残る。
3. 核心的な課題は、我々には走る虎の背に乗る勇気が必要だということだ。

---

## 1. インターネット・テック大手

### 1.1 アント・グループ(Ant Group)——LingBoテック(Ant LingBo / Robbyant)

| プロジェクト名 | タイプ | 説明 | リンク |
|---|---|---|---|
| LingBot-VLA | 体化大型モデル(VLA) | 9種のデュアルアームロボット、2万時間の実データで事前学習された「汎用ブレイン」 | [GitHub](https://github.com/Robbyant) · [Hugging Face](https://huggingface.co/robbyant) |
| LingBot-Depth | 空間認識モデル | 疎で雑音の多い深度データからの精密3D深度復元(Masked Depth Modeling) | オープンソース公開済み |
| LingBot-World | ワールドモデル | 16fps・遅延1秒以内のリアルタイム対話型シミュレーション、最大約1分の連続性を確保 | Apache 2.0ライセンス |
| LingBot-Map | ストリーミング3D再構成 | 単一RGBカメラのみでリアルタイムSLAM級3Dマップ生成、ETH3Dベンチマーク1位 | [GitHub](https://github.com/Robbyant/lingbot-map) · [arXiv](https://arxiv.org/abs/2604.14141) |

**最新ニュースと戦略(2026年)**
- 2026年1月28~30日「Evolution of Embodied AI Week」期間中にLingBot-VLA・Depth・Worldを連続公開し、アント・グループ初のオープンソース体化AIモデルシリーズを完成させた。Robbyant CEOのZhu Xing氏はこれを「AGI戦略をデジタル領域から物理知覚へ拡張するもの」と位置づけた。
- LingBot-VLAはすでにGalaxea Dynamics、AgileX Robotics、AgiBotなど他社ハードウェアに移植され、クロスモルフォロジー(異形態間)の移植性を検証済みで、上海交通大学が公開したGM-100ベンチマークでSOTAを記録した。
- 4月16日に公開したLingBot-Mapを加え、知覚(Depth・Map)—行動(VLA)—想像(World)を貫く「体化知能フルスタック」を完成させたことが核心戦略メッセージである。ただしアント・グループ自身も技術文書で、2万時間のデータでは米Physical Intelligenceのπ*0.6と同程度にとどまると認めており、データ拡充が次の課題とされている。
- Orbbecと戦略的パートナーシップを締結し、LingBot-Depthを自社の深度カメラ(Gemini 330)とチップ(MX6800)レベルで共同最適化するハードウェア連携戦略も並行して進めている。

### 1.2 アリババ(Alibaba)——達摩院(DAMO Academy)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| RynnBrain | 2B/4B/8B Dense + 30B-A3B MoE体化基盤モデル、Qwen3-VLベース | [GitHub](https://github.com/alibaba-damo-academy/RynnBrain) · [Hugging Face](https://huggingface.co/Alibaba-DAMO-Academy) |
| RynnBrain-Plan/Nav/CoP | 作業計画・視覚言語ナビゲーション・ポイント単位推論に特化した事後学習モデル | 上記リポジトリに含まれる |
| RynnEC / RynnScale / RynnVLA-001,002 | MLLMの体化世界への接続、拡張型体化モデル、VLA・ワールドモデル統合 | アリババ達摩院GitHub |

**最新ニュースと戦略(2026年)**
- 2026年2月10日公開。Google DeepMindのGemini Robotics-ER 1.5、NVIDIAのCosmos-Reason2を上回る性能を主張し、16個のオープンソースベンチマークで新記録を打ち立てたと発表した。時空間記憶(エピソード記憶)と物理世界推論を組み合わせたことが核心的な差別化点である。
- アリババCTOのJeff Zhang氏が達摩院を直接統括し、北京・杭州・サンマテオ・ベルビュー・モスクワ・テルアビブ・シンガポールの7つの研究所を新設するなど組織的投資も並行している。
- 戦略的にアリババはRynnBrainのオープンソース化と同時に、ヒューマノイドスタートアップX Square Robotに大規模投資(A+ラウンド主導、約1億~1.4億ドル)を実行し、「ブレイン(モデル)はオープンソースで生態系を広げ、ハードウェアは出資で垂直統合する」という二元戦略をとっている。自社LLMブランドQwenと共に、フィジカルAIをアリババAI戦略の中核軸として明示している。
- 4月13日にRynnBrain-4Bを追加公開し、継続的なモデルラインアップの拡張を進めている。

### 1.3 テンセント(Tencent)——混元(Hunyuan)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| Hunyuan World Model 1.5(WorldPlay) | テキスト/画像1枚からリアルタイム対話型3Dワールドを生成、業界初の全パイプライン(データ・学習・ストリーミング推論)オープンソース | [Tencent Hunyuan](https://3d-models.hunyuan.tencent.com/world/) |
| Hunyuan3D World 1.0 | 13億パラメータ、3D VAE + Diffusion Transformer、最大16秒のクリップ生成 | オープンソース公開済み |
| HunyuanVideo 1.5 | 8.3B軽量DiTベースのオープンソース映像生成モデル | [arXiv](https://arxiv.org/pdf/2511.18870) |

**最新ニュースと戦略(2026年)**
- 2025年12月17日にHunyuan World Model 1.5(WorldPlay)を正式リリースし、「業界で最も体系的かつ包括的なリアルタイムワールドモデルフレームワーク」をデータ・学習・ストリーミング推論配信まで全過程オープンソースで公開したと発表した。Next-Frames-Prediction方式の視覚的自己回帰タスクによってリアルタイム性と幾何学的整合性のトレードオフを解決したと主張している。
- テンセントの戦略はゲーム・コンテンツ制作(WorldPlay、GameCraft)とロボットシミュレーションの両方に同一のワールドモデル技術を適用する「一石二鳥」アプローチであり、アント・グループのLingBot-Worldと事実上の競合関係にある。
- Hunyuan3Dシリーズは2024年11月の初オープンソース化以降、Hugging Faceでの累積ダウンロードが300万件を突破し、Unity China・Bambu Labなど150社以上がテンセントクラウドを通じて導入した。ロボット専用ブランドよりも3Dコンテンツ・ゲームアセット生成の軸がまだ強い点がLingBot/達摩院との違いである。

### 1.4 高徳地図(Amap、アリババ系列)——ABot

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| ABot-M0 | UniACT-dataset(600万以上の軌跡、9,500時間、6個のオープンソースデータセットを統合)ベースのVLA、Action Manifold Learning(AML)を提案 | [GitHub](https://github.com/amap-cvlab) · [プロジェクトページ](https://amap-cvlab.github.io/ABot-Manipulation/) · [arXiv](https://arxiv.org/abs/2602.11236) |
| ABot-N0 | 1,690万の専門家軌跡ベースの体化ナビゲーションVLA、7つのベンチマークでSOTA | [プロジェクトページ](https://amap-cvlab.github.io/ABot-Navigation/ABot-NO/) |
| ABot-PhysWorld | 物理整合型対話型ワールド基盤モデル、Veo 3.1・Sora v2 Pro比で物理的妥当性優位を主張 | [GitHub](https://github.com/amap-cvlab/ABot-PhysWorld) |
| UniACT-dataset | 6個の公開データセットを統合、600万以上の軌跡、20以上のロボット形態をカバー | ABot-M0と共に公開 |

**最新ニュースと戦略(2026年)**
- 高徳地図(アマップ、高徳ナビ)はアリババグループ傘下の地図・ナビゲーション系列会社で、「体化知能は閉鎖的な独占システムではなく、異種データの統合と段階的な能力蓄積を通じて発展すべきである」という明示的なオープンソース哲学を論文冒頭で述べている。
- ABot-M0の核心技術はAction Manifold Learning(AML)で、ノイズ除去(diffusion)の代わりに低次元マニフォールドへの射影(projection)によって行動を直接予測し、デコード速度と安定性を同時に改善したと主張する。
- 2026年2~3月の間にABot-M0(操作)、ABot-N0(ナビゲーション)、ABot-PhysWorld(ワールドモデル)まで3種セットを順次公開し、操作・移動・シミュレーション全領域を貫くロードマップを完成させた。アリババ達摩院(RynnBrain)とは別組織だが、同じアリババグループのオープンソース戦略の一軸として動く。

---

## 2. ロボット企業

### 2.1 ユニツリー(Unitree Robotics)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| UnifoLM-WMA-0 | クロス embodiment ワールドモデル—アクションアーキテクチャ、シミュレーションエンジン兼ポリシー強化モジュール | [GitHub](https://github.com/unitreerobotics/unifolm-world-model-action) · [Hugging Face](https://huggingface.co/unitreerobotics/UnifoLM-WMA-0-Base) |
| UnifoLM-VLA-0 | 汎用ヒューマノイド操作向けVLA大型モデル | [GitHub](https://github.com/unitreerobotics) |
| Qmini / UniArmL1 | 3Dプリント可能な低コスト二足歩行ロボット、軽量6-DOFオープンソースロボットアーム | GitHub |

**最新ニュースと戦略(2026年)**
- 2025年9月(WMA-0)、2026年1月(VLA-0)にそれぞれオープンソース化。G1ヒューマノイド(1.3m)にUnifoLM-WMA-0を統合し、ビジョン・言語・行動を結合した。
- 2026年7月初、上海証券取引所の上場承認(CSRC承認、企業価値約9.5兆ウォン相当規模)を受け、IPOを目前にしている。これは創立10周年と重なるイベントであり、「フルスタック自社開発+量産+オープンソース生態系」の好循環構造がIPOストーリーの核心として提示されている。
- 大連海事大学Pioneer Technology Labの研究者は「UnifoLM-WMA-0はロボットが水たまりなどの障害物をミリ秒単位で予測し歩幅を調整できるようにする」と評価し、業界関係者は「ユニツリーの売上の相当部分が教育・研究用ロボットから出ている以上、開発者生態系の確保が中核ビジネスだ」と分析している。実際に四足歩行・ヒューマノイドモデルの約80%が研究・教育・消費者市場に配備されている。

### 2.2 Zhipingfang(智平方)——AlphaBrain

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| AlphaBrain Platform | 世界初のワンストップ体化AIモデルオープンソースコミュニティを標榜 | 公式発表 |
| NeuroVLA | 脳科学ベースのVLAモデル(世界初のオープンソースを標榜) | AlphaBrain Platform経由で公開 |

**注記**: Zhipingfang/AlphaBrainは他の大手企業系列プロジェクトに比べ、英文・国際メディアの報道が限定的で、検証可能なGitHubリポジトリのリンクもまだ広く確認されていない。原本資料の「世界初」という表現は同社の公式発表に基づくものであり、追加の相互検証が必要な項目である。最新の活動確認には同社の公式チャンネルの継続的な監視を推奨する。

### 2.3 Galaxea Dynamics(Galaxea AI)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| G0.5(GalaxeaVLA) | 自己回帰方式で推論・行動トークンを1つのトランスフォーマーデコーダーで生成するVLA | [GitHub](https://github.com/OpenGalaxea/GalaxeaVLA) |
| Galaxea Open-World Dataset | 50以上の実環境、累積500時間・10TB超、公開2か月で40万件のダウンロード | Hugging Face · ModelScope |
| G0Tiny | 250M軽量モデル、R1 Pro Orinオンデバイス推論(最大10Hz) | Hugging Face |

**最新ニュースと戦略(2026年)**
- 2023年9月創業(創業者Gao Jiyang氏、元Waymo・Momenta出身)、アルゴリズムとハードウェアを共に開発する「フルスタック」戦略を標榜する。2025年8月のG0公開以降、2026年1月にG0Plus、6月にG0.5と急速に反復リリースを続けている。
- 車輪型ロボットR1 Proはアント・グループLingBot-VLAの公式ハードウェアパートナーとして採用されるなど、大手企業のオープンソースモデルの「リファレンスハードウェア」の地位を戦略的に確保している。
- 2026年2月のシリーズBで10億元(約1,450億ウォン)を調達し、Galaxea Open-World Datasetの好調(ダウンロード40万件)をデータ生態系拡大の中核成果として掲げている。
- 似た名前の別会社である**Galaxea General(銀河通用、Galbot)**は、北京大学・清華大学と共同でLDA-1B(Latent Dynamics Action Model)を開発し、2026年4月にRSS(Robotics: Science and Systems)に正式採択された。DINOベースの潜在表現によって低品質・未整備データまで学習に活用でき、「低品質データを30%追加すると成功率が10ポイント上昇する」という結果で注目を集め、企業価値200億元を記録中である。GalbotのG1は2026年春節のCCTVステージに出演し、薬局100店舗に配備され30万件以上の医薬品販売を処理、中国初の「ロボット薬剤師」資格を獲得した。**両社は名前が似ているが別法人であるため、文書引用時に混同しないよう注意が必要である。**

### 2.4 LimX Dynamics(朱極動力)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| FluxVLA Engine | VLAの全周期(データ→学習→評価→実機配備)標準化エンジニアリングプラットフォーム、Apache 2.0 | [GitHub](https://github.com/limxdynamics/FluxVLA) · [ドキュメント](https://fluxvla.limxdynamics.com/) |
| LimX COSA / VGM / DreamActor | 体化エージェンティックOS、操作アルゴリズム、体化学習の新パラダイム | 公式ホームページ |

**最新ニュースと戦略(2026年)**
- 2026年4月30日にFluxVLA Engineのオープンソース化を発表。OpenVLA・LlavaVLA・GR00T・Pi0・Pi0.5など主要なVLAアルゴリズムを単一の設定ファイルで管理できる標準化プラットフォームを標榜し、サードパーティのサービングフレームワーク(Reflexなど)にも既に統合されている。
- アリババ(2024年)と京東(2025年)から戦略的投資を誘致し、TRON 1/2(研究用)→Oli(完全体ヒューマノイド)へと続く製品ラダーとソフトウェアスタック(COSA、VGM、DreamActor、FluxVLA)を組み合わせた「ハードウェア+ソフトウェアプラットフォーム企業」というポジショニングをとっている。
- 2026年2月時点で約2億ドル規模の最新投資ラウンドを誘致し(GalaxeaやSpirit AIなどと共に大型ラウンドグループに含まれる)、GitHub issueに加えmason@limxdynamics.com・wayne@limxdynamics.comを通じた直接技術支援窓口を公開し、開発者コミュニティとの接点を強化している。

### 2.5 X Square Robot(自変量機器人)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| WALL-OSS-0.5 | 4Bパラメータ VLA、ゼロショット実機ロボット操作、業界初の体化AIオープンソースを標榜 | GitHub · Hugging Face |
| WALL-B / WALL-WM | World Unified Modelアーキテクチャベースの基盤モデル / ワールドモデル拡張版 | 公開済み |
| XRZero-G0 | ロボットなしでデータ収集・訓練が可能なオープンソースフレームワーク、公開1週間でAlphaXivトレンドトップ10入り | 公開済み |

**最新ニュースと戦略(2026年)**
- 2023年12月創業(最新更新時点で創業2年未満)以降、2025年9月のA+ラウンド(Alibaba Cloud・CAS Investment主導、1億ドル)を含め8回連続で投資を誘致し、累積調達額約2億8千万ドル(20億元)を記録した。その後2026年初の2か月間で4連続ラウンドを行い30社以上の投資家を誘致、企業価値200億元(約4.5兆ウォン)を突破、Galbot・Galaxea AI・Spirit AI・LinkerBotと共に「200億元クラブ」に名を連ねた。
- CEOのWang Qian氏(創業時のCOOはYang Qian氏)は「創業初日から自社基盤モデルに注力してきた」と強調し、ハードウェア(清掃ロボットQuanta X2)とモデル(WALLシリーズ)を同時にオープンソース化・商用化する二重戦略をとっている。
- 2026年4月のWALL-B公開時、既存のモジュール型VLAとは異なり、認知・言語・行動・物理的予測を単一ネットワークで学習する「World Unified Model」アーキテクチャを標榜した。IPO準備にも着手しているが、上場地域は未定である。

### 2.6 Dexmal(原力灵机)

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| Dexbotic 2.0 | PyTorchベースのVLA開発ツールボックス、π0・CogACTなど主要アルゴリズムの再現・微調整をサポート、MITライセンス | [GitHub](https://github.com/dexmal/dexbotic) |
| DM0 | 2.4Bパラメータ「Embodied-Native」VLA、RoboChallenge Table30ベンチマーク1位 | [GitHub](https://github.com/dexmal/dexbotic/blob/main/docs/DM0.md) · [arXiv](https://arxiv.org/html/2602.14974v1) |

**最新ニュースと戦略(2026年)**
- 2025年10月にDexboticを初公開、2026年2月10日のDM0公開と同時にStepFunとの共同開発を明示した。RLinfチームともVLA+強化学習研究のための戦略的協力を発表するなど、オープンソース生態系間の連合が活発である。
- DM0の核心主張は「インターネット事前学習モデルを物理タスクへ事後適応させる既存方式」から脱却し、事前学習段階から走行・体化相互作用データを統合学習する「Embodied-Native」アプローチである。3段階(Pretraining-Mid-Training-Post-Training)パイプラインとFlow Matchingアクションエキスパートを組み合わせている。
- 北京拠点のスタートアップで、Dexbotic 2.0を「体化AIのPyTorch級インフラ」と位置づけ、標準開発フレームワークの地位を先取りしようとしている。

---

## 3. オープンソースコミュニティおよび国家主導プロジェクト

### 3.1 OpenLoong

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| OpenLoong | ヒューマノイドロボット体化AI操作システムオープンソースコミュニティ | [GitHub](https://github.com/loongOpen) |
| OpenLoong-Dyn-Control | MPC・WBCベースの全身動力学制御ソフトウェア | GitHub |
| OpenLoong-Hardware | ヒューマノイドロボットハードウェアオープンソース | GitHub |

**最新ニュースと戦略(2026年)**
- 2024年5月始動。国有企業「ヒューマノイドロボット上海有限公司(人形机器人上海有限公司)」が研究開発を主導し、国家級イノベーションセンター(上海ヒューマノイドロボットイノベーションセンター)が直接運営する「司令塔型」オープンソースコミュニティであるという点で、民間企業主導のプロジェクトとは性格が異なる。
- イノベーションセンター総経理の徐彬氏は「ヒューマノイド『青龍』のオープンソース版をベースに共通技術プラットフォームを構築し、コア分野の技術突破と大規模商用化を同時に実現する」と述べた。つまりOpenLoongは個別企業の生態系拡大ツールではなく、**中国ロボット産業全体の共通インフラを国家が構築する**性格が強い。
- 2025~2026年、政府・国有企業主導の大量調達がロボットスタートアップのキャッシュフローと規模の経済を牽引する構図の中で、OpenLoongはその技術標準化の軸を担っているという分析がある(2025年の世界ヒューマノイド出荷量の約87%が中国製という統計がこの流れを裏付けている)。

### 3.2 OpenJiuwen

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| JiuwenSwarm | マルチエージェント協働システム | GitHub |
| Agent-Core | LLMアプリケーション向けPython SDK | GitHub |
| Agent-Protocol | エージェント相互運用プロトコルSDK | GitHub |

**注記**: OpenJiuwenはロボット本体よりもエージェント・SDK層に焦点を当てたプロジェクトで、検索時点で国際メディアの独自報道は限定的である。GitHubリポジトリを通じた直接確認とコミット履歴の追跡を推奨する。

### 3.3 [新規追加] BAAI(北京智源人工知能研究院)——RoboBrain 2.0

| プロジェクト名 | 説明 | リンク |
|---|---|---|
| RoboBrain 2.0 | 言語モデルの能力と空間推論を組み合わせたオープンソースロボティクスモデル、抖音(中国版TikTok)の動画から人間の動作を直接観察・学習する方式を採用 | BAAI公式 |

**最新ニュースと戦略(2026年)**
- BAAI(院長兼ロボティクス研究責任者のWang Zhongyuan氏)は、大学・政府研究所系列の代表的なオープンソース軸であり、企業系列(アント・アリババ・テンセント)とは異なる学術—国家研究所ハイブリッドモデルである。インターネット上に存在する膨大な人間動作動画(SNSのダンス動画など)を直接学習データとして活用するアプローチが特徴的に報道された。

### 3.4 [新規追加] Spirit AI

**概要と戦略(2026年)**: 「中国版Physical Intelligence」と呼ばれ、精選されたデータの代わりに「ダーティデータ(dirty data)」の大規模学習がVLA拡張の核心であるという差別化された哲学を掲げている。自社のウェアラブルデータ収集装置を第5世代まで発展させ、テレオペレーションに比べデータ収集コストを90%削減したと主張し、20万時間以上の実世界相互作用データを確保(年内100万時間目標)した。2026年1月にオープンソース公開した「Spirit v1.5」は、RoboChallengeグローバルリーダーボードで米Physical Intelligenceのπ0.5を上回る成績を記録したと報じられた。CATL・華為・小米・京東などの産業戦略投資家と、重慶・杭州の国有ファンドが共に参加し、部品(上流)・流通(下流)両側を株主として確保、実世界配備データを迅速に蓄積できる構造を備えているとの評価がある。

---

## 4. まとめ:中国物理AIオープンソース生態系の階層構造(更新版)

| 階層 | 代表企業・プロジェクト | 性格 | 主要リンク |
|---|---|---|---|
| 基盤モデル層 | アント(LingBot-VLA)、達摩院(RynnBrain)、高徳(ABot-M0)、Dexmal(DM0)、Spirit AI(v1.5) | 汎用VLA「ブレイン」 | lingbot-vla · RynnBrain · ABot-Manipulation |
| ワールドモデル層 | ユニツリー(UnifoLM-WMA-0)、テンセント(Hunyuan World 1.5)、アント(LingBot-World)、高徳(ABot-PhysWorld) | シミュレーション・データ生成エンジン | UnifoLM-WMA-0 |
| フレームワーク・ツールチェーン層 | Dexmal(Dexbotic 2.0)、LimX Dynamics(FluxVLA)、Zhipingfang(AlphaBrain) | 開発インフラ標準化 | FluxVLA · Dexbotic |
| データセット層 | Galaxea(Open-World Dataset)、高徳(UniACT-dataset)、X Square Robot(XRZero-G0)、Galaxea General(LDA-1B学習セット) | 大規模実物・合成データ | X-Square-Robot |
| OS・ハードウェア層 | OpenLoong(国家主導)、ユニツリー(UnifoLM統合G1)、LimX Dynamics(COSA) | ロボット本体・OS標準 | OpenLoong |
| 国家・学術インフラ層 | OpenLoong(国有企業主導)、BAAI(RoboBrain 2.0)、OpenJiuwen | 産業共通標準・政策連携 | 上海ヒューマノイドイノベーションセンター |

---

## 5. 全体戦略地形のまとめ

1. **大手企業(アント・アリババ・テンセント)**: モデルを完全オープンソース化し「グローバル開発者生態系の吸収→自社クラウド/ハードウェアパートナーのロックイン」という2段階戦略を共有する。アリババはオープンソース(RynnBrain)と出資(X Square Robot)を並行する点が特に明確である。
2. **ロボットハードウェア企業(ユニツリー・Galaxea・X Square Robot・LimX Dynamics)**: オープンソースは売上よりも開発者基盤の拡大とIPO・投資誘致のストーリーテリングに重点がある。ユニツリーの上場間近、X Square Robot・Galaxeaの連続大型投資誘致がこれを裏付ける。
3. **純粋AIスタートアップ(Dexmal・Spirit AI)**: ハードウェアなしでモデル・データ・フレームワークのみで勝負し、ベンチマーク(RoboChallenge、GM-100)1位争いがそのままマーケティングであり投資誘致手段となる。
4. **国家・学術軸(OpenLoong・BAAI)**: 個別企業の競争とは別に、産業全体の共通標準・データインフラを構築する役割を担い、政府の大量調達政策と直接連動する。

これら4つの軸が互いに競争しながらもデータ・人材・投資の面で相互に絡み合っている点(例:LingBot-VLAをGalaxea・AgileXのハードウェアで検証、アリババがRynnBrainとX Square Robotの株式を同時に保有)が、2026年の中国フィジカルAI生態系の構造的特徴である。

---

## 6. 主要出典

- RoboHorizon, "アント・グループ、ロボットAIフルスタックを電撃公開", 2026-01-29
- 로봇신문(韓国), "Orbbec–Robbyant、LingBot-Depth公開", 2026-01-30
- BusinessWire/FinancialContent, "Robbyant Open-Sources LingBot-World", 2026-01-29
- Las Vegas Sun/BusinessWire, "Robbyant Unveils LingBot-Map", 2026-04-16
- MarkTechPost, "Ant Group Releases LingBot-VLA", 2026-01-29
- MS투데이(韓国), "アリババ、ロボット向けオープンソースAI『リンブレイン』公開", 2026-02-11
- 로봇신문(韓国), "中アリババ、ロボット向けオープンソースAIモデル『リンブレイン』公開", 2026-02-11
- GitHub, alibaba-damo-academy/RynnBrain
- ai타임스(韓国), "アリババ、オープンソースロボットモデル発表で『フィジカルAI』進出", 2026-02-11
- CIP Lawyer / Futubull, "Tencent Hunyuan World Model 1.5 Officially Launched", 2025-12-16~17
- arXiv 2602.11236, "ABot-M0: VLA Foundation Model for Robotic Manipulation with Action Manifold Learning"
- arXiv 2603.23376, "ABot-PhysWorld"
- arXiv 2602.11598, "ABot-N0"
- Gasgoo, "Unitree Robotics IPO Reaches Key Milestone", 2026-03-23
- Yicai, "China's Unitree Open-Sources World Model to Advance Robotics Ecosystem", 2025-09-16
- 글로벌이코노믹(韓国), "ユニツリー上場承認…企業価値9.5兆ウォンに迫る", 2026-07
- 오마이뉴스(韓国), "血しぶき舞う中国ロボット三国戦", 2026-04-30
- GitHub, OpenGalaxea/GalaxeaVLA
- 로봇신문(韓国), "2026年ロボットデータ戦争、すでに始まっている", 2026-01-26
- 와우테일(韓国), "ロボットの脳から自律走行チップまで、2月に注目すべき中国スタートアップ4社", 2026-03-16
- LimX Dynamics公式ニュースセンター・GitHub(limxdynamics/FluxVLA)
- RobotsAsia, "LimX Dynamics: Humanoid Robots, Oli & TRON Platforms"
- Cryptopolitan, "アリババ、ロボット会社X SquareへUS$1億ドルの投資支援", 2025-09-08
- 로봇신문(韓国), "中ヒューマノイドスタートアップ『X Square Robot』、企業価値28億ドル突破"
- GitHub, dexmal/dexbotic · Pandaily, "Dexmal Unveils DM0", 2026-02-10
- iting.co.kr, "2025年中国はヒューマノイドロボット産業を育成中", 2025-03-07(OpenLoong概要)
- 로봇신문(韓国), "[企画] ヒューマノイドロボット強国『中国』の未来を覗く(3)", 2025-09-17(OpenLoong・上海イノベーションセンター)
- GQ Korea, "人間と共存する最初のロボット、その出発点は中国", 2026-04-15(BAAI RoboBrain 2.0)
- inuglr.com, "中国の国家主導型AIロボット政策:データ確保とオープンソース標準化", 2026-03-13

*注:一部のプロジェクト(Zhipingfang/AlphaBrain、OpenJiuwen)は国際メディア・英文GitHub上の相互検証資料が相対的に限定的であるため、最新動向は企業・コミュニティの公式チャンネルを通じて再確認することを推奨する。*
