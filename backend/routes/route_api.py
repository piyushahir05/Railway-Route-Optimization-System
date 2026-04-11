"""
route_api.py — Shortest path route endpoints.
Exposes GET /route and GET /route/simulate.
"""

from typing import List, Literal

from fastapi import APIRouter, HTTPException, Query

from graph_engine.build_graph import build_graph
from graph_engine.dijkstra import dijkstra
from graph_engine.graph_state import get_graph

router = APIRouter(prefix="/route", tags=["Route"])


@router.get("")
def get_route(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
):
    """Return the shortest path between two stations using the global graph."""
    graph = get_graph()
    if not graph:
        raise HTTPException(
            status_code=503, detail="Graph not loaded. Check MongoDB connection."
        )

    result = dijkstra(graph, source, destination, mode)

    # NOTE: Do NOT add a duplicate source==destination check here.
    # dijkstra() already handles it and returns {"found": True, "path": [source], "cost": 0.0}.
    # Duplicating this logic here risks diverging behaviour.

    if not result.get("found"):
        raise HTTPException(
            status_code=404, detail=result.get("error", "Route not found")
        )

    return {"source": source, "destination": destination, "mode": mode, **result}


@router.get("/simulate")
def simulate_route(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
    closed_stations: List[str] = Query(default=[]),
    use_congestion: bool = False,
):
    """Return the shortest path on a temporary graph with simulation parameters applied."""
    # Build a TEMPORARY graph — do NOT call set_closed_stations or set_congestion.
    # Global graph state must remain unchanged.
    temp_graph = build_graph(
        closed_stations=closed_stations, use_congestion=use_congestion
    )

    if not temp_graph:
        raise HTTPException(
            status_code=503, detail="Graph build failed. Check MongoDB connection."
        )

    result = dijkstra(temp_graph, source, destination, mode)

    if not result.get("found"):
        raise HTTPException(
            status_code=404, detail=result.get("error", "Route not found")
        )

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
