"""用户认证系统 — 注册 / 登录 / JWT / 邮箱验证码

安全设计：
  - 密码: PBKDF2-HMAC-SHA256 (200,000 次迭代) + 随机盐，标准库实现零依赖
  - Token: JWT (PyJWT)，有效期 7 天
  - 验证码: 6 位数字，5 分钟有效，60 秒发送冷却，一次性使用
  - 密钥: 从环境变量 JWT_SECRET 读取；未设置时使用开发密钥（部署必须改！）

用户表 accounts 与业务数据共用同一个 SQLite 文件 (data/campus.db)。
"""
import hashlib
import hmac
import os
import random
import re
import secrets
import sqlite3
import time
import uuid

import jwt

from db import DB_PATH, _get_conn, _write_lock
import mail

# ─── 配置 ───

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 7 * 24 * 3600  # 7 天
PBKDF2_ITERATIONS = 200_000

ACCOUNTS_TABLE = "accounts"
CODE_TABLE = "verification_codes"
CODE_TTL = 5 * 60          # 验证码 5 分钟有效
CODE_COOLDOWN = 60         # 发送冷却 60 秒

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _ensure_accounts_table(conn: sqlite3.Connection) -> None:
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS {ACCOUNTS_TABLE} (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            department TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )"""
    )
    conn.commit()


def _ensure_code_table(conn: sqlite3.Connection) -> None:
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS {CODE_TABLE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at REAL NOT NULL,
            expires_at REAL NOT NULL,
            used INTEGER DEFAULT 0
        )"""
    )
    conn.execute(f"CREATE INDEX IF NOT EXISTS idx_code_email ON {CODE_TABLE}(email)")
    conn.commit()


# ─── 邮箱验证码 ───


def send_verification_code(email: str) -> dict:
    """生成验证码并发送到邮箱

    返回 {"status": "ok", "sent": bool, "code": str|None}
    - sent=True  已真实发送（SMTP 已配置）
    - sent=False 未配置 SMTP，验证码打进服务日志，code 字段返回便于开发联调
    """
    email = email.strip().lower()
    if not _EMAIL_RE.match(email):
        raise ValueError("邮箱格式不正确")

    with _write_lock:
        conn = _get_conn()
        _ensure_code_table(conn)
        # 冷却检查：同一邮箱 60 秒内只能发一次
        row = conn.execute(
            f"SELECT created_at FROM {CODE_TABLE} WHERE email=? ORDER BY id DESC LIMIT 1",
            (email,),
        ).fetchone()
        if row is not None:
            elapsed = time.time() - float(row["created_at"])
            if elapsed < CODE_COOLDOWN:
                raise ValueError(f"发送太频繁，请 {int(CODE_COOLDOWN - elapsed)} 秒后再试")

        code = f"{random.randint(0, 999999):06d}"
        now = time.time()
        conn.execute(
            f"INSERT INTO {CODE_TABLE} (email, code, created_at, expires_at, used) "
            "VALUES (?, ?, ?, ?, 0)",
            (email, code, now, now + CODE_TTL),
        )
        conn.commit()

    body = (
        "【XJTLU Virtual Campus】\n\n"
        f"你的验证码是：{code}\n"
        f"{CODE_TTL // 60} 分钟内有效，请勿泄露给他人。\n"
        "如非本人操作，请忽略本邮件。"
    )
    sent = mail.send_email(email, "【XJTLU Virtual Campus】验证码", body)
    return {"status": "ok", "sent": sent, "code": code if not sent else None}


def verify_code(email: str, code: str) -> bool:
    """校验验证码：正确且未使用且未过期 → 标记已用并返回 True"""
    email = email.strip().lower()
    code = code.strip()
    with _write_lock:
        conn = _get_conn()
        _ensure_code_table(conn)
        row = conn.execute(
            f"SELECT * FROM {CODE_TABLE} WHERE email=? AND code=? AND used=0 "
            "AND expires_at>? ORDER BY id DESC LIMIT 1",
            (email, code, time.time()),
        ).fetchone()
        if row is None:
            return False
        conn.execute(
            f"UPDATE {CODE_TABLE} SET used=1 WHERE id=?", (row["id"],)
        )
        conn.commit()
        return True


# ─── 密码哈希 ───


def hash_password(password: str) -> tuple[str, str]:
    """返回 (salt_hex, hash_hex)"""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return salt.hex(), digest.hex()


def verify_password(password: str, salt_hex: str, hash_hex: str) -> bool:
    salt = bytes.fromhex(salt_hex)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return hmac.compare_digest(digest.hex(), hash_hex)


# ─── JWT ───


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str | None:
    """返回 user_id；无效或过期返回 None"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


# ─── 用户 CRUD ───


def create_user(username: str, email: str, password: str, name: str,
                department: str = "") -> dict:
    """创建用户，返回用户信息（不含密码）。用户名/邮箱重复抛 ValueError。"""
    username = username.strip().lower()
    email = email.strip().lower()
    name = name.strip()

    if not (3 <= len(username) <= 20) or not username.replace("_", "").isalnum():
        raise ValueError("用户名需 3-20 位字母/数字/下划线")
    if "@" not in email or "." not in email:
        raise ValueError("邮箱格式不正确")
    if len(password) < 6:
        raise ValueError("密码至少 6 位")
    if not name:
        raise ValueError("昵称不能为空")

    salt, digest = hash_password(password)
    user_id = f"u_{uuid.uuid4().hex[:12]}"
    created = time.strftime("%Y-%m-%d %H:%M")

    with _write_lock:
        conn = _get_conn()
        _ensure_accounts_table(conn)
        try:
            conn.execute(
                f"INSERT INTO {ACCOUNTS_TABLE} "
                "(id, username, email, password_salt, password_hash, name, role, department, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?)",
                (user_id, username, email, salt, digest, name, department, created),
            )
            conn.commit()
        except sqlite3.IntegrityError as e:
            raise ValueError("用户名或邮箱已被注册") from e

    return {
        "id": user_id, "username": username, "email": email,
        "name": name, "role": "student", "department": department,
        "created_at": created,
    }


def get_user_by_identifier(identifier: str) -> dict | None:
    """按用户名或邮箱查找用户（返回脱敏信息）"""
    user = get_credentials(identifier)
    if user is None:
        return None
    return {k: v for k, v in user.items() if k not in ("password_salt", "password_hash")}


def get_credentials(identifier: str) -> dict | None:
    """登录专用：按用户名或邮箱查找，返回含密码哈希的完整记录"""
    identifier = identifier.strip().lower()
    conn = _get_conn()
    _ensure_accounts_table(conn)
    row = conn.execute(
        f"SELECT * FROM {ACCOUNTS_TABLE} WHERE username=? OR email=?",
        (identifier, identifier),
    ).fetchone()
    return dict(row) if row is not None else None


def get_user_by_id(user_id: str) -> dict | None:
    conn = _get_conn()
    _ensure_accounts_table(conn)
    row = conn.execute(
        f"SELECT * FROM {ACCOUNTS_TABLE} WHERE id=?", (user_id,)
    ).fetchone()
    return _row_to_user(row) if row else None


def change_password(user_id: str, old_password: str, new_password: str) -> None:
    """修改密码：校验旧密码后更新（新密码至少 6 位）"""
    if len(new_password) < 6:
        raise ValueError("新密码至少 6 位")
    conn = _get_conn()
    _ensure_accounts_table(conn)
    row = conn.execute(
        f"SELECT * FROM {ACCOUNTS_TABLE} WHERE id=?", (user_id,)
    ).fetchone()
    if row is None:
        raise ValueError("用户不存在")
    if not verify_password(old_password, row["password_salt"], row["password_hash"]):
        raise ValueError("当前密码不正确")
    salt, digest = hash_password(new_password)
    with _write_lock:
        conn.execute(
            f"UPDATE {ACCOUNTS_TABLE} SET password_salt=?, password_hash=? WHERE id=?",
            (salt, digest, user_id),
        )
        conn.commit()


def update_profile(user_id: str, **fields) -> dict | None:
    """更新昵称/院系等资料。可更新字段: name, department"""
    allowed = {"name", "department"}
    updates = {k: v.strip() for k, v in fields.items() if k in allowed and v}
    if not updates:
        return get_user_by_id(user_id)
    sets = ", ".join(f"{k}=?" for k in updates)
    with _write_lock:
        conn = _get_conn()
        _ensure_accounts_table(conn)
        conn.execute(
            f"UPDATE {ACCOUNTS_TABLE} SET {sets} WHERE id=?",
            (*updates.values(), user_id),
        )
        conn.commit()
    return get_user_by_id(user_id)


def _row_to_user(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "department": row["department"],
        "created_at": row["created_at"],
    }


def list_accounts() -> list[dict]:
    """全部注册用户（通讯录合并用）"""
    conn = _get_conn()
    _ensure_accounts_table(conn)
    rows = conn.execute(
        f"SELECT * FROM {ACCOUNTS_TABLE} ORDER BY created_at DESC"
    ).fetchall()
    return [_row_to_user(r) for r in rows]
