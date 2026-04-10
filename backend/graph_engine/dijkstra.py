"""Dijkstra shortest-path helper utilities for weighted railway graph traversal."""

import heapq


def shortest_path(
    graph: dict[str, dict[str, int]], source: str, destination: str
) -> tuple[float, list[str]]:
    """Compute shortest path and total distance using Dijkstra's algorithm."""
    if source not in graph or destination not in graph:
        return float("inf"), []

    pq: list[tuple[int, str, list[str]]] = [(0, source, [source])]
    best_distance: dict[str, int] = {source: 0}

    while pq:
        current_distance, node, path = heapq.heappop(pq)

        if node == destination:
            return current_distance, path

        if current_distance > best_distance.get(node, float("inf")):
            continue

        for neighbor, weight in graph.get(node, {}).items():
            distance = current_distance + weight
            if distance < best_distance.get(neighbor, float("inf")):
                best_distance[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor, path + [neighbor]))

    return float("inf"), []
