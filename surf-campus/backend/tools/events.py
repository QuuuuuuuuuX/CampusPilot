"""活动与社团工具"""
import json
from . import _load_json


def clubs_events(action: str, params: dict = None) -> str:
    if params is None:
        params = {}
    if action == "list_events":
        return _list_events(params.get("month"))
    elif action == "list_clubs":
        return _list_clubs()
    elif action == "club_info":
        return _club_info(params.get("club_id", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _list_events(month=None):
    data = _load_json("events.json")
    events = data.get("events", [])
    if month:
        events = [e for e in events if month in e.get("time", "")]
    return json.dumps({"events": events[:20]}, ensure_ascii=False, indent=2)


def _list_clubs():
    data = _load_json("events.json")
    return json.dumps({"clubs": data.get("clubs", [])}, ensure_ascii=False, indent=2)


def _club_info(club_id):
    data = _load_json("events.json")
    club = next((c for c in data.get("clubs", []) if c.get("id") == club_id), None)
    if not club:
        return json.dumps({"error": "社团未找到"}, ensure_ascii=False)
    return json.dumps(club, ensure_ascii=False, indent=2)


CLUBS_TOOL = {
    "type": "function",
    "function": {
        "name": "clubs_events",
        "description": "活动与社团：浏览活动列表、查看社团信息",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["list_events", "list_clubs", "club_info"]}, "params": {"type": "object", "properties": {"month": {"type": "string"}, "club_id": {"type": "string"}}}}, "required": ["action"]},
    },
}
