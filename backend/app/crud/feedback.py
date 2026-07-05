import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.feedback import Feedback, Notification
from app.schemas.feedback import FeedbackCreate, NotificationBase

def create_feedback(db: Session, user_id: uuid.UUID, obj_in: FeedbackCreate) -> Feedback:
    db_feedback = Feedback(
        user_id=user_id,
        trip_id=obj_in.trip_id,
        rating=obj_in.rating,
        comments=obj_in.comments
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_feedback_by_user(db: Session, user_id: uuid.UUID) -> List[Feedback]:
    return db.query(Feedback).filter(Feedback.user_id == user_id).all()

# Notifications
def create_notification(db: Session, user_id: uuid.UUID, title: str, message: str, type_: str = "system") -> Notification:
    db_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type_,
        is_read=False
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_notifications_by_user(db: Session, user_id: uuid.UUID, only_unread: bool = False) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if only_unread:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()

def mark_notification_as_read(db: Session, user_id: uuid.UUID, notification_id: uuid.UUID) -> Optional[Notification]:
    db_notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if db_notif:
        db_notif.is_read = True
        db.commit()
        db.refresh(db_notif)
    return db_notif

def mark_all_notifications_as_read(db: Session, user_id: uuid.UUID) -> int:
    unread = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()
    for notif in unread:
        notif.is_read = True
    db.commit()
    return len(unread)
