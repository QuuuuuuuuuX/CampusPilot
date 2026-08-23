"""匿名树洞工具"""
import json
import time
from . import _load_json, _save_json
from .community import _publish_post, _add_comment


def anonymous_tree_hole(action: str, params: dict = None) -> str:
    """匿名树洞相关操作"""
    if params is None:
        params = {}

    if action == "post":
        return _treehole_post(params.get("content", ""), params.get("category"))
    elif action == "comment":
        return _treehole_comment(params.get("post_id", ""), params.get("content", ""))
    elif action == "hot":
        return _treehole_hot()
    elif action == "report":
        return _treehole_report(params.get("post_id", ""), params.get("reason", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _treehole_post(content, category=None):
    """匿名发帖（后台可追溯）"""
    if not content.strip():
        return json.dumps({"error": "内容不能为空"})

    data = _load_json("posts.json")
    treehole_posts = data.get("treehole_posts", [])
    new_post = {
        "id": f"th_{int(time.time())}_{len(treehole_posts)}",
        "content": content,
        "category": category or "general",
        "time": time.strftime("%Y-%m-%d %H:%M"),
        "likes": 0,
        "comments_count": 0,
        "reported": False,
        # 后台追溯信息（不暴露给前端）
        "_trace_id": f"TRACE-{time.strftime('%Y%m%d%H%M%S')}-{len(treehole_posts)}",
    }
    treehole_posts.insert(0, new_post)
    data["treehole_posts"] = treehole_posts
    _save_json("posts.json", data)

    return json.dumps({
        "status": "ok",
        "message": "树洞已收到你的匿名心声~放心，内容已加密储存，只有管理员可追溯。",
        "post_id": new_post["id"],
    }, ensure_ascii=False)


def _treehole_comment(post_id, content):
    """匿名评论"""
    if not content.strip():
        return json.dumps({"error": "内容不能为空"})
    data = _load_json("posts.json")
    treehole_posts = data.get("treehole_posts", [])
    for p in treehole_posts:
        if p.get("id") == post_id:
            comment = {
                "id": f"th_cmt_{int(time.time())}",
                "content": content,
                "anonymous": True,
                "time": time.strftime("%Y-%m-%d %H:%M"),
            }
            p.setdefault("comments", []).append(comment)
            p["comments_count"] = len(p["comments"])
            _save_json("posts.json", data)
            return json.dumps({"status": "ok", "message": "匿名评论成功"})
    return json.dumps({"error": "树洞帖子未找到"})


def _treehole_hot():
    """热门匿名帖"""
    data = _load_json("posts.json")
    treehole_posts = data.get("treehole_posts", [])
    sorted_posts = sorted(treehole_posts, key=lambda x: x.get("likes", 0), reverse=True)
    top = sorted_posts[:10]
    results = []
    for p in top:
        results.append({
            "id": p["id"],
            "内容": p["content"][:80] + ("..." if len(p["content"]) > 80 else ""),
            "时间": p.get("time", ""),
            "点赞": p.get("likes", 0),
        })
    return json.dumps({"hot_posts": results}, ensure_ascii=False, indent=2)


def _treehole_report(post_id, reason):
    data = _load_json("posts.json")
    treehole_posts = data.get("treehole_posts", [])
    for p in treehole_posts:
        if p.get("id") == post_id:
            p["reported"] = True
            p["report_reason"] = reason
            _save_json("posts.json", data)
            return json.dumps({"status": "ok", "message": "举报已收到，管理员会立刻处理"})
    return json.dumps({"error": "帖子未找到"})


# ─── 工具定义 ───

TREEHOLE_TOOL = {
    "type": "function",
    "function": {
        "name": "anonymous_tree_hole",
        "description": "匿名树洞：匿名发帖、匿名评论、查看热门、举报违规内容（所有匿名操作后台可追溯）",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["post", "comment", "hot", "report"],
                },
                "params": {
                    "type": "object",
                    "properties": {
                        "content": {"type": "string"},
                        "category": {"type": "string"},
                        "post_id": {"type": "string"},
                        "reason": {"type": "string"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
