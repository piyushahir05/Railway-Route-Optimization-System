"""MongoDB connection module for the railway network database."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

client = None
db = None


def _connect():
    global client, db
    if client is not None:
        return
    try:
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tls=True
        )
        client.admin.command("ping")
        db = client["railway_network"]
    except Exception as exc:
        import logging
        logging.error(f"MongoDB connection failed: {exc}")
        raise RuntimeError("Failed to connect to MongoDB. Check MONGODB_URI and server status.") from exc


def get_db():
    """Return the MongoDB database instance."""
    if db is None:
        _connect()
    return db
