"""
admin_api.py — Admin endpoints for station management and simulation control.
TODO: Add API key or JWT authentication before deploying to production.
All endpoints here are currently unprotected.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db
from graph_engine.graph_state import (
    get_graph,
    reload_graph,
    set_closed_stations,
    set_congestion,
)
from schemas.station_schema import StationSchema, StationUpdateSchema

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/station/add")
def add_station(body: StationSchema):
    """Add a new station to MongoDB and reload the in-memory graph."""
    if db["stations"].find_one({"station_name": body.station_name}):
        raise HTTPException(
            status_code=409, detail=f"Station '{body.station_name}' already exists"
        )
    db["stations"].insert_one(body.model_dump())
    reload_graph()  # MUST reload — do not skip
    return {"message": f"Station {body.station_name} added", "station": body.station_name}


@router.delete("/station/remove")
def remove_station(station_name: str):
    """Remove a station from MongoDB, clean up references, and reload the graph."""
    if not db["stations"].find_one({"station_name": station_name}):
        raise HTTPException(
            status_code=404, detail=f"Station '{station_name}' not found"
        )
    db["stations"].delete_one({"station_name": station_name})
    # Remove this station from all other stations' connections arrays
    db["stations"].update_many(
        {"connections.destination": station_name},
        {"$pull": {"connections": {"destination": station_name}}},
    )
    reload_graph()  # MUST reload — do not skip
    return {"message": f"Station {station_name} removed"}


@router.patch("/connection/update")
def update_connection(body: StationUpdateSchema):
    """Update edge metrics for an existing connection between two stations."""
    station = db["stations"].find_one({"station_name": body.source})
    if not station:
        raise HTTPException(
            status_code=404, detail=f"Source station '{body.source}' not found"
        )

    connection_exists = any(
        c["destination"] == body.destination for c in station.get("connections", [])
    )
    if not connection_exists:
        raise HTTPException(
            status_code=404,
            detail=f"Connection from '{body.source}' to '{body.destination}' not found",
        )

    update_fields = {}
    if body.distance is not None:
        update_fields["connections.$.distance"] = body.distance
    if body.travel_time is not None:
        update_fields["connections.$.travel_time"] = body.travel_time
    if body.ticket_cost is not None:
        update_fields["connections.$.ticket_cost"] = body.ticket_cost
    if body.congestion_factor is not None:
        update_fields["connections.$.congestion_factor"] = body.congestion_factor

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    db["stations"].update_one(
        {"station_name": body.source, "connections.destination": body.destination},
        {"$set": update_fields},
    )
    reload_graph()  # MUST reload — do not skip
    return {"message": "Connection updated"}


class CongestionToggle(BaseModel):
    """Request body for toggling congestion simulation."""

    enabled: bool


@router.post("/simulation/congestion")
def toggle_congestion(body: CongestionToggle):
    """Toggle congestion factor weighting in the in-memory graph."""
    set_congestion(body.enabled)
    return {"message": "Congestion updated", "enabled": body.enabled}


class StationCloseBody(BaseModel):
    """Request body for closing/reopening stations."""

    stations: list[str]


@router.post("/simulation/close")
def close_stations(body: StationCloseBody):
    """Set which stations are closed and reload the graph without those nodes."""
    graph = get_graph()
    # Validate all station names exist in the current graph before closing
    invalid = [s for s in body.stations if s not in graph]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"The following stations do not exist in the graph: {invalid}",
        )
    set_closed_stations(body.stations)
    return {"message": "Closed stations updated", "closed": body.stations}
