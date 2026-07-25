# AcademicFlow

AcademicFlow is a web application for academic planning and schedule optimization. It enables students to visualize course prerequisites as a directed acyclic graph (DAG), view their semester schedule on a Gantt chart, and detect potential study bottlenecks and deadline conflicts automatically.

## Project Structure

```text
AcademicFlow/
├── backend/            # FastAPI REST API, database models, schemas, and tests
│   ├── alembic/        # Database migrations
│   ├── routers/        # API endpoint routers (auth, plans, subjects, deadlines)
│   ├── tests/          # Pytest integration and unit tests
│   ├── api.py          # Main FastAPI application entry point
│   ├── models.py       # SQLAlchemy ORM models
│   ├── schemas.py      # Pydantic v2 schemas
│   └── seed.py         # Seed script for initial test data
├── webapp/             # React single-page application
│   ├── src/
│   │   ├── api/        # Axios client and API services
│   │   ├── components/ # React UI components (DAG, Gantt, Modals, Sidebar)
│   │   ├── context/    # React context providers (AuthContext, PlanContext)
│   │   └── hooks/      # Custom React hooks
│   └── package.json
└── docker-compose.yml  # Multi-container setup (API, Database, Frontend)
```

## Features

- Prerequisite Graph (DAG): Visual representation of subject dependencies with completed, ready, and blocked statuses. Includes PNG export.
- Semester Timeline: Gantt-style timeline showing active subjects and deadlines across semester weeks.
- Rules Engine: 16 automated checks for prerequisite deadlocks, bottlenecks, long dependency chains, exam clusters, and weekly credit load imbalances.
- Authentication: JWT access and refresh token flow with session revalidation and protected endpoints.
- Dashboard Interface: Dark theme UI with skeleton loaders, stats cards, and sidebar panels for deadlines and weekly load.

## Tech Stack

### Backend
- Framework: FastAPI (Python 3.12)
- Database: PostgreSQL 15 & SQLAlchemy 2.0 ORM
- Migrations: Alembic
- Validation: Pydantic v2
- Rate Limiting: Slowapi
- Testing: Pytest

### Frontend
- Framework: React 18 & Vite
- Language: TypeScript
- Styling: TailwindCSS v4 & Vanilla CSS
- HTTP Client: Axios

### DevOps
- Containers: Docker & Docker Compose
- CI/CD: GitHub Actions (automated Pytest, TypeScript type checking, and ESLint)

## Getting Started

### Prerequisites

Ensure you have Docker and Docker Compose installed on your system.

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=academicflow
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
```

### 2. Start Applications with Docker

Run the following command to build and start all containers:

```bash
docker-compose up --build -d
```

The application services will be accessible at:
- Frontend: http://localhost:5173
- Backend API & Swagger Docs: http://localhost:8000/docs
- PostgreSQL Database: localhost:5432

### 3. Populate Test Data

To generate sample study plans and populate subjects for alert testing, run:

```bash
docker-compose exec api python seed.py
```

Default demo account credentials:
- Email: `test@example.com`
- Password: `password123`

## Running Tests

### Backend (Pytest)
```bash
cd backend
python -m pytest
```

### Frontend (Linter & Type Check)
```bash
cd webapp
npm run lint
npx tsc --noEmit
npm run build
```

## License

All Rights Reserved. Created as a personal portfolio project.
