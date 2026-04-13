import { ArrowRight, MapPin } from 'lucide-react';
import { RouteResult } from '../api/services';

interface RouteCardProps {
  route: RouteResult;
  modeLabel: string;
}

export default function RouteCard({ route, modeLabel }: RouteCardProps) {
  if (!route.found) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">No route found from {route.source} to {route.destination}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{route.source}</h3>
          <p className="text-sm text-gray-500">Start</p>
        </div>
        <ArrowRight className="text-blue-600" size={24} />
        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-800">{route.destination}</h3>
          <p className="text-sm text-gray-500">End</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-4 mb-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Route Path:</p>
        <div className="flex flex-wrap gap-2">
          {route.path.map((station, idx) => (
            <div key={idx} className="flex items-center">
              <MapPin size={16} className="text-blue-600 mr-1" />
              <span className="text-sm text-gray-700 font-medium">{station}</span>
              {idx < route.path.length - 1 && <span className="mx-2 text-gray-400">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Cost</p>
          <p className="text-2xl font-bold text-blue-600">{route.cost.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{modeLabel}</p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Stops</p>
          <p className="text-2xl font-bold text-gray-700">{route.path.length - 1}</p>
          <p className="text-xs text-gray-500">intermediate stations</p>
        </div>
      </div>
    </div>
  );
}
