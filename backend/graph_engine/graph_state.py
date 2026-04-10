"""State container for storing and accessing the in-memory graph instance."""

from graph_engine.build_graph import build_graph

_GRAPH: dict[str, dict[str, int]] = {}


def load_graph() -> None:
    """Load or refresh the global in-memory graph state."""
    global _GRAPH
    _GRAPH = build_graph()


def get_graph() -> dict[str, dict[str, int]]:
    """Return the current in-memory graph."""
    return _GRAPH
