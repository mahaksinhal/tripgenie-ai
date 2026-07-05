from fastapi.testclient import TestClient
from app.main import app

def test():
    client = TestClient(app)
    
    # Authenticate first
    login_res = client.post(
        "/api/v1/auth/login/access-token", 
        data={"username": "test@example.com", "password": "password123"}
    )
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return
        
    token = login_res.json()["access_token"]
    print("Login success, token retrieved.")
    
    trip_data = {
        "title": "Summer Trip to Paris",
        "source_city": "New York",
        "destination": "Paris",
        "start_date": "2026-08-01",
        "end_date": "2026-08-08",
        "flexible_dates": False,
        "budget": 3000.0,
        "currency": "USD",
        "preferences": {
            "adults": 2,
            "children": 0,
            "senior_citizens": 0,
            "travel_style": "Explorer",
            "pace": "Moderate",
            "transportation_preference": "Flight",
            "food_preference": "No Restrictions",
            "hotel_preference": "Hotel",
            "accessibility": "None",
            "medical_needs": "None",
            "activities": ["Sightseeing"],
            "passport_country": "United States",
            "nationality": "American",
            "special_requests": ""
        }
    }
    
    print("Calling generate-stream...")
    try:
        res = client.post(
            "/api/v1/trip/generate-stream", 
            json=trip_data, 
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Response status:", res.status_code)
        print("Response headers:", dict(res.headers))
        print("Response text:", res.text)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
