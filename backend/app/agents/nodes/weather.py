from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_coordinates, get_weather_forecast

def weather_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Weather Agent: Resolves coordinates using Geocoding and retrieves weather forecast from OpenWeather.
    """
    destination = state.get("destination", "")
    
    # 1. Resolve coordinates
    coords = get_coordinates(destination)
    lat, lng = coords.get("lat", 48.8566), coords.get("lng", 2.3522)

    # 2. Get Weather
    weather = get_weather_forecast(lat, lng, destination)

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Weather Intelligence Agent for TripGenie AI. "
                           "Given real weather data, summarize the forecast conditions for the destination, "
                           "highlighting temperature ranges and any specific recommendations (e.g. clothing to pack). "
                           "Provide user-facing decision summaries only."),
                ("user", "Destination: {destination}\nWeather Details: {weather}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "destination": destination,
                "weather": weather.get("forecast_summary", "")
            })
            return {
                "weather_forecast": {
                    "destination": destination,
                    "forecast_summary": res.content,
                    "avg_temp": weather.get("avg_temp", "21C"),
                    "conditions": weather.get("conditions", "Clear")
                }
            }
        except Exception:
            pass

    return {
        "weather_forecast": weather
    }
