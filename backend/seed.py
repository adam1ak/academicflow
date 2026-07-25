import datetime
from database import SessionLocal, engine
import models
from security import get_password_hash

def seed_database():
    db = SessionLocal()

    try:
        # Standard test user credentials
        email = "test@example.com"
        password = "Password123!"

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            hashed_password = get_password_hash(password)
            user = models.User(email=email, hashed_password=hashed_password, is_active=True, name="John Doe")
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created new user: {email}")
        else:
            print(f"User {email} already exists.")

        # Clean existing data for this user
        db.query(models.Deadline).filter(models.Deadline.owner_id == user.id).delete()
        
        user_plans = db.query(models.Plan).filter(models.Plan.owner_id == user.id).all()
        plan_ids = [p.id for p in user_plans]

        if plan_ids:
            subjects = db.query(models.Subject).filter(models.Subject.plan_id.in_(plan_ids)).all()
            subject_ids = [s.id for s in subjects]
            if subject_ids:
                db.execute(models.subject_dependencies.delete().where(
                    (models.subject_dependencies.c.prerequisite_id.in_(subject_ids)) |
                    (models.subject_dependencies.c.target_id.in_(subject_ids))
                ))
            db.query(models.Subject).filter(models.Subject.plan_id.in_(plan_ids)).delete(synchronize_session=False)

        db.query(models.Plan).filter(models.Plan.owner_id == user.id).delete(synchronize_session=False)
        db.commit()
        print("Cleared existing plans and deadlines for the user.")

        today = datetime.date.today()

        # ==========================================
        # PLAN 1: Chaos & Conflict Semester (Triggers Rules 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15)
        # ==========================================
        plan_chaos = models.Plan(
            name="Chaos & Conflict Semester",
            max_concurrent=5,
            owner_id=user.id,
            semester="fall26",
            start_date=today,
            accent_color="purple"
        )
        db.add(plan_chaos)
        db.commit()
        db.refresh(plan_chaos)

        # Subjects for Chaos Plan (14 subjects -> 42 ECTS total to exceed 30 ECTS limit for Rule 13)
        s1 = models.Subject(name="Intro to Computer Science", field="CS", duration=3, classroom="Lab 101", plan_id=plan_chaos.id)
        s2 = models.Subject(name="Object-Oriented Programming", field="CS", duration=2, classroom="Lab 102", plan_id=plan_chaos.id)
        s3 = models.Subject(name="Data Structures", field="CS", duration=2, classroom="Lab 102", plan_id=plan_chaos.id)
        s4 = models.Subject(name="Discrete Mathematics", field="Math", duration=2, classroom="Auditorium B", plan_id=plan_chaos.id)
        s5 = models.Subject(name="Computer Systems", field="CS", duration=2, classroom="Room 205", plan_id=plan_chaos.id)
        s6 = models.Subject(name="Web Development", field="CS", duration=2, classroom="Room 304", plan_id=plan_chaos.id)
        s7 = models.Subject(name="Design Patterns", field="CS", duration=2, classroom="Lab 105", plan_id=plan_chaos.id)
        s8 = models.Subject(name="Formal Languages", field="CS", duration=2, classroom="Room 205", plan_id=plan_chaos.id)
        s9 = models.Subject(name="Operating Systems", field="CS", duration=2, classroom="Lab 105", plan_id=plan_chaos.id)
        
        chain1 = models.Subject(name="Mathematics Foundation", field="Math", duration=1, classroom="Room 204", plan_id=plan_chaos.id)
        chain2 = models.Subject(name="Calculus I", field="Math", duration=1, classroom="Room 204", plan_id=plan_chaos.id)
        chain3 = models.Subject(name="Calculus II", field="Math", duration=1, classroom="Room 204", plan_id=plan_chaos.id)
        chain4 = models.Subject(name="Differential Equations", field="Math", duration=1, classroom="Room 204", plan_id=plan_chaos.id)
        chain5 = models.Subject(name="Mathematical Modeling", field="Math", duration=1, classroom="Room 204", plan_id=plan_chaos.id)

        db.add_all([s1, s2, s3, s4, s5, s6, s7, s8, s9, chain1, chain2, chain3, chain4, chain5])
        db.commit()

        # Establish dependencies to create Bottleneck (Rule 8), Chain (Rule 10), and Foundation (Rule 11)
        # s1 directly blocks 4 courses (Rule 11) and transitively blocks 8 (Rule 8)
        s1.dependent_subjects.append(s2)
        s1.dependent_subjects.append(s3)
        s1.dependent_subjects.append(s4)
        s1.dependent_subjects.append(s5)
        
        s2.dependent_subjects.append(s6)
        s3.dependent_subjects.append(s7)
        s4.dependent_subjects.append(s8)
        s5.dependent_subjects.append(s9)

        # 5-step linear chain (Rule 10)
        chain1.dependent_subjects.append(chain2)
        chain2.dependent_subjects.append(chain3)
        chain3.dependent_subjects.append(chain4)
        chain4.dependent_subjects.append(chain5)
        db.commit()

        # Helper to get next Saturday or Sunday dynamically
        days_to_saturday = 5 - today.weekday()
        if days_to_saturday <= 0:
            days_to_saturday += 7
        weekend_date = today + datetime.timedelta(days=days_to_saturday)

        # Deadlines for Chaos Plan (Rules 1, 2, 3, 4, 5, 6, 7)
        deadlines_chaos = [
            # Rule 1 & Rule 4: Three exams in 5 days, closest is in 2 days (Exam Imminent & Exam Approaching)
            models.Deadline(
                title="Intro CS Midterm Exam",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=2), datetime.time(9, 0)),
                classroom="Auditorium A",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Discrete Maths Quiz",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=3), datetime.time(11, 0)),
                classroom="Auditorium B",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Calculus I Test",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=4), datetime.time(14, 0)),
                classroom="Room 204",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            
            # Rule 2: Unfeasible Day (3 deadlines on the same day)
            models.Deadline(
                title="Object-Oriented Programming Assignment",
                type="assignment",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=5), datetime.time(23, 59)),
                classroom="Lab 102",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Data Structures Lab Report",
                type="assignment",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=5), datetime.time(23, 59)),
                classroom="Lab 102",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Computer Systems Project Proposal",
                type="project",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=5), datetime.time(23, 59)),
                classroom="Room 205",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),

            # Rule 3: Exam Hourly Collision (2 exams on the same day overlapping time)
            models.Deadline(
                title="Operating Systems Theoretical Exam",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=8), datetime.time(10, 0)),
                classroom="Lab 105",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Design Patterns Practical Exam",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=8), datetime.time(10, 30)),
                classroom="Lab 105",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),

            # Rule 5: Heavy Week (4 deadlines scheduled in Week 3 of the semester)
            models.Deadline(
                title="Formal Languages Exercise 1",
                type="assignment",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=16), datetime.time(12, 0)),
                classroom="Room 205",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Formal Languages Exercise 2",
                type="assignment",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=17), datetime.time(12, 0)),
                classroom="Room 205",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Web Development Mockup Check",
                type="task",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=18), datetime.time(15, 0)),
                classroom="Room 304",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Calculus II Midterm Exam",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=19), datetime.time(10, 0)),
                classroom="Room 204",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),

            # Rule 6: No Study Buffer (Project due exactly 1 day before an exam)
            models.Deadline(
                title="Software Project Alpha Release",
                type="project",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=9), datetime.time(23, 59)),
                classroom="Room 304",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Compiler Construction Exam",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=10), datetime.time(9, 0)),
                classroom="Room 205",
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),

            # Rule 7: Weekend Deadline (Task due on a Saturday or Sunday)
            models.Deadline(
                title="Math Review Homework",
                type="assignment",
                due_date=datetime.datetime.combine(weekend_date, datetime.time(23, 59)),
                classroom=None,
                plan_id=plan_chaos.id,
                owner_id=user.id
            ),
        ]
        db.add_all(deadlines_chaos)
        db.commit()


        # ==========================================
        # PLAN 2: Deadlock Semester (Triggers Rule 9)
        # ==========================================
        plan_deadlock = models.Plan(
            name="Deadlock Semester",
            max_concurrent=3,
            owner_id=user.id,
            semester="spr26",
            start_date=today,
            accent_color="red"
        )
        db.add(plan_deadlock)
        db.commit()
        db.refresh(plan_deadlock)

        # Two subjects locked in a prerequisite cycle
        d1 = models.Subject(name="Advanced Database Systems", field="CS", duration=3, classroom="Lab 105", plan_id=plan_deadlock.id)
        d2 = models.Subject(name="Distributed Databases", field="CS", duration=3, classroom="Lab 105", plan_id=plan_deadlock.id)
        db.add_all([d1, d2])
        db.commit()

        d1.dependent_subjects.append(d2)
        d2.dependent_subjects.append(d1)
        db.commit()


        # ==========================================
        # PLAN 3: All Clear Semester (Triggers Rule 16)
        # ==========================================
        plan_clear = models.Plan(
            name="All Clear Semester",
            max_concurrent=3,
            owner_id=user.id,
            semester="spr26",
            start_date=today,
            accent_color="blue"
        )
        db.add(plan_clear)
        db.commit()
        db.refresh(plan_clear)

        # Clean plan: prerequisite is already completed
        ac1 = models.Subject(name="English Language I", field="Lang", duration=3, classroom="Room 101", is_completed=True, plan_id=plan_clear.id)
        ac2 = models.Subject(name="English Language II", field="Lang", duration=3, classroom="Room 101", is_completed=False, plan_id=plan_clear.id)
        db.add_all([ac1, ac2])
        db.commit()

        ac1.dependent_subjects.append(ac2)
        db.commit()

        # Add single non-conflicting deadline far in the future
        deadline_clear = models.Deadline(
            title="English II Vocabulary Test",
            type="assignment",
            due_date=datetime.datetime.combine(today + datetime.timedelta(days=10), datetime.time(12, 0)),
            classroom="Room 101",
            plan_id=plan_clear.id,
            owner_id=user.id
        )
        db.add(deadline_clear)
        db.commit()

        print("Seed script completed successfully! Created 3 Plans with distinct profiles to cover all 16 alert rules.")

    except Exception as e:
        db.rollback()
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()