from app.core.database import SessionLocal
from app.models.user import User
from app.models.trip import Trip
from app.crud import trip as crud_trip
from app.schemas.trip import TripCreate, TripPreferenceCreate
from datetime import date

def seed():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Auditing {len(users)} users for Indian itineraries...")
        for u in users:
            # Check if user already has Goa or Jaipur seeded
            existing_goa = db.query(Trip).filter(Trip.user_id == u.id, Trip.destination == "Goa").first()
            existing_jaipur = db.query(Trip).filter(Trip.user_id == u.id, Trip.destination == "Jaipur").first()
            
            if not existing_goa:
                print(f"Seeding Goa trip for {u.email}...")
                goa_trip = TripCreate(
                    title="Goa Beach Resort Escape",
                    source_city="Mumbai",
                    destination="Goa",
                    start_date=date(2026, 11, 12),
                    end_date=date(2026, 11, 16),
                    flexible_dates=True,
                    budget=35000.0,
                    currency="INR",
                    status="planned",
                    summary=(
                        "Goa Beach Resort Escape:\n\n"
                        "Optimized routing from Mumbai to Goa. Day 1: Take a short flight or scenic train ride to Madgaon/Dabolim, and check-in to your beach resort. Day 2: Visit Calangute beach for water sports and explore Aguada Fort. Day 3: Tour a spice plantation in Sahakari and enjoy an evening Mandovi river cruise."
                    ),
                    preferences=TripPreferenceCreate(
                        adults=2,
                        children=0,
                        senior_citizens=0,
                        travel_style="Explorer",
                        pace="Moderate",
                        transportation_preference="Flight",
                        food_preference="Vegetarian",
                        hotel_preference="Resort",
                        accessibility="None",
                        medical_needs="None",
                        activities=["Sightseeing", "Beaches & Water Sports", "Relaxation & Spa"],
                        passport_country="India",
                        nationality="Indian",
                        special_requests="Request a pool-facing room."
                    )
                )
                crud_trip.create_trip(db, user_id=u.id, obj_in=goa_trip)
                
            if not existing_jaipur:
                print(f"Seeding Jaipur trip for {u.email}...")
                jaipur_trip = TripCreate(
                    title="Jaipur Royal Heritage Route",
                    source_city="New Delhi",
                    destination="Jaipur",
                    start_date=date(2026, 12, 5),
                    end_date=date(2026, 12, 9),
                    flexible_dates=False,
                    budget=15000.0,
                    currency="INR",
                    status="planned",
                    summary=(
                        "Jaipur Royal Heritage Route:\n\n"
                        "Optimized routing from New Delhi to Jaipur. Day 1: Drive or take the Shatabdi Express to Jaipur. Check-in to your traditional Haveli hotel. Day 2: Morning tour of the magnificent Amer Fort and visit Hawa Mahal. Day 3: Explore City Palace and Jantar Mantar, followed by shopping in Johari Bazar."
                    ),
                    preferences=TripPreferenceCreate(
                        adults=2,
                        children=0,
                        senior_citizens=0,
                        travel_style="Explorer",
                        pace="Moderate",
                        transportation_preference="Train",
                        food_preference="Jain",
                        hotel_preference="Hotel",
                        accessibility="None",
                        medical_needs="None",
                        activities=["Sightseeing", "Shopping", "Food Tasting & Culinary"],
                        passport_country="India",
                        nationality="Indian",
                        special_requests="Request pure vegetarian meals."
                    )
                )
                crud_trip.create_trip(db, user_id=u.id, obj_in=jaipur_trip)
        print("Seeding of Indian domestic trips complete.")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
