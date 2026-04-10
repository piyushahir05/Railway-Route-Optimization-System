"""Station management endpoints for listing and creating station records."""

from fastapi import APIRouter

from database.mongodb import stations_collection

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get("")
def list_stations() -> dict[str, object]:
    """Return all known stations from MongoDB."""
    stations = list(stations_collection.find({}, {"_id": 0}))
    return {"stations": stations}
