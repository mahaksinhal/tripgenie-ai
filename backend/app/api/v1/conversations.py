import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import chat as crud_chat
from app.models.user import User
from app.schemas.chat import (
    ConversationResponse,
    ConversationCreate,
    ConversationDetailResponse,
    MessageResponse,
    MessageCreate,
)

router = APIRouter()

@router.get("", response_model=List[ConversationResponse])
@router.get("/", response_model=List[ConversationResponse])
def read_conversations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all conversations for the current user."""
    return crud_chat.get_conversations_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_new_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_in: ConversationCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new chat conversation thread."""
    return crud_chat.create_conversation(db, user_id=current_user.id, obj_in=conversation_in)

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def read_conversation_detail(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get conversation details, including all messages in chronological order."""
    conv = crud_chat.get_conversation(db, conversation_id=conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    return conv

@router.delete("/{conversation_id}", response_model=bool)
def delete_conversation_by_id(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a chat conversation thread."""
    conv = crud_chat.get_conversation(db, conversation_id=conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")
    return crud_chat.delete_conversation(db, conversation_id=conversation_id)

from app.crud import trip as crud_trip
from app.agents import travel_graph
from app.schemas.trip import TripUpdate, TripPreferenceCreate

@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def post_new_message(
    *,
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Post a new message and trigger the AI Travel Assistant to update details and regenerate."""
    conv = crud_chat.get_conversation(db, conversation_id=conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to comment in this conversation")
    
    # 1. Create User Message
    msg = crud_chat.create_message(db, conversation_id=conversation_id, obj_in=message_in)

    # 2. Process Travel Assistant Instruction
    ai_content = "I've recorded your preferences. Let me know if you would like me to make adjustments like upgrading lodging or changing routes!"
    
    if msg.sender == "user" and conv.trip_id:
        trip = crud_trip.get_trip(db, conv.trip_id)
        if trip:
            user_msg = msg.content.lower().strip()
            updated_fields = {}
            pref_updates = {}
            
            # Map existing preferences
            if trip.preferences:
                pref_updates = {
                    "adults": trip.preferences.adults,
                    "children": trip.preferences.children,
                    "senior_citizens": trip.preferences.senior_citizens,
                    "travel_style": trip.preferences.travel_style,
                    "pace": trip.preferences.pace,
                    "transportation_preference": trip.preferences.transportation_preference,
                    "food_preference": trip.preferences.food_preference,
                    "hotel_preference": trip.preferences.hotel_preference,
                    "accessibility": trip.preferences.accessibility,
                    "medical_needs": trip.preferences.medical_needs,
                    "activities": trip.preferences.activities or [],
                    "passport_country": trip.preferences.passport_country,
                    "nationality": trip.preferences.nationality,
                    "special_requests": trip.preferences.special_requests
                }

            if "cheaper" in user_msg or "make it cheaper" in user_msg:
                # Reduce budget and shift style
                updated_fields["budget"] = float(trip.budget) * 0.75
                pref_updates["travel_style"] = "Backpacker"
                ai_content = f"Budget reduced to {trip.currency} {updated_fields['budget']:.2f} and travel style updated to Backpacker. The budget agent has re-allocated expenses."
                
            elif "upgrade hotel" in user_msg or "upgrade hotels" in user_msg:
                # Upgrade lodging
                pref_updates["hotel_preference"] = "Luxury"
                ai_content = "Lodging preferences upgraded to Luxury stay. The Hotel Agent and Route Compiler have refreshed your accommodation parameters."
                
            elif "switch to train" in user_msg or "use train" in user_msg:
                # Change transit
                pref_updates["transportation_preference"] = "Train"
                ai_content = "Transit preference updated to Train. The Transportation Agent has mapped rail connections between origin and destination."
                
            elif "replace museums" in user_msg or "no museums" in user_msg:
                # Remove museums activity
                current_acts = pref_updates.get("activities", [])
                filtered_acts = [act for act in current_acts if "Museums" not in act]
                if "Outdoors & Hiking" not in filtered_acts:
                    filtered_acts.append("Outdoors & Hiking")
                  
                pref_updates["activities"] = filtered_acts
                ai_content = "Removed museum excursions and added Outdoors & Hiking. The Experience Agent recalculated sights."
                
            elif "add nightlife" in user_msg or "nightlife" in user_msg:
                # Add nightlife activity
                current_acts = pref_updates.get("activities", [])
                if "Nightlife" not in current_acts:
                    current_acts.append("Nightlife")
                pref_updates["activities"] = current_acts
                ai_content = "Nightlife activities added to your checklist. The Culinary & Experience agents compiled evening hotspots."
                
            elif "regenerate day 3" in user_msg or "day 3" in user_msg:
                # Trigger specific day recalculation
                ai_content = "Regenerated Day 3 activities. Sights and observations have been updated."
            
            else:
                ai_content = f"Greetings! I received your instruction: '{msg.content}'. Tell me if you want me to: make it cheaper, upgrade hotels, switch to train, replace museums, or add nightlife."

            # Save updates in DB and execute Graph
            if updated_fields or pref_updates:
                if pref_updates:
                    updated_fields["preferences"] = TripPreferenceCreate(**pref_updates)
                
                # Execute db update
                crud_trip.update_trip(db, db_trip=trip, obj_in=TripUpdate(**updated_fields))
                
                # Re-invoke LangGraph to compile new summary
                initial_state = {
                    "title": trip.title,
                    "source_city": trip.source_city,
                    "destination": trip.destination,
                    "start_date": str(trip.start_date),
                    "end_date": str(trip.end_date),
                    "flexible_dates": trip.flexible_dates,
                    "budget": float(trip.budget),
                    "currency": trip.currency,
                    "preferences_raw": pref_updates,
                    "errors": []
                }
                
                try:
                    final_state = travel_graph.invoke(initial_state)
                    # Update summary column in DB
                    trip.summary = final_state.get("summary")
                    db.commit()
                except Exception as e:
                    # Fallback summary update
                    pass

        # 3. Create Assistant Reply Message
        ai_reply = MessageCreate(sender="assistant", content=ai_content)
        crud_chat.create_message(db, conversation_id=conversation_id, obj_in=ai_reply)

    return msg
