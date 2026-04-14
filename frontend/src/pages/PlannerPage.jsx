import { useEffect, useState } from "react";
import AlternativeRoutes from "../components/AlternativeRoutes";
import GraphViewer from "../components/GraphViewer";
import RouteResult from "../components/RouteResult";
import RouteSelector from "../components/RouteSelector";
import { getGraphData, getStationsDetail } from "../services/api";

function PlannerPage() {
  const [routeResult, setRouteResult] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [stationsDetail, setStationsDetail] = useState(null);
  const [mode, setMode] = useState("distance");
  const [fetchError, setFetchError] = useState("");

  const visibleRoute = routeResult || selectedRoute;

  useEffect(() => {
    Promise.all([getGraphData(), getStationsDetail()])
      .then(([graphRes, stationsRes]) => {
        setGraphData(graphRes.graph);
        setStationsDetail(stationsRes.stations);
      })
      .catch((err) => setFetchError(err.message || "Failed to load planner data"));
  }, []);

  /**
   * Called by RouteSelector when "Show Alternatives" is clicked.
   * Payload is either null (clear) or { routes: [], mode: string }.
   */
  const handleAlternativeResults = (payload) => {
    if (payload === null) {
      setAlternativeRoutes(null);
      return;
    }
    // Sync mode so AlternativeRoutes titles/labels stay consistent
    setMode(payload.mode);
    setAlternativeRoutes(payload.routes);
    setRouteResult(null);
    setSelectedRoute(null);
  };

  return (
    <main className="min-h-screen bg-[#05091a] pt-24 pb-16">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Error banner */}
        {fetchError && (
          <div className="flex items-center justify-between gap-3 mb-6 px-5 py-3.5 rounded-2xl border border-red-500/20 bg-red-500/[0.07] text-red-400 text-[13px]">
            <span>⚠️ {fetchError}</span>
            <button
              onClick={() => setFetchError("")}
              className="bg-transparent border-none text-red-400 text-xl cursor-pointer leading-none px-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 items-start max-[900px]:grid-cols-1">

          {/* ── Left: controls + results ── */}
          <section className="col-span-5 flex flex-col gap-4">
            <RouteSelector
              onRouteResult={(r) => {
                setRouteResult(r);
                setAlternativeRoutes(null);
                setSelectedRoute(null);
                // Sync mode from optimal route response
                setMode(r.mode || mode);
              }}
              onAlternativeResults={handleAlternativeResults}
              onLoading={setLoading}
            />

            {/* Spinner */}
            {loading && (
              <div className="flex justify-center py-3">
                <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-[#3b6fe8] animate-spin" />
              </div>
            )}

            {/* Optimal route result — shown after "Find Best Route" */}
            <RouteResult result={visibleRoute} mode={mode} />

            {/* Alternative routes — shown after "Show Alternatives" */}
            <AlternativeRoutes
              routes={alternativeRoutes}
              mode={mode}
              onSelectRoute={(route) => {
                // Selecting an alternative previews it in RouteResult
                setSelectedRoute({ ...route, found: true, mode });
                setRouteResult(null);
              }}
            />
          </section>

          {/* ── Right: graph viewer ── */}
          <section className="col-span-7 sticky top-[88px] rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl overflow-hidden min-h-[520px]">
            <GraphViewer
              graphData={graphData}
              highlightedPath={visibleRoute?.path || []}
              stationsDetail={stationsDetail}
            />
          </section>

        </div>
      </div>
    </main>
  );
}

export default PlannerPage;