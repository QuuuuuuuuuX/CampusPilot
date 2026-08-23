"""校园通讯与消息工具"""
import json
import time
from . import _load_json, _save_json


def campus_messaging(action: str, params: dict = None) -> str:
    """通讯与消息相关操作"""
    if params is None:
        params = {}

    if action == "find_person":
        return _find_person(params.get("name", ""), params.get("department"))
    elif action == "start_chat":
        return _start_chat(params.get("target_id", ""), params.get("message", ""))
    elif action == "send_message":
        return _send_message(params.get("chat_id", ""), params.get("content", ""))
    elif action == "search_messages":
        return _search_messages(params.get("keyword", ""))
    elif action == "list_conversations":
        return _list_conversations()
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _find_person(name, department=None):
    data = _load_json("users.json")
    users = data.get("users", [])
    results = []
    for u in users:
        if name and name.lower() not in u.get("name", "").lower():
            continue
        if department and department.lower() not in u.get("department", "").lower():
            continue
        results.append({
            "id": u.get("id", ""),
            "姓名": u["name"],
            "角色": u.get("role", ""),
            "学院": u.get("department", ""),
            "邮箱": u.get("email", ""),
        })
    if not results:
        return json.dumps({"message": "没有找到该用户，试试其他关键词？"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _start_chat(target_id, message, sender="me"):
    data = _load_json("messages.json")
    conversations = data.get("conversations", [])
    # 查找或创建会话
    chat_id = f"chat_{int(time.time())}"
    conv = {
        "id": chat_id,
        "target_id": target_id,
        "messages": [{"sender": sender, "content": message, "time": time.strftime("%Y-%m-%d %H:%M")}],
        "created": time.strftime("%Y-%m-%d %H:%M"),
    }
    conversations.append(conv)
    _save_json("messages.json", {"conversations": conversations})
    return json.dumps({"status": "ok", "chat_id": chat_id, "message": "消息已发送"})


def _send_message(chat_id, content, sender="me"):
    data = _load_json("messages.json")
    conversations = data.get("conversations", [])
    for conv in conversations:
        if conv.get("id") == chat_id:
            conv["messages"].append({
                "sender": sender,
                "content": content,
                "time": time.strftime("%Y-%m-%d %H:%M"),
            })
            _save_json("messages.json", {"conversations": conversations})
            return json.dumps({"status": "ok", "message": "消息已发送"})
    return json.dumps({"error": "会话未找到"})


def _list_conversations():
    """会话列表：每个会话显示对方、最后一条消息、时间"""
    data = _load_json("messages.json")
    conversations = data.get("conversations", [])
    results = []
    for conv in conversations:
        msgs = conv.get("messages", [])
        last = msgs[-1] if msgs else {}
        results.append({
            "id": conv.get("id", ""),
            "对方": conv.get("target_name", conv.get("target_id", "")),
            "最后消息": last.get("content", ""),
            "时间": last.get("time", conv.get("created", "")),
            "条数": len(msgs),
        })
    return json.dumps({"conversations": results}, ensure_ascii=False, indent=2)


def _search_messages(keyword):
    data = _load_json("messages.json")
    conversations = data.get("conversations", [])
    results = []
    for conv in conversations:
        for msg in conv.get("messages", []):
            if keyword.lower() in msg.get("content", "").lower():
                results.append({
                    "会话": conv.get("id", ""),
                    "内容": msg["content"],
                    "时间": msg.get("time", ""),
                })
    if not results:
        return json.dumps({"message": "没有找到匹配的消息"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


# ─── 工具定义 ───

MESSAGING_TOOL = {
    "type": "function",
    "function": {
        "name": "campus_messaging",
        "description": "校园通讯：查找师生、发起聊天、发送消息、搜索聊天记录",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["find_person", "start_chat", "send_message", "search_messages", "list_conversations"],
                },
                "params": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "department": {"type": "string"},
                        "target_id": {"type": "string"},
                        "message": {"type": "string"},
                        "chat_id": {"type": "string"},
                        "content": {"type": "string"},
                        "keyword": {"type": "string"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
