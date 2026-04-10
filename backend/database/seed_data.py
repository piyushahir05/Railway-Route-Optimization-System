"""Utilities to seed initial station and route data into MongoDB."""

from database.mongodb import routes_collection, stations_collection


def seed_if_empty() -> None:
    """Insert basic seed data when collections are empty."""
    if stations_collection.count_documents({}) == 0:
        stations_collection.insert_many(
            [
                {"code": "NDLS", "name": "New Delhi", "city": "Delhi"},
                {"code": "BCT", "name": "Mumbai Central", "city": "Mumbai"},
            ]
        )

    if routes_collection.count_documents({}) == 0:
        routes_collection.insert_many(
            [
                {"source": "NDLS", "destination": "BCT", "distance_km": 1384},
                {"source": "BCT", "destination": "NDLS", "distance_km": 1384},
            ]
        )
