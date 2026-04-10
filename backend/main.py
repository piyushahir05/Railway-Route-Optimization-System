"""FastAPI application entrypoint for the Railway Route Optimization API."""

from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from graph_engine.graph_state import get_graph
from routes.admin_api import router as admin_router
from routes.alternative_routes import router as alternative_routes_router
from routes.route_api import router as route_router
from routes.stations_api import router as stations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown lifecycle operations."""
    from graph_engine.graph_state import load_graph

    load_graph()
    print("In-memory graph loaded")
    yield

    from database.mongodb import client

    client.close()
    print("MongoDB connection closed")


app = FastAPI(
    title="Railway Route Optimization API",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    # Restrict this to the real frontend domain(s) in production.
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(route_router)
app.include_router(alternative_routes_router)
app.include_router(stations_router)
app.include_router(admin_router)


@app.get("/")
def root() -> dict[str, str]:
    """Return API root metadata."""
    return {"message": "Railway API", "docs": "/docs"}


@app.get("/health")
def health_check() -> dict[str, object]:
    """Return service health and current in-memory graph node count."""
    return {"status": "ok", "graph_nodes": len(get_graph())}
