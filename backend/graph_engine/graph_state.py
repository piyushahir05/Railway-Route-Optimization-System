"""Thread-safe shared state for the in-memory railway graph."""

from __future__ import annotations

import threading

from graph_engine.build_graph import build_graph

_lock = threading.Lock()
_graph: dict = {}
_use_congestion: bool = False
_closed_stations: list[str] = []


def load_graph() -> None:
    """Rebuild graph from MongoDB and store in _graph. Thread-safe."""
    global _graph
    new_graph = build_graph(closed_stations=_closed_stations, use_congestion=_use_congestion)
    with _lock:
        _graph = new_graph


def get_graph() -> dict:
    """Return a reference to the current in-memory graph."""
    with _lock:
        return _graph


def set_congestion(enabled: bool) -> None:
    """Toggle congestion weighting and reload graph."""
    global _use_congestion
    _use_congestion = enabled
    load_graph()


def set_closed_stations(stations: list[str]) -> None:
    """Update closed stations list and reload graph."""
    global _closed_stations
    _closed_stations = list(stations)
    load_graph()


def reload_graph() -> None:
    """Force a full graph reload from MongoDB. Called after admin mutations."""
    load_graph()


def get_graph_state() -> dict:
    """Return current simulation state for status endpoints."""
    return {
        "use_congestion": _use_congestion,
        "closed_stations": _closed_stations,
        "total_nodes": len(_graph),
    }
