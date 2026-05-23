from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship

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

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    field = Column(String)
    duration = Column(Integer)
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
        backref="prerequisites"
    )

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    github_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)

    plans = relationship("Plan", back_populates="owner")