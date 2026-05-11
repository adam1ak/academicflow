class Subject:
    def __init__(self, name, field, level = None):
        self.name = name
        self.field = field
        self.level = level
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