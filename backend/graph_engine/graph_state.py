"""Shared in-memory graph state for route queries and simulation toggles."""

import threading

from graph_engine.build_graph import build_graph

_lock = threading.Lock()
Graph = dict[str, dict[str, dict[str, float]]]

_graph: Graph = {}
_use_congestion: bool = False
_closed_stations: list[str] = []


def load_graph() -> None:
    """Rebuild graph from MongoDB and store in the shared in-memory graph."""
    global _graph
    with _lock:
        closed_stations = list(_closed_stations)
        use_congestion = _use_congestion

    new_graph = build_graph(
        closed_stations=closed_stations,
        use_congestion=use_congestion,
    )
    with _lock:
        _graph = new_graph


def get_graph() -> Graph:
    """Return a reference to the current in-memory graph."""
    with _lock:
        return _graph


def set_congestion(enabled: bool) -> None:
    """Toggle congestion weighting in graph edges and trigger a graph reload."""
    global _use_congestion
    with _lock:
        _use_congestion = enabled
    load_graph()


def set_closed_stations(stations: list[str]) -> None:
    """Update the closed-station list and trigger a graph reload."""
    global _closed_stations
    with _lock:
        _closed_stations = list(stations)
    load_graph()


def reload_graph() -> None:
    """Force a full graph reload from MongoDB after admin mutations."""
    load_graph()


def get_graph_state() -> dict[str, object]:
    """Return the current simulation settings and in-memory graph node count."""
    with _lock:
        return {
            "use_congestion": _use_congestion,
            "closed_stations": list(_closed_stations),
            "total_nodes": len(_graph),
        }
