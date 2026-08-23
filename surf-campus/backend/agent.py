"""AI Agent — 多轮对话引擎（兼容 DeepSeek / Ollama Function Calling）"""
import json
import os
from openai import OpenAI
from config import get_llm_config

from tools.search import SEARCH_TOOL, search_info
from tools.academic import ACADEMIC_TOOL, academic_center
from tools.community import COMMUNITY_TOOL, community
from tools.treehole import TREEHOLE_TOOL, anonymous_tree_hole
from tools.messaging import MESSAGING_TOOL, campus_messaging
from tools.events import CLUBS_TOOL, clubs_events
from tools.platform import NAVIGATE_TOOL, NOTIFICATIONS_TOOL, navigate_platform, notifications

_prompt_path = os.path.join(os.path.dirname(__file__), "..", "agent", "SYSTEM_PROMPT.md")
with open(_prompt_path, encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

TOOL_DEFINITIONS = [
    SEARCH_TOOL, ACADEMIC_TOOL, COMMUNITY_TOOL, TREEHOLE_TOOL,
    MESSAGING_TOOL, CLUBS_TOOL, NAVIGATE_TOOL, NOTIFICATIONS_TOOL,
]

TOOL_MAP = {
    "search_info": search_info,
    "academic_center": academic_center,
    "community": community,
    "anonymous_tree_hole": anonymous_tree_hole,
    "campus_messaging": campus_messaging,
    "clubs_events": clubs_events,
    "navigate_platform": navigate_platform,
    "notifications": notifications,
}


class CampusAgent:
    def __init__(self):
        cfg = get_llm_config()
        self.client = OpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])
        self.model = cfg["model"]
        self.conversations: dict[str, list[dict]] = {}

    def _get_history(self, session_id: str) -> list[dict]:
        if session_id not in self.conversations:
            self.conversations[session_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
        return self.conversations[session_id]

    def chat(self, session_id: str, user_message: str) -> str:
        history = self._get_history(session_id)
        history.append({"role": "user", "content": user_message})

        max_rounds = 5
        for _ in range(max_rounds):
            try:
                response = self.client.chat.completions.create(
                    model=self.model, messages=history,
                    tools=TOOL_DEFINITIONS, tool_choice="auto",
                    temperature=0.5, max_tokens=1024,
                )
            except Exception as e:
                error_msg = f"（AI 暂时无法回应：{str(e)[:80]}）"
                history.append({"role": "assistant", "content": error_msg})
                return error_msg

            msg = response.choices[0].message
            if not msg.tool_calls:
                history.append({"role": "assistant", "content": msg.content})
                return msg.content

            history.append(msg)
            for tc in msg.tool_calls:
                func_name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                func = TOOL_MAP.get(func_name)
                result = func(**args) if func else json.dumps({"error": f"未知工具: {func_name}"})
                history.append({"role": "tool", "tool_call_id": tc.id, "content": result})

        try:
            response = self.client.chat.completions.create(model=self.model, messages=history, temperature=0.5, max_tokens=512)
            reply = response.choices[0].message.content
        except Exception:
            reply = "抱歉，让我想想。请问还有什么需要的吗？"
        history.append({"role": "assistant", "content": reply})
        return reply

    def clear_session(self, session_id: str) -> None:
        self.conversations.pop(session_id, None)
