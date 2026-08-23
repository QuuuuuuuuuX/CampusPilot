"""XJTLU Virtual Campus — 后端 API"""
import os
import secrets
import shutil
from typing import Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from agent import CampusAgent
import auth
from auth import create_user, get_credentials, get_user_by_identifier, get_user_by_id, update_profile, create_token

app = FastAPI(title="XJTLU Virtual Campus", version="0.7.0")
agent = CampusAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# ─── 图片上传配置 ───

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

# ─── 资料文件上传配置 ───

ALLOWED_RESOURCE_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/x-rar-compressed": ".rar",
    "application/x-7z-compressed": ".7z",
}
MAX_RESOURCE_SIZE = 50 * 1024 * 1024  # 50MB

# 图片文件头魔数校验（不依赖 Pillow）
_MAGIC = {
    b"\xff\xd8\xff": ".jpg",
    b"\x89PNG\r\n\x1a\n": ".png",
    b"GIF87a": ".gif",
    b"GIF89a": ".gif",
    b"RIFF": ".webp",  # 需二次校验 WEBP
}

def _validate_image(data: bytes) -> bool:
    if len(data) < 12:
        return False
    for magic, ext in _MAGIC.items():
        if data.startswith(magic):
            if ext == ".webp":
                return data[8:12] == b"WEBP"
            return True
    return False


os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """从 Bearer Token 解析当前用户（写操作必须登录）"""
    user_id = auth.decode_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="登录已过期，请重新登录",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = auth.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_optional_user(token: str = Depends(oauth2_scheme_optional)) -> Optional[dict]:
    """可选登录：带 token 返回用户，未登录返回 None（用于公开接口的个性化）"""
    if not token:
        return None
    user_id = auth.decode_token(token)
    if user_id is None:
        return None
    return auth.get_user_by_id(user_id)


# ─── 数据模型 ───

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    name: str
    department: Optional[str] = ""
    code: str  # 邮箱验证码

class LoginRequest(BaseModel):
    identifier: str  # 用户名或邮箱
    password: Optional[str] = None
    code: Optional[str] = None  # 验证码登录模式

class SendCodeRequest(BaseModel):
    email: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None

# ─── 根路径 ───

@app.get("/health")
def root():
    return {"service": "XJTLU Virtual Campus", "version": app.version, "status": "running"}

# ─── AI 对话 ───

@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest):
    """AI 对话接口（核心入口）"""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    reply = agent.chat(session_id=req.session_id, user_message=req.message)
    return ChatResponse(reply=reply)

@app.post("/api/session/clear")
def clear_session(session_id: str):
    """清除对话历史"""
    agent.clear_session(session_id)
    return {"status": "cleared"}

# ─── 用户认证 ───

@app.post("/api/auth/send-code")
def send_code(req: SendCodeRequest):
    """发送邮箱验证码（60 秒冷却）"""
    try:
        result = auth.send_verification_code(req.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@app.post("/api/auth/register", status_code=201)
def register(req: RegisterRequest):
    """注册账号（需邮箱验证码），成功后直接返回 token（自动登录）"""
    if not req.code:
        raise HTTPException(status_code=400, detail="请先获取邮箱验证码")
    if not auth.verify_code(req.email, req.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")
    try:
        user = create_user(
            username=req.username,
            email=req.email,
            password=req.password,
            name=req.name,
            department=req.department or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", "token": create_token(user["id"]), "user": user}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    """登录：密码模式（用户名/邮箱+密码）或验证码模式（邮箱+验证码）"""
    # 验证码模式
    if req.code:
        user = get_user_by_identifier(req.identifier)
        if user is None:
            raise HTTPException(status_code=400, detail="该邮箱尚未注册，请先注册")
        if not auth.verify_code(user["email"], req.code):
            raise HTTPException(status_code=400, detail="验证码错误或已过期")
        return {"status": "ok", "token": create_token(user["id"]), "user": user}

    # 密码模式
    if not req.password:
        raise HTTPException(status_code=400, detail="请输入密码或使用验证码登录")
    user = get_credentials(req.identifier)
    if user is None or not auth.verify_password(
        req.password, user["password_salt"], user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    safe_user = {k: v for k, v in user.items() if k not in ("password_salt", "password_hash")}
    return {"status": "ok", "token": create_token(user["id"]), "user": safe_user}


@app.get("/api/auth/me")
def me(user: dict = Depends(get_current_user)):
    """当前登录用户信息"""
    return {"status": "ok", "user": user}


@app.put("/api/auth/profile")
def profile(req: ProfileUpdate, user: dict = Depends(get_current_user)):
    """更新个人资料（昵称/院系）"""
    updated = update_profile(user["id"], name=req.name, department=req.department)
    return {"status": "ok", "user": updated}


# ─── 图片上传 ───

@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """上传图片，返回可访问的 URL（需登录，5MB 内，JPG/PNG/GIF/WebP）"""
    ext = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if ext is None:
        raise HTTPException(status_code=400, detail="仅支持 JPG/PNG/GIF/WebP 格式")
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="图片不能超过 5MB")
    if not _validate_image(data):
        raise HTTPException(status_code=400, detail="文件内容不是有效图片")
    filename = f"{secrets.token_hex(8)}{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(data)
    return {
        "status": "ok",
        "url": f"/uploads/{filename}",
        "filename": filename,
        "size": len(data),
    }


@app.put("/api/auth/password")
def change_password(req: PasswordChangeRequest, user: dict = Depends(get_current_user)):
    """修改密码（需登录，校验旧密码）"""
    try:
        auth.change_password(user["id"], req.old_password, req.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", "message": "密码修改成功"}


@app.post("/api/upload/resource")
async def upload_resource(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """上传课程资料文件（需登录，50MB 内，文档/压缩包格式），返回文件名供分享接口使用"""
    ext = ALLOWED_RESOURCE_TYPES.get(file.content_type or "")
    if ext is None:
        raise HTTPException(status_code=400, detail="仅支持 PDF/Word/PPT/Excel/TXT/MD/压缩包 格式")
    data = await file.read()
    if len(data) > MAX_RESOURCE_SIZE:
        raise HTTPException(status_code=400, detail="资料文件不能超过 50MB")
    if not data:
        raise HTTPException(status_code=400, detail="文件内容为空")
    filename = f"res_{secrets.token_hex(8)}{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(data)
    return {
        "status": "ok",
        "filename": filename,
        "url": f"/uploads/{filename}",
        "size": len(data),
    }


# ─── 课程与学术 ───

@app.get("/api/courses/timetable")
def get_timetable(week: str = None):
    from tools.academic import academic_center
    import json
    return json.loads(academic_center("timetable", {"week": week}))

@app.get("/api/courses/assignments")
def get_assignments(course: str = None):
    from tools.academic import academic_center
    import json
    return json.loads(academic_center("assignments", {"course": course}))

@app.get("/api/courses/exams")
def get_exam_scores():
    from tools.academic import academic_center
    import json
    return json.loads(academic_center("exam_scores"))

@app.get("/api/courses/resources")
def get_resources(keyword: str = None, course: str = None, user: dict = Depends(get_optional_user)):
    """课程资料列表 + 搜索（可选登录：带 token 时返回个人今日下载额度）"""
    from tools.resources import list_resources
    return list_resources(keyword or "", course or "", user["id"] if user else None)


@app.post("/api/courses/resources")
def share_resource(title: str, filename: str, course: str = "", type: str = "",
                   user: dict = Depends(get_current_user)):
    """分享资料（以一换一）：入库 + 当日下载额度 +2"""
    from tools.resources import share_resource as _share
    result = _share(title, course, type, user["name"], user["id"], filename)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/api/resources/file/{resource_id}")
def download_resource_file(resource_id: str, user: dict = Depends(get_current_user)):
    """下载资料文件：消耗一次当日额度后下发文件（额度用完返回 402 + 激励规则）"""
    from tools.resources import get_resource, consume_download, record_download, RULES
    res = get_resource(resource_id)
    if res is None:
        raise HTTPException(status_code=404, detail="资料不存在")
    filename = res.get("filename")
    if not filename:
        raise HTTPException(status_code=404, detail="该资料暂无文件可下载")
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="文件已丢失，请联系管理员")
    ok, remaining = consume_download(user["id"])
    if not ok:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exceeded",
                "message": "今日下载额度已用完，分享 1 份资料即可解锁 +2 次",
                "remaining": 0,
                "rules": RULES,
            },
        )
    record_download(resource_id)
    return FileResponse(path, filename=res.get("name", filename), media_type="application/octet-stream")

@app.get("/api/courses/qa")
def get_qa(keyword: str = None):
    from tools.academic import academic_center
    import json
    return json.loads(academic_center("qa_search", {"keyword": keyword or ""}))

@app.post("/api/courses/qa")
def post_qa(course: str, question: str, anonymous: bool = False, user: dict = Depends(get_current_user)):
    from tools.academic import academic_center
    import json
    return json.loads(academic_center("qa_ask", {"course": course, "question": question, "anonymous": anonymous}))

@app.get("/api/professors")
def get_professors(keyword: str = None):
    from tools.search import _search_professors
    import json
    return json.loads(_search_professors(keyword or ""))

# ─── 社区 ───

@app.get("/api/community/feed")
def get_feed(section: str = None, page: int = 1):
    from tools.community import _get_feed
    import json
    return json.loads(_get_feed(section, page))

@app.post("/api/community/posts")
def create_post(content: str, section: str = "general", anonymous: bool = False, title: str = None, images: str = None, user: dict = Depends(get_current_user)):
    from tools.community import _publish_post
    import json
    author = None if anonymous else user["name"]
    img_list = [u.strip() for u in (images or "").split(",") if u.strip()] if images else []
    return json.loads(_publish_post(content, section, anonymous, title, author=author, images=img_list))

@app.post("/api/community/comments")
def add_comment(post_id: str, content: str, anonymous: bool = False, user: dict = Depends(get_current_user)):
    from tools.community import _add_comment
    import json
    author = None if anonymous else user["name"]
    return json.loads(_add_comment(post_id, content, anonymous, author=author))

@app.post("/api/community/like")
def like_post(post_id: str, user: dict = Depends(get_current_user)):
    from tools.community import _like_post
    import json
    return json.loads(_like_post(post_id))

@app.post("/api/community/collect")
def collect_post(post_id: str, user: dict = Depends(get_current_user)):
    """收藏/取消收藏帖子（toggle）"""
    from tools.community import _collect_post
    import json
    return json.loads(_collect_post(post_id, user["id"]))

@app.get("/api/community/collects")
def my_collects(user: dict = Depends(get_current_user)):
    """我的收藏列表"""
    from tools.community import _my_collects
    import json
    return json.loads(_my_collects(user["id"]))

@app.post("/api/community/report")
def report_post(post_id: str, reason: str = "", user: dict = Depends(get_current_user)):
    from tools.community import _report_post
    import json
    return json.loads(_report_post(post_id, reason))

# ─── 匿名树洞 ───

@app.get("/api/treehole/hot")
def treehole_hot():
    from tools.treehole import _treehole_hot
    import json
    return json.loads(_treehole_hot())

@app.post("/api/treehole/posts")
def treehole_post(content: str, category: str = None, user: dict = Depends(get_current_user)):
    from tools.treehole import _treehole_post
    import json
    return json.loads(_treehole_post(content, category))

@app.post("/api/treehole/comments")
def treehole_comment(post_id: str, content: str, user: dict = Depends(get_current_user)):
    from tools.treehole import _treehole_comment
    import json
    return json.loads(_treehole_comment(post_id, content))

@app.post("/api/treehole/report")
def treehole_report(post_id: str, reason: str = "", user: dict = Depends(get_current_user)):
    from tools.treehole import _treehole_report
    import json
    return json.loads(_treehole_report(post_id, reason))

# ─── 活动与社团 ───

@app.get("/api/events")
def list_events(month: str = None):
    from tools.events import _list_events
    import json
    return json.loads(_list_events(month))

@app.get("/api/events/mine")
def my_events(user: dict = Depends(get_current_user)):
    """我报名的活动"""
    from tools.events import _my_events
    import json
    return json.loads(_my_events(user["id"]))

@app.get("/api/events/{event_id}")
def event_detail(event_id: str):
    from tools.events import _event_detail
    import json
    return json.loads(_event_detail(event_id))

@app.post("/api/events/register")
def register_event(event_id: str, user: dict = Depends(get_current_user)):
    from tools.events import _register_event
    import json
    return json.loads(_register_event(event_id, user["id"], user["name"]))

@app.get("/api/clubs")
def list_clubs():
    from tools.events import _list_clubs
    import json
    return json.loads(_list_clubs())

@app.get("/api/clubs/{club_id}")
def club_info(club_id: str):
    from tools.events import _club_info
    import json
    return json.loads(_club_info(club_id))

# ─── 通讯与消息 ───

@app.get("/api/directory")
def search_directory(keyword: str = ""):
    from tools.search import _search_directory
    import json
    return json.loads(_search_directory(keyword))

@app.post("/api/messaging/chat")
def start_chat(target_id: str, message: str = "", user: dict = Depends(get_current_user)):
    from tools.messaging import _start_chat
    import json
    return json.loads(_start_chat(target_id, message, sender=user["name"]))

@app.post("/api/messaging/send")
def send_message(chat_id: str, content: str, user: dict = Depends(get_current_user)):
    from tools.messaging import _send_message
    import json
    return json.loads(_send_message(chat_id, content, sender=user["name"]))

@app.get("/api/messages")
def get_messages():
    from tools.messaging import _list_conversations
    import json
    return json.loads(_list_conversations())

@app.get("/api/messages/search")
def search_messages(keyword: str):
    from tools.messaging import _search_messages
    import json
    return json.loads(_search_messages(keyword))

# ─── 通知 ───

@app.get("/api/notifications")
def get_notifications(unread_only: bool = False):
    from tools.platform import _list_notifications
    import json
    return json.loads(_list_notifications(unread_only))

@app.post("/api/notifications/read")
def mark_notification_read(notification_id: str = None):
    from tools.platform import _mark_read
    import json
    return json.loads(_mark_read(notification_id))

# ─── 全局搜索 ───

@app.get("/api/search")
def global_search(keyword: str, category: str = None):
    """全局搜索：跨课程、教授、活动、帖子搜索"""
    from tools.search import search_info
    import json
    if category:
        return json.loads(search_info(category, keyword))
    # 跨所有类别搜索
    results = {}
    for cat in ["course", "professor", "event", "post"]:
        try:
            r = json.loads(search_info(cat, keyword))
            if "message" not in r:
                results[cat] = r
        except:
            pass
    return results

# ─── 前端静态页面（同源 serve：http://localhost:8000 直接打开完整应用） ───

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


# ─── 启动 ───

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
