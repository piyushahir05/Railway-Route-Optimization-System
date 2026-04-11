"""Seed sample Indian railway network station data into MongoDB."""

# python -m database.seed_data   (from backend/ directory)

from database.mongodb import db
from pymongo.errors import PyMongoError
from schemas.station_schema import StationSchema


def _network_data() -> tuple[dict[str, tuple[float, float]], list[tuple[str, str, int, int, int, float]]]:
    """Return station coordinates and edge definitions for the seed network."""
    stations = {
        "Mumbai": (19.0760, 72.8777),
        "Pune": (18.5204, 73.8567),
        "Nashik": (19.9975, 73.7898),
        "Surat": (21.1702, 72.8311),
        "Ahmedabad": (23.0225, 72.5714),
        "Vadodara": (22.3072, 73.1812),
        "Nagpur": (21.1458, 79.0882),
        "Aurangabad": (19.8762, 75.3433),
    }

    # (source, destination, distance, travel_time, ticket_cost, congestion_factor)
    edges = [
        ("Mumbai", "Pune", 149, 180, 250, 1.2),
        ("Mumbai", "Nashik", 167, 210, 280, 1.0),
        ("Mumbai", "Surat", 263, 240, 350, 1.3),
        ("Pune", "Aurangabad", 235, 270, 300, 0.9),
        ("Nashik", "Aurangabad", 110, 140, 180, 0.8),
        ("Nashik", "Surat", 215, 200, 270, 1.0),
        ("Surat", "Vadodara", 130, 120, 160, 1.1),
        ("Vadodara", "Ahmedabad", 111, 100, 140, 1.4),
        ("Aurangabad", "Nagpur", 230, 270, 290, 0.9),
        ("Nagpur", "Vadodara", 576, 540, 650, 1.0),
    ]
    return stations, edges


def _build_station_documents() -> list[dict]:
    """Build station documents with canonical field names matching StationSchema."""
    stations, edges = _network_data()
    station_docs: dict[str, dict] = {
        name: {
            "station_name": name,
            "latitude": coordinates[0],
            "longitude": coordinates[1],
            "connections": [],
        }
        for name, coordinates in stations.items()
    }

    for source, destination, distance, travel_time, ticket_cost, congestion_factor in edges:
        forward = {
            "destination": destination,
            "distance": distance,
            "travel_time": travel_time,
            "ticket_cost": ticket_cost,
            "congestion_factor": congestion_factor,
        }
        reverse = {
            "destination": source,
            "distance": distance,
            "travel_time": travel_time,
            "ticket_cost": ticket_cost,
            "congestion_factor": congestion_factor,
        }
        station_docs[source]["connections"].append(forward)
        station_docs[destination]["connections"].append(reverse)

    return list(station_docs.values())


def main() -> None:
    """Drop, validate, and insert station seed data."""
    stations_collection = db["stations"]
    stations_collection.drop()
    print("Dropped existing 'stations' collection.")

    station_docs = _build_station_documents()
    validated_docs: list[dict] = []

    for station in station_docs:
        validated_station = StationSchema.model_validate(station)
        validated_docs.append(validated_station.model_dump())
        print(f"Validated station: {validated_station.station_name}")

    try:
        stations_collection.insert_many(validated_docs)
    except PyMongoError as exc:
        raise RuntimeError(f"Failed to insert station seed data into MongoDB: {exc}") from exc
    print(f"Inserted {len(validated_docs)} stations into 'stations' collection.")


def verify() -> None:
    """Print count and station names currently in the collection."""
    stations_collection = db["stations"]
    count = stations_collection.count_documents({})
    print(f"Verification: {count} station documents found.")
    for station in stations_collection.find({}, {"_id": 0, "station_name": 1}).sort("station_name", 1):
        print(f"- {station['station_name']}")


if __name__ == "__main__":
    main()
    verify()
