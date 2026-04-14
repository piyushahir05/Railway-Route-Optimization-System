"""Dijkstra shortest-path implementation for weighted railway graphs."""

from __future__ import annotations

import heapq
from typing import Optional


def dijkstra(graph: dict, start: str, end: str, weight_type: str) -> dict:
    """Compute shortest path between two stations for a selected weight type."""
    valid_weight_types = ["distance", "travel_time", "ticket_cost"]
    if weight_type not in valid_weight_types:
        return {"found": False, "error": f"Invalid weight_type: {weight_type}"}
    if start not in graph:
        return {"found": False, "path": [], "cost": 0, "error": f"Station not found: {start}"}
    if end not in graph:
        return {"found": False, "path": [], "cost": 0, "error": f"Station not found: {end}"}
    if start == end:
        return {"found": True, "path": [start], "cost": 0.0, "weight_type": weight_type}

    costs = {node: float("inf") for node in graph}
    previous: dict[str, Optional[str]] = {node: None for node in graph}
    visited: set[str] = set()
    costs[start] = 0.0

    pq: list[tuple[float, str]] = [(0.0, start)]

    while pq:
        current_cost, node = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)

        if node == end:
            break

        for neighbor, edge in graph.get(node, {}).items():
            if neighbor not in graph:
                continue
            adjusted_key = f"adjusted_{weight_type}"
            edge_weight = float(edge.get(adjusted_key, edge.get(weight_type, float("inf"))))
            new_cost = current_cost + edge_weight
            if new_cost < costs[neighbor]:
                costs[neighbor] = new_cost
                previous[neighbor] = node
                heapq.heappush(pq, (new_cost, neighbor))

    if costs[end] == float("inf"):
        return {"found": False, "path": [], "cost": 0, "error": f"No path between {start} and {end}"}

    path = []
    cursor: Optional[str] = end
    while cursor is not None:
        path.append(cursor)
        cursor = previous[cursor]
    path.reverse()

    return {"path": path, "cost": costs[end], "weight_type": weight_type, "found": True}
