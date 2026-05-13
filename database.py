import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# database URL postgresql://user:password@host:port/database_name
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:secret@localhost:5432/examflow"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()