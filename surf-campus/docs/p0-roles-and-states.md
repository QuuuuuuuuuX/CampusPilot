# P0 Mock 角色、权限与状态机

> 适用范围：本地 JSON Mock 与 `/api/admin/*`。真实 SSO、数据库和细粒度授权留在 P3；前端不得直接修改 `backend/data/*.json`。

## 角色矩阵

| 角色 | 学生端 | 管理端读取 | 帖子/举报审核 | 通知发布/撤回 | 资料与问答 | 活动 |
|---|---|---|---|---|---|---|
| `student` | 浏览、发布、互动、举报、通知状态 | 拒绝 | 拒绝 | 拒绝 | 学生操作 | 浏览/报名 |
| `platform_admin` | 可访问 | 全部 | 允许 | 允许 | P0 读取，后续补写入 | P0 读取，后续补写入 |
| `moderator` | 可访问 | 全部 | 允许 | 允许 | 只读 | 只读 |
| `teacher` | 可访问 | 全部 | 只读 | 只读 | P0 只读，后续回答/维护 | 只读 |
| `organizer` | 可访问 | 全部 | 只读 | 只读 | 只读 | P0 只读，后续发布/下线 |

Mock 管理角色通过 `X-Admin-Role` 请求头传递。它只用于本地验收，不能替代认证；所有管理写操作由后端再次校验角色并写入审计。

## 状态机

### 帖子与媒体

```text
学生提交 -> pending -> published
                    -> rejected
published -> hidden -> published
```

- `section`：`academic`、`campus-life`、`opportunities`、`teams`；`treehole` 独立。
- `visibility`：P0 固定为校内成员；匿名仅影响前台署名，不取消后台关联责任。
- `tags`：0-5 个；去除 `#`、合并空白、大小写去重。自定义 Tag 随帖子审核，审核通过后进入聚合索引。
- `media`：本地上传完成后记录 URL、MIME、大小、视频时长与封面；帖子未通过前不进入公共话题流。
- `moderation_note`、`moderated_at`：记录处理理由与时间；管理动作同步写审计。

### 通知

```text
draft -> published -> withdrawn -> published
学生状态：unread -> read；unread/read -> saved_for_later -> processed
```

- `priority`：`normal` 或 `important`；`pinned` 单独控制首位展示。
- 撤回只改变发布状态，不删除原始记录与审计。
- 学生的稍后处理和完成状态不改变其他用户的发布状态。

### 举报

```text
pending -> resolved
```

- 保存举报原因、关联帖子、提交时间、处理结果。
- 处理必须经过 `/api/admin/reports/{id}` 并记录审核角色、理由和时间。

### 审计

每条记录至少包含：`actor_role`、`action`、`target_type`、`target_id`、`detail`、`time`。审计记录只追加，不由学生端写入。
