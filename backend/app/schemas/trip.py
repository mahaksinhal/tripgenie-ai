import uuid
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

# Trip Preference schemas
class TripPreferenceBase(BaseModel):
    adults: int = Field(default=1, ge=0)
    children: int = Field(default=0, ge=0)
    senior_citizens: int = Field(default=0, ge=0)
    
    travel_style: Optional[str] = None # luxury, backpacker, family, business
    pace: Optional[str] = None # slow, moderate, fast
    transportation_preference: Optional[str] = None
    food_preference: Optional[str] = None
    hotel_preference: Optional[str] = None
    
    accessibility: Optional[str] = None
    medical_needs: Optional[str] = None
    activities: List[str] = Field(default_factory=list)
    
    passport_country: Optional[str] = None
    nationality: Optional[str] = None
    special_requests: Optional[str] = None
    
    # Legacy compatibility fields
    dietary_restrictions: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    accommodation_type: Optional[str] = None

class TripPreferenceCreate(TripPreferenceBase):
    pass

class TripPreferenceResponse(TripPreferenceBase):
    id: uuid.UUID
    trip_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Trip schemas
class TripBase(BaseModel):
    title: str
    source_city: str
    destination: str
    start_date: date
    end_date: date
    flexible_dates: bool = False
    budget: float = 0.00
    currency: str = "USD"
    status: str = "draft"
    summary: Optional[str] = None

class TripCreate(TripBase):
    preferences: Optional[TripPreferenceCreate] = None

class TripUpdate(BaseModel):
    title: Optional[str] = None
    source_city: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    flexible_dates: Optional[bool] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    summary: Optional[str] = None
    preferences: Optional[TripPreferenceCreate] = None

class TripResponse(TripBase):
    id: uuid.UUID
    user_id: uuid.UUID
    preferences: Optional[TripPreferenceResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Saved Trip schemas
class SavedTripBase(BaseModel):
    trip_id: uuid.UUID

class SavedTripCreate(SavedTripBase):
    pass

class SavedTripResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    trip_id: uuid.UUID
    saved_at: datetime
    trip: TripResponse

    class Config:
        from_attributes = True

# Trip History schemas
class TripHistoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    trip_id: uuid.UUID
    action: str
    details: dict
    timestamp: datetime

    class Config:
        from_attributes = True
