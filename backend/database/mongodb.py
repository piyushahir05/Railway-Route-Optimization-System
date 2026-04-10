"""MongoDB connection module for the Railway Route Optimization backend."""

import logging
import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()
logger = logging.getLogger(__name__)

try:
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI environment variable is not set.")

    client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
    except Exception as exc:
        raise RuntimeError(
            "Failed to connect to MongoDB: ping check failed during startup."
        ) from exc

    db = client["railway_network"]
except Exception:
    logger.exception("Failed to initialize MongoDB connection.")
    raise

stations_collection = db["stations"]
routes_collection = db["routes"]


def get_db() -> Database:
    """Return the active MongoDB database instance."""
    return db
