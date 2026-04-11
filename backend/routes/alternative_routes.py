"""
alternative_routes.py — Yen's K-shortest paths endpoint.
Exposes GET /routes/alternative.
"""

from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from graph_engine.graph_state import get_graph
from graph_engine.yen import yen_k_shortest_paths

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("/alternative")
def get_alternative_routes(
    source: str,
    destination: str,
    mode: Literal["distance", "travel_time", "ticket_cost"] = "distance",
    k: int = Query(default=3, ge=1, le=5),
):
    """Return up to K alternative shortest paths between two stations."""
    graph = get_graph()
    if not graph:
        raise HTTPException(
            status_code=503, detail="Graph not loaded. Check MongoDB connection."
        )

    results = yen_k_shortest_paths(graph, source, destination, k, mode)

    if not results:
        # This covers: invalid station names, no path exists, or graph too small for k paths.
        raise HTTPException(
            status_code=404,
            detail=f"No routes found between {source} and {destination}",
        )

    return {
        "source": source,
        "destination": destination,
        "mode": mode,
        "k_requested": k,
        "k_found": len(results),  # may be less than k if fewer paths exist
        "routes": results,
    }
