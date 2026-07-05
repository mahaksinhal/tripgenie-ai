from langgraph.graph import StateGraph, START, END
from app.agents.state import TravelPlannerState
from app.agents.nodes import (
    planner_node,
    weather_node,
    flight_node,
    hotel_node,
    restaurant_node,
    route_node,
    experience_node,
    transportation_node,
    budget_node,
    packing_node,
    visa_node,
    summary_node
)

# 1. Initialize StateGraph with our shared state model
workflow = StateGraph(TravelPlannerState)

# 2. Register all modular agent nodes
workflow.add_node("planner", planner_node)
workflow.add_node("weather", weather_node)
workflow.add_node("flight", flight_node)
workflow.add_node("hotel", hotel_node)
workflow.add_node("restaurant", restaurant_node)
workflow.add_node("route", route_node)
workflow.add_node("experience", experience_node)
workflow.add_node("transportation", transportation_node)
workflow.add_node("budget", budget_node)
workflow.add_node("packing", packing_node)
workflow.add_node("visa", visa_node)
workflow.add_node("summary", summary_node)

# 3. Formulate the edge mapping
workflow.add_edge(START, "planner")

# Parallel Fan-Out: Planner delegates to parallel nodes
workflow.add_edge("planner", "weather")
workflow.add_edge("planner", "flight")
workflow.add_edge("planner", "hotel")
workflow.add_edge("planner", "restaurant")

# Parallel Fan-In/Join: Parallel nodes gather back at Route Optimization
workflow.add_edge("weather", "route")
workflow.add_edge("flight", "route")
workflow.add_edge("hotel", "route")
workflow.add_edge("restaurant", "route")

# Downstream Sequential pipeline
workflow.add_edge("route", "experience")
workflow.add_edge("experience", "transportation")
workflow.add_edge("transportation", "budget")
workflow.add_edge("budget", "packing")
workflow.add_edge("packing", "visa")
workflow.add_edge("visa", "summary")
workflow.add_edge("summary", END)

# 4. Compile workflow into executable graph
travel_graph = workflow.compile()
