"""XJTLU Virtual Campus — 后端 API（参考原仓库 + 新前端适配）"""
import base64, hashlib, json, logging, os, re, secrets, smtplib, threading, time, uuid
from collections import deque
from datetime import date
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request as URLRequest, urlopen

from fastapi import Body, Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, Response
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import uvicorn

app = FastAPI(title="XJTLU Virtual Campus", version="0.2.0")

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in os.sys.path:
    os.sys.path.insert(0, str(BASE_DIR))
load_dotenv(BASE_DIR / ".env")
DATA_DIR = Path(os.environ.get("SURF_DATA_DIR") or str(BASE_DIR / "data")).resolve()
UPLOAD_DIR = Path(os.environ.get("SURF_UPLOAD_DIR") or str(BASE_DIR / "uploads")).resolve()
UPLOAD_DIR.mkdir(exist_ok=True)
RESOURCE_FILE_DIR = Path(os.environ.get("SURF_RESOURCE_FILE_DIR") or str(BASE_DIR / "resource_files")).resolve()
RESOURCE_FILE_DIR.mkdir(exist_ok=True)

SECTION_LABELS = {"academic": "学术", "campus-life": "校园生活", "opportunities": "活动与机会", "teams": "组队与项目"}
AVATAR_OPTIONS = {"sun", "wave", "leaf", "star", "spark", "moon"}
SCHOOL_EMAIL_SUFFIXES = ("@student.xjtlu.edu.cn", "@xjtlu.edu.cn")
ADMIN_ROLES = {"platform_admin", "moderator", "teacher", "organizer"}
WRITE_ROLES = {"platform_admin", "moderator"}
REQUEST_LOG_LIMIT = 200
REQUEST_LOG = deque(maxlen=REQUEST_LOG_LIMIT)
REQUEST_LOG_LOCK = threading.Lock()
REQUEST_STATS = {"started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "requests": 0, "errors": 0, "total_ms": 0.0, "max_ms": 0.0}
request_logger = logging.getLogger("surf.request")
VERIFICATION_CODES: dict[str, dict[str, Any]] = {}
VERIFICATION_CODES_LOCK = threading.Lock()


def read_data(filename, fallback=None):
    path = DATA_DIR / filename
    if not path.exists():
        return fallback if fallback is not None else {}
    with path.open("r", encoding="utf-8") as h:
        return json.load(h)

def write_data(filename, data):
    path = DATA_DIR / filename
    tmp = path.with_suffix(path.suffix + f".{uuid.uuid4().hex}.tmp")
    with tmp.open("w", encoding="utf-8") as h:
        json.dump(data, h, ensure_ascii=False, indent=2)
    tmp.replace(path)

def audit(actor_role, action, target_type, target_id, detail=""):
    data = read_data("audit.json", {"records": []})
    data["records"].insert(0, {"id": f"audit_{uuid.uuid4().hex[:10]}", "time": time.strftime("%Y-%m-%d %H:%M:%S"), "actor_role": actor_role, "action": action, "target_type": target_type, "target_id": target_id, "detail": detail})
    write_data("audit.json", data)

def current_admin_role(x_admin_role: str = Header(default="student")) -> str:
    if x_admin_role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="当前角色无权访问管理端")
    return x_admin_role

def moderation_role(role: str = Depends(current_admin_role)) -> str:
    if role not in WRITE_ROLES:
        raise HTTPException(status_code=403, detail="当前角色只有查看权限")
    return role

def learning_write_role(role: str = Depends(current_admin_role)) -> str:
    if role not in {"platform_admin", "teacher"}:
        raise HTTPException(status_code=403, detail="当前角色无权维护课程内容")
    return role

def event_write_role(role: str = Depends(current_admin_role)) -> str:
    if role not in {"platform_admin", "organizer"}:
        raise HTTPException(status_code=403, detail="当前角色无权维护活动")
    return role

def opportunity_write_role(role: str = Depends(current_admin_role)) -> str:
    if role not in {"platform_admin", "organizer", "teacher"}:
        raise HTTPException(status_code=403, detail="当前角色无权维护项目招募")
    return role

DEV_AUTH_SESSION = {"phone_authenticated": True, "email_authenticated": True, "phone_masked": "191****7738", "campus_verified": True, "user_id": "u001", "name": "张三", "campus_account": "student001@student.xjtlu.edu.cn", "email": "zhang.san@xjtlu.edu.cn"}

def dev_auth_session():
    session = dict(DEV_AUTH_SESSION)
    phone = re.sub(r"\D", "", os.environ.get("SURF_DEV_PHONE", "19155147738"))
    if len(phone) == 11:
        session["phone_masked"] = f"{phone[:3]}****{phone[-4:]}"
    return session

def dev_auth_bypass_enabled(request: Request):
    if os.environ.get("SURF_DEV_AUTH_BYPASS", "false").strip().lower() not in {"1", "true", "yes", "on"}:
        return False
    host = (request.client.host if request.client else "").lower()
    return host in {"127.0.0.1", "::1", "localhost"}

def dev_fixed_phone_login_enabled(request: Request):
    if os.environ.get("SURF_DEV_FIXED_PHONE_LOGIN", "false").strip().lower() not in {"1", "true", "yes", "on"}:
        return False
    host = (request.client.host if request.client else "").lower()
    return host in {"127.0.0.1", "::1", "localhost"}

def current_auth_session():
    return read_data("auth.json", {}).get("session", {"phone_authenticated": False, "email_authenticated": False, "phone_masked": "", "campus_verified": False, "user_id": "", "name": "", "campus_account": ""})

def auth_data():
    data = read_data("auth.json", {})
    data.setdefault("session", current_auth_session())
    data.setdefault("accounts", [])
    return data

def auth_session_for_request(request: Request):
    session = current_auth_session()
    if dev_auth_bypass_enabled(request) and not session.get("campus_verified"):
        return dev_auth_session()
    return session

def authenticated_session(request: Request):
    session = auth_session_for_request(request)
    if not (session.get("phone_authenticated") or session.get("email_authenticated")):
        raise HTTPException(status_code=401, detail="请先登录")
    return session

def session_user_id(session):
    return str(session.get("user_id") or "u001")

def save_auth_session(session):
    data = auth_data()
    data["session"] = session
    write_data("auth.json", data)

def campus_verified_session(request: Request):
    session = auth_session_for_request(request)
    if not session.get("campus_verified"):
        raise HTTPException(status_code=403, detail="绑定 XJTLU 校园账号后才能发布内容")
    return session

def password_digest(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 180_000).hex()

def valid_email(email):
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email))

def valid_campus_email(email):
    n = email.strip().lower()
    return valid_email(n) and n.endswith(SCHOOL_EMAIL_SUFFIXES)

def user_data():
    data = read_data("users.json", {"users": []})
    data.setdefault("users", [])
    return data

def profile_defaults(user_id, name="校园成员", role="student"):
    return {"id": user_id, "name": name or "校园成员", "username": name or "校园成员", "bio": "", "birthday": "", "avatar": "sun", "profile_complete": False, "role": role, "department": "", "year": "", "tags": []}

def profile_for_user(user_id, name="校园成员"):
    data = user_data()
    profile = next((i for i in data["users"] if i.get("id") == user_id), None)
    if profile is None:
        profile = profile_defaults(user_id, name)
        data["users"].append(profile)
        write_data("users.json", data)
    return profile

def public_profile(user_id, name="校园成员"):
    p = profile_for_user(user_id, name)
    return {k: p.get(k, v) for k, v in profile_defaults(user_id, name).items()}

def auth_response(session, request=None):
    level = "campus" if session.get("campus_verified") else ("phone" if session.get("phone_authenticated") else ("email" if session.get("email_authenticated") else "guest"))
    profile = public_profile(session_user_id(session), session.get("name", "校园成员")) if session.get("user_id") else None
    return {**session, "can_publish": bool(session.get("campus_verified")), "identity_level": level, "profile": profile, "profile_complete": bool(profile and profile.get("profile_complete")), "needs_onboarding": bool(profile and not profile.get("profile_complete")), "dev_bypass": dev_auth_bypass_enabled(request) if request else False}

def persist_user_profile(*, user_id, name, email="", phone="", role="student"):
    data = user_data()
    profile = next((i for i in data["users"] if i.get("id") == user_id), None)
    if profile is None:
        profile = profile_defaults(user_id, name, role)
        data["users"].append(profile)
    profile["name"] = name or profile.get("name", "校园成员")
    if email:
        profile["email"] = email
    if phone:
        profile["phone_masked"] = f"{phone[:3]}****{phone[-4:]}"
    write_data("users.json", data)
    return profile

# ─── Verification code helpers ───

def verification_target(channel, target):
    if channel in {"phone", "sms"}:
        digits = re.sub(r"\D", "", target)
        if len(digits) != 11:
            raise HTTPException(status_code=400, detail="请输入 11 位手机号")
        return digits
    n = target.strip().lower()
    if channel == "campus-email" and not valid_campus_email(n):
        raise HTTPException(status_code=400, detail="学校邮箱必须使用 @student.xjtlu.edu.cn 或 @xjtlu.edu.cn 后缀")
    if channel != "campus-email" and not valid_email(n):
        raise HTTPException(status_code=400, detail="请输入有效的邮箱地址")
    return n

def deliver_verification_code(channel, target, code):
    # Mock mode — always returns mock in dev
    return "mock"

def issue_verification_code(channel, target):
    normalized = verification_target(channel, target)
    key = f"{channel}:{normalized}"
    now = time.time()
    cooldown = max(1, int(os.environ.get("SURF_AUTH_CODE_COOLDOWN_SECONDS", "30")))
    ttl = max(60, int(os.environ.get("SURF_AUTH_CODE_TTL_SECONDS", "600")))
    with VERIFICATION_CODES_LOCK:
        prev = VERIFICATION_CODES.get(key)
        if prev and now - prev["sent_at"] < cooldown:
            raise HTTPException(status_code=429, detail=f"请 {cooldown - int(now - prev['sent_at'])} 秒后重新获取验证码")
    code = os.environ.get("SURF_MOCK_SMS_CODE" if channel == "sms" else "SURF_MOCK_EMAIL_CODE", "123456")
    provider = deliver_verification_code(channel, normalized, code)
    with VERIFICATION_CODES_LOCK:
        VERIFICATION_CODES[key] = {"code": code, "provider": provider, "expires_at": now + ttl, "sent_at": now}
    return {"sent": True, "channel": channel, "masked_target": f"{normalized[:3]}****{normalized[-4:]}" if channel == "sms" else f"{normalized[:2]}***@{normalized.split('@')[-1]}", "provider": provider, "expires_in": ttl, "cooldown": cooldown, "debug_code": code if os.environ.get("SURF_AUTH_DEBUG_CODES", "true").lower() == "true" else None}

def consume_verification_code(channel, target, code):
    normalized = verification_target(channel, target)
    key = f"{channel}:{normalized}"
    with VERIFICATION_CODES_LOCK:
        saved = VERIFICATION_CODES.get(key)
        if not saved or time.time() > saved["expires_at"]:
            VERIFICATION_CODES.pop(key, None)
            raise HTTPException(status_code=401, detail="验证码已过期或未发送，请重新获取")
        if not secrets.compare_digest(str(saved["code"]), code.strip()):
            raise HTTPException(status_code=401, detail="验证码不正确")
        VERIFICATION_CODES.pop(key, None)

# ─── Lazy Agent ───
_agent = None
def get_agent():
    global _agent
    if _agent is None:
        try:
            from agent import CampusAgent
            _agent = CampusAgent()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"AI 服务暂时不可用: {str(e)[:80]}")
    return _agent

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def observe_requests(request: Request, call_next):
    rid = request.headers.get("x-request-id", "") or uuid.uuid4().hex[:16]
    started = time.perf_counter()
    try:
        resp = await call_next(request)
    except Exception:
        request_logger.exception("Unhandled error rid=%s path=%s", rid, request.url.path)
        resp = JSONResponse(status_code=500, content={"detail": "服务暂时不可用", "request_id": rid})
    ms = round((time.perf_counter() - started) * 1000, 2)
    with REQUEST_LOG_LOCK:
        REQUEST_LOG.appendleft({"time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "request_id": rid, "method": request.method, "path": request.url.path, "status": resp.status_code, "duration_ms": ms})
        REQUEST_STATS["requests"] += 1
        REQUEST_STATS["errors"] += int(resp.status_code >= 400)
        REQUEST_STATS["total_ms"] += ms
        REQUEST_STATS["max_ms"] = max(REQUEST_STATS["max_ms"], ms)
    resp.headers["X-Request-ID"] = rid
    return resp

# ─── Pydantic Models ───
class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str

class CommunityAIRequest(BaseModel):
    post_id: str = Field(min_length=1, max_length=120)
    message: str = Field(min_length=1, max_length=800)
    comment_id: Optional[str] = Field(default=None, max_length=120)

class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    title: str = Field(default="", max_length=120)
    section: str = "campus-life"
    anonymous: bool = False
    tags: list[str] = Field(default_factory=list, max_length=5)
    media: list[dict] = Field(default_factory=list, max_length=9)

class PhoneLoginRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=20)
    code: str = Field(min_length=4, max_length=8)

class PhoneCodeRequest(BaseModel):
    phone: str = Field(min_length=11, max_length=20)

class EmailCodeRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)

class EmailLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)
    password: str = Field(min_length=6, max_length=128)

class EmailRegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)
    code: str = Field(min_length=4, max_length=8)
    password: str = Field(min_length=6, max_length=128)

class SchoolEmailBindRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)
    code: str = Field(min_length=4, max_length=8)

class MockCampusBindRequest(BaseModel):
    account: str = Field(default="student001@student.xjtlu.edu.cn", max_length=120)

class ProfileUpdate(BaseModel):
    username: str = Field(min_length=2, max_length=24)
    bio: str = Field(default="", max_length=160)
    birthday: str = Field(default="", max_length=10)
    avatar: str = "sun"

class PreferenceUpdate(BaseModel):
    sections: list[str] = Field(default_factory=list, max_length=4)
    interests: list[str] = Field(default_factory=list, max_length=12)
    show_context_rail: bool = True
    content_language: str = "mixed"
    theme: str = "system"

# ─── Root & Health ───
@app.get("/")
def serve_index():
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/health")
def health_check():
    return {"service": "XJTLU Virtual Campus", "version": "0.2.0", "status": "running"}

# ─── Auth ───
@app.get("/api/auth/session")
def get_auth_session(request: Request):
    return auth_response(auth_session_for_request(request), request)

@app.post("/api/auth/phone/code")
def send_phone_code(req: PhoneCodeRequest, request: Request):
    return issue_verification_code("sms", req.phone)

@app.post("/api/auth/phone")
def login_by_phone(req: PhoneLoginRequest, request: Request):
    digits = re.sub(r"\D", "", req.phone)
    if len(digits) != 11:
        raise HTTPException(status_code=400, detail="请输入 11 位手机号")
    dev_phone = re.sub(r"\D", "", os.environ.get("SURF_DEV_PHONE", "19155147738"))
    dev_code = os.environ.get("SURF_MOCK_SMS_CODE", "123456")
    if dev_fixed_phone_login_enabled(request) and secrets.compare_digest(digits, dev_phone) and secrets.compare_digest(req.code.strip(), dev_code):
        return {**dev_auth_session(), "can_publish": True, "identity_level": "campus", "dev_bypass": True}
    # Universal mock-code bypass: accept SURF_MOCK_SMS_CODE (default 123456) for ANY phone number,
    # no need to click "获取验证码" first.
    mock_code = os.environ.get("SURF_MOCK_SMS_CODE", "123456")
    if secrets.compare_digest(req.code.strip(), mock_code):
        session = {"phone_authenticated": True, "email_authenticated": False, "phone_masked": f"{digits[:3]}****{digits[-4:]}", "campus_verified": False, "user_id": f"phone_{digits}", "name": "手机访客", "campus_account": ""}
        persist_user_profile(user_id=session["user_id"], name="手机访客", phone=digits)
        save_auth_session(session)
        return auth_response(session)
    consume_verification_code("sms", digits, req.code)
    session = {"phone_authenticated": True, "email_authenticated": False, "phone_masked": f"{digits[:3]}****{digits[-4:]}", "campus_verified": False, "user_id": f"phone_{digits}", "name": "手机访客", "campus_account": ""}
    persist_user_profile(user_id=session["user_id"], name="手机访客", phone=digits)
    save_auth_session(session)
    return auth_response(session)

@app.post("/api/auth/email/code")
def send_email_code(req: EmailCodeRequest):
    return issue_verification_code("email", req.email)

@app.post("/api/auth/email")
def login_by_email(req: EmailLoginRequest):
    email = req.email.strip().lower()
    if not valid_email(email):
        raise HTTPException(status_code=400, detail="请输入有效的邮箱地址")
    expected = os.environ.get("SURF_DEMO_EMAIL_PASSWORD", "SURF2026")
    ok = secrets.compare_digest(req.password, expected)
    if not ok:
        raise HTTPException(status_code=401, detail="邮箱或密码不正确")
    is_campus = email.endswith(SCHOOL_EMAIL_SUFFIXES)
    name = re.sub(r"[^A-Za-z0-9_-]", "", email.split("@")[0])[:40] or "student"
    session = {"phone_authenticated": True, "email_authenticated": True, "phone_masked": "", "campus_verified": is_campus, "user_id": f"email_{name}", "name": name.replace(".", " ").title(), "campus_account": email if is_campus else "", "email": email}
    persist_user_profile(user_id=session["user_id"], name=session["name"], email=email)
    save_auth_session(session)
    return auth_response(session)

@app.post("/api/auth/register")
def register_by_email(req: EmailRegisterRequest):
    email = verification_target("email", req.email)
    consume_verification_code("email", email, req.code)
    data = auth_data()
    if any(a.get("email") == email for a in data.get("accounts", [])):
        raise HTTPException(status_code=409, detail="该邮箱已经注册")
    salt = secrets.token_hex(16)
    name = re.sub(r"[^A-Za-z0-9_-]", "", email.split("@")[0])[:40] or "student"
    session = {"phone_authenticated": True, "email_authenticated": True, "phone_masked": "", "campus_verified": email.endswith(SCHOOL_EMAIL_SUFFIXES), "user_id": f"email_{name}", "name": name.title(), "campus_account": email if email.endswith(SCHOOL_EMAIL_SUFFIXES) else "", "email": email}
    persist_user_profile(user_id=session["user_id"], name=session["name"], email=email)
    data["session"] = session
    write_data("auth.json", data)
    return auth_response(session)

@app.post("/api/auth/campus-email/code")
def send_campus_email_code(req: SchoolEmailBindRequest, request: Request):
    session = authenticated_session(request)
    if not session.get("phone_authenticated"):
        raise HTTPException(status_code=403, detail="请先完成手机号登录")
    return issue_verification_code("campus-email", req.email)

@app.post("/api/auth/campus-email")
def bind_campus_email(req: SchoolEmailBindRequest, request: Request):
    session = authenticated_session(request)
    email = verification_target("campus-email", req.email)
    consume_verification_code("campus-email", email, req.code)
    session.update({"campus_verified": True, "email_authenticated": True, "campus_account": email, "email": email})
    persist_user_profile(user_id=session_user_id(session), name=session.get("name", "校园成员"), email=email)
    save_auth_session(session)
    return auth_response(session)

@app.delete("/api/auth/session")
def logout():
    save_auth_session({"phone_authenticated": False, "email_authenticated": False, "phone_masked": "", "campus_verified": False, "user_id": "", "name": "", "campus_account": ""})
    return auth_response({"phone_authenticated": False})

@app.get("/api/auth/xjtlu/config")
def xjtlu_config():
    return {"mock_binding_enabled": os.environ.get("SURF_ENABLE_MOCK_AUTH", "true").lower() == "true", "configured": False}

@app.post("/api/auth/xjtlu/mock-bind")
def mock_bind(req: MockCampusBindRequest, session: dict = Depends(authenticated_session)):
    if os.environ.get("SURF_ENABLE_MOCK_AUTH", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock 绑定已关闭")
    account = req.account.strip().lower()
    if not account.endswith(SCHOOL_EMAIL_SUFFIXES):
        raise HTTPException(status_code=400, detail="只接受 XJTLU 校园邮箱")
    session.update({"campus_verified": True, "user_id": "u001", "name": "张三", "campus_account": account})
    save_auth_session(session)
    return auth_response(session)

# ─── AI Chat ───
@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    try:
        agent = get_agent()
        msg = req.message
        if req.context:
            msg = f"当前上下文：{req.context.get('text') or req.context.get('label', '')}\n用户问题：{req.message}"
        reply = agent.chat(session_id=req.session_id, user_message=msg)
    except HTTPException:
        raise
    except Exception as e:
        reply = f"（AI 暂时无法回应：{str(e)[:80]}）"
    return ChatResponse(reply=reply)

@app.post("/api/community/ai")
def community_ai(req: CommunityAIRequest):
    data = read_data("posts.json", {"posts": []})
    post = next((p for p in data.get("posts", []) if p.get("id") == req.post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    context = "\n".join(p for p in [post.get("title", ""), post.get("content", "")] if p)
    try:
        reply = get_agent().chat(session_id=f"community_{req.post_id}_{req.comment_id or 'post'}", user_message=f"当前校园话题上下文：{context}\n用户通过 @AI 提问：{req.message}")
    except HTTPException:
        raise
    except Exception as e:
        reply = f"（AI 暂时无法回应：{str(e)[:80]}）"
    return {"reply": reply, "source": {"post_id": req.post_id, "comment_id": req.comment_id}, "uncertainty": "AI 回答基于当前帖子，重要事项请以官方通知为准。"}

@app.post("/api/session/clear")
def clear_session(session_id: str):
    try:
        get_agent().clear_session(session_id)
    except Exception:
        pass
    return {"status": "cleared"}

# ─── Dynamic Translation (real-time, LLM-backed with persistent cache) ───
class TranslateRequest(BaseModel):
    texts: list = Field(default_factory=list)
    target: str = "en"

_TRANSLATE_LOCK = threading.Lock()

def _llm_translate_client():
    from openai import OpenAI
    from config import get_llm_config
    cfg = get_llm_config()
    if not cfg.get("api_key"):
        return None, None
    return OpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"]), cfg["model"]

@app.post("/api/translate")
def api_translate(req: TranslateRequest):
    """Batch-translate arbitrary strings (new posts, new teachers, new teams...)
    via DeepSeek. Results are cached in data/translations.json forever, so each
    unique piece of content only costs one API call."""
    target = "zh" if req.target == "zh" else "en"
    texts = []
    seen = set()
    for t in req.texts or []:
        if isinstance(t, str):
            t = t.strip()
        if isinstance(t, str) and t and t not in seen and len(t) <= 600:
            seen.add(t)
            texts.append(t)
    texts = texts[:60]
    if not texts:
        return {"translations": {}}

    cache_key = "cache_" + target
    with _TRANSLATE_LOCK:
        cache = read_data("translations.json", {})
    cache_map = cache.get(cache_key) or {}
    result = {t: cache_map[t] for t in texts if t in cache_map}
    pending = [t for t in texts if t not in cache_map]

    if pending:
        try:
            client, model = _llm_translate_client()
            if client:
                direction = "English" if target == "en" else "Chinese (Simplified)"
                system = (
                    "You are a professional translator for a university campus platform (XJTLU). "
                    "Translate the given strings naturally and concisely. Keep course codes (e.g. CSE101), "
                    "URLs, emojis and numbers unchanged. Return ONLY a JSON object of the exact shape: "
                    '{"translations": {"<original string>": "<translated string>", ...}}'
                )
                user = f"Translate each string to {direction}. Strings JSON array: {json.dumps(pending, ensure_ascii=False)}"
                resp = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                    temperature=0.1,
                    max_tokens=4000,
                    response_format={"type": "json_object"},
                )
                data = json.loads(resp.choices[0].message.content or "{}")
                mapping = data.get("translations") if isinstance(data, dict) else None
                if isinstance(mapping, dict):
                    for k, v in mapping.items():
                        if isinstance(k, str) and isinstance(v, str) and v and v != k:
                            result[k] = v
                            cache_map[k] = v
                    with _TRANSLATE_LOCK:
                        cache[cache_key] = cache_map
                        write_data("translations.json", cache)
        except Exception:
            pass  # network/model failure: frontend falls back to original text

    return {"translations": result}

# ─── Community ───
@app.get("/api/community/feed")
def get_feed(section: str = None, page: int = 1):
    data = read_data("posts.json", {"posts": []})
    posts = data.get("posts", [])
    if section and section != "all":
        posts = [p for p in posts if p.get("section") == section]
    return {"posts": posts, "total": len(posts), "page": page}

@app.post("/api/community/posts")
def create_post(req: PostCreate, session: dict = Depends(campus_verified_session)):
    data = read_data("posts.json", {"posts": []})
    post = {"id": f"p_{uuid.uuid4().hex[:10]}", "content": req.content, "title": req.title, "section": req.section, "anonymous": req.anonymous, "author": "匿名" if req.anonymous else session.get("name", "校园成员"), "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0, "comments_count": 0, "tags": req.tags, "media": req.media, "comments": [], "liked": False, "collected": False, "status": "published"}
    data["posts"].insert(0, post)
    write_data("posts.json", data)
    return {"status": "ok", "post": post}

@app.get("/api/community/posts/{post_id}")
def get_post_detail(post_id: str):
    data = read_data("posts.json", {"posts": []})
    post = next((p for p in data["posts"] if p.get("id") == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    return post

@app.post("/api/community/comments")
def add_comment(post_id: str, content: str, anonymous: bool = False, session: dict = Depends(campus_verified_session)):
    data = read_data("posts.json", {"posts": []})
    post = next((p for p in data["posts"] if p.get("id") == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    comment = {"id": f"c_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名" if anonymous else session.get("name", "校园成员"), "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0}
    post.setdefault("comments", []).append(comment)
    post["comments_count"] = len(post["comments"])
    write_data("posts.json", data)
    return {"status": "ok", "comment": comment}

@app.post("/api/community/like")
def like_post(post_id: str, session: dict = Depends(campus_verified_session)):
    data = read_data("posts.json", {"posts": []})
    post = next((p for p in data["posts"] if p.get("id") == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    post["likes"] = post.get("likes", 0) + 1
    post["liked"] = True
    write_data("posts.json", data)
    return {"status": "ok", "likes": post["likes"]}

@app.post("/api/community/collect")
def collect_post(post_id: str, tag: str = ""):
    data = read_data("collections.json", {"collections": [], "tags": {}})
    if post_id not in data.get("collections", []):
        data.setdefault("collections", []).append(post_id)
    if tag:
        data.setdefault("tags", {}).setdefault(post_id, []).append(tag)
    write_data("collections.json", data)
    return {"status": "ok", "collected": True}

@app.post("/api/community/report")
def report_post(post_id: str, reason: str = ""):
    data = read_data("reports.json", {"reports": []})
    data["reports"].insert(0, {"id": f"report_{uuid.uuid4().hex[:10]}", "post_id": post_id, "reason": reason.strip() or "未说明原因", "status": "pending", "created_at": time.strftime("%Y-%m-%d %H:%M")})
    write_data("reports.json", data)
    return {"status": "ok", "message": "举报已提交"}

# ─── Treehole ───
@app.get("/api/treehole/hot")
def treehole_hot():
    data = read_data("treeholes.json", {"posts": []})
    posts = sorted(data.get("posts", []), key=lambda p: p.get("likes", 0), reverse=True)
    return {"posts": posts[:10]}

@app.post("/api/treehole/posts")
def treehole_post(content: str, session: dict = Depends(campus_verified_session)):
    data = read_data("treeholes.json", {"posts": []})
    post = {"id": f"t_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名同学", "anonymous": True, "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0, "liked": False, "comments_count": 0, "comments": [], "tags": [], "media": []}
    data["posts"].insert(0, post)
    write_data("treeholes.json", data)
    return {"status": "ok", "post": post}

@app.post("/api/treehole/comments")
def treehole_comment(post_id: str, content: str, session: dict = Depends(campus_verified_session)):
    data = read_data("treeholes.json", {"posts": []})
    post = next((p for p in data["posts"] if p.get("id") == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    comment = {"id": f"tc_{uuid.uuid4().hex[:10]}", "content": content, "author": "匿名同学", "anonymous": True, "time": time.strftime("%Y-%m-%d %H:%M"), "likes": 0}
    post["comments"].append(comment)
    post["comments_count"] = len(post["comments"])
    write_data("treeholes.json", data)
    return {"status": "ok", "comment": comment}

# ─── Courses & Academic ───
@app.get("/api/courses/resources")
def get_resources(keyword: str = None, course: str = None):
    data = read_data("courses.json", {"resources": []})
    resources = data.get("resources", [])
    if keyword:
        resources = [r for r in resources if keyword.lower() in r.get("name", "").lower() or keyword.lower() in r.get("course", "").lower()]
    if course:
        resources = [r for r in resources if r.get("course") == course]
    return {"resources": resources}

@app.get("/api/courses/catalog")
def get_course_catalog():
    data = read_data("courses.json", {"courses": []})
    return {"courses": data.get("courses", [])}

# ─── Points System (积分制) ───
POINTS_FREE_COUNT = 10       # 公共资料库前10份免费预览下载
POINTS_UPLOAD_REWARD = 5     # 上传一份资料奖励积分
POINTS_UNLOCK_COST = 10      # 解锁一份新资料消耗积分

def points_store():
    return read_data("points.json", {"users": {}})

def points_user(store, user_id):
    u = store["users"].get(user_id)
    if not isinstance(u, dict):
        u = {"points": 0, "unlocked": [], "seen_intro": False}
        store["users"][user_id] = u
    u.setdefault("points", 0)
    u.setdefault("unlocked", [])
    u.setdefault("seen_intro", False)
    return u

def _find_resource(resource_id):
    data = read_data("courses.json", {"resources": []})
    resources = data.get("resources", [])
    for i, r in enumerate(resources):
        if r.get("id") == resource_id:
            return i, r, data
    return -1, None, data

@app.get("/api/points")
def get_points(session: dict = Depends(authenticated_session)):
    uid = session_user_id(session)
    store = points_store()
    u = points_user(store, uid)
    return {"user": uid, "points": u["points"], "unlocked": u["unlocked"], "seen_intro": u["seen_intro"],
            "free_count": POINTS_FREE_COUNT, "unlock_cost": POINTS_UNLOCK_COST, "upload_reward": POINTS_UPLOAD_REWARD}

@app.post("/api/points/intro-seen")
def points_intro_seen(session: dict = Depends(authenticated_session)):
    uid = session_user_id(session)
    store = points_store()
    u = points_user(store, uid)
    u["seen_intro"] = True
    write_data("points.json", store)
    return {"status": "ok"}

@app.post("/api/resources/unlock")
def unlock_resource(resource_id: str, session: dict = Depends(authenticated_session)):
    uid = session_user_id(session)
    idx, r, _ = _find_resource(resource_id)
    if idx < 0 or r is None:
        raise HTTPException(status_code=404, detail="资料未找到")
    if idx < POINTS_FREE_COUNT or r.get("uploader_id") == uid:
        return {"status": "ok", "already_free": True, "points": points_user(points_store(), uid)["points"], "unlocked": points_user(points_store(), uid)["unlocked"]}
    store = points_store()
    u = points_user(store, uid)
    if resource_id in u["unlocked"]:
        return {"status": "ok", "already_unlocked": True, "points": u["points"], "unlocked": u["unlocked"]}
    if u["points"] < POINTS_UNLOCK_COST:
        raise HTTPException(status_code=400, detail=f"积分不足（当前{u['points']}分，解锁需{POINTS_UNLOCK_COST}分）。上传一份资料可获得{POINTS_UPLOAD_REWARD}积分。")
    u["points"] -= POINTS_UNLOCK_COST
    u["unlocked"].append(resource_id)
    write_data("points.json", store)
    return {"status": "ok", "points": u["points"], "unlocked": u["unlocked"], "resource_id": resource_id}

@app.post("/api/resources/upload")
def upload_resource(payload: dict, session: dict = Depends(authenticated_session)):
    uid = session_user_id(session)
    title = (payload.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="请填写资料标题")
    course_code = payload.get("course") or ""
    course_name = payload.get("course_name") or ""
    item = {
        "id": f"r_{uuid.uuid4().hex[:8]}",
        "name": title,
        "course": course_code,
        "courseName": course_name,
        "type": payload.get("type") or "资料",
        "uploader": session.get("name") or "校园成员",
        "uploader_id": uid,
        "year": payload.get("year") or "",
        "term": payload.get("term") or "",
        "major": payload.get("major") or "",
        "source": "个人",
        "size": payload.get("size") or "1.0MB",
        "downloads": 0,
        "time": time.strftime("%Y-%m-%d"),
    }
    data = read_data("courses.json", {"resources": []})
    data.setdefault("resources", []).append(item)   # 新资料排在列表末尾（需积分解锁）
    write_data("courses.json", data)
    # 上传奖励积分
    store = points_store()
    u = points_user(store, uid)
    u["points"] += POINTS_UPLOAD_REWARD
    write_data("points.json", store)
    return {"status": "ok", "points": u["points"], "points_awarded": POINTS_UPLOAD_REWARD, "resource": item}

@app.get("/api/courses/qa")
def get_qa(keyword: str = None):
    data = read_data("courses.json", {"qa": []})
    qa = data.get("qa", [])
    if keyword:
        qa = [q for q in qa if keyword.lower() in q.get("question", "").lower() or keyword.lower() in q.get("course", "").lower()]
    return {"questions": qa}

@app.post("/api/courses/qa")
def post_qa(course: str, question: str, anonymous: bool = False, session: dict = Depends(campus_verified_session)):
    data = read_data("courses.json", {"qa": []})
    item = {"id": f"q_{uuid.uuid4().hex[:10]}", "question": question, "course": course, "author": "匿名" if anonymous else session.get("name", "张三"), "status": "unsolved", "answers_count": 0, "answers_detail": [], "time": time.strftime("%Y-%m-%dT%H:%M")}
    data.setdefault("qa", []).insert(0, item)
    write_data("courses.json", data)
    return {"status": "ok", "question": item}

@app.post("/api/courses/qa/{question_id}/accept")
def accept_answer(question_id: str, answer_id: str):
    data = read_data("courses.json", {"qa": []})
    q = next((q for q in data.get("qa", []) if q.get("id") == question_id), None)
    if not q:
        raise HTTPException(status_code=404, detail="问题未找到")
    for a in q.get("answers_detail", []):
        a["accepted"] = a.get("id") == answer_id
    q["accepted_answer_id"] = answer_id
    write_data("courses.json", data)
    return {"status": "ok", "question": q}

# ─── Professors & Teachers (new) ───
@app.get("/api/professors")
def get_professors(keyword: str = None):
    data = read_data("professors.json", {"professors": []})
    profs = data.get("professors", [])
    if keyword:
        profs = [p for p in profs if keyword.lower() in p.get("name", "").lower() or keyword.lower() in p.get("research", "").lower()]
    return {"professors": profs}

@app.get("/api/teachers")
def get_teachers(keyword: str = None):
    data = read_data("teachers.json", {"teachers": []})
    teachers = data.get("teachers", [])
    if keyword:
        teachers = [t for t in teachers if keyword.lower() in t.get("name", "").lower() or keyword.lower() in t.get("faculty", "").lower()]
    return {"teachers": teachers}

@app.get("/api/teachers/{teacher_id}")
def get_teacher_detail(teacher_id: str):
    data = read_data("teachers.json", {"teachers": []})
    teacher = next((t for t in data.get("teachers", []) if t.get("id") == teacher_id), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="教师未找到")
    return teacher

@app.post("/api/teachers/{teacher_id}/apply")
def apply_teacher_position(teacher_id: str, position_id: str, resume_id: str = "", statement: str = "", session: dict = Depends(authenticated_session)):
    data = read_data("teachers.json", {"teachers": []})
    teacher = next((t for t in data.get("teachers", []) if t.get("id") == teacher_id), None)
    if not teacher:
        raise HTTPException(status_code=404, detail="教师未找到")
    for proj in teacher.get("projects", []):
        for pos in proj.get("positions", []):
            if pos.get("id") == position_id:
                if pos.get("current_applicants", 0) >= pos.get("max_applicants", 99):
                    raise HTTPException(status_code=409, detail="名额已满")
                pos["current_applicants"] = pos.get("current_applicants", 0) + 1
                application = {"id": f"app_{uuid.uuid4().hex[:10]}", "user_id": session_user_id(session), "position_id": position_id, "resume_id": resume_id, "statement": statement, "status": "pending", "created_at": time.strftime("%Y-%m-%d %H:%M")}
                write_data("teachers.json", data)
                return {"status": "ok", "application": application}
    raise HTTPException(status_code=404, detail="岗位未找到")

@app.post("/api/teachers/{teacher_id}/book")
def book_office_hour(teacher_id: str, slot: str = "", session: dict = Depends(authenticated_session)):
    return {"status": "ok", "booking": {"teacher_id": teacher_id, "user_id": session_user_id(session), "slot": slot, "time": time.strftime("%Y-%m-%d %H:%M")}}

# ─── Resumes (new) ───
@app.get("/api/resumes")
def get_resumes(session: dict = Depends(authenticated_session)):
    data = read_data("resumes.json", {"resumes": []})
    return {"resumes": data.get("resumes", [])}

@app.post("/api/resumes")
def create_resume(name: str, target: str = "", highlights: str = "", session: dict = Depends(authenticated_session)):
    data = read_data("resumes.json", {"resumes": []})
    resume = {"id": f"rv_{uuid.uuid4().hex[:10]}", "name": name, "target": target, "highlights": highlights.split(",") if highlights else [], "updated": time.strftime("%Y-%m-%d"), "status": "draft"}
    data["resumes"].insert(0, resume)
    write_data("resumes.json", data)
    return {"status": "ok", "resume": resume}

@app.patch("/api/resumes/{resume_id}")
def update_resume(resume_id: str, name: str = None, target: str = None, status: str = None):
    data = read_data("resumes.json", {"resumes": []})
    resume = next((r for r in data["resumes"] if r.get("id") == resume_id), None)
    if not resume:
        raise HTTPException(status_code=404, detail="简历未找到")
    if name: resume["name"] = name
    if target: resume["target"] = target
    if status: resume["status"] = status
    resume["updated"] = time.strftime("%Y-%m-%d")
    write_data("resumes.json", data)
    return {"status": "ok", "resume": resume}

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: str):
    data = read_data("resumes.json", {"resumes": []})
    data["resumes"] = [r for r in data["resumes"] if r.get("id") != resume_id]
    write_data("resumes.json", data)
    return {"status": "ok"}

# ─── Competitions (new) ───
@app.get("/api/competitions")
def get_competitions():
    data = read_data("competitions.json", {"competitions": []})
    return {"competitions": data.get("competitions", [])}

@app.get("/api/competitions/{comp_id}")
def get_competition_detail(comp_id: str):
    data = read_data("competitions.json", {"competitions": []})
    comp = next((c for c in data.get("competitions", []) if c.get("id") == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="竞赛未找到")
    return comp

# ─── Events ───
@app.get("/api/events")
def list_events(month: str = None):
    data = read_data("events.json", {"events": []})
    events = data.get("events", [])
    if month:
        events = [e for e in events if month in e.get("time", "")]
    return {"events": events}

@app.post("/api/events/register")
def register_event(event_id: str):
    data = read_data("events.json", {"events": []})
    event = next((e for e in data.get("events", []) if e.get("id") == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="活动未找到")
    event["registered"] = event.get("registered", 0) + 1
    event["registered_by_me"] = True
    write_data("events.json", data)
    return {"status": "ok", "registered": event["registered"]}

# ─── Opportunities ───
@app.get("/api/opportunities")
def list_opportunities(keyword: str = "", skill: str = ""):
    data = read_data("opportunities.json", {"opportunities": []})
    opps = data.get("opportunities", [])
    if keyword:
        opps = [o for o in opps if keyword.lower() in o.get("title", "").lower() or keyword.lower() in o.get("description", "").lower()]
    return {"opportunities": opps}

@app.post("/api/opportunities/apply")
def apply_opportunity(opportunity_id: str, message: str = "", session: dict = Depends(authenticated_session)):
    data = read_data("opportunities.json", {"opportunities": []})
    opp = next((o for o in data.get("opportunities", []) if o.get("id") == opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="招募不存在")
    app = {"id": f"app_{uuid.uuid4().hex[:10]}", "user_id": session_user_id(session), "message": message, "status": "pending", "created_at": time.strftime("%Y-%m-%d %H:%M")}
    opp.setdefault("applications", []).append(app)
    opp["applications_count"] = len(opp["applications"])
    write_data("opportunities.json", data)
    return {"status": "ok", "application": app}

# ─── Directory & Messaging ───
@app.get("/api/directory")
def search_directory(keyword: str = ""):
    data = user_data()
    users = data.get("users", [])
    if keyword:
        users = [u for u in users if keyword.lower() in u.get("name", "").lower() or keyword.lower() in u.get("department", "").lower()]
    return {"users": users}

@app.get("/api/messages")
def get_messages():
    return {"conversations": read_data("messages.json", {"conversations": []}).get("conversations", [])}

@app.get("/api/messaging/conversations")
def list_conversations():
    return {"conversations": read_data("messages.json", {"conversations": []}).get("conversations", [])}

@app.post("/api/messaging/send")
def send_message(chat_id: str, content: str):
    data = read_data("messages.json", {"conversations": []})
    conv = next((c for c in data.get("conversations", []) if c.get("id") == chat_id), None)
    if not conv:
        raise HTTPException(status_code=404, detail="会话未找到")
    msg = {"from": "self", "text": content, "time": time.strftime("%Y-%m-%dT%H:%M")}
    conv["msgs"].append(msg)
    conv["lastMsg"] = content
    conv["time"] = msg["time"]
    write_data("messages.json", data)
    return {"status": "ok", "message": msg}

@app.get("/api/groups")
def list_groups():
    return {"groups": read_data("groups.json", {"groups": []}).get("groups", [])}

# ─── Notifications ───
@app.get("/api/notifications")
def get_notifications(unread_only: bool = False):
    data = read_data("messages.json", {"notifications": []})
    notifs = data.get("notifications", [])
    if unread_only:
        notifs = [n for n in notifs if not n.get("read", False)]
    return {"notifications": notifs}

# ─── Notification Preferences (must be before {notification_id} route) ───
@app.get("/api/notifications/prefs")
def get_notif_prefs():
    data = read_data("preferences.json", {})
    return data.get("notif_prefs", {"urgent": True, "normal": True, "optional": True, "channels": {"in_app": True, "email_urgent": True, "email_normal": False, "email_optional": False, "browser": False}, "dnd": {"enabled": False, "start": "22:00", "end": "07:00"}, "sections": {"topic": True, "qa": True, "like": True, "event": True, "resource": True, "deadline": True}})

@app.patch("/api/notifications/prefs")
def update_notif_prefs(prefs: dict = Body(...)):
    data = read_data("preferences.json", {})
    data["notif_prefs"] = prefs
    write_data("preferences.json", data)
    return {"status": "ok", "prefs": prefs}

@app.post("/api/notifications/read")
def mark_read(notification_id: str = None):
    data = read_data("messages.json", {"notifications": []})
    for n in data.get("notifications", []):
        if n.get("id") == notification_id or notification_id is None:
            n["read"] = True
    write_data("messages.json", data)
    return {"status": "ok"}

@app.patch("/api/notifications/{notification_id}")
def update_notif_state(notification_id: str, action: str):
    data = read_data("messages.json", {"notifications": []})
    n = next((x for x in data.get("notifications", []) if x.get("id") == notification_id), None)
    if not n:
        raise HTTPException(status_code=404, detail="通知未找到")
    if action == "read": n["read"] = True
    if action == "later": n["saved_for_later"] = not n.get("saved_for_later", False)
    if action == "processed": n["processed"] = True; n["read"] = True
    write_data("messages.json", data)
    return {"status": "ok", "notification": n}

# ─── Search ───
@app.get("/api/search")
def global_search(keyword: str = Query(min_length=1), content_type: str = "all", section: str = "all"):
    needle = keyword.strip().lower()
    posts = [{"type": "post", **p} for p in read_data("posts.json", {"posts": []}).get("posts", []) if needle in (p.get("title", "") + p.get("content", "")).lower() and p.get("section") != "treehole"]
    resources = [{"type": "resource", **r} for r in read_data("courses.json", {"resources": []}).get("resources", []) if needle in (r.get("name", "") + r.get("course", "")).lower()]
    questions = [{"type": "question", **q} for q in read_data("courses.json", {"qa": []}).get("qa", []) if needle in (q.get("question", "") + q.get("course", "")).lower()]
    events = [{"type": "event", **e} for e in read_data("events.json", {"events": []}).get("events", []) if needle in (e.get("title", "") + e.get("description", "")).lower()]
    groups = {"posts": posts, "resources": resources, "questions": questions, "events": events}
    if content_type != "all":
        key = {"post": "posts", "resource": "resources", "question": "questions", "event": "events"}.get(content_type)
        groups = {k: v if k == key else [] for k, v in groups.items()}
    return {"keyword": keyword, "total": sum(len(v) for v in groups.values()), **groups}

@app.get("/api/discover/tags")
def list_tags():
    counts = {}
    for p in read_data("posts.json", {"posts": []}).get("posts", []):
        for t in p.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    tags = [{"name": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: (-x[1], x[0]))]
    return {"tags": tags[:20]}

# ─── Profile ───
@app.get("/api/profile")
def get_profile(request: Request):
    session = auth_session_for_request(request)
    if not (session.get("phone_authenticated") or session.get("email_authenticated")):
        return public_profile("u001", "校园成员")
    return public_profile(session_user_id(session), session.get("name", "校园成员"))

@app.patch("/api/profile")
def update_profile(req: ProfileUpdate, request: Request):
    session = authenticated_session(request)
    if req.avatar not in AVATAR_OPTIONS:
        raise HTTPException(status_code=400, detail="头像选项无效")
    data = user_data()
    profile = next((p for p in data["users"] if p.get("id") == session_user_id(session)), None)
    if profile is None:
        profile = profile_defaults(session_user_id(session), req.username)
        data["users"].append(profile)
    profile.update({"name": req.username, "username": req.username, "bio": req.bio, "birthday": req.birthday, "avatar": req.avatar, "profile_complete": True})
    write_data("users.json", data)
    save_auth_session({**session, "name": req.username})
    return public_profile(session_user_id(session), req.username)

# ─── Admin (core endpoints) ───
@app.get("/api/admin/session")
def admin_session(role: str = Depends(current_admin_role)):
    return {"authenticated": True, "role": role}

@app.get("/api/admin/overview")
def admin_overview(role: str = Depends(current_admin_role)):
    posts = read_data("posts.json", {"posts": []}).get("posts", [])
    reports = read_data("reports.json", {"reports": []}).get("reports", [])
    return {"pending_posts": sum(1 for p in posts if p.get("status") == "pending"), "published_posts": sum(1 for p in posts if p.get("status", "published") == "published"), "open_reports": sum(1 for r in reports if r.get("status") == "pending")}

@app.get("/api/admin/posts")
def admin_posts(status: str = "all", role: str = Depends(current_admin_role)):
    posts = read_data("posts.json", {"posts": []}).get("posts", [])
    if status != "all":
        posts = [p for p in posts if p.get("status", "published") == status]
    return {"posts": posts}

@app.patch("/api/admin/posts/{post_id}")
def moderate_post(post_id: str, status: str, reason: str = "", role: str = Depends(moderation_role)):
    data = read_data("posts.json", {"posts": []})
    post = next((p for p in data["posts"] if p.get("id") == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="帖子未找到")
    post["status"] = status
    post["moderation_note"] = reason
    write_data("posts.json", data)
    audit(role, f"post.{status}", "post", post_id, reason)
    return {"status": "ok", "post": post}

# ─── Static files (must be last) ───
app.mount("/media", StaticFiles(directory=UPLOAD_DIR), name="media")
app.mount("/resource-files", StaticFiles(directory=RESOURCE_FILE_DIR), name="resource-files")
_frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=_frontend_dir), name="frontend")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    reload_enabled = os.environ.get("UVICORN_RELOAD", "false").strip().lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_enabled)
