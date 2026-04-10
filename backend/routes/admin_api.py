"""Administrative endpoints used for operational backend actions."""

from fastapi import APIRouter

from database.seed_data import seed_if_empty
from graph_engine.graph_state import load_graph

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/seed")
def seed_data() -> dict[str, str]:
    """Seed baseline data and refresh in-memory graph."""
    seed_if_empty()
    load_graph()
    return {"status": "seeded"}
