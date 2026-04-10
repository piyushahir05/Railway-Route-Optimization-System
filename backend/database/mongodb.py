"""MongoDB connection module for the Railway Route Optimization backend."""

import logging
import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI")

try:
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI environment variable is not set.")

    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
    except Exception as exc:
        raise RuntimeError(
            "Failed to connect to MongoDB: ping check failed during startup."
        ) from exc

    db = client["railway_network"]
    stations_collection = db["stations"]
    routes_collection = db["routes"]
except Exception:
    logger.exception("Failed to initialize MongoDB connection.")
    raise


def get_db() -> Database:
    """Return the active MongoDB database instance."""
    return db
