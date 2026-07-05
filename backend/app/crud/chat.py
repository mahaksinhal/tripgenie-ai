import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.chat import Conversation, Message
from app.schemas.chat import ConversationCreate, MessageCreate

def get_conversation(db: Session, conversation_id: uuid.UUID) -> Optional[Conversation]:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def get_conversations_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Conversation]:
    return db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc()).offset(skip).limit(limit).all()

def create_conversation(db: Session, user_id: uuid.UUID, obj_in: ConversationCreate) -> Conversation:
    db_conv = Conversation(
        user_id=user_id,
        title=obj_in.title or "New Conversation",
        trip_id=obj_in.trip_id
    )
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv

def delete_conversation(db: Session, conversation_id: uuid.UUID) -> bool:
    db_conv = get_conversation(db, conversation_id)
    if not db_conv:
        return False
    db.delete(db_conv)
    db.commit()
    return True

def create_message(db: Session, conversation_id: uuid.UUID, obj_in: MessageCreate) -> Message:
    db_msg = Message(
        conversation_id=conversation_id,
        sender=obj_in.sender,
        content=obj_in.content
    )
    db.add(db_msg)
    
    # Update conversation's updated_at timestamp
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db_conv.updated_at = db_msg.created_at
        
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_messages_by_conversation(db: Session, conversation_id: uuid.UUID) -> List[Message]:
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
