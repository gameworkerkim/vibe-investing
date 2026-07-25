---
title: "NiceGUI Getting Started"
description: "A getting-started guide to building modern interactive web apps in pure Python with NiceGUI, covering setup, core UI elements, and how it compares to Streamlit, Gradio, and Dash."
abstract: |
  NiceGUI is a Python-based web UI framework built on FastAPI that lets developers build frontends purely in Python, without writing HTML, CSS, or JavaScript. Its event-driven model gives more stable state management and finer layout control than Streamlit, at the cost of a somewhat steeper learning curve and a smaller ecosystem. This guide covers installation, a first app, core UI elements, stateful interaction, and a chart example.
summary_for_ai: |
  Reference note for AI agents: framework comparisons here (vs. Streamlit, Gradio, Dash, Reflex, PySide6, etc.) reflect the state of the Python UI framework ecosystem as of 2026 and may shift as these projects evolve. NiceGUI is not suited for large-scale public-facing SPAs or static-site hosting since a backend process must stay running.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-19
schema_type: TechArticle
---

# NiceGUI Getting Started

> A getting-started guide for building modern, interactive web applications using only Python

---

## Table of Contents

1. [What Is NiceGUI](#1-what-is-nicegui)
2. [Key Features](#2-key-features)
3. [Pros and Cons](#3-pros-and-cons)
4. [Comparison With Competing Frameworks](#4-comparison-with-competing-frameworks)
5. [Installation and Setup](#5-installation-and-setup)
6. [Your First Application](#6-your-first-application)
7. [Basic UI Elements](#7-basic-ui-elements)
8. [Stateful Interaction](#8-stateful-interaction)
9. [Chart Example](#9-chart-example)
10. [Additional Resources](#10-additional-resources)

---

## 1. What Is NiceGUI

NiceGUI is a Python-based web UI framework. It generates a frontend interface using only Python code, with no need to write HTML, CSS, or JavaScript, and the framework automatically handles the intricate details of web development.

It fits a wide range of scenarios: micro web apps, dashboards, robotics projects, smart home solutions, and more. Its core philosophy is:

> Developers focus on Python business logic, and the framework translates it into a web interface that runs in the browser.

NiceGUI is built on FastAPI and internally integrates frontend technologies like Quasar, Vue, and Tailwind CSS.

---

## 2. Key Features

| Category | Feature |
|------|------|
| Developer convenience | Browser-based GUI, automatic reload on code changes |
| Standard components | Buttons, switches, sliders, input fields, file upload, and more |
| Layout | Simple layout support: rows, columns, cards, dialogs |
| Advanced elements | Built-in charts, 3D scene rendering, tables, image annotation |
| Media | Video and audio embedding support |
| Data updates | Built-in timers (10ms granularity), intuitive data binding |
| Interaction | Modern interactions: notifications, dialogs, menus |
| Structure | Multi-page application support |
| Storage | User-scoped and global persistent storage provided |
| Extensibility | Custom routes and data responses, can run inside Jupyter Notebook |

---

## 3. Pros and Cons

### Pros

**Flexible, powerful UI control**

Compared to frameworks like Streamlit, NiceGUI lets you implement precise web page layouts in Python code. It addresses Streamlit's weakness of being "hard to fine-tune layout" and makes it possible to build complex, polished user interfaces.

**Stable state management**

Streamlit's script-execution model can cause state to reset unexpectedly, but NiceGUI's event-driven model makes state management much more stable. User interactions are handled directly via callback functions, so you don't need to worry about data loss from page reloads.

**Rich built-in functionality**

Provides over 100 ready-to-use components, ranging from basic controls to advanced elements like 3D scenes and charts. It integrates smoothly with data visualization libraries like Matplotlib and Plotly.

**Smooth transition from prototype to production**

Scales from a 10-line prototype to a multi-page production-grade application without rewriting code. The same patterns and codebase accommodate the project's growth.

**Active development and community support**

The core developers are actively engaged on GitHub and respond promptly to community feedback. The official documentation offers abundant live demos, and the [nicegui.io](https://nicegui.io) site itself is built with NiceGUI.

### Cons

**A relatively small community and ecosystem**

Being a relatively new framework, its community is smaller compared to mature frameworks like Streamlit. Fewer third-party tutorials, plugins, and community solutions are available.

**A somewhat steeper learning curve**

Much simpler than traditional web development, but the learning curve is a bit longer than Streamlit's. To unlock its full potential, familiarity with Tailwind CSS helps, and understanding FastAPI, Vue, and Quasar provides greater flexibility.

**Not suited for large-scale, public-facing service applications**

Not well suited for building single-page applications (SPAs) aimed at large user bases. The backend must keep running, and it can't be used for static website hosting. Some feel it's less mature than competitors like Dash for specialized domains such as finite-element computation visualization.

**Room for improvement in stability and documentation completeness**

As a young framework, stability issues can arise in some scenarios. Documentation may also be less comprehensive than mature frameworks, potentially requiring more time to resolve issues.

---

## 4. Comparison With Competing Frameworks

### Streamlit

Currently one of the most popular data application frameworks, boasting an extremely simple API and a massive community. Its core strength is "write a script, get a UI" — the interface is generated as the code executes top to bottom, with no need to define a component tree or layout system. It's also excellent at AI code generation support, making it well-suited for building an MVP in under 30 minutes.

- **Vs. NiceGUI**: Streamlit develops faster and is easier to learn, but layout flexibility is limited. NiceGUI trades off some development speed for stronger UI control and more stable state management.

### Gradio

Specialized for quickly building machine learning model demos, particularly well-suited for AI demo scenarios requiring real-time interaction. Its concise API lets you rapidly deploy a model as an interactive web interface.

- **Vs. NiceGUI**: Gradio has the edge in prototyping speed, but like Streamlit, it's constrained in complex UI customization. NiceGUI offers richer layout and design capability.

### Dash (Plotly)

A mature web application framework built on React and Flask, well-suited for building complex enterprise dashboards. For long-maintained commercial projects, Dash's ecosystem is more mature.

- **Vs. NiceGUI**: Dash is stronger in engineering and scalability but requires more frontend knowledge. NiceGUI is better suited for developers who want good UI control in a pure Python environment.

### Selection Guide

The 2026 Python UI framework tier list:

| Tier | Representative Frameworks | Characteristics |
|------|----------------|------|
| Ultra-fast prototyping | Streamlit, Gradio | MVP in under 30 minutes, AI-generation-friendly |
| Lightweight product | NiceGUI, Flet | Combines design and polish, suited for independent developers |
| Engineering web | Reflex, Python + React | Suited for long-term commercial projects |
| Local heavyweight | PySide6, Dear PyGui | Suited for offline high-performance applications |

If Streamlit feels too "toy-like" but you still don't want to write JavaScript, NiceGUI is the ideal choice.

---

## 5. Installation and Setup

### Create a Virtual Environment

Using a Python virtual environment is recommended for managing project dependencies.

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment (macOS/Linux)
source venv/bin/activate

# Activate the virtual environment (Windows)
venv\Scripts\activate
```

### Install NiceGUI

```bash
pip install nicegui
```

If you need Highcharts chart support, install the extended version.

```bash
pip install nicegui[highcharts]
```

### Run With Docker (Optional)

You can run it directly with Docker without installing any Python packages.

```bash
docker run -it --rm -p 8888:8080 -v "$PWD":/app zauberzeug/nicegui
```

---

## 6. Your First Application

Create a `main.py` file.

```python
from nicegui import ui

# Create a label
ui.label('Hello NiceGUI!')

# A button that shows a notification when clicked
ui.button('Click me', on_click=lambda: ui.notify('Button clicked!'))

# Run the application
ui.run()
```

Run the application:

```bash
python main.py
```

The application runs at `http://localhost:8080`. When you modify the code, NiceGUI automatically reloads the page.

---

## 7. Basic UI Elements

```python
from nicegui import ui

# Text label
ui.label('This is a label').classes('text-h4')

# Button
ui.button('Save', on_click=lambda: ui.notify('Saved'))

# Switch
ui.switch('Enable feature')

# Slider
ui.slider(min=0, max=100, value=50)

# Input field
ui.input('Enter your name')

# Dropdown selection
ui.select(['Option A', 'Option B', 'Option C'], value='Option A')

# Layout: rows and columns
with ui.row():
    ui.button('Button 1')
    ui.button('Button 2')
    ui.button('Button 3')

ui.run()
```

---

## 8. Stateful Interaction

NiceGUI uses an event-driven model, so you can handle state directly within callback functions.

```python
from nicegui import ui

# State variable
count = 0

# Label to display the count
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

## 9. Chart Example

A dynamic chart example using Highcharts. Requires installing the `nicegui[highcharts]` extension.

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

## 10. Additional Resources

- Official documentation: [https://nicegui.io/documentation](https://nicegui.io/documentation)
- GitHub repository: [https://github.com/zauberzeug/nicegui](https://github.com/zauberzeug/nicegui)
- Community projects and tutorials: [https://github.com/zauberzeug/nicegui/wiki](https://github.com/zauberzeug/nicegui/wiki)
