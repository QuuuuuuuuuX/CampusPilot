"""工具包 — 通用的数据加载/保存工具"""
import json
import os
import threading

DATA_DIR = os.environ.get("SURF_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
_FILE_LOCK = threading.Lock()


def _load_json(filename: str) -> dict:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _save_json(filename: str, data) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, filename)
    with _FILE_LOCK:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
