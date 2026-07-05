import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import feedback as crud_feedback
from app.models.user import User
from app.schemas.feedback import NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    unread_only: bool = False,
    current_user: User = Depends(get_current_user)
) -> Any:
    """List all notifications for the current user."""
    return crud_feedback.get_notifications_by_user(db, user_id=current_user.id, only_unread=unread_only)

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Mark a specific notification as read."""
    notif = crud_feedback.mark_notification_as_read(db, user_id=current_user.id, notification_id=notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.post("/read-all", response_model=int)
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Mark all notifications of current user as read."""
    return crud_feedback.mark_all_notifications_as_read(db, user_id=current_user.id)
