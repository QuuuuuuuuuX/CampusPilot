"""Verification-code auth smoke test.

Run this against a service with an isolated SURF_DATA_DIR. The default local
mock code is 123456 and no real SMS/email provider is contacted.
"""

import json
import os
import time
import urllib.error
import urllib.request


BASE_URL = os.environ.get("SURF_E2E_BASE_URL", "http://127.0.0.1:8000").rstrip("/")


def request(path, method="GET", payload=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read() or b"{}")


def main():
    phone = "1380013" + str(int(time.time()))[-4:]
    status, sent = request("/api/auth/phone/code", "POST", {"phone": phone})
    assert status == 200 and sent.get("debug_code") == "123456", "手机号验证码发送失败"
    status, cooldown = request("/api/auth/phone/code", "POST", {"phone": phone})
    assert status == 429, "短信验证码没有重发冷却"
    status, phone_session = request("/api/auth/phone", "POST", {"phone": phone, "code": "123456"})
    assert status == 200 and phone_session.get("phone_authenticated"), "手机号验证码登录失败"

    status, rejected_campus_email = request("/api/auth/campus-email/code", "POST", {"email": "student@example.com"})
    assert status == 400 and "XJTLU" in rejected_campus_email.get("detail", ""), "学校邮箱验证码错误地接受了外部域名"
    campus_email = f"campus_{int(time.time())}@student.xjtlu.edu.cn"
    status, campus_code = request("/api/auth/campus-email/code", "POST", {"email": campus_email})
    assert status == 200 and campus_code.get("debug_code") == "123456", "student.xjtlu.edu.cn 验证码发送失败"
    status, campus_session = request("/api/auth/campus-email", "POST", {"email": campus_email, "code": "123456"})
    assert status == 200 and campus_session.get("campus_verified"), "学校邮箱绑定失败"

    email = f"signup_{int(time.time())}@example.com"
    status, email_sent = request("/api/auth/email/code", "POST", {"email": email})
    assert status == 200 and email_sent.get("debug_code") == "123456", "邮箱验证码发送失败"
    status, registered = request("/api/auth/register", "POST", {"email": email, "code": "123456", "password": "secret123"})
    assert status == 200 and registered.get("email_authenticated"), "邮箱注册失败"
    request("/api/auth/session", "DELETE")
    status, logged_in = request("/api/auth/email", "POST", {"email": email, "password": "secret123"})
    assert status == 200 and logged_in.get("email") == email, "注册后的邮箱密码登录失败"
    print(json.dumps({"phone_code": "ok", "resend_cooldown": "ok", "email_register": "ok", "email_login": "ok"}))


if __name__ == "__main__":
    main()
