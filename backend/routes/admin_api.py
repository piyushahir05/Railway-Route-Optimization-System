"""Administrative endpoints for station CRUD and simulation controls."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.mongodb import db
from graph_engine.graph_state import get_graph, reload_graph, set_closed_stations, set_congestion
from schemas.station_schema import StationSchema, StationUpdateSchema

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# TODO: Add API key or JWT authentication before deploying to production.


class CongestionToggle(BaseModel):
    """Request body schema for congestion toggle."""

    enabled: bool


class StationCloseBody(BaseModel):
    """Request body schema for temporary station closures."""

    stations: list[str]


@admin_router.post("/station/add")
async def add_station(body: StationSchema):
    """Create a new station document and refresh the in-memory graph."""
    existing = db["stations"].find_one({"station_name": body.station_name})
    if existing:
        raise HTTPException(status_code=409, detail=f"Station already exists: {body.station_name}")
    db["stations"].insert_one(body.model_dump())
    reload_graph()
    return {"message": f"Station {body.station_name} added", "station": body.station_name}


@admin_router.delete("/station/remove")
async def remove_station(station_name: str):
    """Delete a station and remove all inbound references to it."""
    existing = db["stations"].find_one({"station_name": station_name})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Station not found: {station_name}")

    db["stations"].delete_one({"station_name": station_name})
    db["stations"].update_many(
        {"connections.destination": station_name},
        {"$pull": {"connections": {"destination": station_name}}},
    )
    reload_graph()
    return {"message": f"Station {station_name} removed"}


@admin_router.patch("/connection/update")
async def update_connection(body: StationUpdateSchema):
    """Patch one source->destination connection with provided non-empty fields."""
    source_station = db["stations"].find_one({"station_name": body.source})
    if not source_station:
        raise HTTPException(status_code=404, detail=f"Source station not found: {body.source}")

    target_connection = db["stations"].find_one(
        {"station_name": body.source, "connections.destination": body.destination}
    )
    if not target_connection:
        raise HTTPException(status_code=404, detail=f"Connection not found: {body.source} -> {body.destination}")

    update_fields: dict = {}
    if body.distance is not None:
        update_fields["connections.$.distance"] = body.distance
    if body.travel_time is not None:
        update_fields["connections.$.travel_time"] = body.travel_time
    if body.ticket_cost is not None:
        update_fields["connections.$.ticket_cost"] = body.ticket_cost
    if body.congestion_factor is not None:
        update_fields["connections.$.congestion_factor"] = body.congestion_factor

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    db["stations"].update_one(
        {"station_name": body.source, "connections.destination": body.destination},
        {"$set": update_fields},
    )
    reload_graph()
    return {"message": "Connection updated"}


@admin_router.post("/simulation/congestion")
async def toggle_congestion(body: CongestionToggle):
    """Enable or disable congestion-aware weighting in routing."""
    set_congestion(body.enabled)
    return {"message": "Congestion updated", "enabled": body.enabled}


@admin_router.post("/simulation/close")
async def close_stations(body: StationCloseBody):
    """Set closed stations for simulation after validating station names."""
    available = set(get_graph().keys())
    invalid = [name for name in body.stations if name not in available]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid stations: {invalid}")
    set_closed_stations(body.stations)
    return {"message": "Closed stations updated", "closed": body.stations}
