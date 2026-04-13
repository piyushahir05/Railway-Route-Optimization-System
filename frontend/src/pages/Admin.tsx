import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addStation,
  removeStation,
  updateConnection,
  getStations,
  getStationDetails,
  toggleCongestion,
  Station,
  Connection,
} from '../api/services';
import { AlertCircle, Loader, Trash2, Edit2, Plus } from 'lucide-react';

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'add' | 'remove' | 'update' | 'congestion'>('add');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch stations
  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await getStations();
      return response.data.stations;
    },
    staleTime: 1 * 60 * 1000,
  });

  const { data: stationDetails } = useQuery({
    queryKey: ['station-details'],
    queryFn: async () => {
      const response = await getStationDetails();
      return response.data.stations;
    },
    staleTime: 1 * 60 * 1000,
  });

  // Add Station Mutation
  const addStationMutation = useMutation({
    mutationFn: addStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['station-details'] });
      setSuccessMessage('Station added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to add station');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  // Remove Station Mutation
  const removeStationMutation = useMutation({
    mutationFn: removeStation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['station-details'] });
      setSuccessMessage('Station removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to remove station');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  // Update Connection Mutation
  const updateConnectionMutation = useMutation({
    mutationFn: ({
      source,
      destination,
      distance,
      travelTime,
      ticketCost,
      congestionFactor,
    }: any) =>
      updateConnection(
        source,
        destination,
        distance,
        travelTime,
        ticketCost,
        congestionFactor
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['station-details'] });
      setSuccessMessage('Connection updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to update connection');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  // Toggle Congestion Mutation
  const toggleCongestionMutation = useMutation({
    mutationFn: toggleCongestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph-state'] });
      setSuccessMessage('Congestion setting updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to toggle congestion');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600 mb-8">Manage stations and route connections</p>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="flex-shrink-0 text-green-600">✓</div>
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-4 mb-8 border-b">
            {['add', 'remove', 'update', 'congestion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Add Station Tab */}
          {activeTab === 'add' && <AddStationForm onSubmit={() => addStationMutation.mutate} />}

          {/* Remove Station Tab */}
          {activeTab === 'remove' && (
            <RemoveStationForm
              stations={stationsData || []}
              onRemove={(stationName) => removeStationMutation.mutate(stationName)}
              isLoading={removeStationMutation.isPending}
            />
          )}

          {/* Update Connection Tab */}
          {activeTab === 'update' && (
            <UpdateConnectionForm
              stations={stationDetails || []}
              onUpdate={(data) => updateConnectionMutation.mutate(data)}
              isLoading={updateConnectionMutation.isPending}
            />
          )}

          {/* Congestion Tab */}
          {activeTab === 'congestion' && (
            <CongestionControl
              onToggle={(enabled) => toggleCongestionMutation.mutate(enabled)}
              isLoading={toggleCongestionMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AddStationForm({ onSubmit }: any) {
  const [formData, setFormData] = useState({
    station_name: '',
    latitude: '',
    longitude: '',
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (station: Station) => addStation(station),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['station-details'] });
      setFormData({ station_name: '', latitude: '', longitude: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.station_name || !formData.latitude || !formData.longitude) {
      alert('Please fill all fields');
      return;
    }

    mutation.mutate({
      station_name: formData.station_name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      connections: [],
    } as Station);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Station Name</label>
        <input
          type="text"
          value={formData.station_name}
          onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="E.g., Central Station"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
          <input
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., 40.7128"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
          <input
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., -74.0060"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {mutation.isPending ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <Plus size={20} />
            <span>Add Station</span>
          </>
        )}
      </button>
    </form>
  );
}

function RemoveStationForm({ stations, onRemove, isLoading }: any) {
  const [selectedStation, setSelectedStation] = useState('');

  const handleRemove = () => {
    if (!selectedStation) {
      alert('Please select a station');
      return;
    }
    if (confirm(`Are you sure you want to remove ${selectedStation}?`)) {
      onRemove(selectedStation);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Station</label>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a station to remove...</option>
          {stations.map((station: string) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleRemove}
        disabled={!selectedStation || isLoading}
        className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Removing...</span>
          </>
        ) : (
          <>
            <Trash2 size={20} />
            <span>Remove Station</span>
          </>
        )}
      </button>
    </div>
  );
}

function UpdateConnectionForm({ stations, onUpdate, isLoading }: any) {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    distance: '',
    travel_time: '',
    ticket_cost: '',
    congestion_factor: '',
  });

  const sourceStation = stations.find((s: Station) => s.station_name === formData.source);
  const availableDestinations = sourceStation?.connections || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source || !formData.destination) {
      alert('Please select source and destination');
      return;
    }

    onUpdate({
      source: formData.source,
      destination: formData.destination,
      distance: formData.distance ? parseFloat(formData.distance) : undefined,
      travel_time: formData.travel_time ? parseFloat(formData.travel_time) : undefined,
      ticket_cost: formData.ticket_cost ? parseFloat(formData.ticket_cost) : undefined,
      congestion_factor: formData.congestion_factor
        ? parseFloat(formData.congestion_factor)
        : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source Station</label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value, destination: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select source...</option>
            {stations.map((station: Station) => (
              <option key={station.station_name} value={station.station_name}>
                {station.station_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <select
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select destination...</option>
            {availableDestinations.map((conn: Connection) => (
              <option key={conn.destination} value={conn.destination}>
                {conn.destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.distance}
            onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Travel Time (min)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.travel_time}
            onChange={(e) => setFormData({ ...formData, travel_time: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Cost (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.ticket_cost}
            onChange={(e) => setFormData({ ...formData, ticket_cost: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Congestion Factor</label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={formData.congestion_factor}
            onChange={(e) => setFormData({ ...formData, congestion_factor: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!formData.source || !formData.destination || isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <Edit2 size={20} />
            <span>Update Connection</span>
          </>
        )}
      </button>
    </form>
  );
}

function CongestionControl({ onToggle, isLoading }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">
        Toggle congestion factors to simulate traffic conditions on route costs
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => onToggle(true)}
          disabled={isLoading}
          className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader size={20} className="animate-spin" /> : null}
          Enable Congestion
        </button>
        <button
          onClick={() => onToggle(false)}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader size={20} className="animate-spin" /> : null}
          Disable Congestion
        </button>
      </div>
    </div>
  );
}
