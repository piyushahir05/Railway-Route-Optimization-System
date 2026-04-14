import { useState } from "react";
import { formatCost, getModeLabel } from "../utils/graphHelpers";

function RouteResult({ result, mode }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;
  const routeMode = result.mode || mode;
  const path = Array.isArray(result.path) ? result.path : [];

  // Keys now match the actual API mode ids
  const costLabel =
    routeMode === "distance"    ? "Est. Distance" :
    routeMode === "travel_time" ? "Est. Time"     :
    routeMode === "ticket_cost" ? "Est. Cost"     : "Est. Distance";

  // Title changes with selected metric
  const routeTitle =
    routeMode === "distance"    ? "Shortest Route" :
    routeMode === "travel_time" ? "Fastest Route"  :
    routeMode === "ticket_cost" ? "Cheapest Route" : "Optimal Route";

  const copyPath = async () => {
    await navigator.clipboard.writeText(path.join(" → "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Error state ──────────────────────────────────────────────────────────
  if (path.length === 0) {
    return (
      <div className="fade-up-1 mt-4 flex flex-col items-center text-center px-8 py-9 rounded-3xl
        bg-red-500/6 border border-red-500/15">
        <div className="w-12 h-12 mb-4 rounded-full flex items-center justify-center text-xl
          bg-red-500/8 border border-red-500/15">
          🛤️
        </div>
        <h3 className="font-display text-lg font-bold text-red-400 mb-1.5">No Path Found</h3>
        <p className="text-rail-muted text-xs font-light">{result.error || "Stations are not connected."}</p>
      </div>
    );
  }

  // ── Result card ──────────────────────────────────────────────────────────
  return (
    <article className="fade-up-1 mt-4 rounded-3xl border border-white/12 bg-[#0d1225] overflow-hidden
      shadow-2xl shadow-black/50">

      {/* Stat header */}
      <div className="flex justify-between items-center px-7 py-6 bg-[#080e1e] border-b border-white/7">
        <div>
          {/* Dynamic title */}
          <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-rail-dim mb-1.5">{routeTitle}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[32px] font-bold text-white leading-none">{path.length - 1}</span>
            <span className="text-[11px] font-medium tracking-widest uppercase text-rail-dim">Stops</span>
          </div>
        </div>
        <div className="text-right">
          {/* Dynamic metric label */}
          <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-rail-dim mb-1.5">{costLabel}</p>
          <p className="font-display text-[26px] font-bold text-blue-300 leading-none">
            {formatCost(result.cost, routeMode)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-7 py-7">

        {/* Station path */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {path.map((station, index) => {
            const isEndpoint = index === 0 || index === path.length - 1;
            return (
              <div key={`${station}-${index}`} className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-medium tracking-wide uppercase whitespace-nowrap
                  ${isEndpoint
                    ? "bg-gradient-to-br from-[#3b6fe8] to-[#5b4fcf] text-white shadow-md shadow-blue-700/35"
                    : "bg-[#141b35] text-rail-muted border border-white/8"
                  }`}>
                  {station}
                </span>
                {index < path.length - 1 && (
                  <svg className="text-[#2a3050] shrink-0" xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/5">

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="pill-dot w-1.5 h-1.5 rounded-full bg-rail-success shadow-[0_0_6px_rgba(46,196,182,0.6)]" />
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-rail-dim">
              Optimized · {getModeLabel(routeMode)}
            </span>
          </div>

          {/* Copy button */}
          <button
            onClick={copyPath}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer
              border transition-all active:scale-95
              ${copied
                ? "bg-rail-success/8 border-rail-success/25 text-rail-success"
                : "bg-white/4 border-white/8 text-rail-muted hover:bg-white/8 hover:border-white/15 hover:text-rail-text"
              }`}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            )}
            {copied ? "Copied!" : "Copy Path"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default RouteResult;