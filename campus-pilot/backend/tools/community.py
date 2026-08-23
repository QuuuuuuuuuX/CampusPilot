"""社区内容工具"""
import json
import time
from typing import Optional
from . import _load_json, _save_json, delete_item


def community(action: str, params: dict = None) -> str:
    """社区内容相关操作"""
    if params is None:
        params = {}

    if action == "feed":
        return _get_feed(params.get("section"), params.get("page", 1))
    elif action == "publish_post":
        return _publish_post(
            params.get("content", ""),
            params.get("section", "general"),
            params.get("anonymous", False),
            params.get("title"),
        )
    elif action == "comment":
        return _add_comment(params.get("post_id", ""), params.get("content", ""), params.get("anonymous", False))
    elif action == "like":
        return _like_post(params.get("post_id", ""))
    elif action == "collect":
        return _collect_post(params.get("post_id", ""), params.get("user_id"))
    elif action == "my_collects":
        return _my_collects(params.get("user_id"))
    elif action == "report":
        return _report_post(params.get("post_id", ""), params.get("reason", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _get_feed(section=None, page=1):
    data = _load_json("posts.json")
    posts = data.get("posts", [])

    if section:
        posts = [p for p in posts if p.get("section") == section]

    # 信息流按时间倒序（最新在前），时间格式统一为 %Y-%m-%d %H:%M，字符串排序即时间排序
    posts = sorted(posts, key=lambda p: p.get("time", ""), reverse=True)

    # 分页
    page_size = 10
    start = (page - 1) * page_size
    end = start + page_size
    page_posts = posts[start:end]

    results = []
    for p in page_posts:
        results.append({
            "id": p.get("id", ""),
            "标题": p.get("title", ""),
            "内容": p["content"][:100] + ("..." if len(p["content"]) > 100 else ""),
            "板块": p.get("section", ""),
            "匿名": p.get("anonymous", False),
            "作者": p.get("author", ""),
            "图片": p.get("images", []),
            "时间": p.get("time", ""),
            "点赞": p.get("likes", 0),
            "评论": p.get("comments_count", 0),
        })

    return json.dumps({
        "page": page,
        "total": len(posts),
        "posts": results,
    }, ensure_ascii=False, indent=2)


def _publish_post(content, section="general", anonymous=False, title=None, author=None, images=None):
    if not content.strip():
        return json.dumps({"error": "内容不能为空"})

    data = _load_json("posts.json")
    posts = data.get("posts", [])
    new_post = {
        "id": f"post_{int(time.time())}_{len(posts)}",
        "title": title or "",
        "content": content,
        "section": section,
        "anonymous": anonymous,
        "author": None if anonymous else (author or "同学"),
        "images": images or [],
        "time": time.strftime("%Y-%m-%d %H:%M"),
        "likes": 0,
        "comments_count": 0,
        "comments": [],
    }
    posts.insert(0, new_post)
    _save_json("posts.json", {"posts": posts})

    return json.dumps({
        "status": "ok",
        "message": "发布成功！" + ("（已匿名）" if anonymous else ""),
        "post_id": new_post["id"],
    }, ensure_ascii=False)


def _add_comment(post_id, content, anonymous=False, author=None):
    if not content.strip():
        return json.dumps({"error": "评论内容不能为空"})
    data = _load_json("posts.json")
    posts = data.get("posts", [])
    for p in posts:
        if p.get("id") == post_id:
            comment = {
                "id": f"cmt_{int(time.time())}",
                "content": content,
                "anonymous": anonymous,
                "author": None if anonymous else (author or "同学"),
                "time": time.strftime("%Y-%m-%d %H:%M"),
            }
            p.setdefault("comments", []).append(comment)
            p["comments_count"] = len(p["comments"])
            _save_json("posts.json", {"posts": posts})
            return json.dumps({"status": "ok", "message": "评论成功"})
    return json.dumps({"error": "帖子未找到"})


def _like_post(post_id):
    data = _load_json("posts.json")
    posts = data.get("posts", [])
    for p in posts:
        if p.get("id") == post_id:
            p["likes"] = p.get("likes", 0) + 1
            _save_json("posts.json", {"posts": posts})
            return json.dumps({"status": "ok", "likes": p["likes"]})
    return json.dumps({"error": "帖子未找到"})


def _collect_post(post_id, user_id=None):
    """收藏帖子（登录用户），重复收藏则取消收藏（toggle）"""
    if not user_id:
        return json.dumps({"error": "请先登录"})
    data = _load_json("collects.json")
    collects = data.get("collects", [])
    # 查找是否已收藏
    for c in collects:
        if c.get("post_id") == post_id and c.get("user_id") == user_id:
            # 已收藏 → 取消（merge 写入不删除条目，需显式 delete_item）
            collects.remove(c)
            _save_json("collects.json", {"collects": collects})
            delete_item("collects.json", "collects", c.get("id"))
            return json.dumps({"status": "ok", "collected": False, "message": "已取消收藏"})
    # 未收藏 → 收藏
    collects.append({
        "id": f"col_{int(time.time())}_{len(collects)}",
        "post_id": post_id,
        "user_id": user_id,
        "time": time.strftime("%Y-%m-%d %H:%M"),
    })
    _save_json("collects.json", {"collects": collects})
    return json.dumps({"status": "ok", "collected": True, "message": "已收藏"})


def _my_collects(user_id=None):
    """我的收藏列表（含帖子内容）"""
    if not user_id:
        return json.dumps({"error": "请先登录"})
    data = _load_json("collects.json")
    collects = data.get("collects", [])
    mine = [c for c in collects if c.get("user_id") == user_id]
    mine.sort(key=lambda c: c.get("time", ""), reverse=True)

    posts_data = _load_json("posts.json")
    posts = posts_data.get("posts", [])
    post_map = {p.get("id"): p for p in posts}

    results = []
    for c in mine:
        p = post_map.get(c.get("post_id"))
        if not p:
            continue
        results.append({
            "id": p.get("id", ""),
            "标题": p.get("title", ""),
            "内容": p.get("content", "")[:80],
            "作者": p.get("author", ""),
            "时间": p.get("time", ""),
            "点赞": p.get("likes", 0),
        })
    return json.dumps({"collects": results}, ensure_ascii=False, indent=2)


def _report_post(post_id, reason):
    return json.dumps({"status": "ok", "message": "举报已收到，管理员会尽快处理"})


# ─── 工具定义 ───

COMMUNITY_TOOL = {
    "type": "function",
    "function": {
        "name": "community",
        "description": "社区内容：浏览信息流、发布帖子、评论、点赞、收藏、举报",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["feed", "publish_post", "comment", "like", "collect", "my_collects", "report"],
                },
                "params": {
                    "type": "object",
                    "properties": {
                        "section": {"type": "string"},
                        "page": {"type": "integer"},
                        "title": {"type": "string"},
                        "content": {"type": "string"},
                        "anonymous": {"type": "boolean"},
                        "post_id": {"type": "string"},
                        "user_id": {"type": "string"},
                        "reason": {"type": "string"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
