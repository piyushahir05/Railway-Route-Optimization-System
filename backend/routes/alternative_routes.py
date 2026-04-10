"""Endpoints exposing alternative route options for a source-destination query."""

from fastapi import APIRouter, Query

from graph_engine.graph_state import get_graph
from graph_engine.yen import k_shortest_paths

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/alternatives")
def get_alternative_routes(
    source: str = Query(..., min_length=2, max_length=10),
    destination: str = Query(..., min_length=2, max_length=10),
    k: int = Query(default=3, ge=1, le=10),
) -> dict[str, object]:
    """Return alternative route candidates between two station codes."""
    graph = get_graph()
    source = source.upper()
    destination = destination.upper()
    alternatives = k_shortest_paths(graph, source, destination, k)
    return {"source": source, "destination": destination, "alternatives": alternatives}
