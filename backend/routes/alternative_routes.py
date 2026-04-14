"""Endpoints for querying alternative shortest paths using Yen's algorithm."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from graph_engine.graph_state import get_graph
from graph_engine.yen import yen_k_shortest_paths

alternative_router = APIRouter(prefix="/routes", tags=["Routes"])


@alternative_router.get("/alternative")
async def get_alternative_routes(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
    k: int = Query(default=3, ge=1, le=5),
):
    """Return up to k alternative shortest routes between two stations."""
    graph = get_graph()
    if not graph:
        raise HTTPException(status_code=503, detail="Graph not loaded")
    routes = yen_k_shortest_paths(graph, source, destination, k, mode)
    if not routes:
        raise HTTPException(status_code=404, detail=f"No routes found between {source} and {destination}")
    return {
        "source": source,
        "destination": destination,
        "mode": mode,
        "k_requested": k,
        "k_found": len(routes),
        "routes": routes,
    }
