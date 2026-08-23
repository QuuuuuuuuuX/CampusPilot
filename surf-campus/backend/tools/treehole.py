"""树洞工具 — 匿名帖子"""
import json
import time
import uuid
from . import _load_json, _save_json


def anonymous_tree_hole(action: str, params: dict = None) -> str:
    if params is None:
        params = {}
    if action == "hot":
        return _treehole_hot()
    elif action == "post":
        return _treehole_post(params.get("content", ""))
    elif action == "comment":
        return _treehole_comment(params.get("post_id", ""), params.get("content", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _treehole_hot():
    data = _load_json("treeholes.json")
    posts = data.get("posts", [])
    posts_sorted = sorted(posts, key=lambda p: p.get("likes", 0), reverse=True)
    return json.dumps({"posts": posts_sorted[:10]}, ensure_ascii=False, indent=2)


def _treehole_post(content):
    data = _load_json("treeholes.json")
    post = {"id": f"t_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名同学", "anonymous": True, "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0, "liked": False, "comments_count": 0, "comments": [], "tags": [], "media": []}
    data.setdefault("posts", []).insert(0, post)
    _save_json("treeholes.json", data)
    return json.dumps({"status": "ok", "post": post}, ensure_ascii=False)


def _treehole_comment(post_id, content):
    data = _load_json("treeholes.json")
    post = next((p for p in data.get("posts", []) if p.get("id") == post_id), None)
    if not post:
        return json.dumps({"error": "帖子未找到"}, ensure_ascii=False)
    comment = {"id": f"tc_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名同学", "anonymous": True, "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0}
    post.setdefault("comments", []).append(comment)
    post["comments_count"] = len(post["comments"])
    _save_json("treeholes.json", data)
    return json.dumps({"status": "ok", "comment": comment}, ensure_ascii=False)


def _treehole_report(post_id, reason=""):
    return json.dumps({"status": "ok", "message": "举报已提交"}, ensure_ascii=False)


TREEHOLE_TOOL = {
    "type": "function",
    "function": {
        "name": "anonymous_tree_hole",
        "description": "匿名树洞：浏览热门帖子、发布树洞、评论",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["hot", "post", "comment"]}, "params": {"type": "object", "properties": {"content": {"type": "string"}, "post_id": {"type": "string"}}}}, "required": ["action"]},
    },
}
