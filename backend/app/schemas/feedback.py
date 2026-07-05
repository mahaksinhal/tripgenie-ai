import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# Feedback schemas
class FeedbackBase(BaseModel):
    trip_id: Optional[uuid.UUID] = None
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "system" # system, trip, account

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
