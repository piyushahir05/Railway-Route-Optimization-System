"""Seed script for inserting sample Indian railway stations into MongoDB."""

# Run from backend/ directory:
#   python -m database.seed_data
# Requires MONGODB_URI set in .env

from __future__ import annotations

from pydantic import ValidationError

from database.mongodb import db
from schemas.station_schema import StationSchema


def build_station_data() -> list[dict]:
    """Return the station seed payload with bidirectional connections."""
    stations = {
        "Mumbai": {"latitude": 19.0760, "longitude": 72.8777},
        "Pune": {"latitude": 18.5204, "longitude": 73.8567},
        "Nashik": {"latitude": 19.9975, "longitude": 73.7898},
        "Surat": {"latitude": 21.1702, "longitude": 72.8311},
        "Ahmedabad": {"latitude": 23.0225, "longitude": 72.5714},
        "Vadodara": {"latitude": 22.3072, "longitude": 73.1812},
        "Nagpur": {"latitude": 21.1458, "longitude": 79.0882},
        "Aurangabad": {"latitude": 19.8762, "longitude": 75.3433},
    }
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

    documents = {
        name: {"station_name": name, **coords, "connections": []}
        for name, coords in stations.items()
    }
    for src, dst, distance, travel_time, ticket_cost, congestion_factor in edges:
        forward = {
            "destination": dst,
            "distance": distance,
            "travel_time": travel_time,
            "ticket_cost": ticket_cost,
            "congestion_factor": congestion_factor,
        }
        reverse = {**forward, "destination": src}
        documents[src]["connections"].append(forward)
        documents[dst]["connections"].append(reverse)
    return list(documents.values())


def main() -> None:
    """Drop and seed stations collection with validated sample records."""
    stations_col = db["stations"]
    count = stations_col.count_documents({})
    if count > 0:
        confirm = input(f"{count} stations already exist. Re-seed? (yes/no): ")
        if confirm.lower() != "yes":
            print("Seed cancelled.")
            return

    payload = build_station_data()
    validated_payload = []
    for station in payload:
        try:
            validated = StationSchema.model_validate(station)
            validated_payload.append(validated.model_dump())
        except ValidationError as exc:
            print(f"Validation failed for {station.get('station_name', 'unknown')}: {exc}")
            return

    stations_col.drop()
    stations_col.insert_many(validated_payload)

    for station in validated_payload:
        print(f"Inserted: {station['station_name']}")


def verify() -> None:
    """Print inserted document count and station names for quick verification."""
    stations_col = db["stations"]
    count = stations_col.count_documents({})
    print(f"Total stations in collection: {count}")
    for doc in stations_col.find({}, {"station_name": 1, "_id": 0}).sort("station_name", 1):
        print(f"- {doc['station_name']}")


if __name__ == "__main__":
    main()
    verify()
