import { useState } from "react";
import { formatCost } from "../utils/graphHelpers";

const badgeStyles = {
  1: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/25",
  2: "bg-slate-400/10 text-slate-400 border border-slate-400/20",
  3: "bg-orange-700/10 text-orange-700 border border-orange-700/20",
};

// Keys match the actual mode ids sent from RouteSelector
const modeConfig = {
  distance: {
    label: "Est. Distance",
    metricLabel: "Distance",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/>
      </svg>
    ),
  },
  travel_time: {
    label: "Est. Time",
    metricLabel: "Time",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  ticket_cost: {
    label: "Est. Cost",
    metricLabel: "Cost",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M14.5 9a2.5 2.5 0 0 0-5 0v1h5"/><path d="M9.5 15a2.5 2.5 0 0 0 5 0v-1h-5"/>
        <path d="M12 6v2"/><path d="M12 16v2"/>
      </svg>
    ),
  },
};

// Section heading changes with mode — mirrors RouteResult titles
const modeTitles = {
  distance:    "Shortest Alternatives",
  travel_time: "Fastest Alternatives",
  ticket_cost: "Cheapest Alternatives",
};

function AlternativeRoutes({ routes, mode, onSelectRoute }) {
  const [selectedRank, setSelectedRank] = useState(null);

  // routes is already stripped of the optimal path by RouteSelector
  if (!routes || routes.length === 0) return null;

  const config     = modeConfig[mode] ?? modeConfig.distance;
  const titleLabel = modeTitles[mode] ?? "Alternative Routes";

  const handleSelect = (route) => {
    setSelectedRank(route.rank);
    onSelectRoute(route);
  };

  return (
    <section className="fade-up-3 mt-4 p-8 rounded-3xl bg-rail-surface border border-rail-border backdrop-blur-xl shadow-2xl shadow-black/40">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {/* Title changes with mode */}
          <h3 className="font-display text-xl font-bold text-white mb-1">{titleLabel}</h3>
          <p className="text-[11px] font-medium tracking-widest uppercase text-rail-dim">
            {routes.length} {routes.length === 1 ? "Route" : "Routes"} · {config.metricLabel} Optimized
          </p>
        </div>
        {/* Mode badge */}
        <div className="flex flex-col items-end gap-2">
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-rail-dim shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/>
              <path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
            </svg>
          </div>
          <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full
            bg-blue-400/10 text-blue-300 border border-blue-400/20">
            {config.metricLabel}
          </span>
        </div>
      </div>

      {/* Cards — render ALL routes passed in (optimal already excluded by RouteSelector) */}
      <div className="flex flex-col gap-3">
        {routes.map((route, index) => {
          const displayRank = index + 1;
          const isSelected  = selectedRank === route.rank;
          const preview     = route.path.slice(0, 3).join(" → ");
          const overflow    = route.path.length > 4 ? `+${route.path.length - 3} more` : null;

          return (
            <div
              key={route.rank}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(route)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect(route)}
              className={`relative px-5 py-5 rounded-2xl border cursor-pointer outline-none transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40
                ${isSelected
                  ? "border-blue-300/40 bg-[#151e38] shadow-[0_0_0_1px_rgba(147,197,253,0.15),0_6px_24px_rgba(0,0,0,0.4)]"
                  : "border-white/9 bg-[#141b35] hover:border-white/18 hover:bg-[#18203d] shadow-md shadow-black/30"
                }`}
            >
              {/* Top row: rank badge + metric value */}
              <div className="flex items-start justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase ${badgeStyles[displayRank] ?? badgeStyles[3]}`}>
                  Alt #{displayRank}
                </span>
                <div className="text-right">
                  {/* Label updates with mode */}
                  <p className="text-[9px] font-medium tracking-widest uppercase text-rail-dim mb-1">
                    {config.label}
                  </p>
                  {/* Value formatted correctly per mode */}
                  <span className={`text-sm font-semibold ${isSelected ? "text-blue-300" : "text-rail-text/80"}`}>
                    {formatCost(route.cost, mode)}
                  </span>
                </div>
              </div>

              {/* Path preview */}
              <p className={`text-sm font-light leading-relaxed ${isSelected ? "text-blue-200/80" : "text-rail-muted"}`}>
                {preview}
                {overflow && (
                  <span className="inline-block ml-2 text-[10px] font-medium tracking-wider uppercase text-rail-dim bg-white/5 border border-white/10 rounded px-1.5 py-0.5 align-middle">
                    {overflow}
                  </span>
                )}
              </p>

              {/* Footer row: stops + metric icon */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-rail-dim">
                    <circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/>
                  </svg>
                  <span className="text-[11px] font-medium tracking-widest uppercase text-rail-dim">
                    {route.path.length - 1} Stations
                  </span>
                </div>
                <div className="flex items-center gap-1 text-rail-dim">
                  {config.icon}
                  <span className="text-[10px] font-medium tracking-widest uppercase text-rail-dim ml-1">
                    {config.metricLabel}
                  </span>
                </div>
              </div>

              {/* Selected indicator dot */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-blue-300 border-2 border-[#0d1225] shadow-[0_0_10px_rgba(147,197,253,0.5)]" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AlternativeRoutes;