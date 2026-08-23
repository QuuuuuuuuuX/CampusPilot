# 云服务器部署指南

> 目标：让 SURF Campus 变成真正联网、同学可注册使用的平台。
> 服务器推荐：Ubuntu 22.04/24.04 LTS，2核2G 起（学生机/轻量服务器即可，预算 ~100元/年）。

---

## 0. 架构总览

```
同学浏览器 (手机/电脑)
        │ HTTPS
        ▼
   Nginx (443, 反向代理 + 静态前端)
        │ /api/* → 127.0.0.1:8000
        ▼
   Uvicorn (FastAPI, systemd 守护)
        │
        ▼
   SQLite (data/campus.db, WAL 模式)
```

- 前端：`frontend/` 静态文件，由 Nginx 直接托管
- 后端：FastAPI，只监听本机 127.0.0.1，不直接暴露公网
- 数据：单个 SQLite 文件，自带备份方案（见第 6 节）

---

## 1. 准备服务器与域名

1. 购买云服务器（腾讯云/阿里云学生机、轻量应用服务器均可）
2. 安全组/防火墙放行 **80** 和 **443** 端口
3. 解析域名 A 记录到服务器公网 IP（没有域名可先用 IP，后续再补 HTTPS）

## 2. 上传代码

```bash
# 在本地（Windows WSL 或终端）
scp -r /mnt/c/Users/30987/Desktop/SURF-platform/surf-campus \
    ubuntu@<服务器IP>:~/surf-campus

# 在服务器上放到标准位置
sudo mv ~/surf-campus /opt/surf-campus
```

## 3. 安装依赖

```bash
cd /opt/surf-campus/backend
sudo apt update && sudo apt install -y python3-venv nginx
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. 配置环境变量

```bash
cd /opt/surf-campus/backend
cp .env.example .env
vim .env   # 填入真实配置
```

必须修改：
- `JWT_SECRET`：生成随机密钥 `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
- `DEEPSEEK_API_KEY`：你的 DeepSeek key（不填也能跑，只是 AI 对话不可用）
- `SMTP_*`：发信邮箱配置（验证码真实发送）。QQ 邮箱示例见 `.env.example`；未配置时验证码打印到服务日志（不推荐生产）

## 5. 初始化数据库 + 启动服务

```bash
cd /opt/surf-campus/backend
source venv/bin/activate
python migrate.py        # 首次部署执行：JSON → SQLite（幂等）

# systemd 常驻服务（开机自启 + 崩溃自动重启）
sudo tee /etc/systemd/system/campus.service > /dev/null <<'EOF'
[Unit]
Description=XJTLU SURF Campus API
After=network.target

[Service]
WorkingDirectory=/opt/surf-campus/backend
EnvironmentFile=/opt/surf-campus/backend/.env
ExecStart=/opt/surf-campus/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable campus
sudo systemctl start campus
sudo systemctl status campus     # 确认 active (running)
```

> 说明：`--workers 4` 多进程 + SQLite WAL 模式，已配置 busy_timeout 兜底并发写。
> 如果遇到 `database is locked`，把 workers 降为 1 或 2 即可。

## 6. Nginx 反向代理 + HTTPS

```bash
sudo tee /etc/nginx/sites-available/campus > /dev/null <<'EOF'
server {
    listen 80;
    server_name campus.example.com;   # 改成你的域名

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }

    # 用户上传的图片（Nginx 直接静态服务，性能更好）
    location /uploads/ {
        alias /opt/surf-campus/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # 前端静态页面（frontend/ 目录）
    location / {
        root /opt/surf-campus/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/campus /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# HTTPS（免费证书，域名必须已解析到本机）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d campus.example.com
```

完成后访问 `https://campus.example.com` 即可使用。没有域名就访问 `http://<服务器IP>`（无 HTTPS）。

## 7. 数据备份（必须）

```bash
# 每日凌晨 3 点备份数据库 + 用户图片
sudo crontab -e
# 加入：
0 3 * * * sqlite3 /opt/surf-campus/backend/data/campus.db ".backup /opt/surf-campus/backup/campus-$(date +\%F).db" && rsync -a --delete /opt/surf-campus/backend/uploads/ /opt/surf-campus/backup/uploads/ && find /opt/surf-campus/backup -name "*.db" -mtime +14 -delete
```

## 8. 上线前检查清单

- [ ] `JWT_SECRET` 已改为随机密钥（不是默认值！）
- [ ] `migrate.py` 执行成功，`data/campus.db` 已生成
- [ ] `/health` 返回 200
- [ ] 注册 → 登录 → 发帖 → 评论 → 点赞 全流程可用
- [ ] 未登录发帖返回 401
- [ ] 课程资料：未登录下载返回 401；登录后下载扣额度；额度用完返回 402 + 激励规则
- [ ] 分享资料后当日额度 +2，列表出现新资料
- [ ] HTTPS 证书生效，浏览器无警告
- [ ] 定时备份已配置

## 9. 常见问题

| 现象 | 处理 |
|---|---|
| `database is locked` | 降低 workers（1-2），或检查是否有多个进程同时写 |
| 注册 500 | 检查 `.env` 中 JWT_SECRET 是否包含特殊字符导致解析失败 |
| AI 对话报错 | 检查 DEEPSEEK_API_KEY；不影响其他功能 |
| 前端白屏 | 确认 `frontend/index.html` 存在，检查 Nginx error log |
| 图片/文件上传 | 图片上传已实现：`POST /api/upload/image`（登录后 5MB 内 JPG/PNG/GIF/WebP），发帖带 `images` 参数（逗号分隔 URL） |

## 10. 课程资料「以一换一」（v0.7.0 新增）

### 激励规则
- 每位同学每天 **3 次** 免费下载（额度每日 0 点重置）
- 分享 1 份资料 → 当日下载额度 **+2 次**（每份资料奖励一次）
- 额度在文件实际下发时扣减，前端有规则提示弹窗

### 新增接口
| 接口 | 说明 |
|---|---|
| `GET /api/courses/resources` | 列表/搜索（可选登录；登录返回个人今日额度） |
| `POST /api/upload/resource` | 上传资料文件（登录，50MB 内，文档/压缩包格式） |
| `POST /api/courses/resources` | 分享资料（登录，参数 title/filename/course/type，成功后额度+2） |
| `GET /api/resources/file/{id}` | 下载文件（登录，扣 1 次额度；额度用完 402 + 规则） |

### 部署注意
- 资料文件同样存在 `backend/uploads/`（Nginx 的 `/uploads/` location 已覆盖）
- 额度表 `resource_quota` 由代码自动创建，无需手动建表
- 历史种子资料会在首次访问时自动补 id（幂等，不会重复）
- 备份 cron 已包含 uploads 目录，无需改动

---

*文档版本: 2026-08-15 · 配套后端 v0.7.0（SQLite + 用户认证 + 邮箱验证码 + 图片上传 + 课程资料以一换一）*
