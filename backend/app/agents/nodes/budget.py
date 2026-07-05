from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from app.agents.nodes.planner import get_llm
from app.agents.state import TravelPlannerState
from app.services.external_apis import get_exchange_rates

def budget_node(state: TravelPlannerState) -> Dict[str, Any]:
    """
    Budget Agent: Employs Exchange Rate API to perform currency conversions.
    """
    budget = state.get("budget", 2000)
    currency = state.get("currency", "USD")
    flights = state.get("flight_options", {})
    hotels = state.get("hotel_options", {})

    flight_cost = flights.get("estimated_cost", budget * 0.3)
    hotel_cost = hotels.get("estimated_cost", budget * 0.4)
    daily_spending = (budget - (flight_cost + hotel_cost)) / 5

    # Fetch conversions
    rates = get_exchange_rates()
    conversion_rate = rates.get(currency, 1.0)
    usd_value = budget / conversion_rate if conversion_rate else budget

    llm = get_llm()
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are the Financial Budget Agent for TripGenie AI. "
                           "Review the budget and currency metrics, explaining the exchange value against USD, "
                           "and check cost estimates. User-facing summaries only."),
                ("user", "Budget: {budget} {currency} (approx {usd:.2f} USD)\nRates: {rates}\nFlight Est: {flight}\nStay Est: {hotel}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "budget": budget,
                "currency": currency,
                "usd": usd_value,
                "rates": str({"USD/EUR": rates.get("EUR"), "USD/GBP": rates.get("GBP"), "USD/JPY": rates.get("JPY")}),
                "flight": flight_cost,
                "hotel": hotel_cost
            })
            return {
                "budget_analysis": {
                    "total_budget": budget,
                    "currency": currency,
                    "analysis_summary": res.content,
                    "usd_equivalent": usd_value,
                    "breakdown": {
                        "transportation": flight_cost,
                        "accommodation": hotel_cost,
                        "remaining_daily": max(daily_spending, 0.0)
                    }
                }
            }
        except Exception:
            pass

    summary = (
        f"Budget Review ({budget} {currency} / approx {usd_value:.1f} USD): "
        f"Flight quota: {currency} {flight_cost:.2f}, Stay quota: {currency} {hotel_cost:.2f}. "
        f"Exchange rates loaded: 1 USD = {conversion_rate:.4f} {currency}."
    )
    return {
        "budget_analysis": {
            "total_budget": budget,
            "currency": currency,
            "analysis_summary": summary,
            "usd_equivalent": usd_value,
            "breakdown": {
                "transportation": flight_cost,
                "accommodation": hotel_cost,
                "remaining_daily": max(daily_spending, 0.0)
            }
        }
    }
