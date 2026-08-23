"""社区工具 — 帖子、评论、点赞"""
import json
import time
import uuid
from . import _load_json, _save_json


def community(action: str, params: dict = None) -> str:
    if params is None:
        params = {}
    if action == "feed":
        return _get_feed(params.get("section"), params.get("page", 1))
    elif action == "post_detail":
        return _get_post_detail(params.get("post_id", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _get_feed(section=None, page=1):
    data = _load_json("posts.json")
    posts = data.get("posts", [])
    if section and section != "all":
        posts = [p for p in posts if p.get("section") == section]
    return json.dumps({"posts": posts, "total": len(posts), "page": page}, ensure_ascii=False, indent=2)


def _get_post_detail(post_id):
    data = _load_json("posts.json")
    post = next((p for p in data.get("posts", []) if p.get("id") == post_id), None)
    if not post:
        return json.dumps({"error": "帖子未找到"}, ensure_ascii=False)
    return json.dumps(post, ensure_ascii=False, indent=2)


def _publish_post(content, section="campus-life", anonymous=False, title="", tags=None, media=None, status="published"):
    data = _load_json("posts.json")
    post = {"id": f"p_{uuid.uuid4().hex[:10]}", "content": content, "title": title, "section": section, "anonymous": anonymous, "author": "匿名" if anonymous else "张三", "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0, "comments_count": 0, "tags": tags or [], "media": media or [], "comments": [], "status": status, "liked": False, "collected": False}
    data.setdefault("posts", []).insert(0, post)
    _save_json("posts.json", data)
    return json.dumps({"status": "ok", "post": post}, ensure_ascii=False)


def _add_comment(post_id, content, anonymous=False):
    data = _load_json("posts.json")
    post = next((p for p in data.get("posts", []) if p.get("id") == post_id), None)
    if not post:
        return json.dumps({"error": "帖子未找到"}, ensure_ascii=False)
    comment = {"id": f"c_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名" if anonymous else "张三", "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0}
    post.setdefault("comments", []).append(comment)
    post["comments_count"] = len(post["comments"])
    _save_json("posts.json", data)
    return json.dumps({"status": "ok", "comment": comment}, ensure_ascii=False)


def _like_post(post_id, user_id="u001"):
    data = _load_json("posts.json")
    post = next((p for p in data.get("posts", []) if p.get("id") == post_id), None)
    if not post:
        return json.dumps({"error": "帖子未找到"}, ensure_ascii=False)
    post["likes"] = post.get("likes", 0) + 1
    post["liked"] = True
    _save_json("posts.json", data)
    return json.dumps({"status": "ok", "likes": post["likes"]}, ensure_ascii=False)


def _collect_post(post_id, tag=""):
    data = _load_json("collections.json")
    if post_id not in data.get("collections", []):
        data.setdefault("collections", []).append(post_id)
    if tag:
        data.setdefault("tags", {}).setdefault(post_id, []).append(tag)
    _save_json("collections.json", data)
    return json.dumps({"status": "ok", "collected": True}, ensure_ascii=False)


COMMUNITY_TOOL = {
    "type": "function",
    "function": {
        "name": "community",
        "description": "社区功能：浏览帖子流、查看帖子详情",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["feed", "post_detail"]}, "params": {"type": "object", "properties": {"section": {"type": "string"}, "page": {"type": "integer"}, "post_id": {"type": "string"}}}}, "required": ["action"]},
    },
}
