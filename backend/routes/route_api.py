"""Routing endpoints for best route and simulation route queries."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from graph_engine.build_graph import build_graph
from graph_engine.dijkstra import dijkstra
from graph_engine.graph_state import get_graph

route_router = APIRouter(prefix="/route", tags=["Route"])


@route_router.get("")
async def get_route(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
):
    """Return shortest route using the shared in-memory graph."""
    graph = get_graph()
    if not graph:
        raise HTTPException(status_code=503, detail="Graph not loaded. Check MongoDB connection.")
    result = dijkstra(graph, source, destination, mode)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("error", "Route not found"))
    return {"source": source, "destination": destination, "mode": mode, **result}


@route_router.get("/simulate")
async def simulate_route(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
    closed_stations: list[str] = Query(default=[]),
    use_congestion: bool = False,
):
    """Return route from a temporary graph without mutating global graph state."""
    graph = build_graph(closed_stations=closed_stations, use_congestion=use_congestion)
    result = dijkstra(graph, source, destination, mode)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("error", "Route not found"))
    return {
        "source": source,
        "destination": destination,
        "mode": mode,
        **result,
        "simulation": {
            "closed_stations": closed_stations,
            "congestion_enabled": use_congestion,
        },
    }
