"""AI Agent — 多轮对话引擎（兼容 DeepSeek / Ollama Function Calling）"""
import json
from openai import OpenAI
from config import get_llm_config

# 导入所有工具
from tools.search import SEARCH_TOOL, search_info
from tools.academic import ACADEMIC_TOOL, academic_center
from tools.community import COMMUNITY_TOOL, community
from tools.treehole import TREEHOLE_TOOL, anonymous_tree_hole
from tools.messaging import MESSAGING_TOOL, campus_messaging
from tools.events import CLUBS_TOOL, clubs_events
from tools.platform import NAVIGATE_TOOL, NOTIFICATIONS_TOOL, navigate_platform, notifications

# System Prompt（从外部文件加载）
import os
_prompt_path = os.path.join(os.path.dirname(__file__), "..", "agent", "SYSTEM_PROMPT.md")
with open(_prompt_path, encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

# 所有工具定义和映射
TOOL_DEFINITIONS = [
    SEARCH_TOOL,
    ACADEMIC_TOOL,
    COMMUNITY_TOOL,
    TREEHOLE_TOOL,
    MESSAGING_TOOL,
    CLUBS_TOOL,
    NAVIGATE_TOOL,
    NOTIFICATIONS_TOOL,
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
        self._client = None
        self.model = None
        self.conversations: dict[str, list[dict]] = {}

    @property
    def client(self):
        """懒加载：首次对话时才创建 LLM client，避免 AI key 缺失导致整个服务无法启动"""
        if self._client is None:
            cfg = get_llm_config()
            self._client = OpenAI(
                api_key=cfg["api_key"],
                base_url=cfg["base_url"],
            )
            self.model = cfg["model"]
        return self._client

    def _get_history(self, session_id: str) -> list[dict]:
        if session_id not in self.conversations:
            self.conversations[session_id] = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
        return self.conversations[session_id]

    def chat(self, session_id: str, user_message: str) -> str:
        history = self._get_history(session_id)
        history.append({"role": "user", "content": user_message})

        max_rounds = 5
        try:
            client = self.client  # 触发懒加载
            model = self.model
        except Exception as e:
            error_msg = f"（AI 服务未配置：{str(e)[:60]}）"
            history.append({"role": "assistant", "content": error_msg})
            return error_msg

        for _ in range(max_rounds):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=history,
                    tools=TOOL_DEFINITIONS,
                    tool_choice="auto",
                    temperature=0.5,
                    max_tokens=1024,
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
                if func:
                    result = func(**args)
                else:
                    result = json.dumps({"error": f"未知工具: {func_name}"})

                history.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })

        # 超 max_rounds 强制总结
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=history,
                temperature=0.5,
                max_tokens=512,
            )
            reply = response.choices[0].message.content
        except Exception:
            reply = "抱歉，让我想想。请问还有什么需要的吗？"

        history.append({"role": "assistant", "content": reply})
        return reply

    def clear_session(self, session_id: str) -> None:
        if session_id in self.conversations:
            del self.conversations[session_id]
