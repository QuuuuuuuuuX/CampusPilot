"""学术工具 — 课程、资料、问答"""
import json
import time
import uuid
from . import _load_json, _save_json


def academic_center(action: str, params: dict = None) -> str:
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
        return _search_qa(params.get("keyword", ""))
    elif action == "qa_ask":
        return _ask_question(params.get("course", ""), params.get("question", ""), params.get("anonymous", False))
    else:
        return json.dumps({"error": f"未知操作: {action}"})


def _get_timetable(week=None):
    return json.dumps({"message": "课表功能开发中", "week": week or "current"}, ensure_ascii=False)


def _get_assignments(course=None):
    data = _load_json("courses.json")
    courses = data.get("courses", [])
    results = [{"course": c["code"], "assignment": "期末复习", "deadline": "2026-08-30"} for c in courses if not course or c["code"] == course]
    return json.dumps(results[:5], ensure_ascii=False, indent=2)


def _get_exam_scores():
    return json.dumps({"message": "成绩查询功能开发中"}, ensure_ascii=False)


def _search_resources(keyword="", course=None):
    data = _load_json("courses.json")
    resources = data.get("resources", [])
    results = []
    for r in resources:
        if keyword and keyword.lower() not in r.get("name", "").lower() and keyword.lower() not in r.get("course", "").lower():
            continue
        if course and r.get("course", "") != course:
            continue
        results.append(r)
    return json.dumps({"resources": results[:10], "total": len(results)}, ensure_ascii=False, indent=2)


def _search_qa(keyword=""):
    data = _load_json("courses.json")
    qa = data.get("qa", [])
    results = []
    for q in qa:
        if keyword and keyword.lower() not in q.get("question", "").lower() and keyword.lower() not in q.get("course", "").lower():
            continue
        results.append(q)
    return json.dumps({"questions": results[:10], "total": len(results)}, ensure_ascii=False, indent=2)


def _ask_question(course, question, anonymous=False):
    data = _load_json("courses.json")
    item = {"id": f"q_{uuid.uuid4().hex[:10]}", "question": question, "course": course, "author": "匿名" if anonymous else "张三", "status": "unsolved", "answers_count": 0, "answers_detail": [], "time": time.strftime("%Y-%m-%dT%H:%M")}
    data.setdefault("qa", []).insert(0, item)
    _save_json("courses.json", data)
    return json.dumps({"status": "ok", "question": item}, ensure_ascii=False, indent=2)


ACADEMIC_TOOL = {
    "type": "function",
    "function": {
        "name": "academic_center",
        "description": "学术中心：课表、作业、成绩、课程资料搜索、课程问答",
        "parameters": {"type": "object", "properties": {"action": {"type": "string", "enum": ["timetable", "assignments", "exam_scores", "resource_search", "qa_search", "qa_ask"]}, "params": {"type": "object", "properties": {"keyword": {"type": "string"}, "course": {"type": "string"}, "question": {"type": "string"}, "anonymous": {"type": "boolean"}, "week": {"type": "string"}}}}, "required": ["action"]},
    },
}
