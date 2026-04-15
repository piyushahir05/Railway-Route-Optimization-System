"""FastAPI application entrypoint for the Railway Route Optimization backend."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.admin_api import admin_router
from routes.alternative_routes import alternative_router
from routes.route_api import route_router
from routes.stations_api import stations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown lifecycle operations."""
    from graph_engine.graph_state import load_graph
    from database.mongodb import _connect, client

    # Initialize MongoDB connection
    _connect()
    print("MongoDB connection established")

    load_graph()
    print("In-memory graph loaded")
    yield

    if client is not None:
        client.close()
        print("MongoDB connection closed")


app = FastAPI(title="Railway Route Optimization API", version="1.0.0", lifespan=lifespan)

# Configure CORS with environment-aware origins
import os

cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://railway-route-optimization-system-cyan.vercel.app",
]

# Add production frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")
if frontend_url and frontend_url not in cors_origins:
    cors_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Add slowapi or similar rate limiting on /route and /routes/alternative
# TODO: Restrict CORS allow_origins to your actual frontend domain
# TODO: Add API key middleware for /admin/* routes
# TODO: Set up structured logging (replace print statements with logging module)

app.include_router(route_router)
app.include_router(alternative_router)
app.include_router(stations_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    """Root metadata endpoint."""
    return {"message": "Railway API", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint with current graph state."""
    from graph_engine.graph_state import get_graph_state

    state = get_graph_state()
    return {"status": "ok", **state}


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
