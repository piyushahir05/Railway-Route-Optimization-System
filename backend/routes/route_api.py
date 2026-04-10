"""Primary route optimization endpoints for shortest route queries."""

from fastapi import APIRouter

from graph_engine.dijkstra import shortest_path
from graph_engine.graph_state import get_graph

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/shortest")
def get_shortest_route(source: str, destination: str) -> dict[str, object]:
    """Return the shortest route between two station codes."""
    graph = get_graph()
    distance, path = shortest_path(graph, source, destination)
    return {"source": source, "destination": destination, "path": path, "distance_km": distance}
