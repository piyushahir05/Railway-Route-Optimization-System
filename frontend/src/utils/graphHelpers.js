/**
 * Converts the adjacency dict from the API into D3-compatible nodes and links.
 * De-duplicates bidirectional edges (A->B and B->A become one link).
 *
 * @param {Object} graphData
 * @param {Array} stationsDetail
 * @returns {{ nodes: Array, links: Array }}
 */
export function convertGraphToD3(graphData, stationsDetail = []) {
  if (!graphData) return { nodes: [], links: [] }

  const coordMap = {}
  stationsDetail.forEach((s) => {
    coordMap[s.station_name] = { lat: s.latitude, lng: s.longitude }
  })

  const nodes = Object.keys(graphData).map((name) => ({
    id: name,
    lat: coordMap[name]?.lat ?? 0,
    lng: coordMap[name]?.lng ?? 0,
  }))

  const seen = new Set()
  const links = []
  Object.entries(graphData).forEach(([source, targets]) => {
    Object.entries(targets).forEach(([target, weights]) => {
      const key = [source, target].sort().join("--")
      if (!seen.has(key)) {
        seen.add(key)
        links.push({ source, target, ...weights })
      }
    })
  })

  return { nodes, links }
}

/**
 * Returns highlighted edge keys from a consecutive path.
 * @param {string[]} path
 * @returns {Set<string>}
 */
export function getHighlightedLinkKeys(path) {
  const pairSet = new Set()
  for (let i = 0; i < path.length - 1; i++) {
    pairSet.add([path[i], path[i + 1]].sort().join("--"))
  }
  return pairSet
}

/**
 * Formats a numeric cost value based on mode.
 * @param {number} cost
 * @param {string} mode
 * @returns {string}
 */
export function formatCost(cost, mode) {
  if (mode === "distance") return `${cost.toFixed(1)} km`
  if (mode === "travel_time") {
    const h = Math.floor(cost / 60)
    const m = Math.round(cost % 60)
    return h > 0 ? `${h}h ${m}m` : `${m} min`
  }
  if (mode === "ticket_cost") return `\u20B9${cost.toFixed(0)}`
  return String(cost)
}

/**
 * Returns human-readable mode label.
 * @param {string} mode
 * @returns {string}
 */
export function getModeLabel(mode) {
  const labels = {
    distance: "Shortest Distance",
    travel_time: "Fastest Route",
    ticket_cost: "Cheapest Fare",
  }
  return labels[mode] ?? mode
}
