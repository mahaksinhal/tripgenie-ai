from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.agents.state import TravelPlannerState

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=api_key,
                temperature=0.2
            )
        except Exception:
            return None
    return None

def planner_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Planner Agent: Analyzes inputs and compiles delegation directives for parallel nodes.
    """
    title = state.get("title", "My Trip")
    source = state.get("source_city", "")
    destination = state.get("destination", "")
    budget = state.get("budget", 2000)
    currency = state.get("currency", "USD")
    start_date = state.get("start_date", "")
    end_date = state.get("end_date", "")
    prefs = state.get("preferences_raw", {})

    llm = get_llm()
    
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Lead Travel Planner Agent for TripGenie AI. "
                           "Your task is to analyze user preferences and generate a structured delegation brief "
                           "instructing other agents (Weather, Flight, Hotel, Restaurant) on what parameters to prioritize. "
                           "Focus on user-facing decision summaries only. No mock thoughts."),
                ("user", "Trip Title: {title}\nFrom: {source}\nTo: {destination}\nDates: {start_date} to {end_date}\n"
                         "Budget: {budget} {currency}\nTravel Style: {style}\n"
                         "Hotel Preference: {hotel_style}\nFood Preference: {food}\n"
                         "Special Requests: {requests}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "title": title,
                "source": source,
                "destination": destination,
                "start_date": start_date,
                "end_date": end_date,
                "budget": budget,
                "currency": currency,
                "style": prefs.get("travel_style", "Explorer"),
                "hotel_style": prefs.get("hotel_preference", "Hotel"),
                "food": prefs.get("food_preference", "No Restrictions"),
                "requests": prefs.get("special_requests", "")
            })
            
            summary = res.content
            return {
                "delegation_plan": {
                    "focus": f"Core travel coordination for {destination}.",
                    "instructions": summary,
                    "status": "success"
                }
            }
        except Exception as e:
            # Cascades to fallback logic below
            pass

    # Fallback/Deterministic generator when offline or API key is absent
    style = prefs.get("travel_style", "Explorer")
    fallback_summary = (
        f"Planner Directive for {destination}: Budget allocation is capped at {budget} {currency}. "
        f"Travel style is marked as {style}. Prioritize transportation routes starting from {source} "
        f"and lodging aligned to {prefs.get('hotel_preference', 'Hotel')} comfort parameters."
    )
    return {
        "delegation_plan": {
            "focus": f"Logistical routing to {destination}",
            "instructions": fallback_summary,
            "status": "fallback"
        }
    }
