from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import SessionLocal
import models
from security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

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

    if not current_user:
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
