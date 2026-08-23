#!/usr/bin/env python3
"""SURF Campus 数据库完全重建 v2

全部数据源：
- doc_* 表 → 对应 .bak 原始种子（posts/events/messages/users/courses）
- accounts → /tmp/accounts_backup.json（真实注册用户）
- verification_codes / resource_quota → 空表（运行时自动使用）
"""
import json
import os
import secrets
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB = os.path.join(DATA_DIR, "campus.db")

# doc 表 → (.bak 文件, key, id 前缀)；None 前缀 = 保留原 id
DOC_SEEDS = {
    "doc_posts_posts": ("posts.json.bak", "posts", "post_"),
    "doc_posts_treehole_posts": ("posts.json.bak", "treehole_posts", "th_"),
    "doc_users_users": ("users.json.bak", "users", None),
    "doc_events_events": ("events.json.bak", "events", "evt_"),
    "doc_events_clubs": ("events.json.bak", "clubs", "club_"),
    "doc_messages_conversations": ("messages.json.bak", "conversations", "conv_"),
    "doc_messages_notifications": ("messages.json.bak", "notifications", "ntf_"),
    "doc_courses_courses": ("courses.json.bak", "courses", None),
    "doc_courses_assignments": ("courses.json.bak", "assignments", "asg_"),
    "doc_courses_exam_scores": ("courses.json.bak", "exam_scores", "scr_"),
    "doc_courses_qa": ("courses.json.bak", "qa", "qa_"),
    "doc_courses_resources": ("courses.json.bak", "resources", "res_"),
    "doc_collects_collects": ("posts.json.bak", "collects", "col_"),
}


def build():
    for suffix in ("", "-wal", "-shm"):
        p = DB + suffix
        if os.path.exists(p):
            os.remove(p)
    print("[删除] 旧数据库文件", flush=True)

    conn = sqlite3.connect(DB, timeout=15)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")

    # 1. doc 表从 .bak 重建
    for table, (bak, key, prefix) in DOC_SEEDS.items():
        with open(os.path.join(DATA_DIR, bak), encoding="utf-8") as f:
            doc = json.load(f)
        items = doc.get(key, [])
        conn.execute(
            f'CREATE TABLE IF NOT EXISTS "{table}" ('
            "seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE, payload TEXT NOT NULL)"
        )
        for it in items:
            item = dict(it)
            if prefix:
                item["id"] = prefix + secrets.token_hex(4)
            if key == "resources":
                item.setdefault("downloads", 0)
                item.setdefault("time", "2026-07-01 08:00")
            conn.execute(
                f'INSERT INTO "{table}" (id, payload) VALUES (?, ?)',
                (item["id"], json.dumps(item, ensure_ascii=False)),
            )
        print(f"[种子] {table}: {len(items)} 行（{key}）", flush=True)

    # 2. accounts（真实注册用户，排除测试账号）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS accounts ("
        "id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, "
        "password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, "
        "role TEXT DEFAULT 'student', department TEXT DEFAULT '', created_at TEXT NOT NULL)"
    )
    if os.path.exists("/tmp/accounts_backup.json"):
        with open("/tmp/accounts_backup.json", encoding="utf-8") as f:
            accounts = json.load(f)
        n = 0
        for a in accounts:
            if a.get("username") == "test_res_user" or a.get("email") == "test_res@example.com":
                continue
            conn.execute(
                "INSERT OR IGNORE INTO accounts (id, username, email, password_salt, password_hash, name, role, department, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (a["id"], a["username"], a["email"], a["password_salt"], a["password_hash"],
                 a["name"], a.get("role", "student"), a.get("department", ""), a["created_at"]),
            )
            n += 1
        print(f"[恢复] accounts: {n} 个真实账号", flush=True)

    # 3. 空表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS verification_codes ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, code TEXT NOT NULL, "
        "created_at REAL NOT NULL, expires_at REAL NOT NULL, used INTEGER DEFAULT 0)"
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_code_email ON verification_codes(email)")
    conn.execute(
        "CREATE TABLE IF NOT EXISTS resource_quota ("
        "user_id TEXT NOT NULL, day TEXT NOT NULL, used INTEGER DEFAULT 0, "
        "bonus INTEGER DEFAULT 0, PRIMARY KEY (user_id, day))"
    )
    conn.commit()
    conn.close()
    print("[完成] 重建结束", flush=True)

    # 验证
    conn = sqlite3.connect(DB, timeout=15)
    conn.row_factory = sqlite3.Row
    print("\n=== 重建后各表 ===", flush=True)
    for t in [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()]:
        n = conn.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
        print(f"{t}: {n}", flush=True)
    conn.close()
    print(f"数据库大小: {os.path.getsize(DB)/1024/1024:.2f} MB", flush=True)


if __name__ == "__main__":
    build()
