"""邮件发送模块（SMTP）

配置（.env）：
  SMTP_HOST=smtp.qq.com
  SMTP_PORT=465
  SMTP_USER=xxx@qq.com
  SMTP_PASS=<授权码，不是登录密码>
  SMTP_FROM=xxx@qq.com        # 可选，默认同 SMTP_USER
  SMTP_USE_SSL=true           # true=SSL(465) / false=STARTTLS(587)

未配置 SMTP 时 send_email 返回 False，由调用方降级处理
（验证码会打印到服务日志，方便开发联调）。
"""
import logging
import os
import smtplib
from email.header import Header
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "") or SMTP_USER
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "true").lower() == "true"

logger = logging.getLogger("campus.mail")


def is_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASS)


def send_email(to: str, subject: str, body: str) -> bool:
    """发送邮件；SMTP 未配置或发送失败返回 False"""
    if not is_configured():
        logger.warning("[mail] SMTP 未配置，无法发送到 %s（body: %s）", to, body[:80])
        return False
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = SMTP_FROM
    msg["To"] = to
    try:
        if SMTP_USE_SSL:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15)
            server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, [to], msg.as_string())
        server.quit()
        logger.info("[mail] 已发送到 %s: %s", to, subject)
        return True
    except Exception as e:
        logger.error("[mail] 发送失败 %s -> %s: %s", SMTP_HOST, to, e)
        return False
