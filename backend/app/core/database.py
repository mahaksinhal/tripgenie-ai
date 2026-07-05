from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create database engine
is_sqlite = False
try:
    # Attempt to create and connect to PostgreSQL
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    # Test connection immediately
    with engine.connect() as conn:
        pass
    print("TripGenie Backend: Connected to PostgreSQL database successfully.")
except Exception as e:
    print(f"TripGenie Backend: PostgreSQL connection failed. Error: {e}. Falling back to local SQLite database...")
    is_sqlite = True
    engine = create_engine(
        "sqlite:///tripgenie.db",
        connect_args={"check_same_thread": False}
    )

# Session factory for handling requests
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model class
Base = declarative_base()

_tables_created = False

def get_db() -> Generator:
    """
    FastAPI Dependency to get database sessions.
    Cleans up automatically when the request completes.
    """
    global _tables_created
    if not _tables_created:
        # Import models so they register on Base.metadata
        from app.models.user import User
        from app.models.trip import Trip, TripPreference, SavedTrip, TripHistory
        from app.models.chat import Conversation, Message
        from app.models.feedback import Feedback, Notification
        from app.models.cache import APICache
        
        Base.metadata.create_all(bind=engine)
        _tables_created = True
        print("TripGenie Backend: Local SQLite database tables verified/created.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
