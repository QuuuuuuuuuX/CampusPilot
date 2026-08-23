#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
if [[ -z "$NODE_BIN" && -x "/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  NODE_BIN="/Users/hanmingyu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ -z "$NODE_BIN" ]]; then
  echo "node is required for browser smoke tests" >&2
  exit 1
fi

python3 -m py_compile backend/main.py backend/tools/*.py tests/observability-smoke.py tests/auth-smoke.py tests/oauth-callback-smoke.py
"$NODE_BIN" --check frontend/demo.js
"$NODE_BIN" --check admin/admin.js
curl -fsS http://127.0.0.1:8000/health >/dev/null

"$NODE_BIN" tests/browser-smoke.cjs
"$NODE_BIN" tests/ai-mention.cjs
"$NODE_BIN" tests/opportunities-smoke.cjs
"$NODE_BIN" tests/events-smoke.cjs
"$NODE_BIN" tests/treehole-smoke.cjs
"$NODE_BIN" tests/directory-smoke.cjs
"$NODE_BIN" tests/preferences-smoke.cjs
"$NODE_BIN" tests/community-interactions.cjs
python3 tests/auth-smoke.py
python3 tests/oauth-callback-smoke.py
"$NODE_BIN" tests/auth-ui-smoke.cjs
python3 tests/observability-smoke.py

echo "SURF Campus local verification passed"
