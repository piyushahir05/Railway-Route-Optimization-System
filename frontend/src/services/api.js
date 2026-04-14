/**
 * HTTP API client for the Railway Route Optimization frontend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001"

/**
 * Makes a JSON HTTP request and normalizes API error handling.
 * @param {string} path
 * @param {RequestInit} [options={}]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }))
    const error = new Error(errorBody.detail || "Request failed")
    error.status = res.status
    throw error
  }
  return res.json()
}

/** Fetches station names. */
export const getStations = () => request("/stations")
/** Fetches full station details. */
export const getStationsDetail = () => request("/stations/detail")
/** Fetches graph data for visualization. */
export const getGraphData = () => request("/stations/graph")
/** Fetches graph simulation state. */
export const getGraphState = () => request("/stations/state")

/**
 * Fetches the best route between two stations.
 * @param {string} source
 * @param {string} destination
 * @param {string} mode
 */
export const getRoute = (source, destination, mode) => {
  const params = new URLSearchParams({ source, destination, mode })
  return request(`/route?${params}`)
}

/**
 * Fetches k alternative routes using Yen's algorithm.
 * @param {string} source
 * @param {string} destination
 * @param {string} mode
 * @param {number} [k=3]
 */
export const getAlternativeRoutes = (source, destination, mode, k = 3) => {
  const params = new URLSearchParams({ source, destination, mode, k })
  return request(`/routes/alternative?${params}`)
}

/**
 * Fetches a temporary route under closures/congestion simulation.
 * @param {string} source
 * @param {string} destination
 * @param {string} mode
 * @param {string[]} [closedStations=[]]
 * @param {boolean} [useCongestion=false]
 */
export const getSimulatedRoute = (
  source,
  destination,
  mode,
  closedStations = [],
  useCongestion = false,
) => {
  const params = new URLSearchParams({ source, destination, mode, use_congestion: useCongestion })
  closedStations.forEach((s) => params.append("closed_stations", s))
  return request(`/route/simulate?${params}`)
}

/**
 * Adds a station.
 * @param {object} stationData
 */
export const addStation = (stationData) =>
  request("/admin/station/add", { method: "POST", body: JSON.stringify(stationData) })

/**
 * Removes a station by name.
 * @param {string} stationName
 */
export const removeStation = (stationName) => {
  const params = new URLSearchParams({ station_name: stationName })
  return request(`/admin/station/remove?${params}`, { method: "DELETE" })
}

/**
 * Updates a connection.
 * @param {object} data
 */
export const updateConnection = (data) =>
  request("/admin/connection/update", { method: "PATCH", body: JSON.stringify(data) })

/**
 * Enables or disables congestion weighting.
 * @param {boolean} enabled
 */
export const setCongestion = (enabled) =>
  request("/admin/simulation/congestion", { method: "POST", body: JSON.stringify({ enabled }) })

/**
 * Sets closed stations for simulation.
 * @param {string[]} stations
 */
export const setClosedStations = (stations) =>
  request("/admin/simulation/close", { method: "POST", body: JSON.stringify({ stations }) })
