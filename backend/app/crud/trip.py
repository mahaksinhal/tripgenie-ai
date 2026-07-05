import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.trip import Trip, TripPreference, SavedTrip, TripHistory
from app.schemas.trip import TripCreate, TripUpdate

def get_trip(db: Session, trip_id: uuid.UUID) -> Optional[Trip]:
    return db.query(Trip).filter(Trip.id == trip_id).first()

def get_trips_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Trip]:
    return db.query(Trip).filter(Trip.user_id == user_id).order_by(Trip.created_at.desc()).offset(skip).limit(limit).all()

def create_trip(db: Session, user_id: uuid.UUID, obj_in: TripCreate) -> Trip:
    # 1. Create Trip
    db_trip = Trip(
        user_id=user_id,
        title=obj_in.title,
        source_city=obj_in.source_city,
        destination=obj_in.destination,
        start_date=obj_in.start_date,
        end_date=obj_in.end_date,
        flexible_dates=obj_in.flexible_dates,
        budget=obj_in.budget,
        currency=obj_in.currency,
        status=obj_in.status,
        summary=obj_in.summary
    )
    db.add(db_trip)
    db.flush() # Populate db_trip.id for Preferences relationship

    # 2. Add Preferences
    pref_data = obj_in.preferences.model_dump() if obj_in.preferences else {}
    db_pref = TripPreference(
        trip_id=db_trip.id,
        adults=pref_data.get("adults", 1),
        children=pref_data.get("children", 0),
        senior_citizens=pref_data.get("senior_citizens", 0),
        travel_style=pref_data.get("travel_style"),
        pace=pref_data.get("pace"),
        transportation_preference=pref_data.get("transportation_preference"),
        food_preference=pref_data.get("food_preference"),
        hotel_preference=pref_data.get("hotel_preference"),
        accessibility=pref_data.get("accessibility"),
        medical_needs=pref_data.get("medical_needs"),
        activities=pref_data.get("activities", []),
        passport_country=pref_data.get("passport_country"),
        nationality=pref_data.get("nationality"),
        special_requests=pref_data.get("special_requests"),
        # legacy fields
        dietary_restrictions=pref_data.get("dietary_restrictions"),
        interests=pref_data.get("interests", []),
        accommodation_type=pref_data.get("accommodation_type")
    )
    db.add(db_pref)
    db.flush()

    # 3. Add to History
    db_history = TripHistory(
        user_id=user_id,
        trip_id=db_trip.id,
        action="created",
        details={
            "title": db_trip.title,
            "source_city": db_trip.source_city,
            "destination": db_trip.destination
        }
    )
    db.add(db_history)

    db.commit()
    db.refresh(db_trip)
    return db_trip

def update_trip(db: Session, db_trip: Trip, obj_in: TripUpdate) -> Trip:
    update_data = obj_in.model_dump(exclude_unset=True)
    
    # Track actions
    history_details = {}

    # Handle basic fields
    core_fields = ["title", "source_city", "destination", "start_date", "end_date", "flexible_dates", "budget", "currency", "status", "summary"]
    for field in core_fields:
        if field in update_data:
            old_val = getattr(db_trip, field)
            new_val = update_data[field]
            if old_val != new_val:
                setattr(db_trip, field, new_val)
                history_details[field] = {"old": str(old_val), "new": str(new_val)}

    # Handle preferences nested update
    if "preferences" in update_data and update_data["preferences"]:
        pref_in = update_data["preferences"]
        if not db_trip.preferences:
            db_trip.preferences = TripPreference(trip_id=db_trip.id)
        
        for pref_field, pref_val in pref_in.items():
            setattr(db_trip.preferences, pref_field, pref_val)
        history_details["preferences"] = pref_in

    # Record history if anything changed
    if history_details:
        db_history = TripHistory(
            user_id=db_trip.user_id,
            trip_id=db_trip.id,
            action="updated",
            details=history_details
        )
        db.add(db_history)

    db.commit()
    db.refresh(db_trip)
    return db_trip

def delete_trip(db: Session, trip_id: uuid.UUID) -> bool:
    db_trip = get_trip(db, trip_id)
    if not db_trip:
        return False
    db.delete(db_trip)
    db.commit()
    return True

# Saved Trips
def get_saved_trips_by_user(db: Session, user_id: uuid.UUID) -> List[SavedTrip]:
    return db.query(SavedTrip).filter(SavedTrip.user_id == user_id).all()

def save_trip(db: Session, user_id: uuid.UUID, trip_id: uuid.UUID) -> Optional[SavedTrip]:
    existing = db.query(SavedTrip).filter(
        SavedTrip.user_id == user_id,
        SavedTrip.trip_id == trip_id
    ).first()
    if existing:
        return existing
        
    db_saved = SavedTrip(user_id=user_id, trip_id=trip_id)
    db.add(db_saved)
    db.commit()
    db.refresh(db_saved)
    return db_saved

def unsave_trip(db: Session, user_id: uuid.UUID, trip_id: uuid.UUID) -> bool:
    db_saved = db.query(SavedTrip).filter(
        SavedTrip.user_id == user_id,
        SavedTrip.trip_id == trip_id
    ).first()
    if not db_saved:
        return False
    db.delete(db_saved)
    db.commit()
    return True

# Trip History
def get_trip_history(db: Session, trip_id: uuid.UUID) -> List[TripHistory]:
    return db.query(TripHistory).filter(TripHistory.trip_id == trip_id).order_by(TripHistory.timestamp.desc()).all()
