"""Yen's K-shortest paths algorithm utilities for alternative route generation."""

from graph_engine.dijkstra import shortest_path


def k_shortest_paths(
    graph: dict[str, dict[str, int]], source: str, destination: str, k: int = 3
) -> list[dict[str, object]]:
    """Return up to k route options (base implementation returns the shortest route)."""
    distance, path = shortest_path(graph, source, destination)
    if not path:
        return []

    return [
        {
            "path": path,
            "distance_km": distance,
        }
    ][: max(k, 0)]
