from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import search_flights

def flight_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Flight Agent: Searches Amadeus for flight offers matching dates, route and passenger counts.
    """
    source = state.get("source_city", "")
    destination = state.get("destination", "")
    start_date = state.get("start_date", "")
    budget = state.get("budget", 2000)
    currency = state.get("currency", "USD")
    prefs = state.get("preferences_raw", {})
    adults = prefs.get("adults", 1)
    
    # Query Flights
    offers = search_flights(source, destination, start_date, adults)
    
    # Calculate flight expenses tally
    avg_price = sum(o["price"] for o in offers) / len(offers) if offers else budget * 0.35

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Flight Booking Agent for TripGenie AI. "
                           "Review these real-time flight quotes, summarize the carrier names and flight costs, "
                           "and advise the traveler on options aligning to their travel budget. "
                           "Provide user-facing summaries only. No internal mock traces."),
                ("user", "From: {source}\nTo: {destination}\nQuotes: {quotes}\nBudget Cap: {budget} {currency}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "source": source,
                "destination": destination,
                "quotes": str(offers),
                "budget": budget,
                "currency": currency
            })
            return {
                "flight_options": {
                    "source": source,
                    "destination": destination,
                    "options_summary": res.content,
                    "estimated_cost": avg_price
                }
            }
        except Exception:
            pass

    offers_str = ", ".join([f"{o['carrier']} at {o['currency']} {o['price']}" for o in offers])
    return {
        "flight_options": {
            "source": source,
            "destination": destination,
            "options_summary": f"Flight options resolved: {offers_str}.",
            "estimated_cost": avg_price
        }
    }
