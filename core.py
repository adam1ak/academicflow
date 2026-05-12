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
        earliest_starts = {}

        for subject in self.subjects.values():
            in_degree_map[subject.name] = subject.in_degree
            earliest_starts[subject.name] = 0

        for name, deg in in_degree_map.items():
            if deg == 0:
                queue.append(name)

        while queue:
            current_name = queue.popleft()

            current_sbj = self.subjects[current_name]
            current_endtime = earliest_starts[current_name] + current_sbj.duration

            for dependent in current_sbj.dependent_subjects:
                in_degree_map[dependent.name] -= 1
                earliest_starts[dependent.name] = max(
                    earliest_starts[dependent.name],
                    current_endtime
                )

                if in_degree_map[dependent.name] == 0:
                    queue.append(dependent.name)

            result.append({
                "name": current_name,
                "start_time": earliest_starts[current_name],
                "end_time": current_endtime
            })

        if len(result) != len(self.subjects):
            raise ValueError("Cycle detected in prerequisites")

        return result

    def get_constrained_study_plan(self, max_concurrent: int):
        current_time = 0

        in_degree_map = {}
        in_progress = []
        completed = []
        available = deque()

        for subject in self.subjects.values():
            in_degree_map[subject.name] = subject.in_degree

            if in_degree_map[subject.name] == 0:
                available.append(subject.name)

        while available or in_progress:
            finished_now = []
            for progress_subject in in_progress:
                if progress_subject["end_time"] == current_time:
                    completed.append({
                        "name": progress_subject["name"],
                        "start_time": progress_subject["start_time"],
                        "end_time": progress_subject["end_time"]
                    })

                    finished_now.append(progress_subject)

            for finished_subject_now in finished_now:
                in_progress.remove(finished_subject_now)

                subject_object = self.subjects[finished_subject_now["name"]]
                for dependent in subject_object.dependent_subjects:
                    in_degree_map[dependent.name] -= 1

                    if in_degree_map[dependent.name] == 0:
                        available.append(dependent.name)

            while len(in_progress) < max_concurrent and available:
                available_name = available.popleft()
                available_object = self.subjects[available_name]
                available_end = current_time + available_object.duration

                in_progress.append({
                    "name": available_name,
                    "start_time": current_time,
                    "end_time": available_end
                })

            if in_progress:
                current_time = min(progress_subject["end_time"]
                                   for progress_subject in in_progress)
            else:
                break


        if len(completed) != len(self.subjects):
            raise ValueError("Cycle detected in prerequisites")

        return completed

def build_sample_graph():
    graph = CourseGraph()

    calc1 = Subject("Calculus 1", "math", 2)
    calc2 = Subject("Calculus 2", "math", 3)
    calc3 = Subject("Calculus 3", "math", 5)

    prog_c = Subject("Basics of Language C", "programming", 2)

    english1 = Subject("English Language 1", "language", 3)
    english2 = Subject("English Language 2", "language", 5)

    for subject in [calc1, calc2, calc3, prog_c, english1, english2]:
        graph.add_subject(subject)

    graph.add_dependent(calc1.name, calc2.name)
    graph.add_dependent(calc2.name, calc3.name)
    graph.add_dependent(calc1.name, calc3.name)

    graph.add_dependent(english1.name, english2.name)

    return graph

def main():
    graph = build_sample_graph()

    print("\n=== UNCONSTRAINED SCHEDULE ===")
    print(f"{'NAME':30} {'START':>5} {'END':>5}")
    for item in graph.get_study_plan():
        print(f"{item['name']:30} {item['start_time']:5} {item['end_time']:5}")

    print("\n=== CONSTRAINED SCHEDULE ===")
    print(f"{'NAME':30} {'START':>5} {'END':>5}")
    for item in graph.get_constrained_study_plan(max_concurrent=2):
        print(f"{item['name']:30} {item['start_time']:5} {item['end_time']:5}")


if __name__ == "__main__":
    main()