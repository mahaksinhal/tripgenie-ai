import uuid
import json
import time
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import trip as crud_trip
from app.models.user import User
from app.schemas.trip import (
    TripResponse,
    TripCreate,
    TripUpdate,
    SavedTripResponse,
    TripHistoryResponse,
)

from app.agents import travel_graph

router = APIRouter()

@router.get("", response_model=List[TripResponse])
@router.get("/", response_model=List[TripResponse])
def read_trips(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all trips belonging to the current user."""
    return crud_trip.get_trips_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_new_trip(
    *,
    db: Session = Depends(get_db),
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new trip with preferences and compile with LangGraph."""
    initial_state = {
        "title": trip_in.title,
        "source_city": trip_in.source_city,
        "destination": trip_in.destination,
        "start_date": str(trip_in.start_date),
        "end_date": str(trip_in.end_date),
        "flexible_dates": trip_in.flexible_dates,
        "budget": float(trip_in.budget),
        "currency": trip_in.currency,
        "preferences_raw": trip_in.preferences.model_dump() if trip_in.preferences else {},
        "errors": []
    }
    
    try:
        final_state = travel_graph.invoke(initial_state)
        trip_in.summary = final_state.get("summary")
    except Exception as e:
        trip_in.summary = f"Trip planned to {trip_in.destination} from {trip_in.source_city}."

    return crud_trip.create_trip(db, user_id=current_user.id, obj_in=trip_in)

@router.post("/generate-stream")
async def generate_trip_stream(
    *,
    db: Session = Depends(get_db),
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new trip and stream real-time agent execution events."""
    async def event_generator():
        initial_state = {
            "title": trip_in.title,
            "source_city": trip_in.source_city,
            "destination": trip_in.destination,
            "start_date": str(trip_in.start_date),
            "end_date": str(trip_in.end_date),
            "flexible_dates": trip_in.flexible_dates,
            "budget": float(trip_in.budget),
            "currency": trip_in.currency,
            "preferences_raw": trip_in.preferences.model_dump() if trip_in.preferences else {},
            "errors": []
        }

        def make_event(agent: str, status: str, message: str, elapsed: float = 0.0, data: Any = None):
            payload = {
                "agent": agent,
                "status": status,
                "message": message,
                "elapsed": elapsed,
                "data": data
            }
            return f"data: {json.dumps(payload)}\n\n"

        yield make_event("planner", "running", "Lead Planner: Formulating task briefs...")
        
        try:
            node_messages = {
                "planner": "Lead Planner: Task briefs configured.",
                "weather": "Weather Agent: Forecasts retrieved from OpenWeather.",
                "flight": "Flight Agent: Search offers fetched from Amadeus.",
                "hotel": "Hotel Agent: Lodgings retrieved from Google Places.",
                "restaurant": "Restaurant Agent: Dining matches resolved from Google Places.",
                "route": "Route Agent: Daily itinerary tracks configured.",
                "experience": "Experience Agent: Attractions and sights mapped from Wikipedia.",
                "transportation": "Transportation Agent: Transit connections resolved.",
                "budget": "Budget Agent: Currency allocations and rates checked.",
                "packing": "Packing Agent: Packing checklist generated.",
                "visa": "Visa Agent: Entry visa clearance guidelines verified."
            }

            start_time = time.time()
            async for chunk in travel_graph.astream(initial_state):
                for node_name, node_output in chunk.items():
                    elapsed = time.time() - start_time
                    
                    if node_name == "planner":
                        yield make_event("planner", "success", node_messages["planner"], elapsed)
                        # Dispatch parallel nodes
                        yield make_event("weather", "running", "Weather Agent: Querying forecast...", elapsed)
                        yield make_event("flight", "running", "Flight Agent: Querying flight offers...", elapsed)
                        yield make_event("hotel", "running", "Hotel Agent: Searching stays...", elapsed)
                        yield make_event("restaurant", "running", "Restaurant Agent: Finding restaurants...", elapsed)
                    
                    elif node_name in ["weather", "flight", "hotel", "restaurant"]:
                        msg = node_messages.get(node_name, f"{node_name.title()} Agent finished.")
                        yield make_event(node_name, "success", msg, elapsed, node_output)
                    
                    elif node_name == "route":
                        yield make_event("route", "success", node_messages["route"], elapsed, node_output)
                        yield make_event("experience", "running", "Experience Agent: Mapping sights...", elapsed)
                        
                    elif node_name == "experience":
                        yield make_event("experience", "success", node_messages["experience"], elapsed, node_output)
                        yield make_event("transportation", "running", "Transportation Agent: Checking routes...", elapsed)
                        
                    elif node_name == "transportation":
                        yield make_event("transportation", "success", node_messages["transportation"], elapsed, node_output)
                        yield make_event("budget", "running", "Budget Agent: Reviewing exchange rates...", elapsed)
                        
                    elif node_name == "budget":
                        yield make_event("budget", "success", node_messages["budget"], elapsed, node_output)
                        yield make_event("packing", "running", "Packing Agent: Preparing packing items...", elapsed)
                        
                    elif node_name == "packing":
                        yield make_event("packing", "success", node_messages["packing"], elapsed, node_output)
                        yield make_event("visa", "running", "Visa Agent: checking visa status...", elapsed)
                        
                    elif node_name == "visa":
                        yield make_event("visa", "success", node_messages["visa"], elapsed, node_output)
                        yield make_event("summary", "running", "Summary Agent: Compiling final summary...", elapsed)
                        
                    elif node_name == "summary":
                        yield make_event("summary", "success", "Summary Agent: Itinerary compilation complete.", elapsed, node_output)
                        
                        # Save in DB
                        trip_in.summary = node_output.get("summary", "")
                        db_trip = crud_trip.create_trip(db, user_id=current_user.id, obj_in=trip_in)
                        
                        # Yield completion event
                        yield f"data: {json.dumps({'event': 'complete', 'trip_id': str(db_trip.id)})}\n\n"
                        
        except Exception as e:
            logger.error(f"Error during graph execution stream: {str(e)}")
            yield f"data: {json.dumps({'event': 'error', 'message': str(e)})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/saved", response_model=List[SavedTripResponse])
def read_saved_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all saved trips for the current user."""
    return crud_trip.get_saved_trips_by_user(db, user_id=current_user.id)

@router.get("/{trip_id}", response_model=TripResponse)
def read_trip_by_id(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get details of a specific trip by UUID."""
    trip = crud_trip.get_trip(db, trip_id=trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip_by_id(
    *,
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    trip_in: TripUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update details and preferences of a specific trip."""
    trip = crud_trip.get_trip(db, trip_id=trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this trip")
    return crud_trip.update_trip(db, db_trip=trip, obj_in=trip_in)

@router.delete("/{trip_id}", response_model=bool)
def delete_trip_by_id(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a specific trip."""
    trip = crud_trip.get_trip(db, trip_id=trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this trip")
    return crud_trip.delete_trip(db, trip_id=trip_id)

@router.post("/{trip_id}/save", response_model=SavedTripResponse)
def save_trip_by_id(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Save/bookmark a specific trip."""
    trip = crud_trip.get_trip(db, trip_id=trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    # Users can save their own trips or publicly shared trips (if shared implemented; for now open save)
    saved = crud_trip.save_trip(db, user_id=current_user.id, trip_id=trip_id)
    return saved

@router.post("/{trip_id}/unsave", response_model=bool)
def unsave_trip_by_id(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Unsave/remove bookmark of a specific trip."""
    return crud_trip.unsave_trip(db, user_id=current_user.id, trip_id=trip_id)

@router.get("/{trip_id}/history", response_model=List[TripHistoryResponse])
def read_trip_history(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get the audit log/history entries of a specific trip."""
    trip = crud_trip.get_trip(db, trip_id=trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view history")
    return crud_trip.get_trip_history(db, trip_id=trip_id)
