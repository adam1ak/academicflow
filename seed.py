import datetime
from database import SessionLocal, engine
import models
from security import get_password_hash

def seed_database():
    db = SessionLocal()

    try:
        # Zapewnia ze tabele istnieja
        models.Base.metadata.create_all(bind=engine)
        
        email = "test@example.com"
        password = "Password123!"

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            hashed_password = get_password_hash(password)
            user = models.User(email=email, hashed_password=hashed_password, is_active=True)
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created new user: {email}")
        else:
            print(f"User {email} already exists.")

        # Wyczyszczenie bazy dla tego usera
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

        # --- PLANY ---
        plan_cs = models.Plan(name="Computer Science BSc", max_concurrent=4, owner_id=user.id)
        plan_math = models.Plan(name="Math Minor", max_concurrent=3, owner_id=user.id)
        db.add_all([plan_cs, plan_math])
        db.commit()
        db.refresh(plan_cs)
        db.refresh(plan_math)

        # --- SUBJECTS DLA CS PLAN ---
        intro_cs = models.Subject(name="Intro to Computer Science", field="CS", duration=3, classroom="Lab 101", is_completed=True, plan_id=plan_cs.id)
        math_101 = models.Subject(name="Discrete Mathematics", field="Math", duration=4, classroom="Auditorium B", plan_id=plan_cs.id)
        data_struct = models.Subject(name="Data Structures", field="CS", duration=4, classroom="Lab 102", is_completed=True, plan_id=plan_cs.id)
        algo = models.Subject(name="Algorithms & Complexity", field="CS", duration=3, classroom="Room 205", plan_id=plan_cs.id)
        db_sys = models.Subject(name="Database Systems", field="CS", duration=3, classroom="Lab 105", plan_id=plan_cs.id)
        ml = models.Subject(name="Machine Learning", field="AI", duration=5, classroom="Lab 201", plan_id=plan_cs.id)
        soft_eng = models.Subject(name="Software Engineering", field="CS", duration=4, classroom="Room 304", is_completed=True, plan_id=plan_cs.id)

        db.add_all([intro_cs, math_101, data_struct, algo, db_sys, ml, soft_eng])
        db.commit()

        # Złożone Zależności (Tworzą fajny DAG)
        intro_cs.dependent_subjects.append(data_struct)         # Intro -> Data Struct
        math_101.dependent_subjects.append(data_struct)         # Math -> Data Struct
        data_struct.dependent_subjects.append(algo)             # Data Struct -> Algo
        data_struct.dependent_subjects.append(db_sys)           # Data Struct -> DB
        algo.dependent_subjects.append(ml)                      # Algo -> ML
        math_101.dependent_subjects.append(ml)                  # Math -> ML
        db_sys.dependent_subjects.append(soft_eng)              # DB -> Software Eng
        db.commit()

        # --- SUBJECTS DLA MATH PLAN ---
        calc1 = models.Subject(name="Calculus I", field="Math", duration=3, classroom="Room 204", is_completed=True, plan_id=plan_math.id)
        calc2 = models.Subject(name="Calculus II", field="Math", duration=4, is_completed=True, classroom="Room 204", plan_id=plan_math.id)
        linalg = models.Subject(name="Linear Algebra", field="Math", duration=3, classroom="Room 205", plan_id=plan_math.id)
        
        db.add_all([calc1, calc2, linalg])
        db.commit()
        calc1.dependent_subjects.append(calc2)
        calc1.dependent_subjects.append(linalg)
        db.commit()

        # --- DEADLINES ---
        today = datetime.date.today()
        deadlines = [
            # CS Plan
            models.Deadline(title="Data Structures Midterm", type="exam", due_date=today + datetime.timedelta(days=10), classroom="Auditorium A", plan_id=plan_cs.id, owner_id=user.id),
            models.Deadline(title="DB Normalization Homework", type="assignment", due_date=today + datetime.timedelta(days=4), classroom=None, plan_id=plan_cs.id, owner_id=user.id),
            models.Deadline(title="ML Neural Net Project", type="project", due_date=today + datetime.timedelta(days=25), classroom="Lab 201", plan_id=plan_cs.id, owner_id=user.id),
            models.Deadline(title="Agile Sprint Review", type="task", due_date=today + datetime.timedelta(days=14), classroom="Room 304", plan_id=plan_cs.id, owner_id=user.id),
            models.Deadline(title="Algorithms Final", type="exam", due_date=today + datetime.timedelta(days=60), classroom="Auditorium A", plan_id=plan_cs.id, owner_id=user.id),
            
            # Math Plan
            models.Deadline(title="Calculus I Final", type="exam", due_date=today + datetime.timedelta(days=45), classroom="Room 204", plan_id=plan_math.id, owner_id=user.id),
            models.Deadline(title="Matrix Ops Assignment", type="assignment", due_date=today + datetime.timedelta(days=8), classroom=None, plan_id=plan_math.id, owner_id=user.id),
            
            # Global
            models.Deadline(title="Register for next semester", type="task", due_date=today + datetime.timedelta(days=20), classroom=None, plan_id=None, owner_id=user.id),
        ]

        db.add_all(deadlines)
        db.commit()
        print("Seed script completed successfully! 10 Subjects, 2 Plans, 8 Deadlines added.")

    except Exception as e:
        db.rollback()
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()