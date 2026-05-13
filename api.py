from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models

from core import build_sample_graph, Subject, CourseGraph
from pydantic import BaseModel
from typing import List, Optional

class SubjectInput(BaseModel):
    name: str
    field: str
    duration: int
    dependents: List[str]

class GraphInput(BaseModel):
    max_concurrent: int
    subjects: List[SubjectInput]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # dev # todo: replace with env-based
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)
models.Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "AcademicFlow API is running"
    }

@app.get("/api/v1/study-plan")
def study_plan():
    graph = build_sample_graph()
    result = graph.get_constrained_study_plan(max_concurrent=2)
    return result

@app.post("/api/v1/generate-plan")
def generate_plan(payload: GraphInput):
    graph = CourseGraph()

    # nodes
    for subject in payload.subjects:
        sbj = Subject(subject.name, subject.field, subject.duration)
        graph.add_subject(sbj)

    # edges
    for subject in payload.subjects:
        for dependent in subject.dependents:
            graph.add_dependent(subject.name, dependent)

    result = graph.get_constrained_study_plan(payload.max_concurrent)
    return result