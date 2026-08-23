"""消息工具 — 私聊、通讯录"""
import json
import time
import uuid
from . import _load_json, _save_json


def campus_messaging(action: str, params: dict = None) -> str:
    if params is None:
        params = {}
    if action == "search":
        return _search_messages(params.get("keyword", ""))
    elif action == "start_chat":
        return _start_chat(params.get("target_id", ""), params.get("message", ""))
    elif action == "send":
        return _send_message(params.get("chat_id", ""), params.get("content", ""))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _search_messages(keyword=""):
    data = _load_json("messages.json")
    convs = data.get("conversations", [])
    if keyword:
        convs = [c for c in convs if keyword.lower() in c.get("contact", "").lower()]
    return json.dumps({"conversations": convs[:20]}, ensure_ascii=False, indent=2)


def _start_chat(target_id, message=""):
    data = _load_json("messages.json")
    conv = next((c for c in data.get("conversations", []) if c.get("id") == target_id), None)
    if not conv:
        users = _load_json("users.json").get("users", [])
        user = next((u for u in users if u.get("id") == target_id), None)
        if not user:
            return json.dumps({"error": "用户未找到"}, ensure_ascii=False)
        conv = {"id": f"m_{uuid.uuid4().hex[:10]}", "contact": user["name"], "avatar": user["name"][:1], "role": user.get("role", ""), "lastMsg": message, "time": time.strftime("%Y-%m-%dT%H:%M"), "msgs": [], "status": ""}
        data.setdefault("conversations", []).append(conv)
    if message:
        conv["msgs"].append({"from": "self", "text": message, "time": time.strftime("%Y-%m-%dT%H:%M")})
        conv["lastMsg"] = message
        conv["time"] = time.strftime("%Y-%m-%dT%H:%M")
    _save_json("messages.json", data)
    return json.dumps({"status": "ok", "conversation": conv}, ensure_ascii=False)


def _send_message(chat_id, content):
    data = _load_json("messages.json")
    conv = next((c for c in data.get("conversations", []) if c.get("id") == chat_id), None)
    if not conv:
        return json.dumps({"error": "会话未找到"}, ensure_ascii=False)
    msg = {"from": "self", "text": content, "time": time.strftime("%Y-%m-%dT%H:%M")}
    conv["msgs"].append(msg)
    conv["lastMsg"] = content
    conv["time"] = msg["time"]
    _save_json("messages.json", data)
    return json.dumps({"status": "ok", "message": msg}, ensure_ascii=False)


MESSAGING_TOOL = {
    "type": "function",
    "function": {
        "name": "campus_messaging",
        "description": "校园消息：搜索消息、发起聊天、发送消息",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["search", "start_chat", "send"]}, "params": {"type": "object", "properties": {"keyword": {"type": "string"}, "target_id": {"type": "string"}, "chat_id": {"type": "string"}, "content": {"type": "string"}, "message": {"type": "string"}}}}, "required": ["action"]},
    },
}
