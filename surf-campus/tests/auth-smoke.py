"""Authentication and campus-publishing permission smoke test.

The test restores the original campus binding and never creates content.
"""
import json
import os
import urllib.error
import urllib.request


BASE_URL = os.environ.get("SURF_E2E_BASE_URL", "http://127.0.0.1:8000").rstrip("/")


def request(path, method="GET", payload=None):
    body = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as error:
        raw = error.read()
        try:
            parsed = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            parsed = {"detail": raw.decode("utf-8", "replace")}
        return error.code, parsed


def main():
    status, original = request("/api/auth/session")
    assert status == 200 and original.get("campus_verified"), "演示会话没有校内身份"
    try:
        masked = original.get("phone_masked", "138****0001")
        phone = f"{masked[:3]}0000{masked[-4:]}"
        status, visitor = request("/api/auth/phone", "POST", {"phone": phone, "code": "123456"})
        assert status == 200 and not visitor.get("campus_verified"), "手机登录不应直接获得校内验证"

        status, denied = request("/api/community/comments?post_id=missing&content=auth%20smoke", "POST")
        assert status == 403 and "绑定" in denied.get("detail", ""), "手机访客仍可发帖"

        status, config = request("/api/auth/xjtlu/config")
        assert status == 200 and "XJTLU" in config.get("provider", ""), "SSO 配置边界不可用"
        status, bound = request("/api/auth/xjtlu/mock-bind", "POST", {"account": "smoke@student.xjtlu.edu.cn"})
        assert status == 200 and bound.get("campus_verified"), "Mock XJTLU 绑定失败"

        status, created = request("/api/community/comments?post_id=missing&content=auth%20smoke", "POST")
        assert status == 200 and created.get("error") == "帖子未找到", "绑定后权限状态未恢复"

        status, unbound = request("/api/auth/xjtlu/binding", "DELETE")
        assert status == 200 and not unbound.get("campus_verified"), "解绑没有恢复手机访客状态"
        print(json.dumps({"phone_read_only": "ok", "publish_guard": "ok", "sso_config": "ok", "mock_bind": "ok", "unbind": "ok"}, ensure_ascii=False))
    finally:
        if original.get("campus_verified"):
            request("/api/auth/xjtlu/mock-bind", "POST", {"account": original.get("campus_account") or "student@student.xjtlu.edu.cn"})


if __name__ == "__main__":
    main()
