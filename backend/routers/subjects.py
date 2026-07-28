from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
from core import Subject as GraphSubject, CourseGraph
from schemas import SingleSubjectCreate, SubjectUpdate, SubjectResponse
from dependencies import get_db, get_current_user, get_user_plan_or_404, get_subject_or_404

from redis_client import safe_delete

router = APIRouter(prefix="/api/v1", tags=["subjects"])

def invalidate_plan_cache(plan_id: int) -> None:
    safe_delete(f"plan:{plan_id}:calculated")

@router.post("/plans/{plan_id}/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
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

    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if db_plan:
        try:
            check_graph = CourseGraph()

            for sub in db_plan.subjects:
                check_graph.add_subject(GraphSubject(sub.name, sub.field, sub.duration))
            check_graph.add_subject(GraphSubject(new_subject.name, new_subject.field, new_subject.duration))

            for sub in db_plan.subjects:
                for dep in sub.dependent_subjects:
                    check_graph.add_dependent(sub.name, dep.name)
            for dep in new_subject.dependent_subjects:
                check_graph.add_dependent(new_subject.name, dep.name)

            check_graph.get_constrained_study_plan(db_plan.max_concurrent)

        except ValueError as ex:
            if "Cycle detected" in str(ex):
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cycle detected in prerequisites. This modification would introduce a circular deadlock."
                )
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ex))

    try:
        db.add(new_subject)
        db.commit()
        db.refresh(new_subject)

        invalidate_plan_cache(plan_id)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error")

    return new_subject

@router.put("/plans/{plan_id}/subjects/{subject_id}", response_model=SubjectResponse, status_code=status.HTTP_200_OK)
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

    db_plan = existing_subject.plan
    if db_plan:
        try:
            check_graph = CourseGraph()

            for sub in db_plan.subjects:
                check_graph.add_subject(GraphSubject(sub.name, sub.field, sub.duration))

            for sub in db_plan.subjects:
                for dep in sub.dependent_subjects:
                    check_graph.add_dependent(sub.name, dep.name)

            check_graph.get_constrained_study_plan(db_plan.max_concurrent)

        except ValueError as ex:
            if "Cycle detected" in str(ex):
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cycle detected in prerequisites. This modification would introduce a circular deadlock."
                )
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ex))

    try:
        db.commit()
        db.refresh(existing_subject)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error")

    return existing_subject

@router.delete("/plans/{plan_id}/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
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

        invalidate_plan_cache(plan_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during deletion")

@router.get("/plans/{plan_id}/subjects", response_model=List[SubjectResponse])
def get_plan_subjects(
        plan_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    db_plan = get_user_plan_or_404(plan_id, current_user.id, db)

    return db_plan.subjects

@router.patch("/plans/{plan_id}/subjects/{subject_id}/complete", response_model=SubjectResponse)
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

    return db_subject