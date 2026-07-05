from app.core.database import SessionLocal
from app.crud.user import create_user, authenticate, get_user_by_email
from app.schemas.user import UserCreate

def test():
    db = SessionLocal()
    email = "test@example.com"
    password = "password123"

    try:
        user = get_user_by_email(db, email=email)
        if not user:
            print("Creating user...")
            user_in = UserCreate(email=email, password=password, full_name="Test Traveler")
            user = create_user(db, obj_in=user_in)
            print("User created successfully:", user.id)
        else:
            print("User already exists in db:", user.id)

        print("Authenticating user...")
        auth_user = authenticate(db, email=email, password=password)
        if auth_user:
            print("Authentication SUCCESS!")
        else:
            print("Authentication FAILED!")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test()
