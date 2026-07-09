import re
from datetime import date
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator

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

class SubjectResponse(BaseModel):
    id: int
    name: str
    field: str
    duration: int
    classroom: Optional[str]
    is_completed: bool
    status: Literal["completed", "ready", "blocked"]
    dependents: List[str]

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
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Optional full name or display name")

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
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

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
    semester: str = Field(min_length=1, description="Semester identity (e.g., fall26)")
    start_date: date = Field(description="Plan baseline start date")
    accent_color: str = Field(min_length=1, description="Accent color theme configuration")

class PlanResponse(BaseModel):
    id: int
    name: str
    max_concurrent: int
    semester: str
    start_date: date
    accent_color: str

    class Config:
        from_attributes = True

class PlanUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Optional new name")
    max_concurrent: Optional[int] = Field(default=None, gt=0, le=10, description="Optional new concurrency limit")
    semester: Optional[str] = Field(default=None, description="Semester identity (e.g., fall26)")
    start_date: Optional[date] = Field(default=None, description="Plan baseline start date")
    accent_color: Optional[str] = Field(default=None, description="Accent color theme configuration")
