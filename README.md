# AcademicFlow

AcademicFlow is an academic planning and decision-support web application designed for university students. It models course curricula as a Directed Acyclic Graph (DAG) to track prerequisite chains, maps weekly workloads onto a Gantt-style Semester Timeline, automatically detects scheduling bottlenecks, and features an integrated AI Academic Advisor for strategic study planning.

## Overview

![AcademicFlow Dashboard](https://github.com/user-attachments/assets/495ad913-d61a-47b0-9e81-beaaaeb5410b)

## Live Deployment

- Web Application: https://academicflow.duckdns.org/
- Demo Account: `test@example.com` / `Password123!`

---

## Core Capabilities

### Interactive Prerequisite DAG Graph
Visualizes curriculum structures as an interactive directed acyclic graph. Courses reflect real-time academic states: completed, active (ready), or blocked by unmet prerequisites. Includes cycle detection algorithms to prevent curriculum deadlocks.

### Semester Timeline & Gantt Schedule
Renders course durations and milestones across semester weeks. Deadlines (exams, assignments, projects, tasks) appear as categorized badges directly on course tracks with countdowns and overdue indicators.

### AI Academic Advisor
![AcademicFlow AI Advisor](https://github.com/user-attachments/assets/6b5bafb3-fc7b-44c6-923e-15579aeabce4)

A real-time advisory chat assistant powered by Google Gemini with Server-Sent Events (SSE) streaming. The advisor automatically evaluates student prerequisites, critical bottlenecks, and imminent deadlines to recommend prioritized weekly study strategies. Includes multi-tier failover (`gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-3.8-flash`) and transient error retries.

### Conflict & Bottleneck Detection Engine
An automated analysis engine checking study plans against 16 predefined rules, including:
- Prerequisite cycles and deadlock states.
- High-impact bottlenecks blocking multiple downstream courses.
- Exam hourly collisions and clustered exam windows.
- Unfeasible single-day deadlines and excessive weekly credit hour limits.

### Calendar & PDF Export
- **iCalendar (.ics):** Generates RFC 5545 compliant calendar files for import into Google Calendar, Apple Calendar, or Microsoft Outlook.
- **Academic Summary (PDF):** Generates structured printable semester schedules via ReportLab.

---

## Architecture & Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 15 & SQLite (Fallback) with SQLAlchemy 2.0 ORM
- **Migrations:** Alembic
- **Caching:** Redis 7
- **AI Integration:** Google Gemini API with SSE streaming and multi-tier failover
- **Exports:** ReportLab (PDF generation) & icalendar (RFC 5545 ICS generation)
- **Validation & Settings:** Pydantic v2 & Pydantic Settings
- **Rate Limiting & Security:** SlowAPI, Passlib (Bcrypt), Python-Jose (JWT)
- **Testing:** Pytest, AnyIO, AsyncIO (45 automated tests)

### Frontend
- **Framework:** React 19 & Vite 8 (Rolldown vendor chunking)
- **Language:** TypeScript 5
- **State & Server Cache:** TanStack Query v5 (React Query)
- **Schema Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose
- **Continuous Integration:** GitHub Actions (Automated testing, linting, and build verification)

---

## Project Structure

```text
AcademicFlow/
├── backend/
│   ├── alembic/        # Database schema migrations
│   ├── routers/        # REST API endpoints (auth, plans, subjects, deadlines, advisor)
│   ├── services/       # Core business logic (DAG analysis, scheduler, advisor streaming)
│   ├── tests/          # Pytest test suite
│   ├── api.py          # FastAPI application entrypoint
│   ├── models.py       # SQLAlchemy ORM database models
│   ├── schemas.py      # Pydantic validation schemas
│   └── seed.py         # Balanced database seeding script
├── webapp/
│   ├── src/
│   │   ├── api/        # Axios API clients
│   │   ├── components/ # React components (DAG, Gantt, Advisor, Modals)
│   │   ├── context/    # React Context providers (Auth, Plan, Advisor)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript interfaces and type definitions
│   │   └── services/   # Frontend API services and token storage
│   └── package.json
└── docker-compose.yml  # Multi-service container orchestration
```

---

## Getting Started

### Prerequisites
- Docker (20.10+) and Docker Compose (v2.0+)

### 1. Environment Setup
Create a `.env` file in the project root:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=academicflow
SECRET_KEY=generate_a_secure_random_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start Application
Build and run the entire stack with Docker Compose:

```bash
docker compose up --build -d
```

Services will be accessible at:
- Frontend Application: http://localhost:5173
- REST API & Swagger UI: http://localhost:8000/docs
- PostgreSQL Database: localhost:5432

### 3. Seed Demo Data
Populate the database with a pre-configured curriculum and deadlines:

```bash
docker compose exec api python seed.py
```

Demo Credentials:
- Email: `test@example.com`
- Password: `Password123!`

---

## Running the Test Suites

### Backend Unit & Integration Tests (Pytest)
```bash
cd backend
python -m pytest
```

### Frontend Component Tests (Vitest) & Build Check
```bash
cd webapp
npm test
npm run build
```

---

## Author

Filip Adamiak
- Email: [f.admiakk@gmail.com](mailto:f.admiakk@gmail.com)
- GitHub: [@adam1ak](https://github.com/adam1ak)
