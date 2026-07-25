---
title: "NiceGUI入门指南"
description: "使用NiceGUI以纯Python构建现代交互式Web应用的入门指南,涵盖安装配置、核心UI组件,以及与Streamlit、Gradio、Dash的对比。"
abstract: |
  NiceGUI是一个基于FastAPI构建的Python Web UI框架,让开发者能够完全用Python编写前端,无需编写HTML、CSS或JavaScript。其事件驱动模型相比Streamlit提供了更稳定的状态管理和更精细的布局控制,但代价是学习曲线略陡、生态系统较小。本指南涵盖安装、第一个应用、核心UI组件、状态化交互以及图表示例。
summary_for_ai: |
  面向AI代理的参考说明:本文中与Streamlit、Gradio、Dash、Reflex、PySide6等框架的对比反映的是截至2026年Python UI框架生态的状况,随着这些项目的发展可能会有所变化。NiceGUI不适合用于大规模面向公众的SPA应用或静态网站托管,因为它需要保持后端进程持续运行。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-19
schema_type: TechArticle
---

# NiceGUI入门指南

> 一份仅使用Python构建现代交互式Web应用的入门指南

---

## 目录

1. [什么是NiceGUI](#1-什么是nicegui)
2. [核心特性](#2-核心特性)
3. [优缺点](#3-优缺点)
4. [与竞品框架的比较](#4-与竞品框架的比较)
5. [安装与配置](#5-安装与配置)
6. [第一个应用](#6-第一个应用)
7. [基础UI组件](#7-基础ui组件)
8. [状态化交互](#8-状态化交互)
9. [图表示例](#9-图表示例)
10. [其他资源](#10-其他资源)

---

## 1. 什么是NiceGUI

NiceGUI是一个基于Python的Web UI框架。它仅通过Python代码生成前端界面,无需编写HTML、CSS或JavaScript,框架会自动处理Web开发中的复杂细节。

它适用于广泛的场景:微型Web应用、仪表盘、机器人项目、智能家居解决方案等。其核心理念是:

> 开发者专注于Python业务逻辑,框架负责将其转化为可在浏览器中运行的Web界面。

NiceGUI基于FastAPI构建,内部集成了Quasar、Vue、Tailwind CSS等前端技术。

---

## 2. 核心特性

| 类别 | 特性 |
|------|------|
| 开发便利性 | 基于浏览器的GUI,代码修改后自动重新加载 |
| 标准组件 | 按钮、开关、滑块、输入框、文件上传等 |
| 布局 | 简单的布局支持:行、列、卡片、对话框 |
| 高级元素 | 内置图表、3D场景渲染、表格、图像标注 |
| 媒体 | 支持视频和音频嵌入 |
| 数据更新 | 内置定时器(10毫秒粒度)、直观的数据绑定 |
| 交互 | 现代化交互:通知、对话框、菜单 |
| 结构 | 支持多页面应用 |
| 存储 | 提供用户级和全局的持久化存储 |
| 可扩展性 | 支持自定义路由和数据响应,可在Jupyter Notebook中运行 |

---

## 3. 优缺点

### 优点

**灵活强大的UI控制能力**

与Streamlit等框架相比,NiceGUI允许你在Python代码中实现精确的网页布局。它解决了Streamlit"难以精细调整布局"的弱点,使构建复杂精美的用户界面成为可能。

**稳定的状态管理**

Streamlit基于脚本执行的模型可能导致状态意外重置,而NiceGUI的事件驱动模型使状态管理更加稳定。用户交互直接通过回调函数处理,因此无需担心页面重新加载导致的数据丢失。

**丰富的内置功能**

提供超过100个开箱即用的组件,从基础控件到3D场景、图表等高级元素一应俱全。可与Matplotlib、Plotly等数据可视化库顺畅集成。

**从原型到生产环境的平滑过渡**

可以从10行代码的原型顺利扩展为多页面的生产级应用,而无需重写代码。相同的模式和代码库能够适应项目的成长。

**活跃的开发与社区支持**

核心开发者在GitHub上非常活跃,能够及时响应社区反馈。官方文档提供了丰富的实时演示,[nicegui.io](https://nicegui.io)网站本身也是用NiceGUI构建的。

### 缺点

**社区和生态系统相对较小**

作为一个相对较新的框架,其社区规模比Streamlit等成熟框架要小。第三方教程、插件和社区解决方案较少。

**学习曲线略陡**

相比传统Web开发要简单得多,但学习曲线比Streamlit稍长。要充分发挥其潜力,熟悉Tailwind CSS会有帮助,理解FastAPI、Vue和Quasar则能带来更大的灵活性。

**不适合大规模面向公众的服务应用**

不太适合构建面向大量用户的单页应用(SPA)。后端必须持续运行,也无法用于静态网站托管。在有限元计算可视化等专业领域,有人认为它不如Dash等竞品成熟。

**稳定性和文档完整性仍有提升空间**

作为一个年轻的框架,在某些场景下可能出现稳定性问题。文档也可能不如成熟框架全面,解决问题可能需要更多时间。

---

## 4. 与竞品框架的比较

### Streamlit

目前最流行的数据应用框架之一,拥有极其简洁的API和庞大的社区。其核心优势是"写一个脚本,得到一个UI"——界面随代码自上而下执行而生成,无需定义组件树或布局系统。它在AI代码生成支持方面也表现出色,非常适合在30分钟内构建MVP。

- **与NiceGUI相比**:Streamlit开发速度更快、更易学习,但布局灵活性有限。NiceGUI在牺牲部分开发速度的同时,换来了更强的UI控制能力和更稳定的状态管理。

### Gradio

专门用于快速构建机器学习模型演示,特别适合需要实时交互的AI演示场景。其简洁的API让你能够快速将模型部署为交互式Web界面。

- **与NiceGUI相比**:Gradio在原型构建速度上更有优势,但与Streamlit一样,在复杂UI定制方面受限。NiceGUI提供更丰富的布局和设计能力。

### Dash(Plotly)

一个基于React和Flask构建的成熟Web应用框架,非常适合构建复杂的企业级仪表盘。对于需要长期维护的商业项目,Dash的生态系统更为成熟。

- **与NiceGUI相比**:Dash在工程化和可扩展性方面更强,但需要更多前端知识。NiceGUI更适合希望在纯Python环境中获得良好UI控制能力的开发者。

### 选型指南

2026年Python UI框架分级列表:

| 层级 | 代表框架 | 特点 |
|------|----------------|------|
| 超快速原型开发 | Streamlit、Gradio | 30分钟内完成MVP,对AI生成友好 |
| 轻量级产品 | NiceGUI、Flet | 兼顾设计与打磨,适合独立开发者 |
| 工程化Web | Reflex、Python + React | 适合长期商业项目 |
| 本地重型应用 | PySide6、Dear PyGui | 适合离线高性能应用 |

如果你觉得Streamlit过于"玩具化",但又不想编写JavaScript,NiceGUI是理想的选择。

---

## 5. 安装与配置

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

无需安装任何Python包,也可以直接使用Docker运行。

```bash
docker run -it --rm -p 8888:8080 -v "$PWD":/app zauberzeug/nicegui
```

---

## 6. 第一个应用

创建一个`main.py`文件。

```python
from nicegui import ui

# 创建一个标签
ui.label('Hello NiceGUI!')

# 点击后显示通知的按钮
ui.button('Click me', on_click=lambda: ui.notify('Button clicked!'))

# 运行应用
ui.run()
```

运行应用:

```bash
python main.py
```

应用将运行在`http://localhost:8080`。修改代码后,NiceGUI会自动重新加载页面。

---

## 7. 基础UI组件

```python
from nicegui import ui

# 文本标签
ui.label('This is a label').classes('text-h4')

# 按钮
ui.button('Save', on_click=lambda: ui.notify('Saved'))

# 开关
ui.switch('Enable feature')

# 滑块
ui.slider(min=0, max=100, value=50)

# 输入框
ui.input('Enter your name')

# 下拉选择
ui.select(['Option A', 'Option B', 'Option C'], value='Option A')

# 布局:行与列
with ui.row():
    ui.button('Button 1')
    ui.button('Button 2')
    ui.button('Button 3')

ui.run()
```

---

## 8. 状态化交互

NiceGUI采用事件驱动模型,因此可以直接在回调函数中处理状态。

```python
from nicegui import ui

# 状态变量
count = 0

# 用于显示计数的标签
label = ui.label('Count: 0')

def increment():
    global count
    count += 1
    label.set_text(f'Count: {count}')

ui.button('Increment', on_click=increment)
ui.button('Reset', on_click=lambda: (globals().update(count=0), label.set_text('Count: 0')))

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

ui.button('Update chart', on_click=update)
ui.run()
```

---

## 10. 其他资源

- 官方文档:[https://nicegui.io/documentation](https://nicegui.io/documentation)
- GitHub仓库:[https://github.com/zauberzeug/nicegui](https://github.com/zauberzeug/nicegui)
- 社区项目与教程:[https://github.com/zauberzeug/nicegui/wiki](https://github.com/zauberzeug/nicegui/wiki)
