"""Read-only concurrency and request observability smoke test."""
import json
import os
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor


BASE_URL = os.environ.get("SURF_E2E_BASE_URL", "http://127.0.0.1:8000").rstrip("/")


def request(path, headers=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, {key.lower(): value for key, value in response.headers.items()}, response.read()
    except urllib.error.HTTPError as error:
        return error.code, {key.lower(): value for key, value in error.headers.items()}, error.read()


def health(index):
    request_id = f"surf-smoke-{index}"
    status, headers, body = request("/health", {"X-Request-ID": request_id})
    payload = json.loads(body)
    assert status == 200 and payload["status"] == "running"
    assert headers.get("x-request-id") == request_id
    assert headers.get("server-timing", "").startswith("app;dur=")
    return status


started = time.perf_counter()
with ThreadPoolExecutor(max_workers=20) as pool:
    statuses = list(pool.map(health, range(60)))
elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
assert statuses == [200] * 60

missing_status, _, _ = request("/api/observability-smoke-missing")
assert missing_status == 404

denied_status, _, _ = request("/api/admin/system/metrics")
assert denied_status == 403

status, _, body = request("/api/admin/system/metrics", {"X-Admin-Role": "platform_admin"})
assert status == 200
metrics = json.loads(body)
assert metrics["requests"] >= 62
assert metrics["errors"] >= 2
assert metrics["max_ms"] >= metrics["avg_ms"] >= 0
assert 0 < len(metrics["recent"]) <= metrics["buffer_limit"]
assert all({"request_id", "method", "path", "status", "duration_ms"} <= item.keys() for item in metrics["recent"])
assert not any("query" in item or "body" in item for item in metrics["recent"])

print(json.dumps({
    "concurrent_reads": len(statuses),
    "elapsed_ms": elapsed_ms,
    "request_headers": "ok",
    "role_guard": "ok",
    "error_accounting": "ok",
    "metrics_requests": metrics["requests"],
    "metrics_errors": metrics["errors"],
}, ensure_ascii=False))
