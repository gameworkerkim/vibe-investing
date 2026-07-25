---
title: "利用 GitHub 仓库与 jsDelivr CDN 托管 JSON 文件指南"
description: "将 GitHub 公开仓库与 jsDelivr CDN 结合，免费托管 JSON 文件并向全球快速分发的分步操作指南"
lang: zh
featured: false
schema_type: TechArticle
---

# 利用 GitHub 仓库与 jsDelivr CDN 托管 JSON 文件指南

将 GitHub 的公开仓库与 jsDelivr CDN 结合，可以免费托管 JSON 文件，并向全球快速分发。

本指南整理了适合新手轻松跟随的分步操作流程，以及限制事项和运维注意事项。


# 目录

1. 创建 GitHub 仓库
2. 上传 JSON 文件
3. 生成 jsDelivr CDN 地址
4. 使用与验证 CDN 地址
5. 重要参考事项
6. 参考资料



# 第 1 步:创建 GitHub 仓库

## 创建仓库步骤

1. 登录 GitHub
2. 点击右上角的 + 按钮
3. 选择 New repository
4. 输入仓库名称

示例:

text my-json-data

5. 将仓库设置为公开

text Public

> jsDelivr 仅支持公开仓库。

6. 勾选 Add a README file
7. 点击 Create repository



# 第 2 步:上传 JSON 文件

在创建好的仓库中:

1. Add file
2. Upload files
3. 上传 JSON 文件
4. 点击 Commit changes

示例结构:

text my-json-data/ ├── README.md └── data.json



# 第 3 步:生成 jsDelivr CDN 地址

## 基本 URL 格式

text https://cdn.jsdelivr.net/gh/用户名/仓库名/文件路径

### 示例

| 项目 | 值 |
|--------|--------|
| 用户名 | honggildong |
| 仓库名 | my-json-data |
| 文件名 | data.json |

生成的 URL:

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json



## URL 结构说明

text https://cdn.jsdelivr.net/gh/user/repo@version/file

| 项目 | 说明 |
|--------|--------|
| user | GitHub 用户名或组织名 |
| repo | 仓库名 |
| version | 分支、标签或提交哈希 |
| file | 文件路径 |

示例:

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data@v1.0.0/data.json



# 第 4 步:使用与验证 CDN 地址

## 浏览器验证

将生成的 URL 输入浏览器地址栏。

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json

若显示 JSON 内容,即表示成功。



## 在 JavaScript 中使用

html <script> fetch('https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json')   .then(response => response.json())   .then(data => console.log(data))   .catch(error => console.error(error)); </script>



## cURL 测试

bash curl https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json



# 重要参考事项

## 1. 缓存问题与版本管理

jsDelivr 积极使用 CDN 缓存。

### 常规缓存策略

| 方式 | 缓存时长 |
|--------|--------|
| 分支引用 | 约 12 小时 |
| @latest | 最长 7 天 |

因此,即使修改了文件,也可能无法立即生效。



## 推荐做法:使用 Git 标签

### 创建 Release

1. 进入仓库
2. Releases
3. Draft a new release
4. 输入版本号

示例:

text v1.0.0 v1.0.1 v1.1.0

5. Publish release



### 使用固定版本的 URL

text https://cdn.jsdelivr.net/gh/用户名/仓库名@v1.0.0/data.json



### 标签 URL 的缓存策略

- 最长缓存 1 年
- 永久存储于 S3

生产环境服务建议使用标签 URL。



## 2. GitHub 仓库大小限制

| 项目 | 限制 |
|--------|--------|
| 建议仓库大小 | 小于 1GB |
| GitHub 警告阈值 | 超过 1GB |
| 单文件限制 | 100MB |
| 非官方最大限制 | 约 5GB |



## GitHub Packages 数据传输量

Free 套餐标准:

text 每月 1GB



## 3. jsDelivr 带宽限制

### 优点

jsDelivr 本身

- 无带宽限制
- 免费使用
- 全球 CDN



### 参考

GitHub Pages 存在单独的限制

text 每月 100GB



## 4. jsDelivr 使用限制

| 项目 | 限制 |
|--------|--------|
| 包大小 | 150MB |
| 单个文件 | 20MB |
| HTML 文件 | 以 text/plain 形式提供 |



### 不支持的情况

text Packages larger than 150 MB Single files larger than 20 MB



## 5. 缓存清除(Purge)

需要紧急刷新缓存时使用。

### cURL 示例

bash curl https://purge.jsdelivr.net/gh/用户名/仓库名@版本/文件路径

示例:

bash curl https://purge.jsdelivr.net/gh/honggildong/my-json-data@v1.0.0/data.json



### Web 界面

使用 jsDelivr 官方 Purge Tool

text https://www.jsdelivr.com/tools/purge



# 参考资料

| 资料 | 说明 |
|--------|--------|
| jsDelivr 官方主页 | CDN 服务 |
| jsDelivr GitHub 仓库 | 源代码 |
| jsDelivr Purge Tool | 清除缓存 |
| GitHub 仓库限制文档 | 仓库容量政策 |
| GitHub Billing Docs | 数据传输政策 |
| jsDelivr GitHub Delivery Docs | URL 结构与缓存策略 |



# 运维检查清单

- [ ] 创建 GitHub 公开仓库
- [ ] 上传 JSON 文件
- [ ] 生成 jsDelivr URL
- [ ] 完成浏览器测试
- [ ] 完成 JavaScript fetch 测试
- [ ] 创建 Git Release 标签
- [ ] 应用版本 URL
- [ ] 确认缓存策略
- [ ] 监控数据传输量

---

# 注意事项

此方法适用于以下用途。

- 个人项目
- 开发与测试
- 小规模服务
- 配置文件(JSON)分发
- 静态数据提供

在以下环境中,建议使用单独的 CDN 或对象存储。

- 大规模商用服务
- 金融系统
- 关键业务(mission-critical)服务
- 实时大容量数据服务

如果将 GitHub 仓库过度用作单纯的文件存储,可能违反 GitHub 使用条款,需要注意。



## 结论

GitHub + jsDelivr 的组合是一种免费却非常强大的静态 JSON 分发方式。

尤其适用于:

- API 配置文件
- LLM 提示词数据
- 股票/加密货币元数据
- 需要版本管理的静态数据

的分发场景,若同时配合基于 Git 标签的版本管理,也可以实现稳定的生产环境运维。
