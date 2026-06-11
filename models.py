from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, UniqueConstraint, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, UTC

from database import Base

subject_dependencies = Table(
    'subject_dependencies',
    Base.metadata,
    Column('prerequisite_id', Integer, ForeignKey('subjects.id'), primary_key=True),
    Column('target_id', Integer, ForeignKey('subjects.id'), primary_key=True),
)

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)
    max_concurrent = Column(Integer)

    owner = relationship("User", back_populates="plans")
    subjects = relationship("Subject", back_populates="plan")
    deadlines = relationship("Deadline", back_populates="plan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    field = Column(String)
    duration = Column(Integer)
    classroom = Column(String)
    is_completed = Column(Boolean, default=False)
    plan_id = Column(Integer, ForeignKey('plans.id', ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint('plan_id', 'name', name='uq_subject_plan_name'),
    )

    plan = relationship("Plan", back_populates="subjects")

    dependent_subjects = relationship(
        "Subject",
        secondary=subject_dependencies,
        primaryjoin="Subject.id == subject_dependencies.c.prerequisite_id",
        secondaryjoin="Subject.id == subject_dependencies.c.target_id",
        back_populates="prerequisites"
    )

    prerequisites = relationship(
        "Subject",
        secondary=subject_dependencies,
        primaryjoin="Subject.id == subject_dependencies.c.target_id",
        secondaryjoin="Subject.id == subject_dependencies.c.prerequisite_id",
        back_populates="dependent_subjects"
    )

    @property
    def computed_status(self) -> str:
        if self.is_completed:
            return "completed"
        if all(prereq.is_completed for prereq in self.prerequisites):
            return "ready"
        return "blocked"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    github_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)

    plans = relationship("Plan", back_populates="owner")
    deadlines = relationship("Deadline", back_populates="owner")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoke = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now(UTC), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")

class Deadline(Base):
    __tablename__ = "deadlines"

    id  = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String)
    type = Column(String)
    due_date = Column(Date)
    classroom = Column(String, nullable=True)

    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=True)

    owner = relationship("User", back_populates="deadlines")
    plan = relationship("Plan", back_populates="deadlines")