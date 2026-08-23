"""Exercise the real OAuth2 callback against a local provider stub."""
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket


ROOT = Path(__file__).resolve().parents[1]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args, **_kwargs):
        return None


class ProviderHandler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        return

    def do_POST(self):
        if self.path != "/token":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        form = urllib.parse.parse_qs(self.rfile.read(length).decode("utf-8"))
        code = form.get("code", [""])[0]
        tokens = {"valid-code": "local-token", "outsider-code": "outsider-token", "wrong-issuer-code": "wrong-issuer-token"}
        if code not in tokens:
            self.send_error(400)
            return
        self._json({"access_token": tokens[code], "token_type": "Bearer"})

    def do_GET(self):
        if self.path != "/userinfo":
            self.send_error(401)
            return
        token = self.headers.get("Authorization", "").removeprefix("Bearer ")
        profiles = {
            "local-token": {"email": "local.student@student.xjtlu.edu.cn", "iss": os.environ["LOCAL_OAUTH_ISSUER"]},
            "outsider-token": {"email": "outsider@example.com", "iss": os.environ["LOCAL_OAUTH_ISSUER"]},
            "wrong-issuer-token": {"email": "local.student@student.xjtlu.edu.cn", "iss": "https://untrusted.example"},
        }
        if token not in profiles:
            self.send_error(401)
            return
        self._json({
            "iss": os.environ["LOCAL_OAUTH_ISSUER"],
            "sub": "student-local-001",
            **profiles[token],
            "name": "本地校验学生",
        })

    def _json(self, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def request(base, path, method="GET", payload=None):
    body = urllib.parse.urlencode(payload or {}).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(f"{base}{path}", data=body, headers=headers, method=method)
    try:
        opener = urllib.request.build_opener(NoRedirect)
        with opener.open(req, timeout=5) as response:
            return response.status, dict(response.headers), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers), error.read()
    except urllib.error.URLError:
        return 0, {}, b""


def begin_state(base):
    status, _, body = request(base, "/api/auth/xjtlu/start")
    assert status == 200, body
    authorization_url = json.loads(body)["authorization_url"]
    return urllib.parse.parse_qs(urllib.parse.urlparse(authorization_url).query)["state"][0]


def main():
    provider = ThreadingHTTPServer(("127.0.0.1", 0), ProviderHandler)
    provider_port = provider.server_address[1]
    with socket.socket() as port_probe:
        port_probe.bind(("127.0.0.1", 0))
        app_port = port_probe.getsockname()[1]
    os.environ["LOCAL_OAUTH_ISSUER"] = f"http://127.0.0.1:{provider_port}"
    provider_thread = threading.Thread(target=provider.serve_forever, daemon=True)
    provider_thread.start()
    with tempfile.TemporaryDirectory(prefix="surf-oauth-data-") as data_dir:
        source = ROOT / "backend" / "data"
        Path(data_dir, "auth.json").write_text(Path(source, "auth.json").read_text(encoding="utf-8"), encoding="utf-8")
        env = os.environ.copy()
        env.update({
            "SURF_DATA_DIR": data_dir,
            "XJTLU_OAUTH_CLIENT_ID": "local-client",
            "XJTLU_OAUTH_CLIENT_SECRET": "local-secret",
            "XJTLU_OAUTH_REDIRECT_URI": f"http://127.0.0.1:{app_port}/api/auth/xjtlu/callback",
            "XJTLU_OAUTH_AUTHORIZE_URL": f"http://127.0.0.1:{provider_port}/authorize",
            "XJTLU_OAUTH_TOKEN_URL": f"http://127.0.0.1:{provider_port}/token",
            "XJTLU_OAUTH_USERINFO_URL": f"http://127.0.0.1:{provider_port}/userinfo",
            "XJTLU_OAUTH_ISSUER": os.environ["LOCAL_OAUTH_ISSUER"],
            "SURF_ENABLE_MOCK_AUTH": "false",
        })
        process = subprocess.Popen([sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", str(app_port)], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            base = f"http://127.0.0.1:{app_port}"
            for _ in range(50):
                status, _, _ = request(base, "/health")
                if status == 200:
                    break
                time.sleep(0.1)
            state = begin_state(base)
            auth_path = Path(data_dir, "auth.json")
            auth_data = json.loads(auth_path.read_text(encoding="utf-8"))
            auth_data["oauth_state"]["redirect_uri"] = "https://untrusted.example/callback"
            auth_path.write_text(json.dumps(auth_data, ensure_ascii=False), encoding="utf-8")
            status, _, body = request(base, f"/api/auth/xjtlu/callback?code=valid-code&state={urllib.parse.quote(state)}")
            assert status == 400 and "回调地址" in json.loads(body).get("detail", ""), body
            auth_data["oauth_state"]["redirect_uri"] = env["XJTLU_OAUTH_REDIRECT_URI"]
            auth_path.write_text(json.dumps(auth_data, ensure_ascii=False), encoding="utf-8")
            status, headers, _ = request(base, f"/api/auth/xjtlu/callback?code=valid-code&state={urllib.parse.quote(state)}")
            assert status == 303 and headers.get("location") == "/", (status, headers)
            status, _, body = request(base, "/api/auth/session")
            session = json.loads(body)
            assert status == 200 and session.get("campus_verified") and session.get("campus_provider") == "xjtlu-oauth2", session
            status, _, body = request(base, f"/api/auth/xjtlu/callback?code=valid-code&state={urllib.parse.quote(state)}")
            assert status == 400, body
            outsider_state = begin_state(base)
            status, _, body = request(base, f"/api/auth/xjtlu/callback?code=outsider-code&state={urllib.parse.quote(outsider_state)}")
            assert status == 502 and "校园邮箱" in json.loads(body).get("detail", ""), body
            issuer_state = begin_state(base)
            status, _, body = request(base, f"/api/auth/xjtlu/callback?code=wrong-issuer-code&state={urllib.parse.quote(issuer_state)}")
            assert status == 502 and "issuer" in json.loads(body).get("detail", ""), body
            print(json.dumps({"oauth_start": "ok", "redirect_binding": "ok", "token_exchange": "ok", "issuer_claim": "ok", "campus_email_claim": "ok", "single_use_state": "ok"}, ensure_ascii=False))
        finally:
            process.terminate()
            process.wait(timeout=5)
    provider.shutdown()


if __name__ == "__main__":
    main()
