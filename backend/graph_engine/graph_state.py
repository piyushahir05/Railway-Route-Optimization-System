"""Shared in-memory graph state for routing operations."""

import threading

from graph_engine.build_graph import build_graph

_lock = threading.Lock()
_graph: dict[str, dict[str, dict[str, float]]] = {}
_use_congestion: bool = False
_closed_stations: list[str] = []
_state_version: int = 0


def _capture_state() -> tuple[int, bool, list[str]]:
    """Capture a consistent snapshot of reload settings under lock."""
    with _lock:
        return _state_version, _use_congestion, list(_closed_stations)


def _apply_graph_if_current(version: int, new_graph: dict[str, dict[str, dict[str, float]]]) -> None:
    """Swap graph only if no newer state update has occurred."""
    global _graph
    with _lock:
        if version == _state_version:
            _graph = new_graph


def load_graph() -> None:
    """Rebuild the graph from MongoDB and replace the in-memory graph atomically."""
    version, use_congestion, closed_stations = _capture_state()
    new_graph = build_graph(
        closed_stations=closed_stations,
        use_congestion=use_congestion,
    )
    _apply_graph_if_current(version, new_graph)


def get_graph() -> dict[str, dict[str, dict[str, float]]]:
    """Return a reference to the current in-memory graph."""
    with _lock:
        return _graph


def set_congestion(enabled: bool) -> None:
    """Toggle congestion weighting behavior and reload the in-memory graph."""
    global _use_congestion, _state_version
    with _lock:
        _use_congestion = enabled
        _state_version += 1
    load_graph()


def set_closed_stations(stations: list[str]) -> None:
    """Update closed stations and reload the graph with the new station closures."""
    global _closed_stations, _state_version
    with _lock:
        _closed_stations = list(stations)
        _state_version += 1
    load_graph()


def reload_graph() -> None:
    """Force a full graph reload from MongoDB."""
    global _state_version
    with _lock:
        _state_version += 1
    load_graph()


def get_graph_state() -> dict[str, object]:
    """Return the active graph simulation settings and current node count."""
    with _lock:
        return {
            "use_congestion": _use_congestion,
            "closed_stations": list(_closed_stations),
            "total_nodes": len(_graph),
        }
