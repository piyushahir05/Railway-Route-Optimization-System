"""API schemas for station request and response payloads."""

from pydantic import BaseModel, Field


class StationSchema(BaseModel):
    """Public station schema used in API responses and requests."""

    code: str = Field(..., min_length=2, max_length=10)
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
