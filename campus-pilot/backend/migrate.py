"""JSON → SQLite 数据迁移脚本

用法:  python migrate.py
幂等:  可重复执行，已有 id 的条目按 id 更新，不会产生重复。
       迁移完成后 JSON 文件保留作为备份（不再被读取）。
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import DOC_KEYS, DATA_DIR, init_db, _count_rows
from tools import _load_json, _save_json  # noqa: E402


def migrate() -> None:
    init_db()
    print("=" * 50)
    print("JSON → SQLite 迁移开始")
    print("=" * 50)

    total_before = 0
    total_after = 0

    for filename, keys in DOC_KEYS.items():
        json_path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(json_path):
            print(f"[跳过] {filename} 不存在")
            continue

        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, dict):
            print(f"[警告] {filename} 结构异常，跳过")
            continue

        before_counts = {}
        for key in keys:
            before_counts[key] = _count_rows(filename, key)
            total_before += before_counts[key]

        _save_json(filename, data)

        for key in keys:
            after = _count_rows(filename, key)
            total_after += after
            print(f"  {filename}:{key}  {before_counts[key]} → {after} 行")

        # 迁移成功后把 JSON 重命名备份（防止误以为还在用 JSON）
        backup = json_path + ".bak"
        if not os.path.exists(backup):
            os.rename(json_path, backup)
            print(f"[备份] {filename} → {filename}.bak")
        else:
            print(f"[保留] {filename}.bak 已存在，跳过备份")

    print("=" * 50)
    print(f"迁移完成！总行数: {total_before} → {total_after}")
    print(f"数据库: {os.path.join(DATA_DIR, 'campus.db')}")


if __name__ == "__main__":
    migrate()
