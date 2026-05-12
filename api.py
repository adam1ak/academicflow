from fastapi import FastAPI
from core import build_sample_graph

app = FastAPI()

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