"""平台导航 + 通知 工具"""
import json
from datetime import datetime
from . import _load_json, _save_json


def navigate_platform(query: str) -> str:
    nav_data = {
        "首页": {"tab": "首页", "path": "左侧导航首页", "说明": "查看动态信息流、搜索内容、发布帖子"},
        "学术": {"tab": "学术", "path": "左侧导航学术", "说明": "查课表、作业DDL、课程资料、问答区、教师信息"},
        "活动": {"tab": "活动", "path": "左侧导航活动", "说明": "浏览活动日历、查看详情、一键报名"},
        "树洞": {"tab": "树洞", "path": "左侧导航树洞", "说明": "匿名发帖倾诉，所有内容经过审核"},
        "通讯录": {"tab": "通讯录", "path": "左侧导航通讯录", "说明": "搜索全校师生，按姓名/学院筛选"},
        "消息": {"tab": "通讯录", "path": "通讯录→消息", "说明": "查看私聊和群聊消息"},
        "通知": {"tab": "通知", "path": "顶部通知铃铛", "说明": "查看三级分级通知"},
        "搜索": {"tab": "所有页面顶部", "path": "搜索栏", "说明": "全局搜索：可搜课程、活动、帖子、师生"},
        "组队": {"tab": "组队招募", "path": "左侧导航组队", "说明": "发布团队招募需求、智能匹配队友"},
        "问问AI": {"tab": "左侧栏", "path": "左侧栏问问AI按钮", "说明": "与AI助手对话了解校园全部信息"},
    }
    for key, info in nav_data.items():
        if query.lower() in key.lower() or key.lower() in query.lower():
            return json.dumps(info, ensure_ascii=False, indent=2)
    return json.dumps({"message": "没找到这个功能，试试问「首页」「学术」「活动」「树洞」「通讯录」「搜索」等关键词"}, ensure_ascii=False)


def notifications(action: str, params: dict = None) -> str:
    if params is None:
        params = {}
    if action == "list":
        return _list_notifications(params.get("unread_only", False))
    elif action == "mark_read":
        return _mark_read(params.get("notification_id"))
    elif action == "settings":
        return _get_notification_settings()
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _list_notifications(unread_only=False):
    data = _load_json("messages.json")
    notifs = [n for n in data.get("notifications", []) if n.get("published", True) and n.get("status", "published") == "published"]
    notifs.sort(key=lambda item: item.get("time", ""), reverse=True)
    if unread_only:
        notifs = [n for n in notifs if not n.get("read", False)]
    results = []
    for n in notifs[:20]:
        results.append({"id": n.get("id", ""), "content": n.get("content", ""), "time": n.get("time", ""), "read": n.get("read", False), "level": n.get("level", "normal"), "type": n.get("type", "system")})
    return json.dumps({"notifications": results, "unread": sum(1 for n in results if not n.get("read", False))}, ensure_ascii=False, indent=2)


def _mark_read(notification_id):
    data = _load_json("messages.json")
    for n in data.get("notifications", []):
        if n.get("id") == notification_id or notification_id is None:
            n["read"] = True
    _save_json("messages.json", data)
    return json.dumps({"status": "ok", "message": "已标记为已读"})


def _get_notification_settings():
    return json.dumps({"urgent": True, "normal": True, "optional": True}, ensure_ascii=False, indent=2)


NAVIGATE_TOOL = {
    "type": "function",
    "function": {
        "name": "navigate_platform",
        "description": "告诉用户平台某个功能在哪个页面、如何使用",
        "parameters": {"type": "object", "properties": {"query": {"type": "string", "description": "功能名称，如：首页、学术、活动、树洞、通讯录"}}, "required": ["query"]},
    },
}

NOTIFICATIONS_TOOL = {
    "type": "function",
    "function": {
        "name": "notifications",
        "description": "通知管理：查看通知列表、标记已读、查看通知设置",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["list", "mark_read", "settings"]}, "params": {"type": "object", "properties": {"unread_only": {"type": "boolean"}, "notification_id": {"type": "string"}}}}, "required": ["action"]},
    },
}
