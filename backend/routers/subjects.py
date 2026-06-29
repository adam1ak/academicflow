from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
from schemas import SingleSubjectCreate, SubjectUpdate, SubjectResponse
from dependencies import get_db, get_current_user, get_user_plan_or_404, get_subject_or_404

router = APIRouter(prefix="/api/v1", tags=["subjects"])

@router.post("/plans/{plan_id}/subjects", status_code=status.HTTP_201_CREATED)
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

@router.put("/plans/{plan_id}/subjects/{subject_id}", status_code=status.HTTP_200_OK)
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
