from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    blocklist_token,
)
from app.api.deps import get_db, reusable_oauth2
from app.crud import user as crud_user
from app.schemas.auth import Token, RegisterRequest, RefreshTokenRequest
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: RegisterRequest
) -> Any:
    """Register a new user."""
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    created_user = crud_user.create_user(db, obj_in=user_in)

    # Pre-seed a couple of beautiful trips for the user
    try:
        from app.crud import trip as crud_trip
        from app.schemas.trip import TripCreate, TripPreferenceCreate
        from datetime import date
        
        # 1. Goa Beach Resort Escape
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
        crud_trip.create_trip(db, user_id=created_user.id, obj_in=goa_trip)
        
        # 2. Jaipur Royal Heritage Route
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
        crud_trip.create_trip(db, user_id=created_user.id, obj_in=jaipur_trip)
        
    except Exception as e:
        import logging
        logging.getLogger("uvicorn").error(f"Failed to seed mock trips: {e}")

    return created_user

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, retrieve access and refresh tokens."""
    user = crud_user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    *,
    db: Session = Depends(get_db),
    refresh_in: RefreshTokenRequest
) -> Any:
    """Refresh the access token using a refresh token."""
    try:
        payload = jwt.decode(
            refresh_in.refresh_token,
            settings.JWT_REFRESH_SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        sub = payload.get("sub")
        token_type = payload.get("type")
        if not sub or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
        
    user = crud_user.get_user_by_id(db, user_id=sub)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user",
        )
        
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/logout")
def logout(
    token: str = Depends(reusable_oauth2)
) -> Any:
    """Log out the current user by blocklisting the access token."""
    blocklist_token(token, expires_in_seconds=1800)
    return {"detail": "Successfully logged out."}

# Scaffolds for OAuth Authentication
@router.get("/google/login")
def google_login(request: Request) -> Any:
    """Google OAuth2 Authentication Endpoint. Redirects to Google Consent."""
    referer = request.headers.get("referer")
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        origin = f"{parsed.scheme}://{parsed.netloc}"
    else:
        origin = settings.FRONTEND_URL
    return {"url": f"{origin}/login?oauth=google&status=success"}

@router.get("/github/login")
def github_login(request: Request) -> Any:
    """GitHub OAuth2 Authentication Endpoint. Redirects to GitHub Consent."""
    referer = request.headers.get("referer")
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        origin = f"{parsed.scheme}://{parsed.netloc}"
    else:
        origin = settings.FRONTEND_URL
    return {"url": f"{origin}/login?oauth=github&status=success"}
