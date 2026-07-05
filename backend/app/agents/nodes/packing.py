from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState

def packing_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Packing Agent: Formulates a customized packing list based on weather and selected activities.
    """
    destination = state.get("destination", "")
    weather = state.get("weather_forecast", {})
    prefs = state.get("preferences_raw", {})
    activities = prefs.get("activities", [])

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Packing Assistant Agent for TripGenie AI. "
                           "Generate a checklist of essentials based on destination weather conditions and activities. "
                           "Use user-facing summaries only."),
                ("user", "Destination: {destination}\nWeather Forecast: {weather}\nActivities: {activities}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "destination": destination,
                "weather": weather.get("forecast_summary", ""),
                "activities": ", ".join(activities) if activities else "General Sightseeing"
            })
            items = [item.strip("- ") for item in res.content.split("\n") if item.strip().startswith("-")]
            return {
                "packing_list": items or ["Passport", "Adaptor", "Rain Jacket", "Comfortable Shoes"]
            }
        except Exception:
            pass

    # Fallback/Deterministic generator when offline/no API key
    fallback_items = [
        "Passport & Travel Documents",
        "Universal Power Adaptor",
        "Comfortable Walking Shoes",
        "Weather-appropriate clothing layers",
        "Mobile Charger & Powerbank",
        "Personal toiletries & prescription medications"
    ]
    if "Outdoors & Hiking" in activities:
        fallback_items.append("Sturdy hiking boots & backpack")
    if "Beaches & Water Sports" in activities:
        fallback_items.append("Swimwear & sunblock")
    
    return {
        "packing_list": fallback_items
    }
