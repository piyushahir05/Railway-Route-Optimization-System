"""
stations_api.py — Station data and graph inspection endpoints.
Exposes GET /stations, /stations/detail, /stations/graph, /stations/state.
"""

from fastapi import APIRouter, HTTPException

from database.mongodb import db
from graph_engine.graph_state import get_graph, get_graph_state

router = APIRouter(prefix="/stations", tags=["Stations"])


def serialize_station(doc: dict) -> dict:
    """Remove MongoDB _id field from a station document before returning to client."""
    doc.pop("_id", None)
    return doc


@router.get("")
def get_stations():
    """Return a sorted list of all station names."""
    try:
        stations = list(db["stations"].find({}, {"station_name": 1, "name": 1, "_id": 0}))
        names = sorted(
            [s.get("station_name") or s.get("name") for s in stations if s.get("station_name") or s.get("name")]
        )
        return {"stations": names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/detail")
def get_station_details():
    """Return full station documents including connections."""
    try:
        stations = list(db["stations"].find({}))
        return {"stations": [serialize_station(s) for s in stations]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# IMPORTANT: Return the full graph dict including adjusted_* fields.
# Do NOT simplify or strip any keys — the frontend depends on the exact structure.
@router.get("/graph")
def get_graph_data():
    """Return the current in-memory adjacency dict (used by frontend D3 visualisation)."""
    graph = get_graph()
    return {"graph": graph, "node_count": len(graph)}


@router.get("/state")
def get_state():
    """Return current simulation state (congestion flag, closed stations, node count)."""
    return get_graph_state()
