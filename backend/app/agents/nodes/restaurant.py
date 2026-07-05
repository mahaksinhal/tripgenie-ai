from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_coordinates, search_places

def restaurant_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Restaurant Agent: Searches Google Places for popular dining venues matching dietary preferences.
    """
    destination = state.get("destination", "")
    prefs = state.get("preferences_raw", {})
    food_pref = prefs.get("food_preference", "No Restrictions")

    # 1. Get Coordinates
    coords = get_coordinates(destination)
    lat, lng = coords.get("lat", 48.8566), coords.get("lng", 2.3522)

    # 2. Query dining spots
    query = f"{food_pref} restaurant in {destination}"
    restaurants = search_places(query, lat, lng)

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Culinary Guide Agent for TripGenie AI. "
                           "Review these dining spots from Google Places, summarize the ratings and names, "
                           "and advise the traveler on places suited to their food preference: {pref}. "
                           "User-facing summaries only."),
                ("user", "Destination: {destination}\nDining Spots: {spots}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "pref": food_pref,
                "destination": destination,
                "spots": str(restaurants)
            })
            return {
                "restaurant_options": {
                    "destination": destination,
                    "options_summary": res.content,
                    "food_preference": food_pref
                }
            }
        except Exception:
            pass

    spots_str = ", ".join([f"{r['name']} (Rating: {r['rating']}, Address: {r['address']})" for r in restaurants])
    return {
        "restaurant_options": {
            "destination": destination,
            "options_summary": f"Dining spots matching '{food_pref}': {spots_str or 'Default local dining spots loaded.'}.",
            "food_preference": food_pref
        }
    }
