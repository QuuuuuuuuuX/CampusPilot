"""课程与学术中心工具"""
import json
import random
from typing import Optional
from . import _load_json


def academic_center(action: str, params: dict = None) -> str:
    """课程与学术中心相关操作"""
    if params is None:
        params = {}

    if action == "timetable":
        return _get_timetable(params.get("week"))
    elif action == "assignments":
        return _get_assignments(params.get("course"))
    elif action == "exam_scores":
        return _get_exam_scores()
    elif action == "resource_search":
        return _search_resources(params.get("keyword", ""), params.get("course"))
    elif action == "qa_search":
        return _qa_search(params.get("keyword", ""))
    elif action == "qa_ask":
        return _qa_ask(params.get("course", ""), params.get("question", ""), params.get("anonymous", False))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _get_timetable(week=None):
    data = _load_json("courses.json")
    courses = data.get("courses", [])
    if week:
        week_str = f"第{week}周"
    else:
        week_str = "本周"

    results = []
    # Mock 课表 - 从课程数据生成
    days = ["周一", "周二", "周三", "周四", "周五"]
    time_slots = ["09:00-10:30", "10:45-12:15", "13:30-15:00", "15:15-16:45"]
    for i, c in enumerate(courses[:6]):
        day = days[i % 5]
        slot = time_slots[i % 4]
        results.append(f"{day} {slot} {c['name']} ({c['location']})")

    return json.dumps({
        "week": week_str,
        "timetable": results,
    }, ensure_ascii=False, indent=2)


def _get_assignments(course=None):
    data = _load_json("courses.json")
    assignments = data.get("assignments", [])
    results = []
    for a in assignments:
        if course and course.lower() not in a.get("course", "").lower():
            continue
        results.append({
            "课程": a["course"],
            "作业": a["title"],
            "截止": a.get("deadline", ""),
            "状态": a.get("status", ""),
        })
    if not results:
        return json.dumps({"message": "恭喜，暂时没有待完成的作业~"})
    return json.dumps({"assignments": results}, ensure_ascii=False, indent=2)


def _get_exam_scores():
    data = _load_json("courses.json")
    scores = data.get("exam_scores", [])
    if not scores:
        return json.dumps({"message": "暂时没有考试成绩数据"})
    return json.dumps({"scores": scores}, ensure_ascii=False, indent=2)


def _search_resources(keyword, course=None):
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
            "名称": r["name"],
            "课程": r.get("course", ""),
            "类型": r.get("type", ""),
            "上传者": r.get("uploader", ""),
            "下载次数": r.get("downloads", 0),
        })
    if not results:
        return json.dumps({"message": "没有找到匹配的资料"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _qa_search(keyword):
    data = _load_json("courses.json")
    qa = data.get("qa", [])
    results = []
    for q in qa:
        if keyword and keyword.lower() not in q.get("question", "").lower():
            continue
        results.append({
            "课程": q.get("course", ""),
            "问题": q["question"][:60] + ("..." if len(q["question"]) > 60 else ""),
            "回答数": q.get("answers", 0),
        })
    if not results:
        return json.dumps({"message": "没有找到相关问答"})
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _qa_ask(course, question, anonymous=False):
    if not course or not question:
        return json.dumps({"error": "课程和问题不能为空"})
    anon_tag = "（匿名）" if anonymous else ""
    return json.dumps({
        "status": "ok",
        "message": f"问题已提交到「{course}」问答区{anon_tag}，等待回复~",
    }, ensure_ascii=False)


# ─── 工具定义 ───

ACADEMIC_TOOL = {
    "type": "function",
    "function": {
        "name": "academic_center",
        "description": "课程与学术中心：查课表、作业DDL、考试成绩、课程资料搜索、问答区",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "操作类型",
                    "enum": ["timetable", "assignments", "exam_scores", "resource_search", "qa_search", "qa_ask"],
                },
                "params": {
                    "type": "object",
                    "description": "参数（根据 action 不同而异）",
                    "properties": {
                        "week": {"type": "string"},
                        "course": {"type": "string"},
                        "keyword": {"type": "string"},
                        "question": {"type": "string"},
                        "anonymous": {"type": "boolean"},
                    },
                },
            },
            "required": ["action"],
        },
    },
}
