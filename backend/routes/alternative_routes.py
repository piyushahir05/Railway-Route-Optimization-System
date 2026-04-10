"""Endpoints exposing alternative route options for a source-destination query."""

from fastapi import APIRouter

from graph_engine.graph_state import get_graph
from graph_engine.yen import k_shortest_paths

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/alternatives")
def get_alternative_routes(source: str, destination: str, k: int = 3) -> dict[str, object]:
    """Return alternative route candidates between two station codes."""
    graph = get_graph()
    alternatives = k_shortest_paths(graph, source, destination, k)
    return {"source": source, "destination": destination, "alternatives": alternatives}
