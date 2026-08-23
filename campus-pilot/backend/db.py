"""SQLite 数据层 — 兼容层方案

设计目标：现有 tools/ 下所有代码通过 _load_json / _save_json 读写 JSON 文件。
本模块把这两个入口的底层实现替换为 SQLite，做到：
  1. 工具层代码零改动
  2. 多人并发安全（WAL 模式 + 写锁 + 事务）
  3. 按 id 合并写入：两个用户同时发帖不会互相覆盖（新增条目天然保留）

存储结构：
  每个 JSON 文件的每个顶层 key 对应一张表：doc_{文件名}_{key}
  表列: seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE, payload TEXT
  - seq 保持列表顺序
  - id 用于 merge（有 id 的条目按 id 更新/插入，无 id 的直接追加）
"""
import json
import os
import sqlite3
import threading

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DATA_DIR, "campus.db")

# JSON 文件名 -> 顶层 key 列表（所有数据文件的完整映射）
DOC_KEYS = {
    "posts.json": ["posts", "treehole_posts"],
    "users.json": ["users"],
    "events.json": ["events", "clubs"],
    "messages.json": ["conversations", "notifications"],
    "courses.json": ["courses", "assignments", "exam_scores", "resources", "qa"],
    "collects.json": ["collects"],
}

_write_lock = threading.RLock()
_conn_local = threading.local()


def _table_name(filename: str, key: str) -> str:
    stem = filename.replace(".json", "").replace("-", "_")
    return f"doc_{stem}_{key}"


def _get_conn() -> sqlite3.Connection:
    """获取线程本地连接（SQLite 连接不能跨线程共享）"""
    conn = getattr(_conn_local, "conn", None)
    if conn is None:
        os.makedirs(DATA_DIR, exist_ok=True)
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
        conn.execute("PRAGMA synchronous=NORMAL")
        _conn_local.conn = conn
    return conn


def _create_table(conn: sqlite3.Connection, table: str) -> None:
    conn.execute(
        f'CREATE TABLE IF NOT EXISTS "{table}" ('
        "seq INTEGER PRIMARY KEY AUTOINCREMENT, "
        "id TEXT UNIQUE, "
        "payload TEXT NOT NULL)"
    )


def _table_exists(conn: sqlite3.Connection, table: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone()
    return row is not None


# ─── 对外接口（与旧版签名一致） ───


def _load_json(filename: str) -> dict:
    """从 SQLite 读取整个文档，重组为原 JSON 结构"""
    keys = DOC_KEYS.get(filename)
    if keys is None:
        return {}
    conn = _get_conn()
    result = {}
    for key in keys:
        table = _table_name(filename, key)
        if not _table_exists(conn, table):
            result[key] = []
            continue
        rows = conn.execute(
            f'SELECT payload FROM "{table}" ORDER BY seq'
        ).fetchall()
        result[key] = [json.loads(r["payload"]) for r in rows]
    # 通讯录增强：真实注册用户合并进 users 列表（保持 mock 数据结构）
    if filename == "users.json" and "users" in result:
        result["users"] = _merge_registered_users(conn, result["users"])
    return result


def _merge_registered_users(conn: sqlite3.Connection, mock_users: list) -> list:
    """把 accounts 表中的真实注册用户合并进通讯录"""
    if not _table_exists(conn, "accounts"):
        return mock_users
    try:
        rows = conn.execute(
            "SELECT id, username, name, role, department, email FROM accounts"
        ).fetchall()
    except sqlite3.OperationalError:
        return mock_users
    registered = [
        {
            "id": r["id"],
            "name": r["name"],
            "role": r["role"],
            "department": r["department"] or "",
            "email": r["email"],
            "username": r["username"],
        }
        for r in rows
    ]
    existing_ids = {u.get("id") for u in mock_users}
    merged = list(mock_users)
    merged.extend(u for u in registered if u["id"] not in existing_ids)
    return merged


def _save_json(filename: str, data: dict) -> None:
    """把整个文档写回 SQLite（按 id merge，不删除已有条目）"""
    if not isinstance(data, dict):
        return
    with _write_lock:
        conn = _get_conn()
        try:
            for key, items in data.items():
                if not isinstance(items, list):
                    continue
                table = _table_name(filename, key)
                _create_table(conn, table)
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    payload = json.dumps(item, ensure_ascii=False)
                    item_id = item.get("id")
                    if item_id is not None:
                        cur = conn.execute(
                            f'UPDATE "{table}" SET payload=? WHERE id=?',
                            (payload, str(item_id)),
                        )
                        if cur.rowcount == 0:
                            conn.execute(
                                f'INSERT INTO "{table}" (id, payload) VALUES (?, ?)',
                                (str(item_id), payload),
                            )
                    else:
                        # 无 id 条目：内容相同的行已存在则跳过
                        # （防止 mock 种子无 id + 反复全量保存导致指数膨胀，曾撑爆到 782MB）
                        dup = conn.execute(
                            f'SELECT 1 FROM "{table}" WHERE payload=? LIMIT 1',
                            (payload,),
                        ).fetchone()
                        if dup is None:
                            conn.execute(
                                f'INSERT INTO "{table}" (payload) VALUES (?)',
                                (payload,),
                            )
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def _count_rows(filename: str, key: str) -> int:
    """统计某张表的行数（迁移/自检用）"""
    conn = _get_conn()
    table = _table_name(filename, key)
    if not _table_exists(conn, table):
        return 0
    row = conn.execute(f'SELECT COUNT(*) AS n FROM "{table}"').fetchone()
    return row["n"]


def delete_item(filename: str, key: str, item_id: str) -> bool:
    """按 id 删除条目（内容审核/数据管理用）

    merge 写入不会删除条目，需要显式删除时用本函数。
    """
    with _write_lock:
        conn = _get_conn()
        table = _table_name(filename, key)
        if not _table_exists(conn, table):
            return False
        cur = conn.execute(
            f'DELETE FROM "{table}" WHERE id=?', (str(item_id),)
        )
        conn.commit()
        return cur.rowcount > 0


def init_db() -> None:
    """初始化：确保所有表存在（空表）"""
    conn = _get_conn()
    for filename, keys in DOC_KEYS.items():
        for key in keys:
            _create_table(conn, _table_name(filename, key))
    conn.commit()
