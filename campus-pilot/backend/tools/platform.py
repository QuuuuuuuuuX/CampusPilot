"""平台导航 + 通知 工具"""
import json
import time
from . import _load_json, _save_json


def navigate_platform(query: str) -> str:
    """告诉用户平台某个功能的位置和使用方法"""
    nav_data = {
        "首页": {
            "tab": "🏠 首页",
            "path": "底部导航栏第一个",
            "说明": "查看动态信息流、搜索内容、发布帖子",
        },
        "动态": {
            "tab": "🏠 首页",
            "path": "底部导航栏第一个",
            "说明": "在首页滚动浏览大家的动态，可以点赞、评论互动",
        },
        "学术": {
            "tab": "📚 学术",
            "path": "底部导航栏第二个",
            "说明": "查课表、作业DDL、考试成绩、课程资料、问答区、教授信息",
        },
        "课表": {
            "tab": "📚 学术",
            "path": "底部导航第二个 → 课程资料 Tab",
            "说明": "查看本周/学期课表",
        },
        "作业": {
            "tab": "📚 学术",
            "path": "底部导航第二个 → 课程资料 Tab",
            "说明": "查看各课程作业截止日期",
        },
        "教授": {
            "tab": "📚 学术",
            "path": "底部导航第二个 → 教授信息 Tab",
            "说明": "浏览教授列表、查看研究方向、Office Hour",
        },
        "活动": {
            "tab": "📅 活动",
            "path": "底部导航栏第三个",
            "说明": "浏览活动日历、查看详情、一键报名",
        },
        "树洞": {
            "tab": "🌳 树洞",
            "path": "底部导航栏第四个",
            "说明": "匿名发帖倾诉，所有内容经过审核，后台可追溯",
        },
        "我的": {
            "tab": "👤 我的",
            "path": "底部导航栏第五个",
            "说明": "个人资料、站内消息、通知中心、设置",
        },
        "资料": {
            "tab": "👤 我的",
            "path": "底部导航第五个 → 个人资料",
            "说明": "编辑昵称、邮箱、头像等个人信息",
        },
        "消息": {
            "tab": "👤 我的",
            "path": "底部导航第五个 → 站内消息",
            "说明": "查看私聊和群聊消息",
        },
        "通知": {
            "tab": "👤 我的",
            "path": "底部导航第五个 → 通知中心",
            "说明": "查看系统通知、互动通知",
        },
        "设置": {
            "tab": "👤 我的",
            "path": "底部导航第五个 → 设置",
            "说明": "语言切换、深色模式、隐私设置、通知开关",
        },
        "搜索": {
            "tab": "所有页面顶部",
            "path": "搜索栏",
            "说明": "全局搜索：可搜课程、活动、帖子、师生",
        },
        "通讯录": {
            "tab": "🏠 首页/👤 我的",
            "path": "搜索 → 找人",
            "说明": "搜索全校师生，按姓名/学院筛选，一键发起聊天",
        },
        "组队": {
            "tab": "（后期功能）",
            "path": "v2.0 上线",
            "说明": "发布团队招募需求、智能匹配队友",
        },
        "群聊": {
            "tab": "👤 我的 → 消息",
            "path": "消息列表 → 群组",
            "说明": "创建群聊、加入群组、分类管理",
        },
    }

    # 模糊匹配
    for key, info in nav_data.items():
        if query.lower() in key.lower() or key.lower() in query.lower():
            return json.dumps(info, ensure_ascii=False, indent=2)

    return json.dumps({
        "message": "没找到这个功能，试试问「首页」「学术」「活动」「树洞」「我的」「设置」等关键词",
    }, ensure_ascii=False)


def notifications(action: str, params: dict = None) -> str:
    """通知管理"""
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
    notifs = data.get("notifications", [])
    if unread_only:
        notifs = [n for n in notifs if not n.get("read", False)]
    results = []
    for n in notifs[:20]:
        results.append({
            "id": n.get("id", ""),
            "内容": n.get("content", ""),
            "时间": n.get("time", ""),
            "已读": n.get("read", False),
        })
    return json.dumps({"notifications": results, "unread": sum(1 for n in notifs if not n.get("read", False))}, ensure_ascii=False, indent=2)


def _mark_read(notification_id):
    data = _load_json("messages.json")
    notifs = data.get("notifications", [])
    for n in notifs:
        if n.get("id") == notification_id or notification_id is None:
            n["read"] = True
    _save_json("messages.json", data)
    return json.dumps({"status": "ok", "message": "已标记为已读"})


def _get_notification_settings():
    return json.dumps({
        "点赞通知": True,
        "评论通知": True,
        "消息通知": True,
        "系统通知": True,
    }, ensure_ascii=False, indent=2)


# ─── 工具定义 ───

NAVIGATE_TOOL = {
    "type": "function",
    "function": {
        "name": "navigate_platform",
        "description": "告诉用户平台某个功能在哪个页面、如何使用",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "用户想找的功能名称，如：首页、学术、课表、作业、活动、树洞、设置",
                },
            },
            "required": ["query"],
        },
    },
}

NOTIFICATIONS_TOOL = {
    "type": "function",
    "function": {
        "name": "notifications",
        "description": "通知管理：查看通知列表、标记已读、查看通知设置",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["list", "mark_read", "settings"],
                },
                "params": {
                    "type": "object",
                    "properties": {
                        "unread_only": {"type": "boolean"},
                        "notification_id": {"type": "string"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
