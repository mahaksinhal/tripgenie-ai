from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_wikipedia_summary

def experience_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Experience Agent: Employs Wikipedia summary for destination culture and historical contexts.
    """
    destination = state.get("destination", "")
    prefs = state.get("preferences_raw", {})
    activities = prefs.get("activities", [])

    # Fetch Wikipedia description
    wiki_desc = get_wikipedia_summary(destination)

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Experience & Activities Agent for TripGenie AI. "
                           "Review this Wikipedia overview, suggest sights, history checks and attraction tickets. "
                           "User-facing summaries only."),
                ("user", "Destination: {destination}\nWiki Background: {wiki}\nPreferences: {activities}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "destination": destination,
                "wiki": wiki_desc,
                "activities": ", ".join(activities) if activities else "General Sightseeing"
            })
            return {
                "experiences": {
                    "destination": destination,
                    "experience_summary": res.content,
                    "highlights": activities
                }
            }
        except Exception:
            pass

    summary = (
        f"Experiences in {destination}: {wiki_desc[:250]}... "
        f"Activities planned: {', '.join(activities) if activities else 'General Sightseeing'}."
    )
    return {
        "experiences": {
            "destination": destination,
            "experience_summary": summary,
            "highlights": activities
        }
    }
