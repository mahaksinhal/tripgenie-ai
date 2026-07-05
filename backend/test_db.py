import sys
import traceback
from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.models.user import User

def main():
    print("Testing DB engine connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Engine connection success:", result.scalar() == 1)
    except Exception as e:
        print("Engine connection FAILED:")
        traceback.print_exc()
        return

    print("\nTesting Session query on User model...")
    try:
        db = SessionLocal()
        user_count = db.query(User).count()
        print(f"User table exists. Total users: {user_count}")
    except Exception as e:
        print("Query FAILED:")
        traceback.print_exc()
        print("\nAttempting to create all tables...")
        try:
            from app.core.database import Base
            # Import other models so metadata has them loaded
            from app.models.trip import Trip, TripPreference, SavedTrip, TripHistory
            from app.models.chat import Conversation, Message
            from app.models.feedback import Feedback, Notification
            from app.models.cache import APICache
            
            Base.metadata.create_all(bind=engine)
            print("create_all completed. Retrying user query...")
            db = SessionLocal()
            user_count = db.query(User).count()
            print(f"User table exists after create_all. Total users: {user_count}")
        except Exception as create_err:
            print("Table creation FAILED:")
            traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
