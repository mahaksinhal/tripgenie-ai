from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_distance_matrix

def route_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Route Optimization Agent: Incorporates Distance Matrix results to compute transit schedules.
    """
    source = state.get("source_city", "")
    destination = state.get("destination", "")
    weather = state.get("weather_forecast", {})
    hotels = state.get("hotel_options", {})
    restaurants = state.get("restaurant_options", {})

    # Calculate distance metrics
    distance_data = get_distance_matrix(source, destination)
    distance = distance_data.get("distance_text", "N/A")
    duration = distance_data.get("duration_text", "N/A")

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Route Optimization Agent for TripGenie AI. "
                           "Your task is to compile a daily schedule, incorporating the real distance and travel time "
                           "between the origin and destination, along with weather conditions and lodging parameters. "
                           "User-facing summaries only."),
                ("user", "From: {source}\nTo: {destination}\nDistance: {distance}\nTravel Duration: {duration}\n"
                         "Weather: {weather}\nLodging: {hotel}\nDining: {restaurant}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "source": source,
                "destination": destination,
                "distance": distance,
                "duration": duration,
                "weather": weather.get("forecast_summary", ""),
                "hotel": hotels.get("options_summary", ""),
                "restaurant": restaurants.get("options_summary", "")
            })
            return {
                "optimized_route": {
                    "destination": destination,
                    "itinerary_summary": res.content,
                    "distance": distance,
                    "duration": duration,
                    "daily_schedule": {
                        "Day 1": "Arrival and transit.",
                        "Day 2": "Explore central areas.",
                        "Day 3": "Checkout."
                    }
                }
            }
        except Exception:
            pass

    summary = (
        f"Optimized routing from {source} to {destination} ({distance}, {duration}): "
        f"Day 1: Travel transit and check-in at accommodation. "
        f"Day 2: City tours under expected {weather.get('conditions', 'temperate')} forecast conditions. "
        f"Day 3: Checkout and departure routing."
    )
    return {
        "optimized_route": {
            "destination": destination,
            "itinerary_summary": summary,
            "distance": distance,
            "duration": duration,
            "daily_schedule": {
                "Day 1": "Arrival & check-in",
                "Day 2": "Sightseeing",
                "Day 3": "Departure"
            }
        }
    }
