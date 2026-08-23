# CampusPilot
# XJTLU Virtual Campus · SURF Campus Platform

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.7.0-176341" alt="version">
  <img src="https://img.shields.io/badge/python-3.9+-blue" alt="python">
  <img src="https://img.shields.io/badge/framework-FastAPI-009688" alt="fastapi">
  <img src="https://img.shields.io/badge/AI-Function%20Calling-8b5cf6" alt="ai">
</p>

> 西交利物浦大学 Summer Undergraduate Research Fellowship（SURF）项目
> 一个面向 XJTLU 师生的 **AI 校园互动平台**——用自然语言对话，一站式搞定课表、资料、消息、社团与匿名社交。

---

## 📖 项目简介

XJTLU Virtual Campus 是一个基于 **AI Function Calling** 的校园互动平台。学生通过自然语言与 AI 助手对话，即可完成查课表、找教授、搜资料、报名活动等操作；同时提供信息门户、学术中心、校园通讯、社区、匿名树洞、组队匹配等完整的校园社交功能。

**核心亮点**：把复杂的校园信息系统，收敛成一个「会说人话的 AI 助手」。

---

## 🖼️ 界面预览

| 桌面端 | 移动端 |
|:---:|:---:|
| ![桌面端](docs/screenshots/surf-desktop.png) | ![移动端](docs/screenshots/surf-mobile.png) |

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 🤖 **AI 校园助手** | 自然语言对话：查课表、找教授、搜资料、报名活动 |
| 📬 **信息门户** | 统一消息收件箱、智能分类、搜索 |
| 📚 **学术中心** | 课程资料库（以一换一）、问答区、教授信息、DDL 看板 |
| 💬 **校园通讯** | 全校通讯录、私聊、群聊 |
| 🌍 **社区内容** | 动态广场、图文发布、评论互动、点赞 |
| 🌳 **匿名树洞** | 安全匿名的倾诉空间 |
| 🎪 **社团活动** | 活动发布、日历、一键报名 |
| 👥 **组队匹配** | 团队招募、智能推荐 |

---

## 📚 目录

- [项目简介](#-项目简介)
- [界面预览](#️-界面预览)
- [功能特性](#-功能特性)
- [快速开始](#-快速开始)
- [认证与核心 API](#-认证与核心-api)
- [WorkBuddy 配置](#-workbuddy-配置导入)
- [项目结构](#-项目结构)
- [技术栈](#-技术栈)
- [版本记录](#-版本记录)

---

## 🚀 快速开始

### 前提条件

- Python 3.9+
- pip

### 启动后端

```bash
cd surf-campus/backend

# 安装依赖
pip install -r requirements.txt

# 首次运行：初始化数据库（JSON → SQLite 迁移，幂等可重复执行）
python migrate.py

# 启动服务
python main.py
```

启动后访问：

| 地址 | 说明 |
|------|------|
| `http://localhost:8000/docs` | Swagger API 文档 |
| `http://localhost:8000/health` | 健康检查 |
| `POST http://localhost:8000/api/chat` | AI 对话 |

### 启动前端

用浏览器直接打开 `frontend/index.html` 即可（原生 HTML/CSS/JS，无构建步骤）。

---

## 🔐 认证与核心 API

### 用户认证（v0.6.0）

- 注册：`POST /api/auth/register`（自动登录，返回 token）
- 登录：`POST /api/auth/login`（用户名或邮箱 + 密码）
- 当前用户：`GET /api/auth/me`
- 修改资料：`PUT /api/auth/profile`

> 所有写操作（发帖/评论/点赞/举报/树洞/报名/私聊）都需要登录，请求头携带 `Authorization: Bearer <token>`。密码使用 PBKDF2 哈希，token 为 JWT（有效期 7 天）。

### 课程资料「以一换一」（v0.7.0）

每位同学每天 3 次免费下载，分享 1 份资料解锁 +2 次。资料列表/下载/分享：`GET/POST /api/courses/resources`、`GET /api/resources/file/{id}`、`POST /api/upload/resource`。

### 图片上传（v0.6.0）

- `POST /api/upload/image`（multipart，字段名 `file`，需登录）
- 支持 JPG/PNG/GIF/WebP，最大 5MB，魔数校验内容真实性
- 发帖带图：`POST /api/community/posts` 增加 `images` 参数

---

## 🧩 WorkBuddy 配置导入

### 导入 Agent

1. 打开 **WorkBuddy** → Agent / 技能管理
2. 创建新 Agent，填入：
   - Agent 名称：`XJTLU Campus Assistant`
   - 系统 Prompt：复制 `agent/SYSTEM_PROMPT.md`
   - 工具定义：参考 `agent/SKILL.md` 的 Function Calling 定义
3. 配置模型 → 选择 DeepSeek 或兼容的 Function Calling 模型
4. 连接后端 → API Base URL 指向 `http://localhost:8000`

---

## 📁 项目结构

```
surf-campus/
├── agent/                    # WorkBuddy Agent 配置
│   ├── SKILL.md              # Skill 定义（Function Calling）
│   └── SYSTEM_PROMPT.md      # AI 助手系统 Prompt
├── backend/                  # FastAPI 后端
│   ├── main.py               # 入口
│   ├── agent.py              # AI Agent 引擎
│   ├── auth.py               # JWT 认证
│   ├── config.py             # 配置
│   ├── tools/                # Function Calling 工具
│   │   ├── search.py         # 信息检索
│   │   ├── academic.py       # 课程与学术
│   │   ├── community.py      # 社区内容
│   │   ├── treehole.py       # 匿名树洞
│   │   ├── messaging.py      # 校园通讯
│   │   └── events.py         # 社团活动
│   └── data/                 # SQLite 数据库
├── frontend/                 # 前端（原生 HTML/CSS/JS）
│   ├── index.html
│   ├── demo.css
│   └── demo.js
├── docs/                     # 文档与截图
│   ├── screenshots/
│   └── DEPLOY.md
└── P0_FEATURES.md            # P0 功能清单与进度
```

---

## 🔧 技术栈

| 层 | 技术 |
|----|------|
| AI Agent | OpenAI Function Calling（兼容 DeepSeek / Ollama） |
| 后端框架 | FastAPI + Uvicorn |
| 存储 | SQLite（WAL 模式，并发安全） |
| 认证 | JWT + PBKDF2 密码哈希 |
| 前端 | 原生 HTML / CSS / JS（移动优先，响应式） |
| 开发平台 | WorkBuddy（腾讯版 OpenClaw） |

---

## 📌 版本记录

| 版本 | 说明 |
|------|------|
| **v0.7.0** | 核心 P0 功能 + SQLite + 用户认证（注册/登录/邮箱验证码/改密码）+ 图片上传 + 课程资料以一换一 |
| v0.6.0 | 用户认证 + 图片上传 |
| v0.5.0 | Mock 数据版本 |

> 部署指南见 `docs/DEPLOY.md`

---

## 🤝 团队协作

| 模块 | 说明 |
|------|------|
| AI Agent & Prompt | 维护 `agent/SYSTEM_PROMPT.md` |
| 后端 API | 维护 `backend/` 下的 REST API |
| WorkBuddy 配置 | `agent/SKILL.md` 的导入与测试 |
| 前端 | `frontend/` 的页面开发 |

**交接注意**：Windows 环境开发；依赖统一 `pip install -r requirements.txt`；Python ≥ 3.9；新增 API 需在文档注明。
