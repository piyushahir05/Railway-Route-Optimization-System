import { useEffect, useMemo, useRef, useState } from "react"
import {
  addStation, getGraphData, getGraphState, getStations,
  removeStation, setClosedStations, setCongestion, updateConnection,
} from "../services/api"

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("add")
  const [feedback, setFeedback]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [allStations, setAllStations] = useState([])
  const [graphData, setGraphData] = useState(null)
  const [state, setState]         = useState(null)
  const timeoutRef = useRef(null)

  const [addForm, setAddForm] = useState({ stationName: "", latitude: "", longitude: "", connections: [] })
  const [removeName, setRemoveName] = useState("")
  const [updateForm, setUpdateForm] = useState({ source: "", destination: "", distance: "", travel_time: "", ticket_cost: "", congestion_factor: "" })
  const [closedSelection, setClosedSelection] = useState([])

  const showFeedback = (type, message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setFeedback({ type, message })
    timeoutRef.current = setTimeout(() => setFeedback(null), 5000)
  }

  const refreshStations = async () => {
    const s = await getStations()
    setAllStations(s.stations || [])
    const g = await getGraphData()
    setGraphData(g.graph || {})
  }

  useEffect(() => { refreshStations().catch(e => showFeedback("error", e.message)) }, [])
  useEffect(() => {
    if (activeTab === "simulation")
      getGraphState().then(setState).catch(e => showFeedback("error", e.message))
  }, [activeTab])

  const sourceConnections = useMemo(() => {
    if (!graphData || !updateForm.source) return []
    return Object.keys(graphData[updateForm.source] || {})
  }, [graphData, updateForm.source])

  const handleAddStation = async (e) => {
    e.preventDefault()
    if (!addForm.stationName || addForm.connections.length === 0)
      return showFeedback("error", "Provide station name and at least one connection.")
    const lat = Number(addForm.latitude), lng = Number(addForm.longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180)
      return showFeedback("error", "Invalid latitude/longitude.")
    setLoading(true)
    try {
      await addStation({
        station_name: addForm.stationName, latitude: lat, longitude: lng,
        connections: addForm.connections.map(c => ({
          ...c,
          distance: Number(c.distance), travel_time: Number(c.travel_time),
          ticket_cost: Number(c.ticket_cost), congestion_factor: Number(c.congestion_factor || 1),
        })),
      })
      showFeedback("success", "Station added successfully.")
      setAddForm({ stationName: "", latitude: "", longitude: "", connections: [] })
      await refreshStations()
    } catch (err) { showFeedback("error", err.message) }
    finally { setLoading(false) }
  }

  const handleUpdateConnection = async (e) => {
    e.preventDefault()
    const payload = { source: updateForm.source, destination: updateForm.destination }
    ;["distance", "travel_time", "ticket_cost", "congestion_factor"].forEach(k => {
      if (updateForm[k] !== "") payload[k] = Number(updateForm[k])
    })
    setLoading(true)
    try {
      await updateConnection(payload)
      showFeedback("success", "Connection updated.")
      await refreshStations()
    } catch (err) { showFeedback("error", err.message) }
    finally { setLoading(false) }
  }

  // ── Shared class shorthands ──────────────────────────────────────────────
  const input = "w-full px-3.5 py-2.5 rounded-xl text-sm font-light text-rail-text placeholder:text-rail-dim bg-white/4 border border-white/10 outline-none focus:border-rail-accent focus:ring-2 focus:ring-rail-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  const label = "block text-[11px] font-medium tracking-widest uppercase text-rail-accent/70 mb-1.5"
  const field = "mb-5"
  const btnPrimary = "px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] text-white shadow-lg shadow-blue-900/30 hover:brightness-110 hover:-translate-y-px active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"

  const TABS = [
    { id: "add",        label: "Add Station"       },
    { id: "remove",     label: "Remove"            },
    { id: "update",     label: "Update Connection" },
    { id: "simulation", label: "Live Simulation"   },
  ]

  const fieldLabel = (key) => key.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")

  return (
    <div className="min-h-screen bg-rail-bg text-rail-text font-body pt-24">

      {/* Aurora + noise */}
      <div className="aurora">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <div className="noise" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-20 flex flex-col gap-6">

        {/* ── Header ── */}
        <header className="fade-up-1 flex items-center gap-5 p-7 rounded-2xl bg-rail-surface border border-rail-border backdrop-blur-xl">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-rail-accent/10 flex items-center justify-center text-rail-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white">Railway Network Admin Panel</h1>
            <p className="text-rail-muted text-sm font-light mt-1">Add, remove, or modify stations and simulate network events.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rail-accent/30 bg-rail-accent/8 text-rail-accent text-[11px] font-medium tracking-widest uppercase">
            <span className="pill-dot w-1.5 h-1.5 rounded-full bg-rail-accent" />
            Live
          </div>
        </header>

        {/* ── Tabs ── */}
        <nav className="fade-up-2 flex gap-1 p-1.5 rounded-full bg-white/2 border border-rail-border backdrop-blur-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer
                ${activeTab === tab.id
                  ? "bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] text-white shadow-lg shadow-blue-900/30"
                  : "text-rail-muted hover:text-rail-accent hover:bg-rail-accent/8"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Panel ── */}
        <section className="fade-up-3 p-10 rounded-3xl bg-rail-surface border border-rail-border backdrop-blur-xl min-h-[460px]">

          {/* ADD */}
          {activeTab === "add" && (
            <form onSubmit={handleAddStation} className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-12">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Basic Information</h3>
                <p className="text-rail-muted text-sm font-light leading-relaxed mb-7">Define the station's attributes. Geolocation must be within valid limits.</p>
                <div className={field}>
                  <label className={label}>Station Name</label>
                  <input type="text" className={input} placeholder="e.g. Pune Central"
                    value={addForm.stationName}
                    onChange={e => setAddForm({ ...addForm, stationName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["latitude", "longitude"].map(f => (
                    <div key={f} className={field}>
                      <label className={label}>{fieldLabel(f)}</label>
                      <input type="number" step="any" className={input} placeholder={f === "latitude" ? "18.52" : "73.85"}
                        value={addForm[f]}
                        onChange={e => setAddForm({ ...addForm, [f]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-1">Connections</h3>
                    <p className="text-rail-muted text-sm font-light">At least one required.</p>
                  </div>
                  <button type="button"
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-rail-accent/25 bg-rail-accent/8 text-rail-accent hover:bg-rail-accent/15 transition-all cursor-pointer"
                    onClick={() => setAddForm({ ...addForm, connections: [...addForm.connections, { destination: "", distance: "", travel_time: "", ticket_cost: "", congestion_factor: "" }] })}>
                    + Add
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {addForm.connections.map((c, i) => (
                    <div key={i} className="relative p-5 rounded-2xl bg-white/2 border border-dashed border-white/10 hover:border-rail-accent/25 transition-all">
                      <button type="button"
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-rail-dim hover:text-rail-danger hover:bg-white/5 transition-all cursor-pointer text-lg leading-none"
                        onClick={() => setAddForm({ ...addForm, connections: addForm.connections.filter((_, idx) => idx !== i) })}>
                        ×
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className={label}>Destination</label>
                          <select className="rail-dropdown" value={c.destination}
                            onChange={e => { const n = [...addForm.connections]; n[i].destination = e.target.value; setAddForm({ ...addForm, connections: n }) }}>
                            <option value="">Choose…</option>
                            {allStations.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={label}>Distance</label>
                          <input type="number" step="any" className={input} placeholder="km"
                            value={c.distance || ""}
                            onChange={e => { const n = [...addForm.connections]; n[i].distance = e.target.value; setAddForm({ ...addForm, connections: n }) }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {["travel_time", "ticket_cost", "congestion_factor"].map(f => (
                          <div key={f}>
                            <label className={label}>{fieldLabel(f)}</label>
                            <input type="number" step="any" className={input} placeholder={f === "congestion_factor" ? "1.0" : ""}
                              value={c[f] || ""}
                              onChange={e => { const n = [...addForm.connections]; n[i][f] = e.target.value; setAddForm({ ...addForm, connections: n }) }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-white/6 flex justify-end">
                  <button type="submit" disabled={loading} className={btnPrimary}>
                    {loading ? "Processing…" : "Add Station →"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REMOVE */}
          {activeTab === "remove" && (
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rail-danger/10 border border-rail-danger/20 flex items-center justify-center text-2xl">⚠</div>
              <h3 className="font-display text-2xl font-black text-white mb-3">Station Decommissioning</h3>
              <p className="text-rail-muted text-sm font-light leading-relaxed mb-8">
                Permanently removes the node and all surrounding edges from the graph. This action is irreversible.
              </p>
              <div className={`${field} text-left`}>
                <label className={label}>Select Station</label>
                <select className="rail-dropdown" value={removeName} onChange={e => setRemoveName(e.target.value)}>
                  <option value="">Choose a station…</option>
                  {allStations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                disabled={!removeName || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-rail-danger/30 bg-rail-danger/10 text-rail-danger hover:bg-rail-danger/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                onClick={async () => {
                  setLoading(true)
                  try { await removeStation(removeName); showFeedback("success", "Station removed."); setRemoveName(""); await refreshStations() }
                  catch (e) { showFeedback("error", e.message) }
                  finally { setLoading(false) }
                }}>
                Permanently Decommission
              </button>
            </div>
          )}

          {/* UPDATE */}
          {activeTab === "update" && (
            <form onSubmit={handleUpdateConnection} className="max-w-2xl mx-auto">
              <div className="mb-8 pb-6 border-b border-white/6">
                <h3 className="font-display text-xl font-bold text-white mb-2">Edge Weight Adjustment</h3>
                <p className="text-rail-muted text-sm font-light leading-relaxed">Modify cost parameters for an existing connection.</p>
              </div>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className={field}>
                  <label className={label}>Source Station</label>
                  <select className="rail-dropdown" value={updateForm.source}
                    onChange={e => setUpdateForm({ ...updateForm, source: e.target.value, destination: "" })}>
                    <option value="">Select source…</option>
                    {allStations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={field}>
                  <label className={label}>Destination Station</label>
                  <select className="rail-dropdown" disabled={!updateForm.source} value={updateForm.destination}
                    onChange={e => setUpdateForm({ ...updateForm, destination: e.target.value })}>
                    <option value="">Select destination…</option>
                    {sourceConnections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6 rounded-2xl bg-white/2 border border-dashed border-white/8">
                {["distance", "travel_time", "ticket_cost", "congestion_factor"].map(f => (
                  <div key={f}>
                    <label className={label}>{fieldLabel(f)}</label>
                    <input type="number" step="any" className={input}
                      value={updateForm[f]}
                      onChange={e => setUpdateForm({ ...updateForm, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/6 mt-6 flex justify-end">
                <button type="submit" disabled={loading || !updateForm.source || !updateForm.destination} className={btnPrimary}>
                  {loading ? "Processing…" : "Update Connection →"}
                </button>
              </div>
            </form>
          )}

          {/* SIMULATION */}
          {activeTab === "simulation" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Interactive Controls</h3>
                <p className="text-rail-muted text-sm font-light leading-relaxed mb-6">Toggle congestion and close stations to watch the graph adapt.</p>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/10 hover:border-rail-accent/40 cursor-pointer transition-all mb-6">
                  <input type="checkbox" className="w-4.5 h-4.5 accent-[#5b8dff]"
                    checked={Boolean(state?.use_congestion)}
                    onChange={async e => { await setCongestion(e.target.checked); setState(await getGraphState()); showFeedback("success", "Congestion updated.") }} />
                  <span className="text-sm text-rail-text">Enable Congestion Weighting</span>
                </label>

                <label className={label}>Closed Stations</label>
                <div className="custom-scroll grid grid-cols-2 gap-1 max-h-64 overflow-y-auto p-4 rounded-xl bg-white/2 border border-white/8">
                  {allStations.map(s => (
                    <label key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rail-muted hover:text-rail-text hover:bg-white/4 cursor-pointer transition-all">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#ff5c6c]"
                        checked={closedSelection.includes(s)}
                        onChange={e => setClosedSelection(e.target.checked ? [...closedSelection, s] : closedSelection.filter(x => x !== s))} />
                      {s}
                    </label>
                  ))}
                </div>

                <button
                  className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium border border-rail-accent2/25 bg-rail-accent2/8 text-rail-accent2 hover:bg-rail-accent2/15 transition-all cursor-pointer"
                  onClick={async () => { await setClosedStations(closedSelection); setState(await getGraphState()); showFeedback("success", "Closures applied.") }}>
                  Apply Station Closures
                </button>
              </div>

              <div className="lg:sticky lg:top-24">
                <p className="text-[11px] font-medium tracking-widest uppercase text-rail-dim mb-3">Live State (JSON)</p>
                <pre className="custom-scroll p-5 rounded-2xl bg-black/50 border border-white/7 text-[#4ade80] text-xs font-mono leading-relaxed overflow-auto max-h-96">
                  {JSON.stringify(state, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Toast ── */}
      {feedback && (
        <div className={`toast-enter fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-2xl
          ${feedback.type === "success"
            ? "bg-gradient-to-br from-[#1a7a6e] to-[#166960] border border-rail-success/30"
            : "bg-gradient-to-br from-[#7a1a25] to-[#69161e] border border-rail-danger/30"}`}>
          <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {feedback.type === "success"
              ? <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          </span>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 text-white/40 hover:text-white transition-colors text-lg leading-none cursor-pointer">×</button>
        </div>
      )}
    </div>
  )
}

export default AdminPanel