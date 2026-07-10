import logging
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, model_validator

import models
from schemas import PlanCreate, PlanResponse, PlanUpdate, GraphInput
from dependencies import get_db, get_current_user, get_user_plan_or_404
from core import Subject, CourseGraph

logger = logging.getLogger("academicflow.plans")
router = APIRouter(prefix="/api/v1", tags=["plans"])

class ScheduleItem(BaseModel):
    name: str
    start_time: int
    end_time: int
    model_config = {"from_attributes": True}

class PlanWithScheduleResponse(BaseModel):
    id: int
    name: str
    max_concurrent: int
    semester: Optional[str] = None
    start_date: Optional[date] = None
    accent_color: Optional[str] = None
    schedule: List[ScheduleItem] = []
    error: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def build_schedule_from_orm(cls, data: any) -> any:
        if hasattr(data, "id"):
            try:
                calculated_schedule = reconstruct_and_calculate_plan(data)
                return {
                    "id": data.id,
                    "name": data.name,
                    "max_concurrent": data.max_concurrent,
                    "semester": data.semester,
                    "start_date": data.start_date,
                    "accent_color": data.accent_color,
                    "schedule": calculated_schedule,
                    "error": None
                }
            except ValueError as exc:
                logger.error(f"Computation failed for plan id: {data.id}: {str(exc)}")
                return {
                    "id": data.id,
                    "name": f"{data.name} (Computation Error)",
                    "max_concurrent": data.max_concurrent if data.max_concurrent else 1,
                    "semester": data.semester,
                    "start_date": data.start_date,
                    "accent_color": data.accent_color,
                    "schedule": [],
                    "error": "Corrupted prerequisite structure"
                }
        return data

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

@router.post("/generate-plan", response_model=List[ScheduleItem], status_code=status.HTTP_201_CREATED)
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

@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
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

@router.get("/plans/{plan_id}", response_model=List[ScheduleItem])
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

@router.patch("/plans/{plan_id}", response_model=PlanWithScheduleResponse, status_code=status.HTTP_200_OK)
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
        reconstruct_and_calculate_plan(db_plan)
    except ValueError as exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Recalculation failed after patch: {str(exception)}"
        )

    return db_plan

@router.get("/my-plans", response_model=List[PlanWithScheduleResponse])
def get_my_plan(db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user),
                skip: int = 0,
                limit: int = 10):
    user_plans = (
        db.query(models.Plan)
        .options(joinedload(models.Plan.subjects))
        .filter(models.Plan.owner_id == int(current_user.id))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return user_plans

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    plan = get_user_plan_or_404(plan_id, current_user.id, db)

    db.delete(plan)
    db.commit()
