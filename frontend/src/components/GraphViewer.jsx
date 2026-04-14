import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { convertGraphToD3, getHighlightedLinkKeys } from "../utils/graphHelpers"

function GraphViewer({ graphData, highlightedPath, stationsDetail }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const nodesPosRef = useRef(null)

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return

    d3.select(svgRef.current).selectAll("*").remove()

    const width = containerRef.current.clientWidth || 800
    const height = 600

    const { nodes, links } = convertGraphToD3(graphData, stationsDetail)
    const highlightedKeys = getHighlightedLinkKeys(highlightedPath || [])

    let d3Nodes
    if (nodesPosRef.current && nodesPosRef.current.length === nodes.length) {
      d3Nodes = nodes.map(node => {
        const saved = nodesPosRef.current.find(p => p.id === node.id)
        return saved ? { ...node, x: saved.x, y: saved.y, vx: 0, vy: 0 } : { ...node }
      })
    } else {
      d3Nodes = nodes.map(d => ({ ...d }))
    }

    const d3Links = links.map((d) => ({
      ...d,
      source: typeof d.source === "object" ? d.source.id : d.source,
      target: typeof d.target === "object" ? d.target.id : d.target,
    }))

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")

    const root = svg.append("g")

    // Colors updated to match Slate/Indigo theme
    const COLOR_ACTIVE = "#ef4444" // Tailwind Red 500
    const COLOR_INACTIVE = "#6366f1" // Tailwind Indigo 500
    const COLOR_LINE = "#cbd5e1" // Tailwind Slate 300

    const link = root.append("g")
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("stroke", (d) => {
        const u = d.source.id || d.source;
        const v = d.target.id || d.target;
        const key = [u, v].sort().join("--");
        return highlightedKeys.has(key) ? COLOR_ACTIVE : COLOR_LINE;
      })
      .attr("stroke-width", (d) => {
        const u = d.source.id || d.source;
        const v = d.target.id || d.target;
        const key = [u, v].sort().join("--");
        return highlightedKeys.has(key) ? 6 : 2;
      })
      .style("opacity", 0.7)
      .style("stroke-linecap", "round")

    const nodeGroup = root.append("g")
      .selectAll("g")
      .data(d3Nodes)
      .join("g")

    nodeGroup.append("circle")
      .attr("r", (d) => (highlightedPath?.includes(d.id) ? 22 : 18))
      .attr("fill", (d) => (highlightedPath?.includes(d.id) ? COLOR_ACTIVE : COLOR_INACTIVE))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 4)
      .style("cursor", "grab")
      // D3 drop shadows are better handled via standard SVG filters if needed, 
      // but white stroke + vibrant fill looks great for RailRoute.

    nodeGroup.append("text")
      .attr("y", 42)
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("class", "text-[12px] font-bold fill-slate-700 pointer-events-none uppercase tracking-tight")

    const simulation = d3.forceSimulation(d3Nodes)
      .force("link", d3.forceLink(d3Links).id((d) => d.id).distance(220))
      .force("charge", d3.forceManyBody().strength(-2200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(85))
      .velocityDecay(0.5)

    const isFirstLoad = !nodesPosRef.current
    simulation.alpha(isFirstLoad ? 0.3 : 0).restart()

    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
        nodesPosRef.current = d3Nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
      });

    nodeGroup.call(drag);

    const padding = 80;
    simulation.on("tick", () => {
      d3Nodes.forEach((d) => {
        d.x = Math.max(padding, Math.min(width - padding, d.x));
        d.y = Math.max(padding, Math.min(height - padding, d.y));
      });

      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
      nodesPosRef.current = d3Nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
    });

    svg.call(d3.zoom().scaleExtent([0.3, 3]).on("zoom", (e) => root.attr("transform", e.transform)));

    return () => simulation.stop();
  }, [graphData, highlightedPath, stationsDetail])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[650px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:30px_30px]"></div>

      {/* Interactive Legend Overlay */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Selected Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Station Node</span>
        </div>
      </div>

      {/* Control Help Text */}
      <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to Move • Scroll to Zoom
      </div>

      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-move" 
      />
    </div>
  )
}

export default GraphViewer