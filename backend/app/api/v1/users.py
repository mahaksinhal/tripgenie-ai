from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get profile details of the current logged-in user."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update profile details of the current logged-in user."""
    # Check if updating email and it's already taken
    if user_in.email and user_in.email != current_user.email:
        user = crud_user.get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=400,
                detail="The email is already registered to another account."
            )
            
    updated_user = crud_user.update_user(db, db_obj=current_user, obj_in=user_in)
    return updated_user
