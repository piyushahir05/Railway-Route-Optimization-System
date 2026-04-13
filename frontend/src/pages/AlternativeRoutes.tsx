import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAlternativeRoutes } from '../api/services';
import StationSelector from '../components/StationSelector';
import ModeSelector from '../components/ModeSelector';
import RouteCard from '../components/RouteCard';
import { Search, AlertCircle, Loader } from 'lucide-react';

type Mode = 'distance' | 'travel_time' | 'ticket_cost';

const modeLabels: Record<Mode, string> = {
  distance: 'km',
  travel_time: 'minutes',
  ticket_cost: '₹',
};

export default function AlternativeRoutes() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<Mode>('distance');
  const [k, setK] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const { data: routesData, isLoading, isError, error } = useQuery({
    queryKey: ['alternative-routes', source, destination, mode, k],
    queryFn: async () => {
      if (!source || !destination) return null;
      const response = await getAlternativeRoutes(source, destination, mode, k);
      return response.data;
    },
    enabled: submitted && !!source && !!destination,
    staleTime: 2 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination) {
      setSubmitted(true);
    }
  };

  const isValid = source && destination && source !== destination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Alternative Routes</h1>
          <p className="text-gray-600 mb-8">
            Find multiple optimal routes between two stations
          </p>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StationSelector
                value={source}
                onChange={setSource}
                label="Source Station"
                placeholder="Select source station"
              />
              <StationSelector
                value={destination}
                onChange={setDestination}
                label="Destination Station"
                placeholder="Select destination station"
              />
            </div>

            <ModeSelector value={mode} onChange={setMode} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Routes: {k}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 route</span>
                <span>5 routes</span>
              </div>
            </div>

            {source === destination && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-700 text-sm">
                  Source and destination stations must be different
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Finding Routes...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Find {k} Routes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4 mb-8">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Error Finding Routes</h3>
              <p className="text-red-700 text-sm">
                {error instanceof Error ? error.message : 'An error occurred while finding the routes'}
              </p>
            </div>
          </div>
        )}

        {submitted && routesData && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">
                Found {routesData.k_found} out of {routesData.k_requested} routes
              </p>
            </div>
            {routesData.routes.map((route, idx) => (
              <RouteCard
                key={idx}
                route={{
                  source: routesData.source,
                  destination: routesData.destination,
                  mode: routesData.mode,
                  found: true,
                  path: route.path,
                  cost: route.cost,
                }}
                modeLabel={modeLabels[mode]}
              />
            ))}
          </div>
        )}

        {submitted && !isLoading && !routesData && !isError && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No results found. Try different stations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
