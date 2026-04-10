"""Data model definitions representing station records in persistence."""

from pydantic import BaseModel, Field


class StationModel(BaseModel):
    """Internal station model used for database-level representation."""

    code: str = Field(..., min_length=2, max_length=10)
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
