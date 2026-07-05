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
        print(f"Auditing {len(users)} users...")
        for u in users:
            trips = db.query(Trip).filter(Trip.user_id == u.id).all()
            print(f"User {u.email} has {len(trips)} trips.")
            if len(trips) == 0:
                print(f"Seeding trips for user {u.email}...")
                
                # Kyoto Trip
                kyoto_trip = TripCreate(
                    title="Kyoto Cherry Blossom Tour",
                    source_city="San Francisco",
                    destination="Kyoto",
                    start_date=date(2026, 4, 1),
                    end_date=date(2026, 4, 5),
                    flexible_dates=True,
                    budget=4500.0,
                    currency="USD",
                    status="planned",
                    summary=(
                        "Kyoto Cherry Blossom Tour:\n\n"
                        "Optimized routing from San Francisco to Kyoto. Day 1: Arrive at Kansai Airport and take the Haruka Express rail to Kyoto Station for check-in. Day 2: Walk the Philosopher's Path and tour Kiyomizu-dera during the cherry blossom peak. Day 3: Morning walk through Fushimi Inari Torii gates followed by afternoon tea in Gion."
                    ),
                    preferences=TripPreferenceCreate(
                        adults=2,
                        children=0,
                        senior_citizens=0,
                        travel_style="Explorer",
                        pace="Moderate",
                        transportation_preference="Flight & Train",
                        food_preference="Vegetarian Friendly",
                        hotel_preference="Traditional Ryokan",
                        accessibility="None",
                        medical_needs="None",
                        activities=["Sightseeing", "Food Tasting & Culinary", "Local Festivals"],
                        passport_country="United States",
                        nationality="American",
                        special_requests="Request a room overlooking the river garden."
                    )
                )
                crud_trip.create_trip(db, user_id=u.id, obj_in=kyoto_trip)

                # Paris Trip
                paris_trip = TripCreate(
                    title="Summer Trip to Paris",
                    source_city="New York",
                    destination="Paris",
                    start_date=date(2026, 8, 1),
                    end_date=date(2026, 8, 5),
                    flexible_dates=False,
                    budget=3500.0,
                    currency="USD",
                    status="planned",
                    summary=(
                        "Summer Trip to Paris:\n\n"
                        "Optimized routing from New York to Paris. Day 1: Land at Charles de Gaulle Airport and take the RER B train to central Paris. Day 2: Ascent Eiffel Tower in the morning and tour the Louvre Museum in the afternoon. Day 3: Explore Montmartre art streets and enjoy a Seine river cruise dinner."
                    ),
                    preferences=TripPreferenceCreate(
                        adults=1,
                        children=0,
                        senior_citizens=0,
                        travel_style="Explorer",
                        pace="Moderate",
                        transportation_preference="Flight",
                        food_preference="No Restrictions",
                        hotel_preference="Boutique Hotel",
                        accessibility="None",
                        medical_needs="None",
                        activities=["Sightseeing", "Museums & Art Galleries", "Shopping"],
                        passport_country="United States",
                        nationality="American",
                        special_requests="Request a quiet room."
                    )
                )
                crud_trip.create_trip(db, user_id=u.id, obj_in=paris_trip)
        print("Database seeding audit completed successfully.")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
