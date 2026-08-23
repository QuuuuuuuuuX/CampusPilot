"""工具包 — 通用数据读写（SQLite 兼容层）

对外签名与旧版 JSON 实现完全一致：
    _load_json(filename) -> dict
    _save_json(filename, data) -> None
底层已切换为 SQLite（见 db.py），现有工具代码零改动。
"""
import os
import sys

# backend 目录既可能作为包（backend.tools）被导入，也可能直接作为顶层包（python main.py）
try:
    from .. import db  # 包模式
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import db  # 顶层模式

DATA_DIR = db.DATA_DIR


def _load_json(filename: str) -> dict:
    """从 SQLite 读取文档（保持原 JSON 结构）"""
    return db._load_json(filename)


def _save_json(filename: str, data) -> None:
    """写回 SQLite（按 id merge）"""
    db._save_json(filename, data)


def delete_item(filename: str, key: str, item_id: str) -> bool:
    """按 id 删除条目（merge 写入不删除，删除需显式调用）"""
    return db.delete_item(filename, key, item_id)
