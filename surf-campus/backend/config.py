"""配置管理"""
import os
from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("PROVIDER", "deepseek")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")


def get_llm_config() -> dict:
    if PROVIDER == "deepseek":
        return {"base_url": DEEPSEEK_BASE_URL, "api_key": DEEPSEEK_API_KEY, "model": DEEPSEEK_MODEL}
    return {"base_url": OLLAMA_BASE_URL, "api_key": "ollama", "model": OLLAMA_MODEL}
