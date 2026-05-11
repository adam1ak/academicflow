from collections import deque

class Subject:
    def __init__(self, name, field, duration, level = None):
        self.name = name
        self.field = field
        self.level = level
        self.duration = duration
        self.in_degree = 0
        self.dependent_subjects = set()

    def add_dependent(self, next_subject):
        self.dependent_subjects.add(next_subject)
        next_subject.in_degree += 1

class CourseGraph:
    def __init__(self):
        self.subjects = {}

    def add_subject(self, subject_obj):
        if subject_obj.name in self.subjects:
            raise ValueError(f"Subject : {subject_obj.name} already exists in graph.")

        self.subjects[subject_obj.name] = subject_obj

    def add_dependent(self, prereq_name, target_name):
        if prereq_name not in self.subjects:
            raise ValueError(f"Subject : {prereq_name} does not exist in graph.")
        if target_name not in self.subjects:
            raise ValueError(f"Subject : {target_name} does not exist in graph.")

        prereq = self.subjects[prereq_name]
        target = self.subjects[target_name]

        prereq.add_dependent(target)

    def get_study_plan(self):
        in_degree_map = {}
        queue = deque()
        result = []

        for subject in self.subjects.values():
            in_degree_map[subject.name] = subject.in_degree

        for name, deg in in_degree_map.items():
            if deg == 0:
                queue.append(name)

        while queue:
            current_name = queue.popleft()
            result.append(current_name)

            current_sbj = self.subjects[current_name]

            for dependent in current_sbj.dependent_subjects:
                in_degree_map[dependent.name] -= 1

                if in_degree_map[dependent.name] == 0:
                    queue.append(dependent.name)

        if len(result) != len(self.subjects):
            raise ValueError("Cycle detected in prerequisites")

        return result


def main():
    graph = CourseGraph()

    calc1 = Subject("Calculus 1", "math", 2)
    calc2 = Subject("Calculus 2", "math", 3)
    calc3 = Subject("Calculus 3", "math", 5)

    prog_c = Subject("Basics of Language C", "programming", 2)

    english1 = Subject("English Language 1", "language", 3)
    english2 = Subject("English Language 2", "language", 5)

    graph.add_subject(calc1)
    graph.add_subject(calc2)
    graph.add_subject(calc3)
    graph.add_subject(prog_c)
    graph.add_subject(english1)
    graph.add_subject(english2)

    graph.add_dependent(calc1.name, calc2.name)
    graph.add_dependent(calc2.name, calc3.name)
    graph.add_dependent(calc1.name, calc3.name)

    graph.add_dependent(english1.name, english2.name)

    study_plan = graph.get_study_plan()

    for s_name in study_plan:
        print(s_name)


if __name__ == "__main__":
    main()