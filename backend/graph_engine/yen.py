"""Yen's K-shortest paths algorithm utilities for alternative route generation."""

import copy
import heapq
from typing import Optional

from graph_engine.dijkstra import dijkstra

Graph = dict[str, dict[str, object]]


def _extract_weight(edge: object, weight_type: str) -> Optional[float]:
    """Extract a numeric edge weight, preferring adjusted metrics when available."""
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


def compute_path_cost(graph: Graph, path: list[str], weight_type: str) -> float:
    """
    Compute the total path cost across consecutive edges in the original graph.

    Args:
        graph: Original adjacency dictionary.
        path: Ordered station sequence representing a route.
        weight_type: Metric key to evaluate (distance, travel_time, ticket_cost).

    Returns:
        The total cost as float. Returns infinity if any required edge or
        edge weight is missing.
    """
    if not path:
        return float("inf")
    if len(path) == 1:
        return 0.0

    total_cost = 0.0
    for start, end in zip(path, path[1:]):
        adjacency = graph.get(start)
        if not isinstance(adjacency, dict):
            return float("inf")
        edge = adjacency.get(end)
        if edge is None:
            return float("inf")

        weight = _extract_weight(edge, weight_type)
        if weight is None:
            return float("inf")
        total_cost += weight

    return total_cost


def yen_k_shortest_paths(
    graph: Graph,
    source: str,
    destination: str,
    k: int,
    weight_type: str,
) -> list[dict[str, object]]:
    """
    Compute up to K loopless shortest paths between two stations using Yen's algorithm.

    Args:
        graph: Adjacency dictionary of the railway network.
        source: Source station key.
        destination: Destination station key.
        k: Maximum number of route options to return.
        weight_type: Edge metric key used for optimization.

    Returns:
        A ranked list in the format:
        [{"rank": 1, "path": [...], "cost": ...}, ...]
        Returns an empty list when inputs are invalid or no path exists.
    """
    if k <= 0 or source not in graph or destination not in graph:
        return []

    first_result = dijkstra(graph, source, destination, weight_type)
    if not first_result.get("found", False):
        return []

    first_path = list(first_result.get("path", []))
    if not first_path:
        return []

    first_cost = compute_path_cost(graph, first_path, weight_type)
    if first_cost == float("inf"):
        return []

    results_paths: list[list[str]] = [first_path]
    results_seen: set[tuple[str, ...]] = {tuple(first_path)}
    results: list[dict[str, object]] = [
        {"rank": 1, "path": first_path, "cost": float(first_cost)}
    ]

    candidates: list[tuple[float, list[str]]] = []
    candidate_seen: set[tuple[str, ...]] = set()

    for _ in range(k - 1):
        previous_path = results_paths[-1]

        for i in range(len(previous_path) - 1):
            spur_node = previous_path[i]
            root_path = previous_path[: i + 1]
            modified_graph = copy.deepcopy(graph)

            for result_path in results_paths:
                if len(result_path) > i and result_path[: i + 1] == root_path:
                    from_node = result_path[i]
                    to_node = result_path[i + 1]
                    if isinstance(modified_graph.get(from_node), dict):
                        modified_graph[from_node].pop(to_node, None)

            removed_nodes = set(root_path[:-1])
            for node in removed_nodes:
                modified_graph.pop(node, None)

            for node, adjacency in modified_graph.items():
                if not isinstance(adjacency, dict):
                    continue
                for removed in removed_nodes:
                    adjacency.pop(removed, None)

            spur_result = dijkstra(modified_graph, spur_node, destination, weight_type)
            if not spur_result.get("found", False):
                continue

            spur_path = list(spur_result.get("path", []))
            if not spur_path:
                continue

            candidate_path = root_path[:-1] + spur_path
            candidate_key = tuple(candidate_path)
            if candidate_key in candidate_seen or candidate_key in results_seen:
                continue

            candidate_cost = compute_path_cost(graph, candidate_path, weight_type)
            if candidate_cost == float("inf"):
                continue

            heapq.heappush(candidates, (candidate_cost, candidate_path))
            candidate_seen.add(candidate_key)

        if not candidates:
            break

        while candidates:
            candidate_cost, candidate_path = heapq.heappop(candidates)
            candidate_key = tuple(candidate_path)
            candidate_seen.discard(candidate_key)
            if candidate_key in results_seen:
                continue

            results_paths.append(candidate_path)
            results_seen.add(candidate_key)
            results.append(
                {
                    "rank": len(results_paths),
                    "path": candidate_path,
                    "cost": float(candidate_cost),
                }
            )
            break
        else:
            break

    return results


def k_shortest_paths(
    graph: Graph, source: str, destination: str, k: int = 3
) -> list[dict[str, object]]:
    """
    Backward-compatible helper that returns distance-based alternatives.

    Args:
        graph: Adjacency dictionary.
        source: Source station key.
        destination: Destination station key.
        k: Maximum routes to return.

    Returns:
        Legacy route format with distance_km for existing API callers.
    """
    ranked_paths = yen_k_shortest_paths(
        graph=graph,
        source=source,
        destination=destination,
        k=k,
        weight_type="distance",
    )
    return [{"path": item["path"], "distance_km": item["cost"]} for item in ranked_paths]
