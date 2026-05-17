import os
from dotenv import load_dotenv
from starlette.status import HTTP_201_CREATED

load_dotenv()

from jose import jwt, JWTError

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from database import engine, SessionLocal
import models

from sqlalchemy.orm import Session

from core import build_sample_graph, Subject, CourseGraph
from pydantic import BaseModel
from typing import List

from security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM

from datetime import timedelta

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

class SubjectInput(BaseModel):
    name: str
    field: str
    duration: int
    dependents: List[str]

class GraphInput(BaseModel):
    max_concurrent: int
    subjects: List[SubjectInput]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # dev # todo: replace with env-based
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        jwt_decode = jwt.decode(token, SECRET_KEY, [ALGORITHM])
        jwt_email = jwt_decode.get("sub")

        if not jwt_email:
            raise HTTPException(status_code=401, detail="Could not validate credentials")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
    current_user = db.query(models.User).filter(models.User.email == jwt_email).first()

    if not current_user :
        raise HTTPException(status_code=401, detail="User does not exists")
    else:
        return current_user

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }

@app.get("/api/v1/study-plan")
def study_plan():
    graph = build_sample_graph()
    result = graph.get_constrained_study_plan(max_concurrent=2)

    return result

@app.post("/api/v1/generate-plan", status_code=HTTP_201_CREATED)
def generate_plan(payload: GraphInput,
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):

    db_plan = models.Plan(name="Generated Plan", max_concurrent=payload.max_concurrent, owner_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    db_subjects_map = {}

    for subject in payload.subjects:
        db_subject = models.Subject(
            name=subject.name,
            field=subject.field,
            duration=subject.duration,
            plan_id=db_plan.id
        )

        db.add(db_subject)
        db_subjects_map[subject.name] = db_subject

    db.commit()

    for subject in payload.subjects:
        db_subject = db_subjects_map[subject.name]

        for dependent_name in subject.dependents:
            dependent_db_subject = db_subjects_map[dependent_name]
            db_subject.dependent_subjects.append(dependent_db_subject)

    db.commit()

    graph = CourseGraph()

    # nodes
    for subject in payload.subjects:
        sbj = Subject(subject.name, subject.field, subject.duration)
        graph.add_subject(sbj)

    # edges
    for subject in payload.subjects:
        for dependent in subject.dependents:
            graph.add_dependent(subject.name, dependent)

    result = graph.get_constrained_study_plan(payload.max_concurrent)
    return result


def reconstruct_and_calculate_plan(db_plan: models.Plan):
    graph = CourseGraph()

    for db_subject in db_plan.subjects:
        graph.add_subject(Subject(
            db_subject.name,
            db_subject.field,
            db_subject.duration
        ))

    for db_subject in db_plan.subjects:
        for dependent in db_subject.dependent_subjects:
            graph.add_dependent(db_subject.name, dependent.name)

    result = graph.get_constrained_study_plan(db_plan.max_concurrent)

    return result

@app.get("/api/v1/plans/{plan_id}")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()

    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    return reconstruct_and_calculate_plan(db_plan)

@app.get("/api/v1/my_plans")
def get_my_plan(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user_plans = db.query(models.Plan).filter(models.Plan.owner_id == current_user.id).all()

    all_plans = []

    for single_plan in user_plans:
        calculated_schedule = reconstruct_and_calculate_plan(single_plan)

        single_plan_data = {
            "id": single_plan.id,
            "name": single_plan.name,
            "schedule": calculated_schedule
        }

        all_plans.append(single_plan_data)

    return all_plans

@app.post("/api/v1/register", response_model=UserResponse, status_code=HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/api/v1/token", response_model=Token, status_code=HTTP_201_CREATED)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"message": "Session verified", "user": current_user.email}

@app.delete("/api/v1/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    plan = db.query(models.Plan).filter(
        models.Plan.id == plan_id,
        models.Plan.owner_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    db.delete(plan)
    db.commit()