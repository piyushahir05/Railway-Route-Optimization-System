import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGraphData, getStationDetails } from '../api/services';
import * as d3 from 'd3';
import { AlertCircle, Loader } from 'lucide-react';

interface Node {
  id: string;
  group: number;
  latitude?: number;
  longitude?: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export default function Visualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: graphData, isLoading: graphLoading, isError: graphError } = useQuery({
    queryKey: ['graph-data'],
    queryFn: async () => {
      const response = await getGraphData();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: stationsData } = useQuery({
    queryKey: ['station-details'],
    queryFn: async () => {
      const response = await getStationDetails();
      return response.data.stations;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    const graph = graphData.graph;

    // Prepare nodes
    const nodes: Node[] = Object.keys(graph).map((station, idx) => ({
      id: station,
      group: Math.floor(idx / 10) + 1,
      latitude: stationsData?.find((s) => s.station_name === station)?.latitude,
      longitude: stationsData?.find((s) => s.station_name === station)?.longitude,
    }));

    // Prepare links
    const links: Link[] = [];
    Object.entries(graph).forEach(([source, destinations]) => {
      if (Array.isArray(destinations)) {
        destinations.forEach((dest: any) => {
          if (typeof dest === 'object' && dest.destination) {
            links.push({
              source,
              target: dest.destination,
              value: dest.distance || 1,
            });
          }
        });
      }
    });

    const width = containerRef.current.clientWidth;
    const height = Math.max(500, nodes.length * 30);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create the force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create link elements
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Create node elements
    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', (d) => d3.schemeCategory10[d.group % 10])
      .call(drag(simulation) as any);

    // Add labels
    const labels = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', 12)
      .attr('y', '0.31em')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text((d) => d.id)
      .style('pointer-events', 'none');

    // Add arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 15)
      .attr('refY', 5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 5, 0 10')
      .attr('fill', '#999');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Add tooltips
    node.append('title').text((d: any) => d.id);

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [graphData, stationsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Network Visualization</h1>
          <p className="text-gray-600 mb-4">
            Interactive visualization of the railway network. Drag nodes to reposition.
          </p>

          {graphLoading && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader size={20} className="animate-spin" />
              <span>Loading network visualization...</span>
            </div>
          )}

          {graphError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">Failed to load network data. Please try again.</p>
            </div>
          )}

          {graphData && !graphLoading && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                Total Stations: <span className="font-bold text-blue-600">{graphData.node_count}</span>
              </p>
            </div>
          )}
        </div>

        <div
          ref={containerRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ minHeight: '600px', width: '100%' }}
        >
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How to Use</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Drag nodes:</span> Click and drag stations to rearrange
              the network layout
            </li>
            <li>
              <span className="font-semibold">Hover over nodes:</span> See the station name
            </li>
            <li>
              <span className="font-semibold">Arrow sizes:</span> Represent the distance between
              connected stations
            </li>
            <li>
              <span className="font-semibold">Colors:</span> Different colors group nearby stations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
