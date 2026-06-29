from dotenv import load_dotenv
from starlette.status import HTTP_201_CREATED

load_dotenv()

from jose import jwt, JWTError

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import models

from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from core import Subject, CourseGraph
from typing import List, Optional

from security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS,
    hash_refresh_token
)

from datetime import timedelta, datetime, timezone


import logging
logger = logging.getLogger("academicflow.api")

from schemas import (
    SingleSubjectCreate, SubjectUpdate, SubjectResponse, DeadlineCreate, DeadlineUpdate,
    DeadlineResponse, UserCreate, UserResponse, Token, RefreshTokenRequest,
    GraphInput, PlanCreate, PlanResponse, PlanUpdate
)

from dependencies import get_db, get_current_user, get_user_plan_or_404, get_subject_or_404

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # dev # todo: replace with env-based
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)



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

@app.post("/api/v1/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_empty_plan(
        payload: PlanCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    new_plan = models.Plan(
        name = payload.name,
        max_concurrent = payload.max_concurrent,
        owner_id = current_user.id,
        semester = payload.semester,
        start_date = payload.start_date,
        accent_color = payload.accent_color
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


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

@app.get("/api/v1/plans/{plan_id}/subjects", response_model=List[SubjectResponse])
def get_plan_subjects(
        plan_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    db_plan = get_user_plan_or_404(plan_id, current_user.id, db)

    return [
        {
            "id": subject.id,
            "name": subject.name,
            "field": subject.field,
            "duration": subject.duration,
            "classroom": subject.classroom,
            "is_completed": subject.is_completed,
            "status": subject.computed_status,
            "dependents": [str(dep.name) for dep in subject.dependent_subjects]
        }
        for subject in db_plan.subjects
    ]

@app.patch("/api/v1/plans/{plan_id}/subjects/{subject_id}/complete", response_model=SubjectResponse)
def toggle_subject_completion(
        plan_id: int,
        subject_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    get_user_plan_or_404(plan_id, current_user.id, db)
    db_subject = get_subject_or_404(subject_id, plan_id, db)
    db_subject.is_completed = not db_subject.is_completed

    try:
        db.commit()
        db.refresh(db_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during completion toggle")

    return {
        "id": db_subject.id,
        "name": db_subject.name,
        "field": db_subject.field,
        "duration": db_subject.duration,
        "classroom": db_subject.classroom,
        "is_completed": db_subject.is_completed,
        "status": db_subject.computed_status,
        "dependents": [str(dep.name) for dep in db_subject.dependent_subjects]
    }

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

@app.patch("/api/v1/plans/{plan_id}", status_code=status.HTTP_200_OK)
def update_plan(
        plan_id: int,
        payload: PlanUpdate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    db_plan = get_user_plan_or_404(plan_id, current_user.id, db)

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    for key, value in update_data.items():
        setattr(db_plan, key, value)

    try:
        db.commit()
        db.refresh(db_plan)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during patch")

    try:
        calculated_schedule = reconstruct_and_calculate_plan(db_plan)
    except ValueError as exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Recalculation failed after patch: {str(exception)}"
        )

    return {
        "id": db_plan.id,
        "name": db_plan.name,
        "max_concurrent": db_plan.max_concurrent,
        "semester": db_plan.semester,
        "start_date": db_plan.start_date.isoformat() if db_plan.start_date else None,
        "accent_color": db_plan.accent_color,
        "schedule": calculated_schedule
    }

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

@app.delete("/api/v1/deadlines/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deadline(
        deadline_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    deadline = db.query(models.Deadline).filter(
        models.Deadline.id == deadline_id,
        models.Deadline.owner_id == current_user.id
    ).first()

    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")

    db.delete(deadline)
    db.commit()

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
def get_my_plan(db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user),
                skip: int = 0,
                limit: int = 10):
    user_plans = (
        db.query(models.Plan)
        .options(joinedload(models.Plan.subjects).
                 selectinload(models.Subject.dependent_subjects))
        .filter(models.Plan.owner_id == int(current_user.id))
        .offset(skip)
        .limit(limit)
        .all()
    )

    all_plans = []

    for single_plan in user_plans:
        try:
            calculated_schedule = reconstruct_and_calculate_plan(single_plan)

            single_plan_data = {
                "id": single_plan.id,
                "name": single_plan.name,
                "semester": single_plan.semester,
                "start_date": single_plan.start_date.isoformat() if single_plan.start_date else None,
                "accent_color": single_plan.accent_color,
                "schedule": calculated_schedule
            }

            all_plans.append(single_plan_data)
        except ValueError as exception:
            logger.error(f"Skipping corrupted plan ID {single_plan.id} for User ID {current_user.id}: {str(exception)}")

            all_plans.append({
                "id": single_plan.id,
                "name": f"{single_plan.name} (Computation Error)",
                "semester": single_plan.semester,
                "start_date": single_plan.start_date.isoformat() if single_plan.start_date else None,
                "accent_color": single_plan.accent_color,
                "schedule": [],
                "error": "Corrupted prerequisite structure"
            })

    return all_plans

@app.post("/api/v1/register", response_model=UserResponse, status_code=HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_user(user: UserCreate, request: Request, db: Session = Depends(get_db)):
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

@app.post("/api/v1/logout", status_code=status.HTTP_200_OK)
def logout(request: RefreshTokenRequest,
           db: Session = Depends(get_db)):
    hashed_token = hash_refresh_token(request.refresh_token)
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token_hash == hashed_token).first()

    if db_token:
        db_token.revoke = True
        db.commit()
        logger.info(f"User session successfully revoked. Token blacklisted.")

    return {"message": "Successfully logged out"}

@app.post("/api/v1/token", response_model=Token, status_code=HTTP_201_CREATED)
@limiter.limit("5/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
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

    hashed_token = hash_refresh_token(refresh_token)
    expire_time = (datetime.now(timezone.utc) + refresh_token_expires).replace(tzinfo=None)

    db_refresh_token = models.RefreshToken(
        user_id=int(user.id),
        token_hash=hashed_token,
        expires_at=expire_time,
        revoke=False
    )
    db.add(db_refresh_token)
    db.commit()

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

    hashed_token = hash_refresh_token(request.refresh_token)
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == hashed_token,
        models.RefreshToken.user_id == int(current_user.id)
    ).first()

    current_time_naive = datetime.now(timezone.utc).replace(tzinfo=None)

    if not db_token or db_token.revoke or db_token.expires_at < current_time_naive:  #
        raise HTTPException(status_code=401, detail="Refresh token is invalid, revoked, or expired")

    new_access_token = create_access_token(
        data={"sub": current_user.email}
    )
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }