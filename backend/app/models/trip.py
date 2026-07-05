import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, DateTime, ForeignKey, Date, Numeric, JSON, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_city: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    flexible_dates: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False) # draft, planned, active, completed, cancelled
    summary: Mapped[str] = mapped_column(String(10000), nullable=True) # Compiled travel summary from multi-agent Graph
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="trips")
    preferences = relationship("TripPreference", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    saved_by_users = relationship("SavedTrip", back_populates="trip", cascade="all, delete-orphan")
    history_entries = relationship("TripHistory", back_populates="trip", cascade="all, delete-orphan")
    feedback_entries = relationship("Feedback", back_populates="trip", cascade="all, delete-orphan")

class TripPreference(Base):
    __tablename__ = "trip_preferences"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Guest breakdown
    adults: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    senior_citizens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Stylistic Preferences
    travel_style: Mapped[str] = mapped_column(String(100), nullable=True) # luxury, backpacker, family, business
    pace: Mapped[str] = mapped_column(String(50), nullable=True) # slow, moderate, fast
    transportation_preference: Mapped[str] = mapped_column(String(100), nullable=True)
    food_preference: Mapped[str] = mapped_column(String(255), nullable=True)
    hotel_preference: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Health, safety & logistics
    accessibility: Mapped[str] = mapped_column(String(255), nullable=True)
    medical_needs: Mapped[str] = mapped_column(String(255), nullable=True)
    activities: Mapped[dict] = mapped_column(JSON, default=list, nullable=False) # e.g. ["Sightseeing", "Outdoors"]
    
    # Legal & Custom
    passport_country: Mapped[str] = mapped_column(String(100), nullable=True)
    nationality: Mapped[str] = mapped_column(String(100), nullable=True)
    special_requests: Mapped[str] = mapped_column(String(1000), nullable=True)
    
    # Legacy compatibility fields
    dietary_restrictions: Mapped[str] = mapped_column(String(255), nullable=True)
    interests: Mapped[dict] = mapped_column(JSON, default=list, nullable=False)
    accommodation_type: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    trip = relationship("Trip", back_populates="preferences")

class SavedTrip(Base):
    __tablename__ = "saved_trips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="saved_trips")
    trip = relationship("Trip", back_populates="saved_by_users")

class TripHistory(Base):
    __tablename__ = "trip_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "created", "edited_dates", "added_preferences", "completed"
    details: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="trip_history")
    trip = relationship("Trip", back_populates="history_entries")
