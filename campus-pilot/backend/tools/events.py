"""社团与活动工具"""
import json
import time
from . import _load_json, _save_json


def clubs_events(action: str, params: dict = None) -> str:
    """社团与活动相关操作"""
    if params is None:
        params = {}

    if action == "list_clubs":
        return _list_clubs()
    elif action == "club_info":
        return _club_info(params.get("club_id", ""))
    elif action == "list_events":
        return _list_events(params.get("month"))
    elif action == "event_detail":
        return _event_detail(params.get("event_id", ""))
    elif action == "register_event":
        return _register_event(params.get("event_id", ""), params.get("user_id"), params.get("user_name"))
    elif action == "my_events":
        return _my_events(params.get("user_id"))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _list_clubs():
    data = _load_json("events.json")
    clubs = data.get("clubs", [])
    results = []
    for c in clubs:
        results.append({
            "id": c.get("id", ""),
            "名称": c["name"],
            "描述": c.get("description", ""),
            "成员数": c.get("members", 0),
        })
    if not results:
        return json.dumps({"message": "暂无社团数据"})
    return json.dumps(results, ensure_ascii=False, indent=2)


def _club_info(club_id):
    data = _load_json("events.json")
    for c in data.get("clubs", []):
        if c.get("id") == club_id or c.get("name") == club_id:
            return json.dumps(c, ensure_ascii=False, indent=2)
    return json.dumps({"message": "社团未找到"})


def _list_events(month=None):
    data = _load_json("events.json")
    events = data.get("events", [])
    results = []
    for e in events:
        if month and month not in e.get("time", ""):
            continue
        results.append({
            "id": e.get("id", ""),
            "标题": e["title"],
            "时间": e.get("time", ""),
            "地点": e.get("location", ""),
            "组织": e.get("organizer", ""),
            "描述": e.get("description", ""),
            "报名": e.get("registered", 0),
            "人数上限": e.get("capacity", 0),
            "已报名": [r.get("name") for r in e.get("registrants", [])],
        })
    if not results:
        return json.dumps({"message": "暂无可报名的活动"})
    return json.dumps({"events": results}, ensure_ascii=False, indent=2)


def _event_detail(event_id):
    """活动详情"""
    data = _load_json("events.json")
    for e in data.get("events", []):
        if e.get("id") == event_id:
            return json.dumps(e, ensure_ascii=False, indent=2)
    return json.dumps({"message": "活动未找到"})


def _register_event(event_id, user_id=None, user_name=None):
    """报名活动：按用户去重，已报名则取消报名"""
    data = _load_json("events.json")
    events = data.get("events", [])
    for e in events:
        if e.get("id") == event_id:
            registrants = e.get("registrants", [])
            # 已报名 → 取消报名
            for r in registrants:
                if r.get("user_id") == user_id:
                    registrants.remove(r)
                    e["registered"] = len(registrants)
                    e["registrants"] = registrants
                    _save_json("events.json", data)
                    return json.dumps({"status": "ok", "registered": False, "message": f"已取消报名「{e['title']}」"})
            # 未报名 → 报名
            registrants.append({
                "user_id": user_id,
                "name": user_name or "同学",
                "time": time.strftime("%Y-%m-%d %H:%M"),
            })
            e["registered"] = len(registrants)
            e["registrants"] = registrants
            _save_json("events.json", data)
            return json.dumps({"status": "ok", "registered": True, "message": f"已成功报名「{e['title']}」！"})
    return json.dumps({"error": "活动未找到"})


def _my_events(user_id=None):
    """我的已报名活动"""
    if not user_id:
        return json.dumps({"error": "请先登录"})
    data = _load_json("events.json")
    results = []
    for e in data.get("events", []):
        if any(r.get("user_id") == user_id for r in e.get("registrants", [])):
            results.append({
                "id": e.get("id", ""),
                "标题": e["title"],
                "时间": e.get("time", ""),
                "地点": e.get("location", ""),
                "组织": e.get("organizer", ""),
            })
    return json.dumps({"events": results}, ensure_ascii=False, indent=2)


# ─── 工具定义 ───

CLUBS_TOOL = {
    "type": "function",
    "function": {
        "name": "clubs_events",
        "description": "社团与活动：查看社团列表、社团详情、活动日历、报名活动",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["list_clubs", "club_info", "list_events", "event_detail", "register_event", "my_events"],
                },
                "params": {
                    "type": "object",
                    "properties": {
                        "club_id": {"type": "string"},
                        "month": {"type": "string"},
                        "event_id": {"type": "string"},
                        "user_id": {"type": "string"},
                        "user_name": {"type": "string"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
