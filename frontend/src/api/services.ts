import apiClient from './client';

export interface Connection {
  destination: string;
  distance: number;
  travel_time: number;
  ticket_cost: number;
  congestion_factor?: number;
}

export interface Station {
  station_name: string;
  latitude: number;
  longitude: number;
  connections: Connection[];
}

export interface RouteResult {
  source: string;
  destination: string;
  mode: 'distance' | 'travel_time' | 'ticket_cost';
  found: boolean;
  path: string[];
  cost: number;
}

export interface AlternativeRoutesResult {
  source: string;
  destination: string;
  mode: 'distance' | 'travel_time' | 'ticket_cost';
  k_requested: number;
  k_found: number;
  routes: Array<{
    path: string[];
    cost: number;
  }>;
}

export interface GraphState {
  congestion_enabled: boolean;
  closed_stations: string[];
  node_count: number;
}

// Route APIs
export const getRoute = (
  source: string,
  destination: string,
  mode: 'distance' | 'travel_time' | 'ticket_cost' = 'distance'
) => apiClient.get<RouteResult>('/route', {
  params: { source, destination, mode },
});

export const simulateRoute = (
  source: string,
  destination: string,
  mode: 'distance' | 'travel_time' | 'ticket_cost' = 'distance',
  closedStations: string[] = [],
  useCongestion: boolean = false
) => apiClient.get<RouteResult & { simulation: { closed_stations: string[]; congestion_enabled: boolean } }>('/route/simulate', {
  params: {
    source,
    destination,
    mode,
    closed_stations: closedStations,
    use_congestion: useCongestion,
  },
});

// Alternative Routes APIs
export const getAlternativeRoutes = (
  source: string,
  destination: string,
  mode: 'distance' | 'travel_time' | 'ticket_cost' = 'distance',
  k: number = 3
) => apiClient.get<AlternativeRoutesResult>('/routes/alternative', {
  params: { source, destination, mode, k },
});

// Stations APIs
export const getStations = () => apiClient.get<{ stations: string[] }>('/stations');

export const getStationDetails = () =>
  apiClient.get<{ stations: Station[] }>('/stations/detail');

export const getGraphData = () =>
  apiClient.get<{ graph: Record<string, Connection[]>; node_count: number }>(
    '/stations/graph'
  );

export const getGraphState = () =>
  apiClient.get<GraphState>('/stations/state');

// Admin APIs
export const addStation = (station: Station) =>
  apiClient.post('/admin/station/add', station);

export const removeStation = (stationName: string) =>
  apiClient.delete('/admin/station/remove', {
    params: { station_name: stationName },
  });

export const updateConnection = (
  source: string,
  destination: string,
  distance?: number,
  travelTime?: number,
  ticketCost?: number,
  congestionFactor?: number
) =>
  apiClient.patch('/admin/connection/update', {
    source,
    destination,
    distance,
    travel_time: travelTime,
    ticket_cost: ticketCost,
    congestion_factor: congestionFactor,
  });

export const toggleCongestion = (enabled: boolean) =>
  apiClient.post('/admin/simulation/congestion', { enabled });

// Health Check
export const healthCheck = () =>
  apiClient.get<{ status: string; graph_nodes: number }>('/health');
