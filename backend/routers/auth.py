import logging
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

import models
from schemas import UserCreate, UserResponse, Token, RefreshTokenRequest
from dependencies import get_db, get_current_user
from security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS,
    hash_refresh_token
)
from limiter import limiter

logger = logging.getLogger("academicflow.auth")
router = APIRouter(prefix="/api/v1", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_user(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        logger.warning(f"Registration failed: Email {user.email} is already taken.")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name or ""
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user successfully registered with email: {new_user.email}")
    return new_user

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    hashed_token = hash_refresh_token(request.refresh_token)
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token_hash == hashed_token).first()

    if db_token:
        db_token.revoke = True
        db.commit()
        logger.info(f"User session successfully revoked. Token blacklisted.")

    return {"message": "Successfully logged out"}

@router.post("/token", response_model=Token, status_code=status.HTTP_201_CREATED)
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

@router.get("/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "message": "Session verified",
        "user": current_user.email,
        "github_id": current_user.github_id,
        "name": current_user.name
    }

@router.post("/refresh")
def refresh_acces_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        jwt_decode = jwt.decode(request.refresh_token, SECRET_KEY, [ALGORITHM])
        jwt_email = jwt_decode.get("sub")

        if not jwt_email:
            raise HTTPException(status_code=401, detail="Could not validate credentials")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
    current_user = db.query(models.User).filter(models.User.email == jwt_email).first()

    if not current_user:
        raise HTTPException(status_code=401, detail="User does not exists")

    hashed_token = hash_refresh_token(request.refresh_token)
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == hashed_token,
        models.RefreshToken.user_id == int(current_user.id)
    ).first()

    current_time_naive = datetime.now(timezone.utc).replace(tzinfo=None)

    if not db_token or db_token.revoke or db_token.expires_at < current_time_naive:
        raise HTTPException(status_code=401, detail="Refresh token is invalid, revoked, or expired")

    new_access_token = create_access_token(
        data={"sub": current_user.email}
    )
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
