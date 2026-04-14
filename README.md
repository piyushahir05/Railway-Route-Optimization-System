# DSM Project — Railway Route Optimization

A full-stack web app for planning railway journeys using graph algorithms.  
It provides optimal and alternative routes by **distance**, **travel time**, or **ticket cost**, plus simulation tools for congestion and station closures.

## Features

- Shortest-path routing with **Dijkstra's Algorithm**
- Alternative route discovery with **Yen’s K-Shortest Paths** (top-k)
- Route simulation with:
  - temporary station closures
  - congestion-aware weights
- Interactive frontend with graph visualization
- Admin panel for station/connection management

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, D3.js
- **Backend:** FastAPI, Pydantic
- **Database:** MongoDB

## Repository Structure

```text
DSM-project/
├─ frontend/   # React + Vite UI
└─ backend/    # FastAPI API + graph engine + MongoDB integration
```

## Prerequisites

- Node.js (18+ recommended) and npm
- Python 3.10+
- MongoDB instance (local or cloud)

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017
ENVIRONMENT=development
```

You can copy from:

`backend/.env.example`

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8001
```

You can copy from:

`frontend/.env.example`

## Setup & Run

### 1) Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate
pip install -r requirements.txt
```

Windows venv activation:

- CMD: `.venv\Scripts\activate.bat`
- PowerShell: `.venv\Scripts\Activate.ps1`

Optional: seed sample data

```bash
python -m database.seed_data
```

Run API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

API docs: `http://localhost:8001/docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

App URL (default): `http://localhost:5173`

## Key API Endpoints

- `GET /health` — service/graph health
- `GET /stations` — station names
- `GET /stations/detail` — full station data
- `GET /stations/graph` — graph payload for visualization
- `GET /route` — best route by selected mode
- `GET /route/simulate` — route under temporary simulation settings
- `GET /routes/alternative` — top-k alternative routes
- `POST /admin/station/add` — add station
- `DELETE /admin/station/remove` — remove station
- `PATCH /admin/connection/update` — update connection metrics
- `POST /admin/simulation/congestion` — toggle congestion simulation
- `POST /admin/simulation/close` — set closed stations

## Testing / Validation

- Frontend lint: `npm run lint`
- Frontend build: `npm run build`
- Backend integration script (requires running API):  
  `python backend/test_routes.py`

## Notes

- CORS origins are configured in `backend/main.py` (`allow_origins`); add your frontend origin there (e.g., `http://localhost:5173` or `http://localhost:5174`).
- Admin routes are intended for trusted/internal usage and should be protected before production deployment.
