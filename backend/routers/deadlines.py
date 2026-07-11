from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
from schemas import DeadlineCreate, DeadlineUpdate, DeadlineResponse
from dependencies import get_db, get_current_user, get_user_plan_or_404

router = APIRouter(prefix="/api/v1", tags=["deadlines"])

@router.get("/deadlines", response_model=List[DeadlineResponse])
def get_deadlines(
        plan_id: Optional[int] = None,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    from datetime import datetime, UTC, timedelta

    expiration_limit = datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=24)
    db.query(models.Deadline).filter(
        models.Deadline.owner_id == current_user.id,
        models.Deadline.due_date < expiration_limit
    ).delete(synchronize_session=False)
    db.commit()

    query = db.query(models.Deadline).filter(
        models.Deadline.owner_id == current_user.id
    )

    if plan_id is not None:
        query = query.filter(models.Deadline.plan_id == plan_id)

    deadlines = query.order_by(models.Deadline.due_date.asc()).all()

    return deadlines

@router.delete("/deadlines/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@router.post("/deadlines", response_model=DeadlineResponse, status_code=status.HTTP_201_CREATED)
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

    return new_deadline

@router.put("/deadlines/{deadline_id}", response_model=DeadlineResponse, status_code=status.HTTP_200_OK)
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

    return existing_deadline