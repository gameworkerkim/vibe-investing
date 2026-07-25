---
title: "NiceGUI 入门指南"
description: "使用纯Python构建现代交互式网页应用的NiceGUI入门指南,涵盖安装、核心UI组件以及与Streamlit、Gradio、Dash的对比。"
abstract: |
  NiceGUI是一个基于FastAPI的Python网页UI框架,让开发者无需编写HTML、CSS或JavaScript即可用纯Python构建前端。其事件驱动模型相较Streamlit能提供更稳定的状态管理和更精细的布局控制,但代价是学习曲线略陡、生态规模较小。本指南涵盖安装、第一个应用、核心UI组件、带状态的交互以及图表示例。
summary_for_ai: |
  面向AI代理的参考说明:文中对框架的对比(Streamlit、Gradio、Dash、Reflex、PySide6等)反映的是截至2026年Python UI框架生态的状况,随着各项目的发展可能会有所变化。由于需要持续运行后端进程,NiceGUI不适合大规模面向公众的单页应用或静态站点托管场景。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-19
schema_type: TechArticle
---

# NiceGUI 入门指南

> 仅使用Python构建现代交互式网页应用的入门指南

---

## 目录

1. [什么是NiceGUI](#1-什么是nicegui)
2. [主要功能](#2-主要功能)
3. [优点与缺点](#3-优点与缺点)
4. [与竞品框架的对比](#4-与竞品框架的对比)
5. [安装与环境准备](#5-安装与环境准备)
6. [第一个应用](#6-第一个应用)
7. [基本UI组件](#7-基本ui组件)
8. [带状态的交互](#8-带状态的交互)
9. [图表示例](#9-图表示例)
10. [更多资料](#10-更多资料)

---

## 1. 什么是NiceGUI

NiceGUI是一个基于Python的网页UI框架。它仅使用Python代码即可生成前端界面,无需编写HTML、CSS或JavaScript,网页开发中的繁琐细节由框架自动处理。

它适用于多种场景:微型网页应用、仪表盘、机器人项目、智能家居解决方案等。其核心理念是:

> 开发者专注于Python业务逻辑,框架将其转换为可在浏览器中运行的网页界面。

NiceGUI基于FastAPI构建,并在内部集成了Quasar、Vue、Tailwind CSS等前端技术。

---

## 2. 主要功能

| 分类 | 功能 |
|------|------|
| 开发便利性 | 基于浏览器的GUI,代码修改时自动重新加载 |
| 标准组件 | 按钮、开关、滑块、输入框、文件上传等 |
| 布局 | 支持行、列、卡片、对话框等简单布局 |
| 高级组件 | 内置图表、3D场景渲染、表格、图像标注 |
| 媒体 | 支持嵌入视频和音频 |
| 数据更新 | 内置定时器(10毫秒粒度)、直观的数据绑定 |
| 交互 | 通知、对话框、菜单等现代化交互 |
| 结构 | 支持多页面应用 |
| 存储 | 提供基于用户和全局的持久化存储 |
| 可扩展性 | 自定义路由和数据响应,可在Jupyter Notebook中运行 |

---

## 3. 优点与缺点

### 优点

**灵活强大的UI控制能力**

相比Streamlit等其他框架,NiceGUI可以用Python代码实现精确的网页布局。它解决了Streamlit"难以精细调整布局"的缺点,能够制作复杂而精致的用户界面。

**稳定的状态管理**

Streamlit由于其脚本执行模型,状态有时会意外重置,而NiceGUI采用事件驱动模型,状态管理要稳定得多。用户交互直接由回调函数处理,无需担心因页面刷新而丢失数据。

**丰富的内置功能**

提供100多个即用型组件,从基础控件到3D场景、图表等高级元素均有涵盖。与Matplotlib、Plotly等数据可视化库的集成也十分顺畅。

**从原型到生产环境的顺畅过渡**

可以从10行代码的原型扩展到多页面的生产级应用,而无需重写代码。同样的模式、同样的代码库可以应对项目的成长。

**活跃的开发与社区支持**

核心开发者在GitHub上活跃互动,积极回应社区反馈。官方文档提供了丰富的实时演示,[nicegui.io](https://nicegui.io)网站本身就是用NiceGUI构建的。

### 缺点

**社区和生态相对较小**

作为一个相对较新的框架,与Streamlit等成熟框架相比,其社区规模较小。可用的第三方教程、插件和社区解决方案相对较少。

**学习曲线略陡**

虽然比传统网页开发简单得多,但学习曲线比Streamlit稍长。要充分发挥其潜力,熟悉Tailwind CSS会有帮助,而对FastAPI、Vue、Quasar的了解则能带来更大的灵活性。

**不适合大规模面向公众的服务型应用**

不太适合构建面向大量用户的单页应用(SPA)。后端必须持续运行,也不能用于静态网站托管。在有限元计算等专业领域的评估中,有观点认为其成熟度不及Dash等竞品。

**稳定性和文档完整性有待改进**

作为一个年轻的框架,在某些场景下可能出现稳定性问题。文档的全面性也可能不及成熟框架,解决问题时可能需要花费更多时间。

---

## 4. 与竞品框架的对比

### Streamlit

目前最受欢迎的数据应用框架之一,拥有极其简单的API和庞大的社区。其核心优势是"写脚本即得UI"——无需定义组件树或布局系统,代码从上到下顺序执行的过程中就能生成界面。它在AI代码生成支持方面也表现出色,适合在30分钟内搭建出MVP。

- **与NiceGUI相比**:Streamlit开发速度更快、更易学,但布局灵活性受限。NiceGUI在牺牲一定开发速度的同时,提供更强的UI控制力和更稳定的状态管理。

### Gradio

专为快速构建机器学习模型演示而设计,特别适合需要实时交互的AI演示场景。其简洁的API能让你迅速将模型部署为交互式网页界面。

- **与NiceGUI相比**:Gradio在原型开发速度上占优,但与Streamlit一样,在复杂UI定制方面存在限制。NiceGUI提供更丰富的布局和设计能力。

### Dash (Plotly)

基于React和Flask的成熟网页应用框架,适合构建复杂的企业级仪表盘。对于长期维护的商业项目,Dash的生态更为成熟。

- **与NiceGUI相比**:Dash在工程性和可扩展性方面更出色,但需要更多前端知识。NiceGUI更适合希望在纯Python环境中获得良好UI控制力的开发者。

### 选择指南

截至2026年的Python UI框架层级结构:

| 层级 | 代表框架 | 特点 |
|------|----------------|------|
| 超快速原型层 | Streamlit、Gradio | 30分钟内完成MVP,对AI生成友好 |
| 轻量级产品层 | NiceGUI、Flet | 兼具设计感和完整度,适合独立开发者 |
| 工程化网页层 | Reflex、Python + React | 适合长期商业项目 |
| 本地重型层 | PySide6、Dear PyGui | 适合离线高性能应用 |

如果你觉得Streamlit太像"玩具",但又不想写JavaScript,NiceGUI是理想的选择。

---

## 5. 安装与环境准备

### 创建虚拟环境

建议使用Python虚拟环境来管理项目依赖。

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境(macOS/Linux)
source venv/bin/activate

# 激活虚拟环境(Windows)
venv\Scripts\activate
```

### 安装NiceGUI

```bash
pip install nicegui
```

如果需要Highcharts图表支持,请安装扩展版本。

```bash
pip install nicegui[highcharts]
```

### 使用Docker运行(可选)

无需安装Python包,可直接用Docker运行。

```bash
docker run -it --rm -p 8888:8080 -v "$PWD":/app zauberzeug/nicegui
```

---

## 6. 第一个应用

创建一个`main.py`文件。

```python
from nicegui import ui

# 创建标签
ui.label('Hello NiceGUI!')

# 点击后显示通知的按钮
ui.button('点击我', on_click=lambda: ui.notify('按钮被点击了!'))

# 运行应用
ui.run()
```

运行应用:

```bash
python main.py
```

应用将在`http://localhost:8080`运行。修改代码后,NiceGUI会自动重新加载页面。

---

## 7. 基本UI组件

```python
from nicegui import ui

# 文本标签
ui.label('这是一个标签').classes('text-h4')

# 按钮
ui.button('保存', on_click=lambda: ui.notify('已保存'))

# 开关
ui.switch('启用功能')

# 滑块
ui.slider(min=0, max=100, value=50)

# 输入框
ui.input('请输入姓名')

# 下拉选择
ui.select(['选项A', '选项B', '选项C'], value='选项A')

# 布局:行与列
with ui.row():
    ui.button('按钮1')
    ui.button('按钮2')
    ui.button('按钮3')

ui.run()
```

---

## 8. 带状态的交互

NiceGUI使用事件驱动模型,因此可以在回调函数中直接处理状态。

```python
from nicegui import ui

# 状态变量
count = 0

# 显示计数的标签
label = ui.label('计数: 0')

def increment():
    global count
    count += 1
    label.set_text(f'计数: {count}')

ui.button('增加', on_click=increment)
ui.button('重置', on_click=lambda: (globals().update(count=0), label.set_text('计数: 0')))

ui.run()
```

---

## 9. 图表示例

一个使用Highcharts的动态图表示例。需要安装`nicegui[highcharts]`扩展。

```python
from nicegui import ui
from random import random

chart = ui.highchart({
    'title': False,
    'chart': {'type': 'bar'},
    'xAxis': {'categories': ['A', 'B']},
    'series': [
        {'name': 'Alpha', 'data': [0.1, 0.2]},
        {'name': 'Beta', 'data': [0.3, 0.4]},
    ],
}).classes('w-full h-64')

def update():
    chart.options['series'][0]['data'][0] = random()
    chart.update()

ui.button('更新图表', on_click=update)
ui.run()
```

---

## 10. 更多资料

- 官方文档:[https://nicegui.io/documentation](https://nicegui.io/documentation)
- GitHub仓库:[https://github.com/zauberzeug/nicegui](https://github.com/zauberzeug/nicegui)
- 社区项目与教程:[https://github.com/zauberzeug/nicegui/wiki](https://github.com/zauberzeug/nicegui/wiki)
