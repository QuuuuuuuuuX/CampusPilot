#!/usr/bin/env python3
"""修复被指数膨胀撑爆的 courses 表（assignments/exam_scores/qa/resources）

原因：_save_json 对无 id 的条目每次都 INSERT，而 courses.json 的 mock 种子
（assignments/exam_scores/qa）没有 id，任何全量保存都会让它们翻倍，
多次保存后指数膨胀（实测到 262 万行 / 782MB）。

本脚本：重建这 4 张表 + resource_quota，从 .bak 原始种子恢复。
用法：先停掉所有进程再执行。
"""
import json
import os
import secrets
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "campus.db")

BLOATED = [
    "doc_courses_assignments",
    "doc_courses_exam_scores",
    "doc_courses_qa",
    "doc_courses_resources",
    "resource_quota",
]

SEED = {
    "doc_courses_assignments": ("courses.json.bak", "assignments", "asg_"),
    "doc_courses_exam_scores": ("courses.json.bak", "exam_scores", "scr_"),
    "doc_courses_qa": ("courses.json.bak", "qa", "qa_"),
    "doc_courses_resources": ("courses.json.bak", "resources", "res_"),
}

conn = sqlite3.connect(DB, timeout=15)
conn.row_factory = sqlite3.Row

# 1. 删掉被撑爆的表
for t in BLOATED:
    conn.execute(f'DROP TABLE IF EXISTS "{t}"')
    print(f"[删除] {t}")

# 2. 重建 + 从 .bak 恢复种子（补 id/downloads/time）
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
for table, (bak_name, key, prefix) in SEED.items():
    with open(os.path.join(data_dir, bak_name), encoding="utf-8") as f:
        doc = json.load(f)
    items = doc.get(key, [])
    conn.execute(
        f'CREATE TABLE IF NOT EXISTS "{table}" ('
        "seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE, payload TEXT NOT NULL)"
    )
    for it in items:
        item = dict(it)
        item["id"] = prefix + secrets.token_hex(4)
        if key == "resources":
            item.setdefault("downloads", 0)
            item.setdefault("time", "2026-07-01 08:00")
        conn.execute(
            f'INSERT INTO "{table}" (id, payload) VALUES (?, ?)',
            (item["id"], json.dumps(item, ensure_ascii=False)),
        )
    print(f"[恢复] {table}: {len(items)} 行（{key}）")

# 3. 删除测试残留账号
cur = conn.execute("DELETE FROM accounts WHERE username=? OR email=?", ("test_res_user", "test_res@example.com"))
print(f"[清理] 测试账号删除 {cur.rowcount} 个")

conn.commit()

# 4. 验证
print("\n=== 修复后 ===")
for t in [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'doc_courses_%' OR name='resource_quota'").fetchall()]:
    n = conn.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
    print(f"{t}: {n}")
print("账号数:", conn.execute("SELECT COUNT(*) FROM accounts").fetchone()[0])
conn.close()

size = os.path.getsize(DB)
print(f"\n数据库大小: {size/1024/1024:.2f} MB")
