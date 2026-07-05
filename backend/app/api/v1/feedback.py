from typing import Any, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import feedback as crud_feedback
from app.models.user import User
from app.schemas.feedback import FeedbackResponse, FeedbackCreate

router = APIRouter()

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_user_feedback(
    *,
    db: Session = Depends(get_db),
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Submit platform feedback with rating and optional comments."""
    return crud_feedback.create_feedback(db, user_id=current_user.id, obj_in=feedback_in)

@router.get("/", response_model=List[FeedbackResponse])
def read_user_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List all feedback entries submitted by the current user."""
    return crud_feedback.get_feedback_by_user(db, user_id=current_user.id)
