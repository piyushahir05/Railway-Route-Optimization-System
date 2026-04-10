"""Primary route optimization endpoints for shortest route queries."""

import math

from fastapi import APIRouter, HTTPException, Query

from graph_engine.dijkstra import shortest_path
from graph_engine.graph_state import get_graph

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/shortest")
def get_shortest_route(
    source: str = Query(..., min_length=2, max_length=10),
    destination: str = Query(..., min_length=2, max_length=10),
) -> dict[str, object]:
    """Return the shortest route between two station codes."""
    graph = get_graph()
    source = source.upper()
    destination = destination.upper()

    if source not in graph:
        raise HTTPException(status_code=404, detail=f"Source station '{source}' not found")
    if destination not in graph:
        raise HTTPException(status_code=404, detail=f"Destination station '{destination}' not found")

    distance, path = shortest_path(graph, source, destination)
    if math.isinf(distance) or not path:
        raise HTTPException(status_code=404, detail="No route found between the selected stations")

    return {"source": source, "destination": destination, "path": path, "distance_km": distance}
