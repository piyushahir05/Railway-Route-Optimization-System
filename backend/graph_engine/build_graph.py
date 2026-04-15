"""Build and expose in-memory graph structures from MongoDB station data."""

from __future__ import annotations

from database.mongodb import get_db


def build_graph(closed_stations: list[str] = None, use_congestion: bool = False) -> dict:
    """
    Build adjacency dictionary from station documents with optional simulation flags.

    This version ensures the railway network behaves as an UNDIRECTED graph,
    meaning every connection A → B automatically also becomes B → A.
    """

    if closed_stations is None:
        closed_stations = []

    closed_set = set(closed_stations)
    graph: dict = {}

    try:
        stations = get_db()["stations"].find({})

        for station in stations:
            station_name = station.get("station_name")

            if not station_name or station_name in closed_set:
                continue

            # Ensure node exists
            if station_name not in graph:
                graph[station_name] = {}

            for connection in station.get("connections", []):
                destination = connection.get("destination")

                if not destination or destination in closed_set:
                    continue

                distance = float(connection.get("distance", 0))
                travel_time = float(connection.get("travel_time", 0))
                ticket_cost = float(connection.get("ticket_cost", 0))
                congestion_factor = float(connection.get("congestion_factor", 1.0))

                factor = congestion_factor if use_congestion else 1.0

                edge_data = {
                    "distance": distance,
                    "travel_time": travel_time,
                    "ticket_cost": ticket_cost,
                    "congestion_factor": congestion_factor,
                    "adjusted_distance": distance * factor,
                    "adjusted_travel_time": travel_time * factor,
                    "adjusted_ticket_cost": ticket_cost * factor,
                }

                # Forward edge
                graph[station_name][destination] = edge_data

                # Reverse edge (critical fix 🚆)
                if destination not in graph:
                    graph[destination] = {}

                graph[destination][station_name] = edge_data

    except Exception as exc:
        print(f"Failed to build graph from MongoDB: {exc}")
        return {}

    return graph


def get_station_coordinates() -> dict:
    """
    Return station coordinates as:
    {station_name: (latitude, longitude)}

    Used for heuristic-based algorithms like A*.
    """

    coordinates: dict = {}

    try:
        for station in get_db()["stations"].find(
            {}, {"station_name": 1, "latitude": 1, "longitude": 1}
        ):
            name = station.get("station_name")

            if name:
                coordinates[name] = (
                    station.get("latitude", 0.0),
                    station.get("longitude", 0.0),
                )

    except Exception as exc:
        print(f"Failed to fetch station coordinates: {exc}")
        return {}

    return coordinates