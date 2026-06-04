import re

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
from sqlalchemy.exc import IntegrityError

from core import Subject, CourseGraph
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Literal

from security import get_password_hash, verify_password, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, \
    ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS

from datetime import timedelta, date

import logging
logger = logging.getLogger("academicflow.api")

class SingleSubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    field: str
    duration: int = Field(gt=0, description="Duration in weeks")
    classroom: Optional[str] = Field(default=None, description="Optional classroom number")
    dependents: List[str] = Field(default=[], description="List of names of dependent subjects")

class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    field: Optional[str] = Field(default=None)
    duration: Optional[int] = Field(default=None, gt=0, description="Duration in weeks")
    classroom: Optional[str] = Field(default=None, description="Optional classroom number")
    dependents: Optional[List[str]] = Field(default=None, description="List of names of dependent subjects")

class DeadlineCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100, description="Title of deadline")
    type: Literal["exam", "assignment", "project", "task"]
    due_date: date
    classroom: Optional[str] = Field(default=None, description="Optional classroom number")
    plan_id: Optional[int] = Field(default=None, description="Optional relationship with plan")

class DeadlineUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    type: Optional[Literal["exam", "assignment", "project", "task"]] = Field(default=None)
    due_date: Optional[date] = Field(default=None)
    classroom: Optional[str] = Field(default=None)
    plan_id: Optional[int] = Field(default=None)

class DeadlineResponse(BaseModel):
    id: int
    title: str
    type: str
    due_date: date
    classroom: Optional[str]
    plan_id: Optional[int]

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Password must be at least 8 characters long")

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, value: str) -> str:
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit (0-9).")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_+-]", value):
            raise ValueError("Password must contain at least one special character.")

        return value

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

class SubjectInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    field: str
    duration: int = Field(gt=0, description="Duration must be greater than 0 weeks")
    dependents: List[str]

class GraphInput(BaseModel):
    max_concurrent: int = Field(gt=0, le=10)
    subjects: List[SubjectInput]

class PlanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100, description="Name of study plan")
    max_concurrent: int = Field(gt=0, description="Max concurrent subject allowed")

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # dev # todo: replace with env-based
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

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

def get_user_plan_or_404(plan_id: int, user_id: int, db: Session) -> models.Plan:
    db_plan = db.query(models.Plan).filter(
        models.Plan.id == plan_id,
        models.Plan.owner_id == user_id
    ).first()

    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    return db_plan


def get_subject_or_404(subject_id: int, plan_id: int, db: Session) -> models.Subject:
    db_subject = db.query(models.Subject).filter(
        models.Subject.id == subject_id,
        models.Subject.plan_id == plan_id
    ).first()

    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    return db_subject

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }

@app.post("/api/v1/generate-plan", status_code=HTTP_201_CREATED)
def generate_plan(payload: GraphInput,
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):

    logger.info(f"User ID {current_user.id} requested plan generation with max_concurrent={payload.max_concurrent}")

    subject_names = [s.name.strip() for s in payload.subjects]

    if len(set(subject_names)) != len(subject_names):
        logger.warning(f"Plan generation rejected for User ID {current_user.id}: Duplicate subject names detected.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject names must be unique within a single study plan."
        )

    try:
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
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject names must be unique within a single study plan."
        )

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

    try:
        result = graph.get_constrained_study_plan(payload.max_concurrent)
        logger.info(
            f"Successfully generated constrained study plan for User ID {current_user.id}. Total stages: {len(result)}")
        return result
    except ValueError as exception:
        if "Cycle detected" in str(exception):
            logger.error(f"Graph execution failed for User ID {current_user.id}: Cyclic dependency detected.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cycle detected in prerequisites. Cannot generate an infinite study plan."
            )

        raise exception


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

@app.post("/api/v1/plans", status_code=status.HTTP_201_CREATED)
def create_empty_plan(
        payload: PlanCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    new_plan = models.Plan(
        name = payload.name,
        max_concurrent = payload.max_concurrent,
        owner_id = current_user.id
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return {
        "id": new_plan.id,
        "name": new_plan.name,
        "max_concurrent": new_plan.max_concurrent
    }


@app.post("/api/v1/plans/{plan_id}/subjects", status_code=status.HTTP_201_CREATED)
def add_subject_to_plan(
        plan_id: int,
        payload: SingleSubjectCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    get_user_plan_or_404(plan_id, current_user.id, db)

    existing_subject = db.query(models.Subject).filter(
        models.Subject.plan_id == plan_id,
        models.Subject.name == payload.name
    ).first()

    if existing_subject:
        raise HTTPException(
            status_code=400,
            detail=f"Subject '{payload.name}' already exists in this plan."
        )

    dependent_db_subjects = []
    if payload.dependents:
        dependent_db_subjects = db.query(models.Subject).filter(
            models.Subject.plan_id == plan_id,
            models.Subject.name.in_(payload.dependents)
        ).all()

        unique_dependents = set(payload.dependents)

        if len(unique_dependents) != len(dependent_db_subjects):
            found_names = {str(sub.name) for sub in dependent_db_subjects}
            missing_names = unique_dependents - found_names

            raise HTTPException(
                status_code=400,
                detail=f"Cannot link dependents. Subject not found: {', '.join(missing_names)}"
            )

    new_subject = models.Subject(
        name=payload.name,
        field=payload.field,
        duration=payload.duration,
        plan_id=plan_id,
        classroom=payload.classroom
    )

    for dependent_subject in dependent_db_subjects:
        new_subject.dependent_subjects.append(dependent_subject)

    try:
        db.add(new_subject)
        db.commit()
        db.refresh(new_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error")

    return {
        "id": new_subject.id,
        "name": new_subject.name,
        "field": new_subject.field,
        "duration": new_subject.duration,
        "classroom": new_subject.classroom,
        "dependents": [str(dep.name) for dep in new_subject.dependent_subjects]
    }

@app.put("/api/v1/plans/{plan_id}/subjects/{subject_id}", status_code=status.HTTP_200_OK)
def update_subject(
        plan_id: int,
        subject_id: int,
        payload: SubjectUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
) :
    get_user_plan_or_404(plan_id, current_user.id, db)
    existing_subject = get_subject_or_404(subject_id, plan_id, db)

    if payload.name is not None and payload.name != existing_subject.name:
        existing_name = db.query(models.Subject).filter(
            models.Subject.plan_id == plan_id,
            models.Subject.name == payload.name
        ).first()

        if existing_name:
            raise HTTPException(status_code=400, detail=f"Subject '{payload.name}' already exists in this plan.")

    final_name = payload.name if payload.name is not None else existing_subject.name

    if payload.dependents is not None:
        if final_name in payload.dependents:
            raise HTTPException(status_code=400, detail="A subject cannot depend on itself.")


        unique_dependents = set(payload.dependents)
        if unique_dependents:
            dependent_db_subjects = db.query(models.Subject).filter(
                models.Subject.plan_id == plan_id,
                models.Subject.name.in_(payload.dependents)
            ).all()

            if len(unique_dependents) != len(dependent_db_subjects):
                found_names = {str(sub.name) for sub in dependent_db_subjects}
                missing_names = unique_dependents - found_names
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot link dependents. Subjects not found: {', '.join(missing_names)}"
                )

            existing_subject.dependent_subjects = dependent_db_subjects
        else:
            existing_subject.dependent_subjects = []

    existing_subject.name = final_name

    if payload.field is not None:
        existing_subject.field = payload.field
    if payload.duration is not None:
        existing_subject.duration = payload.duration
    if payload.classroom is not None:
        existing_subject.classroom = payload.classroom

    try:
        db.commit()
        db.refresh(existing_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error")

    return {
        "id": existing_subject.id,
        "name": existing_subject.name,
        "field": existing_subject.field,
        "duration": existing_subject.duration,
        "classroom": existing_subject.classroom,
        "dependents": [str(dep.name) for dep in existing_subject.dependent_subjects]
    }

@app.delete("/api/v1/plans/{plan_id}/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
        plan_id: int,
        subject_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    get_user_plan_or_404(plan_id, current_user.id, db)
    existing_subject = get_subject_or_404(subject_id, plan_id, db)

    if existing_subject.dependent_subjects:
        dependent_names = [str(dep.name) for dep in existing_subject.dependent_subjects]
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete subject '{existing_subject.name}'. The following subjects depend on it: {', '.join(dependent_names)}"
        )

    try:
        db.delete(existing_subject)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during deletion")

@app.get("/api/v1/plans/{plan_id}")
def get_plan(
        plan_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    db_plan = get_user_plan_or_404(plan_id, current_user.id, db)

    try:
        return reconstruct_and_calculate_plan(db_plan)

    except ValueError as exception:
        logger.error(f"Failed to reconstruct graph for plan ID {plan_id} (User ID {current_user.id}): {str(exception)}")

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Plan computation failed: {str(exception)}"
        )

@app.get("/api/v1/deadlines", response_model=List[DeadlineResponse])
def get_deadlines(
        plan_id: Optional[int] = None,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Deadline).filter(
        models.Deadline.owner_id == current_user.id
    )

    if plan_id is not None:
        query = query.filter(models.Deadline.plan_id == plan_id)

    deadlines = query.order_by(models.Deadline.due_date.asc()).all()

    return [
        {
            "id": deadline.id,
            "title": deadline.title,
            "type": deadline.type,
            "due_date": deadline.due_date,
            "classroom": deadline.classroom,
            "plan_id": deadline.plan_id
        }
        for deadline in deadlines
    ]

@app.post("/api/v1/deadlines", response_model=DeadlineResponse, status_code=status.HTTP_201_CREATED)
def create_deadline(
        payload: DeadlineCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if payload.plan_id is not None:
        get_user_plan_or_404(payload.plan_id, current_user.id, db)

    new_deadline = models.Deadline(
        title=payload.title,
        type=payload.type,
        due_date=payload.due_date,
        classroom=payload.classroom,
        plan_id=payload.plan_id,
        owner_id=current_user.id
    )

    db.add(new_deadline)
    db.commit()
    db.refresh(new_deadline)

    return {
        "id": new_deadline.id,
        "title": new_deadline.title,
        "type": new_deadline.type,
        "due_date": new_deadline.due_date,
        "classroom": new_deadline.classroom,
        "plan_id": new_deadline.plan_id
    }

@app.put("/api/v1/deadlines/{deadline_id}", response_model=DeadlineResponse, status_code=status.HTTP_200_OK)
def update_deadline(
        deadline_id: int,
        payload: DeadlineUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    existing_deadline = db.query(models.Deadline).filter(
        models.Deadline.id == deadline_id,
        models.Deadline.owner_id == current_user.id
    ).first()

    if not existing_deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")

    if payload.plan_id is not None:
        get_user_plan_or_404(payload.plan_id, current_user.id, db)
        existing_deadline.plan_id = payload.plan_id

    if payload.title is not None:
        existing_deadline.title = payload.title
    if payload.type is not None:
        existing_deadline.type = payload.type
    if payload.due_date is not None:
        existing_deadline.due_date = payload.due_date
    if payload.classroom is not None:
        existing_deadline.classroom = payload.classroom

    try:
        db.commit()
        db.refresh(existing_deadline)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during update")

    return {
        "id": existing_deadline.id,
        "title": existing_deadline.title,
        "type": existing_deadline.type,
        "due_date": existing_deadline.due_date,
        "classroom": existing_deadline.classroom,
        "plan_id": existing_deadline.plan_id
    }


@app.get("/api/v1/my-plans")
def get_my_plan(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user_plans = db.query(models.Plan).filter(models.Plan.owner_id == current_user.id).all()

    all_plans = []

    for single_plan in user_plans:
        try:
            calculated_schedule = reconstruct_and_calculate_plan(single_plan)

            single_plan_data = {
                "id": single_plan.id,
                "name": single_plan.name,
                "schedule": calculated_schedule
            }

            all_plans.append(single_plan_data)
        except ValueError as exception:
            logger.error(f"Skipping corrupted plan ID {single_plan.id} for User ID {current_user.id}: {str(exception)}")

            all_plans.append({
                "id": single_plan.id,
                "name": f"{single_plan.name} (Computation Error)",
                "schedule": [],
                "error": "Corrupted prerequisite structure"
            })

    return all_plans

@app.post("/api/v1/register", response_model=UserResponse, status_code=HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        logger.warning(f"Registration failed: Email {user.email} is already taken.")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user successfully registered with email: {new_user.email}")
    return new_user


@app.post("/api/v1/token", response_model=Token, status_code=HTTP_201_CREATED)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"sub": user.email}, expires_delta=refresh_token_expires
    )

    logger.info(f"User {user.email} logged in successfully. JWT Access Token issued.")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/api/v1/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "message": "Session verified",
        "user": current_user.email,
        "github_id": current_user.github_id
    }

@app.delete("/api/v1/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    plan = get_user_plan_or_404(plan_id, current_user.id, db)

    db.delete(plan)
    db.commit()

@app.post("/api/v1/refresh")
def refresh_acces_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        jwt_decode = jwt.decode(request.refresh_token, SECRET_KEY, [ALGORITHM])
        jwt_email = jwt_decode.get("sub")

        if not jwt_email:
            raise HTTPException(status_code=401, detail="Could not validate credentials")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
    current_user = db.query(models.User).filter(models.User.email == jwt_email).first()

    if not current_user :
        raise HTTPException(status_code=401, detail="User does not exists")
    else:
        new_access_token = create_access_token(
            data={"sub": current_user.email}
        )
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }