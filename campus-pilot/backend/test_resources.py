#!/usr/bin/env python3
"""课程资料「以一换一」全链路 API 测试（幂等：开头/结尾都清理测试数据；带超时防挂起）"""
import json
import os
import sys

import requests

BASE = "http://127.0.0.1:8010"
results = []
test_user = "test_res_user"
test_email = "test_res@example.com"
test_pass = "Test1234!"

s = requests.Session()
s.timeout = 15  # 全局超时，避免服务异常时无限挂起


def req(method, url, **kw):
    return s.request(method, url, **kw)


def check(name, cond, extra=""):
    results.append((name, cond, extra))
    print(("✅" if cond else "❌"), name, (" | " + extra if not cond and extra else ""))


def cleanup(uid=None):
    """清测试账号、额度、测试资料、测试文件"""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import sqlite3
    conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "campus.db"), timeout=8)
    if uid is None:
        row = conn.execute("SELECT id FROM accounts WHERE username=? OR email=?", (test_user, test_email)).fetchone()
        uid = row[0] if row else None
    if uid:
        conn.execute("DELETE FROM accounts WHERE id=?", (uid,))
        conn.execute("DELETE FROM resource_quota WHERE user_id=?", (uid,))
    rows = conn.execute("SELECT seq, payload FROM doc_courses_resources").fetchall()
    for seq, payload in rows:
        p = json.loads(payload)
        if uid and p.get("uploader_id") == uid:  # ⚠️ uid 为 None 时不能匹配（否则会删掉所有无 uploader_id 的种子）
            conn.execute("DELETE FROM doc_courses_resources WHERE seq=?", (seq,))
            fn = p.get("filename")
            if fn:
                fp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", fn)
                if os.path.exists(fp):
                    os.remove(fp)
    conn.commit()
    conn.close()


try:
    # 1. 建测试账号（直接调 auth，绕过 SMTP）；若残留则先清
    import auth
    cleanup()
    u = auth.create_user(username=test_user, email=test_email, password=test_pass, name="测试同学", department="")
    print("测试账号:", u["id"])
    uid = u["id"]

    # 2. 登录拿 token
    r = req("POST", f"{BASE}/api/auth/login", json={"identifier": test_email, "password": test_pass})
    check("登录", r.status_code == 200, r.text)
    token = r.json()["token"]
    H = {"Authorization": f"Bearer {token}"}

    # 3. 未登录访问列表 → quota 为 null
    r = req("GET", f"{BASE}/api/courses/resources")
    check("未登录列表可访问", r.status_code == 200)
    check("未登录 quota 为 null", r.json().get("quota") is None)

    # 4. 登录访问列表 → 有 quota
    r = req("GET", f"{BASE}/api/courses/resources", headers=H)
    d = r.json()
    check("登录列表有 quota 剩余3", d.get("quota") is not None and d["quota"]["剩余"] == 3, json.dumps(d.get("quota"), ensure_ascii=False))
    check("列表含资源且带 id", len(d.get("resources", [])) >= 5 and all(x.get("id") for x in d["resources"]))
    res_id = next(x["id"] for x in d["resources"])
    print("   首个资料 id:", res_id)

    # 5. 未登录下载 → 401
    r = req("GET", f"{BASE}/api/resources/file/{res_id}")
    check("未登录下载 401", r.status_code == 401)

    # 6. 上传资料文件
    files = {"file": ("课件.pdf", b"%PDF-1.4 fake pdf content", "application/pdf")}
    r = req("POST", f"{BASE}/api/upload/resource", files=files, headers=H)
    check("上传资料文件", r.status_code == 200, r.text)
    fname = r.json().get("filename")

    # 7. 分享资料 → 额度 +2
    r = req("POST", f"{BASE}/api/courses/resources", params={
        "title": "测试分享：操作系统期末复习", "course": "CSE202", "type": "复习资料", "filename": fname,
    }, headers=H)
    check("分享资料成功", r.status_code == 200, r.text)
    check("分享后额度 3+2=5", r.json().get("quota", {}).get("剩余") == 5, json.dumps(r.json().get("quota"), ensure_ascii=False))
    shared_id = r.json()["resource"]["id"]

    # 8. 下载 5 次（3 基础 + 2 奖励）→ 第 6 次 402
    for i in range(5):
        rr = req("GET", f"{BASE}/api/resources/file/{shared_id}", headers=H)
        check(f"下载第 {i+1} 次", rr.status_code == 200 and rr.content.startswith(b"%PDF"), rr.text[:120])
    rr = req("GET", f"{BASE}/api/resources/file/{shared_id}", headers=H)
    check("第 6 次 402 额度用尽", rr.status_code == 402, rr.text[:120])
    d = rr.json().get("detail")
    check("402 带激励规则", isinstance(d, dict) and d.get("code") == "quota_exceeded" and len(d.get("rules", [])) == 4, str(d))

    # 9. 再分享一份 → 额度恢复 +2 → 又能下
    files2 = {"file": ("笔记.docx", b"PK fake docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    r = req("POST", f"{BASE}/api/upload/resource", files=files2, headers=H)
    fname2 = r.json()["filename"]
    r = req("POST", f"{BASE}/api/courses/resources", params={
        "title": "测试分享2：高数笔记", "course": "MTH101", "type": "笔记", "filename": fname2,
    }, headers=H)
    check("再分享额度 +2", r.json().get("quota", {}).get("剩余") == 2, json.dumps(r.json().get("quota"), ensure_ascii=False))

    # 10. 下载次数累计（被下载的是 shared_id）
    data = json.loads(req("GET", f"{BASE}/api/courses/resources", headers=H).text)
    target = next(x for x in data["resources"] if x["id"] == shared_id)
    check("下载次数累计 5", target["下载次数"] == 5, str(target["下载次数"]))

    # 11. 搜索过滤
    r = req("GET", f"{BASE}/api/courses/resources", params={"keyword": "线性代数"}, headers=H)
    check("关键词搜索", r.status_code == 200 and len(r.json()["resources"]) == 1, r.text[:200])

    # 12. 非法类型上传被拒
    files3 = {"file": ("evil.exe", b"MZ fake exe", "application/x-msdownload")}
    r = req("POST", f"{BASE}/api/upload/resource", files=files3, headers=H)
    check("exe 上传被拒", r.status_code == 400)
finally:
    cleanup(uid)
    print("\n🧹 测试数据已清理")

passed = sum(1 for _, c, _ in results if c)
print(f"\n=== 结果: {passed}/{len(results)} 通过 ===")
if passed < len(results):
    sys.exit(1)
