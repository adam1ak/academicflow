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