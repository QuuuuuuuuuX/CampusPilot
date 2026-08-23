"""课程资料「以一换一」激励系统

参考 z-library 的激励模式：
- 每位同学每天默认有 DAILY_LIMIT 次免费下载额度
- 分享 1 份资料 → 当日下载额度 +SHARE_REWARD 次（每份资料只奖励一次）
- 每日 0 点重置，多分享多解锁
- 额度在文件实际下发时扣减（真正限制每日下载量）

存储：
- 资料本身仍存 doc_courses_resources（db.py 兼容层，按 id merge）
- 下载额度存独立表 resource_quota（user_id + day 主键）
"""
import datetime
import json
import os
import secrets
import sys

from . import _load_json, _save_json

try:
    from .. import db  # 包模式
except ImportError:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import db  # 顶层模式

# ─── 激励规则配置 ───

DAILY_LIMIT = 3          # 每天免费下载次数
SHARE_REWARD = 2         # 分享一份资料解锁的额外下载次数

RULES = [
    f"每位同学每天可免费下载 {DAILY_LIMIT} 份课程资料",
    f"分享 1 份资料，当日下载额度 +{SHARE_REWARD} 次",
    "下载额度每天 0 点重置，多分享多解锁",
    "资料仅限校内课程学习使用，请尊重原作者版权",
]

RULES_TEXT = "\n".join(f"· {r}" for r in RULES)


def _today() -> str:
    return datetime.date.today().isoformat()


# ─── 数据层 ───

def _quota_conn():
    conn = db._get_conn()
    conn.execute(
        "CREATE TABLE IF NOT EXISTS resource_quota ("
        "user_id TEXT NOT NULL, "
        "day TEXT NOT NULL, "
        "used INTEGER DEFAULT 0, "
        "bonus INTEGER DEFAULT 0, "
        "PRIMARY KEY (user_id, day))"
    )
    return conn


def _ensure_resource_ids():
    """给历史数据补 id（直接改 SQLite，避免 merge 产生重复行）

    覆盖 courses.json 的全部 4 张列表表：assignments / exam_scores / qa / resources
    （courses 表本身有 id）。resources 额外补 downloads / time。
    """
    conn = db._get_conn()
    tables = [
        ("doc_courses_assignments", "asg_"),
        ("doc_courses_exam_scores", "scr_"),
        ("doc_courses_qa", "qa_"),
        ("doc_courses_resources", "res_"),
    ]
    for table, prefix in tables:
        if not db._table_exists(conn, table):
            continue
        rows = conn.execute(f'SELECT seq, payload FROM "{table}"').fetchall()
        changed = []
        for r in rows:
            try:
                p = json.loads(r["payload"])
            except Exception:
                continue
            if not isinstance(p, dict):
                continue
            need = False
            if not p.get("id"):
                p["id"] = prefix + secrets.token_hex(4)
                need = True
            if table.endswith("_resources"):
                if "downloads" not in p:
                    p["downloads"] = 0
                    need = True
                if "time" not in p:
                    p["time"] = "2026-07-01 08:00"
                    need = True
            if need:
                changed.append((json.dumps(p, ensure_ascii=False), r["seq"]))
        for payload, seq in changed:
            conn.execute(f'UPDATE "{table}" SET payload=? WHERE seq=?', (payload, seq))
        if changed:
            conn.commit()


def get_quota(user_id: str) -> dict:
    """今日额度详情"""
    conn = _quota_conn()
    row = conn.execute(
        "SELECT used, bonus FROM resource_quota WHERE user_id=? AND day=?",
        (user_id, _today()),
    ).fetchone()
    used = row["used"] if row else 0
    bonus = row["bonus"] if row else 0
    remaining = max(0, DAILY_LIMIT + bonus - used)
    return {
        "今日额度": DAILY_LIMIT,
        "已用": used,
        "剩余": remaining,
        "分享奖励": SHARE_REWARD,
        "规则": RULES,
    }


def consume_download(user_id: str):
    """尝试消耗一次下载额度。返回 (ok, remaining_after)"""
    conn = _quota_conn()
    row = conn.execute(
        "SELECT used, bonus FROM resource_quota WHERE user_id=? AND day=?",
        (user_id, _today()),
    ).fetchone()
    used = row["used"] if row else 0
    bonus = row["bonus"] if row else 0
    remaining = DAILY_LIMIT + bonus - used
    if remaining <= 0:
        return False, 0
    conn.execute(
        "INSERT INTO resource_quota (user_id, day, used, bonus) VALUES (?, ?, 1, 0) "
        "ON CONFLICT(user_id, day) DO UPDATE SET used = used + 1",
        (user_id, _today()),
    )
    conn.commit()
    return True, remaining - 1


def add_share_bonus(user_id: str):
    """分享资料 → 当日额度 +SHARE_REWARD"""
    conn = _quota_conn()
    conn.execute(
        "INSERT INTO resource_quota (user_id, day, used, bonus) VALUES (?, ?, 0, ?) "
        "ON CONFLICT(user_id, day) DO UPDATE SET bonus = bonus + ?",
        (user_id, _today(), SHARE_REWARD, SHARE_REWARD),
    )
    conn.commit()


# ─── 业务逻辑 ───

def list_resources(keyword: str = "", course: str = "", user_id: str = None) -> dict:
    _ensure_resource_ids()
    data = _load_json("courses.json")
    resources = data.get("resources", [])
    results = []
    for r in resources:
        if keyword and keyword.lower() not in r.get("name", "").lower():
            continue
        if course and course.lower() not in r.get("course", "").lower():
            continue
        results.append({
            "id": r.get("id", ""),
            "名称": r.get("name", ""),
            "课程": r.get("course", ""),
            "类型": r.get("type", ""),
            "上传者": r.get("uploader", ""),
            "下载次数": r.get("downloads", 0),
            "时间": r.get("time", ""),
            "可下载": bool(r.get("filename")),
        })
    return {
        "resources": results,
        "quota": get_quota(user_id) if user_id else None,
    }


def get_resource(resource_id: str) -> dict:
    _ensure_resource_ids()
    data = _load_json("courses.json")
    for r in data.get("resources", []):
        if r.get("id") == resource_id:
            return r
    return None


def record_download(resource_id: str):
    """资料下载次数 +1（只写 resources 键，避免全量保存 courses.json）"""
    data = _load_json("courses.json")
    for r in data.get("resources", []):
        if r.get("id") == resource_id:
            r["downloads"] = r.get("downloads", 0) + 1
            break
    _save_json("courses.json", {"resources": data["resources"]})


def share_resource(title: str, course: str, rtype: str,
                   uploader: str, uploader_id: str, filename: str) -> dict:
    """分享资料：入库 + 当日额度奖励（以一换一）"""
    if not title or not title.strip():
        return {"error": "资料标题不能为空"}
    if not filename:
        return {"error": "请先上传资料文件"}
    data = _load_json("courses.json")
    resources = data.get("resources", [])
    new_res = {
        "id": "res_" + secrets.token_hex(4),
        "name": title.strip(),
        "course": (course or "").strip() or "综合",
        "type": (rtype or "").strip() or "其他",
        "uploader": uploader or "匿名同学",
        "uploader_id": uploader_id,
        "filename": filename,
        "downloads": 0,
        "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "rewarded": True,  # 上传即发放奖励（校内小平台免审核；如要审核改为 False 并在审核时发奖）
    }
    resources.append(new_res)
    _save_json("courses.json", {"resources": resources})

    add_share_bonus(uploader_id)
    return {
        "status": "ok",
        "message": f"分享成功！今日下载额度 +{SHARE_REWARD}",
        "resource": new_res,
        "quota": get_quota(uploader_id),
    }
