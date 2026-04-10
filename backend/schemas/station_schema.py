"""Pydantic schemas for station entities and connection updates."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ConnectionSchema(BaseModel):
    """Schema representing a directed connection from one station to another."""

    destination: str
    distance: float = Field(gt=0, description="Distance in km")
    travel_time: float = Field(gt=0, description="Travel time in minutes")
    ticket_cost: float = Field(gt=0, description="Ticket cost in INR")
    congestion_factor: float = Field(default=1.0, ge=0.5, le=3.0)


class ConnectionSchema(BaseModel):
    """Schema for a directed edge from one station to another."""

    to: str = Field(..., min_length=1)
    distance: int = Field(..., gt=0)
    time: int = Field(..., gt=0)
    cost: int = Field(..., gt=0)
    congestion: float = Field(..., gt=0)


class StationSchema(BaseModel):
    """Schema representing station details and all outgoing connections."""

    station_name: str = Field(min_length=1, max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    connections: list[ConnectionSchema] = Field(default=[])


class StationUpdateSchema(BaseModel):
    """Schema for updating route metrics between two connected stations."""

    source: str
    destination: str
    distance: Optional[float] = Field(default=None, gt=0)
    travel_time: Optional[float] = Field(default=None, gt=0)
    ticket_cost: Optional[float] = Field(default=None, gt=0)
    congestion_factor: Optional[float] = Field(default=None, ge=0.5, le=3.0)

    code: str | None = Field(default=None, min_length=2, max_length=10)
    name: str = Field(..., min_length=1)
    city: str | None = Field(default=None, min_length=1)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    connections: list[ConnectionSchema] = Field(default_factory=list)
