"""Helpers to build the in-memory railway graph from persistent route data."""

from database.mongodb import routes_collection


def build_graph() -> dict[str, dict[str, int]]:
    """Build an adjacency map keyed by station code."""
    graph: dict[str, dict[str, int]] = {}

    for route in routes_collection.find({}, {"_id": 0}):
        source = route.get("source")
        destination = route.get("destination")
        distance = int(route.get("distance_km", 0))

        if not source or not destination:
            continue

        graph.setdefault(source, {})[destination] = distance
        graph.setdefault(destination, {})

    return graph
