import { useEffect, useState } from "react";
import { getAlternativeRoutes, getRoute, getStations } from "../services/api";

const modes = [
  { id: "distance",    label: "Shortest", icon: "📏" },
  { id: "travel_time", label: "Fastest",  icon: "⚡" },
  { id: "ticket_cost", label: "Cheapest", icon: "💰" },
];

function RouteSelector({ onRouteResult, onAlternativeResults, onLoading }) {
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("distance");
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStations = async () => {
      setLoadingStations(true);
      try {
        const data = await getStations();
        setStations(data.stations || []);
      } catch {
        setError("Network Error: Could not load stations.");
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  const isInvalid = !source || !destination || source === destination;

  const handleAction = async (isPrimary) => {
    onLoading(true);
    setError("");
    try {
      if (isPrimary) {
        const result = await getRoute(source, destination, mode);
        // Pass null to clear alternatives, then set route result with mode
        onAlternativeResults(null);
        onRouteResult({ ...result, found: true, mode });
      } else {
        // Fetch k=4 so after the backend returns we have up to 3 true alternatives
        // (some backends return the optimal as rank-1, so we ask for one extra)
        const result = await getAlternativeRoutes(source, destination, mode, 4);
        const routes = result.routes || [];

        // ── Strip the optimal (rank 1 / index 0) so we only show alternatives ──
        const alternatives = routes.length > 1 ? routes.slice(1) : routes;

        // Pass both routes AND the active mode so PlannerPage can sync
        onAlternativeResults({ routes: alternatives, mode });
      }
    } catch (err) {
      setError(err.message || "No route found for this selection.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-3xl p-9 backdrop-blur-xl relative overflow-hidden">

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

      {/* Header */}
      <header className="mb-8 relative">
        <h2 className="font-display text-[28px] font-black text-white tracking-tight mb-1">Plan Journey</h2>
        <p className="text-[13px] text-rail-dim font-light">Select your origin and destination</p>
      </header>

      {/* Station Selectors */}
      <div className="relative mb-7">

        {/* Dashed connector line */}
        <div className="absolute left-[23px] top-[52px] bottom-[52px] border-l-2 border-dashed border-white/[0.08] z-0" />

        {/* Origin */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 border-[3px] border-[rgba(5,9,26,1)] bg-blue-500/15 text-[#5b8dff] shadow-[0_0_0_1px_rgba(59,111,232,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-medium tracking-[0.18em] uppercase text-[#5b8dff] mb-1">
              Origin Station
            </label>
            {loadingStations ? (
              <span className="text-[15px] text-rail-dim italic">Loading stations…</span>
            ) : (
              <select
                className="w-full bg-transparent border-none outline-none text-[17px] font-medium text-rail-text cursor-pointer appearance-none"
                value={source}
                onChange={(e) => { setSource(e.target.value); setError(""); }}
              >
                <option value="" className="bg-[#0d1230] text-rail-text">Select starting point…</option>
                {stations.map(s => <option key={s} value={s} className="bg-[#0d1230] text-rail-text">{s}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="relative z-10 flex items-center gap-4 mt-5">
          <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 border-[3px] border-[rgba(5,9,26,1)] bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] text-white shadow-[0_4px_16px_rgba(59,111,232,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V9"/>
            </svg>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-medium tracking-[0.18em] uppercase text-[#9b6dff] mb-1">
              Destination
            </label>
            {loadingStations ? (
              <span className="text-[15px] text-rail-dim italic">Loading stations…</span>
            ) : (
              <select
                className="w-full bg-transparent border-none outline-none text-[17px] font-medium text-rail-text cursor-pointer appearance-none"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setError(""); }}
              >
                <option value="" className="bg-[#0d1230] text-rail-text">Select arrival station…</option>
                {stations.filter(s => s !== source).map(s => <option key={s} value={s} className="bg-[#0d1230] text-rail-text">{s}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] my-7" />

      {/* Optimization Mode */}
      <span className="block text-center text-[10px] font-medium tracking-[0.18em] uppercase text-rail-dim mb-3.5">
        Optimization Strategy
      </span>
      <div className="grid grid-cols-3 gap-2.5">
        {modes.map(({ id, label, icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-px
                ${active
                  ? "border-blue-500/60 bg-blue-500/[0.12] shadow-[0_0_0_1px_rgba(59,111,232,0.2)]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-blue-400/25 hover:bg-blue-400/5"
                }`}
            >
              <span className="text-[22px] mb-1.5">{icon}</span>
              <span className={`text-[10px] font-medium tracking-[0.12em] uppercase ${active ? "text-[#8faeff]" : "text-rail-dim"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 mt-7">
        <button
          onClick={() => handleAction(true)}
          disabled={isInvalid}
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] text-white text-[15px] font-medium cursor-pointer transition-all duration-200 shadow-[0_4px_24px_rgba(59,111,232,0.4)] hover:brightness-110 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(59,111,232,0.55)] active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Find Best Route →
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={isInvalid}
          className="w-full py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-rail-muted text-[15px] font-light cursor-pointer transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-rail-text hover:-translate-y-px active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed"
        >
          Show Alternatives
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 px-5 py-4 rounded-2xl border border-red-500/20 bg-red-500/[0.07] flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p className="text-[13px] text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

    </div>
  );
}

export default RouteSelector;