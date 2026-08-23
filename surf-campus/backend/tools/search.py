"""信息检索工具 — 搜索课程、教授、活动、资源、师生"""
import json
from typing import Optional
from . import _load_json


def search_info(category: str, keyword: Optional[str] = None, filters: Optional[dict] = None) -> str:
    if category == "course":
        return _search_courses(keyword, filters)
    elif category == "professor":
        return _search_professors(keyword)
    elif category == "event":
        return _search_events(keyword)
    elif category == "resource":
        return _search_resources(keyword)
    elif category == "directory":
        return _search_directory(keyword)
    elif category == "post":
        return _search_posts(keyword)
    else:
        return json.dumps({"error": f"未知分类: {category}"})


def _search_courses(keyword, filters=None):
    data = _load_json("courses.json")
    courses = data.get("courses", [])
    results = []
    for c in courses:
        if keyword and keyword.lower() not in c.get("name", "").lower() and keyword.lower() not in c.get("code", "").lower():
            continue
        results.append({"name": c["name"], "code": c["code"], "instructor": c.get("instructor", ""), "credits": c.get("credits", 0)})
    if not results:
        return json.dumps({"message": "没有找到匹配的课程"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_professors(keyword):
    data = _load_json("professors.json")
    profs = data.get("professors", [])
    results = []
    for p in profs:
        if keyword and keyword.lower() not in p.get("name", "").lower() and keyword.lower() not in p.get("research", "").lower():
            continue
        results.append({"name": p["name"], "faculty": p.get("faculty", ""), "research": p.get("research", "")})
    if not results:
        return json.dumps({"message": "没有找到匹配的教授"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_events(keyword):
    data = _load_json("events.json")
    events = data.get("events", [])
    results = []
    for e in events:
        if keyword and keyword.lower() not in e.get("title", "").lower():
            continue
        results.append({"title": e["title"], "time": e.get("time", ""), "location": e.get("location", ""), "organizer": e.get("organizer", "")})
    if not results:
        return json.dumps({"message": "没有找到匹配的活动"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_resources(keyword):
    data = _load_json("courses.json")
    resources = data.get("resources", [])
    results = []
    for r in resources:
        if keyword and keyword.lower() not in r.get("name", "").lower() and keyword.lower() not in r.get("course", "").lower():
            continue
        results.append({"name": r["name"], "course": r.get("course", ""), "type": r.get("type", ""), "uploader": r.get("uploader", "")})
    if not results:
        return json.dumps({"message": "没有找到匹配的资料"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_directory(keyword):
    data = _load_json("users.json")
    users = data.get("users", [])
    results = []
    for u in users:
        if keyword and keyword.lower() not in u.get("name", "").lower() and keyword.lower() not in u.get("department", "").lower():
            continue
        results.append({"id": u.get("id", ""), "name": u["name"], "role": u.get("role", ""), "department": u.get("department", ""), "tags": u.get("tags", [])})
    if not results:
        return json.dumps({"message": "没有找到匹配的师生"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_posts(keyword):
    data = _load_json("posts.json")
    posts = data.get("posts", [])
    results = []
    for p in posts:
        if keyword and keyword.lower() not in p.get("content", "").lower() and keyword.lower() not in p.get("title", "").lower():
            continue
        results.append({"title": p.get("title", ""), "content": p.get("content", "")[:80], "section": p.get("section", ""), "likes": p.get("likes", 0)})
    if not results:
        return json.dumps({"message": "没有找到匹配的帖子"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search_info",
        "description": "查询校园各类信息：课程、教授、活动、学术资源、师生通讯录、帖子",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "查询类别", "enum": ["course", "professor", "event", "resource", "directory", "post"]},
                "keyword": {"type": "string", "description": "搜索关键词（可选）"},
            },
            "required": ["category"],
        },
    },
}
