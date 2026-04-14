"""Pydantic schemas for station CRUD and connection updates."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ConnectionSchema(BaseModel):
    """Schema for one directed connection between two stations."""

    destination: str
    distance: float = Field(gt=0, description="Distance in km")
    travel_time: float = Field(gt=0, description="Travel time in minutes")
    ticket_cost: float = Field(gt=0, description="Ticket cost in INR")
    congestion_factor: float = Field(default=1.0, ge=0.5, le=20.0)


class StationSchema(BaseModel):
    """Schema for station creation and persisted station documents."""

    station_name: str = Field(min_length=1, max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    connections: list[ConnectionSchema] = Field(default=[])


class StationUpdateSchema(BaseModel):
    """Schema for updating one source->destination connection."""

    source: str
    destination: str
    distance: Optional[float] = Field(default=None, gt=0)
    travel_time: Optional[float] = Field(default=None, gt=0)
    ticket_cost: Optional[float] = Field(default=None, gt=0)
    congestion_factor: Optional[float] = Field(default=None, ge=0.5, le=20.0)

    model_config = ConfigDict(extra="forbid")
