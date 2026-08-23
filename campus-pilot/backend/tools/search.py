"""信息检索工具 — 搜索课程、教授、活动、资源、师生"""
import json
from typing import Optional
from . import _load_json, DATA_DIR


def search_info(
    category: str,
    keyword: Optional[str] = None,
    filters: Optional[dict] = None
) -> str:
    """查询校内各类信息"""
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
    elif category == "club":
        return _search_clubs(keyword)
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
        results.append({
            "课程": c["name"],
            "代码": c["code"],
            "时间": c.get("schedule", ""),
            "地点": c.get("location", ""),
            "教授": c.get("professor", ""),
        })
    if not results:
        return json.dumps({"message": "没有找到匹配的课程"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_professors(keyword):
    data = _load_json("users.json")
    profs = [u for u in data.get("users", []) if u.get("role") == "professor"]
    results = []
    kw = (keyword or "").lower()
    for p in profs:
        # 匹配姓名 / 研究方向 / 学院
        haystack = " ".join([
            p.get("name", ""),
            p.get("research", ""),
            p.get("department", ""),
        ]).lower()
        if kw and kw not in haystack:
            continue
        results.append({
            "姓名": p["name"],
            "学院": p.get("department", ""),
            "研究方向": p.get("research", ""),
            "Office Hour": p.get("office_hour", ""),
        })
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
        results.append({
            "活动": e["title"],
            "时间": e.get("time", ""),
            "地点": e.get("location", ""),
            "组织": e.get("organizer", ""),
        })
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
        results.append({
            "名称": r["name"],
            "课程": r.get("course", ""),
            "类型": r.get("type", ""),
            "上传者": r.get("uploader", ""),
        })
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
        results.append({
            "姓名": u["name"],
            "角色": u.get("role", ""),
            "学院": u.get("department", ""),
            "邮箱": u.get("email", ""),
        })
    if not results:
        return json.dumps({"message": "没有找到匹配的师生"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_clubs(keyword):
    data = _load_json("events.json")
    clubs = data.get("clubs", [])
    results = []
    for c in clubs:
        if keyword and keyword.lower() not in c.get("name", "").lower():
            continue
        results.append({
            "社团": c["name"],
            "描述": c.get("description", ""),
            "成员数": c.get("members", 0),
        })
    if not results:
        return json.dumps({"message": "没有找到匹配的社团"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _search_posts(keyword):
    data = _load_json("posts.json")
    posts = data.get("posts", [])
    results = []
    for p in posts:
        if keyword and keyword.lower() not in p.get("content", "").lower():
            continue
        results.append({
            "内容": p["content"][:80] + ("..." if len(p["content"]) > 80 else ""),
            "板块": p.get("section", ""),
            "时间": p.get("time", ""),
            "点赞": p.get("likes", 0),
        })
    if not results:
        return json.dumps({"message": "没有找到匹配的帖子"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


# ─── 工具定义（Function Calling Schema）───

SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search_info",
        "description": "查询校园各类信息：课程、教授、活动、学术资源、师生通讯录、社团、帖子",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": "查询类别",
                    "enum": ["course", "professor", "event", "resource", "directory", "club", "post"],
                },
                "keyword": {
                    "type": "string",
                    "description": "搜索关键词（可选）",
                },
            },
            "required": ["category"],
        },
    },
}
