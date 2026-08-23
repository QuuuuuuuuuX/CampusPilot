# CampusPilot · AI Campus Interactive Platform

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.7.0-176341" alt="version">
  <img src="https://img.shields.io/badge/python-3.9+-blue" alt="python">
  <img src="https://img.shields.io/badge/framework-FastAPI-009688" alt="fastapi">
  <img src="https://img.shields.io/badge/AI-Function%20Calling-8b5cf6" alt="ai">
</p>

<p align="center">
**🌐 Languages:** [English](README.md) · [中文](README.zh-CN.md)
</p>

> **CampusPilot** — an AI-powered campus interactive platform for XJTLU students and faculty.
> One-stop solution for timetables, resources, messaging, clubs, and anonymous social — all through natural language conversation.
> A XJTLU Summer Undergraduate Research Fellowship (SURF) project.

---

## 📖 Introduction

CampusPilot is a campus interactive platform built on **AI Function Calling**. Students use natural language to chat with the AI assistant to look up timetables, find professors, search resources, and sign up for events. It also provides a complete suite of campus social features: a unified information portal, academic center, campus messaging, community feed, anonymous tree-hole, and team matching.

**Core highlight**: turn a complex campus information system into a *"human-speaking AI navigator"*.

---

## 🖼️ Screenshots

| Desktop | Mobile |
|:---:|:---:|
| ![Desktop](docs/screenshots/surf-desktop.png) | ![Mobile](docs/screenshots/surf-mobile.png) |

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🤖 **AI Campus Assistant** | Natural-language chat: timetables, professors, resources, event sign-up |
| 📬 **Information Portal** | Unified inbox, smart classification, search |
| 📚 **Academic Center** | Course resources ("share-to-unlock"), Q&A, professor info, assignment DDL board |
| 💬 **Campus Messaging** | Directory, private chat, group chat |
| 🌍 **Community Feed** | Posts with images, comments, likes |
| 🌳 **Anonymous Tree-hole** | A safe, anonymous space to speak out |
| 🎪 **Clubs & Events** | Event publishing, calendar, one-click sign-up |
| 👥 **Team Matching** | Team recruitment with smart recommendations |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- pip

### Start the backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# First run: initialize the database (JSON → SQLite migration, idempotent)
python migrate.py

# Start the server
python main.py
```

After startup:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger API docs |
| `http://localhost:8000/health` | Health check |
| `POST http://localhost:8000/api/chat` | AI chat |

### Start the frontend

Open `frontend/index.html` in a browser (vanilla HTML/CSS/JS, no build step).

---

## 🔐 Auth & Core API

### User authentication (v0.6.0)

- Register: `POST /api/auth/register` (auto-login, returns token)
- Login: `POST /api/auth/login` (username or email + password)
- Current user: `GET /api/auth/me`
- Update profile: `PUT /api/auth/profile`

> All write operations require login with header `Authorization: Bearer <token>`. Passwords hashed with PBKDF2; token is JWT (7-day expiry).

### Course resources "share-to-unlock" (v0.7.0)

Each student gets 3 free downloads per day; sharing 1 resource unlocks +2. `GET/POST /api/courses/resources`, `GET /api/resources/file/{id}`.

### Image upload (v0.6.0)

`POST /api/upload/image` (multipart, field `file`, login required). Supports JPG/PNG/GIF/WebP, up to 5MB, with magic-byte validation.

---

## 🧩 WorkBuddy Setup

1. Open **WorkBuddy** → Agent / Skill management
2. Create a new Agent:
   - Name: `XJTLU Campus Assistant`
   - System prompt: copy from `agent/SYSTEM_PROMPT.md`
   - Tool definitions: see `agent/SKILL.md`
3. Choose a model → DeepSeek or a Function-Calling-compatible model
4. Set API Base URL to `http://localhost:8000`

---

## 📁 Project Structure

```
campus-pilot/
├── agent/                    # WorkBuddy Agent config
│   ├── SKILL.md              # Skill definition (Function Calling)
│   └── SYSTEM_PROMPT.md      # AI assistant system prompt
├── backend/                  # FastAPI backend
│   ├── main.py               # Entry point
│   ├── agent.py              # AI Agent engine
│   ├── auth.py               # JWT auth
│   ├── tools/                # Function Calling tools
│   │   ├── search.py         # Information retrieval
│   │   ├── academic.py       # Courses & academic
│   │   ├── community.py      # Community content
│   │   ├── treehole.py       # Anonymous tree-hole
│   │   ├── messaging.py      # Campus messaging
│   │   └── events.py         # Clubs & events
│   └── .env.example          # Env var template
├── frontend/                 # Frontend (vanilla HTML/CSS/JS)
│   ├── index.html
│   ├── demo.css
│   └── demo.js
├── docs/                     # Docs & screenshots
│   ├── screenshots/
│   └── DEPLOY.md
└── P0_FEATURES.md            # P0 feature checklist & progress
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| AI Agent | OpenAI Function Calling (DeepSeek / Ollama compatible) |
| Backend | FastAPI + Uvicorn |
| Storage | SQLite (WAL mode, concurrency-safe) |
| Auth | JWT + PBKDF2 password hashing |
| Frontend | Vanilla HTML / CSS / JS (mobile-first, responsive) |
| Dev platform | WorkBuddy (Tencent's OpenClaw) |

---

## 📌 Changelog

| Version | Notes |
|---------|-------|
| **v0.7.0** | Core P0 features + SQLite + auth (register/login/email code/password) + image upload + course resources share-to-unlock |
| v0.6.0 | User auth + image upload |
| v0.5.0 | Mock-data version |

> Deployment guide: `docs/DEPLOY.md`
