"""Dijkstra shortest-path utilities for weighted railway graphs."""

import heapq
from typing import Optional

Graph = dict[str, dict[str, object]]
VALID_WEIGHT_TYPES = {"distance", "travel_time", "ticket_cost"}


def _extract_weight(edge: object, weight_type: str) -> Optional[float]:
    """Return edge weight, preferring adjusted values and falling back to base values."""
    if isinstance(edge, dict):
        adjusted_key = f"adjusted_{weight_type}"
        weight = edge.get(adjusted_key, edge.get(weight_type))
    else:
        weight = edge if weight_type == "distance" else None

    if weight is None:
        return None
    try:
        return float(weight)
    except (TypeError, ValueError):
        return None


def dijkstra(graph: Graph, start: str, end: str, weight_type: str) -> dict[str, object]:
    """
    Compute the shortest path between two stations using Dijkstra's algorithm.

    Args:
        graph: Adjacency dictionary from graph builder.
        start: Source station name.
        end: Destination station name.
        weight_type: One of distance, travel_time, ticket_cost.

    Returns:
        A result dictionary with route path, total cost, selected weight type,
        and found status, or an error dictionary when input/path is invalid.
    """
    if weight_type not in VALID_WEIGHT_TYPES:
        return {"found": False, "error": f"Invalid weight_type: {weight_type}"}

    if start not in graph:
        return {
            "found": False,
            "path": [],
            "cost": 0,
            "error": f"Station not found: {start}",
        }

    if end not in graph:
        return {
            "found": False,
            "path": [],
            "cost": 0,
            "error": f"Station not found: {end}",
        }

    if start == end:
        return {"found": True, "path": [start], "cost": 0.0, "weight_type": weight_type}

    costs: dict[str, float] = {node: float("inf") for node in graph}
    previous: dict[str, Optional[str]] = {node: None for node in graph}
    visited: set[str] = set()
    costs[start] = 0.0

    priority_queue: list[tuple[float, str]] = [(0.0, start)]

    while priority_queue:
        current_cost, node = heapq.heappop(priority_queue)

        if node in visited:
            continue
        visited.add(node)

        if node == end:
            break

        for neighbor, edge in graph.get(node, {}).items():
            if neighbor in visited:
                continue

            weight = _extract_weight(edge, weight_type)
            if weight is None:
                continue

            tentative_cost = current_cost + weight
            if tentative_cost < costs.get(neighbor, float("inf")):
                costs[neighbor] = tentative_cost
                previous[neighbor] = node
                heapq.heappush(priority_queue, (tentative_cost, neighbor))

    if costs.get(end, float("inf")) == float("inf"):
        return {
            "found": False,
            "path": [],
            "cost": 0,
            "error": f"No path between {start} and {end}",
        }

    path: list[str] = []
    node: Optional[str] = end
    while node is not None:
        path.append(node)
        node = previous.get(node)
    path.reverse()

    if not path or path[0] != start:
        return {
            "found": False,
            "path": [],
            "cost": 0,
            "error": f"No path between {start} and {end}",
        }

    return {
        "path": path,
        "cost": float(costs[end]),
        "weight_type": weight_type,
        "found": True,
    }


def shortest_path(
    graph: dict[str, dict[str, int]], source: str, destination: str
) -> tuple[float, list[str]]:
    """
    Backward-compatible shortest-path helper that returns distance and path tuple.

    This uses `dijkstra` with `weight_type="distance"` and maps not-found cases
    to `(inf, [])` to preserve existing API behavior.
    """
    result = dijkstra(graph=graph, start=source, end=destination, weight_type="distance")
    if not result.get("found", False):
        return float("inf"), []
    return float(result["cost"]), list(result["path"])
