# SURF Campus 本地交付与生产边界

## 本地启动

```bash
cd /Users/hanmingyu/Desktop/surf项目/surfplus/surf-campus
python3 -m pip install -r backend/requirements.txt
python3 backend/main.py
```

服务默认监听 `http://127.0.0.1:8000`：

- 学生端：`/`
- 管理端：`/admin/`
- API 文档：`/docs`
- 健康检查：`/health`

管理端的 Mock 角色由 `X-Admin-Role` 请求头控制，页面右上角可切换。`platform_admin` / `moderator` 可审核内容，`teacher` 管理课程内容，`organizer` 管理活动与招募；`student` 用于验证权限拒绝。Mock 角色不代表真实身份认证。

## 数据与媒体隔离

默认数据位于 `backend/data/`，开发媒体位于 `backend/uploads/`，资料文件位于 `backend/resource_files/`。端到端测试应设置独立的 `SURF_DATA_DIR`、`SURF_UPLOAD_DIR` 和 `SURF_RESOURCE_FILE_DIR`，避免污染演示数据。前端只通过 API 读写，不能直接修改 JSON 文件。

## 验证入口

服务运行后执行：

```bash
./scripts/verify-local.sh
```

它会检查 Python/JavaScript 语法、健康检查、主浏览器冒烟、帖子详情/评论/点赞幂等/收藏 Tag/资料路径、通讯录私聊、招募申请、偏好、活动、树洞、AI mention、手机访客权限、真实 OAuth2 callback 本地 Mock、移动端身份入口、系统观测和 60 个并发只读请求。

## 生产替换清单

以下工作需要部署环境、学校身份提供方或正式存储凭据，当前没有伪造完成：

1. 用学校 SSO/OIDC、用户目录和细粒度服务端授权替换 Mock 角色；管理员操作保留审计和最小权限。
2. 用关系数据库替换 JSON 文件，使用事务、唯一约束、迁移、备份和并发写入控制。
3. 用对象存储和病毒/文件类型校验替换本地媒体目录，并补充私有 URL、清理策略和 CDN。
4. 在真实部署环境执行负载/容量/故障演练；本地 `observability-smoke.py` 只证明并发读取基线。
5. 配置 HTTPS、可信 CORS、密钥管理、结构化日志收集、告警、备份和回滚。

## XJTLU SSO 结论

已查阅 XJTLU 官方公开页面：

- [XJTLU IT Services](https://www.xjtlu.edu.cn/en/it-services) 明确提供 XJTLU Account、校园账号和 `https://sso.xjtlu.edu.cn` UIM 入口。
- [XJTLU E-hall 登录](https://ehall.xjtlu.edu.cn/login) 当前会跳转到 `sso.xjtlu.edu.cn/esc-sso/oauth2.0/authorize`，使用 OAuth2 `response_type=code`、`client_id` 和 `redirect_uri`。
- 官方登录页公开了账号密码、手机验证码和扫码等登录方式；手机入口本身不能证明用户属于 XJTLU 学生。

因此 SURF 的真实接入路径应是：手机登录建立基础会话 -> 跳转 XJTLU UIM OAuth2 -> `/api/auth/xjtlu/callback` 服务端交换 code、读取 userinfo、校验一次性 state、issuer 和校园邮箱 claim -> 标记 `campus_verified` -> 才允许发帖。需要配置 `XJTLU_OAUTH_CLIENT_ID`、`XJTLU_OAUTH_CLIENT_SECRET`、`XJTLU_OAUTH_REDIRECT_URI`、`XJTLU_OAUTH_TOKEN_URL` 和 `XJTLU_OAUTH_USERINFO_URL`；可用 `XJTLU_OAUTH_SCOPE` 调整 scope（默认 `openid profile email`），并用 `XJTLU_OAUTH_TOKEN_AUTH=client_secret_basic` 切换 token endpoint 的客户端认证方式。学校需要为回调地址注册对应 client 和 scope。当前代码不会伪造学校 client 或用户身份，本地 `mock-bind` 仅用于验收权限状态机。

生产环境必须关闭 Mock 绑定，并通过密钥管理注入以下配置：

本地变量名可参考 `backend/.env.example`；该文件只有占位值，生产 secret 必须由部署平台注入。

```bash
SURF_ENABLE_MOCK_AUTH=false
XJTLU_OAUTH_CLIENT_ID=<school-issued-client-id>
XJTLU_OAUTH_CLIENT_SECRET=<secret-from-secure-store>
XJTLU_OAUTH_REDIRECT_URI=https://<surf-domain>/api/auth/xjtlu/callback
XJTLU_OAUTH_TOKEN_URL=<school-token-endpoint>
XJTLU_OAUTH_USERINFO_URL=<school-userinfo-endpoint>
XJTLU_OAUTH_ISSUER=<expected-school-issuer>
XJTLU_CAMPUS_EMAIL_DOMAINS=student.xjtlu.edu.cn,xjtlu.edu.cn
```

不要把 `XJTLU_OAUTH_CLIENT_SECRET` 写入仓库或返回给学生端。当前 `/api/auth/xjtlu/config` 只暴露非敏感的 provider 状态和 endpoint，不会返回 secret。

本地 `/api/admin/system/metrics` 和管理端“系统状态”页只保留进程内有界请求指标，不是生产监控系统。
