"""Station and graph inspection endpoints for the frontend application."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from database.mongodb import get_db
from graph_engine.graph_state import get_graph, get_graph_state

stations_router = APIRouter(prefix="/stations", tags=["Stations"])


def serialize_station(doc: dict) -> dict:
    """Remove MongoDB object id field from a station document."""
    doc.pop("_id", None)
    return doc


@stations_router.get("")
async def get_stations():
    """Return alphabetically sorted station names from MongoDB."""
    try:
        cursor = get_db()["stations"].find({}, {"station_name": 1, "_id": 0})
        names = sorted([doc["station_name"] for doc in cursor if doc.get("station_name")])
        return {"stations": names}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc


@stations_router.get("/detail")
async def get_station_details():
    """Return full station documents without MongoDB object ids."""
    try:
        stations = [serialize_station(doc) for doc in get_db()["stations"].find({})]
        return {"stations": stations}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc


@stations_router.get("/graph")
async def get_graph_view():
    """Return current in-memory graph for visualization."""
    graph = get_graph()
    return {"graph": graph, "node_count": len(graph)}


@stations_router.get("/state")
async def get_simulation_state():
    """Return current simulation state as maintained by graph_state."""
    return get_graph_state()
