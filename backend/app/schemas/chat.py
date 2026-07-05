import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# Message schemas
class MessageBase(BaseModel):
    sender: str # "user", "assistant"
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Conversation schemas
class ConversationBase(BaseModel):
    title: str
    trip_id: Optional[uuid.UUID] = None

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    trip_id: Optional[uuid.UUID] = None

class ConversationResponse(ConversationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
