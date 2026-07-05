from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState

def visa_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Visa Agent: Identifies entry requirements and visa policies based on passport country.
    """
    destination = state.get("destination", "")
    prefs = state.get("preferences_raw", {})
    passport = prefs.get("passport_country", "")
    nationality = prefs.get("nationality", "")

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Visa & Immigration Agent for TripGenie AI. "
                           "Determine entry policies, visa-free allowances, or visa-on-arrival terms. "
                           "Use user-facing summaries only."),
                ("user", "Passport Holder of: {passport}\nTraveling to: {destination}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "passport": passport or "United States",
                "destination": destination
            })
            return {
                "visa_requirements": {
                    "passport_country": passport,
                    "destination": destination,
                    "requirements_summary": res.content,
                    "status": "Information fetched"
                }
            }
        except Exception:
            pass

    # Fallback/Deterministic generator when offline/no API key
    summary = (
        f"Visa guidelines for {passport or 'citizens'} traveling to {destination}: "
        f"Standard tourist entry generally permits visa-free stay or visa-on-arrival for up to 90 days. "
        f"Ensure passport has at least 6 months validity from date of arrival."
    )
    return {
        "visa_requirements": {
            "passport_country": passport,
            "destination": destination,
            "requirements_summary": summary,
            "status": "General guidelines loaded"
        }
    }
