"""Dataclass models for station data and route connection details."""

from dataclasses import dataclass


@dataclass
class StationModel:
    """Represents a station with coordinates and connected destination metadata."""

    station_name: str
    latitude: float
    longitude: float
    connections: list[dict]
