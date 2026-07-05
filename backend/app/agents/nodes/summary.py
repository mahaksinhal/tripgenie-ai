from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_destination_image

def summary_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Summary Agent: Consolidates details and embeds a high-quality cover photo from Unsplash.
    """
    title = state.get("title", "My Trip")
    destination = state.get("destination", "")
    weather = state.get("weather_forecast", {})
    flights = state.get("flight_options", {})
    hotels = state.get("hotel_options", {})
    route = state.get("optimized_route", {})
    experiences = state.get("experiences", {})
    transit = state.get("transportation", {})
    budget = state.get("budget_analysis", {})
    packing = state.get("packing_list", [])
    visa = state.get("visa_requirements", {})

    # Fetch Unsplash cover image
    image_url = get_destination_image(destination)

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Summary Compiler Agent for TripGenie AI. "
                           "Consolidate flight details, hotels, weather, routes, packing checklist, and visa advice "
                           "into a beautiful, user-facing summary guide. "
                           "Include the Unsplash image URL in the guide. "
                           "User-facing summaries only. No internal mock traces."),
                ("user", "Title: {title}\nDestination: {destination}\nImage: {image}\nFlight: {flight}\nStay: {hotel}\nRoute: {route}\n"
                         "Experiences: {experiences}\nTransit: {transit}\nBudget: {budget}\nPacking: {packing}\nVisa: {visa}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "title": title,
                "destination": destination,
                "image": image_url,
                "flight": flights.get("options_summary", ""),
                "hotel": hotels.get("options_summary", ""),
                "route": route.get("itinerary_summary", ""),
                "experiences": experiences.get("experience_summary", ""),
                "transit": transit.get("transit_summary", ""),
                "budget": budget.get("analysis_summary", ""),
                "packing": ", ".join(packing),
                "visa": visa.get("requirements_summary", "")
            })
            return {
                "summary": res.content
            }
        except Exception:
            pass

    aggregated = (
        f"![{destination}]({image_url})\n\n"
        f"==== TRIPGENIE COHESIVE TRAVEL PLAN: {title} ====\n\n"
        f"Destination: {destination}\n"
        f"Weather Overview: {weather.get('forecast_summary', '')}\n\n"
        f"Transport & Route Plan:\n- Flights: {flights.get('options_summary', '')}\n"
        f"- Local Transit: {transit.get('transit_summary', '')}\n\n"
        f"Accommodation & Stays:\n- Hotel: {hotels.get('options_summary', '')}\n"
        f"- Dining: {state.get('restaurant_options', {}).get('options_summary', '')}\n\n"
        f"Daily Itinerary Outline:\n{route.get('itinerary_summary', '')}\n\n"
        f"Packing List Checklist:\n" + "\n".join([f"- [ ] {item}" for item in packing]) + "\n\n"
        f"Entry Requirements & Visa status:\n{visa.get('requirements_summary', '')}\n\n"
        f"Budget Review:\n{budget.get('analysis_summary', '')}\n"
    )
    return {
        "summary": aggregated
    }
