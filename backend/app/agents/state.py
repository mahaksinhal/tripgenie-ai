from typing import TypedDict, List, Dict, Any, Optional
import operator
from typing_extensions import Annotated

class TravelPlannerState(TypedDict):
    # Core Inputs
    title: str
    source_city: str
    destination: str
    start_date: str
    end_date: str
    flexible_dates: bool
    budget: float
    currency: str
    
    # Nested Preferences
    preferences_raw: Dict[str, Any]
    
    # Planner delegator directions
    delegation_plan: Dict[str, Any]
    
    # Parallel nodes outputs
    weather_forecast: Dict[str, Any]
    flight_options: Dict[str, Any]
    hotel_options: Dict[str, Any]
    restaurant_options: Dict[str, Any]
    
    # Downstream pipeline outputs
    optimized_route: Dict[str, Any]
    experiences: Dict[str, Any]
    transportation: Dict[str, Any]
    budget_analysis: Dict[str, Any]
    packing_list: List[str]
    visa_requirements: Dict[str, Any]
    
    # Aggregated Summary
    summary: str
    
    # Operational errors log (uses reducer append operator)
    errors: Annotated[List[str], operator.add]
