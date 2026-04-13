import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStations, simulateRoute } from '../api/services';
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

export default function Simulate() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<Mode>('distance');
  const [closedStations, setClosedStations] = useState<string[]>([]);
  const [useCongestion, setUseCongestion] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await getStations();
      return response.data.stations;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: routeData, isLoading, isError, error } = useQuery({
    queryKey: ['simulate-route', source, destination, mode, closedStations, useCongestion],
    queryFn: async () => {
      if (!source || !destination) return null;
      const response = await simulateRoute(source, destination, mode, closedStations, useCongestion);
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

  const toggleClosedStation = (station: string) => {
    setClosedStations((prev) =>
      prev.includes(station) ? prev.filter((s) => s !== station) : [...prev, station]
    );
  };

  const isValid = source && destination && source !== destination;
  const availableStations = stationsData?.filter(
    (s) => s !== source && s !== destination
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulate Routes</h1>
          <p className="text-gray-600 mb-8">
            Test route finding with closed stations or congestion factors
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

            {/* Closed Stations Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Closed Stations ({closedStations.length})
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {availableStations.length > 0 ? (
                  <div className="space-y-2">
                    {availableStations.map((station) => (
                      <label key={station} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={closedStations.includes(station)}
                          onChange={() => toggleClosedStation(station)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700">{station}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Select source and destination to see available stations
                  </p>
                )}
              </div>
            </div>

            {/* Congestion Toggle */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCongestion}
                  onChange={(e) => setUseCongestion(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium">Apply Congestion Factors</span>
              </label>
              <p className="text-sm text-gray-600 ml-7 mt-1">
                Enables congestion multipliers on route costs
              </p>
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
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Simulate Route</span>
                </>
              )}
            </button>
          </form>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4 mb-8">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Error Simulating Route</h3>
              <p className="text-red-700 text-sm">
                {error instanceof Error ? error.message : 'An error occurred during simulation'}
              </p>
            </div>
          </div>
        )}

        {submitted && routeData && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">Simulation Parameters</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-indigo-800">
                <div>
                  <p className="font-medium">Closed Stations:</p>
                  <p>{closedStations.length > 0 ? closedStations.join(', ') : 'None'}</p>
                </div>
                <div>
                  <p className="font-medium">Congestion Enabled:</p>
                  <p>{useCongestion ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <RouteCard route={routeData} modeLabel={modeLabels[mode]} />
          </div>
        )}

        {submitted && !isLoading && !routeData && !isError && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No results found. Try different parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
