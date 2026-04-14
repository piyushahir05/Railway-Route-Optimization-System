"""Dataclass model representing a railway station document."""

from dataclasses import dataclass


@dataclass
class StationModel:
    """Internal station model with outgoing weighted connections."""

    station_name: str
    latitude: float
    longitude: float
    connections: list[dict]
