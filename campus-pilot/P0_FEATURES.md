# P0 功能清单与实现进度

> 基于思维导图功能优先级 + 老师 Demo 前端结构

---

## 🔐 1. 用户系统

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 注册/登录 | ✅ v0.6.0 | `POST /api/auth/register` + `POST /api/auth/login`（JWT） |
| XJTLU SSO 登录 | 📋 v2.0 | 目前为独立账号体系 |
| 手机号绑定 | 📋 待实现 | |
| 个人资料设置 | ✅ | `GET/PUT /api/auth/profile`（前端编辑资料页已真实化） |
| 语言偏好设置 | ⏳ | 中英文切换 |
| 隐私设置 | 📋 待实现 | |

## 📬 2. 统一信息门户（P0 子集）

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 统一消息收件箱 | ✅ | `GET /api/messages`（会话列表） |
| 消息搜索 | ✅ | `GET /api/messages/search` |
| 置顶重要消息 | 📋 待实现 | |

## 📚 3. 课程与学术中心

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 课表查询 | ✅ | `GET /api/courses/timetable` |
| 作业 DDL 看板 | ✅ | `GET /api/courses/assignments` |
| 考试成绩查询 | ✅ | `GET /api/courses/exams` |
| 课程资料库 | ✅ | `GET /api/courses/resources` |
| 资料搜索 | ✅ | `GET /api/courses/resources/search` |
| 课程问答区 | ✅ | `GET/POST /api/courses/qa` |
| 匿名提问 | ✅ | `POST /api/courses/qa` (anonymous) |
| 教授信息页 | ✅ | `GET /api/professors` |

## 💬 4. 校园通讯

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 全校师生通讯录 | ✅ | `GET /api/directory` |
| 用户身份标签 | ✅ | |
| 仅限校内用户可见 | ✅ | |
| 一键发起聊天 | ✅ | `POST /api/messaging/chat` |
| 一对一私聊 | ✅ | `POST /api/messaging/send` |
| 群聊 | ✅ | `POST /api/messaging/group` |
| 消息已读回执 | ✅ | |
| 文件传输 | ✅ | `POST /api/messaging/files` |

## 🤝 5. 组队匹配

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 发布招募需求 | 📋 v2.0 | |
| 智能推荐匹配 | 📋 v2.0 | |

## 🏠 6. 社区内容

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 信息流首页 | ✅ | `GET /api/community/feed` |
| 多板块分区 | ✅ | |
| 实名/匿名切换 | ✅ | |
| 图文 & 视频发布 | ✅ | `POST /api/community/posts` |
| 评论 & 回复 | ✅ | `POST /api/community/comments` |
| 点赞 & 收藏 | ✅ | `POST /api/community/like` + `POST /api/community/collect`（真实收藏/取消） |
| 帖子举报 | ✅ | `POST /api/community/report` |
| 内容审核 | ✅ | |
| 帖子搜索 | ✅ | `GET /api/community/search` |

## 🎪 7. 社团活动

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 社团主页 | ✅ | `GET /api/clubs` |
| 活动日历 | ✅ | `GET /api/events` |
| 一键报名 | ✅ | `POST /api/events/register`（按用户去重，可取消） |
| 活动发布 | ✅ | `POST /api/events` |
| 活动详情 | ✅ | `GET /api/events/{id}` + `GET /api/events/mine`（我的报名） |

## 🕊️ 8. 匿名树洞

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 匿名发帖 | ✅ | `POST /api/treehole/posts` |
| 匿名评论 | ✅ | `POST /api/treehole/comments` |
| 后台实名追溯 | ✅ | |
| 严格内容审核 | ✅ | |
| 举报机制 | ✅ | `POST /api/treehole/report` |
| 仅限校内用户 | ✅ | |

## 🤖 9. AI 助手

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 全局 AI 问答入口 | ✅ | `POST /api/chat` |
| 个性化内容推荐 | ✅ | |
| 知识库自动更新 | 📋 v2.0 | |

## 🔍 10. 搜索

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 全局搜索 | ✅ | `GET /api/search`（前端搜索页已真实化） |
| 搜索筛选 | ✅ | |

## ⚙️ 11. 通知 & 设置

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 通知中心 | ✅ | `GET /api/notifications` + 已读（前端真实化） |
| 手机推送 | 📋 v2.0 | |
| 语言设置 | ✅ | `GET/PUT /api/settings` |

---

## 图例

| 标记 | 含义 |
|:----:|------|
| ✅ | P0 已实现 |
| ⏳ | 部分实现 / Mock |
| 📋 | 待实现（后期版本） |
