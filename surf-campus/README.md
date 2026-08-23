# XJTLU Virtual Campus — SURF Campus Platform

> 基于 WorkBuddy (腾讯版 OpenClaw) 的 AI 校园互动平台
> 西交利物浦大学 Summer Undergraduate Research Fellowship (SURF) 项目

---

## 📋 项目概览

为 XJTLU 师生打造的一站式校园互动平台，核心能力：

- **AI 校园助手** — 通过自然语言对话帮学生查课表、找教授、搜资料、报名活动
- **信息门户** — 统一消息收件箱、智能分类
- **学术中心** — 课程资料、问答区、教授信息
- **校园通讯** — 全校师生通讯录、私聊群聊
- **社区内容** — 动态广场、图文发布、评论互动
- **匿名树洞** — 安全匿名的倾诉空间
- **社团活动** — 活动发布、日历、一键报名
- **组队匹配** — 团队招募、智能推荐

---

## 🚀 快速启动

### 前提条件

- Python 3.9+
- pip (Python 包管理器)

### 启动后端

```bash
# 进入项目目录
cd surf-campus/backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

需要反复重启本地测试、暂时跳过登录时，使用开发专用启动脚本：

```bash
./start-dev.sh
```

它不会自动进入首页；本机输入 `19155147738` 和 `123456` 后可以直接提交手机号登录，不必先请求短信。生产环境不要开启 `SURF_DEV_AUTH_BYPASS` 或 `SURF_DEV_FIXED_PHONE_LOGIN`。

启动后访问：
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health
- AI 对话: POST http://localhost:8000/api/chat

### 学生端与管理端

后端启动后：

- 学生端：`http://localhost:8000/`，单列校园话题流、发布审核、Tag 聚合、聚合搜索、资料/问答和活动。
- 管理端：`http://localhost:8000/admin/`，Mock 角色可切换为平台管理员、内容审核员、教师/助教、活动组织者或学生（权限拒绝测试）。
- 管理写操作统一使用 `/api/admin/*`，前端不直接编辑 `backend/data/*.json`。
- P0 媒体存储在 `backend/uploads/`，资料文件存储在 `backend/resource_files/`；生产对象存储和真实 SSO 留在 P3。

身份权限：手机验证码登录默认只允许浏览、搜索和收藏；绑定 `@student.xjtlu.edu.cn` 或 `@xjtlu.edu.cn` 学校邮箱后才允许发帖、评论和点赞。手机号登录但未绑定邮箱不能互动。真实登录入口仍可使用 `XJTLU_OAUTH_CLIENT_ID`、`XJTLU_OAUTH_CLIENT_SECRET`、`XJTLU_OAUTH_REDIRECT_URI`、`XJTLU_OAUTH_TOKEN_URL` 和 `XJTLU_OAUTH_USERINFO_URL`，本地 `mock-bind` 只用于开发验收。

手机号验证码使用阿里云号码认证服务短信 API 时，在 `backend/.env` 注入 `SURF_SMS_PROVIDER=aliyun`、`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_SMS_SCHEME_NAME`、`ALIYUN_SMS_SIGN_NAME` 和 `ALIYUN_SMS_TEMPLATE_CODE`。发送和核验分别调用阿里云 `SendSmsVerifyCode` 与 `CheckSmsVerifyCode`；未配置真实凭据时使用 `SURF_SMS_PROVIDER=mock` 和本地验证码 `123456`。学校邮箱验证码目前保留 FastAPI SMTP 适配器，同时新增了独立的 `backend/mail-service/` Nodemailer 服务骨架，默认不发送邮件。

### 验证

```bash
cd surfplus/surf-campus
python3 -m py_compile backend/main.py backend/tools/*.py
/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/browser-smoke.cjs
# 服务运行后可执行完整本地回归（脚本会自动使用 PATH 中的 Node 或 Codex 本地运行时）
./scripts/verify-local.sh
```

`tests/vertical-e2e.cjs` 需要在临时 `SURF_DATA_DIR` 服务上运行，用于验证“学生发布 -> 管理审核 -> 学生可见”，不会污染默认 Mock 数据。

启动、数据隔离、Mock 角色和生产替换边界见 [`docs/DELIVERY.md`](docs/DELIVERY.md)。

---

## 🧩 WorkBuddy 配置导入指南

### 导入到 WorkBuddy

1. **打开 WorkBuddy** → 点击 Agent / 技能管理
2. **创建新 Agent** → 填入以下配置：
   - Agent 名称: `XJTLU Campus Assistant`
   - 系统 Prompt: 复制 `agent/SYSTEM_PROMPT.md` 的内容
   - 工具定义: 参考 `agent/SKILL.md` 的 Function Calling 定义
3. **配置模型** → 选择 DeepSeek 或兼容的 Function Calling 模型
4. **连接后端** → 在 WorkBuddy 中配置 API Base URL 指向本地后端:
   - 本地: `http://localhost:8000`
   - 局域网: `http://<你的IP>:8000`

### Skill 安装 (可选)

如果 WorkBuddy 支持导入 SKILL.md，可以将 `agent/SKILL.md` 导入为自定义 Skill。

---

## 📁 项目结构

```
surf-campus/
├── README.md                        # 本文件
├── P0_FEATURES.md                   # P0 功能清单与进度
│
├── agent/                           # WorkBuddy Agent 配置
│   ├── SKILL.md                     # Skill 定义（WorkBuddy 可导入）
│   └── SYSTEM_PROMPT.md             # AI 校园助手系统 Prompt
│
├── admin/                           # 管理端：审核、通知、资料问答、活动、举报、审计
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── tests/                           # 浏览器冒烟与垂直闭环验证
├── backend/                         # 后端 API 服务
│   ├── main.py                      # FastAPI 入口
│   ├── agent.py                     # AI Agent 引擎
│   ├── config.py                    # 配置文件
│   ├── requirements.txt             # Python 依赖
│   ├── .env.example                 # 环境变量模板
│   ├── tools/                       # Function Calling 工具
│   │   ├── __init__.py
│   │   ├── search.py                # 信息检索
│   │   ├── academic.py              # 课程与学术中心
│   │   ├── community.py             # 社区内容
│   │   ├── treehole.py              # 匿名树洞
│   │   ├── messaging.py             # 校园通讯
│   │   └── events.py                # 社团活动
│   └── data/                        # Mock 数据
│       ├── courses.json             # 课程数据
│       └── users.json               # 用户数据
│
└── frontend/                        # 学生端：校园话题、发现、资料、活动
    ├── index.html                   # 主页面
    ├── demo.css                     # 样式
    └── demo.js                      # JavaScript
```

---

## 🔧 技术栈

| 层 | 技术 |
|----|------|
| AI Agent 引擎 | OpenAI Function Calling (兼容 DeepSeek/Ollama) |
| 后端框架 | FastAPI + Uvicorn |
| 存储 (MVP) | JSON 文件 |
| 开发平台 | WorkBuddy (腾讯版 OpenClaw) |
| 前端 (Demo) | 原生 HTML/CSS/JS |

---

## 👥 团队协作

### 分⼯建议

| 模块 | 负责同学 | 说明 |
|------|---------|------|
| AI Agent & Prompt | - | `agent/SYSTEM_PROMPT.md` 的核心维护 |
| 后端 API | - | `backend/` 目录下的 REST API |
| WorkBuddy 配置 | - | `agent/SKILL.md` 的导入和测试 |
| 前端 | - | `frontend/` 的页面开发 |

### 交接注意事项

1. 所有人在 **Windows** 环境下开发
2. 后端依赖统一用 `pip install -r requirements.txt` 安装
3. 确保 Python 版本 ≥ 3.9
4. 修改 Prompt 后及时更新 `agent/SYSTEM_PROMPT.md`
5. 新增 API 端点在文档中注明

---

## 📌 版本

当前: **MVP v0.1.0** — 核心 P0 功能
