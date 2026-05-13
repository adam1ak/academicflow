from sqlalchemy import Column, Integer, String, ForeignKey, Table
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
    name = Column(String)
    max_concurrent = Column(Integer)

    subjects = relationship("Subject", back_populates="plan")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    field = Column(String)
    duration = Column(Integer)
    plan_id = Column(Integer, ForeignKey('plans.id'))

    plan = relationship("Plan", back_populates="subjects")

    dependent_subjects = relationship(
        "Subject",
        secondary=subject_dependencies,
        primaryjoin=id == subject_dependencies.c.prerequisite_id,
        secondaryjoin=id == subject_dependencies.c.target_id,
        backref="prerequisites"
    )

