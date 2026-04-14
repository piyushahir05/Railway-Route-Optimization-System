"""Standalone integration checks for key API endpoints using urllib."""

import json
import urllib.error
import urllib.request

BASE = "http://localhost:8001"


def get(path):
    try:
        with urllib.request.urlopen(f"{BASE}{path}") as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read())
    except Exception as exc:
        return 0, {"error": str(exc)}


def check(name, status, data, expect_status=200, expect_key=None, expect_value=None):
    ok = status == expect_status
    if expect_key and ok and expect_value is not None:
        ok = data.get(expect_key) == expect_value
    print(f"{'PASS' if ok else 'FAIL'} [{status}] {name}")
    if not ok:
        print(f"       Response: {data}")
    return ok


tests = [
    check("Health check", *get("/health"), 200),
    check("Stations list", *get("/stations"), 200),
    check(
        "Route by distance",
        *get("/route?source=Mumbai&destination=Nagpur&mode=distance"),
        200,
        "found",
        True,
    ),
    check(
        "Route by time",
        *get("/route?source=Mumbai&destination=Nagpur&mode=travel_time"),
        200,
        "found",
        True,
    ),
    check(
        "Route by cost",
        *get("/route?source=Mumbai&destination=Nagpur&mode=ticket_cost"),
        200,
        "found",
        True,
    ),
    check(
        "Alternative routes",
        *get("/routes/alternative?source=Mumbai&destination=Nagpur&mode=distance&k=3"),
        200,
    ),
    check(
        "Simulate with closure",
        *get("/route/simulate?source=Mumbai&destination=Nagpur&mode=distance&closed_stations=Surat"),
        200,
    ),
    check(
        "Same source/destination",
        *get("/route?source=Mumbai&destination=Mumbai&mode=distance"),
        200,
        "found",
        True,
    ),
    check("Invalid station 404", *get("/route?source=FakeCity&destination=Nagpur"), 404),
]

passed = sum(tests)
print(f"\n{passed}/{len(tests)} tests passed")

# Run with: python test_routes.py
