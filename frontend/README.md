# Railway Route Optimization System - Frontend

A modern, fully functional React frontend for the Railway Route Optimization System with route finding, alternative routes, simulations, and admin capabilities.

## Features

- **Route Finder**: Find optimal routes between stations with multiple optimization modes (distance, travel time, ticket cost)
- **Alternative Routes**: Discover K-shortest paths using Yen's algorithm
- **Simulate Routes**: Test route finding with closed stations and congestion factors
- **Network Visualization**: Interactive D3.js visualization of the railway network
- **Admin Panel**: Manage stations, connections, and simulation parameters
- **Responsive Design**: Beautiful Tailwind CSS UI that works on all devices

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Data fetching and caching
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **D3.js** - Network visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (optional):
```bash
VITE_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

Make sure the FastAPI backend is running on `http://localhost:8000`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts      # Axios instance configuration
│   │   └── services.ts    # API service functions
│   ├── components/
│   │   ├── Navbar.tsx     # Navigation bar
│   │   ├── RouteCard.tsx  # Route display component
│   │   ├── StationSelector.tsx  # Station selection dropdown
│   │   └── ModeSelector.tsx     # Optimization mode selector
│   ├── pages/
│   │   ├── RouteFinder.tsx      # Main route finding page
│   │   ├── AlternativeRoutes.tsx # Alternative routes page
│   │   ├── Simulate.tsx         # Route simulation page
│   │   ├── Visualization.tsx    # Network visualization page
│   │   └── Admin.tsx            # Admin management panel
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints

The frontend communicates with these backend endpoints:

### Routes
- `GET /route` - Find shortest route
- `GET /route/simulate` - Simulate route with parameters

### Alternative Routes
- `GET /routes/alternative` - Find K-shortest paths

### Stations
- `GET /stations` - Get list of stations
- `GET /stations/detail` - Get detailed station info
- `GET /stations/graph` - Get network graph
- `GET /stations/state` - Get current simulation state

### Admin
- `POST /admin/station/add` - Add new station
- `DELETE /admin/station/remove` - Remove station
- `PATCH /admin/connection/update` - Update connection metrics
- `POST /admin/simulation/congestion` - Toggle congestion

### Health
- `GET /health` - Health check
- `GET /` - API root info

## Usage

### Finding Routes
1. Navigate to "Route Finder"
2. Select source and destination stations
3. Choose optimization mode (distance, travel time, or cost)
4. Click "Find Route"

### Exploring Alternatives
1. Go to "Alternatives"
2. Select stations
3. Set number of routes to find (1-5)
4. View multiple optimal paths

### Simulating Scenarios
1. Visit "Simulate"
2. Select stations
3. Optionally close stations or enable congestion
4. See how routes change with these conditions

### Viewing Network
1. Click "Visualization"
2. Interactive D3 graph of entire railway network
3. Drag nodes to rearrange

### Managing System
1. Access "Admin" panel
2. Add/remove stations
3. Update route metrics
4. Toggle congestion simulation

## Configuration

The frontend connects to the backend via the API URL specified in:
1. Environment variable `VITE_API_URL`
2. Default: `http://localhost:8000`
3. Vite proxy configuration in `vite.config.ts`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Query caching with React Query
- Lazy loading of components
- Optimized bundle size with tree-shaking
- D3 visualization optimization

## Error Handling

- User-friendly error messages
- Automatic retry on network failures
- Form validation
- Loading states
- Health check integration

## Contributing

1. Follow TypeScript strict mode requirements
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Keep styles consistent with Tailwind design

## License

Same as the Railway Route Optimization System backend.
