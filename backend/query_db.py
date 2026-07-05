from app.core.database import SessionLocal
from app.models.user import User
from app.models.trip import Trip

def query():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"User ID: {u.id}, Email: {u.email}")
            
        trips = db.query(Trip).all()
        print(f"\nTotal Trips: {len(trips)}")
        for t in trips:
            print(f"Trip ID: {t.id}, User ID: {t.user_id}, Title: {t.title}, Destination: {t.destination}")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    query()
