import datetime
from database import SessionLocal, engine
import models
from security import get_password_hash

def seed_database():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        email = "test@example.com"
        password = "Password123!"

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            hashed_password = get_password_hash(password)
            user = models.User(email=email, hashed_password=hashed_password, is_active=True, name="John Doe")
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.hashed_password = get_password_hash(password)
            db.commit()

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

        today = datetime.date.today()

        plan = models.Plan(
            name="Computer Science B.Sc.",
            max_concurrent=3,
            owner_id=user.id,
            semester="fall26",
            start_date=today - datetime.timedelta(days=7),
            accent_color="blue"
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        s1 = models.Subject(
            name="Intro to Programming",
            field="CS",
            duration=3,
            classroom="Lab 101",
            is_completed=True,
            plan_id=plan.id
        )
        s2 = models.Subject(
            name="Data Structures",
            field="CS",
            duration=4,
            classroom="Lab 102",
            is_completed=False,
            plan_id=plan.id
        )
        s3 = models.Subject(
            name="Database Systems",
            field="CS",
            duration=3,
            classroom="Room 204",
            is_completed=False,
            plan_id=plan.id
        )
        s4 = models.Subject(
            name="Algorithms & Complexity",
            field="CS",
            duration=3,
            classroom="Auditorium A",
            is_completed=False,
            plan_id=plan.id
        )
        s5 = models.Subject(
            name="Advanced Databases",
            field="CS",
            duration=3,
            classroom="Lab 105",
            is_completed=False,
            plan_id=plan.id
        )
        s6 = models.Subject(
            name="Operating Systems",
            field="CS",
            duration=3,
            classroom="Lab 103",
            is_completed=False,
            plan_id=plan.id
        )

        db.add_all([s1, s2, s3, s4, s5, s6])
        db.commit()

        s1.dependent_subjects.append(s2)
        s2.dependent_subjects.append(s4)
        s4.dependent_subjects.append(s6)
        s3.dependent_subjects.append(s5)
        db.commit()

        deadlines = [
            models.Deadline(
                title="Git & Repo Setup",
                type="task",
                due_date=datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(18, 0)),
                classroom="Lab 102",
                plan_id=plan.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Trees & Graphs Assignment",
                type="assignment",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=6), datetime.time(23, 59)),
                classroom="Lab 102",
                plan_id=plan.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Data Structures Midterm",
                type="exam",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=12), datetime.time(10, 0)),
                classroom="Auditorium A",
                plan_id=plan.id,
                owner_id=user.id
            ),
            models.Deadline(
                title="Relational Schema Project",
                type="project",
                due_date=datetime.datetime.combine(today + datetime.timedelta(days=22), datetime.time(20, 0)),
                classroom="Room 204",
                plan_id=plan.id,
                owner_id=user.id
            ),
        ]
        db.add_all(deadlines)
        db.commit()

        print("Database seeded successfully with clean demo profile.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
