import pytest
from core import Subject, CourseGraph

def test_graph_without_cycles():
    graph = CourseGraph()
    graph.add_subject(Subject("Math1", "Math", 2))
    graph.add_subject(Subject("Math2", "Math", 3))
    graph.add_dependent("Math1", "Math2")

    plan = graph.get_constrained_study_plan(max_concurrent=2)

    assert len(plan) == 2

    assert plan[0]["name"] == "Math1"
    assert plan[0]["start_time"] == 0
    assert plan[0]["end_time"] == 2

    assert plan[1]["name"] == "Math2"
    assert plan[1]["start_time"] == 2
    assert plan[1]["end_time"] == 5

def test_graph_with_cycle():
    graph = CourseGraph()
    graph.add_subject(Subject("A", "IT", 2))
    graph.add_subject(Subject("B", "IT", 3))

    graph.add_dependent("A", "B")
    graph.add_dependent("B", "A")

    with pytest.raises(ValueError, match="Cycle detected"):
        graph.get_constrained_study_plan(max_concurrent=2)

def test_max_concurrent_limits():
    graph = CourseGraph()

    graph.add_subject(Subject("A", "IT", 2))
    graph.add_subject(Subject("B", "IT", 2))
    graph.add_subject(Subject("C", "IT", 2))

    plan_seq = graph.get_constrained_study_plan(max_concurrent=1)
    max_end_time_seq = max(item["end_time"] for item in plan_seq)
    assert max_end_time_seq == 6

    plan_par = graph.get_constrained_study_plan(max_concurrent=3)
    max_end_time_par = max(item["end_time"] for item in plan_par)
    assert max_end_time_par == 2


def test_isolated_subjects():
    graph = CourseGraph()
    graph.add_subject(Subject("Physics", "Science", 4))
    graph.add_subject(Subject("History", "Humanities", 3))

    plan = graph.get_constrained_study_plan(max_concurrent=2)

    assert plan[0]["start_time"] == 0
    assert plan[1]["start_time"] == 0