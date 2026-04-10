"""Helpers to build in-memory graph structures from station documents."""

import logging

from database.mongodb import db
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)


def build_graph(closed_stations: list[str] = None, use_congestion: bool = False) -> dict:
    """
    Build an adjacency dictionary from MongoDB station documents.

    Args:
        closed_stations: Station names to exclude from the graph.
        use_congestion: Whether adjusted metrics should include congestion factor.

    Returns:
        A nested adjacency dictionary keyed as graph[source][destination], where each
        edge stores distance, travel time, ticket cost, congestion factor, and adjusted
        values for each metric. Referenced destination stations are initialized in the
        graph even before their own station document is processed. Returns an empty
        dictionary if station data cannot be fetched.
    """
    if closed_stations is None:
        closed_stations = []

    closed_set = set(closed_stations)
    graph: dict[str, dict[str, dict[str, float]]] = {}

    try:
        station_docs = list(db["stations"].find({}, {"_id": 0}))
    except PyMongoError:
        logger.exception("Failed to fetch stations while building graph.")
        return {}

    for station in station_docs:
        station_name = station.get("station_name") or station.get("name")
        if not station_name or station_name in closed_set:
            continue

        graph.setdefault(station_name, {})

        for connection in station.get("connections", []):
            destination = connection.get("destination") or connection.get("to")
            if not destination or destination in closed_set:
                continue

            try:
                distance = float(connection.get("distance", 0))
                travel_time = float(
                    connection.get("travel_time", connection.get("time", 0))
                )
                ticket_cost = float(
                    connection.get("ticket_cost", connection.get("cost", 0))
                )
                congestion_factor = float(
                    connection.get("congestion_factor", connection.get("congestion", 1.0))
                )
            except (TypeError, ValueError):
                continue

            factor = congestion_factor if use_congestion else 1.0

            graph[station_name][destination] = {
                "distance": distance,
                "travel_time": travel_time,
                "ticket_cost": ticket_cost,
                "congestion_factor": congestion_factor,
                "adjusted_distance": distance * factor,
                "adjusted_travel_time": travel_time * factor,
                "adjusted_ticket_cost": ticket_cost * factor,
            }
            graph.setdefault(destination, {})

    return graph


def get_station_coordinates() -> dict:
    """
    Build a station-to-coordinates lookup table for heuristic functions.

    Returns:
        A dictionary in the format {station_name: (latitude, longitude)}.
        Returns an empty dictionary if station data cannot be fetched.
    """
    try:
        station_docs = list(
            db["stations"].find({}, {"_id": 0, "station_name": 1, "name": 1, "latitude": 1, "longitude": 1})
        )
    except PyMongoError:
        logger.exception("Failed to fetch stations while building coordinate lookup.")
        return {}

    coordinates: dict[str, tuple[float, float]] = {}
    for station in station_docs:
        station_name = station.get("station_name") or station.get("name")
        latitude = station.get("latitude")
        longitude = station.get("longitude")
        if station_name is None or latitude is None or longitude is None:
            continue

        try:
            coordinates[str(station_name)] = (float(latitude), float(longitude))
        except (TypeError, ValueError):
            continue

    return coordinates
