"""MongoDB client setup and database access helpers for the backend."""

import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

client = MongoClient(MONGODB_URI)
db = client["railway_route_optimization"]
stations_collection = db["stations"]
routes_collection = db["routes"]
