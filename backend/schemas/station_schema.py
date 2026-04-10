"""API schemas for station request and response payloads."""

from pydantic import BaseModel, Field


class ConnectionSchema(BaseModel):
    """Schema for a directed edge from one station to another."""

    to: str = Field(..., min_length=1)
    distance: int = Field(..., gt=0)
    time: int = Field(..., gt=0)
    cost: int = Field(..., gt=0)
    congestion: float = Field(..., gt=0)


class StationSchema(BaseModel):
    """Public station schema used in API responses and requests."""

    code: str | None = Field(default=None, min_length=2, max_length=10)
    name: str = Field(..., min_length=1)
    city: str | None = Field(default=None, min_length=1)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    connections: list[ConnectionSchema] = Field(default_factory=list)
