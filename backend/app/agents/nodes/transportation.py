from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState

def transportation_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Transportation Agent: Recommends local transit options, train tickets, or car rentals.
    """
    destination = state.get("destination", "")
    prefs = state.get("preferences_raw", {})
    trans_pref = prefs.get("transportation_preference", "Public Transit")

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Transportation Logistics Agent for TripGenie AI. "
                           "Determine the best local transit and car hire passes. User-facing summaries only."),
                ("user", "Destination: {destination}\nPreference: {pref}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "destination": destination,
                "pref": trans_pref
            })
            return {
                "transportation": {
                    "transit_summary": res.content,
                    "preference": trans_pref
                }
            }
        except Exception:
            pass

    # Fallback/Deterministic generator when offline/no API key
    summary = (
        f"Transportation in {destination} (Preference: {trans_pref}): "
        f"1. Recommended option: City Rail Pass (Unlimted rides, cost-effective). "
        f"2. Backup: Local taxi hailing apps or walkable route maps connecting hotel to points of interest."
    )
    return {
        "transportation": {
            "transit_summary": summary,
            "preference": trans_pref
        }
    }
