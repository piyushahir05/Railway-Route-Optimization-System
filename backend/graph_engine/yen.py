"""Yen's K-shortest loopless paths algorithm built on top of Dijkstra."""

from __future__ import annotations

import copy
import heapq

from graph_engine.dijkstra import dijkstra


def compute_path_cost(graph: dict, path: list[str], weight_type: str) -> float:
    """Return total path cost using adjusted edge weight when available."""
    if len(path) < 2:
        return 0.0
    total = 0.0
    adjusted_key = f"adjusted_{weight_type}"
    for i in range(len(path) - 1):
        edge = graph.get(path[i], {}).get(path[i + 1])
        if not edge:
            return float("inf")
        total += float(edge.get(adjusted_key, edge.get(weight_type, float("inf"))))
    return total


def yen_k_shortest_paths(
    graph: dict,
    source: str,
    destination: str,
    k: int,
    weight_type: str,
) -> list[dict]:
    """Compute up to k shortest loopless paths between source and destination."""
    if source not in graph or destination not in graph or k < 1:
        return []

    first = dijkstra(graph, source, destination, weight_type)
    if not first.get("found"):
        return []

    results: list[dict] = [{"rank": 1, "path": first["path"], "cost": first["cost"]}]
    candidates: list[tuple[float, list[str]]] = []
    seen_candidates: set[tuple[str, ...]] = set()

    for _ in range(1, k):
        last_path = results[-1]["path"]
        for i in range(len(last_path) - 1):
            spur_node = last_path[i]
            root_path = last_path[: i + 1]
            modified_graph = copy.deepcopy(graph)

            for result in results:
                existing_path = result["path"]
                if len(existing_path) > i and existing_path[: i + 1] == root_path:
                    src = existing_path[i]
                    dst = existing_path[i + 1]
                    if src in modified_graph and dst in modified_graph[src]:
                        del modified_graph[src][dst]

            for node in root_path[:-1]:
                modified_graph.pop(node, None)
                for src in list(modified_graph.keys()):
                    modified_graph[src].pop(node, None)

            spur_result = dijkstra(modified_graph, spur_node, destination, weight_type)
            if not spur_result.get("found"):
                continue

            candidate_path = root_path[:-1] + spur_result["path"]
            path_key = tuple(candidate_path)
            if path_key in seen_candidates:
                continue

            candidate_cost = compute_path_cost(graph, candidate_path, weight_type)
            if candidate_cost == float("inf"):
                continue

            seen_candidates.add(path_key)
            heapq.heappush(candidates, (candidate_cost, candidate_path))

        if not candidates:
            break

        cost, path = heapq.heappop(candidates)
        results.append({"rank": len(results) + 1, "path": path, "cost": cost})

    return results
