from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_coordinates, search_places

def hotel_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Hotel Agent: Searches Google Places for lodgings matching traveler style and hotel preference.
    """
    destination = state.get("destination", "")
    budget = state.get("budget", 2000)
    currency = state.get("currency", "USD")
    prefs = state.get("preferences_raw", {})
    hotel_pref = prefs.get("hotel_preference", "Hotel")
    style = prefs.get("travel_style", "Explorer")

    # 1. Get Coordinates
    coords = get_coordinates(destination)
    lat, lng = coords.get("lat", 48.8566), coords.get("lng", 2.3522)

    # 2. Search hotels
    query = f"{hotel_pref} in {destination}"
    hotels = search_places(query, lat, lng)
    
    avg_hotel_price = budget * 0.40 # Allocating 40% of budget

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Hotel Accommodation Agent for TripGenie AI. "
                           "Review these lodging results from Google Places, summarize the ratings and names, "
                           "and recommend lodging suitable for a traveler with travel style: {style}. "
                           "User-facing summaries only."),
                ("user", "Destination: {destination}\nLodging List: {hotels}\nBudget Limit: {budget} {currency}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "style": style,
                "destination": destination,
                "hotels": str(hotels),
                "budget": budget,
                "currency": currency
            })
            return {
                "hotel_options": {
                    "destination": destination,
                    "options_summary": res.content,
                    "estimated_cost": avg_hotel_price
                }
            }
        except Exception:
            pass

    hotels_str = ", ".join([f"{h['name']} (Rating: {h['rating']}, Address: {h['address']})" for h in hotels])
    return {
        "hotel_options": {
            "destination": destination,
            "options_summary": f"Stays found near {destination}: {hotels_str or 'Default hotel lodging listings loaded.'}.",
            "estimated_cost": avg_hotel_price
        }
    }
