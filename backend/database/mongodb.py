"""MongoDB connection module for the railway network database."""

from __future__ import annotations

import logging
import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = None
db = None


def _connect():
    global client, db
    if client is not None:
        return

    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise ValueError(
            "MONGODB_URI environment variable is not set. "
            "Check your .env file or Render environment variables."
        )

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client["railway_network"]
        logging.info("MongoDB connection successful")
    except Exception as exc:
        logging.error(f"MongoDB connection failed: {exc}")
        logging.error(
            "Continuing without MongoDB. "
            "Graph engine will work, but admin operations will fail."
        )


def get_db():
    """Return the MongoDB database instance."""
    if db is None:
        _connect()
    return db