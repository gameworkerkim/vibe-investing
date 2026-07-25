---
title: "Pyodide 技术文档(核查与扩展版)"
description: "对基于 WebAssembly、可在浏览器和 Node.js 中运行 Python 的 CPython 发行版 Pyodide 进行事实核查与扩展的技术指南，涵盖 PEP 783、性能、内存限制与快速上手。"
abstract: |
  Pyodide 将完整的 CPython 解释器编译为 WebAssembly，使 Python 可以无需服务器、直接在浏览器中运行。
  本指南对版本体系、性能、内存限制、C 扩展支持等广泛流传的说法进行了核查，
  并补充了 JS-Python FFI、Web Worker 模式、虚拟文件系统以及开发工具生态。
  最后提供快速上手步骤，并与 PyScript、MicroPython、Brython、Skulpt、Transcrypt 及 CPython WASI 构建版本进行对比。
summary_for_ai: |
  本文是截至 2026-07-19 关于 Pyodide 的核查与扩展版技术资料（最新稳定版 314.0.x，基于 Python 3.14，MPL-2.0 许可）。
  对常见流传说法的主要更正：版本体系现已与 Python 版本联动（0.29.x 到 314.x）；内存可用至 wasm32 地址空间上限的 4GB（并非旧版所称的 2GB 上限）；
  借助 PEP 783 通过 PyPI 分发 pyemscripten wheel，C 扩展支持不断扩大，NumPy、SciPy、cryptography 等 250 多个扩展已完成移植。
  内容涵盖 JS-Python FFI（PyProxy/JsProxy、自动类型转换、BigInt 往返转换）、Web Worker 执行模式、Emscripten 虚拟文件系统（MEMFS/IDBFS）、
  双轨包加载方式（loadPackage 与 micropip）、开发工具生态（pyodide-build、pytest-pyodide、pyodide-pack）。
  提供浏览器 CDN 配置、NumPy 使用、micropip 安装、JS-Python 数据交换、异步 fetch、Web Worker 架构、Node.js 使用、自定义 wheel 构建的可运行代码示例。
  最后给出与 PyScript、MicroPython(WASM)、Brython、Skulpt、Transcrypt、CPython WASI 构建版本的对比表、选型指南以及适用/不适用场景。
date: 2026-07-19
author: "Dennis Kim"
lang: zh
tags:
  - Python
  - WebAssembly
  - Pyodide
  - 浏览器
  - 数据科学
keywords:
  - Pyodide
  - 浏览器中的 Python
  - WebAssembly Python
  - PEP 783
  - CPython WASM
  - JupyterLite
featured: false
schema_type: TechArticle
draft: false
---

# Pyodide 技术文档(核查与扩展版)

- 撰写基准日期: 2026-07-19
- 最新稳定版本: Pyodide 314.0.x(基于 Python 3.14)
- 许可证: MPL-2.0
- 官方网站: https://pyodide.org

---

## 1. 什么是 Pyodide？

Pyodide 是一个基于 **WebAssembly** 和 **Emscripten**、将完整 CPython 解释器整体编译而成的**面向浏览器与 Node.js 的 Python 发行版**。它可以让 Python 代码无需服务器、直接在浏览器中运行，最初起源于 2018 年 Mozilla 内部项目（iodide），2019 年之后发展为独立的社区项目。

### 核查说明(截至 2026 年 7 月)

| 项目 | 原文表述 | 核查结果 |
|------|-----------|-----------|
| 项目起源 | 2018 年由 Mozilla 发起 | 准确 |
| 版本体系 | 未提及 | **已变更。**自 2026 年 6 月起，版本体系转为与 Python 版本联动(0.29.x → 314.x，对应 Python 3.14)。主版本每年与 Python 上游同步一次 |
| 性能 | 比原生慢 3～5 倍 | 大体准确。纯 Python 代码约慢 3～5 倍，经 WASM 编译的 C 代码约慢 2～2.5 倍 |
| 内存限制 | 约 2GB | **为旧版本标准。**目前可使用至 wasm32 地址空间上限的 4GB。此前 2GB 以上地址空间相关的 bug 也已在近期修复 |
| C 扩展包 | 未移植则无法使用 | **需要放宽表述。**PEP 783 的采纳使 pyemscripten 平台标签的二进制 wheel 可正式发布到 PyPI。NumPy、SciPy、cryptography 等 250 多个 C/C++/Rust 扩展已完成移植 |
| stdlib 打包 | 未提及 | 从 314.0 起，sqlite3、lzma 已包含在默认打包中(不再从中剔除) |

---

## 2. 主要特性

| 特性 | 说明 |
|------|------|
| 浏览器内 Python 执行 | 无需服务器，在 Web 浏览器中运行 CPython 3.14 |
| JavaScript-Python FFI | 双向对象自动转换、错误传播、async/await 双向支持 |
| 内置科学计算栈 | 预构建提供 NumPy、pandas、SciPy、Matplotlib、scikit-learn 等 |
| micropip | 安装 PyPI 上的纯 Python wheel 及 pyemscripten wheel |
| Web API 访问 | 可访问全部浏览器 API，如 DOM、fetch、Canvas 等 |
| Node.js 支持 | 通过 npm 包(`pyodide`)在服务端/CLI 环境中运行 |
| PEP 783 标准化 | 确立了 Emscripten wheel 正式发布至 PyPI 的路径(2026 年) |

---

## 3. 补充功能(原文未涵盖项目)

### 3.1 JavaScript ↔ Python FFI 细节

- 基于代理的互操作：`PyProxy`(在 JS 中引用 Python 对象)、`JsProxy`(在 Python 中引用 JS 对象)
- 自动类型转换：JS Array ↔ Python list，JS Map ↔ Python dict，TypedArray ↔ memoryview
- BigInt 往返转换：从 314.0 起引入 `pyodide.ffi.JsBigInt`，支持超过 2^53 的整数与 JS bigint 之间的往返转换
- 异常互相传播：一种语言中抛出的异常可以在另一种语言中被捕获

### 3.2 在 Web Worker 中运行

为避免阻塞主线程，在 Web Worker 中运行 Pyodide 已成为事实上的标准做法。将繁重计算(pandas 处理、模型推理)隔离到 worker 中，仅通过 `postMessage` 交换结果。

### 3.3 虚拟文件系统(Emscripten FS)

- 默认使用基于内存的 MEMFS，也可通过基于 IndexedDB 的 IDBFS 实现浏览器会话间的持久化
- 通过 `pyodide.FS` API 可在 JS 侧直接控制文件的读写

### 3.4 双轨包加载方式

| 方式 | 用途 |
|------|------|
| `pyodide.loadPackage()` | 加载 Pyodide CDN 上预构建的包(如 NumPy) |
| `micropip.install()` | 安装 PyPI 上的纯 Python wheel 及 pyemscripten wheel |
| `loadPackagesFromImports()` | 分析代码中的 import 语句并自动加载所需的包 |

### 3.5 开发工具生态

| 工具 | 功能 |
|------|------|
| pyodide-build | 将 C/Rust 扩展包交叉编译为 pyemscripten wheel |
| pytest-pyodide | 在 Chrome/Firefox/Node 运行时中自动化针对 Pyodide 的测试 |
| pyodide-pack | 最小化发布用打包(移除未使用的模块) |
| auditwheel-emscripten | Emscripten wheel 校验工具 |
| Pyodide CLI | 在终端中通过 `pyodide` 命令创建类似 venv 的环境并运行 REPL |

### 3.6 SharedArrayBuffer 与同步输入输出

配置 COOP/COEP 头之后，可基于 SharedArrayBuffer 实现 worker 与主线程之间的同步通信，从而模拟 `input()` 等同步式标准输入。

---

## 4. 优点

1. **降低服务器成本，简化基础设施** —— Python 计算在客户端完成，服务器只需处理认证、数据库等必要工作。计算成本不会随用户数量成比例增长。
2. **无需安装，即刻运行** —— 仅凭浏览器即可运行 Python。首次加载后可离线运行。
3. **与 JavaScript 的完全集成** —— 双向自动转换、异常传播、支持 async/await。
4. **丰富的科学计算生态** —— 无需额外配置即可使用数据科学必备库。
5. **非常适合教育与交互式内容** —— 可借助 JupyterLite 等工具搭建无服务器笔记本环境。学生代码被隔离在浏览器沙箱中，不存在服务器端安全风险。
6. **(新增)打包标准化** —— PEP 783 的采纳使包作者可直接向 PyPI 发布 Emscripten wheel。同一 Python 版本下不同 Pyodide 发行版之间的 wheel 兼容性得到保证。

---

## 5. 缺点

1. **性能下降** —— 纯 Python 代码比原生慢约 3～5 倍，经 WASM 编译的 C 代码慢约 2～2.5 倍。根本原因在于没有 JIT 的解释执行方式。
2. **内存限制** —— 受 wasm32 地址空间限制，最大约 4GB。仅初始加载就会占用数百 MB，在低配置设备上同时打开多个标签页会造成负担。(旧版本的 2GB 硬性限制已解除)
3. **初始加载体积** —— 核心运行时本身就有数 MB，加载 NumPy/pandas 等还需额外下载数十 MB。缓存策略(Service Worker、CDN)几乎是必需的。
4. **包覆盖范围的局限** —— 经 PEP 783 大幅改善，但依赖操作系统的功能(多进程、底层套接字、同步 sleep 等)依然受限。并非对 CPython 的完全等价实现。
5. **网络请求限制** —— 受浏览器 CORS 策略约束。需要使用 `pyodide.http.pyfetch` 代替 `requests`，或通过代理绕过限制。
6. **浏览器要求** —— 需要支持 WebAssembly 的现代浏览器。依赖 SharedArrayBuffer 的功能还需额外配置 COOP/COEP 头。

---

## 6. 快速上手

### 6.1 浏览器：一行 CDN 即可开始

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.js"></script>
</head>
<body>
  <script type="module">
    const pyodide = await loadPyodide();
    // 基本执行
    console.log(pyodide.runPython("1 + 2"));  // 3

    // 多行 Python 代码
    pyodide.runPython(`
      import sys
      print(f"Python {sys.version} in the browser")
    `);
  </script>
</body>
</html>
```

版本号字符串(`v314.0.2`)在部署时必须锁定，不能在生产环境中使用如 `dev` 这样的非版本化 URL。

### 6.2 加载预构建包(以 NumPy 为例)

```javascript
await pyodide.loadPackage("numpy");
pyodide.runPython(`
  import numpy as np
  a = np.random.rand(1000, 1000)
  print(a.mean())
`);
```

### 6.3 使用 micropip 安装 PyPI 包

```javascript
await pyodide.loadPackage("micropip");
const micropip = pyodide.pyimport("micropip");
await micropip.install("cowsay");   // 纯 Python wheel
pyodide.runPython(`
  import cowsay
  cowsay.cow("Hello from PyPI")
`);
```

### 6.4 JavaScript 与 Python 之间的数据交换

```javascript
// JS → Python
pyodide.globals.set("js_data", [10, 20, 30]);
const result = pyodide.runPython(`
  data = js_data.to_py()      # JsProxy → Python list
  sum(data)
`);
console.log(result);  // 60

// Python → JS
const pyDict = pyodide.runPython(`{"cn": "北京", "jp": "东京"}`);
console.log(pyDict.toJs());   // Map(2) { "cn" → "北京", ... }
pyDict.destroy();             // 释放 PyProxy 内存(防止泄漏)
```

### 6.5 异步执行与网络请求

```javascript
await pyodide.loadPackage("micropip");
const out = await pyodide.runPythonAsync(`
  from pyodide.http import pyfetch
  resp = await pyfetch("https://api.github.com/repos/pyodide/pyodide")
  data = await resp.json()
  data["stargazers_count"]
`);
```

### 6.6 Web Worker 模式(推荐的生产环境结构)

```javascript
// worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.js");

let pyodideReady = loadPyodide();

self.onmessage = async (e) => {
  const pyodide = await pyodideReady;
  await pyodide.loadPackagesFromImports(e.data.code);
  const result = await pyodide.runPythonAsync(e.data.code);
  self.postMessage({ result });
};
```

```javascript
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ code: "import numpy as np; float(np.pi)" });
worker.onmessage = (e) => console.log(e.data.result);
```

### 6.7 在 Node.js 中使用

```bash
npm install pyodide
```

```javascript
import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide();
console.log(pyodide.runPython("2 ** 10"));  // 1024
```

### 6.8 构建自有包(C/Rust 扩展)

```bash
pip install pyodide-build
pyodide build            # 在项目根目录生成 pyemscripten wheel
```

生成的 wheel 可依据 PEP 783 标准直接上传至 PyPI，并可通过 micropip 安装。

---

## 7. 与竞品的比较

在浏览器中运行 Python 的方式大致可分为三类：(A) 将 CPython 本身移植为 WASM；(B) 用 JavaScript 重新实现 Python 解释器；(C) 将 Python 代码转译为 JavaScript。

| 产品 | 方式 | 优势 | 劣势 | 主要用途 |
|------|-----------|------|------|---------|
| **Pyodide** | (A) CPython → WASM | 完全兼容 CPython、科学计算栈、PEP 783 标准化 | 初始加载体积、解释器速度 | 数据科学、通用场景 |
| **PyScript** | 构建于 Pyodide/MicroPython 之上的框架 | 仅用 HTML 标签即可嵌入 Python，入门门槛最低 | 并非独立运行时(底层依赖 Pyodide)，存在抽象层开销 | 教育、原型开发、小组件 |
| **MicroPython (WASM)** | 轻量级 Python 重新实现 → WASM | 加载体积仅为数百 KB 级别，启动速度最佳 | 标准库/CPython 兼容性大幅缩水，无 C 扩展生态 | 轻量脚本、嵌入式组件 |
| **Brython** | (B) 用 JS 重新实现解释器 | 加载轻量，通过 `text/python` 脚本标签操作 DOM 自然，简单运算速度接近 CPython | 无法使用 NumPy 等 C 扩展，复杂运算的性能差异较大 | 以 DOM 为中心的 Web 脚本 |
| **Skulpt** | (B) 用 JS 重新实现解释器 | 完全客户端执行，已在教育平台(如 Anvil)中得到验证 | 比 CPython 慢数十倍，Python 功能覆盖有限 | 初级编程教育、教程 |
| **Transcrypt** | (C) Python → JS 转译 | 输出为纯 JS，加载/运行速度快，可直接使用 JS 库 | 非运行时解释器(动态特性受限)，需要构建步骤 | 用 Python 语法编写前端应用 |
| **CPython WASI 构建版本** | (A) CPython → WASI | 获 CPython 官方上游支持(tier 2)，适合无服务器/边缘运行时 | 浏览器集成(FFI、DOM)不如 Pyodide 成熟 | 边缘计算、沙箱执行 |

### 衍生生态(基于 Pyodide 构建的产品，而非竞品)

| 产品 | 说明 |
|------|------|
| JupyterLite | 无服务器的浏览器内 Jupyter 笔记本，内核使用 Pyodide |
| stlite | 在浏览器中以无服务器方式运行 Streamlit 应用 |
| marimo(WASM 模式) | 响应式 Python 笔记本的浏览器执行版本 |
| Cloudflare Workers Python | 在边缘运行时中利用 Pyodide 提供 Python 支持 |

### 选型指南

| 需求 | 推荐 |
|----------|------|
| 需要 NumPy/pandas 等科学计算栈 | Pyodide |
| 只需用 HTML 快速嵌入 Python | PyScript |
| 加载体积优先(数百 KB) | MicroPython(WASM)或 Brython |
| 以 DOM 操作为中心的轻量脚本 | Brython |
| 初级编程教育平台 | Skulpt 或 PyScript |
| 将构建产物以 JS 形式发布 | Transcrypt |
| 无服务器/边缘沙箱执行 | CPython WASI 或 Pyodide(Node) |

---

## 8. 应用场景总结

| 适合的场景 | 不适合的场景 |
|------------|--------------|
| 教育类交互式内容 | 大规模数据处理(数 GB 以上) |
| 原型开发与演示 | 需要实时低延迟的应用 |
| 科学计算可视化、浏览器内分析工具 | 复杂的网络/套接字操作 |
| 无服务器 Python 应用 | 多进程等依赖操作系统的负载 |
| 在客户端处理敏感数据(数据不离开浏览器) | 需要使用所有 PyPI 包的场景 |

---

## 9. 结论

Pyodide 从最初开启“无需服务器即可在网页上运行 Python”这一可能性的项目，随着 2026 年 PEP 783 的采纳以及与 Python 版本联动的发布体系的引入，已确立为**浏览器 Python 事实上的标准平台**。性能(比原生慢 3～5 倍)与初始加载体积这两个结构性限制依然存在，因此更适合应用于教育、可视化、客户端数据处理及无服务器工具，而非计算密集型负载。基本原则是：若轻量化是首要考量，选择 MicroPython/Brython 系列；若需要完整的 CPython 生态，则选择 Pyodide。
